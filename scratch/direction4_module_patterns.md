# ZADESK — MODÈLES DE COMPOSITION PAR MODULE (DIRECTION 4)
## Architecture Fonctionnelle, Spatiale & Vérité des Données des 10 Modules de la Workspace

> **Orientation de référence :** *Operational Editorial System* (Direction 4 — Validée).  
> **Règle absolue :** Refus de l'uniformité ("cookie-cutter UI"). Chaque module adopte une composition spatiale pensée sur mesure pour son flux métier réel, ancrée dans la réalité stricte du schéma Prisma.
> **Navigation mobile unifiée :** Les 10 modules s'insèrent dans la barre inférieure officielle validée à 5 onglets : **Accueil**, **Conversations**, **Demandes**, **Paramètres**, **Menu**.

---

## SOMMAIRE

1. [Module 1 : Dashboard (Cockpit SAV) — `/app`](#module-1--dashboard)
2. [Module 2 : Conversations (Messagerie directe) — `/app/conversations`](#module-2--conversations)
3. [Module 3 : Demandes clients (Tickets SAV) — `/app/tickets`](#module-3--demandes-clients)
4. [Module 4 : Clients (Annuaire relationnel) — `/app/customers`](#module-4--clients)
5. [Module 5 : Équipe et accès (Gestion des conseillers) — `/app/team`](#module-5--équipe-et-accès)
6. [Module 6 : Nos agences (Établissements physiques) — `/app/branches`](#module-6--nos-agences)
7. [Module 7 : Configuration IA (Gouvernance & Préparation) — `/app/ai-config`](#module-7--configuration-ia)
8. [Module 8 : Connaissances de l'entreprise (Bibliothèque) — `/app/knowledge`](#module-8--connaissances)
9. [Module 9 : Statistiques (Performances & Volume) — `/app/analytics`](#module-9--statistiques)
10. [Module 10 : Paramètres de l'entreprise — `/app/settings`](#module-10--paramètres)

---

<a id="module-1--dashboard"></a>
### 1. Dashboard (Cockpit Opérationnel SAV) — `/app`

#### Rôle Métier
Prise de quart matinale du superviseur et des conseillers : comprendre la situation globale du service client en 2 secondes, arbitrer immédiatement le dossier le plus critique, et surveiller l'absorption d'équipe.

#### Composition Spatiale Desktop (Dual-Plane Asymétrique 68% / 32%)
- **Plan Opérationnel (Gauche - 68%) — Surface Lin Ouverte :**
  - **Dispatch Masthead :** Éditorial narratif en français direct ("Bonjour Marc. 14 dossiers ouverts ce matin, dont 1 urgent nécessitant votre arbitrage.")
  - **Incident Bay (Carte Unique Fonctionnelle) :** Conteneur focal blanc (`#FFFFFF`), bordure fine (`#E2E8F0`), réservé au dossier n°1 le plus urgent. Bouton d'action proéminent *"Prendre en charge"* (40px) et bouton secondaire *"Assigner"*.
  - **Dispatch Table (Table Ouverte à Lignes Fines) :** File d'attente haute densité à hairlines de 1px (`border-b: 1px solid #E2E8F0`). Aucun encadrement par carte. Colonnes : Réf, Client, Sujet, Statut, Délai restant.
- **Plan de Régulation (Droite - 32%) — Colonne d'Analyse :**
  - **Jauge d'Équilibre Capacitaire :** Taux de charge nominale de l'équipe (tickets actifs vs capacité totale).
  - **Roster Conseillers :** Liste sobre des agents assignés avec compteur de dossiers en cours.
  - **Encadré Gouvernance IA :** Mention transparente et sobre du mode préparation ("100% de traitement humain").
  - **Registre Chronologique :** Flux d'activité récent (assignations, créations).

#### Adaptation Mobile (390px)
- Empilement vertical fluide : Bulletin narratif &rarr; Incident Bay en carte pleine largeur (bouton tactile 44px) &rarr; Jauge capacitaire compacte &rarr; File tactile des 3 dossiers suivants.
- Navigation inférieure : Onglet **Accueil** actif.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Modèle `Ticket` : `id`, `reference`, `title`, `status`, `priority`, `slaDueAt`, `customerName`, `assignedAgentId`, `createdAt`.
   - Modèle `Membership` / `User` : Conseillers rattachés au workspace.
   - Modèle `TicketActivity` : Entrées d'activité horodatées.
2. **Fonctionnalités existantes :**
   - Comptage des tickets par statut (`TicketStatus.OPEN`, `TicketStatus.IN_PROGRESS`).
   - Prise en charge directe (mise à jour `assignedAgentId` avec l'utilisateur connecté).
3. **Fonctionnalités futures / différées :**
   - Taux de résolution autonome IA (Actuellement non branché ; la mention IA reste purement déclarative et transparente).
   - SasPay / Transactions financières : Exclues du Dashboard opérationnel.
4. **Comportements d'absence & Fallbacks :**
   - *Si `slaDueAt` est null :* Affichage de la mention calme `Sans échéance` en typographie secondaire (Mono 11px), sans fausse alerte rouge ni timer fictif.
   - *Si aucun dossier urgent :* L'Incident Bay se transforme en message de sérénité : "Aucune urgence critique. Le flux opérationnel est nominal."
   - *Si aucun conseiller connecté :* Affichage des membres actifs du workspace avec leur statut déclaré sans pulsation websocket artificielle.

---

<a id="module-2--conversations"></a>
### 2. Conversations (Messagerie Directe) — `/app/conversations`

#### Rôle Métier
Traitement conversationnel synchrone et asynchrone entre le client (via le widget du portail web) et les conseillers SAV Zadesk.

#### Composition Spatiale Desktop (Triptyque Continu 280px / 1fr / 320px)
- **Volet 1 — File des Échanges (280px) :**
  - Liste continue sans cartes. Séparations par fines hairlines horizontales de 1px.
  - Indicateur de non-lu : pastille vert émeraude 7px. Tri chronologique par `lastMessageAt`.
- **Volet 2 — Fil Actif (1fr) :**
  - Surface centrale lin avec bulles éditoriales :
    - *Message Client :* Bulle blanche avec fine bordure (`#E2E8F0`), texte Midnight Navy.
    - *Message Conseiller :* Bulle Midnight Navy (`#0D1B3D`), texte blanc pur.
    - *Note Interne :* Fond teinté ambre très léger (`#FEF3C7`), bordure dorée, badge "Note privée équipe".
  - Zone de saisie ancrée en bas avec sélecteur de macro-réponses rapides.
- **Volet 3 — Fiche Contexte Client (320px) :**
  - Panneau d'informations directes sur le contact (coordonnées, historique récent des tickets liés, bouton d'escalade en ticket).

#### Adaptation Mobile (390px)
- Modèle maître-détail : liste plein écran &rarr; vue de discussion immersive avec flèche de retour et barre d'onglets persistante.
- Navigation inférieure : Onglet **Conversations** actif.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Modèle `Conversation` : `id`, `channel` (par défaut `"PORTAL"`), `status`, `customerName`, `customerPhone`, `customerEmail`, `lastMessageAt`.
   - Modèle `ConversationMessage` : `id`, `senderType` (`CUSTOMER`, `AGENT_REPLY`, `INTERNAL_NOTE`, `SYSTEM`), `content`, `isInternalNote`, `createdAt`.
2. **Fonctionnalités existantes :**
   - Envoi de messages texte, distinction notes internes vs réponses client, changement de statut de conversation.
3. **Fonctionnalités futures / différées :**
   - Réception de messages entrants WhatsApp : **STRICTEMENT ABSENTE**. Zadesk n'a pas de passerelle WhatsApp entrante.
   - Suggestions de réponses par LLM : Phase d'expérimentation future.
4. **Comportements d'absence & Fallbacks :**
   - *Canal de communication :* Afficher uniquement l'origine réelle (`Portail Web`).
   - *Si téléphone ou email client absent :* Afficher `Non renseigné` en grisé sans bloquer l'échange.

---

<a id="module-3--demandes-clients"></a>
### 3. Demandes Clients (Tickets SAV) — `/app/tickets`

#### Rôle Métier
Suivi rigoureux du cycle de vie des réclamations complexes, respect des délais d'engagement et archivage des résolutions.

#### Composition Spatiale Desktop (Table Haute Densité & Tiroir Slide-Over)
- **Bandeau Supérieur de Filtrage :**
  - Filtres textuels par statut : *Tous*, *Nouveaux*, *En cours*, *En attente client*, *Résolus*.
  - Recherche instantanée par référence (`TK-XXXX`) ou nom de client.
- **Tableau de Données Pleine Largeur :**
  - Rendu tabulaire sans cartes ("Card-free ledger"). Lignes de 44px avec bordure inférieure de 1px.
  - Typographie tabulaire mono pour la référence et les dates.
- **Tiroir d'Inspection Latéral (Slide-Over de 520px) :**
  - S'ouvre au clic sur une ligne sans recharger la page.
  - Contient la timeline complète des activités (`TicketActivity`), le formulaire de changement d'état et l'assignation de conseiller.

#### Adaptation Mobile (390px)
- Cartes de demandes tactiles condensées avec pastilles de statut et bouton d'ouverture de la fiche détaillée en plein écran.
- Navigation inférieure : Onglet **Demandes** actif.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Modèle `Ticket` : `reference`, `title`, `description`, `category`, `priority`, `status`, `customerName`, `customerPhone`, `customerEmail`, `slaDueAt`, `assignedAgentId`.
   - Modèle `TicketActivity` : Historique complet des événements du ticket.
2. **Fonctionnalités existantes :**
   - Pagination, tri, filtrage par statut et agence, création de ticket, assignation, résolution.
3. **Fonctionnalités futures / différées :**
   - Prédiction automatique de catégorie par IA.
4. **Comportements d'absence & Fallbacks :**
   - *Si `slaDueAt` est null :* Afficher `Sans échéance` (pas de pastille rouge ni d'erreur).
   - *Si `category` est null :* Afficher `Général`.
   - *Si `assignedAgentId` est null :* Afficher `Non assigné` avec bouton d'assignation rapide en 1 clic.

---

<a id="module-4--clients"></a>
### 4. Clients (Annuaire Relationnel) — `/app/customers`

#### Rôle Métier
Consultation du carnet de contacts des usagers ayant interagi avec le service client, analyse de récurrence et historique des dossiers.

#### Composition Spatiale Desktop (Split-View Éditoriale 340px / 1fr)
- **Volet Annuaire (Gauche - 340px) :**
  - Champ de recherche rapide (nom, numéro de téléphone CEMAC +242 / +237).
  - Liste continue de contacts triés par date de dernière activité.
- **Fiche Client 360° (Droite - 1fr) :**
  - Cartouche d'en-tête typographique avec nom complet en Outfit 22px et coordonnées vérifiées.
  - Onglets horizontaux fins : *Historique des demandes*, *Conversations passées*, *Notes internes*.

#### Adaptation Mobile (390px)
- Liste de recherche plein écran avec accès direct aux coordonnées et possibilité d'appel direct via le protocole `tel:`.
- Navigation inférieure : Accessible via l'onglet **Menu** (ou raccourci depuis l'Accueil).

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - **Important :** Il n'existe pas de table `Customer` isolée dans le schéma Prisma actuel. Les informations clients proviennent de l'agrégation des champs `customerName`, `customerPhone`, `customerEmail` des modèles `Ticket` et `Conversation`.
2. **Fonctionnalités existantes :**
   - Vue consolidée des contacts dédupliqués par numéro de téléphone ou email.
3. **Fonctionnalités futures / différées :**
   - Segmentation marketing avancée, synchronisation CRM externe (Salesforce, HubSpot).
4. **Comportements d'absence & Fallbacks :**
   - *Si un contact n'a pas d'email :* Afficher uniquement le numéro de téléphone sans avertissement d'erreur.
   - *Si un contact n'a qu'une seule interaction :* Indiquer "Premier contact enregistré".

---

<a id="module-5--équipe-et-accès"></a>
### 5. Équipe et Accès (Gestion des Conseillers) — `/app/team`

#### Rôle Métier
Supervision des effectifs du service client, attribution des habilitations (Owner, Admin, Manager, Agent) et invitations de nouveaux collaborateurs.

#### Composition Spatiale Desktop (Registre Hiérarchique & Modale d'Invitation)
- **Bandeau d'État des Effectifs :**
  - Compteurs sobres : Total collaborateurs, Conseillers actifs, Invitations en attente.
- **Tableau des Membres :**
  - Lignes fines avec avatar, nom complet, adresse email professionnelle, rôle officiel Zadesk et agence de rattachement.
  - Menu d'actions contextuelles (modifier le rôle, révoquer l'accès).
- **Modale d'Invitation Formelle :**
  - Formulaire épuré pour inviter par email avec sélection du rôle et assignation éventuelle à une agence.

#### Adaptation Mobile (390px)
- Cartes d'agents avec badge de rôle et menu à trois points.
- Navigation inférieure : Accessible via l'onglet **Paramètres** ou **Menu**.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Modèle `Membership` : `role` (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`), `status` (`ACTIVE`, `SUSPENDED`, `ARCHIVED`), `createdAt`.
   - Modèle `User` : `firstName`, `lastName`, `email`, `avatarUrl`.
   - Modèle `WorkspaceInvitation` : invitations envoyées par email avec jeton de validation.
2. **Fonctionnalités existantes :**
   - Invitation de membres, modification de rôle, suspension d'accès.
3. **Fonctionnalités futures / différées :**
   - Suivi biométrique ou surveillance en direct par webcam (exclu).
4. **Comportements d'absence & Fallbacks :**
   - *Disponibilité des agents :* Basée sur le statut déclaré ou l'activité récente de session, sans présomption d'un statut en direct non confirmé.

---

<a id="module-6--nos-agences"></a>
### 6. Nos Agences (Établissements Physiques) — `/app/branches`

#### Rôle Métier
Répertoire des comptoirs SAV, boutiques et ateliers techniques physiques de l'entreprise dans les métropoles de la zone CEMAC.

#### Composition Spatiale Desktop (Cartes Fonctionnelles Dédiées & Gestion d'État Vide)
- **Grille de Cartes d'Établissements (Cartes Justifiées) :**
  - Chaque agence est présentée sous forme d'une carte blanche distincte avec bordure fine : Nom du point de service, ville (Brazzaville, Pointe-Noire, Douala, Yaoundé), adresse, téléphone direct et horaires d'ouverture.
- **État Vide Respectueux (Si aucune agence) :**
  - Message calme et professionnel : "Votre entreprise fonctionne exclusivement en ligne. L'ajout d'agences physiques est optionnel et s'adresse aux réseaux de distribution ou comptoirs d'accueil."

#### Adaptation Mobile (390px)
- Cartes d'agences empilées avec bouton direct "Appeler le comptoir".
- Navigation inférieure : Accessible via l'onglet **Menu**.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Modèle `Establishment` : `name`, `type`, `address`, `city`, `country`, `phone`, `email`, `openingHours`, `isMain`, `isActive`.
2. **Fonctionnalités existantes :**
   - Création, édition, activation/désactivation d'une agence.
3. **Fonctionnalités futures / différées :**
   - Géolocalisation GPS dynamique avec calcul d'itinéraire routier.
4. **Comportements d'absence & Fallbacks :**
   - *Entreprise 100% en ligne (zéro agence) :* Aucune anomalie affichée. L'interface reste propre avec un bouton d'ajout non intrusif.

---

<a id="module-7--configuration-ia"></a>
### 7. Configuration IA (Gouvernance & Préparation) — `/app/ai-config`

#### Rôle Métier
Définition des consignes rédactionnelles, du périmètre d'action et des garde-fous de l'assistant virtuel Zadesk en vue de son futur déploiement.

#### Composition Spatiale Desktop (Console de Réglages & Simulateur Interne)
- **Bannière de Transparence Obligatoire :**
  - Bandeau d'en-tête précisant : *"Mode Préparation — L'assistant IA n'interagit avec aucun client en production. Toutes les interactions restent assurées par votre équipe humaine."*
- **Volet Gauche (Paramètres des Directives) :**
  - Consignes de marque, ton de politesse, seuil de certitude d'escalade vers un conseiller humain.
- **Volet Droit (Console de Test Interne) :**
  - Bac à sable privé permettant aux superviseurs de dialoguer avec l'agent pour calibrer ses réponses avant tout allumage public.

#### Adaptation Mobile (390px)
- Onglets segmentés : *Directives* | *Test de simulation*.
- Navigation inférieure : Accessible via l'onglet **Paramètres** ou **Menu**.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Modèle `Workspace` : champs de configuration générale.
2. **Fonctionnalités existantes :**
   - Éditeur de consignes et stockage des directives textuelles.
3. **Fonctionnalités futures / différées :**
   - Exécution autonome des réponses au client final (actuellement verrouillée en mode préparation).
4. **Comportements d'absence & Fallbacks :**
   - *Taux de résolution IA :* Indiquer `Non activé` ou `0% (Mode préparation)` plutôt qu'un faux pourcentage inventé.

---

<a id="module-8--connaissances"></a>
### 8. Connaissances de l'Entreprise (Bibliothèque) — `/app/knowledge`

#### Rôle Métier
Centralisation des documents de référence (politiques de retour, garanties légales, manuels produits, procédures d'escalade) pour les conseillers.

#### Composition Spatiale Desktop (Bibliothèque Thématique & Dépôt Documentaire)
- **Navigation Latérale Thématique :**
  - Répertoires : *Politiques SAV*, *Garanties & Retours*, *Fiches Techniques Produits*, *Notes de Service*.
- **Catalogue de Ressources :**
  - Lignes de documents avec format (PDF, Markdown), date de dernière révision et auteur.
- **Zone de Dépôt de Fichiers :**
  - Zone de glisser-déposer discrète à bordure en tiretés fins (`border: 1px dashed #CBD5E1`).

#### Adaptation Mobile (390px)
- Liste des fiches consultables avec visionneuse textuelle simplifiée.
- Navigation inférieure : Accessible via l'onglet **Menu**.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Les articles et documents de connaissances sont gérés via des fichiers locaux ou des collections documentaires.
2. **Fonctionnalités existantes :**
   - Consultation et recherche plein texte dans les ressources documentaires de la société.
3. **Fonctionnalités futures / différées :**
   - Indexation vectorielle RAG automatique pour l'IA.
4. **Comportements d'absence & Fallbacks :**
   - *Si la base documentaire est vide :* Affichage d'un modèle type de politique de retour prêt à l'emploi.

---

<a id="module-9--statistiques"></a>
### 9. Statistiques (Performances & Volume) — `/app/analytics`

#### Rôle Métier
Mesure objective de la performance du service après-vente, respect des délais d'engagement et charge de travail par catégorie d'incident.

#### Composition Spatiale Desktop (Dashboard Linéaire Sans Faux Graphiques)
- **Trio de Métriques de Référence :**
  - Volume de dossiers clôturés, Délai moyen de prise en charge humaine, Taux de conformité aux délais.
- **Courbe de Distribution Hebdomadaire (Recharts Sobre) :**
  - Graphique linéaire monochrome épuré illustrant les pics de volume par jour ouvrable.
- **Barres de Répartition par Catégorie :**
  - Histogrammes horizontaux proportionnels (Retards livraison, Produits défectueux, Demandes d'échange, Facturation).

#### Adaptation Mobile (390px)
- Cartes métriques condensées et graphique adapté avec défilement tactile horizontal.
- Navigation inférieure : Accessible via l'onglet **Menu**.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Agrégats réels calculés sur `Ticket` (`createdAt`, `resolvedAt`, `closedAt`, `slaDueAt`, `category`).
2. **Fonctionnalités existantes :**
   - Calcul des délais réels de résolution sur les tickets effectivement clôturés.
3. **Fonctionnalités futures / différées :**
   - Prédictions algorithmiques de charge future par machine learning.
4. **Comportements d'absence & Fallbacks :**
   - *Si moins de 5 tickets sont clôturés :* Afficher la mention "Volume de données insuffisant pour établir une moyenne statistique représentative" plutôt qu'un faux graphique trompeur.

---

<a id="module-10--paramètres"></a>
### 10. Paramètres de l'Entreprise — `/app/settings`

#### Rôle Métier
Configuration légale de la structure, devise de facturation, gestion de l'abonnement Zadesk et paramètres de sécurité du compte.

#### Composition Spatiale Desktop (Onglets Verticaux & Formulaires Rigoureux)
- **Sélecteur d'Onglets Vertical (240px) :**
  - *Identité de l'entreprise*, *Canaux & Portail*, *Sécurité & Sessions*, *Facturation & Abonnement Zadesk*.
- **Panneau de Configuration (1fr) :**
  - Formulaires divisés par hairlines fines.
  - Champ de saisie avec états de focus nets (`ring-2 ring-[#0D1B3D]`).
  - Barre d'enregistrement persistante qui apparaît dès qu'un champ est modifié.
- **Gestionnaire d'Abonnement (SasPay / Mobile Money) :**
  - **Emplacement exclusif :** C'est ici et nulle part ailleurs qu'apparaissent les détails du plan Zadesk (Découverte, Starter, Pro) et les paiements via SasPay / Airtel Money / MTN MoMo.

#### Adaptation Mobile (390px)
- Menu de navigation par sections ouvrant chaque catégorie de paramètres en pleine page.
- Navigation inférieure : Onglet **Paramètres** actif.

#### Audit de Vérité Backend (Prisma Schema)
1. **Données réelles Prisma (disponibles) :**
   - Modèle `Workspace` : nom, fuseau horaire, devise locale (XAF).
   - Modèles `Subscription`, `PaymentAttempt`, `CommercialDowngradeRequest` : gestion de l'abonnement SaaS Zadesk.
2. **Fonctionnalités existantes :**
   - Mise à jour des informations de société, visualisation du plan d'abonnement actif.
3. **Fonctionnalités futures / différées :**
   - Authentification SSO SAML multi-fournisseurs (Google OAuth déjà en place).
4. **Comportements d'absence & Fallbacks :**
   - *Si le plan est gratuit :* Mentionner "Formule Découverte" sans message d'expiration agressif.

---

## MATRICE COMPARATIVE DES SURFACES PAR MODULE

| Module | Route | Surface Dominante | Emploi de Cartes | Composant Spécialisé | Bottom Nav Mobile |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Dashboard** | `/app` | Ouverte (Lin) | Carte Unique (Incident Bay) | Dual-plane asymétrique | **Accueil** |
| **2. Conversations** | `/app/conversations` | Ouverte (Lin) | Zéro carte | Triptyque continu 3 volets | **Conversations** |
| **3. Demandes** | `/app/tickets` | Ouverte (Table) | Zéro carte (Lignes fines) | Slide-over d'inspection 520px | **Demandes** |
| **4. Clients** | `/app/customers` | Split-view | Cartouche profil ciblé | Fiche relationnelle 360° | Accessible via **Menu** |
| **5. Équipe** | `/app/team` | Ouverte (Table) | Zéro carte | Modale formelle d'invitation | Accessible via **Paramètres** / **Menu** |
| **6. Agences** | `/app/branches` | Grille de cartes | **Oui** (Une carte par agence) | Mosaïque de comptoirs + État vide calme | Accessible via **Menu** |
| **7. Configuration IA** | `/app/ai-config` | Deux colonnes | Zéro carte | Simulateur bac à sable interne | Accessible via **Paramètres** / **Menu** |
| **8. Connaissances** | `/app/knowledge` | Rayonnage ouvert | Zéro carte | Zone de dépôt drag-and-drop | Accessible via **Menu** |
| **9. Statistiques** | `/app/analytics` | Linéaire ouverte | Cartouches métriques maîtres | Graphique Recharts monochrome | Accessible via **Menu** |
| **10. Paramètres** | `/app/settings` | Formulaire sobre | Cartouche abonnement | Barre de sauvegarde flottante | **Paramètres** |

---
*Ce document verrouille définitivement la vérité métier, la disposition spatiale et la compatibilité mobile des 10 modules de Zadesk.*
