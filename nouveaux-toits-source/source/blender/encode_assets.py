"""Encode the original transparent Blender renders for browser delivery.

Run with a Python environment containing Pillow. Original PNGs are retained.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
renders = root / 'source' / 'renders'
delivery = root / 'dist' / 'assets'
delivery.mkdir(parents=True, exist_ok=True)
assets = {
    'hero-house.png': ('hero.webp', 91),
    'tile-cutout.png': ('tile-cutout.webp', 90),
    'material-cutout.png': ('material-cutout.webp', 90),
    'faucet-cutout.png': ('faucet-cutout.webp', 91),
}
for original, (output, quality) in assets.items():
    with Image.open(renders / original) as image:
        assert image.mode == 'RGBA', f'{original} must retain transparency'
        image.save(delivery / output, quality=quality, method=6)
        print(f'{output}: {image.size}, alpha={image.getchannel("A").getextrema()}')
