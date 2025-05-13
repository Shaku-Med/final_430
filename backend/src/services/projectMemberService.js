const supabase = require('../config/supabase');
const { z } = require('zod');

// Validation schemas
const projectMemberSchema = z.object({
  user_id: z.string().uuid(),
  project_id: z.string().uuid()
});

/**
 * Add a member to a project
 * @param {string} userId - The user's UUID
 * @param {string} projectId - The project's UUID
 * @returns {Promise<Object>} Created project member record
 */
async function addProjectMember(userId, projectId) {
  try {
    // Validate input
    const validatedData = projectMemberSchema.parse({
      user_id: userId,
      project_id: projectId
    });

    // Check if user exists and is not suspended
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, isSuspended')
      .eq('id', userId)
      .single();

    if (userError) {
      throw Object.assign(new Error('Failed to fetch user'), { status: 500 });
    }

    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    if (user.isSuspended) {
      throw Object.assign(new Error('User account is suspended'), { status: 403 });
    }

    // Check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      throw Object.assign(new Error('Failed to fetch project'), { status: 500 });
    }

    if (!project) {
      throw Object.assign(new Error('Project not found'), { status: 404 });
    }

    // Create project member record
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .insert([{
        user_id: userId,
        project_id: projectId
      }])
      .select()
      .single();

    if (memberError) {
      if (memberError.code === '23505') { // Unique violation
        throw Object.assign(new Error('User is already a member of this project'), { status: 409 });
      }
      throw Object.assign(new Error('Failed to add project member'), { status: 500 });
    }

    return member;
  } catch (error) {
    if (error.status) throw error;
    throw Object.assign(new Error('Failed to add project member'), { status: 500 });
  }
}

/**
 * Get project members with pagination
 * @param {string} projectId - The project's UUID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Number of members per page
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Object>} List of project members with pagination info
 */
async function getProjectMembers(projectId, { limit = 10, offset = 0 } = {}) {
  try {
    if (!Number.isInteger(limit) || !Number.isInteger(offset) || limit < 1 || offset < 0) {
      throw Object.assign(new Error('Invalid pagination parameters'), { status: 400 });
    }

    const { data: members, error, count } = await supabase
      .from('project_members')
      .select(`
        *,
        users:user_id (
          id,
          firstname,
          lastname,
          email
        )
      `, { count: 'exact' })
      .eq('project_id', projectId)
      .order('joined_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw Object.assign(new Error('Failed to fetch project members'), { status: 500 });
    }

    return {
      members,
      total: count,
      limit,
      offset
    };
  } catch (error) {
    if (error.status) throw error;
    throw Object.assign(new Error('Failed to fetch project members'), { status: 500 });
  }
}

/**
 * Remove a member from a project
 * @param {string} userId - The user's UUID
 * @param {string} projectId - The project's UUID
 * @returns {Promise<void>}
 */
async function removeProjectMember(userId, projectId) {
  try {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) {
      throw Object.assign(new Error('Failed to remove project member'), { status: 500 });
    }
  } catch (error) {
    if (error.status) throw error;
    throw Object.assign(new Error('Failed to remove project member'), { status: 500 });
  }
}

module.exports = {
  addProjectMember,
  getProjectMembers,
  removeProjectMember
}; 