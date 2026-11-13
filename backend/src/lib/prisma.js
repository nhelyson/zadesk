import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { env } from "../config/env.js";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.IS_PROD ? ["error"] : ["query", "info", "warn", "error"],
  });
};

const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (!env.IS_PROD) {
  globalForPrisma.prisma = prisma;
}
