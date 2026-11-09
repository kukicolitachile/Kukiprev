"""End-to-end mission: contextual choices, accessible lists, inquiries, assessment and offline."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('DECIDOBIEN_TEST_URL','http://127.0.0.1:4173')
OUT=Path(os.environ.get('DECIDOBIEN_DEMO_DIR','/workspace/entrega-correa-2.4'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 def route(width,height,keyboard=False,offline=False,wrong=False):
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce' if keyboard else 'no-preference');q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
  q.goto(BASE);q.locator('#welcome-start').wait_for();q.locator('#network').filter(has_text='Lista sin conexión').wait_for()
  if offline:c.set_offline(True);q.reload()
  def act(selector):
   target=q.locator(selector)
   if keyboard:target.focus();q.keyboard.press('Enter')
   else:target.click()
  def scene():
   box=q.locator('.game-board').bounding_box();assert box and box['height']>=400
   assert box['y']+box['height']<=height+5,(width,height,box)
   assert q.locator('.game-board .scene').is_visible()
   assert q.evaluate('document.documentElement.scrollWidth<=innerWidth')
  def option(kind,value):
   if keyboard:
    act('[data-open-options]');act(f'#scene-options [data-{kind}="{value}"]')
   else:act(f'.scene [data-{kind}="{value}"]')
  act('#welcome-start');scene();act('#observe-next');scene()
  assert q.locator('.focus-highlight,.scene-discovery').count()==0
  assert q.locator('#explore-next').is_disabled()
  option('zone','zona-c');assert q.locator('#explore-next').is_disabled()
  assert q.locator('.focus-highlight').count()==0
  option('zone','zona-a');assert q.locator('.explored-zone').count()==1 or q.locator('.explored-zone').count()==2
  act('#explore-next');scene()
  assert q.locator('#confirm-decision').is_disabled()
  assert 'no realizar ajustes' in q.locator('.scene-companion').inner_text()
  option('decision','alt-b' if wrong else 'alt-a')
  assert q.locator('.focus-highlight,.scene-relation').count()==0
  assert q.locator('.scene .context-action.selected').count()==1
  act('#confirm-decision');scene();assert q.locator('.focus-highlight').count()==1
  assert ('Exposición posible' if wrong else 'Aviso ≠ solución') in q.locator('.scene-relation').inner_text()
  option('focus','1');assert 'acumulación' in q.locator('#focus-caption').inner_text()
  if offline:q.reload();assert q.locator('.scene-discovery.visited').count()==2
  option('focus','2');assert q.locator('#discover-next').is_enabled()
  q.screenshot(path=str(OUT/f'descubre-{width}.png'))
  act('#discover-next');scene();assert q.locator('#confirm-inquiry').is_disabled()
  option('inquiry','method');option('inquiry','method');assert q.locator('#confirm-inquiry').is_disabled();option('inquiry','method');assert 'método' in q.locator('#scene-caption').inner_text()
  assert q.locator('#confirm-inquiry').is_enabled()
  if offline:q.reload();assert q.locator('.inquiry-action.included').count()==1
  option('inquiry','roles');act('#confirm-inquiry');scene()
  assert 'No se ha enviado' in q.locator('#scene-caption').inner_text()
  assert q.locator('.scene-relation').inner_text()=='Por aclarar'
  act('#start-evaluation')
  for answer in ['ev1-b','ev2-a','ev3-a']:
   assert q.locator('.focus-highlight,.scene-companion,.scene-discovery,#hint,.why').count()==0
   act(f'[data-evaluation="{answer}"]');act('#evaluation-confirm');q.reload()
   assert q.locator(f'[data-evaluation="{answer}"]').is_disabled()
   assert q.locator('.feedback,.focus-highlight').count()==0
   act('#evaluation-next')
  assert '2 de 3' in q.locator('.compact-summary').inner_text()
  assert q.locator('.prepared-inquiry').is_visible()
  c.set_offline(True);q.reload();assert '2 de 3' in q.locator('.compact-summary').inner_text()
  act('[data-go="review"]');assert q.locator('.validation-list li').count()==8
  act('.learning-top [data-go="home"]');act('.welcome-secondary [data-go="join"]');act('#join-review')
  assert '2 de 3' in q.locator('.compact-summary').inner_text()
  assert not errors,errors;c.close()
 for size in [(360,800),(390,844),(768,1024),(1365,1000)]:route(*size,keyboard=True,offline=True)
 route(390,844,wrong=True)
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');q=c.new_page();q.goto(BASE);q.locator('[data-go="study"]').click()
 for i in range(4):assert q.locator('.scene-wrap').is_visible();q.locator('#study-next').click()
 q.locator('#observe-next').click();q.locator('#hint').click();assert q.locator('.focus-highlight').count()==1
 q.locator('#enlarge').click();assert q.locator('.image-dialog').is_visible();q.keyboard.press('Escape')
 q.locator('#settings-toggle').click();q.locator('#motion-toggle').click();q.keyboard.press('Escape');assert q.locator('body.effects-off').count()==1
 c.close();b.close()
 print(json.dumps({'mission':'home to result; one complete contextual mission','keyboard':'all actions through equivalent lists','offline':'entire route; reload in inquiry/discovery/assessment','assessment':'neutral feedback; confirmed responses recover','responsive':'360/390/768/1365','reduced_motion':'full route','wrong_choice':'exposure explanation without automatic injury','inquiry':'prepared, never sent; condition stays unconfirmed','errors':[]}))
