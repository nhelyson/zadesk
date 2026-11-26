import html
import xml.etree.ElementTree as ET

def create_drawio_xml():
    # Dimensions
    page_width = 2050
    page_height = 1260

    # System Boundary
    box_x = 320
    box_y = 60
    box_w = 1380
    box_h = 1140

    xml = []
    xml.append('<mxfile host="app.diagrams.net" modified="2026-11-22T12:00:00.000Z" agent="Antigravity" version="24.0.0">')
    xml.append('  <diagram id="zalisk-global-usecase" name="Zalisk - Cas d\'Utilisation Global">')
    xml.append(f'    <mxGraphModel dx="2200" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{page_width}" pageHeight="{page_height}" math="0" shadow="0">')
    xml.append('      <root>')
    xml.append('        <mxCell id="0" />')
    xml.append('        <mxCell id="1" parent="0" />')

    # Title & Legend
    title_html = html.escape('<div style="text-align:center;"><b style="font-size:20px;color:#0F172A;font-family:Helvetica;">SYSTÈME ZALISK — DIAGRAMME GLOBAL DES CAS D\'UTILISATION (UML 2.5)</b><br/><span style="font-size:12px;color:#64748B;font-family:Helvetica;">Architecture SaaS Omnicanale • Moteur RAG Interne Zalisk & Inférence Modèles Cloudflare Workers AI</span></div>')
    xml.append(f'        <mxCell id="title" value="{title_html}" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">')
    xml.append(f'          <mxGeometry x="500" y="12" width="1000" height="40" as="geometry" />')
    xml.append('        </mxCell>')

    # System boundary box
    sys_title = html.escape('<div style="text-align:left;padding-left:15px;padding-top:10px;"><b style="font-size:15px;letter-spacing:1px;color:#0F172A;font-family:Helvetica;">SYSTÈME ZALISK</b></div>')
    xml.append(f'        <mxCell id="system_boundary" value="{sys_title}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#1E293B;strokeWidth=2;verticalAlign=top;shadow=0;" vertex="1" parent="1">')
    xml.append(f'          <mxGeometry x="{box_x}" y="{box_y}" width="{box_w}" height="{box_h}" as="geometry" />')
    xml.append('        </mxCell>')

    # Actors
    actors = [
        ("actor_client", "Client / Visiteur", "(Grand Public)", 90, 310, 55, 110, "#EFF6FF", "#2563EB", "#1E40AF"),
        ("actor_cloudflare", "Cloudflare Workers AI", "«service»\n(Fournisseur LLM)", 60, 990, 60, 110, "#FAF5FF", "#9333EA", "#7E22CE"),
        ("actor_agent", "Conseiller SAV", "(AGENT)", 1820, 80, 55, 110, "#ECFDF5", "#10B981", "#047857"),
        ("actor_manager", "Superviseur SAV", "(MANAGER)", 1820, 320, 55, 110, "#FFFBEB", "#F59E0B", "#B45309"),
        ("actor_admin", "Administrateur", "(ADMIN)", 1820, 750, 55, 110, "#F8FAFC", "#64748B", "#334155"),
        ("actor_owner", "Propriétaire", "(OWNER)", 1820, 1060, 55, 110, "#FDF2F8", "#C026D3", "#A21CAF"),
    ]

    for aid, name, role, x, y, w, h, fill, stroke, text_color in actors:
        val = html.escape(f'<div style="text-align:center;"><b style="font-size:12px;color:#0F172A;font-family:Helvetica;">{name}</b><br/><span style="font-size:10px;color:{text_color};font-family:Helvetica;">{role}</span></div>')
        style = f"shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor={fill};strokeColor={stroke};strokeWidth=1.8;fontFamily=Helvetica;"
        xml.append(f'        <mxCell id="{aid}" value="{val}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry" />')
        xml.append('        </mxCell>')

    # Use Cases definition
    # (id, name, col, y, h, fill, stroke, text_color)
    # Col 1: x = 360, w = 360
    # Col 2: x = 820, w = 380
    # Col 3: x = 1290, w = 370
    col1_x = 360
    col1_w = 360

    col2_x = 820
    col2_w = 380

    col3_x = 1290
    col3_w = 370

    use_cases = [
        # Col 1 - Public (Blue)
        ("uc_annuaire", "Consulter l'annuaire des\nfiches assistance", col1_x, 100, col1_w, 64, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        ("uc_soumettre", "Soumettre une demande SAV\nen ligne (création ticket)", col1_x, 240, col1_w, 68, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        ("uc_tchat", "Échanger par messagerie\ntemps réel (chat direct)", col1_x, 390, col1_w, 64, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        ("uc_suivi", "Suivre l'état d'avancement\nde sa demande SAV", col1_x, 540, col1_w, 64, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        # Col 1 - IA & RAG & Inférence (Purple)
        ("uc_rag", "Obtenir une assistance automatisée\npar RAG (Moteur interne Zalisk)", col1_x, 700, col1_w, 72, "#FAF5FF", "#9333EA", "#581C87"),
        ("uc_transfert", "Solliciter un transfert vers\nun conseiller humain", col1_x, 860, col1_w, 64, "#FAF5FF", "#9333EA", "#581C87"),
        ("uc_inference", "Exécuter l'inférence des modèles LLM\n(Génération de texte via Cloudflare)", col1_x, 1010, col1_w, 72, "#FAF5FF", "#9333EA", "#581C87"),

        # Col 2 - Suggestions IA (Purple) & Traitement SAV Humain (Green)
        ("uc_sugg_ia", "Écouter les suggestions de\nréponses formulées par l'IA", col2_x, 100, col2_w, 68, "#FAF5FF", "#9333EA", "#581C87"),
        ("uc_dispo", "Gérer son statut\nde disponibilité", col2_x, 240, col2_w, 64, "#ECFDF5", "#10B981", "#064E3B"),
        ("uc_traiter_conv", "Traiter les conversations clients\net demandes en attente", col2_x, 390, col2_w, 72, "#ECFDF5", "#10B981", "#064E3B"),
        ("uc_elever_ticket", "Élever une conversation\nen Ticket SAV officiel", col2_x, 545, col2_w, 68, "#ECFDF5", "#10B981", "#064E3B"),
        ("uc_notes_internes", "Rédiger des notes\ninternes d'équipe", col2_x, 700, col2_w, 64, "#ECFDF5", "#10B981", "#064E3B"),
        ("uc_partager_ticket", "Partager un ticket à d'autres agents\n(entraide collaborative)", col2_x, 855, col2_w, 68, "#ECFDF5", "#10B981", "#064E3B"),
        ("uc_gerer_tickets", "Gérer le cycle de vie\ndes tickets SAV (SLA)", col2_x, 1010, col2_w, 72, "#ECFDF5", "#10B981", "#064E3B"),

        # Col 3 - Supervision (Amber), Admin (Slate), Owner (Magenta)
        ("uc_superviser_files", "Superviser les files d'attente\net la charge de travail", col3_x, 90, col3_w, 58, "#FFFBEB", "#F59E0B", "#78350F"),
        ("uc_stats_sla", "Consulter les tableaux de bord\nanalytiques et le respect SLA", col3_x, 190, col3_w, 58, "#FFFBEB", "#F59E0B", "#78350F"),
        ("uc_etablissements", "Gérer les établissements\nde l'entreprise", col3_x, 290, col3_w, 58, "#FFFBEB", "#F59E0B", "#78350F"),
        ("uc_competences", "Définir et attribuer les\ncompétences agents (Skills)", col3_x, 390, col3_w, 58, "#FFFBEB", "#F59E0B", "#78350F"),
        ("uc_reassigner", "Réaffecter manuellement un\nticket ou une conversation", col3_x, 490, col3_w, 58, "#FFFBEB", "#F59E0B", "#78350F"),
        ("uc_suspendre", "Suspendre ou réactiver\nl'accès d'un collaborateur", col3_x, 600, col3_w, 58, "#F8FAFC", "#64748B", "#1E293B"),
        ("uc_membres_rbac", "Inviter des membres et\nattribuer les rôles (RBAC)", col3_x, 700, col3_w, 58, "#F8FAFC", "#64748B", "#1E293B"),
        ("uc_knowledge", "Administrer la base documentaire\npour le RAG (Articles & FAQ)", col3_x, 800, col3_w, 58, "#F8FAFC", "#64748B", "#1E293B"),
        ("uc_params", "Configurer les paramètres de\nl'entreprise (canaux, horodatage)", col3_x, 900, col3_w, 58, "#F8FAFC", "#64748B", "#1E293B"),
        ("uc_abonnement", "Gérer l'abonnement SaaS\net les paiements Stripe", col3_x, 1010, col3_w, 58, "#FDF2F8", "#C026D3", "#701A75"),
        ("uc_supprimer_ws", "Supprimer définitivement\nl'espace de travail", col3_x, 1110, col3_w, 58, "#FDF2F8", "#C026D3", "#701A75"),
    ]

    for uid, text, ux, uy, uw, uh, fill, stroke, text_color in use_cases:
        lines = text.split("\n")
        val_html = html.escape("<br/>".join(lines))
        style = f"ellipse;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};strokeWidth=1.5;fontColor={text_color};fontSize=11;fontFamily=Helvetica;shadow=0;"
        xml.append(f'        <mxCell id="{uid}" value="{val_html}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{ux}" y="{uy}" width="{uw}" height="{uh}" as="geometry" />')
        xml.append('        </mxCell>')

    # Connectors - Associations (Solid Lines)
    # Style:
    assoc_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#1E293B;strokeWidth=1.4;endArrow=none;fontSize=10;fontFamily=Helvetica;"

    associations = [
        # Client associations
        ("actor_client", "uc_annuaire"),
        ("actor_client", "uc_soumettre"),
        ("actor_client", "uc_tchat"),
        ("actor_client", "uc_suivi"),

        # Cloudflare association (strictly inference LLM)
        ("actor_cloudflare", "uc_inference"),

        # Conseiller SAV associations
        ("actor_agent", "uc_dispo"),
        ("actor_agent", "uc_traiter_conv"),
        ("actor_agent", "uc_gerer_tickets"),

        # Superviseur SAV associations
        ("actor_manager", "uc_superviser_files"),
        ("actor_manager", "uc_stats_sla"),
        ("actor_manager", "uc_etablissements"),
        ("actor_manager", "uc_competences"),
        ("actor_manager", "uc_reassigner"),

        # Administrateur associations
        ("actor_admin", "uc_suspendre"),
        ("actor_admin", "uc_membres_rbac"),
        ("actor_admin", "uc_knowledge"),
        ("actor_admin", "uc_params"),

        # Propriétaire associations
        ("actor_owner", "uc_abonnement"),
        ("actor_owner", "uc_supprimer_ws"),
    ]

    edge_count = 0
    for src, tgt in associations:
        edge_count += 1
        xml.append(f'        <mxCell id="assoc_{edge_count}" style="{assoc_style}" edge="1" parent="1" source="{src}" target="{tgt}">')
        xml.append('          <mxGeometry relative="1" as="geometry" />')
        xml.append('        </mxCell>')

    # Dependencies <<include>> and <<extend>> (Dashed lines with open arrows)
    # Style for include:
    inc_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=4 4;strokeColor=#64748B;strokeWidth=1.3;endArrow=open;endFill=0;fontSize=10;fontColor=#475569;fontStyle=1;fontFamily=Helvetica;"
    ext_style = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=4 4;strokeColor=#64748B;strokeWidth=1.3;endArrow=open;endFill=0;fontSize=10;fontColor=#475569;fontStyle=1;fontFamily=Helvetica;"

    dependencies = [
        # Chat includes RAG
        ("uc_tchat", "uc_rag", "«include»", inc_style),
        # RAG includes Inference LLM
        ("uc_rag", "uc_inference", "«include»", inc_style),
        # Agent Suggestions includes Inference LLM
        ("uc_sugg_ia", "uc_inference", "«include»", inc_style),

        # Escalation to human extends RAG
        ("uc_transfert", "uc_rag", "«extend»<br/>[seuil d'escalade]", ext_style),
        # Escalation extends Traiter conv
        ("uc_transfert", "uc_traiter_conv", "«extend»<br/>[file attente]", ext_style),
        # Suggestions IA extends Traiter conv
        ("uc_sugg_ia", "uc_traiter_conv", "«extend»<br/>[assistance active]", ext_style),

        # Ticket creation extends Traiter conv
        ("uc_elever_ticket", "uc_traiter_conv", "«extend»", ext_style),
        # Internal notes extends Traiter conv
        ("uc_notes_internes", "uc_traiter_conv", "«extend»", ext_style),
        # Sharing ticket extends Gerer tickets
        ("uc_partager_ticket", "uc_gerer_tickets", "«extend»<br/>[besoin d'expertise]", ext_style),
    ]

    for src, tgt, label, st in dependencies:
        edge_count += 1
        label_escaped = html.escape(label)
        xml.append(f'        <mxCell id="dep_{edge_count}" value="{label_escaped}" style="{st}" edge="1" parent="1" source="{src}" target="{tgt}">')
        xml.append('          <mxGeometry relative="1" as="geometry" />')
        xml.append('        </mxCell>')

    xml.append('      </root>')
    xml.append('    </mxGraphModel>')
    xml.append('  </diagram>')
    xml.append('</mxfile>')

    return "\n".join(xml)

content = create_drawio_xml()
with open("documentation/uml/diagramme_cas_utilisation_global.drawio", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated drawio file: {len(content)} bytes")

# Test XML parsing
try:
    tree = ET.fromstring(content)
    print("XML Parsing SUCCESS! Root tag:", tree.tag)
except Exception as e:
    print("XML Parsing ERROR:", e)
