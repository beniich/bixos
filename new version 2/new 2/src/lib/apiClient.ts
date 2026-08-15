/**
 * API Client Centralisé pour le Frontend
 * Fait le pont entre les composants React et les routes Backend (Express - server.ts)
 */

const API_BASE = '/api/v1';

export const apiClient = {
  
  licenses: {
    /** Valide une licence BizOS (ex: depuis le plugin WordPress) */
    validate: async (key: string, domain: string, options = {}) => {
      const res = await fetch(`${API_BASE}/licenses/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, domain, ...options })
      });
      return res.json();
    },
    
    /** Liste les licences existantes */
    list: async () => {
      const res = await fetch(`${API_BASE}/licenses/list`);
      return res.json();
    },

    /** Génère une nouvelle licence */
    issue: async (email: string, tier: string, cycle: string) => {
      const res = await fetch(`${API_BASE}/licenses/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier, cycle })
      });
      return res.json();
    }
  },

  cafm: {
    /** Synchronise les équipements (Assets) avec un ERP externe */
    syncAssets: async () => {
      const res = await fetch(`${API_BASE}/cafm/assets/sync`);
      return res.json();
    },
    
    /** Synchronise les bons de travail */
    syncWorkOrders: async () => {
      const res = await fetch(`${API_BASE}/cafm/workorders/sync`);
      return res.json();
    }
  },

  ai: {
    /** (Exemple) Lance un diagnostic IA sur le backend */
    diagnose: async (assetId: string, telemetryData: any) => {
      const res = await fetch(`${API_BASE}/ai/diagnostics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, telemetryData })
      });
      return res.json();
    }
  },

  security: {
    /** Récupère le statut de sécurité de la plateforme */
    status: async () => {
      const res = await fetch(`${API_BASE}/security/status`);
      return res.json();
    }
  }

};
