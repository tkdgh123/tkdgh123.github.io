/* cmini — a small C interpreter for the course subset (chapters 2–9).
   CMini.run(source, stdin) → { out, err, line, code }
   Semantics follow MSVC on Windows: int/long = 32 bits, rand() = MSVC LCG. */
(function (G) {
"use strict";
class CErr extends Error { constructor(msg, line) { super(msg); this.line = line; } }
const KW = new Set("auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while".split(" "));
const TYPEKW = new Set(["void", "char", "short", "int", "long", "float", "double", "signed", "unsigned", "const", "static", "register", "auto", "extern", "volatile"]);
const PUNCT = [">>=", "<<=", "...", "++", "--", "<<", ">>", "<=", ">=", "==", "!=", "&&", "||", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "->"];
const PREDEF = { NULL: "0", EOF: "(-1)", RAND_MAX: "32767", INT_MAX: "2147483647", INT_MIN: "(-2147483647-1)", UINT_MAX: "4294967295u", LONG_MAX: "2147483647L", LONG_MIN: "(-2147483647L-1)", ULONG_MAX: "4294967295UL", SHRT_MAX: "32767", SHRT_MIN: "(-32768)", USHRT_MAX: "65535", CHAR_MAX: "127", CHAR_MIN: "(-128)", SCHAR_MAX: "127", SCHAR_MIN: "(-128)", UCHAR_MAX: "255", CHAR_BIT: "8", true: "1", false: "0", EXIT_SUCCESS: "0", EXIT_FAILURE: "1" };

/* ---------------- lexer + tiny preprocessor ---------------- */
function lex(src) {
  src = src.replace(/\r\n?/g, "\n").replace(/\\\n/g, "");
  const toks = []; let i = 0, line = 1; const n = src.length;
  let macros = Object.assign({}, PREDEF);
  let bol = true;
  const err = m => { throw new CErr(m, line); };
  const cc = k => (k < n ? src[k] : "");
  while (i < n) {
    const c = src[i];
    if (c === "\n") { line++; i++; bol = true; continue; }
    if (c === " " || c === "\t" || c === "\f" || c === "\v") { i++; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { const j = src.indexOf("*/", i + 2); const end = j < 0 ? n : j + 2; for (let k = i; k < end; k++) if (src[k] === "\n") line++; i = end; continue; }
    if (c === "#" && bol) {
      let j = i; while (j < n && src[j] !== "\n") j++;
      const d = src.slice(i + 1, j).replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "").trim();
      let m;
      if ((m = /^define\s+([A-Za-z_]\w*)(\(?)\s*(.*)$/.exec(d))) {
        if (m[2] === "(") err("함수형 매크로(#define 이름(…))는 지원하지 않습니다.");
        macros = Object.assign({}, macros, { [m[1]]: m[3] });
      } else if ((m = /^undef\s+([A-Za-z_]\w*)/.exec(d))) { macros = Object.assign({}, macros); delete macros[m[1]]; }
      else if (/^(include|pragma|if|ifdef|ifndef|endif|else|elif|error|line)\b/.test(d) || d === "") { /* ignored */ }
      else err("알 수 없는 전처리 지시자: #" + d.split(/\s/)[0]);
      i = j; continue;
    }
    bol = false;
    const start = i;
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1; while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const w = src.slice(i, j); i = j;
      toks.push({ t: KW.has(w) ? "kw" : "id", v: w, line, mac: macros }); continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(cc(i + 1)))) {
      let j = i, isF = false, txt;
      if (c === "0" && /[xX]/.test(cc(i + 1))) { j += 2; while (/[0-9a-fA-F]/.test(cc(j))) j++; }
      else {
        while (/[0-9]/.test(cc(j))) j++;
        if (src[j] === ".") { isF = true; j++; while (/[0-9]/.test(cc(j))) j++; }
        if (/[eE]/.test(cc(j)) && /[0-9+-]/.test(cc(j + 1))) { isF = true; j++; if (/[+-]/.test(cc(j))) j++; while (/[0-9]/.test(cc(j))) j++; }
      }
      txt = src.slice(i, j);
      let suf = ""; while (/[uUlLfF]/.test(cc(j))) suf += src[j++];
      i = j;
      if (/[A-Za-z_0-9]/.test(src[i] || "")) err("잘못된 숫자 표기: " + src.slice(start, i + 1));
      suf = suf.toLowerCase();
      if (isF || (suf.includes("f") && !/^0x/i.test(txt))) { toks.push({ t: "num", v: parseFloat(txt), ty: suf.includes("f") ? "f" : "d", line }); continue; }
      let v = /^0x/i.test(txt) ? parseInt(txt, 16) : (txt.length > 1 && txt[0] === "0" ? parseInt(txt, 8) : parseInt(txt, 10));
      if (txt.length > 1 && txt[0] === "0" && !/^0x/i.test(txt) && /[89]/.test(txt)) err("8진수에는 8, 9를 쓸 수 없습니다: " + txt);
      const u = suf.includes("u"), L = (suf.match(/l/g) || []).length;
      let ty = L >= 2 ? (u ? "ull" : "ll") : L === 1 ? (u ? "ul" : "l") : (u ? "ui" : "i");
      if (ty === "i" && v > 2147483647) ty = (txt[0] === "0" && v <= 4294967295) ? "ui" : "ll";
      if ((ty === "l") && v > 2147483647) ty = "ll";
      toks.push({ t: "num", v, ty, line }); continue;
    }
    if (c === "'") {
      let j = i + 1; const r = readChar(src, j, err); j = r.j;
      if (src[j] !== "'") err("문자 상수는 작은따옴표 안에 문자 하나만 쓸 수 있습니다.");
      i = j + 1; toks.push({ t: "num", v: r.v, ty: "i", line, ch: true }); continue;
    }
    if (c === '"') {
      let j = i + 1, s = "";
      while (j < n && src[j] !== '"') { if (src[j] === "\n") err("문자열의 닫는 큰따옴표(\")가 없습니다."); const r = readChar(src, j, err); s += String.fromCodePoint(r.v < 0 ? r.v + 256 : r.v); j = r.j; }
      if (j >= n) err("문자열의 닫는 큰따옴표(\")가 없습니다.");
      i = j + 1;
      const last = toks[toks.length - 1];
      if (last && last.t === "str") last.v += s; else toks.push({ t: "str", v: s, line });
      continue;
    }
    let p = PUNCT.find(q => src.startsWith(q, i));
    if (!p) { if ("+-*/%=<>!&|^~?:;,.(){}[]".includes(c)) p = c; else err("알 수 없는 문자 '" + c + "'" + (/[“”‘’]/.test(c) ? " — 따옴표를 영문 따옴표로 바꾸세요." : (c.charCodeAt(0) > 127 ? " — 한글이나 특수문자는 문자열/주석 안에만 쓸 수 있습니다." : ""))); }
    toks.push({ t: "p", v: p, line }); i += p.length;
  }
  toks.push({ t: "eof", v: "<끝>", line });
  // macro expansion (object-like, recursive with guard)
  const out = [];
  const expand = (tok, depth, seen) => {
    if (tok.t === "id" && tok.mac && Object.prototype.hasOwnProperty.call(tok.mac, tok.v) && !seen.has(tok.v)) {
      if (depth > 30) throw new CErr("매크로가 너무 깊게 중첩되었습니다.", tok.line);
      const body = lex0(tok.mac[tok.v], tok.line);
      const s2 = new Set(seen); s2.add(tok.v);
      body.forEach(b => { b.mac = tok.mac; expand(b, depth + 1, s2); });
    } else out.push(tok);
  };
  toks.forEach(t => expand(t, 0, new Set()));
  return out;
}
function lex0(s, line) { // lex a macro body
  if (!s.trim()) return [];
  const r = lex(s.replace(/\n/g, " ")); r.pop();
  r.forEach(t => { t.line = line; delete t.mac; });
  return r;
}
function readChar(src, j, err) {
  let c = src[j];
  if (c !== "\\") { const cp = src.codePointAt(j); return { v: cp, j: j + (cp > 0xffff ? 2 : 1) }; }
  j++; c = src[j];
  const map = { n: 10, t: 9, r: 13, a: 7, b: 8, f: 12, v: 11, "\\": 92, "'": 39, '"': 34, "?": 63, "0": 0 };
  if (c === "x") { let k = j + 1, h = ""; while (k < src.length && /[0-9a-fA-F]/.test(src[k]) && h.length < 2) h += src[k++]; return { v: sx8(parseInt(h || "0", 16)), j: k }; }
  if (/[0-7]/.test(c)) { let k = j, o = ""; while (k < src.length && /[0-7]/.test(src[k]) && o.length < 3) o += src[k++]; return { v: sx8(parseInt(o, 8)), j: k }; }
  if (c in map) return { v: map[c], j: j + 1 };
  err("알 수 없는 이스케이프 시퀀스: \\" + c);
}
const sx8 = v => (v << 24) >> 24;

/* ---------------- types ---------------- */
const SIZE = { c: 1, uc: 1, s: 2, us: 2, i: 4, ui: 4, l: 4, ul: 4, ll: 8, ull: 8, f: 4, d: 8, v: 0 };
const isF = t => t === "f" || t === "d";
const NAME = { c: "char", uc: "unsigned char", s: "short", us: "unsigned short", i: "int", ui: "unsigned int", l: "long", ul: "unsigned long", ll: "long long", ull: "unsigned long long", f: "float", d: "double", v: "void" };
function conv(v, t) {
  switch (t) {
    case "d": return +v;
    case "f": return Math.fround(v);
    case "v": return 0;
  }
  if (!isFinite(v)) v = 0;
  v = Math.trunc(v);
  switch (t) {
    case "i": case "l": return v | 0;
    case "ui": case "ul": return v >>> 0;
    case "s": return (v << 16) >> 16;
    case "us": return v & 0xffff;
    case "c": return (v << 24) >> 24;
    case "uc": return v & 0xff;
    case "ll": return v;
    case "ull": return v < 0 ? v + 18446744073709551616 : v;
  }
  return v;
}
function promote(t) { return (t === "c" || t === "uc" || t === "s" || t === "us") ? "i" : t; }
function arith(a, b) {
  if (a === "d" || b === "d") return "d";
  if (a === "f" || b === "f") return "f";
  a = promote(a); b = promote(b);
  if (a === "ull" || b === "ull") return "ull";
  if (a === "ll" || b === "ll") return "ll";
  if (a === "ul" || b === "ul") return "ul";
  if ((a === "l" && b === "ui") || (a === "ui" && b === "l")) return "ul";
  if (a === "ui" || b === "ui") return "ui";
  if (a === "l" || b === "l") return "l";
  return "i";
}

/* ---------------- parser ---------------- */
function parse(toks) {
  let p = 0;
  const peek = (k = 0) => toks[p + k];
  const is = (v, k = 0) => { const t = toks[p + k]; return (t.t === "p" || t.t === "kw") && t.v === v; };
  const err = (m, t) => { t = t || peek(); throw new CErr(m, t.line); };
  const near = t => t.t === "eof" ? "코드 끝" : "'" + (t.t === "str" ? '"…"' : t.v) + "'";
  const eat = (v, what) => { if (is(v)) return toks[p++]; const t = peek(); err((what || "'" + v + "'") + "이(가) 필요합니다 (" + near(t) + " 앞)." + (v === ";" ? " 문장 끝에 세미콜론을 빠뜨리지 않았는지 확인하세요." : ""), v === ";" && p > 0 ? toks[p - 1] : t); };
  const isTypeStart = (k = 0) => { const t = peek(k); return t.t === "kw" && TYPEKW.has(t.v); };
  function specs() {
    const s = { static: false, const: false }; const ws = []; const t0 = peek();
    while (isTypeStart()) { const w = toks[p++].v; if (w === "static") s.static = true; else if (w === "const") s.const = true; else if (["register", "auto", "extern", "volatile"].includes(w)) { } else ws.push(w); }
    if (!ws.length) { if (s.const || s.static) ws.push("int"); else err("자료형이 필요합니다.", t0); }
    const has = w => ws.includes(w), cnt = w => ws.filter(x => x === w).length;
    const u = has("unsigned");
    let t;
    if (has("void")) t = "v";
    else if (has("double")) t = "d";
    else if (has("float")) t = "f";
    else if (has("char")) t = u ? "uc" : "c";
    else if (has("short")) t = u ? "us" : "s";
    else if (cnt("long") >= 2) t = u ? "ull" : "ll";
    else if (has("long")) t = u ? "ul" : "l";
    else t = u ? "ui" : "i";
    s.t = t; return s;
  }
  function typeName() { const s = specs(); if (is("*")) err("포인터 자료형은 지원하지 않습니다."); return s.t; }
  // ---- expressions
  const BIN = [["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "!="], ["<", ">", "<=", ">="], ["<<", ">>"], ["+", "-"], ["*", "/", "%"]];
  const ASG = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="]);
  function expr() { let e = assign(); while (is(",")) { const t = toks[p++]; e = { k: "comma", a: e, b: assign(), line: t.line }; } return e; }
  function assign() {
    const e = cond();
    const t = peek();
    if (t.t === "p" && ASG.has(t.v)) { p++; if (e.k !== "id") err("대입 연산자의 왼쪽에는 변수가 와야 합니다.", t); return { k: "asg", op: t.v, a: e, b: assign(), line: t.line }; }
    return e;
  }
  function cond() {
    const c = bin(0);
    if (is("?")) { const t = toks[p++]; const a = expr(); eat(":", "조건 연산자의 ':'"); const b = cond(); return { k: "cond", c, a, b, line: t.line }; }
    return c;
  }
  function bin(lv) {
    if (lv >= BIN.length) return unary();
    let a = bin(lv + 1);
    for (;;) {
      const t = peek();
      if (t.t === "p" && BIN[lv].includes(t.v)) { p++; const b = bin(lv + 1); a = { k: lv < 2 ? "log" : "bin", op: t.v, a, b, line: t.line }; }
      else return a;
    }
  }
  function unary() {
    const t = peek();
    if (t.t === "p") {
      if (t.v === "++" || t.v === "--") { p++; const a = unary(); if (a.k !== "id") err(t.v + " 는 변수에만 쓸 수 있습니다.", t); return { k: "pre", op: t.v, a, line: t.line }; }
      if (t.v === "+" || t.v === "-" || t.v === "!" || t.v === "~") { p++; return { k: "un", op: t.v, a: unary(), line: t.line }; }
      if (t.v === "&") { p++; const a = unary(); if (a.k !== "id") err("& 뒤에는 변수 이름이 와야 합니다.", t); return { k: "addr", a, line: t.line }; }
      if (t.v === "*") err("포인터(*)는 지원하지 않습니다.", t);
      if (t.v === "(" && isTypeStart(1)) { p++; const ty = typeName(); eat(")"); return { k: "cast", t: ty, a: unary(), line: t.line }; }
    }
    if (t.t === "kw" && t.v === "sizeof") {
      p++;
      if (is("(") && isTypeStart(1)) { p++; const ty = typeName(); eat(")"); return { k: "num", v: SIZE[ty], ty: "ui", line: t.line }; }
      return { k: "sizeof", a: unary(), line: t.line };
    }
    return postfix();
  }
  function postfix() {
    let e = primary();
    for (;;) {
      const t = peek();
      if (t.t === "p" && (t.v === "++" || t.v === "--")) { p++; if (e.k !== "id") err(t.v + " 는 변수에만 쓸 수 있습니다.", t); e = { k: "post", op: t.v, a: e, line: t.line }; }
      else if (t.t === "p" && t.v === "(") {
        if (e.k !== "id") err("함수 호출 형태가 올바르지 않습니다.", t);
        p++; const args = [];
        if (!is(")")) { do { args.push(assign()); } while (is(",") && ++p); }
        eat(")", "함수 호출의 닫는 괄호 ')'");
        e = { k: "call", f: e.n, args, line: e.line };
      }
      else if (t.t === "p" && t.v === "[") err("배열은 지원하지 않습니다.", t);
      else return e;
    }
  }
  function primary() {
    const t = toks[p++];
    if (t.t === "num") return { k: "num", v: t.v, ty: t.ty, line: t.line };
    if (t.t === "str") return { k: "str", v: t.v, line: t.line };
    if (t.t === "id") return { k: "id", n: t.v, line: t.line };
    if (t.t === "p" && t.v === "(") { const e = expr(); eat(")", "닫는 괄호 ')'"); return e; }
    p--; err("수식이 와야 할 자리에 " + near(t) + "이(가) 왔습니다.", t);
  }
  // ---- statements
  function declarators(s, isGlobal) {
    const list = [];
    do {
      if (is("*")) err("포인터 변수는 지원하지 않습니다.");
      const nt = toks[p++]; if (nt.t !== "id") err("변수 이름이 필요합니다 (" + near(nt) + ").", nt);
      if (is("[")) err("배열은 지원하지 않습니다.");
      let init = null; if (is("=")) { p++; init = assign(); }
      if (s.t === "v") err("void 형 변수는 만들 수 없습니다.", nt);
      list.push({ n: nt.v, t: s.t, init, st: s.static || isGlobal, c: s.const, line: nt.line });
    } while (is(",") && ++p);
    eat(";");
    return { k: "decl", list, line: list[0].line };
  }
  function stmt() {
    const t = peek();
    if (t.t === "p" && t.v === "{") return block();
    if (t.t === "p" && t.v === ";") { p++; return { k: "empty" }; }
    if (isTypeStart()) { const s = specs(); return declarators(s, false); }
    if (t.t === "kw") {
      switch (t.v) {
        case "if": { p++; eat("(", "if 다음의 '('"); const c = expr(); eat(")", "조건식 뒤의 ')'"); const a = stmt(); let b = null; if (is("else")) { p++; b = stmt(); } return { k: "if", c, a, b, line: t.line }; }
        case "while": { p++; eat("(", "while 다음의 '('"); const c = expr(); eat(")", "조건식 뒤의 ')'"); return { k: "while", c, b: stmt(), line: t.line }; }
        case "do": { p++; const b = stmt(); eat("while", "do 블록 뒤의 while"); eat("("); const c = expr(); eat(")"); eat(";"); return { k: "do", b, c, line: t.line }; }
        case "for": {
          p++; eat("(", "for 다음의 '('"); let init = null;
          if (isTypeStart()) init = declarators(specs(), false); else { if (!is(";")) init = { k: "expr", e: expr() }; eat(";", "for 초기식 뒤의 ';'"); }
          const c = is(";") ? null : expr(); eat(";", "for 조건식 뒤의 ';'");
          const step = is(")") ? null : expr(); eat(")", "for 증감식 뒤의 ')'");
          return { k: "for", init, c, step, b: stmt(), line: t.line };
        }
        case "switch": { p++; eat("("); const e = expr(); eat(")"); return { k: "switch", e, b: stmt(), line: t.line }; }
        case "case": { p++; const v = cond(); eat(":", "case 값 뒤의 ':'"); return { k: "case", v, s: is("}") ? { k: "empty" } : stmt(), line: t.line }; }
        case "default": { p++; eat(":", "default 뒤의 ':'"); return { k: "default", s: is("}") ? { k: "empty" } : stmt(), line: t.line }; }
        case "break": p++; eat(";"); return { k: "break", line: t.line };
        case "continue": p++; eat(";"); return { k: "continue", line: t.line };
        case "return": { p++; const e = is(";") ? null : expr(); eat(";"); return { k: "return", e, line: t.line }; }
        case "goto": err("goto는 지원하지 않습니다.", t);
        case "struct": case "union": case "enum": case "typedef": err(t.v + "는 지원하지 않습니다.", t);
        case "else": err("짝이 되는 if 없이 else가 나왔습니다. if 문의 중괄호를 확인하세요.", t);
      }
    }
    const e = expr(); eat(";"); return { k: "expr", e, line: t.line };
  }
  function block() { const t = eat("{"); const body = []; while (!is("}")) { if (peek().t === "eof") err("닫는 중괄호 '}'가 없습니다.", t); body.push(stmt()); } p++; return { k: "block", body, line: t.line }; }
  // ---- top level
  const funcs = {}, globals = [];
  while (peek().t !== "eof") {
    if (!isTypeStart()) { const t = peek(); if (t.t === "id" && is("(", 1)) err("함수 '" + t.v + "' 앞에 반환형(int, void 등)이 필요합니다.", t); err("함수나 전역 변수 선언이 와야 할 자리에 " + near(t) + "이(가) 왔습니다.", t); }
    const s = specs();
    if (peek().t === "id" && is("(", 1)) {
      const nt = toks[p++]; p++;
      const params = [];
      if (is("void") && is(")", 1)) p++;
      else if (!is(")")) {
        do {
          if (is("...")) { p++; break; }
          const ps = specs(); let pn = null;
          if (is("*")) err("포인터 매개변수는 지원하지 않습니다.");
          if (peek().t === "id") pn = toks[p++].v;
          if (is("[")) err("배열 매개변수는 지원하지 않습니다.");
          params.push({ t: ps.t, n: pn });
        } while (is(",") && ++p);
      }
      eat(")", "매개변수 목록의 닫는 괄호 ')'");
      if (is(";")) { p++; if (!funcs[nt.v]) funcs[nt.v] = { n: nt.v, ret: s.t, params, body: null, line: nt.line, proto: true }; continue; }
      if (!is("{")) err("함수 정의에는 '{' 가, 함수 원형 선언에는 ';' 가 필요합니다.");
      if (funcs[nt.v] && funcs[nt.v].body) err("함수 '" + nt.v + "'가 두 번 정의되었습니다.", nt);
      const body = block();
      funcs[nt.v] = { n: nt.v, ret: s.t, params, body, line: nt.line, statics: new Map() };
      continue;
    }
    globals.push(declarators(s, true));
  }
  return { funcs, globals };
}

/* ---------------- interpreter ---------------- */
const BRK = { k: "break" }, CNT = { k: "continue" };
function run(src, stdin, opts) {
  opts = opts || {};
  const MAXSTEP = opts.maxSteps || 2e7, MAXOUT = opts.maxOut || 200000;
  let out = "", steps = 0, depth = 0, seed = 1, inp = String(stdin == null ? "" : stdin), ip = 0, line = 0;
  const fail = (m, l) => { throw new CErr(m, l != null ? l : line); };
  const write = s => { out += s; if (out.length > MAXOUT) fail("출력이 너무 많습니다 (무한 반복 출력?)."); };
  let prog;
  try { prog = parse(lex(src)); }
  catch (e) { if (e instanceof CErr) return { out: "", err: e.message, line: e.line, phase: "compile" }; return { out: "", err: "내부 오류: " + e.message, phase: "compile" }; }
  const { funcs } = prog;
  if (!funcs.main || !funcs.main.body) return { out: "", err: "main 함수가 없습니다. 프로그램은 int main(void) { … } 에서 시작해야 합니다.", line: 1, phase: "compile" };
  const globalScope = new Map();
  let scope = null; // {vars: Map, up}
  function lookup(n, l) {
    for (let s = scope; s; s = s.up) { const v = s.vars.get(n); if (v) return v; }
    const g = globalScope.get(n); if (g) return g;
    fail("선언되지 않은 변수 '" + n + "'를 사용했습니다.", l);
  }
  function declare(d, target) {
    const vars = target || scope.vars;
    if (vars.has(d.n) && !target) fail("변수 '" + d.n + "'가 같은 블록에서 이미 선언되었습니다.", d.line);
    const v = { t: d.t, v: 0, init: false, c: d.c, n: d.n };
    if (d.init) { v.v = conv(ev(d.init), d.t); v.init = true; }
    else if (d.st || target) { v.init = true; }
    vars.set(d.n, v); return v;
  }
  // ---- type inference (cached per node)
  function ty(e) {
    if (e._t) return e._t;
    let t;
    switch (e.k) {
      case "num": t = e.ty; break;
      case "str": t = "str"; break;
      case "id": t = lookup(e.n, e.line).t; return t; // not cached: same name may differ by scope
      case "bin": { const a = ty(e.a), b = ty(e.b); t = (["==", "!=", "<", ">", "<=", ">="].includes(e.op)) ? "i" : (e.op === "<<" || e.op === ">>") ? promote(a) : arith(a, b); break; }
      case "log": t = "i"; break;
      case "asg": case "pre": case "post": return ty(e.a);
      case "un": t = e.op === "!" ? "i" : promote(ty(e.a)); break;
      case "cond": { const a = ty(e.a), b = ty(e.b); t = (a === "str" || b === "str") ? "str" : arith(a, b); break; }
      case "call": { const f = funcs[e.f]; t = f ? f.ret : (BUILTIN_T[e.f] || "i"); break; }
      case "cast": t = e.t; break;
      case "sizeof": t = "ui"; break;
      case "comma": return ty(e.b);
      case "addr": t = "ptr"; break;
    }
    e._t = t; return t;
  }
  function tick(l) { if (++steps > MAXSTEP) fail("실행이 너무 오래 걸립니다 — 무한 루프는 아닌지 확인하세요.", l); }
  function binop(op, a, b, t, l) {
    switch (op) {
      case "+": return conv(a + b, t);
      case "-": return conv(a - b, t);
      case "*": if (t === "i" || t === "l") return Math.imul(a, b); if (t === "ui" || t === "ul") return Math.imul(a, b) >>> 0; return conv(a * b, t);
      case "/": if (isF(t)) return conv(a / b, t); if (b === 0) fail("0으로 나누었습니다 (정수 나눗셈).", l); return conv(Math.trunc(a / b), t);
      case "%": if (isF(t)) fail("% 연산자는 정수에만 쓸 수 있습니다.", l); if (b === 0) fail("0으로 나머지 연산을 했습니다.", l); return conv(a % b, t);
      case "&": return conv(a & b, t);
      case "|": return conv(a | b, t);
      case "^": return conv(a ^ b, t);
      case "<<": return conv(a * Math.pow(2, b & 63), t);
      case ">>": return conv((t === "ui" || t === "ul") ? (a >>> (b & 31)) : (t === "ll" || t === "ull") ? Math.floor(a / Math.pow(2, b)) : (a >> (b & 31)), t);
    }
  }
  function ev(e) {
    tick(e.line);
    switch (e.k) {
      case "num": return e.v;
      case "str": return e.v;
      case "id": { const v = lookup(e.n, e.line); if (!v.init) fail("초기화되지 않은 변수 '" + e.n + "'를 사용했습니다. 값을 먼저 대입하세요.", e.line); return v.v; }
      case "bin": {
        const ta = ty(e.a), tb = ty(e.b);
        if (ta === "str" || tb === "str") fail("문자열로는 연산할 수 없습니다.", e.line);
        let a = ev(e.a), b = ev(e.b);
        const op = e.op;
        if (op === "==" || op === "!=" || op === "<" || op === ">" || op === "<=" || op === ">=") {
          const ct = arith(ta, tb); a = conv(a, ct); b = conv(b, ct);
          switch (op) { case "==": return +(a === b); case "!=": return +(a !== b); case "<": return +(a < b); case ">": return +(a > b); case "<=": return +(a <= b); default: return +(a >= b); }
        }
        const t = ty(e);
        if (op === "<<" || op === ">>") { if (isF(ta) || isF(tb)) fail("시프트 연산은 정수에만 쓸 수 있습니다.", e.line); return binop(op, conv(a, t), conv(b, promote(tb)), t, e.line); }
        if ((op === "&" || op === "|" || op === "^") && (isF(ta) || isF(tb))) fail("비트 연산(" + op + ")은 정수에만 쓸 수 있습니다.", e.line);
        return binop(op, conv(a, t), conv(b, t), t, e.line);
      }
      case "log": if (e.op === "&&") return ev(e.a) ? +!!ev(e.b) : 0; return ev(e.a) ? 1 : +!!ev(e.b);
      case "asg": {
        const v = lookup(e.a.n, e.line);
        if (v.c) fail("const 변수 '" + v.n + "'의 값은 바꿀 수 없습니다.", e.line);
        let r = ev(e.b);
        if (e.op !== "=") {
          if (!v.init) fail("초기화되지 않은 변수 '" + v.n + "'를 사용했습니다.", e.line);
          const op = e.op.slice(0, -1), tb = ty(e.b);
          const ct = (op === "<<" || op === ">>") ? promote(v.t) : arith(v.t, tb);
          r = binop(op, conv(v.v, ct), conv(r, (op === "<<" || op === ">>") ? promote(tb) : ct), ct, e.line);
        }
        v.v = conv(r, v.t); v.init = true; return v.v;
      }
      case "pre": case "post": {
        const v = lookup(e.a.n, e.line);
        if (v.c) fail("const 변수 '" + v.n + "'의 값은 바꿀 수 없습니다.", e.line);
        if (!v.init) fail("초기화되지 않은 변수 '" + v.n + "'를 사용했습니다.", e.line);
        const old = v.v; v.v = conv(old + (e.op === "++" ? 1 : -1), v.t);
        return e.k === "pre" ? v.v : old;
      }
      case "un": {
        const a = ev(e.a), t = ty(e);
        switch (e.op) { case "+": return conv(a, t); case "-": return conv(-a, t); case "!": return +!a; case "~": if (isF(t)) fail("~ 연산은 정수에만 쓸 수 있습니다.", e.line); return conv(~a, t); }
      }
      case "cond": { const t = ty(e); const r = ev(e.c) ? ev(e.a) : ev(e.b); return t === "str" ? r : conv(r, t); }
      case "cast": return conv(ev(e.a), e.t);
      case "sizeof": { const t = ty(e.a); return t === "str" ? e.a.v.length + 1 : SIZE[t]; }
      case "comma": ev(e.a); return ev(e.b);
      case "addr": fail("& (주소) 연산자는 scanf의 인수에만 쓸 수 있습니다 (포인터 미지원).", e.line);
      case "call": return call(e);
    }
  }
  function call(e) {
    const f = funcs[e.f];
    if (f) {
      if (!f.body) fail("함수 '" + e.f + "'는 원형만 있고 정의가 없습니다.", e.line);
      if (e.args.length !== f.params.length) fail("함수 '" + e.f + "'는 인수 " + f.params.length + "개가 필요한데 " + e.args.length + "개를 넘겼습니다.", e.line);
      const vals = e.args.map((a, i) => conv(ev(a), f.params[i].t));
      if (++depth > 3000) fail("재귀 호출이 너무 깊습니다 — 종료 조건을 확인하세요.", e.line);
      const saved = scope, savedLine = line;
      scope = { vars: new Map(), up: null, fn: f };
      f.params.forEach((pp, i) => { if (pp.n) scope.vars.set(pp.n, { t: pp.t, v: vals[i], init: true, n: pp.n }); });
      let r = exec(f.body, true);
      scope = saved; depth--; line = savedLine;
      if (r && r.k === "return") return f.ret === "v" ? 0 : conv(r.v, f.ret);
      if (f.ret !== "v" && e.f !== "main") return 0;
      return 0;
    }
    const b = BUILTIN[e.f];
    if (!b) fail("함수 '" + e.f + "'가 정의되지 않았습니다." + (e.f === "scanf_s" ? " (이 사이트에서는 scanf를 쓰세요)" : e.f === "Printf" || e.f === "print" ? " printf의 철자를 확인하세요." : ""), e.line);
    return b(e);
  }
  // ---- builtins
  const num = (e, i) => { if (!e.args[i]) fail("함수 인수가 부족합니다.", e.line); return ev(e.args[i]); };
  const BUILTIN = {
    printf(e) { if (!e.args.length || ty(e.args[0]) !== "str") fail("printf의 첫 인수는 \"서식 문자열\"이어야 합니다.", e.line); const s = fmt(ev(e.args[0]), e.args.slice(1), e.line); write(s); return s.length; },
    puts(e) { const s = ev(e.args[0]); write(String(s) + "\n"); return 0; },
    putchar(e) { const c = num(e, 0); write(chr(c)); return c; },
    getchar() { if (ip >= inp.length) return -1; return inp.charCodeAt(ip++); },
    scanf(e) { if (!e.args.length || ty(e.args[0]) !== "str") fail("scanf의 첫 인수는 \"서식 문자열\"이어야 합니다.", e.line); return scan(ev(e.args[0]), e.args.slice(1), e.line); },
    rand() { seed = (Math.imul(seed, 214013) + 2531011) >>> 0; return (seed >>> 16) & 0x7fff; },
    srand(e) { seed = num(e, 0) >>> 0; return 0; },
    time(e) { if (e.args[0] && e.args[0].k !== "num") fail("time에는 NULL을 넘기세요: time(NULL)", e.line); return Math.floor(Date.now() / 1000); },
    sqrt: e => Math.sqrt(num(e, 0)), pow: e => Math.pow(num(e, 0), num(e, 1)), fabs: e => Math.abs(num(e, 0)), abs: e => Math.abs(num(e, 0)) | 0, labs: e => Math.abs(num(e, 0)) | 0,
    sin: e => Math.sin(num(e, 0)), cos: e => Math.cos(num(e, 0)), tan: e => Math.tan(num(e, 0)), asin: e => Math.asin(num(e, 0)), acos: e => Math.acos(num(e, 0)), atan: e => Math.atan(num(e, 0)), atan2: e => Math.atan2(num(e, 0), num(e, 1)),
    floor: e => Math.floor(num(e, 0)), ceil: e => Math.ceil(num(e, 0)), log: e => Math.log(num(e, 0)), log10: e => Math.log10(num(e, 0)), exp: e => Math.exp(num(e, 0)), fmod: e => { const a = num(e, 0), b = num(e, 1); return a % b; }, round: e => { const v = num(e, 0); return v < 0 ? -Math.round(-v) : Math.round(v); },
    toupper: e => { const c = num(e, 0); return c >= 97 && c <= 122 ? c - 32 : c; }, tolower: e => { const c = num(e, 0); return c >= 65 && c <= 90 ? c + 32 : c; },
    isdigit: e => { const c = num(e, 0); return +(c >= 48 && c <= 57); }, isalpha: e => { const c = num(e, 0); return +((c >= 65 && c <= 90) || (c >= 97 && c <= 122)); }, isupper: e => { const c = num(e, 0); return +(c >= 65 && c <= 90); }, islower: e => { const c = num(e, 0); return +(c >= 97 && c <= 122); }, isspace: e => { const c = num(e, 0); return +(c === 32 || (c >= 9 && c <= 13)); },
    system: () => 0, _getch: () => 0, getch: () => 0, fflush: () => 0,
    exit(e) { throw { exit: num(e, 0) }; },
  };
  // builtin return types
  const chr = c => { c = c & 0xff; return c >= 128 ? "?" : String.fromCharCode(c); };
  function argRef(a, l) {
    if (a.k !== "addr") { if (a.k === "id") fail("scanf에서 변수 '" + a.n + "' 앞에 &를 붙여야 합니다: &" + a.n, l); fail("scanf의 인수는 &변수 형태여야 합니다.", l); }
    return lookup(a.a.n, l);
  }
  function scan(f, args, l) {
    let ai = 0, cnt = 0, i = 0;
    const ws = () => { while (ip < inp.length && /\s/.test(inp[ip])) ip++; };
    while (i < f.length) {
      const c = f[i];
      if (/\s/.test(c)) { ws(); i++; continue; }
      if (c !== "%") { if (inp[ip] === c) { ip++; i++; continue; } return cnt; }
      i++;
      if (f[i] === "%") { ws(); if (inp[ip] === "%") { ip++; i++; continue; } return cnt; }
      let suppress = false; if (f[i] === "*") { suppress = true; i++; }
      let width = ""; while (/[0-9]/.test(f[i])) width += f[i++];
      let len = ""; while (/[hlLqjzt]/.test(f[i])) len += f[i++];
      const cv = f[i++];
      if (!cv) fail("scanf 서식 문자열이 잘못되었습니다.", l);
      const ref = suppress ? null : (() => { if (ai >= args.length) fail("scanf의 서식 지정자 개수보다 인수가 적습니다.", l); return argRef(args[ai++], l); })();
      const W = width ? +width : Infinity;
      if (cv === "c") {
        if (ip >= inp.length) return cnt || -1;
        const ch = inp.charCodeAt(ip++);
        if (ref) { if (isF(ref.t)) fail("%c 로 읽은 값은 char 변수에 저장해야 합니다.", l); ref.v = conv(ch, ref.t); ref.init = true; cnt++; }
        continue;
      }
      ws();
      if (ip >= inp.length) return cnt || -1;
      let m;
      const rest = inp.slice(ip, ip + (W === Infinity ? 400 : W));
      if ("di".includes(cv)) m = /^[+-]?\d+/.exec(rest);
      else if (cv === "u") m = /^[+-]?\d+/.exec(rest);
      else if (cv === "x" || cv === "X") m = /^[+-]?(0[xX])?[0-9a-fA-F]+/.exec(rest);
      else if (cv === "o") m = /^[+-]?[0-7]+/.exec(rest);
      else if ("feEgGaA".includes(cv)) m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest);
      else if (cv === "s") fail("%s(문자열)는 지원하지 않습니다 — 배열이 필요합니다.", l);
      else fail("scanf에서 지원하지 않는 서식 %" + cv, l);
      if (!m) return cnt;
      ip += m[0].length;
      if (!ref) continue;
      let v;
      if ("feEgGaA".includes(cv)) {
        v = parseFloat(m[0]);
        if (!isF(ref.t)) fail("%" + len + cv + " 로 읽은 실수를 정수 변수 '" + ref.n + "'에 저장하려 했습니다. 자료형을 확인하세요.", l);
        if (ref.t === "d" && len !== "l" && len !== "L") fail("double 변수 '" + ref.n + "'는 %lf 로 입력받아야 합니다 (%f 는 float용).", l);
        if (ref.t === "f" && len === "l") fail("float 변수 '" + ref.n + "'는 %f 로 입력받아야 합니다 (%lf 는 double용).", l);
      } else {
        v = cv === "x" || cv === "X" ? parseInt(m[0], 16) : cv === "o" ? parseInt(m[0], 8) : parseInt(m[0], 10);
        if (isF(ref.t)) fail("%" + len + cv + " 로 실수 변수 '" + ref.n + "'에 입력받을 수 없습니다. float는 %f, double은 %lf 를 쓰세요.", l);
      }
      ref.v = conv(v, ref.t); ref.init = true; cnt++;
    }
    return cnt;
  }
  function fmt(f, args, l) {
    let o = "", ai = 0;
    const next = (cv) => { if (ai >= args.length) fail("printf 서식의 %" + cv + " 에 대응하는 인수가 없습니다.", l); const a = args[ai++]; return { v: ev(a), t: ty(a) }; };
    for (let i = 0; i < f.length; i++) {
      const c = f[i];
      if (c !== "%") { o += c; continue; }
      i++;
      if (f[i] === "%") { o += "%"; continue; }
      let flags = ""; while ("-+ #0".includes(f[i]) && f[i]) flags += f[i++];
      let width = ""; if (f[i] === "*") { i++; width = String(next("*").v); } else while (/[0-9]/.test(f[i])) width += f[i++];
      let prec = null; if (f[i] === ".") { i++; prec = ""; if (f[i] === "*") { i++; prec = String(next("*").v); } else while (/[0-9]/.test(f[i])) prec += f[i++]; prec = +prec || 0; }
      let len = ""; while (/[hlLqjzt]/.test(f[i])) len += f[i++];
      const cv = f[i];
      if (!cv) { o += "%"; break; }
      let s, a, neg = false;
      switch (cv) {
        case "d": case "i": {
          a = next(cv); if (a.t === "str") fail("%d 에 문자열을 넘겼습니다.", l);
          let v = isF(a.t) ? Math.trunc(a.v) : a.v; v = (len === "ll") ? v : (len === "h" ? (v << 16) >> 16 : len === "hh" ? (v << 24) >> 24 : (a.t === "ll" || a.t === "ull") ? v : v | 0);
          neg = v < 0; s = String(Math.abs(v)); if (prec != null) s = s.padStart(prec, "0"); break;
        }
        case "u": { a = next(cv); let v = isF(a.t) ? Math.trunc(a.v) : a.v; v = len === "ll" ? v : len === "h" ? v & 0xffff : v >>> 0; s = String(v); if (prec != null) s = s.padStart(prec, "0"); break; }
        case "x": case "X": case "o": {
          a = next(cv); let v = isF(a.t) ? Math.trunc(a.v) : a.v; v = len === "ll" ? (v < 0 ? v + 18446744073709551616 : v) : len === "h" ? v & 0xffff : v >>> 0;
          s = v.toString(cv === "o" ? 8 : 16); if (cv === "X") s = s.toUpperCase(); if (prec != null) s = s.padStart(prec, "0");
          if (flags.includes("#") && v !== 0) s = (cv === "o" ? "0" : cv === "x" ? "0x" : "0X") + s; break;
        }
        case "c": a = next(cv); s = chr(a.v); break;
        case "s": a = next(cv); if (a.t !== "str") fail("%s 에는 문자열을 넘겨야 합니다.", l); s = prec != null ? a.v.slice(0, prec) : a.v; break;
        case "f": case "F": case "e": case "E": case "g": case "G": {
          a = next(cv); if (a.t === "str") fail("%" + cv + " 에 문자열을 넘겼습니다.", l);
          let v = a.v; if (!isF(a.t)) v = 0;           // passing an int to %f prints 0.000000 on MSVC (garbage in general)
          const P = prec == null ? 6 : prec;
          if (!isFinite(v)) { neg = v < 0; s = isNaN(v) ? "nan" : "inf"; if (cv === "F" || cv === "E" || cv === "G") s = s.toUpperCase(); break; }
          neg = v < 0 || Object.is(v, -0); v = Math.abs(v);
          if (cv === "f" || cv === "F") s = fixed(v, P);
          else if (cv === "e" || cv === "E") s = expo(v, P, cv === "E");
          else { const PP = P === 0 ? 1 : P; const X = v === 0 ? 0 : +expo(v, PP - 1).split("e")[1]; if (PP > X && X >= -4) s = fixed(v, PP - 1 - X); else s = expo(v, PP - 1, cv === "G"); if (!flags.includes("#")) s = s.replace(/(\.\d*?)0+(?=$|[eE])/, "$1").replace(/\.(?=$|[eE])/, ""); }
          if (flags.includes("#") && !s.includes(".") && /^[0-9]+$/.test(s)) s += ".";
          break;
        }
        default: fail("printf에서 지원하지 않는 서식 %" + cv, l);
      }
      const numeric = "diuxXofFeEgG".includes(cv);
      let sign = neg ? "-" : (numeric && "dfFeEgGi".includes(cv) && flags.includes("+")) ? "+" : (numeric && "dfFeEgGi".includes(cv) && flags.includes(" ")) ? " " : "";
      const W = +width || 0, body = sign + s;
      if (body.length >= W) o += body;
      else if (flags.includes("-")) o += body.padEnd(W, " ");
      else if (flags.includes("0") && numeric && !(prec != null && "diuxXo".includes(cv))) o += sign + s.padStart(W - sign.length, "0");
      else o += body.padStart(W, " ");
    }
    if (ai < args.length) { /* extra args are ignored in C */ }
    return o;
  }
  // ---- statements
  function exec(s, fnBody) {
    if (s.line) line = s.line;
    switch (s.k) {
      case "block": {
        const saved = scope; if (!fnBody) scope = { vars: new Map(), up: scope, fn: scope && scope.fn };
        let r;
        for (let i = 0; i < s.body.length; i++) { r = exec(s.body[i]); if (r) break; }
        scope = saved; return r;
      }
      case "decl":
        for (const d of s.list) {
          if (d.st) { // static local: initialised once, kept per function
            const fs = scope.fn.statics; let v = fs.get(d);
            if (!v) { v = { t: d.t, v: d.init ? conv(evConst(d.init), d.t) : 0, init: true, c: d.c, n: d.n }; fs.set(d, v); }
            scope.vars.set(d.n, v);
          } else declare(d);
        }
        return;
      case "expr": tick(s.line); ev(s.e); return;
      case "empty": return;
      case "if": return ev(s.c) ? exec(s.a) : (s.b ? exec(s.b) : undefined);
      case "while": for (;;) { tick(s.line); if (!ev(s.c)) return; const r = exec(s.b); if (r) { if (r === BRK) return; if (r === CNT) continue; return r; } }
      case "do": for (;;) { tick(s.line); const r = exec(s.b); if (r) { if (r === BRK) return; if (r !== CNT) return r; } if (!ev(s.c)) return; }
      case "for": {
        const saved = scope; scope = { vars: new Map(), up: scope, fn: scope.fn };
        if (s.init) exec(s.init);
        let ret;
        for (;;) { tick(s.line); if (s.c && !ev(s.c)) break; const r = exec(s.b); if (r) { if (r === BRK) break; if (r !== CNT) { ret = r; break; } } if (s.step) ev(s.step); }
        scope = saved; return ret;
      }
      case "switch": {
        const v = conv(ev(s.e), promote(ty(s.e)));
        if (isF(ty(s.e))) fail("switch의 값은 정수(또는 문자)여야 합니다.", s.line);
        const body = s.b.k === "block" ? s.b.body : [s.b];
        let start = -1, def = -1;
        const labels = (st) => { const L = []; while (st && (st.k === "case" || st.k === "default")) { L.push(st); st = st.s; } return L; };
        for (let i = 0; i < body.length && start < 0; i++) for (const lb of labels(body[i])) { if (lb.k === "default") { if (def < 0) def = i; } else if (conv(evConst(lb.v), "ll") === v) { start = i; break; } }
        if (start < 0) start = def;
        if (start < 0) return;
        const saved = scope; scope = { vars: new Map(), up: scope, fn: scope.fn };
        let ret;
        for (let i = start; i < body.length; i++) { let st = body[i]; while (st.k === "case" || st.k === "default") st = st.s; const r = exec(st); if (r) { if (r !== BRK) ret = r; break; } }
        scope = saved; return ret;
      }
      case "case": case "default": return exec(s.s);
      case "break": return BRK;
      case "continue": return CNT;
      case "return": return { k: "return", v: s.e ? ev(s.e) : 0 };
    }
  }
  function evConst(e) { return ev(e); }
  // ---- go
  try {
    scope = { vars: new Map(), up: null, fn: { statics: new Map() } };
    for (const g of prog.globals) for (const d of g.list) { const v = declare(d, globalScope); }
    scope = null;
    line = funcs.main.line;
    const r = call({ f: "main", args: [], line: funcs.main.line });
    return { out, code: r, steps };
  } catch (e) {
    if (e && e.exit != null) return { out, code: e.exit, steps };
    if (e instanceof CErr) return { out, err: e.message, line: e.line, phase: "run", steps };
    if (e instanceof RangeError) return { out, err: "재귀 호출이 너무 깊습니다 — 종료 조건을 확인하세요.", line, phase: "run" };
    return { out, err: "내부 오류: " + (e && e.message), line, phase: "run" };
  }
}
const BUILTIN_T = { sqrt: "d", pow: "d", fabs: "d", sin: "d", cos: "d", tan: "d", asin: "d", acos: "d", atan: "d", atan2: "d", floor: "d", ceil: "d", log: "d", log10: "d", exp: "d", fmod: "d", round: "d", time: "ll", printf: "i", scanf: "i", getchar: "i", putchar: "i", rand: "i", srand: "v", abs: "i" };
function fixed(v, P) { // exact decimal expansion + round-half-even, like the C runtime
  if (v === 0) return P ? "0." + "0".repeat(P) : "0";
  const dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, v);
  const hi = dv.getUint32(0), lo = dv.getUint32(4);
  const ex = (hi >>> 20) & 0x7ff;
  let m = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo), e;
  if (ex === 0) e = -1074; else { m |= 1n << 52n; e = ex - 1075; }
  // v = m * 2^e ; scaled = v * 10^P as exact rational num/den
  let num = m * 10n ** BigInt(P), den = 1n;
  if (e >= 0) num <<= BigInt(e); else den <<= BigInt(-e);
  let q = num / den; const r = num % den;
  if (r * 2n > den || (r * 2n === den && (q & 1n))) q += 1n;
  let s = q.toString();
  if (!P) return s;
  s = s.padStart(P + 1, "0");
  return s.slice(0, -P) + "." + s.slice(-P);
}
function expo(v, P, up) {
  let s = v.toExponential(Math.min(P, 100));
  s = s.replace(/e([+-])(\d)$/, "e$10$2");
  return up ? s.toUpperCase() : s;
}
G.CMini = { run, version: "1.0" };
if (typeof module !== "undefined") module.exports = G.CMini;
})(typeof window !== "undefined" ? window : globalThis);
