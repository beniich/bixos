const fs = require('fs');
let code = fs.readFileSync('src/components/spaceflow/VenueManagementView.tsx', 'utf8');

code = code.replace(/const generateSeats = \(\): Seat\[\] => \{[\s\S]*?return seats;\n\};/, `const generateSeats = (venueId: string = 'opera'): Seat[] => {
  const seats: Seat[] = [];
  const cx = 500, cy = venueId === 'stadium' ? 500 : 900;
  
  if (venueId === 'opera') {
    // Lower tier blocks (4 blocks)
    const lowerAngles = [
      { start: -150, end: -125 },
      { start: -120, end: -95 },
      { start: -85, end: -60 },
      { start: -55, end: -30 }
    ];
    lowerAngles.forEach((block, bIdx) => {
      for (let row = 0; row < 6; row++) {
        let r = 400 + row * 22;
        let numSeats = 18 + Math.floor(row * 1.5);
        let angleStep = (block.end - block.start) / numSeats;
        for (let s = 0; s < numSeats; s++) {
          let angle = block.start + s * angleStep;
          let rad = angle * Math.PI / 180;
          let x = cx + Math.cos(rad) * r;
          let y = cy + Math.sin(rad) * r;
          
          const isCyanZone = (bIdx === 2 && row > 2 && s > 8);
          const rand = Math.random();
          const isAvailable = isCyanZone ? rand > 0.3 : rand > 0.9;
          seats.push({
            id: \`\${venueId}-L-\${bIdx}-\${row}-\${s}\`,
            x, y, tier: 'lower',
            status: isAvailable ? 'available' : 'occupied',
            section: 'Orchestre', row: \`Rang \${row + 1}\`, seatNum: s + 1,
            price: isCyanZone ? 150 : 80, type: isCyanZone ? 'vip' : 'regular'
          });
        }
      }
    });
    // Upper tier blocks
    const upperAngles = [
      { start: -155, end: -125 },
      { start: -120, end: -95 },
      { start: -85, end: -60 },
      { start: -55, end: -25 }
    ];
    upperAngles.forEach((block, bIdx) => {
      for (let row = 0; row < 5; row++) {
        let r = 580 + row * 22;
        let numSeats = 22 + Math.floor(row * 2);
        let angleStep = (block.end - block.start) / numSeats;
        for (let s = 0; s < numSeats; s++) {
          let angle = block.start + s * angleStep;
          let rad = angle * Math.PI / 180;
          let x = cx + Math.cos(rad) * r;
          let y = cy + Math.sin(rad) * r;
          
          const isCyanZone = (bIdx === 2);
          const rand = Math.random();
          const isAvailable = isCyanZone ? rand > 0.4 : rand > 0.95;
          seats.push({
            id: \`\${venueId}-U-\${bIdx}-\${row}-\${s}\`,
            x, y, tier: 'upper',
            status: isAvailable ? 'available' : 'occupied',
            section: 'Balcon', row: \`Rang \${row + 1}\`, seatNum: s + 1,
            price: isCyanZone ? 120 : 60, type: isCyanZone ? 'vip' : 'regular'
          });
        }
      }
    });
  } else if (venueId === 'stadium') {
    // Stadium layout (rectangular with rounded corners, or just an oval)
    for (let row = 0; row < 12; row++) {
      let rX = 200 + row * 18;
      let rY = 120 + row * 18;
      let numSeats = 60 + row * 10;
      let angleStep = (Math.PI * 2) / numSeats;
      for (let s = 0; s < numSeats; s++) {
        // Create an oval shape with a gap for the field entrance
        let rad = s * angleStep;
        if (rad > Math.PI * 0.45 && rad < Math.PI * 0.55) continue; // North entrance
        if (rad > Math.PI * 1.45 && rad < Math.PI * 1.55) continue; // South entrance
        
        let x = cx + Math.cos(rad) * rX;
        let y = cy + Math.sin(rad) * rY;
        
        const isVip = row < 2;
        const rand = Math.random();
        const isAvailable = rand > 0.7;
        seats.push({
          id: \`\${venueId}-\${row}-\${s}\`,
          x, y, tier: row < 5 ? 'lower' : 'upper',
          status: isAvailable ? 'available' : 'occupied',
          section: \`Tribune \${Math.floor(rad/(Math.PI/2)) + 1}\`, row: \`Rang \${row + 1}\`, seatNum: s + 1,
          price: isVip ? 250 : 90, type: isVip ? 'vip' : 'regular'
        });
      }
    }
  } else if (venueId === 'esport') {
    // Esport Arena layout (hexagonal or circular focused on center)
    for (let row = 0; row < 8; row++) {
      let r = 150 + row * 25;
      let numSeats = 30 + row * 8;
      let angleStep = (Math.PI * 2) / numSeats;
      for (let s = 0; s < numSeats; s++) {
        let rad = s * angleStep;
        let x = cx + Math.cos(rad) * r;
        let y = cy + Math.sin(rad) * r;
        
        const isVip = row === 0;
        const rand = Math.random();
        const isAvailable = rand > 0.5;
        seats.push({
          id: \`\${venueId}-\${row}-\${s}\`,
          x, y, tier: 'main',
          status: isAvailable ? 'available' : 'occupied',
          section: \`Sector \${Math.floor((rad/(Math.PI*2)) * 6) + 1}\`, row: \`Rang \${row + 1}\`, seatNum: s + 1,
          price: isVip ? 180 : 70, type: isVip ? 'vip' : 'regular'
        });
      }
    }
  } else {
    // default mini layout for Theatre
    for (let row = 0; row < 8; row++) {
      let r = 200 + row * 20;
      let numSeats = 30 + Math.floor(row * 2);
      let angleStep = Math.PI / numSeats;
      for (let s = 0; s < numSeats; s++) {
        let rad = Math.PI + s * angleStep;
        let x = cx + Math.cos(rad) * r;
        let y = cy + Math.sin(rad) * r;
        
        const isVip = row < 3 && s > numSeats/4 && s < numSeats*3/4;
        const rand = Math.random();
        const isAvailable = rand > 0.8;
        seats.push({
          id: \`\${venueId}-\${row}-\${s}\`,
          x, y, tier: 'main',
          status: isAvailable ? 'available' : 'occupied',
          section: 'Parterre', row: \`Rang \${row + 1}\`, seatNum: s + 1,
          price: isVip ? 90 : 45, type: isVip ? 'vip' : 'regular'
        });
      }
    }
  }
  return seats;
};`);

fs.writeFileSync('src/components/spaceflow/VenueManagementView.tsx', code);
console.log('done');
