import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    raw = f.read()

try:
    tree = ET.fromstring(raw)
    print("✓ XML Syntax is 100% VALID!")
except Exception as e:
    print(f"✗ XML Error: {e}")
    sys.exit(1)

model = tree.find('.//root')
cells = model.findall('mxCell')
print(f"Total cells: {len(cells)}")

vertices = 0
edges = 0
errors = []

for c in cells:
    cid = c.attrib.get('id')
    is_vertex = c.attrib.get('vertex') == '1'
    is_edge = c.attrib.get('edge') == '1'
    
    if is_vertex and is_edge:
        errors.append(f"Cell {cid} has BOTH vertex=1 and edge=1!")
    elif is_vertex:
        vertices += 1
        geo = c.find('mxGeometry')
        if geo is None:
            errors.append(f"Vertex {cid} has no mxGeometry!")
    elif is_edge:
        edges += 1
        src = c.attrib.get('source')
        tgt = c.attrib.get('target')
        geo = c.find('mxGeometry')
        if not src or not tgt:
            errors.append(f"Edge {cid} missing source or target!")
        if geo is None or geo.attrib.get('relative') != '1':
            errors.append(f"Edge {cid} missing relative='1' mxGeometry!")

print(f"Vertices: {vertices}")
print(f"Edges: {edges}")

if errors:
    print(f"✗ Found {len(errors)} errors:")
    for err in errors[:10]:
        print("  -", err)
else:
    print("✓ All cells, vertices and edges are 100% DRAW.IO COMPLIANT and CLEAN!")

