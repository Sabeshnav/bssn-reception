import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
        await pg.goto('file:///home/claude/hero/dist/index.html'); await pg.wait_for_function('window.__hero')
        for t in [1.6, 2.4, 4.0, 9.5]:
            ms=await pg.evaluate(f'(()=>{{window.__prof={{}};const a=performance.now();for(let i=0;i<10;i++)window.__hero.seek({t}+i*0.01);return [(performance.now()-a)/10, JSON.stringify(Object.fromEntries(Object.entries(window.__prof).map(([k,v])=>[k,Math.round(v)/10])))]}})()')
            print(t, round(ms[0],1), ms[1], flush=True)
        await b.close()
asyncio.run(main())
