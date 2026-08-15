import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'

Chart.register(...registerables, MatrixController, MatrixElement)

export default function HeatmapChart({ data }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const hours = Array.from({ length: 24 }, (_, i) => `${i}h`)

    const matrix = []
    data.heatmap.forEach((row, day) => {
      row.forEach((value, hour) => {
        matrix.push({ x: hour, y: day, v: value })
      })
    })

    const chartInstance = new Chart(ctx, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Activité',
          data: matrix,
          backgroundColor: (ctx) => {
            const value = ctx.raw.v
            const alpha = value / 100
            return `rgba(0, 240, 255, ${alpha})`
          },
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          width: ({ chart }) => (chart.chartArea?.width / 24) - 2,
          height: ({ chart }) => (chart.chartArea?.height / 7) - 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 1, 24, 0.9)',
            borderColor: 'rgba(0, 240, 255, 0.3)',
            borderWidth: 1,
            titleColor: '#00f0ff',
            bodyColor: '#fff',
            callbacks: {
              title: (items) => `${days[items[0].raw.y]} · ${items[0].raw.x}h`,
              label: (ctx) => `Activité: ${ctx.raw.v}%`
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'top',
            min: 0, max: 23,
            ticks: { color: 'rgba(255, 255, 255, 0.6)', stepSize: 3 },
            grid: { display: false }
          },
          y: {
            type: 'linear',
            min: 0, max: 6,
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              stepSize: 1,
              callback: (v) => days[v]
            },
            grid: { display: false },
            reverse: true
          }
        }
      }
    })

    return () => chartInstance.destroy()
  }, [data])

  return (
    <div className="glass">
      <div className="chart-header">
        <h3 className="chart-title">🔥 Heatmap d'Activité (24h × 7j)</h3>
      </div>
      <div className="chart-container">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  )
}
