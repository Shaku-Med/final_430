import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/app/utils/formatNumber'

interface ShareButtonProps {
  shares: number;
  onShare?: () => void;
}

export function ShareButton({ shares, onShare }: ShareButtonProps) {
  return (
    <Button 
      variant="ghost" 
      className="flex-1 flex items-center justify-center gap-2 hover:bg-purple-50 rounded-md"
      onClick={onShare}
    >
      <Share2 className="h-5 w-5 text-gray-500" />
      <span className="text-gray-600">{formatNumber(shares)}</span>
    </Button>
  )
} 