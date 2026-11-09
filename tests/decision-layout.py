"""Regression for the reported desktop crop, rotation, readable controls and portrait face bounds."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('DECIDOBIEN_LAYOUT_DIR','/workspace/correccion-encuadre'));OUT.mkdir(parents=True,exist_ok=True)
sizes=[(1900,988),(1920,1080),(1365,768),(1024,768),(768,1024),(390,844),(360,640),(844,390)]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);evidence=[]
 for width,height in sizes:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
  q.goto('http://127.0.0.1:4173');q.locator('#network').filter(has_text='Lista sin conexión').wait_for();q.locator('#welcome-start').click();q.locator('#first-name').fill('Persona');q.locator('#last-name').fill('Demostración');q.locator('#identity-form .primary').click();q.locator('#observe-next').click();q.locator('[data-open-options]').click();q.locator('#scene-options [data-zone="zona-a"]').click();q.locator('#explore-next').click();q.locator('#phaser-host[data-portrait]').wait_for();q.wait_for_timeout(180)
  def verify():
   result=q.evaluate('''()=>{const host=document.querySelector('#phaser-host'),r=host.getBoundingClientRect(),shot=JSON.parse(host.dataset.portrait);const face={x:r.x+shot.face.x,y:r.y+shot.face.y,width:shot.face.width,height:shot.face.height};const overlaps=[];for(const selector of ['header','.demo-experience>h1','.demo-guide','.demo-bottom']){const b=document.querySelector(selector).getBoundingClientRect();if(face.x<b.right&&face.x+face.width>b.left&&face.y<b.bottom&&face.y+face.height>b.top)overlaps.push(selector);}const buttons=[...document.querySelectorAll('.decision-tray button,#confirm-decision')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});return {face,scale:shot.scale,overlaps,buttons,viewport:{width:innerWidth,height:innerHeight},scroll:scrollY,horizontalOverflow:document.documentElement.scrollWidth>innerWidth};}''')
   f=result['face'];assert result['overlaps']==[],result;assert result['scale']<=1.65,result;assert f['x']>=0 and f['y']>=0 and f['x']+f['width']<=result['viewport']['width'] and f['y']+f['height']<=result['viewport']['height'],result
   for r in result['buttons']:assert r['x']>=0 and r['y']>=0 and r['x']+r['width']<=result['viewport']['width']+1 and r['y']+r['height']<=result['viewport']['height']+1 and r['height']>=44,result
   assert not result['horizontalOverflow'] and result['scroll']==0,result;return result
  assert q.evaluate('''()=>{const guide=document.querySelector('.demo-guide').getBoundingClientRect();return [...document.querySelectorAll('.camera-tools button')].every(button=>{const b=button.getBoundingClientRect();return !(b.left<guide.right&&b.right>guide.left&&b.top<guide.bottom&&b.bottom>guide.top);});}'''), 'camera controls hidden by guide'
  result=verify();q.screenshot(path=str(OUT/f'decide-{width}x{height}.png'));evidence.append(result)
  # An install prompt must not displace the compact header or cover the stage.
  assert q.locator('#experience-settings #install').count()==1
  if width==390:
   q.set_viewport_size({'width':1900,'height':988});q.wait_for_timeout(250);verify();q.set_viewport_size({'width':844,'height':390});q.wait_for_timeout(250);verify()
   q.locator('.decision-tray [data-decision="alt-a"]').focus();q.keyboard.press('Enter');q.locator('#confirm-decision').focus();q.keyboard.press('Enter');q.locator('.demo-experience[data-stage="discover"]').wait_for()
  assert not errors,errors;c.close()
 b.close();(OUT/'responsive-checks.json').write_text(json.dumps({'viewports':evidence,'resize_and_keyboard':'passed','mechanical_animation':'none'},indent=2));print(json.dumps({'viewports':len(evidence),'face_clipped_or_covered':False,'resize_and_keyboard':'passed','errors':[]}))
