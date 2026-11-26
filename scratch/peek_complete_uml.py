import xml.etree.ElementTree as ET

tree = ET.parse('zadesk_complete_uml_diagram.drawio')
root = tree.getroot()
d = root.find('diagram')
m = d.find('mxGraphModel')
print('Page size:', m.attrib.get('pageWidth'), 'x', m.attrib.get('pageHeight'), 'dx/dy:', m.attrib.get('dx'), m.attrib.get('dy'))
for c in d.findall('.//mxCell'):
    if c.attrib.get('id') == 'workspace':
        print('Workspace style:', c.attrib.get('style'))
        print('Workspace value snippet:\n', c.attrib.get('value'))
        break
