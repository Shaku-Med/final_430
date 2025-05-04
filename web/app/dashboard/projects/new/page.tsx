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

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface UploadedFile {
  id: string;
  file: globalThis.File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    status: 'active',
    thumbnail: null as File | null,
    attachments: [] as UploadedFile[]
  })

  const handleFilesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if any files are still uploading
    const isUploading = formData.attachments.some(file => file.status === 'uploading');
    if (isUploading) {
      toast.error('Please wait for all files to finish uploading');
      return;
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('start_date', formData.start_date.toISOString())
      formDataToSend.append('end_date', formData.end_date.toISOString())
      formDataToSend.append('status', formData.status)
      
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

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      toast.success('Project created successfully')
      router.push('/dashboard/projects')
    } catch (error) {
      toast.error('Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 md:px-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={formData.start_date}
                  onSelect={(date) => date && setFormData({ ...formData, start_date: date })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={formData.end_date}
                  onSelect={(date) => date && setFormData({ ...formData, end_date: date })}
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
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
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  )
} 