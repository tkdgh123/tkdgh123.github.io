REASON[1].push("i need", "i want to", "i have", "i do not", "i can not", "i must", "i stay", "i use", "i call", "i study", "i like", "it be", "not need", "easy", "simple", "cheap", "cheaper", "fast", "save", "hurry", "vacation", "travel", "official", "maybe", "for my", "only", "often");
// 목표: 유학·교환학생 2부. 살림 차리기(은행·계약·가구·인터넷·이웃) → 수업·조별 과제 위기 → 몸과 마음 돌보기 → 학기 말 작별.
// 기억: acct·lease·furn·deliv·net·neigh·chg·phone·conflict·topic·ins·pill·cut·fit·gym·cite·trip·miss·club·blame·pay (+ 기존 major·role·meetday)
EP({ id: "c6", part: "daily", who: "lewis", time: "morning", title: "은행 계좌 열기", need: { after: [["c2", "c3"]] }, guest: "다른 손님",
  lines: {
    a: { say: "Good morning! Welcome to First Federal. How can I help you today?", task: "계좌를 새로 만들고 싶다고 말해요",
      go: [{ m: [["계좌", ["account"]], ["만들기", ["open", "set up", "start", "make", "create", "get"]]], ex: "Hi, I'd like to open a bank account.", to: "b", tip: ["I'd like to open ~", "~을 만들고 싶어요", "은행·가게에서 용건을 꺼낼 때 가장 자연스러워요."] }] },
    b: { say: [["lv:2", "Of course. We have two kinds: a checking account for everyday spending, and a savings account that earns a little interest. Which one are you after?"], [null, "Of course. Checking or savings?"]], task: "둘 중 하나를 골라요 — 왜 그게 필요한지 한마디",
      go: [
        { m: [["입출금 계좌", ["checking", "everyday", "daily", "debit", "spending"]], REASON], ex: "Checking, please, because I want a debit card for daily spending.", set: { acct: "checking" }, reply: "Most students start there.", to: "c" },
        { m: [["저축 계좌", ["savings", "interest", "save"]], REASON], ex: "A savings account. I want to save money for my trip.", set: { acct: "savings" }, reply: "Good habit. The interest is small, but it adds up.", to: "c" }] },
    c: { say: "Great. I'll need to see some ID: your passport, and your student ID if you have it.", task: "여권과 학생증을 건네고, 집 주소 증명서는 아직 없다고 말해요",
      go: [{ m: [["여권", ["passport"]], ["학생증", ["student id", "student card"]], ["주소 증명", ["address", "address", "lease", "contract"]]], ex: "Here's my passport and my student ID. I don't have proof of address yet.", to: "d", tip: ["proof of address", "주소 증명서", "계좌·휴대폰을 만들 때 자주 요구해요."] }] },
    d: { lv: 2, say: "No problem. A letter from your school or your housing contract works too. Do you have either one with you?", task: "학교에서 받은 입학 허가서가 있다고 말해요",
      go: [{ m: [["서류", ["letter", "admission", "acceptance", "contract", "lease", "document", "email"]], ["있음", ["have", "got", "here", "brought", "with me"]]], ex: "Yes, I have my admission letter from the university.", to: "e" }] },
    e: { say: "Perfect. One last thing: there's a monthly fee unless you keep five hundred dollars in the account. Is that all right?", task: "괜찮다고 하거나, 학생 계좌는 수수료가 없는지 물어요",
      go: [
        { m: [M.ok], ex: "That's fine. I can keep five hundred in there.", reply: "Great, then you're all set.", to: "end" },
        { m: [["학생 계좌", ["student account", "student plan", "no fee", "without a fee", "any discount", "discount", "waive", "cheaper"]]], ex: "Is there a student account without a monthly fee?", reply: "There is! Students get the fee waived, so no minimum balance.", to: "end", tip: ["without a ~ fee", "~ 수수료 없이", "조건을 물을 때 without이 편해요."] }] }
  },
  bye: "All set. Your card will come in the mail in about a week. Welcome to the bank!",
  hear: [
    ["guest", "Hi, I'd like to deposit this check, please.", [["deposit this check", "이 수표를 입금해요", "은행 창구에서 가장 흔한 말이에요."]]],
    ["them", "Sure. Just fill out this slip."],
    ["guest", "Is there a fee for using other ATMs?", [["a fee for", "~에 수수료가 있나요", "요금이 붙는지 물을 때 써요."]]],
    ["them", "Three dollars, I'm afraid."]
  ] });

EP({ id: "c7", part: "daily", who: "patel", time: "day", title: "계약서에 서명하기", need: { after: ["c2"] }, guest: "다른 세입자",
  lines: {
    a: { say: "Hello! Thanks for coming. Here's the lease. Take a look and ask me anything.", task: "계약 기간이 어떻게 되는지 물어요",
      go: [{ m: [["기간", ["how long", "term", "length", "duration", "period", "month"]], ["계약", ["lease", "contract", "agreement"]]], ex: "Thanks. How long is the lease?", to: "b" }] },
    b: { say: [["lv:2", "It's flexible, actually. I can do six months, which is one semester, or a full year at a lower rent. What works for you?"], [null, "Six months or one year. Which one?"]], task: "하나를 골라요 — 이유도 한마디",
      go: [
        { m: [["반년", ["six month", "half year", "semester", "short"]], REASON], ex: "Six months, please, because I'm only here for one semester.", set: { lease: "six-month" }, reply: "A semester it is. I'll write six months.", to: "c" },
        { m: [["일 년", ["one year", "a year", "twelve month", "full year", "long"]], REASON], ex: "One year, since I want to save money and stay longer.", set: { lease: "one-year" }, reply: "Smart. The rent is fifty dollars cheaper per month.", to: "c", tip: ["I want to save money", "돈을 아끼고 싶어요", "이유를 붙일 때 want to ~를 써요."] }] },
    c: { say: "Good. I also need a deposit of one month's rent. Is that all right?", task: "좋다고 하고, 보증금은 언제 돌려받는지 물어요",
      go: [{ m: [["언제", ["when", "how", "condition", "get back", "return", "refund"]], ["보증금", ["deposit"]]], ex: "Sure. When do I get the deposit back?", to: "d", tip: ["get ~ back", "~을 돌려받다", "돈·물건을 돌려받을 때 써요."] }] },
    d: { lv: 2, say: "Within two weeks after you move out, as long as nothing is damaged. Any questions about the rules, like guests or pets?", task: "손님이 와서 자도 되는지 물어요",
      go: [{ m: [["손님", ["guest", "friend", "visitor", "overnight", "stay over", "sleep over"]], ["허락", ["allowed", "can", "may", "okay if", "is it okay", "allow"]]], ex: "Are guests allowed to stay overnight?", to: "e" }] },
    e: { say: "Overnight is fine, just not for weeks. Okay, if everything looks good, sign here.", task: "서명하겠다고 하고 열쇠는 언제 받는지 물어요",
      go: [{ m: [["서명", ["sign"]], ["열쇠", ["key"]], ["언제", ["when", "what time", "today", "tomorrow"]]], ex: "Okay, I'll sign. When can I get the keys?", to: "end" }] }
  },
  bye: "Today, as soon as you sign. Welcome to the building!",
  hear: [
    ["guest", "Excuse me, who do I call if the heater breaks?", [["who do I call if", "~하면 누구에게 전화해요", "문제가 생길 때 연락처를 물어요."]]],
    ["them", "Call me any time. My number's on the door."],
    ["guest", "And what day is trash day?", [["trash day", "쓰레기 버리는 날", "집 규칙을 물을 때 꼭 써요."]]],
    ["them", "Tuesdays and Fridays."]
  ] });

EP({ id: "c8", part: "daily", who: "chris", time: "day", title: "가구 고르기", need: { after: [["c7", "c6"]] }, guest: "다른 손님",
  lines: {
    a: { say: "Hey there! Let me know if you need help finding anything.", task: "새 방에 놓을 가구가 필요하다고 말해요",
      go: [{ m: [["가구", ["furniture", "desk", "bed", "sofa", "chair", "table", "shelf", "bookshelf", "mattress"]], ["필요", ["need", "looking for", "look for", "want", "get"]]], ex: "I'm looking for some furniture for my new place.", to: "b" }] },
    b: { say: [["lv:2", "Sure thing. Is it for a whole apartment, or just a few key pieces? Honestly, most students start with one big thing. What's the first thing you need?"], [null, "Sure. What do you need most?"]], task: "가장 먼저 필요한 것 하나를 골라요 (책상·침대·소파) — 이유도",
      go: [
        { m: [["책상", ["desk", "study table"]], REASON], ex: "A desk, because I have to study a lot.", set: { furn: "desk" }, reply: "Good choice. A solid desk makes a big difference.", to: "c" },
        { m: [["침대", ["bed", "mattress"]], REASON], ex: "A bed, because the apartment doesn't have one.", set: { furn: "bed" }, reply: "Right, sleep comes first!", to: "c" },
        { m: [["소파", ["sofa", "couch"]], REASON], ex: "A sofa, since my friends might visit.", set: { furn: "sofa" }, reply: "Nice. Then you'll want something comfy.", to: "c" }] },
    c: { say: "Great. This one is two hundred dollars. This other one is a hundred and twenty, but it's secondhand.", task: "둘 중 하나를 골라요 — 이유도 한마디",
      go: [
        { m: [["새것", ["two hundred", "expensive", "first one", "200", "last long", "brand new"]], REASON], ex: "I'll take the first one, because I want it to last.", reply: "Solid pick. It comes with a two-year warranty.", to: "c2" },
        { m: [["중고", ["second hand", "secondhand", "used", "cheaper", "hundred twenty", "120", "cheap", "second one"]], REASON], ex: "The secondhand one is fine, since I'm leaving in four months.", reply: "Makes sense. It's in great shape.", to: "c2", tip: ["secondhand", "중고의", "중고는 used도 되지만 secondhand가 자연스러워요."] }] },
    c2: { lv: 3, say: "Nice. Many students forget these: do you need a lamp or bedding too?", task: "하나 더 필요한 걸 말하거나, 필요 없다고 해요",
      go: [{ m: [["대답", ["lamp", "bedding", "pillow", "blanket", "sheet", "chair", "nothing else", "that be all", "enough", "no"]]], ex: "I'll take a lamp too, for studying at night.", to: "d" }] },
    d: { say: "Alright. Do you want it delivered, or can you carry it yourself?", task: "배달을 부탁하고, 가능한 요일을 말해요 (오는 날 전화해 달라고 하면 더 좋아요)", more: { m: [["전화", ["call", "text", "message", "let me know", "notify"]]] },
      go: [{ m: [M.day, ["배달", ["deliver", "delivery", "ship", "bring"]]], ex: "Delivery, please. Can you bring it on Saturday? And please call me first.", cap: "deliv", to: "end" }] }
  },
  bye: [["deliv", "Done. We'll deliver it {deliv}. Thanks for shopping with us!"], [null, "Done. We'll call you about the delivery. Thanks for shopping with us!"]],
  hear: [
    ["guest", "Excuse me, is this one in stock?", [["in stock", "재고가 있는", "가게에서 물건이 있는지 물을 때 써요."]]],
    ["them", "Let me check the back."],
    ["guest", "Do you have it in white?", [["Do you have it in ~?", "~ 색(크기)도 있어요?", "다른 색·크기를 물을 때 써요."]]],
    ["them", "Only in oak, sorry."]
  ] });

EP({ id: "c9", part: "daily", who: "ray", time: "morning", title: "인터넷 설치", need: { after: ["c7", ["c8", "c6"]] }, guest: "복도의 이웃",
  lines: {
    a: { say: "Morning! I'm here for the internet setup. Okay if I come in?", task: "들어오라고 하고, 공유기를 어디에 둘지 알려 줘요",
      go: [{ m: [["들어오세요", ["come in", "go ahead", "sure", "of course", "yes", "please"]], ["위치", ["router", "desk", "living room", "bedroom", "window", "here", "over there", "outlet", "corner", "wall"]]], ex: "Sure, come in. The outlet is in the corner by the window.", to: "b" }] },
    b: { say: [["lv:2", "Got it. You're on the basic plan right now, which is fifty megabits. Honestly, for a student that's usually fine, but I can upgrade you to the fast one for fifteen bucks more. Want me to switch it?"], [null, "You're on the basic plan. I can upgrade you to the fast one for fifteen more. Want it?"]], task: "어느 요금제로 할지 고르고 이유를 말해요",
      go: [
        { m: [["빠른 요금제", ["fast", "upgrade", "faster", "switch"]], REASON], ex: "Please upgrade me to the fast plan. I want to stream and video call my family.", set: { net: "fast" }, reply: "You got it. Video calls will be smooth.", to: "c" },
        { m: [["기본 요금제", ["basic", "keep", "stay", "cheaper", "cheap", "as it be"]], REASON], ex: "I'll keep the basic plan, since I mostly use the Wi-Fi at school.", set: { net: "basic" }, reply: "Sensible. You can always upgrade later.", to: "c" }] },
    c: { say: "All set. Can you connect your laptop and check?", task: "와이파이 비밀번호는 어디서 확인하는지 물어요",
      go: [{ m: [["와이파이", ["wifi", "network", "internet", "password"]], ["어디", ["where", "how do i find", "what is", "how can i"]]], ex: "Sure. Where can I find the Wi-Fi password?", to: "d" }] },
    d: { lv: 2, say: "It's on the sticker under the router. Anything else, like what to do if it cuts out?", task: "인터넷이 끊기면 어떻게 해야 하는지 물어요",
      go: [{ m: [["끊김", ["stop", "internet stop", "drop", "cut out", "disconnect", "not work", "down", "slow", "lose connection"]], ["방법", ["what i do", "what do i do", "what should i", "what do i", "what should i", "who do i", "how do i", "who should i", "call", "restart", "reset"]]], ex: "What should I do if the internet goes down?", to: "e", tip: ["goes down", "(서비스가) 끊겨요", "인터넷·서버가 안 될 때 흔히 써요."] }] },
    e: { say: "Restart the router. If that doesn't work, call the number on the sticker. They're pretty quick.", task: "고맙다고 하고, 설치비는 지금 내는지 물어요",
      go: [{ m: [M.thx, ["결제", ["pay", "bill", "charge", "cost", "fee"]]], ex: "Thanks a lot. Do I pay you now, or is it on my bill?", to: "end" }] }
  },
  bye: "It's on your monthly bill. All good. Enjoy the Wi-Fi!",
  hear: [
    ["guest", "Is your Wi-Fi down too?", [["Wi-Fi down", "와이파이가 안 돼요", "인터넷이 안 될 때 써요."]]],
    ["them", "Yeah, the whole building has been slow all morning.", [["the whole building", "건물 전체", "범위를 말할 때 whole을 써요."]]],
    ["guest", "I'll restart my router and see."],
    ["them", "Good luck."]
  ] });

EP({ id: "c10", part: "daily", who: "chris", art: "call", time: "day", title: "배달이 안 왔어요", need: { after: ["c8"] }, guest: "다른 전화 손님",
  lines: {
    a: { say: "Thanks for calling the furniture store. This is Chris. How can I help?", task: [["furn", "주문한 {furn}이 아직 안 왔다고 말해요"], [null, "주문한 가구가 아직 안 왔다고 말해요"]],
      go: [{ m: [["안 옴", ["not arrive", "not come", "not here", "still waiting", "never", "late"]], ["주문", ["order", "delivery", "deliver", "furniture", "desk", "bed", "sofa"]]], ex: "Hi, my furniture hasn't arrived yet. I ordered it last week.", to: "b", tip: ["hasn't arrived yet", "아직 도착 안 했어요", "배달·택배가 늦을 때 쓰는 기본 문장이에요."] }] },
    b: { say: "I'm sorry about that. Let me look it up. Can I get your name and your order number?", task: "이름을 말하고, 주문 번호는 모르니 메일을 확인하겠다고 해요",
      go: [{ m: [["이름", ["{name}", "my name", "name be"]], ["메일", ["email", "inbox", "receipt", "confirmation", "number"]]], ex: "It's {name}. I'll check my email for the order number.", to: "c" }] },
    c: { say: [["deliv", "Found it. It was scheduled for {deliv}, but the truck broke down. I can deliver tomorrow morning, or you can pick it up today."], [null, "Found it. The truck broke down. I can deliver tomorrow morning, or you can pick it up today."]], task: "둘 중 하나를 골라요 — 이유도 한마디",
      go: [
        { m: [["내일 배달", ["deliver", "tomorrow", "bring", "morning", "wait"]], REASON], ex: "Please deliver it tomorrow morning, because I'm home then.", reply: "Perfect. Between nine and noon.", to: "d" },
        { m: [["직접 가져가기", ["pick up", "pickup", "myself", "come get", "today", "come by"]], REASON], ex: "I'll pick it up today, since I need it tonight.", reply: "Great. Ask for me at the front desk.", to: "d" }] },
    d: { lv: 2, say: "Sorry again. We'd like to make it up to you. Would you prefer free delivery or ten percent off?", task: "보상으로 하나를 골라요",
      go: [{ m: [["보상", ["discount", "free", "percent", "off", "coupon", "refund"]], ["선택", ["i will", "i would", "prefer", "go with", "take", "please"]]], ex: "I'll take the discount, please.", to: "e" }] },
    e: { say: "Done. Is there anything else I can do?", task: "고맙다고 하고, 오기 전에 전화해 달라고 부탁해요",
      go: [{ m: [M.thx, ["전화", ["call", "text", "message", "let me know", "notify"]], ["미리", ["before", "ahead", "in advance", "first"]]], ex: "Thanks. Could you call me before you come?", to: "end" }] }
  },
  bye: "Of course. Sorry again, and thanks for your patience!",
  hear: [
    ["guest", "Hi, I'd like to change my delivery address.", [["change my delivery address", "배달 주소를 바꿔요", "전화로 주문을 바꿀 때 써요."]]],
    ["them", "Sure. What's the order number?"],
    ["guest", "I don't have it with me. Can you look it up by my name?", [["look it up", "찾아봐 주다", "기록을 검색해 달라고 할 때 써요."]]],
    ["them", "Of course. One moment."]
  ] });

EP({ id: "c11", part: "daily", who: "green", time: "evening", title: "옆집 할머니와 첫인사", need: { after: [["c8", "c9"]] }, guest: "복도의 다른 이웃",
  lines: {
    a: { say: "Oh! Hello, dear. I heard somebody moved in next door. I'm Mrs. Green.", task: "반갑게 인사하고 내 이름을 말해요",
      go: [{ m: [M.hi, ["이름", ["{name}", "my name", "name be", "call me"]]], ex: "Nice to meet you, Mrs. Green. I'm {name}.", to: "b" }] },
    b: { say: [["lv:2", "Welcome to the building. It's quiet here, mostly. Where are you from, dear, and what brings you all the way here?"], [null, "Where are you from, dear?"]], task: "어디서 왔고, 교환학생으로 왔다고 말해요",
      go: [{ m: [M.from, ["교환학생", ["student", "study", "exchange", "semester", "school", "university", "college", "class"]]], ex: "I'm from Korea. I'm an exchange student at the university.", to: "c" }] },
    c: { say: "How lovely! Students are always hungry. I just baked cookies. Would you like some?", task: "받든 사양하든 마음대로 — 정중하게",
      go: [
        { m: [["받음", ["yes", "sure", "please", "love", "thank", "would like", "delicious", "kind", "great"]]], ex: "Yes, please! That's so kind of you.", set: { neigh: "cookies" }, reply: "Here, take half the plate.", to: "d" },
        { m: [["사양", ["no thanks", "not now", "maybe later", "full", "already ate", "not hungry", "next time"]]], ex: "No, thank you. I just ate, but maybe next time.", set: { neigh: "polite" }, reply: "Of course, dear. I'll keep some for you.", to: "d", tip: ["maybe next time", "다음에 할게요", "거절하면서도 부드럽게 남겨 두는 말이에요."] }] },
    d: { say: "If you ever need anything, I'm right next door. Just knock.", task: "고맙다고 하고, 내가 시끄러우면 말해 달라고 해요",
      go: [{ m: [M.thx, ["소음", ["noise", "loud", "music", "quiet", "noisy", "disturb"]]], ex: "Thank you. Please tell me if I'm ever too loud.", to: "end" }] }
  },
  bye: "You're a sweet one. Good night, dear!",
  hear: [
    ["guest", "Mrs. Green, did my package come to your door by mistake?", [["by mistake", "실수로", "택배가 잘못 갔을 때 써요."]]],
    ["them", "Yes, I put it by your door this morning."],
    ["guest", "Oh, thank you. I didn't see it."],
    ["them", "It's behind the plant."]
  ] });

EP({ id: "c12", part: "daily", who: "brown", time: "morning", title: "수강 변경", need: { after: ["c3"], rel: { brown: 1 } }, guest: "다른 학생",
  lines: {
    a: { say: [["major", "Come in. You're the {major} student, right? What can I do for you?"], [null, "Come in. What can I do for you?"]], task: "수업 하나를 바꾸고 싶다고 말해요",
      go: [{ m: [["바꾸기", ["change", "switch", "drop", "swap", "move", "transfer"]], ["수업", ["class", "course", "section", "schedule"]]], ex: "I'd like to change one of my classes.", to: "b" }] },
    b: { say: [["lv:2", "I see. Before I sign anything, I need to understand what's going on. Is the class too difficult, or is it a scheduling problem?"], [null, "Why do you want to change? Is it too hard, or a scheduling problem?"]], task: "왜 바꾸고 싶은지 사실대로 말해요",
      go: [
        { m: [["어려움", ["difficult", "too hard", "too fast", "behind", "struggle", "heavy", "advanced", "confusing"]]], ex: "It's too difficult for me right now. I'm falling behind.", set: { chg: "hard" }, reply: "That's honest. Better to ask now than at the end.", to: "c" },
        { m: [["시간표", ["schedule", "overlap", "conflict", "clash", "same time"]]], ex: "It's a scheduling problem. It overlaps with another class.", set: { chg: "time" }, reply: "Ah, that happens a lot in the first weeks.", to: "c" }] },
    c: { say: "Okay. The add/drop deadline is this Friday. Have you already talked to your advisor?", task: "아직 안 했고, 오늘 가 보겠다고 해요",
      go: [{ m: [["아직", ["not yet", "have not", "did not", "never"]], ["오늘", ["today", "this afternoon", "right after", "later", "tomorrow", "now"]]], ex: "Not yet. I'll go see her this afternoon.", to: "d" }] },
    d: { lv: 2, say: "Good. Keep in mind that dropping a class might affect your credits for the semester. Do you understand what that means?", task: "이해했다고 하고, 최소 몇 학점이 필요한지 물어요",
      go: [{ m: [["이해", ["understand", "got it", "i see", "makes sense", "clear", "i know"]], ["학점", ["credit", "how many"]]], ex: "I understand. How many credits do I need to keep?", to: "e", tip: ["credits", "학점", "수강 학점은 credits로 세요."] }] },
    e: { say: "At least twelve. I'll email you the form.", task: "고맙다고 하고, 메일을 확인하겠다고 해요",
      go: [{ m: [M.thx, ["메일", ["email", "form", "check", "wait", "look for"]]], ex: "Thank you. I'll check my email for the form.", to: "end" }] }
  },
  bye: "Great. Good luck with the rest of the semester!",
  hear: [
    ["guest", "Is it too late to add this class?", [["add this class", "이 수업을 추가해요", "수강 신청 변경에 쓰는 말이에요."]]],
    ["them", "The deadline is Friday. You need a signature.", [["a signature", "서명", "서류에 서명을 받아야 할 때 써요."]]],
    ["guest", "Who has to sign it?"],
    ["them", "The professor and your advisor."]
  ] });

EP({ id: "c13", part: "daily", who: "zoe", time: "day", title: "휴대폰 요금이 이상해요", need: { after: ["c1", ["c6", "c9"]] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi again! Wait, I remember you. What's up?", task: "이번 달 요금이 이상하게 많이 나왔다고 말해요",
      go: [{ m: [["요금", ["bill", "charge", "charged", "price", "amount", "cost"]], ["이상함", ["wrong", "strange", "weird", "too much", "too high", "higher", "more than", "expensive", "mistake", "odd", "unexpected", "error"]]], ex: "Hi. My bill this month looks wrong. It's much higher.", to: "b" }] },
    b: { say: [["lv:2", "Oh no, let me pull up your account. I see an extra charge of twenty dollars. It looks like international calling. Did you call anywhere abroad last month?"], [null, "I see an extra twenty-dollar charge for international calls. Did you call abroad?"]], task: "사실대로 답해요 — 해외로 전화했는지",
      go: [
        { m: [["맞음", ["yes", "yeah", "i called", "my family", "my mom", "my parents", "home", "korea"]]], ex: "Yes, I called my family in Korea a few times.", reply: "That explains it. Calls to Korea are pricey.", to: "c" },
        { m: [["아님", ["no", "never", "did not", "not call", "only text"]], ["확인", ["did not call", "only used", "i did not", "check", "look", "again", "mistake", "error", "wrong"]]], ex: "No, I didn't call anyone abroad. Could you check again?", reply: "Okay, let me look into it.", to: "c2", tip: ["Could you check again?", "다시 확인해 주실래요?", "정중하게 재확인을 부탁할 때 써요."] }] },
    c: { say: "Since you call home a lot, I'd suggest the international pack: ten dollars a month, and calls to Korea are included.", task: "팩을 추가할지 정하고, 이유를 말해요",
      go: [
        { m: [["추가", ["add", "yes", "take", "sign up", "pack", "get it"]], REASON], ex: "Yes, please add it, because I call my family every week.", set: { phone: "pack" }, reply: "Done. You'll save money starting this month.", to: "d" },
        { m: [["안 함", ["no thanks", "not now", "skip", "kakao", "app", "free", "wifi"]], REASON], ex: "No, thanks. I'll just use KakaoTalk, since it's free.", set: { phone: "app" }, reply: "Fair enough. Apps are cheaper.", to: "d" }] },
    c2: { say: "I'll open a ticket, and the billing team will review it. It takes a few days. In the meantime, you'll still have to pay the full amount.", task: "며칠 걸리는지 묻고, 그동안 돈을 내야 하는지 물어요",
      go: [{ m: [["며칠", ["few day", "take a few", "how long", "how many day", "when", "how soon"]], ["그동안", ["meantime", "meanwhile", "until then", "pay", "wait"]]], ex: "How long will it take? Should I pay it in the meantime?", set: { phone: "dispute" }, to: "d", tip: ["in the meantime", "그동안에", "기다리는 사이에 뭘 할지 물을 때 써요."] }] },
    d: { say: "All done. Anything else I can help with?", task: "고맙다고 하고, 영수증을 메일로 보내 달라고 해요",
      go: [{ m: [M.thx, ["메일", ["email", "mail", "receipt", "send"]]], ex: "Thanks! Could you email me a receipt?", to: "e" }] },
    e: { lv: 3, say: "Sure. Oh, and would you like paperless billing? It saves you two dollars a month.", task: "이메일 청구서로 바꿀지 정하고, 이유를 말해요",
      go: [{ m: [["결정", ["yes", "sure", "please", "paperless", "email", "no", "keep", "switch"]], REASON], ex: "Yes, please, because I check my email every day.", to: "end" }] }
  },
  bye: "You're welcome. Have a great day!",
  hear: [
    ["guest", "Can I get a new SIM? Mine stopped working.", [["stopped working", "갑자기 안 돼요", "되던 게 안 될 때 써요."]]],
    ["them", "Sure. Do you have your ID?"],
    ["guest", "Is there a fee for replacing it?", [["a fee for", "~에 수수료가 있나요", "요금이 붙는지 물을 때 써요."]]],
    ["them", "It's free this month."]
  ] });

EP({ id: "c14", part: "daily", who: "noah", time: "day", title: "연락 안 되는 조원", need: { after: ["c4"] }, guest: "다른 조원",
  lines: {
    a: { say: [["role", "Hey. Got a minute? It's about our group project. I know you're doing the {role} part, and that's going fine, but I'm worried about Jake."], [null, "Hey. Got a minute? It's about our group project."]], task: "시간 있다고 하고, 무슨 일인지 물어요",
      go: [{ m: [["응답", ["sure", "yes", "of course", "go ahead", "what", "okay"]]], ex: "Sure, what's up?", to: "b" }] },
    b: { say: [["lv:2", "It's Jake. He hasn't answered the group chat in a week, and he hasn't done any of his slides. The deadline is Friday, and I'm getting really nervous."], [null, "Jake hasn't done any of his slides, and the deadline is Friday."]], task: "걱정을 같이 해 주고, 그와 이야기해 봤는지 물어요",
      go: [{ m: [["공감", ["stressful", "that sound", "sorry", "worry", "oh no", "not good", "tough", "annoying", "frustrating", "understand", "too bad"]], ["질문", ["what", "why", "did you", "have you", "talk", "ask", "how long", "reason"]]], ex: "Oh no, that's frustrating. Have you talked to him?", to: "c" }] },
    c: { say: "I texted him twice. Nothing. So, what do you think we should do?", task: "내 생각을 말해요 — 왜 그렇게 하자는지도",
      go: [
        { m: [["직접 말하기", ["talk to him", "talk with him", "call him", "text him", "message him", "ask him", "meet him"]], REASON], ex: "Let's talk to him directly first, because maybe something happened.", set: { conflict: "talk" }, reply: "Okay. You're right, he deserves a chance.", to: "d" },
        { m: [["선생님께", ["mr brown", "teacher", "professor", "brown", "instructor", "report"]], REASON], ex: "Maybe we should tell Mr. Brown, because the deadline is close.", set: { conflict: "teacher" }, reply: "Hmm. I hate going over his head, but the deadline is real.", to: "d" },
        { m: [["우리끼리", ["ourselves", "split", "his part", "cover", "do his slides", "take over"]], REASON], ex: "We could split his part between us, since there isn't much time.", set: { conflict: "cover" }, reply: "That's fair. I just don't want to do it all.", to: "d", tip: ["split ~ between us", "~을 우리끼리 나누다", "일을 나눌 때 split이 자연스러워요."] }] },
    d: { lv: 2, say: "Yeah, that makes sense. Honestly, I don't want to cause drama or make the group look bad. Do you think I'm overreacting?", task: "아니라고 하고, 이유를 말해요",
      go: [{ m: [["아님", ["not overreact", "not wrong", "fair", "reasonable", "right to", "makes sense"]], REASON], ex: "No, you're not overreacting. It's fair to be worried because the deadline is close.", to: "e" }] },
    e: { say: "Thanks, that really helps. Can we meet at the library tomorrow to sort it out?", task: "좋다고 하고, 시간을 정해요",
      go: [{ m: [M.yes, M.time], ex: "Sounds good. How about four o'clock?", to: "end" }] }
  },
  bye: "Great, see you then. Thanks for listening.",
  hear: [
    ["guest", "Did anyone finish the first section?", [["the first section", "첫 부분", "과제의 부분을 가리킬 때 써요."]]],
    ["them", "I did. I'll upload it tonight.", [["upload", "올리다", "파일을 올릴 때 써요."]]],
    ["guest", "Can you share the file with me?"],
    ["them", "It's in the group folder."]
  ] });

EP({ id: "c15", part: "daily", who: "noah", time: "night", title: "발표 전날 밤샘", need: { after: ["c14", ["c8", "c9", "c10"]] }, guest: "도서관 직원",
  lines: {
    a: { say: [["conflict=cover", "Hey. It's almost midnight, and we're still doing Jake's part like you suggested. Can you believe it?"], ["conflict=teacher", "Hey. It's almost midnight. Mr. Brown still hasn't answered about Jake, so we're finishing this ourselves."], ["conflict=talk", "Hey. It's almost midnight. Jake finally texted back, but he still can't help. Ugh."], [null, "Hey. It's almost midnight, and we still have half the slides to finish."]], task: "힘들지만 같이 끝내자고 격려해요",
      go: [{ m: [["격려", ["let us", "we can", "we got this", "almost", "keep going", "hang in", "you can", "we will", "do this", "finish", "nearly", "together"]]], ex: "I know, but we can do this. Let's finish it together.", to: "b" }] },
    b: { say: [["lv:2", "Thanks. I'm so tired I can't think straight. Honestly, I could use a coffee. There's a vending machine downstairs. Want anything?"], [null, "I'm so tired. I'm getting a coffee. Want anything?"]], task: "마실 것을 부탁하거나 괜찮다고 해요",
      go: [
        { m: [["부탁", ["coffee", "tea", "latte", "energy drink", "drink", "water", "snack", "chips", "cookie", "something", "americano", "soda"]]], ex: "Yes, please. A black coffee would be great.", reply: "One black coffee, coming up.", to: "c" },
        { m: [["괜찮음", ["no thanks", "i am fine", "i am good", "i am okay", "no need", "not now"]], ["이유", ["i need", "i want to", "i have", "i do not", "i can not", "i must", "i stay", "i use", "i call", "i study", "i like", "it be", "not need", "easy", "simple", "cheap", "cheaper", "fast", "save", "hurry", "vacation", "travel", "official", "maybe", "for my", "only", "often", "enough", "too much", "already", "caffeine", "stomach", "sleep"]]], ex: "No thanks, I'm fine. I've had enough caffeine today.", reply: "Smart. I'll bring you some water anyway.", to: "c" }] },
    c: { say: [["net=fast", "Okay, let's send the final file. My Wi-Fi is awful, but yours is the fast plan, right? Can you upload it from your place?"], [null, "Okay, let's send the final file. My Wi-Fi is awful. Is yours okay for uploading a big file?"]], task: "내가 올리겠다고 해요",
      go: [{ m: [["내가 올림", ["i upload", "upload", "i will", "i can", "let me", "leave it to me"]], ["올리기", ["upload", "send", "submit", "email"]]], ex: "Sure, I'll upload it from my place. It should be fine.", to: "d" }] },
    d: { lv: 3, say: "Wait, quick question before we upload. Mr. Brown always asks about our sources. How did we get the data again?", task: "자료를 어디서 얻었는지 한 문장으로 설명해요",
      go: [{ m: [["출처", ["source", "from", "website", "paper", "article", "survey", "database", "interview", "book", "library", "report"]]], ex: "We got the data from three articles and a short survey.", to: "e" }] },
    e: { say: "Done! It's three in the morning. Let's get some sleep.", task: "수고했다고 하고, 내일 수업에서 보자고 해요",
      go: [{ m: [["수고", ["good job", "great job", "well done", "we did it", "nice work", "great work", "thank", "proud", "made it"]], ["내일", ["tomorrow", "see you", "class", "later"]]], ex: "We did it! Good job. See you in class tomorrow.", to: "end" }] }
  },
  bye: "Thanks, seriously. I couldn't have done it without you.",
  hear: [
    ["guest", "Excuse me, the library closes in ten minutes.", [["closes in ten minutes", "10분 뒤에 문 닫아요", "곧 닫는다고 알릴 때 써요."]]],
    ["them", "Oh, I didn't realize it was so late."],
    ["guest", "You can use the study room upstairs until midnight.", [["until midnight", "자정까지", "until은 끝나는 때를 말해요."]]],
    ["them", "Great, thanks."]
  ] });

EP({ id: "c16", part: "daily", who: "brown", time: "day", title: "강의를 못 따라갔어요", need: { after: ["c3", ["c5", "c12"]], rel: { brown: 2 } }, guest: "다른 학생",
  lines: {
    a: { say: [["chg=hard", "Come on in. Last time you said the class felt too difficult. How is it going now?"], [null, "Come on in. What can I do for you?"]], task: "어제 강의에서 길을 잃었다고 말해요 (잘 못 따라갔다고)",
      go: [{ m: [["이해 못함", ["lost", "not follow", "confused", "confusing", "too fast", "not understand", "unclear", "not get it"]]], ex: "I got lost during yesterday's lecture. I couldn't follow the last part.", to: "b", tip: ["I couldn't follow", "따라가지 못했어요", "설명·강의를 놓쳤을 때 follow를 써요."] }] },
    b: { say: [["lv:2", "Sure, that happens to everyone. Which part, exactly? If you tell me the topic, I can explain it again, more slowly."], [null, "Which part was it?"]], task: "어떤 내용이 어려웠는지 한 가지 말해요",
      go: [
        { m: [["내용", ["method", "theory", "graph", "formula", "model", "concept", "algorithm", "equation", "definition", "survey", "example", "experiment", "chart", "diagram", "statistics"]]], ex: "It was the research method you showed on the slides.", cap: "topic", to: "c" },
        { m: [["그 부분", ["part", "slide", "lecture", "section", "page", "chapter", "homework", "assignment", "week", "last", "first", "end"]]], ex: "It was the last part of the lecture.", fallback: 1, to: "c" }] },
    c: { say: "Okay, let me explain it again, step by step. … Does that make more sense now?", task: "이해됐는지 솔직하게 말해요",
      go: [
        { m: [["이해됨", ["makes sense", "i see", "i get it", "got it", "clear", "understand now", "much better", "clearer"]]], ex: "Yes, that makes sense now. Thank you.", reply: "Good. Don't hesitate to ask again.", to: "d" },
        { m: [["아직 헷갈림", ["still", "not sure", "not clear", "confus", "lost", "one more time", "again", "slowly"]], ["부탁", ["can you explain", "explain one more", "one more time", "example", "could you", "can you", "would you", "please", "may i"]]], ex: "I'm still a little confused. Could you give me an example?", to: "c2" }] },
    c2: { say: "Of course. Say you have ten students and three groups… Better?", task: "이제 알겠다고, 연습 문제를 풀어 봐도 되는지 물어요",
      go: [{ m: [["이해", ["got it", "i see", "makes sense", "clear", "understand"]], ["연습", ["practice", "try", "exercise", "problem", "sample", "question", "another"]]], ex: "I see now. Can I try a practice problem?", to: "d" }] },
    d: { say: "Good. Is there anything else you're unsure about?", task: "지금은 없고, 또 면담 시간에 와도 되는지 물어요",
      go: [{ m: [["없음", ["no question", "that is all", "nothing else", "all for now", "fine", "okay", "good"]], ["다시 방문", ["come by", "come again", "come back", "stop by", "visit", "office hours", "can i", "may i"]]], ex: "That's all for now. Can I come by again during office hours?", to: "end" }] }
  },
  bye: "Anytime. That's what office hours are for.",
  hear: [
    ["guest", "Could you go over the last slide again?", [["go over", "다시 훑어 주다", "설명을 다시 해 달라고 할 때 써요."]]],
    ["them", "Sure. Which part didn't make sense?"],
    ["guest", "The part about the sample size.", [["sample size", "표본 크기", "연구·과제에서 자주 나와요."]]],
    ["them", "Okay, let me draw it for you."]
  ] });

EP({ id: "c17", part: "daily", who: "brown", time: "day", title: "발표 뒤 질문 받기", need: { after: [["c14", "c15"]], rel: { brown: 2 } }, guest: "다른 조 학생",
  lines: {
    a: { say: [["topic", "Come in, everyone. Last time you had trouble with the {topic}, so I'm curious how your project turned out. Ready to present?"], [null, "Take your time. Ready to present?"]], task: "준비됐다고 하고 시작해요",
      go: [{ m: [["준비", ["ready", "yes", "start", "begin", "let us", "go ahead", "sure"]]], ex: "Yes, I'm ready. Let's begin.", to: "b" }] },
    b: { say: [["role=research", "Nice work. As the one who did the research, tell us: what was the hardest part of finding the information?"], ["role=slides", "Nice work. As the one who made the slides, tell us: what was the hardest part of the design?"], ["role=presentation", "Nice work. Since you presented, tell us: what was the hardest part of speaking in front of the class?"], [null, "Nice work. What was the hardest part of the project for you?"]], task: "가장 힘들었던 점을 말해요",
      go: [{ m: [["어려운 점", ["hardest", "hard", "difficult", "challeng", "time", "deadline", "find", "too much", "tricky", "struggle", "problem", "english", "speaking", "nervous", "design", "data", "source"]]], ex: "The hardest part was finding good sources in such a short time.", to: "c" }] },
    c: { say: "Thank you. A classmate has a question: what would you do differently if you had one more week?", task: "내 생각대로 답해요 — 모르겠으면 솔직하게",
      go: [
        { m: [["더 조사", ["more research", "research more", "more data", "more source", "more interview", "more survey", "more example", "add a survey", "add survey", "add an interview", "add more", "do a survey", "collect more"]], REASON], ex: "I'd do more research, because our data was too small.", reply: "A thoughtful answer.", to: "d" },
        { m: [["연습", ["practice", "rehearse", "more time", "speak", "clearer", "simpler"]], REASON], ex: "I'd practice more, since I was nervous.", reply: "Honest, and very common!", to: "d" },
        { m: [["모르겠음", ["good question", "let me think", "not sure", "do not know", "hard question"]], ["대신", ["maybe", "probably", "perhaps", "guess", "i think", "but"]]], ex: "That's a good question. I'm not sure, but maybe we'd start earlier.", reply: "That's a fine way to answer when you're not certain.", to: "d", tip: ["I'm not sure, but maybe ~", "확실하진 않지만 아마~", "모르는 질문도 이렇게 답하면 돼요."] }] },
    d: { lv: 2, say: "Good. A last question from me: would you recommend this approach to other students?", task: "추천할지 말하고, 이유를 말해요",
      go: [{ m: [["추천", ["recommend", "yes", "definitely", "probably", "maybe", "no", "depends"]], REASON], ex: "Yes, I'd recommend it, because it's simple and clear.", to: "e" }] },
    e: { say: "Thank you. Please take a seat. Well done.", task: "고맙다고 하고, 나중에 피드백을 받을 수 있는지 물어요",
      go: [{ m: [M.thx, ["피드백", ["feedback", "comment", "advice", "tip", "grade", "score", "suggestion"]]], ex: "Thank you! Could I get some feedback later?", to: "end" }] }
  },
  bye: "Of course. Come see me on Thursday.",
  hear: [
    ["guest", "Sorry, could you repeat the question?", [["could you repeat", "다시 말해 주실래요", "질문·말을 못 들었을 때 써요."]]],
    ["them", "Sure. How did you collect your data?"],
    ["guest", "We used a short online survey.", [["a short online survey", "짧은 온라인 설문", "조사 방법을 말할 때 써요."]]],
    ["them", "Good, thanks."]
  ] });

EP({ id: "c18", part: "daily", who: "brown", time: "morning", title: "표절 오해", need: { after: ["c17"], rel: { brown: 3 } }, guest: "다른 학생",
  lines: {
    a: { say: "Please sit down. I need to talk to you about your essay. The plagiarism software flagged a high similarity score on page three.", task: "놀랐다고 하고, 어느 부분인지 보여 달라고 해요",
      go: [{ m: [["놀람", ["surprised", "shocked", "oh no", "worried", "did not know", "do not understand", "confus", "what"]], ["설명 부탁", ["explain", "mean", "show", "which", "where", "tell me", "can you", "could you"]]], ex: "Oh, I'm surprised. Could you show me which part it is?", to: "b" }] },
    b: { say: [["lv:2", "Here, this paragraph is almost identical to an article online. In my class, copying without quotation marks and a citation counts as plagiarism, even if it's accidental. Can you explain how this happened?"], [null, "This paragraph matches an online article. Can you explain how this happened?"]], task: "사실대로 설명해요",
      go: [
        { m: [["실수", ["forgot", "mistake", "accident", "did not mean", "did not realize", "by mistake", "careless", "missed", "citation", "quote", "cite"]], ["인정", ["sorry", "my fault", "my mistake", "apologize", "i should have"]]], ex: "I'm so sorry. I forgot to add the citation. It was my mistake.", set: { cite: "forgot" }, reply: "I appreciate your honesty.", to: "c" },
        { m: [["내 말로 씀", ["my own", "own word", "paraphrase", "my word", "wrote it myself", "rewrote", "rephrase", "summar"]], ["근거", ["notes", "source", "draft", "version", "document", "show you", "proof", "file"]]], ex: "I wrote it in my own words, but my notes were close to the article. I can show you my draft.", set: { cite: "own" }, reply: "Alright. Documentation helps a lot here.", to: "c", tip: ["in my own words", "내 말로", "표절 이야기에서 꼭 필요한 표현이에요."] }] },
    c: { say: [["cite=forgot", "Thank you for being honest. Since it's a first offense, I'll let you fix it. What will you do differently next time?"], ["cite=own", "Thank you for explaining. Bring your draft and notes, and we'll look at them together. How will you avoid this problem in the future?"]], task: "앞으로 어떻게 할지 말해요",
      go: [{ m: [["대책", ["will", "going to", "next time", "from now", "in the future", "always", "double check", "check", "cite", "citation", "quote", "reference", "note", "source", "keep track", "write down", "careful"]]], ex: "From now on, I'll write down every source and add citations.", to: "d" }] },
    d: { lv: 2, say: "Good. I'll give you until Friday to submit a corrected version. Is that fair?", task: "공정하다고 하고, 다시 기회를 줘서 고맙다고 해요",
      go: [{ m: [["공정", ["fair", "fine", "okay", "good", "reasonable", "enough", "sure"]], M.thx], ex: "That's fair. Thank you for giving me another chance.", to: "e" }] },
    e: { say: "I'm glad we sorted this out. The writing center can help with citations.", task: "고맙다고 하고, 글쓰기 센터가 어디인지 물어요",
      go: [{ m: [["어디", ["where", "how do i get", "what time", "how can i", "when"]], ["센터", ["writing center", "writing centre", "center", "centre", "tutor", "help"]]], ex: "Thanks. Where is the writing center?", to: "end" }] }
  },
  bye: "Second floor of the library. Tell them I sent you.",
  hear: [
    ["guest", "Do I need to cite a quote from a textbook?", [["cite", "출처를 밝히다", "인용할 때 꼭 해요."]]],
    ["them", "Yes. Use quotation marks and add the page number."],
    ["guest", "What about my own ideas?"],
    ["them", "Those don't need a citation."]
  ] });

EP({ id: "c19", part: "daily", who: "nora", time: "morning", title: "학생 건강센터", need: { after: [["c3", "c13"]] }, guest: "대기 중인 학생",
  lines: {
    a: { say: "Good morning. Student Health Center. How can I help you?", task: "학교에 낼 예방접종 서류가 필요하다고 말해요",
      go: [{ m: [["서류", ["form", "paper", "document", "record", "certificate", "paperwork"]], ["예방접종", ["vaccination", "vaccine", "shot", "immunization", "health check", "medical", "checkup", "check up"]]], ex: "Hi, I need a vaccination form for the university.", to: "b" }] },
    b: { say: [["lv:2", "Sure thing. First, do you have health insurance? The university plan covers the visit, but you have to be enrolled. Have you signed up for it?"], [null, "Do you have the student health insurance?"]], task: "보험에 가입했는지 사실대로 말해요",
      go: [
        { m: [["가입함", ["yes", "i have", "signed up", "enrolled"]], ["보험", ["sign up", "signed up", "insurance", "plan", "card", "policy", "covered"]]], ex: "Yes, I have the student insurance. Here's my card.", set: { ins: "yes" }, to: "c" },
        { m: [["가입 안 함", ["not yet", "have not", "did not", "not sure", "do not know", "not enrolled", "never"]], ["보험", ["sign up", "signed up", "insurance", "plan", "policy", "covered", "cover", "need to", "needed to", "need it", "required"]]], ex: "Not yet. I didn't know I needed the insurance.", set: { ins: "no" }, to: "c2" }] },
    c: { say: "Great. The visit is free with your plan. A nurse will check your vaccination history. Do you have your records from home?", task: "한국에서 가져온 접종 기록이 있다고 말해요",
      go: [{ m: [["기록", ["record", "paper", "document", "booklet", "card", "certificate", "history"]], ["한국", ["korea", "korean", "from home"]]], ex: "Yes, I brought my vaccination records from Korea.", to: "d" }] },
    c2: { say: "No problem. You can enroll today, it's about three hundred dollars for the semester. Or if you're already covered by another plan, you can waive it. What would you like to do?", task: "가입할지 면제받을지 정하고, 이유를 말해요",
      go: [
        { m: [["가입", ["enroll", "sign up", "join", "take it", "get it"]], REASON], ex: "I'll enroll today, because I don't have any other coverage.", set: { ins: "yes" }, to: "d" },
        { m: [["면제", ["waive", "already have", "travel insurance", "other plan"]], REASON], ex: "I'd like to waive it, since I already have travel insurance.", set: { ins: "waived" }, to: "d", tip: ["waive", "면제받다", "수수료·요건을 면제받을 때 써요."] }] },
    d: { say: "Okay. The nurse will see you in a few minutes. Please fill out this form.", task: "얼마나 걸리는지 물어요 (서류를 언제 받는지도 물으면 더 좋아요)", more: { m: [["서류", ["form", "paper", "document", "certificate", "letter", "pick up"]]] },
      go: [{ m: [["시간", ["how long", "how much time", "how many minute", "how soon"]]], ex: "How long will it take? And when can I pick up the form?", to: "end" }] }
  },
  bye: "About thirty minutes. The form will be ready by Friday.",
  hear: [
    ["guest", "Do I need an appointment for a flu shot?", [["a flu shot", "독감 주사", "예방주사를 맞을 때 써요."]]],
    ["them", "Walk-ins are fine until four."],
    ["guest", "Is it covered by the student plan?", [["covered by", "~로 보장되는", "보험이 적용되는지 물을 때 써요."]]],
    ["them", "Yes, it's free for students."]
  ] });

EP({ id: "c20", part: "daily", who: "grace", time: "evening", title: "약국에서 알레르기약", need: { after: ["c19"] }, guest: "다른 손님",
  lines: {
    a: { say: [["ins=yes", "Hi! How can I help? If it's a prescription, your student plan should cover most of it."], [null, "Hi! How can I help?"]], task: "요즘 재채기가 나고 코가 막힌다고 말해요",
      go: [{ m: [["증상", ["sneez", "runny nose", "stuffy", "itchy", "allergy", "cough", "watery eye", "congested", "nose"]]], ex: "I think I have allergies. I keep sneezing and my nose is stuffy.", to: "b" }] },
    b: { say: [["lv:2", "Ugh, spring is rough. I can recommend something, but first: do you have any allergies to medicine, or do you take anything regularly?"], [null, "Any allergies to medicine?"]], task: "약 알레르기도 없고, 다른 약도 안 먹는다고 해요",
      go: [{ m: [["아니요", ["no", "none", "nothing", "not allergic", "not take", "never"]]], ex: "No, nothing. I'm not taking any other medicine.", to: "c" }] },
    c: { say: "Okay. There are two options. A regular pill works all day but can make you sleepy. A non-drowsy one costs a bit more.", task: "둘 중 하나를 골라요 — 이유도 한마디",
      go: [
        { m: [["일반", ["regular", "first one", "sleepy", "cheaper", "cheap", "before bed", "night"]], REASON], ex: "The regular one, since I take it before bed.", set: { pill: "regular" }, reply: "Good idea. It might even help you sleep.", to: "d" },
        { m: [["졸리지 않은", ["non drowsy", "nondrowsy", "not sleepy", "second one", "not drowsy", "stay awake", "awake"]], REASON], ex: "The non-drowsy one, because I have to study for exams.", set: { pill: "nondrowsy" }, reply: "Right, you need a clear head for exams.", to: "d", tip: ["non-drowsy", "졸리지 않는", "약 이름 옆에 자주 붙는 말이에요."] }] },
    d: { lv: 3, say: "One more thing. If your eyes are itchy too, I can also give you eye drops. Do you want some?", task: "눈도 가려운지 말하고, 원하는지 정해요",
      go: [{ m: [["가려움", ["itchy", "itch", "eye", "dry", "red"]], ["선택", ["do not need", "not need", "eye drop", "yes", "no", "please", "i want", "not now", "skip", "sure"]]], ex: "Yes, my eyes are itchy, so please give me some.", to: "e" }] },
    e: { say: "Take one a day, and drink lots of water. Anything else?", task: "고맙다고 하고, 값이 얼마인지 물어요",
      go: [{ m: [M.thx, ["값", ["how much", "price", "cost", "total"]]], ex: "Thank you. How much is it?", to: "end" }] }
  },
  bye: "Twelve dollars. With your student discount, ten. Feel better!",
  hear: [
    ["guest", "Is this safe to take with coffee?", [["safe to take", "먹어도 안전한", "약을 살 때 물어봐요."]]],
    ["them", "It's fine, but it might make you jittery."],
    ["guest", "Okay. Can I get a bag, please?"],
    ["them", "Of course."]
  ] });

EP({ id: "c21", part: "daily", who: "jess", time: "day", title: "미용실에서 머리 자르기", need: { after: [["c4", "c6"]] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi there! Do you have an appointment?", task: "예약은 없는데 지금 머리를 자를 수 있는지 물어요",
      go: [{ m: [["예약 없음", ["walk in", "no appointment", "without appointment", "not have an appointment", "do not have"]], ["가능", ["can i", "could i", "is it possible", "any chance", "available", "today", "now", "free", "haircut"]]], ex: "I'm a walk-in. Can I get a haircut now?", to: "b", tip: ["I'm a walk-in", "예약 없이 왔어요", "미용실·병원에서 예약 없이 갈 때 써요."] }] },
    b: { say: [["lv:2", "We're not too busy, so I can fit you in. Okay, so what are we doing today? Just a little trim, or something bigger?"], [null, "Sure. What are we doing today?"]], task: "어떻게 자르고 싶은지 정해요",
      go: [
        { m: [["다듬기", ["trim", "a little", "just a little", "tidy", "an inch", "ends", "keep the length", "slightly", "clean up"]]], ex: "Just a trim, please. I'd like to keep the length.", set: { cut: "trim" }, reply: "Easy. Let's get you shampooed first.", to: "c" },
        { m: [["변화", ["big change", "much shorter", "change", "new style", "new look", "different", "dye", "perm", "bangs", "fresh", "cut it all"]]], ex: "I want a big change. Can you cut it much shorter?", set: { cut: "change" }, reply: "Ooh, fun. I love a fresh start.", to: "c" }] },
    c: { say: "Do you have a photo of what you have in mind?", task: "사진은 없다고, 어떤 느낌이길 원하는지 설명해요",
      go: [{ m: [["사진 없음", ["no photo", "do not have", "not have", "no picture"]], ["설명", ["something", "simple", "natural", "like", "style", "layer", "side", "bangs", "long", "short"]]], ex: "I don't have a photo, but I want something simple and natural.", to: "d" }] },
    d: { lv: 2, say: "No problem, I'll show you in the mirror as we go. By the way, I haven't seen you here before. Are you a student at the university?", task: "교환학생이고, 얼마나 있을 건지 말해요",
      go: [{ m: [["교환학생", ["exchange", "student", "semester", "study", "university", "school"]], ["기간", ["month", "semester", "few", "here for", "just"]]], ex: "Yes, I'm an exchange student. I'll be here for four months.", to: "e" }] },
    e: { say: "All done! So, what do you think?", task: "마음에 들면 칭찬하고, 아쉬우면 고쳐 달라고 해요",
      go: [
        { m: [["마음에 듦", ["love", "like", "great", "perfect", "nice", "good", "awesome", "happy", "beautiful", "amazing"]]], ex: "I love it! It looks great.", reply: "Yay, I'm so glad!", to: "end" },
        { m: [["더 잘라 달라", ["more off", "a bit more", "shorter", "too long", "little long", "fix", "shorten", "can you cut"]]], ex: "It's a little long on the sides. Could you take a bit more off?", reply: "Sure thing. Better to fix it now.", to: "end", tip: ["take a bit more off", "조금 더 잘라 주세요", "머리·옷 길이를 줄여 달라고 할 때 써요."] }] }
  },
  bye: [["cut=change", "Wow, big change, and it really suits you. Come back any time!"], ["cut=trim", "Fresh and neat. Come back in six weeks!"], [null, "Come back any time!"]],
  hear: [
    ["guest", "Can I get a wash too?", [["a wash", "머리 감기", "미용실에서 추가로 부탁할 때 써요."]]],
    ["them", "Of course. Come this way."],
    ["guest", "Do you take cards?", [["take cards", "카드 받아요", "카드 결제가 되는지 물을 때 써요."]]],
    ["them", "Yes. And tips are appreciated."]
  ] });

EP({ id: "c22", part: "daily", who: "tyler", time: "evening", title: "학교 앞 헬스장", need: { after: [["c6", "c13"]] }, guest: "회원",
  lines: {
    a: { say: "Hey, welcome! First time here? Are you looking to join?", task: "학생인데 회원권이 얼마인지 물어요",
      go: [{ m: [["가격", ["how much", "price", "cost", "fee", "rate", "membership"]], ["학생", ["student", "school", "university", "discount"]]], ex: "Hi! I'm a student. How much is a membership?", to: "b" }] },
    b: { say: [["lv:2", "Standard is fifty a month, but with a student ID it's thirty-five. There's also a semester deal for one-twenty if you pay upfront. Which sounds better?"], [null, "It's thirty-five a month for students, or one-twenty for the whole semester."]], task: "하나를 골라요 — 이유도 한마디",
      go: [
        { m: [["월 단위", ["monthly", "month to month", "thirty five", "per month", "a month", "by the month"]], REASON], ex: "I'll go monthly, because I'm not sure I'll come often.", set: { gym: "monthly" }, reply: "Totally fine. You can cancel any time.", to: "c" },
        { m: [["학기권", ["semester", "one twenty", "whole semester", "upfront", "all at once", "hundred twenty", "120"]], REASON], ex: "The semester pass, since I'll be here until December.", set: { gym: "semester" }, reply: "Good value. That's less than thirty a month.", to: "c" }] },
    c: { say: "Cool. We also have free group classes: yoga, spinning, and boxing. Interested?", task: "하나를 골라요 — 이유도",
      go: [
        { m: [["요가", ["yoga"]], REASON], ex: "I'd like to try yoga, because I need to relax before exams.", set: { fit: "yoga" }, reply: "Great for stress. Tuesdays and Thursdays.", to: "d" },
        { m: [["스피닝", ["spinning", "cycling", "bike"]], REASON], ex: "Spinning sounds fun. I want to get some cardio.", set: { fit: "spinning" }, reply: "Fun and loud. You'll love the music.", to: "d" },
        { m: [["복싱", ["boxing", "punch", "box"]], REASON], ex: "Boxing, since I want to relieve stress.", set: { fit: "boxing" }, reply: "Ha, popular choice during exam week!", to: "d", tip: ["relieve stress", "스트레스를 풀다", "운동하는 이유로 자주 말해요."] }] },
    d: { say: "Great. Fill out this form and sign here. Any questions?", task: "몇 시까지 여는지 물어요 (주말에도 여는지 물으면 더 좋아요)", more: { m: [["주말", ["weekend", "saturday", "sunday"]]] },
      go: [{ m: [["시간", ["what time", "open", "close", "hours", "until"]]], ex: "What time do you close? And are you open on weekends?", to: "end" }] }
  },
  bye: [["gym=semester", "We're open until midnight on weekdays. You're set until December. See you tomorrow!"], ["gym=monthly", "We're open until midnight on weekdays. You're set for this month. See you tomorrow!"], [null, "We're open until midnight on weekdays. See you tomorrow!"]],
  hear: [
    ["guest", "Do you have a locker I can rent?", [["a locker I can rent", "빌릴 수 있는 사물함", "관계대명사 없이도 이렇게 말해요."]]],
    ["them", "Day lockers are free. Monthly ones are five dollars."],
    ["guest", "Do I need my own lock?"],
    ["them", "Yes, please bring a padlock.", [["padlock", "자물쇠", "사물함에 거는 자물쇠예요."]]]
  ] });

EP({ id: "c23", part: "daily", who: "green", time: "night", title: "밤늦은 노크", need: { after: ["c11", ["c15", "c22"]], rel: { green: 1 } }, guest: "복도의 다른 이웃",
  lines: {
    a: { say: [["neigh=cookies", "Oh, hello, dear. I'm sorry to knock so late, and you know I'm fond of you after those cookies, but there was loud music coming from your place around midnight."], [null, "Hello, dear. I'm sorry to knock so late. There was loud music coming from your place around midnight."]], task: "사과하며 무슨 일이었는지 설명하거나, 내가 아니라고 말해요",
      go: [
        { m: [["사과", ["sorry", "my fault", "my bad", "did not mean", "apologize"]], ["설명", ["friend", "party", "birthday", "group", "music", "movie", "game", "celebrate", "had people", "guests"]]], ex: "I'm so sorry, Mrs. Green. I had some friends over to celebrate after our exam.", reply: "Ah, young people. Thank you for being honest.", to: "b" },
        { m: [["내가 아님", ["not me", "upstairs", "downstairs", "other apartment", "different apartment", "another apartment", "i was asleep", "i was out", "library"]], ["걱정", ["sorry", "hear", "bother", "check", "will ask", "maybe"]]], ex: "It wasn't me, I was at the library. But I'm sorry you couldn't sleep.", reply: "Oh? Perhaps it was the couple upstairs. I'm sorry I accused you.", to: "b", tip: ["It wasn't me", "저 아니에요", "억울할 때도 부드럽게 말해요."] }] },
    b: { say: [["lv:2", "Well, thank you for hearing me out, dear. I only ask that it stays quiet after ten on weekdays, because I go to bed early. Would that be okay?"], [null, "I only ask for quiet after ten. Is that okay?"]], task: "열 시 이후에는 조용히 하겠다고 약속해요",
      go: [{ m: [["약속", ["promise", "i will", "i can", "from now", "quiet", "keep it down", "turn down", "of course", "sure"]], ["열 시", ["ten", "after ten", "night", "midnight", "late"]]], ex: "Of course. I'll keep it quiet after ten from now on.", to: "c" }] },
    c: { lv: 3, say: "Thank you, dear. And if you ever want friends over, just tell me ahead of time, and I'll bring my earplugs.", task: "미리 알려 드리겠다고 하고, 언젠가 저녁에 초대하겠다고 해요",
      go: [{ m: [["미리", ["tell you", "let you know", "warn you", "in advance", "ahead", "beforehand", "text you"]], ["초대", ["invite", "come", "join", "dinner", "party", "cookie", "tea", "coffee", "visit"]]], ex: "I'll let you know in advance. Maybe I'll invite you for dinner sometime.", to: "end" }] }
  },
  bye: [["neigh=cookies", "You're a dear. I'll bring over the next batch of cookies."], [null, "You're a dear. Good night!"]],
  hear: [
    ["guest", "Sorry to bother you, but could you keep it down?", [["keep it down", "조용히 해 주세요", "소리를 줄여 달라는 부드러운 부탁이에요."]]],
    ["them", "Oh, sorry! I'll turn it down right now."],
    ["guest", "Thanks. I have an early class tomorrow."],
    ["them", "No problem. Good night."]
  ] });

EP({ id: "c24", part: "daily", who: "linda", time: "day", title: "방학 동안 방 빌려주기", need: { after: ["c7", ["c15", "c19"]], rel: { linda: 1 } }, guest: "다른 손님",
  lines: {
    a: { say: [["lease", "Hi again! How's the place? Your {lease} lease is going well, I hope. What can I do for you?"], [null, "Hi again! What can I do for you?"]], task: "방학에 한국에 가서 방이 비는데, 다른 사람에게 빌려줄 수 있는지 물어요",
      go: [{ m: [["빌려주기", ["sublet", "sublease", "rent it out", "rent my room", "rent out", "someone else", "another student", "lend"]], ["방학", ["break", "vacation", "holiday", "winter", "summer", "away", "go home", "leave", "trip"]]], ex: "I'm going back to Korea for the winter break. Can I sublet my room?", to: "b", tip: ["sublet", "(방을) 다시 세 놓다", "남에게 잠깐 빌려줄 때 써요."] }] },
    b: { say: "Good question. Generally you need your landlord's permission, and you stay responsible for the rent. Do you have someone in mind?", task: "빌려줄 사람이 있는지 사실대로 말해요",
      go: [
        { m: [["아는 사람", ["friend", "classmate", "roommate", "someone i know", "a student"]]], ex: "Yes, a classmate of mine is looking for a place.", reply: "Even better. That makes it easy.", to: "c" },
        { m: [["없음", ["no", "not yet", "no one", "nobody", "not really", "have not found"]], ["부탁", ["help", "find", "ask", "post", "ad", "can you", "could you", "advertise", "website", "list"]]], ex: "Not yet. Could you help me find someone?", reply: "Sure, I can post it on our website.", to: "c2" }] },
    c: { say: "Okay. I'll need their name and how long they'd stay. Then I'll call Mr. Patel.", task: "친구 이름과 머물 기간을 말해요",
      go: [{ m: [["이름", ["my friend be", "she be", "he be", "name", "call"]], ["기간", ["week", "month", "january", "february", "december", "three", "two", "four", "five", "from", "until"]]], ex: "His name is Noah, and he'd stay for six weeks.", to: "d" }] },
    c2: { say: "No problem. How long will the room be empty, and what rent would you like?", task: "몇 주 비는지와, 월세를 어떻게 받고 싶은지 말해요",
      go: [{ m: [["기간", ["week", "month", "from", "until", "december", "january", "february"]], ["월세", ["paid monthly", "monthly", "bank transfer", "rent", "dollar", "same", "half", "price", "hundred", "cheaper", "cost"]]], ex: "It'll be empty for six weeks. I'd like to charge the same rent.", to: "d" }] },
    d: { lv: 2, say: "Great. If the new person damages anything, you're still responsible. Is that clear?", task: "이해했다고 하고, 결과를 언제 알려 줄 수 있는지 물어요",
      go: [{ m: [["이해", ["understand", "clear", "got it", "i see", "fine", "okay", "no problem"]], ["언제", ["when", "how soon", "how long", "let me know", "by", "day", "soon"]]], ex: "I understand. When will you let me know?", to: "end" }] }
  },
  bye: "By Friday. Safe travels!",
  hear: [
    ["guest", "How long does a background check take?", [["background check", "신원 조회", "집·일자리를 구할 때 해요."]]],
    ["them", "Usually two or three days."],
    ["guest", "Do I need a co-signer?", [["a co-signer", "공동 서명인", "보증을 서 주는 사람이에요."]]],
    ["them", "Not if your deposit is paid upfront."]
  ] });

EP({ id: "c25", part: "daily", who: "brown", time: "morning", title: "비자용 재학 증명 편지", need: { after: [["c16", "c18"]], rel: { brown: 3 } }, guest: "다른 학생",
  lines: {
    a: { say: [["cite=forgot", "Come in. I'm glad you came by. I think things went smoothly after that citation business. What can I do for you?"], ["cite=own", "Come in. After that misunderstanding about your essay, I'm glad you still come to see me. What can I do for you?"], [null, "Come in. What can I do for you?"]], task: "비자 신청에 낼 재학 증명 편지가 필요하다고 말해요",
      go: [{ m: [["편지", ["letter", "document", "certificate", "proof", "form", "paper", "verification"]], ["비자", ["visa", "embassy", "immigration", "application"]]], ex: "I need a letter for a visa application. It has to show I'm a full-time student.", to: "b" }] },
    b: { say: "Of course. I can write a letter confirming you're a full-time student. Where are you planning to travel?", task: "어디로 가는지, 왜 가는지 말해요",
      go: [
        { m: [["일본", ["japan", "tokyo", "osaka", "kyoto"]], REASON], ex: "To Japan, because I want to see Tokyo during winter break.", set: { trip: "Japan" }, reply: "Lovely. Winter in Japan is beautiful.", to: "c" },
        { m: [["유럽", ["europe", "paris", "london", "rome", "spain", "france", "italy", "germany", "barcelona"]], REASON], ex: "To Europe. I want to visit Paris and Rome.", set: { trip: "Europe" }, reply: "Wonderful. Europe asks for a lot of paperwork, so good thinking.", to: "c" },
        { m: [["캐나다", ["canada", "toronto", "vancouver", "montreal"]], REASON], ex: "Canada, since my cousin lives in Toronto.", set: { trip: "Canada" }, reply: "Nice. Canada is strict about documents, so we'll be careful.", to: "c" }] },
    c: { say: [["lv:2", "Good. Visa offices are picky, so I'll need your student number, the full name of the embassy, and the date you need the letter. Let's start with your student number."], [null, "Good. I'll need your student number."]], task: "학번을 메일로 보내겠다고 해요",
      go: [{ m: [["학번", ["student number", "student id", "id number"]], ["보내기", ["email", "send", "give", "bring", "tomorrow", "later", "text"]]], ex: "I'll email you my student number tonight.", to: "d" }] },
    d: { lv: 3, say: "One more question: should I address it to the embassy, or to 'To whom it may concern'?", task: "어느 쪽이 좋은지 이유와 함께 말해요",
      go: [{ m: [["수신", ["whom it may concern", "to whom", "embassy", "consulate", "general", "address", "concern"]], REASON], ex: "To whom it may concern is fine, since I'm not sure which office will read it.", to: "e" }] },
    e: { say: "Okay. I'll have it ready by Thursday. Is there anything else?", task: "고맙다고 하고, 목요일에 가지러 오겠다고 해요",
      go: [{ m: [M.thx, ["목요일", ["thursday", "pick up", "come by", "stop by", "collect"]]], ex: "Thank you so much. I'll pick it up on Thursday.", to: "end" }] }
  },
  bye: [["trip", "Wonderful. Have a great time in {trip}!"], [null, "Wonderful. Have a great trip!"]],
  hear: [
    ["guest", "Do you need a signature on this form?", [["a signature", "서명", "서류에 서명을 받아야 할 때 써요."]]],
    ["them", "Yes, and the office stamp."],
    ["guest", "How long does that usually take?"],
    ["them", "Two or three working days.", [["working days", "근무일", "주말을 빼고 센 날이에요."]]]
  ] });

EP({ id: "c26", part: "daily", who: "lewis", art: "call", time: "morning", title: "카드를 잃어버렸어요", need: { after: ["c6", ["c13", "c22"]], rel: { lewis: 1 } }, guest: "다른 전화 손님",
  lines: {
    a: { say: "Thank you for calling the bank. This is Mr. Lewis. How can I help you?", task: "카드를 잃어버렸고 어디서도 못 찾겠다고 말해요",
      go: [{ m: [["분실", ["lost", "not find", "missing", "stolen", "gone", "misplace"]], ["카드", ["card", "wallet", "debit"]]], ex: "Hi, I lost my debit card. I can't find it anywhere.", to: "b", tip: ["I can't find it anywhere", "어디서도 못 찾겠어요", "잃어버린 물건을 말할 때 써요."] }] },
    b: { say: [["acct", "Oh no, I'm sorry. I see your {acct} account here. First I need to verify who you are. What's your full name and date of birth?"], [null, "Oh no, I'm sorry. First I need to verify who you are. What's your full name and date of birth?"]], task: "이름과 생년월일을 말해요",
      go: [{ m: [["이름", ["{name}", "my name", "name be"]], ["생일", ["born", "birthday", "birth", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "#"]]], ex: "I'm {name}, and I was born on March third, two thousand five.", to: "c" }] },
    c: { say: "Thanks. I'll block the card right now. Do you want a new one? It takes five business days, or I can rush it for twenty dollars.", task: "일반 배송인지 빨리 받을지 정하고, 이유를 말해요",
      go: [
        { m: [["일반 배송", ["normal", "regular", "standard", "five day", "five business", "wait", "free", "no rush", "not rush"]], REASON], ex: "The regular one is fine. I can wait, because I still have some cash.", reply: "Okay, five business days.", to: "d" },
        { m: [["빨리", ["rush", "fast", "faster", "quick", "quickly", "express", "urgent", "next day", "sooner"]], REASON], ex: "Please rush it, because I need it for rent next week.", reply: "Understood. Rush delivery, then.", to: "d" }] },
    d: { lv: 2, say: "In the meantime, I can also set up mobile payment, so you can still pay with your phone. Do you want that?", task: "폰 결제를 쓰겠다고 하고, 옛 카드를 아무도 못 쓰는지 확인해요",
      go: [{ m: [["결정", ["yes", "please", "sure", "no", "do not need", "okay"]], ["확인", ["blocked", "block", "safe", "confirm", "nobody", "anyone", "charges", "unauthorized"]]], ex: "Yes, please. And can you confirm nobody can use the old card?", to: "e" }] },
    e: { say: "Absolutely, the old card is blocked. Anything else today?", task: "고맙다고 하고 전화를 끊어요",
      go: [{ m: [M.thx, ["인사", ["bye", "goodbye", "have a good", "take care", "good day", "great day", "nice day", "see you"]]], ex: "Thank you so much. Have a good day!", to: "end" }] }
  },
  bye: "You too. Goodbye!",
  hear: [
    ["guest", "I'd like to report a suspicious charge.", [["a suspicious charge", "수상한 결제", "모르는 결제를 알릴 때 써요."]]],
    ["them", "Okay. Can you read me the amount?"],
    ["guest", "It's three hundred dollars at a store I've never visited."],
    ["them", "I'll file a dispute right away.", [["file a dispute", "이의를 접수하다", "결제 문제를 공식으로 알릴 때 써요."]]]
  ] });

EP({ id: "c27", part: "daily", who: "sara", time: "evening", title: "향수병", need: { after: [["c14", "c15"]] }, guest: "옆 사람",
  lines: {
    a: { say: [["phone=pack", "Hey! You've been looking a bit quiet lately. Is everything okay? I know you've been calling home a lot."], ["phone=app", "Hey! You've been looking a bit quiet lately. Is everything okay? I see you texting with home a lot."], [null, "Hey! You've been looking a bit quiet lately. Is everything okay?"]], task: "사실은 한국이 그립다고 털어놓아요",
      go: [{ m: [["그리움", ["miss", "homesick", "lonely", "sad", "down", "feel alone", "feel bad"]]], ex: "Honestly, I'm a little homesick. I miss my family.", to: "b" }] },
    b: { say: [["lv:2", "I totally get it. The first few months are the hardest for everyone. What do you miss the most?"], [null, "What do you miss the most?"]], task: "가장 그리운 것 하나를 말해요",
      go: [
        { m: [["음식", ["food", "kimchi", "rice", "korean food", "bbq", "tteokbokki", "ramen", "cooking", "chicken"]]], ex: "Korean food, mostly. I miss spicy stew and rice.", set: { homesick: "food" }, to: "cf" },
        { m: [["가족", ["family", "mom", "dad", "parents", "sister", "brother", "grandma", "dog", "cat"]]], ex: "My family. I miss my parents and my sister.", set: { homesick: "family" }, to: "cm" },
        { m: [["친구", ["friend", "school", "classmate", "hang out", "best friend"]]], ex: "My friends back home. We used to hang out every weekend.", set: { homesick: "friends" }, to: "cx" }] },
    cf: { say: "Food is the best medicine. There's a Korean place downtown. Want to go together this weekend?", task: "좋다고 하고, 요일을 정해요",
      go: [{ m: [M.yes, M.day], ex: "I'd love to. How about Saturday?", to: "d" }] },
    cm: { say: [["phone=pack", "Aw, family is the hardest. When did you last talk to them? With your calling pack, you can call any time."], [null, "Aw, family is the hardest. When did you last talk to them?"]], task: "마지막으로 통화한 때와, 다음에 언제 할지 말해요",
      go: [{ m: [["언제", ["last night", "yesterday", "last week", "this morning", "today", "sunday", "saturday", "days ago"]], ["다음", ["next", "tomorrow", "tonight", "again", "soon", "every", "weekend", "will", "plan"]]], ex: "Last Sunday. I'll call them again this weekend.", to: "d" }] },
    cx: { say: "Aw, they probably miss you too. Have you told them how you're doing?", task: "요즘 어떤지 친구들에게 오늘 메시지를 보내겠다고 해요",
      go: [{ m: [["보내기", ["message", "text", "send", "call", "video call", "kakao", "tell them", "write", "talk to", "chat"]], ["오늘", ["tonight", "today", "later", "now", "this weekend", "tomorrow", "this evening"]]], ex: "Not really. I'll message them on KakaoTalk tonight.", to: "d" }] },
    d: { say: [["fit", "You know what helps me? Staying busy. Have you been to {fit} lately? Honestly, moving helps when I feel down."], [null, "You know what helps me? Staying busy. Have you tried the gym or a club? Honestly, moving helps when I feel down."]], task: "해 보겠다고 하고, 위로해 줘서 고맙다고 해요",
      go: [{ m: [M.thx, ["다짐", ["i will", "i should", "i can", "i might", "maybe", "try", "good idea", "go", "let us", "definitely", "feel better"]]], ex: "Thanks, Sara. I'll try that. I already feel a little better.", to: "end" }] }
  },
  bye: [["homesick=food", "Anytime. And I'm holding you to that Korean dinner!"], ["homesick=family", "Anytime. Say hi to your family for me!"], ["homesick=friends", "Anytime. Tell your friends I said hi!"], [null, "Anytime. That's what friends are for."]],
  hear: [
    ["guest", "You seem tired today. Did you sleep okay?", [["You seem tired", "피곤해 보여요", "상대의 상태를 걱정할 때 써요."]]],
    ["them", "Not really. I stayed up too late."],
    ["guest", "Same here. Let's grab some coffee."],
    ["them", "Good idea."]
  ] });

EP({ id: "c28", part: "daily", who: "ella", time: "day", title: "동아리 박람회", need: { after: [["c21", "c22", "c27"]] }, guest: "지나가던 학생",
  lines: {
    a: { say: [["cut=change", "Oh hi! Is that a new haircut? Looks great! Max and I are on our way to the club fair at the quad. Are you going?"], [null, "Oh hi! Max, look who it is! We're on our way to the club fair at the quad. Are you going?"]], task: "아직 안 가 봤다고 하고, 어떤 동아리가 있는지 물어요",
      go: [{ m: [["안 가 봄", ["not yet", "never", "have not", "did not know", "not sure", "first time"]], ["질문", ["what", "which", "kind", "club", "how many", "any"]]], ex: "Not yet. What kind of clubs are there?", to: "b" }] },
    b: { say: [["lv:2", "Oh, tons! Hiking, photography, board games, a K-pop dance crew, the debate team. Max prefers the hiking club, obviously. Which one sounds like you?"], [null, "Hiking, photography, board games, K-pop dance. Which one sounds like you?"]], task: "하나를 골라요 — 이유도",
      go: [
        { m: [["하이킹", ["hiking", "hike", "outdoor", "mountain", "trail"]], REASON], ex: "Hiking sounds great, because I love being outdoors.", set: { club: "hiking" }, reply: "Max approves. He gave you a tail wag.", to: "c" },
        { m: [["사진", ["photo", "photography", "camera", "picture"]], REASON], ex: "Photography. I enjoy taking pictures of the city.", set: { club: "photography" }, reply: "Nice! They do a sunrise walk every month.", to: "c" },
        { m: [["춤", ["dance", "k pop", "kpop", "dancing"]], REASON], ex: "The K-pop dance crew, since I used to dance in high school.", set: { club: "dance" }, reply: "Ooh, they perform at the spring festival!", to: "c" }] },
    c: { say: "Great choice. The sign-up table is over there. They'll ask for your name and email. Do you want to sign up now?", task: "지금 가입할지 나중에 할지 정해요",
      go: [
        { m: [["가입", ["sign up", "join", "yes", "sure", "let us", "go", "put my name", "sign"]]], ex: "Sure, let's go sign up now.", reply: "Perfect. Follow me!", to: "d" },
        { m: [["나중에", ["later", "not now", "think about", "first", "look around", "check other", "other club", "maybe"]], REASON], ex: "Maybe later. I want to look around first.", reply: "Smart. Take your time.", to: "d" }] },
    d: { lv: 2, say: "Perfect. Oh, and before I forget, Max is having a birthday party this Saturday at the park. It's for dogs, but humans are welcome too. Come!", task: "가겠다고 하고, 뭘 가져가면 좋을지 물어요",
      go: [{ m: [M.yes, ["가져갈 것", ["bring", "what can i", "should i bring", "anything"]]], ex: "I'd love to come! Should I bring anything?", to: "end" }] }
  },
  bye: "Just yourself. And maybe a treat for Max!",
  hear: [
    ["guest", "Excuse me, where do I sign up for the photo club?", [["sign up for", "~에 신청하다", "동아리·수업에 등록할 때 써요."]]],
    ["them", "Table twelve, by the fountain."],
    ["guest", "Is there a fee to join?"],
    ["them", "No, it's free for students."]
  ] });

EP({ id: "c29", part: "daily", who: "leo", time: "morning", title: "학기 마지막 날 카페", need: { after: [["c25", "c28"]] }, guest: "다른 손님",
  lines: {
    a: { say: [["pill=nondrowsy", "Hey, it's you! Last day of the semester, huh? You were the one studying here all night during exam week, wide awake. The usual?"], ["pill=regular", "Hey, it's you! Last day of the semester, huh? You were fighting sleepiness at that table all exam week. The usual?"], [null, "Hey, it's you! Last day of the semester, huh? The usual?"]], task: "오늘이 마지막 날이라고 말하고, 마실 것을 주문해요",
      go: [{ m: [["마지막", ["last day", "last", "final", "finished", "finals", "semester", "over", "done"]], ["주문", ["coffee", "latte", "americano", "tea", "please", "usual", "drink", "small", "medium", "large"]]], ex: "Yes, it's my last day. A large latte, please.", to: "b" }] },
    b: { say: [["trip", "Already? Time flies. Are you still going to {trip} for the break?"], [null, "Already? Time flies. Any plans for the break?"]], task: "방학 계획을 말해요",
      go: [{ m: [["계획", ["going", "plan", "trip", "travel", "visit", "home", "korea", "stay", "relax", "work", "sleep", "friend", "family", "japan", "europe", "canada"]]], ex: "Yes, I'm going to travel for two weeks, then I'll go home to Korea.", to: "c" }] },
    c: { say: [["club", "Nice. And how's the {club} club? Did you make friends there?"], [null, "Nice. Did you make some good friends this semester?"]], task: "새 친구를 사귀었다고 말해요",
      go: [{ m: [["친구", ["friend", "met", "people", "everyone", "classmate", "group", "team", "club"]], ["감상", ["great", "good", "amazing", "lucky", "lot", "many", "best", "happy", "glad", "fun"]]], ex: "Yes, I made some great friends this semester.", to: "d" }] },
    d: { lv: 2, say: "That's the best part of studying abroad, isn't it? Hey, could you write a few words in our guestbook before you go? We keep notes from our regulars.", task: "좋다고 하고, 뭐라고 쓸지 말해요",
      go: [{ m: [M.yes, ["내용", ["coffee", "best", "thank", "great", "miss", "love", "favorite", "nice", "cozy", "cafe", "staff", "write"]]], ex: "Sure! I'll write that this is my favorite cafe.", to: "e" }] },
    e: { say: "Thanks. Here's your drink. It's on the house today.", task: "고맙다고 하고, 꼭 다시 오겠다고 해요",
      go: [{ m: [M.thx, ["다시", ["come back", "visit again", "see you again", "be back", "return", "next time", "again", "miss"]]], ex: "Wow, thank you! I'll definitely come back someday.", to: "end" }] }
  },
  bye: [["trip", "Safe travels to {trip}. Come back and tell me everything!"], [null, "Safe travels. Come back and tell me everything!"]],
  hear: [
    ["guest", "Can I get a refill?", [["a refill", "리필", "음료를 더 받을 때 써요."]]],
    ["them", "Sure. It's free with the cup."],
    ["guest", "Do you close early today?"],
    ["them", "Yeah, at four. It's the last day of the semester.", [["the last day of", "~의 마지막 날", "마지막 날을 말할 때 써요."]]]
  ] });

EP({ id: "c30", part: "daily", who: "patel", time: "day", title: "퇴실 점검과 보증금", need: { after: ["c7", ["c25", "c29"]] }, guest: "다른 세입자",
  lines: {
    a: { say: [["lease", "Hello, {name}! So it's the end of your {lease} lease already. Time flies. Shall we do the move-out check?"], [null, "Hello, {name}! So it's the end of your lease already. Time flies. Shall we do the move-out check?"]], task: "청소를 다 했고 점검받을 준비가 됐다고 말해요",
      go: [{ m: [["청소", ["clean", "tidy", "vacuum", "mop", "wipe", "wash", "scrub", "pack"]], ["준비", ["ready", "finished", "done", "all set", "good to go"]]], ex: "Hi, Mr. Patel. I cleaned everything, so it's ready for the check.", to: "b" }] },
    b: { say: [["furn", "Let me take a look. Hmm, there's a scratch on the floor where the {furn} stood. Do you know how that happened?"], [null, "Let me take a look. Hmm, there's a scratch on the floor near the door. Do you know how that happened?"]], task: "사실대로 말해요 — 내가 그랬을 수도, 원래 있던 것일 수도 있어요",
      go: [
        { m: [["인정", ["sorry", "my fault", "my mistake", "probably me", "accident", "dragged", "dragging", "pushed", "by mistake", "my bad"]]], ex: "Sorry, I think it happened when I moved the furniture.", set: { blame: "me" }, to: "c" },
        { m: [["원래 있었음", ["was already", "already there", "before i", "when i moved in", "when i arrived", "first day", "was there", "existing"]], ["근거", ["photo", "picture", "check in", "inventory", "list", "report", "email", "remember", "noticed", "note", "i think", "pretty sure", "i am sure", "i believe"]]], ex: "I think it was already there when I moved in. I have a photo from the first day.", set: { blame: "before" }, to: "c", tip: ["when I moved in", "제가 입주했을 때", "처음 상태를 말할 때 써요."] }] },
    c: { say: [["blame=me", "Thank you for being honest. It's a small scratch, so I'll keep just twenty dollars. Now, the deposit. Would you like a bank transfer, or a check by mail?"], ["blame=before", "You're right, it's in my inspection report from last year. No charge. Now, the deposit. Would you like a bank transfer, or a check by mail?"], [null, "Okay. Now, the deposit. Would you like a bank transfer, or a check by mail?"]], task: "보증금을 어떻게 받을지 고르고, 이유를 말해요",
      go: [
        { m: [["송금", ["transfer", "bank", "account", "wire", "direct"]], REASON], ex: "Please transfer it to my bank account, because I'll leave the country.", set: { deposit: "transfer" }, to: "d" },
        { m: [["우편", ["mail", "check", "address", "send", "post", "korea"]], REASON], ex: "Could you mail a check to my address in Korea? I want to keep it simple.", set: { deposit: "mail" }, to: "d" }] },
    d: { lv: 2, say: "Good. It takes up to two weeks, and I'll email you when it's done. Any last questions?", task: "더 없다고 하고, 확인 메일을 보내 달라고 해요",
      go: [{ m: [["없음", ["no", "that is all", "that is everything", "nothing else", "all good"]], ["확인", ["confirmation", "confirm", "email", "receipt", "write", "proof"]]], ex: "No, that's all. Can you send me a confirmation email?", to: "e" }] },
    e: { say: "Of course. It was a pleasure having you here. Take care of yourself.", task: "고맙다고 하고, 언젠가 인사하러 오겠다고 해요",
      go: [{ m: [M.thx, ["작별", ["visit", "come back", "see you", "stay in touch", "keep in touch", "come by", "say hi", "next time", "again", "miss"]]], ex: "Thank you for everything, Mr. Patel. I'll come back to visit someday.", to: "end" }] }
  },
  bye: [["deposit=transfer", "Take care, {name}. The money will be in your account soon."], ["deposit=mail", "Take care, {name}. The check will be on its way to Korea."], [null, "Take care, {name}."]],
  hear: [
    ["guest", "Do I need to clean the oven too?", [["clean the oven", "오븐을 청소하다", "퇴실 청소 범위를 물을 때 써요."]]],
    ["them", "Yes, the oven and the fridge."],
    ["guest", "And where do I leave the keys?", [["leave the keys", "열쇠를 두고 가다", "퇴실할 때 열쇠를 어디에 둘지 물어요."]]],
    ["them", "In the mailbox is fine."]
  ] });
