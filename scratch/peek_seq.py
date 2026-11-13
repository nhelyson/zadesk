import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/japhet/Downloads/zadesk/zadesk_sequence_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'<mxCell[^>]*edge="1"[^>]*>.*?</mxCell>', text, re.DOTALL)
print(f"Total edges found in sequence diagram: {len(matches)}")
for m in matches[:4]:
    print("--- EDGE ---")
    print(m)
