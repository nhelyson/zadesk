with open('c:/Users/japhet/Downloads/zadesk/zadesk_complete_uml_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'<mxCell[^>]*edge="1"[^>]*>.*?</mxCell>', text, re.DOTALL)
print(f"Total edges found: {len(matches)}")
for m in matches[:4]:
    print("--- EDGE ---")
    print(m)

