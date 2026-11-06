// Local interface feedback. It never models an equipment alarm or movement.
const PREF = 'decidobien-experience-v1';
let motion = true;
try {motion = JSON.parse(localStorage.getItem(PREF))?.motion !== false;} catch {}
let enabled = false, context = null, output = null;
const buffers = new Map(), sources = new Set();
let noticeTimer, cueTimer;
export function motionAllowed() {return motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;}
function syncControls() {
 document.body.classList.toggle('effects-off', !motionAllowed());
 const audio = document.querySelector('#sound-toggle');
 if(audio){audio.textContent=enabled?'Sonido: activo':'Activar sonido';audio.setAttribute('aria-pressed',String(enabled));}
 const effects = document.querySelector('#motion-toggle');
 if(effects){effects.textContent=motionAllowed()?'Pausar efectos':matchMedia('(prefers-reduced-motion: reduce)').matches?'Movimiento reducido':'Activar efectos';effects.setAttribute('aria-pressed',String(!motionAllowed()));}
}
export async function playSound(kind) {
 if(!enabled || !context)return;
 try {
  const buffer = buffers.get(kind);
  if(!buffer)return;
  const source=context.createBufferSource();source.buffer=buffer;source.connect(output);sources.add(source);
  source.onended=()=>sources.delete(source);source.start();
  window.dispatchEvent(new CustomEvent('decidobien:sound',{detail:{kind,at:performance.now()}}));
 } catch { /* Feedback remains visible when audio is unavailable. */ }
}
export function feedback(kind,title,text='') {
 playSound(kind);
 const box=document.querySelector('#interface-notice');
 if(!box)return;
 clearTimeout(noticeTimer);box.replaceChildren();
 const icon=document.createElement('span');icon.className='notice-symbol';icon.setAttribute('aria-hidden','true');icon.textContent=kind==='complete'?'✓':kind==='discover'?'◈':'•';
 const content=document.createElement('div');const heading=document.createElement('strong');heading.textContent=title;content.append(heading);
 if(text){const detail=document.createElement('span');detail.textContent=text;content.append(detail);}
 const dismiss=document.createElement('button');dismiss.textContent='×';dismiss.setAttribute('aria-label','Cerrar aviso');dismiss.onclick=()=>box.hidden=true;
 box.append(icon,content,dismiss);box.dataset.kind=kind;box.hidden=false;
 noticeTimer=setTimeout(()=>{box.hidden=true;},3200);
}
export function cueKuky(mode,text) {
 const cue=document.querySelector('#kuky-moment');if(!cue)return;clearTimeout(cueTimer);
 cue.replaceChildren();cue.dataset.mood=mode;
 const image=document.createElement('img');image.src=`./assets/kuky/${mode==='advance'?'motivador':['reflect','observe'].includes(mode)?'atento':'feliz'}.png`;image.alt='Kuky';
 const phrase=document.createElement('span');phrase.textContent=text;
 const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','Cerrar mensaje de Kuky');close.onclick=()=>cue.hidden=true;
 cue.append(image,phrase,close);cue.hidden=false;
 cueTimer=setTimeout(()=>{cue.hidden=true;},4200);
}
export function clearFeedback() {clearTimeout(noticeTimer);clearTimeout(cueTimer);for(const id of ['interface-notice','kuky-moment']){const item=document.getElementById(id);if(item)item.hidden=true;}}
export function initExperience() {
 const controls=document.createElement('div');controls.className='experience-controls';
 controls.innerHTML='<button id="sound-toggle" aria-pressed="false">Activar sonido</button><button id="motion-toggle" aria-pressed="false">Pausar efectos</button>';
 document.querySelector('header').after(controls);
 const notice=document.createElement('aside');notice.id='interface-notice';notice.className='interface-notice';notice.hidden=true;notice.setAttribute('role','status');notice.setAttribute('aria-label','Aviso de la interfaz');notice.setAttribute('aria-live','polite');
 const cue=document.createElement('aside');cue.id='kuky-moment';cue.hidden=true;cue.className='kuky-moment';cue.setAttribute('aria-live','polite');
 notice.addEventListener('focusin',()=>clearTimeout(noticeTimer));
 cue.addEventListener('focusin',()=>clearTimeout(cueTimer));
 document.body.append(notice,cue);
 document.querySelector('#sound-toggle').onclick=async()=>{
  if(enabled){enabled=false;for(const s of sources){try{s.stop();}catch{}}sources.clear();syncControls();return;}
  try {
   const Audio = window.AudioContext || window.webkitAudioContext;if(!Audio)throw Error('unsupported');
   context??=new Audio();if(!output){output=context.createGain();output.gain.value=.6;output.connect(context.destination);}await context.resume();
   for(const kind of ['select','confirm','discover','complete'])if(!buffers.has(kind)){
    const response=await fetch(`./assets/audio/${kind}.wav`);if(!response.ok)throw Error('unavailable');buffers.set(kind,await context.decodeAudioData(await response.arrayBuffer()));
   }
   enabled=true;syncControls();feedback('select','Sonido activado','Puedes silenciarlo en cualquier momento.');
  } catch {enabled=false;syncControls();feedback('select','Audio no disponible','Puedes completar todas las actividades sin sonido.');}
 };
 document.querySelector('#motion-toggle').onclick=()=>{motion=!motion;try{localStorage.setItem(PREF,JSON.stringify({motion}));}catch{}syncControls();window.dispatchEvent(new Event('decidobien:motion'));};
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{syncControls();window.dispatchEvent(new Event('decidobien:motion'));});
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.matches('[data-decision],[data-apply],[data-evaluation]'))playSound('select');
 },true);
 document.addEventListener('pointerdown',event=>{
  if(!motionAllowed())return;
  const target=event.target.closest('button,.scene-wrap');if(!target)return;
  const rect=target.getBoundingClientRect();const ripple=document.createElement('span');ripple.className='touch-response';ripple.style.left=`${event.clientX-rect.left}px`;ripple.style.top=`${event.clientY-rect.top}px`;
  target.append(ripple);setTimeout(()=>ripple.remove(),520);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearFeedback();window.dispatchEvent(new Event('decidobien:pause'));}});
 syncControls();
}
