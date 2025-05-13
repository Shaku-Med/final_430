const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function uploadProfilePicture(userId, { fileData, fileName, fileType }) {
  if (!fileData || !fileName || !fileType) {
    const err = new Error('Missing required file data'); err.status = 400; throw err;
  }
  const allowed = ['image/jpeg','image/png','image/gif'];
  if (!allowed.includes(fileType)) {
    const err = new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed'); err.status = 400; throw err;
  }
  const buffer = Buffer.from(fileData.split(',')[1], 'base64');
  const ext = fileName.split('.').pop();
  const key = `${userId}/${uuidv4()}.${ext}`;
  const bucket = 'profile-pictures';

  const { error: upErr } = await supabase.storage.from(bucket)
    .upload(key, buffer, { contentType: fileType, upsert: true, cacheControl: '3600' });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(key);
  const { error: updErr } = await supabase.from('profiles')
    .update({ avatar_url: publicUrl }).eq('id', userId);
  if (updErr) throw updErr;

  return publicUrl;
}

module.exports = { uploadProfilePicture };