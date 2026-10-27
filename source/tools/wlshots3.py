import sys, asyncio
from playwright.async_api import async_playwright
VP = {'desk': (1440, 810, 1), 'phone': (390, 844, 2)}[sys.argv[1]]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': VP[0], 'height': VP[1]}, device_scale_factor=VP[2])
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__welcome')
        await pg.evaluate('window.__hero.seek(12); 0'); await pg.wait_for_timeout(600)
        for i in range(3):
            await pg.evaluate(f"(()=>{{const s=document.getElementById('welcome'); const tot=s.offsetHeight-innerHeight; scrollTo(0, s.offsetTop + tot*({i}+0.3)/3);}})(); 0")
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'/home/claude/hero/shots/w3_{sys.argv[1]}_{i}a.png')
            await pg.wait_for_timeout(3500)
            await pg.screenshot(path=f'/home/claude/hero/shots/w3_{sys.argv[1]}_{i}b.png')
        print('errors', errs[:5])
        await b.close()
asyncio.run(main())
