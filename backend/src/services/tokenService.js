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
  
  try {
    // First, let's check if we can query the users table at all
    const { data: testQuery, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    console.log('Test query result:', { testQuery, testError });

    // Now try to find the specific user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, user_id, name, email')
      .eq('user_id', userData.user_id)
      .single();

    console.log('User lookup details:', {
      query: `SELECT * FROM users WHERE user_id = '${userData.user_id}'`,
      result: { user, error: userError }
    });

    if (userError) {
      console.error('Database error:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      throw new Error(`Database error: ${userError.message}`);
    }

    if (!user) {
      console.log('No user found with ID:', userData.user_id);
      throw new Error('User not found');
    }

    console.log('Found user:', user);
    const { token, refreshToken } = createEncryptedTokens(userData);
    await saveTokensToDb(userData.user_id, token, refreshToken);
    return { token, refreshToken };
  } catch (error) {
    console.error('Error in generateAndStore:', error);
    throw error;
  }
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