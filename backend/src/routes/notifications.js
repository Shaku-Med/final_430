const express = require('express');
const router = express.Router();
const { authenticateUser, generalLimiter } = require('../config/authMiddleWare');
const wrapAsync = require('../utils/asyncWrapper');
const notificationService = require('../services/notificationService');

// GET /notifications?limit=&offset=
router.get('/', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const list = await notificationService.listNotifications(req.user.id, { limit, offset });
  res.json({ data: list, limit, offset });
}));

// PUT /notifications/:id/read
router.put('/:id/read', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  await notificationService.markAsRead(req.params.id);
  res.json({ message: 'Notification marked as read' });
}));

module.exports = router;