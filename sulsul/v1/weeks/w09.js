// 9주째 · 취미 만들기 (57~63일째). 요리, 볼링, 서점, 기타, 등산, 보드게임, 동호회로 새 취미를 찾는다.
// 장면 = [시간, 이름, 그림 id, 대본]. 그림 id가 week.js ART에 들어오면 열린다. 형식은 ~/sulsul-art/YEAR.md
WEEK(9, [
  ["요리 수업", [
    ["10:00", "요리 수업 첫날", "cooking", {
      who: "Marco", whoKo: "요리 선생님", voices: { them: "m2", guest: "f" }, guestKo: "같은 반 수강생",
      turns: [
        { say: "Hi, welcome! Are you here for the beginner class?", want: "네, 요리를 잘 못한다고 하기", need: [["잘 못함",["not very good","not good","can't cook","beginner","never cooked"]]], hint: ["Yes. I'm not ~ at cooking.","Yes. I'm not very…","Yes. I'm not very good at cooking."], model: "Yes. I'm not very good at cooking.", chunk: ["be good at","~를 잘하다","잘하는 일 앞에 at을 붙여요."] },
        { say: "No worries, everyone starts somewhere! Tonight we're making fresh pasta. Any allergies?", want: "견과류 알레르기가 있다고 하기", need: [["알레르기",["allergic","allergy"]],["견과류",["nuts","nut"]]], hint: ["Yes, I'm ~ to nuts.","Yes, I'm…","Yes, I'm allergic to nuts."], model: "Yes, I'm allergic to nuts." },
        { say: "Good to know. Please wash your hands, and grab an apron.", want: "손은 어디서 씻으면 되는지 묻기", need: [["어디서",["where"]],["씻기",["wash"]]], hint: ["Where can I ~?","Where can I wash…","Where can I wash my hands?"], model: "Where can I wash my hands?" },
        { say: "The sink is in the back. Okay, first, chop the garlic. Nice and small.", want: "얼마나 작게 썰면 되는지 보여 달라고 하기", need: [["보여 주기",["show me"]]], hint: ["Could you ~ how small?","Could you show…","Could you show me how small?"], model: "Could you show me how small?", chunk: ["Could you show me ~?","~를 보여 주실래요?","따라 하고 싶을 때 부탁하는 말이에요."] },
        { say: "Like this. See? You're a natural!", want: "고맙다고, 재미있어서 다음 주에도 오겠다고 하기", need: [["다음 주",["next week"]]], hint: ["Thanks! This is fun, so I'll come back ~.","Thanks! This is fun, so I'll come back next…","Thanks! This is fun, so I'll come back next week."], model: "Thanks! This is fun, so I'll come back next week." }
      ],
      overhear: [
        ["them", "Be careful with the knife. Keep your fingers tucked in.", [["tucked in","안으로 접은","칼질할 때 손가락을 안쪽으로 모으라는 말이에요."]]],
        ["guest", "Chef, how long should I boil the water?", [["boil the water","물을 끓이다","파스타를 삶기 전에 해요."]]],
        ["them", "Until it's bubbling hard. Then add a big pinch of salt.", [["pinch of","한 꼬집","소금을 조금 넣을 때 써요."]]],
        ["guest", "Got it. This smells amazing already!"]
      ] }],
    ["13:00", "요리 재료 사기", "grocery", {
      who: "Tina", whoKo: "마트 계산대 직원", voices: { them: "f2", guest: "m2" }, guestKo: "뒤에 선 손님",
      turns: [
        { say: "Hi! Did you find everything okay?", want: "토마토소스가 어디 있는지 묻고, 오늘 파스타를 만든다고 하기", need: [["토마토",["tomato"]],["어디",["where","where's"]]], hint: ["Where is the ~? I'm making pasta tonight.","Where is the tomato…","Where is the tomato sauce? I'm making pasta tonight."], model: "Where is the tomato sauce? I'm making pasta tonight." },
        { say: "Aisle four, next to the noodles. Anything else?", want: "신선한 바질이 있는지 묻기", need: [["바질",["basil"]],["신선",["fresh"]]], hint: ["Do you have ~?","Do you have fresh…","Do you have fresh basil?"], model: "Do you have fresh basil?" },
        { say: "Yes, in the produce section. It's a little expensive today, though.", want: "그래도 작은 한 다발만 사겠다고 하기", need: [["작은",["small","little"]]], hint: ["That's okay. I'll just get a ~.","That's okay. I'll just get a small…","That's okay. I'll just get a small bunch."], model: "That's okay. I'll just get a small bunch.", chunk: ["a bunch of","한 다발","채소·꽃을 묶음으로 셀 때 써요."] },
        { say: "Are you cooking for a lot of people?", want: "아니, 나 혼자 먹고, 요리 수업 숙제라고 하기", need: [["숙제",["homework"]],["수업",["class"]]], hint: ["No, just for me. It's ~ from my cooking class.","No, just for me. It's…","No, just for me. It's homework from my cooking class."], model: "No, just for me. It's homework from my cooking class." },
        { say: "Cool! Do you need a bag? They're ten cents each.", want: "가방은 필요 없다고, 내 것을 가져왔다고 하기", need: [["가져옴",["brought","have my own"]]], hint: ["No, thanks. I ~ bag.","No, thanks. I brought…","No, thanks. I brought my own bag."], model: "No, thanks. I brought my own bag.", chunk: ["my own","내 것","직접 가져온 물건을 말할 때 써요."] }
      ],
      overhear: [
        ["guest", "Excuse me, is this the express line?", [["express line","빠른 계산대","물건이 적은 사람이 서는 줄이에요."]]],
        ["them", "Yes, ten items or less.", [["ten items or less","열 개 이하","express line의 조건이에요."]]],
        ["guest", "Perfect, I only have four things."],
        ["them", "Then you're all set. Next, please."]
      ] }],
    ["18:00", "Sara에게 요리해 주기", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Mmm, it smells so good in here! What did you make?", want: "수업에서 배운 파스타라고 하기", need: [["파스타",["pasta"]],["배움",["learned","learnt","class"]]], hint: ["It's ~. I learned it in my cooking class.","It's…","It's pasta. I learned it in my cooking class."], model: "It's pasta. I learned it in my cooking class." },
        { say: "Wow, you? I remember your instant ramen days.", want: "웃으며 아직 연습 중이니까 기대는 하지 말라고 하기", need: [["연습",["practicing","practice","learning"]]], hint: ["Ha! I'm still ~, so don't expect too much.","Ha! I'm still…","Ha! I'm still practicing, so don't expect too much."], model: "Ha! I'm still practicing, so don't expect too much.", chunk: ["don't expect too much","너무 기대하지 마세요","결과가 완벽하지 않을 때 미리 하는 말이에요."] },
        { say: "Okay, I'm trying it. Hmm… it's pretty good, but something's missing.", want: "소금이 조금 더 필요한 것 같다고 하기", need: [["소금",["salt"]]], hint: ["Maybe it needs a little more ~.","Maybe it needs a little more…","Maybe it needs a little more salt."], model: "Maybe it needs a little more salt." },
        { say: "Yeah, one more pinch. So what's next on your menu?", want: "다음엔 수프를 만들어 보고 싶다고 하기", need: [["수프",["soup"]],["다음",["next"]]], hint: ["Next time, I want to try making ~.","Next time, I want to try making…","Next time, I want to try making soup."], model: "Next time, I want to try making soup." },
        { say: "I'm in! I'll bring dessert.", want: "고맙다고, 너랑 먹으면 뭐든 더 맛있다고 하기", need: [["더 맛있음",["tastes better","taste better","more delicious"]]], hint: ["Thanks! Food always ~ with you.","Thanks! Food always tastes…","Thanks! Food always tastes better with you."], model: "Thanks! Food always tastes better with you." }
      ],
      overhear: [
        ["guest", "Sara, can I have some more?", [["some more","좀 더","추가를 부탁할 때 써요."]]],
        ["them", "Of course! Help yourself.", [["Help yourself","마음껏 드세요","편하게 가져다 먹으라는 말이에요."]]],
        ["guest", "This is really tasty. What's in the sauce?"],
        ["them", "Just tomatoes, garlic, and a lot of love."]
      ] }]
  ]],
  ["볼링장", [
    ["12:00", "볼링 초대 받기", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hey! Are you free tonight? A few of us are going bowling.", want: "재미있겠다고, 볼링은 한 번도 안 해 봤다고 하기", need: [["안 해 봄",["never","first"]]], hint: ["Sounds fun, but I've ~ before.","Sounds fun, but I've never…","Sounds fun, but I've never bowled before."], model: "Sounds fun, but I've never bowled before." },
        { say: "No problem, I'm not great either. Can you come at seven?", want: "7시 좋다고, 어디서 만나는지 묻기", need: [["어디서",["where"]],["만남",["meet"]]], hint: ["Seven works. ~?","Seven works. Where…","Seven works. Where should we meet?"], model: "Seven works. Where should we meet?" },
        { say: "At the bowling alley on Main Street. Do you need a ride?", want: "걸어서 갈 수 있다고, 우리 집에서 가깝다고 하기", need: [["걸어",["walk","walking"]],["가까움",["close","near"]]], hint: ["No, I can ~. It's close to my place.","No, I can…","No, I can walk. It's close to my place."], model: "No, I can walk. It's close to my place." },
        { say: "Perfect. Oh, bring socks! They're required.", want: "알려 줘서 고맙다고, 깜빡할 뻔했다고 하기", need: [["고마움",["thanks","thank","appreciate"]]], hint: ["~! I almost forgot.","Thanks…","Thanks for the reminder! I almost forgot."], model: "Thanks for the reminder! I almost forgot.", chunk: ["almost forgot","깜빡할 뻔했어요","거의 ~할 뻔했을 때 almost를 붙여요."] },
        { say: "Ha, anytime. See you at seven!", want: "기대된다고 하기", need: [["기대",["looking forward","can't wait","excited"]]], hint: ["I'm ~!","I'm looking…","I'm looking forward to it!"], model: "I'm looking forward to it!", chunk: ["look forward to","기대하다","to 뒤에 명사나 -ing가 와요."] }
      ],
      overhear: [
        ["guest", "Yuki, I'm sorry I'm late! Class ran long.", [["ran long","길어졌어요","수업·회의가 예정보다 오래 갈 때 써요."]]],
        ["them", "No worries. I just got here too."],
        ["guest", "Are we still on for Friday?", [["still on","여전히 하는 거죠","약속이 그대로인지 확인할 때 써요."]]],
        ["them", "Yes! I'll text you the time."]
      ] }],
    ["17:00", "볼링장 접수", "bowling", {
      who: "Greg", whoKo: "볼링장 직원", voices: { them: "m", guest: "f2" }, guestKo: "옆 레인 손님",
      turns: [
        { say: "Hi there! How many in your group?", want: "네 명이고 레인 하나를 쓰고 싶다고 하기", need: [["네 명",["four","4"]],["레인",["lane"]]], hint: ["Four people. We'd like ~, please.","Four people. We'd like one…","Four people. We'd like one lane, please."], model: "Four people. We'd like one lane, please." },
        { say: "Sure, lane twelve. What size shoes?", want: "신발 사이즈를 잘 모르겠지만 7.5쯤이라고 하기", need: [["7.5",["seven and a half","7.5"]]], hint: ["I think I'm a ~.","I think I'm a seven…","I think I'm a seven and a half."], model: "I think I'm a seven and a half." },
        { say: "Here you go. Do you want bumpers on the lane? They keep the ball out of the gutter.", want: "초보라서 범퍼가 필요하다고 하기", need: [["범퍼",["bumpers","bumper"]],["초보",["beginner","new"]]], hint: ["Yes, please. I'm a beginner, so I need the ~.","Yes, please. I'm a beginner, so I need the…","Yes, please. I'm a beginner, so I need the bumpers."], model: "Yes, please. I'm a beginner, so I need the bumpers.", chunk: ["gutter","레인 옆 홈","공이 빠지는 홈이에요. 빠진 공은 gutter ball."] },
        { say: "You got it. The ball return is over there. Anything else?", want: "더 가벼운 공이 있는지 묻기", need: [["가벼운",["lighter","light"]]], hint: ["Do you have a ~? This one's heavy.","Do you have a lighter…","Do you have a lighter ball? This one's heavy."], model: "Do you have a lighter ball? This one's heavy." },
        { say: "Sure, try this ten-pound one.", want: "딱 좋다고, 고맙다고 하기", need: [["딱 좋음",["perfect","just right","works"]]], hint: ["That's ~. Thank you so much!","That's…","That's perfect. Thank you so much!"], model: "That's perfect. Thank you so much!" }
      ],
      overhear: [
        ["guest", "Excuse me, can we change lanes? Ours is stuck.", [["is stuck","걸렸어요","기계가 멈췄을 때 써요."]]],
        ["them", "Sorry about that! I'll reset it right now."],
        ["guest", "Thanks. Do you have a pitcher of soda?"],
        ["them", "Yes, coming right up."]
      ] }],
    ["20:00", "볼링 끝나고 카페", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey! You look happy. Good day?", want: "처음 볼링 쳤는데 스트라이크를 두 번 쳤다고 하기", need: [["스트라이크",["strike","strikes"]]], hint: ["Great! I went bowling and got ~.","Great! I went bowling and got two…","Great! I went bowling and got two strikes."], model: "Great! I went bowling and got two strikes." },
        { say: "Two strikes on your first day? That's amazing! What'll it be?", want: "작은 핫초코 하나 달라고, 피곤해서 커피는 싫다고 하기", need: [["핫초코",["hot chocolate","cocoa"]]], hint: ["A small ~, please. I'm too tired for coffee.","A small hot…","A small hot chocolate, please. I'm too tired for coffee."], model: "A small hot chocolate, please. I'm too tired for coffee." },
        { say: "Coming up. Did you win?", want: "아니, 꼴찌였지만 정말 재미있었다고 하기", need: [["꼴찌",["last"]]], hint: ["No, I came in ~, but I had so much fun.","No, I came in…","No, I came in last, but I had so much fun."], model: "No, I came in last, but I had so much fun." },
        { say: "That's what matters! Are you going again?", want: "다음 주에 또 갈 거고 실력을 늘리고 싶다고 하기", need: [["다음 주",["next week"]],["늘다",["get better","improve"]]], hint: ["Yes, I'm going again ~. I want to get better.","Yes, I'm going again next…","Yes, I'm going again next week. I want to get better."], model: "Yes, I'm going again next week. I want to get better.", chunk: ["get better","실력이 늘다","연습해서 나아지고 싶을 때 써요."] },
        { say: "Here's your cocoa. Careful, it's hot.", want: "고맙다고, 팔이 너무 쑤신다고 하기", need: [["쑤심",["sore","hurt","hurts"]]], hint: ["Thanks! My arm is so ~, though.","Thanks! My arm is so…","Thanks! My arm is so sore, though."], model: "Thanks! My arm is so sore, though.", chunk: ["sore","쑤시는","운동 뒤 근육이 아플 때 써요."] }
      ],
      overhear: [
        ["guest", "Can I get a latte to go?", [["to go","포장으로","가져갈 음료·음식에 써요."]]],
        ["them", "Sure. Do you want a sleeve for that?", [["sleeve","컵 홀더","뜨거운 컵에 끼우는 종이예요."]]],
        ["guest", "Yes, please. It's really hot today."],
        ["them", "Here you go. Have a good one!"]
      ] }]
  ]],
  ["서점", [
    ["10:00", "쉬는 날 서점 구경", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "책 고르던 손님",
      turns: [
        { say: "Oh, hi! On your day off? Looking for something?", want: "새 취미를 찾고 있다고 하기", need: [["취미",["hobby","hobbies"]]], hint: ["Yes, I'm looking for a new ~.","Yes, I'm looking for a new…","Yes, I'm looking for a new hobby."], model: "Yes, I'm looking for a new hobby." },
        { say: "Fun! What are you interested in?", want: "요리와 기타 중에서 못 정하겠다고 하기", need: [["못 정함",["can't decide","cannot decide","torn"]]], hint: ["I ~ between cooking and guitar.","I can't…","I can't decide between cooking and guitar."], model: "I can't decide between cooking and guitar." },
        { say: "Both are great. We have a beginner's guitar book with online videos.", want: "초보자도 따라 할 수 있는지, 얼마인지 묻기", need: [["얼마",["how much"]]], hint: ["Is it good for a total beginner? ~?","Is it good for a total beginner? How…","Is it good for a total beginner? How much is it?"], model: "Is it good for a total beginner? How much is it?" },
        { say: "Twenty-two dollars. And you get your employee discount, of course.", want: "고맙다고, 그걸로 사겠다고 하기", need: [["사기",["i'll take","i'll get","i'll buy"]]], hint: ["Nice, thanks! I'll ~.","Nice, thanks! I'll take…","Nice, thanks! I'll take it."], model: "Nice, thanks! I'll take it." },
        { say: "Great choice. Do you want a bag?", want: "괜찮다고, 오늘부터 읽기 시작하고 싶다고 하기", need: [["읽기",["reading","read"]]], hint: ["No, thanks. I want to start ~ it today.","No, thanks. I want to start…","No, thanks. I want to start reading it today."], model: "No, thanks. I want to start reading it today." }
      ],
      overhear: [
        ["guest", "Hi, do you have any books on gardening?", [["books on","~에 관한 책","주제를 말할 때 on을 써요."]]],
        ["them", "Yes, aisle three, on the left."],
        ["guest", "Great. Is there a section for beginners?"],
        ["them", "Right at the end, with the green labels."]
      ] }],
    ["14:00", "도서관에서 사진 책 찾기", "library", {
      who: "Henry", whoKo: "도서관 사서", voices: { them: "m2", guest: "f" }, guestKo: "책 반납하던 사람",
      turns: [
        { say: "Afternoon! Can I help you find something?", want: "사진 찍기 입문서를 찾는다고 하기", need: [["사진",["photography","photo","camera"]]], hint: ["I'm looking for a beginner book on ~.","I'm looking for a beginner book on…","I'm looking for a beginner book on photography."], model: "I'm looking for a beginner book on photography." },
        { say: "Second floor, arts section. Do you know the title?", want: "제목은 모르고, 초보용이면 아무거나 좋다고 하기", need: [["모름",["don't know","do not know"]]], hint: ["I ~ the title. Anything for beginners is fine.","I don't…","I don't know the title. Anything for beginners is fine."], model: "I don't know the title. Anything for beginners is fine." },
        { say: "Then try the shelf by the window. They're all easy to read.", want: "빌린 책을 얼마나 오래 가지고 있을 수 있는지 묻기", need: [["얼마나",["how long"]]], hint: ["~ can I keep it?","How…","How long can I keep it?"], model: "How long can I keep it?" },
        { say: "Three weeks, and you can renew it once.", want: "더 필요하면 어떻게 연장하는지 묻기", need: [["연장",["renew","extend"]]], hint: ["How do I ~ it if I need more time?","How do I…","How do I renew it if I need more time?"], model: "How do I renew it if I need more time?" },
        { say: "Just do it online. Or ask me.", want: "고맙다고, 많이 도움이 됐다고 하기", need: [["고마움",["thank","thanks","appreciate"]]], hint: ["~, you've been a big help.","Thank…","Thank you, you've been a big help."], model: "Thank you, you've been a big help." }
      ],
      overhear: [
        ["guest", "Excuse me, where do I return these?", [["return","반납하다","빌린 책·물건을 돌려줄 때 써요."]]],
        ["them", "Just drop them in the box by the door."],
        ["guest", "Oh, and I have a late fee, I think.", [["late fee","연체료","늦게 반납하면 내는 돈이에요."]]],
        ["them", "Let me check. It's only fifty cents."]
      ] }],
    ["18:00", "단골 할아버지의 취미", "bkoldman", {
      who: "Mr. Walker", whoKo: "서점 단골 할아버지", voices: { them: "m2", guest: "f2" }, guestKo: "다른 손님",
      turns: [
        { say: "Evening! I'll have my usual tea. What are you reading?", want: "기타 책이고, 기타를 배울 거라고 하기", need: [["기타",["guitar"]],["배우기",["learn","learning"]]], hint: ["It's a guitar book. I'm going to ~ guitar.","It's a guitar book. I'm going to…","It's a guitar book. I'm going to learn guitar."], model: "It's a guitar book. I'm going to learn guitar." },
        { say: "Wonderful! I took up painting after I retired. It's never too late.", want: "무슨 그림을 그리는지 묻기", need: [["무슨",["what"]],["그림",["paint","painting","draw"]]], hint: ["What kind of things do you ~?","What kind of things do you…","What kind of things do you paint?"], model: "What kind of things do you paint?" },
        { say: "Mostly birds outside my window. Nothing fancy.", want: "멋지다고, 언젠가 보고 싶다고 하기", need: [["보고 싶다",["love to see","like to see","want to see"]]], hint: ["That sounds lovely. I'd ~ them sometime.","That sounds lovely. I'd love…","That sounds lovely. I'd love to see them sometime."], model: "That sounds lovely. I'd love to see them sometime.", chunk: ["I'd love to","~하고 싶어요","정중하게 하고 싶다고 말할 때 써요."] },
        { say: "I'll bring one next week. My advice for a beginner? Be patient. It takes time.", want: "고맙다고, 하루에 15분씩 연습할 계획이라고 하기", need: [["연습",["practice"]]], hint: ["Thanks. I plan to ~ fifteen minutes every day.","Thanks. I plan to…","Thanks. I plan to practice fifteen minutes every day."], model: "Thanks. I plan to practice fifteen minutes every day." },
        { say: "That's the way. Now, one tea, please.", want: "바로 준비해 드리겠다고 하기", need: [["바로",["coming right up","right away","one moment","right now"]]], hint: ["~!","Coming…","Coming right up!"], model: "Coming right up!", chunk: ["Coming right up","바로 나갑니다","주문을 받고 곧 준비해 줄 때 써요."] }
      ],
      overhear: [
        ["them", "Do you have any new mystery novels?", [["mystery novels","추리 소설","mystery는 수수께끼 이야기예요."]]],
        ["guest", "I'll check the back. What was the last one you read?"],
        ["them", "A good one about a missing painting."],
        ["guest", "Oh, I think I know the one. Let me grab it."]
      ] }]
  ]],
  ["악기 가게", [
    ["11:00", "기타 사러 가기", "musicshop", {
      who: "Vince", whoKo: "악기 가게 사장", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hey, welcome in! Looking for anything special?", want: "기타를 배우고 싶은 초보라고 하기", need: [["초보",["beginner","new to"]]], hint: ["I'm a ~, and I want to learn guitar.","I'm a…","I'm a beginner, and I want to learn guitar."], model: "I'm a beginner, and I want to learn guitar." },
        { say: "Great! Acoustic or electric?", want: "어쿠스틱이 좋고, 아파트라서 너무 시끄러우면 안 된다고 하기", need: [["어쿠스틱",["acoustic"]],["시끄러움",["loud","noisy"]]], hint: ["Acoustic. I live in an apartment, so ~.","Acoustic. I live in an apartment, so nothing…","Acoustic. I live in an apartment, so nothing too loud."], model: "Acoustic. I live in an apartment, so nothing too loud." },
        { say: "Then try this one. It's small and easy on the fingers.", want: "한번 쳐 봐도 되는지 묻기", need: [["쳐 보기",["try","play"]]], hint: ["Can I ~ it?","Can I try…","Can I try playing it?"], model: "Can I try playing it?" },
        { say: "Of course! How does it feel?", want: "소리는 따뜻해서 좋은데 손가락이 조금 아프다고 하기", need: [["아픔",["hurt","hurts","sore"]]], hint: ["It sounds warm, but my fingers ~ a little.","It sounds warm, but my fingers…","It sounds warm, but my fingers hurt a little."], model: "It sounds warm, but my fingers hurt a little." },
        { say: "That's normal at first. It's two hundred dollars with the case.", want: "생각해 보고 내일 다시 오겠다고 하기", need: [["다시 오기",["come back"]]], hint: ["Let me think about it. I'll ~ tomorrow.","Let me think about it. I'll come…","Let me think about it. I'll come back tomorrow."], model: "Let me think about it. I'll come back tomorrow." }
      ],
      overhear: [
        ["guest", "Do you sell guitar strings?", [["guitar strings","기타 줄","줄은 닳아서 자주 갈아요."]]],
        ["them", "Yes, on the wall behind you. What gauge?", [["What gauge","굵기가 어떻게 돼요","기타 줄 굵기를 묻는 말이에요."]]],
        ["guest", "Light, I think. I play a lot."],
        ["them", "Then these are perfect. They last longer."]
      ] }],
    ["16:00", "위층 Jake에게 기타 배우기", "upstairs", {
      who: "Jake", whoKo: "위층 이웃", voices: { them: "m", guest: "f2" }, guestKo: "지나가던 이웃",
      turns: [
        { say: "Hey, neighbor! Whoa, is that a guitar? Are you taking it up?", want: "맞다고, 오늘 막 샀다고 하기", need: [["샀다",["bought","just got"]]], hint: ["Yes! I just ~ it today.","Yes! I just…","Yes! I just bought it today."], model: "Yes! I just bought it today." },
        { say: "Nice! I play too. Any songs in mind?", want: "아직 한 곡도 못 치니까 쉬운 곡부터 시작하고 싶다고 하기", need: [["쉬운",["easy","simple"]]], hint: ["Not yet. I want to start with an ~.","Not yet. I want to start with an easy…","Not yet. I want to start with an easy song."], model: "Not yet. I want to start with an easy song." },
        { say: "Try a song with just three or four chords. You'll sound good fast.", want: "코드를 아직 모르니 하나 보여 줄 수 있는지 묻기", need: [["보여 주기",["show me"]]], hint: ["I don't know chords yet. Could you ~ one?","I don't know chords yet. Could you show…","I don't know chords yet. Could you show me one?"], model: "I don't know chords yet. Could you show me one?" },
        { say: "Sure, come over after dinner. Just don't play after ten, okay?", want: "물론이라고, 10시 넘어서는 안 치겠다고 약속하기", need: [["약속",["promise"]]], hint: ["Of course. I ~ not to play after ten.","Of course. I…","Of course. I promise not to play after ten."], model: "Of course. I promise not to play after ten." },
        { say: "You're all right. See you tonight!", want: "고맙다고, 7시에 가겠다고 하기", need: [["7시",["seven"]]], hint: ["Thanks, Jake! I'll be there at ~.","Thanks, Jake! I'll be there at…","Thanks, Jake! I'll be there at seven."], model: "Thanks, Jake! I'll be there at seven." }
      ],
      overhear: [
        ["guest", "Jake, your music was so nice last night!", [["was so nice","정말 좋았어요","지난 일에 대한 칭찬이에요."]]],
        ["them", "Thanks! Was it too loud? I can turn it down.", [["turn it down","소리를 줄이다","볼륨을 낮출 때 써요."]]],
        ["guest", "Not at all. I loved it."],
        ["them", "Great. I'll keep it down after ten anyway."]
      ] }],
    ["19:00", "거리 악사에게 조언 듣기", "busker", {
      who: "Eli", whoKo: "광장 거리 악사", voices: { them: "m2", guest: "f" }, guestKo: "구경하던 사람",
      turns: [
        { say: "Hey, I remember you! Back for more music?", want: "네, 이제 나도 기타를 배우는 중이라고 하기", need: [["배우는 중",["learning","learn"]]], hint: ["Yes! I'm ~ too now.","Yes! I'm learning…","Yes! I'm learning guitar too now."], model: "Yes! I'm learning guitar too now." },
        { say: "No way! How's it going?", want: "어렵지만 재미있다고 하기", need: [["어렵",["hard","difficult"]],["재미",["fun"]]], hint: ["It's hard, but I'm having ~.","It's hard, but I'm having…","It's hard, but I'm having fun."], model: "It's hard, but I'm having fun." },
        { say: "That's the right attitude. I played every day for a year before I got good.", want: "하루에 얼마나 연습했는지 묻기", need: [["얼마나",["how long","how much","how many"]]], hint: ["~ did you practice each day?","How…","How long did you practice each day?"], model: "How long did you practice each day?" },
        { say: "About an hour. Even when I didn't feel like it.", want: "나도 해 보겠다고, 포기하지 않겠다고 하기", need: [["포기",["give up","quit"]]], hint: ["I'll try that. I won't ~.","I'll try that. I won't give…","I'll try that. I won't give up."], model: "I'll try that. I won't give up.", chunk: ["give up","포기하다","중간에 그만둘 때 써요."] },
        { say: "Good. Come back when you can play a song for me.", want: "꼭 그러겠다고 하기", need: [["꼭",["definitely","for sure","absolutely","promise"]]], hint: ["~! I'll play for you someday.","Definitely!…","Definitely! I'll play for you someday."], model: "Definitely! I'll play for you someday." }
      ],
      overhear: [
        ["guest", "Do you take requests?", [["take requests","신청곡을 받다","연주자에게 곡을 부탁할 때 써요."]]],
        ["them", "Sure! What do you want to hear?"],
        ["guest", "Something slow and sweet, please."],
        ["them", "I've got just the one."]
      ] }]
  ]],
  ["등산 모임", [
    ["08:00", "등산 모임 첫 만남", "hikegroup", {
      who: "Gina", whoKo: "등산 모임 리더", voices: { them: "f", guest: "m" }, guestKo: "다른 회원",
      turns: [
        { say: "Morning! Are you here for the hiking group?", want: "네, 이 모임은 처음이라고 하기", need: [["처음",["new"]]], hint: ["Yes! I'm ~ to the group.","Yes! I'm…","Yes! I'm new to the group."], model: "Yes! I'm new to the group." },
        { say: "Welcome! Did you bring water and snacks?", want: "물 두 병이랑 바나나를 가져왔다고 하기", need: [["가져옴",["brought","have","got"]]], hint: ["Yes, I ~ two bottles of water and a banana.","Yes, I…","Yes, I brought two bottles of water and a banana."], model: "Yes, I brought two bottles of water and a banana." },
        { say: "Great. How much hiking experience do you have?", want: "많이 안 해 봤으니 천천히 가도 되는지 묻기", need: [["천천히",["slowly","slow","my pace"]]], hint: ["I haven't hiked much. Is it okay if I go ~?","I haven't hiked much. Is it okay if I go…","I haven't hiked much. Is it okay if I go slowly?"], model: "I haven't hiked much. Is it okay if I go slowly?" },
        { say: "Absolutely. We take a break every thirty minutes.", want: "쉬는 시간이 있어서 다행이라고 하기", need: [["다행",["relief"]]], hint: ["That's a ~. I was a little worried.","That's a…","That's a relief. I was a little worried."], model: "That's a relief. I was a little worried.", chunk: ["That's a relief","다행이에요","걱정되던 일이 풀렸을 때 써요."] },
        { say: "Okay, everyone, let's go! Stay together.", want: "준비됐다고 하기", need: [["준비",["ready"]]], hint: ["I'm ~. Let's go!","I'm…","I'm ready. Let's go!"], model: "I'm ready. Let's go!" }
      ],
      overhear: [
        ["guest", "Gina, is the trail muddy today?", [["muddy","진흙투성이인","비 온 뒤 길이 어떤지 말할 때 써요."]]],
        ["them", "A little, so watch your step.", [["watch your step","발밑 조심하세요","미끄러운 곳에서 하는 말이에요."]]],
        ["guest", "Good thing I wore my boots."],
        ["them", "Smart! Let's get started."]
      ] }],
    ["12:00", "정상에서 사진 부탁", "photo", {
      who: "Nate", whoKo: "정상에서 만난 등산객", voices: { them: "m", guest: "f2" }, guestKo: "다른 등산객",
      turns: [
        { say: "Beautiful view, huh? Want me to take your picture?", want: "부탁한다고, 뒤에 풍경이 나오게 해 달라고 하기", need: [["풍경",["view","scenery","background"]]], hint: ["Yes, please! Can you get the ~ in the background?","Yes, please! Can you get the…","Yes, please! Can you get the view in the background?"], model: "Yes, please! Can you get the view in the background?" },
        { say: "Sure. Smile! One, two, three. Hmm, I think it's blurry.", want: "혹시 모르니 한 장 더 찍어 달라고 하기", need: [["한 장 더",["another","one more"]]], hint: ["Thanks! Could we do ~, just in case?","Thanks! Could we do another…","Thanks! Could we do another one, just in case?"], model: "Thanks! Could we do another one, just in case?", chunk: ["just in case","혹시 모르니","대비해서 하나 더 할 때 써요."] },
        { say: "No problem. So, did you hike all the way up?", want: "네, 두 시간 걸렸고 힘들었다고 하기", need: [["두 시간",["two hours"]],["힘듦",["tough","hard","tired","exhausting"]]], hint: ["Yes, it took ~, and it was tough.","Yes, it took two…","Yes, it took two hours, and it was tough."], model: "Yes, it took two hours, and it was tough.", chunk: ["it took","~ 걸렸어요","걸린 시간을 말할 때 써요."] },
        { say: "Same here. But the view is worth it.", want: "정말 그렇다고, 올라와서 다행이라고 하기", need: [["다행",["glad","happy","worth"]]], hint: ["It really is. I'm ~ I came up.","It really is. I'm…","It really is. I'm glad I came up."], model: "It really is. I'm glad I came up.", chunk: ["I'm glad I ~","~해서 다행이에요","한 일에 만족할 때 써요."] },
        { say: "Enjoy it! I'm heading down. See you!", want: "조심히 내려가라고 하기", need: [["조심",["careful","safe","take care"]]], hint: ["Be ~ on the way down!","Be…","Be careful on the way down!"], model: "Be careful on the way down!" }
      ],
      overhear: [
        ["guest", "Excuse me, how far is the top?", [["how far","얼마나 먼지","거리를 물을 때 써요."]]],
        ["them", "About twenty minutes. It's steep at the end.", [["steep","가파른","비탈이 급할 때 써요."]]],
        ["guest", "Thanks. I need to rest a bit first."],
        ["them", "Take your time. The view's not going anywhere."]
      ] }],
    ["18:00", "등산 끝나고 타코", "foodtruck", {
      who: "Carlos", whoKo: "푸드트럭 사장님", voices: { them: "m2", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, friend! You look tired but happy. Hike today?", want: "맞다고, 오늘 정상까지 올라갔다고 하기", need: [["정상",["top","summit"]]], hint: ["Yes! I made it to the ~ today.","Yes! I made it to the…","Yes! I made it to the top today."], model: "Yes! I made it to the top today." },
        { say: "Congrats! What can I get you? Tacos?", want: "배고파 죽겠으니 타코 세 개 달라고 하기", need: [["세 개",["three","3"]],["타코",["tacos"]]], hint: ["I'm starving. ~, please.","I'm starving. Three…","I'm starving. Three tacos, please."], model: "I'm starving. Three tacos, please.", chunk: ["starving","배고파 죽겠어요","very hungry보다 센 말이에요."] },
        { say: "Coming up. Spicy salsa?", want: "너무 맵지 않게, 중간으로 달라고 하기", need: [["중간",["medium","mild"]]], hint: ["~, please. Not too spicy.","Medium,…","Medium, please. Not too spicy."], model: "Medium, please. Not too spicy." },
        { say: "Here. Sit down, you earned it. Want a drink?", want: "시원한 레모네이드 하나 달라고 하기", need: [["레모네이드",["lemonade"]]], hint: ["Yes, an iced ~, please.","Yes, an iced…","Yes, an iced lemonade, please."], model: "Yes, an iced lemonade, please." },
        { say: "Done. So are you joining the group every week?", want: "그러고 싶다고, 토요일 아침마다 모인다고 하기", need: [["매주",["every"]]], hint: ["I'd like to. They meet ~ Saturday morning.","I'd like to. They meet…","I'd like to. They meet every Saturday morning."], model: "I'd like to. They meet every Saturday morning." }
      ],
      overhear: [
        ["guest", "What's your best seller?", [["best seller","제일 잘 팔리는 것","가게에서 인기 있는 메뉴예요."]]],
        ["them", "The chicken tacos, no question.", [["no question","두말할 것 없이","확실하다고 강조할 때 써요."]]],
        ["guest", "Then I'll have two of those."],
        ["them", "Good choice. Be right back."]
      ] }]
  ]],
  ["보드게임 카페", [
    ["14:00", "보드게임 카페 입장", "boardcafe", {
      who: "Ivy", whoKo: "보드게임 카페 직원", voices: { them: "f2", guest: "m" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Welcome! How many people today?", want: "세 명이고 쉬운 게임을 추천해 달라고 하기", need: [["추천",["recommend","suggest"]]], hint: ["There are three of us. Can you ~?","There are three of us. Can you recommend…","There are three of us. Can you recommend an easy game?"], model: "There are three of us. Can you recommend an easy game?" },
        { say: "Sure! Try this one. It takes about thirty minutes.", want: "규칙을 설명해 줄 수 있는지 묻기", need: [["규칙",["rules","rule"]],["설명",["explain"]]], hint: ["Could you ~ to us?","Could you explain…","Could you explain the rules to us?"], model: "Could you explain the rules to us?" },
        { say: "Of course! You take turns drawing a card. First to collect three sets wins.", want: "미안하지만 조금 더 천천히 다시 말해 달라고 하기", need: [["다시",["again"]],["천천히",["slower","slowly"]]], hint: ["Sorry, can you say that ~?","Sorry, can you say that again,…","Sorry, can you say that again, a little slower?"], model: "Sorry, can you say that again, a little slower?" },
        { say: "No problem. Anything to drink while you play?", want: "아이스티 세 잔 달라고 하기", need: [["아이스티",["iced tea","iced teas","ice tea"]]], hint: ["Three ~, please.","Three iced…","Three iced teas, please."], model: "Three iced teas, please." },
        { say: "Alright. Your table is number six. Have fun!", want: "고맙다고, 오늘은 꼭 이기고 싶다고 웃으며 말하기", need: [["이기다",["win"]]], hint: ["Thanks! I really want to ~ today.","Thanks! I really want to…","Thanks! I really want to win today."], model: "Thanks! I really want to win today." }
      ],
      overhear: [
        ["guest", "Excuse me, we're missing a piece.", [["missing a piece","조각이 하나 없어요","게임 부품이 모자랄 때 써요."]]],
        ["them", "Oh no, let me find a spare. One moment!"],
        ["guest", "Thanks. We were so close to winning!"],
        ["them", "Don't worry, I'll fix it."]
      ] }],
    ["16:00", "Noah와 카드 한 판", "team", {
      who: "Noah", whoKo: "스터디 친구", voices: { them: "m", guest: "f2" }, guestKo: "옆자리 학생",
      turns: [
        { say: "Hey! I brought a card game for our break. Want to play?", want: "좋다고, 하지만 규칙을 모른다고 하기", need: [["규칙",["rules","rule"]]], hint: ["Sure, but I don't know the ~.","Sure, but I don't know the…","Sure, but I don't know the rules."], model: "Sure, but I don't know the rules." },
        { say: "It's simple. You get seven cards. Match the color or the number.", want: "내 차례인지 묻기", need: [["내 차례",["my turn"]]], hint: ["Wait, is it ~?","Wait, is it my…","Wait, is it my turn?"], model: "Wait, is it my turn?" },
        { say: "Yes! Play any red card.", want: "빨간 카드가 없는데 한 장 뽑아야 하는지 묻기", need: [["뽑기",["draw","pick","take"]]], hint: ["I don't have a red one. Should I ~?","I don't have a red one. Should I draw…","I don't have a red one. Should I draw a card?"], model: "I don't have a red one. Should I draw a card?" },
        { say: "Yep. Oh, you got a skip card!", want: "운이 좋다고, 한 판 더 하자고 하기", need: [["한 판 더",["one more","another","again"]]], hint: ["Lucky me! Let's play ~ round.","Lucky me! Let's play one…","Lucky me! Let's play one more round."], model: "Lucky me! Let's play one more round." },
        { say: "You're on. Loser buys coffee.", want: "좋다고, 하지만 돈 아끼라고 장난치기", need: [["좋아",["deal","you're on","okay","sounds good"]]], hint: ["~! But you should save your money.","Deal!…","Deal! But you should save your money."], model: "Deal! But you should save your money." }
      ],
      overhear: [
        ["guest", "Is this seat taken?", [["Is this seat taken","이 자리 주인 있어요?","자리에 앉기 전에 묻는 말이에요."]]],
        ["them", "No, go ahead. We're almost done."],
        ["guest", "Thanks. Are you guys playing cards?"],
        ["them", "Yeah, but we're not very good."]
      ] }],
    ["19:00", "게임 모임에서 Sara와", "meetup", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "같은 모임 사람",
      turns: [
        { say: "You made it! We're about to start. Do you know this game?", want: "친구 집에서 한 번 해 본 적 있다고 하기", need: [["해 본 적",["played","have played","tried"]]], hint: ["I've ~ once at a friend's place.","I've played…","I've played it once at a friend's place."], model: "I've played it once at a friend's place.", chunk: ["I've played it","해 본 적 있어요","경험을 말할 때 현재완료를 써요."] },
        { say: "Then you're on my team. We need to beat these two.", want: "걱정 말라고, 우리가 이길 거라고 하기", need: [["이김",["win","beat"]]], hint: ["Don't worry, we're going to ~.","Don't worry, we're going to…","Don't worry, we're going to win."], model: "Don't worry, we're going to win." },
        { say: "Careful, one of them cheats! Whose turn is it?", want: "네 차례인 것 같다고 하기", need: [["네 차례",["your turn"]]], hint: ["I think it's ~.","I think it's your…","I think it's your turn."], model: "I think it's your turn." },
        { say: "Oh, right. Hmm, I'm stuck. Any ideas?", want: "다른 길로 돌아가 보는 건 어떠냐고 제안하기", need: [["제안",["how about","what about","why don't"]]], hint: ["~ around the other way?","How…","How about going around the other way?"], model: "How about going around the other way?", chunk: ["How about ~ing?","~하는 건 어때요?","가볍게 제안할 때 써요."] },
        { say: "Good idea! Okay, it worked. This is so fun!", want: "나도 정말 재미있다고, 더 자주 모이자고 하기", need: [["자주",["often"]]], hint: ["Me too! We should do this more ~.","Me too! We should do this more…","Me too! We should do this more often."], model: "Me too! We should do this more often." }
      ],
      overhear: [
        ["guest", "Whose turn is it? I lost track.", [["lost track","놓쳤어요","순서·시간을 잊었을 때 써요."]]],
        ["them", "Mine, I think. Hold on, let me roll."],
        ["guest", "Oh no, you rolled a one!"],
        ["them", "Typical. Okay, your turn."]
      ] }]
  ]],
  ["동호회 가입", [
    ["10:00", "신청서 복사", "copyshop", {
      who: "Owen", whoKo: "인쇄소 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Morning! What can I print for you?", want: "신청서를 흑백으로 다섯 장 복사해 달라고 하기", need: [["흑백",["black and white"]],["다섯",["five","5"]]], hint: ["~ in black and white, please.","Five…","Five copies in black and white, please."], model: "Five copies in black and white, please." },
        { say: "Sure. Single-sided or double-sided?", want: "종이를 아끼고 싶으니 양면으로 해 달라고 하기", need: [["양면",["double sided","double-sided"]]], hint: ["~, please. I want to save paper.","Double-sided,…","Double-sided, please. I want to save paper."], model: "Double-sided, please. I want to save paper." },
        { say: "No problem. Do you want them stapled?", want: "스테이플러 말고 클립이면 된다고 하기", need: [["클립",["clip","paper clip"]]], hint: ["No staples. A paper ~ is fine.","No staples. A paper…","No staples. A paper clip is fine."], model: "No staples. A paper clip is fine." },
        { say: "Okay. Here you go. That'll be two fifty.", want: "카드로 되는지, 현금만 되는지 묻기", need: [["카드",["cards","card"]]], hint: ["Do you take ~, or is it cash only?","Do you take…","Do you take cards, or is it cash only?"], model: "Do you take cards, or is it cash only?" },
        { say: "We take both.", want: "고맙다고, 동네 게시판이 어디 있는지 묻기", need: [["게시판",["bulletin board","board"]],["어디",["where","where's"]]], hint: ["Great. Where's the community ~?","Great. Where's the community bulletin…","Great. Where's the community bulletin board?"], model: "Great. Where's the community bulletin board?" }
      ],
      overhear: [
        ["guest", "Hi, could you scan this for me?", [["scan this","이걸 스캔하다","종이를 파일로 옮길 때 써요."]]],
        ["them", "Sure. Do you want it as a PDF or a photo?"],
        ["guest", "A PDF, please. And can you email it?"],
        ["them", "No problem. What's your email?"]
      ] }],
    ["14:00", "독서 모임 가입", "clubdesk", {
      who: "Ian", whoKo: "동호회 접수 담당", voices: { them: "m", guest: "f2" }, guestKo: "다른 지원자",
      turns: [
        { say: "Hi there! Interested in joining a club?", want: "독서 모임이 있는지 묻기", need: [["독서 모임",["book club","reading group"]]], hint: ["Yes. Do you have a ~?","Yes. Do you have a book…","Yes. Do you have a book club?"], model: "Yes. Do you have a book club?" },
        { say: "We do! It meets every other Thursday evening.", want: "'every other'가 무슨 뜻인지 묻기", need: [["뜻",["mean"]]], hint: ["What does 'every other Thursday' ~?","What does 'every other Thursday'…","What does 'every other Thursday' mean?"], model: "What does 'every other Thursday' mean?", chunk: ["every other","하나 걸러","every other Thursday는 2주에 한 번 목요일이에요."] },
        { say: "It means every second week. So twice a month.", want: "그럼 괜찮다고, 회비가 있는지 묻기", need: [["회비",["fee","dues","cost"]]], hint: ["That works for me. Is there a membership ~?","That works for me. Is there a membership…","That works for me. Is there a membership fee?"], model: "That works for me. Is there a membership fee?" },
        { say: "Ten dollars a month, but the first month is free.", want: "좋다고, 여기에 이름이랑 이메일만 쓰면 되는지 묻기", need: [["이메일",["email"]]], hint: ["Great. Do I just write my name and ~ here?","Great. Do I just write my name and…","Great. Do I just write my name and email here?"], model: "Great. Do I just write my name and email here?" },
        { say: "Yes. And what kind of books do you like?", want: "소설도 좋지만 요즘은 에세이에 빠졌다고 하기", need: [["에세이",["essays","essay"]],["요즘",["lately","these days"]]], hint: ["I like novels, but I've been ~ lately.","I like novels, but I've been into…","I like novels, but I've been into essays lately."], model: "I like novels, but I've been into essays lately.", chunk: ["be into","~에 빠져 있다","요즘 좋아하는 것을 말할 때 써요."] }
      ],
      overhear: [
        ["guest", "Is there a sign-up deadline?", [["sign-up deadline","신청 마감","마감일을 물을 때 써요."]]],
        ["them", "Friday at five. After that, you'll be on the waiting list.", [["waiting list","대기자 명단","자리가 날 때까지 기다리는 줄이에요."]]],
        ["guest", "Oh, then I'd better sign up now."],
        ["them", "Good idea. Here's a pen."]
      ] }],
    ["19:00", "한 주 이야기 나누기", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "There you are! So, how's your new hobby life?", want: "정말 바쁜 한 주였다고, 요리와 볼링과 등산을 했다고 하기", need: [["바쁨",["busy"]]], hint: ["It's been a ~ week. I did cooking, bowling, and hiking!","It's been a…","It's been a busy week. I did cooking, bowling, and hiking!"], model: "It's been a busy week. I did cooking, bowling, and hiking!" },
        { say: "Wow! Which one was your favorite?", want: "고르기 어렵지만 등산이 제일 좋았다고 하기", need: [["제일",["favorite","best"]]], hint: ["It's hard to choose, but hiking was my ~.","It's hard to choose, but hiking was my…","It's hard to choose, but hiking was my favorite."], model: "It's hard to choose, but hiking was my favorite." },
        { say: "Why hiking?", want: "머리가 맑아지고 운동도 돼서라고 하기", need: [["맑아짐",["clears my head","clear my head","clears my mind","fresh air"]]], hint: ["Because it ~, and I get exercise too.","Because it clears…","Because it clears my head, and I get exercise too."], model: "Because it clears my head, and I get exercise too." },
        { say: "I get that. Are you joining any clubs?", want: "방금 독서 모임에 가입했다고 하기", need: [["가입",["signed up","joined"]]], hint: ["I just ~ for a book club.","I just signed…","I just signed up for a book club."], model: "I just signed up for a book club.", chunk: ["sign up for","~에 가입하다","수업·동호회에 신청할 때 써요."] },
        { say: "Perfect! A hobby is a great way to make friends. Can I come on your next hike?", want: "물론이라고, 다음 토요일에 같이 가자고 하기", need: [["같이",["with me","together"]]], hint: ["Of course! Come ~ next Saturday.","Of course! Come with…","Of course! Come with me next Saturday."], model: "Of course! Come with me next Saturday." }
      ],
      overhear: [
        ["guest", "Sara, can I borrow your charger?", [["charger","충전기","전화기·노트북 충전기를 말해요."]]],
        ["them", "It's in the drawer by the TV."],
        ["guest", "Found it. Mine just died.", [["just died","방금 꺼졌어요","배터리가 다 됐을 때 써요."]]],
        ["them", "Happens to me all the time."]
      ] }]
  ]]
]);
