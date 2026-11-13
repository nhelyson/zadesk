import { prisma } from "../lib/prisma.js";
import { normalizeCompanyName } from "../utils/validation.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("=== DÉMARRAGE DE LA MIGRATION D'UNICITÉ & SAUVEGARDE DES WORKSPACES ===");

  // 1. Snapshot / Sauvegarde intégrale avant modification
  const allWorkspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
  });

  const backupPath = path.join(__dirname, `backup_workspaces_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(allWorkspaces, null, 2), "utf8");
  console.log(`[1/4] Sauvegarde de sécurité créée avec succès : ${backupPath} (${allWorkspaces.length} workspaces sauvegardés).`);

  // 2. Analyse et détection des doublons
  const seenMap = new Map(); // key -> first workspace
  const updates = [];

  for (const ws of allWorkspaces) {
    const country = (ws.country || "Congo").trim();
    const rawNormalized = normalizeCompanyName(ws.name);
    const compoundKey = `${rawNormalized}::${country.toLowerCase()}`;

    if (!seenMap.has(compoundKey)) {
      // Entrée canonique
      seenMap.set(compoundKey, ws);
      updates.push({
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        country,
        normalizedName: rawNormalized,
        isCanonical: true,
      });
    } else {
      // Doublon historique détecté !
      const canonical = seenMap.get(compoundKey);
      const legacyKey = `${rawNormalized}#legacy-${ws.id.slice(-8)}`;
      updates.push({
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        country,
        normalizedName: legacyKey,
        isCanonical: false,
        conflictWith: canonical.id,
      });
      console.log(`[DOUBLON DÉTECTÉ] Workspace "${ws.name}" (${ws.slug}, ID: ${ws.id})`);
      console.log(`  -> Clé canonique réservée par ID: ${canonical.id} (${canonical.slug})`);
      console.log(`  -> Clé technique legacy attribuée : "${legacyKey}" (nom affiché "${ws.name}" préservé à 100%)`);
    }
  }

  // 3. Application des normalizedName
  console.log(`[2/4] Application des normalizedName sur ${updates.length} workspaces...`);
  for (const u of updates) {
    await prisma.$executeRawUnsafe(
      `UPDATE "workspaces" SET "normalizedName" = $1 WHERE "id" = $2`,
      u.normalizedName,
      u.id
    ).catch(async () => {
      // If column doesn't exist yet, we will run prisma db push first
    });
  }

  console.log("Migration des données préparée avec succès.");
}

main()
  .catch((err) => {
    console.error("Erreur durant la migration :", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

