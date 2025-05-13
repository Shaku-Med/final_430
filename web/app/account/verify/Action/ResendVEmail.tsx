'use server'
import { cookies, headers } from 'next/headers'
import { ReturnResponse } from '../../Actions/LoginSignup'
import { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken'
import { VerifyHeaders } from '../../Actions/SetQuickToken'
import db from '@/app/Database/Supabase/Base1'
import { handleCodeSending } from '../../Actions/ExternalLogin'

interface DATA {
    device?: string;
}

const ResendVEmail = async (data?: DATA) => {
  try {
    if(!data) return await ReturnResponse(401, `Request Denied.`)
        // 
    let h = await headers()
    let au = h.get(`user-agent`)?.split(/\s+/).join('')
    // 
    let header_v = await VerifyHeaders()
    if(!header_v) return await ReturnResponse(401, `Something seems not to be working right.`);
    
    let c = await cookies()
    let _athK_ = c?.get(`_athk_`)?.value
    let resend = c?.get(`resend`)?.value
    let ky = [`${au}`, `${await getClientIP(h)}`]
    // 
    if(!_athK_ || !resend) {
        c.delete(`resend`)
        return await ReturnResponse()
    };
    
    let vrToken = await VerifyToken(`${_athK_}`)
    let vrauthsession = await VerifyToken(`${resend}`, ky)
    // console.log(vrToken)
    if(!vrToken || !vrauthsession) return await ReturnResponse(401, `Invalid data provided.`, {
        action: `window.location.reload()`
    });

    c.delete(`resend`)

    // 
    const verificationToken = c?.get(`acT`)?.value
    
    if (!verificationToken) {
      return await ReturnResponse(401, `This page is not working.`)
    }
    
    let vtky = [`${process.env.TOKEN3}`, `${await getClientIP(h)}`]
    let vVtoken = await VerifyToken(`${verificationToken}`, vtky, true)
    if(!vVtoken) return await ReturnResponse(401, `Authorization was not found!`);

    if(!vrToken?.account) return await ReturnResponse(500, `Something went wrong.`, {}, false);

    // 
    let {data: user, error} = await db.from(`users`).select(`isVerified, firstname`).eq(`email`, vVtoken?.email).maybeSingle()
    if(error) return await ReturnResponse(401, `Account doesn't seem to be available anymore.`);

    if(user?.isVerified) return await ReturnResponse(401, `This account is already verified.`);

    let sub = await handleCodeSending({
        email: vVtoken?.email,
        firstname: user?.firstname,
        device: data?.device,

    }, `Verify your account ${user?.firstname}`);
    if(!sub) return await ReturnResponse();
    // 
    return await ReturnResponse(200, `A new account verification code has been sent to your email.`, {}, true)

  }
  catch {
    return await ReturnResponse()
  }
}

export default ResendVEmail
