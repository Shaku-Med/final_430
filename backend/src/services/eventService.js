const supabase = require('../config/supabase');
const { eventSchema } = require('../validators/eventValidator');

async function createEvent(userId, rawData) {
  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (!profile?.is_admin) {
    throw Object.assign(new Error('Forbidden - Admins only'), { status: 403 });
  }

  // 1) Validate the rawData
  const valid = eventSchema.parse(rawData);

  //  Build insert payload
  const payload = {
    title:       valid.title,
    description: valid.description,
    date:        new Date(valid.date).toISOString(),
    location:    valid.location || null,
    created_by:  userId,
    created_at:  new Date().toISOString()
  };

  //  Insert and return
  const { data: event, error } = await supabase
    .from('events')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return event;
}

async function listEvents({ limit = 10, offset = 0 }) {
  if (!Number.isInteger(limit) || !Number.isInteger(offset)) {
    throw Object.assign(new Error('Invalid pagination parameters'), { status: 400 });
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw Object.assign(new Error('Event not found'), { status: 404 });
  }
  return data;
}

async function updateEvent(userId, id, rawUpdates) {
  // 1) Fetch and permission-check
  const event = await getEventById(id);
  if (event.created_by !== userId) {
    throw Object.assign(new Error('Forbidden - Not creator'), { status: 403 });
  }

  // 2) Validate updates against same schema (or have a separate `updateEventSchema`)
  const valid = eventSchema.partial().parse(rawUpdates);

  // 3) Build payload exactly
  const payload = { ...valid, updated_at: new Date().toISOString() };

  const { data: updated, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

async function deleteEvent(userId, id) {
  const event = await getEventById(id);
  if (event.created_by !== userId) {
    throw Object.assign(new Error('Forbidden - Not creator'), { status: 403 });
  }

  // clean up comments first
  await supabase.from('event_comments').delete().eq('event_id', id);

  // then delete event
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

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent: async (eventId, userId) => {

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{ event_id: eventId, user_id: userId }])
      .single();
    if (error) throw error;
    return data;
  },
  listEventRegistrations,
  unregisterFromEvent
};