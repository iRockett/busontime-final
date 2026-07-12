from pathlib import Path
from PIL import Image

for name in ('renault-trafic-brazowy', 'renault-trafic-stalowy'):
    source = Path('public/assets') / f'{name}.png'
    Image.open(source).convert('RGB').save(
        source.with_suffix('.webp'), 'WEBP', quality=88, method=6
    )
