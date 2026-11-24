# 실감 확인: 지도마다 3인칭, 운전석, 고개 돌림, 비(와이퍼), 밤, 그리고 가로등, 차, 사람, 건물과 부딪히는 장면을 찍고 숫자를 남김
# hidden_run.py 600 log.txt godot --audio-driver Dummy --path . --windowed --resolution 1600x900 -s res://tests/real.gd -- mute out=폴더 map=gangnam|ssu
extends SceneTree

var main
var out := ""
var drive := {"steer": 0.0, "thr": 0.0, "brk": 1.0}

func _initialize() -> void:
	for a: String in OS.get_cmdline_user_args():
		if a.begins_with("out="):
			out = a.substr(4)
	main = load("res://main.tscn").instantiate()
	root.add_child(main)
	_go.call_deferred()

func wait(secs: float) -> void:
	await create_timer(secs, true, false, true).timeout

func shot(name: String) -> void:
	await process_frame
	await process_frame
	root.get_texture().get_image().save_png(out + "/" + main.city.theme + "_" + name + ".png")
	print("shot ", name, " fps ", Engine.get_frames_per_second(), " v ", snappedf(main.car.v * 3.6, 0.1), " dmg ", main.crash.dmg)

func road(a: String, b: String) -> Dictionary:
	for r: Dictionary in main.city.roads:
		if r.a == a and r.b == b:
			return r
	return {}

func place_at(x: float, z: float, yaw: float, v := 0.0) -> void:
	var c: Car = main.car
	c.x = x
	c.z = z
	c.yaw = yaw
	c.v = v
	main.first = true

func place(seg: Dictionary, s: float, v := 0.0) -> void:
	var p: Dictionary = main.city.pos_at(seg, s)
	place_at(p.x - sin(p.yaw) * 1.35, p.z - cos(p.yaw) * 1.35, p.yaw, v)

func _go() -> void:
	await process_frame
	main.set_paused(false)
	main.bot = func(_dt: float) -> Dictionary: return drive
	var C: Dictionary = main.city.nodes["C"]
	var west: Dictionary = C.arms["W"]
	var into: Dictionary = main.city.lane(west, 1, 1)
	# 1. 큰길 3인칭, 운전석
	place(into, into.L - 60.0)
	for v in [0, 1]:
		main.view = v
		await wait(1.5)
		await shot("a_view%d" % v)
	# 2. 운전석에서 고개 왼쪽, 오른쪽 (사각지대 보기)
	main.cockpit.look = Vector2(1.5, 0.0)
	main.cockpit.look_idle = -99.0
	await wait(0.5)
	await shot("b_look_left")
	main.cockpit.look = Vector2(-1.3, -0.1)
	await wait(0.5)
	await shot("b_look_right")
	main.cockpit.look = Vector2.ZERO
	main.cockpit.look_idle = 0.0
	# 의자 높이 가장 낮게, 가장 높게
	main.cockpit.seat = {"h": -0.07, "f": 0.0, "r": 0.0}
	main.cockpit.seat_cur = main.cockpit.seat.duplicate()
	await wait(0.4)
	await shot("c_seat_low")
	main.cockpit.seat = {"h": 0.09, "f": 0.1, "r": 0.0}
	main.cockpit.seat_cur = main.cockpit.seat.duplicate()
	await wait(0.4)
	await shot("c_seat_high")
	main.cockpit.seat = {"h": 0.0, "f": 0.0, "r": 0.0}
	main.cockpit.seat_cur = main.cockpit.seat.duplicate()
	# 3. 비 (와이퍼), 비 오는 밤
	main.set_weather("rain", false, false)
	main.weather.wet = 1.0
	await wait(3.0)
	await shot("d_rain_cockpit")
	await wait(0.45)
	await shot("d_rain_cockpit2")
	main.set_weather("rain", false, true)
	main.view = 0
	await wait(1.5)
	await shot("d_rain_night")
	main.set_weather("clear", false, true)
	await wait(1.5)
	await shot("d_night")
	main.set_weather("clear", false, false)
	main.weather.wet = 0.0
	# 4. 가로등에 시속 45km로
	var lamp: Dictionary = {}
	for L: Dictionary in main.city.lamps:
		var q = main.city.road_at(L.x, L.z)
		if q != null and q.r.type == "main" and Vector2(L.x, L.z).length() > 60:
			lamp = L
			break
	var yaw0: float = lamp.yaw
	var fx := sin(yaw0)
	var fz := cos(yaw0)
	var lx := cos(yaw0)
	var lz := -sin(yaw0)
	# 가로등 18m 뒤, 왼쪽으로 3m(차로 위)에서 가로등을 향해
	var sx: float = lamp.x - fx * 18.0 + lx * 3.0
	var sz: float = lamp.z - fz * 18.0 + lz * 3.0
	place_at(sx, sz, atan2(lamp.x - sx, lamp.z - sz) - 0.0, 45.0 / 3.6)
	main.car.x -= sin(main.car.yaw) * 1.6
	main.car.z -= cos(main.car.yaw) * 1.6
	drive = {"steer": 0.0, "thr": 0.4, "brk": 0.0}
	main.view = 0
	await wait(0.25)
	for i in 30:
		await wait(0.05)
		if main.crash.falls.size() > 0 or main.crash.dmg.length() > 0.01:
			break
	drive = {"steer": 0.0, "thr": 0.0, "brk": 1.0}
	await wait(0.12)
	await shot("e_lamp_hit")
	await wait(1.4)
	await shot("e_lamp_after")
	print("hits ", main.hits)
	main.recover()
	# 5. 서 있는 차 뒤를 시속 40km로 (운전석에서)
	var lane2: Dictionary = main.city.lane(C.arms["E"], 1, 0)
	if lane2.r.a != "C":
		lane2 = main.city.lane(C.arms["E"], -1, 0)
	var other: Dictionary = main.city.spawn_ai(Color("#d9d6cc"), lane2, 70.0, 0.0, "car", "suv")
	other.force = 999.0
	place(lane2, 35.0, 40.0 / 3.6)
	drive = {"steer": 0.0, "thr": 0.3, "brk": 0.0}
	main.view = 1
	for i in 80:
		await wait(0.05)
		if other.has("wreck"):
			break
	drive = {"steer": 0.0, "thr": 0.0, "brk": 1.0}
	await wait(0.15)
	await shot("f_car_hit_cockpit")
	main.view = 0
	await wait(1.2)
	await shot("f_car_after")
	print("wreck ", other.has("wreck"), " other v ", other.get("wreck", {}))
	main.recover()
	main.cockpit.crack_at(Vector2.ZERO, 0.0)
	# 6. 사람 (보도 걷는 사람 하나를 차로 위에 세움)
	var w: Dictionary = main.city.walkers[0]
	var lane3: Dictionary = main.city.lane(w.r, 1, 0)
	w.sd = 1
	w.o = lane3.r.T.lw * 0.5
	w.sp = 0.0
	w.s = lane3.base + 60.0 if true else 0.0
	w.dir = 1.0
	place(lane3, 30.0, 35.0 / 3.6)
	drive = {"steer": 0.0, "thr": 0.25, "brk": 0.0}
	main.view = 0
	for i in 80:
		await wait(0.05)
		if (w.m as Node3D).has_meta("down"):
			break
	await wait(0.25)
	await shot("g_person_hit")
	for k in 6:
		print("  사람 위치 ", (w.m as Node3D).position.snappedf(0.1), " 회전 ", (w.m as Node3D).rotation.snappedf(0.1), " 차 ", Vector2(main.car.x, main.car.z).snappedf(0.1))
		if k == 1:
			drive = {"steer": 0.0, "thr": 0.0, "brk": 1.0}
		await wait(0.3)
	main.cam.global_position = (w.m as Node3D).position + Vector3(4, 3, -6)
	main.set_process(false)
	main.cam.look_at((w.m as Node3D).position)
	await wait(0.2)
	await shot("g_person_lying")
	main.set_process(true)
	drive = {"steer": 0.0, "thr": 0.0, "brk": 1.0}
	await wait(2.0)
	await shot("g_person_after")
	main.recover()
	# 7. 건물 정면으로 시속 50km (운전석: 금, 에어백)
	var bld: Dictionary = {}
	for b: Dictionary in main.city.dress.blds:
		if b.road != null and absf(b.yaw - round(b.yaw / (PI / 2)) * PI / 2) < 0.01:
			bld = b
			break
	var n := Vector3(cos(bld.yaw), 0, -sin(bld.yaw)) * float(bld.sd)
	var face: Vector3 = Vector3(bld.x, 0, bld.z) + n * (bld.sx / 2)
	var st: Vector3 = face + n * 22.0
	place_at(st.x, st.z, atan2(-n.x, -n.z), 50.0 / 3.6)
	drive = {"steer": 0.0, "thr": 0.5, "brk": 0.0}
	main.view = 1
	for i in 60:
		await wait(0.03)
		if main.crash.dmg.x > 0.2:
			break
	drive = {"steer": 0.0, "thr": 0.0, "brk": 1.0}
	await wait(0.1)
	await shot("h_wall_cockpit")
	await wait(1.0)
	await shot("h_wall_cockpit2")
	main.view = 0
	await wait(0.6)
	await shot("h_wall_out")
	print("hits ", main.hits)
	# 8. 위에서 내려다보기
	main.recover()
	main.view = 0
	place(into, into.L - 20.0)
	drive = {"steer": 0.0, "thr": 0.0, "brk": 1.0}
	await wait(1.0)
	main.cam.global_position = Vector3(-120, 160, 160)
	main.set_process(false)
	main.cam.look_at(Vector3(0, 0, 0))
	await wait(0.6)
	await shot("i_air")
	main.set_process(true)
	quit()
