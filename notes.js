/* 프로그래밍기초(C언어) 강의 정리 데이터
   block types: p, key, ex, warn, code, out, table
   code: { t:'code', cap?, s:R`...`, note?:'<html 설명>' }  (s는 String.raw)
*/
const R = String.raw;
window.NOTES = [

/* =========================== 2장 =========================== */
{ id:"ch2", no:2, title:"프로그램 작성 과정", color:1,
  summary:"설계부터 유지보수까지, 소스가 실행 파일이 되는 전 과정과 첫 C 프로그램",
  sections:[
  { id:"c2-1", title:"프로그램 개발 5단계", en:"development process",
    blocks:[
    {t:"p", h:"하나의 프로그램이 세상에 나오기까지는 다음 다섯 단계를 거친다. 코딩은 그중 세 번째 단계(구현)일 뿐이고, 그 앞뒤에 더 중요한 일들이 있다."},
    {t:"table", h:`<table><tr><th>단계</th><th>하는 일</th></tr>
      <tr><td><b>① 요구사항 분석</b></td><td>무엇을 만들 것인가를 결정한다.</td></tr>
      <tr><td><b>② 설계</b></td><td>문제를 푸는 <b>알고리즘</b>을 만든다. 순서도·의사코드를 도구로 쓴다.</td></tr>
      <tr><td><b>③ 구현</b></td><td>설계한 알고리즘을 프로그래밍 언어로 옮긴다(소스 코드 작성).</td></tr>
      <tr><td><b>④ 테스트</b></td><td>여러 경우에 대해 실행해 보며 오류를 찾는다.</td></tr>
      <tr><td><b>⑤ 유지보수</b></td><td>배포 후 남은 버그를 고치고 사용자의 추가 요구를 반영한다.</td></tr></table>`},
    {t:"key", h:"알고리즘은 <b>프로그래밍 언어와 무관</b>하다. '원하는 결과를 얻기 위해 밟아야 하는 단계'에만 집중하는 것이 알고리즘이고, 그것을 C로 쓰든 파이썬으로 쓰든 상관없다."},
    {t:"ex", h:"라면 끓이기 알고리즘: ① 물 550mL를 끓인다 → ② 면과 스프를 넣는다 → ③ 4분 30초 더 끓인다. 이 '순서'가 알고리즘이고, 가스불로 하든 인덕션으로 하든(=언어가 달라도) 순서는 같다."}
  ]},
  { id:"c2-2", title:"소스 → 오브젝트 → 실행 파일", en:"compile & link",
    blocks:[
    {t:"p", h:"사람이 쓴 코드(소스)는 컴퓨터가 바로 실행하지 못한다. 아래 두 번의 변환을 거쳐야 비로소 실행 파일이 된다."},
    {t:"table", h:`<table><tr><th>파일</th><th>예</th><th>설명</th></tr>
      <tr><td>소스 파일</td><td><code>test.c</code></td><td>사람이 텍스트 에디터로 작성한 C 코드</td></tr>
      <tr><td>오브젝트 파일</td><td><code>test.obj</code></td><td><b>컴파일</b>로 생성된, 기계어로 번역된 파일</td></tr>
      <tr><td>실행 파일</td><td><code>test.exe</code></td><td><b>링크</b>로 라이브러리와 연결되어 완성된 파일</td></tr></table>`},
    {t:"p", h:"<b>컴파일(compile)</b>: 소스를 오브젝트 파일로 번역. 번역을 담당하는 프로그램이 <b>컴파일러(compiler)</b>다.<br><b>링크(link)</b>: 오브젝트 파일을 라이브러리와 연결해 실행 파일을 만든다. 담당 프로그램은 <b>링커(linker)</b>."},
    {t:"key", h:"<b>라이브러리(library)</b>: 프로그래머들이 자주 쓰는 기능(입출력, 파일 처리, 수학 함수 등)을 미리 만들어 놓은 것. <code>printf</code>도 라이브러리가 제공하는 기능이라, 링크 단계에서 연결되어야 실제로 동작한다."},
    {t:"ex", h:"<code>printf(\"Hello\")</code> 한 줄을 써도, printf의 '진짜 코드'는 내가 쓰지 않았다. 그 코드는 표준 라이브러리에 있고, 링커가 내 오브젝트 파일에 그 부분을 붙여 줘야 실행 파일이 완성된다."}
  ]},
  { id:"c2-3", title:"오류의 세 종류와 디버깅", en:"errors & debugging",
    blocks:[
    {t:"table", h:`<table><tr><th>오류</th><th>발생 시점</th><th>예</th></tr>
      <tr><td><b>컴파일 오류</b><br>(문법 오류)</td><td>컴파일할 때</td><td>세미콜론 빠뜨림, 철자 오타 — 영어로 치면 <i>He go to school</i></td></tr>
      <tr><td><b>실행 시간 오류</b><br>(run time error)</td><td>실행 중</td><td>0으로 나누기, 잘못된 메모리 주소 접근</td></tr>
      <tr><td><b>논리 오류</b><br>(logical error)</td><td>실행은 되지만 결과가 틀림</td><td>문법은 맞지만 순서/계산이 잘못됨</td></tr></table>`},
    {t:"ex", h:"논리 오류 예(빵 굽기): ① 그릇1·그릇2 준비 → ② 그릇1에 재료를 넣고 섞기 → ③ <b>그릇2</b>를 오븐에 넣기. 문법(각 문장)은 멀쩡하지만 '재료가 든 그릇1'이 아니라 빈 그릇2를 구웠으니 결과가 틀렸다 — 이것이 논리 오류다."},
    {t:"p", h:"<b>에러(error)</b>는 심각한 오류라 실행 파일이 만들어지지 않고, <b>경고(warning)</b>는 경미해서 실행은 되지만 주의가 필요하다."},
    {t:"p", h:"<b>디버깅(debugging)</b>은 이런 오류(특히 논리 오류)를 찾아 고치는 작업이다. 1945년 마크 II 컴퓨터가 릴레이에 낀 나방(bug) 때문에 고장 났고, 그레이스 호퍼가 그 나방을 기록에 붙이며 '버그를 제거(debugging)했다'고 보고한 데서 유래했다."},
    {t:"warn", h:"<b>유지보수가 필요한 이유</b> ① 디버깅 후에도 버그가 남아 있을 수 있고 ② 배포 뒤 사용자의 요구가 추가되기 때문. 유지보수 비용은 전체 비용의 50% 이상을 차지한다."}
  ]},
  { id:"c2-4", title:"통합 개발 환경(IDE)", en:"IDE",
    blocks:[
    {t:"key", h:"<b>IDE</b>(Integrated Development Environment) = 에디터 + 컴파일러 + 디버거를 하나로 묶은 프로그램. 예: 비주얼 스튜디오(MS), 이클립스, Dev-C++, VS Code."},
    {t:"p", h:"용어 정리 — <b>솔루션(solution)</b>: 문제 해결에 필요한 프로젝트들을 담는 컨테이너. <b>프로젝트(project)</b>: 하나의 실행 파일을 만드는 데 필요한 항목들(소스 파일 등)을 담는 컨테이너."},
    {t:"ex", h:"VS Code에서 C를 쓰려면 한 번만: ① winlibs.com에서 MinGW-w64(GCC) 설치 → ② <code>C:\\mingw64\\bin</code>을 환경변수 Path에 추가 → ③ 터미널에서 <code>gcc --version</code>으로 확인 → ④ VS Code에 'C/C++' 확장 설치."}
  ]},
  { id:"c2-5", title:"첫 번째 프로그램 — Hello World", en:"first program",
    blocks:[
    {t:"p", h:"가장 유명한 첫 프로그램이다. 아래 전체 코드를 한 줄씩 뜯어 본다."},
    {t:"code", cap:"hello.c", s:R`#include <stdio.h>

int main(void)
{
    printf("Hello World!");
    return 0;
}`,
     note:`한 줄씩:
<ul>
<li><b>#include &lt;stdio.h&gt;</b> — printf 같은 표준 입출력 기능의 '설명서(헤더 파일)'를 가져온다. <code>#</code>으로 시작하는 전처리기 지시문이다.</li>
<li><b>int main(void)</b> — 프로그램이 시작되는 함수. 모든 C 프로그램에 <u>반드시 하나</u> 있어야 한다. <code>void</code>는 '입력(매개변수) 없음', <code>int</code>는 '정수를 돌려줌'을 뜻한다.</li>
<li><b>{ }</b> — 함수의 몸체. 이 중괄호 안의 문장들이 위에서 아래로 <b>순차적으로</b> 실행된다.</li>
<li><b>printf("Hello World!");</b> — 화면에 글자를 출력한다. 문장 끝에는 <u>반드시 세미콜론 ;</u> 이 있어야 한다.</li>
<li><b>return 0;</b> — main을 끝내며 운영체제에 0(정상 종료)을 돌려준다.</li>
</ul>`},
    {t:"out", h:"Hello World!"},
    {t:"key", h:"핵심 규칙 세 가지 — ① C 프로그램엔 <code>main()</code> 함수가 꼭 있다 ② 모든 문장은 <code>;</code> 로 끝난다 ③ 문장들은 중괄호 안에서 위→아래 순서로 실행된다."}
  ]},
  { id:"c2-6", title:"줄바꿈 문자 \\n", en:"newline",
    blocks:[
    {t:"p", h:"여러 줄을 출력하려면 어떻게 할까? 문장이 순서대로 실행된다는 점을 이용해 <code>printf</code>를 여러 번 부르면 된다. 그런데 <code>\\n</code>이 없으면 줄이 바뀌지 않는다."},
    {t:"code", cap:"줄바꿈이 없으면 (문제)", s:R`#include <stdio.h>

int main(void)
{
    printf("Hello World!");
    printf("Kim ChulSoo");
    return 0;
}`,
     note:"두 printf가 순차 실행되지만, 줄바꿈 신호가 없어서 한 줄에 이어 붙는다."},
    {t:"out", h:"Hello World!Kim ChulSoo"},
    {t:"p", h:"<b>\\n</b>(줄바꿈 문자)은 화면의 커서를 다음 줄 맨 앞으로 옮긴다. 각 출력 끝에 붙여 준다."},
    {t:"code", cap:"줄바꿈 추가 (해결)", s:R`#include <stdio.h>

int main(void)
{
    printf("Hello World!\n");
    printf("Kim ChulSoo \n");
    return 0;
}`,
     note:"이제 각 printf가 출력 뒤 줄을 바꾸므로 두 줄로 나뉜다. <code>\\n</code> 두 개를 연달아 쓰면 빈 줄 하나가 더 생긴다."},
    {t:"out", h:"Hello World!\nKim ChulSoo"},
    {t:"ex", h:"구구단 3단 출력: <code>printf(\"3 X 1 = 3\\n\");</code> 처럼 줄마다 <code>\\n</code>을 붙여 세 번 호출하면 세 줄로 깔끔히 나온다."}
  ]},
  { id:"c2-7", title:"Lab — 간단한 계산기", en:"arithmetic with %d",
    blocks:[
    {t:"p", h:"<code>printf</code> 안에 <code>%d</code>를 쓰면 그 자리에 뒤에 적은 '정수 계산 결과'가 끼워진다. 계산은 printf가 출력하기 전에 먼저 이뤄진다."},
    {t:"code", cap:"사칙연산", s:R`#include <stdio.h>

int main(void)
{
    printf("2+5=%d\n", 2 + 3);
    printf("2-3=%d\n", 2 - 3);
    printf("2*3=%d\n", 2 * 3);
    printf("2/3=%d\n", 2 / 3);
    return 0;
}`,
     note:`<code>%d</code>는 '여기에 정수를 10진수로 출력하라'는 <b>형식 지정자</b>다. 쉼표 뒤의 식이 먼저 계산되어 <code>%d</code> 자리에 들어간다.
<br><b>주의</b>: <code>2 / 3</code>은 정수끼리의 나눗셈이라 소수점이 버려져 <b>0</b>이 된다(0.666… → 0).`},
    {t:"out", h:"2+5=5\n2-3=-1\n2*3=6\n2/3=0"}
  ]},
  { id:"c2-8", title:"논리 오류와 미니 프로젝트", en:"logical error & debugging lab",
    blocks:[
    {t:"p", h:"아래는 \"Hey!\"와 \"Good Morning\"을 두 줄로 내보내려던 프로그램이다. 문법은 맞지만 결과가 의도와 다르다 — 전형적인 <b>논리 오류</b>."},
    {t:"code", cap:"논리 오류가 있는 코드", s:R`#include <stdio.h>

int main(void)
{
    printf("Hey!");
    printf("Good Morning");
    return 0;
}`,
     note:"줄바꿈을 안 넣어서 두 글자가 붙어 버렸다. 컴파일/실행은 되지만 '원하던 모습'이 아니다."},
    {t:"out", h:"Hey!Good Morning"},
    {t:"p", h:"각 문자열 끝에 <code>\\n</code>을 넣으면 논리 오류가 고쳐진다."},
    {t:"p", h:"<b>미니 프로젝트</b> — 아래처럼 오류가 가득한 코드를 고쳐 보자. 틀린 곳: <code>Main</code>→<code>main</code>(C는 대소문자 구별), 몸체 괄호 <code>( )</code>→<code>{ }</code>, 문자열 따옴표 누락, <code>print</code>→<code>printf</code>, 세미콜론 누락."},
    {t:"code", cap:"고친 코드", s:R`#include <stdio.h>

int main(void)
{
    printf("안녕하세요?\n");
    printf("이번 코드에는 많은 오류가 있다네요\n");
    printf("제가 다 고쳐보겠습니다.\n");
    return 0;
}`,
     note:"C는 <b>대소문자를 구별</b>하므로 <code>Main</code>은 <code>main</code>이 아니다. 함수 몸체는 소괄호가 아니라 <b>중괄호</b> <code>{ }</code>로 감싼다."}
  ]},
  { id:"c2-9", title:"Lab — 문자의 아스키 코드", en:"ASCII",
    blocks:[
    {t:"p", h:"문자 하나를 변수에 담고, 그 문자의 아스키 코드 값을 함께 출력한다. 문자는 내부적으로 숫자(아스키 코드)로 저장된다는 사실을 보여 준다."},
    {t:"code", cap:"문자와 아스키 값 출력", s:R`#include <stdio.h>

int main(void)
{
    char id = 'C';
    printf("%c -> %d\n", id, id);
    return 0;
}`,
     note:"같은 변수 <code>id</code>를 <code>%c</code>(문자로)와 <code>%d</code>(숫자로) 두 가지 방식으로 출력한다. 문자 <code>'C'</code>는 아스키 코드로 67이다."},
    {t:"out", h:"C -> 67"}
  ]}
]},

/* =========================== 3장 =========================== */
{ id:"ch3", no:3, title:"C프로그램 구성요소", color:2,
  summary:"주석·변수·함수·입출력 — 프로그램을 이루는 기본 부품들",
  sections:[
  { id:"c3-1", title:"프로그램의 세 단계와 주석", en:"input·process·output, comment",
    blocks:[
    {t:"p", h:"일반적인 프로그램은 <b>입력 → 처리 → 출력</b>의 흐름을 가진다. 데이터를 받고, 가공하고, 결과를 화면에 내보낸다."},
    {t:"p", h:"<b>주석(comment)</b>은 코드를 설명하는 글이다. 프로그램 동작에는 아무 영향을 주지 않지만, 나중에 보는 사람(심지어 만든 본인)이 내용을 빨리 파악하게 돕는다."},
    {t:"table", h:`<table><tr><th>방법</th><th>형태</th></tr>
      <tr><td>한 줄 주석</td><td><code>/* 한 줄로 된 주석 */</code></td></tr>
      <tr><td>여러 줄 주석</td><td><code>/*</code> … 여러 줄 … <code>*/</code></td></tr>
      <tr><td>줄 끝 주석</td><td><code>// 여기서부터 줄 끝까지</code></td></tr></table>`},
    {t:"key", h:"좋은 주석은 코드를 그대로 반복하지 않고, 코드를 작성한 <b>의도</b>를 밝힌다. (예: <code>// 두 정수의 합을 저장</code>)"},
    {t:"code", cap:"주석과 변수가 있는 덧셈 프로그램", s:R`/* 두 개의 숫자의 합을 계산하는 프로그램 */
#include <stdio.h>

int main(void)
{
    int x;    // 첫 번째 정수를 저장할 변수
    int y;    // 두 번째 정수를 저장할 변수
    int sum;  // 두 정수의 합을 저장하는 변수
    x = 100;
    y = 200;
    sum = x + y;
    printf("두수의 합 : %d", sum);
    return 0;
}`,
     note:"변수 셋을 선언하고(<code>int x;</code> …), 값을 대입한 뒤(<code>x = 100;</code>), 합을 구해(<code>sum = x + y;</code>) 출력한다. <code>%d</code> 자리에 <code>sum</code>의 값 300이 들어간다."},
    {t:"out", h:"두수의 합 : 300"},
    {t:"warn", h:"들여쓰기(indentation)는 같은 수준의 문장들을 몇 칸 안으로 들여써서 구조를 눈에 보이게 하는 것이다. 주석과 들여쓰기가 없으면 똑같이 동작하는 코드라도 읽기가 매우 어렵다."}
  ]},
  { id:"c3-2", title:"전처리기와 함수", en:"preprocessor & function",
    blocks:[
    {t:"p", h:"<b>#include &lt;stdio.h&gt;</b>는 '외부 파일을 포함시키라'는 <b>전처리기(preprocessor)</b> 지시문이다. <code>#</code>으로 시작한다. <code>stdio.h</code>에는 표준 입출력 라이브러리 함수(printf, scanf 등)의 정의가 들어 있어, 그 함수들을 쓰려면 반드시 포함해야 한다."},
    {t:"key", h:"<b>함수(function)</b> = 특정 기능을 수행하는 처리 단계(문장)들을 중괄호로 묶어 이름 붙인 것. 프로그램을 구성하는 기본 부품이다. <b>프로그램 = 함수의 집합</b>."},
    {t:"p", h:"함수 안에는 입력을 받아 처리하는 문장들이 중괄호 안에 나열되고, 위에서 아래로 순차 실행된 뒤 결과를 출력/반환한다. <b>return</b>은 함수를 끝내면서 값을 반환하는 키워드다 — <code>return 0;</code>은 main을 끝내며 0을 돌려준다."},
    {t:"ex", h:"수학의 함수 y = x + 1 처럼, 입력 x를 받아 출력 y를 내는 상자로 생각하면 된다. C의 함수도 '입력 → 처리 → 반환'을 하는 상자다."}
  ]},
  { id:"c3-3", title:"변수와 자료형", en:"variable & data type",
    blocks:[
    {t:"p", h:"<b>변수(variable)</b>는 프로그램이 쓰는 데이터를 잠시 저장하는 <b>메모리 공간</b>이다. 데이터를 담는 '상자'로 생각하면 된다."},
    {t:"p", h:"<b>자료형(data type)</b>은 그 상자에 어떤 종류의 데이터를 담을지 지정한다. 정수형, 부동소수점형(실수형), 문자형이 있다. <code>int x;</code> 라고 쓰면 '정수(int)를 담는 상자 x를 만들어라'는 뜻이다."},
    {t:"p", h:"<b>변수 선언</b>은 컴파일러에게 '어떤 타입의 변수를 쓸 것'이라고 미리 알리는 것이다. 한 줄에 여러 개도 가능하다."},
    {t:"code", cap:"변수 선언과 초기화", s:R`int x;              // 정수 변수 하나
int x, y, sum;      // 한 줄에 여러 개 선언
int a = 10;         // 선언과 동시에 초기값 주기
int width = 100, height = 200;  // 같은 타입 여러 개 초기화`,
     note:"선언만 하면 메모리에 공간이 생기고 이름이 붙는다. <code>= 값</code>으로 처음 값을 넣는 것을 <b>초기화</b>라 한다."}
  ]},
  { id:"c3-4", title:"식별자 규칙과 키워드", en:"identifier & keyword",
    blocks:[
    {t:"p", h:"<b>식별자(identifier)</b>는 변수 등에 붙이는 이름이다. 마음대로 지을 수 있지만 규칙이 있다."},
    {t:"table", h:`<table><tr><th>규칙</th><th>예</th></tr>
      <tr><td>영문자·숫자·밑줄(_)만 사용</td><td class="y">sum, _count, King3</td></tr>
      <tr><td>중간에 공백 불가</td><td class="n">my name ✗</td></tr>
      <tr><td>첫 글자는 영문자 또는 _ (숫자로 시작 불가)</td><td class="n">2nd_base ✗</td></tr>
      <tr><td># 같은 기호 불가</td><td class="n">money# ✗</td></tr>
      <tr><td>키워드는 사용 불가</td><td class="n">double ✗</td></tr></table>`},
    {t:"key", h:"C는 <b>대소문자를 구별</b>한다. <code>index</code>, <code>Index</code>, <code>INDEX</code>는 모두 서로 다른 변수다."},
    {t:"p", h:"<b>키워드(keyword, 예약어)</b>: C가 고유한 의미로 쓰려고 미리 잡아 둔 단어. 변수 이름으로 쓸 수 없다. 예: <code>int, double, char, return, if, for, while, void, const, switch, struct</code> 등."},
    {t:"ex", h:"좋은 변수 이름은 역할을 설명한다. <code>a, b, c</code>보다 <code>number, average, sum</code>이 낫다. 여러 단어는 <code>bank_account</code>(밑줄) 또는 <code>BankAccount</code>(첫 글자 대문자)로 잇는다."}
  ]},
  { id:"c3-5", title:"수식과 대입 연산", en:"expression & assignment",
    blocks:[
    {t:"p", h:"<b>수식(expression)</b>은 피연산자와 연산자로 이루어진 식이며 결과값을 가진다. <b>대입 연산(=)</b>은 오른쪽 값을 왼쪽 변수에 저장하는 것이다(배정·할당 연산이라고도 한다)."},
    {t:"code", cap:"수식 계산 예", s:R`int x, y;
x = 3;
y = x * x - 5 * x + 6;   // x가 3일 때 x^2 - 5x + 6
printf("%d\n", y);        // 9 - 15 + 6 = 0`,
     note:"오른쪽 수식을 먼저 계산한 뒤 그 결과를 왼쪽 변수 <code>y</code>에 넣는다. <code>sum = x + y;</code> 도 같은 원리다."}
  ]},
  { id:"c3-6", title:"printf — 출력과 형식 지정자", en:"printf",
    blocks:[
    {t:"p", h:"<b>printf()</b>는 모니터에 출력하는 표준 출력 함수다. <b>형식 지정자</b>로 값을 어떤 형태로 출력할지 지정한다."},
    {t:"table", h:`<table><tr><th>지정자</th><th>용도</th></tr>
      <tr><td><code>%d</code></td><td>정수(10진수)</td></tr>
      <tr><td><code>%f</code></td><td>실수(float/double)</td></tr>
      <tr><td><code>%c</code></td><td>문자 하나</td></tr>
      <tr><td><code>%s</code></td><td>문자열</td></tr></table>`},
    {t:"p", h:"아래는 20과 10으로 사칙연산을 모두 수행하는 완성 프로그램이다(원본에서 두 슬라이드로 나뉘어 있던 코드를 끊기지 않게 하나로 합쳤다)."},
    {t:"code", cap:"사칙연산 전체 코드", s:R`// 정수 간의 가감승제를 계산하는 프로그램
#include <stdio.h>

int main(void)
{
    int x;                       // 첫 번째 정수
    int y;                       // 두 번째 정수
    int sum, diff, mul, div;     // 연산 결과들

    x = 20;
    y = 10;

    sum  = x + y;
    diff = x - y;
    mul  = x * y;
    div  = x / y;

    printf("두수의 합: %d\n", sum);
    printf("두수의 차: %d\n", diff);
    printf("두수의 곱: %d\n", mul);
    printf("두수의 몫: %d\n", div);

    return 0;
}`,
     note:"변수 네 개에 각 연산 결과를 담은 뒤 하나씩 출력한다. 정수 20/10 = 2 라서 몫도 정수 2로 나온다."},
    {t:"out", h:"두수의 합: 30\n두수의 차: 10\n두수의 곱: 200\n두수의 몫: 2"}
  ]},
  { id:"c3-7", title:"scanf — 키보드 입력", en:"scanf",
    blocks:[
    {t:"p", h:"<b>scanf()</b>는 키보드로 값을 받아 변수에 저장한다. printf와 달리 <b>변수의 주소</b>가 필요하므로 변수 이름 앞에 <b>&</b>(주소 연산자)를 붙인다."},
    {t:"code", cap:"입력 기본형", s:R`int x;
scanf("%d", &x);   // 정수를 받아 x에 저장`,
     note:"<code>&x</code>는 'x가 저장된 메모리 주소'다. scanf는 그 주소로 찾아가 값을 써넣기 때문에 <code>&</code>가 꼭 필요하다. (<code>&</code>를 빠뜨리는 것이 흔한 실수다.)"},
    {t:"table", h:`<table><tr><th>타입</th><th>scanf 지정자</th></tr>
      <tr><td>int</td><td><code>%d</code></td></tr>
      <tr><td>float</td><td><code>%f</code></td></tr>
      <tr><td>double</td><td><code>%lf</code></td></tr></table>`},
    {t:"warn", h:"비주얼 스튜디오에서 scanf가 '안전하지 않다'며 컴파일 오류가 나면, 소스 맨 윗줄에 <code>#define _CRT_SECURE_NO_WARNINGS</code> 를 넣어 준다. (gcc/VS Code에서는 보통 필요 없다.)"},
    {t:"p", h:"아래는 두 정수를 입력받아 더하는 완성 프로그램이다."},
    {t:"code", cap:"입력받아 더하기", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int x;
    int y;
    int sum;

    printf("첫번째 숫자를 입력하시오:");
    scanf("%d", &x);

    printf("두번째 숫자를 입력하시오:");
    scanf("%d", &y);

    sum = x + y;
    printf("두수의 합: %d", sum);

    return 0;
}`,
     note:"안내 메시지를 printf로 보여 주고, scanf로 x·y를 받은 뒤 합을 출력한다. 입력과 출력이 번갈아 일어나는 전형적인 구조다."},
    {t:"out", h:"첫번째 숫자를 입력하시오:10\n두번째 숫자를 입력하시오:20\n두수의 합: 30"}
  ]},
  { id:"c3-8", title:"실수 입력 — 원의 면적과 환율", en:"float/double input",
    blocks:[
    {t:"p", h:"실수를 다룰 땐 <code>float</code>/<code>double</code>을 쓰고, scanf 지정자도 <code>%f</code>(float)·<code>%lf</code>(double)로 맞춰야 한다. 틀리면 엉뚱한 값이 들어간다."},
    {t:"code", cap:"원의 면적", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    float radius;   // 반지름
    float area;     // 면적

    printf("반지름을 입력하시오 : ");
    scanf("%f", &radius);
    area = 3.14 * radius * radius;   // πr^2
    printf("원의 면적 : %f\n", area);

    return 0;
}`,
     note:"C에는 거듭제곱 연산자가 없어 <code>radius * radius</code>로 제곱한다. 입력 10.0 → 3.14 × 100 = 314.0."},
    {t:"out", h:"반지름을 입력하시오 : 10.0\n원의 면적 : 314.000000"},
    {t:"code", cap:"환율 계산 (double)", s:R`/* 환율을 계산하는 프로그램 */
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    double rate;   // 원/달러 환율
    double usd;    // 달러화
    int krw;       // 원화(정수)

    printf("환율을 입력하시오: ");
    scanf("%lf", &rate);

    printf("원화 금액을 입력하시오: ");
    scanf("%d", &krw);

    usd = krw / rate;   // 원화를 환율로 나눠 달러로
    printf("원화 %d원은 %lf달러입니다.\n", krw, usd);

    return 0;
}`,
     note:"환율·달러는 소수가 필요하니 <code>double</code>, 원화는 정수라 <code>int</code>로 선언했다. double 입력엔 <code>%lf</code>를 써야 한다. 한 printf에 <code>%d</code>와 <code>%lf</code> 두 값을 순서대로 넘길 수 있다."},
    {t:"out", h:"환율을 입력하시오: 1060\n원화 금액을 입력하시오: 10000000\n원화 10000000원은 9433.962264달러입니다."}
  ]}
]},

/* =========================== 4장 =========================== */
{ id:"ch4", no:4, title:"변수와 자료형", color:3,
  summary:"정수형·실수형·문자형, 기호 상수, 오버플로우/언더플로우",
  sections:[
  { id:"c4-1", title:"변수와 상수", en:"variable & constant",
    blocks:[
    {t:"p", h:"프로그램은 값을 저장하려고 변수를 쓴다. 변수는 <b>메인 메모리(RAM)</b>에 만들어지고, 우리는 변수 이름으로 그 메모리 공간을 사용한다."},
    {t:"table", h:`<table><tr><th>구분</th><th>뜻</th><th>예</th></tr>
      <tr><td><b>변수</b>(variable)</td><td>저장된 값을 <b>바꿀 수 있는</b> 공간</td><td><code>radius</code>, <code>area</code></td></tr>
      <tr><td><b>상수</b>(constant)</td><td>값을 <b>바꿀 수 없는</b> 고정 값</td><td><code>3.14</code>, <code>100</code>, <code>'A'</code>, <code>"Hello"</code></td></tr></table>`},
    {t:"ex", h:"<code>area = 3.141592 * radius * radius;</code> 에서 <code>radius</code>·<code>area</code>는 변수(값이 바뀜), <code>3.141592</code>는 상수(항상 그 값)다."}
  ]},
  { id:"c4-2", title:"자료형과 크기", en:"data types & size",
    blocks:[
    {t:"p", h:"<b>자료형(data type)</b>은 데이터의 종류다. 종류마다 메모리에서 차지하는 크기가 다르다."},
    {t:"table", h:`<table><tr><th>분류</th><th>자료형</th><th>크기(byte)</th></tr>
      <tr><td rowspan="3">정수형</td><td>short</td><td>2</td></tr>
      <tr><td>int</td><td>4</td></tr>
      <tr><td>long / long long</td><td>4 / 8</td></tr>
      <tr><td rowspan="2">실수형</td><td>float</td><td>4</td></tr>
      <tr><td>double</td><td>8</td></tr>
      <tr><td>문자형</td><td>char</td><td>1</td></tr></table>`},
    {t:"code", cap:"sizeof로 크기 확인", s:R`#include <stdio.h>

int main(void)
{
    printf("char형의 크기: %d\n", sizeof(char));
    printf("int형의 크기: %d\n", sizeof(int));
    printf("short형의 크기: %d\n", sizeof(short));
    printf("long형의 크기: %d\n", sizeof(long));
    printf("float형의 크기: %d\n", sizeof(float));
    printf("double형의 크기: %d\n", sizeof(double));
    return 0;
}`,
     note:"<code>sizeof(타입)</code>은 그 타입이 메모리에서 차지하는 바이트 수를 알려 준다. 변수에도 <code>sizeof(x)</code>처럼 쓸 수 있다."},
    {t:"out", h:"char형의 크기: 1\nint형의 크기: 4\nshort형의 크기: 2\nlong형의 크기: 4\nfloat형의 크기: 4\ndouble형의 크기: 8"},
    {t:"ex", h:"상자에 물건을 담듯, 담을 데이터 크기에 맞는 자료형을 고른다. 작은 수에 큰 타입을 쓰면 메모리 낭비, 큰 수에 작은 타입을 쓰면 넘침(오버플로우)이 생긴다."}
  ]},
  { id:"c4-3", title:"정수형 범위와 signed/unsigned", en:"integer range",
    blocks:[
    {t:"p", h:"<code>int</code>는 약 −21억 ~ +21억, <code>short</code>는 약 −3만2천 ~ +3만2천을 표현한다. 범위를 넘는 값을 넣으면 안 된다."},
    {t:"table", h:`<table><tr><th>수식자</th><th>의미</th></tr>
      <tr><td><b>signed</b></td><td>부호 있음(음수 가능). 보통 생략한다.</td></tr>
      <tr><td><b>unsigned</b></td><td>부호 없음(0과 양수만). 대신 양의 범위가 두 배로 넓어진다.</td></tr></table>`},
    {t:"code", cap:"unsigned 선언", s:R`unsigned int speed;       // 부호 없는 int
unsigned short players;   // 부호 없는 short
unsigned long seconds;    // 부호 없는 long`}
  ]},
  { id:"c4-4", title:"오버플로우", en:"overflow",
    blocks:[
    {t:"p", h:"<b>오버플로우(overflow)</b>: 변수가 표현할 수 있는 범위를 넘는 값을 저장하려 할 때 생긴다. 자동차 주행거리계가 최대치를 지나 0으로 돌아가는 것과 비슷하다."},
    {t:"code", cap:"오버플로우 실험", s:R`#include <stdio.h>
#include <limits.h>

int main(void)
{
    short s_money = SHRT_MAX;            // 32767 (short 최대값)
    unsigned short u_money = USHRT_MAX;  // 65535

    s_money = s_money + 1;   // 오버플로우!
    printf("s_money = %d\n", s_money);

    u_money = u_money + 1;   // 오버플로우!
    printf("u_money = %d\n", u_money);
    return 0;
}`,
     note:"<code>limits.h</code>의 <code>SHRT_MAX</code>(32767)에 1을 더하면 범위를 넘어 음수 쪽 최소값 <b>−32768</b>로 '한 바퀴' 돈다. unsigned는 최대값 65535에 1을 더하면 <b>0</b>으로 돈다."},
    {t:"out", h:"s_money = -32768\nu_money = 0"}
  ]},
  { id:"c4-5", title:"정수 상수와 진법", en:"radix",
    blocks:[
    {t:"p", h:"숫자를 그냥 적으면 10진수 <code>int</code>다. 앞에 접두어를 붙이면 진법이 달라진다 — <b>0</b>으로 시작하면 8진수, <b>0x</b>로 시작하면 16진수."},
    {t:"code", cap:"8진·16진 상수", s:R`#include <stdio.h>

int main(void)
{
    int x = 10;    // 10진수 → 10
    int y = 010;   // 8진수  → 8
    int z = 0x10;  // 16진수 → 16

    printf("x = %d\n", x);
    printf("y = %d\n", y);
    printf("z = %d\n", z);
    return 0;
}`,
     note:"<code>010</code>은 8진수 10, 즉 10진수로 1×8 = <b>8</b>. <code>0x10</code>은 16진수 10, 즉 1×16 = <b>16</b>. 출력은 모두 10진수(%d)로 변환되어 나온다."},
    {t:"out", h:"x = 10\ny = 8\nz = 16"}
  ]},
  { id:"c4-6", title:"기호 상수", en:"symbolic constant",
    blocks:[
    {t:"p", h:"<b>기호 상수(symbolic constant)</b>: 숫자 값을 직접 쓰는 대신 이름(기호)으로 표현한 것. ① 가독성이 좋아지고 ② 값을 한 곳에서 쉽게 바꿀 수 있다."},
    {t:"table", h:`<table><tr><th>방법</th><th>예</th><th>특징</th></tr>
      <tr><td><code>#define</code></td><td><code>#define TAX_RATE 0.2</code></td><td>전처리기가 코드 전체에서 글자를 치환</td></tr>
      <tr><td><code>const</code></td><td><code>const int MONTHS = 12;</code></td><td>값을 바꿀 수 없는 변수</td></tr></table>`},
    {t:"code", cap:"기호 상수로 연봉·세금 계산", s:R`#include <stdio.h>
#define TAX_RATE 0.2

int main(void)
{
    const int MONTHS = 12;
    int m_salary, y_salary;

    printf("월급을 입력하시요: ");
    scanf("%d", &m_salary);
    y_salary = MONTHS * m_salary;
    printf("연봉은 %d입니다.", y_salary);
    printf("세금은 %f입니다.", y_salary * TAX_RATE);
    return 0;
}`,
     note:"<code>MONTHS</code>, <code>TAX_RATE</code> 같은 이름을 쓰면 '12가 무슨 숫자인지' 바로 알 수 있고, 세율이 바뀌어도 <code>#define</code> 한 줄만 고치면 된다."},
    {t:"out", h:"월급을 입력하시요: 200\n연봉은 2400입니다.세금은 480.000000입니다."}
  ]},
  { id:"c4-7", title:"음수 표현 — 2의 보수", en:"two's complement",
    blocks:[
    {t:"p", h:"컴퓨터는 회로를 줄이려고 <b>덧셈 회로만</b> 가진다. 뺄셈은 '음수를 더하는 것'으로 바꿔서 처리한다 — 예: 3 − 3 = 3 + (−3)."},
    {t:"key", h:"음수는 <b>2의 보수</b>로 표현하는 것이 표준이다. 2의 보수로 음수를 나타내면, 양수와 음수를 각 비트끼리 그냥 더하기만 해도 올바른 결과가 나온다."},
    {t:"ex", h:"2의 보수 만드는 법: 모든 비트를 뒤집고(1의 보수) 1을 더한다. 이렇게 하면 뺄셈 전용 회로 없이 덧셈 회로 하나로 뺄셈까지 처리할 수 있다."}
  ]},
  { id:"c4-8", title:"부동소수점형", en:"floating point",
    blocks:[
    {t:"p", h:"실수는 <b>부동소수점(floating point)</b> 방식으로 표현한다. 소수점이 '떠서 움직인다'는 뜻으로, 과학적 표기법(1.49598 × 10⁸)과 비슷하게 <b>부호·가수·지수</b>로 나눠 저장한다. 덕분에 아주 크거나 작은 수(약 10⁻³⁸ ~ 10⁺³⁸)까지 표현 범위가 넓다."},
    {t:"table", h:`<table><tr><th>지정자</th><th>출력 형태</th></tr>
      <tr><td><code>%f</code></td><td>소수점 형태 (0.123457)</td></tr>
      <tr><td><code>%e</code></td><td>지수 형태 (1.234568e-001)</td></tr></table>`},
    {t:"code", cap:"오버플로우와 언더플로우", s:R`#include <stdio.h>

int main(void)
{
    float x = 1e39;       // 너무 커서 오버플로우 → inf
    printf("x = %e\n", x);

    float y = 1.23456e-40;  // 너무 작아서 정밀도 손실(언더플로우)
    float z = 1.23456e-46;  // 더 작으면 0이 됨
    printf("y = %e\n", y);
    printf("z = %e\n", z);
    return 0;
}`,
     note:"float가 표현할 수 있는 최대보다 크면 <code>inf</code>(무한대)로, 최소보다 작으면 정밀도를 잃다가 결국 <b>0</b>이 된다(언더플로우)."},
    {t:"out", h:"x = inf\ny = 1.234558e-040\nz = 0.000000e+000"}
  ]},
  { id:"c4-9", title:"문자형과 아스키 코드", en:"char & ASCII",
    blocks:[
    {t:"p", h:"문자는 <code>char</code>형(1바이트)에 저장하는데, 내부적으로는 <b>아스키 코드(ASCII)</b>라는 숫자로 저장된다. 그래서 char는 '8비트 정수'로도 쓸 수 있다."},
    {t:"code", cap:"문자 = 숫자", s:R`#include <stdio.h>

int main(void)
{
    char code1 = 'A';   // 문자 상수로 초기화
    char code2 = 65;    // 아스키 코드 65 = 'A'

    printf("code1 = %c\n", code1);
    printf("code2 = %c\n", code2);
    return 0;
}`,
     note:"<code>'A'</code>의 아스키 코드가 65라서 <code>code1</code>과 <code>code2</code>는 같은 값이다. <code>%c</code>로 출력하면 둘 다 'A'."},
    {t:"out", h:"code1 = A\ncode2 = A"},
    {t:"code", cap:"char에 산술 연산", s:R`#include <stdio.h>

int main(void)
{
    char code = 'A';
    printf("%d %d %d\n", code, code + 1, code + 2); // 65 66 67
    printf("%c %c %c\n", code, code + 1, code + 2); // A B C
    return 0;
}`,
     note:"char는 정수처럼 더할 수 있다. <code>'A'+1</code> = 66 = <code>'B'</code>. 같은 값을 <code>%d</code>로 보면 숫자, <code>%c</code>로 보면 문자로 나온다."},
    {t:"out", h:"65 66 67\nA B C"}
  ]},
  { id:"c4-10", title:"제어 문자와 이스케이프 시퀀스", en:"escape sequence",
    blocks:[
    {t:"p", h:"줄바꿈·탭처럼 '인쇄용'이 아니라 '제어용'인 문자가 있다. 역슬래시 <code>\\</code> 뒤에 글자를 붙여 표현하며 이를 <b>이스케이프 시퀀스</b>라 한다."},
    {t:"table", h:`<table><tr><th>표기</th><th>의미</th></tr>
      <tr><td><code>\\n</code></td><td>줄바꿈</td></tr>
      <tr><td><code>\\t</code></td><td>탭</td></tr>
      <tr><td><code>\\a</code></td><td>경고음(벨)</td></tr>
      <tr><td><code>\\b</code></td><td>백스페이스</td></tr>
      <tr><td><code>\\"</code></td><td>큰따옴표 문자</td></tr>
      <tr><td><code>\\\\</code></td><td>역슬래시 문자</td></tr></table>`},
    {t:"ex", h:"<code>printf(\" \\\"나만의 할리우드\\\" \");</code> → 화면에 <code>\"나만의 할리우드\"</code>. 따옴표 앞에 <code>\\</code>를 붙이면 '문자열의 끝'이 아니라 '따옴표 글자 자체'로 출력된다."}
  ]},
  { id:"c4-11", title:"Mini Project — 태양빛 도달 시간", en:"mini project",
    blocks:[
    {t:"p", h:"빛의 속도(30만 km/s)와 태양–지구 거리(1억 4960만 km)로, 빛이 지구에 닿는 시간을 계산한다. 아주 큰 수라서 모든 변수를 <code>double</code>(실수형)로 선언한다."},
    {t:"code", cap:"도달 시간 계산", s:R`#include <stdio.h>

int main(void)
{
    double light_speed = 300000;    // 빛의 속도(km/s)
    double distance = 149600000;    // 태양-지구 거리(km)
    double time;                    // 시간

    time = distance / light_speed;  // 거리 ÷ 속도 = 시간(초)
    time = time / 60.0;             // 초 → 분

    printf("빛의 속도는 %fkm/s \n", light_speed);
    printf("태양과 지구와의 거리 %fkm \n", distance);
    printf("도달 시간은 %f분\n", time);
    return 0;
}`,
     note:"<b>시간 = 거리 ÷ 속도</b>. 149600000 / 300000 = 약 498.67초, 이를 60으로 나누면 약 8.3분. 큰 수·소수를 다루므로 int가 아닌 double을 써야 한다."},
    {t:"out", h:"빛의 속도는 300000.000000km/s\n태양과 지구와의 거리 149600000.000000km\n도달 시간은 8.311111분"}
  ]}
]},

/* =========================== 5장 =========================== */
{ id:"ch5", no:5, title:"수식과 연산자", color:4,
  summary:"산술·관계·논리·비트·대입 연산자, 증감 연산자, 형변환, 우선순위",
  sections:[
  { id:"c5-1", title:"수식과 연산자 분류", en:"expression & operators",
    blocks:[
    {t:"p", h:"<b>수식(expression)</b> = 상수·변수·연산자의 조합. 연산자는 피연산자 개수에 따라 <b>단항</b>(1개, 예 <code>-x</code>), <b>이항</b>(2개, 예 <code>x+y</code>), <b>삼항</b>(3개, 조건 연산자)으로 나뉜다."},
    {t:"warn", h:"C에는 <b>거듭제곱 연산자가 없다</b>. <code>x²</code>은 <code>x * x</code> 로 직접 곱한다. (더 큰 지수는 math.h의 <code>pow()</code> 함수를 쓴다.)"}
  ]},
  { id:"c5-2", title:"산술 연산자", en:"arithmetic",
    blocks:[
    {t:"table", h:`<table><tr><th>연산자</th><th>뜻</th><th>7과 4일 때</th></tr>
      <tr><td><code>+</code></td><td>덧셈</td><td>11</td></tr>
      <tr><td><code>-</code></td><td>뺄셈</td><td>3</td></tr>
      <tr><td><code>*</code></td><td>곱셈</td><td>28</td></tr>
      <tr><td><code>/</code></td><td>나눗셈</td><td>1 (정수라 버림)</td></tr>
      <tr><td><code>%</code></td><td>나머지</td><td>3</td></tr></table>`},
    {t:"code", cap:"정수 사칙연산 전체 코드", s:R`#include <stdio.h>

int main(void)
{
    int x, y, result;
    printf("두개의 정수를 입력하시오: ");
    scanf("%d %d", &x, &y);

    result = x + y;
    printf("%d + %d = %d\n", x, y, result);
    result = x - y;
    printf("%d - %d = %d\n", x, y, result);
    result = x * y;
    printf("%d * %d = %d\n", x, y, result);
    result = x / y;
    printf("%d / %d = %d\n", x, y, result);
    result = x % y;
    printf("%d %% %d = %d\n", x, y, result);
    return 0;
}`,
     note:"<code>scanf(\"%d %d\", &x, &y)</code>는 숫자 두 개를 한 번에 받는다. 정수 7/4는 소수점을 버려 1, 나머지 7%4는 3. 출력에서 <b>%</b> 기호 자체를 찍으려면 <code>%%</code> 로 써야 한다."},
    {t:"out", h:"두개의 정수를 입력하시오: 7 4\n7 + 4 = 11\n7 - 4 = 3\n7 * 4 = 28\n7 / 4 = 1\n7 % 4 = 3"}
  ]},
  { id:"c5-3", title:"나머지 연산자의 활용", en:"modulus",
    blocks:[
    {t:"p", h:"나머지(<code>%</code>)는 '나누고 남은 값'이다. 아주 쓸모가 많다."},
    {t:"table", h:`<table><tr><th>용도</th><th>조건</th></tr>
      <tr><td>짝수 판별</td><td><code>x % 2 == 0</code></td></tr>
      <tr><td>3의 배수 판별</td><td><code>x % 3 == 0</code></td></tr>
      <tr><td>단위 분리(초→분·초)</td><td>몫 <code>/</code> 과 나머지 <code>%</code> 조합</td></tr></table>`},
    {t:"code", cap:"초를 분과 초로", s:R`#include <stdio.h>
#define SEC_PER_MINUTE 60

int main(void)
{
    int input, minute, second;

    printf("초를 입력하시요: ");
    scanf("%d", &input);

    minute = input / SEC_PER_MINUTE;  // 몫 = 몇 분
    second = input % SEC_PER_MINUTE;  // 나머지 = 몇 초

    printf("%d초는 %d분 %d초입니다.\n", input, minute, second);
    return 0;
}`,
     note:"1000초를 60으로 나눈 몫 16(분), 나머지 40(초). <b>몫(/)과 나머지(%)</b>를 함께 쓰면 큰 단위를 작은 단위로 깔끔히 쪼갤 수 있다."},
    {t:"out", h:"초를 입력하시요: 1000\n1000초는 16분 40초입니다."}
  ]},
  { id:"c5-4", title:"증감 연산자 ++ --", en:"increment/decrement",
    blocks:[
    {t:"p", h:"<code>++</code>, <code>--</code>는 변수를 1 늘리거나 줄인다. 변수 <b>앞</b>에 붙이냐 <b>뒤</b>에 붙이냐에 따라 '언제 증가하는지'가 다르다."},
    {t:"table", h:`<table><tr><th>형태</th><th>동작</th></tr>
      <tr><td><code>++x</code> (전위)</td><td>먼저 1 증가시킨 뒤, 그 값을 수식에 사용</td></tr>
      <tr><td><code>x++</code> (후위)</td><td>현재 값을 수식에 먼저 쓰고, 그 다음 1 증가</td></tr></table>`},
    {t:"code", cap:"전위 vs 후위", s:R`#include <stdio.h>

int main(void)
{
    int x = 10, y = 10;

    printf("x=%d\n", x);
    printf("++x의 값=%d\n", ++x);  // 먼저 11로 증가 → 11
    printf("x=%d\n\n", x);          // x는 11

    printf("y=%d\n", y);
    printf("y++의 값=%d\n", y++);  // 현재 10 사용 → 10, 그 뒤 증가
    printf("y=%d\n", y);            // y는 11
    return 0;
}`,
     note:"<code>++x</code>는 증가 후 값(11)을 쓰고, <code>y++</code>는 증가 전 값(10)을 쓴 뒤에 증가한다. 결과적으로 x와 y 둘 다 끝엔 11이 되지만 '출력된 값'이 다르다."},
    {t:"out", h:"x=10\n++x의 값=11\nx=11\n\ny=10\ny++의 값=10\ny=11"}
  ]},
  { id:"c5-5", title:"Lab — 거스름돈 계산", en:"change maker",
    blocks:[
    {t:"p", h:"거스름돈을 '큰 화폐부터' 몫(<code>/</code>)으로 장수를 구하고, 나머지(<code>%</code>)로 남은 돈을 넘기는 패턴을 반복한다."},
    {t:"code", cap:"거스름돈 전체 코드", s:R`#include <stdio.h>

int main(void)
{
    int user, change = 0;
    int price, c5000, c1000, c500, c100;

    printf("물건 값을 입력하시오: ");
    scanf("%d", &price);
    printf("사용자가 낸 돈: ");
    scanf("%d", &user);
    change = user - price;           // 거스름돈 총액

    c5000 = change / 5000;  change %= 5000;  // 오천원권
    c1000 = change / 1000;  change %= 1000;  // 천원권
    c500  = change / 500;   change %= 500;   // 오백원 동전
    c100  = change / 100;                    // 백원 동전

    printf("오천원권: %d장\n", c5000);
    printf("천원권: %d장\n", c1000);
    printf("오백원 동전: %d개\n", c500);
    printf("백원 동전: %d개\n", c100);
    return 0;
}`,
     note:"<code>change %= 5000</code>은 <code>change = change % 5000</code>과 같다(복합 대입). 큰 단위부터 '몫으로 개수, 나머지로 잔액 갱신'을 반복하는 것이 거스름돈 알고리즘의 핵심이다."},
    {t:"out", h:"물건 값을 입력하시오: 3200\n사용자가 낸 돈: 10000\n오천원권: 1장\n천원권: 1장\n오백원 동전: 1개\n백원 동전: 3개"}
  ]},
  { id:"c5-6", title:"대입·복합 대입 연산자", en:"assignment",
    blocks:[
    {t:"p", h:"<code>=</code>는 수학의 '같다'가 아니라 '오른쪽을 왼쪽에 저장'이다. 그래서 <code>x = x + 1;</code> 처럼 수학적으로 이상한 문장도 C에서는 올바르다(x를 1 늘려 다시 저장)."},
    {t:"warn", h:"왼쪽에는 값을 담을 수 있는 변수만 온다. <code>100 = x + y;</code> 는 컴파일 오류다."},
    {t:"table", h:`<table><tr><th>복합 대입</th><th>같은 뜻</th></tr>
      <tr><td><code>x += y</code></td><td><code>x = x + y</code></td></tr>
      <tr><td><code>x *= y + 1</code></td><td><code>x = x * (y + 1)</code></td></tr>
      <tr><td><code>x %= x + y</code></td><td><code>x = x % (x + y)</code></td></tr></table>`},
    {t:"ex", h:"다중 대입도 가능: <code>y = x = 3;</code> 은 먼저 <code>x = 3</code>이 실행되고 그 결과값 3이 다시 y에 대입되어 둘 다 3이 된다."}
  ]},
  { id:"c5-7", title:"관계 연산자", en:"relational",
    blocks:[
    {t:"p", h:"두 값을 비교하는 연산자다. 결과는 <b>참이면 1, 거짓이면 0</b>."},
    {t:"table", h:`<table><tr><th>연산자</th><th>의미</th></tr>
      <tr><td><code>==</code></td><td>같다</td></tr>
      <tr><td><code>!=</code></td><td>다르다</td></tr>
      <tr><td><code>&gt; &lt;</code></td><td>크다 / 작다</td></tr>
      <tr><td><code>&gt;= &lt;=</code></td><td>크거나 같다 / 작거나 같다</td></tr></table>`},
    {t:"warn", h:"<code>==</code>(비교)와 <code>=</code>(대입)를 혼동하면 안 된다. <code>(x == y)</code>는 같은지 따지지만 <code>(x = y)</code>는 y를 x에 넣어 버린다 — 아주 흔한 버그다."},
    {t:"warn", h:"수학처럼 <code>2 &lt; x &lt; 5</code> 로 쓰면 틀린 결과가 나온다. 반드시 <code>(2 &lt; x) &amp;&amp; (x &lt; 5)</code> 로 나눠 쓴다."}
  ]},
  { id:"c5-8", title:"논리 연산자", en:"logical",
    blocks:[
    {t:"p", h:"여러 조건을 묶어 참/거짓을 따진다. 결과는 1 또는 0이다."},
    {t:"table", h:`<table><tr><th>연산자</th><th>의미</th></tr>
      <tr><td><code>&amp;&amp;</code> (AND)</td><td>둘 다 참이어야 참</td></tr>
      <tr><td><code>||</code> (OR)</td><td>하나라도 참이면 참</td></tr>
      <tr><td><code>!</code> (NOT)</td><td>참↔거짓 뒤집기</td></tr></table>`},
    {t:"ex", h:"\"x가 60 이상 100 미만\" → <code>(x &gt;= 60) &amp;&amp; (x &lt; 100)</code> · \"x는 1,2,3 중 하나\" → <code>(x==1) || (x==2) || (x==3)</code> · <code>!0</code>은 1, <code>!3</code>은 0(0이 아니면 참으로 보기 때문)."},
    {t:"code", cap:"Lab — 윤년 판별", s:R`#include <stdio.h>

int main(void)
{
    int year, result;

    printf("연도를 입력하시오: ");
    scanf("%d", &year);

    result = ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    printf("result=%d \n", result);
    return 0;
}`,
     note:"윤년 조건 두 가지를 그대로 수식으로 옮겼다 — ①4의 배수이고 100의 배수는 아니다, <b>또는</b> ②400의 배수다. 2012는 조건①을 만족하므로 result=1(윤년)."},
    {t:"out", h:"연도를 입력하시오: 2012\nresult=1"}
  ]},
  { id:"c5-9", title:"조건·콤마 연산자", en:"conditional & comma",
    blocks:[
    {t:"p", h:"<b>조건 연산자 <code>? :</code></b> 는 유일한 삼항 연산자다. <code>조건 ? A : B</code> — 조건이 참이면 A, 거짓이면 B가 수식의 값이 된다."},
    {t:"code", cap:"최대값·절대값", s:R`absolute_value = (x > 0) ? x : -x;    // 절대값
max_value = (x > y) ? x : y;          // 최대값
min_value = (x < y) ? x : y;          // 최소값`,
     note:"if-else로 쓸 것을 한 줄로 줄일 수 있다. <code>(x &gt; y) ? x : y</code> 는 'x가 크면 x, 아니면 y'라서 둘 중 큰 값이 된다."},
    {t:"p", h:"<b>콤마 연산자</b>: 콤마로 이은 식들은 왼쪽부터 순차 계산된다 — <code>x++, y++;</code>"}
  ]},
  { id:"c5-10", title:"비트 연산 — XOR 암호화", en:"bitwise",
    blocks:[
    {t:"p", h:"모든 데이터는 비트(0/1)로 되어 있어 비트 단위 연산이 가능하다 — <code>&amp;</code>(AND), <code>|</code>(OR), <code>^</code>(XOR)."},
    {t:"key", h:"<b>XOR의 성질</b>: 같은 키로 두 번 XOR하면 원래 값으로 돌아온다. <code>x = x ^ key</code>로 암호화하고, 다시 <code>x = x ^ key</code>하면 복호화된다."},
    {t:"code", cap:"Lab — XOR 암호화/복호화", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    char data = 'a';
    char key = 0xff;

    char encrypted_data = data ^ key;     // 암호화
    printf("암호화된 문자=%c \n", encrypted_data);

    char orig_data = encrypted_data ^ key; // 같은 키로 복호화
    printf("원래의 데이터=%c\n", orig_data);
    return 0;
}`,
     note:"<code>data ^ key</code>로 알아볼 수 없는 문자가 되고(암호화), 그 결과에 <b>같은 key</b>로 다시 <code>^</code>하면 원래의 <code>'a'</code>로 복원된다(복호화). XOR 암호의 기본 원리다."},
    {t:"out", h:"암호화된 문자=(깨진 문자)\n원래의 데이터=a"}
  ]},
  { id:"c5-11", title:"형변환", en:"type conversion",
    blocks:[
    {t:"p", h:"<b>형변환(type conversion)</b>은 실행 중에 데이터의 타입을 바꾸는 것이다. 변수 타입 자체가 아니라 '그 순간 저장/계산되는 데이터의 타입'이 바뀐다."},
    {t:"table", h:`<table><tr><th>종류</th><th>예</th><th>결과</th></tr>
      <tr><td><b>올림 변환</b>(작은→큰)</td><td><code>double f = 10;</code></td><td>f에 10.0 저장</td></tr>
      <tr><td><b>내림 변환</b>(큰→작은)</td><td><code>int i = 3.141592;</code></td><td>i에 3 저장(소수 버림)</td></tr></table>`},
    {t:"p", h:"서로 다른 타입을 섞어 계산하면 더 큰 타입으로 통일된다. 원하는 타입을 강제하려면 <b>명시적 형변환</b> <code>(타입)</code>을 쓴다."},
    {t:"code", cap:"명시적 형변환의 효과", s:R`f = 5 / 4;              // 정수나눗셈 1 → 1.0 저장 → 1.000000
f = (double)5 / 4;      // 5가 5.0 → 1.25
f = 5.0 / 4;            // 역시 1.25

i = 1.3 + 1.8;          // 3.1 → 내림 → 3
i = (int)1.3 + (int)1.8;// 1 + 1 → 2`,
     note:"<code>5 / 4</code>는 정수끼리라 1이 되지만, <code>(double)5 / 4</code>는 5를 5.0으로 바꿔 계산하므로 1.25가 된다. 실수 나눗셈을 원하면 피연산자 하나를 실수로 만들어야 한다."}
  ]},
  { id:"c5-12", title:"우선순위와 결합 규칙", en:"precedence",
    blocks:[
    {t:"p", h:"여러 연산자가 섞이면 '무엇을 먼저 계산할지'(우선순위)가 중요하다. 대략의 순서:"},
    {t:"key", h:"대입 &lt; 논리 &lt; 관계 &lt; 산술 &lt; 단항. 괄호 <code>( )</code>가 가장 높다. 헷갈리면 괄호로 묶어라."},
    {t:"table", h:`<table><tr><th>기억할 점</th></tr>
      <tr><td>관계 연산자가 논리 연산자보다 높다 → <code>x &gt; y && z &gt; y</code> 는 <code>(x&gt;y) && (z&gt;y)</code></td></tr>
      <tr><td><code>&&</code>가 <code>||</code>보다 높다 → <code>x&lt;5 || x&gt;10 && x&gt;0</code> 은 <code>x&lt;5 || (x&gt;10 && x&gt;0)</code></td></tr></table>`},
    {t:"p", h:"<b>결합 규칙</b>: 우선순위가 같은 연산자가 여러 개면 어느 쪽부터 계산할지의 규칙(대부분 왼→오, 대입은 오→왼)."},
    {t:"code", cap:"Mini Project — 화씨→섭씨 (버그와 수정)", s:R`// (잘못된 코드) 5/9가 정수 나눗셈이라 0이 된다
c_temp = 5 / 9 * (f_temp - 32);     // 항상 0!

// (수정) 5.0/9.0 으로 실수 나눗셈
c_temp = 5.0 / 9.0 * (f_temp - 32); // 정상`,
     note:"섭씨 = 5/9 × (화씨 − 32). <code>5 / 9</code>는 정수 나눗셈이라 0이 되어 답이 항상 0이 된다. <code>5.0 / 9.0</code>처럼 실수로 써야 0.555…가 되어 올바른 섭씨 온도가 나온다. 입력 90 → 32.222222℃."},
    {t:"out", h:"화씨온도를 입력하시오: 90\n섭씨온도는 32.222222입니다"}
  ]}
]},

/* =========================== 6장 =========================== */
{ id:"ch6", no:6, title:"조건문", color:1,
  summary:"if · if-else · 중첩 if · 연속 if-else · switch · break/continue/goto",
  sections:[
  { id:"c6-1", title:"제어 구조와 if 문", en:"if statement",
    blocks:[
    {t:"p", h:"프로그램 흐름을 제어하는 구조는 세 가지 — <b>순차</b>(위→아래), <b>선택</b>(조건문), <b>반복</b>(반복문). 이 장은 그중 '선택'을 다룬다."},
    {t:"p", h:"<b>if 문</b>: 조건이 참일 때만 문장을 실행한다. 조건은 보통 관계·논리 수식을 쓴다."},
    {t:"code", cap:"양수 판별", s:R`#include <stdio.h>

int main(void)
{
    int number;

    printf("정수를 입력하시오:");
    scanf("%d", &number);

    if (number > 0)
        printf("양수입니다.");

    printf("입력된 값은 %d입니다.", number);
    return 0;
}`,
     note:"<code>number &gt; 0</code>이 참일 때만 '양수입니다'가 출력된다. if 문이 끝나면 그 아래 문장(입력된 값 …)은 조건과 상관없이 <b>항상</b> 실행된다."},
    {t:"out", h:"정수를 입력하시오:25\n양수입니다.입력된 값은 25입니다."},
    {t:"p", h:"<b>복합문(블록)</b>: 조건이 참일 때 문장을 둘 이상 실행하려면 <code>{ }</code>로 묶는다."},
    {t:"code", cap:"절대값 구하기", s:R`#include <stdio.h>

int main(void)
{
    int number;

    printf("정수를 입력하시오:");
    scanf("%d", &number);

    if (number < 0)
        number = -number;   // 음수면 부호를 뒤집는다

    printf("절대값은 %d 입니다.\n", number);
    return 0;
}`,
     note:"입력이 음수일 때만 부호를 뒤집어 양수로 만든다. −5를 넣으면 조건이 참이 되어 5로 바뀐다."},
    {t:"out", h:"정수를 입력하시오:-5\n절대값은 5입니다."}
  ]},
  { id:"c6-2", title:"if-else 문", en:"if-else",
    blocks:[
    {t:"p", h:"<b>if-else</b>: 조건이 참이면 if 블록, 거짓이면 else 블록을 실행한다. 둘 중 하나는 반드시 실행된다."},
    {t:"code", cap:"홀수/짝수 구분", s:R`#include <stdio.h>

int main(void)
{
    int number;

    printf("정수를 입력하시오:");
    scanf("%d", &number);

    if (number % 2 == 0)
        printf("입력된 정수는 짝수입니다.\n");
    else
        printf("입력된 정수는 홀수입니다.\n");
    return 0;
}`,
     note:"2로 나눈 나머지가 0이면 짝수, 아니면 홀수. 23은 나머지가 1이라 else가 실행된다."},
    {t:"out", h:"정수를 입력하시오: 23\n입력된 정수는 홀수입니다."},
    {t:"ex", h:"0으로 나누기 방지에도 쓴다: <code>if(n2 == 0) printf(\"0으로 나눌 수 없습니다\"); else n3 = n1/n2;</code> — 분모가 0인지 먼저 검사해 실행 시간 오류를 막는다."}
  ]},
  { id:"c6-3", title:"중첩 if와 dangling else", en:"nested if",
    blocks:[
    {t:"p", h:"if 안에 또 if를 넣는 것을 <b>중첩 if</b>라 한다. 이때 <code>else</code>는 <b>가장 가까운 if</b>와 짝지어진다 — 이것이 'dangling else(매달린 else)' 문제다."},
    {t:"code", cap:"else 매칭 주의", s:R`if (score >= 80)
{
    if (score >= 90)
        printf("학점 A\n");
}
else   // 바깥 if(score>=80)의 else가 되려면 중괄호로 묶어야 한다
    printf("A나 B가 아닙니다.\n");`,
     note:"중괄호 <code>{ }</code>가 없으면 else는 안쪽 <code>if(score&gt;=90)</code>에 붙어 의도와 달라진다. 특정 if에 else를 붙이려면 그 if를 블록으로 감싼다."}
  ]},
  { id:"c6-4", title:"연속적인 if-else — 학점", en:"else-if ladder",
    blocks:[
    {t:"p", h:"여러 구간으로 나눌 땐 <code>else if</code>를 연이어 쓴다. 위에서부터 참인 조건을 만나면 그 블록만 실행하고 나머지는 건너뛴다."},
    {t:"code", cap:"학점 결정", s:R`#include <stdio.h>

int main(void)
{
    int score;
    printf("성적을 입력하시오: ");
    scanf("%d", &score);

    if (score >= 90)
        printf("합격: 학점A\n");
    else if (score >= 80)
        printf("합격: 학점B\n");
    else if (score >= 70)
        printf("합격: 학점C\n");
    else if (score >= 60)
        printf("합격: 학점D\n");
    else
        printf("불합격: 학점F\n");
    return 0;
}`,
     note:"88점은 90 미만이라 첫 조건은 거짓, 다음 <code>score &gt;= 80</code>이 참이 되어 'B'가 출력되고 아래 조건들은 검사하지 않는다. 범위를 큰 값부터 좁혀 가는 것이 요령이다."},
    {t:"out", h:"성적을 입력하시오: 88\n합격: 학점B"},
    {t:"ex", h:"문자 분류도 같은 패턴: <code>if(ch&gt;='A'&&ch&lt;='Z')</code> 대문자, <code>else if(ch&gt;='a'&&ch&lt;='z')</code> 소문자, <code>else if(ch&gt;='0'&&ch&lt;='9')</code> 숫자, <code>else</code> 기타."}
  ]},
  { id:"c6-5", title:"Lab — 이차방정식", en:"quadratic",
    blocks:[
    {t:"p", h:"계수 a, b, c를 받아 실근을 구한다. ①a가 0이면 일차방정식 ②판별식(b²−4ac)이 음수면 실근 없음 ③아니면 근의 공식. 중첩 if-else로 구현한다."},
    {t:"code", cap:"이차방정식 전체 코드", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <math.h>

int main(void)
{
    double a, b, c, dis;

    printf("계수 a, 계수 b, 계수 c를 차례대로 입력하시오: ");
    scanf("%lf %lf %lf", &a, &b, &c);

    if (a == 0)
        printf("방정식의 근은 %f입니다.", -c / b);
    else
    {
        dis = b * b - 4.0 * a * c;   // 판별식
        if (dis >= 0)
        {
            printf("방정식의 근은 %f입니다.\n", (-b + sqrt(dis)) / (2.0 * a));
            printf("방정식의 근은 %f입니다.\n", (-b - sqrt(dis)) / (2.0 * a));
        }
        else
            printf("실근이 존재하지 않습니다\n");
    }
    return 0;
}`,
     note:"<code>sqrt()</code>는 제곱근 함수라 <code>#include &lt;math.h&gt;</code>가 필요하다. 판별식이 0 이상이면 근의 공식 ( −b ± √판별식 ) / 2a 로 두 근을 구한다. a=1,b=2,c=−8이면 근은 2와 −4."},
    {t:"out", h:"계수 a, 계수 b, 계수 c를 차례대로 입력하시오: 1 2 -8\n방정식의 근은 2.000000입니다.\n방정식의 근은 -4.000000입니다."}
  ]},
  { id:"c6-6", title:"switch 문", en:"switch",
    blocks:[
    {t:"p", h:"<b>switch</b>는 하나의 정수/문자 값에 따라 여러 갈래 중 하나를 고른다. 각 <code>case</code> 끝의 <b>break</b>는 switch를 빠져나가게 한다."},
    {t:"code", cap:"switch 기본형", s:R`switch (number) {
    case 0:
        printf("없음\n");
        break;
    case 1:
        printf("하나\n");
        break;
    case 2:
        printf("둘\n");
        break;
    default:
        printf("많음\n");
        break;
}`,
     note:"number와 일치하는 case로 점프해 실행하다가 <code>break</code>를 만나면 멈춘다. 일치하는 게 없으면 <code>default</code>가 실행된다."},
    {t:"warn", h:"<b>break를 빠뜨리면</b> 다음 case로 그대로 흘러내려 간다(fall-through). 이걸 역이용해 여러 case를 묶기도 한다 — 아래 '달의 일수' 참고. case 뒤에는 <b>상수</b>만 올 수 있고 변수·수식·실수·문자열은 쓸 수 없다(문자는 가능)."},
    {t:"code", cap:"달의 일수 (fall-through 활용)", s:R`#include <stdio.h>

int main(void)
{
    int month, days;

    printf("달을 입력하시오: ");
    scanf("%d", &month);

    switch (month) {
        case 2:
            days = 28;
            break;
        case 4: case 6: case 9: case 11:   // 30일인 달들
            days = 30;
            break;
        default:                           // 나머지는 31일
            days = 31;
            break;
    }
    printf("%d월의 일수는 %d입니다.\n", month, days);
    return 0;
}`,
     note:"4·6·9·11월은 break 없이 연달아 두어 같은 처리(30일)로 모았다. 2월은 28일, 나머지는 default로 31일. 12월은 어느 case에도 없으니 default → 31."},
    {t:"out", h:"달을 입력하시오: 12\n12월의 일수는 31입니다."}
  ]},
  { id:"c6-7", title:"Lab — 산술 계산기 (switch)", en:"calculator",
    blocks:[
    {t:"p", h:"연산자 문자를 받아 switch로 분기하는 계산기다. <code>scanf(\"%d %c %d\", &x, &op, &y)</code> 로 '숫자 연산자 숫자'를 한 번에 받는다."},
    {t:"code", cap:"계산기 전체 코드", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    char op;
    int x, y, result;

    printf("수식을 입력하시오(예: 2 + 5)\n>>");
    scanf("%d %c %d", &x, &op, &y);

    switch (op) {
        case '+': result = x + y; break;
        case '-': result = x - y; break;
        case '*': result = x * y; break;
        case '/': result = x / y; break;
        case '%': result = x % y; break;
        default:
            printf("지원되지 않는 연산자입니다.\n");
    }
    printf("%d %c %d = %d \n", x, op, y, result);
    return 0;
}`,
     note:"입력한 문자 <code>op</code>('+','-'…)에 따라 알맞은 계산을 고른다. case에 <b>문자 상수</b>('+')를 쓸 수 있다는 점이 포인트. 같은 기능을 if-else로도 만들 수 있지만, 한 값에 대한 다중 분기는 switch가 깔끔하다."},
    {t:"out", h:"수식을 입력하시오(예: 2 + 5)\n>>10 * 2\n10 * 2 = 20"}
  ]},
  { id:"c6-8", title:"goto와 삼각형 판별", en:"goto, triangle",
    blocks:[
    {t:"p", h:"<b>goto</b>는 조건 없이 지정한 위치로 점프한다. 흐름을 어지럽혀 <b>되도록 쓰지 않는 것이 좋다</b>."},
    {t:"code", cap:"Lab — 올바른 삼각형", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int a, b, c;

    printf("삼각형의 3변을 입력하시오: ");
    scanf("%d%d%d", &a, &b, &c);

    if ((a + b) > c && (b + c) > a && (a + c) > b)
        printf("올바른 삼각형\n");
    else
        printf("올바르지 않은 삼각형\n");
    return 0;
}`,
     note:"삼각형이 되려면 <b>두 변의 합이 나머지 한 변보다 커야 한다</b>는 조건을 세 쌍 모두 <code>&&</code>로 검사한다. 8,10,3은 세 조건을 모두 만족해 '올바른 삼각형'."},
    {t:"out", h:"삼각형의 3변을 입력하시오: 8 10 3\n올바른 삼각형"}
  ]}
]},

/* =========================== 7장 =========================== */
{ id:"ch7", no:7, title:"반복문", color:2,
  summary:"while · do-while · for · 중첩 반복 · break/continue, 난수 활용",
  sections:[
  { id:"c7-1", title:"반복은 왜 필요한가", en:"why loops",
    blocks:[
    {t:"p", h:"같은 처리를 여러 번 되풀이할 때 반복문을 쓴다. 학생 30명의 평균을 구하려면 같은 과정을 30번 반복해야 한다."},
    {t:"code", cap:"반복이 없을 때 vs 있을 때", s:R`// 5번 복사-붙여넣기
printf("Hello World! \n");
printf("Hello World! \n");
printf("Hello World! \n");
printf("Hello World! \n");
printf("Hello World! \n");

// 반복문 한 줄로
for (i = 0; i < 5; i++)
    printf("Hello World! \n");`,
     note:"반복문을 쓰면 횟수가 100번이든 1000번이든 코드 길이는 그대로다. 반복문에는 <b>while, do-while, for</b>가 있다."}
  ]},
  { id:"c7-2", title:"while 문", en:"while",
    blocks:[
    {t:"p", h:"<b>while</b>은 조건이 참인 동안 블록을 반복한다. 보통 ①변수 초기화 → ②조건 검사 → ③본문 실행 → ④증감 의 순서로 돈다."},
    {t:"code", cap:"1부터 n까지의 합", s:R`#include <stdio.h>

int main(void)
{
    int i, n, sum;

    printf("정수를 입력하시오:");
    scanf("%d", &n);

    i = 1;
    sum = 0;
    while (i <= n)
    {
        sum += i;   // sum = sum + i
        i++;        // i = i + 1
    }
    printf("1부터 %d까지의 합은 %d입니다\n", n, sum);
    return 0;
}`,
     note:"<code>i</code>를 1부터 n까지 늘리며 <code>sum</code>에 차곡차곡 더한다. <code>i++</code>를 빠뜨리면 조건이 영원히 참이라 <b>무한 루프</b>에 빠진다 — while에서 가장 흔한 실수다."},
    {t:"out", h:"정수를 입력하시오: 3\n1부터 3까지의 합은 6입니다"},
    {t:"warn", h:"무한 루프 주의 ① 증감을 빠뜨리거나 방향이 반대(<code>i--</code>)면 끝나지 않는다. ② 중괄호를 안 쓰면 while엔 바로 다음 한 문장만 묶여, 아래 문장은 반복 밖이 된다."}
  ]},
  { id:"c7-3", title:"센티널 — 성적 평균", en:"sentinel",
    blocks:[
    {t:"p", h:"<b>센티널(sentinel, 보초값)</b>: 입력의 끝을 알리는 특수한 값. 몇 개를 입력할지 모를 때, 음수 같은 값을 '그만'의 신호로 쓴다."},
    {t:"code", cap:"음수가 나올 때까지 평균", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int grade, n = 0;
    float sum = 0, average;
    grade = 0;

    printf("성적 입력을 종료하려면 음수를 입력하시오\n");
    while (grade >= 0)
    {
        printf("성적을 입력하시오: ");
        scanf("%d", &grade);
        sum += grade;
        n++;
    }
    sum = sum - grade;  // 마지막에 더해진 음수를 빼준다
    n--;                // 센티널은 개수에서 제외
    average = sum / n;
    printf("성적의 평균은 %f입니다.\n", average);
    return 0;
}`,
     note:"음수를 넣으면 while이 끝나는데, 그 음수도 이미 sum·n에 반영됐으므로 루프 뒤에서 <code>sum - grade</code>, <code>n--</code>로 되돌린다. 센티널 패턴의 전형적인 마무리다."},
    {t:"out", h:"성적을 입력하시오: 10\n...\n성적을 입력하시오: -1\n성적의 평균은 30.000000입니다."}
  ]},
  { id:"c7-4", title:"Lab — 최대공약수(유클리드)", en:"gcd",
    blocks:[
    {t:"p", h:"유클리드 알고리즘: y가 0이 될 때까지 <code>r = x%y; x = y; y = r;</code> 를 반복하면, 마지막 x가 최대공약수다."},
    {t:"code", cap:"최대공약수", s:R`#include <stdio.h>

int main(void)
{
    int x, y, r;

    printf("두개의 정수를 입력하시오(큰수, 작은수): ");
    scanf("%d%d", &x, &y);

    while (y != 0)
    {
        r = x % y;
        x = y;
        y = r;
    }
    printf("최대 공약수는 %d입니다.\n", x);
    return 0;
}`,
     note:"큰 수를 작은 수로 나눈 나머지로 계속 교체한다. 12와 8 → (r=4,x=8,y=4) → (r=0,x=4,y=0) → 종료, 답은 4. 나머지가 0이 되는 순간의 x가 GCD다."},
    {t:"out", h:"두개의 정수를 입력하시오(큰수, 작은수): 12 8\n최대 공약수는 4입니다."}
  ]},
  { id:"c7-5", title:"do-while 문", en:"do-while",
    blocks:[
    {t:"p", h:"<b>do-while</b>은 본문을 먼저 실행하고 나중에 조건을 검사한다. 그래서 <b>최소 한 번은</b> 반드시 실행된다. 메뉴 입력처럼 '일단 한 번 보여 주고 다시 받기'에 알맞다."},
    {t:"code", cap:"0을 입력할 때까지 합", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int main(void)
{
    int number, sum = 0;

    do {
        printf("정수를 입력하시오: ");
        scanf("%d", &number);
        sum += number;
    } while (number != 0);

    printf("숫자들의 합 = %d \n", sum);
    return 0;
}`,
     note:"입력을 받고 더한 뒤 조건(<code>number != 0</code>)을 검사하므로, 0을 입력하는 순간 루프가 끝난다. while과 달리 조건 검사가 <b>뒤</b>에 있다는 점이 핵심."},
    {t:"out", h:"정수를 입력하시오: 10\n정수를 입력하시오: 20\n정수를 입력하시오: 30\n정수를 입력하시오: 0\n숫자들의 합 = 60"}
  ]},
  { id:"c7-6", title:"for 문", en:"for",
    blocks:[
    {t:"p", h:"<b>for</b>는 정해진 횟수만큼 반복할 때 쓴다. <code>for(초기식; 조건식; 증감식)</code> — 세 요소를 한 줄에 모은다."},
    {t:"table", h:`<table><tr><th>요소</th><th>실행 시점</th></tr>
      <tr><td>초기식</td><td>시작 전 <b>한 번만</b></td></tr>
      <tr><td>조건식</td><td>매 반복 <b>전</b>에 검사(거짓이면 종료)</td></tr>
      <tr><td>증감식</td><td>본문 실행이 끝날 <b>때마다</b></td></tr></table>`},
    {t:"code", cap:"팩토리얼", s:R`#include <stdio.h>

int main(void)
{
    long fact = 1;
    int i, n;

    printf("정수를 입력하시요:");
    scanf("%d", &n);

    for (i = 1; i <= n; i++)
        fact = fact * i;

    printf("%d!은 %ld입니다.\n", n, fact);
    return 0;
}`,
     note:"<code>i</code>를 1부터 n까지 늘리며 <code>fact</code>에 계속 곱한다. 1×2×…×n = n!. 결과가 커서 <code>long</code>으로 받고 <code>%ld</code>로 출력한다. 10! = 3628800."},
    {t:"out", h:"정수를 입력하시요: 10\n10!은 3628800입니다."},
    {t:"ex", h:"증감식은 자유롭다: <code>i -= 1</code>(감소), <code>i += 2</code>(2씩), <code>i *= 2</code>(2배씩). <code>for(;;)</code>는 무한 루프, <code>for(i=0, k=0; …)</code>처럼 변수 두 개 초기화도 가능하다."}
  ]},
  { id:"c7-7", title:"중첩 반복문 — 별 그리기", en:"nested loop",
    blocks:[
    {t:"p", h:"반복문 안에 반복문을 넣는 것이 <b>중첩 반복</b>이다. 바깥 루프가 '줄', 안쪽 루프가 '각 줄의 칸'을 담당한다고 생각하면 쉽다."},
    {t:"code", cap:"직각삼각형 별", s:R`#include <stdio.h>

int main(void)
{
    int x, y;
    for (y = 1; y <= 5; y++)       // 줄: 1~5
    {
        for (x = 0; x < y; x++)    // 각 줄에서 y개
            printf("*");
        printf("\n");              // 한 줄 끝나면 줄바꿈
    }
    return 0;
}`,
     note:"바깥 루프가 한 번 돌 때마다 안쪽 루프가 <code>y</code>개의 별을 찍는다. y=1이면 별 1개, y=2이면 2개… 내부 루프가 끝날 때마다 <code>printf(\"\\n\")</code>으로 줄을 바꾼다."},
    {t:"out", h:"*\n**\n***\n****\n*****"},
    {t:"ex", h:"피타고라스 직각삼각형 찾기도 중첩으로: 삼중 for로 a,b,c를 돌며 <code>if(a*a+b*b==c*c)</code>면 출력. 중복을 피하려면 b를 a부터, c를 b부터 시작한다."}
  ]},
  { id:"c7-8", title:"break와 continue", en:"break & continue",
    blocks:[
    {t:"table", h:`<table><tr><th>문</th><th>동작</th></tr>
      <tr><td><b>break</b></td><td>반복문을 <b>즉시 빠져나간다</b></td></tr>
      <tr><td><b>continue</b></td><td>이번 회차의 남은 부분을 건너뛰고 <b>다음 반복으로</b></td></tr></table>`},
    {t:"code", cap:"break — 원금의 10배가 되는 해", s:R`#include <stdio.h>
#define SEED_MONEY 1000000

int main(void)
{
    int year = 0, money = SEED_MONEY;
    while (1)                        // 무한 루프
    {
        year++;
        money += money * 0.30;       // 해마다 30% 수익
        if (money > 10 * SEED_MONEY) // 10배 넘으면
            break;                   // 루프 탈출
    }
    printf("%d", year);
    return 0;
}`,
     note:"<code>while(1)</code>은 조건이 항상 참인 무한 루프다. 목표(10배)를 달성하면 <code>break</code>로 빠져나온다. '조건을 만족할 때까지 돌리기'에 쓰는 패턴이다. 100만 원이 30%씩 늘면 9년 만에 10배를 넘는다."},
    {t:"out", h:"9"},
    {t:"code", cap:"continue — 소문자만 대문자로", s:R`// 소문자를 대문자로 변경한다. Q면 종료.
#include <stdio.h>

int main(void)
{
    char letter;
    while (1)
    {
        printf("소문자를 입력하시오: ");
        scanf(" %c", &letter);
        if (letter == 'Q')
            break;                      // 종료
        if (letter < 'a' || letter > 'z')
            continue;                   // 소문자가 아니면 다시 입력
        letter -= 32;                   // 아스키상 소문자-32 = 대문자
        printf("변환된 대문자는 %c입니다.\n", letter);
    }
    return 0;
}`,
     note:"입력이 'Q'면 <code>break</code>로 끝, 소문자가 아니면 <code>continue</code>로 변환을 건너뛰고 다시 입력받는다. 소문자는 대문자보다 아스키 코드가 32 크므로 <code>-= 32</code>로 대문자가 된다('a'97 → 'A'65)."}
  ]},
  { id:"c7-9", title:"난수와 복리 이자표", en:"rand, compound",
    blocks:[
    {t:"p", h:"<code>rand()</code>는 난수를 만든다(<code>stdlib.h</code> 필요). 그냥 쓰면 실행마다 같은 수가 나오므로, <code>srand(time(NULL))</code>로 시드를 현재 시각으로 바꿔 매번 다르게 한다(<code>time.h</code> 필요)."},
    {t:"code", cap:"복리 이자표 (for)", s:R`#include <stdio.h>
#define RATE 0.07          // 연 7%
#define INVESTMENT 10000000 // 초기 투자금
#define YEARS 10

int main(void)
{
    int i;
    double total = INVESTMENT;

    printf("==============\n");
    printf("연도 원리금\n");
    printf("==============\n");
    for (i = 1; i <= YEARS; i++)
    {
        total = total * (1 + RATE);  // 매년 7% 복리
        printf("%2d%10.1f\n", i, total);
    }
    return 0;
}`,
     note:"해마다 <code>total × 1.07</code>로 갱신하면 복리가 된다. <code>%2d</code>는 '정수를 2칸 폭', <code>%10.1f</code>는 '실수를 10칸 폭·소수점 1자리'로 맞춰 표처럼 정렬한다. 기호 상수로 이율·기간을 한 곳에서 관리한다."},
    {t:"out", h:"==============\n연도 원리금\n==============\n 1 10700000.0\n 2 11449000.0\n ...\n10 19671513.6"}
  ]}
]},

/* =========================== 8장 =========================== */
{ id:"ch8", no:8, title:"함수", color:3,
  summary:"함수 정의·호출, 인수와 매개변수, 반환값, 함수 원형, 라이브러리 함수",
  sections:[
  { id:"c8-1", title:"함수의 개념과 장점", en:"function basics",
    blocks:[
    {t:"p", h:"<b>함수(function)</b>는 입력을 받아 특정 작업을 수행하고 결과를 반환하는 <b>블랙박스(상자)</b>다. 같은 코드가 여러 곳에서 반복될 때, 함수로 묶으면 한 번만 작성하면 된다."},
    {t:"table", h:`<table><tr><th>장점</th><th>설명</th></tr>
      <tr><td>중복 제거</td><td>같은 코드를 하나로 만든다</td></tr>
      <tr><td>재사용</td><td>한번 만든 함수를 다른 프로그램에서도 쓴다</td></tr>
      <tr><td>모듈화</td><td>프로그램을 작은 부품으로 나눠 개발·유지보수가 쉬워진다</td></tr></table>`},
    {t:"key", h:"함수는 ①서로 다른 이름을 가지고 ②특정 작업을 수행하며 ③입력을 받고 결과를 반환할 수 있다. 컴파일러가 미리 제공하는 함수를 <b>라이브러리 함수</b>(printf 등)라 한다."}
  ]},
  { id:"c8-2", title:"함수 정의와 호출", en:"define & call",
    blocks:[
    {t:"p", h:"함수 정의는 <b>반환형 · 함수이름 · 매개변수 · 몸체</b>로 이루어진다. 반환형은 함수가 돌려주는 데이터의 종류, 반환값이 없으면 <code>void</code>."},
    {t:"code", cap:"별 출력 함수", s:R`#include <stdio.h>

void print_stars()     // 반환값 없음(void), 매개변수 없음
{
    for (int i = 0; i < 30; i++)
        printf("*");
}

int main(void)
{
    print_stars();                 // 함수 호출
    printf("\nHello World!\n");
    print_stars();
    printf("\n");
    return 0;
}`,
     note:"<code>print_stars()</code>를 정의해 두고 main에서 <b>두 번 호출</b>했다. 같은 작업(별 30개)을 반복 코드 없이 재사용한다. 함수 이름 뒤 <code>( )</code>로 호출한다."},
    {t:"out", h:"******************************\nHello World!\n******************************"}
  ]},
  { id:"c8-3", title:"인수·매개변수·반환값", en:"argument, parameter, return",
    blocks:[
    {t:"table", h:`<table><tr><th>용어</th><th>뜻</th></tr>
      <tr><td><b>인수</b>(argument)</td><td>호출할 때 함수에 실제로 넘기는 값</td></tr>
      <tr><td><b>매개변수</b>(parameter)</td><td>그 값을 받는, 함수 쪽 변수</td></tr>
      <tr><td><b>반환값</b>(return value)</td><td>함수가 호출한 곳으로 돌려주는 결과 (하나만 가능)</td></tr></table>`},
    {t:"key", h:"인수와 매개변수의 <b>개수와 순서가 일치</b>해야 한다. 반환값은 <code>return 수식;</code> 으로 돌려주며, 여러 개가 아니라 <b>단 하나</b>만 반환할 수 있다."},
    {t:"code", cap:"max — 더 큰 값 반환", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

int max(int x, int y)   // 두 정수를 받아 큰 값을 반환
{
    if (x > y)
        return x;
    else
        return y;
}

int main(void)
{
    int x, y;
    printf("정수를 입력하시오: ");
    scanf("%d", &x);
    printf("정수를 입력하시오: ");
    scanf("%d", &y);

    int larger = max(x, y);   // 반환값을 변수에 담기
    printf("더 큰값은 %d입니다. \n", larger);
    return 0;
}`,
     note:"main에서 넘긴 <code>x, y</code>(인수)가 max의 <code>x, y</code>(매개변수)로 복사된다. max는 큰 값을 <code>return</code>하고, main은 그 반환값을 <code>larger</code>에 받아 출력한다. 10과 35 → 35."},
    {t:"out", h:"정수를 입력하시오: 10\n정수를 입력하시오: 35\n더 큰값은 35입니다."}
  ]},
  { id:"c8-4", title:"여러 함수 조합 — 정수 합", en:"composing functions",
    blocks:[
    {t:"p", h:"작은 함수를 여러 개 만들어 조합하면 main이 간결해진다. '정수를 받는 함수'와 '더하는 함수'를 따로 만들어 쓴다."},
    {t:"code", cap:"get_integer + add", s:R`#include <stdio.h>

int get_integer()      // 정수를 입력받아 반환
{
    int value;
    printf("정수를 입력하시오: ");
    scanf("%d", &value);
    return value;
}

int add(int x, int y)  // 두 수의 합을 반환
{
    return x + y;
}

int main(void)
{
    int x = get_integer();
    int y = get_integer();
    int sum = add(x, y);
    printf("두수의 합은 %d입니다. \n", sum);
    return 0;
}`,
     note:"입력·계산을 각각 함수로 분리했다. main은 '무엇을 하는지'만 읽히고 '어떻게'는 각 함수가 담당한다 — 이것이 모듈화의 이점이다."},
    {t:"out", h:"정수를 입력하시오: 10\n정수를 입력하시오: 20\n두수의 합은 30입니다."}
  ]},
  { id:"c8-5", title:"Lab — 온도 변환기", en:"temperature converter",
    blocks:[
    {t:"p", h:"메뉴를 보여 주고 선택에 따라 섭씨↔화씨를 변환한다. 변환 공식을 <code>C2F</code>, <code>F2C</code> 두 함수로 분리했다."},
    {t:"code", cap:"온도 변환기 전체 코드", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

void printOptions()
{
    printf(" 'c' 섭씨온도에서 화씨온도로 변환\n");
    printf(" 'f' 화씨온도에서 섭씨온도로 변환\n");
    printf(" 'q' 종료\n");
}
double C2F(double c_temp) { return 9.0 / 5.0 * c_temp + 32; }
double F2C(double f_temp) { return (f_temp - 32.0) * 5.0 / 9.0; }

int main(void)
{
    char choice;
    double temp;
    while (1) {
        printOptions();
        printf("메뉴에서 선택하세요.");
        choice = getchar();
        if (choice == 'q') break;
        else if (choice == 'c') {
            printf("섭씨온도: ");
            scanf("%lf", &temp);
            printf("화씨온도: %lf \n", C2F(temp));
        }
        else if (choice == 'f') {
            printf("화씨온도: ");
            scanf("%lf", &temp);
            printf("섭씨온도: %lf \n", F2C(temp));
        }
        getchar();  // 엔터키(남은 \n) 제거용
    }
    return 0;
}`,
     note:"변환 공식을 함수로 빼서 main의 흐름이 단순해졌다. <code>getchar()</code>는 문자 하나를 읽는데, scanf 뒤 입력 버퍼에 남은 엔터키(<code>\\n</code>)를 치우려고 끝에 한 번 더 호출한다. 'q'를 고르면 <code>break</code>로 종료."},
    {t:"out", h:"메뉴에서 선택하세요. f\n화씨온도: 100\n섭씨온도: 37.777778"}
  ]},
  { id:"c8-6", title:"함수 원형(prototype)", en:"function prototype",
    blocks:[
    {t:"p", h:"함수는 호출되기 <b>전에</b> 컴파일러가 그 존재를 알아야 한다. 정의가 main보다 아래에 있으면 오류가 난다. 이를 막으려고 위쪽에 <b>함수 원형</b>을 선언한다."},
    {t:"code", cap:"원형 선언으로 해결", s:R`#include <stdio.h>
double c_to_f(double c_temp);   // ← 함수 원형(선언)

int main(void)
{
    printf("섭씨 %lf도는 화씨 %lf입니다. \n", 36.0, c_to_f(36.0));
    return 0;
}

double c_to_f(double c_temp)    // 실제 정의는 아래에
{
    return 9.0 / 5.0 * c_temp + 32;
}`,
     note:"함수 원형은 <b>함수 헤더 + 세미콜론</b>이다(매개변수 이름은 생략 가능, 타입만 적어도 됨). 컴파일러에게 '이런 이름·매개변수·반환형의 함수가 곧 나온다'고 미리 알려 준다. 정의가 호출보다 위에 있으면 원형이 없어도 되지만, 원형을 쓰는 것이 일반적이다."},
    {t:"out", h:"섭씨 36.000000도는 화씨 96.800000입니다."}
  ]},
  { id:"c8-7", title:"라이브러리 함수 — 난수", en:"rand / srand",
    blocks:[
    {t:"p", h:"<b>라이브러리 함수</b>는 컴파일러가 제공하는 함수다(입출력·수학·문자열·시간 등). <code>rand()</code>는 0~RAND_MAX의 난수를 만든다(<code>stdlib.h</code>)."},
    {t:"code", cap:"동전 던지기 100번", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

int coin_toss(void)       // 0 또는 1 반환
{
    return rand() % 2;
}

int main(void)
{
    int heads = 0, tails = 0;
    srand(time(NULL));     // 시드 설정(실행마다 다르게)

    for (int toss = 0; toss < 100; toss++) {
        if (coin_toss() == 1)
            heads++;
        else
            tails++;
    }
    printf("동전의 앞면: %d \n", heads);
    printf("동전의 뒷면: %d \n", tails);
    return 0;
}`,
     note:"<code>rand() % 2</code>는 0 또는 1 → 앞/뒤. <code>srand(time(NULL))</code>로 현재 시각을 시드로 주지 않으면 실행할 때마다 같은 결과가 나온다. 범위를 1~45로 바꾸면 <code>1 + rand()%45</code> 로 로또 번호도 만들 수 있다."},
    {t:"out", h:"동전의 앞면: 53 \n동전의 뒷면: 47"}
  ]},
  { id:"c8-8", title:"수학 라이브러리 함수", en:"math.h",
    blocks:[
    {t:"p", h:"<code>math.h</code>에는 유용한 수학 함수가 많다."},
    {t:"table", h:`<table><tr><th>함수</th><th>기능</th><th>예</th></tr>
      <tr><td><code>floor(x)</code></td><td>내림</td><td>floor(1.6)=1.0</td></tr>
      <tr><td><code>ceil(x)</code></td><td>올림</td><td>ceil(1.6)=2.0</td></tr>
      <tr><td><code>fabs(x)</code></td><td>실수 절대값</td><td>fabs(-12.0)=12.0</td></tr>
      <tr><td><code>pow(x,y)</code></td><td>거듭제곱 xʸ</td><td>pow(10,3)=1000</td></tr>
      <tr><td><code>sqrt(x)</code></td><td>제곱근</td><td>sqrt(64)=8</td></tr>
      <tr><td><code>sin/cos/tan</code></td><td>삼각함수(라디안)</td><td>sin(π/2)=1</td></tr></table>`},
    {t:"code", cap:"Lab — 나무 높이 측정", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <math.h>
#include <stdio.h>

int main(void)
{
    double height, distance, tree_height, degrees, radians;

    printf("나무와의 길이(단위는 미터): ");
    scanf("%lf", &distance);
    printf("측정자의 키(단위는 미터): ");
    scanf("%lf", &height);
    printf("각도(단위는 도): ");
    scanf("%lf", &degrees);

    radians = degrees * (3.141592 / 180.0);  // 도 → 라디안
    tree_height = tan(radians) * distance + height;
    printf("나무의 높이(단위는 미터): %lf \n", tree_height);
    return 0;
}`,
     note:"나무 높이 H = 측정자 키 + tan(각도) × 거리. C의 삼각함수는 <b>라디안</b>을 쓰므로 <code>도 × π/180</code>으로 변환해야 한다. 거리 4.2m, 키 1.8m, 각도 62° → 약 9.7m."},
    {t:"out", h:"나무와의 길이(단위는 미터): 4.2\n측정자의 키(단위는 미터): 1.8\n각도(단위는 도): 62\n나무의 높이(단위는 미터): 9.699047"}
  ]}
]},

/* =========================== 9장 =========================== */
{ id:"ch9", no:9, title:"함수와 변수", color:4,
  summary:"변수의 범위·생존시간, 지역/전역변수, static·extern, 재귀 호출",
  sections:[
  { id:"c9-1", title:"변수의 속성", en:"variable attributes",
    blocks:[
    {t:"p", h:"변수는 이름·타입·크기·값 외에 세 가지 속성을 더 가진다."},
    {t:"table", h:`<table><tr><th>속성</th><th>뜻</th></tr>
      <tr><td><b>범위</b>(scope)</td><td>변수를 쓸 수 있는 영역(가시성)</td></tr>
      <tr><td><b>생존 시간</b>(lifetime)</td><td>메모리에 존재하는 기간</td></tr>
      <tr><td><b>연결</b>(linkage)</td><td>다른 영역의 변수와 연결되는지</td></tr></table>`}
  ]},
  { id:"c9-2", title:"지역 변수", en:"local variable",
    blocks:[
    {t:"p", h:"<b>지역 변수(local variable)</b>는 블록 <code>{ }</code> 안에 선언되는 변수다. 그 블록 안에서만 쓸 수 있고, 블록이 끝나면 사라진다. 블록에 들어갈 때마다 새로 만들어진다."},
    {t:"code", cap:"블록마다 새로 생성", s:R`#include <stdio.h>

int main(void)
{
    int i;
    for (i = 0; i < 5; i++)
    {
        int temp = 1;   // 매 반복마다 새로 생성·초기화
        printf("temp = %d\n", temp);
        temp++;
    }
    return 0;
}`,
     note:"<code>temp</code>는 for 블록이 돌 때마다 <b>새로 만들어지고 1로 초기화</b>된다. 안에서 <code>temp++</code>를 해도 다음 반복에선 다시 1부터 시작하므로 출력은 모두 'temp = 1'."},
    {t:"out", h:"temp = 1\ntemp = 1\ntemp = 1\ntemp = 1\ntemp = 1"},
    {t:"warn", h:"지역 변수는 초기화하지 않으면 <b>쓰레기 값</b>(의미 없는 값)을 가진다. 반드시 초기화하고 써야 한다."}
  ]},
  { id:"c9-3", title:"매개변수와 call by value", en:"call by value",
    blocks:[
    {t:"p", h:"함수의 매개변수도 일종의 지역 변수다. 다른 점은 호출 시 <b>인수 값으로 초기화</b>된다는 것. C는 <b>값에 의한 호출(call by value)</b>이라, 인수의 '복사본'이 전달된다."},
    {t:"code", cap:"원본은 바뀌지 않는다", s:R`#include <stdio.h>
void inc(int counter);

int main(void)
{
    int i = 10;
    printf("함수 호출전 i=%d\n", i);
    inc(i);                 // i의 값(10)만 복사해 전달
    printf("함수 호출후 i=%d\n", i);
    return 0;
}

void inc(int counter)
{
    counter++;   // 복사본만 증가, 원본 i는 그대로
}`,
     note:"<code>inc(i)</code>는 i의 <b>값 10을 복사</b>해 counter에 넣는다. 함수 안에서 counter를 증가시켜도 main의 i는 영향이 없다 — 복사본을 바꿨을 뿐이기 때문. 이것이 call by value의 핵심이다."},
    {t:"out", h:"함수 호출전 i=10\n함수 호출후 i=10"}
  ]},
  { id:"c9-4", title:"전역 변수", en:"global variable",
    blocks:[
    {t:"p", h:"<b>전역 변수(global variable)</b>는 함수 바깥에 선언되며, 범위가 <b>소스 파일 전체</b>다. 어느 함수에서나 접근할 수 있고, 초기화하지 않아도 자동으로 <b>0</b>으로 시작한다."},
    {t:"code", cap:"전역 변수 공유", s:R`#include <stdio.h>
int A;   // 전역 변수(초기값 0)
int B;

int add()
{
    return A + B;   // 전역 변수를 함수 안에서 사용
}

int main()
{
    int answer;
    A = 5;
    B = 7;
    answer = add();
    printf("%d + %d = %d\n", A, B, answer);
    return 0;
}`,
     note:"<code>A</code>, <code>B</code>는 함수 밖에 있어 main과 add가 공유한다. add는 매개변수 없이도 전역 변수를 직접 읽는다. 전역 변수는 선언만 해도 0으로 초기화된다."},
    {t:"out", h:"5 + 7 = 12"},
    {t:"key", h:"같은 이름의 전역·지역 변수가 있으면, 블록 안에서는 <b>지역 변수가 우선</b>한다. 거의 모든 함수가 쓰는 공통 데이터만 전역으로 두고, 일부만 쓰는 값은 인수로 전달하는 것이 좋다."}
  ]},
  { id:"c9-5", title:"저장 유형 — static", en:"storage class",
    blocks:[
    {t:"p", h:"변수의 생존 기간은 <b>자동 할당</b>(블록 들어갈 때 생성·나올 때 소멸)과 <b>정적 할당</b>(프로그램 내내 유지)으로 나뉜다. 저장 유형 지정자로 조절한다 — <code>auto</code>, <code>register</code>, <code>static</code>, <code>extern</code>."},
    {t:"table", h:`<table><tr><th>지정자</th><th>의미</th></tr>
      <tr><td><code>auto</code></td><td>자동 변수(지역 변수 기본값, 생략 가능)</td></tr>
      <tr><td><code>register</code></td><td>CPU 레지스터에 저장(빠름)</td></tr>
      <tr><td><code>static</code></td><td>정적 변수 — 값이 호출 사이에 유지됨</td></tr>
      <tr><td><code>extern</code></td><td>다른 파일/영역의 전역 변수를 참조</td></tr></table>`},
    {t:"code", cap:"static 지역 변수", s:R`#include <stdio.h>

void sub() {
    static int scount = 0;   // 정적: 호출 사이에 값 유지
    int acount = 0;          // 자동: 매번 0으로 재생성
    printf("scount = %d\t", scount);
    printf("acount = %d\n", acount);
    scount++;
    acount++;
}

int main(void) {
    sub();
    sub();
    sub();
    return 0;
}`,
     note:"<code>acount</code>는 호출마다 0으로 다시 태어나 항상 0이지만, <code>static</code>이 붙은 <code>scount</code>는 <b>딱 한 번 초기화</b>되고 이전 값을 기억한다. 그래서 0 → 1 → 2로 누적된다. 호출 횟수 세기, 한 번만 초기화하기(네트워크 init) 등에 쓴다."},
    {t:"out", h:"scount = 0\tacount = 0\nscount = 1\tacount = 0\nscount = 2\tacount = 0"},
    {t:"ex", h:"은행 계좌 잔고도 static으로: <code>void save(int amount){ static long balance = 0; balance += amount; … }</code> — 함수가 여러 번 호출돼도 balance가 유지되어 누적 잔고를 기억한다."}
  ]},
  { id:"c9-6", title:"재귀 호출 — 팩토리얼", en:"recursion",
    blocks:[
    {t:"p", h:"<b>재귀(recursion)</b>는 함수가 <b>자기 자신을 호출</b>하는 것이다. n! = n × (n−1)! 처럼 '자기보다 작은 문제'로 정의되는 경우에 자연스럽다. 반드시 끝나는 조건(종료 조건)이 있어야 한다."},
    {t:"code", cap:"재귀 팩토리얼", s:R`#include <stdio.h>

long factorial(int n)
{
    printf("factorial(%d)\n", n);
    if (n <= 1) return 1;                 // 종료 조건
    else return n * factorial(n - 1);     // 자기 자신 호출
}

int main(void)
{
    int n;
    printf("정수를 입력하시오:");
    scanf("%d", &n);
    printf("%d!은 %ld입니다.\n", n, factorial(n));
    return 0;
}`,
     note:"<code>factorial(5)</code>는 5 × factorial(4), 그것은 4 × factorial(3)… 이렇게 <code>n&lt;=1</code>이 될 때까지 파고들었다가(①~⑤) 되돌아 나오며 곱을 완성한다. 종료 조건 <code>if(n&lt;=1) return 1</code>이 없으면 무한 재귀로 멈추지 않는다."},
    {t:"out", h:"정수를 입력하시오:5\nfactorial(5)\nfactorial(4)\nfactorial(3)\nfactorial(2)\nfactorial(1)\n5!은 120입니다."}
  ]},
  { id:"c9-7", title:"재귀 — 2진수 출력과 GCD", en:"binary & gcd",
    blocks:[
    {t:"p", h:"C에는 2진수 출력 기능이 없지만 재귀로 구현할 수 있다. 몫으로 먼저 재귀 호출한 뒤 나머지를 출력하면, 2진수 자릿수가 올바른 순서(상위→하위)로 나온다."},
    {t:"code", cap:"2진수 출력", s:R`#include <stdio.h>

void print_binary(int x)
{
    if (x > 0)
    {
        print_binary(x / 2);   // 먼저 상위 자리로 재귀
        printf("%d", x % 2);   // 그 다음 현재 자리 출력
    }
}

int main(void)
{
    print_binary(9);   // 1001
    return 0;
}`,
     note:"<code>print_binary(x/2)</code>를 먼저 부르므로 가장 깊은(=최상위 비트) 호출이 먼저 출력된다. 9 → 4 → 2 → 1 순으로 파고든 뒤 되돌아 나오며 1,0,0,1을 출력해 '1001'이 된다."},
    {t:"out", h:"1001"},
    {t:"code", cap:"재귀 최대공약수(유클리드)", s:R`#include <stdio.h>

int gcd(int x, int y)
{
    if (y == 0)
        return x;                // 종료 조건
    else
        return gcd(y, x % y);    // y와 (x%y)의 GCD로 축소
}

int main(void)
{
    printf("%d\n", gcd(30, 20));
    return 0;
}`,
     note:"x와 y의 GCD는 y와 (x%y)의 GCD와 같다는 성질을 그대로 재귀로 옮겼다. gcd(30,20) → gcd(20,10) → gcd(10,0) → 10. y가 0이 되는 순간의 x가 답이다. 7장의 while 버전과 같은 알고리즘을 재귀로 표현한 것."},
    {t:"out", h:"10"}
  ]},
  { id:"c9-8", title:"하노이의 탑", en:"Tower of Hanoi",
    blocks:[
    {t:"p", h:"막대 A의 원판 n개를 막대 C로 옮기는 문제. 규칙: ①한 번에 한 개 ②맨 위 원판만 ③작은 원판 위에 큰 원판 불가. 재귀로 우아하게 풀린다."},
    {t:"key", h:"핵심 아이디어: ①위쪽 n−1개를 (C를 경유해) B로 옮기고 → ②맨 아래 원판을 C로 옮긴 뒤 → ③B의 n−1개를 (A를 경유해) C로 옮긴다. 각 'n−1개 옮기기'가 다시 같은 문제라 재귀가 된다."},
    {t:"code", cap:"하노이의 탑 전체 코드", s:R`#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>

void hanoi_tower(int n, char from, char tmp, char to);

int main(void)
{
    hanoi_tower(3, 'A', 'B', 'C');   // 원판 3개를 A에서 C로
    return 0;
}

// from의 원판 n개를 tmp를 거쳐 to로 옮긴다
void hanoi_tower(int n, char from, char tmp, char to)
{
    if (n == 1)
        printf("원판 1을 %c에서 %c으로 옮긴다.\n", from, to);
    else
    {
        hanoi_tower(n - 1, from, to, tmp);   // ① n-1개를 B로
        printf("원판 %d을 %c에서 %c으로 옮긴다.\n", n, from, to); // ② 큰 원판
        hanoi_tower(n - 1, tmp, from, to);   // ③ n-1개를 C로
    }
}`,
     note:"<code>n==1</code>이면 그냥 옮기면 되고(종료 조건), 아니면 '위 n−1개 옮기기 → 큰 원판 옮기기 → 다시 n−1개 옮기기' 세 단계로 쪼갠다. 매개변수의 <code>from/tmp/to</code> 자리를 바꿔 호출하는 것이 묘미다. 원판 3개면 총 7번 이동한다(2ⁿ−1)."},
    {t:"out", h:"원판 1을 A에서 C으로 옮긴다.\n원판 2을 A에서 B으로 옮긴다.\n원판 1을 C에서 B으로 옮긴다.\n원판 3을 A에서 C으로 옮긴다.\n원판 1을 B에서 A으로 옮긴다.\n원판 2을 B에서 C으로 옮긴다.\n원판 1을 A에서 C으로 옮긴다."}
  ]}
]}

/*__END__*/
];
