import { Heart, MessageCircle, Share2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatNumber } from '@/app/utils/formatNumber'

interface SocialInteractionsProps {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

export function SocialInteractions({ 
  likes, 
  comments, 
  shares, 
  views,
  onLike, 
  onComment, 
  onShare, 
  isLiked 
}: SocialInteractionsProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  const handleLike = () => {
    if (onLike) {
      onLike()
      if (!isLiked) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 1000)
      }
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
        onClick={handleLike}
      >
        <motion.div
          animate={showConfetti ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </motion.div>
        <span>{likes}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={onComment || (() => toast.info('Comment feature coming soon!'))}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{comments}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={onShare || (() => {
          navigator.clipboard.writeText(window.location.href)
          toast.success('Link copied to clipboard!')
        })}
      >
        <Share2 className="h-4 w-4" />
        <span>{shares}</span>
      </Button>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span className="text-sm">{formatNumber(views)}</span>
      </div>
    </div>
  )
} 