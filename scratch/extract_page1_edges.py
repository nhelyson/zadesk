# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import json

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for d in root.findall("diagram"):
    if d.get("id") == "page-global":
        p1 = d
        break

edges = []
for c in p1.findall(".//mxCell[@edge='1']"):
    eid = c.get("id")
    src = c.get("source")
    tgt = c.get("target")
    val = c.get("value", "")
    style = c.get("style", "")
    edges.append({
        "id": eid,
        "source": src,
        "target": tgt,
        "value": val,
        "style": style
    })

with open(r"scratch\extracted_page1_edges.json", "w", encoding="utf-8") as f:
    json.dump(edges, f, indent=2)

print(f"Extracted {len(edges)} edges to scratch/extracted_page1_edges.json")
