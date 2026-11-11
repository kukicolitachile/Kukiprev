"""A1–A5 finite independent acceptance. No data seeding, forced clicks or programmatic focus.
Usage: python3 tests/acceptance-corrections.py --url http://127.0.0.1:4173 --out DIR
Use --baseline against an archived 0def89f fixture: expected failures are recorded, not passes.
"""
import argparse,json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
from corrections_helpers import read_state,click,tab_to,tab_activate,identify,discover,evaluation,center_press,dialog_name

def contrast(a,b):
    import re
    def lum(value):
        rgb=[float(v)/255 for v in re.findall(r'[0-9.]+',value)[:3]]
        return sum(k*(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4) for k,v in zip([.2126,.7152,.0722],rgb))
    x,y=lum(a),lum(b);return (max(x,y)+.05)/(min(x,y)+.05)

parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:4173');parser.add_argument('--out',default='/workspace/entrega-correctiva/qa/candidate');parser.add_argument('--baseline',action='store_true');parser.add_argument('--only',action='append',help='Run one named case; repeat for several');args=parser.parse_args()
OUT=Path(args.out);OUT.mkdir(parents=True,exist_ok=True)
REPORT={'url':args.url,'baseline':args.baseline,'scope':'Chromium automated, isolated contexts, fictitious names; no human, physical device or Safari validation','cases':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    def context(width=390,height=844):
        c=browser.new_context(viewport={'width':width,'height':height},has_touch=width<600,reduced_motion='reduce');q=c.new_page();q.set_default_timeout(7000);q.goto(args.url);q.locator('#welcome-start').wait_for();return c,q
    c,q=context();REPORT['runtime']=q.evaluate('async()=>await(await fetch("/__runtime.json")).json()');c.close()
    def case(name,fn,width=390,height=844):
        if args.only and name not in args.only:return
        c,q=context(width,height);row={'id':name,'viewport':[width,height]}
        try:
            row['evidence']=fn(c,q) or {};row['status']='pass'
        except Exception as e:
            row.update(status='fail',error=str(e),trace=traceback.format_exc(limit=2))
        finally:
            try:q.screenshot(path=str(OUT/(name+'.png')),full_page=True)
            except Exception:pass
            REPORT['cases'].append(row);c.close();(OUT/'checks.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2));print(name,row['status'],flush=True)
    def name_preserved(c,q):
        click(q,'#welcome-start');q.locator('#first-name').fill('Persona QA parcial');q.locator('#last-name').fill('Ficticia parcial')
        before=[q.locator(x).input_value() for x in ['#first-name','#last-name']]
        click(q,'#settings-toggle');click(q,'#motion-toggle');click(q,'#experience-settings .primary')
        after=[q.locator(x).input_value() for x in ['#first-name','#last-name']]
        assert before==after,{'before':before,'after':after}
        storage=q.evaluate('JSON.stringify(localStorage)');assert 'Persona QA parcial' not in storage
        return {'before':before,'after':after,'name_absent_localStorage':True}
    case('UX01-partial-name-settings',name_preserved)
    def focis(c,q):
        discover(q);events=[]
        for i in [1,0,2,1,2,0]:
            event=center_press(q,f'.scene-focus-controls [data-focus="{i}"]');event['wanted']=i;event['actual']=read_state(q)['journey']['focus'];events.append(event)
            assert event['hit']['focus']==str(i) and event['actual']==i,events
        click(q,'.demo-response details summary');assert all(item.is_visible() for item in q.locator('.demo-response details[open] p').all())
        return {'input':'physical center pointer/touch, no force','events':events}
    case('JG01-all-foci-1366',focis,1366,768);case('JG01-all-foci-390',focis)
    def stale_close(c,a):
        identify(a,'Persona QA A');click(a,'#observe-next');click(a,'[data-open-options]');click(a,'#scene-options [data-zone="zona-c"]');previous=read_state(a);before=previous['practice']['attempts']
        t=c.new_page();t.goto(args.url);t.wait_for_timeout(150)
        if t.locator('#attempt-guard').count():click(t,'#takeover-attempt')
        else:
            if t.locator('#welcome-start').count():click(t,'#welcome-start')
            if t.locator('#identity-form').count():
                t.locator('#first-name').fill('Persona QA B');t.locator('#last-name').fill('Ficticia');click(t,'#identity-form .primary')
        click(t,'#settings-toggle');click(t,'#close-journey');dialog_name(t);click(t,'#clear-progress');t.locator('#welcome-start').wait_for();cleared=read_state(t)
        # Dispatch real stale interaction only if the application still exposes it.
        a.bring_to_front();a.wait_for_timeout(250)
        if a.locator('#hint').count():click(a,'#hint')
        after=read_state(a)
        assert not after or after['practice']['attempts']==0,{'before':before,'cleared':cleared,'after_stale':after}
        assert a.locator('#attempt-guard[data-reason="closed"]').is_visible(), 'Closed copy must be explicitly invalidated'
        assert not a.evaluate('sessionStorage.getItem("decidobien-participant-v1")'),'Old identity remains after close'
        authority_before=a.evaluate('localStorage.getItem("decidobien-review-v1:attempt-authority-v1")')
        a.evaluate('value=>localStorage.setItem("decidobien-review-v1",JSON.stringify(value))',previous);a.wait_for_timeout(150)
        authority_after=a.evaluate('localStorage.getItem("decidobien-review-v1:attempt-authority-v1")');assert authority_before==authority_after and json.loads(authority_after)['status']=='closed'
        assert read_state(a)['practice']['attempts']==0
        return {'attempts_before':before,'cleared':cleared,'after_stale':after,'guard':'closed','simulated_legacy_KEY_write_ignored_by_authority':True,'legacy_limit':'No claim that old bundles can display guards they never implemented'}
    case('SG01-AR01-stale-close',stale_close)
    if not args.baseline:
        def ownership(c,a):
            identify(a,'Persona QA A');click(a,'#observe-next');click(a,'[data-open-options]');click(a,'#scene-options [data-zone="zona-c"]');old=read_state(a)
            t=c.new_page();t.goto(args.url);t.locator('#attempt-guard').wait_for();assert t.locator('#attempt-guard').get_attribute('data-reason') in ['other-tab','resume'];assert read_state(t)==old
            assert 'Continuar aquí' in t.locator('#takeover-attempt').inner_text();click(t,'#takeover-attempt');a.wait_for_timeout(200);assert a.locator('#attempt-guard').is_visible()
            if t.locator('#identity-form').count():
                t.locator('#first-name').fill('Persona QA A');t.locator('#last-name').fill('Ficticia');click(t,'#identity-form .primary')
            click(t,'#hint');latest=read_state(t);assert latest['journey']['hint']
            a.bring_to_front();a.wait_for_timeout(150);assert read_state(a)==latest
            if a.locator('#attempt-guard[data-reason="stale"]').count():
                assert a.locator('#takeover-attempt').is_visible();click(a,'#takeover-attempt');assert read_state(a)['journey']['hint']
            # New identity is explicit and confirms a clean attempt, not a silent rename.
            active=a if a.locator('#hint').count() else t
            if not active.locator('#new-person-attempt').count():
                other=c.new_page();other.goto(args.url);active=other
            click(active,'#new-person-attempt');dialog_name(active);assert read_state(active)['practice']['attempts']==1
            click(active,'#confirm-new-person');active.locator('#identity-form').wait_for();active.locator('#first-name').fill('Persona QA Nueva');active.locator('#last-name').fill('Ficticia');click(active,'#identity-form .primary')
            new=read_state(active);assert new['practice']['attempts']==0 and new['evaluation']['answers']=={} and new['journey']['stage']=='observe'
            assert 'Persona QA A' not in active.evaluate('JSON.stringify(localStorage)')
            return {'owner_transfer':True,'latest_preserved':latest,'new_person_fresh':new}
        case('A1-owner-transfer-new-person',ownership)
        def accessibility(c,q):
            tab_to(q,'#settings-toggle');focus=q.locator('#settings-toggle').evaluate('''e=>{const s=getComputedStyle(e);return {outline:s.outlineColor,width:s.outlineWidth,background:s.backgroundColor,header:getComputedStyle(document.querySelector('header')).backgroundImage}}''');assert float(focus['width'].replace('px',''))>=2 and contrast(focus['outline'],focus['background'])>=3,focus;tab_activate(q,'#settings-toggle');settings=dialog_name(q);click(q,'#experience-settings .primary')
            identify(q);click(q,'#observe-next');click(q,'[data-open-options]');scene=dialog_name(q);choices=q.locator('#scene-options').inner_text();click(q,'#scene-options [data-zone="zona-c"]')
            click(q,'[data-open-options]');chosen=q.locator('#scene-options [data-zone="zona-c"]');assert chosen.get_attribute('aria-pressed')=='true' or 'explor' in (chosen.get_attribute('aria-label') or chosen.inner_text()).lower();click(q,'[data-close-options]')
            desc=q.locator('[id*="description"], [id*="descripcion"]').all_text_contents();assert desc,'Neutral scene description missing'
            assert not any('zona-a' in text for text in desc)
            click(q,'[data-open-options]');click(q,'#scene-options [data-zone="zona-a"]');click(q,'#explore-next');click(q,'.decision-tray [data-decision="alt-a"]');click(q,'#confirm-decision')
            for i in [1,2]:center_press(q,f'.scene-focus-controls [data-focus="{i}"]')
            click(q,'[data-open-options]');focus_states=[]
            for i in [0,1,2]:
                item=q.locator(f'#scene-options [data-focus="{i}"]');label=item.get_attribute('aria-label') or item.inner_text();pressed=item.get_attribute('aria-pressed');assert pressed==str(i==2).lower() and 'explorado' in label,{'focus':i,'label':label,'pressed':pressed};focus_states.append({'focus':i,'label':label,'pressed':pressed})
            click(q,'[data-close-options]');click(q,'#discover-next');click(q,'.inquiry-controls [data-inquiry="method"]');click(q,'[data-open-options]');item=q.locator('#scene-options [data-inquiry="method"]');assert item.get_attribute('aria-pressed')=='true' and 'incluido' in item.inner_text();click(q,'[data-close-options]');click(q,'[data-explain]');explanation=dialog_name(q);click(q,'[data-close-explanation]')
            return {'settings_dialog':settings,'scene_dialog':scene,'explanation_dialog':explanation,'equivalent_choices':choices,'discover_states':focus_states,'apply_included':True,'description':desc,'focus_style':focus}
        case('AC-dialogs-state-description',accessibility,1366,768)
        def whitespace(c,q):
            click(q,'#welcome-start');q.locator('#first-name').fill('   ');q.locator('#last-name').fill('   ');click(q,'#identity-form .primary');error=q.locator('#identity-error');assert error.is_visible() and error.inner_text().strip()
            for key in ['#first-name','#last-name']:
                assert q.locator(key).get_attribute('aria-invalid')=='true';assert 'identity-error' in (q.locator(key).get_attribute('aria-describedby') or '')
            r=error.bounding_box();assert r and r['height']>0 and r['y']>=0 and r['y']+r['height']<=390,r
            return {'error':error.inner_text(),'rect':r,'associated_both_fields':True}
        case('AC-844-horizontal-whitespace',whitespace,844,390)
        def narrow(c,q):
            assert not q.evaluate('document.documentElement.scrollWidth>innerWidth');r=q.locator('#settings-toggle').bounding_box();assert r['x']>=0 and r['x']+r['width']<=320,r
            click(q,'#settings-toggle');dialog_name(q);assert not q.evaluate('document.documentElement.scrollWidth>innerWidth')
            return {'settings_rect':r,'no_horizontal_overflow':True}
        case('AC-320-header',narrow,320,640)
        def detail_geometry(c,q):
            identify(q);q.wait_for_timeout(100)
            assert q.locator('#phaser-host').get_attribute('data-detail-rect') in ['null',None]
            click(q,'#observe-next');q.wait_for_timeout(160)
            full=q.evaluate('''async()=>{const {projectScenePoint}=await import('./phaser-scene.js');const h=document.querySelector('#phaser-host').getBoundingClientRect(),r=document.querySelector('.scene-window').getBoundingClientRect(),a=projectScenePoint(0,0),b=projectScenePoint(941,1672);return {window:{x:r.x,y:r.y,right:r.right,bottom:r.bottom},image:{x:h.x+a.x,y:h.y+a.y,right:h.x+b.x,bottom:h.y+b.y}}}''');a=full['image'];b=full['window'];assert a['x']>=b['x']-1 and a['y']>=b['y']-1 and a['right']<=b['right']+1 and a['bottom']<=b['bottom']+1,full
            assert q.locator('.scene-focus,[data-camera-zone]').count()==0 and q.locator('#phaser-host').get_attribute('data-detail-rect') in ['null',None],'Premature target marker/detail'
            q.screenshot(path=str(OUT/('explore-full-'+str(q.viewport_size['width'])+'.png')))
            click(q,'[data-open-options]');click(q,'#scene-options [data-zone="zona-c"]');assert not read_state(q)['practice']['found'];assert q.locator('#phaser-host').get_attribute('data-detail-rect') in ['null',None]
            click(q,'[data-open-options]');click(q,'#scene-options [data-zone="zona-a"]');q.wait_for_timeout(220)
            rect=q.locator('#phaser-host').get_attribute('data-detail-rect');assert rect and rect!='null','Expected visible detail viewport after finding zone'
            r=json.loads(rect);host=q.locator('#phaser-host').bounding_box();r.update(x=r['x']+host['x'],y=r['y']+host['y']);overlaps=[]
            for selector in ['#mission-title','.flow-location','.demo-guide','.demo-bottom','.camera-tools']:
                a=q.locator(selector).bounding_box()
                area=max(0,min(r['x']+r['width'],a['x']+a['width'])-max(r['x'],a['x']))*max(0,min(r['y']+r['height'],a['y']+a['height'])-max(r['y'],a['y']))
                overlaps.append({'selector':selector,'area':area});assert area<1,{'detail':r,'obstruction':selector,'overlap_area':area}
            initial_rect=dict(r);scroll_before=q.evaluate('scrollY')
            if r['y']+r['height']>q.viewport_size['height']:
                # The approved layout uses document scroll, not a clipped internal text scroller.
                response=q.locator('.demo-response').bounding_box();q.mouse.move(response['x']+response['width']/2,min(response['y']+response['height']/2,q.viewport_size['height']-20));q.mouse.wheel(0,r['y']+r['height']-q.viewport_size['height']+16);q.wait_for_timeout(180)
                host_after=q.locator('#phaser-host').bounding_box();r.update(x=r['x']+host_after['x']-host['x'],y=r['y']+host_after['y']-host['y'])
                assert q.evaluate('scrollY')>scroll_before,'Detail below fold must be reachable with document wheel scrolling'
            assert r['x']>=0 and r['y']>=0 and r['x']+r['width']<=q.viewport_size['width'] and r['y']+r['height']<=q.viewport_size['height'],r
            assert q.locator('.demo-response').evaluate('e=>e.scrollHeight<=e.clientHeight+1'),'Hidden internal response scroll'
            scroll_after=q.evaluate('scrollY');q.screenshot(path=str(OUT/('detail-reachable-'+str(q.viewport_size['width'])+'.png')));cta=center_press(q,'#explore-next');assert read_state(q)['journey']['stage']=='decide'
            return {'full_image_before_finding':full,'no_DOM_target_markers_before_attempt':True,'no_detail_before_finding':True,'initial_detail_rect':initial_rect,'reachable_detail_rect':r,'document_scroll':scroll_after,'intersections':overlaps,'no_internal_response_scroll':True,'CTA_center_reached':cta}
        case('A2-detail-390',detail_geometry)
        case('A2-detail-1366',detail_geometry,1366,768)
        case('A2-detail-844-horizontal',detail_geometry,844,390)
        def decide_rotation(c,q):
            identify(q);click(q,'#observe-next');click(q,'[data-open-options]');click(q,'#scene-options [data-zone="zona-a"]');click(q,'#explore-next')
            assert read_state(q)['journey']['stage']=='decide';q.set_viewport_size({'width':844,'height':390});q.wait_for_timeout(240)
            assert q.evaluate('scrollY')==0,'Rotation must expose the four decision actions without scrolling'
            measurements=[]
            for selector in ['.decision-tray [data-decision="alt-a"]','.decision-tray [data-decision="alt-b"]','.decision-tray [data-decision="alt-c"]','#confirm-decision']:
                item=q.locator(selector);r=item.bounding_box();hit=item.evaluate('''e=>{const r=e.getBoundingClientRect(),n=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {own:e===n||e.contains(n),id:n?.closest('button')?.id||null,decision:n?.closest('button')?.dataset.decision||null}}''')
                measurements.append({'selector':selector,'rect':r,'center_hit':hit});assert r['width']>=44 and r['height']>=44 and r['x']>=0 and r['y']>=0 and r['x']+r['width']<=844 and r['y']+r['height']<=390 and hit['own'],measurements
            q.screenshot(path=str(OUT/'decide-after-rotation-844.png'));selected=center_press(q,'.decision-tray [data-decision="alt-a"]');assert read_state(q)['journey']['pending']=='alt-a';assert q.evaluate('scrollY')==0
            confirmed=center_press(q,'#confirm-decision');assert read_state(q)['journey']['stage']=='discover'
            return {'rotation':[[390,844],[844,390]],'no_scroll':True,'four_actions':measurements,'physical_selection':selected,'physical_confirmation':confirmed}
        case('A2-decide-rotation-844',decide_rotation)
        def decide_phone(c,q):
            identify(q);click(q,'#observe-next');click(q,'[data-open-options]');click(q,'#scene-options [data-zone="zona-a"]');click(q,'#explore-next');q.wait_for_timeout(180)
            assert read_state(q)['journey']['stage']=='decide' and q.evaluate('scrollY')==0
            face=q.locator('#phaser-host').evaluate('''e=>{const r=e.getBoundingClientRect(),s=JSON.parse(e.dataset.portrait),f={x:r.x+s.face.x,y:r.y+s.face.y,width:s.face.width,height:s.face.height};const overlaps=[];for(const selector of ['header','#mission-title','.demo-guide','.demo-bottom']){const b=document.querySelector(selector).getBoundingClientRect();if(f.x<b.right&&f.x+f.width>b.left&&f.y<b.bottom&&f.y+f.height>b.top)overlaps.push(selector)}return {rect:f,scale:s.scale,overlaps}}''');f=face['rect'];assert face['overlaps']==[] and face['scale']<=1.65 and f['x']>=0 and f['y']>=0 and f['x']+f['width']<=360 and f['y']+f['height']<=640,face
            measurements=[]
            for selector in ['.decision-tray [data-decision="alt-a"]','.decision-tray [data-decision="alt-b"]','.decision-tray [data-decision="alt-c"]','#confirm-decision']:
                item=q.locator(selector);r=item.bounding_box();own=item.evaluate('''e=>{const r=e.getBoundingClientRect(),n=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===n||e.contains(n)}''');measurements.append({'selector':selector,'rect':r,'center_hit_own':own});assert r['width']>=44 and r['height']>=44 and r['x']>=0 and r['y']>=0 and r['x']+r['width']<=360 and r['y']+r['height']<=640 and own,measurements
            assert not q.evaluate('document.documentElement.scrollWidth>innerWidth');q.screenshot(path=str(OUT/'decide-phone-360x640.png'));selected=center_press(q,'.decision-tray [data-decision="alt-a"]');assert read_state(q)['journey']['pending']=='alt-a' and q.evaluate('scrollY')==0
            confirmed=center_press(q,'#confirm-decision');assert read_state(q)['journey']['stage']=='discover'
            return {'viewport':[360,640],'no_scroll':True,'face':face,'four_actions':measurements,'physical_selection':selected,'physical_confirmation':confirmed}
        case('A2-decide-phone-360',decide_phone,360,640)
        def assessment(c,q):
            evaluation(q,keyboard=True);snapshots=[];tab_activate(q,'#exit-evaluation');exit_dialog=dialog_name(q);tab_activate(q,'#stay')
            for answer in ['ev1-b','ev2-b','ev3-c']:
                assert q.locator('.decision-tray,.scene-focus,#hint').count()==0
                tab_activate(q,f'[data-evaluation="{answer}"]');assert q.locator('#evaluation-confirm').is_enabled();assert not read_state(q)['evaluation']['answers'].get({'ev1-b':'eval-condiciones','ev2-b':'eval-comunicacion','ev3-c':'eval-proceso'}[answer])
                tab_activate(q,'#evaluation-confirm');body=q.locator('#app').inner_text().lower();assert 'para revisar:' not in body and 'coinciden' not in body and 'respuesta correcta' not in body
                confirmed=read_state(q)['evaluation']['answers'];snapshots.append(confirmed)
                q.reload();q.locator('#evaluation-next').wait_for();assert read_state(q)['evaluation']['answers']==confirmed
                tab_activate(q,'#evaluation-next')
            assert '0 de 3' in q.locator('.compact-summary').inner_text();assert 'No acredita aprobación ni asistencia' in q.locator('.compact-summary').inner_text();assert q.locator('.result-finish .primary').is_enabled()
            click(q,'#result-certificate summary');assert q.locator('.certificate-panel .primary').is_disabled();click(q,'#result-answers>summary');click(q,'#retry-evaluation');retry_dialog=dialog_name(q);click(q,'#cancel-retry');q.wait_for_function('navigator.serviceWorker.controller!==null');c.set_offline(True);q.reload();q.locator('.compact-summary').wait_for();assert read_state(q)['evaluation']['answers']==snapshots[-1]

            if q.locator('#result-certificate').get_attribute('open') is None:click(q,'#result-certificate summary')
            assert 'no sincroniza' in q.locator('#certificate-status').inner_text().lower();c.set_offline(False);q.reload();q.locator('.compact-summary').wait_for();assert read_state(q)['evaluation']['answers']==snapshots[-1]
            return {'input':'real Tab and Enter route','confirmed_answers':snapshots,'zero_of_three_completes_without_approval':True,'offline_reload_and_online_recovery':True,'exit_dialog':exit_dialog,'retry_dialog':retry_dialog}
        case('A3-evaluation-zero-offline-keyboard',assessment,1366,768)
    browser.close()
REPORT['passed']=sum(c['status']=='pass' for c in REPORT['cases']);REPORT['failed']=sum(c['status']=='fail' for c in REPORT['cases']);(OUT/'checks.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2));print(json.dumps({'passed':REPORT['passed'],'failed':REPORT['failed'],'output':str(OUT/'checks.json')}))
raise SystemExit(0 if args.baseline else bool(REPORT['failed']))
