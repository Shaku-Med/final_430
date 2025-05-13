const supabase = require('../config/supabase');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const transporter = nodemailer.createTransport({ 
  service: 'gmail', 
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD 
  } 
});

async function signup({ email, password, firstName, lastName }) {
  // Input validation
  if (!emailRegex.test(email)) {
    throw Object.assign(new Error('Invalid email format'), { status: 400 });
  }
  if (!passwordRegex.test(password)) {
    throw Object.assign(new Error('Password must be at least 8 characters long and contain at least one letter and one number'), { status: 400 });
  }

  // Check for existing user
  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();
  
  if (existingError && existingError.code !== 'PGRST116') {
    throw Object.assign(new Error('Failed to check existing user'), { status: 500 });
  }
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { status: 400 });
  }

  // Create user in Supabase Auth
  const { user: authUser, error: signupError } = await supabase.auth.signUp({ email, password });
  if (signupError) {
    throw Object.assign(new Error(signupError.message), { status: 400 });
  }

  // Create user record
  const { error: userError } = await supabase
    .from('users')
    .insert([{
      user_id: authUser.id,
      email: email,
      firstname: firstName,
      lastname: lastName,
      isVerified: false,
      joinedAt: new Date().toISOString(),
      account_type: 'user',
      isSuspended: false
    }]);

  if (userError) {
    throw Object.assign(new Error('Failed to create user record'), { status: 500 });
  }

  // Generate verification code
  const code = crypto.randomBytes(3).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Store verification code
  const { error: insertError } = await supabase
    .from('verification_codes')
    .insert([{ 
      email, 
      code, 
      expires_at: expiresAt, 
      attempts: 0 
    }]);
  
  if (insertError) {
    throw Object.assign(new Error('Failed to create verification code'), { status: 500 });
  }

  // Send verification email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm your signup',
    html: `
      <h2>Confirm your signup</h2>
      <p>Your verification code: <strong>${code}</strong></p>
      <p>This code will expire in 15 minutes.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  
  }

  return authUser;
}

async function verifyCode({ email, code }) {
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .single();

  if (error || !data) {
    throw Object.assign(new Error('Invalid verification code'), { status: 400 });
  }

  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('verification_codes').delete().eq('email', email);
    throw Object.assign(new Error('Verification code has expired'), { status: 400 });
  }

  if (data.attempts >= 3) {
    await supabase.from('verification_codes').delete().eq('email', email);
    throw Object.assign(new Error('Too many verification attempts'), { status: 400 });
  }

  await supabase
    .from('verification_codes')
    .update({ attempts: data.attempts + 1 })
    .eq('email', email)
    .eq('code', code);

  const { data: userResp, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResp.user) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }

  // Update user verification status
  const { error: updateError } = await supabase
    .from('users')
    .update({ isVerified: true })
    .eq('user_id', userResp.user.id);

  if (updateError) {
    throw Object.assign(new Error('Failed to update user verification status'), { status: 500 });
  }

  await supabase
    .from('verification_codes')
    .delete()
    .eq('email', email)
    .eq('code', code);

  return userResp.user;
}

async function login({ email, password }) {
  if (!emailRegex.test(email)) {
    throw Object.assign(new Error('Invalid email format'), { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw Object.assign(new Error(error.message), { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  if (userError) {
    throw Object.assign(new Error('Failed to fetch user data'), { status: 500 });
  }

  if (!user.isVerified) {
    throw Object.assign(new Error('Email not verified'), { status: 403 });
  }

  if (user.isSuspended) {
    throw Object.assign(new Error('Account is suspended'), { status: 403 });
  }

  return { user: data.user, userData: user, session: data.session };
}

module.exports = { signup, verifyCode, login };