import { prisma } from "../lib/prisma.js";
import { cacheService } from "../cache/cacheService.js";

async function purgeAllUsers() {
  console.log("=== Début de la purge des utilisateurs Zadesk ===");

  try {
    const userCountBefore = await prisma.user.count();
    console.log(`Nombre d'utilisateurs trouvés : ${userCountBefore}`);

    await prisma.$transaction([
      prisma.session.deleteMany(),
      prisma.otpToken.deleteMany(),
      prisma.agentProfile.deleteMany(),
      prisma.membership.deleteMany(),
      prisma.workspaceInvitation.deleteMany(),
      prisma.ticketShare.deleteMany(),
      prisma.ticketAssignment.deleteMany(),
      prisma.ticketActivity.deleteMany(),
      prisma.conversationShare.deleteMany(),
      prisma.conversationMessage.deleteMany(),
      prisma.auditLog.deleteMany(),
      prisma.ticket.updateMany({ data: { assignedAgentId: null, createdById: null } }),
      prisma.conversation.updateMany({ data: { assignedAgentId: null } }),
      prisma.user.deleteMany(),
    ]);

    const userCountAfter = await prisma.user.count();
    console.log(`Purge de la base terminée. Utilisateurs restants : ${userCountAfter}`);

    // Flush Redis application caches cleanly without touching security keys
    try {
      await cacheService.clearApplicationCache();
      console.log("Cache applicatif Redis vidé (workspaces, profils, clés de sécurité préservées).");
    } catch (err) {
      console.warn("Avertissement Redis:", err.message);
    }

    console.log("=== Purge terminée avec succès ===");
    process.exit(0);
  } catch (err) {
    console.error("Erreur critique lors de la purge :", err);
    process.exit(1);
  }
}

purgeAllUsers();
