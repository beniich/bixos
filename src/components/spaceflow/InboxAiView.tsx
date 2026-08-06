import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Search, Bell, Sparkles, Inbox, AlertCircle, Mail, MessageSquare, 
  Paperclip, Reply, ReplyAll, Forward, Clock, Send, ThumbsUp, Edit3, 
  Grid, DollarSign, Users, Package, Settings, Plus, ArrowLeft, CheckCircle2
} from 'lucide-react';

interface InboxAiViewProps {
  isDarkMode?: boolean;
  setCurrentPage?: (page: PageId) => void;
}

interface MessageItem {
  id: string;
  sender: string;
  email: string;
  source: 'Email' | 'Slack' | 'Teams';
  avatarLetter: string;
  avatarBg: string;
  time: string;
  badge?: 'Priority' | 'Urgent' | 'New';
  subject: string;
  preview: string;
  fullBody: string[];
  attachments?: { name: string; size: string }[];
  aiSummary: string;
}

const MESSAGES: MessageItem[] = [
  {
    id: 'm1',
    sender: 'Sarah Jenkins',
    email: 's.jenkins@bizos.co',
    source: 'Email',
    avatarLetter: 'S',
    avatarBg: 'bg-[#da70d6]/20 text-[#ffaaf7]',
    time: '10:42 AM',
    badge: 'Priority',
    subject: 'Q3 Marketing Budget Approval',
    preview: 'Hi team, please find attached the revised figures for the Q3 marketing spend. We need to approve these before the sync tomorrow to ensure campaigns start on time.',
    fullBody: [
      'Hi team,',
      'Please find attached the revised figures for the Q3 marketing spend. We have adjusted the allocation for paid social based on last quarter\'s performance metrics.',
      'Key changes:',
      '• Increased LinkedIn spend by 15%\n• Reduced general display ads by 10%\n• Allocated new budget for the experimental AR campaign',
      'We need to approve these before the sync tomorrow to ensure campaigns start on time. Let me know if there are any final concerns.',
      'Best regards,\nSarah'
    ],
    attachments: [
      { name: 'Q3_Budget_v2.pdf', size: '2.4 MB' }
    ],
    aiSummary: 'Sarah requests approval for the revised Q3 marketing budget before tomorrow\'s sync. Key adjustments include increased LinkedIn spend and new AR campaign funding.'
  },
  {
    id: 'm2',
    sender: 'Elena Rostova',
    email: 'elena.r@nexuscorp.com',
    source: 'Slack',
    avatarLetter: 'E',
    avatarBg: 'bg-[#d0c1dc]/20 text-[#d0c1dc]',
    time: '09:15 AM',
    badge: 'Urgent',
    subject: 'Q3 Partnership Strategy Finalization',
    preview: 'I\'ve reviewed the latest projections for the Q3 rollout. The numbers look solid, but we need final sign-off on the vendor budget by 5 PM today.',
    fullBody: [
      'Hi team,',
      'I\'ve reviewed the latest projections for the Q3 rollout. The numbers look solid, but we need final sign-off on the vendor budget before 5 PM today, or we risk delaying the launch by a full sprint.',
      'Can you confirm if we are proceeding with the current allocation, or if we need an emergency meeting to renegotiate terms with AlphaTech?',
      'Best,\nElena'
    ],
    attachments: [
      { name: 'Q3_Partnership_Terms.pdf', size: '1.8 MB' }
    ],
    aiSummary: 'Elena needs final approval on the Q3 budget by 5 PM today to lock vendors and avoid a sprint delay.'
  },
  {
    id: 'm3',
    sender: 'Marcus Silva',
    email: 'marcus.s@bizos.co',
    source: 'Email',
    avatarLetter: 'M',
    avatarBg: 'bg-[#ffb95a]/20 text-[#ffb95a]',
    time: '2h ago',
    badge: 'New',
    subject: 'UI Components Review & Mobile Padding',
    preview: 'Just pushed the new components to the repo. Can someone review the padding on the new cards? Looks a bit tight on mobile views.',
    fullBody: [
      'Hey team,',
      'Just pushed the new components to the repo. Can someone review the padding on the new cards? Looks a bit tight on mobile views.',
      'Attached are the Figma design references.',
      'Cheers,\nMarcus'
    ],
    attachments: [
      { name: 'Figma_Design_Tokens.png', size: '4.1 MB' }
    ],
    aiSummary: 'Marcus updated the UI component library and requests a code review on mobile card padding.'
  }
];

export const InboxAiView: React.FC<InboxAiViewProps> = ({ setCurrentPage }) => {
  const [selectedId, setSelectedId] = useState<string>('m1');
  const [filter, setFilter] = useState<'All' | 'Priority' | 'Unread'>('All');
  const [quickReplyText, setQuickReplyText] = useState<string>('');
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);

  const selectedMsg = MESSAGES.find((m) => m.id === selectedId) || MESSAGES[0];

  const handleApplyPresetReply = (replyText: string) => {
    setQuickReplyText(replyText);
  };

  const handleSendReply = () => {
    if (!quickReplyText.trim()) return;
    setSentFeedback('Réponse envoyée avec succès via InboxAI Agent !');
    setQuickReplyText('');
    setTimeout(() => setSentFeedback(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans flex flex-col md:flex-row overflow-hidden relative border border-white/10 rounded-3xl shadow-2xl my-2">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#da70d6]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-[calc(100vh-100px)] min-h-[700px] overflow-hidden">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/10 bg-[#111415]/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {setCurrentPage && (
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Retour au Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>InboxAI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#da70d6]/20 border border-[#da70d6]/40 text-[#ffaaf7] font-mono">
                  Multi-Source Unified
                </span>
              </h1>
              <p className="text-xs text-slate-400">Emails, Slack, Teams & SMS synchronisés en temps réel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-64">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Rechercher partout..." 
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-500"
              />
            </div>
            <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 relative text-slate-300">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffb95a] rounded-full" />
            </button>
          </div>
        </header>

        {/* Workspace: Email List (Left) + Email Content (Center) + AI Sidebar (Right) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Email List Column */}
          <div className="w-full md:w-1/3 lg:w-2/5 flex flex-col border-r border-white/10 bg-[#0c0f10]/60 shrink-0">
            
            {/* Filter Buttons */}
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10 overflow-x-auto shrink-0">
              {(['All', 'Priority', 'Unread'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    filter === tab 
                      ? 'bg-[#da70d6] text-slate-950 font-bold shadow-[0_0_12px_rgba(218,112,214,0.4)]'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {tab === 'All' ? 'Tous' : tab === 'Priority' ? 'Smart Priority' : 'Non lus'}
                </button>
              ))}
            </div>

            {/* List Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {MESSAGES.map((msg) => {
                const isSelected = msg.id === selectedId;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-white/10 border-l-4 border-l-[#ffaaf7] border-white/20 shadow-lg' 
                        : 'border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${msg.avatarBg} flex items-center justify-center font-bold text-sm`}>
                          {msg.avatarLetter}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">{msg.sender}</h3>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span>{msg.source}</span>
                            <span>•</span>
                            <span>{msg.time}</span>
                          </p>
                        </div>
                      </div>
                      {msg.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffb95a]/20 text-[#ffb95a] border border-[#ffb95a]/30">
                          {msg.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-white mb-1 truncate">{msg.subject}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-light">{msg.preview}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email Content Reading Pane */}
          <div className="hidden md:flex flex-1 flex-col bg-[#111415] overflow-y-auto p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{selectedMsg.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${selectedMsg.avatarBg} flex items-center justify-center font-bold text-lg`}>
                    {selectedMsg.avatarLetter}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {selectedMsg.sender} <span className="text-xs font-normal text-slate-400">&lt;{selectedMsg.email}&gt;</span>
                    </div>
                    <div className="text-xs text-slate-400">Pour : Équipe Stratégie & Direction</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors" title="Répondre">
                  <Reply className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors" title="Transférer">
                  <Forward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body Lines */}
            <div className="space-y-4 text-sm text-slate-200 leading-relaxed font-light">
              {selectedMsg.fullBody.map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line">{paragraph}</p>
              ))}
            </div>

            {/* Attachments */}
            {selectedMsg.attachments && selectedMsg.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Pièces jointes ({selectedMsg.attachments.length})</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedMsg.attachments.map((att, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors">
                      <div className="p-2 rounded-lg bg-[#ffb95a]/20 text-[#ffb95a]">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{att.name}</div>
                        <div className="text-[10px] text-slate-400">{att.size}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Sidebar */}
          <div className="hidden lg:flex w-80 border-l border-white/10 bg-[#191c1d]/60 flex-col shrink-0">
            
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-[#da70d6]/10">
              <Sparkles className="w-4 h-4 text-[#ffaaf7]" />
              <h3 className="text-sm font-bold text-[#ffaaf7]">InboxAI Assistant</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-6">
              
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-[#ffaaf7]/30 shadow-[0_0_20px_rgba(255,170,247,0.1)] space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#ffaaf7]" />
                  <span>Résumé Automatique</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {selectedMsg.aiSummary}
                </p>
              </div>

              {/* Suggested Actions */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Suggestions de réponses</h4>
                
                <button
                  onClick={() => handleApplyPresetReply("C'est parfait pour moi, budget approuvé.")}
                  className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-[#ffaaf7]/50 bg-white/5 hover:bg-[#da70d6]/10 transition-all group flex items-start gap-3 cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4 text-[#ffaaf7] mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Approuver le budget</div>
                    <div className="text-[11px] text-slate-400 truncate">"C'est parfait pour moi, budget approuvé."</div>
                  </div>
                </button>

                <button
                  onClick={() => handleApplyPresetReply("Pouvez-vous revoir l'allocation de la campagne AR ?")}
                  className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-[#ffb95a]/50 bg-white/5 hover:bg-[#ffb95a]/10 transition-all group flex items-start gap-3 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-[#ffb95a] mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Demander une révision</div>
                    <div className="text-[11px] text-slate-400 truncate">"Pouvez-vous revoir l'allocation AR..."</div>
                  </div>
                </button>
              </div>

              {sentFeedback && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sentFeedback}</span>
                </div>
              )}

            </div>

            {/* Quick Reply Input */}
            <div className="p-4 border-t border-white/10 bg-[#0c0f10]">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-end gap-2">
                <textarea 
                  value={quickReplyText}
                  onChange={(e) => setQuickReplyText(e.target.value)}
                  placeholder="Rédiger une réponse avec l'IA..."
                  rows={2}
                  className="w-full bg-transparent border-none text-xs text-white focus:outline-none resize-none placeholder-slate-500"
                />
                <button 
                  onClick={handleSendReply}
                  className="p-2 rounded-lg bg-[#da70d6] text-slate-950 font-bold hover:bg-[#e056f7] transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
