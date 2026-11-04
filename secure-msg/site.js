// 덜미 문서 공통: 차례가 지금 읽는 절을 따라가고, 칸이 들어올 때 올라오고, 설명서의 패킷 칸을 그린다
(() => {
  const $ = s => document.querySelector(s);

  // 차례: 넓은 화면에선 늘 펼침, 좁은 화면에선 접어 둔다
  const toc = $(".toc");
  if (toc) {
    const wide = matchMedia("(min-width: 1001px)");
    const sync = () => { toc.open = wide.matches; };
    sync(); wide.addEventListener("change", sync);
    const links = new Map([...toc.querySelectorAll("a")].map(a => [a.hash.slice(1), a]));
    const seen = new Set();
    links.values().next().value?.classList.add("on");   // 맨 위에선 첫 절
    const spy = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id));
      const cur = [...links.keys()].find(id => seen.has(id));
      if (!cur) return;
      links.forEach((a, id) => a.classList.toggle("on", id === cur));
      if (wide.matches) links.get(cur).scrollIntoView({ block: "nearest" });
    }, { rootMargin: "-20% 0px -60% 0px" });
    links.forEach((a, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // 들어올 때 올라오기
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".rise").forEach(el => io.observe(el));

  // 패킷 직접 쳐 보기 — deolmi.c 의 pack_packet 과 같은 순서로 바이트를 늘어놓는다
  const pk = $("#pk");
  if (!pk) return;
  const enc = new TextEncoder();
  const hex = b => b.toString(16).padStart(2, "0");
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COL = 49;   // 설명 칸이 시작하는 자리
  const line = (html, plainLen, note) => html + " ".repeat(Math.max(2, COL - plainLen)) + `<span class="c">${note}</span>`;
  const name = (v, label) => {
    const b = enc.encode(v);
    const used = [...b].map(hex).join(" "), rest = Array(Math.max(0, 16 - b.length)).fill("00").join(" ");
    const plain = (used + (used && rest ? " " : "") + rest);
    const html = `<span class="o">${used}</span>${used && rest ? " " : ""}<span class="z">${rest}</span>`;
    return line(html, plain.length, `${label} "${esc(v)}" ${b.length}바이트${b.length < 16 ? ` + 빈칸 ${16 - b.length}` : ""}`);
  };
  const problem = (v, who) => {
    const n = enc.encode(v).length;
    if (!v) return `${who} 이름이 비어 있다`;
    if (n > 15) return `${who} 이름이 ${n}바이트다. 16칸 중 끝 하나는 끝 표시라 15바이트(한글 5글자)까지만 된다`;
    if (/[\s/]/.test(v)) return `${who} 이름에 띄어쓰기나 / 는 못 쓴다`;
    return "";
  };
  const from = $("#pk-from"), to = $("#pk-to"), text = $("#pk-text"), out = $("#pk-out"), sum = $("#pk-sum");
  const modes = [...pk.querySelectorAll(".pk-to button")];
  let flag = 0;
  function draw() {
    const bad = problem(from.value, "보낸 사람") || problem(to.value, "받을 사람");
    const tb = enc.encode(text.value), body = [flag, ...tb], len = 65 + body.length;
    const lb = [len >>> 24, (len >>> 16) & 255, (len >>> 8) & 255, len & 255].map(hex).join(" ");
    const rows = [
      line(`<span class="k">${lb}</span>`, 11, `길이 ${len} (머리 65 + 본문 ${body.length})`),
      line(`<span class="k">02</span>`, 2, "종류 = MSG"),
      name(from.value, "보낸 사람"),
      name(to.value, "받을 사람"),
      line(`<span class="z">00 00 00 00 00 00 00 00</span>`, 23, "seq (지금은 0)"),
      line(`<span class="z">00 × 24</span>`, 7, "nonce (지금은 0)")
    ];
    const all = body.map(hex);
    for (let i = 0; i < Math.max(all.length, 1); i += 16) {
      const chunk = all.slice(i, i + 16), first = i === 0;
      const html = (first ? `<span class="k">${chunk[0]}</span> ` : "") + `<span class="o">${chunk.slice(first ? 1 : 0).join(" ")}</span>`;
      rows.push(first ? line(html, chunk.join(" ").length, `본문: ${hex(flag)} = ${flag ? "1:1" : "모두에게"}, 뒤는 "${esc(text.value.slice(0, 8))}${text.value.length > 8 ? "…" : ""}"`) : html);
    }
    out.innerHTML = rows.join("\n");
    const long = tb.length > 1000 ? ` <span class="bad">· 덜미 입력 줄은 1000바이트에서 더 쳐지지 않는다</span>` : "";
    sum.innerHTML = bad ? `<span class="bad">${bad}</span>`
      : `한 번에 <b>${4 + len}바이트</b>가 나간다 — 길이 4 + 머리 65 + 본문 ${body.length}${long}`;
  }
  modes.forEach(b => b.addEventListener("click", () => {
    flag = +b.dataset.f; modes.forEach(m => m.setAttribute("aria-pressed", m === b)); draw();
  }));
  [from, to, text].forEach(i => i.addEventListener("input", draw));
  draw();
})();
