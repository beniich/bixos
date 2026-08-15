const fs = require('fs');
let content = fs.readFileSync('src/components/spaceflow/VenueManagementView.tsx', 'utf8');

const svgReplacement = `          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 1000 1000" className="w-[120%] h-[120%] opacity-90" style={{ transform: 'translateY(-5%)' }}>
              
              {/* Structure lines mimicking the Opera architecture */}
              <g stroke="#ffffff" strokeWidth="1" opacity="0.15" fill="none">
                <path d="M50 900 Q 500 -200 950 900" />
                <path d="M100 900 Q 500 -100 900 900" />
                <path d="M150 900 Q 500 0 850 900" />
                <path d="M200 900 Q 500 100 800 900" />
                <path d="M250 900 Q 500 200 750 900" />
                <path d="M300 900 Q 500 300 700 900" />
                
                {/* Aisles / Stairs */}
                <path d="M 330 350 L 250 900" />
                <path d="M 460 300 L 450 900" />
                <path d="M 540 300 L 550 900" />
                <path d="M 670 350 L 750 900" />
                
                <path d="M 210 210 L 100 600" />
                <path d="M 790 210 L 900 600" />
              </g>

              {/* Render Seats */}
              {seats.map(seat => (
                <rect
                  key={seat.id}
                  x={seat.x}
                  y={seat.y}
                  width="14"
                  height="10"
                  rx="2"
                  fill="transparent"
                  stroke={seat.status === 'occupied' ? '#d946ef' : '#00f0ff'}
                  strokeWidth="1.5"
                  className="transition-all duration-300 hover:stroke-white cursor-pointer"
                  transform={\`rotate(\${Math.atan2(seat.y - 900, seat.x - 500) * 180 / Math.PI + 90} \${seat.x + 7} \${seat.y + 5})\`}
                  style={{
                    filter: \`drop-shadow(0 0 4px \${seat.status === 'occupied' ? '#d946ef80' : '#00f0ff80'})\`
                  }}
                />
              ))}

              {/* Text Annotations inside SVG */}
              <g className="font-mono text-sm tracking-widest font-bold">
                {/* Top Left - Occupied */}
                <text x="250" y="250" fill="#d946ef" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>OCCUPIED (87%)</text>
                <path d="M 370 245 L 430 350" stroke="#d946ef" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="430" cy="350" r="3" fill="#d946ef" />

                {/* Bottom Left - Occupied */}
                <text x="200" y="650" fill="#d946ef" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>OCCUPIED (87%)</text>
                <path d="M 280 635 L 350 550" stroke="#d946ef" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="350" cy="550" r="3" fill="#d946ef" />

                {/* Top Right - Available */}
                <text x="600" y="250" fill="#00f0ff" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>AVAILABLE / VIP (13%)</text>
                <path d="M 600 245 L 530 350" stroke="#00f0ff" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="530" cy="350" r="3" fill="#00f0ff" />

                {/* Bottom Right - Available */}
                <text x="650" y="600" fill="#00f0ff" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>AVAILABLE / VIP (13%)</text>
                <path d="M 650 595 L 580 500" stroke="#00f0ff" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="580" cy="500" r="3" fill="#00f0ff" />
              </g>

            </svg>
          </div>`;

content = content.replace(/<div className="absolute inset-0 flex items-center justify-center">[\s\S]*?(?=          \{\/\* Overlays \/ HUD Panels \*\/)/, svgReplacement + '\n');
fs.writeFileSync('src/components/spaceflow/VenueManagementView.tsx', content);
