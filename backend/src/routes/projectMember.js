const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/asyncWrapper');
const { authenticateUser } = require('../config/authMiddleWare');
const { generalLimiter } = require('../config/authMiddleWare');
const projectMemberService = require('../services/projectMemberService');

// Get project members with pagination
router.get('/:projectId/members', generalLimiter, wrapAsync(async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const result = await projectMemberService.getProjectMembers(req.params.projectId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Add member to project (requires authentication)
router.post('/:projectId/members', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    const member = await projectMemberService.addProjectMember(req.user.user_id, req.params.projectId);
    res.status(201).json(member);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

// Remove member from project (requires authentication)
router.delete('/:projectId/members', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  try {
    await projectMemberService.removeProjectMember(req.user.user_id, req.params.projectId);
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}));

module.exports = router; 