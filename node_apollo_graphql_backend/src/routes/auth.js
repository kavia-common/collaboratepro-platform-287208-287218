'use strict';

const express = require('express');
const { attachUser } = require('../middleware');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', attachUser, authController.me.bind(authController));

module.exports = router;
