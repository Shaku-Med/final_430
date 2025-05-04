import { CalendarClock, GraduationCap, Trophy, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatsCards() {
  return (
    <>
      <Card className={`shadow-xs`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium line-clamp-1">Total Events</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold line-clamp-1">2,400,000,000,000,000</div>
          <p className="text-xs line-clamp-1 text-muted-foreground">+2 from last month</p>
        </CardContent>
      </Card>
      <Card className={`shadow-xs`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium line-clamp-1">Active Projects</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold line-clamp-1">42</div>
          <p className="text-xs line-clamp-1 text-muted-foreground">+8 from last month</p>
        </CardContent>
      </Card>
      <Card className={`shadow-xs`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium line-clamp-1">Student Participants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold line-clamp-1">128</div>
          <p className="text-xs line-clamp-1 text-muted-foreground">+12 from last month</p>
        </CardContent>
      </Card>
      <Card className={`shadow-xs`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium line-clamp-1">Awards Given</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold line-clamp-1">16</div>
          <p className="text-xs line-clamp-1 text-muted-foreground">+4 from last month</p>
        </CardContent>
      </Card>
    </>
  )
}
