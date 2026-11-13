import { COOKIE_NAME } from "../config/constants.js";
import { validateSession } from "../services/sessionService.js";
import { prisma } from "../lib/prisma.js";

/**
 * Middleware ensuring user is authenticated via valid session token
 */
export async function requireAuth(req, res, next) {
  try {
    const sessionToken =
      req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");

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
    const sessionToken =
      req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
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
 * Middleware for strict workspace membership and role verification.
 * Strictly guarantees multi-tenant boundary:
 * Never auto-assigns roles or workspaces. Access is strictly granted
 * only if a valid Membership record exists between (userId, workspaceId).
 * 
 * @param {string[]} allowedRoles - Optional list of required roles (e.g. ['OWNER', 'ADMIN'])
 */
export function requireWorkspaceRole(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentification requise." });
      }

      const rawWorkspaceId = req.params.workspaceId || req.headers["x-workspace-id"];
      if (!rawWorkspaceId) {
        return res.status(400).json({ success: false, message: "Identifiant d'espace de travail requis." });
      }

      // Resolve workspace by CUID or unique slug
      const targetWorkspace = await prisma.workspace.findFirst({
        where: {
          OR: [{ id: rawWorkspaceId }, { slug: rawWorkspaceId }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      if (!targetWorkspace) {
        return res.status(404).json({ success: false, message: "Espace de travail introuvable." });
      }

      // Strict check: User MUST have an existing membership in this workspace
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId: targetWorkspace.id,
          },
        },
        include: {
          workspace: true,
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN_WORKSPACE_ACCESS",
          message: "Accès refusé. Vous n'êtes pas membre de cet espace de travail.",
        });
      }

      // Check membership operational status (Phase D.1 Reversible Suspension)
      if (membership.status === "SUSPENDED") {
        return res.status(403).json({
          success: false,
          code: "MEMBERSHIP_SUSPENDED",
          message: "Votre accès à cet espace de travail a été suspendu par l'administrateur.",
        });
      }

      if (membership.status === "ARCHIVED") {
        return res.status(403).json({
          success: false,
          code: "MEMBERSHIP_ARCHIVED",
          message: "Votre accès à cet espace de travail a été archivé.",
        });
      }

      // Check role permissions if restricted
      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Permissions insuffisantes pour effectuer cette action.",
        });
      }

      // Attach verified workspace & membership to request context
      req.currentWorkspaceId = targetWorkspace.id;
      req.currentWorkspace = targetWorkspace;
      req.currentMembership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}
