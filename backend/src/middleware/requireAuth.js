import { COOKIE_NAME } from "../config/constants.js";
import { validateSession } from "../services/sessionService.js";

/**
 * Middleware ensuring user is authenticated
 */
export async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: "Authentification requise. Veuillez vous connecter.",
      });
    }

    const user = await validateSession(sessionToken);

    if (!user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: "Session expirée ou invalide. Veuillez vous reconnecter.",
      });
    }

    // Attach user and sessionToken to request
    req.user = user;
    req.sessionToken = sessionToken;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware: attaches req.user if session valid, but doesn't block if absent
 */
export async function optionalAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (sessionToken) {
      const user = await validateSession(sessionToken);
      if (user) {
        req.user = user;
        req.sessionToken = sessionToken;
      }
    }
  } catch (error) {
    // Ignore error for optional auth
  }
  next();
}

/**
 * Middleware placeholder for workspace membership verification
 * @param {string[]} allowedRoles 
 */
export function requireWorkspaceRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentification requise." });
    }

    const workspaceId = req.params.workspaceId || req.headers["x-workspace-id"];
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "Workspace ID requis." });
    }

    const membership = req.user.memberships?.find((m) => m.workspaceId === workspaceId);
    if (!membership) {
      return res.status(403).json({ success: false, message: "Accès refusé à cet espace de travail." });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
      return res.status(403).json({ success: false, message: "Permissions insuffisantes pour cette action." });
    }

    req.currentWorkspaceId = workspaceId;
    req.currentMembership = membership;
    next();
  };
}
