import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, Bell, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface Event {
  entity_id: string
  title: string
  description: string
  total_engagement: number
}

interface EventsSectionProps {
  recommendations: Event[]
}

export const EventsSection = ({ recommendations }: EventsSectionProps) => {
  return (
    <Card className='flex_grid'>
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
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
            <p className="text-lg font-medium mb-2">No events found</p>
            <p className="text-muted-foreground mb-4">Create an event to bring people together!</p>
            <Link href="/dashboard/events/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            </Link>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {recommendations.map((event) => (
                <div key={event.entity_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-500">
                      Event
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.total_engagement} participants</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
} 