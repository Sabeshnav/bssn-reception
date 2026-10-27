import sys, asyncio
from playwright.async_api import async_playwright
VP = {'desk': (1440, 810, 1), 'phone': (390, 844, 2)}[sys.argv[1]]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': VP[0], 'height': VP[1]}, device_scale_factor=VP[2])
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__credit')
        await pg.evaluate("document.querySelector('#venue iframe').dataset.src='about:blank'; 0")
        await pg.evaluate("(()=>{const s=document.getElementById('credit'); scrollTo(0, s.offsetTop);})(); 0")
        for t in (0.6, 1.4, 4.0):
            await pg.wait_for_timeout(int(t * 1000) if t == 0.6 else 1500 if t == 1.4 else 2600)
            await pg.screenshot(path=f'/home/claude/hero/shots/cr_{sys.argv[1]}_{t}.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())
