"""Playable Phaser path and retained later stages; real canvas, keyboard and offline."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_helpers import touch_scene
BASE=os.environ.get('DECIDOBIEN_TEST_URL','http://127.0.0.1:4173')
OUT=Path(os.environ.get('DECIDOBIEN_DEMO_DIR','/workspace/demo-phaser-entrega'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 def route(width,height,keyboard=False,offline=False,choice='alt-a'):
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce' if keyboard else 'no-preference');q=c.new_page();errors=[];console=[]
  q.on('pageerror',lambda e:errors.append(str(e)));q.on('console',lambda m:console.append(m.text) if m.type=='error' and 'ERR_INTERNET_DISCONNECTED' not in m.text else None)
  q.goto(BASE);q.locator('#network').filter(has_text='Lista sin conexión').wait_for()
  if offline:c.set_offline(True);q.reload()
  def act(selector):
   target=q.locator(selector)
   if keyboard:target.focus();q.keyboard.press('Enter')
   else:target.click()
   q.wait_for_function("()=>!document.querySelector('#app[aria-busy]')")
  def canvas():
   q.locator('#phaser-host[data-ready="true"]').wait_for();q.wait_for_timeout(100)
   box=q.locator('#phaser-host').bounding_box();assert box['height']>=height*.65
   assert q.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert q.evaluate('scrollY')==0
  def option(kind,value):
   if keyboard:
    act('[data-open-options]');act(f'#scene-options [data-{kind}="{value}"]')
   elif kind=='zone':touch_scene(q,zone=value)
   else:act(f"{ {'decision':'.decision-tray button','focus':'.scene-focus-controls button'}.get(kind,'.inquiry-controls button')}[data-{kind}=\"{value}\"]")
  canvas();act('#welcome-start');assert q.locator('#identity-form').is_visible()
  q.locator('#first-name').fill('María José');q.locator('#last-name').fill('Muñoz');act('#identity-form .primary');canvas()
  assert 'Tu rol: reconocer y comunicar; no realizar ajustes ni desatascos.' in q.locator('h1').inner_text()
  assert q.locator('.context-cue').count()==0;assert q.locator('#observe-next').is_visible()
  # Context advances only through its explicitly named primary action.
  base_zoom=float(q.locator('#phaser-host').get_attribute('data-zoom'))
  act('#observe-next');canvas();assert q.locator('#phaser-host').get_attribute('data-focus')=='general'
  assert q.locator('.camera-target').count()==0
  option('zone','zona-c')
  assert q.locator('#explore-next').is_disabled()
  zoom=float(q.locator('#phaser-host').get_attribute('data-zoom'));assert q.locator('#phaser-host.detail-open').count()==0
  act('#camera-reset');assert q.locator('#phaser-host').get_attribute('data-focus')=='general'
  option('zone','zona-a');assert q.locator('#explore-next').is_enabled();act('#explore-next');canvas()
  assert q.locator('.decision-tray .tray-choice').count()==3;assert q.locator('#confirm-decision').is_disabled()
  assert [t.inner_text() for t in q.locator('.tray-choice b').all()]==['Comunicar','Retirar','Ajustar']
  widths=[t.bounding_box()['width'] for t in q.locator('.tray-choice').all()];assert max(widths)-min(widths)<1
  data=q.evaluate('async()=>await(await fetch("./assets/correa-revision.json")).json()')
  option('decision',choice);assert q.locator('#confirm-decision').is_enabled()
  assert not any(a['feedback'] in q.locator('main').inner_text() for a in data['practica']['alternativas'])
  q.reload();canvas();assert q.locator(f'.decision-tray [data-decision="{choice}"]').get_attribute('aria-pressed')=='true'
  act('#confirm-decision');canvas();act('.decision-explanation>summary');assert next(a['feedback'] for a in data['practica']['alternativas'] if a['id']==choice) in q.locator('main').inner_text();act('.decision-explanation>summary')
  option('focus','1');q.reload();canvas();option('focus','2');assert q.locator('#discover-next').is_enabled()
  act('#discover-next');assert q.locator('.demo-experience[data-stage="apply"]').is_visible();assert q.locator('#confirm-inquiry').is_disabled()
  option('inquiry','method');option('inquiry','roles');act('#confirm-inquiry');assert 'No se ha enviado' in q.locator('#scene-caption').inner_text();act('#start-evaluation')
  for answer in ['ev1-b','ev2-a','ev3-a']:
   assert q.locator('#phaser-host,.focus-highlight,.scene-companion,#hint,.why').count()==0
   before=q.locator('main').inner_text()
   act(f'[data-evaluation="{answer}"]');act('#evaluation-confirm');q.reload()
   assert q.locator(f'[data-evaluation="{answer}"]').is_disabled()
   assert q.locator('.feedback,.focus-highlight').count()==0
   act('#evaluation-next')
  assert '2 de 3' in q.locator('.compact-summary').inner_text();act('.result-detail:first-of-type>summary');assert q.locator('.prepared-inquiry').is_visible()
  assert q.evaluate('!localStorage.getItem("decidobien-review-v1:attempt-authority-v1").includes("Muñoz")')
  c.set_offline(True);q.reload();q.wait_for_function("""()=>{const s=document.querySelector('#certificate-status');return s&&(navigator.onLine?s.textContent.includes('Julisa'):s.textContent.includes('Esta demo no sincroniza'));}""",timeout=3000)
  act('#result-certificate>summary');act('#edit-participant');q.locator('#first-name').fill('María');act('#identity-form .primary');assert 'María Muñoz' in q.locator('.certificate-panel').inner_text()
  with q.expect_download() as download:act('#preview-certificate')
  assert Path(download.value.path()).read_bytes().startswith(b'%PDF-')
  assert q.locator('.certificate-panel .primary').is_disabled()
  c.set_offline(False);q.wait_for_timeout(200);assert 'Julisa' in q.locator('#certificate-status').inner_text()
  assert not errors,errors;assert not console,console;c.close()
 for size in [(360,800),(390,844),(768,1024),(844,390)]:route(*size,keyboard=True,offline=True)
 for choice in ['alt-a','alt-b','alt-c']:route(390,844,choice=choice)
 # The separate pixel masks reconstruct the exact original, not a regenerated machine.
 c=b.new_context();q=c.new_page();q.goto(BASE);q.locator('#welcome-start').wait_for()
 pixels=q.evaluate('''async()=>{const {WORLD,splitArtwork}=await import('./scene-layers.js');const img=new Image();img.src='./assets/escenas/esc-01-base.webp';await img.decode();const c=document.createElement('canvas');c.width=WORLD.width;c.height=WORLD.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const original=ctx.getImageData(0,0,c.width,c.height).data;ctx.clearRect(0,0,c.width,c.height);const layers=splitArtwork(img);for(const l of layers)ctx.drawImage(l.canvas,l.x,l.y);const result=ctx.getImageData(0,0,c.width,c.height).data;let diff=0;for(let i=0;i<result.length;i++)if(original[i]!==result[i])diff++;return {layers:layers.map(l=>l.id),differentBytes:diff};}''')
 assert pixels['differentBytes']==0,pixels
 protected=q.evaluate('''async()=>{const {decisionBackdrop}=await import('./scene-layers.js');const data=await(await fetch('./assets/correa-revision.json')).json();const image=new Image();image.src='./assets/escenas/esc-01-base.webp';await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const original=ctx.getImageData(0,0,canvas.width,canvas.height).data;const reverse=decisionBackdrop(image).getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data;let diff=0;for(const zone of data.practica.zonas){const [left,top,width,height]=zone.rect;for(let y=Math.floor(top/100*canvas.height);y<Math.ceil((top+height)/100*canvas.height);y++)for(let x=Math.floor(left/100*canvas.width);x<Math.ceil((left+width)/100*canvas.width);x++)for(let i=0;i<4;i++){const n=(y*canvas.width+x)*4+i;if(original[n]!==reverse[n])diff++;}}return diff;}''')
 assert protected==0,protected;c.close();b.close()
 print(json.dumps({'routes':7,'viewports':['360x800','390x844','768x1024','844x390'],'keyboard':'equivalent controls','offline':'complete/reload/recovery/PDF','practice':'all 3 decisions; feedback only after confirm','assessment':'neutral, confirmed answers recovered','name':'session only, editable before PDF','layers':pixels,'errors':[]}))
