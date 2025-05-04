const supabase = require('../config/supabase');

async function createEvent(userId, data) {
  // Only admins can create events
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();
  if (!profile.is_admin) throw Object.assign(new Error('Forbidden - Admins only'), { status: 403 });

  const { data: event, error } = await supabase.from('events').insert([{ ...data, created_by: userId }]).select().single();
  if (error) throw error;
  return event;
}

async function listEvents({ limit = 10, offset = 0 }) {
  const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

async function getEventById(id) {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error) throw Object.assign(new Error('Event not found'), { status: 404 });
  return data;
}

async function updateEvent(userId, id, updates) {
  const { data: event } = await getEventById(id);
  if (event.created_by !== userId) throw Object.assign(new Error('Forbidden - Not creator'), { status: 403 });
  const { data: updated, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

async function deleteEvent(userId, id) {
  const { data: event } = await getEventById(id);
  if (event.created_by !== userId) throw Object.assign(new Error('Forbidden - Not creator'), { status: 403 });
  await supabase.from('event_comments').delete().eq('event_id', id);
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
  return event;
}

async function registerForEvent(eventId, userId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([{ event_id: eventId, user_id: userId }])
    .single();
  if (error) throw error;
  return data;
}

async function listEventRegistrations(eventId) {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('user_id,registered_at, profiles(id,username,full_name,avatar_url)')
    .eq('event_id', eventId);
  if (error) throw error;
  return data;
}

async function unregisterFromEvent(eventId, userId) {
  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);
  if (error) throw error;
}

module.exports = { createEvent, listEvents, getEventById, updateEvent, deleteEvent,registerForEvent,listEventRegistrations,unregisterFromEvent };