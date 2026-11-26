import subprocess
import pathlib

plantuml_jar = r"C:\Users\japhet\Downloads\plantuml-1.2026.10.jar"
java_exe = r"C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot\bin\java.exe"

def compile_puml(puml_path):
    p = pathlib.Path(puml_path)
    cmd = [java_exe, "-jar", plantuml_jar, "-tsvg", str(p)]
    res = subprocess.run(cmd, capture_output=True, text=True)
    svg_path = p.with_suffix(".svg")
    return res.returncode, res.stdout, res.stderr, svg_path

# Test layout 1: Top-to-bottom with 2 balanced columns
puml_top_down = """@startuml
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
}

' Espaces
package "PORTAIL PUBLIC (Web sans compte)" as p_portal {
  rectangle "Annuaire des entreprises" as pub_annuaire
  rectangle "Vitrine & Informations" as pub_vitrine
  rectangle "Consultation établissements\\n<i><size:9><color:#64748B>(si renseignés)</color></size></i>" as pub_etab
  rectangle "Soumission demande SAV\\n<i><size:9><color:#64748B>(sans compte)</color></size></i>" as pub_soumission
  rectangle "Tchat direct & Suivi" as pub_tchat
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
}

client --> p_portal : Accède librement
p_actors --> p_ws : Authentification RBAC

pub_soumission --> mod_tickets : Transmet demande
pub_tchat <--> mod_conv : Dialogue direct
mod_conv --> mod_tickets : Élève en ticket
mod_team --> mod_tickets : Affecte agents

mod_ai ..> mod_conv : Suggère réponses
mod_ai ..> mod_tickets : Transfère au conseiller

@enduml
"""

pathlib.Path("scratch/test_layout_topdown.puml").write_text(puml_top_down, encoding="utf-8")
ret, out, err, svg = compile_puml("scratch/test_layout_topdown.puml")
print("Top-down compile code:", ret)

import xml.etree.ElementTree as ET
tree = ET.parse(svg)
root = tree.getroot()
print("Top-down SVG viewBox:", root.attrib.get("viewBox"))
