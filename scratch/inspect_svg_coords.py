with open('scratch/test_puml.svg', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'<text\s+[^>]*x="([0-9.]+)"\s+y="([0-9.]+)"[^>]*>([^<]+)</text>', text)
for x, y, val in matches:
    if any(k in val for k in ["Client", "Cloudflare", "Conseiller", "Superviseur", "Administrateur", "Propriétaire", "SYSTÈME"]):
        print(f"{float(x):8.2f}, {float(y):8.2f} : {val}")
