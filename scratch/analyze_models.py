# -*- coding: utf-8 -*-
import json
import os

with open('scratch/audit_summary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

models = data['prisma_models']
enums = data['prisma_enums']
pg_tables = data['pg_tables']
pg_fks = data['pg_fks']
pg_pks = data['pg_pks']
pg_enums = data['pg_enums']

print("=== PRISMA MODELS & @@map ===")
model_to_table = {}
table_to_model = {}
for m_name, m_info in models.items():
    t_name = m_info['map_table']
    model_to_table[m_name] = t_name
    table_to_model[t_name] = m_name
    print(f"Model: {m_name:30s} -> Table: {t_name:30s} ({len(m_info['fields'])} fields)")

print("\n=== POSTGRESQL TABLES ===")
for t in pg_tables:
    m = table_to_model.get(t, "NOT IN PRISMA!")
    print(f"Table: {t:30s} -> Model: {m}")

# Check migrations
migrations_dir = 'backend/prisma/migrations'
migrations = [m for m in os.listdir(migrations_dir) if os.path.isdir(os.path.join(migrations_dir, m))]
migrations.sort()
print(f"\n=== MIGRATIONS ({len(migrations)}) ===")
for m in migrations:
    print(f" - {m}")

# Inspect Foreign Keys
print(f"\n=== FOREIGN KEYS ({len(pg_fks)}) ===")
for fk in pg_fks[:15]:
    print(f"{fk[0]}.{fk[1]} -> {fk[2]}.{fk[3]} (ON DELETE {fk[4]}, ON UPDATE {fk[5]})")

# Inspect Enums
print(f"\n=== ENUMS ({len(enums)}) ===")
for e_name, e_vals in enums.items():
    print(f"Enum {e_name} ({len(e_vals)} values): {', '.join(e_vals)}")
