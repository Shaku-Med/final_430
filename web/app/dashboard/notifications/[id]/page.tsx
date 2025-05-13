'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { getNotificationIcon, getNotificationColor } from '@/app/dashboard/notifications/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'alert' | 'success' | 'error'
  timestamp: string
  read: boolean
}

export default function NotificationPage() {
  const params = useParams()
  const router = useRouter()
  const [notification, setNotification] = useState<Notification | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`/api/notifications/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch notification')
        const data = await response.json()
        setNotification({
          id: data.id,
          title: data.type.charAt(0).toUpperCase() + data.type.slice(1),
          message: data.message,
          type: data.type,
          timestamp: data.created_at,
          read: data.is_read
        })
      } catch (error) {
        console.error('Error fetching notification:', error)
        toast.error('Failed to load notification')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotification()
  }, [params.id])

  const markAsRead = async () => {
    if (!notification) return
    
    try {
      const response = await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      
      setNotification(prev => prev ? { ...prev, read: true } : null)
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-6" />
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!notification) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Notification not found</p>
        <Button
          variant="link"
          onClick={() => router.push('/dashboard/notifications')}
          className="mt-4"
        >
          Back to Notifications
        </Button>
      </div>
    )
  }

  const Icon = getNotificationIcon(notification.type)

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/notifications')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Notifications
      </Button>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{notification.title}</h1>
                {!notification.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAsRead}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground mt-4">
                {notification.message}
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                {new Date(notification.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 