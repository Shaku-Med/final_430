'use client'
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
  isLiked?: boolean;
}

export function LikeButton({ likes, onLike, isLiked: initialIsLiked = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
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

  useEffect(() => {
    setLikeCount(likes)
  }, [likes])

  useEffect(() => {
    setIsLiked(initialIsLiked)
  }, [initialIsLiked])

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
    <div className="relative">
      <AnimatePresence>
        {showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}
      </AnimatePresence>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
      >
        <motion.div
          animate={{
            scale: isLiked ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </motion.div>
        <span>{likeCount > 0 ? formatNumber(likeCount) : ''}</span>
      </Button>
    </div>
  )
} 