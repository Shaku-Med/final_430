const express = require('express');
const router = express.Router();
const { authenticateUser, generalLimiter } = require('../config/authMiddleWare');
const wrapAsync = require('../utils/asyncWrapper');
const { validate } = require('../utils/validateSchema');
const { eventSchema } = require('../validators/eventValidator');
const { commentSchema } = require('../validators/commentValidator');
const eventService = require('../services/eventService');
const commentService = require('../services/commentService');
const notificationService = require('../services/notificationService');

// Events
router.post('/events', authenticateUser, generalLimiter, validate(eventSchema), wrapAsync(async (req, res) => {
  const ev = await eventService.createEvent(req.user.id, req.body);
  // Notify admins about new event
  // (example: send email to all admins)
  const admins = await supabase.from('profiles').select('id').eq('is_admin', true);
  for (let a of admins.data) {
    await notificationService.createNotification(a.id, 'event', ev.id.toString(), `New event "${ev.title}" created`, true);
  }
  res.status(201).json(ev);
}));

router.get('/events', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const list = await eventService.listEvents({ limit, offset });
  res.json({ data: list, limit, offset });
}));

router.get('/events/:id', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  const ev = await eventService.getEventById(req.params.id);
  res.json(ev);
}));

router.put('/events/:id', authenticateUser, generalLimiter, validate(eventSchema), wrapAsync(async (req, res) => {
  const updated = await eventService.updateEvent(req.user.id, req.params.id, req.body);
  res.json(updated);
}));

router.delete('/events/:id', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  const deleted = await eventService.deleteEvent(req.user.id, req.params.id);
  res.json({ message: 'Event deleted', deleted });
}));

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