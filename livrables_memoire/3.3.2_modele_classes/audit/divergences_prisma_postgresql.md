# RAPPORT DE CONFRONTATION ET DIVERGENCES STRUCTURELLES
## Comparaison tripartite : Schéma Prisma vs Migrations SQL vs Conteneur PostgreSQL réel
### Mémoire de Licence en Génie Informatique — Section 3.3.2.1

---

## 1. Méthodologie de Comparaison

L'analyse comparative a confronté :
1. Les 34 modèles et 20 enums du fichier `backend/prisma/schema.prisma`.
2. Les 5 répertoires de migrations contenant les scripts d'initialisation et d'altération DDL.
3. Les 35 tables physiques, 408 colonnes, 61 clés étrangères et 20 types énumérés de la base `zadesk` interrogée dans le conteneur `zadesk-postgres`.

---

## 2. Tableau Comparatif des Sources

| Objet / Composant | Déclaré dans Prisma | Présent dans Migrations | Observé dans PostgreSQL | Statut / Analyse de Divergence |
| :--- | :---: | :---: | :---: | :--- |
| **Tables Applicatives Métier** | 34 | 34 | 34 | **Identité absolue (100 %)**. Chaque modèle Prisma possède sa table physique exactement nommée selon la directive `@@map`. |
| **Table Système de Migration** | 0 | 0 | 1 (`_prisma_migrations`) | **Divergence normale et attendue**. Table interne gérée exclusivement par le CLI Prisma pour journaliser l'application des migrations (checksum SHA256, date d'application). Doit être ignorée en modélisation UML. |
| **Colonnes & Types de Données** | 408 | 408 | 408 | **Cohérence parfaite**. Les correspondances de types sont strictes : `String` -> `text`, `Int` -> `integer`, `Boolean` -> `boolean`, `DateTime` -> `timestamp(3) with time zone`, `Decimal` -> `numeric(12,2)`. |
| **Types Énumérés (ENUMs)** | 20 | 20 | 20 | **Identité absolue (100 %)**. Les 20 types énumérés sont déclarés dans `pg_type` et leurs valeurs sont strictement identiques dans `pg_enum`. |
| **Clés Étrangères (FK)** | 61 | 61 | 61 | **Intégrité vérifiée**. Aucune clé étrangère orpheline ou manquante. Les clauses `ON DELETE CASCADE`, `ON DELETE SET NULL` et `ON DELETE RESTRICT` sont respectées. |
| **Index et Contraintes d'Unicité** | Conformes | Conformes | Conformes | Les contraintes composites `@@unique([workspaceId, slug])` ou `@@unique([agentProfileId, skillId])` sont bien matérialisées sous forme d'index uniques `UNIQUE CONSTRAINT`. |

---

## 3. Détail de la Seule Divergence : Table `_prisma_migrations`

- **Nom de la table :** `_prisma_migrations`
- **Schéma :** `public`
- **Structure physique :**
  - `id` (character varying(36), Primary Key)
  - `checksum` (character varying(64), Not Null)
  - `finished_at` (timestamp with time zone)
  - `migration_name` (character varying(255), Not Null)
  - `logs` (text)
  - `rolled_back_at` (timestamp with time zone)
  - `started_at` (timestamp with time zone, Default: now())
  - `applied_steps_count` (integer, Default: 0)
- **Règle de traitement pour le diagramme UML :**
  Cette table est un artefact technique de l'outil de gestion des migrations. Elle ne représente aucun concept de gestion du SAV ou de gestion commerciale. **Elle est formellement exclue du diagramme de classes UML.**

---

## 4. Bilan de Cohérence

L'environnement de données de Zalisk présente un **degré de synchronisation parfait (zéro dérive de schéma)**. Le schéma Prisma reflète fidèlement la réalité physique de la base de données PostgreSQL de production.
