// 땅, 길, 노면 표시: 정점 색 + 날씨 (wet: 젖은 길이 어둡고 번들거림 / snow: 눈이 덮이고 차로마다 바퀴 자국)
// UV.x = 종류 (0 땅, 연석 / 1 아스팔트 / 2 노면 표시 / 3 어린이 보호구역), UV.y = 차로 폭 단위 가로 위치
shader_type spatial;
render_mode cull_disabled;
uniform float wet = 0.0;
uniform float snow = 0.0;
varying vec3 wpos;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
	vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
void vertex() { wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz; }
void fragment() {
	vec3 col = pow(COLOR.rgb, vec3(2.2));
	float kind = UV.x;
	float n = vnoise(wpos.xz * 0.35) * 0.6 + vnoise(wpos.xz * 2.3) * 0.4;
	float rough = 0.95;
	float road = step(0.5, kind);
	// 젖은 길: 아스팔트와 노면 표시는 어둡고 매끈하게, 얼룩덜룩 물기
	float wetk = wet * mix(0.75, 1.0, n);
	col *= mix(1.0, mix(0.82, 0.5, road), wetk);
	rough = mix(rough, mix(0.65, 0.08 + 0.22 * n, road), wetk);
	// 눈: 땅은 거의 다 덮고, 길은 바퀴 자국만 드러남
	float cover;
	if (kind > 0.5 && kind < 1.5 || kind > 2.5) {
		float f = fract(UV.y);
		float tr = smoothstep(0.11, 0.02, abs(f - 0.27)) + smoothstep(0.11, 0.02, abs(f - 0.73));
		cover = snow * clamp(0.9 - 0.8 * tr + (n - 0.5) * 0.7, 0.0, 1.0);
	} else if (kind > 1.5) {
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
