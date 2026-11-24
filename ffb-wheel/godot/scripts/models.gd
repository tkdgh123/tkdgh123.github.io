# 차와 사람 모양. 차 몸체는 뒤에서 앞으로 단면 여러 개를 이어 붙여 만듦 (보닛, 앞유리, 지붕, 트렁크가 생김)
# 모형 좌표: +Z 앞, +X 왼쪽, 바닥 y=0, 차 길이 가운데가 원점
class_name Models
extends RefCounted

# 단면 [z, 아래 y, 허리 y, 윗면 y, 허리 반폭, 윗면 반폭]
const SEDAN := [
	[-2.30, 0.36, 0.80, 0.84, 0.84, 0.74],
	[-2.20, 0.30, 0.92, 0.95, 0.89, 0.80],
	[-1.45, 0.28, 0.95, 0.99, 0.90, 0.81],
	[-1.20, 0.28, 0.95, 1.02, 0.90, 0.80],
	[-0.62, 0.28, 0.95, 1.42, 0.90, 0.66],
	[-0.47, 0.28, 0.95, 1.445, 0.90, 0.66],
	[-0.37, 0.28, 0.95, 1.45, 0.90, 0.66],
	[0.32, 0.28, 0.95, 1.45, 0.90, 0.66],
	[1.18, 0.28, 0.93, 0.99, 0.90, 0.81],
	[1.95, 0.30, 0.84, 0.88, 0.89, 0.80],
	[2.30, 0.36, 0.70, 0.74, 0.84, 0.72],
]
# 단면 사이마다 [옆 윗부분, 윗면]: p 칠, g 유리, t 검은 기둥
const SEDAN_SEG := [["p", "p"], ["p", "p"], ["p", "p"], ["p", "g"], ["g", "p"], ["t", "p"], ["g", "p"], ["g", "g"], ["p", "p"], ["p", "p"]]
const SUV := [
	[-2.30, 0.42, 0.95, 1.02, 0.88, 0.80],
	[-2.22, 0.38, 1.02, 1.66, 0.92, 0.78],
	[-1.90, 0.36, 1.04, 1.72, 0.93, 0.77],
	[-0.52, 0.36, 1.04, 1.74, 0.93, 0.77],
	[-0.40, 0.36, 1.04, 1.74, 0.93, 0.77],
	[0.55, 0.36, 1.04, 1.73, 0.93, 0.77],
	[1.32, 0.36, 1.02, 1.08, 0.93, 0.84],
	[2.00, 0.38, 0.96, 0.99, 0.92, 0.84],
	[2.30, 0.42, 0.84, 0.87, 0.88, 0.78],
]
const SUV_SEG := [["p", "g"], ["g", "p"], ["g", "p"], ["t", "p"], ["g", "p"], ["g", "g"], ["p", "p"], ["p", "p"]]
const TRIM := Color(0.07, 0.07, 0.075, 0.0)
const CHROME := Color(0.62, 0.63, 0.65, 0.5)

static var _cache := {}
static var BODY: ShaderMaterial
static var GLASS: ShaderMaterial

static func mats() -> void:
	if BODY != null:
		return
	var sh: Shader = load("res://shaders/car.gdshader")
	BODY = ShaderMaterial.new()
	BODY.shader = sh
	GLASS = ShaderMaterial.new()
	GLASS.shader = sh
	GLASS.set_shader_parameter("glass", true)

static func _tri(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, out: Vector3, col: Color) -> void:
	var n := (b - a).cross(c - a)
	if n.length_squared() < 1e-10:
		return
	if n.dot(out) > 0: # Godot은 밖에서 볼 때 시계 방향이 앞면
		var t := b
		b = c
		c = t
		n = -n
	n = -n.normalized()
	for p in [a, b, c]:
		st.set_color(col)
		st.set_normal(n)
		st.add_vertex(p)

static func _quad(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, d: Vector3, ctr: Vector3, col: Color) -> void:
	var m := (a + b + c + d) / 4.0
	_tri(st, a, b, c, m - ctr, col)
	_tri(st, a, c, d, m - ctr, col)

static func _prof(s: Array, side: float) -> Array:
	return [Vector3(side * s[4] * 0.93, s[1], s[0]), Vector3(side * s[4], s[1] + 0.16, s[0]), Vector3(side * s[4], s[2], s[0]),
		Vector3(side * s[5], s[3], s[0]), Vector3(0, s[3] + 0.015, s[0])]

static func _wheel(st: SurfaceTool, c: Vector3, r: float, w: float) -> void: # 타이어 + 바깥쪽 휠
	var n := 14
	var side := signf(c.x)
	for i in n:
		var a0 := TAU * i / n
		var a1 := TAU * (i + 1) / n
		var p0 := Vector3(0, sin(a0) * r, cos(a0) * r)
		var p1 := Vector3(0, sin(a1) * r, cos(a1) * r)
		var o := Vector3(w / 2 * side, 0, 0)
		_quad(st, c + p0 - o, c + p1 - o, c + p1 + o, c + p0 + o, c, TRIM)
		_tri(st, c + o, c + p0 * 0.98 + o, c + p1 * 0.98 + o, Vector3(side, 0, 0), TRIM)
		_tri(st, c + o * 1.06, c + p0 * 0.62 + o * 1.06, c + p1 * 0.62 + o * 1.06, Vector3(side, 0, 0), CHROME)

static func _box(st: SurfaceTool, c: Vector3, s: Vector3, col: Color) -> void:
	var h := s / 2
	var v := []
	for i in 8:
		v.append(c + Vector3(h.x * (1 if i & 1 else -1), h.y * (1 if i & 2 else -1), h.z * (1 if i & 4 else -1)))
	for f in [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]]:
		_quad(st, v[f[0]], v[f[1]], v[f[2]], v[f[3]], c, col)

# 몸체와 유리 두 덩어리 (같은 종류는 한 번만 만듦)
static func body(kind: String, tires := true) -> Array:
	var key := "%s|%s" % [kind, tires]
	if _cache.has(key):
		return _cache[key]
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var gl := SurfaceTool.new()
	gl.begin(Mesh.PRIMITIVE_TRIANGLES)
	if kind == "bus" or kind == "mbus":
		_bus(st, gl, 11.0 if kind == "bus" else 7.2)
	else:
		var secs: Array = SUV if kind == "suv" else SEDAN
		var segs: Array = SUV_SEG if kind == "suv" else SEDAN_SEG
		var paint := Color(1, 1, 1, 1)
		for i in secs.size() - 1:
			for side in [1.0, -1.0]:
				var a := _prof(secs[i], side)
				var b := _prof(secs[i + 1], side)
				var ctr := Vector3(0, 0.75, (secs[i][0] + secs[i + 1][0]) / 2)
				for k in 4:
					var code: String = "t" if k == 0 else "p" if k == 1 else segs[i][k - 2]
					var target := gl if code == "g" else st
					_quad(target, a[k], b[k], b[k + 1], a[k + 1], ctr, TRIM if code == "t" else paint)
				_quad(st, Vector3(a[0].x, a[0].y, a[0].z), Vector3(b[0].x, b[0].y, b[0].z), Vector3(0, b[0].y, b[0].z), Vector3(0, a[0].y, a[0].z), Vector3(0, 1, ctr.z), TRIM)
		for e in [[0, -1.0], [secs.size() - 1, 1.0]]: # 앞, 뒤 끝 면
			var s: Array = secs[e[0]]
			var ring := _prof(s, 1.0)
			var ring2 := _prof(s, -1.0)
			var c := Vector3(0, (s[1] + s[3]) / 2, s[0])
			var out := Vector3(0, 0, e[1])
			for k in 4:
				_tri(st, c, ring[k], ring[k + 1], out, TRIM if k == 0 else paint)
				_tri(st, c, ring2[k], ring2[k + 1], out, TRIM if k == 0 else paint)
			_tri(st, c, ring[0], ring2[0], out, TRIM)
			var z: float = s[0] + e[1] * 0.012 # 범퍼 검은 띠, 앞 그릴
			_box(st, Vector3(0, s[1] + 0.12, z), Vector3(s[4] * 1.9, 0.12, 0.05), TRIM)
			if e[1] > 0:
				_box(st, Vector3(0, s[1] + 0.25, z), Vector3(0.7, 0.14, 0.05), TRIM)
		# 사이드미러
		var mz := 1.05 if kind != "suv" else 1.2
		var my := 1.02 if kind != "suv" else 1.12
		for side in [1.0, -1.0]:
			_box(st, Vector3(side * 0.99, my, mz), Vector3(0.16, 0.12, 0.09), paint)
		if tires:
			var r := 0.36 if kind == "suv" else 0.32
			for p in [Vector3(0.8, r, 1.35), Vector3(-0.8, r, 1.35), Vector3(0.8, r, -1.35), Vector3(-0.8, r, -1.35)]:
				_wheel(st, p, r, 0.22)
		if kind == "taxi":
			_box(st, Vector3(0, 1.52, -0.05), Vector3(0.62, 0.15, 0.26), Color(0.95, 0.8, 0.2, 0.0))
	mats()
	var m1 := st.commit()
	var m2 := gl.commit()
	_cache[key] = [m1, m2]
	return _cache[key]

static func _bus(st: SurfaceTool, gl: SurfaceTool, L: float) -> void:
	var paint := Color(1, 1, 1, 1)
	var hl := L / 2
	_box(st, Vector3(0, 0.95, 0), Vector3(2.48, 1.0, L), paint)       # 아래 몸통
	_box(st, Vector3(0, 2.95, 0), Vector3(2.46, 0.5, L - 0.05), Color(0.92, 0.92, 0.9, 0.0)) # 지붕 쪽 흰 띠
	_box(gl, Vector3(0, 2.07, 0), Vector3(2.44, 1.25, L - 0.2), Color.WHITE) # 창 띠
	for z in range(-int(hl) + 1, int(hl), 2): # 창틀
		_box(st, Vector3(0, 2.07, z + 0.4), Vector3(2.47, 1.25, 0.12), TRIM)
	_box(gl, Vector3(0, 1.9, hl - 0.01), Vector3(2.3, 1.7, 0.04), Color.WHITE) # 앞유리
	_box(st, Vector3(0, 0.35, 0), Vector3(2.4, 0.3, L - 0.3), TRIM)
	var r := 0.5
	for z in [hl - 1.9, -hl + 2.4]:
		for side in [1.0, -1.0]:
			_wheel(st, Vector3(side * 1.05, r, z), r, 0.3)

static func lamp_box(parent: Node3D, size: Vector3, pos: Vector3) -> MeshInstance3D:
	return Kit.box(parent, size, pos, Kit.TAIL_OFF, false)

# 다른 차 한 대 (꼬리등, 전조등, 방향지시등은 따로 켜고 끔). kind: sedan suv taxi bus mbus
static func car(parent: Node3D, col: Color, kind := "sedan", tires := true) -> Node3D:
	var g := Node3D.new()
	parent.add_child(g)
	var ms := body(kind, tires)
	var big := kind == "bus" or kind == "mbus"
	var hl := 5.5 if kind == "bus" else 3.6 if kind == "mbus" else 2.3
	for i in 2:
		var mi := MeshInstance3D.new()
		mi.mesh = ms[i]
		mi.material_override = BODY if i == 0 else GLASS
		mi.set_instance_shader_parameter("paint", col)
		mi.set_instance_shader_parameter("dent", Vector4.ZERO)
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if i == 0 else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		g.add_child(mi)
		g.set_meta("body" if i == 0 else "glass", mi)
	var ty := 1.0 if big else (0.9 if kind == "suv" else 0.82)
	var hy := 0.8 if big else (0.74 if kind == "suv" else 0.6)
	var tail := Kit.box(g, Vector3(2.1 if big else 1.5, 0.1, 0.04), Vector3(0, ty, -hl - 0.01), Kit.TAIL_OFF, false)
	var head := Kit.box(g, Vector3(2.0 if big else 1.42, 0.09, 0.04), Vector3(0, hy, hl + 0.01), Kit.HEAD_OFF, false)
	var bl := Kit.box(g, Vector3(0.14, 0.09, 0.04), Vector3(1.1 if big else 0.8, hy - 0.08, hl + 0.02), Kit.BLINK_OFF, false)
	var br := Kit.box(g, Vector3(0.14, 0.09, 0.04), Vector3(-1.1 if big else -0.8, hy - 0.08, hl + 0.02), Kit.BLINK_OFF, false)
	g.set_meta("tail", tail)
	g.set_meta("head", head)
	g.set_meta("blink", [bl, br])
	if big:
		var no := Kit.label3d(g, "146" if kind == "bus" else "동작05", Vector3(0, 2.95, hl + 0.03), 64, Color(1.0, 0.62, 0.12))
		no.shaded = false
		no.pixel_size = 0.006
	for mi in g.get_children():
		if mi is GeometryInstance3D:
			(mi as GeometryInstance3D).visibility_range_end = 260.0
	return g

# 사람: 몸통, 머리, 머리카락, 팔, 다리. long = 긴 패딩 (11월 서울)
static func person(parent: Node3D, col: Color, scale := 1.0, long := false, hair := Color(0.08, 0.07, 0.07)) -> Node3D:
	var o := Node3D.new()
	parent.add_child(o)
	o.scale = Vector3.ONE * scale
	var cap := CapsuleMesh.new()
	cap.radius = 0.21
	cap.height = 1.0 if long else 0.78
	cap.radial_segments = 10
	cap.rings = 3
	var b := MeshInstance3D.new()
	b.mesh = cap
	b.material_override = Kit.mat(col, 0.85)
	b.position.y = 1.43 - cap.height / 2
	b.scale = Vector3(1.0, 1.0, 0.78)
	o.add_child(b)
	var hs := SphereMesh.new()
	hs.radius = 0.12
	hs.height = 0.26
	hs.radial_segments = 10
	hs.rings = 5
	var hd := MeshInstance3D.new()
	hd.mesh = hs
	hd.material_override = Kit.mat(Color(0.88, 0.74, 0.62), 0.8)
	hd.position.y = 1.6
	o.add_child(hd)
	var hr := MeshInstance3D.new()
	hr.mesh = hs
	hr.material_override = Kit.mat(hair, 0.9)
	hr.position = Vector3(0, 1.645, -0.025)
	hr.scale = Vector3(1.08, 0.75, 1.08)
	hr.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	o.add_child(hr)
	var legs := []
	var pants := Kit.mat(Color(0.13, 0.14, 0.17), 0.85)
	for s in [-1, 1]: # 다리, 팔은 엉덩이, 어깨를 축으로 흔듦
		var hip := Node3D.new()
		hip.position = Vector3(s * 0.1, 0.86, 0)
		o.add_child(hip)
		var leg := Kit.box(hip, Vector3(0.13, 0.84, 0.14), Vector3(0, -0.42, 0), pants, false)
		leg.visibility_range_end = 90.0
		legs.append(hip)
	var arms := []
	for s in [-1, 1]:
		var sh := Node3D.new()
		sh.position = Vector3(s * 0.26, 1.36, 0)
		o.add_child(sh)
		var arm := Kit.box(sh, Vector3(0.1, 0.62, 0.11), Vector3(0, -0.3, 0), Kit.mat(col.darkened(0.12), 0.85), false)
		arm.visibility_range_end = 70.0
		arms.append(sh)
	for mi in [b, hd, hr]:
		mi.visibility_range_end = 160.0
	hd.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	hr.visibility_range_end = 60.0
	o.set_meta("legs", legs)
	o.set_meta("arms", arms)
	return o

static func walk_pose(o: Node3D, ph: float) -> void:
	var legs: Array = o.get_meta("legs")
	for i in 2:
		(legs[i] as Node3D).rotation.x = sin(ph + i * PI) * 0.45
	if o.has_meta("arms"):
		var arms: Array = o.get_meta("arms")
		for i in 2:
			(arms[i] as Node3D).rotation.x = -sin(ph + i * PI) * 0.4
