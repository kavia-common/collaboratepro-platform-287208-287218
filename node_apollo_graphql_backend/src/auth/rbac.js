'use strict';

/**
 * Simple RBAC helper utilities.
 */

// PUBLIC_INTERFACE
function hasRole(user, role) {
  /** Return true if user has the given role. */
  if (!user || !Array.isArray(user.roles)) return false;
  return user.roles.map((r) => String(r).toLowerCase()).includes(String(role).toLowerCase());
}

// PUBLIC_INTERFACE
function requireRole(roles = []) {
  /**
   * Resolver guard: ensure current context.user has at least one of the required roles.
   * Usage in resolvers:
   *   requireRole(['admin'])(parent, args, ctx, info);
   */
  const required = (Array.isArray(roles) ? roles : [roles]).map((r) => String(r).toLowerCase());
  return (parent, args, context) => {
    const user = context.user;
    if (!user) {
      const err = new Error('Unauthorized');
      err.code = 'UNAUTHORIZED';
      throw err;
    }
    const userRoles = (user.roles || []).map((r) => String(r).toLowerCase());
    const ok = required.length === 0 || required.some((r) => userRoles.includes(r));
    if (!ok) {
      const err = new Error('Forbidden');
      err.code = 'FORBIDDEN';
      throw err;
    }
    return true;
  };
}

module.exports = { hasRole, requireRole };
