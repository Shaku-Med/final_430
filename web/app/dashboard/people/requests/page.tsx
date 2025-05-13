import React from 'react'
import RequestsPage from './Components/Requests'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

interface UserInfo {
  bio: string
}

interface UserFollower {
  follower_id: string
}

interface DatabaseUser {
  user_id: string
  name: string
  firstname: string
  lastname: string
  profile: string
  isVerified: boolean
  user_info: { bio: string } | null
  users_followers: { follower_id: string }[] | null
}

interface TransformedUser {
  user_id: string
  name: string
  firstname: string
  lastname: string
  profile: string
  bio: string
  isFollowing: boolean
  isBlocked: boolean
  followerCount: number
}

async function getFollowRequests(searchQuery: string = '', page: number = 1, pageSize: number = 10): Promise<{ users: TransformedUser[], total: number }> {
  const user = await IsAuth(true)
  if (!user || typeof user === 'boolean' || !('user_id' in user)) {
    console.log('No authenticated user found')
    return { users: [], total: 0 }
  }

  const currentUserId = user.user_id
  console.log('Current user ID:', currentUserId)
  const offset = (page - 1) * pageSize

  const { data: followers, error: followersError } = await db
    .from('users_followers')
    .select('follower_id')
    .eq('followed_id', currentUserId)

  if (followersError) {
    console.error('Error fetching followers:', followersError)
    return { users: [], total: 0 }
  }

  console.log('Raw followers data:', followers)
  const followerIds = followers?.map(f => f.follower_id) || []
  console.log('Follower IDs:', followerIds)

  const { data: followingUsers, error: followingError } = await db
    .from('users_followers')
    .select('followed_id')
    .eq('follower_id', currentUserId)

  if (followingError) {
    console.error('Error fetching following users:', followingError)
    return { users: [], total: 0 }
  }

  console.log('Raw following data:', followingUsers)
  const followingIds = followingUsers?.map(f => f.followed_id) || []
  console.log('Following IDs:', followingIds)

  const followRequestIds = followerIds.filter(id => !followingIds.includes(id))
  console.log('Follow request IDs before blocking filter:', followRequestIds)

  if (followRequestIds.length === 0) {
    console.log('No follow requests found before blocking filter')
    return { users: [], total: 0 }
  }

  const { data: blockedRelations, error: blockedError } = await db
    .from('user_blocked')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`)

  if (blockedError) {
    console.error('Error fetching blocked relations:', blockedError)
  }

  console.log('Blocked relations:', blockedRelations)
  const excludedUserIds = new Set<string>()
  
  if (blockedRelations && blockedRelations.length > 0) {
    blockedRelations.forEach(relation => {
      if (relation.blocker_id === currentUserId) {
        excludedUserIds.add(relation.blocked_id)
      }
      if (relation.blocked_id === currentUserId) {
        excludedUserIds.add(relation.blocker_id)
      }
    })
  }

  console.log('Excluded user IDs:', Array.from(excludedUserIds))
  let filteredFollowRequestIds = followRequestIds
  if (excludedUserIds.size > 0) {
    filteredFollowRequestIds = followRequestIds.filter(id => !excludedUserIds.has(id))
  }

  console.log('Final follow request IDs after all filters:', filteredFollowRequestIds)

  if (filteredFollowRequestIds.length === 0) {
    console.log('No follow requests found after filtering blocked users')
    return { users: [], total: 0 }
  }

  let baseQuery = db
    .from('users')
    .select(`
      user_id,
      name,
      firstname,
      lastname,
      profile,
      isVerified,
      user_info (
        bio
      ),
      users_followers!users_followers_followed_id_fkey (
        follower_id
      )
    `)
    .in('user_id', filteredFollowRequestIds)

  if (searchQuery) {
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    searchWords.forEach(word => {
      baseQuery = baseQuery.or(`name.ilike.%${word}%,firstname.ilike.%${word}%,lastname.ilike.%${word}%`)
    })
  }

  let countQuery = db
    .from('users')
    .select('*', { count: 'exact', head: true })
    .in('user_id', filteredFollowRequestIds)

  if (searchQuery) {
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    searchWords.forEach(word => {
      countQuery = countQuery.or(`name.ilike.%${word}%,firstname.ilike.%${word}%,lastname.ilike.%${word}%`)
    })
  }

  const [{ count }, { data: users, error }] = await Promise.all([
    countQuery,
    baseQuery
      .order('joinedAt', { ascending: false })
      .range(offset, offset + pageSize - 1)
  ])

  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], total: 0 }
  }

  if (!users) {
    return { users: [], total: 0 }
  }

  const transformedUsers = (users as unknown as DatabaseUser[])
    .map(user => ({
      user_id: user.user_id,
      name: user.name,
      firstname: user.firstname,
      lastname: user.lastname,
      profile: user.profile,
      bio: user.user_info?.bio || '',
      isFollowing: false,
      isBlocked: false,
      followerCount: user.users_followers?.length || 0
    }))

  return {
    users: transformedUsers,
    total: count || 0
  }
}

const page = async ({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) => {
  const searchQuery = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  const { users, total } = await getFollowRequests(searchQuery, page)
  
  return (
    <>
      <RequestsPage users={users} total={total} currentPage={page} searchQuery={searchParams.q || ''} />
    </>
  )
}

export default page