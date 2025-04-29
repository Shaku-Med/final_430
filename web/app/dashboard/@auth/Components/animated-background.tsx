"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
  life: number
  maxLife: number
  angle: number
  distance: number
  orbitSpeed: number
}

interface GridCell {
  x: number
  y: number
  highlight: number
  active: boolean
  distortion: number
  angle: number
}

interface ShootingStar {
  x: number
  y: number
  direction: "horizontal" | "vertical" | "radial"
  isPositive: boolean
  gridLine: number
  speed: number
  color: string
  trail: { x: number; y: number; opacity: number }[]
  trailLength: number
  angle?: number
  targetX?: number
  targetY?: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const particlesRef = useRef<Particle[]>([])
  const gridRef = useRef<GridCell[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const animationFrameRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const gridSizeRef = useRef<number>(30)
  const colorCycleRef = useRef<number>(0)
  const interactionRadiusRef = useRef<number>(120)
  const lastStarTimeRef = useRef<number>(0)

  // Black hole properties
  const blackHoleRef = useRef<any>({
    x: 0,
    y: 0,
    radius: 15,
    pullRadius: 500,
    active: false,
    intensity: 0,
    maxIntensity: 1,
    growSpeed: 0.02,
    particleAcceleration: 0.15,
    eventHorizon: 30,
    rotationSpeed: 0.01,
    distortionFactor: 2,
    consumedParticles: [],
    maxParticles: 50,
    exploding: false,
    explosionProgress: 0,
    explosionDuration: 60,
  })

  const detectTheme = () => {
    if (typeof document !== "undefined") {
      const htmlElement = document.documentElement
      const bodyElement = document.body

      if (
        bodyElement.classList.contains("light") ||
        (bodyElement.classList.contains("system") && !window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        setTheme("light")
      } else if (
        bodyElement.classList.contains("dark") ||
        (bodyElement.classList.contains("system") && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        setTheme("dark")
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark")
      } else {
        setTheme("light")
      }
    }
  }

  useEffect(() => {
    detectTheme()

    const updateDimensions = () => {
      if (typeof window !== "undefined") {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    const handleThemeChange = () => {
      detectTheme()
    }

    const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)")
    systemThemeMedia.addEventListener("change", handleThemeChange)

    const observer = new MutationObserver(handleThemeChange)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    })

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
      systemThemeMedia.removeEventListener("change", handleThemeChange)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    // Initialize black hole at center of screen
    blackHoleRef.current = {
      ...blackHoleRef.current,
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      active: true,
      intensity: 0,
    }

    const gridSize = gridSizeRef.current
    const grid: GridCell[] = []

    for (let x = 0; x < dimensions.width; x += gridSize) {
      for (let y = 0; y < dimensions.height; y += gridSize) {
        // Calculate angle and distance from black hole
        const dx = x + gridSize / 2 - blackHoleRef.current.x
        const dy = y + gridSize / 2 - blackHoleRef.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)

        grid.push({
          x,
          y,
          highlight: 0,
          active: false,
          distortion: 0,
          angle,
        })
      }
    }
    gridRef.current = grid

    const particles: Particle[] = []
    const particleCount = Math.min(Math.floor((dimensions.width * dimensions.height) / 10000), 150)

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * dimensions.width
      const y = Math.random() * dimensions.height
      const dx = x - blackHoleRef.current.x
      const dy = y - blackHoleRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)

      particles.push({
        x,
        y,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: getRandomColor(0.6),
        opacity: Math.random() * 0.5 + 0.1,
        life: 100,
        maxLife: 100,
        angle,
        distance,
        orbitSpeed: Math.random() * 0.01 + 0.005,
      })
    }
    particlesRef.current = particles
    shootingStarsRef.current = []

    startAnimation()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [dimensions, theme])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })

      updateGridInteraction(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        setMousePosition({
          x: touch.clientX,
          y: touch.clientY,
        })

        updateGridInteraction(touch.clientX, touch.clientY)
      }
    }

    const handleClick = (e: MouseEvent) => {
      createRipple(e.clientX, e.clientY)
      createShootingStar(e.clientX, e.clientY)

      // Move black hole on click
      blackHoleRef.current = {
        ...blackHoleRef.current,
        x: e.clientX,
        y: e.clientY,
        intensity: blackHoleRef.current.maxIntensity,
      }

      // Update grid cells' angles relative to new black hole position
      gridRef.current.forEach((cell) => {
        const dx = cell.x + gridSizeRef.current / 2 - blackHoleRef.current.x
        const dy = cell.y + gridSizeRef.current / 2 - blackHoleRef.current.y
        cell.angle = Math.atan2(dy, dx)
      })
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        createRipple(touch.clientX, touch.clientY)
        createShootingStar(touch.clientX, touch.clientY)

        // Move black hole on touch
        blackHoleRef.current = {
          ...blackHoleRef.current,
          x: touch.clientX,
          y: touch.clientY,
          intensity: blackHoleRef.current.maxIntensity,
        }

        // Update grid cells' angles relative to new black hole position
        gridRef.current.forEach((cell) => {
          const dx = cell.x + gridSizeRef.current / 2 - blackHoleRef.current.x
          const dy = cell.y + gridSizeRef.current / 2 - blackHoleRef.current.y
          cell.angle = Math.atan2(dy, dx)
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("click", handleClick)
    window.addEventListener("touchstart", handleTouchStart)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("touchstart", handleTouchStart)
    }
  }, [theme])

  const updateGridInteraction = (x: number, y: number) => {
    const interactionRadius = interactionRadiusRef.current

    gridRef.current.forEach((cell) => {
      const cellCenterX = cell.x + gridSizeRef.current / 2
      const cellCenterY = cell.y + gridSizeRef.current / 2
      const dx = x - cellCenterX
      const dy = y - cellCenterY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < interactionRadius) {
        const intensity = 1 - distance / interactionRadius
        cell.highlight = Math.max(cell.highlight, intensity * 5)
        cell.active = true
      } else {
        cell.active = false
      }

      // Calculate distortion based on black hole
      const dxBlackHole = cellCenterX - blackHoleRef.current.x
      const dyBlackHole = cellCenterY - blackHoleRef.current.y
      const distanceToBlackHole = Math.sqrt(dxBlackHole * dxBlackHole + dyBlackHole * dyBlackHole)

      if (distanceToBlackHole < blackHoleRef.current.pullRadius) {
        const distortionIntensity = 1 - distanceToBlackHole / blackHoleRef.current.pullRadius
        cell.distortion = distortionIntensity * blackHoleRef.current.distortionFactor * blackHoleRef.current.intensity
      } else {
        cell.distortion = 0
      }
    })
  }

  const createRipple = (x: number, y: number) => {
    const particleCount = 20
    const radius = 50

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const distance = Math.random() * radius

      particlesRef.current.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size: 3 + Math.random() * 4,
        speedX: Math.cos(angle) * (1 + Math.random()),
        speedY: Math.sin(angle) * (1 + Math.random()),
        color: getRandomColor(0.8),
        opacity: 0.8,
        life: 60 + Math.random() * 40,
        maxLife: 100,
        angle,
        distance,
        orbitSpeed: Math.random() * 0.02 + 0.01,
      })
    }

    gridRef.current.forEach((cell) => {
      const cellCenterX = cell.x + gridSizeRef.current / 2
      const cellCenterY = cell.y + gridSizeRef.current / 2
      const dx = x - cellCenterX
      const dy = y - cellCenterY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        const intensity = 1 - distance / 100
        cell.highlight = Math.max(cell.highlight, intensity * 10)
      }
    })
  }

  const createShootingStar = (x?: number, y?: number) => {
    const gridSize = gridSizeRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    let direction: "horizontal" | "vertical" | "radial"
    let isPositive: boolean
    let gridLine: number
    let startX: number
    let startY: number
    let targetX: number | any
    let targetY: number | any
    let angle: number | any

    // 50% chance to create a star that gets pulled into the black hole
    if (blackHoleRef.current.active && Math.random() < 0.5) {
      direction = "radial"
      isPositive = false // Moving toward black hole
      gridLine = 0 // Not used for radial

      // Start from edge of screen
      const edgeAngle = Math.random() * Math.PI * 2
      startX = canvas.width / 2 + Math.cos(edgeAngle) * (canvas.width / 2 + 50)
      startY = canvas.height / 2 + Math.sin(edgeAngle) * (canvas.height / 2 + 50)

      targetX = blackHoleRef.current.x
      targetY = blackHoleRef.current.y
      angle = Math.atan2(targetY - startY, targetX - startX)
    } else if (x !== undefined && y !== undefined) {
      const nearestHorizontalLine = Math.round(y / gridSize) * gridSize
      const nearestVerticalLine = Math.round(x / gridSize) * gridSize

      const distToHorizontal = Math.abs(y - nearestHorizontalLine)
      const distToVertical = Math.abs(x - nearestVerticalLine)

      if (distToHorizontal < distToVertical) {
        direction = "horizontal"
        gridLine = nearestHorizontalLine
        isPositive = Math.random() > 0.5
        startX = isPositive ? 0 : canvas.width
        startY = gridLine
      } else {
        direction = "vertical"
        gridLine = nearestVerticalLine
        isPositive = Math.random() > 0.5
        startX = gridLine
        startY = isPositive ? 0 : canvas.height
      }
    } else {
      const side = Math.floor(Math.random() * 4)

      switch (side) {
        case 0:
          direction = "horizontal"
          gridLine = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
          isPositive = Math.random() > 0.5
          startX = isPositive ? 0 : canvas.width
          startY = gridLine
          break
        case 1:
          direction = "vertical"
          gridLine = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize
          isPositive = Math.random() > 0.5
          startX = gridLine
          startY = isPositive ? 0 : canvas.height
          break
        case 2:
          direction = "horizontal"
          gridLine = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
          isPositive = Math.random() > 0.5
          startX = isPositive ? 0 : canvas.width
          startY = gridLine
          break
        case 3:
          direction = "vertical"
          gridLine = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize
          isPositive = Math.random() > 0.5
          startX = gridLine
          startY = isPositive ? 0 : canvas.height
          break
        default:
          direction = "horizontal"
          gridLine = 0
          isPositive = true
          startX = 0
          startY = 0
      }
    }

    const star: ShootingStar = {
      x: startX,
      y: startY,
      direction,
      isPositive,
      gridLine,
      speed: 5 + Math.random() * 10,
      color: getRandomColor(1),
      trail: [],
      trailLength: 20 + Math.floor(Math.random() * 15),
      angle,
      targetX,
      targetY,
    }

    shootingStarsRef.current.push(star)
  }

  const getRandomColor = (alpha = 1) => {
    const baseHue = theme === "dark" ? 210 : 30
    const hueRange = 120
    const hue = baseHue - hueRange / 2 + Math.floor(Math.random() * hueRange)

    const saturation = theme === "dark" ? 70 + Math.random() * 30 : 60 + Math.random() * 30

    const lightness = theme === "dark" ? 50 + Math.random() * 10 : 40 + Math.random() * 20

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
  }

  const getCyclingColor = (offset = 0) => {
    const baseHue = theme === "dark" ? 210 : 30
    const hueRange = 60
    const hue = (baseHue - hueRange / 2 + ((colorCycleRef.current + offset) % hueRange)) % 360

    const saturation = theme === "dark" ? 80 : 70
    const lightness = theme === "dark" ? 60 : 50

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const getGridLineColor = () => {
    return theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"
  }

  const getBlackHoleGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(
      blackHoleRef.current.x,
      blackHoleRef.current.y,
      0,
      blackHoleRef.current.x,
      blackHoleRef.current.y,
      blackHoleRef.current.radius * 2,
    )

    gradient.addColorStop(0, theme === "dark" ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.9)")
    gradient.addColorStop(0.4, theme === "dark" ? "rgba(20, 20, 40, 0.8)" : "rgba(20, 20, 40, 0.7)")
    gradient.addColorStop(0.8, theme === "dark" ? "rgba(50, 50, 100, 0.4)" : "rgba(50, 50, 100, 0.3)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

    return gradient
  }

  const startAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gridSize = gridSizeRef.current

    const animate = (timestamp: number) => {
      if (!canvas) return

      timeRef.current = timestamp / 1000
      colorCycleRef.current = (colorCycleRef.current + 0.5) % 360

      // Gradually increase black hole intensity
      if (blackHoleRef.current.active && blackHoleRef.current.intensity < blackHoleRef.current.maxIntensity) {
        blackHoleRef.current.intensity += blackHoleRef.current.growSpeed
      }

      if (timestamp - lastStarTimeRef.current > 100 && Math.random() < 0.1) {
        createShootingStar()
        lastStarTimeRef.current = timestamp
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw distorted grid
      gridRef.current.forEach((cell) => {
        // Apply distortion based on black hole
        let cellX = cell.x
        let cellY = cell.y
        let cellWidth = gridSize
        let cellHeight = gridSize

        if (cell.distortion > 0) {
          const cellCenterX = cell.x + gridSize / 2
          const cellCenterY = cell.y + gridSize / 2
          const dx = cellCenterX - blackHoleRef.current.x
          const dy = cellCenterY - blackHoleRef.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Calculate distortion amount based on distance to black hole
          const distortionAmount = cell.distortion * (1 - Math.min(1, distance / blackHoleRef.current.pullRadius))

          // Move cell toward black hole
          const angle = Math.atan2(dy, dx)
          const distortionX = Math.cos(angle) * distortionAmount * 20
          const distortionY = Math.sin(angle) * distortionAmount * 20

          cellX -= distortionX
          cellY -= distortionY

          // Stretch cell toward black hole
          if (distance < blackHoleRef.current.pullRadius * 0.5) {
            const stretchFactor = 1 + distortionAmount * 2
            cellWidth *= Math.abs(Math.cos(angle)) < 0.5 ? stretchFactor : 1
            cellHeight *= Math.abs(Math.sin(angle)) < 0.5 ? stretchFactor : 1
          }
        }

        ctx.strokeStyle = getGridLineColor()
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.rect(cellX, cellY, cellWidth, cellHeight)
        ctx.stroke()

        if (cell.highlight > 0) {
          const color = getCyclingColor(cell.x + cell.y)
          ctx.fillStyle = `${color.replace("hsl", "hsla").replace(")", ", " + cell.highlight / 10 + ")")}`
          ctx.fillRect(cellX, cellY, cellWidth, cellHeight)

          cell.highlight -= 0.1
        }

        if (cell.active) {
          ctx.fillStyle = `${getCyclingColor(cell.x * 0.5)
            .replace("hsl", "hsla")
            .replace(")", ", 0.1)")}`
          ctx.fillRect(cellX, cellY, cellWidth, cellHeight)
        }
      })

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        if (particle.life < particle.maxLife) {
          particle.life -= 1
          particle.opacity = particle.life / particle.maxLife

          if (particle.life <= 0) return false
        }

        // Calculate distance to black hole
        const dx = particle.x - blackHoleRef.current.x
        const dy = particle.y - blackHoleRef.current.y
        const distanceToBlackHole = Math.sqrt(dx * dx + dy * dy)
        const angleToBlackHole = Math.atan2(dy, dx)

        // Update particle position based on black hole pull
        if (blackHoleRef.current.active && distanceToBlackHole < blackHoleRef.current.pullRadius) {
          // Calculate pull strength based on distance (stronger as it gets closer)
          const pullStrength =
            blackHoleRef.current.particleAcceleration *
            (1 - Math.min(1, distanceToBlackHole / blackHoleRef.current.pullRadius)) *
            blackHoleRef.current.intensity

          // If very close to black hole, start orbiting
          if (distanceToBlackHole < blackHoleRef.current.eventHorizon) {
            // Update orbit angle
            particle.angle += particle.orbitSpeed * (blackHoleRef.current.eventHorizon / distanceToBlackHole)

            // Calculate new position based on orbit
            particle.x = blackHoleRef.current.x + Math.cos(particle.angle) * distanceToBlackHole * 0.99
            particle.y = blackHoleRef.current.y + Math.sin(particle.angle) * distanceToBlackHole * 0.99

            // Gradually decrease orbit radius (spiral into black hole)
            if (distanceToBlackHole > blackHoleRef.current.radius) {
              particle.distance = distanceToBlackHole * 0.995
            } else {
              // Particle is consumed by black hole
              if (!blackHoleRef.current.exploding) {
                // Store the consumed particle
                blackHoleRef.current.consumedParticles.push({
                  ...particle,
                  originalSize: particle.size,
                  originalColor: particle.color,
                  originalOpacity: particle.opacity,
                  storedTime: timeRef.current,
                })

                // Increase black hole size as it consumes particles
                blackHoleRef.current.radius += 0.2

                // Check if black hole should explode
                if (blackHoleRef.current.consumedParticles.length >= blackHoleRef.current.maxParticles) {
                  blackHoleRef.current.exploding = true
                  blackHoleRef.current.explosionProgress = 0
                }
              }
              return false
            }
          } else {
            // Pull toward black hole
            particle.speedX -= Math.cos(angleToBlackHole) * pullStrength
            particle.speedY -= Math.sin(angleToBlackHole) * pullStrength
          }
        }

        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around screen edges (only if far from black hole)
        if (distanceToBlackHole > blackHoleRef.current.pullRadius) {
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0
        }

        // Draw particle
        ctx.shadowBlur = 10
        ctx.shadowColor = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1

        return true
      })

      // Update and draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        // Update position based on direction
        if (star.direction === "radial" && star.targetX !== undefined && star.targetY !== undefined) {
          // Calculate distance to target (black hole)
          const dx = star.x - star.targetX
          const dy = star.y - star.targetY
          const distanceToTarget = Math.sqrt(dx * dx + dy * dy)

          if (distanceToTarget < blackHoleRef.current.radius) {
            // Star reached black hole
            return false
          }

          // Accelerate as it gets closer to black hole
          const acceleration = 1 + (blackHoleRef.current.pullRadius / Math.max(distanceToTarget, 1)) * 0.1
          const speed = star.speed * acceleration

          // Move toward target
          if (star.angle !== undefined) {
            star.x -= Math.cos(star.angle) * speed
            star.y -= Math.sin(star.angle) * speed
          }
        } else if (star.direction === "horizontal") {
          star.x += star.isPositive ? star.speed : -star.speed
        } else {
          star.y += star.isPositive ? star.speed : -star.speed
        }

        // Check if star is near black hole and should be pulled in
        if (blackHoleRef.current.active && star.direction !== "radial") {
          const dx = star.x - blackHoleRef.current.x
          const dy = star.y - blackHoleRef.current.y
          const distanceToBlackHole = Math.sqrt(dx * dx + dy * dy)

          if (distanceToBlackHole < blackHoleRef.current.pullRadius) {
            // Convert to radial star being pulled to black hole
            star.direction = "radial"
            star.targetX = blackHoleRef.current.x
            star.targetY = blackHoleRef.current.y
            star.angle = Math.atan2(dy, dx)
            star.isPositive = false
          }
        }

        // Update trail
        star.trail.unshift({
          x: star.x,
          y: star.y,
          opacity: 1,
        })

        if (star.trail.length > star.trailLength) {
          star.trail.pop()
        }

        // Draw trail
        if (star.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(star.trail[0].x, star.trail[0].y)

          for (let i = 1; i < star.trail.length; i++) {
            ctx.lineTo(star.trail[i].x, star.trail[i].y)
          }

          const gradient = ctx.createLinearGradient(
            star.trail[0].x,
            star.trail[0].y,
            star.trail[star.trail.length - 1].x,
            star.trail[star.trail.length - 1].y,
          )

          gradient.addColorStop(0, star.color)
          if (star.color.startsWith("hsl")) {
            const hslMatch = star.color.match(/hsl$$(\d+),\s*([\d.]+)%,\s*([\d.]+)%$$/)
            if (hslMatch) {
              const [_, hue, saturation, lightness] = hslMatch
              gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`)
            } else {
              gradient.addColorStop(1, theme === "dark" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)")
            }
          } else if (star.color.startsWith("rgb")) {
            gradient.addColorStop(1, star.color.replace("rgb", "rgba").replace(")", ", 0)"))
          } else {
            gradient.addColorStop(1, theme === "dark" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)")
          }

          ctx.strokeStyle = gradient
          ctx.lineWidth = 1.5
          ctx.shadowBlur = 5
          ctx.shadowColor = star.color
          ctx.stroke()
          ctx.shadowBlur = 0
        }

        ctx.shadowBlur = 10
        ctx.shadowColor = theme === "dark" ? "white" : "rgba(0, 0, 0, 0.8)"
        ctx.beginPath()
        ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = theme === "dark" ? "white" : "rgba(0, 0, 0, 0.8)"
        ctx.fill()
        ctx.shadowBlur = 0

        if (star.x < -10 || star.x > canvas.width + 10 || star.y < -10 || star.y > canvas.height + 10) {
          return false
        }

        return true
      })

      // Draw black hole
      if (blackHoleRef.current.active && blackHoleRef.current.intensity > 0) {
        // Draw accretion disk (glowing ring around black hole)
        const glowRadius = blackHoleRef.current.radius * 3
        const gradient = ctx.createRadialGradient(
          blackHoleRef.current.x,
          blackHoleRef.current.y,
          blackHoleRef.current.radius * 0.8,
          blackHoleRef.current.x,
          blackHoleRef.current.y,
          glowRadius,
        )

        gradient.addColorStop(
          0,
          `hsla(${(timeRef.current * 20) % 360}, 80%, 60%, ${0.7 * blackHoleRef.current.intensity})`,
        )
        gradient.addColorStop(
          0.5,
          `hsla(${(timeRef.current * 20 + 30) % 360}, 80%, 40%, ${0.3 * blackHoleRef.current.intensity})`,
        )
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.beginPath()
        ctx.arc(blackHoleRef.current.x, blackHoleRef.current.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw event horizon (black circle)
        ctx.beginPath()
        ctx.arc(blackHoleRef.current.x, blackHoleRef.current.y, blackHoleRef.current.radius, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0, 0, 0, 1)"
        ctx.shadowBlur = 20
        ctx.shadowColor = `hsla(${(timeRef.current * 20) % 360}, 80%, 60%, 0.5)`
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Handle black hole explosion
      if (blackHoleRef.current.exploding) {
        blackHoleRef.current.explosionProgress += 1

        // Calculate explosion phase (0 to 1)
        const explosionPhase = blackHoleRef.current.explosionProgress / blackHoleRef.current.explosionDuration

        // First phase: black hole expands
        if (explosionPhase < 0.3) {
          blackHoleRef.current.radius += 2
        }
        // Second phase: explosion
        else if (explosionPhase < 0.5) {
          // Draw explosion effect
          ctx.beginPath()
          ctx.arc(
            blackHoleRef.current.x,
            blackHoleRef.current.y,
            blackHoleRef.current.radius * (1 + (explosionPhase - 0.3) * 10),
            0,
            Math.PI * 2,
          )

          const explosionGradient = ctx.createRadialGradient(
            blackHoleRef.current.x,
            blackHoleRef.current.y,
            blackHoleRef.current.radius,
            blackHoleRef.current.x,
            blackHoleRef.current.y,
            blackHoleRef.current.radius * (1 + (explosionPhase - 0.3) * 10),
          )

          explosionGradient.addColorStop(
            0,
            `hsla(${(timeRef.current * 30) % 360}, 100%, 70%, ${1 - (explosionPhase - 0.3) * 5})`,
          )
          explosionGradient.addColorStop(
            0.5,
            `hsla(${(timeRef.current * 30 + 30) % 360}, 100%, 60%, ${0.8 - (explosionPhase - 0.3) * 5})`,
          )
          explosionGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.fillStyle = explosionGradient
          ctx.fill()
        }
        // Third phase: release particles
        else if (explosionPhase < 0.8) {
          // Release stored particles
          if (blackHoleRef.current.consumedParticles.length > 0) {
            const particlesToRelease = Math.ceil(blackHoleRef.current.consumedParticles.length * 0.1)

            for (let i = 0; i < particlesToRelease && blackHoleRef.current.consumedParticles.length > 0; i++) {
              const storedParticle = blackHoleRef.current.consumedParticles.pop()

              // Calculate random explosion direction
              const explosionAngle = Math.random() * Math.PI * 2
              const explosionForce = 2 + Math.random() * 5

              particlesRef.current.push({
                x: blackHoleRef.current.x,
                y: blackHoleRef.current.y,
                size: storedParticle.originalSize,
                speedX: Math.cos(explosionAngle) * explosionForce,
                speedY: Math.sin(explosionAngle) * explosionForce,
                color: storedParticle.originalColor,
                opacity: storedParticle.originalOpacity,
                life: 100,
                maxLife: 100,
                angle: explosionAngle,
                distance: 0,
                orbitSpeed: Math.random() * 0.01 + 0.005,
              })
            }
          }

          // Draw fading explosion
          ctx.beginPath()
          ctx.arc(
            blackHoleRef.current.x,
            blackHoleRef.current.y,
            blackHoleRef.current.radius * (5 + (explosionPhase - 0.5) * 5),
            0,
            Math.PI * 2,
          )

          const fadeGradient = ctx.createRadialGradient(
            blackHoleRef.current.x,
            blackHoleRef.current.y,
            blackHoleRef.current.radius * 2,
            blackHoleRef.current.x,
            blackHoleRef.current.y,
            blackHoleRef.current.radius * (5 + (explosionPhase - 0.5) * 5),
          )

          fadeGradient.addColorStop(
            0,
            `hsla(${(timeRef.current * 30) % 360}, 100%, 70%, ${0.5 - (explosionPhase - 0.5) * 1.5})`,
          )
          fadeGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.fillStyle = fadeGradient
          ctx.fill()
        }
        // Final phase: reset black hole
        else {
          // Reset black hole
          blackHoleRef.current.radius = 15
          blackHoleRef.current.exploding = false
          blackHoleRef.current.consumedParticles = []

          // Create a bunch of new particles
          const newParticleCount = 30 + Math.floor(Math.random() * 20)
          for (let i = 0; i < newParticleCount; i++) {
            const angle = Math.random() * Math.PI * 2
            const distance = 50 + Math.random() * 100

            particlesRef.current.push({
              x: blackHoleRef.current.x + Math.cos(angle) * distance,
              y: blackHoleRef.current.y + Math.sin(angle) * distance,
              size: Math.random() * 3 + 1,
              speedX: Math.cos(angle) * (1 + Math.random() * 2),
              speedY: Math.sin(angle) * (1 + Math.random() * 2),
              color: getRandomColor(0.8),
              opacity: 0.8,
              life: 100,
              maxLife: 100,
              angle,
              distance,
              orbitSpeed: Math.random() * 0.01 + 0.005,
            })
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  )
}
