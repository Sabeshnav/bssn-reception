import sys, asyncio
from playwright.async_api import async_playwright
VP = {'desk': (1440, 810, 1), 'phone': (390, 844, 2)}[sys.argv[1]]
TS = [float(x) for x in sys.argv[2].split(',')]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': VP[0], 'height': VP[1]}, device_scale_factor=VP[2])
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__welcome')
        await pg.evaluate('window.__hero.seek(12); 0')
        await pg.wait_for_timeout(800)
        await pg.evaluate("(()=>{const s=document.getElementById('welcome'); scrollTo(0, s.offsetTop + 10);})(); 0")
        start = await pg.evaluate('performance.now()')
        for t in TS:
            el = await pg.evaluate('performance.now()')
            wait = t * 1000 - (el - start)
            if wait > 0: await pg.wait_for_timeout(wait)
            await pg.screenshot(path=f'/home/claude/hero/shots/wl_{sys.argv[1]}_{t:04.1f}.png')
        print('errors', errs[:5], await pg.evaluate("[window.__welcome.people[0].video.readyState, window.__welcome.people[0].video.currentTime, window.__welcome.people[0].state]"))
        await b.close()
asyncio.run(main())
