// 목표: 외국인 친구 2부. 브런치 약속, 이웃, 헬스장, 미용실, 한국 문화 소개(나이·설날·소주), 농담·오해·칭찬, 집들이, 생일, 작별까지.
// lv = 그 수준부터 나오는 차례, 말 고르기의 "lv:2" = 그 수준부터 상대가 더 길게 말함.
EP({ id: "f6", part: "daily", who: "sara", time: "day", title: "토요일 브런치 초대", need: { after: [["f4", "f5"]] }, guest: "Sara의 친구",
  lines: {
    a: { say: "Oh good, I was just about to text you! A few of us are doing brunch this Saturday. Are you free?", task: "그날 시간이 되는지 사실대로 말해요",
      go: [
        { m: [["가능", ["free", "i can make it", "sounds good", "count me in", "i would love", "yes", "sure", "no plans", "nothing planned", "available", "i am in", "i will be there"]]], ex: "Yes, I'm free! I'd love to come.", set: { brunch: "yes" }, to: "b" },
        { m: [["안 됨", ["busy", "can not", "already have plans", "have plans", "have class", "have work", "i work", "i study", "exam", "not free", "not available", "other plans", "i wish i could", "sorry"]]], ex: "Sorry, I can't. I already have plans on Saturday.", set: { brunch: "busy" }, to: "b2" }] },
    b: { say: "Yay! We're thinking eleven at the place near campus. Does that work for you?", task: "시간이 괜찮은지, 아니면 다른 시간이 좋은지 말해요",
      go: [
        { m: [["괜찮음", ["eleven", "works", "that is fine", "perfect", "sounds good", "not too early", "good for me", "no problem"]]], ex: "Eleven works for me.", reply: "Great, see you there!", to: "c" },
        { m: [["늦게", ["later", "noon", "twelve", "a little later", "bit later", "bit early", "little early", "too early", "not a morning person", "sleep in"]]], ex: "Could we make it noon? I'm not a morning person.", reply: "Ha, noon it is. We'll push it back.", to: "c", tip: ["I'm not a morning person", "저는 아침형 인간이 아니에요", "일찍 일어나기 힘들다는 말을 가볍게 하는 표현이에요."] }] },
    b2: { say: "Oh no, that's okay! Are you free on Sunday instead? We could do a late lunch.", task: "일요일은 되는지 말해요",
      go: [
        { m: [["일요일 가능", ["sunday works", "sunday is fine", "sunday is good", "sunday is perfect", "sunday sounds good", "yes", "sure", "i can do sunday", "sunday"]]], ex: "Sunday works for me. Thanks for asking!", reply: "Yay! Sunday it is.", to: "d" },
        { m: [["다음 기회", ["next time", "next week", "another time", "maybe later", "still busy", "all weekend", "whole weekend", "not this weekend", "have fun", "enjoy"]]], ex: "I'm busy all weekend, sorry. Next time for sure!", reply: "No worries, we'll plan another one.", to: "d" }] },
    c: { lv: 2, say: "Awesome. Oh, and my friend Mia is coming too, she's vegetarian, so we picked a place with lots of options. Any food you can't eat?", task: "못 먹는 음식이 있는지 말해요",
      go: [{ m: [["대답", ["can not eat", "i can not", "allergic", "allergy", "no", "nothing", "i eat everything", "anything", "vegetarian", "peanut", "seafood", "shellfish", "gluten", "dairy", "spicy", "pork", "beef", "i can eat", "not picky"]]], ex: "I eat everything, so anywhere is fine.", to: "d" }] },
    d: { say: "Okay! Should I text you the details, or do you use KakaoTalk or something?", task: "어떤 메신저로 연락받고 싶은지 말해요",
      go: [{ m: [["메신저", ["text", "message", "kakao", "kakaotalk", "whatsapp", "dm", "instagram", "insta", "call", "phone", "line", "either", "anything"]]], ex: "Text is fine, or KakaoTalk if you have it.", to: "end" }] }
  },
  bye: "Perfect. I'll send you all the details tonight!",
  hear: [
    ["guest", "Are you coming to brunch on Saturday?", [["Are you coming to ~?", "~에 올 거예요?", "모임에 오는지 물을 때 써요."]]],
    ["them", "I wouldn't miss it. Last time the pancakes were incredible.", [["I wouldn't miss it", "놓칠 수 없죠", "꼭 간다고, 기대된다고 할 때 써요."]]],
    ["guest", "Same. Should I bring anything?"],
    ["them", "Just yourself! And a big appetite."]
  ] });

EP({ id: "f7", part: "daily", who: "ella", time: "morning", title: "Max와 함께 산책", need: { after: ["f2", ["f4", "f5"]] }, guest: "조깅하던 사람",
  lines: {
    a: { say: "Hey, you're back! Max has been waiting for you. We're doing the long loop today. Want to join us?", task: "같이 걸을지 마음대로 정해요",
      go: [
        { m: [M.yes, ["같이", ["join", "with you", "with max", "walk", "come", "together", "love to", "happy to"]]], ex: "Sure, I'd love to walk with you and Max.", to: "b" },
        { m: [["오늘은 안 됨", ["not today", "next time", "tomorrow", "class", "late", "busy", "have to go", "have to run", "another day", "can not today", "maybe tomorrow"]]], ex: "Not today, I'm late for class. Maybe tomorrow?", reply: "No problem! Tomorrow it is.", to: "b" }] },
    b: { say: "I usually walk him in the morning and again in the evening. When do you have free time to walk?", task: "산책하기 좋은 시간대를 말해요",
      go: [{ m: [["시간대", ["morning", "afternoon", "evening", "weekend", "night"]]], ex: "Mornings are best for me, before class.", cap: "walktime", to: "c" }] },
    c: { say: [["pet=yes", "Oh, I almost forgot to ask. How's your dog back home? What's she like?"], [null, "Oh, I almost forgot to ask. Did you have any pets growing up?"]],
      task: [["pet=yes", "집에 있는 강아지는 어떤지 말해요"], [null, "어릴 때 동물을 키워 본 적 있는지 말해요"]],
      go: [{ m: [["대답", ["she is", "he is", "my dog", "we had", "i had", "never", "no", "dog", "cat", "bird", "fish", "hamster", "friendly", "shy", "big", "small", "lazy", "energetic", "funny", "cute", "loud", "old", "young", "puppy", "grew up", "not really"]]], ex: "She's small and very shy, but she loves food.", to: "d" }] },
    d: { lv: 2, say: "Aw, I love that. Max gets nervous around loud noises, and the park gets crowded on weekends. Do you know any quiet spots to walk?", task: "조용한 산책 장소를 아는지 말해요",
      go: [{ m: [["장소", ["park", "river", "lake", "trail", "hill", "mountain", "garden", "street", "bridge", "quiet", "near", "campus", "behind", "forest", "path", "yes", "no", "not really"]]], ex: "There's a quiet trail behind my campus.", to: "e" }] },
    e: { say: "Okay, I should get this guy home for breakfast. Walk again soon?", task: "또 걷자고 하며 날짜를 잡아요",
      go: [{ m: [M.yes, ["날짜", [...DAYS_EN, "soon", "next time", "again"]]], ex: "Definitely! Same time tomorrow?", to: "end" }] }
  },
  bye: [["pet=yes", "Perfect. And next time, bring a photo of your dog! Say bye, Max!"], [null, "Perfect. See you on the trail! Say bye, Max!"]],
  hear: [
    ["guest", "Sorry, is he friendly? I don't want my dog to get scared.", [["Is he friendly?", "물지 않나요?", "낯선 개 앞에서 먼저 물어봐요."]]],
    ["them", "Totally harmless. He just wants a belly rub."],
    ["guest", "Aw, what a sweetheart. How old is he?"],
    ["them", "He's three, but he still acts like a puppy.", [["acts like a puppy", "강아지처럼 굴어요", "나이에 비해 어리게 군다는 뜻이에요."]]]
  ] });

EP({ id: "f8", part: "daily", who: "tyler", time: "day", title: "헬스장 첫 운동", need: { after: [["f4", "f5"]] }, guest: "다른 회원",
  lines: {
    a: { say: "Hey, you came back! I'm Tyler, one of the trainers here. Is this your first real workout with us?", task: "맞다고, 오늘이 첫 운동이라고 말해요",
      go: [{ m: [["첫 운동", ["first", "yes", "today", "right", "that be right", "finally", "excited", "ready", "nervous"]]], ex: "Yes, it's my first workout here today.", to: "b" }] },
    b: { say: "Cool. So what are you training for? Losing weight, building muscle, or just staying healthy?", task: "운동하는 목적을 사실대로 골라 말해요",
      go: [
        { m: [["살 빼기", ["lose weight", "weight loss", "slim down", "diet", "burn fat", "lose fat", "get thinner", "lose a little"]]], ex: "I want to lose a little weight.", set: { fitgoal: "lose" }, to: "c" },
        { m: [["근육", ["muscle", "get strong", "stronger", "bulk", "abs", "six pack", "build body", "gain weight"]]], ex: "I want to build some muscle.", set: { fitgoal: "muscle" }, to: "c" },
        { m: [["건강", ["healthy", "health", "stay fit", "in shape", "energy", "stamina", "stress", "stay active"]]], ex: "Just to stay healthy and in shape.", set: { fitgoal: "health" }, to: "c" }] },
    c: { say: [["hobby", "Nice! Sara mentioned you're into {hobby}, so that'll help. Have you worked out before?"], [null, "Nice! Have you worked out before?"]], task: "운동해 본 적이 있는지 말해요 (얼마나 했는지 덧붙이면 더 좋아요)", more: {},
      go: [{ m: [["경험", ["before", "yes", "used to", "sometimes", "a little", "never", "first time", "no", "once", "few times", "regularly", "years", "months", "school", "run", "lift", "swim"]]], ex: "A little. I used to lift weights in high school.", to: "d" }] },
    d: { lv: 3, say: "Cool. Any injuries or sore spots I should know about, like your knees or your back?", task: "아픈 곳이나 다친 곳이 있는지 말해요",
      go: [{ m: [["몸 상태", ["knee", "back", "shoulder", "ankle", "wrist", "neck", "no injuries", "no", "nothing", "none", "i am fine", "all good", "healthy", "injury", "sore"]]], ex: "My left knee hurts a little when I run.", to: "e" }] },
    e: { say: "Alright, I'll show you around. Treadmills are over there, and the weights are in the back. Want a free session with one of our trainers?", task: "무료 트레이너 시간을 받을지 마음대로 정해요",
      go: [
        { m: [["받음", ["yes", "sure", "please", "love to", "sounds good", "that would be great", "why not", "definitely", "that sounds great"]]], ex: "Sure, that sounds great. Thank you!", to: "end" },
        { m: [["다음에", ["not today", "maybe later", "next time", "i will think", "let me think", "later", "nothanks", "just look around", "first look"]]], ex: "Maybe next time. I'd like to look around first.", to: "end", tip: ["Maybe next time", "다음에 할게요", "거절하지만 완전히 닫지 않는 표현이에요."] }] }
  },
  bye: [["fitgoal=lose", "Awesome. We'll make a plan to help you drop that weight."], ["fitgoal=muscle", "Awesome. We'll get you lifting properly."], [null, "Awesome. Let's start easy and build up."]],
  hear: [
    ["guest", "Excuse me, are you using this bench?", [["using this bench", "이 벤치 쓰고 있어요", "기구를 쓰는지 물을 때 써요."]]],
    ["them", "All yours. I'm just finishing my last set.", [["my last set", "마지막 세트", "운동이 거의 끝났다고 할 때 써요."]]],
    ["guest", "Thanks. Could you spot me for a second?", [["spot me", "옆에서 봐 줘요", "무거운 걸 들 때 안전을 도와 달라는 말이에요."]]],
    ["them", "Sure, no problem."]
  ] });

EP({ id: "f9", part: "daily", who: "jess", time: "day", title: "미용실 수다", need: { after: [["f6", "f7"]] }, guest: "다른 손님",
  lines: {
    a: { say: "Hi again! Good to see you back. What are we doing this time?", task: "어떤 머리를 하고 싶은지 말해요 (다듬기·앞머리·파마·레이어드·염색 중에서)",
      go: [
        { m: [["머리", ["trim", "bangs", "perm", "layers", "dye", "color", "highlights"]]], ex: "I'd like bangs, please.", cap: "haircut", to: "b", tip: ["Just a trim", "끝만 다듬어 주세요", "머리 길이를 거의 안 바꿀 때 써요."] },
        { m: [["자르기", ["cut", "haircut", "shorter", "short", "chop off"]]], ex: "Just a haircut. Shorter, please.", set: { haircut: "cut" }, fallback: 1, to: "b" }] },
    b: { say: [["lv:2", "Okay, have a seat. I'll wash your hair first. So, how's the semester treating you? Busy?"], [null, "Okay, have a seat. How's the semester going?"]], task: "학기가 어떤지 말해요 (왜 그런지 덧붙이면 더 좋아요)", more: {},
      go: [{ m: [["학기", ["busy", "good", "great", "fun", "hard", "tired", "okay", "exam", "class", "project", "stress", "fine", "interesting", "difficult", "crazy", "not bad", "tough", "love"]]], ex: "Pretty busy. I have a big project this week.", to: "c" }] },
    c: { say: "Nice. Okay, let me check the length. Is that good, or do you want it a little shorter?", task: "길이가 괜찮은지 말해요",
      go: [
        { m: [["괜찮음", ["it be okay", "okay", "good", "great", "perfect", "love it", "just right", "fine", "not too short", "that is good", "looks good"]]], ex: "That looks perfect, thanks.", to: "d" },
        { m: [["더 짧게", ["shorter", "a little more", "bit more", "cut more", "take more off", "too long", "little shorter", "more off"]]], ex: "Could you take a bit more off?", to: "d" }] },
    d: { say: "You got it. So, do you have any plans this weekend?", task: "주말 계획이 있는지 말해요",
      go: [
        { m: [["계획 있음", ["i am going", "i will", "meeting", "going to", "brunch", "hang out", "with a friend", "with friends", "have plans", "plans to", "visit", "hiking", "movie", "party", "dinner", "lunch", "gym"]]], ex: "Yes, I'm having brunch with a friend.", to: "end" },
        { m: [["계획 없음", ["no plans", "nothing", "not much", "not sure", "relax", "stay home", "sleep", "rest", "nothing special", "chill", "lazy"]]], ex: "Not much. Probably just relaxing at home.", to: "end" }] }
  },
  bye: "All done! You look great. See you next time!",
  hear: [
    ["guest", "Hi, I have a two o'clock appointment with Kim.", [["a two o'clock appointment", "2시 예약", "예약 시간을 말할 때 써요."]]],
    ["them", "Perfect, take a seat. Can I get you anything to drink?"],
    ["guest", "Just water, thanks. Do you do kids' haircuts too?", [["Do you do ~?", "~도 해요?", "그 서비스가 있는지 물을 때 써요."]]],
    ["them", "Of course, we love little ones."]
  ] });

EP({ id: "f10", part: "daily", who: "green", time: "day", title: "옆집 할머니의 쿠키", need: { after: [["f7", "f8"]] }, guest: "지나가던 이웃",
  lines: {
    a: { say: "Oh, hello again, dear! I baked far too many cookies. Would you like some?", task: "쿠키를 받을지 마음대로 정해요",
      go: [
        { m: [M.thx], ex: "Oh, thank you! That's so kind.", reply: "Here, take a few.", to: "b" },
        { m: [["사양", ["nothanks", "not hungry", "just ate", "full", "maybe later", "i am okay", "i am good", "no"]]], ex: "No, thanks. I just ate.", reply: "Oh, that's alright. Maybe next time.", to: "b" }] },
    b: { say: "These are oatmeal raisin. My grandkids won't touch them, so I'm lucky you're here! Tell me, dear, are you getting used to the neighborhood?", task: "동네가 어떤지 말해요 (좋은 점 하나를 덧붙이면 더 좋아요)", more: {},
      go: [{ m: [["동네", ["quiet", "nice", "friendly", "love", "like", "good", "great", "safe", "clean", "beautiful", "busy", "noisy", "convenient", "lovely", "still getting used", "new", "kind", "wonderful"]]], ex: "Yes, it's very quiet, and everyone has been friendly.", to: "b2" }] },
    b2: { lv: 2, say: "Good to hear. I do worry about the noise from the street, though. Does it ever keep you up at night?", task: "밤에 시끄러운지 말해요",
      go: [{ m: [["소음", ["noise", "noisy", "loud", "quiet", "sleep", "fine", "no problem", "not really", "no", "sometimes", "street", "car", "night", "bother", "earplugs", "used to"]]], ex: "Not really. I sleep well, actually.", to: "c" }] },
    c: { say: [["kfood", "I thought I smelled something wonderful from your door yesterday. Was that {kfood}? Do you cook it yourself?"], [null, "I thought I smelled something wonderful from your door yesterday. What were you cooking?"]],
      task: [["kfood", "직접 요리하는지 말해요"], [null, "어제 뭘 요리했는지 말해요"]],
      go: [{ m: [["요리", ["cook", "made", "make", "yes", "no", "myself", "mom", "recipe", "kimchi", "rice", "noodles", "soup", "stew", "chicken", "pork", "beef", "fish", "eggs", "fried", "ramen", "pasta", "dinner", "leftover", "takeout", "dumplings", "tofu", "salad", "sandwich"]]], ex: "Yes, I made it myself. It's my mom's recipe.", to: "d" }] },
    d: { say: "Oh, how I'd love to learn that! Would you ever show me how to make it?", task: "가르쳐 줄지 마음대로 답해요",
      go: [
        { m: [M.yes, ["가르치기", ["teach", "show", "lesson", "cook together", "with you", "happy to", "love to"]]], ex: "Of course! I'd be happy to teach you.", set: { kteach: "yes" }, to: "e" },
        { m: [["나중에", ["maybe later", "later", "someday", "one day", "not now", "too busy", "exam", "busy", "when i have time", "next month", "not sure", "difficult", "hard"]]], ex: "Maybe later. I'm too busy with exams right now.", set: { kteach: "later" }, reply: "Of course, dear. No rush at all.", to: "e" }] },
    e: { say: "Lovely. Here, take the whole bag of cookies. I insist!", task: "고맙게 받아요",
      go: [{ m: [M.thx], ex: "Thank you so much, Mrs. Green. That's very kind.", to: "end" }] }
  },
  bye: [["kfood", "Come by anytime, dear. And I want that {kfood} recipe!"], [null, "Come by anytime, dear. My door is always open."]],
  hear: [
    ["guest", "Mrs. Green, did you hear about the street cleaning on Thursday?", [["did you hear about", "~ 들었어요?", "새 소식을 전할 때 써요."]]],
    ["them", "Yes, I'll move my car tonight. Thank you for reminding me!"],
    ["guest", "No problem. By the way, I love your garden.", [["By the way", "그런데", "화제를 바꿀 때 써요."]]],
    ["them", "Oh, you're too kind. Come by for tea sometime."]
  ] });

EP({ id: "f11", part: "daily", who: "sara", time: "evening", title: "한국 나이 문화 소개", need: { after: ["f6"], rel: { sara: 3 } }, guest: "Sara의 친구",
  lines: {
    a: { say: [["brunch=yes", "Brunch was so fun! Everyone asked about you. Okay, random question: is it true that Koreans ask your age right away?"], ["brunch=busy", "We missed you at brunch! Okay, random question: is it true that Koreans ask your age right away?"], [null, "Okay, random question: is it true that Koreans ask your age right away?"]], task: "맞다고 하고, 왜 나이를 묻는지 설명해요",
      go: [{ m: [["맞음", ["yes", "true", "right", "correct", "we do", "often", "usually", "always", "sometimes", "really"]], ["이유", ["how to talk", "how talk", "speak", "talk", "polite", "because", "so that", "so we", "honorific", "respect", "polite", "formal", "informal", "older", "younger", "senior", "junior", "call", "title", "oppa", "unnie", "hyung", "noona", "grade", "school year"]]], ex: "Yes, it's true. We ask because we use different words for older people.", to: "b", tip: ["We use different words for ~", "~에게는 말투가 달라요", "존댓말을 설명할 때 써요."] }] },
    b: { say: "Wait, so you have a Korean age and an international age? Which one do I use for you?", task: "어느 나이로 말하는지 골라요",
      go: [
        { m: [["만 나이", ["international", "western", "real age", "actual age", "same as here", "same as yours", "same here"]]], ex: "My international age is the same as here. I'm twenty.", to: "c" },
        { m: [["한국 나이", ["korean age", "in korea", "one year older", "a year older", "plus one", "one more year", "twenty one"]]], ex: "In Korea I'd be twenty-one, but here I'm twenty.", to: "c" }] },
    c: { lv: 2, say: "That's wild. And you call people 'older brother' or 'older sister' even if they're not related? Doesn't that get confusing?", task: "호칭이 헷갈리지 않는지 간단히 설명해요",
      go: [{ m: [["호칭", ["oppa", "unnie", "hyung", "noona", "call", "brother", "sister", "older", "title", "respect", "friend", "not confusing", "confusing", "get used", "easy", "habit", "not really"]]], ex: "Not really. It's a habit, and it shows respect.", to: "d" }] },
    d: { say: "Okay, so what do I call you? Just your name?", task: "이름으로 편하게 불러도 된다고 해요",
      go: [{ m: [["이름으로", ["just my name", "my name", "name is fine", "call me", "you can call", "first name", "no need", "friends", "nickname", "{name}"]]], ex: "Just call me {name}. We're friends!", to: "end" }] }
  },
  bye: "Okay, {name}. Deal. Friends don't need titles!",
  hear: [
    ["guest", "How old are you guys? Wait, is that too personal?", [["Is that too personal?", "너무 사적인가요?", "실례일까 봐 조심스럽게 물을 때 써요."]]],
    ["them", "Ha, not at all. I'm twenty-two. Nobody cares about age here.", [["Nobody cares about", "아무도 신경 안 써요", "관심 없다는 뜻이에요."]]],
    ["guest", "Lucky. My mom still asks when I'll get married."],
    ["them", "Oh no. That sounds exhausting."]
  ] });

EP({ id: "f12", part: "daily", who: "nate", time: "evening", title: "노을 아래 SNS 계정", need: { after: [["f8", "f9"]] }, guest: "지나가던 사람",
  lines: {
    a: { say: "Sorry to bug you! I'm filming a short video for my channel. Do you mind if you're in the background?", task: "찍혀도 괜찮은지 마음대로 말해요",
      go: [
        { m: [["괜찮음", ["no problem", "sure", "go ahead", "i do not mind", "not at all", "okay", "fine", "no worries"]]], ex: "Sure, go ahead. I don't mind.", to: "b" },
        { m: [["싫음", ["rather not", "prefer not", "would rather not", "do not want", "not comfortable", "sorry", "shy", "no"]]], ex: "I'd rather not be in a video, sorry.", reply: "No worries! I'll crop you out.", to: "b" }] },
    b: { say: "Thanks! Hey, do you use Instagram? I'll tag you if you want.", task: "계정이 공개인지 비공개인지 말해요",
      go: [
        { m: [["공개", ["public", "open", "follow me", "find me", "my handle", "my username", "tag me"]]], ex: "Sure, my account is public. Here's my handle.", set: { insta: "public" }, to: "c" },
        { m: [["비공개", ["private", "locked", "follow request", "request", "not public", "do not post", "do not use", "rarely"]]], ex: "My account is private, but you can send a follow request.", set: { insta: "private" }, to: "c" }] },
    c: { say: "Nice. By the way, what do you usually post? I'm all landscapes, which is why nobody likes my page.", task: "주로 뭘 올리는지 말해요",
      go: [{ m: [["올리는 것", ["food", "selfie", "selfies", "travel", "photo", "photos", "pictures", "pets", "dog", "cat", "friends", "nothing", "rarely", "study", "art", "drawing", "gaming", "music", "outfits", "cafe", "cafes", "scenery", "landscape", "memes", "stories", "trip", "workout"]]], ex: "Mostly food and cafes. I never post selfies.", to: "d" }] },
    d: { lv: 2, say: "Ha, same. Honestly, I stress about getting likes. Do you ever feel like you spend too much time on your phone?", task: "폰을 너무 오래 보는지 솔직히 말해요",
      go: [{ m: [["폰", ["yes", "no", "sometimes", "too much", "a lot", "hours", "every day", "screen time", "addicted", "limit", "not really", "try", "reduce", "delete", "break", "all the time", "bed", "scroll"]]], ex: "Yes, I scroll in bed for hours. It's a bad habit.", to: "e" }] },
    e: { say: "Same here. Okay, last shot. Can you get in this one with me? Smile!", task: "좋다고 하고 어디에 서면 되는지 물어봐요",
      go: [{ m: [M.yes, ["어디", ["where", "which side", "here", "stand", "next to", "beside", "left", "right"]]], ex: "Sure! Where should I stand?", to: "end" }] }
  },
  bye: "Right here, by the rail. Perfect, hold it!",
  hear: [
    ["guest", "That video is going to be so good. Are you a content creator?", [["content creator", "콘텐츠 제작자", "영상·글을 올리는 사람을 말해요."]]],
    ["them", "Haha, no. I just post for fun. Maybe forty followers."],
    ["guest", "Mine's about five. My mom is my biggest fan.", [["biggest fan", "가장 열렬한 팬", "가장 응원해 주는 사람을 말해요."]]],
    ["them", "Same here!"]
  ] });

EP({ id: "f13", part: "daily", who: "sara", art: "call", time: "evening", title: "약속 취소 전화", need: { after: ["f6"], rel: { sara: 4 } }, guest: "Sara의 룸메이트",
  lines: {
    a: { say: "Hey, it's me. Listen, I'm so sorry, I have to cancel tonight. I've got a terrible headache.", task: "내 진짜 마음대로 반응해요 (쿨하게든, 아쉽다고든)",
      go: [
        { m: [M.ok, ["걱정", ["feel better", "get well", "hope you", "rest", "take care", "sorry to hear", "are you okay", "poor you", "drink water", "medicine", "sleep"]]], ex: "That's okay. I hope you feel better soon!", set: { cxl: "easy" }, to: "b" },
        { m: [["아쉬움", ["disappoint", "bummer", "shame", "too bad", "was looking forward", "looking forward", "kind of sad", "sad"]], ["이해", ["understand", "get it", "health first", "feel better", "rest", "take care", "get well"]]], ex: "Oh, that's a shame. I was looking forward to it, but get some rest.", set: { cxl: "honest" }, to: "b" }] },
    b: { say: "Thanks, you're the best. I feel awful. Can we reschedule? How about the same time next week?", task: "다시 잡을 날을 정해요",
      go: [
        { m: [["다음 주", ["next week", "same time", "works", "sounds good", "that is fine", "perfect"]]], ex: "Next week works for me.", to: "c" },
        { m: [["다른 날", ["instead", "rather", "how about", "what about", "could we", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "this weekend", "sooner"]]], ex: "How about Saturday instead?", to: "c" }] },
    c: { lv: 2, say: "Honestly, I feel terrible. I even bought the tickets already.", task: "티켓은 걱정하지 말라고 해요",
      go: [{ m: [["걱정 마", ["do not worry", "no worries", "it is fine", "refund", "next time", "another time", "do not feel bad", "it happens", "no big deal", "forget it", "use them later"]]], ex: "Don't worry about it. We can use them next time.", to: "d" }] },
    d: { say: "Thanks for being so understanding. What will you do tonight instead?", task: "오늘 밤에 뭐 할지 말해요",
      go: [{ m: [["할 일", ["watch", "go", "stay", "study", "cook", "read", "game", "play", "gym", "sleep", "relax", "call", "meet", "movie", "show", "homework", "nothing", "probably", "maybe", "just", "order", "eat", "walk"]]], ex: "I'll probably stay home and watch a movie.", to: "end" }] }
  },
  bye: "You're a good friend. Talk soon!",
  hear: [
    ["guest", "Sara, you should lie down. Do you want me to pick up some soup?", [["lie down", "누워요", "아플 때 쉬라고 하는 말이에요."], ["pick up", "사다 주다", "가게에서 사 오는 걸 말해요."]]],
    ["them", "Yes, please. And some tea."],
    ["guest", "Anything else? Medicine?"],
    ["them", "No, I'm good. Thanks.", [["I'm good", "괜찮아요", "더 필요 없다고 할 때 써요."]]]
  ] });

EP({ id: "f14", part: "daily", who: "carlos", time: "day", title: "푸드트럭 한국식 타코", need: { after: [["f8", "f10"]] }, guest: "뒤에 선 손님",
  lines: {
    a: { say: "Hey there, hungry? Today's special is a Korean BBQ taco. I'm a little nervous. Is it anything like real Korean food?", task: "한국 사람으로서 솔직한 반응을 말하고 주문해요",
      go: [
        { m: [["주문", ["i try", "try it", "i will try", "i will take", "i will have", "one please", "give me", "i would like", "i will order"]], ["반응", ["sounds good", "looks good", "smells good", "interesting", "different", "not the same", "creative", "delicious", "like korea", "korean"]]], ex: "It sounds interesting. I'll try one!", to: "b" },
        { m: [["다른 걸로", ["something else", "regular", "different one", "not the special", "plain", "classic", "normal", "usual", "no special"]]], ex: "I'm not sure about the special. Do you have something plain?", reply: "Sure! The classic is always good.", to: "b" }] },
    b: { say: "You got it. What filling do you want? Beef, pork, chicken, or tofu?", task: "속 재료를 골라요",
      go: [{ m: [["재료", ["beef", "pork", "chicken", "tofu", "shrimp", "veggie"]]], ex: "Pork, please.", cap: "filling", to: "c" }] },
    c: { say: "Great choice. Want kimchi on top? I buy it from the Korean grocery on Fifth, and I put it on everything.", task: "김치를 올릴지 말해요",
      go: [
        { m: [M.yes, ["김치", ["kimchi", "on top", "add", "extra", "a lot"]]], ex: "Yes, please. Extra kimchi!", to: "d" },
        { m: [["빼기", ["no kimchi", "without", "skip", "hold the", "no thanks", "nothanks", "leave it", "no"]]], ex: "No kimchi for me, thanks. I eat it at home all the time.", to: "d" }] },
    d: { lv: 2, say: "Honest question. Does this taste like home, or is it a crime? My wife says the sauce needs something.", task: "한국인으로서 한 가지 조언해요",
      go: [{ m: [["조언", ["sweet", "spicy", "salty", "garlic", "sesame", "ginger", "sauce", "more", "less", "add", "needs", "too", "good", "great", "delicious", "perfect", "authentic", "like home", "not bad", "gochujang", "soy", "pear", "sugar", "honey"]]], ex: "It's really good. Maybe add a little more garlic.", to: "e" }] },
    e: { say: "Deal. That'll be eleven dollars. And bring your friends next time, I'll do two for the price of one for you.", task: "고맙다고 하고 친구랑 같이 오겠다고 해요",
      go: [{ m: [M.thx, ["친구", ["friend", "friends", "bring", "come back", "next time", "again", "with"]]], ex: "Thanks! I'll bring my friends next time.", to: "end" }] }
  },
  bye: [["filling", "Enjoy your {filling} taco, my friend. Tell me how it goes!"], [null, "Enjoy, my friend. Tell me how it goes!"]],
  hear: [
    ["guest", "What's in the special?", [["What's in ~?", "~에 뭐가 들었어요?", "메뉴 재료를 물을 때 써요."]]],
    ["them", "Marinated beef, kimchi slaw, and a spicy mayo."],
    ["guest", "Sounds amazing. Can I get it with no onions?", [["with no ~", "~ 빼고", "빼 달라고 할 때 써요."]]],
    ["them", "Sure thing."]
  ] });

EP({ id: "f15", part: "daily", who: "sara", art: "home", time: "day", title: "비 오는 날의 농담", need: { after: [["f11", "f13"]] }, guest: "근처 손님",
  lines: {
    a: { say: "Ah, perfect weather for a picnic, right?", task: "비가 오는데 하는 말이에요. 어떻게 받을지 마음대로 말해요",
      go: [
        { m: [["비꼼 받기", ["perfect", "very wet", "yeah right", "love getting", "soaked", "wonderful", "great weather", "lovely weather", "perfect weather", "haha", "lol", "my favorite"]]], ex: "Haha, yeah, I just love getting soaked.", reply: "Ha! You got my joke.", to: "b", tip: ["Yeah, right", "그러게요 (비꼬는 투)", "목소리를 올리면 반대 뜻이 돼요."] },
        { m: [["진심인지", ["serious", "joking", "kidding", "sarcastic", "are you", "pouring", "raining"]]], ex: "Wait, are you joking? It's pouring.", reply: "Ha! Yes, I was being sarcastic.", to: "b" }] },
    b: { say: "Okay, new one. My coworker said 'break a leg' before my presentation. Do you know what that means?", task: "그 말의 뜻을 아는지 말해요",
      go: [
        { m: [["행운 빌기", ["good luck", "luck", "lucky", "do well", "best of luck", "all the best"]]], ex: "That means good luck, right?", to: "c" },
        { m: [["모름", ["no idea", "do not know", "not sure", "what does", "what is that", "does it mean", "confus", "weird"]]], ex: "No idea. Does it mean something bad?", reply: "Nope, it means good luck! English is so weird.", to: "c" }] },
    c: { lv: 2, say: "Right! We also say 'it's raining cats and dogs.' Is there a funny expression in Korean that doesn't make sense in English?", task: "한국어의 재미있는 표현 하나를 설명해요",
      go: [{ m: [["설명", ["we say", "in korean", "literally", "means", "it means", "for example", "expression", "saying", "idiom"]]], ex: "In Korean, we say someone has wide feet when they know a lot of people.", to: "d" }] },
    d: { say: "That's hilarious. Okay, you're officially good at this. Want to get hot chocolate before the rain gets worse?", task: "좋다고 하고 달리자고 해요",
      go: [{ m: [M.yes, ["달리기", ["run", "hurry", "go", "quick", "umbrella", "let us"]]], ex: "Sure! Let's run before we get soaked.", to: "end" }] }
  },
  bye: "Perfect. Last one there pays!",
  hear: [
    ["guest", "Wow, it's pouring out there!", [["it's pouring", "비가 퍼붓네요", "비가 아주 많이 올 때 써요."]]],
    ["them", "Tell me about it. I forgot my umbrella.", [["Tell me about it", "내 말이 그 말이에요", "크게 공감할 때 써요."]]],
    ["guest", "Typical. It was sunny this morning."],
    ["them", "That's the weather here for you."]
  ] });

EP({ id: "f16", part: "daily", who: "sara", time: "day", title: "오해 풀기", need: { after: [["f13", "f15"]], rel: { sara: 4 } }, guest: "근처 손님",
  lines: {
    a: { say: [["cxl=honest", "Hey… can I ask you something? When I canceled, you said you were disappointed. Are you still mad at me?"], ["cxl=easy", "Hey… can I ask you something? You were so nice when I canceled that it felt weird. Are you secretly mad at me?"], [null, "Hey… can I ask you something? Are you mad at me? You've seemed quiet."]], task: "화나지 않았다고, 오해라고 풀어 줘요 (서운했다면 솔직히 말해도 돼요)",
      go: [
        { m: [["안 화남", ["not mad", "not angry", "not upset", "not at all", "no way", "of course not", "never mad"]], ["이유", ["tired", "busy", "stress", "exam", "midterm", "tough day", "just", "quiet", "misunderstanding", "misunderstood", "thinking", "homework", "study", "work", "sleep", "nothing", "no big deal", "do not worry", "overthinking", "misunderstand"]]], ex: "Of course not! I've just been tired from midterms.", to: "b" },
        { m: [["서운함", ["hurt", "a bit upset", "honestly", "a little upset", "a little sad", "kind of sad", "bit sad", "bothered"]], ["이해", ["but", "not your fault", "understand", "it is okay", "it is fine", "forgive", "get over", "no big deal", "sorry", "now it is fine"]]], ex: "Honestly, I was a little hurt, but I understand.", reply: "Thank you for being honest. I'm sorry.", to: "b" }] },
    b: { say: "Phew, I'm really glad we talked. Oh, and one more thing: when you said 'you look tired' the other day, was that a compliment? In English it sounds a bit rude.", task: "한국에서는 걱정해서 하는 말이라고 설명해요",
      go: [{ m: [["걱정해서", ["in korea", "korean", "care", "worry", "concern", "friendly", "not rude", "mean well", "meant", "did not mean", "sorry", "no offense", "caring", "kind"]]], ex: "In Korea it means I care about you. Sorry if it sounded rude!", to: "c", tip: ["I didn't mean it that way", "그런 뜻이 아니었어요", "오해를 풀 때 가장 흔한 말이에요."] }] },
    c: { lv: 2, say: "That makes sense! Okay, tell me one thing I do that probably confuses you. Be honest!", task: "Sara가 하는 것 중 헷갈렸던 것을 말해요",
      go: [{ m: [["헷갈린 것", ["not understand", "do not understand", "hug", "hugging", "smile", "small talk", "sorry", "please", "thank", "too polite", "direct", "eye contact", "sarcasm", "jokes", "how are you", "touch", "space"]]], ex: "Maybe the hugging. In Korea we don't hug friends much.", to: "d" }] },
    d: { say: "Ha! Noted. No more surprise hugs. Are we good?", task: "괜찮다고, 가끔은 안아도 된다고 장난쳐요",
      go: [{ m: [M.yes], ex: "We're good, I promise. One hug is okay!", to: "end" }] }
  },
  bye: "Best friend rules: we always talk it out.",
  hear: [
    ["guest", "Wait, I think we misunderstood each other.", [["we misunderstood each other", "서로 오해했어요", "의견이 어긋났을 때 써요."]]],
    ["them", "Oh! I thought you meant Saturday, not Sunday.", [["I thought you meant", "~ 말하는 줄 알았어요", "오해를 풀 때 써요."]]],
    ["guest", "No, Sunday. Sorry for the confusion."],
    ["them", "No worries. Sunday works too."]
  ] });

EP({ id: "f17", part: "daily", who: "leo", time: "evening", title: "카페 언어 교환의 밤", need: { after: [["f9", "f12"]] }, guest: "다음 손님",
  lines: {
    a: { say: "Hey! Quick thing. We do a language exchange night at the café every Thursday. You teach me Korean, I make you free coffee. Interested?", task: "관심이 있는지 마음대로 말해요",
      go: [
        { m: [M.yes, ["관심", ["interested", "sounds fun", "sounds great", "love to", "free coffee", "count me in", "i will come"]]], ex: "Sounds fun! I'm in for free coffee.", to: "b" },
        { m: [["자신 없음", ["not sure", "my english", "nervous", "shy", "not good enough", "bad at english", "scared", "worried", "afraid", "mistakes"]]], ex: "I'm not sure. My English isn't good enough.", reply: "Trust me, that's exactly why you should come!", to: "b", tip: ["I'm not sure", "잘 모르겠어요", "바로 거절하지 않고 망설일 때 써요."] }] },
    b: { say: "So give me my first Korean word. Something I'd actually use!", task: "쓸모 있는 한국어 낱말 하나를 가르쳐요 (daebak·hwaiting 같은 말도 좋아요)",
      go: [{ m: [["낱말", ["daebak", "hwaiting", "fighting", "aigoo", "jjang", "juseyo", "saranghae", "gamsahamnida", "kamsahamnida", "annyeong", "annyeonghaseyo", "mashisseoyo", "jeongmal", "kimchi"]]], ex: "Try daebak. It means awesome.", cap: "kword", to: "c" }] },
    c: { say: "{kword}, got it! How do I use it? Give me an example.", task: "언제 쓰는 말인지 알려 줘요",
      go: [{ m: [["쓰는 상황", ["when", "you say", "use it", "use", "if", "friend", "before", "after", "exam", "test", "order", "eat", "thank", "greet", "meet", "cheer", "surprised", "situation", "example"]]], ex: "You say it to a friend when something surprises you.", to: "d" }] },
    d: { lv: 2, say: "Love it. Now it's your turn. Here's a coffee shop one: 'I'm running on fumes.' Can you guess what it means?", task: "뜻을 짐작해서 말해요",
      go: [{ m: [["뜻", ["tired", "no energy", "low energy", "exhausted", "empty", "gas", "fuel", "sleepy", "out of energy", "need coffee", "almost out", "drained"]]], ex: "Is it like you're out of energy?", to: "e" }] },
    e: { say: "Exactly! Thursday at seven, then? I'll save you the good armchair.", task: "가겠다고 하고 친구를 데려가도 되는지 물어요",
      go: [{ m: [M.yes, ["친구", ["bring", "friend", "come with", "can i", "could i", "is it okay", "okay if", "ok if"]]], ex: "Sounds great! Can I bring a friend?", to: "end" }] }
  },
  bye: "The more the merrier. See you Thursday!",
  hear: [
    ["guest", "Hi, is this the language exchange table?", [["language exchange", "언어 교환", "서로의 말을 가르쳐 주는 모임이에요."]]],
    ["them", "Yep! Grab a seat. We're on Spanish tonight."],
    ["guest", "Perfect. My Spanish is terrible, though.", [["is terrible", "형편없어요", "자기 실력을 낮춰 말할 때 써요."]]],
    ["them", "That's the whole point. Nobody's judging."]
  ] });

EP({ id: "f18", part: "daily", who: "sara", time: "evening", title: "칭찬 받는 법", need: { after: [["f11", "f15"]] }, guest: "카페 손님",
  lines: {
    a: { say: "Oh my gosh, I love your jacket! Where did you get it?", task: "칭찬을 받고 대답해요 (어디서 샀는지, 아니면 별거 아니라고)",
      go: [
        { m: [M.thx, ["산 곳", ["bought", "got it", "from", "online", "mall", "store", "shop", "gift", "secondhand", "thrift", "dongdaemun", "uniqlo", "zara", "market", "brand", "website"]]], ex: "Thanks! I got it online, from a Korean site.", to: "b", tip: ["Thanks! I got it at ~", "고마워요! ~에서 샀어요", "칭찬은 일단 받고 한마디 덧붙이면 자연스러워요."] },
        { m: [M.thx, ["겸손", ["old", "cheap", "nothing special", "not new", "on sale", "not expensive", "just a normal", "it is just"]]], ex: "Thanks! It's actually pretty cheap, it was on sale.", to: "b" }] },
    b: { say: "It looks so good on you. Honestly, you always look put together.", task: "고맙다고 하고, Sara의 멋진 점도 칭찬해 줘요",
      go: [{ m: [["고마움", M.thx[1]], ["칭찬", ["you also look", "you look nice", "you too", "you look", "your hair", "your shirt", "your dress", "your style", "your outfit", "your shoes", "your bag", "you too", "love your", "like your", "so pretty", "so cute", "great style", "beautiful"]]], ex: "Thank you! You look great too. I love your bag.", to: "c" }] },
    c: { lv: 2, say: "Oh stop, you're sweet. Hey, is it weird that people here just say 'I love your jacket' to strangers? Does that happen in Korea?", task: "한국에서도 모르는 사람을 칭찬하는지 말해요",
      go: [{ m: [["한국은", ["not really", "rare", "rarely", "never", "sometimes", "usually not", "shy", "awkward", "strange", "weird", "unusual", "in korea", "korean", "we do", "only", "friends", "people are"]]], ex: "Not really. Koreans are a bit shy about that.", to: "d" }] },
    d: { say: "Well, get used to it! Next time someone compliments you, just say 'thank you.' Practice on me. I love your laugh!", task: "한마디로 고맙다고 받아요",
      go: [{ m: [M.thx], ex: "Thank you! That's really nice of you.", to: "end" }] }
  },
  bye: "See? Easy. Now I'm going to compliment you every day.",
  hear: [
    ["guest", "Your sweater is so cozy! Where's it from?", [["Where's it from?", "어디 거예요?", "물건이 어디서 났는지 물을 때 써요."]]],
    ["them", "Thanks! It was a birthday gift from my aunt.", [["gift from", "~가 준 선물", "선물 출처를 말할 때 써요."]]],
    ["guest", "She has great taste."],
    ["them", "I'll tell her you said that!"]
  ] });

EP({ id: "f19", part: "daily", who: "sara", art: "newhome", time: "day", title: "Sara의 집들이", need: { after: [["f16", "f18"]] }, guest: "Sara의 친구",
  lines: {
    a: { say: "You made it! Welcome to the new place. Excuse the boxes. Oh, did you bring something?", task: "집들이 선물을 건네요 (휴지·세제·화분·초 같은 것)",
      go: [{ m: [["선물", ["toilet paper", "tissues", "detergent", "candle", "plant", "flowers", "snacks", "cake", "wine", "fruit"]]], ex: "Congratulations on the new place! I brought a plant.", cap: "hgift", to: "b", tip: ["Congratulations on ~", "~ 축하해요", "이사·취직 같은 좋은 일에 써요."] }] },
    b: { say: "You didn't have to! That's so thoughtful. Is it a Korean tradition to bring a gift like this to a housewarming?", task: "한국의 집들이 풍습을 설명해요",
      go: [{ m: [["풍습", ["tradition", "custom", "in korea", "people", "usually", "bring", "symbol", "luck", "wish", "because", "so that", "goes smoothly", "smooth", "bubbles", "tissue", "toilet paper", "detergent"]]], ex: "In Korea people bring toilet paper or detergent, so everything goes smoothly.", to: "c" }] },
    c: { say: "That's adorable. Okay, tour time! What do you think of the place? Be honest, the kitchen's tiny.", task: "집이 어떤지 솔직히 말해요",
      go: [
        { m: [["좋음", ["love", "like", "great", "nice", "beautiful", "spacious", "lovely", "amazing", "perfect"]], ["이유", ["window", "light", "view", "balcony", "living room", "bedroom", "bathroom", "floor", "color", "location", "close", "quiet", "sunny", "furniture", "decor"]]], ex: "I love it! The big window is so bright.", to: "d" },
        { m: [["솔직히", ["small", "tiny", "cramped", "narrow", "smaller", "tight"]], ["그래도", ["but", "still", "though", "however"]]], ex: "It's a bit small, but honestly it feels like home.", to: "d" }] },
    d: { lv: 2, say: "Thanks. I wanted a place where people can hang out. Do you have any decorating tips? I have zero style.", task: "인테리어 팁 하나를 말해요",
      go: [{ m: [["팁", ["plant", "plants", "lamp", "light", "lights", "rug", "curtain", "curtains", "pillow", "pillows", "poster", "posters", "color", "paint", "mirror", "candle", "shelf", "shelves", "photos", "frame", "blanket", "warm", "cozy", "fairy lights", "couch"]]], ex: "Maybe add a warm lamp and some plants.", to: "e" }] },
    e: { say: "Ooh, good idea. Okay, the pizza's here! Are you staying a while?", task: "얼마나 있을 수 있는지 말해요",
      go: [{ m: [["시간", ["stay", "until", "late", "a while", "for a bit", "all night", "leave", "go home", "midnight", "hour", "bus", "train", "last", "have to leave", "need to leave", "by", "till"]]], ex: "I can stay until ten, then I have to catch the last bus.", to: "end" }] }
  },
  bye: "Perfect. Grab a slice, and don't be shy!",
  hear: [
    ["guest", "Congrats on the new place! Do you need any help unpacking?", [["Congrats on", "~ 축하해요", "좋은 소식을 축하할 때 써요."]]],
    ["them", "Honestly, I'd love that. I have like twenty boxes left."],
    ["guest", "Hand me a box cutter and I'm yours."],
    ["them", "You're a lifesaver.", [["lifesaver", "구세주", "큰 도움을 준 사람에게 써요."]]]
  ] });

EP({ id: "f20", part: "daily", who: "tyler", time: "morning", title: "운동 메이트", need: { after: ["f8"], rel: { tyler: 1 } }, guest: "다른 회원",
  lines: {
    a: { say: [["fitgoal=lose", "Morning! How's the weight-loss plan going? Be honest."], ["fitgoal=muscle", "Morning! How's the muscle plan going? Be honest."], [null, "Morning! How's the routine going? Be honest."]], task: "운동이 잘 되고 있는지 솔직히 말해요",
      go: [
        { m: [["잘 됨", ["going well", "great", "good", "better", "stronger", "progress", "stick", "every day", "three times", "doing well"]]], ex: "It's going well. I feel stronger already.", to: "b" },
        { m: [["힘듦", ["hard", "tired", "sore", "lazy", "skipped", "miss", "struggle", "difficult", "can not stay", "tough"]]], ex: "Honestly, it's hard. I've skipped a few days.", reply: "That's normal. Everybody does.", to: "b" }] },
    b: { say: "Good. Here's a tip: people who work out with a partner quit way less. Want a workout buddy?", task: "Tyler랑 할지, 친구를 데려올지 말해요",
      go: [
        { m: [M.yes, ["파트너", ["buddy", "partner", "together", "with you", "with me"]]], ex: "Sure, let's be workout buddies.", to: "c" },
        { m: [["친구", ["friend", "sara", "bring", "my friend", "roommate", "classmate"]]], ex: "Actually, I could bring my friend.", reply: "Even better! Bring her along.", to: "c" }] },
    c: { say: "Cool. What days work for you? I'm here Monday, Wednesday, and Friday mornings.", task: "되는 요일을 말해요",
      go: [{ m: [["요일", DAYS_EN]], ex: "Wednesdays and Fridays work for me.", to: "d" }] },
    d: { lv: 2, say: "Nice. One more thing, nutrition. Don't skip breakfast, and eat protein after you train. What do you usually eat in the morning?", task: "아침에 보통 뭘 먹는지 말해요",
      go: [{ m: [["아침", ["rice", "egg", "eggs", "bread", "toast", "cereal", "banana", "coffee", "yogurt", "oatmeal", "kimchi", "soup", "fruit", "milk", "nothing", "skip", "sandwich", "smoothie", "apple", "protein", "noodles", "salad"]]], ex: "Usually just toast and coffee.", to: "e" }] },
    e: { say: "Perfect, it's a plan. And hey, breakfast matters. Eggs, my friend. Eggs. Deal?", task: "달걀을 챙겨 먹겠다고 약속해요",
      go: [{ m: [M.yes, ["달걀", ["egg", "eggs", "breakfast", "protein", "try"]]], ex: "Deal! I'll try to eat eggs.", to: "end" }] }
  },
  bye: "See you Wednesday morning. Don't be late!",
  hear: [
    ["guest", "Is anybody using the squat rack?", [["Is anybody using", "누가 쓰고 있어요?", "기구가 비었는지 물을 때 써요."]]],
    ["them", "Nope, it's free. I'm done."],
    ["guest", "Great. How many sets do you do?"],
    ["them", "Usually four sets of ten.", [["sets of", "~씩 몇 세트", "운동 횟수를 말할 때 써요."]]]
  ] });

EP({ id: "f21", part: "daily", who: "green", time: "morning", title: "할머니가 묻는 설날", need: { after: ["f10"], rel: { green: 1 } }, guest: "지나가던 이웃",
  lines: {
    a: { say: [["kteach=yes", "Good morning, dear! Remember you promised to teach me Korean cooking? Well, my granddaughter says there's a big Korean holiday this week. Do you celebrate it?"], [null, "Good morning, dear! My granddaughter says there's a big Korean holiday this week. Do you celebrate it?"]], task: "무슨 명절인지 알려 주고, 뭘 하는지 말해요",
      go: [{ m: [["설날", ["seollal", "lunar new year", "korean new year", "new year"]], ["하는 일", ["family", "bow", "bowing", "relatives", "grandparents", "gather", "eat", "tteokguk", "hanbok", "money", "gift", "visit", "hometown", "travel", "ancestor", "games", "yutnori"]]], ex: "It's Seollal, the Lunar New Year. We visit our family and eat rice cake soup.", to: "b" }] },
    b: { say: "How lovely. And what's this about money? My granddaughter said something about envelopes.", task: "세뱃돈이 뭔지 설명해요",
      go: [{ m: [["세뱃돈", ["money", "envelope", "envelopes", "bow", "bowing", "elder", "elders", "kid", "kids", "children", "grandparents", "give", "receive", "sebae", "blessing", "wish", "lucky"]]], ex: "Kids bow to the elders, and the elders give them money in envelopes.", to: "c" }] },
    c: { say: "Oh, I want to join in! If I wanted to celebrate with you, what should I make? A soup, or something sweet?", task: "Mrs. Green이 만들 음식을 정해 줘요",
      go: [
        { m: [["국", ["soup", "tteokguk", "rice cake soup", "dumpling soup", "mandu", "broth"]]], ex: "Make tteokguk, a rice cake soup. It's what we eat on Seollal.", set: { seol: "soup" }, to: "d" },
        { m: [["단 것", ["sweet", "dessert", "cookies", "yakgwa", "hangwa", "honey", "hotteok", "candy", "sweets"]]], ex: "Something sweet, like yakgwa. It's a honey cookie.", set: { seol: "sweets" }, to: "d" }] },
    d: { lv: 2, say: "Wonderful. And do you miss your family on days like this? I do, with my kids so far away.", task: "가족이 보고 싶은지 솔직히 말해요",
      go: [{ m: [["그리움", ["miss", "yes", "a little", "a lot", "call", "video call", "facetime", "kakao", "talk", "home", "family", "mom", "dad", "far", "lonely", "homesick", "sad"]]], ex: "A little. I'll video call my family tonight.", to: "e" }] },
    e: { say: "Then you call them, dear. And Happy New Year! How do you say it in Korean?", task: "한국어 새해 인사를 알려 줘요",
      go: [{ m: [["새해 인사", ["saehae", "bok mani", "bok many", "bokmani", "badeuseyo", "happy new year", "blessings", "good fortune", "we say", "you say", "it means", "luck"]]], ex: "We say, saehae bok mani badeuseyo.", to: "end", tip: ["Happy New Year", "새해 복 많이 받으세요", "한국에서는 새해 복을 많이 받으라고 인사해요."] }] }
  },
  bye: [["kteach=yes", "Saehae bok mani badeuseyo! Now, about that cooking lesson of ours."], [null, "Saehae bok mani badeuseyo! Did I say that right?"]],
  hear: [
    ["guest", "Mrs. Green, are you doing anything for the holiday?", [["are you doing anything for", "~에 뭐 해요?", "명절·주말 계획을 물을 때 써요."]]],
    ["them", "Just a quiet dinner with my neighbor."],
    ["guest", "That sounds lovely. Happy New Year!", [["Happy New Year", "새해 복 많이 받으세요", "새해 인사예요."]]],
    ["them", "And to you!"]
  ] });

EP({ id: "f22", part: "daily", who: "sara", art: "home", time: "night", title: "소주 마시는 법", need: { after: [["f15", "f18"]], rel: { sara: 4 } }, guest: "파티 손님",
  lines: {
    a: { say: "Okay, my friend brought Korean soju to the party. Teach me! How do I drink it properly?", task: "소주 마실 때 지키는 예절 하나를 알려 줘요",
      go: [{ m: [["예절", ["pour for", "both hands", "two hands", "turn away", "turn your head", "never pour", "do not pour", "do not fill", "pour your own", "older", "elder", "wait", "refill", "first"]]], ex: "Never pour your own glass. Pour for others with both hands.", to: "b" }] },
    b: { say: "That's so polite! And what do people say before drinking? Not just 'cheers', right?", task: "건배할 때 하는 말을 알려 줘요",
      go: [{ m: [["건배", ["geonbae", "gunbae", "one shot", "cheers", "jjan", "toast", "shout", "we say", "everyone", "together", "clink", "glass"]]], ex: "We say geonbae and clink our glasses.", to: "c" }] },
    c: { say: "Ha, geonbae! Okay, here we go… ugh, it's so strong. Do you drink a lot back home?", task: "술을 마시는지 사실대로 말해요",
      go: [
        { m: [["마심", ["yes", "i drink", "love", "often", "every weekend", "sometimes", "a lot", "like soju", "enjoy", "with friends", "on weekends", "party"]]], ex: "Yes, I drink with friends on weekends.", set: { drinks: "yes" }, to: "d" },
        { m: [["안 마심", ["do not drink", "never drink", "not a big drinker", "no alcohol", "allergic", "can not drink", "low tolerance", "bad at drinking", "do not really drink", "rarely", "hardly"]]], ex: "I don't really drink. I get red in the face after one glass.", set: { drinks: "no" }, to: "d" }] },
    d: { lv: 3, say: "Okay, noted. Is it true you have to drink if your boss pours you a glass? What if you don't want to?", task: "원하지 않을 때 정중히 거절하는 법을 말해요",
      go: [{ m: [["거절", ["sorry", "no thank you", "nothanks", "politely", "refuse", "decline", "say no", "sip", "pretend", "hold", "cup", "excuse", "tell them", "explain", "pass", "allergy", "medicine", "driving", "early", "tomorrow", "depends"]]], ex: "You can say you have to be up early tomorrow and politely decline.", to: "e" }] },
    e: { say: "Good to know. Okay, I think I've had enough. Can you help me find some water?", task: "물을 가져다주겠다고 하고, 집에 어떻게 갈지 물어요",
      go: [{ m: [["물", ["sure", "of course", "here", "water", "glass", "let me get"]], ["귀가", ["go home", "get home", "how are you getting home", "how will you get home", "how do you get home", "taxi", "bus", "uber", "ride", "get home", "going home", "walk"]]], ex: "Sure, I'll get you some. How are you getting home?", to: "end" }] }
  },
  bye: "A taxi, definitely. Thanks for being the responsible one!",
  hear: [
    ["guest", "Who's up for another round?", [["another round", "한 잔 더", "술이나 게임을 한 번 더 하자는 말이에요."]]],
    ["them", "I'm good, I'm driving.", [["I'm driving", "제가 운전해요", "술을 거절하는 이유로 써요."]]],
    ["guest", "Fair enough. More soda, then?"],
    ["them", "Yes, please."]
  ] });

EP({ id: "f23", part: "daily", who: "nate", time: "night", title: "잠이 안 오는 밤", need: { after: ["f12"], rel: { nate: 1 } }, guest: "산책하던 사람",
  lines: {
    a: { say: "Oh, hey. Didn't expect to see you out here this late. I come here when I can't sleep.", task: "나도 잠이 안 온다고, 왜인지 말해요",
      go: [{ m: [["잠 안 옴", ["can not sleep", "no sleep", "not sleepy", "awake", "thinking", "stress", "homesick", "miss", "tired", "cold", "jet lag", "exam", "noisy", "fresh air", "walk", "me too", "same"]]], ex: "Me too. I just needed some fresh air.", to: "b" }] },
    b: { say: "Funny, I've been homesick all week. Do you ever get that? Like you're fine, and then something small hits you?", task: "비슷한 기분이 드는지 솔직히 말해요",
      go: [
        { m: [["공감", ["yes", "same", "sometimes", "all the time", "i know", "i get", "homesick", "miss", "hits", "relate"]]], ex: "Yes, I know what you mean. It hits at random times.", to: "c" },
        { m: [["아직 아님", ["not really", "not much", "rarely", "too busy", "not yet", "fine", "happy"]]], ex: "Not really yet. I've been too busy to think about it.", to: "c" }] },
    c: { say: "For me it's the smell of my mom's kitchen. Weird, right? What do you miss most?", task: "가장 그리운 것을 말해요",
      go: [
        { m: [["그리운 사람", ["family", "friends", "mom", "dad", "dog", "cat", "grandma", "sister", "brother", "home", "bed", "room"]]], ex: "I miss my family the most.", cap: "miss", to: "d" },
        { m: [["엄마 음식", ["mom's cooking", "korean food", "kimchi", "home cooking", "my mom's food", "bibimbap", "tteokbokki"]]], ex: "I miss my mom's cooking and Korean food.", set: { miss: "mom's cooking" }, to: "d" }] },
    d: { lv: 2, say: "I FaceTime my sister every Sunday, and it helps a little. Do you have anyone you can call when it hits you?", task: "힘들 때 연락할 사람이나 방법을 말해요",
      go: [{ m: [["연락", ["call", "video call", "facetime", "kakao", "text", "message", "friend", "mom", "dad", "sister", "brother", "parents", "family", "nobody", "no one", "not really", "sara", "dog"]]], ex: "I usually video call my mom.", to: "e" }] },
    e: { say: "Good. Hey, you can always message me too. The offer stands.", task: "고맙다고 하고, 다음에 같이 별을 보자고 해요",
      go: [{ m: [M.thx, ["다음에", ["next time", "again", "together", "come back", "come here", "stars", "night", "soon", "another night", "sometime", "later", "with you"]]], ex: "Thanks, Nate. Let's come back and watch the stars together.", to: "end" }] }
  },
  bye: "Anytime. Get some sleep, okay?",
  hear: [
    ["guest", "Sorry, do you have the time?", [["do you have the time", "몇 시예요?", "시간을 물어볼 때 써요."]]],
    ["them", "It's almost midnight."],
    ["guest", "Wow, I should be in bed. Long day.", [["Long day", "힘든 하루였어요", "하루를 마무리하며 써요."]]],
    ["them", "Get some rest. Good night!"]
  ] });

EP({ id: "f24", part: "daily", who: "ava", time: "evening", title: "영화 후기 수다", need: { after: ["f4", ["f12", "f14"]] }, guest: "줄 선 손님",
  lines: {
    a: { say: [["genre", "Hi again! You saw the {genre} last time, right? Did you like it?"], [null, "Hi again! You came last week, right? Did you like the movie?"]], task: "영화가 어땠는지 솔직히 말해요",
      go: [
        { m: [["좋았음", ["good", "loved", "liked", "enjoyed", "great", "fun", "funny", "amazing", "fantastic", "best", "awesome", "so good", "really good"]]], ex: "I loved it. It was so funny.", to: "b" },
        { m: [["별로", ["boring", "not good", "disappointing", "disappointed", "did not like", "hated", "slow", "too long", "weak", "terrible", "bad", "not great", "not my thing"]]], ex: "Honestly, it was a bit boring.", reply: "Ha, thanks for being honest.", to: "b" }] },
    b: { say: "That's good to know! We get so little honest feedback. What was your favorite part, or what would you change?", task: "가장 좋았던 점, 또는 바꾸고 싶은 점 하나를 말해요",
      go: [{ m: [["평가", ["scene", "ending", "actor", "actress", "music", "story", "plot", "character", "joke", "fight", "twist", "script", "cast", "soundtrack", "favorite", "would change", "wish"]]], ex: "My favorite part was the ending. It was a total surprise.", to: "c" }] },
    c: { lv: 2, say: "Totally! I've seen it four times, and I still tear up at the end. Do you cry at movies, or are you the stoic type?", task: "영화 보다가 우는지 말해요",
      go: [{ m: [["우는지", ["cry", "tear", "tears", "never", "sometimes", "always", "often", "rarely", "sad", "touching", "stoic", "emotional", "hold it in", "yes", "no"]]], ex: "I try not to, but sometimes I cry.", to: "d" }] },
    d: { say: "Ha! Okay, we've got a new thriller opening Friday. Want me to put aside two tickets for you and a friend?", task: "표를 잡아 달라고 할지 마음대로 정해요",
      go: [
        { m: [["부탁", ["yes please", "two", "hold", "reserve", "save", "put aside", "sounds good", "sure", "book"]]], ex: "Yes, please. Two tickets for Friday.", to: "end" },
        { m: [["다음에", ["maybe next time", "next time", "not this week", "busy", "i will think", "let you know", "later", "nothanks"]]], ex: "Maybe next time. I'm busy on Friday.", to: "end" }] }
  },
  bye: "Enjoy your night. Tell your friend I said hi!",
  hear: [
    ["guest", "Was it worth the ticket price?", [["worth the", "~ 값어치가 있다", "가격만큼 좋았는지 물을 때 써요."]]],
    ["them", "Totally. The ending alone was worth it."],
    ["guest", "No spoilers, please!", [["No spoilers", "스포 금지", "줄거리를 말하지 말라는 뜻이에요."]]],
    ["them", "My lips are sealed."]
  ] });

EP({ id: "f25", part: "daily", who: "sara", art: "home", time: "evening", title: "Sara의 생일 파티", need: { after: ["f19"] }, guest: "다른 손님",
  lines: {
    a: { say: [["hgift", "Aww, you came! Thanks for coming to my birthday. I still love the {hgift} you brought when I moved in."], [null, "Aww, you came! Thanks for coming to my birthday."]], task: "생일을 축하하고 선물을 건네요",
      go: [{ m: [["축하", ["happy birthday", "congratulation", "congrats", "birthday"]], ["선물", ["gift", "present", "for you", "brought", "got you", "made you", "card", "this is", "here is", "here you go", "small thing"]]], ex: "Happy birthday, Sara! This is a small gift for you.", to: "b" }] },
    b: { say: [["lv:2", "You shouldn't have! Everybody's about to sing, and I'm already embarrassed. Do you sing the birthday song in Korea too? Is there anything special you do?"], [null, "You shouldn't have! Do you do the birthday song in Korea too?"]], task: "한국에서는 생일에 뭘 하는지 말해요",
      go: [{ m: [["생일 풍습", ["seaweed soup", "miyeokguk", "soup", "birthday song", "same song", "sing", "we sing", "eat", "mom", "cake", "in korea", "korean", "tradition", "custom", "presents", "party"]]], ex: "In Korea we eat seaweed soup on our birthday, and we sing the same song.", to: "c" }] },
    c: { say: [["drinks=no", "Seaweed soup, that's so sweet! Oh, and I remembered you don't drink, so I got sparkling cider for you. What do you think?"], ["drinks=yes", "Seaweed soup, that's so sweet! Oh, and I remembered you like soju, so I hid a bottle for you. Want some?"], [null, "Seaweed soup, that's so sweet! Can I get you something to drink?"]], task: "마실 것에 대해 고맙게 대답해요",
      go: [{ m: [["음료", ["cider", "soda", "water", "juice", "coffee", "tea", "cola", "coke", "soju", "beer", "wine", "lemonade", "sparkling", "anything", "thanks", "thank", "yes", "sure", "please", "open"]]], ex: "Thank you, that sounds perfect.", to: "d" }] },
    d: { say: "Okay, everyone's here! Before we cut the cake, will you say a few words for me?", task: "짧게 덕담을 하거나, 쑥스러우면 건배로 대신해요",
      go: [
        { m: [["덕담", ["wish", "hope", "happy", "best friend", "grateful", "glad", "lucky", "proud", "amazing", "kind", "great year", "best year", "wonderful", "met you"]]], ex: "I'm so glad I met you. I hope this is your best year!", to: "end" },
        { m: [["쑥스러움", ["shy", "nervous", "bad at speeches", "cheers", "raise", "toast", "glass", "short"]]], ex: "I'm too shy for speeches. Let's just say cheers!", to: "end" }] }
  },
  bye: [["insta=private", "Perfect. I'll text you the party photos, since your account is private!"], ["insta=public", "Perfect. I'll tag you in the photos tonight!"], [null, "Perfect. I'll send you the party photos tonight!"]],
  hear: [
    ["guest", "Are you the one who's been teaching Sara Korean?", [["Are you the one who", "~한 사람이 당신이에요?", "누구인지 확인할 때 써요."]]],
    ["them", "Guilty as charged!", [["Guilty as charged", "제가 그랬어요", "장난스럽게 인정할 때 써요."]]],
    ["guest", "She keeps saying daebak. Nobody understands."],
    ["them", "Ha! That's my fault."]
  ] });

EP({ id: "f26", part: "daily", who: "ella", time: "day", title: "Max를 부탁해요", need: { after: ["f7"], rel: { ella: 2 } }, guest: "지나가던 사람",
  lines: {
    a: { say: "Oh, thank goodness, it's you! I need a huge favor. I have to go to a wedding out of town this weekend, and my dog sitter canceled. I know it's a lot to ask. Could you look after Max?", task: "부탁을 들어줄지 마음대로 정해요 (못 하면 이유를 말해요)",
      go: [
        { m: [["수락", ["of course", "happy to", "i would love to", "no problem", "yes", "i can do it", "i can look after", "i can watch", "sounds good", "glad to", "sure"]]], ex: "Of course, I'd be happy to.", set: { maxsit: "yes" }, to: "b" },
        { m: [["어려움", ["sorry", "can not", "busy", "traveling", "allergic", "not allowed", "dorm", "never had", "afraid", "scared", "no pets", "landlord", "not sure"]]], ex: "I'm sorry, I can't. My dorm doesn't allow pets.", set: { maxsit: "no" }, to: "b2", tip: ["I'm sorry, I can't", "미안하지만 어려워요", "부탁을 정중히 거절할 때 이유와 함께 써요."] }] },
    b: { say: [["walktime", "You're an angel! He eats twice a day, and he loves his {walktime} walks. Can you really do that?"], [null, "You're an angel! He eats twice a day, and he loves his walks. Can you really do that?"]], task: "걱정하지 말라고 안심시켜요",
      go: [{ m: [["안심", ["yes", "sure", "of course", "no problem", "i can", "do not worry", "no worries", "i will", "i promise", "happy to", "absolutely"]]], ex: "Yes, no worries. I'll walk him twice a day.", to: "c" }] },
    b2: { say: "Oh, that's totally okay! I shouldn't have asked. Do you know anyone who might help?", task: "도와줄 만한 사람이 있는지 말해요",
      go: [{ m: [["아는 사람", ["sara", "friend", "classmate", "neighbor", "green", "roommate", "ask", "maybe", "i know", "nobody", "no one", "not really"]]], ex: "Maybe my friend Sara can help. I'll ask her.", to: "c" }] },
    c: { say: "Thank you so much, really. Can I give you my number so we can text about it?", task: "번호를 받고 필요하면 문자하라고 해요",
      go: [{ m: [["연락처", ["number", "text", "message", "phone", "give", "here", "call", "contact", "kakao", "save", "write", "send"]]], ex: "Sure, here's my number. Text me anytime.", to: "d" }] },
    d: { lv: 2, say: "Oh, and one more thing: Max is scared of thunder. If it storms, just sit with him and talk in a calm voice. Does that sound okay?", task: "침착하게 돌보겠다고 해요",
      go: [{ m: [["침착", ["calm", "sit", "talk", "soft", "gentle", "quiet", "pet", "hug", "music", "blanket", "okay", "sure", "yes", "no problem", "understand", "will do", "got it"]]], ex: "Got it. I'll stay calm and sit with him.", to: "e" }] },
    e: { say: "I owe you big time. What can I do to thank you?", task: "괜찮다고, 나중에 커피 한 잔이면 된다고 해요",
      go: [{ m: [["사양", ["coffee", "lunch", "dinner", "treat", "buy me", "no need", "nothing", "it is fine", "you do not have to", "next time", "drink", "walk"]]], ex: "No need! Maybe just a coffee when you're back.", to: "end" }] }
  },
  bye: [["maxsit=yes", "You're the best. Max will behave! See you Monday."], ["maxsit=no", "Thanks for hearing me out. I'll figure something out."], [null, "Thanks for hearing me out. See you around!"]],
  hear: [
    ["guest", "Aww, is he yours? He looks like a teddy bear!", [["a teddy bear", "곰 인형 같아요", "귀여운 동물을 칭찬할 때 써요."]]],
    ["them", "Yes! Don't be fooled, he's a troublemaker.", [["Don't be fooled", "속지 마세요", "겉모습에 속지 말라는 뜻이에요."]]],
    ["guest", "Can I pet him?", [["Can I pet him?", "쓰다듬어도 돼요?", "동물을 만지기 전에 허락을 구해요."]]],
    ["them", "Sure, he loves it."]
  ] });

EP({ id: "f27", part: "daily", who: "jess", time: "day", title: "미용실 다시 가기", need: { after: ["f9", ["f16", "f18"]] }, guest: "다른 손님",
  lines: {
    a: { say: [["haircut", "Welcome back! How's the {haircut}? Still happy with it?"], [null, "Welcome back! How's the haircut? Still happy with it?"]], task: "지난번 머리가 어떤지 말해요",
      go: [
        { m: [["만족", ["love", "happy", "great", "good", "like", "perfect", "amazing", "fine", "compliments"]]], ex: "I love it. A lot of people gave me compliments.", to: "b" },
        { m: [["바꾸고 싶음", ["change", "different", "tired of", "bored", "not sure", "grow out", "growing", "too short", "too long", "something new", "switch", "update", "try something"]]], ex: "It's okay, but I want to try something new.", to: "b" }] },
    b: { say: "Ooh. So what's the occasion? Or do you just want a change?", task: "왜 머리를 하러 왔는지 말해요",
      go: [{ m: [["이유", ["birthday", "party", "wedding", "interview", "date", "graduation", "photo", "trip", "festival", "friend", "event", "concert", "special", "just", "change", "fresh", "new look", "no reason", "nothing", "mood", "cheer"]]], ex: "I have a special event this month, so I want to look nice.", to: "c" }] },
    c: { say: "Cool. Do you have a photo of what you want, or should I surprise you?", task: "사진을 보여 줄지 맡길지 정해요",
      go: [
        { m: [["사진", ["photo", "picture", "show", "reference", "this one", "like this", "celebrity", "idol", "singer", "actor", "actress"]]], ex: "I have a photo of the style I want.", to: "d" },
        { m: [["맡김", ["surprise me", "you decide", "up to you", "trust you", "whatever you think", "your call", "recommend", "suggest", "leave it"]]], ex: "I'll leave it up to you. Surprise me!", to: "d", tip: ["Surprise me", "알아서 해 주세요", "전문가를 믿고 맡길 때 써요."] }] },
    d: { lv: 3, say: "Perfect. Quick warning, with this much change, we're talking about two hours. Do you have somewhere to be?", task: "시간이 되는지 말해요",
      go: [{ m: [["시간", ["no", "fine", "free", "time", "plenty", "all day", "two hours", "okay", "no problem", "not busy", "till", "until", "have class", "have to leave", "by", "need to leave"]]], ex: "I'm free until five, so that's fine.", to: "e" }] },
    e: { say: "Sit tight, then. Would you like a magazine or some tea?", task: "마실 것이나 읽을 것을 부탁해요",
      go: [{ m: [["부탁", ["tea", "coffee", "water", "magazine", "phone", "book", "read", "nothing", "juice", "please", "thanks", "thank"]]], ex: "Tea, please. Thanks!", to: "end" }] }
  },
  bye: "Great. You're going to love it. Now close your eyes!",
  hear: [
    ["guest", "How long have you been cutting hair?", [["How long have you been", "얼마나 오래 ~했어요?", "경력·기간을 물을 때 써요."]]],
    ["them", "Twelve years. I started in my aunt's salon."],
    ["guest", "Wow. And you still love it?"],
    ["them", "Every day. Hair is just my thing.", [["my thing", "내 분야예요", "좋아하고 잘하는 일을 말할 때 써요."]]]
  ] });

EP({ id: "f28", part: "daily", who: "green", time: "day", title: "할머니의 영상통화", need: { after: [["f21", "f26"]] }, guest: "지나가던 이웃",
  lines: {
    a: { say: [["maxsit=yes", "Dear! Ella told me you looked after her dog all weekend. What a good neighbor you are! May I ask you for a little favor too?"], [null, "Dear, I hope I'm not bothering you. May I ask you for a little favor?"]], task: "도와주겠다고 하고 무슨 일인지 물어요",
      go: [{ m: [["도와줌", ["sure", "of course", "happy to", "no problem", "what is it", "what can i do", "how can i help", "what do you need", "go ahead", "yes", "glad to"]]], ex: "Of course! What do you need?", to: "b" }] },
    b: { say: "It's this phone my son sent me. I can't figure out how to call my granddaughter on the little screen. Could you show me?", task: "알려 줄지, 대신 해 줄지 정해요",
      go: [
        { m: [["알려 주기", ["tap", "press", "touch", "click", "button", "icon", "green", "video", "camera", "name", "contact", "first", "open", "app", "here", "show you", "step"]]], ex: "Sure. First, tap the green button, then her name.", to: "c" },
        { m: [["대신 해 주기", ["let me", "i will do it", "i can do it", "give it to me", "hand it", "set it up", "i will set"], 1], ["대상", ["for you", "do it", "set it up", "save", "her number"]]], ex: "Let me set it up for you. I'll save her number.", to: "c" }] },
    c: { say: "Oh, wonderful! It's ringing. What do I say first? Silly me, my hands are shaking.", task: "긴장을 풀어 줘요",
      go: [{ m: [["진정", ["relax", "calm", "breathe", "it is okay", "you can do it", "do not worry", "just say hello", "say hi", "smile", "she will be happy", "she misses you", "take your time", "easy", "you are fine"]]], ex: "Relax! Just say hello and smile.", to: "d" }] },
    d: { lv: 2, say: "Hello, sweetie! … Oh, dear, she wants to say hi to you. She's studying Korean now! Would you say something to her?", task: "손녀에게 인사해요 (한국어 한마디도 좋아요)",
      go: [{ m: [["인사", ["annyeong", "annyeonghaseyo", "hello", "hi", "nice to meet", "korean", "welcome", "study", "good luck", "how are you", "my name"]]], ex: "Hi! Nice to meet you. Annyeonghaseyo!", to: "e" }] },
    e: { say: "That was the best part of my week. What do I owe you? I insist!", task: "이웃끼리니까 괜찮다고 해요",
      go: [{ m: [["사양", ["nothing", "no need", "it is nothing", "do not worry", "you do not owe", "neighbor", "glad", "happy", "my pleasure", "anytime", "just"]]], ex: "Nothing at all. That's what neighbors are for.", to: "end" }] }
  },
  bye: [["seol=soup", "Then you must come for tea on Sunday. I'm going to try that soup you told me about!"], ["seol=sweets", "Then you must come for tea on Sunday. I'm going to bake something sweet, like you said!"], [null, "Then you must come for tea on Sunday. I insist!"]],
  hear: [
    ["guest", "Mrs. Green, is that your granddaughter on the screen?", [["on the screen", "화면 속에", "영상통화 화면을 말할 때 써요."]]],
    ["them", "Yes! She's in college now. Time flies.", [["Time flies", "시간 참 빠르네요", "세월이 빠르다고 느낄 때 써요."]]],
    ["guest", "It really does. Please give her my best."],
    ["them", "I will, dear."]
  ] });

EP({ id: "f29", part: "daily", who: "tyler", time: "evening", title: "헬스장 마지막 날", need: { after: ["f20"] }, guest: "다른 회원",
  lines: {
    a: { say: [["fitgoal=lose", "Hey! Hard to believe it's been months. You've dropped the weight, huh? Look at you."], ["fitgoal=muscle", "Hey! Hard to believe it's been months. You're lifting way heavier now."], [null, "Hey! Hard to believe it's been months. You look strong."]], task: "고맙다고 하고, 뭐가 도움이 됐는지 말해요",
      go: [{ m: [["고마움", M.thx[1]], ["도움", ["helped", "help", "taught", "motivated", "pushed", "encouraged", "patient", "advice", "support", "because of you", "thanks to you", "great coach", "great trainer"]]], ex: "Thank you for everything. You really pushed me.", to: "b" }] },
    b: { say: "That's what I'm here for. So, are you canceling the membership or freezing it?", task: "회원권을 어떻게 할지 말해요",
      go: [
        { m: [["해지", ["cancel", "end it", "stop", "not renew", "quit", "going home", "moving back", "back to korea", "last day"]]], ex: "I'm canceling. I'm moving back to Korea next month.", to: "c" },
        { m: [["정지", ["freeze", "pause", "hold", "come back", "return", "next semester", "next year", "keep it", "in the fall", "in september"]]], ex: "Freeze it, please. I'll be back in the fall.", to: "c" }] },
    c: { lv: 3, say: "Whichever you choose, promise me you'll keep training. Even twenty minutes a day. What's your plan?", task: "운동을 어떻게 이어 갈지 말해요",
      go: [{ m: [["계획", ["home", "run", "jog", "walk", "stairs", "push-ups", "pushups", "gym", "park", "youtube", "video", "stretch", "plank", "squat", "bike", "every morning", "every day", "twice a week", "three times", "routine", "plan", "keep"]]], ex: "I'll jog by the river a few times a week.", to: "d" }] },
    d: { say: "That works! One last thing. Take a photo with me, so I can put it on our wall of fame. Deal?", task: "좋다고 하고, 포즈를 제안해요",
      go: [{ m: [M.yes, ["포즈", ["photo", "picture", "pose", "flex", "smile", "wall", "where", "here", "ready", "selfie", "cheese", "muscles"]]], ex: "Deal! Should we flex?", to: "end" }] }
  },
  bye: "Come back stronger. You're always welcome here, friend!",
  hear: [
    ["guest", "Tyler, can I freeze my membership for the summer?", [["freeze my membership", "회원권을 정지하다", "잠시 쉴 때 써요."]]],
    ["them", "Sure, fill out this form at the desk."],
    ["guest", "Thanks. I'll be back in September.", [["I'll be back", "돌아올게요", "잠시 떠날 때 하는 말이에요."]]],
    ["them", "We'll be here. Have a great summer!"]
  ] });

EP({ id: "f30", part: "daily", who: "sara", art: "goodbye", time: "day", title: "Sara와 작별", need: { after: ["f25", ["f23", "f26", "f29"]], rel: { sara: 5 } }, guest: "Sara의 친구",
  lines: {
    a: { say: [["miss", "So… it's really tomorrow, huh? I know you've been missing your {miss}, and I'm happy for you, but I'm going to miss you so much. How are you feeling?"], [null, "So… it's really tomorrow, huh? I'm happy for you, but I'm going to miss you so much. How are you feeling?"]], task: "설레면서도 아쉬운 마음을 말해요",
      go: [{ m: [["설렘", ["excited", "happy", "glad", "can not wait", "looking forward"]], ["아쉬움", ["sad", "miss", "going to miss", "sorry to leave", "hard", "bittersweet", "mixed"]]], ex: "Excited, but sad too. I'm going to miss you.", to: "b" }] },
    b: { say: "Stop, I'll cry! Okay, practical stuff. How do we keep in touch? Kakao, Instagram, video calls?", task: "어떻게 연락하고 지낼지 제안해요",
      go: [{ m: [["연락 방법", ["kakao", "instagram", "insta", "whatsapp", "video call", "facetime", "text", "message", "email", "call", "every week", "every sunday", "weekly", "once a week", "once a month", "every month", "time difference", "time zone", "zoom", "dm"]]], ex: "Let's video call every Sunday. The time difference isn't too bad.", to: "c" }] },
    c: { lv: 2, say: [["kword", "Perfect. By the way, I still say {kword} at least ten times a day. Everyone at work thinks I'm crazy. Will you teach me one last phrase, something to say when I miss you?"], [null, "Perfect. By the way, will you teach me one last Korean phrase, something to say when I miss you?"]], task: "마지막으로 보고 싶을 때 쓰는 한국어 한마디를 가르쳐요",
      go: [{ m: [["한마디", ["bogo sipeo", "bogoshipeo", "bogosipeo", "miss you", "see you", "meet again", "jal ga", "jal jinae", "take care", "keep in touch", "annyeong", "in korean", "we say", "you say", "means"]]], ex: "You can say bogo sipeo. It means I miss you.", to: "d" }] },
    d: { say: "Bogo sipeo. Okay, I'm definitely crying now. Promise me you'll visit, or I'll come see you!", task: "다시 만나자고 약속해요",
      go: [
        { m: [["다시 올게", ["i will come back", "come back", "visit you", "return", "back here", "next year", "next summer", "soon"]]], ex: "I promise I'll come back and visit you next summer.", to: "e" },
        { m: [["한국으로", ["come to korea", "visit korea", "visit seoul", "come to seoul", "show you around", "take you", "guide you"]]], ex: "You should come to Seoul. I'll show you around!", to: "e" }] },
    e: { say: "Deal! Okay, group hug. Wait, is a hug okay, or is that too American?", task: "안아도 된다고 해요",
      go: [{ m: [M.yes, ["포옹", ["hug", "hugs", "come here", "group hug", "love to", "please", "of course"]]], ex: "Of course! Come here.", to: "end" }] }
  },
  bye: [["filling", "Love you, friend. I'll eat a {filling} taco from Carlos for you!"], [null, "Love you, friend. Safe travels, and text me when you land!"]],
  hear: [
    ["guest", "Is it true you're leaving tomorrow?", [["Is it true", "정말이에요?", "소식이 사실인지 확인할 때 써요."]]],
    ["them", "Yeah. I'm going to miss everyone."],
    ["guest", "Keep in touch, okay? Don't be a stranger.", [["Keep in touch", "연락하고 지내요", "헤어질 때 자주 써요."], ["Don't be a stranger", "연락 끊지 마요", "친근하게 연락하자고 할 때 써요."]]],
    ["them", "I will. Promise."]
  ] });
