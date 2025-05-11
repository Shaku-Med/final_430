import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/app/utils/formatNumber'

interface CommentButtonProps {
  comments: number;
  onComment?: () => void;
}

export function CommentButton({ comments, onComment }: CommentButtonProps) {
  return (
    <Button 
      variant="ghost" 
      className="flex-1 flex items-center justify-center gap-2 hover:bg-green-50 rounded-md"
      onClick={onComment}
    >
      <MessageCircle className="h-5 w-5 text-gray-500" />
      <span className="text-gray-600">{formatNumber(comments)}</span>
    </Button>
  )
} 