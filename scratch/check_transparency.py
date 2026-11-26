import re
from PIL import Image

with open('scratch/test_transparency.svg', encoding='utf-8') as f:
    text = f.read()

print('SVG background rect:', re.findall(r'<rect[^>]*fill=\"none\"', text) or 'No colored background')
im = Image.open('scratch/test_transparency.png')
print('PNG mode:', im.mode)
print('PNG top-left pixel (RGBA):', im.getpixel((0, 0)))
