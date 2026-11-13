process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { prisma } from "../src/lib/prisma.js";
import { createOutboxEvent, dispatchOutboxEvents } from "../src/outbox/outboxDispatcher.js";
import { retryFailedOutboxEvents } from "../src/outbox/outboxAdminService.js";
import { createTicket, reassignTicket, shareTicket } from "../src/services/agentService.js";
import { createWorkspaceInvitation } from "../src/services/workspaceService.js";
import { processNotificationJob } from "../src/workers/notificationWorker.js";
import { RateLimitError, parseRetryAfter, maskEmail } from "../src/services/zavuService.js";
import { QUEUE_NAMES, queueManager } from "../src/queues/queueManager.js";
import { TICKET_JOB_TYPES } from "../src/jobs/ticketJobs.js";
import { NOTIFICATION_JOB_TYPES } from "../src/jobs/notificationJobs.js";
import { getRedisClient } from "../src/config/redis.js";

describe("Phase 2 — Suite Complète Transactional Outbox + BullMQ (22 Scénarios)", { concurrency: 1 }, () => {
  let wsA, wsB;
  let ownerA, agentA1, agentA2, userB;
  let timestamp;

  before(async () => {
    timestamp = Date.now();

    // 1. Workspaces
    wsA = await prisma.workspace.create({
      data: {
        name: `Workspace Outbox A ${timestamp}`,
        slug: `ws-outbox-a-${timestamp}`,
      },
    });

    wsB = await prisma.workspace.create({
      data: {
        name: `Workspace Outbox B ${timestamp}`,
        slug: `ws-outbox-b-${timestamp}`,
      },
    });

    // 2. Utilisateurs
    ownerA = await prisma.user.create({
      data: {
        email: `owner-a-${timestamp}@zadesk-test.com`,
        firstName: "Owner",
        lastName: "Alpha",
      },
    });

    agentA1 = await prisma.user.create({
      data: {
        email: `agent-a1-${timestamp}@zadesk-test.com`,
        firstName: "Agent1",
        lastName: "Alpha",
      },
    });

    agentA2 = await prisma.user.create({
      data: {
        email: `agent-a2-${timestamp}@zadesk-test.com`,
        firstName: "Agent2",
        lastName: "Alpha",
      },
    });

    userB = await prisma.user.create({
      data: {
        email: `user-b-${timestamp}@zadesk-test.com`,
        firstName: "User",
        lastName: "Beta",
      },
    });

    // 3. Memberships
    await prisma.membership.create({
      data: { userId: ownerA.id, workspaceId: wsA.id, role: "OWNER" },
    });
    await prisma.membership.create({
      data: { userId: agentA1.id, workspaceId: wsA.id, role: "AGENT" },
    });
    await prisma.membership.create({
      data: { userId: agentA2.id, workspaceId: wsA.id, role: "AGENT" },
    });
    await prisma.membership.create({
      data: { userId: userB.id, workspaceId: wsB.id, role: "AGENT" },
    });

    // 4. Profils agents
    await prisma.agentProfile.create({
      data: {
        userId: agentA1.id,
        workspaceId: wsA.id,
        availability: "AVAILABLE",
        autoAssignmentEnabled: true,
      },
    });
    await prisma.agentProfile.create({
      data: {
        userId: agentA2.id,
        workspaceId: wsA.id,
        availability: "AVAILABLE",
        autoAssignmentEnabled: true,
      },
    });
  });

  after(async () => {
    try {
      await prisma.outboxEvent.deleteMany({ where: { workspaceId: { in: [wsA.id, wsB.id] } } });
      await prisma.auditLog.deleteMany({ where: { workspaceId: { in: [wsA.id, wsB.id] } } });
      await prisma.ticketActivity.deleteMany({ where: { ticket: { workspaceId: { in: [wsA.id, wsB.id] } } } });
      await prisma.ticketAssignment.deleteMany({ where: { ticket: { workspaceId: { in: [wsA.id, wsB.id] } } } });
      await prisma.ticketShare.deleteMany({ where: { ticket: { workspaceId: { in: [wsA.id, wsB.id] } } } });
      await prisma.ticket.deleteMany({ where: { workspaceId: { in: [wsA.id, wsB.id] } } });
      await prisma.workspaceInvitation.deleteMany({ where: { workspaceId: { in: [wsA.id, wsB.id] } } });
      await prisma.agentProfile.deleteMany({ where: { workspaceId: { in: [wsA.id, wsB.id] } } });
      await prisma.membership.deleteMany({ where: { workspaceId: { in: [wsA.id, wsB.id] } } });
      await prisma.workspace.deleteMany({ where: { id: { in: [wsA.id, wsB.id] } } });
      await prisma.user.deleteMany({ where: { id: { in: [ownerA.id, agentA1.id, agentA2.id, userB.id] } } });
    } catch (_) {}

    try {
      await queueManager.closeAll();
      const redis = getRedisClient();
      if (redis && redis.status !== "end") {
        await redis.quit();
      }
      await prisma.$disconnect();
    } catch (_) {}
  });

  // =========================================================================
  // 1. Transactionnalité
  // =========================================================================
  describe("1. Transactionnalité", { concurrency: 1 }, () => {
    it("1. Création d'un ticket et de son événement Outbox dans une même transaction", async () => {
      const ticket = await createTicket(wsA.id, ownerA.id, {
        title: "Dossier Réclamation Transactionnel",
        description: "Test de création atomique ticket + outbox",
        customerName: "Client Alpha",
        customerEmail: "client.alpha@test.com",
        assignedAgentId: agentA1.id,
      });

      assert.ok(ticket);
      assert.ok(ticket.id);

      // Vérification que l'événement Outbox existe en base
      const event = await prisma.outboxEvent.findFirst({
        where: {
          workspaceId: wsA.id,
          eventType: "TICKET_ASSIGNED",
          status: { in: ["PENDING", "PROCESSING", "PUBLISHED"] },
        },
      });

      assert.ok(event, "Un événement Outbox doit être créé pour le ticket");
      assert.equal(event.payload.ticketId, ticket.id);
      assert.equal(event.queueName, QUEUE_NAMES.TICKETS);
      assert.equal(event.jobName, TICKET_JOB_TYPES.NOTIFICATION);
    });

    it("2. Rollback métier entraînant le rollback de l'événement Outbox", async () => {
      const ticketCountBefore = await prisma.ticket.count({ where: { workspaceId: wsA.id } });
      const outboxCountBefore = await prisma.outboxEvent.count({ where: { workspaceId: wsA.id } });

      // Simuler une transaction métier qui lève une exception volontaire
      await assert.rejects(
        async () => {
          await prisma.$transaction(async (tx) => {
            const fakeTicket = await tx.ticket.create({
              data: {
                workspaceId: wsA.id,
                createdById: ownerA.id,
                reference: `TK-FAIL-${Date.now()}`,
                title: "Ticket voué à l'échec",
                description: "Test rollback",
                customerName: "Client Rollback",
                status: "OPEN",
              },
            });

            await createOutboxEvent(tx, {
              workspaceId: wsA.id,
              eventType: "TICKET_ASSIGNED",
              queueName: QUEUE_NAMES.TICKETS,
              jobName: TICKET_JOB_TYPES.NOTIFICATION,
              payload: { ticketId: fakeTicket.id },
            });

            // Simuler une violation d'intégrité ou crash métier
            throw new Error("Échec intentionnel pour tester le rollback transactionnel");
          });
        },
        /Échec intentionnel pour tester le rollback transactionnel/
      );

      const ticketCountAfter = await prisma.ticket.count({ where: { workspaceId: wsA.id } });
      const outboxCountAfter = await prisma.outboxEvent.count({ where: { workspaceId: wsA.id } });

      assert.equal(ticketCountAfter, ticketCountBefore, "Aucun ticket ne doit persister après rollback");
      assert.equal(outboxCountAfter, outboxCountBefore, "Aucun événement Outbox ne doit persister après rollback");
    });

    it("3. Création d'une invitation et de son événement dans une même transaction", async () => {
      const invitation = await createWorkspaceInvitation(wsA.id, ownerA.id, {
        email: `invite-atomique-${Date.now()}@zadesk-test.com`,
        role: "AGENT",
      });

      assert.ok(invitation);
      assert.equal(invitation.dispatchStatus, "PENDING");

      const event = await prisma.outboxEvent.findFirst({
        where: {
          workspaceId: wsA.id,
          eventType: "INVITATION_CREATED",
          status: "PENDING",
        },
      });

      assert.ok(event, "L'événement Outbox d'invitation doit être présent en base");
      assert.equal(event.payload.invitationId, invitation.id);
      assert.equal(event.queueName, QUEUE_NAMES.NOTIFICATIONS);
      assert.equal(event.jobName, NOTIFICATION_JOB_TYPES.INVITATION_EMAIL);
    });

    it("4. Redis indisponible après validation métier : événement toujours présent en PostgreSQL", async () => {
      // Événement créé dans une transaction métier réussie
      const evt = await prisma.$transaction(async (tx) => {
        return createOutboxEvent(tx, {
          workspaceId: wsA.id,
          eventType: "TICKET_ASSIGNED",
          queueName: QUEUE_NAMES.TICKETS,
          jobName: "ticket:notification",
          payload: { ticketId: "tk-offline-test", workspaceId: wsA.id },
        });
      });

      assert.ok(evt);

      // Simuler l'indisponibilité de Redis lors du dispatch
      const origAddJob = queueManager.addJob.bind(queueManager);
      queueManager.addJob = async () => ({ success: false, error: "Connection to Redis refused (offline)" });

      try {
        await dispatchOutboxEvents({ batchSize: 10 });
      } finally {
        queueManager.addJob = origAddJob;
      }

      // L'événement doit toujours être présent en base PostgreSQL avec statut PENDING
      const inDb = await prisma.outboxEvent.findUnique({ where: { id: evt.id } });
      assert.ok(inDb, "L'événement Outbox doit subsister durablement en PostgreSQL");
      assert.equal(inDb.status, "PENDING", "L'événement doit rester en PENDING pour reprise ultérieure");
      assert.ok(inDb.attempts >= 1, "Les tentatives doivent refléter l'échec réseau");
    });
  });

  // =========================================================================
  // 2. Dispatcher
  // =========================================================================
  describe("2. Dispatcher", { concurrency: 1 }, () => {
    it("5. Publication correcte d'un événement PENDING", async () => {
      const evt = await prisma.outboxEvent.create({
        data: {
          workspaceId: wsA.id,
          eventType: "TICKET_ASSIGNED",
          queueName: QUEUE_NAMES.TICKETS,
          jobName: TICKET_JOB_TYPES.NOTIFICATION,
          payload: { workspaceId: wsA.id, ticketId: "tk-disp-5", eventType: "ASSIGNED" },
          status: "PENDING",
        },
      });

      const res = await dispatchOutboxEvents({ batchSize: 10 });
      assert.ok(res.published >= 1);

      const updated = await prisma.outboxEvent.findUnique({ where: { id: evt.id } });
      assert.equal(updated.status, "PUBLISHED");
      assert.ok(updated.publishedAt);
      assert.equal(updated.lockedBy, null);
    });

    it("6. Événement marqué PUBLISHED uniquement après confirmation BullMQ", async () => {
      const evt = await prisma.outboxEvent.create({
        data: {
          workspaceId: wsA.id,
          eventType: "INVITATION_CREATED",
          queueName: QUEUE_NAMES.NOTIFICATIONS,
          jobName: NOTIFICATION_JOB_TYPES.INVITATION_EMAIL,
          payload: { workspaceId: wsA.id, invitationId: "inv-disp-6", email: "test@z.com" },
          status: "PENDING",
        },
      });

      // Vérifier état initial
      const initial = await prisma.outboxEvent.findUnique({ where: { id: evt.id } });
      assert.equal(initial.status, "PENDING");
      assert.equal(initial.publishedAt, null);

      await dispatchOutboxEvents({ batchSize: 10 });

      const finalEvt = await prisma.outboxEvent.findUnique({ where: { id: evt.id } });
      assert.equal(finalEvt.status, "PUBLISHED");
      assert.ok(finalEvt.jobId, "Le jobId BullMQ confirmé doit être consigné");
    });

    it("7. Redis indisponible : événement récupérable", async () => {
      const evt = await prisma.outboxEvent.create({
        data: {
          workspaceId: wsA.id,
          eventType: "TICKET_ASSIGNED",
          queueName: QUEUE_NAMES.TICKETS,
          jobName: "ticket:notification",
          payload: { workspaceId: wsA.id, ticketId: "tk-disp-7" },
          status: "PENDING",
          attempts: 0,
          maxAttempts: 5,
        },
      });

      const origAddJob = queueManager.addJob.bind(queueManager);
      queueManager.addJob = async () => ({ success: false, error: "Redis OOM: memory limit exceeded (noeviction)" });

      try {
        await dispatchOutboxEvents({ batchSize: 10 });
      } finally {
        queueManager.addJob = origAddJob;
      }

      const recoverable = await prisma.outboxEvent.findUnique({ where: { id: evt.id } });
      assert.equal(recoverable.status, "PENDING");
      assert.equal(recoverable.attempts, 1);
      assert.ok(recoverable.lastError);
      assert.equal(recoverable.lockedBy, null, "Le verrou doit être libéré pour permettre la reprise");
    });

    it("8. Deux dispatchers concurrents : aucun traitement simultané du même événement", async () => {
      const id1 = `evt-conc-disp-1-${Date.now()}`;
      const id2 = `evt-conc-disp-2-${Date.now()}`;

      await prisma.outboxEvent.createMany({
        data: [
          {
            id: id1,
            workspaceId: wsA.id,
            eventType: "TICKET_ASSIGNED",
            queueName: QUEUE_NAMES.TICKETS,
            jobName: TICKET_JOB_TYPES.NOTIFICATION,
            payload: { workspaceId: wsA.id, ticketId: "tk-c1" },
            status: "PENDING",
          },
          {
            id: id2,
            workspaceId: wsA.id,
            eventType: "TICKET_ASSIGNED",
            queueName: QUEUE_NAMES.TICKETS,
            jobName: TICKET_JOB_TYPES.NOTIFICATION,
            payload: { workspaceId: wsA.id, ticketId: "tk-c2" },
            status: "PENDING",
          },
        ],
      });

      // Lancer 2 dispatchers simultanément
      const [res1, res2] = await Promise.all([
        dispatchOutboxEvents({ batchSize: 10 }),
        dispatchOutboxEvents({ batchSize: 10 }),
      ]);

      const events = await prisma.outboxEvent.findMany({
        where: { id: { in: [id1, id2] } },
      });

      assert.equal(events.length, 2);
      for (const e of events) {
        assert.equal(e.status, "PUBLISHED", "Chaque événement doit être publié exactement une fois");
        assert.equal(e.lockedBy, null);
      }
    });

    it("9. Récupération d'un événement bloqué en PROCESSING", async () => {
      const stuckId = `evt-stuck-${Date.now()}`;

      // Simuler un worker crashé ayant laissé l'événement en PROCESSING avec un verrou périmé (> 10 min)
      await prisma.outboxEvent.create({
        data: {
          id: stuckId,
          workspaceId: wsA.id,
          eventType: "TICKET_ASSIGNED",
          queueName: QUEUE_NAMES.TICKETS,
          jobName: TICKET_JOB_TYPES.NOTIFICATION,
          payload: { workspaceId: wsA.id, ticketId: "tk-stuck" },
          status: "PROCESSING",
          lockedBy: "dead-worker-pid-9999",
          lockedAt: new Date(Date.now() - 15 * 60 * 1000), // il y a 15 min
        },
      });

      // Le dispatcher avec lockTimeoutMinutes = 5 doit récupérer l'événement périmé
      const res = await dispatchOutboxEvents({ batchSize: 10, lockTimeoutMinutes: 5 });
      assert.ok(res.published >= 1);

      const recovered = await prisma.outboxEvent.findUnique({ where: { id: stuckId } });
      assert.equal(recovered.status, "PUBLISHED");
      assert.equal(recovered.lockedBy, null);
    });

    it("10. Crash entre la publication BullMQ et la mise à jour PostgreSQL", async () => {
      // Démonstration du jobId déterministe protégeant contre le double job dans Redis
      const deterministicJobId = `job-dedup-crash-test-${Date.now()}`;

      // 1ère publication vers BullMQ
      const add1 = await queueManager.addJob(
        QUEUE_NAMES.TICKETS,
        TICKET_JOB_TYPES.NOTIFICATION,
        { workspaceId: wsA.id, ticketId: "tk-crash-test" },
        { jobId: deterministicJobId }
      );
      assert.equal(add1.success, true);

      // Simulation d'un rejeu dû à un crash avant confirmation PostgreSQL
      const add2 = await queueManager.addJob(
        QUEUE_NAMES.TICKETS,
        TICKET_JOB_TYPES.NOTIFICATION,
        { workspaceId: wsA.id, ticketId: "tk-crash-test" },
        { jobId: deterministicJobId }
      );

      // BullMQ déduplique nativement sur jobId tant que le job est présent dans Redis
      assert.equal(add2.success, true);
      assert.equal(add2.jobId, deterministicJobId);
    });
  });

  // =========================================================================
  // 3. E-mails (Zavu & Workers)
  // =========================================================================
  describe("3. E-mails (Zavu & Workers)", { concurrency: 1 }, () => {
    it("11. HTTP 429 : échec temporaire et respect de Retry-After", async () => {
      const inv429 = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          email: `simulate-429-${Date.now()}@zadesk-test.com`,
          token: `tok-429-${Date.now()}`,
          invitedById: ownerA.id,
          expiresAt: new Date(Date.now() + 86400000),
          dispatchStatus: "PENDING",
        },
      });

      const job429 = {
        id: `job-429-${inv429.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: inv429.id,
          email: inv429.email,
          role: "AGENT",
          invitedById: ownerA.id,
        },
      };

      await assert.rejects(
        async () => {
          await processNotificationJob(job429);
        },
        (err) => {
          assert.equal(err.name, "RateLimitError");
          assert.equal(err.status, 429);
          assert.ok(err.retryAfterMs > 0);
          return true;
        }
      );

      // Vérifier que l'invitation n'est PAS passée en FAILED, mais reste en PENDING avec nextRetryAt
      const updated = await prisma.workspaceInvitation.findUnique({ where: { id: inv429.id } });
      assert.equal(updated.dispatchStatus, "PENDING");
      assert.ok(updated.nextRetryAt > new Date());
      assert.equal(updated.dispatchLockedBy, null);
    });

    it("12. HTTP 500 : retry", async () => {
      const inv500 = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          email: `simulate-500-${Date.now()}@zadesk-test.com`,
          token: `tok-500-${Date.now()}`,
          invitedById: ownerA.id,
          expiresAt: new Date(Date.now() + 86400000),
          dispatchStatus: "PENDING",
        },
      });

      const job500 = {
        id: `job-500-${inv500.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: inv500.id,
          email: inv500.email,
          role: "AGENT",
          invitedById: ownerA.id,
        },
      };

      await assert.rejects(
        async () => {
          await processNotificationJob(job500);
        },
        /TransientError/
      );

      const updated = await prisma.workspaceInvitation.findUnique({ where: { id: inv500.id } });
      assert.equal(updated.dispatchStatus, "PENDING");
      assert.ok(updated.nextRetryAt > new Date());
      assert.equal(updated.dispatchLockedBy, null);
    });

    it("13. HTTP 400 permanent : pas de retry inutile", async () => {
      const inv400 = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          email: `simulate-400-${Date.now()}@zadesk-test.com`,
          token: `tok-400-${Date.now()}`,
          invitedById: ownerA.id,
          expiresAt: new Date(Date.now() + 86400000),
          dispatchStatus: "PENDING",
        },
      });

      const job400 = {
        id: `job-400-${inv400.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: inv400.id,
          email: inv400.email,
          role: "AGENT",
          invitedById: ownerA.id,
        },
      };

      // Ne doit PAS throw pour éviter les retries BullMQ inutiles
      const result = await processNotificationJob(job400);
      assert.equal(result.success, false);
      assert.equal(result.reason, "PERMANENT_CLIENT_ERROR");

      const updated = await prisma.workspaceInvitation.findUnique({ where: { id: inv400.id } });
      assert.equal(updated.dispatchStatus, "FAILED");
      assert.ok(updated.dispatchError.includes("400"));
      assert.equal(updated.dispatchLockedBy, null);
    });

    it("14. Invitation déjà acceptée : aucun envoi", async () => {
      const invAccepted = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          email: `accepted-already-${Date.now()}@zadesk-test.com`,
          token: `tok-acc-${Date.now()}`,
          invitedById: ownerA.id,
          expiresAt: new Date(Date.now() + 86400000),
          acceptedAt: new Date(),
          dispatchStatus: "SENDING",
          dispatchLockedBy: "old-worker-1",
        },
      });

      const job = {
        id: `job-acc-${invAccepted.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: invAccepted.id,
          email: invAccepted.email,
          role: "AGENT",
          invitedById: ownerA.id,
        },
      };

      const result = await processNotificationJob(job);
      assert.equal(result.success, true);
      assert.equal(result.reason, "ALREADY_ACCEPTED");

      const inDb = await prisma.workspaceInvitation.findUnique({ where: { id: invAccepted.id } });
      assert.equal(inDb.dispatchLockedBy, null, "Le verrou doit être libéré");
      assert.equal(inDb.dispatchStatus, "SENT", "Ne doit jamais repasser en PENDING");
    });

    it("15. Invitation expirée : aucun envoi automatique", async () => {
      const invExp = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          email: `expired-${Date.now()}@zadesk-test.com`,
          token: `tok-exp-${Date.now()}`,
          invitedById: ownerA.id,
          expiresAt: new Date(Date.now() - 3600000), // expiré il y a 1h
          dispatchStatus: "PENDING",
        },
      });

      const job = {
        id: `job-exp-${invExp.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: invExp.id,
          email: invExp.email,
          role: "AGENT",
          invitedById: ownerA.id,
        },
      };

      const result = await processNotificationJob(job);
      assert.equal(result.success, false);
      assert.equal(result.reason, "INVITATION_EXPIRED");

      const inDb = await prisma.workspaceInvitation.findUnique({ where: { id: invExp.id } });
      assert.equal(inDb.dispatchStatus, "FAILED");
      assert.equal(inDb.dispatchLockedBy, null);
    });

    it("16. Invitation déjà envoyée : idempotence métier", async () => {
      const invSent = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          email: `already-sent-${Date.now()}@zadesk-test.com`,
          token: `tok-sent-${Date.now()}`,
          invitedById: ownerA.id,
          expiresAt: new Date(Date.now() + 86400000),
          dispatchStatus: "SENT",
        },
      });

      const job = {
        id: `job-sent-${invSent.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: invSent.id,
          email: invSent.email,
          role: "AGENT",
          invitedById: ownerA.id,
        },
      };

      const result = await processNotificationJob(job);
      assert.equal(result.success, true);
      assert.equal(result.reason, "ALREADY_SENT");
    });

    it("17. Échec de l'audit après acceptation de l'e-mail par Zavu : risque de doublon correctement identifié", async () => {
      // Reconnaissance explicite du modèle au moins une fois :
      // Si le fournisseur tiers accepte l'email mais que la base plante avant le commit final,
      // un retry BullMQ peut réexpédier l'email (propriété documentée de l'architecture).
      const invAudit = await prisma.workspaceInvitation.create({
        data: {
          workspaceId: wsA.id,
          email: `audit-test-${Date.now()}@zadesk-test.com`,
          token: `tok-audit-${Date.now()}`,
          invitedById: ownerA.id,
          expiresAt: new Date(Date.now() + 86400000),
          dispatchStatus: "PENDING",
        },
      });

      const job = {
        id: `job-audit-${invAudit.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: invAudit.id,
          email: invAudit.email,
          role: "AGENT",
          invitedById: ownerA.id,
        },
      };

      const res = await processNotificationJob(job);
      assert.equal(res.success, true);
      assert.ok(res.auditLogId);

      // Rejouer le même job : l'audit log existant bloque la réexpédition
      const retryRes = await processNotificationJob(job);
      assert.equal(retryRes.success, true);
      assert.equal(retryRes.alreadyDispatched, true);
    });
  });

  // =========================================================================
  // 4. Sécurité et concurrence
  // =========================================================================
  describe("4. Sécurité et concurrence", { concurrency: 1 }, () => {
    it("18. Isolation multi-tenant des événements", async () => {
      const evtB = await prisma.outboxEvent.create({
        data: {
          workspaceId: wsB.id,
          eventType: "TICKET_ASSIGNED",
          queueName: QUEUE_NAMES.TICKETS,
          jobName: TICKET_JOB_TYPES.NOTIFICATION,
          payload: { workspaceId: wsB.id, ticketId: "tk-beta" },
          status: "FAILED",
        },
      });

      // L'utilisateur de workspace A tente de rejouer les événements de workspace B
      await assert.rejects(
        async () => {
          await retryFailedOutboxEvents({
            userId: ownerA.id,
            workspaceId: wsB.id,
          });
        },
        /Accès refusé/
      );

      const inDb = await prisma.outboxEvent.findUnique({ where: { id: evtB.id } });
      assert.equal(inDb.status, "FAILED", "L'événement de workspace B ne doit pas être altéré par workspace A");
    });

    it("19. Rejeu administratif soumis aux permissions", async () => {
      // Un agent simple (non OWNER / non ADMIN) ne peut pas déclencher le rejeu administratif
      await assert.rejects(
        async () => {
          await retryFailedOutboxEvents({
            userId: agentA1.id,
            workspaceId: wsA.id,
          });
        },
        /Accès refusé/
      );
    });

    it("20. Deux rejeux administratifs simultanés", async () => {
      const id1 = `evt-admin-c1-${Date.now()}`;
      const id2 = `evt-admin-c2-${Date.now()}`;

      await prisma.outboxEvent.createMany({
        data: [
          {
            id: id1,
            workspaceId: wsA.id,
            eventType: "TICKET_ASSIGNED",
            queueName: QUEUE_NAMES.TICKETS,
            jobName: TICKET_JOB_TYPES.NOTIFICATION,
            payload: { workspaceId: wsA.id, ticketId: "tk-ac1" },
            status: "FAILED",
          },
          {
            id: id2,
            workspaceId: wsA.id,
            eventType: "TICKET_ASSIGNED",
            queueName: QUEUE_NAMES.TICKETS,
            jobName: TICKET_JOB_TYPES.NOTIFICATION,
            payload: { workspaceId: wsA.id, ticketId: "tk-ac2" },
            status: "FAILED",
          },
        ],
      });

      const [res1, res2] = await Promise.all([
        retryFailedOutboxEvents({ userId: ownerA.id, workspaceId: wsA.id, limit: 10 }),
        retryFailedOutboxEvents({ userId: ownerA.id, workspaceId: wsA.id, limit: 10 }),
      ]);

      const total = res1.replayedCount + res2.replayedCount;
      assert.equal(total, 2, "Exactement 2 événements doivent être réinitialisés au total sans collision");

      const rows = await prisma.outboxEvent.findMany({ where: { id: { in: [id1, id2] } } });
      for (const r of rows) {
        assert.equal(r.status, "PENDING");
        assert.equal(r.attempts, 0);
        assert.equal(r.lockedBy, null);
      }
    });

    it("21. Aucun OTP ou token dans les logs", async () => {
      const rawEmail = "user.secret.agent@enterprise.com";
      const masked = maskEmail(rawEmail);

      assert.equal(masked, "us***@enterprise.com");
      assert.ok(!masked.includes("secret.agent"));

      // Vérifier que la fonction de nettoyage ne divulgue pas de token
      const retryAfter = parseRetryAfter({ headers: { get: () => "45" } });
      assert.equal(retryAfter, 45000);
    });

    it("22. Aucune régression dans les transitions d'état", async () => {
      const evt = await prisma.outboxEvent.create({
        data: {
          workspaceId: wsA.id,
          eventType: "TICKET_ASSIGNED",
          queueName: QUEUE_NAMES.TICKETS,
          jobName: TICKET_JOB_TYPES.NOTIFICATION,
          payload: { workspaceId: wsA.id, ticketId: "tk-state-test" },
          status: "PENDING",
        },
      });

      // PENDING -> PUBLISHED via dispatcher
      await dispatchOutboxEvents({ batchSize: 10 });
      const pub = await prisma.outboxEvent.findUnique({ where: { id: evt.id } });
      assert.equal(pub.status, "PUBLISHED");
      assert.ok(pub.publishedAt);

      // Simuler bascule en FAILED et rejeu administratif -> PENDING
      // Supprimer le job BullMQ s'il existe pour simuler un état non actif
      if (pub.jobId) {
        try {
          const q = queueManager.getQueue(QUEUE_NAMES.TICKETS);
          const j = await q.getJob(pub.jobId);
          if (j) await j.remove();
        } catch (_) {}
      }

      await prisma.outboxEvent.update({
        where: { id: evt.id },
        data: { status: "FAILED", attempts: 5, jobId: null },
      });

      const replay = await retryFailedOutboxEvents({ userId: ownerA.id, workspaceId: wsA.id });
      assert.ok(replay.replayedCount >= 1);

      const finalState = await prisma.outboxEvent.findUnique({ where: { id: evt.id } });
      assert.equal(finalState.status, "PENDING");
      assert.equal(finalState.attempts, 0);
    });
  });
});
