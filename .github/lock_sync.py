# 잠금 설정 화면(lock/)에서 고른 목록(lock/pages.json)대로 페이지를 잠그고 푼다. GitHub Actions가 돌리고,
# 노트북의 창업실-비공개/lock.py도 이 파일의 함수를 같이 쓴다(암호 방식이 하나뿐이도록).
# 밖에서 보이는 것: 잠긴 폴더 이름, 잠금 화면, 무작위 이름의 암호문(lock/f/*.enc)뿐.
#   - 어떤 파일이 잠겼는지 목록 → lock/files.enc (암호화)
#   - 첫 화면 카드의 진짜 제목·설명·그림 → lock/hub.enc (암호화), 공개 카드는 "잠긴 작업"
# 비밀번호는 저장소 비밀값 LOCK_PASSWORD(세 단계를 줄바꿈으로 이은 값).
import base64, hashlib, hmac, json, os, pathlib, secrets, sys, unicodedata
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = pathlib.Path(__file__).resolve().parent.parent
NEVER = {"", ".github", "lock", "hub", "index.html", "sw.js", "uridal", "urigil", "vault"}  # 사이트 뼈대, 따로 잠기는 것
MASK_IMG = "hub/shots/locked.webp"
under = lambda f, p: f == p or f.startswith(p + "/")
unit = lambda href: href.split("#")[0].split("?")[0].split("/")[0]


def make_key(pw, L):
    parts = pw.replace(chr(13), "").strip().split(chr(10))
    if len(parts) == 3:  # 질문 답은 잠금 화면(gate.js)처럼 띄어쓰기를 빼고 소문자로
        parts[1] = "".join(unicodedata.normalize("NFC", parts[1]).lower().split())
        parts[2] = parts[2].strip()
    key = hashlib.pbkdf2_hmac("sha256", chr(10).join(parts).encode(), base64.b64decode(L["salt"]), L["iter"])
    c = base64.b64decode(L["check"])
    AESGCM(key).decrypt(c[:12], c[12:], None)  # 틀리면 여기서 예외
    return key


class Site:
    def __init__(self, key, root=ROOT):
        self.root, self.key, self.aes = root, key, AESGCM(key)
        self.list_path = root / "lock" / "list.json"
        self.L = json.loads(self.list_path.read_text(encoding="utf-8"))
        self.man = self._read("files.enc", {})   # 파일 경로 → 무작위 이름
        self.real = self._read("hub.enc", {})    # 카드 주소 → 진짜 카드 줄
        self.hub_path = root / "index.html"
        self.hub = self.hub_path.read_text(encoding="utf-8").split("\n")
        self.a = self.hub.index("const W = [") + 1
        self.b = next(i for i in range(self.a, len(self.hub)) if self.hub[i].startswith("].map("))
        self.rows = [json.loads(l.strip().rstrip(",")) for l in self.hub[self.a:self.b]]

    # ── 암호 ──
    def enc(self, name, data):  # 내용이 같으면 결과도 같게: 다시 돌려도 바뀐 파일만 커밋된다
        iv = hmac.new(self.key, name.encode() + b"\0" + data, hashlib.sha256).digest()[:12]
        return iv + self.aes.encrypt(iv, data, None)

    def dec(self, b):
        return self.aes.decrypt(b[:12], b[12:], None)

    def _read(self, name, empty):
        p = self.root / "lock" / name
        return json.loads(self.dec(p.read_bytes())) if p.exists() else empty

    def blob(self, rel):
        return self.root / "lock" / "f" / (self.man[rel] + ".enc")

    def put(self, rel, data):  # 원본 내용을 암호문으로 넣는다(이름은 처음 한 번 무작위로 정함)
        self.man.setdefault(rel, secrets.token_hex(10))
        b, out = self.enc(rel, data), self.blob(rel)
        out.parent.mkdir(parents=True, exist_ok=True)
        if not out.exists() or out.read_bytes() != b:
            out.write_bytes(b)

    def take(self, rel):  # 암호문을 풀어 돌려주고 목록에서 뺀다
        data = self.dec(self.blob(rel).read_bytes())
        self.blob(rel).unlink()
        del self.man[rel]
        return data

    # ── 첫 화면 카드 ──
    def page_rows(self, p):
        return [i for i, r in enumerate(self.rows) if unit(r[3]) == p]

    def entries(self, p):  # 잠금 화면을 남겨 둘 주소: 페이지 첫 화면 + 첫 화면 카드가 가리키는 html
        is_file = p.endswith(".html")
        out = {p if is_file else p + "/index.html"}
        for i in self.page_rows(p):
            r = self.real.get(self.rows[i][3], self.rows[i])
            for h in [r[3]] + [m[1] for m in (r[9] if len(r) > 9 else [])]:
                h = h.split("#")[0].split("?")[0]
                if unit(h) != p: continue
                out.add(h + "index.html" if h.endswith("/") else p + "/index.html" if h == p and not is_file else h)
        return out

    def mask(self, p):
        for i in self.page_rows(p):
            r = self.rows[i]
            if r[3] not in self.real:
                self.real[r[3]] = r
            self.rows[i] = [r[0], "잠긴 작업", r[2], r[3], MASK_IMG, "열쇠가 있는 기기에서만 보여요.", "잠금", 1, "열기", []]

    def unmask(self, p):
        for i in self.page_rows(p):
            r = self.real.pop(self.rows[i][3], None)
            if r:
                self.rows[i] = r[:7] + [0] + r[8:]

    def card_imgs(self, p):  # 페이지 폴더 밖(hub/shots)에 있는 진짜 카드 그림
        return {self.real.get(self.rows[i][3], self.rows[i])[4] for i in self.page_rows(p)} - {MASK_IMG}

    # ── 잠그기·풀기 ──
    def lock(self, p, src=None):
        """src: 원본이 있는 곳(노트북 lock.py는 창업실-비공개, Actions는 사이트 자신)."""
        src_root = src or self.root
        gate = (self.root / "lock" / "gate.html").read_text(encoding="utf-8")
        entry, s = self.entries(p), src_root / p
        files = [s] if s.is_file() else sorted(x for x in s.rglob("*") if x.is_file()) if s.exists() else []
        seen = set()
        for f in files:
            rel = f.relative_to(src_root).as_posix()
            if src is None and f.read_bytes() == gate.encode():  # 이미 잠긴 잠금 화면
                continue
            self.put(rel, f.read_bytes()); seen.add(rel)
        if src is not None:  # 원본에서 지운 파일은 암호문도 지운다
            for rel in [r for r in self.man if under(r, p) and r not in seen]:
                self.blob(rel).unlink(missing_ok=True); del self.man[rel]
        for rel in [r for r in self.man if under(r, p)]:
            out = self.root / rel
            if rel in entry:
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_text(gate, encoding="utf-8", newline="\n")
            elif out.exists():
                out.unlink()
        self.mask(p)
        for c in self.card_imgs(p):
            f = self.root / c
            if f.exists() and c not in self.man:
                self.put(c, f.read_bytes())
            if f.exists():
                f.unlink()
        self.prune(p)

    def unlock(self, p):
        imgs = self.card_imgs(p)
        for rel in [r for r in self.man if under(r, p) or r in imgs]:
            out = self.root / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(self.take(rel))
        self.unmask(p)

    def prune(self, p):  # 비어 버린 폴더 정리
        d = self.root / p
        if d.is_dir():
            for x in sorted(d.rglob("*"), reverse=True):
                if x.is_dir() and not any(x.iterdir()):
                    x.rmdir()

    def save(self, pages):
        for i, r in enumerate(self.rows):
            r[7] = int(unit(r[3]) in pages)
            self.hub[self.a + i] = "  " + json.dumps(r, ensure_ascii=False) + ","
        self.hub_path.write_text("\n".join(self.hub), encoding="utf-8", newline="\n")
        for name, obj in (("files.enc", self.man), ("hub.enc", self.real)):
            (self.root / "lock" / name).write_bytes(self.enc("lock/" + name, json.dumps(obj, ensure_ascii=False, sort_keys=True).encode()))
        self.L = {k: self.L[k] for k in ("salt", "iter", "check", "q") if k in self.L} | {"pages": sorted(pages)}
        self.list_path.write_text(json.dumps(self.L, ensure_ascii=False), encoding="utf-8")


def admin_key(key):
    # 잠금 설정용 열쇠: 비밀번호에서 바로 만든 값(key)으로만 계산된다. 기기에 저장된 열쇠(꺼낼 수 없는 AES 열쇠)로는
    # 만들 수 없으므로, 잠금을 바꾸려면 그때그때 세 단계를 직접 입력해야 한다.
    from cryptography.hazmat.primitives.hashes import SHA256
    from cryptography.hazmat.primitives.kdf.hkdf import HKDF
    return HKDF(SHA256(), 32, None, b"changupsil-lock-admin").derive(key)


def accept_request(req, key, current, max_age=900):
    """잠금 설정 화면이 보낸 요청(암호문)을 확인하고 원하는 목록을 돌려준다. 틀리면 예외."""
    import time
    b = base64.b64decode(req)
    r = json.loads(AESGCM(admin_key(key)).decrypt(b[:12], b[12:], b"changupsil-lock-request"))
    if abs(time.time() - r["ts"] / 1000) > max_age:
        raise ValueError("오래된 요청")
    if sorted(r["base"]) != sorted(current):   # 그 사이 바뀐 상태에 옛 요청을 다시 보내는 것 막기
        raise ValueError("잠금 상태가 그 사이 바뀜")
    pages = r["pages"]
    if not (isinstance(pages, list) and all(isinstance(p, str) and p and "/" not in p and ".." not in p for p in pages)):
        raise ValueError("이상한 목록")
    return sorted(set(pages))


if __name__ == "__main__":
    L = json.loads((ROOT / "lock" / "list.json").read_text(encoding="utf-8"))
    if os.environ.get("LOCK_REQUEST"):  # 잠금 설정 화면 → workflow_dispatch로 온 서명된 요청
        try:
            got = accept_request(os.environ["LOCK_REQUEST"], make_key(os.environ.get("LOCK_PASSWORD", ""), L), L.get("pages", []))
        except Exception as e:
            sys.exit(f"요청 거절: {type(e).__name__}")
        (ROOT / "lock" / "pages.json").write_text(json.dumps(got, ensure_ascii=False), encoding="utf-8")
    old = L.get("pages", [])
    want = [p for p in json.loads((ROOT / "lock" / "pages.json").read_text(encoding="utf-8"))
            if p not in NEVER and "/" not in p and ".." not in p and (p in old or (ROOT / p).exists())]
    if set(old) == set(want) and "files" not in L:
        sys.exit(print("바뀐 것 없음"))
    try:
        site = Site(make_key(os.environ.get("LOCK_PASSWORD", ""), L))
    except Exception:
        sys.exit("LOCK_PASSWORD가 사이트 비밀번호와 달라요")
    for p in old:
        if p not in want: site.unlock(p); print("풀기", p)
    for p in want:
        if p not in old: site.lock(p); print("잠금", p)
    site.save(want)
