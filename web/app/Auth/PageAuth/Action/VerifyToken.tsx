import { cookies, headers } from "next/headers"
import * as jwt from 'jsonwebtoken'
import { DecryptCombine } from "../../Lock/Combine"
import { getClientIP } from "../../IsAuth/SetToken"

// 
const VerifyToken = async (where?: string, authKeys?: any[], returnData?: boolean) => {
  try {
    let h = await headers()
    let c = await cookies()
    let gip = await getClientIP(h)
    // 

    let au = h.get('user-agent')?.split(/\s+/).join('')
    let k = `${au}+${process.env.TOKEN1}`
    // 
    let keys = [k, process.env.TOKEN2]
    if(authKeys){
        keys = [k, ...authKeys]
    }
    // 
    let vt = where || c.get(`_q_`)?.value
    if(!vt) return false;
    // 
    let dec: any = DecryptCombine(vt, keys)
    if(dec){
        // 
        if(typeof dec === 'object'){
            
            let o = {
                'sec-ch-ua-platform': h.get('sec-ch-ua-platform'),
                'user-agent': h.get('user-agent')?.split(/\s+/)?.join(''),
                'x-forwarded-for': h.get('x-forwarded-for')
            } 
            let obj = {
                ip: gip,
                ...o
            }
            // 
            if(dec.ip === obj.ip && dec['user-agent'] === obj["user-agent"] && dec['x-forwarded-for'] === obj["x-forwarded-for"] && dec['sec-ch-ua-platform'] === obj["sec-ch-ua-platform"]){
                return returnData ? dec : true
            }
            else {
                return false
            }
        }
        else {
            return typeof dec === 'undefined' ? undefined : false
        }
    }
    else {
        return typeof dec === 'undefined' ? undefined : false
    }
  }
  catch (e) {
    // console.log(e)
    return e?.toString()?.includes('expired') ? undefined : null
  }
}

export default VerifyToken