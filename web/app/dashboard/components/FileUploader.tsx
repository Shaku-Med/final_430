import { useState, useCallback } from 'react'
import { Upload, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export interface UploadedFile {
  id: string
  file: File
  path: string
  url: string
  progress: number
  status: 'uploading' | 'completed' | 'error' | 'temporary'
  error?: string
  temporaryId?: string
}

interface FileUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: string
}

export function FileUploader({
  onFilesChange,
  maxFiles = 5,
  maxSize = 200 * 1024 * 1024, // 200MB default
  accept = '*/*'
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('isTemporary', 'true')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return {
        id: crypto.randomUUID(),
        file,
        path: data.path,
        url: data.url,
        progress: 100,
        status: 'temporary' as const,
        temporaryId: data.temporaryId
      }
    } catch (error) {
      return {
        id: crypto.randomUUID(),
        file,
        path: '',
        url: '',
        progress: 0,
        status: 'error' as const,
        error: 'Upload failed'
      }
    }
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    const oversizedFiles = newFiles.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the maximum size of ${maxSize / (1024 * 1024)}MB`)
      return
    }

    setIsUploading(true)

    // Create initial file entries with uploading status
    const initialFiles = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      path: '',
      url: '',
      progress: 0,
      status: 'uploading' as const
    }))

    // Update state with initial files
    const updatedFiles = [...files, ...initialFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)

    // Upload files sequentially
    for (let i = 0; i < newFiles.length; i++) {
      const uploadedFile = await uploadFile(newFiles[i])
      
      // Update the specific file in the state
      setFiles(prevFiles => {
        const newFiles = prevFiles.map(f => 
          f.id === initialFiles[i].id ? uploadedFile : f
        )
        onFilesChange(newFiles)
        return newFiles
      })
    }

    setIsUploading(false)
  }, [files, maxFiles, maxSize, onFilesChange])

  const removeFile = useCallback((id: string) => {
    const updatedFiles = files.filter(file => file.id !== id)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, onFilesChange])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, {maxSize / (1024 * 1024)}MB each
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept={accept}
            disabled={isUploading}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={file.status === 'uploading' ? 50 : file.progress} 
                    className="h-1" 
                  />
                  {file.status === 'completed' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {file.status === 'temporary' && (
                    <span className="text-xs text-yellow-500">Temporary</span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-xs text-red-500">{file.error}</span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(file.id)}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 