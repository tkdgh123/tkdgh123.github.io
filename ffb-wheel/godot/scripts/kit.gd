# 맵을 짓는 도구 (웹판 drive/kit.js를 옮김): 길 중심선, 바닥 칠, 표지판, 신호등, 사람, 차 모양
# 좌표: 웹판과 같음. 앞 = (sin yaw, cos yaw), 오른쪽 = (-cos yaw, sin yaw). Godot에서도 rotation.y = yaw 이면 모형의 +Z가 앞, +X가 왼쪽
class_name Kit
extends RefCounted

static var FONT: SystemFont

static func font() -> SystemFont:
	if FONT == null:
		FONT = SystemFont.new()
		FONT.font_names = PackedStringArray(["Pretendard", "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans CJK KR", "sans-serif"])
		FONT.font_weight = 700
	return FONT

# ── 중심선: 1m 간격 점 {x, z, yaw, s} ──
static func path_line(pts: Array, length: float) -> void:
	var p: Dictionary = pts[-1]
	var n := maxi(1, ceili(length))
	for i in range(1, n + 1):
		var d := length * i / n
		pts.append({"x": p.x + sin(p.yaw) * d, "z": p.z + cos(p.yaw) * d, "yaw": p.yaw, "s": p.s + d})

static func path_arc(pts: Array, r: float, ang: float) -> void: # ang > 0 이면 왼쪽으로 돎
	var p: Dictionary = pts[-1]
	var n := maxi(2, ceili(r * absf(ang)))
	var sg := signf(ang)
	var cx: float = p.x + cos(p.yaw) * r * sg
	var cz: float = p.z - sin(p.yaw) * r * sg
	for i in range(1, n + 1):
		var y: float = p.yaw + ang * i / n
		pts.append({"x": cx - cos(y) * r * sg, "z": cz + sin(y) * r * sg, "yaw": y, "s": p.s + r * absf(ang) * i / n})

static func off_pt(p: Dictionary, o: float) -> Dictionary: # 오른쪽으로 o
	return {"x": p.x - cos(p.yaw) * o, "z": p.z + sin(p.yaw) * o, "yaw": p.yaw, "s": p.get("s", 0.0)}

static func wrap_a(a: float) -> float:
	return atan2(sin(a), cos(a))

static func _lerp_pt(a: Dictionary, b: Dictionary, s: float) -> Dictionary:
	var k: float = (s - a.s) / (b.s - a.s) if b.s != a.s else 0.0
	return {"x": lerpf(a.x, b.x, k), "z": lerpf(a.z, b.z, k), "yaw": a.yaw + wrap_a(b.yaw - a.yaw) * k, "s": s}

static func cut(pts: Array, s0: float, s1: float) -> Array: # s0~s1 구간만 (끝은 사이를 메움)
	var out := []
	for i in range(pts.size() - 1):
		var a: Dictionary = pts[i]
		var b: Dictionary = pts[i + 1]
		if b.s < s0 or a.s > s1:
			continue
		if out.is_empty():
			out.append(a if a.s >= s0 else _lerp_pt(a, b, s0))
		out.append(b if b.s <= s1 else _lerp_pt(a, b, s1))
	return out

# ── 바닥 칠: 색이 다른 납작한 면들을 정점 색 한 덩어리로 ──
# UV.x = 종류 (0 땅, 연석 / 1 아스팔트 / 2 노면 표시 / 3 어린이 보호구역), UV.y = 차로 폭 단위 가로 위치 (눈 위 바퀴 자국)
class Flat:
	var st := SurfaceTool.new()
	var n := 0
	func _init() -> void:
		st.begin(Mesh.PRIMITIVE_TRIANGLES)
	func _v(p: Dictionary, col: Color, y: float, kind: float, lane: float) -> void:
		st.set_color(col)
		st.set_uv(Vector2(kind, lane))
		st.set_normal(Vector3.UP)
		st.add_vertex(Vector3(p.x, y, p.z))
		n += 1
	func tri(a: Dictionary, b: Dictionary, c: Dictionary, col: Color, y: float, kind := 0.0, la := 0.5, lb := 0.5, lc := 0.5) -> void:
		_v(a, col, y, kind, la); _v(c, col, y, kind, lc); _v(b, col, y, kind, lb) # Godot은 시계 방향이 앞면
	func quad(a: Dictionary, b: Dictionary, c: Dictionary, d: Dictionary, col: Color, y: float, kind := 0.0, la := 0.5, lb := 0.5, lc := 0.5, ld := 0.5) -> void:
		tri(a, b, c, col, y, kind, la, lb, lc); tri(a, c, d, col, y, kind, la, lc, ld)
	func band(pts: Array, o0: float, o1: float, col: Color, y: float, kind := 0.0, lw := 0.0) -> void:
		var l0 := o0 / lw if lw > 0 else 0.5
		var l1 := o1 / lw if lw > 0 else 0.5
		for i in range(pts.size() - 1):
			var a: Dictionary = pts[i]
			var b: Dictionary = pts[i + 1]
			quad(Kit.off_pt(a, o0), Kit.off_pt(b, o0), Kit.off_pt(b, o1), Kit.off_pt(a, o1), col, y, kind, l0, l0, l1, l1)
	func dash(pts: Array, o: float, w: float, on: float, off: float, col: Color, y: float) -> void:
		var L: float = pts[-1].s
		var s: float = pts[0].s
		while s < L:
			var c := Kit.cut(pts, s, minf(L, s + on))
			if c.size() > 1:
				band(c, o - w / 2, o + w / 2, col, y, 2.0)
			s += on + off
	func fan(c0: Dictionary, ring: Array, col: Color, y: float, kind := 1.0) -> void:
		for i in range(ring.size() - 1):
			tri(c0, ring[i], ring[i + 1], col, y, kind)
	func mesh(mat: Material) -> MeshInstance3D:
		var m := MeshInstance3D.new()
		m.mesh = st.commit()
		m.material_override = mat
		m.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		return m

static func arc_pts(cx: float, cz: float, r: float, a0: float, a1: float, n := 12) -> Array:
	var out := []
	for i in range(n + 1):
		var a := a0 + (a1 - a0) * i / n
		out.append({"x": cx + cos(a) * r, "z": cz + sin(a) * r})
	return out

# ── 재질 (같은 색은 하나만) ──
static var _mats := {}
static func mat(col: Color, rough := 0.6, emit := 0.0, metal := 0.0) -> StandardMaterial3D:
	var key := "%s|%.2f|%.2f|%.2f" % [col.to_html(), rough, emit, metal]
	if _mats.has(key):
		return _mats[key]
	var m := StandardMaterial3D.new()
	m.albedo_color = col
	m.roughness = rough
	m.metallic = metal
	if emit > 0:
		m.emission_enabled = true
		m.emission = col
		m.emission_energy_multiplier = emit
	_mats[key] = m
	return m

static func box(parent: Node3D, size: Vector3, pos: Vector3, m: Material, shadow := true) -> MeshInstance3D:
	var o := MeshInstance3D.new()
	var b := BoxMesh.new()
	b.size = size
	o.mesh = b
	o.position = pos
	o.material_override = m
	o.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if shadow else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	parent.add_child(o)
	return o

static func cyl(parent: Node3D, r: float, h: float, pos: Vector3, m: Material, segs := 10) -> MeshInstance3D:
	var o := MeshInstance3D.new()
	var c := CylinderMesh.new()
	c.top_radius = r
	c.bottom_radius = r
	c.height = h
	c.radial_segments = segs
	c.rings = 1
	o.mesh = c
	o.position = pos
	o.material_override = m
	parent.add_child(o)
	return o

static func label3d(parent: Node3D, txt: String, pos: Vector3, size: int, col := Color.WHITE, outline := 0) -> Label3D:
	var l := Label3D.new()
	l.text = txt
	l.font = font()
	l.font_size = size
	l.pixel_size = 0.004
	l.modulate = col
	l.outline_size = outline
	l.position = pos
	l.double_sided = true
	l.shaded = true
	parent.add_child(l)
	return l

# 바닥 글씨 ("정지", "어린이 보호구역"): 진행 방향 yaw로 다가오는 운전자가 바로 읽게
static func floor_text(parent: Node3D, txt: String, x: float, z: float, yaw: float, w: float, col := Color(0.95, 0.945, 0.925)) -> Label3D:
	var l := label3d(parent, txt, Vector3(x, 0.045, z), 96, col)
	l.pixel_size = w / maxf(1.0, 96.0 * txt.length() * 0.95)
	l.basis = Basis(Vector3.UP, yaw + PI) * Basis(Vector3.RIGHT, -PI / 2)
	l.no_depth_test = false
	return l

# ── 표지판: 기둥 + 얼굴. face = 표지가 바라보는 방향(yaw) ──
static var POLE := mat(Color(0.56, 0.56, 0.55), 0.5, 0.0, 0.3)
static var LAST_SIGN: Node3D # 방금 세운 표지판 (부딪히면 넘어뜨리려고)
static func sign_post(parent: Node3D, kind: String, arg: String, x: float, z: float, face: float, h := 2.2, size := 0.75) -> Node3D:
	var g := Node3D.new()
	g.position = Vector3(x, 0, z)
	g.rotation.y = face
	parent.add_child(g)
	LAST_SIGN = g
	cyl(g, 0.045, h, Vector3(0, h / 2, 0), POLE, 8)
	var cy := h + size * 0.1
	match kind:
		"max": # 최고 속도: 흰 원 + 빨간 테
			var d := cyl(g, size * 0.46, 0.03, Vector3(0, cy, 0.05), mat(Color(0.97, 0.97, 0.97), 0.5), 24)
			d.rotation.x = PI / 2
			var t := TorusMesh.new()
			t.inner_radius = size * 0.36
			t.outer_radius = size * 0.47
			t.rings = 24
			t.ring_segments = 6
			var ring := MeshInstance3D.new()
			ring.mesh = t
			ring.material_override = mat(Color(0.82, 0.13, 0.13), 0.5)
			ring.position = Vector3(0, cy, 0.06)
			ring.rotation.x = PI / 2
			g.add_child(ring)
			var l := label3d(g, arg, Vector3(0, cy, 0.075), 64, Color(0.07, 0.07, 0.07))
			l.pixel_size = size * 0.0062
		"stop", "slow", "work", "kids": # 역삼각형(정지, 서행), 삼각형(공사, 어린이)
			var down := kind == "stop" or kind == "slow"
			var tri := _tri_mesh(size, down)
			var mi := MeshInstance3D.new()
			mi.mesh = tri
			mi.material_override = mat(Color(0.82, 0.13, 0.13), 0.5)
			mi.position = Vector3(0, cy, 0.05)
			g.add_child(mi)
			var mi2 := MeshInstance3D.new()
			mi2.mesh = _tri_mesh(size * 0.8, down)
			mi2.material_override = mat(Color(0.97, 0.97, 0.97) if kind != "work" else Color(0.98, 0.78, 0.1), 0.5)
			mi2.position = Vector3(0, cy, 0.06)
			g.add_child(mi2)
			var txt: String = {"stop": "정지", "slow": "서행", "work": "공사중", "kids": "어린이"}[kind]
			var l := label3d(g, txt, Vector3(0, cy + (size * 0.12 if down else -size * 0.1), 0.075), 48, Color(0.82, 0.13, 0.13) if down else Color(0.07, 0.07, 0.07))
			l.pixel_size = size * (0.0055 if txt.length() <= 2 else 0.0095 / txt.length())
	return g

static func _tri_mesh(size: float, down: bool) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var h := size * 0.86
	var pts := [Vector3(-size / 2, h / 2, 0), Vector3(size / 2, h / 2, 0), Vector3(0, -h / 2, 0)] if down else [Vector3(0, h / 2, 0), Vector3(size / 2, -h / 2, 0), Vector3(-size / 2, -h / 2, 0)]
	for p in pts:
		st.set_normal(Vector3.BACK)
		st.add_vertex(p)
	for p in [pts[0], pts[2], pts[1]]:
		st.set_normal(Vector3.FORWARD)
		st.add_vertex(p)
	return st.commit()

# ── 신호등: 4색 (빨강, 노랑, 좌회전 화살표, 초록). 기둥은 운전자 오른쪽, 팔은 왼쪽으로 길 위에 ──
static func signal_head(parent: Node3D, x: float, z: float, face: float, arm_len: float, h := 3.6) -> Array:
	var g := Node3D.new()
	g.position = Vector3(x, 0, z)
	g.rotation.y = face
	parent.add_child(g)
	cyl(g, 0.1, h + 0.5, Vector3(0, (h + 0.5) / 2, 0), POLE)
	box(g, Vector3(arm_len, 0.1, 0.1), Vector3(-arm_len / 2, h + 0.35, 0), POLE)
	box(g, Vector3(1.32, 0.38, 0.26), Vector3(0.5 - arm_len, h, 0), mat(Color(0.105, 0.11, 0.12), 0.6))
	var cols := [Color(0.91, 0.22, 0.17), Color(0.95, 0.71, 0.09), Color(0.13, 0.69, 0.3), Color(0.13, 0.69, 0.3)]
	var lamps := []
	for i in 4:
		var s := SphereMesh.new()
		s.radius = 0.13
		s.height = 0.12
		s.radial_segments = 14
		s.rings = 6
		var m := MeshInstance3D.new()
		m.mesh = s
		m.position = Vector3(0.5 - arm_len + (i - 1.5) * 0.31, h, 0.12)
		m.set_meta("on", mat(cols[i], 0.3, 4.0))
		m.set_meta("off", mat(cols[i] * 0.18, 0.4))
		m.material_override = m.get_meta("off")
		m.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		g.add_child(m)
		lamps.append(m)
	var ar := label3d(g, "←", lamps[2].position + Vector3(0, 0, 0.08), 40, Color(0.05, 0.05, 0.05))
	ar.pixel_size = 0.004
	return lamps

static func set_signal(lamps: Array, st: Dictionary) -> void:
	var keys := ["r", "y", "l", "g"]
	for i in 4:
		var m: MeshInstance3D = lamps[i]
		var on := int(st.get(keys[i], 0)) == 1
		m.material_override = m.get_meta("on") if on else m.get_meta("off")

# ── 사람, 차 모양은 Models에 ──
static func person(parent: Node3D, col: Color, scale := 1.0) -> Node3D:
	return Models.person(parent, col, scale)

static func car_mesh(parent: Node3D, col: Color) -> Node3D:
	return Models.car(parent, col)

static var TAIL_ON := mat(Color(1.0, 0.16, 0.1), 0.4, 3.0)
static var TAIL_OFF := mat(Color(0.35, 0.08, 0.06), 0.4)
static var HEAD_ON := mat(Color(1.0, 0.97, 0.85), 0.3, 5.0)
static var HEAD_OFF := mat(Color(0.5, 0.5, 0.45), 0.4)
static var BLINK_ON := mat(Color(1.0, 0.63, 0.1), 0.3, 4.0)
static var BLINK_OFF := mat(Color(0.4, 0.25, 0.05), 0.4)
static var PED_R_ON := mat(Color(1.0, 0.18, 0.12), 0.4, 3.5)
static var PED_R_OFF := mat(Color(0.25, 0.06, 0.05), 0.4)
static var PED_G_ON := mat(Color(0.2, 1.0, 0.55), 0.4, 3.5)
static var PED_G_OFF := mat(Color(0.05, 0.22, 0.12), 0.4)

# 땅 위 직사각형(가운데, 반폭, 반길이, 각도) 두 개가 겹치면 밀어낼 벡터, 아니면 null (분리축)
static func obb_hit(a: Dictionary, b: Dictionary):
	var axes := [Vector2(cos(a.r), -sin(a.r)), Vector2(sin(a.r), cos(a.r)), Vector2(cos(b.r), -sin(b.r)), Vector2(sin(b.r), cos(b.r))]
	var dx: float = b.x - a.x
	var dz: float = b.z - a.z
	var best := 1e9
	var bn := Vector2.ZERO
	for n: Vector2 in axes:
		var d := dx * n.x + dz * n.y
		var o := _ext(a, n) + _ext(b, n) - absf(d)
		if o <= 0:
			return null
		if o < best:
			best = o
			var sg := signf(d) if d != 0 else 1.0
			bn = n * sg
	return Vector2(-bn.x * best, -bn.y * best)

static func _ext(o: Dictionary, n: Vector2) -> float:
	return absf(n.x * cos(o.r) - n.y * sin(o.r)) * o.hw + absf(n.x * sin(o.r) + n.y * cos(o.r)) * o.hl
