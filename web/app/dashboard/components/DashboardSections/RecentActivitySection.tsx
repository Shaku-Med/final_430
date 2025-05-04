import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Activity, CheckCircle2, AlertCircle, MessageSquare, FileText, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface ActivityItem {
  id: string
  type: 'project' | 'event' | 'comment' | 'task' | 'team'
  title: string
  description: string
  user: {
    name: string
    avatar: string
  }
  timestamp: string
  status?: 'completed' | 'pending' | 'error'
}

const sampleActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'project',
    title: 'New Project Created',
    description: 'Smart Campus App project has been created',
    user: {
      name: 'John Doe',
      avatar: '/avatar1.jpg'
    },
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2',
    type: 'task',
    title: 'Task Completed',
    description: 'UI Design phase completed for Smart Campus App',
    user: {
      name: 'Jane Smith',
      avatar: '/avatar2.jpg'
    },
    timestamp: '3 hours ago',
    status: 'completed'
  },
  // Add more sample activities...
]

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'project': return <FileText className="h-4 w-4" />
    case 'event': return <Activity className="h-4 w-4" />
    case 'comment': return <MessageSquare className="h-4 w-4" />
    case 'task': return <CheckCircle2 className="h-4 w-4" />
    case 'team': return <Users className="h-4 w-4" />
    default: return <Activity className="h-4 w-4" />
  }
}

const getStatusColor = (status?: ActivityItem['status']) => {
  if (!status) return ''
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'pending': return 'bg-yellow-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

export const RecentActivitySection = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {sampleActivities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <h3 className="font-semibold">{activity.title}</h3>
                      </div>
                      {activity.status && (
                        <Badge variant="outline" className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{activity.user.name}</span>
                      <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 