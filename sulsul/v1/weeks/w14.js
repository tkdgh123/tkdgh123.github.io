// 14주째 · 인턴 지원 (92~98일째). 작은 스타트업 Fernlight의 개발 인턴에 지원한다.
// 새 사람(15주째부터 동료로 계속 나옴): Priya(채용 담당 f2) · Derek(개발 팀장 m2) · Aiden(개발자 m)
// 장면 = [시간, 이름, 그림 id, 대본]. 형식은 ~/sulsul-art/YEAR.md
WEEK(14, [
  ["채용 공고 묻기", [
    ["10:00", "학교에서 인턴 찾기", "schooloffice", {
      who: "Karen", whoKo: "어학원 사무실 직원", voices: { them: "f", guest: "m" }, guestKo: "다른 학생",
      turns: [
        { say: "Hi there! What can I do for you?", want: "인턴 공고를 어디서 찾을 수 있는지 정중하게 묻기", need: [["인턴", ["internship", "internships"]], ["공고", ["postings", "posting", "listings", "openings"]]], hint: ["Could you tell me where I can find ~ postings?", "Could you tell me where I can find internship…", "Could you tell me where I can find internship postings?"], model: "Could you tell me where I can find internship postings?", chunk: ["Could you tell me where ~", "~가 어디인지 알려 주시겠어요?", "정중하게 길이나 위치를 물을 때 써요."] },
        { say: "Sure. We have an online job board. Are you studying here full-time?", want: "어학원 학생이고, 한국에서는 컴퓨터를 전공한다고 하기", need: [["전공", ["major", "majoring"]]], hint: ["I'm a language student, and I ~ in computer science back home.", "I'm a language student, and I major…", "I'm a language student, and I major in computer science back home."], model: "I'm a language student, and I major in computer science back home." },
        { say: "Great. Software internships are popular. What skills do you have?", want: "파이썬을 알고 웹 개발도 조금 안다고 하기", need: [["안다", ["i know", "i can", "i've used", "experience"]]], hint: ["I ~ Python and a little web development.", "I know…", "I know Python and a little web development."], model: "I know Python and a little web development." },
        { say: "That's a good start. Some companies have rules about work permits.", want: "학생 비자인데 인턴을 해도 되는지 묻기", need: [["해도 되는지", ["allowed", "able to", "can i"]]], hint: ["I'm on a student visa. Am I ~ to do an internship?", "I'm on a student visa. Am I allowed…", "I'm on a student visa. Am I allowed to do an internship?"], model: "I'm on a student visa. Am I allowed to do an internship?", chunk: ["work permit", "취업 허가", "외국인이 일할 수 있게 해 주는 허가예요."] },
        { say: "Yes, with school approval. Come to me for the form.", want: "큰 도움이 됐다고 고마워하며 내일 서류를 받으러 오겠다고 하기", need: THANKS, hint: ["That helps a lot, ~. I'll come back tomorrow.", "That helps a lot, thank…", "That helps a lot, thank you. I'll come back tomorrow."], model: "That helps a lot, thank you. I'll come back tomorrow." }
      ],
      overhear: [
        ["guest", "I'd like to ask about the career fair next week.", [["career fair", "취업 박람회", "회사들이 학생을 만나러 오는 행사예요."]]],
        ["them", "It's on Thursday in the main hall.", [["main hall", "큰 강당", "건물의 중심이 되는 큰 홀이에요."]]],
        ["guest", "Do I need to sign up in advance?", [["in advance", "미리", "행사 전에 준비할 때 써요."]]],
        ["them", "It's free, but registering online helps."]
      ] }],
    ["14:00", "공고 문의 전화", "recruiter", {
      who: "Priya", whoKo: "스타트업 채용 담당자", voices: { them: "f2", guest: "m" }, guestKo: "같은 회사 동료",
      turns: [
        { say: "Fernlight, this is Priya. How can I help you?", want: "회사 사이트에서 개발 인턴 공고를 봤다고 하기", need: [["공고", ["posting", "listing", "job post", "ad"]]], hint: ["Hi, Priya. I saw your ~ for a developer internship.", "Hi, Priya. I saw your posting…", "Hi, Priya. I saw your posting for a developer internship."], model: "Hi, Priya. I saw your posting for a developer internship." },
        { say: "Great, thanks for calling! What would you like to know?", want: "인턴이 어떤 일을 하게 되는지 묻기", need: [["어떤 일", ["what kind", "what type", "what sort"]]], hint: ["~ of work would an intern do?", "What kind…", "What kind of work would an intern do?"], model: "What kind of work would an intern do?" },
        { say: "Mostly helping our team build our mobile app and fix bugs. You'd work with two engineers.", want: "유급인지, 일주일에 몇 시간인지 묻기", need: [["유급", ["paid"]]], hint: ["Is it a ~ internship? And how many hours a week?", "Is it a paid…", "Is it a paid internship? And how many hours a week?"], model: "Is it a paid internship? And how many hours a week?" },
        { say: "It's paid, twenty hours a week. Are you available in the afternoons?", want: "오후는 되고 오전엔 어학원 수업이 있다고 하기", need: [["오후", ["afternoon", "afternoons"]]], hint: ["Yes, ~ are fine. I have class in the morning.", "Yes, afternoons…", "Yes, afternoons are fine. I have class in the morning."], model: "Yes, afternoons are fine. I have class in the morning." },
        { say: "Perfect. Please email your resume by next Friday.", want: "알겠다고, 자기소개서도 필요한지 묻기", need: [["자기소개서", ["cover letter"]]], hint: ["Understood. Do I need a ~ letter too?", "Understood. Do I need a cover…", "Understood. Do I need a cover letter too?"], model: "Understood. Do I need a cover letter too?", chunk: ["cover letter", "자기소개서", "이력서와 함께 내는 소개 편지예요."] }
      ],
      overhear: [
        ["guest", "Hi, I'm here for the two o'clock interview.", [["I'm here for", "~ 때문에 왔어요", "약속이나 일정 때문에 방문했을 때 써요."]]],
        ["them", "Welcome! Please sign in on the tablet.", [["sign in", "방문 기록을 남기다", "출입 명단에 이름을 적을 때 써요."]]],
        ["guest", "Sure. Should I wait here?"],
        ["them", "Yes, someone will come get you shortly.", [["come get you", "데리러 오다", "come get은 '와서 데려가다'예요."]]]
      ] }],
    ["18:00", "Sara에게 알리기", "meetup", {
      who: "Sara", whoKo: "모임에서 만난 친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
      turns: [
        { say: "You look excited! What's going on?", want: "작은 스타트업의 개발 인턴 자리를 찾았다고 하기", need: [["스타트업", ["startup"]]], hint: ["I found an intern job at a small ~.", "I found an intern job at a small startup…", "I found an intern job at a small startup."], model: "I found an intern job at a small startup." },
        { say: "That's amazing! Are you going to apply?", want: "응, 하지만 영어 이력서를 써 본 적이 없어서 걱정이라고 하기", need: [["걱정", ["worried", "nervous", "concerned"]]], hint: ["Yes, but I'm ~ because I've never written an English resume.", "Yes, but I'm worried…", "Yes, but I'm worried because I've never written an English resume."], model: "Yes, but I'm worried because I've never written an English resume." },
        { say: "Don't worry. I can help. Do you have a draft?", want: "초안은 있는데 한국어에서 번역해서 어색하다고 하기", need: [["번역", ["translated", "translation"]]], hint: ["Yes, but it's ~ from Korean, so it sounds odd.", "Yes, but it's translated…", "Yes, but it's translated from Korean, so it sounds odd."], model: "Yes, but it's translated from Korean, so it sounds odd.", chunk: ["draft", "초안", "처음 쓴 거친 글이에요."] },
        { say: "That happens a lot. Send it to me tonight and I'll take a look.", want: "고맙다고, 내일 같이 훑어볼 수 있는지 묻기", need: [["같이 훑어봄", ["go over"]]], hint: ["Thank you! Can we ~ over it together tomorrow?", "Thank you! Can we go…", "Thank you! Can we go over it together tomorrow?"], model: "Thank you! Can we go over it together tomorrow?", chunk: ["go over", "꼼꼼히 훑어보다", "서류·계획을 같이 검토할 때 써요."] },
        { say: "Sure. My place at six?", want: "좋다고, 간식을 가져가겠다고 하기", need: [["가져가기", ["bring"]]], hint: ["Perfect. I'll ~ some snacks.", "Perfect. I'll bring…", "Perfect. I'll bring some snacks."], model: "Perfect. I'll bring some snacks." }
      ],
      overhear: [
        ["guest", "Sara, can you proofread my email?", [["proofread", "오타를 고치며 읽다", "글을 보내기 전에 검토할 때 써요."]]],
        ["them", "Sure. Send it over.", [["Send it over", "보내 줘요", "파일·글을 달라고 가볍게 말해요."]]],
        ["guest", "It's for a job. I'm so nervous."],
        ["them", "You'll be fine. Just be yourself.", [["be yourself", "있는 그대로 해요", "격려할 때 자주 써요."]]]
      ] }]
  ]],
  ["이력서 고치기", [
    ["10:00", "이력서 첨삭", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Okay, I read your resume. It's good, but it's two pages.", want: "한 장으로 줄여야 하는지 묻기", need: [["한 장", ["one page", "one-page"]]], hint: ["Should I cut it down to ~ page?", "Should I cut it down to one…", "Should I cut it down to one page?"], model: "Should I cut it down to one page?", chunk: ["cut it down", "분량을 줄이다", "길이를 짧게 만들 때 써요."] },
        { say: "Yes. Recruiters only spend a few seconds on each one. Let's start with the summary at the top.", want: "요약에 무엇을 써야 하는지 묻기", need: [["요약", ["summary"]]], hint: ["What should I write in the ~?", "What should I write in the summary…", "What should I write in the summary?"], model: "What should I write in the summary?" },
        { say: "Say who you are and what you want. Like, 'Computer science student seeking a software internship.'", want: "'seeking'이 무슨 뜻인지 묻기", need: [["뜻", ["mean", "means"]]], hint: ["What does 'seeking' ~? Is it like 'looking for'?", "What does 'seeking' mean…", "What does 'seeking' mean? Is it like 'looking for'?"], model: "What does 'seeking' mean? Is it like 'looking for'?" },
        { say: "Exactly. Now, your projects. You built a chat app, right?", want: "네, 팀 프로젝트였고 로그인 부분을 맡았다고 하기", need: [["맡았", ["responsible for", "in charge of"]]], hint: ["Yes, it was a team project. I was ~ for the login page.", "Yes, it was a team project. I was responsible…", "Yes, it was a team project. I was responsible for the login page."], model: "Yes, it was a team project. I was responsible for the login page.", chunk: ["responsible for", "~을 맡은", "내 역할을 설명할 때 써요."] },
        { say: "Perfect! Put it in bullet points, starting with a verb like 'built' or 'designed'.", want: "알겠다고, 오늘 밤에 다시 써서 보내 주겠다고 하기", need: [["다시 쓰기", ["rewrite"]]], hint: ["Got it. I'll ~ it tonight and send it to you.", "Got it. I'll rewrite…", "Got it. I'll rewrite it tonight and send it to you."], model: "Got it. I'll rewrite it tonight and send it to you." }
      ],
      overhear: [
        ["guest", "Sara, can I borrow your laptop charger?", [["borrow", "빌리다", "잠깐 빌려 쓰고 돌려줄 때 써요."]]],
        ["them", "Sure, it's in my bag. Just give it back before you leave.", [["give it back", "돌려주다", "빌린 물건을 돌려줄 때 써요."]]],
        ["guest", "Will do. Thanks!", [["Will do", "그럴게요", "부탁을 가볍게 받아들일 때 써요."]]],
        ["them", "No rush."]
      ] }],
    ["13:00", "일 경력 쓰기", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "같이 일하는 직원",
      turns: [
        { say: "Sara told me you're applying for an internship. Need any help?", want: "이 서점 일을 이력서에 써도 되는지 묻기", need: [["이력서", ["resume"]]], hint: ["Can I put this job on my ~?", "Can I put this job on my resume…", "Can I put this job on my resume?"], model: "Can I put this job on my resume?" },
        { say: "Of course! Customer service counts. What do you do here?", want: "주문 받고 책 정리하고 재고를 센다고 하기", need: [["재고", ["inventory", "stock"]]], hint: ["I take orders, organize books, and count the ~.", "I take orders, organize books, and count the inventory…", "I take orders, organize books, and count the inventory."], model: "I take orders, organize books, and count the inventory." },
        { say: "Good. You can also say you handled cash and worked on a team.", want: "영어로 어떻게 쓰면 좋을지 묻기", need: [["어떻게", ["how should i", "how do i", "how can i"]]], hint: ["~ write that in English?", "How should I…", "How should I write that in English?"], model: "How should I write that in English?" },
        { say: "Try 'Served up to fifty customers a day and balanced the register.'", want: "숫자를 넣으면 더 강하게 들리는지 묻기", need: [["숫자", ["numbers", "number"]]], hint: ["So ~ make it sound stronger?", "So numbers make…", "So numbers make it sound stronger?"], model: "So numbers make it sound stronger?" },
        { say: "Exactly. Hiring managers love numbers. I'm happy to read the final version.", want: "고맙다고, 시간 될 때 보여 드리겠다고 하기", need: [["시간 될 때", ["when you have time", "if you have time", "when you get a chance"]]], hint: ["Thanks! I'll show you ~.", "Thanks! I'll show you when…", "Thanks! I'll show you when you have time."], model: "Thanks! I'll show you when you have time.", chunk: ["when you get a chance", "시간 날 때", "상대에게 부담 없이 부탁할 때 써요."] }
      ],
      overhear: [
        ["them", "Could you cover the register for ten minutes?", [["cover the register", "계산대를 맡다", "잠깐 대신 일할 때 cover를 써요."]]],
        ["guest", "Sure. Take your time."],
        ["them", "Thanks. I need to call the supplier.", [["supplier", "납품업체", "물건을 공급하는 회사예요."]]],
        ["guest", "No problem."]
      ] }],
    ["16:00", "이력서 인쇄", "copyshop", {
      who: "Owen", whoKo: "인쇄소 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! What can I print for you?", want: "이력서 열 부를 흑백으로 뽑아 달라고 하기", need: [["이력서", ["resume", "copies"]]], hint: ["Ten copies of my ~, black and white, please.", "Ten copies of my resume…", "Ten copies of my resume, black and white, please."], model: "Ten copies of my resume, black and white, please." },
        { say: "Sure. Do you want thicker paper? It looks more professional.", want: "두꺼운 종이는 얼마나 더 비싼지 묻기", need: [["더 비쌈", ["extra", "more expensive", "how much more"]]], hint: ["How much ~ is the thicker paper?", "How much extra…", "How much extra is the thicker paper?"], model: "How much extra is the thicker paper?" },
        { say: "Only a dollar more for the whole set.", want: "그럼 두꺼운 걸로, 취업 지원용이라 하기", need: [["두꺼운", ["thicker", "thick"]]], hint: ["Then ~ paper, please. It's for a job application.", "Then thicker…", "Then thicker paper, please. It's for a job application."], model: "Then thicker paper, please. It's for a job application." },
        { say: "Good luck with it! Give me a few minutes.", want: "기다리는 동안 PDF에 오타가 있는지 확인해도 되냐고 묻기", need: [["오타", ["typo", "typos", "mistakes"]]], hint: ["Can I check the PDF for ~ while I wait?", "Can I check the PDF for typos…", "Can I check the PDF for typos while I wait?"], model: "Can I check the PDF for typos while I wait?" },
        { say: "Sure. Here, use this screen.", want: "이런, 내 이름 철자가 틀렸다고, 고치겠다고 하기", need: [["틀렸", ["wrong", "misspelled", "mistake"]]], hint: ["Oh no, I spelled my own name ~. I'll fix it.", "Oh no, I spelled my own name wrong…", "Oh no, I spelled my own name wrong. I'll fix it."], model: "Oh no, I spelled my own name wrong. I'll fix it." }
      ],
      overhear: [
        ["guest", "I need to scan this and email it to myself.", [["scan", "스캔하다", "종이를 파일로 만드는 거예요."]]],
        ["them", "The scanner's right there. It's free."],
        ["guest", "How do I send it by email?", [["by email", "이메일로", "by 뒤에 수단을 붙여요."]]],
        ["them", "Press the blue button and type your address."]
      ] }]
  ]],
  ["추천서 부탁", [
    ["10:00", "Mr. Brown에게 부탁", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Hi! You wanted to talk to me?", want: "잠깐 시간이 되는지 묻고, 부탁이 있다고 하기", need: [["잠깐", ["minute", "a moment", "a second"]]], hint: ["Yes. Do you have a ~? I'd like to ask a favor.", "Yes. Do you have a minute…", "Yes. Do you have a minute? I'd like to ask a favor."], model: "Yes. Do you have a minute? I'd like to ask a favor.", chunk: ["ask a favor", "부탁을 하다", "도움을 부탁하기 전에 꺼내는 말이에요."] },
        { say: "Sure, go ahead.", want: "인턴에 지원하는데 추천서를 써 주실 수 있는지 정중하게 묻기", need: [["추천서", ["reference", "recommendation"]]], hint: ["I'm applying for an internship. Would you mind writing me a ~?", "I'm applying for an internship. Would you mind writing me a reference…", "I'm applying for an internship. Would you mind writing me a reference?"], model: "I'm applying for an internship. Would you mind writing me a reference?", chunk: ["Would you mind ~ing?", "~해 주실 수 있을까요?", "정중하게 부탁할 때 써요."] },
        { say: "I'd be happy to. What company is it?", want: "Fernlight라는 스타트업이고 모바일 앱을 만든다고 하기", need: [["회사 이름", ["fernlight"]]], hint: ["It's a startup called ~. They make a mobile app.", "It's a startup called Fernlight…", "It's a startup called Fernlight. They make a mobile app."], model: "It's a startup called Fernlight. They make a mobile app." },
        { say: "Interesting. What should I mention about you?", want: "열심히 하고 수업에서 많이 늘었다는 점이라고 하기", need: [["늘었", ["improved", "progress", "improvement"]]], hint: ["That I work hard and have ~ a lot in class.", "That I work hard and have improved…", "That I work hard and have improved a lot in class."], model: "That I work hard and have improved a lot in class." },
        { say: "Easy enough. When do you need it by?", want: "가능하면 다음 주 금요일까지, 촉박해서 미안하다고 하기", need: [["금요일", ["friday"]]], hint: ["By next ~, if possible. Sorry for the short notice.", "By next Friday…", "By next Friday, if possible. Sorry for the short notice."], model: "By next Friday, if possible. Sorry for the short notice.", chunk: ["short notice", "촉박한 요청", "미리 알리지 못했을 때 써요."] }
      ],
      overhear: [
        ["guest", "Mr. Brown, I missed class yesterday. What did I miss?", [["What did I miss?", "제가 뭘 놓쳤나요?", "수업·회의에 빠진 뒤 물어요."]]],
        ["them", "We practiced job interviews. Here's the handout.", [["handout", "나눠 준 자료", "수업에서 종이로 나눠 주는 자료예요."]]],
        ["guest", "Thanks. Can I borrow someone's notes?"],
        ["them", "Check with Yuki. She took good notes.", [["Check with", "~에게 물어보다", "정보를 가진 사람에게 확인하라고 할 때 써요."]]]
      ] }],
    ["14:00", "Olivia에게도 부탁", "bkstock", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "같이 일하는 직원",
      turns: [
        { say: "Hey, you wanted to talk? Everything okay?", want: "괜찮다고, 부탁을 하나 해도 되냐고 묻기", need: [["부탁", ["favor"]]], hint: ["Everything's fine. Could I ask you a ~?", "Everything's fine. Could I ask you a favor…", "Everything's fine. Could I ask you a favor?"], model: "Everything's fine. Could I ask you a favor?" },
        { say: "Of course. What is it?", want: "지원서에 추천인으로 이름을 써도 되는지 묻기", need: [["추천인", ["reference"]]], hint: ["Is it okay if I list you as a ~?", "Is it okay if I list you as a reference…", "Is it okay if I list you as a reference?"], model: "Is it okay if I list you as a reference?", chunk: ["list you as", "~로 이름을 올리다", "지원서에 사람 이름을 적을 때 써요."] },
        { say: "Sure! They might call me. What should I say about you?", want: "믿을 수 있고 손님에게 잘한다고 말해 달라고 하기", need: [["믿을 수 있", ["reliable", "hardworking", "hard working", "responsible"]]], hint: ["That I'm ~ and good with customers.", "That I'm reliable…", "That I'm reliable and good with customers."], model: "That I'm reliable and good with customers." },
        { say: "Easy. Do you want me to write a short email too?", want: "전화로 충분하고, 이메일을 요청하면 알려 주겠다고 하기", need: [["요청하면", ["if they ask", "if needed", "if necessary"]]], hint: ["A phone call is enough. I'll tell you ~ for an email.", "A phone call is enough. I'll tell you if they ask…", "A phone call is enough. I'll tell you if they ask for an email."], model: "A phone call is enough. I'll tell you if they ask for an email." },
        { say: "Got it. And hey, good luck. I'll miss you if you get it!", want: "아직 된 게 아니라고, 고맙다고 하기", need: [["아직", ["yet"]]], hint: ["Thanks, Olivia, but I haven't got it ~!", "Thanks, Olivia, but I haven't got it yet…", "Thanks, Olivia, but I haven't got it yet!"], model: "Thanks, Olivia, but I haven't got it yet!" }
      ],
      overhear: [
        ["them", "Could you give me a hand with these boxes?", [["give me a hand", "좀 도와주다", "give a hand는 '거들다'예요."]]],
        ["guest", "Sure. Where do they go?"],
        ["them", "In the storage room, on the bottom shelf.", [["storage room", "창고", "물건을 쌓아 두는 방이에요."]]],
        ["guest", "Got it. They're heavy!"]
      ] }],
    ["18:00", "자기소개서 봐 달라고", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "You've been typing for an hour. What are you working on?", want: "인턴 지원용 자기소개서라고 하기", need: [["자기소개서", ["cover letter"]]], hint: ["A ~ letter for an internship application.", "A cover letter…", "A cover letter for an internship application."], model: "A cover letter for an internship application." },
        { say: "Cool. Is it hard?", want: "조금, 나를 자랑하는 게 어색하다고 하기", need: [["어색", ["awkward", "weird", "strange", "uncomfortable"]]], hint: ["A little. Talking about myself feels ~.", "A little. Talking about myself feels awkward…", "A little. Talking about myself feels awkward."], model: "A little. Talking about myself feels awkward." },
        { say: "Ha, I get it. But that's the whole point. What's your best skill?", want: "어려운 문제를 차근차근 푼다고 하기", need: [["차근차근", ["step by step"]]], hint: ["I'm good at solving hard problems ~.", "I'm good at solving hard problems step…", "I'm good at solving hard problems step by step."], model: "I'm good at solving hard problems step by step." },
        { say: "That's perfect for programming. Say exactly that.", want: "첫 문단을 한 번 봐 줄 수 있는지 정중하게 묻기", need: [["봐 주다", ["take a look", "look over", "read"]]], hint: ["Could you ~ a look at my first paragraph?", "Could you take a look…", "Could you take a look at my first paragraph?"], model: "Could you take a look at my first paragraph?" },
        { say: "Sure, send it over. I'll read it on my break.", want: "고맙다고, 신세를 졌다고 하기", need: [["신세", ["i owe you"]]], hint: ["Thanks, Leo! I ~ you one.", "Thanks, Leo! I owe…", "Thanks, Leo! I owe you one."], model: "Thanks, Leo! I owe you one.", chunk: ["I owe you one", "신세 졌어요", "도움을 받고 보답하겠다는 말이에요."] }
      ],
      overhear: [
        ["guest", "Do you mind if I charge my laptop here?", [["Do you mind if I", "~해도 될까요?", "정중하게 허락을 구할 때 써요."]]],
        ["them", "Not at all. The outlet's by the window.", [["Not at all", "전혀 괜찮아요", "mind 질문에는 '괜찮다'는 뜻으로 답해요."]]],
        ["guest", "Thanks! I'll be here for a couple of hours.", [["a couple of hours", "두어 시간", "a couple of는 '두세 개'쯤이에요."]]],
        ["them", "Take your time."]
      ] }]
  ]],
  ["전화 면접", [
    ["10:00", "면접 일정 잡기", "recruiter", {
      who: "Priya", whoKo: "스타트업 채용 담당자", voices: { them: "f2", guest: "m" }, guestKo: "같은 회사 동료",
      turns: [
        { say: "Hi! This is Priya from Fernlight. Is this a good time?", want: "네, 지금 괜찮다고, 전화 줘서 고맙다고 하기", need: [["고마움", ["thank you for calling", "thanks for calling", "thank you for your time"]]], hint: ["Yes, this is a good time. ~ for calling!", "Yes, this is a good time. Thank you…", "Yes, this is a good time. Thank you for calling!"], model: "Yes, this is a good time. Thank you for calling!" },
        { say: "We liked your resume! Derek, our engineering manager, is free for a phone interview at two today. Can you do that?", want: "2시 좋다고 하기", need: [["된다", ["works", "work", "fine", "okay"]]], hint: ["Yes, two o'clock ~ for me.", "Yes, two o'clock works…", "Yes, two o'clock works for me."], model: "Yes, two o'clock works for me." },
        { say: "Wonderful. It'll take about thirty minutes. Will you have a quiet place to talk?", want: "집에서 받을 거라 조용하다고 하기", need: [["조용", ["quiet"]]], hint: ["Yes, I'll take it at home, where it's ~.", "Yes, I'll take it at home, where it's quiet…", "Yes, I'll take it at home, where it's quiet."], model: "Yes, I'll take it at home, where it's quiet." },
        { say: "Perfect. Do you have any questions before then?", want: "미리 준비할 게 있는지 묻기", need: [["준비", ["prepare", "preparing"]]], hint: ["Is there anything I should ~?", "Is there anything I should prepare…", "Is there anything I should prepare?"], model: "Is there anything I should prepare?" },
        { say: "Just be ready to talk about your projects. We'll call you at two.", want: "알겠다고, 기대된다고 하기", need: [["기대", ["looking forward", "look forward"]]], hint: ["Got it. I'm ~ forward to it. Thank you, Priya!", "Got it. I'm looking forward…", "Got it. I'm looking forward to it. Thank you, Priya!"], model: "Got it. I'm looking forward to it. Thank you, Priya!", chunk: ["look forward to", "기대하다", "앞으로 있을 일을 기다릴 때 써요."] }
      ],
      overhear: [
        ["guest", "Hi Priya, do you have the video link for the three o'clock?", [["video link", "화상 회의 링크", "온라인 회의에 들어가는 주소예요."]]],
        ["them", "I'll send it in a minute. Check your inbox.", [["inbox", "받은 편지함", "새 메일이 들어오는 곳이에요."]]],
        ["guest", "Got it. Is the candidate on time?"],
        ["them", "Not yet. Let's give them five more minutes.", [["give them five more minutes", "5분 더 기다려 주다", "기다려 주자고 할 때 써요."]]]
      ] }],
    ["12:00", "면접 연습", "picnic", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Okay, I'm the interviewer. First question: tell me about yourself.", want: "컴퓨터를 전공하는 학생이고 코딩을 좋아한다고 하기", need: [["학생", ["student"]]], hint: ["I'm a computer science ~, and I love coding.", "I'm a computer science student…", "I'm a computer science student, and I love coding."], model: "I'm a computer science student, and I love coding." },
        { say: "Nice! Why do you want to work at Fernlight?", want: "작은 팀이라 많이 배울 수 있어서라고 하기", need: [["배울", ["learn"]]], hint: ["Because it's a small team, so I can ~ a lot.", "Because it's a small team, so I can learn…", "Because it's a small team, so I can learn a lot."], model: "Because it's a small team, so I can learn a lot." },
        { say: "Good. What's one project you're proud of?", want: "팀과 함께 만든 채팅 앱이 자랑스럽다고 하기", need: [["자랑스러", ["proud"]]], hint: ["I'm ~ of a chat app I made with my team.", "I'm proud…", "I'm proud of a chat app I made with my team."], model: "I'm proud of a chat app I made with my team." },
        { say: "What was the hardest part?", want: "로그인 코드의 버그를 찾는 일이었고 팀원이 도와줬다고 하기", need: [["버그", ["bug", "bugs"]]], hint: ["Finding a ~ in the login code. My teammate helped me.", "Finding a bug…", "Finding a bug in the login code. My teammate helped me."], model: "Finding a bug in the login code. My teammate helped me." },
        { say: "Great answer! Any questions for them at the end?", want: "하루가 보통 어떻게 흘러가는지 묻겠다고 하기", need: [["보통 하루", ["typical day"]]], hint: ["I'll ask what a ~ day looks like.", "I'll ask what a typical…", "I'll ask what a typical day looks like."], model: "I'll ask what a typical day looks like.", chunk: ["typical day", "보통의 하루", "일상적인 하루를 물을 때 써요."] }
      ],
      overhear: [
        ["guest", "Sara, can I practice my speech on you?", [["practice my speech", "발표 연습을 하다", "practice on 사람은 '~ 앞에서 연습하다'예요."]]],
        ["them", "Go ahead. I'll time you.", [["I'll time you", "시간을 재 줄게요", "time이 동사로 '시간을 재다'예요."]]],
        ["guest", "Thanks. It has to be under five minutes."],
        ["them", "Okay. Take a deep breath. Ready, go!", [["Take a deep breath", "심호흡해요", "긴장을 풀라고 할 때 써요."]]]
      ] }],
    ["14:00", "전화 면접", "hiringmgr", {
      who: "Derek", whoKo: "개발 팀장", voices: { them: "m2", guest: "f" }, guestKo: "같은 회사 동료",
      turns: [
        { say: "Hi, this is Derek from Fernlight. How are you?", want: "잘 지낸다고, 전화 줘서 고맙다고 하기", need: [["고마움", ["thanks for calling", "thank you for calling", "for your time"]]], hint: ["I'm doing well. ~ for calling, Derek.", "I'm doing well. Thanks…", "I'm doing well. Thanks for calling, Derek."], model: "I'm doing well. Thanks for calling, Derek." },
        { say: "Great. Priya said you study computer science. What languages do you use?", want: "주로 파이썬과 자바스크립트를 쓴다고 하기", need: [["자바스크립트", ["javascript"]]], hint: ["I mostly use Python and ~.", "I mostly use Python and JavaScript…", "I mostly use Python and JavaScript."], model: "I mostly use Python and JavaScript." },
        { say: "Nice. Tell me about a project you worked on.", want: "친구 세 명과 채팅 앱을 만들었고 로그인을 맡았다고 하기", need: [["맡았", ["in charge of", "responsible for"]]], hint: ["I made a chat app with three classmates. I was ~ of login.", "I made a chat app with three classmates. I was in charge…", "I made a chat app with three classmates. I was in charge of login."], model: "I made a chat app with three classmates. I was in charge of login." },
        { say: "Sounds great. What do you do when you get stuck on a bug?", want: "먼저 혼자 풀어 보고, 그다음에 도움을 청한다고 하기", need: [["먼저", ["myself first", "first"]]], hint: ["I try to solve it myself ~, then I ask for help.", "I try to solve it myself first…", "I try to solve it myself first, then I ask for help."], model: "I try to solve it myself first, then I ask for help." },
        { say: "Good. Do you have any questions for me?", want: "제 첫 프로젝트가 무엇일지 묻기", need: [["첫 프로젝트", ["first project"]]], hint: ["Yes. What would my ~ project be?", "Yes. What would my first…", "Yes. What would my first project be?"], model: "Yes. What would my first project be?" }
      ],
      overhear: [
        ["guest", "Derek, do you have a minute? The build is failing again.", [["The build is failing", "빌드가 실패하고 있어요", "프로그램을 합치다 오류가 났다는 말이에요."]]],
        ["them", "Again? Check the logs first.", [["logs", "기록 파일", "프로그램이 남긴 기록이에요."]]],
        ["guest", "I did. It's the same error as yesterday."],
        ["them", "Okay, I'll be there in five minutes.", [["I'll be there in five minutes", "5분 뒤에 갈게요", "곧 가겠다고 할 때 써요."]]]
      ] }]
  ]],
  ["코딩 과제 질문", [
    ["10:00", "스터디룸에서 의논", "team", {
      who: "Noah", whoKo: "같은 반 학생", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Hey! You look stressed. What's up?", want: "인턴 지원용 코딩 과제를 받았다고 하기", need: [["과제", ["assignment", "coding test", "challenge", "task"]]], hint: ["I got a coding ~ for an internship application.", "I got a coding assignment…", "I got a coding assignment for an internship application."], model: "I got a coding assignment for an internship application." },
        { say: "Cool! What do they want you to build?", want: "간단한 할 일 목록 웹 앱이라고 하기", need: [["할 일", ["to-do", "to do", "todo"]]], hint: ["A simple ~ list web app.", "A simple to-do…", "A simple to-do list web app."], model: "A simple to-do list web app." },
        { say: "That's doable. How long do you have?", want: "사흘인데 어디서부터 시작할지 모르겠다고 하기", need: [["어디서부터", ["where to start", "where do i start", "where should i start"]]], hint: ["Three days, but I don't know ~ start.", "Three days, but I don't know where to…", "Three days, but I don't know where to start."], model: "Three days, but I don't know where to start." },
        { say: "Start small. Make it add a task first. Then deleting, then saving.", want: "브라우저에 할 일을 어떻게 저장하는지 묻기", need: [["저장", ["save", "saving", "store"]]], hint: ["How do I ~ the tasks in the browser?", "How do I save…", "How do I save the tasks in the browser?"], model: "How do I save the tasks in the browser?" },
        { say: "Use localStorage. I can show you after lunch.", want: "그러면 큰 도움이 된다고, 점심은 내가 산다고 하기", need: [["도움", ["help"]]], hint: ["That would really ~. Lunch is on me!", "That would really help…", "That would really help. Lunch is on me!"], model: "That would really help. Lunch is on me!", chunk: ["is on me", "내가 낼게요", "식사비를 대접할 때 써요."] }
      ],
      overhear: [
        ["guest", "Noah, did you finish the slides yet?"],
        ["them", "Almost. I just need to add the charts.", [["I just need to", "~만 하면 돼요", "거의 다 끝났을 때 써요."]]],
        ["guest", "Can you send them by tonight?"],
        ["them", "I'll do my best.", [["do my best", "최선을 다하다", "약속은 못 해도 노력한다고 할 때 써요."]]]
      ] }],
    ["13:00", "Aiden에게 질문", "startupdev", {
      who: "Aiden", whoKo: "스타트업 개발자", voices: { them: "m", guest: "f" }, guestKo: "같은 회사 동료",
      turns: [
        { say: "Hey! I'm Aiden, one of the engineers. Priya said you might have questions about the assignment.", want: "고맙다고, 아무 프로그래밍 언어나 써도 되는지 묻기", need: [["언어", ["language", "languages"]]], hint: ["Yes, thanks for helping. Can I use any programming ~?", "Yes, thanks for helping. Can I use any programming language…", "Yes, thanks for helping. Can I use any programming language?"], model: "Yes, thanks for helping. Can I use any programming language?" },
        { say: "Sure. Most people use JavaScript, but Python is fine too.", want: "디자인에는 시간을 얼마나 써야 하는지 묻기", need: [["디자인", ["design"]]], hint: ["How much time should I spend on the ~?", "How much time should I spend on the design…", "How much time should I spend on the design?"], model: "How much time should I spend on the design?" },
        { say: "Don't spend too long on it. We care more about clean code.", want: "깨끗한 코드가 무슨 뜻인지 묻기", need: [["무슨 뜻", ["mean"]]], hint: ["What do you ~ by clean code?", "What do you mean…", "What do you mean by clean code?"], model: "What do you mean by clean code?", chunk: ["What do you mean by ~?", "~가 무슨 뜻이에요?", "상대 말을 더 풀어 달라고 할 때 써요."] },
        { say: "Easy to read, with clear names and a few comments.", want: "이해했다고, 사흘 안에 내도 되는지 묻기", need: [["사흘", ["three days"]]], hint: ["That makes sense. Is it okay to send it in ~?", "That makes sense. Is it okay to send it in three days…", "That makes sense. Is it okay to send it in three days?"], model: "That makes sense. Is it okay to send it in three days?" },
        { say: "Totally fine. Just email it to me. Good luck!", want: "고맙다고, 막히면 다시 물어봐도 되는지 정중하게 묻기", need: [["다시", ["again"]]], hint: ["Thanks! May I ask you ~ if I get stuck?", "Thanks! May I ask you again…", "Thanks! May I ask you again if I get stuck?"], model: "Thanks! May I ask you again if I get stuck?" }
      ],
      overhear: [
        ["guest", "Aiden, can you review my pull request?", [["pull request", "코드 합치기 요청", "내가 고친 코드를 팀에 검토받는 요청이에요."]]],
        ["them", "Sure. Give me ten minutes."],
        ["guest", "No rush. It's just a small fix."],
        ["them", "I'll take a look. If it's good, I'll approve it.", [["approve it", "승인하다", "검토를 통과시킨다는 뜻이에요."]]]
      ] }],
    ["18:00", "도서관에서 코딩", "library", {
      who: "Henry", whoKo: "도서관 사서", voices: { them: "m2", guest: "f" }, guestKo: "다른 이용자",
      turns: [
        { say: "Evening! We close in two hours.", want: "콘센트가 있는 조용한 자리가 있는지 묻기", need: [["조용", ["quiet"]]], hint: ["Is there a ~ spot with an outlet?", "Is there a quiet…", "Is there a quiet spot with an outlet?"], model: "Is there a quiet spot with an outlet?" },
        { say: "Second floor, by the windows. Are you studying?", want: "인턴 지원용 과제를 하는 중이라고 하기", need: [["지원", ["application", "apply", "applying"]]], hint: ["I'm working on an assignment for an internship ~.", "I'm working on an assignment for an internship application…", "I'm working on an assignment for an internship application."], model: "I'm working on an assignment for an internship application." },
        { say: "Good for you. The Wi-Fi password is on that card.", want: "와이파이가 느리면 어떡하냐고 묻기", need: [["느리", ["slow"]]], hint: ["What if the Wi-Fi is ~?", "What if the Wi-Fi is slow…", "What if the Wi-Fi is slow?"], model: "What if the Wi-Fi is slow?" },
        { say: "Then plug in with a cable. There are ports at every desk.", want: "노트북 충전기를 빌릴 수 있는지 정중하게 묻기", need: [["충전기", ["charger"]]], hint: ["Could I borrow a laptop ~?", "Could I borrow a laptop charger…", "Could I borrow a laptop charger?"], model: "Could I borrow a laptop charger?" },
        { say: "We have a few at the desk. Just leave your ID.", want: "고맙다고, 닫기 전에 돌려주겠다고 하기", need: [["돌려", ["return", "bring it back"]]], hint: ["Thanks. I'll ~ it before you close.", "Thanks. I'll return…", "Thanks. I'll return it before you close."], model: "Thanks. I'll return it before you close." }
      ],
      overhear: [
        ["guest", "Sorry, where do I print?", [["Sorry, where do I", "죄송한데 ~ 어디서 해요?", "모르는 걸 정중하게 물을 때 써요."]]],
        ["them", "The printer is by the stairs. Ten cents a page.", [["Ten cents a page", "한 장에 10센트", "단위 가격은 a를 써서 말해요."]]],
        ["guest", "Is it black and white only?"],
        ["them", "Color is a quarter a page."]
      ] }]
  ]],
  ["대면 면접", [
    ["09:00", "면접 가는 길", "subway", {
      who: "Dan", whoKo: "역무원", voices: { them: "m", guest: "f" }, guestKo: "다른 승객",
      turns: [
        { say: "Morning! Where are you headed?", want: "10시에 면접이 있어서 Maple Street로 간다고 하기", need: [["면접", ["interview"]]], hint: ["I have an ~ at ten, and I'm going to Maple Street.", "I have an interview…", "I have an interview at ten, and I'm going to Maple Street."], model: "I have an interview at ten, and I'm going to Maple Street." },
        { say: "Good luck! That's the blue line, platform two. Eight stops.", want: "얼마나 걸리는지 묻기", need: [["걸림", ["how long"]]], hint: ["~ does it take?", "How long…", "How long does it take?"], model: "How long does it take?" },
        { say: "About twenty-five minutes.", want: "일찍 도착하고 싶은데 다음 열차가 언제인지 묻기", need: [["다음 열차", ["next train"]]], hint: ["When is the ~ train? I want to arrive early.", "When is the next…", "When is the next train? I want to arrive early."], model: "When is the next train? I want to arrive early." },
        { say: "In three minutes. If you miss it, there's another in eight.", want: "어디서 갈아타야 하는지 묻기", need: [["갈아타", ["transfer", "change trains"]]], hint: ["Do I need to ~ anywhere?", "Do I need to transfer…", "Do I need to transfer anywhere?"], model: "Do I need to transfer anywhere?" },
        { say: "Nope, it's direct. Good luck today!", want: "고맙다고, 행운을 빌어 달라고 하기", need: [["행운", ["wish me luck"]]], hint: ["Thanks! ~ me luck!", "Thanks! Wish…", "Thanks! Wish me luck!"], model: "Thanks! Wish me luck!", chunk: ["Wish me luck", "행운을 빌어 줘요", "큰일 앞에서 가볍게 부탁할 때 써요."] }
      ],
      overhear: [
        ["guest", "Excuse me, does this train go to the airport?"],
        ["them", "No, you need the green line."],
        ["guest", "Where do I switch?", [["switch", "갈아타다", "노선을 바꿀 때 써요."]]],
        ["them", "At Central Station. Just follow the signs.", [["follow the signs", "표지판을 따라가다", "길 찾을 때 자주 써요."]]]
      ] }],
    ["10:15", "회사 로비", "recruiter", {
      who: "Priya", whoKo: "스타트업 채용 담당자", voices: { them: "f2", guest: "m" }, guestKo: "배달 기사",
      turns: [
        { say: "Hi! You must be here for the ten-thirty. Welcome to Fernlight!", want: "맞다고, 드디어 만나서 반갑다고, 너무 이른 건 아니길 바란다고 하기", need: [["이른", ["early"]]], hint: ["Yes! It's nice to finally meet you. I hope I'm not too ~.", "Yes! It's nice to finally meet you. I hope I'm not too early…", "Yes! It's nice to finally meet you. I hope I'm not too early."], model: "Yes! It's nice to finally meet you. I hope I'm not too early." },
        { say: "Not at all. Can I get you anything? Coffee or water?", want: "물 한 잔이면 좋겠다고 하기", need: [["물", ["water"]]], hint: ["~ would be great, thank you.", "Water…", "Water would be great, thank you."], model: "Water would be great, thank you." },
        { say: "Here you go. Derek will be with you in a few minutes. Feel free to look around.", want: "사무실이 정말 멋지다며 여기서 얼마나 일했는지 묻기", need: [["사무실", ["office"]]], hint: ["Your ~ is really nice. How long have you worked here?", "Your office is really nice…", "Your office is really nice. How long have you worked here?"], model: "Your office is really nice. How long have you worked here?" },
        { say: "About two years. It's a small team, but we're growing fast.", want: "몇 명이 일하는지 묻기", need: [["몇 명", ["how many"]]], hint: ["~ people work here?", "How many…", "How many people work here?"], model: "How many people work here?" },
        { say: "Twelve right now. Okay, Derek's ready for you. Follow me!", want: "고맙다고, 앞장서 달라고 하기", need: [["앞장", ["lead the way"]]], hint: ["Great, thank you. ~ the way!", "Great, thank you. Lead…", "Great, thank you. Lead the way!"], model: "Great, thank you. Lead the way!", chunk: ["Lead the way", "앞장서 주세요", "안내받아 따라갈 때 써요."] }
      ],
      overhear: [
        ["guest", "I have a delivery for the third floor.", [["a delivery for", "~로 온 배달", "누구에게·어디로 가는지 for로 말해요."]]],
        ["them", "Just leave it at the front desk. I'll sign for it.", [["sign for it", "받았다고 서명하다", "택배를 대신 받을 때 써요."]]],
        ["guest", "Thanks. It's a big box."],
        ["them", "No problem. I'll have someone carry it up.", [["carry it up", "위층으로 들어 옮기다", "무거운 걸 위로 나를 때 써요."]]]
      ] }],
    ["10:30", "대면 면접", "interview", {
      who: "Derek", whoKo: "개발 팀장", voices: { them: "m2", guest: "f2" }, guestKo: "채용 담당자",
      turns: [
        { say: "Hi, good to meet you. Please, sit down. Did you find us okay?", want: "쉽게 찾았고 지하철이 편했다고 하기", need: [["쉽게", ["easily", "easy"]]], hint: ["Yes, I found it ~. The subway was very convenient.", "Yes, I found it easily…", "Yes, I found it easily. The subway was very convenient."], model: "Yes, I found it easily. The subway was very convenient." },
        { say: "Great. So, why do you want this internship?", want: "진짜 제품을 만들고 경험 있는 엔지니어에게 배우고 싶다고 하기", need: [["진짜", ["real"]]], hint: ["I want to work on ~ products and learn from experienced engineers.", "I want to work on real…", "I want to work on real products and learn from experienced engineers."], model: "I want to work on real products and learn from experienced engineers." },
        { say: "Good answer. Can you walk me through your chat app project?", want: "먼저 기능을 정했고, 그다음 로그인 코드를 썼다고 하기", need: [["먼저", ["first"]]], hint: ["Sure. ~, we planned the features. Then I wrote the login code.", "Sure. First…", "Sure. First, we planned the features. Then I wrote the login code."], model: "Sure. First, we planned the features. Then I wrote the login code.", chunk: ["walk me through", "차근차근 설명해 주세요", "과정을 순서대로 설명해 달라고 할 때 써요."] },
        { say: "Nice. What would you say is your biggest weakness?", want: "가끔 혼자 너무 오래 붙들고 있어서 더 빨리 도움을 청하는 법을 배우는 중이라고 하기", need: [["가끔", ["sometimes"]]], hint: ["~ I work alone too long, so I'm learning to ask for help sooner.", "Sometimes I work alone too long…", "Sometimes I work alone too long, so I'm learning to ask for help sooner."], model: "Sometimes I work alone too long, so I'm learning to ask for help sooner." },
        { say: "Honest, I like that. Any questions for us?", want: "인턴십이 끝날 때까지 무엇을 끝내 놓아야 하는지 묻기", need: [["끝날 때까지", ["by the end"]]], hint: ["What should I have finished ~ the end of the internship?", "What should I have finished by…", "What should I have finished by the end of the internship?"], model: "What should I have finished by the end of the internship?" }
      ],
      overhear: [
        ["guest", "Derek, your next candidate is waiting in the lobby.", [["candidate", "지원자", "면접 보러 온 사람을 말해요."]]],
        ["them", "Thanks. Give me two minutes to wrap up here.", [["wrap up", "마무리하다", "하던 일을 끝낼 때 써요."]]],
        ["guest", "Sure. Should I bring them some water?"],
        ["them", "Yes, please. And tell them I'm sorry for the wait.", [["sorry for the wait", "기다리게 해서 미안해요", "기다린 사람에게 사과할 때 써요."]]]
      ] }]
  ]],
  ["합격 연락", [
    ["10:00", "합격 전화", "hiringmgr", {
      who: "Derek", whoKo: "개발 팀장", voices: { them: "m2", guest: "f" }, guestKo: "같은 회사 동료",
      turns: [
        { say: "Hi, it's Derek from Fernlight. Do you have a minute?", want: "물론이라고, 전화 줘서 반갑다고 하기", need: [["물론", ["of course", "sure"]]], hint: ["~, Derek. Good to hear from you.", "Of course…", "Of course, Derek. Good to hear from you."], model: "Of course, Derek. Good to hear from you." },
        { say: "I'll get right to it. We'd like to offer you the internship!", want: "정말이냐고, 너무 신난다고, 고맙다고 하기", need: [["신남", ["excited", "thrilled"]]], hint: ["Really? I'm so ~. Thank you so much!", "Really? I'm so excited…", "Really? I'm so excited. Thank you so much!"], model: "Really? I'm so excited. Thank you so much!", chunk: ["offer you", "합격을 제안하다", "일자리를 주겠다고 할 때 offer를 써요."] },
        { say: "You earned it. It's twenty hours a week, starting two weeks from Monday.", want: "첫날 몇 시에 시작해야 하는지 묻기", need: [["시작", ["start"]]], hint: ["Great. What time should I ~ on the first day?", "Great. What time should I start…", "Great. What time should I start on the first day?"], model: "Great. What time should I start on the first day?" },
        { say: "Nine thirty. Priya will send you the paperwork. Please sign and return it by Friday.", want: "받자마자 서명해서 보내겠다고 하기", need: [["서명", ["sign"]]], hint: ["I'll ~ it and send it back right away.", "I'll sign…", "I'll sign it and send it back right away."], model: "I'll sign it and send it back right away." },
        { say: "Perfect. Any other questions?", want: "제 노트북을 가져가야 하는지 묻기", need: [["노트북", ["laptop"]]], hint: ["Should I bring my own ~?", "Should I bring my own laptop…", "Should I bring my own laptop?"], model: "Should I bring my own laptop?" }
      ],
      overhear: [
        ["guest", "Derek, the client wants to move the demo to Friday.", [["move the demo", "시연 날짜를 옮기다", "demo는 완성품을 보여 주는 시연이에요."]]],
        ["them", "Friday works. Let's tell the team."],
        ["guest", "I'll send a calendar invite.", [["calendar invite", "일정 초대장", "회의 일정을 보낼 때 써요."]]],
        ["them", "Great. Thanks for handling that.", [["handling that", "그 일을 처리해 준 것", "thanks for 뒤에 ~ing를 붙여요."]]]
      ] }],
    ["13:00", "Sara에게 자랑", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "You look like you won the lottery! What happened?", want: "인턴에 합격했다고, 방금 전화받았다고 하기", need: [["합격", ["got the internship", "got the job", "got in", "got it"]]], hint: ["I got the ~! They just called me.", "I got the internship…", "I got the internship! They just called me."], model: "I got the internship! They just called me." },
        { say: "No way! I'm so proud of you!", want: "너 없이는 못 했을 거라고 하기", need: [["못 했을 것", ["couldn't have", "could not have"]]], hint: ["I ~ have done it without you.", "I couldn't have…", "I couldn't have done it without you."], model: "I couldn't have done it without you.", chunk: ["I couldn't have done it without you", "너 없이는 못 했어", "도움에 크게 고마울 때 써요."] },
        { say: "Stop it. You did it all yourself. When do you start?", want: "2주 뒤 월요일이고 주 20시간이라고 하기", need: [["월요일", ["monday"]]], hint: ["A week from ~. Twenty hours a week.", "A week from Monday…", "A week from Monday. Twenty hours a week."], model: "A week from Monday. Twenty hours a week." },
        { say: "Awesome. What will you be doing?", want: "앱을 같이 만들고 버그를 고칠 거라고 하기", need: [["버그", ["bugs", "bug"]]], hint: ["I'll help build the app and fix ~.", "I'll help build the app and fix bugs…", "I'll help build the app and fix bugs."], model: "I'll help build the app and fix bugs." },
        { say: "I love it. We have to celebrate. Dinner on me?", want: "아니, 도와줘서 내가 사겠다고 하기", need: [["내가 산다", ["my treat", "on me", "i'm paying", "i'll pay"]]], hint: ["No, it's my ~. You helped me so much.", "No, it's my treat…", "No, it's my treat. You helped me so much."], model: "No, it's my treat. You helped me so much." }
      ],
      overhear: [
        ["guest", "Sara, I got the apartment!", [["I got the apartment", "그 집을 구했어요", "got은 '얻었다'예요."]]],
        ["them", "That's wonderful! When are you moving in?"],
        ["guest", "Next week. Can you help me carry boxes?", [["carry boxes", "상자를 옮기다", "이삿짐 이야기에서 나와요."]]],
        ["them", "Of course. I'm free on Saturday."]
      ] }],
    ["17:00", "서점에 알리기", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "단골손님",
      turns: [
        { say: "Hey, you! Any news from Fernlight?", want: "합격했다고, 추천인이 돼 줘서 고맙다고 하기", need: [["합격", ["got it", "got the internship", "they offered"]]], hint: ["I ~ it! Thank you for being my reference.", "I got…", "I got it! Thank you for being my reference."], model: "I got it! Thank you for being my reference." },
        { say: "Congratulations!! I knew it. So does that mean you're leaving us?", want: "아니라고, 주말에는 계속 일할 수 있는지 묻기", need: [["주말", ["weekends", "weekend"]]], hint: ["No! Can I keep working here on ~?", "No! Can I keep working here on weekends…", "No! Can I keep working here on weekends?"], model: "No! Can I keep working here on weekends?" },
        { say: "I'd love that. Saturdays and Sundays. Does that work for your schedule?", want: "평일에는 인턴이라 주말은 비어 있다고 하기", need: [["평일", ["weekdays", "weekday"]]], hint: ["Yes, I'll do the internship on ~, so weekends are free.", "Yes, I'll do the internship on weekdays…", "Yes, I'll do the internship on weekdays, so weekends are free."], model: "Yes, I'll do the internship on weekdays, so weekends are free." },
        { say: "Perfect. I'll update the schedule. When's your last weekday shift?", want: "이번 금요일이 마지막이라고 하기", need: [["이번 금요일", ["this friday"]]], hint: ["~ Friday would be my last weekday shift.", "This…", "This Friday would be my last weekday shift."], model: "This Friday would be my last weekday shift." },
        { say: "Okay. We'll have a little goodbye cake for you!", want: "정말 친절하다고, 평일 팀이 그리울 거라고 하기", need: [["그리울", ["miss"]]], hint: ["That's so kind. I'm going to ~ the weekday crew!", "That's so kind. I'm going to miss…", "That's so kind. I'm going to miss the weekday crew!"], model: "That's so kind. I'm going to miss the weekday crew!" }
      ],
      overhear: [
        ["them", "Could you put these new releases on the front table?", [["new releases", "신간", "새로 나온 책·영화·음악이에요."]]],
        ["guest", "Sure. Face out or spine out?", [["Face out", "표지가 보이게", "책을 진열하는 방식이에요."]]],
        ["them", "Face out, so people can see the covers."],
        ["guest", "Got it. This one looks great."]
      ] }]
  ]]
]);
