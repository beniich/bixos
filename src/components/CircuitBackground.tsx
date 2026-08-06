import React from 'react';
import { BackgroundTheme } from '../types';
import { ASSET_IMAGES } from '../data/assets';

interface CircuitBackgroundProps {
  theme: BackgroundTheme;
}

export const CircuitBackground: React.FC<CircuitBackgroundProps> = ({ theme }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0d041e]">
      {/* Imported Background PNG Texture Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-screen transition-opacity duration-1000"
        style={{ backgroundImage: `url(${ASSET_IMAGES.circuitBackgroundPng})` }}
      />

      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-main-radial opacity-85" />

      {/* Theme specific SVG overlay */}
      {theme === 'circuit' && (
        <div className="absolute inset-0 opacity-20 transition-opacity duration-1000">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="circuitGrid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M10 10 h80 v80 h-80 z M30 10 v30 h40 v40 M10 50 h30 M70 50 h20"
                fill="none"
                stroke="#ff8a3d"
                strokeWidth="0.8"
                strokeDasharray="4 2"
              />
              <circle cx="30" cy="40" r="3" fill="#ff6b00" />
              <circle cx="70" cy="50" r="3" fill="#ff8a3d" />
              <circle cx="50" cy="80" r="2" fill="#ffaa00" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#circuitGrid)" />
          </svg>
        </div>
      )}

      {theme === 'building' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <svg className="w-full max-w-5xl h-auto" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Isometric 3D Building wireframe */}
            <g stroke="#ff8a3d" strokeWidth="1.5" opacity="0.8">
              {/* Main isometric box outline */}
              <path d="M400 150 L600 250 L400 350 L200 250 Z" fill="rgba(255, 107, 0, 0.05)" />
              <path d="M200 250 L200 450 L400 550 L400 350 Z" fill="rgba(45, 23, 85, 0.4)" />
              <path d="M600 250 L600 450 L400 550 L400 350 Z" fill="rgba(255, 138, 61, 0.05)" />
              
              {/* Floors & Windows */}
              <path d="M200 290 L400 390 L600 290" />
              <path d="M200 330 L400 430 L600 330" />
              <path d="M200 370 L400 470 L600 370" />
              <path d="M200 410 L400 510 L600 410" />

              {/* Roof Helipad & Antenna */}
              <path d="M400 150 L400 80" stroke="#ff8a3d" strokeWidth="2" />
              <circle cx="400" cy="80" r="6" fill="#ff5e00" className="animate-ping" />

              {/* PCB circuit traces extending from building base */}
              <path d="M400 550 L400 590 M200 450 L100 500 L50 500 M600 450 L700 500 L750 500" stroke="#ff6b00" strokeDasharray="3 3" />
            </g>
          </svg>
        </div>
      )}

      {theme === 'waves' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <path
              d="M 0 400 Q 300 200 600 400 T 1200 400"
              stroke="url(#orangeGrad)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 0 450 Q 300 250 600 450 T 1200 450"
              stroke="url(#orangeGrad)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 0 350 Q 300 150 600 350 T 1200 350"
              stroke="#ff8a3d"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
            />
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff5e00" />
                <stop offset="50%" stopColor="#ff8a3d" />
                <stop offset="100%" stopColor="#ff2200" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {theme === 'nodes' && (
        <div className="absolute inset-0 opacity-25">
          <svg className="w-full h-full" viewBox="0 0 1000 700" fill="none">
            <g stroke="#ff8a3d" strokeWidth="1" strokeOpacity="0.4">
              <line x1="200" y1="200" x2="400" y2="300" />
              <line x1="400" y1="300" x2="600" y2="200" />
              <line x1="600" y1="200" x2="800" y2="350" />
              <line x1="400" y1="300" x2="500" y2="500" />
              <line x1="200" y1="200" x2="300" y2="450" />
              <line x1="300" y1="450" x2="500" y2="500" />
              <line x1="500" y1="500" x2="800" y2="350" />
            </g>
            {[
              { x: 200, y: 200 },
              { x: 400, y: 300 },
              { x: 600, y: 200 },
              { x: 800, y: 350 },
              { x: 500, y: 500 },
              { x: 300, y: 450 },
            ].map((pt, idx) => (
              <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
                <polygon points="0,-12 10,-6 10,6 0,12 -10,6 -10,-6" fill="rgba(255, 107, 0, 0.2)" stroke="#ff8a3d" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="4" fill="#ff5e00" className="animate-pulse" />
              </g>
            ))}
          </svg>
        </div>
      )}

      {theme === 'brain' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <svg className="w-full max-w-4xl h-auto" viewBox="0 0 600 500" fill="none">
            <g stroke="#ff8a3d" strokeWidth="1.2">
              <path d="M 200 250 C 180 150 300 100 300 150 C 300 100 420 150 400 250 C 420 350 300 400 300 350 C 300 400 180 350 200 250 Z" fill="rgba(255,107,0,0.03)" />
              <circle cx="300" cy="200" r="3" fill="#ff6b00" />
              <circle cx="260" cy="240" r="3" fill="#ff8a3d" />
              <circle cx="340" cy="240" r="3" fill="#ff8a3d" />
              <circle cx="300" cy="280" r="3" fill="#ffaa00" />
              <line x1="300" y1="200" x2="260" y2="240" />
              <line x1="300" y1="200" x2="340" y2="240" />
              <line x1="260" y1="240" x2="300" y2="280" />
              <line x1="340" y1="240" x2="300" y2="280" />
            </g>
          </svg>
        </div>
      )}

      {theme === 'map' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <svg className="w-full max-w-6xl h-auto" viewBox="0 0 1000 500" fill="none">
            {/* Simple world map outline */}
            <path
              d="M 150 150 Q 200 100 250 160 Q 300 220 200 280 Z M 450 120 Q 550 80 650 140 Q 600 280 480 250 Z M 750 180 Q 850 160 900 250 Q 820 350 720 280 Z M 250 320 Q 320 300 350 420 Q 280 450 230 380 Z"
              fill="rgba(255, 255, 255, 0.05)"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            {/* Connected arcs */}
            {[
              { from: [200, 180], to: [480, 160], label: 'New York -> London' },
              { from: [480, 160], to: [680, 260], label: 'London -> Dubai' },
              { from: [680, 260], to: [850, 220], label: 'Dubai -> Tokyo' },
              { from: [850, 220], to: [800, 320], label: 'Tokyo -> Singapore' },
              { from: [800, 320], to: [880, 400], label: 'Singapore -> Sydney' },
            ].map((arc, idx) => (
              <g key={idx}>
                <path
                  d={`M ${arc.from[0]} ${arc.from[1]} Q ${(arc.from[0] + arc.to[0]) / 2} ${
                    Math.min(arc.from[1], arc.to[1]) - 50
                  } ${arc.to[0]} ${arc.to[1]}`}
                  stroke="#ff8a3d"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  fill="none"
                />
                <circle cx={arc.from[0]} cy={arc.from[1]} r="4" fill="#ff5e00" className="animate-ping" />
                <circle cx={arc.to[0]} cy={arc.to[1]} r="4" fill="#ff5e00" />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Floating neon light particles */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
