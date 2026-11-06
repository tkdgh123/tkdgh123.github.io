/* 패킷 송수신 확인 (헤더 65바이트: 번호 8 + nonce 24 포함). 방장(deolmi H --host)이 켜져 있어야 한다 — tests\run.bat 이 알아서 켠다
   ① 1바이트씩 쪼개 보내기  ② 두 통을 한 번에  ③ 길이 0xFFFFFFFF */
#define NET_ONLY   /* deolmi.c 에서 ① 통신 부분만 가져온다 */
#include "../deolmi.c"
#define usleep(us) Sleep((us) / 1000)

static struct packet out, in;
static struct connection rb;   /* B가 받는 버퍼 */
static uint8_t raw[2 * MAX_PACKET];
static int fails;

static void check(int ok, const char *what)
{
    printf("%s %s\n", ok ? "[ok]  " : "[FAIL]", what);
    if (!ok)
        fails++;
}

static void make(const char *text)
{
    memset(&out, 0, sizeof(out));
    out.type = TYPE_MESSAGE;
    strcpy(out.from, "A");
    strcpy(out.to, "B");
    out.seq = 7;
    memset(out.nonce, 0xAB, NONCE_LEN);
    out.body_len = (uint32_t)strlen(text);
    memcpy(out.body, text, out.body_len);
}

/* 방장에게 이름 등록 (서명한 HELLO) */
static void hello(int fd, const char *name)
{
    struct packet *h = &in;
    uint8_t id_pk[KEY_LEN], id_sk[ID_SK_LEN], kx_pk[KEY_LEN], kx_sk[KEY_LEN];
    crypto_sign_keypair(id_pk, id_sk);
    crypto_kx_keypair(kx_pk, kx_sk);
    memset(h, 0, sizeof(*h));
    h->type = TYPE_HELLO;
    strcpy(h->from, name);
    hello_make(h->body, name, id_pk, id_sk, kx_pk);
    h->body_len = HELLO_BODY;
    send_packet(fd, h);
}

/* B에서 MSG 하나를 받아 from·to·seq·nonce·body가 맞는지. 방장이 보낸 HELLO, SYS는 건너뜀 */
static int got(const char *text)
{
    int r;
    do {
        while ((r = take_packet(&rb, &in)) == 0)
            if (receive_bytes(&rb) <= 0)
                return 0;   /* 1초 안에 안 오면 실패 */
    } while (r == 1 && in.type != TYPE_MESSAGE);
    return r == 1 && strcmp(in.from, "A") == 0 && strcmp(in.to, "B") == 0
        && in.seq == 7 && in.nonce[0] == 0xAB && in.nonce[NONCE_LEN - 1] == 0xAB
        && in.body_len == strlen(text) && memcmp(in.body, text, in.body_len) == 0;
}

int main(void)
{
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);
    if (sodium_init() < 0)
        return 1;
    int a = connect_to_host("127.0.0.1", 9000);
    int b = connect_to_host("127.0.0.1", 9000);
    if (a < 0 || b < 0) {
        printf("방장을 먼저 켜세요: deolmi H --host\n");
        return 1;
    }
    DWORD tv = 1000;   /* 1초 */
    setsockopt(b, SOL_SOCKET, SO_RCVTIMEO, (const char *)&tv, sizeof(tv));
    rb.sock = b;
    hello(a, "A");
    hello(b, "B");
    usleep(100000);   /* 방장이 두 명을 다 받을 때까지 */

    /* ① 1바이트씩 */
    make("1바이트씩 쪼개서 보냄");
    size_t n = packet_to_bytes(&out, raw);
    for (size_t i = 0; i < n; i++) {
        send(a, (const char *)raw + i, 1, 0);
        usleep(200);
    }
    check(got("1바이트씩 쪼개서 보냄"), "① 1바이트씩 쪼개 보내도 한 통으로 받음");

    /* ② 두 통을 send 한 번에 */
    make("첫째");
    n = packet_to_bytes(&out, raw);
    make("둘째");
    n += packet_to_bytes(&out, raw + n);
    send(a, (const char *)raw, (int)n, 0);
    check(got("첫째") && got("둘째"), "② 붙어서 온 두 통을 따로 꺼냄");

    /* ③ 길이 0xFFFFFFFF → C만 끊기고 나머지는 그대로 */
    int c = connect_to_host("127.0.0.1", 9000);   /* 앞의 패킷을 받지 않게 지금 접속 */
    setsockopt(c, SOL_SOCKET, SO_RCVTIMEO, (const char *)&tv, sizeof(tv));
    usleep(100000);
    uint8_t bad[4] = { 0xFF, 0xFF, 0xFF, 0xFF };
    send(c, (const char *)bad, 4, 0);
    char tmp;
    check(recv(c, &tmp, 1, 0) == 0, "③ 잘못된 길이를 보낸 C가 끊김");
    make("C가 나가도 됨");
    send_packet(a, &out);
    check(got("C가 나가도 됨"), "③ A → B는 계속 됨");

    /* 빈 body도 */
    make("");
    send_packet(a, &out);
    check(got(""), "body 0바이트");

    closesocket(a);
    closesocket(b);
    closesocket(c);
    printf(fails ? "\n%d개 실패\n" : "\n전부 통과\n", fails);
    return fails != 0;
}
