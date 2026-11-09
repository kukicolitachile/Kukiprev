const CACHE='decidobien-v10-layout';
const LEGACY_CACHES=['decidobien-v2-art','decidobien-v3-correa-review','decidobien-v4-visual','decidobien-v5-experience','decidobien-v6-welcome','decidobien-v7-integrated','decidobien-v8-scene','decidobien-v9-context'];
const FILES=['./','./index.html','./app.js','./mission-scene.js','./experience.js','./model.js','./scenes.js','./version-client.js','./release.json','./recovery.html','./recovery.js','./style.css','./mission-scene.css','./manifest.webmanifest','./assets/correa-revision.json','./assets/kuky.png',...['atento','motivador','feliz'].map(n=>`./assets/kuky/${n}.png`),...['select','confirm','discover','complete'].map(n=>`./assets/audio/${n}.wav`),'./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png',...['base','consecuencia'].map(n=>`./assets/escenas/esc-01-${n}.webp`)];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(url=>new Request(url,{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>LEGACY_CACHES.includes(k)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{
 if(!event.source?.url?.startsWith(self.registration.scope))return;
 if(event.data==='REFRESH_STATIC'){event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(url=>new Request(url,{cache:'reload'})))).then(()=>event.ports[0]?.postMessage({ok:true,cache:CACHE})).catch(()=>event.ports[0]?.postMessage({ok:false})));return;}
 if(event.data==='SKIP_WAITING'){self.skipWaiting();return;}
 if(event.data==='CHECK_READY')event.waitUntil(caches.open(CACHE).then(async c=>{const found=await Promise.all(FILES.map(f=>c.match(f)));if(found.every(Boolean))event.source?.postMessage('OFFLINE_READY');}));
});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('/__runtime.json'))return;
 // Recovery is network-first, including for a page controlled by a previous release.
 if(url.pathname.endsWith('/recovery.html')||url.pathname.endsWith('/recovery.js')){event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));return;}
 event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(event.request,{ignoreSearch:event.request.mode==='navigate'});if(hit)return hit;return fetch(event.request);}));
});
