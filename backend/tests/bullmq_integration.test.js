process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { Queue, Worker } from "bullmq";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { queueManager, QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from "../src/queues/queueManager.js";
import { createBullMQConnection, BULLMQ_PREFIX } from "../src/config/bullmqRedis.js";
import { dispatchTicketNotificationJob } from "../src/jobs/ticketJobs.js";
import { dispatchInvitationEmailJob } from "../src/jobs/notificationJobs.js";
import { dispatchMaintenanceCleanupJob, scheduleRecurringMaintenance } from "../src/jobs/maintenanceJobs.js";
import { dispatchMetricsRefreshJob } from "../src/jobs/metricsJobs.js";
import { processTicketJob } from "../src/workers/ticketWorker.js";
import { processNotificationJob } from "../src/workers/notificationWorker.js";
import { processMaintenanceJob } from "../src/workers/maintenanceWorker.js";
import { processMetricsJob } from "../src/workers/metricsWorker.js";
import { sendOtpEmail, sendInvitationEmail } from "../src/services/zavuService.js";
import { getDashboardStatsCacheKey } from "../src/services/workspaceService.js";
import { cacheService } from "../src/cache/cacheService.js";
import { COOKIE_NAME } from "../src/config/constants.js";
import { getRedisClient } from "../src/config/redis.js";

describe("BullMQ Architecture & Intégration Robuste Zadesk", () => {
  let wsA, wsB;
  let userA, userB;
  let ticketA, ticketB;
  let invitationA;
  let sessionTokenA;
  let redisClient;

  before(async () => {
    redisClient = createBullMQConnection("test-suite-conn");

    // 1. Create two isolated workspaces for multi-tenant tests
    const timestamp = Date.now();
    wsA = await prisma.workspace.create({
      data: {
        name: "Workspace Alpha",
        slug: `ws-bullmq-a-${timestamp}`,
      },
    });

    wsB = await prisma.workspace.create({
      data: {
        name: "Workspace Beta",
        slug: `ws-bullmq-b-${timestamp}`,
      },
    });

    // 2. Create users
    userA = await prisma.user.create({
      data: {
        email: `agent-a-${timestamp}@zadesk-test.com`,
        firstName: "Agent",
        lastName: "Alpha",
      },
    });

    userB = await prisma.user.create({
      data: {
        email: `agent-b-${timestamp}@zadesk-test.com`,
        firstName: "Agent",
        lastName: "Beta",
      },
    });

    // Memberships
    await prisma.membership.create({
      data: {
        userId: userA.id,
        workspaceId: wsA.id,
        role: "OWNER",
      },
    });

    await prisma.membership.create({
      data: {
        userId: userB.id,
        workspaceId: wsB.id,
        role: "AGENT",
      },
    });

    // 3. Create Session for User A (Owner of wsA)
    sessionTokenA = `test-session-bullmq-${timestamp}`;
    await prisma.session.create({
      data: {
        sessionToken: sessionTokenA,
        userId: userA.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Active
      },
    });

    // 4. Create Tickets
    ticketA = await prisma.ticket.create({
      data: {
        workspaceId: wsA.id,
        reference: `TICK-A-${timestamp}`,
        title: "Panne Système Alpha",
        description: "Détails panne A",
        customerName: "Client Alpha",
        status: "OPEN",
        priority: "HIGH",
        createdById: userA.id,
      },
    });

    ticketB = await prisma.ticket.create({
      data: {
        workspaceId: wsB.id,
        reference: `TICK-B-${timestamp}`,
        title: "Incident Système Beta",
        description: "Détails panne B",
        customerName: "Client Beta",
        status: "OPEN",
        priority: "MEDIUM",
        createdById: userB.id,
      },
    });

    // 5. Create Invitation in Workspace A
    invitationA = await prisma.workspaceInvitation.create({
      data: {
        workspaceId: wsA.id,
        invitedById: userA.id,
        email: `invitee-${timestamp}@zadesk-test.com`,
        token: `test-token-${timestamp}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  });

  after(async () => {
    try {
      await queueManager.closeAll();
      if (redisClient && redisClient.status === "ready") {
        await redisClient.quit();
      }
      const defaultRedis = getRedisClient();
      if (defaultRedis && defaultRedis.status === "ready") {
        await defaultRedis.quit();
      }
      await prisma.$disconnect();
      setTimeout(() => process.exit(0), 100);
    } catch (e) {
      setTimeout(() => process.exit(0), 100);
    }
  });

  // -------------------------------------------------------------
  // SUITE 1 : Architecture Redis & Isolation BullMQ
  // -------------------------------------------------------------
  describe("1. Architecture Redis & Isolation BullMQ", () => {
    it("devrait utiliser un préfixe isolé {zadesk:bull} pour toutes les clés de file d'attente", async () => {
      assert.equal(BULLMQ_PREFIX, "{zadesk:bull}", "Le préfixe BullMQ doit isoler l'espace de clés");
    });

    it("devrait initialiser les files d'attente sans conflit avec le Cache applicatif ni le Rate Limiting", async () => {
      const ticketsQ = queueManager.getQueue(QUEUE_NAMES.TICKETS);
      assert.ok(ticketsQ instanceof Queue, "L'instance de file doit être un objet Queue BullMQ");
      assert.equal(ticketsQ.name, "tickets");

      const notificationsQ = queueManager.getQueue(QUEUE_NAMES.NOTIFICATIONS);
      assert.ok(notificationsQ instanceof Queue);
      assert.equal(notificationsQ.name, "notifications");
    });

    it("devrait appliquer les politiques de rétention pour limiter l'empreinte mémoire sous 128 Mo", () => {
      assert.equal(DEFAULT_JOB_OPTIONS.attempts, 3, "3 tentatives avec backoff exponentiel");
      assert.equal(DEFAULT_JOB_OPTIONS.removeOnComplete.count, 100, "Rétention maximale de 100 jobs complétés");
      assert.equal(DEFAULT_JOB_OPTIONS.removeOnFail.count, 500, "Rétention maximale de 500 jobs échoués");
    });

    it("devrait faire apparaître immédiatement les 4 files d'attente avec leur statut dans getAllQueueMetrics()", async () => {
      const metrics = await queueManager.getAllQueueMetrics();
      for (const qName of Object.values(QUEUE_NAMES)) {
        assert.ok(metrics[qName], `La file ${qName} doit être listée dès le démarrage`);
        assert.equal(metrics[qName].status, "healthy");
        assert.equal(typeof metrics[qName].waiting, "number");
        assert.equal(typeof metrics[qName].active, "number");
      }
    });
  });

  // -------------------------------------------------------------
  // SUITE 2 : Producteurs, Idempotence Déterministe & Planification
  // -------------------------------------------------------------
  describe("2. Producteurs, Idempotence Déterministe & Planification", () => {
    it("devrait publier une notification de ticket avec un identifiant déterministe sans Date.now()", async () => {
      const res = await dispatchTicketNotificationJob({
        workspaceId: wsA.id,
        ticketId: ticketA.id,
        eventType: "ASSIGNED",
        authorId: userA.id,
        targetAgentId: userA.id,
        content: "Attribution initiale de ticket",
      });

      assert.equal(res.success, true);
      assert.equal(res.jobId, `ticket-notif-${ticketA.id}-assigned-${userA.id}`);
      assert.ok(!res.jobId.includes(Date.now().toString().slice(0, 5)), "Le jobId ne doit PAS contenir de timestamp");
    });

    it("devrait dédupliquer une notification identique sans créer de doublon dans la file", async () => {
      const res1 = await dispatchTicketNotificationJob({
        workspaceId: wsA.id,
        ticketId: ticketA.id,
        eventType: "ASSIGNED",
        authorId: userA.id,
        targetAgentId: userA.id,
      });

      const res2 = await dispatchTicketNotificationJob({
        workspaceId: wsA.id,
        ticketId: ticketA.id,
        eventType: "ASSIGNED",
        authorId: userA.id,
        targetAgentId: userA.id,
      });

      assert.equal(res1.success, true);
      assert.equal(res2.success, true);
      assert.equal(res1.jobId, res2.jobId, "L'identifiant déterministe permet à BullMQ de dédupliquer l'action");
    });

    it("deux événements métier distincts (ASSIGNED vs SHARED) doivent produire deux notifications distinctes", async () => {
      const resAssigned = await dispatchTicketNotificationJob({
        workspaceId: wsA.id,
        ticketId: ticketA.id,
        eventType: "ASSIGNED",
        authorId: userA.id,
        targetAgentId: userA.id,
      });

      const resShared = await dispatchTicketNotificationJob({
        workspaceId: wsA.id,
        ticketId: ticketA.id,
        eventType: "SHARED",
        authorId: userA.id,
        targetAgentId: userA.id,
      });

      assert.notEqual(resAssigned.jobId, resShared.jobId, "Deux événements distincts doivent avoir des job IDs différents");
      assert.ok(resAssigned.jobId.includes("assigned"));
      assert.ok(resShared.jobId.includes("shared"));
    });

    it("devrait refuser une tâche de ticket sans contexte de workspace (validation amont)", async () => {
      const res = await dispatchTicketNotificationJob({
        workspaceId: null,
        ticketId: ticketA.id,
        eventType: "ASSIGNED",
      });

      assert.equal(res.success, false);
      assert.ok(res.error.includes("multi-tenant"));
    });

    it("devrait publier une tâche d'email d'invitation avec clé d'idempotence", async () => {
      const res = await dispatchInvitationEmailJob({
        workspaceId: wsA.id,
        invitationId: invitationA.id,
        email: invitationA.email,
        role: "AGENT",
        invitedById: userA.id,
      });

      assert.equal(res.success, true);
      assert.equal(res.jobId, `invite-email-${invitationA.id}`);
    });

    it("devrait enregistrer la planification récurrente de maintenance sans duplication (BullMQ native scheduler)", async () => {
      // First registration
      const sched1 = await scheduleRecurringMaintenance();
      assert.ok(sched1);

      // Second registration (simulating a second backend instance or server reboot)
      const sched2 = await scheduleRecurringMaintenance();
      assert.ok(sched2);

      // Verify that BullMQ registers it idempotently with single scheduler ID
      const queue = queueManager.getQueue(QUEUE_NAMES.MAINTENANCE);
      if (typeof queue.getJobSchedulers === "function") {
        const schedulers = await queue.getJobSchedulers();
        const maintScheds = schedulers.filter((s) => s.key?.includes("recurring-maintenance-cleanup") || s.id === "recurring-maintenance-cleanup");
        assert.ok(maintScheds.length <= 1, "Il ne doit y avoir qu'un seul scheduler de maintenance");
      }
    });

    it("devrait publier une tâche de rafraîchissement des métriques de workspace", async () => {
      const res = await dispatchMetricsRefreshJob({
        workspaceId: wsA.id,
        triggeredBy: "unit_test",
      });
      assert.equal(res.success, true);
      assert.ok(res.jobId.includes(`metrics-${wsA.id}-`));
    });
  });

  // -------------------------------------------------------------
  // SUITE 3 : Exécution des Workers, Expédition d'Emails & Maintenance
  // -------------------------------------------------------------
  describe("3. Exécution des Workers, Expédition d'Emails & Maintenance", () => {
    it("devrait traiter un job d'invitation avec sendInvitationEmail et générer un AuditLog complet", async () => {
      const mockJob = {
        id: `invite-email-${invitationA.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: invitationA.id,
          email: invitationA.email,
          role: "AGENT",
          invitedById: userA.id,
        },
      };

      const result = await processNotificationJob(mockJob);
      assert.equal(result.success, true);
      assert.equal(result.invitationId, invitationA.id);

      // Verify audit log created
      const audit = await prisma.auditLog.findFirst({
        where: {
          workspaceId: wsA.id,
          entityId: invitationA.id,
          action: "INVITATION_EMAIL_DISPATCHED",
        },
      });
      assert.ok(audit, "Un AuditLog doit être créé lors de l'envoi de l'invitation");
    });

    it("devrait garantir le fonctionnement indépendant et intact des emails OTP (sendOtpEmail)", async () => {
      const otpRes = await sendOtpEmail({
        to: "user-otp@zadesk-test.com",
        otpCode: "654321",
        purpose: "LOGIN",
      });

      assert.equal(otpRes.success, true);
      assert.equal(otpRes.data?.devCode, "654321", "Les emails OTP doivent préserver leur format 6 chiffres sans interférence");
    });

    it("devrait empêcher le renvoi d'un second email lors d'un retry si l'AuditLog existe déjà (Idempotence de retry)", async () => {
      // Re-run the exact same job simulating a BullMQ retry after crash
      const retryJob = {
        id: `invite-email-${invitationA.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: wsA.id,
          invitationId: invitationA.id,
          email: invitationA.email,
          role: "AGENT",
          invitedById: userA.id,
        },
      };

      const result = await processNotificationJob(retryJob);
      assert.equal(result.success, true);
      assert.equal(result.alreadyDispatched, true, "Le worker doit détecter que l'email a déjà été expédié et éviter un double envoi");
    });

    it("devrait exécuter la maintenance et purger les sessions expirées en préservant strictement les sessions actives", async () => {
      // 1. Create an expired session
      const expiredSessionToken = `expired-session-${Date.now()}`;
      await prisma.session.create({
        data: {
          sessionToken: expiredSessionToken,
          userId: userA.id,
          expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
        },
      });

      const mockJob = {
        id: "test-maint-job-1",
        data: { triggeredBy: "test" },
      };

      const result = await processMaintenanceJob(mockJob);
      assert.equal(result.success, true);
      assert.ok(result.deletedSessions >= 1, "La maintenance doit purger au moins 1 session expirée");

      // Verify that expired session is deleted
      const checkExpired = await prisma.session.findUnique({
        where: { sessionToken: expiredSessionToken },
      });
      assert.equal(checkExpired, null, "La session expirée doit être supprimée de la base");

      // Verify that active session still exists
      const checkActive = await prisma.session.findUnique({
        where: { sessionToken: sessionTokenA },
      });
      assert.ok(checkActive, "La session active ne doit JAMAIS être purgée");
    });

    it("devrait exécuter le rafraîchissement des métriques et peupler le CacheService avec la clé harmonisée", async () => {
      const mockJob = {
        id: "test-metrics-job-1",
        data: {
          workspaceId: wsA.id,
          triggeredBy: "test",
        },
      };

      const result = await processMetricsJob(mockJob);
      assert.equal(result.success, true);
      assert.equal(result.cached, true);
      assert.equal(result.cacheKey, getDashboardStatsCacheKey(wsA.id));

      // Verify CacheService has data under the identical key
      const cachedData = await cacheService.get(getDashboardStatsCacheKey(wsA.id));
      assert.ok(cachedData, "Les statistiques doivent être présentes en cache sous la clé harmonisée");
      assert.ok(cachedData.overview);
    });
  });

  // -------------------------------------------------------------
  // SUITE 4 : Sécurité Multi-Tenant Stricte
  // -------------------------------------------------------------
  describe("4. Sécurité Multi-Tenant Stricte & Défense en Profondeur", () => {
    it("devrait REJETER un job tentant de traiter un ticket appartenant à un autre Workspace", async () => {
      const crossTenantJob = {
        id: "test-attack-cross-tenant-1",
        name: "ticket:notification",
        data: {
          workspaceId: wsA.id,
          ticketId: ticketB.id, // Ticket belongs to Workspace B !
          eventType: "REASSIGNED",
          authorId: userA.id,
        },
      };

      await assert.rejects(
        async () => {
          await processTicketJob(crossTenantJob);
        },
        (err) => {
          assert.ok(err.message.includes("[SECURITY_VIOLATION]"));
          assert.ok(err.message.includes("cross-tenant"));
          return true;
        },
        "Le Worker doit lever une erreur [SECURITY_VIOLATION] en cas de conflit de tenant"
      );
    });

    it("devrait REJETER un job tentant d'expédier une invitation d'un autre Workspace", async () => {
      const crossTenantInviteJob = {
        id: "test-attack-cross-tenant-2",
        name: "notification:invitation_email",
        data: {
          workspaceId: wsB.id, // Workspace B
          invitationId: invitationA.id, // Invitation belongs to Workspace A !
          email: "attacker@bad.com",
        },
      };

      await assert.rejects(
        async () => {
          await processNotificationJob(crossTenantInviteJob);
        },
        (err) => {
          assert.ok(err.message.includes("[SECURITY_VIOLATION]"));
          assert.ok(err.message.includes("cross-tenant"));
          return true;
        },
        "Le Worker doit lever une erreur [SECURITY_VIOLATION] pour une invitation cross-tenant"
      );
    });

    it("devrait ignorer gracieusement un job référençant un identifiant inexistant", async () => {
      const invalidJob = {
        id: "test-invalid-id",
        name: "ticket:notification",
        data: {
          workspaceId: wsA.id,
          ticketId: "cmvy99999inexistant999",
          eventType: "ASSIGNED",
        },
      };

      const res = await processTicketJob(invalidJob);
      assert.equal(res.success, false);
      assert.equal(res.reason, "TICKET_NOT_FOUND");
    });
  });

  // -------------------------------------------------------------
  // SUITE 5 : Fiabilité, Consommation Réelle & Validation HTTP
  // -------------------------------------------------------------
  describe("5. Fiabilité, Consommation Réelle & Validation HTTP", () => {
    it("devrait consommer les statistiques pré-calculées par le Worker via la route HTTP /dashboard", async () => {
      // 1. Warm up cache via Worker
      await processMetricsJob({
        id: "test-http-metrics-job",
        data: { workspaceId: wsA.id, triggeredBy: "test" },
      });

      // 2. HTTP Request with valid session cookie
      const res = await request(app)
        .get(`/api/workspaces/${wsA.id}/dashboard`)
        .set("Cookie", [`${COOKIE_NAME}=${sessionTokenA}`]);

      assert.equal(res.status, 200);
      assert.ok(res.body.success, "La route doit renvoyer success: true");
      const overview = res.body.data?.overview || res.body.overview;
      assert.ok(overview, "Les données du dashboard doivent être retournées");
      assert.equal(overview.openTickets, 7);
    });

    it("devrait exécuter le cycle complet Queue -> Worker indépendant avec résultat dans Redis", async () => {
      const testQueue = new Queue("test-live-e2e", {
        connection: createBullMQConnection("test-producer-e2e"),
        prefix: BULLMQ_PREFIX,
      });

      let jobHandled = false;
      let handledData = null;

      const testWorker = new Worker(
        "test-live-e2e",
        async (job) => {
          jobHandled = true;
          handledData = job.data;
          return { done: true };
        },
        {
          connection: createBullMQConnection("test-worker-e2e"),
          prefix: BULLMQ_PREFIX,
        }
      );

      await testWorker.waitUntilReady();

      const job = await testQueue.add("testTask", { ping: "pong", ts: Date.now() });
      assert.ok(job.id);

      for (let i = 0; i < 30; i++) {
        if (jobHandled) break;
        await new Promise((r) => setTimeout(r, 100));
      }

      assert.equal(jobHandled, true, "Le Worker doit avoir consommé le job");
      assert.equal(handledData.ping, "pong");

      await testWorker.close();
      await testQueue.close();
    });

    it("devrait résister à l'indisponibilité d'un paramètre sans planter le processus", async () => {
      const res = await dispatchTicketNotificationJob({
        workspaceId: wsA.id,
        ticketId: null, // Invalid
        eventType: "ASSIGNED",
      });

      assert.equal(res.success, false);
      assert.ok(res.error);
    });
  });
});
