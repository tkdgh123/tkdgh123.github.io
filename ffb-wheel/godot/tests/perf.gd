# 초당 화면 수: 날씨마다 4초 기다렸다가 4초 평균, 두 바퀴 (두 번째가 셰이더를 다 만든 뒤)
extends SceneTree
var main
var bot_ref: Bot
func _initialize() -> void:
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()
func avg(secs: float) -> float:
	var n := 0
	var t0 := Time.get_ticks_usec()
	while Time.get_ticks_usec() - t0 < secs * 1e6:
		await process_frame
		n += 1
	return n / ((Time.get_ticks_usec() - t0) / 1e6)
func _go() -> void:
	await process_frame
	bot_ref = Bot.new(main, 0.8, 4)
	main.set_paused(false)
	main.bot = bot_ref.drive
	var mirror_on: bool = not OS.get_cmdline_user_args().has("nomirror")
	main.hud.mirror.get_parent().visible = mirror_on
	main.frame_slow = -999.0 # 저절로 해상도 낮추기 끔 (재기만)
	for rep in [0, 1]:
		for w in [["clear", false, false], ["rain", false, false], ["snow", false, false], ["clear", true, false], ["clear", false, true], ["rain", false, true]]:
			main.set_weather(w[0], w[1], w[2])
			await avg(3.0)
			var f: float = await avg(4.0)
			print("rep %d %s fog=%s night=%s mirror=%s fps %.1f scale %.2f" % [rep, w[0], w[1], w[2], mirror_on, f, root.scaling_3d_scale])
	quit()
