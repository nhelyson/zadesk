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
