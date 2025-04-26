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

// POST /projects - Create new project
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { name, description, startDate, endDate, status } = req.body;
        
        const { data, error } = await supabase
            .from('projects')
            .insert({
                name,
                description,
                startDate,
                endDate,
                status,
                created_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// GET /projects - List all projects
router.get('/', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                id,
                name,
                description,
                startDate,
                endDate,
                status,
                created_by,
                created_at,
                updated_at
            `);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET /projects/:id - Get specific project
router.get('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('projects')
            .select(`
                id,
                name,
                description,
                startDate,
                endDate,
                status,
                created_by,
                created_at,
                updated_at
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Project not found' });
            }
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// PUT /projects/:id - Update project
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, startDate, endDate, status } = req.body;

        const { data, error } = await supabase
            .from('projects')
            .update({
                name,
                description,
                startDate,
                endDate,
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Project not found' });
        
        res.json(data);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE /projects/:id - Delete project
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        // First get the project to return in response
        const { data: project, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete the project
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.json({ 
            message: 'Project deleted successfully',
            deletedProject: project 
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Project Members Routes
// POST /projects/:id/members - Add member to project
router.post('/:id/members', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.body;

        const { data, error } = await supabase
            .from('project_members')
            .insert({
                project_id: id,
                user_id: userId,
                role
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error adding project member:', error);
        res.status(500).json({ error: 'Failed to add project member' });
    }
});

// DELETE /projects/:id/members/:userId - Remove member from project
router.delete('/:id/members/:userId', authenticateUser, async (req, res) => {
    try {
        const { id, userId } = req.params;

        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('project_id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing project member:', error);
        res.status(500).json({ error: 'Failed to remove project member' });
    }
});

// GET /projects/:id/members - Get project members
router.get('/:id/members', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('project_members')
            .select(`
                user_id,
                role,
                profiles (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq('project_id', id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching project members:', error);
        res.status(500).json({ error: 'Failed to fetch project members' });
    }
});

module.exports = router;