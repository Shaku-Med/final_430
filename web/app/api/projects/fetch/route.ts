import { NextResponse } from 'next/server'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'

export async function GET(request: Request) {
  try {
    const user = await IsAuth(true)
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'latest'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status')

    const offset = (page - 1) * limit

    // Define sort order based on sortBy parameter
    const sortOptions = {
      likes: { column: 'likes', ascending: sortOrder === 'asc' },
      comments: { column: 'comments', ascending: sortOrder === 'asc' },
      shares: { column: 'shares', ascending: sortOrder === 'asc' },
      latest: { column: 'created_at', ascending: sortOrder === 'asc' }
    }
    
    const sortOption = sortOptions[sortBy as keyof typeof sortOptions] || sortOptions.latest

    let query = db
      .from('projects')
      .select('*', { count: 'exact' })
      .or('privacy.is.null,privacy.neq.private')

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: projects, error, count } = await query
      .order(sortOption.column, { ascending: sortOption.ascending })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects', message: error.message }, { status: 500 })
    }

    // If projects exist, fetch and attach user profiles, like status, and members
    if (projects?.length > 0) {
      const userIds = projects.map(project => project.user_id)
      const projectIds = projects.map(project => project.id)

      // Fetch user profiles
      const { data: profiles, error: profileError } = await db
        .from('users')
        .select('user_id, profile, name, firstname, lastname')
        .in('user_id', userIds)

      if (profileError) {
        console.error('Error fetching profiles:', profileError)
        return NextResponse.json({ error: 'Failed to fetch profiles', message: profileError.message }, { status: 500 })
      }

      // Fetch user's likes for these projects
      const { data: userLikes, error: likesError } = await db
        .from('project_likes')
        .select('project_id, user_id')
        .eq('user_id', user.user_id)
        .in('project_id', projectIds)

      if (likesError) {
        console.error('Error fetching likes:', likesError)
        return NextResponse.json({ error: 'Failed to fetch likes', message: likesError.message }, { status: 500 })
      }

      // Fetch project members
      const { data: projectMembers, error: membersError } = await db
        .from('project_members')
        .select('*')
        .in('project_id', projectIds)
      

      if (membersError) {
        console.log(membersError)
        console.error('Error fetching project members:', membersError)
        return NextResponse.json({ error: 'Failed to fetch project members', message: membersError.message }, { status: 500 })
      }

      // Get all user IDs from project members
      const memberUserIds = projectMembers?.map(member => member.user_id) || []

      // Fetch user details for all project members
      const { data: memberUsers, error: memberUsersError } = await db
        .from('users')
        .select('user_id, firstname, lastname, name, profile')
        .in('user_id', memberUserIds)

      if (memberUsersError) {
        console.error('Error fetching member users:', memberUsersError)
        return NextResponse.json({ error: 'Failed to fetch member users', message: memberUsersError.message }, { status: 500 })
      }

      // Create a map of user details for quick lookup
      const memberUsersMap = Object.fromEntries(
        memberUsers?.map(user => [user.user_id, {
          firstname: user.firstname,
          lastname: user.lastname,
          name: user.name,
          profile: user.profile
        }]) || []
      )

      // Create a set of liked project IDs for quick lookup
      const likedProjectIds = new Set(userLikes?.map(like => like.project_id) || [])

      // Create a map of project members with user details
      interface ProjectMember {
        project_id: string;
        user_id: string;
        role: string;
        status: string;
        joined_at: string;
        last_active_at: string;
        contribution_score: number;
      }

      interface ProjectMemberWithUser extends ProjectMember {
        user: {
          firstname: string;
          lastname: string;
          name: string;
          profile: string;
        } | null;
      }

      const projectMembersMap = projectMembers?.reduce<Record<string, ProjectMemberWithUser[]>>((acc, member: ProjectMember) => {
        if (!acc[member.project_id]) {
          acc[member.project_id] = []
        }
        acc[member.project_id].push({
          ...member,
          user: memberUsersMap[member.user_id] || null
        })
        return acc
      }, {}) || {}

      // Map profiles to projects in a single pass
      const profileMap = Object.fromEntries(
        profiles.map(p => [p.user_id, { profile: p.profile, name: p.name, firstname: p.firstname, lastname: p.lastname }])
      )
      
      projects.forEach(project => {
        project.profile = profileMap[project.user_id] || null
        // Add isOwner flag based on current user
        project.isOwner = project.user_id === user.user_id
        // Add isLiked flag based on user's likes
        project.isLiked = likedProjectIds.has(project.id)
        // Add members and hasJoined
        project.members = projectMembersMap[project.id] || []
        project.hasJoined = project.members.some((member: ProjectMemberWithUser) => member.user_id === user.user_id)
      })
    }

    return NextResponse.json({
      success: true,
      projects,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: count ? offset + limit < count : false
      }
    })
  } catch (error: any) {
    console.error('Error in fetch projects endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
} 