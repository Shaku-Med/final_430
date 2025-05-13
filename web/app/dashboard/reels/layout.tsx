'use client'

import { ReactNode } from 'react'

export default function ReelsLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <div className="h-screen w-full bg-black">
      {children}
    </div>
  )
} 