with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    orig = f.read()

import re
print("ORIGINAL SAMPLE CELLS:")
cells = re.findall(r'<mxCell[^>]+>', orig)[:15]
for c in cells:
    print(c)

