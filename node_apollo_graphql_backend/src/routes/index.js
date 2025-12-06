const express = require('express');
const healthController = require('../controllers/health');
const { attachUser } = require('../middleware');
const authRoutes = require('./auth');
const { facilitate } = require('../integrations/ai');

const router = express.Router();

// Health endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Auth REST endpoints
router.use('/auth', authRoutes);

// AI deterministic stub
router.post('/ai/facilitate', attachUser, async (req, res) => {
  try {
    const { prompt } = req.body || {};
    const result = await facilitate(prompt, { companyId: req.user?.companyId || null });
    return res.status(200).json(result);
  } catch (err) {
    console.error('AI facilitate error:', err);
    return res.status(500).json({ error: 'AI facilitation failed' });
  }
});

module.exports = router;
