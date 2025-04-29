'use client'
import React, { useState } from 'react'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {}
      </DialogContent>
    </Dialog>
  )
}

export default OneMoreThing