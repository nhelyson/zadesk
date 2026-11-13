with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
print(f"Total lines: {len(lines)}")
for i, l in enumerate(lines[-25:]):
    print(f"{len(lines)-25+i+1}: {l}")

