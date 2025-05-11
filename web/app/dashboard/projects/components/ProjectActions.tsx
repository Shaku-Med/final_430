import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreVertical, Flag, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ReportModal } from '../../events/components/ReportModal'

interface ProjectActionsProps {
  projectTitle: string;
  project_id: string;
  isOwner: boolean;
}

export function ProjectActions({ projectTitle, project_id, isOwner }: ProjectActionsProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/dashboard/projects/${project_id}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${project_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete project')

      toast.success('Project deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleReport = () => {
    setIsReportModalOpen(true)
  }

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {
            isOwner && (
              <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
              
              </>
            )
          }
          <DropdownMenuItem onClick={handleReport}>
            <Flag className="h-4 w-4 mr-2" />
            Report Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(window.location.origin + `/dashboard/projects/${project_id}`)
            toast.success('Link copied to clipboard')
          }}>
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        eventTitle={projectTitle}
      />
    </>
  )
} 