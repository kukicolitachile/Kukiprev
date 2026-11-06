import {initVersion} from './version-client.js';
import {initExperience,feedback,cueKuky,clearFeedback} from './experience.js';
import { KEY, fresh, shuffle, validState, evaluateAnswers } from './model.js';
import { sceneMarkup } from './scenes.js';
const app = document.querySelector('#app');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content, state = fresh(), storageAvailable = true, message = '';
const stages = ['observe','explore','decide','discover','apply'];
const names = ['Observa','Explora','Decide','Descubre','Aplica'];
function journey() {
  return state.journey ??= {stage:state.practice.selected?'discover':state.practice.found?'decide':'observe',pending:null,hint:false,focus:0,applied:null,appliedConfirmed:false,studyIndex:0};
}
function save() { try {localStorage.setItem(KEY, JSON.stringify(state));} catch {storageAvailable=false;} }
function navigate(view) {clearFeedback();state.view=view;message='';save();render();app.focus();window.scrollTo(0,0);}
function phase(stage) {
 journey().stage=stage;navigate('practice');
 const cues={explore:['explore','Explora a tu ritmo.'],decide:['reflect',content.interaccion.rol_breve],discover:['reflect','Miremos qué explica la exposición.'],};
 if(cues[stage])cueKuky(...cues[stage]);
 feedback(stage==='discover'?'discover':'complete',stage==='discover'?'Nueva información':`${names[stages.indexOf(stage)-1]} completado`,names[stages.indexOf(stage)]);
}
function header() {
 return `<div class="compact-top">${state.view==='home'?'':'<button class="text-button" data-go="home">← Inicio</button>'}<span class="draft-pill">Borrador</span><button class="text-button" data-go="review">Revisión técnica</button></div>`;
}
function why(text) {return `<details class="why"><summary>¿Por qué?</summary><p>${escape(text)}</p></details>`;}
function kuky(text) {return `<aside class="kuky-cue"><img src="./assets/kuky.png" alt="Kuky" width="38" height="38"><span>${escape(text)}</span></aside>`;}
const welcomeSeen = new Set();
const welcomeElements = [
 {id:'context',name:'El entorno',x:16,y:37,text:'El entorno también aporta información sobre la tarea.'},
 {id:'materials',name:'Los estuches',x:15,y:59,text:'Los materiales ayudan a entender qué ocurre en la escena.'},
 {id:'person',name:'La persona',x:79,y:56,text:'Observa su posición y su relación con la tarea.'}
];
function homeView() {
 const complete=welcomeSeen.size===welcomeElements.length;
 return `<section class="welcome-home" aria-labelledby="welcome-title">
  <div class="welcome-heading"><h1 id="welcome-title">Manos que cuidan</h1></div>
  <div class="welcome-invitation"><img src="./assets/kuky/${complete?'motivador':'atento'}.png" alt="Kuky" width="50" height="60"><p id="welcome-invite">${complete?'Ya sabes explorar. ¿Entramos a la misión?':'¿Qué ves fuera de lugar? Explora la escena.'}</p></div>
  <div class="welcome-stage"><div class="welcome-canvas" role="group" aria-label="Exploración de bienvenida sin puntaje">
   <svg viewBox="0 0 941 1100" class="welcome-art" aria-hidden="true"><image href="./assets/escenas/esc-01-base.webp" width="941" height="1672"/></svg>
   ${welcomeElements.map((el,i)=>`<button class="welcome-spot ${welcomeSeen.has(el.id)?'visited':''}" data-welcome="${el.id}" style="left:${el.x}%;top:${el.y}%" aria-label="Explorar: ${el.name}" aria-pressed="${welcomeSeen.has(el.id)}"><span aria-hidden="true">${welcomeSeen.has(el.id)?'✓':'+'}</span></button>`).join('')}
   ${complete?'':`<span class="touch-example" aria-hidden="true">☝ Toca un + para probar</span>`}
  </div><span class="welcome-layer" aria-hidden="true"></span></div>
  <p class="welcome-reply" id="welcome-reply" role="status">${complete?'Exploración completa, sin puntaje. Puedes continuar.':'Toca un + o usa los controles accesibles.'}</p>
  <div class="welcome-actions"><button class="primary ${complete?'ready':''}" id="welcome-start">Comenzar misión <span aria-hidden="true">→</span></button>
   <div class="welcome-secondary"><button class="text-button" data-go="join">Unirme a una capacitación</button><button class="text-button" data-go="study">Estudiar</button><details class="welcome-accessible"><summary>Explorar con teclado o lista</summary>${welcomeElements.map(el=>`<button class="text-button" data-welcome="${el.id}" aria-pressed="${welcomeSeen.has(el.id)}">${el.name}</button>`).join('')}</details></div>
  </div>
 </section>`;
}
function scene({active=false, highlight=false, discover=false}={}) {
 const j=journey();j.explored??=[];j.discovered??=[];
 const focus=content.interaccion.focos[j.focus];
 const target=content.practica.zonas.find(z=>z.id===focus.zona);
 // A camera crop of the same illustration. All coordinates remain tied to the original art.
 const rect=z=>`left:${z.rect[0]}%;top:${(z.rect[1]*16.72-280)/11.2}%;width:${z.rect[2]}%;height:${z.rect[3]*16.72/11.2}%`;
 return `<div class="scene-wrap"><div class="scene">
 <svg class="scene-art" viewBox="0 280 941 1120" role="img" aria-label="Ilustración hipotética: persona junto a correa con estuches acumulados y polea en el extremo." xmlns="http://www.w3.org/2000/svg"><image href="./assets/escenas/esc-01-base.webp" width="941" height="1672"/></svg>
 ${active?[...content.practica.zonas].sort((a,b)=>a.rect[0]-b.rect[0]).map(z=>`<button class="zone ${j.explored.includes(z.id)?'explored-zone':''}" data-zone="${escape(z.id)}" aria-label="${escape(z.descripcion)}" style="${rect(z)}"></button>`).join(''):''}
 ${highlight?`<div class="focus-highlight" aria-hidden="true" style="${rect(target)}"></div>`:''}
 ${discover?content.interaccion.focos.map((f,i)=>{const z=content.practica.zonas.find(z=>z.id===f.zona);return `<button class="scene-discovery ${j.focus===i?'active':''} ${j.discovered.includes(i)?'visited':''}" data-focus="${i}" aria-label="${i+1}. ${escape(f.titulo)}" aria-pressed="${j.focus===i}" style="left:${Math.min(90,z.rect[0]+z.rect[2]/2)}%;top:${(z.rect[1]*16.72-280+z.rect[3]*8.36)/11.2}%">${i+1}${j.discovered.includes(i)?'<span class="visually-hidden">, explorado</span>':''}</button>`;}).join(''):''}
 </div><button class="enlarge" id="enlarge" aria-label="Ampliar ilustración completa">⤢</button></div>`;
}
function companion(text,mood='atento') {
 return `<div class="scene-companion"><img src="./assets/kuky/${mood}.png" alt="Kuky" width="42" height="42"><p id="scene-message" role="status">${escape(text)}</p></div>`;
}
function progress(index) {
 return `<div class="stage-progress" aria-label="${names[index]}, momento ${index+1} de 5">${names.map((n,i)=>`<span class="${i<index?'done':i===index?'current':''}" ${i===index?'aria-current="step"':''}><b>${i<index?'✓':i+1}</b><small>${n}</small></span>`).join('')}</div>`;
}
function choices(items,kind,selected,locked=false) {
 return `<div class="choices">${items.map(a=>`<button class="choice ${selected===a.id?'selected':''}" data-${kind}="${escape(a.id)}" aria-pressed="${selected===a.id}" ${locked?'disabled':''}>${escape(a.texto)}</button>`).join('')}</div>`;
}
function studyView() {
 const j=journey(), original=content.estudio[j.studyIndex];
 const lesson=j.studyIndex===1 && state.practice.attempts===0 ? {titulo:'Observa antes de buscar',texto:'Distingue qué ocurre en la tarea y qué información falta. La zona de exposición se explora durante la práctica, sin indicarla de antemano.'} : original;
 return `${header()}<section class="mission-frame"><div class="step-title"><span>Estudiar · ${j.studyIndex+1}/4</span><h1>${escape(lesson.titulo)}</h1></div>
 ${scene()}<div class="activity-panel"><p>${escape(lesson.texto.split('. ')[0].replace(/\.$/,''))}.</p>
 ${why(lesson.texto+' '+(j.studyIndex===0?content.rol.descripcion:''))}
 <div class="action-row">${j.studyIndex>0?'<button class="text-button" id="study-back">← Anterior</button>':''}<button class="primary" id="study-next">${j.studyIndex<3?'Siguiente observación':'Practicar este caso'} →</button></div></div></section>`;
}
function practiceView() {
 const j=journey(),stage=j.stage,index=stages.indexOf(stage),selected=content.practica.alternativas.find(a=>a.id===state.practice.selected);
 j.discovered??=stage==='discover'?[0]:[];
 const titles={observe:'Observa la tarea antes de actuar.',explore:content.interaccion.explora,decide:content.interaccion.decide,discover:'Toca los detalles. Conecta lo que ocurre.',apply:content.interaccion.aplica.consigna};
 let panel='',cue='',mood='atento';
 if(stage==='observe') {
  cue='Observa los materiales y la posición de la persona.';
  panel=`<p class="context-line">Ejemplo hipotético: se acumulan estuches; se describe movimiento irregular.</p><details><summary>Tu rol en el ejemplo</summary><p>${escape(content.rol.descripcion)}</p></details><button class="primary" id="observe-next">Explorar la escena →</button>`;
 }
 if(stage==='explore') {
  cue=state.practice.found?'Reconociste una posible exposición. Ahora decide.':'Toca la escena. Cada detalle cuenta.';
  panel=`<p id="explore-status" role="status">${escape(message || (state.practice.found?'Zona reconocida. Continúa con una decisión.':'Busca el encuentro que podría captar una mano.'))}</p>
  <div class="explore-tools"><details class="accessible-elements"><summary>Lista accesible</summary>${choices(content.practica.zonas.map(z=>({id:z.id,texto:z.descripcion})),'zone',null)}</details><button class="text-button" id="hint">Pedir pista</button></div>
  <p class="action-requirement">${state.practice.found?'Puedes continuar.':'Para avanzar, localiza la zona de exposición del ejemplo.'}</p><button class="primary" id="explore-next" ${state.practice.found?'':'disabled'}>Decidir →</button>`;
 }
 if(stage==='decide') {
  cue='Tu rol: reconocer y comunicar; no ajustar ni desatascar.';
  const order=state.practice.order.length?state.practice.order:content.practica.alternativas.map(a=>a.id);
  panel=`${choices(order.map(id=>content.practica.alternativas.find(a=>a.id===id)),'decision',j.pending)}<p class="action-requirement">${j.pending?'Selección lista para confirmar.':'Selecciona una acción desde tu rol.'}</p><button class="primary" id="confirm-decision" ${j.pending?'':'disabled'}>Confirmar decisión →</button>`;
 }
 if(stage==='discover') {
  const focus=content.interaccion.focos[j.focus],remaining=3-j.discovered.length;
  cue=remaining?'Lo que pasó se entiende mirando la tarea.':'Conecta estos detalles con tu tarea.';mood=remaining?'atento':'motivador';
  panel=`<div class="discovery-caption" aria-live="polite"><span class="detail-index">${j.focus+1} / 3</span><p id="focus-caption">${escape(focus.texto)}</p></div>
  <details class="accessible-elements"><summary>Detalles con teclado o lista</summary><div class="focus-controls">${content.interaccion.focos.map((f,i)=>`<button class="focus-tab" data-focus="${i}" aria-pressed="${j.focus===i}">${i+1}. ${escape(f.titulo)}${j.discovered.includes(i)?' ✓':''}</button>`).join('')}</div></details>
  ${why(selected.feedback+' '+content.estudio[2].texto+' '+content.rol.limites.join(' '))}
  <p class="action-requirement" id="discover-requirement">${remaining?`Explora ${remaining} ${remaining===1?'detalle más':'detalles más'} sobre la escena para continuar.`:'Tres relaciones exploradas. Llévalas a tu trabajo.'}</p>
  <button class="primary" id="discover-next" ${remaining?'disabled':''}>Aplicar a tu trabajo →</button>`;
 }
 if(stage==='apply') {
  const task=content.interaccion.aplica,answer=task.alternativas.find(a=>a.id===j.applied);
  cue=j.appliedConfirmed?'¿Quién debe aclararlo en tu proceso?':task.contexto;mood=j.appliedConfirmed?'motivador':'atento';
  panel=j.appliedConfirmed?`<p class="feedback" role="status">${escape(answer.feedback)}</p>${why(content.practica.alternativas[0].feedback)}<button class="text-button" id="retry-apply">Revisar otra respuesta</button><button class="primary" id="start-evaluation">Ir a la evaluación →</button>`:`${choices(task.alternativas,'apply',j.applied)}<p class="action-requirement">${j.applied?'Selección lista para confirmar.':'Elige qué necesitas aclarar antes de actuar.'}</p><button class="primary" id="confirm-apply" ${j.applied?'':'disabled'}>Confirmar respuesta →</button>`;
 }
 return `${header()}<section class="mission-frame" data-stage="${stage}"><div class="step-title">${progress(index)}<h1>${escape(titles[stage])}</h1></div><div class="scene-column">${scene({active:stage==='explore',highlight:stage==='discover'||(stage==='explore'&&j.hint),discover:stage==='discover'})}${companion(cue,mood)}</div><div class="activity-panel">${panel}</div></section>`;
}
function evaluationView() {
 const q=content.evaluacion[state.evaluation.current],answer=state.evaluation.answers[q.id];
 const order=state.evaluation.orders[q.id]||q.alternativas.map(a=>a.id);
 return `<div class="compact-top"><button class="text-button" id="exit-evaluation">Salir de la evaluación</button><span class="draft-pill">Borrador</span><span>Evaluación · ${state.evaluation.current+1}/${content.evaluacion.length}</span></div>
 <section class="mission-frame evaluation"><div class="step-title"><h1>${escape(q.pregunta)}</h1></div>${scene()}<div class="activity-panel">
 ${choices(order.map(id=>q.alternativas.find(a=>a.id===id)),'evaluation',answer||evaluationPending,Boolean(answer))}
 ${answer?`<p role="status">Respuesta confirmada. Continúa para completar la evaluación.</p><button class="primary" id="evaluation-next">${state.evaluation.current===content.evaluacion.length-1?'Ver resultado':'Siguiente pregunta'} →</button>`:`<p class="action-requirement">${evaluationPending?'Selección lista para confirmar.':'Selecciona una respuesta.'}</p><button class="primary" id="evaluation-confirm" ${evaluationPending?'':'disabled'}>Confirmar respuesta →</button>`}
 </div></section>`;
}
let evaluationPending=null;
function summaryView() {
 const result=evaluateAnswers(state.evaluation.answers,content.evaluacion);
 return `${header()}<section class="compact-summary"><h1>Revisa lo que descubriste.</h1><p>${result.correct} de ${result.total} respuestas coinciden con este borrador.</p>
 <p class="fine">No acredita aprobación ni asistencia. Contenido pendiente de validación técnica.</p><section class="work-transfer"><h2>Una conversación para tu trabajo</h2><p>Abre una pregunta que puedas conversar con el relator.</p>${[['La tarea','¿Qué hace necesario aproximar las manos?'],['El método','¿Qué condiciones y medios deben estar definidos?'],['La respuesta','¿Quién confirma cómo se atendió la anomalía?']].map(([a,b])=>`<details><summary>${a}</summary><p>${b}</p></details>`).join('')}</section>
 ${content.evaluacion.map(q=>{const a=q.alternativas.find(a=>a.id===state.evaluation.answers[q.id]);return `<details><summary>${a.correcta?'✓':'↻'} ${escape(q.pregunta)}</summary><p>${escape(a.feedback)}</p><p><strong>Para revisar:</strong> ${escape(q.alternativas.find(a=>a.correcta).texto)}</p></details>`;}).join('')}
 ${kuky('¿Qué debe estar resuelto antes de una tarea parecida?')}<div class="action-row"><button class="primary" data-go="home">Volver al inicio</button><button class="back" id="retry-evaluation">Repetir evaluación</button></div></section>`;
}
function reviewView() {
  return `<div class="learning-top"><button class="back" data-go="home">← Inicio</button><span>Revisión del contenido · ${escape(content.version)}</span></div>
    <section class="review-panel"><p><a href="./recovery.html">Comprobar versión, servidor y caché</a></p><p class="eyebrow">Pendiente de validación por prevención</p><h1>Lo que todavía necesitamos conocer.</h1>
      <p class="lead">Los datos siguientes no están confirmados para el equipo real. Esta pantalla no permite aprobar el caso ni liberar una tarea.</p>
      <ul class="validation-list">${content.validacion.map(item => `<li><span class="tag">Pendiente</span><h2>${escape(item.tema)}</h2><p>${escape(item.pendiente)}</p><p><strong>Quién debe aclararlo:</strong> ${escape(item.responsable)}</p></li>`).join('')}</ul>
      <section class="notice"><h2>Referencias y condición del material</h2><p>${escape(content.fuentes.nota)}</p><p>La ilustración es genérica y el relato es hipotético. No se presenta ninguna característica del equipo de la empresa como verificada.</p></section>
      <section class="notice"><h2>Funciones que siguen siendo propuestas</h2><p>Investigación de condiciones de trabajo y seguimiento de mejoras: no implementados. También están pendientes el registro empresarial, la validación del relator y las constancias verificables.</p></section>
      <div class="action-row"><button class="primary" data-start="study">Ver la secuencia de estudio →</button><button class="back" data-go="home">Volver al inicio</button></div>
    </section>`;
}

function prepareEvaluation() {for(const q of content.evaluacion)state.evaluation.orders[q.id]??=shuffle(q.alternativas.map(a=>a.id));}
function startPractice(){journey();state.practice.order.length||(state.practice.order=shuffle(content.practica.alternativas.map(a=>a.id)));navigate('practice');if(journey().stage==='observe')cueKuky('observe','Observa qué ocurre antes de elegir.');}
function showEnlarged() {
 const modal=document.createElement('dialog');modal.className='image-dialog';
 modal.innerHTML=`<button class="back" id="close-image">Cerrar imagen</button>${sceneMarkup(0)}<p>Ilustración genérica pendiente de cotejo técnico.</p>`;
 document.body.append(modal);modal.showModal();modal.querySelector('button').onclick=()=>modal.close();modal.onclose=()=>{modal.remove();document.querySelector('#enlarge')?.focus();};
}
function exploreWelcome(id) {
  const element=welcomeElements.find(el=>el.id===id);
  const wasComplete=welcomeSeen.size===welcomeElements.length;
  welcomeSeen.add(element.id);
  document.querySelectorAll(`[data-welcome="${element.id}"]`).forEach(item=>{item.classList.add('visited');item.setAttribute('aria-pressed','true');const symbol=item.querySelector('span');if(symbol)symbol.textContent='✓';});
  document.querySelector('#welcome-reply').textContent=element.text;
  feedback('discover','Detalle explorado',element.name);
  if(welcomeSeen.size===welcomeElements.length && !wasComplete){
   document.querySelector('#welcome-invite').textContent='Ya sabes explorar. ¿Entramos a la misión?';
   document.querySelector('.welcome-invitation img').src='./assets/kuky/motivador.png';
   document.querySelector('#welcome-reply').textContent='Exploración completa, sin puntaje. Puedes continuar.';
   document.querySelector('.touch-example')?.remove();
   document.querySelector('#welcome-start').classList.add('ready');
   document.querySelector('.welcome-invitation').classList.add('welcomed');
   feedback('complete','Bienvenida explorada','Sin puntaje. La misión está disponible.');
  }
}
function bindEvents() {
 document.querySelector('#welcome-start')?.addEventListener('click',startPractice);
 document.querySelectorAll('[data-welcome]').forEach(button=>button.addEventListener('click',()=>exploreWelcome(button.dataset.welcome)));
 document.querySelector('.welcome-canvas')?.addEventListener('click',event=>{
  if(event.target.closest('button'))return;
  const rect=event.currentTarget.getBoundingClientRect();
  const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
  exploreWelcome(x>.55 && y>.28?'person':x<.42 && y>.48?'materials':'context');
 });
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>b.dataset.go==='practice'?startPractice():navigate(b.dataset.go));
 document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>navigate('study'));
 document.querySelector('#enlarge')?.addEventListener('click',showEnlarged);
 document.querySelector('#study-next')?.addEventListener('click',()=>{if(journey().studyIndex<3){journey().studyIndex++;navigate('study');}else{state.studyRead=true;startPractice();}});
 document.querySelector('#study-back')?.addEventListener('click',()=>{journey().studyIndex--;navigate('study');});
 document.querySelector('#observe-next')?.addEventListener('click',()=>phase('explore'));
 document.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>{
  const z=content.practica.zonas.find(z=>z.id===b.dataset.zone);journey().explored??=[];if(!journey().explored.includes(z.id))journey().explored.push(z.id);state.practice.attempts++;state.practice.found ||= z.correcta;
  message=z.correcta?'Este encuentro puede captar una mano si accede al movimiento.':z.id==='zona-c'?'La acumulación puede motivar acercarse. Busca también dónde podría quedar atrapada una mano.':'Ese tramo también requiere revisión. Busca el encuentro entre superficies.';save();render();
  document.querySelector('#explore-status')?.focus();feedback('discover','Elemento explorado',z.descripcion);
 });
 document.querySelector('#explore-status')?.setAttribute('tabindex','-1');
 document.querySelector('#hint')?.addEventListener('click',()=>{journey().hint=true;journey().focus=0;message='Busca el encuentro de la banda con la polea representada.';save();render();document.querySelector('#explore-status')?.focus();});
 document.querySelector('.scene-art')?.addEventListener('click',()=>{if(state.view==='practice'&&journey().stage==='explore'){document.querySelector('#explore-status').textContent='Explora los elementos o abre la alternativa de lista y teclado.';}});
 document.querySelector('#explore-next')?.addEventListener('click',()=>{if(state.practice.found)phase('decide');});
 document.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>{journey().pending=b.dataset.decision;save();render();document.querySelector('#confirm-decision').focus();});
 document.querySelector('#confirm-decision')?.addEventListener('click',()=>{if(!journey().pending)return;state.practice.selected=journey().pending;journey().focus=0;journey().discovered=[0];phase('discover');});
 document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{
  const j=journey();j.focus=Number(b.dataset.focus);j.discovered??=[];
  if(!j.discovered.includes(j.focus))j.discovered.push(j.focus);
  save();render();document.querySelector(`.scene-discovery[data-focus="${j.focus}"]`)?.focus({preventScroll:true});feedback('discover','Detalle explorado');
 });
 document.querySelector('#discover-next')?.addEventListener('click',()=>{if(journey().discovered?.length===3)phase('apply');});
 document.querySelectorAll('[data-apply]').forEach(b=>b.onclick=()=>{if(journey().appliedConfirmed)return;journey().applied=b.dataset.apply;save();render();document.querySelector('#confirm-apply').focus();});
 document.querySelector('#confirm-apply')?.addEventListener('click',()=>{if(!journey().applied)return;journey().appliedConfirmed=true;save();render();document.querySelector('#start-evaluation').focus();feedback('complete','Actividad completada','Revisa lo que necesitas aclarar.');cueKuky('advance','Reconocer un dato pendiente también es aprender.');});
 document.querySelector('#retry-apply')?.addEventListener('click',()=>{journey().appliedConfirmed=false;journey().applied=null;navigate('practice');});
 document.querySelector('#start-evaluation')?.addEventListener('click',()=>{prepareEvaluation();evaluationPending=null;navigate('evaluation');});
 document.querySelectorAll('[data-evaluation]').forEach(b=>b.onclick=()=>{const q=content.evaluacion[state.evaluation.current];if(state.evaluation.answers[q.id])return;evaluationPending=b.dataset.evaluation;render();document.querySelector('#evaluation-confirm').focus();});
 document.querySelector('#evaluation-confirm')?.addEventListener('click',()=>{if(!evaluationPending)return;const q=content.evaluacion[state.evaluation.current];state.evaluation.answers[q.id]=evaluationPending;evaluationPending=null;save();render();document.querySelector('#evaluation-next').focus();feedback('confirm','Respuesta confirmada');});
 document.querySelector('#evaluation-next')?.addEventListener('click',()=>{evaluationPending=null;if(state.evaluation.current<content.evaluacion.length-1){state.evaluation.current++;navigate('evaluation');}else {navigate('summary');feedback('complete','Recorrido completado');cueKuky('advance','Ahora revisa tu comprensión.');}});
 document.querySelector('#exit-evaluation')?.addEventListener('click',()=>{const d=document.createElement('dialog');d.innerHTML='<p>Las respuestas confirmadas se conservan. ¿Quieres salir?</p><button id="stay" class="primary">Continuar evaluación</button><button id="leave" class="back">Salir al inicio</button>';document.body.append(d);d.showModal();d.querySelector('#stay').onclick=()=>d.close();d.querySelector('#leave').onclick=()=>{d.close();navigate('home');};d.onclose=()=>d.remove();});
 document.querySelector('#retry-evaluation')?.addEventListener('click',()=>{state.evaluation={answers:{},orders:{},current:0};prepareEvaluation();evaluationPending=null;navigate('evaluation');});
 document.querySelector('#join-review')?.addEventListener('click',()=>{if(Object.keys(state.evaluation.answers).length){navigate(evaluateAnswers(state.evaluation.answers,content.evaluacion).complete?'summary':'evaluation');}else startPractice();});
}
function render() {
 document.body.classList.toggle('at-welcome',state.view==='home');
 document.body.classList.toggle('in-mission',['practice','study','evaluation'].includes(state.view));
 journey();
 const views={home:homeView,study:studyView,practice:practiceView,evaluation:evaluationView,summary:summaryView,review:reviewView,join:()=>`${header()}<section class="join-panel"><h1>Unirme a una capacitación</h1><p>En esta versión revisable, continúa con tu relator en el caso de la correa.</p><button class="primary" id="join-review">Continuar el caso</button><details><summary>Ingreso por código</summary><p>El ingreso a sesiones empresariales y el registro de asistencia siguen pendientes. No se solicitan datos personales en este borrador.</p></details></section>`};
 app.innerHTML=`${state.view==='home'?header():''}${!storageAvailable?'<p class="storage-note" role="status">El avance no puede guardarse en este navegador.</p>':''}${views[state.view]()}`;
 bindEvents();
}
initExperience();
initVersion();
window.addEventListener('decidobien:motion',()=>{if(content)render();});
window.addEventListener('decidobien:pause',()=>{if(content)render();});
function updateNetwork() {
  document.querySelector('#network').textContent = navigator.onLine ? 'Con conexión' : 'Modo sin conexión';
}

async function registerOffline() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data === 'OFFLINE_READY' && navigator.onLine) document.querySelector('#network').textContent = 'Lista sin conexión';
  });
  try {
    const registration = await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
    registration.addEventListener('updatefound',()=>{const w=registration.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){document.querySelector('#version-info').textContent='Actualización disponible · comprobar versión';}});});
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('offline-timeout')), 15000))
    ]);
    (ready.active || registration.active || navigator.serviceWorker.controller)?.postMessage('CHECK_READY');
  } catch {
    document.querySelector('#network').textContent = 'Descarga offline pendiente';
  }
}

let installPrompt;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  document.querySelector('#install').hidden = false;
});
window.addEventListener('appinstalled', () => { document.querySelector('#install').hidden = true; });
document.querySelector('#install').addEventListener('click', async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  installPrompt = null;
  document.querySelector('#install').hidden = true;
});
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

try {
  const response = await fetch('./assets/correa-revision.json');
  if (!response.ok) throw new Error('content-unavailable');
  content = await response.json();
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (validState(stored, content)) state = stored;
  } catch {
    // Invalid or unavailable saved data must never prevent opening the case.
    try { localStorage.getItem(KEY); } catch { storageAvailable = false; }
  }
  render();
  registerOffline();
} catch {
  app.innerHTML = `<section class="finish"><h1>No pudimos abrir el caso.</h1><p>Si es tu primera visita, comprueba la conexión para descargar el contenido. También puedes reintentar la carga.</p><button class="primary" id="reload">Reintentar</button></section>`;
  document.querySelector('#reload').addEventListener('click', () => location.reload());
}
