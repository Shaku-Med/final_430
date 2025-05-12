import React from 'react'
import Dynamic from './Component/Dynamic'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import { Metadata, ResolvingMetadata } from 'next'


type Props = {
  params: { id: string }
}

// Generate metadata for the page based on project data
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch project data
  const project = await getProject(params.id)
  
  // If no project found, return default metadata
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found',
    }
  }
  
  // Get the parent metadata
  const parentMetadata = await parent
  const previousImages = parentMetadata.openGraph?.images || []
  
  // Return metadata with project information
  return {
    title: project.title,
    description: project.description?.substring(0, 160) || 'View project details',
    openGraph: {
      title: project.title,
      description: project.description?.substring(0, 160) || 'View project details',
      images: project.thumbnail?.length > 0 
        ? [project.thumbnail[0]] 
        : previousImages,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description?.substring(0, 160) || 'View project details',
      images: project.thumbnail?.length > 0 ? [project.thumbnail[0]] : [],
    },
  }
}


async function getProject(id: string) {
  try {
    let usr: any = await IsAuth(true)
    // 
    const { data: project, error } = await db
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!project) return null

    // Get members for the project
    const { data: members, error: membersError } = await db
      .from('project_members')
      .select(`
        users (
          id,
          firstname,
          lastname,
          name,
          user_id,
          profile
        )
      `)
      .eq('project_id', id)

    if (membersError) {
      console.error('Error fetching project members:', membersError)
    }

    // Check if user has liked this project
    let isLiked = false
    let hasJoined = false
    if (usr && typeof usr !== 'boolean' && 'user_id' in usr) {
      const { data: like } = await db
        .from('project_likes')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', usr.user_id)
        .single()
      
      isLiked = !!like

      // Check if user has joined this project
      const { data: member } = await db
        .from('project_members')
        .select('*')
        .eq('project_id', id)
        .eq('user_id', usr.user_id)
        .single()
      
        hasJoined = !!member
    }

    return {
      id: project.id,
      title: project.title,
      description: usr ? project.description : project.description?.slice(0, Math.floor(project.description.length / 2)),
      thumbnail: project.thumbnail ? [project.thumbnail.url] : [],
      likes: project.likes || 0,
      views: project.views || 0,
      comments: project.comments || 0,
      members: members?.map(member => member.users).flat().filter(Boolean) || [],
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      created_at: project.created_at,
      updated_at: project.updated_at,
      isAuth: usr ? true : false,
      isLiked,
      hasJoined
    }
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

const page = async ({params}: {params: {id: string}}) => {
  const project = await getProject(params.id)

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
      </div>
    )
  }

  return (
    <>
      <Dynamic data={project}/>
    </>
  )
}

export default page
