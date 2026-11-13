// 술술 2판 판정 — 내 말에 갈래(route)의 뜻 덩어리(m)가 모두 들어 있는지 본다.
// 페이지(scene.js)와 시험(~/sulsul-art/natural.mjs·check2.mjs)이 이 파일 하나를 같이 쓴다.
// 내 말과 표현 목록을 같은 방법으로 다듬어 비교한다: 줄임말 풀기(I'm = I am), 숫자는 글자로(2 = two),
// 같은 말 철자 하나로(wi-fi = wifi, yeah = yes), 낱말 끝 바뀜 무시(studies = study, made = make), um·uh 빼기.
// to·a·the는 빼고 본다(배우는 사람이 자주 빠뜨림: "nice meet you", "I want learn").
// 표현 목록에서 "#"는 아무 숫자, "{name}"은 내 이름. "not ~"·"never ~"(사이에 have·need·any·really 같은 말만 낀 것 포함: "don't have any plans") 바로 뒤에 나온 표현은 맞은 걸로 치지 않는다.
// 갈래에 fallback이 있으면 다른 갈래가 하나도 안 맞을 때만 그 갈래로 간다(아무 취미나 받는 갈래 등).
// 뜻 덩어리에 세 번째 값 n이 있으면 서로 다른 표현이 n개 들어가야 한다(예: 음식 설명 두 가지).
const J = (() => {
  const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" "),
    TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
  const spell = n => n < 20 ? ONES[n] : n < 100 ? TENS[n / 10 | 0] + (n % 10 ? " " + ONES[n % 10] : "")
    : n < 1000 ? ONES[n / 100 | 0] + " hundred" + (n % 100 ? " " + spell(n % 100) : "")
    : n < 1e6 ? spell(n / 1000 | 0) + " thousand" + (n % 1000 ? " " + spell(n % 1000) : "") : String(n);
  
  const IRR = { made: "make", built: "build", got: "get", gotten: "get", went: "go", gone: "go", came: "come", saw: "see", seen: "see", took: "take", taken: "take",
    taught: "teach", bought: "buy", began: "begin", begun: "begin", ate: "eat", eaten: "eat", had: "have", has: "have", is: "be", am: "be", are: "be", was: "be", were: "be", been: "be",
    did: "do", does: "do", done: "do", said: "say", told: "tell", felt: "feel", fell: "fall", found: "find", grew: "grow", grown: "grow", learnt: "learn", wrote: "write", written: "write",
    spoke: "speak", spoken: "speak", met: "meet", paid: "pay", thought: "think", knew: "know", known: "know", gave: "give", given: "give", slept: "sleep", kept: "keep", brought: "bring",
    sent: "send", spent: "spend", chose: "choose", chosen: "choose", drove: "drive", flew: "fly", flown: "fly", ran: "run", sat: "sit", stood: "stand", understood: "understand",
    used: "use", children: "child", men: "man", women: "woman", an: "a" };
  // 같은 말을 한 철자로 (앞: 고칠 말, 뒤: 바꿀 말 — 낱말 경계 기준)
  const SAME = [["wi fi", "wifi"], ["e mail", "email"], ["cheese burger", "cheeseburger"], ["air bnb", "airbnb"], ["checkout", "check out"], ["k pop", "kpop"],
    ["t shirt", "tshirt"], ["stand up", "standup"], ["all right", "alright"], ["hard working", "hardworking"], ["no thank you", "nothanks"], ["no thanks", "nothanks"], ["okey", "okay"], ["ok", "okay"], ["k", "okay"],
    ["yeah", "yes"], ["yep", "yes"], ["yup", "yes"], ["ya", "yes"], ["yea", "yes"], ["nope", "no"], ["nah", "no"], ["hey", "hi"], ["hello", "hi"], ["hiya", "hi"],
    ["thx", "thanks"], ["ty", "thanks"], ["gonna", "going to"], ["wanna", "want to"], ["cuz", "because"], ["cos", "because"], ["coz", "because"], ["cause", "because"],
    ["im", "i am"], ["ive", "i have"], ["id like", "i would like"], ["its", "it is"], ["thats", "that is"], ["whats", "what is"], ["dont", "do not"], ["doesnt", "does not"], ["didnt", "did not"],
    ["cant", "can not"], ["isnt", "is not"], ["lets", "let us"], ["youre", "you are"], ["theres", "there is"], ["gotcha", "got it"], ["got you", "got it"],
    ["ill(?= (make|do|take|be|call|try|have|come|see|set|send|go|get|wait|pay|text|give|say|start|bring|check|present|share|learn|work)( |$))", "i will"],
    ["u", "you"], ["ur", "your"], ["pls", "please"], ["plz", "please"], ["cannot", "can not"], ["till", "until"], ["til", "until"], ["mins", "minutes"], ["min", "minute"]]
    .map(([a, b]) => [new RegExp(`(^| )${a}(?= |$)`, "g"), `$1${b}`]);
  const FILL = new Set(["um", "uh", "uhm", "umm", "er", "erm", "hmm", "mm", "ah", "to", "a", "the"]);
  const stem = w0 => {
    let s = IRR[w0] || w0;
    if (s.length < 3 || /\d/.test(s)) return s;
    if (s.length > 4 && s.endsWith("ies")) s = s.slice(0, -3) + "y";
    else if (/(ss|sh|ch|x|z)es$/.test(s)) s = s.slice(0, -2);
    else if (s.length > 3 && /[^su]s$/.test(s)) s = s.slice(0, -1);
    if (s.length > 5 && s.endsWith("ing")) s = s.slice(0, -3);
    else if (s.length > 4 && s.endsWith("ed")) s = s.slice(0, -2);
    s = s.replace(/([bdfgklmnprt])\1$/, "$1");
    return (s.length > 3 ? s.replace(/e$/, "") : s).replace(/y$/, "i"); // one·use·see는 그대로(one이 on이 되면 안 됨)
  };
  // 문장 → 다듬은 낱말 목록
  function toks(s) {
    let t = " " + String(s).toLowerCase().replace(/[’‘`]/g, "'") + " ";
    t = t.replace(/(\d),(\d{3})/g, "$1$2").replace(/(\d+):00/g, "$1").replace(/(\d+):(\d\d)/g, "$1 $2").replace(/\$\s?(\d)/g, "$1")
      .replace(/(\d)\s*a\.?\s?m\b\.?/g, "$1 morning").replace(/(\d)\s*p\.?\s?m\b\.?/g, "$1 pm").replace(/(\d+)(st|nd|rd|th)\b/g, "$1")
      .replace(/\bwon't\b/g, "will not").replace(/\bcan't\b/g, "can not").replace(/\bain't\b/g, "is not").replace(/n't\b/g, " not")
      .replace(/'re\b/g, " are").replace(/'m\b/g, " am").replace(/'ll\b/g, " will").replace(/'ve\b/g, " have").replace(/'d\b/g, " would")
      .replace(/\blet's\b/g, "let us").replace(/\b(it|that|what|there|here|he|she|who|where|how|when|why|everything|nothing)'s\b/g, "$1 is")
      .replace(/'s\b/g, "").replace(/'/g, "").replace(/\d+/g, n => " " + spell(+n) + " ")
      .replace(/[^a-z# ]/g, " ").replace(/\s+/g, " ").trim();
    for (const [re, b] of SAME) t = t.replace(re, b);
    return t.split(" ").filter(w => w && !FILL.has(w)).map(stem);
  }
  const NUMW = new Set([...ONES, ...TENS.slice(2), "hundred", "thousand", "half"].map(stem));
  const NEG = new Set(["not", "never"].map(stem)), SOFT = new Set(["really", "very", "so", "too", "that", "be", "any", "much", "quite", "have", "need", "want", "like", "get", "my"].map(stem));
  const cache = new Map(), pat = p => cache.get(p) || (cache.set(p, toks(p)), cache.get(p));
  // 표현 p가 내 말 T 안에 있으면 맞은 낱말 수, 없으면 0
  function find(T, p) {
    const P = pat(p);
    for (let i = 0; i + P.length <= T.length; i++) {
      if (!P.every((w, j) => w === "#" ? NUMW.has(T[i + j]) || T[i + j] === "#" : T[i + j] === w)) continue;
      let j = i - 1; while (j > i - 4 && SOFT.has(T[j])) j--; // not 과 표현 사이에 have·any·really 같은 말만 있으면 부정
      if (!NEG.has(P[0]) && NEG.has(T[j])) continue;
      return P.length;
    }
    return 0;
  }
  // 한 낱말만으로도 완전한 말
  const SOLO = new Set("thanks pardon sorry sure yes no okay alright perfect great deal bye cheers absolutely definitely exactly gladly hi welcome".split(" ").map(stem));
  // 갈래 r에 내 말 said가 맞는지(fill = {name}·{기억} 채우기). 한 낱말 답은 그것만으로 완전한 말이거나, 모범 답이 세 낱말 이하이거나, 줄에 short가 있을 때만
  function check(r, said, line, fill = x => x) {
    const T = toks(said), got = r.m.map(([, any, need = 1]) => {
      const hit = any.map(p => [find(T, fill(p)), p]).filter(([n]) => n).sort((a, b) => b[0] - a[0]);
      return { n: hit.length >= need ? hit.slice(0, need).reduce((a, [n]) => a + n, 0) : 0, w: hit[0]?.[1] };
    });
    const miss = r.m.filter((_, i) => !got[i].n);
    const short = T.length < 2 && !(T.length === 1 && (SOLO.has(T[0]) || line?.short || toks(fill(r.ex)).length <= 3));
    return { r, said, hit: r.m.length - miss.length, miss, short, ok: !miss.length && !short, score: got.reduce((a, g) => a + g.n, 0), got: got[0]?.w };
  }
  // 여러 갈래·여러 받아쓰기 후보 중: 맞은 것 가운데 표현이 가장 길게 맞은 갈래(win), 없으면 가장 가까웠던 것(best)
  function judge(routes, alts, line, fill) {
    const all = alts.flatMap(a => routes.map(r => check(r, a, line, fill)));
    const win = all.filter(c => c.ok).sort((a, b) => !b.r.fallback - !a.r.fallback || b.score - a.score)[0];
    const best = win || all.slice().sort((a, b) => b.hit - a.hit || a.miss.length - b.miss.length)[0];
    return { win, best };
  }
  // 덧붙일 말(줄의 more): m이 있으면 그 뜻 덩어리가 다 들어 있는지, 없으면(한마디 덧붙이기) 상대 말·이 줄 표현 목록·흔한 말(PLAIN)에 없는 새 낱말이 하나라도 있는지.
  // more가 없는 줄은 null. 얼마나 요구할지는 수준에 따라 scene.js가 정한다(MORE_NEED).
  const PLAIN = new Set("i you it he she we they be do not no yes my me your and but so too very really just one that this there here oh well actually would will can could have".split(" ").map(stem));
  function extra(line, said, them = "", fill = x => x) {
    const x = line?.more; if (!x) return null;
    const T = toks(said);
    if (x.m) return x.m.every(([, any]) => any.some(p => find(T, fill(p))));
    const known = new Set([...toks(them), ...line.go.flatMap(r => r.m.flatMap(([, any]) => any.flatMap(p => pat(fill(p)))))]);
    return T.some(w => !known.has(w) && !PLAIN.has(w));
  }
  return { toks, check, judge, extra };
})();
