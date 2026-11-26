with open('diagrammes/Zadesk_Diagramme_Cas_Utilisation.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

import re
edges = re.findall(r'<mxCell [^>]*value="[^"]*(?:include|extend)[^"]*"[\s\S]*?</mxCell>', text)
for e in edges[:5]:
    print("EDGE:\n", e)
