const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

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

// GET /profiles - List all profiles (admin only)
router.get('/', authenticateUser, async (req, res) => {
    try {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', req.user.id)
            .single();

        if (profileError || !profile?.is_admin) {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                full_name,
                avatar_url,
                created_at,
                updated_at
            `);

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

// GET /profiles/:id - Get specific profile
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Allow users to view their own profile or admin to view any profile
        if (req.user.id !== id) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', req.user.id)
                .single();

            if (profileError || !profile?.is_admin) {
                return res.status(403).json({ error: 'Forbidden - Can only view own profile' });
            }
        }

        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                full_name,
                avatar_url,
                email,
                created_at,
                updated_at
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Profile not found' });
            }
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /profiles/:id - Update profile
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Only allow users to update their own profile or admin to update any profile
        if (req.user.id !== id) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', req.user.id)
                .single();

            if (profileError || !profile?.is_admin) {
                return res.status(403).json({ error: 'Forbidden - Can only update own profile' });
            }
        }

        // Validate update data
        const allowedFields = ['username', 'full_name', 'avatar_url'];
        const updateData = {};
        
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        // Check if trying to update admin status (only allowed by other admins)
        if (req.body.is_admin !== undefined && req.user.id !== id) {
            const { data: adminProfile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', req.user.id)
                .single();

            if (adminProfile?.is_admin) {
                updateData.is_admin = req.body.is_admin;
            }
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select(`
                id,
                username,
                full_name,
                avatar_url,
                is_admin,
                updated_at
            `)
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return res.status(400).json({ error: 'Username already taken' });
            }
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// DELETE /profiles/:id - Delete profile
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Only allow users to delete their own profile or admin to delete any profile
        if (req.user.id !== id) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', req.user.id)
                .single();

            if (profileError || !profile?.is_admin) {
                return res.status(403).json({ error: 'Forbidden - Can only delete own profile' });
            }
        }

        // First, get the profile to return in response
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Delete the profile
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw deleteError;
        }

        // Also delete the auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) {
            console.error('Error deleting auth user:', authError);
        }

        res.json({ 
            message: 'Profile deleted successfully',
            deletedProfile: profile 
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

module.exports = router;

