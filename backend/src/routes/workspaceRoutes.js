import { Router } from "express";
import {
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  getWorkspace,
  getDashboard,
  getConversations,
  getTickets,
  getCustomers,
  getAgents,
  getAgencies,
  getAiConfig,
  getKnowledge,
  getAnalytics,
  createInvitation,
  getInvitation,
  acceptInvitation,
  listInvitations,
  cancelInvitation,
  getSkills,
  createSkill,
  assignSkillToAgent,
  removeSkillFromAgent,
  updateAgentProfileStatus,
} from "../controllers/workspaceController.js";
import {
  getDraftController,
  saveDraftController,
  checkNameController,
} from "../controllers/onboardingController.js";
import {
  getWhatsApp,
  connectWhatsApp,
  disconnectWhatsApp,
} from "../controllers/whatsappController.js";
import {
  getEstablishments,
  getEstablishment,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
} from "../controllers/establishmentController.js";
import { requireAuth, requireWorkspaceRole } from "../middleware/requireAuth.js";
import { checkNameRateLimiter, invitationRateLimiter } from "../middleware/rateLimiter.js";
import agentRoutes from "./agentRoutes.js";
import { queueManager } from "../queues/queueManager.js";

const router = Router();

// Public routes (No auth needed, protected against brute-force and enumeration)
router.get("/invitations/:token", invitationRateLimiter, getInvitation);
router.get("/check-name", checkNameRateLimiter, checkNameController);

// All following routes require a valid user session
router.use(requireAuth);

// 1. User Onboarding Draft
router.get("/onboarding/draft", getDraftController);
router.put("/onboarding/draft", saveDraftController);

// 2. Base Workspace Management (Global list and creation)
router.get("/", listWorkspaces);
router.post("/", createWorkspace);
router.post("/invitations/:token/accept", acceptInvitation);

// 3. Strict Multi-Tenant Boundary: All /:workspaceId routes REQUIRE verified membership
router.use("/:workspaceId", requireWorkspaceRole());

// Base workspace entity operations
router.get("/:workspaceId", getWorkspace);
router.patch("/:workspaceId", requireWorkspaceRole(["OWNER", "ADMIN"]), updateWorkspace);

// Operational Dashboard, Inboxes & Customer Records
router.get("/:workspaceId/dashboard", getDashboard);
router.get("/:workspaceId/conversations", getConversations);
router.get("/:workspaceId/tickets", getTickets);
router.get("/:workspaceId/customers", getCustomers);

// Dedicated Agent Space Router (Dashboard, Assigned/Shared Tickets, Conversations, Profile)
router.use("/:workspaceId/agent", agentRoutes);

// Team Invitations
router.get("/:workspaceId/invitations", requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER"]), listInvitations);
router.post("/:workspaceId/invitations", requireWorkspaceRole(["OWNER", "ADMIN"]), createInvitation);
router.delete("/:workspaceId/invitations/:invitationId", requireWorkspaceRole(["OWNER", "ADMIN"]), cancelInvitation);

// Agents & Skills Management
router.get("/:workspaceId/agents", getAgents);
router.patch("/:workspaceId/agents/:agentId/status", requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER"]), updateAgentProfileStatus);
router.post("/:workspaceId/agents/:agentId/skills", requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER"]), assignSkillToAgent);
router.delete("/:workspaceId/agents/:agentId/skills/:skillId", requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER"]), removeSkillFromAgent);

router.get("/:workspaceId/skills", getSkills);
router.post("/:workspaceId/skills", requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER"]), createSkill);

// Physical Establishments & SAV Branches
router.get("/:workspaceId/establishments", getEstablishments);
router.get("/:workspaceId/establishments/:establishmentId", getEstablishment);
router.post("/:workspaceId/establishments", requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER"]), createEstablishment);
router.patch("/:workspaceId/establishments/:establishmentId", requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER"]), updateEstablishment);
router.delete("/:workspaceId/establishments/:establishmentId", requireWorkspaceRole(["OWNER", "ADMIN"]), deleteEstablishment);

// Backward-compatible alias for legacy agency route
router.get("/:workspaceId/agencies", getEstablishments);
router.get("/:workspaceId/ai-config", getAiConfig);
router.get("/:workspaceId/knowledge", getKnowledge);
router.get("/:workspaceId/analytics", getAnalytics);

// BullMQ Multi-tenant Queue Observability
router.get("/:workspaceId/queues/metrics", requireWorkspaceRole(["OWNER", "ADMIN"]), async (req, res, next) => {
  try {
    const metrics = await queueManager.getAllQueueMetrics();
    res.json({ success: true, queues: metrics });
  } catch (err) {
    next(err);
  }
});

// WhatsApp Business Channel Management
router.get("/:workspaceId/whatsapp", getWhatsApp);
router.post(
  "/:workspaceId/whatsapp/connect",
  requireWorkspaceRole(["OWNER", "ADMIN"]),
  connectWhatsApp
);
router.post(
  "/:workspaceId/whatsapp/disconnect",
  requireWorkspaceRole(["OWNER", "ADMIN"]),
  disconnectWhatsApp
);

export default router;
