// 땅, 길, 노면 표시: 정점 색 + 날씨 (wet: 젖은 길이 어둡고 번들거림 / snow: 눈이 덮이고 차로마다 바퀴 자국)
// UV.x = 종류 (0 땅, 연석 / 1 아스팔트 / 2 노면 표시 / 3 어린이 보호구역 / 4 보도블록 / 5 언덕), UV.y = 차로 폭 단위 가로 위치
shader_type spatial;
render_mode cull_disabled;
uniform float wet = 0.0;
uniform float snow = 0.0;
uniform float leaves = 1.0; // 11월: 보도에 떨어진 은행잎
varying vec3 wpos;
varying vec3 wnrm;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
	vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
void vertex() {
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wnrm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
}
void fragment() {
	vec3 col = pow(COLOR.rgb, vec3(2.2));
	float kind = UV.x;
	float n = vnoise(wpos.xz * 0.35) * 0.6 + vnoise(wpos.xz * 2.3) * 0.4;
	float rough = 0.95;
	float road = step(0.5, kind) * step(kind, 3.5);
	if (kind > 0.5 && kind < 1.5) {
		// 아스팔트: 덧씌운 자리, 바퀴가 지나는 자리는 더 어둡고 매끈, 맨홀
		float patch = step(0.72, vnoise(wpos.xz * 0.06 + 7.0));
		col *= mix(0.92 + 0.16 * n, 0.8, patch);
		float f = fract(UV.y);
		float track = smoothstep(0.12, 0.02, abs(f - 0.27)) + smoothstep(0.12, 0.02, abs(f - 0.73));
		col *= 1.0 - 0.12 * track;
		vec2 mc = floor(wpos.xz / 23.0);
		vec2 mp = (mc + 0.5 + (vec2(hash(mc), hash(mc + 3.1)) - 0.5) * 0.6) * 23.0;
		float man = step(distance(wpos.xz, mp), 0.35) * step(0.6, hash(mc + 9.0));
		col = mix(col, vec3(0.05, 0.05, 0.05), man * 0.8);
		rough = 0.9 - 0.15 * track;
	} else if (kind > 1.5 && kind < 2.5) {
		col *= 0.82 + 0.18 * smoothstep(0.25, 0.65, n); // 닳은 칠
	} else if (kind > 3.5 && kind < 4.5) {
		// 보도블록 (20 x 10cm 엇갈림) + 떨어진 은행잎
		vec2 b = wpos.xz / vec2(0.4, 0.2);
		b.x += 0.5 * mod(floor(b.y), 2.0);
		vec2 fb = fract(b);
		float joint = step(0.06, fb.x) * step(0.1, fb.y);
		float tone = hash(floor(b));
		col = mix(vec3(0.42, 0.4, 0.38), vec3(0.55, 0.48, 0.44), step(0.7, tone)) * (0.85 + 0.15 * tone);
		col *= 0.7 + 0.3 * joint;
		float lf = smoothstep(0.55, 0.75, vnoise(wpos.xz * 1.3)) * step(0.72, hash(floor(wpos.xz * 16.0))) * leaves;
		col = mix(col, vec3(0.72, 0.56, 0.1), lf * 0.75);
	} else if (kind > 4.5) {
		// 언덕: 평평하면 마른 풀과 흙, 가파르면 콘크리트 옹벽
		float steep = 1.0 - smoothstep(0.55, 0.8, wnrm.y);
		vec3 grass = mix(vec3(0.33, 0.32, 0.2), vec3(0.42, 0.36, 0.26), n);
		vec3 wall = vec3(0.55, 0.54, 0.5) * (0.85 + 0.15 * step(0.5, fract(wpos.y / 0.8)));
		col = mix(grass, wall, steep);
	} else {
		col *= 0.9 + 0.2 * n;
	}
	// 젖은 길: 아스팔트와 노면 표시는 어둡고 매끈하게, 얼룩덜룩 물기
	float wetk = wet * mix(0.75, 1.0, n);
	col *= mix(1.0, mix(0.82, 0.5, road), wetk);
	rough = mix(rough, mix(0.65, 0.08 + 0.22 * n, road), wetk);
	// 눈: 땅은 거의 다 덮고, 길은 바퀴 자국만 드러남
	float cover;
	if (kind > 0.5 && kind < 1.5 || kind > 2.5 && kind < 3.5) {
		float f = fract(UV.y);
		float tr = smoothstep(0.11, 0.02, abs(f - 0.27)) + smoothstep(0.11, 0.02, abs(f - 0.73));
		cover = snow * clamp(0.9 - 0.8 * tr + (n - 0.5) * 0.7, 0.0, 1.0);
	} else if (kind > 1.5 && kind < 2.5) {
		cover = snow * clamp(0.75 + (n - 0.5) * 0.6, 0.0, 1.0);
	} else {
		cover = snow * clamp(0.97 + (n - 0.5) * 0.15, 0.0, 1.0);
	}
	col = mix(col, vec3(0.86, 0.88, 0.92), cover);
	rough = mix(rough, 0.75, cover);
	ALBEDO = col;
	ROUGHNESS = rough;
	SPECULAR = mix(0.5, 0.9, wetk * road);
}
