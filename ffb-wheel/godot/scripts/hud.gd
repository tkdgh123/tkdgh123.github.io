# 화면 위 글과 단추: 날씨와 상황 설정판(Tab), 계기판, 알림, 상황 결과 카드, 작은 지도, 밤 눈부심
# 결은 웹판(창공설 레이싱 휠 페이지)을 따름: 밝은 종이색, 먹색 글, 파란 강조, 어두운 반투명 계기판
class_name Hud
extends CanvasLayer

const PAPER := Color(0.949, 0.945, 0.925)
const INK := Color(0.082, 0.082, 0.078)
const MUTED := Color(0.42, 0.42, 0.4)
const BLUE := Color(0.169, 0.267, 0.651)
const RED := Color(0.72, 0.2, 0.16)
const DARK := Color(0.082, 0.082, 0.078, 0.88)

var cb := {}            # 바깥으로 알릴 일 {"weather": Callable, ...}
var root: Control
var panel: Control
var checks := {}
var wbtn := {}
var fog_c: CheckButton
var night_c: CheckButton
var simple_c: CheckButton
var keys_l: Label
var top_l: Label
var spd_l: Label
var gear_l: RichTextLabel
var sig_l: Label
var sig_r: Label
var ic := {}
var ffb_bar: FfbBar
var toasts: VBoxContainer
var results: VBoxContainer
var minimap: MiniMap
var glare: TextureRect
var big_l: Label
var mirror: TextureRect
var log := []            # 시험에서 읽음: 알림과 결과

class FfbBar extends Control: # 핸들 힘: 가운데 0, 왼쪽(-) 오른쪽(+)으로 막대
	var v := 0.0
	func _draw() -> void:
		var w := size.x
		var h := size.y
		draw_rect(Rect2(0, h * 0.35, w, h * 0.3), Color(0.23, 0.23, 0.22))
		var x0 := w / 2
		var x1 := w / 2 - v * w / 2 # + = 핸들을 왼쪽으로 미는 힘 → 막대가 왼쪽으로
		draw_rect(Rect2(minf(x0, x1), h * 0.2, absf(x1 - x0), h * 0.6), Color(0.62, 0.7, 1.0))
		draw_line(Vector2(x0, 0), Vector2(x0, h), Color(0.9, 0.9, 0.88), 1.5)

class MiniMap extends Control: # 도시: 내 차 가운데, 진행 방향이 위
	var lines := []
	var cars := []
	var me := Vector3.ZERO  # x, z, yaw
	var marks := []
	func _draw() -> void:
		var s := size.x
		draw_rect(Rect2(Vector2.ZERO, size), Color(0.949, 0.945, 0.925, 0.9))
		var k := s / 2.0 / 120.0
		var c := cos(me.z - PI)
		var sn := sin(me.z - PI)
		var tf := func(p: Vector2) -> Vector2:
			var d := (p - Vector2(me.x, me.y)) * k
			return Vector2(s / 2 + d.x * c - d.y * sn, s / 2 + d.x * sn + d.y * c)
		for L: Array in lines:
			var pts := PackedVector2Array()
			var near := false
			for p: Vector2 in L:
				pts.append(tf.call(p))
				if absf(p.x - me.x) < 170 and absf(p.y - me.y) < 170:
					near = true
			if near and pts.size() > 1:
				draw_polyline(pts, Color(0.79, 0.78, 0.74), 9.0 * k * 1.6, true)
		for p: Vector2 in cars:
			var q: Vector2 = tf.call(p)
			if q.x > 0 and q.y > 0 and q.x < s and q.y < s:
				draw_circle(q, 2.6, Color(0.56, 0.56, 0.55))
		for m: Array in marks:
			var q: Vector2 = tf.call(m[0])
			if q.x > 0 and q.y > 0 and q.x < s and q.y < s:
				draw_circle(q, 4.0, m[1])
		var o := Vector2(s / 2, s / 2)
		draw_colored_polygon(PackedVector2Array([o + Vector2(0, -7), o + Vector2(5, 5), o + Vector2(0, 2), o + Vector2(-5, 5)]), Color(0.88, 0.27, 0.17))

func _ready() -> void:
	layer = 5
	root = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.theme = _theme()
	add_child(root)
	# 밤 눈부심 (맞은편 차 상향등)
	glare = TextureRect.new()
	var gt := GradientTexture2D.new()
	gt.fill = GradientTexture2D.FILL_RADIAL
	gt.fill_from = Vector2(0.5, 0.5)
	gt.fill_to = Vector2(1.0, 0.5)
	var g := Gradient.new()
	g.colors = PackedColorArray([Color(1, 0.98, 0.9, 1), Color(1, 0.96, 0.85, 0.35), Color(1, 1, 1, 0)])
	g.offsets = PackedFloat32Array([0.0, 0.25, 1.0])
	gt.gradient = g
	gt.width = 256
	gt.height = 256
	glare.texture = gt
	glare.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	glare.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var add := CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	glare.material = add
	glare.visible = false
	root.add_child(glare)
	# 위 왼쪽: 지금 날씨, 켠 상황, 설정 열기
	var tp := PanelContainer.new()
	tp.add_theme_stylebox_override("panel", _box(DARK, 10))
	tp.position = Vector2(24, 20)
	root.add_child(tp)
	top_l = Label.new()
	top_l.add_theme_color_override("font_color", PAPER)
	top_l.add_theme_font_size_override("font_size", 15)
	tp.add_child(top_l)
	# 아래 가운데 계기판
	var bottom := HBoxContainer.new()
	bottom.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	bottom.offset_top = -86
	bottom.offset_bottom = -18
	bottom.alignment = BoxContainer.ALIGNMENT_CENTER
	bottom.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(bottom)
	var dash := PanelContainer.new()
	dash.add_theme_stylebox_override("panel", _box(DARK, 12))
	bottom.add_child(dash)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 16)
	dash.add_child(row)
	spd_l = _lab(row, "0", 34, PAPER)
	spd_l.custom_minimum_size.x = 62
	spd_l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_lab(row, "km/h", 12, Color(0.7, 0.7, 0.68))
	gear_l = RichTextLabel.new()
	gear_l.bbcode_enabled = true
	gear_l.fit_content = true
	gear_l.scroll_active = false
	gear_l.autowrap_mode = TextServer.AUTOWRAP_OFF
	gear_l.custom_minimum_size = Vector2(110, 0)
	gear_l.add_theme_font_size_override("normal_font_size", 18)
	gear_l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(gear_l)
	sig_l = _lab(row, "◀", 20, Color(0.35, 0.35, 0.33))
	sig_r = _lab(row, "▶", 20, Color(0.35, 0.35, 0.33))
	for k in ["hz", "lt", "slip"]:
		ic[k] = _lab(row, {"hz": "비상등", "lt": "전조등", "slip": "미끄럼"}[k], 14, Color(0.35, 0.35, 0.33))
	var fv := VBoxContainer.new()
	fv.add_theme_constant_override("separation", 0)
	row.add_child(fv)
	_lab(fv, "핸들에 오는 힘", 11, Color(0.7, 0.7, 0.68))
	ffb_bar = FfbBar.new()
	ffb_bar.custom_minimum_size = Vector2(130, 16)
	fv.add_child(ffb_bar)
	# 위 가운데 알림
	toasts = VBoxContainer.new()
	toasts.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	toasts.offset_top = 70
	toasts.offset_bottom = 400
	toasts.alignment = BoxContainer.ALIGNMENT_BEGIN
	toasts.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(toasts)
	big_l = Label.new()
	big_l.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	big_l.add_theme_font_size_override("font_size", 46)
	big_l.add_theme_color_override("font_color", Color(1, 0.85, 0.2))
	big_l.add_theme_color_override("font_outline_color", INK)
	big_l.add_theme_constant_override("outline_size", 10)
	big_l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	big_l.grow_horizontal = Control.GROW_DIRECTION_BOTH
	big_l.visible = false
	root.add_child(big_l)
	# 오른쪽: 작은 지도, 결과 카드
	minimap = MiniMap.new()
	minimap.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	minimap.offset_left = -194
	minimap.offset_right = -24
	minimap.offset_top = 20
	minimap.offset_bottom = 190
	minimap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	minimap.clip_contents = true
	root.add_child(minimap)
	# 뒷거울 (위 가운데)
	var mf := PanelContainer.new()
	mf.add_theme_stylebox_override("panel", _box(Color(0.08, 0.08, 0.08, 0.95), 4))
	mf.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	mf.offset_left = -232
	mf.offset_right = 232
	mf.offset_top = 14
	mf.offset_bottom = 14 + 128
	mf.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(mf)
	mirror = TextureRect.new()
	mirror.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	mirror.stretch_mode = TextureRect.STRETCH_SCALE
	mirror.flip_h = true
	mirror.custom_minimum_size = Vector2(448, 112)
	mirror.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mf.add_child(mirror)
	results = VBoxContainer.new()
	results.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	results.offset_left = -384
	results.offset_right = -24
	results.offset_top = 206
	results.offset_bottom = 760
	results.add_theme_constant_override("separation", 8)
	results.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(results)
	_build_panel()

func _theme() -> Theme:
	var t := Theme.new()
	t.default_font = Kit.font()
	t.default_font_size = 16
	t.set_color("font_color", "Label", INK)
	t.set_color("font_color", "Button", INK)
	t.set_color("font_hover_color", "Button", INK)
	t.set_color("font_pressed_color", "Button", PAPER)
	t.set_color("font_hover_pressed_color", "Button", PAPER)
	t.set_color("font_focus_color", "Button", INK)
	t.set_color("font_color", "CheckButton", INK)
	t.set_color("font_hover_color", "CheckButton", INK)
	t.set_color("font_pressed_color", "CheckButton", INK)
	t.set_color("font_hover_pressed_color", "CheckButton", INK)
	t.set_color("font_focus_color", "CheckButton", INK)
	var nb := _box(Color(0, 0, 0, 0), 10)
	nb.border_color = INK
	nb.set_border_width_all(2)
	var hb := nb.duplicate() as StyleBoxFlat
	hb.bg_color = Color(0.88, 0.87, 0.84)
	var pb := _box(BLUE, 10)
	pb.border_color = BLUE
	pb.set_border_width_all(2)
	for st in ["normal", "focus"]:
		t.set_stylebox(st, "Button", nb)
	t.set_stylebox("hover", "Button", hb)
	t.set_stylebox("pressed", "Button", pb)
	t.set_stylebox("hover_pressed", "Button", pb)
	var empty := StyleBoxEmpty.new()
	for st in ["normal", "hover", "pressed", "hover_pressed", "focus"]:
		t.set_stylebox(st, "CheckButton", empty)
	return t

func _box(c: Color, pad: float) -> StyleBoxFlat:
	var b := StyleBoxFlat.new()
	b.bg_color = c
	b.content_margin_left = pad + 4
	b.content_margin_right = pad + 4
	b.content_margin_top = pad
	b.content_margin_bottom = pad
	return b

func _lab(parent: Control, txt: String, size: int, col: Color) -> Label:
	var l := Label.new()
	l.text = txt
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	parent.add_child(l)
	return l

func _fire(name: String, a = null, b = null) -> void:
	if cb.has(name):
		if b != null:
			cb[name].call(a, b)
		elif a != null:
			cb[name].call(a)
		else:
			cb[name].call()

func _build_panel() -> void:
	panel = CenterContainer.new()
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var dim := ColorRect.new()
	dim.color = Color(0.949, 0.945, 0.925, 0.55)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(dim)
	panel.set_meta("dim", dim)
	root.add_child(panel)
	var pc := PanelContainer.new()
	pc.add_theme_stylebox_override("panel", _box(Color(0.949, 0.945, 0.925, 0.98), 22))
	panel.add_child(pc)
	var outer := VBoxContainer.new()
	outer.add_theme_constant_override("separation", 10)
	pc.add_child(outer)
	var sc := ScrollContainer.new()
	sc.custom_minimum_size = Vector2(860, 590)
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	outer.add_child(sc)
	var v := VBoxContainer.new()
	v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	v.add_theme_constant_override("separation", 7)
	sc.add_child(v)
	_lab(v, "날씨와 상황", 34, INK)
	var sub := _lab(v, "도로에 나가기 전에 비, 눈, 밤길과 당황하기 쉬운 일을 연습해요. 켜 둔 상황은 달리다 보면 알맞은 때 저절로 일어나고, 숫자 키로 바로 일으킬 수도 있어요.", 15, MUTED)
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sub.custom_minimum_size.x = 820
	# 날씨
	_lab(v, "날씨", 20, INK)
	var wr := HBoxContainer.new()
	wr.add_theme_constant_override("separation", 8)
	v.add_child(wr)
	var grp := ButtonGroup.new()
	for k in ["clear", "rain", "snow"]:
		var b := Button.new()
		b.text = {"clear": "맑음", "rain": "비", "snow": "눈"}[k]
		b.toggle_mode = true
		b.button_group = grp
		b.custom_minimum_size = Vector2(84, 40)
		b.button_pressed = k == "clear"
		b.toggled.connect(_on_weather_btn.bind(k))
		wr.add_child(b)
		wbtn[k] = b
	fog_c = _check(wr, "안개")
	fog_c.toggled.connect(func(on: bool) -> void: _fire("fog", on))
	night_c = _check(wr, "밤")
	night_c.toggled.connect(func(on: bool) -> void: _fire("night", on))
	var wtip := _lab(v, "비: 길이 미끄럽고(마찰 70%) 웅덩이에 바퀴가 빠지면 핸들이 끌려요.  눈: 마찰 35%, 브레이크가 길어져요.  밤: 전조등(F)을 켜세요.", 13, MUTED)
	wtip.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	wtip.custom_minimum_size.x = 820
	# 상황
	_lab(v, "상황", 20, INK)
	var gr := GridContainer.new()
	gr.columns = 3
	gr.add_theme_constant_override("h_separation", 14)
	gr.add_theme_constant_override("v_separation", 2)
	v.add_child(gr)
	var i := 1
	for e: Dictionary in Events.LIST:
		var c := _check(gr, e.name)
		c.custom_minimum_size.x = 190
		var id: String = e.id
		c.toggled.connect(func(on: bool) -> void: _fire("sit", id, on))
		checks[id] = c
		var d := _lab(gr, e.desc, 14, MUTED)
		d.custom_minimum_size.x = 520
		d.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var b := Button.new()
		b.text = "%d 지금" % i if id != "work" and id != "ice" else "%d 켜고 끄기" % i
		b.custom_minimum_size = Vector2(96, 30)
		b.add_theme_font_size_override("font_size", 13)
		var bs := _box(Color(0, 0, 0, 0), 3)
		bs.border_color = INK
		bs.set_border_width_all(1)
		b.add_theme_stylebox_override("normal", bs)
		var bh := bs.duplicate() as StyleBoxFlat
		bh.bg_color = Color(0.88, 0.87, 0.84)
		b.add_theme_stylebox_override("hover", bh)
		b.add_theme_stylebox_override("pressed", bh)
		b.pressed.connect(func() -> void: _fire("trigger", id))
		gr.add_child(b)
		i += 1
	# 조작 (아래에 늘 보임)
	outer.add_child(HSeparator.new())
	simple_c = _check(outer, "간단 조작 (WASD, 기어 없음)")
	simple_c.toggled.connect(func(on: bool) -> void: _fire("simple", on))
	keys_l = _lab(outer, "", 14, MUTED)
	keys_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	keys_l.custom_minimum_size.x = 820
	var go := Button.new()
	go.text = "운전하기  (Tab으로 이 판을 열고 닫아요)"
	go.custom_minimum_size = Vector2(0, 48)
	go.add_theme_stylebox_override("normal", _box(BLUE, 10))
	go.add_theme_stylebox_override("hover", _box(BLUE.lightened(0.1), 10))
	go.add_theme_color_override("font_color", PAPER)
	go.add_theme_color_override("font_hover_color", PAPER)
	go.pressed.connect(func() -> void: _fire("close"))
	outer.add_child(go)

func _on_weather_btn(on: bool, k: String) -> void:
	if on:
		_fire("weather", k)

func _free_later(n) -> void:
	if is_instance_valid(n):
		n.queue_free()

func _check(parent: Control, txt: String) -> CheckButton:
	var c := CheckButton.new()
	c.text = txt
	c.add_theme_font_size_override("font_size", 16)
	c.focus_mode = Control.FOCUS_NONE
	parent.add_child(c)
	return c

func show_panel(on: bool) -> void:
	panel.visible = on
	(panel.get_meta("dim") as Control).visible = on

func set_check(id: String, on: bool) -> void:
	if checks.has(id):
		checks[id].set_pressed_no_signal(on)

func set_simple(on: bool) -> void:
	simple_c.set_pressed_no_signal(on)
	keys_l.text = ("W 앞으로   S 브레이크 (멈춘 뒤 다시 누르면 뒤로)   A D 핸들   Q E 방향지시등   H 비상등   F 전조등   C 시점   방향키도 돼요" if on
		else "↑ 가속   ↓ 브레이크   ← → 핸들   P R N D 기어   Q E 방향지시등   H 비상등   Space 주차 브레이크   F 전조등   C 시점")

func set_weather_ui(kind: String, fog: bool, night: bool) -> void:
	wbtn[kind].set_pressed_no_signal(true)
	fog_c.set_pressed_no_signal(fog)
	night_c.set_pressed_no_signal(night)

func toast(txt: String, kind := "info") -> void:
	log.append({"toast": txt, "kind": kind})
	var pc := PanelContainer.new()
	var col := DARK if kind == "info" else Color(0.72, 0.2, 0.16, 0.95) if kind == "warn" else Color(0.95, 0.6, 0.1, 0.95)
	pc.add_theme_stylebox_override("panel", _box(col, 9))
	pc.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var l := _lab(pc, txt, 22 if kind == "honk" else 16, PAPER)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toasts.add_child(pc)
	toasts.move_child(pc, 0)
	while toasts.get_child_count() > 4:
		var last := toasts.get_child(toasts.get_child_count() - 1)
		toasts.remove_child(last)
		last.queue_free()
	get_tree().create_timer(3.2).timeout.connect(_free_later.bind(pc))

func add_result(title: String, lines: Array, good: bool) -> void:
	log.append({"result": title, "lines": lines, "good": good})
	var pc := PanelContainer.new()
	var st := _box(Color(0.949, 0.945, 0.925, 0.96), 12)
	st.border_color = BLUE if good else RED
	st.border_width_left = 6
	pc.add_theme_stylebox_override("panel", st)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 2)
	pc.add_child(v)
	var h := _lab(v, ("%s  잘했어요" if good else "%s  다시 연습해요") % title, 17, BLUE if good else RED)
	h.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	for s: String in lines:
		var l := _lab(v, s, 14, INK)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	results.add_child(pc)
	results.move_child(pc, 0)
	while results.get_child_count() > 3:
		var last := results.get_child(results.get_child_count() - 1)
		results.remove_child(last)
		last.queue_free()
	get_tree().create_timer(16.0).timeout.connect(_free_later.bind(pc))

func flash(txt: String, secs := 1.6) -> void:
	big_l.text = txt
	big_l.visible = true
	get_tree().create_timer(secs).timeout.connect(func() -> void: big_l.visible = false)

func update(s: Dictionary) -> void:
	top_l.text = "운전 연습   %s   상황 %d개 켬   Tab 설정" % [s.weather, s.n_on]
	spd_l.text = str(int(round(s.kmh)))
	if s.simple:
		gear_l.text = "[color=#f2f1ec][bgcolor=#2b44a6] 후진 [/bgcolor][/color]" if s.gear == "R" else ""
	else:
		var t := ""
		for g in ["P", "R", "N", "D"]:
			t += ("[bgcolor=#2b44a6][color=#ffffff] %s [/color][/bgcolor]" if g == s.gear else "[color=#6d6c67] %s [/color]") % g
		gear_l.text = t
	var dim := Color(0.35, 0.35, 0.33)
	sig_l.add_theme_color_override("font_color", Color(0.95, 0.7, 0.1) if s.blink and (s.sig == 1 or s.hazard) else dim)
	sig_r.add_theme_color_override("font_color", Color(0.95, 0.7, 0.1) if s.blink and (s.sig == 2 or s.hazard) else dim)
	ic.hz.add_theme_color_override("font_color", Color(1.0, 0.42, 0.37) if s.hazard else dim)
	ic.lt.add_theme_color_override("font_color", Color(0.44, 0.86, 0.55) if s.lights > 0 else dim)
	ic.lt.text = "상향등" if s.lights == 2 else "전조등"
	ic.slip.add_theme_color_override("font_color", Color(1.0, 0.7, 0.2) if s.slip and s.blink else dim)
	ffb_bar.v = s.ffb
	ffb_bar.queue_redraw()
	minimap.me = Vector3(s.x, s.z, s.yaw)
	minimap.cars = s.cars
	minimap.marks = s.marks
	minimap.queue_redraw()
