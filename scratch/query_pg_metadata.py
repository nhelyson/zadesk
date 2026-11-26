# -*- coding: utf-8 -*-
import json
import subprocess

sql_query = """
-- Colonnes des 19 tables
SELECT 
    c.table_name,
    c.column_name,
    c.data_type,
    c.udt_name,
    c.is_nullable,
    c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;
"""

sql_fks = """
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
"""

sql_uniques = """
SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE') AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, kcu.ordinal_position;
"""

sql_enums = """
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;
"""

def run_psql(query):
    cmd = [
        "docker", "exec", "-i", "zadesk-postgres",
        "psql", "-U", "zadesk", "-d", "zadesk",
        "-A", "-F", "\t", "-c", query
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error executing SQL:", res.stderr)
        return []
    lines = res.stdout.strip().splitlines()
    if not lines:
        return []
    headers = lines[0].split("\t")
    rows = []
    for line in lines[1:]:
        if line.endswith("rows)") or line.endswith("row)"):
            continue
        parts = line.split("\t")
        if len(parts) == len(headers):
            rows.append(dict(zip(headers, parts)))
    return rows

columns = run_psql(sql_query)
fks = run_psql(sql_fks)
uniques = run_psql(sql_uniques)
pg_enums = run_psql(sql_enums)

output = {
    "columns": columns,
    "fks": fks,
    "uniques": uniques,
    "pg_enums": pg_enums
}

with open(r"scratch\pg_metadata.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2)

print(f"PostgreSQL metadata fetched: {len(columns)} cols, {len(fks)} FKs, {len(uniques)} PK/UQs, {len(pg_enums)} enum values.")
