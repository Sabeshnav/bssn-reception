import sys, asyncio, subprocess, os, shutil
from playwright.async_api import async_playwright
name, W, H, S = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])
FPS, DUR = 30, 10.5
d = f'/home/claude/hero/rec_{name}'; shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=S)
        await pg.goto('file:///home/claude/hero/dist/index.html'); await pg.wait_for_function('window.__hero')
        for i in range(int(FPS * DUR)):
            await pg.evaluate(f'window.__hero.seek({i / FPS}); 0')
            await pg.screenshot(path=f'{d}/f{i:04d}.jpg', type='jpeg', quality=92)
        await b.close()
asyncio.run(main())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{d}/f%04d.jpg', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', f'/home/claude/hero/dist/hero-preview-{name}.mp4'], check=True)
print('ok')
