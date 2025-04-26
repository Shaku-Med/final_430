const supabase = require('./supabase');
const rateLimit = require('express-rate-limit');

// Authenticated user check
async function authenticateUser(req, res, next) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

// Rate limiter for auth-sensitive routes (signup/login)
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5, message: 'Too many attempts, try later' });

// General rate limiter for all other routes
const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 100, message: 'Too many requests, please slow down' });

module.exports = { authenticateUser, authLimiter, generalLimiter };