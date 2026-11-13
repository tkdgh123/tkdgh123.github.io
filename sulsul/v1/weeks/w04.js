// 4주째 · 어학원 다니기 (22~28일째). 레벨 테스트를 보고 새 반에서 친구를 사귀고, 도서관·식당·주말 시장을 익힌다.
// 장면 = [시간, 이름, 그림 id, 대본]. 형식은 ~/sulsul-art/YEAR.md
WEEK(4, [
  ["레벨 테스트", [
    ["08:30", "학교 가는 지하철", "subway", {
      who: "Dan", whoKo: "역무원", voices: { them: "m", guest: "f" }, guestKo: "다른 승객",
      turns: [
        { say: "Morning! Where are you headed?", want: "어학원에 가는데 어느 노선을 타야 하는지 묻기", need: [["노선", ["line", "which train", "train", "platform"]]], hint: ["I'm going to my language school. Which ~ should I take?","I'm going to my…","I'm going to my language school. Which line should I take?"], model: "I'm going to my language school. Which line should I take?" },
        { say: "Which station is it?", want: "'Central Park' 역이라고 하기", need: [["Central Park", ["central park"]]], hint: ["It's ~ Station.","It's Central…","It's Central Park Station."], model: "It's Central Park Station." },
        { say: "Take the green line, three stops. Trains come every five minutes.", want: "세 정거장 맞는지 다시 확인하기", need: [["정거장", ["stops", "stop"]]], hint: ["So it's three ~, right?","So it's…","So it's three stops, right?"], model: "So it's three stops, right?" },
        { say: "Right. Do you have a student discount?", want: "아직 아니고 오늘 레벨 테스트를 본다고 하기", need: [["시험", ["test", "exam"]]], hint: ["Not yet. I'm taking my level ~ today.","Not yet. I'm…","Not yet. I'm taking my level test today."], model: "Not yet. I'm taking my level test today." },
        { say: "Good luck! Don't be nervous.", want: "고맙다고, 최선을 다하겠다고 하기", need: [["최선", ["do my best", "my best"]]], hint: ["Thanks! I'll ~.","Thanks! I'll…","Thanks! I'll do my best."], model: "Thanks! I'll do my best.", chunk: ["do my best","최선을 다하다","시험·발표 앞에서 자주 써요."] }
      ],
      overhear: [
        ["guest", "Does this train go to the airport?"],
        ["them", "No, you need to transfer at Main Street.", [["transfer","갈아타다","노선을 바꿔 탈 때 써요."]]],
        ["guest", "Which platform is that?"],
        ["them", "Platform two, up the stairs."]
      ] }],
    ["10:00", "시험 접수", "schooloffice", {
      who: "Karen", whoKo: "어학원 직원", voices: { them: "f", guest: "m2" }, guestKo: "다른 학생",
      turns: [
        { say: "Good morning! Are you here for the level test?", want: "네, 10시 반에 예약했다고 하기", need: [["예약", ["appointment", "booked", "reserved", "scheduled"]]], hint: ["Yes, I have an ~ at ten thirty.","Yes, I have…","Yes, I have an appointment at ten thirty."], model: "Yes, I have an appointment at ten thirty." },
        { say: "Great. First, please fill out this form.", want: "펜을 빌릴 수 있는지 묻기", need: [["펜", ["pen"]], ["빌림", ["borrow"]]], hint: ["Could I borrow a ~, please?","Could I…","Could I borrow a pen, please?"], model: "Could I borrow a pen, please?" },
        { say: "Of course. What's your goal for the year?", want: "말하기 실력을 늘리고 싶다고 하기", need: [["말하기", ["speaking", "speak"]]], hint: ["I want to improve my ~.","I want…","I want to improve my speaking."], model: "I want to improve my speaking.", chunk: ["improve my ~","~ 실력을 늘리다","나아지고 싶은 부분을 말할 때 써요."] },
        { say: "Good. The test has two parts: a short writing test, then a talk with a teacher.", want: "각 부분이 얼마나 걸리는지 묻기", need: [["걸림", ["take", "long"]]], hint: ["How long does each part ~?","How long…","How long does each part take?"], model: "How long does each part take?" },
        { say: "About twenty minutes each. Take a seat in room two.", want: "방이 복도 끝에 있는지 묻기", need: [["복도", ["hall", "hallway", "corridor"]]], hint: ["Is it at the end of the ~?","Is it at…","Is it at the end of the hall?"], model: "Is it at the end of the hall?", chunk: ["the end of ~","~의 끝","끝 위치를 말할 때 써요."] }
      ],
      overhear: [
        ["guest", "Hi, I'd like to sign up for the evening class.", [["evening class","저녁 반","수업 시간대는 morning, afternoon, evening으로 말해요."]]],
        ["them", "Sure. Have you taken the level test?"],
        ["guest", "Not yet. When is the next one?"],
        ["them", "Tomorrow at two."]
      ] }],
    ["11:00", "말하기 시험", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다음 학생",
      turns: [
        { say: "Hi! I'm Mr. Brown. Please, have a seat. Let's start with a few easy questions.", want: "고맙다고, 준비됐다고 하기", need: [["준비", ["ready"]]], hint: ["Thank you. I'm ~ when you are.","Thank you.…","Thank you. I'm ready when you are."], model: "Thank you. I'm ready when you are.", chunk: ["when you are","당신이 준비되면","상대에게 시작해도 된다고 할 때 써요."] },
        { say: "Can you tell me a little about yourself?", want: "대학생이고 한국에서 왔다고 하기", need: [["대학생", ["university student", "college student"]]], hint: ["I'm {name}, a ~ from Korea.","I'm {name},…","I'm {name}, a university student from Korea."], model: "I'm {name}, a university student from Korea." },
        { say: "Nice. What do you like to do in your free time?", want: "영화 보는 걸 좋아한다고 하기", need: [["영화", ["movies", "movie", "films"]]], hint: ["I like watching ~, and sometimes I go running.","I like watching…","I like watching movies, and sometimes I go running."], model: "I like watching movies, and sometimes I go running." },
        { say: "Great. Now, what did you do last weekend?", want: "새 집으로 이사했다고 하기", need: [["이사", ["moved", "move"]]], hint: ["I ~ to a new apartment.","I moved…","I moved to a new apartment."], model: "I moved to a new apartment." },
        { say: "Excellent. You're doing well. Any questions for me?", want: "결과가 언제 나오는지 묻기", need: [["결과", ["results", "result", "score"]]], hint: ["When will I get my ~?","When will…","When will I get my results?"], model: "When will I get my results?" }
      ],
      overhear: [
        ["guest", "Mr. Brown, I don't understand this word."],
        ["them", "Which one?"],
        ["guest", "'Reluctant.'"],
        ["them", "It means you don't want to do something.", [["It means","~라는 뜻이에요","뜻을 설명할 때 써요."]]]
      ] }]
  ]],
  ["새 반 첫날", [
    ["08:30", "첫날 아침 커피", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey! You're up early. Big day?", want: "네, 오늘이 새 반 첫날이라고 하기", need: [["첫날", ["first day"]]], hint: ["Yes, it's my ~ in a new class.","Yes, it's my…","Yes, it's my first day in a new class."], model: "Yes, it's my first day in a new class." },
        { say: "Awesome! Nervous?", want: "조금, 하지만 대부분 설렌다고 하기", need: [["설렘", ["excited"]]], hint: ["A little, but mostly ~.","A little,…","A little, but mostly excited."], model: "A little, but mostly excited." },
        { say: "That's the spirit. What can I get you?", want: "작은 라테를 가져갈 거라고 하기", need: [["가져감", ["to go", "take away", "takeaway"]]], hint: ["A small latte ~, please.","A small…","A small latte to go, please."], model: "A small latte to go, please." },
        { say: "Hot or iced?", want: "따뜻하게, 시럽은 빼 달라고 하기", need: [["시럽", ["syrup"]]], hint: ["Hot, and no ~, please.","Hot, and…","Hot, and no syrup, please."], model: "Hot, and no syrup, please." },
        { say: "Here you go. Good luck today!", want: "고맙다고, 어땠는지 나중에 말해 주겠다고 하기", need: [["말해 줌", ["tell you", "let you know"]]], hint: ["Thanks! I'll ~ how it goes.","Thanks! I'll…","Thanks! I'll tell you how it goes."], model: "Thanks! I'll tell you how it goes.", chunk: ["how it goes","어떻게 됐는지","결과를 나중에 알려 줄 때 써요."] }
      ],
      overhear: [
        ["guest", "Do you have anything with no dairy?"],
        ["them", "The almond latte is dairy-free.", [["dairy-free","유제품 없는","-free는 '~가 없는'이에요."]]],
        ["guest", "Great. And a muffin, please."],
        ["them", "Blueberry or banana?"]
      ] }],
    ["09:30", "자기소개와 첫 수업", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "반 친구",
      turns: [
        { say: "Good morning, everyone! Welcome to Level 3. Let's start with names. And you are?", want: "이름을 말하고 한국에서 왔다고 하기", need: [["한국", ["korea", "korean"]]], hint: ["My name is {name}. I come from ~.","My name is…","My name is {name}. I come from Korea."], model: "My name is {name}. I come from Korea." },
        { say: "Welcome! Why are you studying English?", want: "언젠가 여기서 일하고 싶어서라고 하기", need: [["일", ["work"]]], hint: ["Because I want to ~ here one day.","Because I want…","Because I want to work here one day."], model: "Because I want to work here one day." },
        { say: "Great goal. Everyone, open your books to page twelve.", want: "책이 없어서 누구랑 같이 봐도 되는지 묻기", need: [["같이", ["share"]]], hint: ["I don't have my book. Can I ~ with someone?","I don't have my…","I don't have my book. Can I share with someone?"], model: "I don't have my book. Can I share with someone?" },
        { say: "Sure, share with your neighbor. Now, who can tell me what 'borrow' means?", want: "저 해 봐도 되냐고 하기", need: [["해 봄", ["try"]]], hint: ["Can I ~?","Can I…","Can I try?"], model: "Can I try?" },
        { say: "Go ahead.", want: "'뭔가를 쓰고 다시 돌려주는 거예요'라고 답하기", need: [["돌려줌", ["give it back", "return", "back"]]], hint: ["It means to use something and ~.","It means to…","It means to use something and give it back."], model: "It means to use something and give it back." }
      ],
      overhear: [
        ["guest", "Mr. Brown, can you repeat the question?", [["Can you repeat ~?","~ 다시 말해 줄래요?","못 알아들었을 때 써요."]]],
        ["them", "Of course. What did you do yesterday?"],
        ["guest", "I went to the park with my friend."],
        ["them", "Very good. Remember the past tense.", [["the past tense","과거 시제","어제 일을 말할 때 써요."]]]
      ] }],
    ["12:30", "첫날 점심", "foodtruck", {
      who: "Carlos", whoKo: "푸드트럭 사장님", voices: { them: "m2", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, my friend! You look hungry. School day?", want: "응, 첫 수업이 방금 끝났고 배고프다고 하기", need: [["배고픔", ["hungry", "starving"]]], hint: ["Yes, my first class just ended, and I'm ~.","Yes, my first…","Yes, my first class just ended, and I'm starving."], model: "Yes, my first class just ended, and I'm starving." },
        { say: "Ha! Congrats. What'll it be?", want: "오늘의 메뉴가 뭔지 묻기", need: [["오늘의", ["today's special", "special"]]], hint: ["What's ~?","What's today's…","What's today's special?"], model: "What's today's special?" },
        { say: "Chicken quesadillas, with rice. Ten dollars.", want: "닭고기 말고 치즈만 든 것도 되는지 묻기", need: [["치즈", ["cheese"]]], hint: ["Can I get just ~, no chicken?","Can I…","Can I get just cheese, no chicken?"], model: "Can I get just cheese, no chicken?" },
        { say: "Sure, no problem. For here or to go?", want: "여기서 먹겠다고 하기", need: [["여기서", ["for here", "eat here", "here"]]], hint: ["~, please.","For here,…","For here, please."], model: "For here, please." },
        { say: "Great. Take a seat. I'll bring it over.", want: "반 친구들이 곧 합류할 거라고 하기", need: [["친구", ["classmates", "friends"]]], hint: ["My ~ will join me soon.","My classmates…","My classmates will join me soon."], model: "My classmates will join me soon.", chunk: ["join me","같이 앉다","함께할 때 써요."] }
      ],
      overhear: [
        ["guest", "How long is the wait?", [["How long is the wait?","얼마나 기다려요?","대기 시간을 물을 때 써요."]]],
        ["them", "About ten minutes."],
        ["guest", "That's fine. I'll take a table."],
        ["them", "Great. I'll call your number."]
      ] }]
  ]],
  ["반 친구들", [
    ["12:30", "Yuki와 첫 대화", "yuki", {
      who: "Yuki", whoKo: "일본인 반 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 학생",
      turns: [
        { say: "Hi! You're in my class, right? I'm Yuki.", want: "맞다고, 같은 반이라 기쁘다고 하기", need: [["같은 반", ["same class", "in my class", "classmate"]]], hint: ["Yes! I'm glad we're in the ~.","Yes! I'm glad…","Yes! I'm glad we're in the same class."], model: "Yes! I'm glad we're in the same class." },
        { say: "Me too! Where are you from?", want: "서울 출신이라고 하고, 너는 어디냐고 되묻기", need: [["서울", ["seoul"]]], hint: ["I'm from ~. How about you?","I'm from…","I'm from Seoul. How about you?"], model: "I'm from Seoul. How about you?", chunk: ["How about you?","당신은요?","같은 질문을 되물을 때 써요."] },
        { say: "I'm from Osaka, in Japan. Is this your first time in the city?", want: "아니, 작년에 와서 좋아서 다시 왔다고 하기", need: [["작년", ["last year"]]], hint: ["No, I visited ~ and loved it, so I came back.","No, I visited last…","No, I visited last year and loved it, so I came back."], model: "No, I visited last year and loved it, so I came back." },
        { say: "That's so cool. I miss my family a little. Do you?", want: "가끔 그립지만 매주 영상통화를 한다고 하기", need: [["영상통화", ["video call", "video calls", "video chat", "facetime"]]], hint: ["Sometimes, but we have ~ every week.","Sometimes, but we…","Sometimes, but we have video calls every week."], model: "Sometimes, but we have video calls every week.", chunk: ["miss ~","~가 그립다","가족·친구가 보고 싶을 때 써요."] },
        { say: "Same! Hey, want to study together sometime?", want: "좋다고, 번호를 주고받자고 하기", need: [["번호", ["number", "numbers"]]], hint: ["Sure! Let's exchange ~.","Sure! Let's…","Sure! Let's exchange numbers."], model: "Sure! Let's exchange numbers.", chunk: ["exchange numbers","번호를 주고받다","연락처를 나눌 때 써요."] }
      ],
      overhear: [
        ["guest", "Yuki, did you finish the reading?"],
        ["them", "Not yet. It's so long!"],
        ["guest", "Me neither. Let's do it together at lunch.", [["Me neither","나도 못 했어요","부정문에 맞장구칠 때 써요."]]],
        ["them", "Okay, sounds like a plan.", [["sounds like a plan","좋은 계획이에요","제안에 동의할 때 써요."]]]
      ] }],
    ["15:00", "스터디 모임 초대", "team", {
      who: "Noah", whoKo: "같은 반 학생", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Hey, I saw you in class. I'm Noah. Want to join our study group?", want: "고맙다고, 몇 명이냐고 묻기", need: [["몇 명", ["how many"]]], hint: ["Thanks! ~ people are in it?","Thanks! How…","Thanks! How many people are in it?"], model: "Thanks! How many people are in it?" },
        { say: "Four of us. We meet here on Tuesdays and Thursdays.", want: "보통 몇 시에 만나는지 묻기", need: [["몇 시", ["what time"]]], hint: ["~ do you usually meet?","What time…","What time do you usually meet?"], model: "What time do you usually meet?" },
        { say: "Around three, after class. Is that good for you?", want: "화요일은 괜찮은데 목요일은 바쁘다고 하기", need: [["바쁨", ["busy"]]], hint: ["Tuesdays are fine, but I'm ~ on Thursdays.","Tuesdays are fine,…","Tuesdays are fine, but I'm busy on Thursdays."], model: "Tuesdays are fine, but I'm busy on Thursdays." },
        { say: "No problem. Just come when you can. What do you want to practice?", want: "발음이 걱정이라고 하기", need: [["발음", ["pronunciation"]]], hint: ["I'm worried about my ~.","I'm worried…","I'm worried about my pronunciation."], model: "I'm worried about my pronunciation.", chunk: ["worried about","~가 걱정이에요","걱정되는 점을 말할 때 써요."] },
        { say: "Don't worry, we'll help each other. Let me add you to the group chat.", want: "좋다고, 어떤 앱을 쓰는지 묻기", need: [["앱", ["app"]]], hint: ["Great! Which ~ do you use?","Great! Which…","Great! Which app do you use?"], model: "Great! Which app do you use?" }
      ],
      overhear: [
        ["guest", "Noah, can you explain this grammar?"],
        ["them", "Sure. Let's look at an example."],
        ["guest", "Oh, I get it now!", [["I get it","이해했어요","설명이 이해됐을 때 써요."]]],
        ["them", "Great. Try making your own sentence."]
      ] }],
    ["19:00", "Sara에게 친구 자랑", "meetup", {
      who: "Sara", whoKo: "모임에서 만난 친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
      turns: [
        { say: "There you are! How was class this week?", want: "재미있었다고, 일본 친구를 사귀었다고 하기", need: [["친구", ["friend", "friends"]]], hint: ["It was fun. I made a ~ from Japan.","It was fun.…","It was fun. I made a friend from Japan."], model: "It was fun. I made a friend from Japan.", chunk: ["make a friend","친구를 사귀다","사귀다는 make를 써요."] },
        { say: "Already? That was fast. What's she like?", want: "정말 친절하고 늘 웃는다고 하기", need: [["친절", ["friendly", "kind", "nice", "sweet"]]], hint: ["She's really ~ and always smiling.","She's really…","She's really friendly and always smiling."], model: "She's really friendly and always smiling." },
        { say: "I'd love to meet her. Are you free this weekend?", want: "토요일에 시장에 가는데 같이 가자고 하기", need: [["시장", ["market"]]], hint: ["I'm going to the ~ on Saturday. Come with me!","I'm going to the…","I'm going to the market on Saturday. Come with me!"], model: "I'm going to the market on Saturday. Come with me!" },
        { say: "Yes! What time?", want: "아침 열 시쯤이라고 하기", need: [["열 시", ["ten", "10"]]], hint: ["Around ~ in the morning.","Around ten…","Around ten in the morning."], model: "Around ten in the morning." },
        { say: "Perfect. Want to grab dinner now? I'm hungry.", want: "좋다고, 모퉁이에 새 식당이 있다고 하기", need: [["새 식당", ["new place", "new restaurant"]]], hint: ["Sure! There's a ~ around the corner.","Sure! There's a…","Sure! There's a new place around the corner."], model: "Sure! There's a new place around the corner." }
      ],
      overhear: [
        ["guest", "Is anyone sitting here?"],
        ["them", "No, go ahead."],
        ["guest", "Thanks. Are you new to the group?"],
        ["them", "Kind of. I joined last month.", [["Kind of","조금 그래요","딱 잘라 말하기 어려울 때 써요."]]]
      ] }]
  ]],
  ["도서관 카드", [
    ["09:00", "아침 산책", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Good morning! You're out early.", want: "도서관 가기 전에 산책 중이라고 하기", need: [["산책", ["walk", "walking"]]], hint: ["I'm taking a ~ before I go to the library.","I'm taking a walk…","I'm taking a walk before I go to the library."], model: "I'm taking a walk before I go to the library." },
        { say: "Nice. The campus library is lovely. Do you have a card?", want: "아니, 오늘 만들 거라고 하기", need: [["만들", ["get one", "make one", "apply", "sign up"]]], hint: ["No, I'm going to ~ today.","No, I'm…","No, I'm going to get one today."], model: "No, I'm going to get one today." },
        { say: "Bring your student ID and a photo ID.", want: "학생증은 아직이라 여권을 가져간다고 하기", need: [["여권", ["passport"]]], hint: ["My student ID isn't ready yet, so I'll bring my ~.","My student ID isn't…","My student ID isn't ready yet, so I'll bring my passport."], model: "My student ID isn't ready yet, so I'll bring my passport." },
        { say: "That should work. How many books can you borrow?", want: "잘 모르니 거기서 물어보겠다고 하기", need: [["물어봄", ["ask"]]], hint: ["I'm not sure. I'll ~ there.","I'm not…","I'm not sure. I'll ask there."], model: "I'm not sure. I'll ask there." },
        { say: "Good luck! Max says hi.", want: "Max한테 안부 전해 달라고 하기", need: [["Max", ["max"]]], hint: ["Say hi to ~ for me!","Say hi…","Say hi to Max for me!"], model: "Say hi to Max for me!" }
      ],
      overhear: [
        ["guest", "Is it okay if he plays here without a leash?", [["leash","목줄","강아지를 묶는 줄이에요."]]],
        ["them", "Yes, this area is off-leash.", [["off-leash","목줄 없이 되는","공원 구역 규칙을 말할 때 써요."]]],
        ["guest", "Great, thank you."],
        ["them", "Just clean up after him.", [["clean up after","뒤처리하다","강아지 배설물을 치울 때 써요."]]]
      ] }],
    ["11:00", "도서관 카드 만들기", "library", {
      who: "Henry", whoKo: "사서", voices: { them: "m2", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Good morning. How can I help?", want: "도서관 카드를 만들고 싶다고 하기", need: [["도서관 카드", ["library card"]]], hint: ["I'd like to get a ~.","I'd like…","I'd like to get a library card."], model: "I'd like to get a library card." },
        { say: "Of course. May I see some ID?", want: "여권을 건네며 학생증은 다음 주에 나온다고 하기", need: [["다음 주", ["next week"]]], hint: ["Here's my passport. My student ID comes ~.","Here's my passport.…","Here's my passport. My student ID comes next week."], model: "Here's my passport. My student ID comes next week." },
        { say: "That's fine. Fill out this form, please. Name and address.", want: "주소를 어디에 쓰는지 묻기", need: [["어디", ["where"]]], hint: ["~ do I write my address?","Where do…","Where do I write my address?"], model: "Where do I write my address?" },
        { say: "Right here. Done. This card lets you borrow up to ten books for three weeks.", want: "늦게 반납하면 어떻게 되는지 묻기", need: [["늦게", ["late", "overdue"]]], hint: ["What happens if I return a book ~?","What happens if…","What happens if I return a book late?"], model: "What happens if I return a book late?", chunk: ["overdue","반납 기한이 지난","연체된 책에 써요."] },
        { say: "There's a small fine, fifty cents a day. You can renew online.", want: "알겠다고, 영어 학습 책이 어디 있는지 묻기", need: [["영어", ["english"]], ["어디", ["where"]]], hint: ["Got it. Where are the ~ learning books?","Got it. Where…","Got it. Where are the English learning books?"], model: "Got it. Where are the English learning books?" }
      ],
      overhear: [
        ["guest", "Excuse me, where can I print something?"],
        ["them", "Second floor, next to the computers."],
        ["guest", "How much per page?", [["per page","한 장에","가격은 per로 단위를 붙여요."]]],
        ["them", "Ten cents. You pay with your library card."]
      ] }],
    ["19:00", "책 읽으며 저녁", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Good evening! Just one tonight?", want: "네, 밥 먹으면서 책을 읽어도 되는지 묻기", need: [["읽기", ["read", "reading"]]], hint: ["Yes. Is it okay if I ~ while I eat?","Yes. Is it okay…","Yes. Is it okay if I read while I eat?"], model: "Yes. Is it okay if I read while I eat?" },
        { say: "Of course! Quiet corner table?", want: "좋다고, 창가 자리면 더 좋겠다고 하기", need: [["창가", ["by the window", "window"]]], hint: ["Yes, please. A table ~ would be great.","Yes, please. A table…","Yes, please. A table by the window would be great."], model: "Yes, please. A table by the window would be great." },
        { say: "Sure. What would you like?", want: "오늘의 수프와 작은 샐러드를 달라고 하기", need: [["수프", ["soup"]], ["샐러드", ["salad"]]], hint: ["I'll have today's ~ and a small salad.","I'll have today's…","I'll have today's soup and a small salad."], model: "I'll have today's soup and a small salad." },
        { say: "Sure. Would you like bread with it?", want: "네, 버터도 달라고 하기", need: [["버터", ["butter"]]], hint: ["Yes, with some ~, please.","Yes, with…","Yes, with some butter, please."], model: "Yes, with some butter, please." },
        { say: "Coming right up.", want: "물을 좀 더 달라고 하기", need: [["물", ["water"]], ["더", ["more", "another"]]], hint: ["Could I have some more ~?","Could I…","Could I have some more water?"], model: "Could I have some more water?", chunk: ["some more","좀 더","추가를 부탁할 때 써요."] }
      ],
      overhear: [
        ["guest", "Can I get this to go? Something came up.", [["Something came up","일이 생겼어요","급한 일이 생겼을 때 써요."]]],
        ["them", "No problem. I'll box it up.", [["box it up","상자에 담다","남은 음식을 포장할 때 써요."]]],
        ["guest", "Thank you. And the check, please."],
        ["them", "Right away."]
      ] }]
  ]],
  ["숙제 묻기", [
    ["12:00", "숙제 확인", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "반 친구",
      turns: [
        { say: "That's all for today. Any questions before you go?", want: "숙제가 뭐였는지 다시 묻기", need: [["숙제", ["homework"]]], hint: ["What's the ~ again?","What's the…","What's the homework again?"], model: "What's the homework again?" },
        { say: "Write a short paragraph about your weekend plans.", want: "몇 단어를 써야 하는지 묻기", need: [["단어", ["words", "word"]]], hint: ["How many ~ should I write?","How many…","How many words should I write?"], model: "How many words should I write?" },
        { say: "About a hundred. Is that okay?", want: "괜찮다고, 마감이 언제인지 묻기", need: [["마감", ["due", "deadline"]]], hint: ["That's fine. When is it ~?","That's fine.…","That's fine. When is it due?"], model: "That's fine. When is it due?" },
        { say: "Monday morning. You can email it to me.", want: "칠판에 이메일 주소를 써 달라고 하기", need: [["이메일", ["email"]]], hint: ["Could you write your ~ on the board?","Could you write…","Could you write your email on the board?"], model: "Could you write your email on the board?" },
        { say: "Sure. Here you go. And don't forget to use the new words.", want: "알겠다고, 월요일에 보자고 하기", need: [["월요일", ["monday"]]], hint: ["I won't. See you ~!","I won't.…","I won't. See you Monday!"], model: "I won't. See you Monday!" }
      ],
      overhear: [
        ["guest", "Mr. Brown, can I hand it in late?", [["hand it in","제출하다","과제를 낼 때 써요."]]],
        ["them", "One day late is okay, but please tell me."],
        ["guest", "Understood. Thank you!"],
        ["them", "No problem. Take care."]
      ] }],
    ["14:00", "같이 숙제하기", "yuki", {
      who: "Yuki", whoKo: "일본인 반 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 학생",
      turns: [
        { say: "Hi! Did you do the homework yet?", want: "아직이라고, 어려워 보인다고 하기", need: [["어려움", ["difficult", "hard", "tough"]]], hint: ["Not yet. It looks ~.","Not yet.…","Not yet. It looks difficult."], model: "Not yet. It looks difficult." },
        { say: "I know! I'm stuck on the first sentence.", want: "같이 하자고 하기", need: [["같이", ["together"]]], hint: ["Let's do it ~.","Let's do…","Let's do it together."], model: "Let's do it together." },
        { say: "Okay! What are you doing this weekend?", want: "토요일엔 호수에 가고 일요일엔 쉰다고 하기", need: [["쉼", ["relax", "rest", "chill"]]], hint: ["I'll visit the lake on Saturday and ~ on Sunday.","I'll visit the lake…","I'll visit the lake on Saturday and relax on Sunday."], model: "I'll visit the lake on Saturday and relax on Sunday." },
        { say: "Sounds nice. I'll write about my weekend too. Where should we write?", want: "도서관이 조용해서 좋다고 하기", need: [["조용", ["quiet"]]], hint: ["Good idea. The library is so ~.","Good idea.…","Good idea. The library is so quiet."], model: "Good idea. The library is so quiet." },
        { say: "Great, let's go after lunch.", want: "그럼 한 시에 로비에서 보자고 하기", need: [["로비", ["lobby", "entrance"]]], hint: ["Okay, let's meet in the ~ at one.","Okay, let's meet…","Okay, let's meet in the lobby at one."], model: "Okay, let's meet in the lobby at one." }
      ],
      overhear: [
        ["guest", "Yuki, can I copy your notes?", [["copy your notes","필기를 베끼다","친구의 필기를 빌려 쓸 때 써요."]]],
        ["them", "Sure, but I wrote them quickly."],
        ["guest", "That's fine. I can read it."],
        ["them", "Okay, here you go."]
      ] }],
    ["16:00", "발표하듯 읽기", "team", {
      who: "Noah", whoKo: "같은 반 학생", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Okay, who wants to read their paragraph first?", want: "내가 먼저 해도 되는지 묻기", need: [["먼저", ["first"]]], hint: ["I can go ~, if that's okay.","I can…","I can go first, if that's okay."], model: "I can go first, if that's okay." },
        { say: "Go ahead.", want: "틀린 곳이 들리면 알려 달라고 하기", need: [["틀린", ["mistakes", "mistake", "wrong", "errors"]]], hint: ["Please tell me if you hear any ~.","Please tell me…","Please tell me if you hear any mistakes."], model: "Please tell me if you hear any mistakes." },
        { say: "It was good! But you said 'I go to the lake yesterday.'", want: "'went'가 맞는지 확인하기", need: [["went", ["went", "'went'"]]], hint: ["Oh, it should be ~, right?","Oh, it…","Oh, it should be 'went', right?"], model: "Oh, it should be 'went', right?" },
        { say: "Exactly! Past tense. You noticed quickly.", want: "고맙다고, 이런 실수를 자주 한다고 하기", need: [["자주", ["often", "a lot", "always"]]], hint: ["Thanks. I ~ make that mistake.","Thanks. I…","Thanks. I often make that mistake."], model: "Thanks. I often make that mistake.", chunk: ["make a mistake","실수하다","실수는 make를 써요."] },
        { say: "Everybody does. Now it's my turn, so please listen.", want: "물론이라고, 천천히 읽어 달라고 하기", need: [["천천히", ["slowly", "slow"]]], hint: ["Of course. Please read ~.","Of course.…","Of course. Please read slowly."], model: "Of course. Please read slowly." }
      ],
      overhear: [
        ["guest", "Can I check my answer with you?"],
        ["them", "Sure. What did you write for number three?"],
        ["guest", "I wrote 'has'. Is that right?"],
        ["them", "Close! It should be 'have'.", [["It should be","~가 맞아요","정답을 고쳐 줄 때 써요."]]]
      ] }]
  ]],
  ["학교 식당", [
    ["12:00", "학교 식당에서 주문", "cafeteria", {
      who: "Rita", whoKo: "식당 직원", voices: { them: "f2", guest: "m" }, guestKo: "다음 학생",
      turns: [
        { say: "Hello, dear! First time in the cafeteria?", want: "네, 오늘 뭐가 맛있는지 묻기", need: [["맛있", ["good", "best", "recommend"]]], hint: ["Yes. What's ~ today?","Yes. What's…","Yes. What's good today?"], model: "Yes. What's good today?" },
        { say: "The pasta is popular. Or the chicken soup, if you want something light.", want: "작은 파스타에 채소를 같이 달라고 하기", need: [["작은", ["small", "half"]]], hint: ["I'll have the ~ pasta, with some vegetables.","I'll have the…","I'll have the small pasta, with some vegetables."], model: "I'll have the small pasta, with some vegetables." },
        { say: "Sure. Sauce on the pasta? Tomato or cream.", want: "토마토 소스로 달라고 하기", need: [["토마토", ["tomato"]]], hint: ["~, please.","Tomato, please.…","Tomato, please."], model: "Tomato, please." },
        { say: "Okay. Drink? Water is free, juice is a dollar.", want: "주스는 어떤 맛이 있는지 묻기", need: [["맛", ["flavors", "flavor", "kinds", "kind"]]], hint: ["What ~ of juice do you have?","What flavors…","What flavors of juice do you have?"], model: "What flavors of juice do you have?" },
        { say: "Apple, orange, and grape. That's six fifty total. Tap your card here.", want: "카드가 안 되는 것 같다고 하기", need: [["안 됨", ["isn't working", "not working", "doesn't work", "won't work"]]], hint: ["I think my card ~.","I think…","I think my card isn't working."], model: "I think my card isn't working.", chunk: ["tap your card","카드를 대세요","터치 결제는 tap을 써요."] }
      ],
      overhear: [
        ["guest", "Is the soup vegetarian?", [["vegetarian","채식","고기가 안 들어간 음식이에요."]]],
        ["them", "Yes, it has no meat."],
        ["guest", "Perfect. A large one, please."],
        ["them", "Coming up."]
      ] }],
    ["15:00", "주말 약속", "yuki", {
      who: "Yuki", whoKo: "일본인 반 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 학생",
      turns: [
        { say: "Hi! How was lunch?", want: "맛있었는데 조금 짰다고 하기", need: [["짬", ["salty"]]], hint: ["It was good, but a bit ~.","It was…","It was good, but a bit salty."], model: "It was good, but a bit salty." },
        { say: "Yeah, the soup is always salty. What did you eat?", want: "토마토 파스타였다고 하기", need: [["파스타", ["pasta"]]], hint: ["Tomato ~. It wasn't bad.","Tomato pasta.…","Tomato pasta. It wasn't bad."], model: "Tomato pasta. It wasn't bad." },
        { say: "I'm bringing lunch from home next week. Want to try my onigiri?", want: "그게 뭐냐고 묻기", need: [["뭐", ["what"]]], hint: ["~ is onigiri?","What is…","What is onigiri?"], model: "What is onigiri?" },
        { say: "It's a rice ball with a filling inside. It's like a Japanese sandwich.", want: "먹어 보고 싶다고, 다음엔 김밥을 싸 오겠다고 하기", need: [["김밥", ["gimbap", "kimbap"]]], hint: ["I'd love to try one. I'll bring ~ next time.","I'd love to try…","I'd love to try one. I'll bring gimbap next time."], model: "I'd love to try one. I'll bring gimbap next time.", chunk: ["next time","다음에","다음 기회를 말할 때 써요."] },
        { say: "Yay! Oh, by the way, are you free on Saturday? There's a weekend market by the lake.", want: "재밌겠다고, 같이 가고 싶다고 하기", need: [["같이", ["with you", "come"]]], hint: ["Sounds fun. I'd love to come ~.","Sounds fun. I'd…","Sounds fun. I'd love to come with you."], model: "Sounds fun. I'd love to come with you." }
      ],
      overhear: [
        ["guest", "Is the library open on weekends?"],
        ["them", "Only on Saturdays, until noon.", [["until noon","정오까지","끝나는 시간은 until을 써요."]]],
        ["guest", "Good to know."],
        ["them", "You're welcome."]
      ] }],
    ["18:00", "학교 끝나고 운동", "gym", {
      who: "Tyler", whoKo: "헬스장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 회원",
      turns: [
        { say: "Hey! Back again. How was school?", want: "좋았다고, 오늘은 상체 운동을 하고 싶다고 하기", need: [["상체", ["upper body", "arms", "chest"]]], hint: ["Good! I want to work on my ~ today.","Good! I want to…","Good! I want to work on my upper body today."], model: "Good! I want to work on my upper body today." },
        { say: "Cool. Let's start with push-ups. How many can you do?", want: "열 개쯤 할 수 있다고 하기", need: [["열", ["ten", "10"]]], hint: ["Maybe ~, if I try hard.","Maybe ten,…","Maybe ten, if I try hard."], model: "Maybe ten, if I try hard." },
        { say: "Great. Do ten, then rest for a minute.", want: "쉬는 동안 물을 마셔도 되는지 묻기", need: [["물", ["water"]]], hint: ["Can I drink some ~ while I rest?","Can I drink…","Can I drink some water while I rest?"], model: "Can I drink some water while I rest?" },
        { say: "Of course. Hydration is important.", want: "지난주보다 쉬워지고 있다고 하기", need: [["쉬워짐", ["easier", "easy"]]], hint: ["It's getting ~ than last week.","It's getting…","It's getting easier than last week."], model: "It's getting easier than last week." },
        { say: "That's the progress. Same time next week?", want: "네, 다음 주엔 더 무겁게 해 보겠다고 하기", need: [["무겁게", ["heavier", "more weight"]]], hint: ["Yes, and I'll try ~ weights next week.","Yes, and I'll…","Yes, and I'll try heavier weights next week."], model: "Yes, and I'll try heavier weights next week." }
      ],
      overhear: [
        ["guest", "Is this machine free?"],
        ["them", "Yes, go ahead.", [["go ahead","하세요","양보하거나 허락할 때 써요."]]],
        ["guest", "How do I adjust the seat?", [["adjust","조절하다","높이·길이를 맞출 때 써요."]]],
        ["them", "Pull the lever and slide it."]
      ] }]
  ]],
  ["주말 시장", [
    ["10:00", "주말 시장 구경", "market", {
      who: "Joe", whoKo: "과일 가게 주인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Well, look who it is! Weekend shopping?", want: "친구랑 그냥 구경하러 왔다고 하기", need: [["구경", ["looking around", "look around", "browse", "browsing"]]], hint: ["Yes, I'm just ~ with a friend.","Yes, I'm just…","Yes, I'm just looking around with a friend."], model: "Yes, I'm just looking around with a friend." },
        { say: "Take your time. Try a slice of apple?", want: "한 조각 먹어 봐도 되는지 묻기", need: [["먹어 봄", ["try", "taste"]]], hint: ["Can I ~ a piece?","Can I…","Can I try a piece?"], model: "Can I try a piece?" },
        { say: "Sweet, right? A big bag is five dollars.", want: "두 봉지에 9달러로 해 줄 수 있는지 묻기", need: [["두 봉지", ["two bags"]]], hint: ["Could you do ~ for nine dollars?","Could you do…","Could you do two bags for nine dollars?"], model: "Could you do two bags for nine dollars?", chunk: ["Could you do ~?","~에 해 줄래요?","값을 흥정할 때 써요."] },
        { say: "Hmm, okay, since you're a regular.", want: "고맙다고, 이제 단골인 것 같다고 하기", need: [["단골", ["regular"]]], hint: ["Thanks! I guess I'm a ~ now.","Thanks! I…","Thanks! I guess I'm a regular now."], model: "Thanks! I guess I'm a regular now." },
        { say: "Ha! Yes you are. See you next week.", want: "좋은 주말 보내라고 하기", need: [["주말", ["weekend"]]], hint: ["You too! Have a nice ~.","You too!…","You too! Have a nice weekend."], model: "You too! Have a nice weekend." }
      ],
      overhear: [
        ["guest", "Are these local?"],
        ["them", "Yes, they're all from farms nearby.", [["from farms nearby","근처 농장에서 온","어디서 왔는지 말할 때 from을 써요."]]],
        ["guest", "Do you take cards?"],
        ["them", "Yes, or cash."]
      ] }],
    ["13:00", "호숫가에서", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "There you are! The farmers market was fun, wasn't it?", want: "재미있었는데 사람이 너무 많았다고 하기", need: [["붐빔", ["crowded"]]], hint: ["It was great, but it was so ~.","It was great,…","It was great, but it was so crowded."], model: "It was great, but it was so crowded." },
        { say: "It always is on Saturdays. Did you buy anything?", want: "사과랑 꿀 한 병을 샀다고 하기", need: [["꿀", ["honey"]]], hint: ["I bought apples and a jar of ~.","I bought apples…","I bought apples and a jar of honey."], model: "I bought apples and a jar of honey." },
        { say: "Smart. Let's sit by the lake. Max loves it here.", want: "경치가 정말 아름답다고 하기", need: [["경치", ["view", "scenery"]]], hint: ["What a beautiful ~!","What a…","What a beautiful view!"], model: "What a beautiful view!" },
        { say: "Doesn't it? I come here every weekend.", want: "나도 매주 와도 되는지 묻기", need: [["매주", ["every weekend", "every week", "every saturday"]]], hint: ["Is it okay if I come ~ too?","Is it okay…","Is it okay if I come every weekend too?"], model: "Is it okay if I come every weekend too?" },
        { say: "Of course! Bring your friends.", want: "고맙다고, 다음엔 Sara랑 Yuki도 데려오겠다고 하기", need: [["Yuki", ["yuki"]], ["Sara", ["sara"]]], hint: ["Thanks! Next time I'll bring Sara and ~.","Thanks! Next time…","Thanks! Next time I'll bring Sara and Yuki."], model: "Thanks! Next time I'll bring Sara and Yuki." }
      ],
      overhear: [
        ["guest", "Can you take a picture of us?", [["take a picture of us","우리 사진을 찍어 주다","사진을 부탁할 때 써요."]]],
        ["them", "Sure! Say cheese.", [["Say cheese","웃으세요","사진 찍을 때 하는 말이에요."]]],
        ["guest", "Thanks. One more, please."],
        ["them", "Okay, ready?"]
      ] }],
    ["17:00", "한 달 기념 저녁", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Hey! Come in. How was the market?", want: "재미있었다고, 꿀을 선물로 가져왔다고 하기", need: [["선물", ["brought", "gift", "present"]]], hint: ["It was fun! I ~ you some honey.","It was fun!…","It was fun! I brought you some honey."], model: "It was fun! I brought you some honey." },
        { say: "Aw, thank you! You didn't have to.", want: "별것 아니라고, 도와줘서 고맙다고 하기", need: [["별것 아님", ["it's nothing", "no big deal", "not a big deal"]]], hint: ["~. I wanted to say thanks for your help.","It's nothing. I wanted…","It's nothing. I wanted to say thanks for your help."], model: "It's nothing. I wanted to say thanks for your help." },
        { say: "So, how are you feeling after your first month?", want: "많이 배웠고 자신감이 생겼다고 하기", need: [["자신감", ["confident", "confidence"]]], hint: ["I learned a lot, and I feel more ~.","I learned a…","I learned a lot, and I feel more confident."], model: "I learned a lot, and I feel more confident." },
        { say: "That's great. Any goals for next month?", want: "목표는 책 두 권을 읽는 거라고 하기", need: [["목표", ["goal"]]], hint: ["My ~ is to read two books.","My goal…","My goal is to read two books."], model: "My goal is to read two books." },
        { say: "Love that. Let's celebrate with dessert.", want: "좋다고, 첫 한 달이 정말 빨리 갔다고 하기", need: [["지나감", ["went by", "flew by", "passed"]]], hint: ["Yes! The first month ~ so fast.","Yes! The first…","Yes! The first month went by so fast."], model: "Yes! The first month went by so fast.", chunk: ["go by","지나가다","시간이 흘러갈 때 써요."] }
      ],
      overhear: [
        ["guest", "Dinner smells great, Sara!"],
        ["them", "Thanks! It's almost ready."],
        ["guest", "Can I set the table?", [["set the table","상을 차리다","식사 전 그릇을 놓을 때 써요."]]],
        ["them", "Yes, plates are in the cupboard."]
      ] }]
  ]]
]);
