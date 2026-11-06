// 술술 코스: 유닛마다 표현 6개 + 실전 대본(상대 말 → 내가 할 말).
// 표현은 짧고 실제로 바로 쓰는 문장만. ko는 자연스러운 뜻.
const UNITS = [
  {
    id: "hello", title: "인사와 자기소개", scene: "intro", color: "#0b6e5b",
    phrases: [
      ["Hi, I'm Chang. Nice to meet you.", "안녕, 나는 창이야. 만나서 반가워."],
      ["I'm a college student.", "나는 대학생이야."],
      ["I study computer science.", "나는 컴퓨터공학을 공부해."],
      ["I'm from Seoul, Korea.", "나는 한국 서울에서 왔어."],
      ["What do you do for fun?", "넌 쉴 때 뭐 해?"],
      ["I'm really into games these days.", "요즘 게임에 푹 빠져 있어."]
    ],
    talk: [
      ["Hi there! I don't think we've met. I'm Sara.", 0],
      ["Nice to meet you too! Are you a student?", 1],
      ["Cool. What do you study?", 2],
      ["Nice. So what do you do for fun?", 5]
    ]
  },
  {
    id: "cafe", title: "카페에서 주문", scene: "cafe", color: "#9a5a00",
    phrases: [
      ["Can I get an iced americano?", "아이스 아메리카노 하나 주세요."],
      ["A large one, please.", "큰 걸로 주세요."],
      ["To go, please.", "가져갈게요."],
      ["How much is it?", "얼마예요?"],
      ["Can I pay by card?", "카드로 계산해도 돼요?"],
      ["Could I get a receipt?", "영수증 주실 수 있어요?"]
    ],
    talk: [
      ["Hi! What can I get for you?", 0],
      ["Sure. What size would you like?", 1],
      ["For here or to go?", 2],
      ["That's four fifty. Cash or card?", 4]
    ]
  },
  {
    id: "pron", title: "혀 꼬이는 단어", pron: true, color: "#0f2a26",
    stages: [["묵음", "소리 없는 글자"], ["외래어", "외래어와 달라요"], ["강세", "세게 읽는 곳"], ["음절", "박자 수"]]
  },
  {
    id: "way", title: "길 묻기", scene: "street", color: "#0b6e5b",
    phrases: [
      ["Excuse me, how do I get to the station?", "실례지만 역에 어떻게 가요?"],
      ["Is it far from here?", "여기서 멀어요?"],
      ["Go straight and turn left.", "쭉 가다가 왼쪽으로 도세요."],
      ["It's on your right.", "오른쪽에 있어요."],
      ["How long does it take on foot?", "걸어서 얼마나 걸려요?"],
      ["Thanks, that really helps.", "고마워요, 정말 도움 됐어요."]
    ],
    talk: [
      ["Hi, you look a little lost. Can I help?", 0],
      ["The station? Sure, it's not too far.", 4],
      ["About ten minutes. Go straight and turn left at the bank.", 5],
      ["No problem. Have a good day!", 5]
    ]
  },
  {
    id: "day", title: "내 하루 말하기", scene: "me", color: "#9a5a00",
    phrases: [
      ["I woke up late today.", "오늘 늦잠 잤어."],
      ["I had a lot of homework.", "과제가 많았어."],
      ["It took longer than I thought.", "생각보다 오래 걸렸어."],
      ["I ended up staying home.", "결국 집에 있었어."],
      ["I was about to call you.", "막 너한테 전화하려던 참이었어."],
      ["I'm going to finish it tomorrow.", "내일 끝낼 거야."]
    ],
    talk: [
      ["Hey! How was your day?", 0],
      ["Oh no. Did you get your work done?", 2],
      ["So what did you do after that?", 3],
      ["Sounds tiring. What's your plan?", 5]
    ]
  },
  {
    id: "clinic", title: "병원·약국", scene: "clinic", color: "#0b6e5b",
    phrases: [
      ["I'd like to make an appointment.", "진료 예약하고 싶어요."],
      ["I have a bad headache.", "머리가 많이 아파요."],
      ["I've had a fever since yesterday.", "어제부터 열이 나요."],
      ["Do I need a prescription?", "처방전이 필요한가요?"],
      ["How often should I take this?", "이건 얼마나 자주 먹어야 해요?"],
      ["Is there anything I should avoid?", "피해야 할 게 있나요?"]
    ],
    talk: [
      ["Good morning. How can I help you?", 0],
      ["Sure. What seems to be the problem?", 1],
      ["I see. How long have you felt this way?", 2],
      ["Take this medicine after meals. Any other questions?", 4]
    ]
  },
  {
    id: "airport", title: "공항·호텔", scene: "airport", color: "#9a5a00",
    phrases: [
      ["I'd like to check in, please.", "체크인하고 싶어요."],
      ["Could I get an aisle seat?", "통로 쪽 자리로 주실 수 있어요?"],
      ["How many bags can I check?", "가방은 몇 개까지 부칠 수 있어요?"],
      ["What time does boarding start?", "탑승은 몇 시에 시작해요?"],
      ["I have a reservation under Kim.", "김으로 예약했어요."],
      ["Could I check out a little late?", "조금 늦게 체크아웃해도 될까요?"]
    ],
    talk: [
      ["Good evening. Checking in?", 0],
      ["Window or aisle?", 1],
      ["Any bags to check today?", 2],
      ["Here's your boarding pass. Have a nice flight!", 3]
    ]
  }
];
// 타래 하나 = 매듭 6개: 새 구슬(표현) 둘, 귀로·꿰기·입으로 풀기, 마지막 말 걸기(실전)
const STAGES = [
  { k: "meet1", name: "새 구슬 1", icon: "sparkle" },
  { k: "meet2", name: "새 구슬 2", icon: "sparkle" },
  { k: "listen", name: "귀로 풀기", icon: "headphones" },
  { k: "build", name: "구슬 꿰기", icon: "puzzle-piece" },
  { k: "speak", name: "입으로 풀기", icon: "microphone" },
  { k: "boss", name: "말 걸기", icon: "chats-circle" }
];
