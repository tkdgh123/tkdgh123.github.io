// 방 주고받기 — 파이어베이스(changupsil-games, 칸 이름 bgroom) 또는 이 브라우저 안(혼자 하기, 시험용)
// 방 문서는 방장만 쓰고, 다른 사람은 act 칸에 "하고 싶은 것"만 넣는다. 방장 폰이 규칙대로 처리한다.

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";

export async function fireNet() {
  const { initializeApp } = await import(FB + "firebase-app.js");
  const F = await import(FB + "firebase-firestore.js");
  const app = initializeApp({
    apiKey: "AIzaSyDV8DhPAFyWoOHUanZ6RLLWuvZZzWB2hjg",
    authDomain: "changupsil-games.firebaseapp.com",
    projectId: "changupsil-games",
    appId: "1:888585396327:web:c53163e6006370c258f4c2"
  }, "bg");
  const db = F.getFirestore(app);
  if (location.hostname === "127.0.0.1" && location.search.includes("emu")) F.connectFirestoreEmulator(db, "127.0.0.1", 8080);
  const room = c => F.doc(db, "bgroom", c);
  return {
    kind: "fire",
    async exists(c) { return (await F.getDoc(room(c))).exists(); },
    async write(c, data) { await F.setDoc(room(c), { ...data, at: F.serverTimestamp() }); },
    watch(c, cb, err) { return F.onSnapshot(room(c), s => cb(s.exists() ? s.data() : null), err); },
    async send(c, act) { await F.addDoc(F.collection(db, "bgroom", c, "act"), { ...act, t: Date.now() }); },
    acts(c, cb) {
      return F.onSnapshot(F.collection(db, "bgroom", c, "act"), s => {
        for (const ch of s.docChanges()) if (ch.type === "added") { cb(ch.doc.data()); F.deleteDoc(ch.doc.ref).catch(() => {}); }
      });
    }
  };
}

// 이 브라우저 안: localStorage + BroadcastChannel (탭 여러 개로 여러 사람 흉내도 됨)
export function localNet() {
  const bc = new BroadcastChannel("bg-local");
  const rooms = new Map(), actL = new Map();
  const key = c => "bgl:" + c;
  const fire = (m, c, x) => (m.get(c) || []).forEach(f => f(x));
  bc.onmessage = e => {
    const { k, c, x } = e.data;
    if (k === "room") fire(rooms, c, x); else fire(actL, c, x);
  };
  const on = (m, c, f) => { if (!m.has(c)) m.set(c, []); m.get(c).push(f); return () => m.set(c, m.get(c).filter(g => g !== f)); };
  return {
    kind: "local",
    async exists(c) { return localStorage.getItem(key(c)) != null; },
    async write(c, data) {
      const x = JSON.parse(JSON.stringify({ ...data, at: Date.now() }));
      try { localStorage.setItem(key(c), JSON.stringify(x)); } catch {}
      bc.postMessage({ k: "room", c, x });
      setTimeout(() => fire(rooms, c, x));
    },
    watch(c, cb) {
      const off = on(rooms, c, cb);
      const s = localStorage.getItem(key(c));
      setTimeout(() => cb(s ? JSON.parse(s) : null));
      return off;
    },
    async send(c, act) {
      const x = { ...act, t: Date.now() };
      bc.postMessage({ k: "act", c, x });
      setTimeout(() => fire(actL, c, x));
    },
    acts(c, cb) { return on(actL, c, cb); }
  };
}
