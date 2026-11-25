# 부딪힘: 충격량으로 튕기고 돌기, 다른 차는 밀려나 미끄러짐, 가로등, 표지판, 울타리는 넘어가고, 사람은 보닛 위로 올라갔다 떨어짐.
# 유리 파편, 불꽃, 연기, 물기둥(소화전), 은행잎, 찌그러짐, 앞유리 금, 에어백, 소리, 잠깐 느려지는 순간.
# 충돌 계산: 겹친 방향(n)으로 밀어내고, n 방향 속도만 되튀김 계수(e)만큼 뒤집음. 부딪힌 점이 무게 중심에서 벗어난 만큼 돎.
class_name Crash
extends Node3D

const KEEP := {"lamp": [5.5, 0.45], "sign": [1.5, 0.12], "cone": [0.0, 0.03], "fence": [2.5, 0.25], "hydrant": [3.5, 0.35]} # [넘어가는 충격 속도 m/s, 빼앗는 속도 비율]
const MASS := {"sedan": 1300.0, "suv": 1800.0, "taxi": 1300.0, "bus": 11000.0, "mbus": 6000.0, "amb": 3500.0}

var main
var dmg := Vector4.ZERO   # 내 차 찌그러짐: 앞, 뒤, 왼, 오 (0~1)
var falls := []           # 넘어지는 사물
var flying := []          # 날아가는 사람, 라바콘
var cool := 0.0           # 같은 충돌로 결과 카드가 여러 장 나오지 않게
var card_t := -99.0
var glass_p # GPUParticles3D, 웹판은 CPUParticles3D (web_cpu)
var debris_p
var spark_p
var dust_p
var leaf_p
var smoke_p
var waters := []
var slow_left := 0.0
var t := 0.0

func setup(m) -> void:
	main = m
	var floor_c := GPUParticlesCollisionBox3D.new() # 파편이 땅에 떨어져 멈춤
	floor_c.size = Vector3(1200, 10, 1200)
	floor_c.position = Vector3(0, -5, 0)
	add_child(floor_c)
	glass_p = _ps(90, 2.5, Vector2(0.025, 0.025), Color(0.75, 0.88, 0.95, 0.85), Vector3(0, -9.8, 0), 2.5, 6.0, 0.0, true)
	debris_p = _ps(24, 3.0, Vector2(0.08, 0.05), Color(0.12, 0.12, 0.13, 1.0), Vector3(0, -9.8, 0), 2.0, 5.0, 0.0, true)
	for p: GPUParticles3D in [glass_p, debris_p]:
		var pm := p.process_material as ParticleProcessMaterial
		pm.scale_min = 0.4
		pm.scale_max = 1.2
	spark_p = _ps(50, 0.45, Vector2(0.03, 0.03), Color(1.0, 0.7, 0.25, 1.0), Vector3(0, -6.0, 0), 4.0, 9.0, 5.0, false)
	dust_p = _ps(18, 1.4, Vector2(0.8, 0.8), Color(0.6, 0.58, 0.55, 0.35), Vector3(0, 0.6, 0), 0.5, 1.6, 0.0, false)
	leaf_p = _ps(60, 3.5, Vector2(0.09, 0.09), Color(0.85, 0.65, 0.1, 1.0), Vector3(0, -1.2, 0), 0.5, 2.5, 0.0, false)
	(leaf_p.process_material as ParticleProcessMaterial).turbulence_enabled = true
	smoke_p = _ps(36, 2.6, Vector2(0.7, 0.7), Color(0.45, 0.45, 0.46, 0.4), Vector3(0, 1.4, 0), 0.3, 0.8, 0.0, false)
	smoke_p.one_shot = false
	smoke_p.explosiveness = 0.0
	smoke_p.emitting = false
	var sm := smoke_p.process_material as ParticleProcessMaterial
	sm.scale_min = 0.6
	sm.scale_max = 2.4
	var curve := CurveTexture.new()
	var c := Curve.new()
	c.add_point(Vector2(0, 0.4))
	c.add_point(Vector2(1, 1.0))
	curve.curve = c
	sm.scale_curve = curve
	glass_p = web_cpu(glass_p)
	debris_p = web_cpu(debris_p)
	spark_p = web_cpu(spark_p)
	dust_p = web_cpu(dust_p)
	leaf_p = web_cpu(leaf_p)
	smoke_p = web_cpu(smoke_p)

# 웹판: 입자 계산 셰이더(GPU)는 브라우저에서 준비하는 데 하나에 수 초에서 25초까지 걸려 화면이 멈춤 → CPU 입자로 바꿈
# (CPU 입자는 땅 충돌, 난류가 없어서 파편이 땅을 뚫고 사라지고 잎이 덜 흩날림)
static func web_cpu(p: GPUParticles3D) -> Node3D:
	if not OS.has_feature("web"):
		return p
	var c := CPUParticles3D.new()
	c.convert_from_particles(p)
	c.set_meta("n", p.amount)
	var par := p.get_parent()
	par.remove_child(p)
	p.free()
	par.add_child(c)
	return c

func _ps(n: int, life: float, size: Vector2, col: Color, grav: Vector3, v0: float, v1: float, emit: float, collide: bool) -> GPUParticles3D:
	var p := GPUParticles3D.new()
	p.amount = n
	p.lifetime = life
	p.one_shot = true
	p.explosiveness = 0.95
	p.local_coords = false
	p.emitting = false
	p.visibility_aabb = AABB(Vector3(-30, -10, -30), Vector3(60, 40, 60))
	var pm := ParticleProcessMaterial.new()
	pm.direction = Vector3(0, 1, 0)
	pm.spread = 70.0
	pm.initial_velocity_min = v0
	pm.initial_velocity_max = v1
	pm.gravity = grav
	pm.angular_velocity_min = -720.0
	pm.angular_velocity_max = 720.0
	pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	pm.emission_sphere_radius = 0.4
	if collide:
		pm.collision_mode = ParticleProcessMaterial.COLLISION_RIGID
		pm.collision_friction = 0.7
		pm.collision_bounce = 0.2
	p.process_material = pm
	var q := QuadMesh.new()
	q.size = size
	var m := StandardMaterial3D.new()
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.albedo_color = col
	m.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES
	m.vertex_color_use_as_albedo = true
	if emit > 0:
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		m.emission_enabled = true
		m.emission = col
		m.emission_energy_multiplier = emit
	elif col.a < 0.9:
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		if size.x > 0.3: # 연기, 먼지는 네모 대신 흐린 동그라미
			m.albedo_texture = Kit.soft_dot()
	else:
		m.metallic = 0.6
		m.roughness = 0.2
	q.material = m
	p.draw_pass_1 = q
	add_child(p)
	return p

func _burst(p: Node3D, at: Vector3, dir: Vector3, amount := 1.0) -> void:
	p.global_position = at
	var d := (dir + Vector3(0, 0.8, 0)).normalized()
	if p is CPUParticles3D:
		p.direction = d
		p.amount = maxi(1, roundi(int(p.get_meta("n")) * clampf(amount, 0.1, 1.0)))
	else:
		(p.process_material as ParticleProcessMaterial).direction = d
		p.amount_ratio = clampf(amount, 0.1, 1.0)
	p.restart()
	p.emitting = true

# 웹판: 효과를 처음 그릴 때 그래픽 준비로 몇 초 멈춰서, 시작 화면(가려져 있음)에서 한 번씩 미리 그려 둠
func warm(at: Vector3) -> void:
	var ps: Array = [glass_p, debris_p, spark_p, dust_p, leaf_p, smoke_p, main.splash_p]
	for p: Node3D in ps:
		_burst(p, at, Vector3.FORWARD, 0.1)
	await get_tree().create_timer(0.4).timeout
	smoke_p.emitting = false
	for p: Node3D in ps:
		p.visible = false
	await get_tree().create_timer(4.0).timeout
	for p: Node3D in ps:
		p.visible = true

# ───────── 매 걸음: 내 차가 무엇과 겹쳤는지 ─────────
func collide(dt: float) -> void:
	t += dt
	cool -= dt
	var car: Car = main.car
	var city: City = main.city
	var cb := car.box()
	for b: Dictionary in city.boxes_near(cb.x, cb.z):
		if b.get("down", false):
			continue
		var p = Kit.obb_hit(cb, b)
		if p == null:
			continue
		car.x += p.x
		car.z += p.y
		cb = car.box()
		var n := (p as Vector2).normalized()
		match b.kind:
			"parked":
				_hit_body(b, n, cb)
			"person":
				hit_person(b.node)
				city.del_box(b)
				b.down = true
			_:
				_hit_static(b, n, cb)
	for c: Dictionary in city.ai:
		if absf(c.x - cb.x) > 13 or absf(c.z - cb.z) > 13:
			continue
		var ob := {"x": c.x, "z": c.z, "hw": c.hw, "hl": c.hl, "r": c.yaw}
		var p = Kit.obb_hit(cb, ob)
		if p == null:
			continue
		car.x += p.x
		car.z += p.y
		cb = car.box()
		_hit_car(c, (p as Vector2).normalized(), cb)
	# 사람
	var ppl: Array = main.events.people()
	for p: Dictionary in city.peds:
		if p.walking:
			ppl.append(p.m)
	for w: Dictionary in city.walkers:
		if absf(w.x - cb.x) < 6 and absf(w.z - cb.z) < 6:
			ppl.append(w.m)
	for who: Node3D in ppl:
		if not is_instance_valid(who) or who.has_meta("down"):
			continue
		var dx: float = who.position.x - car.x
		var dz: float = who.position.z - car.z
		var f := dx * sin(car.yaw) + dz * cos(car.yaw)
		var l := dx * cos(car.yaw) - dz * sin(car.yaw)
		if f > -Car.RO - 0.25 and f < Car.WB + Car.FO + 0.25 and absf(l) < Car.W / 2 + 0.25 and absf(car.v) > 0.3:
			hit_person(who)

func _contact(cb: Dictionary, ox: float, oz: float) -> Vector2: # 내 차 상자에서 상대 가운데에 가장 가까운 점 (상자 가운데 기준)
	var s := sin(cb.r)
	var c := cos(cb.r)
	var dx: float = ox - cb.x
	var dz: float = oz - cb.z
	var f := clampf(dx * s + dz * c, -cb.hl, cb.hl)
	var l := clampf(dx * c - dz * s, -cb.hw, cb.hw)
	return Vector2(s * f + c * l, c * f - s * l)

func _spin(r: Vector2, J: Vector2, k2: float) -> float: # 돌림힘 → 수직축 회전 속도 변화 (왼쪽으로 도는 +)
	return (r.y * J.x - r.x * J.y) / k2

func _zone(n: Vector2, yaw: float) -> int: # n(상대 → 나)으로 내 차 어디가 부딪혔는지: 0 앞 1 뒤 2 왼 3 오
	var fwd := Vector2(sin(yaw), cos(yaw))
	var left := Vector2(cos(yaw), -sin(yaw))
	var nf := n.dot(fwd)
	if nf < -0.6:
		return 0
	if nf > 0.6:
		return 1
	return 2 if n.dot(left) < 0 else 3

func _hit_static(b: Dictionary, n: Vector2, cb: Dictionary) -> void:
	var car: Car = main.car
	var V := car.world_vel()
	var vn := V.dot(n)
	if vn >= -0.05:
		return
	var imp := -vn
	var at := Vector3(cb.x, 0.6, cb.z) + Vector3(-n.x, 0, -n.y) * 2.0
	var kind: String = b.kind
	if KEEP.has(kind) and imp > KEEP[kind][0]: # 넘어가는 것: 속도를 조금 빼앗고 쓰러뜨림
		V -= n * vn * KEEP[kind][1]
		car.set_world_vel(V, 0.0)
		_knock(b, V)
		_effects(at, imp * (0.6 if kind != "cone" else 0.2), n, kind)
		_damage(n, imp * 0.5)
		_report(imp, {"lamp": "가로등", "sign": "표지판", "cone": "라바콘", "fence": "보행자 울타리", "hydrant": "소화전"}[kind])
		return
	# 단단한 것 (건물, 기둥, 나무, 신호등): 되튀고 미끄러짐
	var e := 0.25 if kind == "bld" else 0.15
	var vt := V - n * vn
	vt *= 1.0 - 0.35 * minf(1.0, imp / 8.0)
	var nv := vt - n * vn * e
	var J := (nv - V)
	var r := _contact(cb, b.x, b.z)
	car.set_world_vel(nv, _spin(r, J, Car.IZ / Car.M) * 0.8)
	if kind == "tree":
		_shake_tree(b, imp)
	_effects(at, imp, n, kind)
	_damage(n, imp)
	if vt.length() > 3.0 and imp < 4.0: # 긁고 지나감: 불꽃
		_burst(spark_p, at, Vector3(-vt.x, 0, -vt.y).normalized(), 0.6)
		main.sfx.scrape = 0.5
	_report(imp, {"bld": "건물", "tree": "가로수", "pole": "기둥", "parked": "세워 둔 차"}.get(kind, "물체"))

# 세워 둔 차: 무게가 같은 물체로 보고 밀어냄 (밀린 차는 미끄러지다 섬)
func _hit_body(b: Dictionary, n: Vector2, cb: Dictionary) -> void:
	var car: Car = main.car
	var V := car.world_vel()
	var vn := V.dot(n)
	if vn >= -0.05:
		return
	var mp := Car.M
	var mc := 1300.0
	var jn := -(1.0 + 0.15) * vn / (1.0 / mp + 1.0 / mc)
	var nv := V + n * jn / mp
	var r := _contact(cb, b.x, b.z)
	car.set_world_vel(nv, _spin(r, n * jn / mp, Car.IZ / Car.M) * 0.8)
	var vb := -n * jn / mc
	if not b.has("vel"):
		b.vel = Vector2.ZERO
		b.w = 0.0
		main.city.del_box(b)
		b.moving = true
		falls.append({"kind": "parked", "b": b, "t": 0.0})
	b.vel += vb
	b.w += randf_range(-0.6, 0.6) * vb.length() * 0.3
	_dent(b.node, -n, float(b.r), (-vn) / 12.0)
	_effects(Vector3(cb.x, 0.6, cb.z) - Vector3(n.x, 0, n.y) * 2.0, -vn, n, "car")
	_damage(n, -vn)
	_report(-vn, "세워 둔 차")

func _hit_car(c: Dictionary, n: Vector2, cb: Dictionary) -> void:
	var car: Car = main.car
	var V := car.world_vel()
	var Vc: Vector2 = Vector2(c.wreck.vx, c.wreck.vz) if c.has("wreck") else Vector2(sin(c.yaw), cos(c.yaw)) * c.v
	var vn := (V - Vc).dot(n)
	if vn >= -0.05:
		return
	var imp := -vn
	var mp := Car.M
	var mc: float = MASS.get(c.model, 1300.0)
	var jn := -(1.0 + 0.15) * vn / (1.0 / mp + 1.0 / mc)
	var nv := V + n * jn / mp
	var r := _contact(cb, c.x, c.z)
	car.set_world_vel(nv, _spin(r, n * jn / mp, Car.IZ / Car.M) * 0.8)
	var nc := Vc - n * jn / mc
	var behind: bool = (c.x - cb.x) * sin(car.yaw) + (c.z - cb.z) * cos(car.yaw) < -2.0 and Vc.length() > V.length() # 뒤차가 와서 받은 건 운전자 잘못이 아님
	if imp > 2.0 or c.has("wreck"):
		var rc := Vector2(cb.x - c.x, cb.z - c.z).normalized() * 1.5
		var w: Dictionary = c.get("wreck", {"vx": 0.0, "vz": 0.0, "w": 0.0, "t": 0.0})
		w.vx = nc.x
		w.vz = nc.y
		w.w += _spin(rc, -n * jn / mc, (c.hl * c.hl + c.hw * c.hw) / 3.0) * 0.8
		w.t = 0.0
		c.wreck = w
		_dent(c.mesh, -n, c.yaw, imp / 12.0)
	else:
		c.v = 0.0
	_effects(Vector3(cb.x, 0.7, cb.z) - Vector3(n.x, 0, n.y) * 2.0, imp, n, "car")
	_damage(n, imp)
	if cool <= 0:
		if behind:
			main.hud.toast("뒤차가 부딪혔어요")
		elif imp > 0.5:
			main.hits.append(["차", c.kind, snappedf(c.x, 0.1), snappedf(c.z, 0.1)])
			main.events.hit_car(c)
	if not behind:
		_report(imp, {"bus": "버스", "mbus": "마을버스", "taxi": "택시", "amb": "구급차"}.get(c.model, "다른 차"))

# 다른 차 모양 찌그러뜨림 (n = 그 차에서 본 부딪힌 쪽)
func _dent(node: Node3D, n: Vector2, yaw: float, amt: float) -> void:
	if node == null or not node.has_meta("body"):
		return
	var z := _zone(-n, yaw)
	for k in ["body", "glass"]:
		var mi := node.get_meta(k) as GeometryInstance3D
		var d: Vector4 = mi.get_instance_shader_parameter("dent")
		d[z] = minf(1.0, d[z] + amt)
		mi.set_instance_shader_parameter("dent", d)

func _damage(n: Vector2, imp: float) -> void:
	if imp < 1.5:
		return
	var car: Car = main.car
	var z := _zone(n, car.yaw)
	dmg[z] = minf(1.0, dmg[z] + imp / 14.0)
	car.pull = (dmg.z - dmg.w) * 0.025 + dmg.x * 0.012
	main.set_dent(dmg)
	if z == 0 and imp > 7.0:
		main.cockpit.airbag()
	if z == 0 and imp > 9.0:
		main.cockpit.crack_at(Vector2(randf_range(0.25, 0.75), randf_range(0.3, 0.7)), clampf(imp / 14.0, 0.4, 1.0))
	smoke_p.emitting = dmg.x > 0.45

func _effects(at: Vector3, imp: float, n: Vector2, kind: String) -> void:
	var dir := Vector3(n.x, 0.2, n.y)
	main.shake = maxf(main.shake, clampf(imp / 9.0, 0.15, 1.0))
	main.cockpit.jolt(main.car_g.global_transform.basis.inverse() * Vector3(-n.x, 0, -n.y) * imp)
	main.sfx.crash(imp, kind)
	if imp > 2.0:
		_burst(debris_p, at, dir, imp / 10.0)
		_burst(dust_p, at, dir, imp / 12.0)
	if imp > 5.5 and kind != "cone":
		_burst(glass_p, at + Vector3(0, 0.4, 0), dir, imp / 12.0)
	if imp > 4.0 and (kind == "pole" or kind == "lamp" or kind == "car" or kind == "fence"):
		_burst(spark_p, at, dir, imp / 10.0)
	if imp > 8.0 and slow_left <= 0.0: # 큰 충돌: 아주 잠깐 느리게
		slow_left = 0.35
		Engine.time_scale = 0.3

func _report(imp: float, what: String) -> void:
	if imp < 3.0 or t - card_t < 4.0:
		if imp >= 0.8 and cool <= 0:
			main.hud.toast("%s에 부딪혔어요" % what if not what.ends_with("차") else "%s와 부딪혔어요" % what, "warn")
			cool = 1.0
		return
	card_t = t
	cool = 1.0
	main.hits.append(["물체", what])
	var kmh := imp * 3.6
	var h := imp * imp / (2.0 * 9.8)
	var lines := ["시속 %d km로 %s에 부딪혔어요" % [int(round(kmh)), what]]
	lines.append("%.0fm 높이(아파트 %d층쯤)에서 떨어지는 것과 같은 충격이에요" % [h, maxi(1, int(round(h / 2.8)))] if h >= 1.0 else "낮은 속도라 큰 충격은 아니었어요")
	lines.append("Backspace: 차를 고치고 가까운 길로")
	main.hud.add_result("충돌", lines, "bad")
	main.hud.toast("%s에 부딪혔어요" % what if not what.ends_with("차") else "%s와 부딪혔어요" % what, "warn")

# ───────── 사람 ─────────
func hit_person(who: Node3D) -> void:
	var car: Car = main.car
	var V := car.world_vel()
	var sp := V.length()
	who.set_meta("down", true)
	var fwd := Vector2(sin(car.yaw), cos(car.yaw))
	var st := {"node": who, "t": 0.0, "phase": "fly", "rest": false, "vel": Vector3.ZERO, "spin": Vector3.ZERO, "y0": who.rotation.y}
	for p: Dictionary in main.city.peds: # 횡단보도를 건너던 사람이면 그 칸도 같이 움직임 (다른 차가 실제로 누운 자리를 피함)
		if p.m == who:
			st.ped = p
	if sp < 2.5: # 밀려 넘어짐
		st.vel = Vector3(V.x * 1.1, 1.0, V.y * 1.1)
		st.spin = Vector3(fwd.y, 0, -fwd.x) * 3.0
	else: # 보닛 위로 올라갔다가 앞으로 떨어짐
		st.phase = "hood"
		st.vel = Vector3(V.x, 0, V.y)
		st.spin = Vector3(fwd.y, 0, -fwd.x) * sp * 0.7
	flying.append(st)
	car.set_world_vel(V * (0.93 if sp > 2.5 else 0.97), randf_range(-0.05, 0.05))
	main.shake = maxf(main.shake, clampf(sp / 10.0, 0.25, 0.8))
	main.sfx.crash(sp * 0.6, "person")
	main.cockpit.jolt(Vector3(0, 0, -sp * 0.3))
	if sp > 7.0:
		main.cockpit.crack_at(Vector2(randf_range(0.35, 0.65), randf_range(0.2, 0.45)), clampf(sp / 16.0, 0.3, 0.8))
	_dent_front(sp / 30.0)
	main.hud.toast("사람과 부딪혔어요", "warn")
	var kind := "건너던 사람" if st.has("ped") else "상황" if main.events.people().has(who) else "보도"
	main.hits.append(["사람", snappedf(who.position.x, 0.1), snappedf(who.position.z, 0.1), kind, snappedf(sp * 3.6, 1)])
	var kmh := sp * 3.6
	if not main.events.hit_person(who):
		main.hud.add_result("보행자", ["시속 %d km로 사람과 부딪혔어요" % int(round(kmh)), "횡단보도 앞, 보도 가까이, 우회전할 때는 사람이 있는지 먼저 보기", "Backspace: 차를 고치고 가까운 길로"], "bad")
		main.add_record("ped", "bad", -1.0, null)
	card_t = t

func _dent_front(a: float) -> void:
	dmg.x = minf(1.0, dmg.x + a)
	main.set_dent(dmg)

func _tick_flying(dt: float) -> void:
	var car: Car = main.car
	for st: Dictionary in flying.duplicate():
		if not is_instance_valid(st.node): # 상황이 끝나 사람이 지워졌으면
			flying.erase(st)
			continue
		var o: Node3D = st.node
		st.t += dt
		if st.has("ped"):
			st.ped.x = o.position.x
			st.ped.z = o.position.z
		if st.rest:
			if st.t > 20.0 and not st.has("cone"): # 20초 뒤 일어나 다시 걸음 (건너던 사람은 보도 끝에서 다시 기다림)
				o.remove_meta("down")
				o.rotation = Vector3(0, st.y0, 0)
				o.position.y = 0.0
				if st.has("ped"):
					var p: Dictionary = st.ped
					var e: Dictionary = p.cr.ends[p.side]
					p.walking = false
					p.x = e.x
					p.z = e.z
					p.wait = 5.0
				flying.erase(st)
			continue
		if st.phase == "hood": # 0.15초 동안 차와 함께 움직이며 보닛 높이로 올라옴
			var V := car.world_vel()
			o.position += Vector3(V.x, 0, V.y) * dt
			o.position.y = minf(0.85, o.position.y + dt * 6.0)
			o.rotate(Vector3(st.spin).normalized(), -dt * 7.0)
			if st.t > 0.15:
				st.phase = "fly"
				var sp := V.length()
				st.vel = Vector3(V.x * 0.85, 1.2 + sp * 0.1, V.y * 0.85)
			continue
		var v: Vector3 = st.vel
		v.y -= 9.8 * dt
		o.position += v * dt
		var sv: Vector3 = st.spin
		if sv.length() > 0.01:
			o.rotate(sv.normalized(), sv.length() * dt)
		if o.position.y <= 0.0 and v.y < 0:
			o.position.y = 0.0
			v.y = -v.y * 0.2 if absf(v.y) > 2.0 else 0.0
			var hv := Vector2(v.x, v.z)
			var spd := hv.length()
			hv = hv * maxf(0.0, spd - 7.0 * dt * 3.0) / spd if spd > 0.01 else Vector2.ZERO
			v.x = hv.x
			v.z = hv.y
			st.spin = sv * 0.85
			if spd < 0.3 and absf(v.y) < 0.01:
				st.rest = true
				st.t = 0.0
				var ny: float = st.y0
				o.rotation = Vector3(-PI / 2, ny, 0) # 누운 채로
				o.position.y = 0.15
				if o.has_meta("legs"):
					Models.walk_pose(o, 0.0)
		st.vel = v

# ───────── 넘어지는 사물 ─────────
func _knock(b: Dictionary, V: Vector2) -> void:
	var city: City = main.city
	city.del_box(b)
	b.down = true
	var dir := V.normalized() if V.length() > 0.1 else Vector2(1, 0)
	var axis := Vector3(dir.y, 0, -dir.x) # 넘어지는 쪽으로 도는 축
	var f := {"kind": b.kind, "b": b, "t": 0.0, "ang": 0.0, "w": 0.6 + V.length() * 0.12, "axis": axis}
	match b.kind:
		"cone":
			var cone: Node3D = b.node
			flying.append({"node": cone, "t": 0.0, "phase": "fly", "rest": false, "vel": Vector3(V.x * 1.3, 2.5, V.y * 1.3), "spin": axis * 9.0, "y0": 0.0, "cone": true})
			return
		"hydrant":
			var tr: Transform3D = b.t0[0]
			(b.mm[0] as MultiMesh).set_instance_transform(b.idx, Transform3D(Basis.from_scale(Vector3(1, 0.25, 1)), tr.origin - Vector3(0, 0.3, 0)))
			_water(tr.origin)
			return
		"lamp":
			city.lamps[b.idx].dead = true
			f.L = 8.0
		"sign":
			var nd: Node3D = b.node
			f.basis0 = nd.basis
			f.L = 2.4
		"fence":
			f.L = 0.9
			f.ang_max = PI / 2 - 0.05
	falls.append(f)

func _tick_falls(dt: float) -> void:
	for f: Dictionary in falls.duplicate():
		f.t += dt
		var b: Dictionary = f.b
		if f.kind == "parked": # 밀린 차: 미끄러지다 섬
			var v: Vector2 = b.vel
			var sp := v.length()
			v = v * maxf(0.0, sp - 7.0 * dt) / sp if sp > 0.01 else Vector2.ZERO
			b.vel = v
			b.x += v.x * dt
			b.z += v.y * dt
			b.r = float(b.r) + float(b.w) * dt
			b.w = float(b.w) * exp(-dt * 2.5)
			var nd: Node3D = b.node
			nd.position = Vector3(b.x, 0, b.z)
			nd.rotation.y = b.r
			if sp < 0.05:
				main.city.add_box(b)
				b.erase("vel")
				falls.erase(f)
			continue
		if f.kind == "tree":
			var k: float = exp(-f.t * 3.0) * sin(f.t * 18.0) * f.amp
			var tr: Transform3D = b.t0[0]
			(b.mm[0] as MultiMesh).set_instance_transform(b.idx, Transform3D(Basis(f.axis, k) * tr.basis, tr.origin + Vector3(k * 0.8, 0, 0)))
			if f.t > 2.0:
				(b.mm[0] as MultiMesh).set_instance_transform(b.idx, tr)
				falls.erase(f)
			continue
		# 넘어감: 바닥 축을 중심으로 중력에 끌려 빨라짐 (막대가 넘어질 때 각가속도 = 1.5 g / 길이 x sin)
		var mx: float = f.get("ang_max", 1.5)
		f.w = float(f.w) + 1.5 * 9.8 / float(f.L) * sin(maxf(float(f.ang), 0.05)) * dt
		f.ang = minf(mx, float(f.ang) + float(f.w) * dt)
		if f.ang >= mx:
			f.w = -float(f.w) * 0.15 if absf(float(f.w)) > 0.5 else 0.0
		var rot := Basis(f.axis, f.ang)
		match f.kind:
			"lamp":
				var base: Vector3 = b.base
				for i in 3:
					var t0: Transform3D = b.t0[i]
					var tt := Transform3D(rot, base) * Transform3D(Basis(), -base) * t0
					(b.mm[i] as MultiMesh).set_instance_transform(b.idx, tt)
			"sign":
				var nd: Node3D = b.node
				if is_instance_valid(nd):
					nd.basis = rot * (f.basis0 as Basis)
			"fence":
				var t0: Transform3D = b.t0[0]
				var base := Vector3(t0.origin.x, 0.12, t0.origin.z)
				(b.mm[0] as MultiMesh).set_instance_transform(b.idx, Transform3D(rot, base) * Transform3D(Basis(), -base) * t0)
		if f.t > 4.0 and absf(float(f.w)) < 0.01:
			falls.erase(f)

func _shake_tree(b: Dictionary, imp: float) -> void:
	var V: Vector2 = main.car.world_vel()
	var axis := Vector3(1, 0, 0) if V.length() < 0.1 else Vector3(V.normalized().y, 0, -V.normalized().x)
	falls.append({"kind": "tree", "b": b, "t": 0.0, "amp": clampf(imp * 0.03, 0.03, 0.25), "axis": axis})
	var tr: Transform3D = b.t0[0]
	_burst(leaf_p, tr.origin + Vector3(0, 1.0, 0), Vector3(0, 0.3, 0), imp / 8.0)

func _water(at: Vector3) -> void: # 소화전이 부러지면 물기둥
	var w = _ps(220, 1.6, Vector2(0.08, 0.3), Color(0.8, 0.88, 0.95, 0.6), Vector3(0, -9.8, 0), 9.0, 12.0, 0.0, false)
	w.one_shot = false
	w.global_position = at
	w = web_cpu(w)
	w.explosiveness = 0.0
	var pm := w.process_material as ParticleProcessMaterial
	pm.spread = 8.0
	pm.emission_sphere_radius = 0.08
	w.global_position = at + Vector3(0, 0.2, 0)
	w.emitting = true
	waters.append([w, 14.0])
	main.sfx.water = 1.0

func tick(dt: float, real_dt: float) -> void:
	_tick_flying(dt)
	_tick_falls(dt)
	if slow_left > 0.0:
		slow_left -= real_dt
		if slow_left <= 0.0:
			Engine.time_scale = 1.0
	for w: Array in waters.duplicate():
		w[1] -= dt
		if w[1] <= 0:
			w[0].emitting = false
			if w[1] < -2:
				(w[0] as Node).queue_free()
				waters.erase(w)
	main.sfx.water = 0.0 if waters.is_empty() else 0.6
	var hood: Vector3 = main.car_g.to_global(Vector3(0, 0.95, Car.WB + 0.4))
	smoke_p.global_position = hood

func repair() -> void:
	dmg = Vector4.ZERO
	main.car.pull = 0.0
	smoke_p.emitting = false
	main.set_dent(dmg)
	main.cockpit.crack_at(Vector2.ZERO, 0.0)
