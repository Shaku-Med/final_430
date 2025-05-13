'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Heart, MessageCircle, Share2, ArrowLeft, Users, Calendar, Clock, Eye, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { SocialInteractions } from '../../components/SocialInteractions'
import ThreadComments from '@/components/ThreadComments'
import dynamic from 'next/dynamic'

const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface Project {
  id: string
  title: string
  description: string
  date: string
  start_date?: string
  end_date?: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  thumbnail?: {
    id?: string
    name?: string
    type?: string
    url?: string
  }
  profile?: string
  likes: number
  comments: number
  shares: number
  views: number
  isLiked?: boolean
  isAuth?: boolean
  isJoined?: boolean
  isParticipant?: boolean
  hasJoined?: boolean
  participants?: {
    user_id: string
    firstname: string
    lastname: string
    name: string
    profile: string
    role?: string
    status?: string
    last_active_at?: string
    contribution_score?: number
  }[]
  isOwner?: boolean
  created_at?: string
  updated_at?: string
}

export default function ProjectPage({ data }: { data: Project }) {
  const params = useParams()
  const [isJoined, setIsJoined] = useState(data.hasJoined || false)
  const [isLiked, setIsLiked] = useState(data.isLiked || false)
  const [likesCount, setLikesCount] = useState(data.likes || 0)

  useEffect(() => {
    setIsJoined(data.hasJoined || false)
  }, [data.hasJoined])

  useEffect(() => {
    const updateViews = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}/views`, {
          method: 'POST',
        })
        if (!response.ok) {
          console.error('Failed to update views')
        }
      } catch (error) {
        console.error('Error updating views:', error)
      }
    }
    updateViews()
  }, [params.id])

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/join`, {
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
        window.location.reload()
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
      case 'planning':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'in-progress':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'completed':
        return 'bg-green-500 hover:bg-green-600'
      case 'on-hold':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4 sm:space-y-6 lg:space-y-8"
        >
          <div className="flex items-center justify-between">
            <Link href="/dashboard/projects">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            {data.isOwner && (
              <Link href={`/dashboard/projects/${data.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-lg ">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4">
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
                    <Badge className={getStatusColor(data.status)}>
                      {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">{data.title}</h1>
                  <div className="prose dark:prose-invert max-w-none">
                    <Markdown source={data.description} />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <SocialInteractions
                      likes={data.likes}
                      comments={data.comments}
                      shares={data.shares}
                      views={data.views}
                      isLiked={data.isLiked}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-[transparent] rounded-none shadow-none ">
                <CardContent>
                  <ThreadComments
                    endpoint={`/api/projects/${data.id}/comments`}
                    loadMoreType="scroll"
                    allowDelete={true}
                    allowEdit={true}
                    allowReplies={true}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-lg ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.participants && data.participants.length > 0 ? (
                      <div className="space-y-3">
                        {data.participants.map((participant) => (
                          <div key={participant.user_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {participant.profile ? (
                                  <img
                                    src={participant.profile}
                                    alt={participant.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {participant.firstname?.[0]}{participant.lastname?.[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{`${participant.firstname} ${participant.lastname}`}</p>
                                <p className="text-xs text-muted-foreground">{participant.role}</p>
                              </div>
                            </div>
                            <Badge variant="outline">{participant.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No participants yet</p>
                    )}
                    {!data.isOwner && (
                      <Button
                        onClick={handleJoin}
                        className="w-full"
                        variant={isJoined ? "destructive" : "default"}
                      >
                        {isJoined ? 'Leave Project' : 'Join Project'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Start Date:</span>
                        <span>{data.start_date ? new Date(data.start_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">End Date:</span>
                        <span>{data.end_date ? new Date(data.end_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
