import { WORLD, FIELD_OF_VIEW, nearestRepair } from './state.js';

// A small software raycaster keeps this static-site game dependency-free.
// Walls use a depth buffer so objects never show through rooms or closed walls.
const WIDTH = 600, HEIGHT = 360;
const surface = document.createElement('canvas'); surface.width = WIDTH; surface.height = HEIGHT;
const view = surface.getContext('2d');
const FOCAL = WIDTH / (2 * Math.tan(FIELD_OF_VIEW / 2));
const wallDepth = new Float32Array(WIDTH);
const textures = new Map();
const sprites = new Map();

function texture(room) {
  if (textures.has(room)) return textures.get(room);
  const tile = document.createElement('canvas'); tile.width = tile.height = 64;
  const c = tile.getContext('2d');
  c.fillStyle = room === 'kitchen' ? '#cbd4bc' : '#e6d9bb'; c.fillRect(0, 0, 64, 64);
  // Wallpaper seams, picture rail, wood wainscoting, and baseboards.
  c.fillStyle = '#ffffff18'; for (let x = 0; x < 64; x += 8) c.fillRect(x, 0, 1, 40);
  c.fillStyle = room === 'kitchen' ? '#748d79' : '#6d867c'; c.fillRect(0, 41, 64, 23);
  c.fillStyle = '#ffffff22'; for (let x = 0; x < 64; x += 16) c.fillRect(x, 44, 1, 17);
  c.fillStyle = '#d8cba6'; c.fillRect(0, 39, 64, 3);
  c.fillStyle = '#42574d'; c.fillRect(0, 61, 64, 3);
  c.fillStyle = '#655747'; c.fillRect(0, 0, 64, 2);
  textures.set(room, tile); return tile;
}

function makeSprite(kind, repaired = false) {
  const key = `${kind}-${repaired}`;
  if (sprites.has(key)) return sprites.get(key);
  const tile = document.createElement('canvas'); tile.width = 160; tile.height = 180;
  const c = tile.getContext('2d');
  if (kind === 'drywall') {
    c.fillStyle = '#d9cba8'; c.fillRect(12, 18, 136, 145);
    c.strokeStyle = '#b6a587'; c.lineWidth = 3; c.strokeRect(12, 18, 136, 145);
    if (repaired) {
      c.fillStyle = '#f1e9d3'; c.fillRect(30, 37, 100, 105);
      c.strokeStyle = '#d4cbb5'; c.strokeRect(30, 37, 100, 105);
    } else {
      c.fillStyle = '#4b3b31'; c.beginPath();
      [[30,58],[56,43],[78,58],[110,44],[129,72],[117,104],[125,130],[83,143],[65,127],[34,133],[42,100]].forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.fill();
      c.fillStyle = '#85644d'; c.fillRect(60, 56, 10, 75); c.fillRect(100, 58, 9, 75);
      c.strokeStyle = '#7d6854'; c.lineWidth = 2; c.beginPath(); c.moveTo(30,58); c.lineTo(21,36); c.moveTo(125,130); c.lineTo(145,149); c.stroke();
    }
  } else if (kind === 'pipe') {
    if (!repaired) { c.fillStyle = '#75b7cb99'; c.beginPath(); c.ellipse(80, 161, 65, 13, 0, 0, Math.PI*2); c.fill(); }
    c.fillStyle = '#647e70'; c.fillRect(22, 80, 116, 79);
    c.fillStyle = '#91a18b'; c.fillRect(28, 86, 104, 67);
    c.strokeStyle = '#52695e'; c.lineWidth = 3; c.strokeRect(30, 88, 48, 62); c.strokeRect(82, 88, 48, 62);
    c.fillStyle = '#d9c9a4'; c.fillRect(65, 114, 6, 5); c.fillRect(89, 114, 6, 5);
    c.fillStyle = '#f5eedc'; c.fillRect(13, 60, 134, 26);
    c.fillStyle = '#b7ceca'; c.fillRect(34, 62, 91, 15);
    c.strokeStyle = '#6c8586'; c.lineWidth = 8; c.beginPath(); c.moveTo(80,63); c.lineTo(80,33); c.lineTo(103,33); c.lineTo(103,45); c.stroke();
    if (!repaired) { c.fillStyle = '#72b8d8'; c.fillRect(98, 44, 6, 28); c.fillRect(104, 150, 5, 13); }
  } else if (kind === 'sofa') {
    c.fillStyle = '#625c40'; c.fillRect(26, 139, 10, 29); c.fillRect(124, 139, 10, 29);
    c.fillStyle = '#a86e4d'; c.fillRect(16, 56, 128, 83);
    c.fillStyle = '#bc875c'; c.fillRect(22, 63, 55, 55); c.fillRect(82, 63, 55, 55);
    c.fillStyle = '#cb9668'; c.fillRect(17, 119, 126, 26);
    c.fillStyle = '#955e40'; c.fillRect(6, 90, 21, 61); c.fillRect(133, 90, 21, 61);
    c.fillStyle = '#d9c69c'; c.fillRect(38, 82, 28, 30);
  } else if (kind === 'plant') {
    c.fillStyle = '#ad7253'; c.beginPath(); c.moveTo(51,125); c.lineTo(109,125); c.lineTo(99,170); c.lineTo(61,170); c.closePath(); c.fill();
    c.strokeStyle = '#4b7050'; c.lineWidth = 6; c.beginPath(); c.moveTo(80,130); c.lineTo(80,40); c.stroke();
    for (let i = 0; i < 7; i++) { c.fillStyle = i%2 ? '#72945e' : '#4b7956'; c.beginPath(); c.ellipse(80+(i%2?20:-20), 35+i*12, 30, 12, i%2?-.5:.5, 0, Math.PI*2); c.fill(); }
  } else if (kind === 'window') {
    c.fillStyle = '#425c50'; c.fillRect(8, 8, 144, 158);
    c.fillStyle = '#d3e6db'; c.fillRect(16, 16, 128, 142);
    c.fillStyle = '#9ac8cf'; c.fillRect(24, 24, 112, 125);
    c.fillStyle = '#b7ce9b'; c.fillRect(24, 110, 112, 39);
    c.fillStyle = '#f5ecd7'; c.fillRect(76, 18, 8, 137); c.fillRect(20, 80, 120, 8);
    c.fillStyle = '#f4eedc'; c.fillRect(2, 157, 156, 12);
  }
  sprites.set(key, tile); return tile;
}

function cameraPoint(player, x, y) {
  const dx = x - player.x, dy = y - player.y;
  return { side: -Math.sin(player.angle)*dx + Math.cos(player.angle)*dy, depth: Math.cos(player.angle)*dx + Math.sin(player.angle)*dy };
}
function floorPolygon(c, player, horizon, points, color) {
  let vertices = points.map(([x,y]) => cameraPoint(player,x,y));
  // Clip polygons crossing the near plane instead of projecting behind the eye.
  const clipped = [];
  for (let i=0; i<vertices.length; i++) {
    const a = vertices[i], b = vertices[(i+1)%vertices.length];
    if (a.depth >= 0.08) clipped.push(a);
    if ((a.depth >= 0.08) !== (b.depth >= 0.08)) {
      const t = (0.08-a.depth)/(b.depth-a.depth);
      clipped.push({ side: a.side+(b.side-a.side)*t, depth: 0.08 });
    }
  }
  if (clipped.length<3) return;
  c.fillStyle = color; c.beginPath();
  clipped.forEach((p,i) => { const x = WIDTH/2+p.side*FOCAL/p.depth, y = horizon+0.5*FOCAL/p.depth; if(i) c.lineTo(x,y); else c.moveTo(x,y); });
  c.closePath(); c.fill();
}

export function drawHouse(context, state, time = 0, mouseLocked = false) {
  const c = view, p = state.player;
  const horizon = HEIGHT/2 + p.pitch * 150;
  const ceiling = c.createLinearGradient(0,0,0,horizon); ceiling.addColorStop(0,'#c1bca9'); ceiling.addColorStop(1,'#eee4cb');
  c.fillStyle = ceiling; c.fillRect(0,0,WIDTH,HEIGHT);
  c.fillStyle = '#aa8255'; c.fillRect(0,horizon,WIDTH,HEIGHT-horizon);
  // World-space floorboards and rugs give motion a visible perspective cue.
  for (let y=1; y<11; y+=0.5) for (let x=1; x<13; x++) {
    if (Math.floor(x+y*2)%2) floorPolygon(c,p,horizon,[[x,y],[x+1,y],[x+1,y+0.49],[x,y+0.49]],'#b99161');
  }
  floorPolygon(c,p,horizon,[[1.5,8],[3,8],[3,10],[1.5,10]],'#6d8779');
  floorPolygon(c,p,horizon,[[1.65,8.15],[2.85,8.15],[2.85,9.85],[1.65,9.85]],'#a3ae8a');
  const board = state.repairs.find(r=>r.id==='floorboard');
  floorPolygon(c,p,horizon,[[4,7],[5,7],[5,7.65],[4,7.65]],board.repaired?'#c4a06b':'#5c3e2b');
  floorPolygon(c,p,horizon,[[4.04,7.05],[4.96,7.02],[4.9,7.57],[4.09,7.6]],board.repaired?'#b68d59':'#97603d');
  if (board.repaired) for(const x of [4.13,4.8]) for(const y of [7.12,7.48]) floorPolygon(c,p,horizon,[[x,y],[x+.04,y],[x+.04,y+.04],[x,y+.04]],'#4a5149');

  for (let column=0; column<WIDTH; column++) {
    const screen = (column-WIDTH/2)/FOCAL;
    const rayX = Math.cos(p.angle)-Math.sin(p.angle)*screen;
    const rayY = Math.sin(p.angle)+Math.cos(p.angle)*screen;
    let mapX=Math.floor(p.x), mapY=Math.floor(p.y);
    const deltaX=Math.abs(1/rayX), deltaY=Math.abs(1/rayY);
    const stepX=rayX<0?-1:1, stepY=rayY<0?-1:1;
    let sideX=(rayX<0?p.x-mapX:mapX+1-p.x)*deltaX;
    let sideY=(rayY<0?p.y-mapY:mapY+1-p.y)*deltaY;
    let side=0;
    for(let step=0;step<60;step++) {
      if(sideX<sideY) { sideX+=deltaX; mapX+=stepX; side=0; }
      else { sideY+=deltaY; mapY+=stepY; side=1; }
      if(WORLD[mapY]?.[mapX]!=='0') break;
    }
    const depth=Math.max(.02,side===0?sideX-deltaX:sideY-deltaY); wallDepth[column]=depth;
    const height=FOCAL/depth;
    const top=horizon-height/2;
    const hit=side===0?p.y+depth*rayY:p.x+depth*rayX;
    const texX=Math.min(63,Math.floor((hit-Math.floor(hit))*64));
    c.drawImage(texture(mapX>7?'kitchen':'living'),texX,0,1,64,column,top,1,height);
    c.fillStyle=`rgba(24,35,29,${Math.min(.68,depth*.045+(side===0?.1:0))})`; c.fillRect(column,top,1,height);
    c.fillStyle='#504c3b'; c.fillRect(column,top,1,Math.max(1,height*.018));
  }

  const items = [
    ...state.repairs.filter(r=>r.id!=='floorboard').map(r=>({...r,kind:r.id,width:r.id==='drywall'?.75:1.15,height:r.id==='drywall'?.6:.75,base:r.id==='drywall'?.3:0})),
    {kind:'sofa',x:1.65,y:9.6,width:1.5,height:.75,base:0},
    {kind:'plant',x:5.9,y:2,width:.7,height:.85,base:0},
    {kind:'plant',x:12.25,y:9.7,width:.8,height:.85,base:0},
    {kind:'window',x:4.7,y:1.06,width:.85,height:.6,base:.3},
    {kind:'window',x:10,y:1.06,width:.85,height:.6,base:.3},
  ].map(item=>({...item,...cameraPoint(p,item.x,item.y)})).sort((a,b)=>b.depth-a.depth);
  for(const item of items) {
    if(item.depth<.15) continue;
    const scale=FOCAL/item.depth, width=item.width*scale, height=item.height*scale;
    const left=WIDTH/2+item.side*scale-width/2;
    const top=horizon+(.5-item.base-item.height)*scale;
    if(left>WIDTH || left+width<0) continue;
    const sprite=makeSprite(item.kind,item.repaired);
    for(let x=Math.max(0,Math.floor(left)); x<Math.min(WIDTH,left+width); x++) {
      if(item.depth>wallDepth[x]+.03) continue;
      const sx=Math.max(0,Math.min(159,Math.floor((x-left)/width*160)));
      c.drawImage(sprite,sx,0,1,180,x,top,1,height);
    }
  }
  const active=nearestRepair(state);
  // Small floating job markers remain legible against the interior.
  for(const repair of state.repairs) {
    const point=cameraPoint(p,repair.x,repair.y);
    if(point.depth<.3) continue;
    const sx=WIDTH/2+point.side*FOCAL/point.depth;
    if(sx<10 || sx>WIDTH-10 || point.depth>wallDepth[Math.floor(sx)]+.1) continue;
    const sy=repair.id==='floorboard'?horizon+.16*FOCAL/point.depth:horizon-.43*FOCAL/point.depth;
    c.fillStyle=repair.repaired?'#45694d':'#f3d58c'; c.beginPath(); c.arc(sx,sy,active?.id===repair.id?9:6,0,Math.PI*2); c.fill();
    if(active?.id===repair.id) { c.fillStyle='#293c33'; c.font='bold 11px system-ui'; c.textAlign='center'; c.fillText('E',sx,sy+4); }
  }
  // An eye-level crosshair and held tool replace the old top-down player marker.
  c.strokeStyle='#fff8e0'; c.lineWidth=1.5; c.beginPath(); c.moveTo(WIDTH/2-5,HEIGHT/2); c.lineTo(WIDTH/2+5,HEIGHT/2); c.moveTo(WIDTH/2,HEIGHT/2-5); c.lineTo(WIDTH/2,HEIGHT/2+5); c.stroke();
  const bob=Math.sin(time*.008)*1.5;
  c.save(); c.translate(WIDTH-88,HEIGHT+15+bob); c.rotate(-.35);
  c.fillStyle='#c19263'; c.fillRect(-13,-92,26,110); c.fillStyle='#7f9b8b'; c.fillRect(-21,-30,42,60);
  c.fillStyle='#815e3d'; c.fillRect(-5,-145,12,75); c.fillStyle='#536365'; c.fillRect(-35,-153,65,22); c.fillStyle='#a5b4ac'; c.fillRect(-35,-153,17,22); c.restore();
  drawMap(c,state);
  c.fillStyle='#243c32cc'; c.fillRect(12,12,174,26); c.fillStyle='#f9f2dc'; c.font='11px system-ui'; c.textAlign='left';
  c.fillText(p.y<5?(p.x<7?'WORKROOM':'KITCHEN'):(p.x<7?'LIVING ROOM':'DINING ROOM'),23,29);
  if(!mouseLocked) { c.fillStyle='#243c32c9'; c.fillRect(WIDTH/2-123,HEIGHT-31,246,22); c.fillStyle='#fff4da'; c.textAlign='center'; c.fillText('Click view for mouse look · ← → also turn',WIDTH/2,HEIGHT-16); }
  context.imageSmoothingEnabled=false; context.drawImage(surface,0,0,context.canvas.width,context.canvas.height);
}

function drawMap(c,state) {
  const unit=6, ox=WIDTH-100, oy=15;
  c.fillStyle='#f5ecd9e8'; c.fillRect(ox-5,oy-5,94,82);
  WORLD.forEach((row,y)=>[...row].forEach((cell,x)=>{if(cell==='1'){c.fillStyle='#556b5e';c.fillRect(ox+x*unit,oy+y*unit,unit,unit);}}));
  for(const r of state.repairs){c.fillStyle=r.repaired?'#63976b':'#bc653d';c.fillRect(ox+r.x*unit-2,oy+r.y*unit-2,4,4);}
  const p=state.player;c.fillStyle='#335d78';c.beginPath();c.arc(ox+p.x*unit,oy+p.y*unit,2.5,0,Math.PI*2);c.fill();
  c.strokeStyle='#335d78';c.beginPath();c.moveTo(ox+p.x*unit,oy+p.y*unit);c.lineTo(ox+(p.x+Math.cos(p.angle))*unit,oy+(p.y+Math.sin(p.angle))*unit);c.stroke();
}
