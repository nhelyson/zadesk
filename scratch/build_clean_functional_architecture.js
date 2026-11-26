const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve('frontend/node_modules/sharp'));

// Dimensions ergonomiques en paysage (1600 x 990 px) - Sans titre haut encombrant
const W = 1600;
const H = 990;

// ==========================================
// 1. GÉNÉRATION DU SVG ARCHITECTURE FONCTIONNELLE
// ==========================================

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
    <style><![CDATA[
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        
        /* Titres de zones */
        .zone-header { font-size: 11.5px; font-weight: 800; fill: #475569; letter-spacing: 0.8px; text-transform: uppercase; }
        
        /* Cartes et Conteneurs */
        .card-white { rx: 8; ry: 8; fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 1.2; filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.04)); }
        .card-target { rx: 8; ry: 8; fill: #FFFFFF; stroke: #6366F1; stroke-width: 1.4; stroke-dasharray: 6,4; filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.04)); }
        
        /* Badges de statut */
        .badge-text { font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-anchor: middle; }
        
        /* Typographie de carte */
        .card-title { font-size: 14.5px; font-weight: 700; fill: #0F172A; }
        .card-desc { font-size: 11.5px; font-weight: 400; fill: #475569; }
        .bullet-item { font-size: 11.5px; fill: #334155; }
        
        /* Mise en avant des verbes d'action */
        .verb { font-weight: 800; fill: #0F172A; }
        .verb-accent { font-weight: 800; fill: #065F46; }
        .verb-blue { font-weight: 800; fill: #1E40AF; }
        .verb-purple { font-weight: 800; fill: #6D28D9; }
        .verb-red { font-weight: 800; fill: #DC2626; }
        
        /* Connecteurs et flux */
        .conn-line { fill: none; stroke: #475569; stroke-width: 1.5; }
        .conn-line-accent { fill: none; stroke: #059669; stroke-width: 1.5; }
        .conn-line-dashed { fill: none; stroke: #6366F1; stroke-width: 1.4; stroke-dasharray: 5,4; }
        
        .pill-bg { rx: 4; ry: 4; fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05)); }
        .pill-text { font-size: 10px; font-weight: 700; fill: #1E293B; text-anchor: middle; }
        .pill-text-accent { font-size: 10px; font-weight: 700; fill: #065F46; text-anchor: middle; }
        .pill-text-indigo { font-size: 10px; font-weight: 700; fill: #4338CA; text-anchor: middle; }
    ]]></style>
    
    <marker id="arr-gray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569"/>
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#059669"/>
    </marker>
    <marker id="arr-purple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#7C3AED"/>
    </marker>
    <marker id="arr-indigo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366F1"/>
    </marker>
</defs>

<!-- FOND DE PAGE BLANC PUR -->
<rect width="${W}" height="${H}" fill="#FFFFFF"/>

<!-- ========================================================================================= -->
<!-- ZONE A : ACTEURS DU SYSTÈME (y = 20 to 145, h = 100) -->
<!-- ========================================================================================= -->
<text x="55" y="32" class="zone-header">ZONE A — ACTEURS DU SYSTÈME</text>

<!-- 1. Client / Consommateur -->
<g id="act_client">
    <rect x="55" y="42" width="350" height="98" class="card-white" stroke="#059669"/>
    <rect x="55" y="42" width="350" height="4" fill="#059669" rx="2"/>
    <rect x="71" y="54" width="105" height="18" rx="4" fill="#ECFDF5"/>
    <text x="123" y="67" class="badge-text" fill="#065F46">ACTEUR EXTERNE</text>
    <text x="71" y="89" class="card-title" fill="#065F46">Client / Consommateur</text>
    <text x="71" y="110" class="bullet-item">• <tspan class="verb-accent">Accéder</tspan> librement sur le web sans compte</text>
    <text x="71" y="128" class="bullet-item">• <tspan class="verb-accent">Déposer</tspan> des réclamations &amp; <tspan class="verb-accent">Échanger</tspan> par tchat</text>
</g>

<!-- 2. Conseiller SAV -->
<g id="act_agent">
    <rect x="435" y="42" width="350" height="98" class="card-white"/>
    <rect x="435" y="42" width="350" height="4" fill="#2563EB" rx="2"/>
    <rect x="451" y="54" width="130" height="18" rx="4" fill="#EFF6FF"/>
    <text x="516" y="67" class="badge-text" fill="#1E40AF">RÔLE OPÉRATIONNEL</text>
    <text x="451" y="89" class="card-title" fill="#1E40AF">Conseiller SAV (Agent)</text>
    <text x="451" y="110" class="bullet-item">• <tspan class="verb-blue">Prendre en charge</tspan> les tickets &amp; <tspan class="verb-blue">Respecter</tspan> les SLA</text>
    <text x="451" y="128" class="bullet-item">• <tspan class="verb-blue">Dialoguer</tspan> en direct &amp; <tspan class="verb-blue">Rédiger</tspan> des notes d'équipe</text>
</g>

<!-- 3. Superviseur SAV -->
<g id="act_manager">
    <rect x="815" y="42" width="350" height="98" class="card-white"/>
    <rect x="815" y="42" width="350" height="4" fill="#7C3AED" rx="2"/>
    <rect x="831" y="54" width="130" height="18" rx="4" fill="#FAF5FF"/>
    <text x="896" y="67" class="badge-text" fill="#6D28D9">RÔLE D'ENCADREMENT</text>
    <text x="831" y="89" class="card-title" fill="#6D28D9">Superviseur SAV (Manager)</text>
    <text x="831" y="110" class="bullet-item">• <tspan class="verb-purple">Superviser</tspan> les files d'attente &amp; la charge des agents</text>
    <text x="831" y="128" class="bullet-item">• <tspan class="verb-purple">Qualifier</tspan> les compétences &amp; <tspan class="verb-purple">Administrer</tspan> les agences</text>
</g>

<!-- 4. Administrateur Entreprise -->
<g id="act_admin">
    <rect x="1195" y="42" width="350" height="98" class="card-white"/>
    <rect x="1195" y="42" width="350" height="4" fill="#0F172A" rx="2"/>
    <rect x="1211" y="54" width="145" height="18" rx="4" fill="#F1F5F9"/>
    <text x="1283" y="67" class="badge-text" fill="#1E293B">DIRECTION &amp; GOUVERNANCE</text>
    <text x="1211" y="89" class="card-title" fill="#0F172A">Administrateur (Owner / Admin)</text>
    <text x="1211" y="110" class="bullet-item">• <tspan class="verb">Inviter</tspan> les collaborateurs &amp; <tspan class="verb">Attribuer</tspan> les rôles</text>
    <text x="1211" y="128" class="bullet-item">• <tspan class="verb">Souscrire</tspan> via SasPay &amp; <tspan class="verb">Paramétrer</tspan> l'assistance IA</text>
</g>

<!-- ========================================================================================= -->
<!-- ZONE B : ESPACES D'ACCÈS & CANAUX (y = 195 to 330, h = 125) -->
<!-- ========================================================================================= -->
<text x="55" y="185" class="zone-header">ZONE B — ESPACES D'ACCÈS &amp; CANAUX D'INTERACTION</text>

<!-- Espace 1 : Portail Public SAV (Web sans compte) -->
<g id="space_public">
    <rect x="55" y="198" width="540" height="120" class="card-white" stroke="#059669"/>
    <rect x="55" y="198" width="540" height="4" fill="#059669" rx="2"/>
    <rect x="71" y="210" width="135" height="18" rx="4" fill="#ECFDF5"/>
    <text x="138" y="223" class="badge-text" fill="#065F46">ENVIRONNEMENT PUBLIC</text>
    <text x="71" y="245" class="card-title" fill="#065F46">Portail Public SAV &amp; Vitrine Commerciale</text>
    <text x="71" y="266" class="bullet-item">• <tspan class="verb-accent">Rechercher</tspan> les commerces certifiés dans l'annuaire (<tspan class="card-desc">/entreprises</tspan>)</text>
    <text x="71" y="284" class="bullet-item">• <tspan class="verb-accent">Consulter</tspan> la vitrine, adresses et horaires SAV (<tspan class="card-desc">/entreprises/[slug]</tspan>)</text>
    <text x="71" y="302" class="bullet-item">• <tspan class="verb-accent">Démarrer</tspan> un tchat d'assistance immédiat sécurisé par jeton</text>
</g>

<!-- Espace 2 : Workspace Multi-Tenant -->
<g id="space_workspace">
    <rect x="635" y="198" width="910" height="120" class="card-white" stroke="#2563EB"/>
    <rect x="635" y="198" width="910" height="4" fill="#2563EB" rx="2"/>
    <rect x="651" y="210" width="220" height="18" rx="4" fill="#EFF6FF"/>
    <text x="761" y="223" class="badge-text" fill="#1E40AF">ESPACE ENTREPRISE MULTI-TENANT</text>
    <text x="651" y="245" class="card-title" fill="#1E40AF">Espace Collaboratif Entreprise (Workspace Sécurisé)</text>
    
    <!-- 3 Segments internes horizontaux -->
    <rect x="651" y="258" width="275" height="50" rx="5" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="663" y="275" class="verb-blue" font-size="12">Cockpit Conseiller</text>
    <text x="663" y="293" class="card-desc"><tspan class="verb">Traiter</tspan> les tickets, <tspan class="verb">dialoguer</tspan> &amp; <tspan class="verb">suivre</tspan> SLA</text>
    
    <rect x="946" y="258" width="280" height="50" rx="5" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="958" y="275" class="verb-purple" font-size="12">Console Supervision</text>
    <text x="958" y="293" class="card-desc"><tspan class="verb">Piloter</tspan> les files, compétences &amp; agences</text>
    
    <rect x="1246" y="258" width="280" height="50" rx="5" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
    <text x="1258" y="275" class="verb" font-size="12">Administration Générale</text>
    <text x="1258" y="293" class="card-desc"><tspan class="verb">Inviter</tspan> l'équipe, <tspan class="verb">payer</tspan> SasPay &amp; <tspan class="verb">régler</tspan> l'IA</text>
</g>

<!-- ========================================================================================= -->
<!-- ZONE C : MODULES FONCTIONNELS MÉTIER (y = 360 to 955, h = 595) -->
<!-- ========================================================================================= -->
<text x="55" y="375" class="zone-header">ZONE C — MODULES FONCTIONNELS MÉTIER</text>

<!-- RANGÉE 1 DE MODULES (y = 390, h = 265) -->

<!-- Mod 1 : Demandes & Tickets SAV -->
<g id="mod_tickets">
    <rect x="55" y="390" width="470" height="265" class="card-white" stroke="#7C3AED"/>
    <rect x="55" y="390" width="470" height="4" fill="#7C3AED" rx="2"/>
    <rect x="71" y="404" width="140" height="18" rx="4" fill="#FAF5FF"/>
    <text x="141" y="417" class="badge-text" fill="#6D28D9">MODULE OPÉRATIONNEL</text>
    <text x="71" y="440" class="card-title" fill="#5B21B6">1. Demandes &amp; Tickets SAV</text>
    <text x="71" y="458" class="card-desc" font-style="italic">Gestion formalisée et cycle de vie des réclamations</text>
    <line x1="71" y1="467" x2="505" y2="467" stroke="#F3E8FF" stroke-width="1"/>
    
    <text x="71" y="488" class="bullet-item">• <tspan class="verb-purple">Créer &amp; Numéroter</tspan> le dossier technique unique (<tspan class="card-desc">TICK-ABC123</tspan>)</text>
    <text x="71" y="508" class="bullet-item">• <tspan class="verb-purple">Ordonnancer</tspan> le cycle SAV : PENDING → OPEN → IN_PROGRESS → RESOLVED</text>
    <text x="71" y="528" class="bullet-item">• <tspan class="verb-purple">Surveiller</tspan> les engagements SLA avec alertes visuelles d'échéance</text>
    <text x="71" y="548" class="bullet-item">• <tspan class="verb-purple">Tracer</tspan> chaque événement dans le journal inaltérable (<tspan class="card-desc">TicketActivity</tspan>)</text>
    <text x="71" y="568" class="bullet-item">• <tspan class="verb-purple">Partager</tspan> les dossiers entre succursales et ateliers (<tspan class="card-desc">TicketShare</tspan>)</text>
    <text x="71" y="588" class="bullet-item">• <tspan class="verb-purple">Joindre</tspan> des pièces justificatives (factures, photos de panne)</text>
    <text x="71" y="608" class="bullet-item">• <tspan class="verb-purple">Clôturer &amp; Documenter</tspan> avec motif formel de résolution</text>
    <text x="71" y="628" class="bullet-item">• <tspan class="verb-purple">Consolider</tspan> l'historique complet des pannes sur la fiche client</text>
</g>

<!-- Mod 2 : Conversations Directes -->
<g id="mod_conv">
    <rect x="565" y="390" width="470" height="265" class="card-white" stroke="#0D9488"/>
    <rect x="565" y="390" width="470" height="4" fill="#0D9488" rx="2"/>
    <rect x="581" y="404" width="140" height="18" rx="4" fill="#F0FDFA"/>
    <text x="651" y="417" class="badge-text" fill="#0F766E">MODULE OPÉRATIONNEL</text>
    <text x="581" y="440" class="card-title" fill="#0F766E">2. Conversations &amp; Dialogue Direct</text>
    <text x="581" y="458" class="card-desc" font-style="italic">Messagerie instantanée omnicanale et assistance en direct</text>
    <line x1="581" y1="467" x2="1015" y2="467" stroke="#CCFBF1" stroke-width="1"/>
    
    <text x="581" y="488" class="bullet-item">• <tspan class="verb">Échanger</tspan> en temps réel entre client et conseiller SAV</text>
    <text x="581" y="508" class="bullet-item">• <tspan class="verb">Générer</tspan> une session client sécurisée par jeton sans compte</text>
    <text x="581" y="528" class="bullet-item">• <tspan class="verb">Consigner</tspan> des notes confidentielles invisibles pour le client</text>
    <text x="581" y="548" class="bullet-item">• <tspan class="verb">Élever</tspan> instantanément le fil de tchat en Ticket SAV avec historique</text>
    <text x="581" y="568" class="bullet-item">• <tspan class="verb">Réceptionner</tspan> des photos et documents justificatifs en direct</text>
    <text x="581" y="588" class="bullet-item">• <tspan class="verb">Gérer</tspan> les statuts de fil : active, suspendue ou clôturée</text>
    <text x="581" y="608" class="bullet-item">• <tspan class="verb">Indiquer</tspan> la présence et la saisie de message en direct</text>
    <text x="581" y="628" class="bullet-item">• <tspan class="verb">Conserver</tspan> l'intégralité des échanges pour consultation ultérieure</text>
</g>

<!-- Mod 3 : Équipe & Compétences -->
<g id="mod_team">
    <rect x="1075" y="390" width="470" height="265" class="card-white" stroke="#D97706"/>
    <rect x="1075" y="390" width="470" height="4" fill="#D97706" rx="2"/>
    <rect x="1091" y="404" width="140" height="18" rx="4" fill="#FFFBEB"/>
    <text x="1161" y="417" class="badge-text" fill="#92400E">MODULE OPÉRATIONNEL</text>
    <text x="1091" y="440" class="card-title" fill="#B45309">3. Équipe, Compétences &amp; Agences</text>
    <text x="1091" y="458" class="card-desc" font-style="italic">Organisation des ressources, qualifications et succursales</text>
    <line x1="1091" y1="467" x2="1525" y2="467" stroke="#FEF3C7" stroke-width="1"/>
    
    <text x="1091" y="488" class="bullet-item">• <tspan class="verb">Réguler</tspan> la charge avec des plafonds de capacité (<tspan class="card-desc">maxCapacity</tspan>)</text>
    <text x="1091" y="508" class="bullet-item">• <tspan class="verb">Déclarer</tspan> les disponibilités : AVAILABLE, BUSY, AWAY, OFFLINE</text>
    <text x="1091" y="528" class="bullet-item">• <tspan class="verb">Classifier</tspan> les qualifications techniques dans la matrice (<tspan class="card-desc">Skills</tspan>)</text>
    <text x="1091" y="548" class="bullet-item">• <tspan class="verb">Affecter</tspan> automatiquement selon compétences et charge active</text>
    <text x="1091" y="568" class="bullet-item">• <tspan class="verb">Administrer</tspan> les succursales, ateliers SAV et horaires (<tspan class="card-desc">Establishment</tspan>)</text>
    <text x="1091" y="588" class="bullet-item">• <tspan class="verb">Réassigner</tspan> manuellement les dossiers en cas de surcharge</text>
    <text x="1091" y="608" class="bullet-item">• <tspan class="verb">Auditer</tspan> la charge de traitement en temps réel</text>
    <text x="1091" y="628" class="bullet-item">• <tspan class="verb">Coordonner</tspan> les interventions techniques entre points de vente</text>
</g>

<!-- RANGÉE 2 DE MODULES (y = 680, h = 265) -->

<!-- Mod 4 : Sécurité & Gestion des Accès -->
<g id="mod_sec">
    <rect x="55" y="680" width="470" height="265" class="card-white" stroke="#475569"/>
    <rect x="55" y="680" width="470" height="4" fill="#475569" rx="2"/>
    <rect x="71" y="694" width="140" height="18" rx="4" fill="#F1F5F9"/>
    <text x="141" y="707" class="badge-text" fill="#334155">MODULE OPÉRATIONNEL</text>
    <text x="71" y="730" class="card-title" fill="#1E293B">4. Sécurité &amp; Gestion des Accès</text>
    <text x="71" y="748" class="card-desc" font-style="italic">Contrôle d'accès, étanchéité multi-tenant et traçabilité</text>
    <line x1="71" y1="757" x2="505" y2="757" stroke="#E2E8F0" stroke-width="1"/>
    
    <text x="71" y="778" class="bullet-item">• <tspan class="verb">Sécuriser</tspan> les sessions par cookies HttpOnly, SameSite et OTP</text>
    <text x="71" y="798" class="bullet-item">• <tspan class="verb">Contrôler</tspan> strictement les autorisations par rôle (<tspan class="card-desc">requireWorkspaceRole</tspan>)</text>
    <text x="71" y="818" class="bullet-item">• <tspan class="verb">Cloisonner</tspan> hermétiquement les données de chaque organisation</text>
    <text x="71" y="838" class="bullet-item">• <tspan class="verb">Garantir</tspan> la persistance des événements via l'Outbox Pattern</text>
    <text x="71" y="858" class="bullet-item">• <tspan class="verb">Diffuser</tspan> en temps réel via Server-Sent Events (<tspan class="card-desc">Pulse Stream</tspan>)</text>
    <text x="71" y="878" class="bullet-item">• <tspan class="verb">Journaliser</tspan> de façon inaltérable chaque action administrative (<tspan class="card-desc">AuditLog</tspan>)</text>
    <text x="71" y="898" class="bullet-item">• <tspan class="verb">Bloquer</tspan> les attaques par limitation de débit (<tspan class="card-desc">Rate Limiting</tspan>)</text>
    <text x="71" y="918" class="bullet-item">• <tspan class="verb">Révoquer</tspan> immédiatement les accès lors du départ d'un collaborateur</text>
</g>

<!-- Mod 5 : Facturation, Quotas & Abonnements -->
<g id="mod_comm">
    <rect x="565" y="680" width="470" height="265" class="card-white" stroke="#059669"/>
    <rect x="565" y="680" width="470" height="4" fill="#059669" rx="2"/>
    <rect x="71" y="694" width="140" height="18" rx="4" fill="#ECFDF5"/>
    <rect x="581" y="694" width="140" height="18" rx="4" fill="#ECFDF5"/>
    <text x="651" y="707" class="badge-text" fill="#065F46">MODULE OPÉRATIONNEL</text>
    <text x="581" y="730" class="card-title" fill="#065F46">5. Facturation, Quotas &amp; Abonnements</text>
    <text x="581" y="748" class="card-desc" font-style="italic">Gestion commerciale, forfaits SaaS et paiements dématérialisés</text>
    <line x1="581" y1="757" x2="1015" y2="757" stroke="#A7F3D0" stroke-width="1"/>
    
    <text x="581" y="778" class="bullet-item">• <tspan class="verb-accent">Tarifer</tspan> selon les formules adaptées aux PME (Starter, Pro, Enterprise)</text>
    <text x="581" y="798" class="bullet-item">• <tspan class="verb-accent">Réguler</tspan> dynamiquement les quotas d'agents, tickets et agences</text>
    <text x="581" y="818" class="bullet-item">• <tspan class="verb-accent">Encaisser</tspan> via SasPay par Mobile Money (Airtel, MTN) et cartes bancaires</text>
    <text x="581" y="838" class="bullet-item">• <tspan class="verb-accent">Valider</tspan> automatiquement les paiements par webhooks asynchrones</text>
    <text x="581" y="858" class="bullet-item">• <tspan class="verb-accent">Éditer</tspan> les factures comptables et l'historique d'abonnement</text>
    <text x="581" y="878" class="bullet-item">• <tspan class="verb-accent">Notifier</tspan> l'approche des échéances ou dépassements de quota</text>
    <text x="581" y="898" class="bullet-item">• <tspan class="verb-accent">Préserver</tspan> l'intégrité des données en cas de rétrogradation d'offre</text>
    <text x="581" y="918" class="bullet-item">• <tspan class="verb-accent">Renouveler</tspan> automatiquement les services à date anniversaire</text>
</g>

<!-- Mod 6 : Assistance IA & RAG -->
<g id="mod_ai">
    <rect x="1075" y="680" width="470" height="265" class="card-target"/>
    <rect x="1075" y="680" width="470" height="4" fill="#6366F1" rx="2"/>
    <rect x="1091" y="694" width="225" height="18" rx="4" fill="#EEF2FF"/>
    <text x="1203" y="707" class="badge-text" fill="#4338CA">ARCHITECTURE CIBLE • EN PRÉPARATION</text>
    <text x="1091" y="730" class="card-title" fill="#4338CA">6. Assistance IA &amp; RAG (Supervisée)</text>
    <text x="1091" y="748" class="card-desc" font-style="italic">Augmentation des conseillers et automatisation encadrée</text>
    <line x1="1091" y1="757" x2="1525" y2="757" stroke="#E0E7FF" stroke-width="1"/>
    
    <text x="1091" y="778" class="bullet-item">• <tspan class="verb">Ingérer</tspan> la documentation d'entreprise et manuels SAV (chunks)</text>
    <text x="1091" y="798" class="bullet-item">• <tspan class="verb">Rechercher</tspan> sémantiquement &amp; <tspan class="verb">Générer</tspan> des réponses sourcées (Llama 3.3)</text>
    <text x="1091" y="818" class="bullet-item">• <tspan class="verb">Proposer</tspan> des brouillons d'assistance modifiables par le conseiller</text>
    <text x="1091" y="838" class="bullet-item" fill="#DC2626">• <tspan class="verb-red">Déclencher</tspan> l'escalade humaine obligatoire et immédiate :</text>
    <text x="1105" y="856" class="card-desc" fill="#B91C1C">  1. Détection d'irritation ou insatisfaction client</text>
    <text x="1105" y="874" class="card-desc" fill="#B91C1C">  2. Litige ou contestation financière &gt; 50 000 XAF</text>
    <text x="1105" y="892" class="card-desc" fill="#B91C1C">  3. Demande explicite de prise en charge par un conseiller humain</text>
    <text x="1091" y="910" class="bullet-item">• <tspan class="verb">Superviser</tspan> en continu avec score de confiance et validation humaine</text>
    <text x="1091" y="928" class="bullet-item">• <tspan class="verb">Enrichir</tspan> dynamiquement les connaissances selon les retours agents</text>
</g>

<!-- ========================================================================================= -->
<!-- CONNECTEURS & FLUX D'INTERACTION SANS CHEVAUCHEMENT -->
<!-- ========================================================================================= -->

<!-- 1. Client -> Portail Public -->
<path d="M 230 140 L 230 198" class="conn-line-accent" marker-end="url(#arr-green)"/>
<rect x="155" y="157" width="150" height="20" class="pill-bg"/>
<text x="230" y="171" class="pill-text-accent">Accéder librement (sans compte)</text>

<!-- 2. Conseiller -> Workspace -->
<path d="M 610 140 L 610 168 L 800 168 L 800 198" class="conn-line" marker-end="url(#arr-gray)"/>

<!-- 3. Superviseur -> Workspace -->
<path d="M 990 140 L 990 168 L 1090 168 L 1090 198" class="conn-line" marker-end="url(#arr-gray)"/>

<!-- 4. Administrateur -> Workspace -->
<path d="M 1370 140 L 1370 168 L 1380 168 L 1380 198" class="conn-line" marker-end="url(#arr-gray)"/>

<rect x="980" y="157" width="180" height="20" class="pill-bg"/>
<text x="1070" y="171" class="pill-text">S'authentifier par rôle (RBAC)</text>

<!-- 5. Portail Public -> Module Conversations -->
<path d="M 325 318 L 325 352 L 730 352 L 730 390" class="conn-line-accent" marker-end="url(#arr-green)"/>
<rect x="465" y="342" width="170" height="20" class="pill-bg"/>
<text x="550" y="356" class="pill-text-accent">Initier la session tchat direct</text>

<!-- 6. Workspace -> Module Tickets SAV -->
<path d="M 788 318 L 788 352 L 290 352 L 290 390" class="conn-line" marker-end="url(#arr-gray)"/>

<!-- 7. Workspace -> Module Équipe & Compétences -->
<path d="M 1090 318 L 1090 352 L 1310 352 L 1310 390" class="conn-line" marker-end="url(#arr-gray)"/>
<rect x="1140" y="342" width="190" height="20" class="pill-bg"/>
<text x="1235" y="356" class="pill-text">Prendre en charge &amp; Affecter</text>

<!-- 8. Module Conversations -> Module Tickets (Élévation horizontale SAV) -->
<path d="M 565 522 L 525 522" class="conn-line" stroke="#7C3AED" marker-end="url(#arr-purple)"/>
<path d="M 525 522 L 565 522" class="conn-line" stroke="#7C3AED"/>
<rect x="525" y="504" width="40" height="18" class="pill-bg" stroke="#7C3AED"/>
<text x="545" y="517" class="pill-text" fill="#5B21B6" font-size="9">SAV</text>

<!-- 9. Module IA -> Module Conversations (Suggestions RAG) -->
<path d="M 1075 770 L 1045 770 L 1045 540 L 1035 540" class="conn-line-dashed" marker-end="url(#arr-indigo)"/>
<rect x="975" y="645" width="140" height="20" class="pill-bg" stroke="#6366F1"/>
<text x="1045" y="659" class="pill-text-indigo">Suggérer des réponses (RAG)</text>

<!-- 10. Module IA -> Module Tickets (Escalade automatique) -->
<path d="M 1075 850 L 535 850 L 535 655" class="conn-line-dashed" stroke="#DC2626" marker-end="url(#arr-gray)"/>
<rect x="730" y="840" width="190" height="20" class="pill-bg" stroke="#DC2626"/>
<text x="825" y="854" class="pill-text" fill="#DC2626">Escalader automatiquement (&gt; 50k)</text>

</svg>`;

// ==========================================
// 2. GÉNÉRATION DU XML DRAW.IO NATIF
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

    // Titres de zones (Sans titre haut général)
    cells.push(`<mxCell id="lbl_zone_a" parent="1" value="&lt;b&gt;ZONE A — ACTEURS DU SYSTÈME&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#475569;fontStyle=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="55" y="20" width="300" height="20" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="lbl_zone_b" parent="1" value="&lt;b&gt;ZONE B — ESPACES D'ACCÈS &amp; CANAUX D'INTERACTION&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#475569;fontStyle=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="55" y="175" width="400" height="20" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="lbl_zone_c" parent="1" value="&lt;b&gt;ZONE C — MODULES FONCTIONNELS MÉTIER&lt;/b&gt;" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#475569;fontStyle=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="55" y="365" width="400" height="20" as="geometry" />`);
    cells.push(`</mxCell>`);

    // ZONE A : Acteurs
    const actors = [
        {
            id: 'act_client', x: 55, y: 42, w: 350, h: 98, stroke: '#059669', title: 'Client / Consommateur',
            tag: 'ACTEUR EXTERNE', tagBg: '#ECFDF5', tagColor: '#065F46', titleColor: '#065F46',
            lines: ['• <b>Accéder</b> librement sur le web sans compte', '• <b>Déposer</b> des réclamations &amp; <b>Échanger</b> par tchat']
        },
        {
            id: 'act_agent', x: 435, y: 42, w: 350, h: 98, stroke: '#2563EB', title: 'Conseiller SAV (Agent)',
            tag: 'RÔLE OPÉRATIONNEL', tagBg: '#EFF6FF', tagColor: '#1E40AF', titleColor: '#1E40AF',
            lines: ['• <b>Prendre en charge</b> les tickets &amp; <b>Respecter</b> les SLA', '• <b>Dialoguer</b> en direct &amp; <b>Rédiger</b> des notes d\'équipe']
        },
        {
            id: 'act_manager', x: 815, y: 42, w: 350, h: 98, stroke: '#7C3AED', title: 'Superviseur SAV (Manager)',
            tag: 'RÔLE D\'ENCADREMENT', tagBg: '#FAF5FF', tagColor: '#6D28D9', titleColor: '#6D28D9',
            lines: ['• <b>Superviser</b> les files d\'attente &amp; la charge des agents', '• <b>Qualifier</b> les compétences &amp; <b>Administrer</b> les agences']
        },
        {
            id: 'act_admin', x: 1195, y: 42, w: 350, h: 98, stroke: '#0F172A', title: 'Administrateur (Owner / Admin)',
            tag: 'DIRECTION &amp; GOUVERNANCE', tagBg: '#F1F5F9', tagColor: '#1E293B', titleColor: '#0F172A',
            lines: ['• <b>Inviter</b> les collaborateurs &amp; <b>Attribuer</b> les rôles', '• <b>Souscrire</b> via SasPay &amp; <b>Paramétrer</b> l\'assistance IA']
        }
    ];

    actors.forEach(a => {
        const val = `<div style="padding:6px 10px;font-family:Helvetica,sans-serif;">` +
            `<span style="font-size:9.5px;font-weight:700;color:${a.tagColor};background:${a.tagBg};padding:2px 6px;border-radius:4px;">${a.tag}</span><br/>` +
            `<b style="font-size:14.5px;color:${a.titleColor};display:block;margin-top:4px;">${a.title}</b>` +
            `<div style="font-size:11.5px;color:#334155;margin-top:6px;line-height:1.4;">` +
            a.lines.join('<br/>') +
            `</div>` +
            `</div>`;
        cells.push(`<mxCell id="${a.id}" parent="1" value="${escapeXml(val)}" style="rounded=1;arcSize=6;shadow=1;fillColor=#FFFFFF;strokeColor=${a.stroke};strokeWidth=1.5;verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
        cells.push(`  <mxGeometry x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // ZONE B : Espaces d'accès
    const pubVal = `<div style="padding:8px 12px;font-family:Helvetica,sans-serif;">` +
        `<span style="font-size:9.5px;font-weight:700;color:#065F46;background:#ECFDF5;padding:2px 6px;border-radius:4px;">ENVIRONNEMENT PUBLIC</span><br/>` +
        `<b style="font-size:15px;color:#065F46;display:block;margin-top:4px;">Portail Public SAV &amp; Vitrine Commerciale</b>` +
        `<div style="font-size:11.5px;color:#334155;margin-top:8px;line-height:1.5;">` +
        `• <b>Rechercher</b> les commerces certifiés dans l'annuaire (/entreprises)<br/>` +
        `• <b>Consulter</b> la vitrine, adresses et horaires SAV (/entreprises/[slug])<br/>` +
        `• <b>Démarrer</b> un tchat d'assistance immédiat sécurisé par jeton` +
        `</div>` +
        `</div>`;
    cells.push(`<mxCell id="space_public" parent="1" value="${escapeXml(pubVal)}" style="rounded=1;arcSize=6;shadow=1;fillColor=#FFFFFF;strokeColor=#059669;strokeWidth=1.5;verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="55" y="198" width="540" height="120" as="geometry" />`);
    cells.push(`</mxCell>`);

    const wsVal = `<div style="padding:8px 12px;font-family:Helvetica,sans-serif;">` +
        `<span style="font-size:9.5px;font-weight:700;color:#1E40AF;background:#EFF6FF;padding:2px 6px;border-radius:4px;">ESPACE ENTREPRISE MULTI-TENANT</span><br/>` +
        `<b style="font-size:15px;color:#1E40AF;display:block;margin-top:4px;">Espace Collaboratif Entreprise (Workspace Sécurisé)</b>` +
        `<div style="display:flex;gap:12px;margin-top:8px;font-size:11px;line-height:1.45;">` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 8px;border-radius:5px;border:1px solid #E2E8F0;">` +
        `    <b style="color:#1E40AF;">Cockpit Conseiller</b><br/>` +
        `    <b>Traiter</b> tickets, <b>dialoguer</b> &amp; <b>suivre</b> SLA` +
        `  </div>` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 8px;border-radius:5px;border:1px solid #E2E8F0;">` +
        `    <b style="color:#6D28D9;">Console Supervision</b><br/>` +
        `    <b>Piloter</b> files, compétences &amp; agences` +
        `  </div>` +
        `  <div style="flex:1;background:#F8FAFC;padding:6px 8px;border-radius:5px;border:1px solid #E2E8F0;">` +
        `    <b style="color:#0F172A;">Administration</b><br/>` +
        `    <b>Inviter</b> l'équipe, <b>payer</b> SasPay &amp; <b>régler</b> l'IA` +
        `  </div>` +
        `</div>` +
        `</div>`;
    cells.push(`<mxCell id="space_workspace" parent="1" value="${escapeXml(wsVal)}" style="rounded=1;arcSize=6;shadow=1;fillColor=#FFFFFF;strokeColor=#2563EB;strokeWidth=1.5;verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
    cells.push(`  <mxGeometry x="635" y="198" width="910" height="120" as="geometry" />`);
    cells.push(`</mxCell>`);

    // ZONE C : Modules fonctionnels
    const modules = [
        {
            id: 'mod_tickets', x: 55, y: 390, w: 470, h: 265, stroke: '#7C3AED',
            title: '1. Demandes &amp; Tickets SAV', titleColor: '#5B21B6', tag: 'MODULE OPÉRATIONNEL', tagBg: '#FAF5FF', tagColor: '#6D28D9',
            purpose: 'Gestion formalisée et cycle de vie des réclamations',
            bullets: [
                '<b>Créer &amp; Numéroter</b> le dossier technique unique (TICK-ABC123)',
                '<b>Ordonnancer</b> le cycle SAV : PENDING → OPEN → IN_PROGRESS → RESOLVED',
                '<b>Surveiller</b> les engagements SLA avec alertes visuelles d\'échéance',
                '<b>Tracer</b> chaque événement dans le journal inaltérable (TicketActivity)',
                '<b>Partager</b> les dossiers entre succursales et ateliers (TicketShare)',
                '<b>Joindre</b> des pièces justificatives (factures, photos de panne)',
                '<b>Clôturer &amp; Documenter</b> avec motif formel de résolution',
                '<b>Consolider</b> l\'historique complet des pannes sur la fiche client'
            ]
        },
        {
            id: 'mod_conv', x: 565, y: 390, w: 470, h: 265, stroke: '#0D9488',
            title: '2. Conversations &amp; Dialogue Direct', titleColor: '#0F766E', tag: 'MODULE OPÉRATIONNEL', tagBg: '#F0FDFA', tagColor: '#0F766E',
            purpose: 'Messagerie instantanée omnicanale et assistance en direct',
            bullets: [
                '<b>Échanger</b> en temps réel entre client et conseiller SAV',
                '<b>Générer</b> une session client sécurisée par jeton sans compte',
                '<b>Consigner</b> des notes confidentielles invisibles pour le client',
                '<b>Élever</b> instantanément le fil de tchat en Ticket SAV avec historique',
                '<b>Réceptionner</b> des photos et documents justificatifs en direct',
                '<b>Gérer</b> les statuts de fil : active, suspendue ou clôturée',
                '<b>Indiquer</b> la présence et la saisie de message en direct',
                '<b>Conserver</b> l\'intégralité des échanges pour consultation ultérieure'
            ]
        },
        {
            id: 'mod_team', x: 1075, y: 390, w: 470, h: 265, stroke: '#D97706',
            title: '3. Équipe, Compétences &amp; Agences', titleColor: '#B45309', tag: 'MODULE OPÉRATIONNEL', tagBg: '#FFFBEB', tagColor: '#92400E',
            purpose: 'Organisation des ressources, qualifications et succursales',
            bullets: [
                '<b>Réguler</b> la charge avec des plafonds de capacité (maxCapacity)',
                '<b>Déclarer</b> les disponibilités : AVAILABLE, BUSY, AWAY, OFFLINE',
                '<b>Classifier</b> les qualifications techniques dans la matrice (Skills)',
                '<b>Affecter</b> automatiquement selon compétences et charge active',
                '<b>Administrer</b> les succursales, ateliers SAV et horaires (Establishment)',
                '<b>Réassigner</b> manuellement les dossiers en cas de surcharge',
                '<b>Auditer</b> la charge de traitement en temps réel',
                '<b>Coordonner</b> les interventions techniques entre points de vente'
            ]
        },
        {
            id: 'mod_sec', x: 55, y: 680, w: 470, h: 265, stroke: '#475569',
            title: '4. Sécurité &amp; Gestion des Accès', titleColor: '#1E293B', tag: 'MODULE OPÉRATIONNEL', tagBg: '#F1F5F9', tagColor: '#334155',
            purpose: 'Contrôle d\'accès, étanchéité multi-tenant et traçabilité',
            bullets: [
                '<b>Sécuriser</b> les sessions par cookies HttpOnly, SameSite et OTP',
                '<b>Contrôler</b> strictement les autorisations par rôle (requireWorkspaceRole)',
                '<b>Cloisonner</b> hermétiquement les données de chaque organisation',
                '<b>Garantir</b> la persistance des événements via l\'Outbox Pattern',
                '<b>Diffuser</b> en temps réel via Server-Sent Events (Pulse Stream)',
                '<b>Journaliser</b> de façon inaltérable chaque action administrative (AuditLog)',
                '<b>Bloquer</b> les attaques par limitation de débit (Rate Limiting)',
                '<b>Révoquer</b> immédiatement les accès lors du départ d\'un collaborateur'
            ]
        },
        {
            id: 'mod_comm', x: 565, y: 680, w: 470, h: 265, stroke: '#059669',
            title: '5. Facturation, Quotas &amp; Abonnements', titleColor: '#065F46', tag: 'MODULE OPÉRATIONNEL', tagBg: '#ECFDF5', tagColor: '#065F46',
            purpose: 'Gestion commerciale, forfaits SaaS et paiements dématérialisés',
            bullets: [
                '<b>Tarifer</b> selon les formules adaptées aux PME (Starter, Pro, Enterprise)',
                '<b>Réguler</b> dynamiquement les quotas d\'agents, tickets et agences',
                '<b>Encaisser</b> via SasPay par Mobile Money (Airtel, MTN) et cartes bancaires',
                '<b>Valider</b> automatiquement les paiements par webhooks asynchrones',
                '<b>Éditer</b> les factures comptables et l\'historique d\'abonnement',
                '<b>Notifier</b> l\'approche des échéances ou dépassements de quota',
                '<b>Préserver</b> l\'intégrité des données en cas de rétrogradation d\'offre',
                '<b>Renouveler</b> automatiquement les services à date anniversaire'
            ]
        },
        {
            id: 'mod_ai', x: 1075, y: 680, w: 470, h: 265, stroke: '#6366F1',
            title: '6. Assistance IA &amp; RAG (Supervisée)', titleColor: '#4338CA', tag: 'ARCHITECTURE CIBLE • EN PRÉPARATION', tagBg: '#EEF2FF', tagColor: '#4338CA', dashed: true,
            purpose: 'Augmentation des conseillers et automatisation encadrée',
            bullets: [
                '<b>Ingérer</b> la documentation d\'entreprise et manuels SAV (chunks)',
                '<b>Rechercher</b> sémantiquement &amp; <b>Générer</b> des réponses sourcées (Llama 3.3)',
                '<b>Proposer</b> des brouillons d\'assistance modifiables par le conseiller',
                '<span style="color:#DC2626;"><b>Déclencher</b> l\'escalade humaine obligatoire et immédiate :</span>',
                '<span style="color:#B91C1C;">&nbsp;&nbsp;1. Détection d\'irritation ou insatisfaction client</span>',
                '<span style="color:#B91C1C;">&nbsp;&nbsp;2. Litige ou contestation financière &gt; 50 000 XAF</span>',
                '<span style="color:#B91C1C;">&nbsp;&nbsp;3. Demande explicite de prise en charge par un conseiller</span>',
                '<b>Superviser</b> en continu avec score de confiance et validation humaine',
                '<b>Enrichir</b> dynamiquement les connaissances selon les retours agents'
            ]
        }
    ];

    modules.forEach(m => {
        const val = `<div style="padding:8px 12px;font-family:Helvetica,sans-serif;">` +
            `<span style="font-size:9.5px;font-weight:700;color:${m.tagColor};background:${m.tagBg};padding:2px 6px;border-radius:4px;">${m.tag}</span><br/>` +
            `<b style="font-size:15px;color:${m.titleColor};display:block;margin-top:4px;">${m.title}</b>` +
            `<div style="font-size:11px;color:#64748B;font-style:italic;margin-bottom:6px;">${m.purpose}</div>` +
            `<hr style="border:none;border-top:1px solid #E2E8F0;margin:4px 0 8px 0;"/>` +
            `<div style="font-size:11.5px;color:#334155;line-height:1.45;">` +
            m.bullets.map(b => b.startsWith('<span') ? b : '• ' + b).join('<br/>') +
            `</div>` +
            `</div>`;
        const dashStyle = m.dashed ? ';dashed=1;dashPattern=6 4' : '';
        cells.push(`<mxCell id="${m.id}" parent="1" value="${escapeXml(val)}" style="rounded=1;arcSize=6;shadow=1;fillColor=#FFFFFF;strokeColor=${m.stroke};strokeWidth=1.5${dashStyle};verticalAlign=top;align=left;overflow=fill;html=1;" vertex="1">`);
        cells.push(`  <mxGeometry x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" as="geometry" />`);
        cells.push(`</mxCell>`);
    });

    // CONNECTEURS
    cells.push(`<mxCell id="c1" parent="1" value="Accéder librement (sans compte)" edge="1" source="act_client" target="space_public" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#059669;strokeWidth=1.5;endArrow=block;endFill=1;fontSize=10;fontColor:#065F46;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c2" parent="1" edge="1" source="act_agent" target="space_workspace" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#475569;strokeWidth=1.5;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c3" parent="1" value="S'authentifier par rôle (RBAC)" edge="1" source="act_manager" target="space_workspace" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#475569;strokeWidth=1.5;endArrow=block;endFill=1;fontSize=10;fontColor:#1E293B;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c4" parent="1" edge="1" source="act_admin" target="space_workspace" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#475569;strokeWidth=1.5;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c5" parent="1" value="Initier la session tchat direct" edge="1" source="space_public" target="mod_conv" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#059669;strokeWidth=1.5;endArrow=block;endFill=1;fontSize=10;fontColor:#065F46;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c6" parent="1" edge="1" source="space_workspace" target="mod_tickets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#475569;strokeWidth=1.5;endArrow=block;endFill=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c7" parent="1" value="Prendre en charge &amp; Affecter" edge="1" source="space_workspace" target="mod_team" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#475569;strokeWidth=1.5;endArrow=block;endFill=1;fontSize=10;fontColor:#1E293B;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c8" parent="1" value="Élever en Ticket SAV" edge="1" source="mod_conv" target="mod_tickets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#7C3AED;strokeWidth=1.5;endArrow=block;endFill=1;fontSize=9.5;fontColor:#5B21B6;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c9" parent="1" value="Suggérer des réponses (RAG)" edge="1" source="mod_ai" target="mod_conv" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#6366F1;strokeWidth=1.5;dashed=1;dashPattern=5 4;endArrow=block;endFill=1;fontSize=9.5;fontColor:#4338CA;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    cells.push(`<mxCell id="c10" parent="1" value="Escalader automatiquement (&gt; 50k)" edge="1" source="mod_ai" target="mod_tickets" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#DC2626;strokeWidth=1.5;dashed=1;dashPattern=5 4;endArrow=block;endFill=1;fontSize=9.5;fontColor:#DC2626;fontStyle=1;">`);
    cells.push(`  <mxGeometry relative="1" as="geometry" />`);
    cells.push(`</mxCell>`);

    const xml = `<mxfile host="app.diagrams.net" modified="2026-11-21T11:10:00.000Z" agent="Antigravity / Lead Software Architect" version="24.7.0">
  <diagram id="zadesk-functional-arch" name="Architecture Fonctionnelle Zadesk">
    <mxGraphModel dx="1600" dy="1050" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="990" math="0" shadow="0">
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
        console.log('PNG rendered successfully:', pngPath, info);
    })
    .catch(err => {
        console.error('Error rendering PNG:', err);
    });
