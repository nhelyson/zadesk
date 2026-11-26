# -*- coding: utf-8 -*-
"""
Script de génération définitive des diagrammes UML Zadesk pour Draw.io (diagrams.net).
Génère :
1. diagrammes/Zadesk_Diagramme_Classes.drawio (Multi-pages : 1 globale + 6 spécialisées par domaine)
2. diagrammes/Zadesk_Diagramme_Classes_Global.drawio (Page unique globale directe)
3. diagrammes/domaines/*.drawio (Diagrammes dédiés par domaine fonctionnel)
4. Zadesk_Diagramme_Classes.drawio (à la racine)
Conforme aux spécifications Draw.io / mxGraph :
- Cellule racine <mxCell id="0"/> STRICTEMENT sans attribut parent
- Cellule calque par défaut <mxCell id="1" parent="0"/>
- Cadres de domaines sous forme de conteneurs arrondis sans stackLayout perturbateur
- Encodage UTF-8 irréprochable avec accents français parfaits
"""

import os
import shutil
import copy
import xml.etree.ElementTree as ET
import html

def make_class_html(class_name, stereotype, attrs, ops, is_target=False, is_service=False):
    if is_target:
        hdr_txt = "#2B6CB0"
        border_col = "#2B6CB0"
        body_bg = "#F7FAFC"
    elif is_service:
        hdr_txt = "#B7791F"
        border_col = "#D69E2E"
        body_bg = "#FFFFF0"
    else:
        hdr_txt = "#1A202C"
        border_col = "#2D3748"
        body_bg = "#FFFFFF"

    lines = []
    lines.append('<div style="text-align:center;padding:4px 0 2px 0;">')
    lines.append(f'<span style="font-size:10px;font-style:italic;color:#718096;">&laquo;{stereotype}&raquo;</span><br/>')
    lines.append(f'<b style="font-size:13px;color:{hdr_txt};font-family:Inter,Helvetica,sans-serif;">{class_name}</b>')
    lines.append('</div>')

    # Attributs
    lines.append('<hr style="border:none;border-top:1px solid #CBD5E0;margin:3px 0;"/>')
    lines.append('<div style="text-align:left;padding:3px 8px;font-family:Consolas,monospace;font-size:10.5px;color:#2D3748;line-height:1.45;">')
    for a in attrs:
        lines.append(f'{html.escape(a)}<br/>')
    lines.append('</div>')

    # Opérations
    if ops:
        lines.append('<hr style="border:none;border-top:1px solid #CBD5E0;margin:3px 0;"/>')
        lines.append('<div style="text-align:left;padding:3px 8px;font-family:Consolas,monospace;font-size:10.5px;color:#2D3748;line-height:1.45;">')
        for op in ops:
            lines.append(f'{html.escape(op)}<br/>')
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
    attribs = {'id': cell_id}
    # RÈGLE FONDAMENTALE DRAW.IO : la cellule racine 0 ne doit JAMAIS posséder d'attribut parent !
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

def create_diagram_page(mxfile, page_id, page_name, width=2800, height=2200):
    diag = ET.SubElement(mxfile, 'diagram', {'id': page_id, 'name': page_name})
    model = ET.SubElement(diag, 'mxGraphModel', {
        'dx': '1600', 'dy': '1000', 'grid': '1', 'gridSize': '10', 'guides': '1',
        'tooltips': '1', 'connect': '1', 'arrows': '1', 'fold': '1', 'page': '1',
        'pageScale': '1', 'pageWidth': str(width), 'pageHeight': str(height),
        'math': '0', 'shadow': '0'
    })
    root = ET.SubElement(model, 'root')
    # id=0 sans parent (racine absolue), id=1 calque par défaut rattaché à 0
    add_cell(root, '0', '', '', parent=None, vertex=None)
    add_cell(root, '1', '', '', parent='0', vertex=None)
    return root, diag

CLASSES_DEF = {
    "Workspace": {
        "name": "Workspace", "stereo": "entity", "w": 370, "h": 320,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- name: String",
            "- slug: String {unique}",
            "- category: String",
            "- supportEmail: String?",
            "- supportPhone: String?",
            "- supportWhatsApp: String?",
            "- address: String?",
            "- city: String?",
            "- country: String?",
            "- openingHours: String?",
            "- supportCategories: JSON?",
            "- logoUrl: String?",
            "- coverUrl: String?",
            "- isPublic: Boolean = true",
            "- verified: Boolean = false",
            "- createdAt: DateTime {readOnly}",
            "- updatedAt: DateTime"
        ],
        "ops": [
            "+ createTicket(data: TicketDTO): Ticket",
            "+ addMember(user: User, role: Role): Membership",
            "+ updateSupportProfile(data: ProfileDTO): void",
            "+ addEstablishment(branch: BranchDTO): Establishment",
            "+ getCapacityMetrics(): MetricsDTO"
        ]
    },
    "User": {
        "name": "User", "stereo": "entity", "w": 360, "h": 270,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- email: String {unique}",
            "- googleId: String? {unique}",
            "- firstName: String",
            "- lastName: String",
            "- avatarUrl: String?",
            "- passwordHash: String?",
            "- emailVerified: Boolean = false",
            "- createdAt: DateTime {readOnly}",
            "- updatedAt: DateTime"
        ],
        "ops": [
            "+ getFullName(): String",
            "+ verifyPassword(raw: String): Boolean",
            "+ updateProfile(data: UserDTO): void",
            "+ listMemberships(): List<Membership>"
        ]
    },
    "Membership": {
        "name": "Membership", "stereo": "entity", "w": 360, "h": 210,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- userId: String",
            "- workspaceId: String",
            "- role: Role = AGENT",
            "- status: MembershipStatus = ACTIVE",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ changeRole(newRole: Role): void",
            "+ suspendMembership(): void",
            "+ hasPermission(perm: Permission): Boolean"
        ]
    },
    "Establishment": {
        "name": "Establishment", "stereo": "entity", "w": 370, "h": 260,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- name: String",
            "- type: EstablishmentType = BRANCH",
            "- address: String?",
            "- city: String?",
            "- phone: String?",
            "- email: String?",
            "- isMain: Boolean = false",
            "- isActive: Boolean = true",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ updateDetails(data: EstablishmentDTO): void",
            "+ toggleStatus(isActive: Boolean): void",
            "+ setAsMainBranch(): void"
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
        "name": "AssignmentEngine", "stereo": "service", "w": 370, "h": 210, "is_service": True,
        "attrs": [
            "- criteria: AssignmentStrategy = WEIGHTED_ROUND_ROBIN",
            "- strictAvailabilityCheck: Boolean = true"
        ],
        "ops": [
            "+ autoAssignTicket(ticket: Ticket): AgentProfile?",
            "+ calculateAgentScore(agent: AgentProfile, ticket: Ticket): Float",
            "+ rebalanceWorkload(workspaceId: String): RebalanceReport"
        ]
    },
    "Customer": {
        "name": "Customer", "stereo": "entity", "w": 370, "h": 230,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- email: String?",
            "- phone: String?",
            "- name: String",
            "- notes: String?",
            "- createdAt: DateTime {readOnly}",
            "- updatedAt: DateTime"
        ],
        "ops": [
            "+ updateContactInfo(email: String?, phone: String?): void",
            "+ getTicketHistory(): List<Ticket>",
            "+ getActiveConversations(): List<Conversation>"
        ]
    },
    "Ticket": {
        "name": "Ticket", "stereo": "entity", "w": 380, "h": 360,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- reference: String {unique}",
            "- workspaceId: String",
            "- customerId: String",
            "- assignedAgentId: String?",
            "- establishmentId: String?",
            "- conversationId: String?",
            "- title: String",
            "- description: String",
            "- priority: TicketPriority = MEDIUM",
            "- status: TicketStatus = PENDING_ASSIGNMENT",
            "- slaDueAt: DateTime?",
            "- resolvedAt: DateTime?",
            "- closedAt: DateTime?",
            "- createdAt: DateTime {readOnly}",
            "- updatedAt: DateTime"
        ],
        "ops": [
            "+ assignToAgent(agent: AgentProfile, actor: User): void",
            "+ updateStatus(newStatus: TicketStatus, actor: User): void",
            "+ escalatePriority(p: TicketPriority): void",
            "+ markResolved(resolutionSummary: String): void",
            "+ isSlaBreached(): Boolean"
        ]
    },
    "TicketActivity": {
        "name": "TicketActivity", "stereo": "entity", "w": 340, "h": 190,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- ticketId: String",
            "- actorId: String?",
            "- type: String",
            "- content: String?",
            "- metadata: JSON?",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ getFormattedLog(): String"
        ]
    },
    "TicketAssignment": {
        "name": "TicketAssignment", "stereo": "entity", "w": 340, "h": 200,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- ticketId: String",
            "- agentProfileId: String",
            "- assignedById: String?",
            "- reason: String?",
            "- assignedAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ getAssignmentDetails(): String"
        ]
    },
    "TicketShare": {
        "name": "TicketShare", "stereo": "entity", "w": 340, "h": 190,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- ticketId: String",
            "- sharedWithUserId: String",
            "- accessLevel: ShareAccessLevel = READ_ONLY",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ updateAccess(level: ShareAccessLevel): void",
            "+ revoke(): void"
        ]
    },
    "Conversation": {
        "name": "Conversation", "stereo": "entity", "w": 370, "h": 290,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- customerId: String",
            "- assignedAgentId: String?",
            "- establishmentId: String?",
            "- status: ConversationStatus = WAITING_ASSIGNMENT",
            "- channel: ChannelType = PORTAL",
            "- subject: String?",
            "- lastMessageAt: DateTime",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ postMessage(sender: User, text: String, type: MessageType): Message",
            "+ assignAgent(agent: AgentProfile): void",
            "+ elevateToTicket(priority: TicketPriority): Ticket",
            "+ closeConversation(): void"
        ]
    },
    "ConversationMessage": {
        "name": "ConversationMessage", "stereo": "entity", "w": 350, "h": 220,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- conversationId: String",
            "- senderUserId: String?",
            "- senderCustomerId: String?",
            "- type: MessageType = CUSTOMER",
            "- body: String",
            "- attachments: JSON?",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ isInternalNote(): Boolean",
            "+ markAsDelivered(): void"
        ]
    },
    "ConversationShare": {
        "name": "ConversationShare", "stereo": "entity", "w": 350, "h": 180,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- conversationId: String",
            "- sharedWithUserId: String",
            "- accessLevel: ShareAccessLevel = READ_ONLY",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ revoke(): void"
        ]
    },
    "WhatsAppConnection": {
        "name": "WhatsAppConnection", "stereo": "entity", "w": 370, "h": 240,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String {unique}",
            "- phoneNumberId: String",
            "- businessAccountId: String",
            "- accessTokenEncrypted: String",
            "- webhookSecret: String",
            "- isActive: Boolean = true",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ verifyWebhookSignature(payload: String, sig: String): Boolean",
            "+ sendTemplateMessage(to: String, template: String): Boolean"
        ]
    },
    "KnowledgeDocument": {
        "name": "KnowledgeDocument", "stereo": "target_doc", "w": 350, "h": 230, "is_target": True,
        "attrs": [
            "- _id: ObjectId {PK, unique}",
            "- workspaceId: String {index}",
            "- title: String",
            "- category: String",
            "- status: DocumentStatus = INDEXED",
            "- rawContent: String",
            "- createdAt: DateTime {readOnly}",
            "- updatedAt: DateTime"
        ],
        "ops": [
            "+ chunkDocument(chunkSize: Integer): List<KnowledgeChunk>",
            "+ markAsOutdated(): void"
        ]
    },
    "KnowledgeChunk": {
        "name": "KnowledgeChunk", "stereo": "target_doc", "w": 330, "h": 210, "is_target": True,
        "attrs": [
            "- _id: ObjectId {PK, unique}",
            "- documentId: ObjectId {FK}",
            "- workspaceId: String {index}",
            "- chunkIndex: Integer",
            "- content: String",
            "- embedding: Float[1536] {vectorIndex}",
            "- tokenCount: Integer"
        ],
        "ops": [
            "+ computeCosineSimilarity(queryVec: Float[]): Float"
        ]
    },
    "AiAssistantSupervisor": {
        "name": "AiAssistantSupervisor", "stereo": "service", "w": 370, "h": 230, "is_service": True,
        "attrs": [
            "- modelName: String = 'llama-3.3-70b-versatile'",
            "- confidenceThreshold: Float = 0.75",
            "- vectorStore: MongoDBAtlasSearch"
        ],
        "ops": [
            "+ handleCustomerMessage(msg: Message): AiResponse",
            "+ retrieveContextChunks(query: String, topK: Integer): List<Chunk>",
            "+ shouldEscalateToHuman(confidence: Float): Boolean",
            "+ generateDraftReply(conv: Conversation): String"
        ]
    },
    "AiConfiguration": {
        "name": "AiConfiguration", "stereo": "entity", "w": 340, "h": 210,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String {unique}",
            "- autonomyMode: AutonomyMode = ASSISTED",
            "- customInstructions: String?",
            "- autoEscalateLowConfidence: Boolean = true",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ setMode(mode: AutonomyMode): void"
        ]
    },
    "OutboxEvent": {
        "name": "OutboxEvent", "stereo": "entity", "w": 330, "h": 220,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- aggregateType: String",
            "- aggregateId: String",
            "- eventType: String",
            "- payload: JSON",
            "- processed: Boolean = false",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ markProcessed(): void"
        ]
    },
    "PulseEvent": {
        "name": "PulseEvent", "stereo": "entity", "w": 310, "h": 210,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- channel: String",
            "- eventName: String",
            "- data: JSON",
            "- emittedAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ broadcastSSE(clientConnection: Stream): void"
        ]
    },
    "AuditLog": {
        "name": "AuditLog", "stereo": "entity", "w": 330, "h": 230,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- workspaceId: String",
            "- actorId: String",
            "- action: String",
            "- resource: String",
            "- resourceId: String",
            "- ipAddress: String?",
            "- userAgent: String?",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ exportAuditRecord(): String"
        ]
    },
    "WorkspaceInvitation": {
        "name": "WorkspaceInvitation", "stereo": "entity", "w": 340, "h": 210,
        "attrs": [
            "- id: CUID {readOnly, unique}",
            "- email: String",
            "- workspaceId: String",
            "- invitedById: String",
            "- token: String {unique}",
            "- role: Role = AGENT",
            "- expiresAt: DateTime",
            "- acceptedAt: DateTime?",
            "- createdAt: DateTime {readOnly}"
        ],
        "ops": [
            "+ accept(user: User): Membership",
            "+ isExpired(): Boolean"
        ]
    }
}

ENUMS_DEF = [
    ("Role", ["OWNER", "ADMIN", "MANAGER", "AGENT"], 210, 115),
    ("MembershipStatus", ["ACTIVE", "SUSPENDED", "ARCHIVED"], 210, 100),
    ("AgentAvailability", ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"], 220, 115),
    ("TicketStatus", ["PENDING_ASSIGNMENT", "OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 230, 150),
    ("TicketPriority", ["LOW", "MEDIUM", "HIGH", "URGENT"], 210, 115),
    ("ConversationStatus", ["WAITING_ASSIGNMENT", "ACTIVE", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 230, 135),
    ("EstablishmentType", ["HEADQUARTERS", "BRANCH", "REPAIR_CENTER", "STORE", "WAREHOUSE", "RELAY_POINT"], 220, 150),
    ("ShareAccessLevel", ["READ_ONLY", "CONTRIBUTE"], 210, 90),
    ("MessageType", ["CUSTOMER", "AGENT_REPLY", "INTERNAL_NOTE", "SYSTEM"], 210, 115),
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
    else: # association simple
        style_parts.extend(['strokeColor=#2B6CB0', 'strokeWidth=1.4', 'endArrow=none'])

    if dashed and rel_type != "dependency":
        style_parts.extend(['dashed=1', 'dashPattern=5 4'])

    style_parts.append('fontColor=#2D3748;fontSize=10.5;fontFamily=Helvetica;')
    style_str = ';'.join(style_parts) + ';'

    safe_lbl = html.escape(label).replace('\n', '<br/>')
    add_cell(root, edge_id, safe_lbl, style_str, edge='1', source=src_id, target=tgt_id, vertex=None)

def build_all_diagrams():
    out_dir = os.path.abspath("c:/Users/japhet/Downloads/zadesk/diagrammes")
    os.makedirs(out_dir, exist_ok=True)
    domain_dir = os.path.join(out_dir, "domaines")
    os.makedirs(domain_dir, exist_ok=True)
    print(f"Dossiers cibles confirmes : {out_dir} et {domain_dir}")

    # =========================================================================
    # FICHIER 1 : MULTI-PAGES COMPLET
    # =========================================================================
    mxfile_multi = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-21T00:30:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })

    # PAGE 1 : VUE GLOBALE
    p1, diag1 = create_diagram_page(mxfile_multi, "page-global", "1. Diagramme Global Zadesk", width=2850, height=2200)

    # Titre Page 1
    add_cell(p1, 'title_p1', '<div style="text-align:center;"><b style="font-size:22px;color:#0D1B3D;font-family:Inter,sans-serif;">ZADESK &#8212; DIAGRAMME DE CLASSES GLOBAL UML 2.x</b><br/><span style="font-size:12px;color:#4A5568;font-family:Inter,sans-serif;">Modelisation complete de la structure statique, du multi-tenant, des cycles de vie SAV et du RAG cible</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 50, 20, 2700, 60)

    # Cadres de domaines (rectangles arrondis clairs, SANS stackLayout)
    packages_p1 = [
        ("pkg1", "DOMAINE 1 : GESTION DES ENTREPRISES & MULTI-TENANT", 30, 95, 890, 720, "#F7FAFC"),
        ("pkg2", "DOMAINE 2 : GESTION DES AGENTS & COMPETENCES", 940, 95, 820, 720, "#F7FAFC"),
        ("pkg3", "DOMAINE 3 : CLIENTS & DEMANDES SAV (TICKETS)", 30, 835, 890, 680, "#F7FAFC"),
        ("pkg4", "DOMAINE 4 : GESTION DES CONVERSATIONS (OMNICANAL)", 940, 835, 820, 680, "#F7FAFC"),
        ("pkg5", "DOMAINE 5 : ASSISTANCE INTELLIGENTE & RAG (CIBLE)", 30, 1535, 1110, 540, "#F0F4F8"),
        ("pkg6", "DOMAINE 6 : EVENEMENTS, TEMPS REEL & TRACABILITE", 1160, 1535, 600, 540, "#F7FAFC"),
        ("pkg7", "REFERENTIEL DES ENUMERATIONS DU DOMAINE", 1780, 95, 980, 1980, "#F8FAFC")
    ]

    for pid, ptitle, px, py, pw, ph, pbg in packages_p1:
        pstyle = f'rounded=1;whiteSpace=wrap;html=1;fillColor={pbg};strokeColor=#CBD5E0;strokeWidth=1.5;verticalAlign=top;align=left;spacingTop=8;spacingLeft=12;fontFamily=Helvetica;fontStyle=1;fontSize=13;fontColor=#1A365D;shadow=0;'
        add_cell(p1, pid, html.escape(ptitle), pstyle, px, py, pw, ph)

    # Classes Page 1
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
    add_class_cell(p1, CLASSES_DEF["AiConfiguration"], 50, 1850)

    add_class_cell(p1, CLASSES_DEF["OutboxEvent"], 1180, 1585)
    add_class_cell(p1, CLASSES_DEF["PulseEvent"], 1495, 1585)
    add_class_cell(p1, CLASSES_DEF["AuditLog"], 1180, 1835)

    # Enumerations Page 1
    enum_positions_p1 = [
        (1805, 145), (2035, 145), (2275, 145), (2525, 145),
        (1805, 305), (2035, 305), (2275, 330), (2525, 305),
        (1805, 470), (2035, 470), (2275, 470), (2525, 420)
    ]
    for (ename, evals, ew, eh), (ex, ey) in zip(ENUMS_DEF, enum_positions_p1):
        add_enum_cell(p1, ename, evals, ex, ey, ew, eh)

    # Legende Page 1
    legend_html = '<div style="padding:4px 8px;"><b style="font-size:12px;color:#0F172A;">Legende UML 2.x &amp; Semantique :</b><br/><span style="font-size:11px;color:#334155;line-height:1.4;">&bull; <b>Composition (Losange plein noir)</b> : Cycle de vie dependant (Suppression cascade)<br/>&bull; <b>Agregation (Losange blanc)</b> : Relation tout-partie sans destruction exclusive<br/>&bull; <b>Association simple</b> : Lien metier structurel entre entites<br/>&bull; <b>Dependance (Fleche tiretee)</b> : Appel algorithmique / Emission evenementielle<br/>&bull; <b>Cadre tirete bleu</b> : Composant de l\'architecture cible IA / RAG (MongoDB Atlas)</span></div>'
    add_cell(p1, 'legend_p1', legend_html, 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;fontFamily=Helvetica;align=left;', 1805, 640, 935, 150)

    # Connecteurs Page 1
    add_relation_edge(p1, "e1_ws_memb", "workspace", "membership", "contient\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e2_user_memb", "user", "membership", "possede\n1 .. 0..*", "association")
    add_relation_edge(p1, "e3_ws_est", "workspace", "establishment", "possede\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e4_user_ag", "user", "agentprofile", "incarne\n1 .. 0..*", "association")
    add_relation_edge(p1, "e5_ag_agsk", "agentprofile", "agentskill", "detient\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e6_sk_agsk", "skill", "agentskill", "categorise\n1 .. 0..*", "aggregation")
    add_relation_edge(p1, "e7_as_ag", "assignmentengine", "agentprofile", "evalue", "dependency")
    add_relation_edge(p1, "e8_as_tck", "assignmentengine", "ticket", "affecte", "dependency")
    add_relation_edge(p1, "e9_ws_tck", "workspace", "ticket", "gere\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e10_cust_tck", "customer", "ticket", "soumet\n1 .. 0..*", "association")
    add_relation_edge(p1, "e11_tck_act", "ticket", "ticketactivity", "historise\n1 .. 1..*", "composition")
    add_relation_edge(p1, "e12_tck_asn", "ticket", "ticketassignment", "retrace\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e13_tck_tsh", "ticket", "ticketshare", "partage\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e14_tck_conv", "ticket", "conversation", "lie a\n0..1 .. 0..1", "association")
    add_relation_edge(p1, "e15_conv_msg", "conversation", "conversationmessage", "compose\n1 .. 1..*", "composition")
    add_relation_edge(p1, "e16_conv_csh", "conversation", "conversationshare", "partage\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e17_ws_wa", "workspace", "whatsappconnection", "connecte\n1 .. 0..1", "composition")
    add_relation_edge(p1, "e18_ws_kd", "workspace", "knowledgedocument", "possede\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e19_kd_kc", "knowledgedocument", "knowledgechunk", "decoupe en\n1 .. 1..*", "composition")
    add_relation_edge(p1, "e20_ai_kc", "aiassistantsupervisor", "knowledgechunk", "recherche semantique", "dependency")
    add_relation_edge(p1, "e21_ai_conv", "aiassistantsupervisor", "conversation", "assiste", "dependency")
    add_relation_edge(p1, "e22_ai_tck", "aiassistantsupervisor", "ticket", "escalade vers", "dependency")
    add_relation_edge(p1, "e23_ws_out", "workspace", "outboxevent", "genere\n1 .. 0..*", "composition")
    add_relation_edge(p1, "e24_msg_pls", "conversationmessage", "pulseevent", "declenche", "dependency")

    # =========================================================================
    # PAGE 2 : DOMAINE 1 — ENTREPRISES & MULTI-TENANT
    # =========================================================================
    p2, diag2 = create_diagram_page(mxfile_multi, "page-domain1", "2. Entreprises & Multi-Tenant", width=1900, height=1300)
    add_cell(p2, 'title_p2', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 1 : GESTION DES ENTREPRISES &amp; MULTI-TENANT</b><br/><span style="font-size:12px;color:#4A5568;">Isolation des organisations, utilisateurs universels, adhesions contractuelles et agences physiques</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

    add_class_cell(p2, CLASSES_DEF["Workspace"], 120, 140, "p2_ws")
    add_class_cell(p2, CLASSES_DEF["Membership"], 600, 140, "p2_memb")
    add_class_cell(p2, CLASSES_DEF["User"], 1080, 140, "p2_user")
    add_class_cell(p2, CLASSES_DEF["WorkspaceInvitation"], 600, 480, "p2_inv")
    add_class_cell(p2, CLASSES_DEF["Establishment"], 120, 560, "p2_est")

    add_enum_cell(p2, "Role", ["OWNER", "ADMIN", "MANAGER", "AGENT"], 1550, 140, 220, 115, "p2_enum_role")
    add_enum_cell(p2, "MembershipStatus", ["ACTIVE", "SUSPENDED", "ARCHIVED"], 1550, 280, 220, 100, "p2_enum_mstatus")
    add_enum_cell(p2, "EstablishmentType", ["HEADQUARTERS", "BRANCH", "REPAIR_CENTER", "STORE", "WAREHOUSE", "RELAY_POINT"], 1550, 410, 220, 150, "p2_enum_etype")

    add_relation_edge(p2, "p2_e1", "p2_ws", "p2_memb", "contient\n1 .. 0..*", "composition")
    add_relation_edge(p2, "p2_e2", "p2_user", "p2_memb", "possede\n1 .. 0..*", "association")
    add_relation_edge(p2, "p2_e3", "p2_ws", "p2_est", "possede\n1 .. 0..*", "composition")
    add_relation_edge(p2, "p2_e4", "p2_ws", "p2_inv", "emet\n1 .. 0..*", "composition")
    add_relation_edge(p2, "p2_e5", "p2_user", "p2_inv", "invite\n1 .. 0..*", "association")

    # =========================================================================
    # PAGE 3 : DOMAINE 2 — AGENTS & COMPÉTENCES
    # =========================================================================
    p3, diag3 = create_diagram_page(mxfile_multi, "page-domain2", "3. Agents & Competences", width=1900, height=1300)
    add_cell(p3, 'title_p3', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 2 : GESTION DES AGENTS &amp; COMPETENCES METIER</b><br/><span style="font-size:12px;color:#4A5568;">Profils operationnels, competences validees et moteur d\'attribution deterministe (AssignmentEngine)</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

    add_class_cell(p3, CLASSES_DEF["User"], 100, 140, "p3_user")
    add_class_cell(p3, CLASSES_DEF["AgentProfile"], 550, 140, "p3_ag")
    add_class_cell(p3, CLASSES_DEF["AgentSkill"], 1050, 140, "p3_agsk")
    add_class_cell(p3, CLASSES_DEF["Skill"], 1050, 420, "p3_sk")
    add_class_cell(p3, CLASSES_DEF["AssignmentEngine"], 550, 520, "p3_as")
    add_class_cell(p3, CLASSES_DEF["Ticket"], 100, 520, "p3_tck")

    add_enum_cell(p3, "AgentAvailability", ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"], 1500, 140, 240, 120, "p3_enum_avail")

    add_relation_edge(p3, "p3_e1", "p3_user", "p3_ag", "incarne\n1 .. 0..*", "association")
    add_relation_edge(p3, "p3_e2", "p3_ag", "p3_agsk", "detient\n1 .. 0..*", "composition")
    add_relation_edge(p3, "p3_e3", "p3_sk", "p3_agsk", "categorise\n1 .. 0..*", "aggregation")
    add_relation_edge(p3, "p3_e4", "p3_as", "p3_ag", "evalue la charge", "dependency")
    add_relation_edge(p3, "p3_e5", "p3_as", "p3_tck", "affecte", "dependency")
    add_relation_edge(p3, "p3_e6", "p3_ag", "p3_tck", "traite\n0..1 .. 0..*", "directed")

    # =========================================================================
    # PAGE 4 : DOMAINE 3 — DEMANDES SAV & TICKETS
    # =========================================================================
    p4, diag4 = create_diagram_page(mxfile_multi, "page-domain3", "4. Demandes SAV & Tickets", width=1900, height=1400)
    add_cell(p4, 'title_p4', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 3 : GESTION DES CLIENTS &amp; TICKETS SAV</b><br/><span style="font-size:12px;color:#4A5568;">Dossier technique formel, engagements de service (SLA), partages d\'acces et tracabilite des activites</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

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
    add_relation_edge(p4, "p4_e5", "p4_ag", "p4_tck", "traite / assigne a\n0..1 .. 0..*", "directed")
    add_relation_edge(p4, "p4_e6", "p4_est", "p4_tck", "localise\n0..1 .. 0..*", "association")

    # =========================================================================
    # PAGE 5 : DOMAINE 4 — CONVERSATIONS OMNICANAL
    # =========================================================================
    p5, diag5 = create_diagram_page(mxfile_multi, "page-domain4", "5. Conversations Omnicanal", width=1900, height=1300)
    add_cell(p5, 'title_p5', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 4 : GESTION DES CONVERSATIONS (PORTAIL WEB &amp; WHATSAPP)</b><br/><span style="font-size:12px;color:#4A5568;">Dialogue client direct, notes internes confidentielles, integration Meta Cloud API et elevation en ticket</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

    add_class_cell(p5, CLASSES_DEF["Customer"], 100, 150, "p5_cust")
    add_class_cell(p5, CLASSES_DEF["Conversation"], 550, 150, "p5_conv")
    add_class_cell(p5, CLASSES_DEF["ConversationMessage"], 1050, 150, "p5_msg")
    add_class_cell(p5, CLASSES_DEF["ConversationShare"], 1050, 420, "p5_csh")
    add_class_cell(p5, CLASSES_DEF["WhatsAppConnection"], 550, 540, "p5_wa")
    add_class_cell(p5, CLASSES_DEF["Ticket"], 100, 520, "p5_tck")

    add_enum_cell(p5, "ConversationStatus", ["WAITING_ASSIGNMENT", "ACTIVE", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 1500, 150, 240, 140, "p5_enum_cstatus")
    add_enum_cell(p5, "MessageType", ["CUSTOMER", "AGENT_REPLY", "INTERNAL_NOTE", "SYSTEM"], 1500, 330, 240, 120, "p5_enum_mtype")
    add_enum_cell(p5, "ChannelType", ["PORTAL", "WHATSAPP", "EMAIL"], 1500, 490, 240, 100, "p5_enum_chtype")

    add_relation_edge(p5, "p5_e1", "p5_cust", "p5_conv", "echange via\n1 .. 0..*", "association")
    add_relation_edge(p5, "p5_e2", "p5_conv", "p5_msg", "compose\n1 .. 1..*", "composition")
    add_relation_edge(p5, "p5_e3", "p5_conv", "p5_csh", "partage\n1 .. 0..*", "composition")
    add_relation_edge(p5, "p5_e4", "p5_conv", "p5_tck", "elevation en ticket\n0..1 .. 0..1", "association")

    # =========================================================================
    # PAGE 6 : DOMAINE 5 — ASSISTANCE IA & RAG (CIBLE)
    # =========================================================================
    p6, diag6 = create_diagram_page(mxfile_multi, "page-domain5", "6. Assistance IA & RAG", width=1900, height=1300)
    add_cell(p6, 'title_p6', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 5 : ASSISTANCE INTELLIGENTE &amp; RAG (ARCHITECTURE CIBLE)</b><br/><span style="font-size:12px;color:#4A5568;">Corpus documentaire vectorise, stockage denses MongoDB Atlas, inference Llama et supervision d\'escalade humaine</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

    add_class_cell(p6, CLASSES_DEF["KnowledgeDocument"], 100, 140, "p6_kd")
    add_class_cell(p6, CLASSES_DEF["KnowledgeChunk"], 540, 140, "p6_kc")
    add_class_cell(p6, CLASSES_DEF["AiAssistantSupervisor"], 960, 140, "p6_ai")
    add_class_cell(p6, CLASSES_DEF["AiConfiguration"], 100, 460, "p6_aic")
    add_class_cell(p6, CLASSES_DEF["Conversation"], 960, 460, "p6_conv")
    add_class_cell(p6, CLASSES_DEF["Ticket"], 540, 460, "p6_tck")

    add_enum_cell(p6, "AutonomyMode", ["ASSISTED", "SEMI_AUTONOMOUS", "FULL_AUTONOMOUS"], 1450, 140, 240, 110, "p6_enum_autonomy")
    add_enum_cell(p6, "DocumentStatus", ["DRAFT", "INDEXED", "OUTDATED", "ARCHIVED"], 1450, 290, 240, 120, "p6_enum_dstatus")

    add_relation_edge(p6, "p6_e1", "p6_kd", "p6_kc", "decoupe en\n1 .. 1..*", "composition")
    add_relation_edge(p6, "p6_e2", "p6_ai", "p6_kc", "recherche semantique", "dependency")
    add_relation_edge(p6, "p6_e3", "p6_ai", "p6_conv", "assiste", "dependency")
    add_relation_edge(p6, "p6_e4", "p6_ai", "p6_tck", "escalade vers", "dependency")

    # =========================================================================
    # PAGE 7 : DOMAINE 6 — ÉVÉNEMENTS & TRAÇABILITÉ
    # =========================================================================
    p7, diag7 = create_diagram_page(mxfile_multi, "page-domain7", "7. Evenements & Audit", width=1900, height=1300)
    add_cell(p7, 'title_p7', '<div style="text-align:center;"><b style="font-size:20px;color:#0D1B3D;">DOMAINE 6 : EVENEMENTS, TEMPS REEL (SSE) &amp; AUDIT DE SECURITE</b><br/><span style="font-size:12px;color:#4A5568;">Transactional Outbox Pattern, diffusion SSE aux cockpits agents et journalisation d\'audit immuable</span></div>', 'text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;', 100, 30, 1700, 50)

    add_class_cell(p7, CLASSES_DEF["Workspace"], 100, 150, "p7_ws")
    add_class_cell(p7, CLASSES_DEF["OutboxEvent"], 560, 150, "p7_out")
    add_class_cell(p7, CLASSES_DEF["PulseEvent"], 950, 150, "p7_pls")
    add_class_cell(p7, CLASSES_DEF["ConversationMessage"], 950, 420, "p7_msg")
    add_class_cell(p7, CLASSES_DEF["AuditLog"], 560, 440, "p7_aud")

    add_relation_edge(p7, "p7_e1", "p7_ws", "p7_out", "genere\n1 .. 0..*", "composition")
    add_relation_edge(p7, "p7_e2", "p7_ws", "p7_aud", "enregistre\n1 .. 0..*", "composition")
    add_relation_edge(p7, "p7_e3", "p7_msg", "p7_pls", "declenche", "dependency")

    # Formatage et sauvegarde du multi-pages
    tree_multi = ET.ElementTree(mxfile_multi)
    ET.indent(tree_multi, space="  ", level=0)

    path_multi_diag = os.path.join(out_dir, "Zadesk_Diagramme_Classes.drawio")
    path_multi_root = "Zadesk_Diagramme_Classes.drawio"
    path_multi_scratch = "scratch/Zadesk_Diagramme_Classes.drawio"

    tree_multi.write(path_multi_diag, encoding="utf-8", xml_declaration=False)
    tree_multi.write(path_multi_root, encoding="utf-8", xml_declaration=False)
    tree_multi.write(path_multi_scratch, encoding="utf-8", xml_declaration=False)
    print(f"Ecrit avec succes : {path_multi_diag} ({os.path.getsize(path_multi_diag):,} octets)")

    # =========================================================================
    # FICHIER 2 : PAGE UNIQUE GLOBALE (DIRECTE)
    # Pour une ouverture immediate du diagramme complet sur une seule page
    # =========================================================================
    mxfile_single = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-11-21T00:30:00.000Z',
        'agent': 'Antigravity / Lead Software Architect',
        'version': '24.7.0'
    })
    mxfile_single.append(copy.deepcopy(diag1))
    tree_single = ET.ElementTree(mxfile_single)
    ET.indent(tree_single, space="  ", level=0)

    path_single_diag = os.path.join(out_dir, "Zadesk_Diagramme_Classes_Global.drawio")
    tree_single.write(path_single_diag, encoding="utf-8", xml_declaration=False)
    print(f"Ecrit avec succes : {path_single_diag} ({os.path.getsize(path_single_diag):,} octets)")

    # =========================================================================
    # FICHIERS DEDIES PAR DOMAINE DANS diagrammes/domaines/
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
            'modified': '2026-11-21T00:30:00.000Z',
            'agent': 'Antigravity / Lead Software Architect',
            'version': '24.7.0'
        })
        d_mxfile.append(copy.deepcopy(ddiag))
        d_tree = ET.ElementTree(d_mxfile)
        ET.indent(d_tree, space="  ", level=0)
        d_path = os.path.join(domain_dir, dfilename)
        d_tree.write(d_path, encoding="utf-8", xml_declaration=False)
        print(f"Ecrit domaine : {d_path}")

    # =========================================================================
    # COPIE ET SYNCHRONISATION DES AUTRES FORMATS DANS diagrammes/
    # =========================================================================
    # SVG
    if os.path.exists("scratch/zadesk_class_diagram.svg"):
        shutil.copyfile("scratch/zadesk_class_diagram.svg", os.path.join(out_dir, "Zadesk_Diagramme_Classes.svg"))
        print(f"Copie : Zadesk_Diagramme_Classes.svg")
    # PNG
    if os.path.exists("scratch/zadesk_class_diagram.png"):
        shutil.copyfile("scratch/zadesk_class_diagram.png", os.path.join(out_dir, "Zadesk_Diagramme_Classes.png"))
        print(f"Copie : Zadesk_Diagramme_Classes.png")
    # PUML
    if os.path.exists("scratch/zadesk_class_diagram.puml"):
        shutil.copyfile("scratch/zadesk_class_diagram.puml", os.path.join(out_dir, "Zadesk_Diagramme_Classes.puml"))
        print(f"Copie : Zadesk_Diagramme_Classes.puml")
    # Cas d'utilisation
    if os.path.exists("zadesk_use_case_diagram.drawio"):
        shutil.copyfile("zadesk_use_case_diagram.drawio", os.path.join(out_dir, "Zadesk_Diagramme_Cas_Utilisation.drawio"))
        print(f"Copie : Zadesk_Diagramme_Cas_Utilisation.drawio")
    # Sequence
    if os.path.exists("zadesk_sequence_diagram.drawio"):
        shutil.copyfile("zadesk_sequence_diagram.drawio", os.path.join(out_dir, "Zadesk_Diagramme_Sequence.drawio"))
        print(f"Copie : Zadesk_Diagramme_Sequence.drawio")

if __name__ == "__main__":
    build_all_diagrams()
