const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { generalLimiter } = require('./src/config/authMiddleWare');
const authRoutes = require('./src/routes/auth');
const uploadRoutes = require('./src/routes/upload');
const tokenRoutes = require('./src/routes/token');
const profileRoutes = require('./src/routes/profile');
const projectRoutes = require('./src/routes/project');
const notificationRoutes = require('./src/routes/notifications');
const eventRoutes = require('./src/routes/event');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Mount routes
app.use('/api', authRoutes, uploadRoutes, tokenRoutes, profileRoutes, projectRoutes, notificationRoutes, eventRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));