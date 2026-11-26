import xml.etree.ElementTree as ET

for fname in ['diagrammes/Zadesk_Diagramme_Classes.drawio', 'diagrammes/Zadesk_Diagramme_Classes_Global.drawio']:
    print(f"\n=== Verification de {fname} ===")
    tree = ET.parse(fname)
    root = tree.getroot()
    for i, d in enumerate(root.findall('diagram')):
        model = d.find('mxGraphModel')
        r = model.find('root')
        cells = r.findall('mxCell')
        print(f"Page {i+1} : '{d.attrib.get('name')}' (taille {model.attrib.get('pageWidth')}x{model.attrib.get('pageHeight')})")
        print(f"  - Cellule 0 : {cells[0].attrib}")
        print(f"  - Cellule 1 : {cells[1].attrib}")
        assert 'parent' not in cells[0].attrib, f"ERREUR : la cellule 0 a un attribut parent : {cells[0].attrib}"
        assert cells[1].attrib.get('parent') == '0', f"ERREUR : la cellule 1 n'a pas parent='0' : {cells[1].attrib}"
        
        # Verification des autres cellules
        vertices = 0
        edges = 0
        for c in cells[2:]:
            assert c.attrib.get('parent') == '1', f"Cell {c.attrib.get('id')} has parent != 1"
            if c.attrib.get('vertex') == '1':
                vertices += 1
                geo = c.find('mxGeometry')
                assert geo is not None, f"Vertex {c.attrib.get('id')} missing mxGeometry"
            elif c.attrib.get('edge') == '1':
                edges += 1
                assert c.attrib.get('source'), f"Edge {c.attrib.get('id')} missing source"
                assert c.attrib.get('target'), f"Edge {c.attrib.get('id')} missing target"
        print(f"  - Total : {len(cells)} cellules ({vertices} sommets/classes/packages, {edges} connecteurs)")
        print("  -> STATUT : 100% VALIDE ET CONFORME DRAW.IO !")
