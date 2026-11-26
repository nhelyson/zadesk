# -*- coding: utf-8 -*-
"""
Générateur DÉFINITIF HAUTE LISIBILITÉ & RESPIRATION (SPACIEUX) :
- AUCUN titre en haut (supprimé selon la demande)
- AUCUNE table WhatsAppConnection (supprimée selon la demande)
- AUCUNE boîte de légende sémantique (supprimée selon la demande)
- AUCUN encadrement lourd
- Disposition spacieuse décondensée :
    * Largeur de canevas 2050 px, Hauteur 1800 px
    * Espaces libres généreux de 80 à 120 px entre colonnes et rangées
    * Zéro sensation d'étouffement ou de briques empilées
- Typographie grand format haute visibilité :
    * Nom de classe : 16 px gras bien visible
    * Attributs : 12 px Consolas demi-gras (#0F172A) avec interligne 1.6
    * Méthodes : 12 px Consolas (#334155) avec interligne 1.6
    * Bordures : strokeWidth=1.8, coins arrondis, ombres légères
- Connecteurs orthogonaux nets avec étiquettes 12 px gras
"""

import os
import shutil
import copy
import xml.etree.ElementTree as ET
import html

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

def make_spacious_class_html(name, stereo, domain_key, attrs, ops):
    th = DOMAIN_THEMES[domain_key]
    lines = []
    
    # En-tête de classe (16px gras avec couleur contrastée)
    lines.append('<div style="text-align:center;padding:8px 0 6px 0;">')
    lines.append(f'<span style="font-size:11px;font-weight:600;letter-spacing:0.5px;color:{th["sub"]};font-style:italic;">&laquo;{stereo}&raquo;</span><br/>')
    lines.append(f'<b style="font-size:16px;color:{th["title"]};font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">{name}</b>')
    lines.append('</div>')

    # Attributs (12px Consolas très net, #0F172A, interligne 1.6)
    lines.append(f'<hr style="border:none;border-top:1.5px solid {th["sep"]};margin:5px 0;"/>')
    lines.append('<div style="text-align:left;padding:4px 12px;font-family:Consolas,\'JetBrains Mono\',\'Courier New\',monospace;font-size:12px;font-weight:500;color:#0F172A;line-height:1.6;">')
    for a in attrs:
        lines.append(f'{html.escape(a)}<br/>')
    lines.append('</div>')

    # Opérations (12px Consolas, #334155)
    if ops:
        lines.append(f'<hr style="border:none;border-top:1.5px solid {th["sep"]};margin:5px 0;"/>')
        lines.append('<div style="text-align:left;padding:4px 12px;font-family:Consolas,\'JetBrains Mono\',\'Courier New\',monospace;font-size:12px;color:#334155;line-height:1.6;">')
        for op in ops:
            lines.append(f'{html.escape(op)}<br/>')
        lines.append('</div>')

    content = ''.join(lines)
    style = f'verticalAlign=top;align=left;overflow=fill;fontFamily=Helvetica;html=1;rounded=1;arcSize=6;shadow=1;fillColor={th["bg"]};strokeColor={th["border"]};strokeWidth=1.8;'
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

def create_diagram_page(mxfile, page_id, page_name, width=2050, height=1800):
    diag = ET.SubElement(mxfile, 'diagram', {'id': page_id, 'name': page_name})
    model = ET.SubElement(diag, 'mxGraphModel', {
        'dx': '1800', 'dy': '1100', 'grid': '1', 'gridSize': '10', 'guides': '1',
        'tooltips': '1', 'connect': '1', 'arrows': '1', 'fold': '1', 'page': '1',
        'pageScale': '1', 'pageWidth': str(width), 'pageHeight': str(height),
        'math': '0', 'shadow': '0'
    })
    root = ET.SubElement(model, 'root')
    add_cell(root, '0', '', '', parent=None, vertex=None)
    add_cell(root, '1', '', '', parent='0', vertex=None)
    return root, diag

CLASSES_DATA = {
    # ---------------- ZONE 1 : ORGANISATION & ÉQUIPE ----------------
    "Workspace": {
        "name": "Workspace", "stereo": "entity", "domain": "workspace", "w": 290, "h": 260,
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
        "name": "Establishment", "stereo": "entity", "domain": "workspace", "w": 290, "h": 210,
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
        "name": "Membership", "stereo": "entity", "domain": "workspace", "w": 270, "h": 180,
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
        "name": "WorkspaceInvitation", "stereo": "entity", "domain": "workspace", "w": 270, "h": 190,
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
        "name": "User", "stereo": "entity", "domain": "user", "w": 280, "h": 220,
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
        "name": "AgentProfile", "stereo": "entity", "domain": "agent", "w": 280, "h": 230,
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
        "name": "AssignmentEngine", "stereo": "service", "domain": "agent", "w": 280, "h": 180,
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
        "name": "Skill", "stereo": "entity", "domain": "agent", "w": 250, "h": 150,
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
        "name": "AgentSkill", "stereo": "entity", "domain": "agent", "w": 250, "h": 160,
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
        "name": "Customer", "stereo": "entity", "domain": "ticket", "w": 290, "h": 210,
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
        "name": "Ticket", "stereo": "entity", "domain": "ticket", "w": 310, "h": 300,
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
        "name": "TicketActivity", "stereo": "entity", "domain": "ticket", "w": 280, "h": 175,
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
        "name": "TicketAssignment", "stereo": "entity", "domain": "ticket", "w": 270, "h": 170,
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
        "name": "TicketShare", "stereo": "entity", "domain": "ticket", "w": 260, "h": 155,
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
        "name": "Conversation", "stereo": "entity", "domain": "conversation", "w": 290, "h": 250,
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
        "name": "ConversationMessage", "stereo": "entity", "domain": "conversation", "w": 270, "h": 180,
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
        "name": "ConversationShare", "stereo": "entity", "domain": "conversation", "w": 270, "h": 150,
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
        "name": "AiAssistantSupervisor", "stereo": "service", "domain": "ai", "w": 290, "h": 200,
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
        "name": "AiConfiguration", "stereo": "entity", "domain": "ai", "w": 290, "h": 165,
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
        "name": "KnowledgeDocument", "stereo": "target_doc", "domain": "ai", "w": 280, "h": 190,
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
        "name": "KnowledgeChunk", "stereo": "target_doc", "domain": "ai", "w": 280, "h": 180,
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
        "name": "OutboxEvent", "stereo": "entity", "domain": "audit", "w": 280, "h": 175,
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
        "name": "PulseEvent", "stereo": "entity", "domain": "audit", "w": 260, "h": 165,
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
        "name": "AuditLog", "stereo": "entity", "domain": "audit", "w": 280, "h": 180,
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

# Positions spacieuses validées (0 collision, 80-120px de respiration)
POSITIONS_GLOBAL = {
    # Zone 1
    "Workspace": (80, 60),
    "Establishment": (80, 390),
    "Membership": (470, 60),
    "WorkspaceInvitation": (470, 300),
    "User": (840, 60),
    "AgentProfile": (1220, 60),
    "AssignmentEngine": (1220, 350),
    "Skill": (1610, 60),
    "AgentSkill": (1610, 270),

    # Zone 2
    "Customer": (80, 670),
    "Ticket": (470, 650),
    "TicketActivity": (880, 650),
    "TicketAssignment": (360, 1030),
    "TicketShare": (710, 1030),

    # Zone 3
    "Conversation": (1250, 650),
    "ConversationMessage": (1640, 650),
    "ConversationShare": (1640, 890),

    # Zone 4
    "AiAssistantSupervisor": (80, 1260),
    "AiConfiguration": (80, 1510),
    "KnowledgeDocument": (470, 1260),
    "KnowledgeChunk": (850, 1260),
    "OutboxEvent": (1250, 1260),
    "PulseEvent": (1630, 1260),
    "AuditLog": (1250, 1490)
}

def add_class_node(root, ckey, x, y, custom_id=None):
    c = CLASSES_DATA[ckey]
    cid = custom_id or ckey.lower()
    val, style = make_spacious_class_html(c["name"], c["stereo"], c["domain"], c["attrs"], c["ops"])
    add_cell(root, cid, val, style, x, y, c["w"], c["h"])

def add_edge_relation(root, edge_id, src_id, tgt_id, label, rel_type="association", dashed=False):
    style_parts = ['edgeStyle=orthogonalEdgeStyle', 'rounded=1', 'html=1']
    
    if rel_type == "composition":
        style_parts.extend(['strokeColor=#0F172A', 'strokeWidth=1.8', 'startArrow=diamond', 'startFill=1'])
    elif rel_type == "aggregation":
        style_parts.extend(['strokeColor=#0F172A', 'strokeWidth=1.8', 'startArrow=diamond', 'startFill=0'])
    elif rel_type == "directed":
        style_parts.extend(['strokeColor=#2563EB', 'strokeWidth=1.8', 'endArrow=block', 'endFill=1'])
    elif rel_type == "dependency":
        style_parts.extend(['strokeColor=#475569', 'strokeWidth=1.5', 'dashed=1', 'dashPattern=6 4', 'endArrow=open', 'endFill=0'])
    else: # association simple
        style_parts.extend(['strokeColor=#2563EB', 'strokeWidth=1.8', 'endArrow=none'])

    if dashed and rel_type != "dependency":
        style_parts.extend(['dashed=1', 'dashPattern=6 4'])

    style_parts.append('fontColor=#0F172A;fontSize=12;fontFamily=Helvetica;fontStyle=1;')
    style_str = ';'.join(style_parts) + ';'

    safe_lbl = html.escape(label).replace('\n', '<br/>')
    add_cell(root, edge_id, safe_lbl, style_str, edge='1', source=src_id, target=tgt_id, vertex=None)

def build_all():
    out_dir = os.path.abspath("c:/Users/japhet/Downloads/zadesk/diagrammes")
    os.makedirs(out_dir, exist_ok=True)
    domain_dir = os.path.join(out_dir, "domaines")
    os.makedirs(domain_dir, exist_ok=True)

    mxfile_multi = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-21T01:15:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })

    # =========================================================================
    # PAGE 1 : VUE GLOBALE DÉCONDENSÉE, AÉRÉE & SANS TITRE (2050 x 1750)
    # =========================================================================
    p1, diag1 = create_diagram_page(mxfile_multi, "page-global", "1. Diagramme Global Zadesk", width=2050, height=1750)

    # Placement spacieux des 24 classes (sans titre)
    for cname, (x, y) in POSITIONS_GLOBAL.items():
        add_class_node(p1, cname, x, y)

    # Connecteurs orthogonaux aérés
    # Multi-Tenant & Équipe
    add_edge_relation(p1, "e1", "workspace", "membership", "contient\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e2", "workspace", "establishment", "possède\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e3", "user", "membership", "adhère\n1 .. 0..*", "association")
    add_edge_relation(p1, "e4", "user", "workspaceinvitation", "invite\n1 .. 0..*", "association")
    add_edge_relation(p1, "e5", "user", "agentprofile", "incarne\n1 .. 0..*", "association")
    add_edge_relation(p1, "e6", "agentprofile", "agentskill", "détient\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e7", "skill", "agentskill", "qualifie\n1 .. 0..*", "aggregation")
    add_edge_relation(p1, "e8", "assignmentengine", "agentprofile", "évalue", "dependency")
    add_edge_relation(p1, "e9", "assignmentengine", "ticket", "affecte", "dependency")

    # SAV & Tickets
    add_edge_relation(p1, "e10", "workspace", "ticket", "gère\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e11", "customer", "ticket", "soumet\n1 .. 0..*", "association")
    add_edge_relation(p1, "e12", "ticket", "ticketactivity", "historise\n1 .. 1..*", "composition")
    add_edge_relation(p1, "e13", "ticket", "ticketassignment", "retrace\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e14", "ticket", "ticketshare", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e15", "agentprofile", "ticket", "traite\n0..1 .. 0..*", "directed")

    # Conversations & Échanges
    add_edge_relation(p1, "e16", "customer", "conversation", "échange via\n1 .. 0..*", "association")
    add_edge_relation(p1, "e17", "conversation", "ticket", "élévation\n0..1 .. 0..1", "association")
    add_edge_relation(p1, "e18", "conversation", "conversationmessage", "compose\n1 .. 1..*", "composition")
    add_edge_relation(p1, "e19", "conversation", "conversationshare", "partage\n1 .. 0..*", "composition")

    # IA & RAG Cible
    add_edge_relation(p1, "e20", "workspace", "knowledgedocument", "possède\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e21", "knowledgedocument", "knowledgechunk", "découpé en\n1 .. 1..*", "composition")
    add_edge_relation(p1, "e22", "aiassistantsupervisor", "knowledgechunk", "recherche sémantique", "dependency")
    add_edge_relation(p1, "e23", "aiassistantsupervisor", "conversation", "assiste", "dependency")
    add_edge_relation(p1, "e24", "aiassistantsupervisor", "ticket", "escalade", "dependency")

    # Fiabilité & Traçabilité
    add_edge_relation(p1, "e25", "workspace", "outboxevent", "génère\n1 .. 0..*", "composition")
    add_edge_relation(p1, "e26", "conversationmessage", "pulseevent", "déclenche", "dependency")
    add_edge_relation(p1, "e27", "workspace", "auditlog", "consigne\n1 .. 0..*", "composition")

    # =========================================================================
    # PAGES 2 À 7 : VUES SPÉCIALISÉES PAR DOMAINE (AÉRÉES, SANS TITRE)
    # =========================================================================
    # PAGE 2 : DOMAINE 1 — ENTREPRISES & MULTI-TENANT
    p2, diag2 = create_diagram_page(mxfile_multi, "page-domain1", "2. Entreprises & Multi-Tenant", width=1450, height=800)
    add_class_node(p2, "Workspace", 80, 80, "p2_ws")
    add_class_node(p2, "Establishment", 80, 420, "p2_est")
    add_class_node(p2, "Membership", 490, 80, "p2_memb")
    add_class_node(p2, "WorkspaceInvitation", 490, 340, "p2_inv")
    add_class_node(p2, "User", 910, 80, "p2_user")
    add_edge_relation(p2, "p2_e1", "p2_ws", "p2_memb", "contient\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e2", "p2_ws", "p2_est", "possède\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e3", "p2_user", "p2_memb", "adhère\n1 .. 0..*", "association")
    add_edge_relation(p2, "p2_e4", "p2_ws", "p2_inv", "émet\n1 .. 0..*", "composition")
    add_edge_relation(p2, "p2_e5", "p2_user", "p2_inv", "invite\n1 .. 0..*", "association")

    # PAGE 3 : DOMAINE 2 — AGENTS & COMPÉTENCES
    p3, diag3 = create_diagram_page(mxfile_multi, "page-domain2", "3. Agents & Compétences", width=1450, height=800)
    add_class_node(p3, "User", 80, 80, "p3_user")
    add_class_node(p3, "AgentProfile", 480, 80, "p3_ag")
    add_class_node(p3, "AssignmentEngine", 480, 390, "p3_as")
    add_class_node(p3, "Skill", 890, 80, "p3_sk")
    add_class_node(p3, "AgentSkill", 890, 310, "p3_agsk")
    add_class_node(p3, "Ticket", 80, 390, "p3_tck")
    add_edge_relation(p3, "p3_e1", "p3_user", "p3_ag", "incarne\n1 .. 0..*", "association")
    add_edge_relation(p3, "p3_e2", "p3_ag", "p3_agsk", "détient\n1 .. 0..*", "composition")
    add_edge_relation(p3, "p3_e3", "p3_sk", "p3_agsk", "qualifie\n1 .. 0..*", "aggregation")
    add_edge_relation(p3, "p3_e4", "p3_as", "p3_ag", "évalue", "dependency")
    add_edge_relation(p3, "p3_e5", "p3_as", "p3_tck", "affecte", "dependency")
    add_edge_relation(p3, "p3_e6", "p3_ag", "p3_tck", "traite\n0..1 .. 0..*", "directed")

    # PAGE 4 : DOMAINE 3 — DEMANDES SAV & TICKETS
    p4, diag4 = create_diagram_page(mxfile_multi, "page-domain3", "4. Demandes SAV & Tickets", width=1450, height=850)
    add_class_node(p4, "Customer", 80, 80, "p4_cust")
    add_class_node(p4, "Ticket", 480, 80, "p4_tck")
    add_class_node(p4, "TicketActivity", 900, 80, "p4_act")
    add_class_node(p4, "TicketAssignment", 900, 310, "p4_asn")
    add_class_node(p4, "TicketShare", 900, 520, "p4_tsh")
    add_class_node(p4, "AgentProfile", 80, 370, "p4_ag")
    add_edge_relation(p4, "p4_e1", "p4_cust", "p4_tck", "soumet\n1 .. 0..*", "association")
    add_edge_relation(p4, "p4_e2", "p4_tck", "p4_act", "historise\n1 .. 1..*", "composition")
    add_edge_relation(p4, "p4_e3", "p4_tck", "p4_asn", "retrace\n1 .. 0..*", "composition")
    add_edge_relation(p4, "p4_e4", "p4_tck", "p4_tsh", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p4, "p4_e5", "p4_ag", "p4_tck", "traite\n0..1 .. 0..*", "directed")

    # PAGE 5 : DOMAINE 4 — CONVERSATIONS OMNICANAL
    p5, diag5 = create_diagram_page(mxfile_multi, "page-domain4", "5. Conversations Omnicanal", width=1300, height=750)
    add_class_node(p5, "Customer", 80, 80, "p5_cust")
    add_class_node(p5, "Conversation", 480, 80, "p5_conv")
    add_class_node(p5, "ConversationMessage", 890, 80, "p5_msg")
    add_class_node(p5, "ConversationShare", 890, 330, "p5_csh")
    add_class_node(p5, "Ticket", 80, 380, "p5_tck")
    add_edge_relation(p5, "p5_e1", "p5_cust", "p5_conv", "dialogue via\n1 .. 0..*", "association")
    add_edge_relation(p5, "p5_e2", "p5_conv", "p5_msg", "compose\n1 .. 1..*", "composition")
    add_edge_relation(p5, "p5_e3", "p5_conv", "p5_csh", "partage\n1 .. 0..*", "composition")
    add_edge_relation(p5, "p5_e4", "p5_conv", "p5_tck", "élévation\n0..1 .. 0..1", "association")

    # PAGE 6 : DOMAINE 5 — ASSISTANCE IA & RAG
    p6, diag6 = create_diagram_page(mxfile_multi, "page-domain5", "6. Assistance IA & RAG", width=1450, height=800)
    add_class_node(p6, "KnowledgeDocument", 80, 80, "p6_kd")
    add_class_node(p6, "KnowledgeChunk", 480, 80, "p6_kc")
    add_class_node(p6, "AiAssistantSupervisor", 880, 80, "p6_ai")
    add_class_node(p6, "AiConfiguration", 80, 350, "p6_aic")
    add_class_node(p6, "Conversation", 880, 350, "p6_conv")
    add_class_node(p6, "Ticket", 480, 350, "p6_tck")
    add_edge_relation(p6, "p6_e1", "p6_kd", "p6_kc", "découpé en\n1 .. 1..*", "composition")
    add_edge_relation(p6, "p6_e2", "p6_ai", "p6_kc", "recherche sémantique", "dependency")
    add_edge_relation(p6, "p6_e3", "p6_ai", "p6_conv", "assiste", "dependency")
    add_edge_relation(p6, "p6_e4", "p6_ai", "p6_tck", "escalade", "dependency")

    # PAGE 7 : DOMAINE 6 — ÉVÉNEMENTS & AUDIT
    p7, diag7 = create_diagram_page(mxfile_multi, "page-domain7", "7. Événements & Audit", width=1300, height=750)
    add_class_node(p7, "Workspace", 80, 80, "p7_ws")
    add_class_node(p7, "OutboxEvent", 470, 80, "p7_out")
    add_class_node(p7, "PulseEvent", 840, 80, "p7_pls")
    add_class_node(p7, "AuditLog", 470, 330, "p7_aud")
    add_class_node(p7, "ConversationMessage", 840, 310, "p7_msg")
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
    print(f"Écrit multi-pages : {path_multi_diag}")

    # =========================================================================
    # FICHIER 2 : PAGE UNIQUE GLOBALE (DIRECTE)
    # =========================================================================
    mxfile_single = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-21T01:15:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })
    mxfile_single.append(copy.deepcopy(diag1))
    tree_single = ET.ElementTree(mxfile_single)
    ET.indent(tree_single, space="  ", level=0)

    path_single_diag = os.path.join(out_dir, "Zadesk_Diagramme_Classes_Global.drawio")
    tree_single.write(path_single_diag, encoding="utf-8", xml_declaration=False)
    print(f"Écrit vue globale directe : {path_single_diag}")

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
            'modified': '2026-11-21T01:15:00.000Z',
            'agent': 'Antigravity / Lead Software Architect',
            'version': '24.7.0'
        })
        d_mxfile.append(copy.deepcopy(ddiag))
        d_tree = ET.ElementTree(d_mxfile)
        ET.indent(d_tree, space="  ", level=0)
        d_path = os.path.join(domain_dir, dfilename)
        d_tree.write(d_path, encoding="utf-8", xml_declaration=False)
        print(f"Écrit domaine : {d_path}")

    # Mise à jour SVG
    generate_spacious_svg(out_dir)

def generate_spacious_svg(out_dir):
    width = 2050
    height = 1750
    svg = []
    svg.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
<defs>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&amp;family=JetBrains+Mono:wght@500&amp;display=swap');
        text {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
        .mono {{ font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace; font-size: 12px; font-weight: 500; }}
        .mono-op {{ font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace; font-size: 12px; fill: #334155; }}
        .class-stereo {{ font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-anchor: middle; font-style: italic; }}
        .class-title {{ font-size: 16px; font-weight: 700; text-anchor: middle; }}
        .card {{ rx: 8; ry: 8; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.06)); }}
        .rel-line {{ stroke: #2563EB; stroke-width: 1.8; fill: none; }}
        .rel-dash {{ stroke: #475569; stroke-width: 1.5; stroke-dasharray: 6,4; fill: none; }}
        .rel-text {{ font-size: 12px; font-weight: 700; fill: #0F172A; }}
    </style>
    <marker id="comp-diamond" viewBox="0 0 12 12" refX="1" refY="6" markerWidth="11" markerHeight="11" orient="auto">
        <polygon points="1,6 6,2 11,6 6,10" fill="#0F172A" stroke="#0F172A" stroke-width="1"/>
    </marker>
    <marker id="aggr-diamond" viewBox="0 0 12 12" refX="1" refY="6" markerWidth="11" markerHeight="11" orient="auto">
        <polygon points="1,6 6,2 11,6 6,10" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    </marker>
    <marker id="nav-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#2563EB"/>
    </marker>
    <marker id="dep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <polyline points="1,1 9,5 1,9" fill="none" stroke="#475569" stroke-width="1.8"/>
    </marker>
</defs>

<rect width="{width}" height="{height}" fill="#FAFAFA"/>
''')

    for name, (x, y) in POSITIONS_GLOBAL.items():
        c = CLASSES_DATA[name]
        w, h = c["w"], c["h"]
        th = DOMAIN_THEMES[c["domain"]]
        dashed_attr = 'stroke-dasharray="6,3"' if th.get("dashed") else ''
        svg.append(f'''
<g id="svg-{name.lower()}">
    <rect x="{x}" y="{y}" width="{w}" height="{h}" class="card" fill="{th['bg']}" stroke="{th['border']}" stroke-width="1.8" {dashed_attr}/>
    <text x="{x + w/2}" y="{y + 26}" class="class-stereo" fill="{th['sub']}">&laquo;{c['stereo']}&raquo;</text>
    <text x="{x + w/2}" y="{y + 48}" class="class-title" fill="{th['title']}">{name}</text>
    <line x1="{x}" y1="{y + 56}" x2="{x + w}" y2="{y + 56}" stroke="{th['sep']}" stroke-width="1.5"/>
''')
        curr_y = y + 78
        for a in c["attrs"]:
            svg.append(f'    <text x="{x + 14}" y="{curr_y}" class="mono" fill="#0F172A">{html.escape(a)}</text>')
            curr_y += 22
        if c["ops"]:
            svg.append(f'    <line x1="{x}" y1="{curr_y}" x2="{x + w}" y2="{curr_y}" stroke="{th["sep"]}" stroke-width="1.5"/>')
            curr_y += 22
            for op in c["ops"]:
                svg.append(f'    <text x="{x + 14}" y="{curr_y}" class="mono-op">{html.escape(op)}</text>')
                curr_y += 22
        svg.append('</g>')

    svg.append('</svg>')
    out_svg = os.path.join(out_dir, "Zadesk_Diagramme_Classes.svg")
    with open(out_svg, "w", encoding="utf-8") as f:
        f.write('\n'.join(svg))
    print(f"Écrit SVG spacieux : {out_svg}")

if __name__ == "__main__":
    build_all()
