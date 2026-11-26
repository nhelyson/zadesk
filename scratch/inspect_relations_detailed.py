# -*- coding: utf-8 -*-
import json

with open(r"scratch\parsed_prisma_models.json", "r", encoding="utf-8") as f:
    parsed_models = json.load(f)

with open(r"scratch\pg_metadata.json", "r", encoding="utf-8") as f:
    pg_metadata = json.load(f)

# Inspect relations
print("Detailed relations from parsed Prisma:")
for mname, mdata in parsed_models.items():
    for r in mdata["relations"]:
        target = r["target_model"]
        if target in parsed_models:
            rel_name = r.get("relation_name", "")
            fields = r.get("fields", [])
            refs = r.get("references", [])
            del_rule = r.get("onDelete", "None")
            upd_rule = r.get("onUpdate", "None")
            is_list = r.get("is_list", False)
            is_opt = r.get("is_optional", False)
            print(f"{mname} -> {target} | field:{r['field_name']} | is_list:{is_list} | opt:{is_opt} | fk:{fields}->{refs} | del:{del_rule} | name:{rel_name}")
