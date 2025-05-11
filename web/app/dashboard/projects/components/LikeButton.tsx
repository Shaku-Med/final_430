import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { formatNumber } from '@/app/utils/formatNumber'

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
})

interface LikeButtonProps {
  likes: number;
  onLike?: () => void;
}

export function LikeButton({ likes, onLike }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isClickDisabled, setIsClickDisabled] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLike = useCallback(() => {
    if (isClickDisabled) return;

    setIsClickDisabled(true);
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    if (!isLiked) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    onLike?.()

    // Re-enable clicking after 500ms
    setTimeout(() => {
      setIsClickDisabled(false);
    }, 500);
  }, [isLiked, isClickDisabled, onLike]);

  return (
    <>
      <AnimatePresence>
        {showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
            colors={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']}
          />
        )}
      </AnimatePresence>
      <Button 
        variant="ghost" 
        className="flex-1 flex items-center justify-center gap-2 rounded-md relative"
        onClick={handleLike}
        disabled={isClickDisabled}
      >
        <motion.div
          animate={{
            scale: isLiked ? [1, 1.2, 1] : 1,
            color: isLiked ? '#3b82f6' : '#6b7280'
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart className="h-5 w-5" fill={isLiked ? '#3b82f6' : 'none'} />
        </motion.div>
        <span className={`${isLiked ? 'text-blue-500' : 'text-gray-600'}`}>
          {formatNumber(likeCount)}
        </span>
      </Button>
    </>
  )
} 