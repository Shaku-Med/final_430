'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  thumbnail: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        toast.error('Failed to load events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500'
      case 'ongoing':
        return 'bg-green-500'
      case 'completed':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto py-8 md:px-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Event
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-gray-500 mt-2">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
                <Badge 
                  className={`absolute top-2 right-2 ${getStatusColor(event.status)}`}
                >
                  {event.status}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {new Date(event.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {event.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 