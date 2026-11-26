# -*- coding: utf-8 -*-
import json
import os

with open(r"scratch\parsed_prisma_models.json", "r", encoding="utf-8") as f:
    parsed_models = json.load(f)

with open(r"scratch\pg_metadata.json", "r", encoding="utf-8") as f:
    pg_metadata = json.load(f)

cols_by_table = {}
for c in pg_metadata["columns"]:
    cols_by_table.setdefault(c["table_name"], {})[c["column_name"]] = c

fks_by_table = {}
for fk in pg_metadata["fks"]:
    fks_by_table.setdefault(fk["table_name"], {})[fk["column_name"]] = fk

uniques_by_table = {}
for u in pg_metadata["uniques"]:
    uniques_by_table.setdefault(u["table_name"], set()).add(u["column_name"])

enums_dict = {}
for e in pg_metadata["pg_enums"]:
    enums_dict.setdefault(e["enum_name"], []).append(e["enum_value"])

# Generate markdown document
doc = []

doc.append("# RAPPORT D'EXTRACTION TECHNIQUE APPROFONDIE — MODÈLE DE CLASSES UML DE ZALISK")
doc.append("\n**Cadre académique** : Mémoire de Licence en Génie Informatique — Section 3.3.2 (*Structure et organisation des données*)")
doc.append("**Auteur / Rôle** : Expert Concepteur & Ingénieur Logiciel")
doc.append("**Date de vérification** : 22 novembre 2026")
doc.append("**Plateforme auditée** : Zalisk (SaaS Omnicanal de SAV et Relation Client)")
doc.append("**Sources vérifiées** : `backend/prisma/schema.prisma`, instance PostgreSQL 16 active (`zadesk-postgres`, base `zadesk`), et migrations `backend/prisma/migrations/`.\n")
doc.append("---\n")

# Section 1
doc.append("## 1. INVENTAIRE DES 19 CLASSES MÉTIER CENTRALES\n")
doc.append("Les 19 classes métier retenues pour le modèle conceptuel et logique de données de Zalisk ont été sélectionnées parmi les 34 modèles déclarés dans Prisma et les 35 tables physiques hébergées dans PostgreSQL. Elles capturent l'intégralité du domaine fonctionnel de la plateforme.\n")

doc.append("| N° | Classe (Modèle Prisma) | Table PostgreSQL | Package Fonctionnel | Responsabilité Métier | Nbr Attributs Scalaires |")
doc.append("|---|---|---|---|---|:---:|")

packages_map = {
    "User": ("pkg_1", "Multi-Tenant & Utilisateurs", "Gestion des identités, comptes utilisateurs et authentification."),
    "Workspace": ("pkg_1", "Multi-Tenant & Utilisateurs", "Entité racine multi-tenant représentant une entreprise cliente."),
    "Membership": ("pkg_1", "Multi-Tenant & Utilisateurs", "Adhésion associative liant un utilisateur à un espace avec rôle et statut."),
    "WorkspaceInvitation": ("pkg_1", "Multi-Tenant & Utilisateurs", "Gestion des invitations émises pour rejoindre une entreprise."),
    "Conversation": ("pkg_2", "Conversations & SAV", "Fil de discussion omnicanal temps réel (portail public, web, chat)."),
    "ConversationMessage": ("pkg_2", "Conversations & SAV", "Message unitaire horodaté au sein d'une conversation (public ou note interne)."),
    "Ticket": ("pkg_2", "Conversations & SAV", "Dossier contractuel officiel de réclamation SAV avec suivi SLA."),
    "TicketAssignment": ("pkg_2", "Conversations & SAV", "Historique d'audit et traçabilité des réaffectations de tickets."),
    "TicketShare": ("pkg_2", "Conversations & SAV", "Partage collaboratif d'un ticket entre agents (lecture ou contribution)."),
    "ConversationShare": ("pkg_2", "Conversations & SAV", "Partage collaboratif d'une conversation entre agents."),
    "TicketActivity": ("pkg_2", "Conversations & SAV", "Journal d'activité et d'événements sur le cycle de vie d'un ticket."),
    "AgentProfile": ("pkg_3", "Organisation & Compétences", "Profil étendu d'un agent SAV (disponibilité, capacité max, routage)."),
    "Skill": ("pkg_3", "Organisation & Compétences", "Compétence technique ou fonctionnelle répertoriée par une entreprise."),
    "AgentSkill": ("pkg_3", "Organisation & Compétences", "Certification d'une compétence pour un profil agent donné."),
    "Establishment": ("pkg_3", "Organisation & Compétences", "Point de présence physique de l'entreprise (siège, agence, point relais)."),
    "Subscription": ("pkg_4", "Abonnements & SasPay", "Contrat d'abonnement SaaS actif souscrit par un Workspace."),
    "SubscriptionIntent": ("pkg_4", "Abonnements & SasPay", "Intention de souscription/renouvellement/changement de formule."),
    "PaymentAttempt": ("pkg_4", "Abonnements & SasPay", "Tentative d'exécution d'un paiement auprès de la passerelle SasPay."),
    "PaymentTransaction": ("pkg_4", "Abonnements & SasPay", "Transaction financière validée et imputée à l'abonnement.")
}

idx = 1
for mname, mdata in parsed_models.items():
    tname = mdata["table_name"]
    pkg_id, pkg_name, resp = packages_map.get(mname, ("pkg_other", "Autre", "Responsabilité"))
    doc.append(f"| {idx} | `{mname}` | `{tname}` | {pkg_name} | {resp} | {len(mdata['fields'])} |")
    idx += 1

doc.append("\n---\n")

# Section 2: Fiches détaillées
doc.append("## 2. FICHES DÉTAILLÉES DES 19 CLASSES MÉTIER ET DE LEURS ATTRIBUTS\n")

# Classification logic for attributes
def classify_attr(mname, fname, is_id, is_fk, is_uq, ftype):
    if is_id or is_fk:
        return "Indispensable"
    if fname in ["name", "slug", "email", "firstName", "lastName", "title", "reference", "status", "priority", "plan", "role", "availability", "amountXaf", "priceXaf", "type", "content", "accessLevel", "isMain", "isActive", "activePriceXaf", "slaDueAt"]:
        return "Indispensable"
    if fname in ["customerName", "customerEmail", "customerPhone", "channel", "description", "category", "isPublic", "hasExistingSav", "maxCapacity", "autoAssignmentEnabled", "senderType", "isInternalNote", "intentType", "targetPlan", "attemptNumber", "provider", "currency", "currentPeriodStart", "currentPeriodEnd", "gracePeriodEnd", "resolvedAt", "closedAt", "paidAt", "clientMutationKey", "localAttemptKey", "receiptId"]:
        return "Utile"
    return "Secondaire"

for mname, mdata in parsed_models.items():
    tname = mdata["table_name"]
    pkg_id, pkg_name, resp = packages_map.get(mname, ("pkg_other", "Autre", "Responsabilité"))
    t_fks = fks_by_table.get(tname, {})
    t_uqs = uniques_by_table.get(tname, set())
    
    doc.append(f"### 2.{parsed_models[mname]['model_name']} — Modèle `{mname}`\n")
    doc.append(f"- **Nom Prisma** : `{mname}`")
    doc.append(f"- **Table PostgreSQL** : `{tname}` (mappée via `@@map(\"{tname}\")`)")
    doc.append(f"- **Package fonctionnel** : {pkg_name}")
    doc.append(f"- **Responsabilité métier** : {resp}\n")
    
    doc.append("#### Attributs scalaires déclarés et colonnes PostgreSQL correspondantes\n")
    doc.append("| Nom | Type Prisma | Type PostgreSQL | Nullabilité | PK | FK Référencée | Valeur par Défaut | Contrainte d'Unicité | Pertinence UML |")
    doc.append("|---|---|---|---|:---:|---|---|:---:|:---:|")
    
    for f in mdata["fields"]:
        fname = f["name"]
        pg_c = cols_by_table[tname].get(fname, {})
        pg_type = pg_c.get("udt_name", pg_c.get("data_type", "unknown"))
        is_nullable = pg_c.get("is_nullable", "YES") == "YES"
        null_str = "Facultatif" if is_nullable else "Obligatoire"
        
        fk_info = t_fks.get(fname)
        fk_str = f"`{fk_info['foreign_table_name']}.{fk_info['foreign_column_name']}`" if fk_info else "—"
        
        pk_str = "PK" if f["is_id"] else "—"
        
        # Uniqueness
        is_uq = f["is_unique"] or (fname in t_uqs and not f["is_id"])
        uq_str = "Unique" if is_uq else "—"
        
        col_def = f.get("default")
        if not col_def:
            col_def = pg_c.get("column_default", "—")
        if col_def is None or col_def == "":
            col_def = "—"
        col_def = str(col_def).replace("::text", "").replace("::\"AttemptStatus\"", "").replace("CURRENT_TIMESTAMP", "now()")
        
        pertinence = classify_attr(mname, fname, f["is_id"], bool(fk_info), is_uq, f["type"])
        
        doc.append(f"| `{fname}` | `{f['type']}` | `{pg_type}` | {null_str} | {pk_str} | {fk_str} | `{col_def}` | {uq_str} | **{pertinence}** |")
    
    doc.append("\n#### Relations déclarées et associations UML correspondantes\n")
    doc.append("| Modèle Associé | Champ Origine | Clé Étrangère | Cardinalité A $\\to$ B | Cardinalité B $\\to$ A | Nom Relation | Règles intégrité | Justification contrainte |")
    doc.append("|---|---|---|:---:|:---:|---|---|---|")
    
    for r in mdata["relations"]:
        target = r["target_model"]
        if target not in parsed_models:
            continue
        rel_field = r["field_name"]
        fields = r.get("fields", [])
        refs = r.get("references", [])
        del_rule = r.get("onDelete", "None")
        upd_rule = r.get("onUpdate", "None")
        rel_name = r.get("relation_name") or "—"
        
        # Determine cardinality
        if r["is_list"]:
            card_a_b = "0..*"
        elif r["is_optional"]:
            card_a_b = "0..1"
        else:
            card_a_b = "1"
            
        # Target perspective
        # Find reverse relation in target
        target_mdata = parsed_models[target]
        rev_rel = None
        for tr in target_mdata["relations"]:
            if tr["target_model"] == mname:
                if (r.get("relation_name") and tr.get("relation_name") == r.get("relation_name")) or (not r.get("relation_name") and not tr.get("relation_name")):
                    rev_rel = tr
                    break
        if rev_rel:
            if rev_rel["is_list"]:
                card_b_a = "0..*"
            elif rev_rel["is_optional"]:
                card_b_a = "0..1"
            else:
                card_b_a = "1"
        else:
            card_b_a = "1"
            
        fk_display = f"`{','.join(fields)}` $\\to$ `{','.join(refs)}`" if fields else "(définie côté inverse)"
        rule_str = f"ON DELETE {del_rule}" if del_rule != "None" else "Standard"
        
        # Justification
        if fields:
            is_fk_opt = any(f["is_optional"] for f in mdata["fields"] if f["name"] in fields)
            just = f"FK {'optionnelle' if is_fk_opt else 'obligatoire'}"
            if any(f["is_unique"] for f in mdata["fields"] if f["name"] in fields):
                just += " avec contrainte d'unicité (1-to-1)"
            else:
                just += " autorisant plusieurs occurrences (1-to-N)"
        else:
            just = "Collection relationnelle gérée par la clé étrangère cible"
            
        doc.append(f"| `{target}` | `{rel_field}` | {fk_display} | `{card_a_b}` | `{card_b_a}` | `{rel_name}` | `{rule_str}` | {just} |")
    
    doc.append("\n---\n")

output_txt = "\n".join(doc)
with open(r"scratch\report_part1.md", "w", encoding="utf-8") as f:
    f.write(output_txt)

print(f"Part 1 written ({len(output_txt)} bytes).")
