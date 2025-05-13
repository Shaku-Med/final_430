import React from 'react'
import Profile from './Component/Profile'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { redirect } from 'next/navigation'

interface User {
  user_id: string
  name: string
  firstname: string
  lastname: string
  profile: string
  joinedAt: string
  events: {
    event_id: string
    title: string
    description: string
    date: string
    status: 'upcoming' | 'ongoing' | 'completed'
    location: string
    likes: number
    comments: number
    shares: number
    isLiked: boolean
    owner_id: string
    isOwner: boolean
  }[]
  projects: {
    id: string
    project_id: string
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
    views: number
    client: string
    budget: string
    team: string
    start_date: string
    end_date: string
    date: string
    owner_id: string
    isOwner: boolean
    isLiked?: boolean
    isAuth?: boolean
    isJoined?: boolean
    isParticipant?: boolean
    hasJoined?: boolean
    participants?: {
      user_id: string
      firstname: string
      lastname: string
      name: string
      profile: string
      role?: string
      status?: string
      last_active_at?: string
      contribution_score?: number
    }[]
  }[]
  followers: {
    user_id: string
    name: string
    firstname: string
    lastname: string
    profile: string
  }[]
  followerCount: number
  likedEvents: {
    event_id: string
    title: string
    description: string
    date: string
    status: 'upcoming' | 'ongoing' | 'completed'
    location: string
    likes: number
    comments: number
    shares: number
    owner_id: string
    isOwner: boolean
    isLiked: boolean
  }[]
  likedProjects: {
    id: string
    project_id: string
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
    views: number
    client: string
    budget: string
    team: string
    start_date: string
    end_date: string
    date: string
    owner_id: string
    isOwner: boolean
    isLiked?: boolean
    isAuth?: boolean
    isJoined?: boolean
    isParticipant?: boolean
    hasJoined?: boolean
    participants?: {
      user_id: string
      firstname: string
      lastname: string
      name: string
      profile: string
      role?: string
      status?: string
      last_active_at?: string
      contribution_score?: number
    }[]
  }[]
  isFollowing: boolean
}

interface DatabaseUser {
  user_id: string
  name: string
  firstname: string
  lastname: string
  profile: string
  joinedAt: string
}

interface DatabaseEvent {
  event_id: string
  title: string
  description: string
  date: string
  status: string
  location: string
  likes: number
  comments: number
  shares: number
  isLiked?: boolean
  user_id: string
}

interface DatabaseProject {
  id: string
  title: string
  description: string
  status: string
  client: string
  budget: string
  team: string
  start_date: string
  end_date: string
  likes: number
  comments: number
  shares: number
  thumbnail?: {
    id?: string
    name?: string
    type?: string
    url?: string
  }
  profile?: string
  views?: number
  isLiked?: boolean
  user_id: string
}

interface DatabaseFollower {
  follower_id: string
  users: {
    user_id: string
    name: string
    firstname: string
    lastname: string
    profile: string
  }
}

interface AuthUser {
  user_id: string
  email: string
  id: string
  firstname: string
  name: string
  lastname: string
  joinedAt: string
}

async function getUserData(userId: string): Promise<User | null> {
  try {
    const currentUser = await IsAuth(true)
    if (!currentUser || typeof currentUser === 'boolean' || !('user_id' in currentUser)) {
      return null
    }

    // Get user data
    const { data: user, error: userError } = await db
      .from('users')
      .select('user_id, name, firstname, lastname, profile, joinedAt')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      return null
    }

    const userData = user as DatabaseUser

    // Check if current user is following this user
    const { data: followStatus } = await db
      .from('users_followers')
      .select('*')
      .eq('follower_id', currentUser.user_id)
      .eq('followed_id', userId)
      .single()

    // Get user's events (top 5)
    const { data: events } = await db
      .from('events')
      .select('event_id, title, description, date, status, location, likes, comments, shares')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const eventsData = (events || []) as DatabaseEvent[]

    // Get user's projects (top 5)
    const { data: projects } = await db
      .from('projects')
      .select('id, title, description, status, client, budget, team, start_date, end_date, likes, comments, shares')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const projectsData = (projects || []) as DatabaseProject[]

    // Get user's followers
    const { data: followers } = await db
      .from('users_followers')
      .select(`
        follower_id,
        users:followed_id (
          user_id,
          name,
          firstname,
          lastname,
          profile
        )
      `)
      .eq('followed_id', userId)

    // Get user's liked events
    const { data: likedEvents } = await db
      .from('event_likes')
      .select(`
        event_id,
        events (
          event_id,
          title,
          description,
          date,
          status,
          location,
          likes,
          comments,
          shares
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get user's liked projects
    const { data: likedProjects } = await db
      .from('project_likes')
      .select(`
        project_id,
        projects (
          id,
          title,
          description,
          status,
          client,
          budget,
          team,
          start_date,
          end_date,
          likes,
          comments,
          shares
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Transform followers data
    const transformedFollowers = (followers || []).map((f: any) => ({
      user_id: f.users.user_id,
      name: f.users.name,
      firstname: f.users.firstname,
      lastname: f.users.lastname,
      profile: f.users.profile
    }))

    // Transform events data
    const transformedEvents = eventsData.map(event => ({
      event_id: event.event_id,
      title: event.title,
      description: event.description,
      date: event.date,
      status: event.status as 'upcoming' | 'ongoing' | 'completed',
      location: event.location,
      likes: event.likes,
      comments: event.comments,
      shares: event.shares,
      isLiked: event.isLiked ?? false,
      owner_id: userId,
      isOwner: true
    }))

    // Transform liked events data
    const transformedLikedEvents = (likedEvents || []).map((le: any) => ({
      event_id: le.events.event_id,
      title: le.events.title,
      description: le.events.description,
      date: le.events.date,
      status: le.events.status,
      location: le.events.location,
      likes: le.events.likes,
      comments: le.events.comments,
      shares: le.events.shares,
      owner_id: le.events.user_id,
      isOwner: le.events.user_id === userId,
      isLiked: true
    }))

    // Transform projects data
    const transformedProjects = projectsData.map(project => ({
      id: project.id,
      project_id: project.id,
      title: project.title,
      description: project.description,
      status: project.status as 'planning' | 'in-progress' | 'completed' | 'on-hold',
      thumbnail: project.thumbnail,
      profile: project.profile,
      likes: project.likes,
      comments: project.comments,
      shares: project.shares,
      views: project.views ?? 0,
      client: project.client,
      budget: project.budget,
      team: project.team,
      start_date: project.start_date,
      end_date: project.end_date,
      date: project.start_date,
      owner_id: userId,
      isOwner: true,
      isLiked: project.isLiked ?? false,
      isAuth: true,
      isJoined: false,
      isParticipant: false,
      hasJoined: false,
      participants: []
    }))

    // Transform liked projects data
    const transformedLikedProjects = (likedProjects || []).map((lp: any) => ({
      id: lp.projects.id,
      project_id: lp.projects.id,
      title: lp.projects.title,
      description: lp.projects.description,
      status: lp.projects.status,
      thumbnail: lp.projects.thumbnail,
      profile: lp.projects.profile,
      likes: lp.projects.likes,
      comments: lp.projects.comments,
      shares: lp.projects.shares,
      views: lp.projects.views ?? 0,
      client: lp.projects.client,
      budget: lp.projects.budget,
      team: lp.projects.team,
      start_date: lp.projects.start_date,
      end_date: lp.projects.end_date,
      date: lp.projects.start_date,
      owner_id: lp.projects.user_id,
      isOwner: lp.projects.user_id === userId,
      isLiked: true,
      isAuth: lp.projects.user_id === userId,
      isJoined: false,
      isParticipant: false,
      hasJoined: false,
      participants: []
    }))

    const userProfile: User = {
      user_id: userData.user_id,
      name: userData.name,
      firstname: userData.firstname,
      lastname: userData.lastname,
      profile: userData.profile,
      joinedAt: userData.joinedAt,
      events: transformedEvents,
      projects: transformedProjects,
      followers: transformedFollowers,
      followerCount: transformedFollowers.length,
      likedEvents: transformedLikedEvents,
      likedProjects: transformedLikedProjects,
      isFollowing: !!followStatus
    }

    return userProfile
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

const page = async ({ params }: { params: { id: string } }) => {
  const user = await IsAuth(true) as AuthUser | boolean
  if (!user || typeof user === 'boolean' || !('user_id' in user)) {
    return redirect('/dashboard')
  }

  const userData = await getUserData(params.id)
  console.log(userData)
  if (!userData) {
    return ''
    // return redirect('/dashboard')
  }

  return (
    <>
      <Profile data={userData} currentUserId={user.user_id} />
    </>
  )
}

export default page
