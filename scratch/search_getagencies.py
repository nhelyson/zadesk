import os

matches = []
for root, dirs, files in os.walk('frontend'):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                if 'getAgencies' in content:
                    matches.append(path)

print(f"Files containing getAgencies: {matches}")

