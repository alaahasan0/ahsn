"""Builds footage/manifest.json: every captured still and sequence, its app route, role, theme,
the script that captured it, and where the film and the vertical cut use it."""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.join(ROOT, '..')
cap = open(os.path.join(FILM, 'capture', 'capture.cjs')).read()
js = open(os.path.join(FILM, 'composition', 'film.js')).read()

shots = {}
for m in re.finditer(r"\{ name: '([a-z0-9_]+)', route: '([^']+)'(.*?)\},?\n", cap):
    name, route, rest = m.groups()
    role = re.search(r"role: '([a-z_]+)'", rest)
    theme = 'dark' if "themePreference: 'dark'" in rest else 'light'
    shots[name] = {'route': route, 'role': role.group(1) if role else 'programme_manager', 'theme': theme, 'capturedBy': 'capture/capture.cjs'}
extra = {
    's03_home_scroll_elp': ('/home', 'capture/capture_home_tap.cjs'),
    's08_readiness_to_alert': ('/programme/p-elp/readiness', 'capture/capture_readiness_tap.cjs'),
    's08_tap_before': ('/programme/p-elp/readiness', 'capture/capture_readiness_tap.cjs'),
    's08_tap_after': ('/programme/p-elp/readiness (after tapping "Mark ticketed")', 'capture/capture_readiness_tap.cjs'),
    's08_after_to_top': ('/programme/p-elp/readiness (after tapping "Mark ticketed")', 'capture/capture_readiness_tap.cjs'),
}
for k, (route, by) in extra.items():
    shots[k] = {'route': route, 'role': 'programme_manager', 'theme': 'light', 'capturedBy': by}

# Where each piece of footage is used: split film.js into scene blocks by their header comments.
blocks = re.split(r"\n  // (S\d\d [^\n]*|V\d[^\n]*|Light point[^\n]*)\n", js)
usage = {}
for i in range(1, len(blocks), 2):
    title, body = blocks[i], blocks[i + 1]
    tag = title.split(' ')[0]
    if title.startswith('Light'):
        continue
    for n in set(re.findall(r"'((?:s0\d|dk)_[a-z0-9_]+)'", body)):
        usage.setdefault(n, []).append(('Film ' if tag.startswith('S') else 'Vertical ') + tag)

out = []
for kind, folder in (('still', 'stills'), ('sequence', 'sequences')):
    for f in sorted(os.listdir(os.path.join(ROOT, folder))):
        name = f[:-4] if kind == 'still' else f
        meta = shots.get(name, {})
        item = {'name': name, 'type': kind, **meta, 'usedIn': sorted(usage.get(name, []))}
        if kind == 'sequence':
            item['frames'] = len(os.listdir(os.path.join(ROOT, folder, f)))
            item['clip'] = f'footage/clips/{name}.mp4'
        else:
            item['file'] = f'footage/stills/{f}'
        out.append(item)
json.dump({
    'source': 'ProgrammeOS Expo web build (programmeos/), served locally, captured in headless Chromium',
    'viewport': '390×844 CSS px at 3× density (1170×2532 px); sequences at 24 fps',
    'demoDate': 'Monday 29 March 2027 (the app’s fixed demo date)',
    'note': 'Unmodified captures of the app’s own UI and sample data. No retouching, redrawing or generated UI.',
    'footage': out,
}, open(os.path.join(ROOT, 'manifest.json'), 'w'), indent=2, ensure_ascii=False)
print(len(out), 'items;', sum(1 for o in out if o['usedIn']), 'used')
for o in out:
    if not o.get('route'):
        print('missing route', o['name'])
