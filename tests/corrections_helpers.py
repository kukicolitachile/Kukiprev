"""Independent acceptance helpers: actual input events, isolated fictitious sessions."""
import json
from pathlib import Path

KEY='decidobien-review-v1'

def read_state(page):
    page.wait_for_function("document.querySelector('#app')?.getAttribute('aria-busy')!=='true'")
    return page.evaluate('''key=>{const authority=JSON.parse(localStorage.getItem(key+':attempt-authority-v1')||'null');if(authority)return authority.state;return JSON.parse(localStorage.getItem(key)||'null')}''', KEY)

def click(page, selector):
    page.locator(selector).wait_for(state='visible')
    page.locator(selector).click(timeout=6000)
    page.wait_for_timeout(70)
    page.wait_for_function("document.querySelector('#app')?.getAttribute('aria-busy')!=='true'")

def tab_to(page, selector, limit=90):
    """Find an action through the browser tab order, never element.focus()."""
    target=page.locator(selector)
    target.wait_for(state='visible')
    for _ in range(limit):
        if target.evaluate('(e)=>e===document.activeElement'):
            return
        page.keyboard.press('Tab')
    raise AssertionError('Not reached through Tab: '+selector)

def tab_activate(page, selector):
    tab_to(page, selector)
    page.keyboard.press('Enter')
    page.wait_for_timeout(70)
    page.wait_for_function("document.querySelector('#app')?.getAttribute('aria-busy')!=='true'")

def identify(page, name='Persona QA', keyboard=False):
    act=tab_activate if keyboard else click
    if page.locator('#welcome-start').count(): act(page,'#welcome-start')
    page.locator('#first-name').wait_for()
    if keyboard:
        tab_to(page,'#first-name');page.keyboard.type(name)
        page.keyboard.press('Tab');page.keyboard.type('Ficticia')
    else:
        page.locator('#first-name').fill(name)
        page.locator('#last-name').fill('Ficticia')
    act(page,'#identity-form .primary')
    page.locator('#observe-next').wait_for()

def discover(page, keyboard=False):
    act=tab_activate if keyboard else click
    identify(page,keyboard=keyboard)
    act(page,'#observe-next')
    act(page,'[data-open-options]')
    act(page,'#scene-options [data-zone="zona-a"]')
    act(page,'#explore-next')
    act(page,'.decision-tray [data-decision="alt-a"]')
    act(page,'#confirm-decision')
    page.locator('.scene-focus-controls [data-focus="0"]').wait_for()
    page.wait_for_timeout(220)

def evaluation(page, keyboard=False):
    act=tab_activate if keyboard else click
    discover(page, keyboard)
    for i in [1,2]: act(page,f'.scene-focus-controls [data-focus="{i}"]')
    act(page,'#discover-next')
    act(page,'.inquiry-controls [data-inquiry="method"]')
    act(page,'#confirm-inquiry')
    act(page,'#start-evaluation')
    page.locator('[data-evaluation]').first.wait_for()

def center_press(page, selector):
    target=page.locator(selector)
    r=target.bounding_box()
    assert r and r['width']>0 and r['height']>0, selector
    x,y=r['x']+r['width']/2,r['y']+r['height']/2
    hit=page.evaluate('''([x,y])=>{const e=document.elementFromPoint(x,y);return {tag:e?.tagName,classes:String(e?.className||''),focus:e?.closest('[data-focus]')?.dataset.focus||null}}''',[x,y])
    if page.evaluate('navigator.maxTouchPoints>0'):page.touchscreen.tap(x,y)
    else:page.mouse.click(x,y)
    page.wait_for_timeout(180)
    return {'rect':r,'hit':hit}

def dialog_name(page):
    d=page.locator('dialog[open]')
    assert d.count()==1, 'Exactly one open dialog expected'
    result=d.evaluate('''e=>({id:e.id,label:e.getAttribute('aria-label'),labelledby:e.getAttribute('aria-labelledby'),name:e.getAttribute('aria-label')||[...(e.getAttribute('aria-labelledby')||'').split(/\\s+/)].map(id=>document.getElementById(id)?.textContent||'').join(' ').trim()})''')
    assert result['name'],result
    return result
