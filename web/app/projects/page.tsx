import React from 'react'
import Projects from './Component/Projects'
import db from '@/app/Database/Supabase/Base1'

async function getProjects(page: number = 1, limit: number = 50) {
  const offset = (page - 1) * limit

  // Get projects with pagination
  const { data: projects, error, count } = await db
    .from('projects')
    .select('id, title, likes, views, start_date, comments, shares, status', { count: 'exact' })
    .or('privacy.is.null,privacy.neq.private')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching projects:', error)
    return { projects: [], totalCount: 0 }
  }

  // Get member counts for each project
  const projectsWithMembers = await Promise.all(projects.map(async (project) => {
    const { count, error: countError } = await db
      .from('project_members')
      .select('count', { count: 'exact' })
      .eq('project_id', project.id)
    
    return {
      ...project,
      memberCount: countError || count === null ? 0 : count
    }
  }))

  return {
    projects: projectsWithMembers,
    totalCount: count || 0
  }
}

const page = async ({
  searchParams,
}: {
  searchParams: { page?: string }
}) => {
  const currentPage = Number(searchParams.page) || 1
  const { projects, totalCount } = await getProjects(currentPage)

  return (
    <>
      <Projects 
        projects={projects} 
        currentPage={currentPage}
        totalCount={totalCount}
        itemsPerPage={50}
      />
    </>
  )
}

export default page
