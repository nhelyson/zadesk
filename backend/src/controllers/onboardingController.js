import {
  getOnboardingDraft,
  saveOnboardingDraft,
  checkCompanyNameAvailability,
} from "../services/onboardingService.js";
import { onboardingDraftSchema } from "../utils/validation.js";
import { sendSuccess, sendError } from "../utils/response.js";

export async function getDraftController(req, res, next) {
  try {
    const draft = await getOnboardingDraft(req.user.id);
    return res.status(200).json({
      success: true,
      ...draft,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveDraftController(req, res, next) {
  try {
    const parsed = onboardingDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(
        res,
        parsed.error.errors[0]?.message || "Données de brouillon invalides.",
        400
      );
    }

    const result = await saveOnboardingDraft(req.user.id, parsed.data);
    return res.status(200).json({
      success: true,
      message: "Brouillon sauvegardé avec succès.",
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkNameController(req, res, next) {
  try {
    const { name, country } = req.query;
    const result = await checkCompanyNameAvailability(name, country);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
