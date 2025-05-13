const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const supabase = require('./supabase');
const rateLimit = require('express-rate-limit');
const { decrypt } = require('./crypto');  

const parseCookies = cookieParser();

async function authenticateUser(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized - No authentication token provided' });

  let encryptedData;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    encryptedData = payload.data;
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
  }

  let userData;
  try {
    // decrypt  from crypto.js
    const json = decrypt(encryptedData);
    userData = JSON.parse(json);
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized - Failed to decrypt token payload' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userData.user_id)
    .single();

  if (error) {
    return res.status(500).json({ error: 'Internal server error - Failed to fetch user' });
  }
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized - User not found' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ error: 'Forbidden - Account is suspended' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ error: 'Forbidden - Email not verified' });
  }

  req.user = user;
  next();
}

const authLimiter = rateLimit({ 
  windowMs: 15*60*1000, 
  max: 5, 
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({ 
  windowMs: 15*60*1000, 
  max: 100, 
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { parseCookies, authenticateUser, authLimiter, generalLimiter };