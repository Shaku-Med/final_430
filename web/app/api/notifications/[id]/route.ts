import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id
    const userData = user as any

    const { error } = await db
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 