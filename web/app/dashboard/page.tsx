import { Metadata } from 'next'
import { ReelSection } from './components/DashboardSections/ReelSection'
import { EventsSection } from './components/DashboardSections/EventsSection'
import { ProjectsSection } from './components/DashboardSections/ProjectsSection'
import { RecentActivitySection } from './components/DashboardSections/RecentActivitySection'
import { StatsCards } from './components/HomeComponents/stats-cards'
import { DashboardHeader } from './components/HomeComponents/dashboard-header'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: {
    absolute: "Dashboard"
  }
}

export default function DashboardPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <DashboardHeader heading="Student Spotlight Dashboard" text="Manage student events and projects in one place." />
      
      <div className="px-2 grid_bx gap-2 mb-4">
        <StatsCards />
      </div>
      <Separator className="my-4" />

      <div className="">
        <ReelSection />
        <EventsSection />
        <ProjectsSection />
        <RecentActivitySection />
      </div>
    </div>
  )
}
