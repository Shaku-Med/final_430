const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/asyncWrapper');
const { authenticateUser } = require('../config/authMiddleWare');
const { validate } = require('../utils/validateSchema');
const { updateProfileSchema } = require('../validator/profileValidator');
const { listProfiles, getProfile, updateProfile, deleteProfile } = require('../services/profileService');
const { generalLimiter } = require('../config/authMiddleWare');


router.get('/', authenticateUser, generalLimiter, wrapAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const list = await profileService.listProfiles({ limit, offset });
  res.json({ data: list, limit, offset });
}));

router.get('/:id', authenticateUser, wrapAsync(async (req, res) => {
  const profile = await getProfile(req.user.id, req.params.id);
  res.json(profile);
}));

router.put('/:id', authenticateUser, validate(updateProfileSchema), wrapAsync(async (req, res) => {
  const updated = await updateProfile(req.user.id, req.params.id, req.body);
  res.json(updated);
}));

router.delete('/:id', authenticateUser, wrapAsync(async (req, res) => {
  const deleted = await deleteProfile(req.user.id, req.params.id);
  res.json({ message: 'Profile deleted successfully', deletedProfile: deleted });
}));

module.exports = router;
