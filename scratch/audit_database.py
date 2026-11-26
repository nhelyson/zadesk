# -*- coding: utf-8 -*-
import subprocess
import json
import os
import re

def parse_prisma(schema_path):
    with open(schema_path, 'r', encoding='utf-8') as f:
        content = f.read()

    models = {}
    enums = {}

    # Extract enums
    enum_blocks = re.findall(r'enum\s+(\w+)\s*\{([^}]+)\}', content)
    for name, body in enum_blocks:
        values = [line.strip() for line in body.strip().split('\n') if line.strip() and not line.strip().startswith('//')]
        enums[name] = values

    # Extract models
    model_blocks = re.findall(r'model\s+(\w+)\s*\{([^}]+)\}', content)
    for model_name, body in model_blocks:
        fields = []
        map_table = model_name
        composite_unique = []
        composite_id = []
        indexes = []

        lines = [l.strip() for l in body.strip().split('\n') if l.strip()]
        for line in lines:
            if line.startswith('//'):
                continue
            if line.startswith('@@map('):
                m = re.search(r'@@map\("([^"]+)"\)', line)
                if m:
                    map_table = m.group(1)
                continue
            if line.startswith('@@unique('):
                composite_unique.append(line)
                continue
            if line.startswith('@@id('):
                composite_id.append(line)
                continue
            if line.startswith('@@index('):
                indexes.append(line)
                continue

            # Parse field
            parts = line.split()
            if len(parts) >= 2:
                f_name = parts[0]
                f_type_raw = parts[1]
                f_attrs = " ".join(parts[2:])

                is_optional = f_type_raw.endswith('?')
                is_list = f_type_raw.endswith('[]')
                f_type = f_type_raw.rstrip('?').rstrip('[]')

                is_id = '@id' in f_attrs
                is_unique = '@unique' in f_attrs
                default_val = None
                m_def = re.search(r'@default\(([^)]+)\)', f_attrs)
                if m_def:
                    default_val = m_def.group(1)

                relation_info = None
                if '@relation(' in f_attrs:
                    relation_info = f_attrs[f_attrs.index('@relation('):]

                fields.append({
                    'name': f_name,
                    'type': f_type,
                    'is_optional': is_optional,
                    'is_list': is_list,
                    'is_id': is_id,
                    'is_unique': is_unique,
                    'default': default_val,
                    'relation': relation_info,
                    'raw_attrs': f_attrs
                })

        models[model_name] = {
            'map_table': map_table,
            'fields': fields,
            'composite_unique': composite_unique,
            'composite_id': composite_id,
            'indexes': indexes
        }

    return enums, models

def query_pg(sql):
    cmd = ['docker', 'exec', '-i', 'zadesk-postgres', 'psql', '-U', 'zadesk', '-d', 'zadesk', '-t', '-A', '-c', sql]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    if res.returncode != 0:
        print(f"Error querying PG: {res.stderr}")
        return []
    lines = [l.strip() for l in res.stdout.strip().split('\n') if l.strip()]
    return lines

def main():
    enums, models = parse_prisma('backend/prisma/schema.prisma')
    print(f"Prisma Models found: {len(models)}")
    print(f"Prisma Enums found: {len(enums)}")

    # 1. Get PG Tables
    sql_tables = "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;"
    pg_tables = query_pg(sql_tables)
    print(f"PostgreSQL Tables count: {len(pg_tables)}")

    # 2. Get PG Columns
    sql_cols = """
    SELECT table_name || '|' || column_name || '|' || data_type || '|' || udt_name || '|' || is_nullable || '|' || COALESCE(column_default, '')
    FROM information_schema.columns
    WHERE table_schema='public'
    ORDER BY table_name, ordinal_position;
    """
    pg_cols = query_pg(sql_cols)
    print(f"PostgreSQL Columns count: {len(pg_cols)}")

    # 3. Get PG Foreign Keys
    sql_fks = """
    SELECT
        tc.table_name, kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule, rc.update_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public'
    ORDER BY tc.table_name, kcu.column_name;
    """
    cmd = ['docker', 'exec', '-i', 'zadesk-postgres', 'psql', '-U', 'zadesk', '-d', 'zadesk', '-t', '-A', '-F', '|', '-c', sql_fks]
    res_fk = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    pg_fks = [l.strip().split('|') for l in res_fk.stdout.strip().split('\n') if l.strip()]
    print(f"PostgreSQL Foreign Keys count: {len(pg_fks)}")

    # 4. Get PG Primary Keys
    sql_pks = """
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema='public'
    ORDER BY tc.table_name;
    """
    cmd_pk = ['docker', 'exec', '-i', 'zadesk-postgres', 'psql', '-U', 'zadesk', '-d', 'zadesk', '-t', '-A', '-F', '|', '-c', sql_pks]
    res_pk = subprocess.run(cmd_pk, capture_output=True, text=True, encoding='utf-8')
    pg_pks = [l.strip().split('|') for l in res_pk.stdout.strip().split('\n') if l.strip()]
    print(f"PostgreSQL Primary Keys count: {len(pg_pks)}")

    # 5. Get PG Enums
    sql_enums = """
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder;
    """
    cmd_enum = ['docker', 'exec', '-i', 'zadesk-postgres', 'psql', '-U', 'zadesk', '-d', 'zadesk', '-t', '-A', '-F', '|', '-c', sql_enums]
    res_enum = subprocess.run(cmd_enum, capture_output=True, text=True, encoding='utf-8')
    pg_enums_list = [l.strip().split('|') for l in res_enum.stdout.strip().split('\n') if l.strip()]
    pg_enums = {}
    for t_name, val in pg_enums_list:
        pg_enums.setdefault(t_name, []).append(val)
    print(f"PostgreSQL Enums count: {len(pg_enums)}")

    # Output detailed summary to scratch/audit_summary.json
    audit_data = {
        'prisma_models': models,
        'prisma_enums': enums,
        'pg_tables': pg_tables,
        'pg_columns': pg_cols,
        'pg_fks': pg_fks,
        'pg_pks': pg_pks,
        'pg_enums': pg_enums
    }

    with open('scratch/audit_summary.json', 'w', encoding='utf-8') as f:
        json.dump(audit_data, f, indent=2, ensure_ascii=False)
    print("Audit data saved to scratch/audit_summary.json")

if __name__ == '__main__':
    main()
