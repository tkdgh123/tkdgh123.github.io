# 시험 봇: 사람처럼 차로를 따라 달림 (간단 조작). 신호를 지키고, 앞에 사람이나 차가 보이면 react초 뒤에 브레이크.
# 구급차가 오면 (yield_amb) 오른쪽 차로로 가거나 오른쪽 가장자리로 붙어 천천히
class_name Bot
extends RefCounted

var main
var react := 0.8
var yield_amb := true
var speed_k := 0.85
var seg: Dictionary
var s := 0.0
var path := []        # [[차로 조각, 시작 s]]
var hist := []        # [시각, 앞 장애물까지 거리]
var t := 0.0
var lat := 0.0
var rng := RandomNumberGenerator.new()
var stop_wait := 0.0
var stop_seg = null

func _init(m, r := 0.8, seed := 1) -> void:
	main = m
	react = r
	rng.seed = seed

func _city() -> City:
	return main.city

func _replan() -> void:
	var car: Car = main.car
	var ln = _city().lane_of(car.x, car.z, car.yaw, true)
	if ln == null:
		return
	seg = ln.seg
	s = ln.s
	_extend()

func _extend() -> void:
	path = [[seg, s]]
	var opts: Array = _city().moves(seg)
	var ok := []
	for m: Dictionary in opts:
		if _city().depart(_city().nodes[seg.to], m.d).r.type != "alley":
			ok.append(m)
	if not ok.is_empty():
		var m: Dictionary = ok[rng.randi() % ok.size()]
		var con: Dictionary = _city().connect_lane(seg, m.d, m.turn)
		path.append([con, 0.0])
		path.append([con.next, 0.0])

func change_lane(k: int) -> void:
	if seg.is_empty() or seg.con or seg.r.T.n < 2:
		return
	seg = _city().lane(seg.r, seg.dir, k)
	_extend()

func _locate() -> void: # 지금 경로 위 어디인지 (가까운 점)
	var car: Car = main.car
	var m := car.at(1.35, 0)
	var best := 1e9
	var bi := 0
	var bs := 0.0
	for i in mini(path.size(), 3):
		var sg: Dictionary = path[i][0]
		var P: Array = sg.pts
		for j in P.size():
			var q: Dictionary = P[j]
			var d: float = (q.x - m.x) * (q.x - m.x) + (q.z - m.z) * (q.z - m.z)
			if d < best:
				best = d
				bi = i
				bs = q.s
	if best > 64:
		_replan()
		return
	if bi > 0: # 다음 조각으로 넘어감
		path = path.slice(bi)
		path[0][1] = bs
		seg = path[0][0]
		if path.size() < 2 or (not seg.con and path.size() < 2):
			_extend_from_current()
	else:
		path[0][1] = bs
	s = bs
	if not seg.con and path.size() < 2:
		_extend_from_current()

func _extend_from_current() -> void:
	if seg.con:
		path = [[seg, s], [seg.next, 0.0]]
		return
	var keep := s
	_extend()
	path[0][1] = keep

func _target(ahead: float) -> Dictionary:
	var acc := 0.0
	for pf: Array in path:
		var sg: Dictionary = pf[0]
		var from: float = pf[1]
		if from + ahead - acc <= sg.L:
			return _city().pos_at(sg, from + ahead - acc)
		acc += sg.L - from
	var last: Dictionary = path[-1][0]
	return _city().pos_at(last, last.L)

func drive(dt: float) -> Dictionary:
	t += dt
	var car: Car = main.car
	if seg.is_empty():
		_replan()
		if seg.is_empty():
			return {"steer": 0.0, "thr": 0.0, "brk": 1.0}
	_locate()
	var v := absf(car.v)
	# 구급차가 뒤에 오면 비킴
	var want_lat := 0.0
	var amb_slow := false
	if yield_amb and main.events.act.has("amb"):
		var a: Dictionary = main.events.act.amb.c
		var rel: Vector2 = main.events._rel(a.x, a.z)
		if rel.x < 0 and rel.x > -60 and absf(rel.y) < 5:
			if not seg.con and seg.r.T.n == 2 and seg.k == 0:
				change_lane(1)
			elif not seg.con and seg.r.T.n == 1:
				want_lat = 1.0
				amb_slow = true
	lat = move_toward(lat, want_lat, dt * 0.8)
	var p := _target(maxf(3.6, v * 1.1))
	var px: float = p.x - cos(p.yaw) * lat
	var pz: float = p.z + sin(p.yaw) * lat
	var dx: float = px - car.x
	var dz: float = pz - car.z
	var sn := sin(car.yaw)
	var cs := cos(car.yaw)
	var xf := dx * sn + dz * cs
	var yl := dx * cs - dz * sn
	var k := 2.0 * yl / maxf(0.01, xf * xf + yl * yl)
	var steer := clampf(atan(k * Car.WB) / Car.DMAX, -1.0, 1.0)
	# 속도: 제한 속도, 굽은 길, 신호, 앞 장애물(반응 늦게)
	var want: float = seg.lim / 3.6 * speed_k * _city().speed_k
	if seg.con and seg.turn != "s":
		want = minf(want, 4.2)
	if amb_slow:
		want = minf(want, 2.5)
	if not seg.con and path.size() > 1:
		var n: Dictionary = _city().nodes[seg.to]
		var to_end: float = seg.L - s
		var con: Dictionary = path[1][0]
		if n.sig:
			var L: Dictionary = _city().light(n, seg.arm, main.sim_t)
			var ok: bool = (L.get("l", 0) == 1 if con.turn == "l" else L.get("g", 0) == 1) and not (v < 1 and L.get("left", 9.0) < 2.5)
			if not ok and not (L.get("y", 0) == 1 and to_end < v * v / 5):
				want = minf(want, sqrt(2 * 2.2 * maxf(0.0, to_end - 1.0)))
		elif n.stop.contains(seg.arm) and not is_same(stop_seg, seg): # 일시정지: 1.5초 멈췄다가 감
			want = minf(want, sqrt(2 * 2.2 * maxf(0.0, to_end - 0.6)))
			if to_end < 1.6 and v < 0.1:
				stop_wait += dt
				if stop_wait > 1.5:
					stop_seg = seg
					stop_wait = 0.0
		if to_end < 20 and con.turn != "s":
			want = minf(want, 5.0)
	# 공사 구간: 미리 왼쪽 방향지시등을 켜고 옆 차로로
	var w: Dictionary = _city().work
	if main.events.on.work and not seg.con and is_same(seg.r, w.r) and seg.dir == w.dir and seg.k == w.k:
		var sr: float = seg.base + s
		if sr > w.s0 - 75 and car.sig != 1:
			car.set_sig(1)
		if sr > w.s0 - 50:
			change_lane(0)
	var fake := {"x": car.x, "z": car.z, "kind": "car", "stuck": 0.0}
	var gap: float = _city()._gap(fake, path, null, false, lat)
	for who: Node3D in main.events.people(): # 길에 들어선 사람은 미리 봄 (내 길 옆 4.5m 안)
		var rp: Vector2 = main.events._rel(who.position.x, who.position.z)
		if rp.x > 0 and absf(rp.y - lat) < 4.5:
			gap = minf(gap, rp.x - 1.0)
	hist.append([t, gap])
	while hist.size() > 2 and hist[1][0] <= t - react:
		hist.pop_front()
	var seen: float = hist[0][1] if hist[0][0] <= t - react else 1e9
	var a_ok := minf(3.5, car.grip * Car.G * 0.9 * 0.75) # 미끄러운 길에선 일찍, 살살
	if seen < 1e8:
		want = minf(want, sqrt(2 * a_ok * maxf(0.0, seen - 2.0)))
	var e := want - v
	var thr := 0.0
	var brk := 0.0
	if want < 0.05:
		brk = 1.0 if v > 0.05 else 0.0
	elif e > 0:
		thr = clampf(e * 0.45, 0.0, 0.7)
	else:
		brk = clampf(-e * 0.35, 0.0, 1.0)
	if seen < 1e8 and seen < v * v / (2 * a_ok * 1.15) + 3.0:
		brk = 1.0
		thr = 0.0
	return {"steer": steer, "thr": thr, "brk": brk}
