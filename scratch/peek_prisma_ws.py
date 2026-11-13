import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect Workspace model lines
lines = text.splitlines()
for i, l in enumerate(lines[40:90]):
    print(f"{i+41}: {l}")

