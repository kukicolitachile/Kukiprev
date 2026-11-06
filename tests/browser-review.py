"""Scene-first mission checks; serve the app on port 4173 before running."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('DECIDOBIEN_TEST_URL','http://127.0.0.1:4173')
SHOTS=Path('/workspace/comparativa-correa');SHOTS.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 page=c.new_page();errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
 page.goto(BASE);page.get_by_role('button',name='Practicar',exact=True).wait_for()
 page.wait_for_function("document.querySelector('#network').textContent==='Lista sin conexión'")
 assert page.locator('.mission-card').count()==0
 assert page.locator('.simple-home button').count()==3
 page.screenshot(path=str(SHOTS/'despues-inicio.png'),full_page=True)
 page.get_by_role('button',name='Estudiar',exact=True).click()
 for i in range(4):
  assert page.locator('.focus-highlight').count()==0
  page.locator('#study-next').click()
 assert page.locator('.focus-highlight').count()==0
 page.locator('#observe-next').click()
 assert page.locator('.focus-highlight').count()==0
 assert page.locator('.scene-wrap').bounding_box()['height']>=280
 page.screenshot(path=str(SHOTS/'despues-practica.png'),full_page=True)
 # Equivalent exploration via keyboard, no pointer needed for the correct target.
 page.locator('.accessible-elements summary').focus();page.keyboard.press('Enter')
 page.locator('.accessible-elements [data-zone="zona-c"]').focus();page.keyboard.press('Enter')
 assert page.locator('.focus-highlight').count()==0
 page.locator('.accessible-elements summary').focus();page.keyboard.press('Enter')
 page.locator('.accessible-elements [data-zone="zona-a"]').focus();page.keyboard.press('Enter')
 page.locator('#explore-next').click()
 page.locator('[data-decision="alt-a"]').focus();page.keyboard.press('Enter')
 assert page.locator('.focus-highlight').count()==0
 page.locator('#confirm-decision').focus();page.keyboard.press('Enter')
 assert page.locator('.focus-highlight').count()==1
 assert page.locator('#play').is_disabled()
 page.screenshot(path=str(SHOTS/'despues-descubre.png'),full_page=True)
 page.locator('[data-focus="1"]').focus();page.keyboard.press('Enter')
 assert 'acumulación' in page.locator('#focus-caption').inner_text()
 page.locator('#discover-next').click()
 page.locator('[data-apply="ap-a"]').click();page.locator('#confirm-apply').click()
 assert 'aclarar' in page.locator('.feedback').inner_text()
 page.locator('#start-evaluation').click()
 assert page.locator('.focus-highlight, #hint, .why').count()==0
 for index,answer in enumerate(['ev1-b','ev2-a','ev3-a']):
  page.locator(f'[data-evaluation="{answer}"]').click()
  assert page.locator('.feedback').count()==0
  page.locator('#evaluation-confirm').click()
  page.reload()
  assert page.locator(f'[data-evaluation="{answer}"]').is_disabled()
  assert page.locator('.feedback,.focus-highlight,#hint').count()==0
  page.locator('#evaluation-next').click()
 assert '2 de 3' in page.locator('.compact-summary').inner_text()
 c.set_offline(True);page.reload();assert '2 de 3' in page.locator('.compact-summary').inner_text()
 page.locator('[data-go="review"]').click();assert page.locator('.validation-list li').count()==8
 page.locator('[data-go="home"]').first.click();page.get_by_role('button',name='Unirme a una capacitación',exact=True).click()
 page.locator('#join-review').click();assert '2 de 3' in page.locator('.compact-summary').inner_text()
 for w,h in [(360,800),(768,1024),(1365,1000)]:
  page.set_viewport_size({'width':w,'height':h});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 assert not failed,failed
 c.close()
 # Playback is optional, pausable, repeatable and concerns overlays only.
 normal=b.new_context(viewport={'width':390,'height':844})
 q=normal.new_page();q.goto(BASE);q.get_by_role('button',name='Practicar',exact=True).click();q.locator('#observe-next').click()
 q.locator('#hint').click();assert q.locator('.focus-highlight').count()==1
 q.locator('.zone[data-zone="zona-a"]').click();q.locator('#explore-next').click()
 q.locator('[data-decision="alt-b"]').click();q.locator('#confirm-decision').click()
 q.locator('#play').click();q.wait_for_timeout(2000)
 assert q.locator('[data-focus="1"]').get_attribute('aria-pressed')=='true'
 q.locator('#play').click();caption=q.locator('#focus-caption').inner_text();q.wait_for_timeout(2000)
 assert caption==q.locator('#focus-caption').inner_text()
 q.locator('#repeat').click();assert q.locator('[data-focus="0"]').get_attribute('aria-pressed')=='true'
 q.locator('#enlarge').click();assert q.locator('dialog').is_visible();q.keyboard.press('Escape')
 q.locator('dialog').wait_for(state='detached')
 normal.close()
 keyboard=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 k=keyboard.new_page();k.goto(BASE)
 def enter(selector):
  k.locator(selector).focus();k.keyboard.press('Enter')
 enter('.simple-home [data-go="practice"]');enter('#observe-next')
 enter('.accessible-elements summary');enter('.accessible-elements [data-zone="zona-a"]')
 enter('#explore-next');enter('[data-decision="alt-a"]');enter('#confirm-decision')
 assert k.locator('#play').is_disabled()
 enter('#discover-next');enter('[data-apply="ap-a"]');enter('#confirm-apply');enter('#start-evaluation')
 for answer in ['ev1-a','ev2-a','ev3-a']:
  enter(f'[data-evaluation="{answer}"]');enter('#evaluation-confirm');enter('#evaluation-next')
 assert '3 de 3' in k.locator('.compact-summary').inner_text()
 keyboard.close();b.close()
 print(json.dumps({'mission':'five moments passed','keyboard':'exploration and confirmation passed','assessment':'no hints/correction; confirmed answers restored','offline':'passed','reduced_motion':'static path passed','playback':'pause and repeat passed','responsive':'360/390/768/1365 passed','errors':errors,'http_errors':failed}))
