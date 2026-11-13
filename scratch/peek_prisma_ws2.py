import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
for i, l in enumerate(lines[120:175]):
    print(f"{i+121}: {l}")

