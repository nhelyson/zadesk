import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/src/services/workspaceService.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'export async function updateWorkspace\([^)]+\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', text)
if m:
    print(m.group(0)[:1500])

