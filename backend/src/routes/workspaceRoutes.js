import { Router } from "express";
import {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  getDashboard,
  getConversations,
  getTickets,
  getCustomers,
  getAgents,
  getAgencies,
  getAiConfig,
  getKnowledge,
  getWhatsApp,
  getAnalytics,
  createInvitation,
  getInvitation,
  acceptInvitation,
} from "../controllers/workspaceController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Public route to inspect an invitation link
router.get("/invitations/:token", getInvitation);

// Protected workspace routes
router.use(requireAuth);

// Base workspace management
router.get("/", listWorkspaces);
router.post("/", createWorkspace);
router.get("/:workspaceId", getWorkspace);

// Team Invitations
router.post("/:workspaceId/invitations", createInvitation);
router.post("/invitations/:token/accept", acceptInvitation);

// Specialized SAV Business Modules
router.get("/:workspaceId/dashboard", getDashboard);
router.get("/:workspaceId/conversations", getConversations);
router.get("/:workspaceId/tickets", getTickets);
router.get("/:workspaceId/customers", getCustomers);
router.get("/:workspaceId/agents", getAgents);
router.get("/:workspaceId/agencies", getAgencies);
router.get("/:workspaceId/ai-config", getAiConfig);
router.get("/:workspaceId/knowledge", getKnowledge);
router.get("/:workspaceId/whatsapp", getWhatsApp);
router.get("/:workspaceId/analytics", getAnalytics);

export default router;
