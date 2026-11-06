# 가짜 카메라 지킴이 (e2e 테스트용): 진짜 카메라 대신 정해진 순서로 단어를 보낸다
# ready → 휴대폰 보임 2초 → 없음 2초 → 가려짐 2초 → 없음 (계속)
import socket, sys, time

port = int(sys.argv[1])
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
for word, seconds in [("ready", 2), ("phone", 2), ("clear", 2), ("dark", 2), ("clear", 600)]:
    end = time.monotonic() + seconds
    while time.monotonic() < end:
        sock.sendto(word.encode(), ("127.0.0.1", port))
        time.sleep(0.5)
