# -*- coding: utf-8 -*-
import json
import os

with open(r"scratch\parsed_prisma_models.json", "r", encoding="utf-8") as f:
    parsed_models = json.load(f)

with open(r"scratch\pg_metadata.json", "r", encoding="utf-8") as f:
    pg_metadata = json.load(f)

cols_by_table = {}
for c in pg_metadata["columns"]:
    cols_by_table.setdefault(c["table_name"], {})[c["column_name"]] = c

fks_by_table = {}
for fk in pg_metadata["fks"]:
    fks_by_table.setdefault(fk["table_name"], {})[fk["column_name"]] = fk

uniques_by_table = {}
for u in pg_metadata["uniques"]:
    uniques_by_table.setdefault(u["table_name"], set()).add(u["column_name"])

print("Ready to generate full report.")
