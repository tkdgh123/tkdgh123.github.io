// 앞유리 안쪽: 빗방울(뒤 풍경을 굴절시켜 보여 줌), 눈송이, 와이퍼가 닦은 자리, 깨진 금
// UV: u 0(왼쪽 A 기둥) ~ 1(오른쪽), v 0(아래) ~ 1(위). 와이퍼 두 개가 아래에서 위로 부채꼴로 닦음
shader_type spatial;
render_mode unshaded, cull_disabled, blend_mix, depth_draw_never, shadows_disabled;
uniform sampler2D screen : hint_screen_texture, filter_linear;
uniform float rain = 0.0;
uniform float snow = 0.0;
uniform float ph = 0.0;          // 와이퍼 위상 (0 = 쉬는 자리)
uniform float off_t = 99.0;      // 와이퍼를 멈춘 뒤 지난 초
uniform float period = 1.4;
uniform float fill = 2.2;        // 닦은 자리에 다시 다 맺히는 데 걸리는 초
uniform float crack = 0.0;
uniform vec2 crack_uv = vec2(0.5);
uniform vec2 size = vec2(1.62, 0.98);
uniform vec2 piv0 = vec2(0.22, 0.0);
uniform vec2 piv1 = vec2(0.56, 0.0);
uniform float arm0 = 0.62;
uniform float arm1 = 0.56;
uniform float sweep = 1.65;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float since_wipe(vec2 uv, vec2 piv, float arm) {
	vec2 d = (uv - piv) * size;
	float r = length(d);
	if (r > arm) return 999.0;
	float a = atan(d.y, d.x);
	if (a < 0.0 || a > sweep) return 999.0;
	float p1 = acos(clamp(1.0 - 2.0 * a / sweep, -1.0, 1.0)); // 위로 가며 지나는 위상
	float p2 = TAU - p1;                                        // 내려오며 지나는 위상
	float s = min(mod(ph - p1, TAU), mod(ph - p2, TAU)) / TAU * period;
	return s + off_t;
}
void fragment() {
	vec2 uv = UV;
	float since = min(since_wipe(uv, piv0, arm0), since_wipe(uv, piv1, arm1));
	vec2 grid = vec2(46.0, 28.0);
	vec2 cell = floor(uv * grid);
	vec2 f = fract(uv * grid);
	vec3 col = vec3(0.0);
	float a = 0.0;
	for (int k = 0; k < 2; k++) {
		vec2 cc = cell + vec2(float(k) * 0.5);
		float h1 = hash(cc + float(k) * 17.0);
		float h2 = hash(cc + 4.1 + float(k));
		float h3 = hash(cc + 8.7 + float(k));
		vec2 c = vec2(0.2 + 0.6 * h2, 0.2 + 0.6 * h3);
		float rad = 0.12 + 0.28 * h1;
		float appear = h1 * fill;
		float on = step(appear, since);
		vec2 d = (fract(uv * grid + vec2(float(k) * 0.5)) - c) * vec2(1.0, grid.x / grid.y * size.y / size.x);
		float r = length(d);
		float drop = smoothstep(rad, rad * 0.75, r) * on;
		if (rain > 0.0 && drop > 0.0) {
			vec2 off = -d * 0.06; // 물방울 렌즈: 뒤 풍경이 뒤집혀 보임
			vec3 bg = textureLod(screen, SCREEN_UV + off, 0.0).rgb;
			float rim = smoothstep(rad * 0.55, rad, r);
			vec3 dc = mix(bg * 1.15, bg * 0.45, rim);
			dc += vec3(0.25) * smoothstep(0.35, 0.0, length(d + vec2(rad * 0.3, -rad * 0.3)) / rad);
			col = mix(col, dc, drop);
			a = max(a, drop * rain);
		}
		if (snow > 0.0) {
			float flake = smoothstep(rad * 0.8, rad * 0.2, r) * step(appear * 1.6, since);
			col = mix(col, vec3(0.95), flake);
			a = max(a, flake * snow * 0.9);
		}
	}
	// 깨진 금: 부딪힌 점에서 뻗는 금 + 둥근 금
	if (crack > 0.0) {
		vec2 d = (uv - crack_uv) * size;
		float r = length(d);
		float ang = atan(d.y, d.x);
		float rays = 0.0;
		for (int i = 0; i < 14; i++) {
			float ra = float(i) / 14.0 * TAU + hash(vec2(float(i), 1.0)) * 0.4;
			float da = abs(mod(ang - ra + PI, TAU) - PI) * r;
			rays = max(rays, smoothstep(0.004, 0.0, da) * step(r, crack * (0.35 + 0.4 * hash(vec2(float(i), 3.0)))));
		}
		float rings = 0.0;
		for (int j = 1; j < 5; j++) {
			float rr = float(j) * 0.045 * crack;
			rings = max(rings, smoothstep(0.003, 0.0, abs(r - rr - 0.01 * sin(ang * 7.0 + float(j)))));
		}
		float hub = smoothstep(0.03 * crack, 0.0, r);
		float cr = max(max(rays, rings), hub);
		col = mix(col, vec3(0.92, 0.95, 1.0), cr);
		a = max(a, cr * 0.85);
	}
	ALBEDO = col;
	ALPHA = a;
}
