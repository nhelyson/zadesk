/**
 * Centralized RBAC and granular permissions matrix for Zadesk
 */

export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER", // Superviseur SAV
  AGENT: "AGENT",     // Agent SAV
};

export const PERMISSIONS = {
  // Tickets
  TICKETS_VIEW_ASSIGNED: "tickets:view_assigned",
  TICKETS_VIEW_SHARED: "tickets:view_shared",
  TICKETS_VIEW_ALL: "tickets:view_all",
  TICKETS_CREATE: "tickets:create",
  TICKETS_UPDATE_ASSIGNED: "tickets:update_assigned",
  TICKETS_RESOLVE_ASSIGNED: "tickets:resolve_assigned",
  TICKETS_REASSIGN: "tickets:reassign",
  TICKETS_SHARE: "tickets:share",

  // Conversations
  CONVERSATIONS_VIEW_ASSIGNED: "conversations:view_assigned",
  CONVERSATIONS_VIEW_SHARED: "conversations:view_shared",
  CONVERSATIONS_VIEW_ALL: "conversations:view_all",
  CONVERSATIONS_REPLY: "conversations:reply",
  CONVERSATIONS_INTERNAL_NOTE: "conversations:internal_note",
  CONVERSATIONS_REASSIGN: "conversations:reassign",
  CONVERSATIONS_LINK_TICKET: "conversations:link_ticket",

  // Team & Agent management
  TEAM_VIEW: "team:view",
  TEAM_MANAGE: "team:manage",
  SKILLS_VALIDATE: "skills:validate",

  // Profile
  PROFILE_VIEW_SELF: "profile:view_self",
  PROFILE_UPDATE_SELF: "profile:update_self",

  // Reports & Settings
  REPORTS_VIEW: "reports:view",
  SETTINGS_MANAGE: "settings:manage",
};

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS).filter(
    (p) => p !== PERMISSIONS.SETTINGS_MANAGE || true
  ),
  [ROLES.MANAGER]: [
    PERMISSIONS.TICKETS_VIEW_ASSIGNED,
    PERMISSIONS.TICKETS_VIEW_SHARED,
    PERMISSIONS.TICKETS_VIEW_ALL,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_UPDATE_ASSIGNED,
    PERMISSIONS.TICKETS_RESOLVE_ASSIGNED,
    PERMISSIONS.TICKETS_REASSIGN,
    PERMISSIONS.TICKETS_SHARE,
    PERMISSIONS.CONVERSATIONS_VIEW_ASSIGNED,
    PERMISSIONS.CONVERSATIONS_VIEW_SHARED,
    PERMISSIONS.CONVERSATIONS_VIEW_ALL,
    PERMISSIONS.CONVERSATIONS_REPLY,
    PERMISSIONS.CONVERSATIONS_INTERNAL_NOTE,
    PERMISSIONS.CONVERSATIONS_REASSIGN,
    PERMISSIONS.CONVERSATIONS_LINK_TICKET,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.SKILLS_VALIDATE,
    PERMISSIONS.PROFILE_VIEW_SELF,
    PERMISSIONS.PROFILE_UPDATE_SELF,
    PERMISSIONS.REPORTS_VIEW,
  ],
  [ROLES.AGENT]: [
    PERMISSIONS.TICKETS_VIEW_ASSIGNED,
    PERMISSIONS.TICKETS_VIEW_SHARED,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_UPDATE_ASSIGNED,
    PERMISSIONS.TICKETS_RESOLVE_ASSIGNED,
    PERMISSIONS.CONVERSATIONS_VIEW_ASSIGNED,
    PERMISSIONS.CONVERSATIONS_VIEW_SHARED,
    PERMISSIONS.CONVERSATIONS_REPLY,
    PERMISSIONS.CONVERSATIONS_INTERNAL_NOTE,
    PERMISSIONS.CONVERSATIONS_LINK_TICKET,
    PERMISSIONS.PROFILE_VIEW_SELF,
    PERMISSIONS.PROFILE_UPDATE_SELF,
  ],
};

/**
 * Check if a role has a given permission
 */
export function hasPermission(role, permission) {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}
