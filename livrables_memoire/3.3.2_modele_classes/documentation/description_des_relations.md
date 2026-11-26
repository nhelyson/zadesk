# DESCRIPTION SÉMANTIQUE DES RELATIONS UML
## Mémoire de Licence en Génie Informatique — Section 3.3.2.2
### Typologie des liens : Associations, Compositions et Dépendances Métier

---

## 1. Composition forte : Cycle de Vie et Propriété Stricte

Dans Zalisk, la plupart des entités de support appartiennent corps et âme à leur espace de travail (`Workspace`). 
En UML 2.5, la relation de **composition** (losange plein `*--`) est rigoureusement justifiée par :
1. Une dépendance existentielle : l'entité fille ne peut exister sans son conteneur parent.
2. La règle physique d'intégrité `ON DELETE CASCADE` dans PostgreSQL.

### Exemples majeurs de Composition :
- **`Workspace *-- Membership` (1 vers 0..*) :** L'espace compose ses membres. La suppression de l'espace entraîne l'anéantissement de tous ses liens de membership.
- **`Workspace *-- Ticket` (1 vers 0..*) :** Un ticket est un document d'entreprise scellé dans le tenant.
- **`Workspace *-- Conversation` (1 vers 0..*) :** Un fil de discussion appartient à l'entreprise sollicitée.
- **`Conversation *-- ConversationMessage` (1 vers 1..*) :** Les messages composent structurellement le fil.
- **`Ticket *-- TicketAssignment` (1 vers 0..*) :** Les affectations sont les étapes de vie du ticket.
- **`Ticket *-- TicketActivity` (1 vers 0..*) :** L'historique d'audit est indissociable du ticket.
- **`Subscription *-- SubscriptionIntent` (1 vers 0..*) :** Les intentions d'achat appartiennent au contrat.

---

## 2. Associations Simples et Multi-Tenant

Les relations transversales où les entités conservent leur indépendance sont modélisées par des **associations simples** :
- **`User -- Membership` (1 vers 0..*) :** L'utilisateur est lié à ses adhésions. La suppression d'un utilisateur supprime ses adhésions, mais la suppression d'une adhésion ne détruit pas le compte utilisateur.
- **`User -- Ticket` (0..1 vers 0..*) :** Un ticket peut référencer un compte client enregistré (`customerId`). Si le compte est supprimé, la règle `ON DELETE SET NULL` préserve le ticket SAV avec `customerId = NULL` pour des raisons légales et comptables.
- **`Conversation -- Ticket` (0..1 vers 0..1) :** Élévation d'une conversation en ticket. Il s'agit d'une association optionnelle bijective : une conversation peut donner lieu à 0 ou 1 ticket formel, et un ticket peut provenir d'une conversation ou avoir été créé directement par formulaire web.

---

## 3. Matrice d'Attribution des Compétences (Skills)

La modélisation du routage intelligent des tickets repose sur un modèle en étoile :
- `Skill` définit la compétence théorique (ex: "Facturation", "Niveau 2 Réseau").
- `AgentProfile` représente le conseiller.
- `AgentSkill` est l'entité d'association quantifiée :
  - `AgentProfile 1 *-- 0..* AgentSkill` (Composition : si le profil est supprimé, ses compétences affectées disparaissent).
  - `Skill 1 -- 0..* AgentSkill` (Association : la suppression d'une compétence dans le catalogue doit être contrôlée).
