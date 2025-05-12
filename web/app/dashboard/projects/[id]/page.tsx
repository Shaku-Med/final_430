import React from 'react'
import Project from './Component/Project'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { redirect } from 'next/navigation'


import { Metadata } from 'next'

interface ProjectMetadata {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  thumbnail?: {
    id?: string;
    name?: string;
    type?: string;
    url?: string;
  };
  user_id: string;
  created_at?: string;
}

interface ProjectOwner {
  firstname: string;
  lastname: string;
  name: string;
  profile?: string;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const id = params.id;
  
  try {
    const { data: project, error } = await db
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !project) {
      return {
        title: 'Project Not Found',
        description: 'The requested project could not be found.',
      };
    }
    
    const typedProject = project as ProjectMetadata;
    
    // Get project owner details
    const { data: owner } = await db
      .from('users')
      .select('firstname, lastname, name, profile')
      .eq('user_id', typedProject.user_id)
      .single();
    
    const typedOwner = owner as ProjectOwner | null;
    
    // Get project technology tags if they exist
    const { data: tags } = await db
      .from('project_tags')
      .select('tag')
      .eq('project_id', id);
    
    const techTags = tags ? tags.map(t => t.tag) : [];
    
    // Get project members count
    const { count: membersCount } = await db
      .from('project_members')
      .select('*', { count: 'exact' })
      .eq('project_id', id);
    
    const formattedDate = new Date(typedProject.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const statusDisplay = typedProject.status
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    
    const description = typedProject.description 
      ? `${typedProject.description.slice(0, 160)}${typedProject.description.length > 160 ? '...' : ''}` 
      : `${statusDisplay} project with ${membersCount || 0} team members. Join this collaborative project today!`;
        
    const keywords = [
      typedProject.title,
      statusDisplay,
      'project',
      'collaboration',
      ...techTags,
      typedOwner?.name || 'team project',
      ...typedProject.title.split(' ').filter((word: string) => word.length > 3)
    ];
    
    return {
      title: `${typedProject.title} | Project`,
      description,
      openGraph: {
        title: typedProject.title,
        description,
        type: 'article',
        publishedTime: typedProject.created_at || new Date().toISOString(),
        authors: typedOwner ? [`${typedOwner.firstname} ${typedOwner.lastname}`] : []
      },
      twitter: {
        card: 'summary_large_image',
        title: typedProject.title,
        description,
      },
      alternates: {
        canonical: `/projects/${id}`,
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      keywords: keywords,
      applicationName: 'CSI Spotlight',
      authors: typedOwner ? [{ name: `${typedOwner.firstname} ${typedOwner.lastname}` }] : [],
      creator: typedOwner ? `${typedOwner.firstname} ${typedOwner.lastname}` : 'Project Platform',
      publisher: 'CSI Spotlight',
      formatDetection: {
        telephone: false,
      },
      other: {
        'og:locale': 'en_US',
        'og:project:status': typedProject.status,
        'og:project:members': String(membersCount || '0'),
        'og:project:date': formattedDate,
      },
    };
  } catch (error) {
    return {
      title: 'Project Details',
      description: 'View project details and information',
    };
  }
}


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
