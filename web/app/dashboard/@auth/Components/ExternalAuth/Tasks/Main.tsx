'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, EyeOff, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OneMoreThingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modalType?: string;
}

const OneMoreThing: React.FC<OneMoreThingProps> = ({
  open,
  onOpenChange,
  modalType
}) => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (modalType === 'verify') {
      router.push('/account/verify')
      onOpenChange(false)
    }
  }, [modalType, router, onOpenChange])

  const handleSubmit = async () => {
    if (!password) {
      toast.error('Please enter your password')
      return
    }

    setIsLoading(true)
    try {
      // Here you would typically make an API call to verify the password
      // For example:
      // await verifyPassword(password)
      
      toast.success('Password verified successfully')
      onOpenChange(false)
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      toast.error('Invalid password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (modalType === 'verify') {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Password</DialogTitle>
          <DialogDescription>
            Please enter your password to continue
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default OneMoreThing