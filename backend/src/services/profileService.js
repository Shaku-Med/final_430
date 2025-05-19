const supabase = require('../config/supabase');

async function listProfiles(adminId) {
  const { data: admin, error: adminErr } = await supabase.from('profiles').select('is_admin').eq('id', adminId).single();
  if (adminErr || !admin.is_admin) throw Object.assign(new Error('Forbidden - Admin access required'), { status: 403 });
  const { data, error } = await supabase.from('profiles').select('id,username,full_name,avatar_url,created_at,updated_at');
  if (error) throw error;
  return data;
}

async function getProfile(requesterId, targetId) {
  if (requesterId !== targetId) {
    const { data: admin, error: adminErr } = await supabase.from('profiles').select('is_admin').eq('id', requesterId).single();
    if (adminErr || !admin.is_admin) throw Object.assign(new Error('Forbidden - Can only view own profile'), { status: 403 });
  }
  const { data, error } = await supabase.from('profiles').select('id,username,full_name,avatar_url,email,created_at,updated_at').eq('id', targetId).single();
  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    throw Object.assign(new Error('Profile not found'), { status });
  }
  return data;
}

async function updateProfile(requesterId, targetId, updates) {
  if (requesterId !== targetId) {
    const { data: admin } = await supabase.from('profiles').select('is_admin').eq('id', requesterId).single();
    if (!admin.is_admin) throw Object.assign(new Error('Forbidden - Can only update own profile'), { status: 403 });
  }
  const allowed = ['username','full_name','avatar_url','is_admin'];
  const payload = {};
  allowed.forEach(k => updates[k] !== undefined && (payload[k] = updates[k]));
  const { data, error } = await supabase.from('profiles').update(payload).eq('id', targetId).select('id,username,full_name,avatar_url,is_admin,updated_at').single();
  if (error) {
    if (error.code === '23505') throw Object.assign(new Error('Username already taken'), { status: 400 });
    throw error;
  }
  return data;
}

async function deleteProfile(requesterId, targetId) {
  if (requesterId !== targetId) {
    const { data: admin } = await supabase.from('profiles').select('is_admin').eq('id', requesterId).single();
    if (!admin.is_admin) throw Object.assign(new Error('Forbidden - Can only delete own profile'), { status: 403 });
  }
  const { data: profile, error: fetchErr } = await supabase.from('profiles').select('*').eq('id', targetId).single();
  if (fetchErr) throw Object.assign(new Error('Profile not found'), { status: 404 });
  await supabase.from('profiles').delete().eq('id', targetId);
  await supabase.auth.admin.deleteUser(targetId);
  return profile;
}

module.exports = { listProfiles, getProfile, updateProfile, deleteProfile };
