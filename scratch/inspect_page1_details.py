# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for d in root.findall("diagram"):
    if d.get("id") == "page-global":
        p1 = d
        break

print("=== PAGE 1 DIAGRAMME GLOBAL ===")
vertices = []
for c in p1.findall(".//mxCell"):
    if c.get("vertex") == "1":
        geo = c.find("mxGeometry")
        x = float(geo.get("x", 0))
        y = float(geo.get("y", 0))
        w = float(geo.get("width", 0))
        h = float(geo.get("height", 0))
        cid = c.get("id")
        val = c.get("value", "")
        # extract title
        import re
        m = re.search(r"<b[^>]*>([^<]+)</b>", val)
        cname = m.group(1) if m else cid
        vertices.append((cid, cname, x, y, w, h, c.get("style")))

vertices.sort(key=lambda v: (v[3], v[2])) # sort by y then x

for vid, cname, x, y, w, h, style in vertices:
    # get fill color and stroke color from style
    fill = ""
    stroke = ""
    for s in style.split(";"):
        if s.startswith("fillColor="): fill = s.split("=")[1]
        if s.startswith("strokeColor="): stroke = s.split("=")[1]
    print(f"{vid:<22} | {cname:<25} | ({x:5.0f}, {y:5.0f}, {w:5.0f}, {h:5.0f}) | fill:{fill} stroke:{stroke}")

edges = p1.findall(".//mxCell[@edge='1']")
print(f"\nTotal edges on Page 1: {len(edges)}")
for e in edges:
    eid = e.get("id")
    src = e.get("source")
    tgt = e.get("target")
    val = e.get("value", "").replace("\n", " ")
    print(f"Edge {eid:<10} | {src:<20} -> {tgt:<20} | {val}")
