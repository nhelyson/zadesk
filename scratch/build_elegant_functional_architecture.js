const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve('frontend/node_modules/sharp'));

// Dimensions harmonieuses 16:10
const W = 1760;
const H = 1080;

// ==========================================
// 1. GÉNÉRATION DU SVG ULTRA-DESIGN & ÉPURÉ
// ==========================================

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
    <style>
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .card { rx: 8; ry: 8; filter: drop-shadow(0 2px 5px rgba(15, 23, 42, 0.05)); }
        .badge { font-size: 9.5px; font-weight: 700; letter-spacing: 0.6px; text-anchor: middle; }
        .card-title { font-size: 14px; font-weight: 700; }
        .item-text { font-size: 11.5px; fill: #334155; }
        .item-bullet { font-weight: 700; fill: #0F172A; }
        .item-sub { font-size: 10.5px; fill: #64748B; }
        .flow-line { fill: none; stroke-width: 1.6; }
        .flow-tag { font-size: 10px; font-weight: 700; fill: #0F172A; text-anchor: middle; }
    </style>
    
    <!-- Marqueurs de flèches épurés -->
    <marker id="arr-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563EB"/>
    </marker>
    <marker id="arr-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#7C3AED"/>
    </marker>
    <marker id="arr-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#4F46E5"/>
    </marker>
    <marker id="arr-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B"/>
    </marker>
</defs>

<!-- FOND GLOBAL SOBRE & CLAIR -->
<rect width="${W}" height="${H}" fill="#F8FAFC"/>

<!-- ========================================================================================= -->
<!-- NIVEAU 1 : ACTEURS DU SYSTÈME & RÔLES (y = 40, h = 100) -->
<!-- ========================================================================================= -->

<!-- 1. Client Public -->
<g id="act-client">
    <rect x="60" y="40" width="308" height="100" class="card" fill="#FFFFFF" stroke="#059669" stroke-width="1.5" />
    <rect x="60" y="40" width="308" height="4" fill="#059669" rx="2"/>
    <rect x="164" y="52" width="100" height="18" rx="4" fill="#ECFDF5"/>
    <text x="214" y="65" class="badge" fill="#065F46">« EXTERNE »</text>
    <text x="214" y="87" class="card-title" fill="#065F46" text-anchor="middle">Client / Consommateur</text>
    <text x="76" y="109" class="item-text">• <tspan class="item-bullet">Accès libre sans compte</tspan> sur portail web</text>
    <text x="76" y="126" class="item-text">• Dépose réclamations &amp; dialogue par tchat</text>
</g>

<!-- 2. Conseiller SAV -->
<g id="act-agent">
    <rect x="393" y="40" width="308" height="100" class="card" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5" />
    <rect x="393" y="40" width="308" height="4" fill="#D97706" rx="2"/>
    <rect x="497" y="52" width="100" height="18" rx="4" fill="#FFFBEB"/>
    <text x="547" y="65" class="badge" fill="#92400E">« RÔLE AGENT »</text>
    <text x="547" y="87" class="card-title" fill="#92400E" text-anchor="middle">Conseiller SAV</text>
    <text x="409" y="109" class="item-text">• <tspan class="item-bullet">Traitement des tickets</tspan> assignés &amp; SLA</text>
    <text x="409" y="126" class="item-text">• Messagerie client &amp; notes confidentielles</text>
</g>

<!-- 3. Superviseur SAV -->
<g id="act-manager">
    <rect x="726" y="40" width="308" height="100" class="card" fill="#FFFFFF" stroke="#7C3AED" stroke-width="1.5" />
    <rect x="726" y="40" width="308" height="4" fill="#7C3AED" rx="2"/>
    <rect x="825" y="52" width="110" height="18" rx="4" fill="#FAF5FF"/>
    <text x="880" y="65" class="badge" fill="#6D28D9">« RÔLE MANAGER »</text>
    <text x="880" y="87" class="card-title" fill="#6D28D9" text-anchor="middle">Superviseur SAV</text>
    <text x="742" y="109" class="item-text">• <tspan class="item-bullet">Supervision des files</tspan> &amp; charge agents</text>
    <text x="742" y="126" class="item-text">• Gestion compétences (Skills) &amp; succursales</text>
</g>

<!-- 4. Administrateur Entreprise -->
<g id="act-admin">
    <rect x="1059" y="40" width="308" height="100" class="card" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5" />
    <rect x="1059" y="40" width="308" height="4" fill="#2563EB" rx="2"/>
    <rect x="1148" y="52" width="130" height="18" rx="4" fill="#EFF6FF"/>
    <text x="1213" y="65" class="badge" fill="#1E40AF">« OWNER / ADMIN »</text>
    <text x="1213" y="87" class="card-title" fill="#1E40AF" text-anchor="middle">Administrateur Entreprise</text>
    <text x="1075" y="109" class="item-text">• <tspan class="item-bullet">Invitations d'équipe</tspan> &amp; branding public</text>
    <text x="1075" y="126" class="item-text">• Facturation SasPay &amp; politique IA</text>
</g>

<!-- 5. Opérateur Plateforme -->
<g id="act-operator">
    <rect x="1392" y="40" width="308" height="100" class="card" fill="#FFFFFF" stroke="#475569" stroke-width="1.5" />
    <rect x="1392" y="40" width="308" height="4" fill="#475569" rx="2"/>
    <rect x="1481" y="52" width="130" height="18" rx="4" fill="#F1F5F9"/>
    <text x="1546" y="65" class="badge" fill="#334155">« SAAS OPERATOR »</text>
    <text x="1546" y="87" class="card-title" fill="#1E293B" text-anchor="middle">Opérateur Plateforme</text>
    <text x="1408" y="109" class="item-text">• <tspan class="item-bullet">Supervision technique</tspan> Docker/Postgres</text>
    <text x="1408" y="126" class="item-text">• Certification entreprise (Badge vérifié)</text>
</g>

<!-- ========================================================================================= -->
<!-- NIVEAU 2 : ESPACES D'ACCÈS & CANAUX (y = 195, h = 135) -->
<!-- ========================================================================================= -->

<!-- Espace Public -->
<g id="space-public">
    <rect x="60" y="195" width="580" height="135" class="card" fill="#FFFFFF" stroke="#10B981" stroke-width="1.6" />
    <rect x="60" y="195" width="580" height="4" fill="#10B981" rx="2"/>
    <text x="80" y="222" class="card-title" fill="#065F46">ESPACE PUBLIC CLIENTS &amp; VISITEURS</text>
    <rect x="500" y="208" width="125" height="18" rx="4" fill="#DCFCE7"/>
    <text x="562" y="221" class="badge" fill="#166534">ACCÈS LIBRE WEB</text>
    
    <text x="80" y="250" class="item-text">• <tspan class="item-bullet">Annuaire des entreprises certifiées</tspan> (<tspan class="item-sub">/entreprises</tspan>) : Recherche &amp; géolocalisation</text>
    <text x="80" y="274" class="item-text">• <tspan class="item-bullet">Vitrine SAV &amp; Agences physiques</tspan> (<tspan class="item-sub">/entreprises/[slug]</tspan>) : Horaires, adresses, contacts</text>
    <text x="80" y="298" class="item-text">• <tspan class="item-bullet">Widget Tchat SAV instantané</tspan> : Dialogue en direct avec session par jeton sécurisé</text>
</g>

<!-- Espace Entreprise Workspace -->
<g id="space-workspace">
    <rect x="680" y="195" width="1020" height="135" class="card" fill="#FFFFFF" stroke="#3B82F6" stroke-width="1.6" />
    <rect x="680" y="195" width="1020" height="4" fill="#3B82F6" rx="2"/>
    <text x="700" y="222" class="card-title" fill="#1E40AF">ESPACE DE TRAVAIL COLLABORATIF ENTREPRISE (Workspace Multi-Tenant)</text>
    <rect x="1515" y="208" width="170" height="18" rx="4" fill="#DBEAFE"/>
    <text x="1600" y="221" class="badge" fill="#1E40AF">ACCÈS AUTHENTIFIÉ (RBAC)</text>
    
    <!-- 3 sections horizontales épurées -->
    <rect x="700" y="238" width="310" height="78" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="715" y="258" class="card-title" fill="#B45309" font-size="12">Cockpit Conseiller</text>
    <text x="715" y="278" class="item-text">• File « Mes tickets » &amp; SLA</text>
    <text x="715" y="296" class="item-text">• Tchat &amp; jauge de disponibilité</text>
    
    <rect x="1035" y="238" width="315" height="78" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="1050" y="258" class="card-title" fill="#6D28D9" font-size="12">Console Supervision</text>
    <text x="1050" y="278" class="item-text">• Monitoring files d'attente</text>
    <text x="1050" y="296" class="item-text">• Compétences &amp; agences physiques</text>
    
    <rect x="1375" y="238" width="310" height="78" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="1390" y="258" class="card-title" fill="#1D4ED8" font-size="12">Administration Générale</text>
    <text x="1390" y="278" class="item-text">• Invitations &amp; rôles d'équipe</text>
    <text x="1390" y="296" class="item-text">• Facturation SasPay &amp; politique IA</text>
</g>

<!-- ========================================================================================= -->
<!-- NIVEAU 3 : MODULES FONCTIONNELS MÉTIER (y = 385, 2 rangées de 3 cartes) -->
<!-- ========================================================================================= -->

<!-- Rangée 1 : Modules 1, 2, 3 (y = 385, h = 190) -->

<!-- Mod 1 : Tickets SAV -->
<g id="mod-tickets">
    <rect x="60" y="385" width="520" height="190" class="card" fill="#FFFFFF" stroke="#8B5CF6" stroke-width="1.6" />
    <rect x="60" y="385" width="520" height="4" fill="#8B5CF6" rx="2"/>
    <text x="80" y="413" class="card-title" fill="#5B21B6">1. Demandes &amp; Tickets SAV</text>
    <rect x="440" y="399" width="125" height="18" rx="4" fill="#FAF5FF"/>
    <text x="502" y="412" class="badge" fill="#6D28D9">OPÉRATIONNEL</text>
    
    <text x="80" y="440" class="item-text">• <tspan class="item-bullet">Dossier technique unique</tspan> : Référence formelle (ex: TICK-ABC123)</text>
    <text x="80" y="464" class="item-text">• <tspan class="item-bullet">Cycle de vie SAV</tspan> : PENDING → OPEN → IN_PROGRESS → RESOLVED</text>
    <text x="80" y="488" class="item-text">• <tspan class="item-bullet">Priorités &amp; Engagements SLA</tspan> : Alertes visuelles de dépassement</text>
    <text x="80" y="512" class="item-text">• <tspan class="item-bullet">Traçabilité inaltérable</tspan> : Journal chronologique (TicketActivity)</text>
    <text x="80" y="536" class="item-text">• <tspan class="item-bullet">Collaboration</tspan> : Partage inter-agences (TicketShare) &amp; pièces jointes</text>
</g>

<!-- Mod 2 : Conversations Directes -->
<g id="mod-conv">
    <rect x="620" y="385" width="520" height="190" class="card" fill="#FFFFFF" stroke="#0D9488" stroke-width="1.6" />
    <rect x="620" y="385" width="520" height="4" fill="#0D9488" rx="2"/>
    <text x="640" y="413" class="card-title" fill="#0F766E">2. Conversations &amp; Dialogue Direct</text>
    <rect x="1000" y="399" width="125" height="18" rx="4" fill="#F0FDFA"/>
    <text x="1062" y="412" class="badge" fill="#0F766E">OPÉRATIONNEL</text>
    
    <text x="640" y="440" class="item-text">• <tspan class="item-bullet">Messagerie temps réel</tspan> : Dialogue interactif client ↔ conseiller SAV</text>
    <text x="640" y="464" class="item-text">• <tspan class="item-bullet">Session client autonome</tspan> : Jeton sécurisé sans création de compte</text>
    <text x="640" y="488" class="item-text">• <tspan class="item-bullet">Notes internes confidentielles</tspan> : Visibles uniquement par l'équipe</text>
    <text x="640" y="512" class="item-text">• <tspan class="item-bullet">Élévation en Ticket SAV</tspan> : Conversion directe en 1 clic avec historique</text>
    <text x="640" y="536" class="item-text">• <tspan class="item-bullet">Transmission de pièces</tspan> : Photos justificatives &amp; bons de garantie</text>
</g>

<!-- Mod 3 : Équipe, Compétences & Agences -->
<g id="mod-team">
    <rect x="1180" y="385" width="520" height="190" class="card" fill="#FFFFFF" stroke="#F59E0B" stroke-width="1.6" />
    <rect x="1180" y="385" width="520" height="4" fill="#F59E0B" rx="2"/>
    <text x="1200" y="413" class="card-title" fill="#B45309">3. Équipe, Compétences &amp; Agences</text>
    <rect x="1560" y="399" width="125" height="18" rx="4" fill="#FFFBEB"/>
    <text x="1622" y="412" class="badge" fill="#92400E">OPÉRATIONNEL</text>
    
    <text x="1200" y="440" class="item-text">• <tspan class="item-bullet">Profils &amp; jauges de charge</tspan> : Plafond de tickets simultanés (maxCapacity)</text>
    <text x="1200" y="464" class="item-text">• <tspan class="item-bullet">Disponibilités temps réel</tspan> : AVAILABLE, BUSY, AWAY, OFFLINE</text>
    <text x="1200" y="488" class="item-text">• <tspan class="item-bullet">Matrice de compétences</tspan> : Tags de qualification technique (Skills)</text>
    <text x="1200" y="512" class="item-text">• <tspan class="item-bullet">Attribution déterministe</tspan> : Orientation auto selon charge &amp; compétences</text>
    <text x="1200" y="536" class="item-text">• <tspan class="item-bullet">Établissements physiques</tspan> : Gestion succursales, ateliers &amp; adresses</text>
</g>

<!-- Rangée 2 : Modules 4, 5, 6 (y = 610, h = 190) -->

<!-- Mod 4 : Sécurité & Audit -->
<g id="mod-sec">
    <rect x="60" y="610" width="520" height="190" class="card" fill="#FFFFFF" stroke="#64748B" stroke-width="1.6" />
    <rect x="60" y="610" width="520" height="4" fill="#64748B" rx="2"/>
    <text x="80" y="638" class="card-title" fill="#1E293B">4. Sécurité, Contrôle RBAC &amp; Événements</text>
    <rect x="440" y="624" width="125" height="18" rx="4" fill="#F1F5F9"/>
    <text x="502" y="637" class="badge" fill="#334155">OPÉRATIONNEL</text>
    
    <text x="80" y="665" class="item-text">• <tspan class="item-bullet">Sessions sécurisées</tspan> : Cookies HttpOnly SameSite=Lax &amp; validation OTP</text>
    <text x="80" y="689" class="item-text">• <tspan class="item-bullet">Contrôle multi-tenant strict</tspan> : Middleware requireWorkspaceRole</text>
    <text x="80" y="713" class="item-text">• <tspan class="item-bullet">Transactional Outbox Pattern</tspan> : Garantie de non-perte d'événements</text>
    <text x="80" y="737" class="item-text">• <tspan class="item-bullet">Diffusion SSE (Pulse Stream)</tspan> : Actualisation cockpits sans rafraîchissement</text>
    <text x="80" y="761" class="item-text">• <tspan class="item-bullet">Journal d'audit réglementaire</tspan> : Traçabilité inaltérable des actions (AuditLog)</text>
</g>

<!-- Mod 5 : Facturation & SasPay -->
<g id="mod-comm">
    <rect x="620" y="610" width="520" height="190" class="card" fill="#FFFFFF" stroke="#10B981" stroke-width="1.6" />
    <rect x="620" y="610" width="520" height="4" fill="#10B981" rx="2"/>
    <text x="640" y="638" class="card-title" fill="#065F46">5. Facturation, Quotas &amp; SasPay</text>
    <rect x="1000" y="624" width="125" height="18" rx="4" fill="#ECFDF5"/>
    <text x="1062" y="637" class="badge" fill="#047857">OPÉRATIONNEL</text>
    
    <text x="640" y="665" class="item-text">• <tspan class="item-bullet">Formules SaaS</tspan> : Grille tarifaire officielle (Starter, Pro, Enterprise)</text>
    <text x="640" y="689" class="item-text">• <tspan class="item-bullet">Contrôle dynamique des quotas</tspan> : Nombre d'agents &amp; volume de tickets</text>
    <text x="640" y="713" class="item-text">• <tspan class="item-bullet">Passerelle SasPay (Zone CEMAC)</tspan> : Airtel Money, MTN MoMo &amp; cartes</text>
    <text x="640" y="737" class="item-text">• <tspan class="item-bullet">Traitement asynchrone</tspan> : Webhooks sécurisés &amp; activation immédiate</text>
    <text x="640" y="761" class="item-text">• <tspan class="item-bullet">Historique financier</tspan> : Suivi des factures et périodes d'abonnement</text>
</g>

<!-- Mod 6 : Module IA Cible -->
<g id="mod-ai">
    <rect x="1180" y="610" width="520" height="190" class="card" fill="#FFFFFF" stroke="#6366F1" stroke-width="1.6" stroke-dasharray="5,4" />
    <rect x="1180" y="610" width="520" height="4" fill="#6366F1" rx="2"/>
    <text x="1200" y="638" class="card-title" fill="#4338CA">6. Assistance IA &amp; RAG (Supervisée)</text>
    <rect x="1505" y="624" width="180" height="18" rx="4" fill="#EEF2FF"/>
    <text x="1595" y="637" class="badge" fill="#4338CA">ARCHITECTURE CIBLE</text>
    
    <text x="1200" y="665" class="item-text">• <tspan class="item-bullet">Base de connaissances vectorielle</tspan> : Ingestion FAQ &amp; manuels (chunks)</text>
    <text x="1200" y="689" class="item-text">• <tspan class="item-bullet">Moteur RAG (Llama 3.3)</tspan> : Réponses contextualisées fiables</text>
    <text x="1200" y="713" class="item-text">• <tspan class="item-bullet">Modes d'autonomie</tspan> : Brouillon proposé à l'agent ou réponse semi-auto</text>
    <text x="1200" y="737" class="item-text" fill="#DC2626">• <tspan class="item-bullet" fill="#DC2626">Escalade humaine obligatoire</tspan> : Sentiment négatif ou litige &gt; 50 000 XAF</text>
    <text x="1200" y="761" class="item-text">• <tspan class="item-bullet">Supervision continue</tspan> : Score de confiance &amp; validation par l'équipe</text>
</g>

<!-- ========================================================================================= -->
<!-- NIVEAU 4 : PERSISTANCE DE DONNÉES & MULTI-TENANT (y = 845, h = 150) -->
<!-- ========================================================================================= -->

<g id="layer-persist">
    <rect x="60" y="845" width="1640" height="150" class="card" fill="#FFFFFF" stroke="#64748B" stroke-width="1.6" />
    <rect x="60" y="845" width="1640" height="4" fill="#64748B" rx="2"/>
    <text x="80" y="872" class="card-title" fill="#0F172A">SOCLE MULTI-TENANT &amp; PERSISTANCE POLYGLOTTE DE DONNÉES</text>
    <rect x="1460" y="858" width="225" height="18" rx="4" fill="#F1F5F9"/>
    <text x="1572" y="871" class="badge" fill="#334155">INFRASTRUCTURE LOGIQUE</text>
    
    <!-- 3 Piliers équilibrés -->
    <!-- Pilier 1 : PostgreSQL -->
    <rect x="80" y="890" width="500" height="88" rx="6" fill="#F8FAFC" stroke="#93C5FD" stroke-width="1.2"/>
    <text x="95" y="910" class="card-title" fill="#1D4ED8" font-size="12.5">PostgreSQL &amp; Prisma (Relationnel Multi-Tenant)</text>
    <text x="95" y="930" class="item-text">• <tspan class="item-bullet">Cloisonnement strict par workspaceId</tspan> sur toutes les tables métiers</text>
    <text x="95" y="948" class="item-text">• <tspan class="item-bullet">Modèle utilisateur universel</tspan> : compte unique multi-organisations</text>
    <text x="95" y="966" class="item-text">• Intégrité ACID, contraintes d'unicité (slug, email) &amp; clés étrangères</text>
    
    <!-- Pilier 2 : Redis & BullMQ -->
    <rect x="630" y="890" width="500" height="88" rx="6" fill="#F8FAFC" stroke="#FCA5A5" stroke-width="1.2"/>
    <text x="645" y="910" class="card-title" fill="#B91C1C" font-size="12.5">Redis &amp; BullMQ (Cache &amp; Broker Asynchrone)</text>
    <text x="645" y="930" class="item-text">• <tspan class="item-bullet">Cache applicatif à dégradation gracieuse</tspan> en cas d'indisponibilité</text>
    <text x="645" y="948" class="item-text">• <tspan class="item-bullet">Files de tâches BullMQ</tspan> : webhooks SasPay, emails, notifications</text>
    <text x="645" y="966" class="item-text">• Découplage de la charge API &amp; gestion des verrous distribués</text>
    
    <!-- Pilier 3 : MongoDB Atlas -->
    <rect x="1180" y="890" width="500" height="88" rx="6" fill="#F8FAFC" stroke="#A5B4FC" stroke-width="1.2" stroke-dasharray="4,3"/>
    <text x="1195" y="910" class="card-title" fill="#4338CA" font-size="12.5">MongoDB Atlas (Stockage Vectoriel RAG — Cible)</text>
    <text x="1195" y="930" class="item-text">• <tspan class="item-bullet">Indexation vectorielle dense</tspan> des fragments documentaires (1536 dim.)</text>
    <text x="1195" y="948" class="item-text">• <tspan class="item-bullet">Partitionnement par tenant</tspan> assurant l'étanchéité des corpus</text>
    <text x="1195" y="966" class="item-text">• Recherche par similarité cosinus pour injection contextuelle</text>
</g>

<!-- ========================================================================================= -->
<!-- CONNECTEURS & FLUX D'INTERACTION SANS CROISEMENTS PARASITES -->
<!-- ========================================================================================= -->

<!-- 1. Client -> Espace Public -->
<path d="M 214 140 L 214 195" class="flow-line" stroke="#059669" marker-end="url(#arr-emerald)"/>

<!-- 2. Conseiller -> Cockpit -->
<path d="M 547 140 L 547 165 L 855 165 L 855 238" class="flow-line" stroke="#D97706" marker-end="url(#arr-blue)"/>

<!-- 3. Superviseur -> Supervision -->
<path d="M 880 140 L 880 165 L 1192 165 L 1192 238" class="flow-line" stroke="#7C3AED" marker-end="url(#arr-purple)"/>

<!-- 4. Admin -> Administration -->
<path d="M 1213 140 L 1213 165 L 1530 165 L 1530 238" class="flow-line" stroke="#2563EB" marker-end="url(#arr-blue)"/>

<!-- 5. Espace Public -> Module Conversations -->
<path d="M 350 330 L 350 355 L 750 355 L 750 385" class="flow-line" stroke="#0D9488" marker-end="url(#arr-emerald)"/>
<rect x="470" y="345" width="160" height="18" rx="3" fill="#FFFFFF" stroke="#0D9488" stroke-width="1"/>
<text x="550" y="358" class="flow-tag" fill="#0F766E">Session Tchat direct</text>

<!-- 6. Workspace -> Module Tickets -->
<path d="M 855 316 L 855 355 L 320 355 L 320 385" class="flow-line" stroke="#8B5CF6" marker-end="url(#arr-purple)"/>
<rect x="490" y="345" width="180" height="18" rx="3" fill="#FFFFFF" stroke="#8B5CF6" stroke-width="1" style="display:none;"/>

<!-- 7. Workspace -> Module Équipe -->
<path d="M 1192 316 L 1192 355 L 1440 355 L 1440 385" class="flow-line" stroke="#F59E0B" marker-end="url(#arr-slate)"/>

<!-- 8. Conversations -> Tickets SAV (Élévation horizontale directe) -->
<path d="M 620 480 L 580 480" class="flow-line" stroke="#8B5CF6" marker-end="url(#arr-purple)"/>
<rect x="582" y="460" width="36" height="16" rx="3" fill="#FFFFFF" stroke="#8B5CF6" stroke-width="1"/>
<text x="600" y="472" class="flow-tag" fill="#5B21B6" font-size="9">SAV</text>

<!-- 9. Module IA -> Module Conversations (Suggestions RAG) -->
<path d="M 1180 705 L 1140 705 L 1140 480" class="flow-line" stroke="#6366F1" stroke-dasharray="4,3" marker-end="url(#arr-indigo)"/>

<!-- 10. Persistance vers le bas (Connexion propre depuis les modules) -->
<path d="M 320 800 L 320 845" class="flow-line" stroke="#64748B" marker-end="url(#arr-slate)"/>
<path d="M 880 800 L 880 845" class="flow-line" stroke="#64748B" marker-end="url(#arr-slate)"/>
<path d="M 1440 800 L 1440 845" class="flow-line" stroke="#64748B" marker-end="url(#arr-slate)"/>

<!-- 11. Opérateur SaaS -> Persistance (descente latérale propre) -->
<path d="M 1546 140 L 1546 160 L 1720 160 L 1720 920 L 1700 920" class="flow-line" stroke="#475569" stroke-dasharray="4,3" marker-end="url(#arr-slate)"/>
<rect x="1650" y="530" width="90" height="18" rx="3" fill="#FFFFFF" stroke="#475569" stroke-width="1"/>
<text x="1695" y="543" class="flow-tag" fill="#334155" font-size="9.5">Exploitation</text>

</svg>`;

// ==========================================
// 2. GÉNÉRATION DU XML DRAW.IO NATIF ULTRA-PUR
// ==========================================

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function generateDrawio() {
    let cells = [];
    cells.push('<mxCell id="0" />');
    cells.push('<mxCell id="1" parent="0" />');

    // 1. Acteurs
    const actors = [
        {
            id: 'act_client', x: 60, y: 40, w: 308, h: 100,
            stroke: '#059669', title: 'Client / Consommateur', tag: '« EXTERNE »', tagBg: '#ECFDF5', tagColor: '#065F46',
            lines: ['• <b>Accès libre sans compte</b> sur portail web', '• Dépose réclamations &amp; dialogue par tchat']
        },
        {
            id: 'act_agent', x: 393, y: 40, w: 308, h: 100,
            stroke: '#D97706', title: 'Conseiller SAV', tag: '« RÔLE AGENT »', tagBg: '#FFFBEB', tagColor: '#92400E',
            lines: ['• <b>Traitement des tickets</b> assignés &amp; SLA', '• Messagerie client &amp; notes confidentielles']
        },
        {
            id: 'act_manager', x: 726, y: 40, w: 308, h: 100,
            stroke: '#7C3AED', title: 'Superviseur SAV', tag: '« RÔLE MANAGER »', tagBg: '#FAF5FF', tagColor: '#6D28D9',
            lines: ['• <b>Supervision des files</b> &amp; charge agents', '• Gestion compétences (Skills) &amp; succursales']
        },
        {
            id: 'act_admin', x: 1059, y: 40, w: 308, h: 100,
            stroke: '#2563EB', title: 'Administrateur Entreprise', tag: '« OWNER / ADMIN »', tagBg: '#EFF6FF', tagColor: '#1E40AF',
            lines: ['• <b>Invitations d\'équipe</b> &amp; branding public', '• Facturation SasPay &amp; politique IA']
        },
        {
            id: 'act_operator', x: 1392, y: 40, w: 308, h: 100,
            stroke: '#475569', title: 'Opérateur Plateforme', tag: '« SAAS OPERATOR »', tagBg: '#F1F5F9', tagColor: '#334155',
            lines: ['• <b>Supervision technique</b> Docker/Postgres', '• Certification entreprise (Badge vérifié)']
        }
    ];

    actors.forEach(a => {
        const val = `<div style="text-align:center;padding-top:4px;">` +
            `<span style="font-size:9.5px;font-weight:700;letter-spacing:0.5px;color:${a.tagColor};background:${a.tagBg};padding:2px 6px;border-radius:4px;">${a.tag}</span><br/>` +
            `<b style="font-size:14px;color:${a.tagColor};">${a.title}</b>` +
            `</div>` +
            `<hr style="border:none;border-top:1px solid #E2E8F0;margin:5px 0;"/>` +
            `<div style="text-align:left;padding:0 8px;font-size:11.5px;color:#334155;line-height:1.45;">` +
            a.lines.join('<br/>') +
            `</div>`;
        cells.push(`<mxCell id="${a.id}" parent="1" value="${escapeXml(val)}" style="rounded=1;arcSize=8;shadow=1;fillColor=#FFFFFF;strokeColor=${a.stroke};strokeWidth=1.6;verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
        cells.push(`  <mxGeometry x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // 2. Espaces d'accès
    // Espace Public
    const pubVal = `<div style="padding:4px 8px;">` +
        `<div style="display:flex;justify-content:space-between;align-items:center;">` +
        `<b style="font-size:14px;color:#065F46;">ESPACE PUBLIC CLIENTS &amp; VISITEURS</b>` +
        `<span style="font-size:9.5px;font-weight:700;color:#166534;background:#DCFCE7;padding:2px 6px;border-radius:4px;">ACCÈS LIBRE WEB</span>` +
        `</div>` +
        `<hr style="border:none;border-top:1px solid #A7F3D0;margin:6px 0;"/>` +
        `<div style="font-size:11.5px;color:#334155;line-height:1.5;">` +
        `• <b>Annuaire des entreprises certifiées</b> (<i>/entreprises</i>) : Recherche &amp; géolocalisation<br/>` +
        `• <b>Vitrine SAV &amp; Agences physiques</b> (<i>/entreprises/[slug]</i>) : Horaires, adresses, contacts<br/>` +
        `• <b>Widget Tchat SAV instantané</b> : Dialogue direct avec session par jeton sécurisé` +
        `</div>` +
        `</div>`;
    cells.push(`<mxCell id="space_public" parent="1" value="${escapeXml(pubVal)}" style="rounded=1;arcSize=8;shadow=1;fillColor=#FFFFFF;strokeColor=#10B981;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="60" y="195" width="580" height="135" as="geometry" />`);
    cells.push(`</mxCell>`);

    // Espace Workspace
    const wsVal = `<div style="padding:4px 8px;">` +
        `<div style="display:flex;justify-content:space-between;align-items:center;">` +
        `<b style="font-size:14px;color:#1E40AF;">ESPACE DE TRAVAIL COLLABORATIF ENTREPRISE (Workspace Multi-Tenant)</b>` +
        `<span style="font-size:9.5px;font-weight:700;color:#1E40AF;background:#DBEAFE;padding:2px 6px;border-radius:4px;">ACCÈS AUTHENTIFIÉ (RBAC)</span>` +
        `</div>` +
        `<hr style="border:none;border-top:1px solid #BFDBFE;margin:6px 0;"/>` +
        `<div style="display:flex;gap:12px;font-size:11px;line-height:1.45;">` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 8px;border-radius:6px;border:1px solid #E2E8F0;">` +
        `    <b style="color:#B45309;font-size:12px;">Cockpit Conseiller</b><br/>` +
        `    • File « Mes tickets » &amp; SLA<br/>` +
        `    • Tchat &amp; jauge de disponibilité` +
        `  </div>` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 8px;border-radius:6px;border:1px solid #E2E8F0;">` +
        `    <b style="color:#6D28D9;font-size:12px;">Console Supervision</b><br/>` +
        `    • Monitoring files d'attente<br/>` +
        `    • Compétences &amp; agences physiques` +
        `  </div>` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 8px;border-radius:6px;border:1px solid #E2E8F0;">` +
        `    <b style="color:#1D4ED8;font-size:12px;">Administration Générale</b><br/>` +
        `    • Invitations &amp; rôles d'équipe<br/>` +
        `    • Facturation SasPay &amp; politique IA` +
        `  </div>` +
        `</div>` +
        `</div>`;
    cells.push(`<mxCell id="space_workspace" parent="1" value="${escapeXml(wsVal)}" style="rounded=1;arcSize=8;shadow=1;fillColor=#FFFFFF;strokeColor=#3B82F6;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="680" y="195" width="1020" height="135" as="geometry" />`);
    cells.push(`</mxCell>`);

    // 3. Modules fonctionnels métier (6 cartes)
    const modules = [
        {
            id: 'mod_tickets', x: 60, y: 385, w: 520, h: 190, stroke: '#8B5CF6', title: '1. Demandes &amp; Tickets SAV',
            badge: 'OPÉRATIONNEL', badgeBg: '#FAF5FF', badgeColor: '#6D28D9', titleColor: '#5B21B6',
            lines: [
                '• <b>Dossier technique unique</b> : Référence formelle (ex: TICK-ABC123)',
                '• <b>Cycle de vie SAV</b> : PENDING → OPEN → IN_PROGRESS → RESOLVED',
                '• <b>Priorités &amp; Engagements SLA</b> : Alertes visuelles de dépassement',
                '• <b>Traçabilité inaltérable</b> : Journal chronologique (TicketActivity)',
                '• <b>Collaboration</b> : Partage inter-agences (TicketShare) &amp; pièces jointes'
            ]
        },
        {
            id: 'mod_conv', x: 620, y: 385, w: 520, h: 190, stroke: '#0D9488', title: '2. Conversations &amp; Dialogue Direct',
            badge: 'OPÉRATIONNEL', badgeBg: '#F0FDFA', badgeColor: '#0F766E', titleColor: '#0F766E',
            lines: [
                '• <b>Messagerie temps réel</b> : Dialogue interactif client ↔ conseiller SAV',
                '• <b>Session client autonome</b> : Jeton sécurisé sans création de compte',
                '• <b>Notes internes confidentielles</b> : Visibles uniquement par l\'équipe',
                '• <b>Élévation en Ticket SAV</b> : Conversion directe en 1 clic avec historique',
                '• <b>Transmission de pièces</b> : Photos justificatives &amp; bons de garantie'
            ]
        },
        {
            id: 'mod_team', x: 1180, y: 385, w: 520, h: 190, stroke: '#F59E0B', title: '3. Équipe, Compétences &amp; Agences',
            badge: 'OPÉRATIONNEL', badgeBg: '#FFFBEB', badgeColor: '#92400E', titleColor: '#B45309',
            lines: [
                '• <b>Profils &amp; jauges de charge</b> : Plafond de tickets simultanés (maxCapacity)',
                '• <b>Disponibilités temps réel</b> : AVAILABLE, BUSY, AWAY, OFFLINE',
                '• <b>Matrice de compétences</b> : Tags de qualification technique (Skills)',
                '• <b>Attribution déterministe</b> : Orientation auto selon charge &amp; compétences',
                '• <b>Établissements physiques</b> : Gestion succursales, ateliers &amp; adresses'
            ]
        },
        {
            id: 'mod_sec', x: 60, y: 610, w: 520, h: 190, stroke: '#64748B', title: '4. Sécurité, Contrôle RBAC &amp; Événements',
            badge: 'OPÉRATIONNEL', badgeBg: '#F1F5F9', badgeColor: '#334155', titleColor: '#1E293B',
            lines: [
                '• <b>Sessions sécurisées</b> : Cookies HttpOnly SameSite=Lax &amp; validation OTP',
                '• <b>Contrôle multi-tenant strict</b> : Middleware requireWorkspaceRole',
                '• <b>Transactional Outbox Pattern</b> : Garantie de non-perte d\'événements',
                '• <b>Diffusion SSE (Pulse Stream)</b> : Actualisation cockpits sans rafraîchissement',
                '• <b>Journal d\'audit réglementaire</b> : Traçabilité inaltérable des actions'
            ]
        },
        {
            id: 'mod_comm', x: 620, y: 610, w: 520, h: 190, stroke: '#10B981', title: '5. Facturation, Quotas &amp; SasPay',
            badge: 'OPÉRATIONNEL', badgeBg: '#ECFDF5', badgeColor: '#047857', titleColor: '#065F46',
            lines: [
                '• <b>Formules SaaS</b> : Grille tarifaire officielle (Starter, Pro, Enterprise)',
                '• <b>Contrôle dynamique des quotas</b> : Nombre d\'agents &amp; volume de tickets',
                '• <b>Passerelle SasPay (Zone CEMAC)</b> : Airtel Money, MTN MoMo &amp; cartes',
                '• <b>Traitement asynchrone</b> : Webhooks sécurisés &amp; activation immédiate',
                '• <b>Historique financier</b> : Suivi des factures et périodes d\'abonnement'
            ]
        },
        {
            id: 'mod_ai', x: 1180, y: 610, w: 520, h: 190, stroke: '#6366F1', title: '6. Assistance IA &amp; RAG (Supervisée)',
            badge: 'ARCHITECTURE CIBLE', badgeBg: '#EEF2FF', badgeColor: '#4338CA', titleColor: '#4338CA', dashed: true,
            lines: [
                '• <b>Base de connaissances vectorielle</b> : Ingestion FAQ &amp; manuels (chunks)',
                '• <b>Moteur RAG (Llama 3.3)</b> : Réponses contextualisées fiables',
                '• <b>Modes d\'autonomie</b> : Brouillon proposé à l\'agent ou réponse semi-auto',
                '<span style="color:#DC2626;">• <b>Escalade humaine obligatoire</b> : Sentiment négatif ou litige &gt; 50 000 XAF</span>',
                '• <b>Supervision continue</b> : Score de confiance &amp; validation par l\'équipe'
            ]
        }
    ];

    modules.forEach(m => {
        const val = `<div style="padding:4px 8px;">` +
            `<div style="display:flex;justify-content:space-between;align-items:center;">` +
            `<b style="font-size:13.5px;color:${m.titleColor};">${m.title}</b>` +
            `<span style="font-size:9.5px;font-weight:700;color:${m.badgeColor};background:${m.badgeBg};padding:2px 6px;border-radius:4px;">${m.badge}</span>` +
            `</div>` +
            `<hr style="border:none;border-top:1px solid #E2E8F0;margin:6px 0;"/>` +
            `<div style="font-size:11.5px;color:#334155;line-height:1.5;">` +
            m.lines.join('<br/>') +
            `</div>` +
            `</div>`;
        const dashStyle = m.dashed ? ';dashed=1;dashPattern=5 4' : '';
        cells.push(`<mxCell id="${m.id}" parent="1" value="${escapeXml(val)}" style="rounded=1;arcSize=8;shadow=1;fillColor=#FFFFFF;strokeColor=${m.stroke};strokeWidth=1.6${dashStyle};verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
        cells.push(`  <mxGeometry x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // 4. Niveau 4 : Persistance
    const persistVal = `<div style="padding:4px 8px;">` +
        `<div style="display:flex;justify-content:space-between;align-items:center;">` +
        `<b style="font-size:14px;color:#0F172A;">SOCLE MULTI-TENANT &amp; PERSISTANCE POLYGLOTTE DE DONNÉES</b>` +
        `<span style="font-size:9.5px;font-weight:700;color:#334155;background:#F1F5F9;padding:2px 6px;border-radius:4px;">INFRASTRUCTURE LOGIQUE</span>` +
        `</div>` +
        `<hr style="border:none;border-top:1px solid #CBD5E1;margin:6px 0;"/>` +
        `<div style="display:flex;gap:16px;font-size:11px;line-height:1.45;">` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 10px;border-radius:6px;border:1px solid #93C5FD;">` +
        `    <b style="color:#1D4ED8;font-size:12px;">PostgreSQL &amp; Prisma (Multi-Tenant)</b><br/>` +
        `    • <b>Cloisonnement par workspaceId</b> sur toutes les tables<br/>` +
        `    • Modèle universel : comptes multi-organisations<br/>` +
        `    • Intégrité transactionnelle ACID &amp; clés étrangères` +
        `  </div>` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 10px;border-radius:6px;border:1px solid #FCA5A5;">` +
        `    <b style="color:#B91C1C;font-size:12px;">Redis &amp; BullMQ (Cache &amp; Broker)</b><br/>` +
        `    • <b>Cache applicatif</b> à dégradation gracieuse<br/>` +
        `    • Files asynchrones (SasPay, notifications, emails)<br/>` +
        `    • Découplage API &amp; verrous distribués` +
        `  </div>` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 10px;border-radius:6px;border:1px dashed #A5B4FC;">` +
        `    <b style="color:#4338CA;font-size:12px;">MongoDB Atlas (Vecteurs RAG — Cible)</b><br/>` +
        `    • Indexation vectorielle dense (chunks 1536 dim.)<br/>` +
        `    • <b>Partitionnement par tenant</b> (secret d'affaires)<br/>` +
        `    • Recherche cosinus pour injection contextuelle` +
        `  </div>` +
        `</div>` +
        `</div>`;
    cells.push(`<mxCell id="layer_persist" parent="1" value="${escapeXml(persistVal)}" style="rounded=1;arcSize=8;shadow=1;fillColor=#FFFFFF;strokeColor=#64748B;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="60" y="845" width="1640" height="150" as="geometry" />`);
    cells.push(`</mxCell>`);

    // 5. Connecteurs
    cells.push(`<mxCell id="edge1" parent="1" edge="1" source="act_client" target="space_public" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#059669;strokeWidth=1.6;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge2" parent="1" edge="1" source="act_agent" target="space_workspace" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#D97706;strokeWidth=1.6;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge3" parent="1" edge="1" source="act_manager" target="space_workspace" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#7C3AED;strokeWidth=1.6;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge4" parent="1" edge="1" source="act_admin" target="space_workspace" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#2563EB;strokeWidth=1.6;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge5" parent="1" value="Session tchat direct" edge="1" source="space_public" target="mod_conv" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#0D9488;strokeWidth=1.6;endArrow=block;endFill=1;fontSize=10;fontColor=#0F766E;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge6" parent="1" value="Prise en charge &amp; traitement" edge="1" source="space_workspace" target="mod_tickets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#8B5CF6;strokeWidth=1.6;endArrow=block;endFill=1;fontSize=10;fontColor=#5B21B6;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge7" parent="1" value="Élévation SAV" edge="1" source="mod_conv" target="mod_tickets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#8B5CF6;strokeWidth=1.6;endArrow=block;endFill=1;fontSize=9.5;fontColor=#5B21B6;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge8" parent="1" value="Suggestions RAG" edge="1" source="mod_ai" target="mod_conv" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#6366F1;strokeWidth=1.6;dashed=1;dashPattern=4 3;endArrow=block;endFill=1;fontSize=9.5;fontColor=#4338CA;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge9" parent="1" edge="1" source="mod_sec" target="layer_persist" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64748B;strokeWidth=1.6;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge10" parent="1" edge="1" source="mod_comm" target="layer_persist" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64748B;strokeWidth=1.6;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="edge11" parent="1" value="Exploitation système" edge="1" source="act_operator" target="layer_persist" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#475569;strokeWidth=1.6;dashed=1;dashPattern=4 3;endArrow=block;endFill=1;fontSize=10;fontColor=#334155;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    const xml = `<mxfile host="app.diagrams.net" modified="2026-11-21T01:45:00.000Z" agent="Antigravity / Lead Architect" version="24.7.0">
  <diagram id="zadesk-functional-arch" name="Architecture Fonctionnelle Zadesk">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1760" pageHeight="1080" math="0" shadow="0">
      <root>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
}

// Write files
const svgPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.svg');
fs.writeFileSync(svgPath, svg, 'utf8');
console.log('New Clean SVG written:', svgPath, 'Size:', fs.statSync(svgPath).size);

const drawioXml = generateDrawio();
const drawioPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.drawio');
fs.writeFileSync(drawioPath, drawioXml, 'utf8');
console.log('New Clean Drawio written:', drawioPath, 'Size:', fs.statSync(drawioPath).size);

// Render PNG
const pngPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.png');
sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(pngPath)
    .then(info => {
        console.log('New Clean PNG rendered:', pngPath, info);
    })
    .catch(err => {
        console.error('Error rendering PNG:', err);
    });
