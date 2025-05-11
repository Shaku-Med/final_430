import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export function ReportModal({ isOpen, onClose, projectTitle }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Handle mounting
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setReason('')
      setIsSubmitting(false)
      onClose()
    }
  }, [onClose])

  const handleSubmit = useCallback(async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for reporting')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'project',
          title: projectTitle,
          reason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit report')
      }

      toast.success('Report submitted successfully')
      handleOpenChange(false)
    } catch (error) {
      toast.error('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }, [reason, projectTitle, handleOpenChange])

  if (!mounted) return null

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Report Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Please provide a reason for reporting this project. Your report will be reviewed by our team.
          </p>
          <Textarea
            placeholder="Enter reason for reporting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 