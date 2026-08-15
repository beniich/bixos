import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Ticket, 
  DollarSign, 
  Search, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Data for Sales Evolution Chart
const salesData = [
  { name: 'Jan', Concerts: 40, Conferences: 20 },
  { name: 'Feb', Concerts: 110, Conferences: 90 },
  { name: 'Mar', Concerts: 80, Conferences: 60 },
  { name: 'Apr', Concerts: 180, Conferences: 150 },
  { name: 'May', Concerts: 230, Conferences: 180 },
  { name: 'Jun', Concerts: 160, Conferences: 110 },
  { name: 'Jul', Concerts: 310, Conferences: 220 },
  { name: 'Aug', Concerts: 390, Conferences: 280 }
];

// Data for Category Distribution Donut Chart
const categoryData = [
  { name: 'Concerts', value: 70, color: '#3b82f6' },
  { name: 'Conferences', value: 40, color: '#10b981' },
  { name: 'Festivals', value: 25, color: '#06b6d4' },
  { name: 'Workshops', value: 15, color: '#6366f1' },
  { name: 'Other', value: 10, color: '#4b5563' }
];

// Data for Activity Table
const activityData = [
  { date: 'Jan 18, 2023', event: 'Presentiers Line Paat Events', category: 'Concerts', status: 'Active', revenue: '$45,200' },
  { date: 'Jan 14, 2023', event: 'Conferences Festival', category: 'Conferences', status: 'Pending', revenue: '$23,000' },
  { date: 'Oct 14, 2023', event: 'Presentierit Line Paat Events', category: 'Festivals', status: 'Pending', revenue: '$28,000' },
  { date: 'Oct 15, 2023', event: 'Conference Event', category: 'Concerts', status: 'Completed', revenue: '$15,000' },
  { date: 'Oct 19, 2023', event: 'Conferences Festival', category: 'Workshops', status: 'Completed', revenue: '$18,000' },
  { date: 'Jan 10, 2023', event: 'ECO Asset Event', category: 'Other', status: 'Completed', revenue: '$12,900' }
];

export const EcoAssetDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivity = activityData.filter(item => 
    item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in text-white font-sans space-y-6">
      
      {/* Top Search & Profile bar to match the header of the image */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0f1c]/40 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Tableau de bord Général</h2>
          <p className="text-slate-400 text-xs">Vue consolidée des ventes, de la croissance et du public EcoAsset.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Central Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..." 
              className="w-full bg-[#131826]/60 border border-slate-800 focus:border-blue-500 rounded-full py-2 pl-9 pr-4 text-white text-xs focus:outline-none transition-all" 
            />
          </div>
          
          {/* User profile section matching picture */}
          <div className="flex items-center gap-2 bg-[#131826]/40 border border-slate-800 px-3 py-1.5 rounded-full select-none">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" 
              alt="JD" 
              className="w-6 h-6 rounded-full object-cover border border-blue-500/50"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-bold font-mono text-slate-300">JD</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue Card */}
        <div className="bg-[#111425]/75 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Revenue</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono">$45,200</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">+8%</span>
            </div>
          </div>
          <div className="p-3.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Tickets Card */}
        <div className="bg-[#111425]/75 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Tickets</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono">1,030</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">+36%</span>
            </div>
          </div>
          <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Attendees Card */}
        <div className="bg-[#111425]/75 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Attendees</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono">1,837</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">+15%</span>
            </div>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Growth Card */}
        <div className="bg-[#111425]/75 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg relative group overflow-hidden">
          <div className="absolute inset-0 bg-green-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Growth</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold font-mono">10.7%</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">+34%</span>
            </div>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Sales Evolution Area Chart (8 columns on large screens) */}
        <div className="lg:col-span-8 bg-[#111425]/75 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Sales Evolution</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Performance comparée des catégories phares</p>
            </div>
            
            {/* Custom Legend to match image */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-slate-300 font-medium">Concerts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-300 font-medium">Conferences</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConcerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConferences" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 400]}
                  ticks={[0, 100, 200, 300, 400]}
                  dx={-5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Concerts" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorConcerts)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Conferences" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorConferences)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Category Distribution (4 columns on large screens) */}
        <div className="lg:col-span-4 bg-[#111425]/75 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">Category Distribution</h3>
            <p className="text-[11px] text-slate-400">Répartition des segments de réservation</p>
          </div>

          <div className="flex items-center justify-between gap-2 h-56 relative my-auto">
            {/* Donut Chart representation */}
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central text segment label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono leading-none">160</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Segment</span>
              </div>
            </div>

            {/* Custom Legend à droite */}
            <div className="flex flex-col gap-2.5 text-[11px] text-slate-300">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="font-medium whitespace-nowrap">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Activity Table Section */}
      <div className="bg-[#111425]/75 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Activity by Day &amp; Hour</h3>
          <p className="text-[11px] text-slate-400">Suivi des dernières transactions de billetterie passées en guichet</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800/80">
                <th className="pb-3 font-semibold uppercase tracking-wider">Date</th>
                <th className="pb-3 font-semibold uppercase tracking-wider">Event</th>
                <th className="pb-3 font-semibold uppercase tracking-wider">Category</th>
                <th className="pb-3 font-semibold uppercase tracking-wider">Status</th>
                <th className="pb-3 font-semibold uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-slate-800/40">
              {filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                    Aucune transaction ne correspond à la recherche.
                  </td>
                </tr>
              ) : (
                filteredActivity.map((row, i) => {
                  let statusPill = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  if (row.status === 'Active') {
                    statusPill = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  } else if (row.status === 'Pending') {
                    statusPill = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  }

                  return (
                    <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 font-mono font-medium text-slate-400">{row.date}</td>
                      <td className="py-3 font-semibold text-slate-100">{row.event}</td>
                      <td className="py-3 text-slate-400">{row.category}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${statusPill}`}>
                          {row.status === 'Active' ? 'Active' : row.status === 'Pending' ? 'Pending' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-white text-right">{row.revenue}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
