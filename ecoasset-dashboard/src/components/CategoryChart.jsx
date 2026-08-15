import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function CategoryChart({ data }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    const colors = ['#00f0ff', '#b537f2', '#ff006e', '#00ff88', '#ffb800']

    const chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.categories.labels,
        datasets: [{
          data: data.categories.values,
          backgroundColor: colors,
          borderColor: 'rgba(10, 1, 24, 0.8)',
          borderWidth: 3,
          hoverOffset: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 12, family: 'Inter' },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10, 1, 24, 0.9)',
            borderColor: 'rgba(0, 240, 255, 0.3)',
            borderWidth: 1,
            titleColor: '#00f0ff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
            }
          }
        }
      }
    })

    return () => chartInstance.destroy()
  }, [data])

  return (
    <div className="glass">
      <div className="chart-header">
        <h3 className="chart-title">🎯 Catégories</h3>
      </div>
      <div className="chart-container">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  )
}
