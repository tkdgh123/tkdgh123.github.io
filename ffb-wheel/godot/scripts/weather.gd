# 날씨: 맑음 / 비 / 눈, 그리고 안개, 밤 (따로 켜고 끔).
# 하늘, 해, 안개, 비와 눈 입자, 길 젖음과 눈 덮임, 가로등, 그리고 노면 마찰(grip)과 다른 차 속도까지 한 곳에서 정함
class_name Weather
extends Node3D

var kind := "clear"    # clear | rain | snow
var fog := false
var night := false
var city: City
var env: Environment
var sun: DirectionalLight3D
var sky_mat: ProceduralSkyMaterial
var rain: GPUParticles3D
var snowp: GPUParticles3D
var pool := []         # 가로등 불빛: 가까운 가로등으로 옮겨 다님
var pool_t := 0.0
var wet := 0.0         # 지금 젖은 정도 (천천히 바뀜)
var snow := 0.0

func setup(c: City) -> void:
	city = c
	env = Environment.new()
	env.background_mode = Environment.BG_SKY
	sky_mat = ProceduralSkyMaterial.new()
	var sky := Sky.new()
	sky.sky_material = sky_mat
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env.fog_enabled = true
	env.fog_mode = Environment.FOG_MODE_EXPONENTIAL
	env.fog_sky_affect = 0.35
	env.glow_enabled = true
	env.glow_intensity = 0.6
	env.glow_hdr_threshold = 1.2
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	sun = DirectionalLight3D.new()
	sun.rotation = Vector3(deg_to_rad(-48), deg_to_rad(-35), 0)
	sun.shadow_enabled = true
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
	sun.directional_shadow_max_distance = 55.0
	add_child(sun)
	rain = _particles(7000, 1.1, Vector3(32, 1, 32), 17.0, 21.0, Vector3(0, -9.8, 0), Vector2(0.022, 0.75), Color(0.78, 0.82, 0.9, 0.32), true)
	snowp = _particles(4500, 7.0, Vector3(36, 2, 36), 0.8, 1.6, Vector3(0, -0.35, 0), Vector2(0.075, 0.075), Color(1, 1, 1, 0.92), false)
	for i in 7:
		var o := OmniLight3D.new()
		o.light_color = Color(1.0, 0.82, 0.55)
		o.light_energy = 9.0
		o.omni_range = 21.0
		o.omni_attenuation = 0.6
		o.visible = false
		if OS.has_feature("web"):
			var q := Kit.glow_quad(Vector2(15, 15), Color(1.0, 0.8, 0.5, 0.55))
			q.position.y = -6.57
			o.add_child(q)
		add_child(o)
		pool.append(o)
	apply()

func _particles(n: int, life: float, ext: Vector3, v0: float, v1: float, grav: Vector3, size: Vector2, col: Color, streak: bool) -> GPUParticles3D:
	var p := GPUParticles3D.new()
	p.amount = n
	p.lifetime = life
	p.preprocess = life
	p.local_coords = false
	p.visibility_aabb = AABB(Vector3(-50, -40, -50), Vector3(100, 60, 100))
	var pm := ParticleProcessMaterial.new()
	pm.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	pm.emission_box_extents = ext
	pm.direction = Vector3(0.05, -1, 0)
	pm.spread = 3.0 if streak else 25.0
	pm.initial_velocity_min = v0
	pm.initial_velocity_max = v1
	pm.gravity = grav
	if not streak:
		pm.turbulence_enabled = true
		pm.turbulence_noise_strength = 1.2
		pm.turbulence_noise_scale = 4.0
		pm.turbulence_influence_min = 0.05
		pm.turbulence_influence_max = 0.15
	p.process_material = pm
	var q := QuadMesh.new()
	q.size = size
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.albedo_color = col
	m.billboard_mode = BaseMaterial3D.BILLBOARD_FIXED_Y if streak else BaseMaterial3D.BILLBOARD_ENABLED
	m.billboard_keep_scale = true
	q.material = m
	p.draw_pass_1 = q
	p.emitting = false
	p.visible = false
	add_child(p)
	return p

# 악천후 감속 (도로교통법 시행규칙 제19조 제2항): 비에 젖은 길 20% 감속, 가시거리 100m 이내(안개), 얼어붙은 길, 눈 20mm 이상 50% 감속.
# 이 도시의 눈은 길이 하얗게 덮인 정도라 50%로 봄
func speed_factor() -> float:
	var k := 1.0
	if kind == "rain":
		k = 0.8
	if kind == "snow" or fog:
		k = 0.5
	return k

func factor_text() -> String:
	if fog:
		return "안개 -50%"
	return {"rain": "비 -20%", "snow": "눈 -50%"}.get(kind, "")

# 노면 마찰: 마른 길 1, 젖은 길 0.7, 눈길 0.35
func grip() -> float:
	return 0.35 if kind == "snow" else 0.7 if kind == "rain" else 1.0

func label() -> String:
	var parts := []
	parts.append({"clear": "맑음", "rain": "비", "snow": "눈"}[kind])
	if fog:
		parts.append("안개")
	if night:
		parts.append("밤")
	return ", ".join(parts)

func apply() -> void:
	# 하늘색, 해, 안개 짙기
	var top := Color(0.55, 0.68, 0.86)
	var hor := Color(0.9, 0.89, 0.86)
	var sun_e := 1.7
	var amb := 0.55
	var dens := 0.0022
	var fog_col := Color(0.92, 0.91, 0.88)
	if kind == "rain":
		top = Color(0.42, 0.45, 0.5)
		hor = Color(0.62, 0.64, 0.66)
		sun_e = 0.3
		amb = 0.75
		dens = 0.011
		fog_col = Color(0.6, 0.62, 0.65)
	elif kind == "snow":
		top = Color(0.7, 0.73, 0.78)
		hor = Color(0.86, 0.87, 0.9)
		sun_e = 0.45
		amb = 0.95
		dens = 0.014
		fog_col = Color(0.86, 0.87, 0.9)
	if fog: # 가까이는 보이고 60m쯤에서 거의 안 보이게 (거리 안개)
		fog_col = fog_col.lerp(Color(0.8, 0.81, 0.82), 0.6)
		sun_e *= 0.5
	if night:
		top = Color(0.012, 0.02, 0.045)
		hor = Color(0.05, 0.06, 0.09) if not fog else Color(0.09, 0.09, 0.1)
		sun_e = 0.06
		amb = 0.12
		fog_col = Color(0.05, 0.055, 0.07) if not fog else Color(0.16, 0.16, 0.17)
	sky_mat.sky_top_color = top
	sky_mat.sky_horizon_color = hor
	sky_mat.ground_horizon_color = hor
	sky_mat.ground_bottom_color = hor.darkened(0.3)
	sky_mat.sun_angle_max = 30.0 if kind == "clear" and not night else 1.0
	sun.light_energy = sun_e
	sun.light_color = Color(0.7, 0.78, 1.0) if night else Color(1.0, 0.97, 0.92)
	sun.shadow_enabled = sun_e > 0.4
	env.ambient_light_energy = amb
	env.fog_mode = Environment.FOG_MODE_DEPTH if fog else Environment.FOG_MODE_EXPONENTIAL
	env.fog_depth_begin = 9.0
	env.fog_depth_end = 70.0
	env.fog_depth_curve = 0.8
	env.fog_density = 1.0 if fog else dens
	env.fog_light_color = fog_col
	env.fog_light_energy = 1.0
	rain.emitting = kind == "rain"
	rain.visible = kind == "rain"
	snowp.emitting = kind == "snow"
	snowp.visible = kind == "snow"
	city.night = night
	city.puddle_node.visible = kind == "rain"
	city.bld_mat.set_shader_parameter("night", 1.0 if night else 0.0)
	for m: ShaderMaterial in city.sign_mats:
		m.set_shader_parameter("night", 1.0 if night else 0.0)
	city.lamp_head_mat.emission_enabled = night
	city.lamp_head_mat.emission = Color(1.0, 0.86, 0.6)
	city.lamp_head_mat.emission_energy_multiplier = 3.0
	for o: OmniLight3D in pool:
		o.visible = night
	# 다른 차: 젖은 길, 눈길, 안개에선 천천히, 일찍 서기
	city.speed_k = (0.65 if kind == "snow" else 0.9 if kind == "rain" else 1.0) * (0.8 if fog else 1.0)
	city.decel_max = 3.0 if kind == "snow" else 6.0 if kind == "rain" else 7.0

func tick(dt: float, at: Vector3, fwd: Vector3) -> void:
	# 젖음, 눈 쌓임은 몇 초에 걸쳐 바뀜
	wet = move_toward(wet, 1.0 if kind == "rain" else 0.0, dt * 0.25)
	snow = move_toward(snow, 1.0 if kind == "snow" else 0.0, dt * 0.2)
	city.ground_mat.set_shader_parameter("wet", wet)
	city.ground_mat.set_shader_parameter("snow", snow)
	city.bld_mat.set_shader_parameter("snow", snow)
	city.leaf_mat.set_shader_parameter("snow", snow)
	var ahead := at + Vector3(fwd.x, 0, fwd.z).normalized() * 12.0
	rain.global_position = ahead + Vector3(0, 13, 0)
	snowp.global_position = ahead + Vector3(0, 11, 0)
	if night:
		pool_t -= dt
		if pool_t <= 0:
			pool_t = 0.35
			var near := []
			for L: Dictionary in city.lamps:
				if L.get("dead", false):
					continue
				var d: float = Vector2(L.x - ahead.x, L.z - ahead.z).length_squared()
				if d < 90 * 90:
					near.append([d, L])
			near.sort_custom(func(a, b): return a[0] < b[0])
			for i in pool.size():
				var o: OmniLight3D = pool[i]
				if i < near.size():
					var L: Dictionary = near[i][1]
					o.visible = true
					o.position = Vector3(L.x + cos(L.yaw) * 1.2, 6.6, L.z - sin(L.yaw) * 1.2)
				else:
					o.visible = false
