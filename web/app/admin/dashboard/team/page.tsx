import React from 'react'
import Team from './Component/Team'
import db from '@/app/Database/Supabase/Base1'

const ITEMS_PER_PAGE = 6

async function getTeamMembers(page: number = 1) {
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data: teamMembers, error, count } = await db
    .from('team_members')
    .select(`
      id,
      name,
      role,
      description,
      expertise,
      user_id,
      socialLinks,
      created_at,
      updated_at,
      users:user_id (
        firstname,
        lastname,
        name,
        profile
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching team members:', error)
    return { data: [], total: 0 }
  }

  return { 
    data: teamMembers,
    total: count || 0
  }
}

const page = async ({
  searchParams,
}: {
  searchParams: { page?: string }
}) => {
  const currentPage = Number(searchParams.page) || 1
  const { data: teamMembers, total } = await getTeamMembers(currentPage)
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  
  return (
    <div className="min-h-screen ">
      <Team 
        data={teamMembers}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  )
}

export default page
