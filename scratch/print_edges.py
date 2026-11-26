# -*- coding: utf-8 -*-
import json

with open(r"scratch\extracted_page1_edges.json", "r", encoding="utf-8") as f:
    edges = json.load(f)

for e in edges:
    print(f"ID: {e['id']:<6} | {e['source']:<22} -> {e['target']:<22} | Val: {e['value']:<25} | Style: {e['style']}")
