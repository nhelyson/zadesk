with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
print("ORIGINAL SAMPLE USE CASES & EDGES:")
ucs = re.findall(r'<mxCell id="uc_[^"]+"[^>]+>', orig)[:8]
for u in ucs:
    print(u)

edges = re.findall(r'<mxCell id="edge_[^"]+"[^>]+>', orig)[:8]
for e in edges:
    print(e)

