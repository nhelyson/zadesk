import math

def generate_master_svg():
    width = 2050
    height = 1280

    # System Box
    box_x = 320
    box_y = 70
    box_w = 1380
    box_h = 1170

    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" style="background-color: #FFFFFF; font-family: Helvetica, Arial, sans-serif;">')

    # Definitions (markers, filters)
    svg.append('  <defs>')
    svg.append('    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">')
    svg.append('      <path d="M 1 2 L 8 5 L 1 8" fill="none" stroke="#475569" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />')
    svg.append('    </marker>')
    svg.append('    <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">')
    svg.append('      <path d="M 1 2 L 8 5 L 1 8" fill="none" stroke="#2563EB" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />')
    svg.append('    </marker>')
    svg.append('  </defs>')

    # Diagram Title Banner
    svg.append('  <!-- TITLE BANNER -->')
    svg.append('  <text x="1010" y="32" text-anchor="middle" font-size="19" font-weight="bold" fill="#0F172A">SYSTÈME ZALISK — DIAGRAMME GLOBAL DES CAS D\'UTILISATION (UML 2.5)</text>')
    svg.append('  <text x="1010" y="52" text-anchor="middle" font-size="12" fill="#64748B">Architecture SaaS Multi-Tenant &amp; Omnicanale • Moteur RAG Interne Zalisk &amp; Inférence LLM Cloudflare Workers AI</text>')

    # System Boundary
    svg.append('  <!-- SYSTEM BOUNDARY -->')
    svg.append(f'  <rect x="{box_x}" y="{box_y}" width="{box_w}" height="{box_h}" rx="10" ry="10" fill="#FFFFFF" stroke="#1E293B" stroke-width="2" />')
    svg.append(f'  <text x="{box_x + 25}" y="{box_y + 35}" font-size="15" font-weight="bold" fill="#0F172A" letter-spacing="1">SYSTÈME ZALISK</text>')

    # Actors definition: (id, name, role, x, y, fill, stroke, text_color)
    actors = {
        "client": ("Client / Visiteur", "Grand Public", 120, 310, "#EFF6FF", "#2563EB", "#1E40AF"),
        "cloudflare": ("Cloudflare Workers AI", "«service» (Inférence LLM)", 100, 1020, "#FAF5FF", "#9333EA", "#7E22CE"),
        "agent": ("Conseiller SAV", "AGENT", 1850, 95, "#ECFDF5", "#10B981", "#047857"),
        "manager": ("Superviseur SAV", "MANAGER", 1850, 330, "#FFFBEB", "#F59E0B", "#B45309"),
        "admin": ("Administrateur", "ADMIN", 1850, 770, "#F8FAFC", "#64748B", "#334155"),
        "owner": ("Propriétaire", "OWNER", 1850, 1080, "#FDF2F8", "#C026D3", "#A21CAF"),
    }

    # Function to draw Stick Figure Actor
    def draw_actor(aid, name, role, cx, cy, fill, stroke, text_color):
        out = []
        out.append(f'  <!-- ACTOR: {aid} -->')
        out.append(f'  <g id="actor_{aid}">')
        # Head
        out.append(f'    <circle cx="{cx}" cy="{cy - 28}" r="12" fill="{fill}" stroke="{stroke}" stroke-width="1.8" />')
        # Body
        out.append(f'    <line x1="{cx}" y1="{cy - 16}" x2="{cx}" y2="{cy + 16}" stroke="{stroke}" stroke-width="1.8" />')
        # Arms
        out.append(f'    <line x1="{cx - 18}" y1="{cy - 6}" x2="{cx + 18}" y2="{cy - 6}" stroke="{stroke}" stroke-width="1.8" />')
        # Legs
        out.append(f'    <line x1="{cx}" y1="{cy + 16}" x2="{cx - 14}" y2="{cy + 42}" stroke="{stroke}" stroke-width="1.8" />')
        out.append(f'    <line x1="{cx}" y1="{cy + 16}" x2="{cx + 14}" y2="{cy + 42}" stroke="{stroke}" stroke-width="1.8" />')
        # Text label
        out.append(f'    <text x="{cx}" y="{cy + 60}" text-anchor="middle" font-size="11.5" font-weight="bold" fill="#0F172A">{name}</text>')
        out.append(f'    <text x="{cx}" y="{cy + 75}" text-anchor="middle" font-size="10" font-weight="bold" fill="{text_color}">{role}</text>')
        out.append('  </g>')
        return "\n".join(out)

    for aid, (name, role, ax, ay, afill, astroke, atxt) in actors.items():
        svg.append(draw_actor(aid, name, role, ax, ay, afill, astroke, atxt))

    # Use Cases definition: (lines, cx, cy, rx, ry, fill, stroke, text_color)
    c1_cx = 540
    c1_rx = 165
    c1_ry = 31

    c2_cx = 1000
    c2_rx = 175
    c2_ry = 32

    c3_cx = 1480
    c3_rx = 170
    c3_ry = 27

    usecases = {
        # Col 1: Public & IA/RAG/Inference
        "uc_annuaire": (["Consulter l'annuaire des", "fiches assistance"], c1_cx, 115, c1_rx, c1_ry, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        "uc_soumettre": (["Soumettre une demande SAV en ligne", "(avec création de ticket)"], c1_cx, 250, c1_rx, c1_ry + 2, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        "uc_tchat": (["Échanger par messagerie temps réel", "(chat direct omnicanal)"], c1_cx, 395, c1_rx, c1_ry + 1, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        "uc_suivi": (["Suivre l'état d'avancement", "de sa demande SAV"], c1_cx, 545, c1_rx, c1_ry, "#EFF6FF", "#3B82F6", "#1E3A8A"),
        "uc_rag": (["Obtenir une assistance automatisée", "par RAG (Moteur interne Zalisk)"], c1_cx, 715, c1_rx + 5, c1_ry + 4, "#FAF5FF", "#9333EA", "#581C87"),
        "uc_transfert": (["Solliciter un transfert vers", "un conseiller humain"], c1_cx, 870, c1_rx, c1_ry + 1, "#FAF5FF", "#9333EA", "#581C87"),
        "uc_inference": (["Exécuter l'inférence des modèles LLM", "(Génération texte Cloudflare Workers AI)"], c1_cx, 1030, c1_rx + 8, c1_ry + 4, "#FAF5FF", "#9333EA", "#581C87"),

        # Col 2: Suggestions IA & Conseiller SAV
        "uc_sugg_ia": (["Écouter les suggestions de", "réponses formulées par l'IA"], c2_cx, 115, c2_rx, c2_ry + 2, "#FAF5FF", "#9333EA", "#581C87"),
        "uc_dispo": (["Gérer son statut", "de disponibilité"], c2_cx, 250, c2_rx, c2_ry, "#ECFDF5", "#10B981", "#064E3B"),
        "uc_traiter_conv": (["Traiter les conversations clients", "et demandes en attente"], c2_cx, 395, c2_rx, c2_ry + 3, "#ECFDF5", "#10B981", "#064E3B"),
        "uc_elever_ticket": (["Élever une conversation", "en Ticket SAV officiel"], c2_cx, 550, c2_rx, c2_ry + 2, "#ECFDF5", "#10B981", "#064E3B"),
        "uc_notes_internes": (["Rédiger des notes", "internes d'équipe"], c2_cx, 705, c2_rx, c2_ry, "#ECFDF5", "#10B981", "#064E3B"),
        "uc_partager_ticket": (["Partager un ticket à d'autres agents", "(entraide collaborative)"], c2_cx, 860, c2_rx, c2_ry + 2, "#ECFDF5", "#10B981", "#064E3B"),
        "uc_gerer_tickets": (["Gérer le cycle de vie", "des tickets SAV (SLA)"], c2_cx, 1020, c2_rx, c2_ry + 3, "#ECFDF5", "#10B981", "#064E3B"),

        # Col 3: Supervision (Amber), Admin (Slate), Owner (Magenta)
        "uc_superviser_files": (["Superviser les files d'attente", "et la charge de travail"], c3_cx, 105, c3_rx, c3_ry, "#FFFBEB", "#F59E0B", "#78350F"),
        "uc_stats_sla": (["Consulter les tableaux de bord", "analytiques et le respect SLA"], c3_cx, 205, c3_rx, c3_ry, "#FFFBEB", "#F59E0B", "#78350F"),
        "uc_etablissements": (["Gérer les établissements", "de l'entreprise"], c3_cx, 305, c3_rx, c3_ry, "#FFFBEB", "#F59E0B", "#78350F"),
        "uc_competences": (["Définir et attribuer les", "compétences agents (Skills)"], c3_cx, 405, c3_rx, c3_ry, "#FFFBEB", "#F59E0B", "#78350F"),
        "uc_reassigner": (["Réaffecter manuellement un", "ticket ou une conversation"], c3_cx, 505, c3_rx, c3_ry, "#FFFBEB", "#F59E0B", "#78350F"),

        "uc_suspendre": (["Suspendre ou réactiver", "l'accès d'un collaborateur"], c3_cx, 620, c3_rx, c3_ry, "#F8FAFC", "#64748B", "#1E293B"),
        "uc_membres_rbac": (["Inviter des membres et", "attribuer les rôles (RBAC)"], c3_cx, 725, c3_rx, c3_ry, "#F8FAFC", "#64748B", "#1E293B"),
        "uc_knowledge": (["Administrer la base documentaire", "pour le RAG (Articles & FAQ)"], c3_cx, 830, c3_rx, c3_ry, "#F8FAFC", "#64748B", "#1E293B"),
        "uc_params": (["Configurer les paramètres de", "l'entreprise (canaux, horodatage)"], c3_cx, 935, c3_rx, c3_ry, "#F8FAFC", "#64748B", "#1E293B"),

        "uc_abonnement": (["Gérer l'abonnement SaaS", "et les paiements Stripe"], c3_cx, 1050, c3_rx, c3_ry, "#FDF2F8", "#C026D3", "#701A75"),
        "uc_supprimer_ws": (["Supprimer définitivement", "l'espace de travail"], c3_cx, 1150, c3_rx, c3_ry, "#FDF2F8", "#C026D3", "#701A75"),
    }

    # Render Use Cases
    for uid, (lines, ucx, ucy, urx, ury, fill, stroke, text_color) in usecases.items():
        svg.append(f'  <!-- UC: {uid} -->')
        svg.append(f'  <g id="{uid}">')
        svg.append(f'    <ellipse cx="{ucx}" cy="{ucy}" rx="{urx}" ry="{ury}" fill="{fill}" stroke="{stroke}" stroke-width="1.5" />')
        
        # Center multi-line text
        n_lines = len(lines)
        line_height = 13.5
        start_y = ucy - ((n_lines - 1) * line_height) / 2.0 + 4.5
        
        svg.append(f'    <text x="{ucx}" y="{start_y}" text-anchor="middle" font-size="11" font-family="Helvetica, Arial, sans-serif" fill="{text_color}">')
        for i, line in enumerate(lines):
            dy = "0" if i == 0 else f"{line_height}px"
            svg.append(f'      <tspan x="{ucx}" dy="{dy}">{line}</tspan>')
        svg.append('    </text>')
        svg.append('  </g>')

    # Association Lines (Solid)
    # Actor Client -> Col 1 use cases
    cl_x = 140
    cl_y = 310
    for uid in ["uc_annuaire", "uc_soumettre", "uc_tchat", "uc_suivi"]:
        _, target_x, target_y, target_rx, _, _, _, _ = usecases[uid]
        entry_x = target_x - target_rx
        entry_y = target_y
        svg.append(f'  <path d="M {cl_x} {cl_y} C {cl_x + 100} {cl_y}, {entry_x - 80} {entry_y}, {entry_x} {entry_y}" stroke="#1E293B" stroke-width="1.3" fill="none" />')

    # Actor Cloudflare -> uc_inference
    cf_x = 130
    cf_y = 1020
    _, inf_x, inf_y, inf_rx, _, _, _, _ = usecases["uc_inference"]
    svg.append(f'  <path d="M {cf_x} {cf_y} L {inf_x - inf_rx} {inf_y}" stroke="#1E293B" stroke-width="1.4" fill="none" />')

    # Actor Superviseur SAV -> Col 3 Amber use cases
    mgr_x = 1825
    mgr_y = 330
    for uid in ["uc_superviser_files", "uc_stats_sla", "uc_etablissements", "uc_competences", "uc_reassigner"]:
        _, target_x, target_y, target_rx, _, _, _, _ = usecases[uid]
        entry_x = target_x + target_rx
        entry_y = target_y
        svg.append(f'  <path d="M {mgr_x} {mgr_y} C {mgr_x - 70} {mgr_y}, {entry_x + 60} {entry_y}, {entry_x} {entry_y}" stroke="#1E293B" stroke-width="1.3" fill="none" />')

    # Actor Administrateur -> Col 3 Slate use cases
    adm_x = 1825
    adm_y = 770
    for uid in ["uc_suspendre", "uc_membres_rbac", "uc_knowledge", "uc_params"]:
        _, target_x, target_y, target_rx, _, _, _, _ = usecases[uid]
        entry_x = target_x + target_rx
        entry_y = target_y
        svg.append(f'  <path d="M {adm_x} {adm_y} C {adm_x - 70} {adm_y}, {entry_x + 60} {entry_y}, {entry_x} {entry_y}" stroke="#1E293B" stroke-width="1.3" fill="none" />')

    # Actor Propriétaire -> Col 3 Magenta use cases
    own_x = 1825
    own_y = 1080
    for uid in ["uc_abonnement", "uc_supprimer_ws"]:
        _, target_x, target_y, target_rx, _, _, _, _ = usecases[uid]
        entry_x = target_x + target_rx
        entry_y = target_y
        svg.append(f'  <path d="M {own_x} {own_y} C {own_x - 70} {own_y}, {entry_x + 60} {entry_y}, {entry_x} {entry_y}" stroke="#1E293B" stroke-width="1.3" fill="none" />')

    # Actor Conseiller SAV -> Core use cases in Col 2
    ag_x = 1825
    ag_y = 95
    # uc_dispo
    _, d_x, d_y, d_rx, _, _, _, _ = usecases["uc_dispo"]
    svg.append(f'  <path d="M {ag_x} {ag_y} C 1720 {ag_y}, 1250 170, {d_x + d_rx} {d_y}" stroke="#1E293B" stroke-width="1.3" fill="none" />')
    # uc_traiter_conv
    _, tc_x, tc_y, tc_rx, _, _, _, _ = usecases["uc_traiter_conv"]
    svg.append(f'  <path d="M {ag_x} {ag_y} C 1700 {ag_y}, 1240 280, {tc_x + tc_rx} {tc_y}" stroke="#1E293B" stroke-width="1.3" fill="none" />')
    # uc_gerer_tickets
    _, gt_x, gt_y, gt_rx, _, _, _, _ = usecases["uc_gerer_tickets"]
    # Drops straight down the 90px clear corridor between Col 2 and Col 3 (x=1250)
    svg.append(f'  <path d="M {ag_x} {ag_y} C 1750 {ag_y}, 1250 100, 1250 500 L 1250 850 C 1250 980, 1230 {gt_y}, {gt_x + gt_rx} {gt_y}" stroke="#1E293B" stroke-width="1.3" fill="none" />')

    # Internal Dependencies (Dashed with arrows)
    def draw_dep(src_id, tgt_id, label, cond="", curvature=0, side="left"):
        _, sx, sy, srx, sry, _, _, _ = usecases[src_id]
        _, tx, ty, trx, try_, _, _, _ = usecases[tgt_id]
        
        # Calculate start and end points
        if sx == tx:
            # Vertical connection in same column
            if sy < ty:
                p1_x, p1_y = sx, sy + sry
                p2_x, p2_y = tx, ty - try_
            else:
                p1_x, p1_y = sx, sy - sry
                p2_x, p2_y = tx, ty + try_
            mid_x = sx + curvature
            mid_y = (p1_y + p2_y) / 2.0
            path_d = f"M {p1_x} {p1_y} Q {mid_x} {mid_y} {p2_x} {p2_y}"
            lbl_x = mid_x + (10 if side == "right" else -10)
            lbl_y = mid_y + 4
            anchor = "start" if side == "right" else "end"
        else:
            # Cross-column connection
            if sx < tx:
                p1_x, p1_y = sx + srx, sy
                p2_x, p2_y = tx - trx, ty
            else:
                p1_x, p1_y = sx - srx, sy
                p2_x, p2_y = tx + trx, ty
            mid_x = (p1_x + p2_x) / 2.0
            mid_y = (p1_y + p2_y) / 2.0 + curvature
            path_d = f"M {p1_x} {p1_y} Q {mid_x} {mid_y} {p2_x} {p2_y}"
            lbl_x = mid_x
            lbl_y = mid_y - 6
            anchor = "middle"

        res = []
        res.append(f'  <path d="{path_d}" stroke="#64748B" stroke-width="1.3" stroke-dasharray="4,4" fill="none" marker-end="url(#arrow)" />')
        
        if cond:
            res.append(f'  <text x="{lbl_x}" y="{lbl_y - 7}" text-anchor="{anchor}" font-size="9.5" font-weight="bold" fill="#475569">{label}</text>')
            res.append(f'  <text x="{lbl_x}" y="{lbl_y + 6}" text-anchor="{anchor}" font-size="8.5" fill="#64748B">{cond}</text>')
        else:
            res.append(f'  <text x="{lbl_x}" y="{lbl_y}" text-anchor="{anchor}" font-size="9.5" font-weight="bold" fill="#475569">{label}</text>')
        return "\n".join(res)

    # 1. Chat includes RAG
    svg.append(draw_dep("uc_tchat", "uc_rag", "«include»", "", curvature=-25, side="left"))

    # 2. RAG includes Inference LLM
    svg.append(draw_dep("uc_rag", "uc_inference", "«include»", "", curvature=-25, side="left"))

    # 3. Transfert vers humain extends RAG (escalation threshold)
    svg.append(draw_dep("uc_transfert", "uc_rag", "«extend»", "[seuil escalade]", curvature=25, side="right"))

    # 4. Transfert extends Traiter conv (escalade humaine vers file agent)
    svg.append(draw_dep("uc_transfert", "uc_traiter_conv", "«extend»", "[file attente]", curvature=-30))

    # 5. Suggestions IA includes Inference LLM (cross column)
    # Routes via clear corridor between Col 1 and Col 2 (x=760)
    svg.append(f'  <path d="M {usecases["uc_sugg_ia"][1] - usecases["uc_sugg_ia"][3]} {usecases["uc_sugg_ia"][2]} C 760 {usecases["uc_sugg_ia"][2]}, 760 900, {usecases["uc_inference"][1] + usecases["uc_inference"][3]} {usecases["uc_inference"][2]}" stroke="#64748B" stroke-width="1.3" stroke-dasharray="4,4" fill="none" marker-end="url(#arrow)" />')
    svg.append('  <text x="740" y="520" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#475569">«include»</text>')

    # 6. Suggestions IA extends Traiter conv
    svg.append(draw_dep("uc_sugg_ia", "uc_traiter_conv", "«extend»", "[assistance active]", curvature=-25, side="left"))

    # 7. Elever ticket extends Traiter conv
    svg.append(draw_dep("uc_elever_ticket", "uc_traiter_conv", "«extend»", "", curvature=-25, side="left"))

    # 8. Notes internes extends Traiter conv
    # Curves on the left of Col 2
    svg.append(f'  <path d="M {usecases["uc_notes_internes"][1] - usecases["uc_notes_internes"][3]} {usecases["uc_notes_internes"][2]} C 780 {usecases["uc_notes_internes"][2]}, 780 {usecases["uc_traiter_conv"][2] + 20}, {usecases["uc_traiter_conv"][1] - usecases["uc_traiter_conv"][3]} {usecases["uc_traiter_conv"][2] + 15}" stroke="#64748B" stroke-width="1.3" stroke-dasharray="4,4" fill="none" marker-end="url(#arrow)" />')
    svg.append('  <text x="765" y="550" text-anchor="end" font-size="9.5" font-weight="bold" fill="#475569">«extend»</text>')

    # 9. Partager ticket extends Gerer tickets
    svg.append(draw_dep("uc_partager_ticket", "uc_gerer_tickets", "«extend»", "[besoin expertise]", curvature=-25, side="left"))

    # Legend / Information Box at top-right
    leg_x = 1800
    leg_y = 12
    svg.append(f'  <!-- LEGEND -->')
    svg.append(f'  <g id="legend">')
    svg.append(f'    <rect x="{leg_x}" y="{leg_y}" width="230" height="58" rx="6" ry="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2" />')
    svg.append(f'    <text x="{leg_x + 10}" y="{leg_y + 16}" font-size="10" font-weight="bold" fill="#0F172A">Conventions UML 2.5 :</text>')
    svg.append(f'    <line x1="{leg_x + 10}" y1="{leg_y + 28}" x2="{leg_x + 40}" y2="{leg_y + 28}" stroke="#1E293B" stroke-width="1.3" />')
    svg.append(f'    <text x="{leg_x + 45}" y="{leg_y + 31}" font-size="9" fill="#334155">Association (Acteur — Cas)</text>')
    svg.append(f'    <line x1="{leg_x + 10}" y1="{leg_y + 45}" x2="{leg_x + 40}" y2="{leg_y + 45}" stroke="#64748B" stroke-width="1.3" stroke-dasharray="3,3" marker-end="url(#arrow)" />')
    svg.append(f'    <text x="{leg_x + 45}" y="{leg_y + 48}" font-size="9" fill="#334155">Dépendance «include» / «extend»</text>')
    svg.append('  </g>')

    svg.append('</svg>')
    return "\n".join(svg)

svg_content = generate_master_svg()
with open("documentation/uml/diagramme_cas_utilisation_global.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"Master SVG successfully generated: {len(svg_content)} bytes")
