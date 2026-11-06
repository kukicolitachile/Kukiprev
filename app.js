import { KEY, fresh, shuffle, validState, evaluateAnswers } from './model.js';
import { sceneMarkup } from './scenes.js';
const app = document.querySelector('#app');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let content, state = fresh(), storageAvailable = true, message = '', playing = null;
const stages = ['observe','explore','decide','discover','apply'];
const names = ['Observa','Explora','Decide','Descubre','Aplica'];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function journey() {
  return state.journey ??= {stage:state.practice.selected?'discover':state.practice.found?'decide':'observe',pending:null,hint:false,focus:0,applied:null,appliedConfirmed:false,studyIndex:0};
}
function save() { try {localStorage.setItem(KEY, JSON.stringify(state));} catch {storageAvailable=false;} }
function stop() {clearInterval(playing);playing=null;}
function navigate(view) {stop();state.view=view;message='';save();render();app.focus();window.scrollTo(0,0);}
function phase(stage) {journey().stage=stage;navigate('practice');}
function header() {
 return `<div class="compact-top">${state.view==='home'?'':'<button class="text-button" data-go="home">← Inicio</button>'}<span class="draft-pill">Borrador</span><button class="text-button" data-go="review">Revisión técnica</button></div>`;
}
function why(text) {return `<details class="why"><summary>¿Por qué?</summary><p>${escape(text)}</p></details>`;}
function kuky(text) {return `<aside class="kuky-cue"><img src="./assets/kuky.png" alt="Kuky" width="38" height="38"><span>${escape(text)}</span></aside>`;}
function homeView() {
 return `<section class="simple-home"><div><h1>Manos que cuidan</h1><p class="home-phrase">Observa la escena. Encuentra el peligro. Decide.</p><div class="home-actions"><button class="primary" data-go="join">Unirme a una capacitación</button><button class="back" data-go="study">Estudiar</button><button class="back" data-go="practice">Practicar</button></div></div><img class="home-kuky" src="./assets/kuky.png" alt="Kuky, guía de DecidoBien"></section>`;
}
function scene({active=false, highlight=false}={}) {
 const j=journey();const focus=content.interaccion.focos[j.focus];
 const target=content.practica.zonas.find(z=>z.id===focus.zona);
 return `<div class="scene-wrap"><div class="scene">${sceneMarkup(0)}
 ${active? [...content.practica.zonas].sort((a,b)=>a.rect[0]-b.rect[0]).map(z=>`<button class="zone" data-zone="${escape(z.id)}" aria-label="${escape(z.descripcion)}" style="left:${z.rect[0]}%;top:${z.rect[1]}%;width:${z.rect[2]}%;height:${z.rect[3]}%"></button>`).join(''):''}
 ${highlight?`<div class="focus-highlight" aria-hidden="true" style="left:${target.rect[0]}%;top:${target.rect[1]}%;width:${target.rect[2]}%;height:${target.rect[3]}%"></div>`:''}
 </div><button class="enlarge" id="enlarge" aria-label="Ampliar ilustración">⤢ Ampliar</button></div>`;
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
 const titles={observe:'Mira qué ocurre en la escena.',explore:content.interaccion.explora,decide:content.interaccion.decide,discover:content.interaccion.descubre,apply:content.interaccion.aplica.consigna};
 let panel='';
 if(stage==='observe') panel=`<p>${escape(content.interaccion.observa)}</p><button class="primary" id="observe-next">Explorar la escena →</button>`;
 if(stage==='explore') panel=`<p id="explore-status" role="status">${escape(message || (state.practice.found?'Zona reconocida. Continúa con una decisión.':'Toca un elemento o utiliza la alternativa accesible.'))}</p>
 <details class="accessible-elements"><summary>Explorar con lista o teclado</summary>${choices(content.practica.zonas.map(z=>({id:z.id,texto:z.descripcion})),'zone',null)}</details>
 <div class="action-row"><button class="text-button" id="hint">Pedir una pista</button>${state.practice.found?'<button class="primary" id="explore-next">Decidir →</button>':''}</div>`;
 if(stage==='decide') {
  const order=state.practice.order.length?state.practice.order:content.practica.alternativas.map(a=>a.id);
  panel=`<p class="role-line">${escape(content.interaccion.rol_breve)}</p>${choices(order.map(id=>content.practica.alternativas.find(a=>a.id===id)),'decision',j.pending)}<button class="primary" id="confirm-decision" ${j.pending?'':'disabled'}>Confirmar decisión →</button>`;
 }
 if(stage==='discover') {
  const focus=content.interaccion.focos[j.focus];
  panel=`<p class="feedback" role="status">${escape(selected.feedback)}</p>
   <div class="focus-controls" aria-label="Elementos que explican la respuesta">${content.interaccion.focos.map((f,i)=>`<button class="focus-tab ${j.focus===i?'active':''}" data-focus="${i}" aria-pressed="${j.focus===i}">${escape(f.titulo)}</button>`).join('')}</div>
   <p id="focus-caption" role="status">${escape(focus.texto)}</p>
   <div class="animation-controls"><button class="text-button" id="play" ${reduced()?'disabled':''}>${reduced()?'Vista estática':playing?'Pausar':'Reproducir resaltados'}</button><button class="text-button" id="repeat">Volver al primer elemento</button></div>
   ${why(content.estudio[2].texto+' '+content.rol.limites.join(' '))}
   ${!selected.correcta?`<details><summary>Una consecuencia posible</summary><figure class="possible-injury">${sceneMarkup(0,true,content.consecuencia.alt)}<figcaption>${escape(content.consecuencia.texto)}</figcaption></figure></details>`:''}
   <button class="primary" id="discover-next">Aplicar a otra situación →</button>`;
 }
 if(stage==='apply') {
  const task=content.interaccion.aplica,answer=task.alternativas.find(a=>a.id===j.applied);
  panel=`<p>${escape(task.contexto)}</p>${choices(task.alternativas,'apply',j.applied,j.appliedConfirmed)}
  ${j.appliedConfirmed?`<p class="feedback" role="status">${escape(answer.feedback)}</p>${why(content.practica.alternativas[0].feedback)}
  ${kuky('¿Qué necesitarías aclarar con el relator en tu trabajo?')}<div class="action-row"><button class="primary" id="start-evaluation">Ir a la evaluación →</button><button class="text-button" id="retry-apply">Revisar otra respuesta</button></div>`:`<button class="primary" id="confirm-apply" ${j.applied?'':'disabled'}>Confirmar respuesta →</button>`}`;
 }
 return `${header()}<section class="mission-frame"><div class="step-title"><span>${names[index]} · ${index+1}/5</span><h1>${escape(titles[stage])}</h1></div>${scene({active:stage==='explore',highlight:stage==='discover'||(stage==='explore'&&j.hint)})}<div class="activity-panel">${panel}</div></section>`;
}
function evaluationView() {
 const q=content.evaluacion[state.evaluation.current],answer=state.evaluation.answers[q.id];
 const order=state.evaluation.orders[q.id]||q.alternativas.map(a=>a.id);
 return `<div class="compact-top"><button class="text-button" id="exit-evaluation">Salir de la evaluación</button><span class="draft-pill">Borrador</span><span>Evaluación · ${state.evaluation.current+1}/${content.evaluacion.length}</span></div>
 <section class="mission-frame evaluation"><div class="step-title"><h1>${escape(q.pregunta)}</h1></div>${scene()}<div class="activity-panel">
 ${choices(order.map(id=>q.alternativas.find(a=>a.id===id)),'evaluation',answer||evaluationPending,Boolean(answer))}
 ${answer?`<p role="status">Respuesta confirmada.</p><button class="primary" id="evaluation-next">${state.evaluation.current===content.evaluacion.length-1?'Ver resultado':'Siguiente pregunta'} →</button>`:`<button class="primary" id="evaluation-confirm" ${evaluationPending?'':'disabled'}>Confirmar respuesta →</button>`}
 </div></section>`;
}
let evaluationPending=null;
function summaryView() {
 const result=evaluateAnswers(state.evaluation.answers,content.evaluacion);
 return `${header()}<section class="compact-summary"><h1>Revisa lo que descubriste.</h1><p>${result.correct} de ${result.total} respuestas coinciden con este borrador.</p>
 <p class="fine">No acredita aprobación ni asistencia. Contenido pendiente de validación técnica.</p>
 ${content.evaluacion.map(q=>{const a=q.alternativas.find(a=>a.id===state.evaluation.answers[q.id]);return `<details><summary>${a.correcta?'✓':'↻'} ${escape(q.pregunta)}</summary><p>${escape(a.feedback)}</p><p><strong>Para revisar:</strong> ${escape(q.alternativas.find(a=>a.correcta).texto)}</p></details>`;}).join('')}
 ${kuky('¿Qué debe estar resuelto antes de una tarea parecida?')}<div class="action-row"><button class="primary" data-go="home">Volver al inicio</button><button class="back" id="retry-evaluation">Repetir evaluación</button></div></section>`;
}
function reviewView() {
  return `<div class="learning-top"><button class="back" data-go="home">← Inicio</button><span>Revisión del contenido · ${escape(content.version)}</span></div>
    <section class="review-panel"><p class="eyebrow">Pendiente de validación por prevención</p><h1>Lo que todavía necesitamos conocer.</h1>
      <p class="lead">Los datos siguientes no están confirmados para el equipo real. Esta pantalla no permite aprobar el caso ni liberar una tarea.</p>
      <ul class="validation-list">${content.validacion.map(item => `<li><span class="tag">Pendiente</span><h2>${escape(item.tema)}</h2><p>${escape(item.pendiente)}</p><p><strong>Quién debe aclararlo:</strong> ${escape(item.responsable)}</p></li>`).join('')}</ul>
      <section class="notice"><h2>Referencias y condición del material</h2><p>${escape(content.fuentes.nota)}</p><p>La ilustración es genérica y el relato es hipotético. No se presenta ninguna característica del equipo de la empresa como verificada.</p></section>
      <section class="notice"><h2>Funciones que siguen siendo propuestas</h2><p>Investigación de condiciones de trabajo y seguimiento de mejoras: no implementados. También están pendientes el registro empresarial, la validación del relator y las constancias verificables.</p></section>
      <div class="action-row"><button class="primary" data-start="study">Ver la secuencia de estudio →</button><button class="back" data-go="home">Volver al inicio</button></div>
    </section>`;
}

function prepareEvaluation() {for(const q of content.evaluacion)state.evaluation.orders[q.id]??=shuffle(q.alternativas.map(a=>a.id));}
function startPractice(){journey();state.practice.order.length||(state.practice.order=shuffle(content.practica.alternativas.map(a=>a.id)));navigate('practice');}
function showEnlarged() {
 const modal=document.createElement('dialog');modal.className='image-dialog';
 modal.innerHTML=`<button class="back" id="close-image">Cerrar imagen</button>${sceneMarkup(0)}<p>Ilustración genérica pendiente de cotejo técnico.</p>`;
 document.body.append(modal);modal.showModal();modal.querySelector('button').onclick=()=>modal.close();modal.onclose=()=>{modal.remove();document.querySelector('#enlarge')?.focus();};
}
function bindEvents() {
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>b.dataset.go==='practice'?startPractice():navigate(b.dataset.go));
 document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>navigate('study'));
 document.querySelector('#enlarge')?.addEventListener('click',showEnlarged);
 document.querySelector('#study-next')?.addEventListener('click',()=>{if(journey().studyIndex<3){journey().studyIndex++;navigate('study');}else{state.studyRead=true;startPractice();}});
 document.querySelector('#study-back')?.addEventListener('click',()=>{journey().studyIndex--;navigate('study');});
 document.querySelector('#observe-next')?.addEventListener('click',()=>phase('explore'));
 document.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>{
  const z=content.practica.zonas.find(z=>z.id===b.dataset.zone);state.practice.attempts++;state.practice.found ||= z.correcta;
  message=z.correcta?'Zona reconocida. Continúa con una decisión.':'Observa cómo se encuentran las superficies. Puedes pedir una pista.';save();render();
  document.querySelector('#explore-status')?.focus();
 });
 document.querySelector('#explore-status')?.setAttribute('tabindex','-1');
 document.querySelector('#hint')?.addEventListener('click',()=>{journey().hint=true;journey().focus=0;message='Busca el encuentro de la banda con la polea representada.';save();render();document.querySelector('#explore-status')?.focus();});
 document.querySelector('.scene-art')?.addEventListener('click',()=>{if(state.view==='practice'&&journey().stage==='explore'){document.querySelector('#explore-status').textContent='Explora los elementos o abre la alternativa de lista y teclado.';}});
 document.querySelector('#explore-next')?.addEventListener('click',()=>phase('decide'));
 document.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>{journey().pending=b.dataset.decision;save();render();document.querySelector('#confirm-decision').focus();});
 document.querySelector('#confirm-decision')?.addEventListener('click',()=>{if(!journey().pending)return;state.practice.selected=journey().pending;journey().focus=0;phase('discover');});
 document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{stop();journey().focus=Number(b.dataset.focus);save();render();document.querySelector(`[data-focus="${journey().focus}"]`)?.focus();});
 document.querySelector('#play')?.addEventListener('click',()=>{
  if(playing){stop();render();document.querySelector('#play').focus();return;}
  if(reduced())return;
  if(journey().focus>=2)journey().focus=0;
  playing=setInterval(()=>{
   if(journey().focus>=2){stop();document.querySelector('#play').textContent='Reproducir resaltados';return;}
   journey().focus++;save();
   const f=content.interaccion.focos[journey().focus],z=content.practica.zonas.find(z=>z.id===f.zona);
   const mark=document.querySelector('.focus-highlight');mark.style.cssText=`left:${z.rect[0]}%;top:${z.rect[1]}%;width:${z.rect[2]}%;height:${z.rect[3]}%`;
   document.querySelector('#focus-caption').textContent=f.texto;
   document.querySelectorAll('[data-focus]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.focus)===journey().focus);b.setAttribute('aria-pressed',String(Number(b.dataset.focus)===journey().focus));});
  },1800);
  render();document.querySelector('#play').focus();
 });
 document.querySelector('#repeat')?.addEventListener('click',()=>{stop();journey().focus=0;save();render();document.querySelector('#repeat').focus();});
 document.querySelector('#discover-next')?.addEventListener('click',()=>phase('apply'));
 document.querySelectorAll('[data-apply]').forEach(b=>b.onclick=()=>{if(journey().appliedConfirmed)return;journey().applied=b.dataset.apply;save();render();document.querySelector('#confirm-apply').focus();});
 document.querySelector('#confirm-apply')?.addEventListener('click',()=>{if(!journey().applied)return;journey().appliedConfirmed=true;save();render();document.querySelector('#start-evaluation').focus();});
 document.querySelector('#retry-apply')?.addEventListener('click',()=>{journey().appliedConfirmed=false;journey().applied=null;navigate('practice');});
 document.querySelector('#start-evaluation')?.addEventListener('click',()=>{prepareEvaluation();evaluationPending=null;navigate('evaluation');});
 document.querySelectorAll('[data-evaluation]').forEach(b=>b.onclick=()=>{const q=content.evaluacion[state.evaluation.current];if(state.evaluation.answers[q.id])return;evaluationPending=b.dataset.evaluation;render();document.querySelector('#evaluation-confirm').focus();});
 document.querySelector('#evaluation-confirm')?.addEventListener('click',()=>{if(!evaluationPending)return;const q=content.evaluacion[state.evaluation.current];state.evaluation.answers[q.id]=evaluationPending;evaluationPending=null;save();render();document.querySelector('#evaluation-next').focus();});
 document.querySelector('#evaluation-next')?.addEventListener('click',()=>{evaluationPending=null;if(state.evaluation.current<content.evaluacion.length-1){state.evaluation.current++;navigate('evaluation');}else navigate('summary');});
 document.querySelector('#exit-evaluation')?.addEventListener('click',()=>{const d=document.createElement('dialog');d.innerHTML='<p>Las respuestas confirmadas se conservan. ¿Quieres salir?</p><button id="stay" class="primary">Continuar evaluación</button><button id="leave" class="back">Salir al inicio</button>';document.body.append(d);d.showModal();d.querySelector('#stay').onclick=()=>d.close();d.querySelector('#leave').onclick=()=>{d.close();navigate('home');};d.onclose=()=>d.remove();});
 document.querySelector('#retry-evaluation')?.addEventListener('click',()=>{state.evaluation={answers:{},orders:{},current:0};prepareEvaluation();evaluationPending=null;navigate('evaluation');});
 document.querySelector('#join-review')?.addEventListener('click',()=>{if(Object.keys(state.evaluation.answers).length){navigate(evaluateAnswers(state.evaluation.answers,content.evaluacion).complete?'summary':'evaluation');}else startPractice();});
}
function render() {
 journey();
 const views={home:homeView,study:studyView,practice:practiceView,evaluation:evaluationView,summary:summaryView,review:reviewView,join:()=>`${header()}<section class="join-panel"><h1>Unirme a una capacitación</h1><p>En esta versión revisable, continúa con tu relator en el caso de la correa.</p><button class="primary" id="join-review">Continuar el caso</button><details><summary>Ingreso por código</summary><p>El ingreso a sesiones empresariales y el registro de asistencia siguen pendientes. No se solicitan datos personales en este borrador.</p></details></section>`};
 app.innerHTML=`${state.view==='home'?header():''}${!storageAvailable?'<p class="storage-note" role="status">El avance no puede guardarse en este navegador.</p>':''}${views[state.view]()}`;
 bindEvents();
}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{stop();if(content)render();});
function updateNetwork() {
  document.querySelector('#network').textContent = navigator.onLine ? 'Con conexión' : 'Modo sin conexión';
}

async function registerOffline() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data === 'OFFLINE_READY' && navigator.onLine) document.querySelector('#network').textContent = 'Lista sin conexión';
  });
  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
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
