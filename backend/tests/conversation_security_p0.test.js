import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { COOKIE_NAME } from "../src/config/constants.js";
import { ROLES } from "../src/security/permissions.js";
import { createSession } from "../src/services/sessionService.js";
import { canAgentViewEvent, publishPulseMessageEvent, PULSE_EVENT_TYPES } from "../src/services/pulseEventService.js";
import { savePublicChatAttachments } from "../src/utils/chatAttachments.js";
import * as agentService from "../src/services/agentService.js";

describe("P0 Sécurité Conversations — Visibilité, Écriture, Notes Internes, SSE & Isolation", () => {
  const ts = Date.now();
  const authCookie = (token) => `${COOKIE_NAME}=${token}`;

  let wsA, wsB;
  let ownerA, managerA, agentA1, agentA2, agentA3, ownerB;
  let tokOwnerA, tokManagerA, tokAgentA1, tokAgentA2, tokAgentA3, tokOwnerB;

  let convA1Private; // Assignée à agentA1 uniquement (+ note interne + pièce jointe)
  let convA2ReadOnly; // Assignée à agentA1, partagée READ_ONLY avec agentA2
  let convA3Contribute; // Assignée à agentA1, partagée CONTRIBUTE avec agentA2
  let convUnassigned; // Non affectée (assignedAgentId = null)
  let convLegacyNoToken; // publicTokenHash = null (legacy)
  let convWsB; // Appartient à wsB

  const rawClientTokenA1 = crypto.randomBytes(32).toString("hex");
  const hashClientTokenA1 = crypto.createHash("sha256").update(rawClientTokenA1).digest("hex");
  let savedAttachmentFileName = null;

  before(async () => {
    [ownerA, managerA, agentA1, agentA2, agentA3, ownerB] = await Promise.all([
      prisma.user.create({
        data: { email: `p0-owner-a-${ts}@test.cg`, firstName: "Patron", lastName: "Alpha", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `p0-manager-a-${ts}@test.cg`, firstName: "Marie", lastName: "Superviseure", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `p0-agent1-a-${ts}@test.cg`, firstName: "Moussa", lastName: "Diallo", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `p0-agent2-a-${ts}@test.cg`, firstName: "Amina", lastName: "Kone", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `p0-agent3-a-${ts}@test.cg`, firstName: "Claire", lastName: "Mbemba", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `p0-owner-b-${ts}@test.cg`, firstName: "Patron", lastName: "Beta", emailVerified: true },
      }),
    ]);

    wsA = await prisma.workspace.create({
      data: {
        name: `P0 Entreprise A ${ts}`,
        slug: `p0-ws-a-${ts}`,
        isPublic: true,
        memberships: {
          create: [
            { userId: ownerA.id, role: ROLES.OWNER, status: "ACTIVE" },
            { userId: managerA.id, role: ROLES.MANAGER, status: "ACTIVE" },
            { userId: agentA1.id, role: ROLES.AGENT, status: "ACTIVE" },
            { userId: agentA2.id, role: ROLES.AGENT, status: "ACTIVE" },
            { userId: agentA3.id, role: ROLES.AGENT, status: "ACTIVE" },
          ],
        },
      },
    });

    wsB = await prisma.workspace.create({
      data: {
        name: `P0 Entreprise B ${ts}`,
        slug: `p0-ws-b-${ts}`,
        isPublic: true,
        memberships: {
          create: [
            { userId: ownerB.id, role: ROLES.OWNER, status: "ACTIVE" },
            // agentA1 est aussi membre de wsB avec rôle AGENT pour tester l'isolation push/workspace
            { userId: agentA1.id, role: ROLES.AGENT, status: "ACTIVE" },
          ],
        },
      },
    });

    const [sOwnerA, sManagerA, sA1, sA2, sA3, sOwnerB] = await Promise.all([
      createSession(ownerA.id),
      createSession(managerA.id),
      createSession(agentA1.id),
      createSession(agentA2.id),
      createSession(agentA3.id),
      createSession(ownerB.id),
    ]);
    tokOwnerA = sOwnerA.sessionToken;
    tokManagerA = sManagerA.sessionToken;
    tokAgentA1 = sA1.sessionToken;
    tokAgentA2 = sA2.sessionToken;
    tokAgentA3 = sA3.sessionToken;
    tokOwnerB = sOwnerB.sessionToken;

    [convA1Private, convA2ReadOnly, convA3Contribute, convUnassigned, convLegacyNoToken, convWsB] =
      await Promise.all([
        prisma.conversation.create({
          data: {
            workspaceId: wsA.id,
            assignedAgentId: agentA1.id,
            customerName: "Client Prive A1",
            channel: "PORTAL",
            status: "ACTIVE",
            publicTokenHash: hashClientTokenA1,
          },
        }),
        prisma.conversation.create({
          data: {
            workspaceId: wsA.id,
            assignedAgentId: agentA1.id,
            customerName: "Client Partage Lecture",
            channel: "PORTAL",
            status: "ACTIVE",
          },
        }),
        prisma.conversation.create({
          data: {
            workspaceId: wsA.id,
            assignedAgentId: agentA1.id,
            customerName: "Client Partage Contrib",
            channel: "PORTAL",
            status: "ACTIVE",
          },
        }),
        prisma.conversation.create({
          data: {
            workspaceId: wsA.id,
            assignedAgentId: null,
            customerName: "Client Non Affecte",
            channel: "PORTAL",
            status: "WAITING_ASSIGNMENT",
          },
        }),
        prisma.conversation.create({
          data: {
            workspaceId: wsA.id,
            assignedAgentId: agentA1.id,
            customerName: "Client Legacy Sans Token",
            channel: "PORTAL",
            status: "ACTIVE",
            publicTokenHash: null,
          },
        }),
        prisma.conversation.create({
          data: {
            workspaceId: wsB.id,
            assignedAgentId: ownerB.id,
            customerName: "Client Confidentiel B",
            channel: "PORTAL",
            status: "ACTIVE",
          },
        }),
      ]);

    await prisma.conversationShare.createMany({
      data: [
        {
          conversationId: convA2ReadOnly.id,
          agentId: agentA2.id,
          sharedById: agentA1.id,
          accessLevel: "READ_ONLY",
        },
        {
          conversationId: convA3Contribute.id,
          agentId: agentA2.id,
          sharedById: agentA1.id,
          accessLevel: "CONTRIBUTE",
        },
      ],
    });

    await prisma.conversationMessage.createMany({
      data: [
        {
          conversationId: convA1Private.id,
          senderType: "CUSTOMER",
          senderName: "Client Prive A1",
          content: "Bonjour, voici ma facture.",
          isInternalNote: false,
        },
        {
          conversationId: convA1Private.id,
          senderId: agentA1.id,
          senderType: "INTERNAL_NOTE",
          senderName: "Moussa Diallo",
          content: "NOTE_INTERNE_SECRETE_A1 : risque fraude à vérifier.",
          isInternalNote: true,
        },
        {
          conversationId: convA1Private.id,
          senderId: agentA1.id,
          senderType: "AGENT_REPLY",
          senderName: "Moussa Diallo",
          content: "Nous vérifions votre dossier.",
          isInternalNote: false,
        },
        {
          conversationId: convUnassigned.id,
          senderType: "CUSTOMER",
          senderName: "Client Non Affecte",
          content: "Message confidentiel en file d'attente",
          isInternalNote: false,
        },
        {
          conversationId: convLegacyNoToken.id,
          senderType: "CUSTOMER",
          senderName: "Client Legacy Sans Token",
          content: "Historique legacy sensible",
          isInternalNote: false,
        },
      ],
    });

    const tinyPngBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const saved = await savePublicChatAttachments(convA1Private.id, [
      { name: "preuve.png", type: "image/png", dataBase64: tinyPngBase64 },
    ]);
    savedAttachmentFileName = saved[0].fileName;
  });

  after(async () => {
    if (convA1Private?.id) {
      const uploadDir = path.resolve(process.cwd(), "uploads/chat-attachments", convA1Private.id);
      await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
    }
    await prisma.workspace.deleteMany({
      where: { id: { in: [wsA?.id, wsB?.id].filter(Boolean) } },
    });
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [ownerA?.id, managerA?.id, agentA1?.id, agentA2?.id, agentA3?.id, ownerB?.id].filter(
            Boolean
          ),
        },
      },
    });
  });

  describe("Consultation & Routes Workspace", () => {
    it("1. Un agent consulte sa propre conversation (liste + détail) et reçoit assignedAgent structuré", async () => {
      const listRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(listRes.status, 200);
      const ids = listRes.body.conversations.map((c) => c.id);
      assert.ok(ids.includes(convA1Private.id));

      const detailRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(detailRes.status, 200);
      assert.equal(detailRes.body.conversation.assignedAgent.id, agentA1.id);
      assert.equal(detailRes.body.conversation.assignedAgent.firstName, "Moussa");
    });

    it("2. Un agent consulte une conversation partagée en READ_ONLY", async () => {
      const listRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations`)
        .set("Cookie", authCookie(tokAgentA2));
      assert.equal(listRes.status, 200);
      const sharedItem = listRes.body.conversations.find((c) => c.id === convA2ReadOnly.id);
      assert.ok(sharedItem);
      assert.equal(sharedItem.myAccessLevel, "READ_ONLY");

      const detailRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations/${convA2ReadOnly.id}`)
        .set("Cookie", authCookie(tokAgentA2));
      assert.equal(detailRes.status, 200);
      assert.equal(detailRes.body.conversation.myAccessLevel, "READ_ONLY");
    });

    it("3. Un agent ne consulte pas la conversation privée d'un autre agent (ni via /agent ni via /workspaces)", async () => {
      const detailRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}`)
        .set("Cookie", authCookie(tokAgentA3));
      assert.equal(detailRes.status, 403);

      const wsListRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/conversations`)
        .set("Cookie", authCookie(tokAgentA3));
      assert.equal(wsListRes.status, 403);

      const wsDashRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/dashboard`)
        .set("Cookie", authCookie(tokAgentA3));
      assert.equal(wsDashRes.status, 403);
    });

    it("4. Un agent ne consulte pas une conversation non affectée", async () => {
      const listRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations`)
        .set("Cookie", authCookie(tokAgentA3));
      assert.equal(listRes.status, 200);
      assert.equal(listRes.body.conversations.some((c) => c.id === convUnassigned.id), false);

      const detailRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations/${convUnassigned.id}`)
        .set("Cookie", authCookie(tokAgentA3));
      assert.equal(detailRes.status, 403);
    });

    it("9. Un manager conserve sa visibilité de supervision (/agent/conversations et /workspaces/:id/conversations)", async () => {
      const agentRouteRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations`)
        .set("Cookie", authCookie(tokManagerA));
      assert.equal(agentRouteRes.status, 200);
      const ids = agentRouteRes.body.conversations.map((c) => c.id);
      assert.ok(ids.includes(convA1Private.id));
      assert.ok(ids.includes(convUnassigned.id));

      const wsRouteRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/conversations`)
        .set("Cookie", authCookie(tokManagerA));
      assert.equal(wsRouteRes.status, 200);
      assert.ok(wsRouteRes.body.conversations.some((c) => c.id === convA1Private.id));

      const wsDashRes = await request(app)
        .get(`/api/workspaces/${wsA.id}/dashboard`)
        .set("Cookie", authCookie(tokManagerA));
      assert.equal(wsDashRes.status, 200);
    });

    it("10. Un utilisateur ne peut pas accéder à une conversation d'un autre workspace", async () => {
      const crossWsAccess = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}`)
        .set("Cookie", authCookie(tokOwnerB));
      assert.equal(crossWsAccess.status, 403);

      // Même si agentA1 est membre de wsB, passer convA1Private (wsA) sous wsB doit échouer (404)
      const crossConvInWsB = await request(app)
        .get(`/api/workspaces/${wsB.id}/agent/conversations/${convA1Private.id}`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(crossConvInWsB.status, 404);
    });

    it("13. Les listes API ne contiennent aucune conversation interdite pour agentA2 et agentA3", async () => {
      const resA3 = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations`)
        .set("Cookie", authCookie(tokAgentA3));
      assert.equal(resA3.status, 200);
      assert.equal(resA3.body.conversations.length, 0);

      const resA2 = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations`)
        .set("Cookie", authCookie(tokAgentA2));
      assert.equal(resA2.status, 200);
      const idsA2 = resA2.body.conversations.map((c) => c.id).sort();
      assert.deepEqual(idsA2, [convA2ReadOnly.id, convA3Contribute.id].sort());
    });
  });

  describe("Envoi des messages, Notes internes & Pièces jointes", () => {
    it("5. Un agent avec partage CONTRIBUTE peut répondre", async () => {
      const res = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/conversations/${convA3Contribute.id}/messages`)
        .set("Cookie", authCookie(tokAgentA2))
        .send({ content: "Réponse autorisée en CONTRIBUTE", isInternalNote: false });
      assert.equal(res.status, 200);
      const sentMessage = res.body.message || res.body.data?.message;
      assert.equal(sentMessage.senderId, agentA2.id);
    });

    it("6. Un agent avec partage READ_ONLY NE PEUT PAS répondre ni poster de note interne", async () => {
      const beforeCount = await prisma.conversationMessage.count({
        where: { conversationId: convA2ReadOnly.id },
      });

      const replyRes = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/conversations/${convA2ReadOnly.id}/messages`)
        .set("Cookie", authCookie(tokAgentA2))
        .send({ content: "Tentative READ_ONLY", isInternalNote: false });
      assert.equal(replyRes.status, 403);

      const noteRes = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/conversations/${convA2ReadOnly.id}/messages`)
        .set("Cookie", authCookie(tokAgentA2))
        .send({ content: "Note READ_ONLY interdite", isInternalNote: true });
      assert.equal(noteRes.status, 403);

      const afterCount = await prisma.conversationMessage.count({
        where: { conversationId: convA2ReadOnly.id },
      });
      assert.equal(afterCount, beforeCount);
    });

    it("7. Un agent non autorisé NE PEUT PAS envoyer de message (y compris via customer-messages)", async () => {
      const beforeCount = await prisma.conversationMessage.count({
        where: { conversationId: convA1Private.id },
      });

      const msgRes = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}/messages`)
        .set("Cookie", authCookie(tokAgentA3))
        .send({ content: "Intrusion agentA3", isInternalNote: false });
      assert.equal(msgRes.status, 403);

      const custRes = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}/customer-messages`)
        .set("Cookie", authCookie(tokAgentA3))
        .send({ content: "Injection client interdite" });
      assert.equal(custRes.status, 403);

      // Envoi vers un autre workspace également bloqué
      const crossSendRes = await request(app)
        .post(`/api/workspaces/${wsB.id}/agent/conversations/${convA1Private.id}/messages`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ content: "Cross-workspace spoof" });
      assert.equal(crossSendRes.status, 404);

      const afterCount = await prisma.conversationMessage.count({
        where: { conversationId: convA1Private.id },
      });
      assert.equal(afterCount, beforeCount);
    });

    it("8. Un agent non autorisé NE PEUT PAS ajouter de note interne", async () => {
      const beforeNotes = await prisma.conversationMessage.count({
        where: { conversationId: convA1Private.id, isInternalNote: true },
      });

      const res = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}/messages`)
        .set("Cookie", authCookie(tokAgentA3))
        .send({ content: "Note interne pirate", isInternalNote: true });
      assert.equal(res.status, 403);

      // Test au niveau service également (même sans userRole passé)
      await assert.rejects(
        async () => {
          await agentService.sendConversationMessage(wsA.id, convA1Private.id, agentA3.id, {
            content: "Appel service direct non autorisé",
            isInternalNote: true,
          });
        },
        (err) => err.status === 403
      );

      const afterNotes = await prisma.conversationMessage.count({
        where: { conversationId: convA1Private.id, isInternalNote: true },
      });
      assert.equal(afterNotes, beforeNotes);
    });

    it("11. Un client public ne reçoit jamais une note interne et les conversations legacy sans token sont refusées", async () => {
      const publicRes = await request(app)
        .get(`/api/public/companies/${wsA.slug}/chat/${convA1Private.id}`)
        .set("x-conversation-token", rawClientTokenA1);
      assert.equal(publicRes.status, 200);
      const msgs = publicRes.body.data?.messages || publicRes.body.messages || [];
      assert.equal(msgs.length, 2);
      assert.equal(msgs.some((m) => String(m.content).includes("NOTE_INTERNE_SECRETE_A1")), false);

      // Accès legacy publicTokenHash = null refusé sans authentification
      const legacyRead = await request(app).get(
        `/api/public/companies/${wsA.slug}/chat/${convLegacyNoToken.id}`
      );
      assert.equal(legacyRead.status, 403);

      const legacyWrite = await request(app)
        .post(`/api/public/companies/${wsA.slug}/chat`)
        .send({ conversationId: convLegacyNoToken.id, message: "Tentative de capture legacy" });
      assert.equal(legacyWrite.status, 403);
    });

    it("12. Un agent non autorisé ne reçoit pas le contenu d'une note interne via SSE / Pulse", async () => {
      assert.equal(
        canAgentViewEvent(
          {
            type: PULSE_EVENT_TYPES.MESSAGE_CREATED,
            conversationId: convA1Private.id,
            assignedAgentId: agentA1.id,
            isInternalNote: true,
            contentPreview: "NOTE_INTERNE_SECRETE_A1",
          },
          agentA3.id,
          ROLES.AGENT,
          new Set()
        ),
        false
      );

      // Conversation non affectée ne doit pas fuiter vers AGENT
      assert.equal(
        canAgentViewEvent(
          {
            type: PULSE_EVENT_TYPES.CONVERSATION_CREATED,
            conversationId: convUnassigned.id,
            assignedAgentId: null,
            contentPreview: "Message confidentiel",
          },
          agentA3.id,
          ROLES.AGENT,
          new Set()
        ),
        false
      );

      // Vérification flux SSE réel : agentA3 connecté sur SSE ne reçoit pas l'événement interne de convA1Private
      const server = app.listen(0);
      const { port } = server.address();
      const receivedChunks = [];
      const controller = new AbortController();

      try {
        const response = await fetch(
          `http://127.0.0.1:${port}/api/workspaces/${wsA.id}/agent/pulse/stream`,
          {
            headers: { Cookie: authCookie(tokAgentA3) },
            signal: controller.signal,
          }
        );
        assert.equal(response.status, 200);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Lire le handshake initial
        const firstRead = await reader.read();
        receivedChunks.push(decoder.decode(firstRead.value || new Uint8Array()));

        // Publier un événement note interne sur convA1Private (privée agentA1)
        await publishPulseMessageEvent(wsA.id, {
          conversationId: convA1Private.id,
          messageId: `sse-msg-${ts}`,
          senderType: "INTERNAL_NOTE",
          senderName: "Moussa Diallo",
          content: "NOTE_SSE_ULTRA_SECRETE",
          isInternalNote: true,
          assignedAgentId: agentA1.id,
        });

        // Attendre brièvement si un chunk erroné arrivait
        const raceResult = await Promise.race([
          reader.read().then((r) => decoder.decode(r.value || new Uint8Array())),
          new Promise((resolve) => setTimeout(() => resolve(""), 250)),
        ]);
        if (raceResult) receivedChunks.push(raceResult);
      } finally {
        controller.abort();
        await new Promise((resolve) => server.close(resolve));
      }

      const fullStreamText = receivedChunks.join("");
      assert.equal(fullStreamText.includes("NOTE_SSE_ULTRA_SECRETE"), false);
    });

    it("14. Les pièces jointes restent protégées (agent autorisé 200, non autorisé 403, cross-workspace 404, public token 200/403)", async () => {
      const okAgent = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}/attachments/${savedAttachmentFileName}`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(okAgent.status, 200);

      const forbiddenAgent = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/conversations/${convA1Private.id}/attachments/${savedAttachmentFileName}`)
        .set("Cookie", authCookie(tokAgentA3));
      assert.equal(forbiddenAgent.status, 403);

      const crossWs = await request(app)
        .get(`/api/workspaces/${wsB.id}/agent/conversations/${convA1Private.id}/attachments/${savedAttachmentFileName}`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(crossWs.status, 404);

      const publicBadToken = await request(app)
        .get(`/api/public/companies/${wsA.slug}/chat/${convA1Private.id}/attachments/${savedAttachmentFileName}?token=wrong`);
      assert.equal(publicBadToken.status, 403);

      const publicGoodToken = await request(app)
        .get(`/api/public/companies/${wsA.slug}/chat/${convA1Private.id}/attachments/${savedAttachmentFileName}?token=${rawClientTokenA1}`);
      assert.equal(publicGoodToken.status, 200);
    });
  });

  describe("Isolation Push par Workspace", () => {
    it("15. Les souscriptions Push d'un agent dans wsA sont isolées de wsB (lecture et suppression)", async () => {
      const subA = {
        endpoint: `https://push.example.com/sub-a-${ts}`,
        keys: { p256dh: "key-a", auth: "auth-a" },
      };
      const regA = await request(app)
        .post(`/api/workspaces/${wsA.id}/agent/push/subscribe`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({ subscription: subA });
      assert.equal(regA.status, 200);

      const statusB = await request(app)
        .get(`/api/workspaces/${wsB.id}/agent/push/status`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(statusB.status, 200);
      assert.equal(statusB.body.subscribed ?? statusB.body.data?.subscribed, false);
      assert.equal(statusB.body.deviceCount ?? statusB.body.data?.deviceCount, 0);

      // La suppression globale dans wsB ne doit pas supprimer l'abonnement de wsA
      await request(app)
        .delete(`/api/workspaces/${wsB.id}/agent/push/subscribe`)
        .set("Cookie", authCookie(tokAgentA1))
        .send({});

      const statusAAfter = await request(app)
        .get(`/api/workspaces/${wsA.id}/agent/push/status`)
        .set("Cookie", authCookie(tokAgentA1));
      assert.equal(statusAAfter.status, 200);
      assert.equal(statusAAfter.body.subscribed ?? statusAAfter.body.data?.subscribed, true);
      assert.equal(statusAAfter.body.deviceCount ?? statusAAfter.body.data?.deviceCount, 1);
    });
  });
});
