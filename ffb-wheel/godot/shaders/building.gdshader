// 건물 (MultiMesh 상자). 인스턴스 색 = 벽 색, INSTANCE_CUSTOM = (모양, 씨앗, 땅에 묻힌 깊이, 층 높이)
// 모양: 0 유리 업무 빌딩, 1 상가, 2 벽돌 빌라(1층 필로티 주차장), 3 아파트, 4 돌 업무 빌딩, 5 대학 건물(벽돌+유리)
// 창은 하늘을 비추고(금속성), 밤에는 일부 창과 1층 가게에 불이 켜짐. 눈 오면 지붕이 흼
shader_type spatial;
uniform float night = 0.0;
uniform float snow = 0.0;
varying vec3 lp;
varying vec3 ln;
varying vec3 sc;
varying vec4 cu;
varying vec3 orig;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void vertex() {
	lp = VERTEX;
	ln = NORMAL;
	sc = vec3(length(MODEL_MATRIX[0].xyz), length(MODEL_MATRIX[1].xyz), length(MODEL_MATRIX[2].xyz));
	cu = INSTANCE_CUSTOM;
	orig = MODEL_MATRIX[3].xyz;
}
void fragment() {
	int style = int(cu.r + 0.5);
	float seed = cu.g;
	vec3 base = pow(COLOR.rgb, vec3(2.2));
	vec3 col = base;
	vec3 emit = vec3(0.0);
	float rough = 0.85;
	float metal = 0.0;
	float y = (lp.y + 0.5) * sc.y - cu.b;
	bool side_x = abs(ln.x) > 0.5;
	if (ln.y > 0.5) {
		// 지붕: 빌라, 상가는 초록 방수 칠이 많음
		vec3 roof = (style == 1 || style == 2) && hash(vec2(seed, 3.0)) < 0.6 ? vec3(0.17, 0.3, 0.2) : vec3(0.32, 0.32, 0.33);
		col = mix(roof, vec3(0.86, 0.88, 0.92), snow);
	} else if (abs(ln.y) < 0.5) {
		float width = side_x ? sc.z : sc.x;
		float u = (side_x ? lp.z * sc.z : lp.x * sc.x) + width * 0.5;
		float fh = cu.a;
		float fl = floor(y / fh);
		float fy = fract(y / fh);
		float win = 0.0;
		float cw = 2.6;
		vec2 cell;
		if (style == 0) { // 커튼월: 층마다 어두운 띠, 1.5m 세로 멀리언
			cw = 1.5;
			float fu = fract(u / cw);
			win = step(0.22, fy) * step(0.04, fu) * step(fu, 0.96);
			col = mix(base * 0.55, base, 0.4);
		} else if (style == 1) { // 상가: 넓은 띠창
			cw = 2.8;
			float fu = fract(u / cw);
			win = step(0.32, fy) * step(fy, 0.82) * step(0.06, fu) * step(fu, 0.94);
		} else if (style == 2 || style == 5) { // 벽돌: 줄눈 무늬, 작은 창
			float row = floor(y / 0.42);
			float bu = fract(u / 0.9 + 0.5 * mod(row, 2.0));
			float br = hash(vec2(floor(u / 0.9 + 0.5 * mod(row, 2.0)), row) + seed);
			col = base * (0.86 + 0.22 * br) * (step(0.05, fract(y / 0.42)) * step(0.04, bu) * 0.18 + 0.82);
			cw = style == 5 ? 2.2 : 3.2;
			float fu = fract(u / cw);
			win = style == 5 ? step(0.25, fy) * step(fy, 0.88) * step(0.08, fu) * step(fu, 0.92)
				: step(0.35, fy) * step(fy, 0.8) * step(0.3, fu) * step(fu, 0.72);
		} else if (style == 3) { // 아파트: 긴 면은 발코니 줄, 짧은 면은 빈 벽 + 위쪽 색 띠
			if (width < 16.0) {
				win = 0.0;
				float top = sc.y - cu.b;
				col = mix(base, vec3(0.2, 0.36, 0.62), step(top - 4.0, y) * step(y, top - 2.6));
			} else {
				cw = 3.0;
				float fu = fract(u / cw);
				float rail = step(fy, 0.36);
				col = mix(base, base * 0.82, rail * 0.6);
				win = step(0.4, fy) * step(fy, 0.9) * step(0.05, fu) * step(fu, 0.95);
			}
		} else { // 돌 업무 빌딩: 세로로 긴 창
			cw = 1.8;
			float fu = fract(u / cw);
			win = step(0.18, fy) * step(fy, 0.86) * step(0.25, fu) * step(fu, 0.75);
		}
		cell = vec2(floor(u / cw), fl);
		float ground = style == 2 ? 2.6 : 4.0;
		win *= step(ground, y);
		vec3 glass = vec3(0.07, 0.09, 0.12);
		col = mix(col, glass, win);
		rough = mix(rough, 0.08, win);
		metal = mix(0.0, 0.85, win);
		float pl = style == 0 ? 0.55 : style == 3 ? 0.62 : 0.45;
		float lit = step(hash(cell + orig.xz * 0.37 + seed), pl);
		vec3 lamp = style == 0 || style == 4 ? vec3(0.85, 0.92, 1.0) : vec3(1.0, 0.78, 0.46);
		emit += win * lit * night * lamp * 1.4;
		// 1층: 가게 유리 (빌라는 필로티 주차장이라 어둡게)
		if (y < ground && y > 0.0) {
			if (style == 2) {
				col = vec3(0.05, 0.05, 0.055) * (1.0 - step(0.88, fract(u / 4.0)) * 0.0);
				float pillar = step(fract(u / 4.5), 0.08);
				col = mix(col, base * 0.8, pillar);
				rough = 0.9;
				metal = 0.0;
			} else if (style != 3) {
				float sf = fract(u / 4.0);
				float shop = step(0.3, y) * step(y, ground - 0.7) * step(0.04, sf) * step(sf, 0.96);
				col = mix(base * 0.7, vec3(0.08, 0.09, 0.1), shop);
				rough = mix(0.8, 0.06, shop);
				metal = mix(0.0, 0.7, shop);
				vec3 inside = mix(vec3(1.0, 0.85, 0.6), vec3(0.85, 0.95, 1.0), hash(vec2(floor(u / 4.0), seed)));
				emit += shop * inside * (0.12 + night * 1.6);
			}
		}
		col *= 0.8 + 0.2 * smoothstep(0.0, 1.5, y); // 바닥 쪽 그늘
	}
	ALBEDO = col;
	ROUGHNESS = rough;
	METALLIC = metal;
	EMISSION = emit;
}
