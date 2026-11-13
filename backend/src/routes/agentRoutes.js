import { Router } from "express";
import * as agentController from "../controllers/agentController.js";
import { requireAuth, requireWorkspaceRole } from "../middleware/requireAuth.js";

const router = Router({ mergeParams: true });

// Require authentication and active workspace membership
router.use(requireAuth);
router.use(requireWorkspaceRole(["OWNER", "ADMIN", "MANAGER", "AGENT"]));

// 1. Dashboard
router.get("/dashboard", agentController.getDashboard);

// 2. Tickets
router.get("/tickets", agentController.getMyTickets);
router.get("/tickets/assigned", agentController.getMyTickets);
router.get("/tickets/shared", agentController.getSharedTickets);
router.get("/tickets/history", agentController.getTicketHistory);
router.get("/tickets/:ticketId", agentController.getTicket);
router.post("/tickets", agentController.createTicket);
router.patch("/tickets/:ticketId", agentController.updateTicket);
router.post("/tickets/:ticketId/share", agentController.shareTicket);
router.post("/tickets/:ticketId/reassign", agentController.reassignTicket);

// 3. Conversations (Internal & Operational without WhatsApp)
router.get("/conversations", agentController.getConversations);
router.post("/conversations", agentController.createConversation);
router.get("/conversations/:conversationId", agentController.getConversation);
router.post("/conversations/:conversationId/messages", agentController.sendConversationMessage);
router.post("/conversations/:conversationId/customer-messages", agentController.receiveCustomerMessage);

// 4. Real-time Pulse Constellation Stream (SSE)
router.get("/pulse/stream", agentController.streamPulse);

// 5. Profile & Team
router.get("/profile", agentController.getProfile);
router.patch("/profile", agentController.updateProfile);
router.get("/team", agentController.listTeamMembers);

export default router;
