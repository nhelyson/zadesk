# -*- coding: utf-8 -*-
"""
Calculateur de géométrie et vérification des collisions
pour le nouveau layout aéré (sans titre, sans whatsapp, sans légende)
"""

POSITIONS = {
    # Zone 1 : Organisation & Équipe (Haut)
    "Workspace": (80, 60, 290, 260),
    "Establishment": (80, 390, 290, 210),
    "Membership": (470, 60, 270, 180),
    "WorkspaceInvitation": (470, 300, 270, 190),
    "User": (840, 60, 280, 220),
    "AgentProfile": (1220, 60, 280, 230),
    "AssignmentEngine": (1220, 350, 280, 180),
    "Skill": (1610, 60, 250, 150),
    "AgentSkill": (1610, 270, 250, 160),

    # Zone 2 : Demandes SAV & Tickets (Milieu Gauche)
    "Customer": (80, 670, 290, 210),
    "Ticket": (470, 650, 310, 300),
    "TicketActivity": (880, 650, 280, 175),
    "TicketAssignment": (360, 1030, 270, 170),
    "TicketShare": (710, 1030, 260, 155),

    # Zone 3 : Conversations (Milieu Droit)
    "Conversation": (1250, 650, 290, 250),
    "ConversationMessage": (1640, 650, 270, 180),
    "ConversationShare": (1640, 890, 270, 150),

    # Zone 4 : IA & Événements (Bas)
    "AiAssistantSupervisor": (80, 1260, 290, 200),
    "AiConfiguration": (80, 1510, 290, 165),
    "KnowledgeDocument": (470, 1260, 280, 190),
    "KnowledgeChunk": (850, 1260, 280, 180),
    "OutboxEvent": (1250, 1260, 280, 175),
    "PulseEvent": (1630, 1260, 260, 165),
    "AuditLog": (1250, 1490, 280, 180)
}

print(f"Total classes positionnées : {len(POSITIONS)}")
min_x = min(x for x, y, w, h in POSITIONS.values())
max_x = max(x + w for x, y, w, h in POSITIONS.values())
min_y = min(y for x, y, w, h in POSITIONS.values())
max_y = max(y + h for x, y, w, h in POSITIONS.values())
print(f"Emprise X : {min_x} à {max_x} (largeur = {max_x - min_x})")
print(f"Emprise Y : {min_y} à {max_y} (hauteur = {max_y - min_y})")

# Vérification de non-chevauchement
collisions = []
names = list(POSITIONS.keys())
for i in range(len(names)):
    for j in range(i + 1, len(names)):
        n1, n2 = names[i], names[j]
        x1, y1, w1, h1 = POSITIONS[n1]
        x2, y2, w2, h2 = POSITIONS[n2]
        
        # Test collision avec marge de 20px
        if not (x1 + w1 + 20 <= x2 or x2 + w2 + 20 <= x1 or y1 + h1 + 20 <= y2 or y2 + h2 + 20 <= y1):
            collisions.append((n1, n2))

if collisions:
    print(f"ATTENTION : {len(collisions)} collisions trouvées :", collisions)
else:
    print("PARFAIT : 0 collision ! Chaque classe bénéficie d'au moins 20-100px d'espace libre tout autour.")
