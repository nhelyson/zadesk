import re

full_lines = []
for step in [11841, 11843, 11845, 11847]:
    with open(f'scratch/step_{step}.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    # Find lines in content formatted as "N: <text>"
    for line in content.splitlines():
        m = re.match(r'^\s*(\d+):\s?(.*)$', line)
        if m:
            line_no = int(m.group(1))
            line_text = m.group(2)
            full_lines.append((line_no, line_text))

# Deduplicate by line_no
full_lines_dict = dict(full_lines)
print(f"Total lines extracted: {len(full_lines_dict)}")

with open('scratch/original_zadesk_use_case_diagram.drawio', 'w', encoding='utf-8') as f:
    for i in range(1, max(full_lines_dict.keys()) + 1):
        f.write(full_lines_dict.get(i, '') + '\n')

print("Wrote scratch/original_zadesk_use_case_diagram.drawio successfully!")

