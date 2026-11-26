# ZADESK — PHASE 2A : PLAN TECHNIQUE D'IMPLÉMENTATION DU DASHBOARD
## Remplacement Progressif du Dashboard Opérationnel par la Direction 4 (Operational Editorial System)

> **Document de référence :** `scratch/phase2a_dashboard_implementation_plan.md`  
> **Statut :** SPÉCIFICATION TECHNIQUE VALIDÉE (PHASE 2A.1 — AUCUN CODE DE PRODUCTION MODIFIÉ)  
> **Périmètre exclusif :** `/app` (`frontend/src/app/app/(workspace)/page.tsx` et composants associés)  
> **Règle absolue :** Ancrage strict dans les données réelles du backend Prisma. Zéro fabrication de fausses métriques IA, de pourcentages fictifs ou d'actions simulées.

---

## SOMMAIRE

1. [Architecture Actuelle du Dashboard (Audit Exhaustif)](#1-architecture-actuelle-du-dashboard)
2. [Fichiers Concernés dans le Projet](#2-fichiers-concernés)
3. [Données Réelles Disponibles (Backend Prisma vs Mockup)](#3-données-réelles-disponibles)
4. [Correspondance Zone par Zone (Direction 4 vs Vérité Réelle)](#4-correspondance-zone-par-zone)
5. [API, Contextes et Hooks à Réutiliser](#5-api-contextes-et-hooks-à-réutiliser)
6. [Architecture des Composants du Nouveau Dashboard](#6-architecture-des-composants)
7. [Spécifications Distinctes Desktop (1440px) vs Mobile (390px)](#7-desktop-vs-mobile)
8. [Gestion des États : Chargement, Erreur, Sérénité et Nouvel Espace](#8-gestion-des-états)
9. [Matrice des Risques Techniques & Stratégies d'Atténuation](#9-matrice-des-risques-techniques)
10. [Plan de Tests de Non-Régression & Critères d'Acceptation](#10-plan-de-tests-de-non-régression)
11. [Validation Approfondie des Métriques, Permissions et Actions](#11-validation-des-métriques-permissions-et-actions)
12. [Limitations Restantes du Dashboard](#12-limitations-restantes)

---

## 1. ARCHITECTURE ACTUELLE DU DASHBOARD

### A. Analyse du Composant Existant (`AppDashboardView.tsx` — 879 lignes)
Le Dashboard actuel est concentré dans un fichier monolithique de 879 lignes : `frontend/src/components/workspace/AppDashboardView.tsx`.
Il est rendu directement par la page `frontend/src/app/app/(workspace)/page.tsx` au sein de l'environnement enveloppé par `AppShell.tsx` et `WorkspaceContext.tsx`.

### B. Problèmes Identifiés dans l'Implémentation Actuelle
1. **Syndrome "Card UI uniformisé" :**
   - 4 cartes de KPI en haut (`grid-cols-2 lg:grid-cols-4`).
   - 1 carte d'alerte bandeau.
   - 1 carte de file d'action (8 colonnes).
   - 1 carte de cycle SAV avec barre proportionnelle.
   - 1 carte de supervision équipe (4 colonnes).
   - 1 carte de journal d'activité.
   - *Bilan :* Une mosaïque de boîtes blanches fermées, séparées par des bordures grises génériques, sans hiérarchie éditoriale ni point d'ancrage fort.
2. **Fragilité du typage selon le rôle utilisateur (`isAgent`) :**
   - Quand l'utilisateur est un conseiller (`userRole === 'AGENT'`), le composant appelle `agentApi.getDashboardStats(currentWorkspace.id)`.
   - Or, `agentService.getAgentDashboardStats` dans le backend renvoie un objet avec `{ assignedOpenTickets, urgentTickets, waitingCustomerTickets... }` et **ne contient pas la clé `overview`** attendue par le reste du composant (`stats?.overview`).
   - Résultat actuel : Les compteurs `openTickets`, `totalTickets` et `priorityQueue` tombent silencieusement à `0` ou `[]` pour un agent, faussant l'affichage.
3. **Mélange de responsabilités dans un fichier unique :**
   - Gestion des animations GSAP, calculs de proportions, filtrage de listes, intégration de liens vers le guichet public et rendu des sous-blocs tous réunis dans le même composant.

---

## 2. FICHIERS CONCERNÉS DANS LE PROJET

| Rôle | Fichier dans le Projet | Action Prévue lors de la Phase 2B |
| :--- | :--- | :--- |
| **Point d'Entrée Page** | `frontend/src/app/app/(workspace)/page.tsx` | Reste minimal : importe et rend le nouveau composant maître du Dashboard. |
| **Composant Maître Actuel** | `frontend/src/components/workspace/AppDashboardView.tsx` | Refactorisé / Remplacé par une architecture modulaire découpée. |
| **Shell & Layout Parent** | `frontend/src/components/workspace/AppShell.tsx` | **INTOUCHÉ**. Préserve le scroll, la Sidebar gauche et la barre mobile inférieure. |
| **Contexte Workspace** | `frontend/src/components/workspace/WorkspaceContext.tsx` | **INTOUCHÉ**. Utilisé pour récupérer `currentWorkspace`, `user`, `userRole`. |
| **Couche API Frontend** | `frontend/src/lib/api.ts` | Réutilisation sans modification de `workspaceApi.getDashboardStats`, `workspaceApi.getAgents`, `agentApi.getDashboardStats`. |
| **Types TypeScript** | `frontend/src/types/workspace.ts` | Déjà conforme (`DashboardStats`, `DashboardAgentItem`). |
| **Composants Design System** | `frontend/src/components/workspace/design-system/*` | Réutilisation de `Hairline`, `StatusPill`, `EmptyState`, `Surface`. |

---

## 3. DONNÉES RÉELLES DISPONIBLES (BACKEND PRISMA VS MOCKUP)

L'audit approfondi du code backend (`backend/src/services/workspaceService.js` et `backend/src/services/agentService.js`) révèle exactement ce qui est alimenté en base de données PostgreSQL vs ce qui relevait de démonstrations dans la maquette :

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VÉRITÉ DES DONNÉES DU COCKPIT                        │
├──────────────────────────────────┬─────────────────────────────────────┤
│   DONNÉES RÉELLES PRISMA         │   ÉLÉMENTS ABSENTS OU NON FILTRÉS   │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • overview.activeConversations   │ • Pas de filtre "Résolus ce jour"   │
│ • overview.waitingAgent          │   dans ticketBreakdown.RESOLVED     │
│ • overview.openTickets           │ • aiResolutionRate: null (en prep)  │
│ • overview.totalTickets          │ • avgResolutionTimeMinutes: null    │
│ • ticketBreakdown (5 statuts)    │ • customerSatisfactionScore: null   │
│ • priorityQueue (Array réel)     │ • volumeTrend: [] (pas d'historique)│
│ • recentActivity (TicketActivity)│ • Canal WhatsApp entrant: STRICT. 0 │
│ • agents (membres + statuts)     │ • Agence physique du conseiller:    │
│                                  │   non stockée dans User/Membership  │
│                                  │ • Données financières SasPay:       │
│                                  │   Strictement hors Dashboard        │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### A. Données Disponibles via `workspaceApi.getDashboardStats(workspaceId)`
1. **`overview.activeConversations` (Int) :** Nombre de conversations actives initiées par des clients via le portail web (`status === "ACTIVE"`).
2. **`overview.waitingAgent` (Int) :** Nombre de conversations actives sans aucun conseiller assigné (`assignedAgentId === null`).
3. **`overview.openTickets` (Int) :** Nombre de dossiers en cours (`status IN ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER"]`).
4. **`overview.totalTickets` (Int) :** Volume cumulé historique de tickets du workspace.
5. **`overview.ticketBreakdown` (Objet) :** Décompte exact par statut : `{ OPEN: X, IN_PROGRESS: Y, WAITING_CUSTOMER: Z, RESOLVED: W, CLOSED: V }`.
   - **ATTENTION VÉRIFIÉE :** `ticketBreakdown.RESOLVED` est un décompte **historique cumulé** (sans filtre de date). Il ne doit JAMAIS être étiqueté "Résolus ce jour".
6. **`priorityQueue` (Array d'objets) :** Les 6 conversations prioritaires ordonnées par `priority DESC` et `lastMessageAt DESC` :
   - `id`, `customerName`, `phone`, `channel` ("PORTAL"), `lastMessage`, `category`, `urgency` ("LOW", "MEDIUM", "HIGH", "CRITICAL"), `status` ("ASSIGNED" ou "WAITING_AGENT"), `timeAgo`.
7. **`recentActivity` (Array d'objets) :** Les 6 derniers événements réels enregistrés dans la table `TicketActivity` :
   - `id`, `type` ("ASSIGNMENT", "RESOLUTION", "STATUS_CHANGE", "NOTE"), `title`, `description`, `timestamp`.

### B. Données Disponibles via `workspaceApi.getAgents(workspaceId)`
- Liste des collaborateurs membres de l'espace :
  - `id`, `name`, `email`, `avatarUrl`, `role` (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`), `title`, `status` (`AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE`), `maxCapacity`, `activeChats`, `resolvedToday`.

### C. Ce qui est Honnêtement `null` ou Absent (Traitement Transparent Obligatoire)
- **`overview.aiResolutionRate` est `null` :** L'assistant IA n'interagit pas en production. Formulation retenue :
  > **« Module IA en préparation. Le traitement des demandes repose actuellement sur l'équipe humaine. »**
- **Pas de filtre "Résolus ce jour" pour le workspace :** La maquette proposait "7 résolus ce jour". Le backend ne filtre pas par date du jour dans `workspaceService.js`. L'intitulé retenu est donc **« Dossiers résolus »** (cumulatif réel) ou remplacé par **« Conversations actives »** (`overview.activeConversations`).
- **`overview.avgResolutionTimeMinutes` est `null` :** Pas de calcul fictif de durée moyenne inventée.
- **`overview.customerSatisfactionScore` est `null` :** Pas de faux score CSAT à étoiles affiché.
- **`volumeTrend` est `[]` :** Aucun faux graphique de pic de charge inventé sur le Dashboard.
- **Canal WhatsApp :** Strictement aucun message entrant WhatsApp n'existe. Tout provient du guichet web du client (`channel: "PORTAL"`).
- **Agence des conseillers :** Dans la maquette, il était écrit *"Marc Eyango • Douala Akwa"*. Or le modèle `Membership` et `User` n'a pas de relation directe avec `Establishment`. Solution honnête : afficher le rôle ou titre réel du conseiller (`agent.title || agent.role || "Conseiller SAV"`), sans inventer de ville non renseignée.

---

## 4. CORRESPONDANCE ZONE PAR ZONE (DIRECTION 4 VS VÉRITÉ RÉELLE)

| Zone de la Maquette Direction 4 | Rôle Visuel & Ergonomique | Provenance des Données Réelles | Décision Technique & Solution Honnête |
| :--- | :--- | :--- | :--- |
| **Zone 1 : Eyebrow & Titre de Quart** | En-tête éditorial : date du jour, nom du responsable, statut de supervision. | `user.firstName`, date locale JavaScript (`toLocaleDateString('fr-FR')`), `currentWorkspace.name`. | Fallback si `user.firstName` absent : `"Responsable"`. Date du jour en français formel. |
| **Zone 2 : Bulletin Narratif (Masthead Statement)** | Phrase éditoriale rédigée résumant l'état du quart en français limpide. | Calculé dynamiquement à partir de `openTickets`, `waitingAgent` et du nombre de conseillers en poste. | Si `openTickets === 0 && activeConversations === 0` (workspace neuf) &rarr; Affiche le message d'accueil et d'activation du guichet. |
| **Zone 3 : Ruban de Tension (Tension Ribbon)** | 3 chiffres clés horizontaux intégrés au bulletin. | 1. `overview.openTickets` (Dossiers ouverts)<br>2. `overview.waitingAgent` (En attente de conseiller)<br>3. `overview.activeConversations` (Conversations actives) OU `ticketBreakdown.RESOLVED` (Dossiers résolus). | **Correction stricte :** Suppression de la mention fausse "ce jour". Intitulé : **« Dossiers résolus »** ou **« Conversations directes »**. |
| **Zone 4 : L'Îlot d'Arbitrage (Incident Bay)** | **Carte unique fonctionnelle** isolée pour le dossier critique n°1 nécessitant une action prioritaire. | Premier élément de `priorityQueue` filtré par urgence (`CRITICAL` / `HIGH` / `URGENT`) ou `status === "WAITING_AGENT"`. | **État Sérénité :** Si aucun dossier critique ni attente, la carte se transforme en encadré de sérénité : *"Situation sous contrôle • Aucune urgence en attente"*. |
| **Zone 5 : Boutons d'Action de l'Incident Bay** | Prise en charge ou consultation de la demande. | Lien de navigation profonde vers `/app/conversations?id=${item.id}` (ou `/app/conversations`). | **Vérification permissions :** L'action principale est un lien de navigation vers le fil de messagerie réel. Pas de fausse mutation aveugle sur le dashboard. Bouton d'assignation masqué pour les profils `AGENT`. |
| **Zone 6 : Table de Dispatch (Dispatch Table)** | File haute densité à hairlines fines (Linear-grade) listant les dossiers suivants. | Les éléments suivants de `priorityQueue` (indices 1 à 5). | Si la file est vide, affichage de l'état vide ouvert : *"Toutes les demandes ont été traitées"*. |
| **Zone 7 : Filtres de la Table (Pills)** | Pastilles de filtrage : *Tous*, *En attente*, *En cours*, *Résolus*. | Raccourcis de filtrage local sur `priorityQueue` et liens profonds vers `/app/tickets?status=...`. | Pastilles discrètes sans encadrement lourd. |
| **Zone 8 : Indicateur de Capacité d'Équipe (Side - 32%)** | Régulation montrant l'état des effectifs du service client. | Nombre de conseillers avec `status === "AVAILABLE"` vs total conseillers dans `agents`. | **Remplacement de la fausse jauge à pourcentage** par un **indicateur textuel qualitatif** : *"X conseillers disponibles sur Y"* + statut qualitatif (Nominal / Sollicité / Aucun agent). |
| **Zone 9 : Roster des Conseillers de Quart** | Liste des conseillers avec pastille de présence et compteur de charge. | Array `agents` de `workspaceApi.getAgents(workspaceId)`. | Affiche le rôle ou titre réel (`agent.role`). Si 0 agent, invite à ajouter un conseiller via `/app/agents`. |
| **Zone 10 : Encadré de Gouvernance IA** | Note de transparence sur le traitement humain. | Statique et contractuelle (reflète `aiResolutionRate: null`). | **Formulation exacte validée :** *« Module IA en préparation. Le traitement des demandes repose actuellement sur l'équipe humaine. »* Aucun pourcentage affiché. |
| **Zone 11 : Journal de Bord SAV (Activité Récente)** | Registre chronologique d'audit des actions sur les tickets. | `stats.recentActivity` (issu de `TicketActivity` dans PostgreSQL). | Horodatage mono (`12:44`), intitulé de l'événement et lien direct vers `/app/tickets`. |

---

## 5. API, CONTEXTES ET HOOKS À RÉUTILISER

### A. Contextes et Hooks React
- **`useWorkspace()` (`@/components/workspace/WorkspaceContext`) :**
  - Fournit `currentWorkspace` (identifiant, nom, slug).
  - Fournit `user` (prénom, nom, email, rôle actuel).
  - Fournit `userRole` (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`).
  - Fournit `actualRole` et `isActualAdminOrOwner`.
- **Écoute de l'Invalidation en Direct :**
  - Maintien du listener d'événement personnalisé :
    ```ts
    window.addEventListener('zadesk:data-invalidated', handleInvalidation);
    ```
    permettant l'actualisation instantanée du Dashboard dès qu'un ticket ou une conversation est modifiée dans un tiroir ou un onglet parallèle.

### B. Appels API Existants (`@/lib/api.ts`)
1. **Pour les Responsables (`OWNER`, `ADMIN`, `MANAGER`) :**
   ```ts
   const [statsData, agentsData] = await Promise.all([
     workspaceApi.getDashboardStats(currentWorkspace.id),
     workspaceApi.getAgents(currentWorkspace.id).catch(() => []),
   ]);
   ```
2. **Pour les Conseillers SAV (`AGENT`) :**
   ```ts
   const agentData = await agentApi.getDashboardStats(currentWorkspace.id);
   ```
   *Action technique requise :* Utilisation de la fonction de normalisation `normalizeDashboardData(rawStats, userRole)` pour harmoniser la structure et éviter tout crash lié aux clés manquantes.

### C. Vérification des Routes Cibles pour les Liens
Toutes les destinations interactives du Dashboard pointent exclusivement vers les routes existantes validées :
- Boîte de messagerie : `/app/conversations`
- Dossiers SAV : `/app/tickets`
- Filtres de statut tickets : `/app/tickets?status=OPEN`, `/app/tickets?status=IN_PROGRESS`, etc.
- Gestion de l'équipe : `/app/agents`
- Agences : `/app/agencies`
- Configuration IA : `/app/ai`
- Base de connaissances : `/app/knowledge`
- Paramètres de l'entreprise : `/app/settings`

---

## 6. ARCHITECTURE DES COMPOSANTS DU NOUVEAU DASHBOARD

Au lieu d'un monolithe de 900 lignes, le nouveau Dashboard sera découpé en composants atomiques, fortement typés et modulaires dans `frontend/src/components/workspace/dashboard/` :

```
frontend/src/components/workspace/
├── AppDashboardView.tsx                 <-- Composant conteneur principal (fetch, state, layout)
└── dashboard/
    ├── DashboardMasthead.tsx            <-- En-tête éditorial & Bulletin narratif dynamique
    ├── TensionRibbon.tsx                <-- Ruban des 3 métriques clés (Ouverts, Attente, Résolus)
    ├── IncidentBay.tsx                  <-- Carte d'intervention n°1 + État Sérénité (Calm)
    ├── DispatchTable.tsx                <-- File de traitement haute densité (lignes ouvertes)
    ├── TeamCapacityIndicator.tsx        <-- Indicateur textuel qualitatif de charge équipe
    ├── AgentRoster.tsx                  <-- Liste sobre des conseillers en poste
    ├── AIGovernanceNotice.tsx           <-- Encadré transparent gouvernance IA
    ├── ActivityLedger.tsx               <-- Journal chronologique d'audit SAV
    └── BrandNewWorkspaceGuide.tsx       <-- Guide d'activation bienveillant (si 0 donnée)
```

---

## 7. SPÉCIFICATIONS DISTINCTES DESKTOP (1440PX) VS MOBILE (390PX)

### A. Expérience Desktop (Cockpit de Supervision Haute Densité)
- **Largeur cible :** 1440px (s'adapte fluidement jusqu'à 1024px).
- **Structure :** Grille asymétrique rigoureuse Dual-Plane (68% à gauche / 32% à droite).
- **Séparation spatiale :** Hairline verticale continue de 1px (`#E2E8F0`) séparant les deux plans.
- **Interactions :**
  - Raccourci d'actualisation rapide avec indicateur discret.
  - Survol des lignes de la Dispatch Table avec apparition du bouton d'action contextuelle.
  - Hover états tactiles sur les boutons primaires (Midnight Navy `#0D1B3D` &rarr; Hover `#152C61`).

### B. Expérience Mobile (Prise de Quart & Arbitrage d'Urgence au Pouce)
- **Largeur cible :** 390px (iPhone standard / Android viewport).
- **Structure :** Empilement vertical hiérarchisé à une colonne.
- **Ordre ergonomique d'affichage :**
  1. *Bulletin Narratif Condensé :* Nom du quart et phrase résumée percutante en 2 lignes max.
  2. *Ruban de Charge Tactile :* 3 pastilles compactes horizontales alignées.
  3. *Incident Bay Pleine Largeur :* Carte blanche avec bouton d'action pleine largeur d'une hauteur minimale de **44px** (*"Traiter la demande"* &rarr; lien direct vers `/app/conversations`).
  4. *Indicateur de Capacité Compact :* Cartouche textuel horizontal condensé.
  5. *File des 3 Dossiers Suivants :* Cartes tactiles simplifiées (Client, Réf, Attente, Sujet en 1 ligne).
  6. *Notice IA Discrète :* Mention sur une seule ligne.
  7. *Navigation Inférieure Persistante :* Les 5 onglets officiels (**Accueil**, **Conversations**, **Demandes**, **Paramètres**, **Menu**).

---

## 8. GESTION DES ÉTATS : CHARGEMENT, ERREUR, SÉRÉNITÉ ET NOUVEL ESPACE

### A. État de Chargement (Skeleton Éditorial)
- Bannir le spinner centralisé qui fige l'écran.
- Utiliser un **Skeleton éditorial structuré** reprenant fidèlement la grille Dual-Plane :
  - Lignes pulsantes grises douces (`#F1F5F9`) pour le Masthead.
  - Rectangle réservé pour l'Incident Bay.
  - Lignes de tableau fantômes pour la Dispatch Table.
  - Préservation du fond lin `#FAFAF8` pour éviter tout flash blanc à l'arrivée des données.

### B. État d'Erreur Réseau ou Timeout
- Affichage d'un bandeau discret non bloquant en tête de page :
  - Fond rose très doux (`bg-rose-50 border border-rose-200 text-rose-800`).
  - Message explicite : *"Impossible d'actualiser les indicateurs en direct."*
  - Bouton d'action immédiate : *"Réessayer"* (re-déclenche `fetchStats()` sans recharger toute l'application).

### C. État Sérénité (Calm State — Zéro Incident Urgent)
- Si `waitingAgent === 0` et qu'aucun ticket n'est classé `CRITICAL` ou `URGENT` :
  - L'Incident Bay ne disparaît pas brutalement (ce qui déstabiliserait la hauteur de page).
  - Elle se transforme en **encadré de sérénité** :
    - Icône de validation émeraude (`CheckCircle2`).
    - Titre : *"Situation opérationnelle sous contrôle"*.
    - Description : *"Toutes les demandes entrantes ont été prises en charge par les conseillers en poste. Le flux fonctionne de manière nominale."*

### D. État Nouvel Espace (Brand New Workspace — 0 Ticket, 0 Conversation)
- Si l'entreprise vient d'être créée sur Zadesk :
  - Le bulletin masthead s'adapte : *"Bienvenue Marc. Votre espace d'assistance est prêt à recevoir ses premiers dossiers clients."*
  - L'Incident Bay laisse la place au **Guide d'Activation en 3 Étapes** :
    1. *Guichet Client Public :* Lien direct vers `/entreprises/[slug]` pour tester la création de ticket.
    2. *Inviter un Conseiller :* Raccourci vers `/app/agents`.
    3. *Base de Connaissances :* Raccourci vers `/app/knowledge`.

---

## 9. MATRICE DES RISQUES TECHNIQUES & STRATÉGIES D'ATTÉNUATION

| Risque Identifié | Gravité | Cause Racine | Stratégie d'Atténuation Verrouillée |
| :--- | :--- | :--- | :--- |
| **Divergence de schéma Agent vs Admin** | **Haute** | `agentApi.getDashboardStats` ne renvoie pas la même structure que `workspaceApi.getDashboardStats`. | Implémenter une fonction utilitaire `normalizeDashboardStats(raw, role)` qui injecte des valeurs par défaut sécurisées pour éviter tout crash `undefined`. |
| **Crash sur `slaDueAt` absent** | **Moyenne** | Tentative de formater une date nulle ou affichage d'un compte à rebours erroné. | Règle stricte : si `slaDueAt == null`, afficher `Sans échéance` en police Mono 11px sans calcul de timer. |
| **Régression de routes de navigation** | **Haute** | Utilisation involontaire de `/app/team` ou `/app/branches` au lieu des routes validées. | Verrouillage strict sur les constantes de routes validées : `/app/agents`, `/app/agencies`, `/app/ai`, `/app/knowledge`. |
| **Falsification involontaire de données** | **Critique** | Injection de faux scores IA, de faux délais moyens ou de métriques temporelles non filtrées. | Conformité stricte avec le backend : IA en mode préparation, SasPay exclu du SAV, pas de mention "Résolus ce jour". |
| **Dégradation de performances mobile** | **Moyenne** | Animation GSAP lourde sur téléphone ou recalculs constants au scroll. | GSAP exécuté uniquement au montage initial avec désactivation obligatoire si `prefers-reduced-motion` est actif. |

---

## 10. PLAN DE TESTS DE NON-RÉGRESSION & CRITÈRES D'ACCEPTATION

### A. Scénarios de Test Obligatoires avant Validation de la Phase 2B
1. **Scénario 1 : Superviseur avec Affluence (Données Nominales)**
   - Vérifier le rendu du Masthead, l'élection de l'Incident Bay n°1, la Dispatch Table à 5 lignes, l'indicateur d'équipe et le journal d'activité.
2. **Scénario 2 : Superviseur en État Sérénité (Calm State)**
   - Vérifier la bascule fluide de l'Incident Bay vers le message de flux fluide sans décalage de layout.
3. **Scénario 3 : Espace Vierge (Nouvel Utilisateur Onboardé)**
   - Vérifier l'apparition du guide d'activation à 3 cartes et l'absence de compteurs négatifs ou d'erreurs d'affichage.
4. **Scénario 4 : Rôle Conseiller SAV (`userRole === 'AGENT'`)**
   - Se connecter avec un compte Agent ou activer le mode prévisualisation. Vérifier que la page se charge sans erreur console et affiche les dossiers assignés à l'agent.
5. **Scénario 5 : Résolution Mobile (Viewport 390 × 844)**
   - Vérifier l'empilement vertical, la hauteur tactile des boutons (&ge; 44px), l'absence de débordement horizontal et la présence intacte de la Bottom Nav à 5 onglets.
6. **Scénario 6 : Accessibilité & Navigation Clavier**
   - Parcourir le Dashboard à la touche `Tab`. Vérifier que l'anneau de focus `ring-2 ring-[#0D1B3D]` apparaît clairement sur chaque élément interactif.

---

## 11. VALIDATION APPROFONDIE DES MÉTRIQUES, PERMISSIONS ET ACTIONS

Cette section consigne la preuve formelle tirée du code source pour chaque élément critique identifié lors de l'audit d'avant-projet :

### A. Métrique Temporelle « Résolus ce jour »
- **Fichier source :** `backend/src/services/workspaceService.js`
- **Fonction concernée :** `getWorkspaceDashboardStats(workspaceId)`
- **Lignes de code :** 534–538 & 580–591
- **Preuve trouvée dans le code :**
  ```js
  prisma.ticket.groupBy({
    by: ["status"],
    where: { workspaceId },
    _count: { id: true },
  })
  ```
  La clause `where` ne contient **aucun filtre temporel** (`updatedAt`, `resolvedAt` ou date du jour). Le décompte `ticketBreakdown.RESOLVED` est donc le **total historique cumulé** de tous les tickets ayant atteint le statut `RESOLVED` depuis la création de l'espace.
- **Décision de conception retenue :**
  - **Refus formel de simuler "Résolus ce jour"**.
  - Intitulé retenu dans le Ruban de Tension : **« Dossiers résolus »** (avec valeur cumulée réelle).
  - Alternative retenue pour le cockpit en direct : afficher **« Conversations actives »** (`overview.activeConversations`), qui représente un flux opérationnel live réel.

### B. Formulation de la Gouvernance IA
- **Fichier source :** `backend/src/services/workspaceService.js` (ligne 640) & `frontend/src/app/app/(workspace)/ai/page.tsx`
- **Champ concerné :** `overview.aiResolutionRate: null`
- **Preuve trouvée dans le code :**
  Le backend renvoie explicitement `aiResolutionRate: null` assorti du commentaire `// Moteur IA en préparation (non simulé)`. Aucun moteur d'inférence en direct n'est connecté au flux de messagerie de production.
- **Décision de conception retenue :**
  - Application stricte de la formulation officielle validée :
    > **« Module IA en préparation. Le traitement des demandes repose actuellement sur l'équipe humaine. »**
  - Suppression de tout pourcentage de traitement humain (aucun "100%" calculé) et de toute mention d'entraînement actif non vérifié.

### C. Jauge Capacitaire d'Équipe
- **Fichier source :** `backend/src/services/workspaceService.js`
- **Fonction concernée :** `getWorkspaceAgents(workspaceId)`
- **Lignes de code :** 824–945
- **Preuve trouvée dans le code :**
  1. `activeChats` (ligne 914) provient de `prisma.ticket.groupBy` sur les tickets actifs (`OPEN`, `IN_PROGRESS`, `WAITING_CUSTOMER`). Malgré son nom "chats", il compte des **tickets SAV**.
  2. `maxCapacity` (lignes 901 & 928) est injecté à une valeur par défaut de `10` lors du premier upsert de `AgentProfile`.
  3. `members` (ligne 824) inclut indifféremment tous les collaborateurs (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`). Un Owner qui ne traite aucun ticket se voit attribuer un profil avec `maxCapacity: 10`.
  4. Les agents avec `status === "OFFLINE"` ou `"AWAY"` conservent leur `maxCapacity: 10` dans l'array.
  5. Un calcul de ratio `somme(activeChats) / somme(maxCapacity) * 100` produirait un pourcentage mathématiquement artificiel et déconnecté de la disponibilité réelle.
- **Décision de conception retenue :**
  - **Suppression définitive de la barre de pourcentage fictive ("78%")**.
  - Remplacement par un **Indicateur Textuel Qualitatif Réel (`TeamCapacityIndicator`)** :
    - Décompte exact des conseillers disponibles : `${availableAgentsCount} / ${totalAgentsCount} disponible(s)` (filtré sur `status === "AVAILABLE"`).
    - Nombre de dossiers en cours de traitement : `${openTickets} dossier(s) en traitement`.
    - Mention d'état qualitatif transparente :
      - Si `waitingAgent > 0` : `"Forte sollicitation — Dossiers en attente d'attribution"` (ambre).
      - Si `waitingAgent === 0 && availableAgentsCount > 0` : `"Service fluide — Capacité disponible"` (émeraude).
      - Si `availableAgentsCount === 0` : `"Aucun conseiller en service"` (neutre).

### D. Actions et Permissions de l'Incident Bay
- **Fichiers sources :** `backend/src/routes/agentRoutes.js` (lignes 21–23), `backend/src/services/agentService.js` (lignes 700–730) & `frontend/src/components/workspace/ConversationsView.tsx`
- **Fonctions concernées :** `reassignTicket`, `sendConversationMessage`, `getConversation`
- **Preuve trouvée dans le code :**
  1. La réaffectation d'un ticket (`reassignTicket`, ligne 701) est **strictement interdite aux profils AGENT** :
     ```js
     const isSupervisorOrAbove = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER].includes(userRole);
     if (!isSupervisorOrAbove) throw 403 ("Seul un superviseur ou un administrateur peut réaffecter un ticket.");
     ```
  2. L'accès à une conversation via `getConversation` (ligne 891) nécessite d'être superviseur, ou d'être l'agent déjà assigné, ou d'avoir un partage actif.
  3. Il n'existe pas d'action backend unifiée de "claim en 1 clic" depuis un dashboard externe sans ouvrir le fil de discussion.
  4. La prise en charge d'un dossier client nécessite de lire les échanges antérieurs, les pièces jointes éventuelles et d'émettre une réponse qualifiée dans l'interface de messagerie `/app/conversations`.
- **Décision de conception retenue :**
  - **Refus de fabriquer un faux bouton d'action asynchrone sans contexte.**
  - L'action primaire de l'Incident Bay est un **lien de navigation directe qualifié** :
    - Libellé : **« Ouvrir et traiter la demande »** &rarr; redirige vers `/app/conversations` (avec focus sur la conversation cible).
  - L'action secondaire :
    - Pour les `OWNER`, `ADMIN`, `MANAGER` : Lien vers la gestion du dossier dans `/app/tickets`.
    - Pour les `AGENT` : Aucun bouton d'assignation n'est affiché (protection stricte contre l'erreur 403).

### E. Rôles et Isolation RBAC
- **Fichier source :** `frontend/src/components/workspace/WorkspaceContext.tsx`
- **Champs concernés :** `userRole`, `actualRole`, `isActualAdminOrOwner`
- **Preuve trouvée dans le code :**
  L'application dispose d'un mode de prévisualisation Agent permettant aux administrateurs de tester la vue restreinte. Le composant `AppDashboardView` écoute `userRole` pour adapter les données et l'affichage.
- **Décision de conception retenue :**
  - Si `userRole === 'AGENT'`, le cockpit s'adapte en vue personnelle : il met en avant les dossiers assignés au conseiller connecté, sans exposer de contrôles d'administration d'équipe interdits.

---

## 12. LIMITATIONS RESTANTES DU DASHBOARD

Les éléments suivants constituent les limites objectives du backend actuel. Elles sont assumées avec intégrité sans jamais être masquées par des données artificielles :

1. **Absence de filtrage temporel "Aujourd'hui" pour le workspace :**
   - Le backend agrège le volume total de résolutions (`ticketBreakdown.RESOLVED`). Un filtrage "ce jour" nécessiterait l'ajout d'une clause `updatedAt >= startOfDay` dans la requête `groupBy` backend, ce qui sort du périmètre d'interdiction de modification du backend. Le label d'interface reste donc honnêtement cumulatif.
2. **Entité Client non isolée :**
   - Il n'existe pas de table `Customer` dédiée dans PostgreSQL. Les coordonnées et le nom du client proviennent des champs dénormalisés de `Ticket` et `Conversation`.
3. **Absence de liaison directe Agent &rarr; Agence :**
   - Un collaborateur (`User` / `Membership`) n'est pas lié par une clé étrangère à un `Establishment`. L'affichage de l'équipe indique donc son rôle ou sa spécialité, mais ne fabrique pas de rattachement géographique fictif.
4. **Rafraîchissement des statuts de présence :**
   - Il n'y a pas de websocket de présence en temps réel pour traquer les clics ou la souris des agents. La disponibilité repose sur le champ `availability` déclaré dans `AgentProfile` et sur l'écoute de l'événement `zadesk:data-invalidated`.
5. **Autonomie IA non connectée :**
   - Le champ `aiResolutionRate` est `null`. L'encadré d'information reste statique et rappelle la gouvernance humaine intégrale.

---
*Le plan d'implémentation de la Phase 2A.1 est achevé, vérifié et entièrement documenté.*

---

## 13. EXÉCUTION & RECETTE RÉELLE DE LA PHASE 2B (DOCKER / NGINX / DEVTOOLS)

### A. Fichiers Implémentés & Modifiés
1. **Composant Conteneur Maître :** `frontend/src/components/workspace/AppDashboardView.tsx` (remplacé par la structure Dual-Plane 68% / 32%).
2. **Modules Spécialisés créés dans `frontend/src/components/workspace/dashboard/` :**
   - `types.ts` : Contrats de données typés du Dashboard.
   - `normalizeDashboardStats.ts` : Adaptateur pur et résilient (rôles `OWNER`, `ADMIN`, `MANAGER`, `AGENT`).
   - `DashboardMasthead.tsx` : Bulletin narratif dynamique + Ruban des 3 métriques maîtresses.
   - `IncidentBay.tsx` : Carte unique d'arbitrage n°1 + bascule vers l'État Sérénité (Calm State).
   - `DispatchTable.tsx` : Table tabulaire haute densité à hairlines de 1px.
   - `TeamCapacityIndicator.tsx` : Indicateur textuel qualitatif de capacité SAV.
   - `AgentRoster.tsx` : Roster des conseillers de quart sans données géographiques fictives.
   - `AIGovernanceNotice.tsx` : Notice officielle de gouvernance IA (100% honnête).
   - `ActivityLedger.tsx` : Journal de bord d'activité issu de `TicketActivity`.
   - `BrandNewWorkspaceGuide.tsx` : Guide d'activation pour nouvel espace d'assistance.
   - `index.ts` : Point d'export unifié.
3. **Tests Unitaires Ciblés :**
   - `frontend/src/components/workspace/dashboard/__tests__/normalizeDashboardStats.test.mjs` (4/4 tests réussis).

### B. Résultats de Compilation & Validation Docker
- **Typecheck TypeScript (`tsc --noEmit`) :** 0 erreur.
- **Compilation Next.js Production Build :** Réussie (`✓ Compiled successfully`, 38/38 pages statiques générées, First Load JS Dashboard : 150 kB).
- **Conteneurs Docker Reconstruits & Démarrés :**
  - `zadesk-frontend` : Reconstruit et démarré sur le réseau `zadesk-network`.
  - `zadesk-nginx` : Opérationnel sur le port 80 (`http://localhost/app`).
  - `zadesk-backend`, `zadesk-worker`, `zadesk-postgres`, `zadesk-redis` : Tous sains et connectés.

### C. Recette Visuelle en Production Réelle (Chrome DevTools MCP)
- **1440 × 900 Desktop (Activité Réelle & État Sérénité) :**
  - `recette_screenshots/dashboard_production_desktop_1440.png`
- **390 × 844 Mobile (PWA & BottomNav intacte) :**
  - `recette_screenshots/dashboard_production_mobile_390.png`
- **1440 × 900 Vue Conseiller SAV (`userRole === 'AGENT'`) :**
  - `recette_screenshots/dashboard_production_agent_role_1440.png`
- **1440 × 900 Nouvel Espace (Guide d'Activation) :**
  - `recette_screenshots/dashboard_production_new_workspace_1440.png`

### D. Garantie d'Isolation
- Aucun autre module (`ConversationsView`, `TicketsView`, `CustomersView`, `AgentsView`, `AgenciesView`) n'a été modifié.
- La Sidebar officielle et la MobileBottomNav validées en Phase 1 sont intactes.
- Aucun fichier backend, schéma Prisma ou configuration SasPay n'a été altéré.
- Aucun commit, push ou déploiement distant n'a été effectué.

