"""Validate entry, bypass, keyboard, responsive bounds and record actual entry audio/video."""
import ast,base64,json,os,time
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('DECIDOBIEN_DEMO_DIR','/tmp/decidobien-welcome'));OUT.mkdir(parents=True,exist_ok=True)
RECORD=os.environ.get('DECIDOBIEN_RECORD')=='1'
# Reuse only the capture hook constant; do not execute another test module.
source=ast.parse(Path(__file__).with_name('experience-browser.py').read_text())
HOOK=next(ast.literal_eval(n.value) for n in source.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='HOOK' for t in n.targets))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 options={'viewport':{'width':390,'height':844}}
 if RECORD:options.update(record_video_dir=str(OUT),record_video_size={'width':390,'height':844})
 c=b.new_context(**options);c.add_init_script(HOOK);anchor={};c.expose_binding('__recordStart',lambda source:anchor.update(audio=time.monotonic()))
 start=time.monotonic();page=c.new_page();video=page.video;errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:4173');page.locator('#welcome-start').wait_for()
 page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 assert page.evaluate('__sounds.length')==0
 assert page.locator('#welcome-start').bounding_box()['y']+page.locator('#welcome-start').bounding_box()['height']<=844
 assert page.locator('.welcome-stage').bounding_box()['height']>=300
 assert page.locator('.welcome-invitation').bounding_box()['y']>page.locator('.welcome-stage').bounding_box()['y']
 page.screenshot(path=str(OUT/'inicio-interactivo.png'),full_page=True)
 def wait(seconds=1.8):
  if RECORD:page.wait_for_timeout(int(seconds*1000))
 wait(2.5)
 page.locator('.welcome-spot[data-welcome="context"]').click();wait(2)
 assert page.locator('.welcome-spot.visited').count()==1
 assert page.evaluate('__sounds.length')==0
 page.locator('#settings-toggle').click();page.locator('#sound-toggle').click();page.locator('#sound-toggle[aria-pressed="true"]').wait_for();page.get_by_role('button',name='Volver a la escena',exact=True).click();wait(1)
 page.locator('.welcome-spot[data-welcome="materials"]').click();wait(2)
 page.locator('.welcome-spot[data-welcome="person"]').click();wait(2.5)
 assert page.locator('.welcome-spot.visited').count()==3
 assert 'sin puntaje' in page.locator('#welcome-reply').inner_text()
 assert '¿Entramos a la misión?' in page.locator('#welcome-invite').inner_text()
 assert page.locator('.focus-highlight').count()==0
 page.screenshot(path=str(OUT/'bienvenida-explorada.png'),full_page=True)
 page.locator('#welcome-start').click();wait(3)
 assert 'Observa la tarea' in page.locator('h1').inner_text()
 saved=page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1"))')
 assert saved['practice']['attempts']==0 and saved['practice']['found']==False
 page.screenshot(path=str(OUT/'comienzo-mision.png'),full_page=True)
 if RECORD:
  encoded=page.evaluate("""async()=>{__audioRecorder.stop();const blob=await __audioFinished;return await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(blob);});}""")
  (OUT/'audio-real.webm').write_bytes(base64.b64decode(encoded));(OUT/'offset.json').write_text(json.dumps({'seconds':max(0,anchor['audio']-start)}))
 assert not errors,errors
 page.close();c.close()
 if RECORD:(OUT/'video-path.txt').write_text(str(video.path()))
 # Entry remains skippable and fully usable with keyboard and reduced motion.
 for size in [{'width':360,'height':800},{'width':390,'height':844},{'width':768,'height':1024}]:
  ctx=b.new_context(viewport=size,reduced_motion='reduce');q=ctx.new_page();q.goto('http://127.0.0.1:4173');q.locator('#welcome-start').wait_for()
  assert q.evaluate('document.documentElement.scrollWidth<=innerWidth')
  bounds=q.locator('#welcome-start').bounding_box();assert bounds['y']+bounds['height']<=size['height'],(size,bounds)
  assert q.evaluate('document.getAnimations().filter(a=>a.playState==="running").length')==0
  q.locator('.welcome-canvas').click(position={'x':5,'y':5});assert q.locator('.welcome-spot.visited').count()==1
  q.locator('#welcome-start').focus();q.keyboard.press('Enter');assert q.locator('#observe-next').is_visible();ctx.close()
 ctx=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');q=ctx.new_page();q.goto('http://127.0.0.1:4173');q.locator('#welcome-start').wait_for()
 q.locator('.welcome-accessible summary').focus();q.keyboard.press('Enter')
 for el in ['context','materials','person']:
  q.locator(f'.welcome-accessible [data-welcome="{el}"]').focus();q.keyboard.press('Enter')
 assert q.locator('.welcome-spot.visited').count()==3
 q.locator('#welcome-start').focus();q.keyboard.press('Enter');assert q.locator('#observe-next').is_visible()
 ctx.close();b.close()
 print(json.dumps({'welcome':'three neutral details explored','skip':'always available','assessment_answer_revealed':False,'keyboard_and_static':'passed','mobile_main_action':'visible at 360x800 and 390x844','tablet':'passed','errors':errors,'recorded':RECORD}))
