/* 키 부분 확인 (방장 없이 돈다): 단어 지문, 서명한 HELLO, 방향별 키, 래칫 암호화, 장부 해시 */
#define NET_ONLY   /* deolmi.c 에서 통신·키 부분만 가져온다 */
#include "../deolmi.c"

static int fails;

static void check(int ok, const char *what)
{
    printf("%s %s\n", ok ? "[ok]  " : "[FAIL]", what);
    if (!ok)
        fails++;
}

static struct packet p, q;
static uint8_t text[MAX_BODY];

static void msg(uint64_t seq)
{
    memset(&p, 0, sizeof(p));
    p.type = 2;
    strcpy(p.from, "수빈");
    strcpy(p.to, "민지");
    p.seq = seq;
}

int main(void)
{
    uint8_t id_pk[KEY_LEN], id_sk[ID_SK_LEN], id2_pk[KEY_LEN], id2_sk[ID_SK_LEN];
    uint8_t a_pk[KEY_LEN], a_sk[KEY_LEN], b_pk[KEY_LEN], b_sk[KEY_LEN];
    uint8_t a_send[KEY_LEN], a_recv[KEY_LEN], b_send[KEY_LEN], b_recv[KEY_LEN], saved[KEY_LEN];
    uint8_t hello[HELLO_BODY];
    char w1[WORDS_LEN], w2[WORDS_LEN];

    if (sodium_init() < 0)
        return 1;
    crypto_sign_keypair(id_pk, id_sk);
    crypto_sign_keypair(id2_pk, id2_sk);

    /* 단어 지문 */
    key_words(id_pk, w1);
    key_words(id_pk, w2);
    check(strcmp(w1, w2) == 0, "같은 신원 키 → 늘 같은 단어");
    int dashes = 0;
    for (char *c = w1; *c; c++)
        dashes += *c == '-';
    check(dashes == 7, "단어는 8개");
    key_words(id2_pk, w2);
    check(strcmp(w1, w2) != 0, "다른 신원 키 → 다른 단어");

    /* 서명한 HELLO */
    crypto_kx_keypair(a_pk, a_sk);
    crypto_kx_keypair(b_pk, b_sk);
    hello_make(hello, "수빈", id_pk, id_sk, a_pk);
    check(hello_ok("수빈", hello, HELLO_BODY), "제대로 만든 HELLO는 통과");
    check(!hello_ok("민지", hello, HELLO_BODY), "이름만 바꿔 붙이면 서명이 안 맞음");
    hello[KEY_LEN] ^= 1;
    check(!hello_ok("수빈", hello, HELLO_BODY), "세션 키만 바꿔치기하면 서명이 안 맞음");
    hello[KEY_LEN] ^= 1;
    check(!hello_ok("수빈", hello, HELLO_BODY - 1), "길이가 틀리면 거절");

    /* 방향별 시작 키: 내 보내기 = 상대 받기 */
    check(start_keys(a_pk, a_sk, b_pk, a_send, a_recv) == 0 && start_keys(b_pk, b_sk, a_pk, b_send, b_recv) == 0,
          "두 사람 다 시작 키 계산");
    check(memcmp(a_send, b_recv, KEY_LEN) == 0 && memcmp(a_recv, b_send, KEY_LEN) == 0 && memcmp(a_send, a_recv, KEY_LEN) != 0,
          "A의 보내기 키 = B의 받기 키, 방향마다 다름");

    /* 래칫 암호화 */
    const char *hi = "안녕 민지";
    msg(1);
    seal_packet(a_send, &p, (const uint8_t *)hi, strlen(hi));
    check(p.body_len == strlen(hi) + TAG_LEN, "암호문 = 평문 + 태그 16바이트");
    check(memcmp(p.body, hi, strlen(hi)) != 0, "암호문에 평문이 그대로 없음");
    int n = open_packet(b_recv, 0, &p, text);
    check(n == (int)strlen(hi) && memcmp(text, hi, n) == 0, "B가 열면 원래 글");
    check(open_packet(b_recv, 0, &p, text) < 0, "열고 나면 키가 돌아서 같은 통은 다시 못 엶");

    msg(2);
    seal_packet(a_send, &p, (const uint8_t *)"둘째", 6);
    q = p;
    q.body[3] ^= 1;
    memcpy(saved, b_recv, KEY_LEN);
    check(open_packet(b_recv, 0, &q, text) < 0, "1바이트 바뀐 암호문은 안 열림");
    check(memcmp(saved, b_recv, KEY_LEN) == 0, "안 열리면 키를 안 돌림");
    q = p;
    strcpy(q.to, "현우");
    check(open_packet(b_recv, 0, &q, text) < 0, "헤더의 받을 사람을 바꿔도 안 열림 (AD로 묶임)");
    q = p;
    q.seq = 9;
    check(open_packet(b_recv, 0, &q, text) < 0, "헤더의 번호를 바꿔도 안 열림");
    check(open_packet(b_recv, 0, &p, text) == 6, "진짜 둘째는 그대로 열림");

    msg(3);
    seal_packet(a_send, &p, (const uint8_t *)"셋째", 6);
    msg(4);
    seal_packet(a_send, &p, (const uint8_t *)"넷째", 6);
    check(open_packet(b_recv, 1, &p, text) == 6 && memcmp(text, "넷째", 6) == 0, "셋째가 빠져도 키를 건너뛰어 넷째는 열림");
    check(open_packet(b_recv, MAX_SKIP + 1, &p, text) < 0, "너무 많이 건너뛰라고 하면 거절");

    /* 장부 해시 */
    uint8_t zero[KEY_LEN] = {0}, h1[KEY_LEN], h1b[KEY_LEN], h2[KEY_LEN], h2b[KEY_LEN];
    ledger_next(zero, 1, (const uint8_t *)"3시에 만나", 14, h1);
    ledger_next(zero, 1, (const uint8_t *)"3시에 만나", 14, h1b);
    check(memcmp(h1, h1b, KEY_LEN) == 0, "같은 글 → 같은 장부 값");
    ledger_next(zero, 1, (const uint8_t *)"4시에 만나", 14, h1b);
    check(memcmp(h1, h1b, KEY_LEN) != 0, "한 글자만 달라도 장부 값이 다름");
    ledger_next(zero, 2, (const uint8_t *)"3시에 만나", 14, h1b);
    check(memcmp(h1, h1b, KEY_LEN) != 0, "번호가 다르면 장부 값이 다름");
    ledger_next(h1, 2, (const uint8_t *)"좋아", 6, h2);
    ledger_next(h1b, 2, (const uint8_t *)"좋아", 6, h2b);
    check(memcmp(h2, h2b, KEY_LEN) != 0, "앞에서 한 번 달라지면 뒤 값도 계속 다름 (사슬)");

    printf(fails ? "\n%d개 실패\n" : "\n전부 통과\n", fails);
    return fails != 0;
}
