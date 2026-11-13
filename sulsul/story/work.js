const W_STR = ["장점", ["fast learner", "quick learner", "learn quickly", "learn fast", "hardworking", "hard work", "curious", "creative", "organized", "patient", "team player", "problem solv", "persistent", "persistence", "responsible", "reliable", "dependable", "calm", "diligent", "honest", "positive", "communicat", "never give up", "good at", "strength"]], W_EG = ["예", ["for example", "when", "last", "once", "taught", "built", "learned", "in", "during", "because", "always", "fixed", "made", "every", "by myself", "so", "finish", "deadline", "project"]];
// 목표: 영어 면접·회사. 채용 담당자 전화 → 친구와 면접 연습 → 전화 면접 → 대면 면접 → 첫 출근. 전화는 그림 대신 통화 화면.
EP({ id: "w1", part: "work", who: "priya", art: "call", time: "morning", title: "채용 담당자의 전화", guest: "옆자리 직원",
  lines: {
    a: { say: "Hi, this is Priya from Fernlight. Is this {name}?", task: "네, 맞다고 하고 반갑게 받아요",
      go: [{ m: [["맞음", ["yes", "speaking", "this be", "that be me", "it be me", "{name}"]]], ex: "Yes, speaking. Hi, Priya!", to: "b", tip: ["Speaking", "전데요", "전화에서 '제가 그 사람이에요'라는 뜻이에요."] }] },
    b: { say: "We got your application for the software intern position. Do you have a few minutes to talk?", task: "지금 통화 가능한지 사실대로 — 괜찮으면 괜찮다고, 아니면 다시 걸어 달라고",
      go: [
        { m: [["가능", ["yes", "sure", "of course", "now be fine", "good time", "i do", "i have time", "go ahead", "okay", "free"]]], ex: "Sure, now is a good time.", to: "c" },
        { m: [["나중에", ["later", "call me back", "call back", "busy", "in class", "not good time", "driving", "meeting", "can not talk", "another time"]]], ex: "I'm in class right now. Could you call me back in an hour?", to: "b2", tip: ["call me back", "다시 걸어 주다", "지금 못 받을 때 써요."] }] },
    b2: { say: "No problem. … Hi again! Is now better?", task: "네, 다시 걸어 줘서 고맙다고 해요",
      go: [{ m: [M.thx], ex: "Yes, thanks for calling back.", to: "c" }] },
    c: { say: [["lv:2", "Great, I'll keep it short. We've had quite a few applicants, so could you briefly tell me why you're interested in this role?"], [null, "Great. Could you briefly tell me why you're interested in this role?"]], task: "관심 있는 이유를 두 가지로 말해요 (배우고 싶은 것 + 내가 잘하는 것)",
      go: [{ m: [["배우고 싶음", ["learn", "experience", "grow", "real", "team", "improve", "develop", "career", "challenge", "interested", "excited"]], ["잘하는 것", ["good at", "i have", "skill", "built", "made", "project", "python", "coding", "ai", "strong", "quick learner", "know", "studied", "i can"]]], ex: "I want to learn how a real team works, and I've built a few AI projects.", to: "d" }] },
    d: { say: "Sounds good. We'd like to set up a phone interview with our engineering manager. When are you free this week?", task: "가능한 요일과 시간을 말해요",
      go: [{ m: [["요일", ["monday", "tuesday", "wednesday", "thursday", "friday"]], M.time], ex: "I'm free on Wednesday afternoon.", cap: "iday", to: "end" }] }
  },
  bye: "Perfect, I'll send you an email with the details. Talk soon!",
  hear: [
    ["guest", "Hi, I'm calling about the job posting.", [["I'm calling about ~", "~ 때문에 전화했어요", "전화 첫마디로 용건을 말할 때 써요."]]],
    ["them", "Sure, which position are you interested in?"],
    ["guest", "The marketing assistant role."],
    ["them", "Great. Let me transfer you.", [["transfer you", "연결해 드리다", "다른 사람에게 전화를 넘길 때 써요."]]]
  ] });

EP({ id: "w2", part: "work", who: "brown", time: "day", title: "선생님과 면접 연습", need: { after: ["w1"] }, guest: "다른 학생",
  lines: {
    a: { say: [["major", "Hi {name}! I heard Fernlight called you. Let's practice — I'll be the interviewer. So, tell me about yourself."], [null, "Hi, I'm Mr. Brown. I help students get ready for interviews. Let's practice — I'll be the interviewer. So, tell me about yourself."]], task: "자기소개를 해요 — 학년·전공 + 관심 있는 것, 두 문장으로",
      go: [{ m: [["학생", ["student", "year", "major", "study", "university", "college", "freshman", "sophomore", "school"]], ["관심", ["interested", "passionate", "love", "enjoy", "like", "focus", "want", "dream", "into", "curious"]]], ex: "I'm a first-year AI student. I'm really interested in building useful apps.", to: "b", tip: ["Tell me about yourself", "자기소개 해 주세요", "면접 첫 질문으로 거의 꼭 나와요."] }] },
    b: { say: [["lv:2", "Good, but try to keep it under a minute in the real thing. Now, what would you say is your biggest strength?"], [null, "Good! Now, what's your biggest strength?"]], task: "내 장점 하나와, 그걸 보여 주는 짧은 예를 말해요",
      go: [{ m: [W_STR, W_EG], ex: "I learn quickly. For example, I taught myself Python in a month.", cap: "strength", to: "c" }] },
    c: { say: "Nice. And what's a weakness?", task: "약점 하나와, 고치려고 하는 방법을 말해요",
      go: [{ m: [["약점", ["sometimes", "i tend", "not good at", "weakness", "nervous", "shy", "perfectionist", "too much", "overthink", "procrastinat", "slow", "impatient", "weak"]], ["노력", ["working on", "try", "so now", "now i", "practice", "improve", "learn", "so i", "i make", "i set", "i study", "every day", "i join", "i use"]]], ex: "I get nervous speaking English, so I practice every day.", to: "d", tip: ["I'm working on it", "고치는 중이에요", "약점을 말한 뒤엔 꼭 노력을 붙여요."] }] },
    d: { say: "That was really good! Honestly, you'll be fine.", task: "고맙다고, 덕분에 자신감이 생겼다고 해요",
      go: [{ m: [M.thx, ["자신감", ["confident", "confidence", "better", "ready", "less nervous", "helpful", "helped"]]], ex: "Thank you, Mr. Brown. I feel much more confident now.", to: "end" }] }
  },
  bye: "Go get it!",
  hear: [
    ["them", "At the end, they'll ask: do you have any questions for us?", [["Do you have any questions for us?", "질문 있으세요?", "면접 끝에 꼭 나와요. 질문 하나는 준비해 가요."]]],
    ["guest", "What should I ask?"],
    ["them", "Try this: what does a typical day look like for an intern?", [["a typical day", "보통의 하루", "일이 어떤지 물을 때 좋아요."]]],
    ["guest", "Good one. I'll write that down."]
  ] });

EP({ id: "w3", part: "work", who: "derek", art: "call", time: "day", title: "전화 면접", need: { after: ["w2"] }, guest: "Priya",
  lines: {
    a: { say: [["iday", "Hi {name}, this is Derek. Thanks for making time this {iday}. Can you hear me okay?"], [null, "Hi {name}, this is Derek. Can you hear me okay?"]], task: "잘 들린다고 하고, 시간 내 줘서 고맙다고 해요",
      go: [{ m: [["들림", ["hear", "loud and clear", "yes", "fine", "perfectly", "clearly"]], M.thx], ex: "Yes, I can hear you fine. Thank you for your time.", to: "b" }] },
    b: { say: "Tell me about a project you're proud of.", task: "자랑하고 싶은 프로젝트 하나 — 무엇을 만들었고, 내가 맡은 일이 뭔지",
      go: [{ m: [["만든 것", ["app", "website", "site", "game", "program", "project", "bot", "chatbot", "tool", "model", "database", "service", "system", "robot", "platform"]], ["내 역할", ["i made", "i built", "i designed", "i wrote", "i be in charge", "my part", "my role", "my job", "i handled", "i created", "i did", "i developed", "i coded", "i programmed", "i worked on", "i be responsible", "backend", "frontend"]]], ex: "I built an English speaking app. I made the speech recognition part.", to: "c", tip: ["I was in charge of ~", "~을 맡았어요", "팀 프로젝트에서 내 역할을 말할 때 써요."] }] },
    c: { say: [["lv:2", "Interesting. Most people only tell me what went well, so I'll ask the other way around. What was the hardest part?"], [null, "Interesting. What was the hardest part?"]], task: "가장 어려웠던 점과, 어떻게 해결했는지 말해요",
      go: [{ m: [["어려움", ["hardest", "hard", "tough", "difficult", "problem", "challenge", "struggle", "issue", "not work", "bug", "error", "nightmare", "pain", "took long"]], ["해결", ["so i", "so we", "fixed", "solved", "tried", "found", "finally", "changed", "by reading", "split", "broke", "test", "we made", "i made", "asked", "learned", "i used", "searched", "but i"]]], ex: "The hardest part was a bug in the audio, so I tried a different library.", to: "d" }] },
    d: { say: "Good. Do you have any questions for me?", task: "질문 하나를 해요 (인턴의 하루, 팀, 배우게 될 것 중에서)",
      go: [{ m: [["질문", ["what", "how", "who", "which", "where", "when", "do you", "do i", "be there", "will i", "can you tell", "could you tell", "tell me about", "typical day", "team"]]], ex: "What does a typical day look like for an intern?", to: "end" }] }
  },
  bye: "Great question — interns ship real features. We'd love to invite you to an in-person interview!",
  hear: [
    ["guest", "Derek, how did it go?", [["how did it go?", "어떻게 됐어요?", "결과를 물을 때 써요."]]],
    ["them", "Really well. They explained their project clearly."],
    ["guest", "Should I schedule the next round?", [["the next round", "다음 단계", "면접의 다음 차례를 말해요."]]],
    ["them", "Yes, as soon as possible."]
  ] });

EP({ id: "w4", part: "work", who: "derek", art: "interview", time: "day", title: "대면 면접", need: { after: ["w3"] }, guest: "Priya",
  lines: {
    a: { say: "Welcome! Did you find the office okay?", task: "쉽게 찾았다고 하고, 사무실이 멋지다고 한마디 해요",
      go: [{ m: [["찾음", ["yes", "easy", "easily", "no problem", "found", "find", "quickly", "not hard", "map"]], ["칭찬", ["nice", "beautiful", "cool", "love", "great", "amazing", "awesome", "wow", "pretty", "modern", "impressive", "look"]]], ex: "Yes, it was easy to find. Your office is really nice.", to: "b" }] },
    b: { say: [["lv:2", "Thanks, we just moved in. So, you could probably apply to much bigger companies. Why Fernlight?"], [null, "Thanks! So, why Fernlight and not a bigger company?"]], task: "작은 회사가 좋은 이유를 말해요",
      go: [{ m: [["이유", ["small", "learn", "real", "close", "impact", "responsib", "fast", "grow", "many thing", "chance", "own", "idea", "product", "mission", "flexible", "talk easy", "direct", "everyone", "culture"]]], ex: "In a small team, I can learn more and do real work.", to: "s" }] },
    s: { say: "Okay. And what would you say is your biggest strength?", task: [["strength", "연습한 대로 — 내 장점({strength})과 그걸 보여 주는 예를 말해요"], [null, "내 장점 하나와, 그걸 보여 주는 예를 말해요"]],
      go: [{ m: [W_STR, W_EG], ex: "I'm a fast learner. For example, I taught myself Python in a month.", to: "c" }] },
    c: { say: "Last question. How do you handle disagreements with teammates?", task: "의견이 다를 때 어떻게 하는지 — 먼저 듣고, 이유로 이야기한다는 식으로",
      go: [{ m: [["듣기", ["listen", "understand", "ask why", "hear", "their side", "respect", "other opinion"]], ["이야기", ["explain", "talk", "discuss", "reason", "data", "compromise", "together", "share", "fact", "solution", "middle"]]], ex: "I listen first, then I explain my reasons and we decide together.", to: "end", tip: ["I listen first", "먼저 들어요", "갈등 질문의 좋은 첫마디예요."] }] }
  },
  bye: "Great answers. We'll be in touch by Friday.",
  hear: [
    ["guest", "Can I get you some water or coffee?", [["Can I get you ~?", "~ 드릴까요?", "손님에게 권할 때 써요."]]],
    ["them", "Water would be great, thanks."],
    ["guest", "Derek will be with you in a minute.", [["be with you in a minute", "곧 갈 거예요", "잠깐 기다려 달라는 말이에요."]]],
    ["them", "No problem."]
  ] });

EP({ id: "w5", part: "work", who: "aiden", art: "startupdev", time: "morning", title: "사무실 첫 출근", need: { after: ["w21"] }, guest: "Derek",
  lines: {
    a: { say: "Hey, {name}! Nice to finally meet you in person. Welcome to the office!", task: "직접 만나서 반갑다고, 잘 부탁한다고 해요",
      go: [{ m: [M.hi, ["부탁", ["looking forward", "excited", "thank", "glad", "help me", "take care of me", "please", "happy", "learn from you", "work with you", "counting on"]]], ex: "Hi Aiden! Nice to meet you in person. I'm excited to work with you.", to: "b" }] },
    b: { say: [["lv:2", "First things first, IT usually takes forever with these, so: did you get your laptop set up?"], [null, "First things first: did you get your laptop set up?"]], task: "아직 와이파이에 못 붙었다고, 도와줄 수 있는지 물어요",
      go: [{ m: [["와이파이", ["wifi", "internet", "network", "connect"]], ["도움", ["help", "could you", "can you", "show me"]]], ex: "Not yet. I can't connect to the Wi-Fi. Could you help me?", to: "c" }] },
    c: { say: "Sure, here's the password. We have a stand-up meeting at ten. You'll just say what you're working on.", task: "모르는 말이 나왔어요 — 스탠드업이 뭔지 물어봐요",
      go: [{ m: [["뜻", ["what be", "what do", "mean", "explain", "never heard", "not know", "not sure"]], ["스탠드업", ["standup"]]], ex: "Sorry, what's a stand-up meeting?", to: "d", tip: ["What's a ~?", "~가 뭐예요?", "모르는 말은 바로 묻는 게 회사에서도 좋아요."] }] },
    d: { say: "It's a quick daily meeting. Everyone shares yesterday, today, and any blockers.", task: "알겠다고 하고, 회의에서 오늘 할 일을 뭐라고 말할지 해 봐요 (첫날이니 코드 구조 익히기)",
      go: [{ m: [["알겠음", ["got it", "i see", "okay", "make sense", "understand", "alright", "sure"]], ["오늘 할 일", ["today", "codebase", "code", "learn", "read", "study", "structure"]]], ex: "Got it. I'll say I'm learning the codebase today.", to: "end" }] }
  },
  bye: "Perfect. Welcome to the team!",
  hear: [
    ["guest", "Morning, everyone. Let's do a quick stand-up.", [["a quick stand-up", "짧은 아침 회의", "서서 짧게 하는 회의예요."]]],
    ["them", "Yesterday I fixed the login bug. Today I'm working on the search page.", [["I'm working on ~", "~을 하고 있어요", "진행 중인 일을 말할 때 써요."]]],
    ["guest", "Any blockers?", [["blockers", "막힌 것", "일이 진행 안 되게 막는 문제예요."]]],
    ["them", "Nope, all good."]
  ] });
