// index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const {
  parseCookies,
  authenticateUser,
  authLimiter,
  generalLimiter
} = require('./src/config/authMiddleWare');

const authRoutes         = require('./src/routes/auth');
const uploadRoutes       = require('./src/routes/upload');
const tokenRoutes        = require('./src/routes/token');
const profileRoutes      = require('./src/routes/profile');
const projectRoutes      = require('./src/routes/project');
const notificationRoutes = require('./src/routes/notifications');
const eventRoutes        = require('./src/routes/event');

const app = express();

// Global security & parsing
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser must run before reading req.cookies
app.use(parseCookies);

// Rate limit all routes
app.use(generalLimiter);

// ───── Public (no-auth) routes ─────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/token', tokenRoutes);  // generating tokens itself uses cookies auth

// ───── Protected routes ─────
// All of these will require a valid auth_token cookie
app.use('/api/upload',       authenticateUser, uploadRoutes);
app.use('/api/profile',      authenticateUser, profileRoutes);
app.use('/api/project',      authenticateUser, projectRoutes);
app.use('/api/notifications',authenticateUser, notificationRoutes);
app.use('/api/events',       authenticateUser, eventRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status  = err.status  || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
