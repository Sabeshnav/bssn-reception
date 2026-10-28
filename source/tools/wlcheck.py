import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for (w, h) in [(1280, 560), (320, 568), (1280, 400), (360, 640)]:
            pg = await b.new_page(viewport={'width': w, 'height': h})
            await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__welcome')
            await pg.evaluate('window.__hero.seek(12); 0')
            await pg.evaluate("(()=>{const s=document.getElementById('welcome'); scrollTo(0, s.offsetTop+10);})(); 0")
            await pg.wait_for_timeout(5500)
            await pg.screenshot(path=f'/home/claude/hero/shots/wlc_{w}x{h}.png'); await pg.close()
        await b.close()
asyncio.run(main())
