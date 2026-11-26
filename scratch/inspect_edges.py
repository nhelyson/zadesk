# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for d in root.findall("diagram"):
    if d.get("id") == "page-global":
        p1 = d
        break

edges = p1.findall(".//mxCell[@edge='1']")
for e in edges[:5]:
    print("Edge ID:", e.get("id"))
    print("  Style:", e.get("style"))
    print("  Source:", e.get("source"), "Target:", e.get("target"))
    print("  Value:", e.get("value"))
    geo = e.find("mxGeometry")
    if geo is not None:
        pts = geo.findall("mxPoint")
        print("  Points:", [(p.get("x"), p.get("y"), p.get("as")) for p in pts])
        array = geo.find("Array")
        if array is not None:
            print("  Waypoints:", [(p.get("x"), p.get("y")) for p in array.findall("mxPoint")])
