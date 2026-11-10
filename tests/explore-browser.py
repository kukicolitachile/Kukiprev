"""Direct scene touches: no targets before discovery; identical accessible options; textual hint first."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_helpers import scene_projection,touch_scene
OUT=Path(os.environ.get('DECIDOBIEN_EXPLORE_DIR','/workspace/auditoria-explora'));OUT.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:4173'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);report=[]
 for width,height in [(390,844),(1900,988)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',has_touch=width<600,is_mobile=width<600);q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(BASE);q.locator('#network').filter(has_text='Lista sin conexión').wait_for();data=q.evaluate('async()=>await(await fetch("./assets/correa-revision.json")).json()')
  q.locator('#welcome-start').click();q.locator('#first-name').fill('Persona');q.locator('#last-name').fill('Demostración');q.locator('#identity-form .primary').click();q.locator('#observe-next').click();q.locator('#phaser-host[data-ready="true"]').wait_for();q.wait_for_timeout(150)
  def state():return q.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1"))')
  def shot(name):q.screenshot(path=str(OUT/f'despues-{width}-explora-{name}.png'))
  def no_reveal():
   assert q.locator('.demo-experience .camera-target,.focus-highlight,.explored-zone').count()==0
   assert q.locator('#phaser-host.detail-open').count()==0
   assert q.locator('#explore-next').is_disabled()
   assert not state()['practice']['found']
  def click_world(x,y):touch_scene(q,point=(x,y));q.wait_for_timeout(100)
  no_reveal();assert q.locator('h1').inner_text()==data['interaccion']['explora'];assert state()['practice']['attempts']==0
  view=scene_projection(q);assert view['x']>=-1 and view['y']>=-1 and view['imageRight']<=view['width']+1 and view['imageBottom']<=view['height']+1,view

  shot('entrada');q.locator('[data-open-options]').click();buttons=q.locator('#scene-options [data-zone]');assert buttons.count()==3;assert [x.inner_text() for x in buttons.all()]==[z['descripcion'] for z in data['practica']['zonas']];assert all(x.get_attribute('class')=='choice' for x in buttons.all());q.keyboard.press('Escape')
  # First hint before any attempt stays textual and does not mark a candidate.
  q.locator('#hint').focus();q.keyboard.press('Enter');no_reveal();assert state()['practice']['attempts']==0;assert not state()['journey'].get('lastTouch');assert q.locator('#explore-status').inner_text()=='Busca el encuentro de la banda con la polea representada.';shot('pista-sin-intento')
  # The participant can point anywhere in the actual scene, not only at three UI buttons.
  click_world(180,390);no_reveal();assert state()['practice']['attempts']==1;assert state()['journey']['lastTouch'];assert 'Señalaste' in q.locator('.touch-location').inner_text()
  click_world(117,635);no_reveal();assert q.locator('#explore-status').inner_text()==data['practica']['zonas'][2]['feedback'];assert 'Estuches acumulados' in q.locator('.touch-location').inner_text();shot('otro')
  before=state()['practice']['attempts'];q.locator('#hint').focus();q.keyboard.press('Enter');no_reveal();assert state()['practice']['attempts']==before;assert q.locator('#explore-status').inner_text()=='Busca el encuentro de la banda con la polea representada.';shot('pista')
  # Recover the textual hint and neutral previous touch offline, with no zoom to the answer.
  c.set_offline(True);q.reload();q.locator('#phaser-host[data-ready="true"]').wait_for();no_reveal();assert q.locator('#explore-status').inner_text()=='Busca el encuentro de la banda con la polea representada.'
  click_world(753,1178);assert state()['practice']['found'];assert q.locator('#explore-next').is_enabled();q.locator('#phaser-host.detail-open').wait_for();assert q.locator('#explore-status').inner_text()==data['practica']['zonas'][0]['feedback'];shot('hallazgo')
  zoom=q.locator('#phaser-host').get_attribute('data-zoom');q.reload();q.locator('#phaser-host.detail-open').wait_for();assert q.locator('#explore-next').is_enabled();assert q.locator('#explore-status').inner_text()==data['practica']['zonas'][0]['feedback']
  q.locator('#camera-reset').focus();q.keyboard.press('Enter');q.locator('[data-open-options]').click();q.locator('#scene-options [data-zone="zona-b"]').focus();q.keyboard.press('Enter');assert q.locator('#explore-status').inner_text()==data['practica']['zonas'][1]['feedback'];assert q.locator('#phaser-host.detail-open').count()==0
  q.locator('[data-open-options]').click();q.locator('#scene-options [data-zone="zona-a"]').focus();q.keyboard.press('Enter');q.locator('#phaser-host.detail-open').wait_for();q.locator('#explore-next').click();assert q.locator('.decision-tray').is_visible();assert not errors,errors
  report.append({'viewport':[width,height],'states':['entrada','otro','pista','hallazgo'],'full_scene':view,'direct_touch_any_point':True,'equal_accessible_options':True,'hint_text_only':True,'correct_zoom':zoom,'offline_recovery':True,'keyboard_equivalent':True,'errors':errors});c.close()
 b.close();(OUT/'explora-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({'viewports':2,'four_states_each':'passed','pointer_keyboard_offline':'passed','hint_before_discovery':'text only','errors':[]}))
