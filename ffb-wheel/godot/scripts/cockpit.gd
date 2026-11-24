# 운전석 (1인칭): 계기판(바늘), 앞기둥, 지붕, 문, 좌석, 손과 팔, 실내 거울, 사이드미러(따로 비춤), 앞유리 빗방울과 와이퍼, 금, 에어백.
# 의자 높이, 앞뒤, 등받이를 바꾸면 눈 위치가 바뀌어 보닛과 길이 보이는 정도가 달라짐.
# 고개: 마우스로 돌려 옆과 사각지대를 봄 (간단 조작일 때만). 1초 동안 마우스를 안 움직이면 천천히 앞으로 돌아옴.
# 몸: 브레이크를 밟으면 앞으로, 커브에서는 바깥으로 쏠리고, 부딪히면 튕김 (스프링)
# 좌표: 차 몸체 가운데 기준 (+Z 앞, +X 왼쪽). 운전석은 왼쪽 x = +0.37
class_name Cockpit
extends Node3D

const EYE := Vector3(0.37, 1.16, -0.32)
const SEAT_LIM := {"h": [-0.07, 0.09], "f": [-0.12, 0.12], "r": [-5.0, 12.0]}
const WS_BASE := [Vector3(0.81, 0.995, 1.17), Vector3(-0.81, 0.995, 1.17)] # 앞유리 아래 왼, 오
const WS_TOP := [Vector3(0.66, 1.44, 0.33), Vector3(-0.66, 1.44, 0.33)]

var main
var body: Node3D
var inside: Node3D
var seat := {"h": 0.0, "f": 0.0, "r": 0.0}
var seat_cur := {"h": 0.0, "f": 0.0, "r": 0.0}
var look := Vector2.ZERO        # x 좌우(왼쪽 +), y 위아래(위 +)
var look_idle := 0.0
var head := Vector3.ZERO
var head_v := Vector3.ZERO
var bump_t := 0.0
var ws_mat: ShaderMaterial
var wiper_on := false
var wiper_auto := true
var ph := 0.0
var off_t := 99.0
var wipers := []
var needles := []
var spd_label: Label3D
var gear_label: Label3D
var road_label: Label3D
var hands := []
var arms := []
var bag: MeshInstance3D
var bag_t := -1.0
var crack := 0.0
var side_cams := []
var side_vps := []
var mirror_q: MeshInstance3D
var turn := 0
var ws_node: MeshInstance3D

func build(b: Node3D, m) -> void:
	main = m
	body = b
	inside = Node3D.new()
	body.add_child(inside)
	var dark := Kit.mat(Color(0.1, 0.1, 0.11), 0.75)
	var mid := Kit.mat(Color(0.17, 0.17, 0.18), 0.8)
	var cloth := Kit.mat(Color(0.62, 0.6, 0.56), 0.95)
	var seatm := Kit.mat(Color(0.14, 0.14, 0.15), 0.9)
	_b(Vector3(1.64, 0.22, 0.62), Vector3(0, 0.83, 0.88), dark)        # 대시보드
	_b(Vector3(1.6, 0.04, 0.5), Vector3(0, 0.95, 0.92), mid).rotation.x = 0.1
	_b(Vector3(0.5, 0.08, 0.2), Vector3(0.37, 0.985, 0.72), dark)      # 계기판 덮개
	_b(Vector3(0.3, 0.42, 0.5), Vector3(0, 0.62, 0.62), mid)           # 가운데 콘솔
	_b(Vector3(1.62, 0.03, 2.9), Vector3(0, 0.33, -0.2), seatm)        # 바닥
	_b(Vector3(1.44, 0.03, 1.5), Vector3(0, 1.43, -0.42), cloth)       # 지붕 안감 (앞유리 위 끝까지)
	for s in [1.0, -1.0]:
		_beam(Vector3(s * 0.8, 0.98, 1.12), Vector3(s * 0.67, 1.43, 0.34), 0.09, mid) # 앞기둥
		_b(Vector3(0.07, 0.48, 0.12), Vector3(s * 0.83, 1.19, -0.42), mid)          # 가운데 기둥 (운전자 어깨 옆)
		_beam(Vector3(s * 0.84, 0.97, -1.15), Vector3(s * 0.7, 1.41, -0.66), 0.2, mid) # 뒤 기둥
		_b(Vector3(0.07, 0.5, 2.1), Vector3(s * 0.86, 0.72, -0.15), mid)            # 문 안쪽
		_b(Vector3(0.12, 0.04, 1.9), Vector3(s * 0.82, 0.96, -0.12), dark)          # 창틀
		_b(Vector3(0.34, 0.015, 0.16), Vector3(s * 0.37, 1.41, 0.2), cloth) # 햇빛 가리개 (접어 올린 채)
	# 좌석 (조수석, 뒷좌석. 운전석 등받이는 뒤를 돌아볼 때 보임)
	for x in [0.37, -0.37]:
		_b(Vector3(0.5, 0.14, 0.52), Vector3(x, 0.5, -0.32), seatm)
		var bk := _b(Vector3(0.5, 0.68, 0.12), Vector3(x, 0.88, -0.66), seatm)
		bk.rotation.x = -0.2
		_b(Vector3(0.26, 0.2, 0.1), Vector3(x, 1.32, -0.76), seatm)
	_b(Vector3(1.42, 0.16, 0.5), Vector3(0, 0.5, -1.2), seatm)
	_b(Vector3(1.42, 0.62, 0.12), Vector3(0, 0.84, -1.48), seatm).rotation.x = -0.25
	# 계기판: 속도계, 회전계 바늘 + 숫자
	for i in 2:
		var g := Node3D.new()
		g.position = Vector3(0.37 + (0.095 if i == 0 else -0.095), 0.935, 0.615)
		g.rotation.x = -0.25
		inside.add_child(g)
		var disc := Kit.cyl(g, 0.072, 0.01, Vector3.ZERO, Kit.mat(Color(0.03, 0.03, 0.04), 0.4), 24)
		disc.rotation.x = PI / 2
		var ring := Kit.cyl(g, 0.075, 0.006, Vector3(0, 0, -0.001), Kit.mat(Color(0.55, 0.6, 0.65), 0.3, 0.0, 0.8), 24)
		ring.rotation.x = PI / 2
		for k in 9: # 눈금
			var a := deg_to_rad(-120.0 + k * 30.0)
			var tk := Kit.box(g, Vector3(0.004, 0.012, 0.002), Vector3(-sin(a) * 0.06, cos(a) * 0.06, -0.007), Kit.mat(Color(0.9, 0.9, 0.9), 0.5, 1.0), false)
			tk.rotation.z = a
		var piv := Node3D.new()
		piv.position = Vector3(0, 0, -0.008)
		g.add_child(piv)
		Kit.box(piv, Vector3(0.004, 0.058, 0.002), Vector3(0, 0.027, 0), Kit.mat(Color(1.0, 0.35, 0.1), 0.4, 2.5), false)
		needles.append(piv)
	spd_label = Kit.label3d(inside, "0", Vector3(0.465, 0.905, 0.6), 64, Color(0.95, 0.95, 0.95))
	gear_label = Kit.label3d(inside, "D", Vector3(0.37, 0.93, 0.605), 48, Color(0.4, 0.85, 1.0))
	for l: Label3D in [spd_label, gear_label]:
		l.pixel_size = 0.00028
		l.shaded = false
		l.rotation = Vector3(0.25, PI, 0)
	# 가운데 화면: 지금 길 이름
	var scr := _b(Vector3(0.26, 0.15, 0.02), Vector3(0, 1.05, 0.77), Kit.mat(Color(0.04, 0.06, 0.1), 0.2, 0.3))
	scr.rotation.x = -0.2
	road_label = Kit.label3d(inside, "", Vector3(0, 1.05, 0.758), 48, Color(0.85, 0.92, 1.0))
	road_label.pixel_size = 0.0007
	road_label.shaded = false
	road_label.rotation = Vector3(0.2, PI, 0)
	# 실내 거울 (뒷거울 화면을 붙임)
	_b(Vector3(0.02, 0.08, 0.02), Vector3(0, 1.40, 0.31), dark)
	var mb := _b(Vector3(0.29, 0.085, 0.025), Vector3(0, 1.335, 0.30), dark)
	mb.basis = Basis.looking_at(mb.position - EYE, Vector3.UP)
	mirror_q = MeshInstance3D.new()
	var qm := QuadMesh.new()
	qm.size = Vector2(0.27, 0.07)
	mirror_q.mesh = qm
	mirror_q.position = Vector3(0, 1.335, 0.284)
	inside.add_child(mirror_q)
	mirror_q.basis = Basis.looking_at(mirror_q.position - EYE, Vector3.UP)
	# 손과 팔 (손은 핸들과 함께 돎)
	var skin := Kit.mat(Color(0.84, 0.68, 0.56), 0.7)
	var sleeve := Kit.mat(Color(0.16, 0.18, 0.24), 0.9)
	for s in [1.0, -1.0]:
		var hs := SphereMesh.new()
		hs.radius = 0.042
		hs.height = 0.07
		var h := MeshInstance3D.new()
		h.mesh = hs
		h.material_override = skin
		h.position = Vector3(s * 0.175, 0.02, -0.01)
		main.wheel_m.add_child(h)
		hands.append(h)
		var arm := Kit.box(inside, Vector3(0.055, 0.055, 1.0), Vector3.ZERO, sleeve, false)
		arms.append(arm)
	# 에어백
	bag = MeshInstance3D.new()
	var bs := SphereMesh.new()
	bs.radius = 0.3
	bs.height = 0.5
	bag.mesh = bs
	bag.material_override = Kit.mat(Color(0.97, 0.97, 0.95), 0.95)
	bag.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	bag.position = Vector3(0.37, 0.98, 0.3)
	bag.visible = false
	body.add_child(bag)
	_windshield()
	_side_mirrors()
	_layer(inside, 4)

func _b(size: Vector3, pos: Vector3, m: Material) -> MeshInstance3D:
	return Kit.box(inside, size, pos, m, false)

func _beam(a: Vector3, b: Vector3, w: float, m: Material) -> void:
	var mi := Kit.box(inside, Vector3(w, w, a.distance_to(b)), (a + b) / 2, m, false)
	mi.basis = Basis.looking_at(b - a, Vector3.UP)

func _layer(n: Node, l: int) -> void:
	if n is VisualInstance3D:
		(n as VisualInstance3D).layers = l
	for c in n.get_children():
		_layer(c, l)

func _windshield() -> void:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var inward := Vector3(0, -0.88, -0.47) * 0.012
	var p := [WS_BASE[0] + inward, WS_BASE[1] + inward, WS_TOP[1] + inward, WS_TOP[0] + inward]
	var uv := [Vector2(0, 0), Vector2(1, 0), Vector2(1, 1), Vector2(0, 1)]
	for t in [[0, 1, 2], [0, 2, 3]]:
		for k in t:
			st.set_uv(uv[k])
			st.set_normal(Vector3(0, 0.88, 0.47))
			st.add_vertex(p[k])
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	ws_mat = ShaderMaterial.new()
	ws_mat.shader = load("res://shaders/windshield.gdshader")
	mi.material_override = ws_mat
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	inside.add_child(mi)
	ws_node = mi
	# 와이퍼: 앞유리 아래에서 오른쪽(조수석 쪽)을 향해 쉬고, 위로 부채꼴로 닦음
	var up := (WS_TOP[0] - WS_BASE[0]).normalized()
	up = Vector3(0, up.y, up.z).normalized()
	var xa := Vector3(-1, 0, 0)
	var za := xa.cross(up)
	var bas := Basis(xa, up, za)
	for e in [[0.22, 0.62], [0.56, 0.56]]:
		var px: float = lerpf(0.81, -0.81, e[0])
		var piv := Node3D.new()
		piv.position = Vector3(px, 1.0, 1.165) + za * 0.02
		piv.basis = bas
		body.add_child(piv)
		var arm := Kit.box(piv, Vector3(e[1], 0.018, 0.02), Vector3(e[1] / 2, 0.01, 0.0), Kit.mat(Color(0.05, 0.05, 0.05), 0.6), false)
		arm.layers = 2
		wipers.append([piv, bas])

func _side_mirrors() -> void:
	for s in [1.0, -1.0]:
		var vp := SubViewport.new()
		vp.size = Vector2i(256, 160)
		vp.world_3d = main.get_viewport().world_3d
		vp.render_target_update_mode = SubViewport.UPDATE_DISABLED
		main.add_child(vp)
		var c := Camera3D.new()
		c.fov = 28.0
		c.near = 0.2
		c.far = 140.0
		c.cull_mask = 0xFFFFF & ~4
		vp.add_child(c)
		c.current = true
		side_cams.append(c)
		side_vps.append(vp)
		var q := MeshInstance3D.new()
		var qm := QuadMesh.new()
		qm.size = Vector2(0.16, 0.105)
		q.mesh = qm
		q.position = Vector3(s * 1.0, 1.02, 1.0)
		var m := StandardMaterial3D.new()
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		m.albedo_texture = vp.get_texture()
		m.uv1_scale = Vector3(-1, 1, 1)
		m.uv1_offset = Vector3(1, 0, 0)
		q.material_override = m
		body.add_child(q)
		q.basis = Basis.looking_at(q.position - (EYE + Vector3(0, 0, 0.1)), Vector3.UP)
		q.layers = 4

func set_mirror_texture(tex: Texture2D) -> void:
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.albedo_texture = tex
	m.uv1_scale = Vector3(-1, 1, 1)
	m.uv1_offset = Vector3(1, 0, 0)
	mirror_q.material_override = m

# ───────── 조작 ─────────
func look_by(rel: Vector2) -> void:
	look.x = clampf(look.x - rel.x * 0.0032, -1.9, 1.9)
	look.y = clampf(look.y - rel.y * 0.0028, -0.6, 0.45)
	look_idle = 0.0

func seat_by(k: String, d: float) -> void:
	var lim: Array = SEAT_LIM[k]
	seat[k] = clampf(float(seat[k]) + d, lim[0], lim[1])

func jolt(v: Vector3) -> void: # 부딪힌 쪽으로 머리가 쏠림 (차 기준 방향, 크기 = 충격 속도)
	head_v += v.limit_length(14.0) * 0.07

func airbag() -> void:
	if bag_t < 0.0 or bag_t > 3.0:
		bag_t = 0.0
		bag.visible = true
		main.sfx.crash(9.0, "airbag")

func crack_at(uv: Vector2, amt: float) -> void:
	crack = maxf(crack, amt) if amt > 0 else 0.0
	ws_mat.set_shader_parameter("crack", crack)
	if amt > 0:
		ws_mat.set_shader_parameter("crack_uv", uv)

# 카메라 자리 (땅 좌표)
func cam_xform() -> Transform3D:
	var r: float = seat_cur.r
	var e := EYE + Vector3(0, float(seat_cur.h) - r * 0.0025, float(seat_cur.f) - r * 0.006)
	e += Vector3(sin(look.x) * 0.1, 0, (1.0 - cos(look.x)) * 0.06 - absf(sin(look.x)) * 0.03) # 고개를 돌리면 몸도 조금 돌아감
	e += head
	var b := Basis(Vector3.UP, PI) * Basis(Vector3.UP, look.x) * Basis(Vector3.RIGHT, look.y + deg_to_rad(r) * 0.25)
	return body.global_transform * Transform3D(b, e)

func tick(dt: float, view: int) -> void:
	var car: Car = main.car
	inside.visible = view == 1
	# 의자는 모터처럼 천천히
	var moving := false
	for k in seat:
		var to: float = seat[k]
		var cur: float = seat_cur[k]
		var sp := 0.05 if k != "r" else 6.0
		var nv := move_toward(cur, to, sp * dt)
		if nv != cur:
			moving = true
		seat_cur[k] = nv
	main.sfx.motor = 0.5 if moving else 0.0
	look_idle += dt
	if look_idle > 1.0:
		look = look.lerp(Vector2.ZERO, 1.0 - exp(-dt * 3.0))
	# 몸 쏠림: 앞뒤 가속, 옆 가속(커브), 노면
	var ay := car.vx * car.yaw_rate
	var target := Vector3(clampf(-ay * 0.005, -0.06, 0.06), 0, clampf(-car.acc * 0.006, -0.05, 0.07))
	bump_t += dt * clampf(absf(car.v) / 3.0, 0.0, 6.0)
	target.y = sin(bump_t * 2.3) * 0.002 + sin(bump_t * 5.1) * 0.001 + absf(car.ffb_extra) * 0.02
	head_v += ((target - head) * 70.0 - head_v * 10.0) * dt
	head += head_v * dt
	head = head.limit_length(0.25)
	# 계기판
	var kmh := absf(car.v) * 3.6
	(needles[0] as Node3D).rotation.z = deg_to_rad(-120.0) + clampf(kmh / 160.0, 0.0, 1.0) * deg_to_rad(240.0)
	(needles[1] as Node3D).rotation.z = deg_to_rad(-120.0) + clampf(car.rpm / 8000.0, 0.0, 1.0) * deg_to_rad(240.0)
	spd_label.text = str(int(round(kmh)))
	gear_label.text = car.gear if not main.simple else ("R" if car.gear == "R" else "D")
	# 팔: 어깨 쪽(팔꿈치)에서 손까지
	for i in 2:
		var hand: Node3D = hands[i]
		var hp := body.to_local(hand.global_position)
		var elbow := Vector3(0.37 + (0.24 if i == 0 else -0.24), 0.72, -0.14) + Vector3(0, float(seat_cur.h), float(seat_cur.f))
		var arm: MeshInstance3D = arms[i]
		arm.position = (hp + elbow) / 2
		arm.basis = Basis.looking_at(hp - elbow, Vector3.UP) * Basis.from_scale(Vector3(1, 1, hp.distance_to(elbow)))
	# 에어백: 0.04초에 다 부풀고, 2초 동안 쭈그러듦
	if bag_t >= 0.0: # 0.03초에 부풀고 0.1초 뒤부터 바람이 빠져 핸들 위에 늘어짐
		bag_t += dt
		var k := clampf(bag_t / 0.03, 0.0, 1.0) * (1.0 - clampf((bag_t - 0.1) / 0.5, 0.0, 0.75))
		bag.scale = Vector3(1.0, 0.9, 0.8) * maxf(k, 0.05)
		bag.position = Vector3(0.37, 0.98 - (1.0 - k) * 0.12, 0.3 + (1.0 - k) * 0.06)
		if bag_t > 30.0:
			bag.visible = false
			bag_t = -1.0
	# 와이퍼 (비나 눈이 오면 저절로 켜짐, V로 켜고 끔)
	var wet: bool = main.weather.kind != "clear"
	var on := wiper_on if not wiper_auto else wet
	if on or ph > 0.0:
		ph += dt * TAU / 1.4
		if ph >= TAU:
			ph = 0.0 if not on else ph - TAU
			main.sfx.tick_click()
		off_t = 0.0 if on else off_t
	if not on and ph == 0.0:
		off_t += dt
	var ang := 1.65 * 0.5 * (1.0 - cos(ph))
	for w: Array in wipers:
		(w[0] as Node3D).basis = (w[1] as Basis) * Basis(Vector3(0, 0, 1), ang)
	ws_node.visible = main.weather.kind != "clear" or crack > 0.0 # 맑고 금도 없으면 그리지 않음 (뒤 화면을 읽느라 무거움)
	ws_mat.set_shader_parameter("rain", 1.0 if main.weather.kind == "rain" else 0.0)
	ws_mat.set_shader_parameter("snow", 1.0 if main.weather.kind == "snow" else 0.0)
	ws_mat.set_shader_parameter("ph", ph)
	ws_mat.set_shader_parameter("off_t", off_t)
	ws_mat.set_shader_parameter("fill", 2.2 if main.weather.kind == "rain" else 4.0)
	# 사이드미러: 1인칭일 때만, 두 화면에 한 번씩 번갈아
	turn += 1
	for i in 2:
		var c: Camera3D = side_cams[i]
		var s := 1.0 if i == 0 else -1.0
		c.global_position = body.to_global(Vector3(s * 1.02, 1.02, 0.95))
		c.look_at(body.to_global(Vector3(s * 2.2, 0.85, -14.0)), Vector3.UP)
		(side_vps[i] as SubViewport).render_target_update_mode = SubViewport.UPDATE_ONCE if view == 1 and turn % 6 == i * 3 else SubViewport.UPDATE_DISABLED
	if turn % 15 == 0:
		var q = main.city.road_at(car.x, car.z)
		road_label.text = _road_name(q)

func _road_name(q) -> String:
	if q == null:
		return ""
	var r: Dictionary = q.r
	var T: Dictionary = main.city.T
	if r.type == "main":
		return T.ew if r.d0 == "E" or r.d0 == "W" else T.ns
	return {"ring": "순환로", "side": "옆길", "alley": "이면도로", "dong": "동네길"}.get(r.type, "")
