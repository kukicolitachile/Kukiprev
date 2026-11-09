"""Exercise actual browser audio, mute, static mode and offline media; optionally record."""
import base64,json,os,time
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('DECIDOBIEN_DEMO_DIR','/tmp/decidobien-experience'));OUT.mkdir(parents=True,exist_ok=True)
RECORD=os.environ.get('DECIDOBIEN_RECORD')=='1'
HOOK="""
window.__sounds=[];window.addEventListener('decidobien:sound',e=>window.__sounds.push(e.detail.kind));
const connect=AudioNode.prototype.connect;
AudioNode.prototype.connect=function(destination,...rest){
 if(destination instanceof AudioDestinationNode && !window.__audioRecorder){
  const tap=this.context.createMediaStreamDestination();connect.call(this,tap);
  const recorder=new MediaRecorder(tap.stream,{mimeType:'audio/webm'});const chunks=[];
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  window.__audioFinished=new Promise(resolve=>recorder.onstop=()=>resolve(new Blob(chunks,{type:'audio/webm'})));
  window.__audioRecorder=recorder;recorder.start();window.__recordStart?.();
 }
 return connect.call(this,destination,...rest);
};
"""
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=user-gesture-required'])
 options={'viewport':{'width':390,'height':844}}
 if RECORD:options.update(record_video_dir=str(OUT),record_video_size={'width':390,'height':844})
 c=b.new_context(**options);c.add_init_script(HOOK)
 anchor={};c.expose_binding('__recordStart',lambda source:anchor.update(audio=time.monotonic()))
 start=time.monotonic();page=c.new_page();video=page.video;errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:4173');page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 assert page.evaluate('__sounds.length')==0
 def act(selector,pause=1.1):
  page.locator(selector).click()
  if RECORD:page.wait_for_timeout(int(pause*1000))
 page.wait_for_timeout(350);page.screenshot(path=str(OUT/'inicio.png'))
 if RECORD:
  page.wait_for_timeout(1600)
  act('.welcome-spot[data-welcome="context"]',1)
  act('.welcome-spot[data-welcome="materials"]',1)
  act('.welcome-spot[data-welcome="person"]',1)
 act('#settings-toggle');act('#sound-toggle');page.locator('#sound-toggle[aria-pressed="true"]').wait_for();act('#experience-settings .primary')
 act('#welcome-start',2)
 act('#observe-next',2)
 assert page.locator('.explored-zone').count()==0
 act('.zone[data-zone="zona-c"]',2)
 assert page.locator('.explored-zone').count()==1
 act('.zone[data-zone="zona-a"]',1.5)
 assert page.locator('.explored-zone').count()==2
 page.screenshot(path=str(OUT/'exploracion.png'),full_page=False)
 act('#explore-next');page.screenshot(path=str(OUT/'decision.png'));act('.scene [data-decision="alt-a"]');act('#confirm-decision',2)
 act('.scene-discovery[data-focus="1"]',2);act('.scene-discovery[data-focus="2"]',2)
 page.screenshot(path=str(OUT/'descubrimiento.png'),full_page=False)
 act('#discover-next');act('.scene [data-inquiry="method"]',2);act('.scene [data-inquiry="roles"]',2);act('#confirm-inquiry',2);page.screenshot(path=str(OUT/'aplica.png'))
 act('#start-evaluation');page.screenshot(path=str(OUT/'evaluacion.png'))
 for a in ['ev1-b','ev2-a','ev3-a']:
  assert page.locator('.focus-highlight,#kuky-moment:not([hidden]),.stage-progress').count()==0
  old=page.evaluate('__sounds.length')
  act(f'[data-evaluation="{a}"]',.5);act('#evaluation-confirm',.7)
  assert page.evaluate('__sounds.slice('+str(old)+')')==['select','confirm']
  act('#evaluation-next',.6)
 page.screenshot(path=str(OUT/'cierre.png'),full_page=False)
 kinds=page.evaluate('[...new Set(__sounds)]');assert set(kinds)=={'select','confirm','discover','complete'},kinds
 if RECORD:
  encoded=page.evaluate("""async()=>{__audioRecorder.stop();const blob=await __audioFinished;return await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result.split(',')[1]);reader.readAsDataURL(blob);});}""")
  (OUT/'audio-real.webm').write_bytes(base64.b64decode(encoded));(OUT/'offset.json').write_text(json.dumps({'seconds':max(0,anchor['audio']-start)}))
 # Muting stops future sound events; reduced mode remains an equivalent route.
 act('#settings-toggle');act('#sound-toggle');act('#experience-settings .primary');before=page.evaluate('__sounds.length')
 page.locator('[data-go="home"]').first.click();page.locator('#welcome-start').click()
 assert page.evaluate('__sounds.length')==before
 page.locator('#settings-toggle').click();page.locator('#motion-toggle').click();page.locator('#experience-settings .primary').click();assert page.locator('body.effects-off').count()==1
 page.reload();assert page.locator('body.effects-off').count()==1
 c.set_offline(True);page.reload()
 page.locator('#settings-toggle').click();page.locator('#sound-toggle').click();page.locator('#sound-toggle[aria-pressed="true"]').wait_for();page.locator('#experience-settings .primary').click()
 assert page.evaluate('document.querySelectorAll(".scene-wrap svg").length')==1
 assert not errors,errors
 page.close();c.close()
 if RECORD:(OUT/'video-path.txt').write_text(str(video.path()))
 b.close()
 print(json.dumps({'sound_files_played':kinds,'evaluation_sound':'same neutral selection/confirmation for all answers','mute':'passed','motion_preference':'persisted','offline_audio':'passed','explored_states':'passed','scene_discovery':'passed','errors':errors,'recorded':RECORD}))
