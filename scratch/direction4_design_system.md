# ZADESK DESIGN SYSTEM — OPERATIONAL EDITORIAL SYSTEM (DIRECTION 4)
## Spécifications Officielles & Architecture Technique de la Workspace

> **Référence :** Système de design canonique Zadesk 2026.  
> **Orientation validée :** Direction 4 — *Operational Editorial System*.  
> **Auteurs :** Direction de Création & Product Architecture Zadesk.  
> **Fichiers associés :**  
> - Tokens CSS : [`scratch/direction4_tokens.css`](file:///c:/Users/japhet/Downloads/zadesk/scratch/direction4_tokens.css)  
> - Catalogue interactif : [`scratch/direction4_component_library.html`](file:///c:/Users/japhet/Downloads/zadesk/scratch/direction4_component_library.html)  
> - Modèles de composition : [`scratch/direction4_module_patterns.md`](file:///c:/Users/japhet/Downloads/zadesk/scratch/direction4_module_patterns.md)  
> - Directives Mobile & PWA : [`scratch/direction4_mobile_guidelines.md`](file:///c:/Users/japhet/Downloads/zadesk/scratch/direction4_mobile_guidelines.md)

---

## 1. MANIFESTE : PHILOSOPHIE DES SURFACES ET NUANCE DU "CARD UI"

Le design d'application SaaS s'est trop souvent enfermé dans un automatisme réducteur : tout placer dans de petites boîtes blanches fermées (`border-slate-200 rounded-xl shadow-sm`).  
Lorsque huit boîtes identiques se côtoient sur un écran, l'utilisateur subit une **fatigue cognitive immédiate** : les bordures s'entrechoquent, la hiérarchie est nivelée et l'œil hésite.

**La règle du système Zadesk n'est PAS de supprimer définitivement les cartes.**  
La règle est de **ne plus utiliser systématiquement le Card UI pour compartimenter artificiellement chaque donnée**. Une carte est autorisée et recommandée lorsqu'elle répond à un besoin fonctionnel précis ou améliore réellement la compréhension.

### Matrice de Décision : Quand utiliser quel conteneur ?

| Conteneur d'Interface | Définition & Rôle | Critères d'Utilisation dans Zadesk | Exemple Métier Concret |
| :--- | :--- | :--- | :--- |
| **Surface Ouverte (Open Canvas)** | Espace continu sans boîte fermée reposant sur le fond Lin (`#FAFAF8`). | Lorsque l'enchaînement narratif et la continuité visuelle priment. Permet à la page de respirer. | Le bulletin éditorial de commandement (Dispatch Masthead) au sommet du cockpit. |
| **Séparation Typographique (Hairline)** | Filet ultra-fin de 1px (`rgba(13, 27, 61, 0.08)`). | Pour séparer deux sections sœurs sans ajouter de marge ou de contour encombrant. | Séparation entre le plan de travail gauche et la colonne de régulation droite. |
| **Liste (Stream)** | Succession verticale d'éléments textuels légers. | Pour consulter une suite chronologique d'événements homogènes sans manipulation complexe. | Le journal de bord des événements SAV (créations, assignations, clôtures). |
| **Tableau (Table)** | Grille à colonnes strictes alignant des données structurées. | Lorsque l'utilisateur doit comparer rapidement des attributs sur plusieurs lignes (référence, client, attente, statut). | La file de traitement des demandes (Dispatch Table), la table des membres d'équipe. |
| **Carte (Card / Plate)** | Surface fermée blanche (`#FFFFFF`) avec micro-bordure et padding dédié. | **Réservée à une unité décisionnelle autonome ou un objet métier compact** nécessitant une attention concentrée. | L'îlot d'arbitrage prioritaire n°1 (Incident Bay), un cartouche d'agence physique, un récapitulatif client. |
| **Panneau Latéral (Slide-over)** | Volet coulissant depuis la droite (480px sur Desktop). | Pour inspecter ou modifier une entité détaillée sans perdre le fil ou quitter la page maîtresse. | Fiche détaillée d'un ticket avec timeline d'activité et formulaire de réassignation. |
| **Modale (Dialog)** | Fenêtre centrée avec voile sombre d'interruption. | **Strictement réservée aux actions critiques bloquantes** nécessitant une confirmation explicite. | Confirmation de suppression définitive d'un compte, clôture irréversible d'un litige. |

---

## 2. SYSTÈME DE DESIGN TOKENS CANONIQUES

Le système de tokens est strictement synchronisé avec les fondations de la landing page et le module `frontend/src/components/workspace/design-system/tokens.ts` créé en Phase 1.

### A. Règle Proportionnelle de Couleur : 60 - 28 - 8 - 3 - 1

```
┌────────────────────────────────────────────────────────┬──────────────┬────────┬──────┬──┐
│ Canvas Lin Chaud (#FAFAF8) — 60%                      │ Surfaces (28%)│Navy(8%)│Em.(3%)│Am1│
└────────────────────────────────────────────────────────┴──────────────┴────────┴──────┴──┘
```

| Token CSS | Code Hex / RGBA | Rôle Fonctionnel | Proportion |
| :--- | :--- | :--- | :--- |
| `--z-color-canvas` | `#FAFAF8` | Fond continu du cockpit et des pages. Évite l'éblouissement du blanc clinique. | **60%** |
| `--z-color-surface` | `#FFFFFF` | Plaques opérationnelles d'écriture, tables de données et panneaux actifs. | **28%** |
| `--z-color-navy-900` | `#0D1B3D` | Encrage structural Zadesk : titrage d'autorité, navigation active, boutons primaires. | **8%** |
| `--z-color-emerald-500` | `#22C55E` / `#059669` | Signalétique de santé système, dossiers résolus, taux nominaux de capacité. | **3%** |
| `--z-color-amber` | `#D97706` | Signalétique d'attention : arbitrage requis, dossiers en attente d'agent. | **1%** |
| `--z-color-rose` | `#DC2626` | Dépassement critique de délai (SLA breach), actions destructives. | **< 1%** |

### B. Hiérarchie Typographique Suisse (Outfit + Inter + JetBrains Mono)

| Style Typographique | Famille | Taille / Leading | Poids / Tracking | Cas d'Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Impact** | `Outfit` | `44px` / `1.05` | `800` / `-0.03em` | Grands chiffres de synthèse, métriques de tension. |
| **Titre H1 Éditorial** | `Outfit` | `22px` / `1.25` | `800` / `-0.025em` | Phrase maîtresse de commandement du service SAV. |
| **Titre H2 Section** | `Outfit` | `17px` / `1.30` | `700` / `-0.02em` | Titre du dossier en arbitrage, en-têtes de colonnes. |
| **Titre H3 Sous-section**| `Outfit` | `14px` / `1.35` | `700` / `0.05em (UPPER)` | En-tête de file continue, titre du journal de quart. |
| **Corps Courant** | `Inter` | `13px` / `1.50` | `400` / `normal` | Texte des réclamations clients, descriptions. |
| **Texte Interface** | `Inter` | `12px` / `1.45` | `500` - `600` | Cellules de tableaux, boutons, labels de contrôles. |
| **Métadonnées / Heures** | `Inter` | `11px` / `1.40` | `500` / `normal` | Temps écoulé, agence de rattachement. |
| **Identifiants / SLA** | `JetBrains Mono`| `11px` / `1.30` | `600` / `tabular-nums` | Codes dossiers (`#TK-8021`), chronomètres d'attente. |

### C. Échelle Spatiale Modulaire & Breakpoints

- **Échelle d'espacement de base :** Multiple de 4px / 8px :  
  `--z-space-1: 4px`, `--z-space-2: 8px`, `--z-space-3: 12px`, `--z-space-4: 16px`, `--z-space-6: 24px`, `--z-space-8: 32px`.
- **Dimensions de référence :**
  - Desktop : `1440 × 900 px` (Sidebar fixe 256px + Dual-Plane 1fr / 360px).
  - Mobile : `390 × 844 px` (Topbar 54px + Viewport vertical scrollable + Bottom Nav 60px).
  - Breakpoints : Mobile `< 768px`, Tablette `768px - 1024px`, Desktop `≥ 1024px`.

---

## 3. RÈGLES DE COMPOSITION SPATIALE DUAL-PLANE

Toute page majeure de la Workspace repose sur la composition **Dual-Plane** :

```
┌────────────────────────────────────────────────────────┬─────────────────────────────────────────┐
│ PLAN MAÎTRE OPÉRATIONNEL (68% largeur)                 │ PLAN DE RÉGULATION & CONTRÔLE (32%)     │
│                                                        │                                         │
│ 1. Le Bulletin de Commandement (Dispatch Masthead)     │ 1. Baromètre de Capacité Nominale       │
│ 2. L'Îlot d'Intervention Intégré (Incident Bay)        │ 2. Conseillers de Quart en Ligne        │
│ 3. La Table de Flux Haute Densité (Dispatch Table)     │ 3. Gouvernance IA (État de Préparation) │
│                                                        │ 4. Journal de Bord Vivant (Prisma Logs) │
└────────────────────────────────────────────────────────┴─────────────────────────────────────────┘
```

### Règle d'or de la surface continue
1. Les deux plans sont séparés par une **hairline verticale fine** (`1px solid rgba(13, 27, 61, 0.08)`).
2. Aucun panneau ne flotte avec une ombre floue. Les surfaces s'emboîtent au millimètre près.
3. Les informations prioritaires sont indiquées par un **filet d'attention ambre de 4px à gauche**, jamais par un fond jaune criard sur l'ensemble du bloc.

---

## 4. BIBLIOTHÈQUE DES COMPOSANTS FONDAMENTAUX

### A. Boutons & Déclencheurs d'Action

- **Bouton Primaire Zadesk (Navy Command) :**
  - Fond : `#0D1B3D`, Texte : `#FFFFFF`, Rayon : `6px`, Hauteur : `36px` (Desktop) / `44px` (Mobile).
  - Hover : `#152C61`, Active : `transform: scale(0.98); transition: transform 100ms ease;`.
  - Usage : Action décisive unique par écran (*"Prendre en charge immédiatement"*, *"Nouveau dossier"*).
- **Bouton Secondaire Hairline :**
  - Fond : `#FFFFFF`, Bordure : `1px solid #CBD5E1`, Texte : `#475569`.
  - Usage : Actions secondaires (*"Assigner à un conseiller"*, *"Filtrer"*).
- **Bouton Tertiaire Ghost :**
  - Fond transparent, Texte : `#64748B`, Hover : `background: rgba(13, 27, 61, 0.05)`.
  - Usage : Actions contextuelles légères (*"Voir tout &rarr;"*, *"Fermer"*).

### B. Contrôles de Formulaire & Saisie

- **Champ de Saisie / Select :**
  - Hauteur : `38px` (Desktop) / `44px` (Mobile pour confort tactile).
  - Fond : `#FFFFFF`, Bordure : `1px solid #E2E8F0`, Rayon : `6px`.
  - Focus : `border-color: #0D1B3D; box-shadow: 0 0 0 3px rgba(13, 27, 61, 0.08); outline: none;`.
- **Barre de Recherche avec Raccourci Clavier (`⌘K`) :**
  - Badge intégré en monospace gris clair (`⌘K`), loupe discrète en encre atténuée.

### C. Badges de Statut Sémantiques (Status Pills)

Les badges utilisent une typographie `font-bold text-[10px]` en capitales avec micro-padding `2px 8px` et `rounded-full` :
- **À Assigner / Urgent :** Fond `#FFFBEB`, Texte `#D97706` (Ambre).
- **En Cours de Traitement :** Fond `#EFF6FF`, Texte `#1D4ED8` (Bleu Cobalt).
- **Résolu / Clôturé :** Fond `#ECFDF5`, Texte `#059669` (Émeraude Zadesk).
- **En Attente Client :** Fond `#F1F5F9`, Texte `#475569` (Gris neutre).

### D. Tables de Flux Haute Densité (Dispatch Table)

- Lignes de tableau à structure continue inspirées de Linear :
  - Hauteur de ligne : `44px`.
  - Colonnes fixes : Référence Monospace (85px), Client (150px), Objet de la demande (1fr), Délai d'attente (100px), Badge statut (90px).
  - Survol : Fond subtil `#F8FAFC` avec transition fluide à 120ms.

### E. Modales & Tiroirs d'Inspection (Flyout Drawers)

- **Desktop :** Tiroir latéral glissant depuis la droite (Slide-over de 480px) plutôt qu'une modale intrusive au centre. Permet à l'agent de consulter le dossier tout en gardant un œil sur le flux d'activité.
- **Mobile :** Feuille inférieure remontante (Bottom Sheet) ancrée au bas de l'écran avec poignée tactile de glissement.

---

## 5. ERGONOMIE MOBILE & STANDARDS PWA

1. **Touch Targets conformes à Apple :** Tout bouton ou zone cliquable mesure au moins **44 × 44 pixels**.
2. **Élimination de la latence tactile :** Déclaration globale `touch-action: manipulation` pour supprimer le délai de 300ms au clic sur Chrome Mobile / Safari.
3. **Protection contre les bugs de survol :** Tous les effets `:hover` sont strictement isolés derrière `@media (hover: hover) and (pointer: fine)`.
4. **Bottom Navigation Bar Officielle Validée (Phase 1) :** Les 5 onglets canoniques sont ancrés avec padding pour la zone de sécurité (`env(safe-area-inset-bottom)`) :
   - **Accueil (`/app`)** : Vue de synthèse opérationnelle et interventions prioritaires.
   - **Conversations (`/app/conversations`)** : Messagerie directe avec les clients via portail web.
   - **Demandes (`/app/tickets`)** : Suivi des réclamations et tickets formels.
   - **Paramètres (`/app/settings`)** : Configuration du compte, profil, agences et notifications.
   - **Menu** : Ouvre le tiroir complet donnant accès aux 5 piliers métier de la Workspace.

---

## 6. POLITIQUE D'ANIMATION & PERFORMANCE

- **Philosophie :** Zéro animation décorative. Le mouvement est physique, réactif et interruptible (Principes WWDC 2018).
- **Moteur d'animation :**
  - Transitions locales : CSS `cubic-bezier(0.16, 1, 0.3, 1)` sur 120ms à 180ms.
  - Séquences orchestrées : GSAP timelines légères pour les apparitions de volets.
- **Accessibilité :** Détection native `@media (prefers-reduced-motion: reduce)` désactivant instantanément toutes les transitions pour les utilisateurs sensibles ou les appareils Android modestes.

---

## 7. FRONTIÈRES MÉTIER & VÉRITÉ DU MODÈLE BACKEND (PRISMA SCHEMA)

Pour garantir qu'aucun composant ne suppose des données absentes du backend réel :

| Donnée Métier | Modèle Prisma Réel | Règles d'Affichage & Fallbacks Obligatoires |
| :--- | :--- | :--- |
| **Délai SLA (Échéance)** | `Ticket.slaDueAt (DateTime?)` | **Optionnel.** Si le champ est `null`, ne jamais afficher un faux décompte : afficher `"Sans échéance"` ou omettre le timer. |
| **Priorité de Conversation** | `Conversation.priority (MEDIUM def)` | **Optionnelle.** Les conversations non notées ne doivent pas afficher un faux badge critique d'urgence. |
| **Disponibilité Agent (Heartbeat)** | `AgentProfile` | Si la présence temps réel (en ligne / en pause) n'est pas mesurée par websocket, afficher uniquement le rôle ou l'agence de rattachement. |
| **Agences physiques** | `Establishment` (Optionnel) | **Non obligatoire.** Une PME peut n'avoir aucune boutique physique. Afficher un état vide sobre et élégant sans message d'erreur. |
| **Module IA** | Moteur en configuration | `aiResolutionRate: null`. Afficher explicitement la mention *"Module IA en phase de paramétrage — Traitement 100% humain"* sans simulation. |
| **Canal entrant WhatsApp** | Non implémenté | Zéro statut WhatsApp entrant dans l'ensemble de la Workspace. Seul le portail client Web est le canal actif. |
| **Transactions SasPay** | Confiné à `/app/billing` | Zéro transaction financière fictive sur le cockpit opérationnel du SAV. |

---
*Ce document sert de contrat d'interface officiel pour l'ensemble des développements de la Workspace Zadesk.*
