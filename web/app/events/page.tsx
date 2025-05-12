import React from 'react'
import EventsList from './Component/Events'
import db from '@/app/Database/Supabase/Base1'

async function getEvents(page: number = 1, limit: number = 50) {
  const offset = (page - 1) * limit

  // Get events with pagination
  const { data: events, error, count } = await db
    .from('events')
    .select('event_id, title, likes, views, date, comments, shares, status', { count: 'exact' })
    .or('privacy.is.null,privacy.neq.private')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching events:', error)
    return { events: [], totalCount: 0 }
  }

  // Get participant counts for each event
  const eventsWithParticipants = await Promise.all(events.map(async (event) => {
    const { count, error: countError } = await db
      .from('event_participants')
      .select('count', { count: 'exact' })
      .eq('event_id', event.event_id)
    
    return {
      ...event,
      participantCount: countError || count === null ? 0 : count
    }
  }))

  return {
    events: eventsWithParticipants,
    totalCount: count || 0
  }
}

const page = async ({
  searchParams,
}: {
  searchParams: { page?: string }
}) => {
  const currentPage = Number(searchParams.page) || 1
  const { events, totalCount } = await getEvents(currentPage)

  return (
    <>
      <EventsList 
        events={events} 
        currentPage={currentPage}
        totalCount={totalCount}
        itemsPerPage={50}
      />
    </>
  )
}

export default page
