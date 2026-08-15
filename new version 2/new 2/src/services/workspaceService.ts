import { WorkspaceCalendarEvent, WorkspaceContact, WorkspaceSheetData } from '../types';

// ==========================================
// GOOGLE SHEETS API (v4)
// ==========================================

export async function createFacilityLogSpreadsheet(
  accessToken: string,
  title: string = 'CAFM Pro - Asset Telemetry & Facility Log'
): Promise<WorkspaceSheetData> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const initialValues = [
    ['Log ID', 'Asset / Facility Node', 'Status', 'Temperature (°C)', 'Power (kW)', 'Timestamp', 'Inspector / Notes'],
    ['LOG-9081', 'HVAC Chiller Block #4', 'OPERATIONAL', '21.4', '142.8', new Date().toISOString().slice(0, 16).replace('T', ' '), 'Routine sensor check normal'],
    ['LOG-9082', 'Main Transformer Switchgear', 'WARNING', '68.9', '890.2', new Date().toISOString().slice(0, 16).replace('T', ' '), 'Thermal spike detected on L2 phase'],
    ['LOG-9083', 'AHU Cleanroom Air Handler 02', 'OPERATIONAL', '19.8', '45.1', new Date().toISOString().slice(0, 16).replace('T', ' '), 'HEPA filter pressure drop optimal'],
    ['LOG-9084', 'UPS Battery Storage Module C', 'OPTIMAL', '24.1', '310.0', new Date().toISOString().slice(0, 16).replace('T', ' '), 'Cell voltage balanced'],
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
          properties: { title: 'Telemetry Logs' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: initialValues.map((row) => ({
                values: row.map((cell) => ({ userEnteredValue: { stringValue: cell } })),
              })),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    spreadsheetUrl: data.spreadsheetUrl,
    values: initialValues,
  };
}

export async function fetchSpreadsheetData(
  accessToken: string,
  spreadsheetId: string,
  range: string = 'Telemetry Logs!A1:Z100'
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to read Google Spreadsheet values');
  }

  const data = await response.json();
  return data.values || [];
}

export async function appendRowToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  rowValues: string[],
  range: string = 'Telemetry Logs!A1'
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to append row to Google Spreadsheet');
  }
}

// ==========================================
// GOOGLE SHEETS API (v4) - ASSETS & SCHEDULES
// ==========================================

export async function exportAssetInventoryToSheets(
  accessToken: string,
  title: string = 'CAFM Pro - Asset Inventory Export',
  assetsData: Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    status: string;
    lastInspection: string;
    powerKw: string;
  }>
): Promise<WorkspaceSheetData> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const rows = [
    ['Asset ID', 'Asset Name / Equipment', 'Category', 'Facility Location', 'Status', 'Last Inspection', 'Power Rating (kW)'],
    ...assetsData.map((a) => [a.id, a.name, a.category, a.location, a.status, a.lastInspection, a.powerKw]),
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
              rowData: rows.map((r) => ({
                values: r.map((cell) => ({ userEnteredValue: { stringValue: String(cell) } })),
              })),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to export asset inventory to Google Sheets');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    spreadsheetUrl: data.spreadsheetUrl,
    values: rows,
  };
}

export async function exportMaintenanceScheduleToSheets(
  accessToken: string,
  title: string = 'CAFM Pro - Maintenance Schedule Export',
  scheduleData: Array<{
    workOrderId: string;
    assetName: string;
    taskType: string;
    scheduledDate: string;
    assignedEngineer: string;
    priority: string;
    status: string;
  }>
): Promise<WorkspaceSheetData> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const rows = [
    ['Work Order ID', 'Asset Name', 'Maintenance Task Type', 'Scheduled Date', 'Assigned Specialist', 'Priority', 'Status'],
    ...scheduleData.map((s) => [s.workOrderId, s.assetName, s.taskType, s.scheduledDate, s.assignedEngineer, s.priority, s.status]),
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
          properties: { title: 'Maintenance Schedule' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: rows.map((r) => ({
                values: r.map((cell) => ({ userEnteredValue: { stringValue: String(cell) } })),
              })),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to export maintenance schedule to Google Sheets');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    spreadsheetUrl: data.spreadsheetUrl,
    values: rows,
  };
}


export async function fetchCalendarEvents(accessToken: string): Promise<WorkspaceCalendarEvent[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&singleEvents=true&orderBy=startTime&maxResults=20`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to fetch Google Calendar events');
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || 'Facility Event',
    description: item.description || '',
    location: item.location || '',
    start: item.start || { dateTime: new Date().toISOString() },
    end: item.end || { dateTime: new Date().toISOString() },
    htmlLink: item.htmlLink,
  }));
}

export async function createCalendarEvent(
  accessToken: string,
  event: WorkspaceCalendarEvent
): Promise<WorkspaceCalendarEvent> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description || 'Scheduled via CAFM Pro Sovereign Facility Hub',
      location: event.location || 'Data Center Alpha - Main Switchboard',
      start: event.start,
      end: event.end,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to schedule event in Google Calendar');
  }

  const data = await response.json();
  return {
    id: data.id,
    summary: data.summary,
    description: data.description,
    location: data.location,
    start: data.start,
    end: data.end,
    htmlLink: data.htmlLink,
  };
}

export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to delete event from Google Calendar');
  }
}

// ==========================================
// GOOGLE CONTACTS / PEOPLE API (v1)
// ==========================================

export async function fetchGoogleContacts(accessToken: string): Promise<WorkspaceContact[]> {
  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations,photos&pageSize=50';

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to fetch Google Contacts');
  }

  const data = await response.json();
  const connections = data.connections || [];

  return connections.map((person: any) => {
    const name = person.names?.[0]?.displayName || 'Unnamed Contact';
    const email = person.emailAddresses?.[0]?.value || '';
    const phone = person.phoneNumbers?.[0]?.value || '';
    const organization = person.organizations?.[0]?.name || '';
    const role = person.organizations?.[0]?.title || 'Technician / Contractor';
    const photoUrl = person.photos?.[0]?.url || '';

    return {
      resourceName: person.resourceName,
      name,
      email,
      phone,
      organization,
      role,
      photoUrl,
    };
  });
}

export async function createGoogleContact(
  accessToken: string,
  contact: { name: string; email: string; phone: string; role?: string; company?: string }
): Promise<WorkspaceContact> {
  const url = 'https://people.googleapis.com/v1/people:createContact';

  const nameParts = contact.name.trim().split(' ');
  const givenName = nameParts[0] || '';
  const familyName = nameParts.slice(1).join(' ') || '';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      names: [{ givenName, familyName }],
      emailAddresses: [{ value: contact.email }],
      phoneNumbers: [{ value: contact.phone }],
      organizations: [
        {
          name: contact.company || 'Facility Vendor / Partner',
          title: contact.role || 'Certified Chief Engineer',
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to create contact in Google Contacts');
  }

  const data = await response.json();
  return {
    resourceName: data.resourceName,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    organization: contact.company || 'Facility Vendor / Partner',
    role: contact.role || 'Certified Chief Engineer',
  };
}
