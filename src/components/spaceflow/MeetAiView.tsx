import React, { useState } from 'react';
import { 
  Video, Calendar, Clock, Users, ChevronRight, Sparkles, Home, MessageSquare, 
  CheckSquare, User, Bot, Plus, CheckCircle2, ArrowRight, Play, Download, Search, Send,
  TrendingUp, BarChart3, Folder, Shield, ArrowUpRight, FileText
} from 'lucide-react';
import { PageId } from '../../types';

interface MeetAiViewProps {
  isDarkMode?: boolean;
  setCurrentPage?: (page: PageId) => void;
}

interface Meeting {
  id: string;
  title: string;
  time: string;
  date: string;
  category: 'upcoming' | 'past';
  participants: { name: string; avatar: string }[];
  extraParticipantsCount?: number;
  summaryTitle: string;
  keyDecisions: string[];
  nodes: { id: string; label: string; status: 'active' | 'completed' | 'pending'; type: 'start' | 'decision' | 'outcome' }[];
}

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Project Kickoff',
    time: '10:00 AM',
    date: 'Demain',
    category: 'upcoming',
    participants: [
      { name: 'Alex M.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { name: 'Sophie L.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
    ],
    summaryTitle: 'Kickoff Stratégique & Alignement Roadmap',
    keyDecisions: [
      'Valider les jalons Sprint 1 à 4',
      'Assigner le rôle de Lead Design à Sophie',
      'Organiser le standup quotidien à 9h30'
    ],
    nodes: [
      { id: '1', label: 'Cahier des charges', status: 'completed', type: 'start' },
      { id: '2', label: 'Ressources Suffisantes ?', status: 'active', type: 'decision' },
      { id: '3', label: 'Validation Budget', status: 'completed', type: 'outcome' },
      { id: '4', label: 'Lancement Recrutement', status: 'pending', type: 'outcome' }
    ]
  },
  {
    id: 'm2',
    title: 'Project Meeting',
    time: '10:00 AM',
    date: 'Hier',
    category: 'upcoming',
    participants: [
      { name: 'Marc B.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      { name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }
    ],
    extraParticipantsCount: 3,
    summaryTitle: 'Point d\'Avancement Technique & Architecture',
    keyDecisions: [
      'Migrer vers la base de données Firestore temps réel',
      'Mettre en place la surveillance des métriques API',
      'Finaliser la PWA pour iOS et Android'
    ],
    nodes: [
      { id: '1', label: 'Spécifications API', status: 'completed', type: 'start' },
      { id: '2', label: 'Audit Sécurité OK ?', status: 'active', type: 'decision' },
      { id: '3', label: 'Déploiement Staging', status: 'completed', type: 'outcome' },
      { id: '4', label: 'Tests de Charge', status: 'pending', type: 'outcome' }
    ]
  },
  {
    id: 'm3',
    title: 'Quarterly Review',
    time: '14:30',
    date: 'Hier',
    category: 'past',
    participants: [
      { name: 'CEO', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { name: 'CFO', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
      { name: 'CMO', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100' }
    ],
    summaryTitle: 'Quarterly Review Q3 & Stratégie Q4',
    keyDecisions: [
      'Approuver le budget Q4',
      'Lancer la nouvelle campagne marketing',
      'Recruter deux développeurs senior'
    ],
    nodes: [
      { id: '1', label: 'Bilan Financier Q3', status: 'completed', type: 'start' },
      { id: '2', label: 'Budget Validé ?', status: 'active', type: 'decision' },
      { id: '3', label: 'Campagne Marketing', status: 'completed', type: 'outcome' },
      { id: '4', label: 'Recrutements Tech', status: 'completed', type: 'outcome' }
    ]
  },
  {
    id: 'm4',
    title: 'Client Demo - BizOS',
    time: '16:00',
    date: 'Il y a 2 jours',
    category: 'past',
    participants: [
      { name: 'Client A', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      { name: 'Sales Director', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
    ],
    summaryTitle: 'Présentation Produit & Signature Contrat',
    keyDecisions: [
      'Envoyer la proposition commerciale révisée',
      'Accorder un essai de 30 jours pour les modules IoT',
      'Planifier la formation des équipes opérationnelles'
    ],
    nodes: [
      { id: '1', label: 'Démo Fonctionnelle', status: 'completed', type: 'start' },
      { id: '2', label: 'Validation Legal ?', status: 'completed', type: 'decision' },
      { id: '3', label: 'Signature SLA', status: 'completed', type: 'outcome' },
      { id: '4', label: 'Onboarding Équipes', status: 'active', type: 'outcome' }
    ]
  }
];

export const MeetAiView: React.FC<MeetAiViewProps> = ({ setCurrentPage }) => {
  const [meetingsList, setMeetingsList] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting>(INITIAL_MEETINGS[2]); // Default to Quarterly Review
  const [searchQuery, setSearchQuery] = useState('');
  
  const [teamList, setTeamList] = useState([
    { name: 'Sarah Jenkins', role: 'VP Product & Operations', status: 'En Réunion', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', count: '14 réunions ce mois' },
    { name: 'Elena Rostova', role: 'Head of Growth', status: 'Disponible', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', count: '9 réunions ce mois' },
    { name: 'Marcus Silva', role: 'Lead Architect', status: 'Focus Mode', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', count: '11 réunions ce mois' },
    { name: 'Alex Vernet', role: 'Cybersecurity Manager', status: 'Disponible', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', count: '8 réunions ce mois' }
  ]);

  const [projectsList, setProjectsList] = useState([
    { title: 'Refonte UI Mobile Spaceflow', count: '6 Réunions', date: 'Mise à jour hier', decisions: 12, progress: 85 },
    { title: 'Lancement Expansion Europe', count: '4 Réunions', date: 'Mise à jour le 3 Août', decisions: 8, progress: 60 },
    { title: 'Migration Cloud Infra & Sécurité', count: '5 Réunions', date: 'Mise à jour il y a 3j', decisions: 15, progress: 92 }
  ]);

  const [activeNavTab, setActiveNavTab] = useState<'Dashboard' | 'Analytics' | 'Team' | 'Projects'>('Dashboard');
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'meetings' | 'tasks' | 'chat' | 'profile'>('meetings');
  
  // Modals
  const [showAskBizOSModal, setShowAskBizOSModal] = useState(false);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // New Meeting Form
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('11:00 AM');
  const [newMeetingDate, setNewMeetingDate] = useState('Aujourd\'hui');
  const [newMeetingSummary, setNewMeetingSummary] = useState('');
  const [newMeetingDecision, setNewMeetingDecision] = useState('');

  // New Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // New Project Form
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const [aiPromptInput, setAiPromptInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: `Bonjour ! Je suis BizOS AI Assistant. Je connais tout sur le compte-rendu "${selectedMeeting?.title || 'Quarterly Review'}". Posez-moi une question !` }
  ]);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [newDecisionText, setNewDecisionText] = useState('');

  // Filtered Meetings
  const filteredMeetings = meetingsList.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.summaryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.keyDecisions.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const upcomingMeetings = filteredMeetings.filter(m => m.category === 'upcoming');
  const pastMeetings = filteredMeetings.filter(m => m.category === 'past');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) return;

    const newM: Meeting = {
      id: 'm_' + Date.now(),
      title: newMeetingTitle.trim(),
      time: newMeetingTime,
      date: newMeetingDate,
      category: 'upcoming',
      participants: [
        { name: 'Vous (Leader)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
        { name: 'IA Copilot', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
      ],
      summaryTitle: newMeetingSummary.trim() || `Compte-rendu ${newMeetingTitle.trim()}`,
      keyDecisions: newMeetingDecision.trim() ? [newMeetingDecision.trim()] : ['Organiser le suivi des actions'],
      nodes: [
        { id: '1', label: 'Lancement Réunion', status: 'completed', type: 'start' },
        { id: '2', label: 'Points à Valider', status: 'active', type: 'decision' },
        { id: '3', label: 'Décisions Prises', status: 'pending', type: 'outcome' }
      ]
    };

    setMeetingsList(prev => [newM, ...prev]);
    setSelectedMeeting(newM);
    setNewMeetingTitle('');
    setNewMeetingSummary('');
    setNewMeetingDecision('');
    setShowNewMeetingModal(false);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setTeamList(prev => [
      ...prev,
      {
        name: newMemberName.trim(),
        role: newMemberRole.trim() || 'Collaborateur',
        status: 'Disponible',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        count: '1 réunion ce mois'
      }
    ]);
    setNewMemberName('');
    setNewMemberRole('');
    setShowInviteMemberModal(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    setProjectsList(prev => [
      {
        title: newProjectTitle.trim(),
        count: '1 Réunion',
        date: 'Créé à l\'instant',
        decisions: 1,
        progress: 10
      },
      ...prev
    ]);
    setNewProjectTitle('');
    setShowNewProjectModal(false);
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;

    const userMsg = aiPromptInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiPromptInput('');
    setIsAskingAi(true);

    try {
      const res = await fetch('/api/bizos/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          context: `Compte-rendu de réunion: ${selectedMeeting.title}. Décisions clés: ${selectedMeeting.keyDecisions.join(', ')}.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply || "J'ai bien analysé les décisions de la réunion. Tout est prêt." }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          text: `D'après la réunion "${selectedMeeting.title}", les décisions clés validées sont : ${selectedMeeting.keyDecisions.join(' ; ')}.`
        }]);
      }
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        text: `Résumé BizOS AI : Les décisions validées pour ${selectedMeeting.title} incluent : ${selectedMeeting.keyDecisions[0] || 'Validation des jalons'}.`
      }]);
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionText.trim()) return;

    const addedText = newDecisionText.trim();
    setSelectedMeeting(prev => ({
      ...prev,
      keyDecisions: [...prev.keyDecisions, addedText]
    }));
    setMeetingsList(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, keyDecisions: [...m.keyDecisions, addedText] } : m));
    setNewDecisionText('');
  };

  const handleToggleNodeStatus = (nodeId: string) => {
    setSelectedMeeting(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => {
        if (n.id === nodeId) {
          const nextStatus: 'active' | 'completed' | 'pending' = n.status === 'completed' ? 'active' : n.status === 'active' ? 'pending' : 'completed';
          return { ...n, status: nextStatus };
        }
        return n;
      })
    }));
  };

  return (
    <div className="w-full min-h-screen text-slate-100 space-y-6 animate-fade-in pb-12">
      
      {/* Top Header Navigation matching exact screenshot 1 */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#120826]/90 border border-[#d946ef]/30 backdrop-blur-xl shadow-[0_0_30px_rgba(217,70,239,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex items-center justify-center text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif flex items-center gap-2">
              <span>MeetAI BizOS Mobile</span>
            </h1>
          </div>
        </div>

        {/* Header Tabs: Dashboard, Analytics, Team, Projects */}
        <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300">
          {(['Dashboard', 'Analytics', 'Team', 'Projects'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNavTab(tab)}
              className={`transition-all cursor-pointer py-1 relative ${
                activeNavTab === tab 
                  ? 'text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
              {activeNavTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f472b6] rounded-full shadow-[0_0_8px_#f472b6]" />
              )}
            </button>
          ))}
        </div>

        {/* Top Right "Ask BizOS" Pill Button */}
        <button
          onClick={() => setShowAskBizOSModal(true)}
          className="px-4 py-2 rounded-full text-xs font-bold text-slate-900 bg-gradient-to-r from-[#f472b6] via-[#fb923c] to-[#fcd34d] hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(244,114,182,0.4)] flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>Ask BizOS</span>
        </button>
      </div>

      {/* Main View switching based on activeNavTab */}
      {activeNavTab === 'Dashboard' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): Mes Réunions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Mes Réunions</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#d946ef]/20 border border-[#d946ef]/40 text-[#f472b6] font-mono">
                  {filteredMeetings.length} Réunions
                </span>
              </div>
              <button
                onClick={() => setShowNewMeetingModal(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#f472b6] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-[0_0_12px_rgba(217,70,239,0.4)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle Réunion</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une réunion ou une décision..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#140826]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f472b6]"
              />
            </div>

            {/* À venir (Upcoming) Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#f472b6]" />
                <span>À venir</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingMeetings.map((meeting) => {
                  const isSelected = selectedMeeting.id === meeting.id;
                  return (
                    <div
                      key={meeting.id}
                      className={`p-4 rounded-2xl transition-all border ${
                        isSelected 
                          ? 'bg-[#1a0b36] border-[#f472b6] shadow-[0_0_20px_rgba(244,114,182,0.25)]' 
                          : 'bg-[#140826]/80 border-[#d946ef]/20 hover:border-[#d946ef]/50'
                      }`}
                    >
                      <h4 className="font-semibold text-white text-sm mb-1">{meeting.title}</h4>
                      <p className="text-xs text-slate-400 mb-3">{meeting.time}, {meeting.date}</p>

                      {/* Participant Avatars */}
                      <div className="flex items-center gap-1.5 mb-4">
                        {meeting.participants.map((p, idx) => (
                          <img
                            key={idx}
                            src={p.avatar}
                            alt={p.name}
                            className="w-6 h-6 rounded-full object-cover border border-[#d946ef]/40"
                          />
                        ))}
                        {meeting.extraParticipantsCount && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                            +{meeting.extraParticipantsCount}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedMeeting(meeting)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#d946ef] border-[#f472b6] text-white shadow-[0_0_12px_rgba(217,70,239,0.5)]'
                            : 'bg-white/5 border-white/20 text-slate-300 hover:text-white hover:border-[#f472b6]'
                        }`}
                      >
                        <span>Voir le résumé visuel</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Passées (Past) Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Passées</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pastMeetings.map((meeting) => {
                  const isSelected = selectedMeeting.id === meeting.id;
                  return (
                    <div
                      key={meeting.id}
                      className={`p-4 rounded-2xl transition-all border ${
                        isSelected 
                          ? 'bg-[#1a0b36] border-[#f472b6] shadow-[0_0_20px_rgba(244,114,182,0.25)]' 
                          : 'bg-[#140826]/80 border-[#d946ef]/20 hover:border-[#d946ef]/50'
                      }`}
                    >
                      <h4 className="font-semibold text-white text-sm mb-1">{meeting.title}</h4>
                      <p className="text-xs text-slate-400 mb-3">{meeting.date}</p>

                      {/* Participant Avatars */}
                      <div className="flex items-center gap-1.5 mb-4">
                        {meeting.participants.map((p, idx) => (
                          <img
                            key={idx}
                            src={p.avatar}
                            alt={p.name}
                            className="w-6 h-6 rounded-full object-cover border border-[#d946ef]/40"
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setSelectedMeeting(meeting)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#d946ef] border-[#f472b6] text-white shadow-[0_0_12px_rgba(217,70,239,0.5)]'
                            : 'bg-white/5 border-white/20 text-slate-300 hover:text-white hover:border-[#f472b6]'
                        }`}
                      >
                        <span>Voir le résumé visuel</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (7 Cols): Compte-rendu de Réunion Visual Report */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-3xl bg-[#130826]/90 border border-[#d946ef]/40 backdrop-blur-xl shadow-[0_0_40px_rgba(217,70,239,0.2)] space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#f472b6] tracking-wider">MeetAI Visual Summary</span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Compte-rendu de Réunion: {selectedMeeting.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAskBizOSModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#d946ef]/20 border border-[#d946ef]/50 hover:bg-[#d946ef]/30 text-xs text-[#f472b6] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyser avec l'IA</span>
                </button>
              </div>
            </div>

            {/* Sub-Section 1: Résumé Visuel (Flowchart / Diagram matching screenshot 1) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Résumé Visuel</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Modélisation de Décision AI</span>
              </div>

              {/* Glassmorphic Flowchart Box */}
              <div className="relative p-6 rounded-2xl bg-[#0d041e]/90 border border-[#d946ef]/30 overflow-hidden min-h-[220px] flex items-center justify-center shadow-[inset_0_0_30px_rgba(217,70,239,0.15)]">
                
                {/* SVG Connecting Glowing Lines matching exact flowchart in screenshot 1 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Lines connecting left node to center diamond */}
                  <path d="M 110 100 L 210 100" stroke="url(#purpleGlow)" strokeWidth="2.5" fill="none" />
                  
                  {/* Lines branching from diamond to top & bottom outcome nodes */}
                  <path d="M 250 70 L 250 40 L 320 40" stroke="url(#purpleGlow)" strokeWidth="2" fill="none" />
                  <path d="M 250 130 L 250 160 L 320 160" stroke="url(#purpleGlow)" strokeWidth="2" fill="none" />
                  
                  {/* Line extending right to third outcome node */}
                  <path d="M 290 100 L 390 100" stroke="url(#purpleGlow)" strokeWidth="2" fill="none" />

                  {/* Pulsing Glow dots along connectors */}
                  <circle cx="160" cy="100" r="3" fill="#f472b6" className="animate-ping" />
                  <circle cx="250" cy="40" r="3" fill="#f472b6" className="animate-pulse" />
                  <circle cx="250" cy="160" r="3" fill="#f472b6" className="animate-pulse" />
                </svg>

                {/* Nodes Layout */}
                <div className="relative z-10 w-full flex items-center justify-between px-2 sm:px-6">
                  
                  {/* Node 1: Start/Input Box */}
                  <div className="p-3.5 rounded-xl bg-[#1f0b38]/80 border border-[#d946ef]/60 backdrop-blur-md shadow-[0_0_15px_rgba(217,70,239,0.3)] text-center w-28 sm:w-32 hover:scale-105 transition-transform">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Étape 1</span>
                    <span className="text-xs font-bold text-white leading-tight block">{selectedMeeting.nodes[0]?.label || 'Start'}</span>
                  </div>

                  {/* Node 2: Center Diamond Decision Node */}
                  <div className="relative flex items-center justify-center my-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rotate-45 rounded-xl bg-[#260e48]/90 border-2 border-[#f472b6] shadow-[0_0_20px_rgba(244,114,182,0.4)] flex items-center justify-center hover:scale-105 transition-transform">
                      <div className="-rotate-45 text-center p-1">
                        <span className="text-[9px] text-[#f472b6] font-bold leading-none block">{selectedMeeting.nodes[1]?.label || 'Décision'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Node 3 Column: Outcomes */}
                  <div className="flex flex-col gap-6 justify-center">
                    <div className="p-2.5 rounded-xl bg-[#1f0b38]/80 border border-[#d946ef]/50 backdrop-blur-md shadow-md text-center w-24 sm:w-28 hover:scale-105 transition-transform">
                      <span className="text-[10px] font-bold text-slate-200 block">{selectedMeeting.nodes[2]?.label || 'Résultat A'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#1f0b38]/80 border border-[#d946ef]/50 backdrop-blur-md shadow-md text-center w-24 sm:w-28 hover:scale-105 transition-transform">
                      <span className="text-[10px] font-bold text-slate-200 block">{selectedMeeting.nodes[3]?.label || 'Résultat B'}</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Sub-Section 2: Décisions Clés matching exact screenshot 1 */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white tracking-wide">Décisions Clés</h4>
                <span className="text-xs text-[#f472b6] font-mono">{selectedMeeting.keyDecisions.length} validées</span>
              </div>

              <div className="space-y-2.5">
                {selectedMeeting.keyDecisions.map((decision, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-[#1a0c33]/80 border border-[#d946ef]/20 hover:border-[#d946ef]/40 flex items-center gap-3 transition-colors group"
                  >
                    {/* Glowing Purple Bullet Icon matching screenshot */}
                    <div className="w-5 h-5 rounded-full bg-[#d946ef]/30 border border-[#f472b6] flex items-center justify-center text-[#f472b6] shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.6)]">
                      <Sparkles className="w-3 h-3 text-[#f472b6]" />
                    </div>
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white flex-1">{decision}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-60" />
                  </div>
                ))}
              </div>

              {/* Add New Decision Form */}
              <form onSubmit={handleAddDecision} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Ajouter une décision clé..."
                  value={newDecisionText}
                  onChange={(e) => setNewDecisionText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f472b6]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-[#d946ef] text-white text-xs font-bold cursor-pointer hover:bg-[#e056f7] transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
      )}

      {/* Analytics Tab (Mock View) */}
      {activeNavTab === 'Analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Heures de Réunion (Ce Mois)</span>
                <Clock className="w-4 h-4 text-[#f472b6]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">28.4h</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>-18% de temps vs mois dernier</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Indice de Sentiment IA</span>
                <Sparkles className="w-4 h-4 text-[#f472b6]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">88 / 100</div>
              <div className="text-[11px] text-emerald-400 mt-1">Échanges constructifs & clairs</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Taux de Résolution Décisions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">94%</div>
              <div className="text-[11px] text-slate-400 mt-1">17/18 décisions exécutées</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Temps de Parole Moyen</span>
                <Users className="w-4 h-4 text-[#fb923c]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">Équilibré</div>
              <div className="text-[11px] text-slate-400 mt-1">Leader 35% • Équipe 65%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#f472b6]" />
                <span>Densité Hebdomadaire des Réunions</span>
              </h3>
              <p className="text-xs text-slate-400">Distribution heures synchrones vs travail asynchrone</p>
              
              <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-white/10">
                {[
                  { day: 'Lun', hours: 4.5, pct: 75 },
                  { day: 'Mar', hours: 6.0, pct: 100 },
                  { day: 'Mer', hours: 3.2, pct: 53 },
                  { day: 'Jeu', hours: 5.8, pct: 95 },
                  { day: 'Ven', hours: 2.1, pct: 35 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{item.hours}h</span>
                    <div className="w-full bg-[#1e0f38] rounded-t-xl overflow-hidden flex flex-col justify-end h-36 border border-white/10">
                      <div 
                        style={{ height: `${item.pct}%` }} 
                        className="w-full bg-gradient-to-t from-[#8b5cf6] to-[#f472b6] rounded-t-lg transition-all"
                      />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f472b6]" />
                <span>Recommandations BizOS IA</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#1c0e38] border border-white/10 text-xs text-slate-200">
                  <span className="font-bold text-[#f472b6]">Optimisation Mercredi :</span> La réunion du mercredi de 14h peut être transformée en compte-rendu asynchrone (-45min économisées).
                </div>
                <div className="p-3.5 rounded-2xl bg-[#1c0e38] border border-white/10 text-xs text-slate-200">
                  <span className="font-bold text-emerald-400 font-mono">+12h Gagnées :</span> Grâce à la détection automatique des décisions BizOS AI ce mois-ci.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeNavTab === 'Team' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Équipe & Intervenants MeetAI</h2>
              <p className="text-xs text-slate-400">Collaborateurs enregistrés dans les réunions BizOS</p>
            </div>
            <button 
              onClick={() => setShowInviteMemberModal(true)}
              className="px-4 py-2 rounded-xl bg-[#d946ef] text-white text-xs font-bold hover:bg-[#e056f7] transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>Inviter un Collaborateur</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamList.map((member, idx) => (
              <div key={idx} className="p-5 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-3">
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-2xl object-cover border border-[#f472b6]" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{member.name}</h4>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                    {member.status}
                  </span>
                  <span className="text-[11px] text-[#f472b6] font-medium">{member.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeNavTab === 'Projects' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Projets & Espaces de Décision</h2>
              <p className="text-xs text-slate-400">Regroupement des réunions et enregistrements par projet</p>
            </div>
            <button 
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(244,114,182,0.4)]"
            >
              <Folder className="w-4 h-4" />
              <span>Nouveau Projet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectsList.map((proj, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/30 backdrop-blur-xl space-y-4 hover:border-[#f472b6] transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#d946ef]/20 border border-[#d946ef]/40 flex items-center justify-center text-[#f472b6]">
                    <Folder className="w-5 h-5" />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-mono">{proj.count}</span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#f472b6] transition-colors">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{proj.date}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>Avancement</span>
                    <span className="text-[#f472b6] font-bold">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#f472b6] h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>{proj.decisions} Décisions enregistrées</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[90%] p-2 rounded-2xl bg-[#140826]/95 border border-[#d946ef]/40 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-around">
        
        <button 
          onClick={() => { setActiveBottomTab('home'); if (setCurrentPage) setCurrentPage('home'); }}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer text-[10px] font-medium transition-all ${
            activeBottomTab === 'home' ? 'text-[#f472b6] bg-[#d946ef]/20 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button 
          onClick={() => setActiveBottomTab('meetings')}
          className={`flex flex-col items-center gap-1 px-3.5 py-1.5 rounded-xl cursor-pointer text-[10px] font-medium transition-all ${
            activeBottomTab === 'meetings' ? 'text-white bg-[#d946ef] font-bold shadow-[0_0_12px_rgba(217,70,239,0.6)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Meetings</span>
        </button>

        <button 
          onClick={() => { setActiveBottomTab('tasks'); if (setCurrentPage) setCurrentPage('dashboard'); }}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer text-[10px] font-medium transition-all ${
            activeBottomTab === 'tasks' ? 'text-[#f472b6] bg-[#d946ef]/20 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </button>

        <button 
          onClick={() => { setActiveBottomTab('chat'); setShowAskBizOSModal(true); }}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer text-[10px] font-medium transition-all ${
            activeBottomTab === 'chat' ? 'text-[#f472b6] bg-[#d946ef]/20 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Chat</span>
        </button>

        <button 
          onClick={() => { setActiveBottomTab('profile'); if (setCurrentPage) setCurrentPage('settings'); }}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer text-[10px] font-medium transition-all ${
            activeBottomTab === 'profile' ? 'text-[#f472b6] bg-[#d946ef]/20 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

      </div>

      {/* Ask BizOS AI Modal Drawer */}
      {showAskBizOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#140826] border border-[#d946ef]/50 p-6 shadow-2xl space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d946ef] flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ask BizOS AI Assistant</h3>
                  <p className="text-xs text-slate-400">Posez des questions sur le compte-rendu</p>
                </div>
              </div>
              <button
                onClick={() => setShowAskBizOSModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {/* Chat History */}
            <div className="h-64 overflow-y-auto space-y-3 p-2 font-sans text-xs">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#d946ef] text-white rounded-br-none'
                        : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAskingAi && (
                <div className="flex justify-start text-xs text-[#f472b6] animate-pulse">
                  BizOS AI est en train de réfléchir...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskAi} className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder="Ex: Quel budget a été validé pour Q4 ?"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#1e0f38] border border-white/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f472b6]"
              />
              <button
                type="submit"
                disabled={isAskingAi}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#140826] border border-[#d946ef]/50 p-6 shadow-2xl space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-[#f472b6]" />
                <span>Planifier / Enregistrer une Réunion</span>
              </h3>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Titre de la réunion *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sync Roadmap Q4 & Budget"
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Heure</label>
                  <input
                    type="text"
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
                  <input
                    type="text"
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Résumé / Sujet principal</label>
                <input
                  type="text"
                  placeholder="Ex: Alignement des équipes tech et produit"
                  value={newMeetingSummary}
                  onChange={(e) => setNewMeetingSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Première Décision Clé</label>
                <input
                  type="text"
                  placeholder="Ex: Valider l'architecture Cloud Firestore"
                  value={newMeetingDecision}
                  onChange={(e) => setNewMeetingDecision(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#f472b6] text-white font-bold text-xs shadow-lg hover:opacity-90 transition-all cursor-pointer mt-2"
              >
                Créer la réunion & Générer le compte-rendu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#140826] border border-[#d946ef]/50 p-6 shadow-2xl space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#f472b6]" />
                <span>Inviter un Collaborateur</span>
              </h3>
              <button
                onClick={() => setShowInviteMemberModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Antoine Dupont"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Rôle / Poste</label>
                <input
                  type="text"
                  placeholder="Ex: Product Manager"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#d946ef] text-white font-bold text-xs hover:bg-[#e056f7] transition-all cursor-pointer mt-2"
              >
                Ajouter à l'équipe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#140826] border border-[#d946ef]/50 p-6 shadow-2xl space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#f472b6]" />
                <span>Nouveau Projet</span>
              </h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nom du Projet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lancement AI Analytics"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1e0f38] border border-white/20 text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer mt-2"
              >
                Créer le Projet
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
