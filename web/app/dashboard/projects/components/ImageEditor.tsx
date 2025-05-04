import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Crop, Filter, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react'
import Cropper from 'react-cropper'

interface ImageEditorProps {
  image: File
  onSave: (file: File) => void
  onCancel: () => void
}

const filters = [
  { name: 'Normal', value: 'none' },
  { name: 'Grayscale', value: 'grayscale(100%)' },
  { name: 'Sepia', value: 'sepia(100%)' },
  { name: 'Blur', value: 'blur(2px)' },
  { name: 'Brightness', value: 'brightness(1.2)' },
  { name: 'Contrast', value: 'contrast(1.2)' },
  { name: 'Saturate', value: 'saturate(1.5)' },
]

export function ImageEditor({ image, onSave, onCancel }: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [cropper, setCropper] = useState<Cropper>()
  const [filter, setFilter] = useState('none')
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(image)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  const handleCrop = useCallback(() => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas()
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const croppedFile = new File([blob], image.name, { type: image.type })
          onSave(croppedFile)
        }
      }, image.type)
    }
  }, [cropper, image, onSave])

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
    cropper?.rotate(90)
  }

  const handleZoom = (value: number) => {
    setZoom(value)
    cropper?.zoomTo(value)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Dialog>
      <DialogContent className={`max-w-none ${isFullscreen ? 'w-screen h-screen' : 'max-w-4xl'}`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Edit Image</DialogTitle>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </DialogHeader>
        <div className={`grid ${isFullscreen ? 'grid-cols-2 h-[calc(100vh-8rem)]' : 'grid-cols-1 md:grid-cols-2 gap-4 mt-4'}`}>
          <div className="space-y-4">
            <div className={`relative ${isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-[400px]'} bg-muted rounded-lg overflow-hidden`}>
              <Cropper
                src={imageUrl}
                style={{ height: '100%', width: '100%' }}
                aspectRatio={16 / 9}
                guides={true}
                cropBoxResizable={true}
                cropBoxMovable={true}
                onInitialized={(instance: Cropper) => setCropper(instance)}
                viewMode={1}
                zoomable={true}
                zoomOnTouch={true}
                zoomOnWheel={true}
                background={false}
                responsive={true}
                restore={false}
                checkCrossOrigin={false}
                checkOrientation={false}
                modal={true}
                highlight={true}
                autoCrop={true}
                autoCropArea={1}
                dragMode="move"
                initialAspectRatio={16 / 9}
                preview=".img-preview"
                ready={() => {
                  cropper?.setCropBoxData({
                    width: 400,
                    height: 225
                  })
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Label>Zoom</Label>
                <Slider
                  value={[zoom]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([value]: number[]) => handleZoom(value)}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filter</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  {filters.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={`${isFullscreen ? 'h-[calc(100vh-16rem)]' : 'h-[400px]'} bg-muted rounded-lg overflow-hidden`}>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-contain"
                style={{ filter }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 