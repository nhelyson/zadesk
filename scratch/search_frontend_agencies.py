import os

matches = []
for root, dirs, files in os.walk('frontend'):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                lines = file.readlines()
                for i, line in enumerate(lines):
                    if 'agencies' in line.lower():
                        matches.append(f"{path}:{i+1}: {line.strip()}")

print(f"Total matches in frontend: {len(matches)}")
for m in matches:
    print(m)

