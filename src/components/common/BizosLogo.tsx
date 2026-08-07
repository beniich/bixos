import React from 'react';

interface BizosLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showText?: boolean;
}

export const BizosLogo: React.FC<BizosLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    full: 'w-full h-auto',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Circuit Chip Banner / Icon matching uploaded Image 2 */}
      <div className={`relative flex items-center justify-center rounded-xl bg-[#17092c] border border-[#d946ef]/50 p-1.5 shadow-[0_0_20px_rgba(217,70,239,0.35)] overflow-hidden ${sizeClasses} aspect-[2.8/1] min-w-[100px]`}>
        {/* Glowing Circuit Trace Background SVG */}
        <svg 
          viewBox="0 0 280 80" 
          className="w-full h-full text-[#d946ef]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid Background */}
          <rect width="280" height="80" rx="12" fill="#140826" stroke="#d946ef" strokeWidth="1" strokeOpacity="0.4" />
          
          {/* Circuit Lines Left Side */}
          <path d="M 10 15 H 65 L 85 30 H 100" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 10 30 H 50 L 70 42 H 100" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 10 50 H 55 L 75 42 H 100" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 10 65 H 70 L 88 52 H 100" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />

          {/* Vias (Circles) Left */}
          <circle cx="10" cy="15" r="3" fill="#f472b6" />
          <circle cx="10" cy="30" r="3" fill="#f472b6" />
          <circle cx="10" cy="50" r="3" fill="#f472b6" />
          <circle cx="10" cy="65" r="3" fill="#f472b6" />
          <circle cx="65" cy="15" r="2.5" fill="#f472b6" />
          <circle cx="50" cy="30" r="2.5" fill="#d946ef" />

          {/* Circuit Lines Right Side */}
          <path d="M 180 30 H 200 L 220 15 H 270" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 180 42 H 210 L 225 30 H 270" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 180 42 H 205 L 222 55 H 270" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 180 52 H 195 L 215 65 H 270" stroke="url(#circuitGlow)" strokeWidth="2" strokeLinecap="round" />

          {/* Vias (Circles) Right */}
          <circle cx="270" cy="15" r="3" fill="#f472b6" />
          <circle cx="270" cy="30" r="3" fill="#f472b6" />
          <circle cx="270" cy="55" r="3" fill="#f472b6" />
          <circle cx="270" cy="65" r="3" fill="#f472b6" />
          <circle cx="220" cy="15" r="2.5" fill="#d946ef" />
          <circle cx="215" cy="65" r="2.5" fill="#d946ef" />

          {/* Central Processor Chip Box */}
          <rect x="105" y="10" width="70" height="60" rx="14" fill="#240b42" stroke="#f472b6" strokeWidth="2.5" />
          <rect x="109" y="14" width="62" height="52" rx="10" fill="url(#chipGradient)" opacity="0.9" />

          {/* Top & Bottom Chip Pins */}
          <path d="M 125 0 V 10 M 140 0 V 10 M 155 0 V 10" stroke="#f472b6" strokeWidth="2" />
          <path d="M 125 70 V 80 M 140 70 V 80 M 155 70 V 80" stroke="#f472b6" strokeWidth="2" />

          {/* Stylized 'B' Logo inside Chip */}
          <text 
            x="140" 
            y="51" 
            textAnchor="middle" 
            fill="#ffffff" 
            fontSize="38" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, sans-serif"
            style={{ filter: 'drop-shadow(0px 0px 8px rgba(244,114,182,0.9))' }}
          >
            B
          </text>
          
          {/* Swoosh Slash inside the 'B' letter */}
          <path d="M 126 44 Q 140 32 154 24" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />

          {/* Gradients */}
          <defs>
            <linearGradient id="circuitGlow" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d946ef" />
              <stop offset="0.5" stopColor="#f472b6" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="chipGradient" x1="105" y1="10" x2="175" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b0764" />
              <stop offset="1" stopColor="#701a75" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-white via-purple-100 to-[#f472b6] bg-clip-text text-transparent">BizOS</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d946ef]/20 border border-[#d946ef]/50 text-[#f472b6] font-mono font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(217,70,239,0.3)]">
              GMAO
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:inline">
            Predictive AI & IoT Operations
          </span>
        </div>
      )}
    </div>
  );
};
