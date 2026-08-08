import firebaseConfig from '../../firebase-applet-config.json';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './googleAuth';

/**
 * OAuth Client ID retrieved directly from firebase-applet-config.json
 */
export const GOOGLE_OAUTH_CLIENT_ID = firebaseConfig.oAuthClientId || '';

export interface FacilityAssetRow {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  lastInspection: string;
  powerKw: string;
}

/**
 * Gets the OAuth Client ID used for Google Workspace authentication.
 */
export function getOAuthClientId(): string {
  return GOOGLE_OAUTH_CLIENT_ID;
}

/**
 * Authenticates the user with Google OAuth using the configured client ID and scopes
 * specifically required for Google Sheets API access.
 */
export async function authenticateGoogleSheets(): Promise<{ user: User; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/drive.file');

  // Custom parameters can include client_id if required by specific endpoints
  if (GOOGLE_OAUTH_CLIENT_ID) {
    provider.setCustomParameters({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
    });
  }

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  
  if (!credential?.accessToken) {
    throw new Error('Failed to obtain Google access token for Sheets API.');
  }

  return {
    user: result.user,
    accessToken: credential.accessToken,
  };
}

/**
 * Fetches spreadsheet values from Google Sheets API (v4) for facility asset tracking.
 */
export async function fetchFacilityAssetSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  range: string = 'Sheet1!A1:Z100'
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || `Google Sheets API returned status ${response.status}`
    );
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Converts raw spreadsheet 2D array rows into structured FacilityAssetRow objects.
 */
export function parseFacilityAssetRows(rows: string[][]): FacilityAssetRow[] {
  if (!rows || rows.length <= 1) return [];

  // Assuming row 0 is header: ['Asset ID', 'Asset Name', 'Category', 'Location', 'Status', 'Last Inspection', 'Power Rating (kW)']
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `AST-${1000 + index}`,
    name: row[1] || 'Unnamed Equipment',
    category: row[2] || 'General',
    location: row[3] || 'Unassigned',
    status: row[4] || 'OPERATIONAL',
    lastInspection: row[5] || new Date().toISOString().slice(0, 10),
    powerKw: row[6] || '0.0',
  }));
}

/**
 * Creates a new Google Sheet for facility asset tracking populated with initial asset inventory.
 */
export async function createFacilityAssetSpreadsheet(
  accessToken: string,
  title: string = 'CAFM Pro - Facility Asset Inventory',
  assetsData?: FacilityAssetRow[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; values: string[][] }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const defaultAssets: FacilityAssetRow[] = assetsData || [
    { id: 'AST-1001', name: 'Centrifugal Chiller 500-Ton', category: 'HVAC', location: 'Plant Room - Basement B2', status: 'OPERATIONAL', lastInspection: '2026-07-28', powerKw: '380.0' },
    { id: 'AST-1002', name: 'Dry-Type Power Transformer 2500kVA', category: 'Electrical', location: 'Main Substation East', status: 'OPTIMAL', lastInspection: '2026-08-01', powerKw: '1250.0' },
    { id: 'AST-1003', name: 'Cleanroom AHU Air Handler Unit #04', category: 'HVAC', location: 'Cleanroom Annex Floor 3', status: 'MAINTENANCE_DUE', lastInspection: '2026-06-15', powerKw: '65.5' },
    { id: 'AST-1004', name: 'Uninterruptible Power Supply (UPS) 500kW', category: 'Critical Power', location: 'Data Center Battery Room A', status: 'OPERATIONAL', lastInspection: '2026-07-30', powerKw: '500.0' },
  ];

  const header = ['Asset ID', 'Asset Name / Equipment', 'Category', 'Facility Location', 'Status', 'Last Inspection', 'Power Rating (kW)'];
  const rows = [
    header,
    ...defaultAssets.map((a) => [a.id, a.name, a.category, a.location, a.status, a.lastInspection, a.powerKw]),
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: { title: 'Asset Inventory' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: rows.map((row) => ({
                values: row.map((cell) => ({ userEnteredValue: { stringValue: String(cell) } })),
              })),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create Google Spreadsheet for facility assets');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    values: rows,
  };
}
