function generateSeats() {
  const seats = [];
  const cx = 500, cy = 900;
  // Lower tier:
  for(let row = 0; row < 6; row++) {
    let r = 350 + row * 25;
    let numSeats = 50 + row * 5;
    let angleStep = 100 / numSeats;
    for(let s = 0; s < numSeats; s++) {
      let angle = -140 + s * angleStep; 
      let rad = angle * Math.PI / 180;
      let x = cx + Math.cos(rad) * r;
      let y = cy + Math.sin(rad) * r;
      seats.push({ id: `L-${row}-${s}`, x, y, tier: 'lower', status: Math.random() > 0.87 ? 'available' : 'occupied' });
    }
  }
  // Upper tier:
  for(let row = 0; row < 4; row++) {
    let r = 550 + row * 25;
    let numSeats = 70 + row * 5;
    let angleStep = 120 / numSeats;
    for(let s = 0; s < numSeats; s++) {
      let angle = -150 + s * angleStep; 
      let rad = angle * Math.PI / 180;
      let x = cx + Math.cos(rad) * r;
      let y = cy + Math.sin(rad) * r;
      seats.push({ id: `U-${row}-${s}`, x, y, tier: 'upper', status: Math.random() > 0.87 ? 'available' : 'occupied' });
    }
  }
  return seats;
}
