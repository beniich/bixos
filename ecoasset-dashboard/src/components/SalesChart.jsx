import React, { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function SalesChart({ data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext('2d')
    const labels = period === 'week' ? data.salesByDay.labels : data.salesByMonth.labels
    const values = period === 'week' ? data.salesByDay.values : data.salesByMonth.values

    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.5)')
    gradient.addColorStop(0.5, 'rgba(181, 55, 242, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 240, 255, 0)')

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 300)
    gradient2.addColorStop(0, 'rgba(181, 55, 242, 0.3)')
    gradient2.addColorStop(1, 'rgba(181, 55, 242, 0)')

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Billets vendus',
            data: values,
            borderColor: '#00f0ff',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00f0ff',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            label: 'Revenus (k€)',
            data: values.map(v => v * 3.2),
            borderColor: '#b537f2',
            backgroundColor: gradient2,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#b537f2',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 12, family: 'Inter' },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16
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
            displayColors: true
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
            ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
            ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 11 } }
          }
        }
      }
    })

    return () => {
      if (chartRef.current) chartRef.current.destroy()
    }
  }, [period, data])

  return (
    <div className="glass">
      <div className="chart-header">
        <h3 className="chart-title">📈 Évolution des Ventes</h3>
        <div className="chart-tabs">
          <button
            className={`chart-tab ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Semaine
          </button>
          <button
            className={`chart-tab ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Année
          </button>
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  )
}
