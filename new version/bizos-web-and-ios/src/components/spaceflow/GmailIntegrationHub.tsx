import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, RefreshCw, CheckCircle2, AlertTriangle, Lock, Unlock, 
  Inbox, FileText, Sparkles, ExternalLink, ShieldCheck, Search, Filter,
  Check, ArrowRight, UserCheck
} from 'lucide-react';
import { 
  connectGmailAccount, 
  fetchGmailMaintenanceEmails, 
  sendGmailNotification, 
  GmailMessageDetail,
  getCachedGmailAccessToken,
  setCachedGmailAccessToken
} from '../../services/gmailService';
import { useAuth } from '../../context/AuthContext';

export const GmailIntegrationHub: React.FC = () => {
  const { user, profile } = useAuth();

  const [accessToken, setAccessToken] = useState<string | null>(getCachedGmailAccessToken());
  const [connectedEmail, setConnectedEmail] = useState<string | null>(user?.email || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emails, setEmails] = useState<GmailMessageDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('subject:GMAO OR subject:Failure OR subject:Maintenance');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Send Email Modal / Confirmation Dialog
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>('maintenance@bizos-gmao.com');
  const [emailSubject, setEmailSubject] = useState<string>('[BIZOS GMAO] Urgent Maintenance Alert - Paris North Site');
  const [emailBody, setEmailBody] = useState<string>(
    'Hello,\n\nA critical incident has been detected on the main Backup Generator.\nSite: Paris North Facility\nStatus: Intervention required within 2 hours.\n\nBest regards,\nBizOS Operations Team'
  );
  const [showConfirmSend, setShowConfirmSend] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Initialize or fetch emails if token is available
  useEffect(() => {
    if (accessToken) {
      loadEmails(accessToken, searchQuery);
    }
  }, [accessToken]);

  const handleConnectGmail = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { email, token } = await connectGmailAccount();
      setAccessToken(token);
      setConnectedEmail(email);
      setSuccessMsg(`Successfully connected to Gmail API for ${email}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadEmails(token, searchQuery);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to Gmail API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setCachedGmailAccessToken(null);
    setAccessToken(null);
    setEmails([]);
    setSuccessMsg('Disconnected from Gmail account.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const loadEmails = async (token: string, queryStr: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const fetched = await fetchGmailMaintenanceEmails(token, queryStr);
      setEmails(fetched);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading Gmail messages.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadEmails(accessToken, searchQuery);
    }
  };

  const executeSendEmail = async () => {
    if (!accessToken) {
      setErrorMsg('Please connect your Gmail account first.');
      return;
    }

    setIsSending(true);
    setErrorMsg('');
    try {
      await sendGmailNotification(accessToken, recipient, emailSubject, emailBody);
      setSuccessMsg(`Email successfully sent to ${recipient} via Gmail API!`);
      setShowConfirmSend(false);
      setShowSendModal(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white font-sans">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#140826]/90 border border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.2)] backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/30 via-pink-600/30 to-purple-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <Mail className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30 uppercase tracking-widest">
                GOOGLE WORKSPACE API INTEGRATION
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Gmail API Connected (Read & Send)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Email & Notifications Hub <span className="bg-gradient-to-r from-red-400 via-[#f472b6] to-[#d946ef] bg-clip-text text-transparent">Gmail API</span>
            </h1>
          </div>
        </div>

        {/* OAuth Authentication Button */}
        <div>
          {!accessToken ? (
            <button
              onClick={handleConnectGmail}
              disabled={isLoading}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs flex items-center gap-3 shadow-xl transition-all cursor-pointer border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google Gmail'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{connectedEmail}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">OAuth Token Active</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-300 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications / Feedback Toast */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Gmail Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Email Explorer & Search */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#140826]/90 border border-white/10 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <Inbox className="w-5 h-5 text-red-400" />
                <span>Received GMAO Messages & Alerts</span>
              </h2>
              <p className="text-xs text-slate-400">
                Emails synced live via Gmail API
              </p>
            </div>

            {accessToken && (
              <button
                onClick={() => setShowSendModal(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send GMAO Report via Email</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Gmail messages (e.g. subject:GMAO OR subject:Failure)"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={!accessToken || isLoading}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
              <span>Filter</span>
            </button>
          </form>

          {/* Messages List */}
          {!accessToken ? (
            <div className="p-8 text-center bg-black/30 rounded-2xl border border-white/5 space-y-3">
              <Lock className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-slate-300">Gmail Connection Required</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Sign in with Google Gmail" above to authorize the application to view and send maintenance reports via Gmail API.
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
              <span>Loading messages from Gmail API...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5 space-y-2">
              <Inbox className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-xs font-mono text-slate-300 font-bold">No emails found for current search query</div>
              <p className="text-[11px] text-slate-400">Try modifying your search terms in the input field above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((msg) => (
                <div 
                  key={msg.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/40 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-red-200 line-clamp-1">
                      {msg.subject}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {msg.date ? new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div className="text-xs text-purple-300 font-mono">
                    From: {msg.from}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {msg.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: API Features & Scopes Explanation */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#1e0a38]/80 border border-white/10 shadow-xl space-y-4">
          <h2 className="text-sm font-extrabold flex items-center gap-2 text-red-300 uppercase font-mono tracking-wider">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Gmail API Specifications</span>
          </h2>

          <div className="space-y-3 font-sans text-xs">
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-1">
              <div className="font-bold text-red-200 flex items-center justify-between">
                <span>Scope: gmail.readonly</span>
                <Lock className="w-3.5 h-3.5 text-red-400" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Allows reading failure notifications, vendor reports, and GMAO tickets sent via email.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/30 space-y-1">
              <div className="font-bold text-pink-200 flex items-center justify-between">
                <span>Scope: gmail.send</span>
                <Send className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Enables sending intervention reports and critical alerts directly to maintenance teams.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-[11px] font-mono text-slate-400 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security & Consent</span>
              </div>
              <p>
                An explicit confirmation dialog is systematically presented before sending any email in compliance with Google Workspace standards.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Compose & Send Email */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-[#1e0a38] border border-red-500/50 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Send className="w-5 h-5 text-red-400" />
              <span>Send GMAO Email Notification</span>
            </h3>

            {!showConfirmSend ? (
              <form onSubmit={(e) => { e.preventDefault(); setShowConfirmSend(true); }} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1 font-bold">Recipient</label>
                  <input 
                    type="email"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-black/40 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1 font-bold">Email Subject</label>
                  <input 
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-black/40 border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1 font-bold">Message Body</label>
                  <textarea 
                    rows={5}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-black/40 border border-white/20 text-white text-xs leading-relaxed focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-extrabold shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <span>Preview & Confirm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              /* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE/MUTATING OPERATION */
              <div className="space-y-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 text-xs font-extrabold text-red-300 font-mono">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Send Confirmation Required (Google Workspace API)</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  You are about to send an official email via your connected Gmail account (<strong className="text-white">{connectedEmail}</strong>) to <strong className="text-red-300">{recipient}</strong>.
                </p>

                <div className="p-3 rounded-xl bg-black/50 text-[11px] font-mono space-y-1 text-slate-300">
                  <div><strong>Subject:</strong> {emailSubject}</div>
                  <div className="line-clamp-2"><strong>Preview:</strong> {emailBody}</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmSend(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={executeSendEmail}
                    disabled={isSending}
                    className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending via Gmail API...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm Final Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
