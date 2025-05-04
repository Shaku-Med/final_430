import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    absolute: "Tasks"
  }
}

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  createdAt: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
}

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Project Proposal',
    description: 'Write and submit the project proposal for the new feature',
    status: 'in-progress',
    createdAt: '2024-05-10T09:00:00',
    dueDate: '2024-05-15',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Review Documentation',
    description: 'Review and update the API documentation',
    status: 'todo',
    createdAt: '2024-05-10T10:00:00',
    dueDate: '2024-05-20',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Team Meeting',
    description: 'Weekly team sync meeting',
    status: 'done',
    createdAt: '2024-05-09T14:00:00',
    dueDate: '2024-05-10',
    priority: 'low'
  }
]

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'todo': return 'bg-yellow-500'
    case 'in-progress': return 'bg-blue-500'
    case 'done': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'low': return 'bg-green-500'
    case 'medium': return 'bg-yellow-500'
    case 'high': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

export default function TasksPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-4">
          <Link href="/dashboard/tasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className={getPriorityColor(task.priority)}>Priority: {task.priority}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {task.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-2">
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {task.status === 'done' ? 'Mark as Todo' : task.status === 'in-progress' ? 'Mark as Done' : 'Start Progress'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 