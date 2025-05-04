const jwt = require('jsonwebtoken');
const { encrypt } = require('../config/crypto');
const supabase = require('../config/supabase');

function createEncryptedTokens(userData) {
  const encrypted = encrypt(JSON.stringify(userData), process.env.ENCRYPTION_KEY);
  if (!encrypted) throw new Error('Encryption failed');
  const token = jwt.sign({ data: encrypted }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
}

async function saveTokensToDb(userId, token, refreshToken) {
  const expiresAt = new Date(Date.now() + 3600000).toISOString();
  const { error } = await supabase
    .from('user_tokens')
    .upsert({ user_id: userId, token, refresh_token: refreshToken, expires_at: expiresAt });
  if (error) throw error;
}

async function generateAndStore(userData) {
  const { token, refreshToken } = createEncryptedTokens(userData);
  await saveTokensToDb(userData.user_id, token, refreshToken);
  return { token, refreshToken };
}

async function refreshAndStore(oldRefreshToken) {
  // Verify, fetch, re-create, upsert, retuårn new tokens
  const decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
  const { data, error } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('refresh_token', oldRefreshToken)
    .single();
  if (error || !data) throw new Error('Invalid refresh token');
  const userData = { user_id: data.user_id }; // fetch full encrypted userData if needed
  const { token, refreshToken } = createEncryptedTokens(userData);
  await saveTokensToDb(userData.user_id, token, refreshToken);
  return { token, refreshToken };
}

module.exports = { generateAndStore, refreshAndStore };