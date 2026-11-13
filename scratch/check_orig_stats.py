import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    orig = f.read()

print("Original length:", len(orig))
print("Original contains edge=\"1\":", orig.count('edge="1"'))
print("Original contains vertex=\"1\":", orig.count('vertex="1"'))

