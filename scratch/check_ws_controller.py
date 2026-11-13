import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/src/controllers/workspaceController.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'export\s+(?:async\s+)?function\s+(\w+)', text)
print("Workspace controller functions:", matches)

