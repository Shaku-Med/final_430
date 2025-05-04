import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Activity, Play, Heart, MessageCircle, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ReelItem {
  id: string
  title: string
  thumbnail: string
  author: {
    name: string
    avatar: string
  }
  likes: number
  comments: number
  shares: number
  timestamp: string
  tags: string[]
}

const sampleReels: ReelItem[] = [
  {
    id: '1',
    title: 'Science Project Showcase',
    thumbnail: '/placeholder.jpg',
    author: {
      name: 'John Doe',
      avatar: '/avatar1.jpg'
    },
    likes: 245,
    comments: 32,
    shares: 12,
    timestamp: '2 days ago',
    tags: ['Science', 'Innovation']
  },
  // Add more sample reels...
]

export const ReelSection = () => {
  return (
    <Card className="col-span-1 md:col-span-2">
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
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleReels.map((reel) => (
              <div key={reel.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-muted">
                  <img 
                    src={reel.thumbnail} 
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Play className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reel.author.avatar} />
                      <AvatarFallback>{reel.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{reel.title}</h3>
                      <p className="text-sm text-muted-foreground">{reel.author.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {reel.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{reel.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{reel.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>{reel.shares}</span>
                      </div>
                    </div>
                    <span>{reel.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 