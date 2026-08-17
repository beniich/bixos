import { useEffect, useRef } from 'react'

interface ParticleMapProps {
  particleCount?: number
}

export default function ParticleMap({ particleCount = 2000 }: ParticleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0, animId: number
    type Particle = {
      x: number; y: number; bx: number; by: number
      vx: number; vy: number; size: number
      pulse: number; pulseSpeed: number; isLand: boolean
    }
    let particles: Particle[] = []

    // Simplified world land coordinate clusters (x%, y%) 0-100
    const landClusters: [number, number][] = [
      // North America
      [18,22],[22,26],[25,30],[28,33],[30,37],[28,40],[25,44],[22,48],[20,52],
      [24,56],[26,60],[24,64],[20,68],
      // South America
      [28,64],[30,68],[29,72],[28,76],[30,80],[28,84],[26,88],[24,92],[22,88],
      // Greenland
      [34,10],[36,14],[38,12],
      // Western Europe
      [46,22],[48,26],[50,30],[51,28],[52,32],[50,36],[48,40],
      // Scandinavia
      [50,18],[52,14],[54,16],[52,20],[50,24],
      // Eastern Europe / Russia
      [54,28],[58,24],[62,20],[66,22],[70,26],[74,28],[78,24],[82,26],
      [86,28],[82,24],[78,20],[74,22],
      // Africa
      [48,38],[50,42],[52,46],[54,50],[55,54],[54,58],[52,62],[50,66],
      [48,70],[46,66],[47,62],[48,58],[47,54],[48,50],[47,46],[48,42],
      // Middle East / Arabia
      [56,36],[58,40],[60,44],[62,40],[60,36],
      // South Asia
      [64,38],[66,42],[68,44],[70,42],[68,40],[72,44],[74,46],[72,48],
      // Southeast Asia
      [74,40],[76,44],[78,46],[80,42],[82,44],[84,40],[86,42],
      // Japan / Korea
      [84,28],[86,30],[84,26],[88,32],
      // China / Mongolia
      [72,28],[76,26],[80,28],[78,24],[74,24],[70,28],[68,32],
      // India
      [66,42],[68,46],[70,48],[68,50],[66,48],
      // Australia
      [80,64],[82,68],[84,72],[82,74],[78,72],[76,68],[78,66],[80,70],
      // New Zealand
      [88,74],[90,72],
    ]

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      w = rect.width
      h = rect.height
      buildParticles()
    }

    const buildParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        const isLand = Math.random() < 0.55
        let bx: number, by: number
        if (isLand) {
          const c = landClusters[Math.floor(Math.random() * landClusters.length)]
          bx = (c[0] / 100) * w + (Math.random() - 0.5) * (w * 0.06)
          by = (c[1] / 100) * h + (Math.random() - 0.5) * (h * 0.07)
        } else {
          bx = Math.random() * w
          by = Math.random() * h
        }
        particles.push({
          x: bx, y: by, bx, by,
          vx: 0, vy: 0,
          size: isLand ? 1.2 + Math.random() * 1.4 : 0,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.018 + Math.random() * 0.025,
          isLand
        })
      }
    }

    let mx = -9999, my = -9999
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mx = e.clientX - r.left; my = e.clientY - r.top
    }
    const onLeave = () => { mx = -9999; my = -9999 }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        if (!p.isLand) continue
        p.pulse += p.pulseSpeed

        // mouse repulsion
        const dx = p.x - mx, dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 80) {
          const f = (80 - dist) / 80
          p.vx += (dx / dist) * f * 1.5
          p.vy += (dy / dist) * f * 1.5
        }
        p.vx *= 0.88; p.vy *= 0.88
        p.x = p.bx + p.vx; p.y = p.by + p.vy

        const alpha = 0.35 + Math.sin(p.pulse) * 0.18
        const scale = 0.85 + Math.sin(p.pulse * 1.3) * 0.15
        const s = p.size * scale
        ctx.fillStyle = `rgba(20, 20, 20, ${alpha})`
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
      }
      animId = requestAnimationFrame(animate)
    }

    resize()
    animate()
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [particleCount])

  return (
    <canvas
      ref={canvasRef}
      className="auth-particle-canvas"
    />
  )
}
