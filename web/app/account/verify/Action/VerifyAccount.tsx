'use server'
import { cookies, headers } from 'next/headers'
import { ReturnResponse } from '../../Actions/LoginSignup'
import { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken'
import { VerifyHeaders } from '../../Actions/SetQuickToken'
import db from '@/app/Database/Supabase/Base1'
import { handleCodeSending } from '../../Actions/ExternalLogin'
import { SetLoginCookie, VerifyPassword } from '@/app/Auth/Lock/Password'

interface DATA {
   device?: string;
   pin: string;
}

const VerifyAccount = async (data: DATA) => {
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
   let verify = c?.get(`verify`)?.value
   let ky = [`${au}`, `${await getClientIP(h)}`]
   // 
   if(!_athK_ || !verify) {
         c.delete(`verify`)
         return await ReturnResponse()
   };
   
   let vrToken = await VerifyToken(`${_athK_}`)
   let vrauthsession = await VerifyToken(`${verify}`, ky)
   if(!vrToken || !vrauthsession) return await ReturnResponse(401, `Invalid data provided.`, {
         action: `window.location.reload()`
   });

   c.delete(`verify`)

   // 
   const verificationToken = c?.get(`acT`)?.value
   
   if (!verificationToken) {
      return await ReturnResponse(401, `This page is not working.`)
   }
   
   let vtky = [`${process.env.TOKEN3}`, `${await getClientIP(h)}`]
   let vVtoken = await VerifyToken(`${verificationToken}`, vtky, true)
   if(!vVtoken) return await ReturnResponse(401, `Authorization was not found!`);

   // 
   let {data: user, error} = await db.from(`users`).select(`isVerified,user_id,firstname,name,xs`).eq(`email`, vVtoken?.email).maybeSingle()
   if(error) return await ReturnResponse(401, `Account doesn't seem to be available anymore.`);
   
   if(!vVtoken?.shouldLogin){
      if(user?.isVerified) return await ReturnResponse(401, `This account is already verified.`);
   }
   let {data: codes, error: er} = await db.from(`verification_codes`).select(`*`).eq(`user_id`, `${vVtoken?.account ? user?.user_id : au}`).maybeSingle()
   if(er) return await ReturnResponse(401, `Account doesn't seem to be available anymore.`);

   // 
   if(!codes) return await ReturnResponse(401, `Verification Failed.`);
   let attempt = codes?.attempts
   // 
   if(codes?.attempts > 6){
      return await ReturnResponse(401, `You have exceeded the maximum number of attempts. Please try again later.`)
   }

   let vc = await VerifyPassword(`${data?.pin}`, `${codes?.code}`)
   if(!vc) {
      attempt = attempt + 1;
      if(attempt > 6){
         
         let sub = await handleCodeSending({
            email: vVtoken?.email,
            firstname: user?.firstname,
            device: data?.device,
    
        }, `This is your new code ${user?.firstname}. Your account had multiple failed attempts.`, `${vVtoken?.account ? user?.user_id : au}`);
        if(!sub) return await ReturnResponse();
        // 
        return await ReturnResponse(429, `Due to multiple attempts, we've sent your a new code to your account. Check your email.`, {}, false)

      }
      else {
         // 
         let {error: er1} = await db.from(`verification_codes`).update({
            attempts: attempt
         }).eq(`user_id`, `${vVtoken?.account ? user?.user_id : au}`)
         if(er1) return await ReturnResponse(401, `Access not granted.`);
         // 
         return await ReturnResponse(401, `The verification code you entered is incorrect. ${(attempt > 1) ? ` ⚠️ You have ${6 - attempt} attempts left.` : ``}`)
      }
   };

   let {error: er1} = await db.from(`verification_codes`).delete().eq(`user_id`, `${vVtoken?.account ? user?.user_id : au}`)
   if(er1) return await ReturnResponse(401, `Access not granted.`);
   //
   c.delete(`acT`)
  if(vVtoken?.account){
   let {error: er2} = await db.from(`users`).update({
      isVerified: true,
   }).eq(`user_id`, `${user?.user_id}`)

   if(er2) return await ReturnResponse(401, `Access Failed.`);
   return await ReturnResponse(200, `Your account has been verified successfully.`, {
      action: `dashboard`
   }, true)
  }
  else {
   if(vVtoken?.shouldLogin){
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
      return await ReturnResponse(200, `Welcome ${user?.name || user?.firstname}.`, {}, true)
   }
   
   return await ReturnResponse(200, `Your account has been verified successfully.`, {
      verified: true
   }, true)
  }
 }
 catch {
    return await ReturnResponse(401, `Unable to complete your request! Some information are missing.`)
 }
}

export default VerifyAccount
