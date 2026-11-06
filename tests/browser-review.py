"""End-to-end review checks. Run with the app served on port 4173."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get('DECIDOBIEN_TEST_URL', 'http://127.0.0.1:4173')
SCREENSHOTS = Path(os.environ.get('DECIDOBIEN_SCREENSHOTS', '/tmp/decidobien-review'))
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=os.environ.get('DECIDOBIEN_CHROMIUM', '/usr/bin/chromium'),
        headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1365, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    errors, http_errors = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: http_errors.append(response.url) if response.status >= 400 else None)
    page.goto(BASE_URL)
    page.locator('#begin').wait_for()
    page.wait_for_function("document.querySelector('#network').textContent === 'Lista sin conexión'")
    assert page.locator('.mission-card.available').count() == 1
    assert page.locator('.mission-card.pending').count() == 5
    assert '30 min' in page.locator('.module-meta').inner_text()
    assert 'borrador' in page.locator('.draft-banner').inner_text().lower()
    page.screenshot(path=str(SCREENSHOTS / 'inicio.png'), full_page=True)
    page.locator('#begin').click()
    assert page.locator('.lesson-card').count() == 4
    assert page.locator('.flow-steps [data-go="evaluation"]').is_disabled()
    assert page.locator('.role-card').count() == 1
    page.locator('#study-next').click()
    assert page.locator('#scene-instruction').bounding_box()['y'] < page.locator('.scene').bounding_box()['y']
    page.locator('.scene-art').click(position={'x': 5, 'y': 5})
    assert 'Recibimos tu toque' in page.locator('#observation-status').inner_text()
    page.locator('.choice[data-zone="zona-c"]').click()
    assert 'acumulación' in page.locator('#observation-status').inner_text()
    page.locator('.choice[data-zone="zona-a"]').click()
    page.locator('[data-practice="alt-b"]').click()
    assert 'posible' in page.locator('.consequence-card').inner_text()
    page.reload()
    page.locator('#practice-feedback').wait_for()
    assert page.locator('[data-practice="alt-b"]').is_disabled()
    assert 'alt-b' == page.evaluate('JSON.parse(localStorage.getItem("decidobien-review-v1")).practice.selected')
    page.screenshot(path=str(SCREENSHOTS / 'practica.png'), full_page=True)
    page.locator('#practice-next').click()
    page.locator('[data-evaluation="ev1-b"]').click()
    page.reload()
    assert page.locator('[data-evaluation="ev1-b"]').is_disabled()
    assert 'Respuesta confirmada' in page.locator('[data-evaluation="ev1-b"]').inner_text()
    assert page.locator('.result').count() == 0
    page.locator('#evaluation-next').click()
    page.locator('[data-evaluation="ev2-a"]').click()
    page.locator('.learning-top [data-go="home"]').click()
    page.locator('#begin').click()
    assert 'Pregunta 2 de 3' in page.locator('.question-counter').inner_text()
    assert page.locator('[data-evaluation="ev2-a"]').is_disabled()
    page.locator('#evaluation-next').click()
    page.locator('[data-evaluation="ev3-a"]').click()
    page.locator('#evaluation-next').click()
    assert '2 de 3' in page.locator('.finish .lead').inner_text()
    assert 'no acredita aprobación' in page.locator('.finish').inner_text()
    page.reload()
    assert '2 de 3' in page.locator('.finish .lead').inner_text()
    context.set_offline(True)
    page.reload()
    assert '2 de 3' in page.locator('.finish .lead').inner_text()
    page.locator('.learning-top [data-go="review"]').click()
    assert page.locator('.validation-list > li').count() == 8
    assert page.locator('input, textarea, select').count() == 0
    assert 'no permite aprobar' in page.locator('.review-panel').inner_text()
    page.locator('[data-start="study"]').click()
    page.locator('#study-next').click()
    page.locator('#retry-practice').click()
    page.reload()
    assert page.locator('[data-practice="alt-a"]').is_enabled()
    assert page.locator('.flow-steps [data-go="summary"]').is_disabled()
    page.locator('[data-practice="alt-a"]').click()
    assert page.locator('.consequence-card').count() == 0
    for width, height in [(390, 844), (360, 800), (768, 1024)]:
        page.set_viewport_size({'width': width, 'height': height})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path=str(SCREENSHOTS / 'movil.png'), full_page=True)
    cached = page.evaluate("caches.open('decidobien-v3-correa-review').then(c => c.match('./assets/correa-revision.json')).then(Boolean)")
    assert cached
    assert not errors, errors
    assert not http_errors, http_errors
    context.close()

    # Corrupted local data and unavailable storage must not become connection errors.
    for storage_script in [
        "localStorage.setItem('decidobien-review-v1', JSON.stringify({view:'summary'}));",
        "Object.defineProperty(window, 'localStorage', {get(){throw new Error('storage denied')}});"
    ]:
        recovery = browser.new_context(viewport={'width': 390, 'height': 844})
        recovery.add_init_script(storage_script)
        recovery_page = recovery.new_page()
        recovery_page.goto(BASE_URL)
        recovery_page.locator('#begin').wait_for()
        recovery_page.locator('#begin').click()
        recovery_page.locator('#study-next').click()
        recovery_page.locator('.choice[data-zone="zona-a"]').click()
        recovery_page.locator('[data-practice="alt-a"]').click()
        assert recovery_page.locator('#practice-feedback').count() == 1
        recovery.close()
    browser.close()
    print(json.dumps({
        'sequence': 'study/practice/assessment passed',
        'confirmed_answers_and_resume': 'passed',
        'offline_review_and_images': 'passed',
        'pending_items_visible': 8,
        'mobile_and_tablet': '360/390/768 widths passed',
        'corrupt_or_unavailable_storage': 'passed',
        'browser_errors': errors, 'http_errors': http_errors
    }, ensure_ascii=False))
