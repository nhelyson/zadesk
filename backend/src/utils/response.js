/**
 * Format public safe user profile
 * @param {Object} user 
 * @returns {Object}
 */
export function formatPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl || null,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt,
    memberships: user.memberships ? user.memberships.map((m) => ({
      id: m.id,
      role: m.role,
      workspace: m.workspace ? {
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
      } : undefined,
    })) : undefined,
  };
}

/**
 * Standard JSON success response
 */
export function successResponse(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
}

/**
 * Standard JSON error response
 */
export function errorResponse(res, message = "Une erreur est survenue.", statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

export const sendSuccess = (res, statusCode, message, data) => {
  if (typeof statusCode === "object") {
    return successResponse(res, statusCode);
  }
  return res.status(statusCode || 200).json({
    success: true,
    message,
    ...data,
  });
};

export const sendError = (res, statusCode, message, errors) => {
  return errorResponse(res, message, statusCode, errors);
};

