# 도시 꾸미기: 지도(강남역 / 숭실대입구)마다 건물, 간판, 가로수, 가로등, 거리 사물, 땅(언덕), 먼 산
# 길을 따라 건물을 줄지어 세우고(한국 길처럼 건물 앞면이 보도에 붙음), 길에서 떨어진 곳은 아파트, 빌라, 언덕으로 채움
class_name Dress
extends RefCounted

const CELL := 4.0
const ORG := -460.0
const N := 230
const SIGN_COLS := [["#c8261e", "#ffffff"], ["#1d4f9c", "#ffffff"], ["#f2c21b", "#1a1a1a"], ["#1f7a3d", "#ffffff"], ["#ffffff", "#c8261e"],
	["#ffffff", "#1d4f9c"], ["#1a1a1a", "#f2c21b"], ["#e86a17", "#ffffff"], ["#16284f", "#ffffff"], ["#d9387a", "#ffffff"], ["#ffffff", "#1a1a1a"], ["#3b2a20", "#f5e6c8"]]
const SIGNS_COMMON := ["튼튼약국", "미소치과", "바른정형외과", "하나로내과", "밝은안경", "헤어살롱", "크린세탁", "김밥한줄", "엄마손분식", "바삭치킨",
	"생맥주 호프", "카페 온도", "PC방", "코인노래방", "휴대폰 할인", "필라테스", "태권도", "리더스 영어", "생각하는 수학", "맑은피부과",
	"동의한의원", "한우 고기집", "순대국밥", "마라탕", "즉석떡볶이", "밀밭 베이커리", "꽃집", "네일아트", "당구장", "스터디카페",
	"한빛은행", "헬스클럽", "24시 편의점", "공영주차장"]
const SIGNS := {
	"gangnam": ["성형외과", "임플란트 치과", "어학원", "코딩 아카데미", "라운지 바", "스테이크하우스", "공유오피스", "메디컬센터", "밝은안과", "강남부동산",
		"강남타워", "역삼빌딩", "서초스퀘어", "한빛생명", "테헤란 센터", "글로벌 어학원", "강남 치과", "와인 바", "브런치 카페", "피트니스", "라식 안과", "투자증권", "메가 스터디", "강남 피부과", "보석 상가", "명품 시계", "오피스텔 분양", "소아과", "한식 뷔페", "초밥"],
	"ssu": ["원룸 전세", "복사 제본", "인쇄소", "족발 보쌈", "막걸리", "대학서점", "자취방 부동산", "노래방", "24시 해장국", "만화카페",
		"상도부동산", "상도약국", "숭실 복사", "학사 주점", "닭갈비", "중국집", "돈까스", "김치찌개", "삼겹살", "상도 정육점", "철물점", "세탁 수선", "반찬가게", "과일가게", "동네 마트", "상도 의원", "치킨 호프", "빨래방", "고시원", "상도 한의원"],
}
const VSIGNS := ["약국", "치과", "노래방", "PC방", "호프", "학원", "당구장", "한의원"]
const VILLA_NAMES := ["해피빌", "그린하우스", "행복빌라", "미래빌", "로얄빌", "상도하이츠", "드림빌", "은하빌라"]

var city: City
var theme := "gangnam"
var fl: Kit.Flat
var rnd := RandomNumberGenerator.new()
var noise := FastNoiseLite.new()
var dist := PackedFloat32Array()
var blds := []        # {x, z, sx, sz, h, yaw, col, style, base, sink, fh, road}
var signs := []       # [Transform3D, 칸]
var vsigns := []
var roofs := []       # [Transform3D, 색]
var tanks := []
var screens := []
var campus := Rect2(10, 10, 100, 80)

func build(c: City, f: Kit.Flat) -> void:
	city = c
	theme = c.theme
	fl = f
	rnd.seed = 11 if theme == "gangnam" else 23
	noise.seed = 5
	noise.frequency = 0.012
	_dist_field()
	_landmarks()
	_frontage()
	_fill()
	_outer()
	_make_buildings()
	_trees()
	_speed_signs()
	_lamps()
	_furniture()
	_wires()
	_walkers()
	_ground()
	_mountains()

# ───────── 길에서 떨어진 거리 (4m 칸, 두 번 훑는 거리 변환) → 언덕 높이 ─────────
func _dist_field() -> void:
	dist.resize(N * N)
	dist.fill(999.0)
	for r: Dictionary in city.roads:
		var w: float = r.T.hw + 2.6
		for p: Dictionary in r.pts:
			var o := -w
			while o <= w:
				var q := Kit.off_pt(p, o)
				var i := int((q.x - ORG) / CELL)
				var j := int((q.z - ORG) / CELL)
				if i >= 0 and j >= 0 and i < N and j < N:
					dist[j * N + i] = 0.0
				o += 2.0
	var d2 := CELL * 1.414
	for j in N:
		for i in N:
			var k := j * N + i
			var v := dist[k]
			if i > 0: v = minf(v, dist[k - 1] + CELL)
			if j > 0:
				v = minf(v, dist[k - N] + CELL)
				if i > 0: v = minf(v, dist[k - N - 1] + d2)
				if i < N - 1: v = minf(v, dist[k - N + 1] + d2)
			dist[k] = v
	for j in range(N - 1, -1, -1):
		for i in range(N - 1, -1, -1):
			var k := j * N + i
			var v := dist[k]
			if i < N - 1: v = minf(v, dist[k + 1] + CELL)
			if j < N - 1:
				v = minf(v, dist[k + N] + CELL)
				if i < N - 1: v = minf(v, dist[k + N + 1] + d2)
				if i > 0: v = minf(v, dist[k + N - 1] + d2)
			dist[k] = v

func road_dist(x: float, z: float) -> float:
	var fi := clampf((x - ORG) / CELL, 0.0, N - 1.001)
	var fj := clampf((z - ORG) / CELL, 0.0, N - 1.001)
	var i := int(fi)
	var j := int(fj)
	var a := lerpf(dist[j * N + i], dist[j * N + i + 1], fi - i)
	var b := lerpf(dist[(j + 1) * N + i], dist[(j + 1) * N + i + 1], fi - i)
	return lerpf(a, b, fj - j)

# 숭실대입구: 상도로 북쪽은 빌라 언덕, 남쪽은 대학이 있는 비탈, 길 밖(순환로 바깥)은 가파른 언덕
func height(x: float, z: float) -> float:
	if theme != "ssu":
		return 0.0
	var out := maxf(absf(x) - 252.0, absf(z) - 212.0)
	var n := noise.get_noise_2d(x, z) * 0.5 + 0.5
	var h := 0.0
	if out > 0:
		h = 4.0 + out * 0.3 + n * 10.0
	else:
		h = n * (9.0 if z < -12 else 4.5)
	if campus.has_point(Vector2(x, z)):
		h = maxf(h, 2.5 + (z - campus.position.y) * 0.07)
	return minf(h, 70.0) * smoothstep(5.0, 24.0, road_dist(x, z))

# ───────── 건물 ─────────
func _free(cx: float, cz: float, sx: float, sz: float, yaw: float, pad := 1.0) -> bool:
	var b := {"x": cx, "z": cz, "hw": sx / 2 + pad, "hl": sz / 2 + pad, "r": yaw}
	for o: Dictionary in city.boxes_near(cx, cz) + (city.boxes_near(cx + 16, cz) if maxf(sx, sz) > 24 else []):
		if Kit.obb_hit(b, o) != null:
			return false
	var fx := sin(yaw)
	var fz := cos(yaw)
	for a in [-0.5, 0.0, 0.5]:
		for c in [-0.5, 0.0, 0.5]:
			var px: float = cx + fz * sx * a + fx * sz * c
			var pz: float = cz - fx * sx * a + fz * sz * c
			var q = city.road_at(px, pz)
			if q != null and absf(q.off) < q.r.T.hw + 3.0:
				return false
			if absf(px) > 455 or absf(pz) > 455:
				return false
	return true

func _add(cx: float, cz: float, sx: float, sz: float, h: float, yaw: float, col: Color, style: int, fh := 3.2, road = null, sd := 0) -> Dictionary:
	var base := 999.0
	for p in [[0, 0], [-0.5, -0.5], [0.5, 0.5], [0.5, -0.5], [-0.5, 0.5]]:
		base = minf(base, height(cx + cos(yaw) * sx * p[0] + sin(yaw) * sz * p[1], cz - sin(yaw) * sx * p[0] + cos(yaw) * sz * p[1]))
	var b := {"x": cx, "z": cz, "sx": sx, "sz": sz, "h": h, "yaw": yaw, "col": col, "style": style, "base": base, "sink": 2.0, "fh": fh, "road": road, "sd": sd}
	blds.append(b)
	city.add_box({"x": cx, "z": cz, "hw": sx / 2, "hl": sz / 2, "r": yaw, "kind": "bld"})
	return b

func _col(list: Array) -> Color:
	return Color(list[rnd.randi() % list.size()])

const C_GLASS := ["#7f97a8", "#6f8a8c", "#9aa4ad", "#56708a", "#8494a0"]
const C_SHOP := ["#d8d2c4", "#c9bfae", "#e6e2d8", "#b9b2a5", "#d6c8b0", "#c4cbd0", "#a89c8c", "#e2d9c8"]
const C_BRICK := ["#9a5a44", "#8c4f3b", "#a86c52", "#b07b5e", "#d9cbb4", "#c7b69c"]
const C_APT := ["#eceae4", "#e2ddd2", "#f0eee8", "#e8e4dc"]
const C_STONE := ["#cfc8bb", "#b8b3a8", "#a9a399", "#c2bcb0"]

func _kind_for(rtype: String) -> Array: # [모양, 앞폭 범위, 깊이 범위, 층수 범위, 층 높이]
	if theme == "gangnam":
		match rtype:
			"main": return [0 if rnd.randf() < 0.6 else 4, [22.0, 38.0], [18.0, 28.0], [10, 26], 3.6]
			"ring": return [1, [12.0, 20.0], [14.0, 20.0], [5, 10], 3.2]
			"side": return [1, [10.0, 18.0], [12.0, 18.0], [4, 8], 3.2]
			_: return [2, [10.0, 14.0], [11.0, 14.0], [4, 5], 2.8]
	match rtype:
		"main": return [1 if rnd.randf() < 0.85 else 4, [10.0, 18.0], [12.0, 18.0], [4, 9], 3.2]
		"ring": return [1 if rnd.randf() < 0.4 else 2, [10.0, 16.0], [11.0, 16.0], [3, 6], 3.0]
		_: return [2 if rnd.randf() < 0.75 else 1, [9.0, 14.0], [10.0, 14.0], [3, 5], 2.8]

func _frontage() -> void:
	for r: Dictionary in city.roads:
		for sd in [-1, 1]:
			var a: float = (r.cut.R0 if sd > 0 else r.cut.L0) + 3.0
			var b: float = r.L - (r.cut.R1 if sd > 0 else r.cut.L1) - 3.0
			var s := a
			while s < b - 8:
				var k := _kind_for(r.type)
				var w := rnd.randf_range(k[1][0], k[1][1])
				var d := rnd.randf_range(k[2][0], k[2][1])
				if s + w > b:
					w = b - s
				if w < 8:
					break
				var q: Dictionary = Kit.cut(r.pts, s + w / 2, s + w / 2 + 0.5)[0]
				var off: float = r.T.hw + 2.6 + 0.6 + d / 2
				var p := Kit.off_pt(q, sd * off)
				var floors := rnd.randi_range(k[3][0], k[3][1])
				var style: int = k[0]
				if theme == "ssu" and campus.has_point(Vector2(p.x, p.z)):
					s += w + 2
					continue
				if _free(p.x, p.z, d, w, q.yaw, 0.5):
					_add(p.x, p.z, d, w, floors * k[4] + 1.0, q.yaw, _col({0: C_GLASS, 1: C_SHOP, 2: C_BRICK, 4: C_STONE}[style]), style, k[4], r, sd)
				s += w + rnd.randf_range(0.6, 3.5)

func _fill() -> void: # 길 사이 안쪽: 낮은 건물들
	for i in 1400:
		var x := rnd.randf_range(-300, 300)
		var z := rnd.randf_range(-260, 260)
		var inside := absf(x) < 248 and absf(z) < 208
		if not inside:
			continue
		if theme == "ssu" and campus.has_point(Vector2(x, z)):
			continue
		var w := rnd.randf_range(10, 22)
		var d := rnd.randf_range(10, 22)
		if not _free(x, z, w, d, 0.0, 2.0):
			continue
		var style := 1
		var floors := 0
		if theme == "gangnam":
			style = [1, 1, 4, 0, 2][rnd.randi() % 5]
			floors = rnd.randi_range(4, 14 if absf(x) < 130 and absf(z) < 110 else 8)
		else:
			style = 2 if rnd.randf() < 0.75 else 1
			floors = rnd.randi_range(3, 6)
		var fh := 2.8 if style == 2 else 3.2
		_add(x, z, w, d, floors * fh + 1.0, 0.0, _col({0: C_GLASS, 1: C_SHOP, 2: C_BRICK, 4: C_STONE}[style]), style, fh)

func _outer() -> void: # 순환로 바깥: 강남은 아파트 단지, 숭실대입구는 언덕 빌라촌 + 아파트 몇 동
	var no := 101
	for i in 900:
		var x := rnd.randf_range(-440, 440)
		var z := rnd.randf_range(-440, 440)
		if absf(x) < 262 and absf(z) < 222:
			continue
		var apt := theme == "gangnam" or rnd.randf() < 0.18
		if apt:
			var along := rnd.randf() < 0.5
			var sx := 13.0
			var sz := rnd.randf_range(38, 58)
			var yaw := 0.0 if along else PI / 2
			if not _free(x, z, sx, sz, yaw, 7.0):
				continue
			var floors := rnd.randi_range(15, 29)
			var b := _add(x, z, sx, sz, floors * 2.8 + 2.0, yaw, _col(C_APT), 3, 2.8)
			b.no = no
			no += 1
		else:
			var w := rnd.randf_range(9, 14)
			var d := rnd.randf_range(9, 13)
			if not _free(x, z, w, d, 0.0, 1.2):
				continue
			_add(x, z, w, d, rnd.randi_range(3, 5) * 2.8 + 1.0, rnd.randf() * 0.2 - 0.1, _col(C_BRICK), 2, 2.8)

func _landmarks() -> void:
	_add(-148.0, -150.0, 24.0, 50.0, 9.0, 0.0, Color("#f2f1ec"), 4, 3.6)
	_label(-135.9, 7.0, -150.0, PI / 2, "강남운전면허시험장" if theme == "gangnam" else "상도동 주민센터", 16.0, Color("#2b44a6"))
	_add(60.0, 132.0, 50.0, 22.0, 11.0, 0.0, Color("#e8e2d2"), 1, 3.6)
	_label(60.0, 9.0, 120.9, PI, "초등학교", 12.0, Color("#3c6b3a"))
	_station()
	if theme == "ssu":
		_campus()

func _label(x: float, y: float, z: float, ry: float, txt: String, w: float, bg: Color) -> void:
	var g := Node3D.new()
	g.position = Vector3(x, y, z)
	g.rotation.y = ry
	city.add_child(g)
	Kit.box(g, Vector3(w, w / 7, 0.08), Vector3.ZERO, Kit.mat(bg, 0.6), false)
	var l := Kit.label3d(g, txt, Vector3(0, 0, 0.06), 128, Color.WHITE)
	l.pixel_size = w / (128.0 * txt.length() * 1.15)

# 지하철역 출입구: 가운데 사거리 모퉁이 (강남은 네 곳, 숭실대입구는 상도로 양쪽 두 곳)
func _station() -> void:
	var n: Dictionary = city.nodes["C"]
	var ew: Dictionary = n.arms["E"]
	var corners := [[1, 1], [-1, 1], [1, -1], [-1, -1]] if theme == "gangnam" else [[1, -1], [-1, 1]]
	var lc := Color(city.T.line_col)
	for c in corners:
		var x: float = n.x + c[0] * 26.0
		var z: float = n.z + c[1] * (ew.T.hw + 2.6 + 2.0)
		var g := Node3D.new()
		g.position = Vector3(x, 0, z)
		city.add_child(g)
		var granite := Kit.mat(Color(0.62, 0.6, 0.57), 0.7)
		for s in [-1, 1]:
			Kit.box(g, Vector3(0.25, 1.0, 6.0), Vector3(s * 1.5, 0.5, 0), granite)
		Kit.box(g, Vector3(3.0, 1.0, 0.25), Vector3(0, 0.5, -3.0), granite)
		Kit.box(g, Vector3(2.8, 0.05, 5.8), Vector3(0, 0.02, 0), Kit.mat(Color(0.08, 0.08, 0.09), 0.9), false) # 계단 아래 어둠
		var roof := Kit.box(g, Vector3(3.4, 0.1, 6.4), Vector3(0, 2.7, 0), Kit.mat(Color(0.6, 0.7, 0.75), 0.1, 0.0, 0.6))
		roof.transparency = 0.4
		for s in [-1, 1]:
			for e in [-1, 1]:
				Kit.cyl(g, 0.05, 2.7, Vector3(s * 1.55, 1.35, e * 3.0), Kit.POLE, 6)
		# 역 이름 기둥
		Kit.box(g, Vector3(0.5, 3.2, 0.5), Vector3(0, 1.6, 3.6), Kit.mat(Color(0.2, 0.21, 0.23), 0.5))
		var disk := Kit.cyl(g, 0.32, 0.06, Vector3(0, 2.75, 3.87), Kit.mat(lc, 0.4, 0.8), 18)
		disk.rotation.x = PI / 2
		var no := Kit.label3d(g, city.T.line, Vector3(0, 2.75, 3.91), 64, Color.WHITE)
		no.pixel_size = 0.006
		var nm := Kit.label3d(g, city.T.station, Vector3(0, 2.2, 3.87), 64, Color.WHITE)
		nm.pixel_size = 0.0045 if city.T.station.length() < 4 else 0.0028
		for side in [no, nm]:
			var b2 := side.duplicate() as Label3D
			b2.position.z = 3.33
			b2.rotation.y = PI
			g.add_child(b2)
		city.add_box({"x": x, "z": z, "hw": 1.7, "hl": 3.3, "r": 0.0, "kind": "bld"})
		city.add_box({"x": x, "z": z + 3.6, "hw": 0.25, "hl": 0.25, "r": 0.0, "kind": "pole"})

func _campus() -> void: # 숭실대학교: 상도로 남쪽 비탈 블록, 정문은 상도로 쪽
	var spots := [[35, 30, 30, 18, 7], [80, 28, 26, 16, 6], [30, 66, 22, 30, 8], [72, 64, 34, 20, 9], [102, 60, 14, 24, 5], [55, 44, 12, 12, 4]]
	for s in spots:
		_add(campus.position.x + s[0] - 10, campus.position.y + s[1] - 10, s[2], s[3], s[4] * 3.6 + 1.0, 0.0, Color("#8a5a45") if s[4] != 9 else Color("#9b6b55"), 5, 3.6)
	# 정문: 상도로 보도 뒤에 기둥 둘과 가로 보
	var r: Dictionary = city.nodes["C"].arms["E"]
	var gx := 60.0
	var gz: float = r.T.hw + 2.6 + 1.5
	var g := Node3D.new()
	g.position = Vector3(gx, 0, gz)
	city.add_child(g)
	var stone := Kit.mat(Color(0.55, 0.38, 0.3), 0.8)
	for s in [-1, 1]:
		Kit.box(g, Vector3(1.2, 5.0, 1.2), Vector3(s * 6.0, 2.5, 0), stone)
		city.add_box({"x": gx + s * 6.0, "z": gz, "hw": 0.6, "hl": 0.6, "r": 0.0, "kind": "bld"})
	Kit.box(g, Vector3(13.5, 1.0, 1.0), Vector3(0, 5.3, 0), stone)
	var t := Kit.label3d(g, "숭실대학교", Vector3(0, 5.3, -0.52), 96, Color(0.97, 0.94, 0.86))
	t.pixel_size = 0.009
	t.rotation.y = PI
	var t2 := Kit.label3d(g, "SOONGSIL UNIVERSITY", Vector3(0, 4.55, -0.62), 48, Color(0.3, 0.2, 0.15))
	t2.pixel_size = 0.006
	t2.rotation.y = PI

func _make_buildings() -> void:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.use_colors = true
	mm.use_custom_data = true
	mm.mesh = BoxMesh.new()
	mm.instance_count = blds.size()
	for i in blds.size():
		var b: Dictionary = blds[i]
		var total: float = b.h + b.sink
		var bas := Basis(Vector3.UP, b.yaw) * Basis.from_scale(Vector3(b.sx, total, b.sz))
		mm.set_instance_transform(i, Transform3D(bas, Vector3(b.x, b.base + b.h / 2 - b.sink / 2, b.z)))
		mm.set_instance_color(i, b.col)
		mm.set_instance_custom_data(i, Color(b.style, rnd.randf() * 10.0, b.sink, b.fh))
		_dress_bld(b)
	var mi := MultiMeshInstance3D.new()
	mi.multimesh = mm
	mi.material_override = city.bld_mat
	city.add_child(mi)
	_sign_meshes()
	_roof_meshes()

func _face(b: Dictionary) -> Array: # 길을 보는 면: [면 가운데, 바깥쪽, 면을 따라가는 방향, 면 폭]
	var yaw: float = b.yaw
	var left := Vector3(cos(yaw), 0, -sin(yaw))
	var fwd := Vector3(sin(yaw), 0, cos(yaw))
	var n: Vector3 = left * float(b.sd) # 길 오른쪽(+1) 건물은 길이 왼쪽에 있음
	return [Vector3(b.x, b.base, b.z) + n * (b.sx / 2 + 0.06), n, fwd, b.sz]

func _dress_bld(b: Dictionary) -> void:
	var style: int = b.style
	var top: float = b.base + b.h
	# 지붕 위: 물탱크, 실외기 (상가, 빌라)
	if style == 1 or style == 2:
		var fwd := Vector3(sin(b.yaw), 0, cos(b.yaw))
		var left := Vector3(cos(b.yaw), 0, -sin(b.yaw))
		var c: Vector3 = Vector3(b.x, top, b.z) + fwd * (b.sz * rnd.randf_range(-0.3, 0.3)) + left * (b.sx * rnd.randf_range(-0.3, 0.3))
		tanks.append(Transform3D(Basis(), c + Vector3(0, 0.8, 0)))
		roofs.append(Transform3D(Basis(Vector3.UP, b.yaw).scaled(Vector3(1.0, 1.0, 1.0)) * Basis.from_scale(Vector3(0.9, 0.7, 0.6)), c + left * 2.0 + Vector3(0, 0.35, 0)))
	if style == 3 and b.has("no"): # 아파트 동 번호 (짧은 벽 위쪽)
		for s in [-1, 1]:
			var fwd := Vector3(sin(b.yaw), 0, cos(b.yaw))
			var p: Vector3 = Vector3(b.x, top - 6.0, b.z) + fwd * (s * (b.sz / 2 + 0.05))
			var l := Kit.label3d(city, str(b.no), p, 128, Color(0.25, 0.3, 0.38))
			l.pixel_size = 0.03
			l.rotation.y = b.yaw + (0.0 if s > 0 else PI)
			l.double_sided = false
	if b.road == null:
		return
	var f := _face(b)
	var c0: Vector3 = f[0]
	var n: Vector3 = f[1]
	var along: Vector3 = f[2]
	var w: float = f[3]
	var face_basis := Basis.looking_at(-n, Vector3.UP) # 사각형 앞면(+Z)이 길 쪽을 봄
	var nh := SIGN_COLS.size()
	if style == 1:
		var floors := mini(int(b.h / b.fh), 6)
		# 1층 가게 간판 2~3개
		var shops := rnd.randi_range(2, 3)
		for i in shops:
			var sw := w / shops - 0.6
			var p := c0 + along * ((i + 0.5) * w / shops - w / 2) + Vector3(0, 3.45, 0) + n * 0.05
			signs.append([Transform3D(face_basis * Basis.from_scale(Vector3(sw, 0.6, 1)), p), _cell()])
		for fl2 in range(1, floors):
			if rnd.randf() < 0.18:
				continue
			var sw := w * rnd.randf_range(0.45, 0.85)
			var x := rnd.randf_range(-(w - sw) / 2, (w - sw) / 2)
			var p := c0 + along * x + Vector3(0, fl2 * b.fh + 1.0, 0) + n * (0.05 + fl2 * 0.002)
			signs.append([Transform3D(face_basis * Basis.from_scale(Vector3(sw, 0.7, 1)), p), _cell()])
		if floors >= 3 and rnd.randf() < 0.7: # 돌출 간판 (벽에서 튀어나온 세로 간판)
			var e := (w / 2 - 0.5) * (1 if rnd.randf() < 0.5 else -1)
			var p := c0 + along * e + n * 0.55 + Vector3(0, b.fh * 2.4, 0)
			var vb := Basis.looking_at(along, Vector3.UP)
			var cell := rnd.randi() % VSIGNS.size()
			vsigns.append([Transform3D(vb * Basis.from_scale(Vector3(0.75, 3.0, 1)), p), cell])
	elif style == 0 or style == 4:
		var p := c0 + Vector3(0, 3.4, 0) + n * 0.05
		signs.append([Transform3D(face_basis * Basis.from_scale(Vector3(minf(w * 0.5, 9.0), 0.9, 1)), p), _cell()])
		if rnd.randf() < 0.6: # 꼭대기 건물 이름
			var tp := c0 + Vector3(0, b.h - 2.2, 0) + n * 0.05
			signs.append([Transform3D(face_basis * Basis.from_scale(Vector3(minf(w * 0.55, 12.0), 1.6, 1)), tp), SIGNS_COMMON.size() + 10 + rnd.randi() % 5 if theme == "gangnam" else _cell()])
		if theme == "gangnam" and Vector2(b.x, b.z).length() < 75 and screens.size() < 3: # 강남역 사거리 전광판
			screens.append(Transform3D(face_basis * Basis.from_scale(Vector3(minf(w * 0.7, 14.0), 8.0, 1)), c0 + Vector3(0, minf(b.h - 6.0, 16.0), 0) + n * 0.1))
	elif style == 2 and rnd.randf() < 0.7: # 빌라 이름판
		var p := c0 + Vector3(0, 3.6, 0) + n * 0.05 + along * rnd.randf_range(-w / 4, w / 4)
		signs.append([Transform3D(face_basis * Basis.from_scale(Vector3(2.6, 0.6, 1)), p), 56 + rnd.randi() % VILLA_NAMES.size()])
	if style == 2 and rnd.randf() < 0.35: # 필로티 주차장에 세운 차
		var pc := c0 - n * 2.8 + Vector3(0, 0, 0)
		var m := Models.car(city, Color(city.CARCOL[rnd.randi() % city.CARCOL.size()]), "sedan")
		m.position = Vector3(pc.x, b.base, pc.z)
		m.rotation.y = atan2(n.x, n.z)

func _cell() -> int:
	return rnd.randi() % 56

func _sign_meshes() -> void:
	var texts := []
	var own: Array = SIGNS[theme]
	for i in 56:
		texts.append(SIGNS_COMMON[i] if i < SIGNS_COMMON.size() else own[(i - SIGNS_COMMON.size()) % own.size()])
	for n2 in VILLA_NAMES:
		texts.append(n2)
	var atlas := _atlas(texts, Vector2i(256, 64), 4, false)
	var vatlas := _atlas(VSIGNS, Vector2i(64, 256), 8, true)
	for pair in [[signs, atlas, Vector2(4, 16)], [vsigns, vatlas, Vector2(8, 1)]]:
		var list: Array = pair[0]
		if list.is_empty():
			continue
		var mat := ShaderMaterial.new()
		mat.shader = load("res://shaders/sign.gdshader")
		mat.set_shader_parameter("atlas", pair[1])
		mat.set_shader_parameter("grid", pair[2])
		city.sign_mats.append(mat)
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_custom_data = true
		mm.mesh = QuadMesh.new()
		mm.instance_count = list.size()
		for i in list.size():
			mm.set_instance_transform(i, list[i][0])
			mm.set_instance_custom_data(i, Color(list[i][1], 0, 0, 0))
		var mi := MultiMeshInstance3D.new()
		mi.multimesh = mm
		mi.material_override = mat
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		city.add_child(mi)
	if not screens.is_empty():
		var sm := ShaderMaterial.new()
		sm.shader = load("res://shaders/screen.gdshader")
		for t: Transform3D in screens:
			var q := MeshInstance3D.new()
			q.mesh = QuadMesh.new()
			q.material_override = sm
			q.transform = t
			q.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			city.add_child(q)

# 간판 글씨를 한 장의 그림판에 그림 (한 번만 그리는 작은 화면)
func _atlas(texts: Array, cell: Vector2i, cols: int, vertical: bool) -> Texture2D:
	var rows := ceili(texts.size() / float(cols))
	if not vertical:
		rows = 16
	var vp := SubViewport.new()
	vp.size = Vector2i(cell.x * cols, cell.y * rows)
	vp.disable_3d = true
	vp.render_target_update_mode = SubViewport.UPDATE_ONCE
	city.add_child(vp)
	var bg := ColorRect.new()
	bg.color = Color(0.1, 0.1, 0.1)
	bg.size = Vector2(vp.size)
	vp.add_child(bg)
	for i in texts.size():
		var pair: Array = SIGN_COLS[(i * 7 + 3) % SIGN_COLS.size()]
		var r := ColorRect.new()
		r.color = Color(pair[0])
		r.position = Vector2((i % cols) * cell.x, (i / cols) * cell.y)
		r.size = Vector2(cell)
		vp.add_child(r)
		var frame := ReferenceRect.new() # 간판 테두리
		frame.border_color = Color(pair[1], 0.5)
		frame.border_width = 3.0
		frame.editor_only = false
		frame.position = Vector2(5, 5)
		frame.size = Vector2(cell) - Vector2(10, 10)
		r.add_child(frame)
		var l := Label.new()
		var t: String = texts[i]
		l.text = _stack(t) if vertical else t
		l.add_theme_font_override("font", Kit.font())
		var fs := int(clampf(232.0 / maxf(1.0, t.length()), 16, 42)) if not vertical else int(clampf(230.0 / maxf(1.0, t.replace(" ", "").length()) * 0.8, 18, 44))
		l.add_theme_font_size_override("font_size", fs)
		l.add_theme_constant_override("line_spacing", -6)
		l.add_theme_color_override("font_color", Color(pair[1]))
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		l.size = Vector2(cell)
		r.add_child(l)
	return vp.get_texture()

func _stack(t: String) -> String: # 세로 간판: 한 글자씩 줄을 바꿈
	var out := []
	for ch in t.replace(" ", ""):
		out.append(ch)
	return "
".join(out)

func _roof_meshes() -> void:
	if not tanks.is_empty():
		var c := CylinderMesh.new()
		c.top_radius = 0.75
		c.bottom_radius = 0.75
		c.height = 1.6
		c.radial_segments = 10
		c.material = Kit.mat(Color("#3f8a5a"), 0.6)
		_mm(c, tanks)
	if not roofs.is_empty():
		var b := BoxMesh.new()
		b.material = Kit.mat(Color(0.82, 0.82, 0.8), 0.6)
		_mm(b, roofs)

func _mm(mesh: Mesh, ts: Array, shadow := true, vis := 0.0) -> MultiMesh:
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = mesh
	mm.instance_count = ts.size()
	for i in ts.size():
		mm.set_instance_transform(i, ts[i])
	var mi := MultiMeshInstance3D.new()
	mi.multimesh = mm
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if shadow else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	if vis > 0:
		mi.visibility_range_end = vis
	city.add_child(mi)
	return mm

# ───────── 가로수: 큰길은 노란 은행나무(11월), 다른 길은 잎이 듬성한 플라타너스, 벚나무 ─────────
func _trees() -> void:
	var trees := []
	for r: Dictionary in city.roads:
		var big: bool = r.type == "main"
		if not big and r.type != "ring" and not (theme == "gangnam" and r.type == "side"):
			continue
		var gap := 12.0 if big else 18.0
		var s: float = r.s0 + 10
		while s < r.s1 - 10:
			for sd in [-1, 1]:
				var q := Kit.off_pt(Kit.cut(r.pts, s, s + 1)[0], sd * (r.T.hw + 0.9))
				if city._near_node(q.x, q.z, 2) or not city.boxes_near(q.x, q.z).filter(func(b): return absf(b.x - q.x) < b.hw + 1.2 and absf(b.z - q.z) < b.hl + 1.2 and b.kind != "bld").is_empty():
					continue
				trees.append([Vector3(q.x, 0, q.z), big])
			s += gap
	var trunk := CylinderMesh.new()
	trunk.top_radius = 0.12
	trunk.bottom_radius = 0.17
	trunk.height = 2.6
	trunk.radial_segments = 7
	trunk.material = Kit.mat(Color("#5d5146"), 0.9)
	var leaf := SphereMesh.new()
	leaf.radius = 1.0
	leaf.height = 2.0
	leaf.radial_segments = 8
	leaf.rings = 5
	var tm := MultiMesh.new()
	tm.transform_format = MultiMesh.TRANSFORM_3D
	tm.mesh = trunk
	tm.instance_count = trees.size()
	var lm := MultiMesh.new()
	lm.transform_format = MultiMesh.TRANSFORM_3D
	lm.use_colors = true
	lm.mesh = leaf
	lm.instance_count = trees.size()
	for i in trees.size():
		var p: Vector3 = trees[i][0]
		var big: bool = trees[i][1]
		var tt := Transform3D(Basis(), p + Vector3(0, 1.3, 0))
		var lt := Transform3D(Basis(Vector3.UP, i * 1.7) * Basis.from_scale(Vector3(1.5, 2.4, 1.5) if big else Vector3(2.0, 1.6, 2.0)), p + Vector3(0, 4.3 if big else 3.9, 0))
		tm.set_instance_transform(i, tt)
		lm.set_instance_transform(i, lt)
		var col := Color("#d9a91c") if big and i % 5 != 0 else Color("#b8a23a") if big else (Color("#a0703a") if i % 3 else Color("#8a6a3a"))
		lm.set_instance_color(i, col)
		city.add_box({"x": p.x, "z": p.z, "hw": 0.22, "hl": 0.22, "r": 0.0, "kind": "tree", "mm": [lm], "idx": i, "t0": [lt], "col": col})
	var tmi := MultiMeshInstance3D.new()
	tmi.multimesh = tm
	city.add_child(tmi)
	var lmi := MultiMeshInstance3D.new()
	lmi.multimesh = lm
	lmi.material_override = city.leaf_mat
	city.add_child(lmi)

func _speed_signs() -> void:
	for r: Dictionary in city.roads:
		if is_same(r, city.school):
			continue
		for e in [[r.s0 + 8, 1, r.pts[0].yaw + PI], [r.s1 - 8, -1, r.pts[-1].yaw]]:
			var q := Kit.off_pt(Kit.cut(r.pts, e[0], e[0] + 1)[0], e[1] * (r.T.hw + 0.8))
			var g := Kit.sign_post(city, "max", str(r.T.lim), q.x, q.z, e[2], 2.2, 0.6)
			city.add_box({"x": q.x, "z": q.z, "hw": 0.1, "hl": 0.1, "r": 0.0, "kind": "sign", "node": g})

# ───────── 가로등: 기둥, 굽은 팔, 등. 부딪히면 넘어감 ─────────
func _lamps() -> void:
	for r: Dictionary in city.roads:
		if r.type == "alley":
			continue
		var s: float = r.s0 + 6
		var step := 30.0 if r.type == "main" else 40.0
		while s < r.s1 - 6:
			var sds := [1, -1] if r.type == "main" else [1]
			for sd in sds:
				var q := Kit.off_pt(Kit.cut(r.pts, s + (step / 2 if sd < 0 else 0.0), s + 1 + (step / 2 if sd < 0 else 0.0))[0], sd * (r.T.hw + 0.5))
				var tree_near: bool = not city.boxes_near(q.x, q.z).filter(func(b): return b.kind == "tree" and absf(b.x - q.x) < 2.0 and absf(b.z - q.z) < 2.0).is_empty()
				if not city._near_node(q.x, q.z, 0) and not tree_near:
					city.lamps.append({"x": q.x, "z": q.z, "yaw": q.yaw + (0.0 if sd > 0 else PI)})
			s += step
	var pole := CylinderMesh.new()
	pole.top_radius = 0.07
	pole.bottom_radius = 0.11
	pole.height = 8.0
	pole.radial_segments = 7
	pole.material = Kit.mat(Color(0.42, 0.43, 0.44), 0.5, 0.0, 0.4)
	var arm := BoxMesh.new()
	arm.size = Vector3(2.2, 0.08, 0.08)
	arm.material = pole.material
	var head := BoxMesh.new()
	head.size = Vector3(0.7, 0.14, 0.35)
	city.lamp_head_mat = Kit.mat(Color(1.0, 0.86, 0.6), 0.4).duplicate() as StandardMaterial3D
	head.material = city.lamp_head_mat
	var pm := MultiMesh.new()
	var am := MultiMesh.new()
	var hm := MultiMesh.new()
	for m: MultiMesh in [pm, am, hm]:
		m.transform_format = MultiMesh.TRANSFORM_3D
		m.instance_count = city.lamps.size()
	pm.mesh = pole
	am.mesh = arm
	hm.mesh = head
	for i in city.lamps.size():
		var L: Dictionary = city.lamps[i]
		var inward := Vector3(cos(L.yaw), 0, -sin(L.yaw)) # 길 쪽
		var rb := Basis(Vector3.UP, L.yaw + PI / 2)
		var base := Vector3(L.x, 0, L.z)
		var ts := [Transform3D(Basis(), base + Vector3(0, 4.0, 0)), Transform3D(rb, base + Vector3(0, 7.9, 0) + inward * 1.0), Transform3D(rb, base + Vector3(0, 7.85, 0) + inward * 2.0)]
		pm.set_instance_transform(i, ts[0])
		am.set_instance_transform(i, ts[1])
		hm.set_instance_transform(i, ts[2])
		city.add_box({"x": L.x, "z": L.z, "hw": 0.13, "hl": 0.13, "r": 0.0, "kind": "lamp", "mm": [pm, am, hm], "idx": i, "t0": ts, "base": base})
	for m: MultiMesh in [pm, am, hm]:
		var mi := MultiMeshInstance3D.new()
		mi.multimesh = m
		city.add_child(mi)

# ───────── 거리 사물 ─────────
func _furniture() -> void:
	var bollards := []
	var hydrants := []
	var fences := []
	for cr: Dictionary in city.crossings: # 횡단보도 끝: 볼라드 둘, 신호 교차로는 보행자 신호등
		for e: Dictionary in cr.ends:
			var dirv := Vector2(e.x - cr.x, e.z - cr.z).normalized()
			for s in [-1.4, 1.4]:
				var p := Vector3(e.x - dirv.x * 1.2 + cr.ax.x * s, 0, e.z - dirv.y * 1.2 + cr.ax.y * s)
				bollards.append(Transform3D(Basis(), p + Vector3(0, 0.45, 0)))
				city.add_box({"x": p.x, "z": p.z, "hw": 0.12, "hl": 0.12, "r": 0.0, "kind": "pole"})
			if cr.n != null and cr.n.sig:
				var pp := Vector3(e.x + cr.ax.x * 2.6, 0, e.z + cr.ax.y * 2.6)
				var g := Node3D.new()
				g.position = pp
				g.rotation.y = atan2(-dirv.x, -dirv.y) # 건너편을 봄
				city.add_child(g)
				Kit.cyl(g, 0.06, 2.9, Vector3(0, 1.45, 0), Kit.POLE, 6)
				Kit.box(g, Vector3(0.36, 0.72, 0.2), Vector3(0, 2.6, 0.08), Kit.mat(Color(0.12, 0.12, 0.13), 0.6), false)
				var red := Kit.box(g, Vector3(0.26, 0.26, 0.02), Vector3(0, 2.78, 0.19), Kit.PED_R_ON, false)
				var grn := Kit.box(g, Vector3(0.26, 0.26, 0.02), Vector3(0, 2.44, 0.19), Kit.PED_G_OFF, false)
				city.ped_heads.append([cr, red, grn, false])
				city.add_box({"x": pp.x, "z": pp.z, "hw": 0.1, "hl": 0.1, "r": 0.0, "kind": "pole"})
	var stop_no := 0
	for r: Dictionary in city.roads:
		var bus: bool = r.type == "main" or (theme == "ssu" and r.type == "ring")
		var s: float = r.s0 + 30
		while s < r.s1 - 30:
			for sd in [-1, 1]:
				if bus and int(s) % 150 < 12 and sd == 1:
					_bus_stop(r, s, sd, stop_no)
					stop_no += 1
				elif rnd.randf() < 0.06:
					var q := Kit.off_pt(Kit.cut(r.pts, s, s + 1)[0], sd * (r.T.hw + 0.55))
					if city.boxes_near(q.x, q.z).filter(func(b): return absf(b.x - q.x) < b.hw + 0.8 and absf(b.z - q.z) < b.hl + 0.8).is_empty():
						var t := Transform3D(Basis(), Vector3(q.x, 0.4, q.z))
						var bx := {"x": q.x, "z": q.z, "hw": 0.15, "hl": 0.15, "r": 0.0, "kind": "hydrant", "idx": hydrants.size()}
						hydrants.append(t)
						city.add_box(bx)
			s += 12.0
		# 보행자 울타리: 강남 큰길 보도 가장자리 (나무, 가로등 사이), 12m씩 한 덩어리
		if theme == "gangnam" and r.type == "main":
			for sd in [-1, 1]:
				var a: float = r.s0 + 6.0
				while a < r.s1 - 14.0:
					var q := Kit.off_pt(Kit.cut(r.pts, a + 6.0, a + 6.5)[0], sd * (r.T.hw + 0.3))
					if city.boxes_near(q.x, q.z).filter(func(b): return b.kind == "bld" and absf(b.x - q.x) < b.hw + 6 and absf(b.z - q.z) < b.hl + 6 and b.hw < 3).is_empty():
						var t := Transform3D(Basis(Vector3.UP, q.yaw), Vector3(q.x, 0.12, q.z))
						var bx := {"x": q.x, "z": q.z, "hw": 0.08, "hl": 5.8, "r": q.yaw, "kind": "fence", "idx": fences.size()}
						fences.append(t)
						city.add_box(bx)
					a += 14.0
	var bm := CylinderMesh.new()
	bm.top_radius = 0.1
	bm.bottom_radius = 0.12
	bm.height = 0.9
	bm.radial_segments = 8
	bm.material = Kit.mat(Color(0.3, 0.3, 0.32), 0.5, 0.0, 0.3)
	_mm(bm, bollards, false, 150.0)
	var hm := CylinderMesh.new()
	hm.top_radius = 0.12
	hm.bottom_radius = 0.16
	hm.height = 0.8
	hm.radial_segments = 8
	hm.material = Kit.mat(Color(0.8, 0.12, 0.1), 0.5)
	city.hydrant_mm = _mm(hm, hydrants, false, 150.0)
	city.fence_mm = _mm(_fence_mesh(), fences, false, 200.0)
	for b: Dictionary in city.boxes:
		if b.kind == "hydrant":
			b.mm = [city.hydrant_mm]
			b.t0 = [hydrants[b.idx]]
		elif b.kind == "fence":
			b.mm = [city.fence_mm]
			b.t0 = [fences[b.idx]]
	_gantries()
	_camera_pole()

# 보행자 울타리 한 덩어리 (11.6m): 세로 살 무늬를 그린 판 하나 (속이 비침, 삼각형 2개)
func _fence_mesh() -> Mesh:
	var img := Image.create(64, 32, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	for x in 64:
		for y in 32:
			var rail := y < 3 or (y > 24 and y < 27)
			var bar := x % 4 == 0
			var post := x < 3
			if rail or bar or post:
				img.set_pixel(x, y, Color(0.92, 0.93, 0.94, 1.0))
	img.generate_mipmaps()
	var tex := ImageTexture.create_from_image(img)
	var q := QuadMesh.new()
	q.size = Vector2(11.6, 0.95)
	q.orientation = PlaneMesh.FACE_X
	q.center_offset = Vector3(0, 0.5, 0)
	var m := StandardMaterial3D.new()
	m.albedo_texture = tex
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	m.alpha_scissor_threshold = 0.5
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	m.uv1_scale = Vector3(4, 1, 1)
	m.metallic = 0.4
	m.roughness = 0.35
	m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	q.material = m
	return q

func _bus_stop(r: Dictionary, s: float, sd: int, no: int) -> void:
	var q: Dictionary = Kit.cut(r.pts, s, s + 1)[0]
	var p := Kit.off_pt(q, sd * (r.T.hw + 1.9))
	if not city.boxes_near(p.x, p.z).filter(func(b): return absf(b.x - p.x) < b.hw + 2.5 and absf(b.z - p.z) < b.hl + 2.5 and b.kind != "bld").is_empty():
		return
	var g := Node3D.new()
	g.position = Vector3(p.x, 0.12, p.z)
	g.rotation.y = q.yaw + (PI / 2 if sd > 0 else -PI / 2) # 앞(+Z)이 길 쪽
	city.add_child(g)
	var blue := Kit.mat(Color("#1d4f9c") if theme == "gangnam" or r.type == "main" else Color("#3a9a4a"), 0.5)
	Kit.box(g, Vector3(4.2, 0.12, 1.6), Vector3(0, 2.5, 0), blue)
	var glass := Kit.box(g, Vector3(4.0, 2.0, 0.05), Vector3(0, 1.35, -0.7), Kit.mat(Color(0.7, 0.8, 0.85), 0.05, 0.0, 0.5))
	glass.transparency = 0.6
	for x in [-2.0, 2.0]:
		Kit.box(g, Vector3(0.08, 2.5, 0.08), Vector3(x, 1.25, -0.7), Kit.POLE)
	Kit.box(g, Vector3(2.6, 0.08, 0.45), Vector3(0, 0.48, -0.42), Kit.mat(Color(0.55, 0.4, 0.28), 0.8))
	var info := Kit.box(g, Vector3(1.0, 0.35, 0.08), Vector3(1.4, 2.2, 0.3), Kit.mat(Color(0.05, 0.05, 0.05)), false)
	var led := Kit.label3d(info, "146  3분" if no % 2 == 0 else "472  곧 도착", Vector3(0, 0, 0.05), 48, Color(1.0, 0.6, 0.1))
	led.shaded = false
	led.pixel_size = 0.0028
	var sign := Kit.label3d(g, "정류장", Vector3(-1.4, 2.25, 0.07), 48, Color.WHITE)
	sign.pixel_size = 0.005
	city.add_box({"x": p.x, "z": p.z, "hw": 2.1, "hl": 0.8, "r": q.yaw, "kind": "bld"})
	for i in rnd.randi_range(1, 3): # 기다리는 사람
		var m := Models.person(g, _coat(), 1.0, rnd.randf() < 0.5)
		m.position = Vector3(rnd.randf_range(-1.6, 1.6), 0, 0.2 + rnd.randf() * 0.4)

func _coat() -> Color:
	var cs := ["#1c1c1f", "#1c1c1f", "#2a2d38", "#5a4636", "#d8cfbf", "#3c4a5c", "#7a2f2a", "#e6e3dc", "#4a5a3a"]
	return Color(cs[rnd.randi() % cs.size()])

# 파란 도로 이정표: 가운데 사거리로 들어오는 큰길 위
func _gantries() -> void:
	var n: Dictionary = city.nodes["C"]
	for d: String in n.arms:
		var r: Dictionary = n.arms[d]
		if r.T.n != 2:
			continue
		var into: bool = r.b == "C" # 이 길에서 C로 들어가는 방향
		var s: float = (r.L - 75.0) if into else 75.0
		var q: Dictionary = Kit.cut(r.pts, s, s + 1)[0]
		var yaw: float = q.yaw if into else q.yaw + PI
		var right := Vector2(-cos(yaw), sin(yaw))
		var base := Vector3(q.x + right.x * (r.T.hw + 0.7), 0, q.z + right.y * (r.T.hw + 0.7))
		var g := Node3D.new()
		g.position = base
		g.rotation.y = yaw
		city.add_child(g)
		var pole := Kit.mat(Color(0.5, 0.52, 0.54), 0.4, 0.0, 0.5)
		Kit.cyl(g, 0.18, 7.0, Vector3(0, 3.5, 0), pole, 10)
		Kit.box(g, Vector3(r.T.hw + 0.7, 0.25, 0.25), Vector3((r.T.hw + 0.7) / 2, 6.6, 0), pole)
		var panel := Node3D.new()
		panel.position = Vector3(r.T.lw + 0.9, 6.0, -0.15)
		panel.rotation.y = PI
		g.add_child(panel)
		Kit.box(panel, Vector3(5.6, 2.2, 0.1), Vector3.ZERO, Kit.mat(Color("#1f4fa8"), 0.5), false)
		var h: String = City.DIRS.keys()[City.DIRS.values().find(Vector2(round(sin(yaw)), round(cos(yaw))))]
		var dest: Dictionary = city.T.dest
		var t1 := Kit.label3d(panel, "↑ " + String(dest[h]), Vector3(0, 0.45, 0.06), 64, Color.WHITE)
		t1.pixel_size = 0.009
		var t2 := Kit.label3d(panel, "← %s      %s →" % [dest[City.LEFT[h]], dest[City.RIGHT[h]]], Vector3(0, -0.5, 0.06), 64, Color.WHITE)
		t2.pixel_size = 0.0072
		city.add_box({"x": base.x, "z": base.z, "hw": 0.2, "hl": 0.2, "r": 0.0, "kind": "pole"})

func _camera_pole() -> void: # 과속 단속 카메라 (큰길 하나)
	var r: Dictionary = city.nodes["C"].arms["W"]
	var q: Dictionary = Kit.cut(r.pts, 60.0, 61.0)[0]
	var p := Kit.off_pt(q, r.T.hw + 0.8)
	var g := Node3D.new()
	g.position = Vector3(p.x, 0, p.z)
	g.rotation.y = q.yaw + PI
	city.add_child(g)
	Kit.cyl(g, 0.12, 6.5, Vector3(0, 3.25, 0), Kit.POLE, 8)
	Kit.box(g, Vector3(3.0, 0.15, 0.15), Vector3(1.5, 6.3, 0), Kit.POLE)
	Kit.box(g, Vector3(0.5, 0.4, 0.7), Vector3(2.8, 6.0, 0), Kit.mat(Color(0.85, 0.85, 0.82), 0.4))
	var sg := Kit.box(g, Vector3(1.4, 0.5, 0.05), Vector3(0, 2.6, 0.08), Kit.mat(Color(0.95, 0.95, 0.92), 0.5), false)
	var t := Kit.label3d(sg, "과속단속", Vector3(0, 0, 0.04), 48, Color(0.8, 0.1, 0.1))
	t.pixel_size = 0.005
	city.add_box({"x": p.x, "z": p.z, "hw": 0.15, "hl": 0.15, "r": 0.0, "kind": "pole"})

# ───────── 전봇대와 전선 (숭실대입구는 큰길 말고 다, 강남은 이면도로만) ─────────
func _wires() -> void:
	var poles := []
	var wires := []
	var trans := []
	for r: Dictionary in city.roads:
		if r.type == "main" or (theme == "gangnam" and r.type != "alley"):
			continue
		var prev = null
		var s: float = (r.cut.R0) + 4.0
		while s < r.L - r.cut.R1 - 4.0:
			var q: Dictionary = Kit.cut(r.pts, s, s + 1)[0]
			var off: float = r.T.hw + 0.45 if r.type != "alley" else -(r.T.hw + 0.3)
			var p := Kit.off_pt(q, off)
			var blocked := not city.boxes_near(p.x, p.z).filter(func(b): return b.kind != "bld" and absf(b.x - p.x) < b.hw + 1.0 and absf(b.z - p.z) < b.hl + 1.0).is_empty()
			if not blocked and not city._near_node(p.x, p.z, -2):
				var top := Vector3(p.x, 9.0, p.z)
				poles.append(Transform3D(Basis(), Vector3(p.x, 4.6, p.z)))
				city.add_box({"x": p.x, "z": p.z, "hw": 0.18, "hl": 0.18, "r": 0.0, "kind": "pole"})
				if poles.size() % 3 == 0:
					trans.append(Transform3D(Basis(), top + Vector3(0, -1.6, 0) + Vector3(cos(q.yaw), 0, -sin(q.yaw)) * 0.35 * signf(off)))
				if prev != null and (prev as Vector3).distance_to(top) < 40:
					for k in 3:
						var a: Vector3 = prev + Vector3(0, -k * 0.35, 0)
						var b := top + Vector3(0, -k * 0.35, 0)
						for m in 4: # 처진 선
							var t0 := m / 4.0
							var t1 := (m + 1) / 4.0
							var p0 := a.lerp(b, t0) - Vector3(0, sin(t0 * PI) * 0.6, 0)
							var p1 := a.lerp(b, t1) - Vector3(0, sin(t1 * PI) * 0.6, 0)
							var mid := (p0 + p1) / 2
							var len := p0.distance_to(p1)
							var bas := Basis.looking_at((p1 - p0).normalized(), Vector3.UP if absf((p1 - p0).normalized().y) < 0.99 else Vector3.RIGHT)
							wires.append(Transform3D(bas * Basis.from_scale(Vector3(0.025, 0.025, len)), mid))
				prev = top
			s += 30.0
	var pm := CylinderMesh.new()
	pm.top_radius = 0.13
	pm.bottom_radius = 0.18
	pm.height = 9.2
	pm.radial_segments = 7
	pm.material = Kit.mat(Color(0.62, 0.62, 0.6), 0.8)
	_mm(pm, poles)
	var wm := BoxMesh.new()
	wm.material = Kit.mat(Color(0.06, 0.06, 0.06), 0.8)
	_mm(wm, wires, false, 220.0)
	var tmesh := CylinderMesh.new()
	tmesh.top_radius = 0.3
	tmesh.bottom_radius = 0.3
	tmesh.height = 0.9
	tmesh.radial_segments = 8
	tmesh.material = Kit.mat(Color(0.5, 0.52, 0.5), 0.6, 0.0, 0.3)
	_mm(tmesh, trans, false, 200.0)

# ───────── 보도를 걷는 사람 (11월이라 긴 패딩이 많음) ─────────
func _walkers() -> void:
	var count := 70 if theme == "gangnam" else 50
	var roads := city.roads.filter(func(r): return r.type == "main" or r.type == "side" or (theme == "ssu" and r.type == "dong"))
	for i in count:
		var r: Dictionary = roads[rnd.randi() % roads.size()]
		var sd := 1 if rnd.randf() < 0.5 else -1
		var s := rnd.randf_range(r.s0 + 4, r.s1 - 4)
		var m := Models.person(city, _coat(), rnd.randf_range(0.92, 1.06), rnd.randf() < 0.45, Color(0.08, 0.07, 0.07) if rnd.randf() < 0.85 else Color(0.45, 0.3, 0.2))
		city.add_walker(r, sd, s, m)

# ───────── 땅: 강남은 평평, 숭실대입구는 언덕 (길과 보도 둘레는 평평하게) ─────────
func _ground() -> void:
	if theme != "ssu":
		fl.quad({"x": -460.0, "z": -460.0}, {"x": 460.0, "z": -460.0}, {"x": 460.0, "z": 460.0}, {"x": -460.0, "z": 460.0}, City.C_GROUND, 0.0, 0.0)
		return
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var step := 8.0
	var n := int(920.0 / step)
	var hs := PackedFloat32Array()
	hs.resize((n + 1) * (n + 1))
	for j in n + 1:
		for i in n + 1:
			hs[j * (n + 1) + i] = height(-460.0 + i * step, -460.0 + j * step) - 0.02
	for j in n:
		for i in n:
			var x0 := -460.0 + i * step
			var z0 := -460.0 + j * step
			var p := [Vector3(x0, hs[j * (n + 1) + i], z0), Vector3(x0 + step, hs[j * (n + 1) + i + 1], z0),
				Vector3(x0 + step, hs[(j + 1) * (n + 1) + i + 1], z0 + step), Vector3(x0, hs[(j + 1) * (n + 1) + i], z0 + step)]
			for t in [[0, 2, 1], [0, 3, 2]]:
				var a: Vector3 = p[t[0]]
				var b: Vector3 = p[t[1]]
				var c: Vector3 = p[t[2]]
				var nn := (c - a).cross(b - a).normalized()
				if nn.y < 0:
					nn = -nn
				for v in [a, b, c]:
					st.set_color(City.C_GROUND)
					st.set_uv(Vector2(5.0, 0.5))
					st.set_normal(nn)
					st.add_vertex(v)
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = city.ground_mat
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	city.add_child(mi)

# 먼 산: 강남은 북쪽 남산(타워)과 남쪽 우면산, 숭실대입구는 남쪽 관악산이 가깝고 크게
func _mountains() -> void:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var nz := FastNoiseLite.new()
	nz.seed = 3
	nz.frequency = 1.6
	for layer in [[820.0, Color(0.3, 0.37, 0.34)], [1150.0, Color(0.42, 0.48, 0.52)]]:
		var R: float = layer[0]
		var seg := 140
		for i in seg:
			var pts := []
			for k in [i, i + 1]:
				var a: float = TAU * k / seg
				var hh := _ridge(a, nz, R)
				pts.append([Vector3(cos(a) * (R - 260), -4, sin(a) * (R - 260)), Vector3(cos(a) * R, hh, sin(a) * R)])
			for t in [[pts[0][0], pts[0][1], pts[1][1]], [pts[0][0], pts[1][1], pts[1][0]]]:
				var nn := ((t[1] as Vector3) - (t[0] as Vector3)).cross((t[2] as Vector3) - (t[0] as Vector3)).normalized()
				if nn.y < 0:
					nn = -nn
				for v in t:
					st.set_color(layer[1])
					st.set_normal(nn)
					st.add_vertex(v)
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	var m := StandardMaterial3D.new()
	m.vertex_color_use_as_albedo = true
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	m.roughness = 1.0
	mi.material_override = m
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	city.add_child(mi)
	# 남산서울타워 모양 (북쪽 산 위)
	var ta := -PI / 2 + (0.12 if theme == "gangnam" else 0.45)
	var tp := Vector3(cos(ta) * 815.0, _ridge(ta, nz, 820.0) - 4.0, sin(ta) * 815.0)
	var tw := Node3D.new()
	tw.position = tp
	city.add_child(tw)
	var white := Kit.mat(Color(0.85, 0.85, 0.83), 0.6)
	Kit.cyl(tw, 2.2, 60.0, Vector3(0, 30, 0), white, 10)
	Kit.cyl(tw, 6.0, 7.0, Vector3(0, 52, 0), white, 14)
	Kit.cyl(tw, 0.6, 30.0, Vector3(0, 74, 0), Kit.mat(Color(0.75, 0.3, 0.25), 0.6), 6)
	city.tower = tw

func _ridge(a: float, nz: FastNoiseLite, R: float) -> float:
	var n := nz.get_noise_1d(a * 3.0 + R) * 0.5 + 0.5
	var big := 0.0
	if theme == "gangnam":
		big = 60.0 * exp(-pow(Kit.wrap_a(a + PI / 2 - 0.12) / 0.25, 2)) + 70.0 * exp(-pow(Kit.wrap_a(a - PI / 2 + 0.3) / 0.4, 2))
	else:
		big = 150.0 * exp(-pow(Kit.wrap_a(a - PI / 2 - 0.1) / 0.6, 2)) + 50.0 * exp(-pow(Kit.wrap_a(a + PI / 2 - 0.45) / 0.25, 2))
	return 25.0 + n * 55.0 * (R / 820.0) + big
