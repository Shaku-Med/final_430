'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Check, X, AlertCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'alert' | 'success' | 'error'
  timestamp: string
  read: boolean
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'info': return Info
    case 'alert': return AlertCircle
    case 'success': return Check
    case 'error': return X
    default: return Bell
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'info': return 'bg-blue-500'
    case 'alert': return 'bg-yellow-500'
    case 'success': return 'bg-green-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data.notifications.map((n: any) => ({
        id: n.id,
        title: n.type.charAt(0).toUpperCase() + n.type.slice(1),
        message: n.message,
        type: n.type,
        timestamp: n.created_at,
        read: n.is_read
      })))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark all notifications as read')
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-1" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-1" />
                    <div className="flex items-center justify-between mt-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button 
          variant="outline"
          onClick={markAllAsRead}
          disabled={notifications.every(n => n.read)}
        >
          Mark All as Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            return (
              <Card 
                key={notification.id} 
                className={`${notification.read ? 'opacity-75' : ''} cursor-pointer hover:bg-accent/50 transition-colors`}
                onClick={() => router.push(`/dashboard/notifications/${notification.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          {notification.read ? 'Mark as Unread' : 'Mark as Read'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 