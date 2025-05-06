
import { CalendarClock, ChartBar, GraduationCap, Trophy, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "./dashboard-header"
import { Progress } from "@/components/ui/progress"

interface StatsData {
  last_7_days: {
    event: { total_entities: number; total_engagement: number; avg_engagement: number };
    project: { total_entities: number; total_engagement: number; avg_engagement: number };
    video: { total_entities: number; total_engagement: number; avg_engagement: number };
  };
  last_30_days: {
    event: { total_entities: number; total_engagement: number; avg_engagement: number };
    project: { total_entities: number; total_engagement: number; avg_engagement: number };
    video: { total_entities: number; total_engagement: number; avg_engagement: number };
  };
  last_90_days: {
    event: { total_entities: number; total_engagement: number; avg_engagement: number };
    project: { total_entities: number; total_engagement: number; avg_engagement: number };
    video: { total_entities: number; total_engagement: number; avg_engagement: number };
  };
}

export async function StatsCards() {
  try {
    let f = await fetch(`https://fluffy-trout-jp9gq54qr4xhq97x-8000.app.github.dev/stats/overview`, {
      cache: `no-cache`
    })
    const data: StatsData = await f.json()
    
    // Calculate total entities for progress bar
    const totalEntities = 
      data.last_7_days.event.total_entities + 
      data.last_7_days.project.total_entities + 
      data.last_7_days.video.total_entities;
    
    const eventPercentage = (data.last_7_days.event.total_entities / totalEntities) * 100;
    const projectPercentage = (data.last_7_days.project.total_entities / totalEntities) * 100;
    const videoPercentage = (data.last_7_days.video.total_entities / totalEntities) * 100;

    return (
      <>
        <DashboardHeader heading="Student Spotlight Dashboard" text="Manage student events and projects in one place." />

        <div className="px-2 grid_bx gap-2 mb-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">Content Distribution</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Events</span>
                  <span>{data.last_7_days.event.total_entities}</span>
                </div>
                <Progress value={eventPercentage} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Projects</span>
                  <span>{data.last_7_days.project.total_entities}</span>
                </div>
                <Progress value={projectPercentage} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Videos</span>
                  <span>{data.last_7_days.video.total_entities}</span>
                </div>
                <Progress value={videoPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">7-Day Engagement</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold line-clamp-1">
                {data.last_7_days.video.total_engagement}
              </div>
              <p className="text-xs line-clamp-1 text-muted-foreground">
                Average: {data.last_7_days.video.avg_engagement.toFixed(1)} per video
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">30-Day Engagement</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold line-clamp-1">
                {data.last_30_days.video.total_engagement}
              </div>
              <p className="text-xs line-clamp-1 text-muted-foreground">
                Average: {data.last_30_days.video.avg_engagement.toFixed(1)} per video
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">90-Day Engagement</CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold line-clamp-1">
                {data.last_90_days.video.total_engagement}
              </div>
              <p className="text-xs line-clamp-1 text-muted-foreground">
                Average: {data.last_90_days.video.avg_engagement.toFixed(1)} per video
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }
  catch {
    return ''
  }
}
