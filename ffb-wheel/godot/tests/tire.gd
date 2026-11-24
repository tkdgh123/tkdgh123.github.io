# 타이어 물리 확인 (화면 없이): godot --headless --path . -s res://tests/tire.gd
# 출발 가속, 제동 거리(마른 길, 비, 눈, 빙판), 정지 유지, 최소 회전 반경, 커브 옆 쏠림, 미끄러운 길에서 앞 밀림, 후진
extends SceneTree

func run(c: Car, inp: Dictionary, secs: float, stop := Callable()) -> float:
	var t := 0.0
	while t < secs:
		c.step(inp, 1.0 / 120.0)
		t += 1.0 / 120.0
		if is_nan(c.vx) or is_nan(c.yaw_rate):
			print("  NaN!")
			return t
		if stop.is_valid() and stop.call(c):
			break
	return t

func newcar(auto := true, grip := 1.0) -> Car:
	var c := Car.new()
	c.auto = auto
	c.gear = "D"
	c.pb = false
	c.grip = grip
	return c

func _initialize() -> void:
	var c := newcar()
	var t := run(c, {"steer": 0.0, "thr": 1.0, "brk": 0.0}, 20.0, func(k): return k.v * 3.6 >= 50.0)
	print("간단 조작 0→50km/h %.1f초 (예전 4초), 헛돎 최대 확인 kappa %.2f" % [t, c.kappa_f])
	var c2 := newcar(false)
	t = run(c2, {"steer": 0.0, "thr": 1.0, "brk": 0.0}, 20.0, func(k): return k.v * 3.6 >= 50.0)
	print("실제 조작 0→50km/h %.1f초 (예전 6.4초)" % t)
	for g in [[1.0, "마른 길"], [0.7, "비"], [0.35, "눈"], [0.15, "빙판"]]:
		var b := newcar(true, g[0])
		b.v = 50.0 / 3.6
		var z0 := b.z
		var tt := run(b, {"steer": 0.0, "thr": 0.0, "brk": 1.0}, 30.0, func(k): return absf(k.v) < 0.05)
		print("%s 시속 50km 제동 %.1fm, %.1f초 (마찰만으로 계산 %.1fm)" % [g[1], b.z - z0, tt, pow(50 / 3.6, 2) / (2 * 9.8 * 0.92 * g[0])])
	var h := newcar(false)
	h.gear = "D"
	run(h, {"steer": 0.0, "thr": 0.0, "brk": 0.6}, 2.0)
	print("실제 조작 브레이크 밟고 정지 유지: 속도 %.3f" % h.v)
	var cr := newcar(false)
	var xs := []
	var zs := []
	run(cr, {"steer": 1.0, "thr": 0.0, "brk": 0.0}, 25.0, func(k):
		var f: Dictionary = k.at(Car.WB, -Car.TR / 2 - 0.1)
		xs.append(f.x)
		zs.append(f.z)
		return false)
	print("천천히(기어감) 핸들 끝까지: 속도 %.1f, 바깥 앞바퀴 반경 %.1fm (아반떼 약 5.3m)" % [cr.v, (xs.max() - xs.min() + zs.max() - zs.min()) / 4])
	for sp in [30.0, 50.0]:
		for st in [0.05, 0.1, 0.3]:
			var k := newcar(true)
			k.v = sp / 3.6
			run(k, {"steer": st, "thr": 0.35, "brk": 0.0}, 3.0)
			var lat := absf(k.v * k.yaw_rate) / 9.8
			print("시속 %d→%.0f 핸들 %.2f: 옆 쏠림 %.2fG, 앞 슬립각 %.1f도, 뒤 %.1f도, 미끄럼각 %.1f도, 앞 밀림 %.2f, 핸들 힘 %.2f" % [sp, k.v * 3.6, st, lat, rad_to_deg(k.alpha_f), rad_to_deg(k.alpha_r), rad_to_deg(k.slip), k.understeer, k.ffb])
	var ice := newcar(true, 0.15)
	ice.v = 40.0 / 3.6
	run(ice, {"steer": 0.3, "thr": 0.0, "brk": 0.0}, 2.0)
	print("빙판 시속 40 핸들 0.3: 옆 쏠림 %.2fG, 앞 밀림 %.2f, 핸들 힘 %.2f (가벼워짐)" % [absf(ice.v * ice.yaw_rate) / 9.8, ice.understeer, ice.ffb])
	var sn := newcar(true, 0.35)
	sn.v = 50.0 / 3.6
	run(sn, {"steer": 0.25, "thr": 0.0, "brk": 1.0}, 1.5)
	print("눈길 시속 50 브레이크+핸들: 미끄럼각 %.1f도, 뒤 돎 %.2f, ABS %s" % [rad_to_deg(sn.slip), sn.oversteer, sn.abs_on])
	var ws := newcar(false, 0.35)
	run(ws, {"steer": 0.0, "thr": 1.0, "brk": 0.0}, 0.5)
	print("눈길 출발 끝까지 밟기: 앞바퀴 슬립률 %.2f 헛돎 %s" % [ws.kappa_f, ws.wheelspin])
	var rv := newcar(true)
	rv.gear = "R"
	var z0 := rv.z
	run(rv, {"steer": 0.0, "thr": 1.0, "brk": 0.0}, 3.0)
	print("후진 3초: %.1fm (뒤로 -), 속도 %.1fkm/h" % [rv.z - z0, rv.v * 3.6])
	quit()
