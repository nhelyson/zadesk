# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for idx, d in enumerate(root.findall("diagram")):
    pid = d.get("id")
    pname = d.get("name")
    cells = d.findall(".//mxCell")
    vertices = [c for c in cells if c.get("vertex") == "1"]
    edges = [c for c in cells if c.get("edge") == "1"]
    v_names = []
    for v in vertices:
        val = v.get("value", "")
        import re
        m = re.search(r"<b[^>]*>([^<]+)</b>", val)
        if m: v_names.append(m.group(1))
        else: v_names.append(v.get("id"))
    print(f"Page {idx+1}: {pname} (ID: {pid}) | {len(vertices)} classes: {', '.join(v_names)}")
