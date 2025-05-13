'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Share2, MessageCircle, Calendar, User, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import dynamic from 'next/dynamic'
import ThreadComments from '@/components/ThreadComments'

const Markdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false })

interface User {
  id: string
  firstname: string
  lastname: string
  name: string
  profile: string
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  information: string
  imageUrl: string
  date: string
  user_id: string
  likes: number
  comments: number
  shares: number
  views: number
  users: User | null
  isOwner: boolean
  isLiked: boolean
  suggestedBlogs: BlogPost[]
  isAuth: boolean
}

const Blog = ({ data }: { data: BlogPost }) => {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(data.isLiked)
  const [likesCount, setLikesCount] = useState(data.likes)
  const [viewsCount, setViewsCount] = useState(data.views || 0)

  useEffect(() => {
    const updateViews = async () => {
      try {
        const response = await fetch(`/api/blogs/${data.id}/views`, {
          method: 'POST',
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setViewsCount(prev => prev + 1)
          }
        }
      } catch (error) {
        console.error('Error updating views:', error)
      }
    }

    updateViews()
  }, [data.id])

  const handleLike = async () => {
    try {
      const response = await fetch('/api/blogs/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blog_id: data.id,
          action: isLiked ? 'unlike' : 'like'
        }),
      })

      if (!response.ok) throw new Error('Failed to update like')

      const result = await response.json()
      if (result.success) {
        setIsLiked(result.isLiked)
        setLikesCount(result.likes)
      } else {
        throw new Error(result.message || 'Failed to update like')
      }
    } catch (error) {
      console.error('Error updating like:', error)
      toast.error('Failed to update like')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const response = await fetch(`/api/blogs/?id=${data.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete blog')

      toast.success('Blog post deleted successfully')
      router.push('/blog')
      router.refresh()
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast.error('Failed to delete blog post')
    }
  }

  const getAuthorName = (post: BlogPost) => {
    if (!post.users) return 'Anonymous';
    return post.users.name || `${post.users.firstname || ''} ${post.users.lastname || ''}`.trim() || 'Unknown Author';
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return null
    try {
      const parsed = JSON.parse(imageUrl)
      return parsed[0] || null
    } catch {
      return imageUrl
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy')
  }

  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '0';
    
    if (num >= 1000000000000) {
      return (num / 1000000000000).toFixed(1) + 'T';
    }
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  return (
    <div className="container px-0 mx-auto py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Blog Content */}
        <div className="lg:col-span-2">
          <article className=" ">
            {data.imageUrl && (
              <div className="relative h-[400px] w-full">
                <img
                  src={getImageUrl(data.imageUrl)}
                  alt={data.title}
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            )}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{getAuthorName(data)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(data.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(viewsCount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mb-6">
                {data.isAuth && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount > 0 ? formatNumber(likesCount) : ''}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>{formatNumber(data.comments)}</span>
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span>{formatNumber(data.shares)}</span>
                </Button>
                
                {data.isOwner && (
                  <div className="ml-auto flex gap-2">
                    <Link href={`/blog/${data.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <Markdown source={data.information} />
              </div>
            </div>
          </article>
          {
            data?.isAuth ? (
              <div className='px-6'>
              <ThreadComments endpoint={`/api/blogs/${data.id}/comments`} />
            </div>
            ) : (
              <div className='px-6 py-4 flex flex-col gap-2 items-center justify-center'>
                <p className=' text-2xl'>Please login to comment</p>
                <Link className='w-full' href='/account'>
                  <Button variant='outline' size='sm' className='flex mt-2 p-2 cursor-pointer w-full items-center gap-2'>
                    Login
                  </Button>
                </Link>
              </div>
            )
          }
        </div>

        {/* Suggested Blog Posts */}
        <div className="lg:col-span-1 px-2">
          <h2 className="text-2xl font-bold mb-6">Suggested Posts</h2>
          <div className="space-y-6 flex flex-col gap-2">
            {data.suggestedBlogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {blog.imageUrl && (
                      <div className="relative h-48 w-full mb-4">
                        <img
                          src={getImageUrl(blog.imageUrl)}
                          alt={blog.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold mb-2 line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{getAuthorName(blog)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog
