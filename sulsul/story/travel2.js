// 목표: 여행 2부. 도시를 돌아다니며 생기는 일 — 지하철, 고장, 시장, 사진, 아플 때, 잃어버렸을 때, 내가 길을 알려 줄 때.
// lv = 그 수준부터 나오는 차례, 말 고르기의 "lv:2" = 그 수준부터 상대가 더 길게 말함.
EP({ id: "t9", part: "travel", who: "dan", time: "morning", title: "지하철 표 사기", need: { after: ["t4"] }, guest: "다른 승객",
  lines: {
    a: { say: [["lv:2", "Morning. The machines are down right now, so I'm selling tickets by hand. Where are you headed?"], [null, "Morning. Where are you going?"]], task: [["sight", "{sight}에 간다고 말해요"], [null, "가고 싶은 곳을 말해요"]],
      go: [{ m: [["목적지", ["museum", "beach", "market", "old town", "tower", "river", "castle", "harbor", "zoo", "gallery", "park", "palace", "cathedral", "church", "temple", "bridge", "mountain", "lake", "garden", "aquarium", "stadium", "sea", "ocean", "island", "mall", "downtown", "station", "go to", "going to", "headed", "heading", "ticket to", "want to go"]]], ex: "I'm going to the old town.", to: "b" }] },
    b: { say: "A single is three dollars. A day pass is eight, and you can ride all day.", task: "오늘 몇 번 탈지 생각해 보고 하나를 골라요",
      go: [
        { m: [["한 번", ["single", "one way", "one ticket", "just one", "three dollar"]]], ex: "Just a single, please. I'm only going once.", to: "c" },
        { m: [["하루권", ["day pass", "all day", "eight dollar", "pass"]]], ex: "I'll take the day pass. I want to go around all day.", reply: "Good call. Keep it in your pocket.", to: "c", tip: ["day pass", "하루 이용권", "하루 동안 마음껏 타는 표예요."] }] },
    c: { say: "Here you go. Take line two toward Riverside.", task: "몇 정거장인지 물어봐요",
      go: [{ m: [["몇 정거장", ["how many stop", "how many station", "how far", "how long", "number of stop"]]], ex: "How many stops is it?", to: "c2", tip: ["How many stops?", "몇 정거장이에요?", "지하철에서 가장 많이 묻는 말이에요."] }] },
    c2: { lv: 2, say: "Five stops, but you'll need to change at Central. It's a bit confusing.", task: "어디서 갈아타는지 다시 확인하고, 나가는 출구도 물어봐요",
      go: [{ m: [["갈아타기", ["i change", "where do i change", "where should i change", "change at", "transfer", "central", "change train", "switch"]], ["출구", ["exit", "way out", "which gate", "get out"]]], ex: "So I change at Central. Which exit should I take?", to: "d" }] },
    d: { say: "Exit four. You can't miss it.", task: "고맙다고 해요 (표는 어디에 찍는지도 물으면 더 좋아요)", more: { m: [["찍는 곳", ["where do i", "where should i", "how do i use", "tap", "scan", "put ticket", "insert", "gate"]]] },
      go: [{ m: [M.thx], ex: "Thanks! Where do I tap the ticket?", to: "end" }] }
  },
  bye: "Right there on the gate. Have a good one!",
  hear: [
    ["guest", "Excuse me, does this train stop at City Hall?", [["does this train stop at", "이 열차 ~에 서나요", "타기 전에 확인하는 말이에요."]]],
    ["them", "No, you want the other platform.", [["the other platform", "반대편 승강장", "방향이 틀렸을 때 들어요."]]],
    ["guest", "Oh no. How do I get over there?"],
    ["them", "Take the stairs and go across."]
  ] });

EP({ id: "t10", part: "travel", who: "mike", time: "evening", title: "방이 고장 났어요", need: { after: ["t3"] }, guest: "복도의 손님",
  lines: {
    a: { say: "Hi, maintenance. The front desk said something's wrong in your room?", task: "방에 뭐가 고장 났는지 말해요 (에어컨·온수·TV 중에서)",
      go: [
        { m: [["에어컨", ["air conditioner", "ac", "air conditioning", "too hot", "aircon"]]], ex: "Yes, the air conditioner isn't working.", set: { broke: "air conditioner" }, to: "b", tip: ["isn't working", "작동을 안 해요", "고장 났다고 할 때 broken보다 자주 써요."] },
        { m: [["온수", ["hot water", "shower", "water be cold", "warm water", "cold water"]]], ex: "There's no hot water in the shower.", set: { broke: "shower" }, to: "b" },
        { m: [["티비", ["tv", "television", "remote"]]], ex: "The TV won't turn on.", set: { broke: "TV" }, to: "b" }] },
    b: { say: [["lv:2", "Hmm, let me take a look… Yeah, this part has to be replaced, and I don't have one on me. When did you first notice it?"], [null, "Let me look. When did it start?"]], task: "언제부터 그랬는지 말해요",
      go: [{ m: [["언제", ["this morning", "last night", "yesterday", "today", "just now", "when i", "since", "hour ago", "ago", "this afternoon", "tonight", "after", "not sure", "do not know"]]], ex: "Since last night, I think.", to: "c" }] },
    c: { say: "I can't fix it tonight. I can move you to another room, or come back tomorrow morning.", task: "오늘 밤 어떻게 할지 내 사정에 맞게 골라요",
      go: [
        { m: [["방 옮기기", ["move", "another room", "different room", "new room", "change room", "switch room"]]], ex: "Could you move me to another room, please?", reply: "Sure. I'll get you a key for 512.", to: "d" },
        { m: [["내일 고치기", ["tomorrow", "morning", "come back", "stay here", "it be fine", "i can wait", "no need move"]]], ex: "Tomorrow morning is fine. I can wait.", reply: "Great. I'll be here at nine.", to: "d" }] },
    d: { lv: 3, say: "Sorry again for the trouble. Is there anything else that's bothering you about the room?", task: "다른 불편한 점 하나를 정중하게 말해요 (없으면 없다고, 이유를 붙여서)",
      go: [{ m: [["대답", ["also", "actually", "noise", "noisy", "smell", "dirty", "towel", "window", "light", "nothing else", "that be all", "everything else be", "no other"]]], ex: "Actually, it's a little noisy at night because of the elevator.", to: "e" }] },
    e: { say: "Thanks for your patience.", task: "괜찮다고, 와 줘서 고맙다고 해요",
      go: [{ m: [M.thx], ex: "No problem. Thanks for coming so quickly.", to: "end" }] }
  },
  bye: [["broke", "You're welcome. We'll get that {broke} sorted out."], [null, "You're welcome. Have a good night."]],
  hear: [
    ["guest", "Excuse me, my key card stopped working.", [["stopped working", "갑자기 안 돼요", "되던 게 안 될 때 써요."]]],
    ["them", "It happens. Just take it to the front desk."],
    ["guest", "Will they charge me for a new one?", [["charge me", "돈을 물리다", "요금이 나오는지 물을 때 써요."]]],
    ["them", "No, it's free."]
  ] });

EP({ id: "t10b", part: "travel", who: "patel", art: "landlord", time: "evening", title: "숙소에 문제가 생겼어요", need: { after: ["t3b"] }, guest: "이웃",
  lines: {
    a: { say: "Hello, {name}! How's the place? Everything okay?", task: "문제가 하나 있다고 말을 꺼내요 (온수가 안 나와요)",
      go: [{ m: [["온수", ["hot water", "shower", "water be cold", "warm water", "cold water", "water heater"]]], ex: "Actually, there's a problem. There's no hot water.", to: "b", tip: ["Actually, there's a problem", "저, 문제가 있어요", "actually로 시작하면 부드럽게 들려요."] }] },
    b: { say: [["lv:2", "Oh, I'm sorry about that. It's probably the boiler again — it's as old as I am. Have you tried the switch next to the sink?"], [null, "Oh, sorry. Did you try the switch by the sink?"]], task: "해 봤는데 안 된다고 말해요",
      go: [{ m: [["해 봄", ["i tried", "already", "yes", "i did", "turned it", "pressed", "i checked"]], ["안 됨", ["not work", "nothing happen", "still", "no luck", "did not help", "same", "no change"]]], ex: "Yes, I tried it, but it still doesn't work.", to: "c" }] },
    c: { say: "Okay. A repair person can come tomorrow at ten. Will you be home?", task: "그 시간에 집에 있는지 말해요",
      go: [
        { m: [["있음", ["yes", "i will be home", "i will be here", "that work", "works for me", "i be home", "fine", "no problem"]]], ex: "Yes, I'll be home at ten.", to: "d" },
        { m: [["없음", ["no", "out", "not be home", "will not be", "can not", "busy", "another time", "later", "earlier", "afternoon"]]], ex: "Sorry, I'll be out. Could he come in the afternoon?", to: "d", tip: ["I'll be out", "외출해요", "집에 없을 거라고 할 때 써요."] }] },
    d: { say: "No problem, I'll sort it out. Sorry for the trouble.", task: "괜찮다고, 빨리 도와줘서 고맙다고 해요",
      go: [{ m: [M.thx], ex: "That's okay. Thanks for helping so fast.", to: "end" }] }
  },
  bye: "Of course. Have a good night!",
  hear: [
    ["guest", "Is it okay if I park my bike in the hallway?", [["Is it okay if ~?", "~해도 괜찮아요?", "허락을 구하는 쉬운 말이에요."]]],
    ["them", "Please use the rack outside."],
    ["guest", "Got it. Sorry about that."],
    ["them", "No worries."]
  ] });

EP({ id: "t11", part: "travel", who: "joe", time: "morning", title: "과일 시장에서 흥정", need: { after: ["t5"] }, guest: "다른 손님",
  lines: {
    a: { say: "Good morning! Fresh peaches today! Want to try one?", task: "먹어 보겠다고 하든, 괜찮다고 하든 마음대로",
      go: [
        { m: [["먹어 보기", ["yes", "sure", "please", "i would love", "why not", "okay", "try one"]]], ex: "Sure, I'd love to try one.", reply: "Here you go. Sweet, right?", to: "b" },
        { m: [["사양", ["nothanks", "not today", "i be good", "maybe later", "i be okay", "no"]]], ex: "No, thanks. I'm just looking.", reply: "No problem. Look all you want.", to: "b", tip: ["I'm just looking", "그냥 구경하는 거예요", "가게에서 가장 쓸모 있는 말이에요."] }] },
    b: { say: "So, peaches are five dollars a kilo today.", task: "얼마나 살지 말해요 (반 킬로든 한 킬로든)",
      go: [{ m: [["양", ["half", "kilo", "one", "two", "few", "some", "#", "pound", "bag", "a little"]]], ex: "Half a kilo, please.", to: "c" }] },
    c: { say: [["lv:2", "Half a kilo, coming up. Between you and me, these won't last past Friday, so eat them soon. That's three dollars."], [null, "Okay. That's three dollars."]], task: "조금 깎아 줄 수 있는지 웃으면서 물어봐요",
      go: [{ m: [["깎기", ["discount", "cheaper", "lower", "better price", "two dollar", "deal", "two fifty", "less", "come down", "good price"]]], ex: "Could you give me a better price? Maybe two fifty?", to: "d", tip: ["Could you give me a better price?", "좀 깎아 주실 수 있어요?", "웃으면서 물어보면 기분 나쁘지 않아요."] }] },
    d: { say: "Ha! You're good at this. Okay, two fifty, just for you.", task: "고맙다고 하고, 내일 또 올 수도 있다고 해요",
      go: [{ m: [M.thx, ["또 오기", ["tomorrow", "come back", "again", "next time", "be back", "see you", "return"]]], ex: "Thank you! I might come back tomorrow.", to: "end" }] }
  },
  bye: "I'll save the good ones for you!",
  hear: [
    ["guest", "Are these strawberries in season?", [["in season", "제철인", "지금이 제철인지 물을 때 써요."]]],
    ["them", "Just started this week."],
    ["guest", "Can I get a small box?"],
    ["them", "Sure. That'll be four dollars."]
  ] });

EP({ id: "t12", part: "travel", who: "carlos", time: "day", title: "푸드트럭 점심", need: { after: ["t5"] }, guest: "뒤에 선 손님",
  lines: {
    a: { say: "Hey there! Tacos or burritos today?", task: "하나를 골라 주문해요",
      go: [
        { m: [["타코", ["taco"]]], ex: "Two tacos, please.", set: { truck: "tacos" }, to: "b" },
        { m: [["부리토", ["burrito"]]], ex: "One burrito, please.", set: { truck: "burrito" }, to: "b" }] },
    b: { say: "You got it. How spicy do you want it? Mild, medium, or hot?", task: "내 입맛대로 맵기를 골라요",
      go: [
        { m: [["순한", ["mild", "not spicy", "not too spicy", "a little spicy", "no spice"]]], ex: "Mild, please. I can't eat spicy food well.", set: { spice: "mild" }, to: "c" },
        { m: [["보통", ["medium", "normal", "regular"]]], ex: "Medium, please.", set: { spice: "medium" }, to: "c" },
        { m: [["매운", ["hot", "spicy", "very spicy", "extra spicy"]]], ex: "Hot, please. I'm Korean, I can handle it.", set: { spice: "hot" }, to: "c", tip: ["I can handle it", "감당할 수 있어요", "자신 있을 때 쓰는 말이에요."] }] },
    c: { say: [["spice=hot", "Ooh, brave! Everything on it? Onions, cilantro?"], [null, "Everything on it? Onions, cilantro?"]], task: "고수는 빼 달라고 해요",
      go: [{ m: [["빼기", ["no", "without", "hold", "skip", "leave out", "take out"]], ["고수", ["cilantro", "coriander"]]], ex: "Everything except cilantro. No cilantro, please.", to: "c2", tip: ["hold the ~", "~ 빼 주세요", "주문에서 뭔가 뺄 때 원어민이 자주 써요."] }] },
    c2: { lv: 2, say: "No cilantro, got it. You from around here? Don't see many visitors on this block.", task: "여행 중이라고 하고, 어떻게 이 트럭을 찾았는지 말해요 (아무 이유나)",
      go: [{ m: [["여행", ["traveling", "visiting", "trip", "tourist", "vacation", "just here", "here for", "not from here", "no"]], ["찾은 이유", ["smell", "saw", "line", "walking", "friend", "told me", "recommend", "online", "instagram", "review", "looked good", "because", "heard", "passing", "map", "found"]]], ex: "I'm just visiting. I saw the long line and got curious.", to: "d" }] },
    d: { say: "Alright, that's nine dollars.", task: "현금밖에 없는데 괜찮은지 물어봐요",
      go: [{ m: [["현금", ["cash", "bill", "dollar bill", "coins"]], ["괜찮은지", ["okay", "fine", "can i", "do you", "take", "accept", "is that", "only have"]]], ex: "I only have cash. Is that okay?", to: "end" }] }
  },
  bye: "Cash is king! Enjoy!",
  hear: [
    ["guest", "Is it always this busy?", [["this busy", "이렇게 바쁜", "this를 붙이면 '이 정도로'라는 뜻이에요."]]],
    ["them", "Only at lunch. Come at two, no line."],
    ["guest", "Good to know. What's your best seller?", [["best seller", "제일 잘 팔리는 것", "가게에서 추천을 받을 때 써요."]]],
    ["them", "The pork tacos, for sure."]
  ] });

EP({ id: "t13", part: "travel", who: "hannah", time: "day", title: "선물 고르기", need: { after: ["t11"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi! Looking for anything special?", task: "누구에게 줄 선물을 찾는지 말해요",
      go: [{ m: [["받을 사람", ["mom", "mother", "dad", "father", "parents", "sister", "brother", "friend", "girlfriend", "boyfriend", "grandma", "grandmother", "grandfather", "grandpa", "boss", "teacher", "family", "wife", "husband", "roommate", "coworker", "cousin"]]], ex: "I'm looking for a gift for my mom.", cap: "gift", to: "b", tip: ["a gift for ~", "~에게 줄 선물", "가게에 들어가면 이렇게 말하면 돼요."] }] },
    b: { say: [["gift", "How sweet. What's your {gift} like?"], [null, "How sweet. What are they like?"]], task: "그 사람이 뭘 좋아하는지 말해요",
      go: [{ m: [["좋아하는 것", ["like", "love", "enjoy", "into", "favorite", "drink", "coffee", "tea", "cook", "read", "flowers", "art", "cute", "travel", "wear"]]], ex: "She really likes tea and cute things.", to: "c" }] },
    c: { say: [["lv:2", "Then you might like these. The tea set is handmade by a local artist, so it's forty dollars. The little magnets are five, and they're our most popular item."], [null, "This tea set is forty dollars. The magnets are five."]], task: "예산에 맞는 걸로 골라요 — 이유도 한마디",
      go: [
        { m: [["찻잔", ["tea set", "forty", "first one", "the set"]]], ex: "I'll take the tea set. She'll love it.", set: { bought: "tea set" }, to: "d" },
        { m: [["자석", ["magnet", "five dollar", "cheaper", "second one"]]], ex: "I'll get the magnets. They're cheaper and easy to carry.", set: { bought: "magnets" }, to: "d" }] },
    d: { say: "Good choice. Would you like it gift-wrapped?", task: "포장해 달라고 해요 (얼마나 걸리는지도 물으면 더 좋아요)", more: { m: [["시간", ["how long", "take long", "how many minute", "much time"]]] },
      go: [{ m: [["포장", ["yes", "please", "wrap", "gift wrap"]]], ex: "Yes, please. How long will it take?", to: "end" }] }
  },
  bye: "Just a minute. Your family's going to love it!",
  hear: [
    ["guest", "Do you ship overseas?", [["ship overseas", "해외로 배송하다", "무거운 기념품을 살 때 물어봐요."]]],
    ["them", "Yes, but it takes about two weeks."],
    ["guest", "Can I get a receipt for the tax refund?", [["tax refund", "세금 환급", "여행자가 공항에서 돌려받는 세금이에요."]]],
    ["them", "Of course. Bring your passport to the counter."]
  ] });

EP({ id: "t14", part: "travel", who: "nate", time: "evening", title: "전망대에서 사진 부탁", need: { after: ["t9"] }, guest: "다른 관광객",
  lines: {
    a: { say: "Wow, what a view, huh?", task: "맞장구치고, 사진 한 장 찍어 줄 수 있는지 물어봐요",
      go: [{ m: [["사진 부탁", ["photo please", "picture please", "take a photo", "take a picture", "take my picture", "take my photo", "picture of me", "photo of me", "take one", "take picture", "take photo"]]], ex: "It's beautiful. Could you take a picture of me?", to: "b", tip: ["Could you take a picture of me?", "사진 좀 찍어 주실래요?", "여행에서 제일 많이 쓰는 부탁이에요."] }] },
    b: { say: "Sure! Just tell me how you want it.", task: "뒤에 건물이 다 나오게 찍어 달라고 해요",
      go: [{ m: [["배경", ["building", "background", "city", "behind me", "view", "skyline", "whole"]], ["나오게", ["in the picture", "in the photo", "show", "see", "include", "get", "with", "can you", "could you", "please", "make sure"]]], ex: "Could you get the whole city in the background?", to: "c" }] },
    c: { say: "Okay, say cheese! … How's that? Take a look.", task: "사진을 보니 눈을 감았어요. 한 장만 더 부탁해요",
      go: [{ m: [["한 장 더", ["one more", "another", "again", "take more", "second one"]]], ex: "Oh, my eyes are closed. Could you take one more?", to: "d" }] },
    d: { say: [["lv:2", "Ha, happens to me all the time. There we go, that one's a keeper. Are you traveling on your own?"], [null, "There you go. Are you here alone?"]], task: "혼자인지, 누구랑 왔는지 말해요",
      go: [
        { m: [["혼자", ["alone", "by myself", "on my own", "solo", "just me", "yes"]]], ex: "Yes, I'm traveling alone this time.", to: "e" },
        { m: [["같이", ["friend", "family", "with my", "girlfriend", "boyfriend", "sister", "brother", "parents", "no"]]], ex: "No, I'm here with a friend.", to: "e" }] },
    e: { say: "Nice. Want me to tell you the best spot for sunset?", task: "좋다고, 어디인지 물어봐요",
      go: [{ m: [["어디", ["where", "which spot", "what spot", "tell me", "please tell", "show me"]]], ex: "Yes, please! Where is it?", to: "end" }] }
  },
  bye: "The bridge by the river. Trust me!",
  hear: [
    ["guest", "Excuse me, are you in line?", [["are you in line?", "줄 서 계세요?", "줄 끝을 확인할 때 써요."]]],
    ["them", "No, go ahead.", [["go ahead", "먼저 하세요", "양보할 때 써요."]]],
    ["guest", "Thanks. How long is the wait to go up?"],
    ["them", "About twenty minutes."]
  ] });

EP({ id: "t15", part: "travel", who: "mia", time: "day", title: "옷 가게에서 교환", need: { after: ["t13"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi! Can I help you find something?", task: "어제 산 셔츠가 작아서 왔다고 말해요",
      go: [{ m: [["어제 산 것", ["yesterday", "bought", "got this", "this shirt", "last time", "the other day"]], ["작음", ["small", "tight", "not fit", "too little", "size"]]], ex: "I bought this shirt yesterday, but it's too small.", to: "b", tip: ["It doesn't fit", "안 맞아요", "크기가 안 맞을 때 가장 흔한 말이에요."] }] },
    b: { say: "Oh, I'm sorry. Do you have your receipt?", task: "영수증을 사실대로 — 있으면 건네고, 없으면 없다고",
      go: [
        { m: [["있음", ["here", "yes", "i have", "this be"]]], ex: "Yes, here it is.", to: "c" },
        { m: [["없음", ["no", "lost", "can not find", "do not have", "threw", "left it", "not with me", "forgot"]]], ex: "Sorry, I lost it. I paid by card, though.", to: "c2" }] },
    c: { say: "Great. Would you like a different size, or your money back?", task: "큰 사이즈로 바꿔 달라고 해요",
      go: [{ m: [["큰 사이즈", ["big size", "big one", "bigger size", "bigger", "larger", "medium", "large", "next size", "size up", "exchange", "different size", "one size up"]]], ex: "Could I exchange it for a larger size?", to: "d" }] },
    c2: { say: [["lv:2", "Normally we can't do anything without a receipt, but if you paid by card, I can look up the purchase. Do you still have the card with you?"], [null, "I can look it up with your card. Do you have it?"]], task: "카드를 건네며 큰 사이즈로 바꾸고 싶다고 해요",
      go: [{ m: [["카드", ["card", "here", "this be"]], ["큰 사이즈", ["big size", "big one", "bigger size", "bigger", "larger", "medium", "large", "next size", "exchange", "different size", "size up"]]], ex: "Here's my card. I'd like to exchange it for a larger size.", to: "d" }] },
    d: { say: "Let me check… We have a large, but only in blue. Is blue okay?", task: "파란색이 괜찮은지 내 마음대로 말해요",
      go: [
        { m: [["좋음", ["yes", "blue be", "that be fine", "okay", "sure", "no problem", "i like blue", "perfect"]]], ex: "Sure, blue is fine.", to: "end" },
        { m: [["환불", ["refund", "money back", "no", "do not like", "not really", "rather"]]], ex: "Not really. Could I get a refund instead?", to: "end" }] }
  },
  bye: "All done. Thanks for coming back!",
  hear: [
    ["guest", "Do you have this in a medium?", [["in a medium", "M 사이즈로", "색·크기를 물을 때 in을 써요."]]],
    ["them", "Let me check in the back.", [["in the back", "창고에", "가게 안쪽 창고를 말해요."]]],
    ["guest", "Where's the fitting room?", [["fitting room", "탈의실", "옷을 입어 보는 곳이에요."]]],
    ["them", "Just past the shoes on your right."]
  ] });

EP({ id: "t16", part: "travel", who: "grace", time: "day", title: "약국에서 증상 말하기", need: { after: ["t12"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hello. What can I get for you?", task: "어디가 아픈지 말해요 (머리·배·목 중에서)",
      go: [
        { m: [["머리", ["headache", "head hurt", "my head"]]], ex: "I have a really bad headache.", set: { sick: "headache" }, to: "b" },
        { m: [["배", ["stomach", "stomachache", "tummy", "belly", "diarrhea", "food poisoning", "throw up", "throwing up"]]], ex: "My stomach hurts. I think it was something I ate.", set: { sick: "stomach" }, to: "b", tip: ["something I ate", "뭘 잘못 먹었나 봐요", "배탈 났을 때 이유로 자주 말해요."] },
        { m: [["목", ["sore throat", "throat", "cough", "coughing"]]], ex: "I have a sore throat and a cough.", set: { sick: "throat" }, to: "b", tip: ["a sore throat", "목이 아픔", "아픈 증상은 have a ~로 말해요."] }] },
    b: { say: "I'm sorry to hear that. How long have you had it?", task: "언제부터 아팠는지 말해요",
      go: [{ m: [["기간", ["since", "day", "yesterday", "this morning", "last night", "hour", "today", "week", "ago", "just started"]]], ex: "Since last night.", to: "b2" }] },
    b2: { lv: 2, say: "Any fever? And are you taking any other medicine right now?", task: "열이 있는지, 다른 약을 먹는지 둘 다 답해요",
      go: [{ m: [["열", ["not have fever", "no fever", "not have any fever", "fever", "temperature"]], ["다른 약", ["medicine", "pill", "taking", "medication", "drug", "vitamin"]]], ex: "No fever, and I'm not taking any other medicine.", to: "c" }] },
    c: { say: "Okay, take this twice a day, after meals. It might make you sleepy.", task: "하루 몇 번, 언제 먹는지 내 말로 확인해요",
      go: [{ m: [["두 번", ["twice", "two time", "two a day"]], ["식후", ["after meal", "after eating", "after food", "after i eat", "after breakfast", "after lunch", "after dinner"]]], ex: "So twice a day, after meals. Got it.", to: "d" }] },
    d: { say: "Exactly. If it doesn't get better in two days, please see a doctor.", task: "고맙다고 하고, 근처에 병원이 있는지 물어봐요",
      go: [{ m: [["병원", ["clinic", "hospital", "doctor"]], ["근처", ["near", "around here", "close", "nearby", "where"]]], ex: "Thank you. Is there a clinic near here?", to: "end" }] }
  },
  bye: "There's one on Oak Street, just around the corner. Feel better soon!",
  hear: [
    ["guest", "Do I need a prescription for this?", [["a prescription", "처방전", "의사가 써 주는 약 종이예요."]]],
    ["them", "No, you can buy it over the counter.", [["over the counter", "처방 없이", "처방전 없이 살 수 있다는 뜻이에요."]]],
    ["guest", "Are there any side effects?", [["side effects", "부작용", "약을 살 때 물어봐요."]]],
    ["them", "It might upset your stomach a little."]
  ] });

EP({ id: "t17", part: "travel", who: "nora", time: "morning", title: "병원 접수", need: { after: ["t16"] }, guest: "대기 중인 환자",
  lines: {
    a: { say: [["lv:2", "Good morning. We are pretty full today, so I have to ask: do you have an appointment?"], [null, "Good morning. Do you have an appointment?"]], task: "예약은 없지만 진료를 받고 싶다고 해요",
      go: [{ m: [["예약 없음", ["no", "do not have", "without", "walk in", "not have"]], ["진료", ["see doctor", "see a doctor", "doctor", "appointment", "today", "check"]]], ex: "No, I don't. Can I see a doctor today?", to: "b", tip: ["see a doctor", "진료를 받다", "go to doctor보다 see a doctor가 자연스러워요."] }] },
    b: { say: [["sick=headache", "Okay. What seems to be the problem? Still the headache?"], ["sick=stomach", "Okay. What seems to be the problem? Your stomach?"], ["sick=throat", "Okay. What seems to be the problem? Your throat?"], [null, "Okay. What seems to be the problem?"]], task: "약을 먹어도 낫지 않는다고 설명해요",
      go: [{ m: [["약", ["medicine", "pill", "pharmacy", "took something"]], ["안 나음", ["not help", "not work", "not better", "not get better", "still", "worse", "same"]]], ex: "I took some medicine, but it's not getting better.", to: "c" }] },
    c: { say: "I see. Are you a local resident, or visiting? Do you have travel insurance?", task: "여행자이고 보험이 있는지 사실대로 말해요",
      go: [
        { m: [["보험 있음", ["i have insurance", "have travel insurance", "yes", "here be my insurance", "i do"]]], ex: "I'm a tourist, and yes, I have travel insurance.", to: "d", tip: ["travel insurance", "여행자 보험", "병원에서 꼭 물어봐요."] },
        { m: [["보험 없음", ["no", "not have", "do not have", "without"]]], ex: "I'm a tourist, and no, I don't have insurance.", to: "d2" }] },
    d: { say: "Good. Please fill out this form. The doctor will see you in about half an hour.", task: "쓰는 곳 하나를 모르겠다고, 도와 달라고 해요",
      go: [{ m: [["모름", ["not sure", "not understand", "do not know", "what do", "what be", "what should", "what does", "confus", "mean"]], ["이 칸", ["this", "here", "part", "line", "section", "form", "write"]]], ex: "Sorry, I'm not sure what to write here. Could you help me?", to: "end" }] },
    d2: { say: "Then it's eighty dollars for the visit. You'd pay after seeing the doctor. Is that okay?", task: "괜찮다고 하고, 카드로 낼 수 있는지 물어요",
      go: [{ m: [["괜찮음", ["okay", "fine", "that be", "no problem", "sure", "yes", "alright"]], ["카드", ["card", "credit"]]], ex: "That's fine. Can I pay by card?", to: "end" }] }
  },
  bye: "Of course. Please have a seat.",
  hear: [
    ["guest", "Excuse me, how much longer will it be?", [["how much longer", "얼마나 더", "기다릴 때 물어봐요."]]],
    ["them", "You're next, actually."],
    ["guest", "Oh, great. Can I get a copy of my records?", [["a copy of my records", "진료 기록 사본", "보험 청구에 필요해요."]]],
    ["them", "Yes, just ask at the desk when you're done."]
  ] });

EP({ id: "t18", part: "travel", who: "rosa", time: "day", title: "잃어버린 물건 찾기", need: { after: ["t9"] }, guest: "다른 사람",
  lines: {
    a: { say: "Lost and found. How can I help?", task: "뭘 잃어버렸는지 말해요",
      go: [{ m: [["물건", ["phone", "wallet", "bag", "backpack", "passport", "umbrella", "camera", "jacket", "laptop", "purse", "hat", "headphones", "earbuds", "airpods", "glasses", "keys"]]], ex: "I lost my wallet on the subway.", cap: "lost", to: "b", tip: ["I left my ~ on the subway", "지하철에 ~을 두고 내렸어요", "두고 내렸으면 left, 잃어버렸으면 lost예요."] }] },
    b: { say: [["lost", "I'm sorry. Can you describe your {lost}?"], [null, "I'm sorry. Can you describe it?"]], task: "색깔과 특징 하나를 설명해요",
      go: [{ m: [["색", ["black", "white", "brown", "red", "blue", "green", "gray", "grey", "pink", "yellow", "navy", "silver", "beige", "purple", "orange"]], ["특징", ["small", "big", "with", "has", "have", "leather", "old", "new", "sticker", "logo", "case", "zipper", "pocket", "photo", "card", "name", "strap", "brand", "cover"]]], ex: "It's black and small, with a sticker on it.", to: "c" }] },
    c: { say: "When and where do you think you lost it?", task: "언제 어디서 잃어버렸을 것 같은지 말해요",
      go: [{ m: [["언제", ["this morning", "today", "yesterday", "last night", "around", "about", "afternoon", "hour ago", "ago", "#"]], ["어디", ["line", "train", "subway", "station", "bus", "platform", "central", "near", "on the", "at the"]]], ex: "This morning, on line two.", to: "c2" }] },
    c2: { lv: 2, say: "All right. Do you remember which car you were in, or which direction the train was going?", task: "정확히 기억 안 나면 안 난다고, 어렴풋이 기억나는 것을 말해요",
      go: [{ m: [["기억", ["remember", "not sure", "maybe", "i think", "probably", "toward", "riverside", "front", "back", "middle", "last car", "first car"]]], ex: "I'm not sure, but I think it was near the front.", to: "d", tip: ["I'm not sure, but I think", "확실하진 않지만", "어렴풋이 기억날 때 써요."] }] },
    d: { say: "Let me check the back. … I'm sorry, nothing yet. Can you leave a phone number?", task: "전화번호 대신 호텔에 연락해 달라고 해요",
      go: [{ m: [["대신", ["hotel", "instead", "my place", "email", "front desk", "contact"]], ["연락", ["call", "contact", "reach", "email", "let me know", "leave", "message", "tell"]]], ex: "I don't have a local number. Could you contact my hotel instead?", to: "end" }] }
  },
  bye: "Of course. I'll call as soon as something comes in.",
  hear: [
    ["guest", "Hi, did anyone turn in a black umbrella?", [["turn in", "맡기다", "주운 물건을 맡길 때 써요."]]],
    ["them", "Let me see. Is this it?"],
    ["guest", "Yes! That's it! Do I need to sign anything?", [["sign", "서명하다", "물건을 찾을 때 해요."]]],
    ["them", "Just here, please."]
  ] });

EP({ id: "t19", part: "travel", who: "ben", time: "day", title: "이번엔 내가 알려 주기", need: { after: ["t14"] }, guest: "지나가던 사람",
  lines: {
    a: { say: "Excuse me, sorry to bother you. Do you speak English?", task: "영어를 조금 한다고 하고, 뭘 도와줄지 물어요",
      go: [{ m: [["영어", ["yes", "a little", "bit", "some", "i do", "i try", "i speak"]], ["도움", ["help", "what", "how can", "what do you need", "need something", "can i"]]], ex: "A little. How can I help?", to: "b" }] },
    b: { say: [["sight", "Thank goodness! I'm trying to find the {sight}, but my phone died."], [null, "Thank goodness! I'm looking for the subway station, but my phone died."]], task: "방향을 알려 줘요 (직진하다가 왼쪽 같은 식으로)",
      go: [{ m: [["방향", ["straight", "left", "right", "turn", "down this", "this way", "that way", "cross", "walk", "next to", "across"]]], ex: "Go straight and turn left at the bank.", to: "c", tip: ["turn left at ~", "~에서 왼쪽으로", "길을 알려 줄 때는 명령문이 가장 쉬워요."] }] },
    c: { say: [["lv:2", "Okay, straight and then left. Is it far from here? I've got a heavy bag, and I've been walking for an hour."], [null, "Okay. Is it far?"]], task: "얼마나 걸리는지 말해요 (정확히 몰라도 대충)",
      go: [{ m: [["시간", ["minute", "not far", "close", "pretty far", "far", "hour", "not sure", "i think", "#", "short walk"]]], ex: "Not far. Maybe ten minutes on foot.", to: "d" }] },
    d: { say: "You're a lifesaver. Are you from here?", task: "나도 여행자라고, 며칠 전에 왔다고 해요",
      go: [{ m: [["나도", ["tourist", "traveler", "visiting", "i be not", "no", "just here", "trip", "here for"]], ["언제", ["day", "week", "yesterday", "ago", "recently", "just got", "just arrived", "#"]]], ex: "No, I'm a tourist too. I got here a few days ago.", to: "end" }] }
  },
  bye: "Wow, your English is great. Thanks again!",
  hear: [
    ["guest", "Sorry, I'm not from around here.", [["I'm not from around here", "저 여기 사람 아니에요", "길을 물어봤을 때 모르면 이렇게 말해요."]]],
    ["them", "No worries. Thanks anyway!", [["Thanks anyway", "어쨌든 고마워요", "도움을 못 받았어도 하는 인사예요."]]],
    ["guest", "Try asking at that shop."],
    ["them", "Good idea, I will."]
  ] });

EP({ id: "t20", part: "travel", who: "sam", art: "call", time: "day", title: "전화로 식당 예약", need: { after: ["t6"] }, guest: "식당 손님",
  lines: {
    a: { say: "Thanks for calling Sal's Kitchen, this is Sam. How can I help you?", task: "오늘 저녁 예약을 하고 싶다고 말해요",
      go: [{ m: [["예약", ["reservation", "book a table", "book table", "reserve", "table for"]]], ex: "Hi, I'd like to make a reservation for tonight.", to: "b", tip: ["make a reservation", "예약하다", "전화 예약의 첫마디예요."] }] },
    b: { say: "Sure. For how many people, and what time?", task: "인원과 시간을 한 번에 말해요",
      go: [{ m: [["인원", ["two", "one", "three", "four", "five", "six", "just me", "people", "of us", "person"]], ["시간", ["#", "seven", "eight", "six", "pm", "oclock", "evening", "tonight at"]]], ex: "Two people, at seven, please.", to: "c" }] },
    c: { say: [["lv:2", "Let me take a look. Seven's fully booked, I'm afraid, but I could squeeze you in at six thirty, or there's eight fifteen if that's easier."], [null, "Sorry, seven is full. Six thirty or eight fifteen?"]], task: "둘 중 괜찮은 시간을 골라요",
      go: [
        { m: [["여섯 시 반", ["six thirty", "earlier", "first one", "half past six"]]], ex: "Six thirty works.", to: "d" },
        { m: [["여덟 시 십오 분", ["eight fifteen", "later", "second one", "quarter past eight"]]], ex: "Eight fifteen is better.", to: "d" }] },
    d: { say: "Perfect. Can I get a name?", task: "이름을 말하고, 철자를 불러 줘요",
      go: [{ m: [["이름", ["{name}", "my name", "name be", "under"]]], ex: "It's {name}. Let me spell that for you.", to: "e", tip: ["Let me spell that", "철자를 불러 드릴게요", "이름을 전화로 말할 때 꼭 필요해요."] }] },
    e: { say: "Got it, thanks. See you tonight!", task: "창가 자리면 좋겠다고 부탁하고 인사해요",
      go: [{ m: [["창가", ["window"]]], ex: "Thank you. A window table would be great, if possible.", to: "end" }] }
  },
  bye: "I'll make a note of it. Bye now!",
  hear: [
    ["guest", "Hi, I need to cancel my reservation.", [["cancel my reservation", "예약을 취소하다", "못 가게 됐을 때 전화로 말해요."]]],
    ["them", "No problem. What's the name?"],
    ["guest", "Park. Sorry about the short notice.", [["short notice", "갑작스러운 연락", "늦게 알려서 미안할 때 써요."]]],
    ["them", "That's okay, thanks for letting us know."]
  ] });
