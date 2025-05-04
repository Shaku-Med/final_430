import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  maxAttendees: number
  description: string
  type: 'workshop' | 'seminar' | 'competition' | 'social'
  status: 'upcoming' | 'ongoing' | 'completed'
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Science Fair 2024',
    date: '2024-05-15',
    time: '10:00 AM',
    location: 'Main Auditorium',
    attendees: 45,
    maxAttendees: 100,
    description: 'Annual science fair showcasing student projects',
    type: 'competition',
    status: 'upcoming'
  },
  // Add more sample events...
]

const getEventTypeColor = (type: Event['type']) => {
  switch (type) {
    case 'workshop': return 'bg-blue-500'
    case 'seminar': return 'bg-purple-500'
    case 'competition': return 'bg-red-500'
    case 'social': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

export const EventsSection = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Subscribe
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {sampleEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={getEventTypeColor(event.type)}>
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees}/{event.maxAttendees} attendees</span>
                    </div>
                    <span className="text-muted-foreground">
                      {Math.round((event.attendees / event.maxAttendees) * 100)}% full
                    </span>
                  </div>
                  <Progress 
                    value={(event.attendees / event.maxAttendees) * 100} 
                    className="h-2"
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Register Now
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 