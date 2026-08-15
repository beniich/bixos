import React, { useState, useEffect } from 'react';
import { PageId, Language, WorkspaceCalendarEvent, WorkspaceContact, WorkspaceSheetData } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../../services/googleAuth';
import { GOOGLE_OAUTH_CLIENT_ID } from '../../services/googleSheets';
import {
  createFacilityLogSpreadsheet,
  fetchSpreadsheetData,
  appendRowToSpreadsheet,
  exportAssetInventoryToSheets,
  exportMaintenanceScheduleToSheets,
  fetchCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  fetchGoogleContacts,
  createGoogleContact,
} from '../../services/workspaceService';
import {
  FileSpreadsheet,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Search,
  Mail,
  Phone,
  ArrowRight,
  Database,
  Layers,
  Download,
  Upload,
  FileText,
  Boxes,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface WorkspacePageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: 'sheets' | 'calendar' | 'contacts'
  const [activeTab, setActiveTab] = useState<'sheets' | 'calendar' | 'contacts'>('sheets');

  // Loading States
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Data States
  const [sheetData, setSheetData] = useState<WorkspaceSheetData | null>(null);
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [calendarEvents, setCalendarEvents] = useState<WorkspaceCalendarEvent[]>([]);
  const [contacts, setContacts] = useState<WorkspaceContact[]>([]);

  // Feedback Messages
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Import Spreadsheet Input
  const [importSpreadsheetInput, setImportSpreadsheetInput] = useState('');
  const [importRange, setImportRange] = useState('Sheet1!A1:Z100');

  // Sample Asset Inventory Data
  const [assetInventory] = useState([
    { id: 'AST-1001', name: 'Centrifugal Chiller 500-Ton', category: 'HVAC', location: 'Plant Room - Basement B2', status: 'OPERATIONAL', lastInspection: '2026-07-28', powerKw: '380.0' },
    { id: 'AST-1002', name: 'Dry-Type Power Transformer 2500kVA', category: 'Electrical', location: 'Main Substation East', status: 'OPTIMAL', lastInspection: '2026-08-01', powerKw: '1250.0' },
    { id: 'AST-1003', name: 'Cleanroom AHU Air Handler Unit #04', category: 'HVAC', location: 'Cleanroom Annex Floor 3', status: 'MAINTENANCE_DUE', lastInspection: '2026-06-15', powerKw: '65.5' },
    { id: 'AST-1004', name: 'Uninterruptible Power Supply (UPS) 500kW', category: 'Critical Power', location: 'Data Center Battery Room A', status: 'OPERATIONAL', lastInspection: '2026-07-30', powerKw: '500.0' },
    { id: 'AST-1005', name: 'Emergency Diesel Generator 1250kW', category: 'Emergency Power', location: 'Yard Substation Enclosure', status: 'OPERATIONAL', lastInspection: '2026-07-20', powerKw: '1250.0' },
  ]);

  // Sample Maintenance Schedule Data
  const [maintenanceSchedule] = useState([
    { workOrderId: 'WO-8801', assetName: 'Centrifugal Chiller 500-Ton', taskType: 'Refrigerant & Oil Analysis', scheduledDate: '2026-08-10', assignedEngineer: 'Marcus Vance', priority: 'HIGH', status: 'SCHEDULED' },
    { workOrderId: 'WO-8802', assetName: 'Dry-Type Power Transformer 2500kVA', taskType: 'Thermal Imaging Inspection', scheduledDate: '2026-08-12', assignedEngineer: 'Elena Rostova', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { workOrderId: 'WO-8803', assetName: 'Cleanroom AHU Air Handler Unit #04', taskType: 'HEPA Filter Replacement', scheduledDate: '2026-08-05', assignedEngineer: 'Dr. Arthur Pendelton', priority: 'URGENT', status: 'SCHEDULED' },
    { workOrderId: 'WO-8804', assetName: 'Uninterruptible Power Supply (UPS) 500kW', taskType: 'Capacitor Bank Calibration', scheduledDate: '2026-08-18', assignedEngineer: 'Jean Dupont', priority: 'MEDIUM', status: 'SCHEDULED' },
  ]);

  // Modals for Confirmation (Mandatory requirement for workspace mutations)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  // Forms
  // 1. New Sheet Row Form
  const [newLogRow, setNewLogRow] = useState({
    assetId: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    facilityNode: 'Data Center HVAC Array B',
    status: 'OPERATIONAL',
    temperature: '22.5',
    power: '185.0',
    notes: 'Routine automated telemetry check',
  });

  // 2. New Calendar Event Form
  const [newEvent, setNewEvent] = useState({
    summary: 'Preventive Substation Maintenance',
    description: 'Quarterly thermal imaging & circuit breaker impedance audit.',
    location: 'Facility Substation Alpha - Floor 02',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '09:00',
    durationHours: '2',
  });

  // 3. New Contact Form
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: 'Sovereign Cyber Engineering',
    role: 'Chief MEP Specialist',
  });

  // Search filter for contacts
  const [contactSearch, setContactSearch] = useState('');

  // Initial Auth Sync
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        loadAllWorkspaceData(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setActionSuccess('Successfully authenticated with Google Workspace Suite!');
        await loadAllWorkspaceData(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google Workspace.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setToken(null);
      setSheetData(null);
      setSheetRows([]);
      setCalendarEvents([]);
      setContacts([]);
      setActionSuccess('Signed out of Google Workspace.');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Data Loading Helpers
  const loadAllWorkspaceData = async (accessToken: string) => {
    loadSheetsData(accessToken);
    loadCalendarData(accessToken);
    loadContactsData(accessToken);
  };

  const loadSheetsData = async (accessToken: string) => {
    setLoadingSheets(true);
    try {
      if (sheetData?.spreadsheetId) {
        const rows = await fetchSpreadsheetData(accessToken, sheetData.spreadsheetId);
        setSheetRows(rows);
      } else {
        // Mock preview fallback until user creates spreadsheet
        setSheetRows([
          ['Log ID', 'Asset / Facility Node', 'Status', 'Temperature (°C)', 'Power (kW)', 'Timestamp', 'Inspector / Notes'],
          ['LOG-9081', 'HVAC Chiller Block #4', 'OPERATIONAL', '21.4', '142.8', '2026-08-02 14:30', 'Routine sensor check normal'],
          ['LOG-9082', 'Main Transformer Switchgear', 'WARNING', '68.9', '890.2', '2026-08-02 15:00', 'Thermal spike detected on L2 phase'],
          ['LOG-9083', 'AHU Cleanroom Air Handler 02', 'OPERATIONAL', '19.8', '45.1', '2026-08-02 15:15', 'HEPA filter pressure drop optimal'],
        ]);
      }
    } catch (err: any) {
      console.warn('Sheets fetch error:', err);
    } finally {
      setLoadingSheets(false);
    }
  };

  const loadCalendarData = async (accessToken: string) => {
    setLoadingCalendar(true);
    try {
      const events = await fetchCalendarEvents(accessToken);
      setCalendarEvents(events);
    } catch (err: any) {
      console.warn('Calendar fetch error:', err);
      // Fallback display list if no events returned
      setCalendarEvents([
        {
          id: 'demo-1',
          summary: 'Annual High-Voltage Transformer Inspection',
          description: 'Sovereign grid power factor testing & dielectric breakdown check.',
          location: 'Building B - Substation Floor 1',
          start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
          end: { dateTime: new Date(Date.now() + 93600000).toISOString() },
        },
        {
          id: 'demo-2',
          summary: 'BIM 3D Digital Twin Sensor Calibration',
          description: 'Recalibrating 128 IoT vibration nodes across cleanrooms.',
          location: 'Smart Tower Tower 3',
          start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
          end: { dateTime: new Date(Date.now() + 180000000).toISOString() },
        },
      ]);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const loadContactsData = async (accessToken: string) => {
    setLoadingContacts(true);
    try {
      const resContacts = await fetchGoogleContacts(accessToken);
      setContacts(resContacts);
    } catch (err: any) {
      console.warn('Contacts fetch error:', err);
      setContacts([
        {
          name: 'Elena Rostova',
          email: 'elena.rostova@cyber-nexus.io',
          phone: '+1 (555) 019-2834',
          organization: 'Sovereign Engineering Corp',
          role: 'Principal HVAC Lead',
        },
        {
          name: 'Marcus Vance',
          email: 'm.vance@power-systems.net',
          phone: '+1 (555) 048-9921',
          organization: 'Apex Electrical Grid Services',
          role: 'High-Voltage Switchgear Technician',
        },
        {
          name: 'Dr. Arthur Pendelton',
          email: 'arthur.p@cleanroom-tech.org',
          phone: '+1 (555) 077-4410',
          organization: 'BioClean Micro-Environments',
          role: 'Environmental Systems Auditor',
        },
      ]);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Actions with Confirmation Modals
  // 1. Create Spreadsheet
  const handleCreateSpreadsheetPrompt = () => {
    if (!token) {
      handleGoogleLogin();
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Create Google Sheet in Google Drive?',
      description: 'This will create a new Google Spreadsheet titled "CAFM Pro - Asset Telemetry & Facility Log" in your Google Drive and write initial facility log headers.',
      onConfirm: async () => {
        try {
          setLoadingSheets(true);
          const newSheet = await createFacilityLogSpreadsheet(token);
          setSheetData(newSheet);
          setSheetRows(newSheet.values);
          setActionSuccess(`Spreadsheet created successfully! ID: ${newSheet.spreadsheetId}`);
        } catch (err: any) {
          alert(`Error creating spreadsheet: ${err.message}`);
        } finally {
          setLoadingSheets(false);
        }
      },
    });
  };

  // 2. Append Row to Sheet
  const handleAppendRowPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      handleGoogleLogin();
      return;
    }
    if (!sheetData?.spreadsheetId) {
      alert('Please create or connect a Google Sheet first using the button above.');
      return;
    }

    const rowValues = [
      newLogRow.assetId,
      newLogRow.facilityNode,
      newLogRow.status,
      newLogRow.temperature,
      newLogRow.power,
      new Date().toISOString().slice(0, 16).replace('T', ' '),
      newLogRow.notes,
    ];

    setConfirmModal({
      isOpen: true,
      title: 'Append Telemetry Row to Google Sheet?',
      description: `Target Sheet: "${sheetData.title}"\nRow: [${rowValues.join(', ')}]`,
      onConfirm: async () => {
        try {
          await appendRowToSpreadsheet(token, sheetData.spreadsheetId, rowValues);
          setSheetRows((prev) => [...prev, rowValues]);
          setActionSuccess('Successfully logged new row directly to Google Sheets!');
          setNewLogRow({
            assetId: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
            facilityNode: 'Chiller Block #03',
            status: 'OPERATIONAL',
            temperature: '21.0',
            power: '130.0',
            notes: 'Telemetry record appended',
          });
        } catch (err: any) {
          alert(`Failed to append row: ${err.message}`);
        }
      },
    });
  };

  // 2b. Export Asset Inventory to Google Sheets
  const handleExportAssetsPrompt = () => {
    if (!token) {
      handleGoogleLogin();
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Export Asset Inventory to Google Sheets?',
      description: `This will create a new Google Spreadsheet titled "CAFM Pro - Asset Inventory Export (${new Date().toLocaleDateString()})" in your Google Drive with ${assetInventory.length} registered assets.`,
      onConfirm: async () => {
        try {
          setLoadingSheets(true);
          const newSheet = await exportAssetInventoryToSheets(
            token,
            `CAFM Pro - Asset Inventory (${new Date().toISOString().slice(0, 10)})`,
            assetInventory
          );
          setSheetData(newSheet);
          setSheetRows(newSheet.values);
          setActionSuccess(`Asset Inventory successfully exported to Google Sheets! ID: ${newSheet.spreadsheetId}`);
        } catch (err: any) {
          alert(`Error exporting asset inventory: ${err.message}`);
        } finally {
          setLoadingSheets(false);
        }
      },
    });
  };

  // 2c. Export Maintenance Schedule to Google Sheets
  const handleExportSchedulePrompt = () => {
    if (!token) {
      handleGoogleLogin();
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Export Maintenance Schedule to Google Sheets?',
      description: `This will create a new Google Spreadsheet titled "CAFM Pro - Maintenance Schedule Export (${new Date().toLocaleDateString()})" in your Google Drive with ${maintenanceSchedule.length} work orders.`,
      onConfirm: async () => {
        try {
          setLoadingSheets(true);
          const newSheet = await exportMaintenanceScheduleToSheets(
            token,
            `CAFM Pro - Maintenance Schedule (${new Date().toISOString().slice(0, 10)})`,
            maintenanceSchedule
          );
          setSheetData(newSheet);
          setSheetRows(newSheet.values);
          setActionSuccess(`Maintenance Schedule successfully exported to Google Sheets! ID: ${newSheet.spreadsheetId}`);
        } catch (err: any) {
          alert(`Error exporting maintenance schedule: ${err.message}`);
        } finally {
          setLoadingSheets(false);
        }
      },
    });
  };

  // 2d. Import Existing Google Spreadsheet by ID or URL
  const handleImportSheetPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    let extractedId = importSpreadsheetInput.trim();
    // Parse if user pasted full URL: e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
    if (extractedId.includes('/d/')) {
      const parts = extractedId.split('/d/');
      if (parts[1]) {
        extractedId = parts[1].split('/')[0];
      }
    }

    if (!extractedId) {
      alert('Please enter a valid Google Spreadsheet ID or URL.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Import Facility Data from Google Sheet?',
      description: `Target Spreadsheet ID: ${extractedId}\nRange: ${importRange || 'Sheet1!A1:Z100'}`,
      onConfirm: async () => {
        try {
          setLoadingSheets(true);
          const rows = await fetchSpreadsheetData(token, extractedId, importRange || 'A1:Z100');
          setSheetData({
            spreadsheetId: extractedId,
            title: 'Imported Google Sheet (' + extractedId.slice(0, 8) + '...)',
            values: rows,
            spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${extractedId}`,
          });
          setSheetRows(rows);
          setActionSuccess(`Successfully imported ${rows.length} rows from Google Sheets!`);
        } catch (err: any) {
          alert(`Failed to import spreadsheet: ${err.message}`);
        } finally {
          setLoadingSheets(false);
        }
      },
    });
  };

  // Download CSV helper
  const handleDownloadCsv = () => {
    if (sheetRows.length === 0) return;
    const csvContent = 'data:text/csv;charset=utf-8,' + sheetRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cafm_facility_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Create Calendar Event
  const handleCreateEventPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      handleGoogleLogin();
      return;
    }

    const startIso = new Date(`${newEvent.date}T${newEvent.time}:00`).toISOString();
    const endIso = new Date(
      new Date(`${newEvent.date}T${newEvent.time}:00`).getTime() +
        parseFloat(newEvent.durationHours) * 3600000
    ).toISOString();

    const eventPayload: WorkspaceCalendarEvent = {
      summary: newEvent.summary,
      description: newEvent.description,
      location: newEvent.location,
      start: { dateTime: startIso },
      end: { dateTime: endIso },
    };

    setConfirmModal({
      isOpen: true,
      title: 'Schedule Event on Primary Google Calendar?',
      description: `Event: "${newEvent.summary}"\nDate: ${newEvent.date} at ${newEvent.time}\nLocation: ${newEvent.location}`,
      onConfirm: async () => {
        try {
          setLoadingCalendar(true);
          const created = await createCalendarEvent(token, eventPayload);
          setCalendarEvents((prev) => [created, ...prev]);
          setActionSuccess(`Calendar Event "${created.summary}" scheduled successfully!`);
        } catch (err: any) {
          alert(`Failed to schedule Google Calendar event: ${err.message}`);
        } finally {
          setLoadingCalendar(false);
        }
      },
    });
  };

  // 4. Delete Calendar Event
  const handleDeleteEventPrompt = (eventId: string, summary: string) => {
    if (!token) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Google Calendar Event?',
      description: `Are you sure you want to remove "${summary}" from your Google Calendar?`,
      onConfirm: async () => {
        try {
          setLoadingCalendar(true);
          await deleteCalendarEvent(token, eventId);
          setCalendarEvents((prev) => prev.filter((ev) => ev.id !== eventId));
          setActionSuccess(`Deleted event "${summary}" from Google Calendar.`);
        } catch (err: any) {
          alert(`Failed to delete event: ${err.message}`);
        } finally {
          setLoadingCalendar(false);
        }
      },
    });
  };

  // 5. Create Contact
  const handleCreateContactPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      handleGoogleLogin();
      return;
    }
    if (!newContact.name || !newContact.email) {
      alert('Please enter a name and email address.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Add New Contact to Google Contacts?',
      description: `Name: ${newContact.name}\nEmail: ${newContact.email}\nPhone: ${newContact.phone}\nCompany: ${newContact.company}`,
      onConfirm: async () => {
        try {
          setLoadingContacts(true);
          const created = await createGoogleContact(token, newContact);
          setContacts((prev) => [created, ...prev]);
          setActionSuccess(`Contact "${created.name}" added to Google Contacts!`);
          setNewContact({
            name: '',
            email: '',
            phone: '',
            company: 'Sovereign Cyber Engineering',
            role: 'Senior System Inspector',
          });
        } catch (err: any) {
          alert(`Failed to add Google Contact: ${err.message}`);
        } finally {
          setLoadingContacts(false);
        }
      },
    });
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.organization?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.role?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      
      {/* Top Header Banner */}
      <div className="glass-card-purple p-8 rounded-3xl border border-orange-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Workspace Sovereign Suite</span>
              </div>
              {GOOGLE_OAUTH_CLIENT_ID && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[11px] font-mono">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>OAuth Client ID Active</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Facility Workspace Integrations
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl">
              Connect Google Sheets for live IoT telemetry logs, Google Calendar for automated technician dispatch, and Google Contacts for emergency response teams.
            </p>
          </div>

          {/* User Auth Card / Sign In Button */}
          <div className="shrink-0 flex flex-col items-end gap-3">
            {user ? (
              <div className="glass-card p-4 rounded-2xl border border-green-500/30 flex items-center gap-4 bg-black/40">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-11 h-11 rounded-full border border-orange-500/50" />
                ) : (
                  <div className="w-11 h-11 rounded-full btn-gradient-orange flex items-center justify-center text-white font-bold text-lg">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{user.displayName || 'Authenticated User'}</span>
                    <span className="w-2 h-2 rounded-full bg-green-400 glow-orange-sm" />
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{user.email}</p>
                  <button
                    onClick={handleGoogleLogout}
                    className="text-[11px] text-orange-400 hover:underline mt-1 block"
                  >
                    Sign Out of Workspace
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {/* Official Material Google Sign-In Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="bg-white text-gray-800 hover:bg-gray-100 font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="text-sm font-semibold">
                    {isLoggingIn ? 'Connecting...' : 'Sign in with Google Workspace'}
                  </span>
                </button>
                <span className="text-[11px] text-gray-400 font-mono">
                  Grants access to Sheets, Calendar & Contacts
                </span>
              </div>
            )}
          </div>
        </div>

        {authError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-gray-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}
      </div>

      {/* Workspace Service Selector Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sheets'
              ? 'btn-gradient-orange text-white glow-orange shadow-lg'
              : 'glass-card text-gray-300 hover:text-white hover:border-orange-500/50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calendar'
              ? 'btn-gradient-orange text-white glow-orange shadow-lg'
              : 'glass-card text-gray-300 hover:text-white hover:border-orange-500/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Google Calendar Scheduler</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'contacts'
              ? 'btn-gradient-orange text-white glow-orange shadow-lg'
              : 'glass-card text-gray-300 hover:text-white hover:border-orange-500/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Google Contacts Directory</span>
        </button>
      </div>

      {/* TAB 1: GOOGLE SHEETS TELEMETRY & FACILITY DATA */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                Google Sheets Facility Data & Live Asset Logs
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Import and export facility management data — including asset inventories, maintenance schedules, and IoT telemetry logs — directly to Google Drive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {token && (
                <button
                  onClick={() => loadSheetsData(token)}
                  className="p-2.5 rounded-xl glass-card text-gray-300 hover:text-white hover:border-orange-500/50"
                  title="Refresh Sheet Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingSheets ? 'animate-spin text-orange-400' : ''}`} />
                </button>
              )}
              
              <button
                onClick={handleCreateSpreadsheetPrompt}
                className="btn-gradient-orange text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider glow-orange flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Telemetry Sheet</span>
              </button>
            </div>
          </div>

          {/* Quick Import / Export Facility Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Export Asset Inventory */}
            <div className="glass-card p-5 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Export Asset Inventory</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Export all registered chillers, transformers, and cleanroom AHUs to a formatted Google Sheet in Drive.
                </p>
              </div>
              <button
                onClick={handleExportAssetsPrompt}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Export Inventory ({assetInventory.length} Assets)</span>
              </button>
            </div>

            {/* Card 2: Export Maintenance Schedule */}
            <div className="glass-card p-5 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Export Maintenance Schedule</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Sync upcoming work orders, thermal imaging audits, and filter replacements directly to Google Sheets.
                </p>
              </div>
              <button
                onClick={handleExportSchedulePrompt}
                className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Export Schedule ({maintenanceSchedule.length} Orders)</span>
              </button>
            </div>

            {/* Card 3: Download Local CSV Backup */}
            <div className="glass-card p-5 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Download CSV Backup</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Download the current on-screen facility data table as an offline CSV document for local archival.
                </p>
              </div>
              <button
                onClick={handleDownloadCsv}
                disabled={sheetRows.length === 0}
                className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download (.CSV)</span>
              </button>
            </div>
          </div>

          {/* Import External Google Spreadsheet Form */}
          <div className="glass-card p-6 rounded-3xl border border-white/10">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-400" />
              Import Facility Data from Google Spreadsheet
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter the Google Spreadsheet ID or URL from your Google Drive to pull and visualize custom facility tables.
            </p>

            <form onSubmit={handleImportSheetPrompt} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-mono text-gray-400 block mb-1">Spreadsheet ID or Google Sheet URL</label>
                <input
                  type="text"
                  value={importSpreadsheetInput}
                  onChange={(e) => setImportSpreadsheetInput(e.target.value)}
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms OR https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-green-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Sheet Range (Optional)</label>
                <input
                  type="text"
                  value={importRange}
                  onChange={(e) => setImportRange(e.target.value)}
                  placeholder="Sheet1!A1:Z100"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-green-500 font-mono"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Google Spreadsheet</span>
                </button>
              </div>
            </form>
          </div>

          {sheetData?.spreadsheetUrl && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
              <span className="text-xs text-green-300 font-mono">
                Linked Spreadsheet: <strong>{sheetData.title}</strong>
              </span>
              <a
                href={sheetData.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-green-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Open in Google Sheets <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Append Row Form */}
          <div className="glass-card-purple p-6 rounded-3xl border border-orange-500/30">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-400" />
              Append New IoT Telemetry Log to Google Sheet
            </h3>
            <form onSubmit={handleAppendRowPrompt} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Asset ID</label>
                <input
                  type="text"
                  value={newLogRow.assetId}
                  onChange={(e) => setNewLogRow({ ...newLogRow, assetId: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Facility Node Location</label>
                <input
                  type="text"
                  value={newLogRow.facilityNode}
                  onChange={(e) => setNewLogRow({ ...newLogRow, facilityNode: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Status</label>
                <select
                  value={newLogRow.status}
                  onChange={(e) => setNewLogRow({ ...newLogRow, status: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                >
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="OPTIMAL">OPTIMAL</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Temp (°C)</label>
                <input
                  type="text"
                  value={newLogRow.temperature}
                  onChange={(e) => setNewLogRow({ ...newLogRow, temperature: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Power Draw (kW)</label>
                <input
                  type="text"
                  value={newLogRow.power}
                  onChange={(e) => setNewLogRow({ ...newLogRow, power: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Notes / Inspector</label>
                <input
                  type="text"
                  value={newLogRow.notes}
                  onChange={(e) => setNewLogRow({ ...newLogRow, notes: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="btn-gradient-orange text-white px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider glow-orange"
                >
                  Append Log to Google Sheet
                </button>
              </div>
            </form>
          </div>

          {/* Spreadsheet Data Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-xl">
            <div className="p-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 uppercase">
                {sheetData ? `Live Rows from "${sheetData.title}"` : 'Live Telemetry Logs Preview'}
              </span>
              <span className="text-xs text-orange-400 font-mono">{sheetRows.length} Total Rows</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-xs font-mono text-gray-400 uppercase">
                    {sheetRows[0]?.map((header, idx) => (
                      <th key={idx} className="p-3.5">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {sheetRows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3.5 font-mono text-xs text-gray-200">
                          {cIdx === 2 ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cell === 'OPERATIONAL' || cell === 'OPTIMAL'
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {cell}
                            </span>
                          ) : (
                            cell
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE CALENDAR MAINTENANCE SCHEDULER */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Google Calendar Maintenance Dispatch
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Schedule technician site visits, environmental compliance audits, and equipment overhauls straight onto your Google Calendar.
              </p>
            </div>

            {token && (
              <button
                onClick={() => loadCalendarData(token)}
                className="p-2.5 rounded-xl glass-card text-gray-300 hover:text-white hover:border-orange-500/50 flex items-center gap-2 text-xs font-mono"
              >
                <RefreshCw className={`w-4 h-4 ${loadingCalendar ? 'animate-spin text-orange-400' : ''}`} />
                <span>Sync Calendar</span>
              </button>
            )}
          </div>

          {/* Schedule Event Form */}
          <div className="glass-card-purple p-6 rounded-3xl border border-orange-500/30">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Schedule Maintenance Task on Primary Google Calendar
            </h3>
            <form onSubmit={handleCreateEventPrompt} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Event Summary</label>
                <input
                  type="text"
                  value={newEvent.summary}
                  onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Location / Node</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={newEvent.durationHours}
                  onChange={(e) => setNewEvent({ ...newEvent, durationHours: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                />
              </div>
              <div className="lg:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="btn-gradient-orange text-white px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider glow-orange flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule in Google Calendar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Scheduled Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarEvents.map((ev) => (
              <div
                key={ev.id || ev.summary}
                className="glass-card p-5 rounded-3xl border border-white/10 hover:border-orange-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-base">{ev.summary}</h4>
                  {ev.id && !ev.id.startsWith('demo') && (
                    <button
                      onClick={() => handleDeleteEventPrompt(ev.id!, ev.summary)}
                      className="text-gray-400 hover:text-red-400 p-1"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-300 line-clamp-2">{ev.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{new Date(ev.start.dateTime).toLocaleString()}</span>
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-1 text-blue-300">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>

                {ev.htmlLink && (
                  <a
                    href={ev.htmlLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-orange-400 hover:underline pt-1 font-semibold"
                  >
                    View in Google Calendar <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE CONTACTS DIRECTORY */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Google Contacts Emergency Directory
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Access certified engineers, emergency responders, and contractor contacts directly synchronized from Google Contacts.
              </p>
            </div>

            {token && (
              <button
                onClick={() => loadContactsData(token)}
                className="p-2.5 rounded-xl glass-card text-gray-300 hover:text-white hover:border-orange-500/50 flex items-center gap-2 text-xs font-mono"
              >
                <RefreshCw className={`w-4 h-4 ${loadingContacts ? 'animate-spin text-orange-400' : ''}`} />
                <span>Fetch Google Contacts</span>
              </button>
            )}
          </div>

          {/* Add Contact Form & Search */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Contact Form */}
            <div className="glass-card-purple p-6 rounded-3xl border border-orange-500/30 lg:col-span-1 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Add New Contractor to Google Contacts
              </h3>

              <form onSubmit={handleCreateContactPrompt} className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="e.g. Jean Dupont"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Work Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="jean@technician-services.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+33 1 42 68 00 00"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Company / Org</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Role / Specialization</label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-gradient-orange text-white py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider glow-orange mt-2"
                >
                  Save to Google Contacts
                </button>
              </form>
            </div>

            {/* Contacts Directory List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search contacts by name, email, company or role..."
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredContacts.map((contact, idx) => (
                  <div
                    key={contact.resourceName || idx}
                    className="glass-card p-5 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all flex items-start gap-4"
                  >
                    {contact.photoUrl ? (
                      <img src={contact.photoUrl} alt={contact.name} className="w-12 h-12 rounded-full border border-purple-500/40" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg">
                        {contact.name.charAt(0)}
                      </div>
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm truncate">{contact.name}</h4>
                      <p className="text-xs text-orange-400 font-mono truncate">{contact.role}</p>
                      <p className="text-[11px] text-gray-400 truncate">{contact.organization}</p>
                      
                      <div className="pt-2 flex flex-col gap-1 text-[11px] text-gray-300 font-mono">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-orange-400 truncate">
                            <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-green-400 truncate">
                            <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                            <span>{contact.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL (Mandatory per workspace integration guidelines) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card-purple max-w-md w-full p-6 rounded-3xl border border-orange-500/50 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
            </div>

            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 rounded-xl glass-card text-xs font-bold text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  await action();
                }}
                className="px-5 py-2 rounded-xl btn-gradient-orange text-xs font-extrabold text-white uppercase tracking-wider glow-orange"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
