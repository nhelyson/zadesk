# Architecture Fonctionnelle de la Plateforme Zadesk
**Section 3.2.2 du mémoire : « Architecture fonctionnelle et identification des acteurs »**

Ce dossier contient la modélisation fonctionnelle officielle de la plateforme SaaS Zadesk, conçue sous **PlantUML** selon la charte graphique éditoriale du projet et les exigences académiques d'une soutenance de licence en génie logiciel.

---

## 1. Contenu et Livrables du Dossier

| Fichier | Format | Description |
| :--- | :--- | :--- |
| [`architecture-fonctionnelle.puml`](./architecture-fonctionnelle.puml) | **Source PlantUML** | Code source descriptif modifiable, versionné, avec fond 100% transparent (`skinparam backgroundColor transparent`). |
| [`architecture-fonctionnelle.svg`](./architecture-fonctionnelle.svg) | **Vecteur SVG** | Export vectoriel haute fidélité sans rectangle de fond, idéal pour insertion nette et redimensionnable dans Microsoft Word ou LaTeX. |
| [`architecture-fonctionnelle.png`](./architecture-fonctionnelle.png) | **Matriciel PNG** | Prévisualisation haute définition avec véritable canal alpha (RGBA transparent), évitant tout cadre gris ou blanc sur la page du mémoire. |
| [`README.md`](./README.md) | **Documentation** | Présentation détaillée de l'architecture fonctionnelle, des 5 acteurs, des espaces et protocole de régénération. |

---

## 2. Organisation Fonctionnelle & Acteurs

Le diagramme représente fidèlement l'organisation du système telle que vérifiée et auditée dans le code source de l'application Zadesk (`backend/prisma/schema.prisma`, `backend/src/middleware/requireAuth.js`, `frontend/src/app`) :

### A. Les 5 Acteurs du Système

1. **Client (Consommateur / Grand Public)** : Acteur externe. Accède librement au portail public sur le Web sans avoir besoin de créer un compte utilisateur. Il consulte les entreprises certifiées, leurs horaires et succursales, dépose des réclamations avec pièces jointes et dialogue en direct via un tchat sécurisé par jeton temporaire.
2. **Conseiller SAV (`AGENT`)** : Acteur interne. Prend en charge les tickets qui lui sont affectés, dialogue en direct avec les clients, consulte l'historique et consigne des notes d'équipe confidentielles.
3. **Superviseur SAV (`MANAGER`)** : Acteur interne d'encadrement. Supervise les files d'attente, configure les compétences techniques des agents (`Skills`), administre les succursales physiques (`Agencies`) et réassigne les dossiers selon la charge active.
4. **Administrateur Entreprise (`ADMIN`)** : Acteur interne de gouvernance. Invite les collaborateurs, attribue les rôles RBAC, paramètre l'espace de travail et gère les intégrations.
5. **Propriétaire de l'Espace (`OWNER`)** : Acteur interne disposant des prérogatives suprêmes sur l'organisation (gestion de la souscription SasPay, changement de forfait SaaS, suppression ou transfert de propriété).

> **Note académique :** Le diagramme distingue explicitement chacun des quatre rôles internes afin de refléter la matrice de contrôle d'accès en vigueur (RBAC), sans les agréger artificiellement.

---

### B. Les Deux Espaces d'Accès

#### 1. Portail Public (Espace Web Client)
- **Annuaire des Entreprises** : Moteur de recherche des commerces certifiés avec filtrage sectoriel et géographique.
- **Vitrine & Informations Entreprise** : Présentation institutionnelle, engagements SLA, coordonnées, adresses et horaires des succursales (*si configurées par l'organisation*).
- **Soumission de Réclamation SAV** : Formulaire de demande d'assistance directe sans compte requis, recueil des pièces justificatives et diagnostic initial.
- **Tchat en Direct & Suivi** : Dialogue instantané en temps réel avec le service client, protégé par une session sur jeton temporaire cryptographique, et suivi d'état du dossier.

#### 2. Workspace Entreprise (Espace Collaboratif Multi-Tenant)
- **1. Gestion des Tickets SAV** : Numérotation unique (`TICK-ABC`), cycle de vie normé (`OPEN` → `IN_PROGRESS` → `RESOLVED`), surveillance stricte des SLA avec alertes, journal immuable d'activité (`TicketActivity`) et partage inter-agences (`TicketShare`).
- **2. Conversations Omnicanales** : Messagerie instantanée unifiée prenant en charge les flux entrants du portail, avec notes d'équipe internes et élévation directe en ticket SAV.
- **3. Équipe & Compétences** : Gestion de présence (`AVAILABLE`, `BUSY`, `AWAY`), plafonds de charge (`maxCapacity`), matrice des compétences techniques (`Skills`) et routage intelligent des réclamations.
- **4. Établissements & Succursales** *(Module optionnel selon l'activité de l'entreprise)* : Cartographie des succursales et ateliers SAV, rattachement géographique des conseillers.
- **5. Membres, Rôles & Accès** : Gestion du cycle de vie des collaborateurs, invitations sécurisées par courriel, attribution RBAC, journal d'audit (`AuditLog`), suspension réversible et révocation.
- **6. Paramètres & Abonnements** : Profil de l'entreprise, configuration des SLA, forfaits SaaS (Starter, Pro, Enterprise), facturation dématérialisée SasPay (Mobile Money / Cartes bancaires) et régulation dynamique des quotas d'usage.

---

### C. Composante Cible : Assistance IA & RAG (Supervisée)

Conformément à la réalité du développement, l'**Assistance IA & RAG** est rigoureusement identifiée comme une **composante cible en cours de déploiement** (distinguée graphiquement par une bordure en tirets terracotta `#EB6C36`) :
- **Ingestion & Recherche Vectorielle** : Découpage documentaire en segments (*chunks*), indexation vectorielle et interrogation sémantique de la base de connaissances interne.
- **Brouillons de Réponse Contextualisés** : Proposition de réponses pré-rédigées aux conseillers SAV via un LLM (Llama).
- **Règles Strictes d'Escalade Humaine Immédiate (Obligatoire)** :
  1. Détection automatique d'irritation ou d'insatisfaction client.
  2. Litige ou contestation financière dépassant le seuil de **50 000 XAF**.
  3. Demande explicite de prise en charge par un conseiller humain.
- **Principe de Supervision Permanente** : Aucune réponse autonome non validée par un agent humain n'est expédiée au client (contrôle continu du score de confiance).

---

## 3. Protocole de Régénération

Le rendu s'appuie sur le JAR PlantUML et le moteur Graphviz (`dot`).

### Commande de génération standard

Ouvrez un terminal PowerShell ou Bash et exécutez :

```powershell
# 1. Génération de l'export vectoriel SVG (fond transparent)
java -jar "C:\Users\japhet\Downloads\plantuml-1.2026.10.jar" -tsvg "diagrammes/architecture_fonctionnelle/architecture-fonctionnelle.puml"

# 2. Génération de l'aperçu PNG (canal alpha RGBA transparent)
java -jar "C:\Users\japhet\Downloads\plantuml-1.2026.10.jar" -tpng "diagrammes/architecture_fonctionnelle/architecture-fonctionnelle.puml"
```

*Note : Si la commande `java` par défaut de votre système est une version antérieure ou incompatible, pointez directement vers le JDK 21 vérifié :*
```powershell
& "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot\bin\java.exe" -jar "C:\Users\japhet\Downloads\plantuml-1.2026.10.jar" -tsvg "diagrammes/architecture_fonctionnelle/architecture-fonctionnelle.puml"
& "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot\bin\java.exe" -jar "C:\Users\japhet\Downloads\plantuml-1.2026.10.jar" -tpng "diagrammes/architecture_fonctionnelle/architecture-fonctionnelle.puml"
```

---

## 4. Intégration dans le Mémoire (Microsoft Word)

1. Ouvrez Microsoft Word à la section **3.2.2 Architecture fonctionnelle et identification des acteurs**.
2. Cliquez sur **Insertion > Images > Cet appareil...** et sélectionnez `architecture-fonctionnelle.png` (ou `architecture-fonctionnelle.svg`).
3. Le fond transparent garantit une intégration naturelle et fluide sur les pages A4 du mémoire, sans bordure parasite ni rectangle gris.
4. Insérez la légende normalisée sous l'illustration :

> **Figure 3.X : Architecture fonctionnelle de la plateforme Zadesk.**
