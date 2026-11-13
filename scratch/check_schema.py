import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    text = f.read()

keywords = ['agency', 'agencies', 'branch', 'guichet', 'location', 'address', 'openinghours', 'city']
for kw in keywords:
    matches = [line.strip() for line in text.splitlines() if kw in line.lower()]
    print(f'Keyword "{kw}": {len(matches)} matches')
    for m in matches[:5]:
        print('  ', m)

