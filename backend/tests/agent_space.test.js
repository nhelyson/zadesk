import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { autoAssignTicket } from "../src/services/assignmentEngine.js";
import * as agentService from "../src/services/agentService.js";
import { createWorkspaceInvitation, acceptWorkspaceInvitation } from "../src/services/workspaceService.js";
import { ROLES } from "../src/security/permissions.js";

describe("Espace Agent & SAV Engine Multi-Tenant Tests", () => {
  let wsA, wsB;
  let ownerA, agentA1, agentA2, agentB;
  let skillPayment, skillHardware;

  before(async () => {
    // 1. Create two isolated workspaces
    wsA = await prisma.workspace.create({
      data: {
        name: "Entreprise Test A",
        slug: `ws-test-a-${Date.now()}`,
      },
    });

    wsB = await prisma.workspace.create({
      data: {
        name: "Entreprise Test B",
        slug: `ws-test-b-${Date.now()}`,
      },
    });

    // 2. Create users
    ownerA = await prisma.user.create({
      data: {
        email: `owner-a-${Date.now()}@test.cg`,
        firstName: "Patron",
        lastName: "Alpha",
      },
    });

    agentA1 = await prisma.user.create({
      data: {
        email: `agent-a1-${Date.now()}@test.cg`,
        firstName: "Moussa",
        lastName: "Diallo",
      },
    });

    agentA2 = await prisma.user.create({
      data: {
        email: `agent-a2-${Date.now()}@test.cg`,
        firstName: "Sarah",
        lastName: "Koné",
      },
    });

    agentB = await prisma.user.create({
      data: {
        email: `agent-b-${Date.now()}@test.cg`,
        firstName: "Jean",
        lastName: "Brazza",
      },
    });

    // 3. Link memberships
    await prisma.membership.createMany({
      data: [
        { userId: ownerA.id, workspaceId: wsA.id, role: ROLES.OWNER },
        { userId: agentA1.id, workspaceId: wsA.id, role: ROLES.AGENT },
        { userId: agentA2.id, workspaceId: wsA.id, role: ROLES.AGENT },
        { userId: agentB.id, workspaceId: wsB.id, role: ROLES.AGENT },
      ],
    });

    // 4. Create skills for Workspace A
    skillPayment = await prisma.skill.create({
      data: {
        workspaceId: wsA.id,
        name: "Paiement Mobile",
      },
    });

    skillHardware = await prisma.skill.create({
      data: {
        workspaceId: wsA.id,
        name: "Matériel Défectueux",
      },
    });

    // 5. Setup Agent Profiles with availability & skills
    const profA1 = await prisma.agentProfile.create({
      data: {
        workspaceId: wsA.id,
        userId: agentA1.id,
        availability: "AVAILABLE",
        maxCapacity: 5,
        autoAssignmentEnabled: true,
      },
    });

    const profA2 = await prisma.agentProfile.create({
      data: {
        workspaceId: wsA.id,
        userId: agentA2.id,
        availability: "AVAILABLE",
        maxCapacity: 5,
        autoAssignmentEnabled: true,
      },
    });

    // Validate payment skill for agent A1
    await prisma.agentSkill.create({
      data: {
        agentProfileId: profA1.id,
        skillId: skillPayment.id,
        validatedById: ownerA.id,
        validatedAt: new Date(),
      },
    });
  });

  after(async () => {
    // Cleanup created test records
    await prisma.workspace.deleteMany({
      where: { id: { in: [wsA.id, wsB.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [ownerA.id, agentA1.id, agentA2.id, agentB.id] } },
    });
  });

  describe("1. Permissions & Multi-Tenant Access Control", () => {
    let ticketPrivateA1;

    before(async () => {
      ticketPrivateA1 = await prisma.ticket.create({
        data: {
          workspaceId: wsA.id,
          reference: "TK-TEST-001",
          assignedAgentId: agentA1.id,
          createdById: ownerA.id,
          title: "Dossier privé de Moussa",
          description: "Traitement interne confidentiel",
          customerName: "Client Alpha",
          status: "OPEN",
        },
      });
    });

    it("1.1 L'agent assigné peut consulter son ticket", async () => {
      const res = await agentService.getTicketDetails(wsA.id, ticketPrivateA1.id, agentA1.id, ROLES.AGENT);
      assert.equal(res.ticket.id, ticketPrivateA1.id);
      assert.equal(res.permissions.canUpdate, true);
    });

    it("1.2 Un collègue sans partage se voit refuser l'accès (403)", async () => {
      await assert.rejects(
        async () => {
          await agentService.getTicketDetails(wsA.id, ticketPrivateA1.id, agentA2.id, ROLES.AGENT);
        },
        (err) => err.status === 403
      );
    });

    it("1.3 Après partage en READ_ONLY, le collègue peut consulter mais NE PEUT PAS modifier", async () => {
      // Share ticket with agentA2 in READ_ONLY mode
      await agentService.shareTicket(wsA.id, ticketPrivateA1.id, agentA1.id, ROLES.AGENT, {
        targetAgentId: agentA2.id,
        accessLevel: "READ_ONLY",
      });

      // Agent A2 can now view
      const viewRes = await agentService.getTicketDetails(wsA.id, ticketPrivateA1.id, agentA2.id, ROLES.AGENT);
      assert.equal(viewRes.ticket.id, ticketPrivateA1.id);
      assert.equal(viewRes.permissions.canUpdate, false);
      assert.equal(viewRes.permissions.accessLevel, "READ_ONLY");

      // Attempting to update must throw 403
      await assert.rejects(
        async () => {
          await agentService.updateTicket(wsA.id, ticketPrivateA1.id, agentA2.id, ROLES.AGENT, {
            status: "IN_PROGRESS",
          });
        },
        (err) => err.status === 403
      );
    });

    it("1.4 Un utilisateur d'une autre entreprise (Workspace B) est strictement bloqué", async () => {
      await assert.rejects(
        async () => {
          await agentService.getTicketDetails(wsA.id, ticketPrivateA1.id, agentB.id, ROLES.AGENT);
        },
        (err) => err.status === 403
      );
    });
  });

  describe("2. Moteur d'attribution déterministe (Skills, Disponibilité, Charge)", () => {
    it("2.1 Attribue le ticket au spécialiste qualifié (Paiement Mobile -> Moussa)", async () => {
      const ticket = await prisma.ticket.create({
        data: {
          workspaceId: wsA.id,
          reference: "TK-SKILL-01",
          title: "Problème débit Mobile Money",
          description: "Transaction en attente",
          customerName: "Client MoMo",
          category: "Paiement Mobile",
          priority: "HIGH",
          status: "PENDING_ASSIGNMENT",
        },
      });

      const result = await autoAssignTicket({
        ticketId: ticket.id,
        workspaceId: wsA.id,
        category: "Paiement Mobile",
        priority: "HIGH",
      });

      assert.equal(result.assigned, true);
      assert.equal(result.agentId, agentA1.id);

      const updated = await prisma.ticket.findUnique({ where: { id: ticket.id } });
      assert.equal(updated.assignedAgentId, agentA1.id);
      assert.equal(updated.status, "OPEN");
    });

    it("2.2 À compétences égales, privilégie l'agent le moins chargé", async () => {
      // Validate payment skill for agent A2 as well so both are eligible
      const profA2 = await prisma.agentProfile.findUnique({
        where: { workspaceId_userId: { workspaceId: wsA.id, userId: agentA2.id } },
      });
      await prisma.agentSkill.create({
        data: {
          agentProfileId: profA2.id,
          skillId: skillPayment.id,
          validatedById: ownerA.id,
          validatedAt: new Date(),
        },
      });

      // Agent A1 already has tickets, agent A2 has 0 tickets -> Agent A2 must be picked
      const ticket2 = await prisma.ticket.create({
        data: {
          workspaceId: wsA.id,
          reference: "TK-LOAD-01",
          title: "Nouvelle réclamation MoMo",
          description: "Test de charge",
          customerName: "Client MoMo 2",
          category: "Paiement Mobile",
          priority: "MEDIUM",
          status: "PENDING_ASSIGNMENT",
        },
      });

      const result = await autoAssignTicket({
        ticketId: ticket2.id,
        workspaceId: wsA.id,
        category: "Paiement Mobile",
        priority: "MEDIUM",
      });

      assert.equal(result.assigned, true);
      assert.equal(result.agentId, agentA2.id); // Agent A2 selected because lowest load
    });

    it("2.3 Si aucun agent n'est disponible, le ticket reste en attente d'attribution", async () => {
      // Set both agents to AWAY / BUSY
      await prisma.agentProfile.updateMany({
        where: { workspaceId: wsA.id },
        data: { availability: "AWAY" },
      });

      const ticketPending = await prisma.ticket.create({
        data: {
          workspaceId: wsA.id,
          reference: "TK-PENDING-01",
          title: "Demande de nuit",
          description: "Aucun agent en ligne",
          customerName: "Client Nocturne",
          status: "PENDING_ASSIGNMENT",
        },
      });

      const result = await autoAssignTicket({
        ticketId: ticketPending.id,
        workspaceId: wsA.id,
      });

      assert.equal(result.assigned, false);
      assert.equal(result.reason, "NO_AVAILABLE_AGENTS");

      const check = await prisma.ticket.findUnique({ where: { id: ticketPending.id } });
      assert.equal(check.status, "PENDING_ASSIGNMENT");
      assert.equal(check.assignedAgentId, null);

      // Restore agent A1 availability
      await prisma.agentProfile.updateMany({
        where: { workspaceId: wsA.id },
        data: { availability: "AVAILABLE" },
      });
    });

    it("2.4 Réaffectation supervisée : conserve l'historique complet", async () => {
      const ticketToMove = await prisma.ticket.create({
        data: {
          workspaceId: wsA.id,
          reference: "TK-REASSIGN-01",
          assignedAgentId: agentA1.id,
          title: "Transfert de dossier",
          description: "Changement de responsable",
          customerName: "Client Transfert",
          status: "OPEN",
        },
      });

      // Supervisor (Owner) reassigns ticket to Agent A2
      await agentService.reassignTicket(wsA.id, ticketToMove.id, ownerA.id, ROLES.OWNER, {
        newAgentId: agentA2.id,
        reason: "Réorganisation des charges",
      });

      const updated = await prisma.ticket.findUnique({
        where: { id: ticketToMove.id },
        include: { assignments: true },
      });

      assert.equal(updated.assignedAgentId, agentA2.id);
      assert.equal(updated.assignments.length, 1);
      assert.equal(updated.assignments[0].previousAgentId, agentA1.id);
      assert.equal(updated.assignments[0].newAgentId, agentA2.id);
    });
  });

  describe("3. Conversations & Isolation des Notes Internes", () => {
    let conv;

    before(async () => {
      conv = await prisma.conversation.create({
        data: {
          workspaceId: wsA.id,
          assignedAgentId: agentA1.id,
          customerName: "Fatou Bamba",
          channel: "PORTAL",
          status: "ACTIVE",
        },
      });
    });

    it("3.1 L'agent assigné peut enregistrer des messages et des notes internes", async () => {
      // Add internal note
      const note = await agentService.sendConversationMessage(wsA.id, conv.id, agentA1.id, {
        content: "Note confidentielle : vérifier compte bancaire avant remboursement.",
        isInternalNote: true,
      });

      assert.equal(note.isInternalNote, true);
      assert.equal(note.senderType, "INTERNAL_NOTE");

      // Add regular reply
      const reply = await agentService.sendConversationMessage(wsA.id, conv.id, agentA1.id, {
        content: "Bonjour Mme Bamba, votre demande est bien prise en compte.",
        isInternalNote: false,
      });

      assert.equal(reply.isInternalNote, false);
      assert.equal(reply.senderType, "AGENT_REPLY");
    });

    it("3.2 L'agent non autorisé ne peut pas lire la conversation d'un autre agent", async () => {
      await assert.rejects(
        async () => {
          await agentService.getConversationDetails(wsA.id, conv.id, agentA2.id, ROLES.AGENT);
        },
        (err) => err.status === 403
      );
    });
  });

  describe("4. Invitations d'Agents & Résistance aux Élévations de Privilèges", () => {
    it("4.1 Création d'une invitation agent valide avec jeton cryptographique", async () => {
      const invite = await createWorkspaceInvitation(wsA.id, ownerA.id, {
        email: "futur.agent@zadesk.cg",
        role: ROLES.AGENT,
      });

      assert.ok(invite.token);
      assert.equal(invite.role, ROLES.AGENT);
      assert.equal(invite.workspaceId, wsA.id);
    });

    it("4.2 Une invitation expirée est rejetée", async () => {
      const expiredInvite = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          invitedById: ownerA.id,
          email: "expired@test.cg",
          role: ROLES.AGENT,
          token: "expired-token-12345",
          expiresAt: new Date(Date.now() - 1000), // in the past
        },
      });

      await assert.rejects(
        async () => {
          await acceptWorkspaceInvitation(expiredInvite.token, agentB.id);
        },
        /expiré/
      );
    });
  });
});
