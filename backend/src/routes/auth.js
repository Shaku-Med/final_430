const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/asyncWrapper');
const { signup, verifyCode, login } = require('../services/authService');
const { authLimiter } = require('../config/authMiddleWare');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/definitions/User'
 *       400:
 *         description: Invalid input or email already exists
 */
router.post('/signup', authLimiter, wrapAsync(async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const user = await signup({ email, password, firstName, lastName });
    res.status(201).json({ 
      message: 'Signup successful! Check email for verification code.', 
      user: { 
        id: user.id,
        email: user.email
      } 
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

/**
 * @swagger
 * /api/auth/verify-code:
 *   post:
 *     summary: Verify user's email with code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 length: 6
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/definitions/User'
 *       400:
 *         description: Invalid or expired code
 */
router.post('/verify-code', authLimiter, wrapAsync(async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Missing email or verification code' });
    }
    const user = await verifyCode({ email, code });
    res.status(200).json({ 
      message: 'Email verified successfully!', 
      user: { 
        id: user.id,
        email: user.email
      } 
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/definitions/User'
 *                 session:
 *                   type: object
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified or account suspended
 */
router.post('/login', authLimiter, wrapAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const data = await login({ email, password });
    res.status(200).json({ 
      message: 'Login successful!', 
      user: {
        id: data.user.id,
        email: data.user.email
      },
      userData: {
        firstName: data.userData.firstname,
        lastName: data.userData.lastname,
        isVerified: data.userData.isVerified,
        accountType: data.userData.account_type
      },
      session: data.session
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

module.exports = router;