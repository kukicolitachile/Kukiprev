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
 mode.write_text('new');page.reload()
 old_still_shown=page.get_by_role('button',name='Comenzar recorrido').is_visible()
 assert old_still_shown
 page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click()
 try:page.locator('#welcome-start').wait_for(timeout=15000)
 except Exception:
  print(json.dumps({'url':page.url,'page_errors':errors,'http_errors':failed,'main':page.locator('main').inner_text()[:1200]}));raise
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-progress-v1"))')==legacy
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 c.set_offline(True);page.reload();assert page.locator('#welcome-start').is_visible()
 print(json.dumps({'old_cache_mismatch_reproduced':old_still_shown,'explicit_recovery':'passed','legacy_progress_unchanged':True,'offline_after_recovery':'passed'}))
 c.close();b.close()

mode.write_text('v6')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);c=b.new_context();page=c.new_page();page.goto('http://127.0.0.1:4175');page.locator('#welcome-start').wait_for();page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 confirmed={'version':1,'view':'evaluation','practice':{'found':True,'attempts':1,'selected':'alt-a','order':[]},'evaluation':{'answers':{'eval-condiciones':'ev1-b'},'orders':{},'current':0},'reflection':[],'studyRead':True}
 page.evaluate('(s)=>localStorage.setItem("decidobien-review-v1",JSON.stringify(s))',confirmed)
 mode.write_text('new');page.goto('http://127.0.0.1:4175/recovery.html');page.locator('#recover').click();page.locator('[data-evaluation="ev1-b"]').wait_for(timeout=30000)
 assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 assert page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1"))')==confirmed
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for();c.set_offline(True);page.reload();assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
 print(json.dumps({'recent_PWA_confirmed_answer_preserved':True,'recovery_does_not_restart_assessment':True,'offline_assessment_resume':True}))
 c.close();b.close()
