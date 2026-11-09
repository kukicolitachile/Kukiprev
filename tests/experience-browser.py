"""Record the actual mobile demo from opening through confirmed decision, including Web Audio."""
import base64,json,os,time
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('DECIDOBIEN_DEMO_DIR','/workspace/demo-phaser-entrega'));OUT.mkdir(parents=True,exist_ok=True)
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
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=user-gesture-required'])
 options={'viewport':{'width':390,'height':844}}
 if RECORD:options.update(record_video_dir=str(OUT/'raw'),record_video_size={'width':390,'height':844})
 c=b.new_context(**options);c.add_init_script(HOOK);anchor={};c.expose_binding('__recordStart',lambda source:anchor.update(audio=time.monotonic()))
 start=time.monotonic();page=c.new_page();video=page.video;errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:4173');page.locator('#phaser-host[data-ready="true"]').wait_for();page.locator('#network').filter(has_text='Lista sin conexión').wait_for()
 def wait(seconds=1):
  if RECORD:page.wait_for_timeout(int(seconds*1000))
 def act(selector,seconds=1):page.locator(selector).click();wait(seconds)
 def snap(name):page.screenshot(path=str(OUT/(name+'.png')))
 assert page.evaluate('__sounds.length')==0;wait(1.7);snap('inicio')
 act('#settings-toggle',.5);act('#sound-toggle',.7);page.locator('#sound-toggle[aria-pressed="true"]').wait_for();assert page.locator('#sound-toggle').get_attribute('aria-pressed')=='true';act('#experience-settings .primary',.5)
 act('#welcome-start',.8);page.locator('#first-name').fill('María José');wait(.4);page.locator('#last-name').fill('Muñoz');wait(.6);snap('nombre');act('#identity-form .primary',2);page.locator('#phaser-host[data-ready="true"]').wait_for();snap('contexto')
 act('[data-context-explore]',2.2);snap('explora');act('#camera-reset',.8);act('.camera-target[data-zone="zona-a"]',2.2);snap('detalle');act('#camera-reset',.7);act('#explore-next',2);snap('decide')
 assert page.locator('#confirm-decision').is_disabled();act('.decision-tray [data-decision="alt-a"]',1.7);snap('seleccion');act('#confirm-decision',2.5);snap('confirmada')
 kinds=page.evaluate('[...new Set(__sounds)]');assert set(kinds)=={'select','confirm','discover','complete'},kinds
 if RECORD:
  (OUT/'duration.json').write_text(json.dumps({'seconds':time.monotonic()-start}))
  encoded=page.evaluate("""async()=>{__audioRecorder.stop();const blob=await __audioFinished;return await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result.split(',')[1]);reader.readAsDataURL(blob);});}""")
  (OUT/'audio-real.webm').write_bytes(base64.b64decode(encoded));(OUT/'offset.json').write_text(json.dumps({'seconds':max(0,anchor['audio']-start)}))
 # Same route state supports muted offline reload and instantly reduced camera response.
 act('#settings-toggle',0);act('#sound-toggle',0);act('#motion-toggle',0);act('#experience-settings .primary',0);before=page.evaluate('__sounds.length');assert page.locator('body.effects-off').count()==1
 c.set_offline(True);page.reload();page.locator('#phaser-host[data-ready="true"]').wait_for();assert page.locator('body.effects-off').count()==1
 act('.discovery-tray [data-focus="1"]',0);assert page.evaluate('__sounds.length')==0
 act('#settings-toggle',0);act('#sound-toggle',0);page.locator('#sound-toggle[aria-pressed="true"]').wait_for();act('#experience-settings .primary',0);act('.discovery-tray [data-focus="2"]',0);assert page.evaluate('__sounds.includes("discover")')
 assert not errors,errors;page.close();c.close()
 if RECORD:(OUT/'video-path.txt').write_text(str(video.path()))
 b.close();result={'demo':'opening → identity → context → explore/camera → choose → confirm','audio':kinds,'mute':'passed','reduced_motion':'persisted','offline_audio_and_canvas':'passed','recorded':RECORD,'errors':errors};(OUT/'audiovisual-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result))
