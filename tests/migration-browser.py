"""Historical PWA fixtures: explicit recovery preserves answers and unrelated data."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
mode=Path('/tmp/decidobien-migration-mode');BASE='http://127.0.0.1:4175'
AUTH='decidobien-review-v1:attempt-authority-v1'
confirmed={'version':1,'view':'evaluation','practice':{'found':True,'attempts':1,'selected':'alt-a','order':[]},'evaluation':{'answers':{'eval-condiciones':'ev1-b'},'orders':{},'current':0},'reflection':[],'studyRead':True}
def authority(page):return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',AUTH)
def resume(page):
 page.wait_for_function("()=>document.querySelector('#welcome-start,#takeover-attempt,#identity-form,#evaluation-next,#explore-next')")
 if page.locator('#takeover-attempt').count():
  page.locator('#takeover-attempt').click();page.locator('#attempt-guard').wait_for(state='hidden')
 if page.locator('#identity-form').count():
  page.locator('#first-name').fill('Persona');page.locator('#last-name').fill('Prueba');page.locator('#identity-form .primary').click()
 page.wait_for_function("()=>!document.querySelector('#app[aria-busy]')")
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);results=[]
 for fixture in os.environ.get('DECIDOBIEN_MIGRATION_CASES','old,v6,review,demo1,reviewed,motion,flow').split(','):
  print('MIGRATION',fixture,flush=True);mode.write_text(fixture);c=b.new_context();q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(BASE);q.locator('#network').filter(has_text='Lista sin conexión').wait_for()
  if fixture=='old':
   original={'index':0,'answers':[],'phase':'welcome','found':False,'order':[],'remaining':60};q.evaluate('s=>localStorage.setItem("decidobien-progress-v1",JSON.stringify(s))',original);saved=None
  elif fixture=='reviewed':
   saved={'version':1,'view':'practice','practice':{'found':False,'attempts':1,'selected':None,'order':[]},'evaluation':{'answers':{},'orders':{},'current':0},'reflection':[],'studyRead':False,'journey':{'stage':'explore','pending':None,'hint':True,'focus':0,'applied':None,'appliedConfirmed':False,'studyIndex':0,'cameraFocus':'zona-a','explored':['zona-c']}};q.evaluate('s=>localStorage.setItem("decidobien-review-v1",JSON.stringify(s))',saved)
  else:saved=confirmed;q.evaluate('s=>localStorage.setItem("decidobien-review-v1",JSON.stringify(s))',saved)
  q.evaluate("async()=>{const r=await navigator.serviceWorker.ready;if(r.active?.state!=='activated')await new Promise(resolve=>r.active.addEventListener('statechange',()=>{if(r.active.state==='activated')resolve();}));}")
  q.wait_for_timeout(100)
  q.evaluate("async()=>{const c=await caches.open('decidobien-user-data');await c.put('/saved-user-data',new Response('keep'))}")
  mode.write_text('new');q.reload();print('CACHE_AFTER_RELOAD',q.evaluate("async()=>Boolean(await(await caches.open('decidobien-user-data')).match('/saved-user-data'))"),flush=True)
  if fixture=='old':assert q.get_by_role('button',name='Comenzar recorrido').is_visible()
  q.goto(BASE+'/recovery.html?release=2.7.0-review.1');print('RECOVERY_ACTUAL',fixture,q.locator('#recover').evaluate("e=>({handler:e.onclick?.toString().includes(\"key.startsWith('decidobien-')\"),scripts:[...document.scripts].map(x=>x.src)})"),q.evaluate("async()=>Boolean(await(await caches.open('decidobien-user-data')).match('/saved-user-data'))"),flush=True);assert not q.locator('#recover').evaluate("e=>e.onclick.toString().includes(\"key.startsWith('decidobien-')\")");q.locator('#recover').click();resume(q)
  if saved:
   got=authority(q)['state'];assert {k:got['practice'][k] for k in ['found','attempts','selected']}=={k:saved['practice'][k] for k in ['found','attempts','selected']}, {'fixture':fixture,'actual':got['practice'],'original':saved['practice']};assert got['evaluation']==saved['evaluation'];assert not saved['practice']['order'] or got['practice']['order']==saved['practice']['order']
   if fixture=='reviewed':
    q.locator('#phaser-host[data-ready="true"]').wait_for();assert q.locator('#phaser-host.detail-open,.camera-target').count()==0;assert q.locator('#explore-status').inner_text()=='Busca el encuentro de la banda con la polea representada.'
   else:q.locator('[data-evaluation="ev1-b"]').wait_for();assert q.locator('[data-evaluation="ev1-b"]').is_disabled()
  else:assert q.evaluate('JSON.parse(localStorage.getItem("decidobien-progress-v1"))')==original
  assert q.evaluate("async()=>{const r=await(await caches.open('decidobien-user-data')).match('/saved-user-data');return r?await r.text():null;}")=='keep',{'fixture':fixture,'caches':q.evaluate('async()=>await caches.keys()')}
  q.locator('#network').filter(has_text='Lista sin conexión').wait_for();assert q.evaluate('async()=>(await caches.keys()).includes("decidobien-v17-corrective")')
  c.set_offline(True);q.reload();resume(q)
  if saved:assert authority(q)['state']['evaluation']==saved['evaluation'];assert {k:authority(q)['state']['practice'][k] for k in ['found','attempts','selected']}=={k:saved['practice'][k] for k in ['found','attempts','selected']}
  else:assert q.locator('#welcome-start').is_visible()
  assert not errors,errors;results.append({'fixture':fixture,'preserved':True,'explicit_resume_after_migration':bool(saved),'offline_recovery':True,'foreign_cache_preserved':True,'errors':errors});c.close()
 b.close();print(json.dumps(results))
