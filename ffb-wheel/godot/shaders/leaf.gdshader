// 가로수 잎 (MultiMesh 인스턴스 색): 눈 오면 위쪽이 흼
shader_type spatial;
uniform float snow = 0.0;
varying vec3 wnorm;
void vertex() { wnorm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz); }
void fragment() {
	vec3 col = pow(COLOR.rgb, vec3(2.2));
	col = mix(col, vec3(0.88, 0.9, 0.94), snow * smoothstep(-0.1, 0.5, wnorm.y));
	ALBEDO = col;
	ROUGHNESS = 0.9;
}
