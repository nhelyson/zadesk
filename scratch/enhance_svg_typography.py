# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import re
import os

source_path = r'C:\Users\japhet\Downloads\zalisk_cas_utilisation_A4_gateway_rag_zalisk.svg'

with open(source_path, 'r', encoding='utf-8') as f:
    xml_content = f.read()

# Let's inspect all <text> elements in the original SVG
# We can replace the <style> in <defs> to include crisp font rendering rules
font_style = """
  <style>
    text {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      text-rendering: geometricPrecision;
      font-kerning: normal;
      -webkit-font-smoothing: antialiased;
    }
  </style>
"""

# Replace existing style
xml_content = re.sub(r'<style>.*?</style>', font_style.strip(), xml_content, flags=re.DOTALL)

# Let's parse with ElementTree or perform precise regex / XML transformations
# Because the SVG has simple, well-defined elements, let's examine the replacements

# 1. Dependency labels: «extend» and «include»
# Original:
# <text x="67.0" y="86.3" text-anchor="middle" font-family="Arial, DejaVu Sans, sans-serif" font-size="2.55" font-weight="bold" fill="#344054">«extend»</text>
def repl_dep(m):
    x = m.group(1)
    y = m.group(2)
    val = m.group(3)
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="2.9" font-weight="bold" fill="#0A0F1D" paint-order="stroke fill" stroke="#FFFFFF" stroke-width="0.8" stroke-linejoin="round">{val}</text>'

xml_content = re.sub(r'<text x="([^"]+)" y="([^"]+)" text-anchor="middle" font-family="[^"]+" font-size="2\.55" font-weight="bold" fill="#344054">(«extend»|«include»)</text>', repl_dep, xml_content)

# 2. Actors labels
# Client
xml_content = re.sub(
    r'<text x="13\.0" y="81\.2"[^>]*>Client</text>',
    r'<text x="13.0" y="80.8" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.4" font-weight="bold" fill="#0A0F1D">Client</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="13\.0" y="84\.7"[^>]*>\(Grand public\)</text>',
    r'<text x="13.0" y="84.9" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.0" font-weight="bold" fill="#0A0F1D">(Grand public)</text>',
    xml_content
)

# Cloudflare
xml_content = re.sub(
    r'<text x="13\.0" y="157\.9"[^>]*>Cloudflare</text>',
    r'<text x="13.0" y="157.4" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.3" font-weight="bold" fill="#0A0F1D">Cloudflare</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="13\.0" y="161\.0"[^>]*>Workers AI</text>',
    r'<text x="13.0" y="161.2" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.3" font-weight="bold" fill="#0A0F1D">Workers AI</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="13\.0" y="164\.1"[^>]*>\(modèles IA\)</text>',
    r'<text x="13.0" y="164.9" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="2.9" font-weight="bold" fill="#0A0F1D">(modèles IA)</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="13\.0" y="167\.2"[^>]*>\(API Gateway\)</text>',
    r'<text x="13.0" y="168.3" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="2.9" font-weight="bold" fill="#0A0F1D">(API Gateway)</text>',
    xml_content
)

# Superviseur SAV
xml_content = re.sub(
    r'<text x="284\.0" y="33\.0"[^>]*>Superviseur SAV</text>',
    r'<text x="284.0" y="32.5" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.35" font-weight="bold" fill="#0A0F1D">Superviseur SAV</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="284\.0" y="36\.5"[^>]*>\(MANAGER\)</text>',
    r'<text x="284.0" y="36.6" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.0" font-weight="bold" fill="#0A0F1D">(MANAGER)</text>',
    xml_content
)

# Conseiller SAV
xml_content = re.sub(
    r'<text x="284\.0" y="194\.0"[^>]*>Conseiller SAV</text>',
    r'<text x="284.0" y="193.5" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.35" font-weight="bold" fill="#0A0F1D">Conseiller SAV</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="284\.0" y="197\.5"[^>]*>\(AGENT\)</text>',
    r'<text x="284.0" y="197.6" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.0" font-weight="bold" fill="#0A0F1D">(AGENT)</text>',
    xml_content
)

# Administrateur
xml_content = re.sub(
    r'<text x="284\.0" y="98\.2"[^>]*>Administrateur</text>',
    r'<text x="284.0" y="97.8" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.35" font-weight="bold" fill="#0A0F1D">Administrateur</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="284\.0" y="101\.7"[^>]*>\(ADMIN\)</text>',
    r'<text x="284.0" y="101.8" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.0" font-weight="bold" fill="#0A0F1D">(ADMIN)</text>',
    xml_content
)

# Propriétaire
xml_content = re.sub(
    r'<text x="284\.0" y="152\.2"[^>]*>Propriétaire</text>',
    r'<text x="284.0" y="151.8" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.35" font-weight="bold" fill="#0A0F1D">Propriétaire</text>',
    xml_content
)
xml_content = re.sub(
    r'<text x="284\.0" y="155\.7"[^>]*>\(OWNER\)</text>',
    r'<text x="284.0" y="155.8" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="3.0" font-weight="bold" fill="#0A0F1D">(OWNER)</text>',
    xml_content
)

# 3. Now let's handle the 24 use case texts inside the ellipses
# Let's inspect each <text ...><tspan ...>...</text> block and replace with improved typography

# Mapping of unique first-line prefix to replacement parameters:
# (font_size, dy, y_offset_from_cy, is_special)
# cy is:
# row 0: 43.5
# row 1: 71.5
# row 2: 99.5
# row 3: 127.5
# row 4: 155.5
# row 5: 183.5

# Let's find all <text ...><tspan...>...</text> blocks and rewrite them with:
# font-family="'Segoe UI', Calibri, Arial, sans-serif"
# font-weight="600"
# fill="#0A0F1D"
# increased font-size and tuned dy and y!

def rewrite_usecase_text(m):
    block = m.group(0)
    # extract x and y
    mx = re.search(r'x="([^"]+)"', block)
    my = re.search(r'y="([^"]+)"', block)
    x = float(mx.group(1))
    orig_y = float(my.group(1))

    # extract tspans
    tspans = re.findall(r'<tspan[^>]*>(.*?)</tspan>', block)
    n_lines = len(tspans)

    # find corresponding cy (closest to 43.5, 71.5, 99.5, 127.5, 155.5, 183.5)
    row_cys = [43.5, 71.5, 99.5, 127.5, 155.5, 183.5]
    cy = min(row_cys, key=lambda c: abs(c - orig_y))

    # Determine typography parameters
    # Special cases:
    full_text = " ".join(tspans)
    if "Exploiter les suggestions" in full_text:
        # Long 3-line text
        fs = 3.2
        dy = 3.9
        start_y = cy - 2.8
        out = [f'<text x="{x:.1f}" y="{start_y:.2f}" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="{fs:.2f}" font-weight="600" fill="#0A0F1D">']
        for i, t in enumerate(tspans):
            cur_dy = 0 if i == 0 else dy
            cur_fs = 2.85 if i == 2 else fs
            out.append(f'<tspan x="{x:.1f}" dy="{cur_dy:.2f}" font-size="{cur_fs:.2f}">{t}</tspan>')
        out.append('</text>')
        return "".join(out)
    elif "Obtenir une assistance" in full_text:
        fs = 3.3
        dy = 4.0
        start_y = cy - 2.9
        out = [f'<text x="{x:.1f}" y="{start_y:.2f}" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="{fs:.2f}" font-weight="600" fill="#0A0F1D">']
        for i, t in enumerate(tspans):
            cur_dy = 0 if i == 0 else dy
            cur_fs = 3.0 if i == 2 else fs
            out.append(f'<tspan x="{x:.1f}" dy="{cur_dy:.2f}" font-size="{cur_fs:.2f}">{t}</tspan>')
        out.append('</text>')
        return "".join(out)
    elif n_lines == 2:
        fs = 3.65
        dy = 4.45
        start_y = cy - 1.05
        out = [f'<text x="{x:.1f}" y="{start_y:.2f}" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="{fs:.2f}" font-weight="600" fill="#0A0F1D">']
        for i, t in enumerate(tspans):
            cur_dy = 0 if i == 0 else dy
            out.append(f'<tspan x="{x:.1f}" dy="{cur_dy:.2f}">{t}</tspan>')
        out.append('</text>')
        return "".join(out)
    else: # standard 3 lines
        fs = 3.4
        dy = 4.1
        start_y = cy - 2.95
        out = [f'<text x="{x:.1f}" y="{start_y:.2f}" text-anchor="middle" font-family="\'Segoe UI\', Calibri, Arial, sans-serif" font-size="{fs:.2f}" font-weight="600" fill="#0A0F1D">']
        for i, t in enumerate(tspans):
            cur_dy = 0 if i == 0 else dy
            out.append(f'<tspan x="{x:.1f}" dy="{cur_dy:.2f}">{t}</tspan>')
        out.append('</text>')
        return "".join(out)

xml_content = re.sub(r'<text\s+[^>]*><tspan[\s\S]*?</text>', rewrite_usecase_text, xml_content)

# Save to destination files
# 1. Update the original file in Downloads
target_orig = r'C:\Users\japhet\Downloads\zalisk_cas_utilisation_A4_gateway_rag_zalisk.svg'
with open(target_orig, 'w', encoding='utf-8') as f:
    f.write(xml_content)
print(f"Updated original: {target_orig} ({len(xml_content)} bytes)")

# 2. Also save as a clearly named master file in Downloads
target_download = r'C:\Users\japhet\Downloads\zalisk_cas_utilisation_A4_typographie_haute_lisibilite.svg'
with open(target_download, 'w', encoding='utf-8') as f:
    f.write(xml_content)
print(f"Saved copy in Downloads: {target_download} ({len(xml_content)} bytes)")

# 3. Also update in workspace documentation/uml/
target_workspace = r'documentation\uml\diagramme_cas_utilisation_global.svg'
with open(target_workspace, 'w', encoding='utf-8') as f:
    f.write(xml_content)
print(f"Saved in workspace: {target_workspace} ({len(xml_content)} bytes)")
