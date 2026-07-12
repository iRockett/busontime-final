from pathlib import Path
from PIL import Image, ImageEnhance

source = Path(r"C:\Users\Listek\Downloads\ChatGPT Image 11 lip 2026, 19_09_50.png")
out = Path('public/assets')
out.mkdir(parents=True, exist_ok=True)
image = Image.open(source).convert('RGB')
image.save(out / 'renault-trafic-hero.webp', 'WEBP', quality=88, method=6)

crops = [
    (0, 0, 1, 1), (0.28, 0.16, 0.94, 0.90), (0.38, 0.22, 0.90, 0.82),
    (0.05, 0.05, 0.72, 0.82), (0.48, 0.18, 0.98, 0.78), (0.18, 0.12, 0.83, 0.88),
]
for index, (left, top, right, bottom) in enumerate(crops, 1):
    w, h = image.size
    crop = image.crop((int(w*left), int(h*top), int(w*right), int(h*bottom)))
    crop = ImageEnhance.Contrast(crop).enhance(1 + index * 0.015)
    crop.thumbnail((1200, 900), Image.Resampling.LANCZOS)
    crop.save(out / f'gallery-{index:02}.webp', 'WEBP', quality=84, method=6)

concept = Path(r"C:\Users\Listek\.codex\generated_images\019f523e-136d-7f33-bf4d-58a4984822fc\exec-eff32f9a-9b8d-4c62-ad71-851d113447bf.png")
if concept.exists():
    Image.open(concept).convert('RGB').save(Path('work') / 'busemnaczas-concept.webp', 'WEBP', quality=88, method=6)
