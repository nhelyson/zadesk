# -*- coding: utf-8 -*-
import json
import re
import subprocess

# 1. Parse Prisma models in detail
schema_path = r"backend\prisma\schema.prisma"
with open(schema_path, "r", encoding="utf-8") as f:
    schema_text = f.read()

model_blocks = re.findall(r"model\s+(\w+)\s*\{([^}]+)\}", schema_text)

target_models = [
    "User", "Workspace", "Membership", "WorkspaceInvitation",
    "Conversation", "ConversationMessage", "Ticket", "TicketAssignment",
    "TicketShare", "ConversationShare", "TicketActivity", "AgentProfile",
    "AgentSkill", "Skill", "Establishment", "Subscription",
    "SubscriptionIntent", "PaymentAttempt", "PaymentTransaction"
]

parsed_models = {}

for mname, body in model_blocks:
    if mname not in target_models:
        continue
    
    # Table map
    map_m = re.search(r"@@map\([\"'](\w+)[\"']\)", body)
    table_name = map_m.group(1) if map_m else mname
    
    # Composite unique
    unique_composites = re.findall(r"@@unique\(\[([^\]]+)\]", body)
    composite_uniques = [[x.strip() for x in uc.split(",")] for uc in unique_composites]
    
    # Composite index
    index_composites = re.findall(r"@@index\(\[([^\]]+)\]", body)
    composite_indices = [[x.strip() for x in ic.split(",")] for ic in index_composites]
    
    fields = []
    relations = []
    
    lines = [line.strip() for line in body.splitlines() if line.strip() and not line.strip().startswith("//")]
    for line in lines:
        if line.startswith("@@"):
            continue
        
        # Field pattern: name type attributes...
        # Example: id String @id @default(cuid())
        # Example: workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
        tokens = line.split()
        if len(tokens) < 2:
            continue
        fname = tokens[0]
        ftype_raw = tokens[1]
        rest = " ".join(tokens[2:])
        
        is_optional = ftype_raw.endswith("?")
        is_list = ftype_raw.endswith("[]")
        base_type = ftype_raw.rstrip("?").rstrip("[]")
        
        is_id = "@id" in rest
        is_unique = "@unique" in rest
        
        # Default value
        def_m = re.search(r"@default\(([^)]+)\)", rest)
        default_val = def_m.group(1) if def_m else None
        
        # Relation
        rel_m = re.search(r"@relation\(([^)]*)\)", rest)
        
        # If base_type is another model (or rel_m is present)
        # Check if it's a relation field or scalar field
        if rel_m or base_type in [m[0] for m in model_blocks]:
            rel_info = {
                "field_name": fname,
                "target_model": base_type,
                "is_list": is_list,
                "is_optional": is_optional,
                "raw": line
            }
            if rel_m:
                rel_body = rel_m.group(1)
                name_m = re.search(r"[\"'](\w+)[\"']", rel_body)
                fields_m = re.search(r"fields:\s*\[([^\]]+)\]", rel_body)
                refs_m = re.search(r"references:\s*\[([^\]]+)\]", rel_body)
                del_m = re.search(r"onDelete:\s*(\w+)", rel_body)
                upd_m = re.search(r"onUpdate:\s*(\w+)", rel_body)
                
                rel_info["relation_name"] = name_m.group(1) if name_m else None
                rel_info["fields"] = [x.strip() for x in fields_m.group(1).split(",")] if fields_m else []
                rel_info["references"] = [x.strip() for x in refs_m.group(1).split(",")] if refs_m else []
                rel_info["onDelete"] = del_m.group(1) if del_m else None
                rel_info["onUpdate"] = upd_m.group(1) if upd_m else None
            relations.append(rel_info)
        else:
            fields.append({
                "name": fname,
                "type": base_type,
                "is_optional": is_optional,
                "is_list": is_list,
                "is_id": is_id,
                "is_unique": is_unique,
                "default": default_val,
                "raw": line
            })
            
    parsed_models[mname] = {
        "model_name": mname,
        "table_name": table_name,
        "composite_uniques": composite_uniques,
        "composite_indices": composite_indices,
        "fields": fields,
        "relations": relations
    }

# Save parsed Prisma info
with open(r"scratch\parsed_prisma_models.json", "w", encoding="utf-8") as f:
    json.dump(parsed_models, f, indent=2)

print("Parsed models saved to scratch/parsed_prisma_models.json")
