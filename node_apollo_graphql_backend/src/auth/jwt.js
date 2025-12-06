'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// PUBLIC_INTERFACE
function signToken(payload, options = {}) {
  /** Sign a JWT with the configured secret. */
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...options });
}

// PUBLIC_INTERFACE
function verifyToken(token) {
  /** Verify a JWT and return the decoded payload. Throws on invalid. */
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract 'Bearer <token>' token from an Authorization header string.
 * Returns null if no valid header.
 */
function extractBearerToken(authorization) {
  if (!authorization || typeof authorization !== 'string') return null;
  const parts = authorization.split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

module.exports = {
  signToken,
  verifyToken,
  extractBearerToken,
};
