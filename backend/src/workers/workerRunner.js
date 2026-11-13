import { createTicketWorker } from "./ticketWorker.js";
import { createNotificationWorker } from "./notificationWorker.js";
import { createMaintenanceWorker } from "./maintenanceWorker.js";
import { createMetricsWorker } from "./metricsWorker.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../utils/logger.js";

const workers = [];
let isShuttingDown = false;

async function startWorkers() {
  logger.info("=================================================");
  logger.info("[Zadesk:WorkerRunner] Démarrage des Workers BullMQ");
  logger.info("=================================================");

  try {
    const ticketWorker = createTicketWorker();
    const notificationWorker = createNotificationWorker();
    const maintenanceWorker = createMaintenanceWorker();
    const metricsWorker = createMetricsWorker();

    workers.push(ticketWorker, notificationWorker, maintenanceWorker, metricsWorker);

    // Wait for all workers to be fully ready
    await Promise.all(workers.map((w) => w.waitUntilReady()));

    logger.info(`[Zadesk:WorkerRunner] ${workers.length} workers BullMQ actifs et prêts à consommer les tâches.`);
  } catch (err) {
    logger.error(`[Zadesk:WorkerRunner] Échec d'initialisation des workers: ${err.message}`, err);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`[Zadesk:WorkerRunner] Signal ${signal} reçu. Arrêt gracieux des workers...`);

  try {
    // Stop accepting new jobs and wait for active jobs to finish
    await Promise.all(workers.map((w) => w.close()));
    logger.info("[Zadesk:WorkerRunner] Tous les workers BullMQ ont été arrêtés.");

    // Disconnect Prisma database client
    await prisma.$disconnect();
    logger.info("[Zadesk:WorkerRunner] Connexion PostgreSQL Prisma fermée.");

    process.exit(0);
  } catch (err) {
    logger.error(`[Zadesk:WorkerRunner] Erreur lors de l'arrêt gracieux: ${err.message}`, err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start workers immediately when script is executed
startWorkers();

