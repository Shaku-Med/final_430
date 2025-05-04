import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import Link from 'next/link'
import { AudioMetadata } from './AudioMetadata'

interface FilePreviewDialogProps {
  file: globalThis.File
  onRemove: () => void
}

export function FilePreviewDialog({ file, onRemove }: FilePreviewDialogProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const isImage = file?.type.startsWith('image/')
  const isVideo = file?.type.startsWith('video/')
  const isAudio = file?.type.startsWith('audio/')

  return (
    <div className="relative group">
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <div className="h-15 min-w-15 max-w-15 border rounded-lg overflow-hidden cursor-pointer">
            {isImage ? (
              <img
                src={url}
                alt={file.name}
                className="w-full h-full object-cover "
              />
            ) : (
              <div className="w-full h-full flex items-center flex-col gap-2 justify-center bg-muted">
                <p title={`${file?.name}`} className="text-sm text-muted-foreground line-clamp-1 px-2">
                  {file?.name}
                </p>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="w-full min-h-full overflow-auto rounded-none border-none min-w-full">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 h-full w-full">
            {isImage ? (
              <img
                src={url}
                alt={file.name}
                className="w-full absolute top-0 left-0 max-h-full h-full object-contain"
              />
            ) : isVideo ? (
              <video
                src={url}
                controls
                playsInline
                autoPlay
                disablePictureInPicture
                className="w-full absolute top-0 left-0 max-h-full h-full"
              />
            ) : isAudio ? (
              <div className="flex flex-col gap-4">
                <audio
                  src={url}
                  controls
                  className="w-full"
                />
                <AudioMetadata file={file} />
              </div>
            ) : (
              <div className="w-full h-32 flex flex-col gap-2 items-center justify-center bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {file.name}
                </p>
                <div>
                  <Link href={`${url}`} target={`_blank`} className='text-blue-500 font-bold'>View File</Link>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}