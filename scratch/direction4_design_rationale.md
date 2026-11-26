# ZADESK — DIRECTION ARTISTIQUE 04 : OPERATIONAL EDITORIAL SYSTEM
## Manifeste de Conception, Architecture Spatiale & Rationale Ergonomique

> **Statut :** Proposition officielle de 4e Direction Artistique (Mission 04).  
> **Auteurs :** Direction de Création & Équipe Senior Product Design Zadesk.  
> **Prototypes associés :**  
> - Desktop (1440 × 900) : [`scratch/mockup_dir4_editorial.html`](file:///c:/Users/japhet/Downloads/zadesk/scratch/mockup_dir4_editorial.html)  
> - Mobile / PWA (390 × 844) : [`scratch/mockup_dir4_mobile.html`](file:///c:/Users/japhet/Downloads/zadesk/scratch/mockup_dir4_mobile.html)  
> - Studio Comparatif Interactif : [`scratch/comparatif-directions.html`](file:///c:/Users/japhet/Downloads/zadesk/scratch/comparatif-directions.html)

---

## 1. VISION CRÉATIVE & CONCEPT DIRECTEUR

### Pourquoi une quatrième direction ?
Les trois premières directions ont permis d'explorer des pistes précieuses mais présentaient chacune un déséquilibre :
- **Direction 1 (Le Registre) :** Trop rigide dans son découpage en trois colonnes étanches (310px / 1fr / 320px). L'autorité sombre de gauche écrasait un peu la zone centrale qui redevenait une simple table.
- **Direction 2 (Le Pupitre Focal) :** Très efficace pour l'arbitrage, mais le pupitre conservait encore une forme proche d'une "grosse carte d'alerte", risquant de retomber dans la fatigue du Card UI.
- **Direction 3 (La Trame Typographique) :** Splendide sur le plan esthétique et littéraire, mais trop plate et contemplative pour un opérateur SAV qui doit traiter des demandes avec rapidité (sensation de lire un journal plutôt que de piloter un cockpit).

### L'Idée Fondatrice de la Direction 4 : *The Dual-Plane Dispatch Console*
> **« L'ordonnancement rigoureux du graphisme suisse (grille mathématique, contrastes hiérarchiques, hairlines de structure) fusionné avec la vitesse de triage chirurgicale des meilleurs postes d'aiguillage au monde. »**

Zadesk ne choisit plus entre *la carte* et *le texte brut*. L'interface devient une **console continue à double plan architectural** :
1. **Le Plan Opérationnel Maître (Gauche - 68%) :** Un continuum de travail intégrant le bulletin narratif de commandement, l'îlot d'intervention prioritaire et la table de traitement haute densité.
2. **Le Plan de Ressources & Contrôle (Droite - 32%) :** Un panneau blanc statutaire gérant l'équilibre capacitaire, l'état des conseillers de quart sur les agences CEMAC (Douala, Yaoundé, Brazzaville) et le journal d'activité certifié.

---

## 2. LES 4 PILIERS DE LA COMPOSITION

### A. La Fin Définitive du « Card UI »
Aucun rectangle blanc flottant avec ombre floue et bordure grise n'est toléré.
Les séparations se font par :
- Des **hairlines d'encre ultra-fines** : `rgba(13, 27, 61, 0.08)` (1px).
- Des **différences de valeur de surface** : fond Lin chaud `#FAFAF8` pour la respiration, plaques blanches `#FFFFFF` pour la concentration de données, et encrage Midnight Navy `#0D1B3D` pour l'autorité.
- Une **continuité verticale** : les informations s'enchaînent logiquement sans rupture de cadre.

### B. Le Bulletin Éditorial de Commandement (Dispatch Masthead)
Au lieu d'afficher 4 compteurs muets sans contexte, l'en-tête du cockpit énonce la situation en français limpide :
> *"14 dossiers ouverts sur le portail, dont **1 arbitrage prioritaire immédiat**. La capacité de traitement de Douala et Yaoundé est nominale à 78%."*

Les chiffres clés ne sont plus des gadgets enfermés dans des boîtes ; ils sont **tissés dans la phrase elle-même**, avec mise en exergue sémantique (ambre pour l'urgence, émeraude pour la stabilité).

### C. L'Îlot d'Intervention Intégré (Incident Bay)
Le dossier le plus urgent n'est ni dilué dans un tableau géant de 20 lignes, ni surélevé en popup intrusive :
- Il est **enchâssé au sommet du flux** avec un liseré d'attention ambre de 4px.
- Il présente directement l'extrait de la réclamation client, le temps d'attente (SLA), l'agence concernée, et les deux boutons d'action décisifs (*"Prendre en charge immédiatement"*, *"Assigner"*).

### D. La Prise en Compte de l'État Calme / Fluide
Un grand SaaS de service client ne doit pas être pensé uniquement pour les moments de panique. Lorsque l'équipe a bien travaillé et que tout est résolu :
- L'îlot d'urgence s'efface élégamment au profit d'une **plaque de sérénité** (*"Aucune intervention urgente en attente — Flux SAV totalement fluide"*).
- Le manager constate instantanément que la situation est saine.  
*(Cette bascule est interactivement testable via le switch "Affluence / Calme" dans le prototype).*

---

## 3. TYPOGRAPHIE & SYSTÈME DE SIGNES

| Police | Rôle dans la Direction 4 | Traitement & Spécifications |
| :--- | :--- | :--- |
| **Outfit** | Voix statutaire de la marque, titrage du bulletin, chiffres de tension | `font-extrabold (800)` / Tracking négatif `-0.025em` / `tabular-nums`. Présence physique sculpturale sans agressivité. |
| **Inter** | Corps de texte, réclamations clients, navigation, boutons | `font-normal (400)` et `font-semibold (600)` / Hauteur de ligne `1.5` / Lisibilité optimale sur écrans denses. |
| **JetBrains Mono** | Références techniques, horodatages certifiés, chronomètres SLA | `font-medium (500)` / `text-[10.5px]` à `11px` / Aligne parfaitement les timecodes et identifiants `#TK-8021`. |

---

## 4. PALETTE CHROMATIQUE & SURFACES

| Rôle | Teinte | Code Hex | Ratio | Intention psychologique |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas** | Lin Chaud | `#FAFAF8` | **60%** | Évite l'effet "feuille blanche clinique", apporte chaleur et repos visuel. |
| **Surfaces de données** | Blanc Pur | `#FFFFFF` | **28%** | Support de lecture à contraste maximal pour les tableaux et registres. |
| **Encrage & Structure** | Midnight Navy | `#0D1B3D` | **8%** | Marque de commandement Zadesk, boutons primaires, traits de tête. |
| **Signalétique de santé** | Émeraude Zadesk | `#059669` / `#22C55E` | **3%** | Réservé strictement aux états résolus, capacités nominales et validations. |
| **Signalétique d'urgence** | Ambre Opérationnel | `#D97706` | **1%** | Réservé exclusivement aux dossiers nécessitant un arbitrage humain immédiat. |

---

## 5. ERGONOMIE MOBILE & EXPÉRIENCE PWA (390 × 844)

Conformément aux directives de conception mobile native (Emil Kowalski & Apple WWDC) :
1. **Thumb-Driven Actions :** Le bouton d'arbitrage d'urgence (*"Prendre en charge immédiatement"*) mesure 44px de hauteur et occupe la pleine largeur de l'écran tactile, situé exactement dans l'arc naturel du pouce.
2. **Suppression des anomalies du web mobile :**
   - `-webkit-tap-highlight-color: transparent` pour éliminer le flash gris désagréable sur Android/iOS.
   - `touch-action: manipulation` pour éliminer la latence de 300ms au tap.
   - Feedback instantané au press via `:active { transform: scale(0.98); }`.
   - Pas d'états de survol collants (hover states isolés par media query).
3. **Bottom Navigation Bar Validée Phase 1 :** Les 5 onglets canoniques (*Cockpit*, *Messages*, *Demandes*, *Équipe*, *Menu*) sont ancrés avec padding pour la zone de sécurité basse (`safe-area-inset-bottom`).

---

## 6. MATRICE DIFFÉRENTIELLE : COMPARAISON DES 4 DIRECTIONS

| Dimension | Direction 1 (Registre) | Direction 2 (Pupitre) | Direction 3 (Trame) | **Direction 4 (Operational Editorial)** |
| :--- | :--- | :--- | :--- | :--- |
| **Métaphore** | Journal de quart | Scène d'urgence | Feuilleton de presse | **Poste d'aiguillage à double plan architectural** |
| **Découpage spatial** | 3 bandes verticales rigides | Bloc haut / Liste bas | 2 colonnes ouvertes | **68% Flux opérationnel continu / 32% Régulation** |
| **Traitement du KPI** | Grand chiffre dans bloc noir | 1 jauge de capacité | 3 chiffres sur fond lin | **Tissé dans la phrase éditoriale + Ruban de tension** |
| **Traitement de l'urgence** | Ligne dans le tableau | Grosse carte centrale | Paragraphe de texte | **Îlot d'intervention intégré avec liseré d'attention 4px** |
| **Gestion du calme** | Non prévue | Non prévue | Non prévue | **Bascule interactive état affluence vs état fluide** |
| **Sensation Mobile** | Effondrement des colonnes | Bonne mais encombrée | Trop de lecture | **PWA native ultra-réactive avec cibles tactiles de 44px** |

---

## 7. CONFORMITÉ RIGOUREUSE AU PRODUIT RÉEL

- **Zéro flux entrant WhatsApp :** Aucun faux indicateur de canal WhatsApp ; le portail client Web est le seul canal actif représenté.
- **Zéro fausse automatisation IA :** Le bloc d'information rappelle avec transparence que l'automatisation IA est en cours de paramétrage et que le traitement est 100% humain.
- **Zéro transaction SasPay sur le Dashboard :** SasPay reste confiné au module de facturation.
- **Étiquetage Démo :** Toutes les données de démonstration affichent explicitement le badge `[DÉMO]`.
- **Zéro modification de fichiers de production :** Le travail est strictement localisé dans `scratch/`.

---
*Fin du document de conception Direction 4. Prêt pour examen comparatif dans `comparatif-directions.html`.*
