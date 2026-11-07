// 하루 살기 3~7일째. 장면 = 상대(who) + 내 차례(turns) + 엿듣기(overhear). scene.js보다 먼저 읽힌다.
// 그림은 ART에 들어오는 대로 열린다(없으면 '그림 준비 중'). ART 줄은 그림 작업 스크립트(~/sulsul-art/art.py)가 채운다.
const ART = {
  // ART:BEGIN
  checkout: { img: "img/scenes/hotel.webp", layers: { w: 2752, h: 1536, box: [1271, 488, 227, 280], body: "img/scenes/hotel/body.png" } },
  subway: { img: "img/scenes/subway.webp", layers: { w: 2752, h: 1536, box: [1212, 532, 311, 316], body: "img/scenes/subway/body.png" } },
  shop: { img: "img/scenes/shop.webp", layers: { w: 2752, h: 1536, box: [1349, 282, 469, 618], body: "img/scenes/shop/body.png" } },
  salon: { img: "img/scenes/salon.webp", layers: { w: 2752, h: 1536, box: [1672, 279, 505, 1026], body: "img/scenes/salon/body.png", breath: 1.008 } },
  photo: { img: "img/scenes/photo.webp", layers: { w: 2752, h: 1536, box: [1107, 298, 525, 1238], body: "img/scenes/photo/body.png", breath: 1.008 } },
  lost: { img: "img/scenes/lost.webp", layers: { w: 2752, h: 1536, box: [1421, 309, 331, 548], body: "img/scenes/lost/body.png" } },
  wrong: { img: "img/scenes/wrong.webp", layers: { w: 2752, h: 1536, box: [1513, 96, 605, 1091], body: "img/scenes/wrong/body.png", breath: 1.008 } },
  room: { img: "img/scenes/room.webp", layers: { w: 2752, h: 1536, box: [1387, 266, 430, 953], body: "img/scenes/room/body.png", breath: 1.008 } },
  clinic: { img: "img/scenes/clinic.webp", layers: { w: 2752, h: 1536, box: [1438, 282, 387, 596], body: "img/scenes/clinic/body.png" } },
  market: { img: "img/scenes/market.webp", layers: { w: 2752, h: 1536, box: [1169, 354, 414, 511], body: "img/scenes/market/body.png" } },
  movie: { img: "img/scenes/movie.webp", layers: { w: 2752, h: 1536, box: [1263, 335, 344, 498], body: "img/scenes/movie/body.png" } },
  park: { img: "img/scenes/park.webp", layers: { w: 2752, h: 1536, box: [1199, 215, 398, 972], body: "img/scenes/park/body.png", breath: 1.008 } },
  home: { img: "img/scenes/home.webp", layers: { w: 2752, h: 1536, box: [1010, 215, 734, 1321], body: "img/scenes/home/body.png", breath: 1.008 } },
  // ART:END
};
const THANKS = [["고마움", ["thank", "thanks", "appreciate"]]];

const SUBWAY = {
  who: "Dan", whoKo: "역무원", voices: { them: "m", guest: "f" }, guestKo: "다른 승객",
  turns: [
    { say: "Morning! Can I help you?", want: "시내 가는 표 한 장 사고 싶다고 하기", need: [["표", ["ticket", "pass"]]], hint: ["I'd like a ~ to downtown.", "I'd like a ticket…", "I'd like a ticket to downtown, please."], model: "I'd like a ticket to downtown, please.", chunk: ["I'd like ~", "~ 주세요 (공손하게)", "I want보다 부드럽게 원하는 걸 말해요."] },
    { say: "One way or round trip?", want: "왕복으로 달라고 하기", need: [["왕복", ["round trip", "return"]]], hint: ["~, please.", "Round…", "Round trip, please."], model: "Round trip, please.", chunk: ["round trip", "왕복", "편도는 one way예요."] },
    { say: "That's six dollars. Anything else?", want: "몇 번 승강장인지 묻기", need: [["승강장", ["platform", "track", "which line"]]], hint: ["Which ~ do I need?", "Which platform…", "Which platform do I need?"], model: "Which platform do I need?" },
    { say: "Platform two. The next train comes in five minutes.", want: "갈아타야 하는지 묻기", need: [["갈아타기", ["change", "transfer", "switch"]]], hint: ["Do I need to ~ trains?", "Do I need to change…", "Do I need to change trains?"], model: "Do I need to change trains?" },
    { say: "No, it goes straight there.", want: "고맙다고 하기", need: THANKS, hint: ["Great, ~!", "Great, thanks…", "Great, thanks for your help!"], model: "Great, thanks for your help!" }
  ],
  overhear: [
    ["guest", "Excuse me, does this train stop at Central Station?", [["stop at", "~에 서다", "이 열차가 그 역에 서는지 물을 때 써요."]]],
    ["them", "Yes, it's the third stop.", [["the third stop", "세 번째 역", "몇 정거장인지 말할 때 써요."]]],
    ["guest", "Great. How often do the trains run?", [["How often", "얼마나 자주", "시간 간격을 물을 때 써요."]]],
    ["them", "Every ten minutes."]
  ]
};
const SHOP = {
  who: "Mia", whoKo: "옷 가게 점원", pos: "58% 50%", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
  turns: [
    { say: "Hi there! How can I help?", want: "어제 산 셔츠를 바꾸고 싶다고 하기", need: [["바꾸기", ["exchange", "change", "swap"]]], hint: ["I'd like to ~ this shirt.", "I'd like to exchange…", "I'd like to exchange this shirt."], model: "I'd like to exchange this shirt.", chunk: ["exchange", "교환하다", "돈으로 돌려받는 건 refund예요."] },
    { say: "Sure. What's wrong with it?", want: "조금 작다고 말하기", need: [["작다", ["small", "tight"]]], hint: ["It's a little too ~.", "It's a little too…", "It's a little too small."], model: "It's a little too small." },
    { say: "Would you like a medium instead?", want: "라지 사이즈 있냐고 묻기", need: [["라지", ["large"]]], hint: ["Do you have it in a ~?", "Do you have it in a…", "Do you have it in a large?"], model: "Do you have it in a large?", chunk: ["in a large", "라지 사이즈로", "사이즈·색을 말할 때 in을 써요. in blue처럼요."] },
    { say: "Here you go. Do you want to try it on?", want: "네, 탈의실이 어디냐고 묻기", need: [["탈의실", ["fitting room", "changing room", "dressing room"]]], hint: ["Where's the ~ room?", "Where's the fitting…", "Yes, where's the fitting room?"], model: "Yes, where's the fitting room?" }
  ],
  overhear: [
    ["guest", "Excuse me, can I get a refund for this?", [["get a refund", "환불받다", "교환이 아니라 돈을 돌려받을 때 써요."]]],
    ["them", "Sure. Do you have the receipt?"],
    ["guest", "Yes, here it is."],
    ["them", "Okay, I'll put it back on your card.", [["put it back on your card", "카드로 다시 넣어 드릴게요", "카드 결제를 취소해 줄 때 하는 말이에요."]]]
  ]
};
const SALON = {
  who: "Jess", whoKo: "미용사", pos: "72% 50%", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
  turns: [
    { say: "Hi! Have a seat. What are we doing today?", want: "머리를 자르고 싶다고 하기", need: [["자르기", ["haircut", "cut", "trim"]]], hint: ["I'd like a ~, please.", "I'd like a hair…", "I'd like a haircut, please."], model: "I'd like a haircut, please." },
    { say: "Sure. How short do you want it?", want: "윗부분만 조금 다듬어 달라고 하기", need: [["조금만", ["a little", "a bit", "trim"]]], hint: ["Just a little off the ~.", "Just a little off…", "Just a little off the top, please."], model: "Just a little off the top, please.", chunk: ["a little off the top", "윗부분 조금만", "많이 자르지 말라는 뜻으로 굳어진 말이에요."] },
    { say: "Okay. What about the sides?", want: "옆은 좀 더 짧게 해 달라고 하기", need: [["짧게", ["short", "shorter"]]], hint: ["A bit ~ on the sides.", "A bit shorter…", "A bit shorter on the sides."], model: "A bit shorter on the sides." },
    { say: "Do you want me to wash it first?", want: "괜찮다고 거절하기", need: [["거절", ["no", "i'm good", "im good", "that's okay", "thats okay", "i'm fine", "im fine"]]], hint: ["No, I'm ~, thanks.", "No, I'm…", "No, I'm good, thanks."], model: "No, I'm good, thanks." },
    { say: "All done! What do you think?", want: "정말 마음에 든다고 하기", need: [["마음에 듦", ["love", "like", "great", "looks good", "perfect", "nice"]]], hint: ["I ~ it!", "I love…", "I love it! Thank you."], model: "I love it! Thank you." }
  ],
  overhear: [
    ["guest", "Can I make an appointment for Saturday?", [["make an appointment", "예약하다", "미용실·병원은 appointment, 식당·호텔은 reservation이에요."]]],
    ["them", "Sure. Morning or afternoon?"],
    ["guest", "Morning, if possible.", [["if possible", "되면", "부탁을 부드럽게 만드는 말이에요."]]],
    ["them", "How about ten o'clock?", [["How about", "~ 어때요?", "무언가를 제안할 때 써요."]]]
  ]
};
const PHOTO = {
  who: "Nate", whoKo: "지나가던 사람", voices: { them: "m", guest: "f2" }, guestKo: "다른 관광객",
  turns: [
    { say: "Oh, hi! Do you need something?", want: "사진 좀 찍어 줄 수 있냐고 부탁하기", need: [["사진", ["picture", "photo", "pic"]]], hint: ["Could you take a ~ of me?", "Could you take a picture…", "Could you take a picture of me?"], model: "Could you take a picture of me?", chunk: ["Could you ~?", "~해 주실래요?", "Can you보다 공손한 부탁이에요."] },
    { say: "Sure! Do I just press this button?", want: "네, 그거 누르면 된다고 하기", need: [["맞아요", ["yes", "yeah", "yep", "that's it", "thats it", "right"]]], hint: ["Yes, just ~ that one.", "Yes, just press…", "Yes, just press that one."], model: "Yes, just press that one." },
    { say: "Do you want the tower in the background?", want: "네, 탑이 다 나오게 해 달라고 하기", need: [["탑 전체", ["whole", "all of", "tower"]]], hint: ["Yes, please get the ~ tower in.", "Yes, please get the whole…", "Yes, please get the whole tower in."], model: "Yes, please get the whole tower in." },
    { say: "Here you go. Take a look.", want: "한 장만 더 찍어 달라고 하기", need: [["한 장 더", ["one more", "another"]]], hint: ["Could you take ~ more?", "Could you take one more…", "Could you take one more, please?"], model: "Could you take one more, please?", chunk: ["one more", "한 장 더", "another one이라고 해도 돼요."] }
  ],
  overhear: [
    ["guest", "Excuse me, would you mind taking our picture?", [["would you mind", "~해 주실 수 있을까요", "아주 공손한 부탁이에요. 들어줄 땐 Not at all이라고 해요."]]],
    ["them", "Not at all. Say cheese!", [["Not at all", "전혀요 (괜찮아요)", "Would you mind에 '괜찮다'고 답하는 말이에요."]]],
    ["guest", "Thank you! Could you take a vertical one too?", [["a vertical one", "세로로 한 장", "가로는 horizontal이에요."]]],
    ["them", "Sure, no problem."]
  ]
};
const LOST = {
  who: "Rosa", whoKo: "분실물 센터 직원", pos: "58% 50%", voices: { them: "f2", guest: "m2" }, guestKo: "다른 사람",
  turns: [
    { say: "Good morning. What can I do for you?", want: "어제 지하철에서 가방을 잃어버렸다고 하기", need: [["잃어버림", ["lost", "left", "lose"]], ["가방", ["bag", "backpack"]]], hint: ["I lost my ~ on the subway.", "I lost my bag…", "I lost my bag on the subway yesterday."], model: "I lost my bag on the subway yesterday." },
    { say: "I'm sorry to hear that. What does it look like?", want: "작은 검은 배낭이라고 말하기", need: [["검은색", ["black"]]], hint: ["It's a small ~ backpack.", "It's a small black…", "It's a small black backpack."], model: "It's a small black backpack.", chunk: ["What does it look like?", "어떻게 생겼어요?", "모양·색을 물을 때 쓰는 질문이에요."] },
    { say: "What was inside?", want: "노트북과 지갑이 들어 있었다고 하기", need: [["노트북", ["laptop", "computer"]]], hint: ["My ~ and my wallet.", "My laptop…", "My laptop and my wallet were inside."], model: "My laptop and my wallet were inside." },
    { say: "Let me check. Is this yours?", want: "네, 제 거라고 기뻐하기", need: [["제 것", ["mine", "my bag", "that's it", "thats it"]]], hint: ["Yes, that's ~!", "Yes, that's mine…", "Yes, that's mine! Thank you so much."], model: "Yes, that's mine! Thank you so much.", chunk: ["That's mine", "제 거예요", "my bag을 다시 말하지 않고 mine 한 마디면 돼요."] }
  ],
  overhear: [
    ["guest", "Hi, has anyone turned in a phone?", [["turned in", "(분실물을) 맡기다", "주운 물건을 맡겼냐고 물을 때 써요."]]],
    ["them", "What kind of phone is it?"],
    ["guest", "It's a white one with a blue case.", [["with a blue case", "파란 케이스 끼운", "특징을 덧붙일 때 with를 써요."]]],
    ["them", "Please fill out this form.", [["fill out this form", "이 서류를 작성하다", "서류 칸을 채울 때 fill out이라고 해요."]]]
  ]
};
const WRONG = {
  who: "Kevin", whoKo: "식당 직원", pos: "66% 50%", voices: { them: "m", guest: "f" }, guestKo: "옆 테이블 손님",
  turns: [
    { say: "Here's your burger. Enjoy!", want: "이거 안 시켰다고 말하기", need: [["안 시킴", ["didn't order", "didnt order", "did not order", "not what i ordered", "wrong", "not mine"]]], hint: ["Sorry, I didn't ~ this.", "Sorry, I didn't order…", "Sorry, I didn't order this."], model: "Sorry, I didn't order this.", chunk: ["I didn't order this", "이거 안 시켰어요", "화내지 않고 실수를 알려 주는 말이에요."] },
    { say: "Oh, I'm so sorry! What did you order?", want: "치킨 샐러드 시켰다고 하기", need: [["샐러드", ["salad"]]], hint: ["I ordered the ~.", "I ordered the chicken…", "I ordered the chicken salad."], model: "I ordered the chicken salad." },
    { say: "I'll fix that right away. It'll be about ten minutes.", want: "괜찮다고, 물 좀 더 달라고 하기", need: [["물", ["water"]]], hint: ["No problem. Could I get some more ~?", "No problem. Could I get some more…", "No problem. Could I get some more water?"], model: "No problem. Could I get some more water?" },
    { say: "Of course. Sorry again for the mix-up.", want: "괜찮다고 안심시키기", need: [["괜찮음", ["no worries", "no problem", "it's okay", "its okay", "it's fine", "its fine", "don't worry", "dont worry", "that's okay", "thats okay"]]], hint: ["No ~!", "No worries…", "No worries, it happens."], model: "No worries, it happens.", chunk: ["mix-up", "착오", "주문·이름이 뒤바뀐 실수를 말해요."] }
  ],
  overhear: [
    ["guest", "Excuse me, my soup is a little cold.", [["a little cold", "좀 식었어요", "불평에 a little을 붙이면 부드러워져요."]]],
    ["them", "Oh, I'm sorry. Let me heat it up for you.", [["heat it up", "데우다", "다시 데워 준다는 말이에요."]]],
    ["guest", "Thank you, I appreciate it.", [["I appreciate it", "정말 고마워요", "thank you 뒤에 붙이면 더 고마운 마음이 전해져요."]]],
    ["them", "It'll just be a minute."]
  ]
};
const ROOM = {
  who: "Mike", whoKo: "호텔 직원", pos: "58% 50%", voices: { them: "m2", guest: "f" }, guestKo: "옆방 손님",
  turns: [
    { say: "Hi, you called the front desk?", want: "에어컨이 안 된다고 말하기", need: [["에어컨", ["air conditioner", "air conditioning", "ac", "a c", "aircon"]], ["안 됨", ["not working", "doesn't work", "doesnt work", "isn't working", "isnt working", "broken", "won't", "wont"]]], hint: ["The air conditioner isn't ~.", "The air conditioner isn't…", "The air conditioner isn't working."], model: "The air conditioner isn't working.", chunk: ["isn't working", "작동이 안 돼요", "고장 났다고 할 때 broken보다 자주 써요."] },
    { say: "Let me take a look. Hmm, it might take an hour to fix.", want: "다른 방으로 옮길 수 있냐고 묻기", need: [["방 옮기기", ["another room", "different room", "change rooms", "change my room", "move", "switch rooms", "new room"]]], hint: ["Could I ~ to another room?", "Could I move to…", "Could I move to another room?"], model: "Could I move to another room?" },
    { say: "Sure. We have one on the fifth floor. Is that okay?", want: "좋다고, 짐 옮기는 걸 도와 달라고 하기", need: [["짐", ["bags", "luggage", "suitcase", "stuff", "things"]]], hint: ["That's fine. Could you help me with my ~?", "That's fine. Could you help me with…", "That's fine. Could you help me with my bags?"], model: "That's fine. Could you help me with my bags?", chunk: ["help me with", "~ 좀 도와주세요", "help 뒤에 사람, with 뒤에 도움받을 일이 와요."] },
    { say: "No problem. I'll bring a new key card.", want: "정말 고맙다고 하기", need: THANKS, hint: ["Thanks, I really ~ it.", "Thanks, I really…", "Thanks, I really appreciate it."], model: "Thanks, I really appreciate it." }
  ],
  overhear: [
    ["guest", "Hi, could I get some extra towels?", [["extra towels", "수건 더", "더 필요한 물건 앞에 extra를 붙여요."]]],
    ["them", "Sure. I'll send some up right away.", [["send some up", "올려 보내다", "방으로 가져다준다는 말이에요."]]],
    ["guest", "And the Wi-Fi keeps dropping.", [["keeps dropping", "자꾸 끊겨요", "keep ~ing는 '자꾸 ~해요'예요."]]],
    ["them", "I'll ask someone to check it."]
  ]
};
const CLINIC = {
  who: "Nora", whoKo: "병원 접수 직원", pos: "59% 50%", voices: { them: "f", guest: "m" }, guestKo: "다른 환자",
  turns: [
    { say: "Hi, do you have an appointment?", want: "예약은 없는데 오늘 진료 볼 수 있냐고 묻기", need: [["진료", ["see a doctor", "see the doctor", "doctor"]]], hint: ["No. Can I see a ~ today?", "No. Can I see a doctor…", "No. Can I see a doctor today?"], model: "No. Can I see a doctor today?", chunk: ["see a doctor", "진료를 받다", "병원에 간다는 말을 이렇게 해요."] },
    { say: "Let me check. What seems to be the problem?", want: "열이 나고 기침을 한다고 말하기", need: [["열·기침", ["fever", "cough", "coughing"]]], hint: ["I have a ~ and a cough.", "I have a fever…", "I have a fever and a cough."], model: "I have a fever and a cough.", chunk: ["What seems to be the problem?", "어디가 불편하세요?", "병원에서 가장 먼저 듣는 질문이에요."] },
    { say: "Okay. Is this your first visit here?", want: "네, 처음이라고 하기", need: [["처음", ["first", "yes", "yeah", "yep"]]], hint: ["Yes, it's my ~ time.", "Yes, it's my first…", "Yes, it's my first time."], model: "Yes, it's my first time." },
    { say: "Then please fill out this form. Do you have insurance?", want: "여행자 보험이 있다고 말하기", need: [["보험", ["insurance"]]], hint: ["I have travel ~.", "I have travel…", "Yes, I have travel insurance."], model: "Yes, I have travel insurance.", chunk: ["travel insurance", "여행자 보험", "병원비를 낼 때 꼭 물어보는 말이에요."] },
    { say: "Great. Please have a seat. The doctor will call you.", want: "얼마나 기다려야 하는지 묻기", need: [["얼마나", ["how long"]]], hint: ["How long will I have to ~?", "How long will I…", "How long will I have to wait?"], model: "How long will I have to wait?" }
  ],
  overhear: [
    ["guest", "Hi, I'm here for my two o'clock appointment.", [["I'm here for", "~ 때문에 왔어요", "예약하고 왔다고 말할 때 써요."]]],
    ["them", "Can I have your name and date of birth?", [["date of birth", "생년월일", "병원·은행에서 꼭 물어봐요."]]],
    ["guest", "Sure. It's Tom Lee, March third.", [["March third", "3월 3일", "날짜는 third처럼 서수로 읽어요."]]],
    ["them", "Thank you. Please take a seat."]
  ]
};
const MARKET = {
  who: "Joe", whoKo: "과일 가게 주인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
  turns: [
    { say: "Morning! Everything's fresh today.", want: "사과가 얼마냐고 묻기", need: [["얼마", ["how much"]], ["사과", ["apple", "apples"]]], hint: ["How much are the ~?", "How much are…", "How much are the apples?"], model: "How much are the apples?" },
    { say: "Two dollars a pound.", want: "1파운드 달라고 하기", need: [["1파운드", ["a pound", "one pound", "1 pound"]]], hint: ["I'll take a ~, please.", "I'll take a pound…", "I'll take a pound, please."], model: "I'll take a pound, please.", chunk: ["I'll take ~", "~로 살게요", "가게에서 고를 때 가장 자연스러운 말이에요."] },
    { say: "Here you go. Anything else?", want: "딸기도 있냐고 묻기", need: [["딸기", ["strawberries", "strawberry"]]], hint: ["Do you have any ~?", "Do you have any…", "Do you have any strawberries?"], model: "Do you have any strawberries?" },
    { say: "Sorry, we're out of strawberries today.", want: "괜찮다고, 이게 다라고 하기", need: [["이게 다", ["that's all", "thats all", "that's it", "thats it", "that's everything", "thats everything"]]], hint: ["That's ~, thanks.", "That's all…", "That's all, thanks."], model: "That's all, thanks.", chunk: ["we're out of ~", "~이 다 떨어졌어요", "가게에 물건이 없을 때 듣는 말이에요."] }
  ],
  overhear: [
    ["guest", "Are these tomatoes local?", [["local", "이 지역에서 난", "가까운 곳에서 키운 걸 말해요."]]],
    ["them", "Yep, from a farm nearby."],
    ["guest", "Great. Can I get a bag, please?"],
    ["them", "Sure. That comes to five dollars.", [["That comes to", "다 해서 ~예요", "모두 합친 값을 말할 때 써요."]]]
  ]
};
const MOVIE = {
  who: "Ava", whoKo: "매표소 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
  turns: [
    { say: "Hi! Which movie would you like to see?", want: "3시 반 영화 표 두 장 달라고 하기", need: [["두 장", ["two"]], ["표", ["ticket", "tickets"]]], hint: ["Two tickets for the ~, please.", "Two tickets for the three…", "Two tickets for the three thirty show, please."], model: "Two tickets for the three thirty show, please." },
    { say: "Sure. Where would you like to sit?", want: "가운데쯤 앉고 싶다고 하기", need: [["가운데", ["middle", "center", "centre"]]], hint: ["Somewhere in the ~, please.", "Somewhere in the…", "Somewhere in the middle, please."], model: "Somewhere in the middle, please." },
    { say: "Okay, row F, seats ten and eleven. Anything from the snack bar?", want: "큰 팝콘 하나 달라고 하기", need: [["팝콘", ["popcorn"]]], hint: ["A large ~, please.", "A large popcorn…", "A large popcorn, please."], model: "A large popcorn, please." },
    { say: "Salted or caramel?", want: "반반 되냐고 묻기", need: [["반반", ["half", "both", "mix"]]], hint: ["Can I get ~ and half?", "Can I get half…", "Can I get half and half?"], model: "Can I get half and half?", chunk: ["half and half", "반반", "두 가지를 섞어 달라고 할 때 써요."] }
  ],
  overhear: [
    ["guest", "How long is the movie?", [["How long", "얼마나 긴", "시간 길이를 물을 때 써요."]]],
    ["them", "About two hours."],
    ["guest", "Is there a student discount?", [["student discount", "학생 할인", "할인이 있는지 꼭 물어보세요."]]],
    ["them", "Yes, just show your student ID.", [["student ID", "학생증", "ID는 신분증이에요."]]]
  ]
};
const PARK = {
  who: "Ella", whoKo: "강아지 산책하는 사람", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
  turns: [
    { say: "Oh, hi! Don't worry, he's friendly.", want: "강아지가 정말 귀엽다고 말하기", need: [["귀엽다", ["cute", "adorable", "sweet", "lovely"]]], hint: ["Your dog is so ~!", "Your dog is so…", "Your dog is so cute!"], model: "Your dog is so cute!" },
    { say: "Thanks! His name is Max.", want: "쓰다듬어도 되냐고 묻기", need: [["쓰다듬기", ["pet", "touch", "pat"]]], hint: ["Can I ~ him?", "Can I pet…", "Can I pet him?"], model: "Can I pet him?", chunk: ["pet", "(동물을) 쓰다듬다", "애완동물이라는 뜻 말고 '쓰다듬다'로도 써요."] },
    { say: "Sure! Do you have a dog?", want: "아니, 언젠가 꼭 키우고 싶다고 하기", need: [["언젠가", ["someday", "one day", "some day", "in the future"]]], hint: ["No, but I'd love to get one ~.", "No, but I'd love to…", "No, but I'd love to get one someday."], model: "No, but I'd love to get one someday.", chunk: ["I'd love to", "정말 ~하고 싶어요", "want to보다 바람이 더 느껴져요."] },
    { say: "You should! Do you come to this park often?", want: "주말마다 온다고 말하기", need: [["주말", ["weekend", "weekends"]]], hint: ["Yeah, I come here every ~.", "Yeah, I come here every…", "Yeah, I come here every weekend."], model: "Yeah, I come here every weekend." }
  ],
  overhear: [
    ["guest", "What a beautiful day!", [["What a beautiful day", "날씨 정말 좋네요", "처음 보는 사람과 말을 트기 좋은 말이에요."]]],
    ["them", "I know, right? Perfect for a walk.", [["I know, right?", "그러니까요!", "맞장구칠 때 써요."]]],
    ["guest", "Is there a good café around here?"],
    ["them", "Yes, there's one by the lake.", [["by the lake", "호수 옆에", "by는 '바로 옆'이에요."]]]
  ]
};
const HOME = {
  who: "Sara", whoKo: "모임에서 만난 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
  turns: [
    { say: "Hey, you made it! Come on in.", want: "초대해 줘서 고맙다며 작은 선물 건네기", need: [["고마움", ["thank", "thanks"]]], hint: ["Thanks for ~ me. This is for you.", "Thanks for having me…", "Thanks for having me. This is for you."], model: "Thanks for having me. This is for you.", chunk: ["Thanks for having me", "초대해 줘서 고마워요", "남의 집에 갔을 때 꼭 하는 인사예요."] },
    { say: "Aw, you didn't have to! Make yourself at home.", want: "집이 정말 좋다고 칭찬하기", need: [["칭찬", ["nice", "beautiful", "love", "lovely", "great", "cozy", "cool"]], ["집", ["place", "home", "house", "apartment"]]], hint: ["You have a really ~ place.", "You have a really nice…", "You have a really nice place."], model: "You have a really nice place.", chunk: ["Make yourself at home", "편하게 있어", "집에 온 손님에게 하는 말이에요."] },
    { say: "Thanks! Dinner's almost ready. Can I get you something to drink?", want: "물이면 된다고 하기", need: [["물", ["water"]]], hint: ["Just ~ is fine, thanks.", "Just water…", "Just water is fine, thanks."], model: "Just water is fine, thanks." },
    { say: "So, how's your trip going so far?", want: "정말 좋다고, 영어도 늘고 있다고 말하기", need: [["좋음", ["great", "good", "fun", "amazing", "awesome", "love"]]], hint: ["It's been ~! My English is getting better.", "It's been great…", "It's been great! My English is getting better."], model: "It's been great! My English is getting better.", chunk: ["so far", "지금까지", "여태까지 어땠는지 물을 때 붙여요."] },
    { say: "That's awesome. Let's eat!", want: "냄새가 정말 좋다고 하기", need: [["냄새", ["smells", "smell"]]], hint: ["It ~ amazing!", "It smells…", "It smells amazing!"], model: "It smells amazing!" }
  ],
  overhear: [
    ["guest", "This is delicious! Did you make it yourself?", [["Did you make it yourself?", "직접 만들었어요?", "음식을 칭찬하면서 묻기 좋아요."]]],
    ["them", "Yeah, it's my mom's recipe."],
    ["guest", "Can I have some more?", [["Can I have some more?", "좀 더 먹어도 돼요?", "더 달라고 할 때 써요."]]],
    ["them", "Of course! Help yourself.", [["Help yourself", "마음껏 드세요", "음식을 알아서 가져다 먹으라는 말이에요."]]]
  ]
};
const CLASS = {
  who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f2" }, guestKo: "다른 학생",
  turns: [
    { say: "Good morning! Are you new here?", want: "네, 오늘이 첫날이라고 하기", need: [["첫날", ["first day", "first class", "new"]]], hint: ["Yes, it's my ~ day.", "Yes, it's my first…", "Yes, it's my first day."], model: "Yes, it's my first day." },
    { say: "Welcome! We'll start with page twelve. Am I talking too fast?", want: "조금만 더 천천히 말해 달라고 하기", need: [["천천히", ["slowly", "slow", "slower"]]], hint: ["Could you speak a little more ~?", "Could you speak…", "Could you speak a little more slowly?"], model: "Could you speak a little more slowly?", chunk: ["a little more slowly", "조금 더 천천히", "못 알아들었을 때 부탁하는 말이에요."] },
    { say: "Sure. Any questions before we start?", want: "'commute'가 무슨 뜻인지 묻기", need: [["뜻", ["mean", "meaning"]]], hint: ["What does '~' mean?", "What does commute…", "What does 'commute' mean?"], model: "What does 'commute' mean?", chunk: ["What does ~ mean?", "~가 무슨 뜻이에요?", "모르는 단어가 나오면 바로 물어보세요."] },
    { say: "Good question! It means the trip to work or school.", want: "아, 이해했다고 하기", need: [["이해", ["got it", "see", "understand", "makes sense"]]], hint: ["Oh, I ~. Thanks!", "Oh, I see…", "Oh, I see. Thanks!"], model: "Oh, I see. Thanks!" }
  ],
  overhear: [
    ["guest", "Sorry, could you say that again?", [["say that again", "다시 말해 주세요", "못 들었을 때 가장 많이 쓰는 말이에요."]]],
    ["them", "Of course. Turn to page twelve.", [["Turn to page", "~쪽을 펴세요", "수업에서 자주 듣는 말이에요."]]],
    ["guest", "How do you spell that?", [["How do you spell", "철자가 어떻게 돼요", "단어 철자를 물을 때 써요."]]],
    ["them", "C-O-M-M-U-T-E."]
  ]
};
const FOODTRUCK = {
  who: "Carlos", whoKo: "푸드트럭 사장님", voices: { them: "m2", guest: "f" }, guestKo: "다음 손님",
  turns: [
    { say: "Hey! What can I get you?", want: "타코 두 개 달라고 하기", need: [["타코", ["taco", "tacos"]], ["두 개", ["two"]]], hint: ["Can I get ~ tacos?", "Can I get two…", "Can I get two tacos, please?"], model: "Can I get two tacos, please?" },
    { say: "Chicken or beef?", want: "닭고기로 달라고 하기", need: [["닭고기", ["chicken"]]], hint: ["~, please.", "Chicken…", "Chicken, please."], model: "Chicken, please." },
    { say: "Do you want everything on it?", want: "고수는 빼 달라고 하기", need: [["고수", ["cilantro", "coriander"]]], hint: ["No ~, please.", "No cilantro…", "Everything but no cilantro, please."], model: "Everything but no cilantro, please.", chunk: ["Do you want everything on it?", "다 넣어 드려요?", "토핑을 전부 올릴지 묻는 말이에요. 뺄 건 No ~라고 해요."] },
    { say: "Got it. That's eight fifty.", want: "카드 되냐고 묻기", need: [["카드", ["card", "cards"]]], hint: ["Do you take ~?", "Do you take cards…", "Do you take cards?"], model: "Do you take cards?", chunk: ["Do you take cards?", "카드 돼요?", "가게가 카드를 받는지 물을 때 take를 써요."] }
  ],
  overhear: [
    ["guest", "What's good here?", [["What's good here?", "여기 뭐가 맛있어요?", "처음 간 가게에서 묻기 좋은 말이에요."]]],
    ["them", "The fish tacos are our best seller.", [["best seller", "제일 잘 나가는 것", "가장 많이 팔리는 메뉴예요."]]],
    ["guest", "Are they spicy?"],
    ["them", "Just a little. I can make them mild.", [["mild", "순한 맛", "덜 맵게 해 줄 수 있다는 뜻이에요."]]]
  ]
};
const TEAM = {
  who: "Noah", whoKo: "같은 조 학생", voices: { them: "m", guest: "f2" }, guestKo: "다른 조원",
  turns: [
    { say: "So, how should we split the work?", want: "내가 슬라이드를 맡겠다고 하기", need: [["슬라이드", ["slides", "slide", "ppt", "powerpoint", "presentation"]]], hint: ["I can do the ~.", "I can do…", "I can do the slides."], model: "I can do the slides.", chunk: ["split the work", "일을 나누다", "조별 과제에서 꼭 나오는 말이에요."] },
    { say: "Great. When can you finish them?", want: "목요일까지 끝내겠다고 하기", need: [["목요일", ["thursday"]]], hint: ["By ~.", "I can finish them by…", "I can finish them by Thursday."], model: "I can finish them by Thursday.", chunk: ["by Thursday", "목요일까지", "마감은 by, 계속되는 기간은 until이에요."] },
    { say: "Perfect. What do you think about the topic?", want: "좋은데 예시를 더 넣자고 제안하기", need: [["예시", ["example", "examples"]]], hint: ["I like it, but maybe we should add more ~.", "I like it, but maybe we should…", "I like it, but maybe we should add more examples."], model: "I like it, but maybe we should add more examples." },
    { say: "Good idea. Let's meet again on Friday.", want: "좋다고, 단체 채팅방을 만들자고 하기", need: [["채팅방", ["chat", "group"]]], hint: ["Sounds good. Let's make a group ~.", "Sounds good. Let's make a group…", "Sounds good. Let's make a group chat."], model: "Sounds good. Let's make a group chat.", chunk: ["Sounds good", "좋아요", "제안에 찬성할 때 가장 흔한 말이에요."] }
  ],
  overhear: [
    ["guest", "Can I take the research part?", [["the research part", "조사 부분", "맡을 역할은 the ~ part라고 해요."]]],
    ["them", "Sure. Can you send it to me by Wednesday?"],
    ["guest", "No problem. I'll keep you posted.", [["I'll keep you posted", "진행 상황 알려 줄게요", "중간중간 소식을 전하겠다는 말이에요."]]],
    ["them", "Thanks. You're a lifesaver.", [["You're a lifesaver", "덕분에 살았어요", "도움에 크게 고마워할 때 써요."]]]
  ]
};
const GYM = {
  who: "Tyler", whoKo: "헬스장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 회원",
  turns: [
    { say: "Hey! Welcome in. First time here?", want: "네, 등록하고 싶다고 하기", need: [["등록", ["sign up", "join", "membership", "register"]]], hint: ["Yes, I'd like to ~ up.", "Yes, I'd like to sign…", "Yes, I'd like to sign up."], model: "Yes, I'd like to sign up.", chunk: ["sign up", "등록하다", "가입·신청은 거의 다 sign up이라고 해요."] },
    { say: "Great. We have monthly and yearly plans.", want: "한 달짜리는 얼마냐고 묻기", need: [["얼마", ["how much"]], ["한 달", ["month", "monthly"]]], hint: ["How much is the ~ plan?", "How much is the monthly…", "How much is the monthly plan?"], model: "How much is the monthly plan?" },
    { say: "It's forty dollars a month.", want: "샤워실도 있냐고 묻기", need: [["샤워", ["shower", "showers"]]], hint: ["Do you have ~?", "Do you have showers…", "Do you have showers here?"], model: "Do you have showers here?" },
    { say: "Yes, and towels are free. Want a quick tour?", want: "네, 좋다고 하기", need: [["좋다", ["yes", "sure", "great", "sounds good", "please", "love"]]], hint: ["Sure, that would be ~!", "Sure, that would be…", "Sure, that would be great!"], model: "Sure, that would be great!" }
  ],
  overhear: [
    ["guest", "Excuse me, are you using this machine?", [["are you using", "쓰고 계세요?", "헬스장에서 기구를 쓸 때 꼭 묻는 말이에요."]]],
    ["them", "No, go ahead.", [["go ahead", "그러세요", "상대에게 먼저 하라고 할 때 써요."]]],
    ["guest", "Thanks. How do I adjust the seat?", [["adjust the seat", "의자 높이를 맞추다", "adjust는 '조절하다'예요."]]],
    ["them", "Just pull this lever."]
  ]
};
const CHECKOUT = {
  who: "Emma", whoKo: "호텔 직원", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
  turns: [
    { say: "Good morning! Checking out?", want: "네, 체크아웃한다며 카드 열쇠 돌려주기", need: [["체크아웃", ["check out", "checking out", "checkout"]]], hint: ["Yes, I'd like to ~. Here's my key card.", "Yes, I'd like to check out…", "Yes, I'd like to check out. Here's my key card."], model: "Yes, I'd like to check out. Here's my key card." },
    { say: "How was your stay?", want: "정말 좋았다고 하기", need: [["좋았다", ["great", "good", "wonderful", "amazing", "perfect", "lovely", "nice"]]], hint: ["It was ~, thank you.", "It was great…", "It was great, thank you."], model: "It was great, thank you." },
    { say: "Glad to hear it. Here's your receipt.", want: "오후 3시까지 짐을 맡길 수 있냐고 묻기", need: [["짐", ["bags", "bag", "luggage", "suitcase"]], ["맡기기", ["leave", "keep", "store", "hold"]]], hint: ["Could I ~ my bags here until three?", "Could I leave my bags…", "Could I leave my bags here until three?"], model: "Could I leave my bags here until three?", chunk: ["leave my bags", "짐을 맡기다", "체크아웃 뒤 짐을 맡길 때 써요."] },
    { say: "Of course. Just come back to the desk.", want: "3시에 택시를 불러 줄 수 있냐고 묻기", need: [["택시", ["taxi", "cab"]]], hint: ["Could you call me a ~ at three?", "Could you call me a taxi…", "Could you call me a taxi at three?"], model: "Could you call me a taxi at three?", chunk: ["call me a taxi", "택시를 불러 주다", "'나를 택시라고 불러'가 아니라 '택시 불러 줘'예요."] }
  ],
  overhear: [
    ["guest", "Hi, I think there's a mistake on my bill.", [["a mistake on my bill", "계산서가 잘못됐어요", "요금이 이상할 때 이렇게 말해요."]]],
    ["them", "Let me take a look.", [["Let me take a look", "제가 볼게요", "확인해 주겠다는 말이에요."]]],
    ["guest", "I didn't use the minibar."],
    ["them", "You're right. I'll take that off.", [["take that off", "그걸 빼다", "요금에서 빼 준다는 말이에요."]]]
  ]
};
const SOUVENIR = {
  who: "Hannah", whoKo: "기념품 가게 주인", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
  turns: [
    { say: "Hi! Looking for anything special?", want: "가족에게 줄 선물을 찾는다고 하기", need: [["선물", ["gift", "gifts", "present", "presents", "souvenir", "souvenirs"]]], hint: ["I'm looking for ~ for my family.", "I'm looking for gifts…", "I'm looking for gifts for my family."], model: "I'm looking for gifts for my family.", chunk: ["I'm looking for", "~을 찾고 있어요", "가게에서 원하는 걸 말할 때 써요."] },
    { say: "These mugs are really popular.", want: "다른 색도 있냐고 묻기", need: [["다른 색", ["color", "colors", "colour", "colours"]]], hint: ["Does this come in other ~?", "Does this come in…", "Does this come in other colors?"], model: "Does this come in other colors?", chunk: ["come in", "(색·크기로) 나오다", "Does it come in blue?처럼 써요."] },
    { say: "Yes, blue and green.", want: "파란 걸로 세 개 사겠다고 하기", need: [["세 개", ["three"]]], hint: ["I'll take ~ blue ones.", "I'll take three…", "I'll take three blue ones."], model: "I'll take three blue ones." },
    { say: "Great choice! Would you like them gift-wrapped?", want: "네, 포장해 달라고 하기", need: [["포장", ["yes", "please", "wrap", "sure"]]], hint: ["Yes, ~. That would be nice.", "Yes, please…", "Yes, please. That would be nice."], model: "Yes, please. That would be nice.", chunk: ["gift-wrapped", "선물 포장된", "선물용으로 싸 준다는 말이에요."] }
  ],
  overhear: [
    ["guest", "Do you have anything cheaper?", [["anything cheaper", "더 싼 거", "가격을 낮춰 묻는 부드러운 말이에요."]]],
    ["them", "These keychains are three for ten dollars.", [["three for ten dollars", "세 개에 10달러", "묶음 가격을 말하는 방식이에요."]]],
    ["guest", "Perfect, I'll take them."],
    ["them", "Do you need a bag?"]
  ]
};
const GOODBYE = {
  who: "Sara", whoKo: "모임에서 만난 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
  turns: [
    { say: "I can't believe you're leaving today!", want: "나도, 시간이 너무 빨리 갔다고 하기", need: [["빨리", ["fast", "quickly", "flew", "quick"]]], hint: ["Me neither. Time went by so ~.", "Me neither. Time went by…", "Me neither. Time went by so fast."], model: "Me neither. Time went by so fast.", chunk: ["Me neither", "나도 (그래)", "부정문에 맞장구칠 땐 Me too 대신 Me neither예요."] },
    { say: "Thanks for hanging out with me.", want: "나야말로 고맙다고, 정말 재밌었다고 하기", need: THANKS, hint: ["No, thank ~! I had so much fun.", "No, thank you…", "No, thank you! I had so much fun."], model: "No, thank you! I had so much fun.", chunk: ["hang out", "같이 놀다", "친구와 시간을 보낸다는 뜻이에요."] },
    { say: "We should keep in touch!", want: "물론이지, 매주 메시지 하겠다고 하기", need: [["연락", ["message", "text", "call", "dm", "write", "keep in touch"]]], hint: ["Of course! I'll ~ you every week.", "Of course! I'll message…", "Of course! I'll message you every week."], model: "Of course! I'll message you every week.", chunk: ["keep in touch", "연락하고 지내다", "헤어질 때 꼭 하는 말이에요."] },
    { say: "And come visit again soon!", want: "다음엔 네가 한국에 오라고 하기", need: [["한국", ["korea", "seoul"]]], hint: ["Next time, you should come to ~!", "Next time, you should come…", "Next time, you should come to Korea!"], model: "Next time, you should come to Korea!" }
  ],
  overhear: [
    ["guest", "Have a safe flight!", [["Have a safe flight", "조심히 가", "비행기 타는 사람에게 하는 인사예요."]]],
    ["them", "Let me know when you land.", [["Let me know when you land", "도착하면 알려 줘", "land는 비행기가 '내리다'예요."]]],
    ["guest", "I'm going to miss you guys.", [["I'm going to miss you", "보고 싶을 거야", "헤어질 때 마음을 전하는 말이에요."]]],
    ["them", "We'll miss you too!"]
  ]
};
const CHECKIN = {
  who: "Victor", whoKo: "항공사 직원", voices: { them: "m", guest: "f2" }, guestKo: "다른 승객",
  turns: [
    { say: "Hi! Where are you flying today?", want: "서울 간다며 여권 건네기", need: [["서울", ["seoul", "korea", "incheon"]]], hint: ["To ~. Here's my passport.", "To Seoul…", "To Seoul. Here's my passport."], model: "To Seoul. Here's my passport." },
    { say: "Thank you. Are you checking any bags?", want: "가방 하나만 부친다고 하기", need: [["하나", ["one", "a bag", "this"]]], hint: ["Just ~ bag.", "Just one…", "Just one bag."], model: "Just one bag.", chunk: ["checking any bags", "부칠 짐", "비행기에 짐을 맡기는 걸 check라고 해요."] },
    { say: "Would you like a window or an aisle seat?", want: "창가 자리 달라고 하기", need: [["창가", ["window"]]], hint: ["A ~ seat, please.", "A window…", "A window seat, please."], model: "A window seat, please.", chunk: ["aisle", "통로", "s는 소리가 안 나요. '아일'이라고 읽어요."] },
    { say: "Here's your boarding pass. Boarding starts at five.", want: "몇 번 게이트인지 묻기", need: [["게이트", ["gate"]]], hint: ["Which ~ is it?", "Which gate…", "Which gate is it?"], model: "Which gate is it?", chunk: ["boarding pass", "탑승권", "비행기 탈 때 보여 주는 표예요."] }
  ],
  overhear: [
    ["guest", "Is my bag overweight?", [["overweight", "무게 초과", "짐이 너무 무거울 때 써요."]]],
    ["them", "It's two kilos over. You can move some things to your carry-on.", [["carry-on", "기내 가방", "비행기 안에 들고 타는 짐이에요."]]],
    ["guest", "Okay, give me a second.", [["give me a second", "잠깐만요", "잠시 기다려 달라는 말이에요."]]],
    ["them", "Take your time.", [["Take your time", "천천히 하세요", "서두르지 말라는 친절한 말이에요."]]]
  ]
};
const PLANE = {
  who: "Ruth", whoKo: "옆자리 승객", voices: { them: "f", guest: "m2" }, guestKo: "승무원",
  turns: [
    { say: "Hi! Is this your bag? I think it's on my seat.", want: "죄송하다며 치우겠다고 하기", need: [["사과", ["sorry", "my bad"]]], hint: ["Oh, ~! Let me move it.", "Oh, sorry…", "Oh, sorry! Let me move it."], model: "Oh, sorry! Let me move it." },
    { say: "Thanks. Are you going home or traveling?", want: "집에 가는 길이라고, 일주일 있었다고 하기", need: [["집", ["home"]]], hint: ["I'm going ~. I was here for a week.", "I'm going home…", "I'm going home. I was here for a week."], model: "I'm going home. I was here for a week." },
    { say: "Nice! What was your favorite part?", want: "새 친구들을 사귄 게 제일 좋았다고 하기", need: [["친구", ["friend", "friends", "people"]]], hint: ["Making new ~ was the best part.", "Making new friends…", "Making new friends was the best part."], model: "Making new friends was the best part.", chunk: ["the best part", "제일 좋았던 점", "favorite part를 물으면 이렇게 답해요."] },
    { say: "That's so nice. Your English is really good, by the way.", want: "고맙다고, 이번 여행에서 많이 늘었다고 하기", need: [["고마움", ["thank", "thanks"]]], hint: ["Thanks! It got a lot ~ on this trip.", "Thanks! It got a lot better…", "Thanks! It got a lot better on this trip."], model: "Thanks! It got a lot better on this trip.", chunk: ["by the way", "그런데", "말머리를 바꿀 때 붙여요."] }
  ],
  overhear: [
    ["guest", "Would you like chicken or pasta?"],
    ["them", "Pasta, please. Could I get a blanket too?", [["Could I get a blanket", "담요 좀 주시겠어요?", "기내에서 필요한 걸 부탁할 때 써요."]]],
    ["guest", "Of course. Please fasten your seatbelt.", [["fasten your seatbelt", "안전벨트를 매다", "기내 방송에서도 꼭 들려요."]]],
    ["them", "Oh, sure. Thanks."]
  ]
};

const weekNight = n => ({ id: "night" + n, time: "22:00", title: "친구에게 오늘 이야기", me: true, img: "img/scenes/night.webp" });
const weekScene = (id, time, title, data) => ({ id, time, title, ...data, ...ART[id] });
const MORE_DAYS = [
  { title: "3일째 · 혼자 다니는 날", scenes: [weekScene("subway", "09:00", "지하철 표 사기", SUBWAY), weekScene("shop", "11:00", "옷 사이즈 바꾸기", SHOP), weekScene("salon", "14:00", "미용실", SALON), weekScene("photo", "16:00", "사진 부탁하기", PHOTO), weekNight(3)] },
  { title: "4일째 · 일이 꼬인 날", scenes: [weekScene("lost", "09:00", "분실물 센터", LOST), weekScene("wrong", "12:00", "잘못 나온 주문", WRONG), weekScene("room", "15:00", "방이 고장 났어요", ROOM), weekScene("clinic", "18:00", "병원 접수", CLINIC), weekNight(4)] },
  { title: "5일째 · 친해지는 날", scenes: [weekScene("market", "10:00", "과일 가게", MARKET), weekScene("movie", "13:00", "영화표 사기", MOVIE), weekScene("park", "16:00", "공원 산책", PARK), weekScene("home", "19:00", "친구 집 저녁", HOME), weekNight(5)] },
  { title: "6일째 · 배우는 날", scenes: [weekScene("class", "09:00", "어학원 첫 수업", CLASS), weekScene("foodtruck", "12:00", "푸드트럭 점심", FOODTRUCK), weekScene("team", "15:00", "조별 과제", TEAM), weekScene("gym", "18:00", "헬스장 등록", GYM), weekNight(6)] },
  { title: "7일째 · 떠나는 날", scenes: [weekScene("checkout", "09:00", "체크아웃", CHECKOUT), weekScene("souvenir", "11:00", "기념품 가게", SOUVENIR), weekScene("goodbye", "14:00", "친구와 작별", GOODBYE), weekScene("checkin", "16:00", "공항 체크인", CHECKIN), weekScene("plane", "19:00", "비행기 옆자리", PLANE), weekNight(7)] }
];
