'use server'
import db from '@/app/Database/Supabase/Base1'
import Verification from '../../dashboard/@auth/Components/Verification'
import { cookies, headers } from 'next/headers'
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken'
import { VerifyHeaders } from './SetQuickToken'
import { CreatePassword, GenerateId, generateOtp, SetLoginCookie, VerifyPassword } from '@/app/Auth/Lock/Password'
import { SubmitMail } from '@/app/Functions/Mailing/Mail'
import OTPVerificationEmail from '@/app/Functions/Mailing/Components/Code'
import LoginNotificationEmail from '@/app/Functions/Mailing/Components/LoginNotification'
import SetToken, { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import { handleCodeSending } from './ExternalLogin'

export const ReturnResponse = async (status = 401, message = 'Unable to complete your request! Some information are missing.', added = {}, success = false) => {
    try {
        return { success, status, message, ...added }
    } catch {
        return { success: false, status: 401, message: 'Unable to complete your request! Some information are missing.', action: null }
    }
}

interface LoginSignupProps {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    device?: string;
    token?: string;
    name?: string;
}

interface SIGNOPTIONS {
    secure?: boolean;
}

interface SIGNIN {
    name?: string;
    value?: string;
    shouldEncrypt?: boolean;
    keys?: string[];
    options?: SIGNOPTIONS;
}

const LoginSignup = async (data?: LoginSignupProps, isSignup?: boolean) => {
    try {
        const h = await headers()
        const au = h.get('user-agent')?.split(/\s+/).join('')
        const clientIP = await getClientIP(h)
        const header_v = await VerifyHeaders()
        if (!header_v) return await ReturnResponse(401, 'Something seems not to be working right.')
        
        const c = await cookies()
        const _athK_ = c?.get('_athk_')?.value
        const authSession = c?.get('authsession')?.value
        const ky = [`${au}`, `${clientIP}`]
        
        if (!_athK_ || !authSession) {
            c.delete('authsession')
            return await ReturnResponse()
        }
        
        const vrToken = await VerifyToken(`${_athK_}`)
        const vrauthsession = await VerifyToken(`${authSession}`, ky)
        if (!vrToken || !vrauthsession) {
            return await ReturnResponse(401, 'Invalid data provided.', {
                action: 'window.location.reload()'
            })
        }

        c.delete('authsession')
        if (!data) return await ReturnResponse(402, "Looks like you're missing something...")

        const isverified = Verification({
            returnBoolean: true,
            email: { required: true, text: data?.email },
            password: {
                required: true,
                text: data?.password,
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
            }
        })
        
        if (!isverified || !data?.email || !data?.password) return await ReturnResponse(500, 'All fields are required.')

        const { data: user, error } = await db.from('users')
            .select('email,account_type,isVerified,isSuspended,user_id,name,xs,firstname,lastname')
            .eq('email', data?.email)
            .maybeSingle()
            
        if (error) return await ReturnResponse(500, 'Something went wrong.')
        
        const refererHasSignup = h.get('referer')?.includes('/signup')
        if (user) {
            if (isSignup || refererHasSignup) {
                return await ReturnResponse(409, 'User already exists. Please login instead.', {}, false)
            } else {
                if (user?.account_type !== 'normal') {
                    return await ReturnResponse(401, 'This account is not a normal account. Please use the correct login method.')
                }
                
                const device = data?.device ? JSON.parse(`${data?.device}`) : {}
                
                if (user?.isSuspended) {
                    return await ReturnResponse(401, 'We are so sorry to say, but this account has been suspended. Please contact support to get this resolved.')
                }
                
                if (!user?.isVerified) {
                    const sub = await handleCodeSending({
                        ...data,
                        firstname: user?.firstname || data?.name,
                    }, 'Account verification code resent.')
                    if (!sub) return await ReturnResponse()
                    
                    const ky = [`${process.env.TOKEN3}`, `${clientIP}`]
                    const token = await SetToken({
                        expiresIn: '1d',
                        algorithm: 'HS512'
                    }, ky, {
                        email: data?.email,
                        account: false,
                        shouldLogin: true
                    })
                    
                    c.set('acT', `${token}`, {
                        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    })
                    
                    return await ReturnResponse(401, 'This account is not verified and cannot be used.', {
                        action: 'verify'
                    })
                }
                
                const { data: gP } = await db.from('passwords')
                    .select('user_id,password')
                    .eq('user_id', user?.user_id)
                    .single()
                    
                const { data: dv } = await db.from('devices')
                    .select('*')
                    .eq('device_id', device?.getUA?.split(/\s+/)?.join('') || au)
                    .eq('user_id', user?.user_id)
                    .single()
                
                if (!data?.password) {
                    return await ReturnResponse(200, 'Please enter your password to continue.', {
                        action: 'password'
                    }, true)
                }
                
                const vPass = await VerifyPassword(`${data?.password}`, `${gP?.password}`)
                if (!vPass) {
                    // Send failed login attempt notification
                    await SubmitMail(
                        user.email,
                        'Failed Login Attempt - CSI SPOTLIGHT',
                        'Someone attempted to log in to your account with incorrect credentials.',
                        <LoginNotificationEmail
                            username={user.firstname || user.name}
                            loginTime={new Date().toLocaleString()}
                            deviceInfo={device?.getUA || 'Unknown device'}
                            location={clientIP}
                            companyName="CSI SPOTLIGHT"
                            companyLogo="https://kpmedia.medzyamara.dev/icon-512.png"
                        />
                    );
                    return await ReturnResponse(401, 'Wrong email or password')
                }
                
                if (dv) {
                    if (dv?.isRestricted) {
                        return await ReturnResponse(401, 'Access denied! Please reload your page and try again.')
                    }
                    
                    if (dv?.should_remember) {
                        const setC = [
                            {
                                name: 'c_usr',
                                value: `${user?.user_id}`,
                                shouldEncrypt: false,
                            },
                            {
                                name: 'xs',
                                value: `${user?.xs}`,
                                shouldEncrypt: true,
                            },
                        ]
                        
                        await SetLoginCookie(setC)
                        
                        // Send successful login notification
                        await SubmitMail(
                            user.email,
                            'Successful Login - CSI SPOTLIGHT',
                            'Your account was successfully logged into.',
                            <LoginNotificationEmail
                                username={user.firstname || user.name}
                                loginTime={new Date().toLocaleString()}
                                deviceInfo={device?.getUA || 'Unknown device'}
                                location={clientIP}
                                companyName="CSI SPOTLIGHT"
                                companyLogo="https://kpmedia.medzyamara.dev/icon-512.png"
                            />
                        );
                        
                        return await ReturnResponse(200, `Welcome ${user?.firstname}.`, {}, true)
                    } else {
                        return await sendVerificationCode({
                            ...data,
                            firstname: user?.firstname || data?.name,
                        }, c, clientIP)
                    }
                } else {
                    return await sendVerificationCode({
                        ...data,
                        firstname: user?.firstname || data?.name,
                    }, c, clientIP)
                }
            }
        } else {
            if (!refererHasSignup) return await ReturnResponse(401, 'This account does not exist. Please create an account.')
            if (!data?.firstname?.trim() || !data?.lastname?.trim()) return await ReturnResponse(401, 'All fields are required.')
            
            const timestamp = new Date().toISOString()
            const id = await GenerateId('users', [
                {name: 'user_id', length: 15},
                {name: 'xs', length: 20},
                {name: 'profile_id', length: 13},
            ], db)
            
            const dt = new Date()
            const date = new Date()
            date.setHours(date.getHours() + 24)
            const deleteDate = date.toISOString()

            const { error: insertError } = await db.from('users').insert({
                name: data?.name,
                firstname: data.firstname.trim(),
                lastname: data.lastname.trim(),
                email: data.email.trim(),
                joinedAt: timestamp,
                isVerified: false,
                ...id,
                suspended: {},
                isSuspended: false,
                account_type: 'normal',
                deletion: deleteDate
            })
            
            const pass = await CreatePassword(`${data?.password}`)
            const { error: PasswordError } = await db.from('passwords').insert({
                user_id: id?.user_id,
                password: pass,
                shouldExpire: true,
                expires: new Date(dt.setDate(dt.getDate() + 180)).toISOString()
            })
            
            const code = await generateOtp()
            const vcode = await CreatePassword(`${code}`)
            const { error: VerificationError } = await db.from('verification_codes').insert({
                user_id: id?.user_id,
                code: vcode,
                expires_at: new Date(dt.setMinutes(dt.getMinutes() + 30)).toISOString(),
                attempts: 0
            })
            
            const { error: SettingError } = await db.from('settings').insert({
                user_id: id?.user_id,
                IsTwoStep: true,
            })
            
            const device = data?.device ? JSON.parse(`${data?.device}`) : {}
            const { error: DevicesError } = await db.from('devices').insert({
                user_id: id?.user_id,
                ip_address: `${clientIP}`,
                device_info: device,
                isActive: true,
                isRestricted: false,
                isAdmin: true,
                stickyNote: [],
                should_remember: true,
                device_id: device?.getUA?.split(/\s+/)?.join('') || au,
                attempt_and_limit: {}
            })
            
            if (insertError || PasswordError || VerificationError || SettingError || DevicesError) {
                return await ReturnResponse(500, 'Failed to create account.')
            }

            await SubmitMail(
                `${data?.email}`, 
                `${code} - CSI SPOTLIGHT account verification`, 
                `You need to verify your account before it can be used.`, 
                <OTPVerificationEmail 
                    username={`${data?.firstname?.split(/\s+/)[0]}`}
                    companyName="CSI SPOTLIGHT"
                    companyLogo="https://kpmedia.medzyamara.dev/icon-512.png"
                    otpCode={`${code}`}
                    expiryMinutes={30}
                />
            )
            
            const ky = [`${process.env.TOKEN3}`, `${clientIP}`]
            const token = await SetToken({
                expiresIn: '1d',
                algorithm: 'HS512'
            }, ky, {
                email: data?.email,
                account: true,
            })
            
            c.set('acT', `${token}`, {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            })

            return {
                success: true,
                status: 201,
                message: 'Account created successfully. Please verify your account.',
                action: 'verify'
            }
        }
    } catch (error) {
        return await ReturnResponse()
    }
}

async function sendVerificationCode(data: any, c: any, clientIP: any) {
    const sub = await handleCodeSending(data)
    if (!sub) return await ReturnResponse()
    
    const ky = [`${process.env.TOKEN3}`, `${clientIP}`]
    const token = await SetToken({
        expiresIn: '1d',
        algorithm: 'HS512'
    }, ky, {
        email: data?.email,
        account: false,
        shouldLogin: true
    })
    
    c.set('acT', `${token}`, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    
    return await ReturnResponse(200, 'We\'ve sent you a verification code to your email. Check your email to verify your action.', {
        action: 'verify'
    }, true)
}

export default LoginSignup