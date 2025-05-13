import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: {
    absolute: "Calendar"
  }
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  maxAttendees: number
  type: 'class' | 'meeting' | 'exam' | 'event'
  description: string
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Math Class',
    date: '2024-05-15',
    time: '09:00 AM',
    location: 'Room 101',
    attendees: 25,
    maxAttendees: 30,
    type: 'class',
    description: 'Calculus II - Integration Techniques'
  },
  {
    id: '2',
    title: 'Science Fair',
    date: '2024-05-20',
    time: '10:00 AM',
    location: 'Main Hall',
    attendees: 45,
    maxAttendees: 100,
    type: 'event',
    description: 'Annual Science Fair Exhibition'
  },
  // Add more events...
]

const getEventTypeColor = (type: Event['type']) => {
  switch (type) {
    case 'class': return 'bg-blue-500'
    case 'meeting': return 'bg-purple-500'
    case 'exam': return 'bg-red-500'
    case 'event': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

export default function CalendarPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>May 2024</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Calendar Header */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-sm">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className="aspect-square p-2 border rounded-lg hover:bg-muted cursor-pointer"
                >
                  <div className="text-sm font-medium">{day}</div>
                  {/* Add event indicators here */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge variant="outline" className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{event.date}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees}/{event.maxAttendees} attendees</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      {event.description}
                    </p>
                    
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 