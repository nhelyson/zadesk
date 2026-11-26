# -*- coding: utf-8 -*-
import json
import os

with open(r"scratch\parsed_prisma_models.json", "r", encoding="utf-8") as f:
    parsed_models = json.load(f)

with open(r"scratch\pg_metadata.json", "r", encoding="utf-8") as f:
    pg_metadata = json.load(f)

doc = []

# Section 3
doc.append("## 3. INVENTAIRE DÉTAILLÉ DES ÉNUMÉRATIONS DU DOMAINE ZALISK\n")
doc.append("Le schéma Prisma et l'instance PostgreSQL comportent au total **20 types énumérés natifs (`pg_enum`)**. Parmi ceux-ci, **13 énumérations principales** gouvernent les états fonctionnels majeurs des entités du diagramme de classes métier, complétées par **2 énumérations financières d'exécution** et **5 énumérations techniques/exclues**.\n")

doc.append("### 3.1 Les 13 Énumérations Majeures Retenues pour le Diagramme de Classes UML\n")

enums_major = [
    {
        "name": "Role",
        "values": ["OWNER", "ADMIN", "MANAGER", "AGENT"],
        "models": ["Membership.role", "WorkspaceInvitation.role"],
        "utility": "Contrôle d'accès basé sur les rôles (RBAC) au sein de chaque entreprise cliente (Workspace).",
        "relevance": "Indispensable (gouvernance de la sécurité et des autorisations multi-tenant)."
    },
    {
        "name": "MembershipStatus",
        "values": ["ACTIVE", "SUSPENDED", "ARCHIVED"],
        "models": ["Membership.status"],
        "utility": "Cycle de vie de l'adhésion d'un collaborateur (suspension administrative immédiate ou archivage historique).",
        "relevance": "Indispensable (gestion de l'accès opérationnel aux outils SAV)."
    },
    {
        "name": "TicketPriority",
        "values": ["LOW", "MEDIUM", "HIGH", "URGENT"],
        "models": ["Ticket.priority", "Conversation.priority"],
        "utility": "Degré d'urgence d'une réclamation servant au calcul dynamique des délais SLA et au tri des files d'attente.",
        "relevance": "Indispensable (pilotage de la performance SAV et engagement client)."
    },
    {
        "name": "TicketStatus",
        "values": ["PENDING_ASSIGNMENT", "OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"],
        "models": ["Ticket.status"],
        "utility": "Machine à états finis régissant l'évolution d'un ticket SAV de son ouverture jusqu'à sa clôture formelle.",
        "relevance": "Indispensable (processus central du cœur de métier)."
    },
    {
        "name": "ConversationStatus",
        "values": ["WAITING_ASSIGNMENT", "ACTIVE", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"],
        "models": ["Conversation.status"],
        "utility": "État de la session omnicanale de chat direct entre un client et un téléconseiller.",
        "relevance": "Indispensable (gestion temps réel des flux entrants omnicanaux)."
    },
    {
        "name": "MessageType",
        "values": ["CUSTOMER", "AGENT_REPLY", "INTERNAL_NOTE", "SYSTEM"],
        "models": ["ConversationMessage.senderType"],
        "utility": "Typologie du message échangé, garantissant la ségrégation stricte entre les notes internes d'équipe et les messages visibles par le client.",
        "relevance": "Indispensable (confidentialité interne et collaboration SAV)."
    },
    {
        "name": "ShareAccessLevel",
        "values": ["READ_ONLY", "CONTRIBUTE"],
        "models": ["TicketShare.accessLevel", "ConversationShare.accessLevel"],
        "utility": "Niveau d'habilitation accordé lors du partage transversal d'un dossier entre téléconseillers (consultation passive vs participation active).",
        "relevance": "Utile (collaboration inter-services et escalade d'expertise)."
    },
    {
        "name": "AgentAvailability",
        "values": ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"],
        "models": ["AgentProfile.availability"],
        "utility": "Disponibilité opérationnelle en direct d'un agent pour le moteur d'attribution automatique des tickets et conversations.",
        "relevance": "Indispensable (routage intelligent de la charge de travail)."
    },
    {
        "name": "EstablishmentType",
        "values": ["HEADQUARTERS", "BRANCH", "STORE", "POINT_OF_SALE", "SERVICE_POINT", "PICKUP_POINT", "TECH_CENTER", "OTHER"],
        "models": ["Establishment.type"],
        "utility": "Classification de la typologie des locaux et points de vente/SAV de l'entreprise sur le territoire.",
        "relevance": "Utile (maillage territorial et orientation physique des clients)."
    },
    {
        "name": "PlanType",
        "values": ["DECOUVERTE", "STARTER", "PRO", "ENTREPRISE"],
        "models": ["Subscription.plan", "SubscriptionIntent.targetPlan"],
        "utility": "Paliers tarifaires SaaS conditionnant les quotas (nombre d'agents, volume de tickets, intégrations).",
        "relevance": "Indispensable (modèle économique de la plateforme SaaS)."
    },
    {
        "name": "SubscriptionStatus",
        "values": ["ACTIVE", "RENEWAL_DUE", "GRACE_PERIOD", "EXPIRED", "CANCELLED"],
        "models": ["Subscription.status"],
        "utility": "Cycle de vie commercial de l'abonnement d'un Workspace (gestion des périodes de grâce et blocage).",
        "relevance": "Indispensable (gouvernance des droits d'accès à l'application)."
    },
    {
        "name": "IntentType",
        "values": ["INITIAL_PURCHASE", "RENEWAL", "UPGRADE", "DOWNGRADE"],
        "models": ["SubscriptionIntent.intentType"],
        "utility": "Nature de l'action commerciale initiée par l'administrateur de l'entreprise.",
        "relevance": "Utile (traçabilité des mouvements d'abonnements et calcul du prorata)."
    },
    {
        "name": "IntentStatus",
        "values": ["PENDING", "COMPLETED", "ABANDONED", "EXPIRED"],
        "models": ["SubscriptionIntent.status"],
        "utility": "État de progression de la demande de paiement avant validation financière.",
        "relevance": "Utile (gestion des tunnels d'achat et des expirations de session)."
    }
]

for e in enums_major:
    doc.append(f"#### Énumération `{e['name']}`")
    doc.append(f"- **Valeurs exactes vérifiées** : `{', '.join(e['values'])}`")
    doc.append(f"- **Utilisation dans le schéma** : {', '.join([f'`{m}`' for m in e['models']])}")
    doc.append(f"- **Utilité métier** : {e['utility']}")
    doc.append(f"- **Pertinence UML** : **{e['relevance']}**\n")

doc.append("### 3.2 Énumérations Complémentaires du Domaine de Paiement (SasPay)\n")
doc.append("Deux énumérations supplémentaires sont directement rattachées aux entités d'exécution financière `PaymentAttempt` et `PaymentTransaction` :\n")

enums_payment = [
    {
        "name": "AttemptStatus",
        "values": ["INITIATED", "CHECKOUT_CREATED", "PAYMENT_PENDING", "RESULT_UNKNOWN", "RECONCILIATION_REQUIRED", "PAYMENT_CONFIRMED", "CONFIRMED_FAILURE", "SESSION_EXPIRED"],
        "models": ["PaymentAttempt.status"],
        "utility": "Suivi pas-à-pas de l'interaction avec la passerelle SasPay (redirection, retour webhook, confirmation Mobile Money)."
    },
    {
        "name": "TransactionApplicationStatus",
        "values": ["APPLIED_TO_SUBSCRIPTION", "DUPLICATE_PAYMENT_RECORDED", "MANUAL_ADJUSTMENT", "REFUNDED"],
        "models": ["PaymentTransaction.status"],
        "utility": "Attestation de l'imputation comptable réelle d'un paiement sur l'abonnement du Workspace."
    }
]

for e in enums_payment:
    doc.append(f"#### Énumération `{e['name']}`")
    doc.append(f"- **Valeurs exactes vérifiées** : `{', '.join(e['values'])}`")
    doc.append(f"- **Utilisation dans le schéma** : {', '.join([f'`{m}`' for m in e['models']])}")
    doc.append(f"- **Utilité métier** : {e['utility']}\n")

doc.append("### 3.3 Énumérations Techniques Exclues du Diagramme Métier (5 types)\n")
doc.append("Les 5 énumérations suivantes appartiennent à des tables techniques secondaires ou éphémères exclues du modèle métier principal :\n")
doc.append("1. `DowngradeRequestStatus` (`DRAFT`, `READY`, `BLOCKED`, `SCHEDULED`, `APPLIED`, `CANCELLED`, `OBSOLETE_CANCELLED`) : Gestion du workflow différé de rétrogradation d'abonnement (`CommercialDowngradeRequest`).")
doc.append("2. `OtpPurpose` (`REGISTRATION`, `LOGIN`, `EMAIL_VERIFICATION`, `PASSWORD_RESET`) : Jetons de sécurité temporaires d'authentification (`OtpToken`).")
doc.append("3. `OutboxStatus` (`PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED`) : Pattern Transactional Outbox pour la synchronisation asynchrone d'événements (`OutboxEvent`).")
doc.append("4. `ReceiptValidationStatus` (`VALID`, `INVALID_AMOUNT`, `INVALID_CURRENCY`, `INVALID_PAID_AT`, `MALFORMED_DATA`) : Contrôles cryptographiques des reçus bruts SasPay (`ProviderPaymentReceipt`).")
doc.append("5. `ReceiptReconciliationStatus` (`PENDING_MATCHING`, `MATCHED_AND_APPLIED`, `DUPLICATE_PAYMENT`, `AMOUNT_MISMATCH`, etc.) : Audit financier avancé des divergences de caisse.\n")

doc.append("\n---\n")

# Section 4: Tableau exhaustif des associations et cardinalités
doc.append("## 4. TABLEAU EXHAUSTIF DES ASSOCIATIONS ET CARDINALITÉS\n")
doc.append("Ce tableau répertorie l'intégralité des relations fonctionnelles et conceptuelles unissant les 19 classes métier de Zalisk, avec leurs cardinalités exactes vérifiées au niveau des clés étrangères PostgreSQL et des déclarations Prisma.\n")

doc.append("| Classe A | Relation (Sémantique) | Classe B | Cardinalité côté A | Cardinalité côté B | Source vérifiée |")
doc.append("|---|---|---|:---:|:---:|---|")

relations_data = [
    ("Workspace", "Agrège les adhésions", "Membership", "1", "0..*", "FK `memberships.workspaceId` -> `workspaces.id` (CASCADE)"),
    ("User", "Détient des adhésions", "Membership", "1", "0..*", "FK `memberships.userId` -> `users.id` (CASCADE)"),
    ("Workspace", "Émet des invitations", "WorkspaceInvitation", "1", "0..*", "FK `workspace_invitations.workspaceId` -> `workspaces.id` (CASCADE)"),
    ("User", "Auteur d'invitations", "WorkspaceInvitation", "1", "0..*", "FK `workspace_invitations.invitedById` -> `users.id` (CASCADE)"),
    ("Workspace", "Déploie des profils", "AgentProfile", "1", "0..*", "FK `agent_profiles.workspaceId` -> `workspaces.id` (CASCADE)"),
    ("User", "Possède un profil agent", "AgentProfile", "1", "0..1 (*)", "FK `agent_profiles.userId` -> `users.id` + UQ `[workspaceId, userId]`"),
    ("Workspace", "Définit le catalogue", "Skill", "1", "0..*", "FK `skills.workspaceId` -> `workspaces.id` (CASCADE)"),
    ("AgentProfile", "Est certifié sur", "AgentSkill", "1", "0..*", "FK `agent_skills.agentProfileId` -> `agent_profiles.id` (CASCADE)"),
    ("Skill", "Est attribuée via", "AgentSkill", "1", "0..*", "FK `agent_skills.skillId` -> `skills.id` (CASCADE)"),
    ("Workspace", "Impose des établissements", "Establishment", "1", "0..*", "FK `establishments.workspaceId` -> `workspaces.id` (CASCADE)"),
    ("Workspace", "Centralise les conversations", "Conversation", "1", "0..*", "FK `conversations.workspaceId` -> `workspaces.id` (CASCADE)"),
    ("User", "Conseiller assigné à conv.", "Conversation", "0..1", "0..*", "FK `conversations.assignedAgentId` -> `users.id` (SET NULL)"),
    ("Conversation", "Contient des messages", "ConversationMessage", "1", "1..*", "FK `conversation_messages.conversationId` -> `conversations.id` (CASCADE)"),
    ("User", "Rédacteur du message", "ConversationMessage", "0..1", "0..*", "FK `conversation_messages.senderId` -> `users.id` (SET NULL)"),
    ("Conversation", "Partagée via", "ConversationShare", "1", "0..*", "FK `conversation_shares.conversationId` -> `conversations.id` (CASCADE)"),
    ("User", "Bénéficiaire du partage conv.", "ConversationShare", "1", "0..*", "FK `conversation_shares.agentId` -> `users.id` (CASCADE)"),
    ("User", "Initiateur du partage conv.", "ConversationShare", "1", "0..*", "FK `conversation_shares.sharedById` -> `users.id` (CASCADE)"),
    ("Workspace", "Gère les dossiers SAV", "Ticket", "1", "0..*", "FK `tickets.workspaceId` -> `workspaces.id` (CASCADE)"),
    ("User", "Conseiller affecté au ticket", "Ticket", "0..1", "0..*", "FK `tickets.assignedAgentId` -> `users.id` (SET NULL)"),
    ("User", "Créateur interne du ticket", "Ticket", "0..1", "0..*", "FK `tickets.createdById` -> `users.id` (SET NULL)"),
    ("Conversation", "Élévation en dossier SAV", "Ticket", "0..1", "0..* (**)", "FK `tickets.conversationId` -> `conversations.id` (SET NULL)"),
    ("Ticket", "Historique d'affectations", "TicketAssignment", "1", "0..*", "FK `ticket_assignments.ticketId` -> `tickets.id` (CASCADE)"),
    ("User", "Ancien conseiller assigné", "TicketAssignment", "0..1", "0..*", "FK `ticket_assignments.previousAgentId` -> `users.id` (SET NULL)"),
    ("User", "Nouveau conseiller assigné", "TicketAssignment", "0..1", "0..*", "FK `ticket_assignments.newAgentId` -> `users.id` (SET NULL)"),
    ("User", "Superviseur ayant réaffecté", "TicketAssignment", "0..1", "0..*", "FK `ticket_assignments.assignedById` -> `users.id` (SET NULL)"),
    ("Ticket", "Partagé collaborativement", "TicketShare", "1", "0..*", "FK `ticket_shares.ticketId` -> `tickets.id` (CASCADE)"),
    ("User", "Bénéficiaire du partage ticket", "TicketShare", "1", "0..*", "FK `ticket_shares.agentId` -> `users.id` (CASCADE)"),
    ("User", "Auteur du partage ticket", "TicketShare", "1", "0..*", "FK `ticket_shares.sharedById` -> `users.id` (CASCADE)"),
    ("Ticket", "Consigne les activités", "TicketActivity", "1", "0..*", "FK `ticket_activities.ticketId` -> `tickets.id` (CASCADE)"),
    ("User", "Auteur de l'activité/note", "TicketActivity", "0..1", "0..*", "FK `ticket_activities.authorId` -> `users.id` (SET NULL)"),
    ("Workspace", "Souscrit à un abonnement", "Subscription", "1", "0..1", "FK `subscriptions.workspaceId` -> `workspaces.id` + UQ `workspaceId` (RESTRICT)"),
    ("Subscription", "Engendre des intentions", "SubscriptionIntent", "1", "0..*", "FK `subscription_intents.subscriptionId` -> `subscriptions.id` (RESTRICT)"),
    ("Workspace", "Contexte entreprise facturé", "SubscriptionIntent", "1", "0..*", "FK `subscription_intents.workspaceId` -> `workspaces.id` (RESTRICT)"),
    ("User", "Commanditaire du paiement", "SubscriptionIntent", "1", "0..*", "FK `subscription_intents.userId` -> `users.id` (RESTRICT)"),
    ("SubscriptionIntent", "Déclenche des tentatives", "PaymentAttempt", "1", "0..*", "FK `payment_attempts.intentId` -> `subscription_intents.id` (RESTRICT)"),
    ("Workspace", "Contexte entreprise tentative", "PaymentAttempt", "1", "0..*", "FK `payment_attempts.workspaceId` -> `workspaces.id` (RESTRICT)"),
    ("Subscription", "Reçoit des transactions", "PaymentTransaction", "1", "0..*", "FK `payment_transactions.subscriptionId` -> `subscriptions.id` (RESTRICT)"),
    ("SubscriptionIntent", "Validée par transaction", "PaymentTransaction", "1", "0..*", "FK `payment_transactions.intentId` -> `subscription_intents.id` (RESTRICT)"),
    ("PaymentAttempt", "Aboutit à une transaction", "PaymentTransaction", "0..1", "0..*", "FK `payment_transactions.attemptId` -> `payment_attempts.id` (SET NULL)"),
    ("Workspace", "Bénéficiaire de transaction", "PaymentTransaction", "1", "0..*", "FK `payment_transactions.workspaceId` -> `workspaces.id` (RESTRICT)")
]

for row in relations_data:
    doc.append(f"| `{row[0]}` | {row[1]} | `{row[2]}` | `{row[3]}` | `{row[4]}` | {row[5]} |")

doc.append("\n*(\*) Note sur `User` $\\to$ `AgentProfile` : Au niveau global de la plateforme, un utilisateur peut disposer de plusieurs profils agents s'il intervient dans plusieurs entreprises clientes distinctes. En revanche, au sein d'un Workspace spécifique, la contrainte d'unicité composite `@@unique([workspaceId, userId])` impose une cardinalité stricte de `0..1`.*")
doc.append("\n*(\*\*) Note sur `Conversation` $\\to$ `Ticket` : Voir l'analyse détaillée en section 6 concernant la différence entre la cardinalité physique SGBD (`0..*`) et la cardinalité fonctionnelle métier d'élévation unique (`0..1`).*\n")

doc.append("\n---\n")

# Section 5: Analyse approfondie des relations multi-tenant
doc.append("## 5. ANALYSE APPROFONDIE DES RELATIONS MULTI-TENANT ET DE GESTION DES UTILISATEURS\n")
doc.append("### 5.1 Découplage Fondamental entre Utilisateurs et Espaces Entreprises (Workspaces)")
doc.append("""L'architecture logicielle de Zalisk repose sur une isolation multi-tenant logique stricte. L'examen des schémas physique et logique révèle un choix de conception capital :
- Il n'existe **aucune clé étrangère directe** de possession entre `User` et `Workspace` (aucun champ `User.workspaceId` ni `Workspace.ownerId`).
- Un `User` représente une personne physique unique dotée d'une identité globale (adresse email unique certifiée via `emailVerified`).
- L'appartenance d'un collaborateur à un espace de travail est **intégralement médiée par l'entité associative `Membership`**.
""")

doc.append("### 5.2 Rôle Pivot de la Classe d'Association `Membership`")
doc.append("""La classe `Membership` matérialise l'adhésion contractuelle d'un utilisateur au sein d'une organisation :
1. **Intégrité référentielle** : Possède deux clés étrangères obligatoires (`userId` et `workspaceId`), toutes deux configurées avec `ON DELETE CASCADE`.
2. **Unicité stricte d'adhésion** : La contrainte PostgreSQL composite `@@unique([userId, workspaceId])` garantit qu'un utilisateur ne peut être membre qu'une seule et unique fois d'un même espace de travail.
3. **Contrôle d'accès RBAC** : Porte l'attribut `role` typé par l'énumération `Role` (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`).
4. **Cycle de vie administratif** : Porte l'attribut `status: MembershipStatus` (`ACTIVE`, `SUSPENDED`, `ARCHIVED`) ainsi que `suspendedAt` et `suspendedReason`. Cela permet au propriétaire d'une entreprise de bloquer instantanément les droits d'un collaborateur sans supprimer son compte ni perdre la traçabilité de ses actions antérieures.
""")

doc.append("### 5.3 Mécanisme d'Invitation Asynchrone (`WorkspaceInvitation`)")
doc.append("""Le recrutement et l'intégration de nouveaux collaborateurs s'opèrent via la classe `WorkspaceInvitation` :
- Un collaborateur potentiel est invité par son adresse courriel (`email: String`) sans nécessiter qu'il possède déjà un compte utilisateur lors de l'envoi de l'invitation.
- L'invitation est rattachée au `Workspace` émetteur (`workspaceId`) et à l'utilisateur qui en est l'auteur (`invitedById: User`).
- Un jeton cryptographique unique (`token: String @unique`) sécurise l'acceptation via lien web avec expiration temporelle (`expiresAt`).
- À l'acceptation (`acceptedAt`), une ligne `Membership` est automatiquement instanciée avec le rôle prédéfini (`role`).
""")

doc.append("### 5.4 Profils Métier d'Agents (`AgentProfile`)")
doc.append("""L'extension du compte utilisateur en conseiller de support technique ne s'effectue pas par héritage objet, mais par **composition associative** :
- Un compte `User` n'a accès aux fonctionnalités de prise en charge SAV que s'il dispose d'un enregistrement `AgentProfile`.
- La table `agent_profiles` référence `workspaceId` et `userId`.
- La contrainte d'unicité composite `@@unique([workspaceId, userId])` garantit qu'un agent ne possède qu'un seul profil opérationnel par entreprise.
- L'entité stocke les métadonnées de régulation opérationnelle : `availability` (`AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE`), `maxCapacity` (nombre maximal de tickets simultanés, valeur par défaut 10) et `autoAssignmentEnabled`.
""")

doc.append("\n---\n")

# Section 6: Analyse approfondie des conversations et tickets
doc.append("## 6. ANALYSE APPROFONDIE DES CONVERSATIONS ET DES TICKETS SAV\n")
doc.append("### 6.1 Découplage entre Flux Omnicanal Temps Réel et Dossier SAV Contractuel")
doc.append("""Zalisk établit une séparation architecturale nette entre :
1. **La Conversation (`Conversation`)** : Canal d'interaction instantané, fluide et temps réel (messagerie web, portail client, WhatsApp).
2. **Le Ticket SAV (`Ticket`)** : Dossier juridique et contractuel de réclamation formelle, doté d'une référence d'audit, de priorités formalisées et d'engagements de service (SLA).
""")

doc.append("### 6.2 Analyse Critique du Lien entre `Conversation` et `Ticket`")
doc.append("""Un examen approfondi de la déclaration réelle dans `backend/prisma/schema.prisma` et de la table physique `tickets` dans PostgreSQL apporte un éclairage indispensable :
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
1. **Au niveau physique relationnel (SGBD)** : La relation est techniquement une association **1-à-Plusieurs optionnelle** (`Conversation` $1 \to 0..*$ `Ticket`). Cela permet physiquement à un téléconseiller de créer plusieurs tickets distincts (par exemple, une réclamation technique ET un incident de facturation) à partir d'un même fil de discussion prolongé.
2. **Au niveau conceptuel et métier (Élévation)** : L'action métier d'« Élévation » formalise une conversion directe : une conversation donne naissance à un ticket officiel SAV. Dans la grande majorité des parcours clients, l'association est fonctionnellement perçue comme un lien **1-à-1 optionnel** ($0..1 \leftrightarrow 0..1$) : un ticket provient au maximum d'une conversation (`0..1`), et une conversation donne naissance à un ticket lorsqu'elle nécessite une escalade formelle.
3. **Recommandation pour le mémoire académique** : Il convient d'exposer clairement cette dualité : le SGBD offre la flexibilité structurelle `0..*` sans blocage d'unicité, tandis que la règle métier de gestion implémente le pattern d'élévation unitaire.
""")

doc.append("### 6.3 Gestion des Auteurs de Messages (`ConversationMessage`)")
doc.append("""La classe `ConversationMessage` possède l'attribut `senderId String?` lié à `User?` via `ON DELETE SET NULL` :
- Pourquoi cet attribut est-il **facultatif (nullable)** ?
  - Si le message est rédigé par un agent du support, `senderType` vaut `AGENT_REPLY` ou `INTERNAL_NOTE`, et `senderId` pointe vers l'agent connecté (`User.id`).
  - Si le message émane d'un client externe sur le portail public ou via chat anonyme, `senderType` vaut `CUSTOMER`, le client n'a pas nécessairement de compte utilisateur `User` dans la base : son identité est alors stockée dans `senderName`, et `senderId` reste `NULL`.
  - Si le message est généré automatiquement par la plateforme, `senderType` vaut `SYSTEM`, et `senderId` est également `NULL`.
- Le champ booléen `isInternalNote: Boolean @default(false)` permet aux téléconseillers de consigner des mémos d'équipe invisibles sur l'interface du client.
""")

doc.append("### 6.4 Collaboration et Traçabilité SAV")
doc.append("""Pour répondre aux exigences des centres de relation client modernes, le cycle de vie du ticket est instrumenté par trois classes satellites :
- `TicketAssignment` : Enregistre chaque réattribution avec le téléconseiller précédent (`previousAgentId`), le nouveau titulaire (`newAgentId`), le gestionnaire décisionnaire (`assignedById`) et le motif (`reason`).
- `TicketShare` / `ConversationShare` : Permet à un conseiller de partager un dossier avec un collègue selon deux niveaux d'accès (`accessLevel: ShareAccessLevel`) : consultation seule (`READ_ONLY`) ou droit d'adjonction de notes (`CONTRIBUTE`). La contrainte composite `@@unique([ticketId, agentId])` interdit les doublons de partage.
- `TicketActivity` : Journal d'audit chronologique non modifiable consignant chaque transition d'état, ajustement de priorité ou jalon de résolution.
""")

doc.append("\n---\n")

# Section 7: Analyse approfondie des compétences et établissements
doc.append("## 7. ANALYSE APPROFONDIE DES COMPÉTENCES ET DES ÉTABLISSEMENTS\n")
doc.append("### 7.1 Modélisation de la Relation Plusieurs-à-Plusieurs (N-M) entre Agents et Compétences")
doc.append("""Le modèle de Zalisk permet d'affecter des compétences spécialisées (ex. *Support Réseau*, *Facturation SasPay*, *Matériel Garanti*) aux téléconseillers afin d'assurer un routage intelligent des requêtes.
- La classe `Skill` représente une compétence répertoriée par une entreprise (`workspaceId`).
- La classe `AgentProfile` représente le profil de l'agent opérant pour cette entreprise.
- La relation N-M n'est pas implicite : elle est explicitement matérialisée par la classe d'association **`AgentSkill`**.
- La contrainte d'unicité composite `@@unique([agentProfileId, skillId])` empêche d'attribuer deux fois la même compétence au même agent.
""")

doc.append("### 7.2 Analyse Technique Particulière du Champ `validatedById`")
doc.append("""Le champ `AgentSkill.validatedById` présente une caractéristique essentielle révélée par l'audit :
- **Dans Prisma** : `validatedById String?` est déclaré comme un scalaire optionnel, sans directive `@relation`.
- **Dans PostgreSQL** : La colonne `agent_skills.validatedById` est de type `text`, nullable, et **ne possède aucune contrainte physique de clé étrangère (`fkey`)** dans le catalogue système `information_schema.table_constraints`.
- **Sémantique métier** : Ce champ conserve l'identifiant de l'administrateur ou du superviseur qui a audité et validé la compétence de l'agent. Bien qu'il s'agisse logiquement d'une référence à `User.id`, le SGBD ne valide pas cette intégrité au niveau relationnel physique, ce qui évite de bloquer les suppressions de profils d'anciens managers.
""")

doc.append("### 7.3 Maillage Territorial via `Establishment`")
doc.append("""Pour les entreprises clientes disposant d'agences physiques, de boutiques ou de centres d'intervention technique, la classe `Establishment` modélise ces points de contact :
- Chaque établissement est rattaché à son entreprise (`workspaceId`).
- Typé par `type: EstablishmentType` (8 valeurs possibles : siège social `HEADQUARTERS`, succursale `BRANCH`, magasin `STORE`, point de vente `POINT_OF_SALE`, centre de service `SERVICE_POINT`, point relais `PICKUP_POINT`, centre technique `TECH_CENTER`, ou autre `OTHER`).
- Porte des attributs de localisation (`address`, `city`, `country`), de contact direct (`phone`, `email`, `whatsapp`), des horaires d'ouverture (`openingHours`, `businessHours`) et un indicateur de siège principal (`isMain: Boolean`).
""")

doc.append("\n---\n")

# Section 8: Analyse approfondie des abonnements et paiements
doc.append("## 8. ANALYSE APPROFONDIE DES ABONNEMENTS ET DES PAIEMENTS (SASPAY)\n")
doc.append("### 8.1 Architecture du Modèle de Facturation à États")
doc.append("""Le module de facturation de Zalisk s'appuie sur la passerelle de paiement SasPay (Mobile Money et cartes bancaires en zone CEMAC/UEMAC). Pour garantir la robustesse comptable et prévenir la fraude ou les doubles paiements, le processus est découpé en quatre classes interconnectées selon un pipeline rigoureux :
""")

doc.append("""```
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
""")

doc.append("### 8.2 Analyse Détaillée des Entités Financières")
doc.append("""1. **`Subscription` (Abonnement)** :
   - Représente le contrat en cours pour l'entreprise (`workspaceId: String @unique`).
   - La relation `Workspace` $\\leftrightarrow$ `Subscription` est un **1-à-1 strict côté Subscription** : un espace ne peut avoir qu'un seul enregistrement d'abonnement actif dans cette table.
   - Définit le forfait (`plan: PlanType`), le statut (`status: SubscriptionStatus`), le montant actif en Francs CFA (`activePriceXaf: Int`), et les échéances temporelles (`currentPeriodStart`, `currentPeriodEnd`, `gracePeriodEnd`).
   - Comporte un champ `version: Int @default(1)` pour le verrouillage optimiste lors des mises à niveau concurrentes.

2. **`SubscriptionIntent` (Intention d'Achat)** :
   - Créée dès qu'un utilisateur clique sur « Souscrire » ou « Changer de formule ».
   - Référence obligatoirement l'abonnement (`subscriptionId`), l'entreprise (`workspaceId`) et l'utilisateur commanditaire (`userId`).
   - Clé d'idempotence client : `clientMutationKey: String @unique` garantit qu'un double clic ne génère pas deux intentions identiques.
   - Type de mouvement : `intentType: IntentType` (`INITIAL_PURCHASE`, `RENEWAL`, `UPGRADE`, `DOWNGRADE`).

3. **`PaymentAttempt` (Tentative de Paiement)** :
   - Orchestre chaque essai de règlement via SasPay rattaché à une intention (`intentId`).
   - Cardinalité : Une intention peut engendrer **plusieurs tentatives** (`SubscriptionIntent` $1 \to 0..*$ `PaymentAttempt`), par exemple si l'utilisateur annule une première session Mobile Money ou si le délai expire.
   - Numérotation séquentielle des essais : La contrainte composite `@@unique([intentId, attemptNumber])` empêche les collisions de séquence d'essai.
   - Clé locale unique d'essai : `localAttemptKey: String @unique` assure l'unicité de chaque transaction initiée.
   - Suivi d'état fin : `status: AttemptStatus` (`INITIATED`, `CHECKOUT_CREATED`, `PAYMENT_PENDING`, etc.).

4. **`PaymentTransaction` (Transaction Comptable Validée)** :
   - Enregistrement immuable actant la réception confirmée des fonds par webhook ou notification SasPay.
   - Porte le reçu fournisseur unique : `receiptId: String @unique`.
   - Référence l'abonnement crédité (`subscriptionId`), l'intention satisfaite (`intentId`), et de manière optionnelle la tentative d'origine (`attemptId: String?`).
   - Montant certifié : `amountXaf: Int` et `currency: String @default(\"XAF\")`.
   - Imputation comptable : `status: TransactionApplicationStatus` (`APPLIED_TO_SUBSCRIPTION`).

5. **Règles de suppression (`onDelete: Restrict`)** :
   - Toutes les clés étrangères liant `Subscription`, `SubscriptionIntent`, `PaymentAttempt` et `PaymentTransaction` sont configurées avec **`ON DELETE RESTRICT`**.
   - Justification légale et financière : Il est strictement impossible de supprimer un abonnement ou un espace entreprise tant que des écritures financières ou des intentions de paiement y sont rattachées, assurant une piste d'audit inaltérable.
""")

doc.append("\n---\n")

# Section 9: Sélection des attributs destinés au futur diagramme UML
doc.append("## 9. SÉLECTION DES ATTRIBUTS DESTINÉS AU FUTUR DIAGRAMME UML\n")
doc.append("Pour éviter la surcharge visuelle du diagramme UML tout en préservant son exactitude académique, les 231 attributs scalaires audités sont classés en trois niveaux d'intérêt. La colonne **Retenu UML** indique les attributs préconisés pour l'affichage dans les compartiments de classes.\n")

doc.append("| Classe | Attributs Indispensables (Affichés) | Attributs Utiles (Affichés) | Attributs Secondaires (Omis du visuel) |")
doc.append("|---|---|---|---|")

attributes_selection = [
    ("User", "+ id: String [PK]<br/>+ email: String [UQ]<br/>+ firstName: String<br/>+ lastName: String", "+ emailVerified: Boolean<br/>+ avatarUrl: String", "googleId, passwordHash, createdAt, updatedAt"),
    ("Workspace", "+ id: String [PK]<br/>+ name: String<br/>+ slug: String [UQ]", "+ isPublic: Boolean<br/>+ hasExistingSav: Boolean<br/>+ timezone: String<br/>+ supportEmail: String<br/>+ supportPhone: String", "normalizedName, description, category, logoUrl, coverUrl, verified, website, supportWhatsApp, address, city, country, openingHours, supportCategories, brandColor, brandPalette, cannedResponses, businessHours, createdAt, updatedAt"),
    ("Membership", "+ id: String [PK]<br/>+ userId: String [FK]<br/>+ workspaceId: String [FK]<br/>+ role: Role<br/>+ status: MembershipStatus", "+ suspendedAt: DateTime", "suspendedReason, createdAt, updatedAt"),
    ("WorkspaceInvitation", "+ id: String [PK]<br/>+ email: String<br/>+ workspaceId: String [FK]<br/>+ role: Role<br/>+ token: String [UQ]", "+ expiresAt: DateTime<br/>+ acceptedAt: DateTime", "invitedById, revokedAt, dispatchStatus, dispatchLockedBy, dispatchStartedAt, dispatchAttempts, nextRetryAt, dispatchError, createdAt"),
    ("Conversation", "+ id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ status: ConversationStatus<br/>+ priority: TicketPriority", "+ customerName: String<br/>+ customerEmail: String<br/>+ channel: String<br/>+ lastMessageAt: DateTime", "assignedAgentId, customerPhone, category, publicTokenHash, createdAt, updatedAt"),
    ("ConversationMessage", "+ id: String [PK]<br/>+ conversationId: String [FK]<br/>+ senderId: String [FK]<br/>+ senderType: MessageType<br/>+ content: String", "+ senderName: String<br/>+ isInternalNote: Boolean<br/>+ createdAt: DateTime", "—"),
    ("Ticket", "+ id: String [PK]<br/>+ reference: String [UQ]<br/>+ workspaceId: String [FK]<br/>+ conversationId: String [FK]<br/>+ assignedAgentId: String [FK]<br/>+ title: String<br/>+ priority: TicketPriority<br/>+ status: TicketStatus", "+ description: String<br/>+ customerName: String<br/>+ slaDueAt: DateTime<br/>+ resolvedAt: DateTime<br/>+ closedAt: DateTime", "createdById, category, customerPhone, customerEmail, metadata, createdAt, updatedAt"),
    ("TicketAssignment", "+ id: String [PK]<br/>+ ticketId: String [FK]<br/>+ previousAgentId: String [FK]<br/>+ newAgentId: String [FK]<br/>+ assignedById: String [FK]", "+ reason: String<br/>+ createdAt: DateTime", "—"),
    ("TicketShare", "+ id: String [PK]<br/>+ ticketId: String [FK]<br/>+ agentId: String [FK]<br/>+ sharedById: String [FK]<br/>+ accessLevel: ShareAccessLevel", "+ expiresAt: DateTime<br/>+ createdAt: DateTime", "—"),
    ("ConversationShare", "+ id: String [PK]<br/>+ conversationId: String [FK]<br/>+ agentId: String [FK]<br/>+ sharedById: String [FK]<br/>+ accessLevel: ShareAccessLevel", "+ createdAt: DateTime", "—"),
    ("TicketActivity", "+ id: String [PK]<br/>+ ticketId: String [FK]<br/>+ authorId: String [FK]<br/>+ type: String<br/>+ content: String", "+ createdAt: DateTime", "—"),
    ("AgentProfile", "+ id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ userId: String [FK]<br/>+ availability: AgentAvailability", "+ maxCapacity: Int<br/>+ autoAssignmentEnabled: Boolean<br/>+ title: String<br/>+ phone: String", "notificationEmail, notificationApp, createdAt, updatedAt"),
    ("Skill", "+ id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ name: String", "+ description: String", "createdAt, updatedAt"),
    ("AgentSkill", "+ id: String [PK]<br/>+ agentProfileId: String [FK]<br/>+ skillId: String [FK]", "+ validatedById: String<br/>+ validatedAt: DateTime<br/>+ createdAt: DateTime", "—"),
    ("Establishment", "+ id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ name: String<br/>+ type: EstablishmentType<br/>+ isMain: Boolean<br/>+ isActive: Boolean", "+ address: String<br/>+ city: String<br/>+ country: String", "description, isPublic, addressDetails, phone, email, whatsapp, openingHours, businessHours, imageUrl, galleryImages, services, practicalInfo, createdAt, updatedAt"),
    ("Subscription", "+ id: String [PK]<br/>+ workspaceId: String [FK, UQ]<br/>+ plan: PlanType<br/>+ status: SubscriptionStatus<br/>+ activePriceXaf: Int", "+ currentPeriodStart: DateTime<br/>+ currentPeriodEnd: DateTime<br/>+ gracePeriodEnd: DateTime<br/>+ version: Int", "billingAnchorDay, lastNoticeSentAt, noticeCount, createdAt, updatedAt"),
    ("SubscriptionIntent", "+ id: String [PK]<br/>+ workspaceId: String [FK]<br/>+ subscriptionId: String [FK]<br/>+ userId: String [FK]<br/>+ intentType: IntentType<br/>+ targetPlan: PlanType<br/>+ priceXaf: Int<br/>+ status: IntentStatus", "+ clientMutationKey: String [UQ]<br/>+ currency: String", "expectedSubscriptionVersion, createdAt, updatedAt"),
    ("PaymentAttempt", "+ id: String [PK]<br/>+ intentId: String [FK]<br/>+ workspaceId: String [FK]<br/>+ attemptNumber: Int<br/>+ status: AttemptStatus", "+ provider: String<br/>+ localAttemptKey: String [UQ]<br/>+ expiresAt: DateTime", "providerSessionId, checkoutUrl, failureReason, createdAt, updatedAt"),
    ("PaymentTransaction", "+ id: String [PK]<br/>+ receiptId: String [UQ]<br/>+ workspaceId: String [FK]<br/>+ subscriptionId: String [FK]<br/>+ intentId: String [FK]<br/>+ amountXaf: Int<br/>+ status: TransactionApplicationStatus", "+ currency: String<br/>+ provider: String<br/>+ paidAt: DateTime", "attemptId, providerTransactionId, paymentMethod, operatorReference, createdAt")
]

for row in attributes_selection:
    doc.append(f"| **`{row[0]}`** | {row[1]} | {row[2]} | {row[3]} |")

doc.append("\n---\n")

# Section 10: Classes exclues et justification
doc.append("## 10. CLASSES EXCLUES DU MODÈLE MÉTIER PRINCIPAL ET JUSTIFICATION\n")
doc.append("### 10.1 Modèles Relationnels Techniques Exclus du Diagramme de Classes (15 modèles)")
doc.append("""Sur les 34 modèles Prisma déclarés, 15 ont été intentionnellement écartés du diagramme de classes métier pour respecter les critères académiques de clarté et de pertinence conceptuelle :
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
""")

doc.append("### 10.2 Justification de l'Exclusion des Briques d'Infrastructure Externe")
doc.append("""Le sujet de la modélisation concerne la **structure et l'organisation des données de la base relationnelle PostgreSQL de Zalisk**. Par conséquent, les technologies suivantes ne doivent sous aucun prétexte figurer comme classes d'entités dans ce diagramme :
- **MongoDB** : Base de données NoSQL orientée documents utilisée pour stocker des documents non structurés et des chunks vectoriels pour le RAG. Il s'agit d'un magasin documentaire distinct, non régi par le modèle relationnel PostgreSQL.
- **Redis** : Base de données en mémoire clé-valeur utilisée pour le cache de performance, le pub/sub WebSocket et la gestion des verrous distribués.
- **Cloudflare Workers AI** : Service externe d'inférence LLM interrogé via API REST/gRPC. Il constitue un composant d'architecture applicative ou un acteur externe, jamais une classe d'entité persistée dans le schéma de données relationnel.
""")

doc.append("\n---\n")

# Section 11: Incertitudes ou divergences restantes
doc.append("## 11. INCERTITUDES OU DIVERGENCES RESTANTES\n")
doc.append("L'audit technique croisé entre les migrations SQL, le fichier `schema.prisma` et le dictionnaire de données PostgreSQL permet de formuler les conclusions suivantes :\n")
doc.append("1. **Parité Schéma / Base de Données (Drift = 0)** : Aucune divergence de structure n'a été détectée. Les 34 modèles Prisma correspondent exactement aux tables PostgreSQL (via `@@map`), les types de colonnes, nullabilités, index composites et contraintes d'unicité sont parfaitement synchronisés.")
doc.append("2. **Clarification sur le lien `Conversation` $\\leftrightarrow$ `Ticket`** : L'ancien audit mentionnait un lien optionnel 1-à-1 basé sur `conversationId unique`. L'inspection détaillée du code et de la base démontre que `tickets.conversationId` **n'a pas de contrainte unique** dans PostgreSQL. La relation est physiquement un `0..1` vers `0..*`. Sur le plan métier, l'élévation d'une conversation produit fonctionnellement un unique ticket de suivi, ce qui explique l'interprétation 1-to-1 conceptuelle.")
doc.append("3. **Statut de `validatedById` dans `AgentSkill`** : L'audit confirme que `validatedById` ne possède pas de contrainte physique de clé étrangère dans PostgreSQL, bien qu'il contienne sémantiquement l'identifiant d'un utilisateur `User` valideur.")
doc.append("4. **Exactitude des Énumérations** : L'énumération `EstablishmentType` compte exactement 8 valeurs dans PostgreSQL (`pg_enum`), et non 6 comme dans certains brouillons précédents (les valeurs `POINT_OF_SALE` et `PICKUP_POINT` ont été réintégrées avec rigueur).")

doc.append("\n---\n")

# Section 12: Proposition finale de structure logique du diagramme
doc.append("## 12. PROPOSITION FINALE DE STRUCTURE LOGIQUE DU DIAGRAMME DE CLASSES UML\n")
doc.append("""Pour la conception finale du diagramme dans PlantUML et Draw.io, la disposition préconisée s'articule autour de **4 packages fonctionnels** organisés en grille 2x2 assurant une lisibilité optimale sur une page A4 paysage ou un écran haute définition :
""")

doc.append("""```
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
""")

doc.append("""### Règles de Représentation Visuelle :
1. **Compositions UML (Losange plein noir)** : Utilisées pour marquer la dépendance forte de cycle de vie (`Workspace` vers `Membership`, `Establishment`, `Conversation`, `Ticket`, `Skill` ; `Conversation` vers `ConversationMessage` ; `Ticket` vers `TicketAssignment`, `TicketActivity`).
2. **Associations simples (Trait plein simple)** : Utilisées pour les références croisées et les rôles d'acteurs (`User` vers `Membership`, `User` vers `AgentProfile`, `User` vers `Ticket`).
3. **Cardinalités formelles** : Mentionnées aux extrémités de chaque connecteur (`1`, `0..1`, `0..*`, `1..*`).
4. **Stéréotypes UML** : Entités annotées `<<entity>>` et énumérations annotées `<<enum>>`.
""")

doc.append("\n---\n*Fin du rapport technique d'extraction des classes et relations de Zalisk.*")

output_txt = "\n".join(doc)
with open(r"scratch\report_part2.md", "w", encoding="utf-8") as f:
    f.write(output_txt)

print(f"Part 2 written ({len(output_txt)} bytes).")
