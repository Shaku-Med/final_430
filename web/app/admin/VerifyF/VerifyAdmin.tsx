import { cookies, headers } from "next/headers"
import db from '@/app/Database/Supabase/Base1'
import { DecryptCombine } from "@/app/Auth/Lock/Combine"
import IsAuth from "@/app/Auth/IsAuth/IsAuth"

const VerifyAdmin = async (sendData?: boolean): Promise<boolean|object> => {
  try {
    let auth: any = await IsAuth(true)
    if(!auth) return false;
    // 
    let c = await cookies()
    let h = await headers()
    let au = h.get(`user-agent`)
    // 
    let admin = c?.get('admin')?.value
    // 
    if(!admin) return false;

    let ky = [`${process.env.ADMIN_LOGIN}`, `${au}`]
    let vt = DecryptCombine(admin, ky)
    if(!vt) return false;
    // 
    let { data, error } = await db.from('admin_keys').select(`id, user_id`).eq(`user_id`, auth.user_id).maybeSingle()
    if(error) {
      c.delete(`admin`)
      return false;
    };
    if(!data) {
      c.delete(`admin`)
      return false;
    };
    // 

    return sendData ? data : true;
  }
  catch {
    return false
  }
}

export default VerifyAdmin
