# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

p1 = root.find(".//diagram[@id='page-global']")
print("P1 tag:", p1.tag, p1.get("name"))

model = p1.find("mxGraphModel")
print("Model attributes:", model.attrib)

cells = p1.findall(".//mxCell")
print(f"P1 cells: {len(cells)}")

for c in cells:
    if c.get("vertex") == "1":
        cid = c.get("id")
        val = c.get("value", "")
        style = c.get("style", "")
        geo = c.find("mxGeometry")
        x = geo.get("x")
        y = geo.get("y")
        w = geo.get("width")
        h = geo.get("height")
        # Extract title from HTML value if present
        first_line = val.split("\n")[0] if val else ""
        print(f"Vertex {cid:<20} at ({x}, {y}, {w}, {h}) | Style: {style[:40]}... | FirstLine: {first_line[:60]}")
