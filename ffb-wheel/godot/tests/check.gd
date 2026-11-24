# 스크립트 오류 보기: 하나씩 불러 봄 (godot --headless --path . -s res://tests/check.gd)
extends SceneTree

func _initialize() -> void:
	for f in ["kit", "models", "car", "city", "dress", "crash", "cockpit", "weather", "events", "hud", "sound", "main"]:
		var s = load("res://scripts/%s.gd" % f)
		print(f, " ", s != null and s.can_instantiate())
	quit()
