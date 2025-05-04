const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/asyncWrapper');
const { authenticateUser } = require('../config/authMiddleWare');
const { generalLimiter } = require('../config/authMiddleWare');
const notificationService = require('../services/notificationService');

// Get user's notifications with pagination
router.get('/', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const result = await notificationService.getNotifications(req.user.user_id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Mark notification as read
router.put('/:id/read', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.user.user_id, parseInt(req.params.id));
    res.status(200).json(notification);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Delete notification
router.delete('/:id', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    await notificationService.deleteNotification(req.user.user_id, parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

module.exports = router; 