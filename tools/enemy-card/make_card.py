"""Enemy card maker: puts boss art on the Deadly Assault "WARNING" card.

The look matches the game's boss cards: a red → orange → green halftone
background, a big WARNING across the top, an orange rounded frame, and an
optional Ethereal or Machine badge in the corner.

Give it the boss art on a plain black background (the in-game art you get
from screenshots or the wiki works). Black around the boss is cut away; dark
parts inside the boss stay.

    python3 tools/enemy-card/make_card.py ART.jpg public/enemies/da-X-1.webp
    python3 tools/enemy-card/make_card.py ART.jpg OUT.webp --badge ethereal
    python3 tools/enemy-card/make_card.py ART.jpg OUT.webp --size adversity --dy 34

Options
    --size      boss (288×410, default), adversity (200×276), or WxH
    --badge     ethereal, machine or none (default)
    --dy        how far down the art starts, in card pixels (default 50,
                so WARNING shows above the boss's head)
    --dx        nudge the art left (−) or right (+)
    --scale     1.0 fills the card's width; larger zooms in
    --threshold how dark counts as background (default 20 of 255)
    --blank     write just the background (no art); ART is then ignored

Needs Pillow, numpy and scipy (pip install pillow numpy scipy) and the Inter
Display Black font (falls back to any bold font).
"""
import argparse
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
K = 4  # drawn at 4× and scaled down, for clean edges
SIZES = {'boss': (288, 410), 'adversity': (200, 276)}


def font_path():
    try:
        return subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter Display:style=Black']).decode()
    except Exception:
        return 'DejaVuSans-Bold.ttf'


def background(W, H):
    w, h = W * K, H * K
    s = W / 306
    stops = [(0, (226, 78, 88)), (0.33, (206, 118, 74)), (0.62, (142, 128, 72)), (1, (92, 150, 106))]
    y = np.linspace(0, 1, h)[:, None]
    col = np.zeros((h, 1, 3))
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        m = (y >= a) & (y <= b)
        t = np.clip((y - a) / (b - a), 0, 1)
        col = np.where(m[..., None], np.array(ca) * (1 - t[..., None]) + np.array(cb) * t[..., None], col)
    img = np.repeat(col, w, axis=1)
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.hypot((xx - w * 0.5) / w, (yy - h * 0.55) / h)
    img = img * (1 + 0.12 * np.clip(1 - d * 2, 0, 1))[..., None]
    # Halftone dots
    sp, r = 5.2 * K * s, 1.05 * K * s
    dots = np.hypot((xx % sp) - sp / 2, (yy % sp) - sp / 2) < r
    img = np.where(dots[..., None], img * 0.72, img)
    im = Image.fromarray(np.clip(img, 0, 255).astype('uint8')).convert('RGBA')
    # WARNING, squeezed tall like the game's
    font = ImageFont.truetype(font_path(), int(150 * K * s))
    tw = Image.new('L', (int(1400 * K * s), int(200 * K * s)), 0)
    ImageDraw.Draw(tw).text((0, 0), 'WARNING', font=font, fill=255)
    tw = tw.crop(tw.getbbox()).resize((int(272 * K * s), int(78 * K * s)), Image.LANCZOS)
    blk = Image.new('RGBA', tw.size, (22, 20, 22, 255))
    blk.putalpha(tw.point(lambda v: int(v * 0.92)))
    im.alpha_composite(blk, (int(17 * K * s), int(20 * K * s)))
    return im


def frame(im, W):
    w, h = im.size
    s = W / 306
    r = int(15 * K * s)
    glow = Image.new('L', (w, h), 0)
    ImageDraw.Draw(glow).rounded_rectangle((0, 0, w - 1, h - 1), r, outline=255, width=int(10 * K * s))
    gl = Image.new('RGBA', (w, h), (255, 120, 80, 0))
    gl.putalpha(glow.filter(ImageFilter.GaussianBlur(6 * K * s)).point(lambda v: int(v * 0.55)))
    im.alpha_composite(gl)
    bd = Image.new('L', (w, h), 0)
    ImageDraw.Draw(bd).rounded_rectangle((0, 0, w - 1, h - 1), r, outline=255, width=int(4.5 * K * s))
    g = np.linspace(0, 1, h)[:, None, None]
    c = np.array((242, 82, 92)) * (1 - g) + np.array((255, 122, 72)) * g
    bc = Image.fromarray(np.repeat(c, w, axis=1).astype('uint8')).convert('RGBA')
    bc.putalpha(bd)
    im.alpha_composite(bc)
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    im.putalpha(m)
    return im


def cutout(path, thr):
    """Cuts away black that touches the edge of the image; keeps dark parts inside the boss."""
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(int)
    lab, _ = ndimage.label(a.max(axis=2) < thr)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    alpha = np.where(np.isin(lab, list(edge)), 0, 255).astype('uint8')
    al = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    out = im.convert('RGBA')
    out.putalpha(al)
    return out


def place(card, art, W, scale, dx, dy):
    w, h = card.size
    s = max(w / art.width, h / art.height) * scale
    a = art.resize((int(art.width * s), int(art.height * s)), Image.LANCZOS)
    # Fade the art's top edge so the cut doesn't show as a straight line.
    f = int(46 * K * W / 306)
    ramp = np.ones((a.height, 1))
    ramp[:f, 0] = np.linspace(0, 1, f) ** 1.6
    a.putalpha(Image.fromarray((np.asarray(a.getchannel('A')).astype(float) * ramp).astype('uint8')))
    x, y = (w - a.width) // 2 + int(dx * K), int(dy * K)
    sh = Image.new('RGBA', a.size, (0, 0, 0, 0))
    sh.putalpha(a.getchannel('A').point(lambda v: int(v * 0.35)).filter(ImageFilter.GaussianBlur(8 * K)))
    card.alpha_composite(sh, (x + 4 * K, y + 6 * K))
    card.alpha_composite(a, (x, y))


def badge(card, name, W):
    b = Image.open(os.path.join(HERE, f'badge-{name}.png')).convert('RGBA')
    s = W / 306
    size = int(80 * K * s)
    b = b.resize((size, size), Image.LANCZOS)
    w, h = card.size
    card.alpha_composite(b, (w - size - int(14 * K * s), h - size - int(14 * K * s)))


def main():
    p = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    p.add_argument('art')
    p.add_argument('out')
    p.add_argument('--size', default='boss')
    p.add_argument('--badge', default='none', choices=['none', 'ethereal', 'machine'])
    p.add_argument('--dy', type=float, default=50)
    p.add_argument('--dx', type=float, default=0)
    p.add_argument('--scale', type=float, default=1.0)
    p.add_argument('--threshold', type=int, default=20)
    p.add_argument('--blank', action='store_true')
    o = p.parse_args()
    W, H = SIZES.get(o.size) or tuple(int(v) for v in o.size.lower().split('x'))
    card = background(W, H)
    if not o.blank:
        place(card, cutout(o.art, o.threshold), W, o.scale, o.dx, o.dy)
    if o.badge != 'none':
        badge(card, o.badge, W)
    frame(card, W).resize((W, H), Image.LANCZOS).save(o.out, quality=92, method=6)
    print('Saved', o.out, f'{W}×{H}')


if __name__ == '__main__':
    main()
