import {missionBoard,inquiries,artwork} from './mission-scene.js';
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
 return `<section class="welcome-home" aria-labelledby="welcome-title"><h1 id="welcome-title">Manos que cuidan</h1>
 <div class="welcome-stage"><div class="welcome-canvas" role="group" aria-label="Exploración de bienvenida sin puntaje">
 <svg viewBox="0 0 941 1100" class="welcome-art" aria-hidden="true"><image href="./assets/escenas/esc-01-base.webp" width="941" height="1672"/></svg>
 ${welcomeElements.map(el=>`<button class="welcome-spot ${welcomeSeen.has(el.id)?'visited':''}" data-welcome="${el.id}" style="left:${el.x}%;top:${el.y}%" aria-label="Explorar: ${el.name}" aria-pressed="${welcomeSeen.has(el.id)}"><span aria-hidden="true">${welcomeSeen.has(el.id)?'✓':'+'}</span></button>`).join('')}
 ${complete?'':'<span class="touch-example" aria-hidden="true">☝ Toca un + para probar</span>'}</div>
 <div class="welcome-invitation"><img src="./assets/kuky/${complete?'motivador':'atento'}.png" alt="Kuky" width="105" height="140"><p id="welcome-invite">${complete?'Ya sabes explorar. ¿Entramos a la misión?':'¿Qué ves fuera de lugar? Explora la escena.'}</p></div>
 <div class="welcome-dock"><p id="welcome-reply" class="welcome-reply" role="status">${complete?'Exploración completa, sin puntaje. Puedes continuar.':'Toca un + o usa los controles accesibles.'}</p><button class="primary ${complete?'ready':''}" id="welcome-start">Comenzar misión <span aria-hidden="true">→</span></button></div></div>
 <div class="welcome-secondary"><button class="text-button" data-go="join">Unirme a una capacitación</button><button class="text-button" data-go="study">Estudiar</button><details class="welcome-accessible"><summary>Explorar con teclado o lista</summary>${welcomeElements.map(el=>`<button class="text-button" data-welcome="${el.id}" aria-pressed="${welcomeSeen.has(el.id)}">${el.name}</button>`).join('')}</details></div></section>`;
}
function scene() {
 return `<div class="scene-wrap"><div class="scene">${artwork()}</div><button class="enlarge" id="enlarge" aria-label="Ampliar ilustración completa">⤢</button></div>`;
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
 const j=journey(),index=stages.indexOf(j.stage);
 const titles={observe:'Observa la tarea antes de actuar.',explore:content.interaccion.explora,decide:content.interaccion.decide,discover:'Toca los detalles. Conecta lo que ocurre.',apply:content.interaccion.aplica.consigna};
 return `${header()}<section class="mission-frame immersive-mission" data-stage="${j.stage}"><div class="step-title">${progress(index)}<h1>${escape(titles[j.stage])}</h1></div>${missionBoard(content,state,message)}</section>`;
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
 <p class="fine">No acredita aprobación ni asistencia. Contenido pendiente de validación técnica.</p><section class="work-transfer">${journey().inquiries?.length?`<div class="prepared-inquiry"><h2>La consulta que preparaste</h2>${inquiries(content).filter(i=>journey().inquiries.includes(i.id)).map(i=>`<p>${escape(i.question)}</p>`).join('')}<small>Para conversar con el relator; no se ha enviado un aviso.</small></div>`:''}<h2>Una conversación para tu trabajo</h2><p>Abre una pregunta que puedas conversar con el relator.</p>${[['La tarea','¿Qué hace necesario aproximar las manos?'],['El método','¿Qué condiciones y medios deben estar definidos?'],['La respuesta','¿Quién confirma cómo se atendió la anomalía?']].map(([a,b])=>`<details><summary>${a}</summary><p>${b}</p></details>`).join('')}</section>
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
 document.querySelector('[data-open-options]')?.addEventListener('click',()=>document.querySelector('#scene-options').showModal());
 document.querySelector('[data-close-options]')?.addEventListener('click',()=>document.querySelector('#scene-options').close());
 document.querySelector('[data-explain]')?.addEventListener('click',()=>document.querySelector('#scene-explanation').showModal());
 document.querySelector('[data-close-explanation]')?.addEventListener('click',()=>document.querySelector('#scene-explanation').close());
 document.querySelectorAll('[data-inquiry]').forEach(b=>b.onclick=()=>{
  const j=journey(),item=inquiries(content).find(i=>i.id===b.dataset.inquiry);if(!item)return;
  j.inquiries??=[];j.inquiryFocus=item.id;j.inquiries=j.inquiries.includes(item.id)?j.inquiries.filter(id=>id!==item.id):[...j.inquiries,item.id];
  if(j.appliedConfirmed)j.appliedConfirmed=false;
  save();render();document.querySelector('#scene-caption')?.focus({preventScroll:true});feedback('discover',j.inquiries.includes(item.id)?'Asunto incluido en tu consulta':'Asunto retirado de tu consulta');
 });
 document.querySelector('#confirm-inquiry')?.addEventListener('click',()=>{
  if(!journey().inquiries?.length)return;journey().applied='ap-a';journey().appliedConfirmed=true;save();render();
  document.querySelector('#start-evaluation').focus({preventScroll:true});feedback('complete','Consulta preparada');
 });

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
  document.querySelector('#explore-status')?.focus({preventScroll:true});feedback('discover','Elemento explorado',z.descripcion);
 });
 document.querySelector('#explore-status')?.setAttribute('tabindex','-1');
 document.querySelector('#hint')?.addEventListener('click',()=>{journey().hint=true;journey().focus=0;message='Busca el encuentro de la banda con la polea representada.';save();render();document.querySelector('#explore-status')?.focus({preventScroll:true});});
 document.querySelector('.scene-art')?.addEventListener('click',()=>{if(state.view==='practice'&&journey().stage==='explore'){document.querySelector('#explore-status').textContent='Explora los elementos o abre la alternativa de lista y teclado.';}});
 document.querySelector('#explore-next')?.addEventListener('click',()=>{if(state.practice.found)phase('decide');});
 document.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>{journey().pending=b.dataset.decision;save();render();document.querySelector('#confirm-decision').focus({preventScroll:true});});
 document.querySelector('#confirm-decision')?.addEventListener('click',()=>{if(!journey().pending)return;state.practice.selected=journey().pending;journey().focus=0;journey().discovered=[0];phase('discover');});
 document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{
  const j=journey();j.focus=Number(b.dataset.focus);j.discovered??=[];
  if(!j.discovered.includes(j.focus))j.discovered.push(j.focus);
  save();render();document.querySelector(`.scene-discovery[data-focus="${j.focus}"]`)?.focus({preventScroll:true});feedback('discover','Detalle explorado');
 });
 document.querySelector('#discover-next')?.addEventListener('click',()=>{if(journey().discovered?.length===3)phase('apply');});
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
window.addEventListener('decidobien:close-journey',()=>{
 const d=document.createElement('dialog');d.className='close-journey';
 d.innerHTML='<h2>Cerrar este recorrido</h2><p>Se eliminarán las respuestas y el avance de este ejercicio en este navegador. No se envían a la empresa. Esta acción no borra otros datos ni es un cierre de sesión empresarial.</p><button class="primary" id="keep-progress">Conservar mi avance</button><button class="back" id="clear-progress">Borrar mi avance y cerrar</button>';
 document.body.append(d);d.showModal();d.querySelector('#keep-progress').onclick=()=>d.close();
 d.querySelector('#clear-progress').onclick=()=>{
  try{localStorage.removeItem(KEY);}catch{d.querySelector('p').textContent='No se pudo eliminar el avance. No prepares esta tablet para otra persona todavía.';return;}
  d.close();state=fresh();evaluationPending=null;navigate('home');feedback('confirm','Recorrido cerrado','Se eliminó el avance de este ejercicio.');
 };
 d.onclose=()=>{d.remove();document.querySelector('#settings-toggle').focus();};
});
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
    const raw=localStorage.getItem(KEY);
    const stored=raw&&raw.length<=65536?JSON.parse(raw):null;
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
