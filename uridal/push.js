// 상대 휴대폰에 알림 보내기 (Web Push: RFC 8291 암호화는 여기서).
// 브라우저는 푸시 서버로 바로 보낼 수 없어서(CORS) 구글 Apps Script 중계기(relay.gs)가 VAPID 서명을 붙여 전달한다.
// 서명 열쇠는 중계기 안에만 있다. 알림 받을 주소는 커플 코드를 아는 사람만 읽는 rooms/{코드}/subs 에만 있다.
export const VAPID = "BDMq8al_nTDahhpVpxCjJEyyU3tlgeTTP6NzmrNMAt3qv744u7s-CwKNgCnr76AYcZw5ZpFLLHABWoPiJfYf7Jc";
const RELAY = "https://script.google.com/macros/s/AKfycbx0f15rb5iaos9MBXl6sBKpGk15-32QYGfYoU6xKpGW43M0k8DJCWlQdsZq-gU8iDNo/exec";

const te = new TextEncoder(), sub = crypto.subtle;
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
export const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
const hkdf = async (salt, ikm, info, n) =>
  new Uint8Array(await sub.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, await sub.importKey("raw", ikm, "HKDF", false, ["deriveBits"]), n * 8));

export async function encrypt(keys, text) {
  const ua = unb64u(keys.p256dh), auth = unb64u(keys.auth);
  const eph = await sub.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const as = new Uint8Array(await sub.exportKey("raw", eph.publicKey));
  const uaKey = await sub.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await sub.deriveBits({ name: "ECDH", public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(auth, secret, cat(te.encode("WebPush: info\0"), ua, as), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await sub.importKey("raw", await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16), "AES-GCM", false, ["encrypt"]);
  const iv = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const ct = new Uint8Array(await sub.encrypt({ name: "AES-GCM", iv }, cek, cat(te.encode(text), [2])));
  return cat(salt, [0, 0, 16, 0], [65], as, ct); // 머리: salt · 레코드 크기 4096 · 키 길이 · 보내는 쪽 공개키
}

/* 받는 쪽 주소 하나에 {title, body} 보내기. 푸시 서버 응답 코드를 돌려준다(404·410 = 사라진 주소) */
export async function sendPush(s, msg) {
  const body = b64(await encrypt(s.keys, JSON.stringify(msg)));
  const r = await fetch(RELAY, { method: "POST", body: JSON.stringify({ endpoint: s.endpoint, body }) });
  return (await r.json()).status;
}
