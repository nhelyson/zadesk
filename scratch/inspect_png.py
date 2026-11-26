# -*- coding: utf-8 -*-
from PIL import Image

im = Image.open("diagrammes/Zadesk_Diagramme_Classes.png")
print("Dimensions:", im.size, "Format:", im.format, "Mode:", im.mode)
