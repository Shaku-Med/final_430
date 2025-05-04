const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const supabase = require('./supabase');
const rateLimit = require('express-rate-limit');
const { decrypt } = require('./crypto');  

const parseCookies = cookieParser();

async function authenticateUser(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let encryptedData;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    encryptedData = payload.data;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  let userData;
  try {
    // decrypt  from crypto.js
    const json = decrypt(encryptedData);
    userData = JSON.parse(json);
  } catch {
    return res.status(401).json({ error: 'Failed to decrypt token payload' });
  }

  const { data: user, error } = await supabase
    .from('users')            
    .select('*')
    .eq('user_id', userData.user_id)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5, message: 'Too many attempts, try later' });
const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 100, message: 'Too many requests, please slow down' });

module.exports = { parseCookies, authenticateUser, authLimiter, generalLimiter };