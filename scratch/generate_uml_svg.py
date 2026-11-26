# -*- coding: utf-8 -*-
"""
Generator for Zadesk UML 2.x Class Diagram
Conforms to Academic and Professional Standards for Master's Thesis
Output: scratch/zadesk_class_diagram.svg and scratch/zadesk_class_diagram.png
"""

import os
import sys
import xml.sax.saxutils as saxutils

def build_svg():
    width = 2800
    height = 2100

    svg_parts = []
    svg_parts.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
<defs>
    <style>
        .pkg-title {{ font-family: 'Outfit', 'Segoe UI', sans-serif; font-size: 15px; font-weight: 700; fill: #1A365D; }}
        .class-header-bg {{ fill: #EDF2F7; stroke: #2D3748; stroke-width: 1.2; }}
        .class-target-header-bg {{ fill: #EBF8FF; stroke: #2B6CB0; stroke-width: 1.2; stroke-dasharray: 4,2; }}
        .class-service-header-bg {{ fill: #FEFCBF; stroke: #B7791F; stroke-width: 1.2; }}
        .class-body-bg {{ fill: #FFFFFF; stroke: #2D3748; stroke-width: 1.2; }}
        .class-target-body-bg {{ fill: #F7FAFC; stroke: #2B6CB0; stroke-width: 1.2; stroke-dasharray: 4,2; }}
        .class-stereotype {{ font-family: 'Inter', Arial, sans-serif; font-size: 10px; font-style: italic; fill: #4A5568; text-anchor: middle; }}
        .class-name {{ font-family: 'Inter', Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #1A202C; text-anchor: middle; }}
        .class-text {{ font-family: 'Consolas', 'JetBrains Mono', monospace; font-size: 10.5px; fill: #2D3748; }}
        .class-target-text {{ font-family: 'Consolas', 'JetBrains Mono', monospace; font-size: 10.5px; fill: #2B6CB0; }}
        .enum-val {{ font-family: 'Consolas', 'JetBrains Mono', monospace; font-size: 9.5px; fill: #4A5568; }}
        .divider {{ stroke: #CBD5E0; stroke-width: 1; }}
        .rel-line {{ stroke: #2B6CB0; stroke-width: 1.4; fill: none; }}
        .rel-dashed {{ stroke: #718096; stroke-width: 1.2; stroke-dasharray: 5,4; fill: none; }}
        .multiplicity {{ font-family: 'Inter', Arial, sans-serif; font-size: 11px; font-weight: 600; fill: #2C5282; }}
        .rel-label {{ font-family: 'Inter', Arial, sans-serif; font-size: 10px; font-style: italic; fill: #4A5568; }}
        .legend-title {{ font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; fill: #1A202C; }}
        .legend-text {{ font-family: 'Inter', sans-serif; font-size: 11px; fill: #4A5568; }}
    </style>
    <!-- Markers for Associations -->
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#2B6CB0" />
    </marker>
    <marker id="dash-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#718096" />
    </marker>
    <marker id="composition" viewBox="0 0 16 10" refX="16" refY="5" markerWidth="14" markerHeight="9" orient="auto-start-reverse">
        <polygon points="0,5 8,1 16,5 8,9" fill="#1A202C" stroke="#1A202C" stroke-width="1"/>
    </marker>
    <marker id="aggregation" viewBox="0 0 16 10" refX="16" refY="5" markerWidth="14" markerHeight="9" orient="auto-start-reverse">
        <polygon points="0,5 8,1 16,5 8,9" fill="#FFFFFF" stroke="#1A202C" stroke-width="1.2"/>
    </marker>
</defs>

<!-- Main Diagram Background -->
<rect width="{width}" height="{height}" fill="#FAFCFF"/>

<!-- Header Banner -->
<rect x="30" y="25" width="2740" height="70" rx="8" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="1.5"/>
<text x="60" y="55" font-family="'Outfit', sans-serif" font-size="22" font-weight="800" fill="#0D1B3D" letter-spacing="-0.5">ZADESK — DIAGRAMME DE CLASSES GLOBAL UML 2.x</text>
<text x="60" y="78" font-family="'Inter', sans-serif" font-size="12" fill="#4A5568">Modélisation de la structure statique, du cloisonnement multi-tenant, des cycles de vie SAV et de l'architecture d'assistance RAG</text>
<text x="2500" y="65" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#2B6CB0">MÉMOIRE DE FIN DE CYCLE</text>
''')

    # Packages coordinates
    packages = [
        {"id": "pkg1", "title": "DOMAINE 1 : GESTION DES ENTREPRISES &amp; MULTI-TENANT", "x": 30, "y": 115, "w": 900, "h": 720, "bg": "#F7FAFC"},
        {"id": "pkg2", "title": "DOMAINE 2 : GESTION DES AGENTS &amp; COMPÉTENCES", "x": 950, "y": 115, "w": 820, "h": 720, "bg": "#F7FAFC"},
        {"id": "pkg3", "title": "DOMAINE 3 : CLIENTS &amp; DEMANDES SAV (TICKETS)", "x": 30, "y": 855, "w": 900, "h": 680, "bg": "#F7FAFC"},
        {"id": "pkg4", "title": "DOMAINE 4 : GESTION DES CONVERSATIONS (OMNICANAL)", "x": 950, "y": 855, "w": 820, "h": 680, "bg": "#F7FAFC"},
        {"id": "pkg5", "title": "DOMAINE 5 : ASSISTANCE INTELLIGENTE &amp; RAG (ARCHITECTURE CIBLE)", "x": 30, "y": 1555, "w": 1120, "h": 500, "bg": "#F0F4F8"},
        {"id": "pkg6", "title": "DOMAINE 6 : ÉVÉNEMENTS, TEMPS RÉEL &amp; TRAÇABILITÉ", "x": 1170, "y": 1555, "w": 600, "h": 500, "bg": "#F7FAFC"},
        {"id": "pkg7", "title": "RÉFÉRENTIEL DES ÉNUMÉRATIONS DU DOMAINE (&lt;&lt;enumeration&gt;&gt;)", "x": 1790, "y": 115, "w": 980, "h": 1940, "bg": "#F8FAFC"}
    ]

    for p in packages:
        svg_parts.append(f'''
<rect x="{p["x"]}" y="{p["y"]}" width="{p["w"]}" height="{p["h"]}" rx="8" fill="{p["bg"]}" stroke="#CBD5E0" stroke-width="1.5"/>
<rect x="{p["x"]}" y="{p["y"]}" width="{p["w"]}" height="32" rx="8" fill="#EDF2F7"/>
<rect x="{p["x"]}" y="{p["y"]+24}" width="{p["w"]}" height="8" fill="#EDF2F7"/>
<text x="{p["x"]+16}" y="{p["y"]+21}" class="pkg-title">{p["title"]}</text>
''')

    # Helper function to render a UML Class box
    def draw_class(x, y, w, h, class_name, stereotype, attrs, ops, is_target=False, is_service=False):
        header_h = 42
        attrs_h = 16 + len(attrs) * 16 if attrs else 16
        
        bg_class = "class-target-body-bg" if is_target else "class-body-bg"
        hdr_class = "class-target-header-bg" if is_target else ("class-service-header-bg" if is_service else "class-header-bg")
        txt_class = "class-target-text" if is_target else "class-text"

        safe_name = saxutils.escape(class_name)
        safe_stereo = saxutils.escape(stereotype)

        res = []
        # Main Box
        res.append(f'<g id="class-{class_name}">')
        res.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" class="{bg_class}"/>')
        # Header Box
        res.append(f'<rect x="{x}" y="{y}" width="{w}" height="{header_h}" rx="5" class="{hdr_class}"/>')
        res.append(f'<rect x="{x}" y="{y+header_h-5}" width="{w}" height="5" class="{hdr_class}"/>')
        # Stereotype and Class Name
        res.append(f'<text x="{x + w/2}" y="{y+16}" class="class-stereotype">&lt;&lt;{safe_stereo}&gt;&gt;</text>')
        res.append(f'<text x="{x + w/2}" y="{y+33}" class="class-name">{safe_name}</text>')
        res.append(f'<line x1="{x}" y1="{y+header_h}" x2="{x+w}" y2="{y+header_h}" class="divider"/>')

        # Attributes
        cur_y = y + header_h + 16
        for attr in attrs:
            safe_attr = saxutils.escape(attr)
            res.append(f'<text x="{x+10}" y="{cur_y}" class="{txt_class}">{safe_attr}</text>')
            cur_y += 16

        # Operations
        if ops:
            res.append(f'<line x1="{x}" y1="{cur_y-4}" x2="{x+w}" y2="{cur_y-4}" class="divider"/>')
            cur_y += 12
            for op in ops:
                safe_op = saxutils.escape(op)
                res.append(f'<text x="{x+10}" y="{cur_y}" class="{txt_class}">{safe_op}</text>')
                cur_y += 16

        res.append('</g>')
        return '\n'.join(res)

    # ----------------------------------------------------
    # PACKAGE 1: GESTION DES ENTREPRISES & MULTI-TENANT
    # ----------------------------------------------------
    # Workspace
    ws_attrs = [
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
    ]
    ws_ops = [
        "+ updateSettings(data: DTO): Workspace",
        "+ togglePublicVisibility(isPublic: Boolean): void",
        "+ getCapacityMetrics(): CapacityMetricsDTO",
        "+ checkSlaCompliance(ticket: Ticket): Boolean"
    ]
    svg_parts.append(draw_class(50, 165, 370, 310, "Workspace", "entity", ws_attrs, ws_ops))

    # User
    user_attrs = [
        "- id: CUID {readOnly, unique}",
        "- email: String {unique}",
        "- firstName: String",
        "- lastName: String",
        "- avatarUrl: String?",
        "- passwordHash: String?",
        "- googleId: String? {unique}",
        "- emailVerified: Boolean = false",
        "- createdAt: DateTime {readOnly}"
    ]
    user_ops = [
        "+ verifyEmail(): void",
        "+ updateProfile(first: String, last: String): void",
        "+ changePassword(newHash: String): void",
        "+ getActiveMemberships(): List<Membership>"
    ]
    svg_parts.append(draw_class(510, 165, 380, 260, "User", "entity", user_attrs, user_ops))

    # Membership
    memb_attrs = [
        "- id: CUID {readOnly, unique}",
        "- userId: String",
        "- workspaceId: String",
        "- role: Role",
        "- status: MembershipStatus = ACTIVE",
        "- joinedAt: DateTime {readOnly}"
    ]
    memb_ops = [
        "+ changeRole(newRole: Role): void",
        "+ suspend(reason: String): void",
        "+ reactivate(): void",
        "+ archive(): void"
    ]
    svg_parts.append(draw_class(510, 480, 380, 220, "Membership", "entity", memb_attrs, memb_ops))

    # Establishment
    est_attrs = [
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
    ]
    est_ops = [
        "+ updateDetails(data: EstablishmentDTO): void",
        "+ toggleStatus(isActive: Boolean): void",
        "+ setAsMainBranch(): void"
    ]
    svg_parts.append(draw_class(50, 520, 370, 280, "Establishment", "entity", est_attrs, est_ops))

    # ----------------------------------------------------
    # PACKAGE 2: GESTION DES AGENTS & COMPÉTENCES
    # ----------------------------------------------------
    # AgentProfile
    ag_attrs = [
        "- id: CUID {readOnly, unique}",
        "- userId: String",
        "- workspaceId: String",
        "- title: String = 'Conseiller SAV'",
        "- availability: AgentAvailability = AVAILABLE",
        "- maxCapacity: Integer = 10",
        "- autoAssignmentEnabled: Boolean = true",
        "- phone: String?",
        "- createdAt: DateTime {readOnly}"
    ]
    ag_ops = [
        "+ setAvailability(s: AgentAvailability): void",
        "+ updateCapacity(limit: Integer): void",
        "+ toggleAutoAssignment(enabled: Boolean): void",
        "+ getActiveTicketsCount(): Integer",
        "+ isAvailableForAssignment(): Boolean"
    ]
    svg_parts.append(draw_class(970, 165, 380, 275, "AgentProfile", "entity", ag_attrs, ag_ops))

    # Skill
    sk_attrs = [
        "- id: CUID {readOnly, unique}",
        "- workspaceId: String",
        "- name: String",
        "- description: String?",
        "- createdAt: DateTime {readOnly}"
    ]
    sk_ops = [
        "+ updateSkill(name: String, desc: String): void"
    ]
    svg_parts.append(draw_class(1400, 165, 350, 170, "Skill", "entity", sk_attrs, sk_ops))

    # AgentSkill
    agsk_attrs = [
        "- id: CUID {readOnly, unique}",
        "- agentProfileId: String",
        "- skillId: String",
        "- validatedAt: DateTime?",
        "- validatedById: String?"
    ]
    agsk_ops = [
        "+ validate(validatorUserId: String): void",
        "+ revoke(): void"
    ]
    svg_parts.append(draw_class(1400, 390, 350, 185, "AgentSkill", "entity", agsk_attrs, agsk_ops))

    # AssignmentEngine
    as_ops = [
        "+ autoAssignTicket(t: Ticket, w: Workspace): Result",
        "- filterEligibleAgents(cat: String, wId: String): List",
        "- computeWeightedLoad(ag: AgentProfile): Integer",
        "- selectBestCandidate(cands: List): AgentProfile"
    ]
    svg_parts.append(draw_class(970, 520, 380, 170, "AssignmentEngine", "service", [], as_ops, is_service=True))

    # ----------------------------------------------------
    # PACKAGE 3: GESTION DES CLIENTS & TICKETS SAV
    # ----------------------------------------------------
    # Customer
    cust_attrs = [
        "- identifier: String {unique, readOnly}",
        "- fullName: String",
        "- phone: String?",
        "- email: String?",
        "- city: String?",
        "- lastInteractionAt: DateTime"
    ]
    cust_ops = [
        "+ getTicketsHistory(): List<Ticket>",
        "+ getConversations(): List<Conversation>",
        "+ updateContactInfo(p: String, e: String): void"
    ]
    svg_parts.append(draw_class(50, 905, 370, 210, "Customer", "concept", cust_attrs, cust_ops))

    # Ticket
    tck_attrs = [
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
    ]
    tck_ops = [
        "+ assignTo(agent: AgentProfile, reason: String): void",
        "+ updateStatus(s: TicketStatus, authorId: String): void",
        "+ changePriority(p: TicketPriority, authorId: String): void",
        "+ addNote(content: String, authorId: String): Activity",
        "+ shareWith(ag: AgentProfile, lvl: ShareLvl): Share",
        "+ markAsResolved(notes: String): void",
        "+ closeTicket(): void"
    ]
    svg_parts.append(draw_class(480, 905, 430, 380, "Ticket", "entity", tck_attrs, tck_ops))

    # TicketActivity
    act_attrs = [
        "- id: CUID {readOnly, unique}",
        "- ticketId: String",
        "- authorId: String?",
        "- type: String",
        "- content: String",
        "- createdAt: DateTime {readOnly}"
    ]
    svg_parts.append(draw_class(50, 1165, 370, 170, "TicketActivity", "entity", act_attrs, []))

    # TicketAssignment & TicketShare
    asn_attrs = [
        "- id: CUID {readOnly, unique}",
        "- ticketId: String",
        "- previousAgentId: String?",
        "- newAgentId: String",
        "- reason: String?",
        "- assignedAt: DateTime {readOnly}"
    ]
    svg_parts.append(draw_class(50, 1360, 370, 160, "TicketAssignment", "entity", asn_attrs, []))

    tsh_attrs = [
        "- id: CUID {readOnly, unique}",
        "- ticketId: String",
        "- sharedWithAgentId: String",
        "- accessLevel: ShareAccessLevel",
        "- expiresAt: DateTime?"
    ]
    tsh_ops = ["+ isExpired(): Boolean", "+ revoke(): void"]
    svg_parts.append(draw_class(480, 1330, 430, 175, "TicketShare", "entity", tsh_attrs, tsh_ops))

    # ----------------------------------------------------
    # PACKAGE 4: GESTION DES CONVERSATIONS (OMNICANAL)
    # ----------------------------------------------------
    # Conversation
    conv_attrs = [
        "- id: CUID {readOnly, unique}",
        "- workspaceId: String",
        "- ticketId: String?",
        "- assignedAgentId: String?",
        "- customerName: String = 'Visiteur Web'",
        "- channel: ChannelType = PORTAL",
        "- status: ConversationStatus = ACTIVE",
        "- publicTokenHash: String?",
        "- lastMessageAt: DateTime"
    ]
    conv_ops = [
        "+ postCustomerMessage(content, token): Message",
        "+ postAgentReply(content, agentId): Message",
        "+ postInternalNote(content, agentId): Message",
        "+ convertToTicket(data: TicketDTO): Ticket",
        "+ changeStatus(newStatus: ConvStatus): void",
        "+ verifyToken(rawToken: String): Boolean"
    ]
    svg_parts.append(draw_class(970, 905, 380, 320, "Conversation", "entity", conv_attrs, conv_ops))

    # ConversationMessage
    msg_attrs = [
        "- id: CUID {readOnly, unique}",
        "- conversationId: String",
        "- senderType: MessageType",
        "- senderName: String",
        "- senderId: String?",
        "- content: String",
        "- isInternalNote: Boolean = false",
        "- createdAt: DateTime {readOnly}"
    ]
    svg_parts.append(draw_class(1390, 905, 360, 200, "ConversationMessage", "entity", msg_attrs, []))

    # ConversationShare
    csh_attrs = [
        "- id: CUID {readOnly, unique}",
        "- conversationId: String",
        "- sharedWithAgentId: String",
        "- accessLevel: ShareAccessLevel",
        "- createdAt: DateTime {readOnly}"
    ]
    svg_parts.append(draw_class(1390, 1140, 360, 150, "ConversationShare", "entity", csh_attrs, []))

    # WhatsAppConnection
    wa_attrs = [
        "- id: CUID {readOnly, unique}",
        "- workspaceId: String {unique}",
        "- wabaId: String",
        "- phoneNumberId: String",
        "- displayPhoneNumber: String",
        "- status: String = 'CONNECTED'",
        "- createdAt: DateTime {readOnly}"
    ]
    wa_ops = ["+ disconnect(): void", "+ verifySync(): Boolean"]
    svg_parts.append(draw_class(970, 1310, 380, 195, "WhatsAppConnection", "entity", wa_attrs, wa_ops))

    # ----------------------------------------------------
    # PACKAGE 5: ASSISTANCE INTELLIGENTE & RAG (CIBLE)
    # ----------------------------------------------------
    # KnowledgeDocument
    kd_attrs = [
        "- id: String {readOnly, unique}",
        "- workspaceId: String",
        "- title: String",
        "- category: String",
        "- fileType: String",
        "- totalChunks: Integer = 0",
        "- status: DocumentStatus = DRAFT",
        "- createdAt: DateTime {readOnly}"
    ]
    kd_ops = [
        "+ extractText(): String",
        "+ chunkAndEmbed(size: Int, overlap: Int): List",
        "+ archive(): void"
    ]
    svg_parts.append(draw_class(50, 1605, 340, 230, "KnowledgeDocument", "entity, target", kd_attrs, kd_ops, is_target=True))

    # KnowledgeChunk
    kc_attrs = [
        "- id: String {readOnly, unique}",
        "- documentId: String",
        "- workspaceId: String",
        "- chunkIndex: Integer",
        "- content: String",
        "- tokenCount: Integer",
        "- embedding: Float[1536]",
        "- metadata: Json"
    ]
    svg_parts.append(draw_class(420, 1605, 320, 215, "KnowledgeChunk", "entity, target", kc_attrs, [], is_target=True))

    # AiAssistantSupervisor
    ai_attrs = [
        "- confidenceThreshold: Float = 0.82",
        "- autonomyMode: AutonomyMode"
    ]
    ai_ops = [
        "+ query(msg: String, wsId: String): AiResponseDTO",
        "- vectorSearch(embed: Float[], wsId: String): List",
        "- evaluateConfidence(score: Float): Level",
        "+ escalateToHuman(conv: Conversation): Ticket"
    ]
    svg_parts.append(draw_class(770, 1605, 360, 215, "AiAssistantSupervisor", "service, target", ai_attrs, ai_ops, is_target=True, is_service=True))

    # AiConfiguration
    aic_attrs = [
        "- workspaceId: String {unique}",
        "- autonomyMode: AutonomyMode = SEMI_AUTONOMOUS",
        "- tone: String = 'PROFESSIONAL_EMPATHETIC'",
        "- language: String = 'fr'",
        "- confidenceMin: Float = 0.85",
        "- escalationKeywords: List<String>",
        "- claimAmountThreshold: Decimal = 50000.00"
    ]
    aic_ops = ["+ updateRules(data: AiConfigDTO): void"]
    svg_parts.append(draw_class(50, 1865, 690, 170, "AiConfiguration", "entity, target", aic_attrs, aic_ops, is_target=True))

    # ----------------------------------------------------
    # PACKAGE 6: ÉVÉNEMENTS, TEMPS RÉEL & TRAÇABILITÉ
    # ----------------------------------------------------
    # OutboxEvent
    out_attrs = [
        "- id: CUID {readOnly, unique}",
        "- workspaceId: String?",
        "- eventType: String",
        "- payload: Json",
        "- status: String = 'PENDING'",
        "- attempts: Integer = 0",
        "- lockedAt: DateTime?",
        "- processedAt: DateTime?"
    ]
    out_ops = [
        "+ markAsProcessed(): void",
        "+ markAsFailed(err: String): void",
        "+ lock(): Boolean"
    ]
    svg_parts.append(draw_class(1190, 1605, 270, 215, "OutboxEvent", "entity", out_attrs, out_ops))

    # PulseEvent
    pls_attrs = [
        "- id: String {readOnly}",
        "- type: String",
        "- workspaceId: String",
        "- conversationId: String?",
        "- messageId: String?",
        "- payload: Json",
        "- timestamp: DateTime"
    ]
    svg_parts.append(draw_class(1485, 1605, 260, 190, "PulseEvent", "event", pls_attrs, []))

    # AuditLog
    aud_attrs = [
        "- id: CUID {readOnly, unique}",
        "- workspaceId: String",
        "- userId: String?",
        "- action: String",
        "- entityType: String",
        "- entityId: String",
        "- metadata: Json?",
        "- createdAt: DateTime {readOnly}"
    ]
    svg_parts.append(draw_class(1190, 1855, 555, 180, "AuditLog", "entity", aud_attrs, []))

    # ----------------------------------------------------
    # PACKAGE 7: ÉNUMÉRATIONS DU DOMAINE
    # ----------------------------------------------------
    enums = [
        ("Role", ["OWNER", "ADMIN", "MANAGER", "AGENT"], 1810, 165, 210, 115),
        ("MembershipStatus", ["ACTIVE", "SUSPENDED", "ARCHIVED"], 2040, 165, 220, 100),
        ("TicketStatus", ["PENDING_ASSIGNMENT", "OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 2280, 165, 230, 150),
        ("TicketPriority", ["LOW", "MEDIUM", "HIGH", "URGENT"], 2530, 165, 220, 115),
        ("ConversationStatus", ["WAITING_ASSIGNMENT", "ACTIVE", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], 1810, 310, 210, 135),
        ("MessageType", ["CUSTOMER", "AGENT_REPLY", "INTERNAL_NOTE", "SYSTEM"], 2040, 310, 220, 115),
        ("AgentAvailability", ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"], 2280, 335, 230, 115),
        ("ShareAccessLevel", ["READ_ONLY", "CONTRIBUTE"], 2530, 310, 220, 85),
        ("EstablishmentType", ["HEADQUARTERS", "BRANCH", "REPAIR_CENTER", "STORE", "WAREHOUSE", "RELAY_POINT"], 1810, 475, 210, 150),
        ("ChannelType", ["PORTAL", "WHATSAPP", "EMAIL"], 2040, 475, 220, 100),
        ("AutonomyMode (Target)", ["ASSISTED", "SEMI_AUTONOMOUS", "FULL_AUTONOMOUS"], 2280, 475, 230, 100),
        ("DocumentStatus (Target)", ["DRAFT", "INDEXED", "OUTDATED", "ARCHIVED"], 2530, 425, 220, 115)
    ]

    for en_name, vals, ex, ey, ew, eh in enums:
        svg_parts.append(f'''
<g id="enum-{en_name}">
    <rect x="{ex}" y="{ey}" width="{ew}" height="{eh}" rx="4" fill="#FFFFFF" stroke="#4A5568" stroke-width="1.1"/>
    <rect x="{ex}" y="{ey}" width="{ew}" height="28" rx="4" fill="#EDF2F7"/>
    <rect x="{ex}" y="{ey+24}" width="{ew}" height="4" fill="#EDF2F7"/>
    <text x="{ex + ew/2}" y="{ey+12}" class="class-stereotype">&lt;&lt;enumeration&gt;&gt;</text>
    <text x="{ex + ew/2}" y="{ey+24}" class="class-name" font-size="11">{en_name}</text>
    <line x1="{ex}" y1="{ey+28}" x2="{ex+ew}" y2="{ey+28}" class="divider"/>
''')
        val_y = ey + 44
        for v in vals:
            svg_parts.append(f'<text x="{ex+12}" y="{val_y}" class="enum-val">• {v}</text>')
            val_y += 16
        svg_parts.append('</g>')

    # ----------------------------------------------------
    # LÉGENDE DU DIAGRAMME DANS LE PACKAGE 7
    # ----------------------------------------------------
    leg_x = 1810
    leg_y = 660
    leg_w = 940
    leg_h = 420
    svg_parts.append(f'''
<g id="diagram-legend">
    <rect x="{leg_x}" y="{leg_y}" width="{leg_w}" height="{leg_h}" rx="6" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="1.5"/>
    <rect x="{leg_x}" y="{leg_y}" width="{leg_w}" height="32" rx="6" fill="#E2E8F0"/>
    <text x="{leg_x+20}" y="{leg_y+21}" class="legend-title">CONVENTIONS &amp; NOTATIONS UML 2.x DE CE DIAGRAMME</text>
    
    <!-- Ligne 1 : Symboles de relations -->
    <line x1="{leg_x+30}" y1="{leg_y+65}" x2="{leg_x+100}" y2="{leg_y+65}" class="rel-line" marker-start="url(#composition)"/>
    <text x="{leg_x+115}" y="{leg_y+69}" class="legend-text"><tspan font-weight="bold">Composition stricte (Cycle de vie dépendant) :</tspan> Suppression en cascade garantie (ex: Workspace *-- Ticket)</text>

    <line x1="{leg_x+30}" y1="{leg_y+105}" x2="{leg_x+100}" y2="{leg_y+105}" class="rel-line" marker-start="url(#aggregation)"/>
    <text x="{leg_x+115}" y="{leg_y+109}" class="legend-text"><tspan font-weight="bold">Agrégation partagée :</tspan> Relation tout-partie sans destruction exclusive (ex: Skill o-- AgentSkill)</text>

    <line x1="{leg_x+30}" y1="{leg_y+145}" x2="{leg_x+100}" y2="{leg_y+145}" class="rel-line" marker-end="url(#arrow)"/>
    <text x="{leg_x+115}" y="{leg_y+149}" class="legend-text"><tspan font-weight="bold">Association dirigée / Navigabilité :</tspan> Relation navigable entre deux entités métier (ex: Agent -> Ticket)</text>

    <line x1="{leg_x+30}" y1="{leg_y+185}" x2="{leg_x+100}" y2="{leg_y+185}" class="rel-dashed" marker-end="url(#dash-arrow)"/>
    <text x="{leg_x+115}" y="{leg_y+189}" class="legend-text"><tspan font-weight="bold">Dépendance de service / Événement :</tspan> Utilisation d'une classe ou émission événementielle (ex: Service ..&gt; Ticket)</text>

    <!-- Ligne 2 : Stéréotypes et couleurs -->
    <rect x="{leg_x+30}" y="{leg_y+215}" width="24" height="24" rx="3" fill="#EDF2F7" stroke="#2D3748" stroke-width="1.2"/>
    <text x="{leg_x+65}" y="{leg_y+231}" class="legend-text"><tspan font-weight="bold">&lt;&lt;entity&gt;&gt; :</tspan> Entité métier principale matérialisée dans la base relationnelle PostgreSQL</text>

    <rect x="{leg_x+30}" y="{leg_y+250}" width="24" height="24" rx="3" fill="#EBF8FF" stroke="#2B6CB0" stroke-width="1.2" stroke-dasharray="4,2"/>
    <text x="{leg_x+65}" y="{leg_y+266}" class="legend-text"><tspan font-weight="bold">&lt;&lt;entity, target&gt;&gt; :</tspan> Entité de l'architecture cible IA / RAG (MongoDB / Atlas Vector Search)</text>

    <rect x="{leg_x+30}" y="{leg_y+285}" width="24" height="24" rx="3" fill="#FEFCBF" stroke="#B7791F" stroke-width="1.2"/>
    <text x="{leg_x+65}" y="{leg_y+301}" class="legend-text"><tspan font-weight="bold">&lt;&lt;service&gt;&gt; :</tspan> Composant logiciel orchestrant les règles algorithmiques (Attribution, Supervision IA)</text>

    <text x="{leg_x+30}" y="{leg_y+340}" font-family="'Inter', sans-serif" font-size="11" fill="#718096">Visibilités UML : + public | - privé | # protégé | ~ package</text>
    <text x="{leg_x+30}" y="{leg_y+360}" font-family="'Inter', sans-serif" font-size="11" fill="#718096">Contraintes : {{readOnly}} attribut immuable | {{unique}} valeur unique garantie en base</text>
</g>
''')

    # ----------------------------------------------------
    # CONNECTEURS ORTHOGONAUX & MULTIPLICITÉS
    # ----------------------------------------------------
    connections = [
        # 1. User -- Membership
        {"d": "M 700 425 L 700 480", "marker_start": None, "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (708, 442), "m2": "0..*", "m2_pos": (708, 472), "label": "possède", "lbl_pos": (712, 456)},

        # 2. Workspace *-- Membership
        {"d": "M 420 320 L 465 320 L 465 590 L 510 590", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (430, 312), "m2": "0..*", "m2_pos": (475, 582), "label": "contient", "lbl_pos": (440, 440)},

        # 3. Workspace *-- Establishment
        {"d": "M 235 475 L 235 520", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (242, 490), "m2": "0..*", "m2_pos": (242, 512), "label": "possède", "lbl_pos": (245, 501)},

        # 4. User -- AgentProfile
        {"d": "M 890 290 L 970 290", "marker_start": None, "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (900, 282), "m2": "0..*", "m2_pos": (935, 282), "label": "incarne", "lbl_pos": (910, 275)},

        # 5. AgentProfile *-- AgentSkill
        {"d": "M 1350 350 L 1375 350 L 1375 480 L 1400 480", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (1355, 342), "m2": "0..*", "m2_pos": (1375, 472), "label": "détient", "lbl_pos": (1360, 410)},

        # 6. Skill -- AgentSkill
        {"d": "M 1575 335 L 1575 390", "marker_start": None, "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (1582, 350), "m2": "0..*", "m2_pos": (1582, 380), "label": "catégorise", "lbl_pos": (1585, 365)},

        # 7. AssignmentEngine ..> AgentProfile
        {"d": "M 1160 520 L 1160 440", "marker_start": None, "marker_end": "url(#dash-arrow)", "dashed": True,
         "m1": "", "m1_pos": (0,0), "m2": "", "m2_pos": (0,0), "label": "évalue", "lbl_pos": (1168, 480)},

        # 8. AssignmentEngine ..> Ticket
        {"d": "M 970 605 L 940 605 L 940 980 L 910 980", "marker_start": None, "marker_end": "url(#dash-arrow)", "dashed": True,
         "m1": "", "m1_pos": (0,0), "m2": "", "m2_pos": (0,0), "label": "affecte", "lbl_pos": (918, 790)},

        # 9. Workspace *-- Ticket
        {"d": "M 380 475 L 380 870 L 600 870 L 600 905", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (388, 500), "m2": "0..*", "m2_pos": (608, 895), "label": "gère", "lbl_pos": (480, 860)},

        # 10. Customer -- Ticket
        {"d": "M 420 1010 L 480 1010", "marker_start": None, "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (430, 1002), "m2": "0..*", "m2_pos": (455, 1002), "label": "soumet", "lbl_pos": (435, 995)},

        # 11. Ticket *-- TicketActivity
        {"d": "M 480 1210 L 420 1210", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (465, 1202), "m2": "1..*", "m2_pos": (428, 1202), "label": "historise", "lbl_pos": (435, 1222)},

        # 12. Ticket *-- TicketAssignment
        {"d": "M 480 1260 L 440 1260 L 440 1440 L 420 1440", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (465, 1252), "m2": "0..*", "m2_pos": (428, 1432), "label": "retrace", "lbl_pos": (445, 1350)},

        # 13. Ticket *-- TicketShare
        {"d": "M 695 1285 L 695 1330", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (703, 1300), "m2": "0..*", "m2_pos": (703, 1320), "label": "partage", "lbl_pos": (706, 1310)},

        # 14. Ticket -- Conversation (Liaison bidirectionnelle optionnelle)
        {"d": "M 910 1065 L 970 1065", "marker_start": None, "marker_end": None, "dashed": False,
         "m1": "0..1", "m1_pos": (918, 1057), "m2": "0..1", "m2_pos": (945, 1057), "label": "lié à", "lbl_pos": (925, 1050)},

        # 15. Conversation *-- ConversationMessage
        {"d": "M 1350 1005 L 1390 1005", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (1355, 997), "m2": "1..*", "m2_pos": (1370, 997), "label": "compose", "lbl_pos": (1355, 1017)},

        # 16. Conversation *-- ConversationShare
        {"d": "M 1350 1140 L 1370 1140 L 1370 1215 L 1390 1215", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (1355, 1132), "m2": "0..*", "m2_pos": (1375, 1207), "label": "partage", "lbl_pos": (1350, 1180)},

        # 17. Workspace *-- WhatsAppConnection
        {"d": "M 350 475 L 350 830 L 960 830 L 960 1400 L 970 1400", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (358, 520), "m2": "0..1", "m2_pos": (940, 1392), "label": "connecte", "lbl_pos": (650, 822)},

        # 18. Workspace *-- KnowledgeDocument (Target)
        {"d": "M 220 475 L 220 1605", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (228, 540), "m2": "0..*", "m2_pos": (228, 1595), "label": "possède", "lbl_pos": (225, 1050)},

        # 19. KnowledgeDocument *-- KnowledgeChunk (Target)
        {"d": "M 390 1712 L 420 1712", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (395, 1704), "m2": "1..*", "m2_pos": (405, 1704), "label": "découpé en", "lbl_pos": (390, 1726)},

        # 20. AiAssistantSupervisor ..> KnowledgeChunk (Target)
        {"d": "M 770 1712 L 740 1712", "marker_start": None, "marker_end": "url(#dash-arrow)", "dashed": True,
         "m1": "", "m1_pos": (0,0), "m2": "", "m2_pos": (0,0), "label": "recherche sémantique", "lbl_pos": (742, 1700)},

        # 21. AiAssistantSupervisor ..> Conversation (Target)
        {"d": "M 950 1605 L 950 1225", "marker_start": None, "marker_end": "url(#dash-arrow)", "dashed": True,
         "m1": "", "m1_pos": (0,0), "m2": "", "m2_pos": (0,0), "label": "assiste", "lbl_pos": (955, 1420)},

        # 22. AiAssistantSupervisor ..> Ticket (Target Escalation)
        {"d": "M 850 1605 L 850 1285", "marker_start": None, "marker_end": "url(#dash-arrow)", "dashed": True,
         "m1": "", "m1_pos": (0,0), "m2": "", "m2_pos": (0,0), "label": "escalade vers", "lbl_pos": (855, 1445)},

        # 23. Workspace *-- OutboxEvent
        {"d": "M 400 475 L 400 810 L 1180 810 L 1180 1712 L 1190 1712", "marker_start": "url(#composition)", "marker_end": None, "dashed": False,
         "m1": "1", "m1_pos": (408, 540), "m2": "0..*", "m2_pos": (1170, 1704), "label": "génère", "lbl_pos": (800, 802)},

        # 24. ConversationMessage ..> PulseEvent
        {"d": "M 1570 1105 L 1570 1605", "marker_start": None, "marker_end": "url(#dash-arrow)", "dashed": True,
         "m1": "", "m1_pos": (0,0), "m2": "", "m2_pos": (0,0), "label": "déclenche", "lbl_pos": (1576, 1350)}
    ]

    for conn in connections:
        cls_line = "rel-dashed" if conn["dashed"] else "rel-line"
        m_start = f'marker-start="{conn["marker_start"]}"' if conn["marker_start"] else ''
        m_end = f'marker-end="{conn["marker_end"]}"' if conn["marker_end"] else ''
        svg_parts.append(f'<path d="{conn["d"]}" class="{cls_line}" {m_start} {m_end}/>')
        
        # Multiplicities
        if conn["m1"]:
            svg_parts.append(f'<text x="{conn["m1_pos"][0]}" y="{conn["m1_pos"][1]}" class="multiplicity">{conn["m1"]}</text>')
        if conn["m2"]:
            svg_parts.append(f'<text x="{conn["m2_pos"][0]}" y="{conn["m2_pos"][1]}" class="multiplicity">{conn["m2"]}</text>')
        if conn["label"]:
            svg_parts.append(f'<text x="{conn["lbl_pos"][0]}" y="{conn["lbl_pos"][1]}" class="rel-label">{conn["label"]}</text>')

    svg_parts.append('</svg>')
    return '\n'.join(svg_parts)

if __name__ == "__main__":
    svg_content = build_svg()
    out_svg_path = "scratch/zadesk_class_diagram.svg"
    with open(out_svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {out_svg_path} successfully ({len(svg_content)} bytes)")
