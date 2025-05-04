import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ImagePlus, X } from 'lucide-react'
import { ImageEditor } from './ImageEditor'

interface ThumbnailUploadProps {
  value: File | null
  onChange: (file: File | null) => void
}

export function ThumbnailUpload({ value, onChange }: ThumbnailUploadProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl('')
    }
  }, [value])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('image/')) {
      onChange(file)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  })

  const handleSave = (file: File) => {
    onChange(file)
    setShowEditor(false)
  }

  return (
    <div className="space-y-2">
      <Label>Thumbnail</Label>
      <div className="flex items-center gap-4">
        <div
          {...getRootProps()}
          className={`flex-1 h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
            </p>
          </div>
        </div>
        {value && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Thumbnail"
              className="h-32 w-32 object-cover rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {value && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>
            Edit
          </Button>
        </div>
      )}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Thumbnail</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
      {value && showEditor && (
        <ImageEditor
          image={value}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  )
} 