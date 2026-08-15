const fs = require('fs');
let code = fs.readFileSync('src/components/spaceflow/VenueManagementView.tsx', 'utf8');

code = code.replace(
  /export const VenueManagementView: React\.FC = \(\) => \{[\s\S]*?const initialSeats = useMemo\(\(\) => generateSeats\(\), \[\]\);\n  const \[seats, setSeats\] = useState<Seat\[\]>\(initialSeats\);/,
  `export const VenueManagementView: React.FC = () => {
  const [activeVenue, setActiveVenue] = useState<string>('opera');
  const [seats, setSeats] = useState<Seat[]>([]);
  
  useEffect(() => {
    setSeats(generateSeats(activeVenue));
  }, [activeVenue]);`
);

// We need to update the side buttons to call setActiveVenue
code = code.replace(/<button className="w-full text-left p-3 rounded-xl bg-cyan-950\/30 border border-cyan-900\/50 flex items-center justify-between group">/g, 
  `<button onClick={() => setActiveVenue('opera')} className={\`w-full text-left p-3 rounded-xl \${activeVenue === 'opera' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors\`}>`);

code = code.replace(/<button className="w-full text-left p-3 rounded-xl hover:bg-slate-900 border border-transparent transition-colors">\s*<div className="font-bold text-slate-300 text-sm">Théâtre Antique<\/div>/,
  `<button onClick={() => setActiveVenue('theatre')} className={\`w-full text-left p-3 rounded-xl \${activeVenue === 'theatre' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors\`}>\n            <div className="font-bold text-slate-300 text-sm">Théâtre Antique</div>`);

code = code.replace(/<button className="w-full text-left p-3 rounded-xl hover:bg-slate-900 border border-transparent transition-colors">\s*<div className="font-bold text-slate-300 text-sm">Orange Vélodrome<\/div>/,
  `<button onClick={() => setActiveVenue('stadium')} className={\`w-full text-left p-3 rounded-xl \${activeVenue === 'stadium' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors\`}>\n            <div className="font-bold text-slate-300 text-sm">Orange Vélodrome</div>`);

code = code.replace(/<button className="w-full text-left p-3 rounded-xl hover:bg-slate-900 border border-transparent transition-colors">\s*<div className="font-bold text-slate-300 text-sm">Arène eSport Alpha<\/div>/,
  `<button onClick={() => setActiveVenue('esport')} className={\`w-full text-left p-3 rounded-xl \${activeVenue === 'esport' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors\`}>\n            <div className="font-bold text-slate-300 text-sm">Arène eSport Alpha</div>`);

// Need to conditionally render the active dot in the venue list
code = code.replace(/<div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"><\/div>/g, 
  `{activeVenue === 'opera' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}`);

code = code.replace(/<div className="font-bold text-slate-300 text-sm">Théâtre Antique<\/div>\s*<div className="text-\[10px\] text-slate-500 mt-1">Capacité: 1,800 places<\/div>/, 
  `<div><div className="font-bold text-slate-300 text-sm">Théâtre Antique</div>\n            <div className="text-[10px] text-slate-500 mt-1">Capacité: 1,800 places</div></div>\n            {activeVenue === 'theatre' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}`);

code = code.replace(/<div className="font-bold text-slate-300 text-sm">Orange Vélodrome<\/div>\s*<div className="text-\[10px\] text-slate-500 mt-1">Capacité: 67,394 places<\/div>/, 
  `<div><div className="font-bold text-slate-300 text-sm">Orange Vélodrome</div>\n            <div className="text-[10px] text-slate-500 mt-1">Capacité: 67,394 places</div></div>\n            {activeVenue === 'stadium' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}`);

code = code.replace(/<div className="font-bold text-slate-300 text-sm">Arène eSport Alpha<\/div>\s*<div className="text-\[10px\] text-slate-500 mt-1">Capacité: 5,000 places<\/div>/, 
  `<div><div className="font-bold text-slate-300 text-sm">Arène eSport Alpha</div>\n            <div className="text-[10px] text-slate-500 mt-1">Capacité: 5,000 places</div></div>\n            {activeVenue === 'esport' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}`);

fs.writeFileSync('src/components/spaceflow/VenueManagementView.tsx', code);
console.log('done');
