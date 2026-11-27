"""Samples the top and bottom edge colour of every still and sequence frame into footage/colors.json.
The composition fills the device frame's strips above and below each capture with these colours."""
import glob
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))


def edge(path):
    a = np.asarray(Image.open(path).convert('RGB'))
    h = a.shape[0]
    hx = lambda v: '#%02x%02x%02x' % tuple(int(round(x)) for x in v)
    return hx(np.median(a[1:4].reshape(-1, 3), axis=0)), hx(np.median(a[h - 4:h - 1].reshape(-1, 3), axis=0))


out = {'stills': {}, 'sequences': {}}
for f in sorted(glob.glob(os.path.join(ROOT, 'stills', '*.png'))):
    out['stills'][os.path.basename(f)[:-4]] = edge(f)
for d in sorted(glob.glob(os.path.join(ROOT, 'sequences', '*'))):
    out['sequences'][os.path.basename(d)] = [edge(f) for f in sorted(glob.glob(os.path.join(d, '*.jpg')))]
json.dump(out, open(os.path.join(ROOT, 'colors.json'), 'w'))
print(len(out['stills']), 'stills,', len(out['sequences']), 'sequences')
