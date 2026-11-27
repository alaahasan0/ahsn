"""
ProgrammeOS film — audio mix.

Builds, from composition/timeline.json:
  audio/vo/vo_full_150s.wav     narration stem, exactly 150 s
  audio/mix/music_stem.wav      automated score (filter + gain + ducking)
  audio/mix/sfx_stem.wav        sound design stem
  audio/mix/film_mix.wav        final mix, loudness-normalised (-14 LUFS, -1 dBTP)
  audio/mix/social_mix.wav      30 s mix for the vertical cut

Requires ffmpeg and numpy only.
"""
import json
import os
import subprocess

import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(ROOT, '..', 'composition', 'timeline.json')))
SR = 48000
DUR = TL['duration']
N = int(DUR * SR)
os.makedirs(os.path.join(ROOT, 'mix'), exist_ok=True)


def load(path, filt=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, path)]
    if filt:
        cmd += ['-af', filt]
    cmd += ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def db(x):
    return 10 ** (x / 20)


def envelope(points, n=N):
    t = np.arange(n) / SR
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return db(np.interp(t, xs, ys)).astype(np.float32)


def place(track, clip, at, gain=1.0):
    i = int(round(at * SR))
    j = min(len(track), i + len(clip))
    if j > i:
        track[i:j] += clip[: j - i] * gain


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', path],
        input=x.astype(np.float32).tobytes(), check=True,
    )


# ── Narration ──────────────────────────────────────────────────────────────────
vo = np.zeros((N, 2), np.float32)
duck_points = []
for line in TL['vo']:
    clip = load(line['file'], 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2')
    place(vo, clip, line['start'])
    s = line['start'] + line['cues'][0][0]
    e = line['start'] + line['cues'][-1][1]
    duck_points.append((s, e))

# ── Score: dark/filtered opening that opens at the reveal, then gain + ducking ──
f = TL['musicFilter']
full = load('music/score_150s.mp3')[:N]
full = np.pad(full, ((0, max(0, N - len(full))), (0, 0)))
dark = np.pad(load('music/score_150s.mp3', f"lowpass=f={f['darkHz']},lowpass=f={f['darkHz']}")[:N], ((0, 0), (0, 0)))
mid = load('music/score_150s.mp3', f"lowpass=f={f['midHz']}")[:N]
dark = np.pad(dark, ((0, max(0, N - len(dark))), (0, 0)))[:N]
mid = np.pad(mid, ((0, max(0, N - len(mid))), (0, 0)))[:N]
t = np.arange(N) / SR
a, b = f['darkUntil'], f['openBy']
m = (b + a) / 2
w_dark = np.clip((m - t) / (m - a), 0, 1)
w_full = np.clip((t - m) / (b - m), 0, 1)
w_mid = 1 - w_dark - w_full
music = dark * w_dark[:, None] + mid * w_mid[:, None] + full * w_full[:, None]

gain = envelope(TL['musicGain'])
duck = np.ones(N, np.float32)
ramp = 0.35
for s, e in duck_points:
    seg = np.clip(np.minimum((t - (s - ramp)) / ramp, ((e + ramp) - t) / ramp), 0, 1)
    duck = np.minimum(duck, 1 - seg * (1 - db(TL['duckDb'])))
music *= (gain * duck)[:, None]

# ── Sound design ──────────────────────────────────────────────────────────────
sfx = np.zeros((N, 2), np.float32)
for cue in TL['sfx']:
    clip = load(cue['file'], 'alimiter=limit=0.89')
    if 'fadeOut' in cue:
        fs, fe = cue['fadeOut']
        ct = cue['at'] + np.arange(len(clip)) / SR
        clip *= np.clip((fe - ct) / (fe - fs), 0, 1)[:, None]
    place(sfx, clip, cue['at'], db(cue['gainDb']))

# Gentle fade-in from black and a clean tail.
fade = np.clip(t / 0.4, 0, 1) * np.clip((DUR - t) / 1.2, 0, 1)
mix = (vo + music + sfx) * fade[:, None]

write_wav(os.path.join(ROOT, 'vo', 'vo_full_150s.wav'), vo)
write_wav(os.path.join(ROOT, 'mix', 'music_stem.wav'), music)
write_wav(os.path.join(ROOT, 'mix', 'sfx_stem.wav'), sfx)
raw_path = os.path.join(ROOT, 'mix', 'film_mix_raw.wav')
write_wav(raw_path, mix * 0.7)


def loudnorm(src, dst, duration):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(p[p.rindex('{'): p.rindex('}') + 1])
    flt = (
        f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
        f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000"
    )
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', flt, '-t', str(duration), '-c:a', 'pcm_s24le', dst], check=True)
    return j


j = loudnorm(raw_path, os.path.join(ROOT, 'mix', 'film_mix.wav'), DUR)
print('film mix measured input', j['input_i'], 'LUFS → normalised to -14 LUFS')

# ── 30 s social cut: score 116–146 s with the closing line at the end ─────────
SN = 30 * SR
s_music = full[int(116 * SR): int(116 * SR) + SN].copy()
s_t = np.arange(SN) / SR
s_music *= (db(-6) * np.clip(s_t / 0.6, 0, 1) * np.clip((30 - s_t) / 1.5, 0, 1))[:, None]
social = s_music
vo10 = load('vo/vo10.mp3', 'highpass=f=70')
tail = vo10[int(4.25 * SR):]  # "One platform. Every programme. Complete control."
social = social.copy()
s_duck = np.ones(SN, np.float32)
s_duck[int(24.7 * SR):] = db(-5)
social *= s_duck[:, None]
place(social, tail, 24.8)
place(social, load('sfx/reveal_shimmer_impact.mp3', 'alimiter=limit=0.89'), 1.6, db(-12))
place(social, load('sfx/logo_resolve.mp3', 'alimiter=limit=0.89'), 3.1, db(-12))
write_wav(os.path.join(ROOT, 'mix', 'social_mix_raw.wav'), social * 0.7)
loudnorm(os.path.join(ROOT, 'mix', 'social_mix_raw.wav'), os.path.join(ROOT, 'mix', 'social_mix.wav'), 30)
for p in ['film_mix_raw.wav', 'social_mix_raw.wav']:
    os.remove(os.path.join(ROOT, 'mix', p))
print('done')
