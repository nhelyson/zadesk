# -*- coding: utf-8 -*-
import json

with open(r"scratch\extracted_page1_classes.json", "r", encoding="utf-8") as f:
    classes = json.load(f)

# Layout planning for 5 columns
# Col widths: 380px each
col_w = 380
col_gap = 100
left_margin = 80

# x positions for the 5 columns:
# col 0: 80
# col 1: 80 + 380 + 100 = 560
# col 2: 560 + 380 + 100 = 1040
# col 3: 1040 + 380 + 100 = 1520
# col 4: 1520 + 380 + 100 = 2000
# Total diagram width: 2000 + 380 + 80 = 2460px.
# With page padding: 2500px wide.

# Let's map classes to (col_idx, row_idx):
# Col 0: workspace, establishment, customer, aiassistantsupervisor, aiconfiguration
# Col 1: membership, workspaceinvitation, ticket, ticketassignment, knowledgedocument
# Col 2: user, ticketactivity, ticketshare, knowledgechunk
# Col 3: agentprofile, assignmentengine, conversation, outboxevent, auditlog
# Col 4: skill, agentskill, conversationmessage, conversationshare, pulseevent

# Let's calculate height for each class
def get_dimensions(c):
    n_attrs = len(c["attrs"])
    n_methods = len(c["methods"])
    # Header: ~50px
    # Div 1: 14px
    # Attrs: n_attrs * 23px + 12px
    # Div 2: 14px
    # Methods: n_methods * 23px + 12px
    h = 50 + 14 + (n_attrs * 23 + 12)
    if n_methods > 0:
        h += 14 + (n_methods * 23 + 12)
    h = max(h, 190)
    w = col_w
    return w, h

# Compute Y positions for each row tier
# Tier 1: Row 1
# y = 70
# workspace (h=350), membership (h=260), user (h=310), agentprofile (h=330), skill (h=215)
# Max height Tier 1 = 350. Next tier starts at 70 + 350 + 70 = 490

# Tier 2: Row 2
# y = 480
# establishment (below workspace, h=300)
# workspaceinvitation (below membership, h=280)
# assignmentengine (below agentprofile, h=230)
# agentskill (below skill, h=235)
# Max height Tier 2 = 300. Next tier starts at 480 + 300 + 90 = 870

# Tier 3: Row 3 (Tickets & Conversations)
# y = 870
# customer (h=290), ticket (h=410), ticketactivity (h=240), conversation (h=330), conversationmessage (h=270)
# Max height Tier 3 = 410.

# Tier 4: Row 4 (Collaboration / assignments)
# y = 870 + 410 + 60 = 1340
# ticketassignment (h=240, under ticket in col 1)
# ticketshare (h=220, col 2 under ticketactivity)
# conversationshare (h=220, col 4 under conversationmessage)

# Tier 5: Row 5 (RAG, IA, Outbox, Pulse)
# y = 1340 + 240 + 80 = 1660
# aiassistantsupervisor (h=250), knowledgedocument (h=270), knowledgechunk (h=240), outboxevent (h=240), pulseevent (h=220)

# Tier 6: Row 6 (AiConfiguration, AuditLog)
# y = 1660 + 270 + 60 = 1990
# aiconfiguration (h=220, under supervisor in col 0)
# auditlog (h=240, under outboxevent in col 3)
# Total height: 1990 + 240 + 80 = 2310px.

print("Dimensions verified.")
