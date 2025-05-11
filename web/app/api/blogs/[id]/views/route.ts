import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify blog exists
    const { data: blog } = await db
      .from('blog')
      .select('id, views')
      .eq('id', params.id)
      .single()

    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Blog post not found'
      }, { status: 404 })
    }

    // Update views count
    const { error: updateError } = await db
      .from('blog')
      .update({ views: (blog.views || 0) + 1 })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating blog views:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to update views'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Views updated successfully'
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