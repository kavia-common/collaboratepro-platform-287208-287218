'use strict';

const { extractBearerToken, verifyToken } = require('../auth/jwt');

/**
 * Express middleware to attach req.user if Authorization: Bearer <token> is valid.
 */
function attachUser(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        companyId: decoded.companyId,
        roles: decoded.roles || [],
      };
    }
  } catch (err) {
    // Ignore invalid token; treat as anonymous
  }
  return next();
}

module.exports = {
  attachUser,
};
