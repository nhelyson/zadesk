# -*- coding: utf-8 -*-
import math

# Font metrics approximation for Segoe UI / Arial
# Average char width as fraction of font size: ~0.52 for regular, ~0.56 for bold
def est_text_width(text, font_size, is_bold=True):
    factor = 0.55 if is_bold else 0.50
    # adjust for narrow chars
    narrow = sum(1 for c in text if c in 'ijlI|!.:;,\' ')
    wide = sum(1 for c in text if c in 'wmWM@%')
    normal = len(text) - narrow - wide
    effective_len = normal * factor + narrow * 0.28 + wide * 0.78
    return effective_len * font_size

ellipse_w = 54.0 # 2 * rx (rx = 27.0)
ellipse_h = 24.2 # 2 * ry (ry = 12.1)

# List of all 24 use cases with their lines
use_cases = [
    # Col 1 (cx = 57.0)
    (0, 57.0, 43.5, ["Consulter l’annuaire", "et les fiches", "entreprises"]),
    (1, 57.0, 71.5, ["Solliciter un transfert", "vers un conseiller", "humain"]),
    (2, 57.0, 99.5, ["Échanger par messagerie", "instantanée", "(tchat direct)"]),
    (3, 57.0, 127.5, ["Obtenir une assistance", "automatisée", "(RAG orchestré par Zalisk)"]),
    (4, 57.0, 155.5, ["Soumettre une demande SAV", "en ligne sans compte"]),
    (5, 57.0, 183.5, ["Suivre l’état d’avancement", "de sa demande"]),

    # Col 2 (cx = 116.5)
    (6, 116.5, 43.5, ["Gérer son statut de", "disponibilité"]),
    (7, 116.5, 71.5, ["Exploiter les suggestions", "de réponses contextualisées", "(contexte RAG construit par Zalisk)"]),
    (8, 116.5, 99.5, ["Traiter les conversations", "clients et demandes", "transférées"]),
    (9, 116.5, 127.5, ["Élever une conversation", "en Ticket SAV officiel"]),
    (10, 116.5, 155.5, ["Rédiger des notes", "internes d’équipe"]),
    (11, 116.5, 183.5, ["Partager un ticket", "inter-agents", "(lecture / contribution)"]),

    # Col 3 (cx = 176.0)
    (12, 176.0, 43.5, ["Superviser les files", "d’attente et la charge", "de travail"]),
    (13, 176.0, 71.5, ["Consulter les tableaux", "de bord analytiques", "et métriques SLA"]),
    (14, 176.0, 99.5, ["Gérer les établissements", "de l’entreprise"]),
    (15, 176.0, 127.5, ["Gérer et certifier", "les compétences des agents", "(Skills)"]),
    (16, 176.0, 155.5, ["Réaffecter manuellement", "un ticket ou une", "conversation"]),
    (17, 176.0, 183.5, ["Gérer le cycle de vie", "des tickets SAV (SLA)"]),

    # Col 4 (cx = 235.5)
    (18, 235.5, 43.5, ["Suspendre ou réactiver", "l’accès d’un", "collaborateur"]),
    (19, 235.5, 71.5, ["Gérer les membres", "et attribuer les rôles", "(RBAC)"]),
    (20, 235.5, 99.5, ["Administrer la base", "documentaire pour le RAG"]),
    (21, 235.5, 127.5, ["Configurer les paramètres", "de l’espace entreprise"]),
    (22, 235.5, 155.5, ["Supprimer définitivement", "l’espace de travail"]),
    (23, 235.5, 183.5, ["Gérer l’abonnement SaaS", "et les paiements SasPay"]),
]

print("=== CHECKING TEXT FIT WITH INCREASED FONT SIZES ===")
for idx, cx, cy, lines in use_cases:
    n_lines = len(lines)
    # Determine optimal font size based on lines
    if n_lines == 2:
        fs = 3.65
        dy = 4.45
    elif n_lines == 3:
        # Check longest line
        max_len = max(len(l) for l in lines)
        if max_len > 30:
            fs = 3.15
            dy = 3.9
        elif max_len > 24:
            fs = 3.35
            dy = 4.05
        else:
            fs = 3.45
            dy = 4.15

    total_h = (n_lines - 1) * dy + fs
    max_w = max(est_text_width(l, fs, is_bold=True) for l in lines)
    print(f"UC[{idx:2d}] {n_lines} lines: max_w={max_w:4.1f}mm / 54mm, total_h={total_h:4.1f}mm / 24mm | fs={fs:.2f} dy={dy:.2f} | '{lines[0]}'")
