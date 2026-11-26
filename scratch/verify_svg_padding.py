# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("Zadesk_Diagramme_Classes.svg")
root = tree.getroot()

# Check each class group
for g in root.findall(".//{http://www.w3.org/2000/svg}g"):
    gid = g.get("id", "")
    if gid.startswith("svg-"):
        cname = gid.replace("svg-", "")
        rect = g.find("{http://www.w3.org/2000/svg}rect")
        rx = float(rect.get("x"))
        ry = float(rect.get("y"))
        rw = float(rect.get("width"))
        rh = float(rect.get("height"))
        bottom_rect = ry + rh
        
        # Check all text elements inside g
        texts = g.findall("{http://www.w3.org/2000/svg}text")
        max_ty = max(float(t.get("y")) for t in texts)
        
        diff = bottom_rect - max_ty
        print(f"Class {cname:<25}: rect bottom={bottom_rect:6.1f}, last text y={max_ty:6.1f}, padding={diff:5.1f}px")
        if diff < 10:
            print(f"  WARNING: Tight or overflowing padding in {cname}!")

print("All classes verified!")
