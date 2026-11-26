# INVENTAIRE EXHAUSTIF DES MODÈLES DE DONNÉES ZALISK
## Mémoire de Licence en Génie Informatique — Section 3.3.2.1
### Recensement exhaustif des 34 modèles Prisma et tables PostgreSQL

---

## 1. Tableau Récapitulatif Global

| N° | Modèle Prisma | Table PostgreSQL (`@@map`) | Domaine Fonctionnel | Nbr Champs | Catégorie | Description Métier Synthétique |
| :-: | :--- | :--- | :--- | :-: | :-: | :--- |
| 01 | `User` | `users` | Multi-Tenant & Utilisateurs | 34 | **1. Essentielle** | Compte utilisateur (collaborateur interne de l'entreprise ou client enregistré) |
| 02 | `Workspace` | `workspaces` | Multi-Tenant & Utilisateurs | 43 | **1. Essentielle** | Entreprise cliente / Espace SaaS racine isolant toutes les données métier (multi-tenant) |
| 03 | `WorkspaceInvitation` | `workspace_invitations` | Multi-Tenant & Utilisateurs | 18 | **1. Essentielle** | Invitation d'un nouveau collaborateur à rejoindre un espace de travail |
| 04 | `OutboxEvent` | `outbox_events` | Infrastructure Asynchrone | 17 | 3. Technique | Pattern Transactional Outbox pour publication d'événements vers les workers et Redis |
| 05 | `Membership` | `memberships` | Multi-Tenant & Utilisateurs | 11 | **1. Essentielle** | Association formelle d'un utilisateur à un espace de travail avec rôle (RBAC) et statut |
| 06 | `Session` | `sessions` | Infrastructure & Sécurité | 7 | 3. Technique | Session HTTP utilisateur pour l'authentification et le maintien de connexion |
| 07 | `OtpToken` | `otp_tokens` | Infrastructure & Sécurité | 11 | 3. Technique | Jeton temporaire à usage unique pour validation d'e-mail, login OTP ou mot de passe |
| 08 | `PendingRegistration` | `pending_registrations` | Infrastructure & Sécurité | 11 | 3. Technique | Stockage temporaire de pré-inscription en attente de vérification du code OTP |
| 09 | `OnboardingDraft` | `onboarding_drafts` | Infrastructure & Sécurité | 7 | 3. Technique | Sauvegarde temporaire de l'état du formulaire d'onboarding lors de la création d'espace |
| 10 | `WhatsAppConnection` | `whatsapp_connections` | Canaux & Intégrations | 11 | *2. Secondaire* | Paramètres de synchronisation et jetons du canal WhatsApp Cloud API |
| 11 | `AgentProfile` | `agent_profiles` | Organisation SAV & Compétences | 15 | **1. Essentielle** | Profil opérationnel d'un conseiller SAV (disponibilité, capacité max, charge actuelle) |
| 12 | `Skill` | `skills` | Organisation SAV & Compétences | 8 | **1. Essentielle** | Référentiel des compétences techniques, linguistiques et métiers du service SAV |
| 13 | `AgentSkill` | `agent_skills` | Organisation SAV & Compétences | 8 | **1. Essentielle** | Attribution d'une compétence certifiée à un agent avec niveau de maîtrise (1 à 5) |
| 14 | `Ticket` | `tickets` | Conversations & Tickets SAV | 27 | **1. Essentielle** | Ticket formel de support SAV avec suivi de cycle de vie, priorité et respect des SLA |
| 15 | `TicketAssignment` | `ticket_assignments` | Conversations & Tickets SAV | 11 | **1. Essentielle** | Affectation opérationnelle et historique d'un ticket à un agent du service |
| 16 | `TicketShare` | `ticket_shares` | Conversations & Tickets SAV | 10 | **1. Essentielle** | Partage collaboratif d'un ticket entre agents pour entraide (lecture ou contribution) |
| 17 | `TicketActivity` | `ticket_activities` | Conversations & Tickets SAV | 8 | **1. Essentielle** | Journal d'audit horodaté des événements et changements d'états d'un ticket |
| 18 | `Conversation` | `conversations` | Conversations & Tickets SAV | 19 | **1. Essentielle** | Fil de discussion omnicanal temps réel initié par un client (anonyme ou authentifié) |
| 19 | `ConversationMessage` | `conversation_messages` | Conversations & Tickets SAV | 10 | **1. Essentielle** | Message unitaire d'un fil de conversation (client, agent, note interne, système) |
| 20 | `ConversationShare` | `conversation_shares` | Conversations & Tickets SAV | 9 | **1. Essentielle** | Partage collaboratif d'une conversation en cours avec un autre agent |
| 21 | `AuditLog` | `audit_logs` | Infrastructure & Sécurité | 11 | 3. Technique | Journal technique d'audit de sécurité et traçabilité des actions sensibles (IP, User-Agent) |
| 22 | `Establishment` | `establishments` | Organisation SAV & Compétences | 24 | **1. Essentielle** | Succursale, agence physique ou point de service rattaché à l'entreprise cliente |
| 23 | `Subscription` | `subscriptions` | Gestion Commerciale & Abonnements | 19 | **1. Essentielle** | Contrat d'abonnement SaaS de l'entreprise (plan, statut, quotas, échéances) |
| 24 | `SubscriptionIntent` | `subscription_intents` | Gestion Commerciale & Abonnements | 19 | **1. Essentielle** | Intention formelle d'achat, renouvellement, surclassement ou rétrogradation |
| 25 | `PaymentAttempt` | `payment_attempts` | Gestion Commerciale & Abonnements | 17 | **1. Essentielle** | Tentative d'exécution de paiement initiée auprès de la passerelle SasPay |
| 26 | `ProviderPaymentReceipt` | `provider_payment_receipts` | Gestion Commerciale & Abonnements | 27 | *2. Secondaire* | Reçu brut émis par la passerelle de paiement avant réconciliation métier |
| 27 | `ProviderReceiptEvent` | `provider_receipt_events` | Infrastructure & Paiement | 17 | 3. Technique | Événement brut de cycle de vie d'un reçu fournisseur (SasPay/Stripe) |
| 28 | `PaymentTransaction` | `payment_transactions` | Gestion Commerciale & Abonnements | 20 | **1. Essentielle** | Transaction financière confirmée et comptabilisée, appliquée à l'abonnement |
| 29 | `ProviderReceiptAuditLog` | `provider_receipt_audit_logs` | Infrastructure & Paiement | 10 | 3. Technique | Traçabilité technique des opérations sur les reçus de paiement |
| 30 | `QuarantinedWebhookPayload` | `quarantined_webhook_payloads` | Infrastructure Asynchrone | 9 | 3. Technique | Payloads de webhooks rejetés ou corrompus placés en quarantaine pour investigation |
| 31 | `SubscriptionHistoryLog` | `subscription_history_logs` | Gestion Commerciale & Abonnements | 13 | *2. Secondaire* | Journal d'historique des changements de statut d'un abonnement |
| 32 | `ProcessedWebhookEvent` | `processed_webhook_events` | Infrastructure Asynchrone | 6 | 3. Technique | Idempotence et déduplication des webhooks entrants de prestataires tiers |
| 33 | `CommercialDowngradeRequest` | `commercial_downgrade_requests` | Gestion Commerciale & Abonnements | 22 | *2. Secondaire* | Demande programmée de rétrogradation d'abonnement avec audit de quotas |
| 34 | `ConsumedFinancialProof` | `consumed_financial_proofs` | Gestion Commerciale & Abonnements | 13 | *2. Secondaire* | Preuve cryptographique financière consommée (idempotence anti-double paiement) |

---

## 2. Répartition par Catégorie Métier

### Catégorie 1 : Classes Métier Essentielles (19 modèles)
Ces modèles incarnent les concepts centraux de l'activité du SAV omnicanal et de la facturation. **Ils constituent le périmètre exclusif du diagramme de classes UML principal.**
- **Multi-Tenant & Utilisateurs (4) :** `Workspace`, `User`, `Membership`, `WorkspaceInvitation`.
- **Conversations & Tickets SAV (7) :** `Conversation`, `ConversationMessage`, `Ticket`, `TicketAssignment`, `TicketShare`, `ConversationShare`, `TicketActivity`.
- **Organisation SAV & Compétences (4) :** `AgentProfile`, `Skill`, `AgentSkill`, `Establishment`.
- **Gestion Commerciale & Abonnements (4) :** `Subscription`, `SubscriptionIntent`, `PaymentAttempt`, `PaymentTransaction`.

### Catégorie 2 : Classes Métier Secondaires / Extension (5 modèles)
Ces modèles gèrent des processus d'extension spécialisés (synchronisation externe ou dégradation programmée). Ils peuvent faire l'objet de diagrammes de sous-domaines dédiés :
- `CommercialDowngradeRequest` : Demande programmée de rétrogradation d'offre.
- `ConsumedFinancialProof` : Preuve cryptographique financière consommée (idempotence).
- `SubscriptionHistoryLog` : Historique des renouvellements et états d'abonnements.
- `ProviderPaymentReceipt` : Reçu brut émis par SasPay/Stripe avant conciliation.
- `WhatsAppConnection` : Configuration du connecteur WhatsApp Cloud API.

### Catégorie 3 : Classes Techniques & Infrastructurelles (10 modèles - Exclues du diagramme)
Ces entités relèvent de la mécanique système, de la sécurité d'accès éphémère ou du transport asynchrone. **Elles sont formellement exclues du diagramme de classes conceptuel :**
- `Session`, `OtpToken`, `PendingRegistration`, `OnboardingDraft` (Sécurité et formulaires transitoires).
- `OutboxEvent`, `ProcessedWebhookEvent`, `QuarantinedWebhookPayload` (Messagerie asynchrone, bus Redis, idempotence).
- `AuditLog`, `ProviderReceiptEvent`, `ProviderReceiptAuditLog` (Journaux techniques d'infrastructure).
