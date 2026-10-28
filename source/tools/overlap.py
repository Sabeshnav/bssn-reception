# Overlap audit: for many viewport sizes, measure every text/picture block in each section and report collisions.
import asyncio, json, sys
from playwright.async_api import async_playwright
SIZES = [(1280,560),(1366,625),(1440,810),(1920,940),(1536,730),(1024,600),(1024,768),(800,600),(768,1024),(820,1180),
         (390,844),(360,640),(375,667),(412,915),(430,932),(320,568),(844,390),(667,375),(1280,400)]
JS_HERO = """(()=>{const H=document.getElementById('hero').getBoundingClientRect();
 const q=(s)=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom];};
 const items={na:q('#nameA svg.name-svg'),nb:q('#nameB svg.name-svg'),heart:q('.w'),groom:q('.pf.groom canvas'),bride:q('.pf.bride canvas'),ta:q('.meta .ta'),when:q('.meta .when'),count:q('.meta .count')};
 return {H:[H.left,H.top,H.right,H.bottom],items,k:getComputedStyle(document.getElementById('hero')).getPropertyValue('--k')};})()"""
JS_WL = """((i)=>{const st=document.querySelector('.wl-stage').getBoundingClientRect(); const p=document.querySelectorAll('.wl-person')[i];
 const c=p.querySelector('.wl-copy').getBoundingClientRect(), f=p.querySelector('.wl-figbox').getBoundingClientRect(), h=document.querySelector('.wl-head').getBoundingClientRect(), d=document.querySelector('.wl-dots').getBoundingClientRect();
 return {st:[st.left,st.top,st.right,st.bottom],copy:[c.left,c.top,c.right,c.bottom],fig:[f.left,f.top,f.right,f.bottom],head:[h.left,h.top,h.right,h.bottom],dots:[d.left,d.top,d.right,d.bottom]};})"""
def inter(a, b, tol=2):
    return a and b and min(a[2], b[2]) - max(a[0], b[0]) > tol and min(a[3], b[3]) - max(a[1], b[1]) > tol
async def main():
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for (w, h) in SIZES:
            pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
            await pg.goto('file:///home/claude/hero/dist/test.html'); await pg.wait_for_function('window.__credit')
            await pg.evaluate('window.__hero.seek(12); 0'); await pg.wait_for_timeout(150)
            r = await pg.evaluate(JS_HERO); it = r['items']; H = r['H']
            keys = list(it)
            for i in range(len(keys)):
                a = it[keys[i]]
                if a and (a[0] < H[0] - 1 or a[2] > H[2] + 1 or a[1] < H[1] - 1 or a[3] > H[3] + 1): fails.append(f'{w}x{h} hero: {keys[i]} outside screen {[round(x) for x in a]}')
                for j in range(i + 1, len(keys)):
                    if inter(a, it[keys[j]]): fails.append(f'{w}x{h} hero: {keys[i]} overlaps {keys[j]}')
            sd = await pg.evaluate("(()=>{const s=window.__hero.sides(); return s;})()")
            ww = w
            lamps = [[0, sd['lampTop'], sd['lamp'], h], [ww - sd['lamp'], sd['lampTop'], ww, h]]
            strands = [] if ww / h < 0.8 else [[0, 0, sd['strand'], sd['strandBottom']], [ww - sd['strand'], 0, ww, sd['strandBottom']]]
            for k_, a in it.items():
                for z in lamps:
                    if inter(a, z, 3): fails.append(f'{w}x{h} hero: {k_} overlaps a lamp')
                for z in strands:
                    if inter(a, z, 3): fails.append(f'{w}x{h} hero: {k_} overlaps a garland strand')
            await pg.screenshot(path=f'/home/claude/hero/shots/ov_hero_{w}x{h}.png')
            # welcome: each person
            for i in range(3):
                await pg.evaluate(f"(()=>{{const s=document.getElementById('welcome'); const tot=s.offsetHeight-innerHeight; scrollTo(0, s.offsetTop + tot*({i}+0.3)/3);}})(); 0")
                await pg.wait_for_timeout(250)
                q = await pg.evaluate(JS_WL + f'({i})')
                c, f, st, hd, dt = q['copy'], q['fig'], q['st'], q['head'], q['dots']
                fin = [f[0] + (f[2]-f[0]) * 0.06, f[1] + (f[3]-f[1]) * 0.02, f[2] - (f[2]-f[0]) * 0.06, f[3]]
                if inter(c, fin): fails.append(f'{w}x{h} welcome[{i}]: text overlaps figure')
                if inter(c, hd) or inter(c, dt): fails.append(f'{w}x{h} welcome[{i}]: text overlaps heading/dots')
                if c[1] < st[1] - 1 or c[3] > st[3] + 1: fails.append(f'{w}x{h} welcome[{i}]: text off screen {[round(x) for x in c]}')
                if i == 0: await pg.screenshot(path=f'/home/claude/hero/shots/ov_wl_{w}x{h}.png')
            # olai final card
            await pg.evaluate("(()=>{const s=document.getElementById('olai'); scrollTo(0, s.offsetTop);})(); 0"); await pg.wait_for_timeout(150)
            await pg.evaluate('window.__olai.finish(); 0'); await pg.wait_for_timeout(100)
            o = await pg.evaluate("""(()=>{const st=document.querySelector('.ol-stage').getBoundingClientRect(); const hd=document.querySelector('.ol-head').getBoundingClientRect();
               const L=[...document.querySelectorAll('.leaf')].map(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]}); const en=document.querySelector('.ol-en').getBoundingClientRect();
               const ho=+getComputedStyle(document.querySelector('.ol-head > *')).opacity;
               return {st:[st.left,st.top,st.right,st.bottom],hd:[hd.left,hd.top,hd.right,hd.bottom],L,en:[en.left,en.top,en.right,en.bottom],ho};})()""")
            for a_ in range(len(o['L'])):
                for b_ in range(a_ + 1, len(o['L'])):
                    if inter(o['L'][a_], o['L'][b_], 3): fails.append(f'{w}x{h} olai: leaves {a_},{b_} overlap')
            if o['ho'] > 0.05 and inter(o['hd'], o['L'][0]): fails.append(f'{w}x{h} olai: heading overlaps first leaf')
            if o['en'][3] > o['st'][3] + 1: fails.append(f'{w}x{h} olai: card runs off the bottom')
            await pg.screenshot(path=f'/home/claude/hero/shots/ov_ol_{w}x{h}.png')
            # venue + credit (after the closing title has revealed)
            await pg.evaluate("(()=>{const s=document.getElementById('credit'); scrollTo(0, s.offsetTop);})(); 0"); await pg.wait_for_timeout(3200)
            v = await pg.evaluate("""(()=>{const a=document.querySelector('.vn-copy').getBoundingClientRect(),m=document.querySelector('.vn-map').getBoundingClientRect(),n=document.querySelector('.cr-name'),b=document.querySelector('.cr-box').getBoundingClientRect();
               return {a:[a.left,a.top,a.right,a.bottom],m:[m.left,m.top,m.right,m.bottom],nw:n.scrollWidth,cw:document.documentElement.clientWidth,nl:n.getBoundingClientRect().left,nr:n.getBoundingClientRect().right,dw:document.documentElement.scrollWidth};})()""")
            if inter(v['a'], v['m']): fails.append(f'{w}x{h} venue: text overlaps map')
            if v['nl'] < -1 or v['nr'] > v['cw'] + 1: fails.append(f'{w}x{h} credit: name runs off screen')
            if v['dw'] > v['cw'] + 1: fails.append(f'{w}x{h} page scrolls sideways ({v["dw"]} > {v["cw"]})')
            print(f'{w}x{h} k={r["k"].strip()}', flush=True)
            await pg.close()
        await b.close()
    print('\n'.join(fails) if fails else 'NO OVERLAPS')
asyncio.run(main())
