import { LicenseKey, LicensePlan, LicenseStatus, LicenseStats } from '../types';

const LOCAL_STORAGE_KEY = 'cafm_pro_license_keys_v1';

// Key generator helper matching format: CAFM-{PLAN}-{XXXX}-{XXXX}-{XXXX}-{XXXX}
export function generateLicenseCode(plan: LicensePlan = 'PRO'): string {
  const hexSegment = () => Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase().padStart(4, '0');
  return `CAFM-${plan}-${hexSegment()}-${hexSegment()}-${hexSegment()}-${hexSegment()}`;
}

// Initial 20 pre-generated stock seed
function getSeedLicenses(): LicenseKey[] {
  const seed: LicenseKey[] = [];
  const now = new Date();
  
  // 15 Available PRO keys
  for (let i = 1; i <= 15; i++) {
    const exp = new Date(now);
    exp.setDate(exp.getDate() + 365);
    seed.push({
      id: `lic-seed-pro-${i}`,
      key: generateLicenseCode('PRO'),
      plan: 'PRO',
      maxUsers: 25,
      maxAssets: 1000,
      durationDays: 365,
      expiresAt: exp.toISOString(),
      status: 'AVAILABLE',
      generatedBy: 'admin@cafmpro.com',
      generatedAt: new Date(now.getTime() - i * 3600000 * 2).toISOString(),
      notes: 'Stock initial de production (Pack 20)',
    });
  }

  // 3 Available ENTERPRISE keys
  for (let i = 1; i <= 3; i++) {
    const exp = new Date(now);
    exp.setDate(exp.getDate() + 365);
    seed.push({
      id: `lic-seed-ent-${i}`,
      key: generateLicenseCode('ENTERPRISE'),
      plan: 'ENTERPRISE',
      maxUsers: 999,
      maxAssets: 99999,
      durationDays: 365,
      expiresAt: exp.toISOString(),
      status: 'AVAILABLE',
      generatedBy: 'admin@cafmpro.com',
      generatedAt: new Date(now.getTime() - i * 3600000 * 5).toISOString(),
      notes: 'Sovereign Enterprise Cluster License',
    });
  }

  // 2 USED keys (Demo active organizations)
  const usedExp1 = new Date(now);
  usedExp1.setDate(usedExp1.getDate() + 300);
  seed.push({
    id: `lic-seed-used-1`,
    key: `CAFM-PRO-9821-44B1-8890-C102`,
    plan: 'PRO',
    maxUsers: 25,
    maxAssets: 1000,
    durationDays: 365,
    expiresAt: usedExp1.toISOString(),
    status: 'USED',
    usedByOrgId: 'org-apex',
    usedByOrgName: 'Apex Corp Real Estate',
    usedAt: new Date(now.getTime() - 86400000 * 14).toISOString(),
    usedByEmail: 's.jenkins@apexcorp.com',
    usedByName: 'Sarah Jenkins',
    generatedBy: 'admin@cafmpro.com',
    generatedAt: new Date(now.getTime() - 86400000 * 20).toISOString(),
    notes: 'Assigné lors de la signature Apex Corp',
  });

  const usedExp2 = new Date(now);
  usedExp2.setDate(usedExp2.getDate() + 200);
  seed.push({
    id: `lic-seed-used-2`,
    key: `CAFM-ENTERPRISE-7731-901B-3312-FA01`,
    plan: 'ENTERPRISE',
    maxUsers: 999,
    maxAssets: 99999,
    durationDays: 365,
    expiresAt: usedExp2.toISOString(),
    status: 'USED',
    usedByOrgId: 'org-globaltech',
    usedByOrgName: 'Global Tech Facilities',
    usedAt: new Date(now.getTime() - 86400000 * 30).toISOString(),
    usedByEmail: 'd.lee@globaltech.io',
    usedByName: 'David Lee',
    generatedBy: 'admin@cafmpro.com',
    generatedAt: new Date(now.getTime() - 86400000 * 45).toISOString(),
    notes: 'Déploiement On-Premise Global Tech',
  });

  return seed;
}

export const LicenseStore = {
  getAll(): LicenseKey[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) {
        const seed = getSeedLicenses();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(data);
    } catch {
      return getSeedLicenses();
    }
  },

  saveAll(licenses: LicenseKey[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(licenses));
    } catch (e) {
      console.error('Failed to save licenses', e);
    }
  },

  list(filters: { status?: string; plan?: string; search?: string } = {}): LicenseKey[] {
    let list = this.getAll();

    // Auto update expired status
    const now = new Date();
    let updated = false;
    list = list.map((l) => {
      if (l.status === 'AVAILABLE' && l.expiresAt && new Date(l.expiresAt) < now) {
        updated = true;
        return { ...l, status: 'EXPIRED' };
      }
      return l;
    });
    if (updated) this.saveAll(list);

    if (filters.status) {
      list = list.filter((l) => l.status === filters.status);
    }

    if (filters.plan) {
      list = list.filter((l) => l.plan === filters.plan);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.key.toLowerCase().includes(query) ||
          (l.usedByEmail && l.usedByEmail.toLowerCase().includes(query)) ||
          (l.usedByName && l.usedByName.toLowerCase().includes(query)) ||
          (l.usedByOrgName && l.usedByOrgName.toLowerCase().includes(query)) ||
          (l.notes && l.notes.toLowerCase().includes(query))
      );
    }

    return list.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  },

  getStats(): LicenseStats {
    const all = this.getAll();
    const stats: LicenseStats = {
      total: all.length,
      available: 0,
      used: 0,
      revoked: 0,
      expired: 0,
      byPlan: { FREE: 0, PRO: 0, ENTERPRISE: 0 },
    };

    all.forEach((l) => {
      if (l.status === 'AVAILABLE') stats.available++;
      if (l.status === 'USED') stats.used++;
      if (l.status === 'REVOKED') stats.revoked++;
      if (l.status === 'EXPIRED') stats.expired++;

      if (stats.byPlan[l.plan] !== undefined) {
        stats.byPlan[l.plan]++;
      }
    });

    return stats;
  },

  generateBatch(params: {
    plan: LicensePlan;
    quantity: number;
    durationDays: number;
    maxUsers: number;
    maxAssets: number;
    notes?: string;
    generatedBy?: string;
  }): LicenseKey[] {
    const all = this.getAll();
    const newLicenses: LicenseKey[] = [];
    const now = new Date();

    for (let i = 0; i < params.quantity; i++) {
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + params.durationDays);

      const license: LicenseKey = {
        id: `lic-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        key: generateLicenseCode(params.plan),
        plan: params.plan,
        maxUsers: params.maxUsers,
        maxAssets: params.maxAssets,
        durationDays: params.durationDays,
        expiresAt: expiresAt.toISOString(),
        status: 'AVAILABLE',
        generatedBy: params.generatedBy || 'Super Admin',
        generatedAt: now.toISOString(),
        notes: params.notes,
      };

      newLicenses.push(license);
      all.unshift(license);
    }

    this.saveAll(all);
    return newLicenses;
  },

  revoke(id: string, reason: string, revokedBy = 'Super Admin'): LicenseKey | null {
    const all = this.getAll();
    const index = all.findIndex((l) => l.id === id);
    if (index === -1) return null;

    all[index] = {
      ...all[index],
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      revokedBy,
      revokedReason: reason,
    };

    this.saveAll(all);
    return all[index];
  },

  validateKey(key: string): { valid: boolean; reason?: string; license?: LicenseKey } {
    const cleanKey = key.trim().toUpperCase();
    const all = this.getAll();
    const license = all.find((l) => l.key.toUpperCase() === cleanKey);

    if (!license) {
      return { valid: false, reason: 'Clé de licence inexistante' };
    }

    if (license.status === 'USED') {
      return { valid: false, reason: 'Cette clé a déjà été consommée par un autre compte' };
    }

    if (license.status === 'REVOKED') {
      return { valid: false, reason: 'Cette clé de licence a été révoquée par un administrateur' };
    }

    if (license.status === 'EXPIRED' || (license.expiresAt && new Date() > new Date(license.expiresAt))) {
      return { valid: false, reason: 'Cette clé de licence a expiré' };
    }

    return { valid: true, license };
  },

  consumeKey(key: string, userInfo: { email: string; name: string; companyName: string }): LicenseKey | null {
    const validation = this.validateKey(key);
    if (!validation.valid || !validation.license) return null;

    const all = this.getAll();
    const index = all.findIndex((l) => l.id === validation.license!.id);
    if (index === -1) return null;

    const updated: LicenseKey = {
      ...all[index],
      status: 'USED',
      usedAt: new Date().toISOString(),
      usedByEmail: userInfo.email,
      usedByName: userInfo.name,
      usedByOrgName: userInfo.companyName,
      usedByOrgId: `org-${Date.now()}`,
    };

    all[index] = updated;
    this.saveAll(all);
    return updated;
  },

  exportCSV(): string {
    const all = this.getAll();
    const headers = [
      'ID',
      'Key',
      'Plan',
      'Status',
      'Max Users',
      'Max Assets',
      'Generated At',
      'Generated By',
      'Expires At',
      'Used At',
      'Used By Email',
      'Used By Name',
      'Used By Company',
      'Notes',
    ];

    const rows = all.map((l) => [
      l.id,
      l.key,
      l.plan,
      l.status,
      l.maxUsers,
      l.maxAssets,
      l.generatedAt,
      l.generatedBy,
      l.expiresAt,
      l.usedAt || '',
      l.usedByEmail || '',
      l.usedByName || '',
      l.usedByOrgName || '',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  resetToSeed(): void {
    const seed = getSeedLicenses();
    this.saveAll(seed);
  },
};
