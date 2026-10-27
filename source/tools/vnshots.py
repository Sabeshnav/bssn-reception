import sys, asyncio
from playwright.async_api import async_playwright
VP = {'desk': (1440, 810, 1), 'phone': (390, 844, 2)}[sys.argv[1]]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': VP[0], 'height': VP[1]}, device_scale_factor=VP[2])
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__venue')
        await pg.evaluate("document.querySelector('#venue iframe').removeAttribute('data-src'); document.querySelector('#venue iframe').dataset.src='about:blank'; 0")  # sandbox has no Google Maps access
        await pg.evaluate("(()=>{const s=document.getElementById('venue'); scrollTo(0, s.offsetTop);})(); 0")
        await pg.wait_for_timeout(3200)
        await pg.evaluate("document.querySelector('.vn-map').classList.remove('live'); 0")
        await pg.screenshot(path=f'/home/claude/hero/shots/vn_{sys.argv[1]}.png', full_page=False)
        if sys.argv[1] == 'phone':
            await pg.evaluate("scrollBy(0, 600); 0"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=f'/home/claude/hero/shots/vn_{sys.argv[1]}2.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())
