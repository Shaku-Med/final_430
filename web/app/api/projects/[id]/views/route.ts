import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify project exists
    const { data: project } = await db
      .from('projects')
      .select('id, views')
      .eq('id', params.id)
      .single()

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Project not found'
      }, { status: 404 })
    }

    // Update views count
    const { error: updateError } = await db
      .from('projects')
      .update({ views: (project.views || 0) + 1 })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating project views:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to update views'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Views updated successfully',
      views: (project.views || 0) + 1
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