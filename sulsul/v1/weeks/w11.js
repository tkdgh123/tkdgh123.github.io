// 11주째 · 도시 탐험 (71~77일째). 박물관·미술관·투어·동물원·야경·유람선까지, 이 도시의 구석구석을 돌아다니며 묻고 답한다.
// 장면 = [시간, 이름, 그림 id, 대본]. 그림 id가 week.js ART에 들어오면 열린다. 형식은 ~/sulsul-art/YEAR.md
WEEK(11, [
  ["박물관", [
    ["10:00", "박물관 표 사기", "museum", {
      who: "Harper", whoKo: "박물관 매표 직원", voices: { them: "f", guest: "m" }, guestKo: "다음 관광객",
      turns: [
        { say: "Hi there! Welcome to the City Museum. How many tickets?", want: "학생 표 한 장 달라고 하기", need: [["학생", ["student"]], ["한 장", ["one", "a ticket"]]], hint: ["One ~ ticket, please.", "One student…", "One student ticket, please."], model: "One student ticket, please." },
        { say: "Sure. That's ten dollars. Do you have a student ID?", want: "네, 어학원 학생증을 보여 주기", need: [["학생증", ["id", "student card", "school card"]]], hint: ["Yes, here's my school ~.", "Yes, here's my…", "Yes, here's my school ID."], model: "Yes, here's my school ID." },
        { say: "Perfect. There's also a special exhibit on ancient coins. It's five dollars more.", want: "그것도 추가하겠다고 하기", need: [["추가", ["add"]], ["특별 전시", ["special exhibit", "special", "coin exhibit", "coins"]]], hint: ["Sure, I'll ~ the special exhibit.", "Sure, I'll add…", "Sure, I'll add the special exhibit."], model: "Sure, I'll add the special exhibit.", chunk: ["I'll add ~", "~도 추가할게요", "주문이나 표에 더할 때 add를 써요."] },
        { say: "Great. Would you like an audio guide? They're three dollars.", want: "한국어 오디오 가이드가 있는지 묻기", need: [["한국어", ["korean"]], ["오디오 가이드", ["audio guide", "audio guides"]]], hint: ["Do you have an ~ guide in Korean?", "Do you have an audio…", "Do you have an audio guide in Korean?"], model: "Do you have an audio guide in Korean?" },
        { say: "We do! Here you go. The museum closes at five, so enjoy!", want: "고맙다고, 가방 맡길 곳이 어디인지 묻기", need: [["가방 맡기기", ["leave my bag", "coat check", "check my bag", "locker", "leave my backpack", "leave my coat"]]], hint: ["Thanks! Where can I ~ my bag?", "Thanks! Where can I leave…", "Thanks! Where can I leave my bag?"], model: "Thanks! Where can I leave my bag?" }
      ],
      overhear: [
        ["guest", "Is the museum free on Sundays?", [["free on Sundays", "일요일에 무료", "요일 앞에는 on을 붙여요."]]],
        ["them", "Only the first Sunday of the month. Otherwise it's twelve dollars."],
        ["guest", "Can I take photos inside?", [["take photos", "사진 찍다", "전시관 규칙을 물을 때 써요."]]],
        ["them", "Yes, but no flash, please.", [["no flash", "플래시 금지", "박물관·공연장 규칙이에요."]]]
      ] }],
    ["13:00", "박물관 기념품 가게", "souvenir", {
      who: "Hannah", whoKo: "기념품 가게 점원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Let me know if you need any help.", want: "가족에게 줄 작은 선물을 찾는다고 하기", need: [["선물", ["gift", "present", "souvenir"]]], hint: ["I'm looking for a small ~ for my family.", "I'm looking for a small gift…", "I'm looking for a small gift for my family."], model: "I'm looking for a small gift for my family." },
        { say: "How about these postcards? They're our best sellers.", want: "한 묶음에 얼마인지 묻기", need: [["얼마", ["how much"]]], hint: ["~ is a pack of postcards?", "How much is…", "How much is a pack of postcards?"], model: "How much is a pack of postcards?", chunk: ["a pack of ~", "한 묶음의 ~", "같은 물건이 여러 개 들어 있는 한 묶음이에요."] },
        { say: "A pack of ten is eight dollars. We also have these mugs.", want: "그 머그컵이 파란색도 있는지 묻기", need: [["파란색", ["blue"]]], hint: ["Do you have this mug in ~?", "Do you have this mug…", "Do you have this mug in blue?"], model: "Do you have this mug in blue?" },
        { say: "Let me check the back. Oh, yes, here's a blue one!", want: "컵 하나랑 엽서 한 묶음 사겠다고 하기", need: [["살게요", ["i'll take", "i'll get", "i'll buy"]]], hint: ["Perfect. I'll ~ the mug and one pack of postcards.", "Perfect. I'll take…", "Perfect. I'll take the mug and one pack of postcards."], model: "Perfect. I'll take the mug and one pack of postcards." },
        { say: "Would you like a gift bag for those?", want: "네, 가격표는 떼 달라고 하기", need: [["가격표", ["price tag", "price tags", "price"]]], hint: ["Yes, please. Can you take off the ~ tags?", "Yes, please. Can you take off…", "Yes, please. Can you take off the price tags?"], model: "Yes, please. Can you take off the price tags?" }
      ],
      overhear: [
        ["guest", "Do you ship internationally?", [["ship internationally", "해외로 배송하다", "ship은 물건을 보낸다는 뜻이에요."]]],
        ["them", "Yes, it takes about two weeks."],
        ["guest", "Could you gift wrap this?", [["gift wrap", "선물 포장하다", "포장 서비스를 부탁할 때 써요."]]],
        ["them", "Sure. It's two dollars extra."]
      ] }],
    ["16:00", "벤치에서 Yuki와 감상 나누기", "yuki", {
      who: "Yuki", whoKo: "어학원 친구", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 학생",
      turns: [
        { say: "Hi! How was the museum?", want: "좋았다고, 옛날 동전이 제일 마음에 들었다고 하기", need: [["제일", ["favorite", "best", "favourite"]]], hint: ["It was great! The ancient coins were my ~.", "It was great! The ancient coins were…", "It was great! The ancient coins were my favorite."], model: "It was great! The ancient coins were my favorite." },
        { say: "Oh, I love coins too. Did you take pictures?", want: "몇 장밖에 못 찍었다고, 플래시가 금지라고 하기", need: [["몇 장", ["a few", "few", "only a few"]]], hint: ["Only a ~. They don't allow flash.", "Only a few…", "Only a few. They don't allow flash."], model: "Only a few. They don't allow flash." },
        { say: "I want to go this weekend. Is it crowded?", want: "평일 오전에는 덜 붐빈다고 알려 주기", need: [["덜 붐빔", ["less crowded", "not crowded", "not too crowded", "quiet", "empty"]]], hint: ["It's ~ crowded on weekday mornings.", "It's less…", "It's less crowded on weekday mornings."], model: "It's less crowded on weekday mornings." },
        { say: "Good tip! Do you want to go together next time?", want: "좋다고, 재미있겠다고 하기", need: [["재미있겠다", ["sounds like fun", "sounds fun", "sounds great", "sounds good", "love to"]]], hint: ["Sure, that ~ like fun!", "Sure, that sounds…", "Sure, that sounds like fun!"], model: "Sure, that sounds like fun!", chunk: ["That sounds like fun", "재미있겠다", "제안을 듣고 반응할 때 써요."] },
        { say: "Great! I'll text you the time tonight.", want: "너무 기대된다고 하기", need: [["기대", ["can't wait", "looking forward", "excited"]]], hint: ["Okay, I ~ wait!", "Okay, I can't…", "Okay, I can't wait!"], model: "Okay, I can't wait!" }
      ],
      overhear: [
        ["guest", "Is anyone sitting here?"],
        ["them", "No, go ahead.", [["go ahead", "그러세요", "허락할 때 짧게 써요."]]],
        ["guest", "Thanks. It's such a nice afternoon."],
        ["them", "It really is. I could stay out here all day.", [["stay out here", "여기 밖에 있다", "야외에서 오래 머물고 싶다는 말이에요."]]]
      ] }]
  ]],
  ["미술관", [
    ["10:30", "미술관 안내", "gallery", {
      who: "Felix", whoKo: "미술관 안내원", voices: { them: "m", guest: "f" }, guestKo: "다른 관람객",
      turns: [
        { say: "Welcome to the Art Gallery. Let me know if you have any questions.", want: "오늘 어떤 전시들이 있는지 묻기", need: [["전시", ["exhibit", "exhibits", "exhibition", "exhibitions", "shows"]]], hint: ["What ~ are on today?", "What exhibits…", "What exhibits are on today?"], model: "What exhibits are on today?", chunk: ["What ~ are on today?", "오늘 ~ 뭐 해요?", "행사·전시 일정을 물을 때 써요."] },
        { say: "We have modern paintings upstairs and photography on the first floor.", want: "사진 전시부터 보겠다고 하기", need: [["시작", ["start with", "begin with", "start"]]], hint: ["I'll ~ with the photography.", "I'll start…", "I'll start with the photography."], model: "I'll start with the photography." },
        { say: "Good choice. Please keep your voice down in the halls.", want: "알겠다고, 작품을 만져도 되는지 묻기", need: [["만져도", ["touch"]]], hint: ["Of course. Is it okay to ~ the artwork?", "Of course. Is it okay to touch…", "Of course. Is it okay to touch the artwork?"], model: "Of course. Is it okay to touch the artwork?" },
        { say: "Please don't touch anything. But you can sit on the benches.", want: "이 작가에 대해 더 알 수 있는 곳이 있는지 묻기", need: [["더 알기", ["learn more", "find out more", "read more"]]], hint: ["Where can I ~ more about this artist?", "Where can I learn…", "Where can I learn more about this artist?"], model: "Where can I learn more about this artist?" },
        { say: "There's a short film in room three. It's about fifteen minutes.", want: "고맙다고, 지금 바로 보러 가겠다고 하기", need: [["지금", ["now", "right now"]]], hint: ["Thanks! I'll go watch it right ~.", "Thanks! I'll go watch it…", "Thanks! I'll go watch it right now."], model: "Thanks! I'll go watch it right now." }
      ],
      overhear: [
        ["guest", "Is this painting for sale?"],
        ["them", "No, it's on loan from another museum.", [["on loan", "빌려 온", "전시에서 자주 쓰는 말이에요."]]],
        ["guest", "Oh, I see. It's beautiful."],
        ["them", "It is. People often stand in front of it for a long time.", [["in front of", "~ 앞에", "작품 앞에 서 있다고 말할 때 써요."]]]
      ] }],
    ["12:30", "미술관 근처 카페", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, you! What can I get you today?", want: "칠면조 샌드위치와 아이스티를 달라고 하기", need: [["샌드위치", ["sandwich"]], ["아이스티", ["iced tea"]]], hint: ["A turkey ~ and an iced tea, please.", "A turkey sandwich…", "A turkey sandwich and an iced tea, please."], model: "A turkey sandwich and an iced tea, please." },
        { say: "Sure thing. For here or to go?", want: "여기서 먹겠다고 하기", need: [["여기서", ["for here", "here", "eat here", "stay"]]], hint: ["For ~, please.", "For here…", "For here, please."], model: "For here, please." },
        { say: "Got it. Did you do anything fun this morning?", want: "미술관에 갔고 사진 전시가 마음에 들었다고 하기", need: [["미술관", ["gallery", "art gallery", "museum"]]], hint: ["I went to the art ~. I liked the photography.", "I went to the art gallery…", "I went to the art gallery. I liked the photography."], model: "I went to the art gallery. I liked the photography." },
        { say: "Nice! There's a flyer for a new show by the door. Want one?", want: "나가면서 하나 챙기겠다고 하기", need: [["챙기기", ["grab one", "take one", "grab a flyer", "take a flyer", "pick one up"]]], hint: ["Cool. I'll ~ one on my way out.", "Cool. I'll grab…", "Cool. I'll grab one on my way out."], model: "Cool. I'll grab one on my way out.", chunk: ["on my way out", "나가는 길에", "가는 길에 잠깐 한다는 뜻이에요."] },
        { say: "Here's your sandwich. Careful, the plate is hot.", want: "고맙다고, 냅킨이 어디 있는지 묻기", need: [["냅킨", ["napkin", "napkins"]]], hint: ["Thanks, Leo. Where are the ~?", "Thanks, Leo. Where are…", "Thanks, Leo. Where are the napkins?"], model: "Thanks, Leo. Where are the napkins?" }
      ],
      overhear: [
        ["guest", "Can I get a refill on my coffee?", [["a refill", "리필", "같은 음료를 더 받는 거예요."]]],
        ["them", "Sure, I'll bring the pot over."],
        ["guest", "Thanks. Do you have any pastries left?", [["pastries left", "남은 빵", "left는 '남아 있는'이라는 뜻이에요."]]],
        ["them", "Just two croissants. They're still warm."]
      ] }],
    ["15:30", "길 묻는 관광객", "snap", {
      who: "Lily", whoKo: "관광객", voices: { them: "f2", guest: "m" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Excuse me! Do you know where the art gallery is?", want: "방금 거기서 오는 길이라며 두 블록 가서 왼쪽이라고 하기", need: [["왼쪽", ["left"]], ["두 블록", ["two blocks"]]], hint: ["I just came from there. Go two ~ and turn left.", "I just came from there. Go two blocks…", "I just came from there. Go two blocks and turn left."], model: "I just came from there. Go two blocks and turn left." },
        { say: "Oh, that's close! Is it worth it?", want: "사진 전시가 특히 좋다고 하기", need: [["특히", ["especially", "really", "particularly"]]], hint: ["Yes, the photography show is ~ good.", "Yes, the photography show is especially…", "Yes, the photography show is especially good."], model: "Yes, the photography show is especially good.", chunk: ["Is it worth it?", "가 볼 만해요?", "돈·시간을 들일 가치가 있는지 물어요."] },
        { say: "Great. Is it expensive?", want: "12달러인데 학생은 더 싸게 낸다고 하기", need: [["더 싸게", ["pay less", "cheaper", "less"]]], hint: ["It's twelve dollars, but students ~ less.", "It's twelve dollars, but students pay…", "It's twelve dollars, but students pay less."], model: "It's twelve dollars, but students pay less." },
        { say: "Perfect. Could you take a photo of me in front of that mural?", want: "물론이라고, 저기 빛이 좋은 곳에 서라고 하기", need: [["저기", ["over there", "there"]]], hint: ["Sure! Stand ~, where the light is good.", "Sure! Stand over…", "Sure! Stand over there, where the light is good."], model: "Sure! Stand over there, where the light is good." },
        { say: "Thank you so much! Enjoy the rest of your day.", want: "천만에요, 전시 즐기라고 하기", need: [["즐기", ["enjoy", "have fun", "have a good time"]]], hint: ["Anytime! ~ the show.", "Anytime! Enjoy…", "Anytime! Enjoy the show."], model: "Anytime! Enjoy the show." }
      ],
      overhear: [
        ["guest", "Sorry, could you move a little to the left?", [["a little to the left", "왼쪽으로 조금", "위치를 살짝 옮겨 달라고 할 때 써요."]]],
        ["them", "Like this?"],
        ["guest", "Perfect. I'll take one more."],
        ["them", "Do you want me to take one of you both?", [["one of you both", "두 분이 같이 나온 사진", "둘이 함께 찍을 때 써요."]]]
      ] }]
  ]],
  ["걷는 투어", [
    ["09:30", "투어 모이는 곳", "tour", {
      who: "Gabe", whoKo: "투어 가이드", voices: { them: "m2", guest: "f" }, guestKo: "다른 참가자",
      turns: [
        { say: "Hi! Are you here for the nine-thirty walking tour?", want: "네, 어제 온라인으로 예약했다고 하기", need: [["예약", ["booked", "reserved", "reservation"]]], hint: ["Yes, I ~ online yesterday.", "Yes, I booked…", "Yes, I booked online yesterday."], model: "Yes, I booked online yesterday." },
        { say: "Great. What's the name on the booking?", want: "{name}이고 철자를 불러 줄지 묻기", need: [["철자", ["spell"]]], hint: ["It's {name}. Should I ~ it?", "It's {name}. Should I spell…", "It's {name}. Should I spell it?"], model: "It's {name}. Should I spell it?" },
        { say: "No need, I found you. The tour is about two hours, and we'll walk about three miles.", want: "괜찮다고, 편한 신발을 신고 왔다고 하기", need: [["편한", ["comfortable", "comfy"]]], hint: ["That's fine. I wore ~ shoes.", "That's fine. I wore comfortable…", "That's fine. I wore comfortable shoes."], model: "That's fine. I wore comfortable shoes." },
        { say: "Smart! We'll start in five minutes.", want: "출발 전에 화장실이 근처에 있는지 묻기", need: [["화장실", ["restroom", "bathroom", "toilet"]]], hint: ["Is there a ~ near here?", "Is there a restroom…", "Is there a restroom near here?"], model: "Is there a restroom near here?" },
        { say: "Yes, right behind the fountain. Don't be long!", want: "고맙다고, 금방 오겠다고 하기", need: [["금방", ["be quick", "be right back", "hurry", "be fast"]]], hint: ["Thanks, I'll ~ quick.", "Thanks, I'll be…", "Thanks, I'll be quick."], model: "Thanks, I'll be quick." }
      ],
      overhear: [
        ["guest", "Do I need to tip the guide?", [["tip the guide", "가이드에게 팁을 주다", "팁이 필요한지 물을 때 써요."]]],
        ["them", "It's not required, but people usually do if they enjoyed it.", [["not required", "필수는 아니에요", "강제가 아니라는 뜻이에요."]]],
        ["guest", "Good to know. Thanks!"],
        ["them", "Alright, everyone, let's gather over here!", [["gather", "모이다", "사람들을 불러 모을 때 써요."]]]
      ] }],
    ["11:30", "광장 거리 악사", "busker", {
      who: "Eli", whoKo: "거리 악사", voices: { them: "m2", guest: "f" }, guestKo: "구경하던 사람",
      turns: [
        { say: "Thanks for stopping by! Do you like jazz?", want: "네, 이 곡이 정말 좋다고 하기", need: [["좋아함", ["love", "like", "great"]]], hint: ["Yes! I ~ this song.", "Yes! I love…", "Yes! I love this song."], model: "Yes! I love this song." },
        { say: "It's an old song from the fifties. My grandfather played it.", want: "멋지다고, 직접 만든 곡도 있는지 묻기", need: [["직접 만든", ["original", "your own", "write"]]], hint: ["That's cool. Do you play any ~ songs?", "That's cool. Do you play any original…", "That's cool. Do you play any original songs?"], model: "That's cool. Do you play any original songs?" },
        { say: "A few! I'll play one next. It's about this city.", want: "영상을 찍어도 되는지 묻기", need: [["영상", ["video"]], ["찍어도", ["okay if", "okay to", "mind if", "can i", "may i"]]], hint: ["Is it okay if I record a ~?", "Is it okay if I record a video…", "Is it okay if I record a video?"], model: "Is it okay if I record a video?" },
        { say: "Sure, go ahead. And don't forget the tip box!", want: "5달러를 넣으며 음악 고맙다고 하기", need: [["5달러", ["five dollars", "five", "5"]]], hint: ["Here's ~ dollars. Thanks for the music!", "Here's five…", "Here's five dollars. Thanks for the music!"], model: "Here's five dollars. Thanks for the music!" },
        { say: "Wow, thank you! Where are you from?", want: "한국에서 왔고 여기서 1년 공부한다고 하기", need: [["한국", ["korea", "south korea"]]], hint: ["I'm from ~. I'm studying here for a year.", "I'm from Korea…", "I'm from Korea. I'm studying here for a year."], model: "I'm from Korea. I'm studying here for a year." }
      ],
      overhear: [
        ["guest", "Do you take requests?", [["take requests", "신청곡을 받다", "연주자에게 곡을 부탁할 때 써요."]]],
        ["them", "Sure, what do you want to hear?"],
        ["guest", "Do you know 'Fly Me to the Moon'?"],
        ["them", "I do! Give me a second to tune up.", [["tune up", "악기를 조율하다", "연주 전에 소리를 맞출 때 써요."]]]
      ] }],
    ["14:00", "길 잃은 여행자 돕기", "helpway", {
      who: "Ben", whoKo: "길 잃은 여행자", voices: { them: "m", guest: "f2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Excuse me, I think I'm lost. How do I get to the harbor?", want: "걸어서 15분쯤 걸린다고 알려 주기", need: [["걸어서", ["on foot", "walk", "walking"]], ["15분", ["fifteen", "15"]]], hint: ["It's about fifteen minutes ~ foot.", "It's about fifteen minutes on…", "It's about fifteen minutes on foot."], model: "It's about fifteen minutes on foot." },
        { say: "Fifteen minutes. Is there a bus?", want: "버스보다 걷는 게 더 빠르다고 하기", need: [["더 빠름", ["faster", "quicker"]]], hint: ["Walking is ~ than the bus.", "Walking is faster…", "Walking is faster than the bus."], model: "Walking is faster than the bus." },
        { say: "Okay. Which way do I go from here?", want: "이 길로 쭉 가다가 다리를 건너라고 하기", need: [["쭉", ["straight"]], ["다리", ["bridge"]]], hint: ["Go ~ on this road and cross the bridge.", "Go straight…", "Go straight on this road and cross the bridge."], model: "Go straight on this road and cross the bridge." },
        { say: "Got it. Is it safe to walk there in the evening?", want: "사람이 많아서 괜찮다고 하기", need: [["사람 많음", ["lots of people", "a lot of people", "many people", "busy", "crowded"]]], hint: ["Yes, there are ~ of people around.", "Yes, there are lots…", "Yes, there are lots of people around."], model: "Yes, there are lots of people around." },
        { say: "That's good. Thanks a lot. I've been walking in circles!", want: "괜찮다고, 즐거운 여행 하라고 하기", need: [["여행", ["trip", "travels", "stay", "visit", "vacation"]]], hint: ["No problem. Have a great ~!", "No problem. Have a great trip…", "No problem. Have a great trip!"], model: "No problem. Have a great trip!" }
      ],
      overhear: [
        ["guest", "Excuse me, is this the right way to the old town?", [["the right way", "맞는 길", "길이 맞는지 확인할 때 써요."]]],
        ["them", "Yes, keep going until you see the clock tower.", [["keep going", "계속 가다", "갈림길 없이 쭉 가라는 뜻이에요."]]],
        ["guest", "How far is it?"],
        ["them", "Maybe five minutes."]
      ] }]
  ]],
  ["동물원", [
    ["10:00", "동물원 입구", "zoo", {
      who: "Hazel", whoKo: "동물원 사육사", voices: { them: "f2", guest: "m" }, guestKo: "다른 방문객",
      turns: [
        { say: "Welcome to the zoo! Do you have a ticket already?", want: "휴대폰에 표가 있다고 하기", need: [["휴대폰", ["phone"]], ["표", ["ticket"]]], hint: ["Yes, I have a ticket on my ~.", "Yes, I have a ticket on…", "Yes, I have a ticket on my phone."], model: "Yes, I have a ticket on my phone." },
        { say: "Perfect, just scan it here. Do you want a map?", want: "네, 펭귄은 어디 있는지 묻기", need: [["펭귄", ["penguin", "penguins"]]], hint: ["Yes, please. Where are the ~?", "Yes, please. Where are…", "Yes, please. Where are the penguins?"], model: "Yes, please. Where are the penguins?" },
        { say: "Past the lions, on the left. They get fed at eleven.", want: "먹이 먹는 걸 구경할 수 있는지 묻기", need: [["구경", ["watch", "see"]]], hint: ["Can I ~ them eat?", "Can I watch…", "Can I watch them eat?"], model: "Can I watch them eat?" },
        { say: "Yes, there's a small show. Come a bit early to get a good spot.", want: "얼마나 일찍 가야 하는지 묻기", need: [["얼마나 일찍", ["how early", "what time", "how soon"]]], hint: ["How ~ should I get there?", "How early…", "How early should I get there?"], model: "How early should I get there?" },
        { say: "About ten minutes. Have fun!", want: "고맙다고, 사육사 일이 정말 재미있겠다고 하기", need: [["일", ["job", "work"]]], hint: ["Thanks! Your ~ sounds like so much fun.", "Thanks! Your job…", "Thanks! Your job sounds like so much fun."], model: "Thanks! Your job sounds like so much fun." }
      ],
      overhear: [
        ["guest", "Can we pet the goats?", [["pet the goats", "염소를 쓰다듬다", "동물을 만져도 되는지 물을 때 써요."]]],
        ["them", "Yes, but please wash your hands afterward.", [["wash your hands", "손을 씻다", "동물을 만진 뒤 늘 하는 말이에요."]]],
        ["guest", "Where's the sink?"],
        ["them", "Right by the gate, next to the snack stand."]
      ] }],
    ["12:30", "푸드트럭 점심", "foodtruck", {
      who: "Carlos", whoKo: "푸드트럭 사장님", voices: { them: "m2", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, my friend! A zoo day, huh? What'll it be?", want: "오늘 뭐가 맛있는지 추천해 달라고 하기", need: [["추천", ["recommend", "recommendation", "suggest", "good today", "best"]]], hint: ["What do you ~ today?", "What do you recommend…", "What do you recommend today?"], model: "What do you recommend today?" },
        { say: "The pulled pork burrito. It's huge, so it's good for sharing.", want: "그걸로 하되 양파는 빼 달라고 하기", need: [["빼기", ["no onions", "without onions", "hold the onions", "no onion"]]], hint: ["Okay, I'll have that, but ~ onions, please.", "Okay, I'll have that, but no…", "Okay, I'll have that, but no onions, please."], model: "Okay, I'll have that, but no onions, please." },
        { say: "No problem. Anything to drink?", want: "얼음 적은 레모네이드를 달라고 하기", need: [["레모네이드", ["lemonade"]], ["얼음", ["ice"]]], hint: ["Lemonade with less ~, please.", "Lemonade with less…", "Lemonade with less ice, please."], model: "Lemonade with less ice, please." },
        { say: "Done. That's eleven fifty. Cash or card?", want: "카드로, 휴대폰으로 결제할 수 있는지 묻기", need: [["카드", ["card"]], ["휴대폰", ["phone", "tap"]]], hint: ["Card, please. Can I tap my ~?", "Card, please. Can I tap…", "Card, please. Can I tap my phone?"], model: "Card, please. Can I tap my phone?", chunk: ["tap my phone", "휴대폰을 대고 결제하다", "카드 대신 폰을 단말기에 갖다 대는 거예요."] },
        { say: "Of course. Here's your food. Enjoy the animals!", want: "고맙다고, 근처에 앉을 데가 있는지 묻기", need: [["앉을 곳", ["sit", "seat", "seats", "table", "tables", "bench", "benches"]]], hint: ["Thanks! Is there a place to ~ nearby?", "Thanks! Is there a place to sit…", "Thanks! Is there a place to sit nearby?"], model: "Thanks! Is there a place to sit nearby?" }
      ],
      overhear: [
        ["guest", "Can I get this with extra salsa?", [["extra salsa", "살사 소스 더", "extra는 '추가로'라는 뜻이에요."]]],
        ["them", "Sure. That's fifty cents more."],
        ["guest", "That's fine."],
        ["them", "Here you go. Careful, it's hot!"]
      ] }],
    ["15:30", "돌아오는 지하철", "subway", {
      who: "Dan", whoKo: "역무원", voices: { them: "m", guest: "f2" }, guestKo: "다른 승객",
      turns: [
        { say: "Hi! Heading home? How can I help?", want: "시내로 가는 열차는 어느 거냐고 묻기", need: [["시내", ["downtown", "city center", "center"]], ["어느 열차", ["which train", "what train"]]], hint: ["Which train goes ~ from here?", "Which train goes downtown…", "Which train goes downtown from here?"], model: "Which train goes downtown from here?" },
        { say: "The green line. Platform two.", want: "다음 열차는 언제 오는지 묻기", need: [["다음 열차", ["next train", "next one"]]], hint: ["When does the ~ train come?", "When does the next…", "When does the next train come?"], model: "When does the next train come?" },
        { say: "In about six minutes.", want: "갈아타야 하는지 묻기", need: [["환승", ["transfer", "change trains", "switch"]]], hint: ["Do I need to ~?", "Do I need to transfer…", "Do I need to transfer?"], model: "Do I need to transfer?" },
        { say: "Nope, it's direct. Just get off at Central.", want: "정거장 이름을 한 번 더 말해 달라고 하기", need: [["다시 말해", ["repeat", "say that again", "say it again", "say the stop again"]]], hint: ["Could you ~ the stop name, please?", "Could you repeat…", "Could you repeat the stop name, please?"], model: "Could you repeat the stop name, please?" },
        { say: "Central. Sure thing. Have a safe ride!", want: "고맙다고, 동물원에서 즐거웠다고 하기", need: [["즐거운 시간", ["great time", "good time", "lot of fun", "so much fun", "fun"]]], hint: ["Thanks! I had a great ~ at the zoo.", "Thanks! I had a great time…", "Thanks! I had a great time at the zoo."], model: "Thanks! I had a great time at the zoo." }
      ],
      overhear: [
        ["guest", "Excuse me, my ticket is stuck in the gate.", [["stuck", "끼었어요", "기계에 걸렸을 때 써요."]]],
        ["them", "Let me take a look."],
        ["guest", "It happened right after I tapped it."],
        ["them", "No worries. I'll open the side gate for you.", [["side gate", "옆 문", "역 옆쪽 출입구예요."]]]
      ] }]
  ]],
  ["야경 명소", [
    ["18:30", "전망대에서 해 지는 걸 보며", "photo", {
      who: "Nate", whoKo: "전망대 행인", voices: { them: "m", guest: "f" }, guestKo: "다른 관광객",
      turns: [
        { say: "Wow, look at that view. Is this your first time up here?", want: "네, 해 지는 걸 보러 왔다고 하기", need: [["일몰", ["sunset"]]], hint: ["Yes, I came to see the ~.", "Yes, I came to see the sunset…", "Yes, I came to see the sunset."], model: "Yes, I came to see the sunset." },
        { say: "Good timing! It's even better when the city lights come on.", want: "불빛이 몇 시에 켜지는지 묻기", need: [["불빛", ["lights"]], ["몇 시", ["what time", "when"]]], hint: ["What time do the city ~ come on?", "What time do the city lights…", "What time do the city lights come on?"], model: "What time do the city lights come on?" },
        { say: "Around seven thirty. Want me to take your picture?", want: "부탁한다고, 도시 풍경이 뒤에 나오게 해 달라고 하기", need: [["배경", ["background"]]], hint: ["Yes, please. Could you get the skyline in the ~?", "Yes, please. Could you get the skyline in the background…", "Yes, please. Could you get the skyline in the background?"], model: "Yes, please. Could you get the skyline in the background?" },
        { say: "Sure. Move a bit to the right. Okay, smile!", want: "조금 흐릿하다며 한 번 더 찍어 달라고 하기", need: [["흐릿", ["blurry", "blur", "dark"]]], hint: ["It's a little ~. Could you try one more time?", "It's a little blurry…", "It's a little blurry. Could you try one more time?"], model: "It's a little blurry. Could you try one more time?" },
        { say: "How about this one?", want: "완벽하다고, 정말 고맙다고 하기", need: [["완벽", ["perfect", "great", "amazing", "wonderful"]]], hint: ["That's ~. Thank you so much!", "That's perfect…", "That's perfect. Thank you so much!"], model: "That's perfect. Thank you so much!" }
      ],
      overhear: [
        ["guest", "Do you know which building that is?", [["which building", "어느 건물", "어느 것인지 물을 때 which를 써요."]]],
        ["them", "That's the old bank tower."],
        ["guest", "It's lit up so nicely.", [["lit up", "불이 켜진", "조명이 들어온 모습이에요."]]],
        ["them", "They change the colors on weekends."]
      ] }],
    ["20:00", "야경 보며 피크닉", "picnic", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 담요의 사람",
      turns: [
        { say: "You made it! Come sit. I brought snacks.", want: "늦어서 미안하다고, 버스가 늦었다고 하기", need: [["늦어서", ["late"]]], hint: ["Sorry I'm ~. My bus was delayed.", "Sorry I'm late…", "Sorry I'm late. My bus was delayed."], model: "Sorry I'm late. My bus was delayed." },
        { say: "No worries! Try these strawberries. They're so sweet.", want: "맛있다고, 어디서 샀는지 묻기", need: [["어디서", ["where"]]], hint: ["Mmm, delicious. ~ did you buy them?", "Mmm, delicious. Where…", "Mmm, delicious. Where did you buy them?"], model: "Mmm, delicious. Where did you buy them?" },
        { say: "At Joe's stand at the market. He says hi, by the way.", want: "Joe를 안다고, 사과도 샀는지 묻기", need: [["사과", ["apples", "apple"]]], hint: ["I know Joe! Did you get ~ too?", "I know Joe! Did you get apples…", "I know Joe! Did you get apples too?"], model: "I know Joe! Did you get apples too?" },
        { say: "Of course I did. So, how was the zoo?", want: "펭귄이 너무 귀여웠다고, 걷는 게 웃기다고 하기", need: [["귀여움", ["cute", "cutest"]]], hint: ["The penguins were so ~. They walk funny!", "The penguins were so cute…", "The penguins were so cute. They walk funny!"], model: "The penguins were so cute. They walk funny!" },
        { say: "Ha! Look, the lights are coming on.", want: "정말 예쁘다고, 이 도시와 사랑에 빠지는 중이라고 하기", need: [["예쁨", ["pretty", "beautiful", "gorgeous", "amazing"]]], hint: ["It's so ~. I'm falling in love with this city.", "It's so pretty…", "It's so pretty. I'm falling in love with this city."], model: "It's so pretty. I'm falling in love with this city.", chunk: ["fall in love with", "~와 사랑에 빠지다", "사람뿐 아니라 장소에도 써요."] }
      ],
      overhear: [
        ["guest", "Can you pass me the water?", [["pass me", "건네주다", "물건을 건네 달라고 할 때 써요."]]],
        ["them", "Here. Do you want a napkin too?"],
        ["guest", "Yes, thanks. It's getting chilly.", [["getting chilly", "쌀쌀해지고 있어요", "날씨가 점점 차가워질 때 써요."]]],
        ["them", "Let's put our jackets on."]
      ] }],
    ["21:30", "돌아오는 택시", "taxi", {
      who: "Omar", whoKo: "택시 기사", voices: { them: "m", guest: "f" }, guestKo: "앞 손님",
      turns: [
        { say: "Evening! Where are we headed?", want: "중앙역으로 가 달라고 하기", need: [["역", ["station"]]], hint: ["To Central ~, please.", "To Central Station…", "To Central Station, please."], model: "To Central Station, please." },
        { say: "Sure. Did you have a nice night?", want: "언덕에서 도시 불빛을 봤다고 하기", need: [["불빛", ["city lights", "skyline", "night view", "lights"]]], hint: ["Yes! I saw the city ~ from the hill.", "Yes! I saw the city lights…", "Yes! I saw the city lights from the hill."], model: "Yes! I saw the city lights from the hill." },
        { say: "Nice. Do you want the highway or the local roads?", want: "어느 쪽이든 더 빠른 길로 가 달라고 하기", need: [["더 빠른", ["faster", "fastest", "quickest", "quicker"]]], hint: ["Whichever is ~.", "Whichever is faster…", "Whichever is faster."], model: "Whichever is faster." },
        { say: "Highway it is. It'll take about fifteen minutes.", want: "추우니 히터를 조금 올려 달라고 하기", need: [["히터", ["heat", "heater"]]], hint: ["Could you turn up the ~ a little? I'm cold.", "Could you turn up the heat…", "Could you turn up the heat a little? I'm cold."], model: "Could you turn up the heat a little? I'm cold." },
        { say: "Sure thing. Here we are. That's eighteen dollars.", want: "20달러를 내며 고맙다고 하기", need: [["20", ["twenty", "20"]]], hint: ["Here's ~. Thanks for the ride!", "Here's twenty…", "Here's twenty. Thanks for the ride!"], model: "Here's twenty. Thanks for the ride!" }
      ],
      overhear: [
        ["guest", "Excuse me, can you turn on the meter?", [["turn on the meter", "미터기를 켜다", "택시 요금 계산기를 켜 달라는 말이에요."]]],
        ["them", "It's already on. See?"],
        ["guest", "Oh, sorry. How long to the airport?"],
        ["them", "About forty minutes without traffic.", [["without traffic", "차가 안 막히면", "조건을 짧게 붙이는 말이에요."]]]
      ] }]
  ]],
  ["유람선", [
    ["11:00", "유람선 표 사기", "cruise", {
      who: "Captain Hale", whoKo: "유람선 선장", voices: { them: "m2", guest: "f2" }, guestKo: "다른 손님",
      turns: [
        { say: "Morning! Looking for the river cruise?", want: "11시 반 배 표를 사고 싶다고 하기", need: [["표", ["ticket", "tickets"]], ["11시 반", ["eleven thirty", "11 30"]]], hint: ["Yes, I'd like a ~ for the eleven-thirty boat.", "Yes, I'd like a ticket…", "Yes, I'd like a ticket for the eleven-thirty boat."], model: "Yes, I'd like a ticket for the eleven-thirty boat." },
        { say: "That one is full, but there's a twelve o'clock boat. Is that okay?", want: "괜찮다고, 얼마나 걸리는지 묻기", need: [["얼마나 걸림", ["how long"]]], hint: ["That's fine. ~ is the cruise?", "That's fine. How long…", "That's fine. How long is the cruise?"], model: "That's fine. How long is the cruise?" },
        { say: "About an hour and a half. We go under three bridges.", want: "위층 갑판에 앉아도 되는지 묻기", need: [["갑판", ["deck"]]], hint: ["Can I sit on the upper ~?", "Can I sit on the upper deck…", "Can I sit on the upper deck?"], model: "Can I sit on the upper deck?" },
        { say: "Of course, but it's windy up there. Bring a jacket.", want: "알려 줘서 고맙다고, 재킷을 가져왔다고 하기", need: [["가져왔", ["brought", "have a jacket", "wearing"]]], hint: ["Thanks for the tip. I ~ a jacket.", "Thanks for the tip. I brought…", "Thanks for the tip. I brought a jacket."], model: "Thanks for the tip. I brought a jacket.", chunk: ["Thanks for the tip", "알려 줘서 고마워요", "조언·팁을 받았을 때 써요."] },
        { say: "Good. Boarding starts at eleven forty-five. See you on the boat!", want: "배 안에서 간식을 살 수 있는지 묻기", need: [["배 안", ["on board", "onboard", "on the boat", "on the ship"]]], hint: ["Can I buy snacks ~ board?", "Can I buy snacks on…", "Can I buy snacks on board?"], model: "Can I buy snacks on board?" }
      ],
      overhear: [
        ["guest", "Do you offer a student discount?"],
        ["them", "Yes, with a valid ID.", [["valid ID", "유효한 신분증", "기한이 지나지 않은 신분증이에요."]]],
        ["guest", "Great, here's mine."],
        ["them", "Thanks. That'll be fourteen dollars."]
      ] }],
    ["14:00", "강변 식당 늦은 점심", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Welcome! Table for one?", want: "네, 창가 자리를 달라고 하기", need: [["창가", ["window"]]], hint: ["Yes, and could I have a table by the ~?", "Yes, and could I have a table by the window…", "Yes, and could I have a table by the window?"], model: "Yes, and could I have a table by the window?" },
        { say: "Sure. Here's the menu. Can I start you with something to drink?", want: "일단은 물만 달라고 하기", need: [["일단", ["for now", "right now"]]], hint: ["Just water ~ now, please.", "Just water for…", "Just water for now, please."], model: "Just water for now, please." },
        { say: "Of course. Any questions about the menu?", want: "오늘의 수프에 뭐가 들었는지 묻기", need: [["수프", ["soup"]]], hint: ["What's in the ~ of the day?", "What's in the soup…", "What's in the soup of the day?"], model: "What's in the soup of the day?" },
        { say: "Tomato and basil. It's vegetarian.", want: "그럼 수프와 곁들임 샐러드로 하겠다고 하기", need: [["샐러드", ["salad"]]], hint: ["Great. I'll have the soup and a side ~.", "Great. I'll have the soup and a side salad…", "Great. I'll have the soup and a side salad."], model: "Great. I'll have the soup and a side salad.", chunk: ["side salad", "곁들임 샐러드", "main 요리 옆에 나오는 작은 샐러드예요."] },
        { say: "Excellent. Anything else?", want: "여유 있을 때 계산서를 부탁하기", need: [["계산서", ["check", "bill"]]], hint: ["Could I get the ~ when you have a moment?", "Could I get the check…", "Could I get the check when you have a moment?"], model: "Could I get the check when you have a moment?" }
      ],
      overhear: [
        ["guest", "Is the fish fresh today?"],
        ["them", "Yes, it came in this morning."],
        ["guest", "Then I'll have it grilled, please.", [["grilled", "구운", "조리 방법을 말할 때 써요."]]],
        ["them", "Good choice. Any sides with that?"]
      ] }],
    ["16:30", "엽서 부치기", "postoffice", {
      who: "Wendy", whoKo: "우체국 직원", voices: { them: "f", guest: "m" }, guestKo: "다음 손님",
      turns: [
        { say: "Next, please! How can I help you?", want: "엽서 두 장을 한국에 부치고 싶다고 하기", need: [["엽서", ["postcard", "postcards"]], ["부치기", ["send", "mail"]]], hint: ["I'd like to ~ two postcards to Korea.", "I'd like to send…", "I'd like to send two postcards to Korea."], model: "I'd like to send two postcards to Korea." },
        { say: "Sure. Do you have stamps already?", want: "아니, 우표를 사야 한다고 하기", need: [["우표", ["stamp", "stamps"]]], hint: ["No, I need to buy ~.", "No, I need to buy stamps…", "No, I need to buy stamps."], model: "No, I need to buy stamps." },
        { say: "International stamps are two dollars each.", want: "도착하는 데 얼마나 걸리는지 묻기", need: [["얼마나 걸림", ["how long"]]], hint: ["~ will they take to get there?", "How long…", "How long will they take to get there?"], model: "How long will they take to get there?" },
        { say: "About ten days.", want: "주소를 쓸 펜을 빌릴 수 있는지 묻기", need: [["빌리기", ["borrow", "use"]], ["펜", ["pen"]]], hint: ["Do you have a pen I can ~?", "Do you have a pen I can borrow…", "Do you have a pen I can borrow?"], model: "Do you have a pen I can borrow?" },
        { say: "Sure, over there by the window. Anything else?", want: "아니요, 그게 전부라고 고맙다고 하기", need: [["그게 전부", ["that's all", "thats all", "that is all", "that's it"]]], hint: ["No, ~ all. Thank you!", "No, that's all…", "No, that's all. Thank you!"], model: "No, that's all. Thank you!" }
      ],
      overhear: [
        ["guest", "I need to ship this box to Texas.", [["ship this box", "상자를 보내다", "택배를 부칠 때 써요."]]],
        ["them", "Let me weigh it first.", [["weigh", "무게를 재다", "우편 요금은 무게로 정해져요."]]],
        ["guest", "How much does it cost to send it overnight?"],
        ["them", "Overnight is thirty dollars."]
      ] }]
  ]],
  ["맛집 줄 서기", [
    ["12:00", "맛집 줄 서기", "queue", {
      who: "Nina", whoKo: "식당 입구 직원", voices: { them: "f2", guest: "f" }, guestKo: "기다리는 손님",
      turns: [
        { say: "Hi, welcome! Do you have a reservation?", want: "아니요, 대기가 얼마나 되는지 묻기", need: [["대기", ["wait"]], ["얼마나", ["how long"]]], hint: ["No, I don't. How long is the ~?", "No, I don't. How long is the wait…", "No, I don't. How long is the wait?"], model: "No, I don't. How long is the wait?" },
        { say: "About forty minutes. We'll text you when your table is ready.", want: "괜찮다고, 준비되면 문자를 달라고 하기", need: [["문자", ["text"]]], hint: ["That's okay. Can you ~ me when it's ready?", "That's okay. Can you text…", "That's okay. Can you text me when it's ready?"], model: "That's okay. Can you text me when it's ready?" },
        { say: "Sure. How many people?", want: "혼자라고, 바 자리도 되는지 묻기", need: [["바", ["bar"]]], hint: ["Just one. Is there a seat at the ~?", "Just one. Is there a seat at the bar…", "Just one. Is there a seat at the bar?"], model: "Just one. Is there a seat at the bar?" },
        { say: "The bar is first come, first served. It's usually faster.", want: "그럼 바 쪽 줄에 서겠다고 하기", need: [["줄", ["line", "queue"]]], hint: ["Then I'll wait in ~ for the bar.", "Then I'll wait in line…", "Then I'll wait in line for the bar."], model: "Then I'll wait in line for the bar.", chunk: ["first come, first served", "먼저 온 순서대로", "예약 없이 오는 순서대로 받을 때 써요."] },
        { say: "Perfect. Here's a menu to look at while you wait.", want: "고맙다고, 여기서 제일 인기 있는 메뉴가 뭔지 묻기", need: [["인기", ["popular", "most popular", "best seller", "favorite", "best"]]], hint: ["Thanks. What's the most ~ dish here?", "Thanks. What's the most popular…", "Thanks. What's the most popular dish here?"], model: "Thanks. What's the most popular dish here?" }
      ],
      overhear: [
        ["guest", "Is it okay if we wait outside?"],
        ["them", "Of course. We'll call your name.", [["call your name", "이름을 부르다", "대기 손님을 부를 때 써요."]]],
        ["guest", "How long is the wait for a table for four?", [["table for four", "네 명 자리", "table for 뒤에 인원을 붙여요."]]],
        ["them", "Probably an hour."]
      ] }],
    ["13:00", "버거 맛집 주문", "wrong", {
      who: "Kevin", whoKo: "식당 직원", voices: { them: "m", guest: "f2" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Hey, welcome in! First time here?", want: "네, 줄이 길어서 기대된다고 하기", need: [["기대", ["excited", "looking forward"]]], hint: ["Yes! The line was long, so I'm ~.", "Yes! The line was long, so I'm excited…", "Yes! The line was long, so I'm excited."], model: "Yes! The line was long, so I'm excited." },
        { say: "Ha, it's worth it. Do you need a minute to look at the menu?", want: "잠깐만 더 시간을 달라고 하기", need: [["잠깐", ["a minute", "a moment", "a second", "a few minutes"]]], hint: ["Yes, give me a ~, please.", "Yes, give me a minute…", "Yes, give me a minute, please."], model: "Yes, give me a minute, please." },
        { say: "Take your time. Ready to order?", want: "하우스 버거를 치즈 빼고 달라고 하기", need: [["치즈 빼고", ["without cheese", "no cheese", "hold the cheese"]]], hint: ["I'll have the house burger ~ cheese.", "I'll have the house burger without…", "I'll have the house burger without cheese."], model: "I'll have the house burger without cheese." },
        { say: "Sure. Fries or a side salad?", want: "감자튀김을, 케첩은 많이 달라고 하기", need: [["감자튀김", ["fries", "french fries"]]], hint: ["Fries, please. And ~ ketchup.", "Fries, please. And extra…", "Fries, please. And extra ketchup."], model: "Fries, please. And extra ketchup." },
        { say: "Here's your burger. Careful, it's juicy!", want: "맛있어 보인다고, 칼과 포크를 달라고 하기", need: [["칼", ["knife"]]], hint: ["It looks amazing. Could I get a ~ and fork?", "It looks amazing. Could I get a knife…", "It looks amazing. Could I get a knife and fork?"], model: "It looks amazing. Could I get a knife and fork?" }
      ],
      overhear: [
        ["guest", "Excuse me, we've been waiting a while for our food.", [["been waiting", "기다리고 있어요", "계속 기다린 걸 말할 때 써요."]]],
        ["them", "I'm so sorry. Let me check on that right away.", [["check on", "확인해 보다", "진행 상황을 알아본다는 뜻이에요."]]],
        ["guest", "Thank you. We're kind of in a hurry."],
        ["them", "I'll bring it out in two minutes."]
      ] }],
    ["19:30", "Sara에게 한 주 이야기", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "다른 친구",
      turns: [
        { say: "Hey! Come in. Tell me everything about your week!", want: "바빴지만 정말 재미있었다고 하기", need: [["바쁜", ["busy"]]], hint: ["It was ~, but so much fun.", "It was busy…", "It was busy, but so much fun."], model: "It was busy, but so much fun." },
        { say: "What was your favorite place?", want: "유람선이 최고였다고 하기", need: [["유람선", ["cruise", "river cruise", "boat"]]], hint: ["The river ~ was the best.", "The river cruise…", "The river cruise was the best."], model: "The river cruise was the best." },
        { say: "Oh, I haven't done that. Was it expensive?", want: "학생 할인으로 14달러밖에 안 했다고 하기", need: [["할인", ["discount"]]], hint: ["Only fourteen dollars with a student ~.", "Only fourteen dollars with a student discount…", "Only fourteen dollars with a student discount."], model: "Only fourteen dollars with a student discount." },
        { say: "That's a good deal. Where do you want to go next?", want: "근처 작은 마을에 가 보고 싶다고 하기", need: [["가 보고 싶", ["i'd like to", "i want to", "i'd love to"]]], hint: ["I'd ~ to visit a small town nearby.", "I'd like…", "I'd like to visit a small town nearby."], model: "I'd like to visit a small town nearby." },
        { say: "We should plan a day trip together!", want: "좋은 생각이라고, 이번 주말에 날을 정하자고 하기", need: [["정하자", ["let's pick", "let's plan", "let's decide", "let's choose", "let's set"]]], hint: ["Great idea! Let's ~ a day this weekend.", "Great idea! Let's pick…", "Great idea! Let's pick a day this weekend."], model: "Great idea! Let's pick a day this weekend.", chunk: ["day trip", "당일치기 여행", "하루 안에 다녀오는 여행이에요."] }
      ],
      overhear: [
        ["guest", "Sara, is this your sweater?"],
        ["them", "Oh, yes! Thanks for finding it."],
        ["guest", "Where should I put it?"],
        ["them", "Just leave it on the couch.", [["Just leave it", "그냥 두세요", "물건을 아무 데나 두라고 할 때 써요."]]]
      ] }]
  ]]
]);
