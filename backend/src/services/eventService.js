const supabase = require('../config/supabase');
const { eventSchema } = require('../validator/eventValidator');

// Event validation schema


/**
 * Create a new event
 * @param {string} userId - The user's UUID
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event
 */
async function createEvent(userId, eventData) {
  // Validate input
  const validatedData = eventSchema.parse(eventData);

  // Check if user exists and is not suspended
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, isSuspended')
    .eq('user_id', userId)
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

  // Create event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert([{
      title: validatedData.title,
      description: validatedData.description,
      date: new Date(validatedData.date).toISOString(),
      location: validatedData.location,
      created_by: userId,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (eventError) {
    throw Object.assign(new Error('Failed to create event'), { status: 500 });
  }

  return event;
}

/**
 * Get events with pagination and optional filters
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of events per page
 * @param {number} options.offset - Offset for pagination
 * @param {string} options.startDate - Filter events after this date
 * @param {string} options.endDate - Filter events before this date
 * @returns {Promise<Object>} List of events with pagination info
 */
async function getEvents({ limit = 10, offset = 0, startDate, endDate } = {}) {
  if (!Number.isInteger(limit) || !Number.isInteger(offset) || limit < 1 || offset < 0) {
    throw Object.assign(new Error('Invalid pagination parameters'), { status: 400 });
  }

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('date', { ascending: true });

  if (startDate) {
    query = query.gte('date', new Date(startDate).toISOString());
  }

  if (endDate) {
    query = query.lte('date', new Date(endDate).toISOString());
  }

  const { data: events, error, count } = await query
    .range(offset, offset + limit - 1);

  if (error) {
    throw Object.assign(new Error('Failed to fetch events'), { status: 500 });
  }

  return {
    events,
    total: count,
    limit,
    offset
  };
}

/**
 * Get a single event by ID
 * @param {number} eventId - Event ID
 * @returns {Promise<Object>} Event details
 */
async function getEventById(eventId) {
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      users:created_by (
        user_id,
        firstname,
        lastname,
        email
      )
    `)
    .eq('id', eventId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw Object.assign(new Error('Event not found'), { status: 404 });
    }
    throw Object.assign(new Error('Failed to fetch event'), { status: 500 });
  }

  return event;
}

/**
 * Update an event
 * @param {string} userId - The user's UUID
 * @param {number} eventId - Event ID
 * @param {Object} updates - Event updates
 * @returns {Promise<Object>} Updated event
 */
async function updateEvent(userId, eventId, updates) {
  // Validate input
  const validatedData = eventSchema.partial().parse(updates);

  // Check if user is the creator
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', eventId)
    .single();

  if (eventError) {
    if (eventError.code === 'PGRST116') {
      throw Object.assign(new Error('Event not found'), { status: 404 });
    }
    throw Object.assign(new Error('Failed to fetch event'), { status: 500 });
  }

  if (event.created_by !== userId) {
    throw Object.assign(new Error('Not authorized to update this event'), { status: 403 });
  }

  // Update event
  const { data: updatedEvent, error: updateError } = await supabase
    .from('events')
    .update({
      ...validatedData,
      date: validatedData.date ? new Date(validatedData.date).toISOString() : undefined
    })
    .eq('id', eventId)
    .select()
    .single();

  if (updateError) {
    throw Object.assign(new Error('Failed to update event'), { status: 500 });
  }

  return updatedEvent;
}

/**
 * Delete an event
 * @param {string} userId - The user's UUID
 * @param {number} eventId - Event ID
 * @returns {Promise<void>}
 */
async function deleteEvent(userId, eventId) {
  // Check if user is the creator
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', eventId)
    .single();

  if (eventError) {
    if (eventError.code === 'PGRST116') {
      throw Object.assign(new Error('Event not found'), { status: 404 });
    }
    throw Object.assign(new Error('Failed to fetch event'), { status: 500 });
  }

  if (event.created_by !== userId) {
    throw Object.assign(new Error('Not authorized to delete this event'), { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (deleteError) {
    throw Object.assign(new Error('Failed to delete event'), { status: 500 });
  }
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
  getEvents,
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