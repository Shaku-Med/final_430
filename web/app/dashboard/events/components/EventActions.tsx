import { useState, useCallback } from 'react'
import { MoreVertical, Flag, Share2, Copy, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { ReportModal } from './ReportModal'
import { useRouter } from 'next/navigation'

interface EventActionsProps {
  eventTitle: string
  event_id: string
  isOwner: boolean
  onEdit?: (eventId: string) => void
  onDelete?: (eventId: string) => void
}

export function EventActions({ eventTitle, event_id, isOwner, onEdit, onDelete }: EventActionsProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  const getEventUrl = useCallback(() => {
    // Construct the full URL for the event
    const baseUrl = window.location.origin
    return `${baseUrl}/events/${event_id}`
  }, [event_id])

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: eventTitle,
          text: `Check out this event: ${eventTitle}`,
          url: getEventUrl(),
        })
        toast.success('Event shared successfully!')
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(getEventUrl())
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Failed to share event')
      }
    }
  }, [eventTitle, getEventUrl])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(getEventUrl())
    toast.success('Link copied to clipboard!')
  }, [getEventUrl])

  const handleEdit = useCallback(() => {
    if (isOwner) {
      router.push(`/dashboard/events/${event_id}/edit`)
    }
    setIsDropdownOpen(false)
  }, [event_id, isOwner, router])

  const handleDelete = useCallback(async () => {
    if (!isOwner) return

    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/events/${event_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast.success('Event deleted successfully')
      if (onDelete) {
        onDelete(event_id)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
    setIsDropdownOpen(false)
  }, [event_id, isOwner, onDelete])

  const handleReportClick = useCallback(() => {
    setIsDropdownOpen(false)
    setIsReportModalOpen(true)
  }, [])

  const handleCloseReportModal = useCallback(() => {
    setIsReportModalOpen(false)
  }, [])

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem 
            onClick={handleReportClick}
            className="text-red-600"
          >
            <Flag className="mr-2 h-4 w-4" />
            <span>Report</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        eventTitle={eventTitle}
      />
    </>
  )
} 