// 강남역 사거리 건물의 큰 전광판: 색 덩어리가 바뀌고 글자 줄이 흐름
shader_type spatial;
render_mode unshaded;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void fragment() {
	float scene = floor(TIME / 6.0);
	vec2 uv = UV;
	vec3 a = vec3(hash(vec2(scene, 1.0)), hash(vec2(scene, 2.0)), hash(vec2(scene, 3.0)));
	vec3 b = vec3(hash(vec2(scene, 4.0)), hash(vec2(scene, 5.0)), hash(vec2(scene, 6.0)));
	vec3 col = mix(a, b, smoothstep(0.0, 1.0, uv.x + 0.3 * sin(TIME * 0.7 + uv.y * 3.0)));
	float band = step(0.72, uv.y) * step(uv.y, 0.86);
	float txt = step(0.5, hash(floor(vec2((uv.x + TIME * 0.12) * 40.0, uv.y * 12.0))));
	col = mix(col, vec3(1.0), band * txt * 0.9);
	vec2 px = fract(uv * vec2(160.0, 90.0));
	col *= 0.75 + 0.25 * step(0.15, px.x) * step(0.15, px.y);
	ALBEDO = col * 1.6;
}
