with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

import re
print("ORIGINAL XML SUMMARY:")
print("Length:", len(text))
actors = re.findall(r'<mxCell id="(actor_[^"]+)"[^>]+value="([^"]+)"', text)
print("Actors:", len(actors))
for a in actors:
    print(" ", a[0], "->", a[1][:40])

zones = re.findall(r'<mxCell id="(zone_[^"]+)"[^>]+value="([^"]+)"', text)
print("Zones:", len(zones))
for z in zones:
    print(" ", z[0], "->", z[1][:40])

ucs = re.findall(r'<mxCell id="(uc_[^"]+)"[^>]+value="([^"]+)"', text)
print("Use cases:", len(ucs))
for u in ucs:
    print(" ", u[0], "->", u[1][:40])

edges = re.findall(r'<mxCell id="(edge_[^"]+|gen_[^"]+|include_[^"]+|extend_[^"]+)"', text)
print("Edges:", len(edges))

