# Bundle the hero into one self-contained HTML file (images + fonts inlined).
import base64, subprocess, pathlib, sys
R = pathlib.Path(__file__).parent
js = subprocess.run([str(R/'node_modules/.bin/esbuild'), str(R/'src/main.js'), '--bundle', '--format=iife', '--minify', '--target=es2020', '--loader:.json=json'],
                    capture_output=True, text=True, check=True).stdout
b64 = lambda p, mime: f"data:{mime};base64," + base64.b64encode((R/p).read_bytes()).decode()
for key, f in {'START': 'assets/leader-start.webp', 'END': 'assets/leader-end.webp', 'FLAG': 'assets/flag.webp', 'GROOM': 'assets/groom.webp', 'BRIDE': 'assets/bride.webp'}.items():
    js = js.replace(f'__IMG_{key}__', b64(f, 'image/webp'))
import os
TEST = os.environ.get('TESTWEBM') == '1'   # headless test Chromium has no H.264; real browsers get the MP4
js = js.replace('__VID_APPA__', base64.b64encode((R/('assets/appa-vanakkam.webm' if TEST else 'assets/appa-vanakkam.mp4')).read_bytes()).decode())
for k, n in (('AMMA', 'amma'), ('SIS', 'sister')): js = js.replace(f'__VID_{k}__', base64.b64encode((R/(f'assets/{n}-vanakkam.webm' if TEST else f'assets/{n}-vanakkam.mp4')).read_bytes()).decode())
if TEST: js = js.replace("type: 'video/mp4'", "type: 'video/webm'")
fs = R/'node_modules/@fontsource'
faces = [('Cinzel', 600, 'cinzel/files/cinzel-latin-600-normal.woff2', None), ('Cinzel', 700, 'cinzel/files/cinzel-latin-700-normal.woff2', None),
         ('Tiro Tamil', 400, 'tiro-tamil/files/tiro-tamil-tamil-400-normal.woff2', 'U+0B80-0BFF,U+200C-200D,U+25CC'), ('Tiro Tamil', 400, 'tiro-tamil/files/tiro-tamil-latin-400-normal.woff2', 'U+0000-00FF,U+2665'),
         ('Noto Serif Tamil', 400, 'noto-serif-tamil/files/noto-serif-tamil-tamil-400-normal.woff2', 'U+0B80-0BFF,U+200C-200D,U+25CC'),
         ('Noto Serif Tamil', 600, 'noto-serif-tamil/files/noto-serif-tamil-tamil-600-normal.woff2', 'U+0B80-0BFF,U+200C-200D,U+25CC'),
         ('Noto Serif Tamil', 700, 'noto-serif-tamil/files/noto-serif-tamil-tamil-700-normal.woff2', 'U+0B80-0BFF,U+200C-200D,U+25CC'),
         ('Noto Serif Tamil', 400, 'noto-serif-tamil/files/noto-serif-tamil-latin-400-normal.woff2', 'U+0000-00FF,U+2013'),
         ('Noto Serif Tamil', 600, 'noto-serif-tamil/files/noto-serif-tamil-latin-600-normal.woff2', 'U+0000-00FF,U+2013'),
         ('Arima', 700, 'arima/files/arima-tamil-700-normal.woff2', 'U+0B80-0BFF,U+200C-200D,U+25CC'),
         ('Arima', 700, 'arima/files/arima-latin-700-normal.woff2', 'U+0000-00FF')]
css = ''.join(f"@font-face{{font-family:'{n}';font-weight:{w};font-display:swap;src:url({b64(fs/p, 'font/woff2')}) format('woff2'){';unicode-range:'+u if u else ''}}}" for n, w, p, u in faces)
html = (R/'src/page.html').read_text().replace('/*FONTS*/', css).replace('/*INLINE_JS*/', js.replace('</script', '<\\/script'))
out = R/('dist/test.html' if TEST else 'dist/index.html'); out.parent.mkdir(exist_ok=True); out.write_text(html)
print(out, round(len(html)/1024), 'KB')
