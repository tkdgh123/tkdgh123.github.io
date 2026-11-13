// 2주째 · 다시 온 도시 (8~14일째). 첫 여행 때 만난 사람들을 다시 만나고, 1년 살 준비를 한다.
// 장면 = [시간, 이름, 그림 id, 대본]. 그림 id가 week.js ART에 들어오면 열린다. 형식은 ~/sulsul-art/YEAR.md
WEEK(2, [
  ["다시 도착", [
    ["11:00", "다시 입국 심사", "airport", {
      who: "Officer Reed", whoKo: "입국 심사관", voices: { them: "m2", guest: "f" }, guestKo: "다음 여행객",
      turns: [
        { say: "Welcome. Passport, please. Have you been here before?", want: "네, 작년에 와 봤다고 하기", need: [["와 봄", ["last year", "before", "was here"]]], hint: ["Yes, I was here ~.", "Yes, I was here…", "Yes, I was here last year."], model: "Yes, I was here last year.", chunk: ["I was here", "여기 와 본 적 있어요", "visit보다 be here를 더 자주 써요."] },
        { say: "And what brings you back this time?", want: "이번엔 1년 동안 공부하러 왔다고 하기", need: [["공부", ["study", "studying", "school"]], ["1년", ["year"]]], hint: ["I'm here to ~ for a year.", "I'm here to study…", "I'm here to study for a year."], model: "I'm here to study for a year.", chunk: ["What brings you ~?", "무슨 일로 왔어요?", "왜 왔는지 부드럽게 묻는 말이에요."] },
        { say: "Do you have your student visa and the letter from your school?", want: "네, 둘 다 여기 있다고 하기", need: [["둘 다", ["both"]]], hint: ["Yes, here are ~ of them.", "Yes, here are both…", "Yes, here are both of them."], model: "Yes, here are both of them." },
        { say: "Where will you be living?", want: "2주는 호텔에 있다가 집을 구할 거라고 하기", need: [["호텔", ["hotel"]], ["집", ["apartment", "place", "flat", "house"]]], hint: ["At a hotel for two weeks, then I'll find ~.", "At a hotel for two weeks, then…", "At a hotel for two weeks, then I'll find an apartment."], model: "At a hotel for two weeks, then I'll find an apartment." },
        { say: "Alright. Welcome back, and good luck with your studies.", want: "고맙다고, 다시 와서 기쁘다고 하기", need: THANKS, hint: ["Thank you! I'm happy to be ~.", "Thank you! I'm happy…", "Thank you! I'm happy to be back."], model: "Thank you! I'm happy to be back.", chunk: ["be back", "돌아오다", "Welcome back에 딱 맞는 대답이에요."] }
      ],
      overhear: [
        ["them", "Next, please. What's the purpose of your trip?"],
        ["guest", "I'm here on business. Just three days.", [["on business", "일 때문에", "출장 왔을 때 써요."]]],
        ["them", "Do you have anything to declare?", [["anything to declare", "신고할 물건", "세관에서 꼭 나오는 말이에요."]]],
        ["guest", "No, nothing."]
      ] }],
    ["13:00", "공항 택시", "taxi", {
      who: "Omar", whoKo: "택시 기사", voices: { them: "m", guest: "f" }, guestKo: "앞 손님",
      turns: [
        { say: "Hi there! Where to?", want: "시내 그랜드 호텔로 가 달라고 하기", need: [["호텔", ["hotel"]]], hint: ["To the ~ Hotel downtown, please.", "To the Grand Hotel…", "To the Grand Hotel downtown, please."], model: "To the Grand Hotel downtown, please.", chunk: ["Where to?", "어디로 갈까요?", "택시 기사가 제일 먼저 하는 짧은 질문이에요."] },
        { say: "Sure thing. First time in the city?", want: "아니, 두 번째인데 이번엔 1년 산다고 하기", need: [["두 번째", ["second"]], ["살기", ["live", "living", "year"]]], hint: ["No, it's my ~ time. I'm going to live here for a year.", "No, it's my second time…", "No, it's my second time. I'm going to live here for a year."], model: "No, it's my second time. I'm going to live here for a year." },
        { say: "Oh, nice! Then you should get a transit card. It's way cheaper.", want: "어디서 살 수 있는지 묻기", need: [["어디서", ["where"]]], hint: ["Where can I ~ one?", "Where can I get…", "Where can I get one?"], model: "Where can I get one?", chunk: ["get one", "하나 사다", "앞에 나온 transit card를 one으로 받아요."] },
        { say: "At any subway station. Okay, here we are. That's thirty-two dollars.", want: "카드로 내고 영수증도 달라고 하기", need: [["카드", ["card"]], ["영수증", ["receipt"]]], hint: ["Can I pay by card and get a ~?", "Can I pay by card and…", "Can I pay by card and get a receipt?"], model: "Can I pay by card and get a receipt?" },
        { say: "Of course. Here you go. Enjoy your year!", want: "고맙다고, 좋은 하루 보내라고 하기", need: [["인사", ["thank", "thanks", "have a good", "have a great", "have a nice"]]], hint: ["Thanks! Have a ~ day.", "Thanks! Have a…", "Thanks! Have a great day."], model: "Thanks! Have a great day." }
      ],
      overhear: [
        ["guest", "Could you drop me off at the corner?", [["drop me off", "내려 주다", "택시에서 내릴 곳을 말할 때 써요."]]],
        ["them", "Sure. Right here is fine?"],
        ["guest", "Perfect. Keep the change.", [["Keep the change", "거스름돈은 가지세요", "잔돈을 팁으로 줄 때 써요."]]],
        ["them", "Thanks a lot. Have a good one!", [["Have a good one", "좋은 하루 보내요", "헤어질 때 짧게 하는 인사예요."]]]
      ] }],
    ["15:00", "호텔에 다시 체크인", "hotel", {
      who: "Emma", whoKo: "호텔 직원", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Welcome back! I remember you. Checking in again?", want: "네, 이번엔 2주 묵는다고 하기", need: [["2주", ["two weeks", "2 weeks"]]], hint: ["Yes! This time for two ~.", "Yes! This time for…", "Yes! This time for two weeks."], model: "Yes! This time for two weeks." },
        { say: "For stays over a week, we have a weekly rate. It's a bit cheaper.", want: "주 단위 요금이 얼마인지 묻기", need: [["얼마", ["how much"]]], hint: ["How much is the ~ rate?", "How much is…", "How much is the weekly rate?"], model: "How much is the weekly rate?", chunk: ["weekly rate", "주 단위 요금", "하룻밤 요금은 nightly rate예요."] },
        { say: "It's six hundred a week, breakfast included.", want: "그걸로 하겠다고 하기", need: [["선택", ["i'll take", "take it", "sounds good", "that works", "i'll go with"]]], hint: ["Great, I'll ~ it.", "Great, I'll take…", "Great, I'll take it."], model: "Great, I'll take it." },
        { say: "Perfect. Is there anything else you need?", want: "책상 있는 방인지 묻기", need: [["책상", ["desk"]]], hint: ["Does the room have a ~?", "Does the room have…", "Does the room have a desk?"], model: "Does the room have a desk?" },
        { say: "Yes, every room has one. You're in 305.", want: "고맙다고, 다시 봐서 반갑다고 하기", need: [["반가움", ["good to see you", "nice to see you", "great to see you"]]], hint: ["Thanks, Emma. It's good to ~ you again.", "Thanks, Emma. It's good…", "Thanks, Emma. It's good to see you again."], model: "Thanks, Emma. It's good to see you again.", chunk: ["good to see you again", "다시 봐서 반가워요", "아는 사람을 다시 만났을 때 써요. 처음 만나면 nice to meet you."] }
      ],
      overhear: [
        ["guest", "Hi, I'd like to extend my stay for two more nights.", [["extend my stay", "더 묵다", "숙박을 늘릴 때 써요."]]],
        ["them", "No problem. Same room?"],
        ["guest", "Yes, please. And could I get a late checkout on Sunday?"],
        ["them", "Sure. I'll put a note on your booking.", [["put a note", "메모해 두다", "요청을 기록해 둔다는 뜻이에요."]]]
      ] }]
  ]],
  ["휴대폰 개통", [
    ["10:00", "유심 요금제 고르기", "phonestore", {
      who: "Zoe", whoKo: "휴대폰 가게 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! What can I help you with today?", want: "이 휴대폰에 쓸 유심이 필요하다고 하기", need: [["유심", ["sim"]]], hint: ["I need a ~ card for this phone.", "I need a SIM card…", "I need a SIM card for this phone."], model: "I need a SIM card for this phone." },
        { say: "Sure. Are you looking for prepaid or a monthly plan?", want: "1년 있을 거라 월 요금제가 좋겠다고 하기", need: [["월 요금제", ["monthly"]]], hint: ["I'm here for a year, so a ~ plan, please.", "I'm here for a year, so…", "I'm here for a year, so a monthly plan, please."], model: "I'm here for a year, so a monthly plan, please.", chunk: ["prepaid", "선불", "미리 충전해서 쓰는 방식이에요."] },
        { say: "We have two. Twenty gigs for thirty dollars, or unlimited for forty-five.", want: "무제한에 통화도 들어 있는지 묻기", need: [["포함", ["include", "included", "includes", "come with"]]], hint: ["Does the unlimited one ~ calls?", "Does the unlimited one include…", "Does the unlimited one include calls?"], model: "Does the unlimited one include calls?" },
        { say: "Yes, unlimited calls and texts. I'll just need to see your ID.", want: "여권밖에 없는데 괜찮은지 묻기", need: [["여권", ["passport"]]], hint: ["I only have my ~. Is that okay?", "I only have my passport…", "I only have my passport. Is that okay?"], model: "I only have my passport. Is that okay?" },
        { say: "That's fine. Okay, your number's active. Try making a call.", want: "잘 된다고, 고맙다고 하기", need: [["된다", ["works", "working"]]], hint: ["It ~! Thanks so much.", "It works…", "It works! Thanks so much."], model: "It works! Thanks so much." }
      ],
      overhear: [
        ["guest", "My screen is cracked. Can you fix it here?", [["cracked", "금이 간", "화면이 깨졌을 때 써요."]]],
        ["them", "We don't do repairs, but there's a shop next door.", [["next door", "바로 옆", "옆 가게·옆집을 말해요."]]],
        ["guest", "How long does it usually take?"],
        ["them", "About an hour, I think."]
      ] }],
    ["14:00", "교통카드 정기권", "subway", {
      who: "Dan", whoKo: "역무원", voices: { them: "m", guest: "f" }, guestKo: "다른 승객",
      turns: [
        { say: "Hello again! I think I've seen you before.", want: "네, 작년에 표 샀다고, 이번엔 교통카드가 필요하다고 하기", need: [["교통카드", ["transit card", "card", "pass"]]], hint: ["Yes! This time I need a ~ card.", "Yes! This time I need…", "Yes! This time I need a transit card."], model: "Yes! This time I need a transit card." },
        { say: "Sure. Do you want to add money, or get a monthly pass?", want: "월 정기권이 얼마인지 묻기", need: [["얼마", ["how much"]], ["월 정기권", ["monthly", "month"]]], hint: ["How much is a ~ pass?", "How much is a monthly…", "How much is a monthly pass?"], model: "How much is a monthly pass?" },
        { say: "Ninety dollars. It works on buses too.", want: "그럼 정기권으로 하겠다고 하기", need: [["정기권", ["pass"]]], hint: ["Great, I'll get a monthly ~, then.", "Great, I'll get…", "Great, I'll get a monthly pass, then."], model: "Great, I'll get a monthly pass, then.", chunk: [", then", "그럼", "문장 끝에 then을 붙이면 '그럼 그걸로'라는 느낌이 나요."] },
        { say: "Here you go. Just tap it at the gate.", want: "잃어버리면 어떻게 되는지 묻기", need: [["잃어버리면", ["lose"]]], hint: ["What if I ~ it?", "What if I lose…", "What if I lose it?"], model: "What if I lose it?", chunk: ["What if ~?", "~하면 어떡해요?", "걱정되는 일을 물을 때 써요."] },
        { say: "Register it online, and we can replace it.", want: "좋은 생각이라고, 다시 고맙다고 하기", need: THANKS, hint: ["Good idea. ~ again!", "Good idea. Thanks…", "Good idea. Thanks again!"], model: "Good idea. Thanks again!" }
      ],
      overhear: [
        ["guest", "Excuse me, the gate won't open. My card isn't working.", [["won't open", "안 열려요", "고장 나서 안 될 때 won't를 써요."]]],
        ["them", "Let me check. Oh, your balance is too low.", [["balance", "잔액", "카드에 남은 돈이에요."]]],
        ["guest", "Can I top it up here?", [["top it up", "충전하다", "교통카드·휴대폰 충전에 써요."]]],
        ["them", "Sure, the machine is right over there."]
      ] }],
    ["17:00", "단골 카페에 다시", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "No way! You're back! How have you been?", want: "잘 지냈다고, 1년 살러 왔다고 하기", need: [["잘 지냄", ["good", "great", "well", "fine"]], ["1년", ["year"]]], hint: ["I've been ~! I moved here for a year.", "I've been great…", "I've been great! I moved here for a year."], model: "I've been great! I moved here for a year.", chunk: ["How have you been?", "어떻게 지냈어요?", "오랜만에 만난 사람에게 하는 인사예요."] },
        { say: "That's awesome! The usual? Large iced americano?", want: "기억하다니 놀랍다고, 그걸로 달라고 하기", need: [["기억", ["remember", "remembered"]]], hint: ["You ~! Yes, please.", "You remember…", "You remember! Yes, please."], model: "You remember! Yes, please.", chunk: ["The usual?", "늘 드시던 걸로요?", "단골에게 하는 말이에요."] },
        { say: "Of course I do. So, where are you staying?", want: "지금은 호텔인데 이 근처 집을 찾는 중이라고 하기", need: [["찾는 중", ["looking for", "looking", "searching"]]], hint: ["At a hotel for now, but I'm ~ for an apartment nearby.", "At a hotel for now, but I'm looking…", "At a hotel for now, but I'm looking for an apartment nearby."], model: "At a hotel for now, but I'm looking for an apartment nearby.", chunk: ["for now", "지금은 (당분간)", "곧 바뀔 상황을 말할 때 붙여요."] },
        { say: "Nice! This neighborhood is great. Rent's a little high, though.", want: "이 근처 집세가 보통 얼마인지 묻기", need: [["집세", ["rent"]]], hint: ["How much is ~ around here?", "How much is rent…", "How much is rent around here, usually?"], model: "How much is rent around here, usually?" },
        { say: "Around twelve hundred for a studio. And here's your coffee. It's on the house!", want: "정말 고맙다고 하기", need: THANKS, hint: ["Thanks, Leo! You're the ~.", "Thanks, Leo! You're…", "Thanks, Leo! You're the best."], model: "Thanks, Leo! You're the best.", chunk: ["on the house", "가게에서 드리는 거예요", "돈을 받지 않고 대접한다는 뜻이에요."] }
      ],
      overhear: [
        ["guest", "Hi, could I get an oat milk latte?", [["oat milk", "귀리 우유", "우유 대신 고를 수 있는 것: soy, almond, oat"]]],
        ["them", "Sure. Hot or iced?"],
        ["guest", "Hot, please. Can you make it extra hot?", [["extra hot", "아주 뜨겁게", "더 뜨겁게 해 달라는 주문이에요."]]],
        ["them", "You got it.", [["You got it", "그렇게 할게요", "부탁을 들어줄 때 짧게 하는 말이에요."]]]
      ] }]
  ]],
  ["은행 계좌 열기", [
    ["10:00", "계좌 만들기", "bank", {
      who: "Mr. Lewis", whoKo: "은행 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 고객",
      turns: [
        { say: "Good morning. How can I help you today?", want: "계좌를 하나 열고 싶다고 하기", need: [["계좌", ["account"]]], hint: ["I'd like to open a bank ~.", "I'd like to open…", "I'd like to open a bank account."], model: "I'd like to open a bank account.", chunk: ["open an account", "계좌를 열다", "닫을 때는 close an account예요."] },
        { say: "Sure. A checking account or a savings account?", want: "매일 쓸 거라 입출금 계좌로 하겠다고 하기", need: [["입출금", ["checking"]]], hint: ["~, please. It's for everyday use.", "Checking, please…", "Checking, please. It's for everyday use."], model: "Checking, please. It's for everyday use.", chunk: ["checking account", "입출금 통장", "모으는 용도는 savings account예요."] },
        { say: "Great. I'll need your passport and proof of address.", want: "아직 호텔에 있는데 호텔 주소도 되는지 묻기", need: [["주소", ["address"]]], hint: ["I'm staying at a hotel. Is the hotel ~ okay?", "I'm staying at a hotel. Is…", "I'm staying at a hotel. Is the hotel address okay?"], model: "I'm staying at a hotel. Is the hotel address okay?", chunk: ["proof of address", "주소 증명", "내 이름과 주소가 적힌 서류예요."] },
        { say: "That works for now. You can update it later. Would you like a debit card?", want: "네, 언제 받을 수 있는지 묻기", need: [["언제", ["when"]]], hint: ["Yes. ~ will I get it?", "Yes. When will…", "Yes. When will I get it?"], model: "Yes. When will I get it?", chunk: ["debit card", "체크카드", "계좌 돈이 바로 나가요. 신용카드는 credit card."] },
        { say: "It'll arrive by mail in about a week.", want: "그럼 집 주소가 생기면 바꾸러 다시 오겠다고 하기", need: [["다시 오기", ["come back"]]], hint: ["Okay. I'll ~ back when I have an address.", "Okay. I'll come back…", "Okay. I'll come back when I have an address."], model: "Okay. I'll come back when I have an address." }
      ],
      overhear: [
        ["guest", "I'd like to send money to another bank.", [["send money", "송금하다", "transfer money라고도 해요."]]],
        ["them", "Sure. Is it a domestic or an international transfer?", [["international", "해외", "국내는 domestic이에요."]]],
        ["guest", "International. To Canada."],
        ["them", "There's a fifteen-dollar fee for that.", [["fee", "수수료", "은행·가게에서 따로 받는 돈이에요."]]]
      ] }],
    ["12:00", "푸드트럭 다시", "foodtruck", {
      who: "Carlos", whoKo: "푸드트럭 사장님", voices: { them: "m2", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, my friend! You're back! Tacos again?", want: "지난번이랑 같은 걸로 달라고 하기", need: [["같은 것", ["same"]]], hint: ["Yes! The ~ as last time, please.", "Yes! The same…", "Yes! The same as last time, please."], model: "Yes! The same as last time, please.", chunk: ["the same as last time", "지난번이랑 같은 걸로", "단골 가게에서 편하게 주문하는 말이에요."] },
        { say: "Two chicken tacos, extra spicy. You still like it hot?", want: "응, 근데 이번엔 덜 맵게 해 달라고 하기", need: [["덜 맵게", ["less spicy", "mild", "not too spicy", "less hot"]]], hint: ["Yes, but make it ~ spicy this time.", "Yes, but make it less…", "Yes, but make it less spicy this time."], model: "Yes, but make it less spicy this time." },
        { say: "No problem. So what brings you back?", want: "은행 계좌 열고 오는 길이고 이제 여기 산다고 하기", need: [["살기", ["live", "living", "moved"]]], hint: ["I just opened a bank account. I ~ here now!", "I just opened a bank account. I live…", "I just opened a bank account. I live here now!"], model: "I just opened a bank account. I live here now!" },
        { say: "No way! Welcome to the neighborhood. Need anything else?", want: "탄산음료도 하나 달라고 하기", need: [["음료", ["soda", "drink", "coke", "pop"]]], hint: ["Can I get a ~ too?", "Can I get a soda…", "Can I get a soda too?"], model: "Can I get a soda too?" },
        { say: "Here you go. Ten bucks.", want: "12달러를 내며 거스름돈은 가지시라고 하기", need: [["거스름돈", ["change"]]], hint: ["Here's twelve. ~ the change.", "Here's twelve. Keep…", "Here's twelve. Keep the change."], model: "Here's twelve. Keep the change.", chunk: ["bucks", "달러", "dollars를 편하게 부르는 말이에요."] }
      ],
      overhear: [
        ["guest", "What's good today?"],
        ["them", "The fish tacos. The fish came in fresh this morning.", [["fresh this morning", "오늘 아침에 들어온", "재료가 신선하다고 말할 때 써요."]]],
        ["guest", "Sounds great. I'll try those."],
        ["them", "Good choice!", [["Good choice", "잘 고르셨어요", "주문을 받을 때 가게에서 자주 하는 말이에요."]]]
      ] }],
    ["16:00", "생활용품 사기", "pharmacy", {
      who: "Grace", whoKo: "약사", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Can I help you find something?", want: "칫솔이랑 샴푸가 어디 있는지 묻기", need: [["칫솔", ["toothbrush", "toothbrushes"]]], hint: ["Where can I find ~ and shampoo?", "Where can I find toothbrushes…", "Where can I find toothbrushes and shampoo?"], model: "Where can I find toothbrushes and shampoo?", chunk: ["Where can I find ~?", "~ 어디 있어요?", "가게에서 물건 자리를 물을 때 써요."] },
        { say: "Aisle three. Anything else?", want: "막 이사 와서 기본 물건이 다 필요하다고 하기", need: [["이사", ["moved", "new here"]]], hint: ["I just ~ here, so I need all the basics.", "I just moved here…", "I just moved here, so I need all the basics."], model: "I just moved here, so I need all the basics.", chunk: ["the basics", "기본적인 것들", "꼭 필요한 기본 물건이에요."] },
        { say: "Oh, welcome! We have a starter kit for new customers. It's on sale.", want: "안에 뭐가 들었는지 묻기", need: [["뭐가", ["what's in", "what is in", "what comes"]]], hint: ["What's ~ it?", "What's in…", "What's in it?"], model: "What's in it?" },
        { say: "Soap, toothpaste, shampoo, and a towel. Twelve dollars.", want: "좋다고, 하나 사겠다고 하기", need: [["사기", ["i'll take", "i'll get", "i'll buy"]]], hint: ["Perfect. I'll ~ one.", "Perfect. I'll take…", "Perfect. I'll take one."], model: "Perfect. I'll take one." },
        { say: "Do you have our rewards card?", want: "없다고, 하나 만들 수 있는지 묻기", need: [["가입", ["sign up", "get one", "join"]]], hint: ["No. Can I ~ up for one?", "No. Can I sign up…", "No. Can I sign up for one?"], model: "No. Can I sign up for one?", chunk: ["sign up", "가입하다", "회원 카드·수업 등록에 두루 써요."] }
      ],
      overhear: [
        ["guest", "Do you have anything for allergies?", [["for allergies", "알레르기에 먹는", "for 뒤에 증상을 붙이면 '~에 먹는 약'이에요."]]],
        ["them", "Yes. Do you want the kind that doesn't make you sleepy?", [["make you sleepy", "졸리게 하다", "약 부작용을 말할 때 자주 들려요."]]],
        ["guest", "Yes, please. I have to work today."],
        ["them", "Then this one's best. One tablet a day."]
      ] }]
  ]],
  ["집 보러 다니기", [
    ["10:00", "부동산 상담", "agent", {
      who: "Linda", whoKo: "부동산 중개인", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi, come on in! Are you looking to rent?", want: "네, 원룸을 1년 빌리고 싶다고 하기", need: [["원룸", ["studio"]], ["1년", ["year"]]], hint: ["Yes, I'm looking for a ~ for a year.", "Yes, I'm looking for a studio…", "Yes, I'm looking for a studio for a year."], model: "Yes, I'm looking for a studio for a year.", chunk: ["studio", "원룸", "방 하나에 부엌이 같이 있는 집이에요."] },
        { say: "Okay. What's your budget?", want: "한 달에 1200달러까지라고 하기", need: [["예산", ["twelve hundred", "1200", "up to"]]], hint: ["~ to twelve hundred a month.", "Up to twelve…", "Up to twelve hundred a month."], model: "Up to twelve hundred a month.", chunk: ["budget", "예산", "쓸 수 있는 돈의 한도예요."] },
        { say: "Is there an area you prefer?", want: "어학원이랑 가까운 곳이면 좋겠다고 하기", need: [["가까운", ["close to", "near", "close"]]], hint: ["Somewhere ~ to my language school.", "Somewhere close…", "Somewhere close to my language school."], model: "Somewhere close to my language school." },
        { say: "I have two places near there. Is furnished important to you?", want: "네, 가구가 하나도 없어서 가구 딸린 곳이 좋다고 하기", need: [["가구", ["furnished", "furniture"]]], hint: ["Yes, ~ would be better. I don't have any furniture.", "Yes, furnished would be better…", "Yes, furnished would be better. I don't have any furniture."], model: "Yes, furnished would be better. I don't have any furniture.", chunk: ["furnished", "가구 딸린", "가구 없는 집은 unfurnished예요."] },
        { say: "Got it. Can you see one this afternoon?", want: "네, 2시가 좋다고 하기", need: [["2시", ["two", "2"]]], hint: ["Sure, ~ o'clock works for me.", "Sure, two o'clock…", "Sure, two o'clock works for me."], model: "Sure, two o'clock works for me.", chunk: ["works for me", "저는 좋아요", "약속 시간을 정할 때 자주 써요."] }
      ],
      overhear: [
        ["guest", "Are utilities included in the rent?", [["utilities", "공과금", "전기·수도·가스 요금을 묶어서 말해요."]]],
        ["them", "Water is included, but electricity isn't."],
        ["guest", "And how much is the deposit?", [["deposit", "보증금", "계약할 때 맡기는 돈이에요."]]],
        ["them", "One month's rent."]
      ] }],
    ["14:00", "첫 번째 집", "flat", {
      who: "Linda", whoKo: "부동산 중개인", voices: { them: "f2", guest: "m" }, guestKo: "집 보러 온 다른 사람",
      turns: [
        { say: "So, this is the place. What do you think so far?", want: "정말 밝다고, 큰 창문이 좋다고 하기", need: [["밝다", ["bright", "sunny"]]], hint: ["It's really ~! I love the big windows.", "It's really bright…", "It's really bright! I love the big windows."], model: "It's really bright! I love the big windows.", chunk: ["so far", "지금까지는", "아직 다 안 봤지만 일단 어떤지 물을 때 써요."] },
        { say: "And the kitchen was just renovated.", want: "세탁기가 있는지 묻기", need: [["세탁기", ["washing machine", "washer", "laundry"]]], hint: ["Is there a ~ machine?", "Is there a washing…", "Is there a washing machine?"], model: "Is there a washing machine?" },
        { say: "There's a laundry room in the basement.", want: "밤에 건물이 조용한지 묻기", need: [["조용", ["quiet"]]], hint: ["Is the building ~ at night?", "Is the building quiet…", "Is the building quiet at night?"], model: "Is the building quiet at night?" },
        { say: "Very quiet. Most of the neighbors are older couples.", want: "언제 들어올 수 있는지 묻기", need: [["입주", ["move in"]]], hint: ["When can I ~ in?", "When can I move…", "When can I move in?"], model: "When can I move in?", chunk: ["move in", "입주하다", "나가는 건 move out이에요."] },
        { say: "Next Monday. Should I tell the landlord you're interested?", want: "네, 그래도 하룻밤 생각해 보겠다고 하기", need: [["생각", ["think", "sleep on it"]]], hint: ["Yes, but let me ~ about it overnight.", "Yes, but let me think…", "Yes, but let me think about it overnight."], model: "Yes, but let me think about it overnight.", chunk: ["sleep on it", "하룻밤 생각해 보다", "바로 정하지 않고 시간을 달라는 말이에요."] }
      ],
      overhear: [
        ["guest", "Are pets allowed here?", [["Are pets allowed", "반려동물 돼요?", "계약 전에 꼭 묻는 말이에요."]]],
        ["them", "Small pets are fine, with a small extra fee."],
        ["guest", "What about parking?"],
        ["them", "There's only street parking, I'm afraid.", [["I'm afraid", "아쉽지만", "안 좋은 소식을 부드럽게 전할 때 붙여요."]]]
      ] }],
    ["18:00", "동네 추천 받기", "market", {
      who: "Joe", whoKo: "과일 가게 주인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hey, it's you! Back for more apples?", want: "응, 그리고 이 동네로 이사 올까 생각 중이라고 하기", need: [["생각 중", ["thinking", "considering"]]], hint: ["Yes! And I'm ~ about moving to this area.", "Yes! And I'm thinking…", "Yes! And I'm thinking about moving to this area."], model: "Yes! And I'm thinking about moving to this area." },
        { say: "Oh, it's a great area. Really friendly.", want: "밤에도 안전한지 묻기", need: [["안전", ["safe"]]], hint: ["Is it ~ at night too?", "Is it safe…", "Is it safe at night too?"], model: "Is it safe at night too?" },
        { say: "Yes, totally. And the market's open every day.", want: "근처에 큰 마트도 있는지 묻기", need: [["마트", ["supermarket", "grocery store"]]], hint: ["Is there a ~ nearby too?", "Is there a supermarket…", "Is there a supermarket nearby too?"], model: "Is there a supermarket nearby too?" },
        { say: "Two blocks away. But my apples are better!", want: "웃으며 그럼 사과 여섯 개 달라고 하기", need: [["여섯", ["six", "6"]]], hint: ["Ha! Then ~ apples, please.", "Ha! Then six…", "Ha! Then six apples, please."], model: "Ha! Then six apples, please." },
        { say: "Here you go. Three dollars.", want: "고맙다고, 곧 이웃이 되면 좋겠다고 하기", need: [["이웃", ["neighbor", "neighbors"]]], hint: ["Thanks! I hope we'll be ~ soon.", "Thanks! I hope we'll be…", "Thanks! I hope we'll be neighbors soon."], model: "Thanks! I hope we'll be neighbors soon." }
      ],
      overhear: [
        ["guest", "Are these strawberries sweet?"],
        ["them", "Try one. They just came in this morning.", [["came in", "들어왔어요", "물건이 가게에 도착했다는 뜻이에요."]]],
        ["guest", "Wow, they're really sweet. I'll take a box."],
        ["them", "Great. Anything else for you?"]
      ] }]
  ]],
  ["계약하는 날", [
    ["10:00", "집 다시 보기", "flat", {
      who: "Linda", whoKo: "부동산 중개인", voices: { them: "f2", guest: "m" }, guestKo: "집 보러 온 다른 사람",
      turns: [
        { say: "Good morning! So, did you sleep on it?", want: "네, 이 집으로 하고 싶다고 하기", need: [["결정", ["i'd like", "i want", "take it", "decided"]]], hint: ["Yes. I'd like to ~ it.", "Yes. I'd like to take…", "Yes. I'd like to take it."], model: "Yes. I'd like to take it." },
        { say: "Wonderful! Any questions before we meet the landlord?", want: "공과금이 한 달에 보통 얼마인지 묻기", need: [["공과금", ["utilities", "bills"]]], hint: ["How much are the ~ per month?", "How much are the utilities…", "How much are the utilities per month?"], model: "How much are the utilities per month?" },
        { say: "About eighty dollars in winter. Less in summer.", want: "인터넷도 포함인지 묻기", need: [["인터넷", ["internet", "wifi", "wi fi"]]], hint: ["Is the ~ included?", "Is the internet…", "Is the internet included?"], model: "Is the internet included?" },
        { say: "No, you'll need to set it up yourself.", want: "추천할 인터넷 회사가 있는지 묻기", need: [["추천", ["recommend", "suggest"]]], hint: ["Can you ~ a company?", "Can you recommend…", "Can you recommend a company?"], model: "Can you recommend a company?", chunk: ["set it up", "설치하다", "인터넷·기계를 처음 쓸 수 있게 할 때 써요."] },
        { say: "I'll text you a few names. Ready to meet Mr. Patel?", want: "네, 조금 떨리긴 한다고 하기", need: [["떨림", ["nervous"]]], hint: ["Yes. I'm a little ~, though.", "Yes. I'm a little nervous…", "Yes. I'm a little nervous, though."], model: "Yes. I'm a little nervous, though.", chunk: [", though", "~긴 하지만", "문장 끝에 붙여 살짝 덧붙이는 말이에요."] }
      ],
      overhear: [
        ["guest", "Can I paint the walls?"],
        ["them", "You'd have to ask the landlord first.", [["ask the landlord first", "먼저 집주인에게 묻다", "허락이 필요한 일에 써요."]]],
        ["guest", "Okay. And who fixes things if they break?"],
        ["them", "The landlord takes care of repairs.", [["takes care of", "맡아서 하다", "책임지고 처리한다는 뜻이에요."]]]
      ] }],
    ["14:00", "계약서 쓰기", "landlord", {
      who: "Mr. Patel", whoKo: "집주인", voices: { them: "m", guest: "f2" }, guestKo: "부동산 중개인",
      turns: [
        { say: "Nice to meet you. Linda tells me you're a student?", want: "저도 반갑다고, 어학원에 다닌다고 하기", need: [["어학원", ["language school", "school"]]], hint: ["Nice to meet you too. Yes, I'm at a ~ school.", "Nice to meet you too. Yes, I'm at…", "Nice to meet you too. Yes, I'm at a language school."], model: "Nice to meet you too. Yes, I'm at a language school." },
        { say: "Good. The lease is for twelve months. Please read it carefully.", want: "모르는 게 있으면 물어봐도 되는지 묻기", need: [["묻기", ["ask"]]], hint: ["Can I ~ if I don't understand something?", "Can I ask…", "Can I ask if I don't understand something?"], model: "Can I ask if I don't understand something?", chunk: ["lease", "임대 계약", "집을 빌리는 계약서예요."] },
        { say: "Of course. Take your time.", want: "'notice period'가 무슨 뜻인지 묻기", need: [["뜻", ["mean", "meaning"]]], hint: ["What does 'notice period' ~?", "What does 'notice period'…", "What does 'notice period' mean?"], model: "What does 'notice period' mean?", chunk: ["What does ~ mean?", "~가 무슨 뜻이에요?", "모르는 말을 물을 때 가장 쉬운 말이에요."] },
        { say: "It means you have to tell me thirty days before you move out.", want: "알겠다고, 어디에 서명하면 되는지 묻기", need: [["서명", ["sign"]]], hint: ["Got it. Where do I ~?", "Got it. Where do I…", "Got it. Where do I sign?"], model: "Got it. Where do I sign?" },
        { say: "Right here. And here are your keys. Welcome home!", want: "고맙다고, 집 잘 쓰겠다고 하기", need: [["잘 쓰기", ["take good care", "take care"]]], hint: ["Thank you! I'll take good ~ of it.", "Thank you! I'll take good…", "Thank you! I'll take good care of it."], model: "Thank you! I'll take good care of it." }
      ],
      overhear: [
        ["guest", "Mr. Patel, the rent is due on the first of the month, right?", [["is due", "내야 하는 날이다", "돈·과제 마감에 써요."]]],
        ["them", "That's right. A bank transfer is fine."],
        ["guest", "And the deposit comes back when the lease ends?"],
        ["them", "Yes, as long as everything's in good shape.", [["as long as", "~하기만 하면", "조건을 붙일 때 써요."], ["in good shape", "상태가 좋은", "물건·몸 상태가 좋다는 뜻이에요."]]]
      ] }],
    ["19:00", "축하 저녁", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Good evening! Celebrating something tonight?", want: "응, 오늘 첫 집 계약했다고 하기", need: [["계약", ["signed", "lease"]]], hint: ["Yes! I just ~ a lease on my first apartment.", "Yes! I just signed…", "Yes! I just signed a lease on my first apartment."], model: "Yes! I just signed a lease on my first apartment." },
        { say: "Congratulations! Then how about our special tonight? It's steak.", want: "좋다고, 미디엄으로 해 달라고 하기", need: [["미디엄", ["medium"]]], hint: ["Sounds great. ~, please.", "Sounds great. Medium…", "Sounds great. Medium, please."], model: "Sounds great. Medium, please.", chunk: ["How about ~?", "~ 어때요?", "무언가를 권할 때 써요."] },
        { say: "And something to drink with that?", want: "탄산수만 달라고 하기", need: [["탄산수", ["sparkling", "soda water"]]], hint: ["Just ~ water, please.", "Just sparkling…", "Just sparkling water, please."], model: "Just sparkling water, please." },
        { say: "How was everything?", want: "정말 맛있었다고, 하루를 완벽하게 마무리했다고 하기", need: [["맛", ["delicious", "great", "amazing"]]], hint: ["It was ~. A perfect end to the day.", "It was delicious…", "It was delicious. A perfect end to the day."], model: "It was delicious. A perfect end to the day." },
        { say: "Glad to hear it. Here's the check, whenever you're ready.", want: "고맙다고 하며 카드를 건네기", need: [["카드", ["card"]]], hint: ["Thanks. Here's my ~.", "Thanks. Here's…", "Thanks. Here's my card."], model: "Thanks. Here's my card.", chunk: ["whenever you're ready", "편하실 때", "손님을 재촉하지 않는 말이에요."] }
      ],
      overhear: [
        ["guest", "Excuse me, could we get the check, please?", [["get the check", "계산서를 받다", "식당에서 계산할 때 써요."]]],
        ["them", "Sure. Together or separate?", [["Together or separate?", "같이 내세요, 따로 내세요?", "여럿이 먹으면 꼭 나오는 질문이에요."]]],
        ["guest", "Separate, please."],
        ["them", "No problem. I'll be right back."]
      ] }]
  ]],
  ["동네 다시 걷기", [
    ["10:00", "공원에서 Ella와 Max", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Oh, hi! Didn't we meet here last year?", want: "맞다고, 강아지가 Max였다고 하기", need: [["Max", ["max"]]], hint: ["Yes! And this is ~, right?", "Yes! And this is Max…", "Yes! And this is Max, right?"], model: "Yes! And this is Max, right?", chunk: [", right?", "~ 맞죠?", "기억이 맞는지 확인할 때 끝에 붙여요."] },
        { say: "Good memory! What are you doing back here?", want: "이 근처로 이사 와서 1년 산다고 하기", need: [["이사", ["moved", "moving"]]], hint: ["I just ~ nearby. I'm living here for a year.", "I just moved nearby…", "I just moved nearby. I'm living here for a year."], model: "I just moved nearby. I'm living here for a year." },
        { say: "That's great! Max and I walk here every morning.", want: "나도 아침마다 달리기하러 오겠다고 하기", need: [["달리기", ["run", "running", "jog", "jogging"]]], hint: ["Maybe I'll come here to ~ every morning too.", "Maybe I'll come here to run…", "Maybe I'll come here to run every morning too."], model: "Maybe I'll come here to run every morning too." },
        { say: "You should! Oh, do you know about the farmers market on Saturdays?", want: "몰랐다고, 어디서 하는지 묻기", need: [["어디", ["where"]]], hint: ["No, I didn't. ~ is it?", "No, I didn't. Where…", "No, I didn't. Where is it?"], model: "No, I didn't. Where is it?" },
        { say: "Right by the lake. I'll see you around, neighbor!", want: "나도 또 보자고 인사하기", need: [["또 보자", ["see you"]]], hint: ["~ you around!", "See you…", "See you around!"], model: "See you around!", chunk: ["See you around", "또 봐요", "언제 또 만날지 정하지 않고 가볍게 하는 인사예요."] }
      ],
      overhear: [
        ["guest", "What a cute dog! Can I pet him?", [["pet him", "쓰다듬다", "남의 강아지를 만지기 전에 꼭 물어봐요."]]],
        ["them", "Sure, he loves people."],
        ["guest", "How old is he?"],
        ["them", "He just turned five.", [["just turned five", "막 다섯 살이 됐어요", "나이를 말할 때 turn을 써요."]]]
      ] }],
    ["13:00", "봄옷 사기", "shop", {
      who: "Mia", whoKo: "옷 가게 점원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi again! Did the large fit okay last time?", want: "응, 잘 맞았다고, 오늘은 가벼운 재킷을 찾는다고 하기", need: [["재킷", ["jacket"]]], hint: ["It was perfect! Today I'm looking for a light ~.", "It was perfect! Today I'm looking for…", "It was perfect! Today I'm looking for a light jacket."], model: "It was perfect! Today I'm looking for a light jacket." },
        { say: "For spring? We just got these in. What color do you like?", want: "남색이나 회색이 좋다고 하기", need: [["색", ["navy", "gray", "grey"]]], hint: ["Something ~ or gray.", "Something navy…", "Something navy or gray."], model: "Something navy or gray." },
        { say: "How about this navy one? It's water-resistant, too.", want: "비 올 때도 입을 수 있냐고 묻기", need: [["비", ["rain"]]], hint: ["So I can wear it in the ~?", "So I can wear it…", "So I can wear it in the rain?"], model: "So I can wear it in the rain?", chunk: ["water-resistant", "생활 방수", "완전 방수는 waterproof예요."] },
        { say: "Light rain, yes. It's seventy dollars, but it's twenty percent off today.", want: "그럼 얼마인지 계산해서 묻기", need: [["얼마", ["how much", "fifty six", "56"]]], hint: ["So ~ is it with the discount?", "So how much…", "So how much is it with the discount?"], model: "So how much is it with the discount?", chunk: ["twenty percent off", "20% 할인", "off 앞에 할인율을 붙여요."] },
        { say: "Fifty-six. Would you like to try it on?", want: "아니, 지난번 사이즈로 그냥 사겠다고 하기", need: [["그냥 사기", ["take it", "i'll take", "i'll get", "buy it"]]], hint: ["No, I'll just ~ it in a large.", "No, I'll just take…", "No, I'll just take it in a large."], model: "No, I'll just take it in a large." }
      ],
      overhear: [
        ["guest", "Do you have this in a different color?", [["in a different color", "다른 색으로", "같은 옷의 다른 색을 찾을 때 써요."]]],
        ["them", "We have it in black and white."],
        ["guest", "Black, please. Is it on sale too?"],
        ["them", "Yes, everything on this rack is.", [["on this rack", "이 옷걸이에 있는", "가게의 옷걸이 줄을 rack이라고 해요."]]]
      ] }],
    ["17:00", "헬스장 다시 등록", "gym", {
      who: "Tyler", whoKo: "헬스장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 회원",
      turns: [
        { say: "Hey! You came in last year, right?", want: "맞다고, 이번엔 1년 회원권을 하고 싶다고 하기", need: [["1년", ["yearly", "year", "annual"]]], hint: ["Yes! This time I'd like a ~ membership.", "Yes! This time I'd like…", "Yes! This time I'd like a yearly membership."], model: "Yes! This time I'd like a yearly membership.", chunk: ["membership", "회원권", "회원이 되는 걸 통째로 말해요."] },
        { say: "Nice. The yearly plan is four hundred, so it's cheaper than monthly.", want: "한 번에 내야 하는지 묻기", need: [["한 번에", ["all at once", "at once", "upfront", "up front"]]], hint: ["Do I have to pay it all at ~?", "Do I have to pay…", "Do I have to pay it all at once?"], model: "Do I have to pay it all at once?" },
        { say: "You can split it into four payments.", want: "그럼 나눠서 내겠다고 하기", need: [["나눠 내기", ["split", "four payments", "installments"]]], hint: ["Then I'll ~ it, please.", "Then I'll split…", "Then I'll split it, please."], model: "Then I'll split it, please.", chunk: ["split it", "나눠서 내다", "여럿이 돈을 나눌 때도 써요."] },
        { say: "Done. Want to book a free session with a trainer?", want: "좋다고, 주말에 되는지 묻기", need: [["주말", ["weekend", "saturday", "sunday"]]], hint: ["Sure. Is there one on the ~?", "Sure. Is there…", "Sure. Is there one on the weekend?"], model: "Sure. Is there one on the weekend?" },
        { say: "Saturday at ten. See you then!", want: "그때 보자고 하기", need: [["그때 보자", ["see you"]]], hint: ["Great, ~ you then!", "Great, see…", "Great, see you then!"], model: "Great, see you then!" }
      ],
      overhear: [
        ["guest", "Hi, I forgot my membership card.", [["forgot", "깜빡하다", "가져오는 걸 잊었을 때 써요."]]],
        ["them", "No worries. Can I get your phone number?"],
        ["guest", "Sure, it's on my account."],
        ["them", "Got it. You're all checked in.", [["You're all checked in", "입장 처리 다 됐어요", "all을 넣으면 '다 끝났다'는 느낌이에요."]]]
      ] }]
  ]],
  ["Sara와 다시 만나기", [
    ["11:00", "모임에서 Sara", "meetup", {
      who: "Sara", whoKo: "모임에서 만난 친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
      turns: [
        { say: "Wait… is that you?! What are you doing here?", want: "깜짝 놀래 주려고 했다고, 1년 살러 왔다고 하기", need: [["깜짝", ["surprise"]], ["1년", ["year"]]], hint: ["~! I moved here for a year.", "Surprise! I moved…", "Surprise! I moved here for a year."], model: "Surprise! I moved here for a year." },
        { say: "Oh my gosh! Why didn't you tell me?", want: "직접 말하고 싶었다고 하기", need: [["직접", ["in person", "face to face"]]], hint: ["I wanted to tell you in ~.", "I wanted to tell you…", "I wanted to tell you in person."], model: "I wanted to tell you in person.", chunk: ["in person", "직접 만나서", "문자나 전화가 아니라 얼굴 보고 할 때 써요."] },
        { say: "That's so sweet. So, did you find a place yet?", want: "응, 어제 계약했고 다음 주에 들어간다고 하기", need: [["입주", ["move in", "moving in"]]], hint: ["Yes! I signed yesterday. I ~ in next week.", "Yes! I signed yesterday. I move…", "Yes! I signed yesterday. I move in next week."], model: "Yes! I signed yesterday. I move in next week." },
        { say: "Do you need help moving? I have a car.", want: "정말이냐고, 그럼 너무 고맙겠다고 하기", need: [["고마움", ["thank", "thanks", "amazing", "great", "help"]]], hint: ["Really? That would be ~. Thank you!", "Really? That would be…", "Really? That would be amazing. Thank you!"], model: "Really? That would be amazing. Thank you!", chunk: ["That would be ~", "그러면 ~겠어요", "제안을 받아들일 때 would로 부드럽게 말해요."] },
        { say: "Of course! Come over to my place this afternoon. Let's catch up!", want: "좋다고, 몇 시에 가면 되는지 묻기", need: [["몇 시", ["what time", "when"]]], hint: ["I'd love to! What ~ should I come?", "I'd love to! What time…", "I'd love to! What time should I come?"], model: "I'd love to! What time should I come?", chunk: ["catch up", "밀린 이야기를 하다", "오랜만에 만나 그동안의 일을 나눌 때 써요."] }
      ],
      overhear: [
        ["guest", "Sara, who's your friend?"],
        ["them", "We met here last year! They just moved here."],
        ["guest", "Oh, welcome back! How long are you staying?", [["How long are you staying?", "얼마나 있어요?", "머무는 기간을 물을 때 써요."]]],
        ["them", "A whole year. Isn't that great?", [["A whole year", "꼬박 1년", "whole을 넣으면 '통째로'라는 느낌이에요."]]]
      ] }],
    ["15:00", "Sara의 집에서", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Come in, come in! Coffee or tea?", want: "차 달라고, 집이 그대로라고 하기", need: [["차", ["tea"]]], hint: ["~, please. Your place looks the same!", "Tea, please…", "Tea, please. Your place looks the same!"], model: "Tea, please. Your place looks the same!" },
        { say: "Ha, nothing ever changes here. So, what made you decide to come back?", want: "여기 사람들이 너무 좋았다고 하기", need: [["사람들", ["people"]]], hint: ["I really loved the ~ here.", "I really loved…", "I really loved the people here."], model: "I really loved the people here.", chunk: ["What made you decide ~?", "왜 ~하기로 했어요?", "결정한 이유를 물을 때 써요."] },
        { say: "Aw, that includes me, right?", want: "당연하지, 특히 너라고 하기", need: [["특히", ["especially", "of course"]]], hint: ["Of course! ~ you.", "Of course! Especially…", "Of course! Especially you."], model: "Of course! Especially you." },
        { say: "What's your plan for the year?", want: "영어 공부하고, 나중에 인턴도 해 보고 싶다고 하기", need: [["인턴", ["internship", "intern"]]], hint: ["Study English, and maybe get an ~ later.", "Study English, and maybe…", "Study English, and maybe get an internship later."], model: "Study English, and maybe get an internship later." },
        { say: "That sounds amazing. I'll help however I can.", want: "고맙다고, 너 덕분에 벌써 여기가 집 같다고 하기", need: [["집 같다", ["home"]]], hint: ["Thanks. You already make this place feel like ~.", "Thanks. You already make this place…", "Thanks. You already make this place feel like home."], model: "Thanks. You already make this place feel like home.", chunk: ["feel like home", "집처럼 편하다", "낯선 곳이 편하게 느껴질 때 써요."] }
      ],
      overhear: [
        ["guest", "Sara, where do you keep the mugs?"],
        ["them", "Top shelf, on the left.", [["Top shelf", "맨 위 칸", "선반 위치를 말할 때 써요."]]],
        ["guest", "Got it. Should I make more tea?"],
        ["them", "Yes, please. We're going to be talking for a while.", [["for a while", "한동안", "꽤 오래 걸린다는 뜻이에요."]]]
      ] }],
    ["19:00", "같이 영화 보기", "movie", {
      who: "Ava", whoKo: "매표소 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! What would you like to see tonight?", want: "8시 코미디 영화 두 장 달라고 하기", need: [["두 장", ["two"]], ["8시", ["eight", "8"]]], hint: ["~ tickets for the eight o'clock comedy, please.", "Two tickets for…", "Two tickets for the eight o'clock comedy, please."], model: "Two tickets for the eight o'clock comedy, please." },
        { say: "Sure. Where would you like to sit?", want: "가운데쯤 붙어 있는 자리로 달라고 하기", need: [["가운데", ["middle", "center", "centre"]]], hint: ["Two seats together in the ~, please.", "Two seats together…", "Two seats together in the middle, please."], model: "Two seats together in the middle, please." },
        { say: "Row F, seats 8 and 9. Are you a member?", want: "아니라고, 학생 할인이 있는지 묻기", need: [["학생 할인", ["student discount", "student"]]], hint: ["No. Do you have a ~ discount?", "No. Do you have a student…", "No. Do you have a student discount?"], model: "No. Do you have a student discount?" },
        { say: "Yes, with a student ID. It's eight dollars each.", want: "학생증은 아직 없다고, 그냥 일반으로 하겠다고 하기", need: [["아직", ["yet", "don't have"]]], hint: ["I don't have one ~. Regular is fine.", "I don't have one yet…", "I don't have one yet. Regular is fine."], model: "I don't have one yet. Regular is fine." },
        { say: "No problem. That's twenty-four dollars. Enjoy the movie!", want: "고맙다고, 팝콘은 어디서 사는지 묻기", need: [["팝콘", ["popcorn"]]], hint: ["Thanks! Where can I get ~?", "Thanks! Where can I get…", "Thanks! Where can I get popcorn?"], model: "Thanks! Where can I get popcorn?" }
      ],
      overhear: [
        ["guest", "Is the nine o'clock show sold out?", [["sold out", "매진", "표가 다 팔렸다는 뜻이에요."]]],
        ["them", "Almost. There are only a few seats left in the front row.", [["front row", "맨 앞줄", "맨 뒷줄은 back row예요."]]],
        ["guest", "Hmm, that's okay. I'll take one."],
        ["them", "Great. Your movie starts in theater three."]
      ] }]
  ]]
]);
