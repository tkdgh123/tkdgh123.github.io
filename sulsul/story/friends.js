// 목표: 외국인 친구. 모임에서 Sara를 만나 친해지는 이야기 — 취미, 한국 소개, 약속, 고민 들어 주기. 내가 말한 취미·음식을 Sara가 기억한다.
EP({ id: "f1", part: "daily", who: "sara", time: "evening", title: "모임에서 처음 만난 사람", guest: "옆 사람",
  lines: {
    a: { say: "Hi! I don't think we've met. I'm Sara.", task: "반갑다고 하며 내 이름을 말해요",
      go: [{ m: [M.hi, ["이름", ["{name}", "my name", "name be", "call me"]]], ex: "Nice to meet you, Sara. I'm {name}.", to: "b" }] },
    b: { say: [["lv:2", "So, what brings you to this meetup? I come mostly for the free snacks, to be honest."], [null, "So, what brings you to this meetup?"]], task: "온 이유를 말해요 — 영어 연습이든 친구 사귀기든",
      go: [{ m: [["이유", ["practice", "english", "friend", "people", "new", "meet new", "meet people", "fun", "bored", "hang out", "learn", "invited", "curious"]]], ex: "I want to practice English and meet new people.", to: "c" }] },
    c: { say: "Love that. What do you do for fun?", task: "내 진짜 취미를 하나 말해요 (게임·운동·음악·요리·영화·여행·그림…)",
      go: [{ m: [["취미", ["games", "soccer", "football", "basketball", "baseball", "volleyball", "badminton", "tennis", "golf", "running", "jogging", "swimming", "hiking", "climbing", "cycling", "yoga", "the gym", "working out", "music", "kpop", "guitar", "piano", "singing", "dancing", "cooking", "baking", "movies", "dramas", "anime", "webtoons", "drawing", "painting", "reading", "writing", "traveling", "camping", "fishing", "photography", "coding", "shopping"]]], ex: "I really like gaming. I play almost every night.", cap: "hobby", to: "d", tip: ["What do you do for fun?", "취미가 뭐예요?", "What's your hobby?보다 훨씬 자주 써요."] },
        { m: [["좋아하는 것", ["i like", "i love", "i enjoy", "i play", "i watch", "i go", "my hobby", "into", "for fun i"]]], ex: "I like playing chess with my dad.", fallback: 1, to: "d" }] },
    d: { say: [["hobby", "No way, {hobby}? My brother is really into that. How did you get into it?"], [null, "How did you get into it?"]], task: "어떻게 시작하게 됐는지 짧게 말해요",
      go: [{ m: [["시작", ["start", "began", "when i", "got into", "friend", "brother", "sister", "dad", "mom", "father", "mother", "parents", "cousin", "school", "year", "ago", "since", "kid", "child", "young", "youtube", "first time", "because"]]], ex: "My friend got me into it in high school.", to: "e", tip: ["get into ~", "~에 빠지다", "취미를 시작하게 된 계기를 말할 때 써요."] }] },
    e: { say: [["lv:2", "That's so cool. There aren't many people around here who are into that. Hey, we should hang out sometime!"], [null, "That's so cool. Hey, we should hang out sometime!"]], task: "좋다고 하고, 연락처를 주고받자고 해요",
      go: [{ m: [M.yes, ["연락처", ["number", "instagram", "insta", "contact", "kakao", "whatsapp", "phone", "line", "snapchat", "discord", "text", "add you", "follow", "dm"]]], ex: "I'd love to! Can I get your number?", to: "end" }] }
  },
  bye: "Here, put your number in my phone. I'll text you!",
  hear: [
    ["guest", "So, where are you from?", [["Where are you from?", "어디서 왔어요?", "처음 만나면 꼭 나오는 질문이에요."]]],
    ["them", "I grew up in Toronto, but I've lived here for five years.", [["I grew up in", "~에서 자랐어요", "고향을 말할 때 써요."]]],
    ["guest", "Oh, how do you like it here?", [["How do you like ~?", "~ 어때요?", "느낌을 물을 때 써요."]]],
    ["them", "I love it. The food is amazing."]
  ] });

EP({ id: "f2", part: "daily", who: "ella", time: "morning", title: "공원 산책 이웃", need: { after: ["f1"] }, guest: "지나가던 사람",
  lines: {
    a: { say: "Oh, sorry! Max, come here! Don't worry, he's friendly.", task: "괜찮다고, 강아지가 귀엽다고 말해요",
      go: [{ m: [["괜찮음", [...M.ok[1], "you be good", "you be fine"]], ["귀여움", ["cute", "cutie", "adorable", "sweet", "beautiful", "lovely", "good boy", "handsome", "friendly", "pretty", "love dog"]]], ex: "No problem! He's so cute.", to: "b" }] },
    b: { say: [["lv:2", "Thanks! He's three, and he thinks everyone's his best friend. Do you have a dog?"], [null, "Thanks! He's three. Do you have a dog?"]], task: "개를 키우는지 사실대로 말해요 (하나 덧붙이면 더 좋아요)", more: {},
      go: [
        { m: [["있음", ["yes", "i have", "i have got", "back home", "in korea", "my dog"]]], ex: "Yes, I have a dog back home in Korea. I miss her.", set: { pet: "yes" }, to: "c" },
        { m: [["없음", ["no", "do not", "never", "someday", "not allowed", "can not have"]]], ex: "No, but I'd love one someday. Dogs are so cute.", set: { pet: "no" }, to: "c" }] },
    c: { say: "Nice weather today, isn't it? Finally some sun!", task: "날씨 이야기에 맞장구쳐요 (한마디 덧붙이면 더 좋아요)", more: {},
      go: [{ m: [["맞장구", ["yes", "i know", "right", "totally", "nice", "beautiful", "perfect", "love", "lovely", "great", "finally", "agree", "warm", "sunny", "good", "so good", "amazing", "wonderful", "true"]]], ex: "I know, right? It's perfect for a walk.", to: "d", tip: ["I know, right?", "그러니까요!", "맞장구칠 때 아주 자주 써요."] }] },
    d: { say: "Do you come to this park often?", task: "자주 오는지 말해요 (언제 오는지 붙이면 더 좋아요)", more: { m: [["언제", ["weekend", "morning", "evening", "night", "afternoon", "lunch", "after class", "after work", "after school", "before class", "before work", "every day", "daily", "sunday", "saturday", "monday", "tuesday", "wednesday", "thursday", "friday", "when", "on my way", "summer", "spring", "fall", "winter", "sunny day"]]] },
      go: [{ m: [["얼마나", ["every", "often", "sometimes", "first", "second time", "weekend", "morning", "evening", "usually", "twice", "once", "rarely", "always", "daily", "when i can", "new here", "not really", "yes", "no"]]], ex: "Sometimes. I usually come on weekends.", to: "end" }] }
  },
  bye: [["pet=yes", "Well, see you around! Bring a photo of your dog next time. Say bye, Max!"], [null, "Well, see you around then! Say bye, Max!"]],
  hear: [
    ["guest", "What a beautiful day!"],
    ["them", "I know, right? Perfect for a walk."],
    ["guest", "Is there a good café around here?", [["around here", "이 근처에", "근처를 물을 때 써요."]]],
    ["them", "Yes, there's a nice one by the lake. Try their muffins!"]
  ] });

EP({ id: "f3", part: "daily", who: "sara", art: "home", time: "evening", title: "Sara 집에서 한국 이야기", need: { after: ["f1"], rel: { sara: 1 } }, guest: "Sara의 친구",
  lines: {
    a: { say: "Hey, you made it! Come in. I'm making dinner, but… I've always wanted to try Korean food. What should I try first?", task: "한국 음식 하나를 추천해요 (떡볶이·비빔밥·불고기·김치찌개·치킨…)",
      go: [{ m: [["한국 음식", ["tteokbokki", "bibimbap", "bulgogi", "kimchi", "kimchi stew", "kimchi jjigae", "kimchi fried rice", "korean fried chicken", "fried chicken", "chicken", "samgyeopsal", "korean bbq", "japchae", "kimbap", "gimbap", "ramyeon", "ramen", "galbi", "naengmyeon", "jjajangmyeon", "sundubu", "doenjang", "bossam", "mandu", "dumplings", "hotteok", "pajeon"]]], ex: "You should try bibimbap. It's really popular.", cap: "kfood", to: "b", tip: ["You should try ~", "~ 꼭 먹어 봐요", "추천할 때 가장 쉬운 말이에요."] }] },
    b: { say: [["kfood", "{kfood}? What is it like?"], [null, "What is it like?"]], task: "어떤 음식인지 두 가지로 설명해요 (맛·재료·먹는 법 중에서)",
      go: [{ m: [["두 가지 설명", ["rice", "noodles", "beef", "pork", "chicken", "meat", "fish", "seafood", "tofu", "vegetables", "egg", "rice cake", "sauce", "soup", "kimchi", "seaweed", "gochujang", "red pepper", "cheese", "spicy", "sweet", "salty", "sour", "mix", "stir", "hot", "crispy", "savory", "delicious", "chewy", "soft", "tastes", "spoon", "chopsticks", "bowl", "fried", "grilled", "boiled", "wrap"], 2]], ex: "It's rice with vegetables and an egg. You mix it with spicy sauce.", to: "c", tip: ["What is it like?", "어떤 거예요?", "모르는 것을 설명해 달라고 할 때 써요."] }] },
    c: { say: [["lv:2", "That sounds amazing. Is it really spicy, though? I'm kind of a wimp when it comes to spicy food."], [null, "That sounds amazing. Is it really spicy? I'm not great with spicy food."]], task: "걱정 말라고, 맵기를 조절할 수 있다고 안심시켜요",
      go: [{ m: [["안심", ["do not worry", "no worries", "it be okay", "it be fine", "you can", "no problem"]], ["조절", ["less", "little", "not too", "mild", "add", "control", "choose", "level", "adjust", "not spicy", "without", "skip", "no sauce", "make it", "down", "tone"]]], ex: "Don't worry. You can add less sauce.", to: "d" }] },
    d: { say: "Okay, deal. Next time, can you cook it for me?", task: "좋다고, 내가 만들어 주겠다고 하며 날짜를 제안해요",
      go: [{ m: [["요리할 날", DAYS_EN], M.yes], ex: "Of course! How about this Saturday?", cap: "cookday", to: "end" }] }
  },
  bye: "It's a date! I'll buy the ingredients.",
  hear: [
    ["guest", "This is delicious! Did you make it yourself?", [["Did you make it yourself?", "직접 만들었어요?", "음식을 칭찬할 때 붙여요."]]],
    ["them", "Yeah, it's my mom's recipe."],
    ["guest", "Can I have some more?", [["Can I have some more?", "더 먹어도 돼요?", "음식을 더 달라고 할 때 써요."]]],
    ["them", "Help yourself!", [["Help yourself", "마음껏 드세요", "편하게 가져다 먹으라는 말이에요."]]]
  ] });

EP({ id: "f4", part: "daily", who: "ava", time: "evening", title: "Sara와 영화 보기", need: { after: ["f3"] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi! What would you like to see tonight? We have a comedy, a horror movie, and a new action movie.", task: "Sara랑 볼 영화 장르를 골라 표 두 장을 달라고 해요",
      go: [
        { m: [["코미디", ["comedy", "funny"]], ["두 장", ["two", "both", "for us"]]], ex: "Two tickets for the comedy, please.", set: { genre: "comedy" }, to: "b" },
        { m: [["공포", ["horror", "scary"]], ["두 장", ["two", "both", "for us"]]], ex: "Two tickets for the horror movie, please.", set: { genre: "horror movie" }, to: "b" },
        { m: [["액션", ["action"]], ["두 장", ["two", "both", "for us"]]], ex: "Two tickets for the action movie, please.", set: { genre: "action movie" }, to: "b" }] },
    b: { say: [["lv:2", "Sure. It's filling up, but I've still got a few spots. Where would you like to sit?"], [null, "Where would you like to sit?"]], task: "가운데쯤 붙어 있는 자리를 부탁해요",
      go: [{ m: [["붙은 자리", ["together", "next each other", "side by side", "two seat"]], ["위치", ["middle", "center", "centre", "back", "front", "aisle", "good"]]], ex: "Two seats together in the middle, please.", to: "c" }] },
    c: { say: "Here you go. Would you like any snacks? A combo is twelve dollars.", task: "큰 팝콘 하나를 달라고 해요 (둘이 나눠 먹을 거라고 붙이면 더 좋아요)", more: { m: [["나눠 먹기", ["share", "split", "for two", "for us", "both of us", "two of us", "together", "for both"]]] },
      go: [{ m: [["팝콘", ["popcorn"]], ["크기", ["large", "big"]]], ex: "Just one large popcorn to share, please.", to: "end", tip: ["to share", "나눠 먹을", "둘이 같이 먹을 거라고 할 때 붙여요."] }] }
  },
  bye: "Enjoy the movie!",
  hear: [
    ["guest", "Is the nine o'clock show sold out?", [["sold out", "매진", "표가 다 팔렸다는 뜻이에요."]]],
    ["them", "Almost. Only a few seats left in the front row."],
    ["guest", "That's okay, I'll take one."],
    ["them", "Great. It starts in theater three."]
  ] });

EP({ id: "f5", part: "daily", who: "sara", art: "home", time: "night", title: "Sara의 고민", need: { after: ["f4"], rel: { sara: 2 } }, guest: "Sara의 룸메이트",
  lines: {
    a: { say: [["cookday", "Hey… thanks for coming. Sorry — I know we planned {kfood} for {cookday}, but I'm not in a great mood today."], [null, "Hey… thanks for coming. Sorry, I'm not in a great mood today."]], task: "괜찮다고, 무슨 일인지 물어봐요",
      go: [{ m: [["괜찮음", [...M.ok[1], "do not be sorry"]], ["무슨 일", ["what be wrong", "what happen", "what be up", "be you okay", "everything okay", "talk about it", "what be going on", "tell me", "what be matter"]]], ex: "It's okay. What happened?", to: "b" }] },
    b: { say: "I didn't get the job I applied for. I really wanted it.", task: "속상했겠다고 공감해요 (해결책보다 먼저)",
      go: [{ m: [["공감", ["sorry", "too bad", "sucks", "must be", "understand", "rough", "terrible", "awful", "that be hard", "sad", "oh no", "poor"]]], ex: "Oh no, I'm so sorry to hear that. That must be really hard.", to: "c", tip: ["That must be hard", "많이 힘들겠다", "must be로 상대 마음을 짐작해 줘요."] }] },
    c: { say: [["lv:2", "Yeah. I worked so hard on that application. I just can't stop feeling like I'm not good enough."], [null, "Yeah. I just feel like I'm not good enough."]], task: "그렇지 않다고, 내가 본 Sara의 좋은 점 하나를 말해요",
      go: [{ m: [["아님", ["not true", "that be not", "you be", "no way", "do not say"]], ["좋은 점", ["kind", "smart", "hardworking", "work hard", "friendly", "funny", "talented", "great", "amazing", "helpful", "good", "strong", "best", "creative", "nice", "brave", "capable", "enough", "smartest", "clever", "kindest", "best", "one of"]]], ex: "That's not true. You're so kind and hard-working.", to: "d" }] },
    d: { say: [["hobby", "Thanks… Maybe I need a break. Hey, you told me about {hobby} — could you show me sometime?"], [null, "Thanks… Maybe I need a break. Could we do something fun this weekend?"]], task: "좋다고, 이번 주말에 같이 하자고 해요",
      go: [{ m: [M.yes, ["주말", ["weekend", "saturday", "sunday"]]], ex: "Of course! Let's do it this weekend.", to: "end" }] }
  },
  bye: [["genre", "You're the best. I feel better already. Another {genre} soon?"], [null, "You're the best. I feel better already."]],
  hear: [
    ["guest", "Sara, do you want some tea?"],
    ["them", "Yes, please. Chamomile, if we have it."],
    ["guest", "Hang in there. Things will get better.", [["Hang in there", "조금만 버텨", "힘든 사람을 응원할 때 써요."]]],
    ["them", "Thanks. I know they will."]
  ] });
