import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUpIcon, Heart, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"
import { useLayoutEffect, useState } from "react"

interface Event {
  event_id: string
  title: string
  date: string
  participants: number
  trending: boolean,
  likes: number,
  comments: number,
  views: number,
  shares: number,
  status: string
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([])

  useLayoutEffect(() => {
    let trending_events = (window as any)._trending_events;
    if(trending_events){
      setEvents(trending_events)
    }
  }, [])

  return (
    events.length > 0 && (
      <section className="w-full py-16 md:py-24 lg:py-32 bg-secondary/70" id="events">
        <div className="container mx-auto px-4 md:px-6">
            <div className="flex w-full flex-col items-center text-center justify-center gap-4 md:flex-row md:items-center">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Trending
                </span>            
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Trending Events</h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The most popular events happening soon
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {events.map((event, key) => (
                <Link href={`/events/${event.event_id}`}>
                    <Card key={key} className="flex flex-col h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{event.title}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-blue-500 border-blue-500">
                              <TrendingUpIcon className="h-3 w-3 mr-1" /> Trending
                            </Badge>
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{new Date(event.date).toDateString()}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{event.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{event.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{event.views}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-between">
                        {
                          event.participants > 0 && (
                            <div className="text-sm text-gray-500">{event.participants} attendees</div>
                          )
                        }
                        <Button variant="secondary" size="sm">Join Event</Button>
                      </CardFooter>
                    </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

      )
  )
}

export default Events