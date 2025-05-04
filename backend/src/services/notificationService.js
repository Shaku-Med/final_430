const supabase = require('../config/supabase');
const transporter = require('../config/email');

/** Create a notification and optionally send email */
async function createNotification(userId, type, referenceId, message, sendEmail = false) {
  // Insert DB record
  const { error: dbErr } = await supabase.from('notifications').insert([{ user_id: userId, type, reference_id: referenceId, message, is_read: false, created_at: new Date().toISOString() }]);
  if (dbErr) throw dbErr;

  if (sendEmail) {
    // Fetch user's email
    const { data: profile, error: pErr } = await supabase.from('profiles').select('email').eq('id', userId).single();
    if (pErr) throw pErr;
    // Send email
    await transporter.sendMail({ to: profile.email, subject: `Notification: ${type}`, text: message });
  }
}

async function listNotifications(userId, { limit = 20, offset = 0 }) {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

async function markAsRead(notificationId) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw error;
}



module.exports = { createNotification, listNotifications, markAsRead };