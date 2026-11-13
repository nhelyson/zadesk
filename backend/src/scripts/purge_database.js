import { prisma } from "../lib/prisma.js";
import { cacheService } from "../cache/cacheService.js";

async function purgeAll() {
  console.log("=== Démarrage de la purge complète de la base de données ===");

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      audit_logs,
      conversation_shares,
      conversation_messages,
      conversations,
      ticket_activities,
      ticket_shares,
      ticket_assignments,
      tickets,
      agent_skills,
      skills,
      agent_profiles,
      whatsapp_connections,
      onboarding_drafts,
      pending_registrations,
      otp_tokens,
      sessions,
      memberships,
      workspace_invitations,
      workspaces,
      users
    CASCADE;
  `);

  console.log("Tables PostgreSQL purgées avec succès (TRUNCATE CASCADE).");

  try {
    await cacheService.clearApplicationCache();
    console.log("Cache applicatif Redis vidé avec succès (UNLINK ciblé sans toucher aux clés de sécurité).");
  } catch (err) {
    console.warn("Notice vidage Redis:", err.message);
  }

  console.log("=== Purge totale terminée avec succès ===");
}

purgeAll()
  .catch((e) => {
    console.error("Erreur lors de la purge:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

