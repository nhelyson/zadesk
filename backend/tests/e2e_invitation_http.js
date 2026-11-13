import http from "http";

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2E() {
  console.log("=================================================");
  console.log("🚀 TEST E2E HTTP — CYCLE COMPLET D'INVITATION & SYNCHRO");
  console.log("=================================================\n");

  const ts = Date.now().toString().slice(-6);

  // 1. Healthcheck
  const health = await makeRequest({
    hostname: "localhost",
    port: 4000,
    path: "/api/health",
    method: "GET",
  });
  console.log("1. Backend Healthcheck HTTP Status:", health.status, health.data.status);

  // 2. We can use Prisma to seed an active session for an admin to test API authentication
  const { prisma } = await import("../src/lib/prisma.js");
  const { createWorkspaceInvitation, acceptWorkspaceInvitation } = await import("../src/services/workspaceService.js");

  const adminEmail = `admin_e2e_${ts}@entreprise.ci`;
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      firstName: "Fatou",
      lastName: "Bamba",
      passwordHash: "hash_test_123",
      emailVerified: true,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: `Orange CI SAV ${ts}`,
      slug: `orange-ci-sav-${ts}`,
      supportEmail: adminEmail,
    },
  });

  await prisma.membership.create({
    data: {
      userId: admin.id,
      workspaceId: workspace.id,
      role: "ADMIN",
    },
  });

  // Create active session cookie for Admin
  const sessionToken = `session_admin_${ts}_${Date.now()}`;
  await prisma.session.create({
    data: {
      sessionToken,
      userId: admin.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`2. Administrateur créé : ${admin.firstName} ${admin.lastName} (${admin.email})`);
  console.log(`   Workspace SAV : ${workspace.name} (id: ${workspace.id})`);

  // 3. Admin creates an invitation via HTTP API POST /api/workspaces/:workspaceId/invitations
  const collaboratorEmail = `collaborateur_${ts}@orange.ci`;
  const inviteRes = await makeRequest(
    {
      hostname: "localhost",
      port: 4000,
      path: `/api/workspaces/${workspace.id}/invitations`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionToken}`,
      },
    },
    { email: collaboratorEmail, role: "AGENT" }
  );

  console.log("3. Création d'invitation HTTP (POST /api/workspaces/:id/invitations):", inviteRes.status);
  if ((inviteRes.status !== 200 && inviteRes.status !== 201) || !inviteRes.data?.invitation?.token) {
    throw new Error(`Échec création invitation: ${JSON.stringify(inviteRes.data)}`);
  }
  const token = inviteRes.data.invitation.token;
  console.log(`   Jeton sécurisé généré : ${token.substring(0, 10)}...`);

  // 4. Public endpoint GET /api/workspaces/invitations/:token
  const publicRes = await makeRequest({
    hostname: "localhost",
    port: 4000,
    path: `/api/workspaces/invitations/${token}`,
    method: "GET",
  });
  console.log("4. Consultation publique de l'invitation (GET /api/workspaces/invitations/:token):", publicRes.status);
  if (publicRes.status !== 200 || publicRes.data?.invitation?.email !== collaboratorEmail) {
    throw new Error(`Échec consultation invitation: ${JSON.stringify(publicRes.data)}`);
  }
  console.log(`   Nom de l'espace récupéré : ${publicRes.data.invitation.workspace.name}`);
  console.log(`   Rôle proposé : ${publicRes.data.invitation.role}`);

  // 5. Create collaborator user and login session
  const collaborator = await prisma.user.create({
    data: {
      email: collaboratorEmail,
      firstName: "Jean-Yves",
      lastName: "Kouadio",
      passwordHash: "hash_collaborateur_123",
      emailVerified: true,
    },
  });

  const collabSessionToken = `session_collab_${ts}_${Date.now()}`;
  await prisma.session.create({
    data: {
      sessionToken: collabSessionToken,
      userId: collaborator.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`5. Collaborateur authentifié : ${collaborator.firstName} ${collaborator.lastName} (${collaborator.email})`);

  // 6. Collaborator accepts invitation via HTTP API POST /api/workspaces/invitations/:token/accept
  const acceptRes = await makeRequest({
    hostname: "localhost",
    port: 4000,
    path: `/api/workspaces/invitations/${token}/accept`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${collabSessionToken}`,
    },
  });
  console.log("6. Acceptation HTTP (POST /api/workspaces/invitations/:token/accept):", acceptRes.status);
  if (acceptRes.status !== 200 || !acceptRes.data?.membership) {
    throw new Error(`Échec acceptation invitation: ${JSON.stringify(acceptRes.data)}`);
  }
  console.log("   Résultat:", acceptRes.data.message);

  // 7. Verification: Team members list GET /api/workspaces/:workspaceId/agent/team
  const teamRes = await makeRequest({
    hostname: "localhost",
    port: 4000,
    path: `/api/workspaces/${workspace.id}/agent/team`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${sessionToken}`,
    },
  });
  console.log("7. Synchronisation Équipe SAV (GET /api/workspaces/:id/agent/team):", teamRes.status);
  const team = teamRes.data?.team || [];
  console.log(`   Nombre de membres retournés : ${team.length}`);
  const foundCollab = team.find((m) => m.email === collaboratorEmail);
  if (!foundCollab) {
    throw new Error("Échec: Le nouveau collaborateur n'apparaît pas dans la liste des membres !");
  }
  console.log(`   ✅ Nouveau collaborateur trouvé : ${foundCollab.name} | Rôle: ${foundCollab.role} | Titre: ${foundCollab.title}`);

  // 8. Verification: Invitations list GET /api/workspaces/:workspaceId/invitations
  const listInvitesRes = await makeRequest({
    hostname: "localhost",
    port: 4000,
    path: `/api/workspaces/${workspace.id}/invitations`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${sessionToken}`,
    },
  });
  console.log("8. Consultation des invitations envoyées (GET /api/workspaces/:id/invitations):", listInvitesRes.status);
  const invites = listInvitesRes.data?.invitations || [];
  const acceptedInvite = invites.find((i) => i.email === collaboratorEmail);
  if (!acceptedInvite || acceptedInvite.status !== "ACCEPTED") {
    throw new Error(`Échec: Le statut de l'invitation n'est pas ACCEPTED (${acceptedInvite?.status})`);
  }
  console.log(`   ✅ Statut de l'invitation en base : ${acceptedInvite.status} (Acceptée)`);

  // Cleanup
  await prisma.session.deleteMany({ where: { userId: { in: [admin.id, collaborator.id] } } });
  await prisma.workspaceInvitation.deleteMany({ where: { workspaceId: workspace.id } });
  await prisma.agentProfile.deleteMany({ where: { workspaceId: workspace.id } });
  await prisma.membership.deleteMany({ where: { workspaceId: workspace.id } });
  await prisma.workspace.deleteMany({ where: { id: workspace.id } });
  await prisma.user.deleteMany({ where: { id: { in: [admin.id, collaborator.id] } } });

  console.log("\n=================================================");
  console.log("🎉 LE CYCLE D'INVITATION DE BOUT EN BOUT FONCTIONNE PARFAITEMENT !");
  console.log("=================================================");
}

runE2E().catch((e) => {
  console.error("FATAL E2E ERROR:", e);
  process.exit(1);
});
