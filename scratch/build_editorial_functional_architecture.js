const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve('frontend/node_modules/sharp'));

// Dimensions ergonomiques en paysage (1600 x 1040 px) - Palette éditoriale 60-30-10
const W = 1600;
const H = 1040;

// ==========================================
// 1. GÉNÉRATION DU SVG ÉDITORIAL
// ==========================================

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
    <style><![CDATA[
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        
        /* Titres de zones éditoriales */
        .zone-header { font-size: 11px; font-weight: 800; fill: #4F5D75; letter-spacing: 1px; text-transform: uppercase; font-family: "Georgia", serif; }
        
        /* Cartes éditoriales */
        .card-editorial { rx: 6; ry: 6; fill: #FFFFFF; stroke: #2D3142; stroke-width: 1.0; filter: drop-shadow(0 2px 6px rgba(45, 49, 66, 0.05)); }
        .card-actor { rx: 6; ry: 6; fill: #FFFFFF; stroke: #4F5D75; stroke-width: 1.0; filter: drop-shadow(0 2px 4px rgba(45, 49, 66, 0.04)); }
        .card-accent-target { rx: 6; ry: 6; fill: #FFFAF8; stroke: #EB6C36; stroke-width: 1.2; stroke-dasharray: 6,4; filter: drop-shadow(0 2px 6px rgba(235, 108, 54, 0.06)); }
        
        /* Badges éditoriaux unifiés */
        .badge-editorial { rx: 3; ry: 3; fill: #F1F5F9; stroke: #CBD5E1; stroke-width: 0.8; }
        .badge-accent { rx: 3; ry: 3; fill: #FDF0EB; stroke: #EB6C36; stroke-width: 0.8; }
        .badge-text { font-size: 9px; font-weight: 700; letter-spacing: 0.6px; text-anchor: middle; fill: #2D3142; }
        .badge-text-accent { font-size: 9px; font-weight: 700; letter-spacing: 0.6px; text-anchor: middle; fill: #EB6C36; }
        
        /* Typographie éditoriale */
        .card-title { font-size: 14.5px; font-weight: 700; fill: #2D3142; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .card-title-serif { font-size: 15px; font-weight: 700; fill: #2D3142; font-family: "Georgia", serif; }
        .card-desc { font-size: 11px; font-weight: 400; fill: #64748B; font-style: italic; }
        .bullet-item { font-size: 11.5px; fill: #334155; }
        
        /* Mise en avant des verbes d'action (Encre noire / ardoise uniforme) */
        .verb { font-weight: 800; fill: #2D3142; }
        .verb-accent { font-weight: 800; fill: #EB6C36; }
        .alert-sub { font-size: 11px; fill: #9A3412; }
        
        /* Connecteurs et flux */
        .conn-line { fill: none; stroke: #4F5D75; stroke-width: 1.2; }
        .conn-line-accent { fill: none; stroke: #EB6C36; stroke-width: 1.3; stroke-dasharray: 5,4; }
        
        /* Pastilles d'étiquettes avec masquage opaque */
        .pill-bg { rx: 4; ry: 4; fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 0.9; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.06)); }
        .pill-text { font-size: 10px; font-weight: 700; fill: #2D3142; text-anchor: middle; }
        .pill-text-accent { font-size: 10px; font-weight: 700; fill: #EB6C36; text-anchor: middle; }
    ]]></style>
    
    <marker id="arr-slate" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#4F5D75"/>
    </marker>
    <marker id="arr-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#EB6C36"/>
    </marker>
</defs>

<!-- FOND PAPIER CHAUD ÉDITORIAL (60% Neutral Ground) -->
<rect width="${W}" height="${H}" fill="#F8F9FA"/>

<!-- ========================================================================================= -->
<!-- ZONE A : ACTEURS DU SYSTÈME (y = 20 to 148, h = 100) -->
<!-- ========================================================================================= -->
<text x="55" y="32" class="zone-header">ZONE A — ACTEURS DU SYSTÈME</text>

<!-- 1. Client / Consommateur -->
<g id="act_client">
    <rect x="55" y="44" width="350" height="102" class="card-actor"/>
    <line x1="55" y1="44" x2="405" y2="44" stroke="#2D3142" stroke-width="2.5"/>
    <rect x="71" y="56" width="105" height="18" class="badge-editorial"/>
    <text x="123" y="69" class="badge-text">ACTEUR EXTERNE</text>
    <text x="71" y="93" class="card-title">Client / Consommateur</text>
    <text x="71" y="116" class="bullet-item">• <tspan class="verb">Accéder</tspan> librement sur le web sans compte</text>
    <text x="71" y="135" class="bullet-item">• <tspan class="verb">Déposer</tspan> des réclamations &amp; <tspan class="verb">Échanger</tspan> par tchat</text>
</g>

<!-- 2. Conseiller SAV -->
<g id="act_agent">
    <rect x="435" y="44" width="350" height="102" class="card-actor"/>
    <line x1="435" y1="44" x2="785" y2="44" stroke="#2D3142" stroke-width="2.5"/>
    <rect x="451" y="56" width="130" height="18" class="badge-editorial"/>
    <text x="516" y="69" class="badge-text">RÔLE OPÉRATIONNEL</text>
    <text x="451" y="93" class="card-title">Conseiller SAV (Agent)</text>
    <text x="451" y="116" class="bullet-item">• <tspan class="verb">Prendre en charge</tspan> les tickets &amp; <tspan class="verb">Respecter</tspan> les SLA</text>
    <text x="451" y="135" class="bullet-item">• <tspan class="verb">Dialoguer</tspan> en direct &amp; <tspan class="verb">Rédiger</tspan> des notes d'équipe</text>
</g>

<!-- 3. Superviseur SAV -->
<g id="act_manager">
    <rect x="815" y="44" width="350" height="102" class="card-actor"/>
    <line x1="815" y1="44" x2="1165" y2="44" stroke="#2D3142" stroke-width="2.5"/>
    <rect x="831" y="56" width="130" height="18" class="badge-editorial"/>
    <text x="896" y="69" class="badge-text">RÔLE D'ENCADREMENT</text>
    <text x="831" y="93" class="card-title">Superviseur SAV (Manager)</text>
    <text x="831" y="116" class="bullet-item">• <tspan class="verb">Superviser</tspan> les files d'attente &amp; la charge des agents</text>
    <text x="831" y="135" class="bullet-item">• <tspan class="verb">Qualifier</tspan> les compétences &amp; <tspan class="verb">Administrer</tspan> les agences</text>
</g>

<!-- 4. Administrateur Entreprise -->
<g id="act_admin">
    <rect x="1195" y="44" width="350" height="102" class="card-actor"/>
    <line x1="1195" y1="44" x2="1545" y2="44" stroke="#2D3142" stroke-width="2.5"/>
    <rect x="1211" y="56" width="145" height="18" class="badge-editorial"/>
    <text x="1283" y="69" class="badge-text">DIRECTION &amp; GOUVERNANCE</text>
    <text x="1211" y="93" class="card-title">Administrateur (Owner / Admin)</text>
    <text x="1211" y="116" class="bullet-item">• <tspan class="verb">Inviter</tspan> les collaborateurs &amp; <tspan class="verb">Attribuer</tspan> les rôles</text>
    <text x="1211" y="135" class="bullet-item">• <tspan class="verb">Souscrire</tspan> via SasPay &amp; <tspan class="verb">Paramétrer</tspan> l'assistance IA</text>
</g>

<!-- ========================================================================================= -->
<!-- ZONE B : ESPACES D'ACCÈS & CANAUX (y = 190 to 330, h = 130) -->
<!-- ========================================================================================= -->
<text x="55" y="185" class="zone-header">ZONE B — ESPACES D'ACCÈS &amp; CANAUX D'INTERACTION</text>

<!-- Espace 1 : Portail Public SAV (Web sans compte) -->
<g id="space_public">
    <rect x="55" y="198" width="540" height="124" class="card-editorial"/>
    <rect x="71" y="210" width="135" height="18" class="badge-editorial"/>
    <text x="138" y="223" class="badge-text">ENVIRONNEMENT PUBLIC</text>
    <text x="71" y="246" class="card-title-serif">Portail Public SAV &amp; Vitrine Commerciale</text>
    <text x="71" y="268" class="bullet-item">• <tspan class="verb">Rechercher</tspan> les commerces certifiés dans l'annuaire (<tspan class="card-desc">/entreprises</tspan>)</text>
    <text x="71" y="287" class="bullet-item">• <tspan class="verb">Consulter</tspan> la vitrine, adresses et horaires SAV (<tspan class="card-desc">/entreprises/[slug]</tspan>)</text>
    <text x="71" y="306" class="bullet-item">• <tspan class="verb">Démarrer</tspan> un tchat d'assistance immédiat sécurisé par jeton</text>
</g>

<!-- Espace 2 : Workspace Multi-Tenant -->
<g id="space_workspace">
    <rect x="635" y="198" width="910" height="124" class="card-editorial"/>
    <rect x="651" y="210" width="220" height="18" class="badge-editorial"/>
    <text x="761" y="223" class="badge-text">ESPACE ENTREPRISE MULTI-TENANT</text>
    <text x="651" y="246" class="card-title-serif">Espace Collaboratif Entreprise (Workspace Sécurisé)</text>
    
    <!-- 3 Segments internes horizontaux avec bordure sobre -->
    <rect x="651" y="260" width="275" height="50" rx="4" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.8"/>
    <text x="663" y="278" class="verb" font-size="12">Cockpit Conseiller</text>
    <text x="663" y="296" class="card-desc" font-style="normal" fill="#475569"><tspan class="verb">Traiter</tspan> tickets, <tspan class="verb">dialoguer</tspan> &amp; <tspan class="verb">suivre</tspan> SLA</text>
    
    <rect x="946" y="260" width="280" height="50" rx="4" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.8"/>
    <text x="958" y="278" class="verb" font-size="12">Console Supervision</text>
    <text x="958" y="296" class="card-desc" font-style="normal" fill="#475569"><tspan class="verb">Piloter</tspan> files, compétences &amp; agences</text>
    
    <rect x="1246" y="260" width="280" height="50" rx="4" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.8"/>
    <text x="1258" y="278" class="verb" font-size="12">Administration Générale</text>
    <text x="1258" y="296" class="card-desc" font-style="normal" fill="#475569"><tspan class="verb">Inviter</tspan> l'équipe, <tspan class="verb">payer</tspan> SasPay &amp; <tspan class="verb">régler</tspan> l'IA</text>
</g>

<!-- ========================================================================================= -->
<!-- ZONE C : MODULES FONCTIONNELS MÉTIER (y = 365 to 1010) -->
<!-- ========================================================================================= -->
<text x="55" y="365" class="zone-header">ZONE C — MODULES FONCTIONNELS MÉTIER</text>

<!-- 1. Demandes & Tickets SAV -->
<g id="mod_tickets">
    <rect x="55" y="380" width="470" height="285" class="card-editorial"/>
    <rect x="71" y="394" width="130" height="18" class="badge-editorial"/>
    <text x="136" y="407" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="71" y="430" class="card-title-serif">1. Demandes &amp; Tickets SAV</text>
    <text x="71" y="446" class="card-desc">Gestion formalisée et cycle de vie des réclamations</text>
    <line x1="71" y1="454" x2="505" y2="454" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="71" y="474" class="bullet-item">• <tspan class="verb">Créer &amp; Numéroter</tspan> le dossier technique unique (TICK-ABC123)</text>
    <text x="71" y="494" class="bullet-item">• <tspan class="verb">Ordonnancer</tspan> le cycle SAV : PENDING → OPEN → IN_PROGRESS → RESOLVED</text>
    <text x="71" y="514" class="bullet-item">• <tspan class="verb">Surveiller</tspan> les engagements SLA avec alertes visuelles d'échéance</text>
    <text x="71" y="534" class="bullet-item">• <tspan class="verb">Tracer</tspan> chaque événement dans le journal inaltérable (TicketActivity)</text>
    <text x="71" y="554" class="bullet-item">• <tspan class="verb">Partager</tspan> les dossiers entre succursales et ateliers (TicketShare)</text>
    <text x="71" y="574" class="bullet-item">• <tspan class="verb">Joindre</tspan> des pièces justificatives (factures, photos de panne)</text>
    <text x="71" y="594" class="bullet-item">• <tspan class="verb">Clôturer &amp; Documenter</tspan> avec motif formel de résolution</text>
    <text x="71" y="614" class="bullet-item">• <tspan class="verb">Consolider</tspan> l'historique complet des pannes sur la fiche client</text>
</g>

<!-- 2. Conversations & Dialogue Direct -->
<g id="mod_conv">
    <rect x="565" y="380" width="470" height="285" class="card-editorial"/>
    <rect x="581" y="394" width="130" height="18" class="badge-editorial"/>
    <text x="646" y="407" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="581" y="430" class="card-title-serif">2. Conversations &amp; Dialogue Direct</text>
    <text x="581" y="446" class="card-desc">Messagerie instantanée omnicanale et assistance en direct</text>
    <line x1="581" y1="454" x2="1015" y2="454" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="581" y="474" class="bullet-item">• <tspan class="verb">Échanger</tspan> en temps réel entre client et conseiller SAV</text>
    <text x="581" y="494" class="bullet-item">• <tspan class="verb">Générer</tspan> une session client sécurisée par jeton sans compte</text>
    <text x="581" y="514" class="bullet-item">• <tspan class="verb">Consigner</tspan> des notes confidentielles invisibles pour le client</text>
    <text x="581" y="534" class="bullet-item">• <tspan class="verb">Élever</tspan> instantanément le fil de tchat en Ticket SAV avec historique</text>
    <text x="581" y="554" class="bullet-item">• <tspan class="verb">Réceptionner</tspan> des photos et documents justificatifs en direct</text>
    <text x="581" y="574" class="bullet-item">• <tspan class="verb">Gérer</tspan> les statuts de fil : active, suspendue ou clôturée</text>
    <text x="581" y="594" class="bullet-item">• <tspan class="verb">Indiquer</tspan> la présence et la saisie de message en direct</text>
    <text x="581" y="614" class="bullet-item">• <tspan class="verb">Conserver</tspan> l'intégralité des échanges pour consultation ultérieure</text>
</g>

<!-- 3. Équipe, Compétences & Agences -->
<g id="mod_team">
    <rect x="1075" y="380" width="470" height="285" class="card-editorial"/>
    <rect x="1091" y="394" width="130" height="18" class="badge-editorial"/>
    <text x="1156" y="407" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="1091" y="430" class="card-title-serif">3. Équipe, Compétences &amp; Agences</text>
    <text x="1091" y="446" class="card-desc">Organisation des ressources, qualifications et succursales</text>
    <line x1="1091" y1="454" x2="1525" y2="454" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="1091" y="474" class="bullet-item">• <tspan class="verb">Réguler</tspan> la charge avec des plafonds de capacité (maxCapacity)</text>
    <text x="1091" y="494" class="bullet-item">• <tspan class="verb">Déclarer</tspan> les disponibilités : AVAILABLE, BUSY, AWAY, OFFLINE</text>
    <text x="1091" y="514" class="bullet-item">• <tspan class="verb">Classifier</tspan> les qualifications techniques dans la matrice (Skills)</text>
    <text x="1091" y="534" class="bullet-item">• <tspan class="verb">Affecter</tspan> automatiquement selon compétences et charge active</text>
    <text x="1091" y="554" class="bullet-item">• <tspan class="verb">Administrer</tspan> les succursales, ateliers SAV et horaires (Establishment)</text>
    <text x="1091" y="574" class="bullet-item">• <tspan class="verb">Réassigner</tspan> manuellement les dossiers en cas de surcharge</text>
    <text x="1091" y="594" class="bullet-item">• <tspan class="verb">Auditer</tspan> la charge de traitement en temps réel</text>
    <text x="1091" y="614" class="bullet-item">• <tspan class="verb">Coordonner</tspan> les interventions techniques entre points de vente</text>
</g>

<!-- 4. Sécurité & Gestion des Accès -->
<g id="mod_sec">
    <rect x="55" y="695" width="470" height="295" class="card-editorial"/>
    <rect x="71" y="709" width="130" height="18" class="badge-editorial"/>
    <text x="136" y="722" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="71" y="745" class="card-title-serif">4. Sécurité &amp; Gestion des Accès</text>
    <text x="71" y="761" class="card-desc">Contrôle d'accès, étanchéité multi-tenant et traçabilité</text>
    <line x1="71" y1="769" x2="505" y2="769" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="71" y="789" class="bullet-item">• <tspan class="verb">Sécuriser</tspan> les sessions par cookies HttpOnly, SameSite et OTP</text>
    <text x="71" y="809" class="bullet-item">• <tspan class="verb">Contrôler</tspan> strictement les autorisations par rôle (requireWorkspaceRole)</text>
    <text x="71" y="829" class="bullet-item">• <tspan class="verb">Cloisonner</tspan> hermétiquement les données de chaque organisation</text>
    <text x="71" y="849" class="bullet-item">• <tspan class="verb">Garantir</tspan> la persistance des événements via l'Outbox Pattern</text>
    <text x="71" y="869" class="bullet-item">• <tspan class="verb">Diffuser</tspan> en temps réel via Server-Sent Events (Pulse Stream)</text>
    <text x="71" y="889" class="bullet-item">• <tspan class="verb">Journaliser</tspan> de façon inaltérable chaque action administrative (AuditLog)</text>
    <text x="71" y="909" class="bullet-item">• <tspan class="verb">Bloquer</tspan> les attaques par limitation de débit (Rate Limiting)</text>
    <text x="71" y="929" class="bullet-item">• <tspan class="verb">Révoquer</tspan> immédiatement les accès lors du départ d'un collaborateur</text>
</g>

<!-- 5. Facturation, Quotas & Abonnements -->
<g id="mod_comm">
    <rect x="565" y="695" width="470" height="295" class="card-editorial"/>
    <rect x="581" y="709" width="130" height="18" class="badge-editorial"/>
    <text x="646" y="722" class="badge-text">MODULE OPÉRATIONNEL</text>
    <text x="581" y="745" class="card-title-serif">5. Facturation, Quotas &amp; Abonnements</text>
    <text x="581" y="761" class="card-desc">Gestion commerciale, forfaits SaaS et paiements dématérialisés</text>
    <line x1="581" y1="769" x2="1015" y2="769" stroke="#E2E8F0" stroke-width="0.8"/>
    
    <text x="581" y="789" class="bullet-item">• <tspan class="verb">Tarifer</tspan> selon les formules adaptées aux PME (Starter, Pro, Enterprise)</text>
    <text x="581" y="809" class="bullet-item">• <tspan class="verb">Réguler</tspan> dynamiquement les quotas d'agents, tickets et agences</text>
    <text x="581" y="829" class="bullet-item">• <tspan class="verb">Encaisser</tspan> via SasPay par Mobile Money (Airtel, MTN) et cartes bancaires</text>
    <text x="581" y="849" class="bullet-item">• <tspan class="verb">Valider</tspan> automatiquement les paiements par webhooks asynchrones</text>
    <text x="581" y="869" class="bullet-item">• <tspan class="verb">Éditer</tspan> les factures comptables et l'historique d'abonnement</text>
    <text x="581" y="889" class="bullet-item">• <tspan class="verb">Notifier</tspan> l'approche des échéances ou dépassements de quota</text>
    <text x="581" y="909" class="bullet-item">• <tspan class="verb">Préserver</tspan> l'intégrité des données en cas de rétrogradation d'offre</text>
    <text x="581" y="929" class="bullet-item">• <tspan class="verb">Renouveler</tspan> automatiquement les services à date anniversaire</text>
</g>

<!-- 6. Assistance IA & RAG (Supervisée) - ÉLÉMENT ACCENT FOCAL 10% -->
<g id="mod_ai">
    <rect x="1075" y="695" width="470" height="295" class="card-accent-target"/>
    <rect x="1091" y="709" width="220" height="18" class="badge-accent"/>
    <text x="1201" y="722" class="badge-text-accent">ARCHITECTURE CIBLE • EN PRÉPARATION</text>
    <text x="1091" y="745" class="card-title-serif" fill="#2D3142">6. Assistance IA &amp; RAG (Supervisée)</text>
    <text x="1091" y="761" class="card-desc">Augmentation des conseillers et automatisation encadrée</text>
    <line x1="1091" y1="769" x2="1525" y2="769" stroke="#FDBA74" stroke-width="0.8"/>
    
    <text x="1091" y="789" class="bullet-item">• <tspan class="verb">Ingérer</tspan> la documentation d'entreprise et manuels SAV (chunks)</text>
    <text x="1091" y="808" class="bullet-item">• <tspan class="verb">Rechercher</tspan> sémantiquement &amp; <tspan class="verb">Générer</tspan> des réponses sourcées (Llama 3.3)</text>
    <text x="1091" y="827" class="bullet-item">• <tspan class="verb">Proposer</tspan> des brouillons d'assistance modifiables par le conseiller</text>
    <text x="1091" y="846" class="bullet-item" fill="#9A3412">• <tspan class="verb-accent">Déclencher</tspan> l'escalade humaine obligatoire et immédiate :</text>
    <text x="1108" y="864" class="alert-sub">1. Détection d'irritation ou insatisfaction client</text>
    <text x="1108" y="882" class="alert-sub">2. Litige ou contestation financière &gt; 50 000 XAF</text>
    <text x="1108" y="900" class="alert-sub">3. Demande explicite de prise en charge par un conseiller</text>
    <text x="1091" y="920" class="bullet-item">• <tspan class="verb">Superviser</tspan> en continu avec score de confiance et validation humaine</text>
    <text x="1091" y="939" class="bullet-item">• <tspan class="verb">Enrichir</tspan> dynamiquement les connaissances selon les retours agents</text>
</g>

<!-- ========================================================================================= -->
<!-- CONNECTEURS ET FLUX AVEC MASQUAGE OPAQUE (Opaque Arrow Masking) -->
<!-- ========================================================================================= -->

<!-- c1 : Client -> Portail Public -->
<path d="M 230 146 L 230 198" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="135" y="163" width="190" height="20" class="pill-bg"/>
<text x="230" y="177" class="pill-text">Accéder librement (sans compte)</text>

<!-- c2 : Agent -> Workspace -->
<path d="M 610 146 L 610 172 L 788 172 L 788 198" class="conn-line" marker-end="url(#arr-slate)"/>

<!-- c3 : Manager -> Workspace -->
<path d="M 990 146 L 990 198" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="905" y="163" width="170" height="20" class="pill-bg"/>
<text x="990" y="177" class="pill-text">S'authentifier par rôle (RBAC)</text>

<!-- c4 : Admin -> Workspace -->
<path d="M 1370 146 L 1370 172 L 1386 172 L 1386 198" class="conn-line" marker-end="url(#arr-slate)"/>

<!-- c5 : Portail Public -> Conversations -->
<path d="M 325 322 L 325 350 L 700 350 L 700 380" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="420" y="340" width="180" height="20" class="pill-bg"/>
<text x="510" y="354" class="pill-text">Initier la session tchat direct</text>

<!-- c6 : Workspace -> Tickets SAV -->
<path d="M 788 322 L 788 340 L 290 340 L 290 380" class="conn-line" marker-end="url(#arr-slate)"/>

<!-- c7 : Workspace -> Équipe & Compétences -->
<path d="M 1240 322 L 1240 380" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="1150" y="340" width="180" height="20" class="pill-bg"/>
<text x="1240" y="354" class="pill-text">Prendre en charge &amp; Affecter</text>

<!-- c8 : Conversations -> Tickets SAV -->
<path d="M 565 522 L 525 522" class="conn-line" marker-end="url(#arr-slate)"/>
<rect x="475" y="512" width="140" height="20" class="pill-bg"/>
<text x="545" y="526" class="pill-text">Élever en Ticket SAV</text>

<!-- c9 : Assistance IA -> Conversations (Accentué) -->
<path d="M 1075 790 L 1035 790 L 1035 600 L 1035 600" class="conn-line-accent" marker-end="url(#arr-accent)"/>
<rect x="940" y="700" width="170" height="20" class="pill-bg" stroke="#EB6C36"/>
<text x="1025" y="714" class="pill-text-accent">Suggérer des réponses (RAG)</text>

<!-- c10 : Assistance IA -> Tickets SAV (Escalade) -->
<path d="M 1075 870 L 525 870" class="conn-line-accent" marker-end="url(#arr-accent)"/>
<rect x="705" y="860" width="230" height="20" class="pill-bg" stroke="#EB6C36"/>
<text x="820" y="874" class="pill-text-accent">Escalader automatiquement (&gt; 50k)</text>

</svg>`;

// ==========================================
// 2. GÉNÉRATION DU XML DRAW.IO COMPATIBLE
// ==========================================

function buildDrawioXml() {
    const cells = [];
    cells.push('<mxCell id="0" />');
    cells.push('<mxCell id="1" parent="0" />');

    // Headers de zones
    cells.push('<mxCell id="lbl_zone_a" parent="1" value="&lt;b&gt;ZONE A — ACTEURS DU SYSTÈME&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#4F5D75;fontStyle=1;fontFamily=Georgia;" vertex="1"><mxGeometry x="55" y="20" width="300" height="20" as="geometry" /></mxCell>');
    cells.push('<mxCell id="lbl_zone_b" parent="1" value="&lt;b&gt;ZONE B — ESPACES D\'ACCÈS &amp; CANAUX D\'INTERACTION&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#4F5D75;fontStyle=1;fontFamily=Georgia;" vertex="1"><mxGeometry x="55" y="175" width="400" height="20" as="geometry" /></mxCell>');
    cells.push('<mxCell id="lbl_zone_c" parent="1" value="&lt;b&gt;ZONE C — MODULES FONCTIONNELS MÉTIER&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#4F5D75;fontStyle=1;fontFamily=Georgia;" vertex="1"><mxGeometry x="55" y="358" width="400" height="20" as="geometry" /></mxCell>');

    // Styles de cartes
    const styleActor = "rounded=1;arcSize=6;shadow=0;fillColor=#FFFFFF;strokeColor=#4F5D75;strokeWidth=1.0;verticalAlign=top;align=left;overflow=fill;html=1;";
    const styleModule = "rounded=1;arcSize=6;shadow=0;fillColor=#FFFFFF;strokeColor=#2D3142;strokeWidth=1.0;verticalAlign=top;align=left;overflow=fill;html=1;";
    const styleModuleTarget = "rounded=1;arcSize=6;shadow=0;fillColor=#FFFAF8;strokeColor=#EB6C36;strokeWidth=1.2;dashed=1;dashPattern=6 4;verticalAlign=top;align=left;overflow=fill;html=1;";

    // Style de connecteur éditorial
    const styleEdge = "edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#4F5D75;strokeWidth=1.2;endArrow=block;endFill=1;fontSize=10;fontColor:#2D3142;fontStyle=1;";
    const styleEdgeAccent = "edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#EB6C36;strokeWidth=1.3;dashed=1;dashPattern=5 4;endArrow=block;endFill=1;fontSize=10;fontColor:#EB6C36;fontStyle=1;";

    // Acteurs
    cells.push(`<mxCell id="act_client" parent="1" value="&lt;div style=&quot;padding:8px 12px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;ACTEUR EXTERNE&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14.5px;color:#2D3142;display:block;margin-top:5px;&quot;&gt;Client / Consommateur&lt;/b&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;margin-top:6px;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Accéder&lt;/b&gt; librement sur le web sans compte&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Déposer&lt;/b&gt; des réclamations &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;Échanger&lt;/b&gt; par tchat&lt;/div&gt;&lt;/div&gt;" style="${styleActor}" vertex="1"><mxGeometry x="55" y="44" width="350" height="102" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="act_agent" parent="1" value="&lt;div style=&quot;padding:8px 12px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;RÔLE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14.5px;color:#2D3142;display:block;margin-top:5px;&quot;&gt;Conseiller SAV (Agent)&lt;/b&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;margin-top:6px;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Prendre en charge&lt;/b&gt; les tickets &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;Respecter&lt;/b&gt; les SLA&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Dialoguer&lt;/b&gt; en direct &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;Rédiger&lt;/b&gt; des notes d&apos;équipe&lt;/div&gt;&lt;/div&gt;" style="${styleActor}" vertex="1"><mxGeometry x="435" y="44" width="350" height="102" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="act_manager" parent="1" value="&lt;div style=&quot;padding:8px 12px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;RÔLE D&apos;ENCADREMENT&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14.5px;color:#2D3142;display:block;margin-top:5px;&quot;&gt;Superviseur SAV (Manager)&lt;/b&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;margin-top:6px;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Superviser&lt;/b&gt; les files d&apos;attente &amp;amp; la charge des agents&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Qualifier&lt;/b&gt; les compétences &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;Administrer&lt;/b&gt; les agences&lt;/div&gt;&lt;/div&gt;" style="${styleActor}" vertex="1"><mxGeometry x="815" y="44" width="350" height="102" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="act_admin" parent="1" value="&lt;div style=&quot;padding:8px 12px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;DIRECTION &amp;amp; GOUVERNANCE&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:14.5px;color:#2D3142;display:block;margin-top:5px;&quot;&gt;Administrateur (Owner / Admin)&lt;/b&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;margin-top:6px;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Inviter&lt;/b&gt; les collaborateurs &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;Attribuer&lt;/b&gt; les rôles&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Souscrire&lt;/b&gt; via SasPay &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;Paramétrer&lt;/b&gt; l&apos;assistance IA&lt;/div&gt;&lt;/div&gt;" style="${styleActor}" vertex="1"><mxGeometry x="1195" y="44" width="350" height="102" as="geometry" /></mxCell>`);

    // Espaces
    cells.push(`<mxCell id="space_public" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;ENVIRONNEMENT PUBLIC&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;Portail Public SAV &amp;amp; Vitrine Commerciale&lt;/b&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;margin-top:8px;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Rechercher&lt;/b&gt; les commerces certifiés dans l&apos;annuaire (/entreprises)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Consulter&lt;/b&gt; la vitrine, adresses et horaires SAV (/entreprises/[slug])&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Démarrer&lt;/b&gt; un tchat d&apos;assistance immédiat sécurisé par jeton&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="55" y="198" width="540" height="124" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="space_workspace" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;ESPACE ENTREPRISE MULTI-TENANT&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;Espace Collaboratif Entreprise (Workspace Sécurisé)&lt;/b&gt;&lt;div style=&quot;display:flex;gap:12px;margin-top:8px;font-size:11px;line-height:1.45;&quot;&gt;  &lt;div style=&quot;flex:1;background:#F8FAFC;padding:6px 8px;border-radius:4px;border:1px solid #CBD5E1;&quot;&gt;    &lt;b style=&quot;color:#2D3142;&quot;&gt;Cockpit Conseiller&lt;/b&gt;&lt;br/&gt;    &lt;b style=&quot;color:#2D3142;&quot;&gt;Traiter&lt;/b&gt; tickets, &lt;b style=&quot;color:#2D3142;&quot;&gt;dialoguer&lt;/b&gt; &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;suivre&lt;/b&gt; SLA  &lt;/div&gt;  &lt;div style=&quot;flex:1;background:#F8FAFC;padding:6px 8px;border-radius:4px;border:1px solid #CBD5E1;&quot;&gt;    &lt;b style=&quot;color:#2D3142;&quot;&gt;Console Supervision&lt;/b&gt;&lt;br/&gt;    &lt;b style=&quot;color:#2D3142;&quot;&gt;Piloter&lt;/b&gt; files, compétences &amp;amp; agences  &lt;/div&gt;  &lt;div style=&quot;flex:1;background:#F8FAFC;padding:6px 8px;border-radius:4px;border:1px solid #CBD5E1;&quot;&gt;    &lt;b style=&quot;color:#2D3142;&quot;&gt;Administration Générale&lt;/b&gt;&lt;br/&gt;    &lt;b style=&quot;color:#2D3142;&quot;&gt;Inviter&lt;/b&gt; l&apos;équipe, &lt;b style=&quot;color:#2D3142;&quot;&gt;payer&lt;/b&gt; SasPay &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;régler&lt;/b&gt; l&apos;IA  &lt;/div&gt;&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="635" y="198" width="910" height="124" as="geometry" /></mxCell>`);

    // Modules
    cells.push(`<mxCell id="mod_tickets" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;1. Demandes &amp;amp; Tickets SAV&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#64748B;font-style:italic;margin-bottom:6px;&quot;&gt;Gestion formalisée et cycle de vie des réclamations&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:4px 0 8px 0;&quot;/&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Créer &amp;amp; Numéroter&lt;/b&gt; le dossier technique unique (TICK-ABC123)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Ordonnancer&lt;/b&gt; le cycle SAV : PENDING → OPEN → IN_PROGRESS → RESOLVED&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Surveiller&lt;/b&gt; les engagements SLA avec alertes visuelles d&apos;échéance&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Tracer&lt;/b&gt; chaque événement dans le journal inaltérable (TicketActivity)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Partager&lt;/b&gt; les dossiers entre succursales et ateliers (TicketShare)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Joindre&lt;/b&gt; des pièces justificatives (factures, photos de panne)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Clôturer &amp;amp; Documenter&lt;/b&gt; avec motif formel de résolution&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Consolider&lt;/b&gt; l&apos;historique complet des pannes sur la fiche client&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="55" y="380" width="470" height="285" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="mod_conv" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;2. Conversations &amp;amp; Dialogue Direct&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#64748B;font-style:italic;margin-bottom:6px;&quot;&gt;Messagerie instantanée omnicanale et assistance en direct&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:4px 0 8px 0;&quot;/&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Échanger&lt;/b&gt; en temps réel entre client et conseiller SAV&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Générer&lt;/b&gt; une session client sécurisée par jeton sans compte&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Consigner&lt;/b&gt; des notes confidentielles invisibles pour le client&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Élever&lt;/b&gt; instantanément le fil de tchat en Ticket SAV avec historique&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réceptionner&lt;/b&gt; des photos et documents justificatifs en direct&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Gérer&lt;/b&gt; les statuts de fil : active, suspendue ou clôturée&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Indiquer&lt;/b&gt; la présence et la saisie de message en direct&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Conserver&lt;/b&gt; l&apos;intégralité des échanges pour consultation ultérieure&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="565" y="380" width="470" height="285" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="mod_team" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;3. Équipe, Compétences &amp;amp; Agences&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#64748B;font-style:italic;margin-bottom:6px;&quot;&gt;Organisation des ressources, qualifications et succursales&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:4px 0 8px 0;&quot;/&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réguler&lt;/b&gt; la charge avec des plafonds de capacité (maxCapacity)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Déclarer&lt;/b&gt; les disponibilités : AVAILABLE, BUSY, AWAY, OFFLINE&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Classifier&lt;/b&gt; les qualifications techniques dans la matrice (Skills)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Affecter&lt;/b&gt; automatiquement selon compétences et charge active&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Administrer&lt;/b&gt; les succursales, ateliers SAV et horaires (Establishment)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réassigner&lt;/b&gt; manuellement les dossiers en cas de surcharge&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Auditer&lt;/b&gt; la charge de traitement en temps réel&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Coordonner&lt;/b&gt; les interventions techniques entre points de vente&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="1075" y="380" width="470" height="285" as="geometry" /></mxCell>`);

    cells.push(`<mxCell id="mod_sec" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;4. Sécurité &amp;amp; Gestion des Accès&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#64748B;font-style:italic;margin-bottom:6px;&quot;&gt;Contrôle d&apos;accès, étanchéité multi-tenant et traçabilité&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:4px 0 8px 0;&quot;/&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Sécuriser&lt;/b&gt; les sessions par cookies HttpOnly, SameSite et OTP&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Contrôler&lt;/b&gt; strictement les autorisations par rôle (requireWorkspaceRole)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Cloisonner&lt;/b&gt; hermétiquement les données de chaque organisation&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Garantir&lt;/b&gt; la persistance des événements via l&apos;Outbox Pattern&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Diffuser&lt;/b&gt; en temps réel via Server-Sent Events (Pulse Stream)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Journaliser&lt;/b&gt; de façon inaltérable chaque action administrative (AuditLog)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Bloquer&lt;/b&gt; les attaques par limitation de débit (Rate Limiting)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Révoquer&lt;/b&gt; immédiatement les accès lors du départ d&apos;un collaborateur&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="55" y="695" width="470" height="295" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="mod_comm" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#2D3142;background:#F1F5F9;border:1px solid #CBD5E1;padding:2px 6px;border-radius:3px;&quot;&gt;MODULE OPÉRATIONNEL&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;5. Facturation, Quotas &amp;amp; Abonnements&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#64748B;font-style:italic;margin-bottom:6px;&quot;&gt;Gestion commerciale, forfaits SaaS et paiements dématérialisés&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #E2E8F0;margin:4px 0 8px 0;&quot;/&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Tarifer&lt;/b&gt; selon les formules adaptées aux PME (Starter, Pro, Enterprise)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Réguler&lt;/b&gt; dynamiquement les quotas d&apos;agents, tickets et agences&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Encaisser&lt;/b&gt; via SasPay par Mobile Money (Airtel, MTN) et cartes bancaires&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Valider&lt;/b&gt; automatiquement les paiements par webhooks asynchrones&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Éditer&lt;/b&gt; les factures comptables et l&apos;historique d&apos;abonnement&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Notifier&lt;/b&gt; l&apos;approche des échéances ou dépassements de quota&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Préserver&lt;/b&gt; l&apos;intégrité des données en cas de rétrogradation d&apos;offre&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Renouveler&lt;/b&gt; automatiquement les services à date anniversaire&lt;/div&gt;&lt;/div&gt;" style="${styleModule}" vertex="1"><mxGeometry x="565" y="695" width="470" height="295" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="mod_ai" parent="1" value="&lt;div style=&quot;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;&quot;&gt;&lt;span style=&quot;font-size:9px;font-weight:700;color:#EB6C36;background:#FDF0EB;border:1px solid #EB6C36;padding:2px 6px;border-radius:3px;&quot;&gt;ARCHITECTURE CIBLE • EN PRÉPARATION&lt;/span&gt;&lt;br/&gt;&lt;b style=&quot;font-size:15px;color:#2D3142;display:block;margin-top:5px;font-family:Georgia,serif;&quot;&gt;6. Assistance IA &amp;amp; RAG (Supervisée)&lt;/b&gt;&lt;div style=&quot;font-size:11px;color:#64748B;font-style:italic;margin-bottom:6px;&quot;&gt;Augmentation des conseillers et automatisation encadrée&lt;/div&gt;&lt;hr style=&quot;border:none;border-top:1px solid #FDBA74;margin:4px 0 8px 0;&quot;/&gt;&lt;div style=&quot;font-size:11.5px;color:#334155;line-height:1.5;&quot;&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Ingérer&lt;/b&gt; la documentation d&apos;entreprise et manuels SAV (chunks)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Rechercher&lt;/b&gt; sémantiquement &amp;amp; &lt;b style=&quot;color:#2D3142;&quot;&gt;Générer&lt;/b&gt; des réponses sourcées (Llama 3.3)&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Proposer&lt;/b&gt; des brouillons d&apos;assistance modifiables par le conseiller&lt;br/&gt;&lt;span style=&quot;color:#9A3412;&quot;&gt;&lt;b style=&quot;color:#EB6C36;&quot;&gt;Déclencher&lt;/b&gt; l&apos;escalade humaine obligatoire et immédiate :&lt;/span&gt;&lt;br/&gt;&lt;span style=&quot;color:#9A3412;&quot;&gt;&amp;nbsp;&amp;nbsp;1. Détection d&apos;irritation ou insatisfaction client&lt;/span&gt;&lt;br/&gt;&lt;span style=&quot;color:#9A3412;&quot;&gt;&amp;nbsp;&amp;nbsp;2. Litige ou contestation financière &amp;gt; 50 000 XAF&lt;/span&gt;&lt;br/&gt;&lt;span style=&quot;color:#9A3412;&quot;&gt;&amp;nbsp;&amp;nbsp;3. Demande explicite de prise en charge par un conseiller&lt;/span&gt;&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Superviser&lt;/b&gt; en continu avec score de confiance et validation humaine&lt;br/&gt;• &lt;b style=&quot;color:#2D3142;&quot;&gt;Enrichir&lt;/b&gt; dynamiquement les connaissances selon les retours agents&lt;/div&gt;&lt;/div&gt;" style="${styleModuleTarget}" vertex="1"><mxGeometry x="1075" y="695" width="470" height="295" as="geometry" /></mxCell>`);

    // Connecteurs avec masque opaque
    cells.push(`<mxCell id="c1" parent="1" value="Accéder librement (sans compte)" edge="1" source="act_client" target="space_public" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c2" parent="1" edge="1" source="act_agent" target="space_workspace" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c3" parent="1" value="S\'authentifier par rôle (RBAC)" edge="1" source="act_manager" target="space_workspace" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c4" parent="1" edge="1" source="act_admin" target="space_workspace" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c5" parent="1" value="Initier la session tchat direct" edge="1" source="space_public" target="mod_conv" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c6" parent="1" edge="1" source="space_workspace" target="mod_tickets" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c7" parent="1" value="Prendre en charge &amp; Affecter" edge="1" source="space_workspace" target="mod_team" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c8" parent="1" value="Élever en Ticket SAV" edge="1" source="mod_conv" target="mod_tickets" style="${styleEdge}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c9" parent="1" value="Suggérer des réponses (RAG)" edge="1" source="mod_ai" target="mod_conv" style="${styleEdgeAccent}"><mxGeometry relative="1" as="geometry" /></mxCell>`);
    cells.push(`<mxCell id="c10" parent="1" value="Escalader automatiquement (&gt; 50k)" edge="1" source="mod_ai" target="mod_tickets" style="${styleEdgeAccent}"><mxGeometry relative="1" as="geometry" /></mxCell>`);

    const xml = `<mxfile host="app.diagrams.net" modified="2026-11-21T12:30:00.000Z" agent="Antigravity / Editorial Diagrams Skill" version="24.7.0">
  <diagram id="zadesk-functional-arch-editorial" name="Architecture Fonctionnelle Zadesk - Éditorial">
    <mxGraphModel dx="1600" dy="1050" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1040" math="0" shadow="0">
      <root>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    return xml;
}

// ==========================================
// 3. ÉCRITURE DES FICHIERS ÉDITORIAUX
// ==========================================

const targetDir = path.resolve('diagrammes');

// 1. Écriture du SVG
const svgPath = path.join(targetDir, 'Zadesk_Architecture_Fonctionnelle_Editorial.svg');
fs.writeFileSync(svgPath, svg, 'utf8');
console.log('Editorial SVG written:', svgPath, 'Size:', fs.statSync(svgPath).size);

// 2. Écriture du Draw.io
const drawioXml = buildDrawioXml();
const drawioPath = path.join(targetDir, 'Zadesk_Architecture_Fonctionnelle_Editorial.drawio');
fs.writeFileSync(drawioPath, drawioXml, 'utf8');
console.log('Editorial Draw.io written:', drawioPath, 'Size:', fs.statSync(drawioPath).size);

// 3. Rendu PNG haute résolution via sharp
const pngPath = path.join(targetDir, 'Zadesk_Architecture_Fonctionnelle_Editorial.png');
sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(pngPath)
    .then(info => {
        console.log('Editorial PNG rendered successfully:', pngPath, info);
    })
    .catch(err => {
        console.error('Error rendering Editorial PNG:', err);
        process.exit(1);
    });
