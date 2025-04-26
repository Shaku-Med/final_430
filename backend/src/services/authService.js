const supabase = require('../config/supabase');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD } });

async function signup({ email, password }) {
  if (!emailRegex.test(email)) throw Object.assign(new Error('Invalid email format'), { status: 400 });
  if (!passwordRegex.test(password)) throw Object.assign(new Error('Password must be at least 8 characters long and contain at least one letter and one number'), { status: 400 });
  const { data: existing } = await supabase.from('profiles').select('email').eq('email', email).single();
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 400 });

  const { user, error: signupError } = await supabase.auth.signUp({ email, password });
  if (signupError) throw Object.assign(new Error(signupError.message), { status: 400 });

  const code = crypto.randomBytes(3).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const { error: insertError } = await supabase.from('verification_codes').insert([{ email, code, expires_at: expiresAt, attempts: 0 }]);
  if (insertError) throw Object.assign(new Error(insertError.message), { status: 500 });

  const mailOptions = { from: process.env.EMAIL_USER, to: email, subject: 'Confirm your signup', html: `<h2>Confirm your signup</h2><p>Your code: <strong>${code}</strong> (valid 15 minutes)</p>` };
  try { await transporter.sendMail(mailOptions); } catch (_) {}
  return user;
}

async function verifyCode({ email, code }) {
  const { data, error } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single();
  if (error || !data) throw Object.assign(new Error('Invalid verification code'), { status: 400 });
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('verification_codes').delete().eq('email', email);
    throw Object.assign(new Error('Verification code has expired'), { status: 400 });
  }
  if (data.attempts >= 3) {
    await supabase.from('verification_codes').delete().eq('email', email);
    throw Object.assign(new Error('Too many verification attempts'), { status: 400 });
  }
  await supabase.from('verification_codes').update({ attempts: data.attempts + 1 }).eq('email', email).eq('code', code);

  const { data: userResp, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResp.user) throw Object.assign(new Error('User not found'), { status: 400 });

  await supabase.from('profiles').insert([{ id: userResp.user.id, email: userResp.user.email, email_verified: true, created_at: new Date().toISOString() }]);
  await supabase.from('verification_codes').delete().eq('email', email).eq('code', code);
  return userResp.user;
}

async function login({ email, password }) {
  if (!emailRegex.test(email)) throw Object.assign(new Error('Invalid email format'), { status: 400 });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  if (!profile?.email_verified) throw Object.assign(new Error('Email not verified'), { status: 403 });

  return { user: data.user, profile, session: data.session };
}

module.exports = { signup, verifyCode, login };