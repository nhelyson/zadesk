import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

import re

cells = re.findall(r'<mxCell\s+id="([^"]+)"\s*(.*?)(?:/>|>(.*?)</mxCell>)', text, re.DOTALL)
print(f"Total cells: {len(cells)}")
for cid, attrs, body in cells:
    # extract value, style, vertex, edge, source, target
    val = re.search(r'value="([^"]*)"', attrs)
    style = re.search(r'style="([^"]*)"', attrs)
    vertex = re.search(r'vertex="([^"]*)"', attrs)
    edge = re.search(r'edge="([^"]*)"', attrs)
    source = re.search(r'source="([^"]*)"', attrs)
    target = re.search(r'target="([^"]*)"', attrs)
    geo = re.search(r'<mxGeometry\s+([^>]+)/>', body or attrs)
    
    val_str = val.group(1)[:40] if val else ""
    geo_str = geo.group(1) if geo else ""
    
    if edge:
        print(f"EDGE: id={cid} src={source.group(1) if source else '?'} -> dst={target.group(1) if target else '?'} val={val_str} style={style.group(1)[:40] if style else ''}")
    elif vertex:
        print(f"VERT: id={cid} geo={geo_str} val={val_str}")
