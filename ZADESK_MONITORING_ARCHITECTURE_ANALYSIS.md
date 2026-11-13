# Zadesk — Architecture Monitoring & Observability
**Document d'ingénierie & d'étude architecturale préliminaire**  
*Date de l'étude : 28 Septembre 2026*  
*Statut : Document de conception architecturale (Ne modifie aucun code ni conteneur existant)*

---

## 1. Executive Summary

La présente étude architecturale définit la stratégie, la conception et le dimensionnement du futur système de monitoring, de métrologie et d'observabilité de la plateforme **Zadesk**.

Actuellement, Zadesk est un SaaS de SAV omnicanal articulé autour d'un conteneur Nginx frontal, d'un frontend Next.js 14, d'un backend Node.js/Express, d'une base relationnelle PostgreSQL 16 et d'un cache Redis 7. Bien que fonctionnelle, l'infrastructure actuelle souffre d'un **angle mort opérationnel quasi-total** :
1. **Absence de métriques applicatives et système** : aucun exporteur, aucun endpoint `/metrics`, aucune visibilité sur la latence p95/p99, les taux d'erreur HTTP 5xx, l'état du pool de connexions Prisma ou l'activité Redis.
2. **Absence de logs centralisés et structurés** : les journaux sont émis en texte brut non structuré sur la sortie standard (`stdout`), sans identifiant de corrélation (`correlationId`), et disparaissent lors du recyclage des conteneurs.
3. **Health checks incomplets** : l'endpoint `/api/health` est un mock renvoyant statiquement `{ status: "ok" }` sans sonder la connectivité réelle de PostgreSQL ni de Redis.
4. **Vulnérabilités de sécurité et d'isolation préalables** : identifiées lors de l'audit de sécurité (absence de TLS/HTTPS, secrets et mots de passe par défaut, failles d'isolation IDOR).

Pour permettre à Zadesk de monter en charge et d'adresser des grands comptes (opérateurs télécoms comme MTN ou Airtel, institutions bancaires et assurances), l'observabilité ne peut pas être un simple "assemblage hétérogène" de conteneurs tiers déployés sur le même réseau. Elle doit répondre à des critères d'entreprise rigoureux :
- **Sécurité et étanchéité réseau absolue** : aucun exporteur (Node Exporter, cAdvisor, PostgreSQL Exporter, Redis Exporter) ni service de collecte (Prometheus, Loki, Alertmanager) ne doit être accessible depuis Internet. Seul Grafana peut être exposé, impérativement derrière Nginx, en HTTPS avec authentification forte et RBAC.
- **Cloisonnement multi-tenant des métriques** : distinction formelle et stricte entre métriques d'infrastructure (globales et anonymisées) et métriques métiers (agrégées par `workspaceId` sous forme de compteurs non sensibles), afin de prévenir tout risque de fuite de données inter-entreprises.
- **Sanitisation stricte des logs** : interdiction formelle de journaliser des données personnelles (PII), jetons de session, codes OTP ou secrets d'API tiers (tokens Meta WhatsApp, clés Zavu).
- **Sobriété des ressources (Empreinte VPS)** : sur un serveur VPS de taille intermédiaire (ex: 4 vCPU, 8 Go RAM), le déploiement naïf de la suite complète (Prometheus + Grafana + Loki + Promtail + cAdvisor + Node Exporter + PG Exporter + Redis Exporter + Alertmanager) consommerait entre 2,5 et 3,5 Go de mémoire vive. Une approche par étapes, avec des composants légers (ex: VictoriaMetrics ou Prometheus optimisé, Promtail allégé, rétention calibrée) est indispensable.

Ce document présente l'analyse critique de chaque composant, les topologies cibles (SaaS mutualisé, Dédié, On-Premise souverain), les flux réseau, la matrice d'alertes opérationnelles et le plan de migration par phases.

---

## 2. Architecture actuelle

### 2.1 Topologie des conteneurs et réseau

L'analyse du fichier [docker-compose.yml](file:///c:/Users/japhet/Downloads/zadesk/docker-compose.yml) et des fichiers sources met en évidence la topologie suivante :

```text
                               [ INTERNET ]
                                     │
                             Port 80 (HTTP clair)
                                     ▼
                          [ zadesk-nginx:alpine ]
                                     │
                     ┌───────────────┴───────────────┐
                     │ (location /)                  │ (location /api/)
                     ▼                               ▼
          [ zadesk-frontend ]             [ zadesk-backend ]
             Port 3000                       Port 4000
             (Next.js 14)                    (Express 4)
                                             │       │
                                             │       │
                     ┌───────────────────────┘       └───────────────────────┐
                     ▼                                                       ▼
          [ zadesk-postgres ]                                     [ zadesk-redis ]
             Port 5432                                               Port 6379
          (postgres:16-alpine)                                    (redis:7-alpine)
```

### 2.2 Caractéristiques techniques de l'infrastructure existante

| Composant | Image / Environnement | Ports exposés hôte | Ports internes | Healthcheck existant | Fichiers de référence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nginx** | `nginx:alpine` | `80:80` | `80` | Aucun | [docker-compose.yml:L2-L14](file:///c:/Users/japhet/Downloads/zadesk/docker-compose.yml#L2-L14), [docker/nginx/nginx.conf](file:///c:/Users/japhet/Downloads/zadesk/docker/nginx/nginx.conf) |
| **Frontend** | Node.js 22 Alpine (Next.js standalone) | Aucun | `3000` | Aucun | [frontend/Dockerfile](file:///c:/Users/japhet/Downloads/zadesk/frontend/Dockerfile) |
| **Backend** | Node.js 22 Alpine (Express 4) | Aucun | `4000` | Aucun | [backend/Dockerfile](file:///c:/Users/japhet/Downloads/zadesk/backend/Dockerfile), [backend/src/app.js](file:///c:/Users/japhet/Downloads/zadesk/backend/src/app.js) |
| **PostgreSQL** | `postgres:16-alpine` | Aucun | `5432` | `pg_isready -U zadesk -d zadesk` (5s/5s) | [docker-compose.yml:L96-L113](file:///c:/Users/japhet/Downloads/zadesk/docker-compose.yml#L96-L113) |
| **Redis** | `redis:7-alpine` | Aucun | `6379` | `redis-cli ping` (5s/3s) | [docker-compose.yml:L81-L95](file:///c:/Users/japhet/Downloads/zadesk/docker-compose.yml#L81-L95) |

### 2.3 Réseau et stockage actuels
- **Réseau** : Un unique réseau pont Docker (`zadesk-network`, driver `bridge`). Tous les conteneurs partagent le même sous-réseau sans aucune ségrégation de sécurité.
- **Volumes** :
  - `postgres_data` : persistance des tables SQL (`/var/lib/postgresql/data`).
  - `redis_data` : persistance AOF du cache (`/data`).
  - Bind mounts : `./docker/nginx/nginx.conf` (en lecture seule), et `./backend/src:/app/src` (montage de développement).

---

## 3. Problèmes observés

L'inspection détaillée de la base de code existante révèle les lacunes majeures suivantes :

1. **Endpoint de santé fictif (`/api/health`)** :
   Dans [backend/src/routes/index.js:L9-L15](file:///c:/Users/japhet/Downloads/zadesk/backend/src/routes/index.js#L9-L15) :
   ```javascript
   apiRouter.get("/health", (req, res) => {
     res.status(200).json({
       status: "ok",
       service: "zadesk-api",
       timestamp: new Date().toISOString(),
     });
   });
   ```
   Ce contrôleur renvoie un code HTTP 200 permanent sans interroger Prisma ni tester l'accès au pool PostgreSQL ou la disponibilité du socket Redis. Si la base s'arrête ou sature ses connexions, `/api/health` continue d'indiquer que l'API est saine.
2. **Absence d'instrumentation Prometheus** :
   Le backend ne dispose d'aucune dépendance de métrologie (ex: `prom-client`). Aucun endpoint `/metrics` n'est implémenté. Il est impossible de connaître l'utilisation mémoire du heap V8, l'Event Loop lag, le temps de réponse moyen par route, ou le nombre de requêtes HTTP en cours.
3. **Format des logs non structuré et non agrégé** :
   Dans [backend/src/utils/logger.js](file:///c:/Users/japhet/Downloads/zadesk/backend/src/utils/logger.js) :
   ```javascript
   export const logger = {
     info: (msg, meta = {}) => {
       console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? meta : "");
     },
     ...
   };
   ```
   Les logs sont émis sous forme de chaînes de caractères brutes. Ils ne respectent pas le standard JSON (ECS / Logstash), ne comportent pas d'identifiant de trace, et ne sont pas archivés ni ingérés par un moteur de recherche.
4. **Nginx sans module de métriques** :
   Le fichier [docker/nginx/nginx.conf](file:///c:/Users/japhet/Downloads/zadesk/docker/nginx/nginx.conf) n'expose pas de bloc `location /stub_status` ou `location /nginx_status`. Le débit de requêtes actives et le volume de connexions Nginx ne peuvent pas être collectés.
5. **Réseau Docker monolithique non cloisonné** :
   Tous les services cohabitent sur `zadesk-network`. Si un exporteur de monitoring vulnérable était ajouté à ce réseau, un attaquant pourrait l'utiliser comme passerelle pour atteindre la base de données PostgreSQL ou Redis.
6. **Absence d'alerting opérationnel** :
   Aucun mécanisme ne prévient l'équipe d'exploitation en cas de saturation de disque, de boucle de redémarrage de conteneur (`CrashLoopBackOff`), ou de pics anormaux de requêtes 500.

---

## 4. Objectifs du monitoring

Le futur système d'observabilité de Zadesk devra remplir cinq objectifs directeurs :

1. **Visibilité Infrastructure Complète** : Mesurer en continu l'usage CPU, RAM, I/O disque et bande passante du serveur hôte et de chaque conteneur Docker.
2. **Disponibilité Applicative & SLA** : Calculer en temps réel le taux de disponibilité (Uptime), le volume de requêtes par seconde (RPS), la distribution de latence (p50, p90, p99) et le taux d'erreurs (4xx / 5xx) conformément aux signaux dorés de Google (*Golden Signals: Latency, Traffic, Errors, Saturation*).
3. **Santé des Données & du Cache** : Surveiller le nombre de connexions actives à PostgreSQL, le temps d'exécution des requêtes, les deadlocks, la mémoire résidente de Redis et le ratio de cache hits/misses.
4. **Détection Proactive d'Incidents & Alerting** : Notifier l'équipe d'astreinte (via Slack, Teams, Email ou Webhook PagerDuty) avant que les utilisateurs ne subissent une panne.
5. **Observabilité Compatible Sécurité & RGPD** : Interdire la fuite d'informations confidentielles ou multi-tenants dans les métriques et les logs.

---

## 5. Analyse des composants

L'analyse d'éligibilité de chaque composant de l'écosystème d'observabilité moderne pour Zadesk est résumée ci-dessous :

### 5.1 Prometheus
- **Rôle** : Moteur de collecte (scraping), stockage temporel (TSDB) et évaluation des règles d'alerte pour les métriques numériques.
- **Ce qu'il surveille** : Les séries temporelles de l'ensemble des exporteurs et de l'API Zadesk.
- **Emplacement** : Conteneur dédié dans l'infrastructure de monitoring.
- **Communication** : Requêtes HTTP sortantes (scrape) vers les cibles sur un réseau interne Docker dédié.
- **Données collectées** : Valeurs numériques horodatées associées à des labels (ex: `http_requests_total{status="500", route="/api/auth/login"}`).
- **Sensibilité & Risques** : Les labels ne doivent JAMAIS contenir d'emails, de noms ou d'identifiants de session. Si Prometheus est exposé sur Internet, la topologie et l'activité interne de l'application sont divulguées.
- **Coût en ressources** : Modéré (250 à 512 Mo de RAM, 5 à 10% CPU, stockage disque TSDB proportionnel à la rétention).
- **Classification** : **INDISPENSABLE**.

### 5.2 Grafana
- **Rôle** : Plateforme de visualisation, création de tableaux de bord interactifs et gestion des droits d'accès visuels.
- **Ce qu'il surveille** : Affiche les tableaux de bord consolidés alimentés par Prometheus, PostgreSQL et Loki.
- **Emplacement** : Conteneur dédié, accessible via le reverse-proxy Nginx avec sous-domaine dédié (ex: `monitoring.zadesk.com`) ou port restreint.
- **Communication** : Requêtes HTTP internes vers Prometheus (port 9090) et Loki (port 3100).
- **Données collectées** : Métadonnées de dashboards, utilisateurs internes, requêtes de restitution.
- **Sensibilité & Risques** : Accès visuel à l'ensemble des performances de Zadesk. Risque critique en cas de mot de passe par défaut (`admin:admin`).
- **Coût en ressources** : Faible à modéré (150 à 300 Mo de RAM, faible CPU).
- **Classification** : **INDISPENSABLE**.

### 5.3 Node Exporter
- **Rôle** : Agent de collecte des métriques au niveau du système d'exploitation de la machine hôte (Linux/VPS).
- **Ce qu'il surveille** : CPU global, RAM physique, charge système (load average), swap, espace disque, I/O disques, trafic des interfaces réseau.
- **Emplacement** : Conteneur avec montage spécifique des namespaces hôte (`pid: host`, volumes `/proc`, `/sys`).
- **Communication** : Scrape par Prometheus sur le port `9100`.
- **Données collectées** : Métriques d'infrastructure pure (non applicatives).
- **Sensibilité & Risques** : Aucune donnée PII client. Cependant, son exposition publique divulguerait la version exacte du noyau Linux et les caractéristiques de la machine hôte.
- **Coût en ressources** : Extrêmement faible (15 à 30 Mo de RAM, <1% CPU).
- **Classification** : **INDISPENSABLE**.

### 5.4 cAdvisor (Container Advisor)
- **Rôle** : Collecte des statistiques de performance au niveau de chaque conteneur Docker individuel.
- **Ce qu'il surveille** : CPU, mémoire, I/O et bande passante consommés conteneur par conteneur (`zadesk-backend`, `zadesk-postgres`, etc.).
- **Emplacement** : Conteneur exécuté avec accès au socket Docker `/var/run/docker.sock` et aux dossiers cgroups `/sys/fs/cgroup`.
- **Communication** : Scrape par Prometheus sur le port `8080`.
- **Données collectées** : Noms des conteneurs, images, consommation instantanée et cumulée.
- **Sensibilité & Risques** : cAdvisor expose par défaut une interface web intégrée. Il est **impératif de ne pas mapper son port sur l'hôte** pour éviter que l'inventaire Docker ne soit accessible sur Internet.
- **Coût en ressources** : Modéré (60 à 150 Mo de RAM, 1 à 3% CPU).
- **Classification** : **RECOMMANDÉ**.

### 5.5 PostgreSQL Exporter
- **Rôle** : Exporteur officiel des métriques internes du moteur de base de données PostgreSQL.
- **Ce qu'il surveille** : Nombre de connexions au pool, transactions par seconde (TPS), rollbacks, deadlocks, taille des tables et des index, utilisation du cache (`pg_stat_database`, `pg_stat_activity`).
- **Emplacement** : Conteneur dédié raccordé au réseau base de données et au réseau monitoring.
- **Communication** : Connexion SQL directe à PostgreSQL (via utilisateur technique dédié avec droits `pg_monitor` en lecture seule) et écoute HTTP sur le port `9187`.
- **Données collectées** : Métriques statistiques globales du moteur SQL.
- **Sensibilité & Risques** : L'utilisateur de monitoring ne doit avoir accès à aucune donnée applicative des tables. Risque nul si le rôle est restreint à `pg_monitor` et sans accès `SELECT` sur les tables clients.
- **Coût en ressources** : Faible (30 à 60 Mo de RAM, <1% CPU).
- **Classification** : **RECOMMANDÉ**.

### 5.6 Redis Exporter
- **Rôle** : Collecteur des statistiques du serveur Redis via la commande `INFO`.
- **Ce qu'il surveille** : Mémoire résidente (`used_memory`), commandes par seconde, clients connectés, ratio de cache hit/miss, nombre de clés par base, évictions de clés.
- **Emplacement** : Conteneur dédié sur le réseau cache et le réseau monitoring.
- **Communication** : Connexion au socket ou port Redis `6379`, scrape Prometheus sur le port `9121`.
- **Données collectées** : Métriques globales du serveur de cache.
- **Sensibilité & Risques** : Aucune donnée de clé n'est renvoyée si l'exporteur est configuré sans scanner les clés individuelles.
- **Coût en ressources** : Très faible (20 à 40 Mo de RAM, <1% CPU).
- **Classification** : **RECOMMANDÉ**.

### 5.7 Loki & Promtail / Fluent-bit
- **Rôle** : Système d'agrégation, d'indexation légère par labels et de requêtage de logs (équivalent moderne et économe d'Elasticsearch).
- **Ce qu'il surveille** : Les flux de logs des conteneurs Nginx, Backend, PostgreSQL et Redis.
- **Emplacement** : Conteneur Loki (moteur de stockage) et conteneur Promtail (collecteur de logs Docker).
- **Communication** : Promtail lit les fichiers logs `/var/lib/docker/containers/*` ou le socket Docker et pousse les logs vers Loki (port 3100) en HTTP interne. Grafana interroge Loki.
- **Données collectées** : Lignes de logs complètes horodatées.
- **Sensibilité & Risques** : **ZONE DE RISQUE LA PLUS ÉLEVÉE**. Les logs applicatifs peuvent contenir des données personnelles, des identifiants d'erreur avec tokens ou des adresses IP. Des règles de filtrage/masquage doivent être configurées dès l'ingestion dans Promtail.
- **Coût en ressources** : Modéré à élevé (300 Mo à 1 Go de RAM pour Loki selon l'index et le volume, stockage disque significatif).
- **Classification** : **RECOMMANDÉ (Phase 2)**. Pour un premier démarrage avec ressources limitées, la rotation native des logs Docker peut suffire temporairement, mais Loki devient indispensable dès l'entrée en production multi-entreprises.

### 5.8 Alertmanager
- **Rôle** : Gestionnaire de déduplication, de regroupement, de routage et de notification des alertes déclenchées par Prometheus.
- **Ce qu'il surveille** : Les états d'alerte calculés par Prometheus.
- **Emplacement** : Conteneur dédié sur le réseau monitoring interne.
- **Communication** : Prometheus envoie les alertes à Alertmanager sur le port `9093`. Alertmanager contacte les passerelles externes (Slack, Webhook, SMTP).
- **Données collectées** : Données d'alerte, descriptions textuelles, sévérités.
- **Sensibilité & Risques** : Risque de fuite d'informations dans les notifications publiques si les messages d'alerte incluent des données sensibles.
- **Coût en ressources** : Très faible (30 à 50 Mo de RAM, <1% CPU).
- **Classification** : **INDISPENSABLE (dès l'activation de Prometheus)**.

### Tableau récapitulatif de classification

| Composant | Statut architectural | Justification |
| :--- | :--- | :--- |
| **Prometheus** | **INDISPENSABLE** | Cœur de la métrologie temporelle, standard absolu de l'industrie. |
| **Grafana** | **INDISPENSABLE** | Interface unique d'observabilité visuelle et d'audit pour les équipes. |
| **Node Exporter** | **INDISPENSABLE** | Détection vitale des saturations CPU/RAM/Disque de la machine hôte. |
| **Alertmanager** | **INDISPENSABLE** | Nécessaire pour être prévenu proactivement des pannes sans scruter l'écran. |
| **cAdvisor** | **RECOMMANDÉ** | Identification immédiate du conteneur spécifique consommant la mémoire. |
| **PostgreSQL Exporter** | **RECOMMANDÉ** | Indispensable pour prévenir la saturation du pool de connexions Prisma. |
| **Redis Exporter** | **RECOMMANDÉ** | Surveillance de l'éviction de cache et des fuites mémoires Redis. |
| **Loki + Promtail** | **RECOMMANDÉ** | Traçabilité des erreurs applicatives et audit trail centralisé. |
| **OpenTelemetry / Jaeger** | **NON NÉCESSAIRE POUR LE MOMENT** | Le tracing distribué microservices est inutile sur l'architecture monolithique actuelle de Zadesk. |

---

## 6. Architecture proposée

L'architecture recommandée segmente strictement le trafic utilisateur, le trafic interne de données et le trafic d'observabilité :

```text
====================================================================================================
                                      ARCHITECTURE CIBLE ZADESK
====================================================================================================

                                       [ INTERNET SÉCURISÉ ]
                                                 │
                                           HTTPS (Port 443)
                                                 │
                                                 ▼
                           ┌───────────────────────────────────────────┐
                           │            NGINX REVERSE PROXY            │
                           │  - Terminaison SSL/TLS 1.3                │
                           │  - Headers de sécurité (HSTS, CSP)        │
                           │  - Filtrage IP sur /monitoring            │
                           └─────────────────────┬─────────────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   │                             │                             │
    app.zadesk.com │              api.zadesk.com │              grafana.zadesk.com (ou IP restreinte)
                   ▼                             ▼                             ▼
       ┌───────────────────────┐     ┌───────────────────────┐     ┌───────────────────────┐
       │   zadesk-frontend     │     │    zadesk-backend     │     │        GRAFANA        │
       │   (Next.js 14)        │     │  (Express + Metrics)  │     │ - Auth forte / OAuth  │
       │   Port 3000           │     │  Port 4000            │     │ - Dashboards Zadesk   │
       └───────────────────────┘     └───────────┬───────────┘     └───────────▲───────────┘
                                                 │                             │ (Datasources)
                                                 │                             ├──────────────┐
                   ┌─────────────────────────────┴───────────┐                 │              │
                   ▼                                         ▼                 │              │
       ┌───────────────────────┐                 ┌───────────────────────┐     │              │
       │    zadesk-postgres    │                 │     zadesk-redis      │     │              │
       │  (PostgreSQL 16)      │                 │  (Redis 7 avec auth)  │     │              │
       │  Port 5432            │                 │  Port 6379            │     │              │
       └───────────▲───────────┘                 └───────────▲───────────┘     │              │
                   │                                         │                 │              │
                   │ (pg_monitor)                            │ (AUTH info)     │              │
       ┌───────────┴───────────┐                 ┌───────────┴───────────┐     │              │
       │  postgres-exporter    │                 │    redis-exporter     │     │              │
       │  Port 9187            │                 │    Port 9121          │     │              │
       └───────────▲───────────┘                 └───────────▲───────────┘     │              │
                   │                                         │                 │              │
                   └────────────────────┬────────────────────┘                 │              │
                                        │                                      │              │
       ┌───────────────────────┐        │ (Scrape HTTP)            ┌───────────┴───────────┐  │
       │     node-exporter     ├────────┤                          │      PROMETHEUS       │  │
       │  Port 9100 (Host)     │        │                          │ - Scrape TSDB         │  │
       └───────────────────────┘        ├─────────────────────────►│ - Évaluation alertes  │  │
                                        │                          │ Port 9090             │  │
       ┌───────────────────────┐        │                          └───────────┬───────────┘  │
       │       cadvisor        ├────────┘                                      │              │
       │  Port 8080 (Docker)   │                                               ▼              │
       └───────────────────────┘                                    ┌────────────────────┐    │
                                                                    │    ALERTMANAGER    │    │
       ┌───────────────────────┐                                    │ - Webhook / Slack  │    │
       │       PROMTAIL        │                                    │ Port 9093          │    │
       │  (Lecteur logs Docker)├────────────────────────────────┐   └────────────────────┘    │
       └───────────────────────┘                                │                             │
                                                                ▼                             │
                                                   ┌─────────────────────────┐                │
                                                   │          LOKI           │◄───────────────┘
                                                   │  (Stockage de logs)     │
                                                   │  Port 3100              │
                                                   └─────────────────────────┘
====================================================================================================
```

---

## 7. Flux réseau

### 7.1 Segmentation en 3 réseaux Docker isolés

Pour respecter le principe de moindre privilège (*Least Privilege Network Isolation*), l'architecture sépare l'environnement en 3 réseaux distincts :

1. `frontend-network` :
   - Conteneurs : `zadesk-nginx`, `zadesk-frontend`, `zadesk-backend`.
   - Rôle : acheminement du trafic HTTP/HTTPS utilisateur.
2. `backend-network` :
   - Conteneurs : `zadesk-backend`, `zadesk-postgres`, `zadesk-redis`, `postgres-exporter`, `redis-exporter`.
   - Rôle : transactions relationnelles, requêtes de cache et sondage des moteurs de données.
3. `monitoring-network` :
   - Conteneurs : `zadesk-nginx`, `prometheus`, `grafana`, `loki`, `promtail`, `alertmanager`, `node-exporter`, `cadvisor`, `postgres-exporter`, `redis-exporter`, `zadesk-backend`.
   - Rôle : collecte des métriques et ingestion des logs.

### 7.2 Matrice des flux et exposition des ports

| Service | Port interne | Réseau Docker | Exposé sur l'Hôte ? | Accessibilité Internet |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx** | `80`, `443` | `frontend-network`, `monitoring-network` | **OUI** (`80:80`, `443:443`) | **Publique** (Terminaison TLS) |
| **Frontend** | `3000` | `frontend-network` | **NON** | Via Nginx uniquement |
| **Backend API** | `4000` | `frontend-network`, `backend-network`, `monitoring-network` | **NON** | `/api/` via Nginx, `/metrics` via Prometheus |
| **PostgreSQL** | `5432` | `backend-network` | **NON** | **Strictement isolé** |
| **Redis** | `6379` | `backend-network` | **NON** | **Strictement isolé** |
| **Prometheus** | `9090` | `monitoring-network` | **NON** | Réservé à Grafana et Alertmanager |
| **Grafana** | `3000` | `monitoring-network` | **NON** | Via Nginx (`/grafana` ou sous-domaine avec auth) |
| **Node Exporter** | `9100` | `monitoring-network` | **NON** | **Strictement interne** |
| **cAdvisor** | `8080` | `monitoring-network` | **NON** | **Strictement interne** |
| **Postgres Exporter** | `9187` | `backend-network`, `monitoring-network` | **NON** | **Strictement interne** |
| **Redis Exporter** | `9121` | `backend-network`, `monitoring-network` | **NON** | **Strictement interne** |
| **Loki** | `3100` | `monitoring-network` | **NON** | **Strictement interne** |
| **Alertmanager** | `9093` | `monitoring-network` | **NON** | **Strictement interne** (sorties webhooks autorisées) |

---

## 8. Sécurité

L'infrastructure d'observabilité manipulant des métadonnées de fonctionnement critiques, elle constitue une cible de choix si elle n'est pas blindée.

### 8.1 Réponses aux questions de sécurité critiques

1. **Qui peut accéder à Grafana ?**
   - L'accès doit être réservé exclusivement aux administrateurs techniques de Zadesk et aux ingénieurs DevOps désignés.
   - Les comptes par défaut (`admin / admin`) doivent être obligatoirement désactivés lors du déploiement via variables d'environnement (`GF_SECURITY_ADMIN_PASSWORD`).
   - L'authentification Grafana doit s'appuyer sur l'OAuth Google d'entreprise ou du SSO interne avec attribution stricte des rôles (*Admin*, *Editor*, *Viewer*).
2. **Qui peut accéder à Prometheus et Loki ?**
   - Aucun utilisateur direct. Seul le service Grafana doit posséder les accès aux ports 9090 (Prometheus) et 3100 (Loki) via le réseau privé `monitoring-network`.
3. **Faut-il exposer Prometheus, cAdvisor ou Node Exporter publiquement ?**
   - **NON, SOUS AUCUN PRÉTEXTE.** L'exposition de ces composants permettrait à un tiers de cartographier la charge du serveur, les faiblesses mémoires, les versions d'OS et de conteneurs, facilitant les attaques par déni de service ou l'exploitation de failles ciblées.
4. **Comment protéger les logs contre la fuite de secrets et de données personnelles (PII) ?**
   - **Niveau Backend** : refactoriser le logger pour appliquer un filtre de masquage systématique sur les clés sensibles : `password`, `token`, `otp`, `accessToken`, `cookie`, `sessionToken`, `creditCard`.
   - **Niveau Promtail (Ingestion)** : mise en œuvre de pipelines de réécriture par expressions régulières (*stage regex / replace*) pour caviarder toute valeur suspecte (tokens JWT, clés d'API) avant transmission à Loki.
   - **Niveau Nginx** : configurer le format d'access log pour logger l'empreinte de la requête sans capturer les cookies ni les en-têtes d'autorisation `Authorization: Bearer ...`.

---

## 9. Multi-tenancy

L'un des défis majeurs pour Zadesk, en tant que plateforme SaaS B2B, est de garantir qu'une entreprise cliente ne puisse **jamais observer les métriques d'une autre entreprise**.

### 9.1 Découplage strict : Métriques d'infrastructure vs Métriques applicatives

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   NIVEAU 1 : MONITORING INFRASTRUCTURE                 │
│  - Totalement agnostique des entreprises clientes                      │
│  - CPU, RAM, I/O Disque, Swap du serveur                               │
│  - Utilisation globale de PostgreSQL et de Redis                       │
│  - Métriques globales Nginx (Trafic global, code 2xx/4xx/5xx global)   │
│  -> DESTINATION : Équipe d'infrastructure Zadesk UNIQUEMENT            │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                   NIVEAU 2 : MÉTRIQUES APPLICATIVES MUTUALISÉES        │
│  - Granularité par workspaceId autorisée UNIQUEMENT sur compteurs agrégés│
│  - Exemples :                                                          │
│      zadesk_http_requests_total{workspace="ws_abc123", route="/tickets"}│
│      zadesk_active_conversations{workspace="ws_abc123"}                │
│  - STRICTEMENT INTERDIT dans les labels :                              │
│      - Pas d'email client                                              │
│      - Pas de nom de client                                            │
│      - Pas de numéro de téléphone                                      │
│      - Pas de contenu de message                                       │
│  -> DESTINATION : Tableaux de bord internes de suivi de charge         │
└────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Prévention de l'explosion de cardinalité
Si un label Prometheus contient une valeur à haute cardinalité (comme un identifiant de session ou un numéro de téléphone client), Prometheus s'effondre en mémoire vive.
- **Règle absolue** : Les labels Prometheus de Zadesk doivent se limiter à des ensembles finis et contrôlés : `workspace_id`, `route`, `method`, `status_code`, `channel`.

---

## 10. Metrics

### 10.1 Métriques d'Infrastructure (Node Exporter & cAdvisor)
- `node_cpu_seconds_total` : temps processeur par mode (idle, user, system, iowait).
- `node_memory_MemAvailable_bytes` / `node_memory_MemTotal_bytes` : mémoire vive réelle disponible.
- `node_filesystem_free_bytes` / `node_filesystem_size_bytes` : saturation du disque système.
- `container_cpu_usage_seconds_total` : CPU consommé par conteneur (`zadesk-backend`, etc.).
- `container_memory_working_set_bytes` : RAM active consommée par chaque conteneur.
- `container_network_transmit_bytes_total` / `container_network_receive_bytes_total`.

### 10.2 Métriques Nginx
- `nginx_connections_active` : nombre de connexions clientes simultanées.
- `nginx_http_requests_total` : requêtes par code HTTP (`2xx`, `3xx`, `4xx`, `5xx`).

### 10.3 Métriques Backend Node.js / Express (via `prom-client`)
- `nodejs_eventloop_lag_seconds` : délai d'exécution de la boucle d'événements (indicateur vital de saturation Node.js).
- `nodejs_heap_size_used_bytes` / `nodejs_heap_size_total_bytes` : détection des fuites de mémoire.
- `zadesk_http_request_duration_seconds_bucket` (Histogramme) : latences p50, p95, p99 par route.
- `zadesk_http_requests_total` (Compteur) : total requêtes par méthode, code statut et route.
- `zadesk_auth_attempts_total{status="success|failure", method="otp|password|google"}` : détection d'attaques par force brute.
- `zadesk_turnstile_verifications_total{result="success|failure|replayed"}` : surveillance du taux de blocage bot.

### 10.4 Métriques PostgreSQL (via PostgreSQL Exporter)
- `pg_stat_database_numbackends` : nombre de connexions ouvertes sur la base `zadesk`.
- `pg_stat_database_xact_commit` / `pg_stat_database_xact_rollback` : ratio de succès des transactions.
- `pg_stat_database_deadlocks` : détection des blocages concurrentiels.
- `pg_stat_activity_max_tx_duration` : détection des requêtes SQL lentes bloquant des ressources.

### 10.5 Métriques Redis (via Redis Exporter)
- `redis_connected_clients` : connexions clientes au cache.
- `redis_memory_used_bytes` / `redis_memory_max_bytes` : pression mémoire sur Redis.
- `redis_keyspace_hits_total` / `redis_keyspace_misses_total` : efficacité du cache applicatif.
- `redis_evicted_keys_total` : clés purgées prématurément par manque d'espace mémoire.

### 10.6 Métriques des Intégrations Externes
- `zadesk_external_api_duration_seconds{provider="zavu|meta|google|cloudflare"}`.
- `zadesk_external_api_failures_total{provider="zavu|meta|google|cloudflare", code="..."}`.

---

## 11. Logging

### 11.1 Format structuré standardisé (JSON)
L'implémentation d'une bibliothèque de logging structuré (telle que `pino` ou `winston`) doit remplacer les appels basiques `console.log` du fichier [backend/src/utils/logger.js](file:///c:/Users/japhet/Downloads/zadesk/backend/src/utils/logger.js).

Chaque ligne émise doit adopter la structure JSON suivante :
```json
{
  "timestamp": "2026-09-28T23:45:00.123Z",
  "level": "info",
  "service": "zadesk-backend",
  "environment": "production",
  "traceId": "c8a4b67d-912f-4e31-8f55-123456789abc",
  "spanId": "4f8a92bc10234a9b",
  "userId": "usr_9921",
  "workspaceId": "ws_alpha1",
  "method": "POST",
  "route": "/api/workspaces/ws_alpha1/conversations",
  "statusCode": 200,
  "durationMs": 42.5,
  "message": "Requête traitée avec succès"
}
```

### 11.2 Injection de `CorrelationId` / `Request-ID`
Un middleware dédié en amont de la chaîne Express génère un UUID v4 unique (`X-Request-ID`) s'il n'est pas fourni par Nginx. Cet identifiant est injecté dans le contexte asynchrone (`AsyncLocalStorage`) et systématiquement attaché à chaque trace et log généré pendant le cycle de vie de la requête.

### 11.3 Pipeline de collecte et ingestion Loki
1. Les conteneurs émettent leurs logs au format JSON sur `stdout` via le pilote de journalisation standard Docker (`json-file` avec rotation : max-size 50m, max-file 3).
2. **Promtail** monte le répertoire `/var/lib/docker/containers` en lecture seule.
3. Promtail extrait les labels Docker (`container_name`, `service`) et parse le JSON applicatif.
4. Promtail pousse les flux compressés vers **Loki**.
5. **Grafana Explore** permet d'exécuter des requêtes LogQL avancées (ex: `{service="zadesk-backend"} |= "error" | json | durationMs > 500`).

---

## 12. Alerting

La matrice suivante définit les seuils critiques et les procédures opérationnelles recommandées :

| Domaine | Alerte | Condition Prometheus | Sévérité | Fréquence / Délai | Risque faux positif | Action recommandée |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hôte** | `HostDiskFillingUp` | Espace libre < 15% sur `/` | **CRITIQUE** | Maintien pendant 5 min | Faible | Purge des logs Docker, suppression des images Docker orphelines. |
| **Hôte** | `HostHighCPU` | Usage CPU global > 90% | **ÉLEVÉ** | Maintien pendant 10 min | Moyen | Identifier le conteneur fautif via cAdvisor (boucle infinie ou trafic DDoS). |
| **Hôte** | `HostOutOfMemory` | RAM disponible < 10% | **CRITIQUE** | Maintien pendant 3 min | Faible | Vérifier les fuites mémoires Node.js ou saturation Redis. |
| **Conteneurs**| `ContainerDown` | `time() - container_last_seen > 60` | **CRITIQUE** | Immédiat (1 min) | Faible | Redémarrer le conteneur défaillant, vérifier les crashs OOMKilled. |
| **Conteneurs**| `ContainerCrashLoop`| Taux de redémarrage > 3 en 10 min | **CRITIQUE** | Maintien pendant 5 min | Nul | Analyser immédiatement les derniers logs de sortie du conteneur. |
| **Application**| `HighHttp5xxRate` | `rate(5xx[5m]) / rate(total[5m]) > 5%` | **CRITIQUE** | Maintien pendant 2 min | Très faible | Défaillance d'un composant interne (BDD indisponible ou crash contrôleur). |
| **Application**| `HighApiLatency` | Latence p95 > 2.0s sur 5 min | **ÉLEVÉ** | Maintien pendant 5 min | Moyen | Identifier les requêtes SQL non indexées ou blocages de l'Event Loop. |
| **PostgreSQL** | `PostgresTooManyConnections` | Connexions > 85% du `max_connections` | **CRITIQUE** | Maintien pendant 3 min | Faible | Fuite de connexions dans le pool Prisma ou pic de charge soudain. |
| **PostgreSQL** | `PostgresDeadlocksDetected`| `rate(deadlocks[5m]) > 0` | **ÉLEVÉ** | Immédiat | Nul | Revoir la concurrence des transactions SQL dans les services. |
| **Redis** | `RedisHighMemoryUsage` | Mémoire > 85% de la limite allouée | **ÉLEVÉ** | Maintien pendant 5 min | Faible | Vérifier l'expiration (TTL) des clés de cache et les évictions anormales. |
| **Sécurité** | `BruteForceDetected` | > 20 échecs de login sur une même IP en 5m | **ÉLEVÉ** | Maintien pendant 2 min | Moyen | Bannissement temporaire via le rate-limiter ou filtrage Nginx. |
| **Sécurité** | `TurnstileFailureSpike` | Taux d'échec captcha > 40% sur 5m | **ÉLEVÉ** | Maintien pendant 5 min | Moyen | Attaque bot en cours ou problème de connectivité Cloudflare. |

---

## 13. Health Checks

L'architecture actuelle souffre d'un manque de distinction entre liveness (le processus tourne) et readiness (le service est prêt à traiter des requêtes).

### 13.1 Spécification des Probes Cibles

Le backend doit séparer formellement deux endpoints d'auscultation :

1. **Liveness Probe : `GET /api/health/liveness`** :
   - Objectif : vérifier que le processus Node.js Express répond et que sa boucle d'événements n'est pas bloquée.
   - Ne teste aucune dépendance externe.
   - Si cet endpoint échoue (timeout > 5s ou code != 200), Docker doit redémarrer le conteneur.
   - Réponse : `HTTP 200 {"status": "alive"}`.

2. **Readiness Probe : `GET /api/health/readiness`** :
   - Objectif : vérifier que le backend est en mesure d'exécuter des transactions réelles.
   - Vérifications actives :
     1. PostgreSQL : exécution d'une requête basique `SELECT 1` via `prisma.$queryRaw`.
     2. Redis : exécution d'un `redisClient.ping()`.
   - Si PostgreSQL ou Redis échoue :
     - Réponse : `HTTP 503 Service Unavailable`.
     - Payload :
       ```json
       {
         "status": "degraded",
         "checks": {
           "database": "down",
           "redis": "up"
         },
         "timestamp": "2026-09-28T23:48:10.000Z"
       }
       ```
   - Nginx doit utiliser cette sonde pour éviter de router le trafic vers une instance non prête lors des déploiements sans interruption (*Zero Downtime Rolling Updates*).

---

## 14. Resource Impact

### 14.1 Estimation de la consommation d'un VPS standard

| Composant | Consommation RAM estimée | Utilisation CPU moyenne | Espace Disque Recommandé |
| :--- | :--- | :--- | :--- |
| **Prometheus** (15j rétention) | 350 Mo – 600 Mo | 3% – 8% | 15 à 30 Go (selon cardinalité) |
| **Grafana** | 120 Mo – 250 Mo | 1% – 3% | 1 Go (Dashboards & SQLite) |
| **Node Exporter** | 15 Mo – 30 Mo | < 1% | 0 (Pas de persistance) |
| **cAdvisor** | 60 Mo – 150 Mo | 1% – 3% | 0 (Pas de persistance) |
| **PostgreSQL Exporter** | 30 Mo – 60 Mo | < 1% | 0 (Pas de persistance) |
| **Redis Exporter** | 20 Mo – 40 Mo | < 1% | 0 (Pas de persistance) |
| **Loki** (Rétention 7j) | 250 Mo – 600 Mo | 2% – 6% | 10 à 25 Go (selon compression) |
| **Promtail** | 30 Mo – 80 Mo | 1% – 2% | 0 (Pas de persistance) |
| **Alertmanager** | 30 Mo – 50 Mo | < 1% | 500 Mo |
| **TOTAL STACK MONITORING** | **~900 Mo – 1.8 Go** | **~8% – 22%** | **~25 à 55 Go** |

### 14.2 Recommandations d'hébergement
- **Sur un VPS actuel modeste (ex: 2 vCPU, 4 Go RAM)** :
  L'ajout de l'intégralité de la stack saturerait la mémoire vive aux côtés de PostgreSQL et Next.js.  
  *Option recommandée* : déployer en priorité **Node Exporter + Prometheus allégé + Grafana**, en différant Loki ou en hébergeant la suite de monitoring sur un VPS technique dédié séparé.
- **Sur un serveur de production recommandé (4 vCPU, 8 Go RAM minimum)** :
  L'ensemble de la stack d'observabilité tourne confortablement sans perturber le cœur de métier de Zadesk.

---

## 15. Architecture SaaS (Mutualisée)

Dans le scénario SaaS où de multiples entreprises cohabitent sur la même infrastructure Zadesk :
- **Architecture de monitoring centrale unique** : une seule instance de Prometheus et Grafana gérée par Zadesk.
- **Étanchéité totale** : les clients entreprises n'ont **aucun accès à Grafana**.
- **Indicateurs internes de SLA** : calcul du temps de réponse et de la disponibilité globale mis à disposition des clients via une page publique de statut séparée (ex: *Statuspage* ou *Uptime Kuma*), sans lien direct avec les métriques internes d'infrastructure.

---

## 16. Architecture Dedicated (Instance dédiée par entreprise)

Dans le cas où une grande entreprise dispose d'une instance Zadesk dédiée sur un serveur isolé :
- **Stack autonome par instance** : chaque client dispose de ses propres exporteurs locaux.
- **Monitoring Fédéré (Prometheus Federation)** :
  Le Prometheus central de l'équipe Zadesk interroge à distance (via tunnel chiffré WireGuard ou mTLS) le point de terminaison fédéré de l'instance dédiée pour superviser le respect des engagements de service (SLA) contractuels.
- **Option tableau de bord client** : possibilité d'ouvrir un accès en lecture seule à une organisation Grafana cloisonnée dédiée au DSI du client.

---

## 17. Architecture On-Premise (ex: Opérateur Télécom MTN / Banque)

Lorsqu'un grand compte sensible déploie Zadesk dans son propre datacenter :
- **Souveraineté des données totale** : la stack de monitoring est déployée intégralement au sein du réseau privé du client.
- **Intégration SIEM & SOC d'entreprise** :
  - Les métriques Prometheus de Zadesk sont scrapées directement par la plateforme centrale de métrologie du client (ex: Prometheus centralisé, Datadog On-Premise, ou Dynatrace).
  - Les logs de Zadesk ne sont pas envoyés sur l'extérieur, mais routés localement vers le SIEM de l'entreprise (ex: Splunk, Elastic Cloud On-Premise, QRadar) via Syslog RFC 5424 sécurisé par TLS.
- **Absence de toute dépendance Cloud** : aucun appel sortant vers Internet.

---

## 18. Architecture Enterprise cible

```text
====================================================================================================
                        DÉTAIL DÉPLOYEMENT DOCKER & VOLUMES SÉCURISÉS
====================================================================================================

 [ MACHINE HÔTE (VPS LINUX) ]
   │
   ├── Volume Docker : postgres_data      ──────> zadesk-postgres
   ├── Volume Docker : redis_data         ──────> zadesk-redis
   ├── Volume Docker : prometheus_data    ──────> prometheus (TSDB)
   ├── Volume Docker : grafana_data       ──────> grafana (Dashboards & Config)
   ├── Volume Docker : loki_data          ──────> loki (Chunks & Chiffrement au repos)
   │
   ├── [ RÉSEAU DOCKER : frontend-network ] (172.28.1.0/24)
   │     ├── zadesk-nginx (80, 443)
   │     ├── zadesk-frontend (3000)
   │     └── zadesk-backend (4000)
   │
   ├── [ RÉSEAU DOCKER : backend-network ] (172.28.2.0/24)
   │     ├── zadesk-backend (4000)
   │     ├── zadesk-postgres (5432)
   │     ├── zadesk-redis (6379)
   │     ├── postgres-exporter (9187)
   │     └── redis-exporter (9121)
   │
   └── [ RÉSEAU DOCKER : monitoring-network ] (172.28.3.0/24)
         ├── zadesk-backend (4000)      [Scrapé sur /metrics]
         ├── zadesk-nginx (80)          [Scrapé sur /stub_status]
         ├── node-exporter (9100)       [Namespace host monté]
         ├── cadvisor (8080)            [/var/run/docker.sock monté en :ro]
         ├── postgres-exporter (9187)   [Scrapé par Prometheus]
         ├── redis-exporter (9121)      [Scrapé par Prometheus]
         ├── prometheus (9090)          [Collecte TSDB interne]
         ├── alertmanager (9093)        [Routage d'alertes]
         ├── loki (3100)                [Réception logs]
         ├── promtail                   [Daemon collecte logs]
         └── grafana (3000)             [Interface visualisée via Nginx]
====================================================================================================
```

---

## 19. Plan d'implémentation futur (Par Phases)

```text
+---------------------------------------------------------------------------------------------------+
| PHASE 1 : SÉCURISATION & OBSERVABILITÉ DE BASE (Priorité Absolue)                                 |
| Objectifs    : Déployer Node Exporter, durcir la configuration hôte, monitorer le serveur hôte.  |
| Fichiers     : docker-compose.monitoring.yml, docker/monitoring/prometheus.yml                   |
| Dépendances  : Aucune modification de code backend requise.                                       |
| Risques      : Risque nul (aucun impact sur le code en cours d'exécution).                       |
| Validation   : Métriques CPU/RAM/Disque disponibles sur Prometheus local.                        |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| PHASE 2 : INSTRUMENTATION DU BACKEND (Métriques Applicatives)                                     |
| Objectifs    : Intégrer prom-client dans Express, créer /metrics et les vrais endpoints de santé.|
| Fichiers     : backend/package.json, backend/src/middleware/metrics.js, backend/src/routes/health.js |
| Dépendances  : Validation du bon fonctionnement de requireAuth pour ne pas bloquer /metrics.      |
| Risques      : Léger overhead CPU si l'EventLoop lag est mal configuré.                          |
| Validation   : Requêtes HTTP 200, 4xx, 5xx et latences p95 collectées dans Prometheus.          |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| PHASE 3 : VISUALISATION GRAFANA & RESTRICTION D'ACCÈS                                             |
| Objectifs    : Provisionner Grafana avec dashboards officiels (Node, Express, Postgres, Redis).  |
| Fichiers     : docker/grafana/provisioning/*, docker/nginx/nginx.conf                             |
| Dépendances  : Configuration Nginx pour proxyfier Grafana de façon chiffrée (HTTPS obligatoire). |
| Risques      : Exposition accidentelle si les mots de passe par défaut ne sont pas modifiés.      |
| Validation   : Accès aux dashboards authentifié par mot de passe fort / SSO.                      |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| PHASE 4 : LOGS STRUCTURÉS ET LOKI                                                                 |
| Objectifs    : Migration du logger console vers format JSON structuré (Pino/Winston) + Promtail. |
| Fichiers     : backend/src/utils/logger.js, backend/src/middleware/requestId.js, promtail-config.yml|
| Dépendances  : Mise en place des règles de caviardage de données sensibles (PII / tokens).       |
| Risques      : Augmentation du volume disque si la rétention Loki n'est pas plafonnée.           |
| Validation   : Recherche instantanée des erreurs par correlationId dans Grafana.                 |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| PHASE 5 : ALERTING OPÉRATIONNEL (Alertmanager)                                                    |
| Objectifs    : Définition des règles d'alertes Prometheus et routage vers canal d'astreinte.      |
| Fichiers     : docker/monitoring/alert_rules.yml, docker/monitoring/alertmanager.yml              |
| Dépendances  : Webhook Discord / Slack ou passerelle SMTP.                                        |
| Risques      : Fatigue d'alertes (Alert Fatigue) en cas de seuils trop sensibles.                |
| Validation   : Simulation d'arrêt de conteneur déclenchant une alerte Slack dans les 2 minutes.  |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| PHASE 6 : OBSERVABILITÉ ENTREPRISE & MULTI-TENANT AUDITING                                        |
| Objectifs    : Séparation des métriques de consommation par workspaceId pour les grands comptes.  |
| Fichiers     : backend/src/services/analyticsService.js, dashboards de facturation par usage.     |
| Dépendances  : Stabilisation préalable des modèles de base de données (Conversations/Tickets).    |
| Risques      : Explosion de cardinalité Prometheus si les labels ne sont pas strictement bridés. |
| Validation   : Rapports de volumétrie et SLA générés mensuellement sans aucune fuite de données.  |
+---------------------------------------------------------------------------------------------------+
```

---

## 20. Risques

1. **Surcharge Mémoire (OOM Killer) sur le VPS** : Déployer simultanément Prometheus, Grafana, Loki et cAdvisor sur un petit serveur peut provoquer l'arrêt brutal des services applicatifs Zadesk par le noyau Linux si la limite de mémoire est atteinte.
2. **Fuite d'Informations d'Infrastructure** : Si les ports `9090` (Prometheus), `9100` (Node Exporter) ou `8080` (cAdvisor) sont ouverts sur l'IP publique du serveur, n'importe quel robot scannant le web peut auditer la topologie interne de Zadesk.
3. **Explosion de Cardinalité Prometheus** : L'injection par inadvertance d'une variable dynamique (ex: email client, UUID de message, jeton) dans les étiquettes de métriques saturera la mémoire de Prometheus en quelques heures.
4. **Non-Conformité RGPD par Indexation de Logs** : Si les messages WhatsApp de SAV ou les coordonnées de clients finaux sont enregistrés dans les logs applicatifs ingérés par Loki, ces données échappent aux mécanismes de purge et de droit à l'effacement.
5. **Fatigue d'Alerte** : Un paramétrage trop agressif des alertes (ex: alerte CPU instantanée sans fenêtre de lissage) noiera l'équipe sous des notifications intempestives, conduisant à ignorer les alertes lors de vraies pannes critiques.

---

## 21. Recommandations finales & Décision architecturale proposée

### Réponse aux 10 questions décisionnelles clés :

1. **Quelle stack de monitoring recommandes-tu ?**
   - La stack standard éprouvée et open-source : **Prometheus + Grafana + Node Exporter + Alertmanager**. En complément, un exporteur léger pour PostgreSQL et Redis. Pour les logs : **Loki + Promtail** (en phase secondaire).
2. **Quels composants sont indispensables ?**
   - **Prometheus** (moteur de métriques), **Node Exporter** (santé machine), **Grafana** (visualisation) et **Alertmanager** (notifications de pannes).
3. **Quels composants peuvent attendre ?**
   - **OpenTelemetry / Jaeger** (traçage distribué inutile à ce stade monolitique).
   - **cAdvisor** peut être temporairement différé si les ressources RAM du VPS sont restreintes au départ.
4. **Comment doivent-ils être isolés du trafic public ?**
   - **Aucun port de monitoring ne doit être mappé sur l'IP hôte du VPS dans Docker Compose**, à l'exception unique de Nginx. Les communications doivent se faire exclusivement sur le réseau Docker interne `monitoring-network`. Grafana doit être accessible via reverse-proxy Nginx sous HTTPS avec restriction par liste blanche d'IPs d'administration.
5. **Comment protéger les données sensibles ?**
   - Par une interdiction stricte d'introduire des données personnelles (PII) dans les métriques Prometheus, et par un middleware de masquage regex automatique dans le logger backend pour anonymiser emails, mots de passe et tokens avant toute émission vers les logs.
6. **Quel impact sur Docker ?**
   - Découpage impératif du réseau unique existant en 3 sous-réseaux isolés (`frontend-network`, `backend-network`, `monitoring-network`).
7. **Quel impact sur le VPS ?**
   - Prévoir une augmentation prévisionnelle de consommation de **~1,2 à 1,8 Go de RAM** et environ **30 à 50 Go d'espace disque** pour conserver 15 jours d'historique de métriques et 7 jours de logs. Un VPS avec au minimum **4 vCPU et 8 Go de RAM** est vivement conseillé.
8. **Comment cette architecture évolue-t-elle pour un grand client comme MTN ?**
   - En mode dédié ou on-premise, les métriques Zadesk sont exposées de manière sécurisée en interne via `/metrics` (avec authentification HTTP mTLS ou Basic Auth) directement au système de supervision de l'opérateur (Prometheus d'entreprise ou Datadog), et les logs sont routés en local vers leur SIEM sans transiter sur Internet.
9. **Quelles corrections de sécurité doivent être réalisées avant son implémentation ?**
   - **Activation obligatoire de HTTPS/TLS 1.3** sur Nginx (pour sécuriser les accès de gestion).
   - **Remplacement impératif de tous les secrets et mots de passe par défaut** (`POSTGRES_PASSWORD`, `SESSION_SECRET`).
   - **Sécurisation de Redis avec mot de passe fort** (`requirepass`).
10. **Quel serait l'ordre exact d'implémentation recommandé ?**
    - **Étape 0** : Application des correctifs de sécurité critiques (HTTPS, secrets, réseau).
    - **Étape 1** : Création du réseau `monitoring-network` et déploiement de Node Exporter + Prometheus + Alertmanager.
    - **Étape 2** : Instrumentation de l'application Zadesk (`prom-client`, vrai healthcheck `/api/health/readiness`).
    - **Étape 3** : Déploiement de Grafana sécurisé derrière Nginx avec dashboards d'exploitation.
    - **Étape 4** : Ajout de PostgreSQL Exporter et Redis Exporter.
    - **Étape 5** : Déploiement de Loki et Promtail avec logs structurés JSON et caviardage PII.
