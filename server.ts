import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

export const app = express();
app.use(express.json());

// ==========================================
// SPACEFLOW COWORKING DATABASE STORE & APIS
// ==========================================

  let serverOrganizations = [
    {
      id: 'org-01',
      name: 'Spaceflow Paris Central',
      slug: 'spaceflow-paris-central',
      plan: 'ENTERPRISE',
      address: '42 Rue de la Paix, 75002 Paris',
      city: 'Paris',
      totalSpacesCount: 18,
      totalMembersCount: 142,
      monthlyRevenue: 12400,
      mrrGrowthPercent: 14.8,
    },
    {
      id: 'org-02',
      name: 'TechHub Station F Loft',
      slug: 'techhub-station-f',
      plan: 'PRO',
      address: '55 Boulevard Vincent Auriol, 75013 Paris',
      city: 'Paris',
      totalSpacesCount: 10,
      totalMembersCount: 88,
      monthlyRevenue: 8200,
      mrrGrowthPercent: 9.2,
    },
  ];

  let serverMembers = [
    {
      id: 'mem-101',
      email: 'jean.dupont@techcorp.io',
      firstName: 'Jean',
      lastName: 'Dupont',
      companyName: 'TechCorp SAS',
      phone: '+33 6 12 34 56 78',
      plan: 'HOT_DESK',
      status: 'ACTIVE',
      orgId: 'org-01',
      joinedDate: '2025-09-15',
      monthlyFee: 250,
      totalBookingsCount: 24,
      lastCheckIn: 'Aujourd\'hui, 09:15',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      id: 'mem-102',
      email: 'marie.martin@designstudio.fr',
      firstName: 'Marie',
      lastName: 'Martin',
      companyName: 'Studio Graphique MM',
      phone: '+33 6 98 76 54 32',
      plan: 'DEDICATED',
      status: 'ACTIVE',
      orgId: 'org-01',
      joinedDate: '2025-06-01',
      monthlyFee: 450,
      totalBookingsCount: 42,
      lastCheckIn: 'Hier, 14:20',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      id: 'mem-103',
      email: 'paul.bernard@freelance.net',
      firstName: 'Paul',
      lastName: 'Bernard',
      companyName: 'DevConsulting',
      phone: '+33 7 44 11 22 33',
      plan: 'DAY_PASS',
      status: 'PENDING',
      orgId: 'org-01',
      joinedDate: '2026-01-10',
      monthlyFee: 80,
      totalBookingsCount: 6,
      lastCheckIn: '10/01/2026',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: 'mem-104',
      email: 'sophie.leblanc@nexusai.com',
      firstName: 'Sophie',
      lastName: 'Leblanc',
      companyName: 'Nexus AI Systems',
      phone: '+33 6 55 66 77 88',
      plan: 'PRIVATE_OFFICE',
      status: 'ACTIVE',
      orgId: 'org-01',
      joinedDate: '2025-01-15',
      monthlyFee: 1800,
      totalBookingsCount: 98,
      lastCheckIn: 'Aujourd\'hui, 08:30',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
    {
      id: 'mem-105',
      email: 'thomas.moreau@dataflow.org',
      firstName: 'Thomas',
      lastName: 'Moreau',
      companyName: 'DataFlow Inc',
      phone: '+33 6 22 33 44 55',
      plan: 'HOT_DESK',
      status: 'ACTIVE',
      orgId: 'org-01',
      joinedDate: '2025-11-20',
      monthlyFee: 250,
      totalBookingsCount: 18,
      lastCheckIn: 'Aujourd\'hui, 11:00',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  ];

  let serverSpaces = [
    {
      id: 'spc-01',
      name: 'Open Space - Desk Flex #12',
      type: 'DESK',
      capacity: 1,
      hourlyRate: 8,
      dailyRate: 35,
      floor: 'Étage 1 - Zone B',
      orgId: 'org-01',
      status: 'AVAILABLE',
      amenities: ['Écran 27"', 'Prise USB-C 65W', 'Café Illimité', 'Fibre 1Gbps'],
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      description: 'Poste de travail individuel ergomique avec écran de contrôle et réseau haute vitesse.',
    },
    {
      id: 'spc-02',
      name: 'Salle de Réunion Alpha (Verrière)',
      type: 'MEETING_ROOM',
      capacity: 10,
      hourlyRate: 45,
      dailyRate: 280,
      floor: 'Étage 2 - Atrium',
      orgId: 'org-01',
      status: 'OCCUPIED',
      amenities: ['Écran 4K 75"', 'Visioconférence Jabra', 'Tableau Blanc', 'Climatisation'],
      imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600',
      description: 'Grande salle de réunion lumineuse idéale pour présentations clients et brainstormings d\'équipe.',
    },
    {
      id: 'spc-03',
      name: 'Espace Événementiel Loft',
      type: 'EVENT_SPACE',
      capacity: 50,
      hourlyRate: 150,
      dailyRate: 950,
      floor: 'Rez-de-Chaussée',
      orgId: 'org-01',
      status: 'AVAILABLE',
      amenities: ['Sonorisation Dolby', 'Microphones Sans Fil', 'Bar Cisterne', 'Rétroprojecteur HD'],
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
      description: 'Espace polyvalent adaptable pour conférences, keynotes, évènements de networking et ateliers.',
    },
    {
      id: 'spc-04',
      name: 'Bureau Privé Executive Suite B4',
      type: 'PRIVATE_OFFICE',
      capacity: 6,
      hourlyRate: 80,
      dailyRate: 450,
      floor: 'Étage 3 - Aile Est',
      orgId: 'org-01',
      status: 'OCCUPIED',
      amenities: ['Accès Badge 24/7', 'Ligne Téléphonique Dédiée', 'Bureaux Assis-Debout', 'Armoires Sécurisées'],
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600',
      description: 'Bureau fermé et insonorisé réservé aux équipes recherchant confidentialité et standing.',
    },
  ];

  let serverBookings = [
    {
      id: 'bkg-801',
      spaceId: 'spc-02',
      spaceName: 'Salle de Réunion Alpha (Verrière)',
      spaceType: 'MEETING_ROOM',
      memberId: 'mem-101',
      memberName: 'Jean Dupont',
      memberEmail: 'jean.dupont@techcorp.io',
      startTime: new Date(Date.now() - 1*3600*1000).toISOString(),
      endTime: new Date(Date.now() + 2*3600*1000).toISOString(),
      status: 'CONFIRMED',
      amount: 135,
      orgId: 'org-01',
      notes: 'Réunion d\'équipe projet IA',
      qrCodeToken: 'SPF-BKG-801-QR-9942',
      checkInTime: new Date(Date.now() - 50*60*1000).toISOString(),
    },
    {
      id: 'bkg-802',
      spaceId: 'spc-01',
      spaceName: 'Open Space - Desk Flex #12',
      spaceType: 'DESK',
      memberId: 'mem-102',
      memberName: 'Marie Martin',
      memberEmail: 'marie.martin@designstudio.fr',
      startTime: new Date(Date.now() + 18*3600*1000).toISOString(),
      endTime: new Date(Date.now() + 26*3600*1000).toISOString(),
      status: 'CONFIRMED',
      amount: 35,
      orgId: 'org-01',
      notes: 'Session design UX UI',
      qrCodeToken: 'SPF-BKG-802-QR-3310',
    },
    {
      id: 'bkg-803',
      spaceId: 'spc-03',
      spaceName: 'Espace Événementiel Loft',
      spaceType: 'EVENT_SPACE',
      memberId: 'mem-104',
      memberName: 'Sophie Leblanc',
      memberEmail: 'sophie.leblanc@nexusai.com',
      startTime: new Date(Date.now() + 48*3600*1000).toISOString(),
      endTime: new Date(Date.now() + 54*3600*1000).toISOString(),
      status: 'CONFIRMED',
      amount: 900,
      orgId: 'org-01',
      notes: 'Lancement Produit Version 3.0',
      qrCodeToken: 'SPF-BKG-803-QR-1100',
    }
  ];

  let serverInvoices = [
    {
      id: 'inv-001',
      number: 'F-2026-001',
      memberId: 'mem-101',
      memberName: 'Jean Dupont',
      memberEmail: 'jean.dupont@techcorp.io',
      amount: 250.00,
      taxAmount: 50.00,
      status: 'PAID',
      dueDate: '2026-01-15',
      paidAt: '2026-01-12T14:30:00Z',
      stripePaymentId: 'ch_3M451x2eZvKYlo2C0129X',
      items: [
        { description: 'Abonnement Mensuel Hot Desk - Janvier 2026', qty: 1, unitPrice: 200.00, total: 200.00 },
        { description: 'Option Boissons & Impression Illimitée', qty: 1, unitPrice: 50.00, total: 50.00 }
      ]
    },
    {
      id: 'inv-002',
      number: 'F-2026-002',
      memberId: 'mem-102',
      memberName: 'Marie Martin',
      memberEmail: 'marie.martin@designstudio.fr',
      amount: 450.00,
      taxAmount: 90.00,
      status: 'PENDING',
      dueDate: '2026-02-15',
      stripePaymentId: 'ch_pending_8812',
      items: [
        { description: 'Abonnement Bureau Dédié Étage 1', qty: 1, unitPrice: 450.00, total: 450.00 }
      ]
    },
    {
      id: 'inv-003',
      number: 'F-2026-003',
      memberId: 'mem-103',
      memberName: 'Paul Bernard',
      memberEmail: 'paul.bernard@freelance.net',
      amount: 80.00,
      taxAmount: 16.00,
      status: 'OVERDUE',
      dueDate: '2026-01-10',
      items: [
        { description: 'Pass Journée Coworking + 2h Salle Réunion', qty: 1, unitPrice: 80.00, total: 80.00 }
      ]
    },
  ];

  let serverVisitors = [
    {
      id: 'vis-01',
      visitorName: 'Alexandre Renard',
      visitorEmail: 'a.renard@invest-capital.fr',
      hostMemberId: 'mem-104',
      hostMemberName: 'Sophie Leblanc',
      visitDate: new Date().toISOString().split('T')[0],
      timeSlot: '14:30 - 16:00',
      status: 'EXPECTED',
      qrCodeToken: 'VIS-QR-9921',
      purpose: 'Présentation pitch investisseur'
    },
    {
      id: 'vis-02',
      visitorName: 'Claire Duchemin',
      visitorEmail: 'c.duchemin@partner.org',
      hostMemberId: 'mem-101',
      hostMemberName: 'Jean Dupont',
      visitDate: new Date().toISOString().split('T')[0],
      timeSlot: '10:00 - 12:00',
      status: 'CHECKED_IN',
      qrCodeToken: 'VIS-QR-3310',
      purpose: 'Audit technique infrastructure'
    }
  ];

  // ==========================================
  // SPACEFLOW REST API ENDPOINTS
  // ==========================================

  // Public Stats & Showcase
  app.get('/api/public/stats', (req, res) => {
    res.json({
      activeSpaces: 18,
      coworkersActive: 142,
      occupancyPercent: 87,
      satisfactionRating: 4.9,
      totalHoursBookedThisMonth: 1480
    });
  });

  // Dashboard KPIs
  app.get('/api/dashboard/kpis', (req, res) => {
    const totalMembers = serverMembers.length;
    const occupiedSpaces = serverSpaces.filter(s => s.status === 'OCCUPIED').length;
    const occupancyRatePercent = Math.round((occupiedSpaces / Math.max(serverSpaces.length, 1)) * 100);
    const mrr = serverMembers.reduce((acc, m) => acc + (m.monthlyFee || 0), 0) + 10200;

    res.json({
      totalMembers,
      occupancyRatePercent: occupancyRatePercent > 0 ? occupancyRatePercent : 87,
      monthlyRecurringRevenueEur: mrr,
      activeBookingsToday: serverBookings.length,
      availableDesksCount: serverSpaces.filter(s => s.status === 'AVAILABLE').length,
      mrrGrowthRatePercent: 14.8,
      totalInvoicesPaid: serverInvoices.filter(i => i.status === 'PAID').length,
      totalInvoicesPendingEur: serverInvoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount, 0)
    });
  });

  // Members API (CRUD + Filters + Invite)
  app.get('/api/members', (req, res) => {
    const { search, plan, status } = req.query;
    let list = [...serverMembers];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(m => 
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.companyName && m.companyName.toLowerCase().includes(q))
      );
    }
    if (plan && plan !== 'ALL') {
      list = list.filter(m => m.plan === plan);
    }
    if (status && status !== 'ALL') {
      list = list.filter(m => m.status === status);
    }

    res.json(list);
  });

  app.post('/api/members', (req, res) => {
    const { firstName, lastName, email, companyName, plan, monthlyFee, phone } = req.body;
    const newMember = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      email: email || 'nouveau.membre@coworking.fr',
      firstName: firstName || 'Nouveau',
      lastName: lastName || 'Coworker',
      companyName: companyName || 'Indépendant',
      phone: phone || '+33 6 00 00 00 00',
      plan: plan || 'HOT_DESK',
      status: 'ACTIVE',
      orgId: 'org-01',
      joinedDate: new Date().toISOString().split('T')[0],
      monthlyFee: Number(monthlyFee) || (plan === 'DEDICATED' ? 450 : plan === 'PRIVATE_OFFICE' ? 1800 : 250),
      totalBookingsCount: 0,
      lastCheckIn: 'Inscrit aujourd\'hui',
      avatarUrl: req.body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    serverMembers.unshift(newMember);
    res.status(201).json(newMember);
  });

  app.put('/api/members/:id', (req, res) => {
    const member = serverMembers.find(m => m.id === req.params.id);
    if (!member) return res.status(404).json({ error: 'Membre non trouvé' });

    Object.assign(member, req.body);
    res.json(member);
  });

  app.delete('/api/members/:id', (req, res) => {
    serverMembers = serverMembers.filter(m => m.id !== req.params.id);
    res.json({ success: true, message: 'Membre supprimé avec succès' });
  });

  app.post('/api/members/:id/invite', (req, res) => {
    const member = serverMembers.find(m => m.id === req.params.id);
    if (!member) return res.status(404).json({ error: 'Membre non trouvé' });

    // Send email log via Gmail API store
    serverEmailLogs.unshift({
      id: `msg-${Date.now().toString().slice(-4)}`,
      to: member.email,
      subject: `[SPACEFLOW] Activation de votre espace coworker ${member.firstName}`,
      snippet: `Bonjour ${member.firstName}, votre accès au portail coworking Spaceflow a été activé.`,
      sentAt: new Date().toISOString(),
      status: 'SENT_VIA_GMAIL_API'
    });

    res.json({ success: true, message: `Invitation envoyée par email à ${member.email}` });
  });

  // Spaces API
  app.get('/api/spaces', (req, res) => {
    res.json(serverSpaces);
  });

  app.get('/api/spaces/availability', (req, res) => {
    const { date, type } = req.query;
    let list = serverSpaces.map(s => ({
      ...s,
      isAvailableOnDate: true,
      nextAvailableSlot: '14:00 - 18:00'
    }));

    if (type && type !== 'ALL') {
      list = list.filter(s => s.type === type);
    }
    res.json(list);
  });

  app.post('/api/spaces', (req, res) => {
    const newSpace = {
      id: `spc-${Date.now().toString().slice(-4)}`,
      name: req.body.name || 'Nouvel Espace de Travail',
      type: req.body.type || 'MEETING_ROOM',
      capacity: Number(req.body.capacity) || 6,
      hourlyRate: Number(req.body.hourlyRate) || 35,
      dailyRate: Number(req.body.dailyRate) || 200,
      floor: req.body.floor || 'Étage 1',
      orgId: 'org-01',
      status: 'AVAILABLE',
      amenities: req.body.amenities || ['Wifi HD', 'Écran TV', 'Machine à café'],
      imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      description: req.body.description || 'Espace modulaire haut de gamme.'
    };
    serverSpaces.unshift(newSpace);
    res.status(201).json(newSpace);
  });

  // Bookings API (Calendar & Check-in)
  app.get('/api/bookings', (req, res) => {
    res.json(serverBookings);
  });

  app.post('/api/bookings', (req, res) => {
    const { spaceId, memberId, startTime, endTime, notes } = req.body;
    const space = serverSpaces.find(s => s.id === spaceId);
    const member = serverMembers.find(m => m.id === memberId);

    const newBooking = {
      id: `bkg-${Math.floor(Math.random() * 899 + 100)}`,
      spaceId: spaceId || 'spc-01',
      spaceName: space ? space.name : 'Open Space Desk Flex',
      spaceType: space ? space.type : 'DESK',
      memberId: memberId || 'mem-101',
      memberName: member ? `${member.firstName} ${member.lastName}` : 'Jean Dupont',
      memberEmail: member ? member.email : 'jean.dupont@techcorp.io',
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date(Date.now() + 2*3600*1000).toISOString(),
      status: 'CONFIRMED',
      amount: space ? space.hourlyRate * 2 : 50,
      orgId: 'org-01',
      notes: notes || 'Réservation autonome',
      qrCodeToken: `SPF-QR-${Math.floor(Math.random() * 8999 + 1000)}`
    };

    serverBookings.unshift(newBooking);
    res.status(201).json(newBooking);
  });

  app.post('/api/bookings/:id/check-in', (req, res) => {
    const booking = serverBookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Réservation non trouvée' });

    booking.status = 'CHECKED_IN';
    booking.checkInTime = new Date().toISOString();
    res.json({ success: true, message: 'Check-in effectué avec succès !', booking });
  });

  app.delete('/api/bookings/:id/cancel', (req, res) => {
    const booking = serverBookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Réservation non trouvée' });

    booking.status = 'CANCELLED';
    res.json({ success: true, message: 'Réservation annulée avec succès', booking });
  });

  // Billing & Invoices API
  app.get('/api/invoices', (req, res) => {
    const { status } = req.query;
    if (status && status !== 'ALL') {
      return res.json(serverInvoices.filter(i => i.status === status));
    }
    res.json(serverInvoices);
  });

  app.post('/api/invoices', (req, res) => {
    const { memberId, amount, itemsDescription } = req.body;
    const member = serverMembers.find(m => m.id === memberId);

    const newInvoice = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      number: `F-2026-${Math.floor(Math.random() * 899 + 100)}`,
      memberId: memberId || 'mem-101',
      memberName: member ? `${member.firstName} ${member.lastName}` : 'Jean Dupont',
      memberEmail: member ? member.email : 'jean.dupont@techcorp.io',
      amount: Number(amount) || 250,
      taxAmount: (Number(amount) || 250) * 0.20,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 14*24*3600*1000).toISOString().split('T')[0],
      items: [
        {
          description: itemsDescription || 'Service de Coworking & Salles de Réunion',
          qty: 1,
          unitPrice: Number(amount) || 250,
          total: Number(amount) || 250
        }
      ]
    };

    serverInvoices.unshift(newInvoice);
    res.status(201).json(newInvoice);
  });

  app.post('/api/invoices/:id/mark-paid', (req, res) => {
    const invoice = serverInvoices.find(i => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable' });

    invoice.status = 'PAID';
    invoice.paidAt = new Date().toISOString();
    invoice.stripePaymentId = `ch_stripe_mock_${Math.floor(Math.random() * 89999 + 10000)}`;
    res.json({ success: true, invoice });
  });

  app.post('/api/billing/portal', (req, res) => {
    res.json({
      url: 'https://billing.stripe.com/p/session/test_spaceflow_mock_portal',
      message: 'Redirection vers le portail client Stripe Connect'
    });
  });

  // Analytics API
  app.get('/api/analytics/revenue', (req, res) => {
    res.json({
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
      revenue: [9200, 9800, 10500, 11200, 11800, 12100, 12400],
      mrr: [8000, 8400, 8900, 9500, 10000, 10500, 11000],
    });
  });

  app.get('/api/analytics/occupancy', (req, res) => {
    res.json({
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      occupancyPercent: [82, 94, 96, 91, 78, 35, 12],
      peakHours: '10:00 - 16:00'
    });
  });

  // Gemini AI Predictions & Optimization API
  app.get('/api/ai/predictions', (req, res) => {
    res.json({
      predictionId: 'pred-spaceflow-9942',
      confidenceScore: 0.94,
      summary: 'D\'après le modèle de prédiction Gemini, le taux d\'occupation atteindra 95% mercredi prochain entre 10h00 et 14h00 sur la zone Open Space.',
      predictedPeakHour: '10:30 - 12:30',
      suggestedRateAdjustmentPercent: 12,
      recommendedSpaceReconfiguration: 'Convertir 4 bureaux Flex en espaces de travail collaboratifs à haute densité les mardis et mercredis.',
      forecastOccupancyNextWeekPercent: 92
    });
  });

  app.post('/api/ai/chat', async (req, res) => {
    const { message } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Vous êtes l'assistant intelligent IA de SPACEFLOW, la plateforme SaaS de gestion de coworking. Répondez de manière professionnelle et concise en français à cette question de gestionnaire : "${message}"`,
        });
        return res.json({ response: response.text });
      }
    } catch {
      // Fallback AI response
    }

    res.json({
      response: `[Assistant IA Spaceflow] Analyse terminée pour "${message || 'optimisation'}": Nous vous recommandons d'augmenter le tarif horaire de la Salle Alpha de +10% lors des pics du mercredi et de proposer des abonnements Day Pass en heures creuses.`
    });
  });

  // Visitors API
  app.get('/api/visitors/today', (req, res) => {
    res.json(serverVisitors);
  });

  app.post('/api/visitors/invite', (req, res) => {
    const { visitorName, visitorEmail, hostMemberId, visitDate, timeSlot, purpose } = req.body;
    const host = serverMembers.find(m => m.id === hostMemberId);

    const newVisitor = {
      id: `vis-${Date.now().toString().slice(-4)}`,
      visitorName: visitorName || 'Invité Externe',
      visitorEmail: visitorEmail || 'invite@entreprise.com',
      hostMemberId: hostMemberId || 'mem-101',
      hostMemberName: host ? `${host.firstName} ${host.lastName}` : 'Jean Dupont',
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '14:00 - 16:00',
      status: 'EXPECTED',
      qrCodeToken: `VIS-QR-${Math.floor(Math.random() * 8999 + 1000)}`,
      purpose: purpose || 'Rendez-vous professionnel'
    };

    serverVisitors.unshift(newVisitor);
    res.status(201).json(newVisitor);
  });

  app.post('/api/visitors/:id/check-in', (req, res) => {
    const visitor = serverVisitors.find(v => v.id === req.params.id);
    if (!visitor) return res.status(404).json({ error: 'Pass visiteur introuvable' });

    visitor.status = 'CHECKED_IN';
    res.json({ success: true, message: 'Visiteur enregistré à l\'accueil !', visitor });
  });

  // Mobile PWA Member endpoints
  app.get('/api/mobile/my-bookings', (req, res) => {
    res.json(serverBookings.filter(b => b.memberId === 'mem-101'));
  });

  app.get('/api/mobile/my-invoices', (req, res) => {
    res.json(serverInvoices.filter(i => i.memberId === 'mem-101'));
  });

  // In-Memory Database Store for API Data
  let serverAssets = [
    {
      id: 'ast-01',
      code: 'HVAC-NORTH-01',
      name: 'Chiller Unité Principale Nord',
      category: 'HVAC',
      location: 'Bâtiment A - Toiture',
      floor: 'R+5',
      status: 'OPERATIONAL',
      healthScore: 96,
      temperature: 18.4,
      powerUsageKw: 42.5,
      lastMaintenance: '2026-07-15',
      nextScheduled: '2026-08-20',
      serialNumber: 'DAIKIN-9942-X',
      vendor: 'Daikin Applied',
    },
    {
      id: 'ast-02',
      code: 'ELEV-WEST-02',
      name: 'Ascenseur Panoramique Ouest',
      category: 'ELEVATOR',
      location: 'Bâtiment B - Atrium',
      floor: 'R+0 à R+12',
      status: 'WARNING',
      healthScore: 74,
      temperature: 28.1,
      powerUsageKw: 18.2,
      lastMaintenance: '2026-06-02',
      nextScheduled: '2026-08-05',
      serialNumber: 'OTIS-GEN2-331',
      vendor: 'Otis Elevator',
    },
    {
      id: 'ast-03',
      code: 'PWR-SUB-01',
      name: 'Sous-Station Électrique HTA/BT',
      category: 'ENERGY_GRID',
      location: 'Bâtiment C - Sous-Sol',
      floor: 'SS-2',
      status: 'OPERATIONAL',
      healthScore: 99,
      temperature: 22.0,
      powerUsageKw: 185.0,
      lastMaintenance: '2026-07-01',
      nextScheduled: '2026-09-01',
      serialNumber: 'SCHNEIDER-SM6-24',
      vendor: 'Schneider Electric',
    },
    {
      id: 'ast-04',
      code: 'FIRE-PUMP-01',
      name: 'Groupe Motopompe Incendie (RIA)',
      category: 'FIRE_SAFETY',
      location: 'Local Technique SS1',
      floor: 'SS-1',
      status: 'OPERATIONAL',
      healthScore: 92,
      temperature: 19.5,
      powerUsageKw: 5.5,
      lastMaintenance: '2026-07-28',
      nextScheduled: '2026-08-28',
      serialNumber: 'GRUNDFOS-NK-80',
      vendor: 'Grundfos',
    },
    {
      id: 'ast-05',
      code: 'HVAC-EAST-02',
      name: 'Centrale Traitement d\'Air (CTA) Est',
      category: 'HVAC',
      location: 'Bâtiment A - Aile Est',
      floor: 'R+3',
      status: 'CRITICAL',
      healthScore: 48,
      temperature: 34.2,
      powerUsageKw: 68.0,
      lastMaintenance: '2026-05-10',
      nextScheduled: '2026-08-01',
      serialNumber: 'CARRIER-39HQ-11',
      vendor: 'Carrier',
    },
  ];

  let serverLicenses = [
    { id: '1', key: 'CAFM-ENT-9942-8812-X', organization: 'Apex Real Estate', plan: 'ENTERPRISE', status: 'ACTIVE', createdDate: '2026-01-10', expiresDate: '2027-01-10', maxAssets: 1000 },
    { id: '2', key: 'CAFM-PRO-3310-4421-B', organization: 'TechLabs Corp', plan: 'PRO', status: 'ACTIVE', createdDate: '2026-03-15', expiresDate: '2027-03-15', maxAssets: 200 },
    { id: '3', key: 'CAFM-DEV-1100-2299-Z', organization: 'Sandbox Testing', plan: 'STARTER', status: 'REVOKED', createdDate: '2026-02-01', expiresDate: '2026-08-01', maxAssets: 50 },
  ];

  let serverWorkOrders = [
    { id: 'WO-991', title: 'Inspection Chiller Nord', assetCode: 'HVAC-NORTH-01', priority: 'URGENT', status: 'IN_PROGRESS', assignee: 'Karim V.' },
    { id: 'WO-992', title: 'Maintenance CTA Est', assetCode: 'HVAC-EAST-02', priority: 'HIGH', status: 'OPEN', assignee: 'Sophie M.' },
    { id: 'WO-993', title: 'Remplacement Filtre Air', assetCode: 'PWR-SUB-01', priority: 'NORMAL', status: 'COMPLETED', assignee: 'Marc L.' },
  ];

  let serverEmailLogs = [
    {
      id: 'msg-01',
      to: 'maintenance-team@cafmpro.com',
      subject: '[ALERTE CRITIQUE] Surchauffe CTA Est (34.2°C)',
      snippet: 'La centrale d\'air CTA Est signale une température anormale. Action urgente requise.',
      sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'SENT_VIA_GMAIL_API'
    },
    {
      id: 'msg-02',
      to: 'direction-technique@cafmpro.com',
      subject: '[RAPPORT DÉCADAIRE] Bilan énergétique Juillet 2026',
      snippet: 'Rapport mensuel consolidé d\'efficacité globale bâtiment A & B.',
      sentAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      status: 'SENT_VIA_GMAIL_API'
    }
  ];

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CAFM Pro / Sovereign Device Backend Server',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      activeAssetsCount: serverAssets.length,
      activeLicensesCount: serverLicenses.filter(l => l.status === 'ACTIVE').length
    });
  });

  // Admin / User Authentication Route
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'tarikbenaich@gmail.com').trim().toLowerCase();
    const superAdminPass = (process.env.SUPER_ADMIN_PASS || '0000_-tr').trim();

    // Check Site Super Admin Credentials
    if (cleanEmail === superAdminEmail && cleanPass === superAdminPass) {
      return res.json({
        success: true,
        user: {
          email: superAdminEmail,
          name: 'Super Admin CAFM',
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
        },
        token: process.env.JWT_SECRET || 'jwt_superadmin_token_cafm_2026',
      });
    }

    // Standard User Demo Authentication
    if (cleanPass.length >= 4) {
      return res.json({
        success: true,
        user: {
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: 'FACILITY_MANAGER',
          isSuperAdmin: false,
        },
        token: 'jwt_facility_manager_token_2026',
      });
    }

    return res.status(401).json({ error: 'Identifiants invalides' });
  });

  // Google OAuth / Gmail API Authentication Endpoint
  app.post('/api/auth/google/login', (req, res) => {
    const { googleToken, email, name, picture } = req.body;
    
    const userEmail = email || 'albertomodo.cc@gmail.com';
    const userName = name || 'Alberto Modo';
    const userAvatar = picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    return res.json({
      success: true,
      message: 'Authentification Google OAuth / API Gmail réussie !',
      user: {
        email: userEmail,
        name: userName,
        avatar: userAvatar,
        role: 'MANAGER_GMAIL_OAUTH',
        provider: 'GOOGLE_OAUTH',
        scopesAuthorized: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/gmail.readonly'
        ],
        googleToken: googleToken || `google_oauth_token_${Date.now()}`
      },
      token: `jwt_google_oauth_${Date.now()}`
    });
  });

  // License Endpoints
  app.get('/api/licenses', (req, res) => {
    res.json(serverLicenses);
  });

  app.post('/api/licenses', (req, res) => {
    const { organization, plan } = req.body;
    const newLicense = {
      id: `${Date.now()}`,
      key: `CAFM-${(plan || 'PRO').substring(0,3)}-${Math.floor(Math.random()*8999+1000)}-${Math.floor(Math.random()*8999+1000)}-X`,
      organization: organization || 'Nouvelle Entreprise Client',
      plan: plan || 'PRO',
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
      expiresDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      maxAssets: plan === 'ENTERPRISE' ? 1000 : plan === 'PRO' ? 250 : 50
    };
    serverLicenses.unshift(newLicense);
    res.status(201).json(newLicense);
  });

  app.put('/api/licenses/:id/revoke', (req, res) => {
    const lic = serverLicenses.find(l => l.id === req.params.id);
    if (!lic) return res.status(404).json({ error: 'Licence non trouvée' });
    lic.status = 'REVOKED';
    res.json(lic);
  });

  // ==========================================
  // SUBSCRIPTION & STRIPE CHECKOUT API
  // ==========================================

  const SUBSCRIPTION_PLANS: Record<string, { name: string; price: number; currency: string; stripePriceId: string }> = {
    starter:    { name: 'BizOS Starter',      price: 4900,  currency: 'eur', stripePriceId: process.env.STRIPE_PRICE_STARTER    || 'price_starter_test'    },
    pro:        { name: 'BizOS Professional', price: 14900, currency: 'eur', stripePriceId: process.env.STRIPE_PRICE_PRO        || 'price_pro_test'        },
    enterprise: { name: 'BizOS Enterprise',   price: 0,     currency: 'eur', stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_test' },
  };

  app.post('/api/subscription/create-session', async (req, res) => {
    const { planId, userId, successUrl, cancelUrl } = req.body;

    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      return res.status(400).json({ error: 'Plan invalide. Choisissez: starter, pro ou enterprise.' });
    }

    // Enterprise → contact sales redirect (no Stripe session)
    if (planId === 'enterprise') {
      return res.json({ url: `mailto:sales@bizos.io?subject=Enterprise%20Plan%20Inquiry`, planId });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey === '') {
      // Demo mode – no Stripe configured
      return res.json({
        url: null,
        demo: true,
        message: 'Stripe non configuré — mode démo. Configurez STRIPE_SECRET_KEY dans .env.local pour activer les paiements.',
        planId,
        plan: SUBSCRIPTION_PLANS[planId],
      });
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' });

      const plan = SUBSCRIPTION_PLANS[planId];
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: plan.stripePriceId,
          quantity: 1,
        }],
        metadata: { planId, userId: userId || '' },
        success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}?subscription=success&plan=${planId}`,
        cancel_url:  cancelUrl  || `${req.headers.origin || 'http://localhost:3000'}?subscription=cancelled`,
      });

      res.json({ url: session.url, sessionId: session.id, planId });
    } catch (err: any) {
      console.error('[Subscription] Stripe error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/subscription/plans — Return available plans metadata
  app.get('/api/subscription/plans', (_req, res) => {
    res.json({
      plans: [
        { id: 'starter',    name: 'Starter',      price: 49,  currency: 'EUR', features: ['50 membres', 'Réservations basiques', 'Support email', '1 site'] },
        { id: 'pro',        name: 'Professional', price: 149, currency: 'EUR', features: ['Membres illimités', 'Analytics avancées', 'Support 24/7', '3 sites', 'Marque personnalisée'] },
        { id: 'enterprise', name: 'Enterprise',   price: null,currency: 'EUR', features: ['Tout illimité', 'Account manager dédié', 'SLA garanti', 'Intégrations custom', 'API access'] },
      ]
    });
  });

  app.post('/api/licenses/validate', (req, res) => {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ valid: false, error: 'Clé de licence obligatoire' });
    }

    const key = String(licenseKey).trim().toUpperCase();
    const foundInStore = serverLicenses.find(l => l.key.toUpperCase() === key && l.status === 'ACTIVE');

    if (foundInStore) {
      return res.json({
        valid: true,
        key: foundInStore.key,
        plan: foundInStore.plan,
        organization: foundInStore.organization,
        maxAssets: foundInStore.maxAssets,
        expiresAt: foundInStore.expiresDate
      });
    }

    // Format verification fallback
    if (key.startsWith('CAFM-PRO-') || key.startsWith('CAFM-ENT-') || key.startsWith('SOV-') || key.length >= 16) {
      return res.json({
        valid: true,
        key: key,
        plan: key.includes('ENT') ? 'ENTERPRISE' : 'PRO',
        maxUsers: 25,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return res.status(400).json({
      valid: false,
      error: 'Format de licence inconnu ou invalide.',
    });
  });

  // Assets REST API
  app.get('/api/assets', (req, res) => {
    res.json(serverAssets);
  });

  app.post('/api/assets', (req, res) => {
    const newAsset = {
      id: `ast-${Date.now().toString().slice(-4)}`,
      code: req.body.code || `AST-${Math.floor(Math.random() * 900 + 100)}`,
      name: req.body.name || 'Nouvel Actif Équipement',
      category: req.body.category || 'HVAC',
      location: req.body.location || 'Bâtiment A',
      floor: req.body.floor || 'R+1',
      status: req.body.status || 'OPERATIONAL',
      healthScore: req.body.healthScore || 95,
      temperature: req.body.temperature || 21.0,
      powerUsageKw: req.body.powerUsageKw || 12.0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextScheduled: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      serialNumber: req.body.serialNumber || `SN-${Math.floor(Math.random() * 89999 + 10000)}`,
      vendor: req.body.vendor || 'Fournisseur Agréé'
    };
    serverAssets.unshift(newAsset);
    res.status(201).json(newAsset);
  });

  // Work Orders REST API
  app.get('/api/work-orders', (req, res) => {
    res.json(serverWorkOrders);
  });

  app.post('/api/work-orders', (req, res) => {
    const newWo = {
      id: `WO-${Math.floor(Math.random() * 899 + 100)}`,
      title: req.body.title || 'Nouvel Ordre de Travail',
      assetCode: req.body.assetCode || 'HVAC-NORTH-01',
      priority: req.body.priority || 'NORMAL',
      status: 'OPEN',
      assignee: req.body.assignee || 'Technicien d\'Astreinte'
    };
    serverWorkOrders.unshift(newWo);
    res.status(201).json(newWo);
  });

  // GMAO Predictive AI API
  app.post('/api/gmao/predict', async (req, res) => {
    const { equipment, equipmentId, telemetry, cause } = req.body;
    
    try {
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Tu es l'expert IA en maintenance prédictive industrielle et GMAO/CAFM.
Analyse cet équipement et ces données de télémesure:
Équipement: ${equipment || 'Variateur Cabine Nord'} (${equipmentId || 'ELEV-01'})
Anomalie/Cause observée: ${cause || 'Dérive vibratoire / surchauffe'}
Télémesures: ${JSON.stringify(telemetry || { temperature: '62.4°C', vibration: '3.8 mm/s' })}

Fournis une réponse au format JSON strict avec les clés:
{
  "riskScore": (nombre entre 0 et 100),
  "predictedFailureDate": "YYYY-MM-DD",
  "reasoning": "2 phrases d'explication technique",
  "recommendations": ["action 1", "action 2"],
  "recommendedPriority": "CRITICAL" ou "WARNING" ou "NORMAL"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, prediction: parsed, source: 'gemini-2.5-flash' });
        }
      }
    } catch (err) {
      console.error('Error calling Gemini for GMAO prediction:', err);
    }

    // Fallback AI Prediction engine
    const isHighRisk = (equipmentId || '').includes('ELEV') || (cause || '').includes('Surchauffe');
    res.json({
      success: true,
      source: 'bizos-predictive-engine',
      prediction: {
        riskScore: isHighRisk ? 88 : 64,
        predictedFailureDate: new Date(Date.now() + (isHighRisk ? 2 : 7) * 86400 * 1000).toISOString().split('T')[0],
        reasoning: `Analyse télémétrique pour ${equipment || 'Équipement'}: Dérive détectée sur les roulements et échauffement thermique au-delà des seuils nominaux ISO 10816.`,
        recommendations: [
          'Inspection thermographique infrarouge sous 48h',
          'Remplacement préventif des kits de ventilation secondaire',
          'Graissage des axes selon procédure constructeur SKF'
        ],
        recommendedPriority: isHighRisk ? 'CRITICAL' : 'WARNING'
      }
    });
  });

  // Telemetry Metrics API
  app.get('/api/telemetry/live', (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      telemetryValues: [
        parseFloat((5.0 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        parseFloat((2.2 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        parseFloat((7.1 + (Math.random() * 0.8 - 0.4)).toFixed(1)),
        parseFloat((1.8 + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        parseFloat((7.0 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
      ],
      powerKw: (310 + Math.random() * 15).toFixed(1),
      avgTemperature: (21.5 + Math.random() * 0.8).toFixed(1),
      activeAssets: serverAssets.length,
      criticalAlerts: serverAssets.filter(a => a.status === 'CRITICAL').length,
      healthIndex: 98.4,
    });
  });

  // Gmail API Integration Endpoints
  app.get('/api/gmail/status', (req, res) => {
    res.json({
      connected: true,
      service: 'Google Workspace Gmail API',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send'
      ],
      activeAccount: 'albertomodo.cc@gmail.com',
      totalEmailsSent: serverEmailLogs.length
    });
  });

  app.get('/api/gmail/messages', (req, res) => {
    res.json(serverEmailLogs);
  });

  app.post('/api/gmail/send', (req, res) => {
    const { to, subject, body } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Champs "to" et "subject" requis pour l\'envoi via Gmail API' });
    }

    const emailRecord = {
      id: `msg-${Date.now().toString().slice(-4)}`,
      to: String(to).trim(),
      subject: String(subject).trim(),
      snippet: String(body || '').slice(0, 120),
      sentAt: new Date().toISOString(),
      status: 'SENT_VIA_GMAIL_API'
    };

    serverEmailLogs.unshift(emailRecord);

    res.json({
      success: true,
      message: 'Email d\'alerte envoyé avec succès via l\'API Google Gmail !',
      email: emailRecord
    });
  });

  // Google Calendar API Store
  let serverGoogleCalendarEvents = [
    {
      id: 'gcal-evt-01',
      summary: '📅 Workshop Design & Product Strategy',
      description: 'Réservation Google Calendar pour l\'équipe UX/UI',
      location: 'Salle Alpha - Étage 1',
      start: { dateTime: new Date(Date.now() + 1000 * 3600 * 3).toISOString() },
      end: { dateTime: new Date(Date.now() + 1000 * 3600 * 5).toISOString() },
      status: 'confirmed',
      organizer: { email: 'albertomodo.cc@gmail.com', displayName: 'Alberto Modo' },
      attendees: [
        { email: 'jean.dupont@techcorp.io', responseStatus: 'accepted' },
        { email: 'marie.martin@designstudio.fr', responseStatus: 'accepted' }
      ],
      isSpaceFlowBooking: false
    },
    {
      id: 'gcal-evt-02',
      summary: '🏢 Point Hebdo CAFM Infrastructure',
      description: 'Revue hebdomadaire des équipements HVAC et ascenseurs',
      location: 'Bâtiment Principal - Salle du Conseil',
      start: { dateTime: new Date(Date.now() + 1000 * 3600 * 24).toISOString() },
      end: { dateTime: new Date(Date.now() + 1000 * 3600 * 25.5).toISOString() },
      status: 'confirmed',
      organizer: { email: 'superadmin@cafmpro.com', displayName: 'Direction Technique' },
      isSpaceFlowBooking: false
    }
  ];

  // Google Calendar Integration Endpoints
  app.get('/api/google/calendar/status', (req, res) => {
    res.json({
      connected: true,
      activeAccount: 'albertomodo.cc@gmail.com',
      scopesAuthorized: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      calendarId: 'primary'
    });
  });

  app.get('/api/google/calendar/events', (req, res) => {
    res.json({
      events: serverGoogleCalendarEvents,
      totalCount: serverGoogleCalendarEvents.length,
      timeZone: 'Europe/Paris'
    });
  });

  app.post('/api/google/calendar/events', (req, res) => {
    const { summary, description, location, startTime, endTime, attendees } = req.body;
    const newEvent = {
      id: `gcal-evt-${Date.now().toString().slice(-4)}`,
      summary: summary || 'Nouvel Événement Google Calendar',
      description: description || 'Créé via SpaceFlow Workspace Integration',
      location: location || 'Espace SpaceFlow',
      start: { dateTime: startTime || new Date().toISOString() },
      end: { dateTime: endTime || new Date(Date.now() + 3600 * 1000).toISOString() },
      status: 'confirmed',
      organizer: { email: 'albertomodo.cc@gmail.com', displayName: 'Alberto Modo' },
      attendees: (attendees || []).map((email: string) => ({ email, responseStatus: 'accepted' })),
      isSpaceFlowBooking: true
    };
    serverGoogleCalendarEvents.unshift(newEvent);
    res.status(201).json(newEvent);
  });

  app.post('/api/google/calendar/sync', (req, res) => {
    const { bookingId, summary, description, startTime, endTime, location } = req.body;
    const eventId = `gcal-sync-${bookingId || Date.now()}`;
    const syncedEvent = {
      id: eventId,
      summary: summary || `Réservation Synchronisée #${bookingId}`,
      description: description || 'Réservation SpaceFlow synchronisée via l\'API Google Calendar',
      location: location || 'Bâtiment SpaceFlow',
      start: { dateTime: startTime || new Date().toISOString() },
      end: { dateTime: endTime || new Date(Date.now() + 2 * 3600 * 1000).toISOString() },
      status: 'confirmed',
      organizer: { email: 'albertomodo.cc@gmail.com', displayName: 'Alberto Modo' },
      isSpaceFlowBooking: true
    };

    const existingIndex = serverGoogleCalendarEvents.findIndex(e => e.id === eventId);
    if (existingIndex >= 0) {
      serverGoogleCalendarEvents[existingIndex] = syncedEvent;
    } else {
      serverGoogleCalendarEvents.unshift(syncedEvent);
    }

    res.json({
      success: true,
      eventId,
      message: 'Réservation synchronisée avec l\'agenda Google Calendar !',
      event: syncedEvent
    });
  });

  // Google Sheets Export Endpoint
  app.post('/api/google/sheets/export', (req, res) => {
    res.json({
      success: true,
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      totalRowsExported: serverInvoices.length,
      exportedAt: new Date().toISOString()
    });
  });

  // BizOS AI Assistant endpoint (MeetAI & InboxAI)
  app.post('/api/bizos/ask', async (req, res) => {
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt manquant' });
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Tu es BizOS AI Assistant, l'intelligence artificielle intégrée à l'application MeetAI & InboxAI BizOS Mobile.
Réponds de façon synthétique, professionnelle et précise en français.
Contexte: ${context || 'Général BizOS Mobile'}
Question/Prompt de l'utilisateur: ${prompt}`,
        });
        const replyText = response.text || "Analyse terminée par BizOS AI.";
        return res.json({ reply: replyText });
      }
    } catch (err) {
      console.error('Gemini API call error in /api/bizos/ask:', err);
    }

    // Smart fallback if Gemini key is absent or errors
    const fallbackReply = `Analyse BizOS AI (${context || 'Général'}) : Concernant "${prompt}", l'intelligence artificielle confirme la bonne prise en compte des éléments et la synchronisation avec le tableau de bord BizOS Mobile.`;
    res.json({ reply: fallbackReply });
  });

  // ==========================================
  // VITE DEV SERVER / STATIC SERVING & STANDALONE LISTEN
  // ==========================================
  export async function startServer() {
    const PORT = 3000;
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[CAFM Pro Server] Running on http://0.0.0.0:${PORT}`);
    });
  }

  // Auto start when not in Vercel Serverless environment
  if (process.env.VERCEL !== '1' && process.env.IS_VERCEL !== 'true') {
    startServer();
  }

  export default app;

