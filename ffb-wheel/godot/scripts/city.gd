# 도시 (웹판 drive/city.js를 옮김): 왕복 4차로 큰길 둘 + 둘레 순환 도로 + 옆길, 이면도로. 신호 교차로 9곳, 일시정지 5곳.
# 다른 차는 차로를 따라 신호, 정지선, 앞차를 지키며 다니고, 보행자는 횡단보도를 건넌다.
# 여기에 날씨(속도, 제동)와 돌발 상황(급정거, 차로 바꾸기, 구급차, 양보, 공사 구간)에 필요한 것을 더함
class_name City
extends Node3D

const JR := 6.0
const SOLID := 20.0
const DIRS := {"N": Vector2(0, -1), "E": Vector2(1, 0), "S": Vector2(0, 1), "W": Vector2(-1, 0)}
const YAW := {"N": PI, "E": PI / 2, "S": 0.0, "W": -PI / 2}
const OPP := {"N": "S", "S": "N", "E": "W", "W": "E"}
const LEFT := {"N": "W", "W": "S", "S": "E", "E": "N"}
const RIGHT := {"N": "E", "E": "S", "S": "W", "W": "N"}
const TYPES := {
	"main": {"hw": 6.75, "n": 2, "lw": 3.25, "center": "yy", "lim": 50, "name": "큰길"},
	"ring": {"hw": 3.5, "n": 1, "lw": 3.5, "center": "y", "lim": 40, "name": "순환로"},
	"side": {"hw": 3.5, "n": 1, "lw": 3.5, "center": "y", "lim": 30, "name": "옆길"},
	"alley": {"hw": 3.5, "n": 1, "lw": 3.5, "center": "", "lim": 30, "name": "이면도로"},
}
const NODES := {"C": [0, 0, "sig"], "Nn": [0, -200, "sig"], "Ns": [0, 200, "sig"], "Nw": [-240, 0, "sig"], "Ne": [240, 0, "sig"], "Ja": [-120, 0, "sig"], "Jb": [0, -100, "sig"], "Jc": [120, 0, "sig"], "Jd": [0, 100, "sig"],
	"Ka": [-120, -200, "S"], "Kb": [240, -100, "W"], "Kc": [120, 200, "N"], "Kd": [240, 100, "W"], "X": [120, 100, "NS"]}
const ROADS := [
	["Nw", "Ja", "main"], ["Ja", "C", "main"], ["C", "Jc", "main"], ["Jc", "Ne", "main"],
	["Nn", "Jb", "main"], ["Jb", "C", "main"], ["C", "Jd", "main"], ["Jd", "Ns", "main"],
	["Ka", "Ja", "alley"], ["Jb", "Kb", "side"], ["Jc", "X", "side"], ["X", "Kc", "side"], ["Jd", "X", "side"], ["X", "Kd", "side"],
	["Nn", "Ka", "ring"], ["Ka", "Nw", "ring", "W", [["l", 100], ["a", 20, PI / 2], ["l", 180]]], ["Nw", "Ns", "ring", "S", [["l", 180], ["a", 20, PI / 2], ["l", 220]]],
	["Ns", "Kc", "ring"], ["Kc", "Kd", "ring", "E", [["l", 100], ["a", 20, PI / 2], ["l", 80]]], ["Kd", "Ne", "ring"], ["Ne", "Kb", "ring"], ["Kb", "Nn", "ring", "N", [["l", 80], ["a", 20, PI / 2], ["l", 220]]],
]
const C_GROUND := Color("#cfccc3")
const C_ASPH := Color("#44454a")
const C_WHITE := Color("#f2f1ec")
const C_YELLOW := Color("#e8b42a")
const C_CURB := Color("#e4e1d8")
const C_RED := Color("#9c4a40")
const CARCOL := [Color("#f2f1ec"), Color("#d9d6cc"), Color("#8f8f8c"), Color("#2a2b30"), Color("#6c7a99"), Color("#2b44a6"), Color("#a33a2c"), Color("#e4e2da")]
const PCOL := [Color("#2b44a6"), Color("#a33a2c"), Color("#3c6b3a"), Color("#8f8b80"), Color("#e8b42a"), Color("#2a2b30")]

var nodes := {}
var roads := []
var boxes := []          # 부딪히는 물체 {x, z, hw, hl, r}
var parked := []
var crossings := []
var ai := []
var peds := []
var school: Dictionary
var alley: Dictionary
var start := {}
var grid := {}
var lane_cache := {}
var con_cache := {}
var all_lanes := []
var map_lines := []
var puddles := []        # 비 올 때 물웅덩이 {x, z, rx, rz, yaw}
var ice := []            # 빙판 {r, s0, s1}
var lamps := []          # 가로등 자리
var ground_mat: ShaderMaterial
var bld_mat: ShaderMaterial
var leaf_mat: ShaderMaterial
var lamp_head_mat: StandardMaterial3D
var puddle_node: MeshInstance3D
var ice_node: MeshInstance3D
var work_node: Node3D
var work := {}           # 공사 구간 {r, dir, k, s0, s1, on}
var extra_obs := []      # 돌발 상황 사람 같은 장애물 [{x, z, half}]
var speed_k := 1.0       # 날씨에 따른 다른 차 속도
var decel_max := 7.0
var night := false
var acc := 0.0
var rng := RandomNumberGenerator.new()

# ───────── 짓기 ─────────
func build() -> void:
	rng.seed = 20261118
	ground_mat = ShaderMaterial.new()
	ground_mat.shader = load("res://shaders/ground.gdshader")
	bld_mat = ShaderMaterial.new()
	bld_mat.shader = load("res://shaders/building.gdshader")
	leaf_mat = ShaderMaterial.new()
	leaf_mat.shader = load("res://shaders/leaf.gdshader")
	var fl := Kit.Flat.new()
	for id in NODES:
		var a: Array = NODES[id]
		var k: String = a[2]
		nodes[id] = {"id": id, "x": float(a[0]), "z": float(a[1]), "sig": k == "sig", "stop": "" if k == "sig" else k, "arms": {}, "off": rng.randf() * 60.0}
	var rid := 0
	for spec: Array in ROADS:
		var A: Dictionary = nodes[spec[0]]
		var B: Dictionary = nodes[spec[1]]
		var d: String
		var segs: Array
		if spec.size() > 3:
			d = spec[3]
			segs = spec[4]
		else:
			d = "E" if B.x > A.x else "W" if B.x < A.x else "S" if B.z > A.z else "N"
			segs = [["l", Vector2(B.x - A.x, B.z - A.z).length()]]
		var pts := [{"x": A.x, "z": A.z, "yaw": YAW[d], "s": 0.0}]
		for s in segs:
			if s[0] == "l":
				Kit.path_line(pts, s[1])
			else:
				Kit.path_arc(pts, s[1], s[2])
		var r := {"id": rid, "a": spec[0], "b": spec[1], "d0": d, "d1": _dir_of(pts[-1].yaw), "T": TYPES[spec[2]], "type": spec[2], "pts": pts, "L": pts[-1].s}
		A.arms[d] = r
		B.arms[OPP[r.d1]] = r
		roads.append(r)
		rid += 1
	for id in nodes:
		var n: Dictionary = nodes[id]
		n.bx = maxf(_hw_arm(n, "N"), _hw_arm(n, "S")) + JR + 1
		n.bz = maxf(_hw_arm(n, "E"), _hw_arm(n, "W")) + JR + 1
	for r: Dictionary in roads:
		var A: Dictionary = nodes[r.a]
		var B: Dictionary = nodes[r.b]
		r.s0 = stop_at(A, r.d0)
		r.s1 = r.L - stop_at(B, OPP[r.d1])
		r.cut = {"R0": _hw_arm(A, RIGHT[r.d0]) + JR if A.arms.has(RIGHT[r.d0]) else 0.0, "L0": _hw_arm(A, LEFT[r.d0]) + JR if A.arms.has(LEFT[r.d0]) else 0.0,
			"R1": _hw_arm(B, RIGHT[r.d1]) + JR if B.arms.has(RIGHT[r.d1]) else 0.0, "L1": _hw_arm(B, LEFT[r.d1]) + JR if B.arms.has(LEFT[r.d1]) else 0.0}
	# 길 그리기
	for r: Dictionary in roads:
		var T: Dictionary = r.T
		var P: Array = r.pts
		var lp := Kit.cut(P, r.s0, r.s1)
		fl.band(P, -T.hw, T.hw, C_ASPH, 0.02, 1.0, T.lw)
		if T.center == "yy":
			for o in [-0.17, 0.17]:
				fl.band(lp, o - 0.06, o + 0.06, C_YELLOW, 0.035, 2.0)
		elif T.center == "y":
			fl.band(lp, -0.075, 0.075, C_YELLOW, 0.035, 2.0)
		if T.n == 2:
			for sd in [-1, 1]:
				var o: float = sd * T.lw
				var solid := [r.s1 - SOLID, r.s1] if sd > 0 else [r.s0, r.s0 + SOLID]
				var dsh := [r.s0, r.s1 - SOLID] if sd > 0 else [r.s0 + SOLID, r.s1]
				fl.band(Kit.cut(P, solid[0], solid[1]), o - 0.075, o + 0.075, C_WHITE, 0.035, 2.0)
				fl.dash(Kit.cut(P, dsh[0], dsh[1]), o, 0.15, 3, 5, C_WHITE, 0.035)
		for sd in [-1, 1]:
			var a: float = r.cut.R0 if sd > 0 else r.cut.L0
			var b: float = r.L - (r.cut.R1 if sd > 0 else r.cut.L1)
			var cp := Kit.cut(P, a, b)
			if cp.size() > 1:
				fl.band(cp, sd * T.hw, sd * (T.hw + 0.25), C_CURB, 0.13, 0.0)
				fl.band(cp, sd * (T.hw + 0.25), sd * (T.hw + 2.6), C_CURB.darkened(0.06), 0.12, 0.0) # 보도
	# 교차로 모퉁이
	for id in nodes:
		var n: Dictionary = nodes[id]
		for d in ["N", "E", "S", "W"]:
			var e: String = RIGHT[d]
			if not n.arms.has(d) or not n.arms.has(e):
				continue
			var sx: float = DIRS[d].x + DIRS[e].x
			var sz: float = DIRS[d].y + DIRS[e].y
			var ns: String = d if d == "N" or d == "S" else e
			var ew: String = e if ns == d else d
			var corner := {"x": n.x + sx * _hw_arm(n, ns), "z": n.z + sz * _hw_arm(n, ew)}
			var c := {"x": corner.x + sx * JR, "z": corner.z + sz * JR}
			var a0 := atan2(0, -sx)
			var a1 := atan2(-sz, 0)
			if absf(a1 - a0) > PI:
				a1 += 2 * PI * signf(a0 - a1)
			var R := Kit.arc_pts(c.x, c.z, JR, a0, a1)
			var Ri := Kit.arc_pts(c.x, c.z, JR - 0.25, a0, a1)
			fl.fan(corner, R, C_ASPH, 0.02)
			for i in 12:
				fl.quad(R[i], R[i + 1], Ri[i + 1], Ri[i], C_CURB, 0.13, 0.0)
	# 횡단보도, 정지선
	for id in nodes:
		var n: Dictionary = nodes[id]
		for d in n.arms:
			var r: Dictionary = n.arms[d]
			var v: Vector2 = DIRS[d]
			var p: Vector2 = DIRS[LEFT[d]]
			var c0 := cw0(n, d)
			var hw: float = r.T.hw
			var ctr := {"x": n.x + v.x * (c0 + 2), "z": n.z + v.y * (c0 + 2)}
			_stripes(fl, ctr, v, p, 4, hw)
			crossings.append({"n": n, "d": d, "x": ctr.x, "z": ctr.z, "ax": v, "hl": 2.0, "hw": hw, "kids": false,
				"ends": [{"x": ctr.x + p.x * (hw + 1.6), "z": ctr.z + p.y * (hw + 1.6)}, {"x": ctr.x - p.x * (hw + 1.6), "z": ctr.z - p.y * (hw + 1.6)}]})
			if n.sig or n.stop.contains(d):
				var s := stop_at(n, d)
				var w: float = r.T.n * r.T.lw
				fl.quad(_q(n, v, p, s, 0.3), _q(n, v, p, s + 0.45, 0.3), _q(n, v, p, s + 0.45, w), _q(n, v, p, s, w), C_WHITE, 0.036, 2.0)
			if n.stop.contains(d):
				var s := stop_at(n, d) + 3
				var sp := _q(n, v, p, s, hw + 0.9)
				Kit.sign_post(self, "stop", "", sp.x, sp.z, YAW[d])
				boxes.append({"x": sp.x, "z": sp.z, "hw": 0.1, "hl": 0.1, "r": 0.0})
				var tp := _q(n, v, p, s + 3, hw / 2)
				Kit.floor_text(self, "정지", tp.x, tp.z, YAW[OPP[d]], 2.4)
	# 신호 계획: 네 갈래 = 남북 직진 → 남북 좌회전 → 동서 직진 → 동서 좌회전. 세 갈래 = 큰길 직진 → 옆길로 좌회전 → 옆길. 각 뒤에 노랑 3초, 전부 빨강 2초
	for id in nodes:
		var n: Dictionary = nodes[id]
		if not n.sig:
			continue
		var arms: Array = n.arms.keys()
		if arms.size() == 4:
			n.plan = [{"g": "NS", "t": 16.0, "walk": "EW"}, {"l": "NS", "t": 7.0}, {"g": "EW", "t": 16.0, "walk": "NS"}, {"l": "EW", "t": 7.0}]
		else:
			var side := ""
			for a: String in arms:
				if not arms.has(OPP[a]):
					side = a
			var main := ""
			var lt := ""
			for a: String in arms:
				if a != side:
					main += a
					if LEFT[OPP[a]] == side:
						lt = a
			n.plan = [{"g": main, "t": 18.0, "walk": side}, {"g": lt, "l": lt, "t": 7.0}, {"g": side, "l": side, "t": 10.0, "walk": main}]
		var cyc := 0.0
		for p: Dictionary in n.plan:
			cyc += p.t + 5
		n.cyc = cyc
		n.heads = []
		for d: String in arms:
			var h: String = OPP[d]
			var fv: Vector2 = DIRS[h]
			var rv: Vector2 = DIRS[RIGHT[h]]
			var far: float
			if n.arms.has(h):
				far = _ext(n, h) + 4
			else:
				far = _hw_arm(n, LEFT[h]) if _hw_arm(n, LEFT[h]) > 0 else _hw_arm(n, RIGHT[h])
			var w: float = n.arms[d].T.n * n.arms[d].T.lw
			var x: float = n.x + fv.x * (far + 1.5) + rv.x * (w + 1.6)
			var z: float = n.z + fv.y * (far + 1.5) + rv.y * (w + 1.6)
			boxes.append({"x": x, "z": z, "hw": 0.15, "hl": 0.15, "r": 0.0})
			n.heads.append({"d": d, "lamps": Kit.signal_head(self, x, z, YAW[h] + PI, w + 1.6)})
	# 어린이 보호구역 (옆길 Jd→X, 학교 앞)
	for r: Dictionary in roads:
		if r.a == "Jd" and r.b == "X":
			school = r
		if r.type == "alley":
			alley = r
	school.zone = [school.s0 + 2, school.s1 - 2]
	var zp := Kit.cut(school.pts, school.zone[0], school.zone[1])
	fl.band(zp, -school.T.hw, school.T.hw, C_RED, 0.025, 3.0, school.T.lw)
	for pair in [[school.zone[0] + 6, 1], [school.zone[1] - 6, -1]]:
		var q: Dictionary = Kit.cut(school.pts, pair[0], pair[0] + 1)[0]
		var p := Kit.off_pt(q, pair[1] * 1.75)
		Kit.floor_text(self, "어린이 보호구역", p.x, p.z, q.yaw + (0.0 if pair[1] > 0 else PI), 3.1)
	for pair in [[school.zone[0] - 4, 1], [school.zone[1] + 4, -1]]:
		var q := Kit.off_pt(Kit.cut(school.pts, pair[0], pair[0] + 1)[0], pair[1] * (school.T.hw + 1))
		var face: float = school.pts[0].yaw + (PI if pair[1] > 0 else 0.0)
		Kit.sign_post(self, "kids", "", q.x, q.z, face, 2.6)
		Kit.sign_post(self, "max", "30", q.x, q.z, face, 1.8, 0.62)
		boxes.append({"x": q.x, "z": q.z, "hw": 0.1, "hl": 0.1, "r": 0.0})
	var mid: Dictionary = Kit.cut(school.pts, 60, 61)[0]
	var mv := Vector2(sin(mid.yaw), cos(mid.yaw))
	var mp := Vector2(cos(mid.yaw), -sin(mid.yaw))
	_stripes(fl, mid, mv, mp, 4, school.T.hw)
	crossings.append({"n": null, "d": "", "x": mid.x, "z": mid.z, "ax": mv, "hl": 2.0, "hw": school.T.hw, "kids": true,
		"ends": [{"x": mid.x + mp.x * 5.2, "z": mid.z + mp.y * 5.2}, {"x": mid.x - mp.x * 5.2, "z": mid.z - mp.y * 5.2}]})
	# 이면도로: 서쪽 가장자리에 주차된 차들
	for s in [22, 31, 63, 72, 115, 124, 150, 168]:
		var q: Dictionary = Kit.cut(alley.pts, s, s + 1)[0]
		var o := Kit.off_pt(q, 2.35)
		var m := Kit.car_mesh(self, CARCOL[(s * 7) % CARCOL.size()])
		m.position = Vector3(o.x, 0, o.z)
		m.rotation.y = q.yaw
		var b := {"x": o.x, "z": o.z, "hw": 0.9, "hl": 2.25, "r": q.yaw}
		boxes.append(b)
		parked.append(b)
	var sp0 := Kit.off_pt(Kit.cut(alley.pts, 46, 47)[0], 2.35)
	start = {"x": sp0.x, "z": sp0.z - Car.WB / 2, "yaw": 0.0}
	# 찾기 격자 (가장 가까운 길)
	for r: Dictionary in roads:
		var P: Array = r.pts
		for i in range(0, P.size(), 2):
			var k := _gkey(floori(P[i].x / 12.0), floori(P[i].z / 12.0))
			if not grid.has(k):
				grid[k] = []
			grid[k].append([r, i])
	_dress(fl)
	# 땅
	fl.quad({"x": -450.0, "z": -450.0}, {"x": 450.0, "z": -450.0}, {"x": 450.0, "z": 450.0}, {"x": -450.0, "z": 450.0}, C_GROUND, 0.0, 0.0)
	add_child(fl.mesh(ground_mat))
	_weather_spots()
	# 차로 그래프와 다른 차, 보행자
	for r: Dictionary in roads:
		if r.type == "alley":
			continue
		for dir in [1, -1]:
			for k in r.T.n:
				all_lanes.append(lane(r, dir, k))
	for i in 22:
		spawn_ai(CARCOL[i % CARCOL.size()])
	for cr: Dictionary in crossings:
		for k in (2 if cr.kids else 1):
			var m := Kit.person(self, PCOL[(peds.size() * 5) % PCOL.size()], 0.75 if cr.kids else 1.0)
			var side := 0 if rng.randf() < 0.5 else 1
			var e: Dictionary = cr.ends[side]
			m.position = Vector3(e.x, 0, e.z)
			peds.append({"cr": cr, "m": m, "side": side, "t": 0.0, "wait": 2 + rng.randf() * 20, "walking": false, "x": e.x, "z": e.z, "sp": 1.2 + rng.randf() * 0.4, "off": (rng.randf() - 0.5) * 2.4})
	for r: Dictionary in roads:
		var L := []
		for i in r.pts.size():
			if i % 3 == 0 or i == r.pts.size() - 1:
				L.append(Vector2(r.pts[i].x, r.pts[i].z))
		map_lines.append(L)

func _q(n: Dictionary, v: Vector2, p: Vector2, a: float, b: float) -> Dictionary:
	return {"x": n.x + v.x * a + p.x * b, "z": n.z + v.y * a + p.y * b}

func _stripes(fl: Kit.Flat, ctr: Dictionary, along: Vector2, across: Vector2, length: float, half: float) -> void:
	var k := -half + 0.25
	while k < half - 0.3:
		var o := func(a: float, b: float) -> Dictionary: return {"x": ctr.x + along.x * a + across.x * b, "z": ctr.z + along.y * a + across.y * b}
		fl.quad(o.call(-length / 2, k), o.call(length / 2, k), o.call(length / 2, k + 0.5), o.call(-length / 2, k + 0.5), C_WHITE, 0.036, 2.0)
		k += 1.0

func _dir_of(yaw: float) -> String:
	var fx := sin(yaw)
	var fz := cos(yaw)
	if absf(fx) > absf(fz):
		return "E" if fx > 0 else "W"
	return "S" if fz > 0 else "N"

func _hw_arm(n: Dictionary, d: String) -> float:
	return n.arms[d].T.hw if n.arms.has(d) else 0.0

func _ext(n: Dictionary, d: String) -> float:
	return maxf(_hw_arm(n, LEFT[d]), _hw_arm(n, RIGHT[d]))

func cw0(n: Dictionary, d: String) -> float: # 횡단보도 시작 거리 (폭 4m), 정지선은 그 2m 뒤
	return _ext(n, d) + JR + 1.5

func stop_at(n: Dictionary, d: String) -> float:
	return cw0(n, d) + 6

func _gkey(i: int, j: int) -> int:
	return i * 1000 + j

# 가장 가까운 길과 그 위치 (s, off: 길 방향 오른쪽 +)
func road_at(x: float, z: float):
	var best = null
	var bd := 1e9
	var i0 := floori(x / 12.0)
	var j0 := floori(z / 12.0)
	for a in range(-1, 2):
		for b in range(-1, 2):
			var k := _gkey(i0 + a, j0 + b)
			if not grid.has(k):
				continue
			for e: Array in grid[k]:
				var p: Dictionary = e[0].pts[e[1]]
				var d: float = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z)
				if d < bd:
					bd = d
					best = e
	if best == null or bd > 225:
		return null
	var r: Dictionary = best[0]
	var i: int = best[1]
	var j := i
	var jd := bd
	for k in [i - 1, i + 1, i - 2, i + 2]:
		if k < 0 or k >= r.pts.size():
			continue
		var p: Dictionary = r.pts[k]
		var d: float = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z)
		if d < jd:
			jd = d
			j = k
	var p: Dictionary = r.pts[j]
	var fx := sin(p.yaw)
	var fz := cos(p.yaw)
	var dx: float = x - p.x
	var dz: float = z - p.z
	return {"r": r, "s": p.s + dx * fx + dz * fz, "off": dz * fx - dx * fz, "yaw": p.yaw}

func _near_road(x: float, z: float, pad: float) -> bool:
	var q = road_at(x, z)
	return q != null and absf(q.off) < q.r.T.hw + pad

func _near_node(x: float, z: float, pad: float) -> bool:
	for id in nodes:
		var n: Dictionary = nodes[id]
		if absf(x - n.x) < pad + 14 and absf(z - n.z) < pad + 14:
			return true
	return false

# ───────── 건물, 나무, 표지, 가로등 ─────────
func _dress(_fl: Kit.Flat) -> void:
	var blds := []
	var r2 := RandomNumberGenerator.new()
	r2.seed = 5
	var rnd := func() -> float: return r2.randf()
	var add_bld := func(x: float, z: float, w: float, d: float, h: float, col: Color) -> void:
		blds.append([x, z, w, d, h, col])
		boxes.append({"x": x, "z": z, "hw": w / 2, "hl": d / 2, "r": 0.0})
	add_bld.call(-148.0, -150.0, 24.0, 50.0, 9.0, Color("#f2f1ec"))
	_label(-135.9, 7.0, -150.0, PI / 2, "운전면허시험장", 16.0, Color("#2b44a6"))
	add_bld.call(60.0, 132.0, 50.0, 22.0, 11.0, Color("#e8e2d2"))
	_label(60.0, 9.0, 120.9, PI, "초등학교", 12.0, Color("#3c6b3a"))
	var BCOL := [Color("#f2f1ec"), Color("#e4e2da"), Color("#d9d6cc"), Color("#c9c6bc"), Color("#b8bcc6"), Color("#9aa6bf"), Color("#e8e2d2")]
	for i in 900:
		var x: float = -300 + rnd.call() * 600
		var z: float = -260 + rnd.call() * 520
		var w: float = 10 + rnd.call() * 14
		var d: float = 10 + rnd.call() * 14
		var inside := absf(x) < 248 and absf(z) < 208
		var h: float = 6 + rnd.call() * (40.0 if absf(x) < 130 and absf(z) < 110 else 18.0) if inside else 8 + rnd.call() * 30
		var pad := maxf(w, d) / 2 + 5
		if _near_road(x, z, pad) or _near_road(x + w / 2, z + d / 2, 5) or _near_road(x - w / 2, z - d / 2, 5) or _near_road(x + w / 2, z - d / 2, 5) or _near_road(x - w / 2, z + d / 2, 5) or _near_node(x, z, pad):
			continue
		var hit := false
		for b: Dictionary in boxes:
			if absf(b.x - x) < b.hw + w / 2 + 3 and absf(b.z - z) < b.hl + d / 2 + 3:
				hit = true
				break
		if hit:
			continue
		add_bld.call(x, z, w, d, h, BCOL[int(rnd.call() * BCOL.size()) % BCOL.size()])
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.mesh = BoxMesh.new()
	mm.instance_count = blds.size()
	for i in blds.size():
		var b: Array = blds[i]
		mm.set_instance_transform(i, Transform3D(Basis.from_scale(Vector3(b[2], b[4], b[3])), Vector3(b[0], b[4] / 2, b[1])))
		mm.set_instance_color(i, b[5])
	var mmi := MultiMeshInstance3D.new()
	mmi.multimesh = mm
	mmi.material_override = bld_mat
	add_child(mmi)
	# 큰길 가로수
	var trees := []
	for r: Dictionary in roads:
		if r.type != "main":
			continue
		var s: float = r.s0 + 12
		while s < r.s1 - 12:
			for sdd in [-1, 1]:
				var q := Kit.off_pt(Kit.cut(r.pts, s, s + 1)[0], sdd * (r.T.hw + 1.6))
				if _near_node(q.x, q.z, 2):
					continue
				trees.append(Vector3(q.x, 0, q.z))
				boxes.append({"x": q.x, "z": q.z, "hw": 0.25, "hl": 0.25, "r": 0.0})
			s += 16
	var tm := MultiMesh.new()
	tm.transform_format = MultiMesh.TRANSFORM_3D
	var trunk := CylinderMesh.new()
	trunk.top_radius = 0.14
	trunk.bottom_radius = 0.18
	trunk.height = 2.2
	trunk.radial_segments = 7
	trunk.material = Kit.mat(Color("#6b5a48"), 0.9)
	tm.mesh = trunk
	tm.instance_count = trees.size()
	var lm := MultiMesh.new()
	lm.transform_format = MultiMesh.TRANSFORM_3D
	lm.use_colors = true
	var leaf := SphereMesh.new()
	leaf.radius = 1.6
	leaf.height = 2.9
	leaf.radial_segments = 7
	leaf.rings = 4
	lm.mesh = leaf
	lm.instance_count = trees.size()
	for i in trees.size():
		tm.set_instance_transform(i, Transform3D(Basis(), trees[i] + Vector3(0, 1.1, 0)))
		lm.set_instance_transform(i, Transform3D(Basis(Vector3.UP, i * 1.7), trees[i] + Vector3(0, 3.3, 0)))
		lm.set_instance_color(i, Color("#4d5b3f") if i % 2 == 0 else Color("#667552"))
	var tmi := MultiMeshInstance3D.new()
	tmi.multimesh = tm
	add_child(tmi)
	var lmi := MultiMeshInstance3D.new()
	lmi.multimesh = lm
	lmi.material_override = leaf_mat
	add_child(lmi)
	# 제한 속도 표지 (길 시작마다)
	for r: Dictionary in roads:
		if is_same(r, school):
			continue
		for e in [[r.s0 + 8, 1, r.pts[0].yaw + PI], [r.s1 - 8, -1, r.pts[-1].yaw]]:
			var q := Kit.off_pt(Kit.cut(r.pts, e[0], e[0] + 1)[0], e[1] * (r.T.hw + 0.8))
			Kit.sign_post(self, "max", str(r.T.lim), q.x, q.z, e[2], 2.2, 0.6)
			boxes.append({"x": q.x, "z": q.z, "hw": 0.1, "hl": 0.1, "r": 0.0})
	# 가로등: 큰길과 순환로 오른쪽 보도에 35m마다 (밤에 켜짐)
	for r: Dictionary in roads:
		if r.type != "main" and r.type != "ring":
			continue
		var s: float = r.s0 + 6
		while s < r.s1 - 6:
			var q := Kit.off_pt(Kit.cut(r.pts, s, s + 1)[0], r.T.hw + 1.1)
			if not _near_node(q.x, q.z, 0):
				lamps.append({"x": q.x, "z": q.z, "yaw": q.yaw})
				boxes.append({"x": q.x, "z": q.z, "hw": 0.12, "hl": 0.12, "r": 0.0})
			s += 35
	var pm := MultiMesh.new()
	pm.transform_format = MultiMesh.TRANSFORM_3D
	var pole := CylinderMesh.new()
	pole.top_radius = 0.07
	pole.bottom_radius = 0.09
	pole.height = 7.0
	pole.radial_segments = 6
	pole.material = Kit.POLE
	pm.mesh = pole
	pm.instance_count = lamps.size()
	var hm := MultiMesh.new()
	hm.transform_format = MultiMesh.TRANSFORM_3D
	var head := BoxMesh.new()
	head.size = Vector3(0.35, 0.16, 1.2)
	lamp_head_mat = Kit.mat(Color(1.0, 0.86, 0.6), 0.4).duplicate() as StandardMaterial3D
	head.material = lamp_head_mat
	hm.mesh = head
	hm.instance_count = lamps.size()
	for i in lamps.size():
		var L: Dictionary = lamps[i]
		pm.set_instance_transform(i, Transform3D(Basis(), Vector3(L.x, 3.5, L.z)))
		var inward := Vector3(cos(L.yaw), 0, -sin(L.yaw)) # 길 쪽 (왼쪽)
		hm.set_instance_transform(i, Transform3D(Basis(Vector3.UP, L.yaw + PI / 2), Vector3(L.x, 7.0, L.z) + inward * 0.6))
	for m: MultiMesh in [pm, hm]:
		var mi := MultiMeshInstance3D.new()
		mi.multimesh = m
		add_child(mi)

func _label(x: float, y: float, z: float, ry: float, txt: String, w: float, bg: Color) -> void:
	var g := Node3D.new()
	g.position = Vector3(x, y, z)
	g.rotation.y = ry
	add_child(g)
	Kit.box(g, Vector3(w, w / 7, 0.08), Vector3.ZERO, Kit.mat(bg, 0.6), false)
	var l := Kit.label3d(g, txt, Vector3(0, 0, 0.06), 128, Color.WHITE)
	l.pixel_size = w / (128.0 * txt.length() * 1.15)

# 물웅덩이(비), 빙판(블랙 아이스) 자리
func _weather_spots() -> void:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for r: Dictionary in roads:
		var s: float = r.s0 + 10
		while s < r.s1 - 10:
			if rng.randf() < 0.55:
				var side := 1 if rng.randf() < 0.75 else -1
				var q: Dictionary = Kit.cut(r.pts, s, s + 1)[0]
				var o: float = side * (r.T.hw - 0.9 - rng.randf() * 0.8)
				var p := Kit.off_pt(q, o)
				var pd := {"x": p.x, "z": p.z, "rx": 0.8 + rng.randf() * 0.7, "rz": 1.6 + rng.randf() * 1.6, "yaw": q.yaw}
				puddles.append(pd)
				_ellipse(st, pd, 0.03)
			s += 22 + rng.randf() * 30
	puddle_node = MeshInstance3D.new()
	puddle_node.mesh = st.commit()
	var pmat := StandardMaterial3D.new()
	pmat.albedo_color = Color(0.13, 0.14, 0.17)
	pmat.roughness = 0.03
	pmat.metallic = 0.25
	pmat.metallic_specular = 1.0
	puddle_node.material_override = pmat
	puddle_node.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	puddle_node.visible = false
	add_child(puddle_node)
	# 빙판: 순환로 굽은 곳 넷 + 큰길 교차로 앞 하나 (그늘진 곳처럼)
	var st2 := SurfaceTool.new()
	st2.begin(Mesh.PRIMITIVE_TRIANGLES)
	for r: Dictionary in roads:
		var seg := []
		if r.type == "ring": # 굽은 곳: 직선 뒤 호
			for i in range(1, r.pts.size()):
				if absf(Kit.wrap_a(r.pts[i].yaw - r.pts[i - 1].yaw)) > 0.001:
					seg = [r.pts[i].s - 6.0, r.pts[i].s + 26.0]
					break
		elif r.a == "C" and r.b == "Jd":
			seg = [r.s1 - 34.0, r.s1 - 16.0]
		if seg.is_empty() or seg[0] >= seg[1]:
			continue
		ice.append({"r": r, "s0": seg[0], "s1": seg[1]})
		var pts := Kit.cut(r.pts, seg[0], seg[1])
		for i in range(pts.size() - 1):
			var a: Dictionary = pts[i]
			var b: Dictionary = pts[i + 1]
			var vs := [Kit.off_pt(a, -r.T.hw), Kit.off_pt(b, -r.T.hw), Kit.off_pt(b, r.T.hw), Kit.off_pt(a, r.T.hw)]
			for t in [[0, 2, 1], [0, 3, 2]]:
				for k in t:
					st2.set_normal(Vector3.UP)
					st2.add_vertex(Vector3(vs[k].x, 0.038, vs[k].z))
	ice_node = MeshInstance3D.new()
	ice_node.mesh = st2.commit()
	var imat := StandardMaterial3D.new()
	imat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	imat.albedo_color = Color(0.75, 0.82, 0.9, 0.16)
	imat.roughness = 0.02
	imat.metallic_specular = 1.0
	ice_node.material_override = imat
	ice_node.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	ice_node.visible = false
	add_child(ice_node)

func _ellipse(st: SurfaceTool, p: Dictionary, y: float) -> void:
	var c := Vector3(p.x, y, p.z)
	var f := Vector3(sin(p.yaw), 0, cos(p.yaw))
	var l := Vector3(cos(p.yaw), 0, -sin(p.yaw))
	var n := 14
	for i in n:
		var a0 := TAU * i / n
		var a1 := TAU * (i + 1) / n
		for v in [c, c + l * cos(a1) * p.rx + f * sin(a1) * p.rz, c + l * cos(a0) * p.rx + f * sin(a0) * p.rz]:
			st.set_normal(Vector3.UP)
			st.add_vertex(v)

func in_puddle(x: float, z: float) -> bool:
	for p: Dictionary in puddles:
		var dx: float = x - p.x
		var dz: float = z - p.z
		if absf(dx) > 3.5 or absf(dz) > 3.5:
			continue
		var f := dx * sin(p.yaw) + dz * cos(p.yaw)
		var l := dx * cos(p.yaw) - dz * sin(p.yaw)
		if (l / p.rx) * (l / p.rx) + (f / p.rz) * (f / p.rz) < 1.0:
			return true
	return false

func on_ice(x: float, z: float) -> bool:
	var q = road_at(x, z)
	if q == null:
		return false
	for e: Dictionary in ice:
		if is_same(e.r, q.r) and q.s > e.s0 and q.s < e.s1 and absf(q.off) < q.r.T.hw:
			return true
	return false

# ───────── 공사 구간: 큰길 Ja→C 바깥 차로를 막고 라바콘 ─────────
func set_work(on: bool) -> void:
	if work.is_empty():
		var r: Dictionary
		for rr: Dictionary in roads:
			if rr.a == "Ja" and rr.b == "C":
				r = rr
		work = {"r": r, "dir": 1, "k": 1, "s0": r.s0 + 38.0, "s1": r.s0 + 72.0, "boxes": []}
		work_node = Node3D.new()
		add_child(work_node)
		var lw: float = r.T.lw
		var cone := CylinderMesh.new()
		cone.top_radius = 0.04
		cone.bottom_radius = 0.2
		cone.height = 0.7
		cone.radial_segments = 10
		var cmat := Kit.mat(Color(0.98, 0.42, 0.08), 0.6)
		var s: float = work.s0 - 14
		while s <= work.s1:
			var t := clampf((s - (work.s0 - 14)) / 14.0, 0.0, 1.0) # 테이퍼: 가장자리 → 차선
			var o: float = lerpf(r.T.hw - 0.3, lw + 0.25, t)
			var q := Kit.off_pt(Kit.cut(r.pts, s, s + 1)[0], o)
			var c := MeshInstance3D.new()
			c.mesh = cone
			c.material_override = cmat
			c.position = Vector3(q.x, 0.35, q.z)
			work_node.add_child(c)
			Kit.box(work_node, Vector3(0.36, 0.06, 0.36), Vector3(q.x, 0.03, q.z), Kit.mat(Color(0.1, 0.1, 0.1)), false)
			var b := {"x": q.x, "z": q.z, "hw": 0.2, "hl": 0.2, "r": 0.0}
			work.boxes.append(b)
			s += 2.5 if t < 1.0 else 4.0
		# 막힌 차로 안: 화살표 판, 일하는 사람, 흙더미
		var ab := Kit.off_pt(Kit.cut(r.pts, work.s0 - 4, work.s0 - 3)[0], lw * 1.5)
		var board := Node3D.new()
		board.position = Vector3(ab.x, 0, ab.z)
		board.rotation.y = r.pts[0].yaw + PI
		work_node.add_child(board)
		Kit.box(board, Vector3(1.6, 1.0, 0.12), Vector3(0, 1.3, 0), Kit.mat(Color(0.12, 0.12, 0.12)), true)
		var arrow := Kit.label3d(board, "◀ ◀ ◀", Vector3(0, 1.3, 0.07), 64, Color(1.0, 0.75, 0.1))
		arrow.shaded = false
		arrow.pixel_size = 0.0055
		work.arrow = arrow
		work.boxes.append({"x": ab.x, "z": ab.z, "hw": 0.8, "hl": 0.3, "r": r.pts[0].yaw})
		var wp := Kit.off_pt(Kit.cut(r.pts, work.s0 + 12, work.s0 + 13)[0], lw * 1.6)
		var man := Kit.person(work_node, Color(0.98, 0.55, 0.1))
		man.position = Vector3(wp.x, 0, wp.z)
		man.rotation.y = r.pts[0].yaw + PI / 2
		work.boxes.append({"x": wp.x, "z": wp.z, "hw": 0.3, "hl": 0.3, "r": 0.0})
		var hp := Kit.off_pt(Kit.cut(r.pts, work.s0 + 24, work.s0 + 25)[0], lw * 1.5)
		var heap := Kit.box(work_node, Vector3(2.2, 0.8, 5.0), Vector3(hp.x, 0.4, hp.z), Kit.mat(Color(0.45, 0.38, 0.3), 1.0), true)
		heap.rotation.y = r.pts[0].yaw
		work.boxes.append({"x": hp.x, "z": hp.z, "hw": 1.1, "hl": 2.5, "r": r.pts[0].yaw})
		var sg := Kit.off_pt(Kit.cut(r.pts, r.s0 + 4, r.s0 + 5)[0], r.T.hw + 0.8)
		Kit.sign_post(work_node, "work", "", sg.x, sg.z, r.pts[0].yaw + PI)
		work.sign = {"x": sg.x, "z": sg.z, "hw": 0.1, "hl": 0.1, "r": 0.0}
		work.boxes.append(work.sign)
	work.on = on
	work_node.visible = on
	for b: Dictionary in work.boxes:
		if on and not boxes.has(b):
			boxes.append(b)
		elif not on:
			boxes.erase(b)

# ───────── 차로 그래프 ─────────
func lane(r: Dictionary, dir: int, k: int) -> Dictionary: # dir +1 = 길 점 순서대로. 정지선(출발 쪽은 횡단보도 끝)에서 정지선까지
	var key := "%d|%d|%d" % [r.id, dir, k]
	if lane_cache.has(key):
		return lane_cache[key]
	var A: Dictionary = nodes[r.a]
	var B: Dictionary = nodes[r.b]
	var o: float = r.T.lw * (k + 0.5) if r.type != "alley" else 0.5 # 이면도로는 오른쪽에 차가 서 있어 가운데 가까이
	var sA: float = cw0(A, r.d0) + 4.3
	var sB: float = r.L - cw0(B, OPP[r.d1]) - 4.3
	var pts: Array
	if dir > 0:
		pts = Kit.cut(r.pts, sA, r.s1)
	else:
		pts = []
		var c := Kit.cut(r.pts, r.s0, sB)
		c.reverse()
		for p: Dictionary in c:
			pts.append({"x": p.x, "z": p.z, "yaw": p.yaw + PI, "s": p.s})
	var out := []
	var s := 0.0
	for i in pts.size():
		var p := Kit.off_pt(pts[i], o)
		if i > 0:
			s += Vector2(p.x - out[-1].x, p.z - out[-1].z).length()
		p.s = s
		out.append(p)
	var seg := {"r": r, "dir": dir, "k": k, "pts": out, "L": s, "to": r.b if dir > 0 else r.a, "arm": OPP[r.d1] if dir > 0 else r.d0, "lim": r.T.lim, "school": is_same(r, school), "con": false,
		"base": sA if dir > 0 else sB}
	lane_cache[key] = seg
	return seg

func depart(n: Dictionary, d: String):
	if not n.arms.has(d):
		return null
	var r: Dictionary = n.arms[d]
	return {"r": r, "dir": 1 if r.a == n.id and r.d0 == d else -1}

func moves(seg: Dictionary) -> Array: # 이 차로 끝 교차로에서 갈 수 있는 곳
	var n: Dictionary = nodes[seg.to]
	var h: String = OPP[seg.arm]
	var out := []
	for d: String in n.arms:
		if d == seg.arm:
			continue
		var turn := "s" if d == h else "l" if d == LEFT[h] else "r"
		if seg.r.T.n == 2 and ((seg.k == 0 and turn == "r") or (seg.k == 1 and turn == "l")):
			continue
		out.append({"turn": turn, "d": d})
	return out

func connect_lane(seg: Dictionary, d: String, turn: String) -> Dictionary: # 교차로 안 곡선 + 나가는 차로
	var key := "%d|%d|%d>%s" % [seg.r.id, seg.dir, seg.k, d]
	if con_cache.has(key):
		return con_cache[key]
	var n: Dictionary = nodes[seg.to]
	var dp: Dictionary = depart(n, d)
	var k: int = 0 if turn == "l" else dp.r.T.n - 1 if turn == "r" else mini(seg.k, dp.r.T.n - 1)
	var nxt := lane(dp.r, dp.dir, k)
	# 곧게 가다가 모퉁이에서 둥글게 (우회전 반경 8m, 좌회전 14m): 두 차로 선이 만나는 점 K를 둥글게 깎음
	var a: Dictionary = seg.pts[-1]
	var b: Dictionary = nxt.pts[0]
	var fa := Vector2(sin(a.yaw), cos(a.yaw))
	var fb := Vector2(sin(b.yaw), cos(b.yaw))
	var raw := []
	if turn == "s":
		raw = [a, b]
	else:
		var den := fa.x * fb.y - fa.y * fb.x
		var tK: float = ((b.x - a.x) * fb.y - (b.z - a.z) * fb.x) / den
		var K := Vector2(a.x + fa.x * tK, a.z + fa.y * tK)
		var dA := K.distance_to(Vector2(a.x, a.z))
		var dB := K.distance_to(Vector2(b.x, b.z))
		var Rt := minf(8.0 if turn == "r" else 14.0, minf(dA - 0.5, dB - 0.5))
		var T0 := K - fa * Rt
		var sg := 1.0 if turn == "l" else -1.0
		var C := Vector2(T0.x + cos(a.yaw) * Rt * sg, T0.y - sin(a.yaw) * Rt * sg)
		raw.append(a)
		for i in 17:
			var y: float = a.yaw + sg * (PI / 2) * i / 16
			raw.append({"x": C.x - cos(y) * Rt * sg, "z": C.y + sin(y) * Rt * sg})
		raw.append(b)
	var pts := []
	var s := 0.0
	for i in range(raw.size() - 1):
		var p0: Dictionary = raw[i]
		var p1: Dictionary = raw[i + 1]
		var L := Vector2(p1.x - p0.x, p1.z - p0.z).length()
		var n2 := maxi(1, ceili(L))
		for kk in range(0 if i == 0 else 1, n2 + 1):
			var x: float = lerpf(p0.x, p1.x, float(kk) / n2)
			var z: float = lerpf(p0.z, p1.z, float(kk) / n2)
			if not pts.is_empty():
				var dd := Vector2(x - pts[-1].x, z - pts[-1].z).length()
				if dd <= 0.05:
					continue
				s += dd
			pts.append({"x": x, "z": z, "s": s})
	for i in pts.size():
		var q: Dictionary = pts[mini(pts.size() - 1, i + 1)]
		var o: Dictionary = pts[maxi(0, i - 1)]
		pts[i].yaw = atan2(q.x - o.x, q.z - o.z)
	var con := {"pts": pts, "L": s, "next": nxt, "turn": turn, "node": n, "arm": seg.arm, "con": true, "lim": seg.lim if turn == "s" else 15, "school": false}
	con_cache[key] = con
	return con

func pos_at(seg: Dictionary, s: float, hint := 1) -> Dictionary:
	var P: Array = seg.pts
	var i := clampi(hint, 1, P.size() - 1)
	while i > 1 and P[i - 1].s > s:
		i -= 1
	while i < P.size() - 1 and P[i].s < s:
		i += 1
	var a: Dictionary = P[i - 1]
	var b: Dictionary = P[i]
	var k := clampf((s - a.s) / ((b.s - a.s) if b.s != a.s else 1.0), 0.0, 1.0)
	return {"x": lerpf(a.x, b.x, k), "z": lerpf(a.z, b.z, k), "yaw": a.yaw + Kit.wrap_a(b.yaw - a.yaw) * k, "i": i}

# 운전자 차가 있는 차로 (차로 조각, 그 위 s) — 돌발 상황이 앞이나 뒤에 차를 놓을 때
func lane_of(x: float, z: float, yaw: float, allow_alley := false):
	var q = road_at(x, z)
	if q == null or (q.r.type == "alley" and not allow_alley):
		return null
	var dir := 1 if cos(yaw - q.yaw) > 0 else -1
	var o: float = q.off * dir
	var k := clampi(int(floor(o / q.r.T.lw)), 0, q.r.T.n - 1)
	var seg := lane(q.r, dir, k)
	var s: float = q.s - seg.base if dir > 0 else seg.base - q.s
	return {"seg": seg, "s": s, "off": o, "k": k, "q": q}

# ───────── 신호 ─────────
func light(n: Dictionary, d: String, t: float):
	if not n.sig:
		return null
	var u := fposmod(t + n.off, n.cyc)
	for p: Dictionary in n.plan:
		var g: String = p.get("g", "")
		var l: String = p.get("l", "")
		var on := g.contains(d) or l.contains(d)
		if u < p.t:
			return {"g": 1 if g.contains(d) else 0, "l": 1 if l.contains(d) else 0, "r": 0 if on else 1, "walk": p.get("walk", ""), "left": p.t - u}
		u -= p.t
		if u < 3:
			return {"y": 1, "walk": ""} if on else {"r": 1, "walk": ""}
		u -= 3
		if u < 2:
			return {"r": 1, "walk": ""}
		u -= 2
	return {"r": 1, "walk": ""}

# ───────── 다른 차 ─────────
func spawn_ai(col: Color, seg = null, s := -1.0, v := 4.0, kind := "car") -> Dictionary:
	var c := {}
	for tries in 40:
		var sg: Dictionary = seg if seg != null else all_lanes[rng.randi() % all_lanes.size()]
		var ss: float = s if s >= 0 else 5 + rng.randf() * maxf(1.0, sg.L - 10)
		var p := pos_at(sg, ss)
		var ok := true
		for o: Dictionary in ai: # 다른 차와 겹치게 놓으면 서로를 앞차로 보고 영영 서 있음
			if Vector2(o.x - p.x, o.z - p.z).length() < (14.0 if seg == null else 7.0):
				ok = false
		if seg == null and Vector2(p.x + 120, p.z + 150).length() < 30:
			ok = false
		if not ok:
			if seg != null:
				return {}
			continue
		var mesh: Node3D = _amb_mesh() if kind == "amb" else Kit.car_mesh(self, col)
		c = {"seg": sg, "s": ss, "v": v, "x": p.x, "z": p.z, "yaw": p.yaw, "pi": p.i, "mesh": mesh, "stopT": 0.0, "stuck": 0.0, "move": null, "con": null, "brake": false,
			"lat": 0.0, "lc": null, "force": 0.0, "hold": 0.0, "kind": kind, "yield": false, "high": rng.randf() < 0.4, "blink": 0, "honk": 0.0, "age": 0.0}
		_pick_next(c)
		ai.append(c)
		break
	return c

func remove_ai(c: Dictionary) -> void:
	if c.mesh:
		c.mesh.queue_free()
	for i in ai.size():
		if is_same(ai[i], c):
			ai.remove_at(i)
			break

func _amb_mesh() -> Node3D:
	var g := Node3D.new()
	add_child(g)
	Kit.box(g, Vector3(1.95, 1.9, 5.2), Vector3(0, 1.3, -0.2), Kit.mat(Color(0.96, 0.96, 0.95), 0.45))
	Kit.box(g, Vector3(1.9, 0.85, 1.3), Vector3(0, 0.75, 2.2), Kit.mat(Color(0.96, 0.96, 0.95), 0.45))
	Kit.box(g, Vector3(1.6, 0.5, 0.05), Vector3(0, 1.45, 2.36), Kit.mat(Color(0.16, 0.17, 0.2), 0.25), false)
	for sd in [-1, 1]:
		Kit.box(g, Vector3(0.02, 0.32, 5.0), Vector3(sd * 0.985, 1.0, -0.2), Kit.mat(Color(0.85, 0.12, 0.1), 0.5), false)
		var l := Kit.label3d(g, "구급차", Vector3(sd * 0.99, 1.65, -0.6), 72, Color(0.85, 0.12, 0.1))
		l.rotation.y = sd * PI / 2
		l.pixel_size = 0.006
	var bars := []
	for i in 2:
		bars.append(Kit.box(g, Vector3(0.7, 0.16, 0.3), Vector3(-0.42 + i * 0.84, 2.33, 1.2), Kit.mat(Color(0.3, 0.05, 0.05)), false))
	for p in [Vector3(0.85, 0.36, 1.7), Vector3(-0.85, 0.36, 1.7), Vector3(0.85, 0.36, -1.9), Vector3(-0.85, 0.36, -1.9)]:
		var w := Kit.cyl(g, 0.36, 0.25, p, Kit.mat(Color(0.08, 0.08, 0.08), 0.9), 12)
		w.rotation.z = PI / 2
	Kit.box(g, Vector3(1.94, 0.3, 0.02), Vector3(0, 1.05, -2.81), Kit.mat(Color(0.85, 0.12, 0.1), 0.5), false)
	var back := Kit.label3d(g, "구급차", Vector3(0, 1.75, -2.83), 72, Color(0.85, 0.12, 0.1))
	back.rotation.y = PI
	back.pixel_size = 0.0055
	var tail := Kit.box(g, Vector3(1.6, 0.12, 0.04), Vector3(0, 0.75, -2.82), Kit.TAIL_OFF, false)
	var head := Kit.box(g, Vector3(1.5, 0.12, 0.04), Vector3(0, 0.8, 2.86), Kit.HEAD_OFF, false)
	g.set_meta("tail", tail)
	g.set_meta("head", head)
	g.set_meta("blink", [])
	g.set_meta("bars", bars)
	return g

func _pick_next(c: Dictionary) -> void:
	var opts := []
	for m: Dictionary in moves(c.seg):
		if depart(nodes[c.seg.to], m.d).r.type != "alley":
			opts.append(m)
	var m = opts[rng.randi() % opts.size()] if not opts.is_empty() else null
	c.move = m
	c.con = connect_lane(c.seg, m.d, m.turn) if m != null else null

# 다른 차가 갈 길(차로 조각, 거기서 s)을 따라 앞으로 40m 안의 차, 사람까지 거리
func _gap(c: Dictionary, path: Array, player, only_player: bool, lat: float) -> float:
	var cand := []
	if not only_player and c.kind != "amb":
		for o: Dictionary in ai:
			if not is_same(o, c) and absf(o.x - c.x) < 46 and absf(o.z - c.z) < 46:
				cand.append([o.x, o.z, 2.3 if o.kind != "amb" else 2.7, 1.6, true])
	if player != null and absf(player.x - c.x) < 50 and absf(player.z - c.z) < 50:
		for f in [-0.6, 1.35, 3.3]:
			var m: Dictionary = player.at(f, 0)
			cand.append([m.x, m.z, 2.3 if f == 1.35 else 0.35, 1.7, true])
	if not only_player:
		for p: Dictionary in peds:
			if p.walking and absf(p.x - c.x) < 46 and absf(p.z - c.z) < 46:
				cand.append([p.x, p.z, 0.3, 1.6, false])
	for e: Dictionary in extra_obs:
		if absf(e.x - c.x) < 46 and absf(e.z - c.z) < 46:
			cand.append([e.x, e.z, e.get("half", 0.3), e.get("lat", 1.6), false])
	if cand.is_empty():
		return 1e9
	var best := 1e9
	var acc_d := 0.0
	for pf: Array in path:
		var seg: Dictionary = pf[0]
		var from: float = pf[1]
		var P: Array = seg.pts
		for i in range(0, P.size()):
			var q: Dictionary = P[i]
			if q.s < from:
				continue
			var d: float = acc_d + q.s - from
			if d > 40:
				return best
			var qx: float = q.x - cos(q.yaw) * lat
			var qz: float = q.z + sin(q.yaw) * lat
			for o: Array in cand:
				if absf(o[0] - qx) > 3 or absf(o[1] - qz) > 3:
					continue
				if o[4] and d < 2.6: # 차는 내 앞범퍼보다 앞에 있을 때만 (옆, 뒤의 차는 앞차가 아님)
					continue
				if Vector2(o[0] - qx, o[1] - qz).length() < o[3]:
					best = minf(best, d - o[2] - 2.3)
			if best < 1e9:
				return best
		acc_d += seg.L - from
	return best

func tick(dt: float, t: float, player) -> void:
	acc += dt
	if acc < 1.0 / 60.0:
		return
	_tick_ai(acc, t, player)
	_tick_peds(acc, t, player)
	acc = 0.0

func _tick_ai(dt: float, t: float, player) -> void:
	if player != null: # 돌발 상황 때문에 생긴 차는 멀어지면 지움 (다른 차 수가 늘지 않게)
		for c: Dictionary in ai.duplicate():
			if c.get("temp", false) and c.age > 15 and not c.has("cut") and c.force <= 0 and Vector2(c.x - player.x, c.z - player.z).length() > 140:
				remove_ai(c)
	var amb_list := []
	for c: Dictionary in ai:
		if c.kind == "amb":
			amb_list.append(c)
	for c: Dictionary in ai:
		var seg: Dictionary = c.seg
		var on_con: bool = seg.con
		c.age += dt
		var stop_d := 1e9
		var want_v: float = seg.lim / 3.6 * (0.9 if seg.school else 0.85) * speed_k
		var amb: bool = c.kind == "amb"
		if amb:
			want_v = 16.0 * minf(1.0, speed_k + 0.15)
		if not on_con and c.move != null:
			var n: Dictionary = nodes[seg.to]
			var to_end: float = seg.L - c.s
			if amb:
				if to_end < 30: # 긴급차는 신호를 지나가되 교차로 앞에서 천천히
					want_v = minf(want_v, 6.0)
			elif n.sig:
				var L: Dictionary = light(n, seg.arm, t)
				var ok: bool = (L.get("l", 0) == 1 if c.move.turn == "l" else L.get("g", 0) == 1) and not (c.v < 1 and L.get("left", 9.0) < 2.5)
				var occupied := player != null and _in_box(n, player.x, player.z)
				if not occupied:
					for o: Dictionary in ai:
						if not is_same(o, c) and o.seg.con and is_same(o.seg.node, n) and o.seg.arm != seg.arm:
							occupied = true
							break
				if (not ok and not (L.get("y", 0) == 1 and to_end < c.v * c.v / 6)) or (occupied and to_end < 12):
					stop_d = to_end - 0.5
			elif n.stop.contains(seg.arm): # 일시정지: 1.5초 멈췄다가, 교차로 안이나 가까이 다가오는 차가 없을 때
				if c.stopT < 1.5:
					stop_d = to_end - 0.5
					if to_end < 1.2 and c.v < 0.2:
						c.stopT += dt
				else:
					var busy := false
					for o: Dictionary in ai:
						if is_same(o, c):
							continue
						if o.seg.con:
							if is_same(o.seg.node, n):
								busy = true
						elif o.seg.to == n.id and not n.stop.contains(o.seg.arm) and _busy(n, o.x, o.z, o.v):
							busy = true
					if player != null and _busy(n, player.x, player.z, absf(player.v)):
						busy = true
					if busy:
						stop_d = to_end - 0.5
		var path := [[seg, c.s]]
		if not on_con and c.con != null:
			path.append([c.con, 0.0])
			path.append([c.con.next, 0.0])
		elif on_con:
			path.append([seg.next, 0.0])
		# 구급차가 뒤에서 오면 오른쪽으로 비켜 섬
		c.yield = false
		if not amb:
			for a: Dictionary in amb_list:
				var dx: float = c.x - a.x
				var dz: float = c.z - a.z
				var ahead := dx * sin(a.yaw) + dz * cos(a.yaw)
				var side := absf(dx * cos(a.yaw) - dz * sin(a.yaw))
				if ahead > 0 and ahead < 45 and side < 4 and cos(c.yaw - a.yaw) > 0.7:
					c.yield = true
		var lat_target := 0.0
		if c.yield:
			if not on_con and seg.r.T.n == 2 and seg.k == 0 and c.lc == null and c.s < seg.L - 25:
				_lane_change(c, 1, 1.6)
			else:
				want_v = minf(want_v, 0.0 if c.v < 3 else c.v - 2.0)
				lat_target = 1.0
		# 구급차가 운전자 차 뒤에 오면: 큰길에서 운전자가 오른쪽 차로면 왼쪽 차로로, 1차로 길에선 운전자가 오른쪽 가장자리로 붙어 천천히 가면 중앙선을 넘어 앞지름
		# 4초 넘게 막혔는데 앞의 운전자 차도 멈춰 있으면 (앞이 막혀 못 비키는 경우) 그대로 비켜 지나감
		if amb and player != null and not on_con:
			var pl = lane_of(player.x, player.z, player.yaw)
			c.blocked = c.get("blocked", 0.0) + dt if c.v < 1.0 else 0.0
			if pl != null and is_same(pl.seg.r, seg.r) and pl.seg.dir == seg.dir:
				var ahead: float = pl.s - c.s
				var stuck_behind: bool = c.blocked > 4.0 and absf(player.v) < 1.0
				if ahead > -10 and ahead < 45:
					if seg.r.T.n == 2:
						if pl.k == seg.k and c.lc == null and (pl.k == 1 or stuck_behind):
							_lane_change(c, 1 - seg.k, 1.4)
					elif (pl.off - seg.r.T.lw * 0.5 > 0.45 and absf(player.v) < 7.0) or (c.lat < -1.0 and ahead > -12) or stuck_behind: # 12m 넘게 앞선 뒤에 차로로 돌아옴
						lat_target = -2.4
		var gap := _gap(c, path, player, c.stuck > 10 or amb, c.lat)
		if stop_d < 1e8:
			want_v = minf(want_v, sqrt(2 * 3 * maxf(0.0, stop_d - 0.5)))
		if gap < 1e8:
			want_v = minf(want_v, sqrt(2 * 3 * maxf(0.0, gap - 2.2)))
		if on_con and seg.turn != "s":
			want_v = minf(want_v, 5.0)
		if c.force > 0: # 급정거 (돌발 상황)
			c.force -= dt
			want_v = 0.0
		if c.has("cut"):
			want_v = _cut_in(c, want_v, player, dt)
		var dmax := decel_max * (1.3 if c.force > 0 else 1.0)
		c.v += clampf((want_v - c.v) * 2.0, -dmax, 2.2) * dt
		if c.force > 0 and c.v > 0:
			c.v = maxf(0.0, c.v - dmax * 0.6 * dt)
		c.v = maxf(c.v, 0.0)
		c.stuck = c.stuck + dt if c.v < 0.1 and stop_d > 1e8 and not c.yield else 0.0
		if c.stuck > 12:
			c.stuck = 0.0
		c.brake = want_v < c.v - 0.3 or c.v < 0.1
		c.s += c.v * dt
		if stop_d < 1e8 and not on_con and c.s > c.seg.L - 0.05:
			c.s = c.seg.L - 0.05
			c.v = 0.0
		while c.s > c.seg.L:
			c.s -= c.seg.L
			c.pi = 1
			if not c.seg.con:
				if c.con == null:
					c.s = 0.0
					break
				c.seg = c.con
				c.stopT = 0.0
			else:
				c.seg = c.seg.next
				_pick_next(c)
		# 차로 바꾸기 (옆으로 lat → 0)
		if c.lc != null:
			c.lc.t += dt
			c.lat = c.lc.from * (1.0 - smoothstep(0.0, 1.0, c.lc.t / c.lc.dur))
			if c.lc.t >= c.lc.dur:
				c.lat = 0.0
				c.lc = null
				c.blink = 0
		else:
			c.lat = move_toward(c.lat, lat_target, dt * 1.2)
		var p := pos_at(c.seg, c.s, c.pi)
		c.pi = p.i
		c.x = p.x - cos(p.yaw) * c.lat
		c.z = p.z + sin(p.yaw) * c.lat
		var lat_yaw: float = 0.0
		if c.lc != null:
			lat_yaw = c.lc.from * 0.35 / c.lc.dur * signf(c.v) * clampf(1.0 - absf(c.lc.t / c.lc.dur - 0.5) * 2.0, 0.0, 1.0)
		c.yaw = p.yaw + lat_yaw
		var m: Node3D = c.mesh
		m.position = Vector3(c.x, 0, c.z)
		m.rotation.y = c.yaw
		(m.get_meta("tail") as MeshInstance3D).material_override = Kit.TAIL_ON if c.brake or (night) else Kit.TAIL_OFF
		(m.get_meta("head") as MeshInstance3D).material_override = Kit.HEAD_ON if night or amb else Kit.HEAD_OFF
		var blink_on := fmod(t, 0.76) < 0.38
		var bl: Array = m.get_meta("blink")
		if bl.size() == 2:
			(bl[0] as MeshInstance3D).material_override = Kit.BLINK_ON if (c.blink == 1 or c.yield) and blink_on else Kit.BLINK_OFF
			(bl[1] as MeshInstance3D).material_override = Kit.BLINK_ON if (c.blink == 2 or c.yield) and blink_on else Kit.BLINK_OFF
		if amb:
			var bars: Array = m.get_meta("bars")
			var ph := fmod(t, 0.5) < 0.25
			(bars[0] as MeshInstance3D).material_override = Kit.mat(Color(1, 0.1, 0.1), 0.3, 6.0) if ph else Kit.mat(Color(0.3, 0.05, 0.05))
			(bars[1] as MeshInstance3D).material_override = Kit.mat(Color(0.2, 0.35, 1.0), 0.3, 6.0) if not ph else Kit.mat(Color(0.05, 0.08, 0.3))

# 차로 바꾸기: 같은 길의 다른 차로로 옮기고, 옆으로 비켜 있던 만큼(lat)을 천천히 줄임 (큰길은 곧은 길이라 s가 같음)
func _lane_change(c: Dictionary, to_k: int, dur: float) -> void:
	var seg: Dictionary = c.seg
	if seg.con or seg.k == to_k:
		return
	var nseg := lane(seg.r, seg.dir, to_k)
	var from: float = (seg.k - to_k) * seg.r.T.lw + c.lat
	c.seg = nseg
	c.s = clampf(c.s, 0.0, nseg.L - 0.1)
	c.pi = 1
	c.lc = {"from": from, "t": 0.0, "dur": dur}
	c.blink = 2 if to_k > seg.k else 1
	_pick_next(c)

func _cut_in(c: Dictionary, want_v: float, player, dt: float) -> float:
	var ci: Dictionary = c.cut
	if player == null:
		return want_v
	var pf: Dictionary = player.front()
	var ahead: float = (c.x - pf.x) * sin(player.yaw) + (c.z - pf.z) * cos(player.yaw) - 2.3
	if ci.state == "chase":
		var v: float = maxf(absf(player.v) + 4.0, 6.0)
		if ahead > ci.gap:
			if ci.sig:
				c.blink = 2 if ci.to > c.seg.k else 1
			ci.state = "wait" if ci.sig else "go"
			ci.t = 0.0
		return minf(v, 22.0)
	if ci.state == "wait": # 방향지시등을 켜자마자 (0.6초) 들어옴
		ci.t += dt
		if ci.t > 0.6:
			ci.state = "go"
		return maxf(absf(player.v) + 1.5, 5.0)
	if ci.state == "go":
		_lane_change(c, ci.to, 1.3)
		ci.state = "slow"
		ci.t = 0.0
		return maxf(absf(player.v), 5.0)
	if ci.state == "slow": # 들어와서 잠깐 속도를 줄임
		ci.t += dt
		if ci.t > 3.5:
			c.erase("cut")
		return minf(want_v, maxf(absf(player.v) - 2.5, 3.0))
	return want_v

func _in_box(n: Dictionary, x: float, z: float) -> bool:
	return absf(x - n.x) < n.bx and absf(z - n.z) < n.bz

func _busy(n: Dictionary, x: float, z: float, v: float) -> bool:
	return _in_box(n, x, z) or (Vector2(x - n.x, z - n.z).length() < n.bx + 40 and v > 0.5)

func on_cross(cr: Dictionary, x: float, z: float, pad := 0.0) -> bool:
	var dx: float = x - cr.x
	var dz: float = z - cr.z
	var a: float = dx * cr.ax.x + dz * cr.ax.y
	var b: float = dx * -cr.ax.y + dz * cr.ax.x
	return absf(a) < cr.hl + pad and absf(b) < cr.hw + pad

func _walk_ok(cr: Dictionary, t: float) -> bool:
	if cr.n == null or not cr.n.sig:
		return true
	var L: Dictionary = light(cr.n, cr.d, t)
	var w: String = L.get("walk", "")
	return w.contains(cr.d) and L.get("left", 99.0) > 6

func _tick_peds(dt: float, t: float, player) -> void:
	for p: Dictionary in peds:
		var cr: Dictionary = p.cr
		if not p.walking:
			p.wait -= dt
			if p.wait <= 0:
				var car_near := false
				for c: Dictionary in ai:
					if on_cross(cr, c.x, c.z, 1.2) or ((cr.n == null or not cr.n.sig) and Vector2(c.x - cr.x, c.z - cr.z).length() < 18 and c.v > 2):
						car_near = true
						break
				if player != null:
					var pm: Dictionary = player.at(1.35, 0)
					if on_cross(cr, pm.x, pm.z, 1.2) or on_cross(cr, player.x, player.z, 1.2) or (Vector2(pm.x - cr.x, pm.z - cr.z).length() < 12 and absf(player.v) > 0.5) or (Vector2(pm.x - cr.x, pm.z - cr.z).length() < 20 and absf(player.v) > 2.0):
						car_near = true
				if _walk_ok(cr, t) and not car_near:
					p.walking = true
					p.t = 0.0
				else:
					p.wait = 0.5
		else:
			var a: Dictionary = cr.ends[p.side]
			var b: Dictionary = cr.ends[1 - p.side]
			var L := Vector2(b.x - a.x, b.z - a.z).length()
			p.t += p.sp * dt
			var k := minf(1.0, p.t / L)
			p.x = lerpf(a.x, b.x, k) + cr.ax.x * p.off
			p.z = lerpf(a.z, b.z, k) + cr.ax.y * p.off
			p.m.rotation.y = atan2(b.x - a.x, b.z - a.z)
			var legs: Array = p.m.get_meta("legs")
			for i in 2:
				(legs[i] as Node3D).rotation.x = sin(p.t * 6 + i * PI) * 0.5
			if k >= 1:
				p.walking = false
				p.side = 1 - p.side
				p.wait = 6 + rng.randf() * 25
				for l: Node3D in legs:
					l.rotation.x = 0
		p.m.position = Vector3(p.x, 0, p.z)
