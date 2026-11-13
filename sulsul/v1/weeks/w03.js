// 3주째 · 이사하는 주 (15~21일째). 호텔을 나와 새 집으로 들어가고, 이웃과 인사하고, 집들이를 한다.
// 장면 = [시간, 이름, 그림 id, 대본]. 형식은 ~/sulsul-art/YEAR.md
WEEK(3, [
  ["이삿날", [
    ["09:00", "호텔 체크아웃", "hotel", {
      who: "Emma", whoKo: "호텔 직원", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Good morning! Are you checking out today?", want: "네, 오늘 새 집으로 이사한다고 하기", need: [["이사", ["moving", "move"]]], hint: ["Yes, I'm ~ into my new place today.","Yes, I'm moving…","Yes, I'm moving into my new place today."], model: "Yes, I'm moving into my new place today." },
        { say: "Congratulations! Did you have anything from the minibar?", want: "아니, 아무것도 안 먹었다고 하기", need: [["안 씀", ["didn't", "did not", "nothing"]]], hint: ["No, I ~ have anything.","No, I…","No, I didn't have anything."], model: "No, I didn't have anything." },
        { say: "Great. Here's your bill. Would you like a receipt by email?", want: "네, 이메일로 보내 달라고 하기", need: [["이메일", ["email"]]], hint: ["Yes, please send it to my ~.","Yes, please…","Yes, please send it to my email."], model: "Yes, please send it to my email." },
        { say: "Do you need help with your luggage?", want: "가방을 한 시간만 로비에 맡겨도 되는지 묻기", need: [["맡기", ["leave", "keep", "store"]], ["가방", ["bag", "bags", "luggage", "suitcase", "suitcases"]]], hint: ["Can I ~ my bags here for an hour?","Can I leave…","Can I leave my bags here for an hour?"], model: "Can I leave my bags here for an hour?", chunk: ["leave my bags","가방을 맡기다","잠깐 두고 갈 때 써요."] },
        { say: "Of course. We'll keep them behind the desk.", want: "고맙다고, 2주 동안 잘 지냈다고 하기", need: [["잘 지냄", ["great stay", "enjoyed", "wonderful", "nice stay", "great time", "good stay"]]], hint: ["Thank you for everything. I had a ~.","Thank you for…","Thank you for everything. I had a great stay."], model: "Thank you for everything. I had a great stay." }
      ],
      overhear: [
        ["guest", "Excuse me, is breakfast still open?"],
        ["them", "Until ten thirty. It's on the second floor.", [["Until ten thirty","10시 반까지","끝나는 시간은 until을 써요."]]],
        ["guest", "Perfect. Is it free for guests?"],
        ["them", "Yes, it's included with your room."]
      ] }],
    ["11:00", "상자 나르기", "newhome", {
      who: "Sara", whoKo: "도와주러 온 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Hey, you made it! Where do you want this box?", want: "창가에 놓아 달라고 하기", need: [["창가", ["window"]]], hint: ["Can you put it by the ~?","Can you…","Can you put it by the window?"], model: "Can you put it by the window?" },
        { say: "Sure. Is it heavy? It says 'books'.", want: "응, 책이 가득하니 조심하라고 하기", need: [["조심", ["careful", "carefully"]]], hint: ["Yes, it's full of books, so be ~.","Yes, it's full…","Yes, it's full of books, so be careful."], model: "Yes, it's full of books, so be careful." },
        { say: "Got it. Do you want me to start on the kitchen stuff?", want: "응, 접시는 싱크대 옆 선반에 넣어 달라고 하기", need: [["선반", ["shelf", "shelves", "cabinet", "cupboard"]]], hint: ["Yes, please put the dishes on the ~ next to the sink.","Yes, please put the…","Yes, please put the dishes on the shelf next to the sink."], model: "Yes, please put the dishes on the shelf next to the sink.", chunk: ["next to","~ 옆에","물건 위치를 말할 때 써요."] },
        { say: "Done! This place is so bright. I love it.", want: "네가 없었으면 못 했을 거라고 하기", need: [["도움", ["help", "helped", "helping"]]], hint: ["Thanks, I couldn't do this without your ~.","Thanks, I couldn't…","Thanks, I couldn't do this without your help."], model: "Thanks, I couldn't do this without your help.", chunk: ["couldn't do this without","~ 없이는 못 했어요","도움이 정말 컸을 때 써요."] },
        { say: "Anytime! Should we grab lunch? I'm starving.", want: "좋다고, 피자는 내가 사겠다고 하기", need: [["피자", ["pizza"]], ["내가 삼", ["my treat", "i'll buy", "i'll pay", "on me"]]], hint: ["Sure! ~ is my treat.","Sure! Pizza…","Sure! Pizza is my treat."], model: "Sure! Pizza is my treat.", chunk: ["my treat","내가 살게요","대접할 때 써요."] }
      ],
      overhear: [
        ["guest", "Where should the TV go?"],
        ["them", "Let's put it against that wall.", [["against that wall","저 벽에 붙여서","가구를 벽쪽에 둘 때 써요."]]],
        ["guest", "Okay. Do you have an extension cord?", [["extension cord","멀티탭","전기선을 길게 이어 주는 거예요."]]],
        ["them", "I think it's in this box."]
      ] }],
    ["15:00", "입주 상태 확인", "flat", {
      who: "Linda", whoKo: "부동산 중개인", voices: { them: "f2", guest: "m" }, guestKo: "다른 입주자",
      turns: [
        { say: "Hi! How's the move going? Ready for the walk-through?", want: "네, 집 상태를 같이 확인하자고 하기", need: [["확인", ["check", "look", "go through", "walk through"]]], hint: ["Yes, let's ~ the apartment together.","Yes, let's…","Yes, let's check the apartment together."], model: "Yes, let's check the apartment together.", chunk: ["walk-through","입주 전 집 상태 점검","집 상태를 함께 돌아보는 일이에요."] },
        { say: "Sure. Any problems?", want: "욕실 수도꼭지에서 물이 샌다고 하기", need: [["새다", ["leaking", "leaks", "leak", "dripping", "drips"]]], hint: ["The faucet in the bathroom is ~.","The faucet…","The faucet in the bathroom is leaking."], model: "The faucet in the bathroom is leaking.", chunk: ["faucet","수도꼭지","욕실·부엌 물 나오는 곳이에요."] },
        { say: "Oh, I'll let Mr. Patel know. Anything else?", want: "벽에 작은 흠집이 있다고, 사진 찍어도 되는지 묻기", need: [["사진", ["picture", "photo", "pictures", "photos"]]], hint: ["There's a small mark on the wall. Can I take a ~?","There's a small mark…","There's a small mark on the wall. Can I take a picture?"], model: "There's a small mark on the wall. Can I take a picture?" },
        { say: "Good idea. That protects your deposit.", want: "여분 열쇠가 있는지 묻기", need: [["여분", ["spare", "extra"]], ["열쇠", ["key", "keys"]]], hint: ["Is there a ~ key?","Is there…","Is there a spare key?"], model: "Is there a spare key?" },
        { say: "Yes, here you go. Welcome to your new home!", want: "고맙다고, 쓰레기는 어디에 버리는지 묻기", need: [["쓰레기", ["trash", "garbage", "rubbish"]], ["어디", ["where"]]], hint: ["Thanks, Linda! Where do I put the ~?","Thanks, Linda! Where…","Thanks, Linda! Where do I put the trash?"], model: "Thanks, Linda! Where do I put the trash?" }
      ],
      overhear: [
        ["guest", "Do I have to pay for the broken window?"],
        ["them", "Not if it was already broken. Let's write it down.", [["write it down","적어 두다","기록으로 남길 때 써요."]]],
        ["guest", "Can I get that in writing?", [["in writing","서면으로","말 말고 글로 받는다는 뜻이에요."]]],
        ["them", "Of course. I'll send you an email."]
      ] }]
  ]],
  ["가구 사기", [
    ["10:00", "침대와 책상 고르기", "furniture", {
      who: "Chris", whoKo: "가구 매장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Welcome! Looking for anything in particular?", want: "침대랑 책상이 필요하다고 하기", need: [["침대", ["bed"]], ["책상", ["desk"]]], hint: ["I need a ~ and a desk for my studio.","I need a bed…","I need a bed and a desk for my studio."], model: "I need a bed and a desk for my studio." },
        { say: "Great. This queen bed is our best seller. Want to try it?", want: "작은 싱글 사이즈가 있는지 묻기", need: [["싱글", ["twin", "single"]]], hint: ["Do you have a ~ size? My place is small.","Do you have a…","Do you have a twin size? My place is small."], model: "Do you have a twin size? My place is small." },
        { say: "Yes. The twin is four hundred, mattress included. And this desk is two-fifty.", want: "더 싼 건 없는지 묻기", need: [["싼", ["cheaper", "less expensive", "cheap"]]], hint: ["Is there anything ~?","Is there…","Is there anything cheaper?"], model: "Is there anything cheaper?" },
        { say: "This smaller desk is one-fifty. It comes in a box, so you have to put it together.", want: "집으로 배송해 줄 수 있는지 묻기", need: [["배송", ["deliver", "delivery", "ship"]]], hint: ["Can you ~ it to my apartment?","Can you…","Can you deliver it to my apartment?"], model: "Can you deliver it to my apartment?", chunk: ["put it together","조립하다","가구 조립에 써요."] },
        { say: "Yes, for twenty dollars. Is tomorrow morning okay?", want: "내일 좋다고, 카드로 내겠다고 하기", need: [["카드", ["card"]]], hint: ["Tomorrow works. I'll pay by ~.","Tomorrow works.…","Tomorrow works. I'll pay by card."], model: "Tomorrow works. I'll pay by card." }
      ],
      overhear: [
        ["guest", "I'd like to return this lamp. It doesn't work.", [["return","반품하다","산 물건을 돌려줄 때 써요."]]],
        ["them", "Do you have the receipt?"],
        ["guest", "Yes, here. Can I get a refund?", [["refund","환불","돈을 돌려받는 거예요."]]],
        ["them", "Sure, it'll go back on your card."]
      ] }],
    ["14:00", "중고 가구 물어보기", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey! Moving day was yesterday, right? How's the new place?", want: "좋은데 아직 상자투성이라고 하기", need: [["상자", ["boxes", "box"]]], hint: ["It's great, but it's still full of ~.","It's great, but…","It's great, but it's still full of boxes."], model: "It's great, but it's still full of boxes." },
        { say: "Ha, I remember that. The usual?", want: "응, 근데 이번엔 따뜻한 걸로 달라고 하기", need: [["따뜻", ["hot", "warm"]]], hint: ["Yes, but ~ this time, please.","Yes, but…","Yes, but hot this time, please."], model: "Yes, but hot this time, please." },
        { say: "No problem. Need anything for the apartment?", want: "싸게 중고 가구를 살 만한 곳을 아는지 묻기", need: [["중고", ["used", "second hand", "secondhand"]]], hint: ["Do you know where I can buy ~ furniture cheap?","Do you know where…","Do you know where I can buy used furniture cheap?"], model: "Do you know where I can buy used furniture cheap?", chunk: ["second-hand","중고의","중고 물건에 써요."] },
        { say: "Yes! There's a flea market on Sundays, and online groups, too.", want: "그 온라인 모임 이름을 알려 달라고 하기", need: [["이름", ["name"]]], hint: ["Could you tell me the ~ of the group?","Could you tell…","Could you tell me the name of the group?"], model: "Could you tell me the name of the group?" },
        { say: "Sure, I'll text you the link.", want: "고맙다고, 신세 졌다고 하기", need: [["신세", ["owe you", "owe"]]], hint: ["Thanks, Leo! I ~ one.","Thanks, Leo!…","Thanks, Leo! I owe you one."], model: "Thanks, Leo! I owe you one.", chunk: ["I owe you one","신세 졌어요","도움받고 가볍게 고마워할 때 써요."] }
      ],
      overhear: [
        ["guest", "Can I get a sandwich to go?", [["to go","포장해서","가져갈 때 써요."]]],
        ["them", "Sure. Ham or turkey?"],
        ["guest", "Turkey, please. No tomato."],
        ["them", "Coming right up.", [["Coming right up","금방 나와요","주문받고 바로 준비하겠다는 말이에요."]]]
      ] }],
    ["17:00", "책상 조립", "newhome", {
      who: "Sara", whoKo: "도와주는 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "The desk just got here! Where's the instruction sheet?", want: "상자 안에 있을 거라고 하기", need: [["안에", ["inside", "in the box"]]], hint: ["It should be ~ the box.","It should…","It should be inside the box."], model: "It should be inside the box." },
        { say: "Found it. Hmm, there are so many screws.", want: "나사부터 종류별로 나누자고 하기", need: [["나누", ["sort", "separate", "group"]]], hint: ["Let's ~ the screws first.","Let's sort…","Let's sort the screws first."], model: "Let's sort the screws first." },
        { say: "Good idea. Can you hand me the screwdriver?", want: "여기 있다고, 이게 맞는 크기인지 묻기", need: [["크기", ["size", "right one"]]], hint: ["Here. Is this the right ~?","Here. Is…","Here. Is this the right size?"], model: "Here. Is this the right size?" },
        { say: "Yes, perfect. Okay, now hold this side up.", want: "잡았다고, 삐뚤어진 것 같다고 하기", need: [["삐뚤", ["crooked", "tilted", "uneven", "wobbly"]]], hint: ["I've got it. I think it's ~.","I've got…","I've got it. I think it's crooked."], model: "I've got it. I think it's crooked.", chunk: ["crooked","삐뚤어진","똑바르지 않을 때 써요."] },
        { say: "You're right. Let me fix it… there! How does it look?", want: "완벽하다고, 이제 공부할 곳이 생겼다고 하기", need: [["완벽", ["perfect"]]], hint: ["It looks ~! Now I have a place to study.","It looks perfect! Now…","It looks perfect! Now I have a place to study."], model: "It looks perfect! Now I have a place to study." }
      ],
      overhear: [
        ["guest", "Do you need a hand with that?", [["need a hand","도움이 필요하다","손을 빌려 줄까 물을 때 써요."]]],
        ["them", "Yes, hold the other end."],
        ["guest", "Like this?"],
        ["them", "A little higher. Perfect."]
      ] }]
  ]],
  ["인터넷 설치", [
    ["10:00", "집 인터넷 신청", "phonestore", {
      who: "Zoe", whoKo: "휴대폰 가게 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Welcome back! How's the phone working?", want: "잘 된다고, 집 인터넷이 필요하다고 하기", need: [["인터넷", ["internet", "wifi", "wi fi"]]], hint: ["It's working great. Now I need ~ for my apartment.","It's working great. Now…","It's working great. Now I need internet for my apartment."], model: "It's working great. Now I need internet for my apartment." },
        { say: "We have a home plan. Fiber is a hundred megabits for thirty-five a month.", want: "계약 기간이 있는지 묻기", need: [["계약", ["contract", "commitment"]]], hint: ["Is there a ~, or can I cancel anytime?","Is there a…","Is there a contract, or can I cancel anytime?"], model: "Is there a contract, or can I cancel anytime?" },
        { say: "It's a twelve-month contract. If you cancel early, there's a fee.", want: "어차피 1년 있으니 괜찮다고 하기", need: [["1년", ["year", "twelve months", "12 months"]]], hint: ["That's fine. I'm staying for a ~ anyway.","That's fine. I'm…","That's fine. I'm staying for a year anyway."], model: "That's fine. I'm staying for a year anyway.", chunk: ["anyway","어차피","괜찮다고 할 때 끝에 붙여요."] },
        { say: "Great. Do you want to rent the router, or will you buy your own?", want: "빌리겠다고 하기", need: [["빌림", ["rent", "rental", "borrow"]]], hint: ["I'll ~ one, please.","I'll rent…","I'll rent one, please."], model: "I'll rent one, please." },
        { say: "Okay. A technician can come tomorrow between two and four.", want: "그때 집에 있겠다고 하기", need: [["집에 있", ["be home", "be there", "be at home", "home"]]], hint: ["That works. I'll ~ then.","That works.…","That works. I'll be home then."], model: "That works. I'll be home then.", chunk: ["between two and four","2시에서 4시 사이","방문 시간대를 말해요."] }
      ],
      overhear: [
        ["guest", "My data runs out so fast.", [["runs out","다 떨어지다","데이터·시간이 바닥날 때 써요."]]],
        ["them", "Do you watch a lot of video? You might need an unlimited plan."],
        ["guest", "Can I switch plans today?", [["switch plans","요금제를 바꾸다","다른 걸로 갈아탈 때 switch를 써요."]]],
        ["them", "Of course. There's no fee."]
      ] }],
    ["14:00", "공유기 설치", "installer", {
      who: "Ray", whoKo: "설치 기사", voices: { them: "m", guest: "f" }, guestKo: "전화 상담원",
      turns: [
        { say: "Hi, I'm Ray from the internet company. Where's the best spot for the router?", want: "책상 가까운 곳이 좋겠다고 하기", need: [["책상", ["desk"]]], hint: ["Somewhere near my ~ would be great.","Somewhere near…","Somewhere near my desk would be great."], model: "Somewhere near my desk would be great." },
        { say: "Okay. I need to drill a small hole in the wall for the cable. Is that all right?", want: "집주인에게 먼저 물어보겠다고 하기", need: [["집주인", ["landlord"]]], hint: ["Let me ask my ~ first.","Let me…","Let me ask my landlord first."], model: "Let me ask my landlord first." },
        { say: "No worries, I can run the cable along the baseboard instead.", want: "그럼 그렇게 해 달라고 하기", need: [["그렇게", ["that"]]], hint: ["Great, let's do ~ instead.","Great, let's…","Great, let's do that instead."], model: "Great, let's do that instead.", chunk: ["instead","대신에","다른 방법으로 바꿀 때 써요."] },
        { say: "All done. Try connecting your laptop.", want: "연결됐다고, 와이파이 비밀번호를 묻기", need: [["비밀번호", ["password"]]], hint: ["It's connected. What's the Wi-Fi ~?","It's connected.…","It's connected. What's the Wi-Fi password?"], model: "It's connected. What's the Wi-Fi password?" },
        { say: "It's on the sticker on the router. Speed test says ninety-five.", want: "빠르다고, 고맙다고 하기", need: [["빠르", ["fast", "quick"]]], hint: ["That's ~! Thanks, Jake.","That's fast!…","That's fast! Thanks, Jake."], model: "That's fast! Thanks, Jake." }
      ],
      overhear: [
        ["them", "Yeah, I'm at the apartment now. I'll be done in twenty minutes.", [["be done in","~ 안에 끝나다","끝날 시간을 말해요."]]],
        ["guest", "Can you send me a photo of the box?", [["send me a photo","사진을 보내 주다","send me ~로 보내 달라고 해요."]]],
        ["them", "Sure. One second."],
        ["guest", "Thanks. Call me when you finish."]
      ] }],
    ["18:00", "난방이 안 돼요", "landlord", {
      who: "Mr. Patel", whoKo: "집주인", voices: { them: "m", guest: "f2" }, guestKo: "부동산 중개인",
      turns: [
        { say: "Hello! Linda said you called. Is everything okay?", want: "네, 근데 히터가 안 된다고 하기", need: [["히터", ["heater", "radiator", "heating"]]], hint: ["Everything's fine, but the ~ doesn't work.","Everything's fine,…","Everything's fine, but the heater doesn't work."], model: "Everything's fine, but the heater doesn't work." },
        { say: "Oh no. Since when?", want: "어젯밤부터라고 하기", need: [["어젯밤", ["last night"]]], hint: ["Since ~, I think.","Since last…","Since last night, I think."], model: "Since last night, I think.", chunk: ["Since when?","언제부터요?","문제가 언제 시작됐는지 물어요."] },
        { say: "I'll send someone tomorrow. Do you need anything else?", want: "벽에 선반을 달아도 되는지 묻기", need: [["벽", ["wall"]], ["달기", ["hang", "put up", "install"]]], hint: ["Also, can I hang some shelves on the ~?","Also, can I…","Also, can I hang some shelves on the wall?"], model: "Also, can I hang some shelves on the wall?" },
        { say: "Small nails are fine, but no big holes, please.", want: "알겠다고, 나갈 때 메우겠다고 하기", need: [["메우", ["fix", "fill", "patch", "repair"]]], hint: ["Understood. I'll ~ them when I move out.","Understood. I'll fix…","Understood. I'll fix them when I move out."], model: "Understood. I'll fix them when I move out." },
        { say: "Thank you. Welcome to the building. I hope you like it here.", want: "벌써 아주 마음에 든다고 하기", need: [["마음에 듦", ["love", "like"]]], hint: ["I already ~ it here. Thanks for everything!","I already love…","I already love it here. Thanks for everything!"], model: "I already love it here. Thanks for everything!" }
      ],
      overhear: [
        ["guest", "Mr. Patel, the hallway light is flickering again.", [["flickering","깜빡거리는","불빛이 깜빡일 때 써요."]]],
        ["them", "I'll replace the bulb this weekend.", [["replace the bulb","전구를 갈다","고장 난 전구를 새것으로 바꿀 때 써요."]]],
        ["guest", "Thank you. It's a little dark at night."],
        ["them", "Sorry about that."]
      ] }]
  ]],
  ["이웃과 인사", [
    ["16:00", "옆집 할머니", "neighbor", {
      who: "Mrs. Green", whoKo: "옆집 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 이웃",
      turns: [
        { say: "Oh, hello! You must be my new neighbor.", want: "네, 어제 옆집으로 이사 왔다고 하기", need: [["옆집", ["next door"]]], hint: ["Yes, I just moved in ~.","Yes, I…","Yes, I just moved in next door."], model: "Yes, I just moved in next door." },
        { say: "How lovely! I'm Mrs. Green. And you are?", want: "이름을 말하고 만나서 반갑다고 하기", need: [["반가움", ["nice to meet you", "pleasure", "pleased to meet you"]]], hint: ["I'm {name}. ~, Mrs. Green.","I'm {name}. Nice…","I'm {name}. Nice to meet you, Mrs. Green."], model: "I'm {name}. Nice to meet you, Mrs. Green." },
        { say: "Have you been in the city long?", want: "한국에서 왔고 여기서 공부한다고 하기", need: [["한국", ["korea", "korean"]]], hint: ["I'm from ~, and I'm studying here.","I'm from…","I'm from Korea, and I'm studying here."], model: "I'm from Korea, and I'm studying here." },
        { say: "Wonderful! I've lived here for forty years. If you need anything, just knock.", want: "친절하시다고, 너무 시끄러우면 말해 달라고 하기", need: [["시끄럽", ["loud", "noise", "noisy"]]], hint: ["That's so kind. Please tell me if I'm too ~.","That's so kind. Please…","That's so kind. Please tell me if I'm too loud."], model: "That's so kind. Please tell me if I'm too loud." },
        { say: "Oh, don't worry. Here, I baked too many cookies.", want: "고맙다고, 맛있어 보인다고 하기", need: [["맛있어 보임", ["look delicious", "looks delicious", "look great", "looks great", "look good", "looks good", "look amazing", "looks amazing"]]], hint: ["Thank you! They ~.","Thank you!…","Thank you! They look delicious."], model: "Thank you! They look delicious.", chunk: ["I baked too many","너무 많이 구웠어요","음식을 나눠 줄 때 가볍게 하는 말이에요."] }
      ],
      overhear: [
        ["guest", "Excuse me, is this your package? It was by my door."],
        ["them", "Oh, yes! Thank you for bringing it over.", [["bringing it over","가져다주다","물건을 직접 갖다줄 때 써요."]]],
        ["guest", "No problem. I'm in 4B, by the way.", [["by the way","그런데","말하다가 덧붙일 때 써요."]]],
        ["them", "Nice to meet you!"]
      ] }],
    ["13:00", "Ella에게 이웃 이야기", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Hey, neighbor! Max and I were just talking about you.", want: "어제 옆집 할머니를 만났다고 하기", need: [["옆집", ["next door"]]], hint: ["I met my ~ neighbor yesterday.","I met…","I met my next-door neighbor yesterday."], model: "I met my next-door neighbor yesterday." },
        { say: "Mrs. Green? She's the sweetest. She'll give you cookies.", want: "벌써 줬다고 하기", need: [["벌써", ["already"]]], hint: ["She ~ did!","She already…","She already did!"], model: "She already did!" },
        { say: "Ha! Want to join us for a walk around the lake?", want: "좋은데 한 시간밖에 없다고 하기", need: [["한 시간", ["hour"]]], hint: ["I'd love to, but I only have an ~.","I'd love to,…","I'd love to, but I only have an hour."], model: "I'd love to, but I only have an hour.", chunk: ["I only have ~","~밖에 없어요","시간이 부족할 때 써요."] },
        { say: "That's enough. So how are you settling in?", want: "조금씩 익숙해지고 있다고 하기", need: [["적응", ["getting used", "settling in", "settling", "getting comfortable"]]], hint: ["I'm slowly ~ to it.","I'm slowly…","I'm slowly getting used to it."], model: "I'm slowly getting used to it.", chunk: ["settle in","자리 잡다","새 집·새 도시에 적응할 때 써요."] },
        { say: "Good. Let me know if you ever need a dog sitter!", want: "고맙다고, 다음엔 내가 Max를 산책시켜 주겠다고 하기", need: [["산책", ["walk"]], ["Max", ["max"]]], hint: ["Thanks! Next time I'll ~ Max for you.","Thanks! Next time…","Thanks! Next time I'll walk Max for you."], model: "Thanks! Next time I'll walk Max for you." }
      ],
      overhear: [
        ["guest", "Is your dog friendly?"],
        ["them", "Very! He just loves to run.", [["loves to run","달리기를 좋아해요","좋아하는 걸 love to로 말해요."]]],
        ["guest", "Does he like other dogs?"],
        ["them", "Yes, but he's shy at first.", [["shy at first","처음엔 낯을 가려요","처음 만났을 때 수줍어한다는 뜻이에요."]]]
      ] }],
    ["18:00", "첫 운동 수업", "gym", {
      who: "Tyler", whoKo: "헬스장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 회원",
      turns: [
        { say: "Hey! Welcome back. Ready for your free session?", want: "네, 근데 오랫동안 운동을 안 했다고 하기", need: [["오랫동안", ["in a while", "a while", "long time"]]], hint: ["Yes, but I haven't worked out ~.","Yes, but I…","Yes, but I haven't worked out in a while."], model: "Yes, but I haven't worked out in a while.", chunk: ["work out","운동하다","헬스·운동을 할 때 써요."] },
        { say: "No problem. We'll start slow. What are your goals?", want: "체력을 키우고 싶다고 하기", need: [["체력", ["stronger", "stamina", "strength", "fit", "in shape"]]], hint: ["I want to get ~ and build some stamina.","I want to…","I want to get stronger and build some stamina."], model: "I want to get stronger and build some stamina." },
        { say: "Great goals. Let's warm up on the treadmill for ten minutes.", want: "천천히 시작해도 되는지 묻기", need: [["천천히", ["slowly", "slow"]]], hint: ["Can we start ~, please?","Can we…","Can we start slowly, please?"], model: "Can we start slowly, please?" },
        { say: "Sure. Now, some squats. Tell me if it hurts.", want: "무릎이 조금 아프다고 하기", need: [["무릎", ["knee", "knees"]]], hint: ["My ~ hurts a little.","My knee…","My knee hurts a little."], model: "My knee hurts a little.", chunk: ["hurts","아프다","아픈 곳을 주어로 말해요."] },
        { say: "Okay, let's stop. Good job today! Same time on Thursday?", want: "좋다고, 목요일에 오겠다고 하기", need: [["목요일", ["thursday"]]], hint: ["Sounds good. I'll be here on ~.","Sounds good.…","Sounds good. I'll be here on Thursday."], model: "Sounds good. I'll be here on Thursday." }
      ],
      overhear: [
        ["guest", "Can you spot me on this one?", [["spot me","옆에서 봐 주다","무거운 걸 들 때 안전을 도와줘요."]]],
        ["them", "Sure. How many reps?", [["reps","반복 횟수","한 동작을 되풀이하는 횟수예요."]]],
        ["guest", "Ten. I'll go slow."],
        ["them", "You've got this!"]
      ] }]
  ]],
  ["마트 장보기", [
    ["11:00", "마트 계산대", "grocery", {
      who: "Tina", whoKo: "마트 계산원", voices: { them: "f2", guest: "m" }, guestKo: "다음 손님",
      turns: [
        { say: "Hi! Did you find everything okay?", want: "네, 근데 내 장바구니를 안 가져왔다고 하기", need: [["장바구니", ["bag", "tote", "bags"]]], hint: ["Yes, but I forgot my own ~.","Yes, but…","Yes, but I forgot my own bag."], model: "Yes, but I forgot my own bag." },
        { say: "No problem. A paper bag is ten cents.", want: "종이봉투 두 개 달라고 하기", need: [["두 개", ["two"]], ["봉투", ["bag", "bags"]]], hint: ["~ paper bags, please.","Two paper…","Two paper bags, please."], model: "Two paper bags, please." },
        { say: "Sure. Do you have a store card?", want: "아니, 오늘 처음 왔다고 하기", need: [["처음", ["first time", "new"]]], hint: ["No, this is my ~ here.","No, this…","No, this is my first time here."], model: "No, this is my first time here." },
        { say: "Welcome! Your total is forty-two dollars. Cash or card?", want: "카드로, 갖다 대기만 해도 되는지 묻기", need: [["대기", ["tap", "contactless"]]], hint: ["Card. Can I just ~ it?","Card. Can…","Card. Can I just tap it?"], model: "Card. Can I just tap it?" },
        { say: "Yes, just tap here. Would you like a receipt?", want: "아니, 괜찮다고 하기", need: [["괜찮음", ["no thanks", "no thank you", "i'm good", "don't need", "not necessary"]]], hint: ["No, thanks. ~.","No, thanks.…","No, thanks. I'm good."], model: "No, thanks. I'm good.", chunk: ["I'm good","괜찮아요","권유를 가볍게 거절할 때 써요."] }
      ],
      overhear: [
        ["guest", "Excuse me, where can I find the rice?"],
        ["them", "Aisle seven, on your left.", [["on your left","왼쪽에","길·위치를 알려 줄 때 써요."]]],
        ["guest", "And do you carry gluten-free pasta?", [["gluten-free","글루텐 없는","밀가루를 피해야 하는 사람이 찾아요."]]],
        ["them", "Yes, it's next to the regular pasta."]
      ] }],
    ["15:00", "신선한 채소 사기", "market", {
      who: "Joe", whoKo: "과일 가게 주인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hey, neighbor! Welcome to the area. What can I get you?", want: "토마토가 오늘 신선한지 묻기", need: [["신선", ["fresh"]]], hint: ["Are the tomatoes ~ today?","Are the…","Are the tomatoes fresh today?"], model: "Are the tomatoes fresh today?" },
        { say: "Picked this morning. How many do you want?", want: "1파운드만 달라고 하기", need: [["파운드", ["pound", "pounds"]]], hint: ["Just one ~, please.","Just one…","Just one pound, please."], model: "Just one pound, please." },
        { say: "Sure. Onions are on sale, three for a dollar.", want: "그럼 양파 세 개 달라고 하기", need: [["세 개", ["three"]]], hint: ["Then I'll take ~ of those.","Then I'll…","Then I'll take three of those."], model: "Then I'll take three of those." },
        { say: "Anything else? I have good bananas.", want: "바나나는 너무 익지 않은 걸로 달라고 하기", need: [["덜 익은", ["not too ripe", "not ripe", "unripe", "green", "less ripe"]]], hint: ["Could I get some that are ~?","Could I get…","Could I get some that are not too ripe?"], model: "Could I get some that are not too ripe?", chunk: ["ripe","잘 익은","과일이 먹기 좋게 익었다고 할 때 써요."] },
        { say: "Here you go. That's eight fifty. Say hi to Mrs. Green for me!", want: "웃으며 그러겠다고, 내일 또 오겠다고 하기", need: [["내일", ["tomorrow"]]], hint: ["Ha, I will! I'll be back ~.","Ha, I…","Ha, I will! I'll be back tomorrow."], model: "Ha, I will! I'll be back tomorrow." }
      ],
      overhear: [
        ["guest", "How much are these peaches?"],
        ["them", "Two dollars a pound."],
        ["guest", "Could I get a discount if I buy five pounds?", [["a discount","할인","값을 깎아 달라고 할 때 써요."]]],
        ["them", "For you? Sure, ten percent off."]
      ] }],
    ["18:00", "부리토 먹기", "foodtruck", {
      who: "Carlos", whoKo: "푸드트럭 사장님", voices: { them: "m2", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, my friend! Tacos for dinner?", want: "오늘은 부리토를 먹어 보고 싶다고 하기", need: [["부리토", ["burrito"]]], hint: ["Not today. I want to try a ~.","Not today. I…","Not today. I want to try a burrito."], model: "Not today. I want to try a burrito." },
        { say: "Good choice! Beef, chicken, or beans?", want: "소고기로, 양파는 빼 달라고 하기", need: [["소고기", ["beef"]], ["뺌", ["no onions", "without onions", "hold the onions", "no onion"]]], hint: ["~, please, with no onions.","Beef, please,…","Beef, please, with no onions."], model: "Beef, please, with no onions.", chunk: ["with no ~","~ 빼고","재료를 빼 달라고 할 때 써요."] },
        { say: "Sure. Rice and beans inside?", want: "네, 매운 소스는 따로 달라고 하기", need: [["따로", ["on the side", "separate", "separately"]]], hint: ["Yes, and the hot sauce ~, please.","Yes, and the…","Yes, and the hot sauce on the side, please."], model: "Yes, and the hot sauce on the side, please.", chunk: ["on the side","따로 담아서","소스를 따로 받을 때 써요."] },
        { say: "You got it. It'll take about five minutes.", want: "기다리는 동안 앉을 곳이 있는지 묻기", need: [["앉기", ["sit", "seat", "seats", "table", "bench"]]], hint: ["Is there a place to ~ while I wait?","Is there a…","Is there a place to sit while I wait?"], model: "Is there a place to sit while I wait?" },
        { say: "There are benches over there. Your food's ready! Enjoy.", want: "냄새가 정말 좋다고, 고맙다고 하기", need: [["냄새", ["smells", "smell"]]], hint: ["Wow, it ~ so good! Thanks, Carlos.","Wow, it…","Wow, it smells so good! Thanks, Carlos."], model: "Wow, it smells so good! Thanks, Carlos." }
      ],
      overhear: [
        ["guest", "Do you take cards?"],
        ["them", "Cash only, I'm sorry. There's an ATM around the corner.", [["around the corner","모퉁이를 돌면","가까운 곳을 말할 때 써요."]]],
        ["guest", "No worries, I have cash."],
        ["them", "Great. What can I get you?"]
      ] }]
  ]],
  ["세탁방", [
    ["10:00", "세탁기 쓰는 법", "laundromat", {
      who: "Walt", whoKo: "세탁방 관리인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Morning! First time here?", want: "네, 이 기계들 쓰는 법을 모른다고 하기", need: [["쓰는 법", ["how to use", "how to"]]], hint: ["Yes, I don't know ~ these machines.","Yes, I don't…","Yes, I don't know how to use these machines."], model: "Yes, I don't know how to use these machines." },
        { say: "Easy. Put your clothes in, then pay at the kiosk. Do you have quarters?", want: "동전이 없는데 바꿀 수 있는지 묻기", need: [["바꾸", ["change", "exchange"]]], hint: ["I don't. Can I get ~ for a ten?","I don't. Can…","I don't. Can I get change for a ten?"], model: "I don't. Can I get change for a ten?", chunk: ["quarters","25센트 동전","세탁기에 가장 많이 써요."] },
        { say: "Sure, here you go. A load takes about thirty minutes.", want: "흰 옷이랑 색깔 옷을 따로 빨아야 하는지 묻기", need: [["따로", ["separately", "separate", "apart"]]], hint: ["Should I wash my whites and colors ~?","Should I wash…","Should I wash my whites and colors separately?"], model: "Should I wash my whites and colors separately?" },
        { say: "Yes, that's best. Use cold water for colors.", want: "건조기는 얼마나 걸리는지 묻기", need: [["건조기", ["dryer"]], ["얼마나", ["how long"]]], hint: ["How long does the ~ take?","How long…","How long does the dryer take?"], model: "How long does the dryer take?" },
        { say: "About forty minutes. I'll be here folding towels if you need help.", want: "고맙다고, 한 시간 뒤에 오겠다고 하기", need: [["한 시간", ["hour"]]], hint: ["Thanks! I'll be back in an ~.","Thanks! I'll…","Thanks! I'll be back in an hour."], model: "Thanks! I'll be back in an hour." }
      ],
      overhear: [
        ["guest", "Excuse me, someone left a sock in this dryer."],
        ["them", "Just put it on the table by the door. Somebody will come back for it.", [["come back for it","찾으러 오다","두고 간 물건을 찾으러 올 때 써요."]]],
        ["guest", "Okay. Also, the machine ate my coins!", [["ate my coins","동전을 먹었어요","기계가 돈만 받고 안 될 때 이렇게 말해요."]]],
        ["them", "Oh no, let me take a look."]
      ] }],
    ["14:00", "주소 바꾸고 카드 받기", "bank", {
      who: "Mr. Lewis", whoKo: "은행 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 고객",
      turns: [
        { say: "Welcome back! How can I help you today?", want: "집이 생겼으니 주소를 바꾸고 싶다고 하기", need: [["주소", ["address"]]], hint: ["I have an apartment now, so I'd like to change my ~.","I have an apartment…","I have an apartment now, so I'd like to change my address."], model: "I have an apartment now, so I'd like to change my address." },
        { say: "Congratulations! I'll need a document with your new address.", want: "임대 계약서로 되는지 묻기", need: [["계약서", ["lease", "contract", "rental agreement"]]], hint: ["Will my ~ work?","Will my…","Will my lease work?"], model: "Will my lease work?" },
        { say: "Yes, a copy is fine. Oh, and your debit card arrived.", want: "좋다고, 어떻게 쓸 수 있게 하는지 묻기", need: [["활성화", ["activate", "activated"]]], hint: ["Great! How do I ~ it?","Great! How…","Great! How do I activate it?"], model: "Great! How do I activate it?" },
        { say: "Just call this number, or use the app. You'll also need to set a PIN.", want: "PIN이 몇 자리인지 묻기", need: [["자리", ["digits", "digit"]]], hint: ["How many ~ is the PIN?","How many…","How many digits is the PIN?"], model: "How many digits is the PIN?" },
        { say: "Four digits. Don't share it with anyone.", want: "알겠다고, 온라인 뱅킹도 신청하고 싶다고 하기", need: [["온라인", ["online"]]], hint: ["Got it. I'd also like to sign up for ~ banking.","Got it. I'd also…","Got it. I'd also like to sign up for online banking."], model: "Got it. I'd also like to sign up for online banking." }
      ],
      overhear: [
        ["guest", "I think there's a charge on my statement that isn't mine.", [["a charge","청구 금액","카드에 찍힌 돈이에요."],["statement","명세서","한 달 카드·통장 내역서예요."]]],
        ["them", "Let's take a look. When was it?"],
        ["guest", "On the fifth. Fifty dollars."],
        ["them", "I'll dispute it for you.", [["dispute","이의를 제기하다","잘못된 청구에 항의할 때 써요."]]]
      ] }],
    ["17:00", "세제 사기", "pharmacy", {
      who: "Grace", whoKo: "약사", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Back again. How's the new apartment?", want: "좋다고, 세탁 세제를 사야 한다고 하기", need: [["세제", ["detergent", "laundry soap"]]], hint: ["It's great. I need laundry ~.","It's great.…","It's great. I need laundry detergent."], model: "It's great. I need laundry detergent." },
        { say: "Aisle five. Powder or liquid?", want: "액체가 편하다고 하기", need: [["액체", ["liquid"]]], hint: ["~ is easier for me.","Liquid is…","Liquid is easier for me."], model: "Liquid is easier for me." },
        { say: "Okay. Do you have sensitive skin? We have a fragrance-free kind.", want: "향이 없는 게 좋다고 하기", need: [["향 없음", ["fragrance free", "unscented", "no scent", "no fragrance"]]], hint: ["~ is better, thanks.","Fragrance-free is…","Fragrance-free is better, thanks."], model: "Fragrance-free is better, thanks." },
        { say: "Here's one. It's twelve dollars for sixty loads.", want: "한 번 빨 때 얼마나 넣는지 묻기", need: [["얼마나", ["how much"]]], hint: ["~ should I use per load?","How much…","How much should I use per load?"], model: "How much should I use per load?", chunk: ["per load","빨래 한 번에","한 번당은 per를 써요."] },
        { say: "Just one cap. And if you want fabric softener, it's next to it.", want: "섬유유연제도 사겠다고 하기", need: [["섬유유연제", ["fabric softener", "softener"]]], hint: ["I'll also get some ~.","I'll also…","I'll also get some fabric softener."], model: "I'll also get some fabric softener." }
      ],
      overhear: [
        ["guest", "I have a headache. Do you have something for it?"],
        ["them", "Here, this pain reliever works fast.", [["pain reliever","진통제","아픔을 줄여 주는 약이에요."]]],
        ["guest", "How many can I take a day?"],
        ["them", "No more than four, with food.", [["No more than","~ 넘지 마세요","최대 양을 말할 때 써요."]]]
      ] }]
  ]],
  ["집들이", [
    ["11:00", "집들이용 컵 사기", "souvenir", {
      who: "Hannah", whoKo: "기념품 가게 주인", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi there! Looking for anything special?", want: "오늘 저녁 집들이를 하는데 컵이 필요하다고 하기", need: [["집들이", ["housewarming"]]], hint: ["I'm having a ~ party tonight and need some mugs.","I'm having a housewarming…","I'm having a housewarming party tonight and need some mugs."], model: "I'm having a housewarming party tonight and need some mugs.", chunk: ["housewarming party","집들이","새 집에 사람을 초대하는 파티예요."] },
        { say: "Fun! How many people?", want: "여섯 명 정도라고 하기", need: [["여섯", ["six", "6"]]], hint: ["About ~ people.","About six…","About six people."], model: "About six people." },
        { say: "Perfect. These blue mugs come in a set of six. Eighteen dollars.", want: "다른 색도 있는지 묻기", need: [["다른 색", ["other colors", "other colours", "different colors", "another color"]]], hint: ["Do you have them in ~?","Do you…","Do you have them in other colors?"], model: "Do you have them in other colors?" },
        { say: "Yes, in green and yellow. Want a mix?", want: "네, 섞어서 주면 좋겠다고 하기", need: [["섞", ["mix", "mixed"]]], hint: ["Yes, a ~ would be fun.","Yes, a…","Yes, a mix would be fun."], model: "Yes, a mix would be fun." },
        { say: "Great! I'll wrap them for you. Want a gift bag?", want: "아니, 내가 쓸 거라 괜찮다고 하기", need: [["내가 쓸", ["for me", "for myself"]]], hint: ["No need, they're ~.","No need,…","No need, they're for me."], model: "No need, they're for me." }
      ],
      overhear: [
        ["guest", "Do you have a postcard of the lake?"],
        ["them", "Yes, they're right by the register.", [["by the register","계산대 옆에","register는 계산대예요."]]],
        ["guest", "I'll take three."],
        ["them", "Would you like stamps with those?", [["stamps","우표","엽서와 같이 사요."]]]
      ] }],
    ["14:00", "파티 준비", "newhome", {
      who: "Sara", whoKo: "도와주는 친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Okay, the food is almost ready. What else do we need?", want: "마실 것과 얼음이 더 필요하다고 하기", need: [["얼음", ["ice"]]], hint: ["We need more drinks and some ~.","We need…","We need more drinks and some ice."], model: "We need more drinks and some ice." },
        { say: "I'll run to the store. Where should we put the chairs?", want: "의자가 모자라니 쿠션을 쓰자고 하기", need: [["쿠션", ["cushion", "cushions", "pillow", "pillows"]]], hint: ["We don't have enough chairs, so let's use ~.","We don't have…","We don't have enough chairs, so let's use cushions."], model: "We don't have enough chairs, so let's use cushions.", chunk: ["enough ~","충분한 ~","not enough는 '모자라다'예요."] },
        { say: "Smart. Should I turn on some music?", want: "좋다고, 이웃을 생각해 너무 시끄럽지 않게 하자고 하기", need: [["시끄럽", ["too loud", "loud", "noisy"]]], hint: ["Yes, but not ~ because of the neighbors.","Yes, but not…","Yes, but not too loud because of the neighbors."], model: "Yes, but not too loud because of the neighbors." },
        { say: "Got it. Oh, who's coming again?", want: "Ella랑 Mrs. Green이랑 다른 이웃들이라고 하기", need: [["이웃", ["neighbors", "neighbours", "neighbor"]]], hint: ["Ella, Mrs. Green, and a few other ~.","Ella, Mrs. Green,…","Ella, Mrs. Green, and a few other neighbors."], model: "Ella, Mrs. Green, and a few other neighbors." },
        { say: "Great! Do you want me to stay and help clean up after?", want: "당연하다고, 오늘 정말 고맙다고 하기", need: THANKS, hint: ["Of course! ~ you for today.","Of course!…","Of course! Thank you for today."], model: "Of course! Thank you for today." }
      ],
      overhear: [
        ["guest", "Is there anything I can do?"],
        ["them", "Can you cut the lemons?"],
        ["guest", "Sure. Where's the knife?"],
        ["them", "Second drawer on the right.", [["Second drawer","두 번째 서랍","순서는 second, third로 말해요."]]]
      ] }],
    ["19:00", "이웃 손님 맞기", "neighbor", {
      who: "Mrs. Green", whoKo: "옆집 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 이웃",
      turns: [
        { say: "Hello, dear! I'm just coming over. I made a cake.", want: "와 주셔서 기쁘다고, 케이크가 멋지다고 하기", need: [["케이크", ["cake"]]], hint: ["I'm so glad you came. That ~ looks amazing!","I'm so glad…","I'm so glad you came. That cake looks amazing!"], model: "I'm so glad you came. That cake looks amazing!" },
        { say: "Thank you. Should I take my shoes off?", want: "신발은 신고 들어오시라고 하기", need: [["신발", ["shoes"]]], hint: ["You can keep your ~ on. Please come in!","You can keep…","You can keep your shoes on. Please come in!"], model: "You can keep your shoes on. Please come in!" },
        { say: "What a lovely, bright room.", want: "앉으시라고, 마실 것을 드릴지 묻기", need: [["마실", ["drink", "tea", "water", "juice", "lemonade"]]], hint: ["Please have a seat. Can I get you something to ~?","Please have a seat.…","Please have a seat. Can I get you something to drink?"], model: "Please have a seat. Can I get you something to drink?", chunk: ["Can I get you ~?","~ 드릴까요?","손님에게 권할 때 써요."] },
        { say: "Some tea would be nice.", want: "물론이라고, 설탕이나 우유가 필요한지 묻기", need: [["설탕", ["sugar"]], ["우유", ["milk"]]], hint: ["Of course. Would you like ~ or milk?","Of course. Would…","Of course. Would you like sugar or milk?"], model: "Of course. Would you like sugar or milk?" },
        { say: "Just milk, please. You're so thoughtful.", want: "이웃이 되어 주셔서 감사하다고 하기", need: [["이웃", ["neighbor"]]], hint: ["Thank you for being such a kind ~.","Thank you for…","Thank you for being such a kind neighbor."], model: "Thank you for being such a kind neighbor." }
      ],
      overhear: [
        ["guest", "Evening, Margaret! Are you going to the party next door?"],
        ["them", "Yes! I'm bringing a cake."],
        ["guest", "Save me a slice!", [["Save me a slice","한 조각 남겨 줘요","음식을 남겨 달라고 가볍게 말해요."]]],
        ["them", "Of course!"]
      ] }]
  ]]
]);
