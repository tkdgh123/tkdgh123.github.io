# 작은 확인: 20분 쉼 알림, 앞차 거리(초), 날씨 감속, 연습 기록 요약
extends SceneTree
var main
var bot_ref: Bot
func _initialize() -> void:
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()
func road(a: String, b: String) -> Dictionary:
	for r: Dictionary in main.city.roads:
		if r.a == a and r.b == b:
			return r
	return {}
func _go() -> void:
	await process_frame
	bot_ref = Bot.new(main, 0.8, 3)
	main.bot = bot_ref.drive
	main.set_paused(false)
	# 1) 쉼 알림
	main.drive_t = 1199.0
	for i in 240:
		main.sim_step(1.0 / 120.0)
	print("쉼 알림: ", main.hud.log.filter(func(e): return e.has("toast")).map(func(e): return e.toast))
	# 2) 앞차 거리: 큰길 바깥 차로, 18m 앞 차
	var seg: Dictionary = main.city.lane(road("Nw", "Ja"), 1, 1)
	var p: Dictionary = main.city.pos_at(seg, 8.0)
	var c: Car = main.car
	c.x = p.x - sin(p.yaw) * 1.35
	c.z = p.z - cos(p.yaw) * 1.35
	c.yaw = p.yaw
	c.th = p.yaw
	c.v = 8.0
	bot_ref.seg = {}
	var lead: Dictionary = main.city.spawn_ai(Color.WHITE, seg, 30.0, 8.0)
	print("앞차 놓임: ", not lead.is_empty())
	var gaps := []
	for i in 360:
		main.sim_step(1.0 / 120.0)
		if i % 60 == 0:
			gaps.append(snappedf(main.gap_s, 0.1))
	print("앞차 거리(초): ", gaps, " 필요 ", main.gap_need)
	# 겹치게 놓으면 안 놓임
	print("같은 자리에 또 놓기: ", main.city.spawn_ai(Color.WHITE, seg, 30.0 + 8.0 * 0.5 + 1.0, 8.0).is_empty())
	# 3) 날씨 감속
	for w in [["clear", false], ["rain", false], ["snow", false], ["clear", true]]:
		main.set_weather(w[0], w[1], false)
		main.sim_step(1.0 / 120.0)
		for i in 12:
			main.sim_step(1.0 / 120.0)
		print("날씨 %s 안개 %s → 제한 %.0f (%s)" % [w[0], w[1], main.eff_lim, main.weather.factor_text()])
	# 4) 기록 요약
	for r in [["child", "warn", 1.8, false], ["child", "ok", 1.6, true], ["child", "bad", 2.2, false], ["child", "ok", 1.1, true], ["child", "ok", 0.9, true], ["jay", "ok", 1.0, true], ["amb", "ok", 2.0, null]]:
		main.add_record(r[0], r[1], r[2], r[3])
	print(main.record_summary())
	print("기록 파일 저장 안 함(시험): ", not main.save_ok)
	quit()
