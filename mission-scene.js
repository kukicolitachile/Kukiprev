// The artwork is conceptual. These overlays explain information, never equipment motion.
export const geometry={width:941,height:1672,cropTop:280,cropHeight:1120};
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHTML;
const y=value=>(value*geometry.height/100-geometry.cropTop)/geometry.cropHeight*100;
export const zoneStyle=z=>`left:${z.rect[0]}%;top:${y(z.rect[1])}%;width:${z.rect[2]}%;height:${z.rect[3]*geometry.height/geometry.cropHeight}%`;
const pinStyle=(x,originalY)=>`left:${x}%;top:${y(originalY)}%`;
export function artwork(){return `<svg class="scene-art" viewBox="0 280 941 1120" role="img" aria-label="Ilustración hipotética: persona junto a correa con estuches acumulados y polea en el extremo."><image href="./assets/escenas/esc-01-base.webp" width="941" height="1672"/></svg>`;}
export function inquiries(content){return [
 {id:'method',name:'Método',x:18,y:41,question:'¿Qué método está definido para retirar los estuches?',detail:'El método de esta tarea no está definido en el ejemplo.',responsible:content.validacion.find(v=>v.id==='metodo').responsable},
 {id:'condition',name:'Condición',x:80,y:70,question:'¿Qué condiciones y controles deben verificarse antes de esa tarea?',detail:'La imagen no permite confirmar las condiciones necesarias.',responsible:content.validacion.find(v=>v.id==='controles').responsable},
 {id:'roles',name:'Responsables',x:78,y:39,question:'¿A quién corresponde aclarar la tarea y confirmar la respuesta?',detail:'Las funciones y la respuesta prevista deben definirse en el proceso real.',responsible:content.validacion.find(v=>v.id==='roles').responsable}
];}
const actions=[{id:'alt-a',name:'Comunicar',x:78,y:40},{id:'alt-b',name:'Retirar',x:17,y:39},{id:'alt-c',name:'Ajustar',x:67,y:68}];
function guide(text,mood='atento'){return `<aside class="scene-companion"><img src="./assets/kuky/${mood}.png" alt="Kuky" width="90" height="120"><p>${e(text)}</p></aside>`;}
function listDialog(items,kind){return `<dialog id="scene-options" class="scene-options"><h2>Elementos y acciones</h2><p>Alternativa a tocar la imagen.</p><div class="choices">${items.map(item=>`<button class="choice" data-${kind}="${e(item.id)}">${e(item.text)}</button>`).join('')}</div><button class="back" data-close-options>Volver a la escena</button></dialog>`;}
export function missionBoard(content,state,message=''){
 const j=state.journey,stage=j.stage,zones=content.practica.zonas,focus=content.interaccion.focos[j.focus];
 j.explored??=[];j.discovered??=stage==='discover'?[0]:[];j.inquiries??=[];
 let pins='',marks='',caption='',primary='',extras='',cue='',mood='atento',explanation='',dialog='',status='';
 const button=(id,text,disabled=false)=>`<button class="primary" id="${id}" ${disabled?'disabled':''}>${text}<span aria-hidden="true"> →</span></button>`;
 if(stage==='observe'){
  caption='Ejemplo hipotético: se acumulan estuches; se describe movimiento irregular.';
  cue='Observa los materiales y la posición de la persona.';
  primary=button('observe-next','Explorar la escena');explanation=content.rol.descripcion;extras='<button class="text-button" data-explain="role">Tu rol en el ejemplo</button>';
 }
 if(stage==='explore'){
  pins=zones.map(z=>`<button class="zone ${j.explored.includes(z.id)?'explored-zone':''}" data-zone="${e(z.id)}" aria-label="${e(z.descripcion)}" style="${zoneStyle(z)}"></button>`).join('');
  if(j.hint)marks=`<div class="focus-highlight" style="${zoneStyle(zones[0])}" aria-hidden="true"></div>`;
  caption=message||(state.practice.found?'Este encuentro puede captar una mano si accede al movimiento.':'Toca un elemento de la escena para explorar.');
  cue=state.practice.found?'Reconociste una exposición posible.':'Observa antes de decidir.';
  primary=button('explore-next','Decidir',!state.practice.found);
  status=state.practice.found?'Zona reconocida. Puedes continuar.':'Para avanzar, localiza la zona de exposición del ejemplo.';
  extras='<button class="text-button" id="hint">Pedir pista</button>';
  dialog=listDialog(zones.map(z=>({id:z.id,text:z.descripcion})),'zone');
 }
 if(stage==='decide'){
  pins=actions.map(a=>`<button class="context-action ${j.pending===a.id?'selected':''}" data-decision="${a.id}" aria-label="${e(content.practica.alternativas.find(c=>c.id===a.id).texto)}" aria-pressed="${j.pending===a.id}" style="${pinStyle(a.x,a.y)}"><span class="action-symbol" aria-hidden="true">${a.id==='alt-a'?'◌':a.id==='alt-b'?'↗':'↔'}</span><span>${a.name}</span></button>`).join('');
  caption=j.pending?content.practica.alternativas.find(a=>a.id===j.pending).texto:'Elige una acción junto al elemento de la escena.';
  cue=content.interaccion.rol_breve;
  status=j.pending?'Selección lista para confirmar.':'Elige una acción. Aún no está confirmada.';
  primary=button('confirm-decision','Confirmar decisión',!j.pending);
  dialog=listDialog(content.practica.alternativas.map(a=>({id:a.id,text:a.texto})),'decision');
 }
 if(stage==='discover'){
  const selected=content.practica.alternativas.find(a=>a.id===state.practice.selected),target=zones.find(z=>z.id===focus.zona),remaining=3-j.discovered.length;
  pins=content.interaccion.focos.map((f,i)=>{const z=zones.find(z=>z.id===f.zona);return `<button class="scene-discovery ${j.focus===i?'active':''} ${j.discovered.includes(i)?'visited':''}" data-focus="${i}" aria-label="${i+1}. ${e(f.titulo)}" aria-pressed="${j.focus===i}" style="${pinStyle(z.rect[0]+z.rect[2]/2,z.rect[1]+z.rect[3]/2)}">${i+1}${j.discovered.includes(i)?'<span class="visually-hidden">, explorado</span>':''}</button>`;}).join('');
  marks=`<div class="focus-highlight" style="${zoneStyle(target)}" aria-hidden="true"></div><span class="scene-relation" style="${pinStyle(74,54)}">${selected.correcta?'Aviso ≠ solución':'Exposición posible'}</span>`;
  caption=focus.texto;cue=selected.correcta?'El aviso no confirma que el peligro esté resuelto.':'Mira qué condiciones explican la exposición.';
  if(!remaining){cue='Conecta estos detalles con tu tarea.';mood='motivador';}
  status=remaining?`Explora ${remaining} ${remaining===1?'detalle más':'detalles más'} en la escena.`:'Tres relaciones exploradas. Puedes continuar.';
  primary=button('discover-next','Aplicar a tu trabajo',Boolean(remaining));
  extras='<button class="text-button" data-explain="decision">¿Por qué?</button>';
  explanation=selected.feedback+' '+content.estudio[2].texto+' '+content.rol.limites.join(' ');
  dialog=listDialog(content.interaccion.focos.map((f,i)=>({id:i,text:`${i+1}. ${f.titulo}`})),'focus');
 }
 if(stage==='apply'){
  const items=inquiries(content),current=items.find(i=>i.id===j.inquiryFocus),prepared=j.appliedConfirmed&&j.inquiries.length>0;
  pins=items.map(i=>`<button class="context-action inquiry-action ${j.inquiries.includes(i.id)?'included':''} ${j.inquiryFocus===i.id?'selected':''}" data-inquiry="${i.id}" aria-label="${e(i.question)}" aria-pressed="${j.inquiries.includes(i.id)}" style="${pinStyle(i.x,i.y)}"><span class="action-symbol" aria-hidden="true">${j.inquiries.includes(i.id)?'✓':'?'}</span><span>${i.name}</span></button>`).join('');
  caption=prepared?'Consulta preparada: falta información para decidir con seguridad. No se ha enviado ningún aviso real.':current?`${current.question} ${j.inquiries.includes(current.id)?'Incluido en tu consulta.':'No incluido en tu consulta.'}`:'Elige qué necesitas aclarar para preparar una consulta.';
  cue=prepared?'La condición sigue pendiente de aclarar.':'El método y las responsabilidades no están definidos.';mood=prepared?'motivador':'atento';
  status=prepared?'Comparte esta consulta durante la conversación con tu relator.':j.inquiries.length?`${j.inquiries.length} ${j.inquiries.length===1?'asunto incluido':'asuntos incluidos'}. Puedes añadir otro o confirmar.`:'Incluye al menos una condición que debas aclarar.';
  primary=prepared?button('start-evaluation','Ir a la evaluación'):button('confirm-inquiry','Confirmar consulta',!j.inquiries.length);
  extras=prepared?'<button class="text-button" id="retry-apply">Revisar mi consulta</button>':current?'<button class="text-button" data-explain="inquiry">Quién debe aclararlo</button>':'';
  explanation=current?`${current.detail} ${current.responsible}`:'';
  if(prepared)marks=`<span class="scene-relation" style="${pinStyle(58,57)}">Por aclarar</span>`;
  dialog=listDialog(items.map(i=>({id:i.id,text:i.question})),'inquiry');
 }
 return `<div class="scene-wrap game-board" data-moment="${stage}"><div class="scene">${artwork()}${marks}${pins}</div><div class="scene-utilities"><button class="enlarge" id="enlarge" aria-label="Ampliar ilustración completa">⤢</button>${dialog?'<button class="scene-list-toggle" data-open-options aria-label="Abrir lista accesible de elementos y acciones">☷</button>':''}</div>${guide(cue,mood)}<div class="scene-dock"><p id="${stage==='explore'?'explore-status':stage==='discover'?'focus-caption':'scene-caption'}" class="scene-caption" role="status" tabindex="-1">${e(caption)}</p><div class="dock-meta">${extras}<span class="action-requirement">${e(status)}</span></div>${primary}</div>${dialog}<dialog id="scene-explanation" class="scene-explanation"><h2>${stage==='observe'?'Tu rol en el ejemplo':'Para comprender la tarea'}</h2><p>${e(explanation)}</p><button class="primary" data-close-explanation>Volver a la escena</button></dialog></div>`;
}
