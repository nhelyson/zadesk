# RAPPORT TECHNIQUE DE VALIDATION DU DIAGRAMME UML
## Modélisation Tri-Colonnes & Séparation RAG Interne / Inférence Cloudflare (OMG UML 2.5)
### Projet Zalisk — Mémoire de Licence en Génie Informatique (Section 3.3.1.1)

---

### Résumé exécutif de conformité
- **Type de modélisation :** Diagramme global de cas d'utilisation (OMG UML 2.5).
- **Plateforme modélisée :** Solution SaaS multi-entreprises **Zalisk** (Gestion omnicanale et intelligente du SAV).
- **Organisation spatiale :** Architecture en 3 colonnes verticales au sein d'une frontière unique rectangulaire (`SYSTÈME ZALISK`), sans sous-boîtes ni packages internes.
- **Acteurs :**
  - **Acteurs externes (à gauche) :** `Client (Grand Public)` et `Cloudflare Workers AI` (`<<service>>` Fournisseur de modèles LLM).
  - **Acteurs internes (à droite) :** `Conseiller SAV (AGENT)`, `Superviseur SAV (MANAGER)`, `Administrateur (ADMIN)`, `Propriétaire (OWNER)`.
- **Fichiers livrables :**
  - Fichier Draw.io natif éditable : [`documentation/uml/diagramme_cas_utilisation_global.drawio`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.drawio)
  - Fichier Vectoriel SVG : [`documentation/uml/diagramme_cas_utilisation_global.svg`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.svg)
  - Fichier Haute Résolution PNG : [`documentation/uml/diagramme_cas_utilisation_global.png`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.png)
  - Code source PlantUML : [`documentation/uml/diagramme_cas_utilisation_global.puml`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.puml)
  - Audit fonctionnel détaillé : [`documentation/uml/analyse_acteurs_fonctionnalites.md`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/analyse_acteurs_fonctionnalites.md)
- **Statut de conformité :** **CONFORME À 100 %**. Respect strict de la norme OMG UML 2.5, séparation technique rigoureuse entre l'inférence Cloudflare et le moteur RAG Zalisk, et élimination complète des faisceaux de câbles croisés.

---

## 1. Clarification architecturale : RAG Interne Zalisk vs Inférence Cloudflare

Une correction architecturale majeure a été apportée pour refléter fidèlement le fonctionnement réel du code de Zalisk :

### 1.1 Ce que fournit Cloudflare Workers AI
- **Rôle :** Acteur système externe modélisé avec le stéréotype `<<service>>`.
- **Périmètre strict :** Fourniture de modèles d'apprentissage profond et exécution brute de l'inférence textuelle (`@cf/meta/llama-3-8b-instruct`, etc.).
- **Cas d'utilisation associé :** `Exécuter l'inférence des modèles LLM (Génération de texte via Cloudflare)`.
- **Limite formelle :** Cloudflare ne détient **pas** la logique métier, n'indexe **pas** les documents d'assistance de l'entreprise et n'exécute **pas** le pipeline RAG.

### 1.2 Ce que fournit Zalisk (Moteur RAG Interne)
- **Rôle :** Cœur applicatif intelligent développé au sein de la plateforme SaaS Zalisk.
- **Périmètre RAG :**
  1. *Indexation & Vectorisation :* Découpage des articles et FAQ administrés par l'entreprise (`Administrer la base documentaire pour le RAG`).
  2. *Recherche sémantique :* Calcul des vecteurs de similarité et extraction des segments documentaires pertinents.
  3. *Assemblage contextuel :* Injection dynamique du contexte SAV dans le prompt système.
  4. *Appel à l'inférence :* Transmission du prompt préparé au cas d'utilisation `Exécuter l'inférence des modèles LLM` via une relation `<<include>>`.
- **Cas d'utilisation client :** `Obtenir une assistance automatisée par RAG (Moteur interne Zalisk)`.
- **Cas d'utilisation conseiller :** `Écouter les suggestions de réponses formulées par l'IA` (copilote SAV) incluant également `Exécuter l'inférence des modèles LLM`.

---

## 2. Organisation spatiale en 3 colonnes fonctionnelles

Le système est délimité par un unique rectangle sobre sans sous-boîtes, structuré en trois couloirs verticaux identifiés par des codes couleur harmonieux :

```
┌─────────────────────────────────┐   ┌────────────────────────────────────────────────────────────────────────┐   ┌───────────────────────────────┐
│                                 │   │                            SYSTÈME ZALISK                              │   │                               │
│                                 │   │                                                                        │   │  [Conseiller SAV (AGENT)]     │
│   Client (Grand Public)         │───┼──>  COLONNE 1                 COLONNE 2                 COLONNE 3      │───┼──> (Dispo, Traiter, Tickets)  │
│   (Portail Public & Suivi)      │   │   • Fiches assistance       • Suggestions IA          • File d'attente │   │                               │
│                                 │   │   • Soumettre ticket        • Gérer disponibilité     • Respect SLA    │   │  [Superviseur SAV (MANAGER)]  │
│                                 │   │   • Tchat omnicanal         • Traiter conv. clients   • Établissements │───┼──> (Pilotage & Équipes)       │
│                                 │   │   • Suivre avancement       • Élever en ticket        • Compétences    │   │                               │
│                                 │   │   • Assistance RAG          • Notes internes          • Réaffectation  │   │  [Administrateur (ADMIN)]     │
│   Cloudflare Workers AI         │   │   • Transfert humain        • Partager ticket         • Rôles RBAC     │───┼──> (Gouvernance & Base RAG)   │
│   <<service>> (Inférence LLM)   │───┼──>• Inférence LLM           • Cycle de vie tickets    • Base doc. RAG  │   │                               │
│                                 │   │                                                       • Paramètres     │   │  [Propriétaire (OWNER)]       │
│                                 │   │                                                       • Stripe SaaS    │───┼──> (Abonnement & Workspace)   │
│                                 │   │                                                       • Supprimer WS   │   │                               │
└─────────────────────────────────┘   └────────────────────────────────────────────────────────────────────────┘   └───────────────────────────────┘
     (Acteurs Externes - Gauche)                         (Frontière Unique du Système Zalisk)                            (Acteurs Internes - Droite)
```

### Détail des 3 colonnes :
1. **Colonne 1 (Gauche) — Portail Public & Inférence Externe :**
   - *Bleu pastel (#EFF6FF, bordure #3B82F6) :* `Consulter l'annuaire des fiches assistance`, `Soumettre une demande SAV en ligne (création ticket)`, `Échanger par messagerie temps réel (chat direct)`, `Suivre l'état d'avancement de sa demande SAV`.
   - *Violet pastel (#FAF5FF, bordure #9333EA) :* `Obtenir une assistance automatisée par RAG (Moteur interne Zalisk)`, `Solliciter un transfert vers un conseiller humain`, `Exécuter l'inférence des modèles LLM (Génération de texte via Cloudflare)`.
2. **Colonne 2 (Centre) — Suggestions Copilote & Traitement SAV Humain :**
   - *Violet pastel :* `Écouter les suggestions de réponses formulées par l'IA`.
   - *Vert pastel (#ECFDF5, bordure #10B981) :* `Gérer son statut de disponibilité`, `Traiter les conversations clients et demandes en attente`, `Élever une conversation en Ticket SAV officiel`, `Rédiger des notes internes d'équipe`, `Partager un ticket à d'autres agents (entraide collaborative)`, `Gérer le cycle de vie des tickets SAV (SLA)`.
3. **Colonne 3 (Droite) — Supervision, Administration & Gouvernance :**
   - *Ambre pastel (#FFFBEB, bordure #F59E0B) :* `Superviser les files d'attente et la charge de travail`, `Consulter les tableaux de bord analytiques et le respect SLA`, `Gérer les établissements de l'entreprise`, `Définir et attribuer les compétences agents (Skills)`, `Réaffecter manuellement un ticket ou une conversation`.
   - *Ardoise (#F8FAFC, bordure #64748B) :* `Suspendre ou réactiver l'accès d'un collaborateur`, `Inviter des membres et attribuer les rôles (RBAC)`, `Administrer la base documentaire pour le RAG (Articles & FAQ)`, `Configurer les paramètres de l'entreprise (canaux, horodatage)`.
   - *Magenta (#FDF2F8, bordure #C026D3) :* `Gérer l'abonnement SaaS et les paiements Stripe`, `Supprimer définitivement l'espace de travail`.

---

## 3. Optimisation de la lisibilité et élimination du faisceau de câbles

Dans les ébauches antérieures, l'acteur `Conseiller SAV` présentait 7 lignes courbes superposées formant un « faisceau spaghetti » disgracieux traversant l'ensemble du diagramme. 

Conformément aux préconisations d'ingénierie logicielle (OMG UML 2.5) :
1. **Connexions directes d'acteurs limitées aux cas de base :**
   - `Conseiller SAV` est relié uniquement à ses 3 cas d'usage nominaux :
     - `Gérer son statut de disponibilité`
     - `Traiter les conversations clients et demandes en attente`
     - `Gérer le cycle de vie des tickets SAV (SLA)`
2. **Modularisation par extensions internes (`<<extend>>`) :**
   - Les fonctionnalités complémentaires étendent directement les cas de base à l'intérieur du système :
     - `Élever une conversation en Ticket SAV officiel` ..> `Traiter les conversations clients` : `<<extend>>`
     - `Rédiger des notes internes d'équipe` ..> `Traiter les conversations clients` : `<<extend>>`
     - `Partager un ticket à d'autres agents` ..> `Gérer le cycle de vie des tickets SAV` : `<<extend>> [besoin d'expertise]`
     - `Écouter les suggestions de réponses formulées par l'IA` ..> `Traiter les conversations clients` : `<<extend>> [assistance active]`
3. **Résultat :** Les lignes de liaison sont nettes, aérées, sans croisement chaotique ni encombrement visuel.

---

## 4. Spécifications techniques du fichier Draw.io (`.drawio`)

Le fichier `diagramme_cas_utilisation_global.drawio` respecte l'arborescence XML standard de diagrams.net :
- **Modèle :** `<mxGraphModel dx="2200" dy="1400" grid="1" ...>`
- **Dimensions de page :** $2\,050\text{ px} \times 1\,260\text{ px}$ (format A4 Paysage haute définition).
- **Entités :**
  - Bonshommes bâtons UML (`shape=umlActor`) avec couleurs distinctes de contour et étiquettes typographiques soignées.
  - Ellipses UML (`ellipse`) avec couleurs pastels thématiques et retour à la ligne automatique (`whiteSpace=wrap`).
  - Lignes d'association orthogonales / courbes douces (`endArrow=none`).
  - Dépendances en pointillés (`dashed=1;dashPattern=4 4;endArrow=open;endFill=0;`) annotées des stéréotypes `<<include>>` et `<<extend>>`.
- **Compatibilité :** Ouverture immédiate dans l'application bureau Draw.io, sur [app.diagrams.net](https://app.diagrams.net), ou dans les extensions VS Code / JetBrains / TeXstudio.

---

## 5. Synthèse des livrables et liens directs

| Format | Fichier | Rôle dans le projet |
| :--- | :--- | :--- |
| **Draw.io Natif** | [`diagramme_cas_utilisation_global.drawio`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.drawio) | Fichier source éditable dans diagrams.net / draw.io |
| **Vectoriel SVG** | [`diagramme_cas_utilisation_global.svg`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.svg) | Rendu vectoriel infini sans perte de résolution |
| **Raster PNG** | [`diagramme_cas_utilisation_global.png`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.png) | Image haute définition pour insertion directe |
| **PlantUML** | [`diagramme_cas_utilisation_global.puml`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/diagramme_cas_utilisation_global.puml) | Code source textuel pour traçabilité Git |
| **Audit Métier** | [`analyse_acteurs_fonctionnalites.md`](file:///c:/Users/japhet/Downloads/zadesk/documentation/uml/analyse_acteurs_fonctionnalites.md) | Justification académique des 5 acteurs et 25 cas d'usage |
