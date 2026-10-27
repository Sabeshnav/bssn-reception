import sys, asyncio
from playwright.async_api import async_playwright
TIMES = [float(x) for x in sys.argv[2].split(',')]
VP = {'desk': (1440, 810), 'phone': (390, 844)}[sys.argv[1]]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': VP[0], 'height': VP[1]}, device_scale_factor=2 if sys.argv[1]=='phone' else 1)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/hero/dist/index.html')
        await pg.wait_for_function('window.__hero', timeout=15000)
        for t in TIMES:
            await pg.evaluate(f'window.__hero.seek({t}); 0')
            await pg.wait_for_timeout(120)
            await pg.screenshot(path=f'/home/claude/hero/shots/{sys.argv[1]}_{t:05.2f}.png')
        print('errors:', errs[:5])
        await b.close()
asyncio.run(main())
