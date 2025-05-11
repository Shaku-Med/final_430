import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'

export async function DELETE(
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

    // Verify comment exists and belongs to user
    const { data: existingComment } = await db
      .from('event_comments')
      .select('id')
      .eq('id', params.commentId)
      .eq('user_id', user.user_id)
      .single()

    if (!existingComment) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Comment not found or unauthorized'
      }, { status: 404 })
    }

    // Delete comment and its replies
    const { error } = await db
      .from('event_comments')
      .delete()
      .or(`id.eq.${params.commentId},parent_id.eq.${params.commentId}`)
      .eq('user_id', user.user_id)

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to delete comment'
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
      .update({ comments: Math.max((eventData?.comments || 0) - 1, 0) })
      .eq('event_id', params.id)

    if (updateError) {
      console.error('Error updating event comments count:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error in comment deletion:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input',
        message: 'Comment content is required'
      }, { status: 400 })
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

    // Verify comment exists and belongs to user
    const { data: existingComment } = await db
      .from('event_comments')
      .select('id')
      .eq('id', params.commentId)
      .eq('user_id', user.user_id)
      .single()

    if (!existingComment) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Comment not found or unauthorized'
      }, { status: 404 })
    }

    // Update the comment
    const { error } = await db
      .from('event_comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.commentId)
      .eq('user_id', user.user_id)

    if (error) {
      console.error('Error updating comment:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to update comment'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Comment updated successfully'
    })
  } catch (error) {
    console.error('Error in comment update:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 