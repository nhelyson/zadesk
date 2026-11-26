# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("Zadesk_Diagramme_Classes.drawio")
root = tree.getroot()

for d in root.findall("diagram"):
    if d.get("id") == "page-global":
        p1 = d
        break

for c in p1.findall(".//mxCell"):
    if c.get("id") == "workspace":
        print("=== Workspace Style ===")
        print(c.get("style"))
        print("\n=== Workspace Value ===")
        print(c.get("value"))
    if c.get("id") == "ticket":
        print("\n=== Ticket Style ===")
        print(c.get("style"))
        print("\n=== Ticket Value ===")
        print(c.get("value"))
