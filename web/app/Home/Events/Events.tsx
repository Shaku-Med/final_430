import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUpIcon } from "lucide-react"
import { useState } from "react"

interface Event {
  id: number
  title: string
  date: string
  description: string
  attendees: number
  trending: boolean
}

const trendingEvents: Event[] = [
  {
    id: 1,
    title: "AI Research Symposium",
    date: "May 15, 2025",
    description: "Join leading researchers to explore the latest advancements in artificial intelligence and machine learning.",
    attendees: 203,
    trending: true
  },
  {
    id: 2,
    title: "Hackathon 2025",
    date: "June 3-5, 2025",
    description: "A 48-hour coding challenge to build innovative solutions for real-world problems.",
    attendees: 156,
    trending: true
  },
  {
    id: 3,
    title: "Web Development Workshop",
    date: "May 20, 2025",
    description: "Learn modern web development techniques with industry experts.",
    attendees: 127,
    trending: true
  }
]

const Events = () => {
  const [events] = useState<Event[]>(trendingEvents)

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-secondary/70" id="events">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex w-full flex-col items-center text-center justify-center gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Trending
            </span>            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Trending Events</h2>
            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              The most popular CS department events happening soon
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {events.map(event => (
            <Card key={event.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{event.title}</CardTitle>
                  <Badge variant="outline" className="text-blue-500 border-blue-500">
                    <TrendingUpIcon className="h-3 w-3 mr-1" /> Trending
                  </Badge>
                </div>
                <CardDescription>{event.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p>{event.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">{event.attendees} attendees</div>
                <Button variant="secondary" size="sm">Join Event</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Events