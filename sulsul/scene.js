// 하루 살기: 영어로 사는 이틀. 장면마다 그림 위에서 엿듣기 → 내 차례 → 수첩.
// 덩어리(chunk) = [영어, 뜻, 왜 이렇게 말하는지]
const CAFE = {
  who: "Leo", whoKo: "바리스타", pos: "62% 50%", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
  // 움직이는 겹: 바리스타를 지운 배경 + 팔 없는 몸(숨 쉬듯) + 팔 한 층(카운터 위 팔꿈치 축으로 인사) + 앞 카운터 선반·메뉴판. 좌표는 원본 2752×1536 기준
  layers: { w: 2752, h: 1536, plate: "img/scenes/cafe/plate.webp", box: [1560, 340, 430, 455], body: "img/scenes/cafe/body.png", hand: "img/scenes/cafe/hand.png", pivot: [1630, 720], front: [["img/scenes/cafe/counter.png", 1560, 716, 90, 54], ["img/scenes/cafe/menu.png", 1800, 652, 172, 144]],
    // 배경도 살짝: 햇살이 밝아졌다 흐려지고, 화분이 흔들리고, 김이 피어오른다 (Gemini로 각각 지운·더한 그림에서 떼어 냄)
    amb: [["img/scenes/cafe/light.webp", 0, 1, 2094, 1207, "glow"], ["img/scenes/cafe/plant.png", 570, 672, 224, 392, "sway"], ["img/scenes/cafe/steam.png", 1106, 0, 558, 479, "steam"]] },
  overhear: [
    ["them", "Next, please! Hi there, what can I get for you?"],
    ["guest", "Hi, can I get a hot latte, please?", [["can I get", "~ 주세요", "주문할 때 가장 흔한 말이에요. Give me보다 부드러워요."]]],
    ["them", "Sure. What size?"],
    ["guest", "A small one, please.", [["a small one", "작은 거", "one은 앞에서 말한 라테를 가리켜요. 같은 말을 또 하지 않아도 돼요."]]],
    ["them", "For here or to go?", [["for here or to go", "드시고 가세요, 가져가세요?", "카페에서 꼭 나오는 질문이에요. 대답은 For here / To go 한 마디면 돼요."]]],
    ["guest", "To go, please."],
    ["them", "That's four fifty. Here's your receipt.", [["four fifty", "4달러 50센트", "가격은 숫자를 둘로 끊어 읽어요."], ["receipt", "영수증", "p는 소리 없어요. '리싯'에 가까워요."]]]
  ],
  turns: [
    { say: "Good morning! What can I get for you?", want: "아이스 아메리카노 하나 주문하기", need: [["아메리카노", ["americano"]]], hint: ["Can I get ~?", "Can I get an…", "Can I get an iced americano, please?"], model: "Can I get an iced americano, please?" },
    { say: "Sure! What size would you like?", want: "큰 걸로 달라고 하기", need: [["큰 것", ["large", "big", "grande", "venti"]]], hint: ["a ___ one", "A large…", "A large one, please."], model: "A large one, please." },
    { say: "For here or to go?", want: "가져갈 거라고 말하기", need: [["가져가기", ["to go", "take out", "takeout", "take it", "take away", "takeaway"]]], hint: ["To ~, please.", "To go…", "To go, please."], model: "To go, please." },
    { say: "That's five twenty. Cash or card?", want: "카드로 낸다고 하기", need: [["카드", ["card"]]], hint: ["Can I pay by ~?", "Can I pay…", "Can I pay by card?"], model: "Can I pay by card?" },
    { say: "Here you go! Would you like the receipt?", want: "영수증은 괜찮다고 거절하기", need: [["거절", ["no", "i'm good", "im good", "i'm fine", "im fine", "that's ok", "thats ok", "it's okay", "its okay", "nope"]]], hint: ["I'm ~, thanks.", "No, I'm…", "No, I'm good. Thanks!"], model: "No, I'm good. Thanks!", chunk: ["I'm good", "괜찮아요 (거절)", "No thanks보다 가볍고 자연스러운 거절이에요."] }
  ]
};
const AIRPORT = {
  who: "Officer Reed", whoKo: "입국 심사관", pos: "55% 50%", voices: { them: "m2", guest: "f" }, guestKo: "다음 여행객",
  layers: { w: 2752, h: 1536, box: [1263, 501, 264, 302], body: "img/scenes/airport/body.png" },
  turns: [
    { say: "Good morning. May I see your passport, please?", want: "여권을 건네며 '여기 있어요' 하기", need: [["건네기", ["here you go", "here it is", "here's my passport", "here is my passport", "here you are", "sure"]]], hint: ["Here you ~.", "Sure, here you…", "Sure, here you go."], model: "Sure, here you go.", chunk: ["Here you go", "여기 있어요 (건넬 때)", "물건을 건넬 때 가장 흔한 말이에요."] },
    { say: "What's the purpose of your visit?", want: "여행 왔다고 말하기", need: [["여행", ["trip", "travel", "traveling", "travelling", "vacation", "holiday", "sightseeing", "tourism", "tourist"]]], hint: ["I'm here for a ~.", "I'm here for a…", "I'm here for a one-week trip."], model: "I'm here for a one-week trip." },
    { say: "How long will you be staying?", want: "일주일 있을 거라고 말하기", need: [["일주일", ["week", "seven days", "7 days"]]], hint: ["For a ~.", "For a…", "For a week."], model: "For a week." },
    { say: "And where will you be staying?", want: "시내 호텔에 묵는다고 말하기", need: [["호텔", ["hotel"]]], hint: ["At a ~.", "At a hotel…", "At a hotel downtown."], model: "At a hotel downtown." },
    { say: "Alright, you're all set. Enjoy your stay!", want: "고맙다고 인사하기", need: [["고마움", ["thank", "thanks"]]], hint: ["Thank ~!", "Thank you…", "Thank you so much!"], model: "Thank you so much!" }
  ],
  overhear: [
    ["them", "Next, please. Passport?"],
    ["guest", "Here you go."],
    ["them", "What brings you here?", [["What brings you here?", "여긴 무슨 일로 오셨어요?", "Why are you here?보다 부드러운 질문이에요."]]],
    ["guest", "I'm here on business.", [["on business", "출장으로", "여행이면 on vacation, 일이면 on business라고 해요."]]],
    ["them", "How long are you staying?"],
    ["guest", "Just three days."],
    ["them", "Enjoy your stay.", [["Enjoy your stay", "좋은 시간 보내세요", "공항과 호텔에서 자주 듣는 인사예요."]]]
  ]
};
const WAY = {
  who: "Tom", whoKo: "지나가던 사람", pos: "50% 50%", voices: { them: "m", guest: "f2" }, guestKo: "다른 여행객",
  layers: { w: 2752, h: 1536, box: [1188, 518, 320, 664], body: "img/scenes/way/body.png" },
  turns: [
    { say: "Hi! You look a little lost. Need some help?", want: "역에 어떻게 가는지 묻기", need: [["역", ["station"]], ["가는 법", ["how", "where", "way", "get to"]]], hint: ["How do I get to ~?", "How do I get to the…", "How do I get to the station?"], model: "Yes! How do I get to the station?", chunk: ["How do I get to ~?", "~에 어떻게 가요?", "길 물을 때 가장 기본이 되는 말이에요."] },
    { say: "Sure. Go straight and turn left at the bank.", want: "여기서 먼지 묻기", need: [["먼지", ["far"]]], hint: ["Is it ~ from here?", "Is it far…", "Is it far from here?"], model: "Is it far from here?" },
    { say: "Not really. About ten minutes on foot.", want: "그럼 걸어가겠다고 말하기", need: [["걷기", ["walk", "walking", "on foot"]]], hint: ["I'll ~ then.", "Great, I'll walk…", "Great, I'll walk then."], model: "Great, I'll walk then." },
    { say: "It's on your right, next to a café. You can't miss it.", want: "정말 도움이 됐다고 고마워하기", need: [["고마움", ["thank", "thanks", "appreciate"]]], hint: ["Thanks, that really ~.", "Thanks, that really…", "Thanks, that really helps."], model: "Thanks, that really helps." }
  ],
  overhear: [
    ["guest", "Excuse me, is there a pharmacy near here?", [["Excuse me", "실례합니다", "모르는 사람에게 말을 걸 때 첫마디예요."], ["near here", "이 근처에", "around here라고 해도 돼요."]]],
    ["them", "Yes, just around the corner.", [["around the corner", "모퉁이만 돌면", "아주 가깝다는 뜻이에요."]]],
    ["guest", "Around the corner? Great, thanks!"],
    ["them", "No problem."]
  ]
};
const HOTEL = {
  who: "Emma", whoKo: "호텔 직원", pos: "50% 50%", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
  layers: { w: 2752, h: 1536, box: [1271, 488, 227, 280], body: "img/scenes/hotel/body.png" },
  turns: [
    { say: "Hi, welcome! Are you checking in?", want: "네, 김으로 예약했다고 말하기", need: [["예약", ["reservation", "booked", "booking"]]], hint: ["I have a reservation under ~.", "I have a reservation…", "Yes, I have a reservation under Kim."], model: "Yes, I have a reservation under Kim.", chunk: ["under Kim", "김이라는 이름으로", "예약한 이름을 말할 때 under를 써요."] },
    { say: "Great. Could I see your ID, please?", want: "여권을 건네기", need: [["건네기", ["here", "passport", "sure"]]], hint: ["Sure, here's my ~.", "Sure, here's my…", "Sure, here's my passport."], model: "Sure, here's my passport." },
    { say: "Thank you. You're in room 512. Breakfast is from seven to ten.", want: "와이파이 비밀번호 묻기", need: [["와이파이", ["wifi", "wi fi", "wi-fi", "internet"]]], hint: ["What's the ~ password?", "What's the Wi-Fi…", "What's the Wi-Fi password?"], model: "What's the Wi-Fi password?" },
    { say: "It's on your key card. Anything else?", want: "조금 늦게 체크아웃해도 되는지 묻기", need: [["늦게", ["late", "later"]], ["체크아웃", ["check out", "checkout"]]], hint: ["Could I ~ a little late?", "Could I check out…", "Could I check out a little late?"], model: "Could I check out a little late?" },
    { say: "Sure, one o'clock is fine.", want: "좋다고 고마워하기", need: [["고마움", ["thank", "thanks", "perfect", "great"]]], hint: ["~, thank you!", "Perfect, thank…", "Perfect, thank you!"], model: "Perfect, thank you!" }
  ],
  overhear: [
    ["guest", "Hi, I'd like to check in, please.", [["I'd like to", "~하고 싶어요", "I want to보다 공손해요."]]],
    ["them", "Sure. May I have your name?"],
    ["guest", "It's Lee. L-E-E.", [["L-E-E", "철자 불러 주기", "이름은 철자를 불러 주면 실수가 없어요."]]],
    ["them", "Here's your key card. Enjoy your stay!", [["key card", "카드 열쇠", "호텔 방 열쇠를 이렇게 불러요."]]]
  ]
};
const DINNER = {
  who: "Sam", whoKo: "식당 직원", pos: "50% 50%", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
  layers: { w: 2752, h: 1536, box: [1139, 360, 527, 808], body: "img/scenes/dinner/body.png" },
  turns: [
    { say: "Good evening! Table for one?", want: "네, 혼자라고 말하기", need: [["혼자", ["one", "just me", "myself", "yes", "yeah", "yep"]]], hint: ["Yes, just ~.", "Yes, just…", "Yes, just me."], model: "Yes, just me." },
    { say: "Here's the menu. Are you ready to order?", want: "뭘 추천하는지 묻기", need: [["추천", ["recommend", "recommendation", "popular", "best", "good here"]]], hint: ["What do you ~?", "What do you…", "What do you recommend?"], model: "What do you recommend?", chunk: ["What do you recommend?", "뭘 추천하세요?", "메뉴를 모를 때 가장 쓸모 있는 말이에요."] },
    { say: "The spicy chicken pasta is really popular.", want: "그걸로 하되 덜 맵게 해 달라고 하기", need: [["덜 맵게", ["less spicy", "not too spicy", "not spicy", "mild", "less hot"]]], hint: ["Could I get that, but ~?", "Could I get that, but less…", "Could I get that, but less spicy?"], model: "Could I get that, but less spicy?" },
    { say: "Sure! Anything to drink?", want: "물만 달라고 하기", need: [["물", ["water"]]], hint: ["Just ~, please.", "Just water…", "Just water, please."], model: "Just water, please." },
    { say: "How was everything?", want: "맛있었다고, 남은 걸 싸 달라고 하기", need: [["포장", ["box", "to go", "take", "wrap", "pack"]]], hint: ["Could I get a ~ for this?", "It was great! Could I get a…", "It was great! Could I get a box for this?"], model: "It was great! Could I get a box for this?", chunk: ["a box", "포장 용기", "남은 음식을 싸 달라고 할 때 box라고 해요."] }
  ],
  overhear: [
    ["guest", "Excuse me, could we get the check, please?", [["the check", "계산서", "식당에서 계산서는 bill보다 check를 더 많이 써요."]]],
    ["them", "Of course. Together or separate?", [["separate", "따로따로", "각자 계산할 때 Separate, please."]]],
    ["guest", "Separate, please."],
    ["them", "No problem. I'll be right back.", [["I'll be right back", "금방 올게요", "잠깐 자리를 비울 때 쓰는 말이에요."]]]
  ]
};
const MEETUP = {
  who: "Sara", whoKo: "모임에서 처음 만난 사람", pos: "50% 50%", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
  layers: { w: 2752, h: 1536, box: [1265, 511, 295, 644], body: "img/scenes/meetup/body.png" },
  turns: [
    { say: "Hi! I don't think we've met. I'm Sara.", want: "반갑다고 하고 내 이름 말하기", need: [["내 소개", ["i'm", "i am", "my name"]]], hint: ["Hi Sara, I'm ~. Nice to meet you.", "Hi Sara, I'm…", "Hi Sara, I'm {name}. Nice to meet you."], model: "Hi Sara, I'm {name}. Nice to meet you." },
    { say: "Nice to meet you too! So, what do you do?", want: "대학생이고 컴퓨터를 공부한다고 말하기", need: [["학생·공부", ["student", "study", "studying", "college", "university", "major"]]], hint: ["I'm a ~. I study ~.", "I'm a college student…", "I'm a college student. I study computer science."], model: "I'm a college student. I study computer science." },
    { say: "Oh, cool! What do you do for fun?", want: "요즘 게임에 푹 빠져 있다고 말하기", need: [["빠져 있다", ["into", "love", "like", "enjoy", "obsessed"]]], hint: ["I'm really ~ games these days.", "I'm really into…", "I'm really into games these days."], model: "I'm really into games these days.", chunk: ["be into ~", "~에 빠져 있다", "like보다 '요즘 푹 빠졌다'는 느낌이에요."] },
    { say: "No way, me too! We should play sometime.", want: "좋다고, 연락처 물어보기", need: [["연락처", ["number", "contact", "instagram", "insta", "kakao", "discord"]]], hint: ["Sounds good! Can I get your ~?", "Sounds good! Can I get your…", "Sounds good! Can I get your number?"], model: "Sounds good! Can I get your number?" }
  ],
  overhear: [
    ["them", "So, where are you from?"],
    ["guest", "I'm from Toronto. How about you?", [["How about you?", "너는?", "질문을 상대에게 돌려줄 때 써요."]]],
    ["them", "I grew up in Busan.", [["grew up in", "~에서 자랐어요", "고향을 말할 때 자연스러운 말이에요."]]],
    ["guest", "Oh, I've always wanted to go there!", [["I've always wanted to", "늘 ~하고 싶었어요", "관심을 보일 때 좋은 말이에요."]]]
  ]
};
const PHARMACY = {
  who: "Grace", whoKo: "약사", pos: "50% 50%", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
  layers: { w: 2752, h: 1536, box: [1242, 472, 281, 345], body: "img/scenes/pharmacy/body.png" },
  turns: [
    { say: "Hi there. What can I help you with?", want: "머리가 많이 아프다고 말하기", need: [["두통", ["headache", "head hurts", "head is killing", "my head"]]], hint: ["I have a bad ~.", "I have a bad…", "I have a bad headache."], model: "I have a bad headache." },
    { say: "Oh no. How long have you had it?", want: "어제부터라고 말하기", need: [["어제부터", ["yesterday"]]], hint: ["Since ~.", "Since…", "Since yesterday."], model: "Since yesterday.", chunk: ["since yesterday", "어제부터", "언제부터 계속됐는지는 since로 말해요."] },
    { say: "Are you allergic to anything?", want: "알레르기는 없다고 말하기", need: [["없다", ["no", "not", "none", "don't", "nothing"]]], hint: ["No, I'm not allergic to ~.", "No, I'm not…", "No, I'm not allergic to anything."], model: "No, I'm not allergic to anything.", chunk: ["allergic", "알레르기가 있는", "'알레르기'가 아니라 '얼러직'에 가깝게 읽어요."] },
    { say: "Okay. Take two of these every six hours.", want: "밥 먹고 먹어야 하는지 묻기", need: [["식후", ["after", "meal", "meals", "food", "eat", "eating"]]], hint: ["Should I take them ~ meals?", "Should I take them…", "Should I take them after meals?"], model: "Should I take them after meals?" }
  ],
  overhear: [
    ["guest", "Do you have something for a sore throat?", [["something for", "~에 먹는 약", "약 이름을 몰라도 이렇게 물으면 돼요."], ["sore throat", "목 아픔", "목이 따끔따끔 아플 때 써요."]]],
    ["them", "Sure. Try these lozenges.", [["lozenges", "목캔디", "목이 아플 때 녹여 먹는 약이에요."]]],
    ["guest", "Great. How many a day?"],
    ["them", "No more than six a day."]
  ]
};
const HELPWAY = {
  who: "Ben", whoKo: "길 잃은 여행자", pos: "50% 50%", voices: { them: "m", guest: "f2" }, guestKo: "길을 아는 사람",
  layers: { w: 2752, h: 1536, box: [962, 451, 788, 1085], body: "img/scenes/helpway/body.png", breath: 1.008 },
  turns: [
    { say: "Excuse me, do you know where the museum is?", want: "네, 이 길로 쭉 가라고 말하기", need: [["쭉", ["straight"]]], hint: ["Sure, go ~ down this street.", "Sure, go straight…", "Sure, go straight down this street."], model: "Sure, go straight down this street." },
    { say: "Straight down this street. Okay!", want: "두 번째 신호등에서 왼쪽으로 돌라고 말하기", need: [["왼쪽", ["left"]]], hint: ["Then turn ~ at the second light.", "Then turn left…", "Then turn left at the second light."], model: "Then turn left at the second light.", chunk: ["at the second light", "두 번째 신호등에서", "길 안내는 '어디에서(at) 어느 쪽으로'를 한 쌍으로 말해요."] },
    { say: "Is it far from here?", want: "아니, 5분쯤이라고 말하기", need: [["5분", ["five", "5"]]], hint: ["No, it's about ~ minutes.", "No, it's about…", "No, it's about five minutes."], model: "No, it's about five minutes." },
    { say: "Thank you so much!", want: "천만에, 박물관 잘 보라고 인사하기", need: [["인사", ["welcome", "no problem", "enjoy", "have a good", "have fun", "no worries"]]], hint: ["No problem. ~ the museum!", "No problem. Enjoy…", "No problem. Enjoy the museum!"], model: "No problem. Enjoy the museum!" }
  ],
  overhear: [
    ["them", "Excuse me, where's the nearest subway station?"],
    ["guest", "It's on your right, next to the bank.", [["on your right", "오른쪽에", "on your left는 왼쪽에예요."], ["next to", "~ 바로 옆에", "위치를 말할 때 가장 많이 써요."]]],
    ["them", "Next to the bank. Got it!", [["Got it", "알겠어요", "이해했다고 짧게 말할 때 써요."]]],
    ["guest", "You can't miss it.", [["You can't miss it", "금방 찾을 거예요", "아주 찾기 쉽다는 뜻이에요."]]]
  ]
};

const DAYS = [
  { title: "1일째 · 도착한 날", scenes: [
    { id: "airport", time: "11:00", title: "공항 입국", img: "img/scenes/airport.webp", ...AIRPORT },
    { id: "way", time: "13:00", title: "숙소 가는 길 묻기", img: "img/scenes/way.webp", ...WAY },
    { id: "hotel", time: "15:00", title: "호텔 체크인", img: "img/scenes/hotel.webp", ...HOTEL },
    { id: "dinner", time: "19:00", title: "저녁 식당 주문", img: "img/scenes/dinner.webp", ...DINNER },
    { id: "night1", time: "22:00", title: "친구에게 오늘 이야기", me: true, img: "img/scenes/night.webp" }
  ] },
  { title: "2일째 · 평범한 하루", scenes: [
    { id: "cafe", time: "08:00", title: "아침 카페", img: "img/scenes/cafe-gemini.webp", ...CAFE },
    { id: "meetup", time: "10:00", title: "모임에서 자기소개", img: "img/scenes/meetup.webp", ...MEETUP },
    { id: "pharmacy", time: "13:00", title: "약국", img: "img/scenes/pharmacy.webp", ...PHARMACY },
    { id: "helpway", time: "17:00", title: "길에서 도와주기", img: "img/scenes/helpway.webp", ...HELPWAY },
    { id: "night2", time: "22:00", title: "친구에게 오늘 이야기", me: true, img: "img/scenes/night.webp" }
  ] },
  ...MORE_DAYS
];
const SCENE_LIST = DAYS.flatMap(d => d.scenes);
const nm = s => String(s).replace(/\{name\}/g, S.profile.name || "Chang");
const ready = sc => (!!sc.turns && !!sc.img) || sc.me;
// 시간에 따라 하늘색이 바뀐다 (그림이 아직 없는 장면의 바탕)
const skyOf = t => { const h = +t.slice(0, 2); return h < 10 ? "#f3ead2" : h < 15 ? "#dfe9e2" : h < 19 ? "#f2d6a8" : "#1f3a35" };

// ───── 하루 띠 ─────
function renderDay() {
  header();
  const nextId = SCENE_LIST.find(sc => ready(sc) && !S.visited[sc.id] && !sc.me)?.id;
  $("daystrip").innerHTML = DAYS.map(d => `<section class="dayrow"><h2>${d.title}</h2><div class="stripwrap"><button class="snav back" data-dir="-1" aria-label="이전 장면" hidden><i class="ph-bold ph-caret-left"></i></button><div class="strip" tabindex="0" aria-label="${d.title} 장면들">${d.scenes.map(sc => {
    const been = S.visited[sc.id], isNext = sc.id === nextId, night = +sc.time.slice(0, 2) >= 19;
    const state = been ? "다녀왔어요" : sc.me ? (S.key ? "AI와 말하기" : "키를 넣으면 열려요") : ready(sc) ? (isNext ? "지금 갈 곳" : "갈 수 있어요") : "그림 준비 중";
    return `<button class="scard${isNext ? " next" : ""}${ready(sc) ? "" : " soon"}${night ? " night" : ""}" data-sc="${sc.id}" style="--sky:${skyOf(sc.time)}">
      <div class="pic">${sc.img ? `<img src="${sc.img}" alt="" loading="lazy" style="object-position:${sc.pos || "50% 50%"}">` : `<i class="ph-fill ${sc.me ? "ph-chats-circle" : "ph-sun-horizon"}"></i>`}${been ? `<span class="stamp"><i class="ph-fill ph-check-circle"></i></span>` : ""}</div>
      <div class="cap"><time>${sc.time}</time><b>${sc.title}</b><span>${state}</span></div></button>`;
  }).join("")}</div><button class="snav fwd" data-dir="1" aria-label="다음 장면"><i class="ph-bold ph-caret-right"></i></button></div></section>`).join("");
  const nx = $("daystrip").querySelector(".scard.next");
  if (nx) nx.parentElement.scrollLeft = nx.offsetLeft - 12;
  $("daystrip").querySelectorAll(".strip").forEach(s => { s.onscroll = () => snavState(s); snavState(s) });
}
// 컴퓨터(마우스)에서는 옆으로 밀 수 없으니 양옆 화살표로 한 장씩 넘긴다
function snavState(s) {
  const w = s.parentElement, end = s.scrollWidth - s.clientWidth - 4, pic = s.querySelector(".pic");
  if (pic) w.style.setProperty("--mid", 4 + pic.offsetHeight / 2 + "px");
  w.querySelector(".back").hidden = s.scrollLeft <= 4; w.querySelector(".fwd").hidden = s.scrollLeft >= end;
}
$("daystrip").onclick = e => {
  const n = e.target.closest(".snav");
  if (n) { const s = n.parentElement.querySelector(".strip"), c = s.querySelector(".scard"); return s.scrollBy({ left: n.dataset.dir * (c.offsetWidth + 12) }) }
  const b = e.target.closest("[data-sc]"); if (!b) return;
  const sc = SCENE_LIST.find(x => x.id === b.dataset.sc);
  if (sc.me) { S.scene = "auto"; save(); return nav("talk") }
  if (!ready(sc)) { fx("bad"); return toast("이 장면 그림을 준비하고 있어요") }
  openScene(sc);
};

// ───── 장면 ─────
let SC = null;
const PHASES = ["나", "듣기", "수첩"];
function openScene(sc) {
  SC = { sc, phase: 0, line: 0, turn: 0, log: [], hint: 0, tries: 0, played: false };
  nav("scene"); buildStage(sc);
  $("sctitle").innerHTML = `<time>${sc.time}</time> ${sc.title}`;
  phase(0);
}
// 장면 그림: 겹이 있으면 사람만 살짝 움직이고, 없으면 그림 한 장
function buildStage(sc) {
  const L2 = sc.layers, el = $("scimg");
  if (!L2) { el.innerHTML = `<img src="${sc.img}" alt="">`; el.dataset.w = 16; el.dataset.h = 9; return fitStage() }
  const pc = (v, t) => (100 * v / t) + "%", [bx, by, bw, bh] = L2.box;
  el.dataset.w = L2.w; el.dataset.h = L2.h;
  // plate가 없으면 원본 그림 위에 사람 겹만 얹는다(숨 쉴 때 살짝 커지기만 해서 밑그림이 안 비친다)
  el.innerHTML = `<img src="${L2.plate || sc.img}" alt="">
    ${(L2.amb || []).map(([src, x, y, w, h, c]) => `<img class="amb ${c}" src="${src}" alt="" style="left:${pc(x, L2.w)};top:${pc(y, L2.h)};width:${pc(w, L2.w)};height:${pc(h, L2.h)}">`).join("")}
    <div class="breath" style="${L2.breath ? `--s:${L2.breath};` : ""}left:${pc(bx, L2.w)};top:${pc(by, L2.h)};width:${pc(bw, L2.w)};height:${pc(bh, L2.h)}">
      <img src="${L2.body}" alt="">${L2.hand ? `<img class="handwave" src="${L2.hand}" alt="" style="transform-origin:${pc(L2.pivot[0] - bx, bw)} ${pc(L2.pivot[1] - by, bh)}">` : ""}
    </div>
    ${(L2.front || []).map(([src, x, y, w, h]) => `<img class="front" src="${src}" alt="" style="left:${pc(x, L2.w)};top:${pc(y, L2.h)};width:${pc(w, L2.w)};height:${pc(h, L2.h)}">`).join("")}`;
  fitStage();
}
// object-fit: cover 처럼 무대를 꽉 채우되, 사람 쪽(pos)이 보이게
function fitStage() {
  const el = $("scimg"), st = el?.parentElement; if (!el || !SC || !st.clientWidth) return;
  const W = st.clientWidth, H = st.clientHeight, A = el.dataset.w / el.dataset.h, [px, py] = (SC.sc.pos || "50% 50%").split(" ").map(v => parseFloat(v) / 100);
  const cw = W / H > A ? W : H * A, ch = cw / A;
  Object.assign(el.style, { width: cw + "px", height: ch + "px", left: (W - cw) * px + "px", top: (H - ch) * py + "px" });
}
addEventListener("resize", fitStage);
function phase(n) {
  SC.phase = n;
  $("scsteps").innerHTML = PHASES.map((p, i) => `<span class="${i === n ? "on" : i < n ? "done" : ""}">${p}</span>`).join("");
  $("scbubble").hidden = true; $("chunkcard").hidden = true;
  if (n === 0) myTurn();
  if (n === 1) overhear();
  if (n === 2) notebook();
}
const chunked = (en, chunks = []) => chunks.reduce((h, [c], i) => h.replace(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), m => `<span class="chunk" role="button" tabindex="0" data-c="${i}">${m}</span>`), esc(en));
function bubble(who, en, ko) {
  const b = $("scbubble"); b.hidden = false; b.className = "bubble2 " + who;
  b.innerHTML = `<small>${who === "them" ? `${SC.sc.who} · ${SC.sc.whoKo}` : who === "guest" ? (SC.sc.guestKo || "다른 사람") : "나"}</small><span lang="en">${esc(en)}</span>${ko ? `<em>${esc(ko)}</em>` : ""}`;
  b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";
}
// 2. 듣기: 내가 먼저 말해 본 뒤, 같은 자리에서 다른 사람이 하는 말을 듣는다. 밑줄 덩어리를 누르면 뜻과 이유
async function overhear() {
  const lines = SC.sc.overhear;
  $("scpanel").innerHTML = `<p class="lead2">이번엔 같은 자리에서 다른 사람이 하는 말을 들어요. 밑줄 친 말을 누르면 뜻이 나와요.</p><ol class="script" id="script"></ol>
    <div class="scfoot"><button class="btn ghost" id="replay"><i class="ph-fill ph-speaker-high"></i>다시 듣기</button><button class="btn" id="tome" disabled>수첩 보기 <i class="ph-bold ph-arrow-right"></i></button></div>`;
  $("replay").onclick = () => playScript();
  $("tome").onclick = () => phase(2);
  $("script").onclick = e => { const c = e.target.closest(".chunk"); if (!c) return; const li = c.closest("li"), ch = lines[+li.dataset.i][2][+c.dataset.c]; showChunk(ch) };
  $("script").onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".chunk")) { e.preventDefault(); e.target.click() } };
  playScript();
}
let playing = 0;
async function playScript() {
  const run = ++playing, lines = SC.sc.overhear;
  $("script").innerHTML = "";
  for (let i = 0; i < lines.length; i++) {
    if (run !== playing || SC?.phase !== 1) return;
    const [who, en, ch] = lines[i];
    $("script").insertAdjacentHTML("beforeend", `<li class="${who}" data-i="${i}"><small>${who === "them" ? SC.sc.who : (SC.sc.guestKo || "다른 사람")}</small><span lang="en">${chunked(en, ch)}</span></li>`);
    $("script").lastElementChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
    bubble(who, en);
    if (listenOn()) await speak(en, S.prefs.rate, SC.sc.voices[who]); else await new Promise(r => setTimeout(r, 900 + en.length * 25));
    await new Promise(r => setTimeout(r, 250));
  }
  if (run === playing) { $("tome").disabled = false; $("scbubble").hidden = true }
}
function showChunk([c, m, why]) {
  const k = $("chunkcard"); k.hidden = false;
  k.innerHTML = `<b lang="en">${esc(c)}</b><span>${esc(m)}</span><p>${esc(why)}</p><button class="say-mini" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button>`;
  k.querySelector("button").onclick = () => speak(c);
  speak(c);
}
// 1. 나: 바리스타가 나에게 말을 건다. 한국어 '하고 싶은 말'만 보고 내가 먼저 직접 말한다
function myTurn() {
  const t = SC.sc.turns[SC.turn];
  if (!t) return phase(1);
  SC.hint = 0; SC.tries = 0;
  bubble("them", t.say);
  const typing = !speakOn();
  $("scpanel").innerHTML = `<div class="turnhead"><span>${SC.turn + 1} / ${SC.sc.turns.length}</span><button class="link" id="sayagain"><i class="ph-fill ph-speaker-high"></i> 다시 듣기</button></div>
    <p class="want"><small>하고 싶은 말</small>${esc(t.want)}</p>
    <p class="hintline" id="hintline" hidden></p>
    ${typing ? "" : `<button class="mic-big" id="scmic" aria-label="말하기"><i class="ph-fill ph-microphone"></i></button>`}
    <form class="type" id="sctype" ${typing ? "" : "hidden"}><input id="scin" lang="en" autocomplete="off" placeholder="영어로 쓰기"><button class="btn" style="min-height:46px;padding:0 16px">말하기</button></form>
    <p class="heardw" id="scheard" aria-live="polite"></p>
    <div class="scfoot"><button class="btn ghost" id="schint"><i class="ph-fill ph-lightbulb"></i>힌트</button>${typing ? "" : `<button class="btn ghost" id="sctyping"><i class="ph-bold ph-keyboard"></i>글로</button>`}</div>`;
  $("sayagain").onclick = () => { if (!recS) listenFirst(t.say) };
  $("schint").onclick = () => giveHint();
  if (!typing) { $("scmic").onclick = () => hearMe(); $("sctyping").onclick = () => { $("sctype").hidden = false; $("scin").focus() } }
  $("sctype").onsubmit = e => { e.preventDefault(); const v = $("scin").value.trim(); if (v && !SC.listening) judgeTurn(v) };
  listenFirst(t.say);
}
// 듣는 것도 공부: 상대 말이 다 나올 때까지 말하기·보내기를 잠근다
async function listenFirst(text) {
  const lock = on => { SC.listening = on; ["scmic", "sayagain"].forEach(id => { const b = $(id); if (b) b.disabled = on }); const s = $("sctype")?.querySelector("button"); if (s) s.disabled = on; $("scheard").textContent = on ? "끝까지 들어 보세요…" : "" };
  if (!listenOn()) return lock(false);
  lock(true);
  await speak(text, undefined, SC.sc.voices.them);
  if (SC) { lock(false); if (!speakOn()) $("scin")?.focus() }
}
function giveHint() {
  const t = SC.sc.turns[SC.turn]; SC.hint = Math.min(3, SC.hint + 1);
  const h = $("hintline"); h.hidden = false; h.innerHTML = `<i class="ph-fill ph-lightbulb"></i><span lang="en">${esc(nm(t.hint[SC.hint - 1]))}</span>`;
  if (SC.hint === 3) speak(nm(t.hint[2]));
}
let recS = null;
function hearMe() {
  const b = $("scmic");
  if (SC.listening) return;
  if (recS) { const r = recS; recS = null; b.classList.remove("on"); b.setAttribute("aria-label", "말하기"); $("sayagain").disabled = false; try { r.stop() } catch { r.onend() } return }
  const got = []; let interim = "";
  const show = () => { $("scheard").textContent = [...got.map(a => a[0]), interim].join(" ").trim() || "듣는 중… 다 말하면 다시 눌러요" };
  const r = new Rec(); r.lang = "en-US"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 3;
  r.onresult = e => { interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const res = e.results[i]; if (res.isFinal) got.push([...res].map(a => a.transcript.trim())); else interim += res[0].transcript } show() };
  r.onerror = e => { if (e.error === "not-allowed") { recS = null; b.classList.remove("on"); $("scheard").textContent = "마이크를 허용해 주세요. 글로 써도 돼요." } };
  // 브라우저가 조용하다고 멋대로 끝내도, 내가 다시 누르기 전까지는 이어서 듣는다
  r.onend = () => {
    if (recS === r) { try { r.start() } catch {} return }
    const base = got.map(a => a[0]).join(" "), tail = interim.trim();
    const said = [base, tail].filter(Boolean).join(" ").trim();
    if (!said) { $("scheard").textContent = "아무 말도 안 들렸어요. 다시 눌러 말해요."; return }
    const last = got.at(-1) || [], head = got.slice(0, -1).map(a => a[0]).join(" ");
    judgeTurn([said, ...last.slice(1).map(a => [head, a].filter(Boolean).join(" "))], true);
  };
  recS = r; r.start(); b.classList.add("on"); b.setAttribute("aria-label", "다 말했어요"); $("sayagain").disabled = true; show();
}
// 뜻이 통하는지: 필요한 덩어리가 들어 있으면 통과 (문장이 똑같을 필요 없음)
const normS = s => " " + s.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim() + " ";
function judgeTurn(input, spoken) {
  const t = SC.sc.turns[SC.turn], alts = Array.isArray(input) ? input : [input];
  const score = a => t.need.filter(([, any]) => any.some(w => normS(a).includes(" " + w + " "))).length;
  const said = alts.slice().sort((a, b) => score(b) - score(a))[0];
  const miss = t.need.filter(([, any]) => !any.some(w => normS(said).includes(" " + w + " ")));
  SC.tries++;
  if (miss.length) {
    fx("bad");
    $("scheard").innerHTML = `<span class="no2">"${esc(said)}"</span><br>${miss.map(([k]) => `'${k}'`).join(", ")} 부분이 안 들어갔어요`;
    if (SC.tries >= 2 && SC.hint < 2) giveHint();
    return;
  }
  fx("good");
  SC.log.push({ want: t.want, mine: said, model: nm(t.model), hint: SC.hint, tries: SC.tries, chunk: t.chunk });
  const same = normS(said) === normS(nm(t.model));
  $("scpanel").innerHTML = `<div class="okcard"><b><i class="ph-fill ph-check-circle"></i>통했어요</b><p class="mine" lang="en">${esc(said)}</p>${same ? "" : `<p class="better"><small>이렇게 말하면 더 자연스러워요</small><span lang="en">${esc(nm(t.model))}</span><button class="say-mini" id="playmodel" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button></p>`}</div>
    <div class="scfoot"><button class="btn" id="nextturn">${SC.turn + 1 < SC.sc.turns.length ? "다음" : "이제 듣기"} <i class="ph-bold ph-arrow-right"></i></button></div>`;
  if (!same) { $("playmodel").onclick = () => speak(nm(t.model)); speak(nm(t.model)) }
  $("nextturn").onclick = () => { SC.turn++; myTurn() };
  void spoken;
}
// 3. 수첩: 내가 한 말과 더 자연스러운 말. 힌트를 많이 쓴 말만 다음 날 한 번 더
function notebook() {
  $("scbubble").hidden = true;
  const chunks = SC.sc.overhear.flatMap(l => l[2] || []).concat(SC.sc.turns.filter(t => t.chunk).map(t => t.chunk));
  const hard = SC.log.filter(l => l.hint >= 2 || l.tries >= 3);
  $("scpanel").innerHTML = `<p class="lead2">오늘 이 장면에서 건진 말이에요.</p>
    <ul class="notes">${SC.log.map(l => `<li class="${l.hint >= 2 || l.tries >= 3 ? "hard" : ""}"><small>${esc(l.want)}</small><span lang="en">${esc(l.mine)}</span>${normS(l.mine) === normS(l.model) ? "" : `<em lang="en">→ ${esc(l.model)}</em>`}</li>`).join("")}</ul>
    ${hard.length ? `<p class="soft">힌트를 많이 쓴 ${hard.length}개는 내일 다른 장면에서 한 번 더 나와요.</p>` : `<p class="soft">힌트 없이 술술 말했어요.</p>`}
    <div class="scfoot"><button class="btn" id="scdone">하루로 돌아가기</button></div>`;
  $("scdone").onclick = () => {
    const d = today(); S.visited[SC.sc.id] = d; markDay();
    chunks.forEach(([c, m, why]) => { if (!S.note.some(n => n.c === c)) S.note.push({ c, m, why, sc: SC.sc.id, at: d }) });
    hard.forEach(l => S.ng.push({ sc: SC.sc.id, want: l.want, model: l.model, at: d }));
    SC.log.forEach(l => S.lines.push({ sc: SC.sc.id, mine: l.mine, at: d }));
    save(); SC = null; fx("done"); nav("learn");
  };
}
$("scclose").onclick = () => { playing++; speechSynthesis.cancel(); if (recS) { const r = recS; recS = null; r.onend = null; try { r.stop() } catch {} } SC = null; nav("learn") };

// ───── 수첩 탭 ─────
function renderNote() {
  header();
  $("notelist").innerHTML = S.note.length ? S.note.slice().reverse().map(n => `<li><b lang="en">${esc(n.c)}</b><span>${esc(n.m)}</span><p>${esc(n.why)}</p><button class="say-mini" data-say="${esc(n.c)}" aria-label="듣기"><i class="ph-fill ph-speaker-high"></i></button></li>`).join("")
    : `<p class="none">장면을 다녀오면 건진 말이 여기 모여요.</p>`;
  $("nglist").innerHTML = S.ng.length ? S.ng.slice().reverse().map(n => `<li><small>${esc(n.want)}</small><span lang="en">${esc(n.model)}</span></li>`).join("") : `<p class="none">아직 없어요.</p>`;
  const st = S.stuck.filter(x => !x.done);
  $("stucklist").innerHTML = st.length ? st.map(x => `<li><small>${esc(x.ko)}</small><span lang="en">${esc(x.en)}</span></li>`).join("") : `<p class="none">말 걸기에서 막힌 말이 여기 모여요.</p>`;
  $("pronlist").innerHTML = W.map(([w, mean, wrong, right, ipa, , tip]) => `<li data-say="${w.replace(/[()]/g, "")}"><b lang="en">${w.replace(/\((.+?)\)/g, "<s>$1</s>")}</b><del>${wrong}</del><strong>${right.replace(/[\[\]]/g, "")}</strong><small>${mean} · /${ipa}/ · ${tip}</small></li>`).join("");
}
$("v-review").onclick = e => { const b = e.target.closest("[data-say]"); if (b) speak(b.dataset.say) };

// 시작 (app.js 다음에 읽히므로 여기서 첫 화면을 띄운다)
show(location.hash.slice(1) || "learn");
