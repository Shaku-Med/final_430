'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, MoreVertical, Flag, Share2, Bookmark, Copy, Users, Calendar, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { ProjectActions } from './ProjectActions'
import { SocialInteractions } from './SocialInteractions'

const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface Project {
  project_id: string;
  title: string;
  description: string;
  date: string;
  start_date: string;
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
  views: number;
  owner_id: string;
  isOwner: boolean;
  isLiked?: boolean;
  isAuth?: boolean;
  isJoined?: boolean;
  isParticipant?: boolean;
  hasJoined?: boolean;
  participants?: {
    user_id: string;
    firstname: string;
    lastname: string;
    name: string;
    profile: string;
    role?: string;
    status?: string;
    last_active_at?: string;
    contribution_score?: number;
  }[];
  id: string;
}

interface ProjectCardProps {
  project: Project;
  hideActions?: boolean;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
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

export function ProjectCard({ project, hideActions = false }: ProjectCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [likes, setLikes] = useState(project.likes)
  const [isLiked, setIsLiked] = useState(project.isLiked || false)
  const [views, setViews] = useState(project.views || 0)
  const [isJoined, setIsJoined] = useState(project.hasJoined || project.isParticipant || false)
  const isLongDescription = project.description.length > 200
  const displayDescription = showFullDescription 
    ? project.description 
    : project.description.slice(0, 200) + (isLongDescription ? '...' : '')

  let thumbnail = project?.thumbnail?.url ? JSON.parse(project.thumbnail.url)[0] : '/placeholder.png'

  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch(`/api/projects/${project.id}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to track view')
        }
        
        const result = await response.json()
        if (result.success) {
          setViews(result.views)
        }
      } catch (error) {
        console.error('Error tracking view:', error)
        // Don't show error toast to user as this is a background operation
      }
    }

    // Only track view if the project is visible in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackView()
          observer.disconnect() // Stop observing after view is tracked
        }
      },
      { threshold: 0.5 } // Track when at least 50% of the card is visible
    )

    const cardElement = document.getElementById(`project-card-${project.id}`)
    if (cardElement) {
      observer.observe(cardElement)
    }

    return () => {
      observer.disconnect()
    }
  }, [project.id])

  const handleLike = async () => {
    if (hideActions) return
    try {
      const response = await fetch('/api/projects/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: project.id,
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
  }

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isJoined ? 'unjoin' : 'join'
        }),
      });

      if (!response.ok) throw new Error('Failed to update join status');

      const result = await response.json();
      if (result.success) {
        setIsJoined(!isJoined);
        if (project.participants) {
          if (isJoined) {
            const updatedParticipants = project.participants.filter(
              p => p.user_id !== result.user_id
            );
            project.participants = updatedParticipants;
          } else {
            if (result.user) {
              project.participants = [...project.participants, result.user];
            }
          }
        }
        toast.success(result.message);
      } else {
        throw new Error(result.message || 'Failed to update join status');
      }
    } catch (error) {
      console.error('Error updating join status:', error);
      toast.error('Failed to update join status');
    }
  }

  const handleShare = async () => {
    if (hideActions) return
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleReport = () => {
    toast.info('Report submitted. Thank you for your feedback!')
  }

  const handleBookmark = () => {
    toast.success('Project bookmarked!')
  }

  return (
    <motion.div className={`w-full flex items-center justify-center`} variants={item} transition={{ duration: 0.3 }}>
      <Link href={`/dashboard/projects/${project.id}`} className="w-full">
        <Card id={`project-card-${project.id}`} className="overflow-hidden bg-card/80 backdrop-blur-md flex justify-between flex-col max-w-[800px] w-full aspect-square p-0 group border transition-all hover:shadow-lg h-full flex flex-col">
          <CardHeader className="h-[60px] py-2 mb-0 bg-secondary/40 border-b shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base font-semibold hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    {new Date(project.start_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </div>
              </div>
              {!hideActions && (
                <ProjectActions 
                  projectTitle={project.title} 
                  project_id={project.id} 
                  isOwner={project?.isOwner}
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
          </CardContent>
          {!hideActions && (
            <div className="px-6 pb-4 mt-[-23px] bg-secondary/40">
              <SocialInteractions
                likes={likes}
                comments={project.comments}
                shares={project.shares}
                views={views}
                onLike={handleLike}
                onComment={() => {}}
                onShare={handleShare}
                isLiked={isLiked}
              />
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  )
} 