import React from 'react'
import EventPage from './components/EventPage'
import db from '@/app/Database/Supabase/Base1'
import { Metadata } from 'next'

// Define the event type for better type safety
type Event = {
  event_id: string
  title: string
  date: string
  status: string
  likes: number
  comments: number
  shares: number
  created_at: string
}

async function getEvents(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit

  const { data: events, error, count } = await db
    .from('events')
    .select('event_id, title, date, status, likes, comments, shares, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching events:', error)
    return { events: [], totalCount: 0 }
  }

  return {
    events: events as Event[] || [],
    totalCount: count || 0
  }
}

export const metadata: Metadata = {
  title: 'Event Dashboard',
  description: 'View and manage all events',
}

type PageProps = {
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1
  const { events, totalCount } = await getEvents(currentPage)

  return (
    <EventPage 
      data={events}
      currentPage={currentPage}
      totalCount={totalCount}
      itemsPerPage={10}
    />
  )
}