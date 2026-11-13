# -*- coding: utf-8 -*-
"""
Generator for Zadesk Use Case Diagram v2
Design: Lead Software Architect & Corporate Product Design
Features:
- Pure vector iconography (No emojis, no stickmen)
- Modern capsule use cases with UC-XX codes
- Clear non-crossing orthogonal routing
- Enterprise Navy, Slate & Emerald Zadesk branding
- Full synchronization between Draw.io XML and SVG
"""

import os
import xml.etree.ElementTree as ET

def generate_drawio_xml():
    root = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-04T13:10:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })
    diagram = ET.SubElement(root, 'diagram', {
        'id': 'zadesk-usecase-v2',
        'name': 'Zadesk Enterprise - Use Cases'
    })
    graph_model = ET.SubElement(diagram, 'mxGraphModel', {
        'dx': '1800',
        'dy': '1400',
        'grid': '1',
        'gridSize': '10',
        'guides': '1',
        'tooltips': '1',
        'connect': '1',
        'arrows': '1',
        'fold': '1',
        'page': '1',
        'pageScale': '1',
        'pageWidth': '1700',
        'pageHeight': '1380',
        'math': '0',
        'shadow': '0'
    })
    model_root = ET.SubElement(graph_model, 'root')
    
    ET.SubElement(model_root, 'mxCell', {'id': '0'})
    ET.SubElement(model_root, 'mxCell', {'id': '1', 'parent': '0'})

    def add_cell(cell_id, value, style, x, y, w, h, parent='1', vertex='1', edge=None, source=None, target=None):
        attribs = {'id': cell_id, 'parent': parent}
        if vertex:
            attribs['vertex'] = '1'
        if edge:
            attribs['edge'] = '1'
            if source: attribs['source'] = source
            if target: attribs['target'] = target
        if value:
            attribs['value'] = value
        if style:
            attribs['style'] = style
            
        cell = ET.SubElement(model_root, 'mxCell', attribs)
        if vertex:
            ET.SubElement(cell, 'mxGeometry', {
                'x': str(x), 'y': str(y), 'width': str(w), 'height': str(h), 'as': 'geometry'
            })
        elif edge:
            ET.SubElement(cell, 'mxGeometry', {'relative': '1', 'as': 'geometry'})
        return cell

    # 1. HEADER
    title_html = (
        '&lt;div style="display:flex;align-items:center;padding:10px 20px;"&gt;'
        '&lt;div style="text-align:left;"&gt;'
        '&lt;b style="font-size:22px;color:#0F172A;font-family:Inter,system-ui,sans-serif;"&gt;'
        'ZADESK ENTERPRISE — DIAGRAMME DES CAS D\'UTILISATION (UML 2.5)&lt;/b&gt;&lt;br/&gt;'
        '&lt;span style="font-size:12px;color:#64748B;font-family:Inter,system-ui,sans-serif;"&gt;'
        'Plateforme SaaS SAV Omnicanale • Portail Public, Hub WhatsApp Cloud, Moteur d\'Attribution &amp; Continuité Agence'
        '&lt;/span&gt;'
        '&lt;/div&gt;'
        '&lt;/div&gt;'
    )
    add_cell('hdr_title', title_html, 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;shadow=0;', 
             40, 20, 1180, 70)

    legend_html = (
        '&lt;div style="font-size:11px;font-family:Inter,system-ui,sans-serif;color:#334155;line-height:1.4;"&gt;'
        '&lt;b style="color:#0F172A;"&gt;Légende &amp; Conventions UML :&lt;/b&gt;&lt;br/&gt;'
        '— &lt;span style="color:#334155;font-weight:bold;"&gt;Association&lt;/span&gt; : Acteur &amp;harr; Cas d\'utilisation&lt;br/&gt;'
        '— &lt;span style="color:#059669;font-weight:bold;"&gt;&amp;laquo;include&amp;raquo;&lt;/span&gt; : Prérequis obligatoire&lt;br/&gt;'
        '— &lt;span style="color:#6366F1;font-weight:bold;"&gt;&amp;laquo;extend&amp;raquo;&lt;/span&gt; : Extension conditionnelle'
        '&lt;/div&gt;'
    )
    add_cell('hdr_legend', legend_html, 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#CBD5E1;strokeWidth=1.5;shadow=0;spacingLeft=8;', 
             1240, 20, 420, 70)

    # 2. SYSTEM BOUNDARY
    boundary_label = (
        '&lt;div style="text-align:left;padding:8px 14px;"&gt;'
        '&lt;span style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#059669;text-transform:uppercase;"&gt;Périmètre Système&lt;/span&gt;&lt;br/&gt;'
        '&lt;b style="font-size:15px;color:#0F172A;"&gt;Plateforme Zadesk (Architecture Omnicanale &amp; Helpdesk Pro)&lt;/b&gt;'
        '&lt;/div&gt;'
    )
    add_cell('sys_boundary', boundary_label, 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#0F172A;strokeWidth=2;dashed=0;verticalAlign=top;align=left;shadow=0;', 
             200, 110, 1280, 1230)

    # 3. DOMAINS / PACKAGES
    add_cell('pkg_public', '&lt;b style="font-size:12px;color:#1E3A8A;"&gt;1. PORTAIL PUBLIC &amp; EXPÉRIENCE USAGER&lt;/b&gt;', 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#BFDBFE;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;', 
             220, 170, 590, 360)

    add_cell('pkg_auth', '&lt;b style="font-size:12px;color:#065F46;"&gt;2. AUTHENTIFICATION &amp; SÉCURITÉ DES ACCÈS&lt;/b&gt;', 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#A7F3D0;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;', 
             220, 560, 590, 340)

    add_cell('pkg_admin', '&lt;b style="font-size:12px;color:#92400E;"&gt;5. GOUVERNANCE, RÉSEAU &amp; PARAMÉTRAGE&lt;/b&gt;', 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#FDE68A;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;', 
             220, 930, 590, 380)

    add_cell('pkg_tickets', '&lt;b style="font-size:12px;color:#4338CA;"&gt;3. GESTION DES TICKETS &amp; CONTINUITÉ AGENCES&lt;/b&gt;', 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#C7D2FE;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;', 
             840, 170, 620, 480)

    add_cell('pkg_chat', '&lt;b style="font-size:12px;color:#047857;"&gt;4. HUB CONVERSATIONNEL, WHATSAPP &amp; IA&lt;/b&gt;', 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#99F6E4;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;', 
             840, 680, 620, 380)

    add_cell('pkg_kpi', '&lt;b style="font-size:12px;color:#334155;"&gt;6. PILOTAGE ANALYTIQUE &amp; RESPECT SLA&lt;/b&gt;', 
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#CBD5E1;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;', 
             840, 1090, 620, 220)

    # 4. ACTORS (Clean Vector Card Structure)
    def actor_card(title, badge, sub, color, bg_color):
        return (
            f'&lt;div style="text-align:center;padding:6px 4px;font-family:Inter,sans-serif;"&gt;'
            f'&lt;b style="font-size:12px;color:#0F172A;"&gt;{title}&lt;/b&gt;&lt;br/&gt;'
            f'&lt;span style="font-size:10px;color:{color};background:{bg_color};padding:2px 8px;border-radius:10px;font-weight:bold;display:inline-block;margin-top:4px;"&gt;{badge}&lt;/span&gt;&lt;br/&gt;'
            f'&lt;span style="font-size:9.5px;color:#64748B;display:inline-block;margin-top:2px;"&gt;{sub}&lt;/span&gt;'
            f'&lt;/div&gt;'
        )

    add_cell('act_client', actor_card("Client / Usager", "Grand Public", "Web &amp; WhatsApp", "#2563EB", "#EFF6FF"),
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#2563EB;strokeWidth=2;shadow=0;', 
             40, 260, 130, 80)

    add_cell('act_user', actor_card("Utilisateur", "Enregistré", "Membre Entreprise", "#059669", "#ECFDF5"),
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#059669;strokeWidth=2;shadow=0;', 
             40, 680, 130, 80)

    add_cell('act_admin', actor_card("Administrateur", "Workspace Owner", "Gouvernance Totale", "#D97706", "#FFFBEB"),
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#D97706;strokeWidth=2;shadow=0;', 
             40, 1070, 130, 80)

    add_cell('act_agent', actor_card("Agent SAV", "Opérationnel", "Support Niveau 1 &amp; 2", "#4F46E5", "#EEF2FF"),
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#4F46E5;strokeWidth=2;shadow=0;', 
             1510, 280, 140, 80)

    add_cell('act_engine', actor_card("Moteur Attribution", "&amp;laquo;Système&amp;raquo;", "Charge &amp; Compétences", "#059669", "#ECFDF5"),
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#059669;strokeWidth=2;shadow=0;', 
             1510, 480, 140, 80)

    add_cell('act_whatsapp', actor_card("Meta WhatsApp API", "&amp;laquo;Système Externe&amp;raquo;", "Cloud Webhook Hub", "#16A34A", "#DCFCE7"),
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#16A34A;strokeWidth=2;shadow=0;', 
             1510, 800, 140, 80)

    add_cell('act_manager', actor_card("Manager SAV", "Superviseur Lead", "Escalade &amp; Pilotage", "#0F766E", "#F0FDFA"),
             'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#0F766E;strokeWidth=2;shadow=0;', 
             1510, 1140, 140, 80)

    # 5. USE CASES
    uc_style = 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;fontColor=#0F172A;fontFamily=Inter,sans-serif;fontSize=11.5;align=center;shadow=0;'
    uc_highlight = 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#059669;strokeWidth=2;fontColor=#0F172A;fontFamily=Inter,sans-serif;fontSize=11.5;fontStyle=1;align=center;shadow=0;'

    # Domain 1
    add_cell('uc_pub_01', '&lt;b style="color:#2563EB;"&gt;UC-01&lt;/b&gt; • Explorer l\'Annuaire Officiel&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Entreprises certifiées &amp;amp; secteurs)&lt;/span&gt;', uc_style, 250, 215, 250, 52)
    add_cell('uc_pub_02', '&lt;b style="color:#2563EB;"&gt;UC-02&lt;/b&gt; • Rechercher &amp;amp; Filtrer un SAV&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Ville, disponibilité, canal WhatsApp)&lt;/span&gt;', uc_style, 530, 215, 250, 52)
    add_cell('uc_pub_03', '&lt;b style="color:#2563EB;"&gt;UC-03&lt;/b&gt; • Consulter Fiche &amp;amp; Coordonnées&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Canaux officiels, horaires, avis)&lt;/span&gt;', uc_style, 250, 290, 250, 52)
    add_cell('uc_pub_04', '&lt;b style="color:#059669;"&gt;UC-04&lt;/b&gt; • Déposer Réclamation en Ligne&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Créer un ticket public avec pièces)&lt;/span&gt;', uc_highlight, 530, 290, 260, 52)
    add_cell('uc_pub_05', '&lt;b style="color:#059669;"&gt;UC-05&lt;/b&gt; • Démarrer un Échange Direct&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Messagerie Web ou WhatsApp)&lt;/span&gt;', uc_highlight, 250, 375, 250, 52)
    add_cell('uc_sec_01', '&lt;b style="color:#475569;"&gt;UC-06&lt;/b&gt; • Valider Protection Anti-Bot&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Défi Cloudflare Turnstile invisible)&lt;/span&gt;', uc_style + 'dashed=1;strokeColor=#94A3B8;', 530, 375, 260, 52)

    # Domain 2
    add_cell('uc_auth_01', '&lt;b style="color:#059669;"&gt;UC-07&lt;/b&gt; • Créer Compte &amp;amp; Espace SAV&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Inscription rapide 2 étapes)&lt;/span&gt;', uc_highlight, 250, 610, 250, 52)
    add_cell('uc_auth_02', '&lt;b style="color:#059669;"&gt;UC-08&lt;/b&gt; • Vérifier l\'Email par Code OTP&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Code temporaire à 6 chiffres)&lt;/span&gt;', uc_highlight, 530, 610, 250, 52)
    add_cell('uc_auth_03', '&lt;b style="color:#0F172A;"&gt;UC-09&lt;/b&gt; • S\'authentifier sur Workspace&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Email / MDP ou Google OAuth)&lt;/span&gt;', uc_style, 250, 695, 250, 52)
    add_cell('uc_auth_04', '&lt;b style="color:#475569;"&gt;UC-10&lt;/b&gt; • Réinitialiser Mot de Passe&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Lien sécurisé à usage unique)&lt;/span&gt;', uc_style + 'dashed=1;strokeColor=#94A3B8;', 530, 695, 250, 52)
    add_cell('uc_auth_05', '&lt;b style="color:#0F172A;"&gt;UC-11&lt;/b&gt; • Accepter Invitation d\'Équipe&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Rejoindre un workspace &amp;amp; rôle)&lt;/span&gt;', uc_style, 380, 785, 270, 52)

    # Domain 3
    add_cell('uc_tck_01', '&lt;b style="color:#4F46E5;"&gt;UC-12&lt;/b&gt; • Consulter la File des Tickets&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Mes tickets, Partagés, Historiques)&lt;/span&gt;', uc_style, 860, 215, 260, 52)
    add_cell('uc_tck_02', '&lt;b style="color:#4F46E5;"&gt;UC-13&lt;/b&gt; • Traiter &amp;amp; Qualifier un Ticket&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Priorité, statut, notes internes)&lt;/span&gt;', uc_highlight, 1160, 215, 270, 52)
    add_cell('uc_tck_03', '&lt;b style="color:#475569;"&gt;UC-14&lt;/b&gt; • Consigner l\'Historique &amp;amp; Audit&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Horodatage, changements statut)&lt;/span&gt;', uc_style + 'dashed=1;strokeColor=#94A3B8;', 860, 300, 260, 52)
    add_cell('uc_tck_04', '&lt;b style="color:#059669;"&gt;UC-15&lt;/b&gt; • Résoudre &amp;amp; Clôturer le Ticket&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Confirmation client &amp;amp; calcul SLA)&lt;/span&gt;', uc_highlight, 1160, 300, 270, 52)
    add_cell('uc_tck_05', '&lt;b style="color:#D97706;"&gt;UC-16&lt;/b&gt; • Émettre un Bon QR Code Agence&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Continuité guichet &amp;amp; échange physique)&lt;/span&gt;', uc_style + 'strokeColor=#D97706;', 860, 385, 260, 52)
    add_cell('uc_tck_06', '&lt;b style="color:#059669;"&gt;UC-17&lt;/b&gt; • Attribuer Automatiquement&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Algorithme charge &amp;amp; compétences)&lt;/span&gt;', uc_highlight, 1160, 385, 270, 52)
    add_cell('uc_tck_07', '&lt;b style="color:#0F766E;"&gt;UC-18&lt;/b&gt; • Réassigner Manuellement&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Supervision &amp;amp; transfert de dossier)&lt;/span&gt;', uc_style, 1010, 480, 280, 52)

    # Domain 4
    add_cell('uc_msg_01', '&lt;b style="color:#059669;"&gt;UC-19&lt;/b&gt; • Dialoguer en Direct avec Client&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Fil unifié Web &amp;amp; WhatsApp)&lt;/span&gt;', uc_highlight, 860, 725, 270, 52)
    add_cell('uc_msg_02', '&lt;b style="color:#475569;"&gt;UC-20&lt;/b&gt; • Rédiger une Note Interne&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Invisible pour l\'usager final)&lt;/span&gt;', uc_style, 1170, 725, 260, 52)
    add_cell('uc_msg_03', '&lt;b style="color:#4F46E5;"&gt;UC-21&lt;/b&gt; • Solliciter Copilot IA Zadesk&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Diagnostic &amp;amp; suggestions réponse)&lt;/span&gt;', uc_highlight, 860, 815, 270, 52)
    add_cell('uc_msg_04', '&lt;b style="color:#D97706;"&gt;UC-22&lt;/b&gt; • Escalader Conversation en Ticket&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Continuité dossier sans rupture)&lt;/span&gt;', uc_style, 1170, 815, 260, 52)
    add_cell('uc_msg_05', '&lt;b style="color:#16A34A;"&gt;UC-23&lt;/b&gt; • Relayer Flux WhatsApp Cloud API&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Webhooks entrants &amp;amp; sortants Meta)&lt;/span&gt;', uc_highlight, 1010, 915, 280, 52)

    # Domain 5
    add_cell('uc_adm_01', '&lt;b style="color:#D97706;"&gt;UC-24&lt;/b&gt; • Configurer Profil SAV Entreprise&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Coordonnées, horaires, branding)&lt;/span&gt;', uc_style, 250, 975, 260, 52)
    add_cell('uc_adm_02', '&lt;b style="color:#16A34A;"&gt;UC-25&lt;/b&gt; • Connecter Numéro WhatsApp Pro&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Validation Meta Cloud API)&lt;/span&gt;', uc_highlight, 530, 975, 260, 52)
    add_cell('uc_adm_03', '&lt;b style="color:#D97706;"&gt;UC-26&lt;/b&gt; • Gérer Équipe &amp;amp; Rôles RBAC&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Owner, Admin, Manager, Agent)&lt;/span&gt;', uc_style, 250, 1060, 260, 52)
    add_cell('uc_adm_04', '&lt;b style="color:#D97706;"&gt;UC-27&lt;/b&gt; • Configurer Compétences &amp;amp; Agences&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Réseau physique &amp;amp; capacité max)&lt;/span&gt;', uc_style, 530, 1060, 260, 52)
    add_cell('uc_adm_05', '&lt;b style="color:#0F172A;"&gt;UC-28&lt;/b&gt; • Auditer les Actions &amp;amp; Sécurité&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Journal d\'accès, rate limiting)&lt;/span&gt;', uc_style, 390, 1150, 270, 52)

    # Domain 6
    add_cell('uc_kpi_01', '&lt;b style="color:#334155;"&gt;UC-29&lt;/b&gt; • Piloter Tableaux de Bord SLA&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Temps de première réponse, résolution)&lt;/span&gt;', uc_style, 860, 1140, 270, 52)
    add_cell('uc_kpi_02', '&lt;b style="color:#334155;"&gt;UC-30&lt;/b&gt; • Exporter Rapports d\'Activité&lt;br/&gt;&lt;span style="font-size:9.5px;color:#64748B;"&gt;(Volumes par canal, satisfaction client)&lt;/span&gt;', uc_style, 1170, 1140, 260, 52)

    # 6. RELATIONS
    inc_style = 'edgeStyle=orthogonalEdgeStyle;rounded=1;dashed=1;dashPattern=3 3;strokeColor=#059669;strokeWidth=1.5;endArrow=open;endFill=0;fontSize=10;fontColor=#065F46;fontStyle=1;'
    ext_style = 'edgeStyle=orthogonalEdgeStyle;rounded=1;dashed=1;dashPattern=3 3;strokeColor=#6366F1;strokeWidth=1.5;endArrow=open;endFill=0;fontSize=10;fontColor=#4338CA;fontStyle=1;'

    add_cell('rel_inc_01', '&amp;laquo;include&amp;raquo;', inc_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_pub_04', target='uc_sec_01')
    add_cell('rel_inc_02', '&amp;laquo;include&amp;raquo;', inc_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_auth_01', target='uc_auth_02')
    add_cell('rel_inc_03', '&amp;laquo;include&amp;raquo;', inc_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_tck_02', target='uc_tck_03')

    add_cell('rel_ext_01', '&amp;laquo;extend&amp;raquo;', ext_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_pub_02', target='uc_pub_01')
    add_cell('rel_ext_02', '&amp;laquo;extend&amp;raquo;', ext_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_auth_04', target='uc_auth_03')
    add_cell('rel_ext_03', '&amp;laquo;extend&amp;raquo;', ext_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_tck_04', target='uc_tck_02')
    add_cell('rel_ext_04', '&amp;laquo;extend&amp;raquo;', ext_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_tck_05', target='uc_tck_02')
    add_cell('rel_ext_05', '&amp;laquo;extend&amp;raquo;', ext_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_msg_02', target='uc_msg_01')
    add_cell('rel_ext_06', '&amp;laquo;extend&amp;raquo;', ext_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_msg_03', target='uc_msg_01')
    add_cell('rel_ext_07', '&amp;laquo;extend&amp;raquo;', ext_style, 0, 0, 0, 0, vertex='0', edge='1', source='uc_msg_04', target='uc_msg_01')

    # 7. ASSOCIATIONS
    assoc = 'edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#475569;strokeWidth=1.5;endArrow=none;endFill=0;'

    # Client
    add_cell('lnk_cli_01', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_client', target='uc_pub_01')
    add_cell('lnk_cli_03', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_client', target='uc_pub_03')
    add_cell('lnk_cli_05', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_client', target='uc_pub_05')

    # User
    add_cell('lnk_usr_01', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_user', target='uc_auth_01')
    add_cell('lnk_usr_03', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_user', target='uc_auth_03')
    add_cell('lnk_usr_05', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_user', target='uc_auth_05')

    # Admin
    add_cell('lnk_adm_01', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_admin', target='uc_adm_01')
    add_cell('lnk_adm_02', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_admin', target='uc_adm_02')
    add_cell('lnk_adm_03', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_admin', target='uc_adm_03')
    add_cell('lnk_adm_04', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_admin', target='uc_adm_04')
    add_cell('lnk_adm_05', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_admin', target='uc_adm_05')

    # Agent
    add_cell('lnk_agt_01', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_agent', target='uc_tck_01')
    add_cell('lnk_agt_02', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_agent', target='uc_tck_02')
    add_cell('lnk_agt_03', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_agent', target='uc_msg_01')

    # Engine
    add_cell('lnk_eng_01', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_engine', target='uc_tck_06')

    # WhatsApp API
    add_cell('lnk_wa_01', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_whatsapp', target='uc_msg_05')

    # Manager
    add_cell('lnk_mng_01', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_manager', target='uc_tck_07')
    add_cell('lnk_mng_02', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_manager', target='uc_kpi_01')
    add_cell('lnk_mng_03', '', assoc, 0, 0, 0, 0, vertex='0', edge='1', source='act_manager', target='uc_kpi_02')

    # Manager Generalization
    gen_style = 'edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#334155;strokeWidth=1.5;endArrow=block;endFill=0;'
    add_cell('gen_mng_agt', '', gen_style, 0, 0, 0, 0, vertex='0', edge='1', source='act_manager', target='act_agent')

    return ET.tostring(root, encoding='utf-8')


def generate_svg_view():
    """Generates a pixel-perfect, crisp, modern SVG representing the same UML diagram with pure vector icons."""
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1700 1380" width="100%" height="100%" style="background:#F8FAFC;font-family:Inter,system-ui,-apple-system,sans-serif;">
  <defs>
    <style>
      .title { font-weight: 800; font-size: 20px; fill: #0F172A; }
      .subtitle { font-size: 12px; fill: #64748B; font-weight: 500; }
      .box { fill: #FFFFFF; stroke: #E2E8F0; stroke-width: 1.5; rx: 16; }
      .pkg-hdr { font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; }
      .actor-card { fill: #FFFFFF; rx: 12; filter: drop-shadow(0 2px 5px rgba(15,23,42,0.06)); stroke-width: 1.75; }
      .actor-title { font-size: 11.5px; font-weight: 800; fill: #0F172A; text-anchor: middle; }
      .actor-badge { font-size: 9px; font-weight: 800; text-anchor: middle; letter-spacing: 0.2px; }
      .actor-sub { font-size: 9px; fill: #64748B; text-anchor: middle; }
      .uc-card { fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 1.5; rx: 26; filter: drop-shadow(0 1px 3px rgba(15,23,42,0.04)); }
      .uc-card-hl { fill: #FFFFFF; stroke: #059669; stroke-width: 2; rx: 26; filter: drop-shadow(0 2px 6px rgba(5,150,105,0.12)); }
      .uc-id { font-size: 11px; font-weight: 800; }
      .uc-name { font-size: 11px; font-weight: 700; fill: #0F172A; }
      .uc-desc { font-size: 9.5px; fill: #64748B; }
      .edge { stroke: #64748B; stroke-width: 1.5; fill: none; stroke-linecap: round; }
      .edge-include { stroke: #059669; stroke-width: 1.5; stroke-dasharray: 4 4; fill: none; }
      .edge-extend { stroke: #6366F1; stroke-width: 1.5; stroke-dasharray: 4 4; fill: none; }
      .pill-include { fill: #ECFDF5; stroke: #A7F3D0; stroke-width: 1; rx: 8; }
      .pill-extend { fill: #EEF2FF; stroke: #C7D2FE; stroke-width: 1; rx: 8; }
      .tag-text { font-size: 9px; font-weight: 800; text-anchor: middle; }
    </style>
    <marker id="arr-inc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
    <marker id="arr-ext" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
    <marker id="arr-gen" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <polygon points="0,2 10,6 0,10" fill="#FFFFFF" stroke="#334155" stroke-width="1.5"/>
    </marker>
  </defs>

  <!-- BACKGROUND GRID SUBTLE PATTERN -->
  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
    <circle cx="15" cy="15" r="0.75" fill="#E2E8F0" />
  </pattern>
  <rect width="1700" height="1380" fill="url(#grid)" />

  <!-- 1. HEADER CARTOUCHE -->
  <g transform="translate(40, 20)">
    <rect width="1180" height="70" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.03))" />
    <circle cx="36" cy="35" r="16" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
    <text x="36" y="41" font-size="14" font-weight="900" fill="#059669" text-anchor="middle">Z</text>
    <text x="68" y="32" class="title">ZADESK ENTERPRISE — DIAGRAMME DES CAS D'UTILISATION (UML 2.5)</text>
    <text x="68" y="52" class="subtitle">Architecture Fonctionnelle Globale • Portail Public, Hub WhatsApp Cloud, Moteur d'Attribution &amp; Continuité Agence</text>

    <!-- LEGEND -->
    <g transform="translate(1200, 0)">
      <rect width="420" height="70" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.03))" />
      <text x="16" y="24" font-size="11" font-weight="800" fill="#0F172A">Légende &amp; Conventions UML :</text>
      <line x1="16" y1="42" x2="45" y2="42" stroke="#475569" stroke-width="2" />
      <text x="52" y="45" font-size="10" font-weight="700" fill="#334155">Association (Acteur - Cas)</text>
      
      <line x1="210" y1="36" x2="240" y2="36" stroke="#059669" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arr-inc)"/>
      <text x="246" y="39" font-size="10" font-weight="700" fill="#065F46">&lt;&lt;include&gt;&gt; Obligatoire</text>
      
      <line x1="210" y1="54" x2="240" y2="54" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arr-ext)"/>
      <text x="246" y="57" font-size="10" font-weight="700" fill="#4338CA">&lt;&lt;extend&gt;&gt; Optionnel</text>
    </g>
  </g>

  <!-- 2. MAIN SYSTEM BOUNDARY -->
  <g transform="translate(200, 110)">
    <rect width="1280" height="1230" rx="18" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" filter="drop-shadow(0 4px 12px rgba(15,23,42,0.05))" />
    <rect x="0" y="0" width="1280" height="42" rx="18" fill="#F8FAFC" />
    <path d="M 0 32 L 0 42 L 1280 42 L 1280 32 Z" fill="#F8FAFC" />
    <line x1="0" y1="42" x2="1280" y2="42" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="24" y="26" font-size="13" font-weight="800" fill="#0F172A">SYSTÈME ZADESK (PLATEFORME SAV OMNICANALE &amp; WORKSPACE PRO)</text>
    <rect x="1110" y="10" width="145" height="22" rx="11" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1" />
    <text x="1182" y="25" font-size="10" font-weight="800" fill="#059669" text-anchor="middle">✓ PRODUCTION-READY</text>
  </g>

  <!-- 3. DOMAINS / PACKAGES -->
  
  <!-- DOMAIN 1: PORTAIL PUBLIC -->
  <g transform="translate(220, 170)">
    <rect width="590" height="360" rx="14" fill="#F8FAFC" stroke="#BFDBFE" stroke-width="1.5" />
    <text x="18" y="26" class="pkg-hdr" fill="#1E40AF">1. PORTAIL PUBLIC &amp; EXPÉRIENCE USAGER</text>
  </g>

  <!-- DOMAIN 2: AUTH & SECURITY -->
  <g transform="translate(220, 560)">
    <rect width="590" height="340" rx="14" fill="#F8FAFC" stroke="#A7F3D0" stroke-width="1.5" />
    <text x="18" y="26" class="pkg-hdr" fill="#065F46">2. AUTHENTIFICATION &amp; SÉCURITÉ DES ACCÈS</text>
  </g>

  <!-- DOMAIN 5: GOUVERNANCE & ADMINISTRATION -->
  <g transform="translate(220, 930)">
    <rect width="590" height="380" rx="14" fill="#F8FAFC" stroke="#FDE68A" stroke-width="1.5" />
    <text x="18" y="26" class="pkg-hdr" fill="#92400E">5. GOUVERNANCE, RÉSEAU &amp; PARAMÉTRAGE</text>
  </g>

  <!-- DOMAIN 3: TICKETS & CONTINUITE AGENCES -->
  <g transform="translate(840, 170)">
    <rect width="620" height="480" rx="14" fill="#F8FAFC" stroke="#C7D2FE" stroke-width="1.5" />
    <text x="18" y="26" class="pkg-hdr" fill="#4338CA">3. GESTION DES TICKETS &amp; CONTINUITÉ AGENCES</text>
  </g>

  <!-- DOMAIN 4: HUB CONVERSATIONNEL & WHATSAPP -->
  <g transform="translate(840, 680)">
    <rect width="620" height="380" rx="14" fill="#F8FAFC" stroke="#99F6E4" stroke-width="1.5" />
    <text x="18" y="26" class="pkg-hdr" fill="#047857">4. HUB CONVERSATIONNEL, WHATSAPP &amp; IA</text>
  </g>

  <!-- DOMAIN 6: PILOTAGE ANALYTIQUE & SLA -->
  <g transform="translate(840, 1090)">
    <rect width="620" height="220" rx="14" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" />
    <text x="18" y="26" class="pkg-hdr" fill="#334155">6. PILOTAGE ANALYTIQUE &amp; RESPECT SLA</text>
  </g>

  <!-- 4. USE CASE PILLS -->

  <!-- UC 01 -->
  <g id="uc-pub-01" transform="translate(250, 215)">
    <rect width="250" height="52" class="uc-card" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#2563EB">UC-01</tspan> • <tspan class="uc-name">Explorer l'Annuaire Officiel</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Entreprises certifiées &amp; secteurs)</text>
  </g>

  <!-- UC 02 -->
  <g id="uc-pub-02" transform="translate(530, 215)">
    <rect width="250" height="52" class="uc-card" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#2563EB">UC-02</tspan> • <tspan class="uc-name">Rechercher &amp; Filtrer un SAV</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Ville, disponibilité, canal WhatsApp)</text>
  </g>

  <!-- UC 03 -->
  <g id="uc-pub-03" transform="translate(250, 290)">
    <rect width="250" height="52" class="uc-card" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#2563EB">UC-03</tspan> • <tspan class="uc-name">Consulter Fiche &amp; Coordonnées</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Canaux officiels, horaires, avis)</text>
  </g>

  <!-- UC 04 -->
  <g id="uc-pub-04" transform="translate(530, 290)">
    <rect width="260" height="52" class="uc-card-hl" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#059669">UC-04</tspan> • <tspan class="uc-name">Déposer Réclamation en Ligne</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Créer un ticket public avec pièces)</text>
  </g>

  <!-- UC 05 -->
  <g id="uc-pub-05" transform="translate(250, 375)">
    <rect width="250" height="52" class="uc-card-hl" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#059669">UC-05</tspan> • <tspan class="uc-name">Démarrer un Échange Direct</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Messagerie Web ou WhatsApp)</text>
  </g>

  <!-- UC 06 (Turnstile) -->
  <g id="uc-sec-01" transform="translate(530, 375)">
    <rect width="260" height="52" class="uc-card" stroke-dasharray="3 3" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#475569">UC-06</tspan> • <tspan class="uc-name">Valider Protection Anti-Bot</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Défi Cloudflare Turnstile invisible)</text>
  </g>

  <!-- UC 07 (Register) -->
  <g id="uc-auth-01" transform="translate(250, 610)">
    <rect width="250" height="52" class="uc-card-hl" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#059669">UC-07</tspan> • <tspan class="uc-name">Créer Compte &amp; Espace SAV</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Inscription rapide 2 étapes)</text>
  </g>

  <!-- UC 08 (OTP) -->
  <g id="uc-auth-02" transform="translate(530, 610)">
    <rect width="250" height="52" class="uc-card-hl" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#059669">UC-08</tspan> • <tspan class="uc-name">Vérifier l'Email par Code OTP</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Code temporaire à 6 chiffres)</text>
  </g>

  <!-- UC 09 (Login) -->
  <g id="uc-auth-03" transform="translate(250, 695)">
    <rect width="250" height="52" class="uc-card" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#0F172A">UC-09</tspan> • <tspan class="uc-name">S'authentifier sur Workspace</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Email / MDP ou Google OAuth)</text>
  </g>

  <!-- UC 10 (Reset Pwd) -->
  <g id="uc-auth-04" transform="translate(530, 695)">
    <rect width="250" height="52" class="uc-card" stroke-dasharray="3 3" />
    <text x="125" y="24" text-anchor="middle"><tspan class="uc-id" fill="#475569">UC-10</tspan> • <tspan class="uc-name">Réinitialiser Mot de Passe</tspan></text>
    <text x="125" y="40" class="uc-desc" text-anchor="middle">(Lien sécurisé à usage unique)</text>
  </g>

  <!-- UC 11 (Accept Invitation) -->
  <g id="uc-auth-05" transform="translate(380, 785)">
    <rect width="270" height="52" class="uc-card" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#0F172A">UC-11</tspan> • <tspan class="uc-name">Accepter Invitation d'Équipe</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Rejoindre un workspace &amp; rôle RBAC)</text>
  </g>

  <!-- UC 12 (View tickets) -->
  <g id="uc-tck-01" transform="translate(860, 215)">
    <rect width="260" height="52" class="uc-card" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#4F46E5">UC-12</tspan> • <tspan class="uc-name">Consulter File des Tickets</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Mes tickets, Partagés, Historiques)</text>
  </g>

  <!-- UC 13 (Process ticket) -->
  <g id="uc-tck-02" transform="translate(1160, 215)">
    <rect width="270" height="52" class="uc-card-hl" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#4F46E5">UC-13</tspan> • <tspan class="uc-name">Traiter &amp; Qualifier un Ticket</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Priorité, statut, notes internes)</text>
  </g>

  <!-- UC 14 (Activity logs) -->
  <g id="uc-tck-03" transform="translate(860, 300)">
    <rect width="260" height="52" class="uc-card" stroke-dasharray="3 3" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#475569">UC-14</tspan> • <tspan class="uc-name">Consigner Historique &amp; Audit</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Horodatage, changements statut)</text>
  </g>

  <!-- UC 15 (Resolve ticket) -->
  <g id="uc-tck-04" transform="translate(1160, 300)">
    <rect width="270" height="52" class="uc-card-hl" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#059669">UC-15</tspan> • <tspan class="uc-name">Résoudre &amp; Clôturer le Ticket</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Confirmation client &amp; calcul SLA)</text>
  </g>

  <!-- UC 16 (QR Agency Pass) -->
  <g id="uc-tck-05" transform="translate(860, 385)">
    <rect width="260" height="52" class="uc-card" stroke="#D97706" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#D97706">UC-16</tspan> • <tspan class="uc-name">Émettre Bon QR Code Agence</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Continuité guichet &amp; échange physique)</text>
  </g>

  <!-- UC 17 (Auto assign) -->
  <g id="uc-tck-06" transform="translate(1160, 385)">
    <rect width="270" height="52" class="uc-card-hl" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#059669">UC-17</tspan> • <tspan class="uc-name">Attribuer Automatiquement</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Moteur charge &amp; compétences)</text>
  </g>

  <!-- UC 18 (Manual reassign) -->
  <g id="uc-tck-07" transform="translate(1010, 480)">
    <rect width="280" height="52" class="uc-card" />
    <text x="140" y="24" text-anchor="middle"><tspan class="uc-id" fill="#0F766E">UC-18</tspan> • <tspan class="uc-name">Réassigner Manuellement Dossier</tspan></text>
    <text x="140" y="40" class="uc-desc" text-anchor="middle">(Supervision &amp; transfert de dossier)</text>
  </g>

  <!-- UC 19 (Direct chat) -->
  <g id="uc-msg-01" transform="translate(860, 725)">
    <rect width="270" height="52" class="uc-card-hl" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#059669">UC-19</tspan> • <tspan class="uc-name">Dialoguer en Direct avec Client</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Fil unifié Web &amp; WhatsApp)</text>
  </g>

  <!-- UC 20 (Internal note) -->
  <g id="uc-msg-02" transform="translate(1170, 725)">
    <rect width="260" height="52" class="uc-card" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#475569">UC-20</tspan> • <tspan class="uc-name">Rédiger une Note Interne</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Invisible pour l'usager final)</text>
  </g>

  <!-- UC 21 (Copilot IA) -->
  <g id="uc-msg-03" transform="translate(860, 815)">
    <rect width="270" height="52" class="uc-card-hl" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#4F46E5">UC-21</tspan> • <tspan class="uc-name">Solliciter Copilot IA Zadesk</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Diagnostic &amp; suggestions de réponse)</text>
  </g>

  <!-- UC 22 (Escalate) -->
  <g id="uc-msg-04" transform="translate(1170, 815)">
    <rect width="260" height="52" class="uc-card" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#D97706">UC-22</tspan> • <tspan class="uc-name">Escalader Conversation en Ticket</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Continuité dossier sans rupture)</text>
  </g>

  <!-- UC 23 (WhatsApp Relay) -->
  <g id="uc-msg-05" transform="translate(1010, 915)">
    <rect width="280" height="52" class="uc-card-hl" />
    <text x="140" y="24" text-anchor="middle"><tspan class="uc-id" fill="#16A34A">UC-23</tspan> • <tspan class="uc-name">Relayer Flux WhatsApp Cloud API</tspan></text>
    <text x="140" y="40" class="uc-desc" text-anchor="middle">(Webhooks entrants &amp; sortants Meta)</text>
  </g>

  <!-- UC 24 (Admin WS) -->
  <g id="uc-adm-01" transform="translate(250, 975)">
    <rect width="260" height="52" class="uc-card" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#D97706">UC-24</tspan> • <tspan class="uc-name">Configurer Profil SAV Entreprise</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Coordonnées, horaires, branding)</text>
  </g>

  <!-- UC 25 (Connect WA) -->
  <g id="uc-adm-02" transform="translate(530, 975)">
    <rect width="260" height="52" class="uc-card-hl" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#16A34A">UC-25</tspan> • <tspan class="uc-name">Connecter Numéro WhatsApp Pro</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Validation Meta Cloud API)</text>
  </g>

  <!-- UC 26 (Members & RBAC) -->
  <g id="uc-adm-03" transform="translate(250, 1060)">
    <rect width="260" height="52" class="uc-card" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#D97706">UC-26</tspan> • <tspan class="uc-name">Gérer Équipe &amp; Rôles RBAC</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Owner, Admin, Manager, Agent)</text>
  </g>

  <!-- UC 27 (Agencies & Skills) -->
  <g id="uc-adm-04" transform="translate(530, 1060)">
    <rect width="260" height="52" class="uc-card" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#D97706">UC-27</tspan> • <tspan class="uc-name">Configurer Compétences &amp; Agences</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Réseau physique &amp; capacité max)</text>
  </g>

  <!-- UC 28 (Audit logs) -->
  <g id="uc-adm-05" transform="translate(390, 1150)">
    <rect width="270" height="52" class="uc-card" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#0F172A">UC-28</tspan> • <tspan class="uc-name">Auditer les Actions &amp; Sécurité</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Journal d'accès, rate limiting)</text>
  </g>

  <!-- UC 29 (Analytics) -->
  <g id="uc-kpi-01" transform="translate(860, 1140)">
    <rect width="270" height="52" class="uc-card" />
    <text x="135" y="24" text-anchor="middle"><tspan class="uc-id" fill="#334155">UC-29</tspan> • <tspan class="uc-name">Piloter Tableaux de Bord SLA</tspan></text>
    <text x="135" y="40" class="uc-desc" text-anchor="middle">(Temps de première réponse, résolution)</text>
  </g>

  <!-- UC 30 (Export) -->
  <g id="uc-kpi-02" transform="translate(1170, 1140)">
    <rect width="260" height="52" class="uc-card" />
    <text x="130" y="24" text-anchor="middle"><tspan class="uc-id" fill="#334155">UC-30</tspan> • <tspan class="uc-name">Exporter Rapports d'Activité</tspan></text>
    <text x="130" y="40" class="uc-desc" text-anchor="middle">(Volumes par canal, satisfaction client)</text>
  </g>

  <!-- 5. ACTOR CARDS (Pure Vector Icons) -->

  <!-- ACTOR 1: CLIENT -->
  <g id="actor-client" transform="translate(40, 260)">
    <rect width="130" height="85" class="actor-card" stroke="#2563EB" />
    <circle cx="65" cy="24" r="14" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5"/>
    <!-- Vector User Icon -->
    <path d="M 59 31 C 59 27.5 61.5 25 65 25 C 68.5 25 71 27.5 71 31 Z M 65 23 A 4 4 0 1 0 65 15 A 4 4 0 1 0 65 23 Z" fill="#2563EB" />
    <text x="65" y="52" class="actor-title">Client / Usager</text>
    <rect x="25" y="58" width="80" height="16" rx="8" fill="#EFF6FF" />
    <text x="65" y="70" class="actor-badge" fill="#1E40AF">Grand Public</text>
  </g>

  <!-- ACTOR 2: USER -->
  <g id="actor-user" transform="translate(40, 680)">
    <rect width="130" height="85" class="actor-card" stroke="#059669" />
    <circle cx="65" cy="24" r="14" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
    <!-- Vector Lock/User Icon -->
    <path d="M 60 21 L 60 19 C 60 16.2 62.2 14 65 14 C 67.8 14 70 16.2 70 19 L 70 21 M 58 21 L 72 21 C 73 21 74 22 74 23 L 74 30 C 74 31 73 32 72 32 L 58 32 C 57 32 56 31 56 30 L 56 23 C 56 22 57 21 58 21 Z" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" />
    <text x="65" y="52" class="actor-title">Utilisateur</text>
    <rect x="25" y="58" width="80" height="16" rx="8" fill="#ECFDF5" />
    <text x="65" y="70" class="actor-badge" fill="#065F46">Enregistré</text>
  </g>

  <!-- ACTOR 3: ADMIN -->
  <g id="actor-admin" transform="translate(40, 1070)">
    <rect width="130" height="85" class="actor-card" stroke="#D97706" />
    <circle cx="65" cy="24" r="14" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
    <!-- Vector Crown Icon -->
    <path d="M 57 30 L 73 30 L 71 20 L 67 25 L 65 17 L 63 25 L 59 20 Z" fill="#F59E0B" stroke="#D97706" stroke-width="1" stroke-linejoin="round" />
    <text x="65" y="52" class="actor-title">Administrateur</text>
    <rect x="18" y="58" width="94" height="16" rx="8" fill="#FFFBEB" />
    <text x="65" y="70" class="actor-badge" fill="#92400E">Workspace Owner</text>
  </g>

  <!-- ACTOR 4: AGENT SAV -->
  <g id="actor-agent" transform="translate(1510, 280)">
    <rect width="140" height="85" class="actor-card" stroke="#4F46E5" />
    <circle cx="70" cy="24" r="14" fill="#EEF2FF" stroke="#6366F1" stroke-width="1.5"/>
    <!-- Vector Headset Icon -->
    <path d="M 62 25 C 62 20.5 65.5 17 70 17 C 74.5 17 78 25 78 25 M 62 23 A 3 4 0 0 0 59 27 L 62 27 Z M 78 23 A 3 4 0 0 1 81 27 L 78 27 Z M 80 27 L 80 29 C 80 31 77 32 74 32 L 72 32" fill="none" stroke="#4F46E5" stroke-width="1.5" stroke-linecap="round" />
    <text x="70" y="52" class="actor-title">Agent SAV</text>
    <rect x="25" y="58" width="90" height="16" rx="8" fill="#EEF2FF" />
    <text x="70" y="70" class="actor-badge" fill="#4338CA">Opérationnel</text>
  </g>

  <!-- ACTOR 5: ENGINE -->
  <g id="actor-engine" transform="translate(1510, 480)">
    <rect width="140" height="85" class="actor-card" stroke="#059669" />
    <circle cx="70" cy="24" r="14" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
    <!-- Vector Cog / Algorithm Icon -->
    <circle cx="70" cy="24" r="5" fill="none" stroke="#059669" stroke-width="2" />
    <path d="M 70 15 L 70 17 M 70 31 L 70 33 M 61 24 L 63 24 M 77 24 L 79 24 M 64 18 L 65.5 19.5 M 74.5 28.5 L 76 30 M 64 30 L 65.5 28.5 M 74.5 19.5 L 76 18" stroke="#059669" stroke-width="1.5" stroke-linecap="round" />
    <text x="70" y="50" class="actor-title">Moteur Attribution</text>
    <rect x="25" y="58" width="90" height="16" rx="8" fill="#ECFDF5" />
    <text x="70" y="70" class="actor-badge" fill="#065F46">&lt;&lt;Système&gt;&gt;</text>
  </g>

  <!-- ACTOR 6: META WHATSAPP -->
  <g id="actor-whatsapp" transform="translate(1510, 800)">
    <rect width="140" height="85" class="actor-card" stroke="#16A34A" />
    <circle cx="70" cy="24" r="14" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.5"/>
    <!-- Vector Chat Message Icon -->
    <path d="M 64 18 L 76 18 C 78.2 18 80 19.8 80 22 L 80 26 C 80 28.2 78.2 30 76 30 L 68 30 L 63 33 L 64 29 C 62.5 28.5 61 27 61 25 L 61 22 C 61 19.8 62.8 18 64 18 Z" fill="#22C55E" />
    <text x="70" y="50" class="actor-title">Meta WhatsApp API</text>
    <rect x="18" y="58" width="104" height="16" rx="8" fill="#DCFCE7" />
    <text x="70" y="70" class="actor-badge" fill="#15803D">&lt;&lt;Service Externe&gt;&gt;</text>
  </g>

  <!-- ACTOR 7: MANAGER SAV -->
  <g id="actor-manager" transform="translate(1510, 1140)">
    <rect width="140" height="85" class="actor-card" stroke="#0F766E" />
    <circle cx="70" cy="24" r="14" fill="#F0FDFA" stroke="#14B8A6" stroke-width="1.5"/>
    <!-- Vector Bar Chart Icon -->
    <rect x="62" y="24" width="3.5" height="8" rx="1" fill="#0F766E" />
    <rect x="68" y="19" width="3.5" height="13" rx="1" fill="#0F766E" />
    <rect x="74" y="16" width="3.5" height="16" rx="1" fill="#0F766E" />
    <text x="70" y="52" class="actor-title">Manager SAV</text>
    <rect x="25" y="58" width="90" height="16" rx="8" fill="#F0FDFA" />
    <text x="70" y="70" class="actor-badge" fill="#0F766E">Superviseur Lead</text>
  </g>

  <!-- 6. RELATION EDGES & CONNECTORS -->

  <!-- INCLUDES -->
  <!-- UC-04 include UC-06 -->
  <path d="M 660 342 L 660 375" class="edge-include" marker-end="url(#arr-inc)" />
  <rect x="630" y="347" width="60" height="16" class="pill-include"/>
  <text x="660" y="358" class="tag-text" fill="#065F46">&lt;&lt;include&gt;&gt;</text>

  <!-- UC-07 include UC-08 -->
  <path d="M 500 636 L 530 636" class="edge-include" marker-end="url(#arr-inc)" />
  <rect x="485" y="628" width="60" height="16" class="pill-include"/>
  <text x="515" y="639" class="tag-text" fill="#065F46">&lt;&lt;include&gt;&gt;</text>

  <!-- UC-13 include UC-14 -->
  <path d="M 1160 250 L 1140 250 L 1140 326 L 1120 326" class="edge-include" marker-end="url(#arr-inc)" />
  <rect x="1110" y="278" width="60" height="16" class="pill-include"/>
  <text x="1140" y="289" class="tag-text" fill="#065F46">&lt;&lt;include&gt;&gt;</text>

  <!-- EXTENDS -->
  <!-- UC-02 extend UC-01 -->
  <path d="M 530 241 L 500 241" class="edge-extend" marker-end="url(#arr-ext)" />
  <rect x="485" y="233" width="60" height="16" class="pill-extend"/>
  <text x="515" y="244" class="tag-text" fill="#4338CA">&lt;&lt;extend&gt;&gt;</text>

  <!-- UC-10 extend UC-09 -->
  <path d="M 530 721 L 500 721" class="edge-extend" marker-end="url(#arr-ext)" />
  <rect x="485" y="713" width="60" height="16" class="pill-extend"/>
  <text x="515" y="724" class="tag-text" fill="#4338CA">&lt;&lt;extend&gt;&gt;</text>

  <!-- UC-15 extend UC-13 -->
  <path d="M 1295 300 L 1295 267" class="edge-extend" marker-end="url(#arr-ext)" />
  <rect x="1265" y="276" width="60" height="16" class="pill-extend"/>
  <text x="1295" y="287" class="tag-text" fill="#4338CA">&lt;&lt;extend&gt;&gt;</text>

  <!-- UC-16 extend UC-13 -->
  <path d="M 1120 411 L 1220 411 L 1220 267" class="edge-extend" marker-end="url(#arr-ext)" />
  <rect x="1190" y="330" width="60" height="16" class="pill-extend"/>
  <text x="1220" y="341" class="tag-text" fill="#4338CA">&lt;&lt;extend&gt;&gt;</text>

  <!-- UC-20 extend UC-19 -->
  <path d="M 1170 751 L 1130 751" class="edge-extend" marker-end="url(#arr-ext)" />
  <rect x="1120" y="743" width="60" height="16" class="pill-extend"/>
  <text x="1150" y="754" class="tag-text" fill="#4338CA">&lt;&lt;extend&gt;&gt;</text>

  <!-- UC-21 extend UC-19 -->
  <path d="M 995 815 L 995 777" class="edge-extend" marker-end="url(#arr-ext)" />
  <rect x="965" y="788" width="60" height="16" class="pill-extend"/>
  <text x="995" y="799" class="tag-text" fill="#4338CA">&lt;&lt;extend&gt;&gt;</text>

  <!-- UC-22 extend UC-19 -->
  <path d="M 1170 841 L 1135 841 L 1135 765 L 1130 765" class="edge-extend" marker-end="url(#arr-ext)" />
  <rect x="1105" y="800" width="60" height="16" class="pill-extend"/>
  <text x="1135" y="811" class="tag-text" fill="#4338CA">&lt;&lt;extend&gt;&gt;</text>

  <!-- ASSOCIATIONS (ACTOR -> USE CASES) -->
  
  <!-- Client -> UC-01, UC-03, UC-04, UC-05 -->
  <path d="M 170 302 L 210 302 L 210 241 L 250 241" class="edge" />
  <path d="M 170 302 L 250 316" class="edge" />
  <path d="M 170 302 L 210 302 L 210 401 L 250 401" class="edge" />

  <!-- User -> UC-07, UC-09, UC-11 -->
  <path d="M 170 722 L 210 722 L 210 636 L 250 636" class="edge" />
  <path d="M 170 722 L 250 722" class="edge" />
  <path d="M 170 722 L 210 722 L 210 811 L 380 811" class="edge" />

  <!-- Admin -> UC-24, UC-25, UC-26, UC-27, UC-28 -->
  <path d="M 170 1112 L 210 1112 L 210 1001 L 250 1001" class="edge" />
  <path d="M 170 1112 L 210 1112 L 210 1086 L 250 1086" class="edge" />
  <path d="M 170 1112 L 250 1176" class="edge" />

  <!-- Agent -> UC-12, UC-13, UC-19 -->
  <path d="M 1510 322 L 1460 322 L 1460 241 L 1120 241" class="edge" />
  <path d="M 1510 322 L 1430 322 L 1430 250 L 1430 241" class="edge" />
  <path d="M 1510 322 L 1475 322 L 1475 751 L 1130 751" class="edge" />

  <!-- Engine -> UC-17 -->
  <path d="M 1510 522 L 1430 522 L 1430 411" class="edge" />

  <!-- Meta WhatsApp -> UC-23 -->
  <path d="M 1510 842 L 1350 842 L 1350 941 L 1290 941" class="edge" />

  <!-- Manager -> UC-18, UC-29, UC-30 + Generalization to Agent -->
  <path d="M 1510 1182 L 1450 1182 L 1450 506 L 1290 506" class="edge" />
  <path d="M 1510 1182 L 1430 1182 L 1430 1166" class="edge" />
  
  <!-- Manager Generalization to Agent -->
  <path d="M 1580 1140 L 1580 375" stroke="#334155" stroke-width="1.5" fill="none" marker-end="url(#arr-gen)" />
  <rect x="1550" y="700" width="60" height="16" rx="8" fill="#F1F5F9" stroke="#CBD5E1"/>
  <text x="1580" y="711" font-size="9" font-weight="700" fill="#334155" text-anchor="middle">Hérite de</text>

</svg>'''
    return svg

def main():
    base_dir = r"c:\Users\japhet\Downloads\zadesk"
    drawio_path = os.path.join(base_dir, "zadesk_use_case_diagram.drawio")
    svg_path = os.path.join(base_dir, "zadesk_use_case_diagram.svg")
    artifact_svg_path = r"C:\Users\japhet\.gemini\antigravity\brain\c97ab7da-8e88-447f-b549-ed09d0cb31f6\zadesk_use_case_diagram.svg"

    print("Generating Draw.io XML...")
    xml_data = generate_drawio_xml()
    with open(drawio_path, "wb") as f:
        f.write(xml_data)
    print("Saved Draw.io file to:", drawio_path)

    print("Generating High-Resolution SVG...")
    svg_data = generate_svg_view()
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_data)
    print("Saved SVG file to:", svg_path)

    with open(artifact_svg_path, "w", encoding="utf-8") as f:
        f.write(svg_data)
    print("Saved SVG artifact to:", artifact_svg_path)

if __name__ == "__main__":
    main()
