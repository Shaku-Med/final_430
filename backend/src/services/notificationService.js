const supabase = require('../config/supabase');
const transporter = require('../config/email');

/**
 * Create a notification and optionally send email
 * @param {string} userId - The user's UUID
 * @param {string} type - Notification type (e.g., 'project_update', 'system', 'mention')
 * @param {string} referenceId - ID of the referenced entity
 * @param {string} message - Notification message
 * @param {boolean} sendEmail - Whether to send email notification
 * @returns {Promise<Object>} Created notification
 */
async function createNotification(userId, type, referenceId, message, sendEmail = false) {
  // Validate input
  if (!userId || !type || !referenceId || !message) {
    throw Object.assign(new Error('Missing required fields'), { status: 400 });
  }

  // Check if user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, isSuspended')
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

  // Insert notification
  const { data: notification, error: dbError } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      reference_id: referenceId,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (dbError) {
    throw Object.assign(new Error('Failed to create notification'), { status: 500 });
  }

  // Send email if requested
  if (sendEmail && user.email) {
    try {
      await transporter.sendMail({
        to: user.email,
        subject: `Notification: ${type}`,
        html: `
          <h2>New Notification</h2>
          <p>${message}</p>
          <p>Reference ID: ${referenceId}</p>
          <p>Type: ${type}</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't throw error here, just log it
      // The notification is still created in the database
    }
  }

  return notification;
}

/**
 * Get notifications for a user with pagination
 * @param {string} userId - The user's UUID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Number of notifications per page
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} List of notifications
 */
async function getNotifications(userId, { limit = 20, offset = 0 } = {}) {
  if (!userId) {
    throw Object.assign(new Error('User ID is required'), { status: 400 });
  }

  if (!Number.isInteger(limit) || !Number.isInteger(offset) || limit < 1 || offset < 0) {
    throw Object.assign(new Error('Invalid pagination parameters'), { status: 400 });
  }

  const { data: notifications, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw Object.assign(new Error('Failed to fetch notifications'), { status: 500 });
  }

  return {
    notifications,
    total: count,
    limit,
    offset
  };
}

/**
 * Mark a notification as read
 * @param {string} userId - The user's UUID
 * @param {number} notificationId - ID of the notification
 * @returns {Promise<Object>} Updated notification
 */
async function markAsRead(userId, notificationId) {
  if (!userId || !notificationId) {
    throw Object.assign(new Error('User ID and notification ID are required'), { status: 400 });
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw Object.assign(new Error('Notification not found'), { status: 404 });
    }
    throw Object.assign(new Error('Failed to update notification'), { status: 500 });
  }

  return notification;
}

/**
 * Delete a notification
 * @param {string} userId - The user's UUID
 * @param {number} notificationId - ID of the notification
 * @returns {Promise<void>}
 */
async function deleteNotification(userId, notificationId) {
  if (!userId || !notificationId) {
    throw Object.assign(new Error('User ID and notification ID are required'), { status: 400 });
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    if (error.code === 'PGRST116') {
      throw Object.assign(new Error('Notification not found'), { status: 404 });
    }
    throw Object.assign(new Error('Failed to delete notification'), { status: 500 });
  }
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification
};