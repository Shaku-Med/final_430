import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { project_id, action } = await request.json()

    if (!project_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if the project exists
    const { data: project, error: projectError } = await db
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (action === 'like') {
      // Check if user has already liked the project
      const { data: existingLike } = await db
        .from('project_likes')
        .select('*')
        .eq('project_id', project_id)
        .eq('user_id', user.user_id)
        .single()

      if (existingLike) {
        return NextResponse.json({ error: 'Already liked' }, { status: 400 })
      }

      // Add like
      const { error: likeError } = await db
        .from('project_likes')
        .insert({
          id: uuidv4(),
          project_id: project_id,
          user_id: user.user_id,
          created_at: new Date().toISOString()
        })

      if (likeError) {
        console.error('Error adding like:', likeError)
        throw likeError
      }

      // Update likes count
      const { data: updatedProject, error: updateError } = await db
        .from('projects')
        .update({ likes: (project.likes || 0) + 1 })
        .eq('id', project_id)
        .select('likes')
        .single()

      if (updateError) {
        console.error('Error updating likes count:', updateError)
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully liked project',
        isLiked: true,
        likes: updatedProject.likes
      })
    } else if (action === 'unlike') {
      // Check if user has liked the project
      const { data: existingLike } = await db
        .from('project_likes')
        .select('*')
        .eq('project_id', project_id)
        .eq('user_id', user.user_id)
        .single()

      if (!existingLike) {
        return NextResponse.json({ error: 'Not liked yet' }, { status: 400 })
      }

      // Remove like
      const { error: unlikeError } = await db
        .from('project_likes')
        .delete()
        .eq('project_id', project_id)
        .eq('user_id', user.user_id)

      if (unlikeError) {
        console.error('Error removing like:', unlikeError)
        throw unlikeError
      }

      // Update likes count
      const { data: updatedProject, error: updateError } = await db
        .from('projects')
        .update({ likes: Math.max((project.likes || 0) - 1, 0) })
        .eq('id', project_id)
        .select('likes')
        .single()

      if (updateError) {
        console.error('Error updating likes count:', updateError)
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully unliked project',
        isLiked: false,
        likes: updatedProject.likes
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in like endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 