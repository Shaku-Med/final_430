const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many attempts, please try again later'
});

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex (minimum 8 characters, at least one letter and one number)
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

//nodemailer email setup
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long and contain at least one letter and one number' 
            });
        }

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // sign up the user using Supabase Auth
        const { user, error: signupError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signupError) {
            return res.status(400).json({ error: signupError.message });
        }

        // Generate a random verification code
        const code = crypto.randomBytes(3).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store the verification code in the database
        const { error: insertError } = await supabase
            .from('verification_codes')
            .insert([{ 
                email, 
                code, 
                expires_at: expiresAt,
                attempts: 0 // Track verification attempts
            }]);

        if (insertError) {
            return res.status(400).json({ error: insertError.message });
        }

        // Send the verification email with the code
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Confirm your signup',
            html: `
                <h2>Confirm your signup</h2>
                <p>Use the following code to confirm your email:</p>
                <p><strong>${code}</strong></p>
                <p>This code is valid for 15 minutes.</p>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Verification email sent to:', email);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Don't fail the signup if email sending fails
        }

        res.status(200).json({ 
            message: 'Signup successful! Please check your email for the verification code.',
            user 
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/verify-code', authLimiter, async (req, res) => {
    try {
        const { email, code } = req.body;

        // Get the verification code record
        const { data: verificationData, error: verificationError } = await supabase
            .from('verification_codes')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .single();

        if (verificationError || !verificationData) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Check if code is expired
        if (new Date(verificationData.expires_at) < new Date()) {
            await supabase
                .from('verification_codes')
                .delete()
                .eq('email', email);
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        // Check verification attempts
        if (verificationData.attempts >= 3) {
            await supabase
                .from('verification_codes')
                .delete()
                .eq('email', email);
            return res.status(400).json({ error: 'Too many verification attempts' });
        }

        // Increment attempts
        await supabase
            .from('verification_codes')
            .update({ attempts: verificationData.attempts + 1 })
            .eq('email', email)
            .eq('code', code);

        // Get the user from auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Create the profile in the profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
                id: user.id,
                email: user.email,
                created_at: new Date(),
                email_verified: true
            }]);

        if (profileError) {
            return res.status(400).json({ error: profileError.message });
        }

        // Delete the used verification code
        await supabase
            .from('verification_codes')
            .delete()
            .eq('email', email)
            .eq('code', code);

        res.status(200).json({ 
            message: 'Email verified successfully!',
            user 
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Use Supabase's signIn method to authenticate the user
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
        }

        // Check if email is verified
        if (!profile?.email_verified) {
            return res.status(403).json({ 
                error: 'Email not verified',
                message: 'Please verify your email before logging in'
            });
        }

        // Respond with user information and session
        res.status(200).json({
            message: 'Login successful!',
            user: data.user,
            profile: profile,
            session: data.session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 