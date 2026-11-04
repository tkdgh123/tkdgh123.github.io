/* 방장 중계 확인 (설명서 '만든 순서와 확인'의 S4). 방장(./deolmi H --host)이 켜져 있어야 한다 — make test 가 알아서 켠다
   HELLO 등록·전달, to로 중계, 입장·퇴장 SYS, 처리 규칙 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/time.h>
#define NET_ONLY   /* deolmi.c 에서 ① 통신 부분만 가져온다 */
#include "../deolmi.c"

#define MAX_GOT 32

struct got {             /* 받은 패킷을 간단히 적어 둔 것 */
    int     type;
    char    from[NAME_LEN];
    uint8_t tag;         /* HELLO body 첫 바이트 */
    char    text[256];   /* MSG, SYS body */
};

struct user {
    struct conn c;
    struct got  g[MAX_GOT];
    int         ng;
    int         closed;  /* 방장이 연결을 끊었나 */
};

static struct user A, B, C, D, E, F;
static struct packet pkt;
static int fails;

static void check(int ok, const char *what)
{
    printf("%s %s\n", ok ? "[ok]  " : "[FAIL]", what);
    if (!ok)
        fails++;
}

static void make(int type, const char *from, const char *to, const char *text)
{
    memset(&pkt, 0, sizeof(pkt));
    pkt.type = type;
    strcpy(pkt.from, from);
    strcpy(pkt.to, to);
    pkt.body_len = strlen(text);
    memcpy(pkt.body, text, pkt.body_len);
}

static void open_user(struct user *u)
{
    memset(u, 0, sizeof(*u));
    u->c.fd = net_connect("127.0.0.1", 9000);
    struct timeval tv = { 0, 300000 };   /* 0.3초 동안 아무것도 안 오면 다 받은 것 */
    setsockopt(u->c.fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
}

/* HELLO body는 tag 바이트로 채운다. 누구 HELLO가 전달됐는지 알아보려고 */
static void join(struct user *u, const char *name, uint8_t tag)
{
    open_user(u);
    make(T_HELLO, name, "", "");
    pkt.body_len = HELLO_LEN;
    memset(pkt.body, tag, HELLO_LEN);
    send_packet(u->c.fd, &pkt);
}

/* 지금까지 온 패킷을 전부 받아 적는다 */
static void collect(struct user *u)
{
    for (;;) {
        int r;
        while ((r = conn_take(&u->c, &pkt)) == 1 && u->ng < MAX_GOT) {
            struct got *g = &u->g[u->ng++];
            g->type = pkt.type;
            memcpy(g->from, pkt.from, NAME_LEN);
            g->tag = pkt.body[0];
            size_t n = pkt.body_len < sizeof(g->text) - 1 ? pkt.body_len : sizeof(g->text) - 1;
            memcpy(g->text, pkt.body, n);
            g->text[n] = '\0';
        }
        if (r < 0)
            return;
        int n = conn_read(&u->c);
        if (n == 0)
            u->closed = 1;
        if (n <= 0)
            return;
    }
}

static void collect_all(void)
{
    usleep(100000);
    struct user *all[] = { &A, &B, &C, &D, &E, &F };
    for (int i = 0; i < 6; i++)
        if (all[i]->c.fd > 0 && !all[i]->closed) {
            all[i]->ng = 0;
            collect(all[i]);
        }
}

static int count(struct user *u, int type, const char *from)
{
    int n = 0;
    for (int i = 0; i < u->ng; i++)
        if (u->g[i].type == type && (from == NULL || strcmp(u->g[i].from, from) == 0))
            n++;
    return n;
}

static int has_hello(struct user *u, const char *from, uint8_t tag)
{
    for (int i = 0; i < u->ng; i++)
        if (u->g[i].type == T_HELLO && strcmp(u->g[i].from, from) == 0 && u->g[i].tag == tag)
            return 1;
    return 0;
}

static int has_sys(struct user *u, const char *text)
{
    for (int i = 0; i < u->ng; i++)
        if (u->g[i].type == T_SYS && strstr(u->g[i].text, text))
            return 1;
    return 0;
}

int main(void)
{
    join(&A, "A", 'a');
    if (A.c.fd < 0) {
        printf("방장을 먼저 켜세요: ./deolmi H --host\n");
        return 1;
    }
    usleep(50000);
    join(&B, "B", 'b');
    usleep(50000);
    join(&C, "C", 'c');
    collect_all();
    /* 방장 H도 방에 있는 한 사람이라 H의 HELLO(본문 0)도 온다 */
    check(has_hello(&A, "B", 'b') && has_hello(&A, "C", 'c') && has_hello(&A, "H", 0) && count(&A, T_HELLO, NULL) == 3,
          "A가 B, C와 방장 H의 HELLO를 받음");
    check(has_hello(&B, "A", 'a') && has_hello(&B, "C", 'c') && has_hello(&B, "H", 0) && count(&B, T_HELLO, NULL) == 3,
          "B가 A, C와 방장 H의 HELLO를 받음");
    check(has_hello(&C, "A", 'a') && has_hello(&C, "B", 'b') && has_hello(&C, "H", 0) && count(&C, T_HELLO, NULL) == 3,
          "C가 A, B와 방장 H의 HELLO를 받음");
    check(has_sys(&A, "C 입장") && has_sys(&B, "C 입장") && has_sys(&C, "C 입장"), "전원에게 SYS \"C 입장\"");

    join(&D, "B", 'd');
    collect_all();
    check(has_sys(&D, "이름 사용 중") && D.closed, "같은 이름 B는 거절하고 끊음");
    check(count(&A, T_HELLO, NULL) == 0 && count(&A, T_SYS, NULL) == 0, "거절된 사람은 남에게 알려지지 않음");

    join(&D, "H", 'd');
    collect_all();
    check(has_sys(&D, "이름 사용 중") && D.closed, "방장 이름 H로도 못 들어옴");

    make(T_MSG, "A", "H", "방장에게");
    send_packet(A.c.fd, &pkt);
    collect_all();
    check(count(&A, T_SYS, NULL) == 0 && count(&B, T_MSG, NULL) == 0 && count(&C, T_MSG, NULL) == 0,
          "방장에게 보낸 MSG는 방장이 받고 다른 사람에게 안 감");

    make(T_MSG, "A", "B", "B에게만");
    send_packet(A.c.fd, &pkt);
    collect_all();
    check(count(&B, T_MSG, "A") == 1 && strcmp(B.g[0].text, "B에게만") == 0, "A → B MSG가 B에게 감");
    check(count(&C, T_MSG, NULL) == 0 && count(&A, T_MSG, NULL) == 0, "C와 A 자신은 못 받음");

    make(T_VAULT, "A", "C", "금고 묶음");
    send_packet(A.c.fd, &pkt);
    collect_all();
    check(count(&C, T_VAULT, "A") == 1, "MSG가 아닌 type(VAULT)도 to에게 그대로");

    make(T_MSG, "A", "Z", "없는 사람");
    send_packet(A.c.fd, &pkt);
    collect_all();
    check(has_sys(&A, "Z는 접속해 있지 않습니다"), "없는 이름에게 보내면 SYS");

    make(T_MSG, "B", "C", "A가 B인 척");
    send_packet(A.c.fd, &pkt);
    collect_all();
    check(has_sys(&A, "이름이 다릅니다") && count(&C, T_MSG, NULL) == 0, "남의 이름으로 보내면 버리고 SYS");

    make(9, "A", "B", "");
    send_packet(A.c.fd, &pkt);
    make(T_SYS, "A", "B", "가짜 방장 알림");
    send_packet(A.c.fd, &pkt);
    collect_all();
    check(count(&A, T_SYS, NULL) == 2 && has_sys(&A, "모르는 type") && count(&B, T_SYS, NULL) == 0,
          "모르는 type, 클라가 보낸 SYS는 버리고 SYS");
    check(!A.closed, "그래도 A 연결은 유지");

    open_user(&E);
    make(T_MSG, "E", "A", "등록 안 하고 보냄");
    send_packet(E.c.fd, &pkt);
    collect_all();
    check(has_sys(&E, "먼저 HELLO") && E.closed && count(&A, T_MSG, NULL) == 0, "HELLO 전에 다른 패킷이면 SYS 후 끊음");

    open_user(&F);
    make(T_HELLO, "F", "", "짧은 HELLO");
    send_packet(F.c.fd, &pkt);
    collect_all();
    check(has_sys(&F, "HELLO 길이") && F.closed, "HELLO 길이가 128이 아니면 끊음");

    join(&F, "", 'f');
    collect_all();
    check(has_sys(&F, "이름 사용 중") && F.closed, "빈 이름은 거절");

    close(C.c.fd);
    C.closed = 1;
    collect_all();
    check(has_sys(&A, "C 퇴장") && has_sys(&B, "C 퇴장"), "C가 나가면 전원에게 SYS \"C 퇴장\"");

    join(&C, "C", 'k');
    collect_all();
    check(has_hello(&A, "C", 'k') && has_hello(&C, "A", 'a') && has_hello(&C, "B", 'b'),
          "나갔던 이름 C로 다시 들어올 수 있음");

    /* 지금 A, B, C 3명. 13명 더 들어오면 16명, 그다음 사람은 거절 */
    static struct user many[14];
    char name[NAME_LEN];
    for (int i = 0; i < 14; i++) {
        sprintf(name, "u%d", i);
        join(&many[i], name, 'm');
        usleep(20000);
    }
    usleep(100000);
    collect(&many[12]);
    collect(&many[13]);
    check(!many[12].closed && has_hello(&many[12], "A", 'a'), "16번째까지 들어옴");
    check(has_sys(&many[13], "꽉 찼습니다") && many[13].closed, "17번째는 \"꽉 찼습니다\"를 받고 끊김");

    printf(fails ? "\n%d개 실패\n" : "\n전부 통과\n", fails);
    return fails != 0;
}
