# 덜미 카메라 지킴이: 노트북 카메라로 화면 앞의 휴대폰을 찾아 덜미에게 한 단어로 알린다
# 덜미에서 /eye 하면 덜미가 직접 켠다: python eye\deolmi_eye.py 포트
# 보내는 말 (127.0.0.1로만, 0.5초마다): ready 켜짐 / clear 없음 / phone 휴대폰 보임 / dark 카메라 가려짐 / fail 카메라 못 엶
# 영상은 이 프로그램 안에서만 쓰고 저장하지도 보내지도 않는다
# 필요한 것: pip install mediapipe opencv-python
import os
import socket
import sys
import time

import cv2
import mediapipe as mp
from mediapipe.tasks.python import BaseOptions, vision

MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "efficientdet_lite2.tflite")
PHONE_SCORE = 0.35     # 이보다 확실할 때만 휴대폰으로 본다
PHONE_FRAMES = 2       # 연달아 이만큼 보여야 휴대폰 (한 장만 잘못 잡는 것 거르기)
CLEAR_FRAMES = 8       # 연달아 이만큼 안 보여야 사라진 것 (약 0.7초)
DARK_MEAN = 25         # 평균 밝기가 이보다 낮고
DARK_SPREAD = 10       # 밝기 차이도 이보다 작으면 (렌즈를 막으면 고르게 어둡다) 가려진 것
DARK_SECONDS = 1.0


def main():
    port = int(sys.argv[1])
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def say(word):
        sock.sendto(word.encode(), ("127.0.0.1", port))

    cam = cv2.VideoCapture(0, cv2.CAP_MSMF)
    if not cam.isOpened():
        say("fail")
        return
    detector = vision.ObjectDetector.create_from_options(vision.ObjectDetectorOptions(
        base_options=BaseOptions(model_asset_path=MODEL), running_mode=vision.RunningMode.VIDEO,
        score_threshold=PHONE_SCORE, category_allowlist=["cell phone"]))
    state, seen, unseen, dark_since, said_at = "ready", 0, 0, None, 0.0
    start = time.monotonic()
    say(state)
    while True:
        ok, frame = cam.read()
        if not ok:
            say("fail")
            return
        now = time.monotonic()
        if now - start < 1.0:          # 켜자마자는 카메라가 밝기를 맞추는 중
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        dark = gray.mean() < DARK_MEAN and gray.std() < DARK_SPREAD
        dark_since = (dark_since or now) if dark else None
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        phone = bool(detector.detect_for_video(image, int((now - start) * 1000)).detections)
        seen, unseen = (seen + 1, 0) if phone else (0, unseen + 1)
        new = state
        if dark_since and now - dark_since >= DARK_SECONDS:
            new = "dark"
        elif seen >= PHONE_FRAMES:
            new = "phone"
        elif unseen >= CLEAR_FRAMES and not dark_since:
            new = "clear"
        if new != state or now - said_at >= 0.5:
            state, said_at = new, now
            say(state)


if __name__ == "__main__":
    main()
