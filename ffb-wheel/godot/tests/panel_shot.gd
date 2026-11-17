extends SceneTree
func _initialize() -> void:
	var main = load("res://main.tscn").instantiate()
	root.add_child(main)
	await create_timer(1.5).timeout
	var out: String = OS.get_cmdline_user_args()[-1].substr(4)
	root.get_texture().get_image().save_png(out + "/panel2.png")
	quit()
