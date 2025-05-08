'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { ThumbnailUpload } from '../components/ThumbnailUpload'
import { FileUpload } from '../components/FileUpload'
import { CategorySelect } from '../components/CategorySelect'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { DatePicker } from '@/components/ui/date-picker'
import SetQuickToken from '@/app/account/Actions/SetQuickToken'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface UploadedFile {
  id: string;
  file: globalThis.File;
  progress: number;
  status: 'chunking' | 'uploading' | 'completed' | 'error';
  error?: string;
  customName?: string;
  chunks: {
    id: string;
    blob: Blob;
    name: string;
    index: number;
    totalChunks: number;
    objectUrl: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    path?: string;
    url?: string;
  }[];
  chunkingProgress?: number;
  path?: string;
  url?: string;
}

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    status: 'upcoming',
    thumbnail: null as File | null,
    attachments: [] as UploadedFile[],
    location: ''
  })

  const handleFilesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isUploading = formData.attachments.some(file => file.status === 'uploading');
    if (isUploading) {
      toast.error('Please wait for all files to finish uploading');
      return;
    }

    if (!formData.location) {
      toast.error('Please enter a location for the event');
      return;
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('date', formData.date.toISOString())
      formDataToSend.append('startTime', formData.startTime)
      formDataToSend.append('endTime', formData.endTime)
      formDataToSend.append('status', formData.status)
      formDataToSend.append('location', formData.location)
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail)
      }

      const attachmentsData = formData.attachments.map(file => ({
        id: file.id,
        name: file.file.name,
        type: file.file.type,
        size: file.file.size
      }))
      formDataToSend.append('attachments', JSON.stringify(attachmentsData))

      let s = await SetQuickToken(`access_token`)
      if(!s){
        toast.error(`Unable to create project. Reload your page and try again plz.`)
        setTimeout(() => window.location.reload(), 2000)
        return;
      }
      else {

        // 
        let getToken = await fetch(`/api/token`)
        let token = await getToken.json()
        if(!token?.success){
          toast.error(`Looks like we're having troubles creating your project.`)
          return;
        }
        else {
          const response = await fetch('/api/events', {
            method: 'POST',
            body: formDataToSend
          })
    
          if (!response.ok) {
            throw new Error('Failed to create event')
          }
    
          toast.success('Event created successfully')
          router.push('/dashboard/events')
        }
        
      }
    } catch (error) {
      toast.error('Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 md:px-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div data-color-mode="system">
                <MDEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value || '' })}
                  height={400}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Event Date</Label>
              <DatePicker
                date={formData.date}
                onSelect={(date) => date && setFormData({ ...formData, date })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <ThumbnailUpload
              value={formData.thumbnail}
              onChange={(file) => setFormData({ ...formData, thumbnail: file })}
            />
            <div className="space-y-2">
              <Label>Attachments</Label>
              <FileUpload
                onFilesChange={handleFilesChange}
                maxFiles={15}
                maxSize={200 * 1024 * 1024} // 200MB
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || formData.attachments.some(file => file.status === 'uploading')}
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  )
} 