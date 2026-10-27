import sys, asyncio
from playwright.async_api import async_playwright
VP = {'desk': (1440, 810, 1), 'phone': (390, 844, 2)}[sys.argv[1]]
PS = [float(x) for x in sys.argv[2].split(',')]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': VP[0], 'height': VP[1]}, device_scale_factor=VP[2])
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file:///home/claude/hero/dist/index.html'); await pg.wait_for_function('window.__olai')
        await pg.evaluate('window.__hero.seek(12); 0')
        for q in PS:
            await pg.evaluate(f'''(()=>{{const s=document.getElementById('olai');const top=s.offsetTop, tot=s.offsetHeight-innerHeight; scrollTo(0, top+{q}*tot); window.__olai.render({q}, true);}})(); 0''')
            await pg.wait_for_timeout(150)
            await pg.screenshot(path=f'/home/claude/hero/shots/ol_{sys.argv[1]}_{q:.2f}.png')
        print('errors', errs[:5])
        await b.close()
asyncio.run(main())
