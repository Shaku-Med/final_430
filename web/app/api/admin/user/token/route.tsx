import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import SetToken, { getClientIP } from '@/app/Auth/IsAuth/SetToken'
import { EncryptCombine } from '@/app/Auth/Lock/Combine'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import VerifyAdmin from '@/app/admin/VerifyF/VerifyAdmin'

export async function POST(request: NextRequest) {
    try {

        const user = await IsAuth(true)
        if (!user || typeof user === 'boolean' || !('user_id' in user)) {
          return new NextResponse('Unauthorized', { status: 401 })
        }
    
        // Then verify admin authentication
        let vA = await VerifyAdmin(true)
        if(!vA){
            return NextResponse.json({
                success: false,
                message: 'You are not authorized to generate a token'
            }, { status: 401 })
        }

        const { user_id } = await request.json()

        if (!user_id) {
            return NextResponse.json({
                success: false, 
                message: 'User ID is required'
            }, { status: 400 })
        }

        let key = [`${process.env.TEAM_KEY}`, `${process.env.TEAM_KEY_2}`]
        let TK = await SetToken(
            {
                expiresIn: '24h',
                algorithm: 'HS512'
            },
            key,
            {
                user_id: user_id
            },
            true
        )

        if(!TK){
            return NextResponse.json({
                success: false,
                message: 'Unable to generate token'
            }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            message: 'Token generated successfully',
            token: TK
        })
    } catch (error) {
        console.error('Token generation error:', error)
        return NextResponse.json({
            success: false,
            message: 'Unable to complete your request! Some information are missing.',
        }, { status: 401 })
    }
}
