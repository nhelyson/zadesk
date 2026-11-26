# -*- coding: utf-8 -*-
import os
import html
import shutil

puml_dir = r"livrables_memoire\3.3.2_modele_classes\plantuml"
drawio_dir = r"livrables_memoire\3.3.2_modele_classes\drawio"

drawio_xml_path = os.path.join(drawio_dir, "zalisk_modele_classes.drawio")
with open(drawio_xml_path, "r", encoding="utf-8") as f:
    drawio_xml = f.read()

# Read puml svg
puml_svg_path = os.path.join(puml_dir, "zalisk_modele_classes.svg")
with open(puml_svg_path, "r", encoding="utf-8") as f:
    svg_content = f.read()

# Embed drawio_xml into SVG tag content attribute for diagrams.net / draw.io compatibility
escaped_xml = html.escape(drawio_xml, quote=True)
if "<svg " in svg_content:
    drawio_svg = svg_content.replace("<svg ", f'<svg content="{escaped_xml}" ', 1)
else:
    drawio_svg = svg_content

drawio_svg_path = os.path.join(drawio_dir, "zalisk_modele_classes.svg")
with open(drawio_svg_path, "w", encoding="utf-8") as f:
    f.write(drawio_svg)

# Copy PNG and PDF
shutil.copyfile(os.path.join(puml_dir, "zalisk_modele_classes.png"), os.path.join(drawio_dir, "zalisk_modele_classes.png"))
shutil.copyfile(os.path.join(puml_dir, "zalisk_modele_classes.pdf"), os.path.join(drawio_dir, "zalisk_modele_classes.pdf"))

print("Files in drawio dir:")
for fn in os.listdir(drawio_dir):
    fp = os.path.join(drawio_dir, fn)
    print(f"  {fn} ({os.path.getsize(fp)} bytes)")
