const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/asyncWrapper');
const { signup, verifyCode, login } = require('../services/authService');
const { authLimiter } = require('../config/authMiddleWare');

router.post('/signup', authLimiter, wrapAsync(async (req, res) => {
  const user = await signup(req.body);
  res.status(200).json({ message: 'Signup successful! Check email for code.', user });
}));

router.post('/verify-code', authLimiter, wrapAsync(async (req, res) => {
  const user = await verifyCode(req.body);
  res.status(200).json({ message: 'Email verified successfully!', user });
}));

router.post('/login', authLimiter, wrapAsync(async (req, res) => {
  const data = await login(req.body);
  res.status(200).json({ message: 'Login successful!', ...data });
}));

module.exports = router;