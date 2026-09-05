# Zadesk - Plateforme SaaS SAV IA Omnicanal & Mobile Money

Plateforme SaaS B2B de gestion de relation client et de Service Après-Vente pour les PME et entreprises du Congo-Brazzaville et d'Afrique centrale.

## 🚀 Démarrage Rapide

### 1. Prérequis
- Node.js >= 20.x
- Docker & Docker Compose
- Git

### 2. Lancer le Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
L'application est accessible sur `http://localhost:3000`.

### 3. Lancer via Docker
```bash
# Lancer le frontend seul
docker compose up frontend

# Lancer la stack complète
docker compose --profile backend-stack --profile ai-stack up -d
```
