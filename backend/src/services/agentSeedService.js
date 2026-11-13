import { prisma } from "../lib/prisma.js";

/**
 * Auto-seed initial skills, agent profiles, tickets and conversations for a workspace if empty
 */
export async function ensureWorkspaceAgentSeed(workspaceId, currentUserId) {
  try {
    // 1. Ensure common SAV skills exist
    const defaultSkills = [
      { name: "Support Mobile Money & Paiement", description: "Déblocage, vérification de transactions MoMo / Airtel Money" },
      { name: "Assistance Matérielle & SAV", description: "Diagnostic pannes, échange standard sous garantie" },
      { name: "Facturation & Litiges", description: "Régularisation comptes, avoirs et remboursements" },
      { name: "Support Réseau & Fibre", description: "Configuration routeurs, suivi coupures et débit" },
    ];

    for (const skill of defaultSkills) {
      await prisma.skill.upsert({
        where: {
          workspaceId_name: {
            workspaceId,
            name: skill.name,
          },
        },
        create: {
          workspaceId,
          name: skill.name,
          description: skill.description,
        },
        update: {},
      });
    }

    // 2. Ensure current user has an AgentProfile and at least 2 validated skills
    const profile = await prisma.agentProfile.upsert({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId,
        },
      },
      create: {
        workspaceId,
        userId: currentUserId,
        availability: "AVAILABLE",
        maxCapacity: 10,
        autoAssignmentEnabled: true,
        title: "Conseiller SAV Principal",
      },
      update: {},
    });

    const allSkills = await prisma.skill.findMany({ where: { workspaceId } });
    if (allSkills.length > 0) {
      for (const sk of allSkills.slice(0, 2)) {
        await prisma.agentSkill.upsert({
          where: {
            agentProfileId_skillId: {
              agentProfileId: profile.id,
              skillId: sk.id,
            },
          },
          create: {
            agentProfileId: profile.id,
            skillId: sk.id,
            validatedById: currentUserId,
            validatedAt: new Date(),
          },
          update: {},
        });
      }
    }

    // 3. If workspace has 0 tickets, create a few realistic tickets assigned to user
    const ticketCount = await prisma.ticket.count({ where: { workspaceId } });
    if (ticketCount === 0) {
      const ticket1 = await prisma.ticket.create({
        data: {
          workspaceId,
          reference: "TK-2026-0001",
          assignedAgentId: currentUserId,
          createdById: currentUserId,
          title: "Litige débit Mobile Money sans confirmation de validation",
          description: "Le client signale un débit de 25 000 FCFA via Airtel Money (TxID: 882910) pour un abonnement non activé. Relevé de transaction fourni.",
          category: "Support Mobile Money & Paiement",
          priority: "URGENT",
          status: "IN_PROGRESS",
          customerName: "Mavoungou Jean-Luc",
          customerPhone: "+242 06 612 34 56",
          customerEmail: "jeanluc.mavoungou@gmail.com",
          slaDueAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // In 4 hours
        },
      });

      await prisma.ticketActivity.createMany({
        data: [
          {
            ticketId: ticket1.id,
            authorId: currentUserId,
            type: "ASSIGNMENT",
            content: "Ticket assigné à l'agent après qualification de l'urgence.",
          },
          {
            ticketId: ticket1.id,
            authorId: currentUserId,
            type: "NOTE",
            content: "Contact pris avec l'opérateur Airtel : réconciliation bancaire en cours sous réf #REC-9912.",
          },
        ],
      });

      const ticket2 = await prisma.ticket.create({
        data: {
          workspaceId,
          reference: "TK-2026-0002",
          assignedAgentId: currentUserId,
          createdById: currentUserId,
          title: "Écran terminal de paiement noir après redémarrage",
          description: "Matériel modèle Z-50 sous garantie déposé à l'agence de Brazzaville pour test et remplacement standard.",
          category: "Assistance Matérielle & SAV",
          priority: "HIGH",
          status: "OPEN",
          customerName: "Pharmacie de la Paix",
          customerPhone: "+242 05 520 88 12",
          customerEmail: "contact@pharmaciedelapaix.cg",
          slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket2.id,
          authorId: currentUserId,
          type: "ASSIGNMENT",
          content: "Attribution automatique selon disponibilité de l'agent.",
        },
      });

      const ticket3 = await prisma.ticket.create({
        data: {
          workspaceId,
          reference: "TK-2026-0003",
          assignedAgentId: currentUserId,
          createdById: currentUserId,
          title: "Demande duplicata facture trimestrielle B2B",
          description: "Duplicata de facture n° F2026-08 réclamé par la comptabilité pour clôture.",
          category: "Facturation & Litiges",
          priority: "LOW",
          status: "RESOLVED",
          resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          customerName: "Société Congolaise de BTP",
          customerPhone: "+242 06 999 11 22",
          customerEmail: "compta@scbtp.cg",
        },
      });

      await prisma.ticketActivity.create({
        data: {
          ticketId: ticket3.id,
          authorId: currentUserId,
          type: "RESOLUTION",
          content: "Facture certifiée au format PDF transmise par email. Dossier résolu avec succès.",
        },
      });
    }

    // 4. If workspace has 0 conversations, create initial conversation with messages & internal note
    const convCount = await prisma.conversation.count({ where: { workspaceId } });
    if (convCount === 0) {
      const conv = await prisma.conversation.create({
        data: {
          workspaceId,
          assignedAgentId: currentUserId,
          customerName: "Koffi Jean-Luc",
          customerPhone: "+242 06 480 92 10",
          channel: "PORTAL",
          status: "ACTIVE",
          priority: "HIGH",
        },
      });

      await prisma.conversationMessage.createMany({
        data: [
          {
            conversationId: conv.id,
            senderType: "CUSTOMER",
            senderName: "Koffi Jean-Luc",
            content: "Bonjour, j'ai déposé mon matériel en agence hier et je souhaite savoir si le diagnostic a débuté.",
            isInternalNote: false,
          },
          {
            conversationId: conv.id,
            senderId: currentUserId,
            senderType: "INTERNAL_NOTE",
            senderName: "Note interne (Confidentiel)",
            content: "Matériel inspecté par l'atelier technique ce matin : nappe d'affichage endommagée, pièce de rechange disponible en stock.",
            isInternalNote: true,
          },
          {
            conversationId: conv.id,
            senderId: currentUserId,
            senderType: "AGENT_REPLY",
            senderName: "Agent Zadesk",
            content: "Bonjour M. Koffi ! Le diagnostic a été réalisé par notre équipe technique. Votre appareil sera prêt pour retrait dès cet après-midi 15h.",
            isInternalNote: false,
          },
        ],
      });
    }
  } catch (err) {
    console.error("[ensureWorkspaceAgentSeed] Error:", err.message);
  }
}
