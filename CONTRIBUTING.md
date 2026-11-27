# 창업실 고치는 법

이 저장소는 GitHub Pages가 그대로 내보내는 정적 사이트예요. 빌드 단계가 없어서 파일을 고쳐 `main`에 올리면 1분쯤 뒤 https://tkdgh123.github.io/ 에 반영돼요. 프레임워크 없이 HTML, CSS, JS로 썼고 작품 폴더끼리는 서로 기대지 않아요. 고치고 싶은 작품이 있으면 그 폴더만 열면 돼요.

## 내 컴퓨터에서 띄우기

```sh
python -m http.server 8000
```

그다음 http://localhost:8000/ 을 열어요. 파일을 더블클릭해서 열면(`file://`) fetch와 모듈 import가 막혀서 몇몇 페이지가 비어 보여요.

GitHub Pages는 응답을 10분 동안 캐시해요. 올린 뒤에도 옛 화면이 보이면 Ctrl+Shift+R로 새로고침하거나 주소 끝에 `?v=2`를 붙여 봐요.

## 어디에 무엇이 있나

| 자리 | 하는 일 |
|---|---|
| `index.html` | 첫 화면. 분류 방, 작품 고리, 전체 목록, 찾기가 이 파일 하나에 있어요. 작품 목록은 안에 있는 `W` 배열이에요. |
| `hub/back.js` | 모든 작품 페이지 왼쪽 아래에 붙는 "창업실" 돌아가기 단추 |
| `hub/shots/` | 첫 화면 카드 그림(1280×800 webp) |
| `about/` | 만든 사람 소개 |
| `lock/`, `sw.js`, `.github/lock_sync.py` | 비공개 페이지 잠금(아래 "잠금" 칸) |
| `study.html`과 루트의 `notes.js`, `quiz.js`, `hw.js`, `cmini.js`, `labfc.js`, `newfc.js`, `vsedit.js` | C언어 복습 노트. `quiz.js`는 `jobmap/`도 같이 써요. |
| `game-fx.js` | 데칼코마니(`decal/`)와 뒤집기 도장(`stamp/`)이 같이 쓰는 효과음, 흔들림 |
| `icons.js` | 외부 라이브러리 AnimateIcons(MIT) 압축본. `ai.html`, `daily/`가 움직이는 아이콘에 써요. 직접 고치지 않아요. |
| 그 밖의 폴더 | 작품 하나에 폴더 하나 |

시험 코드가 있는 작품은 `jobmap/tests/`, `billiards/tests/`, `boardgames/test/`, `secure-msg/code/src/tests/`, `ffb-wheel/godot/tests/`예요.

## 새 작품 올리기

1. 폴더를 만들고 `index.html`을 둬요.
2. 페이지 `</body>` 바로 앞에 돌아가기 단추를 넣어요. `data-cat`은 돌아갈 분류 방이에요(`game`, `study`, `make`, `etc`).
   ```html
   <script src="../hub/back.js" data-cat="game" defer></script>
   ```
3. 카드 그림을 `hub/shots/<이름>.webp`(1280×800)로 넣어요.
4. `index.html`의 `W` 배열 맨 앞쪽, 같은 분류 자리에 한 줄을 더해요.
   ```js
   ["게임", "제목", "11.28", "폴더/", "hub/shots/이름.webp", "한 줄 설명", "쓴 기술", 0, "첫 단추 글자", [["더 보기 글자", "폴더/sub/"]]],
   ```
   칸 순서는 분류("게임", "공부", "프로젝트", "기타"), 제목, 처음 올린 날("MM.DD"), 주소, 카드 그림, 한 줄 설명, 쓴 기술, 잠금(0이나 1), 첫 단추 글자, 더 보기 링크예요.
   한 작품은 꼭 한 줄로 쓰고 문자열은 큰따옴표로 감싸요. 잠금 도구(`lock_sync.py`)가 이 줄들을 한 줄씩 JSON으로 읽어서 잠긴 카드를 바꿔 끼우기 때문에, 줄을 나누거나 작은따옴표를 쓰면 잠금이 깨져요. 잠금 칸은 Actions가 알아서 맞추니 새 작품은 0으로 두면 돼요.
5. 처음 오는 사람에게 먼저 보이게 하려면 `PICK`에 `["폴더/", "상태 · 함께"]`를 더해요.
6. 찾기는 `W`를 읽어서 만들어서 따로 할 일이 없어요.

## 잠금

공개 저장소지만 일부 페이지는 암호문으로만 올라가요. 평문은 저장소 어디에도, 커밋 기록에도 없어요.

- 비밀번호는 세 단계(비밀번호, 질문 답, 점 순서)예요. 셋을 이어 PBKDF2(SHA-256, 60만 번)로 AES-GCM 열쇠를 만들어요. 소금, 반복 횟수, 질문은 `lock/list.json`에 있어요.
- 잠긴 파일은 `lock/f/<무작위 이름>.enc`에 있어요. 어떤 경로가 어떤 이름인지는 `lock/files.enc`, 첫 화면의 진짜 카드는 `lock/hub.enc`에 따로 암호화돼 있어요. 열쇠가 없으면 무엇이 잠겼는지도 알 수 없어요.
- 잠긴 페이지 주소로 가면 잠금 화면(`lock/gate.html`, `lock/gate.js`)이 떠요. 세 단계가 맞으면 꺼낼 수 없는 형태의 열쇠를 그 기기 IndexedDB에 넣고 `sw.js`를 등록해요. 그 뒤로는 서비스 워커가 암호문을 받아 풀어서 보여 줘요.
- 잠글 페이지는 https://tkdgh123.github.io/lock/ 에서 골라요. 저장하면 세 단계를 다시 입력해 요청에 서명하고, GitHub Actions(`.github/workflows/lock.yml`)가 저장소 비밀값 `LOCK_PASSWORD`로 서명을 확인한 뒤 `lock_sync.py`로 잠그고 풀어서 커밋해요.
- 잠금 단위는 맨 위 폴더나 맨 위 html 파일 하나예요. 하위 폴더만 따로 잠글 수는 없어요.
- `index.html`, `sw.js`, `hub/`, `lock/`, `vault/`와 자체 서비스 워커를 쓰는 `uridal/`, `urigil/`은 잠그지 않아요.
- 잠긴 페이지는 이 저장소에서 고칠 수 없어요. 평문 원본이 관리자 컴퓨터에만 있어요. 여기에 평문을 커밋하면 기록에 영원히 남으니 하지 말아 주세요.
- 한글을 받는 입력 칸에는 `type="password"`를 쓰지 않아요. 윈도우 크롬이 그 칸에서 한글 입력을 꺼 버려요. `type="text"`에 `-webkit-text-security: disc`로 가려요.

## 외부 서비스

| 서비스 | 쓰는 작품 |
|---|---|
| Firebase `changupsil-board` | 자유게시판(`board/`), 옷 공부(`fashion/`), 프롬프트 연습 통계(`prompt/`) |
| Firebase `changupsil-games` | 데칼코마니 랭킹(`decal/`), 보드게임방(`boardgames/`) |
| Firebase `uridal-43133` | 우리달(`uridal/`), 우리길(`urigil/`) |
| Supabase | 데칼코마니 점수 검증. 무료 프로젝트가 잠들지 않게 `.github/workflows/supabase-keepalive.yml`이 사흘마다 깨워요. |

코드에 보이는 Firebase `apiKey`는 브라우저에 공개하라고 만든 값이에요. 누가 무엇을 읽고 쓸지는 각 Firebase 프로젝트의 보안 규칙이 막아요.

## 느려지지 않게 쓰는 법

2026년 11월 28일 첫 화면이 끊겨서 원인을 재 보고 고친 규칙이에요.

- `requestAnimationFrame` 반복은 움직일 게 없으면 멈추고, 입력이 오면 다시 시작해요. 첫 화면의 `wake()`와 `frame()`이 예시예요.
- 매 프레임 바뀌는 값은 CSS 변수(`--x`) 대신 그 요소의 `style.transform`, `style.opacity`에 바로 써요. 부모에 둔 CSS 변수를 바꾸면 자식 요소 스타일까지 전부 다시 계산해요. 고치기 전 첫 화면은 멈춰 있을 때도 CPU를 1초에 290ms씩 썼어요.
- 애니메이션은 `transform`과 `opacity`만 움직여요. `box-shadow`, `filter`, 화면 전체를 덮는 `mix-blend-mode`는 매 프레임 다시 칠해요.
- `setInterval`로 `getBoundingClientRect`, `elementsFromPoint` 같은 화면 재기를 계속 돌리지 않아요. 크기가 바뀔 때, 누를 때처럼 필요한 순간에만 재요.
- 서비스 워커는 요청마다 IndexedDB를 열지 않게 열쇠를 한 번 꺼내 두고 써요.

## 커밋

- 같은 저장소에서 여러 작업이 동시에 돌아갈 때가 있어요. 남이 스테이징해 둔 파일이 섞이지 않게 `git commit -- <내 파일들>`처럼 경로를 적어서 커밋해요.
- 커밋 메시지는 "작품 이름: 무엇을 왜 바꿨는지" 한 줄로 써요.
