#!/usr/bin/env python3
"""Subtle 8 s looping version of the Field Notes 001 hero (same art as make-ai-enabler-hero.py).
Motion: amber HUD ring rotates and pulses, HUD labels type on, callout fades in, slow parallax drift
and a faint light flicker on the photo. Every value is periodic in the loop, so it repeats seamlessly.
Writes public/blog/images/ai-enabler-hero-loop.{webm,mp4} and ai-enabler-hero-loop-poster.{jpg,webp}.
Run from the repo root: python3 content/blog/art/make-ai-enabler-hero-loop.py  (needs Pillow, cairosvg, ffmpeg)"""
import importlib.util, math, pathlib, shutil, subprocess, tempfile
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('hero', HERE / 'make-ai-enabler-hero.py')
H0 = importlib.util.module_from_spec(spec); spec.loader.exec_module(H0)
AMBER, WHITE, GROUND, S = H0.AMBER, H0.WHITE, H0.GROUND, H0.S
mono, syne, spaced, corners = H0.mono, H0.syne, H0.spaced, H0.corners
OUT = H0.OUT
FPS, SECS = 24, 8
N = FPS * SECS
START = int(2.4 * FPS)  # the file starts with everything on screen, so the poster matches the static hero
W1, H1 = 1280, 720


def ease(x):
    x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)


def static_layers():
    """Vignette + callout shadow (under) and corners + bottom lockup (over), at 1x."""
    W, H = W1 * S, H1 * S
    under = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(under)
    for y in range(H):
        a = 0
        if y < 120 * S: a = int(150 * (1 - y / (120 * S)) ** 1.4)
        if y > H - 190 * S: a = max(a, int(225 * ((y - (H - 190 * S)) / (190 * S)) ** 1.3))
        if a: od.line([(0, y), (W, y)], fill=GROUND + (a,))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([270 * S, 395 * S, 600 * S, 540 * S], 40 * S, fill=GROUND + (150,))
    shadow = sh.filter(ImageFilter.GaussianBlur(28 * S))
    over = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(over)
    m = 34 * S
    corners(d, (m, m, W - m, H - m), 34 * S, 2 * S, WHITE + (200,))
    by = H - m - 18 * S
    d.line([(m + 18 * S, by - 64 * S), (W - m - 18 * S, by - 64 * S)], fill=WHITE + (90,), width=max(1, S))
    lg = H0.logo_white(150 * S); over.alpha_composite(lg, (m + 18 * S, by - lg.height))
    spaced(d, (m + 18 * S + lg.width + 26 * S, by - 30 * S), 'AI DOES THE PAPERWORK. PEOPLE DO THE WORK.', mono(15 * S, True), WHITE, 3 * S)
    spaced(d, (W - m - 18 * S, by - 30 * S), 'KR8TIV.AI', mono(15 * S, True), AMBER, 4 * S, anchor_right=True)
    sm = lambda im: im.resize((W1, H1), Image.LANCZOS)
    return sm(under), sm(shadow), sm(over)


def typed(d, xy, text, font, fill, sp, frac, anchor_right=False, cursor=True):
    n = int(round(len(text) * ease(frac) if frac < 1 else len(text)))
    full_w = sum(d.textlength(c, font=font) for c in text) + sp * (len(text) - 1)
    x, y = xy
    if anchor_right: x -= full_w
    for c in text[:n]:
        d.text((x, y), c, font=font, fill=fill); x += d.textlength(c, font=font) + sp
    if cursor and 0 < frac < 1.15:
        asc, desc = font.getmetrics()
        d.rectangle([x + sp, y + 2 * S, x + sp + 7 * S, y + asc], fill=AMBER + (220,))


def frame(i, base, under, shadow, over):
    t = i / N; sec = t * SECS; tau = 2 * math.pi
    # Photo: slow parallax drift on a 4% overscan, plus a faint flicker of the yard lights.
    dx = 10 * math.sin(tau * t); dy = 5 * math.sin(tau * t * 2 + 0.6)
    sc = 1.04
    cx, cy = base.width / 2 + dx, base.height / 2 + dy
    photo = base.transform((W1, H1), Image.AFFINE,
                           (1 / sc * base.width / W1, 0, cx - (W1 / 2) / sc * base.width / W1,
                            0, 1 / sc * base.height / H1, cy - (H1 / 2) / sc * base.height / H1), Image.BICUBIC)
    fl = 1 + 0.012 * math.sin(tau * t * 4) + 0.006 * math.sin(tau * t * 11 + 1.3)
    photo = ImageEnhance.Brightness(photo).enhance(fl).convert('RGBA')
    img = Image.alpha_composite(photo, under)
    # Text timing: labels type on 0.2 to 1.4 s, callout fades in 1.2 to 2.2 s, all fade out 7.4 to 8 s.
    out = 1 - ease((sec - 7.4) / 0.6)
    call = ease((sec - 1.2) / 1.0) * out
    sh = shadow.copy(); sh.putalpha(sh.split()[3].point(lambda v: int(v * (0.35 + 0.65 * call))))
    img = Image.alpha_composite(img, sh)
    Wd, Hd = W1 * S, H1 * S
    lay = Image.new('RGBA', (Wd, Hd), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    m = 34 * S; f = mono(13 * S)
    if out > 0:
        ta = int(255 * out)
        typed(d, (m + 18 * S, m + 6 * S), 'FIELD NOTES // 001', f, AMBER + (ta,), 3 * S, (sec - 0.2) / 0.8)
        typed(d, (Wd - m - 18 * S, m + 6 * S), 'EDMONTON, AB  53.5461 N  113.4938 W', f, WHITE + (int(210 * out),), 3 * S,
              (sec - 0.5) / 1.0, anchor_right=True)
    # HUD ring: arcs rotate one full turn per loop, radius and glow pulse twice per loop.
    rc = (700 * S, 505 * S); pulse = 0.5 + 0.5 * math.sin(tau * t * 2)
    r = int((92 + 2.5 * pulse) * S); rot = 360 * (t - START / N)
    glow = Image.new('RGBA', (Wd, Hd), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.ellipse([rc[0] - r, rc[1] - r, rc[0] + r, rc[1] + r], outline=AMBER + (int(70 + 70 * pulse),), width=9 * S)
    lay = Image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(9 * S)), lay); d = ImageDraw.Draw(lay)
    for a0, a1 in ((200, 290), (310, 345), (355, 40)):
        d.arc([rc[0] - r, rc[1] - r, rc[0] + r, rc[1] + r], a0 + rot, a1 + rot, fill=AMBER + (235,), width=3 * S)
    r2 = r + 14 * S
    for ang in range(0, 360, 10):
        if 50 < ang < 185: continue
        th = math.radians(ang); L = (9 if ang % 30 == 0 else 4) * S
        d.line([(rc[0] + r2 * math.cos(th), rc[1] + r2 * math.sin(th)),
                (rc[0] + (r2 + L) * math.cos(th), rc[1] + (r2 + L) * math.sin(th))], fill=WHITE + (150,), width=max(1, S))
    # Sweep ping: one expanding ring per half loop.
    for k in (0, 0.5):
        p = (t + k) % 1 * 2
        if p < 1:
            rp = r + int(46 * S * ease(p))
            d.ellipse([rc[0] - rp, rc[1] - rp, rc[0] + rp, rc[1] + rp], outline=AMBER + (int(120 * (1 - p)),), width=max(1, S))
    end = (rc[0] + r * math.cos(math.radians(198)), rc[1] + r * math.sin(math.radians(198)))
    if call > 0:
        ca = lambda v: int(v * call)
        lx, ly = 300 * S, 452 * S
        d.line([end, (lx + 250 * S, ly + 12 * S), (lx, ly + 12 * S)], fill=AMBER + (ca(230),), width=2 * S)
        d.ellipse([end[0] - 5 * S, end[1] - 5 * S, end[0] + 5 * S, end[1] + 5 * S], fill=AMBER + (ca(255),))
        yo = int((1 - call) * 10 * S)
        spaced(d, (lx, ly - 46 * S + yo), 'QUOTE STATUS', mono(12 * S), WHITE + (ca(170),), 3 * S)
        d.text((lx, ly - 28 * S + yo), 'Drafted by AI.', font=syne(22 * S, 700), fill=WHITE + (ca(255),))
        d.text((lx, ly + 22 * S + yo), 'Signed by a human.', font=syne(22 * S, 700), fill=AMBER + (ca(255),))
        d.text((lx, ly + 52 * S + yo), '(He has opinions about margins.)', font=mono(12 * S), fill=WHITE + (ca(190),))
    img = Image.alpha_composite(img, lay.resize((W1, H1), Image.LANCZOS))
    return Image.alpha_composite(img, over).convert('RGB')


def main(keep=None):
    base = Image.open(HERE / 'ai-enabler-base.jpg').convert('RGB')
    under, shadow, over = static_layers()
    tmp = pathlib.Path(keep or tempfile.mkdtemp(prefix='hero-loop-')); tmp.mkdir(parents=True, exist_ok=True)
    for i in range(N):
        im = frame((i + START) % N, base, under, shadow, over)
        im.save(tmp / f'f{i:04d}.png', compress_level=1)
        if i == 0:
            im.save(OUT / 'ai-enabler-hero-loop-poster.jpg', quality=84, optimize=True, progressive=True)
            im.save(OUT / 'ai-enabler-hero-loop-poster.webp', quality=80, method=6)
    src = ['-framerate', str(FPS), '-i', str(tmp / 'f%04d.png')]
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *src, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '27',
                    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an',
                    str(OUT / 'ai-enabler-hero-loop.mp4')], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *src, '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0',
                    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-pix_fmt', 'yuv420p', '-an',
                    str(OUT / 'ai-enabler-hero-loop.webm')], check=True)
    if not keep: shutil.rmtree(tmp)
    for p in ('mp4', 'webm'):
        print(p, (OUT / f'ai-enabler-hero-loop.{p}').stat().st_size)


if __name__ == '__main__':
    import sys; main(sys.argv[1] if len(sys.argv) > 1 else None)
