import { sendSuccess } from "../utils/response.js";
import * as establishmentService from "../services/establishmentService.js";

export async function getEstablishments(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const { search, type, isActive, isPublic } = req.query;

    const establishments = await establishmentService.listEstablishments(workspaceId, {
      search,
      type,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      isPublic: isPublic !== undefined ? isPublic === "true" : undefined,
    });

    return sendSuccess(res, {
      establishments,
      total: establishments.length,
      types: establishmentService.ESTABLISHMENT_TYPES,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEstablishment(req, res, next) {
  try {
    const { workspaceId, establishmentId } = req.params;
    const establishment = await establishmentService.getEstablishmentById(workspaceId, establishmentId);
    return sendSuccess(res, { establishment });
  } catch (error) {
    next(error);
  }
}

export async function createEstablishment(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const establishment = await establishmentService.createEstablishment(workspaceId, req.body);
    return sendSuccess(res, { establishment }, "Établissement créé avec succès.", 201);
  } catch (error) {
    next(error);
  }
}

export async function updateEstablishment(req, res, next) {
  try {
    const { workspaceId, establishmentId } = req.params;
    const establishment = await establishmentService.updateEstablishment(workspaceId, establishmentId, req.body);
    return sendSuccess(res, { establishment }, "Établissement mis à jour avec succès.");
  } catch (error) {
    next(error);
  }
}

export async function deleteEstablishment(req, res, next) {
  try {
    const { workspaceId, establishmentId } = req.params;
    await establishmentService.deleteEstablishment(workspaceId, establishmentId);
    return sendSuccess(res, { success: true }, "Établissement supprimé avec succès.");
  } catch (error) {
    next(error);
  }
}

