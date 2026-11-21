/* NEON ABYSS service worker: plays offline after the first visit */
const CACHE='neon-abyss-v10';
const CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png',
  'img/key_visual.webp','img/key_visual_s.webp','img/luna_1.webp','img/luna_1_s.webp','img/luna_av.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // pages: network first so updates arrive, cache as fallback for offline play
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));return}
  // everything else (images, fonts): cache first
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})))});
