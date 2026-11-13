import os

matches = []
for root, dirs, files in os.walk('backend'):
    for f in files:
        if f.endswith(('.js', '.json', '.prisma')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                lines = file.readlines()
                for i, line in enumerate(lines):
                    if any(k in line.lower() for k in ['agenc', 'guichet']):
                        matches.append(f"{path}:{i+1}: {line.strip()}")

print(f"Total matches in backend: {len(matches)}")
for m in matches:
    print(m)

