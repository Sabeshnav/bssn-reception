# Lalith e-invite: Bathri Sri & Sri Nandhini, wedding reception

E-invite website for the wedding reception of D. Bathri Sri and M. Sri Nandhini. Open `index.html`.

## Section 1: the hero, where the slash writes the names

What plays (about 8.6 seconds, starts on load):

1. **0–1.2 s, the stage builds**
   - The maroon silk wall fades in, with gold damask, a turning kolam mandala and the TVK flag waving softly.
   - The silk drapes slide in from the sides.
   - The mango-leaf thoranam drops in, the marigold and jasmine strands fall into place, and the brass kuthuvilakku lamps light up.
2. **1.2–2.5 s, Vijay's slash.** This is the same cut-out art and slash effect as the TVK site (`slash.js`, adapted from `leaderSlash.js`).
3. **2.2–3.3 s, the streak becomes a pen**
   - The gold stroke pulls in toward its tip.
   - The spark at the tip swings back across the screen with a gold ribbon trail.
   - Vijay rises to the top centre and gets smaller.
4. **3.3–6.9 s, the names are written**
   - "Bathri Sri" is written glyph by glyph. The pen traces each letter and embossed gold fills in behind it.
   - The pen then draws a gold heart, then writes "Sri Nandhini".
5. **Portraits land:** each one pops in with a gold burst and petals as its name finishes.
6. **About 7 s onwards**
   - The mandala glows brighter.
   - Petals rain gently.
   - The Tamil names, date and live countdown rise in.
   - A light sweeps across the gold names every few seconds.
   - A ↻ button replays the sequence.

**Layout:** on desktop it's portrait | names | portrait. On phones the names are stacked, with the two portraits on either side of the heart.

**Reduced motion:** visitors who have reduced motion turned on see the final state straight away.

## Section 2: the invitation on olai suvadi (scroll-triggered, then plays on its own)

When the section reaches the top of the screen, it plays a timed sequence of about 12 seconds (opening 2 s, writing 8.5 s, seal 1.6 s; `T_OPEN`, `T_WRITE` and `T_END` in `olai.js`). The section is pinned for 2.4 screens. Scrolling past finishes it instantly, and scrolling back above it resets it. For smoothness:
- the leaf shadows are baked into their canvases, not done with CSS filters;
- only lines that change are restyled;
- the stylus uses cached line positions, so it needs no layout reads per frame.

The sequence:
1. **The closed bundle.** It sits between carved rosewood covers with brass studs and a brass "உ" plate, tied with a red cord and knot.
2. **It opens.** The cord unwinds, the covers part (top up, bottom down), and five palm leaves fan out. The red cord runs through their holes and ends in a tassel.
3. **The stylus writes.** An iron stylus with a brass handle etches each line from left to right, with dark ink settling into the scratches. This covers:
   - the title;
   - "அன்புடையீர்," and the date and time;
   - the groom and bride, with the groom's parents;
   - the invitation paragraph, worded as on the family's printed card;
   - the date, time and venue;
   - the hosts and the sister.
4. **The finish.** A gold "சுபம்" seal is pressed, and an English summary line appears. On desktop the stack zooms out to show the whole card.

The leaves and covers are painted in code, with fibres, age spots, burnt edges and real punched holes. The text is real, selectable Tamil.

Content facts:
- Wedding reception, Wednesday 18.11.2026, 6:00 PM.
- City Square Convention Center (A/C), Vathalagundu Road, Pillaiyarnatham, Dindigul.
- Groom D. Bathri Sri, son of L. Dharmaraj and D. Jaya; sister D. Samuthira.
- Bride M. Sri Nandhini, daughter of the late (தெய்வத்திரு) Mutharasu and Muthu Kavitha.
- The Tamil date is பராபவ வருடம் கார்த்திகை மாதம் 02 ஆம் நாள், from the family's printed card.
- Initials are in English everywhere (L., D., M., T.), as the family asked.
- Appa's post is திண்டுக்கல் கிழக்கு மாவட்ட செயலாளர் · தமிழக வெற்றிக் கழகம், shown under his name in the welcome section.
- Font note: Arima breaks ஸ்ரீ into separate letters, so any text containing ஸ்ரீ uses Noto Serif Tamil or Tiro Tamil.

## Section 3: the family welcome (TVK leadership style)

The section is pinned, and each family member gets one screen of scroll, switching sideways with progress dots: Appa, then Amma, then the sister.

1. The stage waits, with slowly turning gold rays and a ring of light.
2. When it reaches the top, the person lands with the same stop-motion entry as the TVK leader: a white silhouette, a colour split and an overshoot. A burst of embers follows, then a breathing gold aura.
3. Their Higgsfield clip plays the vanakkam: a 5 s cut-out, with a matte made per frame.
4. As the palms meet (`meet`: Appa 1.7 s, Amma 1.15 s, sister 1.45 s), the copy slides in: the relation, the Tamil name, the English name and a welcome line in Tamil and English. The clip then holds on the vanakkam.

On phones the copy sits above the figure. Scrolling back above the section resets it, so it replays.

Per-person sizing: `--sc` (desktop) and `--scp` (phone) on each `.wl-figbox` even out the head sizes, because the clips are framed differently. The gold ring follows each person's head (`head` in `main.js`). Amma's clip has a small top fade (`tfade`), because her hair touches the top of the frame.

Clip format: `assets/<name>-vanakkam.mp4` is H.264, with the colour on the left half and the alpha matte on the right. A WebGL shader composites it, which works on iPhone and Android. Run `TESTWEBM=1 python3 build.py` to make `dist/test.html` with the VP9 copy, for headless Chromium (which has no H.264).

## Section 4: the venue

- **Venue:** City Square Convention Centre (A/C), Pillayarnattam, Dindigul 624002 (Plus Code 8WMM+92R).
- **Name and address:** in Tamil and English, with chips for "Wedding Reception · Wed 18 Nov 2026 · 6:00 PM".
- **Mandapam line art:** a gold drawing of the hall's entrance that draws itself when the section scrolls into view.
- **Map:** a live Google map (`maps.google.com …output=embed`, lazy-loaded) in a gold frame, with a pulsing ring on the pin. An illustrated map sits underneath, so the frame never looks empty.
- **Get directions:** opens Google Maps directions to the hall's place ID (`ChIJB90wFwCrADsRJBhvvu86ZuU`).
- **No Add to Calendar.** It was left out as asked.
- **Closing line:** "தங்கள் நல்வரவை அன்புடன் எதிர்நோக்கும் இருவீட்டார்".

## Section 5: closing title (the organiser)

This is a cinematic end card for **T. Lalith Kumar**, Madurai Zonal Co-ordinator, IT Wing (மதுரை மண்டல தகவல் தொழில் நுட்ப அணி ஒருங்கிணைப்பாளர்), who managed the website. It's in the same style as the closing title in the invitation video.

1. The heading "அன்புடன் வழங்குபவர் / Presented with love by" fades in.
2. The name tracks in letter by letter in embossed gold: each letter goes from blurred and widely spaced to sharp.
3. An anamorphic flare opens across the screen, gold dust drifts, and a light sweeps across the letters every few seconds.
4. The Tamil name, the post in English and Tamil, and a TVK colour band follow.

## Files

- `src/main.js`: the timeline (`T`), layout, the pen's path and the countdown. `WEDDING` is the reception start (18 Nov 2026, 6:00 PM IST) for the countdown.
- `src/slash.js`: Vijay's slash, with an added "retract" so the stroke turns into the pen, a vertical offset and the fade at the bottom of the bust.
- `src/backdrop.js`: the wall, mandala, waving flag, drapes and bokeh.
- `src/decor.js`: the thoranam, garland strands and lamps (marigold, jasmine and leaf sprites are painted in code).
- `src/frame.js`: the portrait medallion: marigold and rose ring, kemp-stone gold band, kalasam crest, jasmine drop and rim light.
- `src/olai.js`: the olai section: leaf and cover painting, the cord, line splitting, the stylus, and the scroll timeline.
- `src/welcome.js`: the family welcome: WebGL compositing of the clip, the entry, aura, embers, copy timing and the scroll carousel.
- `src/venue.js`: the venue reveal on scroll and lazy-loading of the map.
- `src/credit.js`: the closing title: letter split, reveal and the gold dust.
- `src/write.js`: the gold handwriting (per-glyph SVG trace, then embossed fill) and the heart.
- `src/fx.js`: the pen spark and trail, bursts, twinkles and petal rain. Everything is a pure function of time.
- `src/names.json`: glyph outlines of the names in Great Vibes. Rebuild it with `python3 tools/glyphs.py` if a name changes.
- `src/page.html`: markup and CSS.
- `assets/`: the cut-outs. `groom.webp` and `bride.webp` have their backgrounds removed and are warm-graded from the photos supplied.
- `build.py`: bundles everything into one self-contained `dist/index.html`. It needs `npm i` (esbuild and the @fontsource fonts).
- `tools/shots.py` and `tools/record.py`: screenshots and preview video. `window.__hero.seek(t)` shows any moment.

## Still to swap in


- **Welcome lines** for each person (Appa's is a draft).
- **Welcome lines** for Amma and the sister are drafts too. If Bathri is the elder brother, the sister's line can say அண்ணன்.
- To add a person: run `clip/pipeline.py <clip.mp4> <name>`, add a `.wl-person` block, add their entry in `createWelcome(...)`, and raise `--n` on `#welcome`.

- Better portrait photos, if Lalith sends them. The current photos are passport-style; drop new ones into `assets/` and rebuild.
- The Vijay artwork is the same signed painting used on the TVK site. Get the artist's OK before the link goes public.
