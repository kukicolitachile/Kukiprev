import json
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('/workspace/entrega-correctiva/a2');reports=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(390,844),(1366,768)]:
  for alternative in ['alt-a','alt-b','alt-c']:
   c=b.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference');q=c.new_page();q.goto('http://127.0.0.1:4182');q.locator('#welcome-start').click();q.locator('#first-name').fill('Persona');q.locator('#last-name').fill('Prueba');q.locator('#identity-form .primary').click();q.locator('#observe-next').click();q.locator('[data-open-options]').click();q.locator('#scene-options [data-zone="zona-a"]').click();q.locator('#explore-next').click();q.locator('.decision-tray [data-decision="'+alternative+'"]').click();q.wait_for_timeout(350);q.screenshot(path=str(out/f'{width}-{alternative}-decide.png'),full_page=True);q.locator('#confirm-decision').click();q.wait_for_timeout(450)
   assert q.locator('.demo-guide img').get_attribute('src').endswith('/atento.png')
   for i in [1,0,2]:
    button=q.locator(f'.scene-focus-controls [data-focus="{i}"]');button.scroll_into_view_if_needed();r=button.bounding_box();q.mouse.click(r['x']+r['width']/2,r['y']+r['height']/2);q.wait_for_timeout(120);assert q.locator(f'.scene-focus-controls [data-focus="{i}"]').get_attribute('aria-pressed')=='true'
   q.locator('.decision-explanation summary').click();decision=q.locator('.confirmed-decision').text_content();assert decision.strip().startswith('Tu decisión confirmada:')
   q.locator('.decision-explanation summary').click();q.locator('#discover-next').click();q.locator('[data-open-options]').click();assert q.locator('#scene-options').get_attribute('aria-labelledby')=='scene-options-title';q.locator('#scene-options [data-inquiry]').first.click();q.locator('[data-open-options]').click();states=q.locator('#scene-options [data-inquiry]').evaluate_all('(bs)=>bs.map(b=>({id:b.dataset.inquiry,pressed:b.getAttribute("aria-pressed"),text:b.textContent}))');assert states[0]['pressed']=='true' and 'incluido' in states[0]['text'];q.locator('[data-close-options]').click();q.locator('[data-explain]').click();assert q.locator('#scene-explanation').get_attribute('aria-labelledby')=='scene-explanation-title';q.locator('[data-close-explanation]').click();q.locator('#confirm-inquiry').click();assert q.locator('#start-evaluation').is_enabled()
   reports.append({'viewport':[width,height],'alternative':alternative,'allPointerFocuses':True,'kukyAtento':True,'confirmedDecision':decision,'applyList':states,'explanationNamed':True});c.close()
 # Horizontal form error and focus.
 c=b.new_context(viewport={'width':844,'height':390},reduced_motion='reduce');q=c.new_page();q.goto('http://127.0.0.1:4182');q.locator('#welcome-start').click();q.locator('#first-name').fill('   ');q.locator('#last-name').fill('   ');q.locator('#identity-form .primary').click();error=q.locator('#identity-error');assert error.is_visible();q.locator('#settings-toggle').focus();q.keyboard.press('Shift+Tab');q.keyboard.press('Tab');focus=q.locator('#settings-toggle').evaluate('(e)=>({outline:getComputedStyle(e).outline,boxShadow:getComputedStyle(e).boxShadow})');q.screenshot(path=str(out/'844-error-focus.png'),full_page=True);reports.append({'horizontalErrorVisible':error.text_content(),'focus':focus});c.close()
 b.close()
(out/'extra-checks.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2));print(json.dumps(reports,ensure_ascii=False))
