import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./utils/logger.js";
import { queueManager } from "./queues/queueManager.js";
import {
  dispatchMaintenanceCleanupJob,
  scheduleRecurringMaintenance,
  scheduleRecurringOutboxDispatcher,
  scheduleRecurringDowngradeProcessor,
} from "./jobs/maintenanceJobs.js";

const server = app.listen(env.PORT, () => {
  logger.info(`Serveur Zadesk Backend démarré sur le port ${env.PORT} (${env.NODE_ENV})`);
  logger.info(`Base de données connectée via Prisma`);
  
  // Initial startup cleanup (deduplicated by 5-min bucket) & native BullMQ cluster scheduler
  dispatchMaintenanceCleanupJob({ triggeredBy: "server_startup" }).catch(() => {});
  scheduleRecurringMaintenance().catch((err) => {
    logger.warn(`[BullMQ:Maintenance] Impossible d'enregistrer le scheduler récurrent: ${err.message}`);
  });
  scheduleRecurringOutboxDispatcher().catch((err) => {
    logger.warn(`[BullMQ:Outbox] Impossible d'enregistrer le scheduler outbox: ${err.message}`);
  });
  scheduleRecurringDowngradeProcessor().catch((err) => {
    logger.warn(`[BullMQ:Billing] Impossible d'enregistrer le scheduler downgrade: ${err.message}`);
  });
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  logger.info(`Signal ${signal} reçu. Arrêt gracieux du serveur...`);
  server.close(async () => {
    logger.info("Serveur HTTP fermé.");
    try {
      await queueManager.closeAll();
      await prisma.$disconnect();
      logger.info("Connexion Prisma et files BullMQ fermées.");
      process.exit(0);
    } catch (err) {
      logger.error("Erreur lors de la déconnexion:", err);
      process.exit(1);
    }
  });

  // Force shutdown if taking too long
  setTimeout(() => {
    logger.error("Arrêt forcé après expiration du délai.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;
