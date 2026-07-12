from PIL import Image

Image.open('public/assets/busemnaczas-hero-brand.png').convert('RGB').save(
    'public/assets/busemnaczas-hero-brand.webp', 'WEBP', quality=90, method=6
)
