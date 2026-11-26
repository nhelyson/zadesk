import re

with open(r'C:\Users\japhet\Downloads\zalisk_cas_utilisation_A4_gateway_rag_zalisk.svg', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all text elements with their coordinates and tspans
pattern = r'<text\s+([^>]+)>(.*?)</text>'
matches = re.findall(pattern, content, re.DOTALL)

print(f"Total text elements found: {len(matches)}")
for i, (attrs, body) in enumerate(matches):
    tspans = re.findall(r'<tspan[^>]*>(.*?)</tspan>', body)
    if tspans:
        print(f"[{i:2d}] TSPANS: {' | '.join(tspans)} (attrs: {attrs})")
    else:
        print(f"[{i:2d}] TEXT: {body.strip()} (attrs: {attrs})")
