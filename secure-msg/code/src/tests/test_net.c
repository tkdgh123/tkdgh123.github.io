/* 패킷 송수신 확인 (설명서 '단계와 확인'의 S3). 서버(./deolmi --server)가 켜져 있어야 한다 — make test 가 알아서 켠다
   ① 1바이트씩 쪼개 보내기  ② 두 통을 한 번에  ③ 길이 0xFFFFFFFF */
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/time.h>
#define NET_ONLY   /* deolmi.c 에서 ① 통신 부분만 가져온다 */
#include "../deolmi.c"

static struct packet out, in;
static struct conn rb;   /* B가 받는 버퍼 */
static uint8_t raw[2 * PKT_MAX];
static int fails;

static void check(int ok, const char *what)
{
    printf("%s %s\n", ok ? "[ok]  " : "[FAIL]", what);
    if (!ok)
        fails++;
}

static void make(uint64_t seq, const char *text)
{
    memset(&out, 0, sizeof(out));
    out.type = T_MSG;
    strcpy(out.from, "A");
    strcpy(out.to, "B");
    out.seq = seq;
    for (int i = 0; i < NONCE_LEN; i++)
        out.nonce[i] = (uint8_t)i;
    out.body_len = strlen(text);
    memcpy(out.body, text, out.body_len);
}

/* 서버에 이름 등록 (body는 아무 128바이트) */
static void hello(int fd, const char *name)
{
    struct packet *h = &in;
    memset(h, 0, sizeof(*h));
    h->type = T_HELLO;
    strcpy(h->from, name);
    h->body_len = HELLO_LEN;
    send_packet(fd, h);
}

/* B에서 MSG 하나를 받아 seq와 body가 맞는지. 서버가 보낸 HELLO, SYS는 건너뜀 */
static int got(uint64_t seq, const char *text)
{
    int r;
    do {
        while ((r = conn_take(&rb, &in)) == 0)
            if (conn_read(&rb) <= 0)
                return 0;   /* 1초 안에 안 오면 실패 */
    } while (r == 1 && in.type != T_MSG);
    return r == 1 && strcmp(in.from, "A") == 0 && strcmp(in.to, "B") == 0
        && in.seq == seq && in.nonce[23] == 23
        && in.body_len == strlen(text) && memcmp(in.body, text, in.body_len) == 0;
}

int main(void)
{
    int a = net_connect("127.0.0.1", 9000);
    int b = net_connect("127.0.0.1", 9000);
    if (a < 0 || b < 0) {
        printf("서버를 먼저 켜세요: ./deolmi --server\n");
        return 1;
    }
    struct timeval tv = { 1, 0 };
    setsockopt(b, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    rb.fd = b;
    hello(a, "A");
    hello(b, "B");
    usleep(100000);   /* 서버가 두 명을 다 받을 때까지 */

    /* ① 1바이트씩 */
    make(1ULL << 40 | 7, "1바이트씩 쪼개서 보냄");
    size_t n = pack_packet(&out, raw);
    for (size_t i = 0; i < n; i++) {
        send(a, raw + i, 1, 0);
        usleep(200);
    }
    check(got(1ULL << 40 | 7, "1바이트씩 쪼개서 보냄"), "① 1바이트씩 쪼개 보내도 한 통으로 받음 (seq 큰 수 포함)");

    /* ② 두 통을 send 한 번에 */
    make(2, "첫째");
    n = pack_packet(&out, raw);
    make(3, "둘째");
    n += pack_packet(&out, raw + n);
    send(a, raw, n, 0);
    check(got(2, "첫째") && got(3, "둘째"), "② 붙어서 온 두 통을 따로 꺼냄");

    /* ③ 길이 0xFFFFFFFF → C만 끊기고 나머지는 그대로 */
    int c = net_connect("127.0.0.1", 9000);   /* 앞의 패킷을 받지 않게 지금 접속 */
    setsockopt(c, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    usleep(100000);
    uint8_t bad[4] = { 0xFF, 0xFF, 0xFF, 0xFF };
    send(c, bad, 4, 0);
    char tmp;
    check(recv(c, &tmp, 1, 0) == 0, "③ 잘못된 길이를 보낸 C가 끊김");
    make(4, "C가 나가도 됨");
    send_packet(a, &out);
    check(got(4, "C가 나가도 됨"), "③ A → B는 계속 됨");

    /* 빈 body도 */
    make(5, "");
    send_packet(a, &out);
    check(got(5, ""), "body 0바이트");

    close(a);
    close(b);
    close(c);
    printf(fails ? "\n%d개 실패\n" : "\n전부 통과\n", fails);
    return fails != 0;
}
