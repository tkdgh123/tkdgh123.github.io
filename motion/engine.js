"use strict";
/* ============ motion engine: deterministic, seekable ============ */
const W = 1920, H = 1080;
const CH = {
  0: { no: "", title: "C 프로그래밍 기초", acc: "#2997ff", acc2: "#bf5af2" },
  2: { no: "02", title: "프로그램 작성 과정", en: "From source code to .exe", acc: "#2997ff", acc2: "#64d2ff" },
  3: { no: "03", title: "C 프로그램 구성요소", en: "Comments · Variables · I/O", acc: "#30d5c8", acc2: "#7cf5e4" },
  4: { no: "04", title: "변수와 자료형", en: "Types, sizes & overflow", acc: "#bf5af2", acc2: "#e3a6ff" },
  5: { no: "05", title: "수식과 연산자", en: "Operators & expressions", acc: "#ff9f0a", acc2: "#ffd479" },
  6: { no: "06", title: "조건문", en: "if · else · switch", acc: "#ff375f", acc2: "#ff8aa5" },
  7: { no: "07", title: "반복문", en: "while · for · break", acc: "#30d158", acc2: "#9cf0ae" },
  8: { no: "08", title: "함수", en: "Define · call · return", acc: "#ffd60a", acc2: "#fff2a8" },
  9: { no: "09", title: "함수와 변수", en: "Scope · static · recursion", acc: "#64d2ff", acc2: "#5e5ce6" },
};
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  o3: t => 1 - Math.pow(1 - t, 3),
  o5: t => 1 - Math.pow(1 - t, 5),
  io3: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  ob: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  oe: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
function K(t, a, d = 0.6, e = E.o3) { return e(clamp((t - a) / d)); }
const NOPX = { opacity: 1, zIndex: 1, fontWeight: 1, lineHeight: 1, flex: 1 };
function S(el, o) {
  let tr = "";
  if (o.p) tr += "perspective(1800px) ";
  if (el._c) tr += "translate(-50%,-50%) ";
  if (o.x || o.y) tr += `translate(${(o.x || 0).toFixed(2)}px,${(o.y || 0).toFixed(2)}px) `;
  if (o.s != null && o.s !== 1) tr += `scale(${o.s.toFixed(4)}) `;
  if (o.sx != null) tr += `scaleX(${o.sx.toFixed(4)}) `;
  if (o.sy != null) tr += `scaleY(${o.sy.toFixed(4)}) `;
  if (o.rx) tr += `rotateX(${o.rx.toFixed(2)}deg) `;
  if (o.ry) tr += `rotateY(${o.ry.toFixed(2)}deg) `;
  if (o.r) tr += `rotate(${o.r.toFixed(2)}deg) `;
  if (tr !== el._tr) { el.style.transform = tr; el._tr = tr; }
  if (o.o != null) {
    const v = clamp(o.o);
    if (v !== el._o) { el.style.opacity = v; el.style.visibility = v < 0.002 ? "hidden" : "visible"; el._o = v; }
  }
  const b = o.b || 0;
  const f = b > 0.08 ? `blur(${b.toFixed(2)}px)` : "";
  if (f !== el._f) { el.style.filter = f; el._f = f; }
}
function css(e, c) { for (const k in c) { const v = c[k]; e.style[k] = typeof v === "number" && !NOPX[k] ? v + "px" : v; } }
function h(parent, cls, html, c) {
  const e = document.createElement("div");
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (c) css(e, c);
  parent.appendChild(e);
  return e;
}
/* absolutely positioned; center=true → (x,y) is the center */
function at(parent, x, y, cls, html, c, center) {
  const e = h(parent, "ab " + (cls || ""), html, c);
  e.style.left = x + "px"; e.style.top = y + "px";
  if (center) e._c = 1;
  S(e, { o: 0 });
  return e;
}
function txt(e, s) { if (e._t !== s) { e.textContent = s; e._t = s; } }
function htm(e, s) { if (e._h !== s) { e.innerHTML = s; e._h = s; } }
/* common animations — all pure functions of t */
function rise(el, t, a, d = 0.7, dy = 36) { const p = K(t, a, d, E.o5); S(el, { o: p, y: (1 - p) * dy, b: (1 - p) * 6 }); return p; }
function pop(el, t, a, d = 0.55) { const q = clamp((t - a) / d); S(el, { o: clamp(q * 2.5), s: 0.4 + 0.6 * E.ob(q) }); return q; }
function blurIn(el, t, a, d = 0.9) { const p = K(t, a, d, E.o5); S(el, { o: p, s: 1.12 - 0.12 * p, b: (1 - p) * 16 }); return p; }
/* in at a, out at b */
function vis(el, t, a, b, o = {}) {
  const d = o.d || 0.6, dy = o.dy == null ? 30 : o.dy;
  const pi = K(t, a, d, E.o5), po = b == null ? 0 : K(t, b, o.do || 0.45, E.io3);
  S(el, { o: pi * (1 - po), y: (1 - pi) * dy - po * dy * 0.6 + (o.y || 0), x: o.x || 0, s: (o.s0 != null ? lerp(o.s0, 1, pi) : 1) * (1 - po * 0.04), b: (1 - pi) * (o.blur == null ? 6 : o.blur) + po * 4 });
  return pi * (1 - po);
}
const esc = s => String(s).replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
function md(s) {
  if (!s) return "";
  return s.replace(/`([^`]+)`/g, (m, a) => "<code>" + esc(a) + "</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
}
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- SVG ---------- */
const NS = "http://www.w3.org/2000/svg";
function svgLayer(root) { const s = document.createElementNS(NS, "svg"); s.setAttribute("class", "ov"); s.setAttribute("viewBox", "0 0 1920 1080"); root.appendChild(s); return s; }
function sv(parent, tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
/* arrow along points; returns {set(p,o)} */
function arrow(svg, pts, o = {}) {
  const col = o.c || "rgba(255,255,255,.55)", w = o.w || 3;
  let d = "M" + pts[0][0] + " " + pts[0][1];
  if (o.curve && pts.length === 3) d += " Q" + pts[1][0] + " " + pts[1][1] + " " + pts[2][0] + " " + pts[2][1];
  else for (let i = 1; i < pts.length; i++) d += " L" + pts[i][0] + " " + pts[i][1];
  const g = sv(svg, "g", {});
  const p = sv(g, "path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1 });
  if (o.dash) p.setAttribute("stroke-dasharray", o.dash);
  const a = pts[pts.length - 1], b = pts[pts.length - 2];
  const ang = Math.atan2(a[1] - b[1], a[0] - b[0]), L = o.head == null ? 16 : o.head;
  const hd = sv(g, "path", { d: `M${a[0] - L * Math.cos(ang - 0.45)} ${a[1] - L * Math.sin(ang - 0.45)} L${a[0]} ${a[1]} L${a[0] - L * Math.cos(ang + 0.45)} ${a[1] - L * Math.sin(ang + 0.45)}`, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" });
  if (o.head === 0) hd.style.display = "none";
  let last = -1;
  return {
    g, p,
    set(v, op = 1) {
      v = clamp(v);
      const key = v.toFixed(4) + "|" + op.toFixed(3);
      if (key === last) return; last = key;
      if (!o.dash) { p.style.strokeDasharray = "1 1"; p.style.strokeDashoffset = 1 - v; }
      else p.style.opacity = v > 0 ? 1 : 0;
      hd.style.opacity = v > 0.96 ? 1 : 0;
      g.style.opacity = v <= 0 ? 0 : op;
    },
    pt(v) { const L2 = p.getTotalLength(); return p.getPointAtLength(clamp(v) * L2); },
  };
}

/* ---------- scene registry ---------- */
const SC = []; let TOTAL = 0;
function add(def) {
  def.ch = def.ch == null ? 0 : def.ch;
  def.start = TOTAL; TOTAL += def.dur; SC.push(def); return def;
}
/* captions helper: list of [dur, text] → absolute caps starting at t0 */
function seqCaps(t0, list, gap = 0.25) { const out = []; let t = t0; for (const [d, s] of list) { out.push([t, t + d, s]); t += d + gap; } return out; }

/* ---------- chapter title ---------- */
function chTitle(ch, points) {
  const C = CH[ch];
  return add({
    ch, name: "CHAPTER " + C.no, dur: 8.2, hud: false, fadeIn: false,
    build(root) {
      const num = at(root, 470, 540, "big grad", C.no, { fontSize: 470 }, true);
      const TX = 830, tfs = Math.min(130, Math.floor(1000 / (C.title.length * 1.0)));
      const lab = at(root, TX + 4, 300, "", "CHAPTER " + ch, { fontSize: 30, fontWeight: 700, letterSpacing: ".34em", color: C.acc });
      const words = C.title.split(" ");
      const tw = h(root, "ab", null, { left: TX, top: 350, display: "flex", gap: "26px", whiteSpace: "nowrap" });
      const ws = words.map(w => { const e = h(tw, "big", esc(w), { fontSize: tfs, display: "inline-block" }); S(e, { o: 0 }); return e; });
      const en = at(root, TX + 6, 520, "", esc(C.en), { fontSize: 34, color: "rgba(255,255,255,.55)", fontWeight: 500 });
      const line = at(root, TX + 6, 600, "", "", { width: 820, height: 2, background: "linear-gradient(90deg," + C.acc + ",transparent)", transformOrigin: "0 50%" });
      const chips = points.map(p => at(root, 0, 0, "chip", esc(p), {}));
      // layout chips in flow
      const flow = h(root, "ab", null, { left: TX + 6, top: 640, width: 900, display: "flex", flexWrap: "wrap", gap: "14px" });
      chips.forEach(c => { c.style.position = "relative"; c.style.left = "0"; c.style.top = "0"; flow.appendChild(c); });
      return t => {
        const p = K(t, 0.1, 1.6, E.o5);
        S(num, { o: p, s: 1.5 - 0.5 * p + t * 0.012, b: (1 - p) * 30 });
        rise(lab, t, 0.7, 0.8, 20);
        ws.forEach((w, i) => { const q = K(t, 0.85 + i * 0.12, 0.9, E.o5); S(w, { o: q, y: (1 - q) * 90, b: (1 - q) * 12 }); });
        rise(en, t, 1.35, 0.8, 24);
        const q = K(t, 1.5, 1.1, E.io3); S(line, { o: q, sx: q });
        chips.forEach((c, i) => { const r = K(t, 2.1 + i * 0.16, 0.6, E.ob); S(c, { o: clamp((t - 2.1 - i * 0.16) * 3), y: (1 - r) * 30, s: 0.8 + 0.2 * r }); });
      };
    },
  });
}

/* ---------- kinetic statement ----------
   lines: [{s:"text *em* text", at, size, y, mono, color}] */
function say(ch, name, dur, lines, extra) {
  return add({
    ch, name, dur,
    build(root) {
      const L = lines.map(l => {
        const box = h(root, "ab", null, { left: 0, right: 0, top: l.y, textAlign: "center", fontSize: l.size || 72, fontWeight: l.w || 800, letterSpacing: "-.03em", whiteSpace: "nowrap", color: l.color || "#fff" });
        if (l.mono) box.classList.add("mono");
        const parts = [];
        String(l.s).split(/(\*[^*]+\*)/).forEach(seg => {
          if (!seg) return;
          const em = seg[0] === "*" && seg.length > 2;
          const s = em ? seg.slice(1, -1) : seg;
          s.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) { box.appendChild(document.createTextNode(" ")); return; }
            const sp = document.createElement("span");
            sp.style.display = "inline-block"; sp.innerHTML = esc(w);
            if (em) sp.className = "grad";
            box.appendChild(sp); parts.push(sp); S(sp, { o: 0 });
          });
        });
        return { l, parts };
      });
      const ex = extra ? extra(root) : null;
      return t => {
        L.forEach(({ l, parts }) => parts.forEach((sp, i) => {
          const q = K(t, l.at + i * (l.st || 0.09), 0.8, E.o5);
          const qo = l.out != null ? K(t, l.out, 0.5, E.io3) : 0;
          S(sp, { o: q * (1 - qo), y: (1 - q) * 50 - qo * 30, b: (1 - q) * 14 + qo * 8 });
        }));
        if (ex) ex(t);
      };
    },
  });
}

/* ---------- caption-driven diagram scene ---------- */
function dia(ch, name, dur, build, caps) { return add({ ch, name, dur, build, caps: caps || [] }); }

/* ---------- C highlighter ---------- */
const KW = new Set("auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while".split(" "));
function hlC(src) {
  let out = "", i = 0; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "*") { let j = src.indexOf("*/", i + 2); j = j < 0 ? n : j + 2; out += '<span class="cm">' + esc(src.slice(i, j)) + "</span>"; i = j; continue; }
    if (c === "/" && src[i + 1] === "/") { let j = src.indexOf("\n", i); j = j < 0 ? n : j; out += '<span class="cm">' + esc(src.slice(i, j)) + "</span>"; i = j; continue; }
    if (c === "#" && (i === 0 || /^\s*$/.test(src.slice(src.lastIndexOf("\n", i - 1) + 1, i)))) { let j = src.indexOf("\n", i); j = j < 0 ? n : j; out += '<span class="pp">' + esc(src.slice(i, j)) + "</span>"; i = j; continue; }
    if (c === '"' || c === "'") { let j = i + 1; while (j < n && src[j] !== c && src[j] !== "\n") { if (src[j] === "\\") j++; j++; } j++; out += '<span class="st">' + esc(src.slice(i, j)) + "</span>"; i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i + 1; while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++; const w = src.slice(i, j);
      if (KW.has(w)) out += '<span class="kw">' + w + "</span>";
      else if (/^\s*\(/.test(src.slice(j, j + 8))) out += '<span class="fn">' + w + "</span>";
      else out += w;
      i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i + 1; while (j < n && /[0-9a-fA-FxX.e]/.test(src[j])) j++; out += '<span class="nm">' + src.slice(i, j) + "</span>"; i = j; continue; }
    out += esc(c); i++;
  }
  return out;
}

/* ---------- code walkthrough scene ----------
 o = { name, file, tag, title, about, src | vers:[...], types:{x:"int"}, termH, lh,
       steps:[{ l:"5-7", t:"title", d:"desc", v:{x:"10"}, o:"output [[input]]", clr, ver, m:["substr"], dur }] } */
function parseRanges(l) {
  if (l == null) return null;
  return String(l).split(",").map(s => { const m = s.trim().split("-").map(Number); return [m[0], m[1] || m[0]]; });
}
function tparse(s) { const out = []; let inp = false; for (let i = 0; i < s.length; i++) { if (s.startsWith("[[", i)) { inp = true; i++; continue; } if (s.startsWith("]]", i)) { inp = false; i++; continue; } out.push([s[i], inp]); } return out; }
function plainLen(s) { return (s || "").replace(/`|\*\*/g, "").length; }
function code(ch, o) {
  const vers = (o.vers || [o.src]).map(v => v.replace(/^\n/, "").replace(/\s+$/, ""));
  const vlines = vers.map(v => v.split("\n"));
  const maxN = Math.max(...vlines.map(l => l.length));
  // per-step derived state
  let ver = 0, vars = {}, names = [], buf = "", panel = -1, ranges = null;
  const panels = [{ num: "OVERVIEW", t: o.title || o.name, d: o.about || "" }];
  const steps = [];
  const T0 = 1.5 + Math.min(1.3, maxN * 0.045);
  const ovD = o.ov == null ? 2.6 + plainLen(o.about) * 0.05 : o.ov;
  let tcur = T0 + ovD;
  for (const s of o.steps) {
    const prevBuf = buf;
    if (s.clr) buf = "";
    const base = buf;
    if (s.o != null) buf += s.o;
    if (s.ver != null) ver = s.ver;
    if (s.v) { vars = Object.assign({}, vars, s.v); for (const k in s.v) if (!names.includes(k)) names.push(k); }
    if (s.t || s.d) { panels.push({ t: s.t || "", d: s.d || "" }); }
    if (s.l !== undefined) ranges = parseRanges(s.l);
    const addLen = s.o ? tparse(s.o).length : 0;
    const typeD = addLen / 34;
    const dur = s.dur != null ? s.dur : (s.t || s.d) ? clamp(2.6 + plainLen((s.t || "") + (s.d || "")) * 0.06, 4.2, 10.5) + typeD * 0.8 : 1.5 + typeD;
    steps.push({ a: tcur, dur, ver, vars: Object.assign({}, vars), ranges, base, buf, panel: panels.length - 1, marks: s.m || [], changed: s.v ? Object.keys(s.v) : [], clr: !!s.clr });
    tcur += dur;
  }
  const dur = tcur + (o.hold == null ? 1.8 : o.hold);
  const hasVars = names.length > 0, hasOut = o.steps.some(s => s.o != null);
  return add({
    ch, name: o.name, dur, code: true, _o: o, _v: vlines, _st: steps,
    build(root) {
      const C = CH[ch];
      const X = 80, Y = 150, WW = o.ww || 1080, HH = 810;
      // ---- code window
      const win = at(root, X, Y, "win", null, { width: WW, height: HH });
      const bar = h(win, "bar", '<i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span class="fn">' + esc(o.file || "main.c") + "</span>" + (o.tag ? '<span class="tag">' + esc(o.tag) + "</span>" : ""));
      const view = h(win, "view");
      const wrap = h(view, "codewrap mono");
      // font metric
      let lh = o.lh || clamp(Math.floor(740 / (maxN + 0.6)), 31, 60);
      let maxEm = 0;
      vlines.forEach(L => L.forEach(s => { let em = 0; for (const ch2 of s) em += /[ᄀ-ᇿ　-鿿가-힯＀-￯]/.test(ch2) ? 1.0 : 0.6; maxEm = Math.max(maxEm, em); }));
      let fs = Math.min(Math.round(lh * 0.58), Math.floor((WW - 74 - 40) / Math.max(1, maxEm)));
      fs = Math.max(fs, 15);
      if (lh < fs * 1.45) lh = Math.round(fs * 1.45);
      wrap.style.fontSize = fs + "px"; wrap.style.lineHeight = lh + "px";
      const bands = [0, 1, 2].map(() => h(wrap, "band"));
      const verEls = vlines.map((L, vi) => {
        const ve = h(wrap, "ver"); S(ve, { o: vi === 0 ? 1 : 0 });
        const lineEls = L.map((s, i) => { const ln = h(ve, "ln", '<span class="g">' + (i + 1) + '</span><span class="c">' + (hlC(s) || " ") + "</span>", { height: lh }); return ln; });
        return { ve, lineEls };
      });
      const markEls = [0, 1, 2, 3].map(() => h(wrap, "mark"));
      const viewH = HH - 58 - 10;
      const oy = Math.max(0, (viewH - (maxN * lh + 44)) / 2 * 0.75);
      // ---- right column
      const RX = X + WW + 44, RW = 1840 - RX;
      const nameW = n => Math.max(118, 36 + Math.max(n.length + (o.types && o.types[n] ? o.types[n].length + 1 : 0), 4) * 12);
      let rows = 0;
      if (hasVars) { let rowW = 0; rows = 1; names.forEach(n => { const w = nameW(n) + 12; if (rowW + w > RW - 48) { rows++; rowW = 0; } rowW += w; }); }
      const varsH = hasVars ? 70 + rows * 96 : 0;
      const termH = hasOut ? (o.termH || 250) : 0;
      const gap = 22;
      const expH = HH - varsH - termH - (hasVars ? gap : 0) - (hasOut ? gap : 0);
      const pc = at(root, RX, Y, "pcard", '<div class="plabel">EXPLAIN</div>', { width: RW, height: expH });
      const pEls = panels.map((p, i) => {
        const e = h(pc, "pstep", '<div class="pnum">' + (i === 0 ? "OVERVIEW" : "STEP " + String(i).padStart(2, "0") + " / " + String(panels.length - 1).padStart(2, "0")) + '</div><div class="ptitle">' + md(p.t) + '</div><div class="ptext">' + md(p.d) + "</div>");
        S(e, { o: 0 });
        return e;
      });
      let fitted = false;
      function fit() { // shrink text that overflows its card
        if (fitted) return; fitted = true;
        pEls.forEach(e => {
          const tx = e.querySelector(".ptext"), ti = e.querySelector(".ptitle");
          let f = 30, g = 42; tx.style.fontSize = f + "px"; ti.style.fontSize = g + "px";
          while (e.offsetHeight > expH - 80 && f > 19) { f -= 1; g = Math.max(28, g - 1); tx.style.fontSize = f + "px"; ti.style.fontSize = g + "px"; }
        });
      }
      let vc = null, vEls = {};
      if (hasVars) {
        vc = at(root, RX, Y + expH + gap, "pcard", '<div class="plabel">MEMORY</div>', { width: RW, height: varsH });
        const vw = h(vc, "vars");
        names.forEach(n => { const e = h(vw, "var", '<div class="vn">' + (o.types && o.types[n] ? '<span style="color:#ff7ab2">' + esc(o.types[n]) + "</span> " : "") + esc(n) + '</div><div class="vv"></div>'); vEls[n] = { e, v: e.querySelector(".vv") }; });
      }
      let tc = null, term = null, rowsT = 0;
      if (hasOut) {
        tc = at(root, RX, Y + HH - termH, "pcard", '<div class="plabel">OUTPUT ▸ 실행 결과</div>', { width: RW, height: termH, background: "rgba(0,0,0,.5)" });
        term = h(tc, "term mono");
        rowsT = Math.max(1, Math.floor((termH - 80) / (23 * 1.5)));
      }
      const scrollFor = st => {
        const n = vlines[st ? st.ver : 0].length, contentH = n * lh + 44;
        if (contentH <= viewH || !st || !st.ranges) return 0;
        const a = st.ranges[0][0], b = st.ranges[st.ranges.length - 1][1];
        const cy = 22 + ((a - 1 + b) / 2) * lh;
        return clamp(cy - viewH / 2, 0, contentH - viewH);
      };
      const opFor = (st, i) => (!st || !st.ranges) ? 1 : st.ranges.some(r => i + 1 >= r[0] && i + 1 <= r[1]) ? 1 : 0.28;
      const markCache = {};
      function measure(si) {
        if (markCache[si]) return markCache[si];
        const st = steps[si]; const res = [];
        const lines = vlines[st.ver]; const els = verEls[st.ver].lineEls;
        const wr = wrap.getBoundingClientRect(); const k = wr.width / wrap.offsetWidth;
        st.marks.forEach(m => {
          let li = -1, idx = -1, sub = m;
          const mm = /^(\d+):(.*)$/.exec(m);
          if (mm) { li = +mm[1] - 1; sub = mm[2]; idx = lines[li].indexOf(sub); }
          else {
            const cand = [];
            (st.ranges || [[1, lines.length]]).forEach(r => { for (let i = r[0] - 1; i < r[1]; i++) cand.push(i); });
            for (const i of cand.concat(lines.map((_, j) => j))) { const p = lines[i] ? lines[i].indexOf(sub) : -1; if (p >= 0) { li = i; idx = p; break; } }
          }
          if (li < 0 || idx < 0) return;
          const cEl = els[li].querySelector(".c");
          const r = document.createRange(); let acc = 0, sN = null, sO = 0, eN = null, eO = 0;
          const tw = document.createTreeWalker(cEl, NodeFilter.SHOW_TEXT);
          let nd; while ((nd = tw.nextNode())) { const L = nd.length; if (sN == null && idx < acc + L) { sN = nd; sO = idx - acc; } if (sN != null && idx + sub.length <= acc + L) { eN = nd; eO = idx + sub.length - acc; break; } acc += L; }
          if (!sN || !eN) return;
          r.setStart(sN, sO); r.setEnd(eN, eO);
          const rr = r.getBoundingClientRect();
          res.push({ x: (rr.left - wr.left) / k - 7, y: li * lh + 22 - 2, w: rr.width / k + 14, h: lh + 4 });
        });
        markCache[si] = res; return res;
      }
      let lastTermKey = "";
      return t => {
        // entrance
        const pe = K(t, 0.05, 1.2, E.o5);
        S(win, { p: 1, o: pe, y: (1 - pe) * 140, rx: (1 - pe) * 22, s: 0.94 + 0.06 * pe });
        const pr = K(t, 0.35, 1.0, E.o5);
        S(pc, { o: pr, x: (1 - pr) * 80 });
        if (vc) { const q = K(t, 0.5, 1.0, E.o5); S(vc, { o: q, x: (1 - q) * 80 }); }
        if (tc) { const q = K(t, 0.65, 1.0, E.o5); S(tc, { o: q, x: (1 - q) * 80 }); }
        if (!fitted && t > 0.2) fit();
        // which step
        let si = -1; for (let i = 0; i < steps.length; i++) if (t >= steps[i].a) si = i;
        const st = si >= 0 ? steps[si] : null, pv = si > 0 ? steps[si - 1] : null;
        const u = st ? t - st.a : 0, k = st ? E.io3(clamp(u / 0.55)) : 0;
        // versions
        const curV = st ? st.ver : 0, prevV = pv ? pv.ver : 0;
        verEls.forEach((V, vi) => {
          let op = vi === curV ? (curV !== prevV ? k : 1) : (vi === prevV && curV !== prevV ? 1 - k : 0);
          S(V.ve, { o: op });
          if (op <= 0) return;
          V.lineEls.forEach((ln, i) => {
            let base;
            if (t < T0) { const q = K(t, 0.45 + i * Math.min(0.045, 1.3 / maxN), 0.55, E.o5); base = q; S(ln, { o: q, x: (1 - q) * -26 }); return; }
            const a = pv && pv.ver === vi ? opFor(pv, i) : (si <= 0 ? 1 : opFor(pv, i)), b = st ? opFor(st, i) : 1;
            base = si < 0 ? 1 : lerp(si === 0 ? 1 : a, b, k);
            S(ln, { o: base });
            // diff flash on version change
            if (st && curV !== prevV && vi === curV) {
              const changed = vlines[prevV][i] !== vlines[curV][i];
              const f = changed ? clamp(1 - (u - 0.3) / 1.6) * clamp(u / 0.3) : 0;
              const bg = f > 0.01 ? `rgba(48,209,88,${(0.28 * f).toFixed(3)})` : "";
              if (ln._bg !== bg) { ln.style.background = bg; ln._bg = bg; }
            } else if (ln._bg) { ln.style.background = ""; ln._bg = ""; }
          });
        });
        // bands
        const rA = pv && pv.ranges ? pv.ranges : null, rB = st && st.ranges ? st.ranges : null;
        bands.forEach((bd, j) => {
          const A = rA && rA[j], B = rB && rB[j];
          if (!B && !A) { S(bd, { o: 0 }); return; }
          const top = r => 22 + (r[0] - 1) * lh - 3, hh = r => (r[1] - r[0] + 1) * lh + 6;
          let y, hgt, op;
          if (A && B) { y = lerp(top(A), top(B), k); hgt = lerp(hh(A), hh(B), k); op = 1; }
          else if (B) { y = top(B); hgt = hh(B); op = k; }
          else { y = top(A); hgt = hh(A); op = 1 - k; }
          bd.style.top = y.toFixed(1) + "px"; bd.style.height = hgt.toFixed(1) + "px"; S(bd, { o: op });
        });
        // scroll
        const sy = lerp(scrollFor(pv), scrollFor(st), si <= 0 ? (si === 0 ? k : 0) : k);
        S(wrap, { y: oy - sy });
        // marks
        const mk = st && st.marks.length && u > 0.35 ? measure(si) : [];
        markEls.forEach((me, j) => {
          const m = mk[j];
          if (!m) { S(me, { o: 0 }); return; }
          const q = K(u, 0.45 + j * 0.15, 0.5, E.ob);
          css(me, { left: m.x, top: m.y, width: m.w, height: m.h });
          S(me, { o: clamp((u - 0.45 - j * 0.15) * 3) * (0.75 + 0.25 * Math.sin(u * 4)), s: 1.3 - 0.3 * q });
        });
        // panel
        const pi = st ? st.panel : 0, ppi = pv ? pv.panel : (si === 0 ? 0 : 0);
        const pu = st ? u : t - T0;
        pEls.forEach((e, i) => {
          if (t < T0) { S(e, { o: i === 0 ? K(t, 0.9, 0.8, E.o5) : 0, y: i === 0 ? (1 - K(t, 0.9, 0.8, E.o5)) * 24 : 0 }); return; }
          if (i === pi) { const q = pi !== ppi || si === 0 && pi !== 0 ? K(pu, 0.08, 0.6, E.o5) : 1; S(e, { o: q, y: (1 - q) * 34, b: (1 - q) * 6 }); }
          else if (i === ppi && pi !== ppi) { const q = K(pu, 0, 0.35, E.io3); S(e, { o: 1 - q, y: -q * 28 }); }
          else S(e, { o: 0 });
        });
        // vars
        if (hasVars) names.forEach(n => {
          const ve = vEls[n]; const has = st && st.vars[n] != null;
          const first = steps.findIndex(s2 => s2.vars[n] != null);
          if (!has) { S(ve.e, { o: 0 }); return; }
          const ua = t - steps[first].a;
          const pin = K(ua, 0.15, 0.55, E.ob);
          const ch2 = st.changed.includes(n) ? clamp(1 - (u - 0.15) / 0.9) * (u > 0.15 ? 1 : 0) : 0;
          S(ve.e, { o: clamp(ua * 3), s: (0.7 + 0.3 * pin) * (1 + 0.1 * ch2) });
          txt(ve.v, String(u > 0.15 || !pv || pv.vars[n] == null ? st.vars[n] : pv.vars[n]));
          const col = ch2 > 0.02 ? `color-mix(in srgb, ${C.acc} ${(ch2 * 100).toFixed(0)}%, #fff)` : "#fff";
          if (ve.v._col !== col) { ve.v.style.color = col; ve.v._col = col; }
          const bc = ch2 > 0.02 ? `color-mix(in srgb, ${C.acc} ${(ch2 * 100).toFixed(0)}%, rgba(255,255,255,.1))` : "rgba(255,255,255,.1)";
          if (ve.e._bc !== bc) { ve.e.style.borderColor = bc; ve.e._bc = bc; }
        });
        // terminal
        if (hasOut) {
          let full, nVis;
          if (!st) { full = []; nVis = 0; }
          else {
            const base = tparse(st.base), all = tparse(st.buf);
            const typed = Math.floor(Math.max(0, u - 0.35) * 34);
            full = all; nVis = Math.min(all.length, base.length + typed);
          }
          const blink = Math.floor(t * 2.2) % 2 === 0;
          const key = nVis + "|" + blink + "|" + (st ? si : -1);
          if (key !== lastTermKey) {
            lastTermKey = key;
            let s = "", inp = false;
            for (let i = 0; i < nVis; i++) { const [c, ip] = full[i]; if (ip !== inp) { s += ip ? '<span class="in">' : "</span>"; inp = ip; } s += esc(c); }
            if (inp) s += "</span>";
            let ls = s.split("\n");
            if (ls.length > rowsT) ls = ls.slice(ls.length - rowsT);
            term.innerHTML = ls.join("\n") + (blink ? '<span class="cur"></span>' : '<span class="cur" style="opacity:0"></span>');
          }
        }
      };
    },
  });
}

/* ---------- runtime ---------- */
const STAGE = { el: null, scenes: null, cur: -1 };
function chColor(i) { return CH[SC[i].ch] || CH[0]; }
function hex2rgb(hx) { const n = parseInt(hx.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mixc(a, b, t) { return a.map((v, i) => Math.round(lerp(v, b[i], t))); }
let bgCtx = null;
function drawBg(T, i, t) {
  if (!bgCtx) bgCtx = document.getElementById("bg").getContext("2d");
  const c = bgCtx;
  // chapter color with crossfade from previous scene's chapter
  let A = hex2rgb(chColor(i).acc), B = hex2rgb(chColor(i).acc2 || chColor(i).acc);
  if (i > 0 && SC[i - 1].ch !== SC[i].ch) { const q = E.io3(clamp(t / 2)); A = mixc(hex2rgb(chColor(i - 1).acc), A, q); B = mixc(hex2rgb(chColor(i - 1).acc2 || chColor(i - 1).acc), B, q); }
  c.globalCompositeOperation = "source-over";
  c.fillStyle = "#030305"; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = "lighter";
  const blobs = [
    [960 + 620 * Math.sin(T * 0.071), 360 + 220 * Math.cos(T * 0.053), 980, A, 0.20],
    [400 + 300 * Math.cos(T * 0.043 + 1), 900 + 140 * Math.sin(T * 0.061), 820, B, 0.13],
    [1600 + 200 * Math.sin(T * 0.05 + 2), 820 + 200 * Math.cos(T * 0.037), 760, A, 0.10],
  ];
  for (const [x, y, r, col, a] of blobs) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${a})`);
    g.addColorStop(0.55, `rgba(${col[0]},${col[1]},${col[2]},${a * 0.32})`);
    g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  c.globalCompositeOperation = "source-over";
}
function findScene(T) { let lo = 0, hi = SC.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SC[m].start <= T) lo = m; else hi = m - 1; } return lo; }
function chapterSpans() {
  const out = []; SC.forEach((s, i) => { if (!out.length || out[out.length - 1].ch !== s.ch || (s.ch === 0 && i > 0 && SC[i - 1].ch !== 0)) out.push({ ch: s.ch, start: s.start, end: s.start + s.dur, first: i }); else out[out.length - 1].end = s.start + s.dur; });
  return out;
}
let SPANS = null;
function render(T) {
  if (!STAGE.el) { STAGE.el = document.getElementById("stage"); STAGE.scenes = document.getElementById("scenes"); STAGE.cap = document.getElementById("cap"); STAGE.hudCh = document.getElementById("hudCh"); STAGE.hudR = document.getElementById("hudR"); STAGE.hud = document.getElementById("hud"); STAGE.prog = document.querySelector("#prog i"); SPANS = chapterSpans(); }
  T = clamp(T, 0, TOTAL - 0.001);
  const i = findScene(T), sc = SC[i], t = T - sc.start;
  if (i !== STAGE.cur) {
    if (STAGE.cur >= 0 && SC[STAGE.cur].root) SC[STAGE.cur].root.style.display = "none";
    if (!sc.root) {
      sc.root = h(STAGE.scenes, "scene");
      const C = CH[sc.ch] || CH[0];
      sc.root.style.setProperty("--acc", C.acc); sc.root.style.setProperty("--acc2", C.acc2 || C.acc);
      sc.upd = sc.build(sc.root, sc) || (() => {});
    }
    sc.root.style.display = "block"; STAGE.cur = i;
    const C = CH[sc.ch] || CH[0];
    STAGE.el.style.setProperty("--acc", C.acc);
    htm(STAGE.hudCh, sc.ch ? "<b>CHAPTER " + C.no + "</b> " + esc(C.title) : "<b>C</b> 프로그래밍 기초");
    txt(STAGE.hudR, sc.name || "");
  }
  const fi = sc.fadeIn === false ? 1 : K(t, 0, 0.6, E.o3), fo = sc.fadeOut === false ? 0 : K(t, sc.dur - 0.55, 0.55, E.io3);
  S(sc.root, { o: fi * (1 - fo), s: (1.03 - 0.03 * fi) * (1 - 0.03 * fo), b: (1 - fi) * 8 + fo * 6 });
  sc.upd(t);
  drawBg(T, i, t);
  // hud
  const hv = sc.hud === false ? 0 : 1;
  const prevH = i > 0 && SC[i - 1].hud !== false ? 1 : 0;
  const hk = sc.hud === false ? 1 - K(t, 0, 0.4) * (1 - prevH) - (prevH ? K(t, 0, 0.4) : 0) : (prevH ? 1 : K(t, 0.2, 0.6));
  S(STAGE.hud, { o: sc.hud === false ? (prevH ? 1 - K(t, 0, 0.4) : 0) : hk });
  const sp = SPANS.find(s => T >= s.start && T < s.end) || SPANS[0];
  STAGE.prog.style.width = (((T - sp.start) / (sp.end - sp.start)) * 100).toFixed(2) + "%";
  // captions
  const caps = sc.caps || [];
  let cs = null; for (const c of caps) if (t >= c[0] && t < c[1]) cs = c;
  if (cs) {
    const q = K(t, cs[0], 0.35, E.o3) * (1 - K(t, cs[1] - 0.3, 0.3, E.lin));
    htm(STAGE.cap, md(cs[2]));
    S(STAGE.cap, { o: q * fi * (1 - fo), y: (1 - q) * 14 });
    STAGE.cap._c = 0;
  } else S(STAGE.cap, { o: 0 });
}
window.MOTION = { SC, get TOTAL() { return TOTAL; }, render, CH, chapterSpans };
