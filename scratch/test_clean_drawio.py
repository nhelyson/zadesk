import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

# Read original
with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    orig_text = f.read()

# Let's inspect the original XML tree
# First fix any mangled accents in orig_text if present:
fixed_text = orig_text
replacements = {
    'ZADESK  DIAGRAMME': "ZADESK — DIAGRAMME",
    'Omnicanale  Portail': "Omnicanale • Portail",
    'Lgende UML': "Légende UML",
    'reli  un Cas': "relié à un Cas",
    'Gnralisation': "Généralisation",
    'Hritage de rle': "Héritage de rôle",
    'Systme Zadesk': "Système Zadesk",
    'Scurit': "Sécurité",
    'Oprationnelle': "Opérationnelle",
    'Rclamations': "Réclamations",
    'quipe': "Équipe",
    'Compte Enregistr': "Compte Enregistré",
    '&lt;&lt;Systme&gt;&gt;': "&lt;&lt;Système&gt;&gt;",
    'Capacit / Comptence': "Capacité / Compétence",
    'Oprationnel': "Opérationnel",
    'd\'quipe': "d'équipe",
    'coordonnes': "coordonnées",
    'rclamation': "réclamation",
    'Crer': "Créer",
    'change': "échange",
    'dfi': "défi",
    'Vrifier': "Vérifier",
    'Rinitialiser': "Réinitialiser",
    'Mettre  jour': "Mettre à jour",
    'Rassigner': "Réassigner",
    'Rsoudre': "Résoudre",
    'Clturer': "Clôturer",
    'collgue': "collègue",
    'Rdiger': "Rédiger",
    'comptences': "compétences",
}

for k, v in replacements.items():
    fixed_text = fixed_text.replace(k, v)

with open('scratch/fixed_test.drawio', 'w', encoding='utf-8') as f:
    f.write(fixed_text)

print("Saved scratch/fixed_test.drawio with cleaned text.")

