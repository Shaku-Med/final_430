import { cookies, headers } from "next/headers"
import VerifyToken from "../PageAuth/Action/VerifyToken"
import { getClientIP } from "./SetToken"
import db from '@/app/Database/Supabase/Base1'

const IsAuth = async (sendData?: boolean): Promise<boolean|object> => {
  try {
    let c = await cookies()
    let h = await headers()
    let au = h.get(`user-agent`)?.split(/\s+/).join('')
    // 
    let xs = c?.get('xs')?.value
    let c_usr = c?.get('c_usr')?.value
    // 
    if(!xs || !c_usr) return false;

    let ky = [`${au}`, `${await getClientIP(h)}`]
    let vt = await VerifyToken(xs, ky, true)
    if(!vt) return false;
    // 
    let { data, error } = await db.from('users').select(`user_id, email, id, firstname, name, lastname, joinedAt`).eq(`user_id`, c_usr).eq(`xs`, vt?.data).maybeSingle()
    if(error) {
      c.delete(`xs`)
      c.delete(`c_usr`)
      return false;
    };
    if(!data) {
      c.delete(`xs`)
      c.delete(`c_usr`)
      return false;
    };
    // 

    return sendData ? data : true;
  }
  catch {
    return false
  }
}

export default IsAuth
