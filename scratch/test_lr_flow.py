import subprocess
import pathlib
import xml.etree.ElementTree as ET

plantuml_jar = r"C:\Users\japhet\Downloads\plantuml-1.2026.10.jar"
java_exe = r"C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot\bin\java.exe"

puml_lr = """@startuml
skinparam backgroundColor transparent
skinparam shadowing false
skinparam defaultTextAlignment left
skinparam roundCorner 4
skinparam wrapWidth 200

<style>
root {
  FontName "Helvetica"
  FontSize 11
  FontColor #2D3142
  LineColor #CBD5E1
}
package {
  FontName "Georgia"
  FontSize 12
  FontStyle bold
  FontColor #2D3142
  LineColor #4F5D75
  LineThickness 1.2
  BackgroundColor transparent
}
rectangle {
  RoundCorner 4
  LineColor #2D3142
  LineThickness 0.9
  BackgroundColor #FFFFFF
  FontColor #334155
  FontSize 11
}
actor {
  FontName "Helvetica"
  FontSize 10.5
  FontStyle bold
  FontColor #2D3142
  LineColor #2D3142
  BackgroundColor #FFFFFF
}
arrow {
  LineColor #4F5D75
  FontColor #2D3142
  FontSize 10
  LineThickness 1.1
}
.target {
  LineColor #EB6C36
  LineStyle 4-3
  LineThickness 1.2
  BackgroundColor #FFFAF8
}
</style>

' Acteurs
actor "Client\\n<size:9><color:#64748B>Demandeur SAV</color></size>" as client

package "Acteurs Internes (Entreprise)" as p_actors {
  actor "Conseiller SAV\\n<size:9><color:#64748B>(AGENT)</color></size>" as agent
  actor "Superviseur SAV\\n<size:9><color:#64748B>(MANAGER)</color></size>" as manager
  actor "Administrateur\\n<size:9><color:#64748B>(ADMIN)</color></size>" as admin
  actor "Propriétaire\\n<size:9><color:#64748B>(OWNER)</color></size>" as owner
  
  agent -[hidden]right- manager
  agent -[hidden]down- admin
  manager -[hidden]down- owner
}

' Espaces
package "PORTAIL PUBLIC (Web sans compte)" as p_portal {
  rectangle "Annuaire des entreprises" as pub_annuaire
  rectangle "Vitrine & Informations" as pub_vitrine
  rectangle "Consultation établissements\\n<i><size:9><color:#64748B>(si renseignés)</color></size></i>" as pub_etab
  rectangle "Soumission demande SAV\\n<i><size:9><color:#64748B>(sans compte)</color></size></i>" as pub_soumission
  rectangle "Tchat direct & Suivi" as pub_tchat
  
  pub_annuaire -down-> pub_vitrine
  pub_vitrine -down-> pub_etab
  pub_etab -down-> pub_soumission
  pub_soumission -down-> pub_tchat
}

package "WORKSPACE ENTREPRISE (Multi-Tenant)" as p_ws {
  rectangle "Gestion des tickets SAV" as mod_tickets
  rectangle "Conversations & Échanges" as mod_conv
  rectangle "Gestion agents & Compétences" as mod_team
  rectangle "Gestion des établissements\\n<i><size:9><color:#64748B>(optionnel)</color></size></i>" as mod_agencies
  rectangle "Gestion membres & Rôles" as mod_members
  rectangle "Paramètres de l'entreprise" as mod_settings
  rectangle "Gestion des abonnements (SasPay)" as mod_billing
  rectangle "Assistance IA (RAG)\\n<size:9.5><color:#EB6C36><b>[ Composante cible ]</b></color></size>" as mod_ai <<target>>
  
  mod_tickets -[hidden]right- mod_conv
  mod_tickets -down-> mod_team
  mod_conv -down-> mod_agencies
  mod_team -down-> mod_members
  mod_agencies -down-> mod_settings
  mod_members -down-> mod_billing
  mod_settings -down-> mod_ai
}

client -[hidden]right- p_actors
p_portal -[hidden]right- p_ws

client --> p_portal : Accède librement
p_actors --> p_ws : Authentification RBAC

pub_soumission -right-> mod_tickets : Transmet réclamation
pub_tchat -right-> mod_conv : Dialogue direct
mod_conv -left-> mod_tickets : Élève en ticket

mod_ai .up.> mod_conv : Suggère réponses
mod_ai .left.> mod_tickets : Transfère au conseiller

@enduml
"""

p = pathlib.Path("scratch/test_lr_flow.puml")
p.write_text(puml_lr, encoding="utf-8")
cmd = [java_exe, "-jar", plantuml_jar, "-tsvg", str(p)]
res = subprocess.run(cmd, capture_output=True, text=True)
print("LR compile code:", res.returncode)

tree = ET.parse("scratch/test_lr_flow.svg")
root = tree.getroot()
print("LR SVG viewBox:", root.attrib.get("viewBox"))
for g in root.findall('.//{http://www.w3.org/2000/svg}g'):
    cid = g.attrib.get('id', '')
    if 'ent0011' in cid or 'ent0021' in cid:
        rect = g.find('{http://www.w3.org/2000/svg}rect')
        text = g.find('{http://www.w3.org/2000/svg}text')
        tval = text.text if text is not None else ''
        print(cid, tval, 'x:', rect.attrib.get('x'), 'y:', rect.attrib.get('y'))
