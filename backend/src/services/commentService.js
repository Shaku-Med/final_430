const { commentSchema } = require('../validator/commentValidator');
const supabase = require('../config/supabase');

async function addComment(eventId, userId, content) {
  //  Validate inputs
  const valid = commentSchema.parse({ content });
  
  //  Build and insert payload explicitly
  const payload = {
    event_id: eventId,
    user_id: userId,
    content: valid.content,
    created_at: new Date().toISOString()
  };

  // 3) Insert into DB
  const { data, error } = await supabase
    .from('event_comments')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function listComments(eventId, { limit = 20, offset = 0 }) {
  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    throw Object.assign(new Error('Invalid pagination parameters'), { status: 400 });
  }

  const { data, error } = await supabase
    .from('event_comments')
    .select('id,event_id,user_id,content,created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

async function deleteComment(userId, commentId) {

  const { data, error: fetchError } = await supabase
    .from('event_comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if (fetchError) throw fetchError;
  if (data.user_id !== userId) {
    throw Object.assign(new Error('Forbidden - Not author'), { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from('event_comments')
    .delete()
    .eq('id', commentId);

  if (deleteError) throw deleteError;
}

module.exports = { addComment, listComments, deleteComment };