import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    broken = f.read()

print("Broken length:", len(broken))
print("Broken contains edge=\"1\":", broken.count('edge="1"'))
print("Broken contains vertex=\"1\":", broken.count('vertex="1"'))
print("Broken cells with BOTH vertex=\"1\" and edge=\"1\":", broken.count('vertex="1" edge="1"'))

