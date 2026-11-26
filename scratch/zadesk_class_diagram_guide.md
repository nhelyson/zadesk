# GUIDE EXPLICATIF DU DIAGRAMME DE CLASSES UML 2.x DE ZADESK
## Document d'accompagnement académique pour le Mémoire de Fin de Cycle

**Auteur :** Équipe d'Ingénierie & d'Architecture Logicielle Zadesk  
**Date :** Novembre 2026  
**Projet :** Plateforme SaaS Zadesk (SAV Omnicanal & Assistance IA)  
**Fichiers générés associés :**
- Source PlantUML : [zadesk_class_diagram.puml](file:///c:/Users/japhet/Downloads/zadesk/scratch/zadesk_class_diagram.puml)
- Rendu vectoriel SVG : [zadesk_class_diagram.svg](file:///c:/Users/japhet/Downloads/zadesk/scratch/zadesk_class_diagram.svg)
- Rendu haute résolution PNG : [zadesk_class_diagram.png](file:///c:/Users/japhet/Downloads/zadesk/scratch/zadesk_class_diagram.png)

---

## 1. INTRODUCTION ET DÉMARCHE DE CONCEPTION

Le diagramme de classes UML 2.x de Zadesk formalise la structure statique du système, la distribution des responsabilités métier, l'étanchéité du cloisonnement multi-tenant et les flux de traitement du service après-vente (SAV).

### Démarche méthodologique :
1. **Distinction formelle entre Schéma de Données et Diagramme de Classes :**  
   Contrairement à un schéma relationnel physique de base de données (entité-association / DDL), ce diagramme ne se contente pas de relier des clés primaires et étrangères. Il modélise de véritables **classes logicielles orientées objet**, comprenant :
   - Des attributs typés assortis de contraintes UML précises (`{unique}`, `{readOnly}`).
   - Des opérations métier concrètes issues des services backend (`workspaceService.js`, `agentService.js`, `assignmentEngine.js`, `publicCompanyController.js`).
   - Des relations typées selon la sémantique UML (compositions strictes, agrégations partagées, associations dirigées et dépendances d'usage).
2. **Cloisonnement Multi-Tenant au cœur de la modélisation :**  
   La classe centrale `Workspace` constitue la racine d'agrégation de toutes les données opérationnelles. Aucune entité métier (ticket, conversation, agence, document) ne peut exister indépendamment d'une organisation.
3. **Intégration transparente de l'Intelligence Artificielle (RAG) :**  
   Le module IA est intégré comme composant architectural de premier ordre, avec un stéréotype explicite `<<target>>` pour le différencier des composants actuellement en production dans PostgreSQL.

---

## 2. ANALYSE DÉTAILLÉE DES DOMAINES FONCTIONNELS

Le diagramme est compartimenté en **6 packages fonctionnels** cohérents :

```text
+--------------------------------------------------------------------------------------------------+
|                            ORGANISATION DES PACKAGES UML DE ZADESK                               |
+--------------------------------------------------------------------------------------------------+

  ┌──────────────────────────────────────────────┐    ┌──────────────────────────────────────────────┐
  │ DOMAINE 1 : GESTION DES ENTREPRISES          │    │ DOMAINE 2 : GESTION DES AGENTS               │
  │ • Workspace (Racine multi-tenant)            │    │ • AgentProfile (Disponibilité & capacité)    │
  │ • User (Identité universelle)                │    │ • Skill & AgentSkill (Compétences validées)  │
  │ • Membership (Liaison & Rôles RBAC)          │    │ • AssignmentEngine (Moteur d'attribution)    │
  │ • Establishment (Réseau d'agences)           │    └──────────────────────┬───────────────────────┘
  └──────────────────────┬───────────────────────┘                           │
                         │                                                   │ Affectation
                         │ Isolation multi-tenant                            │ & Traitement
                         ▼                                                   ▼
  ┌──────────────────────────────────────────────┐    ┌──────────────────────────────────────────────┐
  │ DOMAINE 3 : CLIENTS & DEMANDES SAV           │    │ DOMAINE 4 : GESTION DES CONVERSATIONS        │
  │ • Customer (Client / Demandeur)              │◄───┤ • Conversation (Fil d'échange omnicanal)     │
  │ • Ticket (Dossier technique formel & SLA)    │Lien│ • ConversationMessage (Messages & notes)     │
  │ • TicketActivity (Traçabilité des actions)   │    │ • WhatsAppConnection (Canal Meta Cloud)      │
  │ • TicketAssignment & TicketShare             │    └──────────────────────┬───────────────────────┘
  └──────────────────────┬───────────────────────┘                           │
                         │                                                   │ Assistance
                         │ Escalade d'incertitude                            │ & Suggestions
                         ▼                                                   ▼
  ┌──────────────────────────────────────────────┐    ┌──────────────────────────────────────────────┐
  │ DOMAINE 5 : ASSISTANCE INTELLIGENTE & RAG    │    │ DOMAINE 6 : ÉVÉNEMENTS & TRAÇABILITÉ         │
  │ • KnowledgeDocument (Manuels & Garanties)    │    │ • OutboxEvent (Transactional Outbox)         │
  │ • KnowledgeChunk (Vecteurs denses MongoDB)   │    │ • PulseEvent (Streaming SSE temps réel)      │
  │ • AiAssistantSupervisor (Inférence Llama)    │    │ • AuditLog (Audit de sécurité immuable)      │
  │ • AiConfiguration (Règles de marque & seuils)│    └──────────────────────────────────────────────┘
  └──────────────────────────────────────────────┘
```

### 2.1. Domaine 1 : Gestion des Entreprises & Multi-Tenant
- **`Workspace` (`<<entity>>`) :**  
  Représente l'entreprise cliente de Zadesk. Elle définit la frontière étanche de données, les règles de fonctionnement du SAV (délais `slaResponseHours` et `slaResolutionHours`), la visibilité sur l'annuaire public (`isPublic`), et la jauge capacitaire (`activeChats`).
- **`User` (`<<entity>>`) :**  
  Représente une personne physique dans le système. Un utilisateur possède une identité globale (`email`, `firstName`, `lastName`, `passwordHash`), indépendante des entreprises.
- **`Membership` (`<<entity>>`) :**  
  Table de liaison essentielle concrétisant le rattachement d'un `User` à un `Workspace`. Elle porte le rôle de l'utilisateur (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`) et son statut (`ACTIVE`, `SUSPENDED`, `ARCHIVED`). Un utilisateur peut ainsi être `OWNER` de son entreprise tout en étant `AGENT` dans une autre organisation partenaire.
- **`WorkspaceInvitation` (`<<entity>>`) :**  
  Gère le processus d'invitation d'un collaborateur par jeton sécurisé à usage unique avec date d'expiration.
- **`Establishment` (`<<entity>>`) :**  
  Modélise les agences physiques, centres de réparation SAV, boutiques relais ou entrepôts de l'entreprise au Congo (`Brazzaville`, `Pointe-Noire`, etc.). Permet de localiser géographiquement la prise en charge matérielle d'un appareil.

### 2.2. Domaine 2 : Gestion des Agents & Compétences
- **`AgentProfile` (`<<entity>>`) :**  
  Extension métier du profil d'un membre agissant comme conseiller SAV. Il stocke sa disponibilité opérationnelle (`AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE`), sa capacité de traitement simultané (`maxCapacity`, par défaut 10 tickets) et l'activation de l'affectation automatique (`autoAssignmentEnabled`).
- **`Skill` & `AgentSkill` (`<<entity>>`) :**  
  Modélise les compétences techniques requises (ex: "Électroménager", "Smartphones", "Facturation Mobile Money"). La classe d'association `AgentSkill` enregistre l'approbation formelle d'un manager (`validatedAt`, `validatedById`), empêchant l'attribution automatique de dossiers techniques pointus à un agent non qualifié.
- **`AssignmentEngine` (`<<service>>`) :**  
  Composant algorithmique déterministe (`assignmentEngine.js`). Il filtre les agents éligibles par compétence, calcule leur charge pondérée (`weightedLoad` selon les priorités `URGENT: 3`, `HIGH: 2`, `MEDIUM: 1`) et attribue le ticket au candidat le plus disponible.

### 2.3. Domaine 3 : Gestion des Clients & Demandes SAV (Tickets)
- **`Customer` (`<<concept>>`) :**  
  Représentation unifiée du client demandeur. Dans Zadesk, le client public ne crée pas de compte lourd avec mot de passe ; ses coordonnées (`phone`, `email`, `fullName`) sont agrégées dynamiquement au niveau des interactions pour construire sa fiche historique.
- **`Ticket` (`<<entity>>`) :**  
  Dossier technique formel d'assistance. Doté d'un numéro d'ordre unique (`ticketNumber`), d'une catégorie, d'une priorité (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) et d'un cycle de vie strict (`PENDING_ASSIGNMENT`, `OPEN`, `IN_PROGRESS`, `WAITING_CUSTOMER`, `RESOLVED`, `CLOSED`). Il trace la date butoir SLA et les horodatages effectifs de résolution et de clôture.
- **`TicketAssignment` (`<<entity>>`) :**  
  Historique immuable de chaque transfert ou affectation d'un ticket (`previousAgentId`, `newAgentId`, `reason`).
- **`TicketShare` (`<<entity>>`) :**  
  Permet à un agent titulaire de partager temporairement l'accès à un dossier avec un confrère (`READ_ONLY` ou `CONTRIBUTE`) avec date d'expiration optionnelle.
- **`TicketActivity` (`<<entity>>`) :**  
  Journal d'audit détaillé retraçant chaque note interne, changement d'état ou intervention sur le ticket.

### 2.4. Domaine 4 : Gestion des Conversations (Omnicanal)
- **`Conversation` (`<<entity>>`) :**  
  Fil d'échange en temps réel avec le client via le portail web (`PORTAL`) ou WhatsApp Business (`WHATSAPP`). Protégé par une empreinte de jeton SHA-256 (`publicTokenHash`). Une conversation peut être convertie en `Ticket` à tout moment d'un simple clic par l'agent.
- **`ConversationMessage` (`<<entity>>`) :**  
  Unité d'échange textuelle (`CUSTOMER`, `AGENT_REPLY`, `INTERNAL_NOTE`, `SYSTEM`). Le drapeau `isInternalNote: true` garantit la confidentialité des échanges entre collègues.
- **`WhatsAppConnection` (`<<entity>>`) :**  
  Liaison technique d'un compte WhatsApp Business Cloud API (WABA) à une organisation Zadesk.

### 2.5. Domaine 5 : Assistance Intelligente & RAG (Architecture Cible)
- **`KnowledgeDocument` (`<<entity, target>>`) :**  
  Représente un manuel technique, une notice de garantie ou une FAQ importée par l'entreprise.
- **`KnowledgeChunk` (`<<entity, target>>`) :**  
  Segment documentaire (500 à 1 000 tokens) enrichi de son vecteur d'embedding dense (dimension 1536) pour indexation dans MongoDB Atlas Vector Search.
- **`AiAssistantSupervisor` (`<<service, target>>`) :**  
  Orchestre l'inférence des modèles (famille Llama via Cloudflare Workers AI), applique le seuil de confiance ($0.82$) et déclenche l'escalade vers un agent humain (`WAITING_ASSIGNMENT`) en cas d'incertitude ou de détection de litige financier.
- **`AiConfiguration` (`<<entity, target>>`) :**  
  Paramètres propres à chaque organisation (ton de marque, registre de langue, mots-clés d'escalade, seuil financier de contestation).

### 2.6. Domaine 6 : Événements, Temps Réel & Traçabilité
- **`OutboxEvent` (`<<entity>>`) :**  
  Implémentation du pattern transactionnel Outbox garantissant la publication fiable des événements asynchrones sans risque de perte de données.
- **`PulseEvent` (`<<event>>`) :**  
  Structure de données éphémère diffusée en Server-Sent Events (SSE) aux navigateurs des agents pour animer le cockpit opérationnel en direct.
- **`AuditLog` (`<<entity>>`) :**  
  Registre immuable de traçabilité des opérations sensibles (suspensions de comptes, modifications de règles).

---

## 3. ANALYSE DES RELATIONS ET DES MULTIPLICITÉS

Le tableau suivant justifie rigoureusement les multiplicités et la sémantique de chaque relation :

| Relation | Type UML | Multiplicité | Justification métier et technique |
| :--- | :--- | :---: | :--- |
| `Workspace` *-- `Membership` | Composition | `1` vers `0..*` | Une adhésion n'a aucun sens sans son organisation. Si le Workspace est détruit, les adhésions sont supprimées en cascade. |
| `User` -- `Membership` | Association | `1` vers `0..*` | Un utilisateur peut exister sans organisation (ex: compte créé), ou adhérer à plusieurs organisations distinctes. |
| `Workspace` *-- `Establishment` | Composition | `1` vers `0..*` | Les agences physiques appartiennent exclusivement au patrimoine de l'entreprise. |
| `User` -- `AgentProfile` | Association | `1` vers `0..*` | Un utilisateur possède au plus un profil d'agent par organisation où il exerce ce rôle. |
| `Workspace` *-- `AgentProfile` | Composition | `1` vers `0..*` | Les paramètres opérationnels d'un agent (charge, disponibilité) sont strictement circonscrits à l'organisation. |
| `AgentProfile` *-- `AgentSkill` | Composition | `1` vers `0..*` | L'association de compétence dépend de l'existence de l'agent dans l'organisation. |
| `Skill` -- `AgentSkill` | Agrégation | `1` vers `0..*` | La compétence existe en tant que concept métier indépendamment du fait qu'un agent la possède ou non. |
| `Workspace` *-- `Ticket` | Composition | `1` vers `0..*` | Cloisonnement multi-tenant absolu : un ticket appartient à une et une seule entreprise. |
| `Customer` -- `Ticket` | Association | `1` vers `0..*` | Un client peut déposer zéro ou plusieurs demandes de SAV au fil du temps. |
| `AgentProfile` -- `Ticket` | Association dirigée | `0..1` vers `0..*` | Un ticket peut être non assigné (`PENDING_ASSIGNMENT`) ou pris en charge par un agent unique. |
| `Ticket` *-- `TicketActivity` | Composition | `1` vers `1..*` | Tout ticket possède au moins une activité (création) et son historique est détruit avec lui. |
| `Ticket` *-- `TicketAssignment` | Composition | `1` vers `0..*` | Les étapes d'attribution dépendent du cycle de vie du ticket. |
| `Ticket` *-- `TicketShare` | Composition | `1` vers `0..*` | Les délégations d'accès sont dépendantes du ticket source. |
| `Ticket` -- `Conversation` | Association | `0..1` vers `0..1` | Une conversation peut être promue en ticket formel ; le lien est alors bijectif et optionnel. |
| `Conversation` *-- `ConversationMessage` | Composition | `1` vers `1..*` | Les messages constituent l'essence même de la conversation (au moins le message initial). |
| `Workspace` *-- `WhatsAppConnection` | Composition | `1` vers `0..1` | Une organisation connecte au maximum un numéro WhatsApp professionnel officiel. |
| `Workspace` *-- `KnowledgeDocument` | Composition | `1` vers `0..*` | Les manuels et garanties du RAG sont la propriété stricte du tenant. |
| `KnowledgeDocument` *-- `KnowledgeChunk` | Composition | `1` vers `1..*` | Un document vectorisé est nécessairement scindé en un ou plusieurs segments sémantiques. |

---

## 4. DÉMARCATION ENTRE ÉLÉMENTS IMPLÉMENTÉS ET ARCHITECTURE CIBLE

Pour préserver l'honnêteté intellectuelle indispensable à la soutenance du mémoire universitaire, le tableau suivant explicite le statut de chaque composant :

| Composant du Diagramme | Statut dans Zadesk | Matérialisation dans le code source |
| :--- | :---: | :--- |
| `Workspace`, `User`, `Membership` | **Implémenté et opérationnel** | Modèles Prisma, `workspaceService.js`, `authService.js` |
| `Establishment` | **Implémenté et opérationnel** | Modèle Prisma `Establishment`, `establishmentController.js` |
| `AgentProfile`, `Skill`, `AgentSkill` | **Implémenté et opérationnel** | Tables Prisma, validation des profils dans `agentService.js` |
| `AssignmentEngine` | **Implémenté et opérationnel** | `backend/src/services/assignmentEngine.js` (Algorithme de charge pondérée) |
| `Ticket`, `TicketActivity`, `TicketAssignment` | **Implémenté et opérationnel** | Modèles Prisma, contrôleur `agentController.js`, `tickets/page.tsx` |
| `Conversation`, `ConversationMessage` | **Implémenté et opérationnel** | Modèles Prisma, `publicCompanyController.js`, `ConversationsView.tsx` |
| `OutboxEvent`, `PulseEvent` | **Implémenté et opérationnel** | `outboxDispatcher.js`, streaming SSE dans `pulseEventService.js` |
| `WhatsAppConnection` | **Partiellement implémenté** | Table Prisma, OAuth Meta fonctionnel, webhooks entrants à clore |
| `Customer` | **Conceptuel (Agrégé)** | Déduit dynamiquement des conversations et tickets dans `workspaceService.js` |
| `KnowledgeDocument`, `KnowledgeChunk` | **Architecture Cible (RAG)** | Non modélisé dans Prisma ; prévu pour la base documentaire MongoDB Atlas |
| `AiAssistantSupervisor`, `AiConfiguration` | **Architecture Cible (RAG)** | UI de préfiguration validée (`/app/ai`) ; inférence Cloudflare Workers AI cible |

---

## 5. ÉLÉMENTS VOLONTAIREMENT NON MODÉLISÉS DANS LE DIAGRAMME

Afin de respecter les canons académiques de la modélisation UML (qui privilégie la clarté conceptuelle par rapport à l'inventaire exhaustif des tables techniques), les éléments suivants ont été sciemment écartés :
1. **Les tables techniques de paiement (`Subscription`, `PaymentAttempt`, `ProviderPaymentReceipt`, etc.) :**  
   Bien que présentes dans le schéma Prisma pour la passerelle SasPay (Mobile Money), elles relèvent du sous-système de facturation SaaS et auraient inutilement surchargé le diagramme principal centré sur le cœur de métier SAV.
2. **Les jetons d'authentification temporaires (`OtpToken`, `PendingRegistration`, `Session`) :**  
   Ce sont des structures éphémères de sécurité protocolaire qui n'appartiennent pas au domaine métier permanent.
3. **Les composants d'infrastructure physique (Docker, Nginx, Redis, PostgreSQL) :**  
   Ces technologies relèvent du **Diagramme de Déploiement** et du **Diagramme de Composants**, et ne doivent jamais figurer comme des classes dans un diagramme de classes statique.

---

## 6. RECOMMANDATIONS POUR L'INSERTION DANS LE MÉMOIRE

- **Format Vectoriel privilégié :** Pour un mémoire rédigé sous LaTeX ou Word, insérer de préférence le fichier SVG [zadesk_class_diagram.svg](file:///c:/Users/japhet/Downloads/zadesk/scratch/zadesk_class_diagram.svg) ou le convertir en PDF vectoriel pour garantir une netteté absolue sans pixellisation, quelle que soit la résolution d'impression.
- **Format Image Bitmap :** Le fichier PNG haute résolution [zadesk_class_diagram.png](file:///c:/Users/japhet/Downloads/zadesk/scratch/zadesk_class_diagram.png) (dimensions $2800 \times 2100$ pixels) peut être directement inséré en orientation paysage sur une page dédiée (A4 ou A3).
- **Reproductibilité PlantUML :** Le fichier source [zadesk_class_diagram.puml](file:///c:/Users/japhet/Downloads/zadesk/scratch/zadesk_class_diagram.puml) peut être directement exécuté dans n'importe quel EDI (VSCode, IntelliJ) ou sur le serveur officiel PlantUML pour générer des vues partielles lors de la soutenance.
