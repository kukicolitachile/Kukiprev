async function diagnose(){
 let server;
 try{const r=await fetch('./__runtime.json',{cache:'no-store'});if(!r.ok)throw Error();server=await r.json();}catch{server={status:'Este servidor no ofrece diagnóstico; comprueba npm run diagnose en su terminal.'};}
 const cachesFound='caches'in window?(await caches.keys()).filter(k=>k.startsWith('decidobien-')):[];
 const registrations='serviceWorker'in navigator?await navigator.serviceWorker.getRegistrations():[];
 document.querySelector('#diagnostic').textContent=JSON.stringify({servidor:server,cache_pwa:cachesFound,controlador:navigator.serviceWorker?.controller?.scriptURL||null,respuestas_guardadas:['decidobien-progress-v1','decidobien-review-v1'].map(key=>({key,present:Boolean(localStorage.getItem(key))})),registros:registrations.filter(r=>r.scope===new URL('./',location.href).href).length},null,2);
}
document.querySelector('#recover').onclick=async()=>{
 const b=document.querySelector('#recover');b.disabled=true;
 try{
  const probe=await fetch('./release.json',{cache:'no-store'});if(!probe.ok)throw Error('No hay una versión del servidor disponible.');
  const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await reg.update();
  if(reg.installing && !['installed','activated'].includes(reg.installing.state))await new Promise((resolve,reject)=>{const worker=reg.installing;worker.addEventListener('statechange',()=>{if(['installed','activated'].includes(worker.state))resolve();if(worker.state==='redundant')reject(Error('Falló la descarga.'));});});
  if(reg.waiting){reg.waiting.postMessage('SKIP_WAITING');await new Promise(resolve=>{navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true});setTimeout(resolve,4000);});}
  const refreshed=await new Promise((resolve,reject)=>{
   const channel=new MessageChannel();const timeout=setTimeout(()=>reject(Error('No respondió la nueva versión. No se borró el avance.')),10000);
   channel.port1.onmessage=e=>{clearTimeout(timeout);e.data?.ok?resolve(e.data):reject(Error('No se completó la descarga de recursos.'));};
   (reg.active||navigator.serviceWorker.controller).postMessage('REFRESH_STATIC',[channel.port2]);
  });
  // Remove obsolete application resources only; preserve the refreshed bundle and all progress.
  for(const key of await caches.keys())if(['decidobien-v2-art','decidobien-v3-correa-review','decidobien-v4-visual','decidobien-v5-experience','decidobien-v6-welcome','decidobien-v7-integrated','decidobien-v8-scene','decidobien-v9-context','decidobien-v10-layout','decidobien-v11-focus','decidobien-v12-phaser'].includes(key)&&key!==refreshed.cache)await caches.delete(key);
  location.replace('./');
 }catch(error){document.querySelector('#diagnostic').textContent='No se actualizó: '+error.message;b.disabled=false;}
};
diagnose().catch(()=>{document.querySelector('#diagnostic').textContent='No se pudo leer el diagnóstico del navegador.';});
