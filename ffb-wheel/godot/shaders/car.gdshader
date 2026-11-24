// 차 몸체: 칠(인스턴스마다 색), 검은 부품(정점 색), 유리. 부딪힌 쪽(dent: 앞, 뒤, 왼, 오)은 찌그러지고 칠이 벗겨짐
shader_type spatial;
instance uniform vec4 paint = vec4(0.2, 0.3, 0.7, 1.0);
instance uniform vec4 dent = vec4(0.0);
uniform bool glass = false;
uniform float half_len = 2.3;
varying float scuff;
varying vec3 lpos;
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
void vertex() {
	vec3 v = VERTEX;
	lpos = v;
	float f = clamp((v.z - (half_len - 0.85)) / 0.85, 0.0, 1.0) * dent.x;
	float r = clamp((-v.z - (half_len - 0.85)) / 0.85, 0.0, 1.0) * dent.y;
	float l = clamp((v.x - 0.45) / 0.45, 0.0, 1.0) * dent.z;
	float rr = clamp((-v.x - 0.45) / 0.45, 0.0, 1.0) * dent.w;
	float wob = 0.5 + 0.5 * sin(v.x * 11.0 + v.y * 7.0);
	v.z += (r - f) * (0.42 + 0.18 * wob);
	v.y += (f + r) * 0.09 * wob - (l + rr) * 0.03;
	float sw = 0.6 + 0.4 * sin(v.z * 5.0 + v.y * 3.0);
	v.x += (rr - l) * 0.2 * sw;
	scuff = clamp((f + r + l + rr) * 1.6, 0.0, 1.0);
	VERTEX = v;
}
void fragment() {
	if (glass) {
		ALBEDO = vec3(0.035, 0.04, 0.05);
		METALLIC = 0.85;
		ROUGHNESS = 0.04 + scuff * 0.5;
		SPECULAR = 0.9;
	} else if (COLOR.a > 0.75) {
		vec3 base = pow(paint.rgb, vec3(2.2));
		// 긁힌 자리: 가로로 길게 긁힌 줄무늬 (찌그러진 정도만큼)
		float n = hash(vec3(floor(lpos.y * 40.0), floor(lpos.z * 3.0), floor(lpos.x * 2.0)));
		vec3 bare = mix(vec3(0.42, 0.42, 0.43), vec3(0.6, 0.6, 0.61), n);
		ALBEDO = mix(base, bare, scuff * step(0.72, n) * 0.6);
		METALLIC = 0.35;
		ROUGHNESS = mix(0.22, 0.7, scuff);
		CLEARCOAT = 1.0 - scuff;
		CLEARCOAT_ROUGHNESS = 0.08;
	} else {
		ALBEDO = pow(COLOR.rgb, vec3(2.2));
		ROUGHNESS = COLOR.a > 0.25 ? 0.25 : 0.75;
		METALLIC = COLOR.a > 0.25 ? 0.8 : 0.0;
	}
}
