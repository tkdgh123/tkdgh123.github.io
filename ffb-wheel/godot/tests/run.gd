# 시험: godot --headless --path . -s res://tests/run.gd -- mute case=all
# 봇이 달리면서 상황을 일으키고, 결과 카드(잘했어요/다시 연습해요)와 부딪힘을 모아 출력
extends SceneTree

var main
var args := {}
var bot_ref: Bot

func _initialize() -> void:
	for a: String in OS.get_cmdline_user_args():
		var kv := a.split("=")
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_run.call_deferred()

func sim(secs: float) -> void:
	for i in int(secs * 120):
		main.sim_step(1.0 / 120.0)
		if i % 240 == 0:
			await process_frame

func fresh(seed: int, react: float, kind := "clear", fog := false, night := false) -> Bot:
	main.city.rng.seed = seed
	var b := Bot.new(main, react, seed)
	bot_ref = b # Callable은 RefCounted를 붙잡지 않음
	main.bot = b.drive
	main.recover() # 앞 시험에서 부딪혀 벽에 붙어 있으면 봇은 후진을 못 하니 길 위에서 새로 시작
	main.set_weather(kind, fog, night)
	for id in main.events.on:
		main.events.set_on(id, false)
	main.events.gap_t = 999.0
	main.hud.log.clear()
	main.hits.clear()
	return b

func place(seg: Dictionary, s: float) -> void: # 운전자 차를 차로 위에 놓음
	var p: Dictionary = main.city.pos_at(seg, s)
	var c: Car = main.car
	c.x = p.x - sin(p.yaw) * 1.35
	c.z = p.z - cos(p.yaw) * 1.35
	c.yaw = p.yaw
	c.th = p.yaw
	c.v = 0.0
	c.gear = "D"

func road(a: String, b: String) -> Dictionary:
	for r: Dictionary in main.city.roads:
		if r.a == a and r.b == b:
			return r
	return {}

func results() -> Array:
	var out := []
	for e: Dictionary in main.hud.log:
		if e.has("result"):
			out.append("%s %s: %s" % [{"ok": "O", "warn": "△", "bad": "X"}.get(e.get("level", ""), "?"), e.result, " / ".join(e.lines)])
	return out

func crashes() -> int:
	var n := 0
	for e: Dictionary in main.hud.log:
		if e.has("toast") and (e.toast.contains("부딪혔어요") and not e.toast.contains("뒤차")):
			n += 1
	return n

# 상황 하나: 알맞은 곳에서 일으키고 끝날 때까지
func situation(id: String, seed: int, react: float, kind := "clear", setup := Callable()) -> Dictionary:
	var b := fresh(seed, react, kind)
	if setup.is_valid():
		setup.call(b)
	var started := false
	var tries := 0
	var still := 0
	while not started and tries < 90:
		await sim(1.0)
		tries += 1
		started = main.events.trigger(id, false)
		still = still + 1 if absf(main.car.v) < 0.5 else 0
		if still > 12: # 봇은 장애물을 비켜 가지 못하니 오래 서 있으면 다른 차로로 옮김
			var lanes: Array = main.city.all_lanes
			var ln: Dictionary = lanes[(seed * 7 + tries) % lanes.size()]
			place(ln, minf(15.0, ln.L * 0.3))
			b.seg = {}
			still = 0
		if args.has("dbg") and tries % 10 == 1:
			var q = main.city.road_at(main.car.x, main.car.z)
			print("  try %d v %.1f x %.0f z %.0f 길 %s inp %s act %s paused %s" % [tries, main.car.v * 3.6, main.car.x, main.car.z, q.r.type if q else "-", main.inp, main.events.act.keys(), main.paused])
	var t0: float = main.sim_t
	if started:
		var guard := 0
		while main.events.act.has(id) and guard < 90:
			await sim(1.0)
			guard += 1
		await sim(2.0)
	return {"id": id, "seed": seed, "react": react, "kind": kind, "started": started, "after": snappedf(t0, 0.1), "res": results(), "hits": main.hits.duplicate()}

func _run() -> void:
	await process_frame
	var case: String = args.get("case", "all")
	var t_start := Time.get_ticks_msec()
	if case in ["all", "drive"]:
		for kind in ["clear", "rain", "snow"]:
			fresh(3, 0.8, kind)
			var c: Car = main.car
			var dist := 0.0
			var px := c.x
			var pz := c.z
			for i in 90:
				await sim(1.0)
				dist += Vector2(c.x - px, c.z - pz).length()
				px = c.x
				pz = c.z
			var moving := 0
			for a: Dictionary in main.city.ai:
				if a.v > 0.5:
					moving += 1
			print("DRIVE %s: 90초 %.0fm, 부딪힘 %d, 다른 차 움직임 %d/%d, 결과 %s" % [kind, dist, crashes(), moving, main.city.ai.size(), results()])
			print("  hits ", main.hits)
	if case in ["all", "sit"]:
		for id in ["child", "jay", "brake", "cut"]:
			for seed in [11, 12, 13]:
				var r: Dictionary = await situation(id, seed, 0.7)
				print("SIT good-react ", r)
			var r2: Dictionary = await situation(id, 21, 3.0)
			print("SIT slow-react ", r2)
		# 눈길에서 아이: 멀리서 일어나니 반응만 빠르면 멈춤
		var r3: Dictionary = await situation("child", 31, 0.7, "snow")
		print("SIT snow child ", r3)
	if case in ["all", "antic"]:
		# 미리 보는 운전자와 아닌 운전자: 같은 상황(아이, 무단횡단)을 여러 번
		for an in [true, false]:
			for id in ["child", "jay"]:
				for seed in [41, 42, 43, 44]:
					var setup := func(b: Bot) -> void: b.antic = an
					var r: Dictionary = await situation(id, seed, 0.8, "clear", setup)
					print("ANTIC %s %s seed %d → %s hits %s" % ["미리봄" if an else "그냥", id, seed, r.res, r.hits])
	if case in ["all", "rules"]:
		for kind in ["rain", "snow"]:
			fresh(6, 0.8, kind)
			main.sess = {"over": 0, "follow": 0.0, "short": 0.0}
			await sim(60.0)
			print("RULES %s: 제한 %.0f, 과속 알림 %d, 따라간 %.0f초 중 가까움 %.0f초, 알림 %s" % [kind, main.eff_lim, main.sess.over, main.sess.follow, main.sess.short, main.hud.log.filter(func(e): return e.has("toast")).map(func(e): return e.toast).slice(0, 3)])
		print("SUMMARY
", main.record_summary())
	if case in ["all", "amb"]:
		var main_r := road("Ja", "C")
		var ring_r := road("Ns", "Kc")
		for spec in [[main_r, 1, true], [main_r, 0, true], [main_r, 0, false], [ring_r, 0, true], [ring_r, 0, false]]:
			var setup := func(b: Bot) -> void:
				place(main.city.lane(spec[0], 1, spec[1]), 30.0)
				b.yield_amb = spec[2]
				b.seg = {}
			var r: Dictionary = await situation("amb", 5, 0.8, "clear", setup)
			print("AMB road %s lane %d yield %s → %s" % [spec[0].type, spec[1], spec[2], r])
	if case in ["all", "static"]:
		# 공사 구간: 바깥 차로에서 다가감
		var b := fresh(7, 0.8)
		main.events.set_on("work", true)
		place(main.city.lane(road("Nw", "Ja"), 1, 1), 60.0)
		b.seg = {}
		await sim(40.0)
		print("WORK → ", results(), " hits ", main.hits)
		main.events.set_on("work", false)
		# 빙판: 눈 오는 날 순환로 굽은 곳 앞에서
		for kind in ["clear", "snow"]:
			b = fresh(8, 0.8, kind)
			main.events.set_on("ice", true)
			var rr := road("Ka", "Nw")
			place(main.city.lane(rr, 1, 0), 30.0)
			b.seg = {}
			b.speed_k = 1.0
			await sim(30.0)
			print("ICE %s → %s crash %d" % [kind, results(), crashes()])
			main.events.set_on("ice", false)
		# 뒤차 경적: 큰길을 시속 10km 안팎으로 기어가면 뒤에 다른 차가 붙음
		b = fresh(9, 0.8)
		main.events.set_on("honk", true)
		var rd := road("Nw", "Ja")
		place(main.city.lane(rd, 1, 1), 16.0)
		b.seg = {}
		b.speed_k = 0.22
		main.city.spawn_ai(Color.WHITE, main.city.lane(rd, 1, 1), 1.0, 8.0)
		await sim(30.0)
		print("HONK → ", results(), " toasts ", main.hud.log.filter(func(e): return e.has("toast")).map(func(e): return e.toast))
	print("TIME %.1fs" % ((Time.get_ticks_msec() - t_start) / 1000.0))
	quit()
