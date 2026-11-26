# RAPPORT D'EXTRACTION TECHNIQUE APPROFONDIE — MODÈLE DE CLASSES UML DE ZALISK

**Cadre académique** : Mémoire de Licence en Génie Informatique — Section 3.3.2 (*Structure et organisation des données*)
**Auteur / Rôle** : Expert Concepteur & Ingénieur Logiciel
**Date de vérification** : 22 novembre 2026
**Plateforme auditée** : Zalisk (SaaS Omnicanal de SAV et Relation Client)
**Sources vérifiées** : `backend/prisma/schema.prisma`, instance PostgreSQL 16 active (`zadesk-postgres`, base `zadesk`), et migrations `backend/prisma/migrations/`.

---

## 1. INVENTAIRE DES 19 CLASSES MÉTIER CENTRALES

Les 19 classes métier retenues pour le modèle conceptuel et logique de données de Zalisk ont été sélectionnées parmi les 34 modèles déclarés dans Prisma et les 35 tables physiques hébergées dans PostgreSQL. Elles capturent l'intégralité du domaine fonctionnel de la plateforme.

| N° | Classe (Modèle Prisma) | Table PostgreSQL | Package Fonctionnel | Responsabilité Métier | Nbr Attributs Scalaires |
|---|---|---|---|---|:---:|
| 1 | `User` | `users` | Multi-Tenant & Utilisateurs | Gestion des identités, comptes utilisateurs et authentification. | 10 |
| 2 | `Workspace` | `workspaces` | Multi-Tenant & Utilisateurs | Entité racine multi-tenant représentant une entreprise cliente. | 26 |
| 3 | `WorkspaceInvitation` | `workspace_invitations` | Multi-Tenant & Utilisateurs | Gestion des invitations émises pour rejoindre une entreprise. | 16 |
| 4 | `Membership` | `memberships` | Multi-Tenant & Utilisateurs | Adhésion associative liant un utilisateur à un espace avec rôle et statut. | 9 |
| 5 | `AgentProfile` | `agent_profiles` | Organisation & Compétences | Profil étendu d'un agent SAV (disponibilité, capacité max, routage). | 12 |
| 6 | `Skill` | `skills` | Organisation & Compétences | Compétence technique ou fonctionnelle répertoriée par une entreprise. | 6 |
| 7 | `AgentSkill` | `agent_skills` | Organisation & Compétences | Certification d'une compétence pour un profil agent donné. | 6 |
| 8 | `Ticket` | `tickets` | Conversations & SAV | Dossier contractuel officiel de réclamation SAV avec suivi SLA. | 20 |
| 9 | `TicketAssignment` | `ticket_assignments` | Conversations & SAV | Historique d'audit et traçabilité des réaffectations de tickets. | 7 |
| 10 | `TicketShare` | `ticket_shares` | Conversations & SAV | Partage collaboratif d'un ticket entre agents (lecture ou contribution). | 7 |
| 11 | `TicketActivity` | `ticket_activities` | Conversations & SAV | Journal d'activité et d'événements sur le cycle de vie d'un ticket. | 6 |
| 12 | `Conversation` | `conversations` | Conversations & SAV | Fil de discussion omnicanal temps réel (portail public, web, chat). | 14 |
| 13 | `ConversationMessage` | `conversation_messages` | Conversations & SAV | Message unitaire horodaté au sein d'une conversation (public ou note interne). | 8 |
| 14 | `ConversationShare` | `conversation_shares` | Conversations & SAV | Partage collaboratif d'une conversation entre agents. | 6 |
| 15 | `Establishment` | `establishments` | Organisation & Compétences | Point de présence physique de l'entreprise (siège, agence, point relais). | 23 |
| 16 | `Subscription` | `subscriptions` | Abonnements & SasPay | Contrat d'abonnement SaaS actif souscrit par un Workspace. | 14 |
| 17 | `SubscriptionIntent` | `subscription_intents` | Abonnements & SasPay | Intention de souscription/renouvellement/changement de formule. | 13 |
| 18 | `PaymentAttempt` | `payment_attempts` | Abonnements & SasPay | Tentative d'exécution d'un paiement auprès de la passerelle SasPay. | 13 |
| 19 | `PaymentTransaction` | `payment_transactions` | Abonnements & SasPay | Transaction financière validée et imputée à l'abonnement. | 15 |

---

## 2. FICHES DÉTAILLÉES DES 19 CLASSES MÉTIER ET DE LEURS ATTRIBUTS

### 2.User — Modèle `User`

- **Nom Prisma** : `User`
- **Table PostgreSQL** : `users` (mappée via `@@map("users")`)
- **Package fonctionnel** : Multi-Tenant & Utilisateurs
- **Responsabilité métier** : Gestion des identités, comptes utilisateurs et authentification.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `googleId` | `String` | `text` | Facultatif | — | — | `—` | Unique | **Secondaire** |
| `email` | `String` | `text` | Obligatoire | — | — | `—` | Unique | **Indispensable** |
| `firstName` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `lastName` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `avatarUrl` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `passwordHash` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `emailVerified` | `Boolean` | `bool` | Obligatoire | — | — | `false` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Membership` | `memberships` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `WorkspaceInvitation` | `sentInvitations` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `AgentProfile` | `agentProfiles` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Ticket` | `assignedTickets` | (définie côté inverse) | `0..*` | `0..1` | `AssignedAgentTickets` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `Ticket` | `createdTickets` | (définie côté inverse) | `0..*` | `0..1` | `CreatedTickets` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketShare` | `receivedTicketShares` | (définie côté inverse) | `0..*` | `1` | `ReceivedTicketShares` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketShare` | `createdTicketShares` | (définie côté inverse) | `0..*` | `1` | `CreatedTicketShares` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketAssignment` | `prevAssignments` | (définie côté inverse) | `0..*` | `0..1` | `PrevAgentAssignments` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketAssignment` | `newAssignments` | (définie côté inverse) | `0..*` | `0..1` | `NewAgentAssignments` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketAssignment` | `madeAssignments` | (définie côté inverse) | `0..*` | `0..1` | `AssignedByAssignments` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketActivity` | `ticketActivities` | (définie côté inverse) | `0..*` | `0..1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Conversation` | `assignedConversations` | (définie côté inverse) | `0..*` | `0..1` | `AssignedConversations` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `ConversationMessage` | `messages` | (définie côté inverse) | `0..*` | `0..1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `ConversationShare` | `receivedConvShares` | (définie côté inverse) | `0..*` | `1` | `ReceivedConversationShares` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `ConversationShare` | `createdConvShares` | (définie côté inverse) | `0..*` | `1` | `CreatedConversationShares` | `ON DELETE None` | Collection relationnelle gérée par la clé étrangère cible |
| `SubscriptionIntent` | `subscriptionIntents` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.Workspace — Modèle `Workspace`

- **Nom Prisma** : `Workspace`
- **Table PostgreSQL** : `workspaces` (mappée via `@@map("workspaces")`)
- **Package fonctionnel** : Multi-Tenant & Utilisateurs
- **Responsabilité métier** : Entité racine multi-tenant représentant une entreprise cliente.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `name` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `normalizedName` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `slug` | `String` | `text` | Obligatoire | — | — | `—` | Unique | **Indispensable** |
| `hasExistingSav` | `Boolean` | `bool` | Obligatoire | — | — | `false` | — | **Utile** |
| `description` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `category` | `String` | `text` | Facultatif | — | — | `"Autre"` | — | **Utile** |
| `logoUrl` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `coverUrl` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `verified` | `Boolean` | `bool` | Obligatoire | — | — | `true` | — | **Secondaire** |
| `isPublic` | `Boolean` | `bool` | Obligatoire | — | — | `true` | — | **Utile** |
| `website` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `supportPhone` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `supportEmail` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `supportWhatsApp` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `address` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `city` | `String` | `text` | Facultatif | — | — | `"Brazzaville"` | — | **Secondaire** |
| `country` | `String` | `text` | Facultatif | — | — | `"Congo"` | — | **Secondaire** |
| `openingHours` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `supportCategories` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `brandColor` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `brandPalette` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `cannedResponses` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `businessHours` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Membership` | `memberships` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `WorkspaceInvitation` | `invitations` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `AgentProfile` | `agentProfiles` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Skill` | `skills` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Ticket` | `tickets` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Conversation` | `conversations` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Establishment` | `establishments` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Subscription` | `subscription` | (définie côté inverse) | `0..1` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `SubscriptionIntent` | `subscriptionIntents` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `PaymentAttempt` | `paymentAttempts` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `PaymentTransaction` | `paymentTransactions` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.WorkspaceInvitation — Modèle `WorkspaceInvitation`

- **Nom Prisma** : `WorkspaceInvitation`
- **Table PostgreSQL** : `workspace_invitations` (mappée via `@@map("workspace_invitations")`)
- **Package fonctionnel** : Multi-Tenant & Utilisateurs
- **Responsabilité métier** : Gestion des invitations émises pour rejoindre une entreprise.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `email` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `role` | `Role` | `Role` | Obligatoire | — | — | `AGENT` | — | **Indispensable** |
| `token` | `String` | `text` | Obligatoire | — | — | `—` | Unique | **Secondaire** |
| `invitedById` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `expiresAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |
| `acceptedAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `revokedAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `dispatchStatus` | `String` | `text` | Facultatif | — | — | `"PENDING"` | — | **Secondaire** |
| `dispatchLockedBy` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `dispatchStartedAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `dispatchAttempts` | `Int` | `int4` | Obligatoire | — | — | `0` | — | **Secondaire** |
| `nextRetryAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `dispatchError` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `invitedBy` | `invitedById` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |

---

### 2.Membership — Modèle `Membership`

- **Nom Prisma** : `Membership`
- **Table PostgreSQL** : `memberships` (mappée via `@@map("memberships")`)
- **Package fonctionnel** : Multi-Tenant & Utilisateurs
- **Responsabilité métier** : Adhésion associative liant un utilisateur à un espace avec rôle et statut.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `userId` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `role` | `Role` | `Role` | Obligatoire | — | — | `AGENT` | — | **Indispensable** |
| `status` | `MembershipStatus` | `MembershipStatus` | Obligatoire | — | — | `ACTIVE` | — | **Indispensable** |
| `suspendedAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `suspendedReason` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `User` | `user` | `userId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |

---

### 2.AgentProfile — Modèle `AgentProfile`

- **Nom Prisma** : `AgentProfile`
- **Table PostgreSQL** : `agent_profiles` (mappée via `@@map("agent_profiles")`)
- **Package fonctionnel** : Organisation & Compétences
- **Responsabilité métier** : Profil étendu d'un agent SAV (disponibilité, capacité max, routage).

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `userId` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `availability` | `AgentAvailability` | `AgentAvailability` | Obligatoire | — | — | `AVAILABLE` | — | **Indispensable** |
| `maxCapacity` | `Int` | `int4` | Obligatoire | — | — | `10` | — | **Utile** |
| `autoAssignmentEnabled` | `Boolean` | `bool` | Obligatoire | — | — | `true` | — | **Utile** |
| `title` | `String` | `text` | Facultatif | — | — | `"Agent SAV"` | — | **Indispensable** |
| `phone` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `notificationEmail` | `Boolean` | `bool` | Obligatoire | — | — | `true` | — | **Secondaire** |
| `notificationApp` | `Boolean` | `bool` | Obligatoire | — | — | `true` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `user` | `userId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `AgentSkill` | `skills` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.Skill — Modèle `Skill`

- **Nom Prisma** : `Skill`
- **Table PostgreSQL** : `skills` (mappée via `@@map("skills")`)
- **Package fonctionnel** : Organisation & Compétences
- **Responsabilité métier** : Compétence technique ou fonctionnelle répertoriée par une entreprise.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `name` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `description` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `AgentSkill` | `agents` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.AgentSkill — Modèle `AgentSkill`

- **Nom Prisma** : `AgentSkill`
- **Table PostgreSQL** : `agent_skills` (mappée via `@@map("agent_skills")`)
- **Package fonctionnel** : Organisation & Compétences
- **Responsabilité métier** : Certification d'une compétence pour un profil agent donné.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `agentProfileId` | `String` | `text` | Obligatoire | — | `agent_profiles.id` | `—` | — | **Indispensable** |
| `skillId` | `String` | `text` | Obligatoire | — | `skills.id` | `—` | — | **Indispensable** |
| `validatedById` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `validatedAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `AgentProfile` | `agentProfile` | `agentProfileId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `Skill` | `skill` | `skillId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |

---

### 2.Ticket — Modèle `Ticket`

- **Nom Prisma** : `Ticket`
- **Table PostgreSQL** : `tickets` (mappée via `@@map("tickets")`)
- **Package fonctionnel** : Conversations & SAV
- **Responsabilité métier** : Dossier contractuel officiel de réclamation SAV avec suivi SLA.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `reference` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `assignedAgentId` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `createdById` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `title` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `description` | `String` | `text` | Obligatoire | — | — | `—` | — | **Utile** |
| `category` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `priority` | `TicketPriority` | `TicketPriority` | Obligatoire | — | — | `MEDIUM` | — | **Indispensable** |
| `status` | `TicketStatus` | `TicketStatus` | Obligatoire | — | — | `OPEN` | — | **Indispensable** |
| `customerName` | `String` | `text` | Obligatoire | — | — | `—` | — | **Utile** |
| `customerPhone` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `customerEmail` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `slaDueAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Indispensable** |
| `resolvedAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Utile** |
| `closedAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Utile** |
| `conversationId` | `String` | `text` | Facultatif | — | `conversations.id` | `—` | — | **Indispensable** |
| `metadata` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `assignedAgent` | `assignedAgentId` $\to$ `id` | `0..1` | `0..*` | `AssignedAgentTickets` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |
| `User` | `createdBy` | `createdById` $\to$ `id` | `0..1` | `0..*` | `CreatedTickets` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |
| `Conversation` | `conversation` | `conversationId` $\to$ `id` | `0..1` | `0..*` | `—` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |
| `TicketAssignment` | `assignments` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketShare` | `shares` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `TicketActivity` | `activities` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.TicketAssignment — Modèle `TicketAssignment`

- **Nom Prisma** : `TicketAssignment`
- **Table PostgreSQL** : `ticket_assignments` (mappée via `@@map("ticket_assignments")`)
- **Package fonctionnel** : Conversations & SAV
- **Responsabilité métier** : Historique d'audit et traçabilité des réaffectations de tickets.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `ticketId` | `String` | `text` | Obligatoire | — | `tickets.id` | `—` | — | **Indispensable** |
| `previousAgentId` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `newAgentId` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `assignedById` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `reason` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Ticket` | `ticket` | `ticketId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `previousAgent` | `previousAgentId` $\to$ `id` | `0..1` | `0..*` | `PrevAgentAssignments` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |
| `User` | `newAgent` | `newAgentId` $\to$ `id` | `0..1` | `0..*` | `NewAgentAssignments` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |
| `User` | `assignedBy` | `assignedById` $\to$ `id` | `0..1` | `0..*` | `AssignedByAssignments` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |

---

### 2.TicketShare — Modèle `TicketShare`

- **Nom Prisma** : `TicketShare`
- **Table PostgreSQL** : `ticket_shares` (mappée via `@@map("ticket_shares")`)
- **Package fonctionnel** : Conversations & SAV
- **Responsabilité métier** : Partage collaboratif d'un ticket entre agents (lecture ou contribution).

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `ticketId` | `String` | `text` | Obligatoire | — | `tickets.id` | `—` | — | **Indispensable** |
| `agentId` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `sharedById` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `accessLevel` | `ShareAccessLevel` | `ShareAccessLevel` | Obligatoire | — | — | `READ_ONLY` | — | **Indispensable** |
| `expiresAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Ticket` | `ticket` | `ticketId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `agent` | `agentId` $\to$ `id` | `1` | `0..*` | `ReceivedTicketShares` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `sharedBy` | `sharedById` $\to$ `id` | `1` | `0..*` | `CreatedTicketShares` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |

---

### 2.TicketActivity — Modèle `TicketActivity`

- **Nom Prisma** : `TicketActivity`
- **Table PostgreSQL** : `ticket_activities` (mappée via `@@map("ticket_activities")`)
- **Package fonctionnel** : Conversations & SAV
- **Responsabilité métier** : Journal d'activité et d'événements sur le cycle de vie d'un ticket.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `ticketId` | `String` | `text` | Obligatoire | — | `tickets.id` | `—` | — | **Indispensable** |
| `authorId` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `type` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `content` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Ticket` | `ticket` | `ticketId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `author` | `authorId` $\to$ `id` | `0..1` | `0..*` | `—` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |

---

### 2.Conversation — Modèle `Conversation`

- **Nom Prisma** : `Conversation`
- **Table PostgreSQL** : `conversations` (mappée via `@@map("conversations")`)
- **Package fonctionnel** : Conversations & SAV
- **Responsabilité métier** : Fil de discussion omnicanal temps réel (portail public, web, chat).

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `assignedAgentId` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `customerName` | `String` | `text` | Obligatoire | — | — | `—` | — | **Utile** |
| `customerPhone` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `customerEmail` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `category` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `channel` | `String` | `text` | Obligatoire | — | — | `"PORTAL"` | — | **Utile** |
| `status` | `ConversationStatus` | `ConversationStatus` | Obligatoire | — | — | `ACTIVE` | — | **Indispensable** |
| `priority` | `TicketPriority` | `TicketPriority` | Obligatoire | — | — | `MEDIUM` | — | **Indispensable** |
| `publicTokenHash` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `lastMessageAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `assignedAgent` | `assignedAgentId` $\to$ `id` | `0..1` | `0..*` | `AssignedConversations` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |
| `ConversationMessage` | `messages` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `ConversationShare` | `shares` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `Ticket` | `tickets` | (définie côté inverse) | `0..*` | `0..1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.ConversationMessage — Modèle `ConversationMessage`

- **Nom Prisma** : `ConversationMessage`
- **Table PostgreSQL** : `conversation_messages` (mappée via `@@map("conversation_messages")`)
- **Package fonctionnel** : Conversations & SAV
- **Responsabilité métier** : Message unitaire horodaté au sein d'une conversation (public ou note interne).

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `conversationId` | `String` | `text` | Obligatoire | — | `conversations.id` | `—` | — | **Indispensable** |
| `senderId` | `String` | `text` | Facultatif | — | `users.id` | `—` | — | **Indispensable** |
| `senderType` | `MessageType` | `MessageType` | Obligatoire | — | — | `CUSTOMER` | — | **Utile** |
| `senderName` | `String` | `text` | Obligatoire | — | — | `—` | — | **Secondaire** |
| `content` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `isInternalNote` | `Boolean` | `bool` | Obligatoire | — | — | `false` | — | **Utile** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Conversation` | `conversation` | `conversationId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `sender` | `senderId` $\to$ `id` | `0..1` | `0..*` | `—` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |

---

### 2.ConversationShare — Modèle `ConversationShare`

- **Nom Prisma** : `ConversationShare`
- **Table PostgreSQL** : `conversation_shares` (mappée via `@@map("conversation_shares")`)
- **Package fonctionnel** : Conversations & SAV
- **Responsabilité métier** : Partage collaboratif d'une conversation entre agents.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `conversationId` | `String` | `text` | Obligatoire | — | `conversations.id` | `—` | — | **Indispensable** |
| `agentId` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `sharedById` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `accessLevel` | `ShareAccessLevel` | `ShareAccessLevel` | Obligatoire | — | — | `READ_ONLY` | — | **Indispensable** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Conversation` | `conversation` | `conversationId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `agent` | `agentId` $\to$ `id` | `1` | `0..*` | `ReceivedConversationShares` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `sharedBy` | `sharedById` $\to$ `id` | `1` | `0..*` | `CreatedConversationShares` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |

---

### 2.Establishment — Modèle `Establishment`

- **Nom Prisma** : `Establishment`
- **Table PostgreSQL** : `establishments` (mappée via `@@map("establishments")`)
- **Package fonctionnel** : Organisation & Compétences
- **Responsabilité métier** : Point de présence physique de l'entreprise (siège, agence, point relais).

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `name` | `String` | `text` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `type` | `EstablishmentType` | `EstablishmentType` | Obligatoire | — | — | `BRANCH` | — | **Indispensable** |
| `description` | `String` | `text` | Facultatif | — | — | `—` | — | **Utile** |
| `isMain` | `Boolean` | `bool` | Obligatoire | — | — | `false` | — | **Indispensable** |
| `isPublic` | `Boolean` | `bool` | Obligatoire | — | — | `true` | — | **Utile** |
| `isActive` | `Boolean` | `bool` | Obligatoire | — | — | `true` | — | **Indispensable** |
| `address` | `String` | `text` | Obligatoire | — | — | `—` | — | **Secondaire** |
| `city` | `String` | `text` | Obligatoire | — | — | `"Brazzaville"` | — | **Secondaire** |
| `country` | `String` | `text` | Obligatoire | — | — | `"Congo"` | — | **Secondaire** |
| `addressDetails` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `phone` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `email` | `String` | `text` | Facultatif | — | — | `—` | — | **Indispensable** |
| `whatsapp` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `openingHours` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `businessHours` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `imageUrl` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `galleryImages` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `services` | `Json` | `jsonb` | Facultatif | — | — | `—` | — | **Secondaire** |
| `practicalInfo` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Cascade` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |

---

### 2.Subscription — Modèle `Subscription`

- **Nom Prisma** : `Subscription`
- **Table PostgreSQL** : `subscriptions` (mappée via `@@map("subscriptions")`)
- **Package fonctionnel** : Abonnements & SasPay
- **Responsabilité métier** : Contrat d'abonnement SaaS actif souscrit par un Workspace.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | Unique | **Indispensable** |
| `plan` | `PlanType` | `PlanType` | Obligatoire | — | — | `DECOUVERTE` | — | **Indispensable** |
| `status` | `SubscriptionStatus` | `SubscriptionStatus` | Obligatoire | — | — | `ACTIVE` | — | **Indispensable** |
| `activePriceXaf` | `Int` | `int4` | Obligatoire | — | — | `0` | — | **Indispensable** |
| `currentPeriodStart` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Utile** |
| `currentPeriodEnd` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Utile** |
| `gracePeriodEnd` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Utile** |
| `billingAnchorDay` | `Int` | `int4` | Facultatif | — | — | `—` | — | **Secondaire** |
| `version` | `Int` | `int4` | Obligatoire | — | — | `1` | — | **Secondaire** |
| `lastNoticeSentAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `noticeCount` | `Int` | `int4` | Obligatoire | — | — | `0` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..1` | `—` | `ON DELETE Restrict` | FK obligatoire avec contrainte d'unicité (1-to-1) |
| `SubscriptionIntent` | `intents` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `PaymentTransaction` | `transactions` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.SubscriptionIntent — Modèle `SubscriptionIntent`

- **Nom Prisma** : `SubscriptionIntent`
- **Table PostgreSQL** : `subscription_intents` (mappée via `@@map("subscription_intents")`)
- **Package fonctionnel** : Abonnements & SasPay
- **Responsabilité métier** : Intention de souscription/renouvellement/changement de formule.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `subscriptionId` | `String` | `text` | Obligatoire | — | `subscriptions.id` | `—` | — | **Indispensable** |
| `userId` | `String` | `text` | Obligatoire | — | `users.id` | `—` | — | **Indispensable** |
| `intentType` | `IntentType` | `IntentType` | Obligatoire | — | — | `INITIAL_PURCHASE` | — | **Utile** |
| `targetPlan` | `PlanType` | `PlanType` | Obligatoire | — | — | `—` | — | **Utile** |
| `priceXaf` | `Int` | `int4` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `currency` | `String` | `text` | Obligatoire | — | — | `"XAF"` | — | **Utile** |
| `status` | `IntentStatus` | `IntentStatus` | Obligatoire | — | — | `PENDING` | — | **Indispensable** |
| `clientMutationKey` | `String` | `text` | Obligatoire | — | — | `—` | Unique | **Utile** |
| `expectedSubscriptionVersion` | `Int` | `int4` | Obligatoire | — | — | `1` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `Subscription` | `subscription` | `subscriptionId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `User` | `user` | `userId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `PaymentAttempt` | `attempts` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |
| `PaymentTransaction` | `transactions` | (définie côté inverse) | `0..*` | `1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.PaymentAttempt — Modèle `PaymentAttempt`

- **Nom Prisma** : `PaymentAttempt`
- **Table PostgreSQL** : `payment_attempts` (mappée via `@@map("payment_attempts")`)
- **Package fonctionnel** : Abonnements & SasPay
- **Responsabilité métier** : Tentative d'exécution d'un paiement auprès de la passerelle SasPay.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `intentId` | `String` | `text` | Obligatoire | — | `subscription_intents.id` | `—` | — | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `attemptNumber` | `Int` | `int4` | Obligatoire | — | — | `1` | — | **Utile** |
| `provider` | `String` | `text` | Obligatoire | — | — | `"SASPAY"` | — | **Utile** |
| `providerSessionId` | `String` | `text` | Facultatif | — | — | `—` | Unique | **Secondaire** |
| `checkoutUrl` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `status` | `AttemptStatus` | `AttemptStatus` | Obligatoire | — | — | `INITIATED` | — | **Indispensable** |
| `localAttemptKey` | `String` | `text` | Obligatoire | — | — | `—` | Unique | **Utile** |
| `expiresAt` | `DateTime` | `timestamp` | Facultatif | — | — | `—` | — | **Secondaire** |
| `failureReason` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |
| `updatedAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `SubscriptionIntent` | `intent` | `intentId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `PaymentTransaction` | `transactions` | (définie côté inverse) | `0..*` | `0..1` | `—` | `Standard` | Collection relationnelle gérée par la clé étrangère cible |

---

### 2.PaymentTransaction — Modèle `PaymentTransaction`

- **Nom Prisma** : `PaymentTransaction`
- **Table PostgreSQL** : `payment_transactions` (mappée via `@@map("payment_transactions")`)
- **Package fonctionnel** : Abonnements & SasPay
- **Responsabilité métier** : Transaction financière validée et imputée à l'abonnement.

#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes

| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |
|---|---|---|---|:---:|---|---|:---:|:---:|
| `id` | `String` | `text` | Obligatoire | PK | — | `cuid(` | — | **Indispensable** |
| `receiptId` | `String` | `text` | Obligatoire | — | `provider_payment_receipts.id` | `—` | Unique | **Indispensable** |
| `workspaceId` | `String` | `text` | Obligatoire | — | `workspaces.id` | `—` | — | **Indispensable** |
| `subscriptionId` | `String` | `text` | Obligatoire | — | `subscriptions.id` | `—` | — | **Indispensable** |
| `intentId` | `String` | `text` | Obligatoire | — | `subscription_intents.id` | `—` | — | **Indispensable** |
| `attemptId` | `String` | `text` | Facultatif | — | `payment_attempts.id` | `—` | — | **Indispensable** |
| `provider` | `String` | `text` | Obligatoire | — | — | `"SASPAY"` | — | **Utile** |
| `providerTransactionId` | `String` | `text` | Obligatoire | — | — | `—` | — | **Secondaire** |
| `amountXaf` | `Int` | `int4` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `currency` | `String` | `text` | Obligatoire | — | — | `"XAF"` | — | **Utile** |
| `paymentMethod` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `operatorReference` | `String` | `text` | Facultatif | — | — | `—` | — | **Secondaire** |
| `status` | `TransactionApplicationStatus` | `TransactionApplicationStatus` | Obligatoire | — | — | `—` | — | **Indispensable** |
| `paidAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `—` | — | **Utile** |
| `createdAt` | `DateTime` | `timestamp` | Obligatoire | — | — | `now(` | — | **Secondaire** |

#### Relations déclarées et associations UML correspondantes

| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\to$ B | Cardinalité B $\to$ A | Nom Relation | Règles intégrité | Justification contrainte |
|---|---|---|:---:|:---:|---|---|---|
| `Workspace` | `workspace` | `workspaceId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `Subscription` | `subscription` | `subscriptionId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `SubscriptionIntent` | `intent` | `intentId` $\to$ `id` | `1` | `0..*` | `—` | `ON DELETE Restrict` | FK obligatoire autorisant plusieurs occurrences (1-to-N) |
| `PaymentAttempt` | `attempt` | `attemptId` $\to$ `id` | `0..1` | `0..*` | `—` | `ON DELETE SetNull` | FK optionnelle autorisant plusieurs occurrences (1-to-N) |

---


## 3. INVENTAIRE DÉTAILLÉ DES ÉNUMÉRATIONS DU DOMAINE ZALISK

Le schéma Prisma et l'instance PostgreSQL comportent au total **20 types énumérés natifs (`pg_enum`)**. Parmi ceux-ci, **13 énumérations principales** gouvernent les états fonctionnels majeurs des entités du diagramme de classes métier, complétées par **2 énumérations financières d'exécution** et **5 énumérations techniques/exclues**.

### 3.1 Les 13 Énumérations Majeures Retenues pour le Diagramme de Classes UML

#### Énumération `Role`
- **Valeurs exactes vérifiées** : `OWNER, ADMIN, MANAGER, AGENT`
- **Utilisation dans le schéma** : `Membership.role`, `WorkspaceInvitation.role`
- **Utilité métier** : Contrôle d'accès basé sur les rôles (RBAC) au sein de chaque entreprise cliente (Workspace).
- **Pertinence UML** : **Indispensable (gouvernance de la sécurité et des autorisations multi-tenant).**

#### Énumération `MembershipStatus`
- **Valeurs exactes vérifiées** : `ACTIVE, SUSPENDED, ARCHIVED`
- **Utilisation dans le schéma** : `Membership.status`
- **Utilité métier** : Cycle de vie de l'adhésion d'un collaborateur (suspension administrative immédiate ou archivage historique).
- **Pertinence UML** : **Indispensable (gestion de l'accès opérationnel aux outils SAV).**

#### Énumération `TicketPriority`
- **Valeurs exactes vérifiées** : `LOW, MEDIUM, HIGH, URGENT`
- **Utilisation dans le schéma** : `Ticket.priority`, `Conversation.priority`
- **Utilité métier** : Degré d'urgence d'une réclamation servant au calcul dynamique des délais SLA et au tri des files d'attente.
- **Pertinence UML** : **Indispensable (pilotage de la performance SAV et engagement client).**

#### Énumération `TicketStatus`
- **Valeurs exactes vérifiées** : `PENDING_ASSIGNMENT, OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED`
- **Utilisation dans le schéma** : `Ticket.status`
- **Utilité métier** : Machine à états finis régissant l'évolution d'un ticket SAV de son ouverture jusqu'à sa clôture formelle.
- **Pertinence UML** : **Indispensable (processus central du cœur de métier).**

#### Énumération `ConversationStatus`
- **Valeurs exactes vérifiées** : `WAITING_ASSIGNMENT, ACTIVE, WAITING_CUSTOMER, RESOLVED, CLOSED`
- **Utilisation dans le schéma** : `Conversation.status`
- **Utilité métier** : État de la session omnicanale de chat direct entre un client et un téléconseiller.
- **Pertinence UML** : **Indispensable (gestion temps réel des flux entrants omnicanaux).**

#### Énumération `MessageType`
- **Valeurs exactes vérifiées** : `CUSTOMER, AGENT_REPLY, INTERNAL_NOTE, SYSTEM`
- **Utilisation dans le schéma** : `ConversationMessage.senderType`
- **Utilité métier** : Typologie du message échangé, garantissant la ségrégation stricte entre les notes internes d'équipe et les messages visibles par le client.
- **Pertinence UML** : **Indispensable (confidentialité interne et collaboration SAV).**

#### Énumération `ShareAccessLevel`
- **Valeurs exactes vérifiées** : `READ_ONLY, CONTRIBUTE`
- **Utilisation dans le schéma** : `TicketShare.accessLevel`, `ConversationShare.accessLevel`
- **Utilité métier** : Niveau d'habilitation accordé lors du partage transversal d'un dossier entre téléconseillers (consultation passive vs participation active).
- **Pertinence UML** : **Utile (collaboration inter-services et escalade d'expertise).**

#### Énumération `AgentAvailability`
- **Valeurs exactes vérifiées** : `AVAILABLE, BUSY, AWAY, OFFLINE`
- **Utilisation dans le schéma** : `AgentProfile.availability`
- **Utilité métier** : Disponibilité opérationnelle en direct d'un agent pour le moteur d'attribution automatique des tickets et conversations.
- **Pertinence UML** : **Indispensable (routage intelligent de la charge de travail).**

#### Énumération `EstablishmentType`
- **Valeurs exactes vérifiées** : `HEADQUARTERS, BRANCH, STORE, POINT_OF_SALE, SERVICE_POINT, PICKUP_POINT, TECH_CENTER, OTHER`
- **Utilisation dans le schéma** : `Establishment.type`
- **Utilité métier** : Classification de la typologie des locaux et points de vente/SAV de l'entreprise sur le territoire.
- **Pertinence UML** : **Utile (maillage territorial et orientation physique des clients).**

#### Énumération `PlanType`
- **Valeurs exactes vérifiées** : `DECOUVERTE, STARTER, PRO, ENTREPRISE`
- **Utilisation dans le schéma** : `Subscription.plan`, `SubscriptionIntent.targetPlan`
- **Utilité métier** : Paliers tarifaires SaaS conditionnant les quotas (nombre d'agents, volume de tickets, intégrations).
- **Pertinence UML** : **Indispensable (modèle économique de la plateforme SaaS).**

#### Énumération `SubscriptionStatus`
- **Valeurs exactes vérifiées** : `ACTIVE, RENEWAL_DUE, GRACE_PERIOD, EXPIRED, CANCELLED`
- **Utilisation dans le schéma** : `Subscription.status`
- **Utilité métier** : Cycle de vie commercial de l'abonnement d'un Workspace (gestion des périodes de grâce et blocage).
- **Pertinence UML** : **Indispensable (gouvernance des droits d'accès à l'application).**

#### Énumération `IntentType`
- **Valeurs exactes vérifiées** : `INITIAL_PURCHASE, RENEWAL, UPGRADE, DOWNGRADE`
- **Utilisation dans le schéma** : `SubscriptionIntent.intentType`
- **Utilité métier** : Nature de l'action commerciale initiée par l'administrateur de l'entreprise.
- **Pertinence UML** : **Utile (traçabilité des mouvements d'abonnements et calcul du prorata).**

#### Énumération `IntentStatus`
- **Valeurs exactes vérifiées** : `PENDING, COMPLETED, ABANDONED, EXPIRED`
- **Utilisation dans le schéma** : `SubscriptionIntent.status`
- **Utilité métier** : État de progression de la demande de paiement avant validation financière.
- **Pertinence UML** : **Utile (gestion des tunnels d'achat et des expirations de session).**

### 3.2 Énumérations Complémentaires du Domaine de Paiement (SasPay)

Deux énumérations supplémentaires sont directement rattachées aux entités d'exécution financière `PaymentAttempt` et `PaymentTransaction` :

#### Énumération `AttemptStatus`
- **Valeurs exactes vérifiées** : `INITIATED, CHECKOUT_CREATED, PAYMENT_PENDING, RESULT_UNKNOWN, RECONCILIATION_REQUIRED, PAYMENT_CONFIRMED, CONFIRMED_FAILURE, SESSION_EXPIRED`
- **Utilisation dans le schéma** : `PaymentAttempt.status`
- **Utilité métier** : Suivi pas-à-pas de l'interaction avec la passerelle SasPay (redirection, retour webhook, confirmation Mobile Money).

#### Énumération `TransactionApplicationStatus`
- **Valeurs exactes vérifiées** : `APPLIED_TO_SUBSCRIPTION, DUPLICATE_PAYMENT_RECORDED, MANUAL_ADJUSTMENT, REFUNDED`
- **Utilisation dans le schéma** : `PaymentTransaction.status`
- **Utilité métier** : Attestation de l'imputation comptable réelle d'un paiement sur l'abonnement du Workspace.

### 3.3 Énumérations Techniques Exclues du Diagramme Métier (5 types)

Les 5 énumérations suivantes appartiennent à des tables techniques secondaires ou éphémères exclues du modèle métier principal :

1. `DowngradeRequestStatus` (`DRAFT`, `READY`, `BLOCKED`, `SCHEDULED`, `APPLIED`, `CANCELLED`, `OBSOLETE_CANCELLED`) : Gestion du workflow différé de rétrogradation d'abonnement (`CommercialDowngradeRequest`).
2. `OtpPurpose` (`REGISTRATION`, `LOGIN`, `EMAIL_VERIFICATION`, `PASSWORD_RESET`) : Jetons de sécurité temporaires d'authentification (`OtpToken`).
3. `OutboxStatus` (`PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED`) : Pattern Transactional Outbox pour la synchronisation asynchrone d'événements (`OutboxEvent`).
4. `ReceiptValidationStatus` (`VALID`, `INVALID_AMOUNT`, `INVALID_CURRENCY`, `INVALID_PAID_AT`, `MALFORMED_DATA`) : Contrôles cryptographiques des reçus bruts SasPay (`ProviderPaymentReceipt`).
5. `ReceiptReconciliationStatus` (`PENDING_MATCHING`, `MATCHED_AND_APPLIED`, `DUPLICATE_PAYMENT`, `AMOUNT_MISMATCH`, etc.) : Audit financier avancé des divergences de caisse.


---

## 4. TABLEAU EXHAUSTIF DES ASSOCIATIONS ET CARDINALITÉS

Ce tableau répertorie l'intégralité des relations fonctionnelles et conceptuelles unissant les 19 classes métier de Zalisk, avec leurs cardinalités exactes vérifiées au niveau des clés étrangères PostgreSQL et des déclarations Prisma.

| Classe A | Relation (Sémantique) | Classe B | Cardinalité côté A | Cardinalité côté B | Source vérifiée |
|---|---|---|:---:|:---:|---|
| `Workspace` | Agrège les adhésions | `Membership` | `1` | `0..*` | FK `memberships.workspaceId` -> `workspaces.id` (CASCADE) |
| `User` | Détient des adhésions | `Membership` | `1` | `0..*` | FK `memberships.userId` -> `users.id` (CASCADE) |
| `Workspace` | Émet des invitations | `WorkspaceInvitation` | `1` | `0..*` | FK `workspace_invitations.workspaceId` -> `workspaces.id` (CASCADE) |
| `User` | Auteur d'invitations | `WorkspaceInvitation` | `1` | `0..*` | FK `workspace_invitations.invitedById` -> `users.id` (CASCADE) |
| `Workspace` | Déploie des profils | `AgentProfile` | `1` | `0..*` | FK `agent_profiles.workspaceId` -> `workspaces.id` (CASCADE) |
| `User` | Possède un profil agent | `AgentProfile` | `1` | `0..1 (*)` | FK `agent_profiles.userId` -> `users.id` + UQ `[workspaceId, userId]` |
| `Workspace` | Définit le catalogue | `Skill` | `1` | `0..*` | FK `skills.workspaceId` -> `workspaces.id` (CASCADE) |
| `AgentProfile` | Est certifié sur | `AgentSkill` | `1` | `0..*` | FK `agent_skills.agentProfileId` -> `agent_profiles.id` (CASCADE) |
| `Skill` | Est attribuée via | `AgentSkill` | `1` | `0..*` | FK `agent_skills.skillId` -> `skills.id` (CASCADE) |
| `Workspace` | Impose des établissements | `Establishment` | `1` | `0..*` | FK `establishments.workspaceId` -> `workspaces.id` (CASCADE) |
| `Workspace` | Centralise les conversations | `Conversation` | `1` | `0..*` | FK `conversations.workspaceId` -> `workspaces.id` (CASCADE) |
| `User` | Conseiller assigné à conv. | `Conversation` | `0..1` | `0..*` | FK `conversations.assignedAgentId` -> `users.id` (SET NULL) |
| `Conversation` | Contient des messages | `ConversationMessage` | `1` | `1..*` | FK `conversation_messages.conversationId` -> `conversations.id` (CASCADE) |
| `User` | Rédacteur du message | `ConversationMessage` | `0..1` | `0..*` | FK `conversation_messages.senderId` -> `users.id` (SET NULL) |
| `Conversation` | Partagée via | `ConversationShare` | `1` | `0..*` | FK `conversation_shares.conversationId` -> `conversations.id` (CASCADE) |
| `User` | Bénéficiaire du partage conv. | `ConversationShare` | `1` | `0..*` | FK `conversation_shares.agentId` -> `users.id` (CASCADE) |
| `User` | Initiateur du partage conv. | `ConversationShare` | `1` | `0..*` | FK `conversation_shares.sharedById` -> `users.id` (CASCADE) |
| `Workspace` | Gère les dossiers SAV | `Ticket` | `1` | `0..*` | FK `tickets.workspaceId` -> `workspaces.id` (CASCADE) |
| `User` | Conseiller affecté au ticket | `Ticket` | `0..1` | `0..*` | FK `tickets.assignedAgentId` -> `users.id` (SET NULL) |
| `User` | Créateur interne du ticket | `Ticket` | `0..1` | `0..*` | FK `tickets.createdById` -> `users.id` (SET NULL) |
| `Conversation` | Élévation en dossier SAV | `Ticket` | `0..1` | `0..* (**)` | FK `tickets.conversationId` -> `conversations.id` (SET NULL) |
| `Ticket` | Historique d'affectations | `TicketAssignment` | `1` | `0..*` | FK `ticket_assignments.ticketId` -> `tickets.id` (CASCADE) |
| `User` | Ancien conseiller assigné | `TicketAssignment` | `0..1` | `0..*` | FK `ticket_assignments.previousAgentId` -> `users.id` (SET NULL) |
| `User` | Nouveau conseiller assigné | `TicketAssignment` | `0..1` | `0..*` | FK `ticket_assignments.newAgentId` -> `users.id` (SET NULL) |
| `User` | Superviseur ayant réaffecté | `TicketAssignment` | `0..1` | `0..*` | FK `ticket_assignments.assignedById` -> `users.id` (SET NULL) |
| `Ticket` | Partagé collaborativement | `TicketShare` | `1` | `0..*` | FK `ticket_shares.ticketId` -> `tickets.id` (CASCADE) |
| `User` | Bénéficiaire du partage ticket | `TicketShare` | `1` | `0..*` | FK `ticket_shares.agentId` -> `users.id` (CASCADE) |
| `User` | Auteur du partage ticket | `TicketShare` | `1` | `0..*` | FK `ticket_shares.sharedById` -> `users.id` (CASCADE) |
| `Ticket` | Consigne les activités | `TicketActivity` | `1` | `0..*` | FK `ticket_activities.ticketId` -> `tickets.id` (CASCADE) |
| `User` | Auteur de l'activité/note | `TicketActivity` | `0..1` | `0..*` | FK `ticket_activities.authorId` -> `users.id` (SET NULL) |
| `Workspace` | Souscrit à un abonnement | `Subscription` | `1` | `0..1` | FK `subscriptions.workspaceId` -> `workspaces.id` + UQ `workspaceId` (RESTRICT) |
| `Subscription` | Engendre des intentions | `SubscriptionIntent` | `1` | `0..*` | FK `subscription_intents.subscriptionId` -> `subscriptions.id` (RESTRICT) |
| `Workspace` | Contexte entreprise facturé | `SubscriptionIntent` | `1` | `0..*` | FK `subscription_intents.workspaceId` -> `workspaces.id` (RESTRICT) |
| `User` | Commanditaire du paiement | `SubscriptionIntent` | `1` | `0..*` | FK `subscription_intents.userId` -> `users.id` (RESTRICT) |
| `SubscriptionIntent` | Déclenche des tentatives | `PaymentAttempt` | `1` | `0..*` | FK `payment_attempts.intentId` -> `subscription_intents.id` (RESTRICT) |
| `Workspace` | Contexte entreprise tentative | `PaymentAttempt` | `1` | `0..*` | FK `payment_attempts.workspaceId` -> `workspaces.id` (RESTRICT) |
| `Subscription` | Reçoit des transactions | `PaymentTransaction` | `1` | `0..*` | FK `payment_transactions.subscriptionId` -> `subscriptions.id` (RESTRICT) |
| `SubscriptionIntent` | Validée par transaction | `PaymentTransaction` | `1` | `0..*` | FK `payment_transactions.intentId` -> `subscription_intents.id` (RESTRICT) |
| `PaymentAttempt` | Aboutit à une transaction | `PaymentTransaction` | `0..1` | `0..*` | FK `payment_transactions.attemptId` -> `payment_attempts.id` (SET NULL) |
| `Workspace` | Bénéficiaire de transaction | `PaymentTransaction` | `1` | `0..*` | FK `payment_transactions.workspaceId` -> `workspaces.id` (RESTRICT) |

*(\*) Note sur `User` $\to$ `AgentProfile` : Au niveau global de la plateforme, un utilisateur peut disposer de plusieurs profils agents s'il intervient dans plusieurs entreprises clientes distinctes. En revanche, au sein d'un Workspace spécifique, la contrainte d'unicité composite `@@unique([workspaceId, userId])` impose une cardinalité stricte de `0..1`.*

*(\*\*) Note sur `Conversation` $\to$ `Ticket` : Voir l'analyse détaillée en section 6 concernant la différence entre la cardinalité physique SGBD (`0..*`) et la cardinalité fonctionnelle métier d'élévation unique (`0..1`).*


---

## 5. ANALYSE APPROFONDIE DES RELATIONS MULTI-TENANT ET DE GESTION DES UTILISATEURS

### 5.1 Découplage Fondamental entre Utilisateurs et Espaces Entreprises (Workspaces)
L'architecture logicielle de Zalisk repose sur une isolation multi-tenant logique stricte. L'examen des schémas physique et logique révèle un choix de conception capital :
- Il n'existe **aucune clé étrangère directe** de possession entre `User` et `Workspace` (aucun champ `User.workspaceId` ni `Workspace.ownerId`).
- Un `User` représente une personne physique unique dotée d'une identité globale (adresse email unique certifiée via `emailVerified`).
- L'appartenance d'un collaborateur à un espace de travail est **intégralement médiée par l'entité associative `Membership`**.

### 5.2 Rôle Pivot de la Classe d'Association `Membership`
La classe `Membership` matérialise l'adhésion contractuelle d'un utilisateur au sein d'une organisation :
1. **Intégrité référentielle** : Possède deux clés étrangères obligatoires (`userId` et `workspaceId`), toutes deux configurées avec `ON DELETE CASCADE`.
2. **Unicité stricte d'adhésion** : La contrainte PostgreSQL composite `@@unique([userId, workspaceId])` garantit qu'un utilisateur ne peut être membre qu'une seule et unique fois d'un même espace de travail.
3. **Contrôle d'accès RBAC** : Porte l'attribut `role` typé par l'énumération `Role` (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`).
4. **Cycle de vie administratif** : Porte l'attribut `status: MembershipStatus` (`ACTIVE`, `SUSPENDED`, `ARCHIVED`) ainsi que `suspendedAt` et `suspendedReason`. Cela permet au propriétaire d'une entreprise de bloquer instantanément les droits d'un collaborateur sans supprimer son compte ni perdre la traçabilité de ses actions antérieures.

### 5.3 Mécanisme d'Invitation Asynchrone (`WorkspaceInvitation`)
Le recrutement et l'intégration de nouveaux collaborateurs s'opèrent via la classe `WorkspaceInvitation` :
- Un collaborateur potentiel est invité par son adresse courriel (`email: String`) sans nécessiter qu'il possède déjà un compte utilisateur lors de l'envoi de l'invitation.
- L'invitation est rattachée au `Workspace` émetteur (`workspaceId`) et à l'utilisateur qui en est l'auteur (`invitedById: User`).
- Un jeton cryptographique unique (`token: String @unique`) sécurise l'acceptation via lien web avec expiration temporelle (`expiresAt`).
- À l'acceptation (`acceptedAt`), une ligne `Membership` est automatiquement instanciée avec le rôle prédéfini (`role`).

### 5.4 Profils Métier d'Agents (`AgentProfile`)
L'extension du compte utilisateur en conseiller de support technique ne s'effectue pas par héritage objet, mais par **composition associative** :
- Un compte `User` n'a accès aux fonctionnalités de prise en charge SAV que s'il dispose d'un enregistrement `AgentProfile`.
- La table `agent_profiles` référence `workspaceId` et `userId`.
- La contrainte d'unicité composite `@@unique([workspaceId, userId])` garantit qu'un agent ne possède qu'un seul profil opérationnel par entreprise.
- L'entité stocke les métadonnées de régulation opérationnelle : `availability` (`AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE`), `maxCapacity` (nombre maximal de tickets simultanés, valeur par défaut 10) et `autoAssignmentEnabled`.


---

## 6. ANALYSE APPROFONDIE DES CONVERSATIONS ET DES TICKETS SAV

### 6.1 Découplage entre Flux Omnicanal Temps Réel et Dossier SAV Contractuel
Zalisk établit une séparation architecturale nette entre :
1. **La Conversation (`Conversation`)** : Canal d'interaction instantané, fluide et temps réel (messagerie web, portail client, WhatsApp).
2. **Le Ticket SAV (`Ticket`)** : Dossier juridique et contractuel de réclamation formelle, doté d'une référence d'audit, de priorités formalisées et d'engagements de service (SLA).

### 6.2 Analyse Critique du Lien entre `Conversation` et `Ticket`
Un examen approfondi de la déclaration réelle dans `backend/prisma/schema.prisma` et de la table physique `tickets` dans PostgreSQL apporte un éclairage indispensable :
- **Déclaration réelle dans `Ticket`** :
  ```prisma
  conversationId  String?
  conversation    Conversation?  @relation(fields: [conversationId], references: [id], onDelete: SetNull)
  ```
- **Déclaration réelle dans `Conversation`** :
  ```prisma
  tickets         Ticket[]
  ```
- **Contraintes en base de données** :
  - La colonne `tickets.conversationId` est une clé étrangère **nullable** pointant vers `conversations.id`.
  - La clause de suppression est `ON DELETE SET NULL`.
  - **Il n'y a pas de contrainte `@unique` sur `conversationId` dans la table `tickets`**.

#### Conséquences Techniques et Justification de la Modélisation UML :
1. **Au niveau physique relationnel (SGBD)** : La relation est techniquement une association **1-à-Plusieurs optionnelle** (`Conversation` $1 	o 0..*$ `Ticket`). Cela permet physiquement à un téléconseiller de créer plusieurs tickets distincts (par exemple, une réclamation technique ET un incident de facturation) à partir d'un même fil de discussion prolongé.
2. **Au niveau conceptuel et métier (Élévation)** : L'action métier d'« Élévation » formalise une conversion directe : une conversation donne naissance à un ticket officiel SAV. Dans la grande majorité des parcours clients, l'association est fonctionnellement perçue comme un lien **1-à-1 optionnel** ($0..1 \leftrightarrow 0..1$) : un ticket provient au maximum d'une conversation (`0..1`), et une conversation donne naissance à un ticket lorsqu'elle nécessite une escalade formelle.
3. **Recommandation pour le mémoire académique** : Il convient d'exposer clairement cette dualité : le SGBD offre la flexibilité structurelle `0..*` sans blocage d'unicité, tandis que la règle métier de gestion implémente le pattern d'élévation unitaire.

### 6.3 Gestion des Auteurs de Messages (`ConversationMessage`)
La classe `ConversationMessage` possède l'attribut `senderId String?` lié à `User?` via `ON DELETE SET NULL` :
- Pourquoi cet attribut est-il **facultatif (nullable)** ?
  - Si le message est rédigé par un agent du support, `senderType` vaut `AGENT_REPLY` ou `INTERNAL_NOTE`, et `senderId` pointe vers l'agent connecté (`User.id`).
  - Si le message émane d'un client externe sur le portail public ou via chat anonyme, `senderType` vaut `CUSTOMER`, le client n'a pas nécessairement de compte utilisateur `User` dans la base : son identité est alors stockée dans `senderName`, et `senderId` reste `NULL`.
  - Si le message est généré automatiquement par la plateforme, `senderType` vaut `SYSTEM`, et `senderId` est également `NULL`.
- Le champ booléen `isInternalNote: Boolean @default(false)` permet aux téléconseillers de consigner des mémos d'équipe invisibles sur l'interface du client.

### 6.4 Collaboration et Traçabilité SAV
Pour répondre aux exigences des centres de relation client modernes, le cycle de vie du ticket est instrumenté par trois classes satellites :
- `TicketAssignment` : Enregistre chaque réattribution avec le téléconseiller précédent (`previousAgentId`), le nouveau titulaire (`newAgentId`), le gestionnaire décisionnaire (`assignedById`) et le motif (`reason`).
- `TicketShare` / `ConversationShare` : Permet à un conseiller de partager un dossier avec un collègue selon deux niveaux d'accès (`accessLevel: ShareAccessLevel`) : consultation seule (`READ_ONLY`) ou droit d'adjonction de notes (`CONTRIBUTE`). La contrainte composite `@@unique([ticketId, agentId])` interdit les doublons de partage.
- `TicketActivity` : Journal d'audit chronologique non modifiable consignant chaque transition d'état, ajustement de priorité ou jalon de résolution.


---

## 7. ANALYSE APPROFONDIE DES COMPÉTENCES ET DES ÉTABLISSEMENTS

### 7.1 Modélisation de la Relation Plusieurs-à-Plusieurs (N-M) entre Agents et Compétences
Le modèle de Zalisk permet d'affecter des compétences spécialisées (ex. *Support Réseau*, *Facturation SasPay*, *Matériel Garanti*) aux téléconseillers afin d'assurer un routage intelligent des requêtes.
- La classe `Skill` représente une compétence répertoriée par une entreprise (`workspaceId`).
- La classe `AgentProfile` représente le profil de l'agent opérant pour cette entreprise.
- La relation N-M n'est pas implicite : elle est explicitement matérialisée par la classe d'association **`AgentSkill`**.
- La contrainte d'unicité composite `@@unique([agentProfileId, skillId])` empêche d'attribuer deux fois la même compétence au même agent.

### 7.2 Analyse Technique Particulière du Champ `validatedById`
Le champ `AgentSkill.validatedById` présente une caractéristique essentielle révélée par l'audit :
- **Dans Prisma** : `validatedById String?` est déclaré comme un scalaire optionnel, sans directive `@relation`.
- **Dans PostgreSQL** : La colonne `agent_skills.validatedById` est de type `text`, nullable, et **ne possède aucune contrainte physique de clé étrangère (`fkey`)** dans le catalogue système `information_schema.table_constraints`.
- **Sémantique métier** : Ce champ conserve l'identifiant de l'administrateur ou du superviseur qui a audité et validé la compétence de l'agent. Bien qu'il s'agisse logiquement d'une référence à `User.id`, le SGBD ne valide pas cette intégrité au niveau relationnel physique, ce qui évite de bloquer les suppressions de profils d'anciens managers.

### 7.3 Maillage Territorial via `Establishment`
Pour les entreprises clientes disposant d'agences physiques, de boutiques ou de centres d'intervention technique, la classe `Establishment` modélise ces points de contact :
- Chaque établissement est rattaché à son entreprise (`workspaceId`).
- Typé par `type: EstablishmentType` (8 valeurs possibles : siège social `HEADQUARTERS`, succursale `BRANCH`, magasin `STORE`, point de vente `POINT_OF_SALE`, centre de service `SERVICE_POINT`, point relais `PICKUP_POINT`, centre technique `TECH_CENTER`, ou autre `OTHER`).
- Porte des attributs de localisation (`address`, `city`, `country`), de contact direct (`phone`, `email`, `whatsapp`), des horaires d'ouverture (`openingHours`, `businessHours`) et un indicateur de siège principal (`isMain: Boolean`).


---

## 8. ANALYSE APPROFONDIE DES ABONNEMENTS ET DES PAIEMENTS (SASPAY)

### 8.1 Architecture du Modèle de Facturation à États
Le module de facturation de Zalisk s'appuie sur la passerelle de paiement SasPay (Mobile Money et cartes bancaires en zone CEMAC/UEMAC). Pour garantir la robustesse comptable et prévenir la fraude ou les doubles paiements, le processus est découpé en quatre classes interconnectées selon un pipeline rigoureux :

```
[ Workspace ] 1 <--- (1..1 unique) ---> 0..1 [ Subscription ]
                                                | 1
                                                | 0..*
                                       [ SubscriptionIntent ]
                                                | 1
                                                | 0..*
                                         [ PaymentAttempt ]
                                                | 0..1
                                                | 0..*
                                      [ PaymentTransaction ]
```

### 8.2 Analyse Détaillée des Entités Financières
1. **`Subscription` (Abonnement)** :
   - Représente le contrat en cours pour l'entreprise (`workspaceId: String @unique`).
   - La relation `Workspace` $\leftrightarrow$ `Subscription` est un **1-à-1 strict côté Subscription** : un espace ne peut avoir qu'un seul enregistrement d'abonnement actif dans cette table.
   - Définit le forfait (`plan: PlanType`), le statut (`status: SubscriptionStatus`), le montant actif en Francs CFA (`activePriceXaf: Int`), et les échéances temporelles (`currentPeriodStart`, `currentPeriodEnd`, `gracePeriodEnd`).
   - Comporte un champ `version: Int @default(1)` pour le verrouillage optimiste lors des mises à niveau concurrentes.

2. **`SubscriptionIntent` (Intention d'Achat)** :
   - Créée dès qu'un utilisateur clique sur « Souscrire » ou « Changer de formule ».
   - Référence obligatoirement l'abonnement (`subscriptionId`), l'entreprise (`workspaceId`) et l'utilisateur commanditaire (`userId`).
   - Clé d'idempotence client : `clientMutationKey: String @unique` garantit qu'un double clic ne génère pas deux intentions identiques.
   - Type de mouvement : `intentType: IntentType` (`INITIAL_PURCHASE`, `RENEWAL`, `UPGRADE`, `DOWNGRADE`).

3. **`PaymentAttempt` (Tentative de Paiement)** :
   - Orchestre chaque essai de règlement via SasPay rattaché à une intention (`intentId`).
   - Cardinalité : Une intention peut engendrer **plusieurs tentatives** (`SubscriptionIntent` $1 	o 0..*$ `PaymentAttempt`), par exemple si l'utilisateur annule une première session Mobile Money ou si le délai expire.
   - Numérotation séquentielle des essais : La contrainte composite `@@unique([intentId, attemptNumber])` empêche les collisions de séquence d'essai.
   - Clé locale unique d'essai : `localAttemptKey: String @unique` assure l'unicité de chaque transaction initiée.
   - Suivi d'état fin : `status: AttemptStatus` (`INITIATED`, `CHECKOUT_CREATED`, `PAYMENT_PENDING`, etc.).

4. **`PaymentTransaction` (Transaction Comptable Validée)** :
   - Enregistrement immuable actant la réception confirmée des fonds par webhook ou notification SasPay.
   - Porte le reçu fournisseur unique : `receiptId: String @unique`.
   - Référence l'abonnement crédité (`subscriptionId`), l'intention satisfaite (`intentId`), et de manière optionnelle la tentative d'origine (`attemptId: String?`).
   - Montant certifié : `amountXaf: Int` et `currency: String @default("XAF")`.
   - Imputation comptable : `status: TransactionApplicationStatus` (`APPLIED_TO_SUBSCRIPTION`).

5. **Règles de suppression (`onDelete: Restrict`)** :
   - Toutes les clés étrangères liant `Subscription`, `SubscriptionIntent`, `PaymentAttempt` et `PaymentTransaction` sont configurées avec **`ON DELETE RESTRICT`**.
   - Justification légale et financière : Il est strictement impossible de supprimer un abonnement ou un espace entreprise tant que des écritures financières ou des intentions de paiement y sont rattachées, assurant une piste d'audit inaltérable.


---

## 9. SÉLECTION DES ATTRIBUTS DESTINÉS AU FUTUR DIAGRAMME UML

Pour éviter la surcharge visuelle du diagramme UML tout en préservant son exactitude académique, les 231 attributs scalaires audités sont classés en trois niveaux d'intérêt. La colonne **Retenu UML** indique les attributs préconisés pour l'affichage dans les compartiments de classes.

| Classe | Attributs Indispensables (Affichés) | Attributs Utiles (Affichés) | Attributs Secondaires (Omis du visuel) |
|---|---|---|---|
| **`User`** | + id: String [PK]<br/>+ email: String [UQ]<br/>+ firstName: String<br/>+ lastName: String | + emailVerified: Boolean<br/>+ avatarUrl: String | googleId, passwordHash, createdAt, updatedAt |
| **`Workspace`** | + id: String [PK]<br/>+ name: String<br/>+ slug: String [UQ] | + isPublic: Boolean<br/>+ hasExistingSav: Boolean<br/>+ timezone: String<br/>+ supportEmail: String<br/>+ supportPhone: String | normalizedName, description, category, logoUrl, coverUrl, verified, website, supportWhatsApp, address, city, country, openingHours, supportCategories, brandColor, brandPalette, cannedResponses, businessHours, createdAt, updatedAt |
| **`Membership`** | + id: String [PK]<br/>+ userId: String [FK]<br/>+ workspaceId: String [FK]<br/>+ role: Role<br/>+ status: MembershipStatus | + suspendedAt: DateTime | suspendedReason, createdAt, updatedAt |
| **`WorkspaceInvitation`** | + id: String [PK]<br/>+ email: String<br/>+ workspaceId: String [FK]<br/>+ role: Role<br/>+ token: String [UQ] | + expiresAt: DateTime<br/>+ acceptedAt: DateTime | invitedById, revokedAt, dispatchStatus, dispatchLockedBy, dispatchStartedAt, dispatchAttempts, nextRetryAt, dispatchError, createdAt |
| **`Conversation`** | + id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ status: ConversationStatus<br/>+ priority: TicketPriority | + customerName: String<br/>+ customerEmail: String<br/>+ channel: String<br/>+ lastMessageAt: DateTime | assignedAgentId, customerPhone, category, publicTokenHash, createdAt, updatedAt |
| **`ConversationMessage`** | + id: String [PK]<br/>+ conversationId: String [FK]<br/>+ senderId: String [FK]<br/>+ senderType: MessageType<br/>+ content: String | + senderName: String<br/>+ isInternalNote: Boolean<br/>+ createdAt: DateTime | — |
| **`Ticket`** | + id: String [PK]<br/>+ reference: String [UQ]<br/>+ workspaceId: String [FK]<br/>+ conversationId: String [FK]<br/>+ assignedAgentId: String [FK]<br/>+ title: String<br/>+ priority: TicketPriority<br/>+ status: TicketStatus | + description: String<br/>+ customerName: String<br/>+ slaDueAt: DateTime<br/>+ resolvedAt: DateTime<br/>+ closedAt: DateTime | createdById, category, customerPhone, customerEmail, metadata, createdAt, updatedAt |
| **`TicketAssignment`** | + id: String [PK]<br/>+ ticketId: String [FK]<br/>+ previousAgentId: String [FK]<br/>+ newAgentId: String [FK]<br/>+ assignedById: String [FK] | + reason: String<br/>+ createdAt: DateTime | — |
| **`TicketShare`** | + id: String [PK]<br/>+ ticketId: String [FK]<br/>+ agentId: String [FK]<br/>+ sharedById: String [FK]<br/>+ accessLevel: ShareAccessLevel | + expiresAt: DateTime<br/>+ createdAt: DateTime | — |
| **`ConversationShare`** | + id: String [PK]<br/>+ conversationId: String [FK]<br/>+ agentId: String [FK]<br/>+ sharedById: String [FK]<br/>+ accessLevel: ShareAccessLevel | + createdAt: DateTime | — |
| **`TicketActivity`** | + id: String [PK]<br/>+ ticketId: String [FK]<br/>+ authorId: String [FK]<br/>+ type: String<br/>+ content: String | + createdAt: DateTime | — |
| **`AgentProfile`** | + id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ userId: String [FK]<br/>+ availability: AgentAvailability | + maxCapacity: Int<br/>+ autoAssignmentEnabled: Boolean<br/>+ title: String<br/>+ phone: String | notificationEmail, notificationApp, createdAt, updatedAt |
| **`Skill`** | + id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ name: String | + description: String | createdAt, updatedAt |
| **`AgentSkill`** | + id: String [PK]<br/>+ agentProfileId: String [FK]<br/>+ skillId: String [FK] | + validatedById: String<br/>+ validatedAt: DateTime<br/>+ createdAt: DateTime | — |
| **`Establishment`** | + id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ name: String<br/>+ type: EstablishmentType<br/>+ isMain: Boolean<br/>+ isActive: Boolean | + address: String<br/>+ city: String<br/>+ country: String | description, isPublic, addressDetails, phone, email, whatsapp, openingHours, businessHours, imageUrl, galleryImages, services, practicalInfo, createdAt, updatedAt |
| **`Subscription`** | + id: String [PK]<br/>+ workspaceId: String [FK, UQ]<br/>+ plan: PlanType<br/>+ status: SubscriptionStatus<br/>+ activePriceXaf: Int | + currentPeriodStart: DateTime<br/>+ currentPeriodEnd: DateTime<br/>+ gracePeriodEnd: DateTime<br/>+ version: Int | billingAnchorDay, lastNoticeSentAt, noticeCount, createdAt, updatedAt |
| **`SubscriptionIntent`** | + id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ subscriptionId: String [FK]<br/>+ userId: String [FK]<br/>+ intentType: IntentType<br/>+ targetPlan: PlanType<br/>+ priceXaf: Int<br/>+ status: IntentStatus | + clientMutationKey: String [UQ]<br/>+ currency: String | expectedSubscriptionVersion, createdAt, updatedAt |
| **`PaymentAttempt`** | + id: String [PK]<br/>+ intentId: String [FK]<br/>+ workspaceId: String [FK]<br/>+ attemptNumber: Int<br/>+ status: AttemptStatus | + provider: String<br/>+ localAttemptKey: String [UQ]<br/>+ expiresAt: DateTime | providerSessionId, checkoutUrl, failureReason, createdAt, updatedAt |
| **`PaymentTransaction`** | + id: String [PK]<br/>+ receiptId: String [UQ]<br/>+ workspaceId: String [FK]<br/>+ subscriptionId: String [FK]<br/>+ intentId: String [FK]<br/>+ amountXaf: Int<br/>+ status: TransactionApplicationStatus | + currency: String<br/>+ provider: String<br/>+ paidAt: DateTime | attemptId, providerTransactionId, paymentMethod, operatorReference, createdAt |

---

## 10. CLASSES EXCLUES DU MODÈLE MÉTIER PRINCIPAL ET JUSTIFICATION

### 10.1 Modèles Relationnels Techniques Exclus du Diagramme de Classes (15 modèles)
Sur les 34 modèles Prisma déclarés, 15 ont été intentionnellement écartés du diagramme de classes métier pour respecter les critères académiques de clarté et de pertinence conceptuelle :
1. `Session` : Gestion des sessions HTTP/tokens JWT d'authentification utilisateur (donnée purement volatile d'infrastructure web).
2. `OtpToken` : Jetons de sécurité à durée de vie très courte (5 minutes) pour la validation des connexions et réinitialisations de mot de passe.
3. `OutboxEvent` : Implémentation du pattern technique *Transactional Outbox* pour la diffusion asynchrone d'événements vers les workers et files RabbitMQ/Redis.
4. `_prisma_migrations` : Table interne gérée exclusivement par le CLI Prisma pour l'enregistrement des hachages de migrations SQL.
5. `AuditLog` : Journal transversal de traçabilité technique des actions HTTP/API.
6. `OnboardingDraft` : Brouillon temporaire de données de formulaire lors de l'inscription initiale d'une entreprise.
7. `WhatsAppConnection` : Métadonnées d'appairage technique d'une session QR Code WhatsApp Business.
8. `CommercialDowngradeRequest` : Table de gestion asynchrone des demandes différées de rétrogradation de formule tarifaire en fin de période de facturation.
9. `ProviderPaymentReceipt` : Enregistrement brut du payload JSON webhook transmis par SasPay.
10. `ProviderReceiptAuditLog` : Journal d'audit des contrôles de signature cryptographique des webhooks financiers.
11. `SubscriptionHistoryLog` : Table d'archivage chronologique des transitions d'états d'abonnement.
12. `ConsumedFinancialProof` : Table de vérification d'idempotence des preuves financières consommées.

### 10.2 Justification de l'Exclusion des Briques d'Infrastructure Externe
Le sujet de la modélisation concerne la **structure et l'organisation des données de la base relationnelle PostgreSQL de Zalisk**. Par conséquent, les technologies suivantes ne doivent sous aucun prétexte figurer comme classes d'entités dans ce diagramme :
- **MongoDB** : Base de données NoSQL orientée documents utilisée pour stocker des documents non structurés et des chunks vectoriels pour le RAG. Il s'agit d'un magasin documentaire distinct, non régi par le modèle relationnel PostgreSQL.
- **Redis** : Base de données en mémoire clé-valeur utilisée pour le cache de performance, le pub/sub WebSocket et la gestion des verrous distribués.
- **Cloudflare Workers AI** : Service externe d'inférence LLM interrogé via API REST/gRPC. Il constitue un composant d'architecture applicative ou un acteur externe, jamais une classe d'entité persistée dans le schéma de données relationnel.


---

## 11. INCERTITUDES OU DIVERGENCES RESTANTES

L'audit technique croisé entre les migrations SQL, le fichier `schema.prisma` et le dictionnaire de données PostgreSQL permet de formuler les conclusions suivantes :

1. **Parité Schéma / Base de Données (Drift = 0)** : Aucune divergence de structure n'a été détectée. Les 34 modèles Prisma correspondent exactement aux tables PostgreSQL (via `@@map`), les types de colonnes, nullabilités, index composites et contraintes d'unicité sont parfaitement synchronisés.
2. **Clarification sur le lien `Conversation` $\leftrightarrow$ `Ticket`** : L'ancien audit mentionnait un lien optionnel 1-à-1 basé sur `conversationId unique`. L'inspection détaillée du code et de la base démontre que `tickets.conversationId` **n'a pas de contrainte unique** dans PostgreSQL. La relation est physiquement un `0..1` vers `0..*`. Sur le plan métier, l'élévation d'une conversation produit fonctionnellement un unique ticket de suivi, ce qui explique l'interprétation 1-to-1 conceptuelle.
3. **Statut de `validatedById` dans `AgentSkill`** : L'audit confirme que `validatedById` ne possède pas de contrainte physique de clé étrangère dans PostgreSQL, bien qu'il contienne sémantiquement l'identifiant d'un utilisateur `User` valideur.
4. **Exactitude des Énumérations** : L'énumération `EstablishmentType` compte exactement 8 valeurs dans PostgreSQL (`pg_enum`), et non 6 comme dans certains brouillons précédents (les valeurs `POINT_OF_SALE` et `PICKUP_POINT` ont été réintégrées avec rigueur).

---

## 12. PROPOSITION FINALE DE STRUCTURE LOGIQUE DU DIAGRAMME DE CLASSES UML

Pour la conception finale du diagramme dans PlantUML et Draw.io, la disposition préconisée s'articule autour de **4 packages fonctionnels** organisés en grille 2x2 assurant une lisibilité optimale sur une page A4 paysage ou un écran haute définition :

```
+------------------------------------------+-------------------------------------------------+
| PACKAGE 1 : Multi-Tenant & Utilisateurs  | PACKAGE 2 : Conversations Omnicanales & SAV     |
| - Workspace                              | - Conversation, ConversationMessage             |
| - User                                   | - Ticket, TicketAssignment                      |
| - Membership (Classe d'association)      | - TicketShare, ConversationShare                |
| - WorkspaceInvitation                    | - TicketActivity                                |
| - Enums : Role, MembershipStatus         | - Enums : TicketStatus, TicketPriority,         |
|                                          |   ConversationStatus, MessageType, ShareLevel   |
+------------------------------------------+-------------------------------------------------+
| PACKAGE 3 : Organisation SAV & Agences   | PACKAGE 4 : Abonnements & Paiements (SasPay)    |
| - AgentProfile                           | - Subscription                                  |
| - Skill                                  | - SubscriptionIntent                            |
| - AgentSkill (Classe d'association N-M)  | - PaymentAttempt                                |
| - Establishment                          | - PaymentTransaction                            |
| - Enums : AgentAvailability,             | - Enums : PlanType, SubscriptionStatus,         |
|   EstablishmentType                      |   IntentType, IntentStatus, AttemptStatus,      |
|                                          |   TransactionApplicationStatus                  |
+------------------------------------------+-------------------------------------------------+
```

### Règles de Représentation Visuelle :
1. **Compositions UML (Losange plein noir)** : Utilisées pour marquer la dépendance forte de cycle de vie (`Workspace` vers `Membership`, `Establishment`, `Conversation`, `Ticket`, `Skill` ; `Conversation` vers `ConversationMessage` ; `Ticket` vers `TicketAssignment`, `TicketActivity`).
2. **Associations simples (Trait plein simple)** : Utilisées pour les références croisées et les rôles d'acteurs (`User` vers `Membership`, `User` vers `AgentProfile`, `User` vers `Ticket`).
3. **Cardinalités formelles** : Mentionnées aux extrémités de chaque connecteur (`1`, `0..1`, `0..*`, `1..*`).
4. **Stéréotypes UML** : Entités annotées `<<entity>>` et énumérations annotées `<<enum>>`.


---
*Fin du rapport technique d'extraction des classes et relations de Zalisk.*