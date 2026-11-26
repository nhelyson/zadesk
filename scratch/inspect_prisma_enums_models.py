# -*- coding: utf-8 -*-
import json
import re
import subprocess

schema_path = r"backend\prisma\schema.prisma"
with open(schema_path, "r", encoding="utf-8") as f:
    schema_text = f.read()

# 1. Parse all enums
enum_pattern = re.compile(r"enum\s+(\w+)\s*\{([^}]+)\}", re.MULTILINE)
enums = {}
for m in enum_pattern.finditer(schema_text):
    ename = m.group(1)
    evals = [line.strip() for line in m.group(2).strip().splitlines() if line.strip() and not line.strip().startswith("//")]
    enums[ename] = evals

print(f"Total Enums in Prisma: {len(enums)}")
for k, v in enums.items():
    print(f"  - {k} ({len(v)} values): {', '.join(v)}")

# 2. Parse all models
model_pattern = re.compile(r"model\s+(\w+)\s*\{([^}]+)\}", re.MULTILINE)
models = {}
for m in model_pattern.finditer(schema_text):
    mname = m.group(1)
    body = m.group(2)
    models[mname] = body

print(f"\nTotal Models in Prisma: {len(models)}")
