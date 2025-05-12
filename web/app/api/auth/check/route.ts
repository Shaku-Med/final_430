import { cookies, headers } from "next/headers"
import VerifyToken from "@/app/Auth/PageAuth/Action/VerifyToken"
import { getClientIP } from "@/app/Auth/IsAuth/SetToken"
import db from '@/app/Database/Supabase/Base1'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    let c = await cookies()
    let h = await headers()
    let au = h.get(`user-agent`)?.split(/\s+/).join('')
    
    let xs = c?.get('xs')?.value
    let c_usr = c?.get('c_usr')?.value
    
    if(!xs || !c_usr) {
      return NextResponse.json({ authenticated: false })
    }

    let ky = [`${au}`, `${await getClientIP(h)}`]
    let vt = await VerifyToken(xs, ky, true)
    if(!vt) {
      return NextResponse.json({ authenticated: false })
    }
    
    let { data, error } = await db.from('users')
      .select(`user_id, email, id, firstname, name, lastname, joinedAt, profile, team, theme`)
      .eq(`user_id`, c_usr)
      .eq(`xs`, vt?.data)
      .maybeSingle()
      
    if(error || !data) {
      c.delete(`xs`)
      c.delete(`c_usr`)
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: data
    })
  }
  catch {
    return NextResponse.json({ authenticated: false })
  }
} 