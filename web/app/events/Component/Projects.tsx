'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, Users, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Nav from '@/app/Home/Nav/Nav'
import Footer from '@/app/Home/Footer/Footer'

interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnail?: {
    id?: string;
    name?: string;
    type?: string;
    url?: string;
  };
  likes: number;
  views: number;
  start_date: string;
  comments: number;
  shares: number;
  memberCount: number;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
}

interface ProjectsProps {
  projects: Project[];
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
}

const Events = ({ projects, currentPage, totalCount, itemsPerPage }: ProjectsProps) => {
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isChangingPage, setIsChangingPage] = useState(false)
  const [pageDirection, setPageDirection] = useState<'next' | 'prev' | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handlePageChange = (direction: 'next' | 'prev') => {
    setIsChangingPage(true)
    setPageDirection(direction)
    
    setTimeout(() => {
      const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1
      window.location.href = `?page=${newPage}`
    }, 400)
  }

  const getStatusBadge = (status: Project['status']) => {
    return (
      <span className="text-xs px-2 py-1 rounded-full border">
        {status.replace('-', ' ')}
      </span>
    )
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1">
        <div className={`container mx-auto py-8 md:py-12 lg:py-20 px-4 md:px-6 transition-all duration-500 ${isChangingPage ? pageDirection === 'next' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-center">
            Discover Events
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project, index) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="block">
                <div 
                  className="group h-full"
                  onMouseEnter={() => setHoveredCard(project.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <Card className={`h-full relative overflow-hidden transition-all duration-300 ${hoveredCard === project.id ? 'scale-105' : ''}`}>
                    {project.thumbnail?.url && (
                      <div className="w-full h-48 overflow-hidden">
                        <div 
                          className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${project.thumbnail.url})` }}
                        />
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(project.status)}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl font-bold">
                        {project.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      
                      <div className="flex flex-wrap items-center justify-between text-sm">
                        <div className="flex flex-wrap items-center gap-2 md:gap-4">
                          <div className="flex items-center group">
                            <Heart className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:scale-125" />
                            <span>{project.likes}</span>
                          </div>
                          <div className="flex items-center group">
                            <MessageCircle className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:scale-125" />
                            <span>{project.comments}</span>
                          </div>
                          <div className="flex items-center group">
                            <Share2 className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:scale-125" />
                            <span>{project.shares}</span>
                          </div>
                          <div className="flex items-center group">
                            <Users className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:scale-125" />
                            <span>{project.memberCount}</span>
                          </div>
                        </div>
                        
                        <span className="text-xs mt-2 md:mt-0">
                          {new Date(project.start_date).toDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center mt-8 md:mt-12 gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange('prev')}
                className="flex items-center gap-2"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="flex items-center px-4">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange('next')}
                className="flex items-center gap-2"
                size="sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Events