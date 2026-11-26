"""
Générateur professionnel des diagrammes Option B pour le mémoire Zalisk :
1. Vue Globale Conceptuelle Simplifiée (24 classes, compacte, lisible d'un coup d'oeil dans Word)
2. 6 Vues Détaillées par Sous-Domaine Métier (4-6 classes chacune, taille maximale, zéro croisement)
Génère pour chaque vue : .drawio, .svg, .png (300 DPI via pymupdf), .pdf
"""
import os
import html
import pymupdf

OUTPUT_DIR = "livrables_memoire/3.3.2_modele_classes/option_b_decoupage"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("diagrammes", exist_ok=True)

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
    # 1. Multi-Tenant
    "Workspace": {
        "name": "Workspace", "stereo": "entity", "domain": "workspace", "w": 380, "h": 365,
        "attrs": [
            "+ id : text [PK]", "+ slug : text [UQ]", "+ name : text",
            "+ category : text", "+ supportEmail : text?", "+ supportPhone : text?",
            "+ isPublic : boolean = true", "+ verified : boolean = false"
        ],
        "ops": ["+ createTicket() : Ticket", "+ addMember() : Membership", "+ getCapacityMetrics() : Metrics"]
    },
    "Establishment": {
        "name": "Establishment", "stereo": "entity", "domain": "workspace", "w": 380, "h": 320,
        "attrs": [
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ name : text",
            "+ type : EstablishmentType", "+ city : text?", "+ isMain : boolean = false",
            "+ isActive : boolean = true"
        ],
        "ops": ["+ updateDetails() : void", "+ toggleStatus() : void"]
    },
    "Membership": {
        "name": "Membership", "stereo": "entity", "domain": "workspace", "w": 380, "h": 280,
        "attrs": [
            "+ id : text [PK]", "+ userId : text [FK]", "+ workspaceId : text [FK]",
            "+ role : Role = AGENT", "+ status : MembershipStatus"
        ],
        "ops": ["+ changeRole(role) : void", "+ hasPermission() : boolean"]
    },
    "WorkspaceInvitation": {
        "name": "WorkspaceInvitation", "stereo": "entity", "domain": "workspace", "w": 380, "h": 310,
        "attrs": [
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ email : text",
            "+ invitedById : text [FK]", "+ token : text [UQ]", "+ role : Role = AGENT",
            "+ expiresAt : timestamp"
        ],
        "ops": ["+ accept() : Membership", "+ isExpired() : boolean"]
    },
    "User": {
        "name": "User", "stereo": "entity", "domain": "user", "w": 380, "h": 325,
        "attrs": [
            "+ id : text [PK]", "+ email : text [UQ]", "+ firstName : text",
            "+ lastName : text", "+ passwordHash : text?", "+ emailVerified : boolean",
            "+ googleId : text [UQ]?"
        ],
        "ops": ["+ getFullName() : text", "+ verifyPassword() : boolean"]
    },

    # 2. Agents & Compétences
    "AgentProfile": {
        "name": "AgentProfile", "stereo": "entity", "domain": "agent", "w": 380, "h": 345,
        "attrs": [
            "+ id : text [PK]", "+ userId : text [FK]", "+ workspaceId : text [FK]",
            "+ title : text = \"Conseiller\"", "+ availability : AgentAvailability",
            "+ maxCapacity : int = 10", "+ autoAssignment : boolean"
        ],
        "ops": ["+ setAvailability(s) : void", "+ isAvailable() : boolean"]
    },
    "AssignmentEngine": {
        "name": "AssignmentEngine", "stereo": "service", "domain": "agent", "w": 380, "h": 240,
        "attrs": [
            "- criteria : AssignmentStrategy", "- strictAvailability : boolean = true"
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
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ name : text",
            "+ description : text?"
        ],
        "ops": ["+ validate() : void"]
    },
    "AgentSkill": {
        "name": "AgentSkill", "stereo": "entity", "domain": "agent", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]", "+ agentProfileId : text [FK]", "+ skillId : text [FK]",
            "+ validatedAt : timestamp?"
        ],
        "ops": ["+ certify(managerId) : void"]
    },

    # 3. SAV & Billetterie
    "Customer": {
        "name": "Customer", "stereo": "entity", "domain": "ticket", "w": 380, "h": 300,
        "attrs": [
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ name : text",
            "+ email : text?", "+ phone : text?", "+ createdAt : timestamp"
        ],
        "ops": ["+ getTicketHistory() : List<Ticket>"]
    },
    "Ticket": {
        "name": "Ticket", "stereo": "entity", "domain": "ticket", "w": 380, "h": 415,
        "attrs": [
            "+ id : text [PK]", "+ ticketNumber : text [UQ]", "+ workspaceId : text [FK]",
            "+ customerId : text? [FK]", "+ assignedAgentId : text? [FK]",
            "+ title : text", "+ priority : TicketPriority", "+ status : TicketStatus",
            "+ slaDueAt : timestamp?"
        ],
        "ops": [
            "+ assignToAgent(agent) : void",
            "+ updateStatus(status) : void",
            "+ closeTicket() : void"
        ]
    },
    "TicketActivity": {
        "name": "TicketActivity", "stereo": "entity", "domain": "ticket", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]", "+ ticketId : text [FK]", "+ actorId : text?",
            "+ type : TicketActivityType", "+ content : text"
        ],
        "ops": ["+ logActivity() : void"]
    },
    "TicketAssignment": {
        "name": "TicketAssignment", "stereo": "entity", "domain": "ticket", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]", "+ ticketId : text [FK]", "+ agentProfileId : text [FK]",
            "+ assignedById : text?", "+ reason : text?"
        ],
        "ops": ["+ recordAssignment() : void"]
    },
    "TicketShare": {
        "name": "TicketShare", "stereo": "entity", "domain": "ticket", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]", "+ ticketId : text [FK]", "+ sharedWithUserId : text [FK]",
            "+ accessLevel : ShareAccessLevel"
        ],
        "ops": ["+ revoke() : void"]
    },

    # 4. Conversations
    "Conversation": {
        "name": "Conversation", "stereo": "entity", "domain": "conversation", "w": 380, "h": 345,
        "attrs": [
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ customerId : text? [FK]",
            "+ assignedAgentId : text? [FK]", "+ status : ConversationStatus",
            "+ channel : ChannelType", "+ lastMessageAt : timestamp"
        ],
        "ops": [
            "+ postMessage(text, type) : Message",
            "+ elevateToTicket(priority) : Ticket"
        ]
    },
    "ConversationMessage": {
        "name": "ConversationMessage", "stereo": "entity", "domain": "conversation", "w": 380, "h": 280,
        "attrs": [
            "+ id : text [PK]", "+ conversationId : text [FK]", "+ senderUserId : text?",
            "+ senderCustomerId : text?", "+ type : MessageType", "+ body : text"
        ],
        "ops": ["+ markAsDelivered() : void"]
    },
    "ConversationShare": {
        "name": "ConversationShare", "stereo": "entity", "domain": "conversation", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]", "+ conversationId : text [FK]", "+ sharedWithUserId : text [FK]",
            "+ accessLevel : ShareAccessLevel"
        ],
        "ops": ["+ revokeAccess() : void"]
    },

    # 5. IA & RAG
    "AiAssistantSupervisor": {
        "name": "AiAssistantSupervisor", "stereo": "service", "domain": "ai", "w": 380, "h": 255,
        "attrs": [
            "- modelName : text = 'llama-3.3'", "- confidenceThreshold : float = 0.75",
            "- vectorStore : MongoDBAtlas"
        ],
        "ops": [
            "+ handleMessage(msg) : AIResponse",
            "+ retrieveChunks(query) : List<Chunk>",
            "+ shouldEscalate(conf) : boolean"
        ]
    },
    "AiConfiguration": {
        "name": "AiConfiguration", "stereo": "entity", "domain": "ai", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ autonomyMode : AutonomyMode",
            "+ autoEscalate : boolean = true"
        ],
        "ops": ["+ toggleAutonomy() : void"]
    },
    "KnowledgeDocument": {
        "name": "KnowledgeDocument", "stereo": "entity", "domain": "ai", "w": 380, "h": 280,
        "attrs": [
            "+ _id : ObjectId [PK]", "+ workspaceId : text [Index]", "+ title : text",
            "+ category : text", "+ status : DocumentStatus"
        ],
        "ops": ["+ chunkAndEmbed() : List<Chunk>"]
    },
    "KnowledgeChunk": {
        "name": "KnowledgeChunk", "stereo": "target_doc", "domain": "ai", "w": 380, "h": 255,
        "attrs": [
            "+ _id : ObjectId [PK]", "+ documentId : ObjectId [FK]", "+ workspaceId : text [Index]",
            "+ chunkIndex : int", "+ embedding : float[1536]"
        ],
        "ops": ["+ similarity(vec) : float"]
    },

    # 6. Audit & Fiabilité
    "OutboxEvent": {
        "name": "OutboxEvent", "stereo": "entity", "domain": "audit", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ aggregateType : text",
            "+ eventType : text", "+ processed : boolean = false"
        ],
        "ops": ["+ markPublished() : void"]
    },
    "PulseEvent": {
        "name": "PulseEvent", "stereo": "event", "domain": "audit", "w": 380, "h": 230,
        "attrs": [
            "+ id : text [PK]", "+ channel : text", "+ eventName : text",
            "+ emittedAt : timestamp"
        ],
        "ops": ["+ broadcastSSE() : void"]
    },
    "AuditLog": {
        "name": "AuditLog", "stereo": "entity", "domain": "audit", "w": 380, "h": 255,
        "attrs": [
            "+ id : text [PK]", "+ workspaceId : text [FK]", "+ actorId : text",
            "+ action : text", "+ resource : text"
        ],
        "ops": ["+ exportLog() : json"]
    }
}


def render_svg_card(name, cdata, x, y, compact=False, custom_w=None, custom_h=None):
    """Génère le code SVG d'une carte UML avec typographie soignée."""
    w = custom_w or (240 if compact else cdata["w"])
    h = custom_h or (76 if compact else cdata["h"])
    th = DOMAIN_THEMES[cdata["domain"]]
    dashed_attr = 'stroke-dasharray="7,4"' if th.get("dashed") else ''
    
    out = []
    out.append(f'<g id="card-{name.lower()}">')
    out.append(f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" ry="8" fill="{th["bg"]}" stroke="{th["border"]}" stroke-width="2" {dashed_attr} filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))"/>')
    
    if compact:
        # En mode compact : Stéréotype + Nom gras + id [PK]
        out.append(f'  <text x="{x + w/2}" y="{y + 22}" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" font-style="italic" fill="{th["sub"]}" text-anchor="middle">&#171;{cdata["stereo"]}&#187;</text>')
        out.append(f'  <text x="{x + w/2}" y="{y + 44}" font-family="Plus Jakarta Sans, sans-serif" font-size="15" font-weight="800" fill="{th["title"]}" text-anchor="middle">{name}</text>')
        out.append(f'  <line x1="{x}" y1="{y + 52}" x2="{x + w}" y2="{y + 52}" stroke="{th["sep"]}" stroke-width="1.2"/>')
        out.append(f'  <text x="{x + w/2}" y="{y + 68}" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="600" fill="#475569" text-anchor="middle">+ id : text [PK]</text>')
    else:
        # En mode détaillé complet
        out.append(f'  <text x="{x + w/2}" y="{y + 26}" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" font-style="italic" fill="{th["sub"]}" text-anchor="middle">&#171;{cdata["stereo"]}&#187;</text>')
        out.append(f'  <text x="{x + w/2}" y="{y + 50}" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="800" fill="{th["title"]}" text-anchor="middle">{name}</text>')
        out.append(f'  <line x1="{x}" y1="{y + 60}" x2="{x + w}" y2="{y + 60}" stroke="{th["sep"]}" stroke-width="1.8"/>')
        curr_y = y + 84
        for a in cdata["attrs"]:
            out.append(f'  <text x="{x + 16}" y="{curr_y}" font-family="JetBrains Mono, monospace" font-size="13" font-weight="600" fill="#0F172A">{html.escape(a)}</text>')
            curr_y += 24
        if cdata.get("ops"):
            out.append(f'  <line x1="{x}" y1="{curr_y}" x2="{x + w}" y2="{curr_y}" stroke="{th["sep"]}" stroke-width="1.8"/>')
            curr_y += 24
            for op in cdata["ops"]:
                out.append(f'  <text x="{x + 16}" y="{curr_y}" font-family="JetBrains Mono, monospace" font-size="13" font-weight="600" fill="#334155">{html.escape(op)}</text>')
                curr_y += 24
    out.append('</g>')
    return '\n'.join(out)


def render_svg_route(pts, rtype, lbl):
    """Rendu d'un connecteur avec pill-label lisible."""
    pts_str = " ".join([f"{p[0]},{p[1]}" for p in pts])
    line_class = "#0F172A" if rtype in ["comp", "aggr"] else ("#475569" if rtype == "dep" else "#2563EB")
    dash_attr = 'stroke-dasharray="6,4"' if rtype == "dep" else ''
    marker_start = 'marker-start="url(#comp-diamond)"' if rtype == "comp" else ('marker-start="url(#aggr-diamond)"' if rtype == "aggr" else '')
    marker_end = 'marker-end="url(#nav-arrow)"' if rtype == "directed" else ('marker-end="url(#dep-arrow)"' if rtype == "dep" else '')

    out = []
    out.append(f'<polyline points="{pts_str}" fill="none" stroke="{line_class}" stroke-width="2" {dash_attr} {marker_start} {marker_end}/>')
    
    # Calcul du point central
    mid = len(pts) // 2
    p1, p2 = pts[mid - 1], pts[mid]
    lx = (p1[0] + p2[0]) / 2
    ly = (p1[1] + p2[1]) / 2 - 9

    lbl_w = len(lbl) * 7.2 + 14
    lbl_h = 20
    out.append(f'<rect x="{lx - lbl_w/2}" y="{ly - 13}" width="{lbl_w}" height="{lbl_h}" rx="4" ry="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>')
    out.append(f'<text x="{lx}" y="{ly + 1}" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#0F172A" text-anchor="middle">{html.escape(lbl)}</text>')
    return '\n'.join(out)


def build_svg_document(width, height, content_elements):
    """Enveloppe SVG complète avec définitions de marqueurs et polices."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
<defs>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;family=JetBrains+Mono:wght@500;600&amp;display=swap');
    </style>
    <marker id="comp-diamond" viewBox="0 0 14 14" refX="1" refY="7" markerWidth="13" markerHeight="13" orient="auto">
        <polygon points="1,7 7,2 13,7 7,12" fill="#0F172A" stroke="#0F172A" stroke-width="1"/>
    </marker>
    <marker id="aggr-diamond" viewBox="0 0 14 14" refX="1" refY="7" markerWidth="13" markerHeight="13" orient="auto">
        <polygon points="1,7 7,2 13,7 7,12" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    </marker>
    <marker id="nav-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto">
        <polygon points="1,2 10,6 1,10" fill="#2563EB"/>
    </marker>
    <marker id="dep-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto">
        <polyline points="2,2 10,6 2,10" fill="none" stroke="#475569" stroke-width="2"/>
    </marker>
</defs>
<rect width="{width}" height="{height}" fill="#FAFAFA"/>
{content_elements}
</svg>'''


def save_deliverables(base_name, svg_content, title_fr):
    """Sauvegarde les formats SVG, PNG 300 DPI et PDF."""
    svg_path = os.path.join(OUTPUT_DIR, f"{base_name}.svg")
    png_path = os.path.join(OUTPUT_DIR, f"{base_name}.png")
    pdf_path = os.path.join(OUTPUT_DIR, f"{base_name}.pdf")

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

    # Conversion haute résolution 300 DPI via PyMuPDF
    doc = pymupdf.open(stream=svg_content.encode("utf-8"), filetype="svg")
    pdf_bytes = doc.convert_to_pdf()
    pdf_doc = pymupdf.open("pdf", pdf_bytes)
    pdf_doc.save(pdf_path)

    page = pdf_doc[0]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(2.0, 2.0))
    pix.save(png_path)
    
    # Copie dans diagrammes/ également pour commodité
    with open(os.path.join("diagrammes", f"{base_name}.png"), "wb") as f:
        f.write(open(png_path, "rb").read())
    with open(os.path.join("diagrammes", f"{base_name}.svg"), "w", encoding="utf-8") as f:
        f.write(svg_content)

    print(f"Écrit : {base_name} ({title_fr}) -> PNG ({pix.width}x{pix.height})")


# =============================================================================
# 1. VUE GLOBALE CONCEPTUELLE SIMPLIFIÉE (24 classes compactes, 1500 x 980 px)
# =============================================================================
def generate_simplified_global():
    W, H = 1580, 1020
    cw, ch = 240, 76
    
    # Grille à 5 colonnes bien aérée
    # Col 1 : x=50 (Client, Etablissement, Config IA)
    # Col 2 : x=350 (Workspace, Ticket, KnowledgeDocument)
    # Col 3 : x=660 (Membership, TicketActivity, TicketAssignment, KnowledgeChunk)
    # Col 4 : x=970 (User, Conversation, ConversationShare, Supervisor IA)
    # Col 5 : x=1280 (AgentProfile, Skill, ConversationMessage, Outbox, Audit)
    
    positions = {
        # Col 1
        "Customer": (50, 420),
        "Establishment": (50, 160),
        "AiConfiguration": (50, 740),
        
        # Col 2
        "Workspace": (350, 50),
        "Ticket": (350, 420),
        "KnowledgeDocument": (350, 740),
        
        # Col 3
        "Membership": (660, 50),
        "TicketActivity": (660, 360),
        "TicketAssignment": (660, 480),
        "TicketShare": (660, 600),
        "KnowledgeChunk": (660, 740),
        
        # Col 4
        "User": (970, 50),
        "Conversation": (970, 420),
        "ConversationShare": (970, 560),
        "AiAssistantSupervisor": (970, 740),
        
        # Col 5
        "WorkspaceInvitation": (970, 170),
        "AgentProfile": (1280, 50),
        "Skill": (1280, 170),
        "AgentSkill": (1280, 290),
        "AssignmentEngine": (1280, 420),
        "ConversationMessage": (1280, 560),
        "OutboxEvent": (1280, 700),
        "PulseEvent": (1280, 810),
        "AuditLog": (1280, 920),
    }

    # Calcul des ancres compactes
    anc = {}
    for name, (x, y) in positions.items():
        anc[name.lower()] = {
            "top": (x + cw/2, y),
            "bottom": (x + cw/2, y + ch),
            "left": (x, y + ch/2),
            "right": (x + cw, y + ch/2),
            "center": (x + cw/2, y + ch/2)
        }

    routes = [
        # Multi-Tenant
        ("workspace", "membership", [anc["workspace"]["right"], anc["membership"]["left"]], "comp", "contient (1 .. 0..*)"),
        ("workspace", "establishment", [anc["workspace"]["left"], (anc["establishment"]["top"][0] + 50, anc["workspace"]["left"][1]), anc["establishment"]["top"]], "comp", "possède (1 .. 0..*)"),
        ("user", "membership", [anc["user"]["left"], anc["membership"]["right"]], "assoc", "adhère (1 .. 0..*)"),
        ("user", "workspaceinvitation", [anc["user"]["bottom"], anc["workspaceinvitation"]["top"]], "assoc", "invite (1 .. 0..*)"),
        ("user", "agentprofile", [anc["user"]["right"], anc["agentprofile"]["left"]], "assoc", "incarne (1 .. 0..*)"),
        ("agentprofile", "agentskill", [anc["agentprofile"]["bottom"], anc["agentskill"]["top"]], "comp", "détient (1 .. 0..*)"),
        ("skill", "agentskill", [anc["skill"]["bottom"], anc["agentskill"]["top"]], "aggr", "qualifie (1 .. 0..*)"),
        ("assignmentengine", "agentprofile", [anc["assignmentengine"]["top"], (anc["assignmentengine"]["top"][0] + 40, anc["assignmentengine"]["top"][1] - 40), (anc["agentprofile"]["bottom"][0] + 40, anc["assignmentengine"]["top"][1] - 40), (anc["agentprofile"]["bottom"][0] + 40, anc["agentprofile"]["bottom"][1])], "dep", "évalue"),
        ("assignmentengine", "ticket", [anc["assignmentengine"]["left"], (anc["assignmentengine"]["left"][0] - 20, anc["assignmentengine"]["left"][1]), (anc["assignmentengine"]["left"][0] - 20, anc["ticket"]["top"][1] - 25), (anc["ticket"]["top"][0] + 80, anc["ticket"]["top"][1] - 25), (anc["ticket"]["top"][0] + 80, anc["ticket"]["top"][1])], "dep", "affecte"),

        # SAV & Tickets
        ("workspace", "ticket", [anc["workspace"]["bottom"], anc["ticket"]["top"]], "comp", "gère (1 .. 0..*)"),
        ("customer", "ticket", [anc["customer"]["right"], anc["ticket"]["left"]], "assoc", "soumet (1 .. 0..*)"),
        ("ticket", "ticketactivity", [anc["ticket"]["right"], (anc["ticket"]["right"][0] + 35, anc["ticket"]["right"][1]), (anc["ticket"]["right"][0] + 35, anc["ticketactivity"]["left"][1]), anc["ticketactivity"]["left"]], "comp", "historise (1 .. 1..*)"),
        ("ticket", "ticketassignment", [anc["ticket"]["right"], anc["ticketassignment"]["left"]], "comp", "retrace (1 .. 0..*)"),
        ("ticket", "ticketshare", [anc["ticket"]["right"], (anc["ticket"]["right"][0] + 35, anc["ticket"]["right"][1]), (anc["ticket"]["right"][0] + 35, anc["ticketshare"]["left"][1]), anc["ticketshare"]["left"]], "comp", "partage (1 .. 0..*)"),
        ("conversation", "ticket", [anc["conversation"]["left"], (anc["ticket"]["right"][0] + 50, anc["conversation"]["left"][1]), (anc["ticket"]["right"][0] + 50, anc["ticket"]["right"][1] + 15), (anc["ticket"]["right"][0], anc["ticket"]["right"][1] + 15)], "assoc", "élévation (0..1)"),

        # Conversations
        ("customer", "conversation", [anc["customer"]["bottom"], (anc["customer"]["bottom"][0], anc["customer"]["bottom"][1] + 40), (anc["conversation"]["bottom"][0] - 80, anc["customer"]["bottom"][1] + 40), (anc["conversation"]["bottom"][0] - 80, anc["conversation"]["bottom"][1])], "assoc", "échange via (1 .. 0..*)"),
        ("conversation", "conversationmessage", [anc["conversation"]["right"], (anc["conversation"]["right"][0] + 35, anc["conversation"]["right"][1]), (anc["conversation"]["right"][0] + 35, anc["conversationmessage"]["left"][1]), anc["conversationmessage"]["left"]], "comp", "compose (1 .. 1..*)"),
        ("conversation", "conversationshare", [anc["conversation"]["bottom"], anc["conversationshare"]["top"]], "comp", "partage (1 .. 0..*)"),

        # IA & RAG
        ("workspace", "knowledgedocument", [anc["workspace"]["left"], (anc["workspace"]["left"][0] - 40, anc["workspace"]["left"][1]), (anc["workspace"]["left"][0] - 40, anc["knowledgedocument"]["top"][1] - 30), anc["knowledgedocument"]["top"]], "comp", "possède (1 .. 0..*)"),
        ("knowledgedocument", "knowledgechunk", [anc["knowledgedocument"]["right"], anc["knowledgechunk"]["left"]], "comp", "découpé en (1 .. 1..*)"),
        ("aiassistantsupervisor", "knowledgechunk", [anc["aiassistantsupervisor"]["left"], anc["knowledgechunk"]["right"]], "dep", "recherche sémantique"),
        ("aiassistantsupervisor", "conversation", [anc["aiassistantsupervisor"]["top"], anc["conversation"]["bottom"]], "dep", "assiste"),
        ("aiconfiguration", "aiassistantsupervisor", [anc["aiconfiguration"]["bottom"], (anc["aiconfiguration"]["bottom"][0], anc["aiconfiguration"]["bottom"][1] + 30), (anc["aiassistantsupervisor"]["bottom"][0] - 40, anc["aiconfiguration"]["bottom"][1] + 30), (anc["aiassistantsupervisor"]["bottom"][0] - 40, anc["aiassistantsupervisor"]["bottom"][1])], "assoc", "configure"),

        # Audit & Fiabilité
        ("workspace", "outboxevent", [anc["workspace"]["top"], (anc["workspace"]["top"][0], anc["workspace"]["top"][1] - 30), (anc["outboxevent"]["top"][0], anc["workspace"]["top"][1] - 30), anc["outboxevent"]["top"]], "comp", "génère (1 .. 0..*)"),
        ("conversationmessage", "pulseevent", [anc["conversationmessage"]["bottom"], anc["pulseevent"]["top"]], "dep", "déclenche"),
        ("workspace", "auditlog", [anc["workspace"]["top"], (anc["workspace"]["top"][0] - 20, anc["workspace"]["top"][1] - 40), (anc["auditlog"]["top"][0] + 30, anc["workspace"]["top"][1] - 40), (anc["auditlog"]["top"][0] + 30, anc["auditlog"]["top"][1])], "comp", "consigne (1 .. 0..*)")
    ]

    elements = []
    # Rendu des routes d'abord (en arrière-plan)
    for src, tgt, pts, rtype, lbl in routes:
        elements.append(render_svg_route(pts, rtype, lbl))

    # Rendu des 24 cartes compactes au premier plan
    for name, (x, y) in positions.items():
        elements.append(render_svg_card(name, CLASSES_DATA[name], x, y, compact=True, custom_w=cw, custom_h=ch))

    svg_content = build_svg_document(W, H, '\n'.join(elements))
    save_deliverables("Figure_3_10_Zadesk_Vue_Globale_Simplifiee", svg_content, "Vue Globale Conceptuelle")


# =============================================================================
# 2. VUES DÉTAILLÉES PAR DOMAINE MÉTIER (4 à 6 classes, format Word Portrait 16:9)
# =============================================================================

def generate_domain_1_multitenant():
    """Domaine 1 : Multi-Tenant, Entreprises & Collaborateurs (5 classes)"""
    W, H = 1450, 880
    classes = ["Workspace", "Establishment", "Membership", "WorkspaceInvitation", "User"]
    
    positions = {
        "Workspace": (60, 80),
        "Establishment": (60, 510),
        "Membership": (540, 80),
        "WorkspaceInvitation": (540, 480),
        "User": (1020, 80)
    }
    
    anc = {k.lower(): {
        "top": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1]),
        "bottom": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1] + CLASSES_DATA[k]["h"]),
        "left": (positions[k][0], positions[k][1] + CLASSES_DATA[k]["h"]/2),
        "right": (positions[k][0] + CLASSES_DATA[k]["w"], positions[k][1] + CLASSES_DATA[k]["h"]/2),
    } for k in classes}

    routes = [
        ("workspace", "membership", [anc["workspace"]["right"], anc["membership"]["left"]], "comp", "contient (1 .. 0..*)"),
        ("workspace", "establishment", [anc["workspace"]["bottom"], anc["establishment"]["top"]], "comp", "possède (1 .. 0..*)"),
        ("user", "membership", [anc["user"]["left"], anc["membership"]["right"]], "assoc", "adhère (1 .. 0..*)"),
        ("user", "workspaceinvitation", [anc["user"]["bottom"], (anc["user"]["bottom"][0], anc["workspaceinvitation"]["top"][1] - 40), (anc["workspaceinvitation"]["top"][0] + 60, anc["workspaceinvitation"]["top"][1] - 40), (anc["workspaceinvitation"]["top"][0] + 60, anc["workspaceinvitation"]["top"][1])], "assoc", "invite (1 .. 0..*)"),
        ("workspace", "workspaceinvitation", [anc["workspace"]["bottom"], (anc["workspace"]["bottom"][0] + 60, anc["workspace"]["bottom"][1] + 35), (anc["workspaceinvitation"]["left"][0], anc["workspace"]["bottom"][1] + 35), anc["workspaceinvitation"]["left"]], "comp", "émet (1 .. 0..*)")
    ]

    elements = [render_svg_route(pts, rt, lbl) for s, t, pts, rt, lbl in routes]
    for k in classes:
        elements.append(render_svg_card(k, CLASSES_DATA[k], positions[k][0], positions[k][1]))

    svg_content = build_svg_document(W, H, '\n'.join(elements))
    save_deliverables("Figure_3_11_Zadesk_Domaine_1_MultiTenant", svg_content, "Domaine 1 : Multi-Tenant & Utilisateurs")


def generate_domain_2_sav_tickets():
    """Domaine 2 : Demandes SAV, Billetterie & Affectation (6 classes)"""
    W, H = 1450, 950
    classes = ["Customer", "Ticket", "TicketActivity", "TicketAssignment", "TicketShare", "AgentProfile"]
    
    positions = {
        "Customer": (60, 100),
        "Ticket": (540, 60),
        "TicketActivity": (1020, 60),
        "TicketAssignment": (540, 580),
        "TicketShare": (1020, 580),
        "AgentProfile": (60, 520)
    }

    anc = {k.lower(): {
        "top": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1]),
        "bottom": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1] + CLASSES_DATA[k]["h"]),
        "left": (positions[k][0], positions[k][1] + CLASSES_DATA[k]["h"]/2),
        "right": (positions[k][0] + CLASSES_DATA[k]["w"], positions[k][1] + CLASSES_DATA[k]["h"]/2),
    } for k in classes}

    routes = [
        ("customer", "ticket", [anc["customer"]["right"], (anc["customer"]["right"][0] + 50, anc["customer"]["right"][1]), (anc["customer"]["right"][0] + 50, anc["ticket"]["left"][1] - 40), (anc["ticket"]["left"][0], anc["ticket"]["left"][1] - 40)], "assoc", "soumet (1 .. 0..*)"),
        ("ticket", "ticketactivity", [anc["ticket"]["right"], anc["ticketactivity"]["left"]], "comp", "historise (1 .. 1..*)"),
        ("ticket", "ticketassignment", [anc["ticket"]["bottom"], anc["ticketassignment"]["top"]], "comp", "retrace (1 .. 0..*)"),
        ("ticket", "ticketshare", [anc["ticket"]["bottom"], (anc["ticket"]["bottom"][0] + 60, anc["ticket"]["bottom"][1] + 40), (anc["ticketshare"]["left"][0] - 40, anc["ticket"]["bottom"][1] + 40), (anc["ticketshare"]["left"][0] - 40, anc["ticketshare"]["left"][1]), anc["ticketshare"]["left"]], "comp", "partage (1 .. 0..*)"),
        ("agentprofile", "ticket", [anc["agentprofile"]["top"], (anc["agentprofile"]["top"][0], anc["ticket"]["left"][1] + 60), (anc["ticket"]["left"][0], anc["ticket"]["left"][1] + 60)], "directed", "traite (0..1 .. 0..*)"),
        ("agentprofile", "ticketassignment", [anc["agentprofile"]["right"], anc["ticketassignment"]["left"]], "assoc", "exécute (1 .. 0..*)")
    ]

    elements = [render_svg_route(pts, rt, lbl) for s, t, pts, rt, lbl in routes]
    for k in classes:
        elements.append(render_svg_card(k, CLASSES_DATA[k], positions[k][0], positions[k][1]))

    svg_content = build_svg_document(W, H, '\n'.join(elements))
    save_deliverables("Figure_3_12_Zadesk_Domaine_2_SAV_Tickets", svg_content, "Domaine 2 : SAV & Billetterie")


def generate_domain_3_conversations():
    """Domaine 3 : Conversations Omnicanal & Streaming Temps Réel (5 classes)"""
    W, H = 1450, 850
    classes = ["Customer", "Conversation", "ConversationMessage", "ConversationShare", "PulseEvent"]
    
    positions = {
        "Customer": (60, 80),
        "Conversation": (540, 80),
        "ConversationMessage": (1020, 80),
        "ConversationShare": (540, 520),
        "PulseEvent": (1020, 520)
    }

    anc = {k.lower(): {
        "top": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1]),
        "bottom": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1] + CLASSES_DATA[k]["h"]),
        "left": (positions[k][0], positions[k][1] + CLASSES_DATA[k]["h"]/2),
        "right": (positions[k][0] + CLASSES_DATA[k]["w"], positions[k][1] + CLASSES_DATA[k]["h"]/2),
    } for k in classes}

    routes = [
        ("customer", "conversation", [anc["customer"]["right"], anc["conversation"]["left"]], "assoc", "échange via (1 .. 0..*)"),
        ("conversation", "conversationmessage", [anc["conversation"]["right"], anc["conversationmessage"]["left"]], "comp", "compose (1 .. 1..*)"),
        ("conversation", "conversationshare", [anc["conversation"]["bottom"], anc["conversationshare"]["top"]], "comp", "partage (1 .. 0..*)"),
        ("conversationmessage", "pulseevent", [anc["conversationmessage"]["bottom"], anc["pulseevent"]["top"]], "dep", "déclenche SSE"),
    ]

    elements = [render_svg_route(pts, rt, lbl) for s, t, pts, rt, lbl in routes]
    for k in classes:
        elements.append(render_svg_card(k, CLASSES_DATA[k], positions[k][0], positions[k][1]))

    svg_content = build_svg_document(W, H, '\n'.join(elements))
    save_deliverables("Figure_3_13_Zadesk_Domaine_3_Conversations_TempsReel", svg_content, "Domaine 3 : Conversations & SSE")


def generate_domain_4_agents_skills():
    """Domaine 4 : Conseillers, Compétences & Moteur d'Attribution (5 classes)"""
    W, H = 1450, 850
    classes = ["User", "AgentProfile", "Skill", "AgentSkill", "AssignmentEngine"]
    
    positions = {
        "User": (60, 80),
        "AgentProfile": (540, 80),
        "Skill": (1020, 80),
        "AssignmentEngine": (60, 480),
        "AgentSkill": (540, 510)
    }

    anc = {k.lower(): {
        "top": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1]),
        "bottom": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1] + CLASSES_DATA[k]["h"]),
        "left": (positions[k][0], positions[k][1] + CLASSES_DATA[k]["h"]/2),
        "right": (positions[k][0] + CLASSES_DATA[k]["w"], positions[k][1] + CLASSES_DATA[k]["h"]/2),
    } for k in classes}

    routes = [
        ("user", "agentprofile", [anc["user"]["right"], anc["agentprofile"]["left"]], "assoc", "incarne (1 .. 0..*)"),
        ("agentprofile", "agentskill", [anc["agentprofile"]["bottom"], anc["agentskill"]["top"]], "comp", "détient (1 .. 0..*)"),
        ("skill", "agentskill", [anc["skill"]["bottom"], (anc["skill"]["bottom"][0], anc["agentskill"]["right"][1]), anc["agentskill"]["right"]], "aggr", "qualifie (1 .. 0..*)"),
        ("assignmentengine", "agentprofile", [anc["assignmentengine"]["top"], (anc["assignmentengine"]["top"][0], anc["agentprofile"]["left"][1] + 40), (anc["agentprofile"]["left"][0], anc["agentprofile"]["left"][1] + 40)], "dep", "évalue capacité"),
    ]

    elements = [render_svg_route(pts, rt, lbl) for s, t, pts, rt, lbl in routes]
    for k in classes:
        elements.append(render_svg_card(k, CLASSES_DATA[k], positions[k][0], positions[k][1]))

    svg_content = build_svg_document(W, H, '\n'.join(elements))
    save_deliverables("Figure_3_14_Zadesk_Domaine_4_Agents_Competences", svg_content, "Domaine 4 : Conseillers & Compétences")


def generate_domain_5_ai_rag():
    """Domaine 5 : Architecture Cible IA & RAG (5 classes)"""
    W, H = 1450, 850
    classes = ["Workspace", "KnowledgeDocument", "KnowledgeChunk", "AiAssistantSupervisor", "AiConfiguration"]
    
    positions = {
        "Workspace": (60, 80),
        "KnowledgeDocument": (540, 80),
        "KnowledgeChunk": (1020, 80),
        "AiConfiguration": (60, 520),
        "AiAssistantSupervisor": (540, 480)
    }

    anc = {k.lower(): {
        "top": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1]),
        "bottom": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1] + CLASSES_DATA[k]["h"]),
        "left": (positions[k][0], positions[k][1] + CLASSES_DATA[k]["h"]/2),
        "right": (positions[k][0] + CLASSES_DATA[k]["w"], positions[k][1] + CLASSES_DATA[k]["h"]/2),
    } for k in classes}

    routes = [
        ("workspace", "knowledgedocument", [anc["workspace"]["right"], anc["knowledgedocument"]["left"]], "comp", "possède (1 .. 0..*)"),
        ("knowledgedocument", "knowledgechunk", [anc["knowledgedocument"]["right"], anc["knowledgechunk"]["left"]], "comp", "découpé en (1 .. 1..*)"),
        ("aiassistantsupervisor", "knowledgechunk", [anc["aiassistantsupervisor"]["right"], (anc["knowledgechunk"]["bottom"][0], anc["aiassistantsupervisor"]["right"][1]), anc["knowledgechunk"]["bottom"]], "dep", "recherche sémantique"),
        ("aiconfiguration", "aiassistantsupervisor", [anc["aiconfiguration"]["right"], anc["aiassistantsupervisor"]["left"]], "assoc", "configure (1 .. 1)"),
        ("workspace", "aiconfiguration", [anc["workspace"]["bottom"], anc["aiconfiguration"]["top"]], "comp", "paramètre (1 .. 1)")
    ]

    elements = [render_svg_route(pts, rt, lbl) for s, t, pts, rt, lbl in routes]
    for k in classes:
        elements.append(render_svg_card(k, CLASSES_DATA[k], positions[k][0], positions[k][1]))

    svg_content = build_svg_document(W, H, '\n'.join(elements))
    save_deliverables("Figure_3_15_Zadesk_Domaine_5_IA_RAG", svg_content, "Domaine 5 : Architecture Cible IA & RAG")


def generate_domain_6_audit_outbox():
    """Domaine 6 : Fiabilité, Transactional Outbox & Piste d'Audit (4 classes)"""
    W, H = 1450, 800
    classes = ["Workspace", "OutboxEvent", "PulseEvent", "AuditLog"]
    
    positions = {
        "Workspace": (100, 100),
        "OutboxEvent": (600, 100),
        "PulseEvent": (1050, 100),
        "AuditLog": (600, 460)
    }

    anc = {k.lower(): {
        "top": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1]),
        "bottom": (positions[k][0] + CLASSES_DATA[k]["w"]/2, positions[k][1] + CLASSES_DATA[k]["h"]),
        "left": (positions[k][0], positions[k][1] + CLASSES_DATA[k]["h"]/2),
        "right": (positions[k][0] + CLASSES_DATA[k]["w"], positions[k][1] + CLASSES_DATA[k]["h"]/2),
    } for k in classes}

    routes = [
        ("workspace", "outboxevent", [anc["workspace"]["right"], anc["outboxevent"]["left"]], "comp", "génère (1 .. 0..*)"),
        ("workspace", "auditlog", [anc["workspace"]["bottom"], (anc["workspace"]["bottom"][0], anc["auditlog"]["left"][1]), anc["auditlog"]["left"]], "comp", "consigne (1 .. 0..*)"),
        ("outboxevent", "pulseevent", [anc["outboxevent"]["right"], anc["pulseevent"]["left"]], "dep", "publie via Redis")
    ]

    elements = [render_svg_route(pts, rt, lbl) for s, t, pts, rt, lbl in routes]
    for k in classes:
        elements.append(render_svg_card(k, CLASSES_DATA[k], positions[k][0], positions[k][1]))

    svg_content = build_svg_document(W, H, '\n'.join(elements))
    save_deliverables("Figure_3_16_Zadesk_Domaine_6_Audit_Outbox", svg_content, "Domaine 6 : Fiabilité & Audit")


if __name__ == "__main__":
    print("=== DÉBUT GÉNÉRATION LIVRABLES OPTION B ===")
    generate_simplified_global()
    generate_domain_1_multitenant()
    generate_domain_2_sav_tickets()
    generate_domain_3_conversations()
    generate_domain_4_agents_skills()
    generate_domain_5_ai_rag()
    generate_domain_6_audit_outbox()
    print("=== TOUS LES LIVRABLES OPTION B ONT ÉTÉ GÉNÉRÉS AVEC SUCCÈS ===")
