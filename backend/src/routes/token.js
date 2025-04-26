const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { encrypt, decrypt } = require('./Enc');
const supabase = require('../config/supabase');

require('dotenv').config();





// Encrypt and generate token for a user
const createUserToken = (userData) => {
  try {
    // Encrypt user data with the provided keys
    const encryptedData = encrypt(JSON.stringify(userData), process.env.ENCRYPTION_KEY);

    if (!encryptedData) {
      throw new Error('Encryption failed');
    }

    // Create JWT token with encrypted data
    const token = jwt.sign({ data: encryptedData }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Generate a refresh token (optional)
    const refreshToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '7d' });

    return { token, refreshToken };
  } catch (error) {
    console.error('Token creation failed', error);
    return null;
  }
};

// Endpoint to generate a token and store it in Supabase
router.post('/generate-token', async (req, res) => {
  const { userData } = req.body;

  // Generate the token
  const { token, refreshToken } = createUserToken(userData);
  if (!token || !refreshToken) {
    return res.status(500).json({ error: 'Token generation failed' });
  }

  // Store the token in Supabase 
  const { data, error } = await supabase
    .from('user_tokens')
    .upsert({ user_id: userData.user_id, token, refresh_token: refreshToken, expires_at: new Date(Date.now() + 3600000) });

  if (error) {
    return res.status(500).json({ error: 'Failed to save token in database' });
  }

  // Set the token as an HttpOnly, Secure cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 3600000, // 1 hour expiry
    sameSite: 'Strict',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 604800000, // 7 days expiry
    sameSite: 'Strict',
  });

  // Send response with token info
  res.json({
    token,
    expire: new Date(Date.now() + 3600000), // Set expiry time to 1 hour
    refresh_token: refreshToken,
  });
});


router.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
  
    if (!refreshToken) {
      return res.status(400).json({ error: 'No refresh token provided' });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  
      // You can regenerate the original token by fetching user data from Supabase
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('refresh_token', refreshToken)
        .single();
  
      if (error || !data) {
        return res.status(400).json({ error: 'Invalid refresh token' });
      }
  
      const userData = { user_id: data.user_id };  // Add additional info as needed
      const { token, refreshToken: newRefreshToken } = createUserToken(userData);
  
      // Update the token in Supabase
      await supabase
        .from('user_tokens')
        .upsert({ user_id: userData.user_id, token, refresh_token: newRefreshToken, expires_at: new Date(Date.now() + 3600000) });
  
      // Set new tokens in cookies
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: 'Strict',
      });
  
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 604800000,
        sameSite: 'Strict',
      });
  
      res.json({
        token,
        expire: new Date(Date.now() + 3600000), // 1 hour expiry
        refresh_token: newRefreshToken,
      });
  
    } catch (error) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }
  });
  
module.exports = router;