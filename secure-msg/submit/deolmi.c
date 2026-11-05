/* 덜미 — 프밍기2 팀 프로젝트 메신저 (윈도우용, 암호화 전 단계라 메시지는 평문)

   같은 와이파이의 노트북끼리 터미널에서 대화한다. 한 사람이 방장으로 방을 열면 방장이 서버가 되고,
   나머지는 참가자로 방장에게 접속한다.

   빌드: cl /utf-8 deolmi.c   (Visual Studio 개발자 명령 프롬프트)
   실행: deolmi 이름 --host   방장으로 방 열기
         deolmi 이름 주소      참가자로 들어가기 (같은 컴퓨터면 주소 생략)

   기능: 전체 대화, 1:1 대화(/dm 이름, /all), 접속한 사람 보기(/who), 나가기(/quit),
         입장·퇴장 알림, 같은 이름·이상한 이름 거절, 남의 이름 사칭 차단, 인원 제한 없음

   구조: ① 통신  ② 화면  ③ 중계(방장)  ④ 대화  ⑤ 실행   — 서버 담당은 ①·③

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
   TCP는 메시지가 쪼개지거나 붙어서 오기 때문에, 앞에 길이 4바이트를 붙여 보내고
   받는 쪽은 그 길이만큼 모이면 한 통으로 꺼낸다.
   한 통 = 길이 4 + 종류 1 + 보낸 사람 16 + 받을 사람 16 + 본문 */

#define NAME_LEN    16                /* 이름은 한글 5글자(15바이트)까지 */
#define HEADER_LEN  (1 + NAME_LEN + NAME_LEN)
#define MAX_BODY    65536
#define MAX_PACKET  (4 + HEADER_LEN + MAX_BODY)

/* HELLO: 접속하면서 이름 밝히기 / MESSAGE: 대화 (받을 사람이 비면 모두에게) / NOTICE: 방장이 보내는 알림 */
enum { TYPE_HELLO = 1, TYPE_MESSAGE, TYPE_NOTICE };

struct packet {
    uint8_t  type;
    char     from[NAME_LEN], to[NAME_LEN];
    uint32_t body_len;
    uint8_t  body[MAX_BODY];
};

struct connection {                 /* 한 연결에서 받는 중인 바이트를 모아 두는 곳 */
    int     sock;
    uint8_t buf[MAX_PACKET];
    size_t  len;
};

/* 방장: 접속을 기다리는 소켓을 연다 */
int open_room(int port)
{
    int sock = (int)socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);
    addr.sin_addr.s_addr = htonl(INADDR_ANY);
    if (sock < 0 || bind(sock, (struct sockaddr *)&addr, sizeof(addr)) < 0 || listen(sock, 16) < 0)
        return -1;
    return sock;
}

/* 참가자: 방장에게 접속한다 */
int connect_to_host(const char *host, int port)
{
    struct addrinfo hints = {0}, *addr_list;
    char port_str[8];
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    snprintf(port_str, sizeof(port_str), "%d", port);
    if (getaddrinfo(host, port_str, &hints, &addr_list) != 0)
        return -1;
    int sock = (int)socket(AF_INET, SOCK_STREAM, 0);
    if (sock >= 0 && connect(sock, addr_list->ai_addr, (int)addr_list->ai_addrlen) < 0) {
        closesocket(sock);
        sock = -1;
    }
    freeaddrinfo(addr_list);
    return sock;
}

/* 패킷을 보낼 바이트로 늘어놓는다 */
size_t packet_to_bytes(const struct packet *p, uint8_t *bytes)
{
    uint32_t len = HEADER_LEN + p->body_len, net_len = htonl(len);
    memcpy(bytes, &net_len, 4);
    bytes[4] = p->type;
    memcpy(bytes + 5, p->from, NAME_LEN);
    memcpy(bytes + 5 + NAME_LEN, p->to, NAME_LEN);
    memcpy(bytes + 4 + HEADER_LEN, p->body, p->body_len);
    return 4 + len;
}

/* 패킷 한 통을 보낸다 */
int send_packet(int sock, const struct packet *p)
{
    static uint8_t bytes[MAX_PACKET];
    size_t total = packet_to_bytes(p, bytes), sent = 0;
    while (sent < total) {
        int n = send(sock, (const char *)bytes + sent, (int)(total - sent), 0);
        if (n <= 0)
            return -1;
        sent += n;
    }
    return 0;
}

/* 받은 바이트를 모은다. 0이면 상대가 연결을 끊은 것 */
int receive_bytes(struct connection *conn)
{
    int n = recv(conn->sock, (char *)conn->buf + conn->len, (int)(sizeof(conn->buf) - conn->len), 0);
    if (n > 0)
        conn->len += n;
    return n;
}

/* 모인 바이트에서 패킷 한 통을 꺼낸다. 1 꺼냄, 0 아직 덜 옴, -1 잘못된 길이 */
int take_packet(struct connection *conn, struct packet *p)
{
    uint32_t len;
    if (conn->len < 4)
        return 0;
    memcpy(&len, conn->buf, 4);
    len = ntohl(len);
    if (len < HEADER_LEN || len > HEADER_LEN + MAX_BODY)
        return -1;
    if (conn->len < 4 + len)
        return 0;
    p->type = conn->buf[4];
    memcpy(p->from, conn->buf + 5, NAME_LEN);
    memcpy(p->to, conn->buf + 5 + NAME_LEN, NAME_LEN);
    p->from[NAME_LEN - 1] = p->to[NAME_LEN - 1] = '\0';
    p->body_len = len - HEADER_LEN;
    memcpy(p->body, conn->buf + 4 + HEADER_LEN, p->body_len);
    conn->len -= 4 + len;
    memmove(conn->buf, conn->buf + 4 + len, conn->len);
    return 1;
}

#ifndef NET_ONLY   /* 자동 테스트(tests/)는 위의 ① 통신만 가져다 쓴다 */

#define PORT       9000
#define MAX_PEOPLE 60                 /* 배열 크기 (윈도우 select가 한 번에 64개까지 본다) */
#define MAX_INPUT  1000               /* 한 번에 보낼 수 있는 글 길이 */

static int  is_host;
static char my_name[NAME_LEN];
static char dm_target[NAME_LEN];      /* 1:1 대화 상대. 비어 있으면 전체 대화 */
static struct packet recv_pkt, send_pkt;
static CRITICAL_SECTION lock;         /* 입력 스레드와 받기 반복이 동시에 건드리지 않게 */

/* ================= ② 화면 =================
   글 찍기, 이름 검사, 방에 있는 사람 목록 */

static void print_line(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\n");
    fflush(stdout);
}

/* 받은 글의 제어 문자를 ? 로 바꾼다 (남이 내 화면을 조작하지 못하게) */
static void remove_control_chars(char *s)
{
    for (; *s; s++)
        if ((unsigned char)*s < 0x20 || *s == 0x7f)
            *s = '?';
}

/* 이름 검사: 1~15바이트, 띄어쓰기·/ 없이 */
static int is_valid_name(const char *s)
{
    for (const char *c = s; *c; c++)
        if ((unsigned char)*c <= ' ' || *c == '/')
            return 0;
    return s[0] && strlen(s) < NAME_LEN;
}

/* 방에 있는 사람 목록 (나 빼고) — /who 와 /dm 에 쓴다 */
static char members[MAX_PEOPLE][NAME_LEN];
static int  member_count;

static int find_member(const char *name)
{
    for (int i = 0; i < member_count; i++)
        if (strcmp(members[i], name) == 0)
            return i;
    return -1;
}

static void add_member(const char *name)
{
    if (name[0] && strcmp(name, my_name) != 0 && find_member(name) < 0 && member_count < MAX_PEOPLE)
        strcpy(members[member_count++], name);
}

/* 1:1로 대화하던 상대가 나가면 전체 대화로 돌아간다 */
static void remove_member(const char *name)
{
    int i = find_member(name);
    if (i < 0)
        return;
    if (strcmp(dm_target, name) == 0)
        dm_target[0] = '\0';
    strcpy(members[i], members[--member_count]);
}

/* ================= ③ 중계: 방장 =================
   방장이 서버 역할을 한다. 받은 메시지를 받을 사람에게만 전하고,
   받을 사람이 비어 있으면 보낸 사람을 뺀 모두에게 전한다. */

struct client {                       /* 방장에게 접속한 참가자 */
    struct connection conn;
    char name[NAME_LEN];
    int  joined;                      /* HELLO로 이름을 밝혔나 */
};
static struct client clients[MAX_PEOPLE];
static int client_count;

static int find_client(const char *name)
{
    for (int i = 0; i < client_count; i++)
        if (clients[i].joined && strcmp(clients[i].name, name) == 0)
            return i;
    return -1;
}

static void make_packet(struct packet *p, int type, const char *from, const char *to)
{
    memset(p, 0, sizeof(*p));
    p->type = (uint8_t)type;
    strncpy(p->from, from, NAME_LEN - 1);
    strncpy(p->to, to, NAME_LEN - 1);
}

/* i번 참가자에게 알림을 보낸다 */
static void send_notice(int i, const char *fmt, ...)
{
    va_list ap;
    make_packet(&send_pkt, TYPE_NOTICE, "", clients[i].name);
    va_start(ap, fmt);
    send_pkt.body_len = vsnprintf((char *)send_pkt.body, MAX_BODY, fmt, ap);
    va_end(ap);
    send_packet(clients[i].conn.sock, &send_pkt);
}

/* 입장·퇴장 알림을 모두에게 */
static void notice_all(const char *name, const char *what)
{
    print_line("[알림] %s %s", name, what);
    for (int k = 0; k < client_count; k++)
        if (clients[k].joined)
            send_notice(k, "%s %s", name, what);
}

/* 참가자를 내보낸다 (연결이 끊겼거나 규칙을 어겼을 때) */
static void remove_client(int i)
{
    char name[NAME_LEN];
    int was_joined = clients[i].joined;
    strcpy(name, clients[i].name);
    closesocket(clients[i].conn.sock);
    clients[i] = clients[--client_count];
    if (was_joined) {
        remove_member(name);
        notice_all(name, "퇴장");
    }
}

/* 입장: 이름을 검사해서 같은 이름·이상한 이름이면 거절하고,
   통과하면 새 사람에게 방에 있는 사람들을 알려 준 뒤 모두에게 입장을 알린다 */
static int handle_join(int i, const struct packet *p)
{
    if (!is_valid_name(p->from) || find_client(p->from) >= 0 || strcmp(p->from, my_name) == 0) {
        send_notice(i, "이름 사용 중이거나 쓸 수 없음: %s", p->from);
        remove_client(i);
        return -1;
    }
    strcpy(clients[i].name, p->from);
    clients[i].joined = 1;
    for (int k = 0; k < client_count; k++)
        if (k != i && clients[k].joined) {
            make_packet(&send_pkt, TYPE_HELLO, clients[k].name, p->from);
            send_packet(clients[i].conn.sock, &send_pkt);
        }
    make_packet(&send_pkt, TYPE_HELLO, my_name, p->from);
    send_packet(clients[i].conn.sock, &send_pkt);
    add_member(p->from);
    notice_all(p->from, "입장");
    return 0;
}

static void print_message(const struct packet *p);

/* 중계 규칙: 이름을 밝히기 전에는 아무것도 못 보내고, 남의 이름으로 보내면 막는다.
   모두에게 온 글은 방장 화면에 띄우고 나머지 모두에게, 1:1은 그 사람에게만 전한다 */
static int handle_packet(int i, struct packet *p)
{
    if (!clients[i].joined && p->type != TYPE_HELLO) {
        send_notice(i, "먼저 HELLO를 보내야 합니다");
        remove_client(i);
        return -1;
    }
    if (p->type == TYPE_HELLO)
        return handle_join(i, p);
    if (p->type != TYPE_MESSAGE)
        send_notice(i, "모르는 type: %d", p->type);
    else if (strcmp(p->from, clients[i].name) != 0)
        send_notice(i, "보낸 사람 이름이 다릅니다: %s", p->from);
    else if (p->to[0] == '\0') {
        print_message(p);
        for (int k = 0; k < client_count; k++)
            if (k != i && clients[k].joined)
                send_packet(clients[k].conn.sock, p);
    } else if (strcmp(p->to, my_name) == 0) {
        print_message(p);
    } else {
        int to = find_client(p->to);
        if (to < 0)
            send_notice(i, "%s는 접속해 있지 않습니다", p->to);
        else
            send_packet(clients[to].conn.sock, p);
    }
    return 0;
}

/* 참가자에게서 온 것을 받아 처리한다 */
static void read_from_client(int i)
{
    int result;
    if (receive_bytes(&clients[i].conn) <= 0) {
        remove_client(i);
        return;
    }
    while ((result = take_packet(&clients[i].conn, &recv_pkt)) == 1)
        if (handle_packet(i, &recv_pkt) < 0)
            return;
    if (result < 0)
        remove_client(i);
}

/* ================= ④ 대화: 방장·참가자 =================
   받은 글 보여 주기, 글 보내기, 명령 처리, 키보드 입력 */

static struct connection host_conn;   /* 참가자: 방장과의 연결 */
static char recv_text[MAX_BODY + 1];

/* 받은 글을 보여 준다: [알림] …, [보낸 사람] …, 나에게만 온 1:1은 [보낸 사람 → 나] … */
static void print_message(const struct packet *p)
{
    char from[NAME_LEN];
    strcpy(from, p->from);
    remove_control_chars(from);
    memcpy(recv_text, p->body, p->body_len);
    recv_text[p->body_len] = '\0';
    remove_control_chars(recv_text);
    if (p->type == TYPE_NOTICE)
        print_line("[알림] %s", recv_text);
    else
        print_line(p->to[0] ? "[%s → 나] %s" : "[%s] %s", from, recv_text);
}

/* 참가자: 방장에게서 온 것을 받는다. 입장·퇴장 알림을 보고 사람 목록도 고친다 */
static void read_from_host(void)
{
    int result;
    if (receive_bytes(&host_conn) <= 0) {
        print_line("[알림] 방장과 연결이 끊어졌습니다");
        exit(1);
    }
    while ((result = take_packet(&host_conn, &recv_pkt)) == 1) {
        if (recv_pkt.type == TYPE_HELLO) {
            add_member(recv_pkt.from);
            continue;
        }
        print_message(&recv_pkt);
        if (recv_pkt.type == TYPE_NOTICE) {
            char name[NAME_LEN + 1], what[16];
            if (sscanf(recv_text, "%16s %15s", name, what) == 2 && strlen(name) < NAME_LEN) {
                if (strcmp(what, "입장") == 0)
                    add_member(name);
                else if (strcmp(what, "퇴장") == 0)
                    remove_member(name);
            }
        }
    }
    if (result < 0)
        exit(1);
}

/* 글 보내기: 1:1 중이면 그 사람에게, 아니면 모두에게.
   참가자는 방장에게 보내고, 방장은 직접 받을 사람에게 보낸다 */
static void send_message(const char *msg)
{
    size_t len = strlen(msg);
    if (len > MAX_INPUT) {
        len = MAX_INPUT;
        while (len > 0 && ((unsigned char)msg[len] & 0xC0) == 0x80)
            len--;                    /* 한글 글자 중간에서 자르지 않게 */
    }
    make_packet(&send_pkt, TYPE_MESSAGE, my_name, dm_target);
    memcpy(send_pkt.body, msg, len);
    send_pkt.body_len = (uint32_t)len;
    if (!is_host)
        send_packet(host_conn.sock, &send_pkt);
    else
        for (int k = 0; k < client_count; k++)
            if (clients[k].joined && (!dm_target[0] || strcmp(clients[k].name, dm_target) == 0))
                send_packet(clients[k].conn.sock, &send_pkt);
}

/* 명령 처리: /quit 나가기, /all 전체 대화, /dm 이름 1:1 대화, /who 접속한 사람. 나머지는 글로 보낸다 */
static void handle_input(const char *line)
{
    if (strcmp(line, "/quit") == 0) {
        exit(0);
    } else if (strcmp(line, "/all") == 0) {
        dm_target[0] = '\0';
        print_line("[전체 대화] 모두에게 갑니다");
    } else if (strncmp(line, "/dm ", 4) == 0) {
        if (find_member(line + 4) < 0) {
            print_line("[1:1 대화] %s는 접속해 있지 않습니다 (/who 로 확인)", line + 4);
        } else {
            strcpy(dm_target, line + 4);
            print_line("[1:1 대화] %s에게만 갑니다 · /all 로 돌아오기", dm_target);
        }
    } else if (strcmp(line, "/who") == 0) {
        printf("[접속 중] %s(나)", my_name);
        for (int i = 0; i < member_count; i++)
            printf(", %s", members[i]);
        print_line("");
    } else if (line[0] == '/') {
        print_line("[알림] 명령: /dm 이름 · /all · /who · /quit");
    } else if (member_count == 0) {
        print_line("[알림] 아직 아무도 없습니다");
    } else {
        send_message(line);
    }
}

/* 키보드 입력 스레드: 받기와 따로 돌아서, 글을 치는 중에도 받은 글이 뜬다. 한글 입력도 여기서 처리한다 */
static DWORD WINAPI keyboard_thread(LPVOID unused)
{
    static wchar_t wide[MAX_INPUT + 2];
    static char line[4 * MAX_INPUT];
    HANDLE input = GetStdHandle(STD_INPUT_HANDLE);
    DWORD console_mode, read_count;
    (void)unused;
    for (;;) {
        if (GetConsoleMode(input, &console_mode)) {
            if (!ReadConsoleW(input, wide, MAX_INPUT, &read_count, NULL) || read_count == 0)
                break;
            line[WideCharToMultiByte(CP_UTF8, 0, wide, (int)read_count, line, sizeof(line) - 1, NULL, NULL)] = '\0';
        } else if (!fgets(line, sizeof(line), stdin)) {   /* 파이프 입력 (자동 테스트용) */
            break;
        }
        size_t n = strcspn(line, "\r\n");
        while (n > 0 && line[n - 1] == ' ')
            n--;
        line[n] = '\0';
        if (n == 0)
            continue;
        EnterCriticalSection(&lock);
        handle_input(line);
        LeaveCriticalSection(&lock);
    }
    exit(0);
}

/* 방장 화면에 내 주소를 띄워서, 다른 컴퓨터가 무엇을 치고 들어오면 되는지 알려 준다 */
static void print_my_address(void)
{
    struct sockaddr_in to = {0}, me;
    int len = sizeof(me);
    char ip[INET_ADDRSTRLEN] = "127.0.0.1";
    int sock = (int)socket(AF_INET, SOCK_DGRAM, 0);
    to.sin_family = AF_INET;
    to.sin_port = htons(53);
    inet_pton(AF_INET, "8.8.8.8", &to.sin_addr);
    if (connect(sock, (struct sockaddr *)&to, sizeof(to)) == 0 && getsockname(sock, (struct sockaddr *)&me, &len) == 0)
        inet_ntop(AF_INET, &me.sin_addr, ip, sizeof(ip));
    closesocket(sock);
    print_line("[주소] 다른 컴퓨터는  deolmi 이름 %s  으로 들어와요 (같은 와이파이)", ip);
}

/* ================= ⑤ 실행 =================
   방장이면 방을 열고, 참가자면 방장에게 접속해서 이름을 밝힌다.
   그다음 키보드 입력 스레드를 띄우고, main은 select로 여러 연결을 같이 지켜보며 받는다. */

int main(void)
{
    static char args[3][256];
    int arg_count, listen_sock = -1;
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);
    InitializeCriticalSection(&lock);
    SetConsoleOutputCP(CP_UTF8);
    /* 한글 이름이 깨지지 않게 명령줄을 UTF-8로 바꿔 받는다 */
    wchar_t **wide_args = CommandLineToArgvW(GetCommandLineW(), &arg_count);
    for (int i = 0; i < arg_count && i < 3; i++)
        WideCharToMultiByte(CP_UTF8, 0, wide_args[i], -1, args[i], sizeof(args[i]), NULL, NULL);

    if (arg_count < 2 || !is_valid_name(args[1])) {
        printf("쓰는 법: deolmi 이름 --host (방을 연다) / deolmi 이름 [주소] (방에 들어간다)\n"
               "이름은 한글 5글자까지, 띄어쓰기와 / 없이\n");
        return 1;
    }
    strcpy(my_name, args[1]);
    is_host = arg_count >= 3 && strcmp(args[2], "--host") == 0;
    if (is_host) {
        if ((listen_sock = open_room(PORT)) < 0) {
            printf("%d번 포트로 방을 열 수 없어요 (이미 켜 둔 방장이 있나요?)\n", PORT);
            return 1;
        }
        print_line("덜미 · %s · 방장", my_name);
        print_my_address();
    } else {
        const char *host = arg_count >= 3 ? args[2] : "127.0.0.1";
        if ((host_conn.sock = connect_to_host(host, PORT)) < 0) {
            printf("%s 에 접속하지 못했어요. 방장이 방을 열었는지, 주소와 와이파이가 맞는지 보세요\n", host);
            return 1;
        }
        make_packet(&send_pkt, TYPE_HELLO, my_name, "");
        send_packet(host_conn.sock, &send_pkt);
        print_line("덜미 · %s · %s 에 접속", my_name, host);
    }
    print_line("그냥 치면 모두에게 · /dm 이름 = 1:1 · /all · /who · /quit");
    CloseHandle(CreateThread(NULL, 0, keyboard_thread, NULL, 0, NULL));

    for (;;) {
        fd_set fds;
        int main_sock = is_host ? listen_sock : host_conn.sock, n;
        FD_ZERO(&fds);
        FD_SET(main_sock, &fds);
        EnterCriticalSection(&lock);
        n = client_count;
        for (int i = 0; i < n; i++)
            FD_SET(clients[i].conn.sock, &fds);
        LeaveCriticalSection(&lock);
        if (select(0, &fds, NULL, NULL, NULL) < 0)
            continue;
        EnterCriticalSection(&lock);
        for (int i = n - 1; i >= 0; i--)   /* 뒤에서부터: 중간에 누가 나가도 건너뛰는 사람이 없게 */
            if (FD_ISSET(clients[i].conn.sock, &fds))
                read_from_client(i);
        if (FD_ISSET(main_sock, &fds) && !is_host)
            read_from_host();
        else if (FD_ISSET(main_sock, &fds)) {   /* 방장: 새 사람 접속 */
            int sock = (int)accept(listen_sock, NULL, NULL);
            if (sock >= 0 && client_count < MAX_PEOPLE) {
                memset(&clients[client_count], 0, sizeof(clients[0]));
                clients[client_count++].conn.sock = sock;
            } else
                closesocket(sock);
        }
        LeaveCriticalSection(&lock);
    }
}
#endif   /* NET_ONLY */
