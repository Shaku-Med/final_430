const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/asyncWrapper');
const { authenticateUser } = require('../config/authMiddleWare');
const { validate } = require('../utils/validateSchema');
const { createProjectSchema, updateProjectSchema } = require('../validators/projectValidator');
const projectService = require('../services/projectService');
const { generalLimiter } = require('../config/authMiddleWare');


router.post('/', authenticateUser, validate(createProjectSchema), wrapAsync(async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.body);
  res.status(201).json(project);
}));

router.get('/', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const list = await projectService.listProjects({ limit, offset });
  res.json({ data: list, limit, offset });
}));

router.get('/:id', authenticateUser, wrapAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  res.json(project);
}));

router.put('/:id', authenticateUser, validate(updateProjectSchema), wrapAsync(async (req, res) => {
    const updated = await projectService.updateProject(req.params.id, req.body);
    res.json(updated);
  }));

router.delete('/:id', authenticateUser, wrapAsync(async (req, res) => {
  const deleted = await projectService.deleteProject(req.params.id);
  res.json({ message: 'Project deleted successfully', deletedProject: deleted });
}));

// Members
router.post('/:id/members', authenticateUser, wrapAsync(async (req, res) => {
  const member = await projectService.addProjectMember(req.params.id, req.body.userId, req.body.role);
  res.status(201).json(member);
}));

router.delete('/:id/members/:userId', authenticateUser, wrapAsync(async (req, res) => {
  await projectService.removeProjectMember(req.params.id, req.params.userId);
  res.json({ message: 'Member removed successfully' });
}));

router.get('/:id/members', authenticateUser, wrapAsync(async (req, res) => {
  const members = await projectService.listProjectMembers(req.params.id);
  res.json(members);
}));

module.exports = router;
