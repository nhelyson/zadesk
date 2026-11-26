# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for d in root.findall("diagram"):
    if d.get("id") == "page-global":
        p1 = d
        break

classes = []
for c in p1.findall(".//mxCell[@vertex='1']"):
    geo = c.find("mxGeometry")
    cid = c.get("id")
    x = float(geo.get("x", 0))
    y = float(geo.get("y", 0))
    w = float(geo.get("width", 0))
    h = float(geo.get("height", 0))
    classes.append((cid, x, y, w, h))

classes.sort(key=lambda item: (item[2], item[1]))

print("Sorted by Y then X:")
for cid, x, y, w, h in classes:
    print(f"{cid:<25} x={x:<6.0f} y={y:<6.0f} w={w:<6.0f} h={h:<6.0f}")
