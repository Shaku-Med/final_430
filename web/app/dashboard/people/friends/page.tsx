import React from 'react'
import FriendsPage from './Components/Friends'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

interface UserInfo {
  bio: string
}

interface UserFollower {
  follower_id: string
}

interface UserBlocked {
  blocked_id: string
  blocker_id: string
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

async function getMutualFriends(searchQuery: string = '', page: number = 1, pageSize: number = 10): Promise<{ users: TransformedUser[], total: number }> {
  const user = await IsAuth(true)
  if (!user || typeof user === 'boolean' || !('user_id' in user)) {
    return { users: [], total: 0 }
  }

  const currentUserId = user.user_id
  const offset = (page - 1) * pageSize

  // Get users that the current user follows
  const { data: followingUsers, error: followingError } = await db
    .from('users_followers')
    .select('followed_id')
    .eq('follower_id', currentUserId)

  if (followingError) {
    console.error('Error fetching following users:', followingError)
    return { users: [], total: 0 }
  }

  const followingIds = followingUsers?.map(f => f.followed_id) || []

  // Get users that follow the current user
  const { data: followers, error: followersError } = await db
    .from('users_followers')
    .select('follower_id')
    .eq('followed_id', currentUserId)

  if (followersError) {
    console.error('Error fetching followers:', followersError)
    return { users: [], total: 0 }
  }

  const followerIds = followers?.map(f => f.follower_id) || []

  // Find mutual friends (users that both follow and are followed by the current user)
  const mutualFriendIds = followingIds.filter(id => followerIds.includes(id))

  if (mutualFriendIds.length === 0) {
    return { users: [], total: 0 }
  }

  // Get blocked relations
  const { data: blockedRelations, error: blockedError } = await db
    .from('user_blocked')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`)

  if (blockedError) {
    console.error('Error fetching blocked relations:', blockedError)
  }

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
    .in('user_id', mutualFriendIds)
    .eq('isVerified', true)

  if (searchQuery) {
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    searchWords.forEach(word => {
      baseQuery = baseQuery.or(`name.ilike.%${word}%,firstname.ilike.%${word}%,lastname.ilike.%${word}%`)
    })
  }

  if (excludedUserIds.size > 0) {
    excludedUserIds.forEach(excludedId => {
      baseQuery = baseQuery.neq('user_id', excludedId)
    })
  }

  let countQuery = db
    .from('users')
    .select('*', { count: 'exact', head: true })
    .in('user_id', mutualFriendIds)
    .eq('isVerified', true)

  if (searchQuery) {
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    searchWords.forEach(word => {
      countQuery = countQuery.or(`name.ilike.%${word}%,firstname.ilike.%${word}%,lastname.ilike.%${word}%`)
    })
  }

  if (excludedUserIds.size > 0) {
    excludedUserIds.forEach(excludedId => {
      countQuery = countQuery.neq('user_id', excludedId)
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
      isFollowing: true, // These are mutual friends, so they are always following
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
  const { users, total } = await getMutualFriends(searchQuery, page)
  
  return (
    <>
      <FriendsPage users={users} total={total} currentPage={page} searchQuery={searchParams.q || ''} />
    </>
  )
}

export default page
