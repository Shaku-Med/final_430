// I'm using node js now...
// import { uploadFile } from '@/app/Database/firebase'
// import { NextResponse } from 'next/server'
// import { v4 as uuidv4 } from 'uuid'

import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { VerifyHeaders } from '@/app/account/Actions/SetQuickToken'
import { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import VerifyToken from '@/app/Auth/PageAuth/Action/VerifyToken'
import { NextRequest, NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { decrypt, encrypt } from '@/app/Auth/Lock/Enc'

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData()
//     const file = formData.get('file') as File
    
//     if (!file) {
//       return NextResponse.json(
//         { error: 'No file provided' },
//         { status: 400 }
//       )
//     }

//     // Create a temporary path with timestamp and UUID
//     const timestamp = new Date().toISOString()
//     const tempPath = `temp/${timestamp}/${uuidv4()}/${file.name}`
    
//     // Upload the file
//     const url = await uploadFile(file, tempPath)

//     return NextResponse.json({ 
//       url,
//       path: tempPath,
//       name: file.name,
//       type: file.type,
//       size: file.size,
//       isTemporary: true,
//       uploadedAt: timestamp,
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
//     })
//   } catch (error) {
//     console.error('Upload error:', error)
//     return NextResponse.json(
//       { error: 'Failed to upload file' },
//       { status: 500 }
//     )
//   }
// } 

export async function POST(request: Request) {
  return redirect('/')
}


export const ReturnResponse = async (status = 401, message = 'Unable to complete your request! Some information are missing.', added = {}, success = false) => {
    try {
        return NextResponse.json({ success, status, message, ...added }, { status })
    } catch {
        return NextResponse.json({ success: false, status: 401, message: 'Unable to complete your request! Some information are missing.', action: null }, { status: 401 })
    }
}

export async function GET() {
    try {
        let user = await IsAuth()
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
        const session = h.get('Authorization')
        const file_token = c?.get('file_token')?.value

        if (!session || !file_token) {
            c.delete('file_token')
            return await ReturnResponse()
        }
        
        const vrToken = await VerifyToken(`${session}`, k)

        const vraccess_token = await VerifyToken(`${file_token}`, ky)

        if (!vrToken || !vraccess_token) {
            return await ReturnResponse(500, 'Invalid data provided.')
        }
        
        c.delete('file_token')

        let d = encrypt(`${process.env.FILE_TOKEN}`, `${process.env.KEY_LOCK}+${au}`)
        let f = await fetch(`${process.env.FILE_API}/`, {
            method: `POST`,
            headers: {
                'Content-Type': 'application/json',
                'referer': `${process.env.FILE_API}/`,
                'user-agent': `${au}`,
            },
            cache: 'no-cache',
            body: JSON.stringify({
                token: d
            })
        })

        console.log(f.statusText)
        
        if(!f.ok){
          return await ReturnResponse(f.status, `Access Denied.`)
        }

        return await ReturnResponse(200, 'Token verified successfully.', {...await f.json()}, true)
    } catch (error) {
        console.log(error)
        return await ReturnResponse()
    }
}

