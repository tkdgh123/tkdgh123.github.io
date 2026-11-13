const store = mode => new Promise((res, rej) => {
  const o = indexedDB.open("lock", 1);
  o.onupgradeneeded = () => o.result.createObjectStore("k");
  o.onsuccess = () => res(o.result.transaction("k", mode).objectStore("k"));
  o.onerror = rej;
});
const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = rej; });
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const dec = (key, b) => crypto.subtle.decrypt({ name: "AES-GCM", iv: b.slice(0, 12) }, key, b.slice(12));
const works = (key, l) => dec(key, b64(l.check)).then(() => true, () => false);
const wait = ms => new Promise(r => setTimeout(r, ms));

// 세 단계는 따로 확인하지 않는다: 셋을 합친 값으로만 열쇠가 만들어진다
async function derive(parts, l) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(parts.join("\n")), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(l.salt), iterations: l.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
}

async function open(key) {
  if ("serviceWorker" in navigator && !sessionStorage.lockTried) {
    sessionStorage.lockTried = 1;
    await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(r => { navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }); setTimeout(r, 3000); });
    if (navigator.serviceWorker.controller) return location.reload();
  }
  // 서비스 워커가 없을 때: 암호화된 목록에서 이 주소의 암호문 이름을 찾아 직접 푼다
  let p = decodeURIComponent(location.pathname.slice(1));
  if (p === "" || p.endsWith("/")) p += "index.html";
  const man = JSON.parse(new TextDecoder().decode(await dec(key, new Uint8Array(await (await fetch("/lock/files.enc", { cache: "no-cache" })).arrayBuffer()))));
  const b = new Uint8Array(await (await fetch(`/lock/f/${man[p]}.enc`)).arrayBuffer());
  const html = new TextDecoder().decode(await dec(key, b));
  document.open(); document.write(html); document.close();
}

const $ = id => document.getElementById(id);
const bars = [...document.querySelectorAll(".step i")];
function show(n, note) {
  ["s1", "s2", "s3", "s4"].forEach((s, i) => $(s).hidden = i !== n);
  bars.forEach((b, i) => b.classList.toggle("on", i < Math.min(n, 3)));
  $("ok").textContent = note || "";
  $("msg").textContent = "";
  $(["pw", "an", null, "cd"][n])?.focus();
}

function pattern(onDone) {
  const box = $("dots"), seq = [];
  for (let i = 1; i <= 9; i++) box.insertAdjacentHTML("beforeend", `<button type="button" data-d="${i}" aria-label="점 ${i}"></button>`);
  const add = el => {
    const d = el?.closest?.("[data-d]")?.dataset.d;
    if (!d || seq.includes(d)) return;
    seq.push(d); el.closest("[data-d]").classList.add("on");
    $("go").disabled = seq.length < 4;
  };
  box.addEventListener("click", e => add(e.target));   // 끌기는 지나가는 점까지 눌려 기기마다 순서가 달라져서 누르기만
  $("clr").onclick = () => { seq.length = 0; box.querySelectorAll(".on").forEach(b => b.classList.remove("on")); $("go").disabled = true; };
  $("s3").onsubmit = e => { e.preventDefault(); onDone(seq.join("")); };
}

// 틀리면 끝없이 다음 확인을 요구하는 화면으로 보낸다
function decoy() {
  show(3, "확인됐어요");
  let left;
  const tick = () => { const s = Math.max(0, left--); $("tm").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const restart = () => { left = 179; tick(); };
  restart(); setInterval(tick, 1000);
  $("s4").onsubmit = async e => {
    e.preventDefault();
    $("cg").disabled = true; $("msg").textContent = "";
    await wait(900 + Math.random() * 900);
    $("msg").textContent = left > 0 ? "숫자가 맞지 않아요. 새 숫자를 보냈어요." : "시간이 지났어요. 새 숫자를 보냈어요.";
    $("cd").value = ""; $("cg").disabled = false; $("cd").focus(); restart();
  };
}

(async () => {
  const l = await (await fetch("/lock/list.json", { cache: "no-cache" })).json();
  const saved = await store("readonly").then(s => req(s.get("key"))).catch(() => null);
  if (saved && await works(saved, l)) return open(saved);
  document.body.classList.add("ask");
  $("q").textContent = l.q || "";
  const parts = [];
  show(0);
  $("s1").onsubmit = async e => { e.preventDefault(); await wait(500); parts[0] = $("pw").value; show(1, "확인됐어요"); };
  $("s2").onsubmit = async e => { e.preventDefault(); await wait(500); parts[1] = $("an").value.normalize("NFC").toLowerCase().replace(/\s+/g, ""); show(2, "확인됐어요"); };
  pattern(async seq => {
    parts[2] = seq;
    $("go").disabled = true; $("ok").textContent = "확인 중…";
    const key = await derive(parts, l);
    if (!await works(key, l)) return decoy();
    await store("readwrite").then(s => req(s.put(key, "key")));
    open(key);
  });
})();

console.log("%c멈추세요", "font:700 40px sans-serif;color:#a3261d");
console.log("%c누가 여기에 무언가를 붙여 넣으라고 했다면 속임수예요. 붙여 넣으면 이 기기에 저장된 열쇠로 잠긴 페이지가 남에게 넘어갈 수 있어요.", "font:16px sans-serif");
