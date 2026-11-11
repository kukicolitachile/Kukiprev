import json
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('/workspace/entrega-correctiva/a2');reports=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(390,844),(1366,768),(320,568),(844,390),(360,640)]:
  c=b.new_context(viewport={'width':width,'height':height},has_touch=width<600,is_mobile=width<600,reduced_motion='reduce');q=c.new_page();q.goto('http://127.0.0.1:4182');q.locator('#welcome-start').wait_for();q.locator('#welcome-start').click();q.locator('#first-name').fill('Persona');q.locator('#last-name').fill('Prueba');q.locator('#identity-form .primary').click();q.locator('#observe-next').click();q.locator('[data-open-options]').click();q.locator('#scene-options [data-zone="zona-a"]').click();q.locator('#phaser-host.detail-open').wait_for();q.wait_for_timeout(100)
  lens=q.evaluate('''()=>{const host=document.querySelector('#phaser-host'),h=host.getBoundingClientRect(),lens=JSON.parse(host.dataset.detailRect),r={x:h.x+lens.x,y:h.y+lens.y,width:lens.width,height:lens.height};const items=['#mission-title','.scene-flow','.demo-guide','.demo-bottom'].map(s=>{const b=document.querySelector(s).getBoundingClientRect();return {selector:s,area:Math.max(0,Math.min(b.right,r.x+r.width)-Math.max(b.left,r.x))*Math.max(0,Math.min(b.bottom,r.y+r.height)-Math.max(b.top,r.y))}});return {rect:r,intersections:items}}''');assert all(i['area']==0 for i in lens['intersections']),lens
  q.screenshot(path=str(out/f'{width}-hallazgo.png'),full_page=True)
  q.locator('#explore-next').click();q.locator('.decision-tray [data-decision="alt-a"]').click();q.locator('#confirm-decision').click();q.locator('.scene-focus-controls [data-focus="0"]').wait_for(state='visible');q.wait_for_timeout(100)
  q.locator('.scene-focus-controls [data-focus="1"]').click();q.wait_for_timeout(100)
  button=q.locator('.scene-focus-controls [data-focus="0"]');button.scroll_into_view_if_needed();r=button.bounding_box();x=r['x']+r['width']/2;y=r['y']+r['height']/2
  hit=q.evaluate('''([x,y])=>document.elementFromPoint(x,y)?.closest('[data-focus]')?.dataset.focus''',[x,y]);assert hit=='0',{'width':width,'hit':hit,'r':r}
  if width<600:q.touchscreen.tap(x,y)
  else:q.mouse.click(x,y)
  q.wait_for_timeout(100);assert q.locator('.scene-focus-controls [data-focus="0"]').get_attribute('aria-pressed')=='true'
  q.screenshot(path=str(out/f'{width}-descubre.png'),full_page=True)
  metrics=q.evaluate('''()=>{const r=document.querySelector('.demo-response'),why=r.querySelector('summary'),b=why.getBoundingClientRect(),h=document.querySelector('header').getBoundingClientRect(),s=document.querySelector('#settings-toggle').getBoundingClientRect();return {response:{height:r.clientHeight,scrollHeight:r.scrollHeight,overflow:getComputedStyle(r).overflow},why:{x:b.x,y:b.y,width:b.width,height:b.height},header:{width:h.width,settingsRight:s.right},documentWidth:document.documentElement.scrollWidth,innerWidth,description:document.querySelector('.demo-experience').getAttribute('aria-describedby'),kuky:document.querySelector('.demo-guide img').getAttribute('src')}}''');assert metrics['response']['scrollHeight']<=metrics['response']['height'];assert metrics['documentWidth']<=width;assert metrics['header']['settingsRight']<=width
  q.locator('.decision-explanation summary').click();q.screenshot(path=str(out/f'{width}-porque.png'),full_page=True)
  expanded=q.evaluate('''()=>{const r=document.querySelector('.demo-response'),p=r.querySelector('.confirmed-decision');return {responseHeight:r.clientHeight,scrollHeight:r.scrollHeight,overflow:getComputedStyle(r).overflow,decision:p.textContent,paragraphs:[...r.querySelectorAll('details p')].map(p=>p.textContent)}}''');assert expanded['scrollHeight']<=expanded['responseHeight']
  q.locator('.decision-explanation summary').click();q.locator('[data-open-options]').click();states=q.locator('#scene-options [data-focus]').evaluate_all('(bs)=>bs.map(b=>({focus:b.dataset.focus,pressed:b.getAttribute("aria-pressed"),text:b.textContent}))');assert states[0]['pressed']=='true' and 'explorado' in states[0]['text'];assert 'explorado' in states[1]['text'];q.locator('[data-close-options]').click()
  reports.append({'viewport':[width,height],'lens':lens,'realPointerRevisit':True,'metrics':metrics,'expanded':expanded,'listStates':states})
  c.close()
 b.close()
(out/'checks.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2));print(json.dumps(reports,ensure_ascii=False))
