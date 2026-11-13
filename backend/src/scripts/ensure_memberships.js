import { prisma } from "../lib/prisma.js";
import { ensureWorkspaceAgentSeed } from "../services/agentSeedService.js";
import { cacheService } from "../cache/cacheService.js";

async function run() {
  console.log("Checking and syncing workspace memberships...");

  // 1. Get or create primary workspace
  let workspace = await prisma.workspace.findFirst({
    where: {
      OR: [
        { slug: "zadesk-entreprise" },
        { slug: "express-union-congo" },
        { name: "Express Union Congo" },
      ],
    },
  });

  if (!workspace) {
    workspace = await prisma.workspace.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Zadesk Entreprise",
        slug: "zadesk-entreprise",
      },
    });
  }

  console.log(`Using primary workspace: ${workspace.name} (${workspace.id})`);

  // 2. Fetch all users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} registered users.`);

  for (const user of users) {
    // Upsert membership
    const membership = await prisma.membership.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });
    console.log(`Linked user ${user.email} (${user.id}) to ${workspace.name} as ${membership.role}`);

    // Seed agent profile and tickets
    await ensureWorkspaceAgentSeed(workspace.id, user.id);
  }

  // 3. Clear redis cache
  try {
    await cacheService.flush();
    console.log("Cache cleared successfully.");
  } catch (err) {
    console.warn("Could not flush cache:", err.message);
  }

  console.log("Sync completed successfully!");
}

run()
  .catch((err) => {
    console.error("Error running script:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
