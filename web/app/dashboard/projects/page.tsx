'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Heart, MessageCircle, Share2, FileText, Filter, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { ProjectCard } from '@/app/dashboard/projects/components/ProjectCard'

interface Project {
  id: string;
  project_id: string;
  title: string;
  description: string;
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
  client: string;
  budget: string;
  team: string;
  start_date: string;
  end_date: string;
  isOwner: boolean;
  date: string;
  owner_id: string;
  isLiked?: boolean;
  views: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 5,
    hasMore: true
  })
  const [sortBy, setSortBy] = useState('latest')
  const [sortOrder, setSortOrder] = useState('desc')
  const [activeTab, setActiveTab] = useState('all')

  const fetchProjects = useCallback(async (page: number, sortBy: string, sortOrder: string, append: boolean = false) => {
    try {
      setIsLoading(true)
      const statusFilter = activeTab !== 'all' ? `&status=${activeTab}` : ''
      const response = await fetch(
        `/api/projects/fetch?page=${page}&limit=${pagination.limit}&sortBy=${sortBy}&sortOrder=${sortOrder}${statusFilter}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(prev => append ? [...prev, ...data.projects] : data.projects)
      setPagination(data.pagination)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, activeTab])

  useEffect(() => {
    fetchProjects(1, sortBy, sortOrder)
  }, [sortBy, sortOrder, activeTab])

  const handleScroll = useCallback(() => {
    const scrollContainer = document.querySelector('.dashboard_r');
    const scrollPosition = scrollContainer 
      ? scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 300
      : window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300;

    if (scrollPosition) {
      if (!isLoading && pagination.hasMore) {
        fetchProjects(pagination.page + 1, sortBy, sortOrder, true)
      }
    }
  }, [isLoading, pagination.hasMore, pagination.page, sortBy, sortOrder, fetchProjects])

  useEffect(() => {
    const scrollContainer = document.querySelector('.dashboard_r');
    const targetElement = scrollContainer || window;
    
    targetElement.addEventListener('scroll', handleScroll)
    return () => targetElement.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h1>
          <Link href="/dashboard/projects/new">
            <Button className="rounded-full shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-primary to-primary/80">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </header>

        <motion.div
          className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full lg:w-auto"
          >
            <TabsList className="grid grid-cols-5 w-full lg:w-auto bg-background/50 backdrop-blur-sm">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="on-hold">On Hold</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg px-3 py-1 bg-background/50 backdrop-blur-sm shadow-sm w-full lg:w-auto">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-0 p-0 h-8 w-full bg-transparent">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                  <SelectItem value="comments">Most Commented</SelectItem>
                  <SelectItem value="shares">Most Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="h-10 w-10 rounded-full"
            >
              <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden border bg-card h-full">
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4 mt-2" />
                </CardHeader>
                <CardContent className="pb-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="gap-3 flex-col items-stretch">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-full bg-muted p-6 mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mt-4">No projects found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Create your first project to get started or try changing your filters
            </p>
            <Link href="/dashboard/projects/new">
              <Button className="mt-6 rounded-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create a Project
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
          className="dashboard_r flex flex-col gap-2"
          variants={container}
          initial="hidden"
          animate="show"
        >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>
        )}
        
        {isLoading && projects.length > 0 && (
          <div className="flex justify-center items-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground">Loading more projects...</span>
            </div>
          </div>
        )}
        
        {!isLoading && !pagination.hasMore && projects.length > 0 && (
          <div className="text-center text-muted-foreground py-8">
            <div className="w-16 h-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full mx-auto mb-4"></div>
            You've reached the end of the list
          </div>
        )}
      </div>
    </div>
  )
}
