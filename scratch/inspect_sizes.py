# -*- coding: utf-8 -*-
import json

with open(r"scratch\extracted_page1_classes.json", "r", encoding="utf-8") as f:
    classes = json.load(f)

for cid, c in classes.items():
    n_attrs = len(c["attrs"])
    n_methods = len(c["methods"])
    # Calculate required height:
    # Header: ~55px (stereo + name + padding)
    # Divider 1: 10px
    # Attributes: n_attrs * 24px + 10px padding
    # Divider 2: 10px (if methods)
    # Methods: n_methods * 24px + 10px padding
    # Total padding bottom: ~10px
    req_h = 55 + 10 + (n_attrs * 24 + 10)
    if n_methods > 0:
        req_h += 10 + (n_methods * 24 + 10)
    req_h = max(req_h, 180)
    
    # Calculate required width based on longest line:
    longest_line = max([len(c["name"])] + [len(a) for a in c["attrs"]] + [len(m) for m in c["methods"]])
    # In 14px monospace, 1 char is about 8.5px. 8.5 * longest_line + 40px padding
    req_w = max(340, longest_line * 9 + 40)
    
    print(f"{c['name']:<25} | Attrs: {n_attrs:<2} | Methods: {n_methods:<2} | Longest: {longest_line:<2} | Orig: ({c['orig_w']:<3.0f} x {c['orig_h']:<3.0f}) -> Rec: ({req_w:<3.0f} x {req_h:<3.0f})")
