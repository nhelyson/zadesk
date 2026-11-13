import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '' in line:
        print(f"Line {i+1}: {line.strip()[:100]}")

