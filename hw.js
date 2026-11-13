/* 과제 풀이: Assignment 02 369 게임 · 도전문제 Robot Escape — 강의정리 단원 + 퀴즈 */
(function () {
const R = String.raw;
const C369 = R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int n, i, num, digit, count;

    printf("369 게임을 진행할 최대 숫자를 입력하세요: ");
    scanf("%d", &n);

    for (i = 1; i <= n; i++)
    {
        num = i;
        count = 0;
        while (num > 0)              // 각 자릿수를 하나씩 확인
        {
            digit = num % 10;        // 일의 자리 숫자를 꺼낸다
            if (digit == 3 || digit == 6 || digit == 9)
                count++;
            num = num / 10;          // 일의 자리를 버리고 다음 자리로
        }

        if (count == 0)              // 3, 6, 9가 없으면 숫자 그대로
            printf("%d ", i);
        else
        {
            while (count > 0)        // 3, 6, 9의 개수만큼 "짝"
            {
                printf("짝");
                count--;
            }
            printf(" ");
        }
    }
    printf("\n");
    return 0;
}`;
const CROBOT = R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int x = 0, y = 0;    // 로봇의 현재 위치
    int nx, ny;          // 이동하려는 위치
    int count = 0;       // 성공한 이동 횟수
    char cmd;

    while (!(x == 3 && y == 3))
    {
        printf("현재 위치 (%d, %d) 명령 입력(W/A/S/D, Q 종료): ", x, y);
        scanf(" %c", &cmd);

        if (cmd == 'Q' || cmd == 'q')
            break;

        nx = x;
        ny = y;
        switch (cmd)
        {
        case 'W': case 'w': ny++; break;
        case 'S': case 's': ny--; break;
        case 'A': case 'a': nx--; break;
        case 'D': case 'd': nx++; break;
        default:
            printf("Cannot move!\n");
            continue;
        }

        if (nx < 0 || nx > 3 || ny < 0 || ny > 3 || (nx == 2 && ny == 2))
        {
            printf("Cannot move!\n");
            continue;
        }

        x = nx;
        y = ny;
        count++;
    }

    if (x == 3 && y == 3)
        printf("목적지 (3, 3)에 도착했습니다!\n");
    printf("성공한 이동 횟수: %d\n", count);
    return 0;
}`;
const OUT30 = "1 2 짝 4 5 짝 7 8 짝 10 11 12 짝 14 15 짝 17 18 짝 20 21 22 짝 24 25 짝 27 28 짝 짝";

window.NOTES = window.NOTES || [];
window.NOTES.push({
  id: "hw", no: 10, short: "과제", cap: "ASSIGNMENT", label: "과제 풀이", color: 3,
  title: "369 게임 · Robot Escape",
  summary: "Assignment 02 369 게임과 도전문제 Robot Escape를 강의 문법(%, /, while, if, switch, continue, break)만으로 정석대로 푼 코드와 해설",
  sections: [
    { id: "hw-1", title: "369 게임 — 문제와 풀이 전략", en: "Assignment 02", blocks: [
      { t: "p", h: "1부터 n까지 차례로 보면서, 각 숫자의 <b>자릿수</b>에 3·6·9가 몇 개 들어 있는지 센다. 0개면 숫자를 그대로, 1개면 <code>짝</code>, 2개면 <code>짝짝</code>을 출력한다." },
      { t: "key", h: "<b>자릿수 분리 공식</b> (5장 % 와 /): <code>num % 10</code> → 일의 자리 숫자, <code>num / 10</code> → 일의 자리를 버린 나머지 숫자. 이 두 줄을 <code>num</code>이 0이 될 때까지 <code>while</code>로 반복하면 모든 자리를 하나씩 볼 수 있다." },
      { t: "ex", h: "36 → <code>36 % 10 = 6</code>(짝 1) → <code>36 / 10 = 3</code> → <code>3 % 10 = 3</code>(짝 2) → <code>3 / 10 = 0</code> 종료 → 개수 2 → <code>짝짝</code>" },
      { t: "table", h: "<table><tr><th>요구 사항</th><th>코드에서 담당하는 부분</th></tr><tr><td>n 입력</td><td><code>scanf(\"%d\", &n)</code></td></tr><tr><td>1~n 차례로 확인</td><td><code>for (i = 1; i <= n; i++)</code></td></tr><tr><td>각 자릿수 확인</td><td>안쪽 <code>while (num > 0)</code> + <code>% 10</code>, <code>/ 10</code></td></tr><tr><td>개수에 따라 짝/짝짝</td><td><code>while (count > 0)</code>로 개수만큼 <code>짝</code></td></tr><tr><td>없으면 숫자 그대로</td><td><code>if (count == 0) printf(\"%d \", i)</code></td></tr></table>" },
    ] },
    { id: "hw-2", title: "369 게임 전체 코드", en: "game369.c", blocks: [
      { t: "code", cap: "Assignment02 — 369 게임", s: C369, note: "<b>바깥 for</b>가 1~n을 돌고, 숫자마다 <code>num</code>에 복사해서 <b>안쪽 while</b>로 자릿수를 깎아 가며 3·6·9를 센다(<code>i</code>를 직접 깎으면 for 반복 변수가 망가지므로 복사본 <code>num</code>을 쓴다). <code>count</code>는 숫자마다 0으로 다시 시작해야 이전 숫자의 개수가 섞이지 않는다. 출력 단계에서는 개수만큼 <code>짝</code>을 찍어서 1개·2개·3개를 모두 처리한다." },
      { t: "out", h: "369 게임을 진행할 최대 숫자를 입력하세요: 30\n" + OUT30 },
      { t: "warn", h: "<code>num = num / 10;</code>을 빼먹으면 <code>num</code>이 줄지 않아 안쪽 while이 <b>무한 루프</b>가 된다. 조건을 <code>num >= 0</code>으로 써도 0에서 멈추지 않아 무한 루프." },
    ] },
    { id: "hw-3", title: "Robot Escape — 문제와 풀이 전략", en: "도전문제", blocks: [
      { t: "p", h: "4×4 칸에서 로봇이 (0, 0)에서 출발해 (3, 3)에 도착할 때까지 W(위)·S(아래)·A(왼쪽)·D(오른쪽) 명령을 받는다. 범위 밖이거나 장애물 (2, 2)로는 갈 수 없고, 그때는 <code>Cannot move!</code>를 출력하고 다시 입력받는다. 배열 없이 <code>x</code>, <code>y</code> 변수로 위치를 관리한다." },
      { t: "key", h: "<b>먼저 검사하고, 실패하면 continue</b>: 바로 <code>x</code>, <code>y</code>를 바꾸지 말고 <b>이동할 위치</b> <code>nx</code>, <code>ny</code>를 먼저 계산한다. 갈 수 없으면 <code>continue</code>로 이번 반복의 나머지(위치 갱신, 횟수 증가)를 건너뛰므로 현재 위치와 횟수가 그대로 남는다." },
      { t: "table", h: "<table><tr><th>명령</th><th>변화</th></tr><tr><td>W (위)</td><td><code>ny++</code> — 지도에서 (0,3)이 맨 위</td></tr><tr><td>S (아래)</td><td><code>ny--</code></td></tr><tr><td>A (왼쪽)</td><td><code>nx--</code></td></tr><tr><td>D (오른쪽)</td><td><code>nx++</code></td></tr><tr><td>Q</td><td><code>break</code> — 반복 종료</td></tr></table>" },
    ] },
    { id: "hw-4", title: "Robot Escape 전체 코드", en: "robot.c", blocks: [
      { t: "code", cap: "도전문제 — Robot Escape", s: CROBOT, note: "<code>while (!(x == 3 && y == 3))</code>는 '도착하지 않은 동안'이라는 뜻이다(<code>x != 3 || y != 3</code>와 같다). <code>switch</code>의 <code>default</code>에 있는 <code>continue</code>는 switch가 아니라 <b>바깥 while의 다음 반복</b>으로 간다. 여기에 <code>break</code>를 쓰면 switch만 빠져나와, 잘못된 키도 '제자리 이동'으로 성공 처리되어 횟수가 늘어나 버린다. 범위·장애물 검사를 통과했을 때만 <code>x = nx; y = ny; count++;</code>를 실행한다." },
      { t: "out", h: "현재 위치 (0, 0) 명령 입력(W/A/S/D, Q 종료): a\nCannot move!\n현재 위치 (0, 0) 명령 입력(W/A/S/D, Q 종료): d\n현재 위치 (1, 0) 명령 입력(W/A/S/D, Q 종료): d\n현재 위치 (2, 0) 명령 입력(W/A/S/D, Q 종료): w\n현재 위치 (2, 1) 명령 입력(W/A/S/D, Q 종료): w\nCannot move!\n현재 위치 (2, 1) 명령 입력(W/A/S/D, Q 종료): d\n현재 위치 (3, 1) 명령 입력(W/A/S/D, Q 종료): w\n현재 위치 (3, 2) 명령 입력(W/A/S/D, Q 종료): w\n목적지 (3, 3)에 도착했습니다!\n성공한 이동 횟수: 6" },
      { t: "warn", h: "<code>scanf(\" %c\", &cmd)</code>의 <b>앞 공백</b>이 없으면 앞에서 입력한 Enter(<code>\\n</code>)가 다음 명령으로 읽혀서 매번 <code>Cannot move!</code>가 한 번씩 더 나온다." },
    ] },
  ],
});

const G = window.GEN = window.GEN || { mc: [], sa: [], lb: [], fc: [] };
const Q = (q, code) => code ? q + "\n\n" + code : q;
G.mc.push(
  { ch: "hw", q: Q("369 게임 코드의 안쪽 반복문이다. digit = num % 10; 이 하는 일은?", "while (num > 0)\n{\n    digit = num % 10;\n    if (digit == 3 || digit == 6 || digit == 9)\n        count++;\n    num = num / 10;\n}"), opts: ["num의 일의 자리 숫자를 구한다", "num을 10으로 나눈 몫을 구한다", "num의 자릿수 개수를 구한다", "num이 10의 배수인지 검사한다"], ans: 0, exp: "% 는 나머지 연산자. 어떤 정수를 10으로 나눈 나머지가 곧 일의 자리 숫자다(36 % 10 = 6)." },
  { ch: "hw", q: Q("다음 반복문에서 num = num / 10; 줄을 지우면 어떻게 되는가? (num은 1 이상의 정수)", "while (num > 0)\n{\n    digit = num % 10;\n    if (digit == 3 || digit == 6 || digit == 9)\n        count++;\n    num = num / 10;\n}"), opts: ["일의 자리만 검사하고 정상 종료한다", "num이 줄지 않아 무한 루프에 빠진다", "컴파일 오류가 난다", "count가 항상 0이 된다"], ans: 1, exp: "조건 num > 0을 거짓으로 만드는 문장이 사라지므로 반복이 끝나지 않는다. 같은 자리만 계속 검사하며 count도 계속 증가한다." },
  { ch: "hw", q: Q("1부터 n까지 반복하는 for 안에서 count = 0; 을 숫자마다 다시 실행하는 이유는?", "for (i = 1; i <= n; i++)\n{\n    num = i;\n    count = 0;\n    while (num > 0) { /* 3,6,9 세기 */ }\n    /* count에 따라 출력 */\n}"), opts: ["count가 int 범위를 넘지 않게 하려고", "이전 숫자에서 센 3·6·9 개수가 다음 숫자에 섞이지 않게 하려고", "for 문은 변수를 매번 초기화해야 문법에 맞기 때문에", "num과 count의 값을 같게 만들려고"], ans: 1, exp: "count는 숫자 하나에 들어 있는 3·6·9의 개수다. 다시 0으로 하지 않으면 3(1개) 다음 4에서 count가 1로 남아 4도 '짝'이 된다." },
  { ch: "hw", q: Q("for 안에서 i를 직접 쓰지 않고 num = i; 로 복사한 뒤 num을 깎는 이유는?", "for (i = 1; i <= n; i++)\n{\n    num = i;\n    while (num > 0)\n        num = num / 10;   /* 자릿수 분리 */\n}"), opts: ["i를 10으로 나누면 for의 반복 변수가 망가져 1~n을 제대로 돌 수 없기 때문에", "int 변수는 나눗셈을 할 수 없기 때문에", "num이 i보다 큰 값을 저장할 수 있기 때문에", "for 문 안에서는 i를 읽을 수 없기 때문에"], ans: 0, exp: "i를 깎으면 매번 0이 되어 i++ 후 다시 1이 되는 식으로 반복이 엉킨다. 반복 변수는 그대로 두고 복사본을 깎는다." },
  { ch: "hw", q: Q("i = 36일 때 아래 while 문은 몇 번 반복하고, 반복이 끝난 뒤 count는?", "num = 36;\ncount = 0;\nwhile (num > 0)\n{\n    digit = num % 10;\n    if (digit == 3 || digit == 6 || digit == 9)\n        count++;\n    num = num / 10;\n}"), opts: ["1번, count = 1", "2번, count = 2", "2번, count = 1", "3번, count = 2"], ans: 1, exp: "36 → 6 확인(count 1), num 3 → 3 확인(count 2), num 0 → 종료. 두 자리 수이므로 2번 반복한다." },
  { ch: "hw", q: Q("다음 코드에서 count = 2일 때 출력은? (따옴표 없이)", "if (count == 0)\n    printf(\"%d \", i);\nelse\n{\n    while (count > 0)\n    {\n        printf(\"짝\");\n        count--;\n    }\n    printf(\" \");\n}"), opts: ["짝 짝 ", "짝짝 ", "짝 ", "2 "], ans: 1, exp: "while이 count만큼(2번) '짝'을 붙여 찍고, 마지막에 공백 하나를 찍는다." },
  { ch: "hw", q: "이 369 프로그램(각 자릿수의 3·6·9 개수만큼 '짝' 출력)에서 i = 30, i = 100, i = 333 의 출력을 차례로 고르면?", opts: ["짝 / 100 / 짝짝짝", "30 / 100 / 짝짝", "짝 / 짝 / 짝짝짝", "짝짝 / 100 / 짝"], ans: 0, exp: "30은 3이 1개(0은 해당 없음) → 짝, 100은 3·6·9가 없음 → 100, 333은 3이 3개 → 짝짝짝." },
  { ch: "hw", q: Q("다음 프로그램에 15를 입력했을 때의 출력은?", C369.replace(/\s*\/\/[^\n]*/g, "")), opts: ["1 2 짝 4 5 짝 7 8 짝 10 11 12 짝 14 15", "1 2 짝 4 5 짝 7 8 짝 10 11 12 13 14 15", "1 2 짝 4 5 짝 7 8 짝 10 11 12 짝 14 짝", "1 2 짝 4 5 짝 7 8 짝 짝 11 12 짝 14 15"], ans: 0, exp: "3, 6, 9, 13만 3·6·9를 포함한다(15는 1과 5). 10의 0은 3·6·9가 아니다." },
  { ch: "hw", q: "자릿수 digit(0~9)가 3, 6, 9 중 하나인지 검사하는 조건 digit == 3 || digit == 6 || digit == 9 와 결과가 항상 같은 식은?", opts: ["digit % 3 == 0", "digit != 0 && digit % 3 == 0", "digit / 3 == 1", "digit % 3 != 0"], ans: 1, exp: "0~9 중 3으로 나누어떨어지는 수는 0, 3, 6, 9. 0을 빼야 하므로 digit != 0 && digit % 3 == 0." },
  { ch: "hw", q: Q("자릿수 분리 반복의 조건을 num > 0 대신 num >= 0 으로 쓰면?", "while (num >= 0)\n{\n    digit = num % 10;\n    num = num / 10;\n}"), opts: ["0의 자리까지 한 번 더 검사하고 정상 종료한다", "num이 0에서 더 줄지 않아 무한 루프가 된다", "num이 음수가 되면서 종료한다", "차이가 없다"], ans: 1, exp: "0 / 10 = 0이므로 num은 0에 머물고 num >= 0은 계속 참이다." },
  { ch: "hw", q: Q("로봇 코드에서 x, y를 바로 바꾸지 않고 nx, ny에 먼저 이동할 위치를 계산하는 이유는?", "nx = x;\nny = y;\nswitch (cmd) { /* nx, ny 변경 */ }\nif (nx < 0 || nx > 3 || ny < 0 || ny > 3 || (nx == 2 && ny == 2))\n{\n    printf(\"Cannot move!\\n\");\n    continue;\n}\nx = nx;\ny = ny;\ncount++;"), opts: ["이동할 수 있는지 먼저 검사해서, 안 되면 현재 위치를 그대로 두려고", "x, y는 char형이라 직접 더할 수 없어서", "switch 안에서는 x, y를 바꿀 수 없어서", "nx, ny가 있어야 반복문이 끝나기 때문에"], ans: 0, exp: "'먼저 검사하고 실패하면 continue'. 바로 x를 바꿨다면 잘못된 이동 뒤 원래 위치로 되돌리는 코드가 따로 필요하다." },
  { ch: "hw", q: Q("while 반복 안의 switch에서 default에 있는 continue가 실행되면 다음에 실행되는 것은?", "while (!(x == 3 && y == 3))\n{\n    scanf(\" %c\", &cmd);\n    switch (cmd)\n    {\n    case 'W': ny++; break;\n    default:\n        printf(\"Cannot move!\\n\");\n        continue;\n    }\n    /* 범위 검사, 이동, count++ */\n}"), opts: ["switch 문 바로 다음 줄(범위 검사)", "while의 조건 검사 → 다음 반복", "프로그램 종료", "case 'W'"], ans: 1, exp: "continue는 switch가 아니라 자신을 감싼 반복문에 적용된다. 아래 문장을 건너뛰고 while 조건부터 다시 시작한다." },
  { ch: "hw", q: Q("위 로봇 코드에서 default의 continue; 를 break; 로 바꾸고 잘못된 키 'x'를 입력하면?", "nx = x;\nny = y;\nswitch (cmd)\n{\n/* W, S, A, D 처리 */\ndefault:\n    printf(\"Cannot move!\\n\");\n    break;\n}\nif (nx < 0 || nx > 3 || ny < 0 || ny > 3 || (nx == 2 && ny == 2))\n{\n    printf(\"Cannot move!\\n\");\n    continue;\n}\nx = nx;\ny = ny;\ncount++;"), opts: ["Cannot move!를 출력하고 횟수는 그대로다", "Cannot move!가 두 번 출력된다", "Cannot move!를 출력한 뒤 제자리 '이동'이 성공으로 처리되어 count가 1 늘어난다", "프로그램이 종료된다"], ans: 2, exp: "break는 switch만 빠져나온다. nx, ny는 현재 위치 그대로라 검사를 통과하고 count++가 실행된다. 그래서 continue를 써야 한다." },
  { ch: "hw", q: "4×4 칸(0 ≤ x, y ≤ 3)에서 장애물 (2, 2)가 있을 때, 이동하려는 위치 (nx, ny)가 갈 수 없는 곳인지 검사하는 조건으로 옳은 것은?", opts: ["nx < 0 && nx > 3 && ny < 0 && ny > 3 && nx == 2 && ny == 2", "nx < 0 || nx > 3 || ny < 0 || ny > 3 || (nx == 2 && ny == 2)", "nx <= 0 || nx >= 3 || ny <= 0 || ny >= 3 || nx == 2 || ny == 2", "(nx >= 0 && nx <= 3) || (ny >= 0 && ny <= 3)"], ans: 1, exp: "한 가지만 어겨도 못 가므로 ||로 묶는다. 장애물은 x와 y가 동시에 2일 때만이므로 (nx == 2 && ny == 2)." },
  { ch: "hw", q: "반복 조건 while (!(x == 3 && y == 3)) 과 같은 뜻의 조건은?", opts: ["while (x != 3 && y != 3)", "while (x != 3 || y != 3)", "while (x == 3 || y == 3)", "while (!x == 3 && !y == 3)"], ans: 1, exp: "!(A && B) = !A || !B (드모르간 법칙). x != 3 && y != 3 으로 쓰면 x만 3이 되어도 반복이 끝나 버린다." },
  { ch: "hw", q: Q("scanf에서 %c 앞에 공백을 넣은 이유는?", "scanf(\" %c\", &cmd);"), opts: ["입력 버퍼에 남은 Enter(\\n)와 공백을 건너뛰고 실제 문자를 읽으려고", "대문자를 소문자로 바꾸려고", "문자를 두 개씩 읽으려고", "공백 문자만 입력받으려고"], ans: 0, exp: "공백이 없으면 직전 입력의 Enter가 cmd로 읽혀 default로 가서 Cannot move!가 한 번 더 나온다." },
  { ch: "hw", q: "로봇이 (0, 0)에서 시작해 d, d, w, w, x, q 를 차례로 입력했다. (W 위 y+1, D 오른쪽 x+1, 장애물 (2,2), 잘못된 키·이동은 Cannot move! 후 다시 입력, Q 종료) 'Cannot move!' 출력 횟수와 마지막에 출력되는 성공 이동 횟수는?", opts: ["1번, 4", "2번, 3", "2번, 4", "1번, 3"], ans: 1, exp: "d→(1,0), d→(2,0), w→(2,1)로 3번 성공. w는 (2,2) 장애물이라 실패, x는 잘못된 키라 실패 → Cannot move! 2번. q로 종료, 횟수 3." },
  { ch: "hw", q: "장애물 (2, 2)가 있는 4×4 칸에서 (0, 0) → (3, 3)으로 가는 데 필요한 최소 이동 횟수는? (한 번에 상하좌우 한 칸)", opts: ["4", "5", "6", "7"], ans: 2, exp: "x로 3칸, y로 3칸을 가야 하므로 최소 6번. 장애물을 피해 돌아가도 6번 경로가 있다(예: d d d w w w)." },
  { ch: "hw", q: Q("count++ 를 아래처럼 범위 검사보다 앞에 두면 어떤 문제가 생기는가?", "nx = x; ny = y;\nswitch (cmd) { /* … */ }\ncount++;\nif (nx < 0 || nx > 3 || ny < 0 || ny > 3 || (nx == 2 && ny == 2))\n{\n    printf(\"Cannot move!\\n\");\n    continue;\n}\nx = nx; y = ny;"), opts: ["실패한 이동까지 횟수에 포함된다", "횟수가 항상 0이다", "로봇이 움직이지 않는다", "문제없다"], ans: 0, exp: "continue보다 먼저 count++가 실행되므로 Cannot move!인 경우에도 횟수가 늘어난다. 이동이 확정된 뒤에 증가시켜야 한다." },
  { ch: "hw", q: "Q를 입력해 break로 반복을 빠져나온 경우, 다음 코드의 출력으로 옳은 것은? (현재 위치 (1, 0), 성공 1회)\n\nif (x == 3 && y == 3)\n    printf(\"목적지 (3, 3)에 도착했습니다!\\n\");\nprintf(\"성공한 이동 횟수: %d\\n\", count);", opts: ["목적지 메시지와 횟수 1", "성공한 이동 횟수: 1 만 출력", "아무것도 출력되지 않는다", "성공한 이동 횟수: 0"], ans: 1, exp: "도착하지 않았으므로 if는 거짓이고, 횟수 출력문만 실행된다." },
);
G.sa.push(
  { ch: "hw", q: "정수 num의 일의 자리 숫자를 구하는 식을 쓰시오.", a: ["num % 10", "num%10"], exp: "10으로 나눈 나머지가 일의 자리 숫자다." },
  { ch: "hw", q: "정수 num에서 일의 자리를 버리고 나머지 자리만 남기는 식을 쓰시오. (정수 나눗셈)", a: ["num / 10", "num/10"], exp: "정수끼리 나누면 몫만 남으므로 123 / 10 = 12." },
  { ch: "hw", q: "반복문 안에서 이번 반복의 나머지 문장을 건너뛰고 바로 다음 반복으로 넘어가게 하는 키워드는?", a: ["continue", "continue;"], exp: "로봇이 갈 수 없는 칸이면 continue로 위치 갱신과 count++를 건너뛴다." },
  { ch: "hw", q: "!(x == 3 && y == 3) 를 ! 없이 같은 뜻으로 쓰시오.", a: ["x != 3 || y != 3", "y != 3 || x != 3"], exp: "드모르간: !(A && B) = !A || !B." },
);
G.lb.push(
  { ch: "hw", t: "과제: 369 게임", d: "1부터 n까지 각 숫자의 자릿수에 3, 6, 9가 들어 있는 개수만큼 '짝'을, 없으면 숫자를 출력한다.\n입력 예: 30\n출력 예: " + OUT30,
    s: R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int n, i, num, digit, count;

    printf("369 게임을 진행할 최대 숫자를 입력하세요: ");
    scanf("%d", &n);

    for (i = 1; i <= n; i++)
    {
        ⟦num = i;⟧                     // 검사용 복사본을 만든다
        ⟦count = 0;⟧                   // 이 숫자의 3·6·9 개수를 새로 센다
        while (num > 0)
        {
            ⟦digit = num % 10;⟧        // 일의 자리 숫자를 꺼낸다
            ⟦if (digit == 3 || digit == 6 || digit == 9)¦if (digit != 0 && digit % 3 == 0)⟧   // 그 숫자가 3, 6, 9 중 하나인지 검사한다
                count++;
            ⟦num = num / 10;¦num /= 10;⟧   // 일의 자리를 버리고 다음 자리로 넘어간다
        }

        if (count == 0)
            printf("%d ", i);
        else
        {
            ⟦while (count > 0)¦while (count != 0)⟧   // 3·6·9의 개수만큼 반복한다
            {
                printf("짝");
                count--;
            }
            printf(" ");
        }
    }
    printf("\n");
    return 0;
}`,
    x: ["i를 직접 깎으면 for의 반복 변수가 망가지므로 복사본을 쓴다.", "숫자마다 0으로 다시 시작해야 이전 숫자의 개수가 섞이지 않는다.", "% 10은 일의 자리 숫자.", "세 값 중 하나만 같아도 되므로 ||.", "/ 10은 일의 자리를 버린다. 빠뜨리면 무한 루프.", "count를 하나씩 줄이며 그 횟수만큼 '짝'을 찍는다."],
    e: "자릿수 분리(% 10, / 10)와 개수만큼 반복 출력이 핵심이다." },
  { ch: "hw", t: "과제: Robot Escape", d: "4×4 칸에서 (0,0)에서 (3,3)까지 W/S/A/D로 이동한다. 범위 밖·장애물 (2,2)는 Cannot move! 후 다시 입력, Q는 종료, 마지막에 성공한 이동 횟수를 출력한다.\n입력 예: a s d d w w d w w\n출력: Cannot move! 세 번, 성공한 이동 횟수: 6",
    s: R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int x = 0, y = 0;
    int nx, ny;
    int count = 0;
    char cmd;

    ⟦while (!(x == 3 && y == 3))¦while (x != 3 || y != 3)⟧   // 목적지에 도착하지 않은 동안 반복한다
    {
        printf("현재 위치 (%d, %d) 명령 입력(W/A/S/D, Q 종료): ", x, y);
        ⟦scanf(" %c", &cmd);⟧          // 남은 Enter를 건너뛰고 명령 문자 하나를 읽는다
        ⟦if (cmd == 'Q' || cmd == 'q')¦if (cmd == 'q' || cmd == 'Q')⟧   // 종료 명령인지 검사한다
            break;

        nx = x;
        ny = y;
        switch (cmd)
        {
        ⟦case 'W': case 'w': ny++; break;¦case 'w': case 'W': ny++; break;⟧   // 위로: 이동할 y를 1 늘린다
        case 'S': case 's': ny--; break;
        case 'A': case 'a': nx--; break;
        case 'D': case 'd': nx++; break;
        default:
            printf("Cannot move!\n");
            ⟦continue;⟧                // 잘못된 키면 아래를 건너뛰고 다시 입력받는다
        }

        ⟦if (nx < 0 || nx > 3 || ny < 0 || ny > 3 || (nx == 2 && ny == 2))¦if (nx < 0 || ny < 0 || nx > 3 || ny > 3 || (nx == 2 && ny == 2))⟧   // 범위를 벗어나거나 장애물이면
        {
            printf("Cannot move!\n");
            continue;
        }

        x = nx;
        y = ny;
        ⟦count++;¦count = count + 1;¦count += 1;¦++count;⟧   // 이동에 성공했을 때만 횟수를 센다
    }

    if (x == 3 && y == 3)
        printf("목적지 (3, 3)에 도착했습니다!\n");
    printf("성공한 이동 횟수: %d\n", count);
    return 0;
}`,
    x: ["!(도착) = 도착하지 않은 동안. 드모르간으로 x != 3 || y != 3.", "%c 앞 공백이 남아 있는 \\n을 건너뛴다.", "대·소문자 둘 다 받으려면 ||.", "지도에서 (0,3)이 맨 위이므로 위는 y + 1.", "switch 안의 continue는 바깥 while의 다음 반복으로 간다. break면 횟수가 잘못 늘어난다.", "하나라도 어기면 못 가므로 ||, 장애물은 두 좌표가 동시에 2.", "continue로 실패를 걸러 낸 뒤에만 증가시킨다."],
    e: "'이동할 위치를 먼저 계산 → 검사 → 실패하면 continue → 통과하면 확정'이 이 문제의 정석 패턴이다." },
);
G.fc.push(
  { ch: "hw", t: "369 게임 (Assignment 02)", d: "양의 정수 n을 입력받아 1부터 n까지 369 게임 결과를 한 줄에 공백으로 구분해 출력하시오.\n각 숫자의 자릿수에 3, 6, 9가 하나 있으면 짝, 두 개면 짝짝(세 개면 짝짝짝), 없으면 숫자를 그대로 출력한다.\n입력 예: 30\n출력 예: " + OUT30,
    tests: [{ in: "30\n", out: OUT30 + "\n" }, { in: "36\n", out: OUT30 + " 짝 짝 짝짝 짝 짝 짝짝\n" }, { in: "9\n", out: "1 2 짝 4 5 짝 7 8 짝\n" }, { in: "15\n", out: "1 2 짝 4 5 짝 7 8 짝 10 11 12 짝 14 15\n" }],
    sol: C369, h: ["숫자를 num에 복사한 뒤 num % 10으로 일의 자리, num / 10으로 다음 자리.", "3·6·9 개수를 센 뒤 그 개수만큼 '짝'을 찍는다."], e: "바깥 for(1~n) + 안쪽 while(자릿수 분리) 이중 반복 구조." },
  { ch: "hw", t: "Robot Escape (도전문제)", d: "로봇이 4×4 칸의 (0, 0)에서 출발해 (3, 3)에 도착할 때까지 명령을 입력받는다.\nW: 위(y+1), S: 아래(y-1), A: 왼쪽(x-1), D: 오른쪽(x+1), Q: 종료\n0 ≤ x, y ≤ 3 범위 밖이나 장애물 (2, 2)로 가려 하거나 다른 키를 누르면 \"Cannot move!\"를 출력하고 다시 입력받는다.\n(3, 3)에 도착하거나 Q를 입력하면 반복을 끝내고 \"성공한 이동 횟수: N\"을 출력한다. (while, continue 사용 · 배열 금지)\n명령은 소문자로 입력된다.",
    tests: [{ in: "a\ns\nd\nd\nw\nw\nd\nw\nw\n", out: "Cannot move!\nCannot move!\nCannot move!\n성공한 이동 횟수: 6\n" }, { in: "w\nw\nw\nw\nd\nd\nd\n", out: "Cannot move!\n성공한 이동 횟수: 6\n" }, { in: "d\nd\nw\nw\nx\nq\n", out: "Cannot move!\nCannot move!\n성공한 이동 횟수: 3\n" }, { in: "q\n", out: "성공한 이동 횟수: 0\n" }],
    sol: CROBOT, h: ["이동할 위치 nx, ny를 먼저 계산하고 검사한다.", "갈 수 없으면 Cannot move! 출력 후 continue."], e: "검사 → 실패 시 continue → 통과 시 위치 확정과 count++ 순서가 핵심이다." },
  { ch: "hw", t: "369 박수 횟수 세기", d: "양의 정수 n을 입력받아 1부터 n까지 369 게임을 할 때 박수(짝)를 모두 몇 번 치는지 출력하시오. (33처럼 3·6·9가 두 개면 박수 2번)\n입력 예: 30\n출력 예: 박수 횟수: 10",
    tests: [{ in: "30\n", out: "박수 횟수: 10\n" }, { in: "100\n", out: "박수 횟수: 60\n" }, { in: "9\n", out: "박수 횟수: 3\n" }, { in: "333\n", out: "박수 횟수: 228\n" }],
    sol: R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int n, i, num, total = 0;

    scanf("%d", &n);
    for (i = 1; i <= n; i++)
    {
        num = i;
        while (num > 0)
        {
            if (num % 10 == 3 || num % 10 == 6 || num % 10 == 9)
                total++;
            num /= 10;
        }
    }
    printf("박수 횟수: %d\n", total);
    return 0;
}`, h: ["369 게임 코드에서 출력 대신 개수를 누적하면 된다.", "total은 반복 전에 한 번만 0으로 초기화한다."], e: "count를 숫자마다 초기화하는 것과 달리 total은 전체 합이라 바깥에서 한 번만 초기화한다." },
);
})();
