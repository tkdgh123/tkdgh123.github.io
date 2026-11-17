# 새 화면 확인: 날씨 제한 속도 표지, 앞차 거리, 단서 사진이 든 결과 카드, 설정판의 반응 여유와 연습 기록
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
	print("shot ", name)

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

func _go() -> void:
	await process_frame
	bot_ref = Bot.new(main, 0.8, 4)
	main.set_paused(false)
	main.bot = bot_ref.drive
	# 비 오는 큰길, 앞차를 따라감
	main.set_weather("rain", false, false)
	main.weather.wet = 1.0
	var seg: Dictionary = main.city.lane(road("Nw", "Ja"), 1, 1)
	place(seg, 6.0)
	main.city.spawn_ai(Color("#6c7a99"), seg, 20.0, 6.0)
	bot_ref.speed_k = 1.0
	await wait(4.0)
	await shot("20_rain_limit_gap")
	# 아이: 미리 줄이지 않는 운전자 → 결과 카드에 단서 사진
	main.set_weather("clear", false, false)
	main.weather.wet = 0.0
	place(main.city.lane(road("Ka", "Ja"), 1, 0), 20.0)
	await wait(2.0)
	print("child ", main.events.trigger("child", true))
	for i in 150:
		await wait(0.1)
		if not main.events.act.has("child"):
			break
	await wait(0.5)
	await shot("21_child_card")
	# 설정판: 기록 몇 개 넣고
	for r in [["child", "warn", 1.8, false], ["child", "ok", 1.2, true], ["jay", "ok", 1.0, true], ["child", "bad", 2.0, false], ["child", "ok", 1.1, true], ["brake", "ok", 0.9, null]]:
		main.add_record(r[0], r[1], r[2], r[3])
	main.set_paused(true)
	await wait(0.6)
	await shot("22_panel_record")
	quit()
