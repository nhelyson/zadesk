# AUDIT FONCTIONNEL ET SPÉCIFICATION UML DES CAS D'UTILISATION
## Plateforme SaaS Zalisk — Section 3.3.1 du Mémoire de Licence en Génie Informatique

---

### Référence du document
- **Projet :** Zalisk (Gestion Omnicanale & Intelligente du SAV Multi-Entreprises)
- **Partie du mémoire :** Chapitre 3 — *Conception et mise en œuvre de la solution Zalisk*
- **Sous-sections :** 
  - `3.3 Analyse et description du système`
  - `3.3.1 Interactions entre les acteurs et le système`
  - `3.3.1.1 Cas d'utilisation global`
  - `3.3.1.2 Description des principaux cas d'utilisation`
- **Statut de conformité :** Conforme aux standards UML 2.5 et vérifié sur le code source de l'application.

---

## 1. Audit exhaustif et qualification des acteurs

L'architecture de Zalisk repose sur une séparation stricte entre les usagers externes (clients finaux accédant librement sans création obligatoire de compte) et le personnel des entreprises clientes souscrit au service SaaS (authentifié et soumis à un contrôle d'accès basé sur les rôles - RBAC).

### 1.1. L'acteur externe : Le Client (Grand Public)

| Propriété | Spécification vérifiée dans l'application |
| :--- | :--- |
| **Nature de l'acteur** | Acteur externe humain, consommateur final ou usager d'une entreprise adhérente. |
| **Objectif métier** | Obtenir une assistance immédiate, déposer une réclamation SAV ou suivre l'état d'un dossier sans friction administrative. |
| **Espace d'accès** | **Portail Public** (`/c/[companySlug]`, `/c/[companySlug]/track`, `/annuaire`). |
| **Mécanisme d'identification** | Sans compte préalable. Session sécurisée par jeton cryptographique éphémère (`publicTokenHash` hashé en SHA-256 dans le modèle `Conversation`). |
| **Opérations autorisées** | 1. Consulter l'annuaire public des entreprises et les fiches détaillées.<br>2. Soumettre un formulaire de demande SAV en renseignant ses coordonnées.<br>3. Échanger en temps réel via la messagerie instantanée (tchat Web).<br>4. Interagir avec l'assistant automatisé dopé à l'IA (moteur RAG).<br>5. Solliciter une escalade vers un conseiller humain en cas d'insatisfaction.<br>6. Suivre l'avancement d'une demande à l'aide d'un numéro de dossier unique. |
| **Restrictions et étanchéité** | Aucun accès au back-office d'administration, aucune visibilité sur les notes internes des conseillers, étanchéité stricte aux données des autres clients et des autres entreprises. |

### 1.2. L'équipe interne de l'entreprise : Matrice RBAC des acteurs

Les collaborateurs internes accèdent à l'espace applicatif réservé (`/app/(workspace)`). L'attribution des rôles est matérialisée par l'énumération `Role { OWNER, ADMIN, MANAGER, AGENT }` du modèle Prisma `Membership`.

```
           [OWNER] (Propriétaire de l'espace)
              │
              ▼ (Super-ensemble de privilèges)
           [ADMIN] (Administrateur de l'organisation)
              │
              ▼ (Délégation managériale)
          [MANAGER] (Superviseur SAV & Coordination)
              │
              ▼ (Exécution opérationnelle)
           [AGENT] (Conseiller SAV)
```

#### A. Le Conseiller SAV (`AGENT`)
- **Rôle :** Front-office opérationnel du support client.
- **Objectifs :** Prendre en charge les flux conversationnels entrants, résoudre les litiges, qualifier les demandes et instruire les tickets SAV dans le respect des engagements de service (SLA).
- **Opérations autorisées :**
  - Gérer son statut de disponibilité (`ONLINE`, `BUSY`, `AWAY`, `OFFLINE`) via le modèle `AgentProfile`.
  - Traiter les conversations assignées ou issues de la file d'attente générale.
  - Consulter les suggestions de réponses synthétisées par le moteur IA à partir de la base documentaire.
  - Insérer des notes internes confidentielles (`isInternalNote: true` dans `TicketActivity`).
  - Convertir une conversation résiduelle en ticket formel avec criticité et catégorie.
  - Traiter, mettre à jour le statut (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) et clore les tickets.
  - Partager l'accès à un dossier avec un collègue (`TicketShare` en mode lecture ou contribution).
- **Restrictions :** Ne peut pas réassigner d'autorité les tickets d'autrui, ni modifier les paramètres de l'entreprise, ni inviter de nouveaux collaborateurs.

#### B. Le Superviseur SAV (`MANAGER`)
- **Rôle :** Pilotage opérationnel, assurance qualité et répartition de la charge de travail.
- **Objectifs :** Éviter les goulots d'étranglement, garantir le respect des délais SLA et encadrer la montée en compétences des équipes.
- **Opérations autorisées :**
  - Disposer d'une visibilité panoramique sur l'ensemble des tickets et conversations du workspace.
  - Réaffecter manuellement un dossier ou forcer une attribution (`reassignTicket` dans `agentService.js`).
  - Définir, certifier et administrer la matrice de compétences des agents (`Skill` et `AgentSkill`).
  - Configurer les succursales régionales, points de vente et ateliers de réparation (`Establishment`).
  - Analyser les métriques opérationnelles : taux de résolution au premier contact (FCR), temps moyen de réponse (MTTR), volume des transferts IA/Humain.
- **Restrictions :** Ne peut pas suspendre d'administrateurs ni modifier la souscription commerciale de l'espace.

#### C. L'Administrateur de l'Entreprise (`ADMIN`)
- **Rôle :** Gouvernance organisationnelle, gestion des identités et du patrimoine informationnel.
- **Objectifs :** Maintenir à jour les accès de l'entreprise, intégrer les canaux de communication et enrichir le corpus de connaissances documentaires exploité par l'intelligence artificielle.
- **Opérations autorisées :**
  - Inviter de nouveaux collaborateurs et leur assigner un rôle RBAC (`inviteWorkspaceMember`).
  - Suspendre ou réactiver le compte d'un membre (`suspendWorkspaceMember`), à l'exception absolue du propriétaire.
  - Paramétrer les métadonnées de l'entreprise (nom, logo, slug public, canaux WhatsApp et passerelles Webhook).
  - Alimenter, indexer et structurer la base de connaissances documentaire du système RAG (`KnowledgeBase`).
- **Restrictions :** Ne peut pas supprimer le workspace ni souscrire ou rétrograder les abonnements payants.

#### D. Le Propriétaire de l'Espace (`OWNER`)
- **Rôle :** Représentant légal de l'entreprise souscriptrice et détenteur du compte souverain.
- **Objectifs :** Assurer la viabilité contractuelle du service, superviser la facturation et disposer du pouvoir de révocation ultime.
- **Opérations autorisées :**
  - Détenir l'intégralité des prérogatives des rôles `ADMIN`, `MANAGER` et `AGENT`.
  - Choisir la formule d'abonnement SaaS, initier les transactions et gérer les paiements mobiles/bancaires dématérialisés (via la passerelle SasPay).
  - Exécuter la suppression irréversible du workspace et de l'ensemble de ses données associées (droit à l'effacement et résiliation).
- **Invariants de sécurité vérifiés dans le code :**
  - *Non-suspensibilité :* Le propriétaire ne peut en aucun cas faire l'objet d'une suspension administrative (`if (target.role === 'OWNER') throw new ForbiddenError(...)`).
  - *Unicité du mandat financier :* Seul le rôle `OWNER` est habilité à émettre des intentions de changement de formule commerciale (`SubscriptionIntent`).

---

## 2. Structuration des packages et inventaire des 24 cas d'utilisation

Le système est délimité par une frontière unique : le **Système Zalisk**. Afin d'offrir une lisibilité exemplaire et de refléter l'architecture modulaire du logiciel, les fonctionnalités sont réparties en 5 sous-systèmes (packages UML).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTÈME ZALISK                                 │
├───────────────────────────────────┬─────────────────────────────────────────┤
│ 1. Portail Public & Libre Accès   │ 6 cas d'utilisation (Client)            │
│ 2. Traitement Opérationnel SAV    │ 7 cas d'utilisation (Conseiller SAV)    │
│ 3. Supervision & Coordination     │ 5 cas d'utilisation (Superviseur SAV)   │
│ 4. Administration & Connaissances │ 4 cas d'utilisation (Administrateur)    │
│ 5. Souveraineté & Commercial      │ 2 cas d'utilisation (Propriétaire)      │
└───────────────────────────────────┴─────────────────────────────────────────┘
```

### 2.1. Domaine 1 : Portail Public & Libre Accès Client (`pkg_client`)
1. **`UC_Annuaire` — Consulter l'annuaire et les fiches entreprises :** Permet à l'usager de rechercher une société partenaire, de vérifier ses heures d'ouverture et d'accéder à son guichet de réclamation.
2. **`UC_Soumettre` — Soumettre une demande SAV en ligne sans compte :** Dépôt d'un dossier structuré (description de la panne, pièces jointes, établissement d'achat) générant un ticket SAV horodaté.
3. **`UC_Tchat` — Échanger par messagerie instantanée (Tchat direct) :** Session interactive directe en WebSocket/HTTP avec la plateforme pour une résolution instantanée.
4. **`UC_AssistanceIA` — Obtenir une assistance automatisée (RAG documentaire) :** Interrogation automatique de la base vectorielle d'entreprise dès qu'un message client est émis.
5. **`UC_TransfertHumain` — Solliciter un transfert vers un conseiller humain :** Déclenchement d'une passerelle d'escalade vers un opérateur lorsque le problème dépasse le périmètre de l'IA.
6. **`UC_Suivi` — Suivre l'état d'avancement de sa demande :** Consultation publique de la timeline d'instruction via le code de suivi ou jeton sécurisé.

### 2.2. Domaine 2 : Traitement Opérationnel SAV (`pkg_sav`)
7. **`UC_Dispo` — Gérer son statut de disponibilité :** Déclaration de la présence opérationnelle de l'agent (`ONLINE`, `BUSY`, etc.) influençant le routeur d'attribution dynamique.
8. **`UC_TraiterConv` — Traiter les conversations clients et demandes transférées :** Prise en main des canaux textuels, qualification du besoin et réponses directes au client.
9. **`UC_SuggestionsIA` — Exploiter les suggestions de réponses formulées par l'IA :** Affichage d'une recommandation de synthèse calculée en temps réel que l'agent peut valider, amender ou rejeter.
10. **`UC_NotesInternes` — Rédiger des notes internes d'équipe :** Ajout de mémos techniques ou administratifs invisibles au client sur la fiche du dossier.
11. **`UC_EleverTicket` — Élever une conversation en Ticket SAV officiel :** Formalisation d'une discussion informelle en incident tracé avec priorisation et engagement SLA.
12. **`UC_TraiterTicket` — Gérer le cycle de vie des tickets SAV (SLA) :** Prise en charge, investigation, changement d'étapes (en attente pièce, résolu) et clôture définitive.
13. **`UC_PartagerTicket` — Partager un ticket inter-agents (lecture/contribution) :** Sollicitation d'un collègue spécialiste via l'octroi d'une permission de collaboration ponctuelle.

### 2.3. Domaine 3 : Supervision & Coordination de l'Activité (`pkg_supervision`)
14. **`UC_SuperviserFiles` — Superviser les files d'attente et la charge de travail :** Surveillance en temps réel du flux des messages entrants, des temps d'attente et du respect des engagements SLA.
15. **`UC_Reassigner` — Réaffecter manuellement un ticket ou une conversation :** Intervention hiérarchique pour réattribuer un dossier bloqué ou délester un agent surchargé.
16. **`UC_GererCompetences` — Gérer et certifier les compétences des agents (Skills) :** Définition du catalogue de spécialités (ex. Électronique, Facturation, Multilingue) et affectation aux profils.
17. **`UC_GererEtablissements` — Administrer les succursales et ateliers SAV physiques :** Cartographie des points de collecte, ateliers régionaux et magasins de rattachement.
18. **`UC_ConsulterStats` — Consulter les tableaux de bord analytiques et métriques SLA :** Visualisation des indicateurs de performance clés (KPI) et rapports de productivité.

### 2.4. Domaine 4 : Administration de l'Organisation & Connaissances (`pkg_admin`)
19. **`UC_GererMembres` — Gérer les membres et attribuer les rôles RBAC :** Invitation des nouveaux collaborateurs par courriel et configuration de leur niveau d'habilitation.
20. **`UC_SuspendreMembre` — Suspendre ou réactiver l'accès d'un collaborateur :** Verrouillage conservatoire immédiat de l'accès applicatif d'un employé sans détruire l'historique de ses actions passées.
21. **`UC_ParametresWorkspace` — Configurer les paramètres et canaux de l'espace (WhatsApp) :** Personnalisation des logos, coordonnées d'entreprise, intégration d'instances WhatsApp Cloud API.
22. **`UC_GererKnowledge` — Administrer la base documentaire pour apprentissage IA (RAG) :** Téléversement des fiches techniques, manuels utilisateurs, guides SAV et déclenchement de la vectorisation.

### 2.5. Domaine 5 : Souveraineté & Gestion Commerciale (`pkg_owner`)
23. **`UC_GererAbonnement` — Gérer l'abonnement SaaS et paiements dématérialisés (SasPay) :** Souscription, surclassement de forfait (Starter, Pro, Enterprise) et validation des règlements via mobile money ou carte bancaire.
24. **`UC_SupprimerWorkspace` — Supprimer définitivement l'espace de travail :** Purge intégrale et irréversible de l'organisation et de ses bases de données associées.

---

## 3. Justification rigoureuse des relations UML

Conformément à la norme UML 2.5, les relations de dépendance stéréotypées doivent répondre à des sémantiques précises et univoques.

### 3.1. Justification de la relation `<<include>>`
Une relation `<<include>>` stipule une inclusion **obligatoire, systématique et inconditionnelle**. Le cas d'utilisation source ne peut s'exécuter complètement sans invoquer le comportement du cas cible.
- **`UC_Tchat ..> UC_AssistanceIA : <<include>>`**
  - *Justification technique :* Dans Zalisk, l'architecture d'ingestion conversationnelle soumet chaque message public émis par un client au pipeline de compréhension et de recherche contextuelle RAG. Même si la réponse apportée est brève ou requiert une action ultérieure, l'interrogation du corpus documentaire d'entreprise est exécutée à chaque requête textuelle.
  - *Orientation de la flèche :* De `UC_Tchat` (cas de base) vers `UC_AssistanceIA` (cas inclus), conformément à la convention UML : $Source \dashrightarrow Cible$.

### 3.2. Justification des relations `<<extend>>` et conditions de garde
Une relation `<<extend>>` modélise un comportement **optionnel, conditionnel ou exceptionnel**, qui vient enrichir le cas d'utilisation de base uniquement si un point d'extension particulier est atteint et si sa condition de garde est satisfaite.
- **Orientation de la flèche :** La flèche en pointillés pointe **du cas d'extension vers le cas d'utilisation de base** qu'il étend ($Extension \dashrightarrow Base$).

| Extension | Cas de base étendu | Point d'extension & Condition de garde | Justification dans le code Zalisk |
| :--- | :--- | :--- | :--- |
| **`UC_TransfertHumain`** | `UC_Tchat` | `[seuil d'escalade / litige]` | Déclenché lorsque le client en fait la demande explicite, lorsque le score de confiance RAG est $< 85\,\%$, ou en cas de détection d'irritation / réclamation financière majeure ($> 50\,000\text{ XAF}$). |
| **`UC_SuggestionsIA`** | `UC_TraiterConv` | `[source documentaire]` | Présenté au conseiller uniquement si le corpus de connaissances d'entreprise contient des fragments pertinents indexés en base vectorielle. |
| **`UC_NotesInternes`** | `UC_TraiterConv` | `[analyse d'équipe]` | Action facultative déclenchée par l'agent lorsqu'une consigne confidentielle doit être consignée sans être visible par le client. |
| **`UC_EleverTicket`** | `UC_TraiterConv` | `[incident formel requis]` | Déclenché uniquement si l'échange informel requiert une instruction technique longue ou l'intervention d'un atelier tiers. |
| **`UC_PartagerTicket`** | `UC_TraiterTicket` | `[besoin d'expertise]` | Utilisé ponctuellement lorsqu'un conseiller doit solliciter la relecture ou l'approbation d'un pair sans céder la responsabilité du ticket. |

---

## 4. Architecture de l'interaction IA-Humain et protocole d'escalade

La prise en charge hybride des usagers constitue le cœur d'innovation de la plateforme Zalisk. L'intelligence artificielle est intégrée nativement dans le flux de traitement sous forme d'un agent cognitif interne et non d'un acteur externe.

```
       [ Client ]
           │
           │ (1. Message public)
           ▼
    ┌─────────────┐
    │  UC_Tchat   │
    └──────┬──────┘
           │
           │ <<include>> (Systématique)
           ▼
  ┌──────────────────┐
  │ UC_AssistanceIA  │ ◄─── Ingestion RAG (Base de connaissances entreprise)
  └────────┬─────────┘
           │
           ├─── [Confiance >= 85% & Pas d'irritation] ───► Réponse directe au Client
           │
           └─── [Condition de garde satisfaite]
                │
                │ <<extend>>
                ▼
      ┌─────────────────────┐
      │ UC_TransfertHumain  │
      └─────────┬───────────┘
                │
                │ (2. Routage vers la file d'attente)
                ▼
        [ Conseiller SAV ]
                │
                │ (3. Prise en charge avec historique complet)
                ▼
      ┌─────────────────────┐
      │   UC_TraiterConv    │
      └─────────────────────┘
```

### 4.1. Conditions précises d'escalade vers un Conseiller Humain
Le transfert d'une conversation vers un agent humain intervient sans rupture d'expérience utilisateur selon trois critères formels vérifiables :
1. **Demande explicite du client :** L'usager saisit une consigne demandant un interlocuteur physique (« parler à un conseiller », « humain », « agent »).
2. **Insuffisance du score de confiance cognitif :** L'indice de similarité cosinus retourné par le moteur vectoriel est inférieur au seuil de certitude réglementaire ($< 0.85$). Pour éviter les hallucinations, le système s'abstient de répondre et initie l'escalade.
3. **Détection de sentiment critique ou litige financier :** Détection de marqueurs de forte insatisfaction ou mention d'un préjudice commercial supérieur à $50\,000\text{ XAF}$.

### 4.2. Préservation du contexte et assistance bilatérale
- **Continuité de session :** Le conseiller SAV réceptionne la conversation avec l'intégralité des échanges préalables horodatés et le résumé des recherches documentaires opérées par l'IA.
- **Assistance en back-office (`UC_SuggestionsIA`) :** Durant la conversation humaine, l'IA continue d'analyser les propos et propose des réponses types pré-rédigées directement intégrables par l'agent, garantissant une réduction drastique du temps de traitement (MTTR).

---

## 5. Synthèse des fonctionnalités écartées ou consolidées

Pour préserver l'abstraction requise par un mémoire universitaire de niveau Licence et éviter le piège du « diagramme-recette de cuisine » (émiettement en micro-actions CRUD), les opérations suivantes ont été rigoureusement consolidées :

1. **Actions élémentaires d'interface (UI CRUD) :**
   - Les boutons « Cliquer sur Nouveau Ticket », « Valider le formulaire », « Saisir un mot de passe », « Filtrer par date » ne constituent pas des cas d'utilisation autonomes. Ils sont subsumés sous leurs objectifs métier respectifs (`UC_TraiterTicket`, `UC_Soumettre`, `UC_ConsulterStats`).
2. **Mécanismes techniques d'infrastructure :**
   - La génération des jetons JWT, le rafraîchissement des cookies de session, la pagination des requêtes SQL Prisma et les workers Redis d'envoi d'e-mails en tâche de fond constituent des détails d'implémentation logicielle. Ils ne figurent pas sur le diagramme de cas d'utilisation fonctionnel.
3. **Module IA représenté en tant qu'acteur externe :**
   - En modélisation UML standard, une composante logicielle interne automatisée ne doit **jamais** être matérialisée sous la forme d'un acteur humain (stick man). Le moteur RAG de Zalisk est fidèlement représenté comme une capacité interne au système (`Système Zalisk`), invoquée par des cas d'utilisation métier.
