import xml.etree.ElementTree as ET

tree = ET.parse('zadesk_complete_uml_diagram.drawio')
root = tree.getroot()
d = root.find('diagram')
model = d.find('mxGraphModel')
print(f"Canvas size: {model.attrib.get('pageWidth')} x {model.attrib.get('pageHeight')}")
r = model.find('root')
for c in r.findall('mxCell'):
    if c.attrib.get('vertex') == '1' and c.attrib.get('id') != 'title':
        geo = c.find('mxGeometry')
        print(f"{c.attrib.get('id'):20s}: x={geo.attrib.get('x'):4s}, y={geo.attrib.get('y'):4s}, w={geo.attrib.get('width'):4s}, h={geo.attrib.get('height'):4s}")
