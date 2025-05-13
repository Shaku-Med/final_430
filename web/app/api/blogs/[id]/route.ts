import { NextResponse } from 'next/server'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const {
      title,
      excerpt,
      information,
      slugs,
    } = body

    // Validate required fields
    if (!title || !excerpt || !information) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Title, excerpt, and content are required'
      }, { status: 400 })
    }

    // Verify blog exists and belongs to user
    const { data: blog } = await db
      .from('blog')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Blog post not found'
      }, { status: 404 })
    }

    if (blog.user_id !== user.user_id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'You do not have permission to edit this blog'
      }, { status: 403 })
    }

    // Update blog post
    const { data: updatedBlog, error } = await db
      .from('blog')
      .update({
        title,
        excerpt,
        information,
        slugs: slugs || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog:', error)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to update blog post'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog
    })

  } catch (error) {
    console.error('Error in blog update:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 