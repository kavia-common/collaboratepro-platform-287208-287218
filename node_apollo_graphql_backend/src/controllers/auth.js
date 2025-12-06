'use strict';

const bcrypt = require('bcryptjs');
const { signToken } = require('../auth/jwt');
const Company = require('../models/Company');
const User = require('../models/User');
const Membership = require('../models/Membership');

const VALID_ROLES = ['admin', 'member'];

/**
 * Normalize role input ensuring it's one of allowed roles; fallback to 'member'.
 */
function normalizeRoles(inputRoles) {
  if (!inputRoles) return ['member'];
  const roles = Array.isArray(inputRoles) ? inputRoles : [inputRoles];
  const norm = roles
    .map((r) => String(r || '').toLowerCase().trim())
    .filter((r) => VALID_ROLES.includes(r));
  return norm.length ? norm : ['member'];
}

class AuthController {
  /**
   * POST /auth/register
   * Body: { email, name, password, companyName, roles? }
   * Creates user under company (creates company if needed).
   */
  async register(req, res) {
    try {
      const { email, name, password, companyName, roles } = req.body || {};
      if (!email || !name || !password || !companyName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let company = await Company.findOne({ name: companyName }).lean();
      if (!company) {
        company = await Company.create({ name: companyName });
      }

      const companyId = company._id;
      const existing = await User.findOne({ companyId, email: String(email).toLowerCase() }).lean();
      if (existing) {
        return res.status(409).json({ error: 'User already exists for this company' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const finalRoles = normalizeRoles(roles);
      const user = await User.create({
        email: String(email).toLowerCase(),
        name,
        passwordHash,
        roles: finalRoles,
        companyId,
        status: 'active',
      });

      await Membership.create({ userId: user._id, companyId, roles: finalRoles });

      const token = signToken({ userId: user._id.toString(), companyId: companyId.toString(), roles: finalRoles });

      return res.status(201).json({
        token,
        user: { id: user._id.toString(), email: user.email, name: user.name, roles: finalRoles, companyId: companyId.toString() },
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Registration failed' });
    }
  }

  /**
   * POST /auth/login
   * Body: { email, password, companyName }
   */
  async login(req, res) {
    try {
      const { email, password, companyName } = req.body || {};
      if (!email || !password || !companyName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const company = await Company.findOne({ name: companyName });
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      const companyId = company._id;
      const user = await User.findOne({ companyId, email: String(email).toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const roles = user.roles || [];
      const token = signToken({ userId: user._id.toString(), companyId: companyId.toString(), roles });

      return res.status(200).json({
        token,
        user: { id: user._id.toString(), email: user.email, name: user.name, roles, companyId: companyId.toString() },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * GET /auth/me
   * Read user from req.user set by JWT middleware.
   */
  async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { userId, companyId } = req.user;
      const user = await User.findOne({ _id: userId, companyId }).lean();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles || [],
        companyId: user.companyId.toString(),
      });
    } catch (err) {
      console.error('Me error:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
}

module.exports = new AuthController();
