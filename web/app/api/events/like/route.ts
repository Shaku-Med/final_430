import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { event_id, action } = body

    if (!event_id || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Event ID and action are required'
      }, { status: 400 })
    }

    // Check if the event exists
    const { data: event, error: eventError } = await db
      .from('events')
      .select('*')
      .eq('event_id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found',
        message: 'The specified event does not exist'
      }, { status: 404 })
    }

    // Check if user has already liked the event
    const { data: existingLike, error: likeError } = await db
      .from('event_likes')
      .select('*')
      .eq('event_id', event_id)
      .eq('user_id', user.user_id)
      .single()

    if (likeError && likeError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error checking existing like:', likeError)
      throw likeError
    }

    if (action === 'like') {
      if (existingLike) {
        return NextResponse.json({
          success: false,
          error: 'Already liked',
          message: 'You have already liked this event'
        }, { status: 400 })
      }

      // Add like
      const { error: insertError } = await db
        .from('event_likes')
        .insert({
          id: uuidv4(),
          event_id,
          user_id: user.user_id,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error inserting like:', insertError)
        throw insertError
      }

      // Update likes count
      const { error: updateError } = await db
        .from('events')
        .update({ likes: (event.likes || 0) + 1 })
        .eq('event_id', event_id)

      if (updateError) {
        console.error('Error updating likes count:', updateError)
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: 'Event liked successfully',
        likes: (event.likes || 0) + 1,
        isLiked: true
      })
    } else if (action === 'unlike') {
      if (!existingLike) {
        return NextResponse.json({
          success: false,
          error: 'Not liked',
          message: 'You have not liked this event yet'
        }, { status: 400 })
      }

      // Remove like
      const { error: deleteError } = await db
        .from('event_likes')
        .delete()
        .eq('event_id', event_id)
        .eq('user_id', user.user_id)

      if (deleteError) {
        console.error('Error deleting like:', deleteError)
        throw deleteError
      }

      // Update likes count
      const { error: updateError } = await db
        .from('events')
        .update({ likes: Math.max((event.likes || 0) - 1, 0) })
        .eq('event_id', event_id)

      if (updateError) {
        console.error('Error updating likes count:', updateError)
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: 'Event unliked successfully',
        likes: Math.max((event.likes || 0) - 1, 0),
        isLiked: false
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action',
        message: 'Action must be either "like" or "unlike"'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error handling event like:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 