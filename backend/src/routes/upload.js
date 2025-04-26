const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../config/authMiddleWare');
const wrapAsync = require('../utils/asyncWrapper');
const { uploadProfilePicture } = require('../services/uploadService');

router.post('/profile-picture', authenticateUser, wrapAsync(async (req, res) => {
  const url = await uploadProfilePicture(req.user.id, req.body);
  res.json({ message: 'Profile picture uploaded successfully', url });
}));