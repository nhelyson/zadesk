# -*- coding: utf-8 -*-
import json
import os

with open(r"scratch\parsed_prisma_models.json", "r", encoding="utf-8") as f:
    parsed_models = json.load(f)

with open(r"scratch\pg_metadata.json", "r", encoding="utf-8") as f:
    pg_metadata = json.load(f)

cols_by_table = {}
for c in pg_metadata["columns"]:
    tname = c["table_name"]
    cols_by_table.setdefault(tname, {})[c["column_name"]] = c

fks_by_table = {}
for fk in pg_metadata["fks"]:
    tname = fk["table_name"]
    fks_by_table.setdefault(tname, []).append(fk)

uniques_by_table = {}
for u in pg_metadata["uniques"]:
    tname = u["table_name"]
    uniques_by_table.setdefault(tname, []).append(u)

print("Checking 19 models mapping to PostgreSQL tables:")
for mname, mdata in parsed_models.items():
    tname = mdata["table_name"]
    pg_cols = cols_by_table.get(tname, {})
    print(f"Model {mname} -> Table '{tname}': {len(mdata['fields'])} Prisma scalar fields, {len(pg_cols)} PG columns, {len(mdata['relations'])} relations.")
    # Verify discrepancy if any
    prisma_field_names = set(f["name"] for f in mdata["fields"])
    pg_col_names = set(pg_cols.keys())
    if prisma_field_names != pg_col_names:
        diff_p = prisma_field_names - pg_col_names
        diff_pg = pg_col_names - prisma_field_names
        print(f"  DISCREPANCY in {mname} / {tname}:")
        if diff_p: print(f"    In Prisma but not in PG: {diff_p}")
        if diff_pg: print(f"    In PG but not in Prisma: {diff_pg}")
