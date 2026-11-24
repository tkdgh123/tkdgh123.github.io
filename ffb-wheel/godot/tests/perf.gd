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
	var quick := OS.get_cmdline_user_args().has("quick")
	var args := OS.get_cmdline_user_args()
	if args.has("nowalk"):
		for w: Dictionary in main.city.walkers:
			(w.m as Node).queue_free()
		main.city.walkers.clear()
	if args.has("noai"):
		for c: Dictionary in main.city.ai.duplicate():
			main.city.remove_ai(c)
	if args.has("nohud"):
		main.hud.visible = false
		main.hud.process_mode = Node.PROCESS_MODE_DISABLED
	for a: String in OS.get_cmdline_user_args():
		if a.begins_with("view="):
			main.view = int(a.substr(5))
	for rep in ([1] if quick else [0, 1]):
		for w in ([["clear", false, false], ["rain", false, false], ["clear", false, true]] if quick else [["clear", false, false], ["rain", false, false], ["snow", false, false], ["clear", true, false], ["clear", false, true], ["rain", false, true]]):
			main.set_weather(w[0], w[1], w[2])
			await avg(3.0)
			var f: float = await avg(4.0)
			print("rep %d %s fog=%s night=%s mirror=%s fps %.1f scale %.2f | process %.1fms physics %.1fms draw %d prims %dk objs %d" % [rep, w[0], w[1], w[2], mirror_on, f, root.scaling_3d_scale,
				Performance.get_monitor(Performance.TIME_PROCESS) * 1000, Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000,
				Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME), Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME) / 1000, Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME)])
	quit()
