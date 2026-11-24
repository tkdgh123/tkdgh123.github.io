# 소리: 빗소리, 구급차 사이렌, 경적, 방향지시등 딸깍, 엔진, 타이어 끽, 부딪힘(쿵 + 찌그러짐 + 유리), 긁힘, 물, 의자 모터, 도시 소음, 바람. 파일 없이 숫자로 만들어 섞음
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
var screech := 0.0  # 0~1 (타이어가 미끄러지는 정도)
var scrape := 0.0
var water := 0.0
var motor := 0.0
var speed := 0.0    # m/s (바람, 노면 소리)
var _thump := 0.0
var _crunch := 0.0
var _glass := 0.0
var _pop := 0.0
var _scr := 0.0
var _ps2 := 0.0
var _lp3 := 0.0
var _lp4 := 0.0
var _lp5 := 0.0
var _amb_t := 0.0
var _far := 0.0
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

# 부딪힘: imp = 충격 속도(m/s). 쿵(낮은 소리) + 찌그러지는 소리 + 빠를 땐 유리 깨지는 소리
func crash(imp: float, kind: String) -> void:
	var k := clampf(imp / 10.0, 0.08, 1.0)
	if kind == "airbag":
		_pop = 1.0
		return
	_thump = maxf(_thump, k)
	if kind != "person" and kind != "cone":
		_crunch = maxf(_crunch, k * (0.5 if kind == "tree" or kind == "bld" else 1.0))
	if imp > 5.5 and kind != "cone":
		_glass = maxf(_glass, clampf(imp / 12.0, 0.3, 1.0))

func cue(what: String) -> void:
	if what == "skid":
		skid = 0.9

func _process(dt: float) -> void:
	horn = maxf(0.0, horn - dt)
	skid = maxf(0.0, skid - dt)
	scrape = maxf(0.0, scrape - dt * 2.0)
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
		if _thump > 0.002: # 쿵: 55Hz가 빨리 줄어듦
			_ps2 += (55.0 + 40.0 * _thump) * inv
			s += sin(_ps2 * TAU) * 0.55 * _thump
			_thump *= 1.0 - inv * 9.0
		if _crunch > 0.002: # 찌그러짐: 거친 잡음이 뚝뚝 끊김
			var w := randf() * 2.0 - 1.0
			_lp3 += (w - _lp3) * 0.45
			var gate := 1.0 if randf() < 0.35 else 0.25
			s += _lp3 * 0.5 * _crunch * gate
			_crunch *= 1.0 - inv * 4.0
		if _glass > 0.002: # 유리: 높은 소리가 흩어짐
			if randf() < 0.004 * _glass:
				_far = 1.0
			_far *= 0.995
			s += sin(_t * TAU * (3200.0 + 900.0 * sin(_t * 37.0))) * 0.12 * _far * _glass + (randf() - 0.5) * 0.06 * _glass
			_glass *= 1.0 - inv * 1.6
		if _pop > 0.002: # 에어백: 펑
			s += (randf() * 2.0 - 1.0) * 0.9 * _pop
			_pop *= 1.0 - inv * 25.0
		if screech > 0.0: # 타이어 끽: 900Hz 근처가 떨림
			_scr += (880.0 + 60.0 * sin(_t * 23.0) + randf() * 40.0) * inv
			s += sin(_scr * TAU) * 0.09 * screech
		if scrape > 0.0:
			s += (randf() - 0.5) * 0.25 * scrape * (1.0 if randf() < 0.5 else 0.3)
		if water > 0.0:
			var w2 := randf() * 2.0 - 1.0
			_lp4 += (w2 - _lp4) * 0.6
			s += _lp4 * 0.08 * water
		if motor > 0.0:
			s += sin(_t * TAU * 140.0) * 0.03 * motor + (randf() - 0.5) * 0.01 * motor
		# 바람, 노면: 속도와 함께 커지는 낮은 잡음 / 도시 소음: 늘 작게
		var wn := randf() * 2.0 - 1.0
		_lp5 += (wn - _lp5) * (0.02 + minf(speed, 20.0) * 0.004)
		s += _lp5 * (0.05 + minf(speed * speed / 300.0, 0.6) * 0.5)
		pb.push_frame(Vector2(s, s))
