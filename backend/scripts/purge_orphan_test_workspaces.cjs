const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Redis = require('ioredis');

async function main() {
  console.log('=== DÉBUT DE LA PURGE DE L\'ESPACE PUBLIC ET DES WORKSPACES TEST ===\n');

  // 1. Lister les vrais comptes
  const realUsers = await prisma.user.findMany({
    where: {
      email: {
        notIn: [
          'owner-1793574708951@zadesk-phase2.com',
          'agent-1793574708951@zadesk-phase2.com',
          'test.user99@zadesk.dev'
        ]
      }
    },
    select: { id: true, email: true, firstName: true, lastName: true }
  });

  console.log('Comptes utilisateurs réels conservés (' + realUsers.length + ') :');
  realUsers.forEach(u => console.log(`- ${u.email} (${u.firstName} ${u.lastName}) [id: ${u.id}]`));

  // 2. Identifier les workspaces réels reliés à ces utilisateurs
  const realWorkspaces = await prisma.workspace.findMany({
    where: {
      memberships: {
        some: {
          userId: {
            in: realUsers.map(u => u.id)
          }
        }
      }
    },
    include: {
      memberships: {
        include: {
          user: {
            select: { email: true }
          }
        }
      }
    }
  });

  console.log('\nWorkspaces réels conservés (' + realWorkspaces.length + ') :');
  realWorkspaces.forEach(w => {
    console.log(`- ${w.slug} (${w.name}) -> lié à: ${w.memberships.map(m => m.user.email).join(', ')}`);
  });

  const realWorkspaceIds = realWorkspaces.map(w => w.id);

  // 3. Identifier les workspaces orphelins / test à supprimer
  const workspacesToDelete = await prisma.workspace.findMany({
    where: {
      id: {
        notIn: realWorkspaceIds
      }
    },
    select: { id: true, slug: true, name: true }
  });

  console.log(`\nNombre de workspaces test / fictifs / orphelins à supprimer : ${workspacesToDelete.length}`);

  // 4. Supprimer les workspaces de test
  if (workspacesToDelete.length > 0) {
    const deleteResult = await prisma.workspace.deleteMany({
      where: {
        id: {
          in: workspacesToDelete.map(w => w.id)
        }
      }
    });
    console.log(`✅ Supprimé ${deleteResult.count} workspaces test / seeds de la base de données.`);
  }

  // 5. Supprimer les utilisateurs de test
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'owner-1793574708951@zadesk-phase2.com',
          'agent-1793574708951@zadesk-phase2.com',
          'test.user99@zadesk.dev'
        ]
      }
    }
  });
  console.log(`✅ Supprimé ${deletedUsers.count} utilisateurs de test résiduels.`);

  // 6. Purger le cache Redis
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
    const redis = new Redis(redisUrl);
    await redis.flushdb();
    console.log('✅ Cache Redis entièrement vidé (flushdb).');
    await redis.quit();
  } catch (err) {
    console.warn('Avertissement Redis:', err.message);
  }

  // 7. Vérification finale
  const remainingWorkspaces = await prisma.workspace.findMany({
    select: { id: true, slug: true, name: true, isPublic: true }
  });

  console.log('\n=== WORKSPACES FINAUX RESTANTS DANS LA BASE (' + remainingWorkspaces.length + ') ===');
  remainingWorkspaces.forEach(w => {
    console.log(`- ${w.slug} (${w.name}) [isPublic: ${w.isPublic}]`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
