/* 덜미 — 프밍기2 메신저. 이 파일 하나가 프로그램 전부다 (평문 단계).

   빌드:  리눅스·맥·WSL     gcc -Wall -Wextra -o deolmi deolmi.c      (또는 make)
          윈도우 MSYS2/MinGW  gcc -Wall -Wextra -o deolmi.exe deolmi.c -lws2_32
          윈도우 Visual Studio 개발자 명령 창에서  cl /utf-8 deolmi.c   (→ deolmi.exe)
          (Visual Studio 프로젝트로 빌드할 때는 C/C++ → 명령줄 → 추가 옵션에 /utf-8 — 한글이 깨지지 않게)

   ./deolmi 이름 --host       방장 — 방을 연다. 방장이 서버가 되어 중계하면서 대화에도 낀다
   ./deolmi 이름 [주소]        참가자 — 방장에게 접속 (주소 생략 시 127.0.0.1)
   (윈도우에서는 ./deolmi 대신 .\deolmi)

   차례: ① 통신(패킷 주고받기)  ② 화면  ③ 중계(방장)  ④ 대화  ⑤ main

   누가 무엇을 했나
     김창식 — 기획, 방향 결정(암호화는 나중에·한 파일·주소 표시 등), 실제로 돌려 보고 문제 찾기
     Claude (Anthropic의 AI) — 이 코드 작성, 테스트 작성·실행, 작업실 사이트(설명서·코드·시작하기·작업 기록) 작성
     자세한 내역: https://tkdgh123.github.io/secure-msg/log/

   ※ 암호화는 아직 안 넣은 단계다. 메시지는 평문으로 오가고, 패킷에도 암호화용 칸이 없다.
     통신이 먼저 되게 만든 것이고, 암호화는 이 위에 다음 단계로 얹는다. */
#ifdef _WIN32   /* 윈도우: 소켓은 winsock, 키보드·화면은 콘솔 API로 */
#define _CRT_SECURE_NO_WARNINGS
#undef  _WIN32_WINNT
#define _WIN32_WINNT 0x0601   /* 윈도우 7 이후 기능까지 쓴다 (WSAPoll = 윈도우판 poll) */
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <shellapi.h>
#ifdef _MSC_VER
#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "shell32.lib")
#endif
#else
#include <poll.h>
#include <unistd.h>
#include <termios.h>
#include <fcntl.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <ifaddrs.h>
#include <net/if.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#endif
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include <signal.h>
#include <errno.h>

#ifdef _WIN32
#define close(s) closesocket(s)   /* 윈도우는 소켓을 close가 아니라 closesocket으로 닫는다 */
#define poll     WSAPoll
#ifndef ENABLE_VIRTUAL_TERMINAL_PROCESSING
#define ENABLE_VIRTUAL_TERMINAL_PROCESSING 0x0004
#endif

/* 윈도우 소켓 오류는 errno가 아니라 WSAGetLastError()에 있다. perror 대신 이걸로 (윈도우 한국어 설명이 나온다) */
static void sock_perror(const char *what)
{
    int e = WSAGetLastError();
    wchar_t w[256];
    char s[768] = "";
    if (FormatMessageW(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, e, 0, w, 256, NULL))
        WideCharToMultiByte(CP_UTF8, 0, w, -1, s, sizeof(s), NULL, NULL);
    s[strcspn(s, "\r\n")] = '\0';
    fprintf(stderr, "%s: %s (오류 %d)\n", what, s, e);
}
#define perror(s) sock_perror(s)
#endif

/* ================= ① 통신: 길이 붙인 패킷 =================
   TCP는 "어디까지가 한 메시지"인지 모른다. 그래서 보낼 때 맨 앞에 길이 4바이트를 붙이고,
   받을 때는 그 길이만큼 다 모일 때까지 기다렸다가 한 통으로 꺼낸다 (conn_take).

   한 통 = 길이 4바이트 + 헤더 33바이트(type 1 · from 16 · to 16) + 본문 */

#ifndef MSG_NOSIGNAL        /* 맥에는 없다. 대신 main에서 SIGPIPE를 무시한다 */
#define MSG_NOSIGNAL 0
#endif

#define NAME_LEN   16       /* 이름 최대 15바이트 (한글 5글자) + 끝 표시 */
#define HDR_LEN    (1 + NAME_LEN + NAME_LEN)   /* 33 */
#define MAX_BODY   65536
#define PKT_MAX    (4 + HDR_LEN + MAX_BODY)

/* 패킷 종류: HELLO(접속하며 이름 밝히기, 본문 없음) · MSG(대화) · SYS(방장 프로그램의 알림) */
enum { T_HELLO = 1, T_MSG, T_SYS };

struct packet {
    uint8_t  type;
    char     from[NAME_LEN], to[NAME_LEN];   /* 보낸 사람, 받을 사람 (MSG의 to가 비면 모두에게) */
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
    int fd = (int)socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) {
        perror("socket");
        return -1;
    }

#ifndef _WIN32
    /* 껐다 바로 켜도 Address already in use가 안 나게.
       윈도우에서는 이 옵션이 "같은 포트를 둘이 같이 쓰기"라서 방이 두 개 열려 버린다 → 안 쓴다 */
    int on = 1;
    setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on));
#endif

    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);
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

    int fd = (int)socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) {
        perror("socket");
        freeaddrinfo(res);
        return -1;
    }

    /* 5초 안에 안 붙으면 포기한다. 중간에서 막힌 네트워크면 그냥 두면 2분 넘게 아무 말 없이 멈춘다.
       그래서 잠깐 기다리지 않는 모드로 접속을 걸어 두고, poll로 5초만 기다린다 */
#ifdef _WIN32
    u_long nb = 1;
    ioctlsocket(fd, FIONBIO, &nb);
    int r = connect(fd, res->ai_addr, (int)res->ai_addrlen);
    int err = r < 0 ? WSAGetLastError() : 0;
    if (err == WSAEWOULDBLOCK) {     /* 리눅스의 EINPROGRESS: 접속 거는 중 */
        struct pollfd p = { .fd = fd, .events = POLLOUT };
        int len = sizeof(err);
        err = WSAETIMEDOUT;
        if (poll(&p, 1, 5000) == 1)
            getsockopt(fd, SOL_SOCKET, SO_ERROR, (char *)&err, &len);
    }
    nb = 0;
    ioctlsocket(fd, FIONBIO, &nb);
    WSASetLastError(err);            /* perror가 이 번호로 설명을 찾는다 */
    /* main이 errno로 이유를 고르므로 리눅스와 같은 이름으로 바꿔 둔다 */
    errno = err == WSAECONNREFUSED ? ECONNREFUSED : err == WSAETIMEDOUT ? ETIMEDOUT
          : err == WSAEHOSTUNREACH ? EHOSTUNREACH : err == WSAENETUNREACH ? ENETUNREACH : err;
    r = err ? -1 : 0;
#else
    int flags = fcntl(fd, F_GETFL, 0);
    fcntl(fd, F_SETFL, flags | O_NONBLOCK);
    int r = connect(fd, res->ai_addr, res->ai_addrlen);
    if (r < 0 && errno == EINPROGRESS) {
        struct pollfd p = { .fd = fd, .events = POLLOUT };
        int err = ETIMEDOUT;
        socklen_t len = sizeof(err);
        if (poll(&p, 1, 5000) == 1)
            getsockopt(fd, SOL_SOCKET, SO_ERROR, &err, &len);
        errno = err;
        r = err ? -1 : 0;
    }
    fcntl(fd, F_SETFL, flags);
#endif
    freeaddrinfo(res);
    if (r < 0) {
        int e = errno;   /* 왜 실패했는지는 부른 쪽에서 errno로 본다 */
        perror("connect");
        close(fd);
        errno = e;
        return -1;
    }
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
    memcpy(q, p->body, p->body_len);
    return 4 + len;
}

int send_packet(int fd, const struct packet *p)
{
    static uint8_t out[PKT_MAX];
    size_t total = pack_packet(p, out), sent = 0;

    while (sent < total) {           /* send는 일부만 보낼 수 있다 */
        int n = (int)send(fd, (const char *)out + sent, (int)(total - sent), MSG_NOSIGNAL);
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

enum { M_HOST, M_JOIN };  /* 실행 방식: 방장 / 참가자 */

static int  mode;
static char my_name[NAME_LEN];       /* 내 이름 */
static char dm_to[NAME_LEN];         /* 비어 있으면 전체 대화 */
static struct packet pkt, out;       /* 받는 패킷 / 보내는 패킷 (64KB가 넘어서 전역) */

/* ================= ② 화면 ================= */

static int tty;                      /* 키보드로 대화 중인가 (입력을 파이프로 주면 0) */
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

/* 글자 하나가 화면에서 몇 칸인가: 한글·한자·이모지 같은 넓은 글자는 2칸 (윈도우에는 wcwidth가 없어서 직접) */
static int char_width(uint32_t c)
{
    return (c >= 0x1100 && c <= 0x115F) || (c >= 0x2E80 && c <= 0xA4CF) || (c >= 0xAC00 && c <= 0xD7A3)
        || (c >= 0xF900 && c <= 0xFAFF) || (c >= 0xFE30 && c <= 0xFE4F) || (c >= 0xFF00 && c <= 0xFF60)
        || (c >= 0xFFE0 && c <= 0xFFE6) || (c >= 0x1F300 && c <= 0x1FAFF) || (c >= 0x20000 && c <= 0x3FFFD)
        ? 2 : 1;
}

/* 터미널 폭 cols에서 s를 찍으면 줄이 몇 번 넘어가나. s는 UTF-8: 첫 바이트가 글자 길이를 알려 준다 */
static int rows_after(const char *s, int cols)
{
    int x = 0, rows = 0;
    while (*s) {
        unsigned char b = (unsigned char)*s;
        int n = b >= 0xF0 ? 4 : b >= 0xE0 ? 3 : b >= 0xC0 ? 2 : 1;
        uint32_t c = n == 1 ? b : (uint32_t)(b & (0x3F >> (n - 1)));
        for (int k = 1; k < n; k++) {
            if ((s[k] & 0xC0) != 0x80) {   /* 글자가 중간에 끊겼으면 거기까지만 */
                n = k;
                break;
            }
            c = (c << 6) | (s[k] & 0x3F);
        }
        int cw = char_width(c);
        if (x + cw > cols) {
            rows++;
            x = 0;
        }
        x += cw;
        s += n;
    }
    return rows;
}

static int term_cols(void)   /* 터미널 폭 (모르면 80) */
{
#ifdef _WIN32
    CONSOLE_SCREEN_BUFFER_INFO b;
    if (GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &b) && b.dwSize.X > 0)
        return b.dwSize.X;
#else
    struct winsize ws;
    if (ioctl(1, TIOCGWINSZ, &ws) == 0 && ws.ws_col > 0)
        return ws.ws_col;
#endif
    return 80;
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

    prompt(line, sizeof(line));
    strcat(line, input);
    printf("%s", line);
    drawn_rows = rows_after(line, term_cols());
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

/* 대화 화면에서 아는 사람들 (방장·참가자 공통). /who, /dm 에 쓴다 */
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

/* ================= ③ 중계: 방장 =================
   방장이 서버다. 참가자들은 방장에게 접속하고, 방장은 패킷의 to 를 보고 그 사람에게만 전한다.
   to 가 비어 있으면 보낸 사람을 뺀 모두에게 전한다 */

struct client {
    struct conn c;
    char    name[NAME_LEN];
    int     registered;
};

/* 한 칸 더: 17번째의 HELLO까지 읽은 뒤에 "꽉 참"을 보내야 알림이 사라지지 않는다
   (안 읽은 데이터가 남은 채 close하면 RST가 나가서 받는 쪽이 알림을 못 읽는다) */
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

/* i번에게 "name이 방에 있다" (HELLO, 본문 없음) */
static void send_hello(int i, const char *name)
{
    pkt_init(&out, T_HELLO, name, clients[i].name);
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
    if (!valid_name(p->from) || find_client(p->from) >= 0
        || strncmp(p->from, my_name, NAME_LEN) == 0) {
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
    me->registered = 1;
    show("[알림] %s 입장", me->name);

    /* 새 사람에게 이미 방에 있는 사람들을 알린다. 방장도 방에 있는 한 사람이다.
       기존 사람들은 아래 "입장" 알림으로 새 사람을 안다 */
    for (int k = 0; k < nclients; k++)
        if (k != i && clients[k].registered)
            send_hello(i, clients[k].name);
    send_hello(i, my_name);
    add_peer(me->name);
    for (int k = 0; k < nclients; k++)
        if (clients[k].registered)
            send_sys(k, "%s 입장", me->name);
    return 0;
}

/* to에게 중계 */
static void relay(int to, struct packet *p)
{
    send_packet(clients[to].c.fd, p);   /* 실패해도 다음 poll에서 끊김으로 잡힌다 */
}

static void display_msg(const struct packet *p);   /* ④에 있음 */
static void show_guide(void);                      /* ⑤ 바로 위에 있음 */

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
    if (p->type != T_MSG) {   /* 참가자가 보내는 건 MSG뿐 (SYS는 방장만 만든다) */
        send_sys(i, "모르는 type: %d", p->type);
        return 0;
    }
    if (strncmp(p->from, clients[i].name, NAME_LEN) != 0) {
        send_sys(i, "보낸 사람 이름이 다릅니다: %s", p->from);   /* 남의 이름으로 보내기 차단 */
        return 0;
    }
    if (p->to[0] == '\0') {   /* 모두에게: 방장 화면에 띄우고, 보낸 사람 빼고 전원에게 */
        display_msg(p);
        for (int k = 0; k < nclients; k++)
            if (k != i && clients[k].registered)
                relay(k, p);
        return 0;
    }
    if (strncmp(p->to, my_name, NAME_LEN) == 0) {
        display_msg(p);   /* 방장한테만 온 것 */
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

static struct conn srv;   /* 참가자: 방장과의 연결 */

static void display_msg(const struct packet *p)
{
    char from[NAME_LEN + 1];
    static char text[MAX_BODY];
    memcpy(from, p->from, NAME_LEN);
    from[NAME_LEN] = '\0';
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

/* 참가자: 방장에게서 받기 */
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
    }
    if (r < 0) {
        show("[알림] 이상한 패킷이 와서 끊습니다");
        exit(1);
    }
}

/* 한 통 보낸다. 1:1이면 to = 그 사람, 전체면 to 를 비운다.
   참가자는 방장에게 한 통만 보내고, 방장은 직접 그 사람(전체면 모두)에게 전한다 */
static void send_text(const char *text)
{
    if (npeers == 0) {
        show("[알림] 아직 아무도 없습니다");
        return;
    }
    size_t len = strlen(text);
    if (len > INPUT_MAX)
        len = INPUT_MAX;
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
        show_guide();
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

#ifdef _WIN32
/* 윈도우: 키보드는 소켓이 아니라서 WSAPoll로 못 기다린다. main이 0.05초마다 이걸로 확인한다 */
static int keys_waiting(void)
{
    HANDLE h = GetStdHandle(STD_INPUT_HANDLE);
    DWORD n = 0;
    if (GetConsoleMode(h, &n))   /* 키보드 */
        return GetNumberOfConsoleInputEvents(h, &n) && n > 0;
    if (GetFileType(h) == FILE_TYPE_PIPE)   /* 파이프: 끊긴 것도 "읽을 것 있음" → 읽다가 끝난다 */
        return !PeekNamedPipe(h, NULL, 0, NULL, &n, NULL) || n > 0;
    return 1;                    /* 파일 */
}

/* 받은 입력을 UTF-8 바이트로 buf에. 끝(EOF)이면 -1 */
static int read_stdin(unsigned char *buf, int size)
{
    HANDLE h = GetStdHandle(STD_INPUT_HANDLE);
    DWORD got = 0, m;
    if (!GetConsoleMode(h, &m))   /* 파이프·파일: 바이트 그대로 */
        return ReadFile(h, buf, size, &got, NULL) && got > 0 ? (int)got : -1;

    /* 키보드: 누른 키를 하나씩 받는다. 글자는 UTF-16이라 UTF-8로 바꾼다.
       화살표처럼 글자가 없는 키, 키를 뗀 것, 마우스·창 이벤트는 건너뛴다.
       단 이모지처럼 자판에 없는 글자는 "Alt 키를 뗀 것"에 실려 온다 (Alt+숫자판 입력과 같은 길) */
    static wchar_t high;          /* 이모지처럼 UTF-16 두 개로 된 글자의 앞 반쪽 */
    INPUT_RECORD rec[32];
    int n = 0;
    ReadConsoleInputW(h, rec, 32, &got);
    for (DWORD i = 0; i < got; i++) {
        const KEY_EVENT_RECORD *k = &rec[i].Event.KeyEvent;
        wchar_t w[2] = { high, k->uChar.UnicodeChar };
        if (rec[i].EventType != KEY_EVENT || !w[1] || !(k->bKeyDown || k->wVirtualKeyCode == VK_MENU))
            continue;
        if (w[1] >= 0xD800 && w[1] < 0xDC00) {
            high = w[1];
            continue;
        }
        n += WideCharToMultiByte(CP_UTF8, 0, high ? w : w + 1, high ? 2 : 1,
                                 (char *)buf + n, size - n, NULL, NULL);
        high = 0;
    }
    return n;
}

static DWORD saved_mode;

static void restore_tty(void)
{
    if (tty)
        SetConsoleMode(GetStdHandle(STD_INPUT_HANDLE), saved_mode);
}

/* 색·커서 이동(\033[…)을 켜고, Ctrl+C도 글자로 받아서 on_key가 정리하고 끝내게 한다 */
static void raw_tty(void)
{
    HANDLE in = GetStdHandle(STD_INPUT_HANDLE), scr = GetStdHandle(STD_OUTPUT_HANDLE);
    DWORD m;
    tty = GetConsoleMode(in, &saved_mode) && GetConsoleMode(scr, &m)
       && SetConsoleMode(scr, m | ENABLE_VIRTUAL_TERMINAL_PROCESSING);
    if (!tty)
        return;
    SetConsoleMode(in, saved_mode & ~ENABLE_PROCESSED_INPUT);
    atexit(restore_tty);
}
#else
static int read_stdin(unsigned char *buf, int size)   /* 끝(EOF)이면 -1 */
{
    ssize_t n = read(0, buf, size);
    return n > 0 ? (int)n : -1;
}

static struct termios saved_tio;

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
#endif

static void read_keys(void)
{
    unsigned char buf[256];
    int n = read_stdin(buf, sizeof(buf));
    if (n < 0) {
        clear_input();
        exit(0);
    }
    for (int i = 0; i < n; i++)
        on_key(buf[i]);
    clear_input();
    draw_input();
}

/* 방장: 다른 컴퓨터가 들어올 때 칠 내 주소를 보여 준다 */
#ifdef _WIN32
/* 윈도우: 인터넷으로 나갈 때 쓰는 주소 하나. UDP는 connect만 하면 패킷이 안 나가고 주소만 정해진다 */
static void show_my_address(void)
{
    struct sockaddr_in to = {0}, me;
    socklen_t len = sizeof(me);
    char ip[INET_ADDRSTRLEN];
    int fd = (int)socket(AF_INET, SOCK_DGRAM, 0);

    to.sin_family = AF_INET;
    to.sin_port = htons(53);
    inet_pton(AF_INET, "8.8.8.8", &to.sin_addr);
    if (fd >= 0 && connect(fd, (struct sockaddr *)&to, sizeof(to)) == 0
        && getsockname(fd, (struct sockaddr *)&me, &len) == 0
        && inet_ntop(AF_INET, &me.sin_addr, ip, sizeof(ip)))
        show("[주소] %s — 다른 컴퓨터는  .\\deolmi 이름 %s  으로 들어와요", ip, ip);
    else
        show("[주소] 주소를 못 찾았어요 — 명령 창에 ipconfig 를 쳐서 IPv4 주소를 보세요 (같은 컴퓨터에서는  .\\deolmi 이름)");
    if (fd >= 0)
        close(fd);
    show("[주소] 처음 켤 때 Windows 방화벽 창이 뜨면 '액세스 허용'을 눌러요 (공용 네트워크도 체크)");
}
#else
/* 루프백(127.0.0.1 같은 자기 자신용)과 169.254.x(주소를 못 받았을 때 임시)는 뺀다 */
static void show_my_address(void)
{
    struct ifaddrs *list;
    char ip[INET_ADDRSTRLEN], others[160] = "";
    int n = 0;

    if (getifaddrs(&list) == 0) {
        for (struct ifaddrs *a = list; a; a = a->ifa_next) {
            if (!a->ifa_addr || a->ifa_addr->sa_family != AF_INET
                || (a->ifa_flags & IFF_LOOPBACK) || !(a->ifa_flags & IFF_UP))
                continue;
            inet_ntop(AF_INET, &((struct sockaddr_in *)a->ifa_addr)->sin_addr, ip, sizeof(ip));
            if (strncmp(ip, "169.254.", 8) == 0)
                continue;
            if (n++ == 0)
                show("[주소] %s — 다른 컴퓨터는  ./deolmi 이름 %s  으로 들어와요", ip, ip);
            else
                snprintf(others + strlen(others), sizeof(others) - strlen(others), " %s", ip);
            int b = atoi(ip + 4);   /* 172.16~31 은 WSL 안쪽 주소일 수 있다 */
            if (strncmp(ip, "172.", 4) == 0 && b >= 16 && b <= 31)
                show("[주소] 172.로 시작하면 WSL 안쪽 주소일 수 있어요 — 미러링을 켜야 밖에서 들어와요 (시작하기 05)");
        }
        freeifaddrs(list);
    }
    if (others[0])
        show("[주소] 안 되면 이 주소로:%s", others);
    if (n == 0)
        show("[주소] 네트워크 주소를 못 찾았어요 — 같은 컴퓨터에서는  ./deolmi 이름  으로 들어와요");
}
#endif

/* 시작할 때와 /help 때 보여 주는 설명. 처음 쓰는 사람도 이것만 보고 쓸 수 있게 */
static void show_guide(void)
{
    const char *rule = "────────────────────────────────────────────";
    show("%s", rule);
    if (mode == M_HOST) {
        show("이 창이 방이에요. 내가 서버가 되어 중계하면서 같이 대화해요.");
        show_my_address();
        show("같은 와이파이여야 들어와요. 학교 와이파이에서 안 되면 둘 다 휴대폰 핫스팟에 연결하세요.");
    } else {
        show("방에 들어왔어요. 방장이 나가면 방이 닫혀요.");
    }
    show("사용법");
    show("  그냥 치고 엔터   방에 있는 모두에게 보내기");
    show("  /dm 이름         그 사람하고만 1:1  (/all 로 다시 모두에게)");
    show("  /who             지금 들어와 있는 사람");
    show("  /help            이 설명 다시 보기");
    show("  /quit            나가기%s", mode == M_HOST ? " (방장이 나가면 방이 닫혀요)" : "");
    show("받은 글은 [이름] 내용, 나에게만 온 1:1은 [이름 → 나] 내용 으로 떠요.");
    show("지금은 암호화 전 단계라 메시지가 평문(그대로)으로 오가요.");
    show("만든 사람: 김창식(기획·결정·실행 확인) · Claude(AI — 코드와 사이트 작성)");
    show("누가 무엇을 했는지: https://tkdgh123.github.io/secure-msg/log/");
    show("%s", rule);
}

/* ================= ⑤ 실행 ================= */

int main(int argc, char **argv)
{
#ifdef _WIN32
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        fprintf(stderr, "WSAStartup 실패\n");
        return 1;
    }
    SetConsoleOutputCP(CP_UTF8);   /* 화면에 UTF-8 한글이 깨지지 않게 */

    /* 윈도우의 argv는 UTF-8이 아니라 CP949라서, 한글 이름이 다른 사람(리눅스·맥)에게 깨져 보인다.
       그래서 명령줄을 UTF-16으로 다시 받아 UTF-8로 바꾼다 */
    static char arg_buf[8][256], *arg_ptr[8];
    wchar_t **wargv = CommandLineToArgvW(GetCommandLineW(), &argc);
    if (argc > 8)
        argc = 8;
    for (int i = 0; i < argc; i++) {
        WideCharToMultiByte(CP_UTF8, 0, wargv[i], -1, arg_buf[i], sizeof(arg_buf[i]), NULL, NULL);
        arg_ptr[i] = arg_buf[i];
    }
    argv = arg_ptr;
#else
    signal(SIGPIPE, SIG_IGN);
    setvbuf(stdout, NULL, _IOLBF, 0);   /* 파일로 돌려도 줄마다 바로 나오게 */
#endif

    int lfd = -1;
    if (argc >= 2 && argv[1][0] != '-' && valid_name(argv[1])) {
        strncpy(my_name, argv[1], NAME_LEN - 1);
        mode = (argc >= 3 && strcmp(argv[2], "--host") == 0) ? M_HOST : M_JOIN;
        if (mode == M_HOST) {
            lfd = net_listen(PORT);
            if (lfd < 0)
                return 1;
            raw_tty();
            show("%s덜미%s · %s · 방장", C_ACCENT, C_RESET, my_name);
        } else {
            const char *host = argc >= 3 ? argv[2] : "127.0.0.1";
            printf("%s 에 접속하는 중… (5초)\n", host);
            fflush(stdout);
            srv.fd = net_connect(host, PORT);
            if (srv.fd < 0) {
                if (errno == ECONNREFUSED)
                    fprintf(stderr, "→ 그 주소에 열린 방이 없어요. 방장이 먼저 --host 로 방을 열었는지, 주소가 맞는지 보세요\n");
                else if (errno == ETIMEDOUT || errno == EHOSTUNREACH || errno == ENETUNREACH)
                    fprintf(stderr, "→ 연결이 중간에서 막혔어요. 방장 노트북 방화벽, 같은 네트워크인지 보세요.\n"
                                    "  학교 와이파이는 기기끼리 연결을 막는 경우가 많아요 — 둘 다 휴대폰 핫스팟에 연결해 보세요\n");
                return 1;
            }
            pkt_init(&out, T_HELLO, my_name, NULL);
            send_packet(srv.fd, &out);
            raw_tty();
            show("%s덜미%s · %s · %s 에 접속", C_ACCENT, C_RESET, my_name, host);
        }
        show_guide();
    } else {
        fprintf(stderr, "덜미 — 터미널 채팅 (프밍기2 팀 프로젝트)\n\n");
        fprintf(stderr, "  %s 이름 --host       방을 연다 (방장: 내가 서버가 되어 중계하면서 대화)\n", argv[0]);
        fprintf(stderr, "  %s 이름 [주소]       방에 들어간다 (주소는 방장 화면의 [주소] 줄, 같은 컴퓨터면 생략)\n\n", argv[0]);
        fprintf(stderr, "이름은 한글 5글자(15바이트)까지, 띄어쓰기와 / 없이.\n");
        fprintf(stderr, "만든 사람: 김창식(기획·결정·실행 확인) · Claude(AI — 코드와 사이트 작성)\n");
        fprintf(stderr, "자세한 안내: https://tkdgh123.github.io/secure-msg/run/\n");
        return 1;
    }

    struct pollfd fds[2 + MAX_CLIENTS + 1];
    for (;;) {
        int n = nclients;   /* 이번 바퀴에 지켜볼 사람 수 (참가자는 0) */
        fds[0] = (struct pollfd){ .fd = 0, .events = POLLIN };   /* 키보드 */
        fds[1] = (struct pollfd){ .fd = mode == M_JOIN ? srv.fd : lfd, .events = POLLIN };
        for (int i = 0; i < n; i++)
            fds[2 + i] = (struct pollfd){ .fd = clients[i].c.fd, .events = POLLIN };

#ifdef _WIN32   /* WSAPoll은 소켓만 본다: 키보드(fds[0])는 빼고 0.05초마다 따로 확인 */
        if (poll(fds + 1, 1 + n, 50) < 0)
            continue;
        fds[0].revents = keys_waiting() ? POLLIN : 0;
#else
        if (poll(fds, 2 + n, -1) < 0)
            continue;
#endif

        /* 뒤에서부터: 도중에 지워도 아직 안 본 칸이 밀려오지 않는다 */
        for (int i = n - 1; i >= 0; i--)
            if (fds[2 + i].revents & (POLLIN | POLLHUP | POLLERR))
                serve(i);
        if (fds[1].revents & (POLLIN | POLLHUP | POLLERR)) {
            if (mode == M_JOIN)
                join_read();
            else
                add_client((int)accept(lfd, NULL, NULL));
        }
        if (fds[0].revents & (POLLIN | POLLHUP))
            read_keys();
    }
}

#endif /* NET_ONLY */
