export const dashboardData = {
  stats: {
    revenue: { value: '€ 184 320', trend: '+24.5%', up: true, icon: '💎' },
    bookings: { value: '2 847', trend: '+18.2%', up: true, icon: '🎫' },
    visitors: { value: '12 459', trend: '+32.1%', up: true, icon: '👥' },
    conversion: { value: '4.8%', trend: '-0.3%', up: false, icon: '⚡' }
  },

  salesByDay: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    values: [12, 19, 15, 25, 32, 48, 38]
  },

  salesByMonth: {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    values: [120, 145, 178, 198, 234, 287, 312, 298, 267, 245, 289, 320]
  },

  categories: {
    labels: ['🎵 Concerts', '🎭 Théâtre', '⚽ Sport', '🎪 Festivals', '🎨 Expos'],
    values: [35, 22, 18, 15, 10]
  },

  paymentMethods: {
    labels: ['💳 CB', '🅿️ PayPal', '🍎 Apple Pay', '🏦 Virement'],
    values: [55, 25, 15, 5]
  },

  liveActivity: [
    { type: 'booking', user: 'Marie L.', event: 'Jazz Night', amount: '+ 89€', time: '2 min', color: 'cyber' },
    { type: 'review', user: 'Thomas B.', event: 'Festival Électro', amount: '⭐ 5.0', time: '5 min', color: 'purple' },
    { type: 'booking', user: 'Sophie M.', event: 'Concert Rock', amount: '+ 149€', time: '8 min', color: 'cyber' },
    { type: 'checkin', user: 'Lucas P.', event: 'Opéra Garnier', amount: '✓ Validé', time: '12 min', color: 'green' },
    { type: 'booking', user: 'Emma D.', event: 'Match de Foot', amount: '+ 45€', time: '15 min', color: 'cyber' },
    { type: 'refund', user: 'Hugo F.', event: 'Festival Jazz', amount: '- 29€', time: '22 min', color: 'pink' },
    { type: 'booking', user: 'Chloé R.', event: 'Stand-up', amount: '+ 35€', time: '28 min', color: 'cyber' },
    { type: 'review', user: 'Nathan G.', event: 'Concert Pop', amount: '⭐ 4.5', time: '35 min', color: 'purple' }
  ],

  topEvents: [
    { name: 'Festival Électro 2024', venue: 'Bercy', sold: 95, revenue: '€ 142K', trend: '+24%', emoji: '🎪' },
    { name: 'Concert Jazz Night', venue: 'Olympia', sold: 78, revenue: '€ 89K', trend: '+18%', emoji: '🎵' },
    { name: 'Match France-Brésil', venue: 'Stade de France', sold: 92, revenue: '€ 234K', trend: '+45%', emoji: '⚽' },
    { name: 'Stand-up Gad Elmaleh', venue: 'Comédie-Française', sold: 65, revenue: '€ 45K', trend: '+12%', emoji: '🎤' },
    { name: 'Opéra Carmen', venue: 'Opéra Garnier', sold: 88, revenue: '€ 67K', trend: '+22%', emoji: '🎭' }
  ],

  recentBookings: [
    { ref: 'ECO-A1B2C3', customer: 'Jean Dupont', event: 'Festival Électro', tickets: 2, amount: 178, status: 'confirmed' },
    { ref: 'ECO-D4E5F6', customer: 'Marie Curie', event: 'Concert Jazz', tickets: 4, amount: 356, status: 'pending' },
    { ref: 'ECO-G7H8I9', customer: 'Paul Martin', event: 'Opéra Carmen', tickets: 1, amount: 89, status: 'confirmed' },
    { ref: 'ECO-J1K2L3', customer: 'Sophie Bernard', event: 'Match Foot', tickets: 3, amount: 135, status: 'confirmed' },
    { ref: 'ECO-M4N5O6', customer: 'Hugo Petit', event: 'Stand-up', tickets: 2, amount: 70, status: 'cancelled' }
  ],

  heatmap: Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
  )
}
