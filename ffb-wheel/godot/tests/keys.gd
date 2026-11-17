# 실제 키 입력 흉내: Tab으로 판 닫기 → W로 출발 → S로 멈춤 → 다시 S로 후진 → W로 앞 → 1 키로 상황 → Tab으로 판 열기
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
	print("%s: paused=%s v=%.1fkm/h gear=%s sig=%d lights=%d panel=%s" % [tag, main.paused, c.v * 3.6, c.gear, c.sig, c.lights, main.hud.panel.visible])
func _initialize() -> void:
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()
func _go() -> void:
	await create_timer(0.5).timeout
	await st("start")
	await tap(KEY_TAB)
	await st("tab")
	await hold(KEY_W, 2.0)
	await st("W 2s")
	await hold(KEY_S, 2.5)
	await st("S held")
	await tap(KEY_S)
	await hold(KEY_S, 1.5)
	await st("S again 1.5s")
	await hold(KEY_W, 1.5)
	await st("W 1.5s")
	await tap(KEY_Q)
	await tap(KEY_F)
	await tap(KEY_F)
	await st("Q, F, F")
	await tap(KEY_C)
	print("view ", main.view)
	await tap(KEY_1)
	print("toasts ", main.hud.log)
	await tap(KEY_TAB)
	await st("tab again")
	quit()
