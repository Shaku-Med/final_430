'use server'

import { cookies, headers } from "next/headers";
import Verification from "../../dashboard/@auth/Components/Verification";
import SetToken, { getClientIP } from "@/app/Auth/IsAuth/SetToken";
import VerifyToken from "@/app/Auth/PageAuth/Action/VerifyToken";

interface VHeaderReturn {
    status?: boolean;
    headerInfo: object;
}

export const VerifyHeaders = async (returnData?: boolean): Promise<boolean|VHeaderReturn> => {
    try {
        let h = await headers()
        // 
        let url: string = process.env.NODE_ENV === 'production' ? `${process.env.PROD_MODE}` : `${process.env.DEV_MODE}`
        // 
        // I will add more verification here too later for not let's just have this one.
        const ipVerify = Verification({
            ipAddress: await getClientIP(h)
        })
        if(!h.get(`referer`)?.startsWith(url)) return false;
        // 
        return true;
    }
    catch {
        return false;
    }
}

const SetQuickToken = async (setname?: string, checkfor?: string, keys?: any[], addKeys?: any[]): Promise<boolean> => {
  try {
    let c = await cookies()
    let h = await headers()
    let au = h.get(`user-agent`)?.split(/\s+/).join('')
    // 
    let vh = await VerifyHeaders()
    if(!vh) return false;
    // Perform The tokenizers here...
    // 
    let _athK_ = checkfor || c?.get(`_athk_`)?.value
    if(!_athK_) false;
    // 
    let vrToken = await VerifyToken(`${_athK_}`, keys)
    if(!vrToken) false;
    // 
    let ky = [`${au}`, `${await getClientIP(h)}`]
    if(addKeys){
        ky = [...ky, ...addKeys]
    }
    // 
    let session = await SetToken({
      expiresIn: '15s',
      algorithm: 'HS512'
    }, ky)
    // 
    if(!session) return false;
    // 
    c.set(`${setname || `authsession`}`, `${session}`)
    return true;
  }
  catch {
    return false;
  }
}

export default SetQuickToken
