"""Regression cases found in review: short screens, landscape and removal feedback."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('/workspace/revision-2.4');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for w,h in [(320,568),(360,640),(390,844),(667,375),(844,390),(1024,768)]:
  c=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce');q=c.new_page();q.goto('http://127.0.0.1:4173');q.locator('#welcome-start').wait_for()
  assert q.evaluate('document.documentElement.scrollWidth<=innerWidth')
  for s in ['#welcome-start','#observe-next','.zone[data-zone="zona-a"]','#explore-next']:q.locator(s).click()
  intersections=q.locator('.context-action').evaluate_all('''els=>els.map(e=>{let r=e.getBoundingClientRect(),g=document.querySelector('.scene-companion p').getBoundingClientRect(),d=document.querySelector('.scene-dock').getBoundingClientRect();let area=b=>Math.max(0,Math.min(r.right,b.right)-Math.max(r.left,b.left))*Math.max(0,Math.min(r.bottom,b.bottom)-Math.max(r.top,b.top));return {guide:area(g),dock:area(d)}})''')
  assert all(x['guide']==0 and x['dock']==0 for x in intersections),(w,h,intersections)
  core=q.locator('.game-board .scene').bounding_box();assert core['width']>=190,(w,h,core)
  q.locator('.scene [data-decision="alt-a"]').click();q.locator('#confirm-decision').click();q.locator('.scene [data-focus="1"]').click();q.locator('.scene [data-focus="2"]').click();q.locator('#discover-next').click()
  q.locator('.scene [data-inquiry="method"]').click();assert 'Incluido en tu consulta.' in q.locator('#scene-caption').inner_text()
  q.locator('.scene [data-inquiry="method"]').click();assert 'No incluido en tu consulta.' in q.locator('#scene-caption').inner_text();assert q.locator('#confirm-inquiry').is_disabled()
  q.reload();q.locator('#scene-caption').wait_for();assert 'No incluido en tu consulta.' in q.locator('#scene-caption').inner_text()
  q.locator('.scene [data-inquiry="condition"]').click();q.locator('#confirm-inquiry').click();q.locator('#start-evaluation').click()
  assert q.locator('.scene-relation,.focus-highlight,.scene-companion').count()==0
  q.screenshot(path=str(out/f'evaluacion-{w}-{h}.png'),full_page=True);c.close()
 b.close();print(json.dumps({'short_portrait':'320x568, 360x640','landscape':'667x375, 844x390','other_views':'390x844,1024x768','guide_action_overlap':False,'removal_status':'announced and restored','route':'reaches independent evaluation','horizontal_overflow':False}))
