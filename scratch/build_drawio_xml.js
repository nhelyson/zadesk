const fs = require('fs');
const path = require('path');

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const drawioContent = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-11-21T18:50:00.000Z" agent="Antigravity / Kroki Editorial Diagrams" version="24.7.0">
  <diagram id="zadesk-architecture-fonctionnelle-officielle" name="Architecture Fonctionnelle Zadesk - Officielle">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1520" pageHeight="940" background="#FFFFFF" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- ================================================================= -->
        <!-- EN-TÊTE ÉDITORIAL                                                 -->
        <!-- ================================================================= -->
        <mxCell id="hdr_brand" parent="1" value="ZADESK" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#1E3A8A;fontStyle=1;fontFamily=-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;letterSpacing=1.5;" vertex="1">
          <mxGeometry x="60" y="38" width="100" height="20" as="geometry" />
        </mxCell>
        <mxCell id="hdr_title" parent="1" value="Architecture fonctionnelle" style="text;html=1;align=left;verticalAlign=middle;fontSize=28;fontColor:#1E293B;fontStyle=1;fontFamily=-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;" vertex="1">
          <mxGeometry x="60" y="58" width="500" height="38" as="geometry" />
        </mxCell>
        <mxCell id="hdr_sub" parent="1" value="Acteurs, espaces d'accès et principaux modules de la plateforme" style="text;html=1;align=left;verticalAlign=middle;fontSize=13.5;fontColor:#64748B;fontStyle=0;fontFamily=-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;" vertex="1">
          <mxGeometry x="60" y="96" width="600" height="24" as="geometry" />
        </mxCell>

        <!-- ================================================================= -->
        <!-- ZONE 1 : ACTEURS (Gauche)                                         -->
        <!-- ================================================================= -->
        <mxCell id="box_acteurs" parent="1" value="" style="rounded=1;arcSize=4;fillColor=#FFFFFF;strokeColor=#E2E8F0;strokeWidth=1.2;shadow=0;" vertex="1">
          <mxGeometry x="60" y="180" width="230" height="400" as="geometry" />
        </mxCell>
        <mxCell id="lbl_acteurs" parent="1" value="ACTEURS" style="text;html=1;align=left;verticalAlign=middle;fontSize=14;fontColor:#0F172A;fontStyle=1;letterSpacing=0.5;" vertex="1">
          <mxGeometry x="80" y="195" width="150" height="24" as="geometry" />
        </mxCell>

        <!-- Accès externe -->
        <mxCell id="lbl_ext" parent="1" value="Accès externe" style="text;html=1;align=left;verticalAlign=middle;fontSize=10.5;fontColor:#64748B;fontStyle=1;" vertex="1">
          <mxGeometry x="80" y="225" width="150" height="20" as="geometry" />
        </mxCell>
        <mxCell id="card_client" parent="1" value="&lt;div style=&quot;padding:4px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#1E3A8A;&quot;&gt;CLIENT&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Utilisateur du portail public&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#EFF6FF;strokeColor=#BFDBFE;strokeWidth=1;html=1;verticalAlign=middle;align=left;" vertex="1">
          <mxGeometry x="75" y="248" width="200" height="56" as="geometry" />
        </mxCell>

        <!-- Accès interne -->
        <mxCell id="lbl_int" parent="1" value="Accès interne" style="text;html=1;align=left;verticalAlign=middle;fontSize=10.5;fontColor:#64748B;fontStyle=1;" vertex="1">
          <mxGeometry x="80" y="322" width="150" height="20" as="geometry" />
        </mxCell>
        <mxCell id="card_agent" parent="1" value="&lt;div style=&quot;padding:4px;&quot;&gt;&lt;b style=&quot;font-size:12px;color:#065F46;&quot;&gt;AGENT&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10px;color:#64748B;&quot;&gt;Conseiller SAV&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;verticalAlign=middle;align=left;" vertex="1">
          <mxGeometry x="75" y="344" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="card_manager" parent="1" value="&lt;div style=&quot;padding:4px;&quot;&gt;&lt;b style=&quot;font-size:12px;color:#065F46;&quot;&gt;MANAGER&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10px;color:#64748B;&quot;&gt;Superviseur SAV&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;verticalAlign=middle;align=left;" vertex="1">
          <mxGeometry x="75" y="400" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="card_admin" parent="1" value="&lt;div style=&quot;padding:4px;&quot;&gt;&lt;b style=&quot;font-size:12px;color:#065F46;&quot;&gt;ADMIN&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10px;color:#64748B;&quot;&gt;Administrateur de l'entreprise&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;verticalAlign=middle;align=left;" vertex="1">
          <mxGeometry x="75" y="456" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="card_owner" parent="1" value="&lt;div style=&quot;padding:4px;&quot;&gt;&lt;b style=&quot;font-size:12px;color:#065F46;&quot;&gt;OWNER&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10px;color:#64748B;&quot;&gt;Propriétaire de l'espace&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;verticalAlign=middle;align=left;" vertex="1">
          <mxGeometry x="75" y="512" width="200" height="50" as="geometry" />
        </mxCell>

        <!-- ================================================================= -->
        <!-- ZONE 2 : PORTAIL PUBLIC (Centre)                                  -->
        <!-- ================================================================= -->
        <mxCell id="pill_portal" parent="1" value="PORTAIL PUBLIC" style="rounded=1;arcSize=8;fillColor=#36648F;strokeColor=none;fontColor=#FFFFFF;fontSize=14.5;fontStyle=1;align=center;verticalAlign=middle;letterSpacing=0.8;" vertex="1">
          <mxGeometry x="390" y="180" width="360" height="44" as="geometry" />
        </mxCell>
        <mxCell id="sub_portal" parent="1" value="Espace destiné aux clients" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#64748B;fontStyle=2;" vertex="1">
          <mxGeometry x="395" y="228" width="300" height="20" as="geometry" />
        </mxCell>
        <mxCell id="box_portal" parent="1" value="" style="rounded=1;arcSize=4;fillColor=#FFFFFF;strokeColor=#E2E8F0;strokeWidth=1.2;" vertex="1">
          <mxGeometry x="390" y="254" width="360" height="326" as="geometry" />
        </mxCell>

        <!-- Modules Portail Public -->
        <mxCell id="m_pub_annuaire" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#1E293B;&quot;&gt;Annuaire des entreprises&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Recherche et accès aux fiches entreprise&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=6;fillColor=#F8FAFC;strokeColor=#E2E8F0;strokeWidth=0.8;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="405" y="268" width="330" height="54" as="geometry" />
        </mxCell>
        <mxCell id="m_pub_infos" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#1E293B;&quot;&gt;Informations de l'entreprise&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Consultation des informations utiles&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=6;fillColor=#F8FAFC;strokeColor=#E2E8F0;strokeWidth=0.8;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="405" y="330" width="330" height="54" as="geometry" />
        </mxCell>
        <mxCell id="m_pub_etab" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#1E293B;&quot;&gt;Établissements&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Consultation des établissements, le cas échéant&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=6;fillColor=#F8FAFC;strokeColor=#E2E8F0;strokeWidth=0.8;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="405" y="392" width="330" height="54" as="geometry" />
        </mxCell>
        <mxCell id="m_pub_demande" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#1E293B;&quot;&gt;Demande SAV&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Soumission d'une demande sans compte client&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=6;fillColor=#F8FAFC;strokeColor=#E2E8F0;strokeWidth=0.8;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="405" y="454" width="330" height="54" as="geometry" />
        </mxCell>
        <mxCell id="m_pub_echanges" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#1E293B;&quot;&gt;Échanges et suivi&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Communication et suivi de la demande*&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=6;fillColor=#F8FAFC;strokeColor=#E2E8F0;strokeWidth=0.8;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="405" y="516" width="330" height="54" as="geometry" />
        </mxCell>

        <!-- ================================================================= -->
        <!-- ZONE 3 : WORKSPACE ENTREPRISE (Droite)                            -->
        <!-- ================================================================= -->
        <mxCell id="pill_ws" parent="1" value="WORKSPACE ENTREPRISE" style="rounded=1;arcSize=8;fillColor=#247A5B;strokeColor=none;fontColor=#FFFFFF;fontSize=14.5;fontStyle=1;align=center;verticalAlign=middle;letterSpacing=0.8;" vertex="1">
          <mxGeometry x="840" y="180" width="620" height="44" as="geometry" />
        </mxCell>
        <mxCell id="sub_ws" parent="1" value="Espace réservé aux équipes de l'entreprise" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#64748B;fontStyle=2;" vertex="1">
          <mxGeometry x="845" y="228" width="350" height="20" as="geometry" />
        </mxCell>
        <mxCell id="box_ws" parent="1" value="" style="rounded=1;arcSize=4;fillColor=#FFFFFF;strokeColor=#E2E8F0;strokeWidth=1.2;" vertex="1">
          <mxGeometry x="840" y="254" width="620" height="326" as="geometry" />
        </mxCell>

        <!-- Grille Modules Workspace -->
        <mxCell id="m_ws_tickets" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#065F46;&quot;&gt;Tickets SAV&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Réception et traitement&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="858" y="268" width="282" height="66" as="geometry" />
        </mxCell>
        <mxCell id="m_ws_conv" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#065F46;&quot;&gt;Conversations&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Échanges avec les clients&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="1160" y="268" width="282" height="66" as="geometry" />
        </mxCell>
        <mxCell id="m_ws_agents" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#065F46;&quot;&gt;Agents et compétences&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Organisation des équipes&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="858" y="342" width="282" height="66" as="geometry" />
        </mxCell>
        <mxCell id="m_ws_etab" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#065F46;&quot;&gt;Établissements&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Informations des sites&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="1160" y="342" width="282" height="66" as="geometry" />
        </mxCell>
        <mxCell id="m_ws_membres" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#065F46;&quot;&gt;Membres et rôles&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Gestion des accès&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="858" y="416" width="282" height="66" as="geometry" />
        </mxCell>
        <mxCell id="m_ws_params" parent="1" value="&lt;div style=&quot;padding:4px 8px;&quot;&gt;&lt;b style=&quot;font-size:12.5px;color:#065F46;&quot;&gt;Paramètres entreprise&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Configuration de l'espace&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;align=left;verticalAlign=middle;" vertex="1">
          <mxGeometry x="1160" y="416" width="282" height="66" as="geometry" />
        </mxCell>
        <mxCell id="m_ws_abo" parent="1" value="&lt;div style=&quot;padding:4px 8px;text-align:center;&quot;&gt;&lt;b style=&quot;font-size:13px;color:#065F46;&quot;&gt;Abonnements&lt;/b&gt;&lt;br/&gt;&lt;span style=&quot;font-size:10.5px;color:#64748B;&quot;&gt;Gestion de l'offre&lt;/span&gt;&lt;/div&gt;" style="rounded=1;arcSize=8;fillColor=#ECFDF5;strokeColor=#A7F3D0;strokeWidth=1;html=1;align=center;verticalAlign=middle;" vertex="1">
          <mxGeometry x="858" y="490" width="584" height="74" as="geometry" />
        </mxCell>

        <!-- ================================================================= -->
        <!-- ZONE 4 : COMPOSANTE CIBLE (Assistance IA - RAG)                   -->
        <!-- ================================================================= -->
        <mxCell id="card_rag" parent="1" value="&lt;div style=&quot;padding:8px 12px;&quot;&gt;&lt;b style=&quot;font-size:13.5px;color:#B45309;letter-spacing:0.5px;&quot;&gt;ASSISTANCE PAR IA — RAG&lt;/b&gt;&lt;br/&gt;&lt;b style=&quot;font-size:9.5px;color:#D97706;letter-spacing:1px;&quot;&gt;COMPOSANTE CIBLE&lt;/b&gt;&lt;div style=&quot;margin-top:8px;font-size:11px;color:#78350F;line-height:1.6;&quot;&gt;• Documents de référence de l'entreprise&lt;br/&gt;• Recherche documentaire et propositions de réponses&lt;br/&gt;• Transfert vers un conseiller si nécessaire&lt;/div&gt;&lt;/div&gt;" style="rounded=1;arcSize=6;fillColor=#FEF7EE;strokeColor=#D97706;strokeWidth=1.8;dashed=1;dashPattern=6 4;html=1;align=left;verticalAlign=top;" vertex="1">
          <mxGeometry x="390" y="640" width="410" height="130" as="geometry" />
        </mxCell>

        <!-- ================================================================= -->
        <!-- CONNECTEURS ET FLÈCHES D'ACCÈS                                    -->
        <!-- ================================================================= -->
        <!-- Client -> Portail Public -->
        <mxCell id="edge_client" parent="1" edge="1" source="card_client" target="box_portal" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#2563EB;strokeWidth=2.2;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Accès Interne -> Workspace -->
        <mxCell id="edge_team" parent="1" value="Accès au Workspace selon le rôle et les permissions" edge="1" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#1E7864;strokeWidth=2.2;endArrow=block;endFill=1;fontSize=10.5;fontColor:#475569;labelBackgroundColor=#FFFFFF;labelBorderColor=#CBD5E1;">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="275" y="488" as="sourcePoint" />
            <mxPoint x="1150" y="180" as="targetPoint" />
            <Array as="points">
              <mxPoint x="340" y="488" />
              <mxPoint x="340" y="148" />
              <mxPoint x="1150" y="148" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Portail Public -> IA RAG -->
        <mxCell id="edge_portal_rag" parent="1" edge="1" source="box_portal" target="card_rag" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#D97706;strokeWidth=2;dashed=1;dashPattern=6 4;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="570" y="580" as="sourcePoint" />
            <mxPoint x="570" y="640" as="targetPoint" />
          </mxGeometry>
        </mxCell>

        <!-- Workspace -> IA RAG -->
        <mxCell id="edge_ws_rag" parent="1" edge="1" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor=#D97706;strokeWidth=2;dashed=1;dashPattern=6 4;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="870" y="580" as="sourcePoint" />
            <mxPoint x="800" y="705" as="targetPoint" />
            <Array as="points">
              <mxPoint x="870" y="705" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- ================================================================= -->
        <!-- BAS DE PAGE & LECTURE DU SCHÉMA                                   -->
        <!-- ================================================================= -->
        <mxCell id="f_note" parent="1" value="* À confirmer selon les fonctionnalités effectivement implémentées dans la version étudiée." style="text;html=1;align=left;verticalAlign=middle;fontSize=10;fontColor:#64748B;fontStyle=2;" vertex="1">
          <mxGeometry x="60" y="795" width="600" height="20" as="geometry" />
        </mxCell>
        <mxCell id="f_line" parent="1" value="" style="line;strokeColor=#E2E8F0;strokeWidth=1.2;" vertex="1">
          <mxGeometry x="60" y="820" width="1400" height="10" as="geometry" />
        </mxCell>
        <mxCell id="f_title" parent="1" value="LECTURE DU SCHÉMA" style="text;html=1;align=left;verticalAlign=middle;fontSize=11;fontColor:#1E293B;fontStyle=1;letterSpacing=0.8;" vertex="1">
          <mxGeometry x="60" y="836" width="300" height="20" as="geometry" />
        </mxCell>
        <mxCell id="f_desc1" parent="1" value="Les flèches indiquent les accès aux espaces fonctionnels. Les modules sont regroupés dans leur espace respectif." style="text;html=1;align=left;verticalAlign=middle;fontSize=10.5;fontColor:#475569;" vertex="1">
          <mxGeometry x="60" y="856" width="1000" height="18" as="geometry" />
        </mxCell>
        <mxCell id="f_desc2" parent="1" value="Le module RAG est présenté séparément et en pointillés pour signaler son statut de composante cible." style="text;html=1;align=left;verticalAlign=middle;fontSize=10.5;fontColor:#475569;" vertex="1">
          <mxGeometry x="60" y="874" width="1000" height="18" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

const targetPath = path.resolve('diagrammes/Zadesk_Architecture_Fonctionnelle_Officielle.drawio');
fs.writeFileSync(targetPath, drawioContent, 'utf8');
console.log('Successfully wrote Draw.io file to:', targetPath);
