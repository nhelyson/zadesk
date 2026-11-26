const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve('frontend/node_modules/sharp'));

// ==============================================================================
// DIMENSIONS CALIBRÉES POUR PAGE A4 PORTRAIT WORD (Ratio 1 : 1.42, largeur 800px)
// ==============================================================================
const W = 800;
const H = 1140;

// ==============================================================================
// 1. GÉNÉRATION DU SVG ULTRA-LISIBLE AU FORMAT PORTRAIT
// ==============================================================================

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
    <style><![CDATA[
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        
        /* Titres de zones éditoriales */
        .zone-header { font-size: 11px; font-weight: 800; fill: #4F5D75; letter-spacing: 1px; text-transform: uppercase; font-family: "Georgia", serif; }
        
        /* Cartes éditoriales */
        .card-editorial { rx: 6; ry: 6; fill: #FFFFFF; stroke: #2D3142; stroke-width: 1.0; filter: drop-shadow(0 2px 5px rgba(45, 49, 66, 0.05)); }
        .card-actor { rx: 6; ry: 6; fill: #FFFFFF; stroke: #4F5D75; stroke-width: 1.0; filter: drop-shadow(0 2px 4px rgba(45, 49, 66, 0.04)); }
        .card-target { rx: 6; ry: 6; fill: #FFFAF8; stroke: #EB6C36; stroke-width: 1.2; stroke-dasharray: 6,4; filter: drop-shadow(0 2px 6px rgba(235, 108, 54, 0.06)); }
        
        /* Badges de statuts unifiés */
        .badge-editorial { rx: 3; ry: 3; fill: #F1F5F9; stroke: #CBD5E1; stroke-width: 0.8; }
        .badge-accent { rx: 3; ry: 3; fill: #FDF0EB; stroke: #EB6C36; stroke-width: 0.8; }
        .badge-text { font-size: 8.5px; font-weight: 700; letter-spacing: 0.6px; text-anchor: middle; fill: #2D3142; }
        .badge-text-accent { font-size: 8.5px; font-weight: 700; letter-spacing: 0.6px; text-anchor: middle; fill: #EB6C36; }
        
        /* Typographie de carte */
        .card-title { font-size: 13.5px; font-weight: 700; fill: #2D3142; }
        .card-title-serif { font-size: 14px; font-weight: 700; fill: #2D3142; font-family: "Georgia", serif; }
        .card-desc { font-size: 10.5px; font-weight: 400; fill: #64748B; font-style: italic; }
        .bullet-item { font-size: 11px; fill: #334155; }
        .bullet-sub { font-size: 10px; fill: #9A3412; }
        
        /* Verbes d'action mis en avant (Encre noire / ardoise uniforme) */
        .verb { font-weight: 800; fill: #2D3142; }
        .verb-accent { font-weight: 800; fill: #EB6C36; }
        
        /* Connecteurs et flux */
        .conn-line { fill: none; stroke: #4F5D75; stroke-width: 1.2; }
        .conn-line-accent { fill: none; stroke: #EB6C36; stroke-width: 1.3; stroke-dasharray: 5,4; }
        
        /* Pastilles d'étiquettes avec masquage opaque */
        .pill-bg { rx: 4; ry: 4; fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 0.9; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.06)); }
        .pill-bg-accent { rx: 4; ry: 4; fill: #FFFFFF; stroke: #EB6C36; stroke-width: 0.9; filter: drop-shadow(0 1px 3px rgba(235,108,54,0.1)); }
        .pill-text { font-size: 9.5px; font-weight: 700; fill: #2D3142; text-anchor: middle; }
        .pill-text-accent { font-size: 9.5px; font-weight: 700; fill: #EB6C36; text-anchor: middle; }
    ]]></style>
    
    <marker id="arr-slate" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#4F5D75"/>
    </marker>
    <marker id="arr-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#EB6C36"/>
    </marker>
</defs>

<!-- FOND PAPIER CHAUD (60% Neutral Ground) -->
<rect width="${W}" height="${H}" fill="#F8F9FA"/>

<!-- ========================================================================================= -->
<!-- ZONE A : ACTEURS DU SYSTÈME (y = 15 à 165) -->
<!-- ========================================================================================= -->
<text x="35" y="28" class="zone-header">ZONE A — ACTEURS DU SYSTÈME</text>

<!-- 1. Client / Consommateur -->
<g id="act_client">
    <rect x="35" y="38" width="350" height="120" class="card-actor"/>
    <line x1="35" y1="38" x2="385" y2="38" stroke="#2D3142" stroke-width="2.5"/>
    <rect x="49" y="48" width="95" height="16" class="badge-editorial"/>
    <text x="96" y="60" class="badge-text">ACTEUR EXTERNE</text>
    <text x="49" y="80" class="card-title">Client / Consommateur</text>
    <text x="49" y="100" class="bullet-item">• <tspan class="verb">Accéder</tspan> librement sur le web sans compte</text>
    <text x="49" y="118" class="bullet-item">• <tspan class="verb">Déposer</tspan> des réclamations &amp; <tspan class="verb">Suivre</tspan> le dossier</text>
    <text x="49" y="136" class="bullet-item">• <tspan class="verb">Échanger</tspan> en direct par tchat avec le SAV</text>
</g>

<!-- 2. Acteurs Internes (Workspace Multi-Tenant) -->
<g id="act_internal">
    <rect x="415" y="38" width="350" height="120" class="card-actor"/>
    <line x1="415" y1="38" x2="765" y2="38" stroke="#2D3142" stroke-width="2.5"/>
    <rect x="429" y="48" width="180" height="16" class="badge-editorial"/>
    <text x="519" y="60" class="badge-text">WORKSPACE MULTI-TENANT</text>
    <text x="429" y="80" class="card-title">Collaborateurs de l'Entreprise</text>
    <text x="429" y="100" class="bullet-item">• <tspan class="verb">Conseiller (Agent)</tspan> : Traiter tickets &amp; SLA</text>
    <text x="429" y="118" class="bullet-item">• <tspan class="verb">Superviseur (Manager)</tspan> : Piloter files &amp; agences</text>
    <text x="429" y="136" class="bullet-item">• <tspan class="verb">Administrateur (Owner/Admin)</tspan> : Équipe &amp; SasPay</text>
</g>

<!-- ========================================================================================= -->
<!-- ZONE B : ESPACES D'ACCÈS & CANAUX (y = 180 à 330) -->
<!-- ========================================================================================= -->
<text x="35" y="188" class="zone-header">ZONE B — ESPACES D'ACCÈS &amp; CANAUX D'INTERACTION</text>

<!-- Espace 1 : Portail Public SAV -->
<g id="space_public">
    <rect x="35" y="200" width="350" height="122" class="card-editorial"/>
    <rect x="49" y="210" width="125" height="16" class="badge-editorial"/>
    <text x="111" y="222" class="badge-text">ENVIRONNEMENT PUBLIC</text>
    <text x="49" y="242" class="card-title-serif">Portail Public &amp; Vitrine SAV</text>
    <text x="49" y="262" class="bullet-item">• <tspan class="verb">Rechercher</tspan> les commerces certifiés (<tspan class="card-desc">/entreprises</tspan>)</text>
    <text x="49" y="280" class="bullet-item">• <tspan class="verb">Consulter</tspan> vitrine, adresses &amp; horaires SAV</text>
    <text x="49" y="298" class="bullet-item">• <tspan class="verb">Démarrer</tspan> un tchat immédiat sécurisé par jeton</text>
</g>

<!-- Espace 2 : Workspace Collaboratif -->
<g id="space_workspace">
    <rect x="415" y="200" width="350" height="122" class="card-editorial"/>
    <rect x="429" y="210" width="175" height="16" class="badge-editorial"/>
    <text x="516" y="222" class="badge-text">ESPACE SÉCURISÉ MULTI-TENANT</text>
    <text x="429" y="242" class="card-title-serif">Workspace Collaboratif Entreprise</text>
    <text x="429" y="262" class="bullet-item">• <tspan class="verb">Cockpit Conseiller</tspan> : Traitement tickets &amp; SLA</text>
    <text x="429" y="280" class="bullet-item">• <tspan class="verb">Console Supervision</tspan> : Files, compétences &amp; agences</text>
    <text x="429" y="298" class="bullet-item">• <tspan class="verb">Administration</tspan> : Équipe, abonnements &amp; IA</text>
</g>

<!-- ========================================================================================= -->
<!-- ZONE C : MODULES FONCTIONNELS MÉTIER (y = 345 à 1115) -->
<!-- ========================================================================================= -->
<text x="35" y="352" class="zone-header">ZONE C — MODULES FONCTIONNELS MÉTIER</text>

<!-- Rangée 1 : Cœur Opérationnel SAV (y = 365 à 595, h = 230) -->

<!-- Module 1 : Demandes & Tickets SAV -->
<g id="mod_tickets">
    <rect x="35" y="365" width="350" height="232" class="card-editorial"/>
    <rect x="49" y="377" width="120" height="16" class="badge-editorial"/>
    <text x="109" y="389" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="49" y="410" class="card-title-serif">1. Demandes &amp; Tickets SAV</text>
    <text x="49" y="425" class="card-desc">Gestion formalisée et cycle de vie des réclamations</text>
    <line x1="49" y1="432" x2="370" y2="432" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="49" y="452" class="bullet-item">• <tspan class="verb">Créer &amp; Numéroter</tspan> le dossier unique (TICK-ABC)</text>
    <text x="49" y="471" class="bullet-item">• <tspan class="verb">Ordonnancer</tspan> : PENDING → OPEN → RESOLVED</text>
    <text x="49" y="490" class="bullet-item">• <tspan class="verb">Surveiller</tspan> les SLA avec alertes d'échéance</text>
    <text x="49" y="509" class="bullet-item">• <tspan class="verb">Tracer</tspan> dans le journal inaltérable (TicketActivity)</text>
    <text x="49" y="528" class="bullet-item">• <tspan class="verb">Partager</tspan> les dossiers entre succursales et ateliers</text>
    <text x="49" y="547" class="bullet-item">• <tspan class="verb">Joindre</tspan> des pièces justificatives (factures, photos)</text>
    <text x="49" y="566" class="bullet-item">• <tspan class="verb">Clôturer</tspan> avec motif formel de résolution</text>
</g>

<!-- Module 2 : Conversations & Dialogue Direct -->
<g id="mod_conv">
    <rect x="415" y="365" width="350" height="232" class="card-editorial"/>
    <rect x="429" y="377" width="120" height="16" class="badge-editorial"/>
    <text x="489" y="389" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="429" y="410" class="card-title-serif">2. Conversations &amp; Dialogue Direct</text>
    <text x="429" y="425" class="card-desc">Messagerie instantanée omnicanale et tchat client</text>
    <line x1="429" y1="432" x2="750" y2="432" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="429" y="452" class="bullet-item">• <tspan class="verb">Échanger</tspan> en temps réel entre client et conseiller</text>
    <text x="429" y="471" class="bullet-item">• <tspan class="verb">Générer</tspan> une session sécurisée par jeton sans compte</text>
    <text x="429" y="490" class="bullet-item">• <tspan class="verb">Consigner</tspan> des notes confidentielles internes</text>
    <text x="429" y="509" class="bullet-item">• <tspan class="verb">Élever</tspan> instantanément le fil de tchat en Ticket SAV</text>
    <text x="429" y="528" class="bullet-item">• <tspan class="verb">Réceptionner</tspan> des photos et documents justificatifs</text>
    <text x="429" y="547" class="bullet-item">• <tspan class="verb">Indiquer</tspan> présence et saisie en direct (SSE)</text>
    <text x="429" y="566" class="bullet-item">• <tspan class="verb">Conserver</tspan> l'historique complet des échanges</text>
</g>

<!-- Rangée 2 : Organisation & Sécurité (y = 618 à 850, h = 232) -->

<!-- Module 3 : Équipe, Compétences & Agences -->
<g id="mod_team">
    <rect x="35" y="618" width="350" height="232" class="card-editorial"/>
    <rect x="49" y="630" width="120" height="16" class="badge-editorial"/>
    <text x="109" y="642" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="49" y="663" class="card-title-serif">3. Équipe, Compétences &amp; Agences</text>
    <text x="49" y="678" class="card-desc">Ressources, qualifications et réseau d'établissements</text>
    <line x1="49" y1="685" x2="370" y2="685" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="49" y="705" class="bullet-item">• <tspan class="verb">Réguler</tspan> la charge via plafonds (maxCapacity)</text>
    <text x="49" y="724" class="bullet-item">• <tspan class="verb">Déclarer</tspan> les statuts : AVAILABLE, BUSY, AWAY</text>
    <text x="49" y="743" class="bullet-item">• <tspan class="verb">Classifier</tspan> les compétences techniques (Skills)</text>
    <text x="49" y="762" class="bullet-item">• <tspan class="verb">Affecter</tspan> automatiquement selon profil et charge</text>
    <text x="49" y="781" class="bullet-item">• <tspan class="verb">Administrer</tspan> les succursales et ateliers SAV</text>
    <text x="49" y="800" class="bullet-item">• <tspan class="verb">Réassigner</tspan> manuellement les dossiers en surcharge</text>
    <text x="49" y="819" class="bullet-item">• <tspan class="verb">Auditer</tspan> la charge de traitement en direct</text>
</g>

<!-- Module 4 : Sécurité & Gestion des Accès -->
<g id="mod_sec">
    <rect x="415" y="618" width="350" height="232" class="card-editorial"/>
    <rect x="429" y="630" width="120" height="16" class="badge-editorial"/>
    <text x="489" y="642" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="429" y="663" class="card-title-serif">4. Sécurité &amp; Gestion des Accès</text>
    <text x="429" y="678" class="card-desc">Contrôle d'accès, étanchéité multi-tenant et traçabilité</text>
    <line x1="429" y1="685" x2="750" y2="685" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="429" y="705" class="bullet-item">• <tspan class="verb">Sécuriser</tspan> par cookies HttpOnly, SameSite et OTP</text>
    <text x="429" y="724" class="bullet-item">• <tspan class="verb">Contrôler</tspan> strictement les accès par rôle (RBAC)</text>
    <text x="429" y="743" class="bullet-item">• <tspan class="verb">Cloisonner</tspan> hermétiquement les données d'entreprise</text>
    <text x="429" y="762" class="bullet-item">• <tspan class="verb">Garantir</tspan> la persistance via l'Outbox Pattern</text>
    <text x="429" y="781" class="bullet-item">• <tspan class="verb">Diffuser</tspan> en temps réel via Pulse Stream (SSE)</text>
    <text x="429" y="800" class="bullet-item">• <tspan class="verb">Journaliser</tspan> les actions d'administration (AuditLog)</text>
    <text x="429" y="819" class="bullet-item">• <tspan class="verb">Bloquer</tspan> les abus par limitation de débit (Rate Limit)</text>
</g>

<!-- Rangée 3 : Monétisation & Innovation Cible (y = 872 à 1114, h = 242) -->

<!-- Module 5 : Facturation, Quotas & Abonnements -->
<g id="mod_comm">
    <rect x="35" y="872" width="350" height="242" class="card-editorial"/>
    <rect x="49" y="884" width="120" height="16" class="badge-editorial"/>
    <text x="109" y="896" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="49" y="917" class="card-title-serif">5. Facturation &amp; Abonnements</text>
    <text x="49" y="932" class="card-desc">Gestion commerciale SaaS et paiements dématérialisés</text>
    <line x1="49" y1="939" x2="370" y2="939" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="49" y="959" class="bullet-item">• <tspan class="verb">Tarifer</tspan> selon formules (Starter, Pro, Enterprise)</text>
    <text x="49" y="978" class="bullet-item">• <tspan class="verb">Réguler</tspan> dynamiquement les quotas agents/tickets</text>
    <text x="49" y="997" class="bullet-item">• <tspan class="verb">Encaisser</tspan> via SasPay (Mobile Money &amp; Cartes)</text>
    <text x="49" y="1016" class="bullet-item">• <tspan class="verb">Valider</tspan> les paiements par webhooks asynchrones</text>
    <text x="49" y="1035" class="bullet-item">• <tspan class="verb">Éditer</tspan> factures comptables et historique</text>
    <text x="49" y="1054" class="bullet-item">• <tspan class="verb">Notifier</tspan> l'approche des échéances de forfait</text>
    <text x="49" y="1073" class="bullet-item">• <tspan class="verb">Renouveler</tspan> les abonnements à date anniversaire</text>
</g>

<!-- Module 6 : Assistance IA & RAG (Supervisée) - ACCENT FOCAL 10% -->
<g id="mod_ai">
    <rect x="415" y="872" width="350" height="242" class="card-target"/>
    <rect x="429" y="884" width="185" height="16" class="badge-accent"/>
    <text x="521" y="896" class="badge-text-accent">ARCHITECTURE CIBLE • EN PRÉPARATION</text>
    <text x="429" y="917" class="card-title-serif" fill="#2D3142">6. Assistance IA &amp; RAG (Supervisée)</text>
    <text x="429" y="932" class="card-desc">Augmentation des conseillers et garde-fous stricts</text>
    <line x1="429" y1="939" x2="750" y2="939" stroke="#FDBA74" stroke-width="0.8"/>
    
    <text x="429" y="959" class="bullet-item">• <tspan class="verb">Ingérer</tspan> manuels SAV et documentation (chunks)</text>
    <text x="429" y="978" class="bullet-item">• <tspan class="verb">Rechercher</tspan> sémantiquement &amp; <tspan class="verb">Générer</tspan> (Llama 3.3)</text>
    <text x="429" y="997" class="bullet-item">• <tspan class="verb">Proposer</tspan> des brouillons modifiables par l'agent</text>
    <text x="429" y="1016" class="bullet-item" fill="#9A3412">• <tspan class="verb-accent">Escalade humaine immédiate obligatoire :</tspan></text>
    <text x="445" y="1033" class="bullet-sub">1. Détection d'irritation ou insatisfaction client</text>
    <text x="445" y="1049" class="bullet-sub">2. Litige ou contestation financière &gt; 50 000 XAF</text>
    <text x="445" y="1065" class="bullet-sub">3. Demande explicite de prise en charge par un agent</text>
    <text x="429" y="1086" class="bullet-item">• <tspan class="verb">Superviser</tspan> avec score de confiance et validation</text>
</g>

<!-- ========================================================================================= -->
<!-- CONNECTEURS ET FLUX AVEC MASQUAGE OPAQUE -->
<!-- ========================================================================================= -->

<!-- c1 : Client -> Portail Public -->
<path d="M 210 158 L 210 200" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="125" y="169" width="170" height="18" class="pill-bg"/>
<text x="210" y="182" class="pill-text">Accéder librement (sans compte)</text>

<!-- c2 : Collaborateurs -> Workspace -->
<path d="M 590 158 L 590 200" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="505" y="169" width="170" height="18" class="pill-bg"/>
<text x="590" y="182" class="pill-text">S'authentifier par rôle (RBAC)</text>

<!-- c3 : Portail Public -> Conversations -->
<path d="M 385 261 L 590 261 L 590 365" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="420" y="252" width="145" height="18" class="pill-bg"/>
<text x="492" y="265" class="pill-text">Initier le tchat direct</text>

<!-- c4 : Workspace -> Tickets SAV -->
<path d="M 415 285 L 210 285 L 210 365" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="235" y="276" width="150" height="18" class="pill-bg"/>
<text x="310" y="289" class="pill-text">Traiter les tickets SAV</text>

<!-- c5 : Workspace -> Équipe & Compétences -->
<path d="M 765 261 L 785 261 L 785 734 L 385 734" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="590" y="725" width="180" height="18" class="pill-bg"/>
<text x="680" y="738" class="pill-text">Piloter files &amp; compétences</text>

<!-- c6 : Conversations -> Tickets SAV -->
<path d="M 415 481 L 385 481" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="335" y="472" width="130" height="18" class="pill-bg"/>
<text x="400" y="485" class="pill-text">Élever en Ticket SAV</text>

<!-- c7 : Assistance IA -> Conversations (Suggestions RAG) -->
<path d="M 590 872 L 590 597" class="conn-line-accent" marker-end="url(#arr-accent)"/>
<rect x="505" y="715" width="170" height="18" class="pill-bg-accent"/>
<text x="590" y="728" class="pill-text-accent">Suggérer des réponses (RAG)</text>

<!-- c8 : Assistance IA -> Tickets SAV (Escalade obligatoire) -->
<path d="M 415 1016 L 210 1016 L 210 597" class="conn-line-accent" marker-end="url(#arr-accent)"/>
<rect x="140" y="805" width="195" height="18" class="pill-bg-accent"/>
<text x="237" y="818" class="pill-text-accent">Escalader litiges / alertes (&gt;50k)</text>

</svg>`;

// ==============================================================================
// 2. GÉNÉRATION DU XML DRAW.IO COMPATIBLE A4 PORTRAIT
// ==============================================================================

function buildDrawioXml() {
    const cells = [];
    cells.push('<mxCell id="0" />');
    cells.push('<mxCell id="1" parent="0" />');

    // Headers de zones
    cells.push('<mxCell id="lbl_zone_a" parent="1" value="&lt;b&gt;ZONE A — ACTEURS DU SYSTÈME&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#4F5D75;fontStyle=1;fontFamily=Georgia;" vertex="1"><mxGeometry x="35" y="16" width="300" height="20" as="geometry" /></mxCell>');
    cells.push('<mxCell id="lbl_zone_b" parent="1" value="&lt;b&gt;ZONE B — ESPACES D\'ACCÈS &amp; CANAUX D\'INTERACTION&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#4F5D75;fontStyle=1;fontFamily=Georgia;" vertex="1"><mxGeometry x="35" y="176" width="400" height="20" as="geometry" /></mxCell>');
    cells.push('<mxCell id="lbl_zone_c" parent="1" value="&lt;b&gt;ZONE C — MODULES FONCTIONNELS MÉTIER&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#4F5D75;fontStyle=1;fontFamily=Georgia;" vertex="1"><mxGeometry x="35" y="342" width="400" height="20" as="geometry" /></mxCell>');

    // Styles
    const styleActor = "rounded=1;arcSize=6;shadow=0;fillColor=#FFFFFF;strokeColor=#4F5D75;strokeWidth=1.0;verticalAlign=top;align=left;overflow=fill;html=1;";
    const styleModule = "rounded=1;arcSize=6;shadow=0;fillColor=#FFFFFF;strokeColor=#2D3142;strokeWidth=1.0;verticalAlign=top;align=left;overflow=fill;html=1;";
    const styleModuleTarget = "rounded=1;arcSize=6;shadow=0;fillColor=#FFFAF8;strokeColor=#EB6C36;strokeWidth=1.2;dashed=1;dashPattern=6 4;verticalAlign=top;align=left;overflow=fill;html=1;";
    const styleEdge = "edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#4F5D75;strokeWidth=1.2;endArrow=block;endFill=1;fontSize=9.5;fontColor:#2D3142;fontStyle=1;";
    const styleEdgeAccent = "edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#EB6C36;strokeWidth=1.3;dashed=1;dashPattern=5 4;endArrow=block;endFill=1;fontSize=9.5;fontColor:#EB6C36;fontStyle=1;";

    // Acteurs
    cells.push(`<mxCell id="act_client" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;ACTEUR EXTERNE&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:13.5px;color:#2D3142;display:block;margin-top:4px;&quot;&gt;Client / Consommateur&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#334155;margin-top:6px;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Accéder&lt;/b&gt; librement sans compte&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Déposer&lt;/b&gt; des réclamations &amp;amp; suivre&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Échanger&lt;/b&gt; en direct par tchat SAV&lt;/div&gt;&lt;/div&gt;" style="${styleActor}" vertex="1"><mxGeometry x="35" y="38" width="350" height="120" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="act_internal" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;WORKSPACE MULTI-TENANT&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:13.5px;color:#2D3142;display:block;margin-top:4px;&quot;&gt;Collaborateurs de l&apos;Entreprise&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#334155;margin-top:6px;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Conseiller (Agent)&lt;/b&gt; : Traiter tickets &amp;amp; SLA&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Superviseur (Manager)&lt;/b&gt; : Files &amp;amp; agences&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Administrateur (Owner)&lt;/b&gt; : Équipe &amp;amp; SasPay&lt;/div&gt;&lt;/div&gt;" style="${styleActor}" vertex="1"><mxGeometry x="415" y="38" width="350" height="120" as="geometry" /></mxCell>`);

    // Espaces
    cells.push(`<mxCell id="space_public" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;ENVIRONNEMENT PUBLIC&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;Portail Public &amp;amp; Vitrine SAV&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#334155;margin-top:6px;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Rechercher&lt;/b&gt; commerces certifiés (/entreprises)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Consulter&lt;/b&gt; vitrine, adresses et horaires SAV&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Démarrer&lt;/b&gt; un tchat immédiat sécurisé par jeton&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="35" y="200" width="350" height="122" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="space_workspace" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;ESPACE SÉCURISÉ MULTI-TENANT&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;Workspace Collaboratif Entreprise&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#334155;margin-top:6px;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Cockpit Conseiller&lt;/b&gt; : Traitement tickets &amp;amp; SLA&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Console Supervision&lt;/b&gt; : Files, compétences &amp;amp; agences&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Administration&lt;/b&gt; : Équipe, abonnements &amp;amp; IA&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="415" y="200" width="350" height="122" as="geometry" /></mxCell>`);

    // Rangée 1 Modules
    cells.push(`<mxCell id="mod_tickets" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;1. Demandes &amp;amp; Tickets SAV&lt;/b&gt;&lt;div style=&quot;font-size:10.5px;color:#64748B;font-style:italic;margin-bottom:4px;&quot;&gt;Cycle de vie formalisé des réclamations&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:3px 0 6px 0;&quot;/&gt;&lt;div style=&quot;font-size:11px;color:#334155;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Créer &amp;amp; Numéroter&lt;/b&gt; le dossier unique (TICK-ABC)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Ordonnancer&lt;/b&gt; : PENDING → OPEN → RESOLVED&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Surveiller&lt;/b&gt; les SLA avec alertes d&apos;échéance&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Tracer&lt;/b&gt; dans le journal inaltérable (TicketActivity)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Partager&lt;/b&gt; dossiers entre succursales et ateliers&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Joindre&lt;/b&gt; pièces justificatives (factures, photos)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Clôturer&lt;/b&gt; avec motif formel de résolution&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="35" y="365" width="350" height="232" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="mod_conv" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;2. Conversations &amp;amp; Dialogue Direct&lt;/b&gt;&lt;div style=&quot;font-size:10.5px;color:#64748B;font-style:italic;margin-bottom:4px;&quot;&gt;Messagerie instantanée omnicanale et tchat&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:3px 0 6px 0;&quot;/&gt;&lt;div style=&quot;font-size:11px;color:#334155;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Échanger&lt;/b&gt; en temps réel entre client et conseiller&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Générer&lt;/b&gt; session sécurisée par jeton sans compte&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Consigner&lt;/b&gt; des notes confidentielles internes&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Élever&lt;/b&gt; instantanément le fil en Ticket SAV&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réceptionner&lt;/b&gt; photos et documents justificatifs&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Indiquer&lt;/b&gt; présence et saisie en direct (SSE)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Conserver&lt;/b&gt; l&apos;historique complet des échanges&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="415" y="365" width="350" height="232" as="geometry" /></mxCell>`);

    // Rangée 2 Modules
    cells.push(`<mxCell id="mod_team" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;3. Équipe, Compétences &amp;amp; Agences&lt;/b&gt;&lt;div style=&quot;font-size:10.5px;color:#64748B;font-style:italic;margin-bottom:4px;&quot;&gt;Ressources, qualifications et agences&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:3px 0 6px 0;&quot;/&gt;&lt;div style=&quot;font-size:11px;color:#334155;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réguler&lt;/b&gt; la charge via plafonds (maxCapacity)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Déclarer&lt;/b&gt; statuts : AVAILABLE, BUSY, AWAY&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Classifier&lt;/b&gt; compétences techniques (Skills)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Affecter&lt;/b&gt; automatiquement selon profil et charge&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Administrer&lt;/b&gt; les succursales et ateliers SAV&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réassigner&lt;/b&gt; manuellement dossiers en pic&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Auditer&lt;/b&gt; la charge de traitement en direct&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="35" y="618" width="350" height="232" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="mod_sec" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;4. Sécurité &amp;amp; Gestion des Accès&lt;/b&gt;&lt;div style=&quot;font-size:10.5px;color:#64748B;font-style:italic;margin-bottom:4px;&quot;&gt;Contrôle RBAC, étanchéité et traçabilité&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:3px 0 6px 0;&quot;/&gt;&lt;div style=&quot;font-size:11px;color:#334155;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Sécuriser&lt;/b&gt; cookies HttpOnly, SameSite et OTP&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Contrôler&lt;/b&gt; strictement autorisations par rôle (RBAC)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Cloisonner&lt;/b&gt; hermétiquement données par tenant&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Garantir&lt;/b&gt; persistance via l&apos;Outbox Pattern&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Diffuser&lt;/b&gt; en temps réel via Pulse Stream (SSE)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Journaliser&lt;/b&gt; actions d&apos;administration (AuditLog)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Bloquer&lt;/b&gt; abus par limitation de débit (Rate Limit)&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="415" y="618" width="350" height="232" as="geometry" /></mxCell>`);

    // Rangée 3 Modules
    cells.push(`<mxCell id="mod_comm" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 5px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;5. Facturation &amp;amp; Abonnements&lt;/b&gt;&lt;div style=&quot;font-size:10.5px;color:#64748B;font-style:italic;margin-bottom:4px;&quot;&gt;Gestion commerciale SaaS et paiements&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:3px 0 6px 0;&quot;/&gt;&lt;div style=&quot;font-size:11px;color:#334155;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Tarifer&lt;/b&gt; selon offres (Starter, Pro, Enterprise)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réguler&lt;/b&gt; dynamiquement quotas agents/tickets&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Encaisser&lt;/b&gt; via SasPay (Mobile Money &amp;amp; Cartes)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Valider&lt;/b&gt; paiements par webhooks asynchrones&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Éditer&lt;/b&gt; factures comptables et historique&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Notifier&lt;/b&gt; l&apos;approche des échéances de forfait&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Renouveler&lt;/b&gt; forfaits à date anniversaire&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="35" y="872" width="350" height="242" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="mod_ai" parent="1" value="&lt;div style=&quot;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:8.5px;font-weight:700;color:#EB6C36;background:#FDF0EB;border:1px solid #EB6C36;padding:2px 5px;border-radius:3px;&quot;&gt;ARCHITECTURE CIBLE • EN PRÉPARATION&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14px;color:#2D3142;display:block;margin-top:4px;font-family:Georgia,serif;&quot;&gt;6. Assistance IA &amp;amp; RAG (Supervisée)&lt;/b&gt;&lt;div style=&quot;font-size:10.5px;color:#64748B;font-style:italic;margin-bottom:4px;&quot;&gt;Augmentation conseillers &amp;amp; garde-fous stricts&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #FDBA74;margin:3px 0 6px 0;&quot;/&gt;&lt;div style=&quot;font-size:11px;color:#334155;line-height:1.45;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Ingérer&lt;/b&gt; manuels SAV et documentation (chunks)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Rechercher&lt;/b&gt; sémantiquement &amp;amp; générer (Llama 3.3)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Proposer&lt;/b&gt; des brouillons modifiables par l&apos;agent&lt;br/&gt;&lt;span style=&quot;color:#9A3412;&quot;&gt;&lt;b style=&quot;color:#EB6C36;&quot;&gt;Escalade humaine immédiate obligatoire :&lt;/b&gt;&lt;/span&gt;&lt;br/&gt;&lt;span style=&quot;color:#9A3412;font-size:10px;&quot;&gt;&amp;nbsp;&amp;nbsp;1. Détection d&apos;irritation client&lt;br/&gt;&amp;nbsp;&amp;nbsp;2. Litige financier &amp;gt; 50 000 XAF&lt;br/&gt;&amp;nbsp;&amp;nbsp;3. Demande explicite de conseiller humain&lt;/span&gt;&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Superviser&lt;/b&gt; avec score de confiance et validation&lt;/div&gt;&lt;/div&gt;" style="${styleModuleTarget}" vertex="1"><mxGeometry x="415" y="872" width="350" height="242" as="geometry" /></mxCell>`);

    // Connecteurs avec masque
    cells.push(`<mxCell id="c1" parent="1" value="Accéder librement (sans compte)" edge="1" source="act_client" target="space_public" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c2" parent="1" value="S\'authentifier par rôle (RBAC)" edge="1" source="act_internal" target="space_workspace" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c3" parent="1" value="Initier le tchat direct" edge="1" source="space_public" target="mod_conv" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c4" parent="1" value="Traiter les tickets SAV" edge="1" source="space_workspace" target="mod_tickets" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c5" parent="1" value="Piloter files &amp; compétences" edge="1" source="space_workspace" target="mod_team" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c6" parent="1" value="Élever en Ticket SAV" edge="1" source="mod_conv" target="mod_tickets" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c7" parent="1" value="Suggérer des réponses (RAG)" edge="1" source="mod_ai" target="mod_conv" style="${styleEdgeAccent}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c8" parent="1" value="Escalader litiges (&gt;50k)" edge="1" source="mod_ai" target="mod_tickets" style="${styleEdgeAccent}"><mxGeometry relative="1" as="geometry" /></mxCell>`);

    const xml = `<mxfile host="app.diagrams.net" modified="2026-11-21T13:30:00.000Z" agent="Antigravity / Kroki Editorial A4" version="24.7.0">
  <diagram id="zadesk-functional-arch-a4" name="Architecture Fonctionnelle Zadesk - A4 Portrait">
    <mxGraphModel dx="1200" dy="1600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="800" pageHeight="1140" math="0" shadow="0">
      <root>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
}

// ==============================================================================
// 3. EXPORTS SVG, DRAW.IO ET RENDU PNG 300 DPI
// ==============================================================================

const targetDir = path.resolve('diagrammes');

// 1. Écriture du SVG
const svgPath = path.join(targetDir, 'Zadesk_Architecture_Fonctionnelle_A4_Portrait.svg');
fs.writeFileSync(svgPath, svg, 'utf8');
console.log('A4 Portrait SVG written:', svgPath, 'Size:', fs.statSync(svgPath).size);

// 2. Écriture du Draw.io
const drawioXml = buildDrawioXml();
const drawioPath = path.join(targetDir, 'Zadesk_Architecture_Fonctionnelle_A4_Portrait.drawio');
fs.writeFileSync(drawioPath, drawioXml, 'utf8');
console.log('A4 Portrait Draw.io written:', drawioPath, 'Size:', fs.statSync(drawioPath).size);

// 3. Rendu PNG haute résolution via sharp
const pngPath = path.join(targetDir, 'Zadesk_Architecture_Fonctionnelle_A4_Portrait.png');
sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(pngPath)
    .then(info => {
        console.log('A4 Portrait PNG rendered successfully:', pngPath, info);
    })
    .catch(err => {
        console.error('Error rendering A4 Portrait PNG:', err);
        process.exit(1);
    });
