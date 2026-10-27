# Per-glyph SVG paths for the names (Great Vibes), via fontTools.
import json, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
R = pathlib.Path(__file__).resolve().parent.parent
f = TTFont(R / 'node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff')
cmap, gs, hmtx, upm = f.getBestCmap(), f.getGlyphSet(), f['hmtx'], f['head'].unitsPerEm
S = 200 / upm
kern = {}
if 'kern' in f:
    for tb in f['kern'].kernTables: kern.update(tb.kernTable)
def build(text):
    x, out, bx = 0, [], [1e9, 1e9, -1e9, -1e9]
    names = [cmap[ord(c)] for c in text]
    for i, (c, gn) in enumerate(zip(text, names)):
        sp = SVGPathPen(gs); tp = TransformPen(sp, (S, 0, 0, -S, x, 0)); gs[gn].draw(tp)
        d = sp.getCommands()
        bp = BoundsPen(gs); gs[gn].draw(TransformPen(bp, (S, 0, 0, -S, x, 0)))
        if d and bp.bounds:
            x1, y1, x2, y2 = bp.bounds
            out.append({'ch': c, 'd': d, 'x1': x1, 'x2': x2})
            bx = [min(bx[0], x1), min(bx[1], y1), max(bx[2], x2), max(bx[3], y2)]
        adv = hmtx[gn][0]
        if i < len(names) - 1: adv += kern.get((gn, names[i + 1]), 0)
        x += adv * S
    pad = 14
    return {'text': text, 'glyphs': out, 'vb': [bx[0] - pad, bx[1] - pad, bx[2] - bx[0] + 2 * pad, bx[3] - bx[1] + 2 * pad]}
data = {'a': build('Bathri Sri'), 'b': build('Sri Nandhini')}
(R / 'src/names.json').write_text(json.dumps(data))
print(data['a']['vb'], data['b']['vb'], 'NaN' in json.dumps(data))
