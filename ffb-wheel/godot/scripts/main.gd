# 운전 연습 (Godot판): 웹판 도시 주행을 옮기고 날씨, 돌발 상황, 핸들에 오는 힘을 더함.
# 목적 (팀 발표): 도로에 나가기 전, 누구나 안전하게 운전을 연습할 수 있도록 — 초보, 고령 운전자의 핸들 감각과 당황하기 쉬운 상황.
# 물리는 1초에 120번(_physics_process), 입력은 read_keys 한 곳에서 {steer, thr, brk}로 모임 → 레이싱 휠을 붙일 때 여기만 바꾸면 됨
extends Node3D

var city: City
var car: Car
var weather: Weather
var events: Events
var hud: Hud
var sfx: Sfx
var cam: Camera3D
var car_g: Node3D
var wheels_m := []
var steer_hubs := []
var wheel_m: Node3D
var lamps := {}
var outside := []
var head_spot: SpotLight3D
var splash_p: GPUParticles3D
var splash_t := 0.0
var inp := {"steer": 0.0, "thr": 0.0, "brk": 0.0}
var hold_u := 0.0
var hold_d := 0.0
var simple := true
var view := 0
var sim_t := 0.0
var paused := true
var shake := 0.0
var crash_t := 0.0
var cam_pos := Vector3.ZERO
var look := Vector3.ZERO
var first := true
var blink_was := false
var roll := 0.0
var bot := Callable()     # 시험용: 키보드 대신 입력을 채우는 함수
var knocked := {}
var mirror_cam: Camera3D
var mirror_tick := false
var frame_slow := 0.0
var adapt_wait := 6.0      # 시작, 날씨 바꾼 직후엔 셰이더를 만드느라 끊기니 재지 않음
var hits := []
var allow := 1.5           # 반응 여유 (초): 상황이 일어나는 거리
var record := []           # 연습 기록 (user://practice.json)
var save_ok := true
var drive_t := 0.0         # 이번에 운전한 시간 (쉬라는 알림)
var sess := {"over": 0, "follow": 0.0, "short": 0.0}
var over_t := 0.0
var over_said := -99.0
var gap_s := -1.0
var gap_need := 2.0
var eff_lim := 30.0
var lim_t := 0.0            # 시험에서 읽음: 부딪힌 것

func _ready() -> void:
	city = City.new()
	add_child(city)
	city.build()
	weather = Weather.new()
	add_child(weather)
	weather.setup(city)
	car = Car.new(city.start.x, city.start.z, city.start.yaw)
	car.belt = true
	_build_car()
	cam = Camera3D.new()
	cam.near = 0.05
	cam.far = 700.0
	add_child(cam)
	cam.make_current()
	_build_splash()
	# 뒷거울: 같은 세상을 작은 화면에 뒤로 비춤 (내 차 모양은 2번 층이라 안 보이게)
	var mv := SubViewport.new()
	mv.size = Vector2i(512, 128)
	mv.world_3d = get_viewport().world_3d
	mv.render_target_update_mode = SubViewport.UPDATE_ONCE
	add_child(mv)
	mirror_cam = Camera3D.new()
	mirror_cam.fov = 42.0
	mirror_cam.near = 0.3
	mirror_cam.far = 160.0
	mirror_cam.cull_mask = 0xFFFFF & ~2
	mv.add_child(mirror_cam)
	mirror_cam.current = true
	_layer(car_g)
	sfx = Sfx.new()
	add_child(sfx)
	events = Events.new()
	events.main = self
	add_child(events)
	hud = Hud.new()
	add_child(hud)
	hud.cb = {
		"weather": func(k: String) -> void: set_weather(k, weather.fog, weather.night),
		"fog": func(on: bool) -> void: set_weather(weather.kind, on, weather.night),
		"night": func(on: bool) -> void: set_weather(weather.kind, weather.fog, on),
		"sit": func(id: String, on: bool) -> void: events.set_on(id, on),
		"trigger": func(id: String) -> void: _trigger(id),
		"simple": func(on: bool) -> void: set_simple(on),
		"close": func() -> void: set_paused(false),
		"allow": func(a: float) -> void: _set_allow(a),
	}
	save_ok = not OS.get_cmdline_user_args().has("mute") # 시험 중엔 기록을 남기지 않음
	_load_record()
	hud.set_allow(allow)
	set_simple(true)
	set_paused(true)
	hud.mirror.texture = mv.get_texture()

func _layer(n: Node) -> void:
	if n is VisualInstance3D:
		(n as VisualInstance3D).layers = 2
	for c in n.get_children():
		_layer(c)

func set_weather(kind: String, fog: bool, night: bool) -> void:
	weather.kind = kind
	weather.fog = fog
	weather.night = night
	weather.apply()
	adapt_wait = 3.0
	hud.set_weather_ui(kind, fog, night)
	if night and car.lights == 0:
		car.lights = 1 # 밤으로 바꾸면 전조등을 켜 둠 (F로 끄고 켜기, 한 번 더 누르면 상향등)

func set_simple(on: bool) -> void: # 간단 조작: 기어, 시동, 주차 브레이크를 저절로
	simple = on
	car.auto = on
	if on:
		car.gear = "R" if car.gear == "R" else "D"
		car.pb = false
		car.engine = true
	hud.set_simple(on)

func set_paused(on: bool) -> void:
	paused = on
	hud.show_panel(on)
	if on:
		hud.set_record_text(record_summary())

func _set_allow(a: float) -> void:
	allow = a
	_save_record()

# ───────── 연습 기록: 상황마다 횟수, 안전하게 지난 비율, 미리 줄인 비율, 반응 시간이 처음보다 나아졌는지 ─────────
func _load_record() -> void:
	if not FileAccess.file_exists("user://practice.json"):
		return
	var d = JSON.parse_string(FileAccess.get_file_as_string("user://practice.json"))
	if d is Dictionary:
		record = d.get("rec", [])
		allow = float(d.get("allow", 1.5))

func _save_record() -> void:
	if not save_ok:
		return
	var f := FileAccess.open("user://practice.json", FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify({"allow": allow, "rec": record}))

func add_record(id: String, level: String, react: float, antic) -> void:
	record.append({"t": int(Time.get_unix_time_from_system()), "id": id, "lv": level, "re": snappedf(react, 0.01), "an": antic, "w": weather.label(), "al": allow})
	_save_record()

func record_summary() -> String:
	var lines := []
	var now := int(Time.get_unix_time_from_system())
	var today := 0
	for r: Dictionary in record:
		if now - int(r.t) < 12 * 3600:
			today += 1
	if record.is_empty():
		lines.append("아직 기록이 없어요. 상황을 켜고 달려 보세요.")
	else:
		lines.append("모두 %d번 (오늘 %d번)" % [record.size(), today])
	for e: Dictionary in Events.LIST:
		var rs := record.filter(func(r): return r.id == e.id)
		if rs.is_empty():
			continue
		var bad := rs.filter(func(r): return r.lv == "bad").size()
		var t := "%s  %d번, 위험했던 때 %d번" % [e.name, rs.size(), bad]
		var an := rs.filter(func(r): return r.an != null)
		if not an.is_empty():
			t += ", 미리 줄임 %d%%" % int(100.0 * an.filter(func(r): return r.an == true).size() / an.size())
		var re := rs.filter(func(r): return float(r.re) > 0.0)
		if re.size() >= 4: # 처음 몇 번과 최근 몇 번의 반응 시간
			var k := mini(5, re.size() / 2)
			var a := 0.0
			var b := 0.0
			for i in k:
				a += float(re[i].re)
				b += float(re[re.size() - 1 - i].re)
			t += ", 반응 %.1f초 → %.1f초" % [a / k, b / k]
		lines.append(t)
	lines.append("이번 연습 %d분, 날씨 기준 과속 %d번, 앞차를 너무 가까이 따라간 시간 %d%%" % [int(drive_t / 60), sess.over, int(100.0 * sess.short / maxf(1.0, sess.follow))])
	return "
".join(lines)

# 단서가 나타난 순간 사진 + 봤어야 할 곳 (화면 좌표 0~1)
func snapshot(p: Vector3, text: String):
	if DisplayServer.get_name() == "headless" or cam.is_position_behind(p):
		return null
	var img := get_viewport().get_texture().get_image()
	if img == null or img.is_empty():
		return null
	var vr := get_viewport().get_visible_rect().size
	var m := cam.unproject_position(p) * Vector2(img.get_width(), img.get_height()) / vr
	var cw := int(img.get_width() * 0.4)
	var ch := int(cw * 9.0 / 16.0)
	var cx := clampi(int(m.x), cw / 2, img.get_width() - cw / 2)
	var cy := clampi(int(m.y - ch * 0.1), int(img.get_height() * 0.13) + ch / 2, int(img.get_height() * 0.9) - ch / 2) # 뒷거울과 계기판은 빼고
	var rect := Rect2i(cx - cw / 2, cy - ch / 2, cw, ch)
	var part := img.get_region(rect)
	part.resize(384, 216, Image.INTERPOLATE_BILINEAR)
	return {"tex": ImageTexture.create_from_image(part), "mark": (m - Vector2(rect.position)) / Vector2(rect.size), "text": text}

func _trigger(id: String) -> void:
	set_paused(false)
	events.trigger(id, true)

# ───────── 차 모양 (웹판 파란 차 + 초보운전 표시) ─────────
func _build_car() -> void:
	car_g = Node3D.new()
	add_child(car_g)
	var body := Node3D.new()
	body.position.z = 1.35
	car_g.add_child(body)
	var blue := Kit.mat(Color("#2b44a6"), 0.4)
	Kit.box(body, Vector3(1.8, 0.55, 4.6), Vector3(0, 0.62, 0), blue)
	var cab := Kit.box(body, Vector3(1.6, 0.5, 2.2), Vector3(0, 1.14, -0.25), Kit.mat(Color(0.12, 0.13, 0.16), 0.15))
	var roof := Kit.box(body, Vector3(1.62, 0.07, 1.9), Vector3(0, 1.42, -0.3), blue)
	var plate := Kit.box(body, Vector3(0.62, 0.22, 0.02), Vector3(0, 1.08, -1.37), Kit.mat(Color(0.98, 0.84, 0.12), 0.5), false)
	var st := Kit.label3d(body, "초보운전", Vector3(0, 1.08, -1.385), 40, Color(0.1, 0.1, 0.1))
	st.rotation.y = PI
	st.pixel_size = 0.0034
	outside = [cab, roof, plate, st]
	Kit.box(body, Vector3(1.8, 0.12, 0.2), Vector3(0, 0.66, 2.32), Kit.mat(Color("#f2f1ec"), 0.5))
	for s in [-1, 1]:
		_lamp(body, "head", s * 0.58, 0.72, 2.31)
		_lamp(body, "brake", s * 0.62, 0.78, -2.31)
		_lamp(body, "rev", s * 0.32, 0.78, -2.31, 0.14, 0.08)
		_lamp(body, "turnL" if s > 0 else "turnR", s * 0.82, 0.72, 2.31, 0.14, 0.1)
		_lamp(body, "turnL" if s > 0 else "turnR", s * 0.86, 0.78, -2.31, 0.1, 0.12)
	# 운전석 (운전석 시점에서만 보이는 계기판, 핸들)
	Kit.box(body, Vector3(1.5, 0.08, 0.36), Vector3(0, 0.84, 0.95), Kit.mat(Color(0.11, 0.12, 0.13)), false)
	wheel_m = Node3D.new()
	wheel_m.position = Vector3(0.37, 0.9, 0.5)
	wheel_m.rotation.x = -0.35
	body.add_child(wheel_m)
	var tor := TorusMesh.new()
	tor.inner_radius = 0.16
	tor.outer_radius = 0.2
	tor.rings = 28
	tor.ring_segments = 8
	var tm := MeshInstance3D.new()
	tm.mesh = tor
	tm.rotation.x = PI / 2
	tm.material_override = Kit.mat(Color(0.08, 0.08, 0.08), 0.7)
	wheel_m.add_child(tm)
	for a in [0.0, 2.1, -2.1]:
		var sp := Kit.box(wheel_m, Vector3(0.03, 0.19, 0.02), Vector3(sin(a) * 0.095, -cos(a) * 0.095, 0), Kit.mat(Color(0.16, 0.17, 0.19)), false)
		sp.rotation.z = a
	var hub := Kit.cyl(wheel_m, 0.05, 0.04, Vector3.ZERO, blue, 16)
	hub.rotation.x = PI / 2
	for p in [Vector3(Car.TR / 2, 0.31, 0), Vector3(-Car.TR / 2, 0.31, 0), Vector3(Car.TR / 2, 0.31, Car.WB), Vector3(-Car.TR / 2, 0.31, Car.WB)]:
		var h := Node3D.new()
		h.position = p
		car_g.add_child(h)
		var w := Kit.cyl(h, 0.31, 0.22, Vector3.ZERO, Kit.mat(Color(0.08, 0.08, 0.08), 0.9), 18)
		w.rotation.z = PI / 2
		Kit.box(w, Vector3(0.1, 0.24, 0.1), Vector3.ZERO, Kit.mat(Color(0.56, 0.55, 0.5)), false)
		wheels_m.append(w)
		if p.z > 0:
			steer_hubs.append(h)
	head_spot = SpotLight3D.new()
	head_spot.position = Vector3(0, 0.75, Car.WB + Car.FO)
	head_spot.rotation = Vector3(-0.06, PI, 0)
	head_spot.light_color = Color(1.0, 0.96, 0.86)
	head_spot.shadow_enabled = false
	car_g.add_child(head_spot)

func _lamp(body: Node3D, k: String, x: float, y: float, z: float, w := 0.32, h := 0.12) -> void:
	var m := Kit.box(body, Vector3(w, h, 0.04), Vector3(x, y, z), Kit.HEAD_OFF, false)
	if not lamps.has(k):
		lamps[k] = []
	lamps[k].append(m)

func _build_splash() -> void:
	splash_p = GPUParticles3D.new()
	splash_p.amount = 40
	splash_p.lifetime = 0.6
	splash_p.one_shot = true
	splash_p.explosiveness = 0.9
	splash_p.local_coords = false
	splash_p.emitting = false
	var pm := ParticleProcessMaterial.new()
	pm.direction = Vector3(0, 1, 0)
	pm.spread = 55.0
	pm.initial_velocity_min = 2.0
	pm.initial_velocity_max = 4.5
	pm.gravity = Vector3(0, -9.8, 0)
	splash_p.process_material = pm
	var q := QuadMesh.new()
	q.size = Vector2(0.06, 0.06)
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.albedo_color = Color(0.8, 0.85, 0.92, 0.7)
	m.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	q.material = m
	splash_p.draw_pass_1 = q
	add_child(splash_p)

func splash(w: Dictionary, kmh: float) -> void:
	if splash_t > 0 or kmh < 12:
		return
	splash_t = 0.25
	splash_p.global_position = Vector3(w.x, 0.1, w.z)
	splash_p.restart()
	splash_p.emitting = true

# ───────── 입력: 키보드 → { steer, thr, brk }. 레이싱 휠을 붙이면 이 한 곳만 바꾸면 됨 ─────────
func _k(code: Key) -> bool:
	return Input.is_physical_key_pressed(code)

func read_keys(dt: float, kmh: float) -> void:
	# 간단 조작: WASD도 받고 기어는 저절로. W를 누르면 앞으로, 멈춘 뒤 S를 다시 누르면 R (control), 뒤로 갈 땐 S가 가속, W가 브레이크
	var up := _k(KEY_UP) or (simple and _k(KEY_W))
	var dn := _k(KEY_DOWN) or (simple and _k(KEY_S))
	if simple and car.gear == "R":
		if up and absf(car.v) < 0.05:
			car.gear = "D"
		else:
			var tmp := up
			up = dn
			dn = tmp
	var t := (1 if _k(KEY_LEFT) or (simple and _k(KEY_A)) else 0) - (1 if _k(KEY_RIGHT) or (simple and _k(KEY_D)) else 0)
	var lim := maxf(0.3, 1.0 - maxf(0.0, kmh - 15.0) / 70.0) # 키보드만: 빠를수록 덜 꺾임
	if t != 0:
		inp.steer = clampf(inp.steer + t * dt * (3.4 if inp.steer * t < 0 else 1.7), -lim, lim)
	else:
		inp.steer -= signf(inp.steer) * minf(absf(inp.steer), dt * 2.2)
	# 가속, 브레이크: 누르면 먼저 보통 세기까지, 1초 넘게 누르면 끝까지 (간단 조작은 바로 끝까지)
	hold_u = hold_u + dt if up else 0.0
	hold_d = hold_d + dt if dn else 0.0
	var tu := 1.0 if simple else (minf(1.0, 0.5 + (hold_u - 1.0) * 0.5) if hold_u > 1.0 else 0.5)
	var td := 0.8 if simple else (minf(1.0, 0.5 + (hold_d - 1.0) * 0.5) if hold_d > 1.0 else 0.5)
	inp.thr = minf(tu, inp.thr + dt * (2.5 if simple else 0.9)) if up else maxf(0.0, inp.thr - dt * 3.0)
	inp.brk = minf(td, inp.brk + dt * (3.0 if simple else 1.6)) if dn else maxf(0.0, inp.brk - dt * 5.0)

func _unhandled_input(e: InputEvent) -> void:
	if not (e is InputEventKey) or not e.pressed or e.echo:
		return
	var code: Key = e.physical_keycode
	if code == KEY_TAB or code == KEY_ESCAPE:
		set_paused(not paused)
		return
	if paused:
		return
	if code >= KEY_1 and code <= KEY_8:
		events.trigger(Events.LIST[code - KEY_1].id, true)
		return
	control(code)

func control(code: Key) -> void: # 운전대 주변 장치
	var c := car
	if simple:
		if (code == KEY_S or code == KEY_DOWN) and c.gear == "D" and absf(c.v) < 0.05:
			c.gear = "R" # 멈춘 뒤 다시 누르면 뒤로
		if not [KEY_Q, KEY_E, KEY_H, KEY_F, KEY_C].has(code):
			return
	match code:
		KEY_P, KEY_R, KEY_N, KEY_D:
			var g: String = {KEY_P: "P", KEY_R: "R", KEY_N: "N", KEY_D: "D"}[code]
			if not c.shift(g):
				hud.toast("멈춘 뒤 기어를 바꾸세요" if absf(c.v) > 0.4 else "브레이크를 밟고 기어를 바꾸세요")
		KEY_Q:
			c.set_sig(1)
		KEY_E:
			c.set_sig(2)
		KEY_H:
			c.hazard = not c.hazard
		KEY_SPACE:
			c.pb = not c.pb
		KEY_F:
			c.lights = (c.lights + 1) % 3
		KEY_I:
			if c.engine and absf(c.v) < 0.1:
				c.engine = false
			elif not c.engine:
				c.engine = true
		KEY_C:
			view = (view + 1) % 3

# ───────── 한 걸음 (1초에 120번) ─────────
func _physics_process(dt: float) -> void:
	if paused:
		return
	sim_step(dt)

func sim_step(dt: float) -> void:
	var kmh := absf(car.v) * 3.6
	if bot.is_valid():
		var b: Dictionary = bot.call(dt)
		inp.steer = b.steer
		inp.thr = b.thr
		inp.brk = b.brk
	else:
		read_keys(dt, kmh)
	# 노면 마찰: 날씨 → 빙판 → 웅덩이(수막현상)
	var g := weather.grip()
	var w := car.wheels()
	if events.on.ice and (city.on_ice(w[2].x, w[2].z) or city.on_ice(w[3].x, w[3].z)):
		g = minf(g, 0.15)
	car.ffb_extra = 0.0
	if weather.kind == "rain":
		g = minf(g, events.puddle_effect(dt))
	# 노면 떨림: 연석이나 보도 위, 눈길
	var q = city.road_at(car.x, car.z)
	if (q == null or absf(q.off) > q.r.T.hw + 0.1) and absf(car.v) > 0.5:
		car.ffb_extra += randf_range(-0.25, 0.25)
	elif weather.kind == "snow" and absf(car.v) > 1.0:
		car.ffb_extra += randf_range(-0.05, 0.05)
	car.grip = g
	car.step(inp, dt)
	_collide()
	city.tick(dt, sim_t, car)
	events.update(dt, sim_t)
	_rules(dt)
	sim_t += dt
	crash_t -= dt
	splash_t -= dt
	roll += (clampf(-car.v * car.yaw_rate * 0.012, -0.06, 0.06) - roll) * minf(1.0, dt * 6)

# 날씨 기준 제한 속도, 앞차와의 거리(초), 오래 하면 쉬라는 알림
func _rules(dt: float) -> void:
	drive_t += dt
	if int(drive_t / 1200.0) != int((drive_t - dt) / 1200.0):
		hud.flash("%d분 연습했어요" % int(round(drive_t / 60.0)), 2.5)
		hud.toast("어지럽거나 눈이 피곤하면 잠깐 쉬었다 해요", "info")
	lim_t -= dt
	if lim_t <= 0:
		lim_t = 0.1
		var m := car.at(1.35, 0)
		var q = city.road_at(m.x, m.z)
		if q != null:
			var base: float = q.r.T.lim
			if is_same(q.r, city.school) and q.s > city.school.zone[0] and q.s < city.school.zone[1]:
				base = 30.0
			eff_lim = base * weather.speed_factor()
		# 앞차: 같은 차로에서 60m 안
		gap_s = -1.0
		gap_need = 2.0 if weather.kind == "clear" and not weather.fog else 4.0
		var v := absf(car.v)
		if v > 3.0:
			var best := 60.0
			for c: Dictionary in city.ai:
				var rel: Vector2 = events._rel(c.x, c.z)
				var f: float = rel.x - (2.7 if c.kind == "amb" else 2.25)
				if f > 0 and f < best and absf(rel.y) < 1.6 and cos(c.yaw - car.yaw) > 0.8:
					best = f
			if best < 60.0:
				gap_s = best / v
				sess.follow += 0.1
				if gap_s < gap_need:
					sess.short += 0.1
	var kmh := absf(car.v) * 3.6
	if kmh > eff_lim + 3:
		over_t += dt
		if over_t > 2.0 and sim_t - over_said > 20.0:
			over_said = sim_t
			sess.over += 1
			var why := weather.factor_text()
			hud.toast(("%s: 제한 속도를 줄여야 해요. 지금은 시속 %dkm" % [why, int(eff_lim)]) if why != "" else "제한 속도 시속 %dkm를 넘었어요" % int(eff_lim), "warn")
	else:
		over_t = 0.0

func _collide() -> void:
	var cb := car.box()
	for b: Dictionary in city.boxes:
		if absf(b.x - cb.x) > 8 or absf(b.z - cb.z) > 8:
			continue
		var p = Kit.obb_hit(cb, b)
		if p != null:
			car.x += p.x
			car.z += p.y
			cb.x += p.x
			cb.z += p.y
			if absf(car.v) > 0.3:
				shake = minf(1.0, absf(car.v) / 6.0)
				if crash_t <= 0:
					hud.toast("부딪혔어요", "warn")
					hits.append(["물체", snappedf(b.x, 0.1), snappedf(b.z, 0.1)])
					crash_t = 1.0
			car.v = 0.0
	for c: Dictionary in city.ai:
		var amb: bool = c.kind == "amb"
		var b := {"x": c.x, "z": c.z, "hw": 1.0 if amb else 0.9, "hl": 2.7 if amb else 2.25, "r": c.yaw}
		if absf(b.x - cb.x) > 9 or absf(b.z - cb.z) > 9:
			continue
		var p = Kit.obb_hit(cb, b)
		if p == null:
			continue
		car.x += p.x
		car.z += p.y
		cb.x += p.x
		cb.z += p.y
		var behind: bool = (c.x - cb.x) * sin(car.yaw) + (c.z - cb.z) * cos(car.yaw) < -2.0 # 뒤차가 와서 받은 건 운전자 잘못이 아님
		var hard := absf(car.v) > 0.5
		car.v = 0.0
		c.v = 0.0
		if crash_t <= 0:
			crash_t = 1.0
			if behind:
				hud.toast("뒤차가 부딪혔어요")
			elif hard:
				shake = 0.6
				hud.toast("다른 차와 부딪혔어요", "warn")
				hits.append(["차", c.kind, snappedf(c.x, 0.1), snappedf(c.z, 0.1)])
				events.hit_car(c)
	# 사람
	var ppl: Array = events.people()
	for p: Dictionary in city.peds:
		if p.walking:
			ppl.append(p.m)
	for who: Node3D in ppl:
		if knocked.has(who):
			continue
		var dx: float = who.position.x - car.x
		var dz: float = who.position.z - car.z
		var f := dx * sin(car.yaw) + dz * cos(car.yaw)
		var l := dx * cos(car.yaw) - dz * sin(car.yaw)
		if f > -Car.RO - 0.25 and f < Car.WB + Car.FO + 0.25 and absf(l) < Car.W / 2 + 0.25 and absf(car.v) > 0.3:
			car.v = 0.0
			shake = 0.7
			knocked[who] = 2.5
			hud.toast("사람과 부딪혔어요", "warn")
			hits.append(["사람", snappedf(who.position.x, 0.1), snappedf(who.position.z, 0.1)])
			if not events.hit_person(who):
				hud.add_result("보행자", ["건너던 사람과 부딪혔어요", "횡단보도 앞, 우회전할 때는 사람이 건너는지 먼저 보기"], "bad")
				add_record("ped", "bad", -1.0, null)

# ───────── 그리기 ─────────
func _process(dt: float) -> void:
	for who in knocked.keys():
		knocked[who] -= dt
		if is_instance_valid(who):
			who.rotation.x = -PI / 2 if knocked[who] > 0 else 0.0
		if knocked[who] <= 0 or not is_instance_valid(who):
			knocked.erase(who)
	_draw_car()
	_camera(dt)
	weather.tick(dt, car_g.global_position, Vector3(sin(car.yaw), 0, cos(car.yaw)))
	_glare()
	sfx.rain = 0.0 if weather.kind != "rain" else (0.7 if view == 1 else 0.45)
	sfx.engine = car.rpm if car.engine else 0.0
	var blink := fmod(sim_t * 2.6, 2.0) < 1.0
	if blink != blink_was and (car.sig != 0 or car.hazard):
		sfx.tick_click()
	blink_was = blink
	var n_on := 0
	for id in events.on:
		if events.on[id]:
			n_on += 1
	var cars := []
	for c: Dictionary in city.ai:
		cars.append(Vector2(c.x, c.z))
	var marks := []
	if events.act.has("amb"):
		marks.append([Vector2(events.act.amb.c.x, events.act.amb.c.z), Color(0.85, 0.12, 0.1)])
	hud.update({"weather": weather.label(), "n_on": n_on, "kmh": absf(car.v) * 3.6, "gear": car.gear, "simple": simple, "sig": car.sig, "blink": blink,
		"hazard": car.hazard, "lights": car.lights, "slip": car.understeer > 0.15 or absf(car.slip) > 0.06 or car.wheelspin, "ffb": car.ffb,
		"x": car.x, "z": car.z, "yaw": car.yaw, "cars": cars, "marks": marks,
		"lim": eff_lim, "lim_note": weather.factor_text(), "over": absf(car.v) * 3.6 > eff_lim + 3, "gap": gap_s, "gap_need": gap_need})
	if hud.minimap.lines.is_empty():
		hud.minimap.lines = city.map_lines

func _draw_car() -> void:
	car_g.position = Vector3(car.x, car.y, car.z)
	car_g.rotation = Vector3(-car.pitch, car.yaw, roll)
	for w: Node3D in wheels_m:
		w.rotation.x = car.spin
	for h: Node3D in steer_hubs:
		h.rotation.y = car.steer
	wheel_m.rotation.z = -inp.steer * 7.85 # 핸들 한쪽 끝까지 1.25바퀴
	var blink := fmod(sim_t * 2.6, 2.0) < 1.0
	_lamp_set(lamps.head, car.lights > 0, Kit.HEAD_ON, Kit.HEAD_OFF)
	_lamp_set(lamps.brake, car.brk > 0.05 and car.engine, Kit.TAIL_ON, Kit.TAIL_OFF)
	_lamp_set(lamps.rev, car.gear == "R" and car.engine, Kit.HEAD_ON, Kit.HEAD_OFF)
	_lamp_set(lamps.turnL, blink and (car.sig == 1 or car.hazard), Kit.BLINK_ON, Kit.BLINK_OFF)
	_lamp_set(lamps.turnR, blink and (car.sig == 2 or car.hazard), Kit.BLINK_ON, Kit.BLINK_OFF)
	head_spot.visible = car.lights > 0
	head_spot.light_energy = 16.0 if weather.night else 2.0
	head_spot.spot_attenuation = 0.45
	head_spot.spot_range = 95.0 if car.lights == 2 else 55.0
	head_spot.spot_angle = 22.0 if car.lights == 2 else 30.0
	for o: Node3D in outside:
		o.visible = view != 1

func _lamp_set(list: Array, on: bool, a: Material, b: Material) -> void:
	for m: MeshInstance3D in list:
		m.material_override = a if on else b

func _camera(dt: float) -> void:
	var fx := sin(car.yaw)
	var fz := cos(car.yaw)
	var want: Vector3
	var want_l: Vector3
	var up := Vector3.UP
	if view == 0:
		want = Vector3(car.x - fx * 6.4, car.y + 3.1, car.z - fz * 6.4)
		want_l = Vector3(car.x + fx * 9, car.y + 0.6, car.z + fz * 9)
	elif view == 1:
		want = car_g.to_global(Vector3(0.37, 1.28, 1.1))
		want_l = car_g.to_global(Vector3(0.37, 1.05, 9.0))
	else:
		var mid := Vector3(car.x + fx * 1.35, car.y, car.z + fz * 1.35)
		want = mid + Vector3(0, 24, 0)
		want_l = mid
		up = Vector3(fx, 0, fz)
	if first or view == 1:
		cam_pos = want
		look = want_l
		first = false
	else:
		cam_pos = cam_pos.lerp(want, 1.0 - exp(-dt * 8))
		look = look.lerp(want_l, 1.0 - exp(-dt * 10))
	var pos := cam_pos
	shake *= exp(-dt * 6)
	if shake > 0.01:
		pos += Vector3(randf() - 0.5, randf() - 0.5, 0) * shake * 0.3
	cam.global_position = pos
	if not pos.is_equal_approx(look):
		cam.look_at(look, up)
	var vp := get_viewport().get_visible_rect().size
	cam.fov = 68.0 if view == 1 else 48.0 if view == 2 else (74.0 if vp.x < vp.y else 58.0)
	mirror_cam.global_position = car_g.to_global(Vector3(0, 1.3, 1.2))
	mirror_cam.look_at(car_g.to_global(Vector3(0, 0.9, -30.0)), Vector3.UP)
	mirror_tick = not mirror_tick # 뒷거울은 두 화면에 한 번만 그림
	if mirror_tick and hud.mirror.is_visible_in_tree():
		(mirror_cam.get_parent() as SubViewport).render_target_update_mode = SubViewport.UPDATE_ONCE
	# 2초 넘게 끊기면 3D 해상도를 한 단계 낮춤 (노트북 내장 그래픽)
	adapt_wait -= dt
	if adapt_wait <= 0:
		frame_slow = frame_slow + dt if dt > 1.0 / 38.0 else maxf(0.0, frame_slow - dt)
	if frame_slow > 2.0 and get_viewport().scaling_3d_scale > 0.55:
		get_viewport().scaling_3d_scale -= 0.1
		frame_slow = 0.0

# 밤에 맞은편 차가 상향등을 켜고 오면 눈부심
func _glare() -> void:
	if not weather.night:
		hud.glare.visible = false
		return
	var best := 0.0
	var bp := Vector2.ZERO
	for c: Dictionary in city.ai:
		if not c.high:
			continue
		var d := Vector2(c.x - car.x, c.z - car.z)
		var dist := d.length()
		if dist > 75 or dist < 4 or cos(c.yaw - car.yaw) > -0.85:
			continue
		var p := Vector3(c.x + sin(c.yaw) * 2.3, 0.75, c.z + cos(c.yaw) * 2.3)
		if cam.is_position_behind(p):
			continue
		var fwd := (d / dist).dot(Vector2(sin(car.yaw), cos(car.yaw)))
		if fwd < 0.9:
			continue
		var k := pow(1.0 - dist / 75.0, 1.5) * smoothstep(0.9, 0.99, fwd)
		if k > best:
			best = k
			bp = cam.unproject_position(p)
	hud.glare.visible = best > 0.02
	if hud.glare.visible:
		var size := 260.0 + 900.0 * best
		hud.glare.position = bp - Vector2(size, size) / 2
		hud.glare.size = Vector2(size, size)
		hud.glare.modulate = Color(1, 1, 1, minf(1.0, best * 1.4))
