'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Event {
  event_id: string
  title: string
  date: string
  status: string
  likes: number
  comments: number
  shares: number
  created_at: string
}

interface EventPageProps {
  data: Event[]
  currentPage: number
  totalCount: number
  itemsPerPage: number
}

const EventPage = ({ data, currentPage, totalCount, itemsPerPage }: EventPageProps) => {
  const router = useRouter()
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [reasonError, setReasonError] = useState(false)

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteReason('')
    setReasonError(false)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!eventToDelete) return
    
    if (!deleteReason.trim()) {
      setReasonError(true)
      return
    }

    try {
      const response = await fetch(`/api/admin/delete/events`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventToDelete,
          reason: deleteReason
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast.success('Event deleted successfully')
      router.refresh()
      setIsDeleteModalOpen(false)
      setDeleteReason('')
      setEventToDelete(null)
      setReasonError(false)
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false)
    setDeleteReason('')
    setEventToDelete(null)
    setReasonError(false)
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Events Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((event) => (
                <TableRow key={event.event_id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 text-sm">
                      <span>❤️ {event.likes}</span>
                      <span>💬 {event.comments}</span>
                      <span>🔄 {event.shares}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(event.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/dashboard/events/${event.event_id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(event.event_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} events
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/dashboard/events?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm" disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </Link>
              <Link href={`/admin/dashboard/events?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">
                Reason for deletion <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for deleting this event..."
                value={deleteReason}
                onChange={(e) => {
                  setDeleteReason(e.target.value)
                  if (e.target.value.trim()) setReasonError(false)
                }}
                className={reasonError ? "border-red-500 focus:ring-red-500" : ""}
                required
              />
              {reasonError && (
                <p className="text-sm text-red-500">A reason for deletion is required</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventPage