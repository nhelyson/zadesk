# -*- coding: utf-8 -*-
"""
Script de génération des diagrammes UML Zadesk selon la charte graphique :
- AUCUN encadrement lourd ou boîte grise enfermant les sections
- Suppression de la colonne latérale des 12 énumérations (largeur réduite de 2850 à 1680 px)
- Couleurs distinctes, lumineuses et douces par domaine (Tailwind / Zadesk palette)
- Typographie soignée (en-têtes 14px gras colorés, corps 11px Consolas bien contrasté)
- Conforme à 100% aux spécifications Draw.io / mxGraph (cellule 0 sans parent, cellule 1 parent=0)
"""

import os
import shutil
import copy
import xml.etree.ElementTree as ET
import html

# Palette par domaine (fond pastel lumineux, bordure contrastée, titre foncé, séparateur)
DOMAIN_THEMES = {
    "workspace": {
        "bg": "#EFF6FF", "border": "#3B82F6", "title": "#1E40AF", "sep": "#93C5FD",
        "badge": "MULTI-TENANT & ORGANISATION"
    },
    "user": {
        "bg": "#ECFDF5", "border": "#10B981", "title": "#065F46", "sep": "#6EE7B7",
        "badge": "UTILISATEURS & AUTH"
    },
    "agent": {
        "bg": "#FFFBEB", "border": "#F59E0B", "title": "#92400E", "sep": "#FCD34D",
        "badge": "AGENTS & COMPÉTENCES"
    },
    "ticket": {
        "bg": "#FAF5FF", "border": "#8B5CF6", "title": "#5B21B6", "sep": "#C4B5FD",
        "badge": "DEMANDES SAV & TICKETS"
    },
    "conversation": {
        "bg": "#F0FDFA", "border": "#0D9488", "title": "#0F766E", "sep": "#5EEAD4",
        "badge": "CONVERSATIONS OMNICANAL"
    },
    "ai": {
        "bg": "#EEF2FF", "border": "#6366F1", "title": "#4338CA", "sep": "#A5B4FC",
        "badge": "INTELLIGENCE ARTIFICIELLE & RAG", "dashed": True
    },
    "audit": {
        "bg": "#F8FAFC", "border": "#64748B", "title": "#334155", "sep": "#CBD5E1",
        "badge": "ÉVÉNEMENTS & TRAÇABILITÉ"
    }
}

def make_uml_class_html(name, stereo, theme_key, attrs, ops):
    th = DOMAIN_THEMES[theme_key]
    lines = []
    
    # En-tête de classe
    lines.append('<div style="text-align:center;padding:5px 0 3px 0;">')
    lines.append(f'<span style="font-size:9.5px;font-weight:600;letter-spacing:0.5px;color:{th["title"]};opacity:0.8;">&laquo;{stereo}&raquo;</span><br/>')
    lines.append(f'<b style="font-size:14px;color:{th["title"]};font-family:Helvetica,Arial,sans-serif;">{name}</b>')
    lines.append('</div>')

    # Attributs
    lines.append(f'<hr style="border:none;border-top:1px solid {th["sep"]};margin:4px 0;"/>')
    lines.append('<div style="text-align:left;padding:3px 10px;font-family:Consolas,\'Courier New\',monospace;font-size:11px;color:#1E293B;line-height:1.45;">')
    for a in attrs:
        lines.append(f'{html.escape(a)}<br/>')
    lines.append('</div>')

    # Opérations
    if ops:
        lines.append(f'<hr style="border:none;border-top:1px solid {th["sep"]};margin:4px 0;"/>')
        lines.append('<div style="text-align:left;padding:3px 10px;font-family:Consolas,\'Courier New\',monospace;font-size:11px;color:#475569;line-height:1.45;">')
        for op in ops:
            lines.append(f'{html.escape(op)}<br/>')
        lines.append('</div>')

    content = ''.join(lines)
    style = f'verticalAlign=top;align=left;overflow=fill;fontFamily=Helvetica;html=1;rounded=1;shadow=1;fillColor={th["bg"]};strokeColor={th["border"]};strokeWidth=1.5;'
    if th.get("dashed"):
        style += 'dashed=1;dashPattern=5 3;'
    return content, style

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

def create_diagram_page(mxfile, page_id, page_name, width=1750, height=1750):
    diag = ET.SubElement(mxfile, 'diagram', {'id': page_id, 'name': page_name})
    model = ET.SubElement(diag, 'mxGraphModel', {
        'dx': '1400', 'dy': '900', 'grid': '1', 'gridSize': '10', 'guides': '1',
        'tooltips': '1', 'connect': '1', 'arrows': '1', 'fold': '1', 'page': '1',
        'pageScale': '1', 'pageWidth': str(width), 'pageHeight': str(height),
        'math': '0', 'shadow': '0'
    })
    root = ET.SubElement(model, 'root')
    add_cell(root, '0', '', '', parent=None, vertex=None)
    add_cell(root, '1', '', '', parent='0', vertex=None)
    return root, diag

CLASSES = {
    # ---------------- WORKSPACE ----------------
    "Workspace": {
        "name": "Workspace", "stereo": "entity", "domain": "workspace", "w": 280, "h": 320,
        "attrs": [
            "+ id : text [PK]",
            "+ slug : text [UQ]",
            "+ name : text",
            "+ category : text",
            "+ supportEmail : text?",
            "+ supportPhone : text?",
            "+ supportWhatsApp : text?",
            "+ isPublic : boolean",
            "+ verified : boolean",
            "+ createdAt : timestamp",
            "+ updatedAt : timestamp"
        ],
        "ops": [
            "+ createTicket() : Ticket",
            "+ addMember() : Membership",
            "+ getCapacityMetrics() : Metrics"
        ]
    },
    "Establishment": {
        "name": "Establishment", "stereo": "entity", "domain": "workspace", "w": 280, "h": 240,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ name : text",
            "+ type : EstablishmentType",
            "+ city : text?",
            "+ phone : text?",
            "+ isMain : boolean",
            "+ isActive : boolean",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ updateDetails() : void",
            "+ toggleStatus() : void"
        ]
    },
    "Membership": {
        "name": "Membership", "stereo": "entity", "domain": "workspace", "w": 260, "h": 200,
        "attrs": [
            "+ id : text [PK]",
            "+ userId : text [FK]",
            "+ workspaceId : text [FK]",
            "+ role : Role = AGENT",
            "+ status : MembershipStatus",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ changeRole(role) : void",
            "+ hasPermission() : boolean"
        ]
    },
    "WorkspaceInvitation": {
        "name": "WorkspaceInvitation", "stereo": "entity", "domain": "workspace", "w": 260, "h": 200,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ email : text",
            "+ invitedById : text [FK]",
            "+ token : text [UQ]",
            "+ role : Role = AGENT",
            "+ expiresAt : timestamp"
        ],
        "ops": [
            "+ accept(user) : Membership",
            "+ isExpired() : boolean"
        ]
    },

    # ---------------- USER ----------------
    "User": {
        "name": "User", "stereo": "entity", "domain": "user", "w": 270, "h": 260,
        "attrs": [
            "+ id : text [PK]",
            "+ email : text [UQ]",
            "+ googleId : text? [UQ]",
            "+ firstName : text",
            "+ lastName : text",
            "+ passwordHash : text?",
            "+ emailVerified : boolean",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ getFullName() : text",
            "+ verifyPassword(raw) : boolean",
            "+ updateProfile(data) : void"
        ]
    },

    # ---------------- AGENT ----------------
    "AgentProfile": {
        "name": "AgentProfile", "stereo": "entity", "domain": "agent", "w": 270, "h": 260,
        "attrs": [
            "+ id : text [PK]",
            "+ userId : text [FK]",
            "+ workspaceId : text [FK]",
            "+ title : text = 'Conseiller'",
            "+ availability : AgentAvailability",
            "+ maxCapacity : int = 10",
            "+ autoAssignment : boolean",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ setAvailability(s) : void",
            "+ isAvailable() : boolean",
            "+ getActiveTicketsCount() : int"
        ]
    },
    "AssignmentEngine": {
        "name": "AssignmentEngine", "stereo": "service", "domain": "agent", "w": 270, "h": 180,
        "attrs": [
            "- criteria : AssignmentStrategy",
            "- strictAvailability : boolean"
        ],
        "ops": [
            "+ autoAssign(ticket) : Agent?",
            "+ calculateScore(agent, tck) : float",
            "+ rebalanceWorkload(wsId) : Report"
        ]
    },
    "Skill": {
        "name": "Skill", "stereo": "entity", "domain": "agent", "w": 240, "h": 150,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ name : text",
            "+ description : text?",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ updateSkill(name, desc) : void"
        ]
    },
    "AgentSkill": {
        "name": "AgentSkill", "stereo": "entity", "domain": "agent", "w": 240, "h": 170,
        "attrs": [
            "+ id : text [PK]",
            "+ agentProfileId : text [FK]",
            "+ skillId : text [FK]",
            "+ validatedAt : timestamp?",
            "+ validatedById : text?"
        ],
        "ops": [
            "+ validate(validatorId) : void",
            "+ revoke() : void"
        ]
    },

    # ---------------- TICKET & CUSTOMER ----------------
    "Customer": {
        "name": "Customer", "stereo": "entity", "domain": "ticket", "w": 280, "h": 220,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ name : text",
            "+ email : text?",
            "+ phone : text?",
            "+ createdAt : timestamp",
            "+ updatedAt : timestamp"
        ],
        "ops": [
            "+ getTicketHistory() : List<Ticket>",
            "+ getActiveConversations() : List"
        ]
    },
    "Ticket": {
        "name": "Ticket", "stereo": "entity", "domain": "ticket", "w": 300, "h": 360,
        "attrs": [
            "+ id : text [PK]",
            "+ reference : text [UQ]",
            "+ workspaceId : text [FK]",
            "+ customerId : text [FK]",
            "+ assignedAgentId : text? [FK]",
            "+ establishmentId : text? [FK]",
            "+ conversationId : text? [FK]",
            "+ title : text",
            "+ priority : TicketPriority",
            "+ status : TicketStatus",
            "+ slaDueAt : timestamp?",
            "+ resolvedAt : timestamp?",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ assignToAgent(agent) : void",
            "+ updateStatus(status) : void",
            "+ isSlaBreached() : boolean",
            "+ markResolved(summary) : void"
        ]
    },
    "TicketActivity": {
        "name": "TicketActivity", "stereo": "entity", "domain": "ticket", "w": 280, "h": 180,
        "attrs": [
            "+ id : text [PK]",
            "+ ticketId : text [FK]",
            "+ actorId : text?",
            "+ type : text",
            "+ content : text?",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ getFormattedLog() : text"
        ]
    },
    "TicketAssignment": {
        "name": "TicketAssignment", "stereo": "entity", "domain": "ticket", "w": 270, "h": 180,
        "attrs": [
            "+ id : text [PK]",
            "+ ticketId : text [FK]",
            "+ agentProfileId : text [FK]",
            "+ assignedById : text?",
            "+ reason : text?",
            "+ assignedAt : timestamp"
        ],
        "ops": [
            "+ getDetails() : text"
        ]
    },
    "TicketShare": {
        "name": "TicketShare", "stereo": "entity", "domain": "ticket", "w": 260, "h": 170,
        "attrs": [
            "+ id : text [PK]",
            "+ ticketId : text [FK]",
            "+ sharedWithUserId : text [FK]",
            "+ accessLevel : ShareAccessLevel",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ revoke() : void"
        ]
    },

    # ---------------- CONVERSATION ----------------
    "Conversation": {
        "name": "Conversation", "stereo": "entity", "domain": "conversation", "w": 280, "h": 300,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ customerId : text [FK]",
            "+ assignedAgentId : text? [FK]",
            "+ establishmentId : text? [FK]",
            "+ status : ConversationStatus",
            "+ channel : ChannelType",
            "+ lastMessageAt : timestamp",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ postMessage(text, type) : Message",
            "+ elevateToTicket(priority) : Ticket",
            "+ closeConversation() : void"
        ]
    },
    "ConversationMessage": {
        "name": "ConversationMessage", "stereo": "entity", "domain": "conversation", "w": 260, "h": 200,
        "attrs": [
            "+ id : text [PK]",
            "+ conversationId : text [FK]",
            "+ senderUserId : text?",
            "+ senderCustomerId : text?",
            "+ type : MessageType",
            "+ body : text",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ isInternalNote() : boolean"
        ]
    },
    "ConversationShare": {
        "name": "ConversationShare", "stereo": "entity", "domain": "conversation", "w": 260, "h": 160,
        "attrs": [
            "+ id : text [PK]",
            "+ conversationId : text [FK]",
            "+ sharedWithUserId : text [FK]",
            "+ accessLevel : ShareAccessLevel",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ revoke() : void"
        ]
    },
    "WhatsAppConnection": {
        "name": "WhatsAppConnection", "stereo": "entity", "domain": "conversation", "w": 260, "h": 210,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ phoneNumberId : text",
            "+ businessAccountId : text",
            "+ isActive : boolean = true",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ verifySignature(sig) : boolean",
            "+ sendTemplate(to, tpl) : boolean"
        ]
    },

    # ---------------- AI / RAG ----------------
    "AiAssistantSupervisor": {
        "name": "AiAssistantSupervisor", "stereo": "service", "domain": "ai", "w": 280, "h": 210,
        "attrs": [
            "- modelName : text = 'llama-3.3'",
            "- confidenceThreshold : float = 0.75",
            "- vectorStore : MongoDBAtlas"
        ],
        "ops": [
            "+ handleCustomerMsg(msg) : AiResponse",
            "+ retrieveChunks(query) : List<Chunk>",
            "+ shouldEscalate(conf) : boolean"
        ]
    },
    "KnowledgeDocument": {
        "name": "KnowledgeDocument", "stereo": "target_doc", "domain": "ai", "w": 280, "h": 210,
        "attrs": [
            "+ _id : ObjectId [PK]",
            "+ workspaceId : text [Index]",
            "+ title : text",
            "+ category : text",
            "+ status : DocumentStatus",
            "+ rawContent : text",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ chunkDocument(size) : List<Chunk>",
            "+ markAsOutdated() : void"
        ]
    },
    "KnowledgeChunk": {
        "name": "KnowledgeChunk", "stereo": "target_doc", "domain": "ai", "w": 280, "h": 200,
        "attrs": [
            "+ _id : ObjectId [PK]",
            "+ documentId : ObjectId [FK]",
            "+ workspaceId : text [Index]",
            "+ chunkIndex : int",
            "+ content : text",
            "+ embedding : float[1536]",
            "+ tokenCount : int"
        ],
        "ops": [
            "+ cosineSimilarity(vec) : float"
        ]
    },
    "AiConfiguration": {
        "name": "AiConfiguration", "stereo": "entity", "domain": "ai", "w": 250, "h": 180,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ autonomyMode : AutonomyMode",
            "+ customInstructions : text?",
            "+ autoEscalate : boolean = true",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ setMode(mode) : void"
        ]
    },

    # ---------------- EVENT & AUDIT ----------------
    "OutboxEvent": {
        "name": "OutboxEvent", "stereo": "entity", "domain": "audit", "w": 260, "h": 190,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ aggregateType : text",
            "+ aggregateId : text",
            "+ eventType : text",
            "+ processed : boolean = false",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ markProcessed() : void"
        ]
    },
    "PulseEvent": {
        "name": "PulseEvent", "stereo": "entity", "domain": "audit", "w": 250, "h": 180,
        "attrs": [
            "+ id : text [PK]",
            "+ channel : text",
            "+ eventName : text",
            "+ data : jsonb",
            "+ emittedAt : timestamp"
        ],
        "ops": [
            "+ broadcastSSE(stream) : void"
        ]
    },
    "AuditLog": {
        "name": "AuditLog", "stereo": "entity", "domain": "audit", "w": 260, "h": 200,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ actorId : text",
            "+ action : text",
            "+ resource : text",
            "+ resourceId : text",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ exportRecord() : text"
        ]
    }
}

def add_class_node(root, ckey, x, y, custom_id=None):
    c = CLASSES[ckey]
    cid = custom_id or ckey.lower()
    val, style = make_uml_class_html(c["name"], c["stereo"], c["domain"], c["attrs"], c["ops"])
    add_cell(root, cid, val, style, x, y, c["w"], c["h"])

def add_edge_relation(root, edge_id, src_id, tgt_id, label, rel_type="association", dashed=False):
    style_parts = ['edgeStyle=orthogonalEdgeStyle', 'rounded=1', 'html=1']
    
    if rel_type == "composition":
        style_parts.extend(['strokeColor=#1E293B', 'strokeWidth=1.5', 'startArrow=diamond', 'startFill=1'])
    elif rel_type == "aggregation":
        style_parts.extend(['strokeColor=#1E293B', 'strokeWidth=1.5', 'startArrow=diamond', 'startFill=0'])
    elif rel_type == "directed":
        style_parts.extend(['strokeColor=#2563EB', 'strokeWidth=1.5', 'endArrow=block', 'endFill=1'])
    elif rel_type == "dependency":
        style_parts.extend(['strokeColor=#64748B', 'strokeWidth=1.3', 'dashed=1', 'dashPattern=5 3', 'endArrow=open', 'endFill=0'])
    else: # association simple
        style_parts.extend(['strokeColor=#2563EB', 'strokeWidth=1.5', 'endArrow=none'])

    if dashed and rel_type != "dependency":
        style_parts.extend(['dashed=1', 'dashPattern=5 3'])

    style_parts.append('fontColor=#0F172A;fontSize=11;fontFamily=Helvetica;fontStyle=1;')
    style_str = ';'.join(style_parts) + ';'

    safe_lbl = html.escape(label).replace('\n', '<br/>')
    add_cell(root, edge_id, safe_lbl, style_str, edge='1', source=src_id, target=tgt_id, vertex=None)

def build_vibrant_diagrams():
    out_dir = os.path.abspath("c:/Users/japhet/Downloads/zadesk/diagrammes")
    os.makedirs(out_dir, exist_ok=True)
    domain_dir = os.path.join(out_dir, "domaines")
    os.makedirs(domain_dir, exist_ok=True)

    # =========================================================================
    # FICHIER 1 : MULTI-PAGES COMPLET
    # =========================================================================
    mxfile_multi = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-21T01:00:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })

    # PAGE 1 : VUE GLOBALE HARMONIEUSE (1680 x 1760)
    p1, diag1 = create_diagram_page(mxfile_multi, "page-global", "1. Diagramme Global Zadesk", width=1680, height=1780)

    # Titre Général
    title_html = '<div style="text-align:center;"><b style="font-size:22px;color:#0F172A;font-family:Helvetica,Arial,sans-serif;">ZADESK &#8212; DIAGRAMME DE CLASSES GLOBAL UML 2.x</b><br/><span style="font-size:12.5px;color:#475569;font-family:Helvetica,Arial,sans-serif;">Architecture Métier SaaS Multi-Tenant &#8226; Helpdesk SAV, Omnicanal, Outbox &amp; RAG Cible</span></div>'
    add_cell(p1, 'title_p1', title_html, 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 240, 20, 1200, 50)

    # ----------------------------------------------------
    # PLACEMENT DES CLASSES (SANS AUCUN CADRE ENCOMBRANT)
    # ----------------------------------------------------
    # RANGÉE 1 & 2 : ORGANISATION, COMPTES & ÉQUIPES (y = 90 à 650)
    add_class_node(p1, "Workspace", 60, 90)
    add_class_node(p1, "Establishment", 60, 440)

    add_class_node(p1, "Membership", 380, 90)
    add_class_node(p1, "WorkspaceInvitation", 380, 315)
    add_class_node(p1, "User", 670, 90)

    add_class_node(p1, "AgentProfile", 980, 90)
    add_class_node(p1, "AssignmentEngine", 980, 380)
    add_class_node(p1, "Skill", 1290, 90)
    add_class_node(p1, "AgentSkill", 1290, 270)
    add_class_node(p1, "AiConfiguration", 1290, 470)

    # RANGÉE 3 & 4 : CLIENTS, TICKETS SAV & CONVERSATIONS (y = 710 à 1240)
    add_class_node(p1, "Customer", 60, 710)
    add_class_node(p1, "TicketActivity", 60, 960)

    add_class_node(p1, "Ticket", 380, 680)
    add_class_node(p1, "TicketAssignment", 380, 1070)
    add_class_node(p1, "TicketShare", 680, 1070)

    add_class_node(p1, "Conversation", 720, 680)
    add_class_node(p1, "ConversationMessage", 1040, 680)
    add_class_node(p1, "ConversationShare", 1040, 910)
    add_class_node(p1, "WhatsAppConnection", 1340, 680)

    # RANGÉE 5 : IA / RAG & ÉVÉNEMENTS / AUDIT (y = 1270 à 1720)
    add_class_node(p1, "AiAssistantSupervisor", 60, 1270)
    add_class_node(p1, "KnowledgeDocument", 390, 1270)
    add_class_node(p1, "KnowledgeChunk", 710, 1270)

    add_class_node(p1, "OutboxEvent", 1030, 1270)
    add_class_node(p1, "PulseEvent", 1330, 1270)
    add_class_node(p1, "AuditLog", 1030, 1490)

    # Légende épurée et moderne en bas à droite
    legend_html = '<div style="padding:6px 12px;font-family:Helvetica,Arial,sans-serif;"><b style="font-size:12.5px;color:#0F172A;">Légende Sémantique UML 2.x :</b><hr style="border:none;border-top:1px solid #CBD5E1;margin:4px 0;"/><span style="font-size:11px;color:#334155;line-height:1.5;">&bull; <b>Composition (&#9670;)</b> : Cycle de vie dépendant (cascade)<br/>&bull; <b>Agrégation (&#9671;)</b> : Relation tout-partie partagée<br/>&bull; <b>Association (&#8212;)</b> : Lien métier structurel direct<br/>&bull; <b>Dépendance (- - &gt;)</b> : Appel algorithmique / Déclenchement<br/>&bull; <b style="color:#4338CA;">Cadre tireté bleu</b> : Architecture cible RAG (MongoDB Atlas)</span></div>'
    add_cell(p1, 'legend_p1', legend_html, 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#94A3B8;strokeWidth=1.5;align=left;shadow=1;', 1330, 1490, 290, 190)

    # ----------------------------------------------------
    # CONNECTEURS PROPRES & ORTHOGONAUX (PAGE 1)
    # ----------------------------------------------------
    add_edge_relation(p1, "e1", "workspace", "membership", "contient\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e2", "workspace", "establishment", "possède\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e3", "user", "membership", "adhère\n1 .. 0..*", "association")
    add_edge_relation(p1, "e4", "user", "workspaceinvitation", "invite\n1 .. 0..*", "association")
    add_edge_relation(p1, "e5", "user", "agentprofile", "incarne\n1 .. 0..*", "association")
    add_edge_relation(p1, "e6", "agentprofile", "agentskill", "détient\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e7", "skill", "agentskill", "qualifie\n1 .. 0..*", "aggregation")
    add_edge_relation(p1, "e8", "assignmentengine", "agentprofile", "évalue", "dependency")
    add_edge_relation(p1, "e9", "assignmentengine", "ticket", "affecte", "dependency")

    add_edge_relation(p1, "e10", "workspace", "ticket", "gère\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e11", "customer", "ticket", "soumet\n1 .. 0..*", "association")
    add_edge_relation(p1, "e12", "ticket", "ticketactivity", "historise\n1 .. 1..*", "composition")
    add_edge_relation(p1, "e13", "ticket", "ticketassignment", "retrace\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e14", "ticket", "ticketshare", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e15", "agentprofile", "ticket", "traite\n0..1 .. 0..*", "directed")

    add_edge_relation(p1, "e16", "customer", "conversation", "échange via\n1 .. 0..*", "association")
    add_edge_relation(p1, "e17", "conversation", "ticket", "élévation\n0..1 .. 0..1", "association")
    add_edge_relation(p1, "e18", "conversation", "conversationmessage", "compose\n1 .. 1..*", "composition")
    add_edge_relation(p1, "e19", "conversation", "conversationshare", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e20", "workspace", "whatsappconnection", "connecte\n1 .. 0..1", "composition")

    add_edge_relation(p1, "e21", "workspace", "knowledgedocument", "possède\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e22", "knowledgedocument", "knowledgechunk", "découpé en\n1 .. 1..*", "composition")
    add_edge_relation(p1, "e23", "aiassistantsupervisor", "knowledgechunk", "recherche sémantique", "dependency")
    add_edge_relation(p1, "e24", "aiassistantsupervisor", "conversation", "assiste", "dependency")
    add_edge_relation(p1, "e25", "aiassistantsupervisor", "ticket", "escalade", "dependency")

    add_edge_relation(p1, "e26", "workspace", "outboxevent", "génère\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e27", "conversationmessage", "pulseevent", "déclenche", "dependency")
    add_edge_relation(p1, "e28", "workspace", "auditlog", "consigne\n1 .. 0..*", "composition")

    # =========================================================================
    # PAGES 2 À 7 : VUES SPÉCIALISÉES PAR DOMAINE (AÉRÉES, COULEURS LUMINEUSES)
    # =========================================================================
    # PAGE 2 : DOMAINE 1 — ENTREPRISES & MULTI-TENANT
    p2, diag2 = create_diagram_page(mxfile_multi, "page-domain1", "2. Entreprises & Multi-Tenant", width=1400, height=900)
    add_cell(p2, 't2', '<div style="text-align:center;"><b style="font-size:20px;color:#1E40AF;">DOMAINE 1 : GESTION DES ENTREPRISES &amp; MULTI-TENANT</b><br/><span style="font-size:12px;color:#475569;">Isolation logique Workspace, adhésions contractuelles et agences physiques</span></div>', 'text;html=1;align=center;', 100, 20, 1200, 50)
    add_class_node(p2, "Workspace", 80, 100, "p2_ws")
    add_class_node(p2, "Establishment", 80, 480, "p2_est")
    add_class_node(p2, "Membership", 500, 100, "p2_memb")
    add_class_node(p2, "WorkspaceInvitation", 500, 360, "p2_inv")
    add_class_node(p2, "User", 900, 100, "p2_user")
    add_edge_relation(p2, "p2_e1", "p2_ws", "p2_memb", "contient\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e2", "p2_ws", "p2_est", "possède\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e3", "p2_user", "p2_memb", "adhère\n1 .. 0..*", "association")
    add_edge_relation(p2, "p2_e4", "p2_ws", "p2_inv", "émet\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e5", "p2_user", "p2_inv", "invite\n1 .. 0..*", "association")

    # PAGE 3 : DOMAINE 2 — AGENTS & COMPÉTENCES
    p3, diag3 = create_diagram_page(mxfile_multi, "page-domain2", "3. Agents & Compétences", width=1400, height=900)
    add_cell(p3, 't3', '<div style="text-align:center;"><b style="font-size:20px;color:#92400E;">DOMAINE 2 : GESTION DES AGENTS &amp; COMPÉTENCES MÉTIER</b><br/><span style="font-size:12px;color:#475569;">Profils opérationnels, qualification et moteur d\'affectation déterministe</span></div>', 'text;html=1;align=center;', 100, 20, 1200, 50)
    add_class_node(p3, "User", 80, 100, "p3_user")
    add_class_node(p3, "AgentProfile", 460, 100, "p3_ag")
    add_class_node(p3, "AssignmentEngine", 460, 430, "p3_as")
    add_class_node(p3, "Skill", 880, 100, "p3_sk")
    add_class_node(p3, "AgentSkill", 880, 310, "p3_agsk")
    add_class_node(p3, "Ticket", 80, 430, "p3_tck")
    add_edge_relation(p3, "p3_e1", "p3_user", "p3_ag", "incarne\n1 .. 0..*", "association")
    add_edge_relation(p3, "p3_e2", "p3_ag", "p3_agsk", "détient\n1 .. 0..*", "composition")
    add_edge_relation(p3, "p3_e3", "p3_sk", "p3_agsk", "qualifie\n1 .. 0..*", "aggregation")
    add_edge_relation(p3, "p3_e4", "p3_as", "p3_ag", "évalue", "dependency")
    add_edge_relation(p3, "p3_e5", "p3_as", "p3_tck", "affecte", "dependency")
    add_edge_relation(p3, "p3_e6", "p3_ag", "p3_tck", "traite\n0..1 .. 0..*", "directed")

    # PAGE 4 : DOMAINE 3 — DEMANDES SAV & TICKETS
    p4, diag4 = create_diagram_page(mxfile_multi, "page-domain3", "4. Demandes SAV & Tickets", width=1400, height=950)
    add_cell(p4, 't4', '<div style="text-align:center;"><b style="font-size:20px;color:#5B21B6;">DOMAINE 3 : DEMANDES SAV &amp; GESTION DES TICKETS</b><br/><span style="font-size:12px;color:#475569;">Dossier SAV, engagements de service SLA, partage et journal d\'activités</span></div>', 'text;html=1;align=center;', 100, 20, 1200, 50)
    add_class_node(p4, "Customer", 80, 100, "p4_cust")
    add_class_node(p4, "Ticket", 460, 100, "p4_tck")
    add_class_node(p4, "TicketActivity", 880, 100, "p4_act")
    add_class_node(p4, "TicketAssignment", 880, 330, "p4_asn")
    add_class_node(p4, "TicketShare", 880, 550, "p4_tsh")
    add_class_node(p4, "AgentProfile", 80, 400, "p4_ag")
    add_edge_relation(p4, "p4_e1", "p4_cust", "p4_tck", "soumet\n1 .. 0..*", "association")
    add_edge_relation(p4, "p4_e2", "p4_tck", "p4_act", "historise\n1 .. 1..*", "composition")
    add_edge_relation(p4, "p4_e3", "p4_tck", "p4_asn", "retrace\n1 .. 0..*", "composition")
    add_edge_relation(p4, "p4_e4", "p4_tck", "p4_tsh", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p4, "p4_e5", "p4_ag", "p4_tck", "traite\n0..1 .. 0..*", "directed")

    # PAGE 5 : DOMAINE 4 — CONVERSATIONS OMNICANAL
    p5, diag5 = create_diagram_page(mxfile_multi, "page-domain4", "5. Conversations Omnicanal", width=1400, height=900)
    add_cell(p5, 't5', '<div style="text-align:center;"><b style="font-size:20px;color:#0F766E;">DOMAINE 4 : GESTION DES CONVERSATIONS (PORTAIL &amp; WHATSAPP)</b><br/><span style="font-size:12px;color:#475569;">Dialogue client direct, synchronisation WhatsApp Cloud API et élévation en ticket</span></div>', 'text;html=1;align=center;', 100, 20, 1200, 50)
    add_class_node(p5, "Customer", 80, 100, "p5_cust")
    add_class_node(p5, "Conversation", 460, 100, "p5_conv")
    add_class_node(p5, "ConversationMessage", 860, 100, "p5_msg")
    add_class_node(p5, "ConversationShare", 860, 350, "p5_csh")
    add_class_node(p5, "WhatsAppConnection", 460, 460, "p5_wa")
    add_class_node(p5, "Ticket", 80, 420, "p5_tck")
    add_edge_relation(p5, "p5_e1", "p5_cust", "p5_conv", "dialogue via\n1 .. 0..*", "association")
    add_edge_relation(p5, "p5_e2", "p5_conv", "p5_msg", "compose\n1 .. 1..*", "composition")
    add_edge_relation(p5, "p5_e3", "p5_conv", "p5_csh", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p5, "p5_e4", "p5_conv", "p5_tck", "élévation\n0..1 .. 0..1", "association")

    # PAGE 6 : DOMAINE 5 — ASSISTANCE IA & RAG
    p6, diag6 = create_diagram_page(mxfile_multi, "page-domain5", "6. Assistance IA & RAG", width=1400, height=900)
    add_cell(p6, 't6', '<div style="text-align:center;"><b style="font-size:20px;color:#4338CA;">DOMAINE 5 : ASSISTANCE IA &amp; RAG (ARCHITECTURE CIBLE)</b><br/><span style="font-size:12px;color:#475569;">Corpus vectoriel MongoDB Atlas, modèle Llama et supervision d\'escalade</span></div>', 'text;html=1;align=center;', 100, 20, 1200, 50)
    add_class_node(p6, "KnowledgeDocument", 80, 100, "p6_kd")
    add_class_node(p6, "KnowledgeChunk", 460, 100, "p6_kc")
    add_class_node(p6, "AiAssistantSupervisor", 860, 100, "p6_ai")
    add_class_node(p6, "AiConfiguration", 80, 380, "p6_aic")
    add_class_node(p6, "Conversation", 860, 380, "p6_conv")
    add_class_node(p6, "Ticket", 460, 380, "p6_tck")
    add_edge_relation(p6, "p6_e1", "p6_kd", "p6_kc", "découpé en\n1 .. 1..*", "composition")
    add_edge_relation(p6, "p6_e2", "p6_ai", "p6_kc", "recherche sémantique", "dependency")
    add_edge_relation(p6, "p6_e3", "p6_ai", "p6_conv", "assiste", "dependency")
    add_edge_relation(p6, "p6_e4", "p6_ai", "p6_tck", "escalade", "dependency")

    # PAGE 7 : DOMAINE 6 — ÉVÉNEMENTS & AUDIT
    p7, diag7 = create_diagram_page(mxfile_multi, "page-domain7", "7. Événements & Audit", width=1300, height=850)
    add_cell(p7, 't7', '<div style="text-align:center;"><b style="font-size:20px;color:#334155;">DOMAINE 6 : ÉVÉNEMENTS TEMPS RÉEL (SSE) &amp; AUDIT</b><br/><span style="font-size:12px;color:#475569;">Transactional Outbox Pattern, diffusion SSE cockpits et traçabilité</span></div>', 'text;html=1;align=center;', 100, 20, 1100, 50)
    add_class_node(p7, "Workspace", 80, 100, "p7_ws")
    add_class_node(p7, "OutboxEvent", 460, 100, "p7_out")
    add_class_node(p7, "PulseEvent", 800, 100, "p7_pls")
    add_class_node(p7, "AuditLog", 460, 370, "p7_aud")
    add_class_node(p7, "ConversationMessage", 800, 350, "p7_msg")
    add_edge_relation(p7, "p7_e1", "p7_ws", "p7_out", "génère\n1 .. 0..*", "composition")
    add_edge_relation(p7, "p7_e2", "p7_ws", "p7_aud", "enregistre\n1 .. 0..*", "composition")
    add_edge_relation(p7, "p7_e3", "p7_msg", "p7_pls", "déclenche", "dependency")

    # Sauvegarde du multi-pages
    tree_multi = ET.ElementTree(mxfile_multi)
    ET.indent(tree_multi, space="  ", level=0)

    path_multi_diag = os.path.join(out_dir, "Zadesk_Diagramme_Classes.drawio")
    path_multi_root = "Zadesk_Diagramme_Classes.drawio"

    tree_multi.write(path_multi_diag, encoding="utf-8", xml_declaration=False)
    tree_multi.write(path_multi_root, encoding="utf-8", xml_declaration=False)
    print(f"Écrit avec succès multi-pages : {path_multi_diag}")

    # =========================================================================
    # FICHIER 2 : PAGE UNIQUE GLOBALE (DIRECTE)
    # =========================================================================
    mxfile_single = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-21T01:00:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })
    mxfile_single.append(copy.deepcopy(diag1))
    tree_single = ET.ElementTree(mxfile_single)
    ET.indent(tree_single, space="  ", level=0)

    path_single_diag = os.path.join(out_dir, "Zadesk_Diagramme_Classes_Global.drawio")
    tree_single.write(path_single_diag, encoding="utf-8", xml_declaration=False)
    print(f"Écrit avec succès vue globale directe : {path_single_diag}")

    # =========================================================================
    # FICHIERS DÉDIÉS PAR DOMAINE
    # =========================================================================
    domain_pages = [
        ("1_Entreprises_MultiTenant.drawio", diag2),
        ("2_Agents_Competences.drawio", diag3),
        ("3_Tickets_SAV.drawio", diag4),
        ("4_Conversations_Omnicanal.drawio", diag5),
        ("5_Assistance_IA_RAG.drawio", diag6),
        ("6_Evenements_Audit.drawio", diag7)
    ]
    for dfilename, ddiag in domain_pages:
        d_mxfile = ET.Element('mxfile', {
            'host': 'app.diagrams.net',
            'modified': '2026-11-21T01:00:00.000Z',
            'agent': 'Antigravity / Lead Software Architect',
            'version': '24.7.0'
        })
        d_mxfile.append(copy.deepcopy(ddiag))
        d_tree = ET.ElementTree(d_mxfile)
        ET.indent(d_tree, space="  ", level=0)
        d_path = os.path.join(domain_dir, dfilename)
        d_tree.write(d_path, encoding="utf-8", xml_declaration=False)
        print(f"Écrit domaine : {d_path}")

if __name__ == "__main__":
    build_vibrant_diagrams()
