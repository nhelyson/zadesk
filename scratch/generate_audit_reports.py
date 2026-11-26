# -*- coding: utf-8 -*-
import json
import os

with open('scratch/audit_summary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

models = data['prisma_models']
enums = data['prisma_enums']
pg_tables = data['pg_tables']
pg_cols = data['pg_columns']
pg_fks = data['pg_fks']
pg_pks = data['pg_pks']
pg_enums = data['pg_enums']

# Ensure target directories exist
base_dir = r"livrables_memoire\3.3.2_modele_classes"
audit_dir = os.path.join(base_dir, "audit")
plantuml_dir = os.path.join(base_dir, "plantuml")
drawio_dir = os.path.join(base_dir, "drawio")
doc_dir = os.path.join(base_dir, "documentation")

for d in [audit_dir, plantuml_dir, drawio_dir, doc_dir]:
    os.makedirs(d, exist_ok=True)

print("Directories created successfully.")
