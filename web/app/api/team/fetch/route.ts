import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function GET(request: Request) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Fetch team members with pagination
    const { data: teamMembers, error, count } = await db
      .from('team_members')
      .select(`
        description,
        user_id,
        name,
        role,
        socialLinks,
        expertise,
        users:user_id (
          firstname,
          lastname,
          profile
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json({ error: 'Failed to fetch team members', message: `Something went wrong.` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      teamMembers,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: count ? offset + limit < count : false
      }
    })
  } catch (error: any) {
    console.error('Error in fetch team members endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', message: `Something went wrong.` }, { status: 500 })
  }
} 