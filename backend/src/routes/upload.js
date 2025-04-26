const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Middleware to check authentication
const authenticateUser = async (req, res, next) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized - Please log in' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};

// Upload profile picture
router.post('/profile-picture', authenticateUser, async (req, res) => {
    try {
        const { fileData, fileName, fileType } = req.body;

        if (!fileData || !fileName || !fileType) {
            return res.status(400).json({ error: 'Missing required file data' });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(fileData.split(',')[1], 'base64');
        
        // Generate unique filename
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${req.user.id}/${uuidv4()}.${fileExtension}`;
        const bucket = 'profile-pictures';

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(uniqueFileName, buffer, {
                contentType: fileType,
                upsert: true,
                cacheControl: '3600'
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload file' });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(uniqueFileName);

        // Update user's profile with new avatar URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', req.user.id);

        if (updateError) {
            console.error('Profile update error:', updateError);
            return res.status(500).json({ error: 'Failed to update profile' });
        }

        res.json({
            message: 'Profile picture uploaded successfully',
            url: publicUrl
        });
    } catch (error) {
        console.error('Error in profile picture upload:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
