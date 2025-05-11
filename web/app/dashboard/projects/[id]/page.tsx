import React from 'react'
import Project from './Component/Project'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { redirect } from 'next/navigation'

interface Project {
  project_id: string
  title: string
  description: string
  date: string
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
  isOwner: boolean
  isLiked?: boolean
  views: number
  participants: {
    user_id: string
    firstname: string
    lastname: string
    name: string
    profile: string
    role: string
    status: string
    last_active_at: string
    contribution_score: number
  }[]
  hasJoined: boolean
  isAuth: boolean
}

interface ProjectMember {
  user_id: string
  role: string
  status: string
  last_active_at: string
  contribution_score: number
  profiles: {
    firstname: string
    lastname: string
    name: string
    profile: string
  } | null
}

async function getProject(id: string) {
  try {
    const { data: project, error } = await db
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!project) return null

    // Get project participants
    const { data: participants, error: participantsError } = await db
      .from('project_members')
      .select(`
        user_id,
        role,
        status,
        last_active_at,
        contribution_score,
        profiles:user_id (
          firstname,
          lastname,
          name,
          profile
        )
      `)
      .eq('project_id', id)

    if (participantsError) throw participantsError

    // Transform participants data to include all required fields
    const transformedParticipants = ((participants as unknown) as ProjectMember[])?.map(p => ({
      user_id: p.user_id,
      firstname: p.profiles?.firstname || '',
      lastname: p.profiles?.lastname || '',
      name: p.profiles?.name || '',
      profile: p.profiles?.profile || '',
      role: p.role || '',
      status: p.status || '',
      last_active_at: p.last_active_at || '',
      contribution_score: p.contribution_score || 0
    })) || []

    // Get project likes count
    const { count: likesCount, error: likesError } = await db
      .from('project_likes')
      .select('*', { count: 'exact' })
      .eq('project_id', id)

    if (likesError) throw likesError

    // Get project comments count
    const { count: commentsCount, error: commentsError } = await db
      .from('project_comments')
      .select('*', { count: 'exact' })
      .eq('project_id', id)

    if (commentsError) throw commentsError

    // Check if user is authenticated and get their like status
    let isOwner = false
    let isLiked = false
    let hasJoined = false
    
    const user = await IsAuth(true)
    if (user && typeof user !== 'boolean' && 'user_id' in user) {
      isOwner = project.user_id === user.user_id
      
      // Check if user has liked this project
      const { data: like } = await db
        .from('project_likes')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', user.user_id)
        .single()
      
      isLiked = !!like

      // Check if user has joined the project
      const { data: member } = await db
        .from('project_members')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', user.user_id)
        .single()
      
      hasJoined = !!member
    }

    return {
      ...project,
      likes: likesCount || 0,
      comments: commentsCount || 0,
      participants: transformedParticipants,
      isOwner,
      isLiked,
      hasJoined,
      isAuth: user && typeof user !== 'boolean' && 'user_id' in user
    }
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

const page = async ({ params }: { params: { id: string } }) => {
  const project = await getProject(params.id)

  if (!project) {
    redirect('/dashboard/projects')
  }

  return (
    <>
      <Project data={project}/>
    </>
  )
}

export default page
