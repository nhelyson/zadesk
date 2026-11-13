import sys
import re
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect all words with 
mangled = re.findall(r'\b\w*\w*\b', text)
print("Unique mangled words:", sorted(set(mangled)))

