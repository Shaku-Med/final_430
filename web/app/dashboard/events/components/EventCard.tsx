import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MoreVertical, Flag, Share2, Bookmark, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import { SocialInteractions } from './SocialInteractions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { EventActions } from './EventActions'
import Link from 'next/link'

const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface Event {
  event_id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  thumbnail?: {
    id?: string;
    name?: string;
    type?: string;
    url?: string;
  };
  profile?: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  owner_id: string;
  isOwner: boolean;
  isLiked?: boolean;
}

interface EventCardProps {
  event: Event;
  hideActions?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'bg-indigo-500 hover:bg-indigo-600'
    case 'ongoing':
      return 'bg-emerald-500 hover:bg-emerald-600'
    case 'completed':
      return 'bg-stone-500 hover:bg-stone-600'
    default:
      return 'bg-stone-500 hover:bg-stone-600'
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function EventCard({ event, hideActions = false }: EventCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [likes, setLikes] = useState(event.likes)
  const [isLiked, setIsLiked] = useState(event.isLiked || false)
  const isLongDescription = event.description.length > 200
  const displayDescription = showFullDescription 
    ? event.description 
    : event.description.slice(0, 200) + (isLongDescription ? '...' : '')

  let thumbnail = event?.thumbnail?.url ? JSON.parse(event.thumbnail.url)[0] : '/placeholder.png'

  const handleLike = async () => {
    if (hideActions) return
    try {
      const response = await fetch('/api/events/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.event_id,
          action: isLiked ? 'unlike' : 'like'
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update like');
      }

      const result = await response.json();
      if (result.success) {
        setIsLiked(result.isLiked);
        setLikes(result.likes);
        toast.success(result.message);
      } else {
        throw new Error(result.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update like');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleReport = () => {
    toast.info('Report submitted. Thank you for your feedback!')
  }

  const handleBookmark = () => {
    toast.success('Event bookmarked!')
  }

  return (
    <motion.div className={` w-full flex items-center justify-center`} variants={item} transition={{ duration: 0.3 }}>
      <Link href={`/dashboard/events/${event.event_id}`} className="w-full">
        <Card className="overflow-hidden bg-card/80 backdrop-blur-md flex justify-between flex-col max-w-[800px] w-full aspect-square p-0 group border transition-all hover:shadow-lg h-full flex flex-col">
          <CardHeader className="h-[60px] py-2 mb-0 bg-secondary/40 border-b shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    {new Date(event.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </div>
              </div>
              {!hideActions && (
                <EventActions 
                  eventTitle={event.title} 
                  event_id={event.event_id} 
                  isOwner={event?.isOwner}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3 mt-[-23px] overflow-auto h-full">
            <div className="text-sm overflow-auto mb-4 prose prose-sm max-w-none dark:prose-invert">
              <Markdown source={displayDescription} />
              {isLongDescription && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowFullDescription(!showFullDescription)
                  }}
                >
                  {showFullDescription ? 'Show less' : 'See more'}
                </Button>
              )}
            </div>
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img
                src={thumbnail}
                alt={event.title}
                className="object-cover object-top w-full h-full"
              />
              <Badge 
                className={`absolute top-3 right-3 ${getStatusColor(event.status)} transition-all`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
          {!hideActions && (
            <div className="px-6 pb-4 mt-[-23px] bg-secondary/40">
              <SocialInteractions
                likes={likes}
                comments={event.comments}
                shares={event.shares}
                views={event.views || 0}
                onLike={handleLike}
                isLiked={isLiked}
              />
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  )
} 