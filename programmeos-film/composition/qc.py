"""ProgrammeOS film — quality control on the delivery files.

Checks container, duration, frame count, resolution, frame rate, codecs, subtitle track, loudness
and true peak, and that every subtitle cue sits inside the film and does not overlap the next.
Writes a JSON report and prints a summary.

    python3 composition/qc.py output
"""
import json
import os
import re
import subprocess
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else 'output'
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FILES = {
    'film_4k': ('ProgrammeOS_Film_150s_4K_UHD_H264.mp4', 150, (3840, 2160)),
    'film_1080p': ('ProgrammeOS_Film_150s_1080p_H264.mp4', 150, (1920, 1080)),
    'vertical': ('ProgrammeOS_Social_30s_Vertical_1080x1920_H264.mp4', 30, (1080, 1920)),
}


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-count_frames', '-of', 'json', path], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def loudness(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    s = r.stderr[r.stderr.rfind('Summary:'):]
    i = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1))
    tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))
    return i, tp


def srt_cues(path):
    t = lambda s: sum(float(x) * m for x, m in zip(s.replace(',', '.').split(':'), (3600, 60, 1)))
    cues = re.findall(r'(\d\d:\d\d:\d\d,\d\d\d) --> (\d\d:\d\d:\d\d,\d\d\d)\n(.+?)\n\n', open(path).read() + '\n\n', re.S)
    return [(t(a), t(b), txt.strip()) for a, b, txt in cues]


report, ok = {}, True
for key, (name, dur, (w, h)) in FILES.items():
    path = os.path.join(OUT, name)
    if not os.path.exists(path):
        report[key] = {'missing': True}
        ok = False
        continue
    p = probe(path)
    v = next(s for s in p['streams'] if s['codec_type'] == 'video')
    a = next(s for s in p['streams'] if s['codec_type'] == 'audio')
    subs = [s for s in p['streams'] if s['codec_type'] == 'subtitle']
    frames = int(v['nb_read_frames'])
    i, tp = loudness(path)
    item = {
        'file': name, 'sizeMB': round(os.path.getsize(path) / 1e6, 1),
        'container_duration_s': float(p['format']['duration']), 'video_duration_s': frames / 24,
        'audio_duration_s': float(a['duration']), 'frames': frames, 'resolution': f"{v['width']}x{v['height']}",
        'fps': v['r_frame_rate'], 'video_codec': f"{v['codec_name']} {v.get('profile', '')}", 'pix_fmt': v['pix_fmt'],
        'color': f"{v.get('color_space')}/{v.get('color_transfer')}/{v.get('color_primaries')}/{v.get('color_range')}",
        'audio_codec': f"{a['codec_name']} {a['sample_rate']} Hz {a.get('channels')} ch", 'subtitle_tracks': [s.get('tags', {}).get('language') for s in subs],
        'loudness_LUFS': i, 'true_peak_dBFS': tp,
    }
    checks = {
        'frames == duration × 24': frames == dur * 24,
        'video exactly %d s' % dur: abs(frames / 24 - dur) < 1e-9,
        'audio within 1 frame of %d s' % dur: abs(item['audio_duration_s'] - dur) <= 1 / 24,
        'resolution': (v['width'], v['height']) == (w, h),
        '24 fps': v['r_frame_rate'] == '24/1',
        'loudness −14 ±1 LUFS': abs(i + 14) <= 1,
        'true peak ≤ −0.9 dBFS': tp <= -0.9,
    }
    if key != 'vertical':
        checks['English subtitle track'] = 'eng' in item['subtitle_tracks']
    item['checks'] = checks
    ok &= all(checks.values())
    report[key] = item

cues = srt_cues(os.path.join(ROOT, 'subtitles', 'programmeos_film_en.srt'))
report['subtitles'] = {
    'cues': len(cues), 'first': cues[0][0], 'last_end': cues[-1][1],
    'inside_film': all(0 <= a < b <= 150 for a, b, _ in cues),
    'no_overlaps': all(cues[k][1] <= cues[k + 1][0] for k in range(len(cues) - 1)),
}
ok &= report['subtitles']['inside_film'] and report['subtitles']['no_overlaps']
report['all_passed'] = bool(ok)
json.dump(report, open(os.path.join(OUT, 'qc_report.json'), 'w'), indent=2, ensure_ascii=False)
for key, item in report.items():
    if isinstance(item, dict) and 'checks' in item:
        print(f"{key}: {item['resolution']} {item['frames']} frames, {item['video_duration_s']:.3f} s video / {item['audio_duration_s']:.3f} s audio, "
              f"{item['loudness_LUFS']} LUFS, {item['true_peak_dBFS']} dBTP, {item['sizeMB']} MB")
        for c, v in item['checks'].items():
            print(f"   {'PASS' if v else 'FAIL'}  {c}")
print('subtitles:', report['subtitles'])
print('ALL PASSED' if ok else 'SOME CHECKS FAILED')
