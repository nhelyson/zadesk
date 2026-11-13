import { prisma } from "../lib/prisma.js";
import { normalizeCompanyName } from "../utils/validation.js";

async function main() {
  console.log("Adding columns if not present...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "workspaces" 
    ADD COLUMN IF NOT EXISTS "normalizedName" TEXT,
    ADD COLUMN IF NOT EXISTS "hasExistingSav" BOOLEAN DEFAULT false;
  `);

  console.log("Loading all workspaces...");
  const allWorkspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
  });

  const seenMap = new Map();
  const report = [];

  for (const ws of allWorkspaces) {
    const country = (ws.country || "Congo").trim();
    const rawNormalized = normalizeCompanyName(ws.name);
    const compoundKey = `${rawNormalized}::${country.toLowerCase()}`;

    let assignedKey = rawNormalized;
    let isCanonical = true;
    let note = "Canonique";

    if (seenMap.has(compoundKey)) {
      isCanonical = false;
      assignedKey = `${rawNormalized}#legacy-${ws.id.slice(-8)}`;
      note = `Doublon historique de ID: ${seenMap.get(compoundKey).id}`;
    } else {
      seenMap.set(compoundKey, ws);
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "workspaces" SET "normalizedName" = $1 WHERE "id" = $2`,
      assignedKey,
      ws.id
    );

    report.push({
      id: ws.id,
      name: ws.name,
      country,
      slug: ws.slug,
      assignedNormalizedName: assignedKey,
      isCanonical,
      note,
    });
  }

  console.log("Creating unique compound index unique_normalized_name_country...");
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "unique_normalized_name_country" 
    ON "workspaces" ("normalizedName", "country");
  `);

  console.log("Creating index on normalizedName...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "workspaces_normalizedName_idx" 
    ON "workspaces" ("normalizedName");
  `);

  console.log("Creating onboarding_drafts table if not exists...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "onboarding_drafts" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "step" INTEGER NOT NULL DEFAULT 1,
      "data" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "onboarding_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  console.log("=== RAPPORT DE MIGRATION D'UNICITÉ ===");
  console.table(report);
  console.log("Migration des colonnes et index exécutée avec succès !");
}

main()
  .catch((err) => {
    console.error("Erreur migration:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

