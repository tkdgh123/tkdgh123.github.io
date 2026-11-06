# 덜미 전체 시나리오 테스트: 방장 H와 참가자 A, B, C를 실제 deolmi.exe로 띄우고 키보드 입력 대신 파이프로 명령을 넣는다
# 입장 심사 → 암호화 대화 → 1:1 → 장부 대조 → 시연(두 얼굴, 몰래 버리기, 1바이트 바꾸기)
# → 유출 추적(띄어쓰기 표식) → 카메라 지킴이(가짜 카메라 프로그램) → 다시 접속 → 키 바뀜
# 실행: deolmi 폴더에서 python tests\e2e.py  (deolmi.exe가 먼저 빌드돼 있어야 함)
import os, re, subprocess, sys, tempfile, threading, time

HERE = os.path.dirname(os.path.abspath(__file__))
EXE = os.path.join(HERE, "..", "deolmi.exe")
FAKE_EYE = f'"{sys.executable}" "{os.path.join(HERE, "fake_eye.py")}"'   # 진짜 카메라 대신
fails = 0


class Peer:
    def __init__(self, name, home, host=False):
        self.name, self.lines, self.seen = name, [], 0
        env = dict(os.environ, DEOLMI_HOME=home, DEOLMI_EYE=FAKE_EYE)
        args = [EXE, name, "--host"] if host else [EXE, name, "127.0.0.1"]
        self.p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
        threading.Thread(target=self._read, daemon=True).start()

    def _read(self):
        for raw in self.p.stdout:
            self.lines.append(raw.decode("utf-8", "replace").rstrip("\r\n"))

    def say(self, text):
        self.p.stdin.write((text + "\n").encode("utf-8"))
        self.p.stdin.flush()

    def wait(self, pattern, timeout=6.0):
        """지금까지 + 앞으로 timeout초 안에 pattern이 든 줄이 나오면 그 줄"""
        end = time.time() + timeout
        while time.time() < end:
            for line in self.lines:
                if re.search(pattern, line):
                    return line
            time.sleep(0.05)
        return None

    def has(self, pattern):
        return any(re.search(pattern, line) for line in self.lines)

    def quit(self):
        try:
            self.say("/quit")
            self.p.wait(3)
        except Exception:
            self.p.kill()


def said(who, text):
    """화면에 뜬 글 한 줄. 띄어쓰기 표식 때문에 칸은 한 칸이나 두 칸"""
    return r"^\[" + who + r"\] +" + r" +".join(re.escape(w) for w in text.split()) + "$"


def check(ok, what):
    global fails
    print(("[ok]   " if ok else "[FAIL] ") + what)
    if not ok:
        fails += 1


def main():
    homes = {n: tempfile.mkdtemp(prefix="deolmi-" + n + "-") for n in ["H", "A", "B", "C", "A2"]}
    H = Peer("H", homes["H"], host=True)
    time.sleep(0.5)
    A = Peer("A", homes["A"])
    peers = [H, A]
    try:
        # 입장 심사: A가 들어오면 H 화면에 단어와 /ok 안내
        check(H.wait(r"\[입장 심사\] A가 들어왔습니다 · 단어 \S+") is not None, "H 화면에 A의 입장 심사와 단어 8개")
        check(A.wait(r"\[멤버\] H · 단어") and A.wait(r"승인을 기다리는 중 · 내 단어"), "A는 방장 H를 멤버로 보고, 승인을 기다림")
        h_words = H.wait(r"A가 들어왔습니다 · 단어 (\S+)")
        a_words = A.wait(r"\[내 단어\] (\S+)")
        check(h_words and a_words and h_words.split("단어 ")[1] == a_words.split("] ")[1].split(" ")[0], "H가 본 A의 단어 = A 화면의 내 단어")

        H.say("승인 전에 보낸 글")
        check(H.wait(r"아직 대화할 멤버가 없습니다") is not None, "승인 전에는 H가 A에게 글을 보내지 않음")
        A.say("저 A예요")
        check(H.wait(said(r"A \(승인 전\)", "저 A예요")) is not None, "승인 전인 A의 글은 '(승인 전)' 표시로 보임")

        H.say("/ok A")
        check(H.wait(r"A 승인 1/1 · 이제 A도 대화에 들어옵니다") is not None, "H가 /ok A 하면 A가 멤버가 됨")
        check(A.wait(r"모두 승인했습니다") is not None, "A 화면: 모두 승인했습니다")
        check(not A.has(said("H", "승인 전에 보낸 글")[1:]), "승인 전 글은 A에게 끝내 안 감")

        # B 입장: H와 A 둘 다 승인해야 함
        B = Peer("B", homes["B"])
        peers.append(B)
        check(A.wait(r"\[입장 심사\] B가 들어왔습니다") is not None and H.wait(r"\[입장 심사\] B가 들어왔습니다") is not None,
              "B가 들어오면 H, A 둘 다 입장 심사")
        A.say("/ok B")
        check(A.wait(r"B 승인 1/2 · H의 승인을 기다리는 중") is not None, "A만 승인하면 1/2, H를 기다림")
        A.say("B는 아직 못 봐야 함")
        time.sleep(0.8)
        check(not B.has(said("A", "B는 아직 못 봐야 함")[1:]), "전원 승인 전에는 A의 글이 B에게 안 감")
        H.say("/ok B")
        check(A.wait(r"B 승인 2/2 · 이제 B도") is not None and B.wait(r"모두 승인했습니다") is not None, "H까지 승인하면 B가 멤버")

        C = Peer("C", homes["C"])
        peers.append(C)
        for p in (H, A, B):
            p.wait(r"C가 들어왔습니다")
            p.say("/ok C")
        check(C.wait(r"모두 승인했습니다") is not None, "C도 H, A, B 승인으로 들어옴")
        time.sleep(0.5)

        # 암호화 대화
        A.say("안녕 모두")
        check(all(p.wait(said("A", "안녕 모두")) for p in (H, B, C)), "A의 전체 글이 H, B, C에게 보임")
        A.say("/dm B")
        A.say("비밀 이야기")
        check(B.wait(said("A -> 나", "비밀 이야기")) is not None, "1:1 글은 B에게")
        time.sleep(0.5)
        check(not C.has("비밀 +이야기") and not H.has("비밀 +이야기"), "1:1 글은 C와 방장 H 화면에 없음")
        A.say("/all")
        time.sleep(2.5)

        # 장부 대조: 정상이면 같음
        C.say("/check")
        check(C.wait(r"\[장부\] A와 같음 ✔") and C.wait(r"\[장부\] H와 같음 ✔") and C.wait(r"\[장부\] B와 같음 ✔"),
              "/check: 정상 대화에선 모두 같음")
        check(not any(p.has(r"\[덜미\]") for p in peers), "정상 대화에선 [덜미] 경고 0")

        # 시연 1: 두 얼굴 (B에게만 다른 글)
        A.say("/twoface B | 4시에 만나 | 3시에 만나")
        check(B.wait(said("A", "4시에 만나")) and C.wait(said("A", "3시에 만나")), "두 얼굴: B는 4시, C는 3시를 받음")
        # 누가 먼저 대조하느냐에 따라 문구는 셋 중 하나 (나와 남이 다름 / A가 말한 장부와 다름 / A의 앞 글이 다름)
        caught = [p.wait(r"\[덜미\] A(의 글을 나와 \S+가 다르게 받았습니다|가 모두에게 보냈다는 글과|가 나에게 보낸 앞 글이)", 8)
                  for p in (B, C, H)]
        check(all(caught), "두 얼굴: B, C, H 모두 [덜미] 경고")
        check(A.wait(r"\[덜미\] 내 글이 B에게는 다르게 전해졌습니다", 8) is not None, "두 얼굴: 보낸 A에게도 들킨 것이 보임")

        # 시연 2: 방장이 C에게 가는 B의 글을 몰래 버림
        H.say("/drop C")
        time.sleep(0.3)
        B.say("회의 시작합니다")
        check(H.wait(r"\[시연\] C에게 가는 B의 메시지를 몰래 버렸습니다") is not None, "방장 H가 C에게 가는 글을 버림")
        check(A.wait(said("B", "회의 시작합니다")) is not None and not C.has("회의 +시작합니다"), "A는 받고 C는 못 받음")
        check(C.wait(r"\[덜미\] B의 \d+번째 글이 나에게 오지 않았습니다 \(\S+는 받음\)", 9) is not None, "장부 대조로 C가 빠진 걸 알아챔")
        B.say("다음 안건")
        check(C.wait(said("B", "다음 안건")) and C.wait(r"\[덜미\] B가 나에게 보낸 #\d+ 메시지가 오지 않았습니다"),
              "다음 글은 열리고, 번호 검사도 빠진 걸 알림")

        # 시연 3: 방장이 1바이트 바꿈
        H.say("/tamper B")
        time.sleep(0.3)
        C.say("바뀔 글")
        check(B.wait(r"\[!\] C의 #\d+ 메시지가 중간에 바뀌었습니다 · 버림") is not None and not B.has(said("C", "바뀔 글")),
              "1바이트 바꾼 글은 B가 버리고 경고")
        C.say("멀쩡한 글")
        check(B.wait(said("C", "멀쩡한 글")) is not None, "가짜 한 통 뒤에도 대화는 이어짐")

        # 유출 추적: 같은 글이 사람마다 띄어쓰기가 조금 다르게 보이고, 새어 나간 줄로 누구 화면인지 찾음
        long_text = "내일 동아리 회비 걷는 거 잊지 마세요 다들 오천 원씩 현금으로 가져오면 됩니다 늦으면 안 돼요"
        A.say(long_text)
        shown = {p.name: p.wait(said("A", long_text)) for p in (H, B, C)}
        check(all(shown.values()) and len(set(shown.values())) == 3, "같은 글도 H, B, C 화면의 띄어쓰기가 서로 다름")
        A.say("/trace " + (shown["B"] or ""))
        check(A.wait(r"\[추적\] B 화면에서 나온 글입니다") is not None, "/trace: B 화면의 줄을 넣으면 B를 찾음")
        A.say("/trace " + (shown["C"] or ""))
        check(A.wait(r"\[추적\] C 화면에서 나온 글입니다") is not None, "/trace: C 화면의 줄을 넣으면 C를 찾음")
        B.say("/trace " + (shown["B"] or ""))
        check(B.wait(r"\[추적\] 내가 보낸 글만 추적할 수 있습니다") is not None, "남이 보낸 글은 추적하지 않음")
        A.say("/twoface B | 두 칸  띄운   글 | 두 칸  띄운   글")
        check(B.wait(said("A", "두 칸 띄운 글")) and C.wait(said("A", "두 칸 띄운 글")), "보내는 글의 여러 칸은 한 칸으로 줄여 보냄")

        # 카메라 지킴이 (가짜 카메라: 켜짐 → 휴대폰 2초 → 없음 → 가려짐 → 없음)
        C.say("/eye")
        check(C.wait(r"\[카메라\] 켜졌습니다") is not None, "/eye: 카메라 지킴이 켜짐")
        check(all(p.wait(r"\[카메라\] C가 카메라 지킴이를 켰습니다") for p in (H, A, B)), "켜면 방 사람들에게 알림")
        check(C.wait(r"\[카메라\] 화면 앞에 휴대폰이 보여 글을 가렸습니다", 8) is not None, "휴대폰이 보이면 C의 글을 가림")
        check(all(p.wait(r"\[덜미\] C 화면 앞에 휴대폰이 보입니다", 8) for p in (H, A, B)), "휴대폰이 보이면 H, A, B에게 [덜미]")
        check(all(p.wait(r"\[카메라\] C의 화면이 다시 보입니다", 8) for p in (H, A, B)), "휴대폰이 사라지면 다시 보인다고 알림")
        check(all(p.wait(r"\[덜미\] C의 카메라가 가려졌습니다", 8) for p in (H, A, B)), "카메라를 가리면 H, A, B에게 [덜미]")
        A.say("/who")
        check(A.wait(r"\[접속 중\].*C\(카메라 켬\)") is not None, "/who에 카메라 켠 사람 표시")

        # 다시 접속: 같은 키면 자동 승인
        A.quit()
        check(H.wait(r"\[알림\] A 퇴장") is not None, "A가 나가면 퇴장 알림")
        A = Peer("A", homes["A"])
        peers.append(A)
        check(all(p.wait(r"전에 확인한 키라서 자동으로 승인") for p in (H, B, C)), "같은 키로 다시 오면 H, B, C가 자동 승인")
        check(A.wait(r"모두 승인했습니다") is not None, "다시 온 A는 바로 멤버")
        # 그때 가짜 카메라가 어느 상태냐에 따라 켜짐 / 가려짐 / 휴대폰 중 하나로 알게 된다
        check(A.wait(r"\[카메라\] C가 카메라 지킴이를 켰습니다|\[덜미\] C(의 카메라가 가려졌습니다| 화면 앞에 휴대폰)") is not None,
              "나중에 들어온 A도 C의 카메라 상태를 앎")
        C.say("/eye")
        check(C.wait(r"\[카메라\] 껐습니다") and B.wait(r"\[카메라\] C가 카메라 지킴이를 껐습니다"), "/eye 다시: 끄고 알림")

        # 같은 이름, 다른 키 (새 기기이거나 다른 사람)
        A.quit()
        H.wait(r"A 퇴장")
        time.sleep(0.5)
        n_before = len([l for l in H.lines if "자동으로 승인" in l])
        A2 = Peer("A", homes["A2"])
        peers.append(A2)
        check(H.wait(r"\[!\] A의 키가 전과 다릅니다 · 새 기기이거나 다른 사람입니다") is not None, "같은 이름·다른 키면 경고")
        time.sleep(0.5)
        check(len([l for l in H.lines if "자동으로 승인" in l]) == n_before and not A2.has("모두 승인했습니다"),
              "키가 다르면 자동 승인하지 않음")
    finally:
        for p in peers:
            try:
                p.p.kill()
            except Exception:
                pass
        if fails and "-v" in sys.argv:
            for p in peers:
                print("\n==", p.name)
                print("\n".join(p.lines))
    print(f"\n{fails}개 실패" if fails else "\n전부 통과")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
