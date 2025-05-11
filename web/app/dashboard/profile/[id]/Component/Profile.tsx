'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, Users, Star, Heart, Trophy, Zap, Rocket, 
  Flame, Sparkles, Target, Award, Crown,
  Diamond, Gem, Hexagon, Layers, Box, Circle, Square
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  user_id: string
  name: string
  firstname: string
  lastname: string
  profile: string
  joinedAt: string
  events: any[]
  projects: any[]
  followers: any[]
  followerCount: number
  likedEvents: any[]
  likedProjects: any[]
  isFollowing?: boolean
}

const getRandomColor = () => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500', 'bg-rose-500'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const getRandomIcon = () => {
  const icons = [
    Crown, Trophy, Star, Flame, Sparkles, Target, Award,
    Diamond, Gem, Hexagon, Layers, Box, Circle, Square, Rocket, Zap
  ]
  const Icon = icons[Math.floor(Math.random() * icons.length)]
  return <Icon className="w-4 h-4" />
}

const CrazyProfile = ({ data, currentUserId }: { data: User, currentUserId: string }) => {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = React.useState(data.isFollowing || false)
  const [followerCount, setFollowerCount] = React.useState(data.followerCount)
  const [isLoading, setIsLoading] = React.useState(false)

  const isOwnProfile = currentUserId === data.user_id

  const handleFollow = async () => {
    if (isLoading) return
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: data.user_id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to follow/unfollow user')
      }

      const { isFollowing: newFollowStatus, message } = await response.json()
      setIsFollowing(newFollowStatus)
      setFollowerCount(prev => newFollowStatus ? prev + 1 : prev - 1)
      toast.success(message)
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to follow/unfollow user')
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    eventsCount: data.events.length,
    projectsCount: data.projects.length,
    likesReceived: data.events.reduce((sum, event) => sum + (event.likes || 0), 0) + 
                  data.projects.reduce((sum, project) => sum + (project.likes || 0), 0),
    xpPoints: data.events.length * 100 + data.projects.length * 200 + data.followerCount * 50,
    level: Math.floor((data.events.length * 100 + data.projects.length * 200 + data.followerCount * 50) / 1000) + 1,
    streak: Math.floor(Math.random() * 100) + 1 // This could be calculated from user activity data if available
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 60 0 L 0 0 0 60\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 container mx-auto py-8 px-4 space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-r from-purple-700 to-blue-700 border-none shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400 rounded-bl-full opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-400 rounded-tr-full opacity-20"></div>
            
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={data.profile} alt={data.name} />
                    <AvatarFallback className="text-2xl font-bold">{data.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 -right-2 bg-yellow-500 text-black font-bold px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    LVL {stats.level}
                  </Badge>
                </div>
                
                <div className="text-center md:text-left">
                  <div className="flex items-center md:text-left text-center w-full gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">{data.name || `${data.firstname} ${data.lastname}`}</h1>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {followerCount} Followers
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Calendar className="w-3 h-3 mr-1" />
                      Since {new Date(data.joinedAt).getFullYear()}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      <Flame className="w-3 h-3 mr-1" />
                      {stats.streak} Day Streak
                    </Badge>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {isOwnProfile ? (
                      <Button 
                        onClick={() => router.push(`/dashboard/profile/${data.user_id}/edit`)}
                        variant="default"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={handleFollow}
                          variant={isFollowing ? "destructive" : "default"}
                          className={`${isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              {isFollowing ? 'Unfollowing...' : 'Following...'}
                            </div>
                          ) : (
                            isFollowing ? 'Unfollow' : 'Follow'
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => router.push(`/chat/${data.user_id}`)}
                        >
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Events Created', value: stats.eventsCount, icon: Calendar, color: 'from-blue-500 to-blue-700' },
            { label: 'Projects', value: stats.projectsCount, icon: Rocket, color: 'from-green-500 to-green-700' },
            { label: 'Total Likes', value: stats.likesReceived, icon: Heart, color: 'from-pink-500 to-pink-700' },
            { label: 'Achievements', value: Math.floor(Math.random() * 50) + 10, icon: Trophy, color: 'from-yellow-500 to-yellow-700' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden bg-gradient-to-br ${stat.color} border-none shadow-lg`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/80 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-white/60" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 backdrop-blur-sm">
            <TabsTrigger value="events" className="text-white data-[state=active]:bg-blue-600">
              Events {getRandomIcon()}
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-white data-[state=active]:bg-green-600">
              Projects {getRandomIcon()}
            </TabsTrigger>
            <TabsTrigger value="likes" className="text-white data-[state=active]:bg-pink-600">
              Liked {getRandomIcon()}
            </TabsTrigger>
            <TabsTrigger value="followers" className="text-white data-[state=active]:bg-purple-600">
              Followers {getRandomIcon()}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="mt-6">
            <ScrollArea className="h-[600px] rounded-md border border-white/10 bg-black/20 backdrop-blur-sm p-4">
              <div className="grid gap-4">
                {data.events.map((event, index) => (
                  <motion.div
                    key={event.event_id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/dashboard/events/${event.event_id}`}>
                      <Card className={`bg-gradient-to-r ${getRandomColor()}/20 to-transparent border-l-4 border-l-${getRandomColor().split('-')[1]}-500 hover:scale-102 transition-transform cursor-pointer`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-white">{event.title}</h3>
                              <p className="text-sm text-white/70">{event.description}</p>
                              <div className="flex gap-4 mt-2 text-xs text-white/60">
                                <span>📍 {event.location}</span>
                                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                <span>❤️ {event.likes}</span>
                              </div>
                            </div>
                            <Badge className={`${getRandomColor()} text-white`}>
                              {event.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="projects" className="mt-6">
            <ScrollArea className="h-[600px] rounded-md border border-white/10 bg-black/20 backdrop-blur-sm p-4">
              <div className="grid gap-4">
                {data.projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Card className={`bg-gradient-to-r ${getRandomColor()}/20 to-transparent border-l-4 border-l-${getRandomColor().split('-')[1]}-500 hover:scale-102 transition-transform cursor-pointer`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-white">{project.title}</h3>
                              <p className="text-sm text-white/70">{project.description}</p>
                              <div className="flex gap-4 mt-2 text-xs text-white/60">
                                <span>👥 {project.team}</span>
                                <span>💰 {project.budget}</span>
                                <span>❤️ {project.likes}</span>
                                <span>👁️ {project.views}</span>
                              </div>
                            </div>
                            <Badge className={`${getRandomColor()} text-white`}>
                              {project.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="likes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  Liked Events {getRandomIcon()}
                </h3>
                <ScrollArea className="h-[300px] rounded-md border border-white/10 bg-black/20 backdrop-blur-sm p-4">
                  <div className="space-y-3">
                    {data.likedEvents.map((event) => (
                      <Card key={event.event_id} className="bg-gradient-to-r from-pink-700/30 to-transparent border-none">
                        <CardContent className="p-3">
                          <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                          <p className="text-xs text-white/60">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  Liked Projects {getRandomIcon()}
                </h3>
                <ScrollArea className="h-[300px] rounded-md border border-white/10 bg-black/20 backdrop-blur-sm p-4">
                  <div className="space-y-3">
                    {data.likedProjects.map((project) => (
                      <Card key={project.id} className="bg-gradient-to-r from-blue-700/30 to-transparent border-none">
                        <CardContent className="p-3">
                          <h4 className="font-semibold text-white text-sm">{project.title}</h4>
                          <p className="text-xs text-white/60">{project.client} • {project.team}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="followers" className="mt-6">
            <ScrollArea className="h-[600px] rounded-md border border-white/10 bg-black/20 backdrop-blur-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.followers.map((follower, index) => (
                  <motion.div
                    key={follower.user_id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className={`bg-gradient-to-br ${getRandomColor()}/20 to-transparent border border-white/10 hover:border-white/30 transition-all hover:scale-105`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-white/30">
                            <AvatarImage src={follower.profile} alt={follower.name} />
                            <AvatarFallback>{follower.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">{follower.name}</h3>
                            <p className="text-xs text-white/60">{follower.firstname} {follower.lastname}</p>
                          </div>
                          <div className="ml-auto">
                            {getRandomIcon()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Card className="">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Recent Achievements {getRandomIcon()}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { 
                  title: 'Event Master', 
                  desc: `Created ${data.events.length} events`, 
                  icon: Calendar,
                  progress: Math.min((data.events.length / 50) * 100, 100)
                },
                { 
                  title: 'Project Guru', 
                  desc: `Launched ${data.projects.length} projects`, 
                  icon: Rocket,
                  progress: Math.min((data.projects.length / 25) * 100, 100)
                },
                { 
                  title: 'Community Leader', 
                  desc: `${data.followerCount} followers`, 
                  icon: Users,
                  progress: Math.min((data.followerCount / 1000) * 100, 100)
                },
                { 
                  title: 'Engagement Pro', 
                  desc: `${stats.likesReceived} total likes`, 
                  icon: Heart,
                  progress: Math.min((stats.likesReceived / 500) * 100, 100)
                }
              ].map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                    <achievement.icon className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-xs text-white/70">{achievement.desc}</p>
                    <Progress value={achievement.progress} className="mt-2 h-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CrazyProfile