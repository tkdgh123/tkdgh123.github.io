/* 덜미 — 프밍기2 팀 프로젝트 메신저 (윈도우용, 암호화 전 단계라 메시지는 평문)
   빌드: Visual Studio 개발자 명령 프롬프트에서  cl /utf-8 deolmi.c
   실행: deolmi 이름 --host  (방장: 방을 열고 중계하면서 대화)
         deolmi 이름 [주소]  (참가자: 방장에게 접속, 주소를 안 쓰면 127.0.0.1)
   만든 사람: 김창식(기획·결정·실행 확인), Claude(Anthropic의 AI — 코드 작성) */
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
   TCP는 메시지 경계를 모르므로 앞에 길이 4바이트를 붙여 보내고, 그만큼 모이면 한 통으로 꺼낸다.
   한 통 = 길이 4 + 헤더 33(종류 1 · 보낸 사람 16 · 받을 사람 16) + 본문 */

#define NAME_LEN  16                  /* 이름 15바이트(한글 5글자) + 끝 표시 */
#define HDR_LEN   (1 + NAME_LEN + NAME_LEN)
#define MAX_BODY  65536
#define PKT_MAX   (4 + HDR_LEN + MAX_BODY)

enum { T_HELLO = 1, T_MSG, T_SYS };   /* 이름 밝히기 · 대화(to가 비면 모두에게) · 방장의 알림 */

struct packet {
    uint8_t  type;
    char     from[NAME_LEN], to[NAME_LEN];
    uint32_t body_len;
    uint8_t  body[MAX_BODY];
};

struct conn {                         /* 받는 중인 바이트를 모아 두는 곳 */
    int     fd;
    uint8_t buf[PKT_MAX];
    size_t  len;
};

int net_listen(int port)
{
    int fd = (int)socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    if (fd < 0 || bind(fd, (struct sockaddr *)&addr, sizeof(addr)) < 0 || listen(fd, 16) < 0)
        return -1;
    return fd;
}

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

/* 구조체를 그대로 보내지 않고 한 칸씩 늘어놓는다 (컴퓨터마다 빈 바이트가 다르게 끼어서) */
size_t pack_packet(const struct packet *p, uint8_t *out)
{
    uint32_t len = HDR_LEN + p->body_len, nlen = htonl(len);
    memcpy(out, &nlen, 4);
    out[4] = p->type;
    memcpy(out + 5, p->from, NAME_LEN);
    memcpy(out + 5 + NAME_LEN, p->to, NAME_LEN);
    memcpy(out + 4 + HDR_LEN, p->body, p->body_len);
    return 4 + len;
}

int send_packet(int fd, const struct packet *p)
{
    static uint8_t out[PKT_MAX];
    size_t total = pack_packet(p, out), sent = 0;
    while (sent < total) {            /* send는 일부만 보낼 수 있다 */
        int n = send(fd, (const char *)out + sent, (int)(total - sent), 0);
        if (n <= 0)
            return -1;
        sent += n;
    }
    return 0;
}

/* 읽은 만큼 버퍼 뒤에 붙인다. >0 받음, 0 끊김, -1 오류 */
int conn_read(struct conn *c)
{
    int n = recv(c->fd, (char *)c->buf + c->len, (int)(sizeof(c->buf) - c->len), 0);
    if (n > 0)
        c->len += n;
    return n;
}

/* 패킷이 통째로 모였으면 하나 꺼낸다. 1 꺼냄, 0 덜 옴, -1 잘못된 길이 */
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
        return 0;
    p->type = c->buf[4];
    memcpy(p->from, c->buf + 5, NAME_LEN);
    memcpy(p->to, c->buf + 5 + NAME_LEN, NAME_LEN);
    p->from[NAME_LEN - 1] = p->to[NAME_LEN - 1] = '\0';
    p->body_len = len - HDR_LEN;
    memcpy(p->body, c->buf + 4 + HDR_LEN, p->body_len);
    c->len -= 4 + len;                /* 꺼낸 만큼 앞으로 당긴다 */
    memmove(c->buf, c->buf + 4 + len, c->len);
    return 1;
}

#ifndef NET_ONLY   /* tests/ 는 위의 ① 통신 부분만 가져다 쓴다 */

#define PORT      9000
#define MAX_PEOPLE 60                 /* 배열 크기 (윈도우 select가 한 번에 64개까지 본다) */
#define INPUT_MAX 1000

static int  is_host;
static char my_name[NAME_LEN];
static char dm_to[NAME_LEN];          /* 1:1 상대. 비어 있으면 전체 대화 */
static struct packet pkt, out;        /* 64KB가 넘어서 전역 */
static CRITICAL_SECTION mx;           /* 입력 스레드와 받는 쪽이 같은 데이터를 동시에 건드리지 않게 */

/* ================= ② 화면 ================= */

static void show(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\n");
    fflush(stdout);
}

static void clean(char *s)            /* 받은 글의 제어 문자는 ? 로 (내 터미널을 조작하지 못하게) */
{
    for (; *s; s++)
        if ((unsigned char)*s < 0x20 || *s == 0x7f)
            *s = '?';
}

static int valid_name(const char *s)   /* 1~15바이트, 띄어쓰기·/·제어 문자 없이 */
{
    for (const char *c = s; *c; c++)
        if ((unsigned char)*c <= ' ' || *c == '/')
            return 0;
    return s[0] && strlen(s) < NAME_LEN;
}

/* 방에 있는 사람 목록 (나 빼고) — /who 와 /dm 에 쓴다 */
static char peers[MAX_PEOPLE][NAME_LEN];
static int  npeers;

static int find_peer(const char *name)
{
    for (int i = 0; i < npeers; i++)
        if (strcmp(peers[i], name) == 0)
            return i;
    return -1;
}

static void add_peer(const char *name)
{
    if (name[0] && strcmp(name, my_name) != 0 && find_peer(name) < 0 && npeers < MAX_PEOPLE)
        strcpy(peers[npeers++], name);
}

static void remove_peer(const char *name)
{
    int i = find_peer(name);
    if (i < 0)
        return;
    if (strcmp(dm_to, name) == 0)     /* 1:1 상대가 나가면 전체 대화로 */
        dm_to[0] = '\0';
    strcpy(peers[i], peers[--npeers]);
}

/* ================= ③ 중계: 방장 =================
   방장이 서버다. 받은 패킷의 to 를 보고 그 사람에게만, to 가 비어 있으면 보낸 사람 빼고 모두에게 전한다 */

struct client {
    struct conn c;
    char name[NAME_LEN];
    int  registered;                  /* HELLO로 이름을 밝혔나 */
};
static struct client clients[MAX_PEOPLE];
static int nclients;

static int find_client(const char *name)
{
    for (int i = 0; i < nclients; i++)
        if (clients[i].registered && strcmp(clients[i].name, name) == 0)
            return i;
    return -1;
}

static void pkt_init(struct packet *p, int type, const char *from, const char *to)
{
    memset(p, 0, sizeof(*p));
    p->type = (uint8_t)type;
    strncpy(p->from, from, NAME_LEN - 1);
    strncpy(p->to, to, NAME_LEN - 1);
}

static void send_sys(int i, const char *fmt, ...)   /* i번에게 알림 한 줄 */
{
    va_list ap;
    pkt_init(&out, T_SYS, "", clients[i].name);
    va_start(ap, fmt);
    out.body_len = vsnprintf((char *)out.body, MAX_BODY, fmt, ap);
    va_end(ap);
    send_packet(clients[i].c.fd, &out);
}

static void sys_all(const char *name, const char *what)   /* 모두에게 "이름 입장/퇴장" */
{
    show("[알림] %s %s", name, what);
    for (int k = 0; k < nclients; k++)
        if (clients[k].registered)
            send_sys(k, "%s %s", name, what);
}

static void drop_client(int i)        /* i번을 지우고 마지막 사람을 그 자리로 */
{
    char name[NAME_LEN];
    int was_registered = clients[i].registered;
    strcpy(name, clients[i].name);
    closesocket(clients[i].c.fd);
    clients[i] = clients[--nclients];
    if (was_registered) {
        remove_peer(name);
        sys_all(name, "퇴장");
    }
}

static int handle_hello(int i, const struct packet *p)
{
    if (!valid_name(p->from) || find_client(p->from) >= 0 || strcmp(p->from, my_name) == 0) {
        send_sys(i, "이름 사용 중이거나 쓸 수 없음: %s", p->from);
        drop_client(i);
        return -1;
    }
    strcpy(clients[i].name, p->from);
    clients[i].registered = 1;
    /* 새 사람에게 이미 있는 사람들과 방장을 알려 준다. 기존 사람들은 "입장" 알림으로 안다 */
    for (int k = 0; k < nclients; k++)
        if (k != i && clients[k].registered) {
            pkt_init(&out, T_HELLO, clients[k].name, p->from);
            send_packet(clients[i].c.fd, &out);
        }
    pkt_init(&out, T_HELLO, my_name, p->from);
    send_packet(clients[i].c.fd, &out);
    add_peer(p->from);
    sys_all(p->from, "입장");
    return 0;
}

static void display_msg(const struct packet *p);   /* ④에 있음 */

static int handle_packet(int i, struct packet *p)  /* 이 사람을 끊었으면 -1 */
{
    if (!clients[i].registered && p->type != T_HELLO) {
        send_sys(i, "먼저 HELLO를 보내야 합니다");
        drop_client(i);
        return -1;
    }
    if (p->type == T_HELLO)
        return handle_hello(i, p);
    if (p->type != T_MSG)             /* 참가자가 보내는 건 MSG뿐 */
        send_sys(i, "모르는 type: %d", p->type);
    else if (strcmp(p->from, clients[i].name) != 0)   /* 남의 이름으로 보내기 차단 */
        send_sys(i, "보낸 사람 이름이 다릅니다: %s", p->from);
    else if (p->to[0] == '\0') {     /* 모두에게: 방장 화면에 띄우고 보낸 사람 빼고 전원에게 */
        display_msg(p);
        for (int k = 0; k < nclients; k++)
            if (k != i && clients[k].registered)
                send_packet(clients[k].c.fd, p);
    } else if (strcmp(p->to, my_name) == 0) {
        display_msg(p);               /* 방장에게만 온 것 */
    } else {
        int to = find_client(p->to);
        if (to < 0)
            send_sys(i, "%s는 접속해 있지 않습니다", p->to);
        else
            send_packet(clients[to].c.fd, p);
    }
    return 0;
}

static void serve(int i)              /* i번 소켓에 온 것을 읽어 패킷마다 처리 */
{
    int r;
    if (conn_read(&clients[i].c) <= 0) {
        drop_client(i);
        return;
    }
    while ((r = conn_take(&clients[i].c, &pkt)) == 1)
        if (handle_packet(i, &pkt) < 0)
            return;
    if (r < 0)
        drop_client(i);               /* 말이 안 되는 길이: 그 사람만 끊는다 */
}

/* ================= ④ 대화: 방장·참가자 ================= */

static struct conn srv;               /* 참가자: 방장과의 연결 */
static char text[MAX_BODY + 1];       /* 받은 글 (끝 표시를 붙이고 제어 문자를 지운 것) */

static void display_msg(const struct packet *p)
{
    char from[NAME_LEN];
    strcpy(from, p->from);
    clean(from);
    memcpy(text, p->body, p->body_len);
    text[p->body_len] = '\0';
    clean(text);
    if (p->type == T_SYS)
        show("[알림] %s", text);
    else
        show(p->to[0] ? "[%s → 나] %s" : "[%s] %s", from, text);
}

static void join_read(void)           /* 참가자: 방장에게서 온 것 받기 */
{
    int r;
    if (conn_read(&srv) <= 0) {
        show("[알림] 방장과 연결이 끊어졌습니다");
        exit(1);
    }
    while ((r = conn_take(&srv, &pkt)) == 1) {
        if (pkt.type == T_HELLO) {
            add_peer(pkt.from);
            continue;
        }
        display_msg(&pkt);
        if (pkt.type == T_SYS) {      /* "이름 입장/퇴장" 이면 목록을 고친다 */
            char name[NAME_LEN + 1], what[16];
            if (sscanf(text, "%16s %15s", name, what) == 2 && strlen(name) < NAME_LEN) {
                if (strcmp(what, "입장") == 0)
                    add_peer(name);
                else if (strcmp(what, "퇴장") == 0)
                    remove_peer(name);
            }
        }
    }
    if (r < 0)
        exit(1);
}

static void send_text(const char *msg)   /* 1:1이면 to = 그 사람, 전체면 to 를 비운다 */
{
    size_t len = strlen(msg);
    if (len > INPUT_MAX) {
        len = INPUT_MAX;
        while (len > 0 && ((unsigned char)msg[len] & 0xC0) == 0x80)
            len--;                    /* 한글 글자 중간에서 자르지 않게 */
    }
    pkt_init(&out, T_MSG, my_name, dm_to);
    memcpy(out.body, msg, len);
    out.body_len = (uint32_t)len;
    if (!is_host)
        send_packet(srv.fd, &out);    /* 참가자는 방장에게, 방장은 직접 그 사람(전체면 모두)에게 */
    else
        for (int k = 0; k < nclients; k++)
            if (clients[k].registered && (!dm_to[0] || strcmp(clients[k].name, dm_to) == 0))
                send_packet(clients[k].c.fd, &out);
}

static void on_line(const char *line)
{
    if (strcmp(line, "/quit") == 0) {
        exit(0);
    } else if (strcmp(line, "/all") == 0) {
        dm_to[0] = '\0';
        show("[전체 대화] 모두에게 갑니다");
    } else if (strncmp(line, "/dm ", 4) == 0) {
        if (find_peer(line + 4) < 0) {
            show("[1:1 대화] %s는 접속해 있지 않습니다 (/who 로 확인)", line + 4);
        } else {
            strcpy(dm_to, line + 4);
            show("[1:1 대화] %s에게만 갑니다 · /all 로 돌아오기", dm_to);
        }
    } else if (strcmp(line, "/who") == 0) {
        printf("[접속 중] %s(나)", my_name);
        for (int i = 0; i < npeers; i++)
            printf(", %s", peers[i]);
        show("");
    } else if (line[0] == '/') {
        show("[알림] 명령: /dm 이름 · /all · /who · /quit");
    } else if (npeers == 0) {
        show("[알림] 아직 아무도 없습니다");
    } else {
        send_text(line);
    }
}

/* 입력 스레드: 키보드에서 한 줄씩 읽어 처리한다 */
static DWORD WINAPI input_thread(LPVOID unused)
{
    static wchar_t w[INPUT_MAX + 2];
    static char line[4 * INPUT_MAX];
    HANDLE h = GetStdHandle(STD_INPUT_HANDLE);
    DWORD mode, got;
    (void)unused;
    for (;;) {
        if (GetConsoleMode(h, &mode)) {   /* 키보드: 한글이 깨지지 않게 UTF-16으로 받아 UTF-8로 */
            if (!ReadConsoleW(h, w, INPUT_MAX, &got, NULL) || got == 0)
                break;
            line[WideCharToMultiByte(CP_UTF8, 0, w, (int)got, line, sizeof(line) - 1, NULL, NULL)] = '\0';
        } else if (!fgets(line, sizeof(line), stdin)) {   /* 파이프로 입력을 준 경우 */
            break;
        }
        size_t n = strcspn(line, "\r\n");
        while (n > 0 && line[n - 1] == ' ')   /* 끝 공백 무시 ("/who " 도 명령으로) */
            n--;
        line[n] = '\0';
        if (n == 0)
            continue;
        EnterCriticalSection(&mx);
        on_line(line);
        LeaveCriticalSection(&mx);
    }
    exit(0);
}

static void show_my_address(void)     /* UDP는 connect만 하면 아무것도 안 보내고 내 주소만 정해진다 */
{
    struct sockaddr_in to = {0}, me;
    int len = sizeof(me);
    char ip[INET_ADDRSTRLEN] = "127.0.0.1";
    int fd = (int)socket(AF_INET, SOCK_DGRAM, 0);
    to.sin_family = AF_INET;
    to.sin_port = htons(53);
    inet_pton(AF_INET, "8.8.8.8", &to.sin_addr);
    if (connect(fd, (struct sockaddr *)&to, sizeof(to)) == 0 && getsockname(fd, (struct sockaddr *)&me, &len) == 0)
        inet_ntop(AF_INET, &me.sin_addr, ip, sizeof(ip));
    closesocket(fd);
    show("[주소] 다른 컴퓨터는  deolmi 이름 %s  으로 들어와요 (같은 와이파이)", ip);
}

/* ================= ⑤ 실행 ================= */

int main(void)
{
    static char argv[3][256];
    int argc, lfd = -1;
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);
    InitializeCriticalSection(&mx);
    SetConsoleOutputCP(CP_UTF8);      /* 화면에 UTF-8 한글이 깨지지 않게 */
    /* 명령줄을 UTF-16으로 받아 UTF-8로 바꾼다 (그냥 받으면 한글 이름이 깨진다) */
    wchar_t **wargv = CommandLineToArgvW(GetCommandLineW(), &argc);
    for (int i = 0; i < argc && i < 3; i++)
        WideCharToMultiByte(CP_UTF8, 0, wargv[i], -1, argv[i], sizeof(argv[i]), NULL, NULL);

    if (argc < 2 || !valid_name(argv[1])) {
        printf("쓰는 법: deolmi 이름 --host (방을 연다) / deolmi 이름 [주소] (방에 들어간다)\n"
               "이름은 한글 5글자까지, 띄어쓰기와 / 없이\n");
        return 1;
    }
    strcpy(my_name, argv[1]);
    is_host = argc >= 3 && strcmp(argv[2], "--host") == 0;
    if (is_host) {
        if ((lfd = net_listen(PORT)) < 0) {
            printf("%d번 포트로 방을 열 수 없어요 (이미 켜 둔 방장이 있나요?)\n", PORT);
            return 1;
        }
        show("덜미 · %s · 방장", my_name);
        show_my_address();
    } else {
        const char *host = argc >= 3 ? argv[2] : "127.0.0.1";
        if ((srv.fd = net_connect(host, PORT)) < 0) {
            printf("%s 에 접속하지 못했어요. 방장이 방을 열었는지, 주소와 와이파이가 맞는지 보세요\n", host);
            return 1;
        }
        pkt_init(&out, T_HELLO, my_name, "");
        send_packet(srv.fd, &out);
        show("덜미 · %s · %s 에 접속", my_name, host);
    }
    show("그냥 치면 모두에게 · /dm 이름 = 1:1 · /all · /who · /quit");
    CloseHandle(CreateThread(NULL, 0, input_thread, NULL, 0, NULL));

    for (;;) {                        /* 받기: select로 접속 문(방장)이나 방장 연결(참가자), 들어온 사람들을 지켜본다 */
        fd_set fds;
        int top = is_host ? lfd : srv.fd, n;
        FD_ZERO(&fds);
        FD_SET(top, &fds);
        EnterCriticalSection(&mx);
        n = nclients;
        for (int i = 0; i < n; i++)
            FD_SET(clients[i].c.fd, &fds);
        LeaveCriticalSection(&mx);
        if (select(0, &fds, NULL, NULL, NULL) < 0)
            continue;
        EnterCriticalSection(&mx);
        for (int i = n - 1; i >= 0; i--)   /* 뒤에서부터: 도중에 지워도 안 본 사람이 밀려오지 않게 */
            if (FD_ISSET(clients[i].c.fd, &fds))
                serve(i);
        if (FD_ISSET(top, &fds) && !is_host)
            join_read();
        else if (FD_ISSET(top, &fds)) {
            int fd = (int)accept(lfd, NULL, NULL);
            if (fd >= 0 && nclients < MAX_PEOPLE) {
                memset(&clients[nclients], 0, sizeof(clients[0]));
                clients[nclients++].c.fd = fd;
            } else
                closesocket(fd);
        }
        LeaveCriticalSection(&mx);
    }
}
#endif   /* NET_ONLY */
