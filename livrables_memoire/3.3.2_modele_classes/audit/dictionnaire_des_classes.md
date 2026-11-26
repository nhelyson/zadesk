# DICTIONNAIRE DES CLASSES ET DES DONNÉES MÉTIER
## Mémoire de Licence en Génie Informatique — Section 3.3.2.1
### Spécification détaillée des 19 classes métier retenues dans le diagramme de classes UML

---

## Classe : `Conversation`
- **Domaine Fonctionnel / Package :** Conversations & Tickets SAV
- **Table PostgreSQL mappée :** `conversations`
- **Description métier :** Fil de discussion omnicanal temps réel initié par un client (anonyme ou authentifié)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `Conversation` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Conversation` |
| `+` | `assignedAgentId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Conversation` |
| `+` | `customerName` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Conversation` |
| `+` | `customerPhone` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Conversation` |
| `+` | `customerEmail` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Conversation` |
| `+` | `category` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Conversation` |
| `+` | `channel` | `String` | `text / native` | NON | def: "PORTAL" | Attribut fonctionnel de `Conversation` |
| `+` | `status` | `ConversationStatus` | `text / native` | NON | def: ACTIVE | Attribut fonctionnel de `Conversation` |
| `+` | `priority` | `TicketPriority` | `text / native` | NON | def: MEDIUM | Attribut fonctionnel de `Conversation` |
| `+` | `publicTokenHash` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Conversation` |
| `+` | `lastMessageAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Conversation` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Conversation` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `Conversation` |

---

## Classe : `ConversationMessage`
- **Domaine Fonctionnel / Package :** Conversations & Tickets SAV
- **Table PostgreSQL mappée :** `conversation_messages`
- **Description métier :** Message unitaire d'un fil de conversation (client, agent, note interne, système)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `ConversationMessage` |
| `+` | `conversationId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `ConversationMessage` |
| `+` | `senderId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `ConversationMessage` |
| `+` | `senderType` | `MessageType` | `text / native` | NON | def: CUSTOMER | Attribut fonctionnel de `ConversationMessage` |
| `+` | `senderName` | `String` | `text / native` | NON | - | Attribut fonctionnel de `ConversationMessage` |
| `+` | `content` | `String` | `text / native` | NON | - | Attribut fonctionnel de `ConversationMessage` |
| `+` | `isInternalNote` | `Boolean` | `text / native` | NON | def: false | Attribut fonctionnel de `ConversationMessage` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `ConversationMessage` |

---

## Classe : `ConversationShare`
- **Domaine Fonctionnel / Package :** Conversations & Tickets SAV
- **Table PostgreSQL mappée :** `conversation_shares`
- **Description métier :** Partage collaboratif d'une conversation en cours avec un autre agent

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `ConversationShare` |
| `+` | `conversationId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `ConversationShare` |
| `+` | `agentId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `ConversationShare` |
| `+` | `sharedById` | `String` | `text / native` | NON | - | Attribut fonctionnel de `ConversationShare` |
| `+` | `accessLevel` | `ShareAccessLevel` | `text / native` | NON | def: READ_ONLY | Attribut fonctionnel de `ConversationShare` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `ConversationShare` |

---

## Classe : `Ticket`
- **Domaine Fonctionnel / Package :** Conversations & Tickets SAV
- **Table PostgreSQL mappée :** `tickets`
- **Description métier :** Ticket formel de support SAV avec suivi de cycle de vie, priorité et respect des SLA

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `Ticket` |
| `+` | `reference` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Ticket` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Ticket` |
| `+` | `assignedAgentId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `createdById` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `title` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Ticket` |
| `+` | `description` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Ticket` |
| `+` | `category` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `priority` | `TicketPriority` | `text / native` | NON | def: MEDIUM | Attribut fonctionnel de `Ticket` |
| `+` | `status` | `TicketStatus` | `text / native` | NON | def: OPEN | Attribut fonctionnel de `Ticket` |
| `+` | `customerName` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Ticket` |
| `+` | `customerPhone` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `customerEmail` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `slaDueAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `resolvedAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `closedAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `conversationId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `metadata` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Ticket` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Ticket` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `Ticket` |

---

## Classe : `TicketActivity`
- **Domaine Fonctionnel / Package :** Conversations & Tickets SAV
- **Table PostgreSQL mappée :** `ticket_activities`
- **Description métier :** Journal d'audit horodaté des événements et changements d'états d'un ticket

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `TicketActivity` |
| `+` | `ticketId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `TicketActivity` |
| `+` | `authorId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `TicketActivity` |
| `+` | `type` | `String` | `text / native` | NON | - | Attribut fonctionnel de `TicketActivity` |
| `+` | `content` | `String` | `text / native` | NON | - | Attribut fonctionnel de `TicketActivity` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `TicketActivity` |

---

## Classe : `TicketAssignment`
- **Domaine Fonctionnel / Package :** Conversations & Tickets SAV
- **Table PostgreSQL mappée :** `ticket_assignments`
- **Description métier :** Affectation opérationnelle et historique d'un ticket à un agent du service

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `TicketAssignment` |
| `+` | `ticketId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `TicketAssignment` |
| `+` | `previousAgentId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `TicketAssignment` |
| `+` | `newAgentId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `TicketAssignment` |
| `+` | `assignedById` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `TicketAssignment` |
| `+` | `reason` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `TicketAssignment` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `TicketAssignment` |

---

## Classe : `TicketShare`
- **Domaine Fonctionnel / Package :** Conversations & Tickets SAV
- **Table PostgreSQL mappée :** `ticket_shares`
- **Description métier :** Partage collaboratif d'un ticket entre agents pour entraide (lecture ou contribution)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `TicketShare` |
| `+` | `ticketId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `TicketShare` |
| `+` | `agentId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `TicketShare` |
| `+` | `sharedById` | `String` | `text / native` | NON | - | Attribut fonctionnel de `TicketShare` |
| `+` | `accessLevel` | `ShareAccessLevel` | `text / native` | NON | def: READ_ONLY | Attribut fonctionnel de `TicketShare` |
| `+` | `expiresAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `TicketShare` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `TicketShare` |

---

## Classe : `PaymentAttempt`
- **Domaine Fonctionnel / Package :** Gestion Commerciale & Abonnements
- **Table PostgreSQL mappée :** `payment_attempts`
- **Description métier :** Tentative d'exécution de paiement initiée auprès de la passerelle SasPay

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `intentId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `attemptNumber` | `Int` | `text / native` | NON | def: 1 | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `provider` | `String` | `text / native` | NON | def: "SASPAY" | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `providerSessionId` | `String` | `text / native` | OUI | UNIQUE | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `checkoutUrl` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `status` | `AttemptStatus` | `text / native` | NON | def: INITIATED | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `localAttemptKey` | `String` | `text / native` | NON | UNIQUE | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `expiresAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `failureReason` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `PaymentAttempt` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `PaymentAttempt` |

---

## Classe : `PaymentTransaction`
- **Domaine Fonctionnel / Package :** Gestion Commerciale & Abonnements
- **Table PostgreSQL mappée :** `payment_transactions`
- **Description métier :** Transaction financière confirmée et comptabilisée, appliquée à l'abonnement

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `receiptId` | `String` | `text / native` | NON | UNIQUE | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `subscriptionId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `intentId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `attemptId` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `provider` | `String` | `text / native` | NON | def: "SASPAY" | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `providerTransactionId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `amountXaf` | `Int` | `text / native` | NON | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `currency` | `String` | `text / native` | NON | def: "XAF" | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `paymentMethod` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `operatorReference` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `status` | `TransactionApplicationStatus` | `text / native` | NON | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `paidAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `PaymentTransaction` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `PaymentTransaction` |

---

## Classe : `Subscription`
- **Domaine Fonctionnel / Package :** Gestion Commerciale & Abonnements
- **Table PostgreSQL mappée :** `subscriptions`
- **Description métier :** Contrat d'abonnement SaaS de l'entreprise (plan, statut, quotas, échéances)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `Subscription` |
| `+` | `workspaceId` | `String` | `text / native` | NON | UNIQUE | Attribut fonctionnel de `Subscription` |
| `+` | `plan` | `PlanType` | `text / native` | NON | def: DECOUVERTE | Attribut fonctionnel de `Subscription` |
| `+` | `status` | `SubscriptionStatus` | `text / native` | NON | def: ACTIVE | Attribut fonctionnel de `Subscription` |
| `+` | `activePriceXaf` | `Int` | `text / native` | NON | def: 0 | Attribut fonctionnel de `Subscription` |
| `+` | `currentPeriodStart` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Subscription` |
| `+` | `currentPeriodEnd` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `Subscription` |
| `+` | `gracePeriodEnd` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `Subscription` |
| `+` | `billingAnchorDay` | `Int` | `text / native` | OUI | - | Attribut fonctionnel de `Subscription` |
| `+` | `version` | `Int` | `text / native` | NON | def: 1 | Attribut fonctionnel de `Subscription` |
| `+` | `lastNoticeSentAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `Subscription` |
| `+` | `noticeCount` | `Int` | `text / native` | NON | def: 0 | Attribut fonctionnel de `Subscription` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Subscription` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `Subscription` |

---

## Classe : `SubscriptionIntent`
- **Domaine Fonctionnel / Package :** Gestion Commerciale & Abonnements
- **Table PostgreSQL mappée :** `subscription_intents`
- **Description métier :** Intention formelle d'achat, renouvellement, surclassement ou rétrogradation

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `subscriptionId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `userId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `intentType` | `IntentType` | `text / native` | NON | def: INITIAL_PURCHASE | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `targetPlan` | `PlanType` | `text / native` | NON | - | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `priceXaf` | `Int` | `text / native` | NON | - | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `currency` | `String` | `text / native` | NON | def: "XAF" | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `status` | `IntentStatus` | `text / native` | NON | def: PENDING | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `clientMutationKey` | `String` | `text / native` | NON | UNIQUE | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `expectedSubscriptionVersion` | `Int` | `text / native` | NON | def: 1 | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `SubscriptionIntent` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `SubscriptionIntent` |

---

## Classe : `Membership`
- **Domaine Fonctionnel / Package :** Multi-Tenant & Utilisateurs
- **Table PostgreSQL mappée :** `memberships`
- **Description métier :** Association formelle d'un utilisateur à un espace de travail avec rôle (RBAC) et statut

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `Membership` |
| `+` | `userId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Membership` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Membership` |
| `+` | `role` | `Role` | `text / native` | NON | def: AGENT | Attribut fonctionnel de `Membership` |
| `+` | `status` | `MembershipStatus` | `text / native` | NON | def: ACTIVE | Attribut fonctionnel de `Membership` |
| `+` | `suspendedAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `Membership` |
| `+` | `suspendedReason` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Membership` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Membership` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Membership` |

---

## Classe : `User`
- **Domaine Fonctionnel / Package :** Multi-Tenant & Utilisateurs
- **Table PostgreSQL mappée :** `users`
- **Description métier :** Compte utilisateur (collaborateur interne de l'entreprise ou client enregistré)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `User` |
| `+` | `googleId` | `String` | `text / native` | OUI | UNIQUE | Attribut fonctionnel de `User` |
| `+` | `email` | `String` | `text / native` | NON | UNIQUE | Attribut fonctionnel de `User` |
| `+` | `firstName` | `String` | `text / native` | NON | - | Attribut fonctionnel de `User` |
| `+` | `lastName` | `String` | `text / native` | NON | - | Attribut fonctionnel de `User` |
| `+` | `avatarUrl` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `User` |
| `+` | `passwordHash` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `User` |
| `+` | `emailVerified` | `Boolean` | `text / native` | NON | def: false | Attribut fonctionnel de `User` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `User` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `User` |

---

## Classe : `Workspace`
- **Domaine Fonctionnel / Package :** Multi-Tenant & Utilisateurs
- **Table PostgreSQL mappée :** `workspaces`
- **Description métier :** Entreprise cliente / Espace SaaS racine isolant toutes les données métier (multi-tenant)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `Workspace` |
| `+` | `name` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Workspace` |
| `+` | `normalizedName` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `slug` | `String` | `text / native` | NON | UNIQUE | Attribut fonctionnel de `Workspace` |
| `+` | `hasExistingSav` | `Boolean` | `text / native` | NON | def: false | Attribut fonctionnel de `Workspace` |
| `+` | `description` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `category` | `String` | `text / native` | OUI | def: "Autre" | Attribut fonctionnel de `Workspace` |
| `+` | `logoUrl` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `coverUrl` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `verified` | `Boolean` | `text / native` | NON | def: true | Attribut fonctionnel de `Workspace` |
| `+` | `isPublic` | `Boolean` | `text / native` | NON | def: true | Attribut fonctionnel de `Workspace` |
| `+` | `website` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `supportPhone` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `supportEmail` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `supportWhatsApp` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `address` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `city` | `String` | `text / native` | OUI | def: "Brazzaville" | Attribut fonctionnel de `Workspace` |
| `+` | `country` | `String` | `text / native` | OUI | def: "Congo" | Attribut fonctionnel de `Workspace` |
| `+` | `openingHours` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `supportCategories` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `brandColor` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `brandPalette` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `cannedResponses` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `businessHours` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Workspace` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Workspace` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `Workspace` |

---

## Classe : `WorkspaceInvitation`
- **Domaine Fonctionnel / Package :** Multi-Tenant & Utilisateurs
- **Table PostgreSQL mappée :** `workspace_invitations`
- **Description métier :** Invitation d'un nouveau collaborateur à rejoindre un espace de travail

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `email` | `String` | `text / native` | NON | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `role` | `Role` | `text / native` | NON | def: AGENT | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `token` | `String` | `text / native` | NON | UNIQUE | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `invitedById` | `String` | `text / native` | NON | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `expiresAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `acceptedAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `revokedAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `dispatchStatus` | `String` | `text / native` | OUI | def: "PENDING" | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `dispatchLockedBy` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `dispatchStartedAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `dispatchAttempts` | `Int` | `text / native` | NON | def: 0 | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `nextRetryAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `dispatchError` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `WorkspaceInvitation` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `WorkspaceInvitation` |

---

## Classe : `AgentProfile`
- **Domaine Fonctionnel / Package :** Organisation SAV & Compétences
- **Table PostgreSQL mappée :** `agent_profiles`
- **Description métier :** Profil opérationnel d'un conseiller SAV (disponibilité, capacité max, charge actuelle)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `AgentProfile` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `AgentProfile` |
| `+` | `userId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `AgentProfile` |
| `+` | `availability` | `AgentAvailability` | `text / native` | NON | def: AVAILABLE | Attribut fonctionnel de `AgentProfile` |
| `+` | `maxCapacity` | `Int` | `text / native` | NON | def: 10 | Attribut fonctionnel de `AgentProfile` |
| `+` | `autoAssignmentEnabled` | `Boolean` | `text / native` | NON | def: true | Attribut fonctionnel de `AgentProfile` |
| `+` | `title` | `String` | `text / native` | OUI | def: "Agent SAV" | Attribut fonctionnel de `AgentProfile` |
| `+` | `phone` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `AgentProfile` |
| `+` | `notificationEmail` | `Boolean` | `text / native` | NON | def: true | Attribut fonctionnel de `AgentProfile` |
| `+` | `notificationApp` | `Boolean` | `text / native` | NON | def: true | Attribut fonctionnel de `AgentProfile` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `AgentProfile` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `AgentProfile` |

---

## Classe : `AgentSkill`
- **Domaine Fonctionnel / Package :** Organisation SAV & Compétences
- **Table PostgreSQL mappée :** `agent_skills`
- **Description métier :** Attribution d'une compétence certifiée à un agent avec niveau de maîtrise (1 à 5)

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `AgentSkill` |
| `+` | `agentProfileId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `AgentSkill` |
| `+` | `skillId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `AgentSkill` |
| `+` | `validatedById` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `AgentSkill` |
| `+` | `validatedAt` | `DateTime` | `text / native` | OUI | - | Attribut fonctionnel de `AgentSkill` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `AgentSkill` |

---

## Classe : `Establishment`
- **Domaine Fonctionnel / Package :** Organisation SAV & Compétences
- **Table PostgreSQL mappée :** `establishments`
- **Description métier :** Succursale, agence physique ou point de service rattaché à l'entreprise cliente

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `Establishment` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Establishment` |
| `+` | `name` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Establishment` |
| `+` | `type` | `EstablishmentType` | `text / native` | NON | def: BRANCH | Attribut fonctionnel de `Establishment` |
| `+` | `description` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `isMain` | `Boolean` | `text / native` | NON | def: false | Attribut fonctionnel de `Establishment` |
| `+` | `isPublic` | `Boolean` | `text / native` | NON | def: true | Attribut fonctionnel de `Establishment` |
| `+` | `isActive` | `Boolean` | `text / native` | NON | def: true | Attribut fonctionnel de `Establishment` |
| `+` | `address` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Establishment` |
| `+` | `city` | `String` | `text / native` | NON | def: "Brazzaville" | Attribut fonctionnel de `Establishment` |
| `+` | `country` | `String` | `text / native` | NON | def: "Congo" | Attribut fonctionnel de `Establishment` |
| `+` | `addressDetails` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `phone` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `email` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `whatsapp` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `openingHours` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `businessHours` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `imageUrl` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `galleryImages` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `services` | `Json` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `practicalInfo` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Establishment` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Establishment` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `Establishment` |

---

## Classe : `Skill`
- **Domaine Fonctionnel / Package :** Organisation SAV & Compétences
- **Table PostgreSQL mappée :** `skills`
- **Description métier :** Référentiel des compétences techniques, linguistiques et métiers du service SAV

| Visibilité | Attribut | Type UML | Type SQL Réel | Nullable | Contrainte / Défaut | Description Fonctionnelle |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| `+` | `id` | `String` | `text / native` | NON | PK, def: cuid( | Attribut fonctionnel de `Skill` |
| `+` | `workspaceId` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Skill` |
| `+` | `name` | `String` | `text / native` | NON | - | Attribut fonctionnel de `Skill` |
| `+` | `description` | `String` | `text / native` | OUI | - | Attribut fonctionnel de `Skill` |
| `+` | `createdAt` | `DateTime` | `text / native` | NON | def: now( | Attribut fonctionnel de `Skill` |
| `+` | `updatedAt` | `DateTime` | `text / native` | NON | - | Attribut fonctionnel de `Skill` |

---
