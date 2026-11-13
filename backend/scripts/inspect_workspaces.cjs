const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, createdAt: true }
  });
  console.log('--- UTILISATEURS EXISTANTS ---');
  console.log(users);

  const workspaces = await prisma.workspace.findMany({
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

  console.log('\n--- WORKSPACES EXISTANTS (' + workspaces.length + ') ---');
  workspaces.forEach(w => {
    const memberEmails = w.memberships.map(m => m.user ? m.user.email : 'inconnu');
    const isLinkedToAccount = w.memberships.length > 0;
    console.log(`[${isLinkedToAccount ? 'COMPTE RÉEL' : 'TEST/SEED'}] id: ${w.id} | slug: ${w.slug} (${w.name}) -> membres: ${w.memberships.length} (${memberEmails.join(', ')})`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
