# 차 한 대의 움직임: 앞바퀴 굴림 승용차(아반떼 크기)의 동역학 자전거 모형 + 파제카 매직 공식 타이어.
# 앞바퀴 축, 뒷바퀴 축마다 슬립각(바퀴가 향한 쪽과 실제로 가는 쪽의 차이)과 슬립률(바퀴 둘레 속도와 차 속도의 차이)을 구하고
#   F = D sin(C atan(B x - E (B x - atan(B x))))   (D = 노면 마찰 x 바퀴를 누르는 무게)
# 로 옆 힘, 앞뒤 힘을 냄. 두 힘을 합친 크기는 마찰원(D)을 넘지 못함 → 미끄러운 길에서 밟으며 꺾으면 앞이 밀리고, 브레이크와 함께 꺾으면 뒤가 돎.
# 바퀴 회전 속도도 따로 계산 (구동 토크, 브레이크 토크, 노면 힘) → 세게 밟으면 헛돌고, ABS가 바퀴 잠김을 막음.
# 바퀴 힘은 굳은 계산이라 한 걸음(1/120초)을 8번으로 나눠 계산함.
# 입력은 늘 { steer: -1~1 (왼쪽 +), thr: 0~1, brk: 0~1 }. 키보드든 레이싱 휠이든 같은 칸을 채움.
# 좌표: x, z = 뒷바퀴 축 가운데, yaw 0 = +z, 왼쪽 = (cos yaw, -sin yaw). auto = 간단 조작(기어감 없이 밟을 때만 감)
class_name Car
extends RefCounted

const L := 4.6
const W := 1.8
const H := 1.45
const WB := 2.7
const TR := 1.56
const RO := 0.95
const FO := 0.95
const DMAX := 0.62 # 최소 회전 반경(바깥 앞바퀴) 약 5.3m
const G := 9.8
const UP := [0, 15, 30, 45, 62, 80]
const UPT := [0, 25, 30, 30, 30, 30]
const KR := [0, 105, 62, 44, 34, 28, 23]
# 차와 타이어 값
const M := 1300.0      # kg
const IZ := 2100.0     # 수직축 관성 kg m²
const CA := 1.1        # 무게 중심 → 앞바퀴 축
const CB := 1.6        # 무게 중심 → 뒷바퀴 축 (앞이 무거운 앞바퀴 굴림)
const HCG := 0.52      # 무게 중심 높이 (앞뒤 하중 이동)
const R := 0.31        # 바퀴 반지름
const IW_F := 4.0      # 앞바퀴 축 관성 (엔진, 변속기까지 붙어 무거움)
const IW_R := 1.8
# 매직 공식 계수 [B, C, E]: 옆(슬립각, 라디안) 최대 힘은 약 8도, 앞뒤(슬립률)는 약 13%에서. 옆 강성 B*C*D = 축마다 약 9만 N/rad
const LAT := [10.0, 1.45, -0.6]   # 앞
const LAT_R := [13.0, 1.5, -0.6]  # 뒤는 조금 더 단단하고(1.05배) 잘 버팀 → 보통 승용차처럼 한계에서 앞이 먼저 밀림 (뒤가 먼저 돌면 위험해서 차를 그렇게 만듦)
const LON := [11.0, 1.65, 0.1]
const SUB_HZ := 960.0   # 바퀴 계산은 1초에 960번 (물리 한 걸음을 나눠서)

var x := 0.0
var z := 0.0
var yaw := 0.0
var y := 0.0
var pitch := 0.0
var vx := 0.0          # 차 기준 앞 속도 (무게 중심)
var vy := 0.0          # 차 기준 왼쪽 속도
var yaw_rate := 0.0    # r (왼쪽으로 도는 +)
var wf := 0.0          # 앞바퀴 회전 속도 (rad/s)
var wr := 0.0
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
var sig_yaw := 0.0
var auto := false
var grip := 1.0        # 지금 노면 마찰 (밖에서 날씨, 웅덩이, 빙판을 보고 정함)
var slip := 0.0        # 차체 미끄럼각 (차가 향한 쪽 - 가는 쪽)
var alpha_f := 0.0     # 앞바퀴 슬립각
var alpha_r := 0.0
var kappa_f := 0.0     # 앞바퀴 슬립률 (+ 헛돎, - 잠김)
var kappa_r := 0.0
var wheelspin := false
var understeer := 0.0  # 앞이 밀리는 정도 0~1
var oversteer := 0.0   # 뒤가 도는 정도 0~1
var abs_on := false
var ffb := 0.0         # 핸들에 오는 힘 -1~1 (+ = 왼쪽으로 돌리는 힘). 레이싱 휠 모터로 보낼 값
var ffb_extra := 0.0   # 웅덩이, 노면 떨림 같은 바깥 힘 (밖에서 채움)
var pull := 0.0        # 앞이 찌그러져 핸들이 한쪽으로 쏠리는 정도 (rad)
var fz_f := 0.0
var fz_r := 0.0
var _ax := 0.0

# 예전 코드와 시험이 쓰는 값: v = 가는 속도(앞 +, 뒤 -), th = 실제로 가는 방향
var v: float:
	get:
		var s := sqrt(vx * vx + vy * vy)
		return s if vx >= -0.01 else -s
	set(val):
		vx = val
		vy = 0.0
		yaw_rate = 0.0
		wf = val / R
		wr = val / R
var th: float:
	get:
		if absf(vx) + absf(vy) < 0.05:
			return yaw
		var fx := sin(yaw)
		var fz := cos(yaw)
		var wx := fx * vx + fz * vy
		var wz := fz * vx - fx * vy
		return atan2(wx, wz) if vx >= -0.01 else atan2(-wx, -wz)
	set(_val):
		pass

func _init(px := 0.0, pz := 0.0, pyaw := 0.0) -> void:
	x = px
	z = pz
	yaw = pyaw

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

# 땅 기준 속도 (무게 중심)
func world_vel() -> Vector2:
	var fx := sin(yaw)
	var fz := cos(yaw)
	return Vector2(fx * vx + fz * vy, fz * vx - fx * vy)

# 부딪힘: 땅 기준 속도를 바꾸고 회전을 더함 (바퀴는 새 속도에 맞춰 굴러감)
func set_world_vel(V: Vector2, add_r := 0.0) -> void:
	var fx := sin(yaw)
	var fz := cos(yaw)
	vx = V.x * fx + V.y * fz
	vy = V.x * fz - V.y * fx
	yaw_rate += add_r
	wf = vx / R
	wr = vx / R

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

static func mf(s: float, k: Array, d: float) -> float: # 파제카 매직 공식
	var bx: float = k[0] * s
	return d * sin(k[1] * atan(bx - k[2] * (bx - atan(bx))))

# 바퀴 하나(축 하나): 바퀴 기준 속도 → 슬립각, 슬립률 → 마찰원 안의 힘 [앞뒤, 옆]
func _tire(vxw: float, vyw: float, w: float, fz: float, lat: Array, mu := 1.0) -> Array:
	var den := maxf(absf(vxw), 3.0) # 아주 느릴 때 나눗셈이 튀지 않게
	var a := atan2(vyw, den)
	var k := clampf((w * R - vxw) / den, -1.0, 1.0)
	var d := grip * fz * mu
	var fx := mf(k, LON, d)
	var fy := -mf(a, lat, d)
	var s := sqrt(fx * fx + fy * fy) / maxf(d, 1.0)
	if s > 1.0: # 마찰원: 둘을 합쳐 노면이 버티는 힘을 넘지 못함
		fx /= s
		fy /= s
	return [fx, fy, a, k]

func step(inp: Dictionary, dt: float) -> void:
	thr = inp.thr
	brk = inp.brk
	steer = inp.steer * DMAX + pull
	pitch = 0.0 # 도시는 평평함
	var kmh := absf(v) * 3.6
	# 구동: 바퀴에서 내고 싶은 가속 (예전 모형과 같은 세기) → 앞바퀴 토크
	var drive := 0.0
	if engine and (gear == "D" or gear == "R"):
		var dir := 1.0 if gear == "D" else -1.0
		var vd := maxf(0.0, vx * dir)
		var creep := 0.0 if auto else 1.0 * maxf(0.0, 1.0 - vd / 2.2)
		var top := 50.0 if dir > 0 else (2.8 if auto else 5.0)
		drive = dir * (creep + thr * (4.5 if auto else 3.0) * maxf(0.0, 1.0 - vd / top))
	var t_drive := drive * M * R
	# 브레이크: 밟은 만큼 (최대 0.92G), 앞 65% 뒤 35%. 주차 브레이크는 뒷바퀴
	var bf: float = inp.brk * 9.0 * M * R + (0.6 * M * R if auto and inp.thr == 0 else 0.0) # 간단 조작: 발을 떼면 엔진 브레이크처럼 천천히 섬
	var tb_f: float = bf * 0.65
	var tb_r: float = bf * 0.35 + (2.6 * M * R if pb else 0.0)
	var lock := gear == "P"
	# 다 멈춘 채 버티는 힘이 미는 힘보다 크면 그 자리에 섬 (간단 조작은 경사에서도 안 밀림)
	var speed := sqrt(vx * vx + vy * vy)
	if speed < 0.08 and absf(yaw_rate) < 0.05 and (absf(t_drive) <= bf + (2.6 * M * R if pb else 0.0) + 0.12 * M * R or lock or (auto and inp.thr == 0)):
		vx = 0.0
		vy = 0.0
		yaw_rate = 0.0
		wf = 0.0
		wr = 0.0
		acc = 0.0
		_after(inp, dt, 0.0)
		return
	var vx0 := vx
	var sub := maxi(1, ceili(dt * SUB_HZ - 0.01))
	var h := dt / sub
	var cs := cos(steer)
	var sn := sin(steer)
	abs_on = false
	for i in sub:
		# 앞뒤 하중 이동: 브레이크를 밟으면 앞이 눌려 앞바퀴가 잘 버팀
		fz_f = M * G * CB / WB - M * _ax * HCG / WB
		fz_r = M * G * CA / WB + M * _ax * HCG / WB
		fz_f = maxf(fz_f, 300.0)
		fz_r = maxf(fz_r, 300.0)
		# 앞바퀴: 차 기준 속도를 바퀴 방향으로 돌림
		var vfy := vy + CA * yaw_rate
		var vxw := vx * cs + vfy * sn
		var vyw := -vx * sn + vfy * cs
		var tf := _tire(vxw, vyw, wf, fz_f, LAT)
		var tr := _tire(vx, vy - CB * yaw_rate, wr, fz_r, LAT_R, 1.05)
		# 바퀴 회전: 구동 - 노면 - 브레이크 (ABS: 잠기려 하면 브레이크를 풀었다 잡음)
		var bff: float = tb_f
		var brr: float = tb_r
		if absf(vx) > 2.0:
			if tf[3] < -0.12 and inp.brk > 0.1:
				bff *= 0.25
				abs_on = true
			if tr[3] < -0.12 and inp.brk > 0.1 and not pb:
				brr *= 0.25
				abs_on = true
		if lock:
			bff = 1e6
			brr = 1e6
		wf = _wheel(wf, t_drive - tf[0] * R, bff, IW_F, h)
		wr = _wheel(wr, -tr[0] * R, brr, IW_R, h)
		# 차체: 앞바퀴 힘을 차 기준으로 돌려 더함
		var ffx: float = tf[0] * cs - tf[1] * sn
		var ffy: float = tf[0] * sn + tf[1] * cs
		var drag := (0.12 + 0.0004 * vx * vx) * M * signf(vx) if absf(vx) > 0.05 else 0.0
		var fx_sum: float = ffx + tr[0] - drag
		var fy_sum: float = ffy + tr[1]
		var mz: float = CA * ffy - CB * tr[1]
		var ax: float = fx_sum / M
		vx += (ax + vy * yaw_rate) * h
		vy += (fy_sum / M - vx * yaw_rate) * h
		yaw_rate += mz / IZ * h
		_ax += (ax - _ax) * minf(1.0, h * 8.0)
		alpha_f = tf[2]
		alpha_r = tr[2]
		kappa_f = tf[3]
		kappa_r = tr[3]
	# 아주 느릴 때(주차, 출발)는 타이어가 옆으로 거의 안 미끄러지니 바퀴가 가리키는 대로 돎
	var sp2 := sqrt(vx * vx + vy * vy)
	var kin := 1.0 - clampf((sp2 - 0.8) / 2.5, 0.0, 1.0)
	if kin > 0.0:
		var r_kin := vx * tan(steer) / WB
		yaw_rate = lerpf(yaw_rate, r_kin, kin)
		vy = lerpf(vy, r_kin * CB, kin)
	acc = (vx - vx0) / dt
	yaw += yaw_rate * dt
	# 뒷바퀴 축 가운데의 땅 기준 속도로 옮김
	var fx := sin(yaw)
	var fz := cos(yaw)
	var vyr := vy - CB * yaw_rate
	x += (fx * vx + fz * vyr) * dt
	z += (fz * vx - fx * vyr) * dt
	spin += wf * dt
	slip = atan2(vy, maxf(absf(vx), 0.5)) if sp2 > 0.5 else 0.0
	var peak := 0.105
	understeer = clampf((absf(alpha_f) - absf(alpha_r) - 0.02) / peak, 0.0, 1.0) if sp2 > 3.0 else 0.0
	oversteer = clampf((absf(alpha_r) - absf(alpha_f) - 0.02) / peak, 0.0, 1.0) if sp2 > 3.0 else 0.0
	wheelspin = kappa_f > 0.2 and inp.thr > 0.2
	_after(inp, dt, sp2)

func _wheel(w: float, torque: float, tb: float, iw: float, h: float) -> float:
	w += torque / iw * h
	var d := tb / iw * h
	if absf(w) <= d:
		return 0.0
	return w - signf(w) * d

func _after(inp: Dictionary, dt: float, sp: float) -> void:
	var kmh := sp * 3.6
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
			want = 750.0 + inp.thr * 1500.0 * maxf(0.0, 1.0 - kmh / 25.0) + absf(wf * R) * 3.6 * KR[ag]
		elif gear == "R":
			want = 750.0 + inp.thr * 1500.0 * maxf(0.0, 1.0 - kmh / 10.0) + kmh * 120.0
		if gear != "D":
			ag = 1
		rpm += (minf(6500.0, want) - rpm) * minf(1.0, dt * 6)
	# 방향지시등은 핸들을 꺾었다가 풀면 저절로 꺼짐 (진로 변경처럼 조금만 돌면 그대로)
	if sig != 0:
		sig_yaw += yaw_rate * dt * (1.0 if sig == 1 else -1.0)
		if sig_yaw > 0.9 and absf(inp.steer) < 0.12:
			sig = 0
	# 핸들에 오는 힘 = 앞바퀴 복원 토크: 옆 힘 x 뉴매틱 트레일. 트레일은 슬립각이 커질수록 줄어
	# 최대 옆 힘 근처에서 핸들이 확 가벼워짐 (빙판, 수막현상, 앞이 밀릴 때 손으로 느끼는 신호)
	var fy := -mf(alpha_f, LAT, grip * fz_f)
	var trail := 0.045 * maxf(0.0, 1.0 - absf(alpha_f) / 0.16)
	var mz := fy * trail * signf(vx if absf(vx) > 0.1 else 1.0)
	var centre: float = -inp.steer * 0.1 * clampf(sp / 3.0, 0.0, 1.0) * maxf(grip, 0.3)
	ffb = clampf(-mz / 260.0 + centre + ffb_extra, -1.0, 1.0)
