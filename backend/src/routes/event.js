const express = require('express');
const router = express.Router();
const { authenticateUser, generalLimiter } = require('../config/authMiddleWare');
const wrapAsync = require('../utils/asyncWrapper');
const { validate } = require('../utils/validateSchema');
const { eventSchema } = require('../validator/eventValidator');
const { commentSchema } = require('../validator/commentValidator');
const eventService = require('../services/eventService');
const commentService = require('../services/commentService');
const notificationService = require('../services/notificationService');

// Get events with optional filters
router.get('/', generalLimiter, wrapAsync(async (req, res) => {
  try {
    const { limit = 10, offset = 0, startDate, endDate } = req.query;
    const result = await eventService.getEvents({
      limit: parseInt(limit),
      offset: parseInt(offset),
      startDate,
      endDate
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Get single event
router.get('/:id', generalLimiter, wrapAsync(async (req, res) => {
  try {
    const event = await eventService.getEventById(parseInt(req.params.id));
    res.status(200).json(event);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Create event (requires authentication)
router.post('/', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    const event = await eventService.createEvent(req.user.user_id, req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Update event (requires authentication)
router.put('/:id', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.user.user_id, parseInt(req.params.id), req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Delete event (requires authentication)
router.delete('/:id', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    await eventService.deleteEvent(req.user.user_id, parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Events Registeration handling
router.post(
  '/events/:id/register',
  authenticateUser,
  generalLimiter,
  wrapAsync(async (req, res) => {
    const registration = await eventService.registerForEvent(req.params.id, req.user.id);
    res.status(201).json(registration);
  })
);

// List registrations for an event (admin or event creator)
router.get(
  '/events/:id/registrations',
  authenticateUser,
  generalLimiter,
  wrapAsync(async (req, res) => {
    // optional: check req.user.is_admin or is creator
    const list = await eventService.listEventRegistrations(req.params.id);
    res.json(list);
  })
);

// Unregister from an event
router.delete(
  '/events/:id/register',
  authenticateUser,
  generalLimiter,
  wrapAsync(async (req, res) => {
    await eventService.unregisterFromEvent(req.params.id, req.user.id);
    res.json({ message: 'Unregistered successfully' });
  })
);

// Comments
router.post('/events/:id/comments', authenticateUser, generalLimiter, validate(commentSchema), wrapAsync(async (req, res) => {
  const comment = await commentService.addComment(req.params.id, req.user.id, req.body.content);
  // Notify event creator
  const ev = await eventService.getEventById(req.params.id);
  await notificationService.createNotification(ev.created_by, 'comment', comment.id.toString(), `New comment on event "${ev.title}"`, true);
  res.status(201).json(comment);
}));

router.get('/events/:id/comments', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const list = await commentService.listComments(req.params.id, { limit, offset });
  res.json({ data: list, limit, offset });
}));

router.delete('/events/:id/comments/:commentId', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  await commentService.deleteComment(req.user.id, req.params.commentId);
  res.json({ message: 'Comment deleted' });
}));

module.exports = router;