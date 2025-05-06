import { Metadata } from 'next'
import { ReelSection } from './components/DashboardSections/ReelSection'
import { EventsSection } from './components/DashboardSections/EventsSection'
import { RecommendedEventsSection } from './components/DashboardSections/RecommendedEventsSection'
import { ProjectsSection } from './components/DashboardSections/ProjectsSection'
import { RecentActivitySection } from './components/DashboardSections/RecentActivitySection'
import { StatsCards } from './components/HomeComponents/stats-cards'
import { Separator } from '@/components/ui/separator'
import IsAuth from '../Auth/IsAuth/IsAuth'
import db from '@/app/Database/Supabase/Base1'
import Footer from '../Home/Footer/Footer'

export const metadata: Metadata = {
  title: {
    absolute: "Dashboard"
  }
}

interface ReelItem {
  entity_id: string;
  title: string;
  description: string;
  total_engagement: number;
}

interface Event {
  entity_id: string;
  title: string;
  description: string;
  total_engagement: number;
  date: string;
}

interface Project {
  entity_id: string;
  title: string;
  description: string;
  total_engagement: number;
}

export default async function DashboardPage() {
  let user: any = await IsAuth(true)
  if(!user) {
    return `Please login - to continue using this dashboard.`
  }

  let recommendations: {
    videos?: ReelItem[];
    events?: Event[];
    projects?: Project[];
  } = {}
  
  let trendingContent = {
    videos: [] as ReelItem[],
    events: [] as Event[],
    projects: [] as Project[]
  }

  try {
    // First try to get personalized recommendations for videos and projects only
    let f = await fetch(`https://fluffy-trout-jp9gq54qr4xhq97x-8000.app.github.dev/recommendations/${user?.user_id}`)
    recommendations = await f.json()

    // Fetch upcoming events from database
    const { data: upcomingEvents, error: eventsError } = await db
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .limit(10)

    if (!eventsError && upcomingEvents) {
      trendingContent.events = upcomingEvents.map(event => ({
        entity_id: event.id,
        title: event.title,
        description: event.description,
        total_engagement: event.total_engagement || 0,
        date: event.date
      }))
    }

    // If recommendations are empty, fetch trending content for videos and projects
    if (!recommendations || Object.keys(recommendations).length === 0) {
      const [videosRes, projectsRes] = await Promise.all([
        fetch('https://fluffy-trout-jp9gq54qr4xhq97x-8000.app.github.dev/trending/video'),
        fetch('https://fluffy-trout-jp9gq54qr4xhq97x-8000.app.github.dev/trending/project')
      ])

      trendingContent = {
        ...trendingContent,
        videos: await videosRes.json(),
        projects: await projectsRes.json()
      }

      // If trending content is empty, fetch most recent content from database
      if (!trendingContent.videos.length) {
        const { data: recentVideos, error: videosError } = await db
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
        if (!videosError) {
          trendingContent.videos = recentVideos.map(video => ({
            entity_id: video.id,
            title: video.title,
            description: video.description,
            total_engagement: video.total_engagement || 0
          }))
        }
      }

      if (!trendingContent.projects.length) {
        const { data: recentProjects, error: projectsError } = await db
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
        if (!projectsError) {
          trendingContent.projects = recentProjects.map(project => ({
            entity_id: project.id,
            title: project.title,
            description: project.description,
            total_engagement: project.total_engagement || 0
          }))
        }
      }
    }

    return (
      <>
        <div className="px-4 pt-6 pb-4">
          <StatsCards />
          <Separator className="my-4" />
    
          <div className="grid_set gap-1">
            <EventsSection recommendations={trendingContent.events} />
            <ProjectsSection recommendations={recommendations.projects || trendingContent.projects} />
            <ReelSection recommendations={recommendations.videos || trendingContent.videos} />
          </div>
          <Separator className='my-4'/>
          <RecommendedEventsSection recommendations={recommendations.events || []} />
        </div>
      </>
    )
  }
  catch (error) {
    console.error('Error fetching dashboard data:', error)
    return "Something went wrong. It is our fault. Please reload your page to see if you get the fix."
  }
}
