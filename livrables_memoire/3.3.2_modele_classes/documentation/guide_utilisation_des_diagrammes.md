# GUIDE DE LECTURE ET D'EXPLOITATION DES DIAGRAMMES DE CLASSES
## Mémoire de Licence en Génie Informatique — Section 3.3.2
### Mode d'emploi des livrables PlantUML et Draw.io

---

## 1. Organisation des Formats Livrés

Le modèle de classes de Zalisk est fourni sous deux formes strictement isomorphes :

### 1.1 Version PlantUML (`plantuml/`)
- Fichier source : [`zalisk_modele_classes.puml`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/plantuml/zalisk_modele_classes.puml)
- Rendu vectoriel : [`zalisk_modele_classes.svg`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/plantuml/zalisk_modele_classes.svg)
- Rendu matriciel haute résolution : [`zalisk_modele_classes.png`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/plantuml/zalisk_modele_classes.png)
- Rendu document prêt pour impression A3 : [`zalisk_modele_classes.pdf`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/plantuml/zalisk_modele_classes.pdf)

### 1.2 Version Draw.io (`drawio/`)
- Fichier natif éditable : [`zalisk_modele_classes.drawio`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/drawio/zalisk_modele_classes.drawio)
- Rendu vectoriel : [`zalisk_modele_classes.svg`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/drawio/zalisk_modele_classes.svg)
- Rendu matriciel haute résolution : [`zalisk_modele_classes.png`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/drawio/zalisk_modele_classes.png)
- Rendu PDF : [`zalisk_modele_classes.pdf`](file:///c:/Users/japhet/Downloads/zadesk/livrables_memoire/3.3.2_modele_classes/drawio/zalisk_modele_classes.pdf)

---

## 2. Comment Modifier le Diagramme Draw.io

Le fichier `zalisk_modele_classes.drawio` est un fichier XML conforme au standard mxGraph :
1. Rendez-vous sur [app.diagrams.net](https://app.diagrams.net) (ou utilisez l'application bureau Draw.io).
2. Cliquez sur **Fichier > Ouvrir depuis cet appareil** et sélectionnez `zalisk_modele_classes.drawio`.
3. Chaque classe est un objet UML autonome : vous pouvez double-cliquer pour éditer un attribut, déplacer une classe, changer une couleur de package ou modifier une cardinalité.

---

## 3. Guide de Lecture Typographique
- **Packages thématiques :**
  - **Bleu doux (`#EFF6FF`, bordure `#2563EB`) :** Multi-Tenant & Identités.
  - **Vert émeraude (`#ECFDF5`, bordure `#059669`) :** Conversations & Tickets SAV.
  - **Ambre (`#FFFBEB`, bordure `#D97706`) :** Organisation SAV, Profils & Compétences.
  - **Violet (`#FAF5FF`, bordure `#7C3AED`) :** Gestion Commerciale, Souscriptions & SasPay.
- **Symboles de relation :**
  - Losange noir plein (`*--`) : **Composition** (dépendance existentielle forte).
  - Ligne simple avec flèche ouverte (`-->`) : **Association dirigée**.
  - Ligne simple sans flèche (`--`) : **Association bidirectionnelle**.
