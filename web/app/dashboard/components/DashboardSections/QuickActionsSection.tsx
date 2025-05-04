import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Calendar, FileText, MessageSquare, Settings, UserPlus, Video, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Assignment Posted',
    message: 'Math Assignment #3 has been posted',
    timestamp: '5 minutes ago',
    read: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Project Deadline Reminder',
    message: 'Science project submission due in 2 days',
    timestamp: '1 hour ago',
    read: false,
    type: 'warning'
  },
  // Add more notifications...
]

const quickActions = [
  { icon: <FileText className="h-5 w-5" />, label: 'New Assignment', color: 'bg-blue-500' },
  { icon: <Calendar className="h-5 w-5" />, label: 'Schedule Event', color: 'bg-green-500' },
  { icon: <UserPlus className="h-5 w-5" />, label: 'Add Student', color: 'bg-purple-500' },
  { icon: <Video className="h-5 w-5" />, label: 'Start Meeting', color: 'bg-red-500' },
  { icon: <BookOpen className="h-5 w-5" />, label: 'View Resources', color: 'bg-yellow-500' },
  { icon: <MessageSquare className="h-5 w-5" />, label: 'Send Message', color: 'bg-indigo-500' }
]

export const QuickActionsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex flex-col items-center justify-center h-24 gap-2"
            >
              <div className={`p-2 rounded-full ${action.color} text-white`}>
                {action.icon}
              </div>
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </h3>
            <Button variant="ghost" size="sm">
              Mark All Read
            </Button>
          </div>
          
          <div className="space-y-3">
            {sampleNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'info' ? 'bg-blue-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    notification.type === 'success' ? 'bg-green-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 