"""First-visit UI bounds, actual Tab navigation, identity escaping and local-only profile."""
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);results=[]
 for width,height in [(360,800),(390,844),(768,1024),(844,390)]:
  c=b.new_context(viewport={'width':width,'height':height});page=c.new_page();requests=[];page.on('request',lambda r:requests.append({'url':r.url,'body':r.post_data}));page.goto('http://127.0.0.1:4173');page.locator('#phaser-host[data-ready="true"]').wait_for()
  box=page.locator('#welcome-start').bounding_box();assert box['y']>=0 and box['y']+box['height']<=height
  assert page.locator('#phaser-host canvas').is_visible();assert page.locator('.home-invite img').get_attribute('src')=='./assets/kuky/atento.png'
  # Tab rather than pointer/focus() traverses to the primary action.
  for _ in range(20):
   page.keyboard.press('Tab')
   if page.evaluate('document.activeElement.id')=='welcome-start':break
  assert page.evaluate('document.activeElement.id')=='welcome-start';page.keyboard.press('Enter')
  page.locator('#first-name').fill('<img src=x onerror=alert(1)>');page.locator('#last-name').fill('Demostración');page.locator('#identity-form .primary').click()
  page.locator('#phaser-host[data-ready="true"]').wait_for();page.reload();page.locator('#phaser-host[data-ready="true"]').wait_for()
  assert page.locator('img[src="x"]').count()==0
  assert not any('Demostraci' in r['url'] or (r['body'] and 'Demostraci' in r['body']) for r in requests)
  assert not page.evaluate('localStorage.getItem("decidobien-review-v1:attempt-authority-v1").includes("Demostración")')
  assert page.locator('#observe-next').is_visible();page.locator('#observe-next').click();page.wait_for_function("()=>!document.querySelector('#app[aria-busy]')");assert page.locator('#phaser-host').get_attribute('data-focus')=='general'
  # New browser session requests identity while retaining confirmed practice progress.
  page.evaluate('sessionStorage.removeItem("decidobien-participant-v1")');before=page.evaluate('(JSON.parse(localStorage.getItem("decidobien-review-v1:attempt-authority-v1"))?.state||JSON.parse(localStorage.getItem("decidobien-review-v1"))).practice');page.reload();page.locator('#identity-form').wait_for();assert page.evaluate('(JSON.parse(localStorage.getItem("decidobien-review-v1:attempt-authority-v1"))?.state||JSON.parse(localStorage.getItem("decidobien-review-v1"))).practice')==before
  c.close();results.append(f'{width}x{height}')
 b.close();print(json.dumps({'first_visit':results,'keyboard':'Tab + Enter to start','identity':'escaped, tab-scoped, never in request or progress','missing_identity':'asks without discarding progress','human_pilot':'not performed'}))
