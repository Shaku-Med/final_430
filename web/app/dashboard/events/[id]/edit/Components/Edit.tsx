'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { FileUpload } from '@/app/dashboard/projects/components/FileUpload'
import { MapPin, Search, Map, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

export default function EditEventPage({data}: any) {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: data.title || '',
    description: data.description || '',
    date: data.date ? new Date(data.date) : new Date(),
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '10:00',
    status: data.status || 'upcoming',
    thumbnail: data.thumbnail ? [data.thumbnail] : [],
    attachments: data.attachments || [],
    location: data.location || ''
  })
  const [mapUrl, setMapUrl] = useState(data.location ? `https://www.google.com/maps?q=${encodeURIComponent(data.location)}&output=embed` : '')

  const handleFilesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({
      ...prev,
      attachments: files
    }))
  }

  const handleThumbnailChange = (files: UploadedFile[]) => {
    setFormData(prev => ({
      ...prev,
      thumbnail: files
    }))
  }

  const handleLocationSearch = () => {
    if (formData.location) {
      const query = encodeURIComponent(formData.location)
      setMapUrl(`https://www.google.com/maps?q=${query}&output=embed`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if(isLoading){
      toast.info('Please wait while we update the event')
      return;
    }

    const isUploading = formData.attachments.some((file: UploadedFile) => file.status === 'uploading') || 
                       formData.thumbnail.some((file: UploadedFile) => file.status === 'uploading')
    if (isUploading) {
      toast.error('Please wait for all files to finish uploading')
      return
    }

    if (!formData.location) {
      toast.error('Please enter a location for the event')
      return
    }

    if (formData.thumbnail.length === 0) {
      toast.error('Please upload a thumbnail for the event')
      return
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
      formDataToSend.append('mapUrl', mapUrl)
      
      if (formData.thumbnail[0]?.file) {
        const thumbnailData = {
          id: formData.thumbnail[0].id,
          name: formData.thumbnail[0].file.name,
          type: formData.thumbnail[0].file.type,
          size: formData.thumbnail[0].file.size,
          path: formData.thumbnail[0].path,
          url: formData.thumbnail[0].url
        }
        formDataToSend.append('thumbnail', JSON.stringify(thumbnailData))
      }

      if (formData.attachments.length > 0) {
        const attachmentsData = formData.attachments
          .filter((file: UploadedFile) => file && file.file)
          .map((file: UploadedFile) => ({
            id: file.id,
            name: file.file.name,
            type: file.file.type,
            size: file.file.size,
            path: file.path,
            url: file.url
          }))
        formDataToSend.append('attachments', JSON.stringify(attachmentsData))
      }

      const response = await fetch(`/api/events/${params.id}/update`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      toast.success('Event updated successfully')
      router.push('/dashboard/events')
    } catch (error) {
      console.log(error)
      toast.error('Failed to update event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 md:px-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/events/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

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

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter event location"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLocationSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="h-[300px] rounded-lg overflow-hidden border">
              {mapUrl ? (
                <iframe
                  title="Event Location Map"
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Map className="h-12 w-12" />
                  <p className="text-center">
                    Enter a location above to see it on the map
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <FileUpload
                onFilesChange={handleThumbnailChange}
                maxFiles={1}
                maxSize={5 * 1024 * 1024} // 5MB limit for thumbnail
                accept={{
                  'image/*': []
                }}
                onProcessing={setIsLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <FileUpload
                onFilesChange={handleFilesChange}
                maxFiles={15}
                maxSize={200 * 1024 * 1024}
                onProcessing={setIsLoading}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
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
            disabled={isLoading || formData.attachments.some((file: UploadedFile) => file.status === 'uploading') || formData.thumbnail.some((file: UploadedFile) => file.status === 'uploading')}
          >
            {isLoading ? 'Updating...' : 'Update Event'}
          </Button>
        </div>
      </form>
    </div>
  )
}
