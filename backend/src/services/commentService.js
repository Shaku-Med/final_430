const supabase = require('../config/supabase');

async function addComment(eventId, userId, content) {
  const { data, error } = await supabase.from('event_comments').insert([{ event_id: eventId, user_id: userId, content, created_at: new Date().toISOString() }]).select().single();
  if (error) throw error;
  return data;
}

async function listComments(eventId, { limit = 20, offset = 0 }) {
  const { data, error } = await supabase.from('event_comments').select('id,event_id,user_id,content,created_at').eq('event_id', eventId).order('created_at', { ascending: true }).range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

async function deleteComment(userId, commentId) {
  const { data } = await supabase.from('event_comments').select('user_id').eq('id', commentId).single();
  if (data.user_id !== userId) throw Object.assign(new Error('Forbidden - Not author'), { status: 403 });
  const { error } = await supabase.from('event_comments').delete().eq('id', commentId);
  if (error) throw error;
}

module.exports = { addComment, listComments, deleteComment };