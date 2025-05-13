import type React from "react"
interface DashboardHeaderProps {
  heading?: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between px-2 pb-4 gap-3`}>
      <div className="grid gap-1">
        <h1 className={`text-xl md:text-2xl font-bold tracking-tight`}>{heading}</h1>
        {text && <p className={`text-sm md:text-base text-gray-500`}>{text}</p>}
      </div>
      {children}
    </div>
  )
}
