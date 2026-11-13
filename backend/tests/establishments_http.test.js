import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { createSession } from "../src/services/sessionService.js";

describe("Establishments HTTP API & Endpoints Tests", () => {
  let ws;
  let owner;
  let sessionToken = "";
  let establishmentId = "";

  before(async () => {
    // Clean up
    await prisma.establishment.deleteMany({
      where: { workspace: { slug: "test-estab-http-ws" } },
    });
    await prisma.workspace.deleteMany({
      where: { slug: "test-estab-http-ws" },
    });
    await prisma.user.deleteMany({
      where: { email: "owner-estab-http@test.com" },
    });

    owner = await prisma.user.create({
      data: {
        email: "owner-estab-http@test.com",
        firstName: "Boss",
        lastName: "Owner",
        emailVerified: true,
      },
    });

    ws = await prisma.workspace.create({
      data: {
        name: "Congo Tech SAV",
        normalizedName: "congo tech sav",
        slug: "test-estab-http-ws",
        isPublic: true,
        address: "50 Boulevard Denis Sassou Nguesso",
        city: "Brazzaville",
        country: "Congo",
        supportPhone: "+242 06 999 88 77",
        memberships: {
          create: {
            userId: owner.id,
            role: "OWNER",
          },
        },
      },
    });

    // Create session directly
    const session = await createSession(owner.id);
    sessionToken = session.sessionToken;
  });

  after(async () => {
    await prisma.establishment.deleteMany({
      where: { workspaceId: ws.id },
    });
    await prisma.session.deleteMany({
      where: { userId: owner.id },
    });
    await prisma.workspace.deleteMany({
      where: { id: ws.id },
    });
    await prisma.user.deleteMany({
      where: { id: owner.id },
    });
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 100);
  });

  it("GET /api/workspaces/:id/establishments sans token renvoie 401", async () => {
    const res = await request(app).get(`/api/workspaces/${ws.id}/establishments`);
    assert.strictEqual(res.status, 401);
  });

  it("GET /api/workspaces/:id/establishments avec token renvoie la liste et auto-migre le siège", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${ws.id}/establishments`)
      .set("Authorization", `Bearer ${sessionToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(Array.isArray(res.body.establishments), true);
    assert.strictEqual(res.body.establishments.length, 1);
    assert.strictEqual(res.body.establishments[0].type, "HEADQUARTERS");
    assert.strictEqual(res.body.establishments[0].isMain, true);
  });

  it("POST /api/workspaces/:id/establishments crée un nouvel établissement", async () => {
    const res = await request(app)
      .post(`/api/workspaces/${ws.id}/establishments`)
      .set("Authorization", `Bearer ${sessionToken}`)
      .send({
        name: "Guichet SAV Poto-Poto",
        type: "SERVICE_POINT",
        address: "Rue Mbaka, Marché Poto-Poto",
        city: "Brazzaville",
        phone: "+242 06 444 33 22",
        services: ["Dépôt Matériel", "Diagnostic"],
        isPublic: true,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.establishment.id);
    establishmentId = res.body.establishment.id;
    assert.strictEqual(res.body.establishment.name, "Guichet SAV Poto-Poto");
  });

  it("PATCH /api/workspaces/:id/establishments/:id modifie l'établissement", async () => {
    const res = await request(app)
      .patch(`/api/workspaces/${ws.id}/establishments/${establishmentId}`)
      .set("Authorization", `Bearer ${sessionToken}`)
      .send({
        description: "Comptoir de proximité ouvert du Lundi au Samedi",
        phone: "+242 06 444 33 00",
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.establishment.description, "Comptoir de proximité ouvert du Lundi au Samedi");
    assert.strictEqual(res.body.establishment.phone, "+242 06 444 33 00");
  });

  it("GET /api/public/companies/:slug expose les établissements publics", async () => {
    const res = await request(app).get(`/api/public/companies/test-estab-http-ws`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.company.establishments);
    assert.strictEqual(res.body.company.establishments.length, 2);
  });

  it("DELETE /api/workspaces/:id/establishments/:id supprime l'établissement", async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${ws.id}/establishments/${establishmentId}`)
      .set("Authorization", `Bearer ${sessionToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    const listRes = await request(app)
      .get(`/api/workspaces/${ws.id}/establishments`)
      .set("Authorization", `Bearer ${sessionToken}`);

    assert.strictEqual(listRes.body.establishments.length, 1);
  });
});

