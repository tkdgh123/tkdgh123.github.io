# 어디서 시간이 드는지: 부분마다 100번씩 불러 평균 (화면 없이: godot --headless --path . -s res://tests/prof.gd -- mute map=gangnam)
extends SceneTree

var main

func _initialize() -> void:
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()

func t(name: String, f: Callable, n := 100) -> void:
	var t0 := Time.get_ticks_usec()
	for i in n:
		f.call()
	print("%-16s %.3f ms" % [name, (Time.get_ticks_usec() - t0) / 1000.0 / n])

func _go() -> void:
	await process_frame
	var bot := Bot.new(main, 0.8, 4)
	main.set_paused(false)
	main.bot = bot.drive
	await create_timer(3.0).timeout
	var c: City = main.city
	var dt := 1.0 / 120.0
	t("car.step", func(): main.car.step(main.inp, dt))
	t("crash.collide", func(): main.crash.collide(dt))
	t("city._tick_ai", func(): c._tick_ai(1.0 / 60.0, main.sim_t, main.car))
	t("city._tick_walkers", func(): c._tick_walkers(1.0 / 60.0, main.car))
	t("city._tick_peds", func(): c._tick_peds(1.0 / 60.0, main.sim_t, main.car))
	t("events.update", func(): main.events.update(dt, main.sim_t))
	t("main._rules", func(): main._rules(dt))
	t("main._skid", func(): main._skid(dt))
	t("main.sim_step", func(): main.sim_step(dt))
	t("crash.tick", func(): main.crash.tick(1.0 / 60.0, 1.0 / 60.0))
	t("cockpit.tick", func(): main.cockpit.tick(1.0 / 60.0, 1))
	t("weather.tick", func(): main.weather.tick(1.0 / 60.0, main.car_g.global_position, Vector3(0, 0, 1)))
	var gap_paths := []
	for a: Dictionary in c.ai:
		gap_paths.append([a, [[a.seg, a.s]] + ([[a.con, 0.0], [a.con.next, 0.0]] if a.con != null and not a.seg.con else [])])
	t("_gap x22", func():
		for g in gap_paths:
			c._gap(g[0], g[1], main.car, false, 0.0))
	t("lamps x22", func():
		for a: Dictionary in c.ai:
			(a.mesh.get_meta("tail") as MeshInstance3D).material_override = Kit.TAIL_OFF
			(a.mesh.get_meta("head") as MeshInstance3D).material_override = Kit.HEAD_OFF)
	t("pos x22", func():
		for a: Dictionary in c.ai:
			var p := c.pos_at(a.seg, a.s, a.pi)
			a.mesh.position = Vector3(p.x, 0, p.z))
	t("main._process", func(): main._process(1.0 / 60.0))
	print("boxes ", c.boxes.size(), " walkers ", c.walkers.size(), " ai ", c.ai.size(), " lamps ", c.lamps.size(), " near ", c.boxes_near(main.car.x, main.car.z).size())
	quit()
