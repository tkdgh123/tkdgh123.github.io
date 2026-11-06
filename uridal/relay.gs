// 우리달 알림 중계기 (구글 Apps Script 웹 앱, 무료).
// 앱(push.js)이 암호화한 알림에 VAPID 서명(RFC 8292)을 붙여 푸시 서버로 전달한다.
// 서명 열쇠는 처음 불릴 때 여기서 만들어 스크립트 속성에만 둔다 — 사이트·코드 어디에도 없다.
// GET  → 공개키(앱의 applicationServerKey)
// POST {endpoint, body(base64)} → {status: 푸시 서버 응답 코드}
const PUSH_HOST = /^https:\/\/(fcm\.googleapis\.com|[a-z0-9.-]+\.push\.apple\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.notify\.windows\.com)\//;

// P-256 곡선 (ECDSA 서명용, Apps Script엔 내장이 없어서 직접)
// BigInt 글자(1n 같은)는 Apps Script 저장 검사가 못 읽어서 BigInt()로 만든다
const [B0, B1, B2, B3, B255, B256] = [0, 1, 2, 3, 255, 256].map(BigInt);
const P = BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff");
const N = BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
const G = [BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"), BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")];
const mod = (a, m) => ((a % m) + m) % m;
function inv(a, m) {
  let r0 = mod(a, m), r1 = m, s0 = B1, s1 = B0;
  while (r1) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; }
  return mod(s0, m);
}
function add(p, q) {
  if (!p) return q; if (!q) return p;
  let l;
  if (p[0] === q[0]) { if (mod(p[1] + q[1], P) === B0) return null; l = mod((B3 * p[0] * p[0] - B3) * inv(B2 * p[1], P), P); }
  else l = mod((q[1] - p[1]) * inv(q[0] - p[0], P), P);
  const x = mod(l * l - p[0] - q[0], P);
  return [x, mod(l * (p[0] - x) - p[1], P)];
}
function mul(k, p) { let r = null; for (; k > B0; k >>= B1, p = add(p, p)) if (k & B1) r = add(r, p); return r; }

const big = b => b.reduce((n, x) => n * B256 + BigInt(x & 255), B0);
const bytes = n => { const o = []; for (let i = 0; i < 32; i++) { const v = Number((n >> BigInt(8 * (31 - i))) & B255); o.push(v > 127 ? v - 256 : v); } return o; };
const b64u = b => Utilities.base64EncodeWebSafe(b).replace(/=+$/, "");
const fresh = () => mod(big(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now())), N - B1) + B1;

function key() {
  const props = PropertiesService.getScriptProperties();
  let d = props.getProperty("d");
  if (!d) {
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    d = props.getProperty("d") || (props.setProperty("d", fresh().toString(16)), props.getProperty("d"));
    lock.releaseLock();
  }
  d = BigInt("0x" + d);
  const pub = mul(d, G);
  return { d, pub: b64u([4, ...bytes(pub[0]), ...bytes(pub[1])]) };
}

function sign(d, text) {
  const e = big(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8));
  for (;;) {
    const k = fresh(), r = mod(mul(k, G)[0], N);
    const s = mod(inv(k, N) * (e + r * d), N);
    if (r && s) return [...bytes(r), ...bytes(s)];
  }
}

// 같은 푸시 서버(aud)에는 6시간 동안 같은 서명을 다시 쓴다
function auth(endpoint) {
  const aud = endpoint.match(/^https:\/\/[^/]+/)[0], cache = CacheService.getScriptCache();
  const hit = cache.get(aud); if (hit) return hit;
  const { d, pub } = key();
  const part = o => b64u(Utilities.newBlob(JSON.stringify(o)).getBytes());
  const head = part({ typ: "JWT", alg: "ES256" }) + "." + part({ aud, exp: Math.floor(Date.now() / 1000) + 43200, sub: "https://tkdgh123.github.io/uridal/" });
  const v = `vapid t=${head}.${b64u(sign(d, head))}, k=${pub}`;
  cache.put(aud, v, 21600);
  return v;
}

const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
function doGet() { return out({ key: key().pub }); }
function doPost(e) {
  let status = 400;
  try {
    const m = JSON.parse(e.postData.contents);
    if (PUSH_HOST.test(m.endpoint) && m.body.length < 6000) {
      status = UrlFetchApp.fetch(m.endpoint, {
        method: "post", contentType: "application/octet-stream", muteHttpExceptions: true,
        headers: { TTL: "86400", Urgency: "high", "Content-Encoding": "aes128gcm", Authorization: auth(m.endpoint) },
        payload: Utilities.base64Decode(m.body)
      }).getResponseCode();
    }
  } catch (err) { status = 500; }
  return out({ status });
}
