# -*- coding: utf-8 -*-
"""
Script de génération améliorée pour Zadesk_Diagramme_Classes :
- Respecte le design d'origine (couleurs par domaine, cartes arrondies, ombres, 3 compartiments)
- Augmente la taille des tables (largeur 370px, hauteur calculée généreuse pour zéro dépassement)
- Typographie grand format haute lisibilité (titres 18px gras, stéréotypes 12.5px, attributs/méthodes 13.5px monospace)
- Connecteurs orthogonaux nets avec étiquettes blanches en pilule
- Export multi-pages Draw.io (.drawio)
- Export SVG vectoriel autonome avec tous les connecteurs et marqueurs
- Export PNG 300 DPI ultra-net pour insertion dans Word
- Export PDF vectoriel
"""

import os
import shutil
import copy
import xml.etree.ElementTree as ET
import html
import fitz  # PyMuPDF

DOMAIN_THEMES = {
    "workspace": {
        "bg": "#EFF6FF", "border": "#2563EB", "title": "#1D4ED8", "sep": "#93C5FD", "sub": "#3B82F6"
    },
    "user": {
        "bg": "#ECFDF5", "border": "#059669", "title": "#047857", "sep": "#6EE7B7", "sub": "#10B981"
    },
    "agent": {
        "bg": "#FFFBEB", "border": "#D97706", "title": "#B45309", "sep": "#FCD34D", "sub": "#D97706"
    },
    "ticket": {
        "bg": "#FAF5FF", "border": "#7C3AED", "title": "#6D28D9", "sep": "#C4B5FD", "sub": "#8B5CF6"
    },
    "conversation": {
        "bg": "#F0FDFA", "border": "#0D9488", "title": "#0F766E", "sep": "#5EEAD4", "sub": "#14B8A6"
    },
    "ai": {
        "bg": "#EEF2FF", "border": "#4F46E5", "title": "#4338CA", "sep": "#A5B4FC", "sub": "#6366F1", "dashed": True
    },
    "audit": {
        "bg": "#F8FAFC", "border": "#475569", "title": "#1E293B", "sep": "#CBD5E1", "sub": "#64748B"
    }
}

CLASSES_DATA = {
    # ---------------- ZONE 1 : ORGANISATION & MULTI-TENANT ----------------
    "Workspace": {
        "name": "Workspace", "stereo": "entity", "domain": "workspace", "w": 380, "h": 365,
        "attrs": [
            "+ id : text [PK]",
            "+ slug : text [UQ]",
            "+ name : text",
            "+ category : text",
            "+ supportEmail : text?",
            "+ supportPhone : text?",
            "+ isPublic : boolean = true",
            "+ verified : boolean = false"
        ],
        "ops": [
            "+ createTicket() : Ticket",
            "+ addMember() : Membership",
            "+ getCapacityMetrics() : Metrics"
        ]
    },
    "Establishment": {
        "name": "Establishment", "stereo": "entity", "domain": "workspace", "w": 380, "h": 320,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ name : text",
            "+ type : EstablishmentType",
            "+ city : text?",
            "+ isMain : boolean = false",
            "+ isActive : boolean = true"
        ],
        "ops": [
            "+ updateDetails() : void",
            "+ toggleStatus() : void"
        ]
    },
    "Membership": {
        "name": "Membership", "stereo": "entity", "domain": "workspace", "w": 380, "h": 280,
        "attrs": [
            "+ id : text [PK]",
            "+ userId : text [FK]",
            "+ workspaceId : text [FK]",
            "+ role : Role = AGENT",
            "+ status : MembershipStatus"
        ],
        "ops": [
            "+ changeRole(role) : void",
            "+ hasPermission() : boolean"
        ]
    },
    "WorkspaceInvitation": {
        "name": "WorkspaceInvitation", "stereo": "entity", "domain": "workspace", "w": 380, "h": 310,
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
            "+ accept(user) : Membership"
        ]
    },
    "User": {
        "name": "User", "stereo": "entity", "domain": "user", "w": 380, "h": 325,
        "attrs": [
            "+ id : text [PK]",
            "+ email : text [UQ]",
            "+ googleId : text? [UQ]",
            "+ firstName : text",
            "+ lastName : text",
            "+ emailVerified : boolean"
        ],
        "ops": [
            "+ getFullName() : text",
            "+ verifyPassword(raw) : boolean",
            "+ updateProfile(data) : void"
        ]
    },
    "AgentProfile": {
        "name": "AgentProfile", "stereo": "entity", "domain": "agent", "w": 380, "h": 345,
        "attrs": [
            "+ id : text [PK]",
            "+ userId : text [FK]",
            "+ workspaceId : text [FK]",
            "+ title : text = 'Conseiller'",
            "+ availability : AgentAvailability",
            "+ maxCapacity : int = 10",
            "+ autoAssignment : boolean"
        ],
        "ops": [
            "+ setAvailability(s) : void",
            "+ isAvailable() : boolean",
            "+ getActiveTicketsCount() : int"
        ]
    },
    "AssignmentEngine": {
        "name": "AssignmentEngine", "stereo": "service", "domain": "agent", "w": 380, "h": 240,
        "attrs": [
            "- criteria : AssignmentStrategy",
            "- strictAvailability : boolean = true"
        ],
        "ops": [
            "+ autoAssign(ticket) : AgentProfile?",
            "+ calculateScore(agent, tck) : float",
            "+ rebalanceWorkload(wsId) : Report"
        ]
    },
    "Skill": {
        "name": "Skill", "stereo": "entity", "domain": "agent", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ name : text",
            "+ description : text?"
        ],
        "ops": [
            "+ updateSkill(name, desc) : void"
        ]
    },
    "AgentSkill": {
        "name": "AgentSkill", "stereo": "entity", "domain": "agent", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]",
            "+ agentProfileId : text [FK]",
            "+ skillId : text [FK]",
            "+ validatedAt : timestamp?"
        ],
        "ops": [
            "+ validate(validatorId) : void",
            "+ revoke() : void"
        ]
    },

    # ---------------- ZONE 2 : CLIENTS & DEMANDES SAV ----------------
    "Customer": {
        "name": "Customer", "stereo": "entity", "domain": "ticket", "w": 380, "h": 300,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ name : text",
            "+ email : text?",
            "+ phone : text?",
            "+ createdAt : timestamp"
        ],
        "ops": [
            "+ getTicketHistory() : List<Ticket>",
            "+ getConversations() : List<Conv>"
        ]
    },
    "Ticket": {
        "name": "Ticket", "stereo": "entity", "domain": "ticket", "w": 380, "h": 415,
        "attrs": [
            "+ id : text [PK]",
            "+ reference : text [UQ]",
            "+ workspaceId : text [FK]",
            "+ customerId : text [FK]",
            "+ assignedAgentId : text? [FK]",
            "+ title : text",
            "+ priority : TicketPriority",
            "+ status : TicketStatus",
            "+ slaDueAt : timestamp?"
        ],
        "ops": [
            "+ assignToAgent(agent) : void",
            "+ updateStatus(status) : void",
            "+ isSlaBreached() : boolean",
            "+ markResolved(summary) : void"
        ]
    },
    "TicketActivity": {
        "name": "TicketActivity", "stereo": "entity", "domain": "ticket", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]",
            "+ ticketId : text [FK]",
            "+ actorId : text?",
            "+ type : text",
            "+ content : text?"
        ],
        "ops": [
            "+ getFormattedLog() : text"
        ]
    },
    "TicketAssignment": {
        "name": "TicketAssignment", "stereo": "entity", "domain": "ticket", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]",
            "+ ticketId : text [FK]",
            "+ agentProfileId : text [FK]",
            "+ assignedById : text?",
            "+ reason : text?"
        ],
        "ops": [
            "+ getDetails() : text"
        ]
    },
    "TicketShare": {
        "name": "TicketShare", "stereo": "entity", "domain": "ticket", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]",
            "+ ticketId : text [FK]",
            "+ sharedWithUserId : text [FK]",
            "+ accessLevel : ShareAccessLevel"
        ],
        "ops": [
            "+ revoke() : void"
        ]
    },

    # ---------------- ZONE 3 : CONVERSATIONS OMNICANAL ----------------
    "Conversation": {
        "name": "Conversation", "stereo": "entity", "domain": "conversation", "w": 380, "h": 345,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ customerId : text [FK]",
            "+ assignedAgentId : text? [FK]",
            "+ status : ConversationStatus",
            "+ channel : ChannelType",
            "+ lastMessageAt : timestamp"
        ],
        "ops": [
            "+ postMessage(text, type) : Message",
            "+ elevateToTicket(priority) : Ticket",
            "+ closeConversation() : void"
        ]
    },
    "ConversationMessage": {
        "name": "ConversationMessage", "stereo": "entity", "domain": "conversation", "w": 380, "h": 280,
        "attrs": [
            "+ id : text [PK]",
            "+ conversationId : text [FK]",
            "+ senderUserId : text?",
            "+ senderCustomerId : text?",
            "+ type : MessageType",
            "+ body : text"
        ],
        "ops": [
            "+ isInternalNote() : boolean"
        ]
    },
    "ConversationShare": {
        "name": "ConversationShare", "stereo": "entity", "domain": "conversation", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]",
            "+ conversationId : text [FK]",
            "+ sharedWithUserId : text [FK]",
            "+ accessLevel : ShareAccessLevel"
        ],
        "ops": [
            "+ revoke() : void"
        ]
    },

    # ---------------- ZONE 4 : IA & TRAÇABILITÉ ----------------
    "AiAssistantSupervisor": {
        "name": "AiAssistantSupervisor", "stereo": "service", "domain": "ai", "w": 380, "h": 255,
        "attrs": [
            "- modelName : text = 'llama-3.3'",
            "- confidenceThreshold : float = 0.75",
            "- vectorStore : MongoDBAtlas"
        ],
        "ops": [
            "+ handleMessage(msg) : AiResponse",
            "+ retrieveChunks(query) : List<Chunk>",
            "+ shouldEscalate(conf) : boolean"
        ]
    },
    "AiConfiguration": {
        "name": "AiConfiguration", "stereo": "entity", "domain": "ai", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ autonomyMode : AutonomyMode",
            "+ autoEscalate : boolean = true"
        ],
        "ops": [
            "+ setMode(mode) : void"
        ]
    },
    "KnowledgeDocument": {
        "name": "KnowledgeDocument", "stereo": "target_doc", "domain": "ai", "w": 380, "h": 280,
        "attrs": [
            "+ _id : ObjectId [PK]",
            "+ workspaceId : text [Index]",
            "+ title : text",
            "+ category : text",
            "+ status : DocumentStatus"
        ],
        "ops": [
            "+ chunkDocument(size) : List<Chunk>",
            "+ markAsOutdated() : void"
        ]
    },
    "KnowledgeChunk": {
        "name": "KnowledgeChunk", "stereo": "target_doc", "domain": "ai", "w": 380, "h": 255,
        "attrs": [
            "+ _id : ObjectId [PK]",
            "+ documentId : ObjectId [FK]",
            "+ workspaceId : text [Index]",
            "+ chunkIndex : int",
            "+ embedding : float[1536]"
        ],
        "ops": [
            "+ cosineSimilarity(vec) : float"
        ]
    },
    "OutboxEvent": {
        "name": "OutboxEvent", "stereo": "entity", "domain": "audit", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ aggregateType : text",
            "+ eventType : text",
            "+ processed : boolean = false"
        ],
        "ops": [
            "+ markProcessed() : void"
        ]
    },
    "PulseEvent": {
        "name": "PulseEvent", "stereo": "entity", "domain": "audit", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]",
            "+ channel : text",
            "+ eventName : text",
            "+ emittedAt : timestamp"
        ],
        "ops": [
            "+ broadcastSSE(stream) : void"
        ]
    },
    "AuditLog": {
        "name": "AuditLog", "stereo": "entity", "domain": "audit", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]",
            "+ workspaceId : text [FK]",
            "+ actorId : text",
            "+ action : text",
            "+ resource : text"
        ],
        "ops": [
            "+ exportRecord() : text"
        ]
    }
}

# Grille de positionnement optimisée Landscape A4 (5 colonnes de 380px avec 85px de gap)
# Largeur totale : 80 + 5*380 + 4*85 + 80 = 2480 px.
POSITIONS_GLOBAL = {
    # Rangée 1 : Multi-tenant, Utilisateurs, Agents
    "Workspace": (80, 70),
    "Membership": (545, 70),
    "User": (1010, 70),
    "AgentProfile": (1475, 70),
    "Skill": (1940, 70),

    # Rangée 2 : Établissements, Invitations, Moteur d'affectation, Compétences certifiées
    "Establishment": (80, 500),
    "WorkspaceInvitation": (545, 500),
    "AssignmentEngine": (1475, 500),
    "AgentSkill": (1940, 500),

    # Rangée 3 : Clients, Tickets, Activité, Conversations, Messages
    "Customer": (80, 900),
    "Ticket": (545, 900),
    "TicketActivity": (1010, 900),
    "Conversation": (1475, 900),
    "ConversationMessage": (1940, 900),

    # Rangée 4 : Réaffectations, Partage tickets, Partage conversations
    "TicketAssignment": (545, 1385),
    "TicketShare": (1010, 1385),
    "ConversationShare": (1940, 1385),

    # Rangée 5 : IA & Base de connaissances, Outbox, Événements temps réel
    "AiAssistantSupervisor": (80, 1710),
    "KnowledgeDocument": (545, 1710),
    "KnowledgeChunk": (1010, 1710),
    "OutboxEvent": (1475, 1710),
    "PulseEvent": (1940, 1710),

    # Rangée 6 : Configuration IA & Logs d'audit
    "AiConfiguration": (80, 2040),
    "AuditLog": (1475, 2040)
}

EDGES_DATA = [
    # Multi-Tenant & Équipe
    ("e1", "workspace", "membership", "contient\n1 .. 0..*", "composition"),
    ("e2", "workspace", "establishment", "possède\n1 .. 0..*", "composition"),
    ("e3", "user", "membership", "adhère\n1 .. 0..*", "association"),
    ("e4", "user", "workspaceinvitation", "invite\n1 .. 0..*", "association"),
    ("e5", "user", "agentprofile", "incarne\n1 .. 0..*", "association"),
    ("e6", "agentprofile", "agentskill", "détient\n1 .. 0..*", "composition"),
    ("e7", "skill", "agentskill", "qualifie\n1 .. 0..*", "aggregation"),
    ("e8", "assignmentengine", "agentprofile", "évalue", "dependency"),
    ("e9", "assignmentengine", "ticket", "affecte", "dependency"),

    # SAV & Tickets
    ("e10", "workspace", "ticket", "gère\n1 .. 0..*", "composition"),
    ("e11", "customer", "ticket", "soumet\n1 .. 0..*", "association"),
    ("e12", "ticket", "ticketactivity", "historise\n1 .. 1..*", "composition"),
    ("e13", "ticket", "ticketassignment", "retrace\n1 .. 0..*", "composition"),
    ("e14", "ticket", "ticketshare", "partage\n1 .. 0..*", "composition"),
    ("e15", "agentprofile", "ticket", "traite\n0..1 .. 0..*", "directed"),

    # Conversations & Échanges
    ("e16", "customer", "conversation", "échange via\n1 .. 0..*", "association"),
    ("e17", "conversation", "ticket", "élévation\n0..1 .. 0..1", "association"),
    ("e18", "conversation", "conversationmessage", "compose\n1 .. 1..*", "composition"),
    ("e19", "conversation", "conversationshare", "partage\n1 .. 0..*", "composition"),

    # IA & RAG Cible
    ("e20", "workspace", "knowledgedocument", "possède\n1 .. 0..*", "composition"),
    ("e21", "knowledgedocument", "knowledgechunk", "découpé en\n1 .. 1..*", "composition"),
    ("e22", "aiassistantsupervisor", "knowledgechunk", "recherche sémantique", "dependency"),
    ("e23", "aiassistantsupervisor", "conversation", "assiste", "dependency"),
    ("e24", "aiassistantsupervisor", "ticket", "escalade", "dependency"),

    # Fiabilité & Traçabilité
    ("e25", "workspace", "outboxevent", "génère\n1 .. 0..*", "composition"),
    ("e26", "conversationmessage", "pulseevent", "déclenche", "dependency"),
    ("e27", "workspace", "auditlog", "consigne\n1 .. 0..*", "composition")
]

def make_enhanced_class_html(name, stereo, domain_key, attrs, ops):
    th = DOMAIN_THEMES[domain_key]
    lines = []
    
    # En-tête de classe (18px gras avec couleur contrastée)
    lines.append('<div style="text-align:center;padding:10px 0 8px 0;">')
    lines.append(f'<span style="font-size:12.5px;font-weight:700;letter-spacing:0.8px;color:{th["sub"]};font-style:italic;">&laquo;{stereo}&raquo;</span><br/>')
    lines.append(f'<b style="font-size:18px;font-weight:800;color:{th["title"]};font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">{name}</b>')
    lines.append('</div>')

    # Attributs (13.5px JetBrains Mono / Consolas très net, #0F172A, interligne 1.65)
    lines.append(f'<hr style="border:none;border-top:1.8px solid {th["sep"]};margin:6px 0;"/>')
    lines.append('<div style="text-align:left;padding:6px 14px;font-family:\'JetBrains Mono\',Consolas,\'Courier New\',monospace;font-size:13.5px;font-weight:500;color:#0F172A;line-height:1.65;">')
    for a in attrs:
        lines.append(f'{html.escape(a)}<br/>')
    lines.append('</div>')

    # Opérations (13.5px, #1E293B)
    if ops:
        lines.append(f'<hr style="border:none;border-top:1.8px solid {th["sep"]};margin:6px 0;"/>')
        lines.append('<div style="text-align:left;padding:6px 14px;font-family:\'JetBrains Mono\',Consolas,\'Courier New\',monospace;font-size:13.5px;font-weight:500;color:#334155;line-height:1.65;">')
        for op in ops:
            lines.append(f'{html.escape(op)}<br/>')
        lines.append('</div>')

    content = ''.join(lines)
    style = f'verticalAlign=top;align=left;overflow=fill;fontFamily=\'Segoe UI\',Helvetica,Arial,sans-serif;html=1;rounded=1;arcSize=6;shadow=1;fillColor={th["bg"]};strokeColor={th["border"]};strokeWidth=2.0;'
    if th.get("dashed"):
        style += 'dashed=1;dashPattern=6 3;'
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

def create_diagram_page(mxfile, page_id, page_name, width=2480, height=2380):
    diag = ET.SubElement(mxfile, 'diagram', {'id': page_id, 'name': page_name})
    model = ET.SubElement(diag, 'mxGraphModel', {
        'dx': '2200', 'dy': '1400', 'grid': '1', 'gridSize': '10', 'guides': '1',
        'tooltips': '1', 'connect': '1', 'arrows': '1', 'fold': '1', 'page': '1',
        'pageScale': '1', 'pageWidth': str(width), 'pageHeight': str(height),
        'math': '0', 'shadow': '0'
    })
    root = ET.SubElement(model, 'root')
    add_cell(root, '0', '', '', parent=None, vertex=None)
    add_cell(root, '1', '', '', parent='0', vertex=None)
    return root, diag

def add_class_node(root, ckey, x, y, custom_id=None):
    c = CLASSES_DATA[ckey]
    cid = custom_id or ckey.lower()
    val, style = make_enhanced_class_html(c["name"], c["stereo"], c["domain"], c["attrs"], c["ops"])
    add_cell(root, cid, val, style, x, y, c["w"], c["h"])

def add_edge_relation(root, edge_id, src_id, tgt_id, label, rel_type="association", dashed=False):
    style_parts = ['edgeStyle=orthogonalEdgeStyle', 'rounded=1', 'html=1']
    
    if rel_type == "composition":
        style_parts.extend(['strokeColor=#0F172A', 'strokeWidth=2.0', 'startArrow=diamond', 'startFill=1'])
    elif rel_type == "aggregation":
        style_parts.extend(['strokeColor=#0F172A', 'strokeWidth=2.0', 'startArrow=diamond', 'startFill=0'])
    elif rel_type == "directed":
        style_parts.extend(['strokeColor=#2563EB', 'strokeWidth=2.0', 'endArrow=block', 'endFill=1'])
    elif rel_type == "dependency":
        style_parts.extend(['strokeColor=#475569', 'strokeWidth=1.8', 'dashed=1', 'dashPattern=6 4', 'endArrow=open', 'endFill=0'])
    else: # association simple
        style_parts.extend(['strokeColor=#2563EB', 'strokeWidth=2.0', 'endArrow=none'])

    if dashed and rel_type != "dependency":
        style_parts.extend(['dashed=1', 'dashPattern=6 4'])

    style_parts.append('fontColor=#0F172A;fontSize=13;fontFamily=\'Segoe UI\',Helvetica,sans-serif;fontStyle=1;labelBackgroundColor=#FFFFFF;labelBorderColor=#CBD5E1;')
    style_str = ';'.join(style_parts) + ';'

    safe_lbl = html.escape(label).replace('\n', '<br/>')
    add_cell(root, edge_id, safe_lbl, style_str, edge='1', source=src_id, target=tgt_id, vertex=None)

def build_drawio_and_svg():
    width = 2480
    height = 2380

    mxfile_multi = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-22T18:00:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })

    # =========================================================================
    # PAGE 1 : VUE GLOBALE DÉCONDENSÉE (2480 x 2380)
    # =========================================================================
    p1, diag1 = create_diagram_page(mxfile_multi, "page-global", "1. Diagramme Global Zadesk", width=width, height=height)

    for cname, (x, y) in POSITIONS_GLOBAL.items():
        add_class_node(p1, cname, x, y)

    for eid, src, tgt, lbl, rtype in EDGES_DATA:
        add_edge_relation(p1, eid, src, tgt, lbl, rtype)

    # =========================================================================
    # PAGES 2 À 7 : VUES PAR DOMAINE AVEC NOUVELLES TAILLES ET POLICES
    # =========================================================================
    # PAGE 2 : DOMAINE 1 — ENTREPRISES & MULTI-TENANT
    p2, diag2 = create_diagram_page(mxfile_multi, "page-domain1", "2. Entreprises & Multi-Tenant", width=1550, height=950)
    add_class_node(p2, "Workspace", 80, 80, "p2_ws")
    add_class_node(p2, "Establishment", 80, 520, "p2_est")
    add_class_node(p2, "Membership", 540, 80, "p2_memb")
    add_class_node(p2, "WorkspaceInvitation", 540, 420, "p2_inv")
    add_class_node(p2, "User", 1000, 80, "p2_user")
    add_edge_relation(p2, "p2_e1", "p2_ws", "p2_memb", "contient\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e2", "p2_ws", "p2_est", "possède\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e3", "p2_user", "p2_memb", "adhère\n1 .. 0..*", "association")
    add_edge_relation(p2, "p2_e4", "p2_ws", "p2_inv", "émet\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e5", "p2_user", "p2_inv", "invite\n1 .. 0..*", "association")

    # PAGE 3 : DOMAINE 2 — AGENTS & COMPÉTENCES
    p3, diag3 = create_diagram_page(mxfile_multi, "page-domain2", "3. Agents & Compétences", width=1550, height=950)
    add_class_node(p3, "User", 80, 80, "p3_user")
    add_class_node(p3, "AgentProfile", 540, 80, "p3_ag")
    add_class_node(p3, "AssignmentEngine", 540, 490, "p3_as")
    add_class_node(p3, "Skill", 1000, 80, "p3_sk")
    add_class_node(p3, "AgentSkill", 1000, 380, "p3_agsk")
    add_class_node(p3, "Ticket", 80, 480, "p3_tck")
    add_edge_relation(p3, "p3_e1", "p3_user", "p3_ag", "incarne\n1 .. 0..*", "association")
    add_edge_relation(p3, "p3_e2", "p3_ag", "p3_agsk", "détient\n1 .. 0..*", "composition")
    add_edge_relation(p3, "p3_e3", "p3_sk", "p3_agsk", "qualifie\n1 .. 0..*", "aggregation")
    add_edge_relation(p3, "p3_e4", "p3_as", "p3_ag", "évalue", "dependency")
    add_edge_relation(p3, "p3_e5", "p3_as", "p3_tck", "affecte", "dependency")
    add_edge_relation(p3, "p3_e6", "p3_ag", "p3_tck", "traite\n0..1 .. 0..*", "directed")

    # PAGE 4 : DOMAINE 3 — DEMANDES SAV & TICKETS
    p4, diag4 = create_diagram_page(mxfile_multi, "page-domain3", "4. Demandes SAV & Tickets", width=1550, height=1050)
    add_class_node(p4, "Customer", 80, 80, "p4_cust")
    add_class_node(p4, "Ticket", 540, 80, "p4_tck")
    add_class_node(p4, "TicketActivity", 1000, 80, "p4_act")
    add_class_node(p4, "TicketAssignment", 1000, 400, "p4_asn")
    add_class_node(p4, "TicketShare", 1000, 720, "p4_tsh")
    add_class_node(p4, "AgentProfile", 80, 450, "p4_ag")
    add_edge_relation(p4, "p4_e1", "p4_cust", "p4_tck", "soumet\n1 .. 0..*", "association")
    add_edge_relation(p4, "p4_e2", "p4_tck", "p4_act", "historise\n1 .. 1..*", "composition")
    add_edge_relation(p4, "p4_e3", "p4_tck", "p4_asn", "retrace\n1 .. 0..*", "composition")
    add_edge_relation(p4, "p4_e4", "p4_tck", "p4_tsh", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p4, "p4_e5", "p4_ag", "p4_tck", "traite\n0..1 .. 0..*", "directed")

    # PAGE 5 : DOMAINE 4 — CONVERSATIONS OMNICANAL
    p5, diag5 = create_diagram_page(mxfile_multi, "page-domain4", "5. Conversations Omnicanal", width=1450, height=900)
    add_class_node(p5, "Customer", 80, 80, "p5_cust")
    add_class_node(p5, "Conversation", 540, 80, "p5_conv")
    add_class_node(p5, "ConversationMessage", 1000, 80, "p5_msg")
    add_class_node(p5, "ConversationShare", 1000, 430, "p5_csh")
    add_class_node(p5, "Ticket", 80, 450, "p5_tck")
    add_edge_relation(p5, "p5_e1", "p5_cust", "p5_conv", "dialogue via\n1 .. 0..*", "association")
    add_edge_relation(p5, "p5_e2", "p5_conv", "p5_msg", "compose\n1 .. 1..*", "composition")
    add_edge_relation(p5, "p5_e3", "p5_conv", "p5_csh", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p5, "p5_e4", "p5_conv", "p5_tck", "élévation\n0..1 .. 0..1", "association")

    # PAGE 6 : DOMAINE 5 — ASSISTANCE IA & RAG
    p6, diag6 = create_diagram_page(mxfile_multi, "page-domain5", "6. Assistance IA & RAG", width=1550, height=950)
    add_class_node(p6, "KnowledgeDocument", 80, 80, "p6_kd")
    add_class_node(p6, "KnowledgeChunk", 540, 80, "p6_kc")
    add_class_node(p6, "AiAssistantSupervisor", 1000, 80, "p6_ai")
    add_class_node(p6, "AiConfiguration", 80, 430, "p6_aic")
    add_class_node(p6, "Conversation", 1000, 410, "p6_conv")
    add_class_node(p6, "Ticket", 540, 430, "p6_tck")
    add_edge_relation(p6, "p6_e1", "p6_kd", "p6_kc", "découpé en\n1 .. 1..*", "composition")
    add_edge_relation(p6, "p6_e2", "p6_ai", "p6_kc", "recherche sémantique", "dependency")
    add_edge_relation(p6, "p6_e3", "p6_ai", "p6_conv", "assiste", "dependency")
    add_edge_relation(p6, "p6_e4", "p6_ai", "p6_tck", "escalade", "dependency")

    # PAGE 7 : DOMAINE 6 — ÉVÉNEMENTS & AUDIT
    p7, diag7 = create_diagram_page(mxfile_multi, "page-domain7", "7. Événements & Audit", width=1450, height=850)
    add_class_node(p7, "Workspace", 80, 80, "p7_ws")
    add_class_node(p7, "OutboxEvent", 540, 80, "p7_out")
    add_class_node(p7, "PulseEvent", 1000, 80, "p7_pls")
    add_class_node(p7, "AuditLog", 540, 400, "p7_aud")
    add_class_node(p7, "ConversationMessage", 1000, 380, "p7_msg")
    add_edge_relation(p7, "p7_e1", "p7_ws", "p7_out", "génère\n1 .. 0..*", "composition")
    add_edge_relation(p7, "p7_e2", "p7_ws", "p7_aud", "enregistre\n1 .. 0..*", "composition")
    add_edge_relation(p7, "p7_e3", "p7_msg", "p7_pls", "déclenche", "dependency")

    # Sauvegarde du multi-pages dans le dossier racine et dans diagrammes
    tree_multi = ET.ElementTree(mxfile_multi)
    ET.indent(tree_multi, space="  ", level=0)

    root_drawio = "Zadesk_Diagramme_Classes.drawio"
    diag_drawio = os.path.join("diagrammes", "Zadesk_Diagramme_Classes.drawio")
    tree_multi.write(root_drawio, encoding="utf-8", xml_declaration=False)
    tree_multi.write(diag_drawio, encoding="utf-8", xml_declaration=False)
    print(f"Écrit Draw.io : {root_drawio} et {diag_drawio}")

    # Sauvegarde Single-Page Global
    mxfile_single = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-22T18:00:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })
    mxfile_single.append(copy.deepcopy(diag1))
    tree_single = ET.ElementTree(mxfile_single)
    ET.indent(tree_single, space="  ", level=0)
    single_path = os.path.join("diagrammes", "Zadesk_Diagramme_Classes_Global.drawio")
    tree_single.write(single_path, encoding="utf-8", xml_declaration=False)
    print(f"Écrit Draw.io Global : {single_path}")

    # =========================================================================
    # GÉNÉRATION SVG VECTORIEL AUTONOME AVEC CLASSES & CONNECTEURS
    # =========================================================================
    generate_complete_svg(width, height)

def generate_complete_svg(width, height):
    svg = []
    svg.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
<defs>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;family=JetBrains+Mono:wght@500;600&amp;display=swap');
        text {{ font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
        .mono {{ font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace; font-size: 13.5px; font-weight: 500; }}
        .mono-op {{ font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace; font-size: 13.5px; fill: #334155; }}
        .class-stereo {{ font-size: 12.5px; font-weight: 700; letter-spacing: 0.8px; text-anchor: middle; font-style: italic; }}
        .class-title {{ font-size: 18.5px; font-weight: 800; text-anchor: middle; letter-spacing: 0.2px; }}
        .card {{ rx: 8; ry: 8; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.07)); }}
        .rel-line {{ stroke: #2563EB; stroke-width: 2.0; fill: none; }}
        .rel-comp {{ stroke: #0F172A; stroke-width: 2.0; fill: none; }}
        .rel-dash {{ stroke: #475569; stroke-width: 1.8; stroke-dasharray: 7,4; fill: none; }}
        .rel-text {{ font-size: 12.5px; font-weight: 700; fill: #0F172A; text-anchor: middle; }}
        .pill-bg {{ fill: #FFFFFF; stroke: #CBD5E1; stroke-width: 1.2; rx: 5; ry: 5; }}
    </style>
    <marker id="comp-diamond" viewBox="0 0 14 14" refX="1" refY="7" markerWidth="13" markerHeight="13" orient="auto">
        <polygon points="1,7 7,2 13,7 7,12" fill="#0F172A" stroke="#0F172A" stroke-width="1"/>
    </marker>
    <marker id="aggr-diamond" viewBox="0 0 14 14" refX="1" refY="7" markerWidth="13" markerHeight="13" orient="auto">
        <polygon points="1,7 7,2 13,7 7,12" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.0"/>
    </marker>
    <marker id="nav-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto">
        <polygon points="1,2 10,6 1,10" fill="#2563EB"/>
    </marker>
    <marker id="dep-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto">
        <polyline points="2,2 10,6 2,10" fill="none" stroke="#475569" stroke-width="2.0"/>
    </marker>
</defs>

<rect width="{width}" height="{height}" fill="#FAFAFA"/>
''')

    # Génération des connecteurs de relations en SVG avec routage orthogonal précis
    # Calcul des centres et ancres de chaque classe
    anchors = {}
    for name, (x, y) in POSITIONS_GLOBAL.items():
        c = CLASSES_DATA[name]
        w, h = c["w"], c["h"]
        anchors[name.lower()] = {
            "top": (x + w/2, y),
            "bottom": (x + w/2, y + h),
            "left": (x, y + h/2),
            "right": (x + w, y + h/2),
            "center": (x + w/2, y + h/2),
            "rect": (x, y, w, h)
        }

    # Liste des tracés pour les 27 relations
    routes = [
        # Multi-tenant
        ("workspace", "membership", [anchors["workspace"]["right"], anchors["membership"]["left"]], "comp", "contient (1 .. 0..*)"),
        ("workspace", "establishment", [anchors["workspace"]["bottom"], anchors["establishment"]["top"]], "comp", "possède (1 .. 0..*)"),
        ("user", "membership", [anchors["user"]["left"], anchors["membership"]["right"]], "assoc", "adhère (1 .. 0..*)"),
        ("user", "workspaceinvitation", [anchors["user"]["bottom"], (anchors["user"]["bottom"][0], anchors["workspaceinvitation"]["top"][1] - 40), (anchors["workspaceinvitation"]["top"][0] + 50, anchors["workspaceinvitation"]["top"][1] - 40), (anchors["workspaceinvitation"]["top"][0] + 50, anchors["workspaceinvitation"]["top"][1])], "assoc", "invite (1 .. 0..*)"),
        ("user", "agentprofile", [anchors["user"]["right"], anchors["agentprofile"]["left"]], "assoc", "incarne (1 .. 0..*)"),
        ("agentprofile", "agentskill", [anchors["agentprofile"]["bottom"], (anchors["agentprofile"]["bottom"][0], anchors["agentskill"]["top"][1] - 40), (anchors["agentskill"]["top"][0] - 50, anchors["agentskill"]["top"][1] - 40), (anchors["agentskill"]["top"][0] - 50, anchors["agentskill"]["top"][1])], "comp", "détient (1 .. 0..*)"),
        ("skill", "agentskill", [anchors["skill"]["bottom"], anchors["agentskill"]["top"]], "aggr", "qualifie (1 .. 0..*)"),
        ("assignmentengine", "agentprofile", [anchors["assignmentengine"]["top"], anchors["agentprofile"]["bottom"]], "dep", "évalue"),
        ("assignmentengine", "ticket", [anchors["assignmentengine"]["left"], (anchors["assignmentengine"]["left"][0] - 40, anchors["assignmentengine"]["left"][1]), (anchors["assignmentengine"]["left"][0] - 40, anchors["ticket"]["top"][1] - 30), (anchors["ticket"]["top"][0] + 80, anchors["ticket"]["top"][1] - 30), (anchors["ticket"]["top"][0] + 80, anchors["ticket"]["top"][1])], "dep", "affecte"),

        # SAV & Tickets
        ("workspace", "ticket", [anchors["workspace"]["bottom"], (anchors["workspace"]["bottom"][0], anchors["ticket"]["top"][1] - 40), (anchors["ticket"]["top"][0] - 80, anchors["ticket"]["top"][1] - 40), (anchors["ticket"]["top"][0] - 80, anchors["ticket"]["top"][1])], "comp", "gère (1 .. 0..*)"),
        ("customer", "ticket", [anchors["customer"]["right"], anchors["ticket"]["left"]], "assoc", "soumet (1 .. 0..*)"),
        ("ticket", "ticketactivity", [anchors["ticket"]["right"], anchors["ticketactivity"]["left"]], "comp", "historise (1 .. 1..*)"),
        ("ticket", "ticketassignment", [anchors["ticket"]["bottom"], anchors["ticketassignment"]["top"]], "comp", "retrace (1 .. 0..*)"),
        ("ticket", "ticketshare", [anchors["ticket"]["bottom"], (anchors["ticket"]["bottom"][0] + 50, anchors["ticket"]["bottom"][1] + 35), (anchors["ticketshare"]["top"][0], anchors["ticket"]["bottom"][1] + 35), anchors["ticketshare"]["top"]], "comp", "partage (1 .. 0..*)"),
        ("agentprofile", "ticket", [anchors["agentprofile"]["bottom"], (anchors["agentprofile"]["bottom"][0] - 30, anchors["agentprofile"]["bottom"][1] + 30), (anchors["ticket"]["top"][0] + 120, anchors["agentprofile"]["bottom"][1] + 30), (anchors["ticket"]["top"][0] + 120, anchors["ticket"]["top"][1])], "directed", "traite (0..1 .. 0..*)"),

        # Conversations
        ("customer", "conversation", [anchors["customer"]["bottom"], (anchors["customer"]["bottom"][0], anchors["customer"]["bottom"][1] + 30), (anchors["conversation"]["bottom"][0] - 120, anchors["customer"]["bottom"][1] + 30), (anchors["conversation"]["bottom"][0] - 120, anchors["conversation"]["bottom"][1])], "assoc", "échange via (1 .. 0..*)"),
        ("conversation", "ticket", [anchors["conversation"]["left"], anchors["ticket"]["right"]], "assoc", "élévation (0..1 .. 0..1)"),
        ("conversation", "conversationmessage", [anchors["conversation"]["right"], anchors["conversationmessage"]["left"]], "comp", "compose (1 .. 1..*)"),
        ("conversation", "conversationshare", [anchors["conversation"]["bottom"], (anchors["conversation"]["bottom"][0] + 50, anchors["conversation"]["bottom"][1] + 35), (anchors["conversationshare"]["top"][0], anchors["conversation"]["bottom"][1] + 35), anchors["conversationshare"]["top"]], "comp", "partage (1 .. 0..*)"),

        # IA & RAG
        ("workspace", "knowledgedocument", [anchors["workspace"]["bottom"], (anchors["workspace"]["bottom"][0] - 50, anchors["workspace"]["bottom"][1] + 50), (anchors["workspace"]["bottom"][0] - 50, anchors["knowledgedocument"]["top"][1] - 40), (anchors["knowledgedocument"]["top"][0], anchors["knowledgedocument"]["top"][1] - 40), anchors["knowledgedocument"]["top"]], "comp", "possède (1 .. 0..*)"),
        ("knowledgedocument", "knowledgechunk", [anchors["knowledgedocument"]["right"], anchors["knowledgechunk"]["left"]], "comp", "découpé en (1 .. 1..*)"),
        ("aiassistantsupervisor", "knowledgechunk", [anchors["aiassistantsupervisor"]["top"], (anchors["aiassistantsupervisor"]["top"][0], anchors["aiassistantsupervisor"]["top"][1] - 35), (anchors["knowledgechunk"]["top"][0] - 50, anchors["aiassistantsupervisor"]["top"][1] - 35), (anchors["knowledgechunk"]["top"][0] - 50, anchors["knowledgechunk"]["top"][1])], "dep", "recherche sémantique"),
        ("aiassistantsupervisor", "conversation", [anchors["aiassistantsupervisor"]["top"], (anchors["aiassistantsupervisor"]["top"][0] + 50, anchors["aiassistantsupervisor"]["top"][1] - 50), (anchors["conversation"]["bottom"][0] + 80, anchors["aiassistantsupervisor"]["top"][1] - 50), (anchors["conversation"]["bottom"][0] + 80, anchors["conversation"]["bottom"][1])], "dep", "assiste"),
        ("aiassistantsupervisor", "ticket", [anchors["aiassistantsupervisor"]["top"], (anchors["aiassistantsupervisor"]["top"][0], anchors["ticket"]["bottom"][1] + 40), (anchors["ticket"]["bottom"][0] - 60, anchors["ticket"]["bottom"][1] + 40), (anchors["ticket"]["bottom"][0] - 60, anchors["ticket"]["bottom"][1])], "dep", "escalade"),

        # Audit & Fiabilité
        ("workspace", "outboxevent", [anchors["workspace"]["bottom"], (anchors["workspace"]["bottom"][0] + 70, anchors["workspace"]["bottom"][1] + 70), (anchors["workspace"]["bottom"][0] + 70, anchors["outboxevent"]["top"][1] - 45), (anchors["outboxevent"]["top"][0], anchors["outboxevent"]["top"][1] - 45), anchors["outboxevent"]["top"]], "comp", "génère (1 .. 0..*)"),
        ("conversationmessage", "pulseevent", [anchors["conversationmessage"]["bottom"], anchors["pulseevent"]["top"]], "dep", "déclenche"),
        ("workspace", "auditlog", [anchors["workspace"]["bottom"], (anchors["workspace"]["bottom"][0] - 65, anchors["workspace"]["bottom"][1] + 80), (anchors["workspace"]["bottom"][0] - 65, anchors["auditlog"]["top"][1] - 40), (anchors["auditlog"]["top"][0], anchors["auditlog"]["top"][1] - 40), anchors["auditlog"]["top"]], "comp", "consigne (1 .. 0..*)")
    ]

    # Rendu des connecteurs
    for src, tgt, pts, rtype, lbl in routes:
        pts_str = " ".join([f"{p[0]},{p[1]}" for p in pts])
        line_class = "rel-comp" if rtype in ["comp", "aggr"] else ("rel-dash" if rtype == "dep" else "rel-line")
        marker_start = 'marker-start="url(#comp-diamond)"' if rtype == "comp" else ('marker-start="url(#aggr-diamond)"' if rtype == "aggr" else '')
        marker_end = 'marker-end="url(#nav-arrow)"' if rtype == "directed" else ('marker-end="url(#dep-arrow)"' if rtype == "dep" else '')
        
        svg.append(f'<polyline points="{pts_str}" class="{line_class}" {marker_start} {marker_end} />')
        
        # Position du label au milieu du tracé
        mid_idx = len(pts) // 2
        p_a = pts[mid_idx - 1]
        p_b = pts[mid_idx]
        lx = (p_a[0] + p_b[0]) / 2
        ly = (p_a[1] + p_b[1]) / 2 - 10
        
        # Pill label avec fond blanc pour lisibilité parfaite
        lbl_w = len(lbl) * 7.5 + 16
        lbl_h = 22
        svg.append(f'<rect x="{lx - lbl_w/2}" y="{ly - 14}" width="{lbl_w}" height="{lbl_h}" class="pill-bg" />')
        svg.append(f'<text x="{lx}" y="{ly + 1}" class="rel-text">{html.escape(lbl)}</text>')

    # Rendu des 24 classes
    for name, (x, y) in POSITIONS_GLOBAL.items():
        c = CLASSES_DATA[name]
        w, h = c["w"], c["h"]
        th = DOMAIN_THEMES[c["domain"]]
        dashed_attr = 'stroke-dasharray="7,4"' if th.get("dashed") else ''
        svg.append(f'''
<g id="svg-{name.lower()}">
    <rect x="{x}" y="{y}" width="{w}" height="{h}" class="card" fill="{th['bg']}" stroke="{th['border']}" stroke-width="2.0" {dashed_attr}/>
    <text x="{x + w/2}" y="{y + 28}" class="class-stereo" fill="{th['sub']}">&#171;{c['stereo']}&#187;</text>
    <text x="{x + w/2}" y="{y + 52}" class="class-title" fill="{th['title']}">{name}</text>
    <line x1="{x}" y1="{y + 62}" x2="{x + w}" y2="{y + 62}" stroke="{th['sep']}" stroke-width="1.8"/>
''')
        curr_y = y + 86
        for a in c["attrs"]:
            svg.append(f'    <text x="{x + 16}" y="{curr_y}" class="mono" fill="#0F172A">{html.escape(a)}</text>')
            curr_y += 24
        if c["ops"]:
            svg.append(f'    <line x1="{x}" y1="{curr_y}" x2="{x + w}" y2="{curr_y}" stroke="{th["sep"]}" stroke-width="1.8"/>')
            curr_y += 24
            for op in c["ops"]:
                svg.append(f'    <text x="{x + 16}" y="{curr_y}" class="mono-op">{html.escape(op)}</text>')
                curr_y += 24
        svg.append('</g>')

    svg.append('</svg>')
    svg_content = '\n'.join(svg)

    # Écriture dans le dossier racine et dans diagrammes
    root_svg = "Zadesk_Diagramme_Classes.svg"
    diag_svg = os.path.join("diagrammes", "Zadesk_Diagramme_Classes.svg")
    with open(root_svg, "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open(diag_svg, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Écrit SVG autonome : {root_svg} et {diag_svg}")

    # =========================================================================
    # EXPORTS PNG 300 DPI & PDF VECTORIEL VIA PYMUPDF
    # =========================================================================
    doc = fitz.open(stream=svg_content.encode("utf-8"), filetype="svg")
    page = doc[0]
    
    # 2.0x pour une résolution nette (environ 250-300 DPI)
    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
    root_png = "Zadesk_Diagramme_Classes.png"
    diag_png = os.path.join("diagrammes", "Zadesk_Diagramme_Classes.png")
    pix.save(root_png)
    pix.save(diag_png)
    print(f"Écrit PNG 300 DPI ({pix.width}x{pix.height}) : {root_png} et {diag_png}")

    # Export PDF vectoriel
    pdf_bytes = doc.convert_to_pdf()
    root_pdf = "Zadesk_Diagramme_Classes.pdf"
    diag_pdf = os.path.join("diagrammes", "Zadesk_Diagramme_Classes.pdf")
    with open(root_pdf, "wb") as f:
        f.write(pdf_bytes)
    with open(diag_pdf, "wb") as f:
        f.write(pdf_bytes)
    print(f"Écrit PDF vectoriel : {root_pdf} et {diag_pdf}")

if __name__ == "__main__":
    build_drawio_and_svg()
