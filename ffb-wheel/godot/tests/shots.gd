# 화면 확인: 숨은 데스크톱에서 창을 띄워 날씨, 시점, 상황마다 찍고 초당 화면 수를 잼
# python tools 없이: hidden_run.py 600 log.txt godot --audio-driver Dummy --path . --windowed --resolution 1600x900 -s res://tests/shots.gd -- mute out=폴더
extends SceneTree

var main
var out := ""
var bot_ref: Bot

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
	bot_ref.seg = {}

func weather(kind: String, fog: bool, night: bool) -> void:
	main.set_weather(kind, fog, night)
	main.weather.wet = 1.0 if kind == "rain" else 0.0
	main.weather.snow = 1.0 if kind == "snow" else 0.0

func _go() -> void:
	await process_frame
	bot_ref = Bot.new(main, 0.8, 4)
	await wait(1.0)
	await shot("01_panel")
	main.set_paused(false)
	main.bot = bot_ref.drive
	place(main.city.lane(road("Nw", "Ja"), 1, 1), 10.0)
	for w in [["clear", false, false], ["rain", false, false], ["snow", false, false], ["clear", true, false], ["clear", false, true], ["rain", false, true]]:
		weather(w[0], w[1], w[2])
		await wait(2.5)
		var fps := []
		for i in 4:
			await wait(0.5)
			fps.append(Engine.get_frames_per_second())
		await shot("02_%s%s%s" % [w[0], "_fog" if w[1] else "", "_night" if w[2] else ""])
		print("  fps ", fps)
	# 운전석 시점 (비 오는 밤), 위에서
	main.view = 1
	await wait(1.5)
	await shot("03_cockpit_rain_night")
	weather("clear", false, false)
	main.view = 2
	await wait(1.0)
	await shot("04_top")
	main.view = 0
	# 아이가 뛰어듦 (이면도로)
	place(main.city.lane(road("Ka", "Ja"), 1, 0), 20.0)
	await wait(2.0)
	var ok: bool = main.events.trigger("child", true)
	print("child started ", ok)
	for i in 40:
		await wait(0.1)
		if main.events.act.has("child") and main.events.act.child.state != "hide":
			break
	await wait(0.35)
	await shot("05_child")
	await wait(4.0)
	await shot("05b_child_result")
	# 구급차
	place(main.city.lane(road("Ns", "Kc"), 1, 0), 40.0)
	await wait(1.0)
	print("amb started ", main.events.trigger("amb", true))
	await wait(3.0)
	main.view = 0
	await shot("06_amb")
	await wait(6.0)
	await shot("06b_amb_pass")
	# 공사 구간
	main.events.set_on("work", true)
	place(main.city.lane(road("Ja", "C"), 1, 1), 2.0)
	main.bot = func(_dt: float) -> Dictionary: return {"steer": 0.0, "thr": 0.0, "brk": 0.0}
	await wait(1.5)
	await shot("07_work")
	main.events.set_on("work", false)
	# 눈 + 빙판
	weather("snow", false, false)
	main.events.set_on("ice", true)
	place(main.city.lane(road("Ka", "Nw"), 1, 0), 75.0)
	await wait(1.5)
	await shot("08_snow_ice")
	# 밤 눈부심: 맞은편 차가 상향등
	weather("clear", false, true)
	place(main.city.lane(road("C", "Jc"), 1, 1), 10.0)
	var opp: Dictionary = main.city.spawn_ai(Color.WHITE, main.city.lane(road("C", "Jc"), -1, 0), 40.0, 0.0)
	opp.high = true
	opp.force = 99.0
	await wait(1.5)
	await shot("09_glare")
	main.set_paused(true)
	await wait(0.5)
	await shot("10_panel_night")
	quit()
