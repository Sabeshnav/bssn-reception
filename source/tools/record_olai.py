# Preview of the olai section: scroll in (which triggers it), then step the timed sequence frame by frame.
import sys, asyncio, subprocess, os, shutil
from playwright.async_api import async_playwright
name, W, H, S = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])
FPS = 30
d = f'/home/claude/hero/rec_ol_{name}'; shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=S)
        await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__olai')
        await pg.evaluate('window.__hero.seek(12); 0')
        await pg.evaluate("(()=>{const s=document.getElementById('olai'); scrollTo(0, s.offsetTop);})(); 0")
        await pg.wait_for_timeout(200)
        dur = await pg.evaluate('window.__olai.duration')
        await pg.evaluate('window.__olai.finish(); 0')          # take over the clock for a deterministic capture
        n = int(FPS * (dur + 1.0))
        for i in range(n):
            await pg.evaluate(f'window.__olai.render(window.__olai.pAt({i / FPS}), true); 0')
            await pg.screenshot(path=f'{d}/f{i:04d}.jpg', type='jpeg', quality=90)
        await b.close()
asyncio.run(main())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.jpg', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', f'/home/claude/hero/dist/olai-preview-{name}.mp4'], check=True)
print('ok')
