export const RELEASE='2.7.0-review.1';
export async function initVersion(){
 const active=document.createElement('p');active.id='active-version';active.className='fine';active.textContent='Versión '+RELEASE;document.querySelector('#experience-settings')?.append(active);

 const button=document.createElement('button');button.id='version-info';button.className='text-button';button.textContent='Revisión '+RELEASE;document.querySelector('footer').append(button);
 button.onclick=()=>location.assign('./recovery.html');
 try{
  const response=await fetch('./__runtime.json',{cache:'no-store'});if(!response.ok)return;
  const server=await response.json();document.documentElement.dataset.servedCommit=server.commit;document.documentElement.dataset.sourceHash=server.source_hash;
  button.textContent=`Cliente ${RELEASE} · servidor ${server.release} · ${server.commit.slice(0,7)}${server.modified?' · cambios locales':''}`;active.textContent=button.textContent;
  if(server.release!==RELEASE){const notice=document.createElement('aside');notice.className='update-notice';notice.innerHTML='<span>Hay otra versión disponible. Conserva tu avance antes de actualizar.</span> <a href="./recovery.html">Comprobar y actualizar</a>';document.body.append(notice);}
 }catch{/* Offline: keep the bundled release label without inventing server observations. */}
 navigator.serviceWorker?.addEventListener('message',e=>{if(e.data==='UPDATE_AVAILABLE')button.textContent='Actualización disponible · comprobar versión';});
}
