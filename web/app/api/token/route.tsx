'use server'
import { cookies, headers } from 'next/headers'
import { VerifyHeaders } from '@/app/account/Actions/SetQuickToken'
import { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken'
import { NextRequest, NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export const ReturnResponse = async (status = 401, message = 'Unable to complete your request! Some information are missing.', added = {}, success = false) => {
    try {
        return NextResponse.json({ success, status, message, ...added }, { status })
    } catch {
        return NextResponse.json({ success: false, status: 401, message: 'Unable to complete your request! Some information are missing.', action: null }, { status: 401 })
    }
}

export async function GET() {
    try {
        let user = await IsAuth(true)
        if(!user){
            return await ReturnResponse(401, `You're not allowed to make this request.`)
        }
        // 
        const h = await headers()
        const au = h.get('user-agent')?.split(/\s+/).join('')
        const clientIP = await getClientIP(h)
        const header_v = await VerifyHeaders()
        // 
        const ky: string[] = [`${au}`, `${clientIP}`]
        let k: string[] = [`${process.env.PASS1}`, `${process.env.TOKEN2}`]

        // 
        if (!header_v) return await ReturnResponse(401, 'Something seems not to be working right.')
        
        const c = await cookies()
        const session = c?.get('session')?.value
        const access_token = c?.get('access_token')?.value

        if (!session || !access_token) {
            c.delete('access_token')
            return await ReturnResponse()
        }
        
        console.log('sending')
        const vrToken = await VerifyToken(`${session}`, k)

        const vraccess_token = await VerifyToken(`${access_token}`, ky)

        if (!vrToken || !vraccess_token) {
            return await ReturnResponse(500, 'Invalid data provided.')
        }
        
        c.delete('access_token')


        let f = await fetch(`${process.env.DATABASE_API}/api/token/generate-token`, {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json',
                'referer': `${process.env.DATABASE_API}/`
            },
            body: JSON.stringify({
                userData: user
            })
        })
        console.log(await f.text())
        return await ReturnResponse(200, 'Token verified successfully.', {}, true)
    } catch (error) {
        console.log(error)
        return await ReturnResponse()
    }
}
