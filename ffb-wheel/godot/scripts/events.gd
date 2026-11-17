# 돌발 상황: 초보 운전자가 당황하기 쉬운 일들. 켜 두면 알맞은 때 저절로 일어나고, 숫자 키로 바로 일으킬 수도 있음.
# 일어나는 거리는 "1초 안에 반응해 세게 밟으면 멈출 수 있는" 만큼으로 맞춤 (날씨가 미끄러우면 그만큼 멀리서).
# 끝나면 결과 카드: 반응 시간, 가장 가까웠던 거리, 부딪혔는지
class_name Events
extends Node

const LIST := [
	{"id": "child", "name": "아이가 뛰어듦", "desc": "세워 둔 차 앞에서 아이가 갑자기 뛰어나와요"},
	{"id": "jay", "name": "무단횡단", "desc": "횡단보도가 아닌 곳에서 사람이 길을 건너요"},
	{"id": "brake", "name": "앞차 급정거", "desc": "앞에서 가던 차가 갑자기 멈춰요"},
	{"id": "cut", "name": "끼어들기", "desc": "옆 차로의 차가 바짝 붙어 들어와요 (왕복 4차로)"},
	{"id": "amb", "name": "구급차", "desc": "사이렌을 울리며 뒤에서 와요. 오른쪽으로 비켜 주세요"},
	{"id": "work", "name": "공사 구간", "desc": "큰길 한 차로를 라바콘으로 막았어요 (시험장 앞 큰길)"},
	{"id": "honk", "name": "뒤차 경적", "desc": "초록불에 머뭇거리면 뒤차가 경적을 울려요"},
	{"id": "ice", "name": "빙판길", "desc": "그늘진 굽은 길에 잘 안 보이는 얼음이 있어요"},
]
const DYN := ["child", "jay", "brake", "cut", "amb"]

var main: Node
var on := {}
var cool := {}
var act := {}          # 지금 벌어지는 상황 {id: 상태}
var gap_t := 8.0       # 다음 상황까지 (여러 개가 겹치지 않게)
var rng := RandomNumberGenerator.new()
var honk_t := 0.0
var honk_card := -99.0
var slow_t := 0.0
var green_t := 0.0
var ice_st := {}
var work_st := {}
var hydro_said := false

func _init() -> void:
	for e: Dictionary in LIST:
		on[e.id] = false
		cool[e.id] = 0.0
	rng.randomize()

func car() -> Car:
	return main.car

func city() -> City:
	return main.city

func name_of(id: String) -> String:
	for e: Dictionary in LIST:
		if e.id == id:
			return e.name
	return id

func set_on(id: String, v: bool) -> void:
	on[id] = v
	if id == "work":
		city().set_work(v)
		work_st = {}
	elif id == "ice":
		city().ice_node.visible = v
		ice_st = {}
	if v:
		cool[id] = 3.0 + rng.randf() * 6.0

# ── 앞쪽 길 위 자리 ──
func _ahead(dist: float):
	var c := car()
	var m := c.at(1.35, 0)
	var q = city().road_at(m.x, m.z)
	if q == null:
		return null
	var dir := 1 if cos(c.yaw - q.yaw) > 0 else -1
	var s: float = q.s + dir * dist
	var r: Dictionary = q.r
	if s < r.s0 + 4 or s > r.s1 - 4:
		return null
	var p: Dictionary = Kit.cut(r.pts, s, s + 1)[0]
	return {"r": r, "dir": dir, "s": s, "p": p, "yaw": p.yaw + (0.0 if dir > 0 else PI), "off": q.off * dir}

func _pt(sp: Dictionary, off: float, ds := 0.0) -> Vector3: # 진행 방향 오른쪽 + off, 앞으로 ds
	var p: Dictionary = sp.p
	if ds != 0.0:
		p = Kit.cut(sp.r.pts, sp.s + ds * sp.dir, sp.s + ds * sp.dir + 1)[0]
	var o := Kit.off_pt(p, off * sp.dir)
	return Vector3(o.x, 0, o.z)

func _brake_a() -> float:
	return minf(7.0, car().grip * Car.G * 0.9)

func stop_dist(react: float) -> float:
	var v := absf(car().v)
	return v * react + v * v / (2.0 * _brake_a())

# 운전자 차 앞범퍼에서 본 점: (앞으로, 오른쪽으로)
func _rel(x: float, z: float) -> Vector2:
	var c := car()
	var f := c.front()
	var dx: float = x - f.x
	var dz: float = z - f.z
	return Vector2(dx * sin(c.yaw) + dz * cos(c.yaw), -(dx * cos(c.yaw) - dz * sin(c.yaw)))

func trigger(id: String, manual: bool) -> bool:
	if act.has(id):
		return false
	var ok := false
	var why := ""
	match id:
		"child":
			ok = _start_child(manual)
			why = "곧게 뻗은 길을 시속 10km 넘게 달릴 때 일어나요"
		"jay":
			ok = _start_jay(manual)
			why = "곧게 뻗은 길을 달릴 때 일어나요"
		"brake":
			ok = _start_brake(manual)
			why = "차로 위를 달릴 때 일어나요"
		"cut":
			ok = _start_cut()
			why = "왕복 4차로 큰길을 시속 15km 넘게 달릴 때 일어나요"
		"amb":
			ok = _start_amb()
			why = "큰길이나 순환로 차로 위에서 일어나요"
		"work", "ice":
			main.hud.set_check(id, not on[id])
			set_on(id, not on[id])
			main.hud.toast("%s %s" % [name_of(id), "켬" if on[id] else "끔"], "info")
			return true
		"honk":
			_honk(true)
			return true
	if ok:
		gap_t = 14.0 + rng.randf() * 10.0
	elif manual:
		main.hud.toast("%s: %s" % [name_of(id), why], "info")
	return ok

func update(dt: float, t: float) -> void:
	# 저절로: 켜 둔 상황 가운데 하나를, 다른 상황이 없을 때
	var busy := false
	for id in DYN:
		if act.has(id):
			busy = true
	gap_t -= dt
	if not busy and gap_t <= 0:
		var ids := []
		for id in DYN:
			if on[id]:
				cool[id] -= dt
				if cool[id] <= 0:
					ids.append(id)
		if not ids.is_empty():
			var id: String = ids[rng.randi() % ids.size()]
			if not trigger(id, false):
				cool[id] = 1.5
			else:
				cool[id] = 25.0 + rng.randf() * 25.0
	for id in act.keys():
		match id:
			"child": _tick_child(dt, t)
			"jay": _tick_jay(dt, t)
			"brake": _tick_brake(dt, t)
			"cut": _tick_cut(dt, t)
			"amb": _tick_amb(dt, t)
	if on.honk:
		_tick_honk(dt, t)
	if on.ice:
		_tick_ice(dt)
	if on.work:
		_tick_work(dt)
	# 사람 장애물 → 다른 차도 멈춤
	var obs := []
	for id in ["child", "jay"]:
		if act.has(id) and act[id].has("who"):
			var w: Node3D = act[id].who
			obs.append({"x": w.position.x, "z": w.position.z, "half": 0.3, "lat": 1.7})
	city().extra_obs = obs

func _react(st: Dictionary, t: float) -> void: # 상황이 시작된 뒤 처음 브레이크를 밟은 때
	if st.has("t0") and not st.has("react") and car().brk > 0.3:
		st.react = t - st.t0

func _result(id: String, st: Dictionary, good: bool, lines: Array) -> void:
	if st.has("react") and st.react < 0.05 and not st.get("early", false):
		lines.push_front("그때 이미 브레이크를 밟고 있었어요")
	elif st.has("react") and not st.get("early", false):
		lines.push_front("반응 %.1f초 (브레이크를 밟기까지)" % st.react)
	elif st.has("t0") and not good:
		lines.push_front("브레이크를 밟지 않았어요")
	main.hud.add_result(name_of(id), lines, good)

func _alive(c) -> bool:
	for o: Dictionary in city().ai:
		if is_same(o, c):
			return true
	return false

func _person(col: Color, scale: float) -> Node3D:
	return Kit.person(city(), col, scale)

# ── 아이가 뛰어듦: 세워 둔 승합차 앞에 숨어 있다가 차 앞으로 뛰어나와 얼어붙음 ──
func _start_child(manual: bool) -> bool:
	var v := absf(car().v)
	if v < (1.5 if manual else 3.0):
		return false
	var d := maxf(26.0, stop_dist(1.2) + 12.0)
	var sp = null
	for k in 4: # 세워 둔 차, 표지판과 겹치지 않는 곳
		var cand = _ahead(d + k * 7.0)
		if cand == null:
			break
		var vp0 := _pt(cand, float(cand.r.T.hw) + 0.5)
		var clear := true
		for b: Dictionary in city().boxes:
			if absf(b.x - vp0.x) < 8 and absf(b.z - vp0.z) < 8 and Kit.obb_hit({"x": vp0.x, "z": vp0.z, "hw": 1.2, "hl": 3.4, "r": cand.yaw}, b) != null:
				clear = false
				break
		if clear:
			sp = cand
			break
	if sp == null:
		return false
	var hw: float = sp.r.T.hw
	var van := Node3D.new() # 바퀴 한쪽을 보도에 올려 세운 승합차 (차로는 거의 막지 않음)
	city().add_child(van)
	var vp := _pt(sp, hw + 0.5)
	van.position = vp
	van.rotation.y = sp.yaw
	Kit.box(van, Vector3(1.95, 1.75, 4.9), Vector3(0, 1.15, 0), Kit.mat(Color(0.93, 0.93, 0.9), 0.5))
	Kit.box(van, Vector3(1.97, 0.55, 1.2), Vector3(0, 1.55, 1.6), Kit.mat(Color(0.16, 0.17, 0.2), 0.25), false)
	for p in [Vector3(0.85, 0.33, 1.6), Vector3(-0.85, 0.33, 1.6), Vector3(0.85, 0.33, -1.6), Vector3(-0.85, 0.33, -1.6)]:
		var w := Kit.cyl(van, 0.33, 0.24, p, Kit.mat(Color(0.08, 0.08, 0.08), 0.9), 12)
		w.rotation.z = PI / 2
	var vbox := {"x": vp.x, "z": vp.z, "hw": 0.98, "hl": 2.45, "r": sp.yaw}
	city().boxes.append(vbox)
	var kid := _person(Color(0.98, 0.78, 0.12), 0.68)
	kid.position = _pt(sp, hw - 0.2, 3.2)
	kid.rotation.y = sp.yaw - PI / 2
	act.child = {"sp": sp, "van": van, "vbox": vbox, "who": kid, "state": "hide", "age": 0.0, "min": 1e9}
	return true

func _tick_child(dt: float, t: float) -> void:
	var st: Dictionary = act.child
	st.age += dt
	var kid: Node3D = st.who
	var rel := _rel(kid.position.x, kid.position.z)
	var c := car()
	_react(st, t)
	match st.state:
		"hide": # 1초 안에 반응해 세게 밟으면 멈출 수 있는 거리 + 아이가 차 앞까지 뛰어오는 동안 차가 가는 거리
			var t_kid := maxf(0.0, absf(rel.y) - Car.W / 2 - 0.2) / 3.0
			var trig := maxf(6.0, absf(c.v) * (1.0 + t_kid) + absf(c.v) * absf(c.v) / (2.0 * _brake_a()) + 2.5)
			if rel.x < trig and rel.x > 1.0 and c.v > 0.5:
				st.state = "run"
				st.t0 = t
				st.target = rel.y # 운전자 차 가운데 줄로
				main.sfx.cue("child")
			elif rel.x < -2.0 or st.age > 25.0:
				_end_child(st, null)
				return
		"run":
			# 아이 → 운전자 차 길 가운데까지 옆으로 뜀
			var side := Vector2(cos(c.yaw), -sin(c.yaw)) # 왼쪽
			var need := rel.y - 0.0 # 지금 차 가운데에서 오른쪽으로 떨어진 거리
			var step := minf(absf(need), 3.0 * dt) * signf(need)
			kid.position += Vector3(side.x, 0, side.y) * step
			kid.rotation.y = atan2(side.x * signf(need), side.y * signf(need))
			_legs(kid, t * 9)
			if absf(need) < 0.05:
				st.state = "freeze"
				st.ft = 0.0
		"freeze": # 겁에 질려 멈춤
			st.ft += dt
			_legs(kid, 0)
			if (c.v == 0 and st.ft > 1.2) or st.ft > 4.0 or rel.x < -1.0:
				st.state = "away"
		"away": # 반대편으로 건너가 사라짐
			var side2 := Vector3(cos(st.sp.yaw), 0, -sin(st.sp.yaw)) # 진행 방향 왼쪽
			kid.position += side2 * 2.5 * dt
			kid.rotation.y = st.sp.yaw + PI / 2
			_legs(kid, t * 8)
			var rr := _rel(kid.position.x, kid.position.z)
			if rr.y < -(float(st.sp.r.T.hw) + 1.5) or st.age > 40:
				_end_child(st, true)
				return
	if st.state != "hide" and absf(rel.y) < Car.W / 2 + 0.4 and rel.x > -Car.L:
		st.min = minf(st.min, rel.x)

func _end_child(st: Dictionary, done) -> void:
	if done != null and not st.has("judged"):
		st.judged = true
		var lines := []
		if st.get("hit", false):
			_result("child", st, false, ["아이와 부딪혔어요", "어린이가 많은 곳, 세워 둔 차 옆은 천천히"])
		else:
			lines.append("아이 %.1fm 앞에서 멈췄어요" % maxf(0.0, st.min) if st.min < 1e8 else "아이를 피했어요")
			_result("child", st, true, lines)
	st.who.queue_free()
	var van: Node3D = st.van
	city().boxes.erase(st.vbox)
	van.queue_free()
	act.erase("child")

func hit_person(who: Node3D) -> bool: # 운전자 차가 사람과 부딪힘 → 그 상황 결과
	for id in ["child", "jay"]:
		if act.has(id) and act[id].who == who:
			if not act[id].get("hit", false):
				act[id].hit = true
				var st: Dictionary = act[id]
				st.judged = true
				if id == "child":
					_result("child", st, false, ["아이와 부딪혔어요", "세워 둔 차 옆은 천천히, 발은 브레이크 위에"])
				else:
					_result("jay", st, false, ["건너던 사람과 부딪혔어요", "길가에 사람이 보이면 속도부터 줄이기"])
			return true
	return false

func people() -> Array:
	var out := []
	for id in ["child", "jay"]:
		if act.has(id):
			out.append(act[id].who)
	return out

func _legs(o: Node3D, ph: float) -> void:
	var legs: Array = o.get_meta("legs")
	for i in 2:
		(legs[i] as Node3D).rotation.x = sin(ph + i * PI) * 0.6 if ph != 0 else 0.0

# ── 무단횡단: 왼쪽 보도에서 휴대전화를 보며 천천히 건너옴 ──
func _start_jay(manual: bool) -> bool:
	if absf(car().v) < (1.0 if manual else 2.5):
		return false
	var d := maxf(42.0, stop_dist(1.5) + 18.0)
	var sp = _ahead(d)
	if sp == null:
		return false
	var hw: float = sp.r.T.hw
	var from_left := rng.randf() < 0.7
	var a := _pt(sp, -(hw + 1.3) if from_left else hw + 1.3)
	var b := _pt(sp, hw + 1.3 if from_left else -(hw + 1.3))
	var who := _person(Color(0.3, 0.32, 0.4), 1.0)
	who.position = a
	who.rotation.y = atan2(b.x - a.x, b.z - a.z)
	Kit.box(who, Vector3(0.08, 0.14, 0.02), Vector3(0, 1.3, 0.28), Kit.mat(Color(0.2, 0.6, 1.0), 0.3, 1.5), false)
	act.jay = {"sp": sp, "who": who, "a": a, "b": b, "state": "wait", "age": 0.0, "min": 1e9, "minv": 99.0}
	return true

func _tick_jay(dt: float, t: float) -> void:
	var st: Dictionary = act.jay
	st.age += dt
	var who: Node3D = st.who
	var rel := _rel(who.position.x, who.position.z)
	_react(st, t)
	if st.state == "wait":
		var v := maxf(absf(car().v), 0.5)
		var t_ped := maxf(0.0, absf(rel.y) - (Car.W / 2 + 0.3)) / 1.25 # 사람이 내 차 길에 닿기까지
		var t_car := rel.x / v
		if rel.x > 2.0 and t_car <= t_ped + (stop_dist(1.2) + 3.0) / v:
			st.state = "walk"
			st.tw = t
		elif rel.x < -2.0 or st.age > 30:
			who.queue_free()
			act.erase("jay")
			return
	else:
		var dir: Vector3 = (st.b - st.a).normalized()
		who.position += dir * 1.25 * dt
		_legs(who, t * 6)
		if not st.has("t0") and absf(rel.y) < Car.W / 2 + 1.0 and rel.x > 0:
			st.t0 = t
			if car().brk > 0.3 or st.get("early", false):
				st.react = 0.0
				st.early = true
		if not st.has("t0") and car().brk > 0.3:
			st.early = true
		if absf(rel.y) < Car.W / 2 + 0.6 and rel.x > -Car.L:
			st.min = minf(st.min, rel.x)
			st.minv = minf(st.minv, absf(car().v) * 3.6)
		if (who.position - st.a).length() >= (st.b - st.a).length():
			if not st.get("judged", false):
				var lines := []
				if st.get("early", false):
					lines.append("사람이 차로에 들어오기 전에 미리 브레이크를 밟았어요")
				if st.min < 1e8:
					lines.append("사람 %.1fm 앞에서 %s" % [maxf(0.0, st.min), "멈췄어요" if st.minv < 1 else "속도를 시속 %dkm까지 줄였어요" % int(st.minv)])
				else:
					lines.append("사람이 건너는 동안 앞을 지나가지 않았어요")
				_result("jay", st, true, lines)
			who.queue_free()
			act.erase("jay")

# ── 앞차 급정거 ──
func _car_ahead():
	var best = null
	var bd := 1e9
	for c: Dictionary in city().ai:
		if c.kind == "amb":
			continue
		var rel := _rel(c.x, c.z)
		var f := rel.x - 2.25
		if f > 2.0 and f < 32.0 and absf(rel.y) < 1.6 and cos(c.yaw - car().yaw) > 0.85 and f < bd:
			bd = f
			best = c
	return best

func _start_brake(manual: bool) -> bool:
	var c = _car_ahead()
	if c == null:
		if absf(car().v) < (2.0 if manual else 4.0):
			return false
		var ln = city().lane_of(car().x, car().z, car().yaw)
		var ahead := 30.0 if manual else 32.0
		if ln == null or ln.s + ahead > ln.seg.L - 12:
			return false
		c = city().spawn_ai(Color("#6c7a99"), ln.seg, ln.s + ahead, maxf(absf(car().v) - 4.0, 4.0))
		if c.is_empty():
			return false
	act.brake = {"c": c, "age": 0.0, "min": 1e9}
	return true

func _tick_brake(dt: float, t: float) -> void:
	var st: Dictionary = act.brake
	var c: Dictionary = st.c
	st.age += dt
	if not _alive(c):
		act.erase("brake")
		return
	if not st.has("t0"): # 바짝 따라오면 (또는 몇 초 지나면) 급정거
		var rel0 := _rel(c.x, c.z)
		var gap0 := rel0.x - 2.25
		if absf(rel0.y) > 2.0 or rel0.x < 0 or st.age > 25:
			act.erase("brake")
			return
		var near_end: bool = not c.seg.con and c.seg.L - c.s < 22 # 교차로 앞 (노란불에 급히 서듯)
		if gap0 > maxf(9.0, absf(car().v) * 1.4) and not (st.age > 3.5 and gap0 < 28) and not (near_end and gap0 < 30):
			return
	if not st.has("t0"):
		st.t0 = t
		c.force = 2.6
		main.sfx.cue("skid")
	_react(st, t)
	var rel := _rel(c.x, c.z)
	if absf(rel.y) < 2.0:
		st.min = minf(st.min, rel.x - 2.25)
	if t - st.t0 > 6.0:
		if not st.get("judged", false):
			_result("brake", st, true, ["앞차와 가장 가까웠을 때 %.1fm" % maxf(0.0, st.min), "앞차와 거리를 넉넉히 (시속 km의 절반 m 이상)"])
		act.erase("brake")

func hit_car(c: Dictionary) -> void: # 운전자 차가 다른 차를 들이받음
	for id in ["brake", "cut", "amb"]:
		if act.has(id) and is_same(act[id].get("c"), c) and not act[id].get("judged", false):
			act[id].judged = true
			var tip: String = {"brake": "앞차와 거리를 넉넉히, 앞차 브레이크등을 보면 바로 발을 브레이크로", "cut": "옆 차로 차가 깜빡이를 켜거나 붙어 오면 속도를 줄여 자리를 내주기", "amb": "사이렌이 들리면 오른쪽으로 비켜 서기"}[id]
			_result(id, act[id], false, ["부딪혔어요", tip])

# ── 끼어들기: 옆 차로 차가 뒤에서 빨리 와서 내 앞으로 바짝 들어옴 ──
func _start_cut() -> bool:
	if absf(car().v) < 4.0:
		return false
	var ln = city().lane_of(car().x, car().z, car().yaw)
	if ln == null or ln.seg.r.T.n != 2 or ln.seg.L - ln.s < 30 or ln.s < 2:
		return false
	var k2: int = 1 - ln.k
	var seg := city().lane(ln.seg.r, ln.seg.dir, k2)
	var sp := city().pos_at(seg, maxf(0.0, ln.s - 3.0))
	for o: Dictionary in city().ai:
		if Vector2(o.x - sp.x, o.z - sp.z).length() < 8:
			return false
	var c := city().spawn_ai(Color("#2a2b30"), seg, maxf(0.0, ln.s - 3.0), absf(car().v) + 4.0)
	if c.is_empty():
		return false
	c.cut = {"state": "chase", "gap": 1.0 + rng.randf() * 1.8, "sig": rng.randf() < 0.5, "to": ln.k, "t": 0.0}
	act.cut = {"c": c, "age": 0.0, "min": 1e9}
	return true

func _tick_cut(dt: float, t: float) -> void:
	var st: Dictionary = act.cut
	var c: Dictionary = st.c
	st.age += dt
	if not _alive(c) or st.age > 40:
		act.erase("cut")
		return
	if not st.has("t0") and c.lc != null:
		st.t0 = t
		st.sig = c.cut.sig if c.has("cut") else false
	if st.has("t0"):
		_react(st, t)
		var rel := _rel(c.x, c.z)
		if absf(rel.y) < 2.0:
			st.min = minf(st.min, rel.x - 2.25)
		if t - st.t0 > 6.0:
			if not st.get("judged", false):
				var lines := ["끼어든 차와 가장 가까웠을 때 %.1fm" % maxf(0.0, st.min)]
				lines.append("그 차는 방향지시등을 %s" % ("켜자마자 들어왔어요" if st.sig else "켜지 않았어요"))
				_result("cut", st, true, lines)
			act.erase("cut")

# ── 구급차: 뒤에서 사이렌 → 오른쪽 차로로 비키거나 오른쪽 가장자리로 붙어 천천히 ──
func _start_amb() -> bool:
	var ln = city().lane_of(car().x, car().z, car().yaw)
	if ln == null or ln.s < 25:
		return false
	var s0: float = maxf(0.0, ln.s - 60.0)
	var c := city().spawn_ai(Color.WHITE, ln.seg, s0, 13.0, "amb")
	if c.is_empty():
		return false
	act.amb = {"c": c, "age": 0.0, "block": 0.0}
	main.hud.toast("뒤에서 구급차 사이렌 소리가 들려요 (뒷거울)", "info")
	act.amb.t0 = main.sim_t
	return true

func _tick_amb(dt: float, _t: float) -> void:
	var st: Dictionary = act.amb
	var c: Dictionary = st.c
	st.age += dt
	var rel := _rel(c.x, c.z)
	var dist := Vector2(rel.x, rel.y).length()
	main.sfx.siren = clampf(1.0 - dist / 160.0, 0.0, 1.0)
	if rel.x < 0 and rel.x > -38 and absf(rel.y) < 4.0 and c.v < 9.0: # 구급차가 내 뒤에서 막혀 있음
		st.block += dt
	if rel.x > 8.0 and not st.has("passed"):
		st.passed = st.age
		if not st.get("judged", false):
			st.judged = true
			if st.block < 5.0:
				main.hud.add_result(name_of("amb"), ["길을 비켜 줬어요", "구급차가 뒤에서 기다린 시간 %.1f초" % st.block], true)
			else:
				main.hud.add_result(name_of("amb"), ["구급차가 %.0f초 동안 뒤에서 기다렸어요" % st.block, "사이렌이 들리면 오른쪽 차로나 오른쪽 가장자리로"], false)
	if (st.has("passed") and rel.x > 120) or st.age > 80:
		if not st.has("passed") and not st.get("judged", false):
			main.hud.add_result(name_of("amb"), ["구급차가 지나가지 못했어요 (%.0f초 막힘)" % st.block, "사이렌이 들리면 오른쪽 차로나 오른쪽 가장자리로"], false)
		city().remove_ai(c)
		main.sfx.siren = 0.0
		act.erase("amb")

# ── 뒤차 경적: 초록불인데 출발하지 않거나, 너무 느리게 가면 ──
func _behind_car():
	for c: Dictionary in city().ai:
		var rel := _rel(c.x, c.z)
		var back: float = -(rel.x + Car.L) - 2.25 # 내 뒤범퍼에서 그 차 앞범퍼까지
		if back > -0.5 and back < 9.0 and absf(rel.y) < 1.6 and cos(c.yaw - car().yaw) > 0.85:
			return c
	return null

func _tick_honk(dt: float, t: float) -> void:
	honk_t -= dt
	var c := car()
	var q = city().road_at(c.at(1.35, 0).x, c.at(1.35, 0).z)
	var green := false
	var lim := 30.0
	if q != null:
		lim = q.r.T.lim
		var dir := 1 if cos(c.yaw - q.yaw) > 0 else -1
		var n: Dictionary = city().nodes[q.r.b if dir > 0 else q.r.a]
		var arm: String = City.OPP[q.r.d1] if dir > 0 else q.r.d0
		var to_stop: float = (q.r.s1 - q.s) if dir > 0 else (q.s - q.r.s0)
		if n.sig and to_stop < 14:
			var L: Dictionary = city().light(n, arm, t)
			green = L.get("g", 0) == 1 or L.get("l", 0) == 1
	green_t = green_t + dt if green and absf(c.v) < 0.3 else 0.0
	slow_t = slow_t + dt if absf(c.v) > 0.3 and absf(c.v) * 3.6 < lim * 0.4 else 0.0
	if honk_t <= 0 and (green_t > 2.5 or slow_t > 7.0) and _behind_car() != null:
		_honk(false)

func _honk(manual: bool) -> void:
	honk_t = 15.0
	main.sfx.horn = 0.9
	main.hud.toast("빵! 빵!", "honk")
	if not manual and main.sim_t - honk_card > 60.0: # 결과 카드는 1분에 한 번만
		honk_card = main.sim_t
		main.hud.add_result(name_of("honk"), ["뒤차가 경적을 울렸어요", "당황하지 말고, 안전하면 내 속도로 출발하기"], true)
	green_t = 0.0
	slow_t = 0.0

# ── 빙판길: 들어갈 때 속도, 미끄러진 정도 ──
func _tick_ice(_dt: float) -> void: # _dt: 빙판을 벗어난 시간 재기
	var c := car()
	var w := c.wheels()
	var on_ice := city().on_ice(w[2].x, w[2].z) or city().on_ice(w[3].x, w[3].z)
	if on_ice and not ice_st.has("in"):
		ice_st = {"in": absf(c.v) * 3.6, "slip": 0.0, "under": 0.0, "off": 0.0}
	if ice_st.has("in"):
		ice_st.slip = maxf(ice_st.slip, absf(c.slip))
		ice_st.under = maxf(ice_st.under, c.understeer)
		ice_st.off = 0.0 if on_ice else ice_st.off + _dt
		if ice_st.off > 1.5: # 빙판을 벗어나 1.5초 (미끄러져 잠깐 나갔다 들어온 건 한 번으로)
			var bad: bool = ice_st.slip > 0.12 or ice_st.under > 0.3
			var lines := ["들어갈 때 시속 %dkm" % int(ice_st.in)]
			lines.append("차가 옆으로 미끄러졌어요" if ice_st.slip > 0.12 else "핸들을 꺾어도 덜 돌았어요" if ice_st.under > 0.3 else "미끄러지지 않고 지나갔어요")
			lines.append("그늘진 굽은 길, 다리 위는 미리 천천히, 급브레이크와 급핸들은 피하기")
			main.hud.add_result(name_of("ice"), lines, not bad)
			ice_st = {}

# ── 공사 구간: 미리 방향지시등을 켜고 옆 차로로, 천천히 ──
func _tick_work(_dt: float) -> void:
	var c := car()
	var w: Dictionary = city().work
	var q = city().road_at(c.at(1.35, 0).x, c.at(1.35, 0).z)
	if q == null or not is_same(q.r, w.r) or cos(c.yaw - q.yaw) < 0:
		if work_st.has("in") and not work_st.has("done"):
			work_st = {}
		return
	var k := 1 if q.off > q.r.T.lw else 0
	if q.s > w.s0 - 90 and q.s < w.s1:
		if not work_st.has("in"):
			work_st = {"in": true, "k": k, "sig": null, "vmax": 0.0}
		if k != work_st.k and work_st.k == 1 and k == 0 and work_st.sig == null:
			work_st.sig = c.sig == 1
		work_st.k = k
		if q.s > w.s0 - 14:
			work_st.vmax = maxf(work_st.vmax, absf(c.v) * 3.6)
	elif work_st.has("in") and q.s >= w.s1 and not work_st.has("done"):
		work_st.done = true
		var lines := []
		if work_st.sig != null:
			lines.append("차로를 바꿀 때 방향지시등 %s" % ("켬" if work_st.sig else "안 켬"))
		lines.append("공사 구간 지날 때 가장 빠른 속도 시속 %dkm" % int(work_st.vmax))
		lines.append("공사 구간은 시속 30km 안쪽으로, 일하는 사람 조심")
		main.hud.add_result(name_of("work"), lines, work_st.vmax <= 32 and work_st.sig != false)

# 비: 웅덩이와 수막현상 (밖에서 한 걸음마다 부름) → 핸들 쏠림 힘, 마찰
func puddle_effect(dt: float) -> float:
	var c := car()
	var w := c.wheels()
	var lf := city().in_puddle(w[2].x, w[2].z)
	var rf := city().in_puddle(w[3].x, w[3].z)
	var lr := city().in_puddle(w[0].x, w[0].z)
	var rr := city().in_puddle(w[1].x, w[1].z)
	var l := (1 if lf else 0) + (1 if lr else 0)
	var r := (1 if rf else 0) + (1 if rr else 0)
	var kmh := absf(c.v) * 3.6
	c.ffb_extra = 0.0
	if l + r == 0:
		return 1.0
	# 한쪽 바퀴만 물에 들어가면 그쪽으로 끌림
	var pull := float(l - r) * 0.5 * clampf(kmh / 40.0, 0.0, 1.0)
	c.yaw += pull * 0.08 * dt * signf(c.v)
	c.ffb_extra = pull * 0.6
	c.v *= 1.0 - 0.12 * dt * (l + r) / 4.0
	main.splash(w[2] if l > 0 else w[3], kmh)
	if lf and rf and kmh > 45:
		if not hydro_said:
			hydro_said = true
			main.hud.toast("수막현상: 핸들이 가벼워져요. 브레이크 대신 가속 페달에서 발을 떼세요", "warn")
		return 0.18
	return 1.0
