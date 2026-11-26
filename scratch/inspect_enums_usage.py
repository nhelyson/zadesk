# -*- coding: utf-8 -*-
import json

with open(r"scratch\parsed_prisma_models.json", "r", encoding="utf-8") as f:
    parsed_models = json.load(f)

with open(r"scratch\pg_metadata.json", "r", encoding="utf-8") as f:
    pg_metadata = json.load(f)

# Find all enums used in the 19 models
enum_usages = {}
for mname, mdata in parsed_models.items():
    for f in mdata["fields"]:
        ftype = f["type"]
        # Check if ftype is in pg_enums
        pg_enum_matches = [e for e in pg_metadata["pg_enums"] if e["enum_name"] == ftype]
        if pg_enum_matches:
            enum_usages.setdefault(ftype, []).append((mname, f["name"]))

print("Enums used directly by the 19 models:")
for ename, usages in sorted(enum_usages.items()):
    vals = [e["enum_value"] for e in pg_metadata["pg_enums"] if e["enum_name"] == ename]
    print(f"\nEnum: {ename} ({len(vals)} values: {', '.join(vals)})")
    for mname, fname in usages:
        print(f"  - Model: {mname}.{fname}")

print("\n--- Other enums in PostgreSQL (not used in the 19 models) ---")
all_pg_enum_names = sorted(list(set(e["enum_name"] for e in pg_metadata["pg_enums"])))
for ename in all_pg_enum_names:
    if ename not in enum_usages:
        vals = [e["enum_value"] for e in pg_metadata["pg_enums"] if e["enum_name"] == ename]
        print(f"Enum: {ename} ({len(vals)} values: {', '.join(vals)})")
