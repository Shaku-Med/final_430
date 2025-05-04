import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { FileText, Users, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Project {
  id: string
  title: string
  description: string
  team: {
    name: string
    avatar: string
  }[]
  progress: number
  deadline: string
  status: 'on-track' | 'at-risk' | 'delayed'
  tasks: {
    completed: number
    total: number
  }
}

const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'Smart Campus App',
    description: 'Mobile application for campus navigation and event management',
    team: [
      { name: 'John Doe', avatar: '/avatar1.jpg' },
      { name: 'Jane Smith', avatar: '/avatar2.jpg' },
      { name: 'Mike Johnson', avatar: '/avatar3.jpg' }
    ],
    progress: 75,
    deadline: '2024-06-15',
    status: 'on-track',
    tasks: {
      completed: 15,
      total: 20
    }
  },
  // Add more sample projects...
]

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'on-track': return 'bg-green-500'
    case 'at-risk': return 'bg-yellow-500'
    case 'delayed': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

export const ProjectsSection = () => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Active Projects
        </CardTitle>
        <Button variant="outline" size="sm">
          Create New
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex -space-x-2">
                      {project.team.map((member, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span>Tasks: {project.tasks.completed}/{project.tasks.total}</span>
                      </div>
                      <span className="text-muted-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {project.deadline}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
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