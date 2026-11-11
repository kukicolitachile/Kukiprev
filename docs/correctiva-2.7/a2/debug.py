from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);q=b.new_page();q.on('pageerror',lambda e:print('ERROR',e));q.on('console',lambda e:print('CONSOLE',e.text));q.goto('http://127.0.0.1:4182');q.wait_for_timeout(1500);print(q.locator('body').inner_text());q.screenshot(path='/workspace/entrega-correctiva/a2/debug.png');b.close()
