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
    const offset = (page - 1) * limit

    // Define sort order based on sortBy parameter
    const sortOptions = {
      likes: { column: 'likes', ascending: false },
      comments: { column: 'comments', ascending: false },
      shares: { column: 'shares', ascending: false },
      latest: { column: 'created_at', ascending: false }
    }
    
    const sortOption = sortOptions[sortBy as keyof typeof sortOptions] || sortOptions.latest

    // Single query to fetch events with count
    const { data: events, error, count } = await db
      .from('events')
      .select('*', { count: 'exact' })
      .or('privacy.is.null,privacy.neq.private')
      .order(sortOption.column, { ascending: sortOption.ascending })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: 'Failed to fetch events', message: error.message }, { status: 500 })
    }

    // If events exist, fetch and attach user profiles and like status
    if (events?.length > 0) {
      const userIds = events.map(event => event.user_id)
      const eventIds = events.map(event => event.event_id)

      // Fetch user profiles
      const { data: profiles, error: profileError } = await db
        .from('users')
        .select('user_id, profile, name, firstname, lastname')
        .in('user_id', userIds)

      if (profileError) {
        console.error('Error fetching profiles:', profileError)
        return NextResponse.json({ error: 'Failed to fetch profiles', message: profileError.message }, { status: 500 })
      }

      // Fetch user's likes for these events
      const { data: userLikes, error: likesError } = await db
        .from('event_likes')
        .select('event_id, user_id')
        .eq('user_id', user.user_id)
        .in('event_id', eventIds)

      if (likesError) {
        console.error('Error fetching likes:', likesError)
        return NextResponse.json({ error: 'Failed to fetch likes', message: likesError.message }, { status: 500 })
      }

      // console.log('User likes:', {
      //   userId: user.user_id,
      //   userLikes: userLikes,
      //   eventIds: eventIds
      // })

      // Create a set of liked event IDs for quick lookup
      const likedEventIds = new Set(userLikes?.map(like => like.event_id) || [])

      // Map profiles to events in a single pass
      const profileMap = Object.fromEntries(
        profiles.map(p => [p.user_id, { profile: p.profile, name: p.name, firstname: p.firstname, lastname: p.lastname }])
      )
      
      events.forEach(event => {
        event.profile = profileMap[event.user_id] || null
        // Add isOwner flag based on current user
        event.isOwner = event.user_id === user.user_id
        // Add isLiked flag based on user's likes
        event.isLiked = likedEventIds.has(event.event_id)
        
        console.log('Event like status:', {
          eventId: event.event_id,
          isLiked: event.isLiked,
          likedEventIds: Array.from(likedEventIds)
        })
      })
    }

    return NextResponse.json({
      success: true,
      events,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: count ? offset + limit < count : false
      }
    })
  } catch (error: any) {
    console.error('Error in fetch events endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}