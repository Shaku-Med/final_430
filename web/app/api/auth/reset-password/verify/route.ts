import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { EncryptCombine, DecryptCombine } from '@/app/Auth/Lock/Combine';
import { getClientIP } from '@/app/Auth/IsAuth/SetToken';
import { cookies } from 'next/headers';
import { VerifyHeaders } from '@/app/account/Actions/SetQuickToken';
import db from '@/app/Database/Supabase/Base1';
import { CreatePassword, VerifyPassword, SetLoginCookie, GenerateId } from '@/app/Auth/Lock/Password';
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken';
import { SubmitMail } from '@/app/Functions/Mailing/Mail';
import PasswordResetEmail from '@/app/Functions/Mailing/Components/PasswordReset';
import React from 'react';

export async function POST(request: NextRequest) {
    try {
        const h = await headers();
        const c = await cookies();
        const ip = await getClientIP(h);
        const userAgent = h.get('user-agent')?.split(/\s+/).join('');
        
        // Verify headers
        const header_v = await VerifyHeaders();
        if (!header_v) {
            console.error('Invalid request headers');
            return NextResponse.json({ 
                error: 'Access Denied',
                alert: {
                    type: 'error',
                    message: 'Access Denied. Please try again.'
                }
            }, { status: 401 });
        }
        const { token, password, access_token } = await request.json();

        // Get auth tokens from cookies
        const _athK_ = access_token
        const authSession = c?.get('authsession')?.value;
        const ky = [`${userAgent}`, `${ip}`];

        if (!_athK_ || !authSession) {
            c.delete('authsession');
            console.error('Session expired');
            return NextResponse.json({ 
                error: 'Access Denied',
                alert: {
                    type: 'error',
                    message: 'Access Denied. Please try again.'
                }
            }, { status: 401 });
        }

        // Verify tokens
        const vrToken = await VerifyToken(`${_athK_}`);
        const vrauthsession = await VerifyToken(`${authSession}`, ky);
        if (!vrToken || !vrauthsession) {
            console.error('Token verification failed');
            return NextResponse.json({ 
                error: 'Access Denied',
                alert: {
                    type: 'error',
                    message: 'Access Denied. Please try again.'
                }
            }, { status: 401 });
        }

        if (!token || !password) {
            console.error('Missing token or password');
            return NextResponse.json({ 
                error: 'Access Denied',
                alert: {
                    type: 'error',
                    message: 'Access Denied. Please try again.'
                }
            }, { status: 401 });
        }

        // Verify the reset token
        const keys = [
            userAgent,
            process.env.TOKEN_RESET
        ];

        const decryptedToken = DecryptCombine(token, keys);
        if (!decryptedToken) {
            console.error('Token decryption failed. Possible reasons: expired token, invalid keys, or malformed token');
            return NextResponse.json({ 
                error: 'Invalid or expired reset token',
                alert: {
                    type: 'error',
                    message: 'Invalid or expired reset token. Please request a new password reset link.'
                }
            }, { status: 401 });
        }

        let tokenData;
        try {
            tokenData = decryptedToken;
        } catch (parseError) {
            console.error('Failed to parse decrypted token:', parseError);
            return NextResponse.json({ 
                error: 'Invalid reset token format',
                alert: {
                    type: 'error',
                    message: 'Invalid reset token format. Please request a new password reset link.'
                }
            }, { status: 401 });
        }

        const { user_id, timestamp } = tokenData;

        // Check if token is expired (30 minutes)
        const now = new Date().getTime();
        if (now - timestamp > 30 * 60 * 1000) {
            return NextResponse.json({ 
                error: 'Reset token has expired',
                alert: {
                    type: 'error',
                    message: 'Reset token has expired. Please request a new password reset link.'
                }
            }, { status: 401 });
        }

        // Get user details
        const { data: user, error: userError } = await db.from('users')
            .select('user_id, isSuspended, firstname, email')
            .eq('user_id', user_id)
            .single();

        if (userError || !user) {
            console.error('User not found:', userError);
            return NextResponse.json({ 
                error: 'Access Denied',
                alert: {
                    type: 'error',
                    message: 'Access Denied. Please try again.'
                }
            }, { status: 401 });
        }

        if (user.isSuspended) {
            console.error('Account suspended for user:', user.user_id);
            // Send email notification about suspended account
            await SubmitMail(
                user.email,
                'Account Suspended - CSI SPOTLIGHT',
                'Your account is currently suspended',
                React.createElement(PasswordResetEmail, {
                    username: user.firstname || 'User',
                    type: 'limit',
                    message: 'Your account is currently suspended. Please contact support for assistance.',
                    location: {
                        ip: ip || 'unknown',
                        userAgent: userAgent || 'unknown',
                        coordinates: null,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            return NextResponse.json({ 
                error: 'Access Denied',
                alert: {
                    type: 'error',
                    message: 'Access Denied. Please try again.'
                }
            }, { status: 401 });
        }

        // Get device details and check reset attempts
        const { data: device, error: deviceError } = await db.from('devices')
            .select('*')
            .eq('device_id', userAgent)
            .eq('user_id', user_id)
            .single();

        if (deviceError && deviceError.code !== 'PGRST116') {
            console.error('Device check error:', deviceError);
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if there was a successful reset today
        if (device?.last_successful_reset === today) {
            return NextResponse.json({ 
                error: 'Password reset already completed today',
                alert: {
                    type: 'error',
                    message: 'You have already reset your password today. Please try again tomorrow.'
                }
            }, { status: 429 });
        }

        if (!device) {
            const { error: createDeviceError } = await db.from('devices').insert({
                user_id: user_id,
                ip_address: ip,
                device_info: { userAgent },
                isActive: true,
                isRestricted: false,
                isAdmin: false,
                stickyNote: [],
                should_remember: false,
                device_id: userAgent,
                attempt_and_limit: {},
                reset_attempts: {
                    count: 0,
                    lastAttempt: null,
                    lockedUntil: null,
                    dailyAttempts: {
                        count: 0,
                        lastResetDate: today
                    }
                }
            });

            if (createDeviceError) {
                console.error('Device creation error:', createDeviceError);
                return NextResponse.json({ 
                    error: 'Something went wrong',
                    alert: {
                        type: 'error',
                        message: 'Something went wrong. Please try again.'
                    }
                }, { status: 500 });
            }
        }

        const resetAttempts = device?.reset_attempts || { 
            count: 0, 
            lastAttempt: null, 
            lockedUntil: null,
            dailyAttempts: {
                count: 0,
                lastResetDate: today
            }
        };
        
        // Check daily reset attempts
        if (resetAttempts.dailyAttempts.lastResetDate !== today) {
            // Reset daily count if it's a new day
            resetAttempts.dailyAttempts = {
                count: 0,
                lastResetDate: today
            };
        } else if (resetAttempts.dailyAttempts.count >= 6) {
            // Send email notification about daily limit
            await SubmitMail(
                user.email,
                'Password Reset Limit Reached - CSI SPOTLIGHT',
                'Daily password reset limit reached',
                React.createElement(PasswordResetEmail, {
                    username: user.firstname || 'User',
                    type: 'limit',
                    message: 'You have reached the daily limit for password reset attempts. Please try again tomorrow.'
                })
            );

            return NextResponse.json({ 
                error: 'Daily reset limit reached. Please try again tomorrow.',
                alert: {
                    type: 'error',
                    message: `Password reset attempt failed: Daily limit reached. Please try again tomorrow.`
                }
            }, { status: 429 });
        }
        
        if (resetAttempts.lockedUntil && new Date(resetAttempts.lockedUntil) > new Date()) {
            const timeLeft = Math.ceil((new Date(resetAttempts.lockedUntil).getTime() - new Date().getTime()) / (1000 * 60));
            return NextResponse.json({ 
                error: `Too many reset attempts. Please try again in ${timeLeft} minutes.`,
                alert: {
                    type: 'error',
                    message: `Password reset attempt failed: Too many attempts. Please try again in ${timeLeft} minutes.`
                }
            }, { status: 429 });
        }

        if (resetAttempts.count >= 3) {
            // Send email notification about attempt limit
            await SubmitMail(
                user.email,
                'Password Reset Locked - CSI SPOTLIGHT',
                'Too many password reset attempts',
                React.createElement(PasswordResetEmail, {
                    username: user.firstname || 'User',
                    type: 'limit',
                    message: 'Too many password reset attempts. Your account has been temporarily locked for 1 hour.'
                })
            );

            const lockedUntil = new Date(new Date().getTime() + 60 * 60 * 1000);
            const { error: updateError } = await db.from('devices')
                .update({
                    reset_attempts: {
                        count: resetAttempts.count,
                        lastAttempt: new Date().toISOString(),
                        lockedUntil: lockedUntil.toISOString(),
                        dailyAttempts: {
                            count: resetAttempts.dailyAttempts.count + 1,
                            lastResetDate: today
                        }
                    }
                })
                .eq('device_id', userAgent)
                .eq('user_id', user_id);

            if (updateError) {
                console.error('Reset attempts update error:', updateError);
                return NextResponse.json({ 
                    error: 'Something went wrong',
                    alert: {
                        type: 'error',
                        message: 'Something went wrong. Please try again.'
                    }
                }, { status: 500 });
            }

            return NextResponse.json({ 
                error: 'Too many reset attempts. Please try again in 1 hour.',
                alert: {
                    type: 'error',
                    message: `Password reset attempt failed: Too many attempts. Please try again in 1 hour.`
                }
            }, { status: 429 });
        }

        // Get current password and password history
        const { data: currentPassword, error: passwordError } = await db.from('passwords')
            .select('password, password_reuse')
            .eq('user_id', user_id)
            .single();

        if (passwordError) {
            console.error('Password fetch error:', passwordError);
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        // Create new password hash
        const newPasswordHash = await CreatePassword(password);
        if (!newPasswordHash) {
            console.error('Password creation failed');
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        // Check if new password matches any previous passwords
        if (currentPassword.password_reuse) {
            for (const oldPassword of currentPassword.password_reuse) {
                const isMatch = await VerifyPassword(password, oldPassword.password);
                if (isMatch) {
                    // Send email notification about password reuse
                    await SubmitMail(
                        user.email,
                        'Password Reuse Attempt - CSI SPOTLIGHT',
                        'Attempt to reuse old password',
                        React.createElement(PasswordResetEmail, {
                            username: user.firstname || 'User',
                            type: 'reuse'
                        })
                    );

                    // Update reset attempts
                    const { error: updateError } = await db.from('devices')
                        .update({
                            reset_attempts: {
                                count: resetAttempts.count + 1,
                                lastAttempt: new Date().toISOString(),
                                lockedUntil: null,
                                dailyAttempts: {
                                    count: resetAttempts.dailyAttempts.count + 1,
                                    lastResetDate: today
                                }
                            }
                        })
                        .eq('device_id', userAgent)
                        .eq('user_id', user_id);

                    if (updateError) {
                        console.error('Reset attempts update error:', updateError);
                        return NextResponse.json({ 
                            error: 'Something went wrong',
                            alert: {
                                type: 'error',
                                message: 'Something went wrong. Please try again.'
                            }
                        }, { status: 500 });
                    }

                    return NextResponse.json({ 
                        error: 'This password has been used before. Please choose a different password.',
                        alert: {
                            type: 'error',
                            message: `Password reset attempt failed: This password has been used before. Please choose a different password.`
                        }
                    }, { status: 400 });
                }
            }
        }

        // Generate new xs token
        const newXsData = await GenerateId('users', [
            { name: 'xs', length: 20 }
        ], db);
        
        if (!newXsData || !newXsData.xs) {
            console.error('Security token generation failed');
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        const newXs = newXsData.xs;

        // Update user's xs token
        const { error: updateXsError } = await db.from('users')
            .update({ xs: newXs })
            .eq('user_id', user_id);

        if (updateXsError) {
            console.error('Security token update error:', updateXsError);
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        // Update password and password history
        const { error: updateError } = await db.from('passwords')
            .update({ 
                password: newPasswordHash,
                password_reuse: [
                    ...(currentPassword.password_reuse || []),
                    {
                        password: currentPassword.password,
                        changed_at: new Date().toISOString()
                    }
                ]
            })
            .eq('user_id', user_id);

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        // Update last successful reset date
        const { error: updateResetDateError } = await db.from('devices')
            .update({
                last_successful_reset: today
            })
            .eq('device_id', userAgent)
            .eq('user_id', user_id);

        if (updateResetDateError) {
            console.error('Reset date update error:', updateResetDateError);
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        // Reset the attempt counter on successful password change
        const { error: resetAttemptsError } = await db.from('devices')
            .update({
                reset_attempts: {
                    count: 0,
                    lastAttempt: new Date().toISOString(),
                    lockedUntil: null,
                    dailyAttempts: {
                        count: resetAttempts.dailyAttempts.count + 1,
                        lastResetDate: today
                    }
                }
            })
            .eq('device_id', userAgent)
            .eq('user_id', user_id);

        if (resetAttemptsError) {
            console.error('Reset attempts update error:', resetAttemptsError);
            return NextResponse.json({ 
                error: 'Something went wrong',
                alert: {
                    type: 'error',
                    message: 'Something went wrong. Please try again.'
                }
            }, { status: 500 });
        }

        // Send email notification about reset attempt
        await SubmitMail(
            user.email,
            'Password Reset Attempt - CSI SPOTLIGHT',
            'A password reset attempt was made from a new device',
            React.createElement(PasswordResetEmail, {
                username: user.firstname || 'User',
                type: 'attempt',
                location: {
                    ip: ip || 'unknown',
                    userAgent: userAgent || 'unknown',
                    coordinates: null,
                    timestamp: new Date().toISOString()
                }
            })
        );

        // Send success email notification
        await SubmitMail(
            user.email,
            'Password Reset Successful - CSI SPOTLIGHT',
            'Your password has been reset successfully',
            React.createElement(PasswordResetEmail, {
                username: user.firstname || 'User',
                type: 'success'
            })
        );

        // Clear auth session after successful password reset
        c.delete('authsession');

        return NextResponse.json({ 
            success: true,
            message: 'Password has been reset successfully',
            alert: {
                type: 'success',
                message: `Password has been reset successfully for ${user.firstname || 'User'}. Please log in with your new password.`
            }
        });

    } catch (error) {
        console.error('Password reset verification error:', error);
        return NextResponse.json({ 
            error: 'Something went wrong',
            alert: {
                type: 'error',
                message: 'Something went wrong. Please try again.'
            }
        }, { status: 500 });
    }
} 