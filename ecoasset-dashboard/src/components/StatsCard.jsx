import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function StatsCard({ label, value, trend, up, icon, color, sparkData }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 50)
    const colors = {
      cyber: ['rgba(0, 240, 255, 0.4)', 'rgba(0, 240, 255, 0)'],
      purple: ['rgba(181, 55, 242, 0.4)', 'rgba(181, 55, 242, 0)'],
      pink: ['rgba(255, 0, 110, 0.4)', 'rgba(255, 0, 110, 0)'],
      green: ['rgba(0, 255, 136, 0.4)', 'rgba(0, 255, 136, 0)']
    }

    gradient.addColorStop(0, colors[color][0])
    gradient.addColorStop(1, colors[color][1])

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sparkData.map((_, i) => i),
        datasets: [{
          data: sparkData,
          borderColor: colors[color][0].replace('0.4', '1'),
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    })

    return () => chartInstance.destroy()
  }, [color, sparkData])

  return (
    <div className="stat-card glass-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <span className={`stat-trend ${up ? 'up' : 'down'}`}>
        {up ? '▲' : '▼'} {trend}
      </span>
      <div className="stat-spark">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  )
}
