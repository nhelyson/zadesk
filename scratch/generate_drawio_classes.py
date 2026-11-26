# -*- coding: utf-8 -*-
import os
import html
import xml.etree.ElementTree as ET

base_dir = r"livrables_memoire\3.3.2_modele_classes"
drawio_dir = os.path.join(base_dir, "drawio")
os.makedirs(drawio_dir, exist_ok=True)

def build_drawio_xml():
    page_w = 2600
    page_h = 2280

    xml = []
    xml.append('<mxfile host="app.diagrams.net" modified="2026-11-22T16:15:00.000Z" agent="Antigravity" version="24.0.0">')
    xml.append('  <diagram id="zalisk-modele-classes" name="Zalisk - Modèle de Classes UML">')
    xml.append(f'    <mxGraphModel dx="2600" dy="2200" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{page_w}" pageHeight="{page_h}" math="0" shadow="0">')
    xml.append('      <root>')
    xml.append('        <mxCell id="0" />')
    xml.append('        <mxCell id="1" parent="0" />')

    # Titre du diagramme
    title_html = html.escape('<div style="text-align:center;"><b style="font-size:20px;color:#0F172A;font-family:Segoe UI,Helvetica,Arial,sans-serif;">PLATEFORME SAAS ZALISK — DIAGRAMME DE CLASSES MÉTIER (UML 2.5)</b><br/><span style="font-size:12px;color:#475569;font-family:Segoe UI,Helvetica,Arial,sans-serif;">Architecture Multi-Tenant • Gestion Omnicanale des Conversations & Tickets SAV • Abonnements SasPay</span></div>')
    xml.append(f'        <mxCell id="title" value="{title_html}" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">')
    xml.append(f'          <mxGeometry x="700" y="25" width="1200" height="50" as="geometry" />')
    xml.append('        </mxCell>')

    # 4 Packages
    packages = [
        ("pkg_1", "1. Multi-Tenant & Gestion des Utilisateurs", 60, 95, 780, 980, "#EFF6FF", "#2563EB"),
        ("pkg_2", "2. Conversations Omnicanales & Tickets SAV", 880, 95, 1640, 980, "#ECFDF5", "#059669"),
        ("pkg_3", "3. Organisation SAV, Compétences & Agences", 60, 1110, 780, 1080, "#FFFBEB", "#D97706"),
        ("pkg_4", "4. Gestion Commerciale & Abonnements (SasPay)", 880, 1110, 1640, 1080, "#FAF5FF", "#7C3AED"),
    ]

    for pid, pname, px, py, pw, ph, bg, border in packages:
        lbl = html.escape(f'<div style="padding-left:10px;padding-top:6px;"><b style="font-size:13px;color:{border};font-family:Segoe UI,sans-serif;">{pname}</b></div>')
        style = f"rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor={border};strokeWidth=1.8;verticalAlign=top;align=left;shadow=0;"
        xml.append(f'        <mxCell id="{pid}" value="{lbl}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{px}" y="{py}" width="{pw}" height="{ph}" as="geometry" />')
        xml.append('        </mxCell>')

    def make_class(cid, cname, pkg_border, hdr_bg, x, y, w, h, attrs, stereo="entity"):
        lines = []
        lines.append('<div style="text-align:center;padding:4px 0 2px 0;">')
        lines.append(f'<span style="font-size:9.5px;font-style:italic;color:#64748B;font-family:Segoe UI,sans-serif;">&laquo;{stereo}&raquo;</span><br/>')
        lines.append(f'<b style="font-size:12.5px;color:#0F172A;font-family:Segoe UI,sans-serif;">{cname}</b>')
        lines.append('</div>')
        lines.append('<hr style="border:none;border-top:1px solid #CBD5E1;margin:2px 0;"/>')
        lines.append('<div style="text-align:left;padding:3px 8px;font-family:Consolas,monospace;font-size:10px;color:#0F172A;line-height:1.4;">')
        for a in attrs:
            lines.append(f'{html.escape(a)}<br/>')
        lines.append('</div>')
        val = html.escape("".join(lines))
        style = f"rounded=1;whiteSpace=wrap;html=1;fillColor={hdr_bg};strokeColor={pkg_border};strokeWidth=1.4;verticalAlign=top;align=center;shadow=0;"
        return f'        <mxCell id="{cid}" value="{val}" style="{style}" vertex="1" parent="1">\n          <mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry" />\n        </mxCell>'

    # Classes Package 1
    # Workspace
    ws_attrs = [
        "+ id: String [PK]",
        "+ name: String",
        "+ slug: String [UQ]",
        "+ isPublic: Boolean",
        "+ hasExistingSav: Boolean",
        "+ timezone: String",
        "+ supportEmail: String",
        "+ supportPhone: String",
        "+ createdAt: DateTime",
        "+ updatedAt: DateTime"
    ]
    xml.append(make_class("cls_workspace", "Workspace", "#2563EB", "#EFF6FF", 100, 150, 240, 200, ws_attrs))

    # User
    u_attrs = [
        "+ id: String [PK]",
        "+ email: String [UQ]",
        "+ firstName: String",
        "+ lastName: String",
        "+ emailVerified: Boolean",
        "+ avatarUrl: String",
        "+ createdAt: DateTime",
        "+ updatedAt: DateTime"
    ]
    xml.append(make_class("cls_user", "User", "#2563EB", "#EFF6FF", 540, 150, 240, 180, u_attrs))

    # Membership
    m_attrs = [
        "+ id: String [PK]",
        "+ userId: String [FK]",
        "+ workspaceId: String [FK]",
        "+ role: Role",
        "+ status: MembershipStatus",
        "+ suspendedAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_membership", "Membership", "#2563EB", "#EFF6FF", 320, 420, 240, 170, m_attrs))

    # WorkspaceInvitation
    inv_attrs = [
        "+ id: String [PK]",
        "+ email: String",
        "+ workspaceId: String [FK]",
        "+ role: Role",
        "+ token: String [UQ]",
        "+ expiresAt: DateTime",
        "+ acceptedAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_invitation", "WorkspaceInvitation", "#2563EB", "#EFF6FF", 100, 670, 240, 180, inv_attrs))

    # Enums Pkg 1
    xml.append(make_class("enum_role", "Role", "#2563EB", "#FFFFFF", 540, 420, 190, 110, ["OWNER", "ADMIN", "MANAGER", "AGENT"], stereo="enum"))
    xml.append(make_class("enum_membership_status", "MembershipStatus", "#2563EB", "#FFFFFF", 540, 560, 190, 95, ["ACTIVE", "SUSPENDED", "ARCHIVED"], stereo="enum"))

    # Classes Package 2 (Conversations & Tickets SAV)
    # Conversation
    conv_attrs = [
        "+ id: String [PK]",
        "+ workspaceId: String [FK]",
        "+ customerName: String",
        "+ customerEmail: String",
        "+ channel: String",
        "+ status: ConversationStatus",
        "+ priority: TicketPriority",
        "+ sessionToken: String [UQ]",
        "+ lastMessageAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_conversation", "Conversation", "#059669", "#ECFDF5", 920, 150, 250, 200, conv_attrs))

    # ConversationMessage
    msg_attrs = [
        "+ id: String [PK]",
        "+ conversationId: String [FK]",
        "+ senderId: String [FK]",
        "+ senderType: MessageType",
        "+ senderName: String",
        "+ content: String",
        "+ isInternalNote: Boolean",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_message", "ConversationMessage", "#059669", "#ECFDF5", 920, 430, 250, 180, msg_attrs))

    # Ticket
    t_attrs = [
        "+ id: String [PK]",
        "+ reference: String [UQ]",
        "+ workspaceId: String [FK]",
        "+ conversationId: String [FK, UQ]",
        "+ assignedAgentId: String [FK]",
        "+ title: String",
        "+ description: String",
        "+ priority: TicketPriority",
        "+ status: TicketStatus",
        "+ customerName: String",
        "+ slaDueAt: DateTime",
        "+ resolvedAt: DateTime",
        "+ closedAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_ticket", "Ticket", "#059669", "#ECFDF5", 1350, 150, 270, 260, t_attrs))

    # TicketAssignment
    asgn_attrs = [
        "+ id: String [PK]",
        "+ ticketId: String [FK]",
        "+ previousAgentId: String [FK]",
        "+ newAgentId: String [FK]",
        "+ assignedById: String [FK]",
        "+ reason: String",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_assignment", "TicketAssignment", "#059669", "#ECFDF5", 1800, 150, 240, 160, asgn_attrs))

    # TicketShare
    tshare_attrs = [
        "+ id: String [PK]",
        "+ ticketId: String [FK]",
        "+ agentId: String [FK]",
        "+ sharedById: String [FK]",
        "+ accessLevel: ShareAccessLevel",
        "+ expiresAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_ticket_share", "TicketShare", "#059669", "#ECFDF5", 1800, 370, 240, 160, tshare_attrs))

    # ConversationShare
    cshare_attrs = [
        "+ id: String [PK]",
        "+ conversationId: String [FK]",
        "+ agentId: String [FK]",
        "+ sharedById: String [FK]",
        "+ accessLevel: ShareAccessLevel",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_conv_share", "ConversationShare", "#059669", "#ECFDF5", 920, 690, 250, 150, cshare_attrs))

    # TicketActivity
    act_attrs = [
        "+ id: String [PK]",
        "+ ticketId: String [FK]",
        "+ authorId: String [FK]",
        "+ type: String",
        "+ content: String",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_activity", "TicketActivity", "#059669", "#ECFDF5", 1350, 500, 270, 150, act_attrs))

    # Enums Pkg 2
    xml.append(make_class("enum_ticket_status", "TicketStatus", "#059669", "#FFFFFF", 2130, 150, 210, 140, ["PENDING_ASSIGNMENT", "OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], stereo="enum"))
    xml.append(make_class("enum_priority", "TicketPriority", "#059669", "#FFFFFF", 2130, 320, 210, 110, ["LOW", "MEDIUM", "HIGH", "URGENT"], stereo="enum"))
    xml.append(make_class("enum_conv_status", "ConversationStatus", "#059669", "#FFFFFF", 2130, 460, 210, 125, ["WAITING_ASSIGNMENT", "ACTIVE", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"], stereo="enum"))
    xml.append(make_class("enum_msg_type", "MessageType", "#059669", "#FFFFFF", 2130, 610, 210, 110, ["CUSTOMER", "AGENT_REPLY", "INTERNAL_NOTE", "SYSTEM"], stereo="enum"))
    xml.append(make_class("enum_share_level", "ShareAccessLevel", "#059669", "#FFFFFF", 2130, 750, 210, 85, ["READ_ONLY", "CONTRIBUTE"], stereo="enum"))

    # Classes Package 3 (Organisation SAV & Compétences)
    # AgentProfile
    ap_attrs = [
        "+ id: String [PK]",
        "+ workspaceId: String [FK]",
        "+ userId: String [FK, UQ]",
        "+ availability: AgentAvailability",
        "+ maxCapacity: Int",
        "+ currentTicketsCount: Int",
        "+ autoAssignmentEnabled: Boolean",
        "+ title: String",
        "+ phone: String",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_agent_profile", "AgentProfile", "#D97706", "#FFFBEB", 100, 1170, 240, 200, ap_attrs))

    # Skill
    sk_attrs = [
        "+ id: String [PK]",
        "+ workspaceId: String [FK]",
        "+ name: String",
        "+ description: String",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_skill", "Skill", "#D97706", "#FFFBEB", 540, 1170, 240, 130, sk_attrs))

    # AgentSkill
    ask_attrs = [
        "+ id: String [PK]",
        "+ agentProfileId: String [FK]",
        "+ skillId: String [FK]",
        "+ validatedById: String [FK]",
        "+ validatedAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_agent_skill", "AgentSkill", "#D97706", "#FFFBEB", 320, 1450, 240, 140, ask_attrs))

    # Establishment
    est_attrs = [
        "+ id: String [PK]",
        "+ workspaceId: String [FK]",
        "+ name: String",
        "+ type: EstablishmentType",
        "+ address: String",
        "+ city: String",
        "+ country: String",
        "+ isMain: Boolean",
        "+ isActive: Boolean",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_establishment", "Establishment", "#D97706", "#FFFBEB", 100, 1720, 240, 200, est_attrs))

    # Enums Pkg 3
    xml.append(make_class("enum_availability", "AgentAvailability", "#D97706", "#FFFFFF", 540, 1450, 200, 110, ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"], stereo="enum"))
    xml.append(make_class("enum_est_type", "EstablishmentType", "#D97706", "#FFFFFF", 540, 1720, 200, 140, ["HEADQUARTERS", "BRANCH", "STORE", "SERVICE_POINT", "TECH_CENTER", "OTHER"], stereo="enum"))

    # Classes Package 4 (Gestion Commerciale & Abonnements SasPay)
    # Subscription
    sub_attrs = [
        "+ id: String [PK]",
        "+ workspaceId: String [FK, UQ]",
        "+ plan: PlanType",
        "+ status: SubscriptionStatus",
        "+ activePriceXaf: Int",
        "+ currentPeriodStart: DateTime",
        "+ currentPeriodEnd: DateTime",
        "+ gracePeriodEnd: DateTime",
        "+ version: Int",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_subscription", "Subscription", "#7C3AED", "#FAF5FF", 920, 1170, 250, 200, sub_attrs))

    # SubscriptionIntent
    intent_attrs = [
        "+ id: String [PK]",
        "+ workspaceId: String [FK]",
        "+ subscriptionId: String [FK]",
        "+ userId: String [FK]",
        "+ intentType: IntentType",
        "+ targetPlan: PlanType",
        "+ priceXaf: Int",
        "+ currency: String",
        "+ status: IntentStatus",
        "+ clientMutationKey: String [UQ]",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_intent", "SubscriptionIntent", "#7C3AED", "#FAF5FF", 1350, 1170, 270, 220, intent_attrs))

    # PaymentAttempt
    attempt_attrs = [
        "+ id: String [PK]",
        "+ intentId: String [FK]",
        "+ workspaceId: String [FK]",
        "+ attemptNumber: Int",
        "+ provider: String",
        "+ status: AttemptStatus",
        "+ localAttemptKey: String [UQ]",
        "+ expiresAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_attempt", "PaymentAttempt", "#7C3AED", "#FAF5FF", 1800, 1170, 240, 190, attempt_attrs))

    # PaymentTransaction
    tx_attrs = [
        "+ id: String [PK]",
        "+ receiptId: String [UQ]",
        "+ workspaceId: String [FK]",
        "+ subscriptionId: String [FK]",
        "+ intentId: String [FK]",
        "+ amountXaf: Int",
        "+ currency: String",
        "+ provider: String",
        "+ status: TransactionApplicationStatus",
        "+ paidAt: DateTime",
        "+ createdAt: DateTime"
    ]
    xml.append(make_class("cls_transaction", "PaymentTransaction", "#7C3AED", "#FAF5FF", 1350, 1540, 270, 220, tx_attrs))

    # Enums Pkg 4
    xml.append(make_class("enum_plan_type", "PlanType", "#7C3AED", "#FFFFFF", 2130, 1170, 210, 110, ["DECOUVERTE", "STARTER", "PRO", "ENTREPRISE"], stereo="enum"))
    xml.append(make_class("enum_sub_status", "SubscriptionStatus", "#7C3AED", "#FFFFFF", 2130, 1310, 210, 125, ["ACTIVE", "RENEWAL_DUE", "GRACE_PERIOD", "EXPIRED", "CANCELLED"], stereo="enum"))
    xml.append(make_class("enum_intent_type", "IntentType", "#7C3AED", "#FFFFFF", 2130, 1460, 210, 110, ["INITIAL_PURCHASE", "RENEWAL", "UPGRADE", "DOWNGRADE"], stereo="enum"))
    xml.append(make_class("enum_intent_status", "IntentStatus", "#7C3AED", "#FFFFFF", 2130, 1595, 210, 110, ["PENDING", "COMPLETED", "ABANDONED", "EXPIRED"], stereo="enum"))
    xml.append(make_class("enum_attempt_status", "AttemptStatus", "#7C3AED", "#FFFFFF", 2130, 1730, 210, 125, ["INITIATED", "CHECKOUT_CREATED", "PAYMENT_PENDING", "PAYMENT_CONFIRMED", "CONFIRMED_FAILURE"], stereo="enum"))

    # Connecteurs / Relations (UML 2.5)
    style_comp = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#1E293B;strokeWidth=1.5;startArrow=diamond;startFill=1;startSize=10;endArrow=none;fontSize=10;fontColor=#334155;fontFamily=Segoe UI;"
    style_assoc = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#1E293B;strokeWidth=1.5;startArrow=none;endArrow=none;fontSize=10;fontColor=#334155;fontFamily=Segoe UI;"

    relations = [
        # Pkg 1
        ("rel_ws_membership", "cls_workspace", "cls_membership", "compose", "1", "0..*", style_comp),
        ("rel_user_membership", "cls_user", "cls_membership", "adhère", "1", "0..*", style_assoc),
        ("rel_ws_invitation", "cls_workspace", "cls_invitation", "émet", "1", "0..*", style_comp),

        # Pkg 2
        ("rel_ws_conv", "cls_workspace", "cls_conversation", "regroupe", "1", "0..*", style_comp),
        ("rel_conv_msg", "cls_conversation", "cls_message", "contient", "1", "1..*", style_comp),
        ("rel_user_msg", "cls_user", "cls_message", "rédige", "0..1", "0..*", style_assoc),
        ("rel_ws_ticket", "cls_workspace", "cls_ticket", "gère", "1", "0..*", style_comp),
        ("rel_conv_ticket", "cls_conversation", "cls_ticket", "élévation", "0..1", "0..1", style_assoc),
        ("rel_user_ticket", "cls_user", "cls_ticket", "soumet", "0..1", "0..*", style_assoc),
        ("rel_ticket_asgn", "cls_ticket", "cls_assignment", "historique", "1", "0..*", style_comp),
        ("rel_user_asgn", "cls_user", "cls_assignment", "assigné", "1", "0..*", style_assoc),
        ("rel_ticket_share", "cls_ticket", "cls_ticket_share", "partagé via", "1", "0..*", style_comp),
        ("rel_user_tshare", "cls_user", "cls_ticket_share", "bénéficiaire", "1", "0..*", style_assoc),
        ("rel_conv_share", "cls_conversation", "cls_conv_share", "partagée via", "1", "0..*", style_comp),
        ("rel_user_cshare", "cls_user", "cls_conv_share", "bénéficiaire", "1", "0..*", style_assoc),
        ("rel_ticket_act", "cls_ticket", "cls_activity", "journalise", "1", "0..*", style_comp),

        # Pkg 3
        ("rel_ws_agent_profile", "cls_workspace", "cls_agent_profile", "emploie", "1", "0..*", style_comp),
        ("rel_user_agent_profile", "cls_user", "cls_agent_profile", "étendu par", "1", "0..1", style_assoc),
        ("rel_ap_agentskill", "cls_agent_profile", "cls_agent_skill", "maîtrise", "1", "0..*", style_comp),
        ("rel_skill_agentskill", "cls_skill", "cls_agent_skill", "certifie", "1", "0..*", style_assoc),
        ("rel_ws_skill", "cls_workspace", "cls_skill", "catalogue", "1", "0..*", style_comp),
        ("rel_ws_est", "cls_workspace", "cls_establishment", "déploie", "1", "0..*", style_comp),

        # Pkg 4
        ("rel_ws_sub", "cls_workspace", "cls_subscription", "souscrit", "1", "0..1", style_assoc),
        ("rel_sub_intent", "cls_subscription", "cls_intent", "prépare", "1", "0..*", style_comp),
        ("rel_intent_attempt", "cls_intent", "cls_attempt", "déclenche", "1", "0..*", style_comp),
        ("rel_sub_tx", "cls_subscription", "cls_transaction", "comptabilise", "1", "0..*", style_assoc),
        ("rel_intent_tx", "cls_intent", "cls_transaction", "valide", "1", "0..1", style_assoc),
    ]

    for rid, src, tgt, rlabel, scard, tcard, rstyle in relations:
        lbl_escaped = html.escape(rlabel)
        xml.append(f'        <mxCell id="{rid}" value="{lbl_escaped}" style="{rstyle}" edge="1" parent="1" source="{src}" target="{tgt}">')
        xml.append('          <mxGeometry relative="1" as="geometry" />')
        xml.append('        </mxCell>')
        if scard:
            xml.append(f'        <mxCell id="{rid}_src" value="{scard}" style="edgeLabel;html=1;align=left;verticalAlign=bottom;fontSize=10;fontColor=#1E293B;" vertex="1" connectable="0" parent="{rid}">')
            xml.append('          <mxGeometry x="-0.75" relative="1" as="geometry">')
            xml.append('            <mxPoint as="offset" />')
            xml.append('          </mxGeometry>')
            xml.append('        </mxCell>')
        if tcard:
            xml.append(f'        <mxCell id="{rid}_tgt" value="{tcard}" style="edgeLabel;html=1;align=right;verticalAlign=bottom;fontSize=10;fontColor=#1E293B;" vertex="1" connectable="0" parent="{rid}">')
            xml.append('          <mxGeometry x="0.75" relative="1" as="geometry">')
            xml.append('            <mxPoint as="offset" />')
            xml.append('          </mxGeometry>')
            xml.append('        </mxCell>')

    xml.append('      </root>')
    xml.append('    </mxGraphModel>')
    xml.append('  </diagram>')
    xml.append('</mxfile>')

    return "\n".join(xml)

drawio_xml = build_drawio_xml()
drawio_path = os.path.join(drawio_dir, "zalisk_modele_classes.drawio")

with open(drawio_path, "w", encoding="utf-8") as f:
    f.write(drawio_xml)

print(f"Draw.io XML written: {drawio_path} ({len(drawio_xml)} bytes)")

# Validate XML structure
try:
    tree = ET.fromstring(drawio_xml)
    print("Draw.io XML successfully validated with ElementTree!")
except Exception as e:
    print("XML Validation Error:", e)
