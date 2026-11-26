import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { COOKIE_NAME } from "../src/config/constants.js";
import { ROLES } from "../src/security/permissions.js";
import { createSession } from "../src/services/sessionService.js";
import { autoAssignTicket } from "../src/services/assignmentEngine.js";
import * as workspaceService from "../src/services/workspaceService.js";
import * as presenceService from "../src/services/presenceService.js";

describe("Évolution Équipe : Compétences, Présence Automatique, Disponibilité & Permissions", () => {
  const ts = Date.now();
  let wsA, wsB, wsNoSkills;
  let ownerA, managerA, agentA1, agentA2, ownerB;
  let tokOwnerA, tokManagerA, tokAgentA1, tokAgentA2, tokOwnerB;

  const authCookie = (token) => `${COOKIE_NAME}=${token}`;

  before(async () => {
    presenceService.clearInMemoryPresence();

    [ownerA, managerA, agentA1, agentA2, ownerB] = await Promise.all([
      prisma.user.create({
        data: { email: `sp-owner-a-${ts}@test.cg`, firstName: "Patron", lastName: "A", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `sp-manager-a-${ts}@test.cg`, firstName: "Superviseur", lastName: "A", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `sp-agent1-a-${ts}@test.cg`, firstName: "Moussa", lastName: "One", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `sp-agent2-a-${ts}@test.cg`, firstName: "Amina", lastName: "Two", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `sp-owner-b-${ts}@test.cg`, firstName: "Patron", lastName: "B", emailVerified: true },
      }),
    ]);

    [wsA, wsB, wsNoSkills] = await Promise.all([
      prisma.workspace.create({
        data: {
          name: `Entreprise A ${ts}`,
          slug: `sp-ws-a-${ts}`,
          memberships: {
            create: [
              { userId: ownerA.id, role: ROLES.OWNER },
              { userId: managerA.id, role: ROLES.MANAGER },
              { userId: agentA1.id, role: ROLES.AGENT },
              { userId: agentA2.id, role: ROLES.AGENT },
            ],
          },
        },
      }),
      prisma.workspace.create({
        data: {
          name: `Entreprise B ${ts}`,
          slug: `sp-ws-b-${ts}`,
          memberships: {
            create: [{ userId: ownerB.id, role: ROLES.OWNER }],
          },
        },
      }),
      prisma.workspace.create({
        data: {
          name: `Petite Entreprise Sans Compétences ${ts}`,
          slug: `sp-ws-noskills-${ts}`,
          memberships: {
            create: [
              { userId: ownerB.id, role: ROLES.OWNER },
              { userId: agentA2.id, role: ROLES.AGENT },
            ],
          },
        },
      }),
    ]);

    await prisma.agentProfile.createMany({
      data: [
        { workspaceId: wsA.id, userId: agentA1.id, availability: "AVAILABLE", maxCapacity: 10 },
        { workspaceId: wsA.id, userId: agentA2.id, availability: "AVAILABLE", maxCapacity: 10 },
        { workspaceId: wsNoSkills.id, userId: agentA2.id, availability: "AVAILABLE", maxCapacity: 10 },
      ],
    });

    const [s1, s2, s3, s4, s5] = await Promise.all([
      createSession(ownerA.id),
      createSession(managerA.id),
      createSession(agentA1.id),
      createSession(agentA2.id),
      createSession(ownerB.id),
    ]);
    tokOwnerA = s1.sessionToken;
    tokManagerA = s2.sessionToken;
    tokAgentA1 = s3.sessionToken;
    tokAgentA2 = s4.sessionToken;
    tokOwnerB = s5.sessionToken;
  });

  after(async () => {
    presenceService.clearInMemoryPresence();
    await prisma.workspace.deleteMany({
      where: { id: { in: [wsA?.id, wsB?.id, wsNoSkills?.id].filter(Boolean) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [ownerA?.id, managerA?.id, agentA1?.id, agentA2?.id, ownerB?.id].filter(Boolean) } },
    });
  });

  describe("1. Compétences propres à chaque entreprise & adaptation PME", () => {
    let skillCommandes, skillLivraison;

    it("1.1 Aucune compétence pré-remplie automatiquement (petite entreprise sans compétences)", async () => {
      const skills = await workspaceService.getWorkspaceSkills(wsNoSkills.id);
      assert.equal(skills.length, 0);

      const tk = await prisma.ticket.create({
        data: {
          workspaceId: wsNoSkills.id,
          reference: `TK-NS-${ts}`,
          title: "Question générale client",
          description: "Besoin d'aide",
          customerName: "Client PME",
          category: "Commandes",
          status: "PENDING_ASSIGNMENT",
        },
      });

      const res = await autoAssignTicket({
        ticketId: tk.id,
        workspaceId: wsNoSkills.id,
        category: "Commandes",
      });
      assert.equal(res.assigned, true);
      assert.equal(res.agentId, agentA2.id);
    });

    it("1.2 Création et modification de compétences dans Workspace A", async () => {
      const createRes = await request(app)
        .post(`/api/workspaces/${wsA.id}/skills`)
        .set("Cookie", authCookie(tokOwnerA))
        .send({ name: "Commandes", description: "Suivi des commandes clients" });

      assert.equal(createRes.status, 201);
      skillCommandes = createRes.body.skill;
      assert.equal(skillCommandes.name, "Commandes");
      assert.equal(skillCommandes.isActive, true);

      const createRes2 = await request(app)
        .post(`/api/workspaces/${wsA.id}/skills`)
        .set("Cookie", authCookie(tokManagerA))
        .send({ name: "Livraison", description: "Retards et colis" });
      assert.equal(createRes2.status, 201);
      skillLivraison = createRes2.body.skill;

      const patchRes = await request(app)
        .patch(`/api/workspaces/${wsA.id}/skills/${skillCommandes.id}`)
        .set("Cookie", authCookie(tokOwnerA))
        .send({ name: "Commandes & Paniers", description: "Suivi complet commandes" });

      assert.equal(patchRes.status, 200);
      assert.equal(patchRes.body.skill.name, "Commandes & Paniers");
      skillCommandes = patchRes.body.skill;
    });

    it("1.3 Associations multiples : plusieurs compétences sur un conseiller et une compétence sur plusieurs conseillers", async () => {
      const a1 = await request(app)
        .post(`/api/workspaces/${wsA.id}/agents/${agentA1.id}/skills`)
        .set("Cookie", authCookie(tokOwnerA))
        .send({ skillId: skillCommandes.id });
      assert.equal(a1.status, 200);

      const a2 = await request(app)
        .post(`/api/workspaces/${wsA.id}/agents/${agentA1.id}/skills`)
        .set("Cookie", authCookie(tokOwnerA))
        .send({ skillId: skillLivraison.id });
      assert.equal(a2.status, 200);

      const b1 = await request(app)
        .post(`/api/workspaces/${wsA.id}/agents/${agentA2.id}/skills`)
        .set("Cookie", authCookie(tokManagerA))
        .send({ skillId: skillCommandes.id });
      assert.equal(b1.status, 200);

      const listRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agents`)
        .set("Cookie", authCookie(tokOwnerA));
      assert.equal(listRes.status, 200);
      const m1 = listRes.body.agents.find((a) => a.id === agentA1.id);
      const m2 = listRes.body.agents.find((a) => a.id === agentA2.id);
      assert.equal(m1.skills.length, 2);
      assert.equal(m2.skills.length, 1);

      // Retrait d'une compétence
      const delRes = await request(app)
        .delete(`/api/workspaces/${wsA.id}/agents/${agentA2.id}/skills/${skillCommandes.id}`)
        .set("Cookie", authCookie(tokManagerA));
      assert.equal(delRes.status, 200);
    });

    it("1.4 Désactivation d'une compétence (masquée, non attribuable, ignorée au routage)", async () => {
      const deactRes = await request(app)
        .patch(`/api/workspaces/${wsA.id}/skills/${skillLivraison.id}`)
        .set("Cookie", authCookie(tokOwnerA))
        .send({ isActive: false });
      assert.equal(deactRes.status, 200);
      assert.equal(deactRes.body.skill.isActive, false);

      const activeList = await workspaceService.getWorkspaceSkills(wsA.id, { includeInactive: false });
      assert.equal(activeList.some((s) => s.id === skillLivraison.id), false);

      // Tentative d'attribution d'une compétence désactivée refusée (400)
      const assignDeact = await request(app)
        .post(`/api/workspaces/${wsA.id}/agents/${agentA2.id}/skills`)
        .set("Cookie", authCookie(tokOwnerA))
        .send({ skillId: skillLivraison.id });
      assert.equal(assignDeact.status, 400);
    });

    it("1.5 Isolation stricte entre entreprises (Workspace B bloqué sur compétences de A)", async () => {
      const listB = await workspaceService.getWorkspaceSkills(wsB.id);
      assert.equal(listB.some((s) => s.id === skillCommandes.id), false);

      // Cross-tenant patch rejected
      const crossPatch = await request(app)
        .patch(`/api/workspaces/${wsB.id}/skills/${skillCommandes.id}`)
        .set("Cookie", authCookie(tokOwnerB))
        .send({ name: "Piratage" });
      assert.equal(crossPatch.status, 404);

      // Cross-tenant assign rejected
      const crossAssign = await request(app)
        .post(`/api/workspaces/${wsB.id}/agents/${ownerB.id}/skills`)
        .set("Cookie", authCookie(tokOwnerB))
        .send({ skillId: skillCommandes.id });
      assert.equal(crossAssign.status, 404);
    });
  });

  describe("2. Présence Automatique, Multi-Onglets, Multi-Sessions & Déconnexion", () => {
    const cfg = { heartbeatIntervalSec: 30, ttlSec: 75, awayAfterSec: 300 };

    it("2.1 Conseiller EN LIGNE dès heartbeat actif", async () => {
      const t0 = 1_700_000_000_000;
      const p = await presenceService.recordHeartbeat({
        workspaceId: wsA.id,
        userId: agentA1.id,
        sessionToken: tokAgentA1,
        tabId: "tab-1",
        idleMs: 0,
        now: t0,
        config: cfg,
      });
      assert.equal(p.state, "ONLINE");
      assert.equal(p.activeSessions, 1);
    });

    it("2.2 Passage automatique en ABSENT après 5 min d'inactivité (heartbeat maintenu)", async () => {
      const t0 = 1_700_000_000_000;
      const tIdle = t0 + 305_000; // 5 min 05s
      await presenceService.recordHeartbeat({
        workspaceId: wsA.id,
        userId: agentA1.id,
        sessionToken: tokAgentA1,
        tabId: "tab-1",
        idleMs: 305_000,
        now: tIdle,
        config: cfg,
      });
      const p = await presenceService.getUserPresence({
        workspaceId: wsA.id,
        userId: agentA1.id,
        now: tIdle,
        config: cfg,
      });
      assert.equal(p.state, "AWAY");
    });

    it("2.3 Fermeture brutale / perte de connexion -> HORS LIGNE après expiration du heartbeat", async () => {
      await presenceService.clearUserPresence({ workspaceId: wsA.id, userId: agentA1.id });
      const t0 = 1_700_000_000_000;
      await presenceService.recordHeartbeat({
        workspaceId: wsA.id,
        userId: agentA1.id,
        sessionToken: tokAgentA1,
        tabId: "tab-crash",
        idleMs: 0,
        now: t0,
        config: cfg,
      });
      // Aucun heartbeat reçu pendant 80s (> 75s TTL)
      const pAfterDrop = await presenceService.getUserPresence({
        workspaceId: wsA.id,
        userId: agentA1.id,
        now: t0 + 80_000,
        config: cfg,
      });
      assert.equal(pAfterDrop.state, "OFFLINE");

      // Vérification réelle d'expiration Redis TTL (1s)
      await presenceService.recordHeartbeat({
        workspaceId: wsA.id,
        userId: agentA1.id,
        sessionToken: tokAgentA1,
        tabId: "tab-ttl-real",
        idleMs: 0,
        config: { ...cfg, ttlSec: 1 },
      });
      await new Promise((r) => setTimeout(r, 1200));
      const pRealExpired = await presenceService.getUserPresence({
        workspaceId: wsA.id,
        userId: agentA1.id,
        config: cfg,
      });
      assert.equal(pRealExpired.state, "OFFLINE");
    });

    it("2.4 Plusieurs onglets : activité sur un onglet maintient EN LIGNE et fermeture d'un onglet préserve l'autre", async () => {
      presenceService.clearInMemoryPresence();
      const t0 = 1_700_001_000_000;

      // Onglet 1 inactif depuis 6 minutes
      await presenceService.recordHeartbeat({
        workspaceId: wsA.id,
        userId: agentA2.id,
        sessionToken: tokAgentA2,
        tabId: "tab-idle",
        idleMs: 360_000,
        now: t0,
        config: cfg,
      });
      // Onglet 2 actif à l'instant
      const pBoth = await presenceService.recordHeartbeat({
        workspaceId: wsA.id,
        userId: agentA2.id,
        sessionToken: tokAgentA2,
        tabId: "tab-active",
        idleMs: 2_000,
        now: t0,
        config: cfg,
      });
      assert.equal(pBoth.state, "ONLINE");
      assert.equal(pBoth.activeSessions, 2);

      // Fermeture de l'onglet actif -> Onglet 1 (inactif) reste -> ABSENT
      await presenceService.leavePresence({
        workspaceId: wsA.id,
        userId: agentA2.id,
        sessionToken: tokAgentA2,
        tabId: "tab-active",
      });
      const pAfterCloseTab2 = await presenceService.getUserPresence({
        workspaceId: wsA.id,
        userId: agentA2.id,
        now: t0 + 10_000,
        config: cfg,
      });
      assert.equal(pAfterCloseTab2.state, "AWAY");

      // Fermeture du dernier onglet -> HORS LIGNE
      await presenceService.leavePresence({
        workspaceId: wsA.id,
        userId: agentA2.id,
        sessionToken: tokAgentA2,
        tabId: "tab-idle",
      });
      const pAllClosed = await presenceService.getUserPresence({
        workspaceId: wsA.id,
        userId: agentA2.id,
        now: t0 + 10_000,
        config: cfg,
      });
      assert.equal(pAllClosed.state, "OFFLINE");
    });

    it("2.5 Plusieurs sessions simultanées + déconnexion normale d'une seule session", async () => {
      presenceService.clearInMemoryPresence();
      const phoneSess = await createSession(agentA1.id);
      const pcSess = await createSession(agentA1.id);

      // Heartbeats HTTP des 2 appareils
      await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/presence/heartbeat`)
        .set("Cookie", authCookie(pcSess.sessionToken))
        .send({ tabId: "pc-tab", idleMs: 0 });
      await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/presence/heartbeat`)
        .set("Cookie", authCookie(phoneSess.sessionToken))
        .send({ tabId: "phone-tab", idleMs: 0 });

      // Déconnexion normale du PC uniquement
      const logoutPc = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", authCookie(pcSess.sessionToken));
      assert.equal(logoutPc.status, 200);

      // Téléphone toujours connecté -> reste ONLINE
      const statusPhone = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/presence`)
        .set("Cookie", authCookie(phoneSess.sessionToken));
      assert.equal(statusPhone.status, 200);
      assert.equal(statusPhone.body.presence.state, "ONLINE");

      // Déconnexion du téléphone -> passe OFFLINE
      await request(app)
        .post("/api/auth/logout")
        .set("Cookie", authCookie(phoneSess.sessionToken));
      const pFinal = await presenceService.getUserPresence({
        workspaceId: wsA.id,
        userId: agentA1.id,
      });
      assert.equal(pFinal.state, "OFFLINE");
    });

    it("2.6 Découplage strict : Conseiller EN LIGNE mais INDISPONIBLE (DND), et HORS LIGNE avec disponibilité DISPONIBLE", async () => {
      await presenceService.clearUserPresence({ workspaceId: wsA.id, userId: agentA1.id });

      // 1) Conseiller actif EN LIGNE déclare DND ("Ne pas déranger")
      await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/presence/heartbeat`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ tabId: "tab-dnd", idleMs: 0 });

      const updDnd = await request(app)
        .patch(`/api/workspaces/${wsA.id}/agent/profile`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ availability: "DND" });
      assert.equal(updDnd.status, 200);
      assert.equal(updDnd.body.profile.availability, "DND");
      assert.equal(updDnd.body.profile.presence, "ONLINE");

      // 2) Conseiller se déclare DISPONIBLE puis quitte / expire -> HORS LIGNE mais disponibilité reste DISPONIBLE
      await request(app)
        .patch(`/api/workspaces/${wsA.id}/agent/profile`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ availability: "AVAILABLE" });

      await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/presence/leave`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ tabId: "tab-dnd" });

      const profAfterLeave = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/profile`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(profAfterLeave.status, 200);
      assert.equal(profAfterLeave.body.profile.presence, "OFFLINE");
      assert.equal(profAfterLeave.body.profile.availability, "AVAILABLE");
    });
  });

  describe("3. Permissions strictes & Sécurité multi-tenant", () => {
    it("3.1 Un agent ne peut pas modifier la présence (ni la sienne, ni celle d'un autre)", async () => {
      const res1 = await request(app)
        .patch(`/api/workspaces/${wsA.id}/agent/profile`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ presence: "ONLINE" });
      assert.equal(res1.status, 403);

      const res2 = await request(app)
        .patch(`/api/workspaces/${wsA.id}/agents/${agentA2.id}/status`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ presence: "ONLINE" });
      assert.equal(res2.status, 403);
    });

    it("3.2 Un responsable ne peut PAS forcer la présence ni la disponibilité d'un autre conseiller", async () => {
      const resPresence = await request(app)
        .patch(`/api/workspaces/${wsA.id}/agents/${agentA1.id}/status`)
        .set("Cookie", authCookie(tokOwnerA))
        .send({ presence: "OFFLINE" });
      assert.equal(resPresence.status, 403);

      const resAvail = await request(app)
        .patch(`/api/workspaces/${wsA.id}/agents/${agentA1.id}/status`)
        .set("Cookie", authCookie(tokManagerA))
        .send({ availability: "BUSY" });
      assert.equal(resAvail.status, 403);
    });

    it("3.3 Un agent peut modifier uniquement sa propre disponibilité (AVAILABLE / BUSY / DND)", async () => {
      const okBusy = await request(app)
        .patch(`/api/workspaces/${wsA.id}/agent/profile`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ availability: "BUSY" });
      assert.equal(okBusy.status, 200);
      assert.equal(okBusy.body.profile.availability, "BUSY");

      const invalidOffline = await request(app)
        .patch(`/api/workspaces/${wsA.id}/agent/profile`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ availability: "OFFLINE" });
      assert.equal(invalidOffline.status, 400);
    });

    it("3.4 Un agent ne peut pas créer/modifier/attribuer des compétences (réservé OWNER/ADMIN/MANAGER)", async () => {
      const createSkill = await request(app)
        .post(`/api/workspaces/${wsA.id}/skills`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ name: "Compétence Interdite" });
      assert.equal(createSkill.status, 403);

      const assignSelf = await request(app)
        .post(`/api/workspaces/${wsA.id}/agents/${agentA1.id}/skills`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ skillId: "fake" });
      assert.equal(assignSelf.status, 403);
    });

    it("3.5 Un membre de l'entreprise B ne peut pas consulter la présence de l'entreprise A", async () => {
      const crossRead = await request(app)
        .get(`/api/workspaces/${wsA.id}/agents`)
        .set("Cookie", authCookie(tokOwnerB));
      assert.equal(crossRead.status, 403);

      const crossHeartbeat = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/presence/heartbeat`)
        .set("Cookie", authCookie(tokOwnerB))
        .send({ tabId: "evil", idleMs: 0 });
      assert.equal(crossHeartbeat.status, 403);
    });
  });
});
