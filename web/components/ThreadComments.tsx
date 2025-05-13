'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Heart, MessageCircle, Edit, Trash2, Reply, MoreVertical, Flag, User, ChevronDown, ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  firstname: string
  lastname: string
  name: string
  profile: string
}

interface Comment {
  id: string
  content: string
  user_id: string
  parent_id: string | null
  created_at: string
  updated_at: string
  replies: number
  isOwner: boolean
  users: User
}

interface ThreadCommentsProps {
  endpoint: string
  headers?: Record<string, string>
  loadMoreType?: 'button' | 'scroll'
  allowDelete?: boolean
  allowEdit?: boolean
  allowReplies?: boolean
  className?: string
}

const ThreadComments: React.FC<ThreadCommentsProps> = ({
  endpoint,
  headers = {},
  loadMoreType = 'scroll',
  allowDelete = true,
  allowEdit = true,
  allowReplies = true,
  className = '',
}) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const fetchComments = async (pageNum: number) => {
    if (loadingRef.current) return
    
    try {
      loadingRef.current = true
      setLoading(true)
      const response = await fetch(`${endpoint}?page=${pageNum}&limit=10`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch comments')

      const data = await response.json()
      if (pageNum === 1) {
        setComments(data.comments)
      } else {
        setComments(prev => [...prev, ...data.comments])
      }
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  useEffect(() => {
    fetchComments(1)
  }, [endpoint])

  useEffect(() => {
    if (loadMoreType !== 'scroll') {
      return
    }

    const handleScroll = () => {
      if (loadingRef.current || !hasMore) {
        return
      }
      
      const scrollContainer = document.querySelector('.dashboard_r');
      const scrollPosition = scrollContainer 
        ? scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 300
        : window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300;

      if (scrollPosition) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchComments(nextPage)
      }
    }

    const scrollContainer = document.querySelector('.dashboard_r');
    const targetElement = scrollContainer || window;
    
    targetElement.addEventListener('scroll', handleScroll)
    return () => targetElement.removeEventListener('scroll', handleScroll)
  }, [loadMoreType, hasMore, page])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) throw new Error('Failed to post comment')

      const data = await response.json()
      setComments(prev => [data.comment, ...prev])
      setNewComment('')
      toast.success('Comment added! 🎉')
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const response = await fetch(`${endpoint}/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (!response.ok) throw new Error('Failed to edit comment')

      const data = await response.json()
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? { ...comment, content: data.content, updated_at: data.updated_at } : comment
        )
      )
      setEditingComment(null)
      setEditContent('')
      toast.success('Comment updated!')
    } catch (error) {
      console.error('Error editing comment:', error)
      toast.error('Failed to edit comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment? This action cannot be undone.')) return

    try {
      const response = await fetch(`${endpoint}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      setComments(prev => prev.filter(comment => comment.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return

    try {
      const response = await fetch(`${endpoint}/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ content: replyContent }),
      })

      if (!response.ok) throw new Error('Failed to post reply')

      const data = await response.json()
      setComments(prev => [...prev, data.reply])
      setReplyingTo(null)
      setReplyContent('')
      toast.success('Reply posted!')
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    }
  }

  const handleReportComment = async (commentId: string) => {
    try {
      const response = await fetch(`${endpoint}/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })

      if (!response.ok) throw new Error('Failed to report comment')
      toast.success('Thank you for reporting!')
    } catch (error) {
      console.error('Error reporting comment:', error)
      toast.error('Failed to report comment')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (a.parent_id && b.parent_id) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    if (a.parent_id && !b.parent_id) return 1
    if (!a.parent_id && b.parent_id) return -1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const toggleCollapse = (commentId: string) => {
    const newCollapsed = new Set(collapsedComments)
    if (newCollapsed.has(commentId)) {
      newCollapsed.delete(commentId)
    } else {
      newCollapsed.add(commentId)
    }
    setCollapsedComments(newCollapsed)
  }

  const getReplyCount = (commentId: string) => {
    return comments.filter(comment => comment.parent_id === commentId).length
  }

  const scrollToComment = (commentId: string) => {
    const element = document.getElementById(`comment-${commentId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('bg-primary')
      setTimeout(() => {
        element.classList.remove('bg-primary')
      }, 2000)
    }
  }

  const renderComment = (comment: Comment) => {
    const isReply = comment.parent_id !== null
    const parentComment = isReply ? comments.find(c => c.id === comment.parent_id) : null
    const replyCount = getReplyCount(comment.id)
    const isCollapsed = collapsedComments.has(comment.id)
    const hasReplies = replyCount > 0

    return (
      <Collapsible
        key={comment.id}
        open={!isCollapsed}
        onOpenChange={() => hasReplies && toggleCollapse(comment.id)}
      >
        <div id={`comment-${comment.id}`} className={`relative transition-colors duration-500 ${isReply ? 'ml-12 mb-3' : 'mb-6'}`}>
          <div className="relative">
            {isReply && (
              <div className="absolute -left-6 top-6 w-3 h-3 border-l-2 border-b-2 border-gray-200 rounded-bl"></div>
            )}
            <Card className="border-none bg-[transparent]  transition-all duration-200 rounded-none shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-background to-primary flex items-center justify-center text-background font-semibold text-sm shadow-sm">
                      {comment.users.firstname[0]}{comment.users.lastname[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold ">
                          {comment.users.firstname} {comment.users.lastname}
                        </span>
                        {comment.isOwner && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-orange-700 text-orange-200 rounded-full">
                            Author
                          </span>
                        )}
                        {hasReplies && (
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 py-0 text-muted-foreground hover:text-gray-700"
                            >
                              <span className="text-xs text-muted-foreground mr-1">
                                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                              </span>
                              {isCollapsed ? (
                                <ChevronRight className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(comment.created_at)}</span>
                        {isReply && parentComment && (
                          <>
                            <span>•</span>
                            <span>
                              replying to{' '}
                              <button
                                onClick={() => scrollToComment(comment.parent_id!)}
                                className=" font-medium hover:text-primary hover:underline transition-colors cursor-pointer"
                              >
                                {parentComment.users.firstname} {parentComment.users.lastname}
                              </button>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {allowReplies && (
                        <DropdownMenuItem
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-sm"
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                      )}
                      {comment.isOwner && allowEdit && (
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingComment(comment.id)
                            setEditContent(comment.content)
                          }}
                          className="text-sm"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {comment.isOwner && allowDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-sm text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleReportComment(comment.id)}
                        className="text-sm text-red-600 focus:text-red-600"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px] border-gray-200 focus:border-primary focus:ring-primary"
                      placeholder="Edit your comment..."
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditComment(comment.id)} size="sm" className="bg-primary hover:bg-primary">
                        Save Changes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingComment(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className=" whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                )}

                {replyingTo === comment.id && (
                  <div className="mt-4 border-t pt-4">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="mb-3 min-h-[100px] "
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleReply(comment.id)} size="sm" className="bg-primary hover:bg-primary">
                        Post Reply
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <CollapsibleContent>
          <div className="ml-6 border-l-2 pl-6">
            {comments
              .filter(reply => reply.parent_id === comment.id)
              .map(reply => renderComment(reply))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`max-w-4xl mx-full ${className} ${loadMoreType === 'scroll' ? '' : ''}`}
    >
      <div className="mb-8">
        <h2 className="text-xl font-semibold  mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 " />
          Discussion
        </h2>
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[120px] "
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="bg-primary hover:bg-primary text-background px-6"
            >
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {sortedComments
          .filter(comment => !comment.parent_id)
          .map((comment) => renderComment(comment))}
      </div>

      {comments.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Be the first to comment!</p>
        </div>
      )}

      {loadMoreType === 'button' && hasMore && (
        <div className="mt-8 text-center">
          <Button
            onClick={() => {
              setPage(prev => prev + 1)
              fetchComments(page + 1)
            }}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              'Load More Comments'
            )}
          </Button>
        </div>
      )}

      {loadMoreType === 'scroll' && hasMore && loading && (
        <div className="mt-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

export default ThreadComments