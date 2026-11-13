// 10주째 · 친구 사이 (64~70일째). 커피 약속, 서로 알아가기, 좋아하는 것, 생일 파티, 영화 수다, 고민 들어 주기, 고마운 마음.
// 장면 = [시간, 이름, 그림 id, 대본]. 그림 id가 week.js ART에 들어오면 열린다. 형식은 ~/sulsul-art/YEAR.md
WEEK(10, [
  ["커피 약속", [
    ["10:00", "커피 약속 잡기", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hi! Are you free after class? Let's get coffee at the cafe you always talk about.", want: "좋다고, 몇 시에 만나면 되는지 묻기", need: [["몇 시",["what time","when"]]], hint: ["I'd love to! ~ works for you?","I'd love to! What…","I'd love to! What time works for you?"], model: "I'd love to! What time works for you?" },
        { say: "How about two thirty?", want: "좋다고, 카페 앞에서 만나자고 하기", need: [["앞",["in front of","outside","at the entrance"]]], hint: ["Two thirty works. Let's meet ~ the cafe.","Two thirty works. Let's meet in…","Two thirty works. Let's meet in front of the cafe."], model: "Two thirty works. Let's meet in front of the cafe." },
        { say: "Perfect. Do you drink coffee in the afternoon? I can't. I won't sleep!", want: "나는 괜찮지만 오늘은 차를 마실지도 모른다고 하기", need: [["차",["tea"]]], hint: ["I'm fine with coffee, but I ~ today.","I'm fine with coffee, but I might…","I'm fine with coffee, but I might have tea today."], model: "I'm fine with coffee, but I might have tea today.", chunk: ["might","~일지도 몰라요","확실하지 않은 계획에 써요."] },
        { say: "Good idea. Oh, and it's my treat. I want to thank you for helping with my homework.", want: "그러지 않아도 되는데 고맙다고 하기", need: [["그러지 않아도",["you don't have to","no need","you didn't have to"]]], hint: ["~, but thank you!","You…","You don't have to, but thank you!"], model: "You don't have to, but thank you!", chunk: ["You don't have to","그러지 않아도 돼요","호의를 받으면서 겸손히 말할 때 써요."] },
        { say: "I insist. See you later!", want: "나중에 보자고, 정말 기대된다고 하기", need: [["기대",["can't wait","looking forward"]]], hint: ["See you later! I ~.","See you later! I can't…","See you later! I can't wait."], model: "See you later! I can't wait." }
      ],
      overhear: [
        ["them", "Did you finish the homework for Friday?", [["for Friday","금요일까지 낼","마감 날짜 앞에 for를 써요."]]],
        ["guest", "Not yet. I'm doing it tonight."],
        ["them", "Me too. I always leave it to the last minute.", [["the last minute","마지막 순간","미루다가 막판에 할 때 써요."]]],
        ["guest", "Same here, honestly."]
      ] }],
    ["14:30", "친구를 Leo에게 소개", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, you're back! Who's your friend?", want: "친구 Yuki를 소개하고 같은 반이라고 하기", need: [["소개",["this is","meet"]]], hint: ["Leo, ~ Yuki. We're in the same class.","Leo, this…","Leo, this is Yuki. We're in the same class."], model: "Leo, this is Yuki. We're in the same class.", chunk: ["This is ~","~예요(소개)","사람을 소개할 때 This is를 써요."] },
        { say: "Nice to meet you, Yuki! What can I get you two?", want: "나는 아이스 라테, Yuki는 말차 라테를 마신다고 하기", need: [["말차",["matcha"]]], hint: ["I'll have an iced latte, and she'd like a ~.","I'll have an iced latte, and she'd like a matcha…","I'll have an iced latte, and she'd like a matcha latte."], model: "I'll have an iced latte, and she'd like a matcha latte." },
        { say: "Great. Anything to eat? We have fresh cookies.", want: "초콜릿 칩 쿠키 하나를 나눠 먹자고 하기", need: [["나눔",["share","split"]]], hint: ["Let's ~ one chocolate chip cookie.","Let's…","Let's share one chocolate chip cookie."], model: "Let's share one chocolate chip cookie." },
        { say: "Coming up. That'll be twelve fifty.", want: "오늘은 Yuki가 사는 거라고 알려 주기", need: [["사는",["treat","paying","pay"]]], hint: ["She's paying today. It's her ~.","She's paying today. It's her…","She's paying today. It's her treat."], model: "She's paying today. It's her treat." },
        { say: "Got it. I'll bring everything to your table.", want: "고맙다고, 창가에 앉아 있겠다고 하기", need: [["창가",["window"]]], hint: ["Thanks, Leo! We'll be sitting by the ~.","Thanks, Leo! We'll be sitting by the…","Thanks, Leo! We'll be sitting by the window."], model: "Thanks, Leo! We'll be sitting by the window." }
      ],
      overhear: [
        ["guest", "Hi, is your Wi-Fi free for customers?", [["for customers","손님용","가게가 손님에게 제공하는 것에 써요."]]],
        ["them", "Yes, the password is on the receipt."],
        ["guest", "Perfect. I have to finish some work."],
        ["them", "Take your time. We're open until nine."]
      ] }],
    ["17:00", "산책하다 Ella 만나기", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "조깅하던 사람",
      turns: [
        { say: "Hi! Out for a walk? Is this your friend?", want: "Yuki와 커피를 마시고 산책하는 중이라고 하기", need: [["산책",["walk","walking"]]], hint: ["Yes, we had coffee, and now we're taking a ~.","Yes, we had coffee, and now we're taking a…","Yes, we had coffee, and now we're taking a walk."], model: "Yes, we had coffee, and now we're taking a walk." },
        { say: "That sounds like a perfect afternoon. How long have you two known each other?", want: "어학원에서 만난 지 두 달 됐다고 하기", need: [["두 달",["two months"]]], hint: ["We met at the language school ~ ago.","We met at the language school two…","We met at the language school two months ago."], model: "We met at the language school two months ago." },
        { say: "That's sweet. Do you hang out a lot?", want: "일주일에 한두 번 만난다고 하기", need: [["한두 번",["once or twice"]]], hint: ["We meet ~ a week.","We meet once…","We meet once or twice a week."], model: "We meet once or twice a week." },
        { say: "That's great. A friend nearby makes a big difference.", want: "정말 그렇다고, 이제 여기서 외롭지 않다고 하기", need: [["외롭",["lonely"]]], hint: ["It really does. I don't feel ~ here anymore.","It really does. I don't feel…","It really does. I don't feel lonely here anymore."], model: "It really does. I don't feel lonely here anymore." },
        { say: "Aw, that's lovely. Okay, Max is pulling me. Bye, you two!", want: "좋은 저녁 보내라고 인사하기", need: [["저녁",["evening","night"]]], hint: ["Bye, Ella! Have a nice ~.","Bye, Ella! Have a nice…","Bye, Ella! Have a nice evening."], model: "Bye, Ella! Have a nice evening." }
      ],
      overhear: [
        ["guest", "Excuse me, is your dog friendly?", [["friendly","사람을 잘 따르는","개가 순한지 물을 때 써요."]]],
        ["them", "Very! He loves everyone.", [["loves everyone","모두를 좋아해요","사람을 반기는 개를 말할 때 써요."]]],
        ["guest", "Can I pet him?"],
        ["them", "Sure, go ahead."]
      ] }]
  ]],
  ["서로 알아가기", [
    ["11:00", "Noah와 자기소개", "team", {
      who: "Noah", whoKo: "스터디 친구", voices: { them: "m", guest: "f2" }, guestKo: "옆자리 학생",
      turns: [
        { say: "Hey, I don't think we've really talked yet. Where are you from?", want: "한국에서 왔고 서울 근처에 산다고 하기", need: [["한국",["korea","seoul"]]], hint: ["I'm from ~, near Seoul.","I'm from…","I'm from Korea, near Seoul."], model: "I'm from Korea, near Seoul." },
        { say: "Cool! What do you study back home?", want: "컴퓨터 공학을 공부하고, 지금은 1년 쉬는 중이라고 하기", need: [["컴퓨터",["computer"]],["쉬는",["a year off","break","gap year","leave"]]], hint: ["I study ~. I'm taking a year off now.","I study computer…","I study computer science. I'm taking a year off now."], model: "I study computer science. I'm taking a year off now." },
        { say: "Oh, that's why you're so good with tech stuff. I'm studying design.", want: "재미있겠다고, 왜 디자인을 골랐는지 묻기", need: [["왜",["why"]],["선택",["choose","pick"]]], hint: ["That sounds fun. ~ design?","That sounds fun. Why…","That sounds fun. Why did you choose design?"], model: "That sounds fun. Why did you choose design?" },
        { say: "I like drawing, and I like making things people use.", want: "나도 만드는 걸 좋아한다고, 우리 비슷하다고 하기", need: [["비슷",["similar","alike"]]], hint: ["I like making things too. We're pretty ~.","I like making things too. We're pretty…","I like making things too. We're pretty similar."], model: "I like making things too. We're pretty similar." },
        { say: "Ha, we are! Want to grab lunch and keep talking?", want: "좋다고, 학교 식당에서 먹자고 하기", need: [["식당",["cafeteria"]]], hint: ["Sure! Let's go to the school ~.","Sure! Let's go to the school…","Sure! Let's go to the school cafeteria."], model: "Sure! Let's go to the school cafeteria." }
      ],
      overhear: [
        ["guest", "Noah, do you mind if I sit here?", [["do you mind if","~해도 될까요","허락을 정중하게 구할 때 써요."]]],
        ["them", "Not at all. I'm just finishing up.", [["finishing up","마무리하는 중","거의 끝났다는 뜻이에요."]]],
        ["guest", "Thanks. I need a quiet spot to study."],
        ["them", "This is the best corner for that."]
      ] }],
    ["13:00", "친구와 점심 줄 서기", "cafeteria", {
      who: "Rita", whoKo: "학교 식당 직원", voices: { them: "f2", guest: "m" }, guestKo: "뒤에 선 학생",
      turns: [
        { say: "Hi, hon! Is that your friend with you today?", want: "맞다고, 친구 Noah랑 같이 점심을 먹는다고 하기", need: [["친구",["friend"]]], hint: ["Yes, this is my ~ Noah. We're having lunch together.","Yes, this is my…","Yes, this is my friend Noah. We're having lunch together."], model: "Yes, this is my friend Noah. We're having lunch together." },
        { say: "Nice! Today's special is chicken curry. What would you like?", want: "카레로 하고 순하게 해 달라고 하기", need: [["순하게",["mild","not spicy"]]], hint: ["I'll have the curry, ~, please.","I'll have the curry,…","I'll have the curry, mild, please."], model: "I'll have the curry, mild, please." },
        { say: "Rice or noodles with it?", want: "밥으로, 배고프니까 많이 달라고 하기", need: [["많이",["a lot","extra","more","lots"]]], hint: ["Rice, please. ~, I'm really hungry.","Rice, please. A…","Rice, please. A lot, I'm really hungry."], model: "Rice, please. A lot, I'm really hungry." },
        { say: "Sure thing. Anything to drink?", want: "물이랑 사과 주스를 달라고 하기", need: [["주스",["juice"]]], hint: ["Water and an apple ~, please.","Water and an apple…","Water and an apple juice, please."], model: "Water and an apple juice, please." },
        { say: "Here you go. Enjoy your lunch, you two!", want: "고맙다고, 여기 음식은 늘 맛있다고 하기", need: [["늘",["always"]]], hint: ["Thanks, Rita! The food here is ~ good.","Thanks, Rita! The food here is…","Thanks, Rita! The food here is always good."], model: "Thanks, Rita! The food here is always good." }
      ],
      overhear: [
        ["guest", "Is the soup vegetarian?", [["vegetarian","채식","고기가 없는 음식을 말해요."]]],
        ["them", "Yes, it's made with vegetable broth.", [["broth","육수","국물 베이스예요."]]],
        ["guest", "Great, I'll have a bowl."],
        ["them", "Small or large?"]
      ] }],
    ["17:00", "Yuki의 고향 이야기", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hi! You look like you have something to ask.", want: "일본 어디에서 왔는지 묻기", need: [["어디",["where"]],["출신",["from"]]], hint: ["Yes! ~ are you from?","Yes! Where…","Yes! Where in Japan are you from?"], model: "Yes! Where in Japan are you from?" },
        { say: "I'm from Osaka. It's famous for food!", want: "가 보고 싶다고, 거기서 뭘 먹어야 하는지 묻기", need: [["뭐",["what"]],["먹어야",["should"]]], hint: ["I'd love to go. ~ there?","I'd love to go. What…","I'd love to go. What should I eat there?"], model: "I'd love to go. What should I eat there?" },
        { say: "Takoyaki! Octopus balls. They're delicious.", want: "문어라니 놀랍다고, 먹어 보고 싶다고 하기", need: [["먹어 보기",["try"]]], hint: ["Octopus? Wow, I want to ~.","Octopus? Wow, I want to try…","Octopus? Wow, I want to try it."], model: "Octopus? Wow, I want to try it." },
        { say: "I'll make some for you someday. What's your hometown like?", want: "산이 많은 조용한 동네라고 하기", need: [["조용",["quiet"]]], hint: ["It's a ~ near Seoul, with lots of mountains.","It's a quiet…","It's a quiet town near Seoul, with lots of mountains."], model: "It's a quiet town near Seoul, with lots of mountains." },
        { say: "Sounds peaceful. Sometimes I miss my family a lot.", want: "공감한다고, 나도 가끔 가족이 보고 싶다고 하기", need: [["보고 싶음",["miss"]]], hint: ["I understand. I ~ my family sometimes too.","I understand. I…","I understand. I miss my family sometimes too."], model: "I understand. I miss my family sometimes too." }
      ],
      overhear: [
        ["them", "Did you see the notice about the field trip?", [["field trip","현장 학습","학교에서 단체로 가는 소풍이에요."]]],
        ["guest", "No, when is it?"],
        ["them", "Next Thursday. We have to sign up by Monday.", [["sign up by","~까지 신청하다","신청 마감 앞에 by를 써요."]]],
        ["guest", "Thanks for telling me!"]
      ] }]
  ]],
  ["좋아하는 것", [
    ["12:00", "좋아하는 음악 이야기", "busker", {
      who: "Eli", whoKo: "광장 거리 악사", voices: { them: "m2", guest: "f" }, guestKo: "구경하던 사람",
      turns: [
        { say: "Hey there! What kind of music do you like?", want: "잔잔한 어쿠스틱 노래를 제일 좋아한다고 하기", need: [["좋아",["love","like","favorite"]]], hint: ["I ~ the most.","I love…","I love soft, acoustic songs the most."], model: "I love soft, acoustic songs the most." },
        { say: "Nice taste! Do you have a favorite artist?", want: "한 명만 고르기는 어렵다고 하기", need: [["고르기",["pick","choose"]]], hint: ["It's hard to ~ just one!","It's hard to…","It's hard to pick just one!"], model: "It's hard to pick just one!" },
        { say: "Ha, fair. What song makes you feel good right away?", want: "비 오는 날 마음이 편해지는 노래가 있다고 하기", need: [["편해짐",["makes me feel","calm","relaxed"]]], hint: ["There's a song that ~ calm on rainy days.","There's a song that makes…","There's a song that makes me feel calm on rainy days."], model: "There's a song that makes me feel calm on rainy days." },
        { say: "I know that feeling. Want to request one?", want: "느린 곡 하나만 연주해 줄 수 있는지 묻기", need: [["연주",["play"]]], hint: ["Yes, could you ~ for me?","Yes, could you play…","Yes, could you play a slow song for me?"], model: "Yes, could you play a slow song for me?" },
        { say: "You got it. Sit and enjoy!", want: "고맙다고, 여기 앉아도 되는지 묻기", need: [["앉기",["sit"]]], hint: ["Thanks! Is it okay if I ~ here?","Thanks! Is it okay if I…","Thanks! Is it okay if I sit here?"], model: "Thanks! Is it okay if I sit here?" }
      ],
      overhear: [
        ["guest", "What's the name of that last song?", [["the name of","~의 이름","제목을 물을 때 써요."]]],
        ["them", "It's one I wrote myself. I haven't named it yet."],
        ["guest", "Well, I love it. Do you have a recording?", [["recording","녹음","음악 파일이나 음반이에요."]]],
        ["them", "Not yet, but I'm working on it."]
      ] }],
    ["15:00", "쉬는 시간에 좋아하는 책", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "책 고르던 손님",
      turns: [
        { say: "You're on your break, right? What are you reading?", want: "소설이고 주인공이 정말 좋다고 하기", need: [["소설",["novel"]],["주인공",["main character","character"]]], hint: ["It's a ~. I really like the main character.","It's a…","It's a novel. I really like the main character."], model: "It's a novel. I really like the main character." },
        { say: "Oh, I love that one! Which part are you at?", want: "절반쯤 읽었고 결말이 너무 궁금하다고 하기", need: [["궁금",["dying to know","curious","want to know"]]], hint: ["I'm halfway through, and I'm ~ the ending.","I'm halfway through, and I'm dying…","I'm halfway through, and I'm dying to know the ending."], model: "I'm halfway through, and I'm dying to know the ending." },
        { say: "No spoilers, but you'll cry! What's your favorite genre?", want: "추리 소설을 좋아하고 반전이 재미있어서라고 하기", need: [["추리",["mystery","detective"]],["반전",["twist","twists"]]], hint: ["I like ~ books because I enjoy the twists.","I like…","I like mystery books because I enjoy the twists."], model: "I like mystery books because I enjoy the twists." },
        { say: "Same! I can recommend a few. Do you like long books?", want: "너무 길지 않은 책이 좋다고 하기", need: [["길지 않은",["not too long","aren't too long","short"]]], hint: ["I prefer books that ~.","I prefer books that aren't…","I prefer books that aren't too long."], model: "I prefer books that aren't too long." },
        { say: "Great, I'll put three on your desk tomorrow.", want: "고맙다고, 마음 써 줘서 감사하다고 하기", need: [["고마움",["thank","thanks","appreciate"]]], hint: ["~, Olivia! That's so kind.","Thank…","Thank you, Olivia! That's so kind."], model: "Thank you, Olivia! That's so kind." }
      ],
      overhear: [
        ["guest", "Do you have a copy of this one in paperback?", [["in paperback","문고판으로","얇은 종이 표지 책이에요."]]],
        ["them", "We do, but it's on backorder.", [["on backorder","재입고 대기 중인","주문해야 들어온다는 뜻이에요."]]],
        ["guest", "How long will it take?"],
        ["them", "About a week, I think."]
      ] }],
    ["20:00", "Sara와 좋아하는 음식", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Dinner's ready! Do you like spicy food? I made curry.", want: "매운 음식을 아주 좋아한다고, 한국 사람이라서 그런 것 같다고 하기", need: [["매운",["spicy"]],["한국",["korean","korea"]]], hint: ["I love spicy food. I guess it's because I'm ~!","I love spicy food. I guess it's because I'm…","I love spicy food. I guess it's because I'm Korean!"], model: "I love spicy food. I guess it's because I'm Korean!" },
        { say: "Ha! What's your favorite Korean food?", want: "김치찌개가 제일 좋고, 집이 생각난다고 하기", need: [["김치찌개",["kimchi stew","kimchi"]]], hint: ["~ is my favorite. It reminds me of home.","Kimchi…","Kimchi stew is my favorite. It reminds me of home."], model: "Kimchi stew is my favorite. It reminds me of home.", chunk: ["reminds me of","~가 생각나게 해요","무엇이 다른 것을 떠올리게 할 때 써요."] },
        { say: "I'd love to try it. Is it hard to make?", want: "생각보다 쉽다고 하기", need: [["쉬움",["easier","easy","simple"]]], hint: ["It's ~ than you think.","It's…","It's easier than you think."], model: "It's easier than you think." },
        { say: "Then teach me! What else do you like to do on weekends?", want: "집에서 영화를 보거나 산책을 한다고 하기", need: [["영화",["movie","movies"]],["산책",["walk"]]], hint: ["I watch ~ at home or go for a walk.","I watch…","I watch movies at home or go for a walk."], model: "I watch movies at home or go for a walk." },
        { say: "Same! We have so much in common.", want: "정말 그렇다고, 친구가 돼서 너무 기쁘다고 하기", need: [["기쁨",["happy","glad","lucky"]]], hint: ["We really do. I'm so ~ we're friends.","We really do. I'm so…","We really do. I'm so happy we're friends."], model: "We really do. I'm so happy we're friends.", chunk: ["in common","공통으로","서로 비슷한 점을 말할 때 써요."] }
      ],
      overhear: [
        ["guest", "Sara, what are you cooking? It smells great.", [["smells great","냄새가 좋아요","음식 냄새를 칭찬할 때 써요."]]],
        ["them", "Curry! Do you want it mild or spicy?"],
        ["guest", "Medium, please."],
        ["them", "Okay, a bowl of medium coming up."]
      ] }]
  ]],
  ["생일 파티", [
    ["11:00", "생일 선물 고르기", "souvenir", {
      who: "Hannah", whoKo: "기념품 가게 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Looking for a gift?", want: "친구 생일 선물이 필요하다고 하기", need: [["생일",["birthday"]]], hint: ["Yes, I need a ~ gift for my friend.","Yes, I need a…","Yes, I need a birthday gift for my friend."], model: "Yes, I need a birthday gift for my friend." },
        { say: "Lovely! What does your friend like?", want: "일본 친구이고 차를 좋아한다고 하기", need: [["차",["tea"]]], hint: ["She's from Japan, and she loves ~.","She's from Japan, and she loves…","She's from Japan, and she loves tea."], model: "She's from Japan, and she loves tea." },
        { say: "Then this tea set is popular. It's thirty dollars.", want: "조금 부담되니 덜 비싼 것이 있는지 묻기", need: [["덜 비싼",["less expensive","cheaper","lower"]]], hint: ["That's a bit much. Do you have a ~ one?","That's a bit much. Do you have a less…","That's a bit much. Do you have a less expensive one?"], model: "That's a bit much. Do you have a less expensive one?" },
        { say: "How about a tea cup and a small box of tea? Twenty dollars.", want: "그게 딱 좋다고, 선물 포장을 부탁하기", need: [["포장",["wrap"]]], hint: ["That's perfect. Could you ~ it, please?","That's perfect. Could you gift…","That's perfect. Could you gift wrap it, please?"], model: "That's perfect. Could you gift wrap it, please?" },
        { say: "Of course. Here's a card, too. Want to write a message?", want: "고맙다고, 펜을 빌려 달라고 하기", need: [["빌려",["borrow","use","lend"]]], hint: ["Thanks! Can I ~?","Thanks! Can I borrow…","Thanks! Can I borrow a pen?"], model: "Thanks! Can I borrow a pen?" }
      ],
      overhear: [
        ["guest", "Do you have anything small and light?", [["small and light","작고 가벼운","선물·여행 짐을 고를 때 써요."]]],
        ["them", "These key chains are popular. They fit in a pocket."],
        ["guest", "Cute! I'll take two."],
        ["them", "Great. Would you like them in a bag?"]
      ] }],
    ["14:00", "케이크 주문", "cakeshop", {
      who: "Theo", whoKo: "빵집 제빵사", voices: { them: "m", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! How can I help you?", want: "오늘 밤 생일 파티에 쓸 작은 케이크를 사고 싶다고 하기", need: [["케이크",["cake"]]], hint: ["I'd like a small ~ for a birthday party tonight.","I'd like a small…","I'd like a small cake for a birthday party tonight."], model: "I'd like a small cake for a birthday party tonight." },
        { say: "Sure! Chocolate, vanilla, or strawberry?", want: "딸기로, 위에 'Happy Birthday, Yuki'를 써 줄 수 있는지 묻기", need: [["써 주기",["write"]]], hint: ["Strawberry, please. Can you ~ 'Happy Birthday, Yuki' on it?","Strawberry, please. Can you…","Strawberry, please. Can you write 'Happy Birthday, Yuki' on it?"], model: "Strawberry, please. Can you write 'Happy Birthday, Yuki' on it?" },
        { say: "Of course. Do you want candles?", want: "초는 다섯 개면 충분하다고 하기", need: [["다섯",["five","5"]]], hint: ["~ candles is enough, thanks.","Five…","Five candles is enough, thanks."], model: "Five candles is enough, thanks." },
        { say: "No problem. It'll be ready at five. Can you pick it up then?", want: "5시까지 올 수 있고, 늦으면 전화해 달라고 하기", need: [["전화",["call"]],["5시까지",["by five"]]], hint: ["I can be here ~. Please call me if it's late.","I can be here by…","I can be here by five. Please call me if it's late."], model: "I can be here by five. Please call me if it's late.", chunk: ["by five","5시까지","by는 '늦어도 그 시간까지'라는 뜻이에요."] },
        { say: "Will do. What's the name for the order?", want: "이름을 말하고 철자를 알려 주겠다고 하기", need: [["철자",["spell"]]], hint: ["It's {name}. Let me ~ for you.","It's {name}. Let me spell…","It's {name}. Let me spell it for you."], model: "It's {name}. Let me spell it for you." }
      ],
      overhear: [
        ["guest", "Hi, I ordered a cake under Park.", [["under Park","Park 이름으로","예약·주문한 이름 앞에 under를 써요."]]],
        ["them", "Let me look. Yes, here it is. A lemon cake?"],
        ["guest", "That's the one. It looks perfect!"],
        ["them", "Thank you! Do you want a box?"]
      ] }],
    ["18:00", "Yuki의 생일 파티", "yukiparty", {
      who: "Yuki", whoKo: "생일 맞은 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "You came! Come in, come in. Is that for me?", want: "생일 축하한다고 하며 선물을 건네기", need: [["축하",["happy birthday","congratulations"]]], hint: ["~, Yuki! This is for you.","Happy…","Happy birthday, Yuki! This is for you."], model: "Happy birthday, Yuki! This is for you." },
        { say: "Oh, thank you! I'll open it now… Wow, a tea cup! It's so cute.", want: "마음에 들었으면 했다고 하기", need: [["바람",["hoped","hope"]]], hint: ["I ~!","I hoped…","I hoped you'd like it!"], model: "I hoped you'd like it!" },
        { say: "I love it. Everyone's in the kitchen. Can you help me light the candles?", want: "물론이라고, 라이터가 어디 있는지 묻기", need: [["라이터",["lighter","matches"]]], hint: ["Of course! Where's the ~?","Of course! Where's the…","Of course! Where's the lighter?"], model: "Of course! Where's the lighter?" },
        { say: "On the shelf. Okay, ready? Everyone, sing!", want: "노래는 못하지만 큰 소리로 부르겠다고 하기", need: [["큰 소리",["loud","loudly"]]], hint: ["I can't sing well, but I'll sing ~!","I can't sing well, but I'll sing…","I can't sing well, but I'll sing loudly!"], model: "I can't sing well, but I'll sing loudly!" },
        { say: "Thank you, everyone! I made a wish… Here's the first piece, for you.", want: "소원이 뭐였는지 묻기", need: [["소원",["wish"]]], hint: ["What did you ~ for?","What did you…","What did you wish for?"], model: "What did you wish for?" }
      ],
      overhear: [
        ["guest", "Yuki, where should I put my coat?", [["put my coat","코트를 두다","손님이 겉옷 둘 곳을 물을 때 써요."]]],
        ["them", "On the bed in the back room."],
        ["guest", "Thanks. This place looks so cozy!", [["cozy","아늑한","작고 포근한 곳을 말할 때 써요."]]],
        ["them", "Thank you! Help yourself to some snacks."]
      ] }]
  ]],
  ["영화 보고 수다", [
    ["14:00", "영화표 사기", "movie", {
      who: "Ava", whoKo: "매표소 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! What can I get you?", want: "3시 30분 영화 두 장을 달라고 하기", need: [["두 장",["two"]]], hint: ["~ for the three thirty show, please.","Two…","Two tickets for the three thirty show, please."], model: "Two tickets for the three thirty show, please." },
        { say: "Sure. Which movie?", want: "새로 나온 우주 영화라고 하기", need: [["우주",["space"]]], hint: ["The new ~ movie, please.","The new…","The new space movie, please."], model: "The new space movie, please." },
        { say: "The back rows are open. Is that okay?", want: "화면에서 너무 가깝지 않은 자리를 부탁하기", need: [["너무 가깝지 않은",["not too close","too close"]]], hint: ["Could we sit ~ to the screen?","Could we sit not…","Could we sit not too close to the screen?"], model: "Could we sit not too close to the screen?" },
        { say: "Row H, then. Want popcorn? There's a combo for two.", want: "콤보 하나, 팝콘에는 버터를 빼 달라고 하기", need: [["콤보",["combo"]]], hint: ["Yes, one ~, with no butter on the popcorn, please.","Yes, one…","Yes, one combo, with no butter on the popcorn, please."], model: "Yes, one combo, with no butter on the popcorn, please.", chunk: ["combo","세트 메뉴","음식과 음료를 묶은 메뉴예요."] },
        { say: "Sure. That's forty dollars. Theater five.", want: "카드를 내며 극장이 5관이 맞는지 확인하기", need: [["확인",["theater five","five","right"]]], hint: ["Here's my card. ~, right?","Here's my card. Theater…","Here's my card. Theater five, right?"], model: "Here's my card. Theater five, right?" }
      ],
      overhear: [
        ["guest", "Is the three o'clock show still available?", [["still available","아직 있어요","자리·표가 남았는지 물을 때 써요."]]],
        ["them", "Yes, but it's almost full. Where would you like to sit?"],
        ["guest", "Anywhere is fine."],
        ["them", "Okay, two seats in row C."]
      ] }],
    ["16:30", "극장 앞 사진", "snap", {
      who: "Lily", whoKo: "지나가던 관광객", voices: { them: "f2", guest: "m2" }, guestKo: "다른 관광객",
      turns: [
        { say: "Hi there! Enjoying the movie poster too?", want: "친구랑 포스터 앞에서 사진을 찍고 싶은데 부탁해도 되는지 묻기", need: [["부탁",["could you","can you","would you"]]], hint: ["Yes! ~ a picture of us, please?","Yes! Could…","Yes! Could you take a picture of us, please?"], model: "Yes! Could you take a picture of us, please?" },
        { say: "Sure! Should I take it vertical or horizontal?", want: "세로로 해 달라고, 포스터 전체가 나오게 해 달라고 하기", need: [["세로",["vertical","portrait"]]], hint: ["~, please. I want the whole poster in it.","Vertical,…","Vertical, please. I want the whole poster in it."], model: "Vertical, please. I want the whole poster in it." },
        { say: "Got it. Three, two, one. How's that?", want: "한 장 더 찍어 달라고, 눈을 깜빡인 것 같다고 하기", need: [["한 장 더",["another","one more"]]], hint: ["Could you take ~? I think I blinked.","Could you take…","Could you take another? I think I blinked."], model: "Could you take another? I think I blinked.", chunk: ["blinked","눈을 깜빡였어요","사진에서 눈 감았을 때 써요."] },
        { say: "Sure! Look at the camera… Perfect!", want: "정말 잘 나왔다고 하기", need: [["잘 나옴",["turned out","great","good","perfect"]]], hint: ["It ~ great!","It turned…","It turned out great!"], model: "It turned out great!", chunk: ["turned out","~하게 나왔어요","결과가 어떤지 말할 때 써요."] },
        { say: "Thanks! Can you take mine too?", want: "물론이라고, 어디에 서고 싶은지 묻기", need: [["어디",["where"]],["서기",["stand"]]], hint: ["Of course! ~ to stand?","Of course! Where…","Of course! Where do you want to stand?"], model: "Of course! Where do you want to stand?" }
      ],
      overhear: [
        ["guest", "Excuse me, can you take our picture?", [["take our picture","우리 사진을 찍다","지나가는 사람에게 부탁할 때 써요."]]],
        ["them", "Sure! Back up a little so I can fit everyone in.", [["fit everyone in","모두 담다","사진에 다 나오게 할 때 써요."]]],
        ["guest", "Like this?"],
        ["them", "Perfect. Say cheese!"]
      ] }],
    ["19:00", "영화 보고 저녁 수다", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Evening! Table for two? How was the movie?", want: "재미있었고, 결말이 놀라웠다고 하기", need: [["결말",["ending"]],["놀람",["surprised","surprising"]]], hint: ["It was great! The ~ me.","It was great! The ending…","It was great! The ending surprised me."], model: "It was great! The ending surprised me." },
        { say: "Glad to hear it. Here are the menus. Can I start you with drinks?", want: "물 두 잔과 콜라 한 잔을 달라고 하기", need: [["콜라",["cola","coke"]]], hint: ["Two waters and one ~, please.","Two waters and one…","Two waters and one cola, please."], model: "Two waters and one cola, please." },
        { say: "Sure. Ready to order?", want: "아직인데 오늘의 추천 메뉴가 뭔지 묻기", need: [["추천",["today's special","special","recommend"]]], hint: ["Not yet. What's ~?","Not yet. What's today's…","Not yet. What's today's special?"], model: "Not yet. What's today's special?" },
        { say: "Grilled salmon with vegetables.", want: "연어로 하고, 잘 익혀 달라고 하기", need: [["연어",["salmon"]]], hint: ["I'll have the ~, well cooked, please.","I'll have the…","I'll have the salmon, well cooked, please."], model: "I'll have the salmon, well cooked, please." },
        { say: "Perfect. Anything else?", want: "아니, 지금은 이게 다라고 하기", need: [["다",["that's all","that's it","that is all"]]], hint: ["No, ~ for now. Thank you!","No, that's…","No, that's all for now. Thank you!"], model: "No, that's all for now. Thank you!" }
      ],
      overhear: [
        ["guest", "Could we get some extra napkins?", [["extra napkins","냅킨 좀 더","식당에서 물품을 더 달라고 할 때 써요."]]],
        ["them", "Of course. Is everything okay with the food?"],
        ["guest", "It's delicious, but a little messy!", [["messy","지저분해지기 쉬운","손에 묻는 음식에 써요."]]],
        ["them", "That's the best kind. I'll bring more."]
      ] }]
  ]],
  ["고민 들어 주기", [
    ["10:00", "Noah의 걱정", "team", {
      who: "Noah", whoKo: "스터디 친구", voices: { them: "m", guest: "f2" }, guestKo: "옆자리 학생",
      turns: [
        { say: "Hey… do you have a minute? I'm kind of stressed.", want: "물론이라고, 무슨 일이냐고 묻기", need: [["무슨 일",["what's wrong","what's up","what happened"]]], hint: ["Of course. ~?","Of course. What's…","Of course. What's wrong?"], model: "Of course. What's wrong?" },
        { say: "I have a big presentation tomorrow, and I can't focus.", want: "어느 부분이 제일 걱정되는지 묻기", need: [["걱정",["worried","worry"]]], hint: ["Which part are you most ~ about?","Which part are you most…","Which part are you most worried about?"], model: "Which part are you most worried about?" },
        { say: "The Q&A. What if they ask something I can't answer?", want: "모르는 건 모른다고 솔직하게 말해도 된다고 하기", need: [["솔직",["honest","honestly"]]], hint: ["It's okay to say you don't know. Just be ~.","It's okay to say you don't know. Just be…","It's okay to say you don't know. Just be honest."], model: "It's okay to say you don't know. Just be honest." },
        { say: "Yeah… you're right. Can you practice with me?", want: "물론이라고, 어려운 질문을 해 주겠다고 하기", need: [["연습",["practice"]]], hint: ["Sure, I'll ask you some tough questions to ~.","Sure, I'll ask you some tough questions to…","Sure, I'll ask you some tough questions to practice."], model: "Sure, I'll ask you some tough questions to practice." },
        { say: "Thanks. I feel better already.", want: "누구나 긴장한다고, 잘할 거라고 하기", need: [["잘할",["do great","do well","be fine"]]], hint: ["Everyone gets nervous. You'll ~!","Everyone gets nervous. You'll do…","Everyone gets nervous. You'll do great!"], model: "Everyone gets nervous. You'll do great!" }
      ],
      overhear: [
        ["guest", "Noah, you look tired. Did you sleep last night?", [["look tired","피곤해 보여요","상대 컨디션을 걱정할 때 써요."]]],
        ["them", "Barely. I was up until three.", [["Barely","거의 못 했어요","겨우 조금만 했다는 뜻이에요."]]],
        ["guest", "You should take a break and get some air."],
        ["them", "Yeah, maybe after this chapter."]
      ] }],
    ["15:00", "시험이 힘들었던 Yuki", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hi… I had a bad day. My English test was hard.", want: "안됐다고, 얘기하고 싶으면 들어 주겠다고 하기", need: [["들어 주기",["listen"]]], hint: ["I'm sorry to hear that. I'm here to ~.","I'm sorry to hear that. I'm here to…","I'm sorry to hear that. I'm here to listen."], model: "I'm sorry to hear that. I'm here to listen." },
        { say: "I studied so much, but I froze. I couldn't speak at all.", want: "나도 그랬다고, 지난달에 그런 적 있다고 하기", need: [["그런 적",["been there","happened to me","me too"]]], hint: ["~. It happened to me last month.","Been…","Been there. It happened to me last month."], model: "Been there. It happened to me last month." },
        { say: "Really? What did you do?", want: "심호흡을 하고 천천히 말했다고 하기", need: [["심호흡",["deep breath"]]], hint: ["I took a ~ and spoke slowly.","I took a deep…","I took a deep breath and spoke slowly."], model: "I took a deep breath and spoke slowly." },
        { say: "That's a good tip. Maybe I'm too hard on myself.", want: "넌 이미 많이 늘었다고, 진심이라고 하기", need: [["늘었다",["improved","better","progress"]]], hint: ["You've already ~ a lot. I mean it.","You've already…","You've already improved a lot. I mean it."], model: "You've already improved a lot. I mean it.", chunk: ["I mean it","진심이에요","빈말이 아니라고 강조할 때 써요."] },
        { say: "Thank you. Want to get ice cream?", want: "좋다고, 오늘은 내가 산다고 하기", need: [["내가 산다",["on me","my treat","i'll pay","i'm paying"]]], hint: ["Yes! It's ~ today.","Yes! It's on…","Yes! It's on me today."], model: "Yes! It's on me today.", chunk: ["on me","내가 낼게요","밥값을 내가 낼 때 써요."] }
      ],
      overhear: [
        ["them", "Sorry I'm so quiet today. I'm just tired.", [["I'm just tired","그냥 피곤해서요","이유를 가볍게 말할 때 써요."]]],
        ["guest", "That's okay. Do you want to talk about it?"],
        ["them", "Maybe later. Can we just sit for a bit?", [["for a bit","잠깐","짧은 시간을 말할 때 써요."]]],
        ["guest", "Of course."]
      ] }],
    ["20:00", "Sara의 고민", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Hey, sorry I called so late. Can I talk to you for a bit?", want: "물론이라고, 계속 말하라고, 듣고 있다고 하기", need: [["듣고",["listening","go ahead"]]], hint: ["Sure, go ahead. I'm ~.","Sure, go ahead. I'm…","Sure, go ahead. I'm listening."], model: "Sure, go ahead. I'm listening." },
        { say: "I'm thinking about quitting my job. My boss keeps giving me extra work.", want: "정말 힘들었겠다고 하기", need: [["힘듦",["tough","hard","rough"]]], hint: ["That sounds really ~. How long has it been like this?","That sounds really…","That sounds really tough. How long has it been like this?"], model: "That sounds really tough. How long has it been like this?" },
        { say: "About three months. I'm exhausted.", want: "상사와 그 일로 이야기해 봤는지 묻기", need: [["이야기",["talked","spoken","talk"]]], hint: ["Have you ~ to your boss about it?","Have you…","Have you talked to your boss about it?"], model: "Have you talked to your boss about it?" },
        { say: "Not yet. I'm scared it'll make things worse.", want: "이해하지만 먼저 얘기해 보는 게 나을지도 모른다고 말하기", need: [["낫다",["better","should"]]], hint: ["I understand, but maybe it's ~ to talk first.","I understand, but maybe it's…","I understand, but maybe it's better to talk first."], model: "I understand, but maybe it's better to talk first." },
        { say: "You're probably right. Thanks for listening.", want: "언제나 네 곁에 있겠다고 하기", need: [["곁",["here for you","with you","support"]]], hint: ["Anytime. I'm always ~.","Anytime. I'm always here…","Anytime. I'm always here for you."], model: "Anytime. I'm always here for you." }
      ],
      overhear: [
        ["guest", "Sara, you've been quiet all night. What's on your mind?", [["What's on your mind","무슨 생각해요?","걱정이 있어 보이는 사람에게 써요."]]],
        ["them", "Just work stuff. I'll tell you later."],
        ["guest", "Okay. Do you want some tea?"],
        ["them", "That would be nice, thanks."]
      ] }]
  ]],
  ["고마운 마음", [
    ["11:00", "감사 카드 고르기", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "책 고르던 손님",
      turns: [
        { say: "Hi! Shopping on your day off?", want: "친구들에게 줄 감사 카드를 찾는다고 하기", need: [["감사 카드",["thank you card","thank-you card","thank you cards","thank-you cards","cards"]]], hint: ["Yes, I'm looking for ~ for my friends.","Yes, I'm looking for thank-you…","Yes, I'm looking for thank-you cards for my friends."], model: "Yes, I'm looking for thank-you cards for my friends." },
        { say: "Aw, sweet. They're on the second shelf. How many do you need?", want: "친한 친구가 네 명이라 네 장이 필요하다고 하기", need: [["네 장",["four"]]], hint: ["I need ~, because I have four close friends here.","I need…","I need four, because I have four close friends here."], model: "I need four, because I have four close friends here." },
        { say: "That's lovely. Do you want plain ones, or with a picture?", want: "꽃이 그려진 걸로 달라고 하기", need: [["꽃",["flowers","flower"]]], hint: ["Ones with ~ on them, please.","Ones with…","Ones with flowers on them, please."], model: "Ones with flowers on them, please." },
        { say: "Good choice. Do you need envelopes? They're free.", want: "카드마다 봉투 하나씩 달라고 하기", need: [["봉투",["envelope","envelopes"]]], hint: ["Yes, one ~ for each card, please.","Yes, one…","Yes, one envelope for each card, please."], model: "Yes, one envelope for each card, please." },
        { say: "Here you go. That's twelve dollars.", want: "직원 할인이 되는지 묻기", need: [["할인",["discount"]]], hint: ["Do I get the employee ~?","Do I get the employee…","Do I get the employee discount?"], model: "Do I get the employee discount?" }
      ],
      overhear: [
        ["guest", "Do you have any gift cards?", [["gift cards","상품권","선물로 주는 충전식 카드예요."]]],
        ["them", "We do, in ten, twenty, and fifty.", [["in ten, twenty","10, 20달러짜리","금액 종류를 말할 때 써요."]]],
        ["guest", "I'll take a twenty, please."],
        ["them", "Sure. Do you want it in an envelope?"]
      ] }],
    ["15:00", "Leo에게 고마움 전하기", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey! The usual?", want: "오늘은 고맙다는 인사를 하러 왔다고 하기", need: [["감사",["thank","thanks"]]], hint: ["Today I came to say ~.","Today I came to say thank…","Today I came to say thank you."], model: "Today I came to say thank you." },
        { say: "Me? Why?", want: "처음 온 날부터 늘 친절했다고 하기", need: [["친절",["kind","nice","friendly"]]], hint: ["You've been so ~ to me since the first day.","You've been so…","You've been so kind to me since the first day."], model: "You've been so kind to me since the first day." },
        { say: "Aw, that's what I'm here for. You're really sweet.", want: "이 카페 덕분에 이 도시가 집처럼 느껴졌다고 하기", need: [["집",["home"]]], hint: ["Your cafe made this city feel like ~.","Your cafe made this city feel like…","Your cafe made this city feel like home."], model: "Your cafe made this city feel like home." },
        { say: "That means a lot. Here, take this cookie, on the house.", want: "정말 괜찮다고, 대신 이 카드를 받아 달라고 하기", need: [["카드",["card"]]], hint: ["No, really. Please take this ~ instead.","No, really. Please take this…","No, really. Please take this card instead."], model: "No, really. Please take this card instead." },
        { say: "Wow, thank you. I'll put it up behind the counter.", want: "그렇게 해 주면 좋겠다고, 기쁘다고 하기", need: [["기쁨",["love that","happy","glad"]]], hint: ["I'd ~. It makes me happy.","I'd love…","I'd love that. It makes me happy."], model: "I'd love that. It makes me happy." }
      ],
      overhear: [
        ["guest", "Do you have a loyalty card?", [["loyalty card","적립 카드","자주 오는 손님에게 주는 카드예요."]]],
        ["them", "We do. Every tenth drink is free.", [["Every tenth","열 번째마다","규칙적으로 돌아오는 차례에 써요."]]],
        ["guest", "Oh nice. Can I get one?"],
        ["them", "Sure, here you go."]
      ] }],
    ["18:00", "Sara에게 고마움 전하기", "picnic", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "공원 산책하던 사람",
      turns: [
        { say: "Hey! I brought sandwiches. What's the occasion?", want: "네게 얼마나 고마운지 말하고 싶었다고 하기", need: [["고마움",["grateful","thankful","thank","appreciate"]]], hint: ["I want to tell you how ~ I am.","I want to tell you how…","I want to tell you how grateful I am."], model: "I want to tell you how grateful I am.", chunk: ["grateful","감사한","thankful보다 조금 더 진심 어린 느낌이에요."] },
        { say: "Aw, now I'm nervous. For what?", want: "처음 만난 날부터 도와줬다고 하기", need: [["도와줌",["helped","help"]]], hint: ["You've ~ since the day we met.","You've helped…","You've helped me since the day we met."], model: "You've helped me since the day we met." },
        { say: "You didn't have to say that. I just did what friends do.", want: "네가 없었다면 이곳으로 이사 오기 힘들었을 거라고 하기", need: [["네가 없었다면",["without you"]]], hint: ["~, moving here would have been so hard.","Without…","Without you, moving here would have been so hard."], model: "Without you, moving here would have been so hard.", chunk: ["Without you","네가 없었다면","도움에 감사할 때 써요."] },
        { say: "Stop, you're going to make me cry!", want: "카드를 건네며 나중에 읽어 보라고 하기", need: [["읽다",["read"]]], hint: ["Here's a card for you. Please ~ it later.","Here's a card for you. Please…","Here's a card for you. Please read it later."], model: "Here's a card for you. Please read it later." },
        { say: "I will. You're the best, you know that?", want: "너도 최고라고, 영원히 친구로 지내자고 하기", need: [["친구",["friends","friend"]]], hint: ["So are you. Let's stay ~ forever!","So are you. Let's stay…","So are you. Let's stay friends forever!"], model: "So are you. Let's stay friends forever!" }
      ],
      overhear: [
        ["guest", "Sara, you didn't have to bring all this!", [["didn't have to","그럴 필요 없었는데","상대의 정성에 놀랐을 때 써요."]]],
        ["them", "I wanted to. It's such a nice day."],
        ["guest", "It really is. Thank you for planning this."],
        ["them", "Anytime. Pass me a sandwich?"]
      ] }]
  ]]
]);
