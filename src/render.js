import { HOUSE, PLAYER_RADIUS, nearestRepair } from './state.js';

export function drawHouse(context, state) {
  const c = context;
  c.clearRect(0, 0, 900, 540);
  c.fillStyle = '#c9d8ca'; c.fillRect(0, 0, 900, 540);
  c.fillStyle = '#9eaf9c'; c.fillRect(64, 79, 800, 425);
  c.fillStyle = '#d9bb89'; c.fillRect(HOUSE.x, HOUSE.y, HOUSE.width, HOUSE.height);
  c.strokeStyle = '#c5a676'; c.lineWidth = 1;
  for (let y = 65; y < 490; y += 34) {
    c.beginPath(); c.moveTo(50, y); c.lineTo(850, y); c.stroke();
    for (let x = 50 + ((y / 34 | 0) % 2) * 95; x < 850; x += 190) {
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, Math.min(y + 34, 490)); c.stroke();
    }
  }
  c.strokeStyle = '#405c4d'; c.lineWidth = 16; c.strokeRect(42, 57, 816, 441);
  c.fillStyle = '#eee5ce'; c.fillRect(50, 65, 800, 45);
  // A window and rug give orientation without adding collision obstacles.
  c.fillStyle = '#88b8be'; c.fillRect(400, 64, 100, 30);
  c.strokeStyle = '#fff7e6'; c.lineWidth = 5; c.strokeRect(400, 64, 100, 30);
  c.beginPath(); c.moveTo(450, 64); c.lineTo(450, 94); c.stroke();
  c.fillStyle = '#a7b497'; c.fillRect(550, 330, 210, 100);
  c.strokeStyle = '#d9dfc2'; c.lineWidth = 3; c.strokeRect(560, 340, 190, 80);
  const nearest = nearestRepair(state);
  for (const repair of state.repairs) {
    const { x, y, repaired, id } = repair;
    if (nearest?.id === id) {
      c.strokeStyle = '#fff8db'; c.lineWidth = 3; c.setLineDash([6, 5]);
      c.beginPath(); c.arc(x, y, 58, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    }
    if (id === 'drywall') {
      c.fillStyle = repaired ? '#f5eed9' : '#bca68b'; c.fillRect(x - 45, y - 28, 90, 56);
      if (!repaired) {
        c.fillStyle = '#514139'; c.beginPath();
        [[-28,-14],[-9,-22],[10,-11],[28,-15],[22,6],[10,20],[-15,13],[-29,17]].forEach(([dx,dy], index) => index ? c.lineTo(x+dx,y+dy) : c.moveTo(x+dx,y+dy));
        c.closePath(); c.fill();
      }
    } else if (id === 'pipe') {
      c.fillStyle = '#778b7d'; c.fillRect(x - 45, y - 36, 90, 65);
      c.fillStyle = '#f4f1df'; c.fillRect(x - 34, y - 28, 68, 43);
      c.fillStyle = '#a1c7cc'; c.fillRect(x - 23, y - 18, 46, 23);
      c.strokeStyle = '#4e6766'; c.lineWidth = 7;
      c.beginPath(); c.moveTo(x, y-26); c.lineTo(x, y-42); c.lineTo(x+17, y-42); c.stroke();
      if (!repaired) {
        c.fillStyle = '#78b8c9'; c.beginPath(); c.ellipse(x+5, y+43, 34, 10, 0, 0, Math.PI*2); c.fill();
        c.fillRect(x, y+25, 5, 13);
      }
    } else {
      c.save(); c.translate(x, y); if (!repaired) c.rotate(-0.12);
      c.fillStyle = repaired ? '#bc945e' : '#8c5b37'; c.fillRect(-55, -20, 110, 40);
      c.strokeStyle = '#644f35'; c.lineWidth = 2; c.strokeRect(-55, -20, 110, 40);
      c.fillStyle = repaired ? '#526258' : '#edc38c';
      for (const dx of [-44, 44]) for (const dy of [-11, 11]) { c.beginPath(); c.arc(dx, dy, 3, 0, Math.PI*2); c.fill(); }
      c.restore();
    }
    c.font = 'bold 13px system-ui'; c.textAlign = 'center';
    c.fillStyle = '#fff7e6'; c.fillRect(x - 80, y + 61, 160, 25);
    c.fillStyle = '#314e3e'; c.fillText(repaired ? '✓ Repaired' : repair.name, x, y + 78);
  }
  const { x, y } = state.player;
  c.fillStyle = '#5b513a33'; c.beginPath(); c.ellipse(x, y+15, 18, 7, 0, 0, Math.PI*2); c.fill();
  c.fillStyle = '#496f64'; c.beginPath(); c.arc(x, y, PLAYER_RADIUS, 0, Math.PI*2); c.fill();
  c.fillStyle = '#e8b879'; c.beginPath(); c.arc(x, y-8, 10, 0, Math.PI*2); c.fill();
  c.fillStyle = '#bf6a3e'; c.fillRect(x-12, y-17, 24, 8);
  c.font = 'bold 11px system-ui'; c.fillStyle = '#314e3e'; c.fillText('YOU', x, y+37);
}
