'use client'

import { ReactNode } from 'react'

export default function ReelsLayout({
  children,
  reel
}: {
  children: ReactNode
  reel: ReactNode
}) {
  return (
    <div className="h-screen w-full bg-black">
      {children}
      {reel}
    </div>
  )
} 