import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // First check if the event exists and belongs to the user
    const { data: event, error: fetchError } = await db
      .from('events')
      .select('user_id')
      .eq('event_id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify the event belongs to the user
    if (event.user_id !== user.user_id) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    const { error } = await db
      .from('events')
      .delete()
      .eq('event_id', params.id)
      .eq('user_id', user.user_id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch the event
    const { data: event, error } = await db
      .from('events')
      .select('*')
      .eq('event_id', params.id)
      .single()

    if (error || !event) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Event not found'
      }, { status: 404 })
    }

    // Check if user has liked this event
    const { data: like } = await db
      .from('event_likes')
      .select('*')
      .eq('event_id', params.id)
      .eq('user_id', user.user_id)
      .single()

    // Get suggested events (excluding current event)
    const { data: suggestedEvents } = await db
      .from('events')
      .select('event_id, title, description, date, status, thumbnail, likes, comments, shares')
      .neq('event_id', params.id)
      .order('date', { ascending: false })
      .limit(3)

    return NextResponse.json({
      ...event,
      isLiked: !!like,
      isAuth: true,
      suggestedEvents: suggestedEvents || []
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 