/* 덜미 — 프밍기2 팀 프로젝트 메신저 (윈도우용, 암호화 전 단계: 메시지는 평문으로 오간다)

   빌드:  Visual Studio 개발자 명령 프롬프트에서  cl /utf-8 deolmi.c
          (Visual Studio 프로젝트로 빌드하면 C/C++ → 명령줄 → 추가 옵션에 /utf-8 — 한글이 깨지지 않게)

   deolmi 이름 --host    방장 — 방을 연다. 방장이 서버가 되어 중계하면서 대화에도 낀다
   deolmi 이름 [주소]     참가자 — 방장에게 접속 (주소를 안 쓰면 127.0.0.1)

   차례: ① 통신  ② 화면  ③ 중계(방장)  ④ 대화  ⑤ 실행

   만든 사람: 김창식 — 기획, 방향 결정, 실제로 돌려 보고 문제 찾기
              Claude (Anthropic의 AI) — 코드와 테스트 작성
              자세히: https://tkdgh123.github.io/secure-msg/log/ */
#define _CRT_SECURE_NO_WARNINGS
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "shell32.lib")
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <stdint.h>
#include <string.h>

/* ================= ① 통신: 길이 붙인 패킷 =================
   TCP는 어디까지가 한 메시지인지 모른다. 그래서 보낼 때 앞에 길이 4바이트를 붙이고,
   받을 때는 그 길이만큼 다 모이면 한 통으로 꺼낸다 (conn_take).
   한 통 = 길이 4바이트 + 헤더 33바이트(종류 1 · 보낸 사람 16 · 받을 사람 16) + 본문 */

#define NAME_LEN  16                  /* 이름 최대 15바이트 (한글 5글자) + 끝 표시 */
#define HDR_LEN   (1 + NAME_LEN + NAME_LEN)
#define MAX_BODY  65536
#define PKT_MAX   (4 + HDR_LEN + MAX_BODY)

/* 패킷 종류: HELLO(접속하며 이름 밝히기) · MSG(대화, to가 비면 모두에게) · SYS(방장의 알림) */
enum { T_HELLO = 1, T_MSG, T_SYS };

struct packet {
    uint8_t  type;
    char     from[NAME_LEN], to[NAME_LEN];   /* 보낸 사람, 받을 사람 */
    uint32_t body_len;
    uint8_t  body[MAX_BODY];
};

struct conn {                 /* 받는 중인 바이트를 모아 두는 곳 */
    int     fd;
    uint8_t buf[PKT_MAX];
    size_t  len;
};

/* port번에서 접속을 기다리는 소켓. 실패하면 -1 */
int net_listen(int port)
{
    int fd = (int)socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);   /* 다른 노트북에서도 들어올 수 있게 */
    if (fd < 0 || bind(fd, (struct sockaddr *)&addr, sizeof(addr)) < 0 || listen(fd, 16) < 0)
        return -1;
    return fd;
}

/* host:port에 접속한다. 실패하면 -1 */
int net_connect(const char *host, int port)
{
    struct addrinfo hints = {0}, *res;
    char port_str[8];
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    snprintf(port_str, sizeof(port_str), "%d", port);
    if (getaddrinfo(host, port_str, &hints, &res) != 0)
        return -1;
    int fd = (int)socket(AF_INET, SOCK_STREAM, 0);
    if (fd >= 0 && connect(fd, res->ai_addr, (int)res->ai_addrlen) < 0) {
        closesocket(fd);
        fd = -1;
    }
    freeaddrinfo(res);
    return fd;
}

/* 패킷을 길이 4바이트 + 헤더 + 본문 바이트로 늘어놓고, 보낼 바이트 수를 돌려준다.
   구조체는 컴퓨터마다 빈 바이트(패딩)가 다르게 끼므로 그대로 보내지 않고 한 칸씩 복사한다 */
size_t pack_packet(const struct packet *p, uint8_t *out)
{
    uint32_t len = HDR_LEN + p->body_len;
    uint32_t nlen = htonl(len);       /* 길이는 큰 자리부터 */
    uint8_t *q = out;
    memcpy(q, &nlen, 4);             q += 4;
    *q++ = p->type;
    memcpy(q, p->from, NAME_LEN);    q += NAME_LEN;
    memcpy(q, p->to, NAME_LEN);      q += NAME_LEN;
    memcpy(q, p->body, p->body_len);
    return 4 + len;
}

int send_packet(int fd, const struct packet *p)
{
    static uint8_t out[PKT_MAX];
    size_t total = pack_packet(p, out), sent = 0;
    while (sent < total) {           /* send는 일부만 보낼 수 있다 */
        int n = (int)send(fd, (const char *)out + sent, (int)(total - sent), 0);
        if (n <= 0)
            return -1;
        sent += (size_t)n;
    }
    return 0;
}

/* 소켓에서 읽은 만큼 버퍼 뒤에 붙인다. >0 받음, 0 끊김, -1 오류 */
int conn_read(struct conn *c)
{
    int n = (int)recv(c->fd, (char *)c->buf + c->len, (int)(sizeof(c->buf) - c->len), 0);
    if (n < 0)
        return -1;
    c->len += n;
    return n;
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

enum { M_HOST, M_JOIN };             /* 실행 방식: 방장 / 참가자 */

static int  mode;
static char my_name[NAME_LEN];       /* 내 이름 */
static char dm_to[NAME_LEN];         /* 1:1 상대. 비어 있으면 전체 대화 */
static struct packet pkt, out;       /* 받는 패킷 / 보내는 패킷 (64KB가 넘어서 전역) */

/* 키보드는 따로 도는 스레드가 읽는다. 두 스레드가 같은 데이터를 건드리지 않게 잠근다 */
static CRITICAL_SECTION mx;
#define LOCK()   EnterCriticalSection(&mx)
#define UNLOCK() LeaveCriticalSection(&mx)

/* ================= ② 화면 ================= */

static void show(const char *fmt, ...)   /* 한 줄 찍기 */
{
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\n");
    fflush(stdout);
}

static void clean(char *s)   /* 받은 글의 제어 문자는 ? 로 (남이 내 터미널을 조작하지 못하게) */
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

/* 방에 있는 사람 목록 (나 빼고). /who 와 /dm 에 쓴다 */
static char peers[MAX_CLIENTS][NAME_LEN];
static int  npeers;

static int find_peer(const char *name)
{
    for (int i = 0; i < npeers; i++)
        if (strncmp(peers[i], name, NAME_LEN) == 0)
            return i;
    return -1;
}

static void add_peer(const char *name)
{
    if (name[0] == '\0' || strncmp(name, my_name, NAME_LEN) == 0
        || find_peer(name) >= 0 || npeers >= MAX_CLIENTS)
        return;
    strncpy(peers[npeers++], name, NAME_LEN - 1);
}

static void remove_peer(const char *name)
{
    int i = find_peer(name);
    if (i < 0)
        return;
    if (strncmp(dm_to, name, NAME_LEN) == 0)   /* 1:1 상대가 나가면 전체 대화로 */
        dm_to[0] = '\0';
    memcpy(peers[i], peers[--npeers], NAME_LEN);
}

/* ================= ③ 중계: 방장 =================
   방장이 서버다. 참가자들은 방장에게 접속하고, 방장은 패킷의 to 를 보고 그 사람에게만 전한다.
   to 가 비어 있으면 보낸 사람을 뺀 모두에게 전한다 */

struct client {
    struct conn c;
    char    name[NAME_LEN];
    int     registered;              /* HELLO로 이름을 밝혔나 */
};

/* 한 칸 더: 17번째 사람의 HELLO까지 읽은 뒤에 "꽉 찼습니다"를 보내야 알림이 도착한다
   (안 읽은 데이터가 남은 채 닫으면 연결이 강제로 끊겨서 받는 쪽이 알림을 못 읽는다) */
static struct client clients[MAX_CLIENTS + 1];
static int nclients;

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

static void relay(int to, const struct packet *p)
{
    send_packet(clients[to].c.fd, p);   /* 실패해도 다음 select에서 끊김으로 잡힌다 */
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
    relay(i, &out);
}

static void sys_all(const char *name, const char *what)   /* 방에 있는 모두에게 "이름 입장/퇴장" */
{
    for (int k = 0; k < nclients; k++)
        if (clients[k].registered)
            send_sys(k, "%s %s", name, what);
}

/* i번에게 "name이 방에 있다" (HELLO, 본문 없음) */
static void send_hello(int i, const char *name)
{
    pkt_init(&out, T_HELLO, name, clients[i].name);
    relay(i, &out);
}

static void add_client(int fd)
{
    if (fd < 0)
        return;
    if (nclients == MAX_CLIENTS + 1) {   /* 남는 칸까지 찼으면 말없이 닫는다 */
        closesocket(fd);
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
    closesocket(clients[i].c.fd);
    clients[i] = clients[--nclients];
    if (was_registered) {
        show("[알림] %s 퇴장", name);
        remove_peer(name);
        sys_all(name, "퇴장");
    }
}

static int handle_hello(int i, const struct packet *p)
{
    if (clients[i].registered) {
        send_sys(i, "이미 HELLO를 보냈습니다");
        return 0;
    }
    if (!valid_name(p->from) || find_client(p->from) >= 0 || strncmp(p->from, my_name, NAME_LEN) == 0) {
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

    memcpy(clients[i].name, p->from, NAME_LEN);
    clients[i].registered = 1;
    show("[알림] %s 입장", p->from);
    /* 새 사람에게 이미 방에 있는 사람들(방장 포함)을 알린다. 기존 사람들은 "입장" 알림으로 안다 */
    for (int k = 0; k < nclients; k++)
        if (k != i && clients[k].registered)
            send_hello(i, clients[k].name);
    send_hello(i, my_name);
    add_peer(p->from);
    sys_all(p->from, "입장");
    return 0;
}

static void display_msg(const struct packet *p);   /* ④에 있음 */

/* 받은 패킷 하나 처리. 이 사람을 끊었으면 -1 */
static int handle_packet(int i, const struct packet *p)
{
    if (!clients[i].registered && p->type != T_HELLO) {
        send_sys(i, "먼저 HELLO를 보내야 합니다");
        drop_client(i);
        return -1;
    }
    if (p->type == T_HELLO)
        return handle_hello(i, p);
    if (p->type != T_MSG) {   /* 참가자가 보내는 건 MSG뿐 (SYS는 방장만 만든다) */
        send_sys(i, "모르는 type: %d", p->type);
        return 0;
    }
    if (strncmp(p->from, clients[i].name, NAME_LEN) != 0) {   /* 남의 이름으로 보내기 차단 */
        send_sys(i, "보낸 사람 이름이 다릅니다: %s", p->from);
        return 0;
    }
    if (p->to[0] == '\0') {   /* 모두에게: 방장 화면에 띄우고, 보낸 사람 빼고 전원에게 */
        display_msg(p);
        for (int k = 0; k < nclients; k++)
            if (k != i && clients[k].registered)
                relay(k, p);
    } else if (strncmp(p->to, my_name, NAME_LEN) == 0) {
        display_msg(p);   /* 방장한테만 온 것 */
    } else {
        int to = find_client(p->to);
        if (to < 0)
            send_sys(i, "%s는 접속해 있지 않습니다", p->to);
        else
            relay(to, p);
    }
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
            return;           /* 이미 끊었음 */
    if (r < 0)
        drop_client(i);       /* 말이 안 되는 길이: 그 사람만 끊는다 */
}

/* ================= ④ 대화: 방장·참가자 ================= */

static struct conn srv;   /* 참가자: 방장과의 연결 */

static void display_msg(const struct packet *p)
{
    static char text[MAX_BODY];
    char from[NAME_LEN];
    memcpy(from, p->from, NAME_LEN);
    clean(from);
    size_t n = p->body_len < MAX_BODY ? p->body_len : MAX_BODY - 1;
    memcpy(text, p->body, n);
    text[n] = '\0';
    clean(text);
    if (p->to[0])   /* to가 있으면 나에게만 온 1:1 */
        show("[%s → 나] %s", from, text);
    else
        show("[%s] %s", from, text);
}

/* 알림이 "이름 입장/퇴장" 이면 목록을 고친다 (참가자 쪽) */
static void sys_update(const char *text)
{
    const char *sp = strrchr(text, ' ');
    char name[NAME_LEN];
    if (!sp || sp - text >= NAME_LEN)
        return;
    memcpy(name, text, sp - text);
    name[sp - text] = '\0';
    if (strcmp(sp + 1, "입장") == 0)
        add_peer(name);
    else if (strcmp(sp + 1, "퇴장") == 0)
        remove_peer(name);
}

/* 참가자: 방장에게서 온 것 받기 */
static void join_read(void)
{
    if (conn_read(&srv) <= 0) {
        show("[알림] 방장과 연결이 끊어졌습니다");
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
    }
    if (r < 0) {
        show("[알림] 이상한 패킷이 와서 끊습니다");
        exit(1);
    }
}

/* 한 통 보낸다. 1:1이면 to = 그 사람, 전체면 to 를 비운다.
   참가자는 방장에게 보내고, 방장은 직접 그 사람(전체면 모두)에게 전한다 */
static void send_text(const char *text)
{
    if (npeers == 0) {
        show("[알림] 아직 아무도 없습니다");
        return;
    }
    size_t len = strlen(text);
    if (len > INPUT_MAX) {
        len = INPUT_MAX;
        while (len > 0 && ((unsigned char)text[len] & 0xC0) == 0x80)
            len--;   /* 한글 글자 중간에서 자르지 않게 */
    }
    pkt_init(&out, T_MSG, my_name, dm_to);
    memcpy(out.body, text, len);
    out.body_len = (uint32_t)len;
    if (mode == M_JOIN)
        send_packet(srv.fd, &out);
    else
        for (int k = 0; k < nclients; k++)
            if (clients[k].registered && (!dm_to[0] || strncmp(clients[k].name, dm_to, NAME_LEN) == 0))
                relay(k, &out);
}

static void show_guide(void)
{
    show("──────────────────────────────────────────");
    show("  그냥 치고 엔터   방에 있는 모두에게");
    show("  /dm 이름         그 사람하고만 1:1  (/all 로 다시 모두에게)");
    show("  /who             지금 들어와 있는 사람");
    show("  /help            이 설명 · /quit 나가기");
    show("만든 사람: 김창식(기획·결정·실행 확인) · Claude(AI — 코드 작성)");
    show("──────────────────────────────────────────");
}

static void on_line(const char *line)
{
    if (strcmp(line, "/quit") == 0) {
        exit(0);
    } else if (strcmp(line, "/all") == 0) {
        dm_to[0] = '\0';
        show("[전체 대화] 방에 있는 모두에게 갑니다");
    } else if (strncmp(line, "/dm ", 4) == 0) {
        const char *name = line + 4;
        while (*name == ' ')
            name++;
        if (find_peer(name) < 0) {
            show("[1:1 대화] %s는 접속해 있지 않습니다 (/who 로 확인)", name);
        } else {
            strncpy(dm_to, name, NAME_LEN - 1);
            show("[1:1 대화] %s에게만 갑니다 · /all 로 돌아오기", name);
        }
    } else if (strcmp(line, "/who") == 0) {
        printf("[접속 중] %s(나%s)", my_name, mode == M_HOST ? "·방장" : "");
        for (int i = 0; i < npeers; i++)
            printf(", %s", peers[i]);
        show("");
    } else if (strcmp(line, "/help") == 0) {
        show_guide();
    } else if (line[0] == '/') {
        show("[알림] 모르는 명령입니다 · /help");
    } else {
        send_text(line);
    }
}

/* 키보드에서 한 줄을 UTF-8로 읽는다. 끝(EOF)이면 0 */
static int read_line(char *buf, int size)
{
    HANDLE h = GetStdHandle(STD_INPUT_HANDLE);
    DWORD m, got;
    static wchar_t w[INPUT_MAX + 2];
    if (GetConsoleMode(h, &m)) {   /* 키보드: 한글이 깨지지 않게 UTF-16으로 받아 UTF-8로 바꾼다 */
        if (!ReadConsoleW(h, w, INPUT_MAX, &got, NULL) || got == 0)
            return 0;
        int n = WideCharToMultiByte(CP_UTF8, 0, w, (int)got, buf, size - 1, NULL, NULL);
        buf[n > 0 ? n : 0] = '\0';
    } else if (!fgets(buf, size, stdin))   /* 파이프로 입력을 준 경우 */
        return 0;
    buf[strcspn(buf, "\r\n")] = '\0';
    return 1;
}

/* 입력 스레드: 한 줄 읽을 때마다 처리. 받는 쪽(main)과 겹치지 않게 잠그고 한다 */
static void input_loop(void)
{
    static char line[4 * INPUT_MAX];
    while (read_line(line, sizeof(line))) {
        char *s = line, *e = line + strlen(line);
        while (*s == ' ' || *s == '\t')   /* 앞뒤 공백 무시 ("/who " 도 명령으로) */
            s++;
        while (e > s && (e[-1] == ' ' || e[-1] == '\t'))
            *--e = '\0';
        if (*s == '\0')
            continue;
        LOCK();
        on_line(s);
        UNLOCK();
    }
    exit(0);
}

static DWORD WINAPI input_thread(LPVOID p) { (void)p; input_loop(); return 0; }

/* 방장: 다른 컴퓨터가 들어올 때 칠 내 주소. UDP는 connect만 하면 아무것도 안 보내고 주소만 정해진다 */
static void show_my_address(void)
{
    struct sockaddr_in to = {0}, me;
    socklen_t len = sizeof(me);
    char ip[INET_ADDRSTRLEN] = "";
    int fd = (int)socket(AF_INET, SOCK_DGRAM, 0);
    to.sin_family = AF_INET;
    to.sin_port = htons(53);
    inet_pton(AF_INET, "8.8.8.8", &to.sin_addr);
    if (fd >= 0 && connect(fd, (struct sockaddr *)&to, sizeof(to)) == 0
        && getsockname(fd, (struct sockaddr *)&me, &len) == 0)
        inet_ntop(AF_INET, &me.sin_addr, ip, sizeof(ip));
    if (fd >= 0)
        closesocket(fd);
    if (ip[0])
        show("[주소] %s — 다른 컴퓨터는  deolmi 이름 %s  으로 들어와요 (같은 와이파이여야 해요)", ip, ip);
    else
        show("[주소] 주소를 못 찾았어요 — 같은 컴퓨터에서는  deolmi 이름  으로 들어와요");
}

/* ================= ⑤ 실행 ================= */

int main(int argc, char **argv)
{
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);
    InitializeCriticalSection(&mx);
    SetConsoleOutputCP(CP_UTF8);   /* 화면에 UTF-8 한글이 깨지지 않게 */
    /* 윈도우의 argv는 UTF-8이 아니라서, 이름을 UTF-16으로 다시 받아 UTF-8로 바꾼다 */
    static char arg_buf[4][256], *arg_ptr[4];
    wchar_t **wargv = CommandLineToArgvW(GetCommandLineW(), &argc);
    if (argc > 4)
        argc = 4;
    for (int i = 0; i < argc; i++) {
        WideCharToMultiByte(CP_UTF8, 0, wargv[i], -1, arg_buf[i], sizeof(arg_buf[i]), NULL, NULL);
        arg_ptr[i] = arg_buf[i];
    }
    argv = arg_ptr;

    if (argc < 2 || !valid_name(argv[1])) {
        fprintf(stderr, "쓰는 법:  deolmi 이름 --host    방을 연다 (방장)\n"
                        "          deolmi 이름 [주소]    방에 들어간다 (주소는 방장 화면의 [주소])\n"
                        "이름은 한글 5글자(15바이트)까지, 띄어쓰기와 / 없이\n");
        return 1;
    }
    strncpy(my_name, argv[1], NAME_LEN - 1);
    mode = (argc >= 3 && strcmp(argv[2], "--host") == 0) ? M_HOST : M_JOIN;

    int lfd = -1;
    if (mode == M_HOST) {
        lfd = net_listen(PORT);
        if (lfd < 0) {
            fprintf(stderr, "%d번 포트로 방을 열 수 없어요. 이미 켜 둔 방장이 있는지 보세요\n", PORT);
            return 1;
        }
        show("덜미 · %s · 방장 — 이 창이 방이에요", my_name);
        show_my_address();
    } else {
        const char *host = argc >= 3 ? argv[2] : "127.0.0.1";
        srv.fd = net_connect(host, PORT);
        if (srv.fd < 0) {
            fprintf(stderr, "%s 에 접속하지 못했어요. 방장이 --host 로 방을 열었는지, 주소가 맞는지,\n"
                            "같은 와이파이인지 보세요 (학교 와이파이에서 막히면 휴대폰 핫스팟으로)\n", host);
            return 1;
        }
        pkt_init(&out, T_HELLO, my_name, NULL);
        send_packet(srv.fd, &out);
        show("덜미 · %s · %s 에 접속", my_name, host);
    }
    show_guide();

    CloseHandle(CreateThread(NULL, 0, input_thread, NULL, 0, NULL));

    /* 받기는 여기서: select로 접속 문(방장)이나 방장과의 연결(참가자), 들어온 사람들을 같이 지켜본다 */
    for (;;) {
        fd_set fds;
        int top = mode == M_HOST ? lfd : srv.fd, maxfd = top;
        FD_ZERO(&fds);
        FD_SET(top, &fds);
        LOCK();
        int n = nclients;
        for (int i = 0; i < n; i++) {
            FD_SET(clients[i].c.fd, &fds);
            if (clients[i].c.fd > maxfd)
                maxfd = clients[i].c.fd;
        }
        UNLOCK();
        if (select(maxfd + 1, &fds, NULL, NULL, NULL) < 0)
            continue;

        LOCK();
        for (int i = n - 1; i >= 0; i--)   /* 뒤에서부터: 도중에 지워도 안 본 칸이 밀려오지 않는다 */
            if (FD_ISSET(clients[i].c.fd, &fds))
                serve(i);
        if (FD_ISSET(top, &fds)) {
            if (mode == M_JOIN)
                join_read();
            else
                add_client((int)accept(lfd, NULL, NULL));
        }
        UNLOCK();
    }
}
#endif   /* NET_ONLY */
