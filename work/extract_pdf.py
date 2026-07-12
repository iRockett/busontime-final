from pathlib import Path
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding="utf-8")

source = Path(r"C:\Users\Listek\Downloads\Założenia do strony www.busemnaczas.pl Wersja 1 08.07.2026.pdf")
reader = PdfReader(source)
print(f"pages={len(reader.pages)}")
for index, page in enumerate(reader.pages, 1):
    print(f"\n--- PAGE {index} ---\n")
    print(page.extract_text() or "")
