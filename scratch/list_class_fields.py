# -*- coding: utf-8 -*-
import json

with open('scratch/audit_summary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

models = data['prisma_models']

essential_classes = [
    # Package 1: Multi-Tenant & Utilisateurs
    ("Workspace", "Multi-Tenant & Utilisateurs"),
    ("User", "Multi-Tenant & Utilisateurs"),
    ("Membership", "Multi-Tenant & Utilisateurs"),
    ("WorkspaceInvitation", "Multi-Tenant & Utilisateurs"),

    # Package 2: Conversations & Tickets SAV
    ("Conversation", "Conversations & Tickets SAV"),
    ("ConversationMessage", "Conversations & Tickets SAV"),
    ("Ticket", "Conversations & Tickets SAV"),
    ("TicketAssignment", "Conversations & Tickets SAV"),
    ("TicketShare", "Conversations & Tickets SAV"),
    ("ConversationShare", "Conversations & Tickets SAV"),
    ("TicketActivity", "Conversations & Tickets SAV"),

    # Package 3: Organisation SAV & Compétences
    ("AgentProfile", "Organisation SAV & Compétences"),
    ("Skill", "Organisation SAV & Compétences"),
    ("AgentSkill", "Organisation SAV & Compétences"),
    ("Establishment", "Organisation SAV & Compétences"),

    # Package 4: Gestion Commerciale & Abonnements
    ("Subscription", "Gestion Commerciale & Abonnements"),
    ("SubscriptionIntent", "Gestion Commerciale & Abonnements"),
    ("PaymentAttempt", "Gestion Commerciale & Abonnements"),
    ("PaymentTransaction", "Gestion Commerciale & Abonnements"),
]

for c_name, pkg in essential_classes:
    m = models[c_name]
    print(f"\n==============================")
    print(f"CLASS: {c_name} ({pkg})")
    print(f"Table: {m['map_table']}")
    for f in m['fields']:
        if f['relation'] is None and f['type'] not in models:
            req = "" if f['is_optional'] else " [NOT NULL]"
            pk = " [PK]" if f['is_id'] else ""
            uq = " [UQ]" if f['is_unique'] else ""
            print(f"  + {f['name']}: {f['type']}{req}{pk}{uq}")
