# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import re
import json

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for d in root.findall("diagram"):
    if d.get("id") == "page-global":
        p1 = d
        break

classes = {}

for c in p1.findall(".//mxCell[@vertex='1']"):
    cid = c.get("id")
    val = c.get("value", "")
    style = c.get("style", "")
    geo = c.find("mxGeometry")
    
    # Extract name
    m_name = re.search(r"<b[^>]*>([^<]+)</b>", val)
    cname = m_name.group(1) if m_name else cid
    
    # Extract stereo
    m_stereo = re.search(r"&laquo;([^&]+)&raquo;", val)
    stereo = m_stereo.group(1) if m_stereo else "entity"
    
    # Extract colors
    fill = ""
    stroke = ""
    for s in style.split(";"):
        if s.startswith("fillColor="): fill = s.split("=")[1]
        if s.startswith("strokeColor="): stroke = s.split("=")[1]
        
    m_title_color = re.search(r"<b style=\"[^\"]*color:([^;\"]+)", val)
    title_color = m_title_color.group(1) if m_title_color else stroke
    
    m_stereo_color = re.search(r"<span style=\"[^\"]*color:([^;\"]+)", val)
    stereo_color = m_stereo_color.group(1) if m_stereo_color else "#64748B"
    
    m_div_color = re.search(r"border-top:1.5px solid ([^;\"]+)", val)
    div_color = m_div_color.group(1) if m_div_color else "#CBD5E1"
    
    parts = val.split("<hr")
    attrs_lines = []
    methods_lines = []
    
    if len(parts) > 1:
        # extract text lines
        raw_attrs = parts[1]
        # remove tag prefix style="..."/>
        raw_attrs = re.sub(r"^[^>]*>", "", raw_attrs)
        # get text lines
        lines = re.split(r"<br\s*/?>", raw_attrs)
        for l in lines:
            cleaned = re.sub(r"<[^>]+>", "", l).strip()
            if cleaned and not cleaned.startswith("style="):
                attrs_lines.append(cleaned)
                
    if len(parts) > 2:
        raw_methods = parts[2]
        raw_methods = re.sub(r"^[^>]*>", "", raw_methods)
        lines = re.split(r"<br\s*/?>", raw_methods)
        for l in lines:
            cleaned = re.sub(r"<[^>]+>", "", l).strip()
            if cleaned and not cleaned.startswith("style="):
                methods_lines.append(cleaned)
                
    classes[cid] = {
        "id": cid,
        "name": cname,
        "stereo": stereo,
        "fill": fill,
        "stroke": stroke,
        "title_color": title_color,
        "stereo_color": stereo_color,
        "div_color": div_color,
        "attrs": attrs_lines,
        "methods": methods_lines,
        "orig_x": float(geo.get("x", 0)),
        "orig_y": float(geo.get("y", 0)),
        "orig_w": float(geo.get("width", 0)),
        "orig_h": float(geo.get("height", 0)),
    }

with open(r"scratch\extracted_page1_classes.json", "w", encoding="utf-8") as f:
    json.dump(classes, f, indent=2)

print(f"Extracted {len(classes)} classes to scratch/extracted_page1_classes.json")
