# ANALYSE FORMELLE DES RELATIONS ET DES CARDINALITÉS
## Mémoire de Licence en Génie Informatique — Section 3.3.2.1
### Modélisation des 61 clés étrangères et traduction en cardinalités UML 2.5

---

## 1. Principes de Traduction Prisma / PostgreSQL vers UML

Pour chaque relation, la cardinalité UML découle rigoureusement de la contrainte relationnelle :
- **Côté Source (1 ou 0..1) :** Déterminé par la nullabilité de la clé étrangère (`is_nullable = NO` => `1`, `is_nullable = YES` => `0..1`).
- **Côté Cible (0..* ou 1..* ou 0..1) :** Si la clé étrangère porte une contrainte d'unicité (`@unique` / `UNIQUE`), la cardinalité cible est au plus `1` (relation 1-to-1). Sinon, elle est multiple (`0..*`).
- **Cycle de vie (Composition vs Agrégation) :** Si la règle de suppression est `onDelete: Cascade` et que l'entité dépendante n'a pas d'existence propre hors de son conteneur (ex: `ConversationMessage` au sein de `Conversation`), la relation est modélisée par une **composition UML** (losange plein).

---

## 2. Matrice des Relations Principales (Classes Retenues)

| N° | Classe Source | Classe Cible | Clé Étrangère | Cardinalité Source | Cardinalité Cible | Type UML | Règle onDelete | Justification Métier |
| :-: | :--- | :--- | :--- | :-: | :-: | :---: | :---: | :--- |
| 01 | `Membership` | `Workspace` | `workspaceId` | `0..*` | `1` | Composition | `CASCADE` | Un espace possède plusieurs membres ; la suppression de l'espace détruit les adhésions. |
| 02 | `Membership` | `User` | `userId` | `0..*` | `1` | Association | `CASCADE` | Un utilisateur peut adhérer à plusieurs espaces (multi-tenant). |
| 03 | `WorkspaceInvitation` | `Workspace` | `workspaceId` | `0..*` | `1` | Composition | `CASCADE` | Une invitation appartient exclusivement à un espace. |
| 04 | `Conversation` | `Workspace` | `workspaceId` | `0..*` | `1` | Composition | `CASCADE` | Chaque fil de discussion est cloisonné dans son entreprise. |
| 05 | `Conversation` | `User` | `customerId` | `0..*` | `0..1` | Association | `SET NULL` | Le client peut être authentifié ou anonyme (session web). |
| 06 | `ConversationMessage` | `Conversation` | `conversationId` | `1..*` | `1` | Composition | `CASCADE` | Les messages composent le fil ; ils disparaissent avec la conversation. |
| 07 | `ConversationMessage` | `User` | `senderId` | `0..*` | `0..1` | Association | `SET NULL` | Expéditeur interne (agent) ou null (message client externe). |
| 08 | `Ticket` | `Workspace` | `workspaceId` | `0..*` | `1` | Composition | `CASCADE` | Le ticket SAV est la propriété intégrale de l'entreprise cliente. |
| 09 | `Ticket` | `Conversation` | `conversationId` | `0..1` | `0..1` | Association | `SET NULL` | Élévation optionnelle 1-to-1 d'une conversation en ticket officiel. |
| 10 | `Ticket` | `User` | `customerId` | `0..*` | `0..1` | Association | `SET NULL` | Client rattaché au ticket de réclamation. |
| 11 | `TicketAssignment` | `Ticket` | `ticketId` | `0..*` | `1` | Composition | `CASCADE` | Historique et affectation courante d'un agent sur un ticket. |
| 12 | `TicketAssignment` | `User` | `agentId` | `0..*` | `1` | Association | `CASCADE` | Agent responsable du traitement opérationnel du ticket. |
| 13 | `TicketShare` | `Ticket` | `ticketId` | `0..*` | `1` | Composition | `CASCADE` | Partage collaboratif d'un ticket pour entraide entre pairs. |
| 14 | `TicketShare` | `User` | `agentId` | `0..*` | `1` | Association | `CASCADE` | Agent invité à consulter ou contribuer sur le ticket. |
| 15 | `ConversationShare` | `Conversation` | `conversationId` | `0..*` | `1` | Composition | `CASCADE` | Partage temporaire d'une conversation active avec un collègue. |
| 16 | `ConversationShare` | `User` | `agentId` | `0..*` | `1` | Association | `CASCADE` | Agent récepteur du partage de conversation. |
| 17 | `TicketActivity` | `Ticket` | `ticketId` | `0..*` | `1` | Composition | `CASCADE` | Journal d'audit complet de l'évolution du ticket. |
| 18 | `AgentProfile` | `User` | `userId` | `0..1` | `1` | Association 1-1 | `CASCADE` | Profil étendu d'un conseiller (disponibilité, capacité). |
| 19 | `AgentProfile` | `Workspace` | `workspaceId` | `0..*` | `1` | Association | `CASCADE` | Rattachement du profil d'agent à l'espace de travail. |
| 20 | `AgentSkill` | `AgentProfile` | `agentProfileId` | `0..*` | `1` | Composition | `CASCADE` | Compétence affectée au profil d'un conseiller. |
| 21 | `AgentSkill` | `Skill` | `skillId` | `0..*` | `1` | Association | `CASCADE` | Référence vers le catalogue des compétences de l'entreprise. |
| 22 | `Skill` | `Workspace` | `workspaceId` | `0..*` | `1` | Composition | `CASCADE` | Catalogue des compétences propre à l'espace client. |
| 23 | `Establishment` | `Workspace` | `workspaceId` | `0..*` | `1` | Composition | `CASCADE` | Réseau d'agences physiques rattaché à l'entreprise. |
| 24 | `Subscription` | `Workspace` | `workspaceId` | `0..1` | `1` | Association 1-1 | `CASCADE` | Contrat SaaS unique associé à l'espace d'entreprise. |
| 25 | `SubscriptionIntent` | `Subscription` | `subscriptionId` | `0..*` | `1` | Composition | `CASCADE` | Intentions formelles d'achat ou d'évolution d'offre. |
| 26 | `PaymentAttempt` | `SubscriptionIntent` | `subscriptionIntentId` | `0..*` | `1` | Composition | `CASCADE` | Tentatives de règlement associées à une intention d'achat. |
| 27 | `PaymentTransaction` | `Subscription` | `subscriptionId` | `0..*` | `1` | Association | `CASCADE` | Transactions comptables appliquées au contrat SaaS. |

---

## 3. Focus Conceptuel sur l'Isolation Multi-Tenant

La relation entre `User` et `Workspace` évite rigoureusement toute dépendance directe :
```
┌──────────────┐         1          0..* ┌────────────────────────┐ 0..*          1 ┌───────────────┐
│     User     │─────────────────────────│       Membership       │─────────────────│   Workspace   │
└──────────────┘                         └────────────────────────┘                 └───────────────┘
                                          - role: Role
                                          - status: MembershipStatus
                                          - joinedAt: DateTime
```
- Un `User` peut posséder 0 ou plusieurs adhésions (`Membership`).
- Un `Workspace` regroupe 0 ou plusieurs adhésions (`Membership`).
- Le rôle de l'utilisateur n'est pas une propriété globale du compte, mais une **propriété contextuelle à l'espace entreprise** (`Membership.role`).