# RÉFÉRENTIEL DES DIAGRAMMES UML — PROJET ZADESK

Ce dossier regroupe l'ensemble des diagrammes d'analyse et de modélisation du projet SaaS **Zadesk**, directement exploitables dans **Draw.io (diagrams.net)**, **PlantUML**, ainsi qu'au format image haute définition pour l'intégration dans votre mémoire universitaire de fin de cycle.

---

## 1. Structure du dossier diagrammes/

```text
diagrammes/
├── Zadesk_Architecture_Fonctionnelle.drawio # Architecture fonctionnelle globale & acteurs (Section 3.2.2)
├── Zadesk_Architecture_Fonctionnelle.svg    # Export vectoriel SVG de l'architecture fonctionnelle
├── Zadesk_Architecture_Fonctionnelle.png    # Export matriciel PNG haute définition de l'architecture fonctionnelle
├── Zadesk_Diagramme_Classes.drawio         # Diagramme de classes complet multi-pages (7 pages avec onglets)
├── Zadesk_Diagramme_Classes_Global.drawio  # Vue globale en une seule page (24 classes + relations, aéré et compact)
├── Zadesk_Diagramme_Classes.svg            # Export vectoriel SVG (qualité infinie, idéal pour Word/LaTeX)
├── Zadesk_Diagramme_Classes.png            # Export matriciel 300 DPI haute résolution
├── Zadesk_Diagramme_Classes.puml           # Code source PlantUML normé UML 2.x
├── Zadesk_Diagramme_Cas_Utilisation.drawio # Diagramme des Cas d'Utilisation (UML 2.5)
├── Zadesk_Diagramme_Sequence.drawio        # Diagramme de Séquence (Cycle de vie SAV & Escalade)
│
└── domaines/                               # Diagrammes de classes découpés par domaine métier
    ├── 1_Entreprises_MultiTenant.drawio    # Workspace, User, Membership, Establishment, Invitation
    ├── 2_Agents_Competences.drawio         # AgentProfile, Skill, AgentSkill, AssignmentEngine
    ├── 3_Tickets_SAV.drawio                # Customer, Ticket, TicketActivity, Assignment, Share
    ├── 4_Conversations_Omnicanal.drawio    # Conversation, Message, Share
    ├── 5_Assistance_IA_RAG.drawio          # KnowledgeDocument, Chunk (MongoDB), Supervisor, Config
    └── 6_Evenements_Audit.drawio           # OutboxEvent, PulseEvent (SSE), AuditLog
```

---

## 2. Comment ouvrir et utiliser les fichiers dans Draw.io

### Méthode 1 : Sur le navigateur (app.diagrams.net)
1. Rendez-vous sur [https://app.diagrams.net/](https://app.diagrams.net/).
2. Cliquez sur **Ouvrir un diagramme existant** (*Open Existing Diagram*).
3. Choisissez le fichier de votre choix :
   - Pour la vue globale directe et aérée : **Zadesk_Diagramme_Classes_Global.drawio** (s'affiche immédiatement en plein écran, largeur optimisée 1 680 px, couleurs thématiques nettes).
   - Pour la modélisation complète avec navigation par onglets : **Zadesk_Diagramme_Classes.drawio** (7 pages thématiques).
   - Pour travailler sur un domaine isolé : l'un des fichiers du sous-dossier **domaines/**.
4. Tous les éléments (classes, compartiments, attributs, méthodes, stéréotypes, connecteurs de relations) sont **100% natifs, sélectionnables, déplaçables et éditables**.

---

## 3. Charte des Couleurs par Domaine Métier

Chaque domaine fonctionnel bénéficie d'une identité visuelle distincte pour faciliter la lecture académique :
- 🏢 **Organisation & Multi-Tenant** : Bleu pastel (#EFF6FF, bordure #3B82F6, en-tête #1E40AF)
- 👤 **Utilisateurs & Authentification** : Émeraude pastel (#ECFDF5, bordure #10B981, en-tête #065F46)
- 🎧 **Agents & Affectation** : Ambre chaleureux (#FFFBEB, bordure #F59E0B, en-tête #92400E)
- 🎫 **Demandes SAV & Tickets** : Violet lavande (#FAF5FF, bordure #8B5CF6, en-tête #5B21B6)
- 💬 **Conversations & Dialogue Direct** : Cyan / Turquoise (#F0FDFA, bordure #0D9488, en-tête #0F766E)
- 🤖 **Module IA & RAG (Architecture Cible)** : Indigo avec bordure tiretée (#EEF2FF, bordure #6366F1, en-tête #4338CA)
- ⚡ **Événements & Traçabilité** : Gris ardoise (#F8FAFC, bordure #64748B, en-tête #334155)

---

## 4. Légende des relations UML 2.x

- **Composition (Losange plein noir ◆)** : Dépendance existentielle forte (cycle de vie lié, suppression en cascade).
- **Agrégation (Losange blanc ◇)** : Relation tout-partie sans destruction exclusive.
- **Association simple / dirigée (— / -->)** : Lien structurel direct ou d'affectation.
- **Dépendance (Flèche tiretée - - >)** : Appel algorithmique ou déclenchement événementiel.
- **Cadre tireté bleu** : Composants de l'architecture cible IA hébergés sur MongoDB Atlas.
