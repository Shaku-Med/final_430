import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { EncryptCombine } from '@/app/Auth/Lock/Combine';
import { getClientIP } from '@/app/Auth/IsAuth/SetToken';
import { cookies } from 'next/headers';
import { VerifyHeaders } from '@/app/account/Actions/SetQuickToken';
import db from '@/app/Database/Supabase/Base1';
import { SubmitMail } from '@/app/Functions/Mailing/Mail';
import PasswordResetEmail from '@/app/Functions/Mailing/Components/PasswordReset';
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken';
import React from 'react';

export async function POST(request: NextRequest) {
    try {
        const h = await headers();
        const c = await cookies();
        const ip = await getClientIP(h);
        const userAgent = h.get('user-agent')?.split(/\s+/).join('') || 'Unknown Device';
        
        // Verify headers
        const header_v = await VerifyHeaders();
        if (!header_v) {
            return NextResponse.json({ error: 'Invalid request headers' }, { status: 401 });
        }
        const { userId, location, token } = await request.json();

        // Get auth tokens from cookies
        const _athK_ = token;
        const authSession = c?.get('authsession')?.value;
        const ky = [`${userAgent}`, `${ip}`];

        if (!_athK_ || !authSession) {
            c.delete('authsession');
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        // Verify tokens
        const vrToken = await VerifyToken(`${_athK_}`);
        const vrauthsession = await VerifyToken(`${authSession}`, ky);
        if (!vrToken || !vrauthsession) {
            return NextResponse.json({ error: 'Access Denied! Please try again.' }, { status: 401 });
        }

        // Get user ID and location from request body
        
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Fetch user details
        const { data: user, error: userError } = await db.from('users')
            .select('email, firstname, isSuspended, user_id ')
            .eq('email', userId)
            .single();

        if (userError || !user) {
            console.error('User not found:', userError);
            return NextResponse.json({ error: 'Access Denied' }, { status: 401 });
        }

        if (user.isSuspended) {
            console.error('Account suspended for user:', user.user_id);
            return NextResponse.json({ error: 'Access Denied' }, { status: 401 });
        }

        const deviceId = userAgent;
        const { data: device, error: deviceError } = await db.from('devices')
            .select('*')
            .eq('device_id', deviceId)
            .eq('user_id', user?.user_id)
            .single();

        if (deviceError && deviceError.code !== 'PGRST116') {
            console.error('Device check error:', deviceError);
            return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
        }

        if (!device) {
            const { error: createDeviceError } = await db.from('devices').insert({
                user_id: user?.user_id,
                ip_address: ip,
                device_info: { userAgent },
                isActive: true,
                isRestricted: false,
                isAdmin: false,
                stickyNote: [],
                should_remember: false,
                device_id: deviceId,
                attempt_and_limit: {},
                reset_attempts: {
                    count: 0,
                    lastAttempt: null,
                    lockedUntil: null,
                    dailyAttempts: {
                        count: 0,
                        lastResetDate: new Date().toISOString().split('T')[0]
                    }
                }
            });

            if (createDeviceError) {
                console.error('Device creation error:', createDeviceError);
                return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
            }
        } else {
            const resetAttempts = device.reset_attempts || { 
                count: 0, 
                lastAttempt: null, 
                lockedUntil: null,
                dailyAttempts: {
                    count: 0,
                    lastResetDate: new Date().toISOString().split('T')[0]
                }
            };
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            // Check daily reset attempts
            if (resetAttempts.dailyAttempts.lastResetDate !== today) {
                // Reset daily count if it's a new day
                resetAttempts.dailyAttempts = {
                    count: 0,
                    lastResetDate: today
                };
            } else if (resetAttempts.dailyAttempts.count >= 6) {
                return NextResponse.json({ 
                    error: 'Daily reset limit reached. Please try again tomorrow.' 
                }, { status: 429 });
            }
            
            if (resetAttempts.lockedUntil && new Date(resetAttempts.lockedUntil) > now) {
                const timeLeft = Math.ceil((new Date(resetAttempts.lockedUntil).getTime() - now.getTime()) / (1000 * 60));
                return NextResponse.json({ 
                    error: `Too many reset attempts. Please try again in ${timeLeft} minutes.` 
                }, { status: 429 });
            }

            if (resetAttempts.count >= 3) {
                const lockedUntil = new Date(now.getTime() + 60 * 60 * 1000);
                const { error: updateError } = await db.from('devices')
                    .update({
                        reset_attempts: {
                            count: resetAttempts.count,
                            lastAttempt: now.toISOString(),
                            lockedUntil: lockedUntil.toISOString(),
                            dailyAttempts: {
                                count: resetAttempts.dailyAttempts.count + 1,
                                lastResetDate: today
                            }
                        }
                    })
                    .eq('device_id', deviceId)
                    .eq('user_id', user?.user_id);

                if (updateError) {
                    console.error('Reset attempts update error:', updateError);
                    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
                }

                return NextResponse.json({ 
                    error: 'Too many reset attempts. Please try again in 1 hour.' 
                }, { status: 429 });
            }

            const { error: updateError } = await db.from('devices')
                .update({
                    reset_attempts: {
                        count: resetAttempts.count + 1,
                        lastAttempt: now.toISOString(),
                        lockedUntil: null,
                        dailyAttempts: {
                            count: resetAttempts.dailyAttempts.count + 1,
                            lastResetDate: today
                        }
                    }
                })
                .eq('device_id', deviceId)
                .eq('user_id', user?.user_id);

            if (updateError) {
                console.error('Reset attempts update error:', updateError);
                return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
            }
        }

        // Create token data
        const tokenData = {
            user_id: user?.user_id,
            user_agent: userAgent,
            ip: ip,
            location: location,
            coordinates: location?.coordinates || null,
            timestamp: new Date().getTime()
        };

        // Validate token data
        if (!tokenData.user_id || !tokenData.user_agent || !tokenData.ip) {
            console.error('Invalid token data:', tokenData);
            return NextResponse.json({ error: 'Failed to generate reset token: Invalid data' }, { status: 500 });
        }

        // Encrypt the token
        const keys = [
            userAgent,
            process.env.TOKEN_RESET
        ];

        if (!keys[0] || !keys[1]) {
            console.error('Missing encryption keys');
            return NextResponse.json({ error: 'Failed to generate reset token: Missing keys' }, { status: 500 });
        }

        const resetToken = EncryptCombine(tokenData, keys, {
            expiresIn: '30m',
            algorithm: 'HS512'
        });

        if (!resetToken) {
            console.error('Token encryption failed');
            return NextResponse.json({ error: 'Failed to generate reset token' }, { status: 500 });
        }

        // Generate reset link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) {
            console.error('NEXT_PUBLIC_APP_URL environment variable is not set');
            return NextResponse.json({ error: 'Failed to generate reset link: Configuration error' }, { status: 500 });
        }
        const resetLink = `${baseUrl}/account/reset/verify/${resetToken}`;

        // Send email with reset link
        await SubmitMail(
            user.email,
            'Password Reset Request - CSI SPOTLIGHT',
            'Reset your password',
            React.createElement(PasswordResetEmail, {
                username: user.firstname,
                resetLink: resetLink,
                expiryMinutes: 30,
                companyName: "CSI SPOTLIGHT",
                companyLogo: "https://kpmedia.medzyamara.dev/icon-512.png",
                location: {
                    ip: ip,
                    userAgent: userAgent,
                    coordinates: location?.coordinates || null,
                    timestamp: new Date().toISOString()
                }
            })
        );

        return NextResponse.json({ 
            success: true,
            message: 'Password reset link has been sent to your email',
            location: {
                
            }
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
} 