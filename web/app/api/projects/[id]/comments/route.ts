import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get comments with user information
    const { data: comments, error, count } = await db
      .from('project_comments')
      .select(`
        *,
        users!inner (
          id,
          firstname,
          lastname,
          name,
          profile
        )
      `, { count: 'exact' })
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({
        success: true,
        comments: [],
        hasMore: false
      })
    }

    return NextResponse.json({
      success: true,
      comments: (comments || []).map(comment => ({
        ...comment,
        isOwner: comment.user_id === user.user_id,
        isLiked: false
      })),
      hasMore: count ? offset + limit < count : false
    })
  } catch (error) {
    console.error('Error in comment fetching:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content, parent_id } = await request.json()

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: 'Comment content is required'
      }, { status: 400 })
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

    // Create comment
    const comment_id = uuidv4()
    const { data: comment, error } = await db
      .from('project_comments')
      .insert({
        comment_id,
        project_id: params.id,
        user_id: user.user_id,
        content,
        parent_id: parent_id || null,
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
      console.error('Error creating comment:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to create comment'
      }, { status: 500 })
    }

    // Update project comments count
    await db
      .from('projects')
      .update({ comments: db.rpc('increment') })
      .eq('id', params.id)

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        isOwner: true,
        isLiked: false
      }
    })
  } catch (error) {
    console.error('Error in comment creation:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content } = await request.json()
    const comment_id = params.id

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
      .eq('comment_id', comment_id)
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
      .eq('comment_id', comment_id)
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const comment_id = params.id

    // Verify comment exists and user is owner
    const { data: comment } = await db
      .from('project_comments')
      .select('*')
      .eq('comment_id', comment_id)
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
        message: 'You can only delete your own comments'
      }, { status: 403 })
    }

    // Delete comment and its replies
    const { error } = await db
      .from('project_comments')
      .delete()
      .or(`comment_id.eq.${comment_id},parent_id.eq.${comment_id}`)
      .eq('user_id', user.user_id)

    if (error) {
      console.error('Error deleting comment:', error)
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
      .eq('id', comment.project_id)

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