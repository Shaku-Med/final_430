import React from 'react'
import Add from './Components/Add'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

interface DatabaseUser {
  user_id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  profile: string;
  user_info: { bio: string } | null;
  users_followers: { follower_id: string }[] | null;
  user_blocked: { blocked_id: string }[] | null;
}

async function getInitialUsers(page: number = 1, limit: number = 10, search: string = '') {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return { users: [], total: 0 }
    }

    let query = db
      .from('users')
      .select(`
        user_id,
        name,
        firstname,
        lastname,
        email,
        profile,
        user_info (
          bio
        ),
        users_followers!followed_id (
          follower_id
        ),
        user_blocked!blocker_id (
          blocked_id
        )
      `)
      .neq('user_id', user.user_id)
      .eq('isVerified', true)

    // Add search condition if search term exists
    if (search) {
      query = query.or(`name.ilike.%${search}%,firstname.ilike.%${search}%,lastname.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Get total count with search filter
    const { data: countData } = await db
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('isVerified', true)
    const count = countData?.length || 0

    // Apply pagination and ordering
    const { data: users, error } = await query
      .order('name')
      .range((page - 1) * limit, page * limit - 1)

    if (error || !users) {
      console.error('Error fetching users:', error)
      return { users: [], total: 0 }
    }

    return {
      users: users.map((user: any) => ({
        user_id: user.user_id,
        name: user.name,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profile: user.profile,
        bio: user.user_info?.bio || '',
        isFollowing: user.users_followers?.some((follower: { follower_id: string }) => follower.follower_id === user.user_id) || false,
        isBlocked: user.user_blocked?.some((block: { blocked_id: string }) => block.blocked_id === user.user_id) || false
      })),
      total: count || 0
    }
  } catch (error) {
    console.error('Error in getInitialUsers:', error)
    return { users: [], total: 0 }
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  const { users, total } = await getInitialUsers(page, 10, search)
  
  return (
    <>
      <Add users={users} total={total} currentPage={page} search={search} />
    </>
  )
}
