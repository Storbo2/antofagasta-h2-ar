/* Original low-poly scene. One plant component is shared by AR and the 3D viewer. */
(() => {
  const T = AFRAME.THREE;
  const C = { sand:0x9b8267, edge:0x3d6170, dark:0x0d2632, steel:0xc5d5d5, cyan:0x57e6dc, green:0x8debbb, blue:0x1f91b4, orange:0xffb957, white:0xf4f9f4, road:0x314b54 };
  const info = {
    solar:['01 / ENERGÍA','Generación solar','Los paneles transforman la radiación solar de Antofagasta en electricidad renovable.'],
    grid:['02 / DISTRIBUCIÓN','Red eléctrica','La electricidad atiende primero la demanda. Solo la energía disponible bajo las reglas simuladas alimenta la electrólisis.'],
    electro:['03 / CONVERSIÓN','Electrolizador','Utiliza electricidad renovable y agua tratada para separar el hidrógeno del oxígeno mediante electrólisis.'],
    tank:['04 / RESERVA','Almacenamiento H₂','Conserva el hidrógeno producido para utilizarlo más tarde. El almacenamiento requiere infraestructura y controles especializados.'],
    station:['05 / ABASTECIMIENTO','Hidrogenera','La estación recibe hidrógeno desde el almacenamiento y permite abastecer vehículos compatibles.'],
    truck:['06 / MOVILIDAD','Transporte pesado','El hidrógeno puede estudiarse para camiones y buses de rutas extensas, donde la electrificación mediante baterías puede ser más compleja.'],
    smart:['07 / SMART CITY','Gestión energética','Reglas simuladas combinan generación solar, demanda eléctrica, nivel de H₂ y demanda de transporte para decidir cuándo producir o abastecer.']
  };
  const mat = (color, emissive=0x000000) => new T.MeshStandardMaterial({color,roughness:.55,metalness:.15,emissive,emissiveIntensity:.32});
  const M = Object.fromEntries(Object.entries(C).map(([k,v])=>[k,mat(v)]));
  const glow = (c) => new T.MeshBasicMaterial({color:c});
  function box(parent,w,h,d,x,y,z,m){ const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o; }
  function cyl(parent,r,h,x,y,z,m,n=12){ const o=new T.Mesh(new T.CylinderGeometry(r,r,h,n),m);o.position.set(x,y,z);parent.add(o);return o; }
  function sphere(parent,r,x,y,z,m){const o=new T.Mesh(new T.SphereGeometry(r,12,8),m);o.position.set(x,y,z);parent.add(o);return o;}
  function line(parent,points,color,r=.003){for(let i=1;i<points.length;i++){const a=new T.Vector3(...points[i-1]),b=new T.Vector3(...points[i]);const d=new T.Vector3().subVectors(b,a);const mesh=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),6),glow(color));mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());parent.add(mesh);}}
  function label(parent,text,x,y,z,accent=C.white){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(8,27,38,.88)';ctx.fillRect(4,4,504,88);ctx.strokeStyle='#4ba9ab';ctx.lineWidth=3;ctx.strokeRect(4,4,504,88);ctx.fillStyle='#'+accent.toString(16).padStart(6,'0');ctx.font='bold 37px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,50);const tex=new T.CanvasTexture(canvas);const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(.28,.052,1);parent.add(sprite);return sprite;}
  function hit(parent,id,x,z,w,d){const mesh=box(parent,w,.17,d,x,.10,z,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));mesh.userData.infoId=id;return mesh;}
  AFRAME.registerComponent('plant-model',{
    init(){this.root=new T.Group();this.el.setObject3D('plant',this.root);this.pickables=[];this.packets=[];this.scenario='normal';this.build();window.plantModel=this;},
    build(){const g=this.root;
      box(g,1.10,.035,.75,0,-.025,0,M.edge);box(g,1.08,.012,.73,0,-.002,0,M.sand);
      // Traces of the Atacama terrain and access road.
      for(let i=0;i<28;i++){const x=-.51+((i*37)%101)/100*1.02,z=-.34+((i*23)%79)/79*.68;box(g,.012,.002,.005,x,.006,z,i%3?M.steel:M.orange);}
      box(g,1.04,.003,.115,0,.007,.245,M.road);for(let x=-.46;x<.5;x+=.11)box(g,.055,.002,.003,x,.010,.245,M.orange);
      // Solar array, with individual cells and supports.
      for(let row=0;row<2;row++)for(let col=0;col<3;col++){const x=-.46+col*.11,z=-.255+row*.12;box(g,.092,.009,.073,x,.075,z,M.blue);box(g,.088,.002,.003,x,.081,z,M.cyan);box(g,.003,.002,.068,x,.081,z,M.cyan);box(g,.004,.055,.004,x,.040,z,M.steel);}
      sphere(g,.055,-.44,.28,-.30,M.orange);for(let a=0;a<8;a++){const q=a*Math.PI/4;line(g,[[-.44+Math.cos(q)*.074,.28+Math.sin(q)*.074,-.30],[-.44+Math.cos(q)*.095,.28+Math.sin(q)*.095,-.30]],C.orange,.002);}
      label(g,'GENERACIÓN SOLAR',-.34,.23,-.10,C.orange);
      // A small grid substation.
      box(g,.12,.035,.13,-.075,.03,-.18,M.dark);for(let i=0;i<3;i++){cyl(g,.012,.10,-.115+i*.04,.09,-.18,M.steel,8);sphere(g,.014,-.115+i*.04,.15,-.18,M.cyan);}line(g,[[-.29,.08,-.19],[-.16,.13,-.19],[-.115,.13,-.19]],C.orange,.0025);label(g,'RED ELÉCTRICA',-.075,.22,-.18,C.cyan);
      // Electrolyser with vents, pipework and glowing chamber.
      box(g,.20,.15,.16,.15,.085,-.18,M.steel);box(g,.19,.022,.17,.15,.17,-.18,M.dark);box(g,.09,.085,.006,.15,.10,-.096,M.cyan);for(let i=0;i<3;i++)box(g,.02,.045,.005,.09+i*.06,.10,-.092,M.dark);cyl(g,.017,.08,.21,.215,-.21,M.steel,8);label(g,'ELECTROLIZADOR',.15,.27,-.18,C.green);
      // H2 cylindrical tanks.
      for(let x of [.36,.45]){cyl(g,.045,.17,x,.105,-.18,M.steel,12);cyl(g,.046,.012,x,.195,-.18,M.cyan,12);cyl(g,.048,.012,x,.017,-.18,M.dark,12);box(g,.07,.011,.012,x,.10,-.131,M.blue);}label(g,'ALMACÉN H₂',.40,.265,-.18,C.green);
      // Smart energy controller, linked to sensor points.
      box(g,.13,.07,.11,-.20,.045,.075,M.dark);box(g,.085,.038,.004,-.20,.06,.018,M.cyan);sphere(g,.014,-.20,.15,.075,M.green);line(g,[[-.20,.09,.075],[-.20,.14,.075]],C.green,.003);label(g,'GESTIÓN SMART',-.20,.205,.075,C.cyan);
      // Hydrogen station canopy and dispenser.
      box(g,.19,.012,.14,.14,.17,.13,M.white);for(let x of [.065,.215])box(g,.009,.155,.009,x,.09,.08,M.steel);box(g,.055,.09,.04,.09,.055,.17,M.blue);box(g,.035,.026,.006,.09,.077,.147,M.cyan);line(g,[[.115,.09,.17],[.15,.08,.20],[.18,.04,.20]],C.green,.002);label(g,'HIDROGENERA',.14,.235,.13,C.green);
      // Heavy truck, stylized fuel-cell logistics vehicle.
      box(g,.19,.085,.105,.36,.065,.22,M.steel);box(g,.09,.075,.108,.46,.069,.22,M.cyan);box(g,.055,.028,.003,.48,.087,.164,M.dark);box(g,.09,.018,.11,.36,.106,.22,M.green);for(let x of [.31,.42,.48])for(let z of [.16,.28]){const wheel=new T.Mesh(new T.CylinderGeometry(.019,.019,.009,10),M.dark);wheel.rotation.x=Math.PI/2;wheel.position.set(x,.025,z);g.add(wheel);}label(g,'CAMIÓN H₂',.40,.175,.32,C.white);
      const points={solar:[-.30,.06,-.18],grid:[-.08,.08,-.18],electro:[.15,.08,-.18],tank:[.39,.10,-.18],station:[.14,.04,.13],truck:[.38,.07,.22]};
      const paths=[['solar','grid'],['grid','electro'],['electro','tank'],['tank','station'],['station','truck']];
      this.paths=paths.map(([a,b],i)=>{const from=new T.Vector3(...points[a]),to=new T.Vector3(...points[b]);if(i===3){const mid=new T.Vector3(.40,.045,.075);line(g,[from.toArray(),mid.toArray(),to.toArray()],i<2?C.orange:C.green,.002);return [from,mid,to];}line(g,[from.toArray(),to.toArray()],i<2?C.orange:C.green,.002);return [from,to];});
      for(let i=0;i<this.paths.length;i++)for(let j=0;j<3;j++){const mesh=sphere(g,.008,0,0,0,glow(i<2?C.orange:C.green));this.packets.push({mesh,path:i,offset:j/3});}
      for(const [id,x,z,w,d] of [['solar',-.35,-.20,.34,.25],['grid',-.075,-.18,.14,.16],['electro',.15,-.18,.21,.17],['tank',.40,-.18,.19,.20],['station',.14,.13,.20,.18],['truck',.40,.22,.20,.16],['smart',-.20,.075,.15,.13]])this.pickables.push(hit(g,id,x,z,w,d));
      g.add(new T.HemisphereLight(0xffffff,0x6a7a79,1.2));const sun=new T.DirectionalLight(0xffffff,1.0);sun.position.set(-.4,.8,.5);g.add(sun);
    },
    setScenario(s){this.scenario=s;this.started=performance.now();},
    tick(){const configs={normal:[.3,.22,.12,.05,.03],surplus:[1,1,1,.25,.12],use:[.1,.05,.06,1,1]};const flow=configs[this.scenario]||configs.normal;const elapsed=Math.max(0,(performance.now()-(this.started||performance.now()))/1000);this.packets.forEach(p=>{const level=flow[p.path];const phase=(elapsed*level*.55+p.offset)%1;const active=level>.08&& (this.scenario==='normal'||Math.floor(elapsed*1.4)%5>=p.path || elapsed>4);p.mesh.visible=active;const vertices=this.paths[p.path];const scaled=phase*(vertices.length-1);const k=Math.min(Math.floor(scaled),vertices.length-2);p.mesh.position.copy(vertices[k]).lerp(vertices[k+1],scaled-k);p.mesh.scale.setScalar(this.scenario==='surplus'&&p.path<3?1.35:1);});},
    remove(){this.el.removeObject3D('plant');if(window.plantModel===this)window.plantModel=null;}
  });
  AFRAME.registerComponent('orbit-camera',{
    init(){this.yaw=0;this.pitch=.55;this.distance=window.innerWidth<600?1.9:1.25;this.drag=false;this.last=null;this.pinch=0;const canvas=()=>this.el.sceneEl.canvas;
      this.onDown=e=>{if(e.target!==canvas())return;this.drag=true;this.last=[e.clientX,e.clientY];};
      this.onMove=e=>{if(!this.drag)return;this.yaw-=(e.clientX-this.last[0])*.006;this.pitch=Math.max(.22,Math.min(1.35,this.pitch+(e.clientY-this.last[1])*.005));this.last=[e.clientX,e.clientY];};
      this.onUp=()=>{this.drag=false;};
      this.onWheel=e=>{e.preventDefault();this.distance=Math.max(.8,Math.min(3,this.distance+e.deltaY*.002));};
      this.onTouch=e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(this.pinch)this.distance=Math.max(.8,Math.min(3,this.distance*this.pinch/d));this.pinch=d;}else this.pinch=0;};
      window.addEventListener('pointerdown',this.onDown);window.addEventListener('pointermove',this.onMove);window.addEventListener('pointerup',this.onUp);window.addEventListener('wheel',this.onWheel,{passive:false});window.addEventListener('touchmove',this.onTouch,{passive:true});
    },
    tick(){const p=this.el.object3D.position;p.set(Math.sin(this.yaw)*Math.cos(this.pitch)*this.distance,Math.sin(this.pitch)*this.distance,Math.cos(this.yaw)*Math.cos(this.pitch)*this.distance);this.el.object3D.lookAt(p.x*2,p.y*2-.045,p.z*2);},
    remove(){window.removeEventListener('pointerdown',this.onDown);window.removeEventListener('pointermove',this.onMove);window.removeEventListener('pointerup',this.onUp);window.removeEventListener('wheel',this.onWheel);window.removeEventListener('touchmove',this.onTouch);}
  });
  window.plantInfo=info;
})();
