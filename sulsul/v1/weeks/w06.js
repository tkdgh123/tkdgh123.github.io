// 6주째 · 아픈 주 (36~42일째). 감기에 걸려 병원·약국에 가고, 일을 쉬고, 친구가 챙겨 준다.
// 장면 = [시간, 이름, 그림 id, 대본]. 형식은 ~/sulsul-art/YEAR.md
WEEK(6, [
  ["감기 기운", [
    ["08:00", "아침에 목이 아파요", "landlord", {
      who: "Mr. Patel", whoKo: "집주인", voices: { them: "m", guest: "f2" }, guestKo: "옆집 이웃",
      turns: [
        { say: "Good morning! You look pale. Are you okay?", want: "일어나니 목이 아프고 머리도 아프다고 하기", need: [["목",["sore throat","throat"]],["두통",["headache"]]], hint: ["I woke up with a ~ throat and a headache.","I woke up with…","I woke up with a sore throat and a headache."], model: "I woke up with a sore throat and a headache.", chunk: ["woke up with","일어났더니 ~가 있어요","아침에 증상을 말할 때 써요."] },
        { say: "Oh dear. Sounds like a cold. Do you have a fever?", want: "모르겠다고, 체온계가 없다고 하기", need: [["체온계",["thermometer"]]], hint: ["I don't know. I don't have a ~.","I don't know. I…","I don't know. I don't have a thermometer."], model: "I don't know. I don't have a thermometer." },
        { say: "I have one. I'll bring it down. Do you have any medicine at home?", want: "아니, 약이 하나도 없다고 하기", need: [["약",["medicine","pills","meds"]]], hint: ["No, I don't have any ~.","No, I don't…","No, I don't have any medicine."], model: "No, I don't have any medicine." },
        { say: "Then go to the pharmacy later. You should rest today.", want: "쉬고 싶지만 오전에 수업이 있다고 하기", need: [["수업",["class"]]], hint: ["I'd rest, but I have ~ this morning.","I'd rest, but I…","I'd rest, but I have class this morning."], model: "I'd rest, but I have class this morning." },
        { say: "Then at least wear a scarf. It's chilly out. And drink lots of water.", want: "목도리를 하고 물을 많이 마시겠다고 하기", need: [["목도리",["scarf"]],["물",["water"]]], hint: ["I will. I'll wear a ~ and drink lots of water.","I will. I'll wear a…","I will. I'll wear a scarf and drink lots of water."], model: "I will. I'll wear a scarf and drink lots of water." }
      ],
      overhear: [
        ["guest","Mr. Patel, the heater in my room isn't working.",[["isn't working","작동 안 해요","기계가 고장 났을 때 써요."]]],
        ["them","I'll send someone today."],
        ["guest","Thanks. It's freezing in there.",[["freezing","꽁꽁 어는 듯이 추운","아주 추울 때 써요."]]],
        ["them","Wear a sweater until then."]
      ] }],
    ["10:00", "수업 중 콧물", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Good morning. Are you all right? You sound a little hoarse.", want: "감기에 걸리는 중인 것 같다고 하기", need: [["감기",["cold"]]], hint: ["I think I'm catching a ~.","I think I'm…","I think I'm catching a cold."], model: "I think I'm catching a cold.", chunk: ["catching a cold","감기에 걸리는 중","'걸렸다'가 아니라 '걸리는 중'일 때 써요."] },
        { say: "Sorry to hear that. Do you have a cough too?", want: "기침은 없고 코가 막힌다고 하기", need: [["코막힘",["stuffy","stuffed up","runny"]]], hint: ["No cough, but my nose is ~.","No cough, but…","No cough, but my nose is stuffy."], model: "No cough, but my nose is stuffy.", chunk: ["stuffy nose","코막힘","코가 막힌 느낌이에요."] },
        { say: "That's annoying. Do you want to go home and rest?", want: "괜찮다고, 수업은 끝까지 듣겠다고 하기", need: [["차라리",["i'd rather","i would rather"]],["남기",["stay","finish"]]], hint: ["I'm okay. I'd rather ~ for class.","I'm okay. I'd…","I'm okay. I'd rather stay for class."], model: "I'm okay. I'd rather stay for class.", chunk: ["I'd rather","차라리 ~할래요","더 낫다고 생각하는 쪽을 말해요."] },
        { say: "All right. Just tell me if you feel worse.", want: "더 아프면 말씀드리겠다고 하기", need: [["말함",["tell you","let you know"]],["악화",["worse"]]], hint: ["I will. I'll ~ you if I feel worse.","I will. I'll tell…","I will. I'll tell you if I feel worse."], model: "I will. I'll tell you if I feel worse." },
        { say: "And please keep your distance from the others today. We don't want a class full of sniffles.", want: "알겠다고, 마스크를 쓰겠다고 하기", need: [["마스크",["mask"]]], hint: ["Sure. I'll put on a ~.","Sure. I'll put…","Sure. I'll put on a mask."], model: "Sure. I'll put on a mask.", chunk: ["put on","쓰다·입다","마스크·옷을 몸에 걸칠 때 써요."] }
      ],
      overhear: [
        ["guest","Mr. Brown, can I turn in my homework tomorrow?",[["turn in","제출하다","과제를 낼 때 써요."]]],
        ["them","Yes, but no later than ten."],
        ["guest","Thank you. I was out sick yesterday.",[["out sick","아파서 쉰","결석·결근 이유로 써요."]]],
        ["them","Get some rest, then."]
      ] }],
    ["15:00", "비타민을 사요", "market", {
      who: "Joe", whoKo: "과일 가게 주인", voices: { them: "m2", guest: "f" }, guestKo: "다른 손님",
      turns: [
        { say: "Hey! You sound terrible. What happened?", want: "감기 걸린 것 같다고, 비타민 C 때문에 오렌지가 필요하다고 하기", need: [["오렌지",["orange","oranges"]],["비타민",["vitamin","vitamins"]]], hint: ["I think I have a cold. I need ~ for the vitamin C.","I think I have a cold…","I think I have a cold. I need oranges for the vitamin C."], model: "I think I have a cold. I need oranges for the vitamin C." },
        { say: "Oranges, coming up! How many? They're juicy today.", want: "열 개 달라고 하기", need: [["열 개",["ten","10","a dozen","dozen"]]], hint: ["Give me ~, please.","Give me…","Give me ten, please."], model: "Give me ten, please." },
        { say: "Ten it is. Want some ginger too? My grandma swears by it for colds.", want: "좋다고, 생강은 어떻게 쓰는지 묻기", need: [["생강",["ginger"]],["어떻게",["how"]]], hint: ["Sure. How do I use ~?","Sure. How do…","Sure. How do I use ginger?"], model: "Sure. How do I use ginger?", chunk: ["swear by","꼭 믿고 쓰다","효과를 굳게 믿는 방법이에요."] },
        { say: "Just slice it and put it in hot water. It really helps your throat.", want: "꿀도 있는지 묻기", need: [["꿀",["honey"]]], hint: ["Great. Do you have ~ too?","Great. Do you…","Great. Do you have honey too?"], model: "Great. Do you have honey too?" },
        { say: "Right there on the shelf. That'll be fourteen dollars. Feel better soon!", want: "고맙다고, 나으면 다시 오겠다고 하기", need: [["나으면",["when i'm better","once i'm better","get better","feel better"]]], hint: ["Thanks, Joe! I'll be back once I'm ~.","Thanks, Joe! I'll be…","Thanks, Joe! I'll be back once I'm better."], model: "Thanks, Joe! I'll be back once I'm better.", chunk: ["Feel better soon","빨리 나으세요","아픈 사람에게 하는 인사예요."] }
      ],
      overhear: [
        ["guest","Are these lemons organic?"],
        ["them","No, but they're local.",[["local","동네에서 난","가까운 곳에서 키운 것이에요."]]],
        ["guest","That's fine. I'll take four."],
        ["them","Four lemons, coming up. Get some rest!"]
      ] }]
  ]],
  ["병원 예약", [
    ["09:00", "진료 예약하기", "clinic", {
      who: "Nora", whoKo: "병원 접수", voices: { them: "f", guest: "m" }, guestKo: "다른 환자",
      turns: [
        { say: "Hello, welcome to the clinic. How can I help you?", want: "의사 진료 예약을 하고 싶다고 하기", need: [["예약",["appointment","book","schedule"]]], hint: ["I need to make an ~ with a doctor.","I need to make…","I need to make an appointment with a doctor."], model: "I need to make an appointment with a doctor.", chunk: ["make an appointment","진료 예약을 하다","병원은 reservation이 아니라 appointment예요."] },
        { say: "Sure. Have you been here before?", want: "네, 작년에 한 번 왔다고 하기", need: [["작년",["last year"]]], hint: ["Yes, once ~ year.","Yes, once…","Yes, once last year."], model: "Yes, once last year." },
        { say: "Okay, I'll find your file. What are your symptoms?", want: "3일째 목이 아프고 열이 있다고 하기", need: [["3일",["three days","3 days"]],["열",["fever","temperature"]]], hint: ["I've had a sore throat and a ~ for three days.","I've had a sore throat…","I've had a sore throat and a fever for three days."], model: "I've had a sore throat and a fever for three days.", chunk: ["for three days","3일 동안","기간은 for로 말해요."] },
        { say: "That's no fun. Dr. Evans has an opening tomorrow at ten or Thursday at four.", want: "내일 10시가 좋다고 하기", need: [["내일",["tomorrow"]],["10시",["ten","10"]]], hint: ["~ at ten is better for me.","Tomorrow at ten…","Tomorrow at ten is better for me."], model: "Tomorrow at ten is better for me." },
        { say: "Done. Please bring your ID and insurance card.", want: "학생 보험이 있는데 괜찮은지 묻기", need: [["보험",["insurance"]]], hint: ["I have student ~. Is that okay?","I have student…","I have student insurance. Is that okay?"], model: "I have student insurance. Is that okay?", chunk: ["insurance","보험","병원비를 대신 내 주는 보험이에요."] }
      ],
      overhear: [
        ["guest","Hi, I'm here to pick up my test results.",[["test results","검사 결과","검사 결과를 받으러 왔다고 할 때 써요."]]],
        ["them","May I have your name and date of birth?",[["date of birth","생년월일","서류에 꼭 쓰는 말이에요."]]],
        ["guest","Sure, it's March third, nineteen ninety."],
        ["them","Thanks. I'll be right back."]
      ] }],
    ["12:00", "운동 일정 옮기기", "gym", {
      who: "Tyler", whoKo: "헬스장 직원", voices: { them: "m2", guest: "f" }, guestKo: "다른 회원",
      turns: [
        { say: "Hey! You look rough. Did you catch something?", want: "감기라서 오늘은 운동을 못 한다고 하기", need: [["감기",["cold"]],["운동",["work out","workout","exercise"]]], hint: ["Yes, a cold. I can't ~ out today.","Yes, a cold. I…","Yes, a cold. I can't work out today."], model: "Yes, a cold. I can't work out today." },
        { say: "Rest is important. Do you want to cancel Saturday's session with the trainer?", want: "취소 말고 다음 주로 옮길 수 있는지 묻기", need: [["옮기기",["reschedule","move","push","change"]]], hint: ["Can I ~ it for next week?","Can I reschedule…","Can I reschedule it for next week?"], model: "Can I reschedule it for next week?", chunk: ["reschedule","일정을 다시 잡다","시간을 미루거나 옮길 때 써요."] },
        { say: "Sure. Monday at six is open. Does that work?", want: "아직 모르겠다고, 나으면 문자 해도 되는지 묻기", need: [["문자",["text","message"]]], hint: ["I'm not sure yet. Can I ~ you when I feel better?","I'm not sure yet. Can…","I'm not sure yet. Can I text you when I feel better?"], model: "I'm not sure yet. Can I text you when I feel better?" },
        { say: "Of course. Here's my number. By the way, don't come in until you're 100 percent.", want: "알겠다고, 아무에게도 옮기고 싶지 않다고 하기", need: [["옮김",["spread"]]], hint: ["I know. I don't want to ~ it to anyone.","I know. I don't…","I know. I don't want to spread it to anyone."], model: "I know. I don't want to spread it to anyone.", chunk: ["spread it","퍼뜨리다","병을 옮길 때 spread를 써요."] },
        { say: "Smart. Take care of yourself. Drink lots of fluids.", want: "고맙다고, 다 나으면 보자고 하기", need: [["회복",["recovered","recover","feel better","better"]]], hint: ["Thanks! I'll see you when I've ~.","Thanks! I'll see…","Thanks! I'll see you when I've recovered."], model: "Thanks! I'll see you when I've recovered." }
      ],
      overhear: [
        ["guest","Can you show me how this machine works?"],
        ["them","Sure. Adjust the seat first.",[["Adjust","맞추다","의자·높이를 알맞게 조정할 때 써요."]]],
        ["guest","Like this?"],
        ["them","A little lower. Perfect."]
      ] }],
    ["16:00", "따뜻한 차 한 잔", "cafe", {
      who: "Leo", whoKo: "바리스타", voices: { them: "m", guest: "f" }, guestKo: "다음 손님",
      turns: [
        { say: "Hey, you don't look so good. The usual iced americano?", want: "오늘은 뜨거운 차로 하겠다고, 목이 아프다고 하기", need: [["뜨거운",["hot","warm"]],["차",["tea"]]], hint: ["Not today. ~ tea, please. My throat hurts.","Not today. Hot tea…","Not today. Hot tea, please. My throat hurts."], model: "Not today. Hot tea, please. My throat hurts.", chunk: ["My throat hurts","목이 아파요","아픈 곳 + hurt로 말해요."] },
        { say: "Got it. Chamomile or ginger lemon?", want: "생강 레몬이 좋겠다고 하기", need: [["생강",["ginger"]]], hint: ["~ lemon sounds perfect.","Ginger lemon…","Ginger lemon sounds perfect."], model: "Ginger lemon sounds perfect." },
        { say: "Good call. Want honey in it?", want: "꿀을 두 스푼 넣어 달라고 하기", need: [["꿀",["honey"]],["두",["two","extra","double"]]], hint: ["Yes, with ~ spoonfuls of honey.","Yes, with two…","Yes, with two spoonfuls of honey."], model: "Yes, with two spoonfuls of honey." },
        { say: "Done. Are you going to the doctor?", want: "내일 10시에 예약했다고 하기", need: [["예약",["appointment","booked"]],["내일",["tomorrow"]]], hint: ["Yes, I have an ~ tomorrow at ten.","Yes, I have an…","Yes, I have an appointment tomorrow at ten."], model: "Yes, I have an appointment tomorrow at ten." },
        { say: "Good. Here's your tea. Careful, it's hot. And it's on me.", want: "조심하겠다고, 정말 고맙다고 하기", need: THANKS, hint: ["Thank you, Leo! I'll be ~.","Thank you, Leo…","Thank you, Leo! I'll be careful."], model: "Thank you, Leo! I'll be careful." }
      ],
      overhear: [
        ["guest","Do you have any decaf?",[["decaf","디카페인","카페인을 뺀 커피예요."]]],
        ["them","Yes, we do. Hot or iced?"],
        ["guest","Hot, please. Caffeine keeps me up at night.",[["keeps me up","잠을 못 자게 하다","잠을 방해하는 것에 써요."]]],
        ["them","Sure thing."]
      ] }]
  ]],
  ["진료실", [
    ["09:40", "진료 접수", "clinic", {
      who: "Nora", whoKo: "병원 접수", voices: { them: "f", guest: "m2" }, guestKo: "다른 환자",
      turns: [
        { say: "Good morning! You have a ten o'clock with Dr. Evans. Can I see your ID?", want: "신분증과 보험 카드를 건네기", need: [["여기",["here","here's"]],["보험",["insurance"]]], hint: ["~ my ID and my insurance card.","Here's my ID…","Here's my ID and my insurance card."], model: "Here's my ID and my insurance card." },
        { say: "Thanks. Please fill out this form while you wait.", want: "알레르기 칸에 뭘 쓰는지 묻기", need: [["알레르기",["allergies","allergy"]]], hint: ["What should I write under ~?","What should I…","What should I write under allergies?"], model: "What should I write under allergies?" },
        { say: "Just any allergies to medicine or food.", want: "알레르기는 없다고 하기", need: [["없음",["don't have","do not have","no allergies","none"]]], hint: ["I ~ have any allergies.","I don't…","I don't have any allergies."], model: "I don't have any allergies." },
        { say: "Perfect. Do you take any medication regularly?", want: "아니, 비타민뿐이라고 하기", need: [["비타민",["vitamin","vitamins"]]], hint: ["No, only ~.","No, only…","No, only vitamins."], model: "No, only vitamins." },
        { say: "Great. Please have a seat. The doctor will call you soon.", want: "얼마나 기다려야 하는지 묻기", need: [["얼마",["how long"]],["기다림",["wait"]]], hint: ["~ long is the wait?","How long…","How long is the wait?"], model: "How long is the wait?", chunk: ["How long is the wait?","얼마나 기다려요?","대기 시간을 물을 때 써요."] }
      ],
      overhear: [
        ["guest","Excuse me, where's the restroom?"],
        ["them","Down the hall, second door on the left.",[["second door on the left","왼쪽 두 번째 문","길 안내에 쓰는 말이에요."]]],
        ["guest","Thank you."],
        ["them","You're welcome. Please sign in first.",[["sign in","이름을 적고 들어가다","방문자 명단에 이름을 쓸 때 써요."]]]
      ] }],
    ["10:00", "진료실에서", "doctor", {
      who: "Dr. Evans", whoKo: "의사", voices: { them: "m2", guest: "f" }, guestKo: "간호사",
      turns: [
        { say: "Hello, come in. What brings you in today?", want: "목이 너무 아파서 삼키기 힘들다고 하기", need: [["삼키기",["swallow","swallowing"]]], hint: ["My throat hurts so much that it's hard to ~.","My throat hurts so…","My throat hurts so much that it's hard to swallow."], model: "My throat hurts so much that it's hard to swallow." },
        { say: "I see. Any fever?", want: "어젯밤에 열이 났다고 하기", need: [["어젯밤",["last night"]],["열",["fever"]]], hint: ["I had a ~ last night.","I had a…","I had a fever last night."], model: "I had a fever last night." },
        { say: "Okay. Open wide and say 'ah'. Hmm, your throat is red. Any cough?", want: "기침은 없지만 온몸이 쑤신다고 하기", need: [["쑤심",["achy","aches","body aches"]]], hint: ["No cough, but my whole body is ~.","No cough, but my…","No cough, but my whole body is achy."], model: "No cough, but my whole body is achy.", chunk: ["achy","몸이 쑤시는","감기·독감 때 써요."] },
        { say: "It looks like a viral infection. Antibiotics won't help, but I'll give you something for the pain.", want: "며칠이면 나을지 묻기", need: [["얼마나",["how long","how many days","how soon"]]], hint: ["~ long will it take to get better?","How long will it…","How long will it take to get better?"], model: "How long will it take to get better?" },
        { say: "About a week. Rest, drink fluids, and take this twice a day. Here's your prescription.", want: "약은 식사 전에 먹는지 후에 먹는지 묻기", need: [["식전",["before"]],["식후",["after"]]], hint: ["Should I take it ~ or after meals?","Should I take it…","Should I take it before or after meals?"], model: "Should I take it before or after meals?", chunk: ["prescription","처방전","의사가 써 주는 약 종이예요."] }
      ],
      overhear: [
        ["guest","Dr. Evans, your next patient is here.",[["next patient","다음 환자","진료 순서를 말할 때 써요."]]],
        ["them","Give me two minutes."],
        ["guest","Also, the lab called about Mr. Park's results."],
        ["them","Thanks. Put it on my desk."]
      ] }],
    ["18:30", "부드러운 저녁", "dinner", {
      who: "Sam", whoKo: "식당 직원", voices: { them: "m2", guest: "f" }, guestKo: "옆 테이블 손님",
      turns: [
        { say: "Good evening! Table for one?", want: "네, 아파서 부드럽고 따뜻한 음식이 필요하다고 하기", need: [["부드러운",["soft","gentle"]]], hint: ["Yes. I'm sick, so I need something ~ and warm.","Yes. I'm sick, so…","Yes. I'm sick, so I need something soft and warm."], model: "Yes. I'm sick, so I need something soft and warm." },
        { say: "Sorry to hear that. Our chicken soup is great. It's made fresh daily.", want: "좋다고, 맵지 않게 해 달라고 하기", need: [["안 맵게",["nothing spicy","not spicy","no pepper"]]], hint: ["Perfect. Please, ~ spicy.","Perfect. Please…","Perfect. Please, nothing spicy."], model: "Perfect. Please, nothing spicy." },
        { say: "Of course. The soup comes with bread. Toasted or soft?", want: "부드러운 걸로, 미지근한 물도 한 잔 달라고 하기", need: [["미지근",["warm water","lukewarm","room temperature"]]], hint: ["Soft, please. And a glass of ~ water.","Soft, please. And a…","Soft, please. And a glass of warm water."], model: "Soft, please. And a glass of warm water." },
        { say: "Coming right up. Anything else? Tea?", want: "지금은 그게 다라고 하기", need: [["다임",["that's all","that is all","that's it"]]], hint: ["No, ~ all for now.","No, that's…","No, that's all for now."], model: "No, that's all for now." },
        { say: "Here's your soup. Careful, it's hot. How is it?", want: "따뜻해서 목이 벌써 나아지는 것 같다고 하기", need: [["나아짐",["better"]]], hint: ["Mmm, it's warm. My throat feels ~ already.","Mmm, it's warm. My…","Mmm, it's warm. My throat feels better already."], model: "Mmm, it's warm. My throat feels better already." }
      ],
      overhear: [
        ["guest","Can I get the soup without the cream?",[["without the cream","크림 빼고","without + 명사로 빼 달라고 해요."]]],
        ["them","Sure. Any allergies?"],
        ["guest","Yes, I'm allergic to dairy.",[["allergic to","~ 알레르기가 있는","allergy 대신 형용사 allergic을 써요."]]],
        ["them","No problem. I'll let the kitchen know."]
      ] }]
  ]],
  ["약국에서", [
    ["09:30", "처방약 받기", "pharmacy", {
      who: "Grace", whoKo: "약사", voices: { them: "f", guest: "m2" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! How can I help you?", want: "Dr. Evans의 처방전이 있다고 하기", need: [["처방전",["prescription"]]], hint: ["I have a ~ from Dr. Evans.","I have a…","I have a prescription from Dr. Evans."], model: "I have a prescription from Dr. Evans.", chunk: ["fill a prescription","처방대로 약을 받다","처방전을 들고 약을 받을 때 써요."] },
        { say: "Thanks. It'll take about ten minutes. Do you want to wait?", want: "네, 여기서 기다리겠다고 하기", need: [["기다림",["wait"]]], hint: ["Yes, I'll ~ here.","Yes, I'll…","Yes, I'll wait here."], model: "Yes, I'll wait here." },
        { say: "Sure. Have you taken this kind of medicine before?", want: "아니, 이번이 처음이라고 하기", need: [["처음",["first time","never"]]], hint: ["No, this is my ~ time taking it.","No, this is my…","No, this is my first time taking it."], model: "No, this is my first time taking it." },
        { say: "Okay. Take one pill twice a day, after meals. Don't take it on an empty stomach.", want: "졸리게 하는 약인지 묻기", need: [["졸림",["drowsy","sleepy"]]], hint: ["Will it make me ~?","Will it…","Will it make me drowsy?"], model: "Will it make me drowsy?" },
        { say: "A little, so don't drive. Also, here are some throat lozenges. They're on sale.", want: "그것도 한 통 추가하겠다고 하기", need: [["추가",["add"]]], hint: ["Sure, I'll ~ a pack of those.","Sure, I'll add…","Sure, I'll add a pack of those."], model: "Sure, I'll add a pack of those." }
      ],
      overhear: [
        ["guest","Can I take these two together?",[["Can I take","~ 먹어도 돼요?","약을 먹어도 되는지 물어요."]]],
        ["them","No, wait at least four hours between them.",[["at least","적어도","최소한을 말할 때 써요."]]],
        ["guest","Got it."],
        ["them","Call us if you feel dizzy.",[["dizzy","어지러운","약 부작용을 말할 때 자주 나와요."]]]
      ] }],
    ["14:00", "포근한 옷 사기", "shop", {
      who: "Mia", whoKo: "옷 가게 점원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Hi! Welcome. Anything I can help you find?", want: "따뜻한 양말과 후드티를 찾는다고 하기", need: [["양말",["socks"]],["따뜻",["warm"]]], hint: ["I'm looking for ~ socks and a hoodie.","I'm looking for warm…","I'm looking for warm socks and a hoodie."], model: "I'm looking for warm socks and a hoodie." },
        { say: "Cozy! These wool socks are our best ones. What size?", want: "M 사이즈로 두 켤레 달라고 하기", need: [["두 켤레",["two pairs","two pair"]]], hint: ["Medium, and ~ pairs, please.","Medium, and…","Medium, and two pairs, please."], model: "Medium, and two pairs, please.", chunk: ["pair","켤레","양말·신발은 pair로 세요."] },
        { say: "Here you go. The hoodies are over there. We have gray and green.", want: "회색 후드티를 입어 봐도 되는지 묻기", need: [["입어 보기",["try on","try it on","try this on"]]], hint: ["Can I ~ on the gray one?","Can I try…","Can I try on the gray one?"], model: "Can I try on the gray one?", chunk: ["try on","입어 보다","옷을 입어 보고 살 때 써요."] },
        { say: "Of course, the fitting room is right there. How does it fit?", want: "조금 크지만 아주 편하다고 하기", need: [["편함",["comfortable","comfy","cozy"]]], hint: ["It's a bit big, but it's really ~.","It's a bit big…","It's a bit big, but it's really comfy."], model: "It's a bit big, but it's really comfy.", chunk: ["a bit big","조금 커요","옷 사이즈를 말할 때 써요."] },
        { say: "Great. That's forty-five for both. Cash or card?", want: "카드로 내겠다고 하기", need: [["카드",["card"]]], hint: ["I'll put it on my ~.","I'll put it…","I'll put it on my card."], model: "I'll put it on my card." }
      ],
      overhear: [
        ["guest","Do you have this jacket in medium?",[["in medium","M 사이즈로","사이즈는 in + 크기로 말해요."]]],
        ["them","Let me check the back.",[["the back","창고","가게 뒤쪽 창고를 가리키는 말이에요."]]],
        ["guest","Thanks."],
        ["them","We have one left. Want me to hold it?",[["hold it","맡아 두다","사기 전에 잠깐 잡아 둘 때 써요."]]]
      ] }],
    ["19:00", "집주인의 걱정", "landlord", {
      who: "Mr. Patel", whoKo: "집주인", voices: { them: "m", guest: "f2" }, guestKo: "옆집 이웃",
      turns: [
        { say: "I heard you coughing through the wall. Did you see the doctor?", want: "네, 약을 받았고 많이 자야 한다고 하기", need: [["약",["medication","medicine"]],["잠",["sleep","rest"]]], hint: ["Yes, I picked up my ~ and I need to sleep a lot.","Yes, I picked up my medication…","Yes, I picked up my medication and I need to sleep a lot."], model: "Yes, I picked up my medication and I need to sleep a lot." },
        { say: "Good. Is the room warm enough?", want: "괜찮은데 담요를 한 장 더 받을 수 있는지 묻기", need: [["담요",["blanket"]]], hint: ["It's fine, but could I have an extra ~?","It's fine, but could…","It's fine, but could I have an extra blanket?"], model: "It's fine, but could I have an extra blanket?" },
        { say: "Sure, I'll bring one right now. Do you need any groceries? My wife is going to the store.", want: "친절하지만 필요한 건 다 있다고 하기", need: [["다 있음",["all set","i'm good","i'm fine","i have everything","i have enough"]]], hint: ["That's kind of you, but I'm ~ set.","That's kind of you…","That's kind of you, but I'm all set."], model: "That's kind of you, but I'm all set.", chunk: ["That's kind of you","친절하시네요","호의를 정중히 거절하며 고마움을 보일 때 써요."] },
        { say: "Alright. If you feel worse tomorrow, tell me and I'll take you to the hospital.", want: "심해지면 바로 알려 드리겠다고 하기", need: [["알림",["let you know","tell you","call you"]]], hint: ["I will. I'll ~ you know if it gets worse.","I will. I'll let…","I will. I'll let you know if it gets worse."], model: "I will. I'll let you know if it gets worse." },
        { say: "Good. Now go to bed early. Get well soon!", want: "고맙다고, 편히 주무시라고 하기", need: [["인사",["sleep well","good night"]]], hint: ["Thanks, Mr. Patel. ~ well.","Thanks, Mr…","Thanks, Mr. Patel. Sleep well."], model: "Thanks, Mr. Patel. Sleep well.", chunk: ["Get well soon","빨리 나으세요","카드·문자로 쾌유를 빌 때 써요."] }
      ],
      overhear: [
        ["guest","Mr. Patel, the hallway light keeps going off.",[["keeps going off","자꾸 꺼져요","불·기계가 계속 꺼질 때 써요."]]],
        ["them","It's on a timer.",[["on a timer","타이머로 작동하는","자동으로 켜지고 꺼진다는 뜻이에요."]]],
        ["guest","Could you change it?"],
        ["them","I'll change the bulb tomorrow."]
      ] }]
  ]],
  ["일 쉬겠다고 연락", [
    ["08:00", "일 못 나간다고 전화", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "다른 직원",
      turns: [
        { say: "Hello, Bookshop Cafe. This is Olivia.", want: "{name}인데 오늘 출근 못 할 것 같다고 하기", need: [["못 감",["can't come in","can't make it","won't be able","cannot come in"]]], hint: ["Hi Olivia, it's {name}. I ~ come in today.","Hi Olivia, it's {name}…","Hi Olivia, it's {name}. I can't come in today."], model: "Hi Olivia, it's {name}. I can't come in today.", chunk: ["come in","출근하다","일하러 간다는 뜻으로도 써요."] },
        { say: "Oh no. What's wrong?", want: "감기가 심하고 열이 있다고 하기", need: [["열",["fever"]],["감기",["cold","flu"]]], hint: ["I have a bad cold and a ~.","I have a bad…","I have a bad cold and a fever."], model: "I have a bad cold and a fever.", chunk: ["a bad cold","심한 감기","bad가 '심한'이에요."] },
        { say: "I'm sorry to hear that. Did you see a doctor?", want: "네, 의사가 며칠 쉬라고 했다고 하기", need: [["의사",["doctor"]],["쉬기",["rest","stay home","stay in"]]], hint: ["Yes, the ~ told me to rest for a few days.","Yes, the doctor told me…","Yes, the doctor told me to rest for a few days."], model: "Yes, the doctor told me to rest for a few days." },
        { say: "Take all the time you need. Can you work Saturday, or is that too soon?", want: "아직 모르겠고 내일 알려 드려도 되는지 묻기", need: [["모름",["not sure","don't know"]]], hint: ["I'm ~ sure yet. Can I tell you tomorrow?","I'm not sure yet…","I'm not sure yet. Can I tell you tomorrow?"], model: "I'm not sure yet. Can I tell you tomorrow?" },
        { say: "Of course. Don't worry about the shifts. I'll cover them. Just get better.", want: "갑자기 말씀드려 죄송하다고 하기", need: [["미안",["sorry","apologize"]]], hint: ["Thank you, and I'm ~ for the short notice.","Thank you, and I'm…","Thank you, and I'm sorry for the short notice."], model: "Thank you, and I'm sorry for the short notice.", chunk: ["short notice","갑작스러운 통보","미리 알리지 못한 상황이에요."] }
      ],
      overhear: [
        ["guest","Olivia, Mark just called. He's running late.",[["running late","늦어지고 있어요","약속·출근에 늦을 때 써요."]]],
        ["them","Okay. Can you open the register?"],
        ["guest","Sure."],
        ["them","Thanks. I'll be there in five."]
      ] }],
    ["11:00", "진단서 받기", "clinic", {
      who: "Nora", whoKo: "병원 접수", voices: { them: "f", guest: "m2" }, guestKo: "다른 환자",
      turns: [
        { say: "Hello again! How's the throat?", want: "조금 나았지만 아직 열이 있다고 하기", need: [["조금",["a little","slightly"]],["아직",["still"]]], hint: ["A little better, but I ~ have a fever.","A little better, but…","A little better, but I still have a fever."], model: "A little better, but I still have a fever." },
        { say: "Oh dear. What can I do for you today?", want: "회사에 낼 진단서가 필요하다고 하기", need: [["진단서",["doctor's note"]]], hint: ["I need a ~ note for work.","I need a…","I need a doctor's note for work."], model: "I need a doctor's note for work." },
        { say: "No problem. How many days do you need it for?", want: "이틀이면 충분할 거라고 하기", need: [["이틀",["two days","2 days"]]], hint: ["~ days should be enough.","Two days…","Two days should be enough."], model: "Two days should be enough.", chunk: ["should be enough","~이면 충분할 거예요","확신 없는 추측을 부드럽게 말해요."] },
        { say: "Dr. Evans will sign it. It'll take about twenty minutes.", want: "사본을 이메일로도 보내 줄 수 있는지 묻기", need: [["이메일",["email"]]], hint: ["Could you also ~ me a copy?","Could you also…","Could you also email me a copy?"], model: "Could you also email me a copy?", chunk: ["a copy","사본","원본이 아닌 복사본이에요."] },
        { say: "Sure, I just need your address. There. Anything else?", want: "나은 뒤 확인하러 언제 다시 오면 되는지 묻기", need: [["다시 옴",["come back"]]], hint: ["When should I ~ back for a check-up?","When should I come…","When should I come back for a check-up?"], model: "When should I come back for a check-up?", chunk: ["check-up","재진·건강 검진","나은 뒤 상태를 보러 가는 진료예요."] }
      ],
      overhear: [
        ["guest","I need to refill my prescription.",[["refill","다시 채우다","같은 처방으로 약을 또 받을 때 써요."]]],
        ["them","Sure. Which pharmacy do you use?"],
        ["guest","The one on Main Street."],
        ["them","I'll call it in.",[["call it in","전화로 처방을 넣다","약국에 전화로 알려 주는 거예요."]]]
      ] }],
    ["17:00", "수업 결석 연락", "class", {
      who: "Mr. Brown", whoKo: "어학원 선생님", voices: { them: "m", guest: "f" }, guestKo: "다른 학생",
      turns: [
        { say: "Hello! I got your email. How are you feeling?", want: "나아지는 중이지만 내일도 못 갈 것 같다고 하기", need: [["내일",["tomorrow"]],["못 감",["can't come","can't make it","won't be able"]]], hint: ["Getting better, but I ~ come tomorrow.","Getting better, but…","Getting better, but I can't come tomorrow."], model: "Getting better, but I can't come tomorrow." },
        { say: "That's fine. Rest first. Would you like me to send the homework by email?", want: "네, 그러면 큰 도움이 되겠다고 하기", need: [["부탁",["yes please","that would help","that would be great"]]], hint: ["Yes, please. That would ~ a lot.","Yes, please. That…","Yes, please. That would help a lot."], model: "Yes, please. That would help a lot." },
        { say: "Sure. We're doing the past tense next.", want: "수업 필기를 반 친구에게 받아도 되는지 묻기", need: [["필기",["notes"]],["친구",["classmate","friend"]]], hint: ["Can I get the ~ from a classmate?","Can I get the…","Can I get the notes from a classmate?"], model: "Can I get the notes from a classmate?" },
        { say: "Of course. Just ask one of the students.", want: "숙제 마감을 하루 늦춰도 되는지 묻기", need: [["마감",["deadline","due date"]]], hint: ["Could I get an extra day on the ~?","Could I get an…","Could I get an extra day on the deadline?"], model: "Could I get an extra day on the deadline?" },
        { say: "Sure, no problem. Take care, and drink lots of tea.", want: "그러겠다고, 다음 주에 보자고 하기", need: [["다음 주",["next week"]]], hint: ["I will. See you ~ week!","I will. See…","I will. See you next week!"], model: "I will. See you next week!" }
      ],
      overhear: [
        ["guest","Mr. Brown, I missed the quiz yesterday.",[["missed","놓쳤다","수업·시험에 빠졌다는 뜻이에요."]]],
        ["them","That's okay. You can make it up on Friday.",[["make it up","보충하다","빠진 걸 나중에 채울 때 써요."]]],
        ["guest","Thank you! What time?"],
        ["them","After class, at four."]
      ] }]
  ]],
  ["다 나은 날", [
    ["09:00", "다시 진료실", "doctor", {
      who: "Dr. Evans", whoKo: "의사", voices: { them: "m2", guest: "f" }, guestKo: "간호사",
      turns: [
        { say: "Good morning! You look much better. How do you feel?", want: "훨씬 좋아졌고 열도 없어졌다고 하기", need: [["훨씬",["much better","a lot better"]]], hint: ["I feel ~ better, and the fever is gone.","I feel much better…","I feel much better, and the fever is gone."], model: "I feel much better, and the fever is gone.", chunk: ["is gone","사라졌어요","증상이 없어졌을 때 써요."] },
        { say: "Good. Let me listen to your lungs. Take a deep breath.", want: "기침은 이제 거의 안 한다고 하기", need: [["거의 안",["hardly","barely"]]], hint: ["Okay. I ~ cough anymore.","Okay. I…","Okay. I hardly cough anymore."], model: "Okay. I hardly cough anymore." },
        { say: "Sounds clear. And how's your appetite?", want: "입맛도 돌아왔다고 하기", need: [["입맛",["appetite"]],["돌아옴",["back"]]], hint: ["My ~ is back, too.","My appetite…","My appetite is back, too."], model: "My appetite is back, too." },
        { say: "Excellent. You can stop the medicine tomorrow. Any questions?", want: "내일 일하러 돌아가도 되는지 묻기", need: [["일",["work"]],["돌아감",["go back","return"]]], hint: ["Can I ~ back to work tomorrow?","Can I go…","Can I go back to work tomorrow?"], model: "Can I go back to work tomorrow?" },
        { say: "Yes, but take it easy for a couple of days.", want: "그러겠다고, 모든 게 고맙다고 하기", need: THANKS, hint: ["I will. ~ you for everything, Dr. Evans.","I will. Thank you…","I will. Thank you for everything, Dr. Evans."], model: "I will. Thank you for everything, Dr. Evans.", chunk: ["take it easy","무리하지 않다","아프다 나은 뒤에 자주 들어요."] }
      ],
      overhear: [
        ["guest","Dr. Evans, Ms. Kim is in room two.",[["is in room two","2번 방에 있어요","방 번호는 in room 숫자로 말해요."]]],
        ["them","Thanks. Tell her I'll be right there.",[["I'll be right there","곧 갈게요","바로 가겠다고 할 때 써요."]]],
        ["guest","Also, your lunch order came."],
        ["them","Great, leave it on my desk."]
      ] }],
    ["13:00", "일터에 복귀", "bookshop", {
      who: "Olivia", whoKo: "서점 카페 매니저", voices: { them: "f", guest: "m" }, guestKo: "직원",
      turns: [
        { say: "Hey, you're back! Are you feeling okay?", want: "다 나았고 일할 준비가 됐다고 하기", need: [["다 나음",["better","fine","recovered"]],["일",["work"]]], hint: ["I'm all ~, and I'm ready to work.","I'm all better, and…","I'm all better, and I'm ready to work."], model: "I'm all better, and I'm ready to work." },
        { say: "Great. We missed you. It was crazy busy last weekend.", want: "근무를 빠져서 죄송하다고 하기", need: [["빠짐",["missed"]]], hint: ["I'm sorry I ~ my shifts.","I'm sorry I…","I'm sorry I missed my shifts."], model: "I'm sorry I missed my shifts." },
        { say: "Don't worry. We got through it. Can you start by restocking the cups?", want: "좋다고, 컵은 어디 있는지 묻기", need: [["어디",["where"]]], hint: ["Sure. ~ are the extra cups?","Sure. Where are…","Sure. Where are the extra cups?"], model: "Sure. Where are the extra cups?", chunk: ["restock","다시 채워 넣다","떨어진 물건을 채울 때 써요."] },
        { say: "Under the counter, on the left. Oh, and a customer left you a note.", want: "누가 남겼는지 묻기", need: [["누구",["who"]]], hint: ["A note? ~ left it?","A note…","A note? Who left it?"], model: "A note? Who left it?" },
        { say: "The older gentleman who comes every day. It says, 'Get well soon.'", want: "정말 다정하시다고 하기", need: [["다정",["sweet","kind","thoughtful","nice"]]], hint: ["Aw, that's so ~ of him.","Aw, that's so…","Aw, that's so sweet of him."], model: "Aw, that's so sweet of him.", chunk: ["so sweet of him","정말 다정하시네요","친절한 행동을 칭찬할 때 써요."] }
      ],
      overhear: [
        ["guest","Olivia, where do you want these boxes?"],
        ["them","Just stack them in the back.",[["stack","쌓다","물건을 겹쳐 쌓을 때 써요."]]],
        ["guest","Okay. Is that all?"],
        ["them","For now. Thanks, Mark."]
      ] }],
    ["17:00", "공원으로 산책", "park", {
      who: "Ella", whoKo: "강아지 산책하는 이웃", voices: { them: "f", guest: "m2" }, guestKo: "지나가던 사람",
      turns: [
        { say: "Look who's out! Max missed you. Are you feeling better?", want: "응, 바깥 바람 좀 쐬러 나왔다고 하기", need: [["바깥 공기",["fresh air"]]], hint: ["Yes! I came out to get some ~ air.","Yes! I came out…","Yes! I came out to get some fresh air."], model: "Yes! I came out to get some fresh air." },
        { say: "Good idea. I heard you were sick. Was it the flu?", want: "독감은 아니고 독한 감기였다고 하기", need: [["독감",["flu"]],["감기",["cold"]]], hint: ["No, it wasn't the ~, just a nasty cold.","No, it wasn't the…","No, it wasn't the flu, just a nasty cold."], model: "No, it wasn't the flu, just a nasty cold." },
        { say: "That's a relief. Everyone in my building has been sick.", want: "조심하라고, 손을 자주 씻으라고 하기", need: [["씻기",["wash"]]], hint: ["Be careful! ~ your hands a lot.","Be careful! Wash…","Be careful! Wash your hands a lot."], model: "Be careful! Wash your hands a lot.", chunk: ["wash your hands","손을 씻다","감기 예방의 기본이에요."] },
        { say: "Will do. Hey, want to walk with us? Max could use the company.", want: "좋다고, 천천히 걷자고 하기", need: [["천천히",["slowly","slow"]]], hint: ["Sure, but let's go ~.","Sure, but…","Sure, but let's go slowly."], model: "Sure, but let's go slowly." },
        { say: "Deal. We'll go around the lake once. How's that?", want: "한 바퀴만 돌고 집에 가겠다고 하기", need: [["한 바퀴",["once","one lap","one round"]]], hint: ["Perfect. Just ~ around, then I'll go home.","Perfect. Just once around…","Perfect. Just once around, then I'll go home."], model: "Perfect. Just once around, then I'll go home." }
      ],
      overhear: [
        ["guest","Is it okay if my dog says hi to yours?",[["Is it okay if","~해도 될까요?","허락을 구하는 정중한 말이에요."]]],
        ["them","Sure. Max is friendly."],
        ["guest","Mine is shy though.",[["shy","낯을 가리는","사람·동물이 부끄러워할 때 써요."]]],
        ["them","No worries, we'll go slow."]
      ] }]
  ]],
  ["챙겨 준 친구", [
    ["11:00", "Sara의 수프", "home", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "Sara의 룸메이트",
      turns: [
        { say: "Come in! I made chicken soup. It's my mom's recipe.", want: "냄새가 정말 좋다며 직접 만든 거냐고 묻기", need: [["냄새",["smells","smell"]]], hint: ["Wow, it ~ amazing! Did you make it yourself?","Wow, it smells amazing…","Wow, it smells amazing! Did you make it yourself?"], model: "Wow, it smells amazing! Did you make it yourself?", chunk: ["smells amazing","냄새가 아주 좋아요","smell + 형용사로 말해요."] },
        { say: "I did! I was worried about you when you were sick.", want: "아플 때 돌봐 줘서 고맙다고 하기", need: [["돌봐 줌",["for taking care","for looking after","for checking on"]]], hint: ["Thanks ~ taking care of me while I was sick.","Thanks for taking care…","Thanks for taking care of me while I was sick."], model: "Thanks for taking care of me while I was sick.", chunk: ["take care of","돌보다","사람이나 물건 모두에게 써요."] },
        { say: "Of course! That's what friends are for. How's the soup?", want: "완벽하다고, 한 그릇 더 달라고 하기", need: [["더",["another","more","seconds"]]], hint: ["It's perfect. Can I have ~ bowl?","It's perfect. Can…","It's perfect. Can I have another bowl?"], model: "It's perfect. Can I have another bowl?", chunk: ["That's what friends are for","친구 좋다는 게 그거죠","고맙다는 말에 가볍게 답해요."] },
        { say: "Ha, sure! Eat as much as you want. Are you going back to work tomorrow?", want: "네, 내일부터 다시 출근한다고 하기", need: [["내일",["tomorrow"]],["출근",["work","shift"]]], hint: ["Yes, I'm back at ~ tomorrow.","Yes, I'm back…","Yes, I'm back at work tomorrow."], model: "Yes, I'm back at work tomorrow." },
        { say: "Great. Let me know if you need anything, okay?", want: "이미 많이 도와줬다며 이번 주말 저녁은 내가 산다고 하기", need: [["내가 삼",["on me","i'll buy","i'm buying","my treat"]]], hint: ["You've done so much already. Dinner is ~ me this weekend.","You've done so much already…","You've done so much already. Dinner is on me this weekend."], model: "You've done so much already. Dinner is on me this weekend." }
      ],
      overhear: [
        ["guest","Sara, do we have any more crackers?",[["any more","더 있어요?","남은 게 있는지 물을 때 써요."]]],
        ["them","Check the pantry.",[["pantry","식료품 수납장","부엌에서 식품을 두는 칸이에요."]]],
        ["guest","Found them. Thanks."],
        ["them","Don't eat them all."]
      ] }],
    ["15:00", "고마움의 선물 고르기", "souvenir", {
      who: "Hannah", whoKo: "기념품 가게 점원", voices: { them: "f2", guest: "m" }, guestKo: "다른 손님",
      turns: [
        { say: "Welcome in! Looking for anything special?", want: "아팠을 때 도와준 친구에게 줄 선물이 필요하다고 하기", need: [["선물",["gift","present"]]], hint: ["I need a thank-you ~ for a friend who helped me.","I need a thank-you gift…","I need a thank-you gift for a friend who helped me."], model: "I need a thank-you gift for a friend who helped me." },
        { say: "How sweet! What does your friend like?", want: "차를 좋아하니 머그컵이 좋겠다고 하기", need: [["머그컵",["mug","mugs","cup"]],["차",["tea"]]], hint: ["She loves ~, so maybe a mug.","She loves tea…","She loves tea, so maybe a mug."], model: "She loves tea, so maybe a mug." },
        { say: "We have these hand-painted mugs. Here's a blue one and a yellow one.", want: "파란 게 예쁘다고, 얼마인지 묻기", need: [["얼마",["how much","price","cost"]]], hint: ["The blue one is pretty. ~ much is it?","The blue one is…","The blue one is pretty. How much is it?"], model: "The blue one is pretty. How much is it?" },
        { say: "Eighteen dollars. I can put in some tea bags for free.", want: "완벽하다고, 선물 포장도 되는지 묻기", need: [["포장",["wrap","gift wrap"]]], hint: ["Perfect! Could you gift ~ it?","Perfect! Could you…","Perfect! Could you gift wrap it?"], model: "Perfect! Could you gift wrap it?" },
        { say: "Of course. That's eighteen plus two for wrapping. Twenty total.", want: "20달러를 내며 고맙다고 하기", need: [["20",["twenty","20"]]], hint: ["Here's ~. Thanks for your help!","Here's twenty. Thanks…","Here's twenty. Thanks for your help!"], model: "Here's twenty. Thanks for your help!", chunk: ["Here's twenty","20달러예요","돈을 건넬 때 Here's + 금액이라고 해요."] }
      ],
      overhear: [
        ["guest","Do you ship overseas?",[["ship","배송하다","우편·택배로 보낼 때 써요."]]],
        ["them","Yes, but it takes about two weeks."],
        ["guest","Is there a rush option?",[["rush","빠른 배송","급하게 해 주는 서비스예요."]]],
        ["them","Yes, five days for an extra ten dollars."]
      ] }],
    ["19:00", "Sara에게 선물 주기", "meetup", {
      who: "Sara", whoKo: "친구", voices: { them: "f2", guest: "m" }, guestKo: "옆 사람",
      turns: [
        { say: "Hey, you! Look at you, up and about. How was your day?", want: "선물을 건네며 작은 고마움의 표시라고 하기", need: [["선물",["gift","present"]]], hint: ["I got you a ~. It's a small thank-you.","I got you a…","I got you a gift. It's a small thank-you."], model: "I got you a gift. It's a small thank-you." },
        { say: "Aw, you didn't have to! Oh, it's a mug! I love the blue.", want: "마음에 들어서 정말 다행이라고 하기", need: [["다행",["glad","happy","relieved"]]], hint: ["I'm so ~ you like it.","I'm so glad…","I'm so glad you like it."], model: "I'm so glad you like it." },
        { say: "I do. Honestly, you'd do the same for me.", want: "당연하다고, 언제든 전화하라고 하기", need: [["언제든",["anytime","any time","whenever"]]], hint: ["Of course I would. Just call me ~.","Of course I would…","Of course I would. Just call me anytime."], model: "Of course I would. Just call me anytime." },
        { say: "I will. So, what's next for you? Now that you're better and have a job.", want: "곧 인턴을 찾아보고 싶다고 하기", need: [["인턴",["internship","intern"]]], hint: ["I want to start looking for an ~ soon.","I want to start…","I want to start looking for an internship soon."], model: "I want to start looking for an internship soon." },
        { say: "That's awesome! You've come so far already.", want: "그러게, 벌써 6주가 지났다니 믿기지 않는다고 하기", need: [["6주",["six weeks"]]], hint: ["I know. I can't believe it's been ~ weeks already.","I know. I can't…","I know. I can't believe it's been six weeks already."], model: "I know. I can't believe it's been six weeks already.", chunk: ["I can't believe","믿기지 않아요","놀라움을 말할 때 써요."] }
      ],
      overhear: [
        ["guest","Sara, did you bring the board games?",[["board games","보드게임","모임에서 자주 하는 놀이예요."]]],
        ["them","Yes, they're in my bag."],
        ["guest","Great. Can we play after we eat?"],
        ["them","Definitely. You in, too?",[["You in","너도 할래?","참여할지 물을 때 써요."]]]
      ] }]
  ]]
]);
