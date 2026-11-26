import xml.etree.ElementTree as ET

tree = ET.parse('Zadesk_Diagramme_Classes.drawio')
root = tree.getroot()

for i, d in enumerate(root.findall('diagram')):
    name = d.attrib.get('name')
    model = d.find('mxGraphModel')
    w = model.attrib.get('pageWidth', 'N/A') if model is not None else 'N/A'
    h = model.attrib.get('pageHeight', 'N/A') if model is not None else 'N/A'
    cells = d.findall('.//mxCell')
    vertex_cells = [c for c in cells if c.attrib.get('vertex') == '1']
    edge_cells = [c for c in cells if c.attrib.get('edge') == '1']
    print(f'Page {i+1}: "{name}" (w={w}, h={h}, vertices={len(vertex_cells)}, edges={len(edge_cells)})')
