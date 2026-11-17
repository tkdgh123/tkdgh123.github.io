// 건물 (MultiMesh 상자, 인스턴스 색): 벽에 창 무늬, 밤엔 일부 창에 불, 눈 오면 지붕이 흼
shader_type spatial;
uniform float night = 0.0;
uniform float snow = 0.0;
varying vec3 wpos;
varying vec3 wnorm;
varying vec3 orig;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void vertex() {
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wnorm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
	orig = MODEL_MATRIX[3].xyz;
}
void fragment() {
	vec3 base = pow(COLOR.rgb, vec3(2.2));
	vec3 col = base;
	vec3 emit = vec3(0.0);
	if (abs(wnorm.y) < 0.5) {
		float u = abs(wnorm.x) > 0.5 ? wpos.z : wpos.x;
		vec2 cell = vec2(u / 3.4, (wpos.y - 0.4) / 3.2);
		vec2 f = fract(cell);
		float win = step(0.18, f.x) * step(f.x, 0.74) * step(0.3, f.y) * step(f.y, 0.78) * step(1.0, wpos.y);
		vec3 glass = vec3(0.6, 0.64, 0.72);
		col = mix(col, glass, win * 0.85);
		float lit = step(hash(floor(cell) + orig.xz * 0.37), 0.42);
		emit = win * lit * night * vec3(1.0, 0.78, 0.45) * 1.6;
		col = mix(col, col * 0.35, night * win * (1.0 - lit));
	} else if (wnorm.y > 0.5) {
		col = mix(col, vec3(0.88, 0.9, 0.94), snow);
	}
	ALBEDO = col;
	ROUGHNESS = 0.8;
	EMISSION = emit;
}
