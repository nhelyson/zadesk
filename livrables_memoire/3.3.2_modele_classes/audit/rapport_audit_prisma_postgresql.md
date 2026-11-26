# RAPPORT D'AUDIT TECHNIQUE : PRISMA ORM & BASE POSTGRESQL RÉELLE
## Mémoire de Licence en Génie Informatique — Section 3.3.2 : Structure et organisation des données
### Plateforme SaaS Zalisk (Gestion Omnicanale & Intelligente du SAV)

---

## 1. Contexte et Objectifs de l'Audit

Dans le cadre de la modélisation des données de la plateforme SaaS **Zalisk**, cet audit a pour mission d'établir une cartographie exhaustive et rigoureuse de la structure de persistance relationnelle.
Conformément aux exigences académiques de la section 3.3.2, il s'agit d'analyser l'implémentation effective du système sans extrapolation théorique, en confrontant directement :
1. Les déclarations du schéma déclaratif **Prisma ORM** (`backend/prisma/schema.prisma`).
2. Les scripts SQL de **migrations incrémentales** (`backend/prisma/migrations/`).
3. Le catalogue système réel du conteneur **PostgreSQL 16** (`information_schema` et `pg_catalog`).

Toutes les opérations d'inspection ont été menées en **lecture seule stricte**, sans altération des schémas, sans exécution de mutations et dans le respect absolu de la confidentialité des données et des identifiants.

---

## 2. Environnement et Topologie d'Exécution

L'infrastructure de base de données relationnelle est encapsulée au sein de l'environnement Docker de Zalisk, orchestré via Docker Compose :

| Paramètre | Valeur Observée | Description / Rôle Technique |
| :--- | :--- | :--- |
| **Service Docker** | `postgres` | Service de base de données relationnelle |
| **Conteneur actif** | `zadesk-postgres` | Instance active (statut `Up (healthy)`) |
| **Image Docker** | `postgres:16-alpine` | Moteur PostgreSQL 16 basé sur Alpine Linux |
| **Port interne** | `5432/tcp` | Port d'écoute standard PostgreSQL |
| **Nom de la base** | `zadesk` (alias métier `zalisk`) | Base de données principale de l'application |
| **Schéma SQL** | `public` | Espace de nommage des tables et types applicatifs |
| **Volume de données** | `postgres_data` | Volume persistant Docker monté sur `/var/lib/postgresql/data` |
| **Réseau interne** | `zadesk-network` | Réseau virtuel bridge isolant les conteneurs backend, worker et DB |
| **Healthcheck** | `pg_isready` | Vérification de disponibilité toutes les 5 secondes |

> [!NOTE]
> Conformément aux règles de sécurité, aucune information sensible (mots de passe, clés secrètes ou chaînes de connexion brutes) n'est reproduite dans ce rapport.

---

## 3. Synthèse Quantitative de l'Audit

L'interrogation conjointe du schéma Prisma et des tables systèmes du conteneur PostgreSQL met en évidence les métriques suivantes :

```
┌───────────────────────────────────────────┬──────────────┬───────────────────┐
│ Indicateur de Structure                   │ Prisma ORM   │ PostgreSQL Réel   │
├───────────────────────────────────────────┼──────────────┼───────────────────┤
│ Modèles / Tables applicatives             │ 34 modèles   │ 34 tables         │
│ Table interne de migration                │ Non déclarée │ 1 table (_prisma) │
│ Total des tables physiques                │ -            │ 35 tables         │
│ Colonnes physiques réelles                │ -            │ 408 colonnes      │
│ Clés primaires définies                   │ 34           │ 35 (avec _prisma) │
│ Clés étrangères relationnelles            │ 61           │ 61 contraintes FK │
│ Types Énumérés (ENUM) applicatifs         │ 20 énumérées │ 20 types pg_enum  │
│ Migrations incrémentales appliquées       │ 5 dossiers   │ 5 enregistrements │
└───────────────────────────────────────────┴──────────────┴───────────────────┘
```

**Verdict de conformité : 100 %**. Toutes les tables et colonnes déclarées dans le schéma Prisma sont rigoureusement matérialisées dans le moteur PostgreSQL, avec une correspondance parfaite des contraintes d'intégrité référentielle (`CASCADE`, `SET NULL`, `RESTRICT`).

---

## 4. Analyse des Domaines Fonctionnels de Zalisk

Les 34 modèles de données s'organisent en quatre grands piliers fonctionnels complétés par une couche d'infrastructure technique :

### 4.1 Domaine A : Isolation Multi-Tenant & Gestion des Utilisateurs
- **Modèle pivot :** `Workspace` (table `workspaces`). Représente l'entreprise cliente. Chaque enregistrement métier dans Zalisk (tickets, conversations, membres, configurations) est partitionné par la clé étrangère `workspaceId`.
- **Identité globale :** `User` (table `users`). Un utilisateur représente une identité unique transversale.
- **Classe d'association :** `Membership` (table `memberships`). Un utilisateur **ne possède pas** directement une entreprise : il y est rattaché via un enregistrement d'adhésion (`Membership`) portant un rôle RBAC (`Role`: `OWNER`, `ADMIN`, `MANAGER`, `AGENT`) et un statut (`MembershipStatus`: `ACTIVE`, `SUSPENDED`, `ARCHIVED`). Cette conception permet à un même compte utilisateur d'appartenir à plusieurs espaces sans collision de privilèges.
- **Onboarding & Invitations :** `WorkspaceInvitation` gère les invitations sécurisées avec jetons d'expiration horodatés.

### 4.2 Domaine B : Conversations Omnicanales & Tickets SAV
Le schéma sépare rigoureusement la **conversation temps réel** du **ticket officiel** :
- **Conversation (`conversations`) :** Fil de discussion omnicanal asynchrone ou direct (web tchat, WhatsApp). Elle peut être initiée par un client anonyme (via un jeton sécurisé `sessionToken`) ou authentifié (`customerId`). Statuts : `WAITING_ASSIGNMENT`, `ACTIVE`, `WAITING_CUSTOMER`, `RESOLVED`, `CLOSED`.
- **Message (`conversation_messages`) :** Unité de dialogue horodatée. Typage strict (`MessageType`: `CUSTOMER`, `AGENT_REPLY`, `INTERNAL_NOTE`, `SYSTEM`). Les notes internes sont masquées au client par filtrage applicatif.
- **Ticket SAV (`tickets`) :** Dossier formel de réclamation avec numéro d'identification unique (`TICK-YYYYMMDD-XXXX`), niveau d'urgence (`TicketPriority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`), statut de traitement (`TicketStatus`: `PENDING_ASSIGNMENT`, `OPEN`, `IN_PROGRESS`, `WAITING_CUSTOMER`, `RESOLVED`, `CLOSED`) et objectifs de temps de résolution (SLA).
- **Élévation :** Une conversation peut être élevée en ticket formel via la relation optionnelle 1-to-1 (`conversationId` unique sur `tickets`).
- **Collaboration :** Les tables `TicketAssignment`, `TicketShare` et `ConversationShare` permettent l'affectation nominative et le partage temporaire d'un dossier en mode lecture ou contribution (`ShareAccessLevel`).
- **Traçabilité :** `TicketActivity` journalise chaque action (changement de statut, réaffectation, commentaire).

### 4.3 Domaine C : Organisation du SAV, Compétences & Établissements
- **Profil Conseiller (`agent_profiles`) :** Extension opérationnelle du compte utilisateur rattaché à un espace. Contient la disponibilité dynamique (`AgentAvailability`: `AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE`), la capacité maximale simultanée de tickets (`maxConcurrentTickets`) et la charge instantanée (`currentTicketsCount`).
- **Matrice de Compétences (`skills` & `agent_skills`) :** Référentiel des compétences techniques et linguistiques. L'entité de liaison `AgentSkill` associe un agent à une compétence avec un niveau de maîtrise quantifié (`level` de 1 à 5).
- **Réseau physique (`establishments`) :** Succursales, magasins ou ateliers de réparation rattachés au Workspace (`EstablishmentType`: `HEADQUARTERS`, `BRANCH`, `STORE`, `TECH_CENTER`, etc.) avec adresse et coordonnées géographiques.

### 4.4 Domaine D : Gestion Commerciale, Facturation & Abonnements (SasPay)
- **Abonnement (`subscriptions`) :** Contrat commercial de l'espace de travail. Typage par forfait (`PlanType`: `DECOUVERTE`, `STARTER`, `PRO`, `ENTREPRISE`) et statut (`SubscriptionStatus`: `ACTIVE`, `RENEWAL_DUE`, `GRACE_PERIOD`, `EXPIRED`, `CANCELLED`). Définit les plafonds stricts (nombre d'agents, de tickets mensuels, accès API/WhatsApp).
- **Intention de souscription (`subscription_intents`) :** Enregistrement immuable d'une démarche d'achat, de renouvellement ou de modification de formule (`IntentType`).
- **Tentatives de paiement (`payment_attempts`) :** Enregistrement de chaque tentative auprès de la passerelle SasPay / Mobile Money (`AttemptStatus`).
- **Transactions validées (`payment_transactions`) :** Transaction confirmée financièrement et appliquée à la période de souscription.

### 4.5 Couche Technique & Infrastructurelle (Exclue du diagramme conceptuel)
- `Session` & `OtpToken` : Gestion éphémère de l'authentification et de la validation OTP.
- `PendingRegistration` & `OnboardingDraft` : Persistance temporaire d'état UI avant finalisation.
- `OutboxEvent` : Implémentation du pattern *Transactional Outbox* garantissant la cohérence à deux phases entre la base relationnelle et le bus d'événements asynchrone Redis.
- `AuditLog` : Journal d'accès technique (IP, user-agent).
- `ProcessedWebhookEvent` & `QuarantinedWebhookPayload` : Gestion de l'idempotence et quarantaine des webhooks.

---

## 5. Conclusion de l'Audit

L'audit technique confirme que la base relationnelle de Zalisk est saine, hautement normalisée (3FN) et intègre des contraintes d'intégrité strictes. 
Le diagramme de classes UML devra modéliser les **19 classes métier fondamentales** issues des 4 domaines clés, en omettant les tables d'infrastructure technique pour garantir une clarté conceptuelle optimale.
