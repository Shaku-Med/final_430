'use server'

import { cookies, headers } from "next/headers"
import { VerifyHeaders } from "./SetQuickToken"
import { ReturnResponse } from "./LoginSignup"
import { getClientIP } from "@/app/Auth/IsAuth/SetToken"
import VerifyToken from "@/app/Auth/PageAuth/Action/VerifyToken"
import Verification from "../../dashboard/@auth/Components/Verification"
import db from '@/app/Database/Supabase/Base1'
import { CreatePassword, GenerateId, generateOtp, SetLoginCookie, VerifyPassword } from "@/app/Auth/Lock/Password"
import { SubmitMail } from "@/app/Functions/Mailing/Mail"
import OTPVerificationEmail from "@/app/Functions/Mailing/Components/Code"
import LoginNotificationEmail from "@/app/Functions/Mailing/Components/LoginNotification"
import SetToken from '@/app/Auth/IsAuth/SetToken'

type AccountType = 'google' | 'apple' | 'github' | 'normal';

interface LoginSignupProps {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    device?: string;
    token?: string;
    name?: string;
    account_type?: AccountType;
    data?: object;
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

export let handleCodeSending = async (data: any, subject?: string, uid?: string) => {
    try {
        let h = await headers()
        let au = h.get(`user-agent`)?.split(/\s+/).join('')
        // 
        let device = data?.device ? JSON.parse(`${data?.device}`) : {}

        const dt = new Date()
        let code = await generateOtp()
        let vcode = await CreatePassword(`${code}`)
        const expiryTime = new Date(dt.setMinutes(dt.getMinutes() + 30)).toISOString()
        const userId = uid || device?.getUA?.split(/\s+/)?.join('') || au
        
        const { data: existingRecord } = await db
            .from(`verification_codes`)
            .select()
            .eq('user_id', userId)
            .maybeSingle()
            
        let dbResult
        
        if (existingRecord) {
            dbResult = await db
                .from(`verification_codes`)
                .update({
                    code: vcode,
                    expires_at: expiryTime,
                    attempts: 0
                })
                .eq('user_id', userId)
        } else {
            dbResult = await db
                .from(`verification_codes`)
                .insert({
                    user_id: userId,
                    code: vcode,
                    expires_at: expiryTime,
                    attempts: 0
                })
        }
        
        if (dbResult.error) return false
        
        let sendCode = await SubmitMail(`${data?.email}`, 
            `${code} - CSI SPOTLIGHT ${subject || ` Login verification`}`, 
            `You need to verify your action before you can continue..`, 
            <OTPVerificationEmail 
                username={`${data?.firstname?.split(/\s+/)[0] || `User`}`}
                companyName={`CSI SPOTLIGHT`}
                companyLogo={`https://kpmedia.medzyamara.dev/icon-512.png`}
                otpCode={`${code}`}
                expiryMinutes={30}
            />
        )
        return sendCode ? true : false
    }
    catch {
        return false
    }
}

const sendLoginNotification = async (user: any, device: any, ip: string, isSuccess: boolean) => {
    try {
        const loginTime = new Date().toLocaleString();
        const deviceInfo = device?.getUA || 'Unknown device';
        
        await SubmitMail(
            user.email,
            `${isSuccess ? 'Successful' : 'Attempted'} Login to Your Account`,
            `A ${isSuccess ? 'successful' : 'new'} login was detected on your account.`,
            <LoginNotificationEmail
                username={user.firstname?.split(/\s+/)[0] || 'User'}
                loginTime={loginTime}
                deviceInfo={deviceInfo}
                location={ip}
                companyName="CSI SPOTLIGHT"
                companyLogo="https://kpmedia.medzyamara.dev/icon-512.png"
            />
        );
    } catch (error) {
        console.error('Error sending login notification:', error);
    }
};

const ExternalLogin = async (data: LoginSignupProps) => {
  try {
    let h = await headers()
    let au = h.get(`user-agent`)?.split(/\s+/).join('')
    let clientIP = await getClientIP(h);
    // 
    let header_v = await VerifyHeaders()
    if(!header_v) return await ReturnResponse(401, `Something seems not to be working right.`);
    
    let c = await cookies()
    let _athK_ = c?.get(`_athk_`)?.value

    let authSession = c?.get(`externalsession`)?.value
    let ky = [`${au}`, `${clientIP}`]
    // 
    if(!_athK_ || !authSession) {
        c.delete(`externalsession`)
        return await ReturnResponse()
    };
    
    let vrToken = await VerifyToken(`${_athK_}`)
    let vrauthsession = await VerifyToken(`${authSession}`, ky)
    if(!vrToken || !vrauthsession) return await ReturnResponse(401, `Invalid data provided.`, {
        action: `window.location.reload()`
    });
    
    if(!data) return await ReturnResponse(402, `Looks like you're missing something...`);
    
    let isverified = Verification({
        returnBoolean: true,
        email: {
            required: true,
            text: data?.email
        },
        password: {
            required: false,
            text: data?.password,
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
        }
    })
    
    if (!isverified || !data?.firstname?.trim() || !data?.lastname?.trim() || !data?.email || data?.account_type?.toLowerCase().includes('normal')) return await ReturnResponse(500, 'All fields are required.');

    let { data: user, error }: any = await db.from('users').select(`*`).eq('email', data?.email)
    if(error) return await ReturnResponse(500, `Something went wrong.`);
    
    if(user?.length > 0){
       user = user[0]

       // Send notification for login attempt
       await sendLoginNotification(user, data?.device ? JSON.parse(`${data?.device}`) : {}, clientIP, false);

       if (user?.account_type === 'normal') {
        return await ReturnResponse(401, `Please use the normal login method to access your account.`);
    }

       let device = data?.device ? JSON.parse(`${data?.device}`) : {}
       
        // 
       if(user?.isSuspended) return await ReturnResponse(401, `We are so sorry to say, but this account has been suspended. Please contact support to get this resolved.`);
       if(!user?.isVerified) {
            let sub = await handleCodeSending(data, `Account verification code resent.`);
            if(!sub) return await ReturnResponse();
            
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
            
            return await ReturnResponse(401, `This account is not verified and cannot be used.`, {
                action: `verify_account`
            })
       };
       //
       let {data: gP} = await db.from(`passwords`).select(`user_id,password`).eq(`user_id`, user?.user_id).single()
       let {data: dv} = await db.from(`devices`).select(`*`).eq(`device_id`, device?.getUA?.split(/\s+/)?.join('') || au).eq(`user_id`, user?.user_id).single()
       
       if(gP){
        if(!data?.password) return await ReturnResponse(200, `Please enter your password to continue.`, {
            action: `password`
        }, true)
        // 
        let vPass = await VerifyPassword(`${data?.password}`, `${gP?.password}`)
        if(!vPass) return await ReturnResponse(401, `Wrong email or password`);
       }
       

       if(dv){
            if(dv?.isRestricted) return await ReturnResponse(401, `Access denied! Please reload your page and try again.`);
            if(dv?.should_remember){
                let setC: SIGNIN[] = [
                    {
                        name: `c_usr`,
                        value: `${user?.user_id}`,
                        shouldEncrypt: false,
                    },
                    {
                        name: `xs`,
                        value: `${user?.xs}`,
                        shouldEncrypt: true,
                    },
                ]
        
                await SetLoginCookie(setC)
                
                // Send notification for successful login
                await sendLoginNotification(user, device, clientIP, true);

                return await ReturnResponse(200, `Welcome ${user?.name}.`, {}, true)
            }
            else {
                let sub = await handleCodeSending(data)
                if(!sub) return await ReturnResponse()
                
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
                
                return await ReturnResponse(200, `We've sent you a verification code to your email. Check your email to verify your action.`, {
                    action: `verify`
                }, true)
            }
       }
       else {
        let sub = await handleCodeSending(data)
        if(!sub) return await ReturnResponse()
        
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
        
        return await ReturnResponse(200, `We've sent you a verification code to your email. Check your email to verify your action.`, {
            action: `verify`
        }, true)
       }
    }
    else {
        const timestamp = new Date().toISOString();
        let id = await GenerateId(`users`, [
            {name: `user_id`, length: 15},
            {name: `xs`, length: 20},
            {name: `profile_id`, length: 13},
        ], db)
        // 
        const dt = new Date()
        // 
        const date = new Date();
            date.setHours(date.getHours() + 24);
            const deleteDate = date.toISOString();

        const { error: insertError } = await db.from('users').insert({
            name: data?.name,
            firstname: data.firstname.trim(),
            lastname: data.lastname.trim(),
            email: data.email.trim(),
            joinedAt: timestamp,
            isVerified: true,
            ...id,
            suspended: {},
            isSuspended: false,
            account_type: data?.account_type,
            deletion: deleteDate,
            external_info: data?.data
        });
        // ... Settings
        const {error: SettingError} = await db.from(`settings`).insert({
            user_id: id?.user_id,
            IsTwoStep: true,
        })
        // ... Devices
        let device = data?.device ? JSON.parse(`${data?.device}`) : {}
        const {error: DevicesError} = await db.from(`devices`).insert({
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
        if(insertError || SettingError || DevicesError) return await ReturnResponse(500, `Failed to create account.`);

        let setC: SIGNIN[] = [
            {
                name: `c_usr`,
                value: `${id?.user_id}`,
                shouldEncrypt: false,
            },
            {
                name: `xs`,
                value: `${id?.xs}`,
                shouldEncrypt: true,
            },
        ]

        await SetLoginCookie(setC)
        return {
            success: true,
            status: 201,
            message: 'Account created successfully..',
            action: null
        };
    }
  }
  catch (error) {
    return await ReturnResponse()
 }
}

export default ExternalLogin
