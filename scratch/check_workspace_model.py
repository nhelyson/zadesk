import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'model Workspace\s*\{([^}]+)\}', text)
if m:
    print("MODEL Workspace:")
    print(m.group(0))

