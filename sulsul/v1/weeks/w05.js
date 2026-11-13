// 5주째 · 아르바이트 구하기 (29~35일째). 서점 카페에 이력서를 내고, 면접을 보고, 일하며 주문을 받는다.
// 장면 = [시간, 이름, 그림 id, 대본]. 형식은 ~/sulsul-art/YEAR.md
WEEK(5, [
  ["이력서 내기", [
    ["10:00", "이력서 봐 달라고 부탁하기", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Hi! Did you want to see me after class?", want: "이력서를 한번 봐 달라고 부탁하기", need: [["이력서",["resume","cv"]],["봐 주기",["take a look","look at","check","review"]]], hint: ["Yes. Could you ~ a look at my resume, please?","Yes. Could you take…","Yes. Could you take a look at my resume, please?"], model: "Yes. Could you take a look at my resume, please?", chunk: ["take a look at","한번 봐 주다","가볍게 확인해 달라고 부탁할 때 써요."] },
        { say: "Sure. It's a good start. What kind of job are you applying for?", want: "서점이나 카페에서 일하고 싶다고 하기", need: [["서점·카페",["bookstore","bookshop","cafe","coffee shop"]]], hint: ["I want to work at a ~ or a cafe.","I want to work…","I want to work at a bookstore or a cafe."], model: "I want to work at a bookstore or a cafe.", chunk: ["apply for","~에 지원하다","일자리에 지원할 때 써요."] },
        { say: "Then put your customer service experience at the top. Do you have any?", want: "한국에서 카페 아르바이트를 6개월 했다고 하기", need: [["6개월",["six months","6 months"]],["카페",["cafe","coffee shop"]]], hint: ["I worked part-time at a cafe in Korea for ~ months.","I worked part-time at a…","I worked part-time at a cafe in Korea for six months."], model: "I worked part-time at a cafe in Korea for six months.", chunk: ["worked part-time","아르바이트로 일했어요","part-time은 시간제 일이에요."] },
        { say: "Great, add that. Also, try shorter lines. It looks a bit crowded.", want: "알겠다고, 고쳐서 내일 다시 가져와도 되는지 묻기", need: [["내일",["tomorrow"]],["가져오기",["bring"]]], hint: ["Okay. Can I ~ it back tomorrow?","Okay. Can I…","Okay. Can I bring it back tomorrow?"], model: "Okay. Can I bring it back tomorrow?" },
        { say: "Of course. Good luck with the applications!", want: "고맙다고, 많이 도움이 됐다고 하기", need: THANKS, hint: ["Thank you, Mr. Brown. This was really ~.","Thank you, Mr. Brown…","Thank you, Mr. Brown. This was really helpful."], model: "Thank you, Mr. Brown. This was really helpful." }
      ],
      overhear: [
        ["guest","Mr. Brown, do you have office hours today?",[["office hours","상담 시간","선생님이 학생을 만나는 정해진 시간이에요."]]],
        ["them","Yes, from two to four in room 204."],
        ["guest","Great. I need help with my essay."],
        ["them","Come by anytime. Just knock.",[["Come by","들르다","잠깐 찾아갈 때 써요."]]]
      ] }],
    ["13:00", "이력서 인쇄하기", "copyshop", {
      who: "Owen", whoKo: "인쇄소 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! What can I do for you?", want: "이력서를 10부 뽑고 싶다고 하기", need: [["10부",["ten","10"]],["이력서",["resume","resumes","copies","copy"]]], hint: ["I need to print ~ copies of my resume.","I need to print…","I need to print ten copies of my resume."], model: "I need to print ten copies of my resume.", chunk: ["print ten copies","10부 인쇄하다","print + 개수 + copies로 말해요."] },
        { say: "Sure. Do you have the file on a USB drive, or should I pull it from your email?", want: "방금 그쪽 이메일로 보냈다고 하기", need: [["이메일",["email","emailed"]],["보냄",["sent","send"]]], hint: ["I just ~ it to your email.","I just sent…","I just sent it to your email."], model: "I just sent it to your email." },
        { say: "Got it. Black and white or color?", want: "흑백도 괜찮은데 종이는 더 두꺼운 걸로 하고 싶다고 하기", need: [["흑백",["black and white","black"]],["두꺼운",["thick","thicker","heavy","heavier"]]], hint: ["Black and white is fine, but on ~ paper, please.","Black and white is…","Black and white is fine, but on thicker paper, please."], model: "Black and white is fine, but on thicker paper, please.", chunk: ["on thicker paper","더 두꺼운 종이로","종이 종류는 on을 써요."] },
        { say: "Thick paper is thirty cents a page. So that's three dollars total.", want: "폴더에 넣어 줄 수 있는지 묻기", need: [["폴더",["folder","envelope"]]], hint: ["Could you put them in a ~?","Could you put…","Could you put them in a folder?"], model: "Could you put them in a folder?" },
        { say: "Sure, here you go. Good luck with the job hunt!", want: "현금으로 내겠다고 하기", need: [["현금",["cash"]]], hint: ["Thanks! I'll pay in ~.","Thanks! I'll…","Thanks! I'll pay in cash."], model: "Thanks! I'll pay in cash.", chunk: ["pay in cash","현금으로 내다","카드는 pay by card라고 해요."] }
      ],
      overhear: [
        ["guest","Can you scan this and email it to me?",[["scan","스캔하다","종이를 파일로 만든다는 뜻이에요."]]],
        ["them","Sure. What's your email address?"],
        ["guest","It's on the form."],
        ["them","Perfect. It'll be ready in ten minutes.",[["ready in ten minutes","10분 뒤면 돼요","끝나는 때는 ready in으로 말해요."]]]
      ] }],
    ["16:00", "서점 카페에 이력서 내기", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi there! Can I get you something to drink?", want: "창문의 공고를 봤다고 하며 사람 구하는지 묻기", need: [["구하는 중",["hiring","looking for","need help","need someone"]]], hint: ["I saw your sign in the window. Are you ~?","I saw your sign…","I saw your sign in the window. Are you hiring?"], model: "I saw your sign in the window. Are you hiring?", chunk: ["Are you hiring?","사람 뽑고 있어요?","가게에서 일자리가 있는지 물을 때 써요."] },
        { say: "Yes, we are! We need someone part-time. Do you have experience?", want: "이력서를 가져왔다며 건네기", need: [["이력서",["resume","cv"]],["가져옴",["brought","have","here"]]], hint: ["Yes. I ~ my resume. Here it is.","Yes. I brought my…","Yes. I brought my resume. Here it is."], model: "Yes. I brought my resume. Here it is." },
        { say: "Thanks. A cafe in Korea? That's great. When are you available?", want: "평일 오후랑 주말은 다 된다고 하기", need: [["평일",["weekday","weekdays","monday"]],["주말",["weekend","weekends","saturday"]]], hint: ["I'm free on ~ afternoons and weekends.","I'm free on…","I'm free on weekday afternoons and weekends."], model: "I'm free on weekday afternoons and weekends.", chunk: ["I'm free","시간이 돼요","available 대신 편하게 쓰는 말이에요."] },
        { say: "Perfect. Are you allowed to work with your student visa?", want: "네, 주 20시간까지 일할 수 있다고 하기", need: [["20시간",["twenty hours","20 hours"]]], hint: ["Yes, I can work up to ~ hours a week.","Yes, I can work…","Yes, I can work up to twenty hours a week."], model: "Yes, I can work up to twenty hours a week.", chunk: ["up to","최대 ~까지","한도를 말할 때 써요."] },
        { say: "Great. Let's do an interview tomorrow at two. Does that sound good?", want: "내일 2시 좋다고, 이름을 말하기", need: [["좋음",["perfect","great","good","fine"]],["이름",["i'm","my name"]]], hint: ["~ at two is perfect. I'm {name}.","Tomorrow at two…","Tomorrow at two is perfect. I'm {name}."], model: "Tomorrow at two is perfect. I'm {name}." }
      ],
      overhear: [
        ["guest","I'm looking for a gift for my mom. Any ideas?",[["a gift for","~에게 줄 선물","for 뒤에 받을 사람을 붙여요."]]],
        ["them","What does she like to read?"],
        ["guest","Mostly mysteries."],
        ["them","Then you'll love this one. It just came out.",[["just came out","막 나왔어요","책·영화가 새로 나왔다는 뜻이에요."]]]
      ] }]
  ]],
  ["면접 보기", [
    ["11:00", "Sara와 면접 연습", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "Sara의 룸메이트",
      turns: [
        { say: "Okay, I'll be the manager. Come in! Tell me a little about yourself.", want: "이름을 말하고 한국에서 온 대학생이라고 하기", need: [["대학생",["student","college"]],["한국",["korea","korean"]]], hint: ["I'm {name}. I'm a college ~ from Korea.","I'm {name}. I'm a…","I'm {name}. I'm a college student from Korea."], model: "I'm {name}. I'm a college student from Korea." },
        { say: "Nice. Why do you want to work here?", want: "책이랑 커피를 좋아해서라고 하기", need: [["책",["books","book","reading"]],["커피",["coffee"]]], hint: ["I love ~ and coffee, so this is perfect for me.","I love books and coffee…","I love books and coffee, so this is perfect for me."], model: "I love books and coffee, so this is perfect for me." },
        { say: "Good answer! What's your biggest strength?", want: "성실하고 빨리 배운다고 하기", need: [["성실",["hardworking","hard working","reliable","responsible","dependable"]],["빠르게",["fast","quickly","quick"]]], hint: ["I'm hardworking, and I learn ~.","I'm hardworking, and…","I'm hardworking, and I learn quickly."], model: "I'm hardworking, and I learn quickly.", chunk: ["learn quickly","빨리 배우다","강점을 말할 때 자주 써요."] },
        { say: "And what about a weakness?", want: "가끔 말이 느리지만 노력 중이라고 하기", need: [["노력",["working on","practicing","improving","trying"]]], hint: ["Sometimes I speak slowly, but I'm ~ on it.","Sometimes I speak slowly…","Sometimes I speak slowly, but I'm working on it."], model: "Sometimes I speak slowly, but I'm working on it.", chunk: ["I'm working on it","노력하는 중이에요","약점을 말하고 긍정적으로 끝낼 때 써요."] },
        { say: "Perfect! Any questions for me?", want: "근무 일정이 어떻게 되는지 묻기", need: [["일정",["schedule","shifts","hours"]]], hint: ["What would my ~ look like?","What would my…","What would my schedule look like?"], model: "What would my schedule look like?" }
      ],
      overhear: [
        ["guest","Sara, can I borrow your charger?"],
        ["them","Sure, it's on the desk. We're doing a mock interview.",[["mock interview","모의 면접","연습으로 하는 면접이에요."]]],
        ["guest","Oh, nice! Good luck, you two."],
        ["them","Thanks. Wish us luck!",[["Wish us luck","행운을 빌어 줘요","시험·면접을 앞두고 써요."]]]
      ] }],
    ["14:00", "서점 카페 면접", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "다음 지원자",
      turns: [
        { say: "Hi! Thanks for coming in. Please, have a seat.", want: "만나서 반갑다고, 불러 줘서 고맙다고 하기", need: [["반가움",["great to meet you","nice to meet you","good to meet you","pleased to meet you"]]], hint: ["Great to meet you, Olivia. Thanks for ~ me.","Great to meet you…","Great to meet you, Olivia. Thanks for having me."], model: "Great to meet you, Olivia. Thanks for having me.", chunk: ["Thanks for having me","불러 주셔서 고마워요","초대받거나 면접에 불려 왔을 때 써요."] },
        { say: "So, tell me, have you worked in a cafe before?", want: "한국 카페에서 커피를 만들고 손님을 도왔다고 하기", need: [["커피",["coffee","drinks"]],["손님",["customers","customer"]]], hint: ["Yes, I made ~ and helped customers at a cafe in Korea.","Yes, I made coffee and…","Yes, I made coffee and helped customers at a cafe in Korea."], model: "Yes, I made coffee and helped customers at a cafe in Korea." },
        { say: "Nice. What would you do if a customer was upset?", want: "먼저 들어주고 사과하겠다고 하기", need: [["들음",["listen"]],["사과",["apologize","sorry"]]], hint: ["I'd ~ first, and then I'd apologize and fix it.","I'd listen first, and…","I'd listen first, and then I'd apologize and fix it."], model: "I'd listen first, and then I'd apologize and fix it." },
        { say: "Great answer. Can you start tomorrow morning?", want: "내일 8시 반까지 올 수 있다고 하기", need: [["내일",["tomorrow"]],["올 수 있음",["can be here","can come","can start"]]], hint: ["Yes, I can be ~ tomorrow at eight thirty.","Yes, I can be…","Yes, I can be here tomorrow at eight thirty."], model: "Yes, I can be here tomorrow at eight thirty." },
        { say: "Then welcome to the team! Come at eight thirty, and I'll show you around.", want: "정말 기쁘다고, 열심히 하겠다고 하기", need: [["열심히",["hard","best"]]], hint: ["That's great news! I'll work ~.","That's great news…","That's great news! I'll work hard."], model: "That's great news! I'll work hard.", chunk: ["That's great news!","좋은 소식이네요!","좋은 소식을 들었을 때 써요."] }
      ],
      overhear: [
        ["guest","Hi, I'm here for the two thirty interview."],
        ["them","Welcome! Have a seat. I'll be with you in a minute.",[["I'll be with you in a minute","곧 갈게요","잠깐 기다려 달라고 할 때 써요."]]],
        ["guest","No rush. Take your time."],
        ["them","Can I get you some water?"]
      ] }],
    ["17:00", "Leo에게 합격 소식", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey! You look happy today. What's up?", want: "면접을 봤고 서점 카페에 합격했다고 하기", need: [["합격",["got the job","got hired","hired","got it"]]], hint: ["I just ~ the job at the bookstore cafe!","I just got the…","I just got the job at the bookstore cafe!"], model: "I just got the job at the bookstore cafe!", chunk: ["got the job","취직했어요","합격 소식을 짧게 전해요."] },
        { say: "No way, congrats! When do you start?", want: "내일부터 출근한다고 하기", need: [["내일",["tomorrow"]],["출근",["start","starting","work"]]], hint: ["I ~ tomorrow!","I start…","I start tomorrow!"], model: "I start tomorrow!" },
        { say: "Nice. Honestly, it's a great place. Are you nervous?", want: "조금, 주문 받는 게 걱정이라고 하기", need: [["주문",["orders","order"]],["걱정",["worried","nervous","afraid","scared","anxious"]]], hint: ["A little. I'm ~ about taking orders.","A little. I'm…","A little. I'm worried about taking orders."], model: "A little. I'm worried about taking orders." },
        { say: "Don't worry. The trick is to repeat the order back. Then nobody gets the wrong drink.", want: "좋은 팁이라고, 더 알려 달라고 하기", need: [["팁",["tip","advice","trick"]],["더",["more","another","else"]]], hint: ["That's a good ~. Any more advice?","That's a good…","That's a good tip. Any more advice?"], model: "That's a good tip. Any more advice?" },
        { say: "Just smile and take your time. Oh, and your first coffee here is on me!", want: "고맙다고, 다음엔 월급 받고 내가 사겠다고 하기", need: [["월급",["get paid","paycheck","payday","salary"]]], hint: ["Thanks, Leo! I'll buy next time, once I ~ paid.","Thanks, Leo! I'll buy…","Thanks, Leo! I'll buy next time, once I get paid."], model: "Thanks, Leo! I'll buy next time, once I get paid.", chunk: ["it's on me","제가 살게요","계산을 대신 해 줄 때 써요."] }
      ],
      overhear: [
        ["guest","Can I get a muffin to go?",[["to go","포장","가져갈 때 써요."]]],
        ["them","Sure. Blueberry or banana?"],
        ["guest","Banana, please."],
        ["them","Coming right up.",[["Coming right up","금방 나와요","주문을 받고 곧 준다는 말이에요."]]]
      ] }]
  ]],
  ["첫 출근", [
    ["08:30", "첫 출근", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "배달 기사",
      turns: [
        { say: "Good morning! You're right on time. Ready for your first day?", want: "네, 준비됐고 조금 일찍 왔다고 하기", need: [["준비",["ready"]],["일찍",["early"]]], hint: ["Good morning! I'm ~, and I came a little early.","Good morning! I'm ready…","Good morning! I'm ready, and I came a little early."], model: "Good morning! I'm ready, and I came a little early." },
        { say: "Love it. First, here's your apron.", want: "고맙다고, 가방은 어디에 두면 되는지 묻기", need: [["어디",["where"]],["가방",["bag","bags","things","stuff","backpack","coat"]]], hint: ["Thanks! Where can I put my ~?","Thanks! Where can…","Thanks! Where can I put my bag?"], model: "Thanks! Where can I put my bag?" },
        { say: "Right in the back room. Now, this is the register. Today, just watch me and ask questions.", want: "일하면서 중간중간 물어봐도 되는지 묻기", need: [["질문",["question","questions","ask"]]], hint: ["Okay. Is it okay to ask ~ as we go?","Okay. Is it okay…","Okay. Is it okay to ask questions as we go?"], model: "Okay. Is it okay to ask questions as we go?", chunk: ["as we go","하면서","일을 하는 중간중간이라는 뜻이에요."] },
        { say: "Of course. That's how you learn. Have you used an espresso machine?", want: "한국에서 써 봤지만 이 기계는 처음이라고 하기", need: [["처음",["never","first time"]],["기계",["machine"]]], hint: ["I've used one in Korea, but ~ this machine.","I've used one in…","I've used one in Korea, but never this machine."], model: "I've used one in Korea, but never this machine." },
        { say: "No problem, I'll show you. Okay, our first customer is coming in!", want: "신나서 기대된다고 하기", need: [["신남",["excited","can't wait"]]], hint: ["I'm so ~. Let's do this!","I'm so excited…","I'm so excited. Let's do this!"], model: "I'm so excited. Let's do this!", chunk: ["Let's do this!","해 보자!","각오를 다질 때 쓰는 말이에요."] }
      ],
      overhear: [
        ["guest","Morning, Olivia! I've got your pastry delivery.",[["pastry delivery","빵 배달","가게에 들어오는 빵·과자 배달이에요."]]],
        ["them","Perfect. Just set it on the counter.",[["set it","내려놓다","물건을 놓아 달라고 할 때 써요."]]],
        ["guest","Do you need me to sign anything?"],
        ["them","Yes, right here. Thanks, see you tomorrow."]
      ] }],
    ["12:30", "점심 과일 사기", "market", {
      who: "Joe", whoKo: "과일 가게 주인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hey there! You're dressed up today. Got a new job?", want: "맞다고, 서점 카페에서 막 시작했다고 하기", need: [["시작",["started","start","starting"]],["서점",["bookstore","bookshop"]]], hint: ["I did! I just ~ at a bookstore cafe.","I did! I just…","I did! I just started at a bookstore cafe."], model: "I did! I just started at a bookstore cafe." },
        { say: "Congratulations! What can I get you for lunch?", want: "바나나 두 개와 사과 한 개 달라고 하기", need: [["바나나",["banana","bananas"]],["사과",["apple"]]], hint: ["Two ~ and one apple, please.","Two bananas and…","Two bananas and one apple, please."], model: "Two bananas and one apple, please." },
        { say: "Here you go. These bananas are great for energy.", want: "점심시간이 30분뿐이라고 하기", need: [["30분",["half an hour","thirty minutes","30 minutes"]]], hint: ["Great, because I only have ~ for lunch.","Great, because I only…","Great, because I only have half an hour for lunch."], model: "Great, because I only have half an hour for lunch.", chunk: ["half an hour","30분","thirty minutes와 같아요."] },
        { say: "Half an hour? Better hurry then. Want a bag?", want: "괜찮다고, 가방에 넣겠다고 하기", need: [["괜찮음",["i'm good","i'm fine","no thanks","no need","don't need"]]], hint: ["No, ~ good. I'll put them in my bag.","No, I'm good. I'll…","No, I'm good. I'll put them in my bag."], model: "No, I'm good. I'll put them in my bag." },
        { say: "Alright. Three fifty. Have a great first day!", want: "고맙다고, 퇴근길에 들르겠다고 하기", need: [["들르기",["stop by","come by","drop by","swing by"]]], hint: ["Thanks, Joe! I'll ~ by after work.","Thanks, Joe! I'll…","Thanks, Joe! I'll stop by after work."], model: "Thanks, Joe! I'll stop by after work.", chunk: ["stop by","잠깐 들르다","오가는 길에 가볍게 들를 때 써요."] }
      ],
      overhear: [
        ["guest","Are these peaches ripe?",[["ripe","잘 익은","과일이 먹기 좋게 익었을 때 써요."]]],
        ["them","Yes, perfect today. Go on, squeeze one."],
        ["guest","How much per pound?",[["per pound","한 파운드당","과일·고기는 무게로 팔아요."]]],
        ["them","Two dollars a pound."]
      ] }],
    ["18:30", "Ella와 첫날 이야기", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Hey, neighbor! Max says hi. How was your day?", want: "새 일을 시작했는데 피곤하지만 좋았다고 하기", need: [["피곤",["tired","exhausted"]],["좋음",["good","great","fun"]]], hint: ["I started a new job today. I'm ~, but it was great.","I started a new job…","I started a new job today. I'm tired, but it was great."], model: "I started a new job today. I'm tired, but it was great." },
        { say: "Oh, what kind of job?", want: "서점 카페에서 주문 받고 커피 만든다고 하기", need: [["서점",["bookstore","bookshop"]]], hint: ["I work at a ~ cafe. I take orders and make coffee.","I work at a bookstore…","I work at a bookstore cafe. I take orders and make coffee."], model: "I work at a bookstore cafe. I take orders and make coffee." },
        { say: "That sounds lovely! Do you get free coffee?", want: "공짜는 아니고 직원 할인이 있다고 하기", need: [["할인",["discount"]]], hint: ["Not free, but there's a staff ~.","Not free, but…","Not free, but there's a staff discount."], model: "Not free, but there's a staff discount." },
        { say: "Still good. My cousin loves that place. I'll tell her to say hi.", want: "그럼 꼭 나를 찾으라고 하기", need: [["찾기",["ask for","look for","find me"]]], hint: ["Please do! Tell her to ~ for me.","Please do! Tell her…","Please do! Tell her to ask for me."], model: "Please do! Tell her to ask for me." },
        { say: "Will do! Well, I'd better get Max home for dinner.", want: "집에 가서 푹 쉴 거라고, 잘 가라고 하기", need: [["쉬기",["rest","sleep","relax"]]], hint: ["Okay! I'm going to get some ~. Good night!","Okay! I'm going to…","Okay! I'm going to get some rest. Good night!"], model: "Okay! I'm going to get some rest. Good night!", chunk: ["get some rest","좀 쉬다","푹 쉴 거라고 할 때 써요."] }
      ],
      overhear: [
        ["guest","What a friendly dog! Mind if I take a picture?",[["Mind if I","~해도 될까요?","허락을 구할 때 써요."]]],
        ["them","Sure, he loves the camera."],
        ["guest","Thanks. How old is he?"],
        ["them","He just turned five."]
      ] }]
  ]],
  ["주문 받기", [
    ["09:00", "메뉴 외우기", "bkstock", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "다른 직원",
      turns: [
        { say: "Morning! Today you take orders. Let's go over the menu first.", want: "메뉴가 많다며 천천히 설명해 달라고 하기", need: [["천천히",["slowly","slow down","step by step","one by one"]]], hint: ["There's so much! Can you go over it ~?","There's so much! Can…","There's so much! Can you go over it slowly?"], model: "There's so much! Can you go over it slowly?", chunk: ["go over","훑어보다","하나씩 같이 살펴볼 때 써요."] },
        { say: "Sure. Lattes come in small, medium, and large. And you can swap the milk.", want: "오트 우유는 추가 요금인지 묻기", need: [["추가 요금",["extra","extra charge","cost more","additional"]]], hint: ["Is oat milk ~?","Is oat…","Is oat milk extra?"], model: "Is oat milk extra?", chunk: ["Is ~ extra?","~는 추가 요금이에요?","옵션에 돈이 더 드는지 물을 때 써요."] },
        { say: "Yes, fifty cents. When customers order, always ask: 'For here or to go?'", want: "'for here'는 안에서 먹는다는 뜻이 맞는지 확인하기", need: [["안에서 먹음",["eat in","stay here","eat here","sit here"]]], hint: ["'For here' means they'll ~ in, right?","'For here' means…","'For here' means they'll eat in, right?"], model: "'For here' means they'll eat in, right?", chunk: ["For here or to go?","여기서 드세요, 가져가세요?","주문 끝에 꼭 묻는 질문이에요."] },
        { say: "Exactly. And what do you say if you didn't hear the order?", want: "정중하게 한 번 더 말해 달라고 하기", need: [["다시",["one more time","again","repeat"]]], hint: ["Sorry, could you say that one more ~?","Sorry, could you say…","Sorry, could you say that one more time?"], model: "Sorry, could you say that one more time?", chunk: ["one more time","한 번 더","못 들었을 때 써요."] },
        { say: "Perfect. You'll be great. Okay, doors open in five minutes.", want: "준비 다 됐다며 시작하자고 하기", need: [["준비",["all set","ready"]]], hint: ["Okay, I'm ~ set. Let's open!","Okay, I'm all…","Okay, I'm all set. Let's open!"], model: "Okay, I'm all set. Let's open!" }
      ],
      overhear: [
        ["guest","Olivia, we're almost out of oat milk.",[["almost out of","~가 거의 다 떨어진","재고가 거의 없을 때 써요."]]],
        ["them","Okay, I'll order more today."],
        ["guest","And the receipt paper is low too."],
        ["them","Got it. Can you put it on the list?",[["on the list","목록에","살 것·할 일을 목록에 적어 둘 때 써요."]]]
      ] }],
    ["12:00", "첫 주문 받기", "bkstudent", {
      who: "Danny", whoKo: "대학생 손님", voices: { them: "m", guest: "f" }, guestKo: "친구",
      turns: [
        { say: "Hi! Can I get a large iced latte, please?", want: "어떤 우유로 할지 묻기", need: [["우유",["milk"]],["어떤",["what kind","which","what type"]]], hint: ["Sure! What ~ of milk would you like?","Sure! What kind of…","Sure! What kind of milk would you like?"], model: "Sure! What kind of milk would you like?", chunk: ["What kind of ~?","어떤 종류의 ~요?","종류를 물을 때 써요."] },
        { say: "Oat milk, please. And do you have anything sweet?", want: "블루베리 머핀을 추천하고 오늘 구운 거라고 하기", need: [["추천",["recommend","suggest","try","good","popular"]],["머핀",["muffin","muffins"]]], hint: ["I ~ the blueberry muffin. It's fresh today.","I recommend the blueberry…","I recommend the blueberry muffin. It's fresh today."], model: "I recommend the blueberry muffin. It's fresh today." },
        { say: "Sounds good, I'll take one. That's all.", want: "주문 확인: 아이스 오트 라떼 큰 거랑 머핀 하나", need: [["라떼",["latte"]],["머핀",["muffin"]]], hint: ["So, a large iced oat ~ and one blueberry muffin?","So, a large iced…","So, a large iced oat latte and one blueberry muffin?"], model: "So, a large iced oat latte and one blueberry muffin?", chunk: ["So, ~?","그러니까 ~죠?","주문을 되풀이해 확인할 때 써요."] },
        { say: "Exactly. How much is that?", want: "합계가 11달러 50센트라고 하기", need: [["합계",["eleven fifty","11.50","11 50"]]], hint: ["That'll be ~ fifty.","That'll be…","That'll be eleven fifty."], model: "That'll be eleven fifty.", chunk: ["That'll be ~","~입니다","값을 말할 때 써요."] },
        { say: "Here's my card.", want: "단말기에 대 달라고, 이름을 불러 주겠다고 하기", need: [["부르기",["call your name","call you","call out"]]], hint: ["Just tap it here. I'll ~ your name when it's ready.","Just tap it here. I'll…","Just tap it here. I'll call your name when it's ready."], model: "Just tap it here. I'll call your name when it's ready." }
      ],
      overhear: [
        ["guest","Wait, what are you getting?"],
        ["them","Just a latte and a muffin. You?"],
        ["guest","Hmm, I can't decide between the tea and the cocoa.",[["can't decide between","~ 중에 못 정하겠어요","고르기 어려울 때 써요."]]],
        ["them","Get the cocoa. It's cold outside."]
      ] }],
    ["15:00", "수프와 차 주문", "bkwoman", {
      who: "Maria", whoKo: "단골 아주머니", voices: { them: "f2", guest: "m" }, guestKo: "아들",
      turns: [
        { say: "Hello, dear. Is there a soup of the day?", want: "오늘의 수프는 토마토 수프라고 하기", need: [["토마토",["tomato"]],["수프",["soup"]]], hint: ["Yes, today's soup is ~.","Yes, today's…","Yes, today's soup is tomato."], model: "Yes, today's soup is tomato." },
        { say: "Lovely. I'll have a cup. And a pot of green tea.", want: "차에 꿀이나 레몬을 넣을지 묻기", need: [["꿀",["honey"]],["레몬",["lemon"]]], hint: ["Would you like ~ or lemon with your tea?","Would you like honey…","Would you like honey or lemon with your tea?"], model: "Would you like honey or lemon with your tea?" },
        { say: "Honey, please. Oh, and is there a table by the window?", want: "창가 자리가 비어 있으니 편하게 앉으시라고 하기", need: [["창가",["window"]],["비어 있음",["free","open","empty","available"]]], hint: ["Yes, the ~ table is free. Go ahead and sit.","Yes, the window table…","Yes, the window table is free. Go ahead and sit."], model: "Yes, the window table is free. Go ahead and sit.", chunk: ["Go ahead","편하게 하세요","허락하거나 권할 때 써요."] },
        { say: "Wonderful. How much do I owe you?", want: "9달러라고, 자리로 가져다 드리겠다고 하기", need: [["9달러",["nine","9"]],["가져다줌",["bring"]]], hint: ["That's ~ dollars. I'll bring it to your table.","That's nine dollars. I'll…","That's nine dollars. I'll bring it to your table."], model: "That's nine dollars. I'll bring it to your table." },
        { say: "Thank you, sweetheart. You're new, aren't you?", want: "네, 어제가 첫 출근이었다고 하기", need: [["어제",["yesterday"]]], hint: ["Yes, ~ was my first day.","Yes, yesterday was…","Yes, yesterday was my first day."], model: "Yes, yesterday was my first day." }
      ],
      overhear: [
        ["guest","Mom, do you want me to carry your bag?"],
        ["them","No, I'm fine, dear. Just find us a table."],
        ["guest","Is this one okay, by the shelves?"],
        ["them","Perfect. Near the mystery books, my favorite.",[["my favorite","제일 좋아하는 거예요","좋아하는 것을 말할 때 써요."]]]
      ] }]
  ]],
  ["실수한 날", [
    ["10:30", "음료가 잘못 나온 손님", "bkstudent", {
      who: "Danny", whoKo: "대학생 손님", voices: { them: "m", guest: "f" }, guestKo: "친구",
      turns: [
        { say: "Hi, um, I think there's a mistake. I ordered an iced latte, but this is hot.", want: "죄송하다고, 바로 새로 만들어 주겠다고 하기", need: [["사과",["sorry","apologize","apologies"]],["새로",["new one","remake","fix"]]], hint: ["I'm so ~! Let me make you a new one.","I'm so sorry! Let…","I'm so sorry! Let me make you a new one."], model: "I'm so sorry! Let me make you a new one.", chunk: ["Let me ~","제가 ~할게요","직접 해결하겠다고 할 때 써요."] },
        { say: "Thanks. Also, I asked for oat milk, not regular milk.", want: "제 실수라고, 오트 우유로 만들겠다고 하기", need: [["오트",["oat"]],["실수",["my mistake","my bad","my fault"]]], hint: ["My ~. I'll make it with oat milk.","My mistake. I'll make…","My mistake. I'll make it with oat milk."], model: "My mistake. I'll make it with oat milk.", chunk: ["My mistake","제 실수예요","잘못을 바로 인정할 때 써요."] },
        { say: "No worries. How long will it take?", want: "2분이면 된다고 하기", need: [["2분",["two minutes","2 minutes","couple of minutes","few minutes"]]], hint: ["It'll only take ~ minutes.","It'll only…","It'll only take two minutes."], model: "It'll only take two minutes." },
        { say: "Okay. Can I sit while I wait?", want: "앉으시라고, 다 되면 알려 드리겠다고 하기", need: [["앉기",["seat","sit"]],["알려줌",["let you know","call you","tell you"]]], hint: ["Of course, have a ~. I'll let you know when it's done.","Of course, have a seat…","Of course, have a seat. I'll let you know when it's done."], model: "Of course, have a seat. I'll let you know when it's done." },
        { say: "Thanks. And hey, don't worry about it. Everyone messes up at first.", want: "이해해 줘서 고맙다고, 다음엔 더 조심하겠다고 하기", need: [["조심",["careful","more careful"]]], hint: ["Thanks for understanding. I'll be more ~ next time.","Thanks for understanding. I'll…","Thanks for understanding. I'll be more careful next time."], model: "Thanks for understanding. I'll be more careful next time.", chunk: ["next time","다음에는","실수 뒤에 다짐할 때 써요."] }
      ],
      overhear: [
        ["guest","Did you get your drink?"],
        ["them","Not yet, they're making it again."],
        ["guest","Oh no, what happened?"],
        ["them","Just a mix-up. No big deal.",[["mix-up","착오","주문이 뒤바뀐 일을 말해요."],["No big deal","별일 아니에요","괜찮다고 말해 줄 때 써요."]]]
      ] }],
    ["14:00", "Olivia와 실수 이야기", "bkstock", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "다른 직원",
      turns: [
        { say: "Hey, I heard about the latte mix-up. How are you feeling?", want: "속상하다고, 여기서 한 첫 실수라고 하기", need: [["속상",["bad","upset","terrible","sad","embarrassed"]]], hint: ["I feel ~. It was my first mistake here.","I feel bad. It…","I feel bad. It was my first mistake here."], model: "I feel bad. It was my first mistake here." },
        { say: "Don't. Honestly, everyone does it. What do you think went wrong?", want: "서둘러서 컵을 확인 안 했다고 하기", need: [["서두름",["rush","rushed","hurry","hurried"]]], hint: ["I was in a ~, so I didn't check the cup.","I was in a rush…","I was in a rush, so I didn't check the cup."], model: "I was in a rush, so I didn't check the cup.", chunk: ["in a rush","서둘러서","시간에 쫓길 때 써요."] },
        { say: "That's what I thought. Here, put a sticker on each cup. It helps.", want: "좋은 방법이라고, 해 보겠다고 하기", need: [["해 봄",["give it a try","try","use"]]], hint: ["Good idea. I'll give it a ~.","Good idea. I'll…","Good idea. I'll give it a try."], model: "Good idea. I'll give it a try.", chunk: ["give it a try","한번 해 보다","새 방법을 시도할 때 써요."] },
        { say: "Also, if you're not sure about an order, ask. A quick question is better than a wrong drink.", want: "맞다고, 이제부터 헷갈리면 바로 묻겠다고 하기", need: [["헷갈림",["not sure","unsure","confused"]]], hint: ["You're right. From now on, I'll ask when I'm ~ sure.","You're right. From now on…","You're right. From now on, I'll ask when I'm not sure."], model: "You're right. From now on, I'll ask when I'm not sure.", chunk: ["from now on","이제부터","다짐할 때 써요."] },
        { say: "That's the spirit. Now, go take a ten-minute break.", want: "잘 챙겨 줘서 고맙다고 하기", need: THANKS, hint: ["Thanks for being so ~ with me.","Thanks for being…","Thanks for being so patient with me."], model: "Thanks for being so patient with me." }
      ],
      overhear: [
        ["guest","Olivia, there's a spill by the window.",[["a spill","쏟은 것","액체를 엎질렀을 때 써요."]]],
        ["them","Okay, I'll grab the mop.",[["grab","가져오다","빨리 집어 올 때 써요."]]],
        ["guest","Do you need a hand?",[["need a hand","도움이 필요하다","손을 빌려줄지 물을 때 써요."]]],
        ["them","No, I've got it. Thanks!"]
      ] }],
    ["19:00", "Sara에게 하소연", "meetup", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
      turns: [
        { say: "There you are! How's the new job?", want: "쉽지 않다고, 오늘 실수를 했다고 하기", need: [["실수",["mistake","messed up"]]], hint: ["It's hard. I made a ~ today.","It's hard. I…","It's hard. I made a mistake today."], model: "It's hard. I made a mistake today." },
        { say: "Oh no. What happened?", want: "음료를 잘못 만들어서 손님이 기다렸다고 하기", need: [["잘못",["wrong"]],["기다림",["wait","waited","waiting"]]], hint: ["I made the ~ drink, and the customer had to wait.","I made the wrong drink…","I made the wrong drink, and the customer had to wait."], model: "I made the wrong drink, and the customer had to wait." },
        { say: "That's it? That's nothing! Did he get mad?", want: "아니, 오히려 친절했다고 하기", need: [["친절",["nice","kind","friendly","sweet"]]], hint: ["No, he was really ~ about it.","No, he was…","No, he was really nice about it."], model: "No, he was really nice about it." },
        { say: "See? People are more patient than you think. What did your manager say?", want: "스티커 붙이는 요령을 알려 줬다고 하기", need: [["스티커",["sticker","stickers"]]], hint: ["She taught me a trick. I put a ~ on each cup.","She taught me a trick…","She taught me a trick. I put a sticker on each cup."], model: "She taught me a trick. I put a sticker on each cup." },
        { say: "That's so smart. I'm proud of you!", want: "고맙다고, 너는 늘 기분을 낫게 해 준다고 하기", need: [["위로",["feel better","feels better","cheer me up"]]], hint: ["Thanks, Sara. You always make me ~ better.","Thanks, Sara. You always…","Thanks, Sara. You always make me feel better."], model: "Thanks, Sara. You always make me feel better.", chunk: ["make me feel better","기분이 나아지게 하다","위로받았을 때 써요."] }
      ],
      overhear: [
        ["guest","Sara, you're coming to trivia night, right?",[["trivia night","퀴즈 나이트","모임에서 퀴즈 대회를 하는 날이에요."]]],
        ["them","I wouldn't miss it.",[["I wouldn't miss it","꼭 갈 거예요","기대되는 행사에 써요."]]],
        ["guest","Great. Bring your friend too."],
        ["them","Good idea. We'll both come."]
      ] }]
  ]],
  ["단골손님", [
    ["10:00", "단골 아주머니", "bkwoman", {
      who: "Maria", whoKo: "단골 아주머니", voices: { them: "f2", guest: "m" }, guestKo: "아주머니의 친구",
      turns: [
        { say: "Good morning, dear! Remember me?", want: "물론 기억한다고, 창가에서 토마토 수프 드셨다고 하기", need: [["기억",["remember"]],["창가",["window"]]], hint: ["Of course I ~! You had tomato soup by the window.","Of course I remember! You…","Of course I remember! You had tomato soup by the window."], model: "Of course I remember! You had tomato soup by the window." },
        { say: "Aren't you sweet. Well, I'll have the same today.", want: "수프 한 컵과 꿀 넣은 녹차냐고 확인하기", need: [["꿀",["honey"]],["녹차",["green tea","tea"]]], hint: ["One cup of soup and green tea with ~?","One cup of soup…","One cup of soup and green tea with honey?"], model: "One cup of soup and green tea with honey?" },
        { say: "You remembered! Yes. And I'd like to try something new. What's popular?", want: "레몬 케이크가 제일 인기라고 하기", need: [["인기",["popular","favorite","best seller","bestseller"]],["레몬 케이크",["lemon cake","lemon"]]], hint: ["The lemon cake is our most ~.","The lemon cake…","The lemon cake is our most popular."], model: "The lemon cake is our most popular." },
        { say: "Lovely, I'll take a slice. By the way, what's your name, dear?", want: "이름을 말하고 만나서 반갑다고 하기", need: [["이름",["my name is","i'm","call me"]]], hint: ["My ~ is {name}. Nice to meet you!","My name is {name}…","My name is {name}. Nice to meet you!"], model: "My name is {name}. Nice to meet you!" },
        { say: "Nice to meet you. I'm Maria, and I come here every Tuesday.", want: "다음 화요일에 또 뵙길 기대한다고 하기", need: [["기대",["look forward","see you"]]], hint: ["I ~ forward to seeing you next Tuesday.","I look forward to…","I look forward to seeing you next Tuesday."], model: "I look forward to seeing you next Tuesday.", chunk: ["I look forward to","~를 기대해요","다음 만남을 기대할 때 써요."] }
      ],
      overhear: [
        ["guest","Maria! Long time no see!",[["Long time no see","오랜만이에요","오랜만에 만난 친구에게 써요."]]],
        ["them","Henry! Sit with me. I'm having cake."],
        ["guest","Don't mind if I do.",[["Don't mind if I do","그럼 사양 않고요","권유를 기쁘게 받을 때 써요."]]],
        ["them","You have to try the lemon one."]
      ] }],
    ["14:00", "할아버지 단골의 주문", "bkoldman", {
      who: "Mr. Walker", whoKo: "단골 할아버지", voices: { them: "m2", guest: "f" }, guestKo: "할아버지의 딸",
      turns: [
        { say: "Afternoon. The usual, please.", want: "처음이라 늘 드시는 게 뭔지 묻기", need: [["평소",["usual"]],["어떤",["what's","what","which"]]], hint: ["I'm new here. What's your ~?","I'm new here…","I'm new here. What's your usual?"], model: "I'm new here. What's your usual?", chunk: ["What's your usual?","늘 드시는 게 뭐예요?","단골이 주문한 걸 모를 때 물어요."] },
        { say: "Ah, a new face. Black coffee, medium, no sugar. Oh, and a croissant.", want: "크루아상을 데워 드릴지 묻기", need: [["데움",["warm","heat","heated"]],["크루아상",["croissant"]]], hint: ["Black coffee, medium. Should I ~ up the croissant?","Black coffee, medium. Should…","Black coffee, medium. Should I warm up the croissant?"], model: "Black coffee, medium. Should I warm up the croissant?" },
        { say: "Please. Warm, with butter.", want: "5분쯤 걸린다고 하기", need: [["5분",["five minutes","5 minutes"]]], hint: ["Coming up. It'll take about ~ minutes.","Coming up. It'll…","Coming up. It'll take about five minutes."], model: "Coming up. It'll take about five minutes." },
        { say: "No hurry. Say, do you know any good mystery novels? I've read everything here.", want: "모르겠지만 Olivia에게 물어봐 드리겠다고 하기", need: [["물어봄",["ask olivia","ask my manager","ask her","ask"]]], hint: ["I'm not sure, but I can ask Olivia for you.","I'm not sure, but…","I'm not sure, but I can ask Olivia for you."], model: "I'm not sure, but I can ask Olivia for you.", chunk: ["I can ask ~ for you","제가 ~에게 물어봐 드릴게요","직접 확인해 주겠다고 할 때 써요."] },
        { say: "Thank you, young one. I've been coming here for ten years.", want: "와, 10년이라니 대단하다고 하기", need: [["10년",["ten years","10 years"]],["대단",["wow","amazing","great","impressive"]]], hint: ["~, ten years? That's amazing.","Wow, ten…","Wow, ten years? That's amazing."], model: "Wow, ten years? That's amazing." }
      ],
      overhear: [
        ["guest","Dad, I brought your glasses.",[["I brought","제가 가져왔어요","챙겨 온 물건을 말할 때 써요."]]],
        ["them","Ah, thank you, I was looking everywhere.",[["looking everywhere","여기저기 찾는 중","물건을 찾아 헤맬 때 써요."]]],
        ["guest","They were in the car."],
        ["them","Of course they were. Sit down, sit down."]
      ] }],
    ["17:30", "Leo와 바리스타끼리", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, coworker from another shop! How's the bookstore?", want: "벌써 단골이 몇 분 생겼다고 하기", need: [["단골",["regular","regulars"]]], hint: ["Good! I already have a few ~.","Good! I already…","Good! I already have a few regulars."], model: "Good! I already have a few regulars.", chunk: ["regular","단골","자주 오는 손님이에요."] },
        { say: "Nice. Regulars are the best. Do you remember their orders?", want: "한 할아버지는 늘 블랙 커피와 크루아상이라고 하기", need: [["블랙 커피",["black coffee"]]], hint: ["One man always orders ~ coffee and a croissant.","One man always orders…","One man always orders black coffee and a croissant."], model: "One man always orders black coffee and a croissant." },
        { say: "Ha, that's how it starts. What else?", want: "한 아주머니는 화요일마다 수프와 꿀차라고 하기", need: [["화요일",["tuesday","tuesdays"]]], hint: ["A woman comes every ~ for soup and honey tea.","A woman comes every…","A woman comes every Tuesday for soup and honey tea."], model: "A woman comes every Tuesday for soup and honey tea." },
        { say: "You'll know everyone soon. My tip: learn their names.", want: "이미 메모장에 주문을 적어 둔다고 하기", need: [["적기",["writing down","write down","wrote down","notebook"]]], hint: ["I'm already ~ down their orders in my notebook.","I'm already writing down…","I'm already writing down their orders in my notebook."], model: "I'm already writing down their orders in my notebook." },
        { say: "Smart! Hey, come by for a free refill sometime.", want: "쉬는 날에 들르겠다고 하기", need: [["쉬는 날",["day off","days off"]]], hint: ["I will! Maybe on my ~ off.","I will! Maybe…","I will! Maybe on my day off."], model: "I will! Maybe on my day off.", chunk: ["day off","쉬는 날","일 안 하는 날이에요."] }
      ],
      overhear: [
        ["guest","Is the cafe open late tonight?",[["open late","늦게까지 열다","영업 시간을 물을 때 써요."]]],
        ["them","Until nine."],
        ["guest","Perfect. I'll come back after dinner."],
        ["them","Sounds good. See you then!"]
      ] }]
  ]],
  ["첫 월급", [
    ["10:00", "첫 월급 받기", "bkstock", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "다른 직원",
      turns: [
        { say: "Morning! Here's your first pay stub. Take a look.", want: "고맙다고, 여기서 받은 첫 월급이라고 하기", need: THANKS, hint: ["Thank you! It's my ~ paycheck here.","Thank you! It's…","Thank you! It's my first paycheck here."], model: "Thank you! It's my first paycheck here." },
        { say: "Look it over. Does everything look right?", want: "세금이 왜 빠졌는지 묻기", need: [["세금",["tax","taxes"]]], hint: ["Why was ~ taken out?","Why was…","Why was tax taken out?"], model: "Why was tax taken out?", chunk: ["taken out","빠져나간","월급에서 공제된 돈을 말해요."] },
        { say: "That's income tax. Everyone has it. You can get part of it back later.", want: "이해했다고, 설명해 줘서 고맙다고 하기", need: [["이해",["makes sense","understand","got it","i see"]]], hint: ["That ~ sense. Thanks for explaining.","That makes sense…","That makes sense. Thanks for explaining."], model: "That makes sense. Thanks for explaining." },
        { say: "Anytime. Also, you did great this week. Customers like you.", want: "칭찬이 큰 힘이 된다고, 계속 배우고 싶다고 하기", need: [["배우기",["learn","learning"]]], hint: ["That means a lot. I want to keep ~.","That means a lot…","That means a lot. I want to keep learning."], model: "That means a lot. I want to keep learning.", chunk: ["That means a lot","큰 힘이 돼요","칭찬·격려가 고마울 때 써요."] },
        { say: "Good. Want more hours next month? We're busy on weekends.", want: "네, 주말에 더 일하고 싶다고 하기", need: [["주말",["weekend","weekends"]],["더",["more"]]], hint: ["Yes, I'd love to work ~ on weekends.","Yes, I'd love to…","Yes, I'd love to work more on weekends."], model: "Yes, I'd love to work more on weekends." }
      ],
      overhear: [
        ["guest","Olivia, do I get paid on Friday or Monday?"],
        ["them","Friday, by direct deposit.",[["direct deposit","계좌 입금","월급을 은행 계좌로 바로 넣어 주는 거예요."]]],
        ["guest","Great. I need to pay my rent."],
        ["them","Don't we all!",[["Don't we all","다 그렇죠","공감할 때 써요."]]]
      ] }],
    ["13:00", "월급 입금 확인", "bank", {
      who: "Mr. Lewis", whoKo: "은행 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 고객",
      turns: [
        { say: "Good afternoon. What can I do for you?", want: "월급이 들어왔는지 확인해 달라고 하기", need: [["확인",["check","see","confirm"]],["월급",["pay","paycheck","salary","money"]]], hint: ["Can you ~ if my pay came in yet?","Can you check if…","Can you check if my pay came in yet?"], model: "Can you check if my pay came in yet?" },
        { say: "Sure. Yes, it's here. Four hundred and twenty dollars.", want: "그중 일부를 저축 계좌로 옮기고 싶다고 하기", need: [["저축",["savings"]],["옮기기",["move","transfer"]]], hint: ["Great. I want to ~ some of it to savings.","Great. I want to…","Great. I want to move some of it to savings."], model: "Great. I want to move some of it to savings.", chunk: ["move some of it to","그중 일부를 ~로 옮기다","돈 일부를 옮길 때 써요."] },
        { say: "No problem. How much would you like to move?", want: "100달러만 옮기겠다고 하기", need: [["100",["hundred","100"]]], hint: ["Just a ~ dollars.","Just a…","Just a hundred dollars."], model: "Just a hundred dollars." },
        { say: "Done. Also, your debit card should have arrived by now.", want: "받았다고, 주소도 바꿀 수 있는지 묻기", need: [["주소",["address"]],["바꾸기",["update","change"]]], hint: ["Yes, I got it. Can I ~ my address too?","Yes, I got it…","Yes, I got it. Can I update my address too?"], model: "Yes, I got it. Can I update my address too?" },
        { say: "Of course. Just fill out this form.", want: "펜을 빌릴 수 있는지 묻기", need: [["펜",["pen"]],["빌리기",["borrow","use"]]], hint: ["Sure. Could I ~ a pen?","Sure. Could I…","Sure. Could I borrow a pen?"], model: "Sure. Could I borrow a pen?" }
      ],
      overhear: [
        ["guest","Hi, I lost my debit card yesterday. Can I get a new one?",[["get a new one","새것을 받다","카드·열쇠를 다시 받을 때 써요."]]],
        ["them","I'm sorry to hear that. Let me block the old one first.",[["block","정지시키다","카드를 쓸 수 없게 막는 거예요."]]],
        ["guest","Please. How long for the new one?"],
        ["them","About five business days.",[["business days","영업일","주말·공휴일을 뺀 날이에요."]]]
      ] }],
    ["19:00", "월급으로 한턱내기", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Good evening! Table for how many?", want: "두 명이고 오늘은 내가 산다고 하기", need: [["두 명",["two","2"]],["사다",["treat","buy","paying"]]], hint: ["~, please. It's my treat tonight.","Two, please. It's…","Two, please. It's my treat tonight."], model: "Two, please. It's my treat tonight.", chunk: ["my treat","내가 살게요","한턱낼 때 써요."] },
        { say: "Lucky friend! Here are your menus. Any appetizer?", want: "나눠 먹을 샐러드로 시작하자고 하기", need: [["나눠",["share"]],["샐러드",["salad"]]], hint: ["Let's start with a ~ to share.","Let's start with…","Let's start with a salad to share."], model: "Let's start with a salad to share." },
        { say: "Great. And for your main?", want: "나는 연어, 친구는 버섯 파스타라고 하기", need: [["연어",["salmon"]],["파스타",["pasta"]]], hint: ["I'll have the ~, and my friend will have the mushroom pasta.","I'll have the salmon, and…","I'll have the salmon, and my friend will have the mushroom pasta."], model: "I'll have the salmon, and my friend will have the mushroom pasta." },
        { say: "Excellent. Is your friend arriving soon?", want: "곧 올 거라고, 물을 달라고 하기", need: [["물",["water"]],["곧",["soon","any minute","on her way","on the way"]]], hint: ["Yes, she'll be here ~. Could we have some water?","Yes, she'll be here…","Yes, she'll be here soon. Could we have some water?"], model: "Yes, she'll be here soon. Could we have some water?" },
        { say: "Of course. By the way, you look happy tonight.", want: "월급날이라 기분이 아주 좋다고 하기", need: [["월급날",["payday","paycheck","paid","salary"]]], hint: ["It's ~, and I'm in a great mood!","It's payday, and I'm…","It's payday, and I'm in a great mood!"], model: "It's payday, and I'm in a great mood!", chunk: ["in a great mood","기분이 아주 좋은","기분은 in a ~ mood로 말해요."] }
      ],
      overhear: [
        ["guest","Excuse me, is the soup of the day vegetarian?",[["vegetarian","채식","고기가 안 들어갔다는 뜻이에요."]]],
        ["them","Yes, it's a carrot ginger soup."],
        ["guest","Perfect. And can I get extra bread?",[["extra bread","빵 더","extra + 명사로 더 달라고 해요."]]],
        ["them","Sure thing."]
      ] }]
  ]]
]);
