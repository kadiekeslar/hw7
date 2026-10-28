// Furniture is built from solid 3D shapes, in meters. Floor layout lives in state.js.
// Items are decorative; walls own collision so repair approaches remain accessible.
export function buildScene(add) {
  const box = (x,y,z,w,h,d,color,material='plain',angle=0) => add('box',{x,y,z,w,h,d,color,material,angle});
  const cylinder = (x,y,z,w,h,d,color,material='plain') => add('cylinder',{x,y,z,w,h,d,color,material});
  const leg = (x,z,h=.68) => box(x,h/2,z,.07,h,.07,'#67452f','wood');

  // Living-room sofa with a back, seat cushions, rolled arms, and wooden legs.
  box(1.58,.47,9.1,.72,.32,2.35,'#8d9b8b','fabric');
  box(1.26,.83,9.1,.2,.75,2.35,'#9eac99','fabric');
  for(const z of [8.02,10.18]) box(1.62,.69,z,.85,.49,.21,'#879880','fabric');
  for(const z of [8.42,9.1,9.78]) {box(1.73,.69,z,.62,.16,.64,'#b1b8a3','fabric');box(1.4,1,z,.13,.4,.61,'#a2ae99','fabric',-.08);}
  for(const z of [8.17,10.03]) for(const x of [1.35,1.9]) box(x,.16,z,.08,.22,.09,'#543c2c','wood');
  box(1.73,.96,8.35,.27,.34,.32,'#d6b588','fabric',.12);
  box(1.74,.96,9.84,.27,.34,.32,'#76878c','fabric',-.12);

  // Coffee table, books, and a ceramic cup.
  box(3,.53,9.05,.72,.09,1.35,'#a07348','wood');
  for(const x of [2.74,3.26]) for(const z of [8.55,9.55]) box(x,.26,z,.06,.5,.06,'#594432','wood');
  box(3.02,.61,8.76,.32,.06,.44,'#6d827f');box(3.04,.66,8.78,.28,.04,.4,'#b5805e');
  cylinder(2.95,.67,9.35,.12,.2,.12,'#eee6d5');

  // Hall console and a bookcase visible when entering the house.
  box(5.75,.86,6.48,1.55,.08,.44,'#926b46','wood');
  for(const x of [5.1,6.4]) box(x,.43,6.48,.08,.85,.33,'#7c5b3e','wood');
  box(5.75,.53,6.48,1.55,.05,.4,'#926b46','wood');
  cylinder(5.45,1.02,6.48,.13,.25,.13,'#d7ccae');
  box(1.3,1.25,6.55,.4,2.2,1,'#715039','wood');
  for(const y of [.25,.7,1.15,1.6,2.05]) {
    box(1.52,y,6.55,.16,.05,1,'#b18b5e','wood');
    if(y<2) for(let i=0;i<5;i++) box(1.53,y+.18,6.2+i*.16,.2,.31,.11,['#8c9c9d','#b57b59','#c1b59c','#657c6b','#ad9c73'][i]);
  }

  // Workroom: workbench and a modest tool rack.
  box(5.35,.89,2,1.75,.12,.8,'#ae8456','wood');
  for(const x of [4.65,6.05]) for(const z of [1.72,2.28]) box(x,.44,z,.1,.88,.1,'#6d523b','wood');
  box(5.36,.35,2,1.65,.08,.72,'#94734d','wood');
  box(5.35,1.65,1.04,1.65,.75,.06,'#a6855b','wood');
  for(const x of [4.85,5.2,5.55,5.9]) {box(x,1.68,1.12,.035,.35,.04,'#8f6b44');box(x,1.88,1.12,.17,.07,.05,'#596163');}
  box(5.7,1.04,1.95,.42,.16,.3,'#ad6446');

  // Kitchen cabinets, stone counters, oven, and refrigerator.
  for(const x of [8.3,9.45,10.6,11.75]) {
    box(x,.47,1.42,1.1,.92,.72,'#778c7a');
    if(x!==9.45 && x!==11.75) {box(x,.48,1.8,1.02,.77,.05,'#9baa91');box(x,.75,1.84,.2,.035,.04,'#bca77d');}
    box(x,.96,1.43,1.14,.08,.8,'#dad8c7','stone');
    if(x<11) {box(x,1.98,1.22,1.08,.8,.42,'#83977e');box(x,1.98,1.45,1,.7,.04,'#a4b195');box(x+.36,1.76,1.49,.035,.16,.04,'#c9b58c');}
  }
  box(12.58,1.1,3.2,.75,2.2,.85,'#c4cbc4','metal');
  box(12.55,1.5,3.65,.7,1.3,.05,'#e0e3d9','metal');box(12.55,.45,3.65,.7,.72,.05,'#d4dbd2','metal');
  box(12.3,1.38,3.7,.045,.65,.04,'#667773','metal');
  box(8.3,.46,1.83,.85,.65,.07,'#465352','metal');box(8.3,.5,1.88,.65,.4,.03,'#263a3e','glass');
  box(8.3,.81,1.9,.65,.04,.06,'#a3aca2','metal');
  for(const x of [8.06,8.53]) for(const z of [1.25,1.62]) cylinder(x,1.015,z,.24,.018,.24,'#303c3a','metal');
  cylinder(10.55,1.12,1.47,.2,.27,.2,'#b8946b');

  // Dining table and four distinct chairs.
  box(10.35,.82,7.65,1.55,.1,2,'#a17b52','wood');
  for(const x of [9.72,10.98]) for(const z of [6.83,8.47]) leg(x,z,.78);
  for(const z of [7.12,8.12]) for(const x of [9.18,11.52]) {
    box(x,.48,z,.52,.08,.52,'#a58a63','wood');
    box(x+(x<10?-.22:.22),.89,z,.07,.78,.53,'#a58a63','wood');
    for(const dx of [-.19,.19]) for(const dz of [-.19,.19]) box(x+dx,.24,z+dz,.055,.48,.055,'#765a3d','wood');
  }
  cylinder(10.35,1.02,7.65,.22,.3,.22,'#c7bfa4');
  for(const dx of [-.07,.05]) {cylinder(10.35+dx,1.3,7.65,.025,.4,.025,'#547354');box(10.35+dx,1.46,7.65,.11,.12,.1,'#d2a46d');}

  // Glazed windows with a garden view, sash frames, and deep sills.
  for(const x of [4.05,10.45]) {
    const z=x<7?1.055:10.945, front=x<7?1:-1;
    box(x,1.75,z,1.48,1.25,.065,'#b8ac91','wood');
    box(x,1.75,z+front*.04,1.33,1.1,.018,'#b4d1d2','glow');
    box(x,1.36,z+front*.055,1.3,.3,.015,'#8caa7c');
    for(const dx of [-.7,0,.7])box(x+dx,1.75,z+front*.07,.045,1.26,.045,'#eee7d5');
    for(const y of [1.14,1.75,2.36])box(x,y,z+front*.07,1.44,.045,.045,'#eee7d5');
    box(x,1.12,z+front*.11,1.65,.07,.24,'#eee7d5');
  }

  // Plants, framed artwork, a front door, and ceiling fixtures.
  for(const [x,z] of [[6.05,9.8],[8.25,3.5]]) {
    cylinder(x,.28,z,.36,.52,.36,'#bd9770');
    cylinder(x,.84,z,.035,.9,.035,'#586a42');
    for(let i=0;i<6;i++) box(x+Math.sin(i*2)*.18,.65+i*.13,z+Math.cos(i*2)*.12,.28,.08,.17,i%2?'#597648':'#7b8e56', 'plain',i);
  }
  box(4.3,1.5,10.97,1.1,.8,.055,'#7c5e40','wood');box(4.3,1.5,10.93,.95,.65,.035,'#ded2b8');
  box(4.3,1.44,10.9,.7,.3,.015,'#92a18a');box(4.42,1.63,10.89,.21,.18,.01,'#c49c66');
  box(6.2,1.17,10.96,1,2.34,.08,'#8c7558','wood');
  for(const y of [.55,1.56]) box(6.2,y,10.9,.73,.67,.04,'#a18b6a','wood');
  cylinder(5.85,1.05,10.84,.07,.07,.07,'#cdb376','metal');
  for(const [x,z] of [[3.6,8.5],[3.5,3],[10,3],[10.4,8]]) {
    box(x,2.77,z,.13,.06,.13,'#725e43');cylinder(x,2.6,z,.04,.3,.04,'#605b4c');
    cylinder(x,2.42,z,.48,.17,.48,'#e9ddc1');
    cylinder(x,2.32,z,.29,.025,.29,'#fff0bf','glow');
  }
}

export function buildRepair(add, repair) {
  const {x,y:z,id,repaired} = repair;
  const box=(dx,y,dz,w,h,d,color,material='plain',angle=0)=>add('box',{x:x+dx,y,z:z+dz,w,h,d,color,material,angle});
  const cylinder=(dx,y,dz,w,h,d,color,material='plain')=>add('cylinder',{x:x+dx,y,z:z+dz,w,h,d,color,material});
  if(id==='drywall') {
    box(0,1.5,0,1.1,.85,.025,repaired?'#e5dfcf':'#493a2d','plaster');
    if(!repaired) {for(const dx of [-.31,.24]) box(dx,1.5,-.025,.055,.82,.08,'#a47e52','wood');box(0,1.5,.02,.85,.06,.025,'#846e53','wood',-.17);}
    else box(0,1.5,.015,.95,.71,.012,'#f0e9d9','plaster');
  } else if(id==='pipe') {
    // Sink basin, tap, and the visible leak below the cabinet.
    box(0,1.014,-.15,.83,.035,.56,'#6f8580','metal');box(0,1.024,-.15,.69,.01,.43,'#bad0cb','glass');
    cylinder(0,1.22,-.4,.045,.4,.045,'#929f96','metal');box(.1,1.42,-.4,.23,.045,.045,'#aab7ad','metal');
    cylinder(.21,1.37,-.4,.045,.12,.045,'#aab7ad','metal');
    if(!repaired) {cylinder(.21,1.13,-.4,.015,.35,.015,'#78b7c8','glow');box(0,.015,.53,1,.012,.53,'#7eafb4','glass');cylinder(.2,.3,.29,.02,.58,.02,'#78b7c8','glow');}
    box(0,.47,.08,1.02,.77,.055,'#9baa91');
  } else if(id==='window') {
    // Window lies against the west wall; planes have real thickness and a sill.
    box(0,1.62,0,.08,1.5,1.55,'#c4b795','wood');
    box(.05,1.62,0,.035,1.34,1.36,'#b3d0d2','glass');
    box(.08,1.62,0,.06,1.4,.045,'#eee5d1');box(.08,1.62,0,.06,.05,1.4,'#eee5d1');
    box(.08,.88,0,.22,.07,1.7,'#eee5d1');
    if(!repaired) {box(.105,1.94,.31,.012,.51,.53,'#394c4b');for(let i=0;i<4;i++)box(.115,1.72+i*.11,.3,.018,.035,.55,'#dce4d9','plain',.1*i);}
    for(const dz of [-.86,.86]) box(.12,1.65,dz,.12,1.68,.2,'#b7ad98','fabric');
  } else if(id==='cabinet') {
    box(0,.5,.5,1.02,.77,.06,'#a4b195','plain',repaired?0:.19);
    box(.35,.68,.55,.15,.035,.04,'#bba47c','metal');
    if(!repaired) box(-.49,.5,.48,.035,.7,.025,'#424b39');
  } else if(id==='light') {
    cylinder(0,.05,0,.45,.08,.45,'#57594b','metal');cylinder(0,.83,0,.035,1.55,.035,'#ad9671','metal');
    cylinder(0,1.66,0,.57,.42,.57,repaired?'#f7dfab':'#a69a80',repaired?'glow':'fabric');
    if(repaired) cylinder(0,1.44,0,.37,.025,.37,'#ffe7a4','glow');
  }
}
