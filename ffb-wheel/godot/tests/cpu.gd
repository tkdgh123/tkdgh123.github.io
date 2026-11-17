extends SceneTree
func _initialize() -> void:
	var main = load("res://main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	var b := Bot.new(main, 0.8, 4)
	main.bot = b.drive
	for i in 600:
		main.sim_step(1.0 / 120.0)
	var t0 := Time.get_ticks_usec()
	for i in 1200:
		main.sim_step(1.0 / 120.0)
	var t1 := Time.get_ticks_usec()
	var tick := 0
	for i in 600:
		var a := Time.get_ticks_usec()
		main.city.tick(1.0 / 60.0, main.sim_t, main.car)
		tick += Time.get_ticks_usec() - a
	var t2 := Time.get_ticks_usec()
	for i in 120:
		main._process(1.0 / 60.0)
	var t3 := Time.get_ticks_usec()
	print("sim_step %.3f ms (x120/s = %.1f ms/s), city.tick %.3f ms per 60Hz call, _process %.3f ms" % [(t1 - t0) / 1200.0 / 1000.0, (t1 - t0) / 10.0 / 1000.0, tick / 600.0 / 1000.0, (t3 - t2) / 120.0 / 1000.0])
	quit()
