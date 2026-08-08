import React from 'react';
import { TrendingUp, Award, Target, ArrowUpRight, BarChart2 } from 'lucide-react';

export const AnalyticsAiView: React.FC = () => {
  return (
    <div className="relative min-h-screen pt-8 pb-24 px-4 sm:px-8 font-sans text-[#e1e3e4] animate-fade-in" style={{ backgroundColor: '#180f22' }}>
      <style>{`
        .biz-glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .biz-primary-gradient {
            background: linear-gradient(135deg, #ffaaf7 0%, #ffb95a 100%);
        }
        .biz-text-gradient {
            background: linear-gradient(135deg, #ffaaf7 0%, #ffb95a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-light mb-1">ExitReady <span className="biz-text-gradient font-normal">Valuation</span></h1>
            <p className="text-[#d5c1cf] font-light">Real-time Enterprise Value & Growth Trajectory</p>
          </div>
          
          <div className="flex items-center gap-4 biz-glass-card rounded-full p-2 pr-6">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzka3-cakm3PuhF0HTX9qEP9syAH2AePQDrtvUv8u0GXVFaggbSuNwFw6T8f96gbHXZ_L3Yw7DoSxpBaWf-ZmW3YcQZA2cwDA7zHoKmP7Iq9JdZh0aF-iOkdSvvTTePRzVjyjVHMhYa7W390wLiuzB3rZhhwftdTSwXRK8aMjJnxVd4h5DBS8nBWtaJPcikC1-a5pAT7iIvziAS7n6DO2Yp6Y-9_eWE2oGLPt_SAr6p1IUhag7sgMO" 
              alt="Avatar Portrait" 
              className="w-12 h-12 rounded-full border-2 border-[#ffb95a] object-cover"
            />
            <div>
              <div className="text-sm font-medium text-white">Alex Mercer</div>
              <div className="text-xs text-[#ffb95a] uppercase tracking-wider font-semibold">Founder & CEO</div>
            </div>
          </div>
        </header>

        {/* Core Valuation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 biz-glass-card rounded-2xl p-8 border-[#ffaaf7]/30 bg-gradient-to-br from-[#180f22] to-[#ffaaf7]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <TrendingUp className="w-32 h-32 text-[#ffaaf7]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-[#d5c1cf] uppercase tracking-widest text-sm font-semibold mb-2">Estimated Enterprise Value</h2>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-6xl font-light text-white">$42.5<span className="text-3xl text-[#ffaaf7]">M</span></span>
                <span className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full mb-2">
                  <ArrowUpRight className="w-4 h-4 mr-1" /> +14.2% YoY
                </span>
              </div>
              <p className="text-[#d5c1cf] font-light max-w-md leading-relaxed">
                Valuation is calculated using real-time SaaS multiples, blended ARR growth, and automated churn analysis.
              </p>
            </div>
          </div>
          
          <div className="biz-glass-card rounded-2xl p-8 border-[#ffb95a]/20 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffb95a]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#ffb95a]" />
              </div>
              <h3 className="text-lg font-medium text-white">Target Multiplier</h3>
            </div>
            <div className="text-4xl font-light text-white mb-2">8.4x <span className="text-xl text-[#d5c1cf]">ARR</span></div>
            <div className="w-full bg-black/40 rounded-full h-2 mt-4">
              <div className="biz-primary-gradient h-2 rounded-full" style={{ width: '84%' }}></div>
            </div>
            <div className="text-xs text-[#d5c1cf] text-right mt-2 font-mono">10.0x Goal</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Current ARR', value: '$5.06M', trend: '+22%' },
            { label: 'Net Revenue Retention', value: '118%', trend: '+3%' },
            { label: 'LTV:CAC Ratio', value: '4.2', trend: 'Stable' },
            { label: 'Gross Margin', value: '82%', trend: '+1.5%' }
          ].map((metric, i) => (
            <div key={i} className="biz-glass-card rounded-xl p-6 border-white/10 hover:bg-white/5 transition-colors">
              <div className="text-xs text-[#d5c1cf] uppercase tracking-wider mb-2 font-medium">{metric.label}</div>
              <div className="text-2xl font-light text-white mb-1">{metric.value}</div>
              <div className="text-sm font-medium text-[#ffaaf7]">{metric.trend}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
