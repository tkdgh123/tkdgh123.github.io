// 12주째 · 어학원 발표 (78~84일째). 주제를 정하고 자료를 찾고 연습해서, 어학원에서 3분 발표를 하고 수료식을 맞는다.
// 장면 = [시간, 이름, 그림 id, 대본]. 그림 id가 week.js ART에 들어오면 열린다. 형식은 ~/sulsul-art/YEAR.md
WEEK(12, [
  ["주제 정하기", [
    ["09:00", "발표 주제 상담", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Good morning! Next Friday, everyone gives a three-minute presentation. Do you have a topic yet?", want: "아직 없지만 아이디어가 몇 개 있다고 하기", need: [["아이디어", ["ideas", "idea"]]], hint: ["Not yet, but I have a few ~.", "Not yet, but I have a few ideas…", "Not yet, but I have a few ideas."], model: "Not yet, but I have a few ideas." },
        { say: "Good. What are they?", want: "이 도시에서의 생활에 대한 거라고 하기", need: [["생활", ["life", "living"]]], hint: ["Maybe something about ~ in this city.", "Maybe something about life…", "Maybe something about life in this city."], model: "Maybe something about life in this city." },
        { say: "That's too broad for three minutes. Can you narrow it down?", want: "좋아하는 장소 세 곳은 어떠냐고 하기", need: [["좋아하는", ["favorite", "favourite"]], ["세 곳", ["three"]]], hint: ["Okay. How about my three ~ places here?", "Okay. How about my three favorite…", "Okay. How about my three favorite places here?"], model: "Okay. How about my three favorite places here?", chunk: ["narrow it down", "범위를 좁히다", "너무 넓은 주제를 구체적으로 줄일 때 써요."] },
        { say: "I like that. It's specific and personal. Any questions?", want: "슬라이드를 몇 장 쓸 수 있는지 묻기", need: [["슬라이드", ["slides", "slide"]]], hint: ["How many ~ can I use?", "How many slides…", "How many slides can I use?"], model: "How many slides can I use?" },
        { say: "Up to five. Keep the words short and add pictures.", want: "알겠다고, 내일 개요를 이메일로 보내겠다고 하기", need: [["개요", ["outline"]], ["이메일", ["email", "e-mail"]]], hint: ["Got it. I'll ~ you my outline tomorrow.", "Got it. I'll email…", "Got it. I'll email you my outline tomorrow."], model: "Got it. I'll email you my outline tomorrow." }
      ],
      overhear: [
        ["guest", "Mr. Brown, can we work in pairs?", [["work in pairs", "짝을 지어 하다", "수업에서 자주 쓰는 말이에요."]]],
        ["them", "No, this one is individual. Everyone speaks alone."],
        ["guest", "Can I use my phone for notes?"],
        ["them", "Yes, but only for numbers and names."]
      ] }],
    ["12:00", "Noah와 주제 이야기", "team", {
      who: "Noah", whoKo: "스터디 친구", voices: { them: "m", guest: "f" }, guestKo: "같은 반 친구",
      turns: [
        { say: "Hey! Did you pick a topic for the presentation?", want: "응, 이 도시에서 가 본 곳들 이야기를 할 거라고 하기", need: [["가 본", ["been to", "visited"]]], hint: ["Yes, I'll talk about places I've ~ to in this city.", "Yes, I'll talk about places I've been…", "Yes, I'll talk about places I've been to in this city."], model: "Yes, I'll talk about places I've been to in this city." },
        { say: "Cool. I'm doing mine on street food. It's making me hungry already.", want: "재미있겠다고, 어떤 음식으로 시작할 거냐고 묻기", need: [["시작", ["start with", "begin with", "start"]]], hint: ["That sounds fun! Which food will you ~ with?", "That sounds fun! Which food will you start…", "That sounds fun! Which food will you start with?"], model: "That sounds fun! Which food will you start with?" },
        { say: "Probably tacos. Anyway, I'm nervous. I always forget my words on stage.", want: "나도 그렇다고, 같이 연습하자고 하기", need: [["같이 연습", ["practice together", "practice with", "rehearse"]]], hint: ["Me too. Let's ~ together.", "Me too. Let's practice…", "Me too. Let's practice together."], model: "Me too. Let's practice together." },
        { say: "Yes! Let's do it. When are you free?", want: "목요일 수업 끝나고 어떠냐고 하기", need: [["목요일", ["thursday"]]], hint: ["How about ~ after class?", "How about Thursday…", "How about Thursday after class?"], model: "How about Thursday after class?" },
        { say: "Thursday works. Same study room?", want: "좋다고, 거기서 보자고 하기", need: [["거기서", ["see you there", "meet there"]]], hint: ["Perfect. ~ you there!", "Perfect. See…", "Perfect. See you there!"], model: "Perfect. See you there!" }
      ],
      overhear: [
        ["guest", "Do you have the notes from yesterday?", [["the notes", "필기", "수업 필기를 말해요."]]],
        ["them", "Yes, hold on. Let me find them.", [["hold on", "잠깐만요", "잠깐 기다려 달라고 할 때 써요."]]],
        ["guest", "Thanks. I missed the second half."],
        ["them", "No problem. I'll send you a photo."]
      ] }],
    ["15:00", "Yuki와 주제 나누기", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hi! Noah told me you picked your topic. What is it?", want: "이 도시에서 좋아하는 세 곳 이야기라고 하기", need: [["세 곳", ["three places"]]], hint: ["I'm talking about ~ places that I love in this city.", "I'm talking about three…", "I'm talking about three places that I love in this city."], model: "I'm talking about three places that I love in this city." },
        { say: "Which three?", want: "박물관, 유람선, 야경 언덕이라고 하기", need: [["박물관", ["museum"]], ["유람선", ["cruise"]]], hint: ["The ~, the river cruise, and the night view.", "The museum…", "The museum, the river cruise, and the night view."], model: "The museum, the river cruise, and the night view." },
        { say: "Nice! Mine is about Japanese food. But I'm worried my English isn't good enough.", want: "걱정 말고 천천히 또박또박 말하면 된다고 하기", need: [["천천히", ["slowly", "slow"]]], hint: ["Don't worry. Just speak ~ and clearly.", "Don't worry. Just speak slowly…", "Don't worry. Just speak slowly and clearly."], model: "Don't worry. Just speak slowly and clearly." },
        { say: "That's good advice. Do you ever get nervous?", want: "늘 그렇지만 연습하면 정말 도움이 된다고 하기", need: [["연습", ["practice"]]], hint: ["Always, but ~ really helps.", "Always, but practice…", "Always, but practice really helps."], model: "Always, but practice really helps." },
        { say: "Right. Let's help each other this week, okay?", want: "좋다고, 우리는 할 수 있다고 하기", need: [["약속", ["deal", "promise", "sounds good"]]], hint: ["~! We've got this.", "Deal…", "Deal! We've got this."], model: "Deal! We've got this.", chunk: ["We've got this", "우리 할 수 있어요", "서로 힘을 북돋울 때 써요."] }
      ],
      overhear: [
        ["guest", "Yuki, are you coming to the library?"],
        ["them", "In ten minutes. I'm finishing my outline.", [["outline", "개요", "발표·글의 큰 틀이에요."]]],
        ["guest", "Can you save me a seat?"],
        ["them", "Sure. I'll be by the window."]
      ] }]
  ]],
  ["자료 찾기", [
    ["10:00", "도서관에서 책 찾기", "library", {
      who: "Henry", whoKo: "도서관 사서", voices: { them: "m2", guest: "f" }, guestKo: "다른 이용자",
      turns: [
        { say: "Good morning! Nice to see you again. What can I help you find?", want: "이 도시의 역사에 관한 책을 찾는다고 하기", need: [["역사", ["history"]], ["책", ["books", "book"]]], hint: ["I'm looking for ~ about this city's history.", "I'm looking for books…", "I'm looking for books about this city's history."], model: "I'm looking for books about this city's history." },
        { say: "We have a whole section. Second floor, near the window. Do you want photos too?", want: "옛날 사진이 실린 책이면 좋겠다고 하기", need: [["사진", ["photos", "pictures", "photo"]]], hint: ["Yes, books with old ~ would be great.", "Yes, books with old photos…", "Yes, books with old photos would be great."], model: "Yes, books with old photos would be great." },
        { say: "Then try 'The City in Pictures.' It's popular, so it might be checked out.", want: "대출 중이면 예약할 수 있는지 묻기", need: [["예약", ["reserve", "hold", "put a hold"]]], hint: ["If it's checked out, can I ~ it?", "If it's checked out, can I reserve…", "If it's checked out, can I reserve it?"], model: "If it's checked out, can I reserve it?" },
        { say: "Yes, I can put a hold on it. It'll be ready in three days.", want: "책은 언제까지 반납해야 하는지 묻기", need: [["반납", ["return", "bring them back", "bring it back"]]], hint: ["When do I have to ~ them?", "When do I have to return…", "When do I have to return them?"], model: "When do I have to return them?" },
        { say: "In three weeks. You can also renew them online.", want: "고맙다고, 필요하면 온라인으로 연장하겠다고 하기", need: [["연장", ["renew"]]], hint: ["Thanks, I'll ~ them online if I need to.", "Thanks, I'll renew…", "Thanks, I'll renew them online if I need to."], model: "Thanks, I'll renew them online if I need to." }
      ],
      overhear: [
        ["guest", "Do you have a quiet room for studying?", [["quiet room", "조용한 방", "도서관의 조용한 자리예요."]]],
        ["them", "Yes, on the third floor. You can book one for two hours.", [["book one", "예약하다", "방·자리를 잡을 때 book을 써요."]]],
        ["guest", "Great. How do I sign up?"],
        ["them", "Just write your name on the sheet."]
      ] }],
    ["12:30", "자료 들고 점심", "cafeteria", {
      who: "Rita", whoKo: "학교 식당 아주머니", voices: { them: "f2", guest: "m" }, guestKo: "다음 학생",
      turns: [
        { say: "Hi, hon! What'll you have today?", want: "오늘의 파스타를 달라고 하기", need: [["파스타", ["pasta"]]], hint: ["The ~ of the day, please.", "The pasta…", "The pasta of the day, please."], model: "The pasta of the day, please." },
        { say: "Good choice. Soup or salad with that?", want: "수프로 하겠다고, 무슨 수프인지 묻기", need: [["무슨 수프", ["what kind", "which kind", "what soup"]]], hint: ["Soup, please. ~ kind is it?", "Soup, please. What…", "Soup, please. What kind is it?"], model: "Soup, please. What kind is it?" },
        { say: "Chicken noodle. You look busy. What's all that paper?", want: "발표 준비 자료라고 하기", need: [["자료", ["research", "notes", "materials"]]], hint: ["It's ~ for my presentation.", "It's research…", "It's research for my presentation."], model: "It's research for my presentation." },
        { say: "Oh, a presentation! How's it going?", want: "정보가 너무 많아서 고르기 어렵다고 하기", need: [["너무 많", ["too much", "too many", "a lot of"]]], hint: ["I have ~ much information. It's hard to choose.", "I have too…", "I have too much information. It's hard to choose."], model: "I have too much information. It's hard to choose." },
        { say: "Take it one step at a time. Here's your pasta. Eat up!", want: "고맙다고, 힘이 필요하다고 하기", need: [["힘", ["energy", "fuel"]]], hint: ["Thanks, Rita. I need the ~!", "Thanks, Rita. I need the energy…", "Thanks, Rita. I need the energy!"], model: "Thanks, Rita. I need the energy!", chunk: ["one step at a time", "한 번에 하나씩", "일이 많아 부담스러울 때 위로하는 말이에요."] }
      ],
      overhear: [
        ["guest", "Do you have anything gluten-free?", [["gluten-free", "글루텐이 없는", "식이 제한을 말할 때 써요."]]],
        ["them", "The rice bowl is. Want to try it?"],
        ["guest", "Sure. Can I get the dressing on the side?", [["on the side", "따로", "소스를 따로 달라는 말이에요."]]],
        ["them", "You got it, hon."]
      ] }],
    ["17:00", "발표 사진 인쇄", "copyshop", {
      who: "Owen", whoKo: "인쇄소 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hey there. What can I do for you?", want: "사진 열 장을 컬러로 인쇄하고 싶다고 하기", need: [["컬러", ["color", "colour"]], ["인쇄", ["print"]]], hint: ["I'd like to ~ ten photos in color.", "I'd like to print…", "I'd like to print ten photos in color."], model: "I'd like to print ten photos in color." },
        { say: "Sure. What kind of paper?", want: "광택지로 해 달라고 하기", need: [["광택", ["glossy", "gloss"]]], hint: ["Glossy paper, ~.", "Glossy paper, please…", "Glossy paper, please."], model: "Glossy paper, please." },
        { say: "No problem. Do you have the files on a USB drive?", want: "휴대폰에 있는데 이메일로 보내도 되는지 묻기", need: [["휴대폰", ["phone"]]], hint: ["They're on my ~. Can I send them by email?", "They're on my phone…", "They're on my phone. Can I send them by email?"], model: "They're on my phone. Can I send them by email?" },
        { say: "Sure, email them to this address. It'll take about ten minutes.", want: "기다리는 동안 이 페이지를 복사해 달라고 하기", need: [["복사", ["copy", "copies"]]], hint: ["While I wait, can I make one ~ of this page?", "While I wait, can I make one copy…", "While I wait, can I make one copy of this page?"], model: "While I wait, can I make one copy of this page?" },
        { say: "Of course. Fifty cents for the copy. Seven fifty total.", want: "카드를 내밀며 6시에 찾으러 와도 되는지 묻기", need: [["찾으러", ["pick them up", "pick it up", "pick up", "come back"]]], hint: ["Here's my card. Could I ~ them up at six?", "Here's my card. Could I pick…", "Here's my card. Could I pick them up at six?"], model: "Here's my card. Could I pick them up at six?" }
      ],
      overhear: [
        ["guest", "Can you bind this report?", [["bind", "제본하다", "종이 묶음을 책처럼 묶는 거예요."]]],
        ["them", "Sure. Spiral or hardcover?"],
        ["guest", "Spiral, please. When can I pick it up?"],
        ["them", "Tomorrow morning."]
      ] }]
  ]],
  ["연습", [
    ["14:00", "스터디룸 리허설", "team", {
      who: "Noah", whoKo: "스터디 친구", voices: { them: "m", guest: "f" }, guestKo: "같은 반 친구",
      turns: [
        { say: "Okay, I'm all ears. Go ahead and start your talk.", want: "긴장된다며 시작하겠다고 하기", need: [["긴장", ["nervous"]]], hint: ["I'm a little ~. Here goes!", "I'm a little nervous…", "I'm a little nervous. Here goes!"], model: "I'm a little nervous. Here goes!", chunk: ["I'm all ears", "잘 듣고 있어요", "상대 이야기를 들을 준비가 됐다는 뜻이에요."] },
        { say: "That was good! But you were looking at your notes the whole time.", want: "맞다며 눈을 마주치도록 노력하겠다고 하기", need: [["눈을 마주치", ["eye contact"]]], hint: ["You're right. I'll try to make eye ~.", "You're right. I'll try to make eye contact…", "You're right. I'll try to make eye contact."], model: "You're right. I'll try to make eye contact." },
        { say: "Also, you spoke really fast.", want: "알고 있다며 천천히 해야 한다고 하기", need: [["천천히", ["slow down", "slower", "more slowly"]]], hint: ["I know. I need to ~ down.", "I know. I need to slow…", "I know. I need to slow down."], model: "I know. I need to slow down." },
        { say: "Try pausing after each point. It gives people time to think.", want: "좋은 생각이라며 한 번 더 해 봐도 되는지 묻기", need: [["한 번 더", ["one more time", "again", "once more"]]], hint: ["Good idea. Can I try that one more ~?", "Good idea. Can I try that one more time…", "Good idea. Can I try that one more time?"], model: "Good idea. Can I try that one more time?" },
        { say: "Sure! … Much better! You sounded confident that time.", want: "고맙다며 정말 도움이 됐다고 하기", need: [["도움", ["helped", "help", "helpful"]]], hint: ["Thanks, that really ~.", "Thanks, that really helped…", "Thanks, that really helped."], model: "Thanks, that really helped." }
      ],
      overhear: [
        ["guest", "Can you time me? I only have three minutes.", [["time me", "시간을 재 주다", "발표 시간을 재 달라고 할 때 써요."]]],
        ["them", "Sure. Start whenever you're ready."],
        ["guest", "Oops, I keep losing my place.", [["losing my place", "어디까지 했는지 놓치다", "읽거나 말하다 위치를 잃을 때 써요."]]],
        ["them", "Use a bookmark or number your slides."]
      ] }],
    ["16:30", "Yuki에게 발음 확인", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Can I hear your talk? I'll tell you if anything sounds unclear.", want: "좋다고, 발음이 걱정이라고 하기", need: [["발음", ["pronunciation", "pronounce"]]], hint: ["Sure. I'm worried about my ~.", "Sure. I'm worried about my pronunciation…", "Sure. I'm worried about my pronunciation."], model: "Sure. I'm worried about my pronunciation." },
        { say: "Don't worry. Your 'th' sounds are getting better.", want: "고맙지만 'museum'은 어렵다고 하기", need: [["어렵", ["hard", "difficult", "tricky"]]], hint: ["Thanks. But 'museum' is ~ for me.", "Thanks. But 'museum' is hard…", "Thanks. But 'museum' is hard for me."], model: "Thanks. But 'museum' is hard for me." },
        { say: "Say it with me: mu-ZEE-um. The stress is in the middle.", want: "따라 해 보고 더 나아졌는지 묻기", need: [["더 나음", ["better"]]], hint: ["Mu-ZEE-um. Is that ~?", "Mu-ZEE-um. Is that better…", "Mu-ZEE-um. Is that better?"], model: "Mu-ZEE-um. Is that better?" },
        { say: "Yes, much better! Also, 'cruise' sounds like 'crooz'.", want: "알려 줘서 고맙다며 적어 두겠다고 하기", need: [["적어", ["write that down", "write it down", "write them down", "note"]]], hint: ["Thanks for telling me. I'll ~ that down.", "Thanks for telling me. I'll write…", "Thanks for telling me. I'll write that down."], model: "Thanks for telling me. I'll write that down." },
        { say: "Anytime. You'll do great on Friday!", want: "너도 잘될 거라고 하기", need: [["잘될", ["go well", "go great", "do great", "do well"]]], hint: ["You too! I'm sure yours will go ~.", "You too! I'm sure yours will…", "You too! I'm sure yours will go well."], model: "You too! I'm sure yours will go well." }
      ],
      overhear: [
        ["guest", "How do you say this word?", [["How do you say", "어떻게 발음해요", "단어를 모를 때 쓰는 말이에요."]]],
        ["them", "Sched-ule. Americans say 'sked-jool'.", [["Americans say", "미국 사람들은 ~라고 해요", "발음·표현 차이를 말해요."]]],
        ["guest", "Oh, thanks."],
        ["them", "Don't worry, everybody gets it wrong at first."]
      ] }],
    ["20:00", "Sara 앞에서 연습", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Ooh, a live show! Let me get comfy on the couch. Okay, go!", want: "솔직하게 말해 달라고 부탁하기", need: [["솔직", ["honest", "honestly"]]], hint: ["Please be ~ with me.", "Please be honest…", "Please be honest with me."], model: "Please be honest with me." },
        { say: "That was great! I loved the part about the river.", want: "고맙다며 지루한 부분이 있었는지 묻기", need: [["지루", ["boring", "dull"]]], hint: ["Thanks! Was any part ~?", "Thanks! Was any part boring…", "Thanks! Was any part boring?"], model: "Thanks! Was any part boring?" },
        { say: "Maybe the middle. There were too many dates.", want: "알겠다며 날짜를 좀 줄이겠다고 하기", need: [["줄이", ["cut", "remove", "take out", "shorten"]]], hint: ["Okay, I'll ~ some of the dates.", "Okay, I'll cut…", "Okay, I'll cut some of the dates."], model: "Okay, I'll cut some of the dates." },
        { say: "Good. And tell a little story. People remember stories.", want: "유람선 이야기를 짧게 넣겠다고 하기", need: [["이야기", ["story"]]], hint: ["I could add a short ~ about the cruise.", "I could add a short story…", "I could add a short story about the cruise."], model: "I could add a short story about the cruise." },
        { say: "Yes! That'll be fun. I'll be thinking of you on Friday.", want: "고맙다며 덜 떨릴 것 같다고 하기", need: [["덜 떨림", ["less nervous", "calmer", "more relaxed", "less scared"]]], hint: ["Thanks, Sara! That makes me feel ~ nervous.", "Thanks, Sara! That makes me feel less…", "Thanks, Sara! That makes me feel less nervous."], model: "Thanks, Sara! That makes me feel less nervous." }
      ],
      overhear: [
        ["guest", "Sara, can I borrow your charger?"],
        ["them", "Sure, it's in the drawer.", [["in the drawer", "서랍 안에", "물건 위치를 말해요."]]],
        ["guest", "Thanks. My phone's almost dead.", [["almost dead", "거의 꺼졌어요", "배터리가 거의 없을 때 써요."]]],
        ["them", "Use the one by the sofa."]
      ] }]
  ]],
  ["발표하는 날", [
    ["08:30", "발표 전 접수", "schooloffice", {
      who: "Karen", whoKo: "학원 사무실 직원", voices: { them: "f", guest: "m" }, guestKo: "다른 학생",
      turns: [
        { say: "Good morning! Presentation day, right? Are you ready?", want: "연습을 많이 했다고 하기", need: [["연습", ["practiced", "practice"]]], hint: ["I think so. I ~ a lot.", "I think so. I practiced…", "I think so. I practiced a lot."], model: "I think so. I practiced a lot." },
        { say: "That's what I like to hear. Mr. Brown's room is on the second floor. Need anything?", want: "발표 전에 프로젝터로 슬라이드를 확인해 봐도 되는지 묻기", need: [["프로젝터", ["projector", "screen"]]], hint: ["Can I test my slides on the ~ first?", "Can I test my slides on the projector…", "Can I test my slides on the projector first?"], model: "Can I test my slides on the projector first?" },
        { say: "Sure, I'll unlock the room. Do you have a cable for your laptop?", want: "노트북은 있는데 케이블이 필요하다고 하기", need: [["케이블", ["cable", "cord", "adapter"]]], hint: ["I have my laptop, but I need an HDMI ~.", "I have my laptop, but I need an HDMI cable…", "I have my laptop, but I need an HDMI cable."], model: "I have my laptop, but I need an HDMI cable." },
        { say: "No problem, I'll grab one. Anything else?", want: "물이 있는지, 목이 마르다고 하기", need: [["물", ["water"]], ["목이 마름", ["throat", "thirsty", "dry"]]], hint: ["Do you have any ~? My throat is dry.", "Do you have any water…", "Do you have any water? My throat is dry."], model: "Do you have any water? My throat is dry." },
        { say: "Right there in the fridge. Good luck!", want: "고맙다며 행운을 빌어 달라고 하기", need: [["행운", ["wish me luck", "luck", "fingers crossed"]]], hint: ["Thanks, Karen! ~ me luck.", "Thanks, Karen! Wish…", "Thanks, Karen! Wish me luck."], model: "Thanks, Karen! Wish me luck." }
      ],
      overhear: [
        ["guest", "Excuse me, which room is the presentation in?", [["which room", "어느 방", "장소를 물을 때 써요."]]],
        ["them", "Second floor, room two-oh-four."],
        ["guest", "Is it okay if I wait in the hall?"],
        ["them", "Of course. They'll call you in soon.", [["call you in", "들어오라고 부르다", "차례가 되면 불러요."]]]
      ] }],
    ["10:00", "3분 발표", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "차례를 기다리는 학생",
      turns: [
        { say: "Alright, everyone's here. You're first. Whenever you're ready, please begin.", want: "인사하고 오늘 이야기할 주제 소개하기", need: [["오늘 이야기", ["today i'd like to talk about", "today i would like to talk about", "today i'm going to talk about", "today i want to talk about", "today i will talk about"]]], hint: ["Good morning, everyone. ~ about my three favorite places.", "Good morning, everyone. Today I'd like…", "Good morning, everyone. Today I'd like to talk about my three favorite places."], model: "Good morning, everyone. Today I'd like to talk about my three favorite places.", chunk: ["Today I'd like to talk about…", "오늘은 ~에 대해 말씀드리겠습니다", "발표 첫 문장의 틀이에요."] },
        { say: "Good start. Please continue.", want: "첫 번째로 박물관과 옛날 동전 이야기하기", need: [["첫째", ["first"]], ["박물관", ["museum"]]], hint: ["First, the City ~. It has amazing ancient coins.", "First, the City Museum…", "First, the City Museum. It has amazing ancient coins."], model: "First, the City Museum. It has amazing ancient coins." },
        { say: "Nice. And your next point?", want: "마지막으로 밤의 언덕과 도시 불빛 이야기하기", need: [["마지막으로", ["finally", "last", "lastly"]]], hint: ["~, the hill at night. The city lights are beautiful.", "Finally, the hill…", "Finally, the hill at night. The city lights are beautiful."], model: "Finally, the hill at night. The city lights are beautiful." },
        { say: "Lovely. Could you wrap up now?", want: "결론: 이 장소들 덕에 여기가 집처럼 느껴진다고 하기", need: [["결론", ["in conclusion", "to sum up", "in summary", "to conclude"]]], hint: ["~, these places make me feel at home here.", "In conclusion…", "In conclusion, these places make me feel at home here."], model: "In conclusion, these places make me feel at home here.", chunk: ["In conclusion", "결론적으로", "발표를 마무리하는 말머리예요."] },
        { say: "Thank you. Is that everything?", want: "네, 들어 줘서 고맙다고 하기", need: [["들어 줘서", ["thank you for listening", "thanks for listening", "thank you for your attention", "thanks for your attention"]]], hint: ["Yes. ~ for listening.", "Yes. Thank you…", "Yes. Thank you for listening."], model: "Yes. Thank you for listening." }
      ],
      overhear: [
        ["guest", "Is it my turn after this?", [["my turn", "내 차례", "차례를 말할 때 써요."]]],
        ["them", "Yes. Get ready, you're next.", [["you're next", "다음은 당신이에요", "순서를 알릴 때 써요."]]],
        ["guest", "I'm so nervous."],
        ["them", "Take a deep breath. You'll be fine.", [["take a deep breath", "숨을 크게 쉬다", "긴장을 풀 때 써요."]]]
      ] }],
    ["13:00", "발표 끝나고 점심", "cafeteria", {
      who: "Rita", whoKo: "학교 식당 아주머니", voices: { them: "f2", guest: "m" }, guestKo: "다음 학생",
      turns: [
        { say: "Well, look who's done! How did it go?", want: "생각보다 잘 됐다고 하기", need: [["생각보다", ["better than i expected", "better than expected", "better than i thought"]]], hint: ["It went ~ than I expected.", "It went better…", "It went better than I expected."], model: "It went better than I expected." },
        { say: "I knew it! Were you nervous?", want: "처음엔 손이 떨렸지만 곧 괜찮아졌다고 하기", need: [["떨렸", ["shook", "shaking", "trembled"]]], hint: ["My hands ~ at first, but then I felt fine.", "My hands shook…", "My hands shook at first, but then I felt fine."], model: "My hands shook at first, but then I felt fine." },
        { say: "Ha! That's normal. This calls for dessert. Apple pie or chocolate cake?", want: "애플파이를 달라고, 받을 자격 있다고 하기", need: [["파이", ["pie", "apple pie"]]], hint: ["Apple ~, please. I earned it!", "Apple pie…", "Apple pie, please. I earned it!"], model: "Apple pie, please. I earned it!" },
        { say: "Coming up. Warm or cold?", want: "따뜻하게, 아이스크림 한 스쿱 올려 달라고 하기", need: [["아이스크림", ["ice cream"]]], hint: ["Warm, with a scoop of ~.", "Warm, with a scoop of ice cream…", "Warm, with a scoop of ice cream."], model: "Warm, with a scoop of ice cream." },
        { say: "That'll be four dollars. Here you go, hon.", want: "정말 고맙다며 다음에 내가 대접하겠다고 하기", need: [["다음에", ["next time"]]], hint: ["Thank you so much! I'll treat you ~.", "Thank you so much! I'll treat you next…", "Thank you so much! I'll treat you next time."], model: "Thank you so much! I'll treat you next time.", chunk: ["I'll treat you", "내가 살게요", "밥·커피를 대접할 때 써요."] }
      ],
      overhear: [
        ["guest", "Is the apple pie homemade?", [["homemade", "직접 만든", "집에서 만든 것처럼 직접 만든 거예요."]]],
        ["them", "Every morning. The recipe is my mother's."],
        ["guest", "Then I'll have two slices.", [["slices", "조각", "케이크·파이를 세는 말이에요."]]],
        ["them", "Smart choice."]
      ] }]
  ]],
  ["질문 받기", [
    ["10:30", "Carmen의 질문", "carmen", {
      who: "Carmen", whoKo: "같은 반 친구", voices: { them: "f", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Great talk yesterday! Can I ask you a question about it?", want: "물론이라고, 뭐든 물어보라고 하기", need: [["물어보", ["ask"]]], hint: ["Of course. ~ me anything.", "Of course. Ask…", "Of course. Ask me anything."], model: "Of course. Ask me anything." },
        { say: "You said the cruise goes under three bridges. Which one is the most beautiful?", want: "가장 오래된 다리고 가로등이 예쁘다고 하기", need: [["가장 오래된", ["oldest"]]], hint: ["The ~ one. It has beautiful lamps.", "The oldest…", "The oldest one. It has beautiful lamps."], model: "The oldest one. It has beautiful lamps." },
        { say: "Cool. How much does the cruise cost? I want to take my parents.", want: "14달러쯤이고 링크를 보내 주겠다고 하기", need: [["링크", ["link"]]], hint: ["About fourteen dollars. I can send you the ~.", "About fourteen dollars. I can send you the link…", "About fourteen dollars. I can send you the link."], model: "About fourteen dollars. I can send you the link." },
        { say: "That would be great. One more thing: when is the best time to go?", want: "늦은 오후가 가장 좋다고 하기", need: [["늦은 오후", ["late afternoon", "sunset", "evening"]]], hint: ["I think ~ afternoon is the best time.", "I think late…", "I think late afternoon is the best time."], model: "I think late afternoon is the best time." },
        { say: "Thanks! Your talk made me want to explore more.", want: "기쁘다며 언제 같이 가자고 하기", need: [["기쁘다", ["glad", "happy"]]], hint: ["I'm ~ to hear that! Let's go together sometime.", "I'm glad…", "I'm glad to hear that! Let's go together sometime."], model: "I'm glad to hear that! Let's go together sometime." }
      ],
      overhear: [
        ["guest", "Carmen, did you understand the last question?"],
        ["them", "Not really. Can you say it again?", [["say it again", "다시 말하다", "못 알아들었을 때 써요."]]],
        ["guest", "He asked about the budget."],
        ["them", "Oh, okay. Thanks."]
      ] }],
    ["13:00", "Noah의 날카로운 질문", "team", {
      who: "Noah", whoKo: "스터디 친구", voices: { them: "m", guest: "f" }, guestKo: "같은 반 친구",
      turns: [
        { say: "Great talk! Can I ask you something I forgot to ask in class?", want: "물론이라고, 무슨 질문이냐고 하기", need: [["질문", ["question"]]], hint: ["Sure, what's your ~?", "Sure, what's your question…", "Sure, what's your question?"], model: "Sure, what's your question?" },
        { say: "Why did you pick the night view as your last place?", want: "거기서 도시가 가장 아름답게 보여서라고 하기", need: [["왜냐하면", ["because"]]], hint: ["~ the city looks the most beautiful from there.", "Because the city…", "Because the city looks the most beautiful from there."], model: "Because the city looks the most beautiful from there." },
        { say: "Makes sense. What was the hardest part of preparing?", want: "생각을 영어로 정리하는 게 제일 어려웠다고 하기", need: [["정리", ["organizing", "organize", "putting"]]], hint: ["~ my ideas in English was the hardest.", "Organizing my ideas…", "Organizing my ideas in English was the hardest."], model: "Organizing my ideas in English was the hardest." },
        { say: "I felt the same. What would you change next time?", want: "다음엔 슬라이드에 글자를 줄이겠다고 하기", need: [["덜", ["fewer words", "less text", "fewer", "less writing"]]], hint: ["Next time, I'll put ~ words on my slides.", "Next time, I'll put fewer…", "Next time, I'll put fewer words on my slides."], model: "Next time, I'll put fewer words on my slides." },
        { say: "Smart. Thanks for answering all my questions!", want: "천만에, 좋은 질문이었다고 하기", need: [["좋은 질문", ["good questions", "great questions", "good question"]]], hint: ["Anytime. You asked really ~ questions!", "Anytime. You asked really good…", "Anytime. You asked really good questions!"], model: "Anytime. You asked really good questions!" }
      ],
      overhear: [
        ["guest", "Excuse me, can I ask a quick question?", [["a quick question", "간단한 질문", "질문을 가볍게 시작할 때 써요."]]],
        ["them", "Sure, what's up?"],
        ["guest", "Do you know when the library opens?"],
        ["them", "I think nine, but let me check."]
      ] }],
    ["17:00", "카페에서 후련한 기분", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f2" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, you! You look happy today.", want: "발표가 끝나서 정말 후련하다고 하기", need: [["후련", ["relieved", "relief", "free", "light"]]], hint: ["I finished my presentation, and I feel so ~.", "I finished my presentation, and I feel so relieved…", "I finished my presentation, and I feel so relieved."], model: "I finished my presentation, and I feel so relieved." },
        { say: "No way! How did it go?", want: "질문을 몇 개 받았고 대부분 대답했다고 하기", need: [["대답", ["answered", "answer"]]], hint: ["I got a few questions, and I ~ most of them.", "I got a few questions, and I answered…", "I got a few questions, and I answered most of them."], model: "I got a few questions, and I answered most of them." },
        { say: "Nice! Was there one you couldn't answer?", want: "확실치 않아서 알아보겠다고 말했다고 하기", need: [["알아보", ["find out", "look it up", "check"]]], hint: ["I wasn't sure, so I said I'd ~ out.", "I wasn't sure, so I said I'd find…", "I wasn't sure, so I said I'd find out."], model: "I wasn't sure, so I said I'd find out." },
        { say: "Smart move. Honestly, that's what professionals do. So, what'll it be?", want: "달콤한 게 마시고 싶은데 시즌 메뉴를 먹어 봐도 되는지 묻기", need: [["시즌", ["seasonal", "special", "season"]]], hint: ["I want something sweet. Can I try your ~ special?", "I want something sweet. Can I try your seasonal…", "I want something sweet. Can I try your seasonal special?"], model: "I want something sweet. Can I try your seasonal special?" },
        { say: "Maple latte, coming up. This one's on me, to celebrate.", want: "정말 고맙다고, 냄새가 좋다고 하기", need: THANKS, hint: ["Thanks, Leo! That ~ amazing.", "Thanks, Leo! That smells…", "Thanks, Leo! That smells amazing."], model: "Thanks, Leo! That smells amazing." }
      ],
      overhear: [
        ["guest", "Could I get a smaller size?", [["smaller size", "더 작은 사이즈", "size 앞에 비교급을 써요."]]],
        ["them", "We have small and medium."],
        ["guest", "Small, please. And can you make it decaf?", [["decaf", "디카페인", "카페인을 뺀 커피예요."]]],
        ["them", "No problem."]
      ] }]
  ]],
  ["피드백", [
    ["11:00", "선생님 면담", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Come in. First of all, congratulations. That was a strong presentation.", want: "고맙다고, 피드백을 듣고 싶다고 하기", need: [["피드백", ["feedback", "comments", "advice"]]], hint: ["Thank you! I'd love to hear your ~.", "Thank you! I'd love to hear your feedback…", "Thank you! I'd love to hear your feedback."], model: "Thank you! I'd love to hear your feedback." },
        { say: "Your best strength was your clear structure. Everyone could follow it.", want: "기쁘다며 열심히 준비했다고 하기", need: [["열심히", ["worked hard", "practiced a lot", "spent a lot of time"]]], hint: ["That makes me happy. I ~ hard on it.", "That makes me happy. I worked…", "That makes me happy. I worked hard on it."], model: "That makes me happy. I worked hard on it." },
        { say: "One thing to improve: you said 'um' quite a lot.", want: "정말이냐며 알아차리지 못했다고 하기", need: [["알아차리", ["notice", "noticed", "realize", "realized"]]], hint: ["Really? I didn't ~ that.", "Really? I didn't notice…", "Really? I didn't notice that."], model: "Really? I didn't notice that." },
        { say: "You can pause instead. Silence is fine in a talk.", want: "알겠다며 다음엔 'um' 대신 쉬겠다고 하기", need: [["쉬기", ["pause", "stop", "breathe", "take a breath"]]], hint: ["I see. Next time, I'll ~ instead of saying 'um.'", "I see. Next time, I'll pause…", "I see. Next time, I'll pause instead of saying 'um.'"], model: "I see. Next time, I'll pause instead of saying 'um.'" },
        { say: "Good. Keep up the good work. You've grown so much since March.", want: "고맙다며 수업에서 많이 배웠다고 하기", need: [["배웠", ["learned", "learnt"]]], hint: ["Thank you. I've ~ so much in your class.", "Thank you. I've learned…", "Thank you. I've learned so much in your class."], model: "Thank you. I've learned so much in your class." }
      ],
      overhear: [
        ["guest", "Mr. Brown, could you check my writing?", [["check my writing", "내 글을 봐 주다", "글 첨삭을 부탁할 때 써요."]]],
        ["them", "Of course. Leave it on my desk."],
        ["guest", "When will I get it back?"],
        ["them", "By Friday, I promise."]
      ] }],
    ["13:30", "Yuki와 피드백 나누기", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hi! How was your meeting with Mr. Brown?", want: "구조가 명확하다고 칭찬받았다고 하기", need: [["구조", ["structure", "organized"]]], hint: ["He said my ~ was clear.", "He said my structure…", "He said my structure was clear."], model: "He said my structure was clear." },
        { say: "That's great! Anything to work on?", want: "'um'을 너무 많이 한다고 하기", need: [["너무 많이", ["too much", "too often", "a lot"]]], hint: ["I say 'um' ~ much, he said.", "I say 'um' too…", "I say 'um' too much, he said."], model: "I say 'um' too much, he said." },
        { say: "Oh, I do that too! Did he give you any tips?", want: "문장 사이에 숨을 쉬라고 했다고 하기", need: [["숨", ["breath", "breathe"]]], hint: ["He told me to take a ~ between sentences.", "He told me to take a breath…", "He told me to take a breath between sentences."], model: "He told me to take a breath between sentences." },
        { say: "Good tip. He said I speak too softly, so I need to fix that.", want: "쉽게 고칠 수 있다며 조금만 크게 말하라고 하기", need: [["크게", ["louder", "loudly"]]], hint: ["That's easy to fix. Just speak a little ~.", "That's easy to fix. Just speak a little louder…", "That's easy to fix. Just speak a little louder."], model: "That's easy to fix. Just speak a little louder." },
        { say: "Thanks! Hey, let's celebrate this weekend.", want: "좋다며 토요일 시장은 어떠냐고 하기", need: [["시장", ["market"]]], hint: ["Great idea! How about the Saturday ~?", "Great idea! How about the Saturday market…", "Great idea! How about the Saturday market?"], model: "Great idea! How about the Saturday market?" }
      ],
      overhear: [
        ["guest", "Did you get your grade yet?", [["get your grade", "성적을 받다", "grade는 점수·성적이에요."]]],
        ["them", "Not yet. He said by Friday."],
        ["guest", "I hope I passed.", [["I hope I passed", "통과했으면 좋겠어요", "hope 뒤에 문장을 붙여요."]]],
        ["them", "You will. You worked so hard."]
      ] }],
    ["17:30", "서점 알바에서 선물", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "f2" }, guestKo: "손님",
      turns: [
        { say: "Hey! How did your presentation go? I've been dying to ask.", want: "잘 끝났고 선생님이 좋은 평가를 해 줬다고 하기", need: [["선생님", ["teacher", "mr. brown"]]], hint: ["It went well, and my ~ gave me good feedback.", "It went well, and my teacher…", "It went well, and my teacher gave me good feedback."], model: "It went well, and my teacher gave me good feedback." },
        { say: "I knew you could do it! So, are you tired?", want: "조금 피곤하다고, 오늘 밤은 일찍 자고 싶다고 하기", need: [["일찍", ["early"]]], hint: ["A little. I want to go to bed ~ tonight.", "A little. I want to go to bed early…", "A little. I want to go to bed early tonight."], model: "A little. I want to go to bed early tonight." },
        { say: "Good idea. But first, I picked up a little something for your graduation. Open it!", want: "그러지 않아도 되는데 하며 놀라워하기", need: [["그럴 필요", ["you didn't have to", "you shouldn't have"]]], hint: ["Oh, wow. You ~ have to do that!", "Oh, wow. You didn't…", "Oh, wow. You didn't have to do that!"], model: "Oh, wow. You didn't have to do that!" },
        { say: "It's a notebook for your future ideas.", want: "마음에 든다며 이런 노트를 늘 갖고 싶었다고 하기", need: [["갖고 싶었", ["always wanted", "wanted one", "wanted something like"]]], hint: ["I love it. I've ~ wanted one like this.", "I love it. I've always…", "I love it. I've always wanted one like this."], model: "I love it. I've always wanted one like this." },
        { say: "Good! Can you work Saturday morning? Maria asked for a day off.", want: "좋다고, 몇 시까지 가면 되는지 묻기", need: [["몇 시", ["what time", "when"]]], hint: ["Sure. ~ time should I be there?", "Sure. What…", "Sure. What time should I be there?"], model: "Sure. What time should I be there?" }
      ],
      overhear: [
        ["guest", "Do you have this in paperback?", [["in paperback", "문고판으로", "얇은 표지의 책이에요."]]],
        ["them", "Let me check the system."],
        ["guest", "I'd like to give it as a gift.", [["as a gift", "선물로", "용도를 말할 때 as를 써요."]]],
        ["them", "We can gift wrap it for free."]
      ] }]
  ]],
  ["수료식", [
    ["10:00", "수료증 받으러", "schooloffice", {
      who: "Karen", whoKo: "학원 사무실 직원", voices: { them: "f", guest: "f2" }, guestKo: "다른 학생",
      turns: [
        { say: "Good morning! Ready for graduation day?", want: "믿기지 않는다며 시간이 정말 빨리 갔다고 하기", need: [["빨리", ["so fast", "flew by", "went by", "too fast"]]], hint: ["I can't believe it. Time went by so ~!", "I can't believe it. Time went by so fast…", "I can't believe it. Time went by so fast!"], model: "I can't believe it. Time went by so fast!" },
        { say: "It always does. I have your certificate here. Could you check the spelling of your name?", want: "전부 맞다고 고맙다고 하기", need: [["맞음", ["correct", "right", "perfect"]]], hint: ["Yes, it's all ~. Thank you!", "Yes, it's all correct…", "Yes, it's all correct. Thank you!"], model: "Yes, it's all correct. Thank you!" },
        { say: "Wonderful. The ceremony starts at two in the main hall. Can you arrive by one thirty?", want: "가족이 온라인으로 볼 수 있는지 묻기", need: [["온라인", ["online", "live", "video", "stream"]]], hint: ["Sure. Can my family watch ~?", "Sure. Can my family watch online…", "Sure. Can my family watch online?"], model: "Sure. Can my family watch online?" },
        { say: "Yes, there's a livestream link. I'll email it to you today.", want: "수료식 끝나고 사진 찍을 시간이 있는지 묻기", need: [["사진", ["photos", "pictures", "photo"]]], hint: ["Will there be time for ~ after the ceremony?", "Will there be time for photos…", "Will there be time for photos after the ceremony?"], model: "Will there be time for photos after the ceremony?" },
        { say: "Of course. Everyone takes group photos on the stairs.", want: "고맙다며 1시 반에 보자고 하기", need: [["1시 반", ["one thirty", "1 30"]]], hint: ["Great. See you at ~ thirty!", "Great. See you at one…", "Great. See you at one thirty!"], model: "Great. See you at one thirty!" }
      ],
      overhear: [
        ["guest", "Excuse me, where do I pick up my certificate?", [["pick up my certificate", "수료증을 받으러 오다", "pick up은 찾아간다는 뜻이에요."]]],
        ["them", "Right here. May I see your ID?"],
        ["guest", "Sure. Oh, and I need a copy of my transcript.", [["transcript", "성적 증명서", "학교에서 떼는 성적 기록이에요."]]],
        ["them", "That takes two days."]
      ] }],
    ["14:00", "수료식", "ceremony", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f2" }, guestKo: "같은 반 친구",
      turns: [
        { say: "Congratulations! You made it. How do you feel?", want: "기쁘고 뿌듯하다고 하기", need: [["뿌듯", ["proud"]]], hint: ["I feel happy and ~.", "I feel happy and proud…", "I feel happy and proud."], model: "I feel happy and proud." },
        { say: "You should be proud. Here is your certificate.", want: "고맙다며 선생님의 수업이 큰 의미였다고 하기", need: [["큰 의미", ["meant a lot", "means a lot"]]], hint: ["Thank you. Your class ~ a lot to me.", "Thank you. Your class meant…", "Thank you. Your class meant a lot to me."], model: "Thank you. Your class meant a lot to me." },
        { say: "That's kind. Would you like to say a few words to your classmates?", want: "매일 도와줘서 모두에게 고맙다고 하기", need: [["도와줘서", ["helping", "helped", "support", "supporting"]]], hint: ["Thank you all for ~ me every day.", "Thank you all for helping…", "Thank you all for helping me every day."], model: "Thank you all for helping me every day." },
        { say: "Lovely. And what's next for you?", want: "영어를 계속 연습하고 인턴을 찾아보고 싶다고 하기", need: [["인턴", ["internship", "intern"]]], hint: ["I want to keep practicing and look for an ~.", "I want to keep practicing and look for an internship…", "I want to keep practicing and look for an internship."], model: "I want to keep practicing and look for an internship." },
        { say: "That's a great plan. Please stay in touch.", want: "그러겠다고, 계속 연락하겠다고 하기", need: [["연락", ["keep in touch", "stay in touch"]]], hint: ["I will! I'll ~ in touch.", "I will! I'll keep…", "I will! I'll keep in touch."], model: "I will! I'll keep in touch.", chunk: ["stay in touch", "계속 연락하다", "헤어질 때 자주 하는 인사예요."] }
      ],
      overhear: [
        ["guest", "Mr. Brown, can we take a group photo?", [["group photo", "단체 사진", "여러 명이 함께 찍는 사진이에요."]]],
        ["them", "Of course. Everyone, line up by the stage.", [["line up", "줄을 서다", "사진 찍을 때 줄 맞춰 서요."]]],
        ["guest", "Should we stand in rows?"],
        ["them", "Tall ones in back, short ones in front."]
      ] }],
    ["19:00", "수료 축하 모임", "meetup", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
      turns: [
        { say: "There's the graduate! Congratulations! These flowers are for you.", want: "꽃이 정말 예쁘다고 고맙다고 하기", need: [["예쁨", ["gorgeous", "beautiful", "pretty", "lovely"]]], hint: ["They're ~. Thank you so much!", "They're gorgeous…", "They're gorgeous. Thank you so much!"], model: "They're gorgeous. Thank you so much!" },
        { say: "Tell me everything about the ceremony.", want: "수료증을 받았고 모두가 박수 쳤다고 하기", need: [["박수", ["clapped", "applauded", "cheered"]]], hint: ["I got my certificate, and everyone ~.", "I got my certificate, and everyone clapped…", "I got my certificate, and everyone clapped."], model: "I got my certificate, and everyone clapped." },
        { say: "Aww. Did you cry?", want: "거의 울 뻔했다고, 조금 울컥했다고 하기", need: [["울컥", ["emotional", "teared up", "tear up"]]], hint: ["Almost! I got a little ~.", "Almost! I got a little emotional…", "Almost! I got a little emotional."], model: "Almost! I got a little emotional." },
        { say: "It's already been almost three months since you moved here!", want: "맞다며 처음엔 모든 게 낯설었다고 하기", need: [["낯선", ["strange", "unfamiliar", "new"]]], hint: ["I know. Everything felt ~ at first.", "I know. Everything felt strange…", "I know. Everything felt strange at first."], model: "I know. Everything felt strange at first." },
        { say: "And now? Do you feel at home here?", want: "이제 집 같다고, 네 덕분이라고 하기", need: [["덕분", ["thanks to you", "because of you"]]], hint: ["Yes, I do. ~ to you.", "Yes, I do. Thanks…", "Yes, I do. Thanks to you."], model: "Yes, I do. Thanks to you." }
      ],
      overhear: [
        ["guest", "Sara, who's the guest of honor tonight?", [["guest of honor", "주인공", "행사의 주인공이에요."]]],
        ["them", "My friend here. They just finished their course."],
        ["guest", "Congratulations! That's a big deal.", [["a big deal", "큰일", "중요한 일이라는 뜻이에요."]]],
        ["them", "It really is."]
      ] }]
  ]]
]);
