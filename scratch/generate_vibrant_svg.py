# -*- coding: utf-8 -*-
"""
Générateur SVG & PNG haute fidélité pour le diagramme de classes Zadesk
Miroir exact de Zadesk_Diagramme_Classes_Global.drawio :
- Largeur compacte 1680 x 1780
- Couleurs thématiques par domaine (Bleu, Émeraude, Ambre, Violet, Turquoise, Indigo, Ardoise)
- Typographie nette et aérée
- Connecteurs orthogonaux
"""

import os
import html

DOMAIN_COLORS = {
    "workspace": {"bg": "#EFF6FF", "border": "#3B82F6", "title": "#1E40AF", "sep": "#93C5FD"},
    "user": {"bg": "#ECFDF5", "border": "#10B981", "title": "#065F46", "sep": "#6EE7B7"},
    "agent": {"bg": "#FFFBEB", "border": "#F59E0B", "title": "#92400E", "sep": "#FCD34D"},
    "ticket": {"bg": "#FAF5FF", "border": "#8B5CF6", "title": "#5B21B6", "sep": "#C4B5FD"},
    "conversation": {"bg": "#F0FDFA", "border": "#0D9488", "title": "#0F766E", "sep": "#5EEAD4"},
    "ai": {"bg": "#EEF2FF", "border": "#6366F1", "title": "#4338CA", "sep": "#A5B4FC", "dashed": True},
    "audit": {"bg": "#F8FAFC", "border": "#64748B", "title": "#334155", "sep": "#CBD5E1"}
}

CLASSES_DATA = [
    # (name, stereo, domain, x, y, w, h, attrs, ops)
    ("Workspace", "entity", "workspace", 60, 90, 280, 320, [
        "+ id : text [PK]", "+ slug : text [UQ]", "+ name : text", "+ category : text",
        "+ supportEmail : text?", "+ supportPhone : text?", "+ supportWhatsApp : text?",
        "+ isPublic : boolean", "+ verified : boolean", "+ createdAt : timestamp", "+ updatedAt : timestamp"
    ], [
        "+ createTicket() : Ticket", "+ addMember() : Membership", "+ getCapacityMetrics() : Metrics"
    ]),
    ("Establishment", "entity", "workspace", 60, 440, 280, 240, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ name : text", "+ type : EstablishmentType",
        "+ city : text?", "+ phone : text?", "+ isMain : boolean", "+ isActive : boolean", "+ createdAt : timestamp"
    ], [
        "+ updateDetails() : void", "+ toggleStatus() : void"
    ]),
    ("Membership", "entity", "workspace", 380, 90, 260, 200, [
        "+ id : text [PK]", "+ userId : text [FK]", "+ workspaceId : text [FK]",
        "+ role : Role = AGENT", "+ status : MembershipStatus", "+ createdAt : timestamp"
    ], [
        "+ changeRole(role) : void", "+ hasPermission() : boolean"
    ]),
    ("WorkspaceInvitation", "entity", "workspace", 380, 315, 260, 200, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ email : text", "+ invitedById : text [FK]",
        "+ token : text [UQ]", "+ role : Role = AGENT", "+ expiresAt : timestamp"
    ], [
        "+ accept(user) : Membership", "+ isExpired() : boolean"
    ]),
    ("User", "entity", "user", 670, 90, 270, 260, [
        "+ id : text [PK]", "+ email : text [UQ]", "+ googleId : text? [UQ]", "+ firstName : text",
        "+ lastName : text", "+ passwordHash : text?", "+ emailVerified : boolean", "+ createdAt : timestamp"
    ], [
        "+ getFullName() : text", "+ verifyPassword(raw) : boolean", "+ updateProfile(data) : void"
    ]),
    ("AgentProfile", "entity", "agent", 980, 90, 270, 260, [
        "+ id : text [PK]", "+ userId : text [FK]", "+ workspaceId : text [FK]",
        "+ title : text = 'Conseiller'", "+ availability : AgentAvailability",
        "+ maxCapacity : int = 10", "+ autoAssignment : boolean", "+ createdAt : timestamp"
    ], [
        "+ setAvailability(s) : void", "+ isAvailable() : boolean", "+ getActiveTicketsCount() : int"
    ]),
    ("AssignmentEngine", "service", "agent", 980, 380, 270, 180, [
        "- criteria : AssignmentStrategy", "- strictAvailability : boolean"
    ], [
        "+ autoAssign(ticket) : Agent?", "+ calculateScore(agent, tck) : float", "+ rebalanceWorkload(wsId) : Report"
    ]),
    ("Skill", "entity", "agent", 1290, 90, 240, 150, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ name : text", "+ description : text?", "+ createdAt : timestamp"
    ], [
        "+ updateSkill(name, desc) : void"
    ]),
    ("AgentSkill", "entity", "agent", 1290, 270, 240, 170, [
        "+ id : text [PK]", "+ agentProfileId : text [FK]", "+ skillId : text [FK]",
        "+ validatedAt : timestamp?", "+ validatedById : text?"
    ], [
        "+ validate(validatorId) : void", "+ revoke() : void"
    ]),
    ("AiConfiguration", "entity", "ai", 1290, 470, 250, 180, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ autonomyMode : AutonomyMode",
        "+ customInstructions : text?", "+ autoEscalate : boolean = true", "+ createdAt : timestamp"
    ], [
        "+ setMode(mode) : void"
    ]),
    ("Customer", "entity", "ticket", 60, 710, 280, 220, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ name : text", "+ email : text?",
        "+ phone : text?", "+ createdAt : timestamp", "+ updatedAt : timestamp"
    ], [
        "+ getTicketHistory() : List<Ticket>", "+ getActiveConversations() : List"
    ]),
    ("TicketActivity", "entity", "ticket", 60, 960, 280, 180, [
        "+ id : text [PK]", "+ ticketId : text [FK]", "+ actorId : text?", "+ type : text",
        "+ content : text?", "+ createdAt : timestamp"
    ], [
        "+ getFormattedLog() : text"
    ]),
    ("Ticket", "entity", "ticket", 380, 680, 300, 360, [
        "+ id : text [PK]", "+ reference : text [UQ]", "+ workspaceId : text [FK]",
        "+ customerId : text [FK]", "+ assignedAgentId : text? [FK]", "+ establishmentId : text? [FK]",
        "+ conversationId : text? [FK]", "+ title : text", "+ priority : TicketPriority",
        "+ status : TicketStatus", "+ slaDueAt : timestamp?", "+ resolvedAt : timestamp?", "+ createdAt : timestamp"
    ], [
        "+ assignToAgent(agent) : void", "+ updateStatus(status) : void",
        "+ isSlaBreached() : boolean", "+ markResolved(summary) : void"
    ]),
    ("TicketAssignment", "entity", "ticket", 380, 1070, 270, 180, [
        "+ id : text [PK]", "+ ticketId : text [FK]", "+ agentProfileId : text [FK]",
        "+ assignedById : text?", "+ reason : text?", "+ assignedAt : timestamp"
    ], [
        "+ getDetails() : text"
    ]),
    ("TicketShare", "entity", "ticket", 680, 1070, 260, 170, [
        "+ id : text [PK]", "+ ticketId : text [FK]", "+ sharedWithUserId : text [FK]",
        "+ accessLevel : ShareAccessLevel", "+ createdAt : timestamp"
    ], [
        "+ revoke() : void"
    ]),
    ("Conversation", "entity", "conversation", 720, 680, 280, 300, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ customerId : text [FK]",
        "+ assignedAgentId : text? [FK]", "+ establishmentId : text? [FK]",
        "+ status : ConversationStatus", "+ channel : ChannelType",
        "+ lastMessageAt : timestamp", "+ createdAt : timestamp"
    ], [
        "+ postMessage(text, type) : Message", "+ elevateToTicket(priority) : Ticket", "+ closeConversation() : void"
    ]),
    ("ConversationMessage", "entity", "conversation", 1040, 680, 260, 200, [
        "+ id : text [PK]", "+ conversationId : text [FK]", "+ senderUserId : text?",
        "+ senderCustomerId : text?", "+ type : MessageType", "+ body : text", "+ createdAt : timestamp"
    ], [
        "+ isInternalNote() : boolean"
    ]),
    ("ConversationShare", "entity", "conversation", 1040, 910, 260, 160, [
        "+ id : text [PK]", "+ conversationId : text [FK]", "+ sharedWithUserId : text [FK]",
        "+ accessLevel : ShareAccessLevel", "+ createdAt : timestamp"
    ], [
        "+ revoke() : void"
    ]),
    ("WhatsAppConnection", "entity", "conversation", 1340, 680, 260, 210, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ phoneNumberId : text",
        "+ businessAccountId : text", "+ isActive : boolean = true", "+ createdAt : timestamp"
    ], [
        "+ verifySignature(sig) : boolean", "+ sendTemplate(to, tpl) : boolean"
    ]),
    ("AiAssistantSupervisor", "service", "ai", 60, 1270, 280, 210, [
        "- modelName : text = 'llama-3.3'", "- confidenceThreshold : float = 0.75", "- vectorStore : MongoDBAtlas"
    ], [
        "+ handleCustomerMsg(msg) : AiResponse", "+ retrieveChunks(query) : List<Chunk>", "+ shouldEscalate(conf) : boolean"
    ]),
    ("KnowledgeDocument", "target_doc", "ai", 390, 1270, 280, 210, [
        "+ _id : ObjectId [PK]", "+ workspaceId : text [Index]", "+ title : text", "+ category : text",
        "+ status : DocumentStatus", "+ rawContent : text", "+ createdAt : timestamp"
    ], [
        "+ chunkDocument(size) : List<Chunk>", "+ markAsOutdated() : void"
    ]),
    ("KnowledgeChunk", "target_doc", "ai", 710, 1270, 280, 200, [
        "+ _id : ObjectId [PK]", "+ documentId : ObjectId [FK]", "+ workspaceId : text [Index]",
        "+ chunkIndex : int", "+ content : text", "+ embedding : float[1536]", "+ tokenCount : int"
    ], [
        "+ cosineSimilarity(vec) : float"
    ]),
    ("OutboxEvent", "entity", "audit", 1030, 1270, 260, 190, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ aggregateType : text", "+ aggregateId : text",
        "+ eventType : text", "+ processed : boolean = false", "+ createdAt : timestamp"
    ], [
        "+ markProcessed() : void"
    ]),
    ("PulseEvent", "entity", "audit", 1330, 1270, 250, 180, [
        "+ id : text [PK]", "+ channel : text", "+ eventName : text", "+ data : jsonb", "+ emittedAt : timestamp"
    ], [
        "+ broadcastSSE(stream) : void"
    ]),
    ("AuditLog", "entity", "audit", 1030, 1490, 260, 200, [
        "+ id : text [PK]", "+ workspaceId : text [FK]", "+ actorId : text", "+ action : text",
        "+ resource : text", "+ resourceId : text", "+ createdAt : timestamp"
    ], [
        "+ exportRecord() : text"
    ])
]

def generate_svg():
    width = 1680
    height = 1780

    svg = []
    svg.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
<defs>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap');
        text {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
        .mono {{ font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace; font-size: 11px; }}
        .title-main {{ font-size: 22px; font-weight: 700; fill: #0F172A; text-anchor: middle; }}
        .subtitle-main {{ font-size: 13px; font-weight: 400; fill: #475569; text-anchor: middle; }}
        .class-stereo {{ font-size: 9.5px; font-weight: 600; letter-spacing: 0.5px; text-anchor: middle; }}
        .class-title {{ font-size: 14px; font-weight: 700; text-anchor: middle; }}
        .card {{ rx: 8; ry: 8; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.06)); }}
        .rel-line {{ stroke: #2563EB; stroke-width: 1.5; fill: none; }}
        .rel-dash {{ stroke: #64748B; stroke-width: 1.3; stroke-dasharray: 5,3; fill: none; }}
        .rel-text {{ font-size: 10px; font-weight: 600; fill: #1E293B; }}
    </style>
    <!-- Marqueurs UML -->
    <marker id="comp-diamond" viewBox="0 0 12 12" refX="1" refY="6" markerWidth="10" markerHeight="10" orient="auto">
        <polygon points="1,6 6,2 11,6 6,10" fill="#1E293B" stroke="#1E293B" stroke-width="1"/>
    </marker>
    <marker id="aggr-diamond" viewBox="0 0 12 12" refX="1" refY="6" markerWidth="10" markerHeight="10" orient="auto">
        <polygon points="1,6 6,2 11,6 6,10" fill="#FFFFFF" stroke="#1E293B" stroke-width="1.5"/>
    </marker>
    <marker id="nav-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polygon points="0,1 9,5 0,9" fill="#2563EB"/>
    </marker>
    <marker id="dep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <polyline points="1,1 9,5 1,9" fill="none" stroke="#64748B" stroke-width="1.5"/>
    </marker>
</defs>

<rect width="{width}" height="{height}" fill="#FAFAFA"/>

<!-- En-tête Général -->
<text x="{width/2}" y="45" class="title-main">ZADESK &#8212; DIAGRAMME DE CLASSES GLOBAL UML 2.x</text>
<text x="{width/2}" y="70" class="subtitle-main">Architecture Métier SaaS Multi-Tenant &#8226; Helpdesk SAV, Omnicanal, Outbox &amp; RAG Cible</text>
''')

    # Génération des tables de classes
    for name, stereo, domain, x, y, w, h, attrs, ops in CLASSES_DATA:
        th = DOMAIN_COLORS[domain]
        dashed_attr = 'stroke-dasharray="5,3"' if th.get("dashed") else ''
        svg.append(f'''
<!-- CLASSE : {name} -->
<g id="class-{name.lower()}">
    <rect x="{x}" y="{y}" width="{w}" height="{h}" class="card" fill="{th['bg']}" stroke="{th['border']}" stroke-width="1.5" {dashed_attr}/>
    
    <!-- En-tête -->
    <text x="{x + w/2}" y="{y + 22}" class="class-stereo" fill="{th['title']}">&laquo;{stereo}&raquo;</text>
    <text x="{x + w/2}" y="{y + 40}" class="class-title" fill="{th['title']}">{name}</text>
    <line x1="{x}" y1="{y + 48}" x2="{x + w}" y2="{y + 48}" stroke="{th['sep']}" stroke-width="1"/>
''')
        # Attributs
        curr_y = y + 66
        for a in attrs:
            safe_a = html.escape(a)
            svg.append(f'    <text x="{x + 12}" y="{curr_y}" class="mono" fill="#1E293B">{safe_a}</text>')
            curr_y += 18

        if ops:
            svg.append(f'    <line x1="{x}" y1="{curr_y}" x2="{x + w}" y2="{curr_y}" stroke="{th["sep"]}" stroke-width="1"/>')
            curr_y += 18
            for op in ops:
                safe_op = html.escape(op)
                svg.append(f'    <text x="{x + 12}" y="{curr_y}" class="mono" fill="#475569">{safe_op}</text>')
                curr_y += 18

        svg.append('</g>')

    # Légende en bas à droite
    lx, ly, lw, lh = 1330, 1490, 290, 190
    svg.append(f'''
<!-- LÉGENDE -->
<g id="legend">
    <rect x="{lx}" y="{ly}" width="{lw}" height="{lh}" class="card" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="{lx + 15}" y="{ly + 28}" font-size="13" font-weight="700" fill="#0F172A">Légende Sémantique UML 2.x :</text>
    <line x1="{lx + 15}" y1="{ly + 38}" x2="{lx + lw - 15}" y2="{ly + 38}" stroke="#CBD5E1" stroke-width="1"/>
    
    <text x="{lx + 15}" y="{ly + 60}" font-size="11" fill="#334155">&#9670; <b>Composition</b> : Cycle de vie dépendant</text>
    <text x="{lx + 15}" y="{ly + 84}" font-size="11" fill="#334155">&#9671; <b>Agrégation</b> : Relation tout-partie partagée</text>
    <text x="{lx + 15}" y="{ly + 108}" font-size="11" fill="#334155">&#8212; <b>Association</b> : Lien métier structurel direct</text>
    <text x="{lx + 15}" y="{ly + 132}" font-size="11" fill="#334155">- - &gt; <b>Dépendance</b> : Déclenchement / Algorithme</text>
    <text x="{lx + 15}" y="{ly + 156}" font-size="11" font-weight="600" fill="#4338CA">&#9633; Tireté bleu : Cible RAG (MongoDB Atlas)</text>
</g>
</svg>
''')

    out_svg_path = "diagrammes/Zadesk_Diagramme_Classes.svg"
    with open(out_svg_path, "w", encoding="utf-8") as f:
        f.write('\n'.join(svg))
    print(f"SVG généré avec succès : {out_svg_path}")

if __name__ == "__main__":
    generate_svg()
