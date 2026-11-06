#define _CRT_SECURE_NO_WARNINGS
#pragma execution_character_set("utf-8")   // 한글 안 깨지게
#define SODIUM_STATIC
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
#include <sodium.h>
#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "advapi32.lib")
#pragma comment(lib, "libsodium.lib")
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <stdint.h>
#include <string.h>
#include <wchar.h>




// 통신 부분
// TCP는 메시지가 쪼개지거나 붙어서 올 수 있어서 맨 앞에 길이(4바이트)를 붙여서 보낸다
// 패킷 구조: 길이 4 + 종류 1 + 보낸 사람 16 + 받을 사람 16 + 번호 8 + nonce 24 + 본문

#define NAME_LEN    16                // 이름 최대 15바이트 + '\0'
#define NONCE_LEN   24
#define HEADER_LEN  (1 + NAME_LEN + NAME_LEN + 8 + NONCE_LEN)
#define AD_LEN      (1 + NAME_LEN + NAME_LEN + 8)   // 암호화할 때 같이 묶는 헤더 부분
#define MAX_BODY    65536
#define MAX_PACKET  (4 + HEADER_LEN + MAX_BODY)




// 패킷 종류
// HELLO: 접속할 때 키 보내기, MESSAGE: 채팅, NOTICE: 방장이 보내는 알림
// APPROVE: 입장 승인, LEDGER: 장부 대조, EYE: 카메라 지킴이 상태
enum { TYPE_HELLO = 1, TYPE_MESSAGE, TYPE_NOTICE, TYPE_APPROVE, TYPE_LEDGER, TYPE_EYE };




struct packet {
    uint8_t  type;
    char     from[NAME_LEN], to[NAME_LEN];
    uint64_t seq;                     // 두 사람 사이에서 몇 번째 패킷인지
    uint8_t  nonce[NONCE_LEN];
    uint32_t body_len;
    uint8_t  body[MAX_BODY];
};




struct connection {                 // 받은 바이트를 모아두는 버퍼
    int     sock;
    uint8_t buf[MAX_PACKET];
    size_t  len;
};




// 방장이 방 열기
int open_room(int port)
{
    int sock = (int)socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    if (sock < 0 || bind(sock, (struct sockaddr *)&addr, sizeof(addr)) < 0 || listen(sock, 16) < 0)
        return -1;
    return sock;
}




// 참가자가 방장한테 접속
int connect_to_host(const char *host, int port)
{
    struct addrinfo hints = {0}, *addr_list;
    char port_str[8];
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    snprintf(port_str, sizeof(port_str), "%d", port);
    if (getaddrinfo(host, port_str, &hints, &addr_list) != 0)
        return -1;
    int sock = (int)socket(AF_INET, SOCK_STREAM, 0);
    if (sock >= 0 && connect(sock, addr_list->ai_addr, (int)addr_list->ai_addrlen) < 0) {
        closesocket(sock);
        sock = -1;
    }
    freeaddrinfo(addr_list);
    return sock;
}




// 숫자를 큰 자리부터 바이트로 (어느 컴퓨터든 같은 순서)
static void put_u64(uint8_t *b, uint64_t v)
{
    for (int i = 7; i >= 0; i--, v >>= 8)
        b[i] = (uint8_t)v;
}




static uint64_t get_u64(const uint8_t *b)
{
    uint64_t v = 0;
    for (int i = 0; i < 8; i++)
        v = v << 8 | b[i];
    return v;
}




// 헤더 중 종류, 보낸 사람, 받을 사람, 번호 (암호화할 때 이 부분을 같이 묶는다)
void header_ad(const struct packet *p, uint8_t *ad)
{
    ad[0] = p->type;
    memcpy(ad + 1, p->from, NAME_LEN);
    memcpy(ad + 1 + NAME_LEN, p->to, NAME_LEN);
    put_u64(ad + 1 + 2 * NAME_LEN, p->seq);
}




// 패킷을 바이트 배열로 바꾸기
size_t packet_to_bytes(const struct packet *p, uint8_t *bytes)
{
    uint32_t len = HEADER_LEN + p->body_len, net_len = htonl(len);
    memcpy(bytes, &net_len, 4);
    header_ad(p, bytes + 4);
    memcpy(bytes + 4 + AD_LEN, p->nonce, NONCE_LEN);
    memcpy(bytes + 4 + HEADER_LEN, p->body, p->body_len);
    return 4 + len;
}




int send_packet(int sock, const struct packet *p)
{
    static uint8_t bytes[MAX_PACKET];
    size_t total = packet_to_bytes(p, bytes), sent = 0;
    while (sent < total) {
        int n = send(sock, (const char *)bytes + sent, (int)(total - sent), 0);
        if (n <= 0)
            return -1;
        sent += n;
    }
    return 0;
}




// 0이면 연결 끊김
int receive_bytes(struct connection *conn)
{
    int n = recv(conn->sock, (char *)conn->buf + conn->len, (int)(sizeof(conn->buf) - conn->len), 0);
    if (n > 0)
        conn->len += n;
    return n;
}




// 버퍼에서 패킷 하나 꺼내기
// 리턴값 1: 꺼냄, 0: 아직 다 안 옴, -1: 길이가 이상함
int take_packet(struct connection *conn, struct packet *p)
{
    uint32_t len;
    const uint8_t *h = conn->buf + 4;
    if (conn->len < 4)
        return 0;
    memcpy(&len, conn->buf, 4);
    len = ntohl(len);
    if (len < HEADER_LEN || len > HEADER_LEN + MAX_BODY)
        return -1;
    if (conn->len < 4 + len)
        return 0;
    p->type = h[0];
    memcpy(p->from, h + 1, NAME_LEN);
    memcpy(p->to, h + 1 + NAME_LEN, NAME_LEN);
    p->from[NAME_LEN - 1] = p->to[NAME_LEN - 1] = '\0';
    p->seq = get_u64(h + 1 + 2 * NAME_LEN);
    memcpy(p->nonce, h + AD_LEN, NONCE_LEN);
    p->body_len = len - HEADER_LEN;
    memcpy(p->body, conn->buf + 4 + HEADER_LEN, p->body_len);
    conn->len -= 4 + len;
    memmove(conn->buf, conn->buf + 4 + len, conn->len);
    return 1;
}




// 키 부분 (libsodium)
// 신원 키(Ed25519): 처음 실행할 때 만들어 파일에 두고 계속 쓴다. HELLO에 서명하는 데 쓴다
// 세션 키(X25519): 접속할 때마다 새로 만들고, 상대와 방향별 시작 키 두 개를 만든다
// 메시지마다 키를 한 칸씩 돌린다 (래칫). 지난 키는 지워서 지난 대화는 못 연다

#define KEY_LEN     32
#define TAG_LEN     16                // 암호문 뒤에 붙는 인증 태그
#define ID_SK_LEN   64
#define SIG_LEN     64
#define HELLO_BODY  (2 * KEY_LEN + SIG_LEN)   // 신원 공개키 + 세션 공개키 + 서명
#define WORDS_LEN   160
#define MAX_SKIP    1000              // 빠진 메시지를 이만큼까지는 건너뛰고 연다




void hash32(const void *data, size_t len, uint8_t out[KEY_LEN])
{
    crypto_generichash(out, KEY_LEN, data, len, NULL, 0);
}




// 단어 256개: 한 바이트가 단어 하나. 8개면 64비트
static const char *WORDS[256] = {
    "호랑이", "사자", "고래", "토끼", "펭귄", "여우", "나비", "거북이",
    "달팽이", "기린", "코끼리", "원숭이", "다람쥐", "고양이", "강아지", "판다",
    "하마", "악어", "독수리", "부엉이", "참새", "비둘기", "까치", "오리",
    "백조", "사슴", "늑대", "너구리", "고슴도치", "수달", "돌고래", "상어",
    "문어", "오징어", "해파리", "불가사리", "개구리", "두더지", "얼룩말", "낙타",
    "캥거루", "공룡", "공작새", "앵무새", "꿀벌", "잠자리", "무당벌레", "반딧불",
    "김밥", "라면", "떡볶이", "수박", "감자", "사과", "만두", "호떡",
    "붕어빵", "팥빙수", "녹차", "우유", "치즈", "피자", "김치", "냉면",
    "비빔밥", "딸기", "포도", "바나나", "복숭아", "참외", "고구마", "옥수수",
    "당근", "양파", "버섯", "두부", "계란", "식빵", "도넛", "쿠키",
    "사탕", "초콜릿", "햄버거", "국수", "짜장면", "순대", "어묵", "송편",
    "호박", "레몬", "체리", "망고", "수제비", "주먹밥", "핫도그", "와플",
    "연필", "우산", "피아노", "시계", "안경", "모자", "장갑", "양말",
    "칠판", "자전거", "비행기", "지하철", "기차", "등대", "망원경", "가방",
    "지갑", "거울", "의자", "책상", "침대", "베개", "이불", "냄비",
    "주전자", "숟가락", "젓가락", "접시", "풍선", "팽이", "구슬", "인형",
    "로봇", "카메라", "라디오", "전화기", "편지", "우표", "달력", "지도",
    "나침반", "공책", "지우개", "가위", "크레파스", "물감", "붓글씨", "액자",
    "바다", "구름", "별빛", "단풍", "해바라기", "소나무", "눈사람", "무지개",
    "번개", "하늘", "노을", "바람", "이슬", "파도", "모래", "조개",
    "산호", "호수", "폭포", "계곡", "동굴", "화산", "사막", "초원",
    "갈대", "장미", "튤립", "민들레", "진달래", "벚꽃", "은행잎", "선인장",
    "도서관", "운동장", "한강", "남산", "제주", "학교", "시장", "공원",
    "놀이터", "박물관", "미술관", "수영장", "정류장", "우체국", "소방서", "약국",
    "빵집", "꽃집", "서점", "극장", "부산", "경주", "독도", "축구",
    "야구", "농구", "탁구", "볼링", "수영", "배구", "테니스", "스키",
    "마라톤", "줄넘기", "태권도", "씨름", "양궁", "펜싱", "바이올린", "드럼",
    "하모니카", "기타", "첼로", "플루트", "트럼펫", "장구", "가야금", "단소",
    "버스", "택시", "트럭", "헬리콥터", "로켓", "잠수함", "오토바이", "태양",
    "달님", "지구", "화성", "토성", "혜성", "은하수", "우주선", "천둥",
    "안개", "생일", "선물", "축제", "소풍", "여행", "방학", "일기",
    "노래", "그림", "동화", "마법", "보물", "왕관", "해적", "요정",
};




// 신원 공개키 → 단어 8개 (같은 키면 늘 같은 단어)
void key_words(const uint8_t id_pk[KEY_LEN], char out[WORDS_LEN])
{
    uint8_t h[KEY_LEN];
    hash32(id_pk, KEY_LEN, h);
    out[0] = '\0';
    for (int i = 0; i < 8; i++) {
        if (i > 0)
            strcat(out, "-");
        strcat(out, WORDS[h[i]]);
    }
}




// HELLO에 서명하는 내용: "deolmi-hello" + 이름 16 + 세션 공개키
// 방장이 세션 키나 이름만 바꿔치기하면 서명이 안 맞는다
static void hello_signed(uint8_t m[12 + NAME_LEN + KEY_LEN], const char *name, const uint8_t kx_pk[KEY_LEN])
{
    memcpy(m, "deolmi-hello", 12);
    memset(m + 12, 0, NAME_LEN);
    strncpy((char *)m + 12, name, NAME_LEN - 1);
    memcpy(m + 12 + NAME_LEN, kx_pk, KEY_LEN);
}




void hello_make(uint8_t body[HELLO_BODY], const char *name, const uint8_t id_pk[KEY_LEN],
                const uint8_t id_sk[ID_SK_LEN], const uint8_t kx_pk[KEY_LEN])
{
    uint8_t m[12 + NAME_LEN + KEY_LEN];
    hello_signed(m, name, kx_pk);
    memcpy(body, id_pk, KEY_LEN);
    memcpy(body + KEY_LEN, kx_pk, KEY_LEN);
    crypto_sign_detached(body + 2 * KEY_LEN, NULL, m, sizeof(m), id_sk);
}




// 서명이 맞으면 1
int hello_ok(const char *name, const uint8_t *body, size_t len)
{
    uint8_t m[12 + NAME_LEN + KEY_LEN];
    if (len != HELLO_BODY)
        return 0;
    hello_signed(m, name, body + KEY_LEN);
    return crypto_sign_verify_detached(body + 2 * KEY_LEN, m, sizeof(m), body) == 0;
}




// 내 세션 키와 상대 세션 공개키로 방향별 시작 키 두 개 (보낼 때, 받을 때)
// 공개키가 작은 쪽이 client 역할이라 내 보내기 키 = 상대 받기 키
int start_keys(const uint8_t my_pk[KEY_LEN], const uint8_t my_sk[KEY_LEN], const uint8_t their_pk[KEY_LEN],
               uint8_t send_key[KEY_LEN], uint8_t recv_key[KEY_LEN])
{
    int cmp = memcmp(my_pk, their_pk, KEY_LEN);
    if (cmp == 0)
        return -1;
    if (cmp < 0)
        return crypto_kx_client_session_keys(recv_key, send_key, my_pk, my_sk, their_pk);
    return crypto_kx_server_session_keys(recv_key, send_key, my_pk, my_sk, their_pk);
}




// 메시지 키 = BLAKE2b(키 = 지금 키, "msg"), 다음 키 = BLAKE2b(키 = 지금 키, "next")
static void derive(const uint8_t key[KEY_LEN], const char *label, uint8_t out[KEY_LEN])
{
    crypto_generichash(out, KEY_LEN, (const uint8_t *)label, strlen(label), key, KEY_LEN);
}




static void next_key(uint8_t key[KEY_LEN])
{
    uint8_t next[KEY_LEN];
    derive(key, "next", next);
    memcpy(key, next, KEY_LEN);
    sodium_memzero(next, KEY_LEN);
}




// 평문을 암호화해서 p->body에 넣고 키를 한 칸 돌린다 (헤더는 미리 채워 둘 것)
void seal_packet(uint8_t chain[KEY_LEN], struct packet *p, const uint8_t *text, size_t len)
{
    uint8_t mk[KEY_LEN], ad[AD_LEN];
    unsigned long long n;
    derive(chain, "msg", mk);
    header_ad(p, ad);
    randombytes_buf(p->nonce, NONCE_LEN);
    crypto_aead_xchacha20poly1305_ietf_encrypt(p->body, &n, text, len, ad, AD_LEN, NULL, p->nonce, mk);
    p->body_len = (uint32_t)n;
    next_key(chain);
    sodium_memzero(mk, KEY_LEN);
}




// 복호화. skip개가 빠졌으면 그만큼 키를 돌려 본다
// 성공했을 때만 키를 앞으로 돌린다 (가짜 한 통으로 대화가 깨지지 않게). 평문 길이, 실패하면 -1
int open_packet(uint8_t chain[KEY_LEN], uint64_t skip, const struct packet *p, uint8_t *text)
{
    uint8_t key[KEY_LEN], mk[KEY_LEN], ad[AD_LEN];
    unsigned long long n;
    int result = -1;
    if (skip > MAX_SKIP || p->body_len < TAG_LEN)
        return -1;
    memcpy(key, chain, KEY_LEN);
    for (uint64_t i = 0; i < skip; i++)
        next_key(key);
    derive(key, "msg", mk);
    header_ad(p, ad);
    if (crypto_aead_xchacha20poly1305_ietf_decrypt(text, &n, NULL, p->body, p->body_len, ad, AD_LEN, p->nonce, mk) == 0) {
        next_key(key);
        memcpy(chain, key, KEY_LEN);
        result = (int)n;
    }
    sodium_memzero(key, KEY_LEN);
    sodium_memzero(mk, KEY_LEN);
    return result;
}




// 장부: 한 사람이 전체 대화로 보낸 글을 사슬처럼 엮은 해시
// H_k = BLAKE2b(H_k-1 + k + 글). 끝값 하나가 그 사람 글 전부를 대표한다
void ledger_next(const uint8_t prev[KEY_LEN], uint32_t index, const uint8_t *text, size_t len, uint8_t out[KEY_LEN])
{
    crypto_generichash_state st;
    uint8_t idx[4] = { (uint8_t)(index >> 24), (uint8_t)(index >> 16), (uint8_t)(index >> 8), (uint8_t)index };
    crypto_generichash_init(&st, NULL, 0, KEY_LEN);
    crypto_generichash_update(&st, prev, KEY_LEN);
    crypto_generichash_update(&st, idx, 4);
    crypto_generichash_update(&st, text, len);
    crypto_generichash_final(&st, out, KEY_LEN);
}




// 띄어쓰기 표식: 같은 글도 받는 사람마다 띄어쓰기를 조금씩 다르게 보여 준다 (캡처가 새면 누구 화면인지 찾으려고)
// 표식 키 = 두 사람 신원 키로 만든 X25519 공유 값에서 뽑는다. 보낸 사람과 받은 사람만 알고, 다음에 켜도 같다
int mark_key(const uint8_t my_id_sk[ID_SK_LEN], const uint8_t their_id_pk[KEY_LEN], uint8_t out[KEY_LEN])
{
    uint8_t my_x[KEY_LEN], their_x[KEY_LEN], shared[KEY_LEN];
    int bad = crypto_sign_ed25519_sk_to_curve25519(my_x, my_id_sk) != 0
           || crypto_sign_ed25519_pk_to_curve25519(their_x, their_id_pk) != 0
           || crypto_scalarmult(shared, my_x, their_x) != 0;
    if (!bad)
        derive(shared, "mark", out);
    sodium_memzero(my_x, KEY_LEN);
    sodium_memzero(shared, KEY_LEN);
    return bad ? -1 : 0;
}




// gap번째 칸을 두 칸으로 띄울지: 비트 2개가 둘 다 1이면 (4칸에 1칸꼴이라 눈에 잘 안 띈다)
static int doubled(const uint8_t bits[KEY_LEN], int gap)
{
    int bit = gap * 2 % (KEY_LEN * 8);
    return (bits[bit / 8] >> (bit % 8) & 3) == 3;
}




// 표식 비트 = BLAKE2b(키 = 표식 키, 글). out = 이름 뒤 칸 + 글, 칸마다 표식을 넣는다
// out 크기는 글 길이의 2배 + 3이면 충분
void mark_text(const uint8_t key[KEY_LEN], const char *text, char *out)
{
    uint8_t bits[KEY_LEN];
    int gap = 0;
    crypto_generichash(bits, KEY_LEN, (const uint8_t *)text, strlen(text), key, KEY_LEN);
    *out++ = ' ';
    if (doubled(bits, gap++))
        *out++ = ' ';
    for (; *text; text++) {
        *out++ = *text;
        if (*text == ' ' && doubled(bits, gap++))
            *out++ = ' ';
    }
    *out = '\0';
}




#ifndef NET_ONLY   // 통신, 키 부분만 따로 테스트할 때는 여기까지만 씀

#define PORT        9000
#define MAX_PEOPLE  60                // 윈도우 select가 64개까지라서
#define MAX_INPUT   1000
#define KEEP        1000              // 장부 값을 사람마다 최근 몇 개까지 기억할지
#define MSG_HEAD    (1 + 4 + KEY_LEN) // 메시지 앞부분: 전체/1:1 + 장부 번호 + 앞 장부 값
#define STAMP_ITEM  (NAME_LEN + 4 + KEY_LEN)
#define MAX_KNOWN   256               // known 파일에서 읽을 사람 수




static int  is_host;
static char my_name[NAME_LEN];
static char dm_target[NAME_LEN];      // 1:1 대화 상대 (비어 있으면 전체)
static uint8_t my_id_pk[KEY_LEN], my_id_sk[ID_SK_LEN];   // 신원 키
static uint8_t my_kx_pk[KEY_LEN], my_kx_sk[KEY_LEN];     // 이번 접속의 세션 키
static uint8_t my_hello[HELLO_BODY];
static char my_words[WORDS_LEN];
static struct packet recv_pkt, send_pkt;
static uint8_t text_buf[MAX_BODY];
static CRITICAL_SECTION lock;         // 두 스레드가 동시에 건드리지 않게




// 화면 출력, 이름 검사, 파일

static void print_line(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\n");
    fflush(stdout);
}




// 이름 끝 글자에 받침이 있으면 1 (창식 -> 1, 민지 -> 0). 조사를 이/가, 은/는, 과/와 중에 고르려고
static int has_final(const char *s)
{
    size_t n = strlen(s);
    const unsigned char *c;
    int code;
    if (n < 3)
        return 0;
    c = (const unsigned char *)s + n - 3;
    if ((c[0] & 0xF0) != 0xE0)
        return 0;
    code = (c[0] & 0x0F) << 12 | (c[1] & 0x3F) << 6 | (c[2] & 0x3F);
    return code >= 0xAC00 && code <= 0xD7A3 && (code - 0xAC00) % 28 != 0;
}
#define I_GA(s)   (has_final(s) ? "이" : "가")
#define EUN(s)    (has_final(s) ? "은" : "는")
#define GWA(s)    (has_final(s) ? "과" : "와")




// 받은 글에 제어 문자가 있으면 ?로 바꿈
static void remove_control_chars(char *s)
{
    for (; *s; s++)
        if ((unsigned char)*s < 0x20 || *s == 0x7f)
            *s = '?';
}




// 앞뒤 공백을 지우고 가운데 여러 칸은 한 칸으로 (보내는 글에 두 칸이 없어야 띄어쓰기 표식과 안 헷갈림)
static char *trim(char *s)
{
    char *w = s, *r = s;
    while (*r == ' ')
        r++;
    for (; *r; r++)
        if (*r != ' ' || (r[1] != ' ' && r[1] != '\0'))
            *w++ = *r;
    *w = '\0';
    return s;
}




// 이름은 1~15바이트, 공백이랑 /, |는 안 됨
static int is_valid_name(const char *s)
{
    for (const char *c = s; *c; c++)
        if ((unsigned char)*c <= ' ' || *c == '/' || *c == '|')
            return 0;
    return s[0] && strlen(s) < NAME_LEN;
}




// 내 폴더의 파일 열기: %USERPROFILE%\.deolmi\내이름\파일 (테스트할 때는 DEOLMI_HOME으로 바꿀 수 있음)
// 한글 이름 때문에 경로는 wchar_t로 다룬다
static FILE *open_my_file(const char *file, const wchar_t *mode)
{
    wchar_t path[MAX_PATH], wide[NAME_LEN];
    const wchar_t *home = _wgetenv(L"DEOLMI_HOME");
    if (!home)
        home = _wgetenv(L"USERPROFILE");
    if (!home)
        home = L".";
    CreateDirectoryW(home, NULL);
    swprintf(path, MAX_PATH, L"%ls\\.deolmi", home);
    CreateDirectoryW(path, NULL);
    MultiByteToWideChar(CP_UTF8, 0, my_name, -1, wide, NAME_LEN);
    wcscat(path, L"\\");
    wcscat(path, wide);
    CreateDirectoryW(path, NULL);
    wcscat(path, L"\\");
    MultiByteToWideChar(CP_UTF8, 0, file, -1, wide, NAME_LEN);
    wcscat(path, wide);
    return _wfopen(path, mode);
}




// 신원 키 읽기. 없으면 새로 만들어 저장
static int load_identity(void)
{
    FILE *f = open_my_file("id", L"rb");
    if (f) {
        size_t n = fread(my_id_sk, 1, ID_SK_LEN, f);
        fclose(f);
        if (n != ID_SK_LEN)
            return -1;
        crypto_sign_ed25519_sk_to_pk(my_id_pk, my_id_sk);
        return 0;
    }
    crypto_sign_keypair(my_id_pk, my_id_sk);
    f = open_my_file("id", L"wb");
    if (!f || fwrite(my_id_sk, 1, ID_SK_LEN, f) != ID_SK_LEN)
        return -1;
    fclose(f);
    return 1;
}




// known 파일: 한 번 승인했거나 만난 사람의 신원 키 ("이름 키16진수" 한 줄씩)
// 같은 이름은 마지막 줄이 이긴다. 읽은 사람 수를 돌려준다
static char    known_names[MAX_KNOWN][NAME_LEN];
static uint8_t known_pks[MAX_KNOWN][KEY_LEN];

static int load_known(void)
{
    char line[256];
    uint8_t pk[KEY_LEN];
    size_t pk_len;
    int count = 0, i;
    FILE *f = open_my_file("known", L"r");
    if (!f)
        return 0;
    while (fgets(line, sizeof(line), f)) {
        char *space = strchr(line, ' ');
        if (!space)
            continue;
        *space = '\0';
        if (strlen(line) >= NAME_LEN || sodium_hex2bin(pk, KEY_LEN, space + 1, strcspn(space + 1, "\r\n"),
                                                       NULL, &pk_len, NULL) != 0 || pk_len != KEY_LEN)
            continue;
        for (i = 0; i < count && strcmp(known_names[i], line) != 0; i++)
            ;
        if (i == count && count < MAX_KNOWN)
            strcpy(known_names[count++], line);
        if (i < count)
            memcpy(known_pks[i], pk, KEY_LEN);
    }
    fclose(f);
    return count;
}




// 리턴값 1: 같은 키로 승인했던 사람, -1: 이름은 있는데 키가 다름, 0: 처음
static int check_known(const char *name, const uint8_t id_pk[KEY_LEN])
{
    int count = load_known();
    for (int i = 0; i < count; i++)
        if (strcmp(known_names[i], name) == 0)
            return memcmp(known_pks[i], id_pk, KEY_LEN) == 0 ? 1 : -1;
    return 0;
}




// 같은 이름은 마지막 줄이 이긴다
static void save_known(const char *name, const uint8_t id_pk[KEY_LEN])
{
    char hex[2 * KEY_LEN + 1];
    FILE *f = open_my_file("known", L"a");
    if (!f)
        return;
    sodium_bin2hex(hex, sizeof(hex), id_pk, KEY_LEN);
    fprintf(f, "%s %s\n", name, hex);
    fclose(f);
}




// 방에 있는 사람들 (나는 빼고)
// 새로 들어온 사람은 WAITING(승인 대기)이고, 기존 멤버 전원이 승인하면 MEMBER가 된다

enum { WAITING, MEMBER };

struct ledger {                       // 한 사람이 전체 대화로 보낸 글의 장부
    uint32_t count;                   // 마지막 번호
    uint8_t  head[KEEP][KEY_LEN];     // 번호 k의 값은 head[k % KEEP]
    uint32_t at[KEEP];                // head[i]가 몇 번 값인지 (0이면 없음)
    int      warned;                  // 이미 덜미 경고를 했는지 (같은 경고를 계속 띄우지 않게)
    uint32_t missing_warned;
    int      start_known;             // 이 사람 글을 몇 번부터 받아야 하는지 아는지
    uint32_t start;                   // 그 번호까지는 내가 오기 전 글
};

struct person {
    char     name[NAME_LEN];
    uint8_t  id_pk[KEY_LEN];
    uint8_t  send_key[KEY_LEN], recv_key[KEY_LEN];   // 이 사람과 쓰는 방향별 래칫
    uint8_t  mark[KEY_LEN];                           // 띄어쓰기 표식 키
    uint64_t send_seq, recv_seq;
    int      state;
    int      eye;                                     // 이 사람의 카메라 지킴이 상태 (EYE_OFF ...)
    char     approvers[MAX_PEOPLE][NAME_LEN];         // 이 사람을 승인한 사람들
    int      approver_count;
    int      shown_progress;                          // 화면에 마지막으로 보여 준 승인 수
    struct ledger book;
};

static struct person people[MAX_PEOPLE];
static int people_count;
static struct ledger my_book;         // 내가 전체 대화로 보낸 글의 장부




static struct person *find_person(const char *name)
{
    for (int i = 0; i < people_count; i++)
        if (strcmp(people[i].name, name) == 0)
            return &people[i];
    return NULL;
}




static int member_count(void)
{
    int n = 0;
    for (int i = 0; i < people_count; i++)
        n += people[i].state == MEMBER;
    return n;
}




static void check_admitted(struct person *p);
static void send_stamp(struct person *only, int ask);
static void send_eye(struct person *only);




// 1:1 하던 사람이 나가면 다시 전체 대화로
static void remove_person(const char *name)
{
    struct person *p = find_person(name);
    if (!p)
        return;
    if (strcmp(dm_target, name) == 0)
        dm_target[0] = '\0';
    sodium_memzero(p, sizeof(*p));
    *p = people[--people_count];
    for (int i = 0; i < people_count; i++)   // 나간 사람의 승인이 필요 없어졌으니 다시 확인
        check_admitted(&people[i]);
}




// 중계 부분 (방장)
// 방장이 서버 역할을 한다. 받는 사람한테 그대로 넘기고, 내용은 열지 못한다

struct client {                       // 방장한테 접속한 참가자
    struct connection conn;
    char    name[NAME_LEN];
    int     joined;                   // HELLO 받았는지
    uint8_t hello[HELLO_BODY];        // 나중에 들어온 사람한테 넘겨줄 HELLO
};
static struct client clients[MAX_PEOPLE];
static int client_count;
static char drop_next[NAME_LEN], tamper_next[NAME_LEN];   // 시연 모드




static int find_client(const char *name)
{
    for (int i = 0; i < client_count; i++)
        if (clients[i].joined && strcmp(clients[i].name, name) == 0)
            return i;
    return -1;
}




static void make_packet(struct packet *p, int type, const char *from, const char *to)
{
    memset(p, 0, sizeof(*p));
    p->type = (uint8_t)type;
    strncpy(p->from, from, NAME_LEN - 1);
    strncpy(p->to, to, NAME_LEN - 1);
}




// 방장이 i번 참가자한테 보내기. 시연 모드면 메시지 한 통을 몰래 버리거나 1바이트 바꾼다
static void host_send(int i, struct packet *p)
{
    if (p->type == TYPE_MESSAGE && strcmp(drop_next, clients[i].name) == 0) {
        print_line("[시연] %s에게 가는 %s의 메시지를 몰래 버렸습니다", clients[i].name, p->from);
        drop_next[0] = '\0';
        return;
    }
    if (p->type == TYPE_MESSAGE && strcmp(tamper_next, clients[i].name) == 0 && p->body_len > 0) {
        print_line("[시연] %s에게 가는 %s의 메시지를 1바이트 바꿨습니다", clients[i].name, p->from);
        p->body[0] ^= 1;
        send_packet(clients[i].conn.sock, p);
        p->body[0] ^= 1;
        tamper_next[0] = '\0';
        return;
    }
    send_packet(clients[i].conn.sock, p);
}




// i번 참가자한테 알림 보내기
static void send_notice(int i, const char *fmt, ...)
{
    static struct packet notice;
    va_list ap;
    make_packet(&notice, TYPE_NOTICE, "", clients[i].name);
    va_start(ap, fmt);
    notice.body_len = vsnprintf((char *)notice.body, MAX_BODY, fmt, ap);
    va_end(ap);
    send_packet(clients[i].conn.sock, &notice);
}




// 입장, 퇴장 알림
static void notice_all(const char *name, const char *what)
{
    print_line("[알림] %s %s", name, what);
    for (int k = 0; k < client_count; k++)
        if (clients[k].joined)
            send_notice(k, "%s %s", name, what);
}




// 연결이 끊기거나 규칙을 어기면 내보냄
static void remove_client(int i)
{
    char name[NAME_LEN];
    int was_joined = clients[i].joined;
    strcpy(name, clients[i].name);
    closesocket(clients[i].conn.sock);
    clients[i] = clients[--client_count];
    if (was_joined) {
        remove_person(name);
        notice_all(name, "퇴장");
    }
}




static void on_hello(const struct packet *p);




// 입장 처리
// 이름이 겹치거나 서명이 틀리면 거절하고, 괜찮으면 새로 온 사람한테 지금 있는 사람들의 HELLO를,
// 지금 있는 사람들한테 새로 온 사람의 HELLO를 넘긴다
// 새로 온 사람한테 보내는 HELLO는 seq를 1로 (이미 있던 사람), 방장 HELLO는 마지막에 2로 보낸다
static int handle_join(int i, struct packet *p)
{
    if (!is_valid_name(p->from) || find_client(p->from) >= 0 || strcmp(p->from, my_name) == 0) {
        send_notice(i, "이름 사용 중이거나 쓸 수 없음: %s", p->from);
        remove_client(i);
        return -1;
    }
    if (!hello_ok(p->from, p->body, p->body_len)) {
        send_notice(i, "HELLO 서명이 맞지 않습니다");
        remove_client(i);
        return -1;
    }
    strcpy(clients[i].name, p->from);
    memcpy(clients[i].hello, p->body, HELLO_BODY);
    clients[i].joined = 1;
    for (int k = 0; k < client_count; k++)
        if (k != i && clients[k].joined) {
            make_packet(&send_pkt, TYPE_HELLO, clients[k].name, p->from);
            send_pkt.seq = 1;
            memcpy(send_pkt.body, clients[k].hello, HELLO_BODY);
            send_pkt.body_len = HELLO_BODY;
            send_packet(clients[i].conn.sock, &send_pkt);
            make_packet(&send_pkt, TYPE_HELLO, p->from, clients[k].name);
            memcpy(send_pkt.body, p->body, HELLO_BODY);
            send_pkt.body_len = HELLO_BODY;
            send_packet(clients[k].conn.sock, &send_pkt);
        }
    make_packet(&send_pkt, TYPE_HELLO, my_name, p->from);
    send_pkt.seq = 2;
    memcpy(send_pkt.body, my_hello, HELLO_BODY);
    send_pkt.body_len = HELLO_BODY;
    send_packet(clients[i].conn.sock, &send_pkt);
    notice_all(p->from, "입장");
    on_hello(p);                      // 방장도 방의 한 사람으로 새 사람을 받는다
    return 0;
}




static void handle_incoming(struct packet *p);




// 받은 패킷 처리
// HELLO 전에 다른 걸 보내면 끊고, 보낸 사람 이름이 다르면 막는다. 나한테 온 거면 열고, 아니면 넘긴다
static int handle_packet(int i, struct packet *p)
{
    if (!clients[i].joined && p->type != TYPE_HELLO) {
        send_notice(i, "먼저 HELLO를 보내야 합니다");
        remove_client(i);
        return -1;
    }
    if (p->type == TYPE_HELLO) {
        if (clients[i].joined)
            send_notice(i, "HELLO는 한 번만 보냅니다");
        else
            return handle_join(i, p);
    } else if (p->type != TYPE_MESSAGE && p->type != TYPE_APPROVE && p->type != TYPE_LEDGER && p->type != TYPE_EYE)
        send_notice(i, "모르는 type: %d", p->type);
    else if (strcmp(p->from, clients[i].name) != 0)
        send_notice(i, "보낸 사람 이름이 다릅니다: %s", p->from);
    else if (strcmp(p->to, my_name) == 0)
        handle_incoming(p);
    else {
        int to = find_client(p->to);
        if (to < 0)
            send_notice(i, "%s%s 접속해 있지 않습니다", p->to, EUN(p->to));
        else
            host_send(to, p);
    }
    return 0;
}




static void read_from_client(int i)
{
    int result;
    if (receive_bytes(&clients[i].conn) <= 0) {
        remove_client(i);
        return;
    }
    while ((result = take_packet(&clients[i].conn, &recv_pkt)) == 1)
        if (handle_packet(i, &recv_pkt) < 0)
            return;
    if (result < 0)
        remove_client(i);
}




// 대화 부분 (방장, 참가자 둘 다 씀)

static struct connection host_conn;   // 참가자일 때 방장과의 연결
static int  joining = 1;              // 참가자: 방장 HELLO를 받기 전까지 (이때 오는 HELLO는 이미 있던 사람)
static char my_approvers[MAX_PEOPLE][NAME_LEN];   // 새로 온 내가 받은 승인
static int  my_approver_count, my_admitted;




// 한 사람한테 암호화해서 보내기 (참가자는 방장한테, 방장은 바로 그 사람한테)
static void send_to(struct person *to, int type, const uint8_t *text, size_t len)
{
    make_packet(&send_pkt, type, my_name, to->name);
    send_pkt.seq = ++to->send_seq;
    seal_packet(to->send_key, &send_pkt, text, len);
    if (!is_host)
        send_packet(host_conn.sock, &send_pkt);
    else {
        int i = find_client(to->name);
        if (i >= 0)
            host_send(i, &send_pkt);
    }
}




// 받은 패킷 열기. 번호가 이미 받은 거면 다시 보내기, 건너뛰었으면 빠진 것, 안 열리면 바뀐 것
static int open_from(struct person *from, const struct packet *p, uint8_t *text)
{
    if (p->seq <= from->recv_seq) {
        print_line("[!] %s의 #%llu 메시지가 또 왔습니다 (다시 보내기 의심) · 버림", from->name, (unsigned long long)p->seq);
        return -1;
    }
    uint64_t skip = p->seq - from->recv_seq - 1;
    int n = open_packet(from->recv_key, skip, p, text);
    if (n < 0) {
        print_line("[!] %s의 #%llu 메시지가 중간에 바뀌었습니다 · 버림", from->name, (unsigned long long)p->seq);
        return -1;
    }
    if (skip == 1)
        print_line("[덜미] %s%s 나에게 보낸 #%llu 메시지가 오지 않았습니다 (중간에서 빠짐)", from->name, I_GA(from->name), (unsigned long long)p->seq - 1);
    else if (skip > 1)
        print_line("[덜미] %s%s 나에게 보낸 #%llu~#%llu 메시지가 오지 않았습니다 (중간에서 빠짐)",
                   from->name, I_GA(from->name), (unsigned long long)from->recv_seq + 1, (unsigned long long)p->seq - 1);
    from->recv_seq = p->seq;
    return n;
}




// 입장 심사

static int has_name(char list[][NAME_LEN], int count, const char *name)
{
    for (int i = 0; i < count; i++)
        if (strcmp(list[i], name) == 0)
            return 1;
    return 0;
}




static void add_approver(struct person *p, const char *name)
{
    if (!has_name(p->approvers, p->approver_count, name) && p->approver_count < MAX_PEOPLE)
        strcpy(p->approvers[p->approver_count++], name);
}




// 나와 지금 멤버 전원이 승인했으면 멤버로
static void check_admitted(struct person *p)
{
    int need = 1, got = has_name(p->approvers, p->approver_count, my_name);
    char waiting_for[NAME_LEN] = "";
    if (p->state != WAITING)
        return;
    for (int i = 0; i < people_count; i++)
        if (people[i].state == MEMBER) {
            need++;
            if (has_name(p->approvers, p->approver_count, people[i].name))
                got++;
            else if (!waiting_for[0])
                strcpy(waiting_for, people[i].name);
        }
    if (got == need && waiting_for[0] == '\0' && has_name(p->approvers, p->approver_count, my_name)) {
        p->state = MEMBER;
        print_line("[입장 심사] %s 승인 %d/%d · 이제 %s도 대화에 들어옵니다", p->name, got, need, p->name);
        send_stamp(p, 0);             // 내 글을 몇 번부터 받는지 알려 준다
        send_eye(p);                  // 내 카메라 지킴이를 켜 두었으면 그것도
    } else if (got != p->shown_progress && got > 0) {
        print_line("[입장 심사] %s 승인 %d/%d · %s의 승인을 기다리는 중", p->name, got, need,
                   waiting_for[0] ? waiting_for : "나");
    }
    p->shown_progress = got;
}




// 승인: 승인한 걸 멤버들과 그 사람한테 암호화해서 알린다 (방장이 꾸밀 수 없게)
static void approve(struct person *p)
{
    uint8_t body[NAME_LEN + KEY_LEN] = {0};
    save_known(p->name, p->id_pk);
    if (p->state == MEMBER) {
        print_line("[확인] %s의 단어를 확인했습니다", p->name);
        return;
    }
    if (has_name(p->approvers, p->approver_count, my_name))
        return;
    add_approver(p, my_name);
    strncpy((char *)body, p->name, NAME_LEN - 1);
    memcpy(body + NAME_LEN, p->id_pk, KEY_LEN);
    for (int i = 0; i < people_count; i++)
        if (people[i].state == MEMBER || &people[i] == p)
            send_to(&people[i], TYPE_APPROVE, body, sizeof(body));
    check_admitted(p);
}




// 누가 승인을 보냄
static void on_approve(struct person *from, const uint8_t *body, int len)
{
    char name[NAME_LEN];
    if (len != NAME_LEN + KEY_LEN)
        return;
    memcpy(name, body, NAME_LEN);
    name[NAME_LEN - 1] = '\0';
    if (strcmp(name, my_name) == 0) {             // 나를 승인함
        if (memcmp(body + NAME_LEN, my_id_pk, KEY_LEN) != 0 || has_name(my_approvers, my_approver_count, from->name))
            return;
        strcpy(my_approvers[my_approver_count++], from->name);
        int got = 0, need = member_count();
        for (int i = 0; i < people_count; i++)
            got += people[i].state == MEMBER && has_name(my_approvers, my_approver_count, people[i].name);
        print_line("[입장 심사] %s 승인 (%d/%d)", from->name, got, need);
        if (got == need && !my_admitted) {
            my_admitted = 1;
            print_line("[입장 심사] 모두 승인했습니다 · 이제 대화가 보입니다");
        }
        return;
    }
    struct person *p = find_person(name);
    if (p && memcmp(body + NAME_LEN, p->id_pk, KEY_LEN) == 0 && from->state == MEMBER) {
        add_approver(p, from->name);
        check_admitted(p);
    }
}




// HELLO: 서명을 확인하고 키를 계산한다
// 이미 있던 사람(내가 들어올 때 받은 것)은 바로 멤버, 새로 온 사람은 승인 대기
static void on_hello(const struct packet *p)
{
    char words[WORDS_LEN];
    if (!hello_ok(p->from, p->body, p->body_len) || strcmp(p->from, my_name) == 0) {
        print_line("[!] %s의 HELLO 서명이 맞지 않아 무시합니다", p->from);
        return;
    }
    if (find_person(p->from) || people_count >= MAX_PEOPLE)
        return;
    struct person *n = &people[people_count];
    memset(n, 0, sizeof(*n));
    strcpy(n->name, p->from);
    memcpy(n->id_pk, p->body, KEY_LEN);
    if (start_keys(my_kx_pk, my_kx_sk, p->body + KEY_LEN, n->send_key, n->recv_key) != 0
        || mark_key(my_id_sk, n->id_pk, n->mark) != 0)
        return;
    people_count++;
    key_words(n->id_pk, words);
    int known = check_known(n->name, n->id_pk);
    if (!is_host && joining && p->seq >= 1) {
        n->state = MEMBER;
        print_line("[멤버] %s · 단어 %s%s", n->name, words, known == 1 ? " (전에 확인함)" : "");
        if (known < 0)
            print_line("[!] %s의 키가 전과 다릅니다 · 새 기기이거나 다른 사람입니다 · 단어를 다시 확인하세요", n->name);
        else if (known == 0)
            save_known(n->name, n->id_pk);   // 처음 본 키로 기억 (다음에 키가 바뀌면 알 수 있게)
        if (p->seq == 2) {
            joining = 0;
            print_line("[입장 심사] 승인을 기다리는 중 · 내 단어 %s", my_words);
            print_line("            멤버들이 내 단어를 확인하고 승인하면 대화가 보입니다 (상대 단어 확인은 /verify 이름)");
        }
        return;
    }
    n->state = WAITING;
    n->book.start_known = 1;          // 처음부터 같이 있었으니 0번부터
    print_line("[입장 심사] %s%s 들어왔습니다 · 단어 %s", n->name, I_GA(n->name), words);
    if (known == 1) {
        print_line("            전에 확인한 키라서 자동으로 승인합니다");
        approve(n);
    } else if (known < 0) {
        print_line("[!] %s의 키가 전과 다릅니다 · 새 기기이거나 다른 사람입니다 · 단어를 다시 확인하세요", n->name);
        print_line("            %s에게 직접 물어보고 맞으면 /ok %s", n->name, n->name);
    } else {
        print_line("            %s에게 직접 물어보고 맞으면 /ok %s", n->name, n->name);
    }
}




// 장부 대조

struct report {                       // 남은 받았는데 나는 아직 없는 글
    char      sender[NAME_LEN], reporter[NAME_LEN];
    uint32_t  index;
    uint8_t   head[KEY_LEN];
    ULONGLONG since;
};
static struct report reports[128];
static int report_count;
static int book_changed;
static ULONGLONG last_stamp;
static char checking[MAX_PEOPLE][NAME_LEN];       // /check로 대조를 기다리는 사람
static int  checking_count;




static void book_put(struct ledger *b, uint32_t index, const uint8_t head[KEY_LEN])
{
    memcpy(b->head[index % KEEP], head, KEY_LEN);
    b->at[index % KEEP] = index;
    if (index > b->count)
        b->count = index;
}




// 번호 index의 값. 없으면 NULL
static const uint8_t *book_get(const struct ledger *b, uint32_t index)
{
    static const uint8_t zero[KEY_LEN] = {0};
    if (index == 0)
        return zero;
    return b->at[index % KEEP] == index ? b->head[index % KEEP] : NULL;
}




// 전체 대화로 받은 글을 장부에 쌓는다. 처음 받는 사람이면 그 자리부터 이어 쌓는다
static void book_add(struct person *from, uint32_t index, const uint8_t prev[KEY_LEN], const uint8_t *text, size_t len)
{
    struct ledger *b = &from->book;
    uint8_t head[KEY_LEN];
    if (index == 0 || (b->count > 0 && index <= b->count))
        return;
    const uint8_t *mine = book_get(b, index - 1);
    if (b->count == 0 || index > b->count + 1 || !mine) {
        book_put(b, index - 1, prev);
        mine = prev;
    } else if (memcmp(mine, prev, KEY_LEN) != 0 && !b->warned) {
        b->warned = 1;
        print_line("[덜미] %s%s 나에게 보낸 앞 글이 %s%s 모두에게 보냈다는 글과 다릅니다 (%u번째 글에서 발견)",
                   from->name, I_GA(from->name), from->name, I_GA(from->name), index);
    }
    ledger_next(mine, index, text, len, head);
    book_put(b, index, head);
    book_changed = 1;
}




static struct ledger *book_of(const char *name)
{
    struct person *p;
    if (strcmp(name, my_name) == 0)
        return &my_book;
    p = find_person(name);
    return p ? &p->book : NULL;
}




// 내 장부 끝값들을 멤버들한테 보낸다 (ask면 답장해 달라고)
static void send_stamp(struct person *only, int ask)
{
    static uint8_t body[1 + (MAX_PEOPLE + 1) * STAMP_ITEM];
    size_t len = 1;
    body[0] = (uint8_t)ask;
    for (int i = -1; i < people_count; i++) {
        const char *name = i < 0 ? my_name : people[i].name;
        const struct ledger *b = i < 0 ? &my_book : &people[i].book;
        if (i >= 0 && people[i].state != MEMBER)
            continue;
        memset(body + len, 0, NAME_LEN);
        strcpy((char *)body + len, name);
        for (int k = 0; k < 4; k++)
            body[len + NAME_LEN + k] = (uint8_t)(b->count >> (24 - 8 * k));
        memcpy(body + len + NAME_LEN + 4, book_get(b, b->count), KEY_LEN);
        len += STAMP_ITEM;
    }
    for (int i = 0; i < people_count; i++)
        if (people[i].state == MEMBER && (!only || only == &people[i]))
            send_to(&people[i], TYPE_LEDGER, body, len);
    book_changed = 0;
    last_stamp = GetTickCount64();
}




// 같은 번호의 값이 다르면 덜미
static int compare_one(const char *sender, uint32_t index, const uint8_t *head, const char *reporter)
{
    struct ledger *b = book_of(sender);
    const uint8_t *mine;
    if (!b || !(mine = book_get(b, index)) || memcmp(mine, head, KEY_LEN) == 0)
        return 0;
    if (b->warned)
        return 1;
    b->warned = 1;
    if (strcmp(sender, my_name) == 0)
        print_line("[덜미] 내 글이 %s에게는 다르게 전해졌습니다 (%u번째 글까지 장부가 다름)", reporter, index);
    else if (strcmp(sender, reporter) == 0)
        print_line("[덜미] %s%s 모두에게 보냈다는 글과 내가 받은 글이 다릅니다 (%u번째 글까지 장부가 다름)", sender, I_GA(sender), index);
    else
        print_line("[덜미] %s의 글을 나와 %s%s 다르게 받았습니다 (%u번째 글까지 장부가 다름)", sender, reporter, I_GA(reporter), index);
    return 1;
}




// 누가 장부 끝값들을 보냄
static void on_stamp(struct person *from, const uint8_t *body, int len)
{
    char summary[512] = "";
    int differ = 0;
    if (len < 1 || (len - 1) % STAMP_ITEM != 0 || from->state != MEMBER)
        return;
    for (int at = 1; at < len; at += STAMP_ITEM) {
        char sender[NAME_LEN];
        uint32_t index = 0;
        const uint8_t *head = body + at + NAME_LEN + 4;
        struct ledger *b;
        memcpy(sender, body + at, NAME_LEN);
        sender[NAME_LEN - 1] = '\0';
        for (int k = 0; k < 4; k++)
            index = index << 8 | body[at + NAME_LEN + k];
        if (!(b = book_of(sender)))
            continue;
        if (!b->start_known && strcmp(sender, from->name) == 0) {   // 이 사람이 나를 받아 준 때의 번호
            b->start_known = 1;
            b->start = index;
        }
        if (index > 0)
            snprintf(summary + strlen(summary), sizeof(summary) - strlen(summary), "%s%s %u", summary[0] ? " · " : "", sender, index);
        if (book_get(b, index))
            differ += compare_one(sender, index, head, from->name);
        else if (b->start_known && index > b->start && index > b->count && index > b->missing_warned && report_count < 128) {   // 나는 아직 없음: 조금 기다려 본다
            int dup = 0;
            for (int i = 0; i < report_count; i++)
                dup |= strcmp(reports[i].sender, sender) == 0 && reports[i].index == index;
            if (dup)
                continue;
            struct report *r = &reports[report_count++];
            strcpy(r->sender, sender);
            strcpy(r->reporter, from->name);
            r->index = index;
            memcpy(r->head, head, KEY_LEN);
            r->since = GetTickCount64();
        }
    }
    if (body[0])
        send_stamp(from, 0);
    if (has_name(checking, checking_count, from->name)) {
        for (int i = 0; i < checking_count; i++)
            if (strcmp(checking[i], from->name) == 0)
                strcpy(checking[i], checking[--checking_count]);
        print_line(differ ? "[장부] %s%s 다릅니다 (%s)" : "[장부] %s%s 같음 ✔ (%s)", from->name, GWA(from->name),
                   summary[0] ? summary : "아직 전체 글 없음");
    }
}




// 1초마다: 새 글이 있었으면 2초마다 대조, 기다리던 글이 3초 넘게 안 오면 덜미
static void tick(void)
{
    ULONGLONG now = GetTickCount64();
    if (book_changed && now - last_stamp >= 2000)
        send_stamp(NULL, 0);
    for (int i = report_count - 1; i >= 0; i--) {
        struct report *r = &reports[i];
        struct ledger *b = book_of(r->sender);
        if (b && book_get(b, r->index))
            compare_one(r->sender, r->index, r->head, r->reporter);
        else if (now - r->since < 3000)
            continue;
        else if (b && r->index > b->missing_warned) {
            b->missing_warned = r->index;
            print_line("[덜미] %s의 %u번째 글이 나에게 오지 않았습니다 (%s%s 받음)", r->sender, r->index, r->reporter, EUN(r->reporter));
        }
        reports[i] = reports[--report_count];
    }
}




// 카메라 지킴이 (/eye)
// 카메라 프로그램(eye\deolmi_eye.py)이 같은 노트북 안에서 UDP로 0.5초마다 한 단어를 보낸다: ready, clear, phone, dark, fail
// 화면 앞에 휴대폰이 보이거나 카메라가 가려지면 글을 가리고, 방 사람들에게 암호화해서 알린다
// 영상은 카메라 프로그램 안에서만 쓰고 저장하지도 보내지도 않는다. 덜미가 받는 건 단어 하나뿐

enum { EYE_OFF, EYE_ON, EYE_PHONE, EYE_DARK };

static int eye_sock = -1, eye_state = EYE_OFF;
static HANDLE eye_job, hidden_screen;
static ULONGLONG eye_heard;           // 카메라 프로그램한테서 마지막으로 들은 때




// 내 지킴이 상태를 멤버들한테 (only가 있으면 그 사람한테만)
static void send_eye(struct person *only)
{
    uint8_t state = (uint8_t)eye_state;
    for (int i = 0; i < people_count; i++)
        if (people[i].state == MEMBER && (!only || &people[i] == only))
            send_to(&people[i], TYPE_EYE, &state, 1);
}




// 글 가리기: 빈 화면 버퍼로 바꿔 끼운다. 그동안 온 글은 원래 화면에 쌓였다가 돌아오면 보인다
static void hide_screen(const wchar_t *why)
{
    HANDLE out = GetStdHandle(STD_OUTPUT_HANDLE);
    DWORD mode, n;
    if (!GetConsoleMode(out, &mode))  // 화면이 아니면 (파이프로 테스트할 때) 가리지 않음
        return;
    if (hidden_screen) {
        SetConsoleActiveScreenBuffer(out);
        CloseHandle(hidden_screen);
        hidden_screen = NULL;
    }
    if (!why)
        return;
    hidden_screen = CreateConsoleScreenBuffer(GENERIC_READ | GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, CONSOLE_TEXTMODE_BUFFER, NULL);
    if (hidden_screen == INVALID_HANDLE_VALUE) {
        hidden_screen = NULL;
        return;
    }
    WriteConsoleW(hidden_screen, why, (DWORD)wcslen(why), &n, NULL);
    SetConsoleActiveScreenBuffer(hidden_screen);
}




static void set_eye(int state)
{
    if (state == eye_state)
        return;
    if (state == EYE_PHONE)
        print_line("[카메라] 화면 앞에 휴대폰이 보여 글을 가렸습니다 · 방 사람들에게 알렸습니다");
    else if (state == EYE_DARK)
        print_line("[카메라] 카메라가 가려져 글을 가렸습니다 · 방 사람들에게 알렸습니다");
    else if (state == EYE_ON && eye_state == EYE_OFF)
        print_line("[카메라] 켜졌습니다 · 화면 앞에 휴대폰이 보이거나 카메라를 가리면 글을 가립니다 (영상은 저장하지도 보내지도 않음)");
    else if (state == EYE_ON)
        print_line("[카메라] 다시 보여 줍니다");
    hide_screen(state == EYE_PHONE ? L"\n\n   [덜미] 화면 앞에 휴대폰이 보여 글을 가렸습니다\n\n   휴대폰을 내리면 다시 보입니다\n"
              : state == EYE_DARK  ? L"\n\n   [덜미] 카메라가 가려져 글을 가렸습니다\n\n   카메라를 가리지 않으면 다시 보입니다\n"
              : NULL);
    eye_state = state;
    send_eye(NULL);
}




static void stop_eye(void)
{
    if (eye_job) {                    // job을 닫으면 카메라 프로그램도 같이 꺼진다
        CloseHandle(eye_job);
        eye_job = NULL;
    }
    if (eye_sock >= 0) {
        closesocket(eye_sock);
        eye_sock = -1;
    }
    set_eye(EYE_OFF);
}




// eye\deolmi_eye.py 찾기: 지금 폴더, 그다음 deolmi.exe가 있는 폴더부터 두 칸 위까지
// (x64\Debug\deolmi.exe를 더블클릭해서 켜도 찾게)
static int find_eye(wchar_t path[MAX_PATH])
{
    wchar_t dir[MAX_PATH];
    wcscpy(path, L"eye\\deolmi_eye.py");
    if (GetFileAttributesW(path) != INVALID_FILE_ATTRIBUTES)
        return 1;
    GetModuleFileNameW(NULL, dir, MAX_PATH);
    for (int up = 0; up < 3; up++) {
        wchar_t *slash = wcsrchr(dir, L'\\');
        if (!slash)
            break;
        *slash = L'\0';
        swprintf(path, MAX_PATH, L"%ls\\eye\\deolmi_eye.py", dir);
        if (GetFileAttributesW(path) != INVALID_FILE_ATTRIBUTES)
            return 1;
    }
    return 0;
}




// 카메라 프로그램 켜기. 받을 UDP 포트를 127.0.0.1에 열고 그 번호를 넘긴다
// 테스트할 때는 DEOLMI_EYE로 가짜 카메라 프로그램을 쓸 수 있다
static void start_eye(void)
{
    struct sockaddr_in addr = {0};
    int len = sizeof(addr);
    wchar_t cmd[2 * MAX_PATH], script[MAX_PATH];
    const wchar_t *helper = _wgetenv(L"DEOLMI_EYE");
    STARTUPINFOW si = { sizeof(si) };
    PROCESS_INFORMATION pi;
    JOBOBJECT_EXTENDED_LIMIT_INFORMATION limit = {0};
    if (!helper && !find_eye(script)) {
        print_line("[카메라] eye\\deolmi_eye.py를 찾지 못했습니다 (deolmi 폴더째 받았는지 확인)");
        return;
    }
    eye_sock = (int)socket(AF_INET, SOCK_DGRAM, 0);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    if (eye_sock < 0 || bind(eye_sock, (struct sockaddr *)&addr, sizeof(addr)) != 0
        || getsockname(eye_sock, (struct sockaddr *)&addr, &len) != 0) {
        print_line("[카메라] 카메라 프로그램과 이야기할 포트를 열지 못했습니다");
        stop_eye();
        return;
    }
    if (helper)
        swprintf(cmd, 2 * MAX_PATH, L"%ls %u", helper, ntohs(addr.sin_port));
    else
        swprintf(cmd, 2 * MAX_PATH, L"python \"%ls\" %u", script, ntohs(addr.sin_port));
    eye_job = CreateJobObjectW(NULL, NULL);   // 덜미가 꺼지면 카메라 프로그램도 같이 꺼지게
    limit.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
    SetInformationJobObject(eye_job, JobObjectExtendedLimitInformation, &limit, sizeof(limit));
    if (!CreateProcessW(NULL, cmd, NULL, NULL, FALSE, CREATE_NO_WINDOW | CREATE_SUSPENDED, NULL, NULL, &si, &pi)) {
        print_line("[카메라] 카메라 프로그램을 켜지 못했습니다 (python이 깔려 있는지 확인)");
        stop_eye();
        return;
    }
    AssignProcessToJobObject(eye_job, pi.hProcess);
    ResumeThread(pi.hThread);
    CloseHandle(pi.hThread);
    CloseHandle(pi.hProcess);
    eye_heard = GetTickCount64();
    print_line("[카메라] 켜는 중입니다 (몇 초 걸립니다)");
}




// 카메라 프로그램이 보낸 단어
static void read_eye(void)
{
    char word[16];
    struct sockaddr_in from;
    int len = sizeof(from);
    int n = recvfrom(eye_sock, word, sizeof(word) - 1, 0, (struct sockaddr *)&from, &len);
    if (n <= 0 || from.sin_addr.s_addr != htonl(INADDR_LOOPBACK))
        return;
    word[n] = '\0';
    eye_heard = GetTickCount64();
    if (strcmp(word, "fail") == 0) {
        print_line("[카메라] 카메라를 열지 못했습니다 (다른 프로그램이 쓰고 있는지 확인)");
        stop_eye();
    } else if (strcmp(word, "phone") == 0)
        set_eye(EYE_PHONE);
    else if (strcmp(word, "dark") == 0)
        set_eye(EYE_DARK);
    else if (strcmp(word, "ready") == 0 || strcmp(word, "clear") == 0)
        set_eye(EYE_ON);
}




// 카메라 프로그램이 조용하면 멈춘 것 (켜는 중엔 모델을 읽느라 오래 걸려서 20초까지 기다림)
static void check_eye(void)
{
    if (eye_sock >= 0 && GetTickCount64() - eye_heard > (eye_state == EYE_OFF ? 20000u : 3000u)) {
        print_line("[카메라] 카메라 프로그램이 멈췄습니다 (python에 mediapipe, opencv-python이 깔려 있는지 확인)");
        stop_eye();
    }
}




// 다른 사람의 지킴이 상태
static void on_eye(struct person *from, const uint8_t *body, int len)
{
    int was = from->eye;
    if (len != 1 || body[0] > EYE_DARK || body[0] == was)
        return;
    from->eye = body[0];
    if (body[0] == EYE_PHONE)
        print_line("[덜미] %s 화면 앞에 휴대폰이 보입니다 · %s의 화면은 가려졌습니다", from->name, from->name);
    else if (body[0] == EYE_DARK)
        print_line("[덜미] %s의 카메라가 가려졌습니다 · %s의 화면은 가려졌습니다", from->name, from->name);
    else if (body[0] == EYE_ON && was == EYE_OFF)
        print_line("[카메라] %s%s 카메라 지킴이를 켰습니다", from->name, I_GA(from->name));
    else if (body[0] == EYE_ON)
        print_line("[카메라] %s의 화면이 다시 보입니다", from->name);
    else
        print_line("[카메라] %s%s 카메라 지킴이를 껐습니다", from->name, I_GA(from->name));
}




// 유출 추적 (/trace)
// 새어 나간 내 글 한 줄을 붙여 넣으면, 지금 방에 있는 사람과 known 파일의 사람마다
// 그 사람 화면에 어떻게 보였을지 표식을 다시 만들어 맞춰 본다
static void trace(const char *leak)
{
    static char text[4 * MAX_INPUT], shown[8 * MAX_INPUT + 3], matched[MAX_PEOPLE * (NAME_LEN + 2)];
    char name[NAME_LEN] = "";
    const char *close = strchr(leak, ']'), *body = leak;
    int count, matches = 0, gaps = 1;
    uint8_t key[KEY_LEN];
    if (leak[0] == '[' && close) {    // 앞의 "[이름]" 또는 "[이름 -> 나]"에서 이름만
        size_t n = strcspn(leak + 1, " ]");
        if (n < NAME_LEN) {
            memcpy(name, leak + 1, n);
            name[n] = '\0';
        }
        body = close + 1;
    }
    if (name[0] && strcmp(name, my_name) != 0) {
        print_line("[추적] 내가 보낸 글만 추적할 수 있습니다 (이 글은 %s의 글)", name);
        return;
    }
    strncpy(text, body, sizeof(text) - 1);
    trim(text);
    for (const char *c = text; *c; c++)
        gaps += *c == ' ';
    count = load_known();
    for (int i = 0; i < people_count; i++) {   // 지금 방에 있는데 known에 없는 사람도
        int k;
        for (k = 0; k < count && strcmp(known_names[k], people[i].name) != 0; k++)
            ;
        if (k == count && count < MAX_KNOWN) {
            strcpy(known_names[count], people[i].name);
            memcpy(known_pks[count++], people[i].id_pk, KEY_LEN);
        }
    }
    print_line("[추적] 이 글이 사람마다 이렇게 보였습니다 (띄어쓰기 %d곳 비교)", name[0] ? gaps : gaps - 1);
    matched[0] = '\0';
    for (int i = 0; i < count; i++) {
        if (strcmp(known_names[i], my_name) == 0 || mark_key(my_id_sk, known_pks[i], key) != 0)
            continue;
        mark_text(key, text, shown);
        // 앞에 이름이 없으면 이름 뒤 칸은 빼고 비교
        int same = name[0] ? strcmp(shown, body) == 0 : strcmp(shown + strspn(shown, " "), body + strspn(body, " ")) == 0;
        print_line("        [%s]%s   ← %s 화면%s", my_name, shown, known_names[i], same ? " (같음 ✔)" : "");
        if (same && matches++ < MAX_PEOPLE)
            strcat(strcat(matched, matches > 1 ? ", " : ""), known_names[i]);
    }
    sodium_memzero(key, KEY_LEN);
    if (matches == 1)
        print_line("[추적] %s 화면에서 나온 글입니다", matched);
    else if (matches > 1)
        print_line("[추적] %s 중 한 사람입니다 (글이 짧아 더 좁힐 수 없음 · 다른 줄도 넣어 보세요)", matched);
    else
        print_line("[추적] 띄어쓰기가 꼭 맞는 사람이 없습니다 · 캡처 사진이면 위 줄들과 띄어쓰기를 눈으로 비교하세요");
}




// 받은 메시지
// 앞부분: 0 전체 / 1 1:1, 장부 번호 4, 앞 장부 값 32. 그 뒤가 글
// 화면에는 띄어쓰기 표식을 넣어 보여 준다 (장부에는 원래 글 그대로)
static void on_message(struct person *from, uint8_t *body, int len)
{
    char name[NAME_LEN];
    static char text[MAX_BODY + 1], shown[2 * MAX_BODY + 3];
    if (len < MSG_HEAD)
        return;
    uint32_t index = (uint32_t)body[1] << 24 | body[2] << 16 | body[3] << 8 | body[4];
    if (body[0] == 0)
        book_add(from, index, body + 5, body + MSG_HEAD, len - MSG_HEAD);
    strcpy(name, from->name);
    remove_control_chars(name);
    memcpy(text, body + MSG_HEAD, len - MSG_HEAD);
    text[len - MSG_HEAD] = '\0';
    remove_control_chars(text);
    mark_text(from->mark, text, shown);
    print_line(body[0] ? "[%s -> 나%s]%s" : "[%s%s]%s", name, from->state == WAITING ? " (승인 전)" : "", shown);
}




// 방장이나 다른 사람한테서 온 패킷
static void handle_incoming(struct packet *p)
{
    struct person *from;
    int n;
    if (p->type == TYPE_HELLO) {
        on_hello(p);
        return;
    }
    if (p->type == TYPE_NOTICE) {         // 방장 알림은 암호화가 안 돼 있어서 퇴장만 믿는다
        char name[NAME_LEN + 1], what[16];
        static char text[MAX_BODY + 1];
        memcpy(text, p->body, p->body_len);
        text[p->body_len] = '\0';
        remove_control_chars(text);
        print_line("[알림] %s", text);
        if (sscanf(text, "%16s %15s", name, what) == 2 && strcmp(what, "퇴장") == 0)
            remove_person(name);
        return;
    }
    if (!(from = find_person(p->from))) {
        print_line("[!] 키를 모르는 %s의 메시지 · 버림", p->from);
        return;
    }
    if ((n = open_from(from, p, text_buf)) < 0)
        return;
    if (p->type == TYPE_MESSAGE)
        on_message(from, text_buf, n);
    else if (p->type == TYPE_APPROVE)
        on_approve(from, text_buf, n);
    else if (p->type == TYPE_LEDGER)
        on_stamp(from, text_buf, n);
    else if (p->type == TYPE_EYE)
        on_eye(from, text_buf, n);
}




// 참가자: 방장한테 온 걸 받음
static void read_from_host(void)
{
    int result;
    if (receive_bytes(&host_conn) <= 0) {
        print_line("[알림] 방장과 연결이 끊어졌습니다");
        exit(1);
    }
    while ((result = take_packet(&host_conn, &recv_pkt)) == 1)
        handle_incoming(&recv_pkt);
    if (result < 0)
        exit(1);
}




// 메시지 보내기: 받을 사람마다 따로 암호화한다
// 전체 대화면 장부에 쌓고 번호와 앞 값을 같이 넣는다. two_face가 있으면 그 사람한테만 other_text를 보낸다 (시연)
static void send_message(const char *msg, const char *two_face, const char *other_text)
{
    static uint8_t body[MSG_HEAD + 4 * MAX_INPUT];
    size_t len = strlen(msg), other_len = other_text ? strlen(other_text) : 0;
    int to_all = dm_target[0] == '\0' || two_face;
    uint32_t index = to_all ? my_book.count + 1 : 0;
    if (len > MAX_INPUT) {
        len = MAX_INPUT;
        while (len > 0 && ((unsigned char)msg[len] & 0xC0) == 0x80)
            len--;                    // 한글 중간에서 잘리지 않게
    }
    body[0] = (uint8_t)!to_all;
    for (int k = 0; k < 4; k++)
        body[1 + k] = (uint8_t)(index >> (24 - 8 * k));
    memcpy(body + 5, book_get(&my_book, my_book.count), KEY_LEN);
    for (int i = 0; i < people_count; i++) {
        struct person *p = &people[i];
        if (p->state != MEMBER || (!to_all && strcmp(p->name, dm_target) != 0))
            continue;
        int two = two_face && strcmp(p->name, two_face) == 0;
        memcpy(body + MSG_HEAD, two ? other_text : msg, two ? other_len : len);
        send_to(p, TYPE_MESSAGE, body, MSG_HEAD + (two ? other_len : len));
    }
    if (to_all) {
        uint8_t head[KEY_LEN];
        ledger_next(body + 5, index, (const uint8_t *)msg, len, head);
        book_put(&my_book, index, head);
        book_changed = 1;
    }
}




// 명령어 (명령어가 아니면 메시지로 보냄)
static void handle_input(char *line)
{
    struct person *p;
    if (strcmp(line, "/quit") == 0) {
        exit(0);
    } else if (strcmp(line, "/all") == 0) {
        dm_target[0] = '\0';
        print_line("[전체 대화] 모두에게 보냅니다");
    } else if (strncmp(line, "/dm ", 4) == 0) {
        if (!(p = find_person(line + 4)))
            print_line("[1:1 대화] %s%s 접속해 있지 않습니다 (/who로 확인)", line + 4, EUN(line + 4));
        else if (p->state != MEMBER)
            print_line("[1:1 대화] %s%s 아직 승인 전이라 보낼 수 없습니다", line + 4, EUN(line + 4));
        else {
            strcpy(dm_target, line + 4);
            print_line("[1:1 대화] %s에게만 보냅니다 (/all 입력하면 전체 대화로)", dm_target);
        }
    } else if (strcmp(line, "/who") == 0) {
        printf("[접속 중] %s(나%s)", my_name, eye_state != EYE_OFF ? ", 카메라 켬" : "");
        for (int i = 0; i < people_count; i++)
            printf(", %s%s", people[i].name, people[i].state == WAITING ? "(승인 대기)" : people[i].eye != EYE_OFF ? "(카메라 켬)" : "");
        print_line("");
    } else if (strcmp(line, "/eye") == 0) {
        if (eye_sock < 0)
            start_eye();
        else {
            stop_eye();
            print_line("[카메라] 껐습니다");
        }
    } else if (strncmp(line, "/trace ", 7) == 0) {
        trace(line + 7);
    } else if (strncmp(line, "/ok ", 4) == 0) {
        if (!(p = find_person(line + 4)))
            print_line("[입장 심사] %s%s 접속해 있지 않습니다", line + 4, EUN(line + 4));
        else
            approve(p);
    } else if (strcmp(line, "/verify") == 0) {
        print_line("[내 단어] %s", my_words);
    } else if (strncmp(line, "/verify ", 8) == 0) {
        char words[WORDS_LEN];
        if (!(p = find_person(line + 8)))
            print_line("[!] %s%s 접속해 있지 않습니다", line + 8, EUN(line + 8));
        else {
            key_words(p->id_pk, words);
            print_line("[단어] %s · %s · 맞으면 /ok %s", p->name, words, p->name);
        }
    } else if (strcmp(line, "/check") == 0) {
        checking_count = 0;
        for (int i = 0; i < people_count; i++)
            if (people[i].state == MEMBER)
                strcpy(checking[checking_count++], people[i].name);
        print_line(checking_count ? "[장부] 멤버 %d명과 대조합니다" : "[장부] 대조할 멤버가 없습니다", checking_count);
        send_stamp(NULL, 1);
    } else if (strncmp(line, "/twoface ", 9) == 0) {   // /twoface 이름 | 그 사람한테 보일 글 | 나머지한테 보일 글
        char *a = strchr(line, '|'), *b = a ? strchr(a + 1, '|') : NULL;
        if (!b) {
            print_line("[시연] 쓰는 법: /twoface 이름 | 그 사람에게 보일 글 | 나머지에게 보일 글");
            return;
        }
        *a = *b = '\0';
        char *name = trim(line + 9), *only = trim(a + 1), *rest = trim(b + 1);
        if (!(p = find_person(name)) || p->state != MEMBER)
            print_line("[시연] %s%s 멤버가 아닙니다", name, EUN(name));
        else {
            print_line("[시연] %s에게만 '%s', 나머지에게는 '%s'를 같은 번호로 보냅니다", p->name, only, rest);
            send_message(rest, p->name, only);
        }
    } else if (strncmp(line, "/drop ", 6) == 0 || strncmp(line, "/tamper ", 8) == 0) {
        int drop = line[1] == 'd';
        const char *name = line + (drop ? 6 : 8);
        if (!is_host)
            print_line("[시연] 방장만 할 수 있습니다");
        else if (find_client(name) < 0)
            print_line("[시연] %s%s 접속해 있지 않습니다", name, EUN(name));
        else {
            strcpy(drop ? drop_next : tamper_next, name);
            print_line(drop ? "[시연] %s에게 가는 다음 메시지 한 통을 몰래 버립니다" : "[시연] %s에게 가는 다음 메시지를 1바이트 바꿉니다", name);
        }
    } else if (line[0] == '/') {
        print_line("[알림] 명령어: /dm 이름, /all, /who, /ok 이름, /verify [이름], /check, /eye, /trace 새어 나간 줄, /quit");
        print_line("       시연: /twoface 이름 | 글1 | 글2, 방장 /drop 이름, /tamper 이름");
    } else if (member_count() == 0) {
        print_line("[알림] 아직 대화할 멤버가 없습니다");
    } else {
        send_message(trim(line), NULL, NULL);
    }
}




// 한 줄 입력받기
// 그냥 받으면 한글이 깨져서 ReadConsoleW로 받고 UTF-8로 바꾼다
static int read_line(char *line, int size)
{
    static wchar_t wide[MAX_INPUT + 2];
    HANDLE input = GetStdHandle(STD_INPUT_HANDLE);
    DWORD console_mode, read_count;
    if (GetConsoleMode(input, &console_mode)) {
        if (!ReadConsoleW(input, wide, MAX_INPUT, &read_count, NULL) || read_count == 0)
            return 0;
        line[WideCharToMultiByte(CP_UTF8, 0, wide, (int)read_count, line, size - 1, NULL, NULL)] = '\0';
    } else if (!fgets(line, size, stdin)) {   // 파이프로 입력할 때
        return 0;
    }
    size_t n = strcspn(line, "\r\n");
    while (n > 0 && line[n - 1] == ' ')
        n--;
    line[n] = '\0';
    return 1;
}




// 입력 스레드 (입력을 따로 받아야 치는 중에도 메시지가 뜸)
static DWORD WINAPI keyboard_thread(LPVOID unused)
{
    static char line[4 * MAX_INPUT];
    (void)unused;
    while (read_line(line, sizeof(line))) {
        if (line[0] == '\0')
            continue;
        EnterCriticalSection(&lock);
        handle_input(line);
        LeaveCriticalSection(&lock);
    }
    exit(0);
}




static void ask_line(const char *question, char *answer, int size)
{
    printf("%s", question);
    fflush(stdout);
    if (!read_line(answer, size))
        exit(1);
}




// 내 IP 주소 출력 (다른 사람이 이 주소로 접속)
static void print_my_address(void)
{
    struct sockaddr_in to = {0}, me;
    int len = sizeof(me);
    char ip[INET_ADDRSTRLEN] = "127.0.0.1";
    int sock = (int)socket(AF_INET, SOCK_DGRAM, 0);
    to.sin_family = AF_INET;
    to.sin_port = htons(53);
    inet_pton(AF_INET, "8.8.8.8", &to.sin_addr);
    if (connect(sock, (struct sockaddr *)&to, sizeof(to)) == 0 && getsockname(sock, (struct sockaddr *)&me, &len) == 0)
        inet_ntop(AF_INET, &me.sin_addr, ip, sizeof(ip));
    closesocket(sock);
    print_line("[주소] %s (같은 와이파이에서 이 주소로 접속)", ip);
}




// main
// 신원 키를 읽고 세션 키를 만든다. 방장이면 방을 열고 참가자면 접속해서 HELLO를 보낸다. 그다음 select로 계속 받음

int main(void)
{
    static char args[3][256];
    int arg_count, listen_sock = -1;
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);
    InitializeCriticalSection(&lock);
    SetConsoleOutputCP(CP_UTF8);
    if (sodium_init() < 0) {
        printf("libsodium을 시작하지 못했습니다\n");
        return 1;
    }
    // 빠른 편집 모드 끄기 (켜져 있으면 창 클릭했을 때 멈춤)
    HANDLE console_in = GetStdHandle(STD_INPUT_HANDLE);
    DWORD console_mode;
    if (GetConsoleMode(console_in, &console_mode))
        SetConsoleMode(console_in, (console_mode & ~ENABLE_QUICK_EDIT_MODE) | ENABLE_EXTENDED_FLAGS);
    // 명령줄 인자도 한글 때문에 UTF-8로 변환
    wchar_t **wide_args = CommandLineToArgvW(GetCommandLineW(), &arg_count);
    for (int i = 0; i < arg_count && i < 3; i++)
        WideCharToMultiByte(CP_UTF8, 0, wide_args[i], -1, args[i], sizeof(args[i]), NULL, NULL);

    // 인자 없이 실행하면 이름이랑 방장/참가자를 물어봄, 잘못 입력하면 다시 물어봄
    char answer[256], host[256] = "127.0.0.1";
    for (;;) {
        if (arg_count < 2) {
            ask_line("이름 (한글 5글자까지): ", args[1], sizeof(args[1]));
            ask_line("1. 방장  2. 참가자 : ", answer, sizeof(answer));
            is_host = answer[0] == '1';
            if (!is_host) {
                ask_line("방장 주소 (같은 컴퓨터면 그냥 엔터): ", answer, sizeof(answer));
                strcpy(host, answer[0] ? answer : "127.0.0.1");
            }
        } else {
            is_host = arg_count >= 3 && strcmp(args[2], "--host") == 0;
            if (!is_host && arg_count >= 3)
                strcpy(host, args[2]);
        }
        if (!is_valid_name(args[1]))
            printf("이름은 한글 5글자까지, 공백이나 /, | 없이 입력하세요\n");
        else if (is_host && (listen_sock = open_room(PORT)) < 0)
            printf("%d번 포트로 방을 열 수 없습니다 (이미 방이 열려 있는지 확인)\n", PORT);
        else if (!is_host && (host_conn.sock = connect_to_host(host, PORT)) < 0)
            printf("%s에 접속하지 못했습니다 (주소, 와이파이 확인)\n", host);
        else
            break;
        if (arg_count >= 2)
            return 1;
    }
    strcpy(my_name, args[1]);
    int made = load_identity();
    if (made < 0) {
        printf("신원 키 파일을 읽거나 만들지 못했습니다\n");
        return 1;
    }
    crypto_kx_keypair(my_kx_pk, my_kx_sk);
    hello_make(my_hello, my_name, my_id_pk, my_id_sk, my_kx_pk);
    key_words(my_id_pk, my_words);
    if (is_host) {
        print_line("덜미 - %s (방장)", my_name);
        print_my_address();
        joining = 0;
        my_admitted = 1;
    } else {
        make_packet(&send_pkt, TYPE_HELLO, my_name, "");
        memcpy(send_pkt.body, my_hello, HELLO_BODY);
        send_pkt.body_len = HELLO_BODY;
        send_packet(host_conn.sock, &send_pkt);
        print_line("덜미 - %s (%s에 접속)", my_name, host);
    }
    print_line("[내 단어] %s%s", my_words, made ? " (신원 키를 새로 만들었습니다)" : "");
    print_line("명령어: /dm 이름(1:1 대화), /all(전체 대화), /who(접속자), /ok 이름(승인), /verify 이름(단어), /check(장부 대조),");
    print_line("        /eye(카메라 지킴이 켜고 끄기), /trace 새어 나간 줄(누구 화면인지 찾기), /quit(나가기)");
    print_line("[알림] 받은 글은 사람마다 띄어쓰기가 조금씩 다르게 보입니다 · 캡처가 새면 보낸 사람이 /trace로 누구 화면인지 찾습니다");
    CloseHandle(CreateThread(NULL, 0, keyboard_thread, NULL, 0, NULL));

    for (;;) {
        fd_set fds;
        struct timeval one_second = { 1, 0 };
        int main_sock = is_host ? listen_sock : host_conn.sock, n;
        FD_ZERO(&fds);
        FD_SET(main_sock, &fds);
        EnterCriticalSection(&lock);
        n = client_count;
        for (int i = 0; i < n; i++)
            FD_SET(clients[i].conn.sock, &fds);
        int eye = eye_sock;
        if (eye >= 0)
            FD_SET(eye, &fds);
        LeaveCriticalSection(&lock);
        int ready = select(0, &fds, NULL, NULL, &one_second);
        EnterCriticalSection(&lock);
        if (ready > 0) {
            for (int i = n - 1; i >= 0; i--)   // 뒤에서부터 돌아야 중간에 누가 나가도 안 꼬임
                if (FD_ISSET(clients[i].conn.sock, &fds))
                    read_from_client(i);
            if (FD_ISSET(main_sock, &fds) && !is_host)
                read_from_host();
            else if (FD_ISSET(main_sock, &fds)) {   // 새로 접속한 사람
                int sock = (int)accept(listen_sock, NULL, NULL);
                if (sock >= 0 && client_count < MAX_PEOPLE) {
                    memset(&clients[client_count], 0, sizeof(clients[0]));
                    clients[client_count++].conn.sock = sock;
                } else
                    closesocket(sock);
            }
            if (eye >= 0 && eye == eye_sock && FD_ISSET(eye, &fds))
                read_eye();
        }
        tick();
        check_eye();
        LeaveCriticalSection(&lock);
    }
}
#endif
