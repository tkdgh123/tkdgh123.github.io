# 오래 돌리기: 봇이 달리는 동안 날씨, 상황, 조작 방식을 무작위로 바꾸며 이상한 점을 모음
# godot --headless --path . -s res://tests/soak.gd -- mute seed=1 mins=10
extends SceneTree

var main
var bot_ref: Bot
var rng := RandomNumberGenerator.new()
var problems := []

func _initialize() -> void:
	var args := {}
	for a: String in OS.get_cmdline_user_args():
		var kv := a.split("=")
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	rng.seed = int(args.get("seed", "1"))
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred(float(args.get("mins", "10")))

func note(s: String) -> void:
	if problems.size() < 60:
		problems.append("%.0fs %s" % [main.sim_t, s])

func _go(mins: float) -> void:
	await process_frame
	bot_ref = Bot.new(main, 0.6 + rng.randf() * 0.6, rng.randi())
	main.bot = bot_ref.drive
	main.set_paused(false)
	for id in main.events.on:
		main.events.set_on(id, true)
	var n0: int = Performance.get_monitor(Performance.OBJECT_NODE_COUNT)
	var ai0: int = main.city.ai.size()
	var box0: int = main.city.boxes.size()
	var still := 0.0
	var px: float = main.car.x
	var pz: float = main.car.z
	var act_age := {}
	var total := int(mins * 60)
	var dist := 0.0
	for sec in total:
		# 1초 시뮬레이션
		for i in 120:
			main.sim_step(1.0 / 120.0)
		await process_frame
		main._process(1.0 / 60.0)
		var c: Car = main.car
		if is_nan(c.x) or is_nan(c.z) or is_nan(c.v) or is_nan(c.yaw) or is_nan(c.ffb):
			note("NaN 차 상태")
			break
		var d := Vector2(c.x - px, c.z - pz).length()
		dist += d
		still = still + 1.0 if d < 0.2 else 0.0
		px = c.x
		pz = c.z
		if still == 90.0:
			note("90초 넘게 그 자리 (x %.0f z %.0f, 길 %s)" % [c.x, c.z, "있음" if main.city.road_at(c.x, c.z) != null else "없음"])
			_dump()
		if absf(c.x) > 420 or absf(c.z) > 420:
			note("지도 밖으로 나감")
		for id in main.events.act: # 같은 상황(상태 묶음)이 100초 넘게 이어지는지 (끝나고 바로 새로 시작한 건 따로)
			var stt: Dictionary = main.events.act[id]
			if not act_age.has(id) or not is_same(act_age[id][0], stt):
				act_age[id] = [stt, 0]
			act_age[id][1] += 1
			if act_age[id][1] == 100:
				note("상황 %s 이 100초 넘게 안 끝남" % id)
		for id in act_age.keys():
			if not main.events.act.has(id):
				act_age.erase(id)
		for a: Dictionary in main.city.ai:
			if is_nan(a.x) or is_nan(a.v):
				note("다른 차 NaN")
		# 20초마다 무작위로 바꿈
		if sec % 20 == 10:
			match rng.randi() % 6:
				0:
					main.set_weather(["clear", "rain", "snow"][rng.randi() % 3], rng.randf() < 0.3, rng.randf() < 0.4)
				1:
					main.events.trigger(Events.LIST[rng.randi() % 5].id, true)
				2:
					main.set_simple(not main.simple)
					if not main.simple:
						c.gear = "D"
						c.pb = false
				3:
					var id: String = ["work", "ice", "honk"][rng.randi() % 3]
					main.events.set_on(id, not main.events.on[id])
				4:
					main.view = rng.randi() % 3
				5:
					main.set_paused(true)
					await process_frame
					main.set_paused(false)
	var n1: int = Performance.get_monitor(Performance.OBJECT_NODE_COUNT)
	var res := {}
	for e: Dictionary in main.hud.log:
		if e.has("result"):
			var k: String = e.result + (" O" if e.good else " X")
			res[k] = res.get(k, 0) + 1
	print("SOAK seed %d: %.0f분 %.0fm, 다른 차 %d→%d, 부딪히는 물체 %d→%d, 노드 %d→%d, 부딪힘 %d" % [rng.seed, mins, dist, ai0, main.city.ai.size(), box0, main.city.boxes.size(), n0, n1, main.hits.size()])
	print("  결과 ", res)
	print("  문제 ", problems)
	quit()

func _dump() -> void: # 멈춘 까닭 찾기: 봇이 보는 것, 가까운 다른 차
	var c: Car = main.car
	var b := bot_ref
	print("DUMP 봇 seg con=%s s=%.1f L=%.1f path=%d hist0=%s inp=%s gear=%s auto=%s pb=%s" % [b.seg.get("con", "?"), b.s, b.seg.get("L", 0.0), b.path.size(), b.hist[0] if not b.hist.is_empty() else "-", main.inp, c.gear, c.auto, c.pb])
	if not b.seg.get("con", true):
		var n: Dictionary = main.city.nodes[b.seg.to]
		print("  교차로 %s 신호 %s (갈래 %s)" % [n.id, main.city.light(n, b.seg.arm, main.sim_t), b.seg.arm])
	for a: Dictionary in main.city.ai:
		if Vector2(a.x - c.x, a.z - c.z).length() < 45:
			print("  차 %s x%.0f z%.0f v%.1f con=%s s=%.1f/%.1f stuck=%.1f force=%.1f yield=%s lc=%s" % [a.kind, a.x, a.z, a.v, a.seg.con, a.s, a.seg.L, a.stuck, a.force, a.yield, a.lc != null])
	for p: Dictionary in main.city.peds:
		if p.walking and Vector2(p.x - c.x, p.z - c.z).length() < 30:
			print("  사람 x%.0f z%.0f" % [p.x, p.z])
	print("  상황 ", main.events.act.keys(), " extra ", main.city.extra_obs)
