import xml.etree.ElementTree as ET

tree = ET.parse('Zadesk_Diagramme_Classes.drawio')
root = tree.getroot()

for d in root.findall('diagram'):
    name = d.attrib.get('name')
    print(f"\n=== PAGE: {name} ===")
    cells = d.findall('.//mxCell')
    for c in cells:
        if c.attrib.get('vertex') == '1':
            geo = c.find('mxGeometry')
            x = geo.attrib.get('x', '0') if geo is not None else '0'
            y = geo.attrib.get('y', '0') if geo is not None else '0'
            w = geo.attrib.get('width', '0') if geo is not None else '0'
            h = geo.attrib.get('height', '0') if geo is not None else '0'
            val = c.attrib.get('value', '').split('<')[0].strip()
            print(f"  Class: {val[:30]:30s} at ({x}, {y}) size {w}x{h}")
