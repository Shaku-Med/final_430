import React from 'react'
import PeoplePage from './Component/People'
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
  isFriend: boolean
}

interface SearchFilters {
  name?: string
  bio?: string
  isFollowing?: boolean
  sortBy?: 'name' | 'joinedAt'
  sortOrder?: 'asc' | 'desc'
}

async function getUsers(searchQuery: string = '', page: number = 1, pageSize: number = 10): Promise<{ users: TransformedUser[], total: number }> {
  const user = await IsAuth(true)
  if (!user || typeof user === 'boolean' || !('user_id' in user)) {
    return { users: [], total: 0 }
  }

  const currentUserId = user.user_id
  const offset = (page - 1) * pageSize

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
    .neq('user_id', currentUserId)
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
    .neq('user_id', currentUserId)
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
      isFollowing: user.users_followers?.some(follower => follower.follower_id === currentUserId) || false,
      isBlocked: false,
      followerCount: user.users_followers?.length || 0,
      isFriend: user.users_followers?.some(follower => follower.follower_id === currentUserId) || false
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
  const { users, total } = await getUsers(searchQuery, page)
  
  return (
    <>
      <PeoplePage users={users} total={total} currentPage={page} searchQuery={searchParams.q || ''} />
    </>
  )
}

export default page