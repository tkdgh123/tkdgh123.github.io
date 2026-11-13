// 8주째 · 생활 속 문제 (50~56일째). 고장, 택배, 요금, 환불, 소음, 집주인 통화까지 정중하지만 분명하게 말해서 해결한다.
// 장면 = [시간, 이름, 그림 id, 대본]. 그림 id가 week.js ART에 들어오면 열린다. 형식은 ~/sulsul-art/YEAR.md
WEEK(8, [
  ["고장 신고", [
    ["08:30", "싱크대가 새요", "landlord", {
      who: "Mr. Patel", whoKo: "집주인", voices: { them: "m", guest: "f2" }, guestKo: "다른 세입자",
      turns: [
        { say: "Good morning! Is everything alright with the apartment?", want: "번거롭게 해서 죄송하지만 싱크대에서 물이 샌다고 하기", need: [["새다", ["leaking", "leaks", "leak", "dripping"]]], hint: ["I'm sorry to bother you, but the sink is ~.", "I'm sorry to bother you, but the sink…", "I'm sorry to bother you, but the sink is leaking."], model: "I'm sorry to bother you, but the sink is leaking.", chunk: ["I'm sorry to bother you", "번거롭게 해서 죄송해요", "불편한 말을 꺼내기 전에 써요."] },
        { say: "Oh no. Since when?", want: "어젯밤부터고, 바닥에 물이 고였다고 하기", need: [["어젯밤", ["last night", "yesterday"]]], hint: ["Since ~. There's water on the floor.", "Since last night…", "Since last night. There's water on the floor."], model: "Since last night. There's water on the floor." },
        { say: "I see. Did you turn off the water under the sink?", want: "밸브는 잠갔지만 아직 똑똑 떨어진다고 하기", need: [["잠갔", ["turned it off", "turned off", "shut it off", "shut off", "closed it", "closed"]]], hint: ["Yes, I ~ it, but it still drips.", "Yes, I turned off…", "Yes, I turned it off, but it still drips."], model: "Yes, I turned it off, but it still drips." },
        { say: "I'll send a plumber. Is this afternoon okay?", want: "2시 이후에는 집에 있다고 하기", need: [["2시", ["two", "2"]]], hint: ["Yes, I'll be home after ~ o'clock.", "Yes, I'll be home after…", "Yes, I'll be home after two o'clock."], model: "Yes, I'll be home after two o'clock." },
        { say: "Good. He'll call you first. Sorry for the trouble.", want: "괜찮다고, 빨리 도와줘서 고맙다고 하기", need: [["빨리", ["quick", "quickly", "fast", "prompt"]]], hint: ["That's okay. Thank you for the ~ help.", "That's okay. Thank you for the quick…", "That's okay. Thank you for the quick help."], model: "That's okay. Thank you for the quick help." }
      ],
      overhear: [
        ["guest", "Mr. Patel, the heater in 4B isn't working."],
        ["them", "Again? I fixed it last month."],
        ["guest", "It's freezing in there."],
        ["them", "I'll look into it today.", [["look into it", "알아보다, 살펴보다", "문제를 조사해서 처리할 때 써요."]]]
      ] }],
    ["14:00", "배관공이 왔어요", "repair", {
      who: "Frank", whoKo: "배관공", voices: { them: "m2", guest: "f" }, guestKo: "이웃",
      turns: [
        { say: "Hi, I'm Frank, the plumber. Mr. Patel called me. Where's the problem?", want: "싱크대 밑이라고 안내하기", need: [["싱크대", ["sink"]]], hint: ["It's right here, under the ~.", "It's right here, under…", "It's right here, under the sink."], model: "It's right here, under the sink." },
        { say: "Let me take a look. Hmm, a pipe is loose. Has it been leaking long?", want: "어젯밤부터인데 점점 심해지는 것 같다고 하기", need: [["심해짐", ["worse"]]], hint: ["Since last night, and it seems to be getting ~.", "Since last night, and it seems to be getting…", "Since last night, and it seems to be getting worse."], model: "Since last night, and it seems to be getting worse.", chunk: ["seems to be", "~인 것 같아요", "확실하지 않은 느낌을 부드럽게 말해요."] },
        { say: "That makes sense. I'll need to replace a part. About an hour.", want: "비용은 집주인이 내는 건지 묻기", need: [["부담", ["covered"]]], hint: ["Is the cost ~ by my landlord?", "Is the cost covered…", "Is the cost covered by my landlord?"], model: "Is the cost covered by my landlord?" },
        { say: "Yes, he takes care of it. Can you hand me that towel?", want: "여기 있다며 더 필요한 게 있는지 묻기", need: [["여기", ["here you go", "here it is", "here"]]], hint: ["~. Do you need anything else?", "Here you go…", "Here you go. Do you need anything else?"], model: "Here you go. Do you need anything else?" },
        { say: "That's it. All fixed. Turn the water on slowly.", want: "더 이상 안 샌다며 고맙다고 하기", need: [["새다", ["leaks", "leak", "leaking"]]], hint: ["No more ~! Thank you so much.", "No more leaks…", "No more leaks! Thank you so much."], model: "No more leaks! Thank you so much." }
      ],
      overhear: [
        ["guest", "Hey Frank, can you check my shower too?"],
        ["them", "Sure, as soon as I'm done here.", [["as soon as", "~하자마자", "시간을 약속할 때 써요."]]],
        ["guest", "No rush.", [["No rush", "서두르지 않아도 돼요", "급하지 않다고 배려할 때 써요."]]],
        ["them", "Appreciate it."]
      ] }],
    ["18:30", "Sara와 저녁 준비", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "You look exhausted. What happened?", want: "싱크대가 새서 정신없는 하루였다고 하기", need: [["정신없", ["crazy", "hectic", "chaotic"]]], hint: ["My sink was leaking, so the day was ~.", "My sink was leaking, so the day…", "My sink was leaking, so the day was crazy."], model: "My sink was leaking, so the day was crazy." },
        { say: "Oh no! Did the landlord do anything?", want: "배관공이 와서 고쳤다고 하기", need: [["고쳤", ["fixed"]]], hint: ["Yes, a plumber came and ~ it.", "Yes, a plumber came and…", "Yes, a plumber came and fixed it."], model: "Yes, a plumber came and fixed it." },
        { say: "Good. Some landlords ignore problems for weeks.", want: "Mr. Patel이 빨라서 운이 좋았다고 하기", need: [["운", ["lucky"]]], hint: ["Mr. Patel was fast. I'm ~.", "Mr. Patel was fast. I'm…", "Mr. Patel was fast. I'm lucky."], model: "Mr. Patel was fast. I'm lucky." },
        { say: "Do you want to stay for dinner? I'm making pasta.", want: "너무 좋다며 도울 게 있는지 묻기", need: [["도움", ["help"]]], hint: ["I'd love to! Can I ~ with anything?", "I'd love to! Can I help…", "I'd love to! Can I help with anything?"], model: "I'd love to! Can I help with anything?" },
        { say: "Just set the table. Forks are in the drawer.", want: "알겠다며 식탁을 차리겠다고 하기", need: [["식탁", ["table"]]], hint: ["Got it. I'll set the ~.", "Got it. I'll set…", "Got it. I'll set the table."], model: "Got it. I'll set the table.", chunk: ["set the table", "식탁을 차리다", "밥 먹기 전에 수저를 놓는 일이에요."] }
      ],
      overhear: [
        ["guest", "Sara, the water's boiling!"],
        ["them", "Turn it down a bit, please.", [["Turn it down", "줄여 줘요", "불·소리를 줄일 때 써요."]]],
        ["guest", "Done. Is the sauce ready?"],
        ["them", "Almost. Taste this."]
      ] }]
  ]],
  ["택배가 안 왔어요", [
    ["09:30", "우체국에서 택배 문의", "postoffice", {
      who: "Wendy", whoKo: "우체국 직원", voices: { them: "f", guest: "m2" }, guestKo: "다음 손님",
      turns: [
        { say: "Next, please! How can I help you?", want: "죄송하지만 택배가 아직 안 왔다고 하기", need: [["택배", ["package", "parcel"]]], hint: ["I'm afraid my ~ hasn't arrived.", "I'm afraid my package…", "I'm afraid my package hasn't arrived."], model: "I'm afraid my package hasn't arrived.", chunk: ["I'm afraid", "죄송하지만, 유감이지만", "안 좋은 말을 부드럽게 꺼낼 때 써요."] },
        { say: "Do you have the tracking number?", want: "여기 있다며, 배달 완료로 나오지만 받지 못했다고 하기", need: [["배달 완료", ["delivered"]]], hint: ["Here it is. It says ~, but I didn't get it.", "Here it is. It says delivered…", "Here it is. It says delivered, but I didn't get it."], model: "Here it is. It says delivered, but I didn't get it." },
        { say: "Let me look it up. It says it was left at the front desk.", want: "우리 건물에는 안내 데스크가 없다고 하기", need: [["안내 데스크", ["front desk"]]], hint: ["My building doesn't have a ~.", "My building doesn't have a front…", "My building doesn't have a front desk."], model: "My building doesn't have a front desk." },
        { say: "Hmm, that's strange. I can file a claim for you.", want: "그렇게 해 달라며 얼마나 걸리는지 묻기", need: [["얼마나", ["how long"]]], hint: ["Please do. ~ will it take?", "Please do. How long…", "Please do. How long will it take?"], model: "Please do. How long will it take?" },
        { say: "Usually three to five business days. I'll also contact the carrier.", want: "오늘 중으로 알아봐 주면 감사하겠다고 하기", need: [["알아봐", ["look into"]]], hint: ["Could you ~ it today? I'd appreciate it.", "Could you look into…", "Could you look into it today? I'd appreciate it."], model: "Could you look into it today? I'd appreciate it.", chunk: ["Could you look into it", "알아봐 주실 수 있나요", "문제를 조사해 달라고 정중히 부탁할 때 써요."] }
      ],
      overhear: [
        ["guest", "I'd like to send this to Canada."],
        ["them", "Express or standard?", [["Express or standard", "빠른우편이요, 일반이요?", "배송 속도를 고를 때 나와요."]]],
        ["guest", "Standard. How long does it take?"],
        ["them", "About ten days."]
      ] }],
    ["14:00", "옆집에서 택배 찾기", "neighbor", {
      who: "Mrs. Green", whoKo: "옆집 이웃", voices: { them: "f", guest: "m" }, guestKo: "배달원",
      turns: [
        { say: "Oh, hello, dear. You look worried.", want: "택배가 없어졌는데 혹시 보셨는지 묻기", need: [["택배", ["package", "parcel"]], ["보셨", ["seen", "see"]]], hint: ["I'm missing a ~. Have you seen it?", "I'm missing a package…", "I'm missing a package. Have you seen it?"], model: "I'm missing a package. Have you seen it?" },
        { say: "A brown box? Yes! The delivery man left it with me yesterday.", want: "정말요? 너무 다행이라고 하기", need: [["다행", ["relief", "relieved", "thank goodness"]]], hint: ["Really? What a ~!", "Really? What a relief…", "Really? What a relief!"], model: "Really? What a relief!", chunk: ["What a relief", "정말 다행이에요", "걱정이 사라졌을 때 써요."] },
        { say: "He rang your bell, but you weren't home. I should have told you.", want: "괜찮다며 안전하게 맡아 줘서 고맙다고 하기", need: [["맡아", ["keeping"]]], hint: ["It's okay. Thank you for ~ it safe.", "It's okay. Thank you for keeping…", "It's okay. Thank you for keeping it safe."], model: "It's okay. Thank you for keeping it safe." },
        { say: "Come in, I'll get it. Would you like some tea?", want: "고맙지만 다음에, 우체국에 알려야 한다고 하기", need: [["다음에", ["another time", "next time", "later"]]], hint: ["Thanks, but ~. I need to tell the post office.", "Thanks, but another time…", "Thanks, but another time. I need to tell the post office."], model: "Thanks, but another time. I need to tell the post office." },
        { say: "Of course. Next time, just leave a note on your door.", want: "좋은 생각이라며 다음엔 메모를 붙이겠다고 하기", need: [["메모", ["note"]]], hint: ["Good idea. I'll leave a ~ next time.", "Good idea. I'll leave a note…", "Good idea. I'll leave a note next time."], model: "Good idea. I'll leave a note next time." }
      ],
      overhear: [
        ["guest", "Mrs. Green, I have a package for apartment six."],
        ["them", "That's next door. They're out right now."],
        ["guest", "Could you sign for it?", [["sign for", "받고 서명하다", "택배를 대신 받을 때 써요."]]],
        ["them", "Of course, dear."]
      ] }],
    ["18:00", "카페에서 한시름 놓기", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "You look so much happier than this morning!", want: "택배를 찾았다고, 옆집에 있었다고 하기", need: [["찾았", ["found"]]], hint: ["I ~ my package! It was next door.", "I found…", "I found my package! It was next door."], model: "I found my package! It was next door." },
        { say: "Ha, mystery solved. What was in it?", want: "책 한 권과 새 이어폰이라고 하기", need: [["이어폰", ["earbuds", "earphones", "headphones"]]], hint: ["A book and some new ~.", "A book and some…", "A book and some new earbuds."], model: "A book and some new earbuds." },
        { say: "Nice. Did you have to pay for anything?", want: "아니, 배송비는 이미 냈다고 하기", need: [["배송비", ["shipping", "delivery fee"]]], hint: ["No, I already paid for ~.", "No, I already paid…", "No, I already paid for shipping."], model: "No, I already paid for shipping." },
        { say: "Good. Your usual, then?", want: "오늘은 쉬고 싶으니 따뜻한 차로 달라고 하기", need: [["차", ["tea"]]], hint: ["Actually, a hot ~. I need to relax.", "Actually, a hot tea…", "Actually, a hot tea. I need to relax."], model: "Actually, a hot tea. I need to relax." },
        { say: "One hot tea, coming up. It's on me today.", want: "정말 고맙다며 신세를 졌다고 하기", need: [["신세", ["owe you"]]], hint: ["That's so kind. I ~ one!", "That's so kind. I owe…", "That's so kind. I owe you one!"], model: "That's so kind. I owe you one!", chunk: ["I owe you one", "신세 졌어요", "도움을 받았을 때 써요."] }
      ],
      overhear: [
        ["guest", "Is the Wi-Fi password on the receipt?"],
        ["them", "Yep, at the bottom of the receipt."],
        ["guest", "Great. Can I plug in my laptop?", [["plug in", "전원을 꽂다", "충전기·기기를 연결할 때 써요."]]],
        ["them", "Sure, the outlets are by the window.", [["outlets", "콘센트", "plug는 플러그 자체를 말해요."]]]
      ] }]
  ]],
  ["요금이 이상해요", [
    ["10:00", "휴대폰 요금이 이상해요", "phonestore", {
      who: "Zoe", whoKo: "휴대폰 가게 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! What can I do for you today?", want: "청구서에 실수가 있는 것 같다고 하기", need: [["청구서", ["bill"]]], hint: ["I think there's a mistake on my ~.", "I think there's a mistake…", "I think there's a mistake on my bill."], model: "I think there's a mistake on my bill.", chunk: ["a mistake on", "~에 실수가 있어요", "청구서·서류의 오류를 말할 때 써요."] },
        { say: "Let me see. What looks wrong?", want: "45달러여야 하는데 80달러가 청구됐다고 하기", need: [["80", ["eighty", "80"]]], hint: ["It should be forty-five, but I was charged ~.", "It should be forty-five, but I was…", "It should be forty-five, but I was charged eighty."], model: "It should be forty-five, but I was charged eighty.", chunk: ["was charged", "요금이 청구됐어요", "수동태로 말해요."] },
        { say: "Hmm, there's a roaming charge. Did you use your phone abroad?", want: "아니, 한 달 내내 이 도시에 있었다고 하기", need: [["도시", ["in the city"]]], hint: ["No, I've been ~ all month.", "No, I've been in the city…", "No, I've been in the city all month."], model: "No, I've been in the city all month." },
        { say: "Then that looks like our mistake. I'll remove the charge.", want: "고맙다며 수정된 청구서를 보내 달라고 하기", need: [["수정", ["corrected", "updated", "revised"]]], hint: ["Thank you. Could you send me a ~ bill?", "Thank you. Could you send me a corrected…", "Thank you. Could you send me a corrected bill?"], model: "Thank you. Could you send me a corrected bill?" },
        { say: "Of course. It'll be in your email today.", want: "알겠다며 안 오면 다시 오겠다고 하기", need: [["다시 옴", ["come back"]]], hint: ["Great. If I don't get it, I'll ~ back.", "Great. If I don't get it, I'll come…", "Great. If I don't get it, I'll come back."], model: "Great. If I don't get it, I'll come back." }
      ],
      overhear: [
        ["guest", "Why did my data run out so fast?", [["run out", "다 떨어지다", "시간·돈·데이터가 바닥날 때 써요."]]],
        ["them", "Let me check. Did you stream a lot of video?"],
        ["guest", "Maybe. I watch shows on my commute."],
        ["them", "That uses a lot of data."]
      ] }],
    ["14:00", "카드에 모르는 결제가", "bank", {
      who: "Mr. Lewis", whoKo: "은행 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 고객",
      turns: [
        { say: "Good afternoon. How can I help?", want: "카드 명세서에 모르는 결제가 있다고 하기", need: [["모르는", ["don't recognize", "do not recognize"]]], hint: ["I ~ this charge on my statement.", "I don't recognize…", "I don't recognize this charge on my statement."], model: "I don't recognize this charge on my statement.", chunk: ["I don't recognize", "모르는 거예요", "기억에 없는 결제를 말할 때 써요."] },
        { say: "Let me see. Thirty-nine dollars, from an online store, on the third.", want: "그날은 아무것도 안 샀다고 하기", need: [["안 샀", ["didn't buy", "did not buy", "didn't purchase"]]], hint: ["I ~ anything that day.", "I didn't buy…", "I didn't buy anything that day."], model: "I didn't buy anything that day." },
        { say: "It could be a subscription. Did you sign up for a free trial recently?", want: "아, 무료 체험을 했는데 취소를 깜빡했다고 하기", need: [["취소", ["cancel"]]], hint: ["Oh, I did a free trial and forgot to ~.", "Oh, I did a free trial and forgot to…", "Oh, I did a free trial and forgot to cancel."], model: "Oh, I did a free trial and forgot to cancel." },
        { say: "That happens a lot. I can block future charges, but this one has gone through.", want: "이번 결제를 되돌릴 수 있는지 묻기", need: [["되돌", ["reverse"]]], hint: ["Can you ~ this charge?", "Can you reverse…", "Can you reverse this charge?"], model: "Can you reverse this charge?" },
        { say: "I'll file a dispute. You'll hear from us in a week.", want: "알겠다며 결과가 나오면 문자로 알려 달라고 하기", need: [["문자", ["text"]]], hint: ["Great. Please ~ me when you know.", "Great. Please text…", "Great. Please text me when you know."], model: "Great. Please text me when you know.", chunk: ["file a dispute", "이의를 제기하다", "카드 결제에 이의 신청할 때 써요."] }
      ],
      overhear: [
        ["guest", "I lost my debit card. I need to cancel it."],
        ["them", "I'll freeze it right now.", [["freeze it", "정지시키다", "카드를 잠시 막을 때 써요."]]],
        ["guest", "How long for a new one?"],
        ["them", "About five business days.", [["business days", "영업일", "주말·공휴일은 빼고 세요."]]]
      ] }],
    ["17:30", "헬스장 회비가 두 번", "gym", {
      who: "Tyler", whoKo: "헬스장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 회원",
      turns: [
        { say: "Hey! What's up?", want: "이번 달 회비가 두 번 빠져나갔다고 하기", need: [["두 번", ["twice"]]], hint: ["My membership fee came out ~ this month.", "My membership fee came out twice…", "My membership fee came out twice this month."], model: "My membership fee came out twice this month." },
        { say: "Oh no, let me check. Hmm, you're right, two payments on the first.", want: "은행 내역을 보여 주겠다고 하기", need: [["내역", ["statement"]]], hint: ["I can show you my bank ~.", "I can show you my bank state…", "I can show you my bank statement."], model: "I can show you my bank statement." },
        { say: "That's okay, I believe you. It looks like a system glitch.", want: "추가로 나간 돈을 돌려받을 수 있는지 묻기", need: [["돌려받", ["back"]]], hint: ["Can I get the extra payment ~?", "Can I get the extra payment…", "Can I get the extra payment back?"], model: "Can I get the extra payment back?" },
        { say: "Yes, I'll process it now. It takes three to five days to show up.", want: "괜찮다며 확인 메일을 보내 달라고 하기", need: [["확인", ["confirmation"]]], hint: ["That's fine. Could you email me a ~?", "That's fine. Could you email me a confirmation…", "That's fine. Could you email me a confirmation?"], model: "That's fine. Could you email me a confirmation?" },
        { say: "Sure. Sorry about that. Here's a free guest pass for the trouble.", want: "고맙다며 친구와 같이 오겠다고 하기", need: [["친구", ["friend"]]], hint: ["That's kind of you. I'll bring a ~.", "That's kind of you. I'll bring a friend…", "That's kind of you. I'll bring a friend."], model: "That's kind of you. I'll bring a friend.", chunk: ["for the trouble", "불편을 드린 보상으로", "사과의 뜻으로 뭔가 줄 때 써요."] }
      ],
      overhear: [
        ["guest", "Is the sauna working today?"],
        ["them", "I'm afraid it's out of order.", [["out of order", "고장 났어요", "기계·화장실이 고장 났을 때 써요."]]],
        ["guest", "Again? That's the third time."],
        ["them", "Sorry. It should be fixed by Friday."]
      ] }]
  ]],
  ["환불 요청", [
    ["11:00", "지퍼가 고장 난 재킷", "shop", {
      who: "Mia", whoKo: "옷 가게 점원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi again! How's the jacket?", want: "지퍼가 고장 나서 반품하고 싶다고 하기", need: [["지퍼", ["zipper"]]], hint: ["Actually, the ~ broke, so I'd like to return it.", "Actually, the zipper…", "Actually, the zipper broke, so I'd like to return it."], model: "Actually, the zipper broke, so I'd like to return it." },
        { say: "Oh no, I'm sorry. Do you have the receipt?", want: "영수증을 보여 주며 겨우 2주 입었다고 하기", need: [["영수증", ["receipt"]]], hint: ["Yes, here's the ~. I've only had it two weeks.", "Yes, here's the receipt…", "Yes, here's the receipt. I've only had it two weeks."], model: "Yes, here's the receipt. I've only had it two weeks.", chunk: ["only had it", "겨우 ~ 썼어요", "오래 안 쓴 물건을 말할 때 써요."] },
        { say: "It's within our thirty-day policy. Would you like a refund or an exchange?", want: "환불이 좋다고, 같은 걸 받아도 또 망가질 것 같다고 하기", need: [["환불", ["refund"]]], hint: ["I'd prefer a ~. The same one might break again.", "I'd prefer a refund…", "I'd prefer a refund. The same one might break again."], model: "I'd prefer a refund. The same one might break again." },
        { say: "Sure. It'll go back to your original card. Can I see it?", want: "카드를 건네며 돈이 언제 들어오는지 묻기", need: [["언제", ["when"]]], hint: ["Here you go. ~ will the money show up?", "Here you go. When will…", "Here you go. When will the money show up?"], model: "Here you go. When will the money show up?", chunk: ["show up", "(계좌에) 들어오다", "돈이 확인될 때 써요."] },
        { say: "Within a few days. Here's your receipt.", want: "고맙다며 잠깐 둘러봐도 되는지 묻기", need: [["둘러", ["look around", "browse"]]], hint: ["Thanks. Do you mind if I ~ a bit?", "Thanks. Do you mind if I look around…", "Thanks. Do you mind if I look around a bit?"], model: "Thanks. Do you mind if I look around a bit?" }
      ],
      overhear: [
        ["guest", "Can I return this without the tag?"],
        ["them", "I'm afraid we need the tag for a refund."],
        ["guest", "Oh, I think I threw it away."],
        ["them", "I can offer you store credit instead.", [["store credit", "상점 적립금", "환불 대신 그 가게에서 쓸 수 있는 돈이에요."]]]
      ] }],
    ["14:00", "잘못 나온 버거", "wrong", {
      who: "Kevin", whoKo: "버거 식당 직원", voices: { them: "m", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Is everything okay with your meal?", want: "치즈버거를 시켰는데 이건 치킨이라고 하기", need: [["치킨", ["chicken"]]], hint: ["Actually, I ordered a cheeseburger, but this is ~.", "Actually, I ordered a cheeseburger, but this…", "Actually, I ordered a cheeseburger, but this is chicken."], model: "Actually, I ordered a cheeseburger, but this is chicken." },
        { say: "Oh, really? Let me check the ticket. You're right, I'm sorry.", want: "맞는 걸로 바꿔 줄 수 있는지 묻기", need: [["바꿔", ["replace"]]], hint: ["Could you ~ it with the right one?", "Could you replace…", "Could you replace it with the right one?"], model: "Could you replace it with the right one?" },
        { say: "Of course. It'll be about ten minutes. Is that okay?", want: "좀 길다, 15분 뒤에 수업이 있다고 하기", need: [["수업", ["class"]]], hint: ["That's a bit long. I have ~ in fifteen minutes.", "That's a bit long. I have class…", "That's a bit long. I have class in fifteen minutes."], model: "That's a bit long. I have class in fifteen minutes." },
        { say: "I understand. I could refund you, or pack it to go.", want: "차라리 돈을 돌려받겠다고 하기", need: [["돌려", ["money back"]]], hint: ["I'd rather get my ~, please.", "I'd rather get my money…", "I'd rather get my money back, please."], model: "I'd rather get my money back, please.", chunk: ["I'd rather", "차라리 ~하고 싶어요", "더 나은 쪽을 고를 때 써요."] },
        { say: "No problem. Here's your cash. Sorry again.", want: "괜찮지만 다음엔 꼭 확인해 달라고 하기", need: [["다음", ["next time"]]], hint: ["That's okay, but please double-check ~.", "That's okay, but please double-check next…", "That's okay, but please double-check next time."], model: "That's okay, but please double-check next time." }
      ],
      overhear: [
        ["guest", "Excuse me, this burger is cold."],
        ["them", "I'm so sorry. I'll get you a fresh one."],
        ["guest", "Thanks. And can I get extra napkins?"],
        ["them", "Right away.", [["Right away", "바로 갖다 드릴게요", "요청을 바로 처리하겠다는 말이에요."]]]
      ] }],
    ["18:30", "취소된 영화표", "movie", {
      who: "Ava", whoKo: "매표소 직원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Can I help you?", want: "어제 상영이 취소됐는데 어떻게 하면 되냐고 묻기", need: [["취소", ["canceled", "cancelled"]]], hint: ["Yesterday's show was ~. What are my options?", "Yesterday's show was canceled…", "Yesterday's show was canceled. What are my options?"], model: "Yesterday's show was canceled. What are my options?", chunk: ["What are my options", "어떤 방법이 있나요", "해결책을 물을 때 써요."] },
        { say: "I'm so sorry about that. You can get your money back or switch to another showing.", want: "내일 8시 상영으로 바꾸고 싶다고 하기", need: [["바꾸", ["switch", "change"]], ["내일", ["tomorrow"]]], hint: ["I'd like to ~ to tomorrow at eight.", "I'd like to switch…", "I'd like to switch to tomorrow at eight."], model: "I'd like to switch to tomorrow at eight." },
        { say: "Tomorrow at eight has seats in row G. Is that okay?", want: "더 앞쪽 자리는 없는지 묻기", need: [["앞", ["front", "closer"]]], hint: ["Is there anything closer to the ~?", "Is there anything closer…", "Is there anything closer to the front?"], model: "Is there anything closer to the front?" },
        { say: "Row D, seats 5 and 6. Do you need both?", want: "둘 다 필요하다며 가격 차이가 있는지 묻기", need: [["차이", ["difference"]]], hint: ["Yes, both. Is there any price ~?", "Yes, both. Is there any price differ…", "Yes, both. Is there any price difference?"], model: "Yes, both. Is there any price difference?" },
        { say: "No difference. And since we canceled, here's a free popcorn coupon.", want: "정말 배려심 있다며 고맙다고 하기", need: [["배려", ["thoughtful"]]], hint: ["That's so ~. Thank you!", "That's so thoughtful…", "That's so thoughtful. Thank you!"], model: "That's so thoughtful. Thank you!" }
      ],
      overhear: [
        ["guest", "I'd like two tickets for the seven o'clock."],
        ["them", "I'm afraid that one is sold out."],
        ["guest", "What about eight thirty?"],
        ["them", "Yes, there are a few seats left."]
      ] }]
  ]],
  ["소음 문제", [
    ["09:00", "귀마개 사기", "pharmacy", {
      who: "Grace", whoKo: "약사", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Good morning! You look tired.", want: "윗집이 너무 시끄러워서 잠을 못 잤다고 하기", need: [["못 잠", ["couldn't sleep", "didn't sleep"]]], hint: ["I ~ last night. My upstairs neighbor was so loud.", "I couldn't sleep…", "I couldn't sleep last night. My upstairs neighbor was so loud."], model: "I couldn't sleep last night. My upstairs neighbor was so loud.", chunk: ["couldn't sleep", "잠을 못 잤어요", "couldn't는 그때 못 했다는 뜻이에요."] },
        { say: "That's rough. Would earplugs help?", want: "네, 귀마개가 있는지 묻기", need: [["귀마개", ["earplugs"]]], hint: ["Yes, do you have any ~?", "Yes, do you have any ear…", "Yes, do you have any earplugs?"], model: "Yes, do you have any earplugs?" },
        { say: "Sure, aisle two. Foam or silicone?", want: "더 편하니까 폼으로 달라고 하기", need: [["폼", ["foam"]]], hint: ["~, please. They're more comfortable.", "Foam, please…", "Foam, please. They're more comfortable."], model: "Foam, please. They're more comfortable." },
        { say: "Good choice. Anything for headaches?", want: "두통은 없고 이거면 충분하다고 하기", need: [["충분", ["enough"]]], hint: ["No headache, but this should be ~.", "No headache, but this should be enough…", "No headache, but this should be enough."], model: "No headache, but this should be enough." },
        { say: "Okay. Nine dollars. I hope you sleep better tonight.", want: "고맙다며 오늘 이웃과 이야기해 보겠다고 하기", need: [["이야기", ["talk", "speak"]]], hint: ["Thanks. I'll ~ to my neighbor today.", "Thanks. I'll talk…", "Thanks. I'll talk to my neighbor today."], model: "Thanks. I'll talk to my neighbor today." }
      ],
      overhear: [
        ["guest", "Do you have something for a sore throat?", [["sore throat", "목이 아픈 증상", "목감기·염증으로 아플 때 써요."]]],
        ["them", "Try these throat drops. They work fast."],
        ["guest", "How often can I take them?"],
        ["them", "Every four hours."]
      ] }],
    ["12:00", "옆집과 소음 이야기", "neighbor", {
      who: "Mrs. Green", whoKo: "옆집 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 이웃",
      turns: [
        { say: "Hello, dear. Are you alright? You look pale.", want: "거의 못 잤다며 어젯밤 소음을 들으셨는지 묻기", need: [["들으셨", ["hear", "heard"]]], hint: ["I barely slept. Did you ~ the noise last night?", "I barely slept. Did you hear…", "I barely slept. Did you hear the noise last night?"], model: "I barely slept. Did you hear the noise last night?" },
        { say: "The music? Yes, until after midnight. I didn't want to complain.", want: "긴장되지만 직접 이야기해 봐야겠다고 하기", need: [["이야기", ["talk"]]], hint: ["I'm nervous, but I should ~ to him.", "I'm nervous, but I should talk…", "I'm nervous, but I should talk to him."], model: "I'm nervous, but I should talk to him." },
        { say: "That's wise. He seems like a nice boy. Maybe he doesn't realize.", want: "맞다며 정중하게 부탁해 보겠다고 하기", need: [["정중", ["politely"]]], hint: ["You're right. I'll ask him ~.", "You're right. I'll ask him polite…", "You're right. I'll ask him politely."], model: "You're right. I'll ask him politely." },
        { say: "Good. And if that doesn't work, tell Mr. Patel.", want: "이 건물에 조용히 해야 하는 시간이 있는지 묻기", need: [["조용한 시간", ["quiet hours"]]], hint: ["Does the building have ~?", "Does the building have quiet…", "Does the building have quiet hours?"], model: "Does the building have quiet hours?" },
        { say: "After ten at night, I believe. It's in the lease.", want: "계약서를 확인하겠다며 알려 줘서 고맙다고 하기", need: [["계약서", ["lease"]]], hint: ["I'll check the ~. Thanks for telling me.", "I'll check the lease…", "I'll check the lease. Thanks for telling me."], model: "I'll check the lease. Thanks for telling me." }
      ],
      overhear: [
        ["them", "Did you hear that thump this morning?", [["thump", "쿵 하는 소리", "무거운 게 떨어지는 소리예요."]]],
        ["guest", "Yes! It shook my ceiling."],
        ["them", "Someone must be moving furniture."],
        ["guest", "At seven a.m.? Unbelievable."]
      ] }],
    ["18:00", "위층에 정중하게 말하기", "upstairs", {
      who: "Jake", whoKo: "위층 이웃", voices: { them: "m", guest: "m2" }, guestKo: "방 안의 친구",
      turns: [
        { say: "Oh, hi! Um, can I help you?", want: "아래층에 산다고 소개하며 잠깐 시간 되는지 묻기", need: [["아래층", ["downstairs"]], ["잠깐", ["a minute", "a moment"]]], hint: ["Hi, I'm {name}, from ~. Do you have a minute?", "Hi, I'm {name}, from downstairs…", "Hi, I'm {name}, from downstairs. Do you have a minute?"], model: "Hi, I'm {name}, from downstairs. Do you have a minute?" },
        { say: "Sure. What's up?", want: "죄송하지만 어젯밤 음악이 꽤 컸다고 하기", need: [["음악", ["music"]], ["크게", ["loud"]]], hint: ["I'm afraid the ~ was pretty loud last night.", "I'm afraid the music…", "I'm afraid the music was pretty loud last night."], model: "I'm afraid the music was pretty loud last night.", chunk: ["pretty loud", "꽤 시끄러운", "pretty는 '꽤'라는 뜻이에요."] },
        { say: "Oh no, really? I'm so sorry. I had the speakers on.", want: "밤 10시 이후에는 줄여 줄 수 있는지 묻기", need: [["줄여", ["turn it down", "keep it down", "turn down", "lower"]]], hint: ["Could you ~ after ten?", "Could you turn it…", "Could you turn it down after ten?"], model: "Could you turn it down after ten?", chunk: ["keep it down", "조용히 해 주세요", "소리를 줄여 달라고 부탁할 때 써요."] },
        { say: "Of course. I'll use headphones at night.", want: "이해해 줘서 고맙다고 하기", need: [["이해", ["understanding", "understand"]]], hint: ["Thank you for being so ~.", "Thank you for being so understanding…", "Thank you for being so understanding."], model: "Thank you for being so understanding." },
        { say: "No problem. Sorry about the thumping, too. I was moving my desk.", want: "괜찮다며 복도에서 가끔 인사하자고 하기", need: [["인사", ["say hi", "say hello"]]], hint: ["That's all right. Let's ~ in the hallway sometime.", "That's all right. Let's say hi…", "That's all right. Let's say hi in the hallway sometime."], model: "That's all right. Let's say hi in the hallway sometime." }
      ],
      overhear: [
        ["them", "Hold on, let me turn this down.", [["Hold on", "잠깐만요", "잠깐 기다려 달라고 할 때 써요."]]],
        ["guest", "Dude, you're loud."],
        ["them", "Sorry, I'll put my headphones on."],
        ["guest", "Thanks, man."]
      ] }]
  ]],
  ["집주인과 통화", [
    ["09:30", "집주인에게 전화", "landlord", {
      who: "Mr. Patel", whoKo: "집주인", voices: { them: "m", guest: "f2" }, guestKo: "다른 세입자",
      turns: [
        { say: "Hello, this is Mr. Patel.", want: "인사하고 현관 자물쇠가 고장 나서 전화했다고 하기", need: [["자물쇠", ["lock"]], ["고장", ["broken", "not working"]]], hint: ["Hello, Mr. Patel. I'm calling because the front door ~ is broken.", "Hello, Mr. Patel. I'm calling because the front door lock…", "Hello, Mr. Patel. I'm calling because the front door lock is broken."], model: "Hello, Mr. Patel. I'm calling because the front door lock is broken.", chunk: ["I'm calling because", "~ 때문에 전화드려요", "전화 용건을 밝힐 때 써요."] },
        { say: "Hmm. Since when?", want: "일주일쯤 됐고 문이 제대로 안 잠긴다고 하기", need: [["안 잠", ["won't lock", "doesn't lock", "not locking"]]], hint: ["About a week. The door ~ properly.", "About a week. The door won't…", "About a week. The door won't lock properly."], model: "About a week. The door won't lock properly." },
        { say: "That's not good. Anyone could walk in. Why didn't you tell me earlier?", want: "문제가 많아서 방해하기 싫었다고 하기", need: [["방해", ["bother"]]], hint: ["I didn't want to ~ you with so many problems.", "I didn't want to bother…", "I didn't want to bother you with so many problems."], model: "I didn't want to bother you with so many problems." },
        { say: "It's no bother. It's my job. I'll send someone tomorrow morning. Is that soon enough?", want: "가능하면 오늘 올 수 있는지, 그래야 안심된다고 하기", need: [["가능하면", ["if possible"]], ["오늘", ["today"]]], hint: ["~, could someone come today? I'd feel safer.", "If possible, could someone come…", "If possible, could someone come today? I'd feel safer."], model: "If possible, could someone come today? I'd feel safer.", chunk: ["If possible", "가능하다면", "정중하게 부탁할 때 써요."] },
        { say: "Alright. I'll call a locksmith now and text you the time.", want: "고맙다며 문자를 기다리겠다고 하기", need: [["기다리", ["wait"]]], hint: ["Thank you. I'll ~ for your text.", "Thank you. I'll wait…", "Thank you. I'll wait for your text."], model: "Thank you. I'll wait for your text." }
      ],
      overhear: [
        ["guest", "Mr. Patel, my key got stuck in the lock."],
        ["them", "Don't force it. I'll be there in ten minutes.", [["Don't force it", "억지로 하지 마세요", "열쇠·문이 안 움직일 때 써요."]]],
        ["guest", "Thank you, I'll wait outside."],
        ["them", "Please do."]
      ] }],
    ["13:00", "집주인에게 보낼 메일", "team", {
      who: "Noah", whoKo: "어학원 친구", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Hey! You wanted help with an email?", want: "집주인에게 보낼 메일을 한번 봐 달라고 하기", need: [["봐 달라", ["look over", "check", "proofread"]]], hint: ["Yes, could you ~ my email to my landlord?", "Yes, could you look over…", "Yes, could you look over my email to my landlord?"], model: "Yes, could you look over my email to my landlord?" },
        { say: "Sure. Hmm, 'I want to say you the noise is bad.' That's a little rough.", want: "너무 직설적으로 들리냐고 묻기", need: [["직설", ["blunt", "direct", "rude"]]], hint: ["Does it sound too ~?", "Does it sound too blunt…", "Does it sound too blunt?"], model: "Does it sound too blunt?", chunk: ["blunt", "직설적인", "돌려 말하지 않고 거칠게 말하는 걸 뜻해요."] },
        { say: "A little. Try something softer, like 'I wanted to let you know…'", want: "'I'm writing to let you know'로 시작하면 어떠냐고 하기", need: [["쓰는 중", ["writing"]]], hint: ["How about starting with 'I'm ~ to let you know'?", "How about starting with 'I'm writing…", "How about starting with 'I'm writing to let you know'?"], model: "How about starting with 'I'm writing to let you know'?" },
        { say: "Perfect. And end with a clear request, like 'Could you look into it?'", want: "금요일까지 답을 달라고 쓸지 묻기", need: [["금요일", ["friday"]]], hint: ["Should I ask for a reply by ~?", "Should I ask for a reply by Fri…", "Should I ask for a reply by Friday?"], model: "Should I ask for a reply by Friday?" },
        { say: "Sure, a polite deadline is fine. You write well!", want: "도와줘서 고맙다며 커피를 사겠다고 하기", need: [["커피", ["coffee"]]], hint: ["Thanks a lot, Noah. I'll buy you ~.", "Thanks a lot, Noah. I'll buy you cof…", "Thanks a lot, Noah. I'll buy you coffee."], model: "Thanks a lot, Noah. I'll buy you coffee." }
      ],
      overhear: [
        ["them", "Did you finish the homework?"],
        ["guest", "Almost. I'm stuck on number four.", [["stuck on", "~에서 막히다", "문제가 풀리지 않을 때 써요."]]],
        ["them", "Same here. Want to compare answers?"],
        ["guest", "Sure, let's do it."]
      ] }],
    ["17:00", "계약서 내용 확인", "agent", {
      who: "Linda", whoKo: "부동산 중개인", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi, it's Linda. How are things in the new place?", want: "대체로 좋지만 문제가 몇 가지 있었다고 하기", need: [["문제", ["problems", "issues"]]], hint: ["Mostly good, but I've had a few ~.", "Mostly good, but I've had a few prob…", "Mostly good, but I've had a few problems."], model: "Mostly good, but I've had a few problems." },
        { say: "Oh? Tell me.", want: "계약서상 수리는 누가 책임지는지 묻기", need: [["책임", ["responsible"]]], hint: ["Who is ~ for repairs under the lease?", "Who is responsible…", "Who is responsible for repairs under the lease?"], model: "Who is responsible for repairs under the lease?" },
        { say: "The landlord, unless you caused the damage. It's in section six.", want: "그 부분을 사진으로 보내 줄 수 있는지 묻기", need: [["보내", ["send"]]], hint: ["Could you ~ me a photo of that section?", "Could you send…", "Could you send me a photo of that section?"], model: "Could you send me a photo of that section?" },
        { say: "Sure, I'll email it in a minute. Is the landlord being slow?", want: "아니, 빠르지만 서면으로 남기고 싶다고 하기", need: [["서면", ["in writing"]]], hint: ["No, he's quick, but I want it ~.", "No, he's quick, but I want it in…", "No, he's quick, but I want it in writing."], model: "No, he's quick, but I want it in writing.", chunk: ["in writing", "서면으로", "말이 아니라 글로 남길 때 써요."] },
        { say: "Smart. Keep copies of everything. Anything else?", want: "없다며 챙겨 줘서 고맙다고 하기", need: [["챙겨", ["looking out"]]], hint: ["No, thanks for ~ for me.", "No, thanks for looking…", "No, thanks for looking out for me."], model: "No, thanks for looking out for me." }
      ],
      overhear: [
        ["guest", "Linda, can I sublet my room for the summer?", [["sublet", "다시 세를 놓다", "빌린 방을 다른 사람에게 빌려줄 때 써요."]]],
        ["them", "You'd need written permission from the landlord."],
        ["guest", "How long does that take?"],
        ["them", "Usually a few days."]
      ] }]
  ]],
  ["해결된 날", [
    ["10:00", "집주인 점검 방문", "landlord", {
      who: "Mr. Patel", whoKo: "집주인", voices: { them: "m", guest: "f2" }, guestKo: "다른 세입자",
      turns: [
        { say: "Good morning! The locksmith finished yesterday. Does the door work now?", want: "네, 잘 잠겨서 훨씬 안심된다고 하기", need: [["잠긴다", ["locks"]]], hint: ["Yes, it ~ perfectly now. I feel much safer.", "Yes, it locks…", "Yes, it locks perfectly now. I feel much safer."], model: "Yes, it locks perfectly now. I feel much safer." },
        { say: "Good. And how are things with the upstairs neighbor?", want: "이야기를 나눴고 이제 훨씬 조용하다고 하기", need: [["조용", ["quieter", "quiet"]]], hint: ["We talked, and now it's much ~.", "We talked, and now it's much quiet…", "We talked, and now it's much quieter."], model: "We talked, and now it's much quieter." },
        { say: "Excellent. I like tenants who talk things through. Any other issues?", want: "없다며 이제 다 해결됐다고 하기", need: [["해결", ["sorted"]]], hint: ["No, everything is ~ out now.", "No, everything is sorted…", "No, everything is sorted out now."], model: "No, everything is sorted out now.", chunk: ["sorted out", "해결됐어요", "문제가 정리됐을 때 써요."] },
        { say: "Wonderful. You've been a very patient tenant.", want: "고맙다며 집주인이 늘 빨리 반응해 줬다고 하기", need: [["빨리 반응", ["responsive"]]], hint: ["Thank you. You've been very ~.", "Thank you. You've been very respons…", "Thank you. You've been very responsive."], model: "Thank you. You've been very responsive." },
        { say: "I appreciate that. Next month I'll be repainting the hallway. Any concerns?", want: "전혀 없다며 미리 알려 달라고 하기", need: [["미리", ["heads up"]]], hint: ["Not at all. Just give me a ~.", "Not at all. Just give me a heads…", "Not at all. Just give me a heads up."], model: "Not at all. Just give me a heads up.", chunk: ["a heads up", "미리 알림", "미리 알려 달라고 할 때 써요."] }
      ],
      overhear: [
        ["guest", "Mr. Patel, thanks for fixing my window."],
        ["them", "Of course. Any other repairs?"],
        ["guest", "No, we're all set.", [["all set", "다 됐어요", "더 필요한 게 없다는 뜻이에요."]]],
        ["them", "Good. Enjoy your day."]
      ] }],
    ["14:00", "위층에서 쿠키를", "upstairs", {
      who: "Jake", whoKo: "위층 이웃", voices: { them: "m", guest: "m2" }, guestKo: "방 안의 친구",
      turns: [
        { say: "Hey! I'm glad you came. I wanted to say sorry again.", want: "괜찮다며 어젯밤은 정말 조용했다고 하기", need: [["조용", ["quiet"]]], hint: ["That's all right. Last night was really ~.", "That's all right. Last night was really qui…", "That's all right. Last night was really quiet."], model: "That's all right. Last night was really quiet." },
        { say: "Good! I bought a thick rug to muffle the noise. Want to see?", want: "정말 세심하다고 감탄하기", need: [["세심", ["considerate"]]], hint: ["That's really ~ of you.", "That's really consider…", "That's really considerate of you."], model: "That's really considerate of you." },
        { say: "Come in for a sec. Check it out. It's super soft.", want: "푹신하다며 이제 아래서는 안 들릴 것 같다고 하기", need: [["안 들릴", ["won't hear"]]], hint: ["It's so soft. I probably ~ anything now.", "It's so soft. I probably won't hear…", "It's so soft. I probably won't hear anything now."], model: "It's so soft. I probably won't hear anything now." },
        { say: "I also play guitar. Is it okay if I play unplugged sometimes? Quietly.", want: "낮에는 괜찮지만 밤늦게는 안 된다고 하기", need: [["낮", ["during the day", "daytime"]]], hint: ["That's fine ~, just not late at night.", "That's fine during…", "That's fine during the day, just not late at night."], model: "That's fine during the day, just not late at night." },
        { say: "Deal! Hey, want a cookie? I baked too many.", want: "그럼 하나 먹어 보겠다며 냄새가 좋다고 하기", need: [["하나", ["one"]]], hint: ["Sure, I'll try ~. They smell great.", "Sure, I'll try one…", "Sure, I'll try one. They smell great."], model: "Sure, I'll try one. They smell great." }
      ],
      overhear: [
        ["guest", "Is that the downstairs neighbor?"],
        ["them", "Yeah, they're really nice."],
        ["guest", "Invite them in!"],
        ["them", "I just did."]
      ] }],
    ["18:00", "문제 다 해결 파티", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Look who's smiling! Good news?", want: "집 문제가 드디어 다 해결됐다고 하기", need: [["해결", ["solved"]]], hint: ["Yes! All my apartment problems are finally ~.", "Yes! All my apartment problems are finally sol…", "Yes! All my apartment problems are finally solved."], model: "Yes! All my apartment problems are finally solved." },
        { say: "Seriously? The sink, the package, the noise? All of it?", want: "현관 자물쇠까지 전부 다라고 하기", need: [["전부", ["all of it"]]], hint: ["~! Even the front door lock.", "All of it…", "All of it! Even the front door lock."], model: "All of it! Even the front door lock." },
        { say: "You handled everything so well. I would've lost my temper!", want: "나도 화났지만 침착하게 말하니 도움이 됐다고 하기", need: [["침착", ["calm"]]], hint: ["I was upset too, but staying ~ really helps.", "I was upset too, but staying calm…", "I was upset too, but staying calm really helps."], model: "I was upset too, but staying calm really helps.", chunk: ["lose my temper", "화를 참지 못하다", "순간 버럭 화낼 때 써요."] },
        { say: "True. Let's celebrate! Dinner's on me.", want: "아니, 이번엔 내가 사겠다고 하기", need: [["내가 삼", ["my treat"]]], hint: ["No, it's my ~ this time.", "No, it's my treat…", "No, it's my treat this time."], model: "No, it's my treat this time.", chunk: ["my treat", "제가 살게요", "내가 대접한다는 말이에요."] },
        { say: "Okay, okay. You win. What are you in the mood for?", want: "피자가 당긴다고 하기", need: [["당김", ["in the mood for"]]], hint: ["I'm ~ pizza.", "I'm in the mood…", "I'm in the mood for pizza."], model: "I'm in the mood for pizza.", chunk: ["in the mood for", "~가 당기네요", "먹고 싶은 것을 말할 때 써요."] }
      ],
      overhear: [
        ["guest", "Cheers to the new apartment!", [["Cheers", "건배", "잔을 부딪칠 때 써요."]]],
        ["them", "To a quiet building!"],
        ["guest", "And to good neighbors."],
        ["them", "I'll drink to that.", [["I'll drink to that", "저도 동감이에요", "건배하며 동의할 때 써요."]]]
      ] }]
  ]]
]);
