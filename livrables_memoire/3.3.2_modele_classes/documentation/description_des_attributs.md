# DESCRIPTION DES ATTRIBUTS DU MODÈLE DE CLASSES
## Mémoire de Licence en Génie Informatique — Section 3.3.2.1
### Typage, contraintes et sémantique métier

---

## 1. Conventions Typographiques UML
- **Visibilité :** Tous les attributs métier sont modélisés avec la visibilité publique (`+`) ou protégée conformément aux standards de modélisation relationnelle.
- **Types élémentaires :**
  - `String` : Représente les chaînes textuelles (identifiants CUID/UUID, libellés, adresses e-mail).
  - `Int` / `Integer` : Compteurs, entiers et niveaux de maîtrise.
  - `Boolean` : Indicateurs binaires (`isActive`, `isAnonymous`, `verified`).
  - `DateTime` : Horodatages normalisés ISO-8601 avec fuseau horaire UTC.
  - `Decimal` : Montants financiers exacts (`numeric(12,2)`) sans imprécision de virgule flottante.
  - `Enum` : Types énumérés fermés garantissant l'intégrité des statuts et priorités.

---

## 2. Attributs Clés par Classe Métier

### 2.1 Workspace
- `+ id: String [PK]` : Identifiant unique de l'entreprise cliente.
- `+ name: String` : Raison sociale de l'entreprise.
- `+ slug: String [UNIQUE]` : Identifiant textuel d'URL pour le portail public SAV.
- `+ allowAnonymousTickets: Boolean` : Droit accordé aux visiteurs de soumettre des réclamations sans compte préalable.
- `+ timezone: String` : Fuseau horaire de référence pour le calcul des heures d'ouverture et des SLA.
- `+ maxActiveTicketsPerAgent: Int` : Seuil de saturation configuré pour l'attribution automatique.

### 2.2 User
- `+ id: String [PK]` : Identifiant unique du compte utilisateur.
- `+ email: String [UNIQUE]` : Adresse e-mail professionnelle ou personnelle.
- `+ fullName: String` : Nom complet de la personne.
- `+ role: String` : Rôle par défaut de la plateforme.
- `+ isEmailVerified: Boolean` : État de vérification de l'adresse de contact.

### 2.3 Membership
- `+ id: String [PK]` : Identifiant de l'adhésion.
- `+ role: Role` : Rôle RBAC au sein du Workspace (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`).
- `+ status: MembershipStatus` : État de l'accès (`ACTIVE`, `SUSPENDED`, `ARCHIVED`).
- `+ joinedAt: DateTime` : Date d'intégration effective dans l'équipe.

### 2.4 Ticket
- `+ id: String [PK]` : Identifiant interne du ticket.
- `+ ticketNumber: String [UNIQUE]` : Référence formelle publique (`TICK-YYYYMMDD-XXXX`).
- `+ title: String` : Intitulé résumé de la réclamation client.
- `+ description: String` : Exposé détaillé du problème rencontré.
- `+ priority: TicketPriority` : Gravité (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- `+ status: TicketStatus` : Phase de traitement (`PENDING_ASSIGNMENT`, `OPEN`, `IN_PROGRESS`, etc.).
- `+ resolutionDeadline: DateTime?` : Échéance maximale d'engagement de service (SLA).
- `+ resolvedAt: DateTime?` : Date et heure réelles de résolution.

### 2.5 Conversation
- `+ id: String [PK]` : Identifiant unique du canal de discussion.
- `+ sessionToken: String [UNIQUE]` : Jeton cryptographique de session pour le tchat web anonyme.
- `+ customerName: String?` : Nom déclaré par le visiteur.
- `+ status: ConversationStatus` : État d'attente ou d'échange (`WAITING_ASSIGNMENT`, `ACTIVE`, etc.).
- `+ lastMessageAt: DateTime` : Horodatage du dernier message échangé.

### 2.6 AgentProfile
- `+ id: String [PK]` : Identifiant du profil de conseiller.
- `+ availability: AgentAvailability` : Présence instantanée (`AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE`).
- `+ maxConcurrentTickets: Int` : Quota d'absorption de dossiers simultanés.
- `+ currentTicketsCount: Int` : Nombre réel de dossiers en cours de traitement.

### 2.7 Subscription
- `+ id: String [PK]` : Identifiant du contrat commercial.
- `+ plan: PlanType` : Formule souscrite (`DECOUVERTE`, `STARTER`, `PRO`, `ENTREPRISE`).
- `+ status: SubscriptionStatus` : État d'activité (`ACTIVE`, `RENEWAL_DUE`, `EXPIRED`, etc.).
- `+ currentPeriodStart: DateTime` : Début de la période de facturation en cours.
- `+ currentPeriodEnd: DateTime` : Date d'échéance du forfait.
- `+ maxAgents: Int` : Nombre d'utilisateurs internes autorisés.
