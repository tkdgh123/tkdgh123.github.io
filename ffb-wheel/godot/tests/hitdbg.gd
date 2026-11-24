# 봇이 사람을 치기 직전 3초: 속도, 입력, 봇이 본 앞 거리, 차로에서 벗어난 정도 (godot --headless --path . -s res://tests/hitdbg.gd -- mute)
extends SceneTree

var main
var b: Bot

func _initialize() -> void:
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()

func _go() -> void:
	await process_frame
	main.city.rng.seed = 3
	b = Bot.new(main, 0.8, 3)
	main.bot = b.drive
	if OS.get_cmdline_user_args().has("rain"):
		main.set_weather("rain", false, false)
	var buf := []
	for i in 90 * 120:
		main.sim_step(1.0 / 120.0)
		if i % 6 == 0:
			var c: Car = main.car
			var q = main.city.road_at(c.x, c.z)
			var near := ""
			for p: Dictionary in main.city.peds:
				if p.walking and Vector2(p.x - c.x, p.z - c.z).length() < 15:
					var rel: Vector2 = main.events._rel(p.x, p.z)
					near += "[앞 %.1f 옆 %.1f] " % [rel.x, rel.y]
			var bg = main.city._gap({"x": c.x, "z": c.z, "kind": "car"}, b.path, null, false, 0.0) if not b.path.is_empty() else -1.0
			buf.append("gap %.1f %.1f초 v %.1f thr %.2f brk %.2f steer %.2f yaw %.2f r %.2f slip %.1f° off %.1f 사람 %s" % [bg, main.sim_t, c.v * 3.6, main.inp.thr, main.inp.brk, main.inp.steer, c.yaw, c.yaw_rate, rad_to_deg(c.slip), q.off if q else 0.0, near])
			if buf.size() > 30:
				buf.pop_front()
		if not main.hits.is_empty():
			for l in buf:
				print(l)
			print(main.hits)
			break
		if i % 240 == 0:
			await process_frame
	quit()
