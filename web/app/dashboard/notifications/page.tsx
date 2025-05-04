import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Check, X, AlertCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: {
    absolute: "Notifications"
  }
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'alert' | 'success' | 'error'
  timestamp: string
  read: boolean
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Assignment Posted',
    message: 'Math Assignment #4 has been posted. Due date: May 25, 2024',
    type: 'info',
    timestamp: '2024-05-10T09:00:00',
    read: false
  },
  {
    id: '2',
    title: 'Upcoming Event',
    message: 'Science Fair is tomorrow at 10:00 AM in the Main Hall',
    type: 'alert',
    timestamp: '2024-05-10T08:30:00',
    read: true
  },
  {
    id: '3',
    title: 'Grade Updated',
    message: 'Your grade for Physics Project has been updated to A+',
    type: 'success',
    timestamp: '2024-05-09T15:45:00',
    read: false
  }
]

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
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline">
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-4">
        {sampleNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type)
          return (
            <Card key={notification.id} className={notification.read ? 'opacity-75' : ''}>
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
                      <Button variant="ghost" size="sm">
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
    </div>
  )
} 