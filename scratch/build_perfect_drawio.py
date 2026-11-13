import sys
import re
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/original_zadesk_use_case_diagram.drawio', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace all mangled chars in text first
replacements = {
    'ZADESK  DIAGRAMME': "ZADESK — DIAGRAMME",
    'Omnicanale  Portail': "Omnicanale • Portail",
    'Lgende UML': "Légende UML",
    'reli  un Cas': "relié à un Cas",
    'Gnralisation': "Généralisation",
    'Hritage de rle': "Héritage de rôle",
    'Systme Zadesk': "Système Zadesk",
    'Scurit': "Sécurité",
    'Oprationnelle': "Opérationnelle",
    'Rclamations': "Réclamations",
    'quipe': "Équipe",
    'Compte Enregistr': "Compte Enregistré",
    'Systme': "Système",
    'Capacit / Comptence': "Capacité / Compétence",
    'Oprationnel': "Opérationnel",
    'd\'quipe': "d'équipe",
    'coordonnes': "coordonnées",
    'rclamation': "réclamation",
    'Crer': "Créer",
    'change': "échange",
    'dfi': "défi",
    'Vrifier': "Vérifier",
    'Rinitialiser': "Réinitialiser",
    'Mettre  jour': "Mettre à jour",
    'Rassigner': "Réassigner",
    'Rsoudre': "Résoudre",
    'Clturer': "Clôturer",
    'collgue': "collègue",
    'Rdiger': "Rédiger",
    'comptences': "compétences",
}

for k, v in replacements.items():
    text = text.replace(k, v)

# Clean entities: In XML attributes, only &amp;, &lt;, &gt;, &quot;, &apos; are allowed.
# &laquo; and &raquo; MUST be « and » (or &#171; and &#187;)
text = text.replace('&amp;laquo;', '&#171;')
text = text.replace('&amp;raquo;', '&#187;')
text = text.replace('&laquo;', '&#171;')
text = text.replace('&raquo;', '&#187;')
text = text.replace('&bull;', '&#8226;')
text = text.replace('&harr;', '&#8596;')

# Title styling
title_val = '&lt;div style=&quot;text-align:center;&quot;&gt;&lt;b style=&quot;font-size:24px;color:#0F172A;font-family:Inter,Helvetica,sans-serif;&quot;&gt;ZADESK &#8212; DIAGRAMME DES CAS D\'UTILISATION (UML 2.5)&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:13px;color:#475569;font-family:Inter,Helvetica,sans-serif;&quot;&gt;Architecture Omnicanale &#8226; Portail Public, Helpdesk Workspace, Moteur d\'Attribution &amp;amp; Continuit&#233; Agences&lt;/span&gt;&lt;/div&gt;'
text = re.sub(
    r'<mxCell id="title"[^>]*value="[^"]*"[^>]*style="[^"]*"',
    f'<mxCell id="title" value="{title_val}" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;"',
    text
)

# Legend styling
legend_val = '&lt;p style=&quot;margin:0;padding:2px 0;&quot;&gt;&lt;b style=&quot;color:#0F172A;font-size:12px;&quot;&gt;L&#233;gende &amp;amp; Conventions UML :&lt;/b&gt;&lt;/p&gt;&lt;p style=&quot;margin:2px 0;font-size:11px;color:#334155;line-height:1.4;&quot;&gt;&#8226; &lt;b style=&quot;color:#475569;&quot;&gt;Association&lt;/b&gt; : Acteur &#8596; Cas&lt;br/&gt;&#8226; &lt;b style=&quot;color:#059669;&quot;&gt;&#171;include&#187;&lt;/b&gt; : D&#233;pendance obligatoire&lt;br/&gt;&#8226; &lt;b style=&quot;color:#6366F1;&quot;&gt;&#171;extend&#187;&lt;/b&gt; : Extension conditionnelle&lt;br/&gt;&#8226; &lt;b style=&quot;color:#0F172A;&quot;&gt;G&#233;n&#233;ralisation&lt;/b&gt; : H&#233;ritage de r&#244;le&lt;/p&gt;'
text = re.sub(
    r'<mxCell id="legend_box"[^>]*value="[^"]*"[^>]*style="[^"]*"',
    f'<mxCell id="legend_box" value="{legend_val}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;fontFamily=Helvetica;align=left;spacingLeft=12;shadow=0;"',
    text
)

# System boundary
boundary_val = '&lt;div style=&quot;text-align:left;padding-left:15px;padding-top:8px;&quot;&gt;&lt;b style=&quot;font-size:15px;color:#0F172A;font-family:Inter,Helvetica,sans-serif;&quot;&gt;SYST&#200;ME ZADESK (PLATEFORME SAV &amp;amp; WORKSPACE PRO)&lt;/b&gt;&lt;/div&gt;'
text = re.sub(
    r'<mxCell id="system_boundary"[^>]*value="[^"]*"[^>]*style="[^"]*"',
    f'<mxCell id="system_boundary" value="{boundary_val}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#0F172A;strokeWidth=2;dashed=0;verticalAlign=top;shadow=0;"',
    text
)

# Zones styling
zone_updates = {
    'zone_public': ('1. Portail Public &amp; Annuaire d\'Entreprises', '#1E40AF'),
    'zone_auth': ('2. Authentification, Onboarding &amp; S&#233;curit&#233;', '#065F46'),
    'zone_tickets': ('3. Gestion Op&#233;rationnelle des Tickets &amp; R&#233;clamations', '#3730A3'),
    'zone_conv': ('4. Hub Conversationnel &amp; Messagerie Omnicanale (Direct &amp; WhatsApp)', '#0F766E'),
    'zone_admin': ('5. Administration du Workspace, &#201;quipe &amp; Gouvernance', '#78350F')
}
for zid, (ztitle, zcolor) in zone_updates.items():
    zval = f'&lt;b style=&quot;font-size:12px;letter-spacing:0.5px;color:{zcolor};font-family:Helvetica;&quot;&gt;{ztitle}&lt;/b&gt;'
    zstyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#E2E8F0;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=14;spacingTop=8;shadow=0;'
    text = re.sub(
        rf'<mxCell id="{zid}"[^>]*value="[^"]*"[^>]*style="[^"]*"',
        f'<mxCell id="{zid}" value="{zval}" style="{zstyle}"',
        text
    )

# Actors styling
actor_styles = {
    'actor_client': ('Client / Visiteur', 'Grand Public', '#0F172A'),
    'actor_user': ('Utilisateur', 'Compte Enregistr&#233;', '#0F172A'),
    'actor_engine': ('Moteur d\'Attribution', '&#171;Syst&#232;me&#187; Charge &amp; Comp&#233;tences', '#0F172A'),
    'actor_agent': ('Agent SAV', 'Support Op&#233;rationnel', '#0F172A'),
    'actor_manager': ('Manager SAV', 'Superviseur d\'&#201;quipe', '#0F172A'),
    'actor_admin': ('Administrateur', 'Workspace Owner', '#0F172A'),
    'actor_whatsapp': ('Meta WhatsApp API', '&#171;Service Externe&#187; Cloud Webhooks', '#0F172A'),
}
for aid, (atitle, asub, acolor) in actor_styles.items():
    aval = f'&lt;b style=&quot;font-size:12px;color:{acolor};&quot;&gt;{atitle}&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10px;color:#64748B;&quot;&gt;({asub})&lt;/span&gt;'
    astyle = 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#0F172A;strokeWidth=1.8;fontFamily=Helvetica;'
    text = re.sub(
        rf'<mxCell id="{aid}"[^>]*value="[^"]*"[^>]*style="[^"]*"',
        f'<mxCell id="{aid}" value="{aval}" style="{astyle}"',
        text
    )

# Use Cases styling
primary_ucs = {'uc_create_public_ticket', 'uc_start_conv', 'uc_login', 'uc_register', 'uc_process_ticket', 'uc_chat', 'uc_config_ws', 'uc_connect_whatsapp'}
tech_ucs = {'uc_turnstile', 'uc_reset_pwd', 'uc_log_activity', 'uc_internal_note', 'uc_audit_logs'}

def uc_replacer(match):
    uid = match.group(1)
    val = match.group(2)
    
    if uid in primary_ucs:
        style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#059669;strokeWidth=2;fontColor=#0F172A;fontSize=11.5;fontStyle=1;fontFamily=Helvetica;shadow=0;'
    elif uid in tech_ucs:
        style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#94A3B8;strokeWidth=1.5;strokeDasharray=3 3;fontColor=#475569;fontSize=11;fontFamily=Helvetica;shadow=0;'
    else:
        style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;fontColor=#0F172A;fontSize=11.5;fontFamily=Helvetica;shadow=0;'
        
    return f'<mxCell id="{uid}" value="{val}" style="{style}"'

text = re.sub(r'<mxCell id="(uc_[^"]+)"\s+value="([^"]*)"\s+style="([^"]*)"', uc_replacer, text)

# Edges styling
text = re.sub(
    r'<mxCell id="(gen_[^"]+)"([^>]*)style="[^"]*"',
    r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#0F172A;strokeWidth=1.8;endArrow=block;endFill=0;"',
    text
)
text = re.sub(
    r'<mxCell id="(inc_[^"]+)"([^>]*)style="[^"]*"',
    r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=3 3;strokeColor=#059669;strokeWidth=1.5;endArrow=open;endFill=0;fontSize=10;fontColor=#065F46;fontStyle=1;"',
    text
)
text = re.sub(
    r'<mxCell id="(ext_[^"]+)"([^>]*)style="[^"]*"',
    r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=3 3;strokeColor=#6366F1;strokeWidth=1.5;endArrow=open;endFill=0;fontSize=10;fontColor=#4338CA;fontStyle=1;"',
    text
)
text = re.sub(
    r'<mxCell id="(edge_[^"]+)"([^>]*)style="[^"]*"',
    r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;endArrow=none;endFill=0;"',
    text
)

# Also fix include/extend values on edges
text = text.replace('value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;"', 'value="&#171;include&#187;"')
text = text.replace('value="&amp;lt;&amp;lt;extend&amp;gt;&amp;gt;"', 'value="&#171;extend&#187;"')

# Test parse
try:
    ET.fromstring(text)
    print("✓ XML Syntax Verification PASSED flawlessly!")
except Exception as e:
    print(f"✗ XML Error: {e}")
    sys.exit(1)

with open('c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio', 'w', encoding='utf-8') as f:
    f.write(text)

print("✓ Wrote pristine c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio!")

