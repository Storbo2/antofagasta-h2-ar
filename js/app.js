(() => {
  const ar=document.body.classList.contains('ar-mode');
  const scenarios={
    normal:{title:'Día normal',desc:'La red eléctrica tiene prioridad. Una pequeña fracción de energía disponible alimenta el electrolizador.',solar:'9 MW',demand:'8 MW',available:'1 MW',production:'18 kg/h',stored:'540 kg',vehicles:'6',rule:'Margen solar reducido → producción H₂ moderada'},
    surplus:{title:'Excedente solar',desc:'La alta generación permite enviar más electricidad renovable al electrolizador y almacenar el H₂ producido.',solar:'12 MW',demand:'8 MW',available:'4 MW',production:'75 kg/h',stored:'620 kg',vehicles:'8',rule:'Generación > demanda + margen → producir H₂'},
    use:{title:'Uso del H₂',desc:'El hidrógeno almacenado se envía a la hidrogenera para abastecer un camión de logística pesada.',solar:'3 MW',demand:'7 MW',available:'0 MW',production:'0 kg/h',stored:'480 kg',vehicles:'5',rule:'Reserva > mínimo + demanda de transporte → abastecer'}
  };
  let current='normal';
  function showScenario(key){current=key;const s=scenarios[key];document.getElementById('scenario-title').textContent=s.title;document.getElementById('scenario-desc').textContent=s.desc;const entries=[['Generación solar',s.solar],['Demanda eléctrica',s.demand],['Disponible para H₂',s.available],['Producción H₂',s.production],['H₂ almacenado',s.stored],['Vehículos posibles',s.vehicles]];document.getElementById('metrics').innerHTML=entries.map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('')+`<p class="rule">${s.rule}</p>`;document.querySelectorAll('[data-scenario]').forEach(b=>{b.classList.toggle('active',b.dataset.scenario===key);b.setAttribute('aria-pressed',b.dataset.scenario===key)});window.plantModel?.setScenario(key);}
  document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>showScenario(b.dataset.scenario)));
  const infoCard=document.getElementById('info-card');document.getElementById('close-info').addEventListener('click',()=>infoCard.classList.add('hidden'));
  const scene=document.getElementById('scene');
  scene.addEventListener('loaded',()=>{
    showScenario(current);
    const canvas=scene.canvas, ray=new AFRAME.THREE.Raycaster(),pointer=new AFRAME.THREE.Vector2();let down=null;
    canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
    canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>12)return;down=null;const plant=window.plantModel;if(!plant)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));ray.setFromCamera(pointer,scene.camera);const hits=ray.intersectObjects(plant.pickables,false);if(!hits.length)return;const i=window.plantInfo[hits[0].object.userData.infoId];if(!i)return;document.getElementById('info-tag').textContent=i[0];document.getElementById('info-title').textContent=i[1];document.getElementById('info-text').textContent=i[2];infoCard.classList.remove('hidden');});
  });
  if(ar){
    const start=document.getElementById('start-ar'),overlay=document.getElementById('start-overlay'),scan=document.getElementById('scan-banner'),status=document.getElementById('status-banner'),target=document.getElementById('target');
    const message=(txt)=>{status.textContent=txt;status.classList.remove('hidden')};
    target.addEventListener('targetFound',()=>{scan.classList.add('hidden');message('Marcador reconocido · toca un componente para conocerlo');setTimeout(()=>status.classList.add('hidden'),4000)});
    target.addEventListener('targetLost',()=>{scan.classList.remove('hidden');status.classList.add('hidden')});
    start.addEventListener('click',async()=>{start.disabled=true;start.textContent='Iniciando cámara…';try{await scene.systems['mindar-image-system'].start();overlay.classList.add('hidden');scan.classList.remove('hidden');}catch(e){console.error(e);message('No se pudo iniciar la cámara. Revisa el permiso o abre el modelo 3D.');start.disabled=false;start.textContent='Reintentar cámara';}});
  }
  showScenario('normal');
})();
