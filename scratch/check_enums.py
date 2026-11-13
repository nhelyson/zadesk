with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    text = f.read()

import re
enums = re.findall(r'enum\s+(\w+)\s*\{([^}]+)\}', text)
for name, vals in enums:
    print(f"ENUM {name}: {[v.strip() for v in vals.splitlines() if v.strip()]}")

