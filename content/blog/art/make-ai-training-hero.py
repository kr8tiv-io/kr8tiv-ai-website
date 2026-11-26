#!/usr/bin/env python3
"""Brands the employee AI training hero photo for kr8tiv.ai Field Notes.
Base photo: ai-training-base.jpg. Logo: kr8tiv-logo-clean.svg only, solid white.
Brand kit: #050510 ground, #d4a853 amber, white HUD lines, Syne + JetBrains Mono.
Writes public/blog/images/ai-training-hero-{768,1280}.{avif,webp,jpg} and ai-training-og.jpg.
Run from the repo root: python3 content/blog/art/make-ai-enabler-hero.py  (needs Pillow, cairosvg)"""
import io, math, pathlib
import cairosvg
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
OUT = ROOT / 'public' / 'blog' / 'images'
AMBER = (212, 168, 83); WHITE = (255, 255, 255); GROUND = (5, 5, 16)
S = 2  # supersample


def logo_white(width):
    png = cairosvg.svg2png(url=str(HERE / 'kr8tiv-logo-clean.svg'), output_width=width * 2)
    lg = Image.open(io.BytesIO(png)).convert('RGBA')
    lg = lg.crop(lg.getbbox())
    solid = Image.new('RGBA', lg.size, WHITE + (0,)); solid.putalpha(lg.split()[3])
    return solid.resize((width, round(lg.height * width / lg.width)), Image.LANCZOS)


def mono(sz, bold=False):
    return ImageFont.truetype(str(HERE / 'fonts' / ('JetBrainsMono-Bold.ttf' if bold else 'JetBrainsMono-Regular.ttf')), sz)


def syne(sz, wt=700):
    f = ImageFont.truetype(str(HERE / 'fonts' / 'Syne.ttf'), sz)
    try: f.set_variation_by_axes([wt])
    except Exception: pass
    return f


def spaced(d, xy, text, font, fill, sp, anchor_right=False):
    w = sum(d.textlength(c, font=font) for c in text) + sp * (len(text) - 1)
    x, y = xy
    if anchor_right: x -= w
    for c in text:
        d.text((x, y), c, font=font, fill=fill); x += d.textlength(c, font=font) + sp
    return w


def corners(d, box, L, w, fill):
    x0, y0, x1, y1 = box
    for (x, y, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        d.line([(x, y), (x + dx * L, y)], fill=fill, width=w)
        d.line([(x, y), (x, y + dy * L)], fill=fill, width=w)


def shade(img, box_alpha):
    """box_alpha: list of (gradient fn) applied as dark ground overlay."""
    return img


def hud_ring(d, c, r, w):
    cx, cy = c
    # Broken HUD ring: three amber arcs plus tick marks, like the site's HudRing.
    for a0, a1 in ((200, 290), (310, 345), (355, 40)):
        d.arc([cx - r, cy - r, cx + r, cy + r], a0, a1, fill=AMBER + (235,), width=w)
    r2 = r + 14 * S
    for a in range(0, 360, 10):
        if 50 < a < 185: continue
        t = math.radians(a); L = (9 if a % 30 == 0 else 4) * S
        d.line([(cx + r2 * math.cos(t), cy + r2 * math.sin(t)), (cx + (r2 + L) * math.cos(t), cy + (r2 + L) * math.sin(t))],
               fill=WHITE + (150,), width=max(1, S))
    return (cx + r * math.cos(math.radians(198)), cy + r * math.sin(math.radians(198)))


def hero():
    base = Image.open(HERE / 'ai-training-base.jpg').convert('RGB')
    W, H = base.size[0] * S, base.size[1] * S
    img = base.resize((W, H), Image.LANCZOS).convert('RGBA')
    # Ground-colour vignette: top band and bottom band for the HUD type, a touch on the left.
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for y in range(H):
        a = 0
        if y < 120 * S: a = int(150 * (1 - y / (120 * S)) ** 1.4)
        if y > H - 190 * S: a = max(a, int(225 * ((y - (H - 190 * S)) / (190 * S)) ** 1.3))
        if a: od.line([(0, y), (W, y)], fill=GROUND + (a,))
    img = Image.alpha_composite(img, ov)
    # Soft ground-colour shadow behind the callout so the type reads.
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([90 * S, 370 * S, 470 * S, 520 * S], 40 * S, fill=GROUND + (150,))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(28 * S)))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    m = 34 * S
    corners(d, (m, m, W - m, H - m), 34 * S, 2 * S, WHITE + (200,))
    f = mono(13 * S)
    spaced(d, (m + 18 * S, m + 6 * S), 'FIELD NOTES // 002', f, AMBER, 3 * S)
    spaced(d, (W - m - 18 * S, m + 6 * S), 'EDMONTON, AB  53.5461 N  113.4938 W', f, WHITE + (210,), 3 * S, anchor_right=True)
    # HUD ring on the skeptic, with a callout to the left
    end = hud_ring(d, (912 * S, 300 * S), 74 * S, 3 * S)
    lx, ly = 120 * S, 432 * S
    d.line([end, (lx + 330 * S, ly + 12 * S), (lx, ly + 12 * S)], fill=AMBER + (230,), width=2 * S)
    d.ellipse([end[0] - 5 * S, end[1] - 5 * S, end[0] + 5 * S, end[1] + 5 * S], fill=AMBER)
    spaced(d, (lx, ly - 46 * S), 'SKEPTIC STATUS', mono(12 * S), WHITE + (170,), 3 * S)
    d.text((lx, ly - 28 * S), 'Arms crossed.', font=syne(22 * S, 700), fill=WHITE)
    d.text((lx, ly + 22 * S), 'Grinning anyway.', font=syne(22 * S, 700), fill=AMBER)
    d.text((lx, ly + 52 * S), '(Give him twenty minutes.)', font=mono(12 * S), fill=WHITE + (190,))
    # Bottom lockup: rule, logo, line, url
    by = H - m - 18 * S
    d.line([(m + 18 * S, by - 64 * S), (W - m - 18 * S, by - 64 * S)], fill=WHITE + (90,), width=max(1, S))
    lg = logo_white(150 * S)
    lay.alpha_composite(lg, (m + 18 * S, by - lg.height))
    spaced(d, (m + 18 * S + lg.width + 26 * S, by - 30 * S), 'IF YOU CAN TALK INTO A PHONE, YOU CAN DO THIS.', mono(15 * S, True), WHITE, 3 * S)
    spaced(d, (W - m - 18 * S, by - 30 * S), 'KR8TIV.AI', mono(15 * S, True), AMBER, 4 * S, anchor_right=True)
    img = Image.alpha_composite(img, lay).convert('RGB')
    return img.resize((W // S, H // S), Image.LANCZOS)


def og(base_hero_src):
    base = Image.open(HERE / 'ai-training-base.jpg').convert('RGB')
    W, H = 1200 * S, 630 * S
    img = base.resize((W, round(base.height * W / base.width)), Image.LANCZOS)
    top = (img.height - H) // 2 - 0
    img = img.crop((0, top, W, top + H)).convert('RGBA')
    ov = Image.new('RGBA', (W, H)); od = ImageDraw.Draw(ov)
    for x in range(W):
        a = int(max(0, min(1, (780 * S - x) / (780 * S))) ** 1.25 * 238)
        od.line([(x, 0), (x, H)], fill=GROUND + (a,))
    for y in range(H - 120 * S, H):
        a = int(200 * ((y - (H - 120 * S)) / (120 * S)) ** 1.3)
        od.line([(0, y), (W, y)], fill=GROUND + (a,))
    img = Image.alpha_composite(img, ov)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    m = 28 * S
    corners(d, (m, m, W - m, H - m), 30 * S, 2 * S, WHITE + (200,))
    lg = logo_white(200 * S); lay.alpha_composite(lg, (64 * S, 62 * S))
    spaced(d, (W - m - 16 * S, m + 8 * S), 'FIELD NOTES // 002', mono(14 * S), AMBER, 3 * S, anchor_right=True)
    spaced(d, (66 * S, 190 * S), 'EDMONTON, ALBERTA', mono(17 * S), AMBER, 4 * S)
    y = 226 * S
    for line in ["Why AI training", "for employees", "matters."]:
        d.text((62 * S, y), line, font=syne(56 * S, 700), fill=WHITE); y += 64 * S
    d.text((64 * S, y + 18 * S), 'Fun, hands-on, skeptic-approved.', font=syne(26 * S, 600), fill=WHITE)
    d.text((64 * S, y + 52 * S), 'Training teams all over Canada.', font=syne(26 * S, 600), fill=AMBER)
    hud_ring(d, (853 * S, 288 * S), 72 * S, 3 * S)
    by = H - m - 16 * S
    spaced(d, (64 * S, by - 22 * S), 'IF YOU CAN TALK INTO A PHONE, YOU CAN DO THIS.', mono(15 * S, True), WHITE, 3 * S)
    spaced(d, (W - m - 16 * S, by - 22 * S), 'KR8TIV.AI', mono(15 * S, True), AMBER, 4 * S, anchor_right=True)
    img = Image.alpha_composite(img, lay).convert('RGB')
    return img.resize((1200, 630), Image.LANCZOS)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    h = hero()
    for w in (1280, 768):
        im = h if w == h.width else h.resize((w, round(w * h.height / h.width)), Image.LANCZOS)
        im.save(OUT / f'ai-training-hero-{w}.avif', quality=62)
        im.save(OUT / f'ai-training-hero-{w}.webp', quality=82, method=6)
        im.save(OUT / f'ai-training-hero-{w}.jpg', quality=86, optimize=True, progressive=True)
    og(h).save(OUT / 'ai-training-og.jpg', quality=88, optimize=True, progressive=True)
    print('wrote', sorted(p.name for p in OUT.glob('ai-training-*')))


if __name__ == '__main__':
    main()
