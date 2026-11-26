import re

with open('scratch/build_enhanced_diagram.py', 'r', encoding='utf-8') as f:
    code = f.read()

print("Contains render of other pages?:")
for p in ['Page 2', 'Entreprises', 'Agents', 'Tickets', 'Conversations', 'Assistance']:
    count = code.count(p)
    print(f" - {p}: {count} occurrences")
