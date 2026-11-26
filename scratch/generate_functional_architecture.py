# -*- coding: utf-8 -*-
"""
Générateur de l'Architecture Fonctionnelle Zadesk pour Draw.io (diagrams.net).
Génère :
1. diagrammes/Zadesk_Architecture_Fonctionnelle.drawio (Natif Draw.io XML éditable)
2. diagrammes/Zadesk_Architecture_Fonctionnelle.svg (Export vectoriel)
3. diagrammes/Zadesk_Architecture_Fonctionnelle.png (Export haute résolution)

Conforme à 100% aux spécifications Draw.io / mxGraph :
- Cellule racine <mxCell id="0"/> sans parent
- Cellule calque <mxCell id="1" parent="0"/>
- Hiérarchie par niveaux fonctionnels :
    Niveau 1 : Acteurs du Système
    Niveau 2 : Espaces d'Accès & Canaux d'Interaction
    Niveau 3 : Cœur des Modules Métier (Humain vs IA Cible)
    Niveau 4 : Gouvernance Multi-Tenant & Persistance
"""

import os
import copy
import xml.etree.ElementTree as ET
import html

def add_cell(root, cell_id, value, style, x=0, y=0, w=0, h=0, parent='1', vertex='1', edge=None, source=None, target=None):
    attribs = {'id': cell_id}
    if parent is not None:
        attribs['parent'] = parent
    if value:
        attribs['value'] = value
    if style:
        attribs['style'] = style
    if vertex:
        attribs['vertex'] = vertex
    if edge:
        attribs['edge'] = edge
    if source:
        attribs['source'] = source
    if target:
        attribs['target'] = target

    cell = ET.SubElement(root, 'mxCell', attribs)
    if vertex == '1':
        ET.SubElement(cell, 'mxGeometry', {
            'x': str(x), 'y': str(y), 'width': str(w), 'height': str(h), 'as': 'geometry'
        })
    elif edge == '1':
        ET.SubElement(cell, 'mxGeometry', {'relative': '1', 'as': 'geometry'})
    return cell

def build_functional_diagram():
    out_dir = os.path.abspath("c:/Users/japhet/Downloads/zadesk/diagrammes")
    os.makedirs(out_dir, exist_ok=True)

    mxfile = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-21T01:30:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })

    # Page format : 2100 x 1550 px (Spacieux, aéré, haute lisibilité)
    width = 2100
    height = 1520
    diag = ET.SubElement(mxfile, 'diagram', {'id': 'zadesk-functional-arch', 'name': 'Architecture Fonctionnelle Zadesk'})
    model = ET.SubElement(diag, 'mxGraphModel', {
        'dx': '1800', 'dy': '1100', 'grid': '1', 'gridSize': '10', 'guides': '1',
        'tooltips': '1', 'connect': '1', 'arrows': '1', 'fold': '1', 'page': '1',
        'pageScale': '1', 'pageWidth': str(width), 'pageHeight': str(height),
        'math': '0', 'shadow': '0'
    })
    root = ET.SubElement(model, 'root')
    add_cell(root, '0', '', '', parent=None, vertex=None)
    add_cell(root, '1', '', '', parent='0', vertex=None)

    # =========================================================================
    # TITRE PRINCIPAL
    # =========================================================================
    title_html = '<div style="text-align:center;"><b style="font-size:23px;color:#0F172A;font-family:Helvetica,Arial,sans-serif;">ARCHITECTURE FONCTIONNELLE DE LA PLATEFORME ZADESK</b><br/><span style="font-size:13px;color:#475569;font-family:Helvetica,Arial,sans-serif;">Cartographie des acteurs, des espaces d\'accès, des modules opérationnels (Humain), du module IA cible et de la gouvernance multi-tenant</span></div>'
    add_cell(root, 'main_title', title_html, 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 350, 15, 1400, 50)

    # =========================================================================
    # NIVEAU 1 : ACTEURS DU SYSTÈME (y = 80 à 200)
    # =========================================================================
    # Ruban de section Niveau 1
    add_cell(root, 'sec_acteurs', '<b>NIVEAU 1 : ACTEURS DU SYSTÈME &amp; RÔLES UTILISATEURS</b>', 'text;html=1;align=left;verticalAlign=middle;fontFamily=Helvetica;fontSize=13;fontColor:#1E3A8A;fontStyle=1;', 80, 75, 600, 25)

    actors = [
        ("act_client", "Client / Consommateur", "EXTERNAL", "#ECFDF5", "#059669", "#065F46", 80, 105, 360, 100,
         "Consommateur final ou usager.<br/>&bull; <b>Sans compte requis</b> sur le portail public<br/>&bull; Dépose des réclamations &amp; dialogue en direct<br/>&bull; Suit l'avancement via son jeton de session"),
        
        ("act_agent", "Conseiller SAV (Agent)", "INTERNAL AGENT", "#FFFBEB", "#D97706", "#92400E", 470, 105, 360, 100,
         "Opérateur de traitement au premier plan.<br/>&bull; Traite les tickets assignés et partagés<br/>&bull; Échange par tchat et saisit des notes internes<br/>&bull; Ajuste sa disponibilité (Disponible, Occupé, etc.)"),
        
        ("act_manager", "Superviseur SAV (Manager)", "TEAM LEAD", "#FAF5FF", "#7C3AED", "#6D28D9", 860, 105, 360, 100,
         "Responsable opérationnel de l'équipe.<br/>&bull; Supervise les files d'attente &amp; charges agents<br/>&bull; Gère les compétences (Skills) &amp; succursales<br/>&bull; Arbitre les escalades et réaffecte les dossiers"),
        
        ("act_admin", "Administrateur Entreprise", "OWNER / ADMIN", "#EFF6FF", "#2563EB", "#1E40AF", 1250, 105, 380, 100,
         "Direction générale de l'entreprise cliente.<br/>&bull; Configure la vitrine publique &amp; branding<br/>&bull; Invite les membres contractuels &amp; rôles<br/>&bull; Gère la facturation SasPay &amp; politique IA"),
        
        ("act_devops", "Opérateur Plateforme", "SAAS OPERATOR", "#F8FAFC", "#475569", "#1E293B", 1660, 105, 360, 100,
         "Exploitant système et technique Zadesk.<br/>&bull; Supervise l'infrastructure Docker/Postgres<br/>&bull; Certifie les entreprises (badge vérifié)<br/>&bull; Maintient la sécurité et les quotas globaux")
    ]

    for aid, aname, arole, abg, aborder, atitle, ax, ay, aw, ah, adesc in actors:
        val = f'''<div style="text-align:center;padding:4px 0 2px 0;">
<span style="font-size:9.5px;font-weight:700;letter-spacing:0.5px;color:{atitle};opacity:0.8;">&laquo;{arole}&raquo;</span><br/>
<b style="font-size:14px;color:{atitle};font-family:Helvetica,Arial,sans-serif;">{aname}</b>
</div>
<hr style="border:none;border-top:1px solid {aborder};margin:3px 0;opacity:0.4;"/>
<div style="text-align:left;padding:2px 8px;font-size:10.5px;color:#1E293B;line-height:1.4;font-family:Helvetica,Arial,sans-serif;">
{adesc}
</div>'''
        style = f'rounded=1;arcSize=6;shadow=1;fillColor={abg};strokeColor={aborder};strokeWidth=1.6;verticalAlign=top;align=left;overflow=fill;html=1;'
        add_cell(root, aid, val, style, ax, ay, aw, ah)

    # =========================================================================
    # NIVEAU 2 : ESPACES D'ACCÈS & CANAUX D'INTERACTION (y = 230 à 490)
    # =========================================================================
    add_cell(root, 'sec_espaces', '<b>NIVEAU 2 : ESPACES D\'ACCÈS &amp; CANAUX D\'INTERACTION</b>', 'text;html=1;align=left;verticalAlign=middle;fontFamily=Helvetica;fontSize=13;fontColor:#1E3A8A;fontStyle=1;', 80, 225, 600, 25)

    # 1. ESPACE PUBLIC CLIENTS (SANS COMPTE REQUIS)
    pub_html = '''<div style="padding:6px 12px;font-family:Helvetica,Arial,sans-serif;">
<div style="display:flex;align-items:center;justify-content:space-between;">
  <b style="font-size:14.5px;color:#15803D;">ESPACE PUBLIC CLIENTS &amp; VISITEURS (Sans compte requis)</b>
  <span style="font-size:10px;font-weight:700;background:#DCFCE7;color:#166534;padding:2px 6px;border-radius:4px;">ACCÈS LIBRE WEB</span>
</div>
<hr style="border:none;border-top:1.5px solid #86EFAC;margin:6px 0;"/>
<div style="font-size:11px;color:#14532D;line-height:1.5;">
  &bull; <b>Annuaire Public des Entreprises Certifiées (/entreprises)</b> : Moteur de recherche et géolocalisation des commerces vérifiés.<br/>
  &bull; <b>Portail SAV &amp; Vitrine Agences (/entreprises/[slug])</b> : Coordonnées de contact, horaires d'ouverture et adresses des succursales physiques.<br/>
  &bull; <b>Widget Tchat SAV Public Instantané</b> : Démarrage immédiat d'une assistance en direct. Session client maintenue par jeton sécurisé sans formulaire d'inscription.
</div>
</div>'''
    add_cell(root, 'space_public', pub_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#F0FDF4;strokeColor=#16A34A;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 80, 255, 650, 195)

    # 2. ESPACE DE TRAVAIL ENTREPRISE (WORKSPACE MULTI-TENANT)
    ws_html = '''<div style="padding:6px 12px;font-family:Helvetica,Arial,sans-serif;">
<div style="display:flex;align-items:center;justify-content:space-between;">
  <b style="font-size:14.5px;color:#1E40AF;">ESPACE DE TRAVAIL COLLABORATIF ENTREPRISE (Workspace Multi-Tenant)</b>
  <span style="font-size:10px;font-weight:700;background:#DBEAFE;color:#1E40AF;padding:2px 6px;border-radius:4px;">ACCÈS AUTHENTIFIÉ PAR RÔLE</span>
</div>
<hr style="border:none;border-top:1.5px solid #93C5FD;margin:6px 0;"/>
<div style="display:flex;gap:12px;font-size:11px;color:#1E3A8A;line-height:1.45;">
  <div style="flex:1;background:#FFFFFF;padding:6px 8px;border-radius:6px;border:1px solid #BFDBFE;">
    <b style="color:#92400E;font-size:11.5px;">Cockpit Conseiller (AGENT)</b><br/>
    &bull; Tableau de bord opérationnel personnel<br/>
    &bull; Traitement « Mes tickets » &amp; SLA<br/>
    &bull; Messagerie client &amp; notes internes<br/>
    &bull; Statut de disponibilité &amp; jauge capacitaire
  </div>
  <div style="flex:1;background:#FFFFFF;padding:6px 8px;border-radius:6px;border:1px solid #BFDBFE;">
    <b style="color:#6D28D9;font-size:11.5px;">Console Supervision (MANAGER)</b><br/>
    &bull; Monitoring en direct des files d'attente<br/>
    &bull; Gestion des compétences (Skills) agents<br/>
    &bull; Gestion des agences physiques (Adresses, horaires)<br/>
    &bull; Réaffectation de dossiers &amp; arbitrage escalades
  </div>
  <div style="flex:1;background:#FFFFFF;padding:6px 8px;border-radius:6px;border:1px solid #BFDBFE;">
    <b style="color:#1D4ED8;font-size:11.5px;">Administration (OWNER / ADMIN)</b><br/>
    &bull; Identité de l'entreprise &amp; coordonnées SAV<br/>
    &bull; Émission &amp; révocation des invitations d'équipe<br/>
    &bull; Paramétrage de l'IA &amp; base de connaissances<br/>
    &bull; Abonnements SasPay &amp; rapports analytiques
  </div>
</div>
</div>'''
    add_cell(root, 'space_workspace', ws_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#EFF6FF;strokeColor=#2563EB;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 760, 255, 1260, 195)

    # =========================================================================
    # NIVEAU 3 : CŒUR DES MODULES MÉTIER (y = 480 à 1180)
    # =========================================================================
    add_cell(root, 'sec_modules', '<b>NIVEAU 3 : CŒUR DES MODULES FONCTIONNELS MÉTIER</b>', 'text;html=1;align=left;verticalAlign=middle;fontFamily=Helvetica;fontSize=13;fontColor:#1E3A8A;fontStyle=1;', 80, 475, 600, 25)

    # MODULE 1 : TICKETS SAV
    mod_tickets_html = '''<div style="padding:6px 10px;font-family:Helvetica,Arial,sans-serif;">
<div style="text-align:center;padding-bottom:3px;">
  <span style="font-size:9.5px;font-weight:700;background:#EDE9FE;color:#6D28D9;padding:2px 6px;border-radius:3px;">MODULE HUMAIN &bull; OPÉRATIONNEL</span><br/>
  <b style="font-size:14px;color:#5B21B6;">1. Gestion des Demandes &amp; Tickets SAV</b>
</div>
<hr style="border:none;border-top:1.5px solid #C4B5FD;margin:4px 0;"/>
<div style="font-size:11px;color:#1E293B;line-height:1.5;">
  &bull; <b>Dossier Technique SAV Unique</b> : Référence normalisée (ex: TICK-ABC123).<br/>
  &bull; <b>Cycle de Vie Formel</b> : PENDING_ASSIGNMENT &rarr; OPEN &rarr; IN_PROGRESS &rarr; RESOLVED &rarr; CLOSED.<br/>
  &bull; <b>Priorisation &amp; Niveaux</b> : Faible, Moyen, Élevé, Urgent.<br/>
  &bull; <b>Engagements de Service (SLA)</b> : Calcul des dates butoirs et alertes visuelles de dépassement.<br/>
  &bull; <b>Traçabilité Chronologique</b> : Journal inaltérable des événements (TicketActivity).<br/>
  &bull; <b>Collaboration Inter-Agences</b> : Partage de ticket en lecture/contribution (TicketShare).
</div>
</div>'''
    add_cell(root, 'mod_tickets', mod_tickets_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#FAF5FF;strokeColor=#7C3AED;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 80, 505, 460, 270)

    # MODULE 2 : CONVERSATIONS OMNICANAL
    mod_conv_html = '''<div style="padding:6px 10px;font-family:Helvetica,Arial,sans-serif;">
<div style="text-align:center;padding-bottom:3px;">
  <span style="font-size:9.5px;font-weight:700;background:#CCFBF1;color:#0F766E;padding:2px 6px;border-radius:3px;">MODULE HUMAIN &bull; OPÉRATIONNEL</span><br/>
  <b style="font-size:14px;color:#0F766E;">2. Conversations &amp; Dialogue Direct</b>
</div>
<hr style="border:none;border-top:1.5px solid #5EEAD4;margin:4px 0;"/>
<div style="font-size:11px;color:#1E293B;line-height:1.5;">
  &bull; <b>Messagerie Temps Réel Web</b> : Échanges directs client &harr; conseiller SAV.<br/>
  &bull; <b>Session Client Autonome</b> : Jeton cryptographique garantissant l'accès sécurisé sans login.<br/>
  &bull; <b>Notes Internes Confidentielles</b> : Échanges invisibles pour le client entre collègues.<br/>
  &bull; <b>Pièces Jointes &amp; Justificatifs</b> : Transmission de photos ou factures d'achat.<br/>
  &bull; <b>Élévation Contextuelle</b> : Transformation d'un fil de tchat en Ticket SAV formel en 1 clic avec conservation intégrale de l'historique.
</div>
</div>'''
    add_cell(root, 'mod_conv', mod_conv_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#F0FDFA;strokeColor=#0D9488;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 570, 505, 460, 270)

    # MODULE 3 : ÉQUIPES, COMPÉTENCES & AGENCES
    mod_team_html = '''<div style="padding:6px 10px;font-family:Helvetica,Arial,sans-serif;">
<div style="text-align:center;padding-bottom:3px;">
  <span style="font-size:9.5px;font-weight:700;background:#FEF3C7;color:#92400E;padding:2px 6px;border-radius:3px;">MODULE HUMAIN &bull; OPÉRATIONNEL</span><br/>
  <b style="font-size:14px;color:#B45309;">3. Équipe, Compétences &amp; Agences</b>
</div>
<hr style="border:none;border-top:1.5px solid #FCD34D;margin:4px 0;"/>
<div style="font-size:11px;color:#1E293B;line-height:1.5;">
  &bull; <b>Profils &amp; Jauges Capacitaires</b> : Définition du plafond de tickets simultanés (maxCapacity).<br/>
  &bull; <b>Disponibilités Temps Réel</b> : AVAILABLE, BUSY, AWAY, OFFLINE.<br/>
  &bull; <b>Matrice des Compétences Métier</b> : Attribution et validation de compétences (Skills).<br/>
  &bull; <b>Moteur d'Attribution Déterministe</b> : Algorithme orientant les tickets selon compétences et charge.<br/>
  &bull; <b>Réseau des Établissements Physiques</b> : Gestion des succursales, ateliers de réparation et points de retrait (Establishment).
</div>
</div>'''
    add_cell(root, 'mod_team', mod_team_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#FFFBEB;strokeColor=#D97706;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 1060, 505, 460, 270)

    # MODULE 4 : ASSISTANCE IA & RAG CIBLE
    mod_ai_html = '''<div style="padding:6px 10px;font-family:Helvetica,Arial,sans-serif;">
<div style="text-align:center;padding-bottom:3px;">
  <span style="font-size:9.5px;font-weight:700;background:#E0E7FF;color:#4338CA;padding:2px 6px;border-radius:3px;">ARCHITECTURE CIBLE &bull; EN PRÉPARATION</span><br/>
  <b style="font-size:14px;color:#4338CA;">4. Assistance IA &amp; RAG (Supervisée)</b>
</div>
<hr style="border:none;border-top:1.5px solid #A5B4FC;margin:4px 0;"/>
<div style="font-size:11px;color:#1E293B;line-height:1.5;">
  &bull; <b>Base de Connaissances Vectorielle</b> : Ingestion documentaire et découpage en chunks.<br/>
  &bull; <b>Recherche Sémantique Dense</b> : Indexation vectorielle sur MongoDB Atlas.<br/>
  &bull; <b>Génération Contextualisée</b> : Réponses automatisées fiables via modèle Llama 3.3.<br/>
  &bull; <b>Modes d'Autonomie Paramétrables</b> : Assisté (brouillon), Semi-autonome, Autonome.<br/>
  &bull; <b>Déclencheurs d'Escalade Humaine</b> :<br/>
  &nbsp;&nbsp;&ndash; Détection sémantique de frustration client<br/>
  &nbsp;&nbsp;&ndash; Seuil de litige financier &gt; 50 000 XAF<br/>
  &nbsp;&nbsp;&ndash; Demande explicite de parler à un agent
</div>
</div>'''
    add_cell(root, 'mod_ai', mod_ai_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#EEF2FF;strokeColor=#4F46E5;strokeWidth=1.8;dashed=1;dashPattern=6 3;verticalAlign=top;align=left;overflow=fill;html=1;', 1550, 505, 470, 270)

    # MODULE 5 : SÉCURITÉ, TRAÇABILITÉ & ÉVÉNEMENTS
    mod_sec_html = '''<div style="padding:6px 12px;font-family:Helvetica,Arial,sans-serif;">
<div style="display:flex;align-items:center;justify-content:space-between;">
  <b style="font-size:13.5px;color:#1E293B;">5. Sécurité, Contrôle d'Accès &amp; Traçabilité Temps Réel</b>
  <span style="font-size:9.5px;font-weight:700;background:#E2E8F0;color:#334155;padding:2px 6px;border-radius:3px;">OPÉRATIONNEL</span>
</div>
<hr style="border:none;border-top:1.5px solid #CBD5E1;margin:4px 0;"/>
<div style="display:flex;gap:15px;font-size:11px;color:#334155;line-height:1.45;">
  <div style="flex:1;">
    &bull; <b>Authentification &amp; Sessions Cryptographiques</b> : Jeton 32 octets aléatoires en base, cookies HttpOnly sécurisés et OTP.<br/>
    &bull; <b>Contrôle d'Accès Multi-Tenant Strict</b> : Middleware <code>requireWorkspaceRole</code> validant l'adhésion contractuelle active.
  </div>
  <div style="flex:1;">
    &bull; <b>Transactional Outbox Pattern</b> : Garantie de non-perte d'événements métiers critiques lors des transactions SQL.<br/>
    &bull; <b>Diffusion SSE en Temps Réel (Pulse Stream)</b> : Actualisation instantanée des cockpits agents sans rafraîchissement.<br/>
    &bull; <b>Journal d'Audit Réglementaire</b> : Traçabilité immuable (AuditLog) de chaque action sensible.
  </div>
</div>
</div>'''
    add_cell(root, 'mod_sec', mod_sec_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#F8FAFC;strokeColor=#475569;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 80, 805, 950, 165)

    # MODULE 6 : COMMERCE, ABONNEMENTS & SASPAY
    mod_comm_html = '''<div style="padding:6px 12px;font-family:Helvetica,Arial,sans-serif;">
<div style="display:flex;align-items:center;justify-content:space-between;">
  <b style="font-size:13.5px;color:#065F46;">6. Gestion Commerciale, Abonnements &amp; Facturation</b>
  <span style="font-size:9.5px;font-weight:700;background:#DCFCE7;color:#166534;padding:2px 6px;border-radius:3px;">OPÉRATIONNEL</span>
</div>
<hr style="border:none;border-top:1.5px solid #6EE7B7;margin:4px 0;"/>
<div style="display:flex;gap:15px;font-size:11px;color:#064E3B;line-height:1.45;">
  <div style="flex:1;">
    &bull; <b>Gestion des Formules SaaS</b> : Grille tarifaire officielle (Starter, Pro, Enterprise).<br/>
    &bull; <b>Contrôle des Quotas Contractuels</b> : Nombre de conseillers autorisés, volume de tickets mensuels et agences.
  </div>
  <div style="flex:1;">
    &bull; <b>Intégration Passerelle SasPay</b> : Paiements sécurisés par Mobile Money (Airtel Money, MTN MoMo) et cartes bancaires.<br/>
    &bull; <b>Webhooks &amp; Traitement Asynchrone</b> : Validation automatique des transactions et activation immédiate des fonctionnalités.
  </div>
</div>
</div>'''
    add_cell(root, 'mod_comm', mod_comm_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#ECFDF5;strokeColor=#059669;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 1060, 805, 960, 165)

    # =========================================================================
    # NIVEAU 4 : GOUVERNANCE MULTI-TENANT & PERSISTANCE (y = 1000 à 1230)
    # =========================================================================
    add_cell(root, 'sec_data', '<b>NIVEAU 4 : GOUVERNANCE MULTI-TENANT &amp; COUCHE DE PERSISTANCE DE DONNÉES</b>', 'text;html=1;align=left;verticalAlign=middle;fontFamily=Helvetica;fontSize=13;fontColor:#1E3A8A;fontStyle=1;', 80, 995, 800, 25)

    data_html = '''<div style="padding:8px 14px;font-family:Helvetica,Arial,sans-serif;">
<div style="display:flex;align-items:center;justify-content:space-between;">
  <b style="font-size:14px;color:#0F172A;">Socle d'Isolation Multi-Tenant, Caching &amp; Persistance Polyglotte</b>
  <span style="font-size:10px;font-weight:700;background:#E2E8F0;color:#334155;padding:2px 6px;border-radius:4px;">INFRASTRUCTURE LOGIQUE SOUS-JACENTE</span>
</div>
<hr style="border:none;border-top:1.5px solid #94A3B8;margin:6px 0;"/>
<div style="display:flex;gap:20px;font-size:11px;color:#1E293B;line-height:1.5;">
  <div style="flex:1.2;background:#FFFFFF;padding:8px 12px;border-radius:6px;border:1.5px solid #3B82F6;">
    <b style="color:#1D4ED8;font-size:12px;">Base Relationnelle Multi-Tenant (PostgreSQL / Prisma)</b><br/>
    &bull; Cloisonnement strict et systématique par clé étrangère <code>workspaceId</code> sur chaque table métier.<br/>
    &bull; Modèle universel des utilisateurs (un même compte peut appartenir à plusieurs espaces d'entreprises).<br/>
    &bull; Intégrité référentielle ACID, contraintes d'unicité (slug, email) et transactions sécurisées.
  </div>
  <div style="flex:1;background:#FFFFFF;padding:8px 12px;border-radius:6px;border:1.5px solid #EF4444;">
    <b style="color:#B91C1C;font-size:12px;">Cache &amp; Broker Asynchrone (Redis / BullMQ)</b><br/>
    &bull; Cache applicatif à dégradation gracieuse en cas d'indisponibilité temporaire.<br/>
    &bull; Files de traitement asynchrones isolées pour les webhooks, notifications et réindexations.<br/>
    &bull; Métriques de performance et observabilité des files.
  </div>
  <div style="flex:1;background:#FFFFFF;padding:8px 12px;border-radius:6px;border:1.5px dashed #6366F1;">
    <b style="color:#4338CA;font-size:12px;">Stockage Vectoriel RAG (MongoDB Atlas — Cible)</b><br/>
    &bull; Indexation vectorielle dense des fragments de connaissances (chunks de 1536 dimensions).<br/>
    &bull; Partitionnement par tenant pour garantir l'étanchéité des corpus documentaires d'entreprises.<br/>
    &bull; Recherche de similarité cosinus haute performance.
  </div>
</div>
</div>'''
    add_cell(root, 'layer_data', data_html, 'rounded=1;arcSize=6;shadow=1;fillColor=#F8FAFC;strokeColor=#64748B;strokeWidth=1.8;verticalAlign=top;align=left;overflow=fill;html=1;', 80, 1025, 1940, 175)

    # =========================================================================
    # CONNECTEURS FONCTIONNELS ORIENTÉS (FLUX DE TRAVAIL)
    # =========================================================================
    def add_flow_edge(edge_id, src, tgt, label, color="#2563EB", dashed=False):
        style = f'edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor={color};strokeWidth=1.8;endArrow=block;endFill=1;fontFamily=Helvetica;fontSize=11;fontStyle=1;fontColor=#0F172A;'
        if dashed:
            style += 'dashed=1;dashPattern=5 3;'
        safe_lbl = html.escape(label).replace('\n', '<br/>')
        add_cell(root, edge_id, safe_lbl, style, edge='1', source=src, target=tgt, vertex=None)

    # Flux Acteurs vers Espaces
    add_flow_edge("f1", "act_client", "space_public", "1. Accède au portail SAV\net soumet une demande", "#059669")
    add_flow_edge("f2", "act_agent", "space_workspace", "2. Pilote son cockpit\net traite ses tickets", "#D97706")
    add_flow_edge("f3", "act_manager", "space_workspace", "3. Supervise les files\net qualifie l'équipe", "#7C3AED")
    add_flow_edge("f4", "act_admin", "space_workspace", "4. Administre l'espace\net la politique IA", "#2563EB")
    add_flow_edge("f5", "act_devops", "layer_data", "10. Supervision de l'infrastructure\net certification des entreprises", "#475569", dashed=True)

    # Flux Espaces vers Modules
    add_flow_edge("f6", "space_public", "mod_conv", "5. Démarre un tchat direct\n(Session par jeton cryptographique)", "#0D9488")
    add_flow_edge("f7", "mod_conv", "mod_tickets", "6. Élévation de conversation\nen Ticket SAV formel", "#7C3AED")
    add_flow_edge("f8", "space_workspace", "mod_tickets", "Prise en charge &amp; résolution", "#2563EB")
    add_flow_edge("f9", "space_workspace", "mod_team", "Gestion des présences &amp; agences", "#D97706")

    # Flux IA vers Humain (Escalade)
    add_flow_edge("f10", "mod_ai", "mod_conv", "7. Réponse automatique RAG\nou assistance au conseiller", "#4F46E5", dashed=True)
    add_flow_edge("f11", "mod_ai", "mod_tickets", "8. Escalade automatique\nsi insatisfaction ou litige > 50k", "#DC2626", dashed=True)

    # Sauvegarde XML native Draw.io
    tree = ET.ElementTree(mxfile)
    ET.indent(tree, space="  ", level=0)

    out_drawio_path = os.path.join(out_dir, "Zadesk_Architecture_Fonctionnelle.drawio")
    tree.write(out_drawio_path, encoding="utf-8", xml_declaration=False)
    print(f"Écrit avec succès : {out_drawio_path} ({os.path.getsize(out_drawio_path):,} octets)")

    # Génération SVG synchrone
    generate_svg_export(out_dir)

def generate_svg_export(out_dir):
    width = 2100
    height = 1250
    svg = []
    svg.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
<defs>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
        text {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
        .title {{ font-size: 23px; font-weight: 700; fill: #0F172A; text-anchor: middle; }}
        .subtitle {{ font-size: 13px; font-weight: 400; fill: #475569; text-anchor: middle; }}
        .sec-title {{ font-size: 13px; font-weight: 700; fill: #1E3A8A; }}
        .card {{ rx: 8; ry: 8; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); }}
    </style>
</defs>
<rect width="{width}" height="{height}" fill="#FAFAF9"/>
<text x="{width/2}" y="35" class="title">ARCHITECTURE FONCTIONNELLE DE LA PLATEFORME ZADESK</text>
<text x="{width/2}" y="55" class="subtitle">Cartographie des acteurs, des espaces d'accès, des modules opérationnels (Humain), du module IA cible et de la gouvernance multi-tenant</text>
</svg>''')
    
    out_svg = os.path.join(out_dir, "Zadesk_Architecture_Fonctionnelle.svg")
    with open(out_svg, "w", encoding="utf-8") as f:
        f.write('\n'.join(svg))
    print(f"Écrit SVG : {out_svg}")

if __name__ == "__main__":
    build_functional_diagram()
