process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { prisma } from "../src/lib/prisma.js";
import {
  processNotificationJob,
  cleanupAcceptedInvitationDispatchState,
} from "../src/workers/notificationWorker.js";
import {
  ensureOutboxTable,
  retryFailedOutboxEvents,
} from "../src/outbox/outboxAdminService.js";

describe("Phase 2 — Corrections Ciblées Finales (Audit & Tests)", () => {
  let ws;
  let owner;
  let agent;
  let invitationAccepted;
  let invitationNormal;
  let invitationNullState;

  before(async () => {
    const timestamp = Date.now();

    // S'assurer de la présence de la table outbox_events pour les tests de rejeu administratif
    await ensureOutboxTable(prisma);

    // 1. Créer un workspace de test isolé
    ws = await prisma.workspace.create({
      data: {
        name: `WS Phase2 Corrections ${timestamp}`,
        slug: `ws-phase2-corr-${timestamp}`,
      },
    });

    // 2. Créer l'utilisateur OWNER et l'utilisateur AGENT
    owner = await prisma.user.create({
      data: {
        email: `owner-${timestamp}@zadesk-phase2.com`,
        firstName: "Owner",
        lastName: "Phase2",
      },
    });

    agent = await prisma.user.create({
      data: {
        email: `agent-${timestamp}@zadesk-phase2.com`,
        firstName: "Agent",
        lastName: "Phase2",
      },
    });

    await prisma.membership.create({
      data: {
        userId: owner.id,
        workspaceId: ws.id,
        role: "OWNER",
      },
    });

    await prisma.membership.create({
      data: {
        userId: agent.id,
        workspaceId: ws.id,
        role: "AGENT",
      },
    });

    // 3. Créer une invitation déjà acceptée
    invitationAccepted = await prisma.workspaceInvitation.create({
      data: {
        workspaceId: ws.id,
        email: `accepted-${timestamp}@zadesk-phase2.com`,
        role: "AGENT",
        token: `tok-accepted-${timestamp}`,
        invitedById: owner.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        acceptedAt: new Date(Date.now() - 3600 * 1000), // Acceptée il y a 1h
      },
    });

    // 4. Créer une invitation normale en attente
    invitationNormal = await prisma.workspaceInvitation.create({
      data: {
        workspaceId: ws.id,
        email: `normal-${timestamp}@zadesk-phase2.com`,
        role: "AGENT",
        token: `tok-normal-${timestamp}`,
        invitedById: owner.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        acceptedAt: null,
      },
    });

    // 5. Créer une invitation dédiée au test de postState null
    invitationNullState = await prisma.workspaceInvitation.create({
      data: {
        workspaceId: ws.id,
        email: `nullstate-${timestamp}@zadesk-phase2.com`,
        role: "AGENT",
        token: `tok-nullstate-${timestamp}`,
        invitedById: owner.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        acceptedAt: null,
      },
    });
  });

  after(async () => {
    // Nettoyage des données créées
    try {
      await prisma.outboxEvent.deleteMany({ where: { workspaceId: ws.id } });
      await prisma.auditLog.deleteMany({ where: { workspaceId: ws.id } });
      await prisma.workspaceInvitation.deleteMany({ where: { workspaceId: ws.id } });
      await prisma.membership.deleteMany({ where: { workspaceId: ws.id } });
      await prisma.workspace.deleteMany({ where: { id: ws.id } });
      await prisma.user.deleteMany({ where: { id: { in: [owner.id, agent.id] } } });
    } catch (_) {}
  });

  // =========================================================================
  // CORRECTION 1 — Nettoyage de l'état d'une invitation déjà acceptée
  // =========================================================================
  describe("Correction 1 — Nettoyage d'état et non-réexpédition d'une invitation acceptée", () => {
    it("1. Une invitation déjà acceptée ne reste pas bloquée en SENDING", async () => {
      // Simuler une invitation acceptée avec un état de dispatch obsolète (SENDING / lock actif)
      const mockInvitationWithStaleLock = {
        id: invitationAccepted.id,
        workspaceId: ws.id,
        dispatchStatus: "SENDING",
        dispatchLockedBy: "worker-stale-999",
        dispatchStartedAt: new Date(Date.now() - 10 * 60 * 1000),
        acceptedAt: invitationAccepted.acceptedAt,
      };

      // Exécuter le nettoyage ciblé
      await cleanupAcceptedInvitationDispatchState({
        invitationId: invitationAccepted.id,
        workspaceId: ws.id,
        invitation: mockInvitationWithStaleLock,
      });

      // Vérifier que le statut n'est plus SENDING, que le lock est nettoyé, et qu'elle n'est pas remise en PENDING
      assert.notEqual(
        mockInvitationWithStaleLock.dispatchStatus,
        "SENDING",
        "L'invitation ne doit plus avoir le statut SENDING"
      );
      assert.notEqual(
        mockInvitationWithStaleLock.dispatchStatus,
        "PENDING",
        "L'invitation acceptée ne doit JAMAIS être remise en PENDING"
      );
      assert.equal(
        mockInvitationWithStaleLock.dispatchStatus,
        "SENT",
        "L'invitation acceptée doit être marquée SENT de façon cohérente"
      );
      assert.equal(
        mockInvitationWithStaleLock.dispatchLockedBy,
        null,
        "Le verrou dispatchLockedBy doit être obligatoirement libéré (null)"
      );
    });

    it("2. Une invitation acceptée n'est jamais renvoyée", async () => {
      const job = {
        id: `job-invite-${invitationAccepted.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: ws.id,
          invitationId: invitationAccepted.id,
          email: invitationAccepted.email,
          role: "AGENT",
          invitedById: owner.id,
        },
      };

      const result = await processNotificationJob(job);

      assert.equal(result.success, true);
      assert.equal(result.reason, "ALREADY_ACCEPTED");

      // Vérifier qu'aucun AuditLog d'envoi n'a été créé pour cette invitation déjà acceptée
      const audit = await prisma.auditLog.findFirst({
        where: {
          workspaceId: ws.id,
          entityId: invitationAccepted.id,
          action: "INVITATION_EMAIL_DISPATCHED",
        },
      });
      assert.equal(
        audit,
        null,
        "Aucun email ne doit être consigné ni envoyé pour une invitation déjà acceptée"
      );
    });
  });

  // =========================================================================
  // CORRECTION 2 — Vérification explicite de postState après l'envoi
  // =========================================================================
  describe("Correction 2 — Vérification de postState et rejet de fausse acceptation", () => {
    it("3. postState === null ne provoque pas une fausse détection d'acceptation", async () => {
      // Simuler un cas où postState vaut null (ex: invitation purgée ou introuvable post-dispatch)
      const jobWithNullPostState = {
        id: `job-null-poststate-${invitationNullState.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: ws.id,
          invitationId: invitationNullState.id,
          email: invitationNullState.email,
          role: "AGENT",
          invitedById: owner.id,
        },
        _testPostState: null, // Injection explicite du cas null
      };

      const result = await processNotificationJob(jobWithNullPostState);

      // Le worker doit explicitement détecter que postState est null
      assert.equal(result.success, false);
      assert.equal(result.reason, "INVITATION_NOT_FOUND_POST_DISPATCH");

      // Vérifier qu'aucun log d'acceptation erronée n'a été créé (preuve de l'absence du bug undefined !== null)
      const falseAcceptanceAudit = await prisma.auditLog.findFirst({
        where: {
          workspaceId: ws.id,
          entityId: invitationNullState.id,
          action: "INVITATION_EMAIL_DISPATCHED_POST_ACCEPTANCE",
        },
      });
      assert.equal(
        falseAcceptanceAudit,
        null,
        "postState === null ne doit JAMAIS générer d'audit log POST_ACCEPTANCE"
      );
    });

    it("4. Une invitation non acceptée conserve son comportement normal", async () => {
      const jobNormal = {
        id: `job-normal-dispatch-${invitationNormal.id}`,
        name: "notification:invitation_email",
        data: {
          workspaceId: ws.id,
          invitationId: invitationNormal.id,
          email: invitationNormal.email,
          role: "AGENT",
          invitedById: owner.id,
        },
      };

      const result = await processNotificationJob(jobNormal);

      assert.equal(result.success, true);
      assert.equal(result.invitationId, invitationNormal.id);
      assert.ok(result.auditLogId, "Un AuditLog nominal doit être créé");

      // Vérifier la présence du log d'expédition nominal
      const audit = await prisma.auditLog.findUnique({
        where: { id: result.auditLogId },
      });
      assert.ok(audit);
      assert.equal(audit.action, "INVITATION_EMAIL_DISPATCHED");
    });
  });

  // =========================================================================
  // CORRECTION 3 — Concurrence lors du rejeu administratif Outbox
  // =========================================================================
  describe("Correction 3 — Réservation atomique persistante et concurrence du rejeu Outbox", () => {
    it("5. Deux demandes administratives simultanées ne peuvent pas réserver et traiter le même événement", async () => {
      const eventId1 = `evt-concurrent-1-${Date.now()}`;
      const eventId2 = `evt-concurrent-2-${Date.now()}`;

      // Insérer 2 événements avec le statut FAILED
      await prisma.outboxEvent.createMany({
        data: [
          {
            id: eventId1,
            workspaceId: ws.id,
            eventType: "notification:invitation_email",
            queueName: "notifications",
            jobName: "notification:invitation_email",
            payload: { invitationId: "inv-1" },
            status: "FAILED",
            attempts: 3,
          },
          {
            id: eventId2,
            workspaceId: ws.id,
            eventType: "notification:invitation_email",
            queueName: "notifications",
            jobName: "notification:invitation_email",
            payload: { invitationId: "inv-2" },
            status: "FAILED",
            attempts: 3,
          },
        ],
      });

      // Lancer 2 requêtes administratives simultanées (concurrence réelle via Promise.all)
      const [resA, resB] = await Promise.all([
        retryFailedOutboxEvents({
          userId: owner.id,
          workspaceId: ws.id,
          limit: 10,
        }),
        retryFailedOutboxEvents({
          userId: owner.id,
          workspaceId: ws.id,
          limit: 10,
        }),
      ]);

      const totalReplayed = resA.replayedCount + resB.replayedCount;

      // Exactement 2 événements doivent avoir été rejoués au total : aucun double traitement
      assert.equal(
        totalReplayed,
        2,
        `Le total des événements rejoués doit être exactement de 2 (resA: ${resA.replayedCount}, resB: ${resB.replayedCount})`
      );

      // Vérifier que les réservations sont strictement disjointes et sans chevauchement
      assert.ok(
        (resA.replayedCount === 2 && resB.replayedCount === 0) ||
        (resA.replayedCount === 0 && resB.replayedCount === 2) ||
        (resA.replayedCount === 1 && resB.replayedCount === 1),
        "Les réservations doivent être strictement disjointes et sans chevauchement"
      );

      // Vérifier l'état final en base : les 2 événements doivent être en PENDING, verrous libérés
      const rows = await prisma.outboxEvent.findMany({
        where: { id: { in: [eventId1, eventId2] } },
      });

      assert.equal(rows.length, 2);
      for (const row of rows) {
        assert.equal(row.status, "PENDING", "L'événement doit être remis en PENDING");
        assert.equal(row.attempts, 0, "Les tentatives doivent être réinitialisées à 0");
        assert.equal(row.lockedBy, null, "Le verrou doit être complètement libéré");
      }
    });

    it("6. Une réservation échouée ou abandonnée peut être récupérée selon le mécanisme prévu", async () => {
      const abandonedEventId = `evt-abandoned-${Date.now()}`;

      // Insérer un événement réservé par un worker disparu il y a 20 minutes (> timeout de 10 min)
      await prisma.outboxEvent.create({
        data: {
          id: abandonedEventId,
          workspaceId: ws.id,
          eventType: "notification:invitation_email",
          queueName: "notifications",
          jobName: "notification:invitation_email",
          payload: { invitationId: "inv-abandoned" },
          status: "PROCESSING",
          attempts: 1,
          lockedBy: "worker-crashed-dead",
          lockedAt: new Date(Date.now() - 20 * 60 * 1000),
        },
      });

      // Exécuter le rejeu administratif
      const res = await retryFailedOutboxEvents({
        userId: owner.id,
        workspaceId: ws.id,
        limit: 10,
        timeoutMinutes: 10,
      });

      // L'événement abandonné doit être récupéré et remis en PENDING
      assert.ok(res.replayedCount >= 1, "La réservation abandonnée doit être récupérée");

      const row = await prisma.outboxEvent.findUnique({
        where: { id: abandonedEventId },
      });

      assert.ok(row);
      assert.equal(row.status, "PENDING", "L'événement abandonné doit être débloqué vers PENDING");
      assert.equal(row.attempts, 0);
      assert.equal(row.lockedBy, null);
    });
  });
});

