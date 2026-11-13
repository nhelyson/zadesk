import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('backend/src/services/publicCompanyService.js', 'r', encoding='utf-8') as f:
    text = f.read()

print("Length of publicCompanyService.js:", len(text))
import re
functions = re.findall(r'export\s+(?:async\s+)?function\s+(\w+)', text)
print("Exported functions:", functions)

