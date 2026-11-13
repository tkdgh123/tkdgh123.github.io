// 7주째 · 봄나들이 (43~49일째). 날씨가 풀려서 친구들과 자전거, 꽃 축제, 피크닉, 공연, 사진, 주말 계획.
// 장면 = [시간, 이름, 그림 id, 대본]. 그림 id가 week.js ART에 들어오면 열린다. 형식은 ~/sulsul-art/YEAR.md
WEEK(7, [
  ["날씨 이야기", [
    ["09:00", "카페에서 날씨 인사", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Morning! Gorgeous day, isn't it?", want: "정말 그렇다고, 드디어 봄이라고 하기", need: [["봄", ["spring"]]], hint: ["It really is! ~ is finally here.", "It really is! Spring…", "It really is! Spring is finally here."], model: "It really is! Spring is finally here.", chunk: ["finally here", "드디어 왔어요", "기다리던 것이 왔을 때 써요."] },
        { say: "Totally. It was so cold last week.", want: "맞다고, 지난주엔 얼어붙을 것 같았다고 하기", need: [["추위", ["freezing", "cold"]]], hint: ["I know! Last week it was ~.", "I know! Last week…", "I know! Last week it was freezing."], model: "I know! Last week it was freezing." },
        { say: "The forecast says it'll be sunny all weekend.", want: "그럼 비는 전혀 안 오냐고 묻기", need: [["비", ["rain"]]], hint: ["So it won't ~ at all?", "So it won't rain…", "So it won't rain at all?"], model: "So it won't rain at all?" },
        { say: "Maybe a little on Sunday night. So, what'll it be today?", want: "오늘은 더우니까 아이스로 하겠다고 하기", need: [["아이스", ["iced"]]], hint: ["It's warm today, so I'll have an ~ one.", "It's warm today, so I'll have…", "It's warm today, so I'll have an iced one."], model: "It's warm today, so I'll have an iced one.", chunk: ["I'll have", "~로 할게요", "주문할 때 뒤에 메뉴를 붙여요."] },
        { say: "Coming right up. Enjoy the sunshine!", want: "고맙다고, 당신도 즐기라고 하기", need: [["너도", ["you too", "same to you"]]], hint: ["Thanks, Leo! You ~.", "Thanks, Leo! You…", "Thanks, Leo! You too."], model: "Thanks, Leo! You too." }
      ],
      overhear: [
        ["guest", "It's supposed to get really hot this week.", [["supposed to", "~라고 해요", "예보나 소문을 전할 때 써요."]]],
        ["them", "Yeah, I heard it'll hit ninety."],
        ["guest", "Ugh, I'm not ready for summer."],
        ["them", "Don't worry, it cools down at night."]
      ] }],
    ["13:00", "수업 전 날씨 이야기", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f2" }, guestKo: "반 친구",
      turns: [
        { say: "Good afternoon! How's the weather out there?", want: "화창하지만 바람이 좀 분다고 하기", need: [["바람", ["windy", "breezy"]]], hint: ["It's sunny, but a little ~.", "It's sunny, but…", "It's sunny, but a little windy."], model: "It's sunny, but a little windy." },
        { say: "Good to know. Did you bring a jacket?", want: "집에 두고 왔지만 괜찮다고 하기", need: [["두고 옴", ["left", "forgot"]]], hint: ["I ~ it at home, but I'm fine.", "I left it…", "I left it at home, but I'm fine."], model: "I left it at home, but I'm fine." },
        { say: "Smart. What did you do this morning?", want: "산책하면서 꽃을 구경했다고 하기", need: [["산책", ["walk"]]], hint: ["I took a ~ and looked at the flowers.", "I took a walk…", "I took a walk and looked at the flowers."], model: "I took a walk and looked at the flowers.", chunk: ["took a walk", "산책했어요", "take a walk는 짧게 걷고 올 때 자연스러워요."] },
        { say: "Lovely. Weather is great for small talk. Do people in Korea talk about it too?", want: "네, 한국은 여름에 아주 습하다고 하기", need: [["습함", ["humid"]]], hint: ["Yes. In Korea, it gets very ~ in summer.", "Yes. In Korea, it gets very…", "Yes. In Korea, it gets very humid in summer."], model: "Yes. In Korea, it gets very humid in summer.", chunk: ["small talk", "가벼운 대화", "날씨처럼 부담 없는 이야기예요."] },
        { say: "Interesting! Okay, shall we get started?", want: "네, 준비됐다고 하기", need: [["준비", ["ready"]]], hint: ["Sure, I'm ~.", "Sure, I'm…", "Sure, I'm ready."], model: "Sure, I'm ready." }
      ],
      overhear: [
        ["guest", "It's so nice out. I don't want to be inside."],
        ["them", "I know. Maybe we'll have class outside someday."],
        ["guest", "Really? That would be great!"],
        ["them", "Don't hold your breath.", [["Don't hold your breath", "너무 기대하진 마세요", "잘 안 될 것 같을 때 써요."]]]
      ] }],
    ["18:00", "이웃과 저녁 인사", "neighbor", {
      who: "Mrs. Green", whoKo: "옆집 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 이웃",
      turns: [
        { say: "Oh, hello, dear. Isn't it a lovely evening?", want: "그렇다고, 공기가 상쾌하다고 하기", need: [["공기", ["air"]]], hint: ["It is! The ~ feels so fresh.", "It is! The air…", "It is! The air feels so fresh."], model: "It is! The air feels so fresh." },
        { say: "Yes. But my knees tell me it's going to rain.", want: "정말요? 예보에서는 맑다고 했다고 하기", need: [["예보", ["forecast"]]], hint: ["Really? The ~ said sunny.", "Really? The forecast…", "Really? The forecast said sunny."], model: "Really? The forecast said sunny." },
        { say: "Forecasts! I trust my knees more.", want: "그럼 우산을 챙기는 게 좋겠다고 하기", need: [["우산", ["umbrella"]]], hint: ["Then I'd better bring an ~.", "Then I'd better…", "Then I'd better bring an umbrella."], model: "Then I'd better bring an umbrella.", chunk: ["I'd better", "~하는 게 좋겠어요", "조언도, 스스로 다짐할 때도 써요."] },
        { say: "Good idea. Are you getting settled in the neighborhood?", want: "네, 점점 익숙해지고 있다고 하기", need: [["익숙", ["used to"]]], hint: ["Yes, I'm getting ~ it.", "Yes, I'm getting used…", "Yes, I'm getting used to it."], model: "Yes, I'm getting used to it.", chunk: ["get used to", "~에 익숙해지다", "to 뒤에는 명사가 와요."] },
        { say: "Wonderful. Good night, dear. Stay warm!", want: "안녕히 주무시라고 인사하기", need: [["밤인사", ["good night", "goodnight"]]], hint: ["~, Mrs. Green!", "Good night…", "Good night, Mrs. Green!"], model: "Good night, Mrs. Green!" }
      ],
      overhear: [
        ["them", "It's finally warm enough to keep the window open.", [["warm enough to", "~할 만큼 따뜻한", "enough는 형용사 뒤에 와요."]]],
        ["guest", "Not for long. It's getting dark."],
        ["them", "True. I'd better go in before it gets chilly.", [["chilly", "쌀쌀한", "cold보다 약하게 추울 때 써요."]]],
        ["guest", "Good night, Mrs. Green."]
      ] }]
  ]],
  ["자전거 빌리기", [
    ["09:30", "Sara와 자전거 약속", "meetup", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "모임 사람",
      turns: [
        { say: "Hey! Perfect weather. Want to go for a bike ride?", want: "좋은 생각이지만 자전거가 없다고 하기", need: [["자전거", ["bike", "bicycle"]]], hint: ["Great idea, but I don't have a ~.", "Great idea, but I don't…", "Great idea, but I don't have a bike."], model: "Great idea, but I don't have a bike." },
        { say: "No worries, we can rent one. There's a shop by the river.", want: "하루 빌리는 데 얼마인지 묻기", need: [["얼마", ["how much"]]], hint: ["~ does it cost to rent one for a day?", "How much does it cost…", "How much does it cost to rent one for a day?"], model: "How much does it cost to rent one for a day?" },
        { say: "About twenty bucks, I think. Should we go around ten?", want: "좋다고, 헬멧도 빌릴 수 있는지 묻기", need: [["헬멧", ["helmet"]]], hint: ["Sounds good. Can I rent a ~ too?", "Sounds good. Can I rent…", "Sounds good. Can I rent a helmet too?"], model: "Sounds good. Can I rent a helmet too?" },
        { say: "I think so. Do you remember how to ride? It's been a while.", want: "한동안 안 탔지만 금방 기억날 거라고 하기", need: [["기억남", ["come back"]]], hint: ["It's been a while, but it'll ~ to me.", "It's been a while, but it'll come…", "It's been a while, but it'll come back to me."], model: "It's been a while, but it'll come back to me.", chunk: ["come back to me", "다시 기억나요", "한동안 안 한 일이 몸에 다시 익을 때 써요."] },
        { say: "Ha, it's like riding a bike! Meet me at the bridge?", want: "좋다고, 다리에서 보자고 하기", need: [["다리", ["bridge"]]], hint: ["Okay, see you at the ~!", "Okay, see you…", "Okay, see you at the bridge!"], model: "Okay, see you at the bridge!" }
      ],
      overhear: [
        ["guest", "Hey, are you two going riding?"],
        ["them", "Yes! Want to come along?", [["come along", "같이 가다", "함께 가자고 권할 때 써요."]]],
        ["guest", "I'd love to, but I have to work today.", [["I'd love to, but", "그러고 싶지만", "아쉽게 거절할 때 써요."]]],
        ["them", "Next time, then!"]
      ] }],
    ["10:30", "자전거 빌리기", "bikeshop", {
      who: "Kyle", whoKo: "자전거 가게 직원", voices: { them: "m", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hey there! Looking to rent a bike?", want: "네, 네 시간쯤 빌리고 싶다고 하기", need: [["네 시간", ["four hours", "4 hours"]]], hint: ["Yes, I'd like to rent one for ~.", "Yes, I'd like to rent one for four…", "Yes, I'd like to rent one for four hours."], model: "Yes, I'd like to rent one for four hours." },
        { say: "Sure. City bike or mountain bike?", want: "도시용으로, 길이 대부분 평평하다고 하기", need: [["도시", ["city"]]], hint: ["A ~ bike, please. The path is mostly flat.", "A city bike…", "A city bike, please. The path is mostly flat."], model: "A city bike, please. The path is mostly flat." },
        { say: "Okay. It's ten an hour, plus a deposit.", want: "보증금이 얼마인지 묻기", need: [["보증금", ["deposit"]]], hint: ["How much is the ~?", "How much is the…", "How much is the deposit?"], model: "How much is the deposit?" },
        { say: "Fifty bucks. You get it back when you return the bike.", want: "보증금을 카드로 해도 되는지 묻기", need: [["카드", ["card"]]], hint: ["Can I put it on my ~?", "Can I put it…", "Can I put it on my card?"], model: "Can I put it on my card?", chunk: ["put it on my card", "카드로 계산하다", "결제 수단을 말할 때 put it on을 써요."] },
        { say: "Sure. Here's your helmet and lock. Please be back by two.", want: "알겠다고, 2시까지 돌아오겠다고 하기", need: [["돌아옴", ["be back", "bring it back", "return"]]], hint: ["No problem. I'll ~ by two.", "No problem. I'll be…", "No problem. I'll be back by two."], model: "No problem. I'll be back by two.", chunk: ["be back by", "~까지 돌아오다", "by 뒤에 마감 시각을 말해요."] }
      ],
      overhear: [
        ["guest", "Could you lower the seat a little?", [["lower the seat", "안장을 낮추다", "자전거 높이를 맞출 때 써요."]]],
        ["them", "Sure. Hop on and see if that's good.", [["Hop on", "올라타 봐요", "자전거·버스에 가볍게 올라탈 때 써요."]]],
        ["guest", "Perfect, thanks."],
        ["them", "Ride safe!"]
      ] }],
    ["13:00", "강변 자전거길에서", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Oh, nice bike! Are you riding along the river?", want: "네, 자전거길을 찾는 중이라고 하기", need: [["자전거길", ["bike path", "bike trail", "bike lane", "path", "trail"]]], hint: ["Yes, I'm trying to find the bike ~.", "Yes, I'm trying to find…", "Yes, I'm trying to find the bike path."], model: "Yes, I'm trying to find the bike path." },
        { say: "It starts right past that bridge. It's flat and shady.", want: "좋다고, 길이 얼마나 되는지 묻기", need: [["얼마나", ["how long", "how far"]]], hint: ["Great. ~ is it?", "Great. How long…", "Great. How long is it?"], model: "Great. How long is it?" },
        { say: "About six miles. Just watch out, Max loves to chase bikes!", want: "웃으며 조심하겠다고 하기", need: [["조심", ["careful", "watch out"]]], hint: ["Ha! I'll be ~.", "Ha! I'll be…", "Ha! I'll be careful."], model: "Ha! I'll be careful." },
        { say: "You'll be fine. There's a café at the halfway point.", want: "좋다고, 물을 안 가져왔다고 하기", need: [["물", ["water"]]], hint: ["Good, I forgot to bring ~.", "Good, I forgot…", "Good, I forgot to bring water."], model: "Good, I forgot to bring water.", chunk: ["forgot to bring", "가져오는 걸 깜빡했어요", "forget to 뒤에는 해야 할 일이 와요."] },
        { say: "Have fun! And keep your helmet on.", want: "물론이라고, 안전이 제일이라고 하기", need: [["안전", ["safety", "safe"]]], hint: ["Of course. ~ first!", "Of course. Safety…", "Of course. Safety first!"], model: "Of course. Safety first!" }
      ],
      overhear: [
        ["guest", "Excuse me, is this the way to the river?"],
        ["them", "Yes, just keep going straight."],
        ["guest", "Is it far?"],
        ["them", "Not really. About ten minutes on foot.", [["on foot", "걸어서", "탈것 없이 걸어간다는 뜻이에요."]]]
      ] }]
  ]],
  ["꽃 축제", [
    ["10:00", "꽃 가게에서", "festival", {
      who: "Maya", whoKo: "꽃 가게 상인", voices: { them: "f", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Welcome to the Flower Festival! Looking for anything special?", want: "그냥 구경 중인데 튤립이 예쁘다고 하기", need: [["튤립", ["tulips", "tulip"]]], hint: ["Just looking, but these ~ are beautiful!", "Just looking, but these tulips…", "Just looking, but these tulips are beautiful!"], model: "Just looking, but these tulips are beautiful!", chunk: ["Just looking", "구경만 해요", "가게에서 도움이 필요 없을 때 써요."] },
        { say: "Thank you! They're fresh today. A bouquet is fifteen dollars.", want: "친구 선물로는 뭐가 좋은지 묻기", need: [["선물", ["gift", "present"]]], hint: ["What would make a good ~ for a friend?", "What would make a good gift…", "What would make a good gift for a friend?"], model: "What would make a good gift for a friend?" },
        { say: "Daffodils are cheerful and last about a week. Or a mix of both.", want: "둘을 섞어서 만들어 달라고 하기", need: [["섞", ["mix", "mixed"]]], hint: ["Could you make a ~ of both?", "Could you make a mix…", "Could you make a mix of both?"], model: "Could you make a mix of both?" },
        { say: "Of course. Do you want it wrapped?", want: "네, 리본도 달아 달라고 하기", need: [["리본", ["ribbon"]]], hint: ["Yes, with a ~, please.", "Yes, with a…", "Yes, with a ribbon, please."], model: "Yes, with a ribbon, please." },
        { say: "Done! That's fifteen dollars.", want: "카드 되는지 묻기", need: [["카드", ["card", "cards"]]], hint: ["Do you take ~?", "Do you take…", "Do you take cards?"], model: "Do you take cards?" }
      ],
      overhear: [
        ["guest", "How do I keep these roses fresh?"],
        ["them", "Cut the stems and change the water every day.", [["Cut the stems", "줄기를 잘라 주세요", "꽃을 오래 두는 방법에 나와요."]]],
        ["guest", "How long will they last?"],
        ["them", "About a week, if you take good care of them.", [["take good care of", "잘 돌보다", "식물·물건·사람에 두루 써요."]]]
      ] }],
    ["13:00", "축제 푸드트럭", "foodtruck", {
      who: "Carlos", whoKo: "푸드트럭 사장님", voices: { them: "m2", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey! I'm at the festival today too. What'll it be?", want: "추천 메뉴가 뭔지 묻기", need: [["추천", ["recommend", "recommendation"]]], hint: ["What do you ~?", "What do you recommend…", "What do you recommend?"], model: "What do you recommend?" },
        { say: "The spring special: shrimp tacos with mango salsa.", want: "새우 알레르기가 있어서 닭고기로 바꿀 수 있는지 묻기", need: [["알레르기", ["allergic"]], ["대신", ["instead"]]], hint: ["I'm ~ to shrimp. Can I get chicken instead?", "I'm allergic to shrimp…", "I'm allergic to shrimp. Can I get chicken instead?"], model: "I'm allergic to shrimp. Can I get chicken instead?" },
        { say: "No problem! Mild or spicy sauce?", want: "순한 걸로, 매운 건 못 먹는다고 하기", need: [["순한", ["mild"]]], hint: ["~, please. I can't handle spicy.", "Mild, please…", "Mild, please. I can't handle spicy."], model: "Mild, please. I can't handle spicy.", chunk: ["can't handle", "감당 못 해요", "매운 음식이나 힘든 일을 못 견딜 때 써요."] },
        { say: "Sure. Want a drink? We have fresh lemonade.", want: "큰 레모네이드 하나 달라고 하기", need: [["레모네이드", ["lemonade"]]], hint: ["A large ~, please.", "A large lemonade…", "A large lemonade, please."], model: "A large lemonade, please." },
        { say: "Coming up! Twelve even. Enjoy the festival!", want: "고맙다고, 오늘 정말 붐빈다고 하기", need: [["붐빔", ["crowded", "packed", "busy"]]], hint: ["Thanks! It's so ~ today.", "Thanks! It's so…", "Thanks! It's so crowded today."], model: "Thanks! It's so crowded today." }
      ],
      overhear: [
        ["guest", "Is there a vegetarian option?", [["vegetarian option", "채식 메뉴", "식당에서 메뉴를 물을 때 써요."]]],
        ["them", "Yes, the veggie tacos are great."],
        ["guest", "Perfect. Two of those, please."],
        ["them", "Coming right up!", [["Coming right up", "금방 나와요", "음식을 내줄 때 짧게 말해요."]]]
      ] }],
    ["17:00", "엽서 사기", "souvenir", {
      who: "Hannah", whoKo: "기념품 가게 점원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi there! Take your time. Let me know if you need help.", want: "엽서가 있는지, 엄마께 보내고 싶다고 하기", need: [["엽서", ["postcard", "postcards"]]], hint: ["Do you have ~? I want to send one to my mom.", "Do you have postcards…", "Do you have postcards? I want to send one to my mom."], model: "Do you have postcards? I want to send one to my mom." },
        { say: "Right here. These are from the flower festival.", want: "벚꽃 그림으로 세 장 사겠다고 하기", need: [["벚꽃", ["cherry blossom", "cherry blossoms", "blossoms"]]], hint: ["I'll take three with ~.", "I'll take three…", "I'll take three with cherry blossoms."], model: "I'll take three with cherry blossoms." },
        { say: "Great choice. Do you need stamps? We sell those too.", want: "해외로 보내는 우표가 있는지 묻기", need: [["해외", ["international", "overseas", "abroad"]]], hint: ["Do you have stamps for ~ mail?", "Do you have stamps for international…", "Do you have stamps for international mail?"], model: "Do you have stamps for international mail?" },
        { say: "Yes. It's two dollars each to send overseas.", want: "알겠다고, 전부 얼마인지 묻기", need: [["전부", ["total", "altogether", "in all"]]], hint: ["Okay. What's the ~?", "Okay. What's the total…", "Okay. What's the total?"], model: "Okay. What's the total?", chunk: ["What's the total", "전부 얼마예요", "합계를 물을 때 써요."] },
        { say: "Eighteen even. Do you want a bag?", want: "괜찮다고, 가방에 넣겠다고 하기", need: [["괜찮", ["no thanks", "no thank you", "i'm good", "i'm okay"]]], hint: ["No, ~. I'll put them in my bag.", "No, thanks…", "No, thanks. I'll put them in my bag."], model: "No, thanks. I'll put them in my bag." }
      ],
      overhear: [
        ["guest", "Do you ship things overseas?"],
        ["them", "We do. It takes about a week."],
        ["guest", "Could you gift wrap this?", [["gift wrap", "선물 포장하다", "선물용으로 싸 달라고 할 때 써요."]]],
        ["them", "Sure. That's two dollars extra."]
      ] }]
  ]],
  ["피크닉", [
    ["09:00", "Yuki를 피크닉에 초대", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "반 친구",
      turns: [
        { say: "Good morning! You look happy today.", want: "오늘 오후에 피크닉 간다고 하기", need: [["피크닉", ["picnic"]]], hint: ["I'm going on a ~ this afternoon!", "I'm going on a picnic…", "I'm going on a picnic this afternoon!"], model: "I'm going on a picnic this afternoon!" },
        { say: "Oh, that sounds fun! Who's going?", want: "Sara랑 나뿐이라고, 같이 갈 건지 묻기", need: [["같이", ["join", "come with", "come along"]]], hint: ["Just Sara and me. Do you want to ~ us?", "Just Sara and me. Do you want to join…", "Just Sara and me. Do you want to join us?"], model: "Just Sara and me. Do you want to join us?" },
        { say: "I'd love to! What should I bring?", want: "마실 것을 좀 가져다줄 수 있는지 묻기", need: [["마실 것", ["drinks", "drink"]]], hint: ["Could you bring some ~?", "Could you bring some drinks…", "Could you bring some drinks?"], model: "Could you bring some drinks?" },
        { say: "Sure. Should I bring a blanket too?", want: "필요 없다고, Sara가 담요를 가져온다고 하기", need: [["담요", ["blanket"]]], hint: ["No need. Sara is bringing a ~.", "No need. Sara is…", "No need. Sara is bringing a blanket."], model: "No need. Sara is bringing a blanket.", chunk: ["No need", "그럴 필요 없어요", "친절하게 사양할 때 써요."] },
        { say: "Perfect. Where should we meet?", want: "호수 옆에서 만나자고 하기", need: [["호수", ["lake", "pond"]]], hint: ["Let's meet by the ~.", "Let's meet…", "Let's meet by the lake."], model: "Let's meet by the lake." }
      ],
      overhear: [
        ["guest", "Yuki, are you free this weekend?"],
        ["them", "Maybe. What's up?", [["What's up", "무슨 일이에요?", "가볍게 용건을 물을 때 써요."]]],
        ["guest", "We're going hiking on Sunday."],
        ["them", "Oh, I'd love to, but I already have plans.", [["already have plans", "선약이 있어요", "초대를 거절할 때 써요."]]]
      ] }],
    ["10:30", "피크닉 과일 사기", "market", {
      who: "Joe", whoKo: "과일 가게 주인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Morning! What are we picking up today?", want: "피크닉에 가져갈 과일이 필요하다고 하기", need: [["과일", ["fruit"]]], hint: ["I need some ~ for a picnic.", "I need some fruit…", "I need some fruit for a picnic."], model: "I need some fruit for a picnic." },
        { say: "Strawberries are in season. Sweet as candy!", want: "한 상자에 얼마인지 묻기", need: [["얼마", ["how much"]]], hint: ["Great! ~ for a box?", "Great! How much…", "Great! How much for a box?"], model: "Great! How much for a box?", chunk: ["in season", "제철인", "과일·채소가 한창 나는 때예요."] },
        { say: "Four dollars a box, or three for ten.", want: "그럼 두 상자 사겠다고 하기", need: [["두 상자", ["two boxes"]]], hint: ["Then I'll get two ~.", "Then I'll get two…", "Then I'll get two boxes."], model: "Then I'll get two boxes." },
        { say: "Anything else? Grapes? Peaches?", want: "복숭아는 벌써 익었는지 묻기", need: [["익은", ["ripe"]]], hint: ["Are the peaches ~ yet?", "Are the peaches…", "Are the peaches ripe yet?"], model: "Are the peaches ripe yet?", chunk: ["ripe", "잘 익은", "과일이 먹기 좋게 익었을 때 써요."] },
        { say: "Not yet, give them a week. Here, take these grapes, on me.", want: "너무 친절하다며 고맙다고 하기", need: [["고마움", ["thank", "thanks", "appreciate"]]], hint: ["You're too kind, Joe! ~ you.", "You're too kind, Joe! Thank…", "You're too kind, Joe! Thank you."], model: "You're too kind, Joe! Thank you.", chunk: ["on me", "제가 살게요", "값을 내가 낸다는 뜻이에요."] }
      ],
      overhear: [
        ["guest", "Do you have any ripe avocados?"],
        ["them", "These two are ready to eat today.", [["ready to eat", "먹을 수 있게 익은", "과일이 딱 먹기 좋을 때 써요."]]],
        ["guest", "How can I tell?"],
        ["them", "Press gently. If it gives a little, it's good.", [["gives a little", "살짝 들어가요", "눌렀을 때 부드럽다는 뜻이에요."]]]
      ] }],
    ["12:30", "잔디밭에서 피크닉", "picnic", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "f" }, guestKo: "늦게 온 친구",
      turns: [
        { say: "There you are! I saved the best spot under the tree.", want: "자리가 정말 좋다고 감탄하기", need: [["자리", ["spot", "place"]]], hint: ["Wow, what a great ~!", "Wow, what a great…", "Wow, what a great spot!"], model: "Wow, what a great spot!" },
        { say: "Let's eat! I made sandwiches. Ham or egg?", want: "달걀로, 그리고 딸기를 가져왔다고 하기", need: [["달걀", ["egg"]], ["딸기", ["strawberries"]]], hint: ["~, please. And I brought strawberries.", "Egg, please…", "Egg, please. And I brought strawberries."], model: "Egg, please. And I brought strawberries." },
        { say: "Yum! Did you bring anything to drink?", want: "Yuki가 곧 마실 것을 가져올 거라고 하기", need: [["곧", ["soon"]], ["마실 것", ["drinks", "drink"]]], hint: ["Yuki is bringing ~. She'll be here soon.", "Yuki is bringing drinks…", "Yuki is bringing drinks. She'll be here soon."], model: "Yuki is bringing drinks. She'll be here soon." },
        { say: "Great. This is so relaxing. I wish we could do this every weekend.", want: "나도 그렇다고, 매주 하자고 하기", need: [["매주", ["every weekend", "every week", "every saturday"]]], hint: ["Me too! Let's do it ~.", "Me too! Let's do it every…", "Me too! Let's do it every weekend."], model: "Me too! Let's do it every weekend." },
        { say: "Deal! Oh no, ants. Let's move the food.", want: "먼저 음식에 뚜껑을 덮자고 하기", need: [["덮다", ["cover", "lid", "lids"]]], hint: ["Let's ~ the food first.", "Let's cover…", "Let's cover the food first."], model: "Let's cover the food first.", chunk: ["Deal", "좋아요, 그렇게 해요", "제안에 흔쾌히 동의할 때 써요."] }
      ],
      overhear: [
        ["guest", "Sorry I'm late! The bus was full."],
        ["them", "No worries. Sit down, sit down.", [["No worries", "괜찮아요", "사과를 가볍게 받아 줄 때 써요."]]],
        ["guest", "Where do you want these drinks?"],
        ["them", "Just put them in the shade.", [["in the shade", "그늘에", "햇빛을 피할 때 써요."]]]
      ] }]
  ]],
  ["길거리 공연", [
    ["12:00", "광장 거리 악사", "busker", {
      who: "Eli", whoKo: "거리 악사", voices: { them: "m2", guest: "f" }, guestKo: "구경하던 사람",
      turns: [
        { say: "Hey! Thanks for stopping. Do you like music?", want: "네, 연주가 정말 좋다고 하기", need: [["연주", ["playing", "music"]]], hint: ["I do! Your ~ is really good.", "I do! Your playing…", "I do! Your playing is really good."], model: "I do! Your playing is really good." },
        { say: "Thanks! This one's an original song.", want: "직접 쓴 거냐고 묻기", need: [["직접", ["yourself", "wrote"]]], hint: ["Did you write it ~?", "Did you write it…", "Did you write it yourself?"], model: "Did you write it yourself?" },
        { say: "Yep. I write one every week. What kind of music do you like?", want: "재즈나 어쿠스틱이 좋다고 하기", need: [["재즈", ["jazz", "acoustic"]]], hint: ["I like ~ and acoustic music.", "I like jazz…", "I like jazz and acoustic music."], model: "I like jazz and acoustic music." },
        { say: "Nice! Want to request a song?", want: "비틀스 노래 하나 연주해 줄 수 있는지 묻기", need: [["연주", ["play"]]], hint: ["Could you ~ a Beatles song?", "Could you play…", "Could you play a Beatles song?"], model: "Could you play a Beatles song?" },
        { say: "Sure thing. Here goes!", want: "(연주가 끝난 뒤) 즐거웠다며 팁을 건네기", need: [["즐거웠", ["enjoyed", "loved"]]], hint: ["I really ~ that. Here's a little tip.", "I really enjoyed…", "I really enjoyed that. Here's a little tip."], model: "I really enjoyed that. Here's a little tip.", chunk: ["Here goes", "자, 시작합니다", "무언가 시작하기 직전에 해요."] }
      ],
      overhear: [
        ["guest", "Excuse me, do you take requests?"],
        ["them", "Sure, what's your favorite?"],
        ["guest", "Anything by Taylor Swift?"],
        ["them", "Let me try. Bear with me.", [["Bear with me", "잠깐만 기다려 주세요", "준비하는 동안 참아 달라고 할 때 써요."]]]
      ] }],
    ["15:00", "길 잃은 여행자 돕기", "helpway", {
      who: "Ben", whoKo: "길 잃은 여행자", voices: { them: "m", guest: "f" }, guestKo: "여행 동행",
      turns: [
        { say: "Excuse me! Do you speak English? I'm a little lost.", want: "물론이라고, 어디 가는지 묻기", need: [["어디", ["where"]]], hint: ["Sure! ~ are you trying to go?", "Sure! Where are you…", "Sure! Where are you trying to go?"], model: "Sure! Where are you trying to go?" },
        { say: "The art museum. Is it far from here?", want: "걸어서 10분쯤이라고 하기", need: [["걸어서", ["on foot", "walk", "walking"]], ["10분", ["ten minutes", "10 minutes"]]], hint: ["It's about ten minutes ~.", "It's about ten minutes…", "It's about ten minutes on foot."], model: "It's about ten minutes on foot." },
        { say: "Great. Which way do I go?", want: "곧장 가다가 두 번째 신호등에서 왼쪽으로 돌라고 하기", need: [["왼쪽", ["left"]], ["신호등", ["light", "lights"]]], hint: ["Go straight and turn ~ at the second light.", "Go straight and turn left…", "Go straight and turn left at the second light."], model: "Go straight and turn left at the second light.", chunk: ["turn left at", "~에서 왼쪽으로 돌다", "길을 알려 줄 때 가장 많이 써요."] },
        { say: "Got it. Is there a bakery near there? I'm starving.", want: "광장 옆에 괜찮은 빵집이 있다고 하기", need: [["빵집", ["bakery"]], ["옆", ["next to", "beside", "near", "by"]]], hint: ["Yes, there's a good ~ next to the square.", "Yes, there's a good bakery…", "Yes, there's a good bakery next to the square."], model: "Yes, there's a good bakery next to the square." },
        { say: "Perfect, thank you so much!", want: "천만에요, 즐겁게 보내라고 하기", need: [["즐겁게", ["enjoy", "have fun", "have a good", "have a great"]]], hint: ["No problem! ~ the museum.", "No problem! Enjoy…", "No problem! Enjoy the museum."], model: "No problem! Enjoy the museum." }
      ],
      overhear: [
        ["them", "Honey, I think we're lost again."],
        ["guest", "We're not lost. We're just exploring.", [["just exploring", "그냥 둘러보는 거예요", "길을 잃어도 여유롭게 말할 때 써요."]]],
        ["them", "Exploring without a map is called lost."],
        ["guest", "Fine. Let's ask someone."]
      ] }],
    ["18:30", "공연 보고 저녁 식사", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Good evening! Table for two?", want: "혼자인데 창가 자리가 되는지 묻기", need: [["창가", ["window"]]], hint: ["Just one, please. Can I sit by the ~?", "Just one, please. Can I sit by…", "Just one, please. Can I sit by the window?"], model: "Just one, please. Can I sit by the window?" },
        { say: "Of course. Can I start you off with something to drink?", want: "일단은 물만 달라고 하기", need: [["물", ["water"]]], hint: ["Just ~ for now, please.", "Just water…", "Just water for now, please."], model: "Just water for now, please.", chunk: ["for now", "일단은", "나중에 더 시킬 수도 있을 때 써요."] },
        { say: "Are you ready to order, or do you need a few more minutes?", want: "시간이 더 필요하다며 파스타에 뭐가 들었는지 묻기", need: [["파스타", ["pasta"]]], hint: ["I need a minute. What's in today's ~?", "I need a minute. What's in today's…", "I need a minute. What's in today's pasta?"], model: "I need a minute. What's in today's pasta?" },
        { say: "Mushrooms, spinach, and a garlic cream sauce. It's our best seller.", want: "그걸로 하되 마늘은 빼 달라고 하기", need: [["빼고", ["without", "hold the garlic", "leave out"]]], hint: ["I'll have that, but ~ garlic, please.", "I'll have that, but without…", "I'll have that, but without garlic, please."], model: "I'll have that, but without garlic, please." },
        { say: "No problem. Anything else?", want: "아니, 그게 다라고 하기", need: [["그게 다", ["that's all", "that's it", "that's everything"]]], hint: ["No, ~. Thank you.", "No, that's…", "No, that's all. Thank you."], model: "No, that's all. Thank you." }
      ],
      overhear: [
        ["guest", "Excuse me, is the soup vegetarian?"],
        ["them", "It is. It's made with vegetable broth.", [["made with", "~로 만든", "재료를 말할 때 써요."]]],
        ["guest", "Great. I'll start with that."],
        ["them", "And for your main?", [["for your main", "메인 요리는요?", "main은 주요리예요."]]]
      ] }]
  ]],
  ["사진 찍어 주기", [
    ["11:00", "관광객 사진 찍어 주기", "snap", {
      who: "Lily", whoKo: "관광객", voices: { them: "f2", guest: "m" }, guestKo: "동행",
      turns: [
        { say: "Excuse me! Could you take a picture of me, please?", want: "물론이라고, 어디에 서고 싶은지 묻기", need: [["어디", ["where"]]], hint: ["Sure! ~ would you like to stand?", "Sure! Where would…", "Sure! Where would you like to stand?"], model: "Sure! Where would you like to stand?" },
        { say: "In front of the flowers! Can you get the whole flower bed in?", want: "세로로 찍을지 가로로 찍을지 묻기", need: [["세로", ["portrait", "vertical"]], ["가로", ["landscape", "horizontal"]]], hint: ["Do you want ~ or landscape?", "Do you want portrait…", "Do you want portrait or landscape?"], model: "Do you want portrait or landscape?" },
        { say: "Portrait, please. Can you get all the flowers in?", want: "조금 뒤로 물러서야 한다고 하기", need: [["뒤로", ["back", "backwards"]]], hint: ["I need to step ~ a bit.", "I need to step back…", "I need to step back a bit."], model: "I need to step back a bit." },
        { say: "Okay! Ready when you are.", want: "하나, 둘, 셋 세기", need: [["셋", ["three"]]], hint: ["Okay! One, two, ~!", "Okay! One, two…", "Okay! One, two, three!"], model: "Okay! One, two, three!" },
        { say: "Thank you! Could you take one more, just in case?", want: "물론이라고, 이번엔 웃어 보라고 하기", need: [["웃", ["smile"]]], hint: ["Of course! ~ this time.", "Of course! Smile…", "Of course! Smile this time."], model: "Of course! Smile this time.", chunk: ["just in case", "혹시 모르니까", "만약을 위해 하나 더 할 때 써요."] }
      ],
      overhear: [
        ["them", "Wow, this one is blurry.", [["blurry", "흐릿한", "사진이 흔들렸을 때 써요."]]],
        ["guest", "Let me see. Try again with the flash off."],
        ["them", "Okay, hold still!", [["hold still", "가만히 있어요", "사진 찍을 때 자주 해요."]]],
        ["guest", "I'm not moving!"]
      ] }],
    ["14:00", "전망대에서 단체 사진", "photo", {
      who: "Nate", whoKo: "전망대 행인", voices: { them: "m", guest: "f" }, guestKo: "다른 관광객",
      turns: [
        { say: "Hey, nice view, huh? Want me to take a photo of you guys?", want: "고맙다며 셋이 다 나오게 부탁하기", need: [["셋이", ["three of us", "all of us"]]], hint: ["Thanks! Can you get all ~ of us?", "Thanks! Can you get all three…", "Thanks! Can you get all three of us?"], model: "Thanks! Can you get all three of us?" },
        { say: "No problem. Give me your phone.", want: "카메라가 켜져 있으니 버튼만 누르면 된다고 하기", need: [["버튼", ["button"]], ["누르다", ["tap", "press", "push"]]], hint: ["The camera is open. Just ~ the button.", "The camera is open. Just tap…", "The camera is open. Just tap the button."], model: "The camera is open. Just tap the button." },
        { say: "Got it. Everyone squeeze in a little!", want: "친구들에게 더 가까이 붙자고 하기", need: [["가까이", ["closer", "squeeze"]]], hint: ["Come on, let's get ~ together.", "Come on, let's get closer…", "Come on, let's get closer together."], model: "Come on, let's get closer together.", chunk: ["squeeze in", "비집고 들어가다", "사진에 다 나오게 붙어 설 때 써요."] },
        { say: "Hmm, the sun's behind you, so your faces are dark. Could you move over there?", want: "알겠다고, 저쪽으로 옮기겠다고 하기", need: [["옮기다", ["move"]]], hint: ["Sure, we'll ~ over there.", "Sure, we'll move…", "Sure, we'll move over there."], model: "Sure, we'll move over there." },
        { say: "That's better! Check these out. Do you like them?", want: "완벽하다고, 정말 고맙다고 하기", need: [["완벽", ["perfect", "great", "amazing"]]], hint: ["They're ~. Thank you so much!", "They're perfect…", "They're perfect. Thank you so much!"], model: "They're perfect. Thank you so much!" }
      ],
      overhear: [
        ["guest", "Hi, could you take our picture?"],
        ["them", "Sure thing! Say cheese!", [["Say cheese", "치즈 하세요", "사진 찍을 때 웃으라는 말이에요."]]],
        ["guest", "Could you take a vertical one too?"],
        ["them", "Done. Take a look."]
      ] }],
    ["17:00", "카페에서 사진 자랑", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, you look sunburned. Been outside all day?", want: "네, 하루 종일 사진을 찍었다고 하기", need: [["사진", ["photos", "pictures"]]], hint: ["Yes, I've been taking ~ all day.", "Yes, I've been taking photos…", "Yes, I've been taking photos all day."], model: "Yes, I've been taking photos all day." },
        { say: "Cool! Can I see some?", want: "그럼요, 이게 제일 마음에 든다고 하기", need: [["제일", ["favorite", "best"]]], hint: ["Sure! This one is my ~.", "Sure! This one is…", "Sure! This one is my favorite."], model: "Sure! This one is my favorite." },
        { say: "Wow, that's a great shot. Did you edit it?", want: "아니, 필터만 살짝 썼다고 하기", need: [["필터", ["filter"]]], hint: ["No, just a little ~.", "No, just a little…", "No, just a little filter."], model: "No, just a little filter." },
        { say: "You should print that one. It'd look great on a wall.", want: "좋은 생각이라며 근처에 인쇄할 곳이 있는지 묻기", need: [["인쇄", ["print"]]], hint: ["Good idea. Is there a place to ~ it nearby?", "Good idea. Is there a place to print…", "Good idea. Is there a place to print it nearby?"], model: "Good idea. Is there a place to print it nearby?" },
        { say: "Yeah, the shop on Fifth Street does it in an hour.", want: "고맙다며 내일 가 보겠다고 하기", need: [["내일", ["tomorrow"]]], hint: ["Thanks, I'll check it out ~.", "Thanks, I'll check it out…", "Thanks, I'll check it out tomorrow."], model: "Thanks, I'll check it out tomorrow.", chunk: ["check it out", "가 보다, 확인해 보다", "장소·물건을 살펴볼 때 두루 써요."] }
      ],
      overhear: [
        ["guest", "Can I get a cappuccino and a muffin?"],
        ["them", "Sure. Blueberry or chocolate?"],
        ["guest", "Blueberry, please."],
        ["them", "That'll be six fifty.", [["That'll be", "~입니다 (금액)", "총 금액을 말할 때 써요."]]]
      ] }]
  ]],
  ["주말 계획", [
    ["09:30", "헬스장에서 주말 이야기", "gym", {
      who: "Tyler", whoKo: "헬스장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 회원",
      turns: [
        { say: "Hey! Almost the weekend. Any plans?", want: "토요일에 친구들과 등산 간다고 하기", need: [["등산", ["hiking", "hike"]]], hint: ["I'm going ~ with friends on Saturday.", "I'm going hiking…", "I'm going hiking with friends on Saturday."], model: "I'm going hiking with friends on Saturday." },
        { say: "Nice! Where to?", want: "아직 모르겠고 날씨에 달렸다고 하기", need: [["달렸", ["depends"]], ["날씨", ["weather"]]], hint: ["Not sure yet. It ~ on the weather.", "Not sure yet. It depends…", "Not sure yet. It depends on the weather."], model: "Not sure yet. It depends on the weather.", chunk: ["It depends on", "~에 달려 있어요", "확실하지 않을 때 써요."] },
        { say: "Smart. You should stretch before a hike. Want a quick routine?", want: "좋다고, 다리 스트레칭을 알려 달라고 하기", need: [["다리", ["leg", "legs"]]], hint: ["Yes, please. Show me some ~ stretches.", "Yes, please. Show me some leg…", "Yes, please. Show me some leg stretches."], model: "Yes, please. Show me some leg stretches." },
        { say: "Sure. Do these three, twenty seconds each.", want: "20초씩 하는 거 맞냐고 확인하기", need: [["20초", ["twenty seconds", "20 seconds"]]], hint: ["So ~ each, right?", "So twenty seconds…", "So twenty seconds each, right?"], model: "So twenty seconds each, right?" },
        { say: "Exactly. And drink lots of water.", want: "그러겠다며 알려 줘서 고맙다고 하기", need: [["고마움", ["thank", "thanks", "appreciate"]]], hint: ["Will do. ~ for the tip!", "Will do. Thanks…", "Will do. Thanks for the tip!"], model: "Will do. Thanks for the tip!", chunk: ["Will do", "그렇게 할게요", "조언·부탁을 받아들일 때 짧게 써요."] }
      ],
      overhear: [
        ["them", "Don't forget to wipe down the bench.", [["wipe down", "닦다", "쓰고 난 기구를 닦을 때 써요."]]],
        ["guest", "Oh, sorry! I'll do it now."],
        ["them", "Thanks! Enjoy your weekend."],
        ["guest", "You too!"]
      ] }],
    ["12:00", "토요일 쉬어도 되는지 묻기", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "f2" }, guestKo: "동료",
      turns: [
        { say: "Hi! Did you want to talk to me about something?", want: "이번 토요일에 쉴 수 있는지 묻기", need: [["쉬는 날", ["off", "day off"]]], hint: ["Could I have this Saturday ~?", "Could I have this Saturday…", "Could I have this Saturday off?"], model: "Could I have this Saturday off?" },
        { say: "Hmm. Saturdays are busy. Is something going on?", want: "친구들과 여행이 잡혀 있다고 하기", need: [["여행", ["trip"]]], hint: ["I have a ~ planned with some friends.", "I have a trip…", "I have a trip planned with some friends."], model: "I have a trip planned with some friends." },
        { say: "That sounds fun. Could you work Sunday instead?", want: "일요일은 괜찮지만 오후만 가능하다고 하기", need: [["오후", ["afternoon"]]], hint: ["Sunday is fine, but only in the ~.", "Sunday is fine, but only…", "Sunday is fine, but only in the afternoon."], model: "Sunday is fine, but only in the afternoon." },
        { say: "That works. Can you close the shop on Sunday?", want: "물론이라고, 문 닫는 법을 알려 달라고 하기", need: [["닫다", ["close"]]], hint: ["Sure. Could you show me how to ~ up?", "Sure. Could you show me how to close…", "Sure. Could you show me how to close up?"], model: "Sure. Could you show me how to close up?" },
        { say: "Of course. I'll put you down for Sunday, two to eight.", want: "배려해 줘서 고맙다고 하기", need: [["고마움", ["thank", "thanks", "appreciate"]]], hint: ["I really ~ it, Olivia.", "I really appreciate…", "I really appreciate it, Olivia."], model: "I really appreciate it, Olivia.", chunk: ["put you down for", "~에 이름을 적다", "근무표나 예약에 넣는다는 뜻이에요."] }
      ],
      overhear: [
        ["guest", "Olivia, we're out of the new novel.", [["we're out of", "~가 다 떨어졌어요", "재고가 없을 때 써요."]]],
        ["them", "I'll order more today."],
        ["guest", "Customers keep asking for it."],
        ["them", "It's been popular all month."]
      ] }],
    ["16:00", "Sara와 주말 계획", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "So, what are we doing this weekend?", want: "토요일 아침에 벼룩시장 어떠냐고 하기", need: [["벼룩시장", ["flea market"]]], hint: ["How about the ~ on Saturday morning?", "How about the flea market…", "How about the flea market on Saturday morning?"], model: "How about the flea market on Saturday morning?", chunk: ["flea market", "벼룩시장", "중고 물건을 사고파는 야외 시장이에요."] },
        { say: "Fun! What time? I'm not a morning person.", want: "9시 어떠냐며 그 뒤엔 붐빈다고 하기", need: [["붐빔", ["crowded", "busy"]]], hint: ["How about nine? It gets ~ after that.", "How about nine? It gets crowded…", "How about nine? It gets crowded after that."], model: "How about nine? It gets crowded after that.", chunk: ["morning person", "아침형 인간", "일찍 일어나는 걸 잘하는 사람이에요."] },
        { say: "Okay, I'll set an alarm. And Sunday?", want: "일요일 오후엔 일하지만 오전은 비어 있다고 하기", need: [["일하다", ["work"]]], hint: ["I have to ~ in the afternoon, but I'm free in the morning.", "I have to work…", "I have to work in the afternoon, but I'm free in the morning."], model: "I have to work in the afternoon, but I'm free in the morning." },
        { say: "Then let's have brunch! There's a new place downtown.", want: "좋다고, 예약할까 묻기", need: [["예약", ["reservation", "reserve", "book"]]], hint: ["Sounds great. Should I make a ~?", "Sounds great. Should I make a reservation…", "Sounds great. Should I make a reservation?"], model: "Sounds great. Should I make a reservation?" },
        { say: "Yes, please! Eleven? I can't wait for this weekend.", want: "나도 정말 기대된다고 하기", need: [["기대", ["looking forward", "can't wait", "excited"]]], hint: ["Me too. I'm really ~ to it.", "Me too. I'm really looking…", "Me too. I'm really looking forward to it."], model: "Me too. I'm really looking forward to it.", chunk: ["look forward to", "~을 기대하다", "to 뒤에 명사나 -ing가 와요."] }
      ],
      overhear: [
        ["guest", "Sara, are you coming on Saturday?"],
        ["them", "Yes, I wouldn't miss it.", [["wouldn't miss it", "놓칠 수 없죠", "꼭 가겠다는 강한 말이에요."]]],
        ["guest", "Great. Bring some snacks!"],
        ["them", "I'm on it.", [["I'm on it", "제가 할게요", "맡은 일을 바로 하겠다는 말이에요."]]]
      ] }]
  ]]
]);
