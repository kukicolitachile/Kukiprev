"""Exercise the participant's route, including leaving, resuming and starting again."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('DECIDOBIEN_FLOW_DIR','/workspace/flujo-decidobien'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);reports=[]
 for width,height in [(390,844),(1366,768)]:
  c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto('http://127.0.0.1:4173');q.locator('#network').filter(has_text='Lista sin conexión').wait_for()
  def act(selector):q.locator(selector).wait_for(state='visible');q.locator(selector).focus();q.keyboard.press('Enter');q.wait_for_function("()=>!document.querySelector('#app[aria-busy]')")
  def state():return q.evaluate('(JSON.parse(localStorage.getItem("decidobien-review-v1:attempt-authority-v1"))?.state||JSON.parse(localStorage.getItem("decidobien-review-v1")))')
  def snap(name):
   q.wait_for_timeout(80);q.screenshot(path=str(OUT/f'{width}-{name}.png'));assert not q.evaluate('document.documentElement.scrollWidth>innerWidth')
  def step(name,n):
   assert q.locator('.flow-location strong').inner_text()==f'Paso {n} de 7 · {name}', {'actual':q.locator('.flow-location strong').inner_text(),'state':state()}
   assert q.locator('.flow-location').is_visible()
  def leave_and_resume(expected):
   act('.demo-nav [data-go="home"]');assert expected in q.locator('.resume-note').inner_text();act('#welcome-start');assert expected in q.locator('.identity-destination').inner_text();act('#identity-form .primary')
  snap('inicio');act('#welcome-start');assert q.locator('#identity-form .primary').inner_text()=='Entrar al contexto →';q.locator('#first-name').fill('Persona');q.locator('#last-name').fill('Demostración');snap('nombre');act('#identity-form .primary');step('Observa',1);assert q.locator('[data-context-explore]').count()==0;snap('contexto');leave_and_resume('Observa');step('Observa',1)
  act('#observe-next');step('Explora',2);assert q.locator('#explore-next').is_disabled();snap('explora');act('[data-open-options]');act('#scene-options [data-zone="zona-c"]');assert state()['journey']['stage']=='explore';assert not state()['practice']['found'];leave_and_resume('Explora');step('Explora',2);assert state()['practice']['attempts']==1
  act('[data-open-options]');act('#scene-options [data-zone="zona-a"]');act('#explore-next');step('Decide',3);snap('decide');act('.decision-tray [data-decision="alt-a"]');assert not state()['practice']['selected'];leave_and_resume('Decide');assert q.locator('#confirm-decision').is_enabled();assert not state()['practice']['selected'];act('#confirm-decision');step('Descubre',4);assert q.locator('#discover-next').is_disabled();snap('descubre');act('.scene-focus-controls [data-focus="1"]');act('.scene-focus-controls [data-focus="2"]');act('#discover-next');step('Aplica',5);snap('aplica');act('.inquiry-controls [data-inquiry="method"]');act('#confirm-inquiry');assert 'No se ha enviado' in q.locator('#scene-caption').inner_text();act('#start-evaluation');step('Evaluación',6)
  # This used to return to Apply because there were no confirmed assessment answers yet.
  act('#exit-evaluation');act('#leave');assert 'Evaluación' in q.locator('.resume-note').inner_text();act('#welcome-start');assert 'Evaluación · pregunta 1 de 3' in q.locator('.identity-destination').inner_text();snap('retomar-evaluacion');act('#identity-form .primary');step('Evaluación',6);assert state()['evaluation']['answers']=={};assert q.locator('.decision-tray,.scene-focus,#hint').count()==0
  act('[data-evaluation="ev1-b"]');act('#evaluation-confirm');act('#evaluation-next');q.evaluate('sessionStorage.removeItem("decidobien-participant-v1")');q.reload();q.locator('#identity-form').wait_for();assert 'Evaluación · pregunta 2 de 3' in q.locator('.identity-destination').inner_text();q.locator('#first-name').fill('Persona');q.locator('#last-name').fill('Demostración');act('#identity-form .primary');assert state()['evaluation']['answers']=={'eval-condiciones':'ev1-b'};snap('evaluacion')
  for answer in ['ev2-a','ev3-a']:
   act('[data-evaluation="'+answer+'"]');act('#evaluation-confirm');q.reload();assert q.locator('[data-evaluation="'+answer+'"]').is_disabled();act('#evaluation-next')
  step('Resultado',7);assert '2 de 3' in q.locator('.compact-summary').inner_text();assert q.locator('.result-finish>.primary').is_visible();assert q.locator('#result-answers').get_attribute('open') is None;snap('resultado')
  finished=state()['evaluation'];act('.result-finish>.primary');assert q.locator('#saved-result').is_visible();act('#welcome-start');act('#cancel-new-mission');assert state()['evaluation']==finished;act('#saved-result');step('Resultado',7)
  act('#result-certificate>summary');act('#edit-participant');assert q.locator('#identity-form .primary').inner_text()=='Guardar y volver al resultado →';q.locator('#first-name').fill('Persona corregida');act('#identity-form .primary');assert q.locator('#result-certificate').get_attribute('open') is not None;assert 'Persona corregida' in q.locator('.certificate-panel').inner_text()
  act('#result-answers>summary');act('#retry-evaluation');act('#cancel-retry');assert state()['evaluation']==finished
  c.set_offline(True);q.reload();step('Resultado',7);assert state()['evaluation']==finished
  # A new mission starts at Context only after the explicit replacement choice.
  act('.result-finish>.primary');act('#welcome-start');act('#new-mission');act('#identity-form .primary');step('Observa',1);assert state()['evaluation']['answers']=={};assert state()['practice']['attempts']==0
  assert not errors,errors;reports.append({'viewport':[width,height],'ordered_route':True,'resume_context_explore_decide':True,'resume_assessment_before_first_answer':True,'missing_identity_resumes_question_2':True,'confirmed_answers_preserved':True,'result_no_automatic_restart':True,'explicit_new_mission_starts_context':True,'offline_result_recovered':True,'keyboard':True,'errors':errors});c.close()
 b.close();(OUT/'flow-checks.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2));print(json.dumps(reports,ensure_ascii=False))
