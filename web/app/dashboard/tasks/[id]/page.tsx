import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, Clock, Trash2, Save } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { DatePicker } from '@/components/ui/date-picker'

export const metadata: Metadata = {
  title: {
    absolute: "Task Details"
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

const sampleTask: Task = {
  id: '1',
  title: 'Complete Project Proposal',
  description: 'Write and submit the project proposal for the new feature',
  status: 'in-progress',
  createdAt: '2024-05-10T09:00:00',
  dueDate: '2024-05-15',
  priority: 'high'
}

export default function TaskDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Task Details</h1>
        <div className="flex gap-4">
          <Link href="/dashboard/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={sampleTask.title} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" defaultValue={sampleTask.description} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={sampleTask.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select defaultValue={sampleTask.priority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker
                date={sampleTask.dueDate ? new Date(sampleTask.dueDate) : undefined}
                onSelect={() => {}}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Created: {format(new Date(sampleTask.createdAt), 'PPP')}</span>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 