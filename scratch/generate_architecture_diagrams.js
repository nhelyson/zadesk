const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve('frontend/node_modules/sharp'));

const width = 2100;
const height = 1260;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>
    <style>
        text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .code { font-family: Consolas, 'Courier New', monospace; }
        
        .main-title { font-size: 24px; font-weight: 800; fill: #0F172A; text-anchor: middle; letter-spacing: -0.5px; }
        .main-subtitle { font-size: 13.5px; font-weight: 500; fill: #475569; text-anchor: middle; }
        
        .section-label { font-size: 13px; font-weight: 800; fill: #1E3A8A; letter-spacing: 0.6px; }
        
        .card-bg { rx: 8; ry: 8; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.05)); }
        
        .actor-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-anchor: middle; }
        .actor-title { font-size: 15px; font-weight: 700; text-anchor: middle; }
        .actor-sub { font-size: 11px; font-weight: 600; fill: #64748B; text-anchor: middle; }
        .actor-desc { font-size: 11px; font-weight: 400; fill: #334155; line-height: 1.45; }
        
        .block-title { font-size: 15px; font-weight: 700; }
        .block-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
        
        .mod-header { font-size: 14px; font-weight: 700; text-anchor: middle; }
        .mod-badge { font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-anchor: middle; }
        
        .item-text { font-size: 11px; fill: #1E293B; }
        .item-bold { font-weight: 700; }
        .item-sub { fill: #475569; font-size: 10.5px; }
        
        .flow-line { fill: none; stroke-width: 1.8; }
        .flow-label { font-size: 10.5px; font-weight: 700; fill: #0F172A; }
    </style>
    
    <marker id="arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#059669"/>
    </marker>
    <marker id="arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#D97706"/>
    </marker>
    <marker id="arrow-purple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#7C3AED"/>
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#2563EB"/>
    </marker>
    <marker id="arrow-slate" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#475569"/>
    </marker>
    <marker id="arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#0D9488"/>
    </marker>
    <marker id="arrow-indigo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#4F46E5"/>
    </marker>
    <marker id="arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#DC2626"/>
    </marker>
</defs>

<!-- ARRIÈRE-PLAN GLOBAL -->
<rect width="${width}" height="${height}" fill="#FAFAF9"/>

<!-- EN-TÊTE ACADÉMIQUE -->
<text x="1050" y="36" class="main-title">ARCHITECTURE FONCTIONNELLE DE LA PLATEFORME ZADESK</text>
<text x="1050" y="58" class="main-subtitle">Cartographie des acteurs, des espaces d'accès, des modules opérationnels (Humain), du module IA cible et de la gouvernance multi-tenant</text>

<!-- ========================================================================================= -->
<!-- NIVEAU 1 : ACTEURS DU SYSTÈME & RÔLES UTILISATEURS -->
<!-- ========================================================================================= -->
<text x="80" y="93" class="section-label">NIVEAU 1 : ACTEURS DU SYSTÈME &amp; RÔLES UTILISATEURS</text>

<!-- 1.1 Client / Consommateur -->
<g id="actor-client">
    <rect x="80" y="105" width="360" height="100" class="card-bg" fill="#ECFDF5" stroke="#059669" stroke-width="1.6" />
    <text x="260" y="123" class="actor-tag" fill="#065F46">« EXTERNAL »</text>
    <text x="260" y="142" class="actor-title" fill="#065F46">Client / Consommateur</text>
    <line x1="90" y1="150" x2="430" y2="150" stroke="#A7F3D0" stroke-width="1"/>
    <text x="96" y="167" class="item-text"><tspan class="item-bold">• Sans compte requis</tspan> sur le portail public</text>
    <text x="96" y="183" class="item-text">• Dépose des réclamations &amp; dialogue en direct</text>
    <text x="96" y="197" class="item-text">• Suit l'avancement via son jeton de session</text>
</g>

<!-- 1.2 Conseiller SAV -->
<g id="actor-agent">
    <rect x="470" y="105" width="360" height="100" class="card-bg" fill="#FFFBEB" stroke="#D97706" stroke-width="1.6" />
    <text x="650" y="123" class="actor-tag" fill="#92400E">« INTERNAL AGENT »</text>
    <text x="650" y="142" class="actor-title" fill="#92400E">Conseiller SAV (Agent)</text>
    <line x1="480" y1="150" x2="820" y2="150" stroke="#FDE68A" stroke-width="1"/>
    <text x="486" y="167" class="item-text"><tspan class="item-bold">• Traite les tickets</tspan> assignés et partagés</text>
    <text x="486" y="183" class="item-text">• Échange par tchat et saisit des notes internes</text>
    <text x="486" y="197" class="item-text">• Ajuste sa disponibilité (Disponible, Occupé, etc.)</text>
</g>

<!-- 1.3 Superviseur SAV -->
<g id="actor-manager">
    <rect x="860" y="105" width="360" height="100" class="card-bg" fill="#FAF5FF" stroke="#7C3AED" stroke-width="1.6" />
    <text x="1040" y="123" class="actor-tag" fill="#6D28D9">« TEAM LEAD »</text>
    <text x="1040" y="142" class="actor-title" fill="#6D28D9">Superviseur SAV (Manager)</text>
    <line x1="870" y1="150" x2="1210" y2="150" stroke="#DDD6FE" stroke-width="1"/>
    <text x="876" y="167" class="item-text"><tspan class="item-bold">• Supervise les files</tspan> d'attente &amp; charges agents</text>
    <text x="876" y="183" class="item-text">• Gère les compétences (Skills) &amp; succursales</text>
    <text x="876" y="197" class="item-text">• Arbitre les escalades et réaffecte les dossiers</text>
</g>

<!-- 1.4 Administrateur Entreprise -->
<g id="actor-admin">
    <rect x="1250" y="105" width="380" height="100" class="card-bg" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.6" />
    <text x="1440" y="123" class="actor-tag" fill="#1E40AF">« OWNER / ADMIN »</text>
    <text x="1440" y="142" class="actor-title" fill="#1E40AF">Administrateur Entreprise</text>
    <line x1="1260" y1="150" x2="1620" y2="150" stroke="#BFDBFE" stroke-width="1"/>
    <text x="1266" y="167" class="item-text"><tspan class="item-bold">• Configure la vitrine</tspan> publique &amp; branding</text>
    <text x="1266" y="183" class="item-text">• Invite les membres contractuels &amp; rôles</text>
    <text x="1266" y="197" class="item-text">• Gère la facturation SasPay &amp; politique IA</text>
</g>

<!-- 1.5 Opérateur Plateforme -->
<g id="actor-devops">
    <rect x="1660" y="105" width="360" height="100" class="card-bg" fill="#F8FAFC" stroke="#475569" stroke-width="1.6" />
    <text x="1840" y="123" class="actor-tag" fill="#334155">« SAAS OPERATOR »</text>
    <text x="1840" y="142" class="actor-title" fill="#1E293B">Opérateur Plateforme</text>
    <line x1="1670" y1="150" x2="2010" y2="150" stroke="#CBD5E1" stroke-width="1"/>
    <text x="1676" y="167" class="item-text"><tspan class="item-bold">• Supervise l'infrastructure</tspan> Docker / Postgres</text>
    <text x="1676" y="183" class="item-text">• Certifie les entreprises (badge vérifié)</text>
    <text x="1676" y="197" class="item-text">• Maintient la sécurité et les quotas globaux</text>
</g>

<!-- ========================================================================================= -->
<!-- NIVEAU 2 : ESPACES D'ACCÈS & CANAUX D'INTERACTION -->
<!-- ========================================================================================= -->
<text x="80" y="235" class="section-label">NIVEAU 2 : ESPACES D'ACCÈS &amp; CANAUX D'INTERACTION</text>

<!-- 2.1 Espace Public Client -->
<g id="space-public">
    <rect x="80" y="247" width="650" height="195" class="card-bg" fill="#F0FDF4" stroke="#16A34A" stroke-width="1.8" />
    <text x="100" y="272" class="block-title" fill="#15803D">ESPACE PUBLIC CLIENTS &amp; VISITEURS (Sans compte)</text>
    <rect x="580" y="258" width="135" height="20" rx="4" fill="#DCFCE7"/>
    <text x="647" y="272" class="block-badge" fill="#166534" text-anchor="middle">ACCÈS LIBRE WEB</text>
    <line x1="95" y1="285" x2="715" y2="285" stroke="#86EFAC" stroke-width="1.5"/>
    
    <text x="100" y="308" class="item-text"><tspan class="item-bold">• Annuaire Public des Entreprises Certifiées (/entreprises)</tspan></text>
    <text x="115" y="324" class="item-sub">Moteur de recherche et géolocalisation des commerces vérifiés.</text>
    
    <text x="100" y="347" class="item-text"><tspan class="item-bold">• Portail SAV &amp; Vitrine Agences (/entreprises/[slug])</tspan></text>
    <text x="115" y="363" class="item-sub">Coordonnées de contact, horaires d'ouverture et adresses des succursales physiques.</text>
    
    <text x="100" y="386" class="item-text"><tspan class="item-bold">• Widget Tchat SAV Public Instantané</tspan></text>
    <text x="115" y="402" class="item-sub">Assistance en direct. Session client maintenue par jeton sécurisé sans login.</text>
    <text x="115" y="418" class="item-sub">Possibilité de joindre des photos de justificatifs ou tickets de caisse.</text>
</g>

<!-- 2.2 Espace Entreprise Workspace -->
<g id="space-workspace">
    <rect x="760" y="247" width="1260" height="195" class="card-bg" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.8" />
    <text x="780" y="272" class="block-title" fill="#1E40AF">ESPACE DE TRAVAIL COLLABORATIF ENTREPRISE (Workspace Multi-Tenant)</text>
    <rect x="1805" y="258" width="195" height="20" rx="4" fill="#DBEAFE"/>
    <text x="1902" y="272" class="block-badge" fill="#1E40AF" text-anchor="middle">ACCÈS AUTHENTIFIÉ PAR RÔLE</text>
    <line x1="775" y1="285" x2="2005" y2="285" stroke="#93C5FD" stroke-width="1.5"/>
    
    <!-- 3 sous-colonnes -->
    <!-- Sous-colonne 1: Agent -->
    <rect x="780" y="297" width="390" height="130" rx="6" fill="#FFFFFF" stroke="#FDE68A" stroke-width="1.4"/>
    <text x="795" y="318" class="item-bold" fill="#B45309" font-size="12">Cockpit Conseiller (AGENT)</text>
    <text x="795" y="340" class="item-text">• Tableau de bord opérationnel personnel</text>
    <text x="795" y="360" class="item-text">• Traitement « Mes tickets » &amp; suivi SLA</text>
    <text x="795" y="380" class="item-text">• Messagerie client direct &amp; notes internes</text>
    <text x="795" y="400" class="item-text">• Statut présence &amp; jauge de charge active</text>
    
    <!-- Sous-colonne 2: Manager -->
    <rect x="1195" y="297" width="395" height="130" rx="6" fill="#FFFFFF" stroke="#DDD6FE" stroke-width="1.4"/>
    <text x="1210" y="318" class="item-bold" fill="#6D28D9" font-size="12">Console Supervision (MANAGER)</text>
    <text x="1210" y="340" class="item-text">• Monitoring temps réel des files d'attente</text>
    <text x="1210" y="360" class="item-text">• Gestion des compétences (Skills) agents</text>
    <text x="1210" y="380" class="item-text">• Administration des agences physiques</text>
    <text x="1210" y="400" class="item-text">• Réaffectation de dossiers &amp; arbitrage</text>
    
    <!-- Sous-colonne 3: Admin -->
    <rect x="1615" y="297" width="385" height="130" rx="6" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1.4"/>
    <text x="1630" y="318" class="item-bold" fill="#1D4ED8" font-size="12">Administration (OWNER / ADMIN)</text>
    <text x="1630" y="340" class="item-text">• Profil de l'entreprise &amp; coordonnées SAV</text>
    <text x="1630" y="360" class="item-text">• Invitations d'équipe &amp; attribution des rôles</text>
    <text x="1630" y="380" class="item-text">• Configuration IA &amp; base de connaissances</text>
    <text x="1630" y="400" class="item-text">• Abonnements SasPay &amp; rapports globaux</text>
</g>

<!-- ========================================================================================= -->
<!-- NIVEAU 3 : CŒUR DES MODULES FONCTIONNELS MÉTIER -->
<!-- ========================================================================================= -->
<text x="80" y="475" class="section-label">NIVEAU 3 : CŒUR DES MODULES FONCTIONNELS MÉTIER</text>

<!-- 3.1 Module Tickets SAV -->
<g id="mod-tickets">
    <rect x="80" y="490" width="460" height="270" class="card-bg" fill="#FAF5FF" stroke="#7C3AED" stroke-width="1.8" />
    <rect x="200" y="498" width="220" height="18" rx="3" fill="#EDE9FE"/>
    <text x="310" y="511" class="mod-badge" fill="#6D28D9">MODULE HUMAIN • OPÉRATIONNEL</text>
    <text x="310" y="534" class="mod-header" fill="#5B21B6">1. Gestion des Demandes &amp; Tickets SAV</text>
    <line x1="95" y1="544" x2="525" y2="544" stroke="#C4B5FD" stroke-width="1.5"/>
    
    <text x="100" y="567" class="item-text"><tspan class="item-bold">• Dossier SAV Unique</tspan> : Référence formelle (ex: TICK-ABC123)</text>
    <text x="100" y="587" class="item-text"><tspan class="item-bold">• Cycle de Vie</tspan> : PENDING → OPEN → IN_PROGRESS → RESOLVED</text>
    <text x="100" y="607" class="item-text"><tspan class="item-bold">• Priorisation</tspan> : Faible, Moyen, Élevé, Urgent</text>
    <text x="100" y="627" class="item-text"><tspan class="item-bold">• Engagements SLA</tspan> : Délais butoirs &amp; alertes dépassement</text>
    <text x="100" y="647" class="item-text"><tspan class="item-bold">• Traçabilité Chronologique</tspan> : Historique (TicketActivity)</text>
    <text x="100" y="667" class="item-text"><tspan class="item-bold">• Collaboration Inter-Agences</tspan> : Partages (TicketShare)</text>
    <text x="100" y="687" class="item-text"><tspan class="item-bold">• Résolution Formelle</tspan> : Motif, note de clôture &amp; audit</text>
    <text x="100" y="707" class="item-text"><tspan class="item-bold">• Fiche Client Rattachée</tspan> : Historique réclamations client</text>
    <text x="100" y="727" class="item-text"><tspan class="item-bold">• Pièces Jointes</tspan> : Photos, bons d'achat, documents PDF</text>
    <text x="100" y="747" class="item-text"><tspan class="item-bold">• Tags Métiers</tspan> : Typologie panne, produit, garantie</text>
</g>

<!-- 3.2 Module Conversations Directes -->
<g id="mod-conv">
    <rect x="570" y="490" width="460" height="270" class="card-bg" fill="#F0FDFA" stroke="#0D9488" stroke-width="1.8" />
    <rect x="690" y="498" width="220" height="18" rx="3" fill="#CCFBF1"/>
    <text x="800" y="511" class="mod-badge" fill="#0F766E">MODULE HUMAIN • OPÉRATIONNEL</text>
    <text x="800" y="534" class="mod-header" fill="#0F766E">2. Conversations &amp; Dialogue Direct</text>
    <line x1="585" y1="544" x2="1015" y2="544" stroke="#5EEAD4" stroke-width="1.5"/>
    
    <text x="590" y="567" class="item-text"><tspan class="item-bold">• Messagerie Temps Réel Web</tspan> : Échanges client ↔ conseiller</text>
    <text x="590" y="587" class="item-text"><tspan class="item-bold">• Session Client Autonome</tspan> : Jeton cryptographique sécurisé</text>
    <text x="590" y="607" class="item-text"><tspan class="item-bold">• Notes Internes Confidentielles</tspan> : Visibles agents uniquement</text>
    <text x="590" y="627" class="item-text"><tspan class="item-bold">• Pièces Jointes</tspan> : Transmission de photos ou factures</text>
    <text x="590" y="650" class="item-text"><tspan class="item-bold">• Élévation Contextuelle</tspan> :</text>
    <text x="605" y="670" class="item-sub">Conversion directe d'un fil de tchat en Ticket SAV formel</text>
    <text x="605" y="688" class="item-sub">en 1 clic, avec conservation intégrale des messages.</text>
    <text x="590" y="711" class="item-text"><tspan class="item-bold">• Statut de Conversation</tspan> : ACTIVE, SNOOZED, CLOSED</text>
    <text x="590" y="731" class="item-text"><tspan class="item-bold">• Indicateurs Temps Réel</tspan> : En train d'écrire, accusé lecture</text>
    <text x="590" y="750" class="item-text"><tspan class="item-bold">• Multi-sessions</tspan> : Reprise transparente sur mobile ou PC</text>
</g>

<!-- 3.3 Module Équipe, Compétences & Agences -->
<g id="mod-team">
    <rect x="1060" y="490" width="460" height="270" class="card-bg" fill="#FFFBEB" stroke="#D97706" stroke-width="1.8" />
    <rect x="1180" y="498" width="220" height="18" rx="3" fill="#FEF3C7"/>
    <text x="1290" y="511" class="mod-badge" fill="#92400E">MODULE HUMAIN • OPÉRATIONNEL</text>
    <text x="1290" y="534" class="mod-header" fill="#B45309">3. Équipe, Compétences &amp; Agences</text>
    <line x1="1075" y1="544" x2="1505" y2="544" stroke="#FCD34D" stroke-width="1.5"/>
    
    <text x="1080" y="567" class="item-text"><tspan class="item-bold">• Profils Agents Dédiés</tspan> : Fiche agent liée au compte User</text>
    <text x="1080" y="587" class="item-text"><tspan class="item-bold">• Jauges Capacitaires</tspan> : Plafond de tickets simultanés (maxCapacity)</text>
    <text x="1080" y="607" class="item-text"><tspan class="item-bold">• Disponibilités Temps Réel</tspan> : AVAILABLE, BUSY, AWAY, OFFLINE</text>
    <text x="1080" y="627" class="item-text"><tspan class="item-bold">• Matrice des Compétences</tspan> : Référentiel de tags de qualification</text>
    <text x="1080" y="650" class="item-text"><tspan class="item-bold">• Moteur d'Attribution Déterministe</tspan> :</text>
    <text x="1095" y="670" class="item-sub">Algorithme d'affectation automatique combinant compétences</text>
    <text x="1095" y="688" class="item-sub">requises, statut actif et charge résiduelle de l'agent.</text>
    <text x="1080" y="711" class="item-text"><tspan class="item-bold">• Établissements Physiques (Establishment)</tspan> :</text>
    <text x="1095" y="731" class="item-sub">Gestion des succursales, ateliers SAV et points relais</text>
    <text x="1095" y="749" class="item-sub">avec horaires, adresses, contacts et géolocalisation.</text>
</g>

<!-- 3.4 Module Assistance IA (Cible) -->
<g id="mod-ai">
    <rect x="1550" y="490" width="470" height="270" class="card-bg" fill="#EEF2FF" stroke="#4F46E5" stroke-width="1.8" stroke-dasharray="6,4" />
    <rect x="1650" y="498" width="270" height="18" rx="3" fill="#E0E7FF"/>
    <text x="1785" y="511" class="mod-badge" fill="#4338CA">ARCHITECTURE CIBLE • EN PRÉPARATION</text>
    <text x="1785" y="534" class="mod-header" fill="#4338CA">4. Assistance IA &amp; RAG (Supervisée)</text>
    <line x1="1565" y1="544" x2="2005" y2="544" stroke="#A5B4FC" stroke-width="1.5"/>
    
    <text x="1570" y="567" class="item-text"><tspan class="item-bold">• Base de Connaissances Vectorielle</tspan> : Ingestion FAQ &amp; manuels</text>
    <text x="1570" y="587" class="item-text"><tspan class="item-bold">• Découpage en Fragments (Chunks)</tspan> : Embeddings denses</text>
    <text x="1570" y="607" class="item-text"><tspan class="item-bold">• Moteur RAG &amp; LLM Llama 3.3</tspan> : Réponses contextualisées</text>
    <text x="1570" y="627" class="item-text"><tspan class="item-bold">• Modes d'Autonomie Paramétrables</tspan> :</text>
    <text x="1585" y="647" class="item-sub">Assisté (brouillon proposé), Semi-autonome, Autonome</text>
    <text x="1570" y="670" class="item-text"><tspan class="item-bold">• Déclencheurs d'Escalade Humaine Impérative</tspan> :</text>
    <text x="1585" y="690" class="item-text" fill="#DC2626"><tspan class="item-bold">⚠ 1. Détection sémantique d'irritation ou mécontentement client</tspan></text>
    <text x="1585" y="708" class="item-text" fill="#DC2626"><tspan class="item-bold">⚠ 2. Litige financier &gt; 50 000 XAF (seuil contractuel)</tspan></text>
    <text x="1585" y="726" class="item-text" fill="#DC2626"><tspan class="item-bold">⚠ 3. Demande explicite de transfert à un conseiller humain</tspan></text>
    <text x="1570" y="749" class="item-text"><tspan class="item-bold">• Journal d'Audit &amp; Confiance</tspan> : Score de pertinence et logs</text>
</g>

<!-- 3.5 Module Sécurité & Audit -->
<g id="mod-sec">
    <rect x="80" y="780" width="950" height="175" class="card-bg" fill="#F8FAFC" stroke="#475569" stroke-width="1.8" />
    <text x="100" y="805" class="block-title" fill="#1E293B">5. Sécurité, Contrôle d'Accès &amp; Traçabilité Temps Réel</text>
    <rect x="900" y="791" width="115" height="20" rx="3" fill="#E2E8F0"/>
    <text x="957" y="805" class="block-badge" fill="#334155" text-anchor="middle">OPÉRATIONNEL</text>
    <line x1="95" y1="817" x2="1015" y2="817" stroke="#CBD5E1" stroke-width="1.5"/>
    
    <text x="100" y="840" class="item-text"><tspan class="item-bold">• Authentification &amp; Sessions Cryptographiques</tspan></text>
    <text x="115" y="857" class="item-sub">Jetons de 32 octets aléatoires en base, cookies HttpOnly SameSite=Lax, codes OTP sécurisés.</text>
    
    <text x="100" y="880" class="item-text"><tspan class="item-bold">• Contrôle d'Accès Multi-Tenant Strict (RBAC)</tspan></text>
    <text x="115" y="897" class="item-sub">Middleware <tspan class="code">requireWorkspaceRole</tspan> validant l'adhésion active de l'utilisateur à l'espace.</text>
    
    <text x="100" y="920" class="item-text"><tspan class="item-bold">• Transactional Outbox Pattern &amp; Diffusion SSE (Pulse Stream)</tspan></text>
    <text x="115" y="937" class="item-sub">Garantie de non-perte d'événements critiques et réplication instantanée sur les interfaces sans polling.</text>
</g>

<!-- 3.6 Module Commercial & Facturation -->
<g id="mod-comm">
    <rect x="1060" y="780" width="960" height="175" class="card-bg" fill="#ECFDF5" stroke="#059669" stroke-width="1.8" />
    <text x="1080" y="805" class="block-title" fill="#065F46">6. Gestion Commerciale, Abonnements &amp; Facturation</text>
    <rect x="1890" y="791" width="115" height="20" rx="3" fill="#DCFCE7"/>
    <text x="1947" y="805" class="block-badge" fill="#166534" text-anchor="middle">OPÉRATIONNEL</text>
    <line x1="1075" y1="817" x2="2005" y2="817" stroke="#6EE7B7" stroke-width="1.5"/>
    
    <text x="1080" y="840" class="item-text"><tspan class="item-bold">• Gestion des Formules SaaS</tspan></text>
    <text x="1095" y="857" class="item-sub">Grille tarifaire officielle (Starter, Pro, Enterprise) avec suivi des périodes de validité.</text>
    
    <text x="1080" y="880" class="item-text"><tspan class="item-bold">• Contrôle Dynamique des Quotas Contractuels</tspan></text>
    <text x="1095" y="897" class="item-sub">Plafonds sur le nombre de conseillers autorisés, volume de tickets mensuels et nombre d'agences.</text>
    
    <text x="1080" y="920" class="item-text"><tspan class="item-bold">• Passerelle SasPay &amp; Paiements CEMAC (Airtel Money, MTN MoMo, CB)</tspan></text>
    <text x="1095" y="937" class="item-sub">Traitement asynchrone sécurisé par Webhooks avec validation automatique des transactions.</text>
</g>

<!-- ========================================================================================= -->
<!-- NIVEAU 4 : GOUVERNANCE MULTI-TENANT & PERSISTANCE -->
<!-- ========================================================================================= -->
<text x="80" y="985" class="section-label">NIVEAU 4 : GOUVERNANCE MULTI-TENANT &amp; COUCHE DE PERSISTANCE DE DONNÉES</text>

<g id="layer-data">
    <rect x="80" y="1000" width="1940" height="190" class="card-bg" fill="#F8FAFC" stroke="#64748B" stroke-width="1.8" />
    <text x="100" y="1025" class="block-title" fill="#0F172A">Socle d'Isolation Multi-Tenant, Caching &amp; Persistance Polyglotte</text>
    <rect x="1750" y="1011" width="250" height="20" rx="4" fill="#E2E8F0"/>
    <text x="1875" y="1025" class="block-badge" fill="#334155" text-anchor="middle">INFRASTRUCTURE LOGIQUE SOUS-JACENTE</text>
    <line x1="95" y1="1037" x2="2005" y2="1037" stroke="#94A3B8" stroke-width="1.5"/>
    
    <!-- Sous-bloc 1 : PostgreSQL -->
    <rect x="100" y="1050" width="650" height="125" rx="6" fill="#FFFFFF" stroke="#3B82F6" stroke-width="1.6"/>
    <text x="115" y="1073" class="item-bold" fill="#1D4ED8" font-size="12.5">Base Relationnelle Multi-Tenant (PostgreSQL / Prisma)</text>
    <text x="115" y="1095" class="item-text">• <tspan class="item-bold">Isolation stricte par workspaceId</tspan> sur toutes les tables métiers (Tickets, Conversations, Clients).</text>
    <text x="115" y="1115" class="item-text">• <tspan class="item-bold">Modèle universel des utilisateurs</tspan> : un compte unique peut appartenir à plusieurs workspaces.</text>
    <text x="115" y="1135" class="item-text">• <tspan class="item-bold">Intégrité transactionnelle ACID</tspan>, clés étrangères en cascade contrôlée et index d'optimisation.</text>
    <text x="115" y="1155" class="item-text">• <tspan class="item-bold">Contraintes d'unicité</tspan> sur les slugs d'entreprises, références de tickets et emails.</text>
    
    <!-- Sous-bloc 2 : Redis & BullMQ -->
    <rect x="780" y="1050" width="580" height="125" rx="6" fill="#FFFFFF" stroke="#EF4444" stroke-width="1.6"/>
    <text x="795" y="1073" class="item-bold" fill="#B91C1C" font-size="12.5">Cache &amp; Broker Asynchrone (Redis / BullMQ)</text>
    <text x="795" y="1095" class="item-text">• <tspan class="item-bold">Cache applicatif à dégradation gracieuse</tspan> (l'application continue si Redis est indisponible).</text>
    <text x="795" y="1115" class="item-text">• <tspan class="item-bold">Files de messages BullMQ</tspan> : notification par email, traitement des webhooks SasPay.</text>
    <text x="795" y="1135" class="item-text">• <tspan class="item-bold">Bufferisation des événements Outbox</tspan> pour décharger le serveur API principal.</text>
    <text x="795" y="1155" class="item-text">• <tspan class="item-bold">Gestion des verrous distribués</tspan> et limitation de débit (rate limiting).</text>
    
    <!-- Sous-bloc 3 : MongoDB Atlas (Cible) -->
    <rect x="1390" y="1050" width="610" height="125" rx="6" fill="#FFFFFF" stroke="#6366F1" stroke-width="1.6" stroke-dasharray="5,3"/>
    <text x="1405" y="1073" class="item-bold" fill="#4338CA" font-size="12.5">Stockage Vectoriel RAG (MongoDB Atlas — Architecture Cible)</text>
    <text x="1405" y="1095" class="item-text">• <tspan class="item-bold">Indexation vectorielle dense</tspan> des fragments de connaissances (chunks de 1536 dimensions).</text>
    <text x="1405" y="1115" class="item-text">• <tspan class="item-bold">Partitionnement par tenant</tspan> assurant l'étanchéité absolue des corpus d'entreprises.</text>
    <text x="1405" y="1135" class="item-text">• <tspan class="item-bold">Recherche par similarité cosinus</tspan> haute performance pour l'injection contextuelle.</text>
    <text x="1405" y="1155" class="item-text">• <tspan class="item-bold">Historique conversationnel sémantique</tspan> pour l'apprentissage continu.</text>
</g>

<!-- ========================================================================================= -->
<!-- CONNECTEURS ET FLUX D'INTERACTION -->
<!-- ========================================================================================= -->

<!-- Flux F1 : Client -> Espace Public -->
<path d="M 260 205 L 260 247" class="flow-line" stroke="#059669" marker-end="url(#arrow-green)"/>
<rect x="150" y="215" width="220" height="18" rx="3" fill="#FFFFFF" stroke="#059669" stroke-width="1"/>
<text x="260" y="228" class="flow-label" fill="#065F46" text-anchor="middle">1. Accède au portail SAV public</text>

<!-- Flux F2 : Agent -> Workspace -->
<path d="M 650 205 L 650 226 L 880 226 L 880 247" class="flow-line" stroke="#D97706" marker-end="url(#arrow-amber)"/>
<rect x="700" y="217" width="160" height="18" rx="3" fill="#FFFFFF" stroke="#D97706" stroke-width="1"/>
<text x="780" y="230" class="flow-label" fill="#92400E" text-anchor="middle">2. Pilote son cockpit agent</text>

<!-- Flux F3 : Manager -> Workspace -->
<path d="M 1040 205 L 1040 226 L 1290 226 L 1290 247" class="flow-line" stroke="#7C3AED" marker-end="url(#arrow-purple)"/>
<rect x="1100" y="217" width="160" height="18" rx="3" fill="#FFFFFF" stroke="#7C3AED" stroke-width="1"/>
<text x="1180" y="230" class="flow-label" fill="#6D28D9" text-anchor="middle">3. Supervise les équipes</text>

<!-- Flux F4 : Admin -> Workspace -->
<path d="M 1440 205 L 1440 226 L 1700 226 L 1700 247" class="flow-line" stroke="#2563EB" marker-end="url(#arrow-blue)"/>
<rect x="1500" y="217" width="170" height="18" rx="3" fill="#FFFFFF" stroke="#2563EB" stroke-width="1"/>
<text x="1585" y="230" class="flow-label" fill="#1D4ED8" text-anchor="middle">4. Administre l'entreprise</text>

<!-- Flux F5 : Opérateur Plateforme -> Persistance -->
<path d="M 1840 205 L 1840 220 L 2040 220 L 2040 1020 L 1950 1020 L 1950 1050" class="flow-line" stroke="#475569" stroke-dasharray="5,3" marker-end="url(#arrow-slate)"/>
<rect x="1870" y="222" width="155" height="18" rx="3" fill="#FFFFFF" stroke="#475569" stroke-width="1"/>
<text x="1947" y="235" class="flow-label" fill="#1E293B" text-anchor="middle">10. Exploitation système</text>

<!-- Flux F6 : Espace Public -> Module Conversations -->
<path d="M 400 442 L 400 466 L 750 466 L 750 490" class="flow-line" stroke="#0D9488" marker-end="url(#arrow-teal)"/>
<rect x="470" y="457" width="220" height="18" rx="3" fill="#FFFFFF" stroke="#0D9488" stroke-width="1"/>
<text x="580" y="470" class="flow-label" fill="#0F766E" text-anchor="middle">5. Démarre un tchat direct (Jeton)</text>

<!-- Flux F7 : Module Conversations -> Module Tickets -->
<path d="M 570 600 L 540 600" class="flow-line" stroke="#7C3AED" marker-end="url(#arrow-purple)"/>

<!-- Flux F8 : Workspace -> Module Tickets -->
<path d="M 880 442 L 880 466 L 400 466 L 400 490" class="flow-line" stroke="#7C3AED" marker-end="url(#arrow-purple)"/>

<!-- Flux F9 : Workspace -> Module Équipe -->
<path d="M 1290 442 L 1290 490" class="flow-line" stroke="#D97706" marker-end="url(#arrow-amber)"/>

<!-- Flux F10 : IA -> Conversations -->
<path d="M 1550 580 L 1030 580" class="flow-line" stroke="#4F46E5" stroke-dasharray="5,3" marker-end="url(#arrow-indigo)"/>
<rect x="1190" y="571" width="200" height="18" rx="3" fill="#FFFFFF" stroke="#4F46E5" stroke-width="1"/>
<text x="1290" y="584" class="flow-label" fill="#4338CA" text-anchor="middle">7. Suggestions de réponse RAG</text>

<!-- Flux F11 : IA -> Tickets -->
<path d="M 1785 760 L 1785 770 L 310 770 L 310 760" class="flow-line" stroke="#DC2626" stroke-dasharray="5,3" marker-end="url(#arrow-red)"/>
<rect x="940" y="761" width="220" height="18" rx="3" fill="#FFFFFF" stroke="#DC2626" stroke-width="1"/>
<text x="1050" y="774" class="flow-label" fill="#DC2626" text-anchor="middle">8. Escalade auto (Litige > 50k XAF)</text>

</svg>`;

// Write SVG
const svgPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.svg');
fs.writeFileSync(svgPath, svg, 'utf8');
console.log('SVG written successfully to:', svgPath, 'Size:', fs.statSync(svgPath).size);

// Render PNG using sharp
const pngPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.png');
sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(pngPath)
    .then(info => {
        console.log('PNG rendered successfully to:', pngPath, 'Info:', info);
    })
    .catch(err => {
        console.error('Error rendering PNG:', err);
        process.exit(1);
    });
