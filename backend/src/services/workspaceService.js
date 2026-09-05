import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { ROLES } from "../config/constants.js";
import { cacheService } from "../cache/cacheService.js";

/**
 * Generate a clean URL slug from name
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

/**
 * List all workspaces for a given user with role
 */
export async function listUserWorkspaces(userId) {
  const cacheKey = `user:${userId}:workspaces`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      const memberships = await prisma.membership.findMany({
        where: { userId },
        include: {
          workspace: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        role: m.role,
        createdAt: m.workspace.createdAt,
      }));
    },
    600 // 10 minutes TTL
  );
}

/**
 * Create a new workspace and assign user as OWNER
 */
export async function createWorkspaceForUser(userId, { name, slug }) {
  let finalSlug = slug || generateSlug(name);

  // Check slug collision
  let existing = await prisma.workspace.findUnique({ where: { slug: finalSlug } });
  let count = 1;
  while (existing) {
    finalSlug = `${generateSlug(name)}-${count++}`;
    existing = await prisma.workspace.findUnique({ where: { slug: finalSlug } });
  }

  const result = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name,
        slug: finalSlug,
      },
    });

    const membership = await tx.membership.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: ROLES.OWNER,
      },
    });

    return { workspace, membership };
  });

  // Invalidate user workspaces cache
  await cacheService.del(`user:${userId}:workspaces`);

  return result;
}

/**
 * Get workspace details by ID or Slug
 */
export async function getWorkspaceById(workspaceId) {
  const cacheKey = `workspace:${workspaceId}`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      const workspace = await prisma.workspace.findFirst({
        where: {
          OR: [{ id: workspaceId }, { slug: workspaceId }],
        },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      return workspace;
    },
    900 // 15 minutes TTL
  );
}

/**
 * Get live SAV Operational Dashboard statistics
 */
export async function getWorkspaceDashboardStats(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:dashboard`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      // In production with rich datasets, these query database aggregates
      return {
        overview: {
          activeConversations: 18,
          waitingAgent: 4,
          openTickets: 7,
          aiResolutionRate: 78.5, // 78.5% resolved without human escalation
          avgResolutionTimeMinutes: 6.2,
          customerSatisfactionScore: 94.2,
        },
        priorityQueue: [
          {
            id: "conv-101",
            customerName: "Mavoungou Jean-Luc",
            phone: "+242 06 612 34 56",
            channel: "WhatsApp",
            lastMessage: "Le colis reçu à Pointe-Noire ne correspond pas à ma commande.",
            category: "Erreur Livraison",
            urgency: "HIGH",
            status: "WAITING_AGENT",
            timeAgo: "Il y a 3 min",
            unreadCount: 2,
          },
          {
            id: "conv-102",
            customerName: "Gassaye Priscille",
            phone: "+242 05 520 88 12",
            channel: "WhatsApp",
            lastMessage: "Mon paiement Mobile Money a été débité mais pas de validation.",
            category: "Paiement / Facturation",
            urgency: "CRITICAL",
            status: "ESCALATED",
            timeAgo: "Il y a 8 min",
            unreadCount: 1,
          },
          {
            id: "conv-103",
            customerName: "Brazza Logistics SARL",
            phone: "+242 06 991 00 22",
            channel: "WhatsApp",
            lastMessage: "Demande de devis pour maintenance groupe électrogène.",
            category: "Commercial / B2B",
            urgency: "MEDIUM",
            status: "AI_HANDLED",
            timeAgo: "Il y a 14 min",
            unreadCount: 0,
          },
        ],
        recentActivity: [
          {
            id: "act-1",
            type: "AI_RESOLVED",
            title: "L'IA a résolu une demande d'horaires et localisation",
            description: "Client +242 06 400 11 22 • Agence Centre-Ville Brazzaville",
            timestamp: "Il y a 2 min",
          },
          {
            id: "act-2",
            type: "AGENT_ASSIGNED",
            title: "L'agent Marie K. a pris en charge la conversation #102",
            description: "Catégorie : Litige Mobile Money",
            timestamp: "Il y a 6 min",
          },
          {
            id: "act-3",
            type: "TICKET_CREATED",
            title: "Nouveau Ticket #TCK-2026-089 créé",
            description: "Dossier transféré à l'Agence Grand Marché Pointe-Noire",
            timestamp: "Il y a 18 min",
          },
          {
            id: "act-4",
            type: "KNOWLEDGE_UPDATED",
            title: "Base de connaissances mise à jour",
            description: "Ajout de la procédure de retour produit sous garantie 14j",
            timestamp: "Il y a 45 min",
          },
        ],
        volumeTrend: [
          { time: "08h", total: 12, aiResolved: 10, escalated: 2 },
          { time: "10h", total: 28, aiResolved: 22, escalated: 6 },
          { time: "12h", total: 45, aiResolved: 36, escalated: 9 },
          { time: "14h", total: 38, aiResolved: 30, escalated: 8 },
          { time: "16h", total: 52, aiResolved: 41, escalated: 11 },
          { time: "18h", total: 31, aiResolved: 26, escalated: 5 },
        ],
      };
    },
    60 // 60s TTL for live dashboard
  );
}

/**
 * Get Workspace Conversations (Inbox)
 */
export async function getWorkspaceConversations(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:conversations`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return [
        {
          id: "conv-101",
          customerName: "Mavoungou Jean-Luc",
          phone: "+242 06 612 34 56",
          avatar: "MJ",
          channel: "WhatsApp",
          lastMessage: "Le colis reçu à Pointe-Noire ne correspond pas à ma commande.",
          lastMessageTime: "09:42",
          status: "WAITING_AGENT", // WAITING_AGENT, AI_HANDLED, ESCALATED, RESOLVED
          priority: "HIGH",
          assignedAgent: "Marie Koumou",
          unread: 2,
          category: "Livraison",
          messages: [
            {
              id: "msg-1",
              sender: "customer",
              text: "Bonjour Zadesk, j'ai récupéré mon colis ce matin à l'agence de Pointe-Noire mais l'article est défectueux.",
              time: "09:38",
            },
            {
              id: "msg-2",
              sender: "ai",
              text: "Bonjour M. Mavoungou ! Navré pour ce désagrément. Pourriez-vous préciser le numéro de votre bon de commande afin que je vérifie immédiatement ?",
              time: "09:39",
            },
            {
              id: "msg-3",
              sender: "customer",
              text: "C'est la commande #BC-99214. Voici une photo du problème.",
              time: "09:41",
            },
            {
              id: "msg-4",
              sender: "customer",
              text: "Le colis reçu à Pointe-Noire ne correspond pas à ma commande.",
              time: "09:42",
            },
          ],
        },
        {
          id: "conv-102",
          customerName: "Gassaye Priscille",
          phone: "+242 05 520 88 12",
          avatar: "GP",
          channel: "WhatsApp",
          lastMessage: "Mon paiement Mobile Money a été débité mais pas de validation.",
          lastMessageTime: "09:35",
          status: "ESCALATED",
          priority: "CRITICAL",
          assignedAgent: "Arnaud Loubaki",
          unread: 1,
          category: "Paiement",
          messages: [
            {
              id: "msg-201",
              sender: "customer",
              text: "Bonjour, j'ai payé par MTN Mobile Money (TxID: 88392102) mais mon compte reste bloqué.",
              time: "09:30",
            },
            {
              id: "msg-202",
              sender: "ai",
              text: "Bonjour Mme Gassaye. J'analyse la transaction en direct. Un instant svp...",
              time: "09:31",
            },
            {
              id: "msg-203",
              sender: "ai",
              text: "La transaction nécessite une vérification manuelle auprès de l'opérateur. Je transfère votre demande à notre spécialiste facturation.",
              time: "09:33",
            },
            {
              id: "msg-204",
              sender: "customer",
              text: "Mon paiement Mobile Money a été débité mais pas de validation.",
              time: "09:35",
            },
          ],
        },
        {
          id: "conv-103",
          customerName: "Brazza Logistics SARL",
          phone: "+242 06 991 00 22",
          avatar: "BL",
          channel: "WhatsApp",
          lastMessage: "Parfait, merci beaucoup pour ces éclaircissements !",
          lastMessageTime: "09:20",
          status: "RESOLVED",
          priority: "LOW",
          assignedAgent: "IA Zadesk",
          unread: 0,
          category: "Informations",
          messages: [
            {
              id: "msg-301",
              sender: "customer",
              text: "Bonjour, quelles sont les conditions d'ouverture d'un compte flotte professionnelle ?",
              time: "09:15",
            },
            {
              id: "msg-302",
              sender: "ai",
              text: "Bonjour ! Pour ouvrir un compte flotte entreprise, il vous suffit de fournir votre RCCM, NUI et la liste des véhicules. Vous bénéficiez de 14 jours d'essai sans engagement.",
              time: "09:16",
            },
            {
              id: "msg-303",
              sender: "customer",
              text: "Parfait, merci beaucoup pour ces éclaircissements !",
              time: "09:20",
            },
          ],
        },
        {
          id: "conv-104",
          customerName: "Ntsiba Aurelien",
          phone: "+242 06 880 44 91",
          avatar: "NA",
          channel: "WhatsApp",
          lastMessage: "Pouvez-vous m'envoyer la facture du mois dernier ?",
          lastMessageTime: "08:55",
          status: "AI_HANDLED",
          priority: "MEDIUM",
          assignedAgent: "IA Zadesk",
          unread: 0,
          category: "Facturation",
          messages: [
            {
              id: "msg-401",
              sender: "customer",
              text: "Pouvez-vous m'envoyer la facture du mois dernier ?",
              time: "08:55",
            },
          ],
        },
      ];
    },
    120
  );
}

/**
 * Get Workspace Continuous Tickets
 */
export async function getWorkspaceTickets(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:tickets`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return [
        {
          id: "TCK-2026-089",
          customerName: "Mavoungou Jean-Luc",
          customerPhone: "+242 06 612 34 56",
          subject: "Remplacement écran terminal de paiement",
          category: "Matériel Défectueux",
          priority: "HIGH",
          status: "IN_PROGRESS", // OPEN, IN_PROGRESS, IN_AGENCY, RESOLVED, CLOSED
          assignedAgency: "Agence Grand Marché (Pointe-Noire)",
          assignedAgent: "Marie Koumou",
          aiSummary: "Terminal de paiement TPE modèle Z-50 tombé en panne d'affichage après mise à jour. Client invité à déposer le matériel à l'agence de Pointe-Noire pour échange standard immédiat.",
          createdAt: "05 Sept. 2026, 09:12",
          updatedAt: "Il y a 15 min",
          history: [
            {
              date: "05 Sept 09:12",
              author: "IA Zadesk",
              text: "Diagnostic IA effectué : panne matérielle confirmée. Création automatique du dossier de continuité #TCK-2026-089.",
            },
            {
              date: "05 Sept 09:25",
              author: "Marie Koumou (Agent)",
              text: "Dossier vérifié et assigné à l'Agence Grand Marché Pointe-Noire pour mise à disposition de l'équipement de remplacement.",
            },
          ],
        },
        {
          id: "TCK-2026-088",
          customerName: "TotalEnergies Congo",
          customerPhone: "+242 05 777 00 11",
          subject: "Audit semestriel passerelle WhatsApp API",
          category: "Intégration",
          priority: "MEDIUM",
          status: "OPEN",
          assignedAgency: "Agence Siège (Brazzaville)",
          assignedAgent: "Arnaud Loubaki",
          aiSummary: "Demande d'assistance technique pour l'export des logs d'automatisation WhatsApp et validation de conformité RGPD locale.",
          createdAt: "04 Sept. 2026, 16:45",
          updatedAt: "Il y a 2h",
          history: [
            {
              date: "04 Sept 16:45",
              author: "Arnaud Loubaki",
              text: "Ticket ouvert suite à l'échange avec la direction informatique.",
            },
          ],
        },
        {
          id: "TCK-2026-087",
          customerName: "Pharmacie de la Paix",
          customerPhone: "+242 06 555 21 00",
          subject: "Remboursement commande annulée",
          category: "Facturation",
          priority: "LOW",
          status: "RESOLVED",
          assignedAgency: "Agence Poto-Poto (Brazzaville)",
          assignedAgent: "Serge Ndong",
          aiSummary: "Commande annulée par le client avant expédition. Remboursement Airtel Money effectué sous référence #AM-77218.",
          createdAt: "03 Sept. 2026, 11:20",
          updatedAt: "04 Sept. 2026",
          history: [
            {
              date: "03 Sept 11:20",
              author: "Serge Ndong",
              text: "Ticket créé après demande client.",
            },
            {
              date: "03 Sept 15:40",
              author: "Serge Ndong",
              text: "Remboursement Airtel Money validé. Ticket clôturé.",
            },
          ],
        },
      ];
    },
    180
  );
}

/**
 * Get Workspace Customers Directory
 */
export async function getWorkspaceCustomers(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:customers`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return [
        {
          id: "cust-1",
          name: "Mavoungou Jean-Luc",
          phone: "+242 06 612 34 56",
          city: "Pointe-Noire",
          country: "Congo",
          conversationsCount: 8,
          ticketsCount: 2,
          lastInteraction: "Aujourd'hui, 09:42",
          status: "ACTIVE",
          tags: ["Client VIP", "Pointe-Noire"],
        },
        {
          id: "cust-2",
          name: "Gassaye Priscille",
          phone: "+242 05 520 88 12",
          city: "Brazzaville",
          country: "Congo",
          conversationsCount: 4,
          ticketsCount: 1,
          lastInteraction: "Aujourd'hui, 09:35",
          status: "ACTIVE",
          tags: ["Particulier", "Brazzaville"],
        },
        {
          id: "cust-3",
          name: "Brazza Logistics SARL",
          phone: "+242 06 991 00 22",
          city: "Brazzaville",
          country: "Congo",
          conversationsCount: 15,
          ticketsCount: 0,
          lastInteraction: "Aujourd'hui, 09:20",
          status: "ACTIVE",
          tags: ["B2B", "Compte Flotte"],
        },
        {
          id: "cust-4",
          name: "TotalEnergies Congo",
          phone: "+242 05 777 00 11",
          city: "Pointe-Noire",
          country: "Congo",
          conversationsCount: 32,
          ticketsCount: 5,
          lastInteraction: "Hier, 16:45",
          status: "ACTIVE",
          tags: ["Entreprise", "Contrat Pro"],
        },
      ];
    },
    300
  );
}

/**
 * Get Workspace Agents
 */
export async function getWorkspaceAgents(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:agents`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return [
        {
          id: "ag-1",
          name: "Marie Koumou",
          email: "marie.k@zadesk.com",
          role: "AGENT",
          status: "AVAILABLE", // AVAILABLE, BUSY, AWAY, OFFLINE
          skills: ["SAV Matériel", "WhatsApp", "Livraison"],
          activeConversations: 3,
          resolvedToday: 14,
          avgResponseTime: "1.4 min",
        },
        {
          id: "ag-2",
          name: "Arnaud Loubaki",
          email: "arnaud.l@zadesk.com",
          role: "MANAGER",
          status: "BUSY",
          skills: ["Litiges Financiers", "Mobile Money", "Intégrations"],
          activeConversations: 5,
          resolvedToday: 18,
          avgResponseTime: "2.1 min",
        },
        {
          id: "ag-3",
          name: "Serge Ndong",
          email: "serge.n@zadesk.com",
          role: "AGENT",
          status: "AWAY",
          skills: ["Support Général", "Facturation"],
          activeConversations: 0,
          resolvedToday: 9,
          avgResponseTime: "1.8 min",
        },
      ];
    },
    180
  );
}

/**
 * Get Workspace Physical Agencies
 */
export async function getWorkspaceAgencies(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:agencies`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return [
        {
          id: "agc-1",
          name: "Agence Siège — Centre-Ville",
          city: "Brazzaville",
          address: "Avenue Amilcar Cabral, Centre-Ville",
          phone: "+242 06 500 00 01",
          manager: "Arnaud Loubaki",
          openTickets: 3,
          hours: "Lun - Sam : 08h00 - 18h00",
          services: ["Échange Standard", "Support Technique", "Paiements"],
        },
        {
          id: "agc-2",
          name: "Agence Grand Marché",
          city: "Pointe-Noire",
          address: "Rond-Point Lumumba, Face Marché Central",
          phone: "+242 06 500 00 02",
          manager: "Marie Koumou",
          openTickets: 4,
          hours: "Lun - Sam : 08h00 - 17h30",
          services: ["Retrait Colis", "Réparation Matériel", "Service Client"],
        },
        {
          id: "agc-3",
          name: "Agence Relais Poto-Poto",
          city: "Brazzaville",
          address: "Rue Mbaka, Croisement Av. de la Paix",
          phone: "+242 06 500 00 03",
          manager: "Serge Ndong",
          openTickets: 1,
          hours: "Lun - Ven : 08h30 - 16h30",
          services: ["Dépôt Matériel", "Conseils & Assistance"],
        },
      ];
    },
    600
  );
}

/**
 * Get AI Autonomy & Escalation Configuration
 */
export async function getWorkspaceAiConfig(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:ai-config`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return {
        autonomyMode: "SEMI_AUTONOMOUS", // ASSISTED, SEMI_AUTONOMOUS, FULL_AUTONOMOUS
        language: "fr",
        tone: "PROFESSIONAL_EMPATHETIC",
        knowledgeBaseSources: ["FAQ Produits", "Politiques Retours", "Mobile Money", "Horaires Agences"],
        escalationTriggers: {
          frustrationKeywords: true,
          claimAmountThreshold: 50000, // XAF
          unresolvedAfterMessages: 4,
          explicitAgentRequest: true,
        },
        stats: {
          totalHandledThisMonth: 1248,
          resolvedWithoutHuman: 978,
          accuracyRate: 98.2,
        },
      };
    },
    600
  );
}

/**
 * Get Workspace Knowledge Base
 */
export async function getWorkspaceKnowledge(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:knowledge`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return [
        {
          id: "kb-1",
          category: "Produits & Matériel",
          title: "Procédure d'échange standard sous garantie 14 jours",
          summary: "Guide pour tester et remplacer un terminal défectueux en agence physique sans frais client.",
          updatedAt: "Il y a 2 jours",
          status: "INDEXED", // INDEXED, DRAFT, OUTDATED
          readsCount: 420,
        },
        {
          id: "kb-2",
          category: "Paiements & Mobile Money",
          title: "Vérification des transactions MTN et Airtel Money",
          summary: "Format des identifiants de transaction, délais de compensation et réclamations bancaires.",
          updatedAt: "Il y a 5 jours",
          status: "INDEXED",
          readsCount: 685,
        },
        {
          id: "kb-3",
          category: "Agences & Horaires",
          title: "Coordonnées et adresses des points relais au Congo",
          summary: "Liste complète des adresses à Brazzaville et Pointe-Noire avec numéros directs des responsables.",
          updatedAt: "01 Sept. 2026",
          status: "INDEXED",
          readsCount: 1120,
        },
        {
          id: "kb-4",
          category: "FAQ Générale",
          title: "Comment suivre l'avancement d'un dossier de SAV ?",
          summary: "Instructions simples données aux clients pour consulter l'état de leur ticket par WhatsApp.",
          updatedAt: "28 Août 2026",
          status: "INDEXED",
          readsCount: 310,
        },
      ];
    },
    600
  );
}

/**
 * Get Workspace WhatsApp Channel Details
 */
export async function getWorkspaceWhatsAppConfig(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:whatsapp`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return {
        isConnected: true,
        phoneNumber: "+242 06 900 00 00",
        displayName: "Zadesk Support Entreprise",
        provider: "ZAVU_WHATSAPP_API",
        webhookStatus: "ACTIVE_HEALTHY",
        templatesCount: 6,
        autoReplyEnabled: true,
        businessHoursGreeting: "Bonjour ! Bienvenue sur le SAV Zadesk. Comment pouvons-nous vous aider aujourd'hui ?",
        offHoursGreeting: "Bonjour. Nos conseillers sont indisponibles actuellement mais notre IA Zadesk reste à votre écoute 24/7.",
      };
    },
    300
  );
}

/**
 * Get Workspace Business Analytics
 */
export async function getWorkspaceAnalytics(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:analytics`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return {
        period: "Derniers 30 jours",
        kpis: [
          { label: "Total Demandes", value: "3,420", change: "+14.2%" },
          { label: "Résolues par IA", value: "2,684 (78.5%)", change: "+5.1%" },
          { label: "Escaladées en Tickets", value: "214 (6.2%)", change: "-2.4%" },
          { label: "Temps Moyen 1ère Réponse", value: "18 sec", change: "-40%" },
        ],
        topIssues: [
          { category: "Livraison & Retrait", percentage: 38 },
          { category: "Paiement Mobile Money", percentage: 27 },
          { category: "Support Technique / Panne", percentage: 22 },
          { category: "Renseignements Généraux", percentage: 13 },
        ],
        agentPerformance: [
          { name: "Marie Koumou", handled: 412, avgTime: "4.2 min", satisfaction: "96%" },
          { name: "Arnaud Loubaki", handled: 388, avgTime: "5.1 min", satisfaction: "94%" },
          { name: "Serge Ndong", handled: 295, avgTime: "4.8 min", satisfaction: "92%" },
        ],
      };
    },
    300
  );
}

/**
 * Create a team invitation for a workspace
 */
export async function createWorkspaceInvitation(workspaceId, invitedById, { email, role = ROLES.AGENT }) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      workspaceId,
      invitedById,
      email: email.toLowerCase().trim(),
      role: role.toUpperCase(),
      token,
      expiresAt,
    },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true },
      },
      invitedBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return invitation;
}

/**
 * Get invitation details by secure token
 */
export async function getInvitationByToken(token) {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true },
      },
      invitedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invitation introuvable ou lien expiré.");
  }

  if (invitation.acceptedAt) {
    throw new Error("Cette invitation a déjà été acceptée.");
  }

  if (new Date() > new Date(invitation.expiresAt)) {
    throw new Error("Cette invitation a expiré.");
  }

  return invitation;
}

/**
 * Accept an invitation and link user to workspace membership
 */
export async function acceptWorkspaceInvitation(token, userId) {
  const invitation = await getInvitationByToken(token);

  const result = await prisma.$transaction(async (tx) => {
    // Check if membership already exists
    let membership = await tx.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: invitation.workspaceId,
        },
      },
    });

    if (!membership) {
      membership = await tx.membership.create({
        data: {
          userId,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      });
    }

    // Mark invitation as accepted
    await tx.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return { membership, workspace: invitation.workspace };
  });

  // Invalidate cache
  await cacheService.del(`user:${userId}:workspaces`);

  return result;
}

