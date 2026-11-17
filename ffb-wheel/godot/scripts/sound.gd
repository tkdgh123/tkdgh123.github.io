# 소리: 빗소리, 구급차 사이렌, 경적, 방향지시등 딸깍, 엔진. 파일 없이 숫자로 만들어 섞음
# 시험할 때는 실행 인자 "-- mute"로 아예 만들지 않음
class_name Sfx
extends Node

const RATE := 22050.0
var muted := false
var pb: AudioStreamGeneratorPlayback
var rain := 0.0     # 0~1
var siren := 0.0    # 0~1 (구급차가 가까울수록)
var horn := 0.0     # 남은 초
var engine := 0.0   # rpm
var click := 0.0
var skid := 0.0
var _t := 0.0
var _ps := 0.0
var _h1 := 0.0
var _h2 := 0.0
var _pe := 0.0
var _lp := 0.0
var _lp2 := 0.0

func _ready() -> void:
	muted = OS.get_cmdline_user_args().has("mute")
	if muted:
		return
	var gen := AudioStreamGenerator.new()
	gen.mix_rate = RATE
	gen.buffer_length = 0.12
	var p := AudioStreamPlayer.new()
	p.stream = gen
	p.volume_db = -4.0
	add_child(p)
	p.play()
	pb = p.get_stream_playback()

func tick_click() -> void:
	click = 1.0

func cue(what: String) -> void:
	if what == "skid":
		skid = 0.9

func _process(dt: float) -> void:
	horn = maxf(0.0, horn - dt)
	skid = maxf(0.0, skid - dt)
	if muted or pb == null:
		return
	var n := pb.get_frames_available()
	var inv := 1.0 / RATE
	for i in n:
		_t += inv
		var s := 0.0
		if rain > 0.0:
			var w := randf() * 2.0 - 1.0
			_lp += (w - _lp) * 0.3
			_lp2 += (_lp - _lp2) * 0.5
			s += _lp2 * 0.22 * rain
		if siren > 0.0: # 오르내리는 사이렌 (1.6초 주기)
			var f := 720.0 + 420.0 * (0.5 + 0.5 * sin(_t * TAU / 1.6))
			_ps += f * inv
			s += sin(_ps * TAU) * 0.16 * siren
		if horn > 0.0:
			_h1 += 415.0 * inv
			_h2 += 523.0 * inv
			s += (signf(sin(_h1 * TAU)) + signf(sin(_h2 * TAU))) * 0.05 * minf(1.0, horn * 6.0)
		if engine > 0.0:
			_pe += (22.0 + engine / 60.0 * 1.5) * inv
			s += (fposmod(_pe, 1.0) - 0.5) * 0.035
		if click > 0.0:
			s += (randf() - 0.5) * 0.5 * click
			click = maxf(0.0, click - inv / 0.01)
		if skid > 0.0:
			s += (randf() - 0.5) * 0.12 * skid
		pb.push_frame(Vector2(s, s))
