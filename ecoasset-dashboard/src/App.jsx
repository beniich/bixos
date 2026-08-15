import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCard from './components/StatsCard'
import SalesChart from './components/SalesChart'
import CategoryChart from './components/CategoryChart'
import LiveActivity from './components/LiveActivity'
import TopEvents from './components/TopEvents'
import RevenueChart from './components/RevenueChart'
import BookingsTable from './components/BookingsTable'
import HeatmapChart from './components/HeatmapChart'
import EventForm from './components/forms/EventForm'
import { dashboardData } from './utils/data'
import './styles/form.css'

export default function App() {
  const [showForm, setShowForm] = useState(false)
  return (
    <div className="app">
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>

      <Sidebar />

      <main className="main-content">
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,0,16,0.85)', backdropFilter: 'blur(10px)', zIndex: 200, overflowY: 'auto', padding: '40px 24px' }}>
            <EventForm onClose={() => setShowForm(false)} />
          </div>
        )}
        <Header />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
          <div>
          <h1 className="page-title">◈ TABLEAU DE BORD</h1>
          <p className="page-subtitle">Vue d'ensemble temps réel · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ height: 48 }}>
            + Créer un événement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            label="Revenus totaux"
            value={dashboardData.stats.revenue.value}
            trend={dashboardData.stats.revenue.trend}
            up={dashboardData.stats.revenue.up}
            icon={dashboardData.stats.revenue.icon}
            color="cyber"
            sparkData={[10, 25, 18, 35, 28, 45, 38, 55]}
          />
          <StatsCard
            label="Réservations"
            value={dashboardData.stats.bookings.value}
            trend={dashboardData.stats.bookings.trend}
            up={dashboardData.stats.bookings.up}
            icon={dashboardData.stats.bookings.icon}
            color="purple"
            sparkData={[20, 15, 30, 22, 40, 35, 50, 48]}
          />
          <StatsCard
            label="Visiteurs uniques"
            value={dashboardData.stats.visitors.value}
            trend={dashboardData.stats.visitors.trend}
            up={dashboardData.stats.visitors.up}
            icon={dashboardData.stats.visitors.icon}
            color="pink"
            sparkData={[5, 12, 8, 20, 18, 32, 28, 45]}
          />
          <StatsCard
            label="Taux de conversion"
            value={dashboardData.stats.conversion.value}
            trend={dashboardData.stats.conversion.trend}
            up={dashboardData.stats.conversion.up}
            icon={dashboardData.stats.conversion.icon}
            color="green"
            sparkData={[40, 38, 42, 35, 30, 28, 25, 22]}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-2">
          <SalesChart data={dashboardData} />
          <CategoryChart data={dashboardData} />
        </div>

        {/* Heatmap */}
        <div className="grid">
          <HeatmapChart data={dashboardData} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-1-2">
          <RevenueChart data={dashboardData} />
          <LiveActivity activities={dashboardData.liveActivity} />
        </div>

        {/* Top Events */}
        <div className="grid">
          <TopEvents events={dashboardData.topEvents} />
        </div>

        {/* Bookings Table */}
        <div className="grid">
          <BookingsTable bookings={dashboardData.recentBookings} />
        </div>
      </main>
    </div>
  )
}
