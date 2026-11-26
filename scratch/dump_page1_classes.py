# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import re

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for d in root.findall("diagram"):
    if d.get("id") == "page-global":
        p1 = d
        break

classes_info = []

for c in p1.findall(".//mxCell"):
    if c.get("vertex") == "1":
        cid = c.get("id")
        val = c.get("value", "")
        style = c.get("style", "")
        geo = c.find("mxGeometry")
        x = float(geo.get("x", 0))
        y = float(geo.get("y", 0))
        w = float(geo.get("width", 0))
        h = float(geo.get("height", 0))
        
        # parse style
        fill = ""
        stroke = ""
        for s in style.split(";"):
            if s.startswith("fillColor="): fill = s.split("=")[1]
            if s.startswith("strokeColor="): stroke = s.split("=")[1]
            
        classes_info.append({
            "id": cid,
            "val": val,
            "x": x, "y": y, "w": w, "h": h,
            "fill": fill, "stroke": stroke,
            "style": style
        })

print(f"Total classes found: {len(classes_info)}")
for ci in classes_info:
    # Extract stereo, name, attributes, methods
    val = ci["val"]
    m_name = re.search(r"<b[^>]*>([^<]+)</b>", val)
    cname = m_name.group(1) if m_name else ci["id"]
    
    m_stereo = re.search(r"&laquo;([^&]+)&raquo;", val)
    stereo = m_stereo.group(1) if m_stereo else "entity"
    
    parts = val.split("<hr")
    attrs = ""
    methods = ""
    if len(parts) > 1:
        # extract text from part 1
        attrs = re.sub(r"<[^>]+>", "\n", parts[1]).strip()
        attrs_lines = [l.strip() for l in attrs.splitlines() if l.strip()]
    if len(parts) > 2:
        methods = re.sub(r"<[^>]+>", "\n", parts[2]).strip()
        methods_lines = [l.strip() for l in methods.splitlines() if l.strip()]
        
    print(f"\n==================== {cname} (ID: {ci['id']}) ====================")
    print(f"Pos: ({ci['x']}, {ci['y']}) Size: ({ci['w']} x {ci['h']}) Fill: {ci['fill']} Stroke: {ci['stroke']}")
    print(f"Stereo: «{stereo}»")
    print(f"Attributes ({len(attrs_lines)}):")
    for al in attrs_lines:
        print(f"  {al}")
    if len(parts) > 2:
        print(f"Methods ({len(methods_lines)}):")
        for ml in methods_lines:
            print(f"  {ml}")
