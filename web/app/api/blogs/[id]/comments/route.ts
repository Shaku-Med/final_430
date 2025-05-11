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

    // Verify blog exists
    const { data: blog } = await db
      .from('blog')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Blog post not found'
      }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get comments with user information
    const { data: comments, error, count } = await db
      .from('blog_comments')
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
      .eq('blog_id', params.id)
    //   .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch comments'
      }, { status: 500 })
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const { data: replies } = await db
          .from('blog_comments')
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
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies_list: replies || [],
          isOwner: comment.user_id === user.user_id,
          isLiked: false
        }
      })
    )

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
      hasMore: count ? offset + limit < count : false
    })
  } catch (error) {
    console.error('Error in comments:', error)
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

    // Verify blog exists
    const { data: blog } = await db
      .from('blog')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Blog post not found'
      }, { status: 404 })
    }

    const body = await request.json()
    const { content, parent_id } = body

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Comment content is required'
      }, { status: 400 })
    }

    // If parent_id is provided, verify parent comment exists
    if (parent_id) {
      const { data: parentComment } = await db
        .from('blog_comments')
        .select('id')
        .eq('id', parent_id)
        .single()

      if (!parentComment) {
        return NextResponse.json({
          success: false,
          error: 'Not found',
          message: 'Parent comment not found'
        }, { status: 404 })
      }
    }

    // Create comment
    const { data: comment, error } = await db
      .from('blog_comments')
      .insert({
        id: uuidv4(),
        blog_id: params.id,
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

    // Get current comments count
    const { data: blogData } = await db
      .from('blog')
      .select('comments')
      .eq('id', params.id)
      .single()

    // Update blog comments count
    const { error: updateError } = await db
      .from('blog')
      .update({ comments: (blogData?.comments || 0) + 1 })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating blog comments count:', updateError)
    }

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        isOwner: true,
        isLiked: false,
        replies_list: []
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

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({
        success: false,
        error: 'Missing comment ID',
        message: 'Comment ID is required'
      }, { status: 400 })
    }

    // Verify comment exists and belongs to user
    const { data: existingComment } = await db
      .from('blog_comments')
      .select('id')
      .eq('id', commentId)
      .eq('user_id', user.user_id)
      .single()

    if (!existingComment) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Comment not found or unauthorized'
      }, { status: 404 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Comment content is required'
      }, { status: 400 })
    }

    // Update comment
    const { data: comment, error } = await db
      .from('blog_comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', user.user_id)
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
      content: comment.content,
      updated_at: comment.updated_at
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

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({
        success: false,
        error: 'Missing comment ID',
        message: 'Comment ID is required'
      }, { status: 400 })
    }

    // Verify comment exists and belongs to user
    const { data: existingComment } = await db
      .from('blog_comments')
      .select('id')
      .eq('id', commentId)
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
      .from('blog_comments')
      .delete()
      .or(`id.eq.${commentId},parent_id.eq.${commentId}`)
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
    const { data: blogData } = await db
      .from('blog')
      .select('comments')
      .eq('id', params.id)
      .single()

    // Update blog comments count
    const { error: updateError } = await db
      .from('blog')
      .update({ comments: Math.max((blogData?.comments || 0) - 1, 0) })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating blog comments count:', updateError)
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