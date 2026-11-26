import xml.etree.ElementTree as ET

tree = ET.parse('Zadesk_Diagramme_Classes.drawio')
root = tree.getroot()

for d in root.findall('diagram'):
    name = d.attrib.get('name')
    print(f"\n==================== PAGE: {name} ====================")
    for cell in d.findall('.//mxCell'):
        v = cell.attrib.get('value', '')
        # print first line of value if present
        if v and not v.isdigit():
            clean_v = v.split('<')[0].split('\n')[0].strip()
            if clean_v:
                print(f"  - Cell: {clean_v[:50]}")
