from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
icons_dir = root / "public" / "icons"
icons_dir.mkdir(parents=True, exist_ok=True)

for size in (192, 512):
    image = Image.new("RGBA", (size, size), "#f8f8f1")
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle(
        (20, 20, size - 20, size - 20),
        radius=size // 12,
        fill="#0f172a",
    )
    draw.rounded_rectangle(
        (size // 4, size // 4, size * 3 // 4, size * 3 // 4),
        radius=size // 16,
        fill="#f5c66f",
    )
    draw.polygon(
        [(size // 2, size // 5), (size * 3 // 5, size * 2 // 3), (size * 2 // 5, size * 2 // 3)],
        fill="#f8f8f1",
    )

    image.save(icons_dir / f"icon-{size}.png")

print(f"Created PWA icons in {icons_dir}")
