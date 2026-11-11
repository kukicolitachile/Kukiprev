"""End-to-end motion language: real actions, bounded effects, actual camera, neutral assessment and offline."""
import ast,base64,json,os,time
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_helpers import touch_scene
OUT=Path(os.environ.get('DECIDOBIEN_MOTION_DIR','/workspace/movimiento-decidobien'));OUT.mkdir(parents=True,exist_ok=True)
RECORD=os.environ.get('DECIDOBIEN_RECORD')=='1'
source=ast.parse(Path(__file__).with_name('experience-browser.py').read_text())
AUDIO_HOOK=next(ast.literal_eval(n.value) for n in source.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='HOOK' for t in n.targets))
MOTION_HOOK='''window.__motions=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){const a=animate.call(this,frames,options);__motions.push({target:this.tagName,classes:typeof this.className==='string'?this.className:'svg',duration:options.duration,iterations:options.iterations||1,view:document.querySelector('#app')?.dataset.moment||'',src:this.getAttribute('src')});return a;};'''
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=user-gesture-required']);reports=[]
 def run(width,height,reduced=False,offline=False,record=False):
  opts={'viewport':{'width':width,'height':height},'reduced_motion':'reduce' if reduced else 'no-preference','has_touch':width<600,'is_mobile':width<600}
  if record:opts.update(record_video_dir=str(OUT/'raw'),record_video_size={'width':width,'height':height})
  c=b.new_context(**opts);c.add_init_script(AUDIO_HOOK+MOTION_HOOK);anchor={};c.expose_binding('__recordStart',lambda source:anchor.update(audio=time.monotonic()));start=time.monotonic();q=c.new_page();video=q.video;errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
  q.goto('http://127.0.0.1:4173');q.locator('#phaser-host[data-ready="true"]').wait_for();q.locator('#network').filter(has_text='Lista sin conexión').wait_for()
  if offline:c.set_offline(True);q.reload();q.locator('#phaser-host[data-ready="true"]').wait_for()
  def wait(seconds=1):
   if record:q.wait_for_timeout(int(seconds*1000))
  def act(selector,seconds=.8):q.locator(selector).click();q.wait_for_function("()=>!document.querySelector('#app[aria-busy]')");wait(seconds)
  def shot(name):
   if record:q.screenshot(path=str(OUT/(name+'.png')))
  def progress(moment,done):
   assert q.locator('.motion-progress li').count()==7
   assert q.locator('.motion-progress').get_attribute('data-completed')==str(done)
   assert q.locator('.motion-progress [aria-current="step"]').get_attribute('aria-label').startswith(moment)
  assert q.evaluate('__sounds.length')==0;wait(1.5);shot('inicio')
  # Optional welcome reacts without starting a practice attempt or locating the hazard.
  act('#welcome-explore',.3);act('[data-welcome="materials"]',1);assert 'Los materiales ayudan' in q.locator('#welcome-reply').inner_text();assert q.evaluate('((JSON.parse(localStorage.getItem("decidobien-review-v1:attempt-authority-v1"))?.state||JSON.parse(localStorage.getItem("decidobien-review-v1")))?.practice.attempts||0)')==0
  act('#settings-toggle',.25);act('#sound-toggle',.3);q.locator('#sound-toggle[aria-pressed="true"]').wait_for();act('#experience-settings .primary',.2)
  act('#welcome-start',.7);q.locator('#first-name').fill('Persona');q.locator('#last-name').fill('Demostración');wait(.8);shot('nombre');act('#identity-form .primary',2);q.locator('#phaser-host[data-ready="true"]').wait_for();progress('Observa',0);shot('contexto')
  act('#observe-next',1);progress('Explora',1);assert q.locator('.camera-target,.scene-focus').count()==0;shot('explora-entrada')
  touch_scene(q,zone='zona-c');wait(1.8);assert q.locator('#phaser-host.detail-open').count()==0;shot('explora-intento')
  act('#hint',1.3);assert q.locator('#phaser-host.detail-open').count()==0
  touch_scene(q,zone='zona-a');q.locator('#phaser-host.detail-open').wait_for();zooms=[]
  for delay in [0,100,300]:
   q.wait_for_timeout(delay);zooms.append(float(q.locator('#phaser-host').get_attribute('data-zoom')))
  if reduced:assert max(zooms)-min(zooms)<.0001,zooms
  else:assert max(zooms)-min(zooms)>.01,zooms
  wait(1.7);shot('hallazgo');act('#explore-next',2);progress('Decide',2);shot('decide');assert q.locator('#confirm-decision').is_disabled()
  act('.decision-tray [data-decision="alt-a"]',1.3);assert q.locator('.decision-tray [aria-pressed="true"]').count()==1;act('#confirm-decision',2);progress('Descubre',3);shot('descubre')
  assert q.locator('.scene-focus-controls .scene-focus').count()==3;assert q.locator('.discovery-tray').count()==0
  act('.scene-focus-controls [data-focus="1"]',1.2);act('.scene-focus-controls [data-focus="2"]',1.3);shot('descubre-detalle');act('#discover-next',1.3);progress('Aplica',4);shot('aplica')
  act('.inquiry-controls [data-inquiry="method"]',1);act('.inquiry-controls [data-inquiry="roles"]',1);act('#confirm-inquiry',1.6);assert 'No se ha enviado' in q.locator('#scene-caption').inner_text();shot('consulta');act('#start-evaluation',1);progress('Evaluación',5);shot('evaluacion')
  for answer in ['ev1-b','ev2-a','ev3-a']:
   assert q.locator('.scene-focus,.focus-highlight,.scene-companion,#hint,.why').count()==0
   n=q.evaluate('__sounds.length');m=q.evaluate('__motions.length');act('[data-evaluation="'+answer+'"]',.4);act('#evaluation-confirm',.5)
   assert q.evaluate('__sounds.slice('+str(n)+')')==['select','confirm']
   assert q.evaluate('__motions.length')==m
   act('#evaluation-next',.5)
  progress('Resultado',7);assert '2 de 3' in q.locator('.compact-summary').inner_text();assert 'feliz.png' in q.locator('.result-guide img').get_attribute('src');wait(2);shot('resultado')
  if record:
   duration=time.monotonic()-start;(OUT/'duration.json').write_text(json.dumps({'seconds':duration}));encoded=q.evaluate('''async()=>{__audioRecorder.stop();const blob=await __audioFinished;return await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(blob);});}''');(OUT/'audio-real.webm').write_bytes(base64.b64decode(encoded));(OUT/'offset.json').write_text(json.dumps({'seconds':max(0,anchor['audio']-start)}))
  motions=q.evaluate('__motions');assert all(x['iterations']!=float('inf') and x['duration']<=450 for x in motions),motions
  if reduced:assert not motions,motions
  else:assert any('result-heading' in x['classes'] for x in motions);assert any('tray-choice' in x['classes'] for x in motions)
  count=q.evaluate('__motions.length');q.wait_for_timeout(650);assert q.evaluate('__motions.length')==count
  # Muted and paused effects stay usable; reload recovers the same completed result offline.
  act('#settings-toggle',0);act('#sound-toggle',0)
  if not reduced:act('#motion-toggle',0)
  act('#experience-settings .primary',0);assert q.locator('body.effects-off').count()==1
  c.set_offline(True);q.reload();q.locator('.compact-summary').wait_for();assert '2 de 3' in q.locator('.compact-summary').inner_text();assert q.evaluate('__sounds.length')==0;assert q.evaluate('__motions.length')==0
  assert not errors,errors;reports.append({'viewport':[width,height],'reduced_motion':reduced,'offline_from_start':offline,'zoom_samples':zooms,'finite_motion_calls':len(motions),'assessment_sounds':'identical select/confirm','idle_replay':False,'offline_result_recovery':True,'errors':errors});q.close();c.close()
  if record:(OUT/'video-path.txt').write_text(str(video.path()))
 run(390,844,record=RECORD)
 run(390,844,reduced=True,offline=True)
 run(1900,988,reduced=True)
 b.close();(OUT/'motion-checks.json').write_text(json.dumps(reports,indent=2));print(json.dumps({'routes':len(reports),'motion_reduced_offline':'passed','assessment_neutral':'passed','progress':'7 moments, completion at result','recorded':RECORD,'errors':[]}))
