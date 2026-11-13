// 목표: 여행 3부. 다시 만난 사람들, 떠나기 전 정리, 돌아가는 비행기 — 앞에서 내가 한 말이 돌아온다.
EP({ id: "t21", part: "travel", who: "omar", time: "evening", title: "막히는 길, 택시 안에서", need: { after: ["t16"] }, guest: "무전기 속 동료",
  lines: {
    a: { say: [["lv:2", "Oh, it's you again! Small city, huh? Traffic's terrible tonight, there's some kind of concert downtown. Where are we headed?"], [null, "Hey, it's you again! Where to tonight?"]], task: "시내 기차역에 가야 하는데, 8시까지 도착해야 한다고 말해요",
      go: [{ m: [["기차역", ["train station", "the station", "station", "central"]], ["시간", ["eight", "by #", "before #", "at #", "#"]]], ex: "To the train station, please. I have to be there by eight.", to: "b", tip: ["by eight", "8시까지", "그때까지 끝나야 하면 by를 써요."] }] },
    b: { say: "Eight? That's tight. The highway's faster but there's a five-dollar toll. Or we take the side streets and hope.", task: "빠른 길로 가든, 돈을 아끼든 내 사정대로 골라요",
      go: [
        { m: [["고속도로", ["highway", "faster", "fast way", "first one", "toll", "quick"]]], ex: "Let's take the highway. I can't miss my train.", reply: "Smart. Hold on!", to: "c" },
        { m: [["옆길", ["side street", "cheaper", "save", "second one", "no toll", "small road"]]], ex: "Let's try the side streets. I want to save money.", reply: "Okay, I know a few shortcuts.", to: "c" }] },
    c: { say: "Almost there. Hey, the meter says twenty-eight, but with the credit card fee it's thirty.", task: "카드 수수료가 있다는 말을 처음 들었어요. 왜 더 내야 하는지 정중하게 물어봐요",
      go: [{ m: [["왜", ["why", "what for", "what be", "how come", "explain", "do i have to", "i did not know"]], ["요금", ["fee", "extra", "two dollar", "more", "charge", "thirty"]]], ex: "Sorry, why is there an extra fee?", to: "c2" }] },
    c2: { lv: 3, say: "It's the card company, they take a cut. I don't make the rules, my friend.", task: "그럼 현금으로 내겠다고, 잔돈은 필요 없다고 해요",
      go: [{ m: [["현금", ["cash"]], ["잔돈", ["keep the change", "keep it", "change"]]], ex: "Then I'll pay in cash. Keep the change.", to: "d" }] },
    d: { say: "Thanks. And here we are, with four minutes to spare!", task: "시간 맞춰 와 줘서 고맙다고 인사해요",
      go: [{ m: [M.thx], ex: "Thank you so much. You really saved me.", to: "end" }] }
  },
  bye: "Anytime! Safe travels.",
  hear: [
    ["guest", "Omar, the bridge is closed. Avoid it.", [["Avoid it", "피해 가요", "길을 피하라는 말이에요."]]],
    ["them", "Got it. Is there an accident?", [["an accident", "사고", "길이 막히는 흔한 이유예요."]]],
    ["guest", "Yes, near exit nine. It's bumper to bumper.", [["bumper to bumper", "차가 꽉 막힌", "차들이 붙어 있을 만큼 막혔다는 말이에요."]]],
    ["them", "Thanks for the heads-up.", [["heads-up", "미리 알려 줌", "미리 경고해 줄 때 써요."]]]
  ] });

EP({ id: "t22", part: "travel", who: "emma", time: "morning", title: "당일치기 투어 예약", need: { after: ["t10"] }, guest: "다른 손님",
  lines: {
    a: { say: "Good morning! Any plans for today?", task: "하루짜리 투어가 있는지 물어봐요",
      go: [{ m: [["투어", ["tour", "day trip", "excursion", "trip"]], ["있는지", ["do you", "be there", "any", "can you", "could you", "can i", "i would like", "i want", "looking for", "recommend"]]], ex: "Do you have any day tours?", to: "b", tip: ["day trip", "당일치기 여행", "하루에 다녀오는 여행이에요."] }] },
    b: { say: [["lv:2", "We do. There's a wine country tour that includes lunch, and a coastal hike, which is cheaper but quite demanding, so you'd want good shoes."], [null, "There's a wine tour with lunch, or a coastal hike."]], task: "하나를 골라요 — 왜 그게 좋은지 한마디",
      go: [
        { m: [["와인", ["wine", "first one", "lunch"]]], ex: "The wine tour sounds nice. I want to relax.", set: { tour: "wine tour" }, to: "c" },
        { m: [["하이킹", ["hike", "hiking", "coast", "second one", "walk"]]], ex: "The coastal hike, please. I love hiking.", set: { tour: "coastal hike" }, to: "c" }] },
    c: { say: "The next one leaves tomorrow at nine and gets back around six. It's sixty dollars. Shall I book you a spot?", task: "예약해 달라고 하고, 취소해도 돈을 돌려받는지 물어봐요",
      go: [{ m: [["예약", ["yes", "please", "book", "sign me up", "sure", "i will take"]], ["취소", ["cancel", "refund", "money back", "change my mind"]]], ex: "Yes, please. Can I get a refund if I cancel?", to: "d", tip: ["Can I get a refund if I cancel?", "취소하면 환불돼요?", "예약할 때 꼭 물어보면 좋아요."] }] },
    d: { say: "Up to twenty-four hours before, yes.", task: "뭘 챙겨 가야 하는지 물어봐요",
      go: [{ m: [["챙길 것", ["bring", "pack", "need", "wear", "take with"]]], ex: "What should I bring?", to: "end" }] }
  },
  bye: "Water, a hat, and comfortable shoes. Have a wonderful time!",
  hear: [
    ["guest", "Could you call a taxi for me?", [["call a taxi", "택시를 불러 주다", "호텔 프런트에 부탁할 수 있어요."]]],
    ["them", "Certainly. Where are you going?"],
    ["guest", "To the airport. How long does it take at this hour?", [["at this hour", "이 시간에", "시간대를 말할 때 써요."]]],
    ["them", "About forty minutes."]
  ] });

EP({ id: "t23", part: "travel", who: "emma", time: "morning", title: "체크아웃, 이상한 요금", need: { after: ["t22"] }, guest: "다른 손님",
  lines: {
    a: { say: [["tour", "Good morning! Checking out? How was the {tour}, by the way?"], [null, "Good morning! Checking out today?"]], task: "체크아웃한다고 하고, 지낸 소감을 한마디 해요",
      go: [{ m: [["체크아웃", ["check out", "yes", "leaving", "time to go"]], ["소감", ["great", "good", "love", "amazing", "wonderful", "fun", "beautiful", "enjoy", "perfect", "nice", "tired", "awesome"]]], ex: "Yes, I'm checking out. It was wonderful, thank you.", to: "b" }] },
    b: { say: "Glad to hear it. Here's your bill. It comes to four hundred and twenty dollars.", task: "미니바를 쓴 적 없는데 요금이 있어요. 정중하게 짚어요",
      go: [{ m: [["미니바", ["minibar", "mini bar", "drink", "snack", "this charge"]], ["안 씀", ["did not", "never", "not use", "not mine", "not take", "mistake", "wrong", "not have"]]], ex: "Excuse me, I didn't use the minibar. I think there's a mistake.", to: "c", tip: ["I think there's a mistake", "뭔가 잘못된 것 같아요", "따지기 전에 부드럽게 여는 말이에요."] }] },
    c: { say: [["lv:2", "Let me look into that. Hmm, you're right, it looks like housekeeping entered it under the wrong room. I do apologize. I've taken it off."], [null, "Oh, you're right. I'm sorry. I took it off."]], task: "괜찮다고 하고, 짐을 맡아 줄 수 있는지 물어봐요",
      go: [{ m: [["짐", ["bag", "luggage", "suitcase", "baggage"]], ["맡기기", ["leave", "keep", "store", "hold", "stay here", "until"]]], ex: "No problem. Could I leave my bags here until three?", to: "end", tip: ["Could I leave my bags here?", "짐 맡겨도 돼요?", "체크아웃 후에 여행할 때 필수예요."] }] }
  },
  bye: "Of course. Just give this tag to us when you're back!",
  hear: [
    ["guest", "Hi, I'd like to pay the rest in cash.", [["the rest", "나머지", "남은 금액을 말해요."]]],
    ["them", "Sure. Would you like a copy of the bill?"],
    ["guest", "Yes, could you email it to me?"],
    ["them", "Of course. It should arrive in a few minutes."]
  ] });

EP({ id: "t23b", part: "travel", who: "patel", art: "landlord", time: "morning", title: "열쇠 돌려주기", need: { after: ["t10b"] }, guest: "이웃",
  lines: {
    a: { say: "Good morning, {name}. Leaving already? That went by fast.", task: "오늘 떠난다고, 잘 지냈다고 말해요",
      go: [{ m: [["떠남", ["leaving", "today", "go home", "going home", "flight", "yes", "last day"]], ["소감", ["enjoy", "really", "great", "good", "love", "lovely", "comfortable", "wonderful", "perfect", "nice", "thank"]]], ex: "Yes, I'm leaving today. It was really comfortable, thank you.", to: "b" }] },
    b: { say: [["lv:2", "I'm so glad. And sorry again about that boiler, I finally had it replaced. You didn't have to clean up, you know. Did you leave the keys on the table?"], [null, "I'm glad. Did you leave the keys on the table?"]], task: "열쇠를 지금 건네주겠다고 해요",
      go: [{ m: [["열쇠", ["key", "them"]], ["건네기", ["here", "i have", "give", "right here", "with me"]]], ex: "Here are the keys. I have them with me.", to: "c" }] },
    c: { say: "Thank you. If you're ever back in town, call me. You were a great guest.", task: "좋은 후기를 남기겠다고 해요",
      go: [{ m: [["후기", ["review", "recommend", "five star", "good comment", "tell my friend", "rating"]]], ex: "I'll leave you a great review!", to: "end" }] }
  },
  bye: "That's very kind. Safe trip home!",
  hear: [
    ["guest", "Are you moving out?", [["moving out", "이사 나가는", "살던 곳에서 떠날 때 써요."]]],
    ["them", "No, just a guest leaving."],
    ["guest", "Oh, nice. Will the room be empty next week?"],
    ["them", "It's booked through June.", [["booked through", "~까지 예약이 찬", "through는 그때까지 쭉이에요."]]]
  ] });

EP({ id: "t24", part: "travel", who: "carlos", time: "day", title: "다시 찾은 푸드트럭", need: { after: ["t12", "t14"], rel: { carlos: 1 } }, guest: "뒤에 선 손님",
  lines: {
    a: { say: [["truck", "Hey, I remember you! {truck} again, {spice}?"], [null, "Hey, I remember you! The same again?"]], task: "기억해 줘서 놀랍다고 하고, 오늘은 새로운 걸 추천해 달라고 해요",
      go: [{ m: [["추천", ["recommend", "suggest", "something new", "something different", "what be good", "what should i", "surprise me", "new today", "what else"]]], ex: "Wow, you remember! What else do you recommend today?", to: "b", tip: ["Surprise me", "알아서 줘요", "메뉴를 맡길 때 쓰는 재미있는 말이에요."] }] },
    b: { say: "Try the fish tacos. My grandmother's recipe, and the sauce is amazing.", task: "그걸로 하겠다고 하며, 소스 비법이 뭔지 물어요",
      go: [{ m: [["주문", ["i will have", "i will try", "i will take", "let me try", "give me", "sounds good", "okay", "sure", "yes"]], ["궁금", ["secret", "what be in", "recipe", "how do you", "how did", "what do you put", "what kind", "tell me", "ingredient"]]], ex: "Sounds good. What's the secret in the sauce?", to: "c" }] },
    c: { say: [["lv:2", "If I told you, I'd have to hire you! It's mostly lime and smoked chili. So, what's been the best thing you've eaten here so far?"], [null, "Lime and chili! What's the best food you had here?"]], task: "여기서 먹은 것 중 최고를 말해요",
      go: [{ m: [["음식", ["taco", "burrito", "salmon", "pasta", "burger", "peach", "coffee", "latte", "pizza", "steak", "soup", "noodle", "sandwich", "this", "your", "everything", "best"]]], ex: "Honestly, your tacos are the best thing I've had here.", to: "end" }] }
  },
  bye: "You're just saying that! This one's on me.",
  hear: [
    ["guest", "How long have you had this truck?", [["How long have you had", "~ 얼마나 됐어요?", "갖고 있던 기간을 물을 때 써요."]]],
    ["them", "Twelve years. Started with one grill."],
    ["guest", "That's amazing. Do you ever take a day off?", [["take a day off", "하루 쉬다", "일을 쉬는 날을 말해요."]]],
    ["them", "Sundays. My wife makes me."]
  ] });

EP({ id: "t25", part: "travel", who: "tom", time: "day", title: "길에서 다시 만난 사람", need: { after: ["t19"], rel: { tom: 1 } }, guest: "Tom의 친구",
  lines: {
    a: { say: "Hey! Weren't you the one who got lost near the bank? Did you find it okay?", task: "덕분에 잘 찾았다고, 또 만나서 반갑다고 해요",
      go: [{ m: [["찾음", ["found", "yes", "made it", "got there", "find it", "thanks to you", "because of you", "no problem"]], ["반가움", ["good to see", "nice to see", "great to see", "see you again", "what a surprise", "small world", "glad", "thank"]]], ex: "Yes, I found it, thanks to you. Good to see you again!", to: "b", tip: ["Small world!", "세상 좁네요!", "우연히 다시 만났을 때 써요."] }] },
    b: { say: [["lv:2", "Ha, likewise. So you've been here a while now. Honestly, most tourists only see the same three places. Have you discovered anything off the beaten path?"], [null, "So what's your favorite place here so far?"]], task: "여기서 제일 좋았던 곳과 이유를 말해요",
      go: [{ m: [["좋았던 곳", ["museum", "beach", "market", "old town", "tower", "river", "bridge", "park", "cafe", "garden", "harbor", "my favorite", "the best", "i love", "i really like", "really liked"]], ["이유", ["because", "since", "so", "view", "quiet", "food", "people", "beautiful", "atmosphere", "peaceful", "fun", "vibe", "cheap"]]], ex: "I love the old town because it's so quiet.", to: "c" }] },
    c: { say: "Good taste. Do you want a local tip before you go?", task: "좋다고, 현지인이 가는 맛집을 물어봐요",
      go: [{ m: [["맛집", ["restaurant", "where to eat", "where do you eat", "place to eat", "food", "good place", "local", "eat"]]], ex: "Yes, please. Where do locals like to eat?", to: "end" }] }
  },
  bye: "Go to Rosie's on Fifth. Tell them Tom sent you!",
  hear: [
    ["guest", "Do you two know each other?", [["know each other", "서로 아는 사이", "두 사람이 아는 사이인지 물을 때 써요."]]],
    ["them", "Sort of. I gave them directions last week."],
    ["guest", "That's so you. Always helping people.", [["That's so you", "너답다", "그 사람다운 행동을 보고 하는 말이에요."]]],
    ["them", "What can I say?"]
  ] });

EP({ id: "t26", part: "travel", who: "ava", time: "evening", title: "혼자 보는 영화", need: { after: ["t18"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi! What can I get for you?", task: "7시 코미디 영화 한 장을 달라고 해요",
      go: [{ m: [["표", ["ticket", "one for", "one adult", "one seat", "one please"]], ["코미디", ["comedy", "seven", "that movie", "this movie"]]], ex: "One ticket for the seven o'clock comedy, please.", to: "b" }] },
    b: { say: [["lv:2", "I'm so sorry, the seven o'clock just sold out, it's been crazy with the holiday. I've got one at nine fifteen, or there's a horror movie starting in ten minutes."], [null, "Sorry, seven is sold out. Nine fifteen, or a horror movie now?"]], task: "늦게라도 코미디를 볼지, 공포 영화를 바로 볼지 골라요",
      go: [
        { m: [["늦은 코미디", ["nine", "later", "comedy", "first one", "i can wait"]]], ex: "I'll take the nine fifteen. I can wait.", to: "c" },
        { m: [["공포", ["horror", "scary", "ten minute", "second one"]]], ex: "I'll try the horror movie. Why not?", to: "c" }] },
    c: { say: "Great. Do you need subtitles? We have English subtitles at this one.", task: "자막이 있으면 좋겠다고, 영어 듣기가 아직 어렵다고 말해요",
      go: [{ m: [["자막", ["subtitle", "caption", "yes", "please"]], ["이유", ["listening", "hard", "difficult", "not good", "easier", "help", "understand", "my english", "learning"]]], ex: "Yes, please. Listening is still hard for me.", to: "end" }] }
  },
  bye: "No problem at all. Your English sounds great, by the way. Enjoy!",
  hear: [
    ["guest", "How long is the movie?", [["How long is the movie?", "영화 몇 시간이에요?", "시간 맞출 때 물어봐요."]]],
    ["them", "A little over two hours."],
    ["guest", "Are there any previews before it starts?", [["previews", "예고편", "본 영화 전에 나와요."]]],
    ["them", "Yes, about fifteen minutes."]
  ] });

EP({ id: "t27", part: "travel", who: "joe", time: "morning", title: "시장의 단골", need: { after: ["t11", "t21"], rel: { joe: 1 } }, guest: "다른 손님",
  lines: {
    a: { say: "Look who's back! How were those peaches?", task: "맛있었다고, 오늘도 사러 왔다고 해요",
      go: [{ m: [["맛", ["delicious", "great", "amazing", "good", "tasty", "sweet", "loved", "perfect", "best"]]], ex: "They were delicious! I came back for more.", to: "b" }] },
    b: { say: "Good, good. I've got something special. Figs, only for a week each year. Have you had them fresh?", task: "먹어 봤는지 사실대로 — 없으면 무슨 맛인지 물어봐요",
      go: [
        { m: [["먹어 봄", ["yes", "i have", "i had", "i tried", "love fig", "i ate"]]], ex: "Yes, I've had them. I love figs.", reply: "Then you know. These are better.", to: "c" },
        { m: [["처음", ["no", "never", "not yet", "what do", "what be it like", "how do", "what taste", "taste like"]]], ex: "No, never. What do they taste like?", reply: "Like honey and flowers. Here, take one.", to: "c", tip: ["What does it taste like?", "무슨 맛이에요?", "처음 보는 음식을 만나면 꼭 쓰는 말이에요."] }] },
    c: { say: [["lv:2", "So when do you fly home? I'll need to know when to stop saving you the good ones. My wife says I talk to customers too much."], [null, "When do you go home?"]], task: "언제 떠나는지 말하고, 아쉽다고 해요",
      go: [{ m: [["언제", [...DAYS_EN, "#", "day", "soon", "week"]], ["아쉬움", ["miss", "sad", "wish", "do not want", "not ready", "too bad", "unfortunately", "shame", "already"]]], ex: "On Sunday. I'm going to miss this place.", to: "end", tip: ["I'm going to miss ~", "~이 그리울 거예요", "헤어질 때 자주 쓰는 말이에요."] }] }
  },
  bye: "Then these are a gift. Come back next year!",
  hear: [
    ["guest", "How much for the whole box?", [["the whole box", "한 상자 전부", "낱개 말고 통째로 살 때 써요."]]],
    ["them", "For you, twelve dollars."],
    ["guest", "Can you do ten?"],
    ["them", "Eleven, and I'll throw in a lemon.", [["throw in", "덤으로 주다", "시장에서 덤을 줄 때 써요."]]]
  ] });

EP({ id: "t28", part: "travel", who: "leo", time: "morning", title: "단골 카페와 작별", need: { after: ["t8", "t27"] }, guest: "다음 손님",
  lines: {
    a: { say: [["drink", "Morning, {name}! One more {drink}?"], [null, "Morning, {name}! The usual?"]], task: "오늘이 마지막 날이라고 말해요",
      go: [{ m: [["마지막", ["last day", "last morning", "last time", "leaving", "going home", "flying home", "fly home", "my flight", "final day"]]], ex: "Yes, please. Actually, today is my last day here.", to: "b" }] },
    b: { say: [["lv:2", "No way, already? I feel like you just walked in here looking totally jet-lagged. What's the one thing you'll tell people about this place?"], [null, "Already? What will you tell your friends about this place?"]], task: "친구들에게 이곳을 뭐라고 소개할지 말해요",
      go: [{ m: [["소개", ["people", "friendly", "food", "coffee", "beautiful", "kind", "great", "love", "city", "amazing", "best", "cafe", "you"]]], ex: "I'll tell them the people here are so friendly.", to: "c" }] },
    c: { say: "That's really nice. Here, sign the wall. All our regulars do.", task: "영광이라고, 많이 고마웠다고 전해요",
      go: [{ m: [M.thx], ex: "It's an honor. Thank you for everything, Leo.", to: "end", tip: ["Thank you for everything", "전부 고마웠어요", "작별할 때 쓰는 따뜻한 말이에요."] }] }
  },
  bye: "Safe flight. Don't be a stranger!",
  hear: [
    ["guest", "Are you moving away?", [["moving away", "멀리 이사 가는", "떠나는지 물을 때 써요."]]],
    ["them", "Not me. A regular's going home today."],
    ["guest", "Aw. Those are the hardest goodbyes.", [["the hardest goodbyes", "가장 힘든 작별", "정든 사람과 헤어질 때 써요."]]],
    ["them", "Tell me about it.", [["Tell me about it", "내 말이요", "완전히 공감할 때 써요."]]]
  ] });

EP({ id: "t29", part: "travel", who: "victor", time: "morning", title: "공항 체크인, 짐이 무거워요", need: { after: ["t28"] }, guest: "뒤의 승객",
  lines: {
    a: { say: "Good morning. Passport and booking number, please.", task: "여권을 건네고, 창가 자리가 있는지 물어요",
      go: [{ m: [["건네기", ["passport", "here", "this be"]], ["창가", ["window", "aisle"]]], ex: "Here's my passport. Can I get a window seat?", to: "b" }] },
    b: { say: [["lv:2", "Let me see what I can do. All right, I've got 24A for you. Could you put your suitcase up on the scale? Hmm, unfortunately it's four kilos over the limit, so there'd be a fee."], [null, "24A. Hmm, your bag is four kilos too heavy. There's a fee."]], task: "요금이 얼마인지 묻거나, 짐을 빼겠다고 해요",
      go: [
        { m: [["요금", ["how much", "what be fee", "cost", "price"]]], ex: "How much is the fee?", reply: "Forty dollars.", to: "c" },
        { m: [["빼기", ["take some", "out of my", "take out", "take something", "move", "carry on", "backpack", "remove", "put in my"]]], ex: "Can I take something out and put it in my backpack?", reply: "Sure, go ahead. Step aside for a moment.", to: "c", tip: ["carry-on", "기내용 가방", "들고 타는 짐이에요."] }] },
    c: { say: "All set. Boarding starts at ten forty at gate eighteen.", task: "게이트가 어느 쪽인지 물어봐요",
      go: [{ m: [["게이트", ["gate", "which way", "where be", "how do i get", "direction"]]], ex: "Which way is gate eighteen?", to: "end" }] }
  },
  bye: "Through security and turn right. Have a good flight!",
  hear: [
    ["guest", "Is my flight on time?", [["on time", "제시간에", "지연이 없는지 물을 때 써요."]]],
    ["them", "It's delayed about thirty minutes.", [["delayed", "지연된", "공항에서 가장 많이 듣는 말이에요."]]],
    ["guest", "Will I make my connection?", [["make my connection", "환승편을 타다", "갈아탈 비행기 시간이 걱정될 때 써요."]]],
    ["them", "You should be fine."]
  ] });

EP({ id: "t30", part: "travel", who: "ruth", time: "day", title: "돌아가는 비행기", need: { after: ["t29"] }, guest: "승무원",
  lines: {
    a: { say: "Excuse me, is this seat taken? … Thanks. Heading home, or just starting your trip?", task: "집에 가는 길이라고, 여행 이야기를 한마디 해요",
      go: [{ m: [["집에", ["home", "going back", "heading back", "last day", "end of my trip", "korea", "seoul"]]], ex: "I'm going home. I had an amazing trip.", to: "b" }] },
    b: { say: [["sight", "How lovely! What was the highlight? The {sight}?"], [null, "How lovely! What was the highlight?"]], task: "여행에서 가장 좋았던 순간을 말해요",
      go: [{ m: [["순간", ["best", "favorite", "highlight", "love", "great", "amazing", "people", "food", "view", "when", "night", "walk", "meeting", "sunset"]]], ex: "The best part was meeting the people at my cafe.", to: "c" }] },
    c: { say: [["bought", "What a nice memory. I see you've got {bought} from the gift shop in that bag. Who's that for?"], [null, "What a nice memory. Did you buy any gifts?"]], task: [["gift", "{gift}에게 줄 선물이라고 말해요"], [null, "선물을 샀는지, 누구에게 줄 건지 말해요"]],
      go: [{ m: [["선물", ["bought", "got", "gift", "souvenir", "for my", "present", "magnet", "tea set", "no", "did not"]]], ex: "Yes, I got a little gift for my family.", to: "c2" }] },
    c2: { lv: 2, say: "That's thoughtful. Now that you've done it, what would you do differently if you went again?", task: "다시 간다면 뭘 다르게 할지 말해요",
      go: [{ m: [["다르게", ["would", "next time", "if i", "longer", "more", "less", "different", "stay", "book", "earlier"]]], ex: "I would stay longer and talk to more people.", to: "d", tip: ["I would ~", "~할 것 같아요", "가정해서 말할 때 would를 써요."] }] },
    d: { say: "Well, your English is lovely. Was it hard, traveling in another language?", task: "처음엔 무서웠지만 이제 자신감이 생겼다고 말해요",
      go: [{ m: [["처음", ["at first", "first", "scared", "nervous", "hard", "difficult", "afraid", "before"]], ["지금", ["now", "confident", "better", "easier", "not scared", "can do", "more comfortable"]]], ex: "At first I was scared, but now I feel more confident.", to: "end", tip: ["At first", "처음엔", "변화를 말할 때 but now와 짝으로 써요."] }] }
  },
  bye: "Good for you. Now, I'm going to sleep. Safe travels, dear.",
  hear: [
    ["guest", "Would you like chicken or pasta?", [["chicken or pasta", "닭고기 아니면 파스타", "기내식에서 꼭 들어요."]]],
    ["them", "Pasta, please. And could I have some water?"],
    ["guest", "Please fasten your seatbelt. We're about to land.", [["fasten your seatbelt", "안전벨트를 매다", "비행기에서 꼭 듣는 말이에요."]]],
    ["them", "Oh, already? Thank you."]
  ] });
