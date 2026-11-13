import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/fixed_test.drawio', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect all cell styles in fixed_test.drawio and rewrite them with the enterprise theme

def refine_styles(xml_str):
    # 1. Title styling
    xml_str = re.sub(
        r'<mxCell id="title"[^>]*value="[^"]*"[^>]*style="[^"]*"',
        '<mxCell id="title" value="&lt;div style=&quot;text-align:center;&quot;&gt;&lt;b style=&quot;font-size:24px;color:#0F172A;font-family:Inter,Helvetica,sans-serif;&quot;&gt;ZADESK — DIAGRAMME DES CAS D\'UTILISATION (UML 2.5)&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:13px;color:#475569;font-family:Inter,Helvetica,sans-serif;&quot;&gt;Architecture Omnicanale • Portail Public, Helpdesk Workspace, Moteur d\'Attribution &amp;amp; Continuité Agences&lt;/span&gt;&lt;/div&gt;" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;"',
        xml_str
    )
    
    # 2. Legend styling
    legend_val = '&lt;p style=&quot;margin:0;padding:2px 0;&quot;&gt;&lt;b style=&quot;color:#0F172A;font-size:12px;&quot;&gt;Légende &amp;amp; Conventions UML :&lt;/b&gt;&lt;/p&gt;&lt;p style=&quot;margin:2px 0;font-size:11px;color:#334155;line-height:1.4;&quot;&gt;• &lt;b style=&quot;color:#475569;&quot;&gt;Association&lt;/b&gt; : Acteur &amp;harr; Cas&lt;br/&gt;• &lt;b style=&quot;color:#059669;&quot;&gt;&amp;laquo;include&amp;raquo;&lt;/b&gt; : Dépendance obligatoire&lt;br/&gt;• &lt;b style=&quot;color:#6366F1;&quot;&gt;&amp;laquo;extend&amp;raquo;&lt;/b&gt; : Extension conditionnelle&lt;br/&gt;• &lt;b style=&quot;color:#0F172A;&quot;&gt;Généralisation&lt;/b&gt; : Héritage de rôle&lt;/p&gt;'
    xml_str = re.sub(
        r'<mxCell id="legend_box"[^>]*value="[^"]*"[^>]*style="[^"]*"',
        f'<mxCell id="legend_box" value="{legend_val}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;fontFamily=Helvetica;align=left;spacingLeft=12;shadow=0;"',
        xml_str
    )

    # 3. System boundary
    boundary_val = '&lt;div style=&quot;text-align:left;padding-left:15px;padding-top:8px;&quot;&gt;&lt;b style=&quot;font-size:15px;color:#0F172A;font-family:Inter,Helvetica,sans-serif;&quot;&gt;SYSTÈME ZADESK (PLATEFORME SAV &amp;amp; WORKSPACE PRO)&lt;/b&gt;&lt;/div&gt;'
    xml_str = re.sub(
        r'<mxCell id="system_boundary"[^>]*value="[^"]*"[^>]*style="[^"]*"',
        f'<mxCell id="system_boundary" value="{boundary_val}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#0F172A;strokeWidth=2;dashed=0;verticalAlign=top;shadow=0;"',
        xml_str
    )

    # 4. Zones (Subtle slate containers with clear titles)
    zone_updates = {
        'zone_public': ('1. Portail Public &amp; Annuaire d\'Entreprises', '#1E40AF'),
        'zone_auth': ('2. Authentification, Onboarding &amp; Sécurité', '#065F46'),
        'zone_tickets': ('3. Gestion Opérationnelle des Tickets &amp; Réclamations', '#3730A3'),
        'zone_conv': ('4. Hub Conversationnel &amp; Messagerie Omnicanale (Direct &amp; WhatsApp)', '#0F766E'),
        'zone_admin': ('5. Administration du Workspace, Équipe &amp; Gouvernance', '#78350F')
    }
    for zid, (ztitle, zcolor) in zone_updates.items():
        zval = f'&lt;b style=&quot;font-size:12px;letter-spacing:0.5px;color:{zcolor};font-family:Helvetica;&quot;&gt;{ztitle}&lt;/b&gt;'
        zstyle = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#E2E8F0;strokeWidth=1.5;verticalAlign=top;align=left;spacingLeft=14;spacingTop=8;shadow=0;'
        xml_str = re.sub(
            rf'<mxCell id="{zid}"[^>]*value="[^"]*"[^>]*style="[^"]*"',
            f'<mxCell id="{zid}" value="{zval}" style="{zstyle}"',
            xml_str
        )

    # 5. Actors (Draw.io native umlActor with sleek monochrome/navy styling)
    actor_styles = {
        'actor_client': ('Client / Visiteur', 'Grand Public', '#0F172A'),
        'actor_user': ('Utilisateur', 'Compte Enregistré', '#0F172A'),
        'actor_engine': ('Moteur d\'Attribution', '&laquo;Système&raquo; Charge &amp; Compétences', '#0F172A'),
        'actor_agent': ('Agent SAV', 'Support Opérationnel', '#0F172A'),
        'actor_manager': ('Manager SAV', 'Superviseur d\'Équipe', '#0F172A'),
        'actor_admin': ('Administrateur', 'Workspace Owner', '#0F172A'),
        'actor_whatsapp': ('Meta WhatsApp API', '&laquo;Service Externe&raquo; Cloud Webhooks', '#0F172A'),
    }
    for aid, (atitle, asub, acolor) in actor_styles.items():
        aval = f'&lt;b style=&quot;font-size:12px;color:{acolor};&quot;&gt;{atitle}&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10px;color:#64748B;&quot;&gt;({asub})&lt;/span&gt;'
        astyle = 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#FFFFFF;strokeColor=#0F172A;strokeWidth=1.8;fontFamily=Helvetica;'
        xml_str = re.sub(
            rf'<mxCell id="{aid}"[^>]*value="[^"]*"[^>]*style="[^"]*"',
            f'<mxCell id="{aid}" value="{aval}" style="{astyle}"',
            xml_str
        )

    # 6. Use Cases - Clean ellipses without shadows
    # High-value / Primary workflows:
    primary_ucs = {'uc_create_public_ticket', 'uc_start_conv', 'uc_login', 'uc_register', 'uc_process_ticket', 'uc_chat', 'uc_config_ws', 'uc_connect_whatsapp'}
    # Technical / Secondary:
    tech_ucs = {'uc_turnstile', 'uc_reset_pwd', 'uc_log_activity', 'uc_internal_note', 'uc_audit_logs'}

    def uc_replacer(match):
        uid = match.group(1)
        val = match.group(2)
        old_style = match.group(3)
        
        # Clean value from shadows/ugly tags
        val_clean = val.replace('&amp;amp;', '&amp;')
        
        if uid in primary_ucs:
            style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#059669;strokeWidth=2;fontColor=#0F172A;fontSize=11.5;fontStyle=1;fontFamily=Helvetica;shadow=0;'
        elif uid in tech_ucs:
            style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#94A3B8;strokeWidth=1.5;strokeDasharray=3 3;fontColor=#475569;fontSize=11;fontFamily=Helvetica;shadow=0;'
        else:
            style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#CBD5E1;strokeWidth=1.5;fontColor=#0F172A;fontSize=11.5;fontFamily=Helvetica;shadow=0;'
            
        return f'<mxCell id="{uid}" value="{val_clean}" style="{style}"'

    xml_str = re.sub(r'<mxCell id="(uc_[^"]+)"\s+value="([^"]*)"\s+style="([^"]*)"', uc_replacer, xml_str)

    # 7. Edges - Professional lines
    # Generalizations
    xml_str = re.sub(
        r'<mxCell id="(gen_[^"]+)"([^>]*)style="[^"]*"',
        r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#0F172A;strokeWidth=1.8;endArrow=block;endFill=0;"',
        xml_str
    )

    # Includes
    xml_str = re.sub(
        r'<mxCell id="(inc_[^"]+)"([^>]*)style="[^"]*"',
        r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=3 3;strokeColor=#059669;strokeWidth=1.5;endArrow=open;endFill=0;fontSize=10;fontColor=#065F46;fontStyle=1;"',
        xml_str
    )

    # Extends
    xml_str = re.sub(
        r'<mxCell id="(ext_[^"]+)"([^>]*)style="[^"]*"',
        r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;dashPattern=3 3;strokeColor=#6366F1;strokeWidth=1.5;endArrow=open;endFill=0;fontSize=10;fontColor=#4338CA;fontStyle=1;"',
        xml_str
    )

    # Associations
    xml_str = re.sub(
        r'<mxCell id="(edge_[^"]+)"([^>]*)style="[^"]*"',
        r'<mxCell id="\1"\2style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;endArrow=none;endFill=0;"',
        xml_str
    )

    return xml_str

refined = refine_styles(content)
with open('c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio', 'w', encoding='utf-8') as f:
    f.write(refined)

print("Successfully written c:/Users/japhet/Downloads/zadesk/zadesk_use_case_diagram.drawio!")

