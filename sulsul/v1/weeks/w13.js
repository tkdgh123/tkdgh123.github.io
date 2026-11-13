// 13주째 · 석 달째 (85~91일째). 이제 이 도시가 익숙하다. 단골이 생기고, 가족과 통화하고, 계획을 다시 세운다.
// 장면 = [시간, 이름, 그림 id, 대본]. 형식은 ~/sulsul-art/YEAR.md
WEEK(13, [
  ["미용실 단골", [
    ["10:00", "머리 다듬기", "salon", {
      who: "Jess", whoKo: "미용사", voices: { them: "f", guest: "m2" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, welcome back! The usual trim?", want: "네, 앞머리만 조금 잘라 달라고 하기", need: [["앞머리", ["bangs", "fringe"]]], hint: ["Yes, please. Just a little off the ~.", "Yes, please. Just a little…", "Yes, please. Just a little off the bangs."], model: "Yes, please. Just a little off the bangs.", chunk: ["a little off", "조금만 잘라 주세요", "자를 양을 줄여 말할 때 써요."] },
        { say: "Sure. Do you want it shorter on the sides?", want: "옆은 지난번이랑 똑같이 해 달라고 하기", need: [["똑같이", ["same"]]], hint: ["Keep the sides the ~ as last time, please.", "Keep the sides the same…", "Keep the sides the same as last time, please."], model: "Keep the sides the same as last time, please." },
        { say: "You got it. It's been about three months since your first cut here, right?", want: "벌써 석 달이 됐다고 하기", need: [["석 달", ["three months"]]], hint: ["Yes, it's been ~ already.", "Yes, it's been three months…", "Yes, it's been three months already."], model: "Yes, it's been three months already." },
        { say: "Wow. Are you happy here so far?", want: "아주 행복하다고, 다시 오길 잘했다고 하기", need: [["다행", ["glad", "happy"]]], hint: ["Very! I'm really ~ I came back.", "Very! I'm really glad…", "Very! I'm really glad I came back."], model: "Very! I'm really glad I came back." },
        { say: "Here's the mirror. How does it look?", want: "마음에 든다고, 고맙다고 하기", need: [["마음에 듦", ["love it", "like it", "looks great", "looks good"]]], hint: ["I ~ it. Thank you, Jess!", "I love…", "I love it. Thank you, Jess!"], model: "I love it. Thank you, Jess!" }
      ],
      overhear: [
        ["them", "Next! Have a seat. What are we doing today?"],
        ["guest", "A haircut, please, but nothing too short.", [["nothing too short", "너무 짧지 않게", "원하지 않는 것을 말할 때 써요."]]],
        ["them", "Got it. I'll be with you in a minute.", [["be with you in a minute", "곧 갈게요", "손님을 잠깐 기다리게 할 때 써요."]]],
        ["guest", "No rush. I'm not in a hurry.", [["in a hurry", "서두르는", "급하지 않다고 할 때 not을 붙여요."]]]
      ] }],
    ["13:00", "스탬프 카드", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, regular! The usual iced americano?", want: "오늘은 따뜻한 라테를 마셔 보겠다고 하기", need: [["라테", ["latte"]]], hint: ["Actually, I'll try a hot ~ today.", "Actually, I'll try a hot latte…", "Actually, I'll try a hot latte today."], model: "Actually, I'll try a hot latte today.", chunk: ["regular", "단골", "자주 오는 손님을 부르는 말이에요."] },
        { say: "Nice change! You know, you've been coming here for three months now.", want: "벌써 석 달이나 됐냐고 놀라기", need: [["벌써", ["already"]]], hint: ["Has it been three months ~?", "Has it been three months…", "Has it been three months already?"], model: "Has it been three months already?" },
        { say: "Yep! And you have a stamp card. Ten stamps gets you a free drink.", want: "스탬프가 몇 개인지 묻기", need: [["몇 개", ["how many"]]], hint: ["~ stamps do I have so far?", "How many stamps…", "How many stamps do I have so far?"], model: "How many stamps do I have so far?" },
        { say: "Let me see. Eight! Two more to go.", want: "그럼 이번 주에 공짜 커피 마시러 다시 오겠다고 하기", need: [["다시 오기", ["come back"]]], hint: ["Then I'll ~ back this week for the free drink.", "Then I'll come back…", "Then I'll come back this week for the free drink."], model: "Then I'll come back this week for the free drink.", chunk: ["Two more to go", "두 개 남았어요", "목표까지 남은 수를 말해요."] },
        { say: "I'll hold you to it! Here's your latte.", want: "고맙다고, 맛있어 보인다고 하기", need: [["맛있어 보임", ["looks great", "looks good", "looks delicious", "smells great", "smells good"]]], hint: ["Thanks! It ~ great.", "Thanks! It looks…", "Thanks! It looks great."], model: "Thanks! It looks great.", chunk: ["I'll hold you to it", "꼭 지키세요", "약속을 장난스럽게 다짐받을 때 써요."] }
      ],
      overhear: [
        ["guest", "Hi! Can I get a large cappuccino to go?", [["to go", "가지고 갈게요", "포장할 때 주문 끝에 붙여요."]]],
        ["them", "Sure. Any sugar or syrup?"],
        ["guest", "No, but could you add an extra shot?", [["an extra shot", "샷 추가", "커피를 더 진하게 할 때 써요."]]],
        ["them", "Of course. That'll be five fifty."]
      ] }],
    ["18:00", "저녁 산책", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Hey, stranger! Out for an evening run?", want: "아니, 그냥 산책이라고, 이 길이 좋다고 하기", need: [["산책", ["walk", "walking", "stroll"]]], hint: ["No, just a ~. I love this path.", "No, just a walk…", "No, just a walk. I love this path."], model: "No, just a walk. I love this path." },
        { say: "Same here. Max and I come every evening.", want: "Max가 나를 기억하는 것 같다고 하기", need: [["기억", ["remember", "remembers"]]], hint: ["I think Max ~ me!", "I think Max remembers…", "I think Max remembers me!"], model: "I think Max remembers me!" },
        { say: "He definitely does. He never forgets a friend.", want: "간식을 줘도 되는지 묻기", need: [["간식", ["treat", "treats", "snack"]]], hint: ["Can I give him a ~?", "Can I give him a treat…", "Can I give him a treat?"], model: "Can I give him a treat?" },
        { say: "Sure, he'd love that. Say, any plans this weekend?", want: "아직 아무것도 없다고, 너는 어떠냐고 묻기", need: [["아직", ["nothing yet", "not yet", "no plans"]]], hint: ["~ yet. What about you?", "Nothing yet…", "Nothing yet. What about you?"], model: "Nothing yet. What about you?" },
        { say: "We're going to the lake. You should come!", want: "좋다고, 시간을 알려 달라고 하기", need: [["알려 줘", ["let me know"]]], hint: ["I'd love to! ~ me know the time.", "I'd love to! Let me know…", "I'd love to! Let me know the time."], model: "I'd love to! Let me know the time.", chunk: ["You should come", "같이 가요", "가볍게 초대할 때 써요."] }
      ],
      overhear: [
        ["guest", "Excuse me, is this path open after dark?", [["after dark", "해가 진 뒤에", "저녁·밤을 말할 때 써요."]]],
        ["them", "Yes, but it's not very well lit.", [["well lit", "불이 잘 켜진", "조명이 밝다는 뜻이에요."]]],
        ["guest", "Good to know. I'll bring a flashlight.", [["Good to know", "알려 줘서 고마워요", "새 정보를 들었을 때 써요."]]],
        ["them", "Or just use your phone. Have a nice walk!"]
      ] }]
  ]],
  ["집 청소", [
    ["10:00", "청소용품 사기", "grocery", {
      who: "Tina", whoKo: "마트 계산대 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Finding everything okay?", want: "청소용품이 어디 있는지 묻기", need: [["청소", ["cleaning"]]], hint: ["Where are the ~ supplies?", "Where are the cleaning…", "Where are the cleaning supplies?"], model: "Where are the cleaning supplies?" },
        { say: "Aisle seven. Anything specific?", want: "욕실 세제랑 스펀지가 필요하다고 하기", need: [["세제", ["cleaner", "detergent", "soap"]]], hint: ["I need a bathroom ~ and a sponge.", "I need a bathroom cleaner…", "I need a bathroom cleaner and a sponge."], model: "I need a bathroom cleaner and a sponge." },
        { say: "This one's good, but it's strong. Wear gloves.", want: "장갑도 파는지 묻기", need: [["장갑", ["gloves"]]], hint: ["Do you have ~ too?", "Do you have gloves…", "Do you have gloves too?"], model: "Do you have gloves too?" },
        { say: "Right next to it. Do you need a mop?", want: "집에 이미 하나 있다고 하기", need: [["이미", ["already"]]], hint: ["No, I ~ have one at home.", "No, I already…", "No, I already have one at home."], model: "No, I already have one at home." },
        { say: "Great. That's eleven dollars. Would you like a bag?", want: "네, 봉지 하나 달라고 하기", need: [["봉지", ["bag"]]], hint: ["Yes, one ~, please.", "Yes, one bag…", "Yes, one bag, please."], model: "Yes, one bag, please." }
      ],
      overhear: [
        ["guest", "Excuse me, do you sell light bulbs?", [["light bulbs", "전구", "bulb 하나는 전구 한 개예요."]]],
        ["them", "Aisle two, next to the batteries."],
        ["guest", "Perfect. Which ones last the longest?", [["last the longest", "가장 오래 가다", "물건의 수명을 물을 때 써요."]]],
        ["them", "These LED ones. They last for years."]
      ] }],
    ["14:00", "소음 미안해요", "neighbor", {
      who: "Mrs. Green", whoKo: "옆집 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Oh, hello, dear! I heard a vacuum. Is it cleaning day?", want: "네, 오늘 대청소를 한다고 하기", need: [["대청소", ["big cleaning", "spring cleaning", "deep clean", "deep cleaning", "cleaning"]]], hint: ["Yes, I'm doing a big ~ today.", "Yes, I'm doing a big cleaning…", "Yes, I'm doing a big cleaning today."], model: "Yes, I'm doing a big cleaning today." },
        { say: "Good for you! Is the noise bothering anyone, do you think?", want: "시끄러웠다면 미안하다고 하기", need: [["미안", ["sorry"]]], hint: ["I hope it wasn't too loud. ~ if it was!", "I hope it wasn't too loud. Sorry…", "I hope it wasn't too loud. Sorry if it was!"], model: "I hope it wasn't too loud. Sorry if it was!" },
        { say: "Not at all. Do you need anything?", want: "창문을 닦는 좋은 방법을 아는지 묻기", need: [["방법", ["way", "tip", "trick"]]], hint: ["Do you know a good ~ to clean windows?", "Do you know a good way…", "Do you know a good way to clean windows?"], model: "Do you know a good way to clean windows?" },
        { say: "Vinegar and old newspaper. It works like magic.", want: "신문지라니 신기하다고, 해 보겠다고 하기", need: [["신문", ["newspaper"]]], hint: ["~? I'll try that.", "Newspaper…", "Newspaper? I'll try that."], model: "Newspaper? I'll try that." },
        { say: "Come by for tea when you're done, dear.", want: "고맙다고, 끝나면 들르겠다고 하기", need: [["들르다", ["stop by", "come by", "drop by"]]], hint: ["Thanks! I'll ~ by when I'm done.", "Thanks! I'll stop…", "Thanks! I'll stop by when I'm done."], model: "Thanks! I'll stop by when I'm done.", chunk: ["stop by", "잠깐 들르다", "가볍게 방문할 때 써요."] }
      ],
      overhear: [
        ["guest", "Mrs. Green, could you hold my package for a minute?", [["hold my package", "내 택배를 잠깐 맡다", "hold는 '들고 있다·맡아 두다'예요."]]],
        ["them", "Of course, dear. Just leave it by the door."],
        ["guest", "Thanks. I'll pick it up in an hour.", [["pick it up", "찾으러 오다", "맡긴 물건을 가져갈 때 써요."]]],
        ["them", "No hurry at all."]
      ] }],
    ["18:00", "이불 빨래", "laundromat", {
      who: "Walt", whoKo: "세탁방 관리인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Evening! Need change for the machines?", want: "이불을 빨 큰 기계가 있는지 묻기", need: [["이불", ["comforter", "blanket", "bedding"]]], hint: ["Do you have a big machine for a ~?", "Do you have a big machine for a comforter…", "Do you have a big machine for a comforter?"], model: "Do you have a big machine for a comforter?" },
        { say: "Number six. It holds up to twenty pounds.", want: "한 번 빠는 데 얼마나 걸리는지 묻기", need: [["걸림", ["how long"]]], hint: ["~ does a wash take?", "How long…", "How long does a wash take?"], model: "How long does a wash take?" },
        { say: "About forty minutes. Then another forty in the dryer.", want: "기다리는 동안 와이파이가 되는지 묻기", need: [["와이파이", ["wifi", "wi fi"]]], hint: ["Is there ~ while I wait?", "Is there wifi…", "Is there wifi while I wait?"], model: "Is there wifi while I wait?" },
        { say: "Yes, the password's on the wall. Soap is in the machine on the right.", want: "세제 한 컵이 얼마인지 묻기", need: [["얼마", ["how much"]]], hint: ["~ is one cup of soap?", "How much…", "How much is one cup of soap?"], model: "How much is one cup of soap?" },
        { say: "A dollar. Pop it in before you start.", want: "고맙다고, 40분 뒤에 오겠다고 하기", need: [["뒤에", ["back in"]]], hint: ["Thanks! I'll be ~ in forty minutes.", "Thanks! I'll be back…", "Thanks! I'll be back in forty minutes."], model: "Thanks! I'll be back in forty minutes.", chunk: ["Pop it in", "넣으세요", "pop은 '휙 넣다'라는 가벼운 말이에요."] }
      ],
      overhear: [
        ["guest", "Excuse me, is this dryer broken?"],
        ["them", "Let me look. Oh, it's just full of lint.", [["lint", "보풀·먼지", "건조기 필터에 끼는 먼지예요."]]],
        ["guest", "Oh! Can I empty it myself?", [["empty it", "비우다", "empty는 동사로도 써요."]]],
        ["them", "Sure. Clean the filter every time."]
      ] }]
  ]],
  ["가족과 영상통화", [
    ["10:00", "휴대폰 거치대", "phonestore", {
      who: "Zoe", whoKo: "휴대폰 가게 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi again! What can I get for you today?", want: "영상통화에 쓸 휴대폰 거치대가 필요하다고 하기", need: [["거치대", ["stand", "holder"]]], hint: ["I need a phone ~ for video calls.", "I need a phone stand…", "I need a phone stand for video calls."], model: "I need a phone stand for video calls." },
        { say: "Sure. This one folds up. It's twelve dollars.", want: "튼튼한지 묻기", need: [["튼튼", ["sturdy", "strong", "stable"]]], hint: ["Is it ~? I don't want it to fall.", "Is it sturdy…", "Is it sturdy? I don't want it to fall."], model: "Is it sturdy? I don't want it to fall." },
        { say: "Very. Do you call home a lot?", want: "일주일에 한 번쯤, 가족이 한국에 있다고 하기", need: [["일주일에 한 번", ["once a week", "every week"]]], hint: ["About ~ a week. My family is in Korea.", "About once…", "About once a week. My family is in Korea."], model: "About once a week. My family is in Korea." },
        { say: "That's sweet. Is there a big time difference?", want: "13시간 앞서 있어서 밤에 건다고 하기", need: [["앞서", ["ahead"]]], hint: ["Yes, they're thirteen hours ~ of me.", "Yes, they're thirteen hours…", "Yes, they're thirteen hours ahead of me."], model: "Yes, they're thirteen hours ahead of me.", chunk: ["time difference", "시차", "나라 사이 시간 차이를 말해요."] },
        { say: "Wow. Okay, that's twelve dollars with tax.", want: "카드로 계산하겠다고 하기", need: [["카드", ["card"]]], hint: ["I'll pay by ~, please.", "I'll pay by card…", "I'll pay by card, please."], model: "I'll pay by card, please." }
      ],
      overhear: [
        ["guest", "My phone won't charge. Could it be the cable?", [["won't charge", "충전이 안 돼요", "won't는 '~하지 않는다'는 뜻이에요."]]],
        ["them", "Let me test it. Yep, the cable is worn out.", [["worn out", "닳아서 못 쓰는", "오래 써서 낡았을 때 써요."]]],
        ["guest", "How much for a new one?"],
        ["them", "Eight dollars. It comes with a one-year warranty.", [["warranty", "품질 보증", "고장 나면 고쳐 주는 보증 기간이에요."]]]
      ] }],
    ["14:00", "엄마 요리가 그리워요", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "So, did you talk to your family last night?", want: "응, 엄마 아빠랑 이야기했다고 하기", need: [["부모님", ["parents", "mom", "dad", "mom and dad"]]], hint: ["Yes! I talked to my mom and ~.", "Yes! I talked to my mom…", "Yes! I talked to my mom and dad."], model: "Yes! I talked to my mom and dad." },
        { say: "Aw. How are they doing?", want: "잘 지내지만 내가 보고 싶다고 한다고 하기", need: [["보고 싶", ["miss"]]], hint: ["They're doing well, but they ~ me.", "They're doing well, but they miss…", "They're doing well, but they miss me."], model: "They're doing well, but they miss me." },
        { say: "I bet! Do you miss them too?", want: "조금, 특히 엄마 음식이 그립다고 하기", need: [["요리", ["cooking", "food", "cook"]]], hint: ["A little. I miss my mom's ~ the most.", "A little. I miss my mom's cooking…", "A little. I miss my mom's cooking the most."], model: "A little. I miss my mom's cooking the most." },
        { say: "Ha! What do you miss eating most?", want: "김치찌개라고 하기", need: [["김치찌개", ["kimchi stew", "kimchi jjigae", "kimchi"]]], hint: ["~ stew, definitely.", "Kimchi…", "Kimchi stew, definitely."], model: "Kimchi stew, definitely.", chunk: ["definitely", "당연히", "확실하다고 힘주어 말할 때 써요."] },
        { say: "I'd love to try that. Maybe you could cook it for me?", want: "좋다고, 다음 주말에 해 주겠다고 하기", need: [["해 주겠다", ["i'll make", "i can make", "i'll cook", "i can cook"]]], hint: ["Sure! I'll ~ it for you next weekend.", "Sure! I'll make…", "Sure! I'll make it for you next weekend."], model: "Sure! I'll make it for you next weekend." }
      ],
      overhear: [
        ["guest", "Sara, how's your mom doing after her surgery?", [["after her surgery", "수술 후에", "병원 이야기에서 자주 나와요."]]],
        ["them", "Much better. She's walking again."],
        ["guest", "That's a relief.", [["That's a relief", "다행이에요", "걱정이 풀렸을 때 써요."]]],
        ["them", "I know. I'm going to visit her next month."]
      ] }],
    ["17:00", "한국으로 엽서", "postoffice", {
      who: "Wendy", whoKo: "우체국 직원", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! What are you sending today?", want: "한국에 엽서 두 장을 보내고 싶다고 하기", need: [["엽서", ["postcard", "postcards"]]], hint: ["I'd like to send two ~ to Korea.", "I'd like to send two postcards…", "I'd like to send two postcards to Korea."], model: "I'd like to send two postcards to Korea." },
        { say: "Sure. International postage is two dollars each. Anything else?", want: "작은 소포도 하나 있다고 하기", need: [["소포", ["package", "parcel", "box"]]], hint: ["Yes, I also have a small ~.", "Yes, I also have a small package…", "Yes, I also have a small package."], model: "Yes, I also have a small package." },
        { say: "What's inside?", want: "초콜릿이랑 책갈피뿐이라고 하기", need: [["초콜릿", ["chocolate", "chocolates"]]], hint: ["Just ~ and a bookmark.", "Just chocolates…", "Just chocolates and a bookmark."], model: "Just chocolates and a bookmark." },
        { say: "Okay. Would you like tracking? It's three dollars more.", want: "도착하는 데 얼마나 걸리는지 묻기", need: [["걸림", ["how long"]]], hint: ["~ will it take to arrive?", "How long…", "How long will it take to arrive?"], model: "How long will it take to arrive?", chunk: ["tracking", "배송 추적", "지금 어디쯤인지 볼 수 있는 서비스예요."] },
        { say: "About a week with tracking. The total is twenty-two dollars.", want: "추적 서비스를 넣어 달라고 하기", need: [["추적", ["tracking"]]], hint: ["Okay, I'll take the ~, please.", "Okay, I'll take the tracking…", "Okay, I'll take the tracking, please."], model: "Okay, I'll take the tracking, please." }
      ],
      overhear: [
        ["guest", "I need this mailed by tomorrow. Will it get there in time?", [["in time", "시간 안에", "늦지 않게 도착한다는 뜻이에요."]]],
        ["them", "Express will. It arrives in two days."],
        ["guest", "Great. Does that include insurance?", [["insurance", "보험", "분실·파손을 보상해 주는 서비스예요."]]],
        ["them", "Up to fifty dollars, yes."]
      ] }]
  ]],
  ["옷 수선", [
    ["10:00", "청바지 사기", "shop", {
      who: "Mia", whoKo: "옷 가게 점원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Welcome back. Looking for anything today?", want: "청바지 한 벌을 찾는 중이라고 하기", need: [["청바지", ["jeans"]]], hint: ["I'm looking for a pair of ~.", "I'm looking for a pair of jeans…", "I'm looking for a pair of jeans."], model: "I'm looking for a pair of jeans.", chunk: ["a pair of", "한 벌", "바지·신발처럼 한 쌍인 물건을 셀 때 써요."] },
        { say: "Great, they're right over here. What's your size?", want: "보통 30에 32라고 하기", need: [["사이즈", ["thirty"]]], hint: ["I'm usually a ~ by thirty-two.", "I'm usually a thirty…", "I'm usually a thirty by thirty-two."], model: "I'm usually a thirty by thirty-two." },
        { say: "Try these. The fitting room is on your left. How are they?", want: "맞긴 한데 조금 길다고 하기", need: [["길다", ["too long", "long"]]], hint: ["They fit, but they're a little too ~.", "They fit, but they're a little…", "They fit, but they're a little too long."], model: "They fit, but they're a little too long." },
        { say: "That's normal. We don't hem here, but there's a tailor on Pine Street.", want: "거기까지 어떻게 가는지 묻기", need: [["어떻게", ["how do i", "how can i"]]], hint: ["~ get to Pine Street?", "How do I…", "How do I get to Pine Street?"], model: "How do I get to Pine Street?", chunk: ["tailor", "수선집·재단사", "옷을 고치거나 맞춰 주는 사람이에요."] },
        { say: "Two blocks that way, next to the bakery.", want: "그럼 이걸로 사겠다고 하기", need: [["사기", ["i'll take", "i'll get", "i'll buy"]]], hint: ["Okay, I'll ~ these. Thanks, Mia!", "Okay, I'll take…", "Okay, I'll take these. Thanks, Mia!"], model: "Okay, I'll take these. Thanks, Mia!" }
      ],
      overhear: [
        ["guest", "Do you have this shirt in a medium?", [["in a medium", "미디엄 사이즈로", "in 뒤에 사이즈·색을 붙여요."]]],
        ["them", "Let me check the back."],
        ["guest", "Thanks. It's a gift. Can I return it if it doesn't fit?"],
        ["them", "Yes, within thirty days with a receipt.", [["with a receipt", "영수증이 있으면", "반품 조건을 말할 때 써요."]]]
      ] }],
    ["13:00", "바지 단 줄이기", "tailorshop", {
      who: "Mrs. Rossi", whoKo: "수선집 재단사", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Good afternoon! How can I help you?", want: "이 청바지 단을 줄여 달라고 하기", need: [["단", ["hem", "shorten"]]], hint: ["Could you ~ these jeans, please?", "Could you hem…", "Could you hem these jeans, please?"], model: "Could you hem these jeans, please?", chunk: ["hem", "단을 줄이다", "바지 아랫단을 접어 박는 일이에요."] },
        { say: "Of course. Try them on and stand up straight. How long do you want them?", want: "발목에 딱 오게 해 달라고 하기", need: [["발목", ["ankle", "ankles"]]], hint: ["Right at my ~, please.", "Right at my ankle…", "Right at my ankle, please."], model: "Right at my ankle, please." },
        { say: "Perfect. I'll pin them. It's fifteen dollars.", want: "언제 찾아갈 수 있는지 묻기", need: [["언제", ["when"]]], hint: ["~ can I pick them up?", "When can I…", "When can I pick them up?"], model: "When can I pick them up?" },
        { say: "Thursday afternoon. Is that okay?", want: "목요일 좋다고, 몇 시에 닫는지 묻기", need: [["몇 시", ["what time"]]], hint: ["Thursday is fine. ~ do you close?", "Thursday is fine. What time…", "Thursday is fine. What time do you close?"], model: "Thursday is fine. What time do you close?" },
        { say: "Six o'clock. And your name, please?", want: "이름을 말하고 철자를 불러 줄지 묻기", need: [["철자", ["spell"]]], hint: ["{name}. Should I ~ it for you?", "{name}. Should I spell…", "{name}. Should I spell it for you?"], model: "{name}. Should I spell it for you?" }
      ],
      overhear: [
        ["guest", "Can you replace this zipper?", [["replace this zipper", "지퍼를 갈다", "고장 난 부품을 새것으로 바꿀 때 replace를 써요."]]],
        ["them", "Yes, that's an easy fix. Five dollars.", [["easy fix", "간단한 수리", "금방 고칠 수 있는 일이에요."]]],
        ["guest", "Can I wait here?"],
        ["them", "It takes ten minutes. Have a seat."]
      ] }],
    ["17:00", "일찍 퇴근해도 돼요?", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "다른 직원",
      turns: [
        { say: "Hey! You look happy today. What did you do this morning?", want: "청바지를 사서 수선집에 맡겼다고 하기", need: [["수선집", ["tailor", "tailor's"]]], hint: ["I bought jeans and took them to a ~.", "I bought jeans and took them to a tailor…", "I bought jeans and took them to a tailor."], model: "I bought jeans and took them to a tailor." },
        { say: "Smart. A tailor is worth it. How much?", want: "15달러밖에 안 들었다고 하기", need: [["15", ["fifteen", "15"]]], hint: ["Only ~ dollars.", "Only fifteen…", "Only fifteen dollars."], model: "Only fifteen dollars." },
        { say: "That's a deal! When do you pick them up?", want: "목요일인데 일찍 퇴근해도 되냐고 묻기", need: [["일찍", ["leave early"]]], hint: ["Thursday. Can I ~ early that day?", "Thursday. Can I leave…", "Thursday. Can I leave early that day?"], model: "Thursday. Can I leave early that day?" },
        { say: "Sure, five-thirty is fine.", want: "고맙다고, 그날 아침에 일찍 오겠다고 하기", need: [["일찍 오기", ["come in early", "come early", "get here early"]]], hint: ["Thanks! I'll ~ in early that morning.", "Thanks! I'll come in early…", "Thanks! I'll come in early that morning."], model: "Thanks! I'll come in early that morning." },
        { say: "Perfect. By the way, can you restock the mugs before you go?", want: "물론이라고, 새 머그잔을 어디 두는지 묻기", need: [["어디", ["where"]]], hint: ["Sure. ~ do the new mugs go?", "Sure. Where…", "Sure. Where do the new mugs go?"], model: "Sure. Where do the new mugs go?", chunk: ["restock", "다시 채워 놓다", "가게 선반을 채울 때 써요."] }
      ],
      overhear: [
        ["them", "Did you get a chance to look at the schedule?", [["get a chance to", "~할 기회가 있다", "시간이 났는지 물을 때 써요."]]],
        ["guest", "Not yet. Can I swap my Friday shift?", [["swap my Friday shift", "금요일 근무를 바꾸다", "swap은 서로 바꾸는 거예요."]]],
        ["them", "Only if someone can cover it.", [["cover it", "대신 맡다", "남의 일을 대신 해 줄 때 써요."]]],
        ["guest", "I'll ask around."]
      ] }]
  ]],
  ["계획 다시 세우기", [
    ["10:00", "석 달 돌아보기", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Good morning! You've been in my class for three months. How do you feel?", want: "처음보다 말하기가 훨씬 쉬워졌다고 하기", need: [["쉬워", ["easier"]]], hint: ["Speaking is a lot ~ than before.", "Speaking is a lot easier…", "Speaking is a lot easier than before."], model: "Speaking is a lot easier than before." },
        { say: "I agree. What's still hard for you?", want: "말이 빠른 사람은 아직 못 따라가겠다고 하기", need: [["따라가", ["follow"]]], hint: ["I can't always ~ people who talk fast.", "I can't always follow…", "I can't always follow people who talk fast."], model: "I can't always follow people who talk fast." },
        { say: "Very common! What's your goal for the next three months?", want: "인턴에 지원해 보고 싶다고 하기", need: [["지원", ["apply for", "apply"]]], hint: ["I'd like to ~ for an internship.", "I'd like to apply…", "I'd like to apply for an internship."], model: "I'd like to apply for an internship.", chunk: ["apply for", "~에 지원하다", "일자리·학교에 지원할 때 써요."] },
        { say: "That's ambitious. What kind?", want: "소프트웨어 쪽, 작은 스타트업이면 좋겠다고 하기", need: [["소프트웨어", ["software"]]], hint: ["Something in ~, maybe at a small startup.", "Something in software…", "Something in software, maybe at a small startup."], model: "Something in software, maybe at a small startup." },
        { say: "Then we should practice interview English. Shall we start next week?", want: "좋다고, 매주 연습할 수 있냐고 묻기", need: [["매주", ["every week", "each week", "once a week", "weekly"]]], hint: ["That would be great. Can we practice ~?", "That would be great. Can we practice every…", "That would be great. Can we practice every week?"], model: "That would be great. Can we practice every week?" }
      ],
      overhear: [
        ["guest", "Mr. Brown, can I switch to the evening class?", [["switch to", "~로 바꾸다", "수업·자리를 바꿀 때 써요."]]],
        ["them", "Of course. Let me check if there's space.", [["if there's space", "자리가 있는지", "if는 '~인지'라는 뜻으로도 써요."]]],
        ["guest", "I just started a new job in the mornings."],
        ["them", "Congratulations! I'll email you the new schedule."]
      ] }],
    ["14:00", "파이썬 책 빌리기", "library", {
      who: "Henry", whoKo: "도서관 사서", voices: { them: "m2", guest: "f" }, guestKo: "다른 이용자",
      turns: [
        { say: "Welcome back! What can I find for you?", want: "영어로 된 파이썬 책이 있는지 묻기", need: [["파이썬", ["python"]]], hint: ["Do you have any ~ books in English?", "Do you have any Python…", "Do you have any Python books in English?"], model: "Do you have any Python books in English?" },
        { say: "We have a few. Beginner or advanced?", want: "초보용인데 실제 프로젝트가 있는 책이면 좋겠다고 하기", need: [["프로젝트", ["projects", "project"]]], hint: ["Beginner, but with real ~, please.", "Beginner, but with real projects…", "Beginner, but with real projects, please."], model: "Beginner, but with real projects, please." },
        { say: "This one has twelve projects. Students love it.", want: "얼마나 오래 빌릴 수 있는지 묻기", need: [["얼마나", ["how long"]]], hint: ["~ can I keep it?", "How long…", "How long can I keep it?"], model: "How long can I keep it?" },
        { say: "Three weeks. You can renew it online.", want: "온라인으로 어떻게 연장하는지 묻기", need: [["연장", ["renew"]]], hint: ["How do I ~ it?", "How do I renew…", "How do I renew it?"], model: "How do I renew it?", chunk: ["renew", "대출을 연장하다", "같은 책을 더 오래 빌릴 때 써요."] },
        { say: "Just log in with your card number. Here you go.", want: "고맙다고, 큰 도움이 됐다고 하기", need: THANKS, hint: ["~ you, that's very helpful.", "Thank you…", "Thank you, that's very helpful."], model: "Thank you, that's very helpful." }
      ],
      overhear: [
        ["guest", "I'd like to book a study room for tomorrow.", [["book a study room", "스터디룸을 예약하다", "방·자리를 예약할 때 book을 써요."]]],
        ["them", "For how many people?"],
        ["guest", "Just me, from two to four."],
        ["them", "That room is open. I'll sign you up.", [["sign you up", "등록해 주다", "명단에 이름을 올린다는 뜻이에요."]]]
      ] }],
    ["18:00", "노을 보며 계획", "picnic", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Okay, let's plan the next three months. Big goal first?", want: "영어를 더 막힘없이 말하는 게 큰 목표라고 하기", need: [["막힘없이", ["fluently", "fluent"]]], hint: ["My big goal is to speak more ~.", "My big goal is to speak more fluently…", "My big goal is to speak more fluently."], model: "My big goal is to speak more fluently." },
        { say: "Love it. How will you practice?", want: "매일 15분씩 혼잣말을 하겠다고 하기", need: [["매일", ["every day", "daily", "each day"]]], hint: ["I'll talk to myself for fifteen minutes ~.", "I'll talk to myself for fifteen minutes every…", "I'll talk to myself for fifteen minutes every day."], model: "I'll talk to myself for fifteen minutes every day." },
        { say: "Ha, that works! What about meeting new people?", want: "한 달에 한 번 모임에 가겠다고 하기", need: [["한 달에 한 번", ["once a month", "every month"]]], hint: ["I'll go to a meetup ~ a month.", "I'll go to a meetup once…", "I'll go to a meetup once a month."], model: "I'll go to a meetup once a month." },
        { say: "Good. What if you get stuck?", want: "가만히 있지 않고 도움을 청하겠다고 하기", need: [["청하기", ["ask for help", "ask"]]], hint: ["I'll ~ for help instead of staying quiet.", "I'll ask…", "I'll ask for help instead of staying quiet."], model: "I'll ask for help instead of staying quiet.", chunk: ["get stuck", "막히다", "일이 풀리지 않을 때 써요."] },
        { say: "That's the spirit! Let's check back in three months.", want: "좋다고, 그때 얼마나 늘었는지 보자고 하기", need: [["얼마나", ["how much"]]], hint: ["Deal! Let's see ~ I've improved.", "Deal! Let's see how much…", "Deal! Let's see how much I've improved."], model: "Deal! Let's see how much I've improved.", chunk: ["That's the spirit", "그 마음가짐이 좋아요", "상대의 의욕을 칭찬할 때 써요."] }
      ],
      overhear: [
        ["guest", "I made a list of goals for this year.", [["a list of goals", "목표 목록", "list of 뒤에 항목을 붙여요."]]],
        ["them", "Nice! How many are on it?"],
        ["guest", "Ten, but I'll probably finish three."],
        ["them", "Three is better than zero!", [["better than zero", "하나도 없는 것보다 낫다", "작은 성과를 격려하는 말이에요."]]]
      ] }]
  ]],
  ["친구에게 소개", [
    ["11:00", "Yuki 초대하기", "yuki", {
      who: "Yuki", whoKo: "어학원 반 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hi! I was just thinking about you.", want: "내 친구 Sara를 소개해 주고 싶다고 하기", need: [["소개", ["meet", "introduce"]]], hint: ["I want you to ~ my friend Sara.", "I want you to meet…", "I want you to meet my friend Sara."], model: "I want you to meet my friend Sara." },
        { say: "Oh, nice! What is she like?", want: "친절하고 재밌어서 잘 맞을 것 같다고 하기", need: [["잘 맞", ["get along", "hit it off"]]], hint: ["She's kind and funny. I think you'll ~ along.", "She's kind and funny. I think you'll get…", "She's kind and funny. I think you'll get along."], model: "She's kind and funny. I think you'll get along.", chunk: ["get along", "잘 지내다", "사람끼리 사이가 좋을 때 써요."] },
        { say: "I'd love to. What's the plan?", want: "토요일 낮 12시에 만난다고 하기", need: [["토요일", ["saturday"]]], hint: ["We're meeting ~ at noon.", "We're meeting Saturday…", "We're meeting Saturday at noon."], model: "We're meeting Saturday at noon." },
        { say: "Sounds fun. Should I bring anything?", want: "아무것도 필요 없고 네가 오면 된다고 하기", need: [["필요 없", ["no need", "don't need", "nothing"]]], hint: ["~ need, just bring yourself!", "No need…", "No need, just bring yourself!"], model: "No need, just bring yourself!" },
        { say: "Okay! Can you send me the address?", want: "문자로 보내 주겠다고 하기", need: [["문자", ["text"]]], hint: ["Sure, I'll ~ it to you.", "Sure, I'll text…", "Sure, I'll text it to you."], model: "Sure, I'll text it to you." }
      ],
      overhear: [
        ["guest", "Yuki, are you coming to the party on Friday?"],
        ["them", "I'm not sure. I might have to study.", [["might have to", "~해야 할지도 몰라요", "확실하지 않은 의무를 말할 때 써요."]]],
        ["guest", "Come on! It won't be the same without you.", [["won't be the same without you", "네가 없으면 안 똑같아", "같이 가자고 설득할 때 써요."]]],
        ["them", "Okay, okay. I'll try to come."]
      ] }],
    ["15:00", "친구를 소개해요", "meetup", {
      who: "Sara", whoKo: "모임에서 만난 친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
      turns: [
        { say: "Hey, you made it! Who's this?", want: "어학원 친구 Yuki라고 소개하기", need: [["소개", ["this is"]]], hint: ["~ Yuki, my friend from school.", "This is…", "This is Yuki, my friend from school."], model: "This is Yuki, my friend from school." },
        { say: "Nice to meet you, Yuki! So how did you two meet?", want: "같은 반인데 Yuki가 먼저 말을 걸었다고 하기", need: [["같은 반", ["same class"]]], hint: ["We're in the ~ class. Yuki talked to me first.", "We're in the same class…", "We're in the same class. Yuki talked to me first."], model: "We're in the same class. Yuki talked to me first." },
        { say: "Aw, that's sweet. Yuki seems really nice.", want: "요리도 잘하고 그림도 잘 그린다고 자랑하기", need: [["그림", ["draws", "draw", "drawing"]]], hint: ["She's a great cook, and she ~ really well.", "She's a great cook, and she draws…", "She's a great cook, and she draws really well."], model: "She's a great cook, and she draws really well." },
        { say: "No way! I've wanted to learn to draw. Maybe she can teach me.", want: "둘이 언젠가 같이 뭘 하면 좋겠다고 하기", need: [["같이", ["together"]]], hint: ["You two should do something ~ sometime.", "You two should do something together…", "You two should do something together sometime."], model: "You two should do something together sometime." },
        { say: "Definitely. Okay, let's grab a table before they're all gone.", want: "좋다고, 먼저 가라고 양보하기", need: [["먼저 가세요", ["after you"]]], hint: ["Sounds good. ~ you!", "Sounds good. After…", "Sounds good. After you!"], model: "Sounds good. After you!", chunk: ["After you", "먼저 가세요", "문이나 자리를 양보할 때 써요."] }
      ],
      overhear: [
        ["guest", "Sara, do you know everyone here?"],
        ["them", "Not everyone. Come on, I'll introduce you.", [["I'll introduce you", "소개해 줄게요", "처음 보는 사람에게 연결해 줄 때 써요."]]],
        ["guest", "Thanks. I'm kind of shy.", [["kind of shy", "좀 수줍어요", "kind of는 '약간'이라는 뜻이에요."]]],
        ["them", "Don't worry. Everyone here is friendly."]
      ] }],
    ["19:00", "셋이 저녁", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Good evening! How many in your party?", want: "세 명이라고 하기", need: [["세 명", ["three"]]], hint: ["~ of us, please.", "Three…", "Three of us, please."], model: "Three of us, please.", chunk: ["How many in your party?", "몇 분이세요?", "식당 입구에서 처음 묻는 말이에요."] },
        { say: "Right this way. Would you like to see the menus?", want: "네, 채식 메뉴가 있는지 묻기", need: [["채식", ["vegetarian", "veggie"]]], hint: ["Yes. Do you have ~ options?", "Yes. Do you have vegetarian…", "Yes. Do you have vegetarian options?"], model: "Yes. Do you have vegetarian options?" },
        { say: "Of course. The mushroom pasta is popular.", want: "친구 하나가 땅콩 알레르기가 있다고 하기", need: [["알레르기", ["allergic", "allergy"]]], hint: ["One of my friends is ~ to peanuts.", "One of my friends is allergic…", "One of my friends is allergic to peanuts."], model: "One of my friends is allergic to peanuts." },
        { say: "Thanks for telling me. I'll let the kitchen know.", want: "피자 하나와 샐러드를 나눠 먹어도 되냐고 묻기", need: [["나눠", ["share"]]], hint: ["Can we ~ one pizza and a salad?", "Can we share…", "Can we share one pizza and a salad?"], model: "Can we share one pizza and a salad?" },
        { say: "Absolutely. I'll bring some extra plates.", want: "고맙다고, 그러면 좋겠다고 하기", need: THANKS, hint: ["~, that would be great.", "Thanks…", "Thanks, that would be great."], model: "Thanks, that would be great." }
      ],
      overhear: [
        ["guest", "Could we get a table by the window?", [["by the window", "창가 쪽", "자리 위치를 부탁할 때 써요."]]],
        ["them", "Sure. It'll be about ten minutes."],
        ["guest", "That's fine. We'll wait at the bar."],
        ["them", "I'll call you when it's ready.", [["call you when it's ready", "준비되면 불러 드릴게요", "기다리는 손님에게 하는 말이에요."]]]
      ] }]
  ]],
  ["석 달 축하", [
    ["11:00", "작은 선물", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m2" }, guestKo: "단골손님",
      turns: [
        { say: "Hey! Sara told me today is your three-month mark. Congrats!", want: "기억해 줘서 고맙다고 하기", need: [["기억", ["remember", "remembering"]]], hint: ["That's so sweet of you to ~.", "That's so sweet of you to remember…", "That's so sweet of you to remember."], model: "That's so sweet of you to remember." },
        { say: "Of course! So what's been your best moment so far?", want: "첫 월급을 받은 날이 최고였다고 하기", need: [["월급", ["paycheck", "salary", "pay"]]], hint: ["Getting my first ~ was the best.", "Getting my first paycheck…", "Getting my first paycheck was the best."], model: "Getting my first paycheck was the best." },
        { say: "Ha, I remember that grin. And the hardest part?", want: "처음 몇 주는 외로웠다고 하기", need: [["외로", ["lonely", "homesick"]]], hint: ["The first few weeks were ~.", "The first few weeks were lonely…", "The first few weeks were lonely."], model: "The first few weeks were lonely." },
        { say: "I bet. But you've made friends since then, right?", want: "응, 이제 좋은 친구들과 멋진 상사가 있다고 하기", need: [["친구", ["friends"]]], hint: ["Yes, now I have good ~ and a great boss.", "Yes, now I have good friends…", "Yes, now I have good friends and a great boss."], model: "Yes, now I have good friends and a great boss." },
        { say: "Aww. Here, take this book as a little gift.", want: "정말이냐고, 안 그러셔도 됐다고 하기", need: [["정말", ["really", "are you sure"]]], hint: ["~? You didn't have to do that!", "Really…", "Really? You didn't have to do that!"], model: "Really? You didn't have to do that!", chunk: ["You didn't have to", "그러지 않으셔도 되는데", "선물을 받고 고마움을 표현해요."] }
      ],
      overhear: [
        ["guest", "Do you have any good mystery novels?", [["mystery novels", "추리 소설", "novel은 장편 소설이에요."]]],
        ["them", "Try this one. I couldn't put it down.", [["couldn't put it down", "손에서 놓을 수 없었어요", "너무 재밌는 책에 써요."]]],
        ["guest", "Sold! I'll take it.", [["Sold", "좋아요, 살게요", "마음에 들어 사겠다고 할 때 써요."]]],
        ["them", "Great. Do you want a bag?"]
      ] }],
    ["14:00", "케이크 주문", "cakeshop", {
      who: "Theo", whoKo: "빵집 제빵사", voices: { them: "m", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi there! Looking for something sweet?", want: "작은 케이크를 하나 주문하고 싶다고 하기", need: [["케이크", ["cake"]]], hint: ["I'd like to order a small ~.", "I'd like to order a small cake…", "I'd like to order a small cake."], model: "I'd like to order a small cake." },
        { say: "Sure! Which flavor? We have chocolate, lemon, and strawberry.", want: "딸기로 달라고 하기", need: [["딸기", ["strawberry"]]], hint: ["~, please.", "Strawberry…", "Strawberry, please."], model: "Strawberry, please." },
        { say: "Nice choice. Do you want a message on top?", want: "'Happy Three Months'라고 써 달라고 하기", need: [["써 달라", ["write"]]], hint: ["Yes, could you ~ 'Happy Three Months'?", "Yes, could you write…", "Yes, could you write 'Happy Three Months'?"], model: "Yes, could you write 'Happy Three Months'?" },
        { say: "Love it. It'll be ready at five. Is that okay?", want: "대신 6시에 찾아가도 되냐고 묻기", need: [["6시", ["six"]]], hint: ["Could I pick it up at ~ instead?", "Could I pick it up at six…", "Could I pick it up at six instead?"], model: "Could I pick it up at six instead?" },
        { say: "No problem. Name and phone number?", want: "이름을 말하고 전화번호 알려 주기", need: [["번호", ["number"]]], hint: ["{name}, and my ~ is 555-0142.", "{name}, and my number…", "{name}, and my number is 555-0142."], model: "{name}, and my number is 555-0142." }
      ],
      overhear: [
        ["guest", "Is this cake gluten-free?", [["gluten-free", "글루텐이 없는", "밀가루를 못 먹는 사람이 물어요."]]],
        ["them", "No, but we have gluten-free cookies."],
        ["guest", "Perfect. A dozen, please.", [["A dozen", "열두 개", "dozen은 12개 묶음이에요."]]],
        ["them", "Coming right up.", [["Coming right up", "곧 나와요", "주문을 받고 하는 말이에요."]]]
      ] }],
    ["19:00", "석 달 파티", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "You brought a cake! What's the occasion?", want: "여기 산 지 석 달이 돼서 축하하는 거라고 하기", need: [["축하", ["celebrating", "celebrate"]]], hint: ["I'm ~ my three months here!", "I'm celebrating…", "I'm celebrating my three months here!"], model: "I'm celebrating my three months here!", chunk: ["What's the occasion?", "무슨 일이에요?", "파티·선물의 이유를 물어요."] },
        { say: "Congratulations! Okay, make a wish before you blow out the candle!", want: "소원은 비밀이라고 하기", need: [["비밀", ["secret"]]], hint: ["I can't tell you. It's a ~.", "I can't tell you. It's a secret…", "I can't tell you. It's a secret."], model: "I can't tell you. It's a secret." },
        { say: "Fair enough. What was the best part of these three months?", want: "너를 다시 만난 게 제일 좋았다고 하기", need: [["다시 만남", ["seeing you again", "meeting you again"]]], hint: ["~ you again was the best part.", "Seeing…", "Seeing you again was the best part."], model: "Seeing you again was the best part." },
        { say: "Stop, you'll make me cry! So what's next?", want: "이제 개발자 일을 찾아보기 시작할 거라고 하기", need: [["일", ["job"]]], hint: ["Next, I'm going to start looking for a developer ~.", "Next, I'm going to start looking for a developer job…", "Next, I'm going to start looking for a developer job."], model: "Next, I'm going to start looking for a developer job." },
        { say: "You'll get one. To the next three months!", want: "건배하자고 하기", need: [["건배", ["cheers", "toast"]]], hint: ["~! To the next three months!", "Cheers…", "Cheers! To the next three months!"], model: "Cheers! To the next three months!" }
      ],
      overhear: [
        ["guest", "Who wants the first slice?", [["the first slice", "첫 조각", "케이크·피자 한 조각이 slice예요."]]],
        ["them", "Give it to the guest of honor!", [["guest of honor", "오늘의 주인공", "파티에서 가장 대접받는 사람이에요."]]],
        ["guest", "Fair enough. Here you go."],
        ["them", "Mmm, this is so good. Who made it?"]
      ] }]
  ]]
]);
