const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const realWorkspaces = await prisma.workspace.findMany({
    where: {
      memberships: {
        some: {}
      }
    },
    include: {
      memberships: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true }
          }
        }
      }
    }
  });

  console.log('--- VRAIS WORKSPACES RELIÉS À DES COMPTES (' + realWorkspaces.length + ') ---');
  realWorkspaces.forEach(w => {
    console.log({
      id: w.id,
      slug: w.slug,
      name: w.name,
      isPublic: w.isPublic,
      members: w.memberships.map(m => ({ role: m.role, email: m.user.email, name: `${m.user.firstName} ${m.user.lastName}` }))
    });
  });

  const orphanCount = await prisma.workspace.count({
    where: {
      memberships: {
        none: {}
      }
    }
  });

  console.log('\n--- WORKSPACES ORPHELINS (SANS MEMBRES / TEST / SEED) :', orphanCount);

  await prisma.$disconnect();
}

main().catch(console.error);

