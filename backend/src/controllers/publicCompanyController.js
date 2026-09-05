import {
  getPublicCompanies,
  getPopularPublicCompanies,
  getPublicCategories,
  getPublicCompanyBySlug,
} from "../services/publicCompanyService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * GET /api/public/companies
 * Query params: search, category, city, limit, offset
 */
export async function listPublicCompanies(req, res, next) {
  try {
    const { search, category, city, limit, offset } = req.query;
    const data = await getPublicCompanies({
      search: search || "",
      category: category || "",
      city: city || "",
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/popular
 */
export async function listPopularCompanies(req, res, next) {
  try {
    const companies = await getPopularPublicCompanies();
    return sendSuccess(res, { companies });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/categories
 */
export async function listPublicCategories(req, res, next) {
  try {
    const categories = await getPublicCategories();
    return sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/:slug
 */
export async function getCompanyProfile(req, res, next) {
  try {
    const { slug } = req.params;
    const company = await getPublicCompanyBySlug(slug);

    if (!company) {
      return sendError(res, "Entreprise introuvable ou profil non public.", 404);
    }

    return sendSuccess(res, { company });
  } catch (error) {
    next(error);
  }
}
