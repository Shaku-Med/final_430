import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify event exists
    const { data: event } = await db
      .from('events')
      .select('event_id')
      .eq('event_id', params.id)
      .single()

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Event not found'
      }, { status: 404 })
    }

    // Verify parent comment exists
    const { data: parentComment } = await db
      .from('event_comments')
      .select('id')
      .eq('id', params.commentId)
      .single()

    if (!parentComment) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Parent comment not found'
      }, { status: 404 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Reply content is required'
      }, { status: 400 })
    }

    // Create reply
    const { data: reply, error } = await db
      .from('event_comments')
      .insert({
        id: uuidv4(),
        event_id: params.id,
        user_id: user.user_id,
        content,
        parent_id: params.commentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        users!inner (
          id,
          firstname,
          lastname,
          name,
          profile
        )
      `)
      .single()

    if (error) {
      console.error('Error creating reply:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to create reply'
      }, { status: 500 })
    }

    // Get current comments count
    const { data: eventData } = await db
      .from('events')
      .select('comments')
      .eq('event_id', params.id)
      .single()

    // Update event comments count
    const { error: updateError } = await db
      .from('events')
      .update({ comments: (eventData?.comments || 0) + 1 })
      .eq('event_id', params.id)

    if (updateError) {
      console.error('Error updating event comments count:', updateError)
    }

    return NextResponse.json({
      success: true,
      reply: {
        ...reply,
        isOwner: true,
        isLiked: false
      }
    })
  } catch (error) {
    console.error('Error in reply creation:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 