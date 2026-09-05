import { Router } from "express";
import {
  listPublicCompanies,
  listPopularCompanies,
  listPublicCategories,
  getCompanyProfile,
} from "../controllers/publicCompanyController.js";

const router = Router();

// Public routes - NO auth required
router.get("/companies/popular", listPopularCompanies);
router.get("/companies/categories", listPublicCategories);
router.get("/companies", listPublicCompanies);
router.get("/companies/:slug", getCompanyProfile);

export default router;
