/* vsedit — textarea를 Visual Studio처럼: 색 입히기, 줄 번호, 괄호 자동 완성·짝 표시,
   자동 들여쓰기, IntelliSense 목록, 코드 조각(for/if… + Tab), 주석·줄 이동 단축키 */
(function (G) {
"use strict";
const PAIR = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
const CLOSE = { ")": "(", "]": "[", "}": "{" };
const IND = "    ";
const SNIP = {
  for: "for (int i = 0; i < ⟪length⟫; i++)\n{\n    \n}",
  while: "while (⟪⟫)\n{\n    \n}",
  if: "if (⟪⟫)\n{\n    \n}",
  else: "else\n{\n    ⟪⟫\n}",
  do: "do\n{\n    ⟪⟫\n} while ();",
  switch: "switch (⟪⟫)\n{\ncase 0:\n    break;\ndefault:\n    break;\n}",
  main: "int main(void)\n{\n    ⟪⟫\n    return 0;\n}",
};
const WORDS = ("auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while " +
  "printf scanf main include define stdio stdlib math time rand srand sqrt pow round tan sin cos abs getchar putchar NULL").split(" ");
const esc = s => s.replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));

function VSEdit(ta, o) {
  o = o || {};
  const hl = o.highlight || esc;
  // ---- DOM: [gutter][wrap: overlay + textarea] + popup
  const body = document.createElement("div"); body.className = "vs-body";
  ta.parentNode.insertBefore(body, ta);
  const gut = document.createElement("div"); gut.className = "vs-gut"; gut.setAttribute("aria-hidden", "true");
  const wrap = document.createElement("div"); wrap.className = "vs-wrap";
  const ov = document.createElement("pre"); ov.className = "vs-ov"; ov.setAttribute("aria-hidden", "true");
  const pop = document.createElement("ul"); pop.className = "vs-pop"; pop.hidden = true; pop.setAttribute("role", "listbox");
  body.appendChild(gut); body.appendChild(wrap); wrap.appendChild(ov); wrap.appendChild(ta); body.appendChild(pop);
  ta.classList.add("vs-ta");
  const cs = getComputedStyle(ta);
  ["fontFamily", "fontSize", "lineHeight", "paddingTop", "paddingLeft", "paddingRight", "paddingBottom", "tabSize", "letterSpacing"].forEach(k => ov.style[k] = cs[k]);
  ["fontFamily", "fontSize", "lineHeight"].forEach(k => gut.style[k] = cs[k]);
  const LH = parseFloat(cs.lineHeight) || 24, PT = parseFloat(cs.paddingTop), PL = parseFloat(cs.paddingLeft);
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
  const tw = s => ctx.measureText(s.replace(/\t/g, IND)).width;

  // ---- helpers
  const V = () => ta.value;
  const lineStart = p => V().lastIndexOf("\n", p - 1) + 1;
  const lineEnd = p => { const i = V().indexOf("\n", p); return i < 0 ? V().length : i; };
  const indentOf = s => (/^[ \t]*/.exec(s) || [""])[0];
  function put(a, b, text, s1, s2) { // 범위를 바꾸고 커서 이동 (실행 취소 가능하게)
    ta.focus(); ta.setSelectionRange(a, b);
    let ok = false; try { ok = document.execCommand("insertText", false, text); } catch (e) {}
    if (!ok || V().slice(a, a + text.length) !== text) ta.setRangeText(text, a, b, "end");
    const c = s1 == null ? a + text.length : s1; ta.setSelectionRange(c, s2 == null ? c : s2);
    render();
  }
  function selLines() { // 선택된 줄 범위 [시작, 끝)
    const s = ta.selectionStart, e = ta.selectionEnd;
    const a = lineStart(s), b = lineEnd(e > s && V()[e - 1] === "\n" ? e - 1 : e);
    return [a, b];
  }
  function editLines(fn) { // 선택 줄마다 fn(line) 적용, 선택 유지
    const [a, b] = selLines(); const old = V().slice(a, b).split("\n"); const nw = old.map(fn);
    const txt = nw.join("\n"); put(a, b, txt, a, a + txt.length);
    if (old.length === 1) { const d = nw[0].length - old[0].length; const c = Math.max(a, sel0 + d); ta.setSelectionRange(c, c); }
  }
  let sel0 = 0;

  // ---- render: 색 입히기 + 현재 줄 + 괄호 짝
  function matchBracket() {
    const v = V(), p = ta.selectionStart; if (p !== ta.selectionEnd) return null;
    let i = -1;
    if ("([{".includes(v[p]) || ")]}".includes(v[p])) i = p; else if ("([{)]}".includes(v[p - 1])) i = p - 1;
    if (i < 0) return null;
    const c = v[i], open = "([{".includes(c), want = open ? PAIR[c] : CLOSE[c];
    let d = 0;
    for (let j = i; open ? j < v.length : j >= 0; j += open ? 1 : -1) { if (v[j] === c) d++; else if (v[j] === want && --d === 0) return [i, j]; }
    return [i, -1];
  }
  function box(pos, cls) {
    const v = V(), ls = lineStart(pos), ln = v.slice(0, ls).split("\n").length - 1;
    return '<span class="' + cls + '" style="left:' + (PL + tw(v.slice(ls, pos))).toFixed(1) + "px;top:" + (PT + ln * LH) + "px;width:" + Math.max(6, tw(v[pos] || " ")).toFixed(1) + "px;height:" + LH + 'px"></span>';
  }
  let lastV = null, lastN = 0;
  function render() {
    const v = V(), lines = v.split("\n"), cur = v.slice(0, ta.selectionStart).split("\n").length - 1;
    if (v !== lastV) {
      lastV = v;
      const h = []; let open = []; // 여러 줄 주석 등 줄을 넘는 span을 줄마다 다시 열고 닫는다
      hl(v).split("\n").forEach(x => { const pre = open.map(c => '<span class="' + c + '">').join(""); x.replace(/<span class="([\w-]+)">|<\/span>/g, (m, c) => { if (c) open.push(c); else open.pop(); return m; }); h.push(pre + x + "</span>".repeat(open.length)); });
      ov._lines = h.map(x => '<div class="vs-l">' + (x || " ") + "</div>").join("");
      if (lines.length !== lastN) { lastN = lines.length; gut.textContent = lines.map((_, i) => i + 1).join("\n"); }
    }
    let marks = '<span class="vs-cur" style="top:' + (PT + cur * LH) + "px;height:" + LH + 'px"></span>';
    const m = matchBracket();
    if (m) marks += box(m[0], m[1] < 0 ? "vs-br bad" : "vs-br") + (m[1] >= 0 ? box(m[1], "vs-br") : "");
    ov.innerHTML = marks + ov._lines;
    sync();
  }
  function sync() {
    ov.style.transform = "translate(" + -ta.scrollLeft + "px," + -ta.scrollTop + "px)";
    gut.scrollTop = ta.scrollTop; gut.style.paddingTop = PT + "px";
  }

  // ---- IntelliSense
  let items = [], sel = 0;
  function wordBefore() { const v = V(), p = ta.selectionStart; let i = p; while (i > 0 && /\w/.test(v[i - 1])) i--; return [i, v.slice(i, p)]; }
  function inStrOrComment() { const v = V(), ls = lineStart(ta.selectionStart), s = v.slice(ls, ta.selectionStart); if (s.includes("//") || /^\s*#/.test(s)) return true; return ((s.match(/(?<!\\)"/g) || []).length % 2) === 1; }
  function suggest() {
    const [a, w] = wordBefore();
    if (w.length < 2 || /^\d/.test(w) || ta.selectionStart !== ta.selectionEnd || inStrOrComment() || /\w/.test(V()[ta.selectionStart] || "")) return hide();
    const ids = new Set(WORDS); (V().match(/[A-Za-z_]\w+/g) || []).forEach(x => ids.add(x));
    items = [...ids].filter(x => x !== w && x.toLowerCase().startsWith(w.toLowerCase())).sort((x, y) => x.length - y.length || x.localeCompare(y)).slice(0, 8);
    if (!items.length) return hide();
    sel = 0;
    pop.innerHTML = items.map((x, i) => '<li role="option"' + (i === sel ? ' aria-selected="true"' : "") + ' data-i="' + i + '"><i>' + (SNIP[x] ? "⧉" : WORDS.includes(x) ? "K" : "x") + "</i><span><b>" + esc(x.slice(0, w.length)) + "</b>" + esc(x.slice(w.length)) + "</span></li>").join("");
    const v = V(), ls = lineStart(a), ln = v.slice(0, ls).split("\n").length - 1;
    pop.style.left = (gut.offsetWidth + Math.min(wrap.clientWidth - 210, Math.max(0, PL + tw(v.slice(ls, a)) - ta.scrollLeft))) + "px";
    pop.style.top = (PT + (ln + 1) * LH - ta.scrollTop + 2) + "px";
    pop.hidden = false;
  }
  function hide() { pop.hidden = true; items = []; }
  function choose(i) { const [a, w] = wordBefore(); const x = items[i]; hide(); if (x) put(a, ta.selectionStart, x); }
  function mark(i) { sel = (i + items.length) % items.length; [...pop.children].forEach((li, k) => li.setAttribute("aria-selected", k === sel ? "true" : "false")); }
  pop.addEventListener("mousedown", e => { const li = e.target.closest("li"); if (li) { e.preventDefault(); choose(+li.dataset.i); } });

  // ---- keys
  let chord = false;
  ta.addEventListener("keydown", e => {
    if (e.isComposing || e.keyCode === 229) return;
    const v = V(), s = ta.selectionStart, t = ta.selectionEnd, prev = v[s - 1], next = v[s];
    const ctrl = e.ctrlKey || e.metaKey;
    sel0 = s;
    // IntelliSense 목록
    if (!pop.hidden) {
      if (e.key === "ArrowDown") { e.preventDefault(); return mark(sel + 1); }
      if (e.key === "ArrowUp") { e.preventDefault(); return mark(sel - 1); }
      if (e.key === "Escape") { e.preventDefault(); return hide(); }
      if ((e.key === "Tab" || e.key === "Enter") && !ctrl && !e.shiftKey) { e.preventDefault(); return choose(sel); }
    }
    if (chord) { chord = false; if (ctrl && (e.key === "c" || e.key === "C")) { e.preventDefault(); return comment(true); } if (ctrl && (e.key === "u" || e.key === "U")) { e.preventDefault(); return comment(false); } }
    if (ctrl && e.key === "Enter") { e.preventDefault(); hide(); return o.onSubmit && o.onSubmit(); }
    if (e.key === "F5") { e.preventDefault(); return o.onRun && o.onRun(); }
    if (ctrl && (e.key === "k" || e.key === "K")) { e.preventDefault(); chord = true; return; }
    if (ctrl && e.key === "/") { e.preventDefault(); return comment(null); }
    if (ctrl && (e.key === "d" || e.key === "D") && !e.shiftKey) { e.preventDefault(); const a = lineStart(s), b = lineEnd(s), ln = v.slice(a, b); return put(b, b, "\n" + ln, s + ln.length + 1); }
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); return moveLines(e.key === "ArrowUp" ? -1 : 1); }
    if (ctrl && (e.key === "x" || e.key === "c") && s === t) { // 선택 없으면 줄 전체
      const a = lineStart(s), b = Math.min(v.length, lineEnd(s) + 1); ta.setSelectionRange(a, b);
      if (e.key === "c") setTimeout(() => ta.setSelectionRange(s, s), 0); else setTimeout(render, 0);
      return;
    }
    if (ctrl || e.altKey) return;
    if (e.key === "Home" && !e.shiftKey) { const a = lineStart(s), f = a + indentOf(v.slice(a, lineEnd(s))).length; e.preventDefault(); const c = s === f ? a : f; ta.setSelectionRange(c, c); return render(); }
    if (e.key === "Tab") {
      e.preventDefault(); hide();
      if (e.shiftKey) return editLines(l => l.replace(/^( {1,4}|\t)/, ""));
      if (v.slice(s, t).includes("\n")) return editLines(l => l ? IND + l : l);
      const a = lineStart(s), before = v.slice(a, s), m = /^(\s*)(\w+)$/.exec(before);
      if (m && SNIP[m[2]] && (!next || next === "\n")) return snippet(a + m[1].length, m[2], m[1]);
      const col = before.replace(/\t/g, IND).length; return put(s, t, " ".repeat(4 - (col % 4)));
    }
    if (e.key === "Enter") {
      e.preventDefault(); hide();
      const a = lineStart(s), before = v.slice(a, s), ind = indentOf(before), tb = before.trim();
      if (prev === "{" && next === "}") return put(s, t, "\n" + ind + IND + "\n" + ind, s + 1 + ind.length + 4);
      let more = /\{\s*$/.test(tb) || /^(case\b.*|default\s*):$/.test(tb) || /^(if|for|while|else if)\b.*\)$/.test(tb) || /^else$/.test(tb) ? IND : "";
      const rest = v.slice(t, lineEnd(t)); const trimRest = rest.length - rest.trimStart().length;
      return put(s, t + trimRest, "\n" + ind + more);
    }
    if (e.key === "Backspace" && s === t && s > 0) {
      if (PAIR[prev] && PAIR[prev] === next) { e.preventDefault(); return put(s - 1, s + 1, ""); }
      const a = lineStart(s), before = v.slice(a, s);
      if (before.length && /^ +$/.test(before)) { e.preventDefault(); const n = (before.length - 1) % 4 + 1; return put(s - n, s, ""); }
      return;
    }
    const k = e.key;
    if (k.length !== 1) return;
    if (CLOSE[k] && s === t && next === k) { e.preventDefault(); ta.setSelectionRange(s + 1, s + 1); return render(); }
    if (k === "}" && s === t) { const a = lineStart(s), before = v.slice(a, s); if (/^ {4,}$/.test(before)) { e.preventDefault(); return put(s - 4, s, "}"); } }
    if (PAIR[k]) {
      if (s !== t && !v.slice(s, t).includes("\n")) { e.preventDefault(); return put(s, t, k + v.slice(s, t) + PAIR[k], s + 1, t + 1); }
      if ((k === '"' || k === "'") && next === k) { e.preventDefault(); ta.setSelectionRange(s + 1, s + 1); return render(); }
      if ((k === '"' || k === "'") && (/[\w\\]/.test(prev || "") || inStrOrComment())) return;
      if (!next || /[\s)\]};,]/.test(next)) { e.preventDefault(); return put(s, t, k + PAIR[k], s + 1); }
    }
  });
  function snippet(a, w, ind) {
    let txt = SNIP[w].split("\n").map((l, i) => i ? ind + l : l).join("\n");
    const p = txt.indexOf("⟪"), q = txt.indexOf("⟫");
    const selTxt = txt.slice(p + 1, q); txt = txt.replace("⟪", "").replace("⟫", "");
    put(a, ta.selectionStart, txt, a + p, a + p + selTxt.length);
  }
  function comment(on) {
    const [a, b] = selLines(), ls = V().slice(a, b).split("\n");
    if (on == null) on = !ls.filter(l => l.trim()).every(l => /^\s*\/\//.test(l));
    const minInd = Math.min(...ls.filter(l => l.trim()).map(l => indentOf(l).length));
    editLines(l => !l.trim() ? l : on ? l.slice(0, minInd) + "// " + l.slice(minInd) : l.replace(/^(\s*)\/\/ ?/, "$1"));
  }
  function moveLines(d) {
    const v = V(), [a, b] = selLines(), s = ta.selectionStart, t = ta.selectionEnd, blk = v.slice(a, b);
    if (d < 0) { if (a === 0) return; const pa = lineStart(a - 1), pl = v.slice(pa, a - 1); put(pa, b, blk + "\n" + pl, s - pl.length - 1, t - pl.length - 1); }
    else { if (b >= v.length) return; const ne = lineEnd(b + 1), nl = v.slice(b + 1, ne); put(a, ne, nl + "\n" + blk, s + nl.length + 1, t + nl.length + 1); }
  }
  ta.addEventListener("input", () => { render(); suggest(); o.onChange && o.onChange(ta.value); });
  ta.addEventListener("scroll", () => { sync(); if (!pop.hidden) hide(); });
  ["click", "keyup", "select", "focus"].forEach(ev => ta.addEventListener(ev, e => { if (ev === "keyup" && /^(Arrow|Home|End|Page)/.test(e.key) && e.key !== "ArrowUp" && e.key !== "ArrowDown") hide(); if (ev === "click") hide(); render(); }));
  ta.addEventListener("blur", () => setTimeout(hide, 120));
  if ("ResizeObserver" in G) new ResizeObserver(() => { gut.style.height = ta.offsetHeight + "px"; sync(); }).observe(ta);
  render();
  return { render, set(v) { ta.value = v; render(); } };
}
G.VSEdit = VSEdit;
})(window);
