# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET

tree = ET.parse("diagrammes/Zadesk_Diagramme_Classes_Global.drawio")
root = tree.getroot()
diagrams = root.findall("diagram")
print(f"Total pages in Global: {len(diagrams)}")
for idx, d in enumerate(diagrams):
    print(f"Page {idx+1}: ID={d.get('id')} | Name={d.get('name')}")
