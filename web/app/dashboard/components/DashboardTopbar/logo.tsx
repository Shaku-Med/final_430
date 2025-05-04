'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';
import Logo from '@/app/Home/Icons/Logo';

interface TL {
  route?: string;
}
export const TopbarLogo: React.FC = ({route}:TL) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [intensity, setIntensity] = useState(0);
  
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setIsGlowing(prev => !prev);
      setIntensity(Math.random() * 0.5 + 0.5);
    }, 1000 + Math.random() * 2000);
    
    return () => clearInterval(flickerInterval);
  }, []);

  return (
    <Link href={`${route || `/dashboard`}`} className="flex items-center gap-1">
      <Logo svgClassName="w-13 h-13" pathClassName="fill-foreground"/>
      <div className="flex items-center gap-1">
        <span className="font-semibold hidden sm:inline">SpotLight</span>
        <div className="relative">
          <Lightbulb 
            size={14} 
            className={`text-foreground transition-all duration-300 ${isGlowing ? 'scale-110' : 'scale-100'}`}
            style={{
              filter: isGlowing ? `drop-shadow(0 0 ${intensity * 5}px rgb(var(--foreground))` : 'none',
              opacity: 0.7 + (isGlowing ? intensity * 0.3 : 0)
            }}
          />
          {isGlowing && (
            <div 
              className="absolute inset-0 rounded-full animate-pulse" 
              style={{
                backgroundColor: 'var(--foreground)',
                filter: `blur(${intensity * 3}px)`,
                transform: 'scale(1.3)',
                opacity: intensity * 0.7
              }}
            />
          )}
        </div>
      </div>
    </Link>
  );
};