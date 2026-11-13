const REASON = ["이유", ["because", "since", "good at", "good with", "like", "enjoy", "love", "want", "practice", "prefer", "comfortable", "experience", "challenge", "try", "not mind", "confident", "used to", "fine with", "so that", "so the", "so we", "so it", "so i"]];
// 목표: 유학·교환학생. 도착해서 생활 준비 → 방 구하기 → 첫 수업 → 조별 과제. 전공·맡은 역할을 기억해 뒤 이야기에 다시 나온다.
EP({ id: "c1", part: "daily", who: "zoe", time: "day", title: "유심 사기", guest: "다른 손님",
  lines: {
    a: { say: "Hi! What can I help you with today?", task: "이 휴대폰에 쓸 유심이 필요하다고 말해요",
      go: [{ m: [["유심", ["sim", "usim", "phone plan", "data plan", "plan", "phone number", "prepaid"]]], ex: "Hi, I need a SIM card for this phone.", to: "b" }] },
    b: { say: [["lv:2", "Sure, we can set that up. Depends a bit on how long you're going to be around, though. How long will you be here?"], [null, "Sure. How long will you be here?"]], task: "한 학기(넉 달쯤) 교환학생으로 왔다고 말해요",
      go: [{ m: [["기간", ["semester", "#", "month"]], ["학생", ["exchange", "student", "study", "school", "university"]]], ex: "About four months. I'm an exchange student.", to: "c", tip: ["exchange student", "교환학생", "study abroad는 '유학'이에요."] }] },
    c: { say: "Then a monthly plan is best. Thirty dollars for twenty gigs, or forty-five for unlimited.", task: "더 싼 걸로 하겠다고, 이유도 붙여요",
      go: [
        { m: [["싼 것", ["thirty", "twenty gig", "cheaper", "cheap", "cheapest", "first one", "basic", "small one", "less"]], ["이유", ["because", "since", "enough", "wifi", "anyway", "do not need", "budget", "not use much", "not much", "plenty", "save money", "money", "student", "only", "cheaper", "cheap", "save"]]], ex: "I'll take the thirty-dollar one. I use Wi-Fi at school anyway.", reply: "Smart. Most students do the same.", to: "d", tip: ["anyway", "어차피", "이유를 가볍게 덧붙일 때 끝에 붙여요."] },
        { m: [["무제한", ["unlimited", "forty five", "more data", "bigger", "second one"]], ["이유", ["because", "since", "lot", "video", "map", "need", "game", "stream", "youtube", "netflix", "always", "worry"]]], ex: "Unlimited, please. I watch a lot of videos.", reply: "Good call — you'll never have to worry about data.", to: "d" }] },
    d: { say: "Great. I'll just need your passport.", task: "여권을 건네며 학생 할인이 있는지 물어요",
      go: [{ m: [["건네기", ["here", "passport", "this be"]], ["학생 할인", ["discount", "student price", "cheaper for student", "student deal"]]], ex: "Here's my passport. Is there a student discount?", to: "end" }] }
  },
  bye: "Ten percent off with your student ID. Welcome!",
  hear: [
    ["guest", "My screen is cracked. Can you fix it here?", [["cracked", "금이 간", "화면이 깨졌을 때 써요."]]],
    ["them", "We don't do repairs, but there's a shop next door.", [["next door", "바로 옆", "옆 가게·옆집을 말해요."]]],
    ["guest", "How long does it usually take?"],
    ["them", "About an hour."]
  ] });

EP({ id: "c2", part: "daily", who: "linda", time: "day", title: "방 구하기", need: { after: ["c1"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi, come on in! What kind of place are you looking for?", task: "학교 근처 원룸을 찾는다고 말해요",
      go: [{ m: [["원룸", ["studio", "room", "apartment", "place", "flat", "small"]], ["학교 근처", ["near", "close", "campus", "school", "university", "walking distance"]]], ex: "I'm looking for a studio near campus.", to: "b" }] },
    b: { say: [["lv:2", "Okay. Just so I don't waste your time showing places you wouldn't want, what's your budget per month?"], [null, "Okay. What's your budget per month?"]], task: "한 달 예산을 말해요 (얼마든 내 사정대로)",
      go: [{ m: [["예산", ["#", "dollar", "up to", "under", "around", "about", "max", "maximum", "budget", "less than", "cheap"]]], ex: "Up to nine hundred a month.", to: "c", tip: ["Up to ~", "~까지", "최대 얼마까지인지 말할 때 써요."] }] },
    c: { say: "I have two. One is furnished but a bit far — twenty minutes by bus. The other is right next to campus, but empty.", task: "둘 중 하나를 골라요 — 왜 그걸 골랐는지 같이",
      go: [
        { m: [["가구 있는 곳", ["furnished", "furniture", "first one", "far one", "bus"]], ["이유", ["because", "since", "do not have", "no furniture", "only", "short", "buy", "semester", "save", "not want", "do not want", "easy", "cheaper"]]], ex: "The furnished one. I'm only here for a semester.", reply: "Makes sense. Less to buy, less to move.", to: "d" },
        { m: [["가까운 곳", ["next campus", "close", "second one", "near", "empty one", "walk"]], ["이유", ["because", "since", "walk", "time", "late", "early", "sleep", "bus", "commute", "convenient", "easy", "save", "class", "car", "bike"]]], ex: "The one next to campus. I want to walk to class.", reply: "Nice. You can roll out of bed five minutes before class.", to: "d" }] },
    d: { say: "Good choice. Any questions before you see it?", task: "공과금이 월세에 포함인지 물어봐요",
      go: [{ m: [["공과금", ["utilities", "bill", "electricity", "water", "gas", "internet"]], ["포함", ["include", "cover", "extra", "separate", "pay for", "in rent"]]], ex: "Are utilities included in the rent?", to: "end", tip: ["utilities", "공과금", "전기·수도·가스 요금을 묶어서 말해요."] }] }
  },
  bye: "Water's included, electricity isn't. Let's go take a look!",
  hear: [
    ["guest", "How much is the deposit?", [["deposit", "보증금", "계약할 때 맡기는 돈이에요."]]],
    ["them", "One month's rent."],
    ["guest", "And can I sign a six-month lease?", [["lease", "임대 계약", "집을 빌리는 계약이에요."]]],
    ["them", "Some landlords allow it. I'll ask."]
  ] });

EP({ id: "c3", part: "daily", who: "brown", time: "morning", title: "첫 수업 자기소개", need: { after: ["c1"] }, guest: "다른 학생",
  lines: {
    a: { say: "Welcome, everyone. Let's start with introductions. Could you tell us your name and where you're from?", task: "이름과 어디서 왔는지 말해요",
      go: [{ m: [["이름", ["{name}", "my name", "name be", "call me"]], M.from], ex: "Hi, I'm {name}. I'm from Seoul, Korea.", to: "b" }] },
    b: { say: "Welcome! And what's your major?", task: "내 전공을 말해요",
      go: [{ m: [["전공", ["computer science", "computer engineering", "ai", "artificial intelligence", "software", "data science", "engineering", "business", "economics", "marketing", "finance", "accounting", "design", "english", "korean", "history", "literature", "education", "psychology", "sociology", "political science", "math", "statistics", "biology", "chemistry", "physics", "medicine", "media", "film", "fashion", "law", "nursing", "architecture", "music", "art", "computer"]]], ex: "I major in AI and software.", cap: "major", to: "c", tip: ["I major in ~", "~을 전공해요", "My major is ~도 돼요."] }] },
    c: { say: [["lv:2", "Interesting! We don't get many students from that field in this class. What made you choose to study here?"], [null, "Interesting! Why did you choose to study here?"]], task: "여기 온 이유 하나를 말해요 — 진짜 이유로",
      go: [{ m: [["이유", ["because", "want", "improve", "learn", "experience", "culture", "english", "always", "dream", "friend", "recommend", "famous", "good school", "program", "professor", "scholarship", "travel", "abroad", "new", "interested", "love"]]], ex: "I wanted to improve my English and experience a new culture.", to: "d" }] },
    d: { say: "Great. One more — tell us one fun fact about yourself.", task: "나에 대한 재미있는 사실 하나를 말해요 (정답 없음)",
      go: [{ m: [["나에 대해", ["i can", "i have", "i once", "i love", "i like", "i use", "i be", "i play", "i went", "i visit", "my"]]], ex: "I can solve a Rubik's cube in one minute.", to: "e", tip: ["fun fact", "재미있는 사실", "자기소개에서 분위기를 풀 때 자주 시켜요."] }] },
    e: { say: "Ha, love it! Any questions about the class before we start?", task: "숙제가 매주 있는지 물어봐요",
      go: [{ m: [["숙제", ["homework", "assignment", "task", "quiz"]], ["매주", ["every week", "weekly", "each week", "week"]]], ex: "Is there homework every week?", to: "end" }] }
  },
  bye: "A short one every week, yes. Okay, let's begin!",
  hear: [
    ["guest", "Sorry, could you speak a little slower?", [["speak a little slower", "조금 천천히 말해 주세요", "수업에서 꼭 필요한 부탁이에요."]]],
    ["them", "Of course. Let me know if I'm going too fast.", [["Let me know", "알려 줘요", "필요하면 말해 달라는 뜻이에요."]]],
    ["guest", "And where can I find the slides?"],
    ["them", "I'll upload them after class."]
  ] });

EP({ id: "c4", part: "daily", who: "noah", time: "day", title: "조별 과제", need: { after: ["c3"] }, guest: "다른 조원",
  lines: {
    a: { say: [["major", "Hey, you're the {major} student, right? I'm Noah. Looks like we're in the same group."], [null, "Hey, I'm Noah. Looks like we're in the same group."]], task: "반갑다고 인사하고, 잘해 보자고 해요",
      go: [{ m: [M.hi, ["다짐", ["let us", "looking forward", "good team", "great team", "do well", "work together", "do great", "our best", "my best", "crush it", "together", "excited", "fun", "good job", "great job", "nail it"]]], ex: "Nice to meet you, Noah. Let's do a great job together.", to: "b" }] },
    b: { say: "So we need research, slides, and someone to present. What do you want to do?", task: "맡고 싶은 일을 골라요 — 이유도 한마디",
      go: [
        { m: [["자료 조사", ["research", "find information", "search", "data"]], REASON], ex: "I'll do the research. I'm good at finding information.", set: { role: "research" }, to: "c" },
        { m: [["슬라이드", ["slide", "design", "powerpoint", "ppt"]], REASON], ex: "I can make the slides. I like design.", set: { role: "slides" }, to: "c" },
        { m: [["발표", ["present", "presentation", "speak", "talk"]], REASON], ex: "I'll present. I want to practice speaking.", set: { role: "presentation" }, to: "c" }] },
    c: { say: [["lv:2", "Perfect, that works for me. The deadline's coming up pretty quickly, so when should we meet next?"], [null, "Perfect. When should we meet next?"]], task: "다음 모임 요일과 시간을 제안해요",
      go: [{ m: [M.day, M.time], ex: "How about Thursday at four?", cap: "meetday", to: "d", tip: ["How about ~?", "~ 어때요?", "약속을 제안할 때 가장 흔한 말이에요."] }] },
    d: { say: [["meetday", "{meetday} works for me. Let's make a group chat."], [null, "Works for me. Let's make a group chat."]], task: "좋다고, 내가 채팅방을 만들겠다고 해요",
      go: [{ m: [["내가", ["i will", "i can", "let me", "i make", "i create", "i set", "i be on it", "i got it", "leave it to me"]], ["채팅방", ["chat", "group", "make one", "create", "set it up", "room", "kakao"]]], ex: "Sounds good. I'll make the group chat.", to: "end" }] }
  },
  bye: "Awesome. See you then!",
  hear: [
    ["guest", "Can we push the deadline back?", [["push the deadline back", "마감을 미루다", "일정을 뒤로 미룰 때 써요."]]],
    ["them", "I don't think so. It's due next Friday.", [["It's due", "마감이에요", "과제 마감을 말할 때 써요."]]],
    ["guest", "Okay, then let's split the work.", [["split the work", "일을 나누다", "조별 과제에서 꼭 나와요."]]],
    ["them", "Good idea."]
  ] });

EP({ id: "c5", part: "daily", who: "brown", time: "day", title: "선생님 면담", need: { after: ["c4"], rel: { brown: 1 } }, guest: "다른 학생",
  lines: {
    a: { say: [["role", "Come on in. Noah says you're doing the {role} for your group — nice. What can I do for you?"], [null, "Come on in. What can I do for you?"]], task: "과제 마감을 며칠 늦춰 줄 수 있는지 정중하게 물어요",
      go: [{ m: [["부탁", ["could i", "would it be possible", "be it possible", "can i", "may i", "would you", "could you", "can you", "i be wondering", "please"]], ["연장", ["extension", "more time", "extra time", "more day", "extra day", "few day", "later", "late", "next week", "delay", "extend"]]], ex: "Would it be possible to get a few more days for the assignment?", to: "b", tip: ["Would it be possible to ~?", "~해도 될까요?", "아주 정중한 부탁이에요."] }] },
    b: { say: "Hmm. Can you tell me why?", task: "이유를 솔직하게 말해요 (아팠다, 다른 과제가 겹쳤다, 자료를 더 찾고 싶다 등)",
      go: [{ m: [["이유", ["sick", "ill", "fever", "cold", "hospital", "another", "other", "exam", "more time", "research", "busy", "family", "because", "project", "more data", "need more", "work", "job", "computer", "lost", "emergency", "so", "flu", "covid", "behind", "hurt"]]], ex: "I was sick last week, so I fell behind.", to: "c", tip: ["fall behind", "뒤처지다", "일정이 밀렸을 때 써요."] }] },
    c: { say: [["lv:2", "I see. I appreciate you telling me ahead of time. I can give you until Monday, but not any later than that. Is that enough?"], [null, "I see. I can give you until Monday. Is that enough?"]], task: "충분하다고, 고맙다고 해요",
      go: [{ m: [["충분", ["enough", "perfect", "work", "great", "plenty", "fine", "good", "okay", "yes"]], M.thx], ex: "That's perfect. Thank you so much for understanding.", to: "end" }] }
  },
  bye: "No problem. Feel better!",
  hear: [
    ["guest", "Do you have office hours today?", [["office hours", "면담 시간", "교수님을 찾아가 질문할 수 있는 시간이에요."]]],
    ["them", "Yes, from two to four."],
    ["guest", "Could I ask about my grade?"],
    ["them", "Sure, come by anytime.", [["come by", "들르다", "가볍게 찾아오라는 말이에요."]]]
  ] });
