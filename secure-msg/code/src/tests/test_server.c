/* 방장 중계 확인 . 방장(deolmi H --host)이 켜져 있어야 한다 — tests\run.bat 이 알아서 켠다
   HELLO 등록·전달, to로 중계, 입장·퇴장 SYS, 처리 규칙, 인원 제한 없음 */
#define NET_ONLY   /* deolmi.c 에서 ① 통신 부분만 가져온다 */
#include "../deolmi.c"
#define usleep(us) Sleep((us) / 1000)

#define MAX_GOT 32

struct got {             /* 받은 패킷을 간단히 적어 둔 것 */
    int     type;
    char    from[NAME_LEN], to[NAME_LEN];
    char    text[256];   /* MSG, SYS body */
    uint64_t seq;
};

struct user {
    struct connection c;
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
    pkt.type = (uint8_t)type;
    strcpy(pkt.from, from);
    strcpy(pkt.to, to);
    pkt.body_len = (uint32_t)strlen(text);
    memcpy(pkt.body, text, pkt.body_len);
}

static void open_user(struct user *u)
{
    memset(u, 0, sizeof(*u));
    u->c.sock = connect_to_host("127.0.0.1", 9000);
    DWORD tv = 300;   /* 0.3초 동안 아무것도 안 오면 다 받은 것 */
    setsockopt(u->c.sock, SOL_SOCKET, SO_RCVTIMEO, (const char *)&tv, sizeof(tv));
}

/* 서명한 HELLO. bad면 서명을 1바이트 망가뜨린다 */
static void join_with(struct user *u, const char *name, int bad)
{
    uint8_t id_pk[KEY_LEN], id_sk[ID_SK_LEN], kx_pk[KEY_LEN], kx_sk[KEY_LEN];
    crypto_sign_keypair(id_pk, id_sk);
    crypto_kx_keypair(kx_pk, kx_sk);
    open_user(u);
    make(TYPE_HELLO, name, "", "");
    hello_make(pkt.body, name, id_pk, id_sk, kx_pk);
    pkt.body_len = HELLO_BODY;
    pkt.body[HELLO_BODY - 1] ^= (uint8_t)bad;
    send_packet(u->c.sock, &pkt);
}

static void join(struct user *u, const char *name)
{
    join_with(u, name, 0);
}

/* 지금까지 온 패킷을 전부 받아 적는다 */
static void collect(struct user *u)
{
    for (;;) {
        int r;
        while ((r = take_packet(&u->c, &pkt)) == 1 && u->ng < MAX_GOT) {
            struct got *g = &u->g[u->ng++];
            g->type = pkt.type;
            memcpy(g->from, pkt.from, NAME_LEN);
            memcpy(g->to, pkt.to, NAME_LEN);
            g->seq = pkt.seq;
            size_t n = pkt.body_len < sizeof(g->text) - 1 ? pkt.body_len : sizeof(g->text) - 1;
            memcpy(g->text, pkt.body, n);
            g->text[n] = '\0';
        }
        if (r < 0)
            return;
        int n = receive_bytes(&u->c);
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
        if (all[i]->c.sock > 0 && !all[i]->closed) {
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

static int has_hello(struct user *u, const char *from)
{
    return count(u, TYPE_HELLO, from) > 0;
}

static int has_sys(struct user *u, const char *text)
{
    for (int i = 0; i < u->ng; i++)
        if (u->g[i].type == TYPE_NOTICE && strstr(u->g[i].text, text))
            return 1;
    return 0;
}

int main(void)
{
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);
    if (sodium_init() < 0)
        return 1;
    join(&A, "A");
    if (A.c.sock < 0) {
        printf("방장을 먼저 켜세요: deolmi H --host\n");
        return 1;
    }
    usleep(50000);
    join(&B, "B");
    usleep(50000);
    join(&C, "C");
    collect_all();
    /* 새로 들어온 사람은 이미 있던 사람들(방장 H 포함)의 HELLO를, 있던 사람은 새로 온 사람의 HELLO를 받는다 */
    check(has_hello(&C, "A") && has_hello(&C, "B") && has_hello(&C, "H") && count(&C, TYPE_HELLO, NULL) == 3,
          "C가 이미 있던 A, B와 방장 H의 HELLO를 받음");
    int seq_ok = 1, last_hello = -1;
    for (int i = 0; i < C.ng; i++)
        if (C.g[i].type == TYPE_HELLO) {
            seq_ok &= C.g[i].seq == (strcmp(C.g[i].from, "H") == 0 ? 2u : 1u);
            last_hello = i;
        }
    check(seq_ok && last_hello >= 0 && strcmp(C.g[last_hello].from, "H") == 0,
          "이미 있던 사람 HELLO는 seq 1, 방장 HELLO는 마지막에 seq 2");
    check(has_hello(&B, "A") && has_hello(&B, "H") && has_hello(&B, "C") && count(&B, TYPE_HELLO, NULL) == 3 && has_sys(&B, "C 입장"),
          "B는 A, H의 HELLO와 뒤에 온 C의 HELLO(입장 심사용)를 받음");
    check(has_hello(&A, "H") && has_hello(&A, "B") && has_hello(&A, "C") && count(&A, TYPE_HELLO, NULL) == 3,
          "A는 H와 뒤에 온 B, C의 HELLO를 받음");
    check(has_sys(&A, "C 입장") && has_sys(&B, "C 입장") && has_sys(&C, "C 입장"), "전원에게 SYS \"C 입장\"");

    join(&D, "B");
    collect_all();
    check(has_sys(&D, "이름 사용 중") && D.closed, "같은 이름 B는 거절하고 끊음");
    check(count(&A, TYPE_HELLO, NULL) == 0 && count(&A, TYPE_NOTICE, NULL) == 0, "거절된 사람은 남에게 알려지지 않음");

    join(&D, "H");
    collect_all();
    check(has_sys(&D, "이름 사용 중") && D.closed, "방장 이름 H로도 못 들어옴");

    make(TYPE_MESSAGE, "A", "H", "방장에게");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(count(&A, TYPE_NOTICE, NULL) == 0 && count(&B, TYPE_MESSAGE, NULL) == 0 && count(&C, TYPE_MESSAGE, NULL) == 0,
          "방장에게 보낸 MSG는 방장이 받고 다른 사람에게 안 감");

    make(TYPE_MESSAGE, "A", "B", "B에게만");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(count(&B, TYPE_MESSAGE, "A") == 1 && strcmp(B.g[0].text, "B에게만") == 0, "A → B MSG가 B에게 감");
    check(count(&C, TYPE_MESSAGE, NULL) == 0 && count(&A, TYPE_MESSAGE, NULL) == 0, "C와 A 자신은 못 받음");

    make(TYPE_MESSAGE, "A", "", "모두에게");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(count(&B, TYPE_MESSAGE, NULL) == 0 && count(&C, TYPE_MESSAGE, NULL) == 0,
          "받을 사람이 빈 MSG는 아무에게도 안 감 (암호화 뒤엔 사람마다 한 통)");

    make(TYPE_APPROVE, "A", "B", "승인");
    send_packet(A.c.sock, &pkt);
    make(TYPE_LEDGER, "A", "C", "장부");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(count(&B, TYPE_APPROVE, "A") == 1 && count(&C, TYPE_LEDGER, "A") == 1, "APPROVE, LEDGER도 받을 사람에게 그대로");

    make(TYPE_HELLO, "A", "", "");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(has_sys(&A, "HELLO는 한 번만") && !A.closed && count(&B, TYPE_HELLO, NULL) == 0, "HELLO를 또 보내면 무시하고 알림");

    make(TYPE_MESSAGE, "A", "Z", "없는 사람");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(has_sys(&A, "Z는 접속해 있지 않습니다"), "없는 이름에게 보내면 SYS");

    make(TYPE_MESSAGE, "B", "C", "A가 B인 척");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(has_sys(&A, "이름이 다릅니다") && count(&C, TYPE_MESSAGE, NULL) == 0, "남의 이름으로 보내면 버리고 SYS");

    make(9, "A", "B", "");
    send_packet(A.c.sock, &pkt);
    make(TYPE_NOTICE, "A", "B", "가짜 방장 알림");
    send_packet(A.c.sock, &pkt);
    collect_all();
    check(count(&A, TYPE_NOTICE, NULL) == 2 && has_sys(&A, "모르는 type") && count(&B, TYPE_NOTICE, NULL) == 0,
          "모르는 type, 클라가 보낸 SYS는 버리고 SYS");
    check(!A.closed, "그래도 A 연결은 유지");

    open_user(&E);
    make(TYPE_MESSAGE, "E", "A", "등록 안 하고 보냄");
    send_packet(E.c.sock, &pkt);
    collect_all();
    check(has_sys(&E, "먼저 HELLO") && E.closed && count(&A, TYPE_MESSAGE, NULL) == 0, "HELLO 전에 다른 패킷이면 SYS 후 끊음");

    join(&F, "");
    collect_all();
    check(has_sys(&F, "이름 사용 중") && F.closed, "빈 이름은 거절");

    join_with(&F, "F", 1);
    collect_all();
    check(has_sys(&F, "서명이 맞지 않습니다") && F.closed && count(&A, TYPE_HELLO, NULL) == 0, "서명이 틀린 HELLO는 거절, 남에게 안 알림");

    closesocket(C.c.sock);
    C.closed = 1;
    collect_all();
    check(has_sys(&A, "C 퇴장") && has_sys(&B, "C 퇴장"), "C가 나가면 전원에게 SYS \"C 퇴장\"");

    join(&C, "C");
    collect_all();
    check(has_sys(&A, "C 입장") && has_hello(&C, "A") && has_hello(&C, "B"),
          "나갔던 이름 C로 다시 들어올 수 있음");

    /* 인원 제한 없음: A, B, C에 17명이 더 들어와 20명이어도 다 받는다 */
    static struct user many[17];
    char name[NAME_LEN];
    for (int i = 0; i < 17; i++) {
        sprintf(name, "u%d", i);
        join(&many[i], name);
        usleep(20000);
    }
    usleep(100000);
    collect(&many[16]);
    check(!many[16].closed && has_hello(&many[16], "A") && has_hello(&many[16], "u15"), "20명째도 들어옴");

    printf(fails ? "\n%d개 실패\n" : "\n전부 통과\n", fails);
    return fails != 0;
}
