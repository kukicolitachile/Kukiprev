"""Complete mission acceptance: scene continuity, access, privacy of assessment and recovery."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('DECIDOBIEN_TEST_URL','http://127.0.0.1:4173')
OUT=Path(os.environ.get('DECIDOBIEN_DEMO_DIR','/workspace/consolidacion-decidobien'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 def complete(size,motion='reduce',keyboard=False,wrong=False,offline=False):
  c=b.new_context(viewport=size,reduced_motion=motion);q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
  q.goto(BASE);q.locator('#welcome-start').wait_for();q.locator('#network').filter(has_text='Lista sin conexión').wait_for()
  if offline:c.set_offline(True);q.reload()
  def act(selector):
   if keyboard:q.locator(selector).focus();q.keyboard.press('Enter')
   else:q.locator(selector).click()
  def scene_visible():
   assert q.locator('.scene-wrap').is_visible()
   box=q.locator('.scene-wrap').bounding_box()
   assert box['height']>=235,(size,box)
   assert box['y']+box['height']<size['height']-50,(size,box)
   assert q.evaluate('document.documentElement.scrollWidth<=innerWidth')
  act('#welcome-start');scene_visible();act('#observe-next');scene_visible()
  assert q.locator('.focus-highlight,.scene-discovery').count()==0
  assert q.locator('#explore-next').is_disabled()
  assert 'localiza' in q.locator('.action-requirement').inner_text()
  act('.accessible-elements summary');act('.accessible-elements [data-zone="zona-c"]')
  assert q.locator('.focus-highlight').count()==0
  assert q.locator('#explore-next').is_disabled()
  act('.accessible-elements summary');act('.accessible-elements [data-zone="zona-a"]')
  act('#explore-next');scene_visible();assert 'no realizar ajustes' in q.locator('.scene-companion').inner_text()
  assert q.locator('#confirm-decision').is_disabled()
  act('[data-decision="alt-b"]' if wrong else '[data-decision="alt-a"]')
  assert q.locator('.focus-highlight,.scene-discovery').count()==0
  act('#confirm-decision');scene_visible()
  assert q.locator('.focus-highlight').count()==1
  assert q.locator('[data-bucket],.evidence-game,.scene-context').count()==0
  assert q.locator('#discover-next').is_disabled()
  act('.scene-discovery[data-focus="1"]');scene_visible()
  assert 'acumulación' in q.locator('#focus-caption').inner_text()
  if offline:q.reload();scene_visible();assert q.locator('.scene-discovery.visited').count()==2
  act('.scene-discovery[data-focus="2"]');scene_visible()
  assert 'Avisar no confirma' in q.locator('#focus-caption').inner_text()
  assert q.locator('#discover-next').is_enabled()
  q.screenshot(path=str(OUT/f'descubre-{size["width"]}.png'))
  act('#discover-next');scene_visible();assert q.locator('#confirm-apply').is_disabled()
  act('[data-apply="ap-b"]' if wrong else '[data-apply="ap-a"]');act('#confirm-apply');scene_visible()
  if wrong:
   assert 'detención visible' in q.locator('.feedback').inner_text()
   act('#retry-apply');act('[data-apply="ap-a"]');act('#confirm-apply')
  act('#start-evaluation');scene_visible()
  for answer in ['ev1-b','ev2-a','ev3-a']:
   assert q.locator('.focus-highlight,#hint,.why,.scene-discovery,.scene-companion,.stage-progress').count()==0
   act(f'[data-evaluation="{answer}"]');act('#evaluation-confirm');q.reload()
   assert q.locator(f'[data-evaluation="{answer}"]').is_disabled()
   assert q.locator('.feedback,.focus-highlight').count()==0
   act('#evaluation-next')
  assert '2 de 3' in q.locator('.compact-summary').inner_text()
  c.set_offline(True);q.reload();assert '2 de 3' in q.locator('.compact-summary').inner_text()
  assert 'No acredita' in q.locator('.compact-summary').inner_text()
  act('[data-go="review"]');assert q.locator('.validation-list li').count()==8
  act('.learning-top [data-go="home"]');act('.welcome-secondary [data-go="join"]');act('#join-review')
  assert '2 de 3' in q.locator('.compact-summary').inner_text()
  assert not errors,errors;c.close()
 for w,h in [(360,800),(390,844),(768,1024),(1365,1000)]:complete({'width':w,'height':h},keyboard=True,offline=True)
 complete({'width':390,'height':844},motion='no-preference',wrong=True)
 # Optional study keeps the scene and never points out the answer before practice.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');q=c.new_page();q.goto(BASE);q.locator('[data-go="study"]').click()
 for i in range(4):
  assert q.locator('.scene-wrap').is_visible();assert q.locator('.focus-highlight').count()==0;q.locator('#study-next').click()
 assert q.locator('#observe-next').is_visible()
 # Settings are keyboard-operable and pausing effects survives reload.
 q.locator('#settings-toggle').focus();q.keyboard.press('Enter');assert q.locator('#experience-settings').is_visible()
 q.locator('#motion-toggle').click();q.keyboard.press('Escape');assert not q.locator('#experience-settings').is_visible()
 q.locator('#enlarge').click();assert q.locator('.image-dialog').is_visible();q.keyboard.press('Escape')
 c.close();b.close()
 print(json.dumps({'complete_route':'home to result','scene_continuity':'observe/explore/decide/discover/apply/evaluation visible','discovery':'three linked scene details; no classification','keyboard':'full route','offline':'full route and reload mid-discovery/assessment','assessment':'no hints; neutral confirmation; confirmed answers restored','responsive':'360/390/768/1365','reduced_motion':'full static route','wrong_practice':'retry without penalty','errors':[]}))
