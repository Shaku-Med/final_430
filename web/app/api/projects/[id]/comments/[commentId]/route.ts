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

    // Verify project exists
    const { data: project } = await db
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Project not found'
      }, { status: 404 })
    }

    // Verify comment exists and belongs to user
    console.log('Checking comment with ID:', params.commentId)
    const { data: comments, error: commentError } = await db
      .from('project_comments')
      .select('*')
      .eq('id', params.commentId)

    if (commentError) {
      console.error('Error fetching comment:', commentError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Error fetching comment'
      }, { status: 500 })
    }

    if (!comments || comments.length === 0) {
      console.log('Comment not found with ID:', params.commentId)
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Comment not found'
      }, { status: 404 })
    }

    const comment = comments[0]
    console.log('Found comment:', comment)

    if (comment.user_id !== user.user_id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only delete your own comments'
      }, { status: 403 })
    }

    // Delete comment and its replies
    const { error: deleteError } = await db
      .from('project_comments')
      .delete()
      .or(`id.eq.${params.commentId},parent_id.eq.${params.commentId}`)

    if (deleteError) {
      console.error('Error deleting comment:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to delete comment'
      }, { status: 500 })
    }

    // Update project comments count
    await db
      .from('projects')
      .update({ comments: db.rpc('decrement') })
      .eq('id', params.id)

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

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: 'Comment content is required'
      }, { status: 400 })
    }

    // Verify comment exists and user is owner
    const { data: comment } = await db
      .from('project_comments')
      .select('*')
      .eq('id', params.commentId)
      .single()

    if (!comment) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Comment not found'
      }, { status: 404 })
    }

    if (comment.user_id !== user.user_id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only edit your own comments'
      }, { status: 403 })
    }

    // Update comment
    const { data: updatedComment, error } = await db
      .from('project_comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.commentId)
      .select()
      .single()

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
      content: updatedComment.content,
      updated_at: updatedComment.updated_at
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