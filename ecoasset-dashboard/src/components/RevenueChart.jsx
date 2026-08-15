import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function RevenueChart({ data }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(255, 0, 110, 0.8)')
    gradient.addColorStop(1, 'rgba(181, 55, 242, 0.4)')

    const chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.paymentMethods.labels,
        datasets: [{
          label: 'Répartition',
          data: data.paymentMethods.values,
          backgroundColor: [
            'rgba(0, 240, 255, 0.8)',
            'rgba(181, 55, 242, 0.8)',
            'rgba(255, 0, 110, 0.8)',
            'rgba(0, 255, 136, 0.8)'
          ],
          borderColor: [
            '#00f0ff',
            '#b537f2',
            '#ff006e',
            '#00ff88'
          ],
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 40
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
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y}%`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 12 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              font: { size: 11 },
              callback: (v) => v + '%'
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
        <h3 className="chart-title">💳 Moyens de Paiement</h3>
      </div>
      <div className="chart-container">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  )
}
