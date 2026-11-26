# -*- coding: utf-8 -*-
with open(r'C:\Users\japhet\Downloads\zalisk_cas_utilisation_A4_gateway_rag_zalisk.svg', 'r', encoding='utf-8') as f:
    content = f.read()

import re
pattern = r'<text\s+([^>]+)>(.*?)</text>'
matches = re.findall(pattern, content, re.DOTALL)
print(f"Total text elements: {len(matches)}")

for i in range(min(12, len(matches))):
    attrs, body = matches[i]
    print(f"[{i:2d}] {attrs} --> {body[:60]}")

print("\n--- ACTORS ---")
for i in range(len(matches) - 14, len(matches)):
    attrs, body = matches[i]
    print(f"[{i:2d}] {attrs} --> {body}")
