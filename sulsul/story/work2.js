// 목표: 면접·회사 2부 (w6~w30). 면접 준비(그림 있는 장소·전화) → 최종 면접 → 합격·서류 → 원격 첫날 → 회사 생활 → 정규직 제안·작별.
// 그림 없이도 열리는 길: w6~w23·w25·w26·w29. 그림 기다리는 이야기(w24·w27·w28·w30)는 뒤에 아무것도 막지 않는다.
// 기억: motive intro lesson fail pay resched start voice helpstyle review mistake lunch fb final (+ 기존 iday strength)
EP({ id: "w6", part: "work", who: "brown", time: "day", title: "왜 이 회사예요?", need: { after: ["w1"] }, guest: "다른 학생",
  lines: {
    a: { say: [["lv:2", "Hi {name}! Come in. Fernlight will almost certainly ask 'Why this company?', and most students give a vague answer. Let's make yours specific. Why Fernlight?"], [null, "Hi {name}! They will ask 'Why Fernlight?' Let's try it. Why do you want this job?"]], task: "이 회사에 지원한 진짜 이유를 말해요 (배우고 싶어서인지, 제품이 마음에 들어서인지)",
      go: [
        { m: [["배움", ["learn", "grow", "experience", "mentor", "improve", "skills", "get better", "practice", "training", "start my career"]]], ex: "I want to learn from real engineers and grow my skills.", set: { motive: "learn" }, to: "b" },
        { m: [["제품", ["product", "app", "service", "your tool", "your website", "your users", "use your", "love your", "like your", "mission", "what you build", "what you make", "technology", "your work", "your platform"]]], ex: "I use your app every day, and I love what you're building.", set: { motive: "product" }, to: "b", tip: ["what you're building", "당신들이 만드는 것", "회사를 칭찬할 때 what you build가 자연스러워요."] }] },
    b: { say: "Good start. Now add why you're a good fit. What can you bring to the team?", task: "내가 그 일에 어울리는 이유를 한 문장으로 말해요",
      go: [{ m: [["어울림", ["i can", "i have", "i am good", "good at", "experience", "skill", "project", "built", "made", "python", "studied", "strong", "background", "passion", "hardworking", "quick"]]], ex: "I'm a quick learner, and I've built a few small apps.", to: "c" }] },
    c: { lv: 2, say: "Okay. Now squeeze it into one sentence, because the interviewer may only give you ten seconds. Start with 'I want to join Fernlight because...'", task: "'왜냐하면'을 넣어서 한 문장으로 합쳐 말해요",
      go: [{ m: [["이유", ["because", "since", "so i", "that is why"]], ["하고 싶은 것", ["join", "work", "want", "would like", "would love", "excited", "hope"]]], ex: "I want to join Fernlight because I can learn fast and build useful things.", to: "end" }] }
  },
  bye: "That's a real answer. Say it like that on the phone and you'll do great.",
  hear: [
    ["guest", "Mr. Brown, can I ask how you got into teaching?", [["how you got into ~", "~를 어떻게 시작했는지", "경력의 시작을 물을 때 써요."]]],
    ["them", "Honestly, I just fell into it. I was helping a friend study, and I loved it.", [["fell into it", "어쩌다 하게 됐어요", "계획 없이 시작한 일을 말해요."]]],
    ["guest", "That's a great story."],
    ["them", "Everyone has one. You just need to tell it clearly."]
  ] });

EP({ id: "w7", part: "work", who: "zoe", time: "day", title: "면접 전화를 놓치지 않으려면", need: { after: ["w1"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi there! What can I do for you today?", task: "전화를 자주 놓친다며, 음성 메시지(보이스메일)를 설정해 달라고 부탁해요",
      go: [{ m: [["음성 메시지", ["voicemail", "voice mail", "voice message"]], ["설정 부탁", ["set voicemail", "please set", "set up", "setup", "turn on", "activate", "need", "want", "would like", "can you", "could you", "help"]]], ex: "I keep missing calls. Could you set up my voicemail?", to: "b", tip: ["Could you set up ~?", "~를 설정해 주실래요?", "가게에서 정중하게 부탁할 때 써요."] }] },
    b: { say: [["lv:2", "Sure. Let me check your account. It's on, but the greeting is the default robot voice, and people will think they dialed the wrong number. Want to record your own?"], [null, "Sure. It's on, but the greeting is a robot voice. Want to record your own?"]], task: "직접 인사말을 녹음할지 말지 골라요",
      go: [
        { m: [["녹음", ["record", "my own", "my voice", "yes", "sure", "please", "personal", "greeting", "let me"]]], ex: "Yes, I'd like to record my own greeting.", reply: "Great. Just talk after the beep.", to: "c" },
        { m: [["그대로", ["no", "keep", "default", "robot", "leave it", "it be fine", "okay as is", "that be fine", "do not need"]]], ex: "No, the default is fine, thanks.", reply: "No problem. It's your call.", to: "c" }] },
    c: { say: "All right. One more thing, your data plan. Unlimited is forty dollars, and the small plan is twenty.", task: "면접 영상 통화를 많이 할 것 같은지 생각해서 하나를 골라요",
      go: [
        { m: [["무제한", ["unlimited", "forty", "big plan", "bigger", "first one", "more data"]]], ex: "I'll take the unlimited plan. I'll have a lot of video calls.", reply: "Smart. That'll cover your interviews.", to: "d" },
        { m: [["작은 것", ["small", "twenty", "cheaper", "cheap", "second", "less data", "basic"]]], ex: "The small one is enough. I mostly use Wi-Fi.", reply: "Fine. You can upgrade anytime.", to: "d" }] },
    d: { say: "All set. Anything else?", task: "고맙다고 해요 (곧 면접 전화가 온다고 덧붙이면 더 좋아요)", more: { m: [["면접", ["interview", "job", "recruiter", "hiring", "call"]]] },
      go: [{ m: [M.thx], ex: "Thank you! I'm waiting for an interview call.", to: "end" }] }
  },
  bye: "Good luck with the interview!",
  hear: [
    ["guest", "Hi, my screen cracked. Can you fix it today?", [["Can you fix it today?", "오늘 고쳐 줄 수 있어요?", "급한 부탁을 할 때 써요."]]],
    ["them", "It takes about an hour. Want to wait or come back?"],
    ["guest", "I'll come back at five."],
    ["them", "Perfect, see you then.", [["see you then", "그때 봐요", "약속 시간을 정한 뒤에 하는 인사예요."]]]
  ] });

EP({ id: "w8", part: "work", who: "leo", time: "morning", title: "카페에서 만난 인연", need: { after: ["w1"] }, guest: "옆자리 손님",
  lines: {
    a: { say: [["lv:2", "Morning! You've got a stack of papers there. Is that homework, or are you job hunting?"], [null, "Morning! What's all that paper? You look busy."]], task: "취업 준비 중이라고, 이번 주에 면접이 있다고 말해요",
      go: [{ m: [["준비 중", ["job", "interview", "internship", "application", "apply", "prepare", "career", "work", "hiring", "company"]]], ex: "Yes, I'm preparing for a job interview this week.", to: "b" }] },
    b: { say: "No way, good luck! Actually, my cousin works at a startup downtown. She hires interns sometimes.", task: "소개해 달라고 부탁하거나, 소개는 부담스러우니 조언만 구해요",
      go: [
        { m: [["소개", ["tell her about me", "tell her", "introduce", "put me in touch", "connect me", "meet her", "talk to her", "her contact", "her email"]]], ex: "Wow, that's great. Could you introduce me to her?", set: { intro: "yes" }, to: "c", tip: ["put me in touch with ~", "~와 연결해 주다", "사람을 소개받고 싶을 때 써요."] },
        { m: [["사양", ["uncomfortable", "advice", "rather not", "not bother", "no pressure", "maybe later", "not now", "too much", "not ready", "no thank"]], ["조언", ["advice", "tips", "tip", "suggest", "recommend", "what should"]]], ex: "Thanks, but I'd rather not bother her. Do you have any advice?", set: { intro: "no" }, to: "c2" }] },
    c: { say: "Sure, I'll text her tonight. What's the best email for her to reach you?", task: "이메일 주소를 천천히 불러 줘요",
      go: [{ m: [["이메일", ["email", "gmail", "dot com", "naver"]], ["천천히", ["spell", "slowly", "slow"]]], ex: "My email is chang at gmail dot com. Let me spell it.", to: "d" }] },
    c2: { say: "My advice: tell people exactly what you want. What kind of job are you looking for?", task: "찾는 일이 어떤 건지 구체적으로 말해요",
      go: [{ m: [["일", ["developer", "software", "engineer", "intern", "internship", "coding", "programming", "ai", "data", "design", "marketing", "backend", "frontend", "app", "web"]]], ex: "I'm looking for a software internship.", to: "d" }] },
    d: { say: "Here's your coffee. It's on the house, for luck!", task: "고맙다고 하고, 결과를 알려 주겠다고 해요",
      go: [{ m: [M.thx, ["소식", ["let you know", "keep you posted", "tell you", "update", "how it go", "how it goes"]]], ex: "Thank you so much! I'll let you know how it goes.", to: "end" }] }
  },
  bye: "I'm rooting for you. Go get it!",
  hear: [
    ["guest", "Is this seat taken?", [["Is this seat taken?", "여기 자리 있어요?", "카페에서 자리를 물을 때 써요."]]],
    ["them", "No, go ahead."],
    ["guest", "Thanks. Are you working on something?"],
    ["them", "Just a resume. Trying to make it fit one page.", [["make it fit", "~에 맞추다", "분량이나 크기에 맞출 때 써요."]]]
  ] });

EP({ id: "w9", part: "work", who: "brown", time: "day", title: "면접 일정 이메일 답장", need: { after: ["w2"] }, guest: "다른 학생",
  lines: {
    a: { say: [["iday", "Priya's email says: 'Does {iday} still work for the interview?' Let's write your reply out loud. Start by thanking her."], [null, "Priya's email asks if the interview time still works. Let's write your reply out loud. Start by thanking her."]], task: "이메일 첫 문장 — 연락해 줘서 고맙다고 해요",
      go: [{ m: [M.thx, ["받는 사람", ["priya", "dear", "hi", "email", "message", "contacting", "reaching out", "getting back", "writing"]]], ex: "Dear Priya, thank you for your email.", to: "b" }] },
    b: { say: "Good. Now the answer. Can you make that time?", task: "그 시간이 가능하다고 확인하거나, 정중하게 다른 시간을 부탁해요",
      go: [
        { m: [["가능", ["that time be okay", "be okay", "still work", "works for me", "work for me", "that work", "i can make it", "available", "confirm", "fine for me", "look forward"]]], ex: "Yes, that still works for me. I'm available.", reply: "Clear and short. Perfect.", to: "c" },
        { m: [["양해", ["unfortunately", "sorry", "afraid", "apologize", "unable", "can not make it", "conflict", "exam", "class"]], ["다른 때", ["another time", "different time", "another day", "reschedule", "move", "later", "earlier", "could we", "would it be possible", "possible", "instead"]]], ex: "Unfortunately, I have an exam then. Could we move it to the afternoon?", reply: "Good. Polite and specific. That's how to ask for a change.", to: "c", tip: ["Would it be possible to ~?", "~해도 될까요?", "일정을 바꿔 달라고 할 때 가장 정중해요."] }] },
    c: { lv: 2, say: "One more thing professionals do: end the email with a clear next step and a polite sign-off.", task: "마무리 문장 — 답을 기다리겠다는 말과 끝인사를 해요",
      go: [{ m: [["기다림", ["look forward", "hear from you", "let me know", "waiting", "talk soon"]], ["끝인사", ["best", "regards", "sincerely", "thanks again", "thank you", "cheers"]]], ex: "I look forward to hearing from you. Best regards, Chang.", to: "d" }] },
    d: { say: "Well done. That email would impress anyone.", task: "고맙다고 하고, 오늘 밤 실제로 보내 보겠다고 해요",
      go: [{ m: [M.thx, ["보내기", ["send", "email", "write", "try", "use", "real", "will do"]]], ex: "Thanks, Mr. Brown. I'll send it tonight.", to: "end" }] }
  },
  bye: "Great. Hit send, then relax.",
  hear: [
    ["guest", "Should I write 'Dear' or 'Hi' in an email?"],
    ["them", "For a first email, 'Dear' is safer. After that, 'Hi' is fine.", [["is safer", "더 안전해요", "두 선택지 중 무난한 쪽을 말해요."]]],
    ["guest", "What about the sign-off?", [["sign-off", "끝인사", "이메일 끝의 Best regards 같은 말이에요."]]],
    ["them", "'Best regards' works for almost everything."]
  ] });

EP({ id: "w10", part: "work", who: "jess", time: "day", title: "면접 전날 미용실", need: { after: ["w2"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi! What are we doing today?", task: "면접이 있어서 단정하게 다듬고 싶다고 말해요",
      go: [{ m: [["면접", ["interview", "job", "important", "meeting", "big day", "company"]], ["다듬기", ["trim", "tidy", "neat", "cut", "clean", "professional", "haircut", "hair", "look good", "fix", "shorter"]]], ex: "I have a job interview, so I'd like a clean, neat haircut.", to: "b" }] },
    b: { say: "Congrats on the interview! How short do you want it? Just a trim, or a real change?", task: "조금만 다듬을지, 확 짧게 자를지 골라요",
      go: [
        { m: [["조금", ["trim", "little", "bit", "just the end", "not too short", "a little", "tidy up", "just a trim"]]], ex: "Just a trim, please. Not too short.", reply: "Got it. Safe and neat.", to: "c" },
        { m: [["짧게", ["short", "shorter", "clean cut", "real change", "much", "a lot", "take off", "fresh"]]], ex: "Shorter, please. I want a fresh look.", reply: "Fun! Let's do it.", to: "c" }] },
    c: { say: "So tell me about this job! What would you be doing?", task: "어떤 일에 지원하는지 쉽게 설명해요",
      go: [{ m: [["일", ["software", "intern", "internship", "developer", "coding", "app", "tech", "company", "startup", "engineer", "programming", "ai"]]], ex: "It's a software internship at a small tech company.", to: "d" }] },
    d: { lv: 2, say: "That sounds exciting. The best advice I give my clients before a big day is to sleep well and smile. Are you nervous?", task: "긴장되는지 솔직하게 말해요",
      go: [{ m: [["기분", ["nervous", "excited", "scared", "worried", "anxious", "fine", "calm", "ready", "confident", "a little", "bit"]]], ex: "A little nervous, but mostly excited.", to: "e" }] },
    e: { say: "All done! Take a look in the mirror.", task: "마음에 든다고 해요 (어디가 좋은지 덧붙이면 더 좋아요)", more: { m: [["어디", ["side", "back", "top", "length", "neat", "clean", "bangs", "shape"]]] },
      go: [{ m: [["마음", ["love", "like", "great", "good", "perfect", "nice", "happy", "amazing", "awesome", "thank", "fine"]]], ex: "I love it, thank you! The sides look really neat.", to: "end" }] }
  },
  bye: "Good luck tomorrow. You look ready!",
  hear: [
    ["guest", "Can I get a blow dry too?", [["Can I get ~?", "~도 해 주실 수 있어요?", "추가로 부탁할 때 써요."]]],
    ["them", "Sure, that's ten dollars more."],
    ["guest", "And a little off the top, please.", [["a little off the top", "윗머리만 조금 잘라 주세요", "미용실에서 가볍게 자를 때 써요."]]],
    ["them", "You got it."]
  ] });

EP({ id: "w11", part: "work", who: "priya", art: "call", time: "morning", title: "최종 면접 일정 정하기", need: { after: ["w4"] }, guest: "옆자리 직원",
  lines: {
    a: { say: [["lv:2", "Hi {name}, it's Priya again. Good news: Derek really enjoyed meeting you, so we'd like to move you to a final round with the team. Are you still interested?"], [null, "Hi {name}, it's Priya. Derek liked meeting you and wants a final round. Are you still interested?"]], task: "계속 관심 있다고 기쁘게 답해요",
      go: [{ m: [["관심", ["yes", "interested", "excited", "happy", "glad", "great", "love", "of course", "definitely", "absolutely"]]], ex: "Yes, definitely! I'm really excited.", to: "b" }] },
    b: { say: "Great. Derek is free Thursday morning or Friday afternoon. Which one works?", task: "목요일이나 금요일 중 하나를 고르거나, 둘 다 안 되면 정중하게 다른 날을 부탁해요",
      go: [
        { m: [["목요일", ["thursday"]]], ex: "Thursday morning works for me.", set: { resched: "no" }, to: "c" },
        { m: [["금요일", ["friday"]]], ex: "Friday afternoon is better for me.", set: { resched: "no" }, to: "c" },
        { m: [["안 됨", ["neither", "can not", "not available", "unfortunately", "busy", "conflict", "exam", "not free"]], ["다른 때", ["next week", "monday", "tuesday", "wednesday", "another", "different", "later", "reschedule", "could we", "possible"]]], ex: "Unfortunately, I can't do either. Could we do next Monday?", set: { resched: "yes" }, to: "c2", tip: ["Could we do ~ instead?", "~로 하면 어때요?", "시간을 바꿔 달라고 할 때 써요."] }] },
    c: { say: "Perfect, I'll put it on the calendar. Do you need anything from us beforehand?", task: "준비할 게 있는지 물어요",
      go: [{ m: [["물음", ["bring", "prepare", "need to", "anything", "should i", "do i need", "what should", "documents", "resume", "portfolio"]]], ex: "Thanks! Should I bring anything, like my resume?", to: "d" }] },
    c2: { say: "Hmm, Monday might be tough, but let me check with Derek... He can do Monday at ten. Is that okay?", task: "괜찮다고 하고, 일정을 바꿔서 미안하다고 해요",
      go: [{ m: [["괜찮음", ["fine", "okay", "works", "great", "perfect", "good", "yes"]], ["미안", ["sorry", "apologize", "trouble", "inconvenience", "hope"]]], ex: "Monday at ten is perfect. Sorry for the trouble.", to: "d" }] },
    d: { say: "Just yourself and an ID. Oh, and it's a team interview, so you'll meet two or three people.", task: "알겠다고 하고, 조금 긴장되지만 기대된다고 솔직히 말해요",
      go: [{ m: [["알겠음", ["got it", "okay", "sure", "understand", "great", "thank", "sounds good", "no problem"]], ["기분", ["nervous", "excited", "bit", "little", "scary", "looking forward", "a lot"]]], ex: "Got it, thanks. I'm a little nervous, but excited.", to: "end" }] }
  },
  bye: "You'll be great. See you soon!",
  hear: [
    ["guest", "Priya, do you have a minute?"],
    ["them", "Sure, what's up?"],
    ["guest", "Could we push back the meeting to three?", [["push back", "미루다", "일정을 뒤로 미룰 때 써요."]]],
    ["them", "Of course. I'll update the invite.", [["update the invite", "초대장을 고치다", "일정 초대를 수정할 때 써요."]]]
  ] });

EP({ id: "w12", part: "work", who: "brown", time: "day", title: "실패한 경험 말하기", need: { after: ["w2", "w6"], rel: { brown: 2 } }, guest: "다른 학생",
  lines: {
    a: { say: "Time for the hard one. Tell me about a time something didn't go well in a project.", task: "잘 안 풀렸던 일이 무엇이었는지, 뭐가 문제였는지 말해요",
      go: [{ m: [["일", ["project", "exam", "presentation", "test", "contest", "assignment", "game", "app", "team", "deadline", "class", "competition", "code", "demo", "group"]], ["안 풀림", ["fail", "wrong", "not go", "mistake", "late", "missed", "bug", "broke", "did not work", "did not finish", "problem", "bad", "lost"]]], ex: "Our group project was late because I made a mistake.", cap: "fail", to: "b", tip: ["didn't go well", "잘 안 풀렸어요", "failed보다 부드럽고 면접에서 더 자연스러워요."] }] },
    b: { say: "Okay, that {fail} sounds stressful. And what did you learn from it?", task: "그 일에서 배운 점을 말해요",
      go: [
        { m: [["소통", ["ask for help", "asked for help", "talk to", "tell", "speak up", "communicat", "teammate", "let people know", "say something", "share", "report", "ask"]]], ex: "I learned to ask for help instead of waiting.", set: { lesson: "ask" }, to: "c" },
        { m: [["계획", ["plan", "schedule", "calendar", "deadline", "time", "list", "step", "start early", "prepare", "organize", "break down", "split"]]], ex: "I learned to plan my time and start early.", set: { lesson: "plan" }, to: "c" }] },
    c: { lv: 2, say: "Good, that's the structure: problem, action, lesson. Can you say the whole story in two sentences now? Try 'Last year... so now I...'", task: "상황과 지금의 나를 두 문장으로 합쳐 말해요",
      go: [{ m: [["상황", ["when", "once", "last", "during", "in my", "our"]], ["지금", ["so now", "now i", "since then", "i started", "i decided", "so i"]]], ex: "Last semester our project went wrong, so now I ask for help early.", to: "d" }] },
    d: { say: "Good. Last thing: end on a positive note. How would you finish?", task: "긍정적으로 마무리하는 한 문장을 말해요",
      go: [{ m: [["긍정", ["grow", "keep growing", "help team", "now", "today", "better", "stronger", "grateful", "proud", "glad", "happy", "improve", "since then", "helped me"]]], ex: "Now I feel much stronger about teamwork.", to: "end" }] }
  },
  bye: [["lesson=ask", "Good. 'Ask early' is a keeper. Use that line."], ["lesson=plan", "Good. 'Plan ahead' is a keeper. Use that line."], [null, "Good. Use that story."]],
  hear: [
    ["guest", "Mr. Brown, I'm so nervous about my first interview."],
    ["them", "Everyone is. Breathe, and answer slowly.", [["answer slowly", "천천히 답하세요", "말이 빨라질 때 스스로에게 하는 조언이에요."]]],
    ["guest", "What if I don't understand the question?"],
    ["them", "Just say, 'Could you repeat that?' It's totally normal.", [["Could you repeat that?", "다시 말해 주시겠어요?", "못 알아들었을 때 가장 안전한 말이에요."]]]
  ] });

EP({ id: "w13", part: "work", who: "ray", time: "morning", title: "영상 면접 전에 인터넷 고치기", need: { after: ["w11"] }, guest: "이웃",
  lines: {
    a: { say: "Hi, I'm Ray from the internet company. You called about slow Wi-Fi?", task: "맞다고 하고, 언제부터 느린지 말해요",
      go: [{ m: [["맞음", ["yes", "right", "correct", "that be me", "thank"]], ["언제부터", ["since", "yesterday", "last week", "few days", "days", "week", "morning", "start", "began", "always"]]], ex: "Yes, thanks for coming. It's been slow since last week.", to: "b" }] },
    b: { say: "Let me test it... Yeah, it's weak in this room. The router is too far. I can move it, or sell you a Wi-Fi extender for thirty dollars.", task: "라우터를 옮길지, 증폭기를 살지 골라요",
      go: [
        { m: [["옮기기", ["move", "closer", "relocate", "put it here", "change place", "different place", "new spot"]]], ex: "Could you just move the router closer to my desk?", reply: "Easy. The cable is long enough.", to: "c" },
        { m: [["증폭기", ["extender", "booster", "thirty", "buy", "extra", "second one"]]], ex: "I'll take the extender. The router has to stay there.", reply: "Sure, I have one in the van.", to: "c" }] },
    c: { lv: 2, say: "Done in ten minutes. By the way, you seem to be in a hurry. Why is the connection so important?", task: "왜 인터넷이 중요한지 말해요 (곧 영상 면접이 있어요)",
      go: [{ m: [["면접", ["interview", "video call", "job", "meeting", "important"]], ["곧", ["tomorrow", "next week", "soon", "this week", "friday", "monday", "thursday", "coming", "next"]]], ex: "I have a video interview tomorrow, so it's important.", to: "d" }] },
    d: { say: "All fixed. Run a speed test and tell me if it's okay.", task: "속도가 좋아졌다고 하고 고맙다고 해요",
      go: [{ m: [M.thx, ["좋음", ["faster", "fast", "good", "great", "better", "works", "working", "smooth", "perfect", "fine"]]], ex: "It's much better now. Thanks a lot!", to: "end" }] }
  },
  bye: "Anytime. Good luck with the interview!",
  hear: [
    ["guest", "Is the Wi-Fi down again?"],
    ["them", "Yeah, it keeps dropping.", [["keeps dropping", "계속 끊겨요", "연결이 자꾸 끊길 때 써요."]]],
    ["guest", "Have you tried restarting it?", [["Have you tried ~?", "~해 봤어요?", "해결책을 권할 때 써요."]]],
    ["them", "Twice. Nothing."]
  ] });

EP({ id: "w14", part: "work", who: "derek", art: "call", time: "day", title: "희망 급여 질문", need: { after: ["w11"] }, guest: "Priya",
  lines: {
    a: { say: [["lv:2", "Hi {name}, it's Derek. Quick call before the final round. HR needs a number for the paperwork, so I'll ask you straight: what are your salary expectations for the internship?"], [null, "Hi {name}, it's Derek. HR needs a number. What are your salary expectations for the internship?"]], task: "희망 급여를 어떻게 말할지 골라요 — 금액을 말하거나, 보통 얼마인지 되묻거나, 유연하다고 해요",
      go: [
        { m: [["금액", ["#", "dollar", "hour", "per hour", "an hour", "month", "a month", "thousand"]]], ex: "I'm looking for around twenty dollars an hour.", set: { pay: "number" }, to: "b" },
        { m: [["범위 묻기", ["range", "budget", "what do you offer", "what do you usually", "what is the pay", "what is the rate", "what is typical", "how much do you", "typical for", "standard", "what do interns"]]], ex: "What range do you usually offer for interns?", set: { pay: "ask" }, to: "b", tip: ["What range do you usually offer?", "보통 어느 정도 주세요?", "먼저 금액을 말하기 부담스러울 때 되물어요."] },
        { m: [["유연", ["flexible", "open", "negotiable", "fair", "market rate", "whatever", "depends", "reasonable", "happy with"]]], ex: "I'm flexible. I'd like something fair for the market.", set: { pay: "flex" }, to: "b" }] },
    b: { say: [["pay=number", "Okay, noted. That's a little above the usual, but I'll mention it to Priya. Does that sound fair for both sides?"], ["pay=ask", "Fair question. Interns usually get eighteen to twenty-two an hour. Does that sound fair?"], [null, "Okay, that helps. Interns are usually eighteen to twenty-two an hour. Does that sound fair?"]], task: "공정하다고 하고, 시험 기간에 근무 시간을 줄일 수 있는지 물어요",
      go: [{ m: [["동의", ["fair", "sounds good", "okay", "fine", "great", "works", "reasonable", "that be good", "thank"]], ["조정", ["exam", "finals", "flexible hours", "adjust", "fewer hour", "schedule", "reduce", "less hour", "time off"]]], ex: "That sounds fair. Can I work fewer hours during exams?", to: "c" }] },
    c: { lv: 2, say: "I think that can work. Last thing: can you start on the first of June? If not, just tell me.", task: "시작일이 괜찮은지, 안 되면 언제부터 가능한지 말해요",
      go: [{ m: [["가능", ["yes", "fine", "works", "can start", "available", "june", "first", "sure", "start", "after", "from", "not until", "earliest"]]], ex: "Yes, June first works. I can start then.", to: "end" }] }
  },
  bye: "Good. See you in the final round.",
  hear: [
    ["guest", "What's the salary range for this role?", [["salary range", "급여 범위", "연봉 협상 때 쓰는 말이에요."]]],
    ["them", "It depends on experience, but it's competitive.", [["It depends on", "~에 따라 달라요", "확답하기 어려울 때 써요."]]],
    ["guest", "Is there room to negotiate?", [["room to negotiate", "협상할 여지", "조건을 조정할 수 있는지 물어요."]]],
    ["them", "A little, yes."]
  ] });

EP({ id: "w15", part: "work", who: "derek", art: "call", time: "day", title: "화상 최종 면접", need: { after: ["w14", "w12"] }, guest: "Priya",
  lines: {
    a: { say: [["resched=yes", "Hi {name}, it's Derek. Thanks for being upfront about the schedule change. Ready to start?"], [null, "Hi {name}, it's Derek. Ready to start?"]], task: "준비됐다고 하고, 소리와 화면이 잘 나오는지 확인해요",
      go: [{ m: [["준비", ["ready", "yes", "sure", "let us", "go ahead", "start"]], ["확인", ["hear", "see", "sound", "video", "audio", "screen", "clear", "work", "fine"]]], ex: "Yes, I'm ready. I can hear and see you fine.", to: "b" }] },
    b: { say: [["motive=learn", "Priya mentioned you want to learn from real engineers. So tell me, how do you learn a new tool?"], ["motive=product", "Priya mentioned you actually use our app. So tell me, what's one thing you would improve about it?"], [null, "Let's start with a technical one. How do you learn a new tool?"]], task: [["motive=product", "우리 앱에서 고치고 싶은 점 하나와 그 이유를 말해요"], [null, "새로운 도구를 어떻게 배우는지 순서대로 말해요"]],
      go: [
        { if: "motive=product", m: [["개선점", ["improve", "change", "add", "fix", "better", "slow", "confusing", "missing", "feature", "wish", "would like", "easier", "faster"]], ["이유", ["because", "so that", "since", "users", "people", "hard", "annoying"]]], ex: "I would add a dark mode, because people use it at night.", to: "c" },
        { m: [["방법", ["read", "docs", "documentation", "tutorial", "video", "practice", "build", "try", "example", "ask", "search", "google", "course"]], ["순서", ["first", "then", "after that", "next", "finally", "step", "start by", "begin"]]], ex: "First I read the docs, then I build a small project to try it.", to: "c" }] },
    c: { say: [["lv:2", "Interesting. Different question, and take your time: where do you see yourself in five years?"], [null, "Interesting. Where do you see yourself in five years?"]], task: "5년 뒤 어떤 모습이고 싶은지 말해요",
      go: [{ m: [["되고 싶은 것", ["engineer", "developer", "lead", "manager", "expert", "senior", "founder", "start my own", "own company", "build", "become", "grow"]], ["배움", ["good engineer", "become", "be good", "learn", "skills", "experience", "improve", "team", "mentor", "teach", "help", "impact"]]], ex: "In five years, I want to become a solid engineer and keep learning from a good team.", to: "d" }] },
    d: { lv: 2, say: "Everyone says engineer, so let me push a bit. What would you do in your first month if you got this job?", task: "첫 한 달 동안 무엇을 할지 말해요",
      go: [{ m: [["첫 달", ["first month", "first week", "first day", "start by", "begin", "onboard", "learn the", "get to know", "read the code", "meet the team", "ask question"]]], ex: "In my first month, I would read the code and meet the team.", to: "e" }] },
    e: { say: "Good. That's all from me. Do you have any questions before we finish?", task: "마지막으로 질문 하나를 해요",
      go: [{ m: [["질문", ["what", "how", "who", "when", "where", "do you", "does", "can you", "will", "would", "which"]]], ex: "What do you enjoy most about working at Fernlight?", to: "end" }] }
  },
  bye: "Thanks, {name}. You've given me a lot to think about. Priya will call you soon.",
  hear: [
    ["guest", "Can you share your screen?", [["share your screen", "화면을 공유하다", "화상 회의에서 쓰는 말이에요."]]],
    ["them", "Sure. Can you see it now?"],
    ["guest", "Yes, but it's a bit small."],
    ["them", "Let me zoom in.", [["zoom in", "확대하다", "화면을 키울 때 써요."]]]
  ] });

EP({ id: "w16", part: "work", who: "priya", art: "call", time: "morning", title: "합격 전화", need: { after: [["w4", "w15"]] }, guest: "옆자리 직원",
  lines: {
    a: { say: [["lv:2", "Hi {name}, it's Priya from Fernlight. I hope I'm not catching you at a bad time. I have some news about the position, if you have a minute."], [null, "Hi {name}, it's Priya. Do you have a minute? I have some news."]], task: "시간 된다고 하고, 좋은 소식이길 바란다고 해요",
      go: [{ m: [["가능", ["yes", "sure", "of course", "go ahead", "i do", "now", "okay", "free"]], ["기대", ["hope", "good news", "excited", "nervous", "please", "tell me", "what"]]], ex: "Sure, I have time. I hope it's good news!", to: "b" }] },
    b: { say: [["pay=number", "We'd love to offer you the internship! The rate is in line with what you asked for, and Derek especially liked your answers. What do you think?"], ["pay=ask", "We'd love to offer you the internship! The rate is twenty an hour, as Derek mentioned, and he especially liked your answers. What do you think?"], [null, "We'd love to offer you the internship! The rate is fair for the market, and Derek especially liked your answers. What do you think?"]], task: "고맙다고 하고, 며칠 생각할 시간을 정중하게 부탁해요",
      go: [
        { m: [["시간", ["think", "time", "few days", "day", "consider", "talk to", "discuss", "parents", "family", "decide"]]], ex: "Thank you! Could I have a couple of days to think about it?", to: "c2", tip: ["Could I have a couple of days?", "며칠만 시간 주실 수 있을까요?", "바로 결정하기 어려울 때 정중하게 쓰는 말이에요."] }] },
    c2: { say: "Of course, take your time. Can you let me know by Friday?", task: "금요일까지 답하겠다고 약속해요",
      go: [{ m: [["약속", ["friday", "by friday", "will let you know", "i will call", "i will email", "i promise", "definitely", "sure"]]], ex: "Sure, I'll let you know by Friday.", to: "end" }] }
  },
  bye: "Wonderful. Talk soon!",
  hear: [
    ["guest", "Congratulations on the new job!", [["Congratulations on ~", "~ 축하해요", "좋은 소식에 축하할 때 써요."]]],
    ["them", "Thanks! I start next month."],
    ["guest", "Are you nervous?"],
    ["them", "A bit. But mostly excited.", [["mostly", "대체로", "기분을 말할 때 자주 써요."]]]
  ] });

EP({ id: "w17", part: "work", who: "priya", art: "call", time: "morning", title: "생각해 본 답을 전하는 전화", need: { after: ["w16"] }, guest: "옆자리 직원",
  lines: {
    a: { say: "Hi {name}, it's Friday! Have you had time to think about our offer?", task: "수락하겠다고 하거나, 수락하되 시작을 늦춰 달라고 부탁해요",
      go: [
        { m: [["수락", ["accept", "yes", "take", "join", "happy to"]]], ex: "Yes, I'd like to accept the offer. Thank you!", to: "b" },
        { m: [["수락", ["accept", "yes", "take", "join", "happy to"]], ["늦게", ["later", "two week", "exam", "after", "delay", "push", "not right away", "postpone", "start date", "finals"]]], ex: "I'd like to accept, but could I start two weeks later because of exams?", set: { start: "later" }, to: "b", tip: ["Could I start ~ later?", "시작을 ~ 늦춰도 될까요?", "수락하면서 조건을 붙일 때 but으로 이어요."] }] },
    b: { say: [["start=later", "No problem, we can do that. I'll mark your start date two weeks later. How did you decide in the end?"], [null, "Wonderful! Welcome aboard. How did you decide in the end?"]], task: "고맙다고 하고, 며칠 고민한 이야기를 해요 (왜 이 회사로 정했는지 덧붙이면 더 좋아요)", more: { m: [["이유", ["because", "felt", "right", "team", "learn", "chance", "liked", "excited"]]] },
      go: [{ m: [M.thx], ex: "Thank you! I thought about it a lot, and the team felt right.", to: "c" }] },
    c: { lv: 2, say: "Great. Also, Derek's team uses Slack. Want me to add you now so you can say hi to everyone?", task: "좋다고 하고, 가서 인사하겠다고 해요",
      go: [{ m: [M.yes], ex: "Sure, that would be great. I'll say hi to everyone.", to: "end" }] }
  },
  bye: "Perfect. Welcome to Fernlight!",
  hear: [
    ["guest", "Have you made up your mind yet?", [["made up your mind", "마음을 정하다", "고민하다가 결정했는지 물을 때 써요."]]],
    ["them", "Still thinking. Both options are good."],
    ["guest", "Take your time."],
    ["them", "Thanks. I'll decide by tomorrow."]
  ] });

EP({ id: "w18", part: "work", who: "lewis", time: "day", title: "월급 받을 계좌 열기", need: { after: ["w17"] }, guest: "다른 손님",
  lines: {
    a: { say: "Good afternoon. How can I help you?", task: "인턴 월급을 받을 은행 계좌를 열고 싶다고 말해요",
      go: [{ m: [["계좌", ["open an account", "new account", "bank account", "checking account", "savings account", "account"]], ["월급", ["salary", "pay", "paycheck", "stipend", "job", "work", "internship", "income", "deposit", "company"]]], ex: "I'd like to open a bank account. I'm starting an internship and need it for my pay.", to: "b" }] },
    b: { say: "Congratulations! Checking or savings?", task: "자주 쓸 입출금 계좌인지, 모아 두는 저축 계좌인지 골라요",
      go: [
        { m: [["입출금", ["checking", "daily", "everyday", "debit", "spend"]]], ex: "A checking account, please. I'll use it every day.", reply: "Good for a first account.", to: "c" },
        { m: [["저축", ["saving", "savings", "interest", "save"]]], ex: "A savings account, please. I want to save some money.", reply: "Smart. It earns a bit of interest.", to: "c" }] },
    c: { lv: 2, say: "Because your first payment will come from Fernlight, I'll need a document with your employer's name. Do you have an offer letter?", task: "오퍼 레터를 이메일로 받았고, 폰으로 보여 주겠다고 해요",
      go: [{ m: [["받음", ["email", "receive", "got", "have", "phone", "show", "here"]], ["보여줌", ["show", "display", "here it be", "let me find", "open", "can i", "let me show"]]], ex: "Yes, I got it by email. Let me show you on my phone.", to: "d" }] },
    d: { say: "Great. Please sign here. Your debit card will arrive in a week.", task: "고맙다고 하고, 카드가 오기 전에는 어떻게 하는지 물어요",
      go: [{ m: [M.thx, ["질문", ["until", "before", "meanwhile", "how can", "how do", "what if", "what do i do", "cash", "withdraw", "atm", "in the meantime"]]], ex: "Thank you. What do I do until the card arrives?", to: "end" }] }
  },
  bye: "Use the app in the meantime. Congratulations again!",
  hear: [
    ["guest", "I'd like to deposit this check.", [["deposit this check", "수표를 입금하다", "은행에서 가장 흔한 용건이에요."]]],
    ["them", "Please sign the back."],
    ["guest", "Is there a fee for that?", [["a fee", "수수료", "돈이 드는지 물어볼 때 써요."]]],
    ["them", "No, it's free."]
  ] });

EP({ id: "w19", part: "work", who: "priya", art: "call", time: "day", title: "입사 서류 작성", need: { after: ["w17"] }, guest: "옆자리 직원",
  lines: {
    a: { say: [["lv:2", "Hi {name}, Priya here. I'm sending your onboarding form now, and I'll walk you through it. First, I need your full name exactly as it appears on your ID."], [null, "Hi {name}, Priya. Let's do your paperwork. First, what's your full name?"]], task: "이름을 말하고, 철자를 불러 주겠다고 해요",
      go: [{ m: [["이름", ["{name}", "my name"]], ["철자", ["spell", "letter"]]], ex: "My name is {name}. Let me spell it.", to: "b", tip: ["Let me spell it", "철자를 불러 드릴게요", "전화로 이름을 전할 때 꼭 필요해요."] }] },
    b: { say: [["start=later", "Thanks. Your start date is two weeks later than planned, the fifteenth. Is that right?"], [null, "Thanks. Your start date is the first of June. Does that still work?"]], task: "맞다고 하거나, 틀렸다면 바로잡아요",
      go: [
        { m: [["확인", ["yes", "correct", "right", "that work", "perfect", "sounds good", "confirm", "fine"]]], ex: "Yes, that's correct.", to: "c" },
        { m: [["수정", ["actually", "wrong", "not right", "different", "change", "instead", "should be", "mistake", "not correct"]], ["날짜", ["monday", "tuesday", "wednesday", "thursday", "friday", "next", "first", "second", "fifteenth", "#", "week"]]], ex: "Actually, I think it should be next Monday.", to: "c" }] },
    c: { say: "Next, the form asks for an emergency contact. Who should we put?", task: "비상 연락처로 누구를 쓸지 말해요",
      go: [{ m: [["사람", ["mother", "mom", "father", "dad", "parent", "sister", "brother", "friend", "roommate", "grandmother", "grandma", "grandfather", "aunt", "uncle", "cousin", "girlfriend", "boyfriend"]]], ex: "Please put my mother.", to: "d" }] },
    d: { say: "Last thing! Team T-shirts. What size are you?", task: "티셔츠 사이즈를 말해요",
      go: [{ m: [["사이즈", ["small", "medium", "large", "extra large", "size", "big", "bigger"]]], ex: "Medium, please.", to: "end" }] }
  },
  bye: "All done. I'll email you a copy. Welcome again!",
  hear: [
    ["guest", "Where do I sign?"],
    ["them", "Right here, and date it below."],
    ["guest", "Do I need to print this?"],
    ["them", "No, an e-signature is fine.", [["e-signature", "전자 서명", "종이 대신 화면에서 하는 서명이에요."]]]
  ] });

EP({ id: "w20", part: "work", who: "leo", time: "morning", title: "단골 카페에 소식 전하기", need: { after: ["w8", "w16"] }, guest: "옆자리 손님",
  lines: {
    a: { say: [["intro=yes", "Hey, {name}! My cousin said she got your email. So, any news about the job?"], [null, "Hey, {name}! Long time. Any news about the job?"]], task: "제안을 받았지만 아직 고민 중이라고 말해요",
      go: [{ m: [["고민", ["think", "decide", "deciding", "not sure", "still", "waiting", "consider", "few days"]]], ex: "They made me an offer. I'm still thinking about it.", to: "b" }] },
    b: { say: "Congrats either way! Coffee's on me. What are you drinking?", task: "축하해 줘서 고맙다고 하고, 커피 하나를 주문해요",
      go: [{ m: [M.thx, ["주문", ["latte", "coffee", "americano", "tea", "cappuccino", "mocha", "cold brew", "espresso", "flat white", "iced"]]], ex: "Thanks, Leo! A latte, please.", to: "c" }] },
    c: { lv: 2, say: "Oh, one more thing. When you start, come by before work. I can have your drink ready if you text me. Deal?", task: "그러겠다고 하고 몇 시쯤 올지 말해요",
      go: [{ m: [M.yes, M.time], ex: "Deal! I'll come around eight.", to: "d" }] },
    d: { say: "Just don't forget us when you're a big shot.", task: "절대 안 잊는다고 웃으며 말하고, 응원 고맙다고 해요",
      go: [{ m: [["안 잊음", ["never forget", "always come", "still come", "come back", "promise", "stay in touch", "visit"]], M.thx], ex: "I'll never forget this place. Thanks for the support!", to: "end" }] }
  },
  bye: "That's what I like to hear. Good luck!",
  hear: [
    ["guest", "What do you recommend?"],
    ["them", "The flat white is my favorite.", [["is my favorite", "제일 좋아해요", "추천하며 쓰기 좋은 말이에요."]]],
    ["guest", "I'll try it."],
    ["them", "You won't regret it.", [["won't regret it", "후회 안 할 거예요", "자신 있게 추천할 때 써요."]]]
  ] });

EP({ id: "w21", part: "work", who: "aiden", art: "call", time: "morning", title: "원격 첫날, 소리가 끊겨요", need: { after: ["w19"] }, guest: "Derek",
  lines: {
    a: { say: [["lv:2", "Hey {name}, Aiden. Welcome to day one! Your laptop is still on its way, so today's on video. Okay, so... can you hear me? I think my mic is acting up."], [null, "Hey {name}, Aiden. Welcome to day one! Can you hear me?"]], task: "소리가 끊겨서 잘 안 들린다고 말해요",
      go: [{ m: [["안 들림", ["can not hear", "could not hear", "breaking up", "cutting out", "cut out", "choppy", "muffled", "not clear", "lost you", "can not understand"]]], ex: "Sorry, you're breaking up. I can't hear you well.", to: "b" }] },
    b: { say: "Better? So the plan is: first, your accounts, then clone the repo, then... [static] ...and then Jira at eleven.", task: "중간에 끊겨서 못 들은 부분을 다시 말해 달라고 정중하게 부탁해요",
      go: [{ m: [["다시", ["repeat", "say that again", "say again", "one more time", "again", "come again", "did not catch", "could not catch", "missed", "pardon"]], ["부분", ["last part", "that part", "after", "what", "which", "second", "then", "first", "part", "you said"]]], ex: "Sorry, I missed the last part. Could you say that again?", to: "c", tip: ["I missed the last part", "마지막 부분을 놓쳤어요", "다시 말해 달라고 할 때 놓친 부분을 짚으면 좋아요."] }] },
    c: { say: "I said, we'll go through the Jira board at eleven, and then lunch is on the company.", task: "알겠다고 하고, Jira를 한 번도 안 써 봤다고 솔직히 말해요",
      go: [{ m: [["이해", ["got it", "okay", "i see", "thanks", "sure"]], ["질문", ["what be", "what do", "mean", "explain", "never used", "not familiar", "new to", "never heard", "not know", "do not know", "unfamiliar"]]], ex: "Got it. Sorry, I've never used Jira. What is it?", to: "d" }] },
    d: { lv: 2, say: "No worries, nobody's born knowing it. It's basically a to-do board for the team. I'll invite you in a second. Any other questions before stand-up?", task: "더 궁금한 게 없다고 하거나, 하나 더 물어요",
      go: [{ m: [["질문 또는 없음", ["lunch", "where", "what time", "anything", "no", "nothing", "all good", "that be all", "when", "how"]]], ex: "No, that's all for now. Thanks, Aiden!", to: "end" }] }
  },
  bye: "Great. Welcome to the team!",
  hear: [
    ["guest", "Sorry, you're on mute.", [["you're on mute", "음소거 상태예요", "화상 회의에서 제일 많이 나오는 말이에요."]]],
    ["them", "Oh, thanks. Can you hear me now?"],
    ["guest", "Loud and clear."],
    ["them", "Great, let's start."]
  ] });

EP({ id: "w22", part: "work", who: "aiden", art: "call", time: "day", title: "막혔을 때 도움 청하기", need: { after: [["w5", "w21"]] }, guest: "Derek",
  lines: {
    a: { say: "Hey {name}, how's your first task going?", task: "테스트가 계속 실패해서 한 시간째 막혔다고 말해요",
      go: [{ m: [["막힘", ["stuck", "fail", "failing", "error", "not work", "broken", "bug", "problem", "can not fix", "issue"]], ["시간", ["hour", "all morning", "long", "since", "for a while", "minute"]]], ex: "Not great. I've been stuck on a failing test for an hour.", to: "b" }] },
    b: { say: "Ah, that test is flaky. Have you tried restarting the server?", task: "이미 해 봤는지, 아직인지 사실대로 말해요",
      go: [
        { m: [["해 봄", ["i tried", "already", "yes", "restarted", "i did", "twice"]]], ex: "Yes, I already restarted it twice.", set: { helpstyle: "tried" }, to: "c" },
        { m: [["아직", ["not yet", "no", "have not", "not tried", "did not think"]]], ex: "Not yet. I'll try that first.", set: { helpstyle: "fresh" }, to: "c" }] },
    c: { say: [["helpstyle=tried", "Okay, then it's something else. Want me to take a look?"], [null, "Go ahead, give it a try... Still failing? Want me to take a look?"]], task: "도움을 정중하게 부탁하고, 지금 시간이 되는지도 물어요",
      go: [{ m: [["부탁", ["could you", "can you", "would you", "would you mind", "help", "take a look", "look at", "have a minute", "do you have time", "if you have time", "if you are free", "free"]]], ex: "Yes, please. Do you have a minute to take a look?", to: "d" }] },
    d: { lv: 2, say: "Sure, share your screen... Oh, it's a missing environment variable. Honestly, I hit the same thing last week, so don't feel bad.", task: "고맙다고 하고, 다음에 같은 문제가 나면 스스로 찾는 방법을 물어요",
      go: [{ m: [M.thx, ["방법", ["next time", "how can", "how do", "how should", "avoid", "check", "where", "find", "by myself", "on my own"]]], ex: "Thank you! Next time, how can I find that on my own?", to: "e" }] },
    e: { say: "Run the env check script first. It's in the README.", task: "알려 줘서 고맙다고 하고, 또 물어봐도 되는지 해요",
      go: [{ m: [M.thx, ["또", ["again", "next time", "anytime", "if i need", "whenever", "ask you", "bother you", "okay to ask", "is it okay"]]], ex: "Got it, thanks. Is it okay to ask you again?", to: "end" }] }
  },
  bye: "Anytime. That's what a buddy is for.",
  hear: [
    ["guest", "Do you have a minute?", [["Do you have a minute?", "시간 좀 있어요?", "도움을 청하기 전 첫마디로 좋아요."]]],
    ["them", "Sure, what's up?"],
    ["guest", "I can't figure out this error."],
    ["them", "Let me take a look.", [["take a look", "한번 보다", "도와주려고 살펴볼 때 써요."]]]
  ] });

EP({ id: "w23", part: "work", who: "derek", art: "call", time: "morning", title: "첫 팀 회의에서 말하기", need: { after: [["w5", "w21"]] }, guest: "Aiden",
  lines: {
    a: { say: [["lv:2", "Okay team, let's get started. We have a full agenda, so I'll be quick. {name} is joining us for the first time today. {name}, want to say a quick hello?"], [null, "Okay team, let's start. {name} is joining us for the first time. Want to say hi, {name}?"]], task: "팀원들에게 짧게 인사해요",
      go: [{ m: [M.hi, ["기쁨", ["glad", "excited", "happy", "looking forward", "pleasure", "nice", "great"]]], ex: "Hi everyone, I'm {name}. I'm excited to be here.", to: "b" }] },
    b: { say: "Thanks. Today's topic: the login page is slow. Aiden thinks we should cache the data, and others want to rewrite it... [everyone talking at once]", task: "아이디어가 있는데 대화가 끊기지 않아요. 지금 정중하게 끼어들지, 끝나고 말할 기회를 부탁할지 골라요",
      go: [
        { m: [["끼어들기", ["sorry to interrupt", "excuse me", "can i add", "may i add", "can i say", "if i may", "quick question", "sorry to cut"]], ["의견", ["can i say something", "say something", "idea", "think", "suggest", "maybe", "what if", "could we", "how about", "opinion", "add"]]], ex: "Sorry to interrupt, but what if we cache only the first page?", set: { voice: "spoke" }, to: "c", tip: ["Sorry to interrupt, but ~", "끼어들어서 죄송한데요", "말을 자르기 전에 먼저 이렇게 말하면 예의 바르게 들려요."] },
        { m: [["기다림", ["after", "when you finish", "after this", "after you", "once", "later", "at the end", "before we move", "wait", "when it is my turn"]], ["하고 싶음", ["can i", "could i", "may i", "i have", "i would like", "i would", "add", "say", "idea", "point", "comment"]]], ex: "Could I add one point after this?", set: { voice: "waited" }, to: "c" }] },
    c: { say: [["voice=spoke", "Oh, good point, {name}! That could cut the load time in half. Can you explain how you'd do that?"], [null, "Sure, {name}, go ahead. What's your point?"]], task: [["voice=spoke", "아이디어를 한두 문장으로 설명해요"], [null, "하고 싶은 말을 한두 문장으로 말해요"]],
      go: [{ m: [["방법", ["cache", "store", "save", "only", "first page", "load", "reuse", "split", "lazy", "smaller", "faster", "fewer", "part"]]], ex: "We could cache the first page and load the rest later.", to: "d" }] },
    d: { say: "Interesting. Let's try it. {name}, can you write that up in a short ticket by tomorrow?", task: "내일까지 하겠다고 하고, 정해진 양식이 있는지 물어요",
      go: [{ m: [["하겠음", ["sure", "yes", "will do", "of course", "no problem", "by tomorrow", "i can", "i will", "happy to"]], ["질문", ["be there form", "is there", "format", "template", "where", "how", "should i", "do you want", "any", "which"]]], ex: "Sure, I'll do it by tomorrow. Is there a template?", to: "end" }] }
  },
  bye: "Yes, there's one in the wiki. Great start, everyone.",
  hear: [
    ["guest", "Sorry, can I jump in here?", [["jump in", "끼어들다", "대화 중 말을 보태고 싶을 때 써요."]]],
    ["them", "Go ahead."],
    ["guest", "I think we're mixing two issues.", [["mixing two issues", "두 문제를 섞고 있다", "회의에서 정리할 때 써요."]]],
    ["them", "Good catch."]
  ] });

EP({ id: "w24", part: "work", who: "aiden", art: "startupdev", time: "morning", title: "월요일 아침 스몰토크", need: { after: ["w22"] }, guest: "Derek",
  lines: {
    a: { say: "Morning! How was your weekend?", task: "주말에 한 일을 말하고, 상대에게도 되물어요",
      go: [{ m: [["주말", ["i rest", "at home", "weekend", "saturday", "sunday", "friday night", "went", "watched", "played", "stayed", "slept", "studied", "met", "visited", "cooked", "hiking"]], ["되묻기", ["you", "yours", "and you", "how about you", "what about you", "how was yours"]]], ex: "It was nice. I met some friends. How about you?", to: "b" }] },
    b: { say: "Mine was good. Hey, are you free for lunch? There's a Korean place nearby, or a sandwich shop. Your pick.", task: "점심을 어디서 먹을지 고르거나, 오늘은 안 된다고 정중하게 말해요",
      go: [
        { m: [["선약", ["can not", "not today", "bring", "brought", "packed", "meeting", "plans", "another day", "next time", "tomorrow", "busy"]]], ex: "Sorry, I brought my lunch today. Maybe next time?", set: { lunch: "skip" }, to: "c" },
        { m: [["한식", ["korean"]]], ex: "Korean sounds great. I miss spicy food.", set: { lunch: "korean" }, to: "c" },
        { m: [["샌드위치", ["sandwich", "sub", "deli"]]], ex: "Let's do the sandwich place. It's faster.", set: { lunch: "sandwich" }, to: "c" }] },
    c: { say: "Cool. So what do you do outside of work? Any hobbies?", task: "취미를 하나 말해요",
      go: [{ m: [["취미", ["play", "watch", "read", "game", "music", "soccer", "basketball", "movie", "hike", "draw", "cook", "gym", "run", "swim", "guitar", "piano", "travel", "code", "hobby", "like to", "love to", "enjoy"]]], ex: "I like to play basketball on weekends.", to: "d" }] },
    d: { lv: 2, say: "Nice, we should play sometime. The office has a hoop. Anyway, back to work. Ready for stand-up?", task: "준비됐다고 하고, 오늘 할 일을 한 문장으로 말해요",
      go: [{ m: [["준비", ["ready", "yes", "sure", "of course", "good"]], ["오늘", ["today", "finish", "work on", "working on", "fix", "test", "review", "write", "continue"]]], ex: "Ready! Today I'm working on the login page.", to: "end" }] }
  },
  bye: [["lunch=korean", "See you at twelve thirty. I'll grab us a table at the Korean place."], ["lunch=sandwich", "See you at twelve thirty at the sandwich shop."], [null, "No worries. Catch you later!"]],
  hear: [
    ["guest", "How was your weekend?"],
    ["them", "Pretty relaxed. I just stayed in and watched movies.", [["stayed in", "집에 있었어요", "주말에 밖에 안 나갔다고 말할 때 써요."]]],
    ["guest", "Same. I'm not ready for Monday.", [["not ready for Monday", "월요일이 벌써 싫어요", "월요일 아침 단골 푸념이에요."]]],
    ["them", "Coffee first, then we'll see."]
  ] });

EP({ id: "w25", part: "work", who: "aiden", art: "call", time: "day", title: "코드 리뷰 의견 주기", need: { after: ["w22"] }, guest: "Derek",
  lines: {
    a: { say: [["helpstyle=tried", "Hey {name}! You tried a lot before asking last time, and I liked that. Now I want your eyes on my code. Could you review my pull request?"], [null, "Hey {name}! I'd like your eyes on my code. Could you review my pull request?"]], task: "리뷰해 주겠다고 하고, 언제까지 필요한지 물어요",
      go: [{ m: [["수락", ["sure", "of course", "happy to", "glad to", "yes", "i will", "i can"]], ["기한", ["when", "deadline", "by when", "how soon", "what time", "today", "tomorrow", "due", "urgent", "hurry"]]], ex: "Sure, I'd be happy to. When do you need it by?", to: "b" }] },
    b: { say: "End of day is fine. I'm mostly worried about this one function, because it's long. What do you think?", task: "솔직한 첫인상을 말해요 — 괜찮아 보인다고 하거나, 나누자고 제안해요",
      go: [
        { m: [["좋음", ["okay to me", "look okay", "looks good", "good", "clear", "clean", "nice", "well", "readable", "easy to read", "no problem", "fine", "great"]]], ex: "Honestly, it looks clean and easy to read.", set: { review: "praise" }, to: "c" },
        { m: [["제안", ["split", "break", "smaller", "shorter", "separate", "extract", "refactor", "maybe", "suggest", "how about", "what if", "consider", "rename"]]], ex: "Maybe we could split it into two smaller functions.", set: { review: "suggest" }, to: "c", tip: ["Maybe we could ~", "~하면 어떨까요", "의견을 부드럽게 제안할 때 써요."] }] },
    c: { say: [["review=suggest", "Oh, that makes sense. But what about the tests? Splitting might break one."], [null, "Thanks! But be honest. Is there anything you'd change, even something small?"]], task: [["review=suggest", "테스트가 깨질 수 있으니 먼저 테스트를 돌려 보자고 해요"], [null, "작은 것이라도 하나를 제안하고 이유를 말해요"]],
      go: [
        { if: "review=suggest", m: [["테스트", ["test", "run", "check", "before", "first", "verify"]]], ex: "Let's run the tests first, then split it.", to: "d" },
        { if: "review=praise", m: [["작은 제안", ["name", "comment", "rename", "typo", "small", "variable", "maybe", "one thing", "only", "spacing"]]], ex: "One small thing: maybe add a comment above the loop.", to: "d" }] },
    d: { lv: 2, say: "Cool. Want to pair on it for a bit? Sometimes talking it through is faster than comments.", task: "좋다고 하고 언제 할지 시간을 정해요",
      go: [{ m: [M.yes, M.time], ex: "Sure, let's do it after lunch.", to: "e" }] },
    e: { say: "Thanks for the honest review. I appreciate it.", task: "별말씀을, 나도 배웠다고 해요",
      go: [{ m: [["겸손", ["no problem", "anytime", "happy", "welcome", "glad", "my pleasure"]], ["배움", ["learn", "helpful", "useful", "interesting", "enjoy", "great experience", "taught"]]], ex: "No problem. I learned a lot from your code too.", to: "end" }] }
  },
  bye: "Ha, good. See you at the pairing session.",
  hear: [
    ["guest", "Can you take a look at my pull request?", [["pull request", "풀 리퀘스트", "내 코드를 합쳐 달라고 올리는 요청이에요."]]],
    ["them", "Sure. Any particular part?"],
    ["guest", "The login function."],
    ["them", "On it.", [["On it", "바로 할게요", "부탁을 받고 바로 하겠다고 할 때 써요."]]]
  ] });

EP({ id: "w26", part: "work", who: "derek", art: "call", time: "day", title: "실수를 보고하기", need: { after: ["w25"] }, guest: "Aiden",
  lines: {
    a: { say: "Hi {name}. You wanted a minute?", task: "내가 실수를 했다고 먼저 솔직하게 말을 꺼내요",
      go: [{ m: [["실수", ["mistake", "my fault", "my bad", "i made", "i broke", "i messed", "i deleted", "i pushed", "i did something", "something wrong", "something went wrong", "sorry", "bug", "error"]]], ex: "I need to tell you something. I made a mistake and pushed a bug.", to: "b", tip: ["I made a mistake", "제 실수예요", "변명 없이 먼저 말하는 게 신뢰를 줘요."] }] },
    b: { say: "Okay, thanks for telling me right away. What happened?", task: "무슨 일이 있었는지 사실대로 짧게 설명해요",
      go: [{ m: [["경위", ["ran", "wrong folder", "by accident", "push", "deploy", "release", "merge", "changed", "forgot", "skipped", "did not test", "without test", "wrong branch", "by accident", "accidentally", "login"]], ["결과", ["delete", "by accident", "down", "broken", "crash", "not work", "stopped", "could not log", "can not log", "error", "fail", "slow", "minutes"]]], ex: "I pushed to the wrong branch by accident, and the login page was down for five minutes.", to: "c" }] },
    c: { say: [["lesson=ask", "Thanks for being straight. In your interview you said you learned to ask for help early. What will you do differently next time?"], ["lesson=plan", "Thanks for being straight. In your interview you said you learned to plan ahead. What will you do differently next time?"], [null, "Thanks for being straight. What will you do differently next time?"]], task: "다음엔 어떻게 막을지 말해요 (확인 절차를 만들거나, 모를 땐 먼저 물어보거나)",
      go: [
        { m: [["확인 절차", ["check two", "check twice", "test", "checklist", "double check", "branch", "review", "before i push", "before i deploy"]]], ex: "Before I push, I'll double check the branch with a checklist.", set: { mistake: "prevent" }, to: "d" },
        { m: [["먼저 물어봄", ["ask", "tell you", "let you know", "message", "slack", "communicate", "ping", "talk to", "speak up", "check with"]]], ex: "I'll message the team earlier whenever I'm unsure.", set: { mistake: "ask" }, to: "d" }] },
    d: { lv: 2, say: "Good. My first week here, I deleted a customer's data, so you're in good company. Do you need anything from me to fix it fully?", task: "고마움을 말하고, 지금 고치는 중이며 끝나면 알려 주겠다고 해요",
      go: [{ m: [["고마움", ["thank", "appreciate", "thanks"]], ["보고", ["let you know", "will update", "update you", "keep you posted", "tell you when", "report", "fix", "fixing", "working on"]]], ex: "Thanks for understanding. I'm fixing it now and will update you.", to: "end" }] }
  },
  bye: [["mistake=prevent", "That sounds like a plan. Thanks for owning it."], ["mistake=ask", "Good. Ping me anytime. That's what I'm here for."], [null, "Good. Thanks for owning it."]],
  hear: [
    ["guest", "Who pushed to main?"],
    ["them", "That was me. My bad.", [["My bad", "내 잘못이야", "가볍게 실수를 인정할 때 써요."]]],
    ["guest", "No worries. Can you revert it?", [["revert", "되돌리다", "코드 변경을 취소할 때 써요."]]],
    ["them", "Already on it."]
  ] });

EP({ id: "w27", part: "work", who: "derek", art: "hiringmgr", time: "day", title: "토요일 근무 부탁 거절하기", need: { after: ["w23"] }, guest: "Aiden",
  lines: {
    a: { say: "Hey {name}. Quick favor. Could you cover the support shift this Saturday? Aiden's out.", task: "부탁에 어떻게 답할지 골라요 — 이유를 들어 거절하거나, 다른 날을 제안하거나, 받아들여요",
      go: [
        { m: [["거절", ["can not", "unfortunately", "sorry", "afraid", "not able", "unable", "do not think i can", "not possible", "have plans", "busy", "exam", "have a test"]], ["이유", ["because", "exam", "test", "family", "plans", "class", "already", "trip", "busy", "study", "midterm", "appointment"]]], ex: "Sorry, I can't. I have an exam on Monday and need to study.", reply: "Totally understand. Thanks for telling me straight.", to: "b", tip: ["Sorry, I can't, I have ~", "죄송한데 ~가 있어서 안 돼요", "거절할 때는 짧은 이유 하나만 붙이면 충분해요."] },
        { m: [["대안", ["instead", "alternatively", "how about", "what about", "could i", "can i", "i could", "sunday", "friday", "half", "later", "swap", "another day", "next week", "remote", "from home", "a few hours"]]], ex: "I can't do Saturday, but could I cover Sunday afternoon instead?", reply: "Sunday afternoon works, actually. Let me check with Aiden.", to: "b" },
        { m: [["수락", ["sure", "yes", "of course", "no problem", "i can cover", "i can do it", "i will cover", "i will do", "happy to", "glad to"]]], ex: "Sure, I can cover it.", reply: "Thanks, I owe you one. You'll get a day off next week.", to: "b" }] },
    b: { say: "By the way, how are you finding things so far? Don't be shy.", task: "일이 어떤지 솔직하게 말해요 — 좋은 점 하나와 어려운 점 하나",
      go: [{ m: [["좋음", ["good", "great", "love", "enjoy", "interesting", "fun", "nice", "learn", "friendly", "helpful"]], ["어려움", ["hard", "difficult", "tough", "challenging", "bit much", "busy", "overwhelming", "fast", "still learning", "confusing"]]], ex: "I enjoy it a lot, but it's a bit hard to keep up sometimes.", to: "c" }] },
    c: { lv: 2, say: "Thanks for being honest. Keep telling me when it's too much. I'd rather hear it early. Does that sound okay?", task: "그러겠다고 하고 고맙다고 해요",
      go: [{ m: [M.yes, M.thx], ex: "Sure, I will. Thank you, Derek.", to: "end" }] }
  },
  bye: "Good. Now go enjoy your weekend.",
  hear: [
    ["guest", "Could you cover my shift on Friday?", [["cover my shift", "내 근무를 대신하다", "근무 교대를 부탁할 때 써요."]]],
    ["them", "Let me check my calendar.", [["check my calendar", "일정 확인하다", "바로 답하기 어려울 때 써요."]]],
    ["guest", "No rush."],
    ["them", "Sorry, I can't. I'm out of town."]
  ] });

EP({ id: "w28", part: "work", who: "derek", art: "hiringmgr", time: "day", title: "피드백 면담", need: { after: ["w26", "w23"] }, guest: "Aiden",
  lines: {
    a: { say: [["voice=spoke", "Thanks for coming in, {name}. First, good news: the team really liked the idea you jumped in with at the meeting."], [null, "Thanks for coming in, {name}. First, good news: the team liked how patient you were in the meeting, and the idea you raised."]], task: "칭찬에 고맙다고 하고, 팀 덕분이라고 겸손하게 말해요",
      go: [{ m: [M.thx, ["겸손", ["team", "help", "helped", "learn", "lucky", "everyone", "thanks to", "aiden", "support", "glad", "kind"]]], ex: "Thank you! I couldn't do it without the team's help.", to: "b", tip: ["I couldn't have done it without ~", "~ 없이는 못 했을 거예요", "칭찬을 받을 때 가장 자연스러운 겸손이에요."] }] },
    b: { say: [["mistake=ask", "Two things on feedback. One: I love that you message early when something goes wrong. Two: in meetings you sometimes stay quiet when you're unsure. How do you see that?"], ["mistake=prevent", "Two things on feedback. One: your double-checking after the bug was great. Two: in meetings you sometimes stay quiet when you're unsure. How do you see that?"], [null, "Two things on feedback. One: your questions are good. Two: in meetings you sometimes stay quiet when you're unsure. How do you see that?"]], task: "공감하며 앞으로 더 말하겠다고 하거나, 이유를 설명하고 도움을 부탁해요",
      go: [
        { m: [["인정", ["true", "right", "agree", "fair", "good point", "i know", "yes", "i think so"]], ["노력", ["try", "will", "going to", "work on", "practice", "speak up", "next time", "more", "start"]]], ex: "That's fair. I'll try to speak up more.", set: { fb: "agree" }, to: "c" },
        { m: [["이유", ["because", "english", "nervous", "shy", "worried", "afraid", "fast", "hard to follow", "not sure", "takes time", "think first"]], ["부탁", ["help", "please", "slower", "slow down", "send", "agenda", "before", "notes", "advance", "could you", "would it help"]]], ex: "Honestly, it's hard to follow fast English. Could you share the agenda before meetings?", set: { fb: "explain" }, to: "c" }] },
    c: { say: [["fb=agree", "Great, I like that attitude. Last question: what do you want to focus on for the rest of the internship?"], [null, "Good to know. That's really helpful, and I'll send the agenda the day before. Last question: what do you want to focus on for the rest of the internship?"]], task: [["strength", "팀에서 인정받은 내 장점({strength})을 살려, 남은 기간에 집중하고 싶은 일을 말해요"], [null, "남은 인턴 기간에 집중하고 싶은 일을 말해요"]],
      go: [{ m: [["하고 싶음", ["want", "would like", "hope", "plan", "like to", "interested", "continue", "stay", "keep", "more", "focus"]]], ex: "I'd like to keep working here and take on bigger tasks.", to: "d" }] },
    d: { lv: 2, say: "Perfect. One last practical thing: HR does a mid-point survey. Would you be okay giving honest feedback about me too?", task: "솔직하게 하겠다고, 물어봐 줘서 고맙다고 해요",
      go: [{ m: [["하겠음", ["sure", "of course", "yes", "happy to", "glad to", "no problem", "absolutely"]], ["솔직", ["honest", "truth", "straight", "open", "feedback", "frank"]]], ex: "Of course, I'll be honest. Thanks for asking me.", to: "end" }] }
  },
  bye: "Great. Keep it up, {name}.",
  hear: [
    ["guest", "You did a great job on the demo!", [["a great job on ~", "~ 정말 잘했어요", "칭찬할 때 써요."]]],
    ["them", "Thanks, I had a lot of help."],
    ["guest", "Don't be modest.", [["Don't be modest", "겸손 떨지 마", "칭찬을 사양할 때 듣는 말이에요."]]],
    ["them", "Okay, okay. Thank you!"]
  ] });

EP({ id: "w29", part: "work", who: "priya", art: "call", time: "morning", title: "정규직 제안", need: { after: [["w26", "w28"]], rel: { priya: 2 } }, guest: "옆자리 직원", rel: 2,
  lines: {
    a: { say: "Hi {name}, it's Priya! Your internship is almost over, and Derek asked me to call. We'd like to offer you a part-time job during the semester, and a full-time offer after you graduate. What do you think?", task: "기쁘게 수락하거나, 파트타임만 가능하다고 말하거나, 정중하게 거절해요",
      go: [
        { m: [["조건 달기", ["but", "however", "only", "just"]], ["파트타임", ["part time", "fewer hour", "less hour", "few hour", "school"]]], ex: "I'd love to, but I can only work part-time during school.", set: { final: "part" }, to: "b" },
        { m: [["수락", ["accept", "yes", "would love", "gladly", "thrilled", "sign", "take it"]]], ex: "Yes, I'd love to stay! I accept the part-time job.", set: { final: "stay" }, to: "b" },
        { m: [["거절", ["decline", "turn down", "can not accept", "unfortunately", "sorry", "i have to say no", "other plan", "another offer", "exchange", "graduate school", "leave"]], M.thx], ex: "Thank you so much, but unfortunately I can't accept. I'm going on exchange next semester.", set: { final: "leave" }, to: "b", tip: ["Unfortunately, I can't accept", "아쉽지만 수락하기 어려워요", "거절은 고마움 먼저, 이유는 짧게 말해요."] }] },
    b: { say: [["final=stay", "Wonderful! Derek will be so happy. I'll send the contract. Anything you'd like to ask first?"], ["final=part", "Absolutely, we can work with that. I'll send the contract. Anything you'd like to ask first?"], ["final=leave", "I understand, and thank you for being honest. The door is always open. Anything you'd like to ask first?"]], task: "마지막으로 궁금한 점 하나를 물어요",
      go: [{ m: [["질문", ["when", "what", "how", "who", "can i", "could i", "do i", "will", "where", "which", "reference", "recommend", "letter", "contract", "stay in touch"]]], ex: "Could I ask Derek for a reference letter?", to: "c" }] },
    c: { lv: 2, say: "Of course, I'll tell him. Take a few days off before the final week. You've earned it.", task: "고맙다고 하고 끝인사를 해요",
      go: [{ m: [M.thx], ex: "Thank you, Priya. For everything.", to: "end" }] }
  },
  bye: "It was a pleasure working with you, {name}.",
  hear: [
    ["guest", "Is the offer negotiable?"],
    ["them", "Let me check with my manager.", [["check with my manager", "상사에게 확인하다", "바로 답할 수 없을 때 써요."]]],
    ["guest", "Take your time."],
    ["them", "I'll get back to you by Friday.", [["get back to you", "다시 연락드릴게요", "나중에 답해 주겠다고 할 때 써요."]]]
  ] });

EP({ id: "w30", part: "work", who: "aiden", art: "startupdev", time: "day", title: "인턴 마지막 날", need: { after: ["w29"] }, guest: "Derek", rel: 2,
  lines: {
    a: { say: [["final=leave", "Hey {name}. Hard to believe it's your last day."], ["final=part", "Hey {name}. Last day of the internship, but we'll still see you on Tuesdays!"], ["final=stay", "Hey {name}. Last day of the internship, but you're staying, so this isn't goodbye!"]], task: "마지막 날 소감을 말해요 — 가장 기억에 남는 것 하나",
      go: [{ m: [["소감", ["learn", "grateful", "thankful", "enjoyed", "great", "wonderful", "amazing", "fun", "best", "memory", "miss"]], ["기억", ["i learn", "learn a lot", "lunch", "team", "meeting", "standup", "bug", "code", "first day", "first week", "project", "demo", "you", "everyone"]]], ex: "I learned so much. The best part was working with this team.", to: "b" }] },
    b: { say: [["lunch=korean", "Ha, remember our first lunch at the Korean place? That's when I knew you'd fit in. Any favorite memory?"], ["lunch=sandwich", "Ha, remember our first lunch at the sandwich shop? That's when I knew you'd fit in. Any favorite memory?"], [null, "Ha, you were so quiet on day one, and now look at you. Any favorite memory?"]], task: "함께한 시간 중 하나를 떠올려 말해요",
      go: [{ m: [["기억", ["remember", "first", "day one", "lunch", "bug", "demo", "meeting", "remind", "laugh", "funny", "time when", "that time"]]], ex: "I remember my first day, when your mic broke.", to: "c" }] },
    c: { lv: 2, say: "Seriously though, I learned from you too. You ask questions I forgot to ask myself. Thanks for that.", task: "고맙다고 하고, 버디로서 도와줘서 고마웠다고 해요",
      go: [{ m: [M.thx, ["도움", ["help", "taught", "patient", "supported", "guide", "mentor", "buddy"]]], ex: "Thank you, Aiden. You helped me so much as my buddy.", to: "d" }] },
    d: { say: "So, this is it. Any last words?", task: "작별 인사를 해요 — 앞으로의 만남을 말하며",
      go: [
        { if: "final=part", m: [["화요일", ["tuesday", "next week", "every week", "semester", "next meeting", "at the meeting", "not goodbye", "see you soon"]]], ex: "See you next Tuesday!", to: "end" },
        { if: "final=stay", m: [["다음", ["monday", "tomorrow", "soon", "looking forward", "later"]]], ex: "See you Monday! I'm looking forward to it.", to: "end" },
        { if: "final=leave", m: [["연락", ["keep in touch", "stay in touch", "text", "email", "message", "call", "visit", "come back", "see you again"]]], ex: "Let's keep in touch. I'll text you.", to: "end", tip: ["Let's keep in touch", "계속 연락해요", "헤어질 때 가장 흔한 말이에요."] }] }
  },
  bye: [["final=leave", "Take care, {name}. You'll do great anywhere."], [null, "Welcome to the team, officially!"]],
  hear: [
    ["guest", "It's been a pleasure working with you.", [["It's been a pleasure", "함께해서 즐거웠어요", "헤어질 때 정중하게 쓰는 말이에요."]]],
    ["them", "Likewise. Let's keep in touch.", [["keep in touch", "계속 연락해요", "헤어질 때 가장 흔한 말이에요."]]],
    ["guest", "Absolutely. Safe travels!"],
    ["them", "Thanks!"]
  ] });
