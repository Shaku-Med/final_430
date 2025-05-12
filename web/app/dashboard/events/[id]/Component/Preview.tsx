'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Heart, MessageCircle, Share2, ArrowLeft, Users, MapPin, Clock, Eye, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { SocialInteractions } from '../../components/SocialInteractions'
import ThreadComments from '@/components/ThreadComments'
import dynamic from 'next/dynamic'

const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  event_id: string;
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
  views: number;
  isLiked?: boolean;
  isAuth?: boolean;
  suggestedEvents?: Event[];
  isJoined?: boolean;
  isParticipant?: boolean;
  hasJoined?: boolean;
  participants?: {
    user_id: string;
    firstname: string;
    lastname: string;
    name: string;
    profile: string;
  }[];
  location?: string;
  mapUrl?: string;
  start_time?: string;
  end_time?: string;
  isOwner?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function EventPage({data}: {data: Event}) {
  const params = useParams()
  const [isLiked, setIsLiked] = useState(data.isLiked || false)
  const [likesCount, setLikesCount] = useState(data.likes || 0)
  const [isJoined, setIsJoined] = useState(data.hasJoined || data.isParticipant || false)
  const [participantsCount, setParticipantsCount] = useState(data.participants?.length || 0)
  const [views, setViews] = useState(data.views || 0)
  const [mapUrl, setMapUrl] = useState(data.mapUrl || (data.location ? `https://www.google.com/maps?q=${encodeURIComponent(data.location)}&output=embed` : ''))

  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}/views`, {
          method: 'POST',
        })
        const result = await response.json()
        if (result.success) {
          setViews(result.views)
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }
    trackView()
  }, [params.id])

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isLiked ? 'unlike' : 'like'
        }),
      })

      if (!response.ok) throw new Error('Failed to update like')

      const result = await response.json()
      if (result.success) {
        setIsLiked(result.isLiked)
        setLikesCount(result.likes)
        toast.success(result.message)
      } else {
        throw new Error(result.message || 'Failed to update like')
      }
    } catch (error) {
      console.error('Error updating like:', error)
      toast.error('Failed to update like')
    }
  }

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isJoined ? 'unjoin' : 'join'
        }),
      })

      if (!response.ok) throw new Error('Failed to update join status')

      const result = await response.json()
      if (result.success) {
        setIsJoined(!isJoined)
        if (data.participants) {
          if (isJoined) {
            const updatedParticipants = data.participants.filter(
              p => p.user_id !== result.user_id
            )
            data.participants = updatedParticipants
          } else {
            if (result.user) {
              data.participants = [...data.participants, result.user]
            }
          }
        }
        toast.success(result.message)
      } else {
        throw new Error(result.message || 'Failed to update join status')
      }
    } catch (error) {
      console.error('Error updating join status:', error)
      toast.error('Failed to update join status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'ongoing':
        return 'bg-green-500 hover:bg-green-600'
      case 'completed':
        return 'bg-gray-500 hover:bg-gray-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Link href="/dashboard/events">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="w-full mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4 sm:space-y-6 lg:space-y-8"
        >
          <header className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/events">
                <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              {data.isOwner && (
                <Link href={`/dashboard/events/${params.id}/edit`}>
                  <Button variant="outline" size="icon" className="rounded-full cursor-pointer">
                    <Pencil className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words">
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2  ">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{views} views</span>
                </div>
                <Badge className={`${getStatusColor(data.status)} text-white border-0`}>
                  {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                </Badge>
              </div>
            </div>
          </header>

          {data.thumbnail?.url && (
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={JSON.parse(data.thumbnail.url)[0]}
                alt={data.title}
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-lg / dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4  ">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {new Date(data.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {data.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          Created: {new Date(data.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {data.updated_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          Updated: {new Date(data.updated_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-gray-700 dark:prose-p:text-gray-300">
                    <Markdown source={data.description} />
                  </div>
                </CardContent>
              </Card>

              {data.start_time && data.end_time && (
                <Card className="border-0 shadow-lg / dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Event Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Start Time</div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-lg">
                            {new Date(`2000-01-01T${data.start_time}`).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">End Time</div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-lg">
                            {new Date(`2000-01-01T${data.end_time}`).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.location && (
                <Card className="border-0 shadow-lg / dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MapPin className="h-5 w-5 text-red-500" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="  font-medium">{data.location}</p>
                    {mapUrl && (
                      <div className="h-[400px] rounded-xl overflow-hidden shadow-inner">
                        <iframe
                          title="Event Location Map"
                          src={mapUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-lg / dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  {data.isOwner ? (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        You are the event owner
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant={isJoined ? "outline" : "default"}
                      className="w-full gap-2 py-4 sm:py-6 text-base sm:text-lg font-semibold"
                      onClick={handleJoin}
                    >
                      <Users className="h-5 w-5" />
                      {isJoined ? 'Unjoin Event' : 'Join Event'}
                    </Button>
                  )}
                  
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-sm  ">
                      <span className="break-words">{data.participants?.length || 0} {data.participants?.length === 1 ? 'Participant' : 'Participants'}</span>
                      <Badge variant="secondary" className="px-2 sm:px-3 py-1 whitespace-nowrap">
                        {data.status === 'ongoing' ? 'Happening Now' : data.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t overflow-hidden">
                    <SocialInteractions
                      likes={likesCount}
                      comments={data.comments}
                      shares={data.shares}
                      views={views}
                      onLike={handleLike}
                      onComment={() => {}}
                      onShare={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Link copied to clipboard')
                      }}
                      isLiked={isLiked}
                    />
                  </div>
                </CardContent>
              </Card>

              {data.participants && data.participants.length > 0 && (
                <Card className="border-0 shadow-lg / dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="h-5 w-5 text-blue-500" />
                      Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {data.participants.slice(0, 5).map((participant) => (
                        <div key={participant.user_id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-sm flex-shrink-0">
                            {participant.profile ? (
                              <img
                                src={participant.profile}
                                alt={`${participant.firstname} ${participant.lastname}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                                <span className="text-sm font-semibold">
                                  {participant.firstname[0]}{participant.lastname[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium  truncate">
                              {participant.name || `${participant.firstname} ${participant.lastname}`}
                            </p>
                          </div>
                        </div>
                      ))}
                      {data.participants.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                            +{data.participants.length - 5} more participants
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto">
            {data.isAuth ? (
              <div className="/ dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <ThreadComments endpoint={`/api/events/${params.id}/comments`} />
              </div>
            ) : (
              <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-800">
                <p className="text-lg font-medium  mb-4">
                  Join the conversation
                </p>
                <p className="  mb-6">
                  Please log in to share your thoughts
                </p>
                <Link href="/account">
                  <Button className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {data.suggestedEvents && data.suggestedEvents.length > 0 && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold ">You might also like</h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {data.suggestedEvents.map((suggestedEvent) => (
                  <Link key={suggestedEvent.id} href={`/dashboard/events/${suggestedEvent.event_id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden p-0 border-0 shadow-lg hover:shadow-xl transition-all duration-300 /backdrop-blur-sm">
                        {suggestedEvent.thumbnail?.url && (
                          <div className="relative h-48 w-full">
                            <img
                              src={JSON.parse(suggestedEvent.thumbnail.url)[0]}
                              alt={suggestedEvent.title}
                              className="w-full h-full object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                        )}
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="font-bold mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base ">
                            {suggestedEvent.title}
                          </h3>
                          <p className="text-xs sm:text-sm   mb-2 sm:mb-3 line-clamp-2">
                            {suggestedEvent.description}
                          </p>
                          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm  ">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(suggestedEvent.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}