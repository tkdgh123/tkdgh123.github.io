# 차 한 대의 움직임 (웹판 drive/car.js를 옮김): 뒷바퀴 축 가운데 기준 자전거 모델 + 자동변속기(P R N D)
# 더한 것: 노면 마찰(grip) — 마른 길 1, 젖은 길 0.7, 눈길 0.35, 빙판 0.12.
#   타이어가 버틸 수 있는 힘(grip × 0.9G)을 넘으면 가속은 헛돌고, 제동은 길어지고, 핸들을 꺾어도 덜 돌며(앞이 밀림) 옆으로 미끄러짐.
# 입력은 늘 { steer: -1~1 (왼쪽 +), thr: 0~1, brk: 0~1 }. 키보드든 레이싱 휠이든 같은 칸을 채움.
# auto = 간단 조작: 기어감 없이 밟을 때만 가고, 멈추면 그 자리에 섬.
class_name Car
extends RefCounted

const L := 4.6
const W := 1.8
const H := 1.45
const WB := 2.7
const TR := 1.56
const RO := 0.95
const FO := 0.95
const DMAX := 0.62 # 아반떼 크기, 최소 회전 반경(바깥 앞바퀴) 약 5.3m
const G := 9.8
const UP := [0, 15, 30, 45, 62, 80]
const UPT := [0, 25, 30, 30, 30, 30]
const KR := [0, 105, 62, 44, 34, 28, 23]

var x := 0.0
var z := 0.0
var yaw := 0.0
var th := 0.0          # 실제로 움직이는 방향 (미끄러지면 차가 향한 yaw와 달라짐)
var y := 0.0
var pitch := 0.0
var v := 0.0
var acc := 0.0
var steer := 0.0
var gear := "P"
var ag := 1
var rpm := 750.0
var engine := true
var pb := true
var belt := false
var sig := 0
var hazard := false
var lights := 0
var spin := 0.0
var brk := 0.0
var thr := 0.0
var yaw_rate := 0.0
var sig_yaw := 0.0
var auto := false
var grip := 1.0        # 지금 노면 마찰 (밖에서 날씨, 웅덩이, 빙판을 보고 정함)
var slip := 0.0        # 미끄러지는 각 (차 방향 - 진행 방향)
var wheelspin := false
var understeer := 0.0  # 앞이 밀리는 정도 0~1
var ffb := 0.0         # 핸들에 오는 힘 -1~1 (+ = 왼쪽으로 돌리는 힘). 레이싱 휠 모터로 보낼 값
var ffb_extra := 0.0   # 웅덩이, 노면 떨림 같은 바깥 힘 (밖에서 채움)

func _init(px := 0.0, pz := 0.0, pyaw := 0.0) -> void:
	x = px
	z = pz
	yaw = pyaw
	th = pyaw

func at(f: float, l: float) -> Dictionary: # 차 위의 한 점(앞으로 f, 왼쪽으로 l) → 땅 좌표
	var s := sin(yaw)
	var c := cos(yaw)
	return {"x": x + s * f + c * l, "z": z + c * f - s * l}

func front() -> Dictionary:
	return at(WB + FO, 0)

func wheels() -> Array: # 왼뒤 오뒤 왼앞 오앞
	return [at(0, TR / 2), at(0, -TR / 2), at(WB, TR / 2), at(WB, -TR / 2)]

func box() -> Dictionary:
	var m := at((WB + FO - RO) / 2, 0)
	return {"x": m.x, "z": m.z, "hw": W / 2, "hl": L / 2, "r": yaw}

func shift(g: String) -> bool: # 멈췄을 때만 바뀜 (P에서 빼거나 넣을 땐 브레이크를 밟고 있어야 함)
	if gear == g:
		return true
	if absf(v) > 0.4 and g != "N":
		return false
	if (gear == "P" or g == "P") and brk < 0.3 and not pb:
		return false
	gear = g
	return true

func set_sig(d: int) -> void:
	sig = 0 if sig == d else d
	sig_yaw = 0.0

func step(inp: Dictionary, dt: float) -> void:
	thr = inp.thr
	brk = inp.brk
	steer = inp.steer * DMAX
	pitch = 0.0 # 도시는 평평함
	var kmh := absf(v) * 3.6
	var amax := grip * G * 0.9 # 타이어가 낼 수 있는 가속
	var drive := 0.0
	wheelspin = false
	if engine and (gear == "D" or gear == "R"):
		var dir := 1.0 if gear == "D" else -1.0
		var vd := maxf(0.0, v * dir)
		var creep := 0.0 if auto else 1.0 * maxf(0.0, 1.0 - vd / 2.2) # 발을 떼면 시속 7~8km로 기어감 (간단 조작은 밟을 때만 감)
		var top := 50.0 if dir > 0 else (2.8 if auto else 5.0)
		drive = dir * (creep + thr * (4.5 if auto else 3.0) * maxf(0.0, 1.0 - vd / top))
		if absf(drive) > amax: # 미끄러운 길에서 세게 밟으면 헛돎
			wheelspin = thr > 0.2
			drive = clampf(drive, -amax, amax)
	var push := drive - G * sin(pitch)
	var hold := minf(inp.brk * 9.0, amax * 1.02) + (2.6 if pb else 0.0) + (30.0 if gear == "P" else 0.0) + 0.12 + (0.6 if auto and inp.thr == 0 else 0.0)
	var keep := auto and push * (-1.0 if gear == "R" else 1.0) < 0 # 간단 조작: 멈춘 차는 경사에서도 밀리지 않음
	var v0 := v
	if absf(v) < 0.03:
		v = 0.0 if absf(push) <= hold or keep else v + (push - signf(push) * hold) * dt
	else:
		var s := signf(v)
		var nv := v + (push - s * (hold + 0.0004 * v * v)) * dt
		v = 0.0 if signf(nv) != s and (absf(push) <= hold or keep) else nv
	# 돌기: 바퀴가 버티는 만큼만. 넘치면 앞이 밀리고(덜 돎) 진행 방향이 늦게 따라와 옆으로 미끄러짐
	var w_kin := v * tan(steer) / WB
	var need := absf(v * w_kin)
	var front_lim := amax * 1.15
	var w := w_kin
	understeer = 0.0
	if need > front_lim and absf(v) > 0.5:
		w = signf(w_kin) * front_lim / absf(v)
		understeer = clampf((need - front_lim) / front_lim, 0.0, 1.0)
	yaw_rate = w
	yaw += w * dt
	var d := Kit.wrap_a(yaw - th)
	var turn_lim := amax / maxf(absf(v), 0.5)
	th += clampf(d, -turn_lim * dt, turn_lim * dt)
	slip = Kit.wrap_a(yaw - th)
	if absf(slip) > 1.3: # 너무 돌면 진행 방향도 끌려옴
		th = yaw - signf(slip) * 1.3
		slip = signf(slip) * 1.3
	if absf(slip) > 0.03 and absf(v) > 0.1: # 옆으로 미끄러지는 동안 속도가 줄어듦
		v -= signf(v) * minf(absf(v), absf(sin(slip)) * amax * dt)
	acc = (v - v0) / dt
	x += sin(th) * v * dt
	z += cos(th) * v * dt
	spin += v * dt / 0.31
	# 엔진 회전수
	if not engine:
		rpm += (0.0 - rpm) * minf(1.0, dt * 4)
	else:
		var want: float = 750.0 + inp.thr * 5200.0
		if gear == "D":
			if ag < 6 and kmh > UP[ag] + UPT[ag] * inp.thr:
				ag += 1
			elif ag > 1 and kmh < UP[ag - 1] * 0.8:
				ag -= 1
			want = 750.0 + inp.thr * 1500.0 * maxf(0.0, 1.0 - kmh / 25.0) + kmh * KR[ag]
		elif gear == "R":
			want = 750.0 + inp.thr * 1500.0 * maxf(0.0, 1.0 - kmh / 10.0) + kmh * 120.0
		if gear != "D":
			ag = 1
		if wheelspin:
			want += 1500.0
		rpm += (minf(6500.0, want) - rpm) * minf(1.0, dt * 6)
	# 방향지시등은 핸들을 꺾었다가 풀면 저절로 꺼짐 (진로 변경처럼 조금만 돌면 그대로)
	if sig != 0:
		sig_yaw += yaw_rate * dt * (1.0 if sig == 1 else -1.0)
		if sig_yaw > 0.9 and absf(inp.steer) < 0.12:
			sig = 0
	# 핸들에 오는 힘: 타이어가 옆으로 버티는 힘만큼 제자리로 돌아오려 하고(빠를수록, 많이 꺾을수록),
	# 앞바퀴가 미끄러지기 시작하면 확 가벼워짐 (빙판, 수막현상에서 핸들이 헐거워지는 느낌)
	var lat := minf(need, front_lim)
	var light := 1.0 - 0.75 * smoothstep(0.85, 1.4, need / maxf(front_lim, 0.01))
	var align := -signf(steer) * lat / (G * 0.9) * 1.4 * light
	var centre: float = -inp.steer * 0.12 * clampf(absf(v) / 3.0, 0.0, 1.0) * maxf(grip, 0.3)
	ffb = clampf(align + centre + ffb_extra, -1.0, 1.0)
