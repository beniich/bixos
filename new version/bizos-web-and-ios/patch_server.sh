#!/bin/bash
cat << 'SERVER_EOF' > server.ts
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json());

const demoLicensesStore: Record<string, any> = {
  // Mock data...
};

// ==========================================
// 1. API ROUTES : CAFM / GMAO
// ==========================================
const cafmRouter = express.Router();

cafmRouter.get('/assets/sync', (req, res) => {
  res.json({
    success: true,
    assets: [
      { id: 'ELEV-01', name: 'Variateur Ascenseur Cabine Nord', type: 'ELEVATOR_DRIVE', location: 'Étage 5', healthScore: 68 },
      { id: 'HVAC-04', name: 'Centrale d\'Air Aile B', type: 'HVAC', location: 'Toiture B', healthScore: 96 }
    ]
  });
});

cafmRouter.get('/workorders/sync', (req, res) => {
  res.json({
    success: true,
    workOrders: [
      { id: 'WO-2026-092', assetId: 'ELEV-01', title: 'Inspection variateur', priority: 'HIGH', status: 'PENDING' }
    ]
  });
});

app.use('/api/v1/cafm', cafmRouter);


// ==========================================
// 2. API ROUTES : LICENSES
// ==========================================
const licenseRouter = express.Router();

licenseRouter.post('/validate', (req, res) => {
  res.json({ valid: true, message: 'License validated successfully (mock).' });
});

licenseRouter.post('/issue', (req, res) => {
  res.json({ success: true, message: 'License issued.' });
});

licenseRouter.get('/list', (req, res) => {
  res.json({ success: true, licenses: [] });
});

app.use('/api/v1/licenses', licenseRouter);


// ==========================================
// 3. API ROUTES : AI (Server-Side Logic)
// ==========================================
const aiRouter = express.Router();

aiRouter.post('/diagnostics', (req, res) => {
  res.json({
    success: true,
    diagnosis: "Anomalie détectée sur le moteur B. Remplacement recommandé.",
    confidence: 0.92
  });
});

app.use('/api/v1/ai', aiRouter);


// ==========================================
// 4. API ROUTES : SECURITY
// ==========================================
app.get('/api/v1/security/status', (req, res) => {
  res.json({
    status: 'secure',
    lastUpdate: new Date().toISOString()
  });
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

if (process.env.VERCEL !== '1' && process.env.IS_VERCEL !== 'true') {
  startServer();
}

export default app;
SERVER_EOF
