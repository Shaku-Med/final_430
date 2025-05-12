'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Calendar, 
  Users, 
  ArrowLeft, 
  Bookmark, 
  Clock, 
  Pencil 
} from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import ThreadComments from '@/components/ThreadComments'
import Footer from '@/app/Home/Footer/Footer'
import Nav from '@/app/Home/Nav/Nav'
import { SocialInteractions } from '@/app/dashboard/projects/components/SocialInteractions'

const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface ProjectMember {
  id?: string;
  user_id: string;
  firstname: string;
  lastname: string;
  name: string;
  profile: string;
  role?: string;
  status?: string;
  last_active_at?: string;
  contribution_score?: number;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  thumbnail?: string[] | { id?: string; name?: string; type?: string; url?: string };
  likes: number;
  views: number;
  comments: number;
  shares?: number;
  status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  start_date?: string;
  end_date?: string;
  date?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isOwner?: boolean;
  hasJoined?: boolean;
  members?: ProjectMember[];
  participants?: ProjectMember[];
  created_at?: string;
  updated_at?: string;
  isAuth: boolean;
}

const Dynamic = ({ data }: { data: ProjectData }) => {
  const params = useParams();
  const [views, setViews] = useState(data.views);
  const [likes, setLikes] = useState(data.likes);
  const [isLiked, setIsLiked] = useState(data.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(data.isBookmarked || false);
  const [isJoined, setIsJoined] = useState(data.hasJoined || false);
  
  const projectMembers = data.members || data.participants || [];
  const projectThumbnail = Array.isArray(data.thumbnail) 
    ? data.thumbnail[0] 
    : (data.thumbnail?.url || '');

  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch(`/api/projects/${data.id}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to track view');
        }
        
        const result = await response.json();
        if (result.success) {
          setViews(result.views);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [data.id]);

  const handleLike = async () => {
    try {
      const response = await fetch('/api/projects/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: data.id,
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

  const handleShare = async () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Project removed from bookmarks' : 'Project bookmarked!');
  };

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
        return 'bg-blue-500 hover:bg-blue-600';
      case 'in-progress':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'on-hold':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Link href="/projects">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
         <Nav/>
            <div className="min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
                >
                {/* Project Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link href="/projects">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Button>
                    </Link>
                    <div className="flex gap-2">
                    {data.isOwner && (
                        <Link href={`/projects/${data.id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit Project
                        </Button>
                        </Link>
                    )}
                    {/* Removed but might be useful later */}
                    {/* <Button 
                        variant="ghost" 
                        className="gap-2"
                        onClick={handleBookmark}
                    >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button> */}
                    </div>
                </div>
                
                {/* Main Content */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-2 space-y-6">
                    {/* Project Card */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        {/* Thumbnail Section */}
                        {projectThumbnail && (
                        <div className="relative h-[400px] w-full">
                            <Image
                            src={projectThumbnail}
                            alt={data.title}
                            fill
                            className="object-cover"
                            priority
                            />
                        </div>
                        )}

                        <CardHeader className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold">{data.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-4">
                                {data.start_date && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(data.start_date)}
                                </div>
                                )}
                                {data.created_at && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Created: {formatDate(data.created_at)}
                                </div>
                                )}
                            </div>
                            </div>
                            <div className="flex items-center gap-4">
                            {data.status && (
                                <Badge className={getStatusColor(data.status)}>
                                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                </Badge>
                            )}
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {views} views
                            </Badge>
                            </div>
                        </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                        {/* Description */}
                        <div className="prose max-w-none">
                            <Markdown source={data.description} />
                            {
                                !data?.isAuth && (
                                    <div>
                                        <Link href={`/account`} className="text-primary">
                                           Read More...
                                        </Link>
                                    </div>
                                )
                            }
                        </div>

                        {/* Social Interactions */}
                        <div className="flex items-center gap-6 pt-4 border-t">
                            {
                                data?.isAuth ? (
                                    <SocialInteractions
                                        likes={likes}
                                        comments={data.comments}
                                        shares={data.shares || 0}
                                        views={views}
                                        onLike={handleLike}
                                        onComment={() => {}}    
                                        onShare={handleShare}
                                        isLiked={isLiked}
                                    />
                                ) : (
                                    <>
                                       <Link href={`/account`} className="flex items-center justify-between w-full gap-2">
                                            <div 
                                                className="gap-2 flex items-center justify-center gap-2"
                                                >
                                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                                                <span>{likes}</span>
                                                </div>
                                                <div className="gap-2 flex items-center justify-center gap-2">
                                                <MessageCircle className="h-5 w-5" />
                                                <span>{data.comments}</span>
                                                </div>
                                                <div 
                                                className="gap-2 flex items-center justify-center gap-2"
                                                onClick={handleShare}
                                                >
                                                <Share2 className="h-5 w-5" />
                                                Share
                                                </div>
                                       </Link>
                                    </>
                                )
                            }
                        </div>
                        </CardContent>
                    </Card>

                    {/* Comments Section */}
                    {
                        data?.isAuth ? (

                            <Card className="border-none bg-[transparent] rounded-none shadow-none">
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

                        ) :
                        (
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-sm text-muted-foreground">Login to see comments</p>
                                <Link href={`/account`}>
                                    <Button variant="outline" className="gap-2">
                                        Login
                                    </Button>
                                </Link>
                            </div>
                        )
                    }
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                    {/* Members Section */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Project Members
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                            {projectMembers && projectMembers.length > 0 ? (
                            <div className="space-y-3">
                                {projectMembers.map((member, index) => (
                                <div key={member.id || member.user_id || index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {member.profile ? (
                                        <Image
                                            src={member.profile}
                                            alt={`${member.firstname} ${member.lastname}`}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover"
                                        />
                                        ) : (
                                        <span className="text-sm font-medium">
                                            {member.firstname[0]}{member.lastname[0]}
                                        </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{`${member.firstname} ${member.lastname}`}</p>
                                        <p className="text-xs text-muted-foreground">{member.role || member.name}</p>
                                    </div>
                                    </div>
                                    {member.status && (
                                    <Badge variant="outline">{member.status}</Badge>
                                    )}
                                </div>
                                ))}
                            </div>
                            ) : (
                            <p className="text-sm text-muted-foreground">No members yet</p>
                            )}
                            
                            {
                                data?.isAuth ? (
                                    <>
                                       {!data.isOwner && (
                                            <Button
                                                onClick={handleJoin}
                                                className="w-full mt-4"
                                                variant={isJoined ? "destructive" : "default"}
                                            >
                                                {isJoined ? 'Leave Project' : 'Join Project'}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Link href={`/account`}>
                                    <Button
                                        className="w-full mt-4"
                                        variant={'outline'}
                                    >
                                        Join Project
                                        </Button>
                                    </Link>
                                )
                            }
                        </div>
                        </CardContent>
                    </Card>

                    {/* Timeline Section */}
                    <Card className="border-0 shadow-lg">
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
                                <span>{formatDate(data.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">End Date:</span>
                                <span>{formatDate(data.end_date)}</span>
                            </div>
                            {data.date && (
                                <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Published:</span>
                                <span>{formatDate(data.date)}</span>
                                </div>
                            )}
                            {data.updated_at && (
                                <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Last Updated:</span>
                                <span>{formatDate(data.updated_at)}</span>
                                </div>
                            )}
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
                </motion.div>
            </div>
            </div>
        <Footer/>
    </>
  );
};

export default Dynamic;