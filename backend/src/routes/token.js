const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/asyncWrapper');
const { generateAndStore, refreshAndStore } = require('../services/tokenService');

// Generate token endpoint
router.post(
  '/generate-token',
  wrapAsync(async (req, res) => {
    const { userData } = req.body;
    const { token, refreshToken } = await generateAndStore(userData);

    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 3600000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 604800000 });

    res.status(200).json({ token, refresh_token: refreshToken, expire: new Date(Date.now() + 3600000).toISOString() });
  })
);

// Refresh token endpoint
router.post(
  '/refresh-token',
  wrapAsync(async (req, res) => {
    const oldRefresh = req.cookies.refresh_token;
    if (!oldRefresh) return res.status(400).json({ error: 'No refresh token provided' });

    const { token, refreshToken } = await refreshAndStore(oldRefresh);

    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 3600000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 604800000 });

    res.status(200).json({ token, refresh_token: refreshToken, expire: new Date(Date.now() + 3600000).toISOString() });
  })
);

module.exports = router;