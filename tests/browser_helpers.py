"""Use the existing camera projection to send real pointer events, without adding game globals."""
def scene_projection(page):
 return page.evaluate('''async()=>{const {projectTargets}=await import('./phaser-scene.js');const p=projectTargets(),r=document.querySelector('#phaser-host').getBoundingClientRect();const zoom=(p['zona-a'].x-p['zona-c'].x)/(753-117);const x=p['zona-c'].x-117*zoom,y=p['zona-c'].y-635*zoom;return {left:r.left,top:r.top,x,y,zoom,imageRight:x+941*zoom,imageBottom:y+1672*zoom,width:r.width,height:r.height,targets:p};}''')
def touch_scene(page,zone=None,point=None):
 page.locator('#phaser-host[data-ready="true"]').wait_for()
 page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))')
 p=scene_projection(page)
 if point is None:
  target=p['targets'][zone];x,y=target['x'],target['y']
 else:x,y=p['x']+point[0]*p['zoom'],p['y']+point[1]*p['zoom']
 if page.evaluate('navigator.maxTouchPoints>0'):page.touchscreen.tap(p['left']+x,p['top']+y)
 else:page.mouse.click(p['left']+x,p['top']+y)

 page.wait_for_function("()=>!document.querySelector('#app[aria-busy]')")
