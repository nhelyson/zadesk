# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import os

drawio_path = "Zadesk_Diagramme_Classes.drawio"
tree = ET.parse(drawio_path)
root = tree.getroot()

diagram = root.find("diagram")
print("Diagram name:", diagram.get("name") if diagram is not None else "None")

mxGraphModel = root.find(".//mxGraphModel")
if mxGraphModel is not None:
    print("Page width:", mxGraphModel.get("pageWidth"), "Page height:", mxGraphModel.get("pageHeight"), "dx:", mxGraphModel.get("dx"), "dy:", mxGraphModel.get("dy"))

cells = root.findall(".//mxCell")
print(f"Total mxCells: {len(cells)}")

vertices = [c for c in cells if c.get("vertex") == "1"]
edges = [c for c in cells if c.get("edge") == "1"]
print(f"Vertices: {len(vertices)}, Edges: {len(edges)}")

print("\n--- Vertices ---")
for v in vertices:
    vid = v.get("id")
    val = v.get("value", "")
    style = v.get("style", "")
    geo = v.find("mxGeometry")
    gx = geo.get("x") if geo is not None else ""
    gy = geo.get("y") if geo is not None else ""
    gw = geo.get("width") if geo is not None else ""
    gh = geo.get("height") if geo is not None else ""
    val_clean = val.replace("\n", " ").replace("&nbsp;", " ")[:60]
    print(f"ID: {vid:<20} | ({gx}, {gy}, {gw}, {gh}) | {val_clean}")

print("\n--- Edges (first 10) ---")
for e in edges[:10]:
    eid = e.get("id")
    src = e.get("source")
    tgt = e.get("target")
    val = e.get("value", "")
    print(f"Edge {eid}: {src} -> {tgt} | {val}")
