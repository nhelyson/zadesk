process.env.NODE_ENV = "test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { createTicket } from "../src/services/agentService.js";
import { createOutboxEvent, dispatchOutboxEvents } from "../src/outbox/outboxDispatcher.js";
import { queueManager, QUEUE_NAMES } from "../src/queues/queueManager.js";
import { TICKET_JOB_TYPES } from "../src/jobs/ticketJobs.js";
import { processNotificationJob } from "../src/workers/notificationWorker.js";
import { getRedisClient } from "../src/config/redis.js";

async function run() {
  console.log("=== VÉRIFICATION CONCRÈTE DES 3 MÉCANISMES ESSENTIELS ===");
  const ts = Date.now();
  let ws, owner, agent;

  try {
    // Préparation d'un workspace de test
    ws = await prisma.workspace.create({
      data: { name: `WS Verification 3 Meca ${ts}`, slug: `ws-meca-${ts}` },
    });
    owner = await prisma.user.create({
      data: { email: `owner-${ts}@meca-test.com`, firstName: "Owner", lastName: "Test" },
    });
    agent = await prisma.user.create({
      data: { email: `agent-${ts}@meca-test.com`, firstName: "Agent", lastName: "Test" },
    });
    await prisma.membership.createMany({
      data: [
        { userId: owner.id, workspaceId: ws.id, role: "OWNER" },
        { userId: agent.id, workspaceId: ws.id, role: "AGENT" },
      ],
    });
    await prisma.agentProfile.create({
      data: { userId: agent.id, workspaceId: ws.id, availability: "AVAILABLE" },
    });

    // -------------------------------------------------------------------------
    // MÉCANISME 1 : Opération validée conserve son événement si Redis est indisponible
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Vérification de la persistance Outbox lors d'une panne Redis...");
    
    // Simuler l'indisponibilité de Redis (ex: panne réseau ou Redis OOM) AVANT l'opération
    const originalAddJob = queueManager.addJob.bind(queueManager);
    queueManager.addJob = async () => {
      return { success: false, error: "ECONNREFUSED: Redis instance unavailable or OOM" };
    };

    let ticket;
    try {
      // Création transactionnelle métier (ticket + outbox) pendant la panne Redis
      ticket = await createTicket(ws.id, owner.id, {
        title: "Ticket Résilience Panne Redis",
        description: "Vérifier que l'événement persiste en PostgreSQL si Redis refuse le job",
        customerName: "Client Résilience",
        customerEmail: "client.resilience@test.com",
        assignedAgentId: agent.id,
      });
      assert.ok(ticket.id, "L'opération métier (ticket) doit réussir même si Redis est indisponible");

      // Laisser le déclenchement asynchrone fire-and-forget de createTicket tenter le dispatch et consigner l'échec
      await new Promise((r) => setTimeout(r, 250));
    } finally {
      // Rétablir la connexion normale de Redis
      queueManager.addJob = originalAddJob;
    }

    // Trouver l'événement Outbox généré dans PostgreSQL
    const createdEvent = await prisma.outboxEvent.findFirst({
      where: {
        workspaceId: ws.id,
        eventType: "TICKET_ASSIGNED",
        payload: { path: ["ticketId"], equals: ticket.id },
      },
    });
    assert.ok(createdEvent, "L'événement Outbox doit subsister durablement dans PostgreSQL");
    assert.equal(createdEvent.status, "PENDING", "Le statut doit rester PENDING pour reprise ultérieure");
    assert.ok(createdEvent.attempts >= 1, "Le compteur de tentatives doit refléter l'échec d'envoi");
    assert.ok(createdEvent.lastError.includes("ECONNREFUSED"), "L'erreur de connexion Redis doit être tracée");
    assert.equal(createdEvent.lockedBy, null, "Le verrou doit être libéré pour permettre la reprise dès que Redis revient");
    console.log(` -> Événement conservé en PostgreSQL: id=${createdEvent.id}, status=${createdEvent.status}, attempts=${createdEvent.attempts}, lastError="${createdEvent.lastError}"`);

    // Vérifier la reprise dès que Redis redevient disponible
    const recoveryDispatch = await dispatchOutboxEvents({ batchSize: 10 });
    assert.ok(recoveryDispatch.published >= 1, "Le dispatcher doit publier l'événement dès le retour de Redis");
    const recoveredEvent = await prisma.outboxEvent.findUnique({ where: { id: createdEvent.id } });
    assert.equal(recoveredEvent.status, "PUBLISHED", "L'événement doit être marqué PUBLISHED après reprise");
    console.log(" [SUCCÈS MÉCANISME 1] Opération validée en PostgreSQL malgré Redis hors-service, puis reprise automatique réussie !");

    // -------------------------------------------------------------------------
    // MÉCANISME 2 : Deux dispatchers concurrents ne publient pas simultanément
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Vérification de la non-collision entre 2 dispatchers concurrents (FOR UPDATE SKIP LOCKED)...");
    
    // Créer 10 événements PENDING
    const eventIds = [];
    for (let i = 1; i <= 10; i++) {
      const id = `evt-conc-${ts}-${i}`;
      eventIds.push(id);
      await prisma.outboxEvent.create({
        data: {
          id,
          workspaceId: ws.id,
          eventType: "TICKET_ASSIGNED",
          queueName: QUEUE_NAMES.TICKETS,
          jobName: TICKET_JOB_TYPES.NOTIFICATION,
          payload: { workspaceId: ws.id, ticketId: `ticket-conc-${i}` },
          status: "PENDING",
        },
      });
    }

    // Exécuter 2 dispatchers simultanément en parallèle absolu
    const [d1, d2] = await Promise.all([
      dispatchOutboxEvents({ batchSize: 10 }),
      dispatchOutboxEvents({ batchSize: 10 }),
    ]);

    console.log(` -> Dispatcher 1 a publié : ${d1.published} événements`);
    console.log(` -> Dispatcher 2 a publié : ${d2.published} événements`);
    assert.equal(d1.published + d2.published, 10, "Le total publié doit être exactement 10");
    
    // Vérifier en base que chaque événement est passé en PUBLISHED exactement une fois
    const publishedEvents = await prisma.outboxEvent.findMany({
      where: { id: { in: eventIds } },
    });
    for (const ev of publishedEvents) {
      assert.equal(ev.status, "PUBLISHED", `L'événement ${ev.id} doit avoir le statut PUBLISHED`);
      assert.ok(ev.jobId, `L'événement ${ev.id} doit avoir un jobId confirmé`);
    }
    console.log(" [SUCCÈS MÉCANISME 2] Aucune collision, les 10 événements ont été répartis et publiés de façon exclusive.");

    // -------------------------------------------------------------------------
    // MÉCANISME 3 : Reprise après crash sans duplication métier
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Vérification de l'idempotence métier lors d'une reprise après crash...");

    const inv = await prisma.workspaceInvitation.create({
      data: {
        workspaceId: ws.id,
        email: `invite-crash-${ts}@meca-test.com`,
        token: `tok-crash-${ts}`,
        invitedById: owner.id,
        expiresAt: new Date(Date.now() + 86400000),
        dispatchStatus: "PENDING",
      },
    });

    const jobPayload = {
      id: `job-invite-${inv.id}`,
      name: "notification:invitation_email",
      data: {
        workspaceId: ws.id,
        invitationId: inv.id,
        email: inv.email,
        role: "AGENT",
        invitedById: owner.id,
      },
    };

    // Premier passage du worker : expédition réussie
    const firstExec = await processNotificationJob(jobPayload);
    assert.equal(firstExec.success, true, "Le premier envoi doit réussir");
    assert.ok(firstExec.auditLogId, "Un AuditLog doit être créé");
    console.log(` -> Premier passage worker : succès, AuditLog #${firstExec.auditLogId} consigné`);

    // Vérifier l'état en base après 1er passage
    const invAfterFirst = await prisma.workspaceInvitation.findUnique({ where: { id: inv.id } });
    assert.equal(invAfterFirst.dispatchStatus, "SENT", "L'invitation doit être au statut SENT");

    // Simuler le crash et reprise : ré-exécution du MEME job BullMQ
    const secondExec = await processNotificationJob(jobPayload);
    assert.equal(secondExec.success, true, "Le rejeu doit être traité avec succès sans lever d'erreur");
    assert.ok(
      secondExec.reason === "ALREADY_SENT" || secondExec.alreadyDispatched === true,
      "Le worker doit reconnaître que l'e-mail a déjà été envoyé"
    );
    console.log(` -> Rejeu après crash : reconnu déjà expédié (reason=${secondExec.reason || 'alreadyDispatched'}), aucun e-mail dupliqué.`);

    // Vérifier le nombre d'audit logs en base
    const auditCount = await prisma.auditLog.count({
      where: { workspaceId: ws.id, entityId: inv.id, action: "INVITATION_EMAIL_DISPATCHED" },
    });
    assert.equal(auditCount, 1, "Il doit exister exactement 1 seul enregistrement d'envoi dans AuditLog");
    console.log(" [SUCCÈS MÉCANISME 3] Idempotence totale confirmée, aucun doublon généré.");

    console.log("\n=======================================================");
    console.log(" TOUS LES 3 MÉCANISMES ESSENTIELS SONT CONCRÈTEMENT VALIDÉS !");
    console.log("=======================================================");
  } finally {
    // Nettoyage des données de test
    if (ws) {
      try {
        await prisma.outboxEvent.deleteMany({ where: { workspaceId: ws.id } });
        await prisma.auditLog.deleteMany({ where: { workspaceId: ws.id } });
        await prisma.ticketActivity.deleteMany({ where: { ticket: { workspaceId: ws.id } } });
        await prisma.ticketAssignment.deleteMany({ where: { ticket: { workspaceId: ws.id } } });
        await prisma.ticketShare.deleteMany({ where: { ticket: { workspaceId: ws.id } } });
        await prisma.ticket.deleteMany({ where: { workspaceId: ws.id } });
        await prisma.workspaceInvitation.deleteMany({ where: { workspaceId: ws.id } });
        await prisma.agentProfile.deleteMany({ where: { workspaceId: ws.id } });
        await prisma.membership.deleteMany({ where: { workspaceId: ws.id } });
        await prisma.workspace.deleteMany({ where: { id: ws.id } });
      } catch (_) {}
    }
    if (owner || agent) {
      try {
        await prisma.user.deleteMany({ where: { id: { in: [owner?.id, agent?.id].filter(Boolean) } } });
      } catch (_) {}
    }
    try {
      await queueManager.closeAll();
      const redis = getRedisClient();
      if (redis && redis.status !== "end") await redis.quit();
      await prisma.$disconnect();
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error("ÉCHEC DE VÉRIFICATION :", err);
  process.exit(1);
});
