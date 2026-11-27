import subprocess, numpy as np, sys, glob
def load(path, sr=24000):
    raw = subprocess.run(['ffmpeg','-v','error','-i',path,'-ac','1','-ar',str(sr),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32), sr
x, sr = load('music/score_150s.mp3')
win = sr*2
db = [20*np.log10(np.sqrt(np.mean(x[i:i+win]**2))+1e-9) for i in range(0, len(x), win)]
print('score RMS dBFS per 2s:')
print(' '.join(f'{i*2}:{d:.0f}' for i,d in enumerate(db)))
print('peak', 20*np.log10(np.abs(x).max()))
for f in sorted(glob.glob('vo/*.mp3')):
    y, sr = load(f)
    env = np.convolve(np.abs(y), np.ones(480)/480, mode='same')
    thr = 10**(-40/20)
    idx = np.where(env > thr)[0]
    print(f, f'dur {len(y)/sr:.2f}  speech {idx[0]/sr:.2f}–{idx[-1]/sr:.2f}  ({(idx[-1]-idx[0])/sr:.2f}s)  peak {20*np.log10(np.abs(y).max()):.1f}')
