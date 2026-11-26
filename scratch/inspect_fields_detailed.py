# -*- coding: utf-8 -*-
import json

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

# Let's inspect fields of each model
for mname, mdata in parsed_models.items():
    tname = mdata["table_name"]
    print(f"\n==================== {mname} ({tname}) ====================")
    t_fks = fks_by_table.get(tname, {})
    t_uqs = uniques_by_table.get(tname, set())
    for f in mdata["fields"]:
        fname = f["name"]
        pg_c = cols_by_table[tname].get(fname, {})
        pg_type = pg_c.get("udt_name", pg_c.get("data_type", "unknown"))
        is_nullable = pg_c.get("is_nullable", "YES") == "YES"
        col_default = pg_c.get("column_default", "")
        
        fk_info = t_fks.get(fname)
        fk_str = f"FK -> {fk_info['foreign_table_name']}.{fk_info['foreign_column_name']}" if fk_info else "-"
        is_pk = f["is_id"] or fname in t_uqs and "id" in fname
        is_uq = f["is_unique"] or (fname in t_uqs and not f["is_id"])
        
        print(f"  {fname:<25} | Prisma:{f['type']:<15} | PG:{pg_type:<15} | Null:{'OUI' if is_nullable else 'NON':<3} | PK:{'OUI' if f['is_id'] else 'NON':<3} | UQ:{'OUI' if is_uq else 'NON':<3} | {fk_str:<35} | Def:{col_default}")
