import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for model in ['AgentProfile', 'Membership', 'Ticket', 'Conversation']:
    m = re.search(rf'model {model}\s*\{{([^}}]+)\}}', text)
    if m:
        print(f"=== MODEL {model} ===")
        print(m.group(0))

