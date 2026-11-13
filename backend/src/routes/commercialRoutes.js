import { Router } from "express";
import {
  listPlansController,
  getPlanController,
  saveIntentController,
  getIntentController,
  getRecapController,
  validateDowngradeController,
  scheduleDowngradeController,
  getDowngradeStatusController,
  cancelDowngradeController,
  createUpgradeIntentController,
  getUpgradeStatusController,
  abandonUpgradeIntentController,
} from "../controllers/commercialController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Public routes: Official plans and pricing
router.get("/plans", listPlansController);
router.get("/plans/:planId", getPlanController);

// Authenticated commercial operations
router.use(requireAuth);
router.get("/intent", getIntentController);
router.post("/intent", saveIntentController);
router.get("/recap", getRecapController);

// Downgrade operations
router.post("/downgrade/validate", validateDowngradeController);
router.post("/downgrade/schedule", scheduleDowngradeController);
router.get("/downgrade/status", getDowngradeStatusController);
router.post("/downgrade/cancel", cancelDowngradeController);

// Upgrade operations (Phase D.1.3 - Sécurisé : Aucune confirmation client autorisée)
router.post("/upgrade/intent", createUpgradeIntentController);
router.get("/upgrade/status", getUpgradeStatusController);
router.post("/upgrade/abandon", abandonUpgradeIntentController);

export default router;

