# RAPPORT D'AUDIT TECHNIQUE FACTUEL — SECTION 3.5 DU MÉMOIRE DE LICENCE
## PROJET ZALISK (ZADESK) — ANALYSE ET JUSTIFICATION DES CHOIX TECHNIQUES

Ce document constitue la référence descriptive et factuelle pour la rédaction de la section 3.5 du mémoire de Licence en Génie Informatique :
- **3.5.1 Justification des choix architecturaux**
- **3.5.2 Justification des technologies utilisées**
- **3.5.3 Présentation des mécanismes de sécurité**
- **3.5.4 Difficultés rencontrées et solutions apportées**

---

# 3.5.1 JUSTIFICATION DES CHOIX ARCHITECTURAUX

### 1. Organisation globale du système
Le système Zalisk repose sur une architecture applicative découplée, orchestrée par un reverse proxy frontal et un réseau privé virtuel Docker :
- **Frontend** : Application SSR/SPA Next.js (App Router) isolée dans le conteneur `zadesk-frontend`.
- **Backend API** : Monolithe modulaire Express/Node.js exécuté dans le conteneur `zadesk-backend`.
- **Worker d'arrière-plan** : Processus d'exécution asynchrone autonome exécuté dans le conteneur `zadesk-worker`.
- **Passerelle d'entrée** : Nginx (`zadesk-nginx`) agissant comme reverse proxy unique, seul point d'entrée exposé sur l'hôte (port 80).
- **Magasins de données** : PostgreSQL 16 (`zadesk-postgres`) et Redis 7 (`zadesk-redis`), confinés sur le réseau interne `zadesk-network` sans aucun port publié vers l'extérieur.

### 2. Organisation interne du Backend : Monolithe Modulaire en Couches
Le backend de Zalisk **ne constitue pas une architecture en microservices**, mais un **monolithe modulaire en couches** (*Layered Modular Monolith*).
Cette organisation assure une séparation nette des responsabilités sans introduire la complexité opérationnelle d'un maillage de microservices :
1. **Couche de routage (`backend/src/routes/`)** : Déclaration des points d'accès HTTP via `express.Router` (`authRoutes.js`, `workspaceRoutes.js`, `agentRoutes.js`, `publicRoutes.js`, `commercialRoutes.js`, `saspayWebhookRoutes.js`).
2. **Couche de contrôle (`backend/src/controllers/`)** : Extraction des paramètres HTTP (headers, params, query, body), orchestration des appels aux services métier, et formatage standardisé des réponses JSON via `backend/src/utils/response.js` (`sendSuccess`, `sendError`).
3. **Couche de service métier (`backend/src/services/`)** : Concentration exclusive de la logique applicative (`authService.js`, `workspaceService.js`, `agentService.js`, `assignmentEngine.js`, `publicCompanyService.js`, `saspayService.js`, `pulseEventService.js`, `otpService.js`).
4. **Couche de sécurité et middleware transverses (`backend/src/middleware/`, `backend/src/security/`)** : Validation des schémas Zod (`validate.js`), authentification de session (`requireAuth.js`), barrière multi-tenant (`requireWorkspaceRole`), limitation de débit distribuée (`rateLimiter.js`), validation anti-robot (`requireTurnstile.js`), autorité de confiance financière (`financialTrustAuthority.js`).
5. **Couche de persistance et d'accès aux données (`backend/src/lib/prisma.js`, `backend/src/cache/cacheService.js`)** : Client Prisma ORM pour PostgreSQL et service de cache intelligent Redis avec dégradation gracieuse.
6. **Couche d'exécution asynchrone et événements (`backend/src/queues/`, `backend/src/outbox/`, `backend/src/workers/`)** : Gestionnaire de files d'attente BullMQ (`queueManager.js`), répartiteur Transactional Outbox (`outboxDispatcher.js`) et workers spécialisés (`workerRunner.js`).

**Justification pour Zalisk** :
- *Besoin* : Développer une plateforme SAV complète (auth, espaces entreprises, billetterie, messagerie, facturation) avec une équipe agile, tout en garantissant une forte cohésion et un couplage faible.
- *Avantages* : Simplicité de déploiement (une seule image de backend partagée entre l'API et le Worker), partage immédiat des types et des modèles Prisma, transactions ACID natives et cohérence forte sans protocole 2PC (Two-Phase Commit).
- *Limites* : Montée en charge globale du processus serveur (bien que le worker soit isolé), nécessité d'une discipline de code stricte pour éviter les dépendances circulaires entre modules.

### 3. Modèle Multi-Tenant : Isolation Logique Partagée (*Pooled Multi-Tenancy*)
Zalisk met en œuvre une architecture multi-tenant à **base de données et schéma partagés** (*Shared Database, Shared Schema*), assortie d'une isolation logique stricte :
- **Entités clés** : `Workspace` (l'entreprise abonnée) et `Membership` (table d'association composite entre `User` et `Workspace`).
- **Contrainte d'unicité relationnelle** : Clé primaire composite `@@id([userId, workspaceId])` interdisant les doublons d'appartenance.
- **Règles de partitionnement** : Chaque ressource métier (`Ticket`, `Conversation`, `AgentProfile`, `Establishment`, `OutboxEvent`, `Subscription`) porte une clé étrangère obligatoire `workspaceId`.
- **Barrière de sécurité logicielle** : Le middleware `requireWorkspaceRole` intercepte chaque requête vers `/api/workspaces/:workspaceId/*` ou portant le header `X-Workspace-Id`, résout l'espace par son CUID ou son `slug`, et vérifie l'existence d'une appartenance active non suspendue (`status: ACTIVE`).

**Justification pour Zalisk** :
- *Besoin* : Héberger des milliers de TPE/PME sur une infrastructure économique sans provisionner une base de données par client.
- *Avantages* : Coût d'infrastructure minimal, mutualisation du pool de connexions PostgreSQL, simplifications des migrations de schéma globales via Prisma.
- *Limites* : Risque de fuite de données si un développeur omettait la clause `where: { workspaceId }` dans une requête SQL (mitigé par des tests adversariaux et le middleware centralisé).

### 4. Relations et Rôles des Magasins de Données
Le système orchestre trois magasins de données avec des responsabilités distinctes et complémentaires :
1. **PostgreSQL 16 (Source de Vérité Relationnelle ACID)** :
   - Assure la persistance durable de toutes les données structurées.
   - Garantit l'intégrité référentielle par clés étrangères et cascades maîtrisées (`onDelete: Cascade` / `Restrict`).
   - Gère la concurrence par verrous de lignes atomiques (`FOR UPDATE SKIP LOCKED` dans l'Outbox et l'attribution).
2. **Redis 7 (Magasin Mémoire Polyvalent)** :
   - *Cache applicatif distribué* (`cacheService.js`) : Mise en cache avec TTL des profils d'entreprises publiques (`public:companies:*`) et des agrégats de catégories pour soulager PostgreSQL.
   - *Limitation de débit atomique* (`rateLimiter.js`) : Stockage des compteurs de requêtes par IP/clé via script Lua `INCR` + `PEXPIRE`.
   - *Anti-rejeu de sécurité* : Consommation unique des jetons Cloudflare Turnstile (`turnstile:used:<hash>`).
   - *Bus Pub/Sub temps réel* : Canaux `zadesk:pulse:<workspaceId>` pour la diffusion instantanée des événements vers les clients connectés en SSE.
   - *Moteur d'infrastructure BullMQ* : Persistance et ordonnancement des tâches d'arrière-plan avec politique `--maxmemory 128mb --maxmemory-policy noeviction`.
3. **MongoDB Atlas Vector Search & Cloudflare Workers AI (Architecture Cible Documentée)** :
   - *Statut réel* : **Architecture Cible (RAG)**, explicitement documentée dans les spécifications et le diagramme de classes, mais **non instanciée dans le runtime Docker actuel**.
   - *Rôle prévu* : Stockage des représentations vectorielles denses (embeddings 1536 dimensions dans `KnowledgeChunk`) pour la recherche sémantique documentaire et inférence LLM sur Cloudflare Workers AI.

### 5. Mécanismes de Communication et Traitements Synchrones / Asynchrones
Le système sépare rigoureusement le chemin critique synchrone des tâches lourdes asynchrones :
- **Communication Synchrone REST/JSON** : Requêtes HTTP standards pour les actions utilisateur immédiates (authentification, création de ticket, consultation de tableau de bord), avec validation Zod et codes d'état HTTP stricts (200, 201, 400, 401, 403, 404, 429, 500).
- **Communication Temps Réel Unidirectionnelle (SSE / Pulse)** :
  - Endpoint `GET /api/workspaces/:workspaceId/agents/pulse/stream`.
  - Maintien d'une connexion HTTP persistante avec en-têtes `text/event-stream` et `X-Accel-Buffering: no`.
  - Diffusion d'événements (`PULSE_MESSAGE_CREATED`, `PULSE_CONVERSATION_CREATED`) via Redis Pub/Sub avec tampon circulaire de 50 événements pour rejeu immédiat sur reconnexion (`Last-Event-ID`).
- **Communication Asynchrone Fiable (Transactional Outbox Pattern & BullMQ)** :
  - *Problème résolu* : Éviter l'état incohérent où une action métier est validée en base mais son événement asynchrone (email, notification, mise à jour de métrique) est perdu suite à un crash Redis ou réseau.
  - *Solution implémentée* : Les événements sont insérés dans la table PostgreSQL `outbox_events` dans la même transaction SQL que la mutation métier (`createOutboxEvent(tx, ...)`). Un planificateur récurrent extrait ces événements par lot avec `FOR UPDATE SKIP LOCKED` (`dispatchOutboxEvents`) et les pousse dans les files d'attente BullMQ.
  - *Files gérées* : `tickets` (auto-attribution), `notifications` (envoi d'emails via ZavuDev), `maintenance` (nettoyage des sessions expirées, purge des données temporaires), `metrics` (calcul des indicateurs SLA).

---

# 3.5.2 JUSTIFICATION DES TECHNOLOGIES UTILISÉES

### Tableau récapitulatif des technologies et statuts opérationnels

| Technologie / Outil | Version Vérifiée | Utilisation Réelle dans Zalisk | Composants Dépendants | Statut Opérationnel |
|---|---|---|---|---|
| **Next.js** | `15.1.6` | Framework frontend React avec App Router, rendu hybride, layout partagé | `frontend/src/app` | **Opérationnel** |
| **React** | `19.0.0` | Bibliothèque d'interface utilisateur réactive | Composants UI, hooks d'état | **Opérationnel** |
| **TypeScript** | `5.7.3` | Typage statique frontend | Interfaces API, composants | **Opérationnel** |
| **Node.js** | `20+ Alpine` | Environnement d'exécution JavaScript serveur | Backend API et Worker | **Opérationnel** |
| **Express** | `4.21.2` | Framework HTTP minimaliste pour API REST | `app.js`, routes, middlewares | **Opérationnel** |
| **PostgreSQL** | `16-alpine` | SGBD relationnel principal, persistance ACID | Toutes les entités métier | **Opérationnel** |
| **Prisma ORM** | `6.19.3` / `6.4.1` | Mappeur objet-relationnel, migrations, typage de données | `backend/src/lib/prisma.js` | **Opérationnel** |
| **Redis** | `7-alpine` | Cache en mémoire, rate limiter, bus Pub/Sub, files BullMQ | `cacheService.js`, `rateLimiter.js`, `pulseEventService.js` | **Opérationnel** |
| **BullMQ** | `6.5.3` | Ordonnancement et exécution distribuée des tâches d'arrière-plan | `queueManager.js`, workers | **Opérationnel** |
| **Server-Sent Events (SSE)** | *Standard W3C* | Flux temps réel d'événements vers les conseillers SAV | `agentController.streamPulse`, `usePulseStream.ts` | **Opérationnel** |
| **Docker & Compose** | Compose v3 | Conteneurisation multi-services, réseau privé pont | `docker-compose.yml`, Dockerfiles | **Opérationnel** |
| **Nginx** | `nginx:alpine` | Reverse proxy frontal, terminaison HTTP, désactivation buffer SSE | `docker/nginx/nginx.conf` | **Opérationnel** |
| **Cloudflare Turnstile** | API v0 | Détection anti-robot / CAPTCHA sans friction | `turnstileService.js`, `requireTurnstile.js` | **Opérationnel** |
| **bcryptjs** | `2.4.3` | Hachage sécurisé des mots de passe (12 salt rounds) | `backend/src/lib/password.js` | **Opérationnel** |
| **Zod** | `3.24.2` | Validation déclarative et inférence de schémas de données | `backend/src/utils/validation.js` | **Opérationnel** |
| **Zavu / ZavuDev** | API REST v1 | Envoi transactionnel d'emails et codes OTP de sécurité | `backend/src/services/zavuService.js` | **Opérationnel** |
| **SasPay** | API REST v1 | Passerelle de paiement Mobile Money et abonnements SaaS | `saspayService.js`, `saspayWebhookController.js` | **Opérationnel** |
| **Cloudflare Workers AI** | *Documenté* | Service d'inférence LLM pour l'assistance automatique | Module RAG cible | **Architecture Cible** |
| **MongoDB Atlas** | *Documenté* | Base documentaire NoSQL pour chunks et vecteurs denses | Module RAG cible | **Architecture Cible** |

### Justifications détaillées des technologies retenues

1. **Next.js 15 & React 19** :
   - *Justification* : Permet de combiner le rendu côté serveur pour le référencement naturel des fiches publiques d'entreprises (`/companies/:slug`) et une réactivité instantanée de type Single Page Application pour le tableau de bord des conseillers SAV.
2. **Express 4 & Node.js 20** :
   - *Justification* : Faible empreinte mémoire, gestion asynchrone non-bloquante native basée sur l'Event Loop, idéale pour supporter simultanément des centaines de connexions persistantes SSE sans saturer les threads du serveur.
3. **PostgreSQL 16 & Prisma ORM** :
   - *Justification* : PostgreSQL garantit une robustesse transactionnelle indispensable pour les paiements SasPay et l'intégrité des statuts de tickets (SLA). Prisma élimine le risque d'injections SQL via des requêtes paramétrées automatiques et offre une synchronisation immédiate du schéma TypeScript/JavaScript.
4. **Redis 7 & BullMQ 6** :
   - *Justification* : Redis offre des opérations atomiques en sous-milliseconde. Combiné à BullMQ, il permet de décharger l'API des opérations chronophages (envoi d'emails via ZavuDev, génération d'alertes) avec reprises automatiques en backoff exponentiel.
5. **Nginx (Alpine)** :
   - *Justification* : Isole l'infrastructure interne du monde extérieur, centralise la gestion des ports et optimise les performances grâce à la compression Gzip et au passage direct des requêtes sans tampon pour le streaming SSE.
6. **Cloudflare Turnstile** :
   - *Justification* : Alternative moderne et respectueuse de la vie privée face aux solutions traditionnelles type reCAPTCHA. Protège les formulaires publics d'inscription, de connexion et d'envoi de messages contre les attaques par déni de service et force brute.

---

# 3.5.3 PRÉSENTATION DES MÉCANISME DE SÉCURITÉ

L'audit du code source révèle une architecture de sécurité multicouche robuste conçue selon le principe de **défense en profondeur**.

### 1. Authentification et Gestion des Sessions
- **Authentification en Deux Étapes (2-Step Verification / OTP)** :
  - *Fichiers concernés* : `backend/src/services/authService.js`, `backend/src/services/otpService.js`.
  - *Fonctionnement* : L'inscription et la connexion ne délivrent pas immédiatement de session. Le serveur génère un code OTP numérique à 6 chiffres via un générateur pseudo-aléatoire cryptographique (`crypto.randomInt(100000, 1000000)`).
  - *Stockage sécurisé de l'OTP* : Le code brut n'est **jamais stocké en clair**. Il est haché via SHA-256 combiné à l'identifiant et au secret applicatif : `crypto.createHash("sha256").update(`${code}:${identifier}:${env.SESSION_SECRET}`).digest("hex")`.
  - *Jeton temporaire signé (Challenge Token)* : Un jeton HMAC-SHA256 (`payloadB64.signature`) d'une validité stricte de 15 minutes relie la tentative d'authentification au client sans exposer d'état modifiable. La vérification de signature utilise `crypto.timingSafeEqual` pour empêcher toute attaque par analyse temporelle.
- **Hachage des Mots de Passe** :
  - *Fichier concerné* : `backend/src/lib/password.js`.
  - *Algorithme* : `bcryptjs` avec un facteur de coût élevé de **12 salt rounds** (`SALT_ROUNDS = 12`), offrant une résistance optimale aux attaques par tables d'évaluation et force brute GPU.
- **Gestion des Sessions Utilisateur** :
  - *Fichier concerné* : `backend/src/services/sessionService.js`.
  - *Génération* : Jetons de haute entropie générés via CSPRNG (`crypto.randomBytes(32).toString("hex")`, soit 256 bits d'aléa).
  - *Stockage* : Table PostgreSQL `sessions` (`sessionToken`, `userId`, `expiresAt`).
  - *Transport du cookie* : Cookie signé `zadesk_session`, doté des attributs de sécurité `HttpOnly: true`, `SameSite: Lax`, `Path: /`, et `Secure` activé en environnement de production HTTPS.
  - *Purge et révocation* : Révocation explicite lors de la déconnexion (`revokeSession`) et suppression asynchrone des sessions périmées lors de chaque validation (`validateSession`).
- **Authentification Google OAuth & Anti-Énumération** :
  - *Fichiers concernés* : `backend/src/lib/google.js`, `backend/src/services/authService.js`.
  - *Protection* : Vérification cryptographique des jetons d'identité Google (`OAuth2Client.verifyIdToken`). Pour empêcher les attaquants de déterminer si une adresse email est inscrite sur Zalisk, le système renvoie un message d'erreur neutre standardisé (`NEUTRAL_AUTH_ERROR_MESSAGE`).

### 2. Contrôle d'Accès et Autorisations (RBAC)
- **Modèle de Rôles Granulaire** :
  - *Fichier concerné* : `backend/src/security/permissions.js`.
  - *Hiérarchie des rôles* :
    1. `OWNER` : Propriétaire légal de l'espace, droits intégraux y compris suppression de l'espace et gestion financière.
    2. `ADMIN` : Administrateur système de l'entreprise (gestion des membres, configuration globale).
    3. `MANAGER` : Superviseur du support SAV (supervision de la charge, réaffectation, validation des compétences, métriques SLA).
    4. `AGENT` : Conseiller SAV opérationnel (traitement des tickets qui lui sont assignés ou partagés, participation aux conversations).
- **Protection des Routes et Barrière Multi-Tenant** :
  - *Fichier concerné* : `backend/src/middleware/requireAuth.js` (`requireWorkspaceRole`).
  - *Mécanisme* : Chaque route d'espace vérifie impérativement que `req.user.id` et `req.params.workspaceId` correspondent à une ligne valide dans la table `memberships`.
  - *Contrôle du cycle de vie* : Accès bloqué avec code 403 personnalisé si le statut d'appartenance est `SUSPENDED` (suspension administrative réversible) ou `ARCHIVED`.

### 3. Protection des API et Limitation de Débit Distribuée
- **Validation Déclarative des Entrées** :
  - *Fichiers concernés* : `backend/src/middleware/validate.js`, `backend/src/utils/validation.js`.
  - *Implémentation* : Validation par schémas Zod stricts avant toute entrée dans les contrôleurs. Rejet systématique des données non conformes avec code 400 et détail des champs erronés.
- **Limitation de Débit Distribuée et Résiliente (Rate Limiting)** :
  - *Fichier concerné* : `backend/src/middleware/rateLimiter.js`.
  - *Architecture* : Implémentation d'une classe personnalisée `RedisRateLimitStore` exécutant un script atomique Lua (`INCR` + `PEXPIRE`) sur Redis, assurant le partage strict des quotas entre plusieurs instances backend.
  - *Dégradation gracieuse* : En cas de panne ou déconnexion de Redis, le limiteur bascule automatiquement sur un `MemoryStore` en mémoire locale, évitant ainsi le blocage de l'API tout en maintenant la protection anti-brute-force.
  - *Quotas configurés* :
    - Inscription : 10 requêtes / 30 min (`rl:register:`).
    - Connexion : 15 requêtes / 15 min (`rl:login:`).
    - Validation OTP : 15 requêtes / 10 min (`rl:otp_verify:`).
    - Renvoi OTP : 5 requêtes / 15 min (`rl:otp_resend:`).
    - Annuaire public : 120 requêtes / 5 min (`rl:public_dir:`).
- **En-têtes de Sécurité HTTP** :
  - *Fichier concerné* : `backend/src/app.js`.
  - *Helmet* configuré avec politiques `crossOriginResourcePolicy: cross-origin` et `crossOriginOpenerPolicy: same-origin-allow-popups`.

### 4. Sessions Publiques et Tchat Client Sans Compte
- *Fichiers concernés* : `backend/src/controllers/publicCompanyController.js`, `backend/src/services/publicCompanyService.js`.
- *Fonctionnement* : Les clients anonymes peuvent dialoguer avec le SAV via `POST /api/public/companies/:slug/chat`.
- *Protection cryptographique à divulgation nulle* :
  1. Lors du premier message, le backend génère un jeton aléatoire de 256 bits (`rawToken = crypto.randomBytes(32).toString("hex")`).
  2. Le serveur calcule l'empreinte SHA-256 (`tokenHash = hashToken(rawToken)`) et stocke uniquement cette empreinte dans `conversations.publicTokenHash`.
  3. Le jeton brut est transmis au navigateur du visiteur via le header/corps de réponse.
  4. Pour chaque lecture ou écriture ultérieure, le client fournit son jeton dans le header `X-Conversation-Token`. Le serveur recalcule le hash et effectue une vérification en temps constant (`crypto.timingSafeEqual`).
  5. *Résultat* : Même en cas de fuite de la base de données, les jetons clients ne peuvent être reconstitués, et un tiers ne peut pas deviner ou intercepter les conversations d'un autre client.

### 5. Sécurité Financière et Webhooks SasPay
- *Fichiers concernés* : `backend/src/controllers/saspayWebhookController.js`, `backend/src/security/financialTrustAuthority.js`, `backend/src/security/financialVerificationGateway.js`.
- *Invariants de sécurité implémentés* :
  1. *Vérification de signature HMAC-SHA256* : Calculée sur le buffer binaire exact de la requête (`req.rawBody`) préservé par Express, éliminant tout risque d'invalidation lié à la re-sérialisation JSON.
  2. *Fenêtre de fraîcheur temporelle* : Rejet immédiat de toute requête dont l'horodatage dépasse 300 secondes (anti-rejeu réseau).
  3. *Autorité de confiance financière (Financial Trust Authority)* : Émission de preuves cryptographiques infalsifiables (`capability tokens`) scellées par HMAC-SHA256 avec une clé de 256 bits dédiée (`INTERNAL_FINANCIAL_SECRET`).
  4. *Anti-rejeu persistant multi-processus* : Chaque preuve consommée est enregistrée dans la table PostgreSQL `consumed_financial_proofs` avec une contrainte d'unicité, interdisant formellement l'activation multiple d'un même paiement sur plusieurs instances concurrentes.

### 6. Sécurité de l'Infrastructure Réseau et Conteneurs
- *Fichiers concernés* : `docker-compose.yml`, `docker/nginx/nginx.conf`.
- *Principe du moindre privilège réseau* :
  - Seul le service `nginx` publie un port sur la machine hôte (`80:80`).
  - `backend` (port 4000), `frontend` (port 3000), `postgres` (port 5432) et `redis` (port 6379) sont **strictement confinés** au réseau pont virtuel `zadesk-network` et invisibles depuis l'extérieur de la machine hôte.
  - Absence totale d'accès direct non filtré aux bases de données depuis Internet.
- *Reverse Proxy Nginx étanche* :
  - Re-résolution DNS interne Docker dynamique (`resolver 127.0.0.11 valid=5s`).
  - Transmission propre des adresses IP d'origine via `X-Real-IP` et `X-Forwarded-For`.
  - Configuration spécifique `X-Accel-Buffering: no` pour maintenir l'intégrité des flux temps réel SSE.

---

# 3.5.4 DIFFICULTÉS TECHNIQUES RENCONTRÉES ET SOLUTIONS APPORTÉES

L'analyse de l'historique du projet, des scripts de migration et des tests unitaires/d'intégration met en évidence 8 défis techniques majeurs surmontés :

### 1. Risque d'homonymie et de collision des noms d'entreprises (Multi-Pays)
- **Difficulté identifiée** : Deux entreprises légitimes peuvent porter le même nom commercial si elles opèrent dans des pays différents (ex: "Boulangerie Centrale" au Congo vs au Cameroun). Cependant, au sein d'une même juridiction, les doublons d'onboarding créaient des conflits de redirection et d'affichage dans l'annuaire.
- **Solution apportée** :
  - Création d'une fonction de normalisation Unicode stricte (`normalizeCompanyName` dans `validation.js`) qui supprime les accents, la ponctuation et harmonise la casse.
  - Établissement d'une contrainte d'unicité composite `normalizedName + country`.
  - Exécution du script de migration `migrate_uniqueness_and_onboarding.js` : détection des doublons historiques, sauvegarde intégrale en snapshot JSON (`backup_workspaces_*.json`), renommage non-destructif des entrées historiques avec suffixe `#legacy-<id>`, et application de l'index unique PostgreSQL sans perte de données.

### 2. Risque de perte d'événements asynchrones (Dual-Write Problem)
- **Difficulté identifiée** : Lorsqu'un ticket était créé ou qu'un statut changeait, le backend devait à la fois enregistrer la modification dans PostgreSQL et publier un job dans BullMQ/Redis. Si le serveur plantait ou que Redis était indisponible entre les deux opérations, l'événement était irrémédiablement perdu (incohérence des notifications et des métriques).
- **Solution apportée** :
  - Implémentation du **Transactional Outbox Pattern** (`backend/src/outbox/outboxDispatcher.js`).
  - L'événement est écrit dans la table PostgreSQL `outbox_events` au sein de la transaction SQL même de l'opération métier (`createOutboxEvent(tx, ...)`).
  - Un dispatcher asynchrone lit les événements en attente par lot via `FOR UPDATE SKIP LOCKED`, les publie dans Redis/BullMQ, et ne valide leur passage à l'état `PUBLISHED` qu'après accusé de réception de Redis.

### 3. Saturation mémoire de Redis sous politique `noeviction`
- **Difficulté identifiée** : Dans `docker-compose.yml`, Redis est configuré avec `--maxmemory 128mb --maxmemory-policy noeviction`. Cette politique garantit qu'aucune clé de sécurité (tokens, rate-limiting) n'est arbitrairement supprimée. Cependant, l'accumulation de millions de jobs BullMQ terminés provoquait des erreurs `OOM command not allowed when used memory > 'maxmemory'`.
- **Solution apportée** :
  - Configuration stricte des options d'élagage BullMQ dans `DEFAULT_JOB_OPTIONS` (`queueManager.js`) : `removeOnComplete: { count: 100, age: 3600 }` et `removeOnFail: { count: 500, age: 86400 }`.
  - Mise en place d'un job de maintenance planifié (`scheduleRecurringMaintenance` dans `maintenanceJobs.js`) purgeant périodiquement les sessions expirées et les clés temporaires.
  - Validation expérimentale documentée dans la suite de tests `redis_memory_pressure_noeviction.test.js`.

### 4. Blocage du streaming temps réel SSE par le buffering Nginx
- **Difficulté identifiée** : Par défaut, Nginx accumule les données proxy dans un tampon mémoire (`proxy_buffering on`) avant de les envoyer au client. Pour les flux Server-Sent Events (`/pulse/stream`), cela empêchait la réception instantanée des messages de chat, les événements n'arrivant que lorsque le tampon de plusieurs kilo-octets était rempli.
- **Solution apportée** :
  - Injection de l'en-tête HTTP standard `X-Accel-Buffering: no` dans la réponse Express dès l'initialisation du flux (`pulseEventService.js`).
  - Configuration explicite dans `nginx.conf` de la directive `proxy_http_version 1.1;` avec transmission des en-têtes de connexion persistante.

### 5. Échec de validation des webhooks SasPay suite au parsing JSON
- **Difficulté identifiée** : La vérification d'une signature cryptographique HMAC-SHA256 requiert la chaîne binaire exacte reçue du client. Dès lors qu'`express.json()` analysait la requête, l'objet JavaScript résultant perdait les espaces et l'ordonnancement exact des clés, rendant `JSON.stringify(req.body)` incompatible avec la signature originale.
- **Solution apportée** :
  - Utilisation de la fonction de vérification native de body-parser dans `app.js` :
    ```javascript
    express.json({
      limit: "10mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
    ```
  - `saspayWebhookController.js` effectue la vérification cryptographique directement sur `req.rawBody`, garantissant un taux de succès de vérification de 100 %.

### 6. Continuité du service face à la défaillance temporaire de Redis
- **Difficulté identifiée** : Si le serveur de cache Redis redémarrait ou devenait inaccessible, l'ensemble des requêtes protégées par le limiteur de débit ou faisant appel au cache risquaient de s'interrompre avec des erreurs HTTP 500.
- **Solution apportée** :
  - Développement d'un pattern de dégradation gracieuse (*Circuit Breaker / Fallback*) dans `CacheService` et `RedisRateLimitStore`.
  - En mode dégradé, les compteurs sont maintenus temporairement dans un cache mémoire local par processus (`MemoryStore`), avec réduction dynamique des quotas sensibles pour compenser la non-distribution, et restauration automatique dès que l'événement `ready` de Redis est émis.

### 7. Sécurisation des conversations publiques sans compte utilisateur
- **Difficulté identifiée** : Offrir aux clients finaux la possibilité de contacter un SAV sans formulaire d'inscription fastidieux, tout en empêchant un attaquant d'accéder aux messages d'un tiers ou d'injecter des réponses frauduleuses.
- **Solution apportée** :
  - Architecture de jeton d'accès aveugle (*Blind Token Pattern*) : génération d'un token aléatoire de 256 bits retourné au client, stockage strict de son hash SHA-256 dans PostgreSQL, et contrôle d'accès systématique par comparaison en temps constant (`verifyTokenHash` avec `crypto.timingSafeEqual`).

### 8. Énumération des utilisateurs via les flux d'authentification
- **Difficulté identifiée** : Lors de l'inscription ou de la connexion (notamment via Google OAuth ou réinitialisation de mot de passe), renvoyer des messages d'erreur différenciés (ex: "Email introuvable" vs "Mot de passe incorrect") permettait à des tiers malveillants d'établir la liste des utilisateurs enregistrés sur la plateforme.
- **Solution apportée** :
  - Harmonisation des retours avec le message neutre `NEUTRAL_AUTH_ERROR_MESSAGE` ("Impossible de poursuivre avec ces informations...").
  - Validation formelle du comportement dans la suite de tests `google_oauth_anti_enumeration.test.js`.

---

# 3.5.5 SYNTHÈSE POUR LA RÉDACTION DU MÉMOIRE

###  Éléments directement exploitables et vérifiés dans le code
1. **L'architecture backend** : Monolithe modulaire en couches clairement structuré (`routes -> controllers -> services -> middleware -> prisma/redis`).
2. **Le modèle multi-tenant** : Schéma partagé PostgreSQL avec clé composite `userId_workspaceId` sur `memberships` et validation systématique via `requireWorkspaceRole`.
3. **La pile technologique réelle** : Versions vérifiées (Next.js 15.1.6, React 19, Express 4.21.2, PostgreSQL 16, Redis 7, BullMQ 6.5.3, Nginx Alpine, Docker Compose).
4. **Les mécanismes de sécurité de premier plan** : Authentification OTP à 2 étapes avec jetons temporaires signés HMAC, mots de passe bcrypt 12 rounds, limitation de débit distribuée via Lua, autorité de confiance financière anti-rejeu et isolation réseau totale des conteneurs.
5. **Le flux temps réel** : Implémentation complète de Server-Sent Events (SSE) via `pulseEventService.js` avec bus Redis Pub/Sub et tampon circulaire de reprise.
6. **Le traitement asynchrone robuste** : Transactional Outbox Pattern avec verrou `FOR UPDATE SKIP LOCKED` et worker autonome `workerRunner.js`.

###  Clarifications et distinctions académiques obligatoires
1. **RAG, MongoDB et Cloudflare Workers AI** :
   - *À présenter impérativement comme* : **Une architecture cible documentée**.
   - *Précision factuelle* : Le modèle RAG (avec `KnowledgeDocument`, `KnowledgeChunk` et vecteurs denses) est documenté dans le diagramme de classes et la feuille de route architecturale, mais le système opérationnel actuel exécute le support SAV en direct (tchat client/agent et auto-attribution déterministe par compétences). Aucune dépendance MongoDB ou Workers AI n'est active dans le runtime Docker.
2. **Microservices vs Monolithe** :
   - *Terminologie rigoureuse* : Ne pas employer le terme "microservices". Le backend est un **monolithe modulaire en couches** accompagné d'un **worker de traitement asynchrone découplé**, ce qui constitue le standard d'ingénierie moderne pour ce type de plateforme SaaS.
