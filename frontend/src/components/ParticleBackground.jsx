import { useEffect, useRef } from 'react'

/**
 * Tech Network Mesh Background - Premium Version
 * 
 * Features:
 * - Organic randomized mesh (non-rigid)
 * - Mix-blend-mode for seamless integration
 * - HSL-based dynamic pulses with trails
 * - Radial vignette mask for depth
 * - Responsive DPI-aware rendering
 */

const LIME_HSL = { h: 79, s: 99, l: 49 }
const GOLD_HSL = { h: 46, s: 78, l: 56 }

const NODE_OPACITY = 0.12
const LINE_OPACITY = 0.05
const PULSE_OPACITY = 0.4
const PULSE_COUNT = 12
const GRID_SPACING = 120 

export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId
    let nodes = []
    let edges = []
    let pulses = []
    let time = 0

    function buildGrid() {
      const w = window.innerWidth
      const h = window.innerHeight
      const spacing = w < 768 ? GRID_SPACING * 1.4 : GRID_SPACING
      nodes = []
      edges = []

      const cols = Math.ceil(w / spacing) + 2
      const rows = Math.ceil(h / (spacing * 0.866)) + 2
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const isOddRow = row % 2 === 1
          const x = (col - 1) * spacing + (isOddRow ? spacing * 0.5 : 0)
          const y = (row - 1) * spacing * 0.866

          // Organic jitter
          const jx = x + (Math.random() - 0.5) * spacing * 0.4
          const jy = y + (Math.random() - 0.5) * spacing * 0.4

          nodes.push({
            x: jx,
            y: jy,
            baseX: jx,
            baseY: jy,
            phase: Math.random() * Math.PI * 2,
            z: Math.random() * 0.5 + 0.5 // Depth factor
          })
        }
      }

      const threshold = spacing * 1.5
      for (let i = 0; i < nodes.length; i++) {
        let connections = 0
        for (let j = i + 1; j < nodes.length; j++) {
          if (connections > 3) break
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distSq = dx * dx + dy * dy
          if (distSq < threshold * threshold) {
            edges.push({ a: i, b: j, distSq })
            connections++
          }
        }
      }

      initPulses()
    }

    function initPulses() {
      const count = window.innerWidth < 768 ? Math.floor(PULSE_COUNT / 2) : PULSE_COUNT
      pulses = []
      for (let i = 0; i < count; i++) {
        pulses.push(newPulse())
      }
    }

    function newPulse() {
      const edgeIdx = Math.floor(Math.random() * edges.length)
      const color = Math.random() > 0.4 ? LIME_HSL : GOLD_HSL
      return {
        edgeIdx,
        t: 0,
        speed: 0.001 + Math.random() * 0.003,
        color,
        forward: Math.random() > 0.5,
        history: [] // For trails
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildGrid()
    }

    window.addEventListener('resize', resize)
    resize()

    function draw() {
      time += 0.008
      const w = window.innerWidth
      const h = window.innerHeight
      
      ctx.clearRect(0, 0, w, h)
      
      // Better blending
      ctx.globalCompositeOperation = 'screen'

      // Soft vignette mask
      const vignette = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.8)
      vignette.addColorStop(0, 'rgba(19, 19, 19, 0)')
      vignette.addColorStop(1, 'rgba(19, 19, 19, 1)')
      
      // Update nodes
      for (const n of nodes) {
        const drift = Math.sin(time + n.phase) * 3 * n.z
        n.x = n.baseX + drift
        n.y = n.baseY + Math.cos(time * 0.8 + n.phase) * 3 * n.z
      }

      // Draw edges
      ctx.lineWidth = 0.8
      for (const e of edges) {
        const a = nodes[e.a]
        const b = nodes[e.b]
        
        // Distance-based fade
        const opacity = LINE_OPACITY * (1 - (a.z + b.z) / 4)
        ctx.strokeStyle = `hsla(${LIME_HSL.h}, ${LIME_HSL.s}%, ${LIME_HSL.l}%, ${opacity})`
        
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // Draw pulses
      for (const p of pulses) {
        p.t += p.speed
        if (p.t > 1) {
          Object.assign(p, newPulse())
          p.t = 0
        }

        const edge = edges[p.edgeIdx]
        if (!edge) continue
        const a = nodes[edge.a]
        const b = nodes[edge.b]
        const progress = p.forward ? p.t : 1 - p.t
        const px = a.x + (b.x - a.x) * progress
        const py = a.y + (b.y - a.y) * progress

        // Add to history for trails
        p.history.push({ x: px, y: py })
        if (p.history.length > 15) p.history.shift()

        // Trail drawing
        if (p.history.length > 1) {
          ctx.beginPath()
          ctx.moveTo(p.history[0].x, p.history[0].y)
          for (let i = 1; i < p.history.length; i++) {
            ctx.lineTo(p.history[i].x, p.history[i].y)
          }
          const grad = ctx.createLinearGradient(p.history[0].x, p.history[0].y, px, py)
          grad.addColorStop(0, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, 0)`)
          grad.addColorStop(1, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${PULSE_OPACITY})`)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Pulse head
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${PULSE_OPACITY})`
        ctx.fill()
        
        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 12)
        glow.addColorStop(0, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, 0.1)`)
        glow.addColorStop(1, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(px, py, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      // Apply vignette mask
      ctx.globalCompositeOperation = 'destination-in'
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7, 
      }}
    />
  )
}
