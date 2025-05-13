'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Logo from '@/app/Home/Icons/Logo'
import { Lightbulb, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Interactive background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (password === 'admin123') {
      localStorage.setItem('adminAuthenticated', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Invalid password')
    }
    setIsLoading(false)
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted relative overflow-hidden"
    >
      {/* Interactive Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(var(--primary),0.1),transparent)]" />
        
        {/* Floating Orbs */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute orbe"
            style={{
              '--index': i,
              '--mouse-x': mousePosition.x,
              '--mouse-y': mousePosition.y
            } as React.CSSProperties}
          />
        ))}

        {/* Interactive Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full grid-pattern" />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-primary/30 animate-float-slow" />
      <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-primary/20 animate-float-fast" />
      <div className="absolute bottom-40 left-40 w-2 h-2 rounded-full bg-primary/40 animate-float-medium" />

      {/* Login Card */}
      <Card className="w-[400px] relative z-10 bg-card/95 backdrop-blur-lg border-muted shadow-2xl transition-all duration-300 hover:shadow-primary/10 hover:shadow-2xl">
        <CardHeader className="space-y-4 pb-3">
          <div className="flex justify-center">
            <div className="flex items-center gap-1 group">
              <div className="relative">
                <Logo svgClassName="w-12 h-12 transition-transform duration-300 group-hover:scale-110" pathClassName="fill-foreground"/>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  SpotLight
                </span>
                <Lightbulb size={14} className="text-primary transition-all duration-300 group-hover:text-yellow-500 group-hover:animate-pulse"/>
              </div>
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10 transition-all duration-200 focus:shadow-md focus:shadow-primary/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full relative overflow-hidden group"
              disabled={isLoading}
            >
              <span className={`transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Login
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Forgot your password? Contact administrator
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .orbe {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle at center, 
            hsl(var(--primary) / 0.3) 0%, 
            hsl(var(--primary) / 0.15) 40%,
            transparent 70%);
          animation: orbit 12s linear infinite, pulse 3s ease-in-out infinite;
          animation-delay: calc(var(--index) * -2s);
          filter: blur(1px);
          transition: transform 0.3s ease;
          will-change: transform;
        }

        .orbe:hover {
          transform: scale(1.1);
          background: radial-gradient(circle at center, 
            hsl(var(--primary) / 0.5) 0%, 
            hsl(var(--primary) / 0.25) 40%,
            transparent 70%);
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(200px) rotate(0deg) translateY(var(--index) * 20px);
          }
          100% {
            transform: rotate(360deg) translateX(200px) rotate(-360deg) translateY(var(--index) * 20px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .grid-pattern {
          background-image: 
            linear-gradient(hsl(var(--muted)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--muted)) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        /* Add mouse follower effect to orbs */
        .orbe {
          transform: translate(
            calc((var(--mouse-x, 0) - 50vw) * 0.03),
            calc((var(--mouse-y, 0) - 50vh) * 0.03)
          );
        }
      `}</style>
    </div>
  )
}

export default Login