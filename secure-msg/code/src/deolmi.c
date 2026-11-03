/* 덜미 — 프밍기2 메신저. 이 파일 하나가 프로그램 전부다 (평문 단계).

   빌드:  gcc -Wall -Wextra -o deolmi deolmi.c      (또는 make)

   ./deolmi --server          서버 — 중계만 한다 (오가는 패킷이 서버 창에 한 줄씩 보인다)
   ./deolmi 이름 --host       방장 — 서버 없이 내가 중계하면서 대화에도 낀다
   ./deolmi 이름 [주소]        참가자 — 서버나 방장에게 접속 (주소 생략 시 127.0.0.1)

   차례: ① 통신(패킷 주고받기)  ② 화면  ③ 중계(서버·방장 공통)  ④ 대화  ⑤ main
   ※ 암호화는 뺀 단계다. 메시지는 평문으로 오간다. 암호화까지 넣었던 예전 버전과
     무엇을 왜 바꿨는지는 https://tkdgh123.github.io/secure-msg/ (코드 · 작업 기록) 에 있다. */
#define _GNU_SOURCE   /* wcwidth: 한글이 화면에서 두 칸인 걸 재려고 */
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include <signal.h>
#include <locale.h>
#include <wchar.h>
#include <poll.h>
#include <unistd.h>
#include <termios.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <sys/ioctl.h>
#include <sys/socket.h>

/* ================= ① 통신: 길이 붙인 패킷 =================
   TCP는 "어디까지가 한 메시지"인지 모른다. 그래서 보낼 때 맨 앞에 길이 4바이트를 붙이고,
   받을 때는 그 길이만큼 다 모일 때까지 기다렸다가 한 통으로 꺼낸다 (conn_take).

   패킷 모양은 암호화 버전(브랜치 with-crypto)과 똑같이 맞춰 두었다. 그래서 지금은 안 쓰는
   칸이 있다: seq·nonce 는 0, HELLO 본문 128바이트는 0으로 채워 보낸다.
   나중에 암호화를 다시 얹을 때 서버 쪽 코드를 거의 안 바꿔도 되게 하려는 것이다. */

#ifndef MSG_NOSIGNAL        /* 맥에는 없다. 대신 main에서 SIGPIPE를 무시한다 */
#define MSG_NOSIGNAL 0
#endif

#define NAME_LEN   16       /* 이름 최대 15바이트 (한글 5글자) + 끝 표시 */
#define NONCE_LEN  24
#define HDR_LEN    (1 + NAME_LEN + NAME_LEN + 8 + NONCE_LEN)   /* 65 */
#define MAX_BODY   65536
#define HELLO_LEN  (32 + 32 + 64)   /* 암호화 버전: 신원 공개키 + 세션 공개키 + 서명. 지금은 0 */
#define PKT_MAX    (4 + HDR_LEN + MAX_BODY)

/* 패킷 종류. 지금 쓰는 건 HELLO(접속하며 이름 밝히기) · MSG(대화) · SYS(서버 알림).
   VAULT~PROOF 는 암호화 버전의 금고용 — 서버는 내용을 안 보고 to 에게 그대로 전한다 */
enum { T_HELLO = 1, T_MSG, T_VAULT, T_OPEN_REQ, T_SHARE, T_PROOF, T_SYS };

struct packet {
    uint8_t  type;
    char     from[NAME_LEN], to[NAME_LEN];   /* 보낸 사람, 받을 사람 */
    uint64_t seq;                            /* 암호화 버전: 순서 번호. 지금은 0 */
    uint8_t  nonce[NONCE_LEN];               /* 암호화 버전: 한 번만 쓰는 값. 지금은 0 */
    uint32_t body_len;
    uint8_t  body[MAX_BODY];
};

struct conn {                 /* 받는 중인 바이트를 모아 두는 곳 */
    int     fd;
    uint8_t buf[PKT_MAX];
    size_t  len;
};

/* port번에서 접속을 기다리는 소켓을 만든다. 실패하면 -1 */
int net_listen(int port)
{
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) {
        perror("socket");
        return -1;
    }

    /* 껐다 바로 켜도 Address already in use가 안 나게 */
    int on = 1;
    setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on));

    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);   /* 0.0.0.0: 다른 노트북에서도 접속 가능 */

    if (bind(fd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        perror("bind");
        close(fd);
        return -1;
    }
    if (listen(fd, 16) < 0) {
        perror("listen");
        close(fd);
        return -1;
    }
    return fd;
}

/* host:port에 접속한다. host는 IP나 이름. 실패하면 -1 */
int net_connect(const char *host, int port)
{
    struct addrinfo hints = {0}, *res;
    char port_str[8];
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    snprintf(port_str, sizeof(port_str), "%d", port);
    if (getaddrinfo(host, port_str, &hints, &res) != 0) {
        fprintf(stderr, "%s: 주소를 찾을 수 없음\n", host);
        return -1;
    }

    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0 || connect(fd, res->ai_addr, res->ai_addrlen) < 0) {
        perror("connect");
        if (fd >= 0)
            close(fd);
        fd = -1;
    }
    freeaddrinfo(res);
    return fd;
}

/* 패킷을 길이 4바이트 + 헤더 + body 바이트로 늘어놓고, 보낼 바이트 수를 돌려준다.
   구조체는 패딩이 끼므로 그대로 보내지 않고 한 칸씩 복사한다 */
size_t pack_packet(const struct packet *p, uint8_t *out)
{
    uint32_t len = HDR_LEN + p->body_len;
    uint32_t nlen = htonl(len);
    uint8_t *q = out;

    memcpy(q, &nlen, 4);             q += 4;
    *q++ = p->type;
    memcpy(q, p->from, NAME_LEN);    q += NAME_LEN;
    memcpy(q, p->to, NAME_LEN);      q += NAME_LEN;
    for (int i = 7; i >= 0; i--)      /* seq: 큰 자리부터 한 바이트씩 */
        *q++ = (uint8_t)(p->seq >> (i * 8));
    memcpy(q, p->nonce, NONCE_LEN);  q += NONCE_LEN;
    memcpy(q, p->body, p->body_len);
    return 4 + len;
}

int send_packet(int fd, const struct packet *p)
{
    static uint8_t out[PKT_MAX];
    size_t total = pack_packet(p, out), sent = 0;

    while (sent < total) {           /* send는 일부만 보낼 수 있다 */
        ssize_t n = send(fd, out + sent, total - sent, MSG_NOSIGNAL);
        if (n <= 0)
            return -1;
        sent += (size_t)n;
    }
    return 0;
}

/* 소켓에서 읽은 만큼 버퍼 뒤에 붙인다. >0 받음, 0 끊김, -1 오류 */
int conn_read(struct conn *c)
{
    ssize_t n = recv(c->fd, c->buf + c->len, sizeof(c->buf) - c->len, 0);
    if (n < 0)
        return -1;
    c->len += n;
    return (int)n;
}

/* 버퍼에 패킷이 통째로 모였으면 하나 꺼낸다. 1 꺼냄, 0 덜 옴, -1 잘못된 길이 */
int conn_take(struct conn *c, struct packet *p)
{
    uint32_t len;
    if (c->len < 4)
        return 0;
    memcpy(&len, c->buf, 4);
    len = ntohl(len);
    if (len < HDR_LEN || len > HDR_LEN + MAX_BODY)
        return -1;
    if (c->len < 4 + len)
        return 0;                    /* 아직 덜 왔음: 다음 recv를 기다림 */

    const uint8_t *q = c->buf + 4;
    p->type = *q++;
    memcpy(p->from, q, NAME_LEN);    q += NAME_LEN;
    memcpy(p->to, q, NAME_LEN);      q += NAME_LEN;
    p->from[NAME_LEN - 1] = p->to[NAME_LEN - 1] = '\0';
    p->seq = 0;
    for (int i = 0; i < 8; i++)
        p->seq = (p->seq << 8) | *q++;
    memcpy(p->nonce, q, NONCE_LEN);  q += NONCE_LEN;
    p->body_len = len - HDR_LEN;
    memcpy(p->body, q, p->body_len);

    c->len -= 4 + len;               /* 꺼낸 만큼 앞으로 당긴다 */
    memmove(c->buf, c->buf + 4 + len, c->len);
    return 1;
}

#ifndef NET_ONLY   /* tests/ 는 위의 ① 통신 부분만 가져다 쓴다 */

#define PORT        9000
#define MAX_CLIENTS 16
#define INPUT_MAX   1000

enum { M_SERVER, M_HOST, M_JOIN };  /* 실행 방식: 서버 / 방장 / 참가자 */
enum { TO_ALL = 0, TO_ONE = 1 };    /* MSG 본문 첫 바이트 */

static int  mode;
static char my_name[NAME_LEN];       /* 방장·참가자의 이름 (서버는 빈칸) */
static char dm_to[NAME_LEN];         /* 비어 있으면 전체 대화 */
static struct packet pkt, out;       /* 받는 패킷 / 보내는 패킷 (64KB가 넘어서 전역) */

/* ================= ② 화면 ================= */

static int tty;                      /* 키보드로 대화 중인가 (서버·파이프면 0) */
static struct termios saved_tio;
static char input[INPUT_MAX + 1];
static size_t input_len;
static int drawn_rows;               /* 입력 줄이 화면에서 몇 줄 넘어갔나 */

static void prompt(char *buf, size_t size)
{
    if (dm_to[0])
        snprintf(buf, size, "%s→%s> ", my_name, dm_to);
    else
        snprintf(buf, size, "%s> ", my_name);
}

/* 터미널 폭 cols에서 s를 찍으면 줄이 몇 번 넘어가나 (한글은 두 칸) */
static int rows_after(const char *s, int cols)
{
    mbstate_t st;
    wchar_t wc;
    size_t len = strlen(s), n;
    int x = 0, rows = 0;

    memset(&st, 0, sizeof(st));
    while (len > 0) {
        n = mbrtowc(&wc, s, len, &st);
        if (n == (size_t)-2)
            break;
        int cw = 1;
        if (n == (size_t)-1) {
            memset(&st, 0, sizeof(st));
            n = 1;
        } else if ((cw = wcwidth(wc)) < 0) {
            cw = 0;
        }
        if (x + cw > cols) {
            rows++;
            x = 0;
        }
        x += cw;
        s += n;
        len -= n;
    }
    return rows;
}

#define C_ACCENT (tty ? "\033[36m" : "")
#define C_RESET  (tty ? "\033[0m"  : "")

static void clear_input(void)
{
    if (!tty)
        return;
    if (drawn_rows > 0)
        printf("\033[%dA", drawn_rows);
    printf("\r\033[J");
}

static void draw_input(void)
{
    if (!tty)
        return;
    char line[64 + INPUT_MAX];
    struct winsize ws;
    int cols = 80;

    prompt(line, sizeof(line));
    strcat(line, input);
    printf("%s", line);
    if (ioctl(1, TIOCGWINSZ, &ws) == 0 && ws.ws_col > 0)
        cols = ws.ws_col;
    drawn_rows = rows_after(line, cols);
    fflush(stdout);
}

/* 치던 입력 줄을 잠깐 지우고 한 줄 찍은 뒤 다시 그린다. 맨 앞 [태그]는 청록 */
static void put_line(const char *text)
{
    clear_input();
    if (tty && text[0] == '[') {
        const char *close = strchr(text, ']');
        if (close)
            printf("\033[36m%.*s\033[0m%s\n", (int)(close - text + 1), text, close + 1);
        else
            printf("%s\n", text);
    } else
        printf("%s\n", text);
    draw_input();
    fflush(stdout);
}

static void show(const char *fmt, ...)
{
    char text[2100];
    va_list ap;
    va_start(ap, fmt);
    vsnprintf(text, sizeof(text), fmt, ap);
    va_end(ap);
    put_line(text);
}

static void clean(char *s)   /* 받은 글자 중 제어 문자는 ? 로 */
{
    for (; *s; s++)
        if ((unsigned char)*s < 0x20 || *s == 0x7f)
            *s = '?';
}

static int valid_name(const char *s)
{
    size_t n = strlen(s);
    if (n == 0 || n >= NAME_LEN)
        return 0;
    for (; *s; s++)
        if (*s == ' ' || *s == '/' || (unsigned char)*s < 0x20)
            return 0;
    return 1;
}

/* 대화 화면에서 아는 사람들 (방장·참가자 공통). /who, /dm, 전체 보내기에 쓴다 */
struct peer { char name[NAME_LEN]; };
static struct peer peers[MAX_CLIENTS];
static int npeers;

static int find_peer(const char *name)
{
    for (int i = 0; i < npeers; i++)
        if (strncmp(peers[i].name, name, NAME_LEN) == 0)
            return i;
    return -1;
}

static void add_peer(const char *name)
{
    if (name[0] == '\0' || strncmp(name, my_name, NAME_LEN) == 0
        || find_peer(name) >= 0 || npeers >= MAX_CLIENTS)
        return;
    strncpy(peers[npeers++].name, name, NAME_LEN - 1);
}

static void remove_peer(const char *name)
{
    int i = find_peer(name);
    if (i < 0)
        return;
    if (strncmp(dm_to, name, NAME_LEN) == 0)
        dm_to[0] = '\0';
    peers[i] = peers[--npeers];
}

/* ================= ③ 중계: 서버와 방장이 같이 쓴다 ================= */

struct client {
    struct conn c;
    char    name[NAME_LEN];
    uint8_t hello[HELLO_LEN];
    int     registered;
};

/* 한 칸 더: 17번째의 HELLO까지 읽은 뒤에 "꽉 참"을 보내야 알림이 사라지지 않는다
   (안 읽은 데이터가 남은 채 close하면 RST가 나가서 받는 쪽이 알림을 못 읽는다) */
static struct client clients[MAX_CLIENTS + 1];
static int nclients;

static const char *type_name(int type)
{
    static const char *names[] = { "?", "HELLO", "MSG", "VAULT", "OPEN_REQ", "SHARE", "PROOF", "SYS" };
    return (type >= T_HELLO && type <= T_SYS) ? names[type] : names[0];
}

static int find_client(const char *name)
{
    for (int i = 0; i < nclients; i++)
        if (clients[i].registered && strncmp(clients[i].name, name, NAME_LEN) == 0)
            return i;
    return -1;
}

static void pkt_init(struct packet *p, uint8_t type, const char *from, const char *to)
{
    memset(p, 0, sizeof(*p));
    p->type = type;
    strncpy(p->from, from, NAME_LEN - 1);
    if (to)
        strncpy(p->to, to, NAME_LEN - 1);
}

/* i번에게 알림 한 줄 */
static void send_sys(int i, const char *fmt, ...)
{
    va_list ap;
    pkt_init(&out, T_SYS, "", clients[i].name);
    va_start(ap, fmt);
    int n = vsnprintf((char *)out.body, MAX_BODY, fmt, ap);
    va_end(ap);
    out.body_len = n < MAX_BODY ? n : MAX_BODY - 1;
    send_packet(clients[i].c.fd, &out);
}

/* name의 HELLO를 i번에게 */
static void send_hello(int i, const char *name, const uint8_t *hello)
{
    pkt_init(&out, T_HELLO, name, clients[i].name);
    out.body_len = HELLO_LEN;
    memcpy(out.body, hello, HELLO_LEN);
    send_packet(clients[i].c.fd, &out);
}

static void add_client(int fd)
{
    if (fd < 0)
        return;
    if (nclients == MAX_CLIENTS + 1) {   /* 남는 칸까지 찼으면 말없이 닫는다 */
        close(fd);
        return;
    }
    memset(&clients[nclients], 0, sizeof(clients[0]));
    clients[nclients].c.fd = fd;
    nclients++;
}

/* i번을 지우고 마지막 칸을 i번 자리로 옮긴다 */
static void drop_client(int i)
{
    char name[NAME_LEN];
    int was_registered = clients[i].registered;
    memcpy(name, clients[i].name, NAME_LEN);

    close(clients[i].c.fd);
    clients[i] = clients[--nclients];

    if (was_registered) {
        show("[알림] %s 퇴장", name);
        remove_peer(name);
        for (int k = 0; k < nclients; k++)
            if (clients[k].registered)
                send_sys(k, "%s 퇴장", name);
    }
}

static int handle_hello(int i, const struct packet *p)
{
    if (clients[i].registered) {
        send_sys(i, "이미 HELLO를 보냈습니다");
        return 0;
    }
    if (p->body_len != HELLO_LEN) {
        send_sys(i, "HELLO 길이가 잘못됨");
        drop_client(i);
        return -1;
    }
    if (!valid_name(p->from) || find_client(p->from) >= 0
        || (mode == M_HOST && strncmp(p->from, my_name, NAME_LEN) == 0)) {
        send_sys(i, "이름 사용 중이거나 쓸 수 없음: %s", p->from);
        drop_client(i);
        return -1;
    }
    int registered = 0;
    for (int k = 0; k < nclients; k++)
        registered += clients[k].registered;
    if (registered == MAX_CLIENTS) {
        send_sys(i, "방이 꽉 찼습니다 (%d명)", MAX_CLIENTS);
        drop_client(i);
        return -1;
    }

    struct client *me = &clients[i];
    memcpy(me->name, p->from, NAME_LEN);
    memcpy(me->hello, p->body, HELLO_LEN);
    me->registered = 1;
    show("[알림] %s 입장", me->name);

    for (int k = 0; k < nclients; k++) {
        if (k == i || !clients[k].registered)
            continue;
        send_hello(i, clients[k].name, clients[k].hello);   /* 새 사람에게 기존 전원의 HELLO */
        send_hello(k, me->name, me->hello);                 /* 기존 전원에게 새 HELLO */
    }
    if (mode == M_HOST) {   /* 방장도 방에 있는 한 사람이다 */
        static const uint8_t no_key[HELLO_LEN];
        send_hello(i, my_name, no_key);
        add_peer(me->name);
    }
    for (int k = 0; k < nclients; k++)
        if (clients[k].registered)
            send_sys(k, "%s 입장", me->name);
    return 0;
}

/* 서버의 눈: 중계할 때마다 한 줄. 평문 단계라 내용이 그대로 보인다 (방장은 대화 화면이라 안 찍음) */
static void show_eye(const struct packet *p)
{
    if (mode != M_SERVER)
        return;
    char line[200];
    int off = snprintf(line, sizeof(line), "[relay] %s → %s  %-8s seq=%-4llu %4uB ", p->from, p->to,
                       type_name(p->type), (unsigned long long)p->seq, p->body_len);
    for (uint32_t k = 0; k < p->body_len && k < 8; k++)
        off += snprintf(line + off, sizeof(line) - off, " %02x", p->body[k]);
    show("%s%s", line, p->body_len > 8 ? " …" : "");
}

/* to에게 중계 */
static void relay(int to, struct packet *p)
{
    show_eye(p);
    send_packet(clients[to].c.fd, p);   /* 실패해도 다음 poll에서 끊김으로 잡힌다 */
}

static void display_msg(const struct packet *p);   /* ④에 있음 */

/* 패킷 하나 처리. 이 사람을 끊었으면 -1 */
static int handle_packet(int i, struct packet *p)
{
    if (!clients[i].registered && p->type != T_HELLO) {
        send_sys(i, "먼저 HELLO를 보내야 합니다");
        drop_client(i);
        return -1;
    }
    if (p->type == T_HELLO)
        return handle_hello(i, p);
    if (p->type < T_MSG || p->type > T_PROOF) {
        send_sys(i, "모르는 type: %d", p->type);
        return 0;
    }
    if (strncmp(p->from, clients[i].name, NAME_LEN) != 0) {
        send_sys(i, "보낸 사람 이름이 다릅니다: %s", p->from);   /* 남의 이름으로 보내기 차단 */
        return 0;
    }
    if (mode == M_HOST && strncmp(p->to, my_name, NAME_LEN) == 0) {
        if (p->type == T_MSG)
            display_msg(p);   /* 방장한테 온 것 */
        return 0;
    }

    int to = find_client(p->to);
    if (to < 0) {
        send_sys(i, "%s는 접속해 있지 않습니다", p->to);
        return 0;
    }
    relay(to, p);
    return 0;
}

/* i번 소켓에 온 것을 읽어서 패킷마다 처리 */
static void serve(int i)
{
    if (conn_read(&clients[i].c) <= 0) {
        drop_client(i);
        return;
    }
    int r;
    while ((r = conn_take(&clients[i].c, &pkt)) == 1)
        if (handle_packet(i, &pkt) < 0)
            return;   /* 이미 drop_client(i) 됨 */
    if (r < 0)
        drop_client(i);   /* 길이가 잘못됨: 버퍼를 늘리지 않고 끊는다 */
}

/* ================= ④ 대화: 방장·참가자 ================= */

static struct conn srv;   /* 참가자: 서버(또는 방장)와의 연결 */

static void display_msg(const struct packet *p)
{
    char from[NAME_LEN + 1];
    static char text[MAX_BODY];
    if (p->body_len < 1)
        return;
    memcpy(from, p->from, NAME_LEN);
    from[NAME_LEN] = '\0';
    clean(from);
    size_t n = p->body_len - 1;
    if (n > MAX_BODY - 1)
        n = MAX_BODY - 1;
    memcpy(text, p->body + 1, n);
    text[n] = '\0';
    clean(text);
    if (p->body[0] == TO_ONE)
        show("[%s → 나] %s", from, text);
    else
        show("[%s] %s", from, text);
}

/* SYS "이름 입장/퇴장" 이면 명단을 고친다 (참가자 쪽) */
static void sys_update(const char *text)
{
    size_t L = strlen(text);
    const char *in = " 입장", *ou = " 퇴장";
    size_t li = strlen(in), lo = strlen(ou);
    char nm[NAME_LEN];
    if (L > li && strcmp(text + L - li, in) == 0 && L - li < NAME_LEN) {
        memcpy(nm, text, L - li);
        nm[L - li] = '\0';
        add_peer(nm);
    } else if (L > lo && strcmp(text + L - lo, ou) == 0 && L - lo < NAME_LEN) {
        memcpy(nm, text, L - lo);
        nm[L - lo] = '\0';
        remove_peer(nm);
    }
}

/* 참가자: 서버(방장)에게서 받기 */
static void join_read(void)
{
    if (conn_read(&srv) <= 0) {
        show("[알림] 연결이 끊어졌습니다");
        exit(1);
    }
    int r;
    while ((r = conn_take(&srv, &pkt)) == 1) {
        if (pkt.type == T_HELLO) {
            clean(pkt.from);
            add_peer(pkt.from);
        } else if (pkt.type == T_MSG) {
            display_msg(&pkt);
        } else if (pkt.type == T_SYS) {
            static char text[MAX_BODY];
            size_t n = pkt.body_len < MAX_BODY ? pkt.body_len : MAX_BODY - 1;
            memcpy(text, pkt.body, n);
            text[n] = '\0';
            clean(text);
            show("[알림] %s", text);
            sys_update(text);
        }
        /* 평문 버전에는 금고·증명 같은 다른 type이 오지 않는다 */
    }
    if (r < 0) {
        show("[알림] 이상한 패킷이 와서 끊습니다");
        exit(1);
    }
}

/* 한 사람에게 보낸다. 방장은 직접 중계하고, 참가자는 서버(방장)에게 맡긴다 */
static void send_one(const char *to, uint8_t flag, const char *text)
{
    size_t len = strlen(text);
    if (len > INPUT_MAX)
        len = INPUT_MAX;
    pkt_init(&out, T_MSG, my_name, to);
    out.body[0] = flag;
    memcpy(out.body + 1, text, len);
    out.body_len = (uint32_t)(len + 1);

    if (mode == M_HOST) {
        int k = find_client(to);
        if (k >= 0)
            relay(k, &out);
    } else {
        send_packet(srv.fd, &out);
    }
}

/* 전체 대화는 사람마다 한 통씩 */
static void send_text(const char *text)
{
    if (dm_to[0])
        send_one(dm_to, TO_ONE, text);
    else if (npeers == 0)
        show("[알림] 아직 아무도 없습니다");
    else
        for (int i = 0; i < npeers; i++)
            send_one(peers[i].name, TO_ALL, text);
}

static void cmd_who(void)
{
    char line[64 + MAX_CLIENTS * (NAME_LEN + 2)];
    int off = snprintf(line, sizeof(line), "[접속 중] %s(나%s)", my_name, mode == M_HOST ? "·방장" : "");
    for (int i = 0; i < npeers; i++)
        off += snprintf(line + off, sizeof(line) - off, ", %s", peers[i].name);
    show("%s", line);
}

static void echo_line(const char *line)   /* 친 줄을 화면에 남긴다 */
{
    if (!tty)
        return;
    char p[64];
    prompt(p, sizeof(p));
    clear_input();
    printf("%s%s\n", p, line);
    draw_input();
    fflush(stdout);
}

static void on_line(const char *line)
{
    if (strcmp(line, "/quit") == 0) {
        clear_input();
        exit(0);
    } else if (strcmp(line, "/all") == 0) {
        dm_to[0] = '\0';
        show("[전체 대화] 접속한 사람 모두에게 갑니다");
    } else if (strncmp(line, "/dm ", 4) == 0) {
        const char *name = line + 4;
        while (*name == ' ')   /* "/dm  친구" 처럼 띄어쓰기를 두 번 해도 */
            name++;
        if (strcmp(name, my_name) == 0 || !name[0])
            show("[1:1 대화] 쓰는 법: /dm 이름");
        else if (find_peer(name) < 0)
            show("[1:1 대화] %s는 접속해 있지 않습니다 (/who 로 확인)", name);
        else {
            strncpy(dm_to, name, NAME_LEN - 1);
            show("[1:1 대화] %s에게만 갑니다 · /all 로 돌아오기", name);
        }
    } else if (strcmp(line, "/who") == 0) {
        cmd_who();
    } else if (strcmp(line, "/help") == 0) {
        show("[알림] 그냥 치면 전체 대화 · /dm 이름 · /all · /who · /quit");
    } else if (line[0] == '/') {
        show("[알림] 모르는 명령입니다 · /help");
    } else {
        send_text(line);
    }
}

/* 앞뒤 공백을 지운다. 복사해 붙이면 끝에 공백이나 NBSP(눈에 안 보이는 공백, C2 A0)가 딸려 오기 쉽다 */
static char *trim(char *s)
{
    for (;;) {
        if (*s == ' ' || *s == '\t')
            s++;
        else if ((unsigned char)s[0] == 0xC2 && (unsigned char)s[1] == 0xA0)
            s += 2;
        else
            break;
    }
    size_t n = strlen(s);
    for (;;) {
        if (n > 0 && (s[n - 1] == ' ' || s[n - 1] == '\t'))
            n--;
        else if (n > 1 && (unsigned char)s[n - 2] == 0xC2 && (unsigned char)s[n - 1] == 0xA0)
            n -= 2;
        else
            break;
    }
    s[n] = '\0';
    return s;
}

/* 키 하나. 엔터면 한 줄 처리, 지우기·Ctrl+U·Ctrl+C·Ctrl+D, 화살표 같은 ESC 줄은 무시 */
static void on_key(unsigned char ch)
{
    static int esc;
    if (esc == 1) {
        esc = (ch == '[') ? 2 : 0;
        return;
    }
    if (esc == 2) {
        if (ch >= 0x40 && ch <= 0x7e)
            esc = 0;
        return;
    }
    if (ch == 0x1b) {
        esc = 1;
    } else if (ch == '\n' || ch == '\r') {
        char line[INPUT_MAX + 1];
        if (input_len == 0)
            return;
        strcpy(line, input);
        input_len = 0;
        input[0] = '\0';
        char *text = trim(line);   /* "/who " 처럼 끝에 공백이 붙어도 명령으로 알아듣게 */
        if (text[0] == '\0')
            return;
        echo_line(text);
        on_line(text);
    } else if (ch == 0x7f || ch == 0x08) {
        while (input_len > 0 && (input[input_len - 1] & 0xC0) == 0x80)
            input_len--;   /* 한글은 여러 바이트: 글자 하나를 통째로 지운다 */
        if (input_len > 0)
            input_len--;
        input[input_len] = '\0';
    } else if (ch == 0x03 || (ch == 0x04 && input_len == 0)) {
        clear_input();
        exit(0);
    } else if (ch == 0x15) {
        input_len = 0;
        input[0] = '\0';
    } else if (ch >= 0x20) {
        int lead = (ch & 0xC0) != 0x80;
        if (input_len >= INPUT_MAX || (lead && input_len >= INPUT_MAX - 4))
            return;
        input[input_len++] = (char)ch;
        input[input_len] = '\0';
    }
}

static void read_keys(void)
{
    unsigned char buf[256];
    ssize_t n = read(0, buf, sizeof(buf));
    if (n <= 0) {
        clear_input();
        exit(0);
    }
    for (ssize_t i = 0; i < n; i++)
        on_key(buf[i]);
    clear_input();
    draw_input();
}

static void restore_tty(void)
{
    if (tty)
        tcsetattr(0, TCSANOW, &saved_tio);
}

/* 키를 누르는 즉시 받도록 (엔터 기다리지 않음, 화면에 저절로 찍지 않음) */
static void raw_tty(void)
{
    tty = isatty(0) && isatty(1);
    if (!tty)
        return;
    tcgetattr(0, &saved_tio);
    struct termios t = saved_tio;
    t.c_lflag &= ~(ICANON | ECHO | ISIG);
    t.c_cc[VMIN] = 1;
    t.c_cc[VTIME] = 0;
    tcsetattr(0, TCSANOW, &t);
    atexit(restore_tty);
}

/* ================= ⑤ 실행 ================= */

int main(int argc, char **argv)
{
    setlocale(LC_ALL, "");
    signal(SIGPIPE, SIG_IGN);
    setvbuf(stdout, NULL, _IOLBF, 0);   /* 파일로 돌려도 줄마다 바로 나오게 */

    int lfd = -1;
    if (argc == 2 && strcmp(argv[1], "--server") == 0) {
        mode = M_SERVER;
        lfd = net_listen(PORT);
        if (lfd < 0)
            return 1;
        show("[서버] %d번에서 기다리는 중", PORT);
    } else if (argc >= 2 && argv[1][0] != '-' && valid_name(argv[1])) {
        strncpy(my_name, argv[1], NAME_LEN - 1);
        mode = (argc >= 3 && strcmp(argv[2], "--host") == 0) ? M_HOST : M_JOIN;
        if (mode == M_HOST) {
            lfd = net_listen(PORT);
            if (lfd < 0)
                return 1;
            raw_tty();
            show("%s덜미%s · %s · 방장 (포트 %d) — 서버 없이 내가 중계해요", C_ACCENT, C_RESET, my_name, PORT);
        } else {
            const char *host = argc >= 3 ? argv[2] : "127.0.0.1";
            srv.fd = net_connect(host, PORT);
            if (srv.fd < 0)
                return 1;
            pkt_init(&out, T_HELLO, my_name, NULL);
            out.body_len = HELLO_LEN;
            send_packet(srv.fd, &out);
            raw_tty();
            show("%s덜미%s · %s · %s 에 접속", C_ACCENT, C_RESET, my_name, host);
        }
        show("대화는 그냥 입력 · /dm 이름 · /all · /who · /help · /quit");
    } else {
        fprintf(stderr, "사용법: %s --server              (서버: 중계만)\n", argv[0]);
        fprintf(stderr, "        %s 이름 --host           (방장: 서버 없이 방을 연다)\n", argv[0]);
        fprintf(stderr, "        %s 이름 [주소]           (참가자: 서버나 방장에게 접속)\n", argv[0]);
        return 1;
    }

    int key_fd = mode == M_SERVER ? -1 : 0;   /* 키보드: 서버는 안 본다 (-1이면 poll이 건너뜀) */
    struct pollfd fds[2 + MAX_CLIENTS + 1];
    for (;;) {
        int n = nclients;   /* 이번 바퀴에 지켜볼 사람 수 (참가자는 0) */
        fds[0] = (struct pollfd){ .fd = key_fd, .events = POLLIN };
        fds[1] = (struct pollfd){ .fd = mode == M_JOIN ? srv.fd : lfd, .events = POLLIN };
        for (int i = 0; i < n; i++)
            fds[2 + i] = (struct pollfd){ .fd = clients[i].c.fd, .events = POLLIN };

        if (poll(fds, 2 + n, -1) < 0)
            continue;

        /* 뒤에서부터: 도중에 지워도 아직 안 본 칸이 밀려오지 않는다 */
        for (int i = n - 1; i >= 0; i--)
            if (fds[2 + i].revents & (POLLIN | POLLHUP | POLLERR))
                serve(i);
        if (fds[1].revents & (POLLIN | POLLHUP | POLLERR)) {
            if (mode == M_JOIN)
                join_read();
            else
                add_client(accept(lfd, NULL, NULL));
        }
        if (fds[0].revents & (POLLIN | POLLHUP))
            read_keys();
    }
}

#endif /* NET_ONLY */
