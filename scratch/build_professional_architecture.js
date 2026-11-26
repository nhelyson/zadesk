const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve('frontend/node_modules/sharp'));

const W = 1560;
const H = 940;

// ==========================================
// 1. GÉNÉRATION DU SVG ULTRA-ÉPURÉ & PROFESSIONNEL
// ==========================================

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
    <style>
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .layer-box { rx: 8; ry: 8; fill: #FFFFFF; stroke: #E2E8F0; stroke-width: 1.2; }
        .layer-title { font-size: 10.5px; font-weight: 700; fill: #64748B; letter-spacing: 0.8px; text-transform: uppercase; }
        
        .comp-card { rx: 6; ry: 6; fill: #F8FAFC; stroke: #CBD5E1; stroke-width: 1; }
        .comp-card-target { rx: 6; ry: 6; fill: #F8FAFC; stroke: #6366F1; stroke-width: 1.2; stroke-dasharray: 4,3; }
        
        .card-header { font-size: 13px; font-weight: 700; fill: #0F172A; }
        .card-tag { font-size: 9.5px; font-weight: 600; fill: #475569; letter-spacing: 0.4px; }
        .card-desc { font-size: 11px; font-weight: 400; fill: #475569; }
        .card-bullet { font-size: 11px; fill: #334155; }
        .b-strong { font-weight: 600; fill: #0F172A; }
        
        .flow-line { fill: none; stroke: #64748B; stroke-width: 1.4; }
        .flow-line-accent { fill: none; stroke: #2563EB; stroke-width: 1.4; }
        .flow-line-dashed { fill: none; stroke: #6366F1; stroke-width: 1.4; stroke-dasharray: 4,3; }
        
        .flow-pill { rx: 3; ry: 3; fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 1; }
        .flow-text { font-size: 9.5px; font-weight: 600; fill: #334155; text-anchor: middle; }
    </style>
    
    <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 0 1 L 7 4 L 0 7 z" fill="#64748B"/>
    </marker>
    <marker id="arr-blue" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 0 1 L 7 4 L 0 7 z" fill="#2563EB"/>
    </marker>
    <marker id="arr-indigo" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 0 1 L 7 4 L 0 7 z" fill="#6366F1"/>
    </marker>
</defs>

<!-- ARRIÈRE-PLAN NEUTRE DOUX -->
<rect width="${W}" height="${H}" fill="#F1F5F9"/>

<!-- ========================================================================================= -->
<!-- COUCHE 1 : PROFILS UTILISATEURS DU SYSTÈME (y = 25, h = 110) -->
<!-- ========================================================================================= -->
<g id="layer-users">
    <rect x="40" y="25" width="1480" height="110" class="layer-box"/>
    <text x="60" y="47" class="layer-title">NIVEAU 1 • PROFILS UTILISATEURS DU SYSTÈME</text>
    
    <!-- Acteur 1 : Client Public -->
    <rect x="60" y="58" width="342" height="65" class="comp-card" stroke="#10B981"/>
    <text x="76" y="79" class="card-header" fill="#065F46">Client / Consommateur</text>
    <text x="315" y="78" class="card-tag" fill="#059669">EXTERNE</text>
    <text x="76" y="98" class="card-desc">Accès libre sans création de compte sur le web</text>
    <text x="76" y="112" class="card-desc">Dépôt de réclamation &amp; dialogue interactif par tchat</text>
    
    <!-- Acteur 2 : Conseiller SAV -->
    <rect x="426" y="58" width="342" height="65" class="comp-card"/>
    <text x="442" y="79" class="card-header">Conseiller SAV</text>
    <text x="695" y="78" class="card-tag">RÔLE AGENT</text>
    <text x="442" y="98" class="card-desc">Prise en charge des tickets assignés &amp; suivi SLA</text>
    <text x="442" y="112" class="card-desc">Dialogue direct avec le client &amp; notes confidentielles</text>
    
    <!-- Acteur 3 : Superviseur SAV -->
    <rect x="792" y="58" width="342" height="65" class="comp-card"/>
    <text x="808" y="79" class="card-header">Superviseur SAV</text>
    <text x="1050" y="78" class="card-tag">RÔLE MANAGER</text>
    <text x="808" y="98" class="card-desc">Supervision des files d'attente &amp; charges agents</text>
    <text x="808" y="112" class="card-desc">Gestion des compétences métiers &amp; agences physiques</text>
    
    <!-- Acteur 4 : Administrateur Entreprise -->
    <rect x="1158" y="58" width="342" height="65" class="comp-card"/>
    <text x="1174" y="79" class="card-header">Administrateur Entreprise</text>
    <text x="1405" y="78" class="card-tag">ADMIN / OWNER</text>
    <text x="1174" y="98" class="card-desc">Invitations d'équipe &amp; paramétrage du workspace</text>
    <text x="1174" y="112" class="card-desc">Abonnements SasPay &amp; configuration du module IA</text>
</g>

<!-- ========================================================================================= -->
<!-- COUCHE 2 : ESPACES D'ACCÈS & CANAUX D'INTERACTION (y = 160, h = 115) -->
<!-- ========================================================================================= -->
<g id="layer-access">
    <rect x="40" y="160" width="1480" height="115" class="layer-box"/>
    <text x="60" y="182" class="layer-title">NIVEAU 2 • ESPACES D'ACCÈS &amp; CANAUX D'INTERACTION</text>
    
    <!-- Espace 1 : Portail Public Web -->
    <rect x="60" y="193" width="550" height="70" class="comp-card" stroke="#10B981"/>
    <text x="76" y="214" class="card-header" fill="#065F46">Portail Public SAV &amp; Vitrine Commerciale</text>
    <text x="495" y="213" class="card-tag" fill="#059669">WEB LIBRE</text>
    <text x="76" y="234" class="card-desc">• Annuaire des entreprises certifiées (/entreprises) &amp; recherche</text>
    <text x="76" y="250" class="card-desc">• Vitrine agences physiques (/entreprises/[slug]) &amp; widget tchat sécurisé</text>
    
    <!-- Espace 2 : Workspace Multi-Tenant -->
    <rect x="634" y="193" width="866" height="70" class="comp-card"/>
    <text x="650" y="214" class="card-header">Espace Collaboratif Entreprise (Workspace Multi-Tenant)</text>
    <text x="1380" y="213" class="card-tag">ACCÈS AUTHENTIFIÉ</text>
    <text x="650" y="234" class="card-desc">• Cockpit Conseiller : traitement de la file de tickets, messagerie directe, jauge de présence</text>
    <text x="650" y="250" class="card-desc">• Console Supervision &amp; Administration : charges de l'équipe, compétences, SasPay &amp; IA</text>
</g>

<!-- ========================================================================================= -->
<!-- COUCHE 3 : CŒUR DES MODULES FONCTIONNELS MÉTIER (y = 300, h = 330) -->
<!-- ========================================================================================= -->
<g id="layer-modules">
    <rect x="40" y="300" width="1480" height="330" class="layer-box"/>
    <text x="60" y="322" class="layer-title">NIVEAU 3 • CŒUR DES MODULES FONCTIONNELS MÉTIER</text>
    
    <!-- Rangée 1 : Modules Métier Primaires (y = 334, h = 130) -->
    
    <!-- Mod 1 : Tickets SAV -->
    <rect x="60" y="334" width="464" height="130" class="comp-card"/>
    <text x="76" y="356" class="card-header">1. Demandes &amp; Tickets SAV</text>
    <text x="425" y="355" class="card-tag">OPÉRATIONNEL</text>
    <text x="76" y="378" class="card-bullet"><tspan class="b-strong">Dossier technique formel</tspan> : Référence unique (TICK-ABC123)</text>
    <text x="76" y="396" class="card-bullet"><tspan class="b-strong">Cycle de vie SAV</tspan> : PENDING → OPEN → IN_PROGRESS → RESOLVED</text>
    <text x="76" y="414" class="card-bullet"><tspan class="b-strong">Priorités &amp; SLA</tspan> : Délais butoirs et alertes de dépassement</text>
    <text x="76" y="432" class="card-bullet"><tspan class="b-strong">Traçabilité &amp; Collaboration</tspan> : Journal d'activités &amp; partage d'agences</text>
    <text x="76" y="450" class="card-bullet"><tspan class="b-strong">Pièces jointes</tspan> : Justificatifs d'achat, photos et diagnostics</text>
    
    <!-- Mod 2 : Conversations Directes -->
    <rect x="548" y="334" width="464" height="130" class="comp-card"/>
    <text x="564" y="356" class="card-header">2. Conversations &amp; Dialogue Direct</text>
    <text x="915" y="355" class="card-tag">OPÉRATIONNEL</text>
    <text x="564" y="378" class="card-bullet"><tspan class="b-strong">Messagerie temps réel</tspan> : Dialogue instantané client ↔ conseiller</text>
    <text x="564" y="396" class="card-bullet"><tspan class="b-strong">Session autonome</tspan> : Jeton sécurisé sans création de compte</text>
    <text x="564" y="414" class="card-bullet"><tspan class="b-strong">Notes internes secrètes</tspan> : Collaboration d'équipe invisible au client</text>
    <text x="564" y="432" class="card-bullet"><tspan class="b-strong">Élévation en Ticket SAV</tspan> : Conversion directe avec tout l'historique</text>
    <text x="564" y="450" class="card-bullet"><tspan class="b-strong">Statuts de fil</tspan> : Active, Suspendue, Clôturée</text>
    
    <!-- Mod 3 : Équipes & Compétences -->
    <rect x="1036" y="334" width="464" height="130" class="comp-card"/>
    <text x="1052" y="356" class="card-header">3. Équipe, Compétences &amp; Agences</text>
    <text x="1405" y="355" class="card-tag">OPÉRATIONNEL</text>
    <text x="1052" y="378" class="card-bullet"><tspan class="b-strong">Profils agents &amp; jauges</tspan> : Plafond capacitaire (maxCapacity)</text>
    <text x="1052" y="396" class="card-bullet"><tspan class="b-strong">Statuts de présence</tspan> : AVAILABLE, BUSY, AWAY, OFFLINE</text>
    <text x="1052" y="414" class="card-bullet"><tspan class="b-strong">Matrice de compétences</tspan> : Qualification technique (Skills)</text>
    <text x="1052" y="432" class="card-bullet"><tspan class="b-strong">Moteur d'attribution</tspan> : Affectation déterministe intelligente</text>
    <text x="1052" y="450" class="card-bullet"><tspan class="b-strong">Établissements physiques</tspan> : Réseau des succursales et ateliers</text>
    
    <!-- Rangée 2 : Modules de Soutien & Intelligence (y = 482, h = 130) -->
    
    <!-- Mod 4 : Sécurité & Audit -->
    <rect x="60" y="482" width="464" height="130" class="comp-card"/>
    <text x="76" y="504" class="card-header">4. Sécurité, RBAC &amp; Événements</text>
    <text x="425" y="503" class="card-tag">OPÉRATIONNEL</text>
    <text x="76" y="526" class="card-bullet"><tspan class="b-strong">Sessions cryptographiques</tspan> : Cookies HttpOnly sécurisés &amp; OTP</text>
    <text x="76" y="544" class="card-bullet"><tspan class="b-strong">Contrôle d'accès strict</tspan> : Middleware requireWorkspaceRole</text>
    <text x="76" y="562" class="card-bullet"><tspan class="b-strong">Transactional Outbox Pattern</tspan> : Fiabilité des transactions SQL</text>
    <text x="76" y="580" class="card-bullet"><tspan class="b-strong">Diffusion temps réel SSE</tspan> : Actualisation des cockpits (Pulse)</text>
    <text x="76" y="598" class="card-bullet"><tspan class="b-strong">Journal d'audit légal</tspan> : Traçabilité chronologique inaltérable</text>
    
    <!-- Mod 5 : Facturation & SasPay -->
    <rect x="548" y="482" width="464" height="130" class="comp-card"/>
    <text x="564" y="504" class="card-header">5. Facturation, Quotas &amp; SasPay</text>
    <text x="915" y="503" class="card-tag">OPÉRATIONNEL</text>
    <text x="564" y="526" class="card-bullet"><tspan class="b-strong">Formules SaaS</tspan> : Grille tarifaire (Starter, Pro, Enterprise)</text>
    <text x="564" y="544" class="card-bullet"><tspan class="b-strong">Contrôle des quotas</tspan> : Plafonds d'agents, de tickets et d'agences</text>
    <text x="564" y="562" class="card-bullet"><tspan class="b-strong">Passerelle SasPay (CEMAC)</tspan> : Airtel Money, MTN MoMo &amp; Cartes</text>
    <text x="564" y="580" class="card-bullet"><tspan class="b-strong">Traitement asynchrone</tspan> : Webhooks sécurisés &amp; validation directe</text>
    <text x="564" y="598" class="card-bullet"><tspan class="b-strong">Factures &amp; historiques</tspan> : Génération de pièces comptables</text>
    
    <!-- Mod 6 : IA & RAG Cible -->
    <rect x="1036" y="482" width="464" height="130" class="comp-card-target"/>
    <text x="1052" y="504" class="card-header" fill="#4338CA">6. Assistance IA &amp; RAG (Supervisée)</text>
    <text x="1360" y="503" class="card-tag" fill="#4338CA">ARCHITECTURE CIBLE</text>
    <text x="1052" y="526" class="card-bullet"><tspan class="b-strong">Base de connaissances vectorielle</tspan> : Ingestion manuels &amp; FAQ</text>
    <text x="1052" y="544" class="card-bullet"><tspan class="b-strong">Moteur RAG &amp; Llama 3.3</tspan> : Réponses contextualisées et sourcées</text>
    <text x="1052" y="562" class="card-bullet"><tspan class="b-strong">Modes d'autonomie</tspan> : Brouillon proposé à l'agent ou semi-auto</text>
    <text x="1052" y="580" class="card-bullet" fill="#DC2626"><tspan class="b-strong" fill="#DC2626">Escalade humaine obligatoire</tspan> : Frustration ou litige &gt; 50 000 XAF</text>
    <text x="1052" y="598" class="card-bullet"><tspan class="b-strong">Supervision continue</tspan> : Score de confiance et validation humaine</text>
</g>

<!-- ========================================================================================= -->
<!-- COUCHE 4 : PERSISTANCE MULTI-TENANT & INFRASTRUCTURE (y = 655, h = 145) -->
<!-- ========================================================================================= -->
<g id="layer-data">
    <rect x="40" y="655" width="1480" height="145" class="layer-box"/>
    <text x="60" y="677" class="layer-title">NIVEAU 4 • GOUVERNANCE MULTI-TENANT &amp; PERSISTANCE POLYGLOTTE DE DONNÉES</text>
    
    <!-- Pilier 1 : PostgreSQL -->
    <rect x="60" y="690" width="464" height="95" class="comp-card"/>
    <text x="76" y="711" class="card-header">PostgreSQL &amp; Prisma ORM</text>
    <text x="405" y="710" class="card-tag">RELATIONNEL</text>
    <text x="76" y="731" class="card-bullet"><tspan class="b-strong">Cloisonnement strict par workspaceId</tspan> sur toutes les tables métiers</text>
    <text x="76" y="749" class="card-bullet"><tspan class="b-strong">Modèle utilisateur universel</tspan> : un compte unique multi-organisations</text>
    <text x="76" y="767" class="card-bullet"><tspan class="b-strong">Intégrité ACID</tspan>, contraintes d'unicité (slug, email) et transactions sécurisées</text>
    
    <!-- Pilier 2 : Redis & BullMQ -->
    <rect x="548" y="690" width="464" height="95" class="comp-card"/>
    <text x="564" y="711" class="card-header">Redis &amp; BullMQ Engine</text>
    <text x="895" y="710" class="card-tag">BROKER &amp; CACHE</text>
    <text x="564" y="731" class="card-bullet"><tspan class="b-strong">Cache applicatif mémoire</tspan> à dégradation gracieuse en cas d'arrêt</text>
    <text x="564" y="749" class="card-bullet"><tspan class="b-strong">Files asynchrones BullMQ</tspan> : notifications, emails, webhooks SasPay</text>
    <text x="564" y="767" class="card-bullet"><tspan class="b-strong">Découplage API</tspan> et gestion distribuée des verrous d'attribution</text>
    
    <!-- Pilier 3 : MongoDB Atlas -->
    <rect x="1036" y="690" width="464" height="95" class="comp-card-target"/>
    <text x="1052" y="711" class="card-header" fill="#4338CA">MongoDB Atlas (Vector Store)</text>
    <text x="1395" y="710" class="card-tag" fill="#4338CA">CIBLE RAG</text>
    <text x="1052" y="731" class="card-bullet"><tspan class="b-strong">Indexation vectorielle dense</tspan> des chunks documentaires (1536 dim.)</text>
    <text x="1052" y="749" class="card-bullet"><tspan class="b-strong">Partitionnement par tenant</tspan> préservant l'étanchéité des connaissances</text>
    <text x="1052" y="767" class="card-bullet"><tspan class="b-strong">Recherche de similarité cosinus</tspan> pour injection contextuelle aux prompts</text>
</g>

<!-- ========================================================================================= -->
<!-- CONNECTEURS ARCHITECTURAUX ÉPURÉS -->
<!-- ========================================================================================= -->

<!-- 1. Client -> Portail Public -->
<path d="M 231 123 L 231 193" class="flow-line-accent" stroke="#10B981" marker-end="url(#arr)"/>

<!-- 2. Conseiller / Superviseur / Admin -> Workspace -->
<path d="M 597 123 L 597 145 L 800 145 L 800 193" class="flow-line" marker-end="url(#arr)"/>
<path d="M 963 123 L 963 145 L 1067 145 L 1067 193" class="flow-line" marker-end="url(#arr)"/>
<path d="M 1329 123 L 1329 145 L 1300 145 L 1300 193" class="flow-line" marker-end="url(#arr)"/>

<!-- 3. Portail Public -> Module Conversations -->
<path d="M 335 263 L 335 285 L 780 285 L 780 334" class="flow-line-accent" stroke="#10B981" marker-end="url(#arr)"/>
<rect x="500" y="275" width="120" height="18" class="flow-pill"/>
<text x="560" y="287" class="flow-text">Session Tchat direct</text>

<!-- 4. Workspace -> Module Tickets & Équipe -->
<path d="M 850 263 L 850 285 L 292 285 L 292 334" class="flow-line" marker-end="url(#arr)"/>
<path d="M 1268 263 L 1268 334" class="flow-line" marker-end="url(#arr)"/>

<!-- 5. Conversations -> Tickets SAV (Élévation horizontale directe) -->
<path d="M 548 399 L 524 399" class="flow-line" marker-end="url(#arr)"/>
<rect x="522" y="380" width="28" height="16" class="flow-pill"/>
<text x="536" y="391" class="flow-text" font-size="8.5">SAV</text>

<!-- 6. Module IA -> Module Conversations (Suggestions RAG) -->
<path d="M 1036 547 L 1012 547 L 1012 399" class="flow-line-dashed" marker-end="url(#arr-indigo)"/>

<!-- 7. Connexion Modules -> Socle de Persistance -->
<path d="M 292 612 L 292 690" class="flow-line" marker-end="url(#arr)"/>
<path d="M 780 612 L 780 690" class="flow-line" marker-end="url(#arr)"/>
<path d="M 1268 612 L 1268 690" class="flow-line-dashed" marker-end="url(#arr-indigo)"/>

</svg>`;

// ==========================================
// 2. GÉNÉRATION DU DRAW.IO XML PUR
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

function buildDrawioXml() {
    let cells = [];
    cells.push('<mxCell id="0" />');
    cells.push('<mxCell id="1" parent="0" />');

    // Layers (Containers de niveaux)
    const layers = [
        { id: 'lay_users', x: 40, y: 25, w: 1480, h: 110, title: 'NIVEAU 1 • PROFILS UTILISATEURS DU SYSTÈME' },
        { id: 'lay_access', x: 40, y: 160, w: 1480, h: 115, title: 'NIVEAU 2 • ESPACES D\'ACCÈS &amp; CANAUX D\'INTERACTION' },
        { id: 'lay_modules', x: 40, y: 300, w: 1480, h: 330, title: 'NIVEAU 3 • CŒUR DES MODULES FONCTIONNELS MÉTIER' },
        { id: 'lay_data', x: 40, y: 655, w: 1480, h: 145, title: 'NIVEAU 4 • GOUVERNANCE MULTI-TENANT &amp; PERSISTANCE DE DONNÉES' }
    ];

    layers.forEach(l => {
        cells.push(`<mxCell id="${l.id}" parent="1" value="${l.title}" style="swimlane;fontStyle=1;align=left;spacingLeft=15;startSize=26;rounded=1;arcSize=4;fillColor=#FFFFFF;strokeColor=#E2E8F0;strokeWidth=1.2;fontSize=10;fontColor=#64748B;fontFamily=Helvetica;" vertex="1">`);
        cells.push(`  <mxGeometry x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // Acteurs (Enfants du layer lay_users)
    const actors = [
        { id: 'act_client', x: 20, y: 35, w: 342, h: 65, stroke: '#10B981', title: 'Client / Consommateur', tag: 'EXTERNE', l1: 'Accès libre sans création de compte sur le web', l2: 'Dépôt de réclamation &amp; dialogue interactif par tchat' },
        { id: 'act_agent', x: 386, y: 35, w: 342, h: 65, stroke: '#CBD5E1', title: 'Conseiller SAV', tag: 'RÔLE AGENT', l1: 'Prise en charge des tickets assignés &amp; suivi SLA', l2: 'Dialogue direct avec le client &amp; notes confidentielles' },
        { id: 'act_manager', x: 752, y: 35, w: 342, h: 65, stroke: '#CBD5E1', title: 'Superviseur SAV', tag: 'RÔLE MANAGER', l1: 'Supervision des files d\'attente &amp; charges agents', l2: 'Gestion des compétences métiers &amp; agences physiques' },
        { id: 'act_admin', x: 1118, y: 35, w: 342, h: 65, stroke: '#CBD5E1', title: 'Administrateur Entreprise', tag: 'ADMIN / OWNER', l1: 'Invitations d\'équipe &amp; paramétrage du workspace', l2: 'Abonnements SasPay &amp; configuration du module IA' }
    ];

    actors.forEach(a => {
        const val = `<div style="padding:4px 8px;font-family:Helvetica,sans-serif;">` +
            `<div style="display:flex;justify-content:space-between;align-items:center;">` +
            `<b style="font-size:13px;color:#0F172A;">${a.title}</b>` +
            `<span style="font-size:9.5px;font-weight:600;color:#64748B;">${a.tag}</span>` +
            `</div>` +
            `<div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.35;">` +
            `${a.l1}<br/>${a.l2}` +
            `</div>` +
            `</div>`;
        cells.push(`<mxCell id="${a.id}" parent="lay_users" value="${escapeXml(val)}" style="rounded=1;arcSize=6;fillColor=#F8FAFC;strokeColor=${a.stroke};strokeWidth=1;align=left;verticalAlign=top;html=1;overflow=fill;" vertex="1">`);
        cells.push(`  <mxGeometry x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // Espaces (Enfants du layer lay_access)
    const spaces = [
        {
            id: 'sp_pub', x: 20, y: 33, w: 550, h: 70, stroke: '#10B981', title: 'Portail Public SAV &amp; Vitrine Commerciale', tag: 'WEB LIBRE',
            l1: '• Annuaire des entreprises certifiées (/entreprises) &amp; recherche',
            l2: '• Vitrine agences physiques (/entreprises/[slug]) &amp; widget tchat sécurisé'
        },
        {
            id: 'sp_ws', x: 594, y: 33, w: 866, h: 70, stroke: '#CBD5E1', title: 'Espace Collaboratif Entreprise (Workspace Multi-Tenant)', tag: 'ACCÈS AUTHENTIFIÉ',
            l1: '• Cockpit Conseiller : traitement de la file de tickets, messagerie directe, jauge de présence',
            l2: '• Console Supervision &amp; Administration : charges de l\'équipe, compétences, SasPay &amp; IA'
        }
    ];

    spaces.forEach(s => {
        const val = `<div style="padding:4px 8px;font-family:Helvetica,sans-serif;">` +
            `<div style="display:flex;justify-content:space-between;align-items:center;">` +
            `<b style="font-size:13px;color:#0F172A;">${s.title}</b>` +
            `<span style="font-size:9.5px;font-weight:600;color:#64748B;">${s.tag}</span>` +
            `</div>` +
            `<div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.4;">` +
            `${s.l1}<br/>${s.l2}` +
            `</div>` +
            `</div>`;
        cells.push(`<mxCell id="${s.id}" parent="lay_access" value="${escapeXml(val)}" style="rounded=1;arcSize=6;fillColor=#F8FAFC;strokeColor=${s.stroke};strokeWidth=1;align=left;verticalAlign=top;html=1;overflow=fill;" vertex="1">`);
        cells.push(`  <mxGeometry x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // Modules (Enfants du layer lay_modules)
    const modules = [
        {
            id: 'm_tickets', x: 20, y: 34, w: 464, h: 130, title: '1. Demandes &amp; Tickets SAV', tag: 'OPÉRATIONNEL',
            bullets: [
                '<b>Dossier technique formel</b> : Référence unique (TICK-ABC123)',
                '<b>Cycle de vie SAV</b> : PENDING → OPEN → IN_PROGRESS → RESOLVED',
                '<b>Priorités &amp; SLA</b> : Délais butoirs et alertes de dépassement',
                '<b>Traçabilité &amp; Collaboration</b> : Journal d\'activités &amp; partage d\'agences',
                '<b>Pièces jointes</b> : Justificatifs d\'achat, photos et diagnostics'
            ]
        },
        {
            id: 'm_conv', x: 508, y: 34, w: 464, h: 130, title: '2. Conversations &amp; Dialogue Direct', tag: 'OPÉRATIONNEL',
            bullets: [
                '<b>Messagerie temps réel</b> : Dialogue instantané client ↔ conseiller',
                '<b>Session autonome</b> : Jeton sécurisé sans création de compte',
                '<b>Notes internes secrètes</b> : Collaboration d\'équipe invisible au client',
                '<b>Élévation en Ticket SAV</b> : Conversion directe avec tout l\'historique',
                '<b>Statuts de fil</b> : Active, Suspendue, Clôturée'
            ]
        },
        {
            id: 'm_team', x: 996, y: 34, w: 464, h: 130, title: '3. Équipe, Compétences &amp; Agences', tag: 'OPÉRATIONNEL',
            bullets: [
                '<b>Profils agents &amp; jauges</b> : Plafond capacitaire (maxCapacity)',
                '<b>Statuts de présence</b> : AVAILABLE, BUSY, AWAY, OFFLINE',
                '<b>Matrice de compétences</b> : Qualification technique (Skills)',
                '<b>Moteur d\'attribution</b> : Affectation déterministe intelligente',
                '<b>Établissements physiques</b> : Réseau des succursales et ateliers'
            ]
        },
        {
            id: 'm_sec', x: 20, y: 182, w: 464, h: 130, title: '4. Sécurité, RBAC &amp; Événements', tag: 'OPÉRATIONNEL',
            bullets: [
                '<b>Sessions cryptographiques</b> : Cookies HttpOnly sécurisés &amp; OTP',
                '<b>Contrôle d\'accès strict</b> : Middleware requireWorkspaceRole',
                '<b>Transactional Outbox Pattern</b> : Fiabilité des transactions SQL',
                '<b>Diffusion temps réel SSE</b> : Actualisation des cockpits (Pulse)',
                '<b>Journal d\'audit légal</b> : Traçabilité chronologique inaltérable'
            ]
        },
        {
            id: 'm_comm', x: 508, y: 182, w: 464, h: 130, title: '5. Facturation, Quotas &amp; SasPay', tag: 'OPÉRATIONNEL',
            bullets: [
                '<b>Formules SaaS</b> : Grille tarifaire (Starter, Pro, Enterprise)',
                '<b>Contrôle des quotas</b> : Plafonds d\'agents, de tickets et d\'agences',
                '<b>Passerelle SasPay (CEMAC)</b> : Airtel Money, MTN MoMo &amp; Cartes',
                '<b>Traitement asynchrone</b> : Webhooks sécurisés &amp; validation directe',
                '<b>Factures &amp; historiques</b> : Génération de pièces comptables'
            ]
        },
        {
            id: 'm_ai', x: 996, y: 182, w: 464, h: 130, title: '6. Assistance IA &amp; RAG (Supervisée)', tag: 'ARCHITECTURE CIBLE', dashed: true,
            bullets: [
                '<b>Base de connaissances vectorielle</b> : Ingestion manuels &amp; FAQ',
                '<b>Moteur RAG &amp; Llama 3.3</b> : Réponses contextualisées et sourcées',
                '<b>Modes d\'autonomie</b> : Brouillon proposé à l\'agent ou semi-auto',
                '<span style="color:#DC2626;"><b>Escalade humaine obligatoire</b> : Frustration ou litige &gt; 50 000 XAF</span>',
                '<b>Supervision continue</b> : Score de confiance et validation humaine'
            ]
        }
    ];

    modules.forEach(m => {
        const val = `<div style="padding:4px 8px;font-family:Helvetica,sans-serif;">` +
            `<div style="display:flex;justify-content:space-between;align-items:center;">` +
            `<b style="font-size:13px;color:#0F172A;">${m.title}</b>` +
            `<span style="font-size:9px;font-weight:600;color:${m.dashed ? '#4338CA' : '#64748B'};">${m.tag}</span>` +
            `</div>` +
            `<div style="font-size:11px;color:#334155;margin-top:6px;line-height:1.45;">` +
            m.bullets.map(b => '• ' + b).join('<br/>') +
            `</div>` +
            `</div>`;
        const dashStyle = m.dashed ? ';dashed=1;dashPattern=4 3;strokeColor=#6366F1;' : ';strokeColor=#CBD5E1;';
        cells.push(`<mxCell id="${m.id}" parent="lay_modules" value="${escapeXml(val)}" style="rounded=1;arcSize=6;fillColor=#F8FAFC${dashStyle}strokeWidth=1;align=left;verticalAlign=top;html=1;overflow=fill;" vertex="1">`);
        cells.push(`  <mxGeometry x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // Piliers de données (Enfants du layer lay_data)
    const pillars = [
        {
            id: 'd_pg', x: 20, y: 35, w: 464, h: 95, title: 'PostgreSQL &amp; Prisma ORM', tag: 'RELATIONNEL',
            bullets: [
                '<b>Cloisonnement strict par workspaceId</b> sur toutes les tables métiers',
                '<b>Modèle utilisateur universel</b> : un compte unique multi-organisations',
                '<b>Intégrité ACID</b>, contraintes d\'unicité et transactions sécurisées'
            ]
        },
        {
            id: 'd_redis', x: 508, y: 35, w: 464, h: 95, title: 'Redis &amp; BullMQ Engine', tag: 'BROKER &amp; CACHE',
            bullets: [
                '<b>Cache applicatif mémoire</b> à dégradation gracieuse en cas d\'arrêt',
                '<b>Files asynchrones BullMQ</b> : notifications, emails, webhooks SasPay',
                '<b>Découplage API</b> et gestion distribuée des verrous d\'attribution'
            ]
        },
        {
            id: 'd_mongo', x: 996, y: 35, w: 464, h: 95, title: 'MongoDB Atlas (Vector Store)', tag: 'CIBLE RAG', dashed: true,
            bullets: [
                '<b>Indexation vectorielle dense</b> des chunks documentaires (1536 dim.)',
                '<b>Partitionnement par tenant</b> préservant l\'étanchéité des connaissances',
                '<b>Recherche de similarité cosinus</b> pour injection contextuelle aux prompts'
            ]
        }
    ];

    pillars.forEach(p => {
        const val = `<div style="padding:4px 8px;font-family:Helvetica,sans-serif;">` +
            `<div style="display:flex;justify-content:space-between;align-items:center;">` +
            `<b style="font-size:13px;color:#0F172A;">${p.title}</b>` +
            `<span style="font-size:9px;font-weight:600;color:${p.dashed ? '#4338CA' : '#64748B'};">${p.tag}</span>` +
            `</div>` +
            `<div style="font-size:11px;color:#334155;margin-top:4px;line-height:1.4;">` +
            p.bullets.map(b => '• ' + b).join('<br/>') +
            `</div>` +
            `</div>`;
        const dashStyle = p.dashed ? ';dashed=1;dashPattern=4 3;strokeColor=#6366F1;' : ';strokeColor=#CBD5E1;';
        cells.push(`<mxCell id="${p.id}" parent="lay_data" value="${escapeXml(val)}" style="rounded=1;arcSize=6;fillColor=#F8FAFC${dashStyle}strokeWidth=1;align=left;verticalAlign=top;html=1;overflow=fill;" vertex="1">`);
        cells.push(`  <mxGeometry x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // Connecteurs principaux propres
    cells.push(`<mxCell id="ed_client" parent="1" edge="1" source="act_client" target="sp_pub" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#10B981;strokeWidth=1.4;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_agents" parent="1" edge="1" source="act_agent" target="sp_ws" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64748B;strokeWidth=1.4;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_tchat" parent="1" value="Session tchat web" edge="1" source="sp_pub" target="m_conv" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#10B981;strokeWidth=1.4;endArrow=block;endFill=1;fontSize=9.5;fontColor:#065F46;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_ws_tickets" parent="1" value="Prise en charge" edge="1" source="sp_ws" target="m_tickets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64748B;strokeWidth=1.4;endArrow=block;endFill=1;fontSize=9.5;fontColor:#334155;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_elevation" parent="1" value="Élévation SAV" edge="1" source="m_conv" target="m_tickets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64748B;strokeWidth=1.4;endArrow=block;endFill=1;fontSize=9;fontColor:#334155;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_ai_rag" parent="1" value="Assistance RAG" edge="1" source="m_ai" target="m_conv" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#6366F1;strokeWidth=1.4;dashed=1;dashPattern=4 3;endArrow=block;endFill=1;fontSize=9;fontColor:#4338CA;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_data_pg" parent="1" edge="1" source="m_sec" target="d_pg" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64748B;strokeWidth=1.4;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_data_redis" parent="1" edge="1" source="m_comm" target="d_redis" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#64748B;strokeWidth=1.4;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="ed_data_ai" parent="1" edge="1" source="m_ai" target="d_mongo" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#6366F1;strokeWidth=1.4;dashed=1;dashPattern=4 3;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    const xml = `<mxfile host="app.diagrams.net" modified="2026-11-21T10:45:00.000Z" agent="Antigravity / Lead Software Architect" version="24.7.0">
  <diagram id="zadesk-functional-arch" name="Architecture Fonctionnelle Zadesk">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1560" pageHeight="940" math="0" shadow="0">
      <root>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
}

// 1. Écriture du SVG
const svgPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.svg');
fs.writeFileSync(svgPath, svg, 'utf8');
console.log('SVG written:', svgPath, 'Size:', fs.statSync(svgPath).size);

// 2. Écriture du Draw.io
const drawioXml = buildDrawioXml();
const drawioPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.drawio');
fs.writeFileSync(drawioPath, drawioXml, 'utf8');
console.log('Drawio written:', drawioPath, 'Size:', fs.statSync(drawioPath).size);

// 3. Rendu PNG haute résolution via sharp
const pngPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle.png');
sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(pngPath)
    .then(info => {
        console.log('PNG rendered:', pngPath, info);
    })
    .catch(err => {
        console.error('Error rendering PNG:', err);
    });
