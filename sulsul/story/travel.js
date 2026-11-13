// 목표: 여행. 일주일 여행 — 도착 → 이동 → 숙소 → 동네 → 문제 해결 → 단골. 내가 한 말(왜 왔는지, 보고 싶은 곳, 음료)이 뒤 이야기에 다시 나온다.
EP({ id: "t1", part: "travel", who: "reed", time: "morning", title: "입국 심사", guest: "다른 여행객",
  lines: {
    a: { say: "Good morning. Passport, please.", task: "여권을 건네요 (인사도 같이 하면 더 좋아요)", more: { m: [["인사", ["good morning", "morning", "hi", "good day", "good afternoon", "good evening"]]] },
      go: [{ m: [["건네기", ["passport", "here you go", "here you are", "here it is", "this is it"]]], ex: "Good morning. Here's my passport.", to: "b" }] },
    b: { say: [["lv:2", "Thank you. It's been a long line today, sorry about that. So, what brings you here?"], [null, "Thank you. What brings you here?"]], task: "온 이유를 말해요 — 여행, 친구 만나기, 일 중 진짜에 가까운 걸로",
      go: [
        { m: [["여행", ["vacation", "holiday", "trip", "travel", "sightseeing", "tourist", "tour", "look around", "see the city", "sights", "relax", "for fun"]]], ex: "I'm here on vacation.", set: { purpose: "vacation" }, to: "c", tip: ["I'm here on vacation", "휴가로 왔어요", "for vacation보다 on vacation이 자연스러워요."] },
        { m: [["친구", ["friend", "visit", "cousin", "family", "relative", "aunt", "uncle", "sister", "brother", "parents", "boyfriend", "girlfriend", "see my", "meet my"]]], ex: "I'm visiting a friend.", set: { purpose: "visit" }, to: "c" },
        { m: [["일", ["business", "work", "conference", "meeting", "job", "company"]]], ex: "I'm here on business.", set: { purpose: "trip" }, to: "c" }] },
    c: { say: "How long are you staying?", task: "얼마나 있는지 말해요",
      go: [{ m: [["기간", ["#", "day", "week", "night", "month", "semester", "# year", "until", "few", "couple", ...DAYS_EN]]], ex: "For a week.", to: "d", tip: ["For a week", "일주일요", "기간은 for 하나면 돼요."] }] },
    d: { say: "And where will you be staying?", task: "처음 사흘은 시내 호텔에 묵는다고 말해요 (그다음 에어비앤비로 옮긴다고까지 말하면 더 좋아요)", more: { m: [["에어비앤비", ["airbnb", "apartment", "rental", "then", "after that", "move"]]] },
      go: [{ m: [["호텔", ["hotel"]]], ex: "At a hotel downtown for three nights, then an Airbnb.", to: "e" }] },
    e: { say: [["purpose", "Alright. Enjoy your {purpose}, and welcome."], [null, "Alright, welcome."]], task: "고맙다고 짧게 인사해요",
      go: [{ m: [M.thx], ex: "Thank you. Have a nice day.", to: "end" }] }
  },
  hear: [
    ["them", "Next, please. Do you have anything to declare?", [["anything to declare", "신고할 물건", "세관에서 꼭 나오는 말이에요."]]],
    ["guest", "No, just clothes and some gifts."],
    ["them", "Is this your first time here?"],
    ["guest", "No, I've been here twice before.", [["I've been here", "여기 와 본 적 있어요", "횟수는 twice, three times로 붙여요."]]]
  ] });

EP({ id: "t2", part: "travel", who: "omar", time: "day", title: "공항 택시", need: { after: ["t1"] }, guest: "앞 손님",
  lines: {
    a: { say: "Hi there! Where to?", task: "가야 할 곳을 말해요 (숙소 쪽으로)",
      go: [{ m: [["목적지", ["hotel", "hostel", "downtown", "station", "address", "street", "road", "avenue", "airbnb", "place", "apartment", "house", "inn", "motel", "center", "square", "take me", "go to", "this"]]], ex: "To the Grand Hotel downtown, please.", to: "b", tip: ["Where to?", "어디로 갈까요?", "택시 기사가 제일 먼저 하는 짧은 질문이에요."] }] },
    b: { say: [["lv:2", "Sure thing, hop in. Traffic's not too bad this time of day. Is this your first time in the city?"], [null, "Sure thing. First time in the city?"]], task: "처음인지 아닌지 사실대로 말해요 (한마디 덧붙이면 더 좋아요)", more: {},
      go: [
        { m: [["처음", ["first", "yes", "never been"]]], ex: "Yes, it's my first time. I'm so excited.", set: { first: "yes" }, to: "c" },
        { m: [["아님", ["no", "second", "before", "again", "been here", "times", "last year", "ago"]]], ex: "No, I was here two years ago.", set: { first: "no" }, to: "c" }] },
    c: { say: "Nice! What do you want to see while you're here?", task: "가 보고 싶은 곳 하나를 골라 말해요 (박물관·해변·시장·구시가지·전망탑·강가 중 마음대로)",
      go: [{ m: [["보고 싶은 곳", ["museum", "beach", "market", "old town", "tower", "river", "castle", "harbor", "zoo", "art gallery", "gallery", "park", "palace", "cathedral", "church", "temple", "bridge", "mountain", "lake", "garden", "aquarium", "stadium", "night market", "sea", "ocean", "island", "national park", "mall"]]], ex: "I really want to see the old town.", cap: "sight", to: "d" },
        { m: [["먹고 싶은 것", ["food", "eat", "restaurant", "dish", "taste"]]], ex: "I want to try the local food.", set: { sight: "night market" }, to: "d" }] },
    d: { say: [["sight", "Oh, the {sight}? Great choice. You'll love it."], [null, "Great choice."]], task: "거기 어떻게 가는지 물어봐요 (좋은 정보 고맙다고 하면 더 좋아요)", more: { m: [["고마움", ["thank", "appreciate", "cheers", "you saved me", "lifesaver", "so kind", "kind of you", "nice of you", "so helpful", "very helpful", "good tip", "great tip", "good to know", "great idea", "good idea", "sounds great", "can not wait"]]] },
      go: [{ m: [["가는 법", ["how do i get", "how can i get", "how get", "how do i go", "how can i go", "how i go", "how i can go", "how go", "get there", "go there", "best way", "which way", "way there", "directions"]]], ex: "Thanks for the tip! How do I get there?", to: "e", tip: ["How do I get there?", "거기 어떻게 가요?", "길 묻기의 기본이에요. there 대신 장소 이름을 넣어도 돼요."] }] },
    e: { say: "Take the subway, line two. Okay, here we are. That's thirty-two dollars.", task: "카드로 내도 되는지 묻고, 영수증도 부탁해요",
      go: [{ m: [["카드", ["card", "credit", "visa", "apple pay", "samsung pay"]], ["영수증", ["receipt"]]], ex: "Can I pay by card? And could I get a receipt?", to: "end" }] }
  },
  bye: "Here's your receipt. Enjoy the city!",
  hear: [
    ["guest", "Could you drop me off at the corner?", [["drop me off", "내려 주다", "택시에서 내릴 곳을 말할 때 써요."]]],
    ["them", "Sure. Right here is fine?"],
    ["guest", "Perfect. Keep the change.", [["Keep the change", "거스름돈은 가지세요", "잔돈을 팁으로 줄 때 써요."]]],
    ["them", "Thanks a lot. Have a good one!"]
  ] });

EP({ id: "t3", part: "travel", who: "emma", time: "day", title: "체크인", need: { after: ["t2"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi, welcome! Checking in?", task: "예약했다고, 내 이름으로 돼 있다고 말해요",
      go: [{ m: [["예약", ["i booked", "i have reservation", "i have booking", "made reservation", "reserved", "my reservation", "my booking", "reservation under", "reservation for", "booking under", "booking for", "under {name}", "booked under", "booked room", "book room", "have room"]], ["이름", ["under", "{name}", "name be", "my name", "name"]]], ex: "Yes, I have a reservation under {name}.", to: "b", tip: ["under ~", "~ 이름으로", "예약자 이름 앞에는 under를 써요."] }] },
    b: { say: "Got it. We have two rooms left — a quiet one facing the garden, or one with a city view. Which do you prefer?", task: "둘 중 하나를 골라요 — 이유를 붙이면 더 좋아요", more: { m: [["이유", ["because", "since", "love", "sleep", "sound", "prefer", "need", "rest", "amazing", "beautiful", "pretty", "tired", "light sleeper", "relax", "photo", "picture", "enjoy", "noise", "noisy", "work", "study", "wake up", "night"]]] },
      go: [
        { m: [["조용한 방", ["quiet", "garden", "first one", "silent", "peaceful"]]], ex: "The quiet one, please. I want to sleep well.", reply: "Room 204, right above the garden. You'll sleep like a baby.", to: "c" },
        { m: [["전망", ["view", "city", "second one"]]], ex: "The city view, please. It sounds amazing.", reply: "Room 1102 — the view at night is the best part.", to: "c" }] },
    c: { say: [["lv:2", "All done. Breakfast is served from seven to ten on the second floor, and the pool closes at nine. Is there anything else I can do for you?"], [null, "Done. Breakfast is from seven to ten. Anything else?"]], task: "와이파이 비밀번호를 물어요",
      go: [{ m: [["와이파이", ["wifi", "internet", "network"]], ["비밀번호", ["password", "code", "login", "log in", "connect", "how use", "can i use"]]], ex: "What's the Wi-Fi password?", to: "d" }] },
    d: { say: "It's on your key card. Is there anything else I can help with?", task: "체크아웃을 조금 늦게 해도 되는지 물어봐요",
      go: [{ m: [["늦게", ["late", "later", "noon", "afternoon", "extend", "extra", "more time", "until", "longer", "twelve", "one", "two"]], ["체크아웃", ["check out", "leave"]]], ex: "Could I check out a little late on my last day?", to: "e" }] },
    e: { say: [["lv:2", "Normally it's eleven, but since we're not full, one o'clock shouldn't be a problem. Enjoy your stay!"], [null, "Sure, until one is fine. Enjoy your stay!"]], task: "고맙다고 인사해요",
      go: [{ m: [M.thx], ex: "Thank you so much!", to: "end" }] }
  },
  hear: [
    ["guest", "Excuse me, could I get an extra towel?", [["an extra towel", "수건 하나 더", "extra는 '하나 더'예요."]]],
    ["them", "Of course. I'll send one up right away.", [["send one up", "올려 보내다", "객실로 갖다준다는 말이에요."]]],
    ["guest", "And is there a gym in the hotel?"],
    ["them", "Yes, on the second floor. It's open twenty-four hours."]
  ] });

EP({ id: "t3b", part: "travel", who: "patel", art: "landlord", time: "evening", title: "숙소 열쇠 받기", need: { after: ["t23"] }, guest: "이웃",
  lines: {
    a: { say: "Hi, you must be {name}! Welcome. I'm Mr. Patel, your host.", task: "맞다고, 반갑다고 인사해요",
      go: [{ m: [["맞음", ["yes", "that be me", "it be me", "{name}", "right", "hi", "nice meet", "good meet", "great meet", "thank"]]], ex: "Yes, that's me. Nice to meet you!", to: "b" }] },
    b: { say: [["lv:2", "Here are your keys. The big one's for the front door, and it sticks a little, so give it a good push. Do you have any questions?"], [null, "Here are your keys. The big one is for the front door. Any questions?"]], task: "쓰레기는 어디에 버리는지 물어봐요",
      go: [{ m: [["쓰레기", ["trash", "garbage", "rubbish", "recycling", "waste"]], ["어디", ["where", "how", "which"]]], ex: "Where do I put the trash?", to: "c", tip: ["take out the trash", "쓰레기를 내다 버리다", "집에서 가장 자주 쓰는 말 중 하나예요."] }] },
    c: { say: "The bins are by the back door. Recycling goes out on Tuesdays.", task: "나갈 때 열쇠는 어떻게 하면 되는지 물어봐요",
      go: [{ m: [["열쇠", ["key"]], ["나갈 때", ["leave", "check out", "go", "last day", "return", "give back", "done"]]], ex: "What should I do with the keys when I leave?", to: "d" }] },
    d: { say: "Just leave them on the kitchen table. Call me if anything breaks!", task: "고맙다고 인사해요",
      go: [{ m: [M.thx], ex: "Thank you so much. Have a good night!", to: "end" }] }
  },
  bye: "Good night — enjoy the neighborhood!",
  hear: [
    ["guest", "Excuse me, is the laundry room open now?", [["laundry room", "세탁실", "건물 같이 쓰는 세탁실이에요."]]],
    ["them", "Yes, until ten at night."],
    ["guest", "Do I need coins for the machines?", [["coins", "동전", "세탁기에 넣는 동전이에요."]]],
    ["them", "No, you can pay with a card now."]
  ] });

EP({ id: "t4", part: "travel", who: "leo", time: "morning", title: "동네 카페", need: { after: ["t3"] }, guest: "다음 손님",
  lines: {
    a: { say: "Morning! What can I get for you?", task: "마시고 싶은 걸 주문해요 (라테·아메리카노·차·핫초코 중 마음대로)",
      go: [{ m: [["음료", ["latte", "americano", "tea", "hot chocolate", "cappuccino", "cold brew", "coffee", "espresso", "mocha", "flat white", "chai", "matcha", "green tea"]]], ex: "Can I get a latte, please?", cap: "drink", to: "b", tip: ["Can I get ~?", "~ 주세요", "주문할 때 가장 흔한 말이에요."] }] },
    b: { say: [["drink", "One {drink}. Hot or iced?"], [null, "Hot or iced?"]], task: "뜨겁게인지 차갑게인지 골라요",
      go: [
        { m: [["뜨겁게", ["hot", "warm"]]], ex: "Hot, please.", set: { temp: "hot" }, to: "c" },
        { m: [["차갑게", ["iced", "ice", "cold", "not hot"]]], ex: "Iced, please.", set: { temp: "iced" }, to: "c" }] },
    c: { say: [["lv:2", "Coming right up. It gets pretty busy around now, so can I grab a name for the order?"], [null, "Can I get a name for the order?"]], task: "내 이름을 말해요",
      go: [{ m: [["이름", ["{name}", "my name", "name be", "call me"]]], ex: "It's {name}.", to: "d" }] },
    d: { say: "Cool. You're not from around here, are you? Where are you from?", task: "어디서 왔는지 말해요 (막 도착했다고 붙이면 더 좋아요)", short: 1, more: { m: [["막 도착", ["just arrived", "just got here", "just landed", "arrived", "got here", "landed", "came here", "yesterday", "today", "this morning", "last night", "new here", "few days", "first day", "first week"]]] },
      go: [{ m: [["출신", M.from[1].filter(w => w !== "from")]], ex: "I'm from Korea. I just got here yesterday.", cap: "from", to: "e", tip: ["I just got here", "막 도착했어요", "get here = 여기 도착하다."] },
        { m: [["출신", ["from", "born", "grew up"]]], ex: "I'm from a small town. I just got here today.", fallback: 1, to: "e" }] },
    e: { say: "Welcome! If you need anything around here, just ask.", task: "내일 또 오겠다고 해요 (고맙다는 말도 하면 더 좋아요)", more: { m: [["고마움", ["thank", "appreciate", "cheers", "you saved me", "lifesaver", "so kind", "kind of you", "nice of you", "so helpful", "very helpful", "you are sweet", "so sweet"]]] },
      go: [{ m: [["또 오기", ["come back", "see you", "tomorrow", "again", "next time", "be back", "come by", "later", "return", "every day", "every morning"]]], ex: "Thanks! I'll come back tomorrow.", to: "end" }] }
  },
  bye: "See you tomorrow!",
  hear: [
    ["guest", "Hi, could I get an oat milk latte?", [["oat milk", "귀리 우유", "우유 대신 고를 수 있는 것: soy, almond, oat"]]],
    ["them", "Sure. For here or to go?", [["For here or to go?", "드시고 가세요, 가져가세요?", "카페에서 꼭 나오는 질문이에요."]]],
    ["guest", "To go, please."],
    ["them", "You got it. That's five fifty.", [["You got it", "그렇게 할게요", "부탁을 들어줄 때 짧게 하는 말이에요."]]]
  ] });

EP({ id: "t5", part: "travel", who: "tom", time: "day", title: "길 묻기", need: { after: ["t4"] }, guest: "다른 여행객",
  lines: {
    a: { say: "You look a little lost. Need some help?", task: [["sight", "전에 말한 {sight}에 가는 길을 물어봐요 (도와 달라는 말로 시작하면 더 좋아요)"], [null, "가는 길을 물어봐요 (도와 달라는 말로 시작하면 더 좋아요)"]], more: { m: [["도움 청하기", ["yes please", "please", "excuse me", "help me", "could you help", "can you help", "i am lost", "lost", "yes", "thank", "sorry", "actually"]]] },
      go: [{ m: [["가는 법", ["how do i get", "how can i get", "how get", "how go", "how i go", "where be", "way", "looking for", "get to", "go to", "find", "directions"]]], ex: "Yes, please. How do I get to the {sight}?", to: "b" }] },
    b: { say: [["sight", "The {sight}? Sure. Go straight two blocks, then turn left at the bank. The subway entrance is right there."], [null, "Sure. Go straight two blocks, then turn left at the bank."]], task: "잘 못 알아들은 척 — 한 번 더 천천히 말해 달라고 해요",
      go: [{ m: [["다시 말해 달라", ["again", "repeat", "one more time", "say that", "pardon", "sorry", "come again", "slowly", "slower", "did not catch", "not understand", "what did you say"]]], ex: "Sorry, could you say that again more slowly?", to: "c", tip: ["Could you say that again?", "다시 말해 줄래요?", "못 알아들어도 괜찮아요. 이 말만 있으면 돼요."] }] },
    c: { say: "No problem. Straight… two blocks… left at the bank.", task: "들은 걸 내 말로 확인해요 (두 블록, 은행에서 왼쪽)",
      go: [{ m: [["두 블록", ["two block", "second block", "two street"]], ["왼쪽", ["left"]]], ex: "Two blocks, then left at the bank. Got it.", to: "d", tip: ["Got it", "알겠어요", "이해했다고 짧게 확인할 때 써요."] }] },
    d: { say: [["lv:2", "Exactly, you've got it. It's about a ten-minute walk, and you'll pass a little bakery on the way that's worth stopping at."], [null, "Exactly. It's about a ten-minute walk."]], task: "고맙다고 해요 (덕분에 살았다고 붙이면 더 좋아요)", more: { m: [["덕분에", ["saved me", "you saved", "lifesaver", "life saver", "so helpful", "very helpful", "big help", "huge help", "could not have", "you are the best", "so kind", "kind of you", "nice of you", "really appreciate", "thank god", "without you", "you are amazing"]]] },
      go: [{ m: [M.thx], ex: "Thanks a lot. You really saved me.", to: "end" }] }
  },
  bye: "Anytime. Enjoy your trip!",
  hear: [
    ["guest", "Excuse me, is this the right way to the museum?", [["the right way to", "~ 가는 길이 맞나요", "길이 맞는지 확인할 때 써요."]]],
    ["them", "Yes, just keep going. You can't miss it.", [["You can't miss it", "금방 찾을 거예요", "아주 찾기 쉽다는 뜻이에요."]]],
    ["guest", "How long does it take on foot?", [["on foot", "걸어서", "걸어서 가는 시간을 물을 때 써요."]]],
    ["them", "About fifteen minutes."]
  ] });

EP({ id: "t6", part: "travel", who: "sam", time: "evening", title: "저녁 식당", need: { after: ["t4"] }, guest: "옆 테이블 손님",
  lines: {
    a: { say: "Good evening! Just one tonight?", task: "혼자라고 말하고, 창가 자리가 있는지 물어요",
      go: [{ m: [["혼자", ["one", "just me", "only me", "myself", "alone", "solo", "single"]], ["창가", ["window"]]], ex: "Just me. Do you have a table by the window?", to: "b" }] },
    b: { say: [["lv:2", "Sure, right this way. Here's the menu, and tonight's specials are on the back. Before I forget, are there any food allergies I should know about?"], [null, "Sure, right this way. Here's the menu. Any food allergies I should know about?"]], task: "알레르기가 있는지 사실대로 말해요 (없으면 없다고)",
      go: [
        { m: [["없음", ["no", "none", "nothing", "i be fine", "do not have", "not have any", "not allergic", "no allergy"]]], ex: "No, I don't have any allergies.", to: "c" },
        { m: [["알레르기", ["allergic", "allergy", "can not eat", "can not have", "do not eat"]]], ex: "Yes, I'm allergic to nuts.", to: "c2", tip: ["I'm allergic to ~", "~ 알레르기가 있어요", "allergic 뒤에는 to를 써요."] }] },
    c: { say: "Great. Do you know what you'd like, or do you need a minute?", task: "뭘 추천하는지 물어봐요",
      go: [{ m: [["추천", ["recommend", "recommendation", "popular", "best", "good here", "suggest", "suggestion", "what be good", "special", "favorite", "signature", "what should i"]]], ex: "What do you recommend?", to: "d" }] },
    c2: { say: "Thanks for telling me. I'll let the kitchen know. Do you know what you'd like?", task: "견과류 없는 걸로 추천해 달라고 해요",
      go: [{ m: [["추천", ["recommend", "suggest", "what be good", "what dish", "which", "what can i eat", "what should i", "anything"]], ["견과류 없이", ["without", "no nut", "nut free", "safe", "not have nut"]]], ex: "What do you recommend without nuts?", to: "d" }] },
    d: { say: "The grilled salmon is our favorite. Or the mushroom pasta if you want something lighter.", task: "둘 중 하나를 골라 주문해요",
      go: [
        { m: [["연어", ["salmon"]]], ex: "I'll have the salmon, please.", set: { dinner: "salmon" }, to: "e", tip: ["I'll have ~", "~로 할게요", "식당에서 주문을 정할 때 가장 흔해요."] },
        { m: [["파스타", ["pasta"]]], ex: "I'll have the pasta, please.", set: { dinner: "pasta" }, to: "e" }] },
    e: { say: [["dinner", "Here you go. … So, how was the {dinner}?"], [null, "Here you go. … So, how was everything?"]], task: "맛있었다고 하고, 계산서를 달라고 해요",
      go: [{ m: [["맛", ["delicious", "great", "amazing", "good", "tasty", "yummy", "loved", "perfect", "excellent", "fantastic", "nice", "wonderful"]], ["계산서", ["check", "bill", "pay", "receipt"]]], ex: "It was delicious. Could I get the check, please?", to: "end" }] }
  },
  bye: "Here you go. Thanks for coming!",
  hear: [
    ["guest", "Excuse me, could we split the bill?", [["split the bill", "나눠 내다", "여럿이 따로 계산할 때 써요."]]],
    ["them", "Of course. Together or separate?"],
    ["guest", "Separate, please. And is the tip included?", [["Is the tip included?", "팁 포함인가요?", "나라마다 달라서 물어보면 좋아요."]]],
    ["them", "No, it's not included."]
  ] });

EP({ id: "t7", part: "travel", who: "kevin", time: "day", title: "주문이 잘못 나왔어요", need: { after: ["t6"] }, guest: "옆 테이블 손님",
  lines: {
    a: { say: "Here's your chicken burger! Enjoy!", task: "치즈버거를 시켰는데 치킨버거가 나왔어요. 정중하게, 하지만 분명하게 말해요",
      go: [{ m: [["시킨 것", ["ordered", "order", "asked for", "wanted", "not mine", "not my", "wrong", "mistake"]], ["치즈버거", ["cheeseburger", "cheese"]]], ex: "Sorry, I think there's a mistake. I ordered a cheeseburger.", to: "b", tip: ["I think there's a mistake", "뭔가 잘못된 것 같아요", "따지기 전에 부드럽게 여는 말이에요."] }] },
    b: { say: [["lv:2", "Oh no, I'm so sorry about that, we've been slammed all day. I can have a new one made, but it'll be about fifteen minutes. Or, if you're in a hurry, I can refund you."], [null, "Oh no, I'm so sorry. I can make a new one, but it'll take about fifteen minutes. Or I can give you a refund."]], task: "새로 만들어 달라고 하든, 환불을 받든 — 내 상황에 맞게 골라요",
      go: [
        { m: [["새로", ["new one", "make", "wait", "another one", "that be fine", "it be okay", "no problem", "no hurry"]]], ex: "That's okay, I can wait. Please make a new one.", to: "c" },
        { m: [["환불", ["refund", "money back", "cancel", "in a hurry", "no time"]]], ex: "I'm in a bit of a hurry. Could I get a refund?", to: "c2" }] },
    c: { say: "Thank you for being so patient. Can I get you a drink on the house while you wait?", task: "물 한 잔이면 된다고 해요 (고맙다는 말도 하면 더 좋아요)", more: { m: [["고마움", ["thank", "appreciate", "cheers", "you saved me", "lifesaver", "so kind", "kind of you", "nice of you", "so helpful", "very helpful", "that is kind", "so sweet", "that is nice", "you are sweet"]]] },
      go: [{ m: [["물", ["water"]]], ex: "That's kind of you. Just water is fine.", to: "end" }] },
    c2: { say: "Of course. Here's your refund. Again, I'm really sorry.", task: "괜찮다고 해요 (다음에 또 오겠다고 붙이면 더 좋아요)", more: { m: [["또 오기", ["come back", "next time", "another time", "again", "be back", "another day", "return", "try later", "some other time"]]] },
      go: [{ m: [M.ok], ex: "It's okay. I'll come back another time.", to: "end" }] }
  },
  hear: [
    ["guest", "Excuse me, this is a little cold.", [["a little cold", "좀 식었어요", "a little을 붙이면 덜 세게 들려요."]]],
    ["them", "I'm sorry about that. Let me heat it up for you.", [["heat it up", "데우다", "음식을 다시 데워 줄 때 써요."]]],
    ["guest", "Thanks, I appreciate it."],
    ["them", "It'll just be a minute."]
  ] });

EP({ id: "t8", part: "travel", who: "leo", time: "morning", title: "단골 카페", need: { after: ["t5", "t7"], rel: { leo: 1 } }, guest: "다음 손님",
  lines: {
    a: { say: [["drink", "Hey, {name}! The usual? {temp} {drink}?"], [null, "Hey, {name}! The usual?"]], task: "늘 먹던 걸로 하든, 오늘은 다른 걸 시키든 마음대로 (기억해 줘서 반갑다고 하면 더 좋아요)", more: { m: [["반가움", ["remember", "can not believe", "nice of you", "so sweet", "you are sweet", "glad", "love that", "you know me", "wow", "amazing", "aw", "of course you do", "best"]]] },
      go: [
        { m: [["그대로", ["yes", "usual", "please", "perfect", "remember", "same", "as always", "of course", "sure"]]], ex: "Yes, please! I can't believe you remember.", to: "b", tip: ["The usual?", "늘 드시던 걸로요?", "단골에게 하는 말이에요."] },
        { m: [["바꾸기", ["something different", "something new", "change", "try", "instead", "different", "actually", "not today"]]], ex: "Wow, you remember! But I'd like to try something different today.", to: "a2" }] },
    a2: { say: "Ooh, adventurous! Our seasonal special is a honey cinnamon latte.", task: "그걸로 해 보겠다고 해요",
      go: [{ m: [["시도", ["try", "i will have", "i will take", "sounds good", "let us go", "shot", "why not", "sure", "okay", "yes", "that one"]]], ex: "Sounds good. I'll try that.", set: { drink: "honey cinnamon latte" }, to: "b" }] },
    b: { say: [["first=no", "So how's this trip going? Different from last time?"], ["from", "So how's your trip going so far? Pretty different from {from}, huh?"], [null, "So how's your trip going so far?"]], task: "지금까지 여행이 어떤지 — 좋았던 것 하나와 힘들었던 것 하나를 말해요",
      go: [{ m: [["좋은 점", ["love", "great", "amazing", "good", "fun", "beautiful", "nice", "enjoy", "wonderful", "awesome", "fantastic", "delicious", "kind", "like"]], ["힘든 점", ["but", "although", "except", "hard", "difficult", "tired", "mistake", "lost", "expensive", "crowded", "jet lag", "confusing", "problem", "bad", "though", "headache", "miss"]]], ex: "It's great. I love the food, but I got a little lost yesterday.", to: "c", tip: ["so far", "지금까지", "아직 끝나지 않은 일에 대해 물을 때 붙여요."] }] },
    c: { say: "Ha, everyone gets lost here. You've got a few more days, right? Any plans?", task: "남은 날 계획을 하나 말해요",
      go: [{ m: [["계획", ["going", "plan", "want", "will", "thinking", "tomorrow", "next", "maybe", "hope", "would like", "i go", "visit"]]], ex: "I'm going to visit the old town tomorrow.", to: "c2" }] },
    c2: { lv: 2, say: "Nice. If you could only do one more thing before you leave, what would it be?", task: "떠나기 전에 딱 하나만 할 수 있다면 뭘 할지 말해요",
      go: [{ m: [["하고 싶은 것", ["would", "want", "i'd", "probably", "maybe", "go", "eat", "see", "visit", "try"]]], ex: "I would go back to the river at sunset.", to: "end", tip: ["I would ~", "~할 것 같아요", "가정해서 말할 때 would를 써요."] }] }
  },
  bye: "Sounds fun. This one's on the house — have a great day!",
  hear: [
    ["guest", "Could I get a refill?", [["a refill", "리필", "같은 음료를 다시 채워 달라는 말이에요."]]],
    ["them", "Sure, refills are half price."],
    ["guest", "Great. Can I sit outside?"],
    ["them", "Of course, take any table you like."]
  ] });
