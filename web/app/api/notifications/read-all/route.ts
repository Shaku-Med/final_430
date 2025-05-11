import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function POST(request: Request) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = user as any

    const { error } = await db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userData.user_id)
      .eq('is_read', false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 