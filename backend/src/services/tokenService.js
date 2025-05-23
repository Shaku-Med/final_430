const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../config/crypto');
const supabase = require('../config/supabase');

function createEncryptedTokens(userData) {
  // Ensure user_id is a valid string
  if (!userData.user_id || typeof userData.user_id !== 'string') {
    throw new Error('Invalid user ID format');
  }
  
  const encrypted = encrypt(JSON.stringify(userData));
  if (!encrypted) throw new Error('Encryption failed');
  const token = jwt.sign({ data: encrypted }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
}

async function saveTokensToDb(userId, token, refreshToken) {
  const expiresAt = new Date(Date.now() + 3600000).toISOString();
  const { error } = await supabase
    .from('user_tokens')
    .upsert({ 
      user_id: userId,
      token, 
      refresh_token: refreshToken, 
      expires_at: expiresAt 
    });
  if (error) throw error;
}

async function generateAndStore(userData) {
  console.log('Attempting to find user with ID:', userData.user_id);

  // Query the user from your custom `users` table by user_id
  const { data: users, error } = await supabase
    .from('users')
    .select('id, user_id, name, email')
    .eq('user_id', userData.user_id);

  // Log debug info
  if (error) {
    console.error('Database error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!users || users.length === 0) {
    console.log('No user found with user_id:', userData.user_id);
    throw new Error('User not found');
  }

  const user = users[0]; // Use first matched user

  // Optional: validate found user matches expected format
  if (!user || !user.user_id) {
    throw new Error('Invalid user data from DB');
  }

  // Generate tokens and save
  const { token, refreshToken } = createEncryptedTokens(user);
  await saveTokensToDb(user.user_id, token, refreshToken);

  return { token, refreshToken };
}

async function refreshAndStore(oldRefreshToken) {
  const decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
  const { data, error } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('refresh_token', oldRefreshToken)
    .single();
  if (error || !data) throw new Error('Invalid refresh token');
  
  // Parse the encrypted user data to get the user_id
  const decryptedData = JSON.parse(decrypt(data.data));
  if (!decryptedData.user_id) {
    throw new Error('Invalid user data in token');
  }
  
  const { token, refreshToken } = createEncryptedTokens({ user_id: decryptedData.user_id });
  await saveTokensToDb(decryptedData.user_id, token, refreshToken);
  return { token, refreshToken };
}

module.exports = { generateAndStore, refreshAndStore };