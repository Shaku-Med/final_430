import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Activity, Play, Heart, MessageCircle, Share2, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

interface ReelItem {
  entity_id: string
  title: string
  description: string
  total_engagement: number
}

interface ReelSectionProps {
  recommendations: ReelItem[]
}

export const ReelSection = ({ recommendations }: ReelSectionProps) => {
  return (
    <Card className="col-span-1 md:col-span-2 flex_grid">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Student Reels
        </CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
            <p className="text-lg font-medium mb-2">No reels found</p>
            <p className="text-muted-foreground mb-4">Be the first to share your project or experience!</p>
            <Link href="/dashboard/reels/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Reel
              </Button>
            </Link>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((reel) => (
                <div key={reel.entity_id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-muted">
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{reel.title[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{reel.title}</h3>
                        <p className="text-sm text-muted-foreground">{reel.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{reel.total_engagement}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
} 