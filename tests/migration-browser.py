"""Requires the isolated old/current proxy at port 4175; never changes checkout files."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
mode=Path('/tmp/decidobien-migration-mode');mode.write_text('old')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context();page=c.new_page();errors=[];failed=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None);page.goto('http://127.0.0.1:4175')
 page.get_by_role('button',name='Comenzar recorrido').wait_for();page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 legacy={'index':0,'answers':[],'phase':'welcome','found':False,'order':[],'remaining':60}
 page.evaluate('(s)=>localStorage.setItem("decidobien-progress-v1",JSON.stringify(s))',legacy)
 page.evaluate("async()=>{const c=await caches.open('decidobien-user-data');await c.put('/saved-user-data',new Response('keep'))}")
 mode.write_text('new');page.reload()
 old_still_shown=page.get_by_role('button',name='Comenzar recorrido').is_visible()
 assert old_still_shown
 page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click()
 try:page.locator('#welcome-start').wait_for(timeout=15000)
 except Exception:
  print(json.dumps({'url':page.url,'page_errors':errors,'http_errors':failed,'main':page.locator('main').inner_text()[:1200]}));raise
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-progress-v1"))')==legacy
 assert page.evaluate("async()=>(await(await(await caches.open('decidobien-user-data')).match('/saved-user-data')).text())")=='keep'
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 c.set_offline(True);page.reload();assert page.locator('#welcome-start').is_visible()
 print(json.dumps({'old_cache_mismatch_reproduced':old_still_shown,'explicit_recovery':'passed','legacy_progress_unchanged':True,'offline_after_recovery':'passed'}))
 c.close();b.close()

mode.write_text('v6')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:4175');page.locator('#welcome-start').wait_for();page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 confirmed={'version':1,'view':'evaluation','practice':{'found':True,'attempts':1,'selected':'alt-a','order':[]},'evaluation':{'answers':{'eval-condiciones':'ev1-b'},'orders':{},'current':0},'reflection':[],'studyRead':True}
 page.evaluate('(s)=>localStorage.setItem("decidobien-review-v1",JSON.stringify(s))',confirmed)
 mode.write_text('new');page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click();page.locator('#identity-form').wait_for(timeout=30000)
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).evaluation.answers')==confirmed['evaluation']['answers']
 page.locator('#first-name').fill('Persona');page.locator('#last-name').fill('Prueba');page.locator('#identity-form .primary').click();page.locator('[data-evaluation="ev1-b"]').wait_for()
 assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).evaluation')==confirmed['evaluation']
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for();c.set_offline(True);page.reload();assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 print(json.dumps({'recent_PWA_confirmed_answer_preserved':True,'recovery_does_not_restart_assessment':True,'offline_assessment_resume':True}))
 c.close();b.close()


# The fixed 2.3 base upgrades to this implementation without changing assessment answers.
mode.write_text('review')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:4175');page.locator('#welcome-start').wait_for();page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 page.evaluate('(s)=>localStorage.setItem("decidobien-review-v1",JSON.stringify(s))',confirmed)
 mode.write_text('new');page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click();page.locator('#identity-form').wait_for(timeout=30000)
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).evaluation.answers')==confirmed['evaluation']['answers']
 page.locator('#first-name').fill('Persona');page.locator('#last-name').fill('Prueba');page.locator('#identity-form .primary').click();page.locator('[data-evaluation="ev1-b"]').wait_for()
 assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).evaluation')==confirmed['evaluation']
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for();c.set_offline(True);page.reload();assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 print(json.dumps({'base_24bb4af_to_implementation':'passed','confirmed_answer_unchanged':True,'offline_after_update':True,'foreign_cache_preserved':True}))
 c.close();b.close()


# Reported demo.1 Codespace cache upgrades without restarting a confirmed assessment.
mode.write_text('demo1')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:4175');page.locator('#welcome-start').wait_for();page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 assert page.evaluate('async()=>(await caches.keys()).includes("decidobien-v12-phaser")')
 page.evaluate('(s)=>{localStorage.setItem("decidobien-review-v1",JSON.stringify(s));sessionStorage.setItem("decidobien-participant-v1",JSON.stringify({firstName:"Persona",lastName:"Prueba"}));}',confirmed)
 mode.write_text('new');page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click();page.locator('[data-evaluation="ev1-b"]').wait_for(timeout=30000)
 assert page.locator('[data-evaluation="ev1-b"]').is_disabled();assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).evaluation')==confirmed['evaluation']
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for();assert page.evaluate('async()=>(await caches.keys()).includes("decidobien-v16-flow")')
 assert not page.evaluate('async()=>(await caches.keys()).includes("decidobien-v12-phaser")')
 c.set_offline(True);page.reload();assert page.locator('[data-evaluation="ev1-b"]').is_disabled();c.close();b.close()
 print(json.dumps({'demo_1_to_current':'passed','confirmed_answer':'preserved','offline_after_update':True,'current_cache':True}))


# The reviewed c4aa98c hint had already aimed at the answer. Preserve the attempt but remove that visual disclosure.
mode.write_text('reviewed')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:4175');page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 legacy_hint={'version':1,'view':'practice','practice':{'found':False,'attempts':1,'selected':None,'order':[]},'evaluation':{'answers':{},'orders':{},'current':0},'reflection':[],'studyRead':False,'journey':{'stage':'explore','pending':None,'hint':True,'focus':0,'applied':None,'appliedConfirmed':False,'studyIndex':0,'cameraFocus':'zona-a','explored':['zona-c']}}
 page.evaluate('(s)=>{localStorage.setItem("decidobien-review-v1",JSON.stringify(s));sessionStorage.setItem("decidobien-participant-v1",JSON.stringify({firstName:"Persona",lastName:"Prueba"}));}',legacy_hint)
 mode.write_text('new');page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click();page.locator('#phaser-host[data-ready="true"]').wait_for(timeout=30000)
 assert page.locator('#phaser-host.detail-open,.camera-target').count()==0;assert page.locator('#explore-next').is_disabled()
 assert page.locator('#explore-status').inner_text()=='Busca el encuentro de la banda con la polea representada.'
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).practice')==legacy_hint['practice']
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for();c.set_offline(True);page.reload();page.locator('#phaser-host[data-ready="true"]').wait_for();assert page.locator('#phaser-host.detail-open').count()==0
 print(json.dumps({'reviewed_c4_to_current':'passed','old_hint_remains_textual':True,'practice_attempts_preserved':True,'offline_resume':True}));c.close();b.close()


# Upgrade the immediately previous motion release; preserve the exact assessment checkpoint.
mode.write_text('motion')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:4175');page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 assert page.evaluate('async()=>(await caches.keys()).includes("decidobien-v15-motion")')
 page.evaluate('(s)=>{localStorage.setItem("decidobien-review-v1",JSON.stringify(s));sessionStorage.setItem("decidobien-participant-v1",JSON.stringify({firstName:"Persona",lastName:"Prueba"}));}',confirmed)
 mode.write_text('new');page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click();page.locator('[data-evaluation="ev1-b"]').wait_for(timeout=30000)
 assert page.locator('[data-evaluation="ev1-b"]').is_disabled();assert 'Paso 6 de 7' in page.locator('.flow-location').inner_text()
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).evaluation')==confirmed['evaluation']
 page.locator('#exit-evaluation').click();page.locator('#leave').click();page.locator('#welcome-start').click();assert 'Evaluación' in page.locator('.identity-destination').inner_text();page.locator('#identity-form .primary').click();assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for();c.set_offline(True);page.reload();assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 print(json.dumps({'motion_2_6_0_to_flow_2_6_1':'passed','confirmed_answer_unchanged':True,'explicit_assessment_resume':True,'offline_after_update':True}));c.close();b.close()
