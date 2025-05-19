const supabase = require('../config/supabase');

async function createProject(userId, data) {
  const { name, description, startDate, endDate, status } = data;
  const { data: project, error } = await supabase.from('projects')
    .insert({ name, description, startDate, endDate, status, created_by: userId })
    .select().single();
  if (error) throw error;
  return project;
}

async function listProjects({ limit = 10, offset = 0 }) {
  const from = offset;
  const to = offset + limit - 1;
  const { data, error } = await supabase
    .from('projects')
    .select('id,name,description,startDate,endDate,status,created_by,created_at,updated_at')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return data;
}

async function getProjectById(id) {
  const { data, error } = await supabase.from('projects')
    .select('id,name,description,startDate,endDate,status,created_by,created_at,updated_at')
    .eq('id', id).single();
  if (error) {
    const err = new Error(error.code==='PGRST116'?'Project not found':'Failed to fetch project');
    err.status = error.code==='PGRST116'?404:500; throw err;
  }
  return data;
}

async function updateProject(id, data) {
  const { name, description, startDate, endDate, status } = data;
  const { data: project, error } = await supabase.from('projects')
    .update({ name, description, startDate, endDate, status, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return project;
}

async function deleteProject(id) {
  const project = await getProjectById(id);
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  return project;
}

// project-members
async function addProjectMember(projectId, userId, role) {
  const { data, error } = await supabase.from('project_members')
    .insert({ project_id: projectId, user_id: userId, role }).select().single();
  if (error) throw error;
  return data;
}

async function removeProjectMember(projectId, userId) {
  const { error } = await supabase.from('project_members')
    .delete().eq('project_id', projectId).eq('user_id', userId);
  if (error) throw error;
  return;
}

async function listProjectMembers(projectId) {
  const { data, error } = await supabase.from('project_members')
    .select('user_id,role,profiles(id,username,full_name,avatar_url)')
    .eq('project_id', projectId);
  if (error) throw error;
  return data;
}

module.exports = { createProject,listProjects,getProjectById,updateProject,deleteProject,addProjectMember,removeProjectMember,listProjectMembers };
