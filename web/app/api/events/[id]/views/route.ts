import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify event exists
    const { data: event } = await db
      .from('events')
      .select('event_id, views')
      .eq('event_id', params.id)
      .single()

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Event not found'
      }, { status: 404 })
    }

    // Update views count
    const { error: updateError } = await db
      .from('events')
      .update({ views: (event.views || 0) + 1 })
      .eq('event_id', params.id)

    if (updateError) {
      console.error('Error updating event views:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to update views'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Views updated successfully',
      views: (event.views || 0) + 1
    })
  } catch (error) {
    console.error('Error updating views:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 