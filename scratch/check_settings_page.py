import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/app/app/(workspace)/settings/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
inputs = re.findall(r'(?:name|id|label|placeholder)=["\']([^"\']+)["\']', text)
print("Settings inputs/labels:", set(inputs))

