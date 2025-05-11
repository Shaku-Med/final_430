import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Action is required'
      }, { status: 400 })
    }

    // Check if user has already liked the event
    const { data: existingLike, error: likeError } = await db
      .from('event_likes')
      .select('*')
      .eq('event_id', params.id)
      .eq('user_id', user.user_id)
      .single()

    if (likeError && likeError.code !== 'PGRST116') {
      console.error('Error checking existing like:', likeError)
      throw likeError
    }

    // Get current likes count
    const { data: event, error: fetchError } = await db
      .from('events')
      .select('likes')
      .eq('event_id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching event:', fetchError)
      throw fetchError
    }

    // Calculate new likes count based on action and existing like
    const currentLikes = event?.likes || 0
    let newLikes = currentLikes

    if (action === 'like' && !existingLike) {
      // Add like if user hasn't liked before
      newLikes = currentLikes + 1
      const { error: insertError } = await db
        .from('event_likes')
        .insert({
          id: uuidv4(),
          event_id: params.id,
          user_id: user.user_id,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error inserting like:', insertError)
        throw insertError
      }
    } else if (action === 'unlike' && existingLike) {
      // Remove like if user has liked before
      newLikes = Math.max(currentLikes - 1, 0)
      const { error: deleteError } = await db
        .from('event_likes')
        .delete()
        .eq('event_id', params.id)
        .eq('user_id', user.user_id)

      if (deleteError) {
        console.error('Error deleting like:', deleteError)
        throw deleteError
      }
    }

    // Update likes count
    const { error: updateError } = await db
      .from('events')
      .update({ likes: newLikes })
      .eq('event_id', params.id)

    if (updateError) {
      console.error('Error updating likes count:', updateError)
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `Event ${action}d successfully`,
      likes: newLikes,
      isLiked: action === 'like'
    })
  } catch (error) {
    console.error('Error handling event like:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
} 