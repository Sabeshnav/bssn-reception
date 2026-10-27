# usage: python3 pipeline.py <in.mp4> <name>   -> ../assets/<name>-vanakkam.mp4 (+ .webm) : colour | alpha, cropped to the person
import sys, os, glob, shutil, subprocess, numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
src, name = sys.argv[1], sys.argv[2]
d = f'work_{name}'; shutil.rmtree(d, ignore_errors=True); os.makedirs(f'{d}/f'); os.makedirs(f'{d}/out')
subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'scale=1280:720', f'{d}/f/%04d.png'], check=True)
F = sorted(glob.glob(f'{d}/f/*.png')); s = new_session('isnet-general-use')
masks = np.stack([np.asarray(remove(Image.open(f).convert('RGB'), session=s, only_mask=True), dtype=np.float32) / 255 for f in F])
sm = np.median(np.stack([np.roll(masks, 1, 0), masks, np.roll(masks, -1, 0)]), 0); sm[0], sm[-1] = masks[0], masks[-1]
ys, xs = np.where(sm.max(0) > 0.1)
pad = 24; x0 = max(0, xs.min() - pad); y0 = max(0, ys.min() - pad); x1 = min(1279, xs.max() + pad); y1 = 719
w = (x1 - x0 + 1) // 2 * 2; h = (y1 - y0 + 1) // 2 * 2
for i, f in enumerate(F):
    rgb = np.asarray(Image.open(f).convert('RGB'), dtype=np.float32); L = rgb.mean(2); a = sm[i]
    dil = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)), dtype=np.float32) / 255
    a = np.maximum(a, np.clip((L - 22) / 25, 0, 1) * dil); a = np.where(a < 0.04, 0, a)
    c = (rgb * a[..., None])[y0:y0 + h, x0:x0 + w]; al = a[y0:y0 + h, x0:x0 + w] * 255
    Image.fromarray(np.concatenate([c, np.repeat(al[..., None], 3, 2)], 1).clip(0, 255).astype(np.uint8)).save(f'{d}/out/{i:04d}.png')
    if i == len(F) - 1:
        rgba = np.dstack([np.where(a[..., None] > 0, rgb / np.maximum(a[..., None], 1e-3), 0)[y0:y0+h, x0:x0+w].clip(0, 255), al]).astype(np.uint8)
        bg = Image.new('RGBA', (w, h), (110, 20, 30, 255)); bg.alpha_composite(Image.fromarray(rgba, 'RGBA')); bg.convert('RGB').save(f'check_{name}.jpg', quality=90)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-framerate', '24', '-i', f'{d}/out/%04d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-preset', 'slow', '-movflags', '+faststart', '-an', f'../assets/{name}-vanakkam.mp4'], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-framerate', '24', '-i', f'{d}/out/%04d.png', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-pix_fmt', 'yuv420p', '-row-mt', '1', '-an', f'../assets/{name}-vanakkam.webm'], check=True)
print(name, 'crop', x0, y0, w, h, 'aspect', round(w / h, 4))
