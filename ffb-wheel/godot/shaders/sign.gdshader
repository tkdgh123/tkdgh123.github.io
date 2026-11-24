// 간판 (MultiMesh 사각형). INSTANCE_CUSTOM.r = 그림판 칸 번호. 낮에도 조금, 밤에는 환하게 빛남
shader_type spatial;
render_mode cull_disabled;
uniform sampler2D atlas : source_color, filter_linear;
uniform vec2 grid = vec2(4.0, 16.0);
uniform float night = 0.0;
varying float cell;
void vertex() { cell = INSTANCE_CUSTOM.r; }
void fragment() {
	float c = floor(cell + 0.5);
	vec2 uv = (vec2(mod(c, grid.x), floor(c / grid.x)) + clamp(UV, 0.01, 0.99)) / grid;
	vec3 col = texture(atlas, uv).rgb;
	ALBEDO = col;
	ROUGHNESS = 0.45;
	EMISSION = col * (0.12 + night * 1.5);
}
