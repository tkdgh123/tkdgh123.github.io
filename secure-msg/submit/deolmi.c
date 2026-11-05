/* ============================================================================
   덜미 — 프로그래밍기초2 팀 프로젝트 메신저 (윈도우용)

   같은 와이파이에 있는 노트북끼리 터미널에서 대화하는 프로그램이다.
   한 사람이 방장이 되어 방을 열면 방장 프로그램이 서버 역할을 하고,
   나머지 사람은 참가자로 방장에게 접속해서 대화한다.
   지금은 암호화를 넣기 전 단계라서 메시지는 평문 그대로 오간다.

   [빌드]  Visual Studio 개발자 명령 프롬프트에서   cl /utf-8 deolmi.c
           (/utf-8 을 빼면 한글이 깨진다)

   [실행]  deolmi 이름 --host     방장으로 방을 연다
           deolmi 이름 주소        참가자로 방장에게 들어간다
                                  (주소는 방장 화면의 [주소] 줄, 같은 컴퓨터면 주소를 안 써도 된다)

   [대화 중 명령]
           그냥 치고 엔터     방에 있는 모두에게 보낸다
           /dm 이름          그 사람하고만 1:1로 대화한다
           /all              다시 모두에게 보내는 대화로 돌아간다
           /who              지금 방에 있는 사람을 본다
           /quit             나간다

   [하는 일]
           - 여러 명이 한 방에 들어와 전체 대화와 1:1 대화를 한다 (인원 제한 없음)
           - 누가 들어오고 나가면 모두에게 알림이 간다
           - 같은 이름, 빈 이름, 이상한 이름은 방장이 거절한다
           - 남의 이름을 사칭해서 보내면 방장이 막는다
           - 메시지는 어디에도 저장하지 않는다. 방장은 받자마자 전해 주고 잊는다

   [코드 구조] 위에서부터 이 순서로 놓여 있다
           ① 통신   패킷을 만들어 보내고, 받은 바이트를 모아 한 통씩 꺼낸다   ← 서버 담당
           ② 화면   글 찍기, 이름 검사, 방에 있는 사람 목록
           ③ 중계   방장이 받은 패킷을 받을 사람에게 전해 준다             ← 서버 담당
           ④ 대화   받은 글 보여 주기, 보내기, 명령 처리, 키보드 입력
           ⑤ 실행   main — 방장/참가자를 고르고, 받기 반복을 돈다

   [패킷 한 통의 모양]
           길이 4바이트 | 종류 1 | 보낸 사람 16 | 받을 사람 16 | 본문
           종류는 HELLO(들어오면서 이름 밝히기), MSG(대화), SYS(방장이 보내는 알림) 세 가지이고,
           MSG의 받을 사람이 비어 있으면 모두에게 가는 글이다.

   만든 사람: 김창식(기획·결정·실행 확인), Claude(Anthropic의 AI — 코드 작성)
   ============================================================================ */
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
   TCP는 보낸 덩어리 그대로 오지 않는데, 한 통이 둘로 쪼개져 오기도 하고 두 통이 붙어서 오기도 한다.
   그래서 보낼 때 앞에 길이 4바이트를 붙이고, 받는 쪽은 그 길이만큼 모일 때까지 기다렸다가
   한 통으로 꺼낸다. 방장과 참가자가 둘 다 이 부분을 쓴다. */

#define NAME_LEN  16                  /* 이름 칸 16바이트 = 이름 15바이트(한글 5글자) + 끝 표시 */
#define HDR_LEN   (1 + NAME_LEN + NAME_LEN)   /* 헤더 33바이트 = 종류 1 + 보낸 사람 16 + 받을 사람 16 */
#define MAX_BODY  65536               /* 본문 최대 크기 */
#define PKT_MAX   (4 + HDR_LEN + MAX_BODY)    /* 한 통의 최대 크기 */

/* 패킷 종류
   T_HELLO : 참가자가 접속하자마자 "내 이름은 ○○" 하고 보내는 것. 방장은 새 사람에게 방에 있는 사람들을 이걸로 알려 준다
   T_MSG   : 대화. 받을 사람(to)이 비어 있으면 모두에게, 이름이 있으면 그 사람에게만 간다
   T_SYS   : 방장 프로그램이 보내는 알림 ("철수 입장", "없는 사람입니다" 같은 것) */
enum { T_HELLO = 1, T_MSG, T_SYS };

struct packet {                       /* 프로그램 안에서 다루는 패킷 한 통 */
    uint8_t  type;                    /* 종류 (위 T_HELLO, T_MSG, T_SYS) */
    char     from[NAME_LEN], to[NAME_LEN];   /* 보낸 사람, 받을 사람 */
    uint32_t body_len;                /* 본문 길이 */
    uint8_t  body[MAX_BODY];          /* 본문 (대화 글, 알림 글) */
};

struct conn {                         /* 한 연결에서 받는 중인 바이트를 모아 두는 상자 */
    int     fd;                       /* 소켓 */
    uint8_t buf[PKT_MAX];             /* 아직 한 통이 안 된 바이트 */
    size_t  len;                      /* buf에 모인 바이트 수 */
};

/* 방장이 쓰는 함수. port번에서 다른 컴퓨터의 접속을 기다리는 소켓을 만든다. 실패하면 -1 */
int net_listen(int port)
{
    int fd = (int)socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);   /* 이 컴퓨터의 모든 주소로 들어오는 접속을 받는다 */
    if (fd < 0 || bind(fd, (struct sockaddr *)&addr, sizeof(addr)) < 0 || listen(fd, 16) < 0)
        return -1;
    return fd;
}

/* 참가자가 쓰는 함수. host(방장 주소)의 port번으로 접속한다. 실패하면 -1 */
int net_connect(const char *host, int port)
{
    struct addrinfo hints = {0}, *res;
    char port_str[8];
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    snprintf(port_str, sizeof(port_str), "%d", port);
    if (getaddrinfo(host, port_str, &hints, &res) != 0)   /* 주소 글자를 실제 주소로 바꾼다 */
        return -1;
    int fd = (int)socket(AF_INET, SOCK_STREAM, 0);
    if (fd >= 0 && connect(fd, res->ai_addr, (int)res->ai_addrlen) < 0) {
        closesocket(fd);
        fd = -1;
    }
    freeaddrinfo(res);
    return fd;
}

/* 패킷을 보낼 바이트로 늘어놓고, 보낼 바이트 수를 돌려준다.
   구조체를 통째로 보내면 컴퓨터마다 중간에 끼는 빈 바이트가 달라서, 한 칸씩 복사해서 늘어놓는다.
   길이는 htonl로 큰 자리부터 적는데, 그래야 어느 컴퓨터에서 읽어도 같은 숫자가 된다 */
size_t pack_packet(const struct packet *p, uint8_t *out)
{
    uint32_t len = HDR_LEN + p->body_len, nlen = htonl(len);
    memcpy(out, &nlen, 4);                          /* 길이 4바이트 */
    out[4] = p->type;                               /* 종류 1바이트 */
    memcpy(out + 5, p->from, NAME_LEN);             /* 보낸 사람 16바이트 */
    memcpy(out + 5 + NAME_LEN, p->to, NAME_LEN);    /* 받을 사람 16바이트 */
    memcpy(out + 4 + HDR_LEN, p->body, p->body_len);   /* 본문 */
    return 4 + len;
}

/* 패킷 한 통을 fd 소켓으로 보낸다. 실패하면 -1 */
int send_packet(int fd, const struct packet *p)
{
    static uint8_t out[PKT_MAX];
    size_t total = pack_packet(p, out), sent = 0;
    while (sent < total) {            /* send는 한 번에 일부만 보낼 수도 있어서 다 보낼 때까지 되풀이한다 */
        int n = send(fd, (const char *)out + sent, (int)(total - sent), 0);
        if (n <= 0)
            return -1;
        sent += n;
    }
    return 0;
}

/* 소켓에 온 바이트를 읽어서 상자(c->buf) 뒤에 붙인다.
   돌려주는 값: 0보다 크면 받은 바이트 수, 0이면 상대가 연결을 끊음, -1이면 오류 */
int conn_read(struct conn *c)
{
    int n = recv(c->fd, (char *)c->buf + c->len, (int)(sizeof(c->buf) - c->len), 0);
    if (n > 0)
        c->len += n;
    return n;
}

/* 상자에 패킷 한 통이 다 모였으면 꺼내서 p에 담는다.
   돌려주는 값: 1이면 한 통 꺼냄, 0이면 아직 덜 옴(다음 recv를 기다림), -1이면 말이 안 되는 길이 */
int conn_take(struct conn *c, struct packet *p)
{
    uint32_t len;
    if (c->len < 4)                   /* 길이 4바이트도 아직 안 왔다 */
        return 0;
    memcpy(&len, c->buf, 4);
    len = ntohl(len);
    if (len < HDR_LEN || len > HDR_LEN + MAX_BODY)   /* 헤더보다 짧거나 너무 길면 잘못 온 것 */
        return -1;
    if (c->len < 4 + len)             /* 길이는 알지만 본문이 아직 덜 왔다 */
        return 0;
    p->type = c->buf[4];
    memcpy(p->from, c->buf + 5, NAME_LEN);
    memcpy(p->to, c->buf + 5 + NAME_LEN, NAME_LEN);
    p->from[NAME_LEN - 1] = p->to[NAME_LEN - 1] = '\0';   /* 이름 끝을 꼭 막아 둔다 */
    p->body_len = len - HDR_LEN;
    memcpy(p->body, c->buf + 4 + HDR_LEN, p->body_len);
    c->len -= 4 + len;                /* 꺼낸 만큼 상자 앞으로 당긴다 (뒤에 다음 통이 붙어 있을 수 있다) */
    memmove(c->buf, c->buf + 4 + len, c->len);
    return 1;
}

#ifndef NET_ONLY   /* 자동 테스트(tests/)는 위의 ① 통신 부분만 가져다 쓴다 */

#define PORT       9000               /* 방장이 접속을 기다리는 포트 번호 */
#define MAX_PEOPLE 60                 /* 사람을 담는 배열 크기 (윈도우 select가 한 번에 64개까지 볼 수 있어서) */
#define INPUT_MAX  1000               /* 한 번에 보낼 수 있는 글 길이 (바이트) */

static int  is_host;                  /* 1이면 방장, 0이면 참가자 */
static char my_name[NAME_LEN];        /* 내 이름 */
static char dm_to[NAME_LEN];          /* 1:1 대화 상대. 비어 있으면 전체 대화 */
static struct packet pkt, out;        /* 받은 패킷 / 보낼 패킷 (64KB가 넘어서 전역에 둔다) */
static CRITICAL_SECTION mx;           /* 키보드 입력 스레드와 받기 반복이 같은 데이터를 동시에 건드리지 않게 잠그는 자물쇠 */

/* ================= ② 화면 =================
   글을 화면에 찍는 함수와, 이름 검사, 방에 있는 사람 목록을 관리하는 함수들이다. */

/* printf처럼 쓰는데, 끝에 줄을 바꾸고 바로 화면에 내보낸다 */
static void show(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\n");
    fflush(stdout);
}

/* 받은 글에 섞인 제어 문자를 ? 로 바꾼다.
   남이 보낸 글에 특수 문자가 있으면 내 터미널 화면을 조작할 수 있어서 막는 것이다 */
static void clean(char *s)
{
    for (; *s; s++)
        if ((unsigned char)*s < 0x20 || *s == 0x7f)
            *s = '?';
}

/* 쓸 수 있는 이름인지 본다. 1~15바이트이고, 띄어쓰기·/·제어 문자가 없어야 한다 */
static int valid_name(const char *s)
{
    for (const char *c = s; *c; c++)
        if ((unsigned char)*c <= ' ' || *c == '/')
            return 0;
    return s[0] && strlen(s) < NAME_LEN;
}

/* 방에 있는 사람 목록 (나는 빼고). /who 로 보여 주고, /dm 할 때 있는 사람인지 확인하는 데 쓴다.
   방장은 사람이 들어오고 나갈 때 직접 고치고, 참가자는 방장이 보내 주는 HELLO와 입장·퇴장 알림을 보고 고친다 */
static char peers[MAX_PEOPLE][NAME_LEN];
static int  npeers;

/* 목록에서 name을 찾는다. 없으면 -1 */
static int find_peer(const char *name)
{
    for (int i = 0; i < npeers; i++)
        if (strcmp(peers[i], name) == 0)
            return i;
    return -1;
}

/* 목록에 name을 넣는다. 내 이름이거나 이미 있으면 넣지 않는다 */
static void add_peer(const char *name)
{
    if (name[0] && strcmp(name, my_name) != 0 && find_peer(name) < 0 && npeers < MAX_PEOPLE)
        strcpy(peers[npeers++], name);
}

/* 목록에서 name을 뺀다. 마지막 사람을 빈자리로 옮겨서 채운다 */
static void remove_peer(const char *name)
{
    int i = find_peer(name);
    if (i < 0)
        return;
    if (strcmp(dm_to, name) == 0)     /* 1:1로 대화하던 상대가 나가면 전체 대화로 돌아간다 */
        dm_to[0] = '\0';
    strcpy(peers[i], peers[--npeers]);
}

/* ================= ③ 중계: 방장 =================
   방장이 서버다. 참가자들은 모두 방장에게 접속하고, 방장은 받은 패킷의 받을 사람(to)을 보고
   그 사람에게만 전해 준다. to 가 비어 있으면 보낸 사람을 뺀 모두에게 전한다.
   이 칸의 함수들은 방장일 때만 쓰이는데, 패킷을 채우는 pkt_init 은 참가자도 쓴다. */

struct client {                       /* 방장에게 접속한 참가자 한 명 */
    struct conn c;                    /* 이 사람과의 연결 */
    char name[NAME_LEN];              /* 이름 */
    int  registered;                  /* HELLO로 이름을 밝혔으면 1. 밝히기 전에는 아무것도 못 한다 */
};
static struct client clients[MAX_PEOPLE];   /* 접속한 참가자들 */
static int nclients;                        /* 접속한 참가자 수 */

/* 이름으로 참가자를 찾는다. 없으면 -1 */
static int find_client(const char *name)
{
    for (int i = 0; i < nclients; i++)
        if (clients[i].registered && strcmp(clients[i].name, name) == 0)
            return i;
    return -1;
}

/* 보낼 패킷 p를 비우고 종류, 보낸 사람, 받을 사람을 채운다 */
static void pkt_init(struct packet *p, int type, const char *from, const char *to)
{
    memset(p, 0, sizeof(*p));
    p->type = (uint8_t)type;
    strncpy(p->from, from, NAME_LEN - 1);
    strncpy(p->to, to, NAME_LEN - 1);
}

/* i번 참가자에게 알림(SYS) 한 줄을 보낸다. printf처럼 쓴다 */
static void send_sys(int i, const char *fmt, ...)
{
    va_list ap;
    pkt_init(&out, T_SYS, "", clients[i].name);
    va_start(ap, fmt);
    out.body_len = vsnprintf((char *)out.body, MAX_BODY, fmt, ap);
    va_end(ap);
    send_packet(clients[i].c.fd, &out);
}

/* "이름 입장" / "이름 퇴장"을 방장 화면에 띄우고 방에 있는 모두에게도 보낸다 */
static void sys_all(const char *name, const char *what)
{
    show("[알림] %s %s", name, what);
    for (int k = 0; k < nclients; k++)
        if (clients[k].registered)
            send_sys(k, "%s %s", name, what);
}

/* i번 참가자를 내보낸다 (연결이 끊겼거나 규칙을 어겼을 때).
   빈자리에는 맨 마지막 참가자를 옮겨 온다. 이름을 밝힌 사람이었으면 모두에게 퇴장을 알린다 */
static void drop_client(int i)
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

/* i번 참가자가 HELLO로 이름을 밝혔을 때.
   쓸 수 없는 이름이거나 이미 있는 이름(방장 이름 포함)이면 알림을 보내고 내보낸다.
   통과하면 등록하고, 새 사람에게 방에 있는 사람들을 알려 준 뒤 모두에게 입장을 알린다 */
static int handle_hello(int i, const struct packet *p)
{
    if (!valid_name(p->from) || find_client(p->from) >= 0 || strcmp(p->from, my_name) == 0) {
        send_sys(i, "이름 사용 중이거나 쓸 수 없음: %s", p->from);
        drop_client(i);
        return -1;
    }
    strcpy(clients[i].name, p->from);
    clients[i].registered = 1;
    /* 새 사람에게 이미 있는 사람들과 방장을 HELLO로 알려 준다. 기존 사람들은 아래 "입장" 알림으로 새 사람을 안다 */
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

static void display_msg(const struct packet *p);   /* ④ 대화 칸에 있다 */

/* i번 참가자에게서 온 패킷 하나를 처리한다. 중계 규칙이 여기 다 있다.
   이 사람을 내보냈으면 -1을 돌려준다 */
static int handle_packet(int i, struct packet *p)
{
    if (!clients[i].registered && p->type != T_HELLO) {   /* 이름도 안 밝히고 다른 걸 보내면 내보낸다 */
        send_sys(i, "먼저 HELLO를 보내야 합니다");
        drop_client(i);
        return -1;
    }
    if (p->type == T_HELLO)
        return handle_hello(i, p);
    if (p->type != T_MSG)             /* 참가자가 보낼 수 있는 건 MSG뿐이다 (SYS는 방장만 만든다) */
        send_sys(i, "모르는 type: %d", p->type);
    else if (strcmp(p->from, clients[i].name) != 0)   /* 보낸 사람 칸에 남의 이름을 적었으면 전하지 않는다 */
        send_sys(i, "보낸 사람 이름이 다릅니다: %s", p->from);
    else if (p->to[0] == '\0') {      /* 모두에게: 방장 화면에 띄우고, 보낸 사람 빼고 전원에게 전한다 */
        display_msg(p);
        for (int k = 0; k < nclients; k++)
            if (k != i && clients[k].registered)
                send_packet(clients[k].c.fd, p);
    } else if (strcmp(p->to, my_name) == 0) {
        display_msg(p);               /* 방장에게만 온 1:1은 방장 화면에만 띄운다 */
    } else {                          /* 다른 참가자에게 가는 1:1은 그 사람에게만 전한다 */
        int to = find_client(p->to);
        if (to < 0)
            send_sys(i, "%s는 접속해 있지 않습니다", p->to);
        else
            send_packet(clients[to].c.fd, p);
    }
    return 0;
}

/* i번 참가자의 소켓에 뭔가 왔을 때 부른다. 읽어서 다 모인 패킷을 하나씩 처리한다 */
static void serve(int i)
{
    int r;
    if (conn_read(&clients[i].c) <= 0) {   /* 연결이 끊겼으면 내보낸다 */
        drop_client(i);
        return;
    }
    while ((r = conn_take(&clients[i].c, &pkt)) == 1)
        if (handle_packet(i, &pkt) < 0)
            return;
    if (r < 0)
        drop_client(i);               /* 말이 안 되는 길이를 보냈으면 그 사람만 내보내고 나머지는 계속한다 */
}

/* ================= ④ 대화: 방장·참가자 =================
   받은 글을 화면에 보여 주고, 내가 친 글을 보내고, 명령(/dm, /who …)을 처리한다.
   키보드는 따로 도는 입력 스레드가 한 줄씩 읽는다. */

static struct conn srv;               /* 참가자일 때 방장과의 연결 */
static char text[MAX_BODY + 1];       /* 받은 글 (끝 표시를 붙이고 제어 문자를 지운 것) */

/* 받은 패킷을 화면에 보여 준다.
   알림은 [알림] 글, 모두에게 온 글은 [보낸 사람] 글, 나에게만 온 1:1은 [보낸 사람 → 나] 글 */
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

/* 참가자일 때, 방장에게서 뭔가 왔으면 부른다. 읽어서 다 모인 패킷을 하나씩 처리한다 */
static void join_read(void)
{
    int r;
    if (conn_read(&srv) <= 0) {       /* 방장이 나가면 방이 닫힌다 */
        show("[알림] 방장과 연결이 끊어졌습니다");
        exit(1);
    }
    while ((r = conn_take(&srv, &pkt)) == 1) {
        if (pkt.type == T_HELLO) {    /* 방에 있는 사람을 알려 준 것: 목록에만 넣는다 */
            add_peer(pkt.from);
            continue;
        }
        display_msg(&pkt);
        if (pkt.type == T_SYS) {      /* 알림이 "이름 입장" / "이름 퇴장"이면 사람 목록을 고친다 */
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

/* 내가 친 글을 보낸다. 1:1 중이면 받을 사람을 그 사람으로, 아니면 비워서 보낸다.
   참가자는 방장에게 보내고(나머지는 방장이 전해 준다), 방장은 직접 받을 사람(전체면 모두)에게 보낸다 */
static void send_text(const char *msg)
{
    size_t len = strlen(msg);
    if (len > INPUT_MAX) {            /* 너무 길면 자르는데, 한글 글자 중간에서 자르지 않게 앞으로 당긴다 */
        len = INPUT_MAX;
        while (len > 0 && ((unsigned char)msg[len] & 0xC0) == 0x80)
            len--;
    }
    pkt_init(&out, T_MSG, my_name, dm_to);
    memcpy(out.body, msg, len);
    out.body_len = (uint32_t)len;
    if (!is_host)
        send_packet(srv.fd, &out);
    else
        for (int k = 0; k < nclients; k++)
            if (clients[k].registered && (!dm_to[0] || strcmp(clients[k].name, dm_to) == 0))
                send_packet(clients[k].c.fd, &out);
}

/* 키보드로 친 한 줄을 처리한다. / 로 시작하면 명령이고, 아니면 글로 보낸다 */
static void on_line(const char *line)
{
    if (strcmp(line, "/quit") == 0) {             /* 나가기 */
        exit(0);
    } else if (strcmp(line, "/all") == 0) {       /* 전체 대화로 돌아가기 */
        dm_to[0] = '\0';
        show("[전체 대화] 모두에게 갑니다");
    } else if (strncmp(line, "/dm ", 4) == 0) {   /* 1:1 대화 상대 정하기 (방에 있는 사람만) */
        if (find_peer(line + 4) < 0) {
            show("[1:1 대화] %s는 접속해 있지 않습니다 (/who 로 확인)", line + 4);
        } else {
            strcpy(dm_to, line + 4);
            show("[1:1 대화] %s에게만 갑니다 · /all 로 돌아오기", dm_to);
        }
    } else if (strcmp(line, "/who") == 0) {       /* 방에 있는 사람 보기 */
        printf("[접속 중] %s(나)", my_name);
        for (int i = 0; i < npeers; i++)
            printf(", %s", peers[i]);
        show("");
    } else if (line[0] == '/') {                  /* 모르는 명령 */
        show("[알림] 명령: /dm 이름 · /all · /who · /quit");
    } else if (npeers == 0) {
        show("[알림] 아직 아무도 없습니다");
    } else {
        send_text(line);
    }
}

/* 키보드 입력 스레드. main의 받기 반복과 따로 돌아서, 글을 치는 동안에도 받은 글이 계속 뜬다.
   한 줄을 읽을 때마다 자물쇠(mx)를 잠그고 on_line으로 처리한다 */
static DWORD WINAPI input_thread(LPVOID unused)
{
    static wchar_t w[INPUT_MAX + 2];
    static char line[4 * INPUT_MAX];
    HANDLE h = GetStdHandle(STD_INPUT_HANDLE);
    DWORD mode, got;
    (void)unused;
    for (;;) {
        if (GetConsoleMode(h, &mode)) {   /* 키보드: 한글이 깨지지 않게 UTF-16으로 받아서 UTF-8로 바꾼다 */
            if (!ReadConsoleW(h, w, INPUT_MAX, &got, NULL) || got == 0)
                break;
            line[WideCharToMultiByte(CP_UTF8, 0, w, (int)got, line, sizeof(line) - 1, NULL, NULL)] = '\0';
        } else if (!fgets(line, sizeof(line), stdin)) {   /* 파이프로 입력을 준 경우 (자동 테스트) */
            break;
        }
        size_t n = strcspn(line, "\r\n");
        while (n > 0 && line[n - 1] == ' ')   /* 끝 공백은 무시한다 ("/who " 도 명령으로 알아듣게) */
            n--;
        line[n] = '\0';
        if (n == 0)                   /* 빈 줄은 무시 */
            continue;
        EnterCriticalSection(&mx);
        on_line(line);
        LeaveCriticalSection(&mx);
    }
    exit(0);
}

/* 방장 화면에 내 주소를 띄워서, 다른 컴퓨터가 무엇을 치고 들어오면 되는지 알려 준다.
   UDP 소켓은 connect만 해서는 아무것도 보내지 않는데, 그때 운영체제가 정해 준 내 주소를 읽는 방법이다 */
static void show_my_address(void)
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

/* ================= ⑤ 실행 =================
   명령줄을 읽어 방장인지 참가자인지 정하고, 방을 열거나 방장에게 접속한다.
   그다음 키보드 입력 스레드를 띄우고, main은 받기 반복을 돈다. */

int main(void)
{
    static char argv[3][256];
    int argc, lfd = -1;               /* lfd: 방장이 접속을 기다리는 소켓 */
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa); /* 윈도우에서 소켓을 쓰려면 먼저 불러야 한다 */
    InitializeCriticalSection(&mx);
    SetConsoleOutputCP(CP_UTF8);      /* 화면에 UTF-8 한글이 깨지지 않게 */
    /* 명령줄을 UTF-16으로 받아 UTF-8로 바꾼다. 그냥 main(argc, argv)로 받으면 한글 이름이 깨진다 */
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
    if (is_host) {                    /* 방장: 9000번 포트로 방을 연다 */
        if ((lfd = net_listen(PORT)) < 0) {
            printf("%d번 포트로 방을 열 수 없어요 (이미 켜 둔 방장이 있나요?)\n", PORT);
            return 1;
        }
        show("덜미 · %s · 방장", my_name);
        show_my_address();
    } else {                          /* 참가자: 방장에게 접속하고 HELLO로 이름을 밝힌다 */
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
    CloseHandle(CreateThread(NULL, 0, input_thread, NULL, 0, NULL));   /* 키보드 입력 스레드 시작 */

    /* 받기 반복: select 하나로 여러 소켓을 같이 지켜보다가, 뭔가 온 소켓만 처리한다.
       방장은 접속 문(lfd)과 참가자들의 소켓을, 참가자는 방장과의 연결(srv)을 지켜본다 */
    for (;;) {
        fd_set fds;
        int top = is_host ? lfd : srv.fd, n;
        FD_ZERO(&fds);
        FD_SET(top, &fds);
        EnterCriticalSection(&mx);
        n = nclients;
        for (int i = 0; i < n; i++)
            FD_SET(clients[i].c.fd, &fds);
        LeaveCriticalSection(&mx);
        if (select(0, &fds, NULL, NULL, NULL) < 0)   /* 어느 소켓에든 뭔가 올 때까지 기다린다 */
            continue;
        EnterCriticalSection(&mx);
        /* 참가자 소켓은 뒤에서부터 본다. 중간에 누가 나가면 맨 뒤 사람이 그 자리로 오는데,
           앞에서부터 보면 옮겨 온 사람을 이번에 건너뛰게 된다 */
        for (int i = n - 1; i >= 0; i--)
            if (FD_ISSET(clients[i].c.fd, &fds))
                serve(i);
        if (FD_ISSET(top, &fds) && !is_host)
            join_read();              /* 참가자: 방장에게서 온 것 받기 */
        else if (FD_ISSET(top, &fds)) {   /* 방장: 새 사람이 접속했다 */
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
