'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Eye, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Footer from '@/app/Home/Footer/Footer'
import Nav from '@/app/Home/Nav/Nav'

interface Event {
  event_id: string
  title: string
  date: string
  likes: number
  views: number
  comments: number
  shares: number
  status: string
  participantCount: number
}

interface EventsProps {
  events: Event[]
  currentPage: number
  totalCount: number
  itemsPerPage: number
}

const Events: React.FC<EventsProps> = ({ events, currentPage, totalCount, itemsPerPage }) => {
  const router = useRouter()
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (page: number) => {
    router.push(`/events?page=${page}`)
  }

  return (
    <>
         <Nav/>
        <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
            <Link href={`/events/${event.event_id}`} key={event.event_id}>
                <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                    <CardTitle>{event.title}</CardTitle>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                        {event.status}
                    </Badge>
                    </div>
                    <CardDescription>{new Date(event.date).toDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
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
                    <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>{event.shares}</span>
                    </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                    {event.participantCount} participants
                    </div>
                </CardContent>
                </Card>
            </Link>
            ))}
        </div>
        
        {/* Pagination Controls */}
        <div className="mt-8 flex items-center justify-center gap-2">
            <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            >
            <ChevronLeft className="h-4 w-4" />
            Previous
            </Button>
            
            <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                >
                {page}
                </Button>
            ))}
            </div>

            <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            >
            Next
            <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
        </div>
        <Footer/>
    </>
  )
}

export default Events 