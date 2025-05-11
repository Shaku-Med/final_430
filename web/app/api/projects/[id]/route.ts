import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

interface Project {
  id: string
  title: string
  description: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  thumbnail?: {
    id?: string
    name?: string
    type?: string
    url?: string
  }
  profile?: string
  likes: number
  comments: number
  shares: number
  user_id: string
  client: string
  budget: string
  team: string
  startDate: string
  endDate: string
}

interface SuggestedProject extends Project {
  users: {
    firstname: string
    lastname: string
    name: string
    profile: string
  } | null
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // First check if the project exists and belongs to the user
    const { data: project, error: fetchError } = await db
      .from('projects')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Verify the project belongs to the user
    if (project.user_id !== user.user_id) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    const { error } = await db
      .from('projects')
      .delete()
      .eq('id', params.id).eq('user_id', user.user_id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch the project
    const { data: project, error } = await db
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is authenticated and get their like status
    let isOwner = false
    let isLiked = false
    
    if (user && typeof user !== 'boolean' && 'user_id' in user) {
      isOwner = project.user_id === user.user_id
      
      // Check if user has liked this project
      const { data: like } = await db
        .from('project_likes')
        .select('*')
        .eq('project_id', params.id)
        .eq('user_id', user.user_id)
        .single()
      
      isLiked = !!like
    }

    // Get suggested projects (excluding current project)
    const { data: suggestedProjects } = await db
      .from('projects')
      .select('id, title, description, status, thumbnail, likes, comments, shares, user_id, client, budget, team, startDate, endDate')
      .neq('id', params.id)
      .order('created_at', { ascending: false })
      .limit(3)

    // Fetch authors for suggested projects
    let suggestedProjectsWithAuthors: SuggestedProject[] = []
    if (suggestedProjects && suggestedProjects.length > 0) {
      const userIds = [...new Set(suggestedProjects.map(project => project.user_id))]
      const { data: authors } = await db
        .from('users')
        .select('id, firstname, lastname, name, profile, user_id')
        .in('user_id', userIds)

      if (authors) {
        const authorMap: Record<string, any> = authors.reduce((acc, author) => {
          acc[author.user_id] = author
          return acc
        }, {} as Record<string, any>)

        suggestedProjectsWithAuthors = suggestedProjects.map(project => ({
          ...project,
          users: authorMap[project.user_id] || null
        }))
      }
    }

    return NextResponse.json({
      ...project,
      isOwner,
      isLiked,
      suggestedProjects: suggestedProjectsWithAuthors,
      isAuth: user && typeof user !== 'boolean' && 'user_id' in user
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
} 