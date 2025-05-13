import { LikeButton } from './LikeButton'
import { CommentButton } from './CommentButton'
import { ShareButton } from './ShareButton'
import { Eye } from 'lucide-react'
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
  return (
    <div className="flex items-center gap-4">
      <LikeButton likes={likes} onLike={onLike} isLiked={isLiked} />
      <CommentButton comments={comments} onComment={onComment} />
      <ShareButton shares={shares} onShare={onShare} />
      <div className="flex items-center gap-1 text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span className="text-sm">{formatNumber(views)}</span>
      </div>
    </div>
  )
} 