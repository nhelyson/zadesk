# AUDIT TECHNOLOGIQUE DE LA PLATEFORME ZADESK
## Préparation de la section 2.7.2 – Technologies de développement (Mémoire Universitaire)

**Auteur :** Équipe d'Ingénierie & d'Architecture Logicielle Zadesk  
**Date d'audit :** Novembre 2026  
**Projet :** Zadesk (anciennement Zalisk)  
**Environnement analysé :** Monorepo de développement et conteneurisation Docker (`c:\Users\japhet\Downloads\zadesk`)  
**Nature du document :** Audit exhaustif des choix technologiques, analyse des dépendances, validation des statuts d'intégration et spécification de l'architecture cible IA / RAG.

---

## SOMMAIRE

- [A. Synthèse de l'Environnement Technologique](#a-synthèse-de-lenvironnement-technologique)
- [B. Tableau Général des Technologies](#b-tableau-général-des-technologies)
- [C. Analyse Détaillée par Catégorie](#c-analyse-détaillée-par-catégorie)
  - [1. Frontend et Expérience Utilisateur](#1-frontend-et-expérience-utilisateur)
  - [2. Backend et Couche API](#2-backend-et-couche-api)
  - [3. Persistance des Données et ORM](#3-persistance-des-données-et-orm)
  - [4. Traitement Asynchrone, Événements et Temps Réel](#4-traitement-asynchrone-événements-et-temps-réel)
  - [5. Infrastructure, Conteneurisation et Reverse Proxy](#5-infrastructure-conteneurisation-et-reverse-proxy)
  - [6. Sécurité, Contrôle d'Accès et Cryptographie](#6-sécurité-contrôle-daccès-et-cryptographie)
  - [7. Services Externes et Passerelles Métier](#7-services-externes-et-passerelles-métier)
- [D. Architecture Technologique Cible de l'IA et du RAG](#d-architecture-technologique-cible-de-lia-et-du-rag)
- [E. Technologies Complémentaires et Ergonomiques](#e-technologies-complémentaires-et-ergonomiques)
- [F. Recommandations et Points d'Arbitrage pour le Mémoire](#f-recommandations-et-points-darbitrage-pour-le-mémoire)

---

## A. SYNTHÈSE DE L'ENVIRONNEMENT TECHNOLOGIQUE

### A.1. Vocation du produit et contraintes opérationnelles
Zadesk est une plateforme SaaS (Software as a Service) d'assistance clientèle et de service après-vente (SAV) omnicanal conçue pour les entreprises, PME et institutions de la zone CEMAC (Afrique Centrale : Congo, Cameroun, Gabon, RDC, Tchad, RCA).

Les spécificités du contexte d'exploitation imposent des choix d'ingénierie stricts :
1. **Connectivité mobile et résilience réseau :** Priorité aux flux légers, au rendu côté serveur (SSR), à l'architecture Progressive Web App (PWA) et à la compatibilité avec des réseaux mobiles hétérogènes (3G/4G).
2. **Omnicanalité africaine :** Intégration prioritaire de WhatsApp Business (canal de prédilection de la région), du Mobile Money (Airtel Money, MTN MoMo via l'agrégateur SasPay), et des notifications SMS transactionnelles locales (Zavu).
3. **Multi-tenant absolu :** Isolation stricte des données entre les différentes organisations clientes (Workspaces), garantissant l'étanchéité hermétique des conversations, tickets, clients, statistiques et futures bases documentaires.

### A.2. Typologie architecturale : Monolithe Modulaire Conteneurisé
Zadesk ne suit ni le modèle d'un monolithe désordonné ni la dispersion prématurée de micro-services indépendants. L'architecture adoptée est celle d'un **Monolithe Modulaire Conteneurisé** appuyé sur des services périphériques spécialisés :

```text
                                  [ CLIENTS ]
                               (Navigateurs Web,
                             Mobiles PWA, Webhooks)
                                      │
                                  Port 80/443
                                      ▼
                        ┌───────────────────────────┐
                        │       NGINX REVERSE       │
                        │      PROXY (Alpine)       │
                        └─────────────┬─────────────┘
                                      │
                      ┌───────────────┴───────────────┐
         HTTP / (SSR / Static)                 HTTP /api/* (REST & SSE)
                      ▼                               ▼
       ┌─────────────────────────────┐ ┌─────────────────────────────┐
       │     FRONTEND APPLICATION    │ │     BACKEND APPLICATION     │
       │    Next.js 15.1 (Node 22)   │ │    Express 4.21 (Node 22)   │
       │     React 19 / TypeScript   │ │      Zod / Architecture     │
       │   Tailwind / Motion / GSAP  │ │   Controller-Service-Repo   │
       └─────────────────────────────┘ └──────────────┬──────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
        ┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐
        │     BASE RELATIONNELLE      ││     CACHE & BROKER FAST     ││       WORKER ASYNCHRONE     │
        │        PostgreSQL 16        ││           Redis 7           ││      Zadesk-Worker (Node)   │
        │      (Prisma ORM 6.4)       ││    (ioredis / Pub-Sub)      ││   (BullMQ 6 / Outbox Loop)  │
        └─────────────────────────────┘└─────────────────────────────┘└─────────────────────────────┘
                                                      │ (Futur RAG)
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │   DOCUMENT & VECTOR STORE   │
                                       │    MongoDB / Atlas Vector   │
                                       │   (Prévue architecture RAG) │
                                       └─────────────────────────────┘
```

### A.3. Principes directeurs d'ingénierie
- **Séparation stricte Frontend / Backend :** Le frontend Next.js 15 consomme l'API REST Express via des cookies de session HTTP-Only sécurisés.
- **Pattern Transactionnel Outbox :** Les événements critiques (ex: notification, affectation, synchronisation) sont persistés dans la table PostgreSQL `OutboxEvent` au sein de la transaction métier, puis dépilés de manière asynchrone par `BullMQ` pour garantir le traitement *at-least-once* sans perte de données.
- **Flux Temps Réel par Server-Sent Events (SSE) :** Le service `pulseEventService.js` diffuse les événements de discussion en temps réel via SSE et Redis Pub/Sub, évitant la surcharge et la fragilité des WebSockets bi-directionnels tout en traversant parfaitement les proxies d'entreprise et firewalls mobiles.
- **Délégation d'infrastructure à Docker :** L'ensemble de la pile s'exécute dans un réseau interne privé (`zadesk-network`), seul Nginx exposant ses ports vers l'extérieur.

---

## B. TABLEAU GÉNÉRAL DES TECHNOLOGIES

### Taxonomie des 5 statuts d'intégration :
1. `Implémentée et opérationnelle` : Présente dans le code, configurée, testée et active dans l'environnement actuel.
2. `Implémentée partiellement` : Présente dans le code, mais dont certaines fonctionnalités ne sont pas encore totalement déployées, connectées ou exploitées en production.
3. `Configurée, mais non vérifiée en production` : Déclarée et paramétrée dans les fichiers de configuration, mais dont l'usage réel en production reste à valider ou dépend de tiers.
4. `Prévue dans l'architecture cible` : Retenue conceptuellement pour l'architecture future, documentée, mais non encore implémentée dans le code source.
5. `À définir` : Domaine technologique nécessaire dont l'outil, le modèle ou le fournisseur exact fait encore l'objet d'un arbitrage technique.

| Catégorie | Technologie | Version / Spécification | Rôle dans Zadesk | État d'intégration | Justification technique |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Next.js | 15.1.6 (App Router) | Framework d'application React, SSR, routage modulaire et compilation standalone | `Implémentée et opérationnelle` | `frontend/package.json`, `next.config.ts`, Dockerfile multi-stage |
| **Frontend** | React | 19.0.0 | Bibliothèque d'interface utilisateur, Hooks, Concurrent Mode et composants serveur | `Implémentée et opérationnelle` | `frontend/package.json`, composants `src/app` |
| **Frontend** | TypeScript | 5.7.3 | Typage statique strict, modèles de données d'interface, sécurité au build | `Implémentée et opérationnelle` | `frontend/tsconfig.json`, `strict: true` |
| **Frontend** | Tailwind CSS | 3.4.17 | Moteur de styles utilitaires, design system atomique, gestion responsive et mode sombre | `Implémentée et opérationnelle` | `frontend/tailwind.config.ts`, `globals.css` |
| **Frontend** | Motion (Framer) | 14.14.0 | Gestion des animations déclaratives de composants, transitions d'état d'interface | `Implémentée et opérationnelle` | Utilisé dans la navigation et les tiroirs |
| **Frontend** | GSAP | 3.15.1 | Bibliothèque d'animation cinématique haut de gamme pour les séquences d'accueil | `Implémentée partiellement` | Installée dans `package.json`, intégration progressive sur les entrées d'écran |
| **Frontend** | Three.js | 0.187.0 | Moteur de rendu 3D WebGL pour visualisations spatiales | `Implémentée partiellement` | Dépendance installée avec `@types/three`, réservée aux canevas graphiques |
| **Frontend** | Lucide React | 0.475.0 | Bibliothèque iconographique cohérente et légère | `Implémentée et opérationnelle` | Omniprésente dans les pages et composants |
| **Frontend** | Progressive Web App (PWA) | Service Worker + Manifest | Installation mobile plein écran, mise en cache des assets, résilience hors-ligne | `Implémentée partiellement` | `manifest.webmanifest`, `sw.js` actifs, synchronisation offline en cours |
| **Backend** | Node.js | 22-alpine (v22.x) | Environnement d'exécution JavaScript serveur asynchrone et performant | `Implémentée et opérationnelle` | `docker-compose.yml`, `backend/Dockerfile` |
| **Backend** | Express.js | 4.21.2 | Framework HTTP REST, routage modulaire, gestion des middlewares | `Implémentée et opérationnelle` | `backend/src/app.js`, `backend/src/server.js` |
| **Backend** | Zod | 3.24.2 | Validation déclarative et inférence de schéma des requêtes entrantes | `Implémentée et opérationnelle` | Middlewares de validation dans `backend/src/security/` |
| **Backend** | Helmet | 8.0.0 | Sécurisation des en-têtes HTTP (CSP, HSTS, X-Frame-Options) | `Implémentée et opérationnelle` | Initialisé dans `backend/src/app.js` |
| **Backend** | Express Rate Limit | 7.5.0 | Limitation du débit de requêtes contre les attaques par force brute et DoS | `Implémentée et opérationnelle` | Appliqué sur `/api/auth` et les routes publiques |
| **Backend** | Bcryptjs | 2.4.3 | Hachage sécurisé et salage des mots de passe (12 tours de salt) | `Implémentée et opérationnelle` | Utilisé dans `authService.js` |
| **Backend** | Cookie-Parser | 1.4.7 | Gestion des cookies HTTP-Only chiffrés pour les sessions d'authentification | `Implémentée et opérationnelle` | `sessionService.js`, `app.js` |
| **Données** | PostgreSQL | 16-alpine | Base de données relationnelle principale, intégrité transactionnelle ACID | `Implémentée et opérationnelle` | Conteneur `zadesk-postgres`, volume persistant |
| **Données** | Prisma ORM | 6.4.1 (CLI) / 6.19.3 (Client) | Mappage objet-relationnel, migrations de schéma, typage des entités | `Implémentée et opérationnelle` | `backend/prisma/schema.prisma` (34 modèles) |
| **Données** | Redis | 7-alpine | Mémoire vive distribuée pour cache de requêtes, sessions et verrous | `Implémentée et opérationnelle` | Conteneur `zadesk-redis`, `cacheService.js` |
| **Données** | MongoDB / Atlas Vector Search | Version 7.0+ (Prévue) | Base documentaire NoSQL et moteur d'indexation vectorielle pour le RAG | `Prévue dans l'architecture cible` | Documenté pour l'ingestion des bases de connaissances |
| **Asynchrone** | BullMQ | 6.5.3 | Gestionnaire de files d'attente distribuées sur Redis avec politique de retry | `Implémentée et opérationnelle` | Conteneur `zadesk-worker`, 4 workers dédiés |
| **Asynchrone** | Redis Pub/Sub | Intégré à Redis 7 (ioredis 5.5.0) | Bus d'événements mémoire pour diffusion inter-processus et synchronisation SSE | `Implémentée et opérationnelle` | `backend/src/services/pulseEventService.js` |
| **Asynchrone** | Server-Sent Events (SSE) | Protocole standardisé HTTP | Flux unidirectionnel temps réel pour la mise à jour des messages du cockpit | `Implémentée et opérationnelle` | Endpoint `/api/workspaces/:id/agent/pulse/stream` |
| **Asynchrone** | Transactional Outbox Pattern | Implémentation interne sur PostgreSQL | Garantie de publication des événements métier sans double écriture asynchrone | `Implémentée et opérationnelle` | Modèle `OutboxEvent`, `outboxDispatcher.js` |
| **Infrastructure** | Docker & Docker Compose | Docker Engine v24+ / Compose v2 | Conteneurisation multi-services et orchestration de l'environnement | `Implémentée et opérationnelle` | `docker-compose.yml`, multi-stage builds |
| **Infrastructure** | Nginx | mainline / alpine | Reverse proxy frontal, terminaison HTTP/HTTPS, compression gzip, routage interne | `Implémentée et opérationnelle` | `docker/nginx/nginx.conf`, conteneur `zadesk-nginx` |
| **Sécurité** | Cloudflare Turnstile | v1.0.0 (API Web) | Détection de robots et protection anti-DDoS sur l'authentification et l'onboarding | `Configurée, mais non vérifiée en production` | Bypass activé en développement (`TURNSTILE_BYPASS_DEV=true`) |
| **Sécurité** | RBAC Multi-tenant | Moteur de permissions interne | Modèle de droits d'accès granulaire (`OWNER`, `ADMIN`, `MANAGER`, `AGENT`) | `Implémentée et opérationnelle` | `backend/src/security/permissions.js` |
| **Services Externes** | Zavu API | REST v1 (`api.zavu.dev`) | Envoi de SMS et d'e-mails transactionnels (codes OTP, invitations) | `Configurée, mais non vérifiée en production` | Implémenté dans `zavuService.js`, clés déclarées dans `.env` |
| **Services Externes** | SasPay API | REST v1 (`api.saspay.me`) | Passerelle de paiement Mobile Money CEMAC (Airtel Money, MTN MoMo) | `Configurée, mais non vérifiée en production` | Implémenté dans `saspayService.js` avec signature HMAC-SHA256 |
| **Services Externes** | Meta Graph API | v21.0 | Intégration WhatsApp Business Cloud API (Embedded Signup, gestion numéros) | `Implémentée partiellement` | Authentification OAuth opérationnelle, webhooks entrants à finaliser |
| **Services Externes** | Google Identity | `google-auth-library` 9.15.0 | Authentification unique (Single Sign-On Google OAuth 2.0) | `Configurée, mais non vérifiée en production` | Contrôleurs prêts, dépendance de clés applicatives Google Cloud |
| **IA & RAG** | Modèle LLM de génération | À définir (GPT-4o-mini / Claude 3.5 / Gemini) | Synthèse de réponses d'assistance, reformulation, détection d'intention | `Prévue dans l'architecture cible` | UI de préfiguration validée (`/app/ai`), backend non connecté |
| **IA & RAG** | Modèle d'embeddings | À définir (OpenAI / Gemini / Multilingual) | Vectorisation des segments documentaires d'entreprise en vecteurs denses | `Prévue dans l'architecture cible` | Spécifié dans le pipeline cible |
| **IA & RAG** | Moteur de Chunking | Algorithme récursif textuel | Découpage des manuels et conditions SAV en fragments sémantiques | `Prévue dans l'architecture cible` | Présenté dans l'interface de préfiguration (`/app/knowledge`) |
| **Supervision** | Prometheus & Grafana | v2.50+ / v10+ (Architecture cible) | Collecte de métriques applicatives (RED) et tableaux de bord d'observabilité | `Prévue dans l'architecture cible` | Détaillé dans `ZADESK_MONITORING_ARCHITECTURE_ANALYSIS.md` |

---

## C. ANALYSE DÉTAILLÉE PAR CATÉGORIE

### 1. Frontend et Expérience Utilisateur

#### Next.js (v15.1.6) & React (v19.0.0)
Le frontend de Zadesk s'appuie sur la version la plus récente de Next.js exploitant le **React Server Components (RSC)** et l'**App Router**.
- **Mode de build standalone :** La configuration `next.config.ts` active explicitement `output: "standalone"`. Ce réglage extrait uniquement les fichiers node_modules et le code strictement nécessaires pour l'exécution en conteneur, réduisant l'image Docker de production à moins de 200 Mo.
- **Rendu hybride :** Les pages publiques (accueil, tarifs, vitrine d'entreprise) profitent du Server-Side Rendering (SSR) pour optimiser le référencement naturel et les performances de chargement initial. Les interfaces de travail de la Workspace (`/app/*`) utilisent des composants clients (`'use client'`) dynamiques pour offrir une réactivité sans rechargement de page.
- **Statut :** `Implémentée et opérationnelle`.

#### TypeScript (v5.7.3)
Le typage statique strict (`strict: true` dans `tsconfig.json`) garantit la cohérence des contrats d'interface entre le frontend et le backend :
- Types stricts pour les modèles de données (Tickets, Conversations, Membres, Abonnements).
- Protection contre les valeurs `null` ou `undefined` lors des rendus d'interface.
- **Statut :** `Implémentée et opérationnelle`.

#### Tailwind CSS (v3.4.17) & Système de Design "Operational Editorial System"
Le système graphique s'appuie sur Tailwind CSS couplé à une typographie rigoureuse :
- **Outfit :** Police typographique principale à chasse variable dédiée aux en-têtes et éléments d'autorité.
- **Inter :** Police de labeur garantissant une lisibilité maximale pour les corps de texte et messages des clients.
- **JetBrains Mono / Police Monospace :** Dédiée aux identifiants opérationnels (`#TCK-001`), métriques temporelles et badges d'état.
- **Statut :** `Implémentée et opérationnelle`.

#### Librairies d'animation : Motion (Framer Motion v14.14.0) & GSAP (v3.15.1)
- `motion` orchestre les transitions légères de composants (tiroirs latéraux, modales de confirmation, affichage conditionnel).
- `gsap` est embarqué pour orchestrer des timelines d'entrée complexes et des animations cinématiques sur les présentations de tableaux de bord.
- **Statut :** `Implémentée et opérationnelle` pour Motion, `Implémentée partiellement` pour GSAP.

#### Three.js (v0.187.0)
La bibliothèque WebGL Three.js a été ajoutée pour permettre le rendu d'éléments spatiaux et graphiques 3D en arrière-plan sur certaines pages vitrines ou écrans de chargement conceptuels.
- **Statut :** `Implémentée partiellement` (dépendance présente et configurée, exploitation ciblée).

#### Progressive Web App (PWA)
Zadesk intègre un Service Worker (`frontend/public/sw.js`), un manifeste web (`manifest.webmanifest`) et des méta-balises de configuration pour terminaux mobiles (iOS et Android) :
- Permet l'installation de la plateforme sur l'écran d'accueil du smartphone d'un commerçant.
- Navigation plein écran sans barre d'URL du navigateur.
- **Statut :** `Implémentée partiellement` (la coquille PWA et le cache d'actifs sont opérationnels ; la synchronisation bidirectionnelle de données hors-ligne reste à implémenter).

---

### 2. Backend et Couche API

#### Node.js 22 & Express.js (v4.21.2)
Le moteur d'exécution Node.js en version 22 LTS fournit les performances nécessaires à la gestion concurrente des connexions I/O asynchrones.
- **Architecture Controller-Service-Repository :**
  - `routes/` : Enregistrement des endpoints REST et attribution des middlewares de sécurité.
  - `controllers/` : Réception des requêtes HTTP, validation des paramètres et mise en forme des réponses JSON standardisées (`{ success, data, error, meta }`).
  - `services/` : Logique métier pure, calculs des règles d'attribution, gestion des abonnements, transactions de base de données.
  - `lib/prisma.js` & `cache/` : Accès aux données et au cache.
- **Statut :** `Implémentée et opérationnelle`.

#### Zod (v3.24.2)
Validation stricte des charges utiles (payloads) entrantes à l'aide de schémas déclaratifs. Empêche l'injection de paramètres malveillants ou de types incohérents avant même que la requête n'atteigne la couche métier.
- **Statut :** `Implémentée et opérationnelle`.

#### Sécurité applicative : Helmet, Rate-Limit, Bcryptjs, Cookie-Parser
- `helmet` (v8.0.0) : Configure les en-têtes HTTP de sécurité pour atténuer les vulnérabilités XSS, Clickjacking et MIME-sniffing.
- `express-rate-limit` (v7.5.0) : Limite les tentatives d'authentification brutale ou d'abus sur les routes d'API.
- `bcryptjs` (v2.4.3) : Assure le hachage sécurisé des mots de passe utilisateurs avec un coût de calcul calibré (12 tours).
- `cookie-parser` (v1.4.7) : Gère les jetons de session stockés sous forme de cookies HTTP-Only, inaccessibles aux scripts côté client (immunité totale contre le vol de session par XSS).
- **Statut :** `Implémentée et opérationnelle`.

---

### 3. Persistance des Données et ORM

#### PostgreSQL 16 (Image `postgres:16-alpine`)
PostgreSQL sert de source de vérité relationnelle pour l'ensemble du système opérationnel.
- Support natif des transactions ACID complexes (ex: création atomique d'un ticket, de son affectation et de son événement Outbox associé).
- Utilisation des types avancés : JSONB (données contextuelles d'événements, configurations flexibles), Enums PostgreSQL pour les statuts typés, index composites pour la recherche rapide par `(workspaceId, status)`.
- **Statut :** `Implémentée et opérationnelle`.

#### Prisma ORM (v6.4.1 / v6.19.3)
Prisma gère la couche d'accès aux données avec une sécurité de typage de bout en bout :
- Modélisation exhaustive de 34 tables métier dans `backend/prisma/schema.prisma`.
- Migrations automatiques et reproductibles via Prisma Migrate.
- Protection structurelle contre les injections SQL grâce aux requêtes paramétrées natives.
- **Statut :** `Implémentée et opérationnelle`.

#### Redis 7 (Image `redis:7-alpine`)
Moteur de stockage clé-valeur en mémoire vive :
- **Mise en cache rapide :** Cache d'invalidation sélective pour les connexions WhatsApp, les profils d'agents et les autorisations de workspace.
- **Bus Pub/Sub :** Supporte l'interconnexion en temps réel entre les instances du backend et les abonnés Server-Sent Events.
- **Broker BullMQ :** Support physique de persistance pour les files d'attente de tâches asynchrones.
- Configuration optimisée : politique de mémoire `noeviction` pour BullMQ et persistance AOF (`appendonly yes`, synchronisation chaque seconde).
- **Statut :** `Implémentée et opérationnelle`.

#### MongoDB & MongoDB Atlas Vector Search (Prévue dans l'architecture cible)
Dans l'architecture cible de Zadesk, MongoDB est la technologie retenue pour la persistance des bases de connaissances non structurées et la recherche sémantique vectorielle (voir analyse détaillée en section D).
- **Statut :** `Prévue dans l'architecture cible`.

---

### 4. Traitement Asynchrone, Événements et Temps Réel

#### BullMQ (v6.5.3) & Worker Dédié (`zadesk-worker`)
Afin de ne jamais bloquer l'Event Loop du serveur API lors de traitements longs ou d'appels à des tiers, Zadesk utilise `BullMQ` orchestré dans un conteneur dédié (`zadesk-worker` exécutant `src/workers/workerRunner.js`) :
1. `ticketWorker` : Automatisation des règles d'attribution des tickets selon la charge des agents et respect des SLA.
2. `notificationWorker` : Dépilage et transmission des e-mails et SMS transactionnels via Zavu.
3. `maintenanceWorker` : Nettoyage périodique des tokens OTP expirés, inscriptions non validées et dépilage du buffer Outbox.
4. `metricsWorker` : Consolidation horaire et quotidienne des compteurs analytiques des organisations.
- **Statut :** `Implémentée et opérationnelle`.

#### Transactional Outbox Pattern
Pour résoudre le problème classique de la "double écriture" en environnement distribué (enregistrer un ticket en base tout en envoyant un événement réseau), Zadesk implémente le pattern Outbox :
- Toute opération métier critique écrit simultanément dans sa table principale et dans la table `OutboxEvent` au sein de la même transaction PostgreSQL.
- Un dispatcheur asynchrone (`backend/src/outbox/outboxDispatcher.js`) verrouille et traite ces événements de façon fiable, garantissant qu'aucune notification n'est émise si la transaction SQL échoue.
- **Statut :** `Implémentée et opérationnelle`.

#### Server-Sent Events (SSE) via `pulseEventService.js`
Pour le cockpit opérationnel des agents, Zadesk a écarté les WebSockets traditionnels au profit du protocole Server-Sent Events :
- Établissement d'une connexion HTTP unidirectionnelle persistante (`/api/workspaces/:id/agent/pulse/stream`).
- Traversée native des proxies Nginx, reverse-proxies de télécoms et pare-feux stricts d'entreprises.
- Ring buffer mémoire (50 derniers événements) et support du header `Last-Event-ID` pour permettre la reconnexion automatique sans perte d'événements lors des micro-coupures de connexion 3G/4G.
- **Statut :** `Implémentée et opérationnelle`.

---

### 5. Infrastructure, Conteneurisation et Reverse Proxy

#### Docker & Docker Compose
L'ensemble de l'environnement applicatif est entièrement conteneurisé :
- `zadesk-nginx` : Reverse proxy d'entrée (image `nginx:alpine`).
- `zadesk-frontend` : Image Node 22 Alpine exécutant le serveur Next.js compilé.
- `zadesk-backend` : Image Node 22 Alpine exécutant l'API Express.
- `zadesk-worker` : Image Node 22 Alpine exécutant le runner BullMQ.
- `zadesk-postgres` : Base de données PostgreSQL 16 avec volume persistant `postgres_data`.
- `zadesk-redis` : Serveur Redis 7 avec volume persistant `redis_data`.
- Réseau isolé : Les services communiquent via le sous-réseau interne `zadesk-network`.
- **Statut :** `Implémentée et opérationnelle`.

#### Nginx
Nginx sert de point de terminaison unique :
- Écoute sur le port public 80 (et 443 en production cible).
- Routage intelligent : `/api/*` dirigé vers le conteneur backend (port 4000), le reste dirigé vers le conteneur frontend (port 3000).
- Configuration des en-têtes HTTP de mise à niveau (`Upgrade`, `Connection`) pour le streaming SSE et la gestion des micro-buffers.
- **Statut :** `Implémentée et opérationnelle`.

---

### 6. Sécurité, Contrôle d'Accès et Cryptographie

#### Authentification et Gestion de Session
- Authentification par mot de passe salé (`bcryptjs`) ou par code OTP à usage unique envoyé par SMS / e-mail.
- Sessions gérées en base de données (modèle `Session`) avec identifiant cryptographique opaque transmis via cookie HTTP-Only, SameSite et Secure.
- Déconnexion instantanée possible depuis n'importe quel terminal par invalidation de l'enregistrement de session en base.
- **Statut :** `Implémentée et opérationnelle`.

#### Contrôle d'Accès Basé sur les Rôles (RBAC) & Multi-Tenant
- Modèle hiérarchique à 4 niveaux :
  1. `OWNER` : Propriétaire du compte, gestion de la facturation, suppression de l'organisation.
  2. `ADMIN` : Configuration générale, gestion des intégrations et des membres.
  3. `MANAGER` : Supervision des agents, réassignation des tickets, consultation des rapports analytiques.
  4. `AGENT` : Réception, traitement et résolution des conversations et tickets qui lui sont assignés.
- Contrôle strict systématique : chaque requête vers l'API valide que l'utilisateur possède une adhésion active (`Membership`) rattachée au `workspaceId` ciblé.
- **Statut :** `Implémentée et opérationnelle`.

#### Cloudflare Turnstile
Protection anti-robot moderne et respectueuse de la vie privée (alternative sans friction aux CAPTCHAs visuels de Google).
- Intégrée sur les formulaires d'inscription et de connexion.
- En environnement de développement local, un mécanisme de contournement (`TURNSTILE_BYPASS_DEV=true`) permet aux tests automatisés de s'exécuter sans blocage.
- **Statut :** `Configurée, mais non vérifiée en production`.

---

### 7. Services Externes et Passerelles Métier

#### Passerelle SMS / Email : Zavu API (`zavuService.js`)
Service de communication cloud adapté au marché africain pour l'expédition de messages transactionnels :
- Envoi des codes de vérification OTP (validité 15 minutes, temporisation de réexpédition 60 secondes).
- Masquage des adresses e-mail dans les journaux système (`jo***@domaine.com`) pour préserver la confidentialité des données personnelles.
- Gestion des quotas et lecture automatique de l'en-tête HTTP `Retry-After` (gestion du code HTTP 429).
- **Statut :** `Configurée, mais non vérifiée en production`.

#### Passerelle de Paiement : SasPay API (`saspayService.js`)
Agrégateur de paiement opérant en République du Congo et dans la zone CEMAC pour l'encaissement Mobile Money :
- Prise en charge des réseaux Airtel Money et MTN Mobile Money en Francs CFA (XAF).
- Protocole de sécurité renforcé : signature HMAC-SHA256 calculée sur `${timestamp}.${rawBody}` vérifiée en temps constant avec fenêtre anti-rejeu de 300 secondes.
- Traitement idempotent grâce à l'en-tête `Idempotency-Key` sur chaque tentative de débit.
- Déclenchement automatique de la mise à niveau de l'abonnement du Workspace après confirmation cryptographique du paiement.
- **Statut :** `Configurée, mais non vérifiée en production`.

#### Passerelle Omnicanale : Meta Graph API (`whatsappService.js`)
Intégration directe avec l'API Cloud de WhatsApp Business (version Graph API v21.0) :
- Support du flux Meta Embedded Signup pour permettre à une PME de connecter son compte professionnel en quelques clics.
- Vérification multi-tenant empêchant un même numéro WhatsApp d'être connecté simultanément sur deux espaces de travail distincts.
- **Statut :** `Implémentée partiellement` (la liaison OAuth et la récupération des métadonnées WABA sont implémentées ; la réception des webhooks de messages entrants et l'expédition automatisée des réponses restent à achever).

#### Google Identity (OAuth 2.0)
Connexion rapide via Google (`google-auth-library` v9.15.0) permettant l'onboarding simplifié en entreprise.
- **Statut :** `Configurée, mais non vérifiée en production`.

---

## D. ARCHITECTURE TECHNOLOGIQUE CIBLE DE L'IA ET DU RAG

Cette section présente la conception technique détaillée du futur module d'assistance intelligente de Zadesk, conçu selon le pattern **Retrieval-Augmented Generation (RAG)**.

```text
                                  PIPELINE D'INGESTION DOCUMENTAIRE
                                  
 [ Documents Entreprise ]
(PDF, Contrats, Manuels SAV,     ┌─────────────────────┐      ┌────────────────────────┐      ┌─────────────────────────────┐
  Grilles Tarifaires, FAQ)  ───> │  DOCUMENT CHUNKER   │ ───> │   EMBEDDING MODEL      │ ───> │   MONGODB ATLAS VECTOR      │
                                 │ Fenêtres glissantes │      │  text-embedding-3      │      │        SEARCH INDEX         │
                                 │  (500-1000 tokens)  │      │   ou Gemini Embed      │      │ Collection: knowledge_chunks│
                                 └─────────────────────┘      └────────────────────────┘      └──────────────┬──────────────┘
                                                                                                             │
                                                                                                             │ Recherche par
                                                                                                             │ similarité
                                                                                                             │ cosinus ($vectorSearch)
                                  PIPELINE DE GÉNÉRATION & ESCALADE                                          │ avec filtre strict:
                                                                                                             │ { workspaceId: "..." }
 [ Message Client ]                                                                                          │
   (Ex: "Quelle est la          ┌──────────────────────┐      ┌────────────────────────┐                     │
    garantie du produit ?") ──> │ INTENT & GUARDRAILS  │ ───> │ VECTOR SEARCH QUERY    │ <───────────────────┘
                                │ Détection litige     │      │ Extraction k fragments │
                                └──────────┬───────────┘      └───────────┬────────────┘
                                           │                              │
                                   Litige détecté                         │ Score similarité >= 0.82
                                           │                              ▼
                                           │                  ┌────────────────────────┐
                                           │                  │  PROMPT AUGMENTÉ (RAG) │
                                           │                  │ Contexte doc + Profil  │
                                           │                  └───────────┬────────────┘
                                           │                              │
                                           │                              ▼
                                           │                  ┌────────────────────────┐
                                           │                  │      MODÈLE LLM        │
                                           │                  │ (GPT-4o-mini / Gemini) │
                                           │                  └───────────┬────────────┘
                                           │                              │
                                           │                Proposition de réponse générée
                                           │                              │
                                           ▼                              ▼
                          ┌─────────────────────────────────────────────────────────────┐
                          │            SUPERVISEUR & ESCALADE CONSEILLER                │
                          │   Si certitude < seuil OU litige financier OU refus client  │
                          │   ==> Transfert immédiat à l'agent humain (Statut WAITING)  │
                          │   ==> Affichage de la réponse suggérée au conseiller        │
                          └─────────────────────────────────────────────────────────────┘
```

### 1. Rôle et place de l'IA dans l'expérience Zadesk
L'intelligence artificielle au sein de Zadesk n'a pas pour objectif de remplacer le conseiller humain mais d'agir comme un **copilote d'assistance opérationnelle de premier niveau** :
- **Pré-qualification et triage des demandes :** Analyse du message entrant du client, détection de la tonalité, de la langue et de la catégorie de réclamation (problème technique, livraison, facturation).
- **Suggestion contextuelle de réponses :** Recherche de la clause contractuelle ou de la procédure de garantie exacte et proposition d'un brouillon de réponse pré-rédigé au conseiller.
- **Réponse automatisée supervisée :** Résolution autonome uniquement des questions récurrentes simples à très haute certitude (ex: horaires d'ouverture, politique de retour).

### 2. Modèles de langage envisagés (LLMs)
Pour concilier vitesse de réponse, faible coût d'inférence par requête et précision sémantique, la plateforme s'orientera vers une architecture à double niveau :
- **Niveau 1 (Triage rapide et synthèse documentaire) :**
  - Modèle privilégié : `OpenAI GPT-4o-mini` ou `Google Gemini 1.5 Flash`.
  - Justification : Latence inférieure à 800 ms, coût minime (inférieur à 0,20 $ par million de tokens), excellentes capacités d'extraction multilingue (français, anglais et langues locales véhiculaires comme le lingala).
- **Niveau 2 (Cas complexes et litiges) :**
  - Modèle de repli : `Claude 3.5 Sonnet` ou `GPT-4o`.
  - Justification : Raisonnement juridique et contractuel supérieur pour les contestations délicates.
- **Statut :** `À définir` (la validation définitive dépendra des accords d'hébergement et des exigences de souveraineté des données de certains clients bancaires).

### 3. Pipeline d'ingestion documentaire
Le module d'ingestion (accessible depuis `/app/knowledge`) supportera l'importation de documents hétérogènes :
- Formats acceptés : PDF (notices, contrats), Word (.docx), Markdown, fichiers texte brut (.txt) et flux FAQ structurés.
- Étapes de transformation :
  1. Extraction textuelle brute et nettoyage des artefacts visuels (en-têtes, pieds de page).
  2. Conservation de la hiérarchie structurelle (titres de sections, articles, sous-clauses).
  3. Association de métadonnées obligatoires : `workspaceId`, `documentId`, `title`, `category`, `createdAt`, `version`.

### 4. Stratégie de découpage (Chunking)
Le découpage sémantique est critique pour la pertinence de la recherche vectorielle :
- **Taille de fenêtre cible :** 500 à 1 000 tokens par fragment textuel (chunk).
- **Recouvrement (Overlap) :** 100 à 150 tokens de chevauchement entre fragments successifs afin de préserver la continuité du contexte aux frontières des paragraphes.
- **Découpage structurel (Recursive Character Chunking) :** Respect prioritaire des séparateurs naturels de paragraphes (`\n\n`), puis des phrases (`. `), pour éviter de tronquer une clause contractuelle au milieu d'une condition essentielle.

### 5. Modèles d'embeddings vectoriels
La transformation des fragments textuels en vecteurs numériques denses sera confiée à des modèles d'embeddings de référence :
- **Candidat 1 :** `text-embedding-3-small` (OpenAI), générant des vecteurs de dimension 1536 ou réduits à 512 dimensions par compression mathématique.
- **Candidat 2 :** `text-embedding-004` (Google Gemini), dimension 768, hautement performant en compréhension sémantique française.
- **Candidat 3 (Alternative souveraine) :** `BAAI/bge-m3` ou `multilingual-e5-large`, modèles open-source exécutables en conteneur dédié pour les déploiements on-premise de souveraineté étatique.
- **Statut :** `À définir`.

### 6. Base de données vectorielle retenue : MongoDB / MongoDB Atlas Vector Search
Bien que PostgreSQL supporte l'extension `pgvector`, **MongoDB / MongoDB Atlas Vector Search** est la technologie retenue pour le composant RAG de Zadesk pour les raisons techniques suivantes :
1. **Nature documentaire des connaissances :** Les manuels techniques, fiches SAV et contrats commerciaux présentent des structures de métadonnées semi-structurées et variables (numéros de série, dates de validité, clauses d'exclusion, départements) qui s'expriment nativement au format BSON/JSON de MongoDB, sans nécessiter de constantes modifications de schéma SQL.
2. **Recherche vectorielle native `$vectorSearch` :** MongoDB intègre directement l'indexation vectorielle basée sur l'algorithme HNSW (Hierarchical Navigable Small World), permettant d'interroger conjointement des vecteurs et des filtres scalaires dans une syntaxe d'agrégation unique.
3. **Partitionnement et montée en charge (Sharding) :** L'ingestion massive de documentations par des centaines de PME et grandes entreprises génère un volume de données volumineux et fragmenté qui se partitionne horizontalement avec une grande efficacité sur MongoDB.
4. **Découplage architectural :** Conserver la base relationnelle PostgreSQL 16 dédiée strictement à l'intégrité transactionnelle (comptes, factures, permissions, tickets) et dédier MongoDB au stockage lourd des fragments de connaissances et vecteurs prévient tout risque de saturation de la mémoire vive ou du pool de connexions de la base opérationnelle principale.
- **Statut :** `Prévue dans l'architecture cible`.

### 7. Recherche sémantique et recherche hybride
Afin de maximiser la précision des résultats, Zadesk combinera deux modes de recherche :
- **Recherche dense (vectorielle) :** Recherche par similarité cosinus (`cosine similarity`) capturant le sens de la question même si le client emploie des synonymes ou des termes familiers (ex: *"Mon appareil s'est éteint tout seul"* correspondra à *"Panne d'alimentation soudaine"*).
- **Recherche exacte (lexicale / plein texte) :** Index plein texte pour matcher instantanément les références exactes de pièces détachées, codes d'erreur (`E-402`) ou numéros d'articles de loi.

### 8. Construction du contexte et synthèse de prompt
Le moteur d'orchestration RAG assemble dynamiquement un prompt sécurisé selon la structure suivante :
```text
[SYSTÈME]
Tu es l'assistant de support de l'entreprise {workspaceName}.
Tu dois répondre STRICTEMENT en t'appuyant sur les extraits documentaires fournis ci-dessous.
Si l'information n'est pas présente dans les extraits, indique poliment que tu ne disposes pas
de cet élément et propose la mise en relation avec un conseiller humain.
Interdiction formelle d'inventer des prix, garanties ou conditions non mentionnées.

[DOCUMENTS DE RÉFÉRENCE AUTHENTIFIÉS]
--- Source: Manuel de Garantie v2 (Section 4.1) ---
{fragment_1}
--- Source: Politique de Remboursement CEMAC (Article 12) ---
{fragment_2}

[PROFIL CLIENT & HISTORIQUE RÉCENT]
Nom: {customerName} | Canal: {channelType}
Historique: {recentMessages}

[MESSAGE DU CLIENT]
{customerMessage}
```

### 9. Cloisonnement Multi-Tenant des données vectorielles
L'étanchéité inter-entreprises est le défi de sécurité majeur du RAG :
- Chaque enregistrement de fragment dans MongoDB stocke obligatoirement l'identifiant immuable de l'organisation : `{ workspaceId: "cuid_xyz", chunkText: "...", embedding: [...] }`.
- Toute requête `$vectorSearch` applique systématiquement un **pré-filtre obligatoire** sur `workspaceId`. Il est physiquement impossible pour une entreprise B de recevoir des extraits documentaires appartenant à l'entreprise A, même si la question posée présente une similarité vectorielle de 99%.

### 10. Seuil de confiance et calibrage de certitude
Le système attribue un score de similarité (normalisé entre 0 et 1) à chaque fragment extrait :
- **Seuil d'autonomie (Score >= 0.85) :** L'information est considérée comme hautement certaine ; une réponse automatisée peut être envoyée directement au client (si l'organisation a activé le mode automatique).
- **Seuil d'assistance conseiller (0.70 <= Score < 0.85) :** La réponse est rédigée sous forme de suggestion dans le cockpit du conseiller humain, accompagnée d'un badge jaune *"Certitude modérée – Vérification recommandée"*.
- **Seuil d'abstention (Score < 0.70) :** Le moteur ne suggère rien d'approximatif et oriente directement le ticket vers la file d'attente d'un agent humain.

### 11. Mécanisme d'escalade vers un agent humain
La sécurité de l'expérience client repose sur un coupe-circuit infaillible :
- Tout signal de mécontentement explicite (détection de sentiment d'énervement, mots-clés d'avocat ou de litige financier) déclenche immédiatement le statut `WAITING_ASSIGNMENT` ou le transfert au superviseur.
- La métrique d'assistance humaine reste souveraine. Zadesk applique le principe du **"Zero Hallucination Tolerance"** : il est préférable d'avouer une méconnaissance et de passer le relais à un humain plutôt que d'émettre une fausse promesse commerciale.

### 12. État d'intégration actuel de l'IA dans Zadesk
L'audit du code source démontre une intégrité parfaite :
- Dans `backend/src/services/workspaceService.js`, la métrique `aiResolutionRate` renvoie explicitement la valeur `null` accompagnée du commentaire technique :  
  `// Moteur IA en préparation (non simulé)`.
- Sur le Dashboard de production (`/app`), l'interface affiche en toute transparence :  
  *« Module IA en préparation. Le traitement des demandes repose actuellement sur l'équipe humaine. »*
- Les écrans `/app/knowledge` et `/app/ai` constituent pour l'instant des interfaces de préfiguration ergonomique démontrant aux administrateurs les règles de gestion et seuils qui piloteront le futur moteur.
- **Statut global :** `Prévue dans l'architecture cible`.

---

## E. TECHNOLOGIES COMPLÉMENTAIRES ET ERGONOMIQUES

### 1. Three.js (v0.187.0) et rendu visuel spatial
- Rôle : Expérimentation graphique et canevas interactifs WebGL pour des représentations de données spatiales ou d'arrière-plans immersifs.
- Statut : `Implémentée partiellement`.

### 2. Lucide Icons (v0.475.0)
- Rôle : Système unifié d'icônes vectorielles SVG légères, cohérentes avec les principes du Swiss Graphic Design.
- Statut : `Implémentée et opérationnelle`.

### 3. Sharp (v0.35.4)
- Rôle : Bibliothèque de traitement d'images haute performance (C++ libvips) utilisée par Next.js lors du build pour l'optimisation, le redimensionnement et la conversion automatique des images au format WebP/AVIF.
- Statut : `Implémentée et opérationnelle`.

### 4. Autoprefixer (v10.4.20) & PostCSS (v8.5.1)
- Rôle : Transformation du CSS moderne et ajout automatique des préfixes vendeurs pour assurer une compatibilité totale sur les navigateurs mobiles Android et Safari iOS plus anciens.
- Statut : `Implémentée et opérationnelle`.

---

## F. RECOMMANDATIONS ET POINTS D'ARBITRAGE POUR LE MÉMOIRE

Dans le cadre de la rédaction de la sous-section **2.7.2 – Technologies de développement**, l'étudiant / rédacteur du mémoire devra s'appuyer sur des justifications d'ingénierie solides pour argumenter chaque choix technologique devant le jury.

### F.1. Arbitrage Base Relationnelle (PostgreSQL) vs Base Documentaire (MongoDB)
- **Position à défendre dans le mémoire :** Zadesk adopte une approche de **persistance polyglotte (Polyglot Persistence)** justifiée par la nature des données traitées.
- **PostgreSQL** est indispensable pour la gestion opérationnelle : cohérence stricte des statuts de tickets, transactions financières d'abonnement, calculs de quotas et relations multi-tables (User-Workspace-Role) nécessitant l'intégrité référentielle.
- **MongoDB / Atlas Vector Search** est le choix optimal pour le sous-système de connaissances : la documentation d'entreprise est par essence non structurée, changeante, et le requêtage vectoriel `$vectorSearch` s'insère idéalement dans un pipeline NoSQL sans polluer le moteur relationnel principal.

### F.2. Arbitrage Server-Sent Events (SSE) vs WebSockets
- **Position à défendre dans le mémoire :** Pourquoi Zadesk a-t-il privilégié SSE pour le Cockpit des agents ?
- **Simplicité et robustesse réseau :** Les WebSockets souffrent de coupures fréquentes sur les réseaux mobiles 3G/4G instables de la zone CEMAC et se heurtent souvent aux proxies d'entreprises qui bloquent les connexions bidirectionnelles non-HTTP.
- **SSE fonctionne sur du pur HTTP standard :** Il traverse nativement Nginx sans configuration complexe, gère la reconnexion automatique avec `Last-Event-ID`, consomme très peu de mémoire serveur et répond parfaitement au besoin qui est à 95% descendant (le serveur pousse les nouveaux messages arrivés aux agents).

### F.3. Arbitrage Next.js App Router (Standalone) vs Single Page Application (SPA) pure
- **Position à défendre dans le mémoire :**
- Une SPA pure (ex: Create React App ou Vite seul) impose le téléchargement d'un lourd bundle JavaScript initial avant tout affichage, ce qui est rédhibitoire pour des commerçants connectés avec un débit mobile restreint.
- Next.js 15 avec rendu hybride permet d'expédier du HTML immédiatement lisible (SSR) pour la vitrine et l'accès public, tout en offrant le dynamisme d'une application riche dans la Workspace grâce au découpage automatique de code (code-splitting par route).

### F.4. Arbitrage BullMQ + Redis vs Apache Kafka / RabbitMQ
- **Position à défendre dans le mémoire :**
- Pour le dimensionnement actuel de Zadesk (PME et organisations régionales), déployer un cluster Apache Kafka ou RabbitMQ représenterait une surconsommation de ressources injustifiée et une complexité opérationnelle excessive.
- `BullMQ` s'appuie sur l'instance Redis déjà existante pour le cache, offrant des performances de plusieurs milliers de jobs par seconde avec une empreinte mémoire inférieure à 50 Mo, tout en intégrant nativement la gestion des retries, du backoff exponentiel et des tâches planifiées.

### F.5. Formulation impérative pour le mémoire universitaire
Pour garantir l'honnêteté intellectuelle et la rigueur académique du mémoire :
- **Toujours distinguer l'acquis du prévisionnel :** Présenter les composants actuellement en production (Next.js, Express, PostgreSQL, Redis, BullMQ, Nginx) comme l'ossature opérationnelle validée.
- **Présenter le module IA / RAG comme une conception architecturale formelle :** Mettre en valeur la démarche d'ingénierie préliminaire (maquettes de préfiguration, choix de MongoDB Atlas Vector Search, algorithme de découpage, stratégie d'escalade) sans jamais prétendre faussement que le modèle d'inférence est déjà en production live. Cette lucidité architecturale est particulièrement appréciée par les jurys académiques.

---
*Fin du rapport d'audit technologique Zadesk – Document de référence pour le mémoire universitaire.*
