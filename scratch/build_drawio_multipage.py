# -*- coding: utf-8 -*-
"""
Generator for Zadesk_Diagramme_Classes.drawio
Multi-page Draw.io (diagrams.net) native XML file
Conforms to UML 2.x standards, fully selectable and editable in Draw.io.
"""

import xml.etree.ElementTree as ET
import html

def make_class_html(class_name, stereotype, attrs, ops, is_target=False, is_service=False):
    # Header colors
    if is_target:
        hdr_bg = "#EBF8FF"
        hdr_txt = "#2B6CB0"
        border_col = "#2B6CB0"
        body_bg = "#F7FAFC"
    elif is_service:
        hdr_bg = "#FEFCBF"
        hdr_txt = "#B7791F"
        border_col = "#D69E2E"
        body_bg = "#FFFFF0"
    else:
        hdr_bg = "#EDF2F7"
        hdr_txt = "#1A202C"
        border_col = "#2D3748"
        body_bg = "#FFFFFF"

    # HTML content for value
    lines = []
    lines.append(f'<div style="text-align:center;padding:4px 0 2px 0;">')
    lines.append(f'<span style="font-size:10px;font-style:italic;color:#718096;">&laquo;{stereotype}&raquo;</span><br/>')
    lines.append(f'<b style="font-size:13px;color:{hdr_txt};font-family:Inter,Helvetica,sans-serif;">{class_name}</b>')
    lines.append('</div>')

    # Attributes
    lines.append(f'<hr style="border:none;border-top:1px solid #CBD5E0;margin:3px 0;"/>')
    lines.append('<div style="text-align:left;padding:3px 8px;font-family:Consolas,monospace;font-size:10.5px;color:#2D3748;line-height:1.45;">')
    for a in attrs:
        safe_a = html.escape(a)
        lines.append(f'{safe_a}<br/>')
    lines.append('</div>')

    # Operations
    if ops:
        lines.append(f'<hr style="border:none;border-top:1px solid #CBD5E0;margin:3px 0;"/>')
        lines.append('<div style="text-align:left;padding:3px 8px;font-family:Consolas,monospace;font-size:10.5px;color:#2D3748;line-height:1.45;">')
        for op in ops:
            safe_op = html.escape(op)
            lines.append(f'{safe_op}<br/>')
        lines.append('</div>')

    content = ''.join(lines)
    style = f'verticalAlign=top;align=left;overflow=fill;fontFamily=Helvetica;html=1;rounded=1;shadow=0;fillColor={body_bg};strokeColor={border_col};strokeWidth=1.5;'
    if is_target:
        style += 'dashed=1;dashPattern=4 2;'
    return content, style

def make_enum_html(enum_name, values):
    lines = []
    lines.append('<div style="text-align:center;padding:3px 0 1px 0;">')
    lines.append('<span style="font-size:9.5px;font-style:italic;color:#718096;">&laquo;enumeration&raquo;</span><br/>')
    lines.append(f'<b style="font-size:11.5px;color:#1A202C;font-family:Inter,Helvetica,sans-serif;">{enum_name}</b>')
    lines.append('</div>')
    lines.append('<hr style="border:none;border-top:1px solid #CBD5E0;margin:2px 0;"/>')
    lines.append('<div style="text-align:left;padding:2px 6px;font-family:Consolas,monospace;font-size:9.5px;color:#4A5568;line-height:1.35;">')
    for v in values:
        lines.append(f'&bull; {html.escape(v)}<br/>')
    lines.append('</div>')
    
    content = ''.join(lines)
    style = 'verticalAlign=top;align=left;overflow=fill;fontFamily=Helvetica;html=1;rounded=1;shadow=0;fillColor=#FFFFFF;strokeColor=#4A5568;strokeWidth=1.2;'
    return content, style

def add_cell(root, cell_id, value, style, x=0, y=0, w=0, h=0, parent='1', vertex='1', edge=None, source=None, target=None):
    attribs = {'id': cell_id, 'parent': parent}
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

def create_diagram_page(mxfile, page_id, page_name, width=2800, height=2200):
    diag = ET.SubElement(mxfile, 'diagram', {'id': page_id, 'name': page_name})
    model = ET.SubElement(diag, 'mxGraphModel', {
        'dx': '2000', 'dy': '1500', 'grid': '1', 'gridSize': '10', 'guides': '1',
        'tooltips': '1', 'connect': '1', 'arrows': '1', 'fold': '1', 'page': '1',
        'pageScale': '1', 'pageWidth': str(width), 'pageHeight': str(height),
        'math': '0', 'shadow': '0'
    })
    root = ET.SubElement(model, 'root')
    add_cell(root, '0', '', '', vertex=None)
    add_cell(root, '1', '', '', parent='0', vertex=None)
    return root

# Definition of all class models
CLASSES_DEF = {
    "Workspace": {
        "name": "Workspace", "stereo": "entity", "w": 370, "h": 320,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- name: String",
            "- slug: String {unique}",
            "- category: String",
            "- country: String = 'Congo'",
            "- currency: String = 'XAF'",
            "- plan: String = 'FREE'",
            "- isPublic: Boolean = true",
            "- activeChats: Integer = 0",
            "- slaResponseHours: Integer = 2",
            "- slaResolutionHours: Integer = 24",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ updateSettings(data: DTO): Workspace",
            "+ togglePublicVisibility(isPublic: Boolean): void",
            "+ getCapacityMetrics(): CapacityMetricsDTO",
            "+ checkSlaCompliance(ticket: Ticket): Boolean"
        ]
    },
    "User": {
        "name": "User", "stereo": "entity", "w": 370, "h": 260,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- email: String {unique}",
            "- firstName: String",
            "- lastName: String",
            "- avatarUrl: String?",
            "- passwordHash: String?",
            "- googleId: String? {unique}",
            "- emailVerified: Boolean = false",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ verifyEmail(): void",
            "+ updateProfile(first: String, last: String): void",
            "+ changePassword(newHash: String): void",
            "+ getActiveMemberships(): List<Membership>"
        ]
    },
    "Membership": {
        "name": "Membership", "stereo": "entity", "w": 370, "h": 210,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- userId: String",
            "- workspaceId: String",
            "- role: Role",
            "- status: MembershipStatus = ACTIVE",
            "- joinedAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ changeRole(newRole: Role): void",
            "+ suspend(reason: String): void",
            "+ reactivate(): void",
            "+ archive(): void"
        ]
    },
    "Establishment": {
        "name": "Establishment", "stereo": "entity", "w": 370, "h": 260,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- name: String",
            "- type: EstablishmentType = BRANCH",
            "- isMain: Boolean = false",
            "- isPublic: Boolean = true",
            "- address: String",
            "- city: String = 'Brazzaville'",
            "- phone: String?",
            "- openingHours: String?"
        ],
        "ops": [
            "+ updateDetails(data: EstablishmentDTO): void",
            "+ toggleStatus(isActive: Boolean): void",
            "+ setAsMainBranch(): void"
        ]
    },
    "WorkspaceInvitation": {
        "name": "WorkspaceInvitation", "stereo": "entity", "w": 340, "h": 185,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- invitedById: String",
            "- email: String",
            "- role: Role = AGENT",
            "- token: String {unique}",
            "- status: String = 'PENDING'",
            "- expiresAt: DateTime"
        ],
        "ops": [
            "+ accept(userId: String): Membership",
            "+ cancel(): void"
        ]
    },
    "AgentProfile": {
        "name": "AgentProfile", "stereo": "entity", "w": 370, "h": 275,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- userId: String",
            "- workspaceId: String",
            "- title: String = 'Conseiller SAV'",
            "- availability: AgentAvailability = AVAILABLE",
            "- maxCapacity: Integer = 10",
            "- autoAssignmentEnabled: Boolean = true",
            "- phone: String?",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ setAvailability(s: AgentAvailability): void",
            "+ updateCapacity(limit: Integer): void",
            "+ toggleAutoAssignment(enabled: Boolean): void",
            "+ getActiveTicketsCount(): Integer",
            "+ isAvailableForAssignment(): Boolean"
        ]
    },
    "Skill": {
        "name": "Skill", "stereo": "entity", "w": 340, "h": 160,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- name: String",
            "- description: String?",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ updateSkill(name: String, desc: String): void"
        ]
    },
    "AgentSkill": {
        "name": "AgentSkill", "stereo": "entity", "w": 340, "h": 180,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- agentProfileId: String",
            "- skillId: String",
            "- validatedAt: DateTime?",
            "- validatedById: String?"
        ],
        "ops": [
            "+ validate(validatorUserId: String): void",
            "+ revoke(): void"
        ]
    },
    "AssignmentEngine": {
        "name": "AssignmentEngine", "stereo": "service", "w": 370, "h": 160,
        "attrs": [],
        "ops": [
            "+ autoAssignTicket(t: Ticket, w: Workspace): Result",
            "- filterEligibleAgents(cat: String, wId: String): List",
            "- computeWeightedLoad(ag: AgentProfile): Integer",
            "- selectBestCandidate(cands: List): AgentProfile"
        ]
    },
    "Customer": {
        "name": "Customer", "stereo": "concept", "w": 370, "h": 200,
        "attrs": [
            "- identifier: String {unique, readOnly}",
            "- fullName: String",
            "- phone: String?",
            "- email: String?",
            "- city: String?",
            "- lastInteractionAt: DateTime"
        ],
        "ops": [
            "+ getTicketsHistory(): List<Ticket>",
            "+ getConversations(): List<Conversation>",
            "+ updateContactInfo(p: String, e: String): void"
        ]
    },
    "Ticket": {
        "name": "Ticket", "stereo": "entity", "w": 420, "h": 360,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- ticketNumber: String {unique}",
            "- workspaceId: String",
            "- assignedAgentId: String?",
            "- establishmentId: String?",
            "- title: String",
            "- category: String = 'Général'",
            "- priority: TicketPriority = MEDIUM",
            "- status: TicketStatus = PENDING",
            "- slaDeadlineAt: DateTime?",
            "- resolvedAt: DateTime?",
            "- closedAt: DateTime?"
        ],
        "ops": [
            "+ assignTo(agent: AgentProfile, reason: String): void",
            "+ updateStatus(s: TicketStatus, authorId: String): void",
            "+ changePriority(p: TicketPriority, authorId: String): void",
            "+ addNote(content: String, authorId: String): Activity",
            "+ shareWith(ag: AgentProfile, lvl: ShareLvl): Share",
            "+ markAsResolved(notes: String): void",
            "+ closeTicket(): void"
        ]
    },
    "TicketActivity": {
        "name": "TicketActivity", "stereo": "entity", "w": 370, "h": 160,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- ticketId: String",
            "- authorId: String?",
            "- type: String",
            "- content: String",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": []
    },
    "TicketAssignment": {
        "name": "TicketAssignment", "stereo": "entity", "w": 370, "h": 160,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- ticketId: String",
            "- previousAgentId: String?",
            "- newAgentId: String",
            "- reason: String?",
            "- assignedAt: DateTime {readOnly}"
        ],
        "ops": []
    },
    "TicketShare": {
        "name": "TicketShare", "stereo": "entity", "w": 370, "h": 165,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- ticketId: String",
            "- sharedWithAgentId: String",
            "- accessLevel: ShareAccessLevel",
            "- expiresAt: DateTime?"
        ],
        "ops": ["+ isExpired(): Boolean", "+ revoke(): void"]
    },
    "Conversation": {
        "name": "Conversation", "stereo": "entity", "w": 370, "h": 300,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- ticketId: String?",
            "- assignedAgentId: String?",
            "- customerName: String = 'Visiteur Web'",
            "- channel: ChannelType = PORTAL",
            "- status: ConversationStatus = ACTIVE",
            "- publicTokenHash: String?",
            "- lastMessageAt: DateTime"
        ],
        "ops": [
            "+ postCustomerMessage(content, token): Message",
            "+ postAgentReply(content, agentId): Message",
            "+ postInternalNote(content, agentId): Message",
            "+ convertToTicket(data: TicketDTO): Ticket",
            "+ changeStatus(newStatus: ConvStatus): void",
            "+ verifyToken(rawToken: String): Boolean"
        ]
    },
    "ConversationMessage": {
        "name": "ConversationMessage", "stereo": "entity", "w": 340, "h": 190,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- conversationId: String",
            "- senderType: MessageType",
            "- senderName: String",
            "- senderId: String?",
            "- content: String",
            "- isInternalNote: Boolean = false",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": []
    },
    "ConversationShare": {
        "name": "ConversationShare", "stereo": "entity", "w": 340, "h": 150,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- conversationId: String",
            "- sharedWithAgentId: String",
            "- accessLevel: ShareAccessLevel",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": []
    },
    "WhatsAppConnection": {
        "name": "WhatsAppConnection", "stereo": "entity", "w": 370, "h": 185,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String {unique}",
            "- wabaId: String",
            "- phoneNumberId: String",
            "- displayPhoneNumber: String",
            "- status: String = 'CONNECTED'",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": ["+ disconnect(): void", "+ verifySync(): Boolean"]
    },
    "KnowledgeDocument": {
        "name": "KnowledgeDocument", "stereo": "entity, target", "w": 350, "h": 220, "is_target": True,
        "attrs": [
            "- id: String {readOnly, unique}",
            "- workspaceId: String",
            "- title: String",
            "- category: String",
            "- fileType: String",
            "- totalChunks: Integer = 0",
            "- status: DocumentStatus = DRAFT",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ extractText(): String",
            "+ chunkAndEmbed(size: Int, overlap: Int): List",
            "+ archive(): void"
        ]
    },
    "KnowledgeChunk": {
        "name": "KnowledgeChunk", "stereo": "entity, target", "w": 330, "h": 210, "is_target": True,
        "attrs": [
            "- id: String {readOnly, unique}",
            "- documentId: String",
            "- workspaceId: String",
            "- chunkIndex: Integer",
            "- content: String",
            "- tokenCount: Integer",
            "- embedding: Float[1536]",
            "- metadata: Json"
        ],
        "ops": []
    },
    "AiAssistantSupervisor": {
        "name": "AiAssistantSupervisor", "stereo": "service, target", "w": 370, "h": 210, "is_target": True, "is_service": True,
        "attrs": [
            "- confidenceThreshold: Float = 0.82",
            "- autonomyMode: AutonomyMode"
        ],
        "ops": [
            "+ query(msg: String, wsId: String): AiResponseDTO",
            "- vectorSearch(embed: Float[], wsId: String): List",
            "- evaluateConfidence(score: Float): Level",
            "+ escalateToHuman(conv: Conversation): Ticket"
        ]
    },
    "AiConfiguration": {
        "name": "AiConfiguration", "stereo": "entity, target", "w": 370, "h": 190, "is_target": True,
        "attrs": [
            "- workspaceId: String {unique}",
            "- autonomyMode: AutonomyMode = SEMI_AUTONOMOUS",
            "- tone: String = 'PROFESSIONAL_EMPATHETIC'",
            "- language: String = 'fr'",
            "- confidenceMin: Float = 0.85",
            "- escalationKeywords: List<String>",
            "- claimAmountThreshold: Decimal = 50000.00"
        ],
        "ops": ["+ updateRules(data: AiConfigDTO): void"]
    },
    "OutboxEvent": {
        "name": "OutboxEvent", "stereo": "entity", "w": 300, "h": 210,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String?",
            "- eventType: String",
            "- payload: Json",
            "- status: String = 'PENDING'",
            "- attempts: Integer = 0",
            "- lockedAt: DateTime?",
            "- processedAt: DateTime?"
        ],
        "ops": [
            "+ markAsProcessed(): void",
            "+ markAsFailed(err: String): void",
            "+ lock(): Boolean"
        ]
    },
    "PulseEvent": {
        "name": "PulseEvent", "stereo": "event", "w": 270, "h": 180,
        "attrs": [
            "- id: String {readOnly}",
            "- type: String",
            "- workspaceId: String",
            "- conversationId: String?",
            "- messageId: String?",
            "- payload: Json",
            "- timestamp: DateTime"
        ],
        "ops": []
    },
    "AuditLog": {
        "name": "AuditLog", "stereo": "entity", "w": 330, "h": 190,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- userId: String?",
            "- action: String",
            "- entityType: String",
            "- entityId: String",
            "- metadata: Json?",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": []
    }
}

ENUMS_DEF = [
    ("Role", ["OWNER", "ADMIN", "MANAGER", "AGENT"], 200, 115),
    ("MembershipStatus", ["ACTIVE", "SUSPENDED", "ARCHIVED"], 200, 100),
    ("TicketStatus", ["PENDING_ASSIGNMENT", "OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 220, 150),
    ("TicketPriority", ["LOW", "MEDIUM", "HIGH", "URGENT"], 200, 115),
    ("ConversationStatus", ["WAITING_ASSIGNMENT", "ACTIVE", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 210, 135),
    ("MessageType", ["CUSTOMER", "AGENT_REPLY", "INTERNAL_NOTE", "SYSTEM"], 210, 115),
    ("AgentAvailability", ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"], 210, 115),
    ("ShareAccessLevel", ["READ_ONLY", "CONTRIBUTE"], 200, 85),
    ("EstablishmentType", ["HEADQUARTERS", "BRANCH", "REPAIR_CENTER", "STORE", "WAREHOUSE", "RELAY_POINT"], 210, 150),
    ("ChannelType", ["PORTAL", "WHATSAPP", "EMAIL"], 200, 100),
    ("AutonomyMode", ["ASSISTED", "SEMI_AUTONOMOUS", "FULL_AUTONOMOUS"], 210, 100),
    ("DocumentStatus", ["DRAFT", "INDEXED", "OUTDATED", "ARCHIVED"], 200, 115)
]

def add_class_cell(root, cdef, x, y, custom_id=None):
    cid = custom_id or cdef["name"].lower()
    val, style = make_class_html(
        cdef["name"], cdef["stereo"], cdef["attrs"], cdef["ops"],
        is_target=cdef.get("is_target", False),
        is_service=cdef.get("is_service", False)
    )
    add_cell(root, cid, val, style, x, y, cdef["w"], cdef["h"])

def add_enum_cell(root, name, vals, x, y, w, h, custom_id=None):
    cid = custom_id or f"enum_{name.lower().replace(' ', '_')}"
    val, style = make_enum_html(name, vals)
    add_cell(root, cid, val, style, x, y, w, h)

def add_relation_edge(root, edge_id, src_id, tgt_id, label, rel_type="association", dashed=False):
    style_parts = ['edgeStyle=orthogonalEdgeStyle', 'rounded=1', 'html=1']
    
    if rel_type == "composition":
        style_parts.extend(['strokeColor=#1A202C', 'strokeWidth=1.5', 'startArrow=diamond', 'startFill=1'])
    elif rel_type == "aggregation":
        style_parts.extend(['strokeColor=#1A202C', 'strokeWidth=1.5', 'startArrow=diamond', 'startFill=0'])
    elif rel_type == "directed":
        style_parts.extend(['strokeColor=#2B6CB0', 'strokeWidth=1.4', 'endArrow=block', 'endFill=1'])
    elif rel_type == "dependency":
        style_parts.extend(['strokeColor=#718096', 'strokeWidth=1.2', 'dashed=1', 'dashPattern=5 4', 'endArrow=open', 'endFill=0'])
    else: # simple association
        style_parts.extend(['strokeColor=#2B6CB0', 'strokeWidth=1.4', 'endArrow=none'])

    if dashed and rel_type != "dependency":
        style_parts.extend(['dashed=1', 'dashPattern=5 4'])

    style_parts.append('fontColor=#2D3748;fontSize=10.5;fontFamily=Helvetica;')
    style_str = ';'.join(style_parts) + ';'

    safe_lbl = html.escape(label).replace('\n', '<br/>')
    add_cell(root, edge_id, safe_lbl, style_str, edge='1', source=src_id, target=tgt_id, vertex=None)

# ----------------------------------------------------
# BUILD MULTI-PAGE FILE
# ----------------------------------------------------
mxfile = ET.Element('mxfile', {
    'host': 'app.diagrams.net',
    'modified': '2026-11-21T00:15:00.000Z',
    'agent': 'Antigravity / Lead Software Architect',
    'version': '24.7.0'
})

# ====================================================
# PAGE 1 : VUE GLOBALE COMPLÈTE
# ====================================================
p1 = create_diagram_page(mxfile, "page-global", "1. Diagramme Global Zadesk", width=2800, height=2200)

# Banner Title
title_html = '<div style="text-align:center;"><b style="font-size:22px;color:#0D1B3D;font-family:Inter,sans-serif;">ZADESK — DIAGRAMME DE CLASSES GLOBAL UML 2.x</b><br/><span style="font-size:12px;color:#4A5568;font-family:Inter,sans-serif;">Modélisation complète de la structure statique, du multi-tenant, des cycles de vie SAV et du RAG cible</span></div>'
add_cell(p1, 'title_p1', title_html, 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 50, 20, 2700, 60)

# Package boundaries
packages_p1 = [
    ("pkg1", "DOMAINE 1 : GESTION DES ENTREPRISES & MULTI-TENANT", 30, 95, 890, 720, "#F7FAFC"),
    ("pkg2", "DOMAINE 2 : GESTION DES AGENTS & COMPÉTENCES", 940, 95, 820, 720, "#F7FAFC"),
    ("pkg3", "DOMAINE 3 : CLIENTS & DEMANDES SAV (TICKETS)", 30, 835, 890, 680, "#F7FAFC"),
    ("pkg4", "DOMAINE 4 : GESTION DES CONVERSATIONS (OMNICANAL)", 940, 835, 820, 680, "#F7FAFC"),
    ("pkg5", "DOMAINE 5 : ASSISTANCE INTELLIGENTE & RAG (CIBLE)", 30, 1535, 1110, 520, "#F0F4F8"),
    ("pkg6", "DOMAINE 6 : ÉVÉNEMENTS, TEMPS RÉEL & TRAÇABILITÉ", 1160, 1535, 600, 520, "#F7FAFC"),
    ("pkg7", "RÉFÉRENTIEL DES ÉNUMÉRATIONS DU DOMAINE", 1780, 95, 980, 1960, "#F8FAFC")
]

for pid, ptitle, px, py, pw, ph, pbg in packages_p1:
    pstyle = f'swimlane;fontStyle=1;align=left;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=32;horizontalStack=0;resizeParent=0;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;fillColor={pbg};strokeColor=#CBD5E0;strokeWidth=1.5;fontFamily=Outfit;fontSize=13;fontColor=#1A365D;'
    add_cell(p1, pid, html.escape(ptitle), pstyle, px, py, pw, ph)

# Classes in Page 1
add_class_cell(p1, CLASSES_DEF["Workspace"], 50, 145)
add_class_cell(p1, CLASSES_DEF["User"], 500, 145)
add_class_cell(p1, CLASSES_DEF["Membership"], 500, 450)
add_class_cell(p1, CLASSES_DEF["Establishment"], 50, 500)

add_class_cell(p1, CLASSES_DEF["AgentProfile"], 960, 145)
add_class_cell(p1, CLASSES_DEF["Skill"], 1390, 145)
add_class_cell(p1, CLASSES_DEF["AgentSkill"], 1390, 350)
add_class_cell(p1, CLASSES_DEF["AssignmentEngine"], 960, 480)

add_class_cell(p1, CLASSES_DEF["Customer"], 50, 885)
add_class_cell(p1, CLASSES_DEF["Ticket"], 480, 885)
add_class_cell(p1, CLASSES_DEF["TicketActivity"], 50, 1145)
add_class_cell(p1, CLASSES_DEF["TicketAssignment"], 50, 1335)
add_class_cell(p1, CLASSES_DEF["TicketShare"], 480, 1315)

add_class_cell(p1, CLASSES_DEF["Conversation"], 960, 885)
add_class_cell(p1, CLASSES_DEF["ConversationMessage"], 1380, 885)
add_class_cell(p1, CLASSES_DEF["ConversationShare"], 1380, 1125)
add_class_cell(p1, CLASSES_DEF["WhatsAppConnection"], 960, 1280)

add_class_cell(p1, CLASSES_DEF["KnowledgeDocument"], 50, 1585)
add_class_cell(p1, CLASSES_DEF["KnowledgeChunk"], 430, 1585)
add_class_cell(p1, CLASSES_DEF["AiAssistantSupervisor"], 780, 1585)
add_class_cell(p1, CLASSES_DEF["AiConfiguration"], 50, 1845)

add_class_cell(p1, CLASSES_DEF["OutboxEvent"], 1180, 1585)
add_class_cell(p1, CLASSES_DEF["PulseEvent"], 1495, 1585)
add_class_cell(p1, CLASSES_DEF["AuditLog"], 1180, 1835)

# Enums in Page 1
enum_positions_p1 = [
    (1805, 145), (2035, 145), (2275, 145), (2525, 145),
    (1805, 305), (2035, 305), (2275, 330), (2525, 305),
    (1805, 470), (2035, 470), (2275, 470), (2525, 420)
]
for (ename, evals, ew, eh), (ex, ey) in zip(ENUMS_DEF, enum_positions_p1):
    add_enum_cell(p1, ename, evals, ex, ey, ew, eh)

# Legend in Page 1
legend_html = '<div style="padding:4px 8px;"><b style="font-size:12px;color:#0F172A;">Légende UML 2.x &amp; Sémantique :</b><br/><span style="font-size:11px;color:#334155;line-height:1.4;">&bull; <b>Composition (Losange plein noir)</b> : Cycle de vie dépendant (Suppression cascade)<br/>&bull; <b>Agrégation (Losange blanc)</b> : Relation tout-partie sans destruction exclusive<br/>&bull; <b>Association simple</b> : Lien métier structurel entre entités<br/>&bull; <b>Dépendance (Flèche tiretée)</b> : Appel algorithmique / Émission événementielle<br/>&bull; <b>Cadre tireté bleu</b> : Composant de l\'architecture cible IA / RAG (MongoDB Atlas)</span></div>'
add_cell(p1, 'legend_p1', legend_html, 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;fontFamily=Helvetica;align=left;', 1805, 640, 935, 150)

# Connectors for Page 1
add_relation_edge(p1, "e1_ws_memb", "workspace", "membership", "contient\n1 .. 0..*", "composition")
add_relation_edge(p1, "e2_user_memb", "user", "membership", "possède\n1 .. 0..*", "association")
add_relation_edge(p1, "e3_ws_est", "workspace", "establishment", "possède\n1 .. 0..*", "composition")
add_relation_edge(p1, "e4_user_ag", "user", "agentprofile", "incarne\n1 .. 0..*", "association")
add_relation_edge(p1, "e5_ag_agsk", "agentprofile", "agentskill", "détient\n1 .. 0..*", "composition")
add_relation_edge(p1, "e6_sk_agsk", "skill", "agentskill", "catégorise\n1 .. 0..*", "aggregation")
add_relation_edge(p1, "e7_as_ag", "assignmentengine", "agentprofile", "évalue", "dependency")
add_relation_edge(p1, "e8_as_tck", "assignmentengine", "ticket", "affecte", "dependency")
add_relation_edge(p1, "e9_ws_tck", "workspace", "ticket", "gère\n1 .. 0..*", "composition")
add_relation_edge(p1, "e10_cust_tck", "customer", "ticket", "soumet\n1 .. 0..*", "association")
add_relation_edge(p1, "e11_tck_act", "ticket", "ticketactivity", "historise\n1 .. 1..*", "composition")
add_relation_edge(p1, "e12_tck_asn", "ticket", "ticketassignment", "retrace\n1 .. 0..*", "composition")
add_relation_edge(p1, "e13_tck_tsh", "ticket", "ticketshare", "partage\n1 .. 0..*", "composition")
add_relation_edge(p1, "e14_tck_conv", "ticket", "conversation", "lié à\n0..1 .. 0..1", "association")
add_relation_edge(p1, "e15_conv_msg", "conversation", "conversationmessage", "compose\n1 .. 1..*", "composition")
add_relation_edge(p1, "e16_conv_csh", "conversation", "conversationshare", "partage\n1 .. 0..*", "composition")
add_relation_edge(p1, "e17_ws_wa", "workspace", "whatsappconnection", "connecte\n1 .. 0..1", "composition")
add_relation_edge(p1, "e18_ws_kd", "workspace", "knowledgedocument", "possède\n1 .. 0..*", "composition")
add_relation_edge(p1, "e19_kd_kc", "knowledgedocument", "knowledgechunk", "découpé en\n1 .. 1..*", "composition")
add_relation_edge(p1, "e20_ai_kc", "aiassistantsupervisor", "knowledgechunk", "recherche sémantique", "dependency")
add_relation_edge(p1, "e21_ai_conv", "aiassistantsupervisor", "conversation", "assiste", "dependency")
add_relation_edge(p1, "e22_ai_tck", "aiassistantsupervisor", "ticket", "escalade vers", "dependency")
add_relation_edge(p1, "e23_ws_out", "workspace", "outboxevent", "génère\n1 .. 0..*", "composition")
add_relation_edge(p1, "e24_msg_pls", "conversationmessage", "pulseevent", "déclenche", "dependency")

# ====================================================
# PAGE 2 : DOMAINE 1 — ENTREPRISES & MULTI-TENANT
# ====================================================
p2 = create_diagram_page(mxfile, "page-domain1", "2. Entreprises & Multi-Tenant", width=1900, height=1300)
add_cell(p2, 'title_p2', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 1 : GESTION DES ENTREPRISES &amp; MULTI-TENANT</b><br/><span style="font-size:12px;color:#4A5568;">Isolation des organisations, utilisateurs universels, adhésions contractuelles et agences physiques</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

add_class_cell(p2, CLASSES_DEF["Workspace"], 120, 140, "p2_ws")
add_class_cell(p2, CLASSES_DEF["Membership"], 600, 140, "p2_memb")
add_class_cell(p2, CLASSES_DEF["User"], 1080, 140, "p2_user")
add_class_cell(p2, CLASSES_DEF["WorkspaceInvitation"], 600, 480, "p2_inv")
add_class_cell(p2, CLASSES_DEF["Establishment"], 120, 560, "p2_est")

add_enum_cell(p2, "Role", ["OWNER", "ADMIN", "MANAGER", "AGENT"], 1550, 140, 220, 115, "p2_enum_role")
add_enum_cell(p2, "MembershipStatus", ["ACTIVE", "SUSPENDED", "ARCHIVED"], 1550, 280, 220, 100, "p2_enum_mstatus")
add_enum_cell(p2, "EstablishmentType", ["HEADQUARTERS", "BRANCH", "REPAIR_CENTER", "STORE", "WAREHOUSE", "RELAY_POINT"], 1550, 410, 220, 150, "p2_enum_etype")

add_relation_edge(p2, "p2_e1", "p2_ws", "p2_memb", "contient\n1 .. 0..*", "composition")
add_relation_edge(p2, "p2_e2", "p2_user", "p2_memb", "possède\n1 .. 0..*", "association")
add_relation_edge(p2, "p2_e3", "p2_ws", "p2_est", "possède\n1 .. 0..*", "composition")
add_relation_edge(p2, "p2_e4", "p2_ws", "p2_inv", "émet\n1 .. 0..*", "composition")
add_relation_edge(p2, "p2_e5", "p2_user", "p2_inv", "invite\n1 .. 0..*", "association")

# ====================================================
# PAGE 3 : DOMAINE 2 — AGENTS & COMPÉTENCES
# ====================================================
p3 = create_diagram_page(mxfile, "page-domain2", "3. Agents & Compétences", width=1900, height=1300)
add_cell(p3, 'title_p3', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 2 : GESTION DES AGENTS &amp; COMPÉTENCES MÉTIER</b><br/><span style="font-size:12px;color:#4A5568;">Profils opérationnels, compétences validées et moteur d\'attribution déterministe (AssignmentEngine)</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

add_class_cell(p3, CLASSES_DEF["User"], 100, 140, "p3_user")
add_class_cell(p3, CLASSES_DEF["AgentProfile"], 550, 140, "p3_ag")
add_class_cell(p3, CLASSES_DEF["AgentSkill"], 1050, 140, "p3_agsk")
add_class_cell(p3, CLASSES_DEF["Skill"], 1050, 420, "p3_sk")
add_class_cell(p3, CLASSES_DEF["AssignmentEngine"], 550, 520, "p3_as")
add_class_cell(p3, CLASSES_DEF["Ticket"], 100, 520, "p3_tck")

add_enum_cell(p3, "AgentAvailability", ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"], 1500, 140, 240, 120, "p3_enum_avail")

add_relation_edge(p3, "p3_e1", "p3_user", "p3_ag", "incarne\n1 .. 0..*", "association")
add_relation_edge(p3, "p3_e2", "p3_ag", "p3_agsk", "détient\n1 .. 0..*", "composition")
add_relation_edge(p3, "p3_e3", "p3_sk", "p3_agsk", "catégorise\n1 .. 0..*", "aggregation")
add_relation_edge(p3, "p3_e4", "p3_as", "p3_ag", "évalue la charge", "dependency")
add_relation_edge(p3, "p3_e5", "p3_as", "p3_tck", "affecte", "dependency")
add_relation_edge(p3, "p3_e6", "p3_ag", "p3_tck", "traite\n0..1 .. 0..*", "directed")

# ====================================================
# PAGE 4 : DOMAINE 3 — DEMANDES SAV & TICKETS
# ====================================================
p4 = create_diagram_page(mxfile, "page-domain3", "4. Demandes SAV & Tickets", width=1900, height=1400)
add_cell(p4, 'title_p4', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 3 : GESTION DES CLIENTS &amp; TICKETS SAV</b><br/><span style="font-size:12px;color:#4A5568;">Dossier technique formel, engagements de service (SLA), partages d\'accès et traçabilité des activités</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

add_class_cell(p4, CLASSES_DEF["Customer"], 100, 140, "p4_cust")
add_class_cell(p4, CLASSES_DEF["Ticket"], 580, 140, "p4_tck")
add_class_cell(p4, CLASSES_DEF["TicketActivity"], 1150, 140, "p4_act")
add_class_cell(p4, CLASSES_DEF["TicketAssignment"], 1150, 380, "p4_asn")
add_class_cell(p4, CLASSES_DEF["TicketShare"], 1150, 620, "p4_tsh")
add_class_cell(p4, CLASSES_DEF["AgentProfile"], 100, 500, "p4_ag")
add_class_cell(p4, CLASSES_DEF["Establishment"], 580, 620, "p4_est")

add_enum_cell(p4, "TicketStatus", ["PENDING_ASSIGNMENT", "OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 1600, 140, 240, 160, "p4_enum_tstatus")
add_enum_cell(p4, "TicketPriority", ["LOW", "MEDIUM", "HIGH", "URGENT"], 1600, 340, 240, 120, "p4_enum_tprio")
add_enum_cell(p4, "ShareAccessLevel", ["READ_ONLY", "CONTRIBUTE"], 1600, 500, 240, 90, "p4_enum_shlvl")

add_relation_edge(p4, "p4_e1", "p4_cust", "p4_tck", "soumet\n1 .. 0..*", "association")
add_relation_edge(p4, "p4_e2", "p4_tck", "p4_act", "historise\n1 .. 1..*", "composition")
add_relation_edge(p4, "p4_e3", "p4_tck", "p4_asn", "retrace\n1 .. 0..*", "composition")
add_relation_edge(p4, "p4_e4", "p4_tck", "p4_tsh", "partage\n1 .. 0..*", "composition")
add_relation_edge(p4, "p4_e5", "p4_ag", "p4_tck", "traite / assigné à\n0..1 .. 0..*", "directed")
add_relation_edge(p4, "p4_e6", "p4_est", "p4_tck", "localise\n0..1 .. 0..*", "association")

# ====================================================
# PAGE 5 : DOMAINE 4 — CONVERSATIONS OMNICANAL
# ====================================================
p5 = create_diagram_page(mxfile, "page-domain4", "5. Conversations Omnicanal", width=1900, height=1300)
add_cell(p5, 'title_p5', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 4 : GESTION DES CONVERSATIONS (PORTAIL WEB &amp; WHATSAPP)</b><br/><span style="font-size:12px;color:#4A5568;">Dialogue client direct, notes internes confidentielles, intégration Meta Cloud API et élévation en ticket</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

add_class_cell(p5, CLASSES_DEF["Customer"], 100, 150, "p5_cust")
add_class_cell(p5, CLASSES_DEF["Conversation"], 550, 150, "p5_conv")
add_class_cell(p5, CLASSES_DEF["ConversationMessage"], 1050, 150, "p5_msg")
add_class_cell(p5, CLASSES_DEF["ConversationShare"], 1050, 420, "p5_csh")
add_class_cell(p5, CLASSES_DEF["WhatsAppConnection"], 550, 540, "p5_wa")
add_class_cell(p5, CLASSES_DEF["Ticket"], 100, 520, "p5_tck")

add_enum_cell(p5, "ConversationStatus", ["WAITING_ASSIGNMENT", "ACTIVE", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 1500, 150, 240, 140, "p5_enum_cstatus")
add_enum_cell(p5, "MessageType", ["CUSTOMER", "AGENT_REPLY", "INTERNAL_NOTE", "SYSTEM"], 1500, 330, 240, 120, "p5_enum_mtype")
add_enum_cell(p5, "ChannelType", ["PORTAL", "WHATSAPP", "EMAIL"], 1500, 490, 240, 100, "p5_enum_chtype")

add_relation_edge(p5, "p5_e1", "p5_cust", "p5_conv", "échange via\n1 .. 0..*", "association")
add_relation_edge(p5, "p5_e2", "p5_conv", "p5_msg", "compose\n1 .. 1..*", "composition")
add_relation_edge(p5, "p5_e3", "p5_conv", "p5_csh", "partage\n1 .. 0..*", "composition")
add_relation_edge(p5, "p5_e4", "p5_conv", "p5_tck", "élévation en ticket\n0..1 .. 0..1", "association")

# ====================================================
# PAGE 6 : DOMAINE 5 — ASSISTANCE IA & RAG (CIBLE)
# ====================================================
p6 = create_diagram_page(mxfile, "page-domain5", "6. Assistance IA & RAG", width=1900, height=1300)
add_cell(p6, 'title_p6', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 5 : ASSISTANCE INTELLIGENTE &amp; RAG (ARCHITECTURE CIBLE)</b><br/><span style="font-size:12px;color:#4A5568;">Corpus documentaire vectorisé, stockage denses MongoDB Atlas, inférence Llama et supervision d\'escalade humaine</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

add_class_cell(p6, CLASSES_DEF["KnowledgeDocument"], 100, 140, "p6_kd")
add_class_cell(p6, CLASSES_DEF["KnowledgeChunk"], 540, 140, "p6_kc")
add_class_cell(p6, CLASSES_DEF["AiAssistantSupervisor"], 960, 140, "p6_ai")
add_class_cell(p6, CLASSES_DEF["AiConfiguration"], 100, 460, "p6_aic")
add_class_cell(p6, CLASSES_DEF["Conversation"], 960, 460, "p6_conv")
add_class_cell(p6, CLASSES_DEF["Ticket"], 540, 460, "p6_tck")

add_enum_cell(p6, "AutonomyMode", ["ASSISTED", "SEMI_AUTONOMOUS", "FULL_AUTONOMOUS"], 1450, 140, 240, 110, "p6_enum_autonomy")
add_enum_cell(p6, "DocumentStatus", ["DRAFT", "INDEXED", "OUTDATED", "ARCHIVED"], 1450, 290, 240, 120, "p6_enum_dstatus")

add_relation_edge(p6, "p6_e1", "p6_kd", "p6_kc", "découpé en\n1 .. 1..*", "composition")
add_relation_edge(p6, "p6_e2", "p6_ai", "p6_kc", "recherche sémantique", "dependency")
add_relation_edge(p6, "p6_e3", "p6_ai", "p6_conv", "assiste", "dependency")
add_relation_edge(p6, "p6_e4", "p6_ai", "p6_tck", "escalade vers", "dependency")

# ====================================================
# PAGE 7 : DOMAINE 6 — ÉVÉNEMENTS & TRAÇABILITÉ
# ====================================================
p7 = create_diagram_page(mxfile, "page-domain7", "7. Événements & Audit", width=1900, height=1300)
add_cell(p7, 'title_p7', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 6 : ÉVÉNEMENTS, TEMPS RÉEL (SSE) &amp; AUDIT DE SÉCURITÉ</b><br/><span style="font-size:12px;color:#4A5568;">Transactional Outbox Pattern, diffusion SSE aux cockpits agents et journalisation d\'audit immuable</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

add_class_cell(p7, CLASSES_DEF["Workspace"], 100, 150, "p7_ws")
add_class_cell(p7, CLASSES_DEF["OutboxEvent"], 560, 150, "p7_out")
add_class_cell(p7, CLASSES_DEF["PulseEvent"], 950, 150, "p7_pls")
add_class_cell(p7, CLASSES_DEF["ConversationMessage"], 950, 420, "p7_msg")
add_class_cell(p7, CLASSES_DEF["AuditLog"], 560, 440, "p7_aud")

add_relation_edge(p7, "p7_e1", "p7_ws", "p7_out", "génère\n1 .. 0..*", "composition")
add_relation_edge(p7, "p7_e2", "p7_ws", "p7_aud", "enregistre\n1 .. 0..*", "composition")
add_relation_edge(p7, "p7_e3", "p7_msg", "p7_pls", "déclenche", "dependency")

# Output raw formatted XML
tree = ET.ElementTree(mxfile)
ET.indent(tree, space="  ", level=0)

out_root_path = "Zadesk_Diagramme_Classes.drawio"
out_scratch_path = "scratch/Zadesk_Diagramme_Classes.drawio"

tree.write(out_root_path, encoding="utf-8", xml_declaration=False)
tree.write(out_scratch_path, encoding="utf-8", xml_declaration=False)

print(f"Generated {out_root_path} and {out_scratch_path} successfully.")
