# JUSTIFICATION DE LA SÉLECTION DES CLASSES MÉTIER
## Mémoire de Licence en Génie Informatique — Section 3.3.2.1
### Arbitrage académique et séparation des préoccupations (SoC)

---

## 1. Critères de Sélection des Classes

Dans un mémoire universitaire en Génie Informatique, un diagramme de classes a pour vocation de modéliser la **logique métier et conceptuelle du système**, et non d'exposer la tuyauterie technique d'un framework ou de pilotes d'infrastructure.

Conformément aux directives de Robert C. Martin (*Clean Architecture*) et aux standards de l'OMG UML 2.5 :
1. **Périmètre Métier Principal :** Modéliser les concepts fondamentaux qui portent la valeur ajoutée de la solution SAV multi-entreprises.
2. **Exclusion de l'Infrastructure Technique :** Écarter les artefacts éphémères (jetons OTP, sessions d'authentification HTTP, files d'attente d'événements outbox, quarantaine webhooks).
3. **Clarté et Lisibilité :** Limiter le nombre de classes à un ensemble cohérent et intelligible (19 classes au lieu de 34 tables brutes) structuré en 4 packages fonctionnels.

---

## 2. Ventilation des Modèles par Domaine

### Package 1 : Multi-Tenant & Utilisateurs (4 classes)
- **`Workspace` :** L'entreprise cliente abonnée. Pivot absolu de l'architecture SaaS.
- **`User` :** L'identité globale d'un utilisateur.
- **`Membership` :** Classe d'association indispensable matérialisant l'adhésion d'un utilisateur à un espace avec son rôle RBAC (`Role`) et son état (`MembershipStatus`).
- **`WorkspaceInvitation` :** Processus formel de recrutement et d'onboarding sécurisé d'un membre.

### Package 2 : Conversations Omnicanales & Tickets SAV (7 classes)
- **`Conversation` :** Espace d'échange direct entre un client et l'entreprise (tchat web, messagerie).
- **`ConversationMessage` :** Les messages individuels du fil, avec distinction des notes internes (`INTERNAL_NOTE`).
- **`Ticket` :** L'entité centrale du support SAV : réclamation formelle horodatée soumise à SLA.
- **`TicketAssignment` :** L'affectation nominative du ticket à un conseiller SAV.
- **`TicketShare` :** Mécanisme d'entraide collaborative permettant de partager un ticket entre collègues.
- **`ConversationShare` :** Partage d'une conversation active pour transfert ou double écoute.
- **`TicketActivity` :** Piste d'audit horodatée de l'ensemble des événements survenus sur un ticket.

### Package 3 : Organisation SAV, Compétences & Établissements (4 classes)
- **`AgentProfile` :** Extension du conseiller gérant sa disponibilité en temps réel et sa capacité de traitement.
- **`Skill` :** Référentiel des compétences techniques et fonctionnelles.
- **`AgentSkill` :** Association quantifiée liant un agent à ses compétences certifiées.
- **`Establishment` :** Réseau des succursales et points de vente physiques de l'entreprise.

### Package 4 : Gestion Commerciale & Abonnements SasPay (4 classes)
- **`Subscription` :** Contrat SaaS de l'espace déterminant ses droits et limites.
- **`SubscriptionIntent` :** Intention formelle de paiement ou de migration d'offre.
- **`PaymentAttempt` :** Tentative d'exécution financière auprès de la passerelle SasPay.
- **`PaymentTransaction` :** Transaction financière confirmée et comptabilisée.

---

## 3. Modèles Exclus et Justification

| Modèle Exclu | Catégorie | Motif d'Exclusion du Diagramme Conceptuel |
| :--- | :--- | :--- |
| `Session` | Technique | Simple session de connexion Web/Cookie, sans valeur métier conceptuelle. |
| `OtpToken` | Technique | Jeton cryptographique éphémère d'une durée de vie de 10 minutes. |
| `PendingRegistration` | Technique | Cache de formulaire d'inscription avant vérification de code. |
| `OnboardingDraft` | Technique | Sauvegarde intermédiaire de l'état de l'interface graphique. |
| `OutboxEvent` | Infrastructure | Pattern technique *Transactional Outbox* pour publication vers Redis/Kafka. |
| `AuditLog` | Infrastructure | Journal système technique (adresse IP, user-agent). |
| `ProcessedWebhookEvent` | Infrastructure | Mécanisme d'idempotence pour déduplication d'appels API tiers. |
| `QuarantinedWebhookPayload` | Infrastructure | Table de quarantaine pour requêtes JSON malformées ou suspectes. |
| `ProviderReceiptEvent` | Technique | Événement brut d'infrastructure de paiement. |
| `ProviderReceiptAuditLog` | Technique | Audit technique interne du connecteur SasPay. |
| `_prisma_migrations` | Outil ORM | Table de contrôle interne de Prisma. |
