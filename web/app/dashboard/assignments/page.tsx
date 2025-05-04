import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export const metadata: Metadata = {
  title: {
    absolute: "Assignments"
  }
}

interface Assignment {
  id: string
  title: string
  subject: string
  description: string
  dueDate: string
  status: 'pending' | 'submitted' | 'late' | 'graded'
  grade?: string
  submissionDate?: string
  attachments: number
}

const sampleAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Math Assignment #3',
    subject: 'Mathematics',
    description: 'Solve the following calculus problems and show your work',
    dueDate: '2024-05-20',
    status: 'pending',
    attachments: 2
  },
  {
    id: '2',
    title: 'Science Project',
    subject: 'Physics',
    description: 'Research paper on quantum mechanics',
    dueDate: '2024-05-15',
    status: 'submitted',
    submissionDate: '2024-05-14',
    attachments: 1
  },
  // Add more assignments...
]

const getStatusColor = (status: Assignment['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500'
    case 'submitted': return 'bg-blue-500'
    case 'late': return 'bg-red-500'
    case 'graded': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

export default function AssignmentsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <Badge variant="outline" className={getStatusColor(assignment.status)}>
                  {assignment.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{assignment.subject}</span>
                <span>•</span>
                <span>{assignment.attachments} attachments</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {assignment.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  {assignment.submissionDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Submitted: {assignment.submissionDate}</span>
                    </div>
                  )}
                </div>

                {assignment.grade && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Grade: {assignment.grade}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    View Details
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