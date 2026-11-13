import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/public/CompanyInfoBubbleModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
for i, line in enumerate(lines):
    if any(k in line.lower() for k in ['address', 'city', 'opening', 'hours']):
        print(f"Line {i+1}: {line}")

