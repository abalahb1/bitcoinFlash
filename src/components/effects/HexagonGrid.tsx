'use client'

import { useEffect, useRef } from 'react'

interface HexagonGridProps {
  opacity?: number
  color?: string
  gridSize?: number
}

export function HexagonGrid({
  opacity = 0.03,
  color = '#00f3ff',
  gridSize = 30
}: HexagonGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const initCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawHexagon = (x: number, y: number, size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const hx = x + size * Math.cos(angle)
        const hy = y + size * Math.sin(angle)
        if (i === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.stroke()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = color
      ctx.lineWidth = 1

      const hexSize = gridSize
      const hexHeight = hexSize * Math.sqrt(3)
      const hexWidth = hexSize * 2
      const vertDist = hexHeight
      const horizDist = hexWidth * 0.75

      const cols = Math.ceil(canvas.width / horizDist) + 2
      const rows = Math.ceil(canvas.height / vertDist) + 2

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const xOffset = (row % 2) * (horizDist / 2)
          const x = col * horizDist + xOffset + (Math.sin(time + col * 0.1 + row * 0.1) * 5)
          const y = row * vertDist + (Math.cos(time + col * 0.1 + row * 0.1) * 5)

          // Draw hexagon
          ctx.globalAlpha = opacity * (0.5 + Math.sin(time + col * 0.2 + row * 0.2) * 0.5)
          drawHexagon(x, y, hexSize)
        }
      }

      time += 0.02
      animationFrameId = requestAnimationFrame(draw)
    }

    initCanvas()
    draw()

    const handleResize = () => {
      initCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, gridSize, opacity])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
