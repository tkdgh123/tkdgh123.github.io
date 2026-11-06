#define _CRT_SECURE_NO_WARNINGS
#pragma execution_character_set("utf-8")   // 한글 안 깨지게
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




// 통신 부분
// TCP는 메시지가 쪼개지거나 붙어서 올 수 있어서 맨 앞에 길이(4바이트)를 붙여서 보낸다
// 패킷 구조: 길이 4 + 종류 1 + 보낸 사람 16 + 받을 사람 16 + 본문

#define NAME_LEN    16                // 이름 최대 15바이트 + '\0'
#define HEADER_LEN  (1 + NAME_LEN + NAME_LEN)
#define MAX_BODY    65536
#define MAX_PACKET  (4 + HEADER_LEN + MAX_BODY)




// 패킷 종류 (HELLO: 접속할 때 이름 보내기, MESSAGE: 채팅, NOTICE: 방장이 보내는 알림)
enum { TYPE_HELLO = 1, TYPE_MESSAGE, TYPE_NOTICE };




struct packet {
    uint8_t  type;
    char     from[NAME_LEN], to[NAME_LEN];
    uint32_t body_len;
    uint8_t  body[MAX_BODY];
};




struct connection {                 // 받은 바이트를 모아두는 버퍼
    int     sock;
    uint8_t buf[MAX_PACKET];
    size_t  len;
};




// 방장이 방 열기
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




// 참가자가 방장한테 접속
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




// 패킷을 바이트 배열로 바꾸기
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




// 0이면 연결 끊김
int receive_bytes(struct connection *conn)
{
    int n = recv(conn->sock, (char *)conn->buf + conn->len, (int)(sizeof(conn->buf) - conn->len), 0);
    if (n > 0)
        conn->len += n;
    return n;
}




// 버퍼에서 패킷 하나 꺼내기
// 리턴값 1: 꺼냄, 0: 아직 다 안 옴, -1: 길이가 이상함
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




#ifndef NET_ONLY   // 통신 부분만 따로 테스트할 때는 여기까지만 씀

#define PORT       9000
#define MAX_PEOPLE 60                 // 윈도우 select가 64개까지라서
#define MAX_INPUT  1000




static int  is_host;
static char my_name[NAME_LEN];
static char dm_target[NAME_LEN];      // 1:1 대화 상대 (비어 있으면 전체)
static struct packet recv_pkt, send_pkt;
static CRITICAL_SECTION lock;         // 두 스레드가 동시에 건드리지 않게




// 화면 출력, 이름 검사, 접속자 목록

static void print_line(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\n");
    fflush(stdout);
}




// 받은 글에 제어 문자가 있으면 ?로 바꿈
static void remove_control_chars(char *s)
{
    for (; *s; s++)
        if ((unsigned char)*s < 0x20 || *s == 0x7f)
            *s = '?';
}




// 이름은 1~15바이트, 공백이랑 /는 안 됨
static int is_valid_name(const char *s)
{
    for (const char *c = s; *c; c++)
        if ((unsigned char)*c <= ' ' || *c == '/')
            return 0;
    return s[0] && strlen(s) < NAME_LEN;
}




// 지금 방에 있는 사람들 (나는 빼고)
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




// 1:1 하던 사람이 나가면 다시 전체 대화로
static void remove_member(const char *name)
{
    int i = find_member(name);
    if (i < 0)
        return;
    if (strcmp(dm_target, name) == 0)
        dm_target[0] = '\0';
    strcpy(members[i], members[--member_count]);
}




// 중계 부분 (방장)
// 방장이 서버 역할을 한다. 받는 사람이 정해져 있으면 그 사람한테만 보내고
// 비어 있으면 보낸 사람 빼고 전부한테 보낸다

struct client {                       // 방장한테 접속한 참가자
    struct connection conn;
    char name[NAME_LEN];
    int  joined;                      // HELLO 받았는지
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




// i번 참가자한테 알림 보내기
static void send_notice(int i, const char *fmt, ...)
{
    va_list ap;
    make_packet(&send_pkt, TYPE_NOTICE, "", clients[i].name);
    va_start(ap, fmt);
    send_pkt.body_len = vsnprintf((char *)send_pkt.body, MAX_BODY, fmt, ap);
    va_end(ap);
    send_packet(clients[i].conn.sock, &send_pkt);
}




// 입장, 퇴장 알림
static void notice_all(const char *name, const char *what)
{
    print_line("[알림] %s %s", name, what);
    for (int k = 0; k < client_count; k++)
        if (clients[k].joined)
            send_notice(k, "%s %s", name, what);
}




// 연결이 끊기거나 규칙을 어기면 내보냄
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




// 입장 처리
// 이름이 겹치거나 쓸 수 없는 이름이면 거절하고, 괜찮으면 새로 온 사람한테 지금 있는 사람들을 알려준다
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




// 받은 패킷 처리
// HELLO 전에 다른 걸 보내면 끊고, 보낸 사람 이름이 다르면 막는다
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




// 대화 부분 (방장, 참가자 둘 다 씀)

static struct connection host_conn;   // 참가자일 때 방장과의 연결
static char recv_text[MAX_BODY + 1];




// 받은 메시지 출력
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
        print_line(p->to[0] ? "[%s -> 나] %s" : "[%s] %s", from, recv_text);
}




// 참가자: 방장한테 온 걸 받음. 입장/퇴장 알림이면 목록도 고친다
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




// 메시지 보내기 (참가자는 방장한테 보내고, 방장은 바로 받는 사람한테 보냄)
static void send_message(const char *msg)
{
    size_t len = strlen(msg);
    if (len > MAX_INPUT) {
        len = MAX_INPUT;
        while (len > 0 && ((unsigned char)msg[len] & 0xC0) == 0x80)
            len--;                    // 한글 중간에서 잘리지 않게
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




// 명령어: /quit, /all, /dm 이름, /who (명령어가 아니면 메시지로 보냄)
static void handle_input(const char *line)
{
    if (strcmp(line, "/quit") == 0) {
        exit(0);
    } else if (strcmp(line, "/all") == 0) {
        dm_target[0] = '\0';
        print_line("[전체 대화] 모두에게 보냅니다");
    } else if (strncmp(line, "/dm ", 4) == 0) {
        if (find_member(line + 4) < 0) {
            print_line("[1:1 대화] %s는 접속해 있지 않습니다 (/who로 확인)", line + 4);
        } else {
            strcpy(dm_target, line + 4);
            print_line("[1:1 대화] %s에게만 보냅니다 (/all 입력하면 전체 대화로)", dm_target);
        }
    } else if (strcmp(line, "/who") == 0) {
        printf("[접속 중] %s(나)", my_name);
        for (int i = 0; i < member_count; i++)
            printf(", %s", members[i]);
        print_line("");
    } else if (line[0] == '/') {
        print_line("[알림] 명령어: /dm 이름, /all, /who, /quit");
    } else if (member_count == 0) {
        print_line("[알림] 아직 아무도 없습니다");
    } else {
        send_message(line);
    }
}




// 한 줄 입력받기
// 그냥 받으면 한글이 깨져서 ReadConsoleW로 받고 UTF-8로 바꾼다
static int read_line(char *line, int size)
{
    static wchar_t wide[MAX_INPUT + 2];
    HANDLE input = GetStdHandle(STD_INPUT_HANDLE);
    DWORD console_mode, read_count;
    if (GetConsoleMode(input, &console_mode)) {
        if (!ReadConsoleW(input, wide, MAX_INPUT, &read_count, NULL) || read_count == 0)
            return 0;
        line[WideCharToMultiByte(CP_UTF8, 0, wide, (int)read_count, line, size - 1, NULL, NULL)] = '\0';
    } else if (!fgets(line, size, stdin)) {   // 파이프로 입력할 때
        return 0;
    }
    size_t n = strcspn(line, "\r\n");
    while (n > 0 && line[n - 1] == ' ')
        n--;
    line[n] = '\0';
    return 1;
}




// 입력 스레드 (입력을 따로 받아야 치는 중에도 메시지가 뜸)
static DWORD WINAPI keyboard_thread(LPVOID unused)
{
    static char line[4 * MAX_INPUT];
    (void)unused;
    while (read_line(line, sizeof(line))) {
        if (line[0] == '\0')
            continue;
        EnterCriticalSection(&lock);
        handle_input(line);
        LeaveCriticalSection(&lock);
    }
    exit(0);
}




static void ask_line(const char *question, char *answer, int size)
{
    printf("%s", question);
    fflush(stdout);
    if (!read_line(answer, size))
        exit(1);
}




// 내 IP 주소 출력 (다른 사람이 이 주소로 접속)
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
    print_line("[주소] %s (같은 와이파이에서 이 주소로 접속)", ip);
}




// main
// 방장이면 방을 열고 참가자면 접속해서 HELLO를 보낸다. 그다음 select로 계속 받음

int main(void)
{
    static char args[3][256];
    int arg_count, listen_sock = -1;
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);
    InitializeCriticalSection(&lock);
    SetConsoleOutputCP(CP_UTF8);
    // 빠른 편집 모드 끄기 (켜져 있으면 창 클릭했을 때 멈춤)
    HANDLE console_in = GetStdHandle(STD_INPUT_HANDLE);
    DWORD console_mode;
    if (GetConsoleMode(console_in, &console_mode))
        SetConsoleMode(console_in, (console_mode & ~ENABLE_QUICK_EDIT_MODE) | ENABLE_EXTENDED_FLAGS);
    // 명령줄 인자도 한글 때문에 UTF-8로 변환
    wchar_t **wide_args = CommandLineToArgvW(GetCommandLineW(), &arg_count);
    for (int i = 0; i < arg_count && i < 3; i++)
        WideCharToMultiByte(CP_UTF8, 0, wide_args[i], -1, args[i], sizeof(args[i]), NULL, NULL);

    // 인자 없이 실행하면 이름이랑 방장/참가자를 물어봄, 잘못 입력하면 다시 물어봄
    char answer[256], host[256] = "127.0.0.1";
    for (;;) {
        if (arg_count < 2) {
            ask_line("이름 (한글 5글자까지): ", args[1], sizeof(args[1]));
            ask_line("1. 방장  2. 참가자 : ", answer, sizeof(answer));
            is_host = answer[0] == '1';
            if (!is_host) {
                ask_line("방장 주소 (같은 컴퓨터면 그냥 엔터): ", answer, sizeof(answer));
                strcpy(host, answer[0] ? answer : "127.0.0.1");
            }
        } else {
            is_host = arg_count >= 3 && strcmp(args[2], "--host") == 0;
            if (!is_host && arg_count >= 3)
                strcpy(host, args[2]);
        }
        if (!is_valid_name(args[1]))
            printf("이름은 한글 5글자까지, 공백이나 / 없이 입력하세요\n");
        else if (is_host && (listen_sock = open_room(PORT)) < 0)
            printf("%d번 포트로 방을 열 수 없습니다 (이미 방이 열려 있는지 확인)\n", PORT);
        else if (!is_host && (host_conn.sock = connect_to_host(host, PORT)) < 0)
            printf("%s에 접속하지 못했습니다 (주소, 와이파이 확인)\n", host);
        else
            break;
        if (arg_count >= 2)
            return 1;
    }
    strcpy(my_name, args[1]);
    if (is_host) {
        print_line("덜미 - %s (방장)", my_name);
        print_my_address();
    } else {
        make_packet(&send_pkt, TYPE_HELLO, my_name, "");
        send_packet(host_conn.sock, &send_pkt);
        print_line("덜미 - %s (%s에 접속)", my_name, host);
    }
    print_line("명령어: /dm 이름(1:1 대화), /all(전체 대화), /who(접속자 보기), /quit(나가기)");
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
        for (int i = n - 1; i >= 0; i--)   // 뒤에서부터 돌아야 중간에 누가 나가도 안 꼬임
            if (FD_ISSET(clients[i].conn.sock, &fds))
                read_from_client(i);
        if (FD_ISSET(main_sock, &fds) && !is_host)
            read_from_host();
        else if (FD_ISSET(main_sock, &fds)) {   // 새로 접속한 사람
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
#endif
