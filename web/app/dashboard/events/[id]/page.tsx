import React from 'react'
import EventPage from './Component/Preview'
import IsAuth from '@/app/Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import { redirect } from 'next/navigation'

interface Event {
  event_id: string
  title: string
  description: string
  date: string
  status: 'upcoming' | 'ongoing' | 'completed'
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
  user_id: string
}

interface SuggestedEvent extends Event {
  users: {
    firstname: string
    lastname: string
    name: string
    profile: string
  } | null
}

interface Participant {
  user_id: string
  firstname: string
  lastname: string
  name: string
  profile: string
}

const page = async ({ params }: { params: { id: string } }) => {
  try {
    const id = params.id
    const user = await IsAuth(true)
    
    // Fetch the event
    const { data: event, error } = await db
      .from('events')
      .select('*')
      .eq('event_id', id)
      .single()

    if (error || !event) {
      return redirect('/dashboard/events')
    }

    // Check if user is authenticated and get their like status
    let isOwner = false
    let isLiked = false
    let isParticipant = false
    
    if (user && typeof user !== 'boolean' && 'user_id' in user) {
      isOwner = event.user_id === user.user_id
      
      // Check if user has liked this event
      const { data: like } = await db
        .from('event_likes')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.user_id)
        .single()
      
      isLiked = !!like

      // Check if user is a participant
      const { data: participant } = await db
        .from('event_participants')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.user_id)
        .single()
      
      isParticipant = !!participant
    }

    // Get suggested events (excluding current event)
    const { data: suggestedEvents } = await db
      .from('events')
      .select('event_id, title, description, date, status, thumbnail, likes, comments, shares, user_id')
      .neq('event_id', id)
      .order('date', { ascending: false })
      .limit(3)

    // Fetch authors for suggested events
    let suggestedEventsWithAuthors: SuggestedEvent[] = []
    if (suggestedEvents && suggestedEvents.length > 0) {
      const userIds = [...new Set(suggestedEvents.map(event => event.user_id))]
      const { data: authors } = await db
        .from('users')
        .select('id, firstname, lastname, name, profile, user_id')
        .in('user_id', userIds)

      if (authors) {
        const authorMap: Record<string, any> = authors.reduce((acc, author) => {
          acc[author.user_id] = author
          return acc
        }, {} as Record<string, any>)

        suggestedEventsWithAuthors = suggestedEvents.map(event => ({
          ...event,
          users: authorMap[event.user_id] || null
        }))
      }
    }

    // Fetch participants with their profile information
    const { data: participants } = await db
      .from('event_participants')
      .select('user_id')
      .eq('event_id', id)

    let participantsWithProfiles: Participant[] = []
    if (participants && participants.length > 0) {
      const participantIds = participants.map(p => p.user_id)
      const { data: participantProfiles } = await db
        .from('users')
        .select('user_id, firstname, lastname, name, profile')
        .in('user_id', participantIds)

      if (participantProfiles) {
        participantsWithProfiles = participantProfiles
      }
    }

    return (
      <>
        <EventPage 
          data={{
            ...event,
            isOwner,
            isLiked,
            isParticipant,
            hasJoined: isParticipant,
            suggestedEvents: suggestedEventsWithAuthors,
            participants: participantsWithProfiles,
            isAuth: user && typeof user !== 'boolean' && 'user_id' in user
          }}
        />
      </>
    )
  } catch (error) {
    console.error('Error fetching event:', error)
    return redirect('/dashboard/events')
  }
}

export default page
