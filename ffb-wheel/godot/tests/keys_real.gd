# 실제 조작(기어 있음): ↓ 밟고 P → 기어감 확인 → D, ↑ → Space 주차 브레이크
extends SceneTree
var main
func key(code: Key, down: bool) -> void:
	var e := InputEventKey.new()
	e.physical_keycode = code
	e.keycode = code
	e.pressed = down
	Input.parse_input_event(e)
func tap(code: Key) -> void:
	key(code, true)
	await process_frame
	await process_frame
	key(code, false)
	await process_frame
func hold(code: Key, secs: float) -> void:
	key(code, true)
	await create_timer(secs).timeout
	key(code, false)
	await process_frame
func st(tag: String) -> void:
	var c: Car = main.car
	print("%s: v=%.1fkm/h gear=%s pb=%s auto=%s" % [tag, c.v * 3.6, c.gear, c.pb, c.auto])
func _initialize() -> void:
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()
func _go() -> void:
	await create_timer(0.5).timeout
	main.set_simple(false)
	await tap(KEY_TAB)
	await st("실제 조작 시작")
	await tap(KEY_P)
	await st("브레이크 없이 P")
	key(KEY_DOWN, true)
	await create_timer(0.4).timeout
	await tap(KEY_P)
	key(KEY_DOWN, false)
	await st("브레이크 밟고 P")
	await tap(KEY_SPACE)
	await st("주차 브레이크")
	key(KEY_DOWN, true)
	await create_timer(0.4).timeout
	await tap(KEY_D)
	key(KEY_DOWN, false)
	await tap(KEY_SPACE)
	await create_timer(3.0).timeout
	await st("D, 주차 브레이크 풂, 3초 (기어감)")
	await hold(KEY_UP, 2.0)
	await st("↑ 2초")
	await tap(KEY_R)
	await st("달리는 중 R (안 바뀌어야)")
	quit()
