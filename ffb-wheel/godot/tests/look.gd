# 지금 모습 찍기: 3인칭, 운전석, 위에서 몇 곳 (out=폴더)
extends SceneTree

var main
var out := ""

func _initialize() -> void:
	for a: String in OS.get_cmdline_user_args():
		if a.begins_with("out="):
			out = a.substr(4)
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()

func wait(secs: float) -> void:
	await create_timer(secs).timeout

func shot(name: String) -> void:
	await process_frame
	await process_frame
	root.get_texture().get_image().save_png(out + "/" + name + ".png")
	print("shot ", name, " fps ", Engine.get_frames_per_second())

func road(a: String, b: String) -> Dictionary:
	for r: Dictionary in main.city.roads:
		if r.a == a and r.b == b:
			return r
	return {}

func place(seg: Dictionary, s: float) -> void:
	var p: Dictionary = main.city.pos_at(seg, s)
	var c: Car = main.car
	c.x = p.x - sin(p.yaw) * 1.35
	c.z = p.z - cos(p.yaw) * 1.35
	c.yaw = p.yaw
	c.th = p.yaw
	c.v = 0.0
	main.first = true

func _go() -> void:
	await process_frame
	main.set_paused(false)
	main.bot = func(_dt: float) -> Dictionary: return {"steer": 0.0, "thr": 0.0, "brk": 1.0}
	var spots := [["Nw", "Ja", 1, 1, 30.0], ["Ja", "C", 1, 0, 60.0], ["Jd", "X", 1, 0, 20.0], ["Ns", "Kc", 1, 0, 40.0]]
	var i := 0
	for sp in spots:
		place(main.city.lane(road(sp[0], sp[1]), sp[2], sp[3]), sp[4])
		for v in [0, 1]:
			main.view = v
			main.first = true
			await wait(1.2)
			await shot("%d_v%d" % [i, v])
		i += 1
	main.view = 2
	await wait(1.0)
	await shot("top")
	quit()
