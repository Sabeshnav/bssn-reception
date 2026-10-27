import sys, asyncio, os, glob, shutil, subprocess
from playwright.async_api import async_playwright
name, W, H = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
d = f'/home/claude/hero/rec_wl_{name}'; shutil.rmtree(d, ignore_errors=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, record_video_dir=d, record_video_size={'width': W, 'height': H})
        pg = await ctx.new_page()
        await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__welcome')
        await pg.evaluate('window.__hero.seek(12); 0')
        await pg.evaluate("(()=>{const s=document.getElementById('welcome'); scrollTo(0, s.offsetTop - innerHeight);})(); 0")
        await pg.wait_for_timeout(1200)
        for i in range(3):
            await pg.evaluate(f"(()=>{{const s=document.getElementById('welcome'); const tot=s.offsetHeight-innerHeight; scrollTo({{top:s.offsetTop + tot*({i}+0.3)/3, behavior:'smooth'}});}})(); 0")
            await pg.wait_for_timeout(5600)
        await ctx.close(); await b.close()
asyncio.run(main())
src = glob.glob(f'{d}/*.webm')[0]
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '2.2', '-i', src, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', f'/home/claude/hero/dist/welcome-preview-{name}.mp4'], check=True)
print('ok')
