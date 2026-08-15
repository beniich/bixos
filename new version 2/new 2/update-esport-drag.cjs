const fs = require('fs');
let code = fs.readFileSync('src/components/spaceflow/EsportArenaView.tsx', 'utf8');

code = code.replace(
  /const \[isFullscreen, setIsFullscreen\] = useState\(false\);\n  const containerRef = useRef<HTMLDivElement>\(null\);/,
  `const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);`
);

code = code.replace(
  /const toggleFullscreen = \(\) => \{/,
  `const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    setIsSelecting(true);
    setSelectionBox({ x1: svgP.x, y1: svgP.y, x2: svgP.x, y2: svgP.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isSelecting || !selectionBox || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    setSelectionBox(prev => prev ? { ...prev, x2: svgP.x, y2: svgP.y } : null);
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionBox) {
      const minX = Math.min(selectionBox.x1, selectionBox.x2);
      const maxX = Math.max(selectionBox.x1, selectionBox.x2);
      const minY = Math.min(selectionBox.y1, selectionBox.y2);
      const maxY = Math.max(selectionBox.y1, selectionBox.y2);

      const seatsToSelect = seats.filter(seat => {
        return seat.x >= minX && seat.x <= maxX && seat.y >= minY && seat.y <= maxY;
      });

      if (seatsToSelect.length > 0) {
        setSeats(prevSeats => {
          const newSeats = [...prevSeats];
          seatsToSelect.forEach(selectedSeat => {
            if (selectedSeat.status === 'occupied') return;
            const index = newSeats.findIndex(s => s.id === selectedSeat.id);
            if (index !== -1 && newSeats[index].status === 'available') {
               newSeats[index] = { ...newSeats[index], status: 'selected' };
               
               toggleCartSeat({
                  id: selectedSeat.id,
                  section: selectedSeat.section,
                  row: selectedSeat.row,
                  seatNum: selectedSeat.seatNum,
                  price: selectedSeat.price,
                  type: selectedSeat.type
                });
            }
          });
          return newSeats;
        });
      }
    }
    setIsSelecting(false);
    setSelectionBox(null);
  };

  const toggleFullscreen = () => {`
);

code = code.replace(
  /<svg className="absolute inset-0 w-full h-full pointer-events-auto" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">/,
  `<svg 
    ref={svgRef}
    className="absolute inset-0 w-full h-full pointer-events-auto select-none" 
    viewBox="0 0 1600 900" 
    preserveAspectRatio="xMidYMid meet"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
    {selectionBox && (
      <rect 
        x={Math.min(selectionBox.x1, selectionBox.x2)} 
        y={Math.min(selectionBox.y1, selectionBox.y2)} 
        width={Math.abs(selectionBox.x2 - selectionBox.x1)} 
        height={Math.abs(selectionBox.y2 - selectionBox.y1)} 
        fill="rgba(255, 170, 247, 0.2)" 
        stroke="#ffaaf7" 
        strokeWidth="2" 
        strokeDasharray="4 4"
      />
    )}`
);

fs.writeFileSync('src/components/spaceflow/EsportArenaView.tsx', code);
console.log('done');
