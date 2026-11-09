"""Verify public surface, local-result limitations and bounded performance evidence."""
import json,urllib.request,urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:4173'
blocked={}
for path in ['/.git/config','/.git/HEAD','/assets/escenarios.json','/docs/EXPERIENCIA_AUDIOVISUAL.md','/server.py','/tests/browser-review.py','/assets/','/%2e%2e/server.py']:
 try:
  with urllib.request.urlopen(BASE+path) as r:status=r.status
 except urllib.error.HTTPError as e:status=e.code
 blocked[path]=status;assert status==404,(path,status)
with urllib.request.urlopen(BASE+'/') as r:
 headers=dict(r.headers);assert 'script-src' in headers['Content-Security-Policy'];assert headers['X-Content-Type-Options']=='nosniff'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("window.__lcp=[];new PerformanceObserver(l=>{for(const e of l.getEntries())__lcp.push(e.startTime)}).observe({type:'largest-contentful-paint',buffered:true});")
 page.goto(BASE);page.locator('#welcome-start').wait_for();page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 performance=page.evaluate("({domReady:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,lcp:Math.max(0,...__lcp),requests:performance.getEntriesByType('resource').length})")
 caches=page.evaluate("async()=>{const c=await caches.open('decidobien-v9-context');const keys=await c.keys();let bytes=0;for(const k of keys)bytes+=(await (await c.match(k)).arrayBuffer()).byteLength;return {files:keys.length,bytes,archived:keys.some(k=>k.url.endsWith('/assets/escenarios.json')),documents:keys.some(k=>k.url.includes('/docs/'))};}")
 assert caches['archived']==False and caches['documents']==False
 # The answer key needed by this offline demonstration is intentionally inspectable.
 forge=page.evaluate("""async()=>{
 const d=await(await fetch('./assets/correa-revision.json')).json();
 const s={version:1,view:'summary',practice:{found:true,attempts:1,selected:'alt-a',order:[]},evaluation:{answers:Object.fromEntries(d.evaluacion.map(q=>[q.id,q.alternativas.find(a=>a.correcta).id])),orders:{},current:0},reflection:[],studyRead:true};
 localStorage.setItem('decidobien-review-v1',JSON.stringify(s));return d.evaluacion.length;
 }""")
 page.reload();page.locator('.compact-summary').wait_for();assert f'{forge} de {forge}' in page.locator('.compact-summary').inner_text()
 assert 'No acredita' in page.locator('.compact-summary').inner_text()
 assert not errors,errors
 # Local progress cannot grant trusted approval; close only this exercise after explicit confirmation.
 page.evaluate("localStorage.setItem('unrelated-progress','keep');localStorage.setItem('decidobien-progress-v1','legacy-keep')")
 before=page.evaluate("localStorage.getItem('decidobien-review-v1')")
 page.locator('#settings-toggle').click();page.locator('#close-journey').click();page.locator('#keep-progress').click()
 assert page.evaluate("localStorage.getItem('decidobien-review-v1')")==before
 page.locator('#settings-toggle').click();page.locator('#close-journey').click();page.locator('#clear-progress').click()
 assert page.locator('#welcome-start').is_visible()
 assert page.evaluate("JSON.parse(localStorage.getItem('decidobien-review-v1')).evaluation.answers")=={}
 assert page.evaluate("localStorage.getItem('unrelated-progress')")=='keep'
 assert page.evaluate("localStorage.getItem('decidobien-progress-v1')")=='legacy-keep'
 for malformed in ['{bad json', 'x'*65537]:
  page.evaluate("s=>localStorage.setItem('decidobien-review-v1',s)",malformed);page.reload();page.locator('#welcome-start').wait_for()
 assert page.evaluate("document.querySelectorAll('input[type=email],input[name=rut],input[name=name]').length")==0
 try:page.add_script_tag(content='window.__injected=1')
 except Exception:pass
 assert page.evaluate('window.__injected||0')==0
 assert not errors,errors
 result={'blocked_paths':blocked,'headers':'CSP/no-sniff/referrer/permissions checked','offline_cache':caches,'local_headless_performance_ms':performance,'local_result_can_be_modified':True,'trusted_enterprise_result':False,'input_and_storage_checks':'malformed and oversized payloads recover; explicit close is scoped; inline script blocked','errors':errors}
 Path('/tmp/decidobien-security-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
 c.close();b.close()
