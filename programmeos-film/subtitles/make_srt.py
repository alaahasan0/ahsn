"""Builds English SRT subtitles from composition/timeline.json (real word timings of the narration)."""
import json, os
root = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(root, '..', 'composition', 'timeline.json')))

def ts(s):
    ms = int(round(s * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"

cues = []
for line in tl['vo']:
    for a, b, text in line['cues']:
        cues.append((line['start'] + a, line['start'] + b + 0.25, text))
# never overlap consecutive cues
for i in range(len(cues) - 1):
    if cues[i][1] > cues[i + 1][0] - 0.04:
        cues[i] = (cues[i][0], cues[i + 1][0] - 0.04, cues[i][2])
with open(os.path.join(root, 'programmeos_film_en.srt'), 'w') as f:
    for i, (a, b, t) in enumerate(cues, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n")
print(len(cues), 'cues')
