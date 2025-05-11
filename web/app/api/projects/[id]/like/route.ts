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

    const { action } = await request.json()

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Check if the project exists
    const { data: project, error: projectError } = await db
      .from('projects')
      .select('likes')
      .eq('id', params.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user has already liked the project
    const { data: existingLike } = await db
      .from('project_likes')
      .select('*')
      .eq('project_id', params.id)
      .eq('user_id', user.user_id)
      .single()

    if (action === 'like' && existingLike) {
      return NextResponse.json(
        { error: 'Project already liked' },
        { status: 400 }
      )
    }

    if (action === 'unlike' && !existingLike) {
      return NextResponse.json(
        { error: 'Project not liked' },
        { status: 400 }
      )
    }

    // Update likes count
    const newLikesCount = action === 'like' ? project.likes + 1 : project.likes - 1
    const { error: updateError } = await db
      .from('projects')
      .update({ likes: newLikesCount })
      .eq('id', params.id)

    if (updateError) {
      throw updateError
    }

    // Update like status
    if (action === 'like') {
      const { error: likeError } = await db
        .from('project_likes')
        .insert({
          project_id: params.id,
          user_id: user.user_id
        })

      if (likeError) {
        throw likeError
      }
    } else {
      const { error: unlikeError } = await db
        .from('project_likes')
        .delete()
        .eq('project_id', params.id)
        .eq('user_id', user.user_id)

      if (unlikeError) {
        throw unlikeError
      }
    }

    return NextResponse.json({
      success: true,
      likes: newLikesCount,
      isLiked: action === 'like',
      message: action === 'like' ? 'Project liked successfully' : 'Project unliked successfully'
    })
  } catch (error) {
    console.error('Error updating project like:', error)
    return NextResponse.json(
      { error: 'Failed to update project like' },
      { status: 500 }
    )
  }
} 