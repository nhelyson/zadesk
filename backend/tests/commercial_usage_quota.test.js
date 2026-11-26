import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { COOKIE_NAME } from "../src/config/constants.js";
import { ROLES } from "../src/security/permissions.js";
import { createSession } from "../src/services/sessionService.js";
import { getWorkspaceUsageSummary } from "../src/services/commercialService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ATTACHMENTS_ROOT = path.resolve(__dirname, "../uploads/chat-attachments");

describe("Quotas & Consommation en direct (GET /api/commercial/usage)", () => {
  const ts = Date.now();
  let wsA, wsB;
  let ownerA, ownerB;
  let tokOwnerA, tokOwnerB;
  let convA;
  let testAttachmentDir;

  const authCookie = (token) => `${COOKIE_NAME}=${token}`;

  before(async () => {
    [ownerA, ownerB] = await Promise.all([
      prisma.user.create({
        data: { email: `cu-owner-a-${ts}@test.cg`, firstName: "Patron", lastName: "A", emailVerified: true },
      }),
      prisma.user.create({
        data: { email: `cu-owner-b-${ts}@test.cg`, firstName: "Patron", lastName: "B", emailVerified: true },
      }),
    ]);

    [wsA, wsB] = await Promise.all([
      prisma.workspace.create({
        data: {
          name: `Usage WS A ${ts}`,
          slug: `cu-ws-a-${ts}`,
          memberships: {
            create: [{ userId: ownerA.id, role: ROLES.OWNER }],
          },
          establishments: {
            create: [
              {
                name: "Siège Principal A",
                type: "HEADQUARTERS",
                isMain: true,
                address: "10 Avenue de la Paix",
                city: "Brazzaville",
              },
            ],
          },
        },
      }),
      prisma.workspace.create({
        data: {
          name: `Usage WS B ${ts}`,
          slug: `cu-ws-b-${ts}`,
          memberships: {
            create: [{ userId: ownerB.id, role: ROLES.OWNER }],
          },
        },
      }),
    ]);

    convA = await prisma.conversation.create({
      data: {
        workspaceId: wsA.id,
        customerName: "Client Test Quota",
        status: "ACTIVE",
      },
    });

    // Simulate real attachment bytes on disk (~1.5 Mo)
    testAttachmentDir = path.resolve(ATTACHMENTS_ROOT, convA.id);
    await fs.mkdir(testAttachmentDir, { recursive: true });
    const fakePdf = Buffer.alloc(1.5 * 1024 * 1024, 0x41);
    await fs.writeFile(path.join(testAttachmentDir, "facture-test.pdf"), fakePdf);

    const [sA, sB] = await Promise.all([
      createSession(ownerA.id),
      createSession(ownerB.id),
    ]);
    tokOwnerA = sA.sessionToken;
    tokOwnerB = sB.sessionToken;
  });

  after(async () => {
    if (testAttachmentDir) {
      await fs.rm(testAttachmentDir, { recursive: true, force: true }).catch(() => {});
    }
    const wsIds = [wsA?.id, wsB?.id].filter(Boolean);
    const userIds = [ownerA?.id, ownerB?.id].filter(Boolean);
    if (wsIds.length > 0) {
      await prisma.conversation.deleteMany({ where: { workspaceId: { in: wsIds } } }).catch(() => {});
      await prisma.establishment.deleteMany({ where: { workspaceId: { in: wsIds } } }).catch(() => {});
      await prisma.subscription.deleteMany({ where: { workspaceId: { in: wsIds } } }).catch(() => {});
      await prisma.membership.deleteMany({ where: { workspaceId: { in: wsIds } } }).catch(() => {});
      await prisma.workspace.deleteMany({ where: { id: { in: wsIds } } }).catch(() => {});
    }
    if (userIds.length > 0) {
      await prisma.session.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: { in: userIds } } }).catch(() => {});
    }
  });

  it("1. Bloque les requêtes non authentifiées (401) et multi-tenant (403)", async () => {
    const unauth = await request(app).get(`/api/commercial/usage?workspaceId=${wsA.id}`);
    assert.equal(unauth.status, 401);

    const cross = await request(app)
      .get(`/api/commercial/usage?workspaceId=${wsA.id}`)
      .set("Cookie", authCookie(tokOwnerB));
    assert.equal(cross.status, 403);
  });

  it("2. Forfait Découverte : détecte 1/1 collaborateur (100% REACHED), 1/1 établissement (REACHED) et stockage réel sur disque", async () => {
    const res = await request(app)
      .get(`/api/commercial/usage?workspaceId=${wsA.id}`)
      .set("Cookie", authCookie(tokOwnerA));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const usage = res.body.usage;
    assert.equal(usage.plan.id, "DECOUVERTE");
    assert.equal(usage.plan.nextRecommendedPlanId, "STARTER");

    assert.equal(usage.metrics.agents.used, 1);
    assert.equal(usage.metrics.agents.limit, 1);
    assert.equal(usage.metrics.agents.percentage, 100);
    assert.equal(usage.metrics.agents.status, "REACHED");

    assert.equal(usage.metrics.establishments.used, 1);
    assert.equal(usage.metrics.establishments.limit, 1);
    assert.equal(usage.metrics.establishments.status, "REACHED");

    // 1.5 Mo / 500 Mo -> ~0.3% OK
    assert.ok(usage.metrics.storage.used >= 1.49 && usage.metrics.storage.used <= 1.55);
    assert.equal(usage.metrics.storage.limit, 500);
    assert.equal(usage.metrics.storage.breakdown.attachmentFilesCount, 1);
    assert.equal(usage.metrics.storage.status, "OK");

    assert.equal(usage.globalSeverity, "REACHED");
    assert.equal(usage.alerts.length, 2);
  });

  it("3. Passage à PRO : recalcule les quotas et lève les alertes", async () => {
    await prisma.subscription.create({
      data: {
        workspaceId: wsA.id,
        plan: "PRO",
        status: "ACTIVE",
        activePriceXaf: 45000,
      },
    });

    const usage = await getWorkspaceUsageSummary(wsA.id);
    assert.equal(usage.plan.id, "PRO");
    assert.equal(usage.metrics.agents.used, 1);
    assert.equal(usage.metrics.agents.limit, 5);
    assert.equal(usage.metrics.agents.percentage, 20);
    assert.equal(usage.metrics.agents.status, "OK");

    assert.equal(usage.metrics.establishments.used, 1);
    assert.equal(usage.metrics.establishments.limit, 3);
    assert.equal(usage.metrics.establishments.status, "OK");
    assert.equal(usage.metrics.storage.limit, 10240);
    assert.equal(usage.globalSeverity, "OK");
    assert.equal(usage.alerts.length, 0);
  });

  it("4. Formule ENTREPRISE : marque agents et établissements en illimité", async () => {
    await prisma.subscription.update({
      where: { workspaceId: wsA.id },
      data: { plan: "ENTREPRISE", activePriceXaf: 150000 },
    });

    const usage = await getWorkspaceUsageSummary(wsA.id);
    assert.equal(usage.metrics.agents.unlimited, true);
    assert.equal(usage.metrics.agents.limit, null);
    assert.equal(usage.metrics.agents.status, "OK");
    assert.equal(usage.metrics.establishments.unlimited, true);
    assert.equal(usage.metrics.storage.limit, 51200);
  });
});
