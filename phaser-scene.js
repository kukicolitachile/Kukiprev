import {WORLD,LAYERS,splitArtwork,decisionBackdrop} from './scene-layers.js';
let game=null,plant=null,foreground=null,host=null,current=null,resizeObserver=null,ready=false,readyPromise=null,frameReady=false;
let actionCallback=()=>{},debugSnapshot='',cameraKey='',cameraMode='',feedbackKey='',mainCameraKey='';
const targets={
 'zona-a':{x:753,y:1178,width:301,height:251},
 'zona-b':{x:376,y:828,width:339,height:184},
 'zona-c':{x:117,y:635,width:235,height:167}
};
function instant(){return current?.reduced===true;}
function compactLandscape(){return matchMedia('(orientation:landscape) and (max-height:600px)').matches;}
// Fit the upper-body shot to its available height. Width must never enlarge it past that limit.
export function portraitLayout(width,height,{compact=false,captionBottom=144}={}){
 const regionWidth=compact?width*.56:width;
 const reserved=compact?24:234;
 const scale=Math.min(regionWidth*.94/243,Math.max(80,height-reserved)/400,1.65);
 const x=regionWidth*.57-243*scale/2;
 const y=compact?12:Math.max(12,captionBottom+12-95*scale);
 return {x,y,scale,face:{x:x+60*scale,y:y+95*scale,width:120*scale,height:85*scale}};
}
// Measure the region left by the actual flow, heading, guide and action dock.
// The window is a normal grid item, so expanded explanations grow the page, never cover the camera.
function sceneBounds(){
 const base=host.getBoundingClientRect(),windowRect=host.parentElement?.querySelector('.scene-window')?.getBoundingClientRect();
 if(windowRect)return {x:windowRect.left-base.left,y:windowRect.top-base.top,width:windowRect.width,height:windowRect.height};
 const landscape=compactLandscape();return {x:0,y:0,width:landscape?base.width*.56:base.width,height:Math.max(190,base.height-(landscape?70:130))};
}
function observeLayout(){
 resizeObserver?.disconnect();
 if(!resizeObserver||!host)return;
 resizeObserver.observe(host);
 for(const element of host.parentElement.querySelectorAll('.scene-window,.scene-flow,h1,.demo-guide,.demo-bottom'))resizeObserver.observe(element);
}
function updateDebug(){
 if(!host||!plant)return;
 const c=plant.cameras.main;
 host.dataset.ready=String(ready&&frameReady);host.dataset.mode=current.mode;host.dataset.zoom=String(plant.detailCamera?.visible?plant.detailCamera.zoom:c.zoom);host.classList.toggle('detail-open',Boolean(plant.detailCamera?.visible));host.dataset.focus=current.focus||'general';host.dataset.layers='fondo,correa,cajas,operaria';
 if(['localhost','127.0.0.1','[::1]'].includes(location.hostname))host.dataset.detailRect=JSON.stringify(plant.detailRect);

 const snapshot=[c.x,c.y,c.width,c.height,JSON.stringify(plant.detailRect),c.zoom,c.worldView.x,c.worldView.y,host.dataset.zoom,current.mode,current.focus].join(':');
 if(snapshot!==debugSnapshot){debugSnapshot=snapshot;host.dispatchEvent(new CustomEvent('scene:camera',{bubbles:true}));}
}
function viewFor(id){
 const c=plant.cameras.main,w=c.width,h=c.height;
 if(!id)return current.mode==='explore'?{x:WORLD.width/2,y:WORLD.height/2,zoom:Math.min(w/WORLD.width,h/WORLD.height)}:{x:470.5,y:840,zoom:Math.min(w/941,h/1120)};
 const t=targets[id];return {x:t.x,y:t.y,zoom:Math.min(w/(t.width*1.7),h/(t.height*2.1),1.8)};
}
function aim(id){
 if(!plant||!ready)return;
 const c=plant.cameras.main,view=viewFor(null);
 const key=[current.mode,id,current.found,c.x,c.y,c.width,c.height,instant()].join(':');
 if(key===cameraKey){foreground?.layout(host.clientWidth,host.clientHeight,current.mode==='decide');updateDebug();return;}
 const from=cameraMode,first=!cameraKey;cameraKey=key;cameraMode=current.mode;
 const mainKey=[current.mode,c.x,c.y,c.width,c.height,instant()].join(':');
 if(mainKey!==mainCameraKey){
  mainCameraKey=mainKey;c.panEffect.reset();c.zoomEffect.reset();
  if(!instant()&&!first&&from!==current.mode&&['decide','discover'].includes(current.mode)){
   c.pan(view.x,view.y,320,'Cubic.easeInOut');c.zoomTo(view.zoom,320,'Cubic.easeInOut');
  }else{c.setZoom(view.zoom);c.centerOn(view.x,view.y);}
 }
 const detail=plant.detailCamera,show=current.mode==='explore'&&current.found&&id==='zona-a';
 detail.visible=show;
 if(show){
  const area=sceneBounds(),margin=12;
  const rect={x:area.x+margin,y:area.y+margin,width:Math.max(1,area.width-2*margin),height:Math.max(1,Math.min(area.height-2*margin,250))};
  detail.setViewport(rect.x,rect.y,rect.width,rect.height);const t=targets[id];
  const zoom=Math.min(rect.width/(t.width*1.3),rect.height/(t.height*1.5),2.2);
  detail.panEffect.reset();detail.zoomEffect.reset();
  if(instant()){detail.setZoom(zoom);detail.centerOn(t.x,t.y);}else{detail.setZoom(view.zoom);detail.centerOn(t.x,t.y);detail.zoomTo(zoom,360,'Cubic.easeInOut');}
  plant.detailRect=rect;
 }else plant.detailRect=null;
 if(current.mode==='discover'&&id){const t=targets[id];plant.explainTarget=t;}else plant.explainTarget=null;
 foreground?.layout(host.clientWidth,host.clientHeight,current.mode==='decide');updateDebug();
}
function layout(){
 if(!game||!plant||!host)return;
 const {width,height}=host.getBoundingClientRect();if(game.scale.width!==Math.round(width)||game.scale.height!==Math.round(height))game.scale.resize(Math.round(width),Math.round(height));
 const decision=current.mode==='decide';
 plant.operator?.setVisible(!decision);plant.reverseShot?.setVisible(decision);
 const area=sceneBounds();
 plant.cameras.main.setViewport(area.x,area.y,area.width,area.height);
 aim(current.focus);
 foreground?.layout(width,height,decision);
 const key=[current.mode,current.focus,current.touchSequence].join(':');
 if(key!==feedbackKey||instant()){
  feedbackKey=key;plant.tweens.killTweensOf(plant.mark);plant.tweens.killTweensOf(plant);plant.mark.setAlpha(1);plant.touchRadius=6;
  if(!instant()&&current.mode==='discover'){plant.mark.setAlpha(.3);plant.tweens.add({targets:plant.mark,alpha:1,duration:210,ease:'Cubic.easeOut'});}
  if(!instant()&&['home','explore'].includes(current.mode)&&current.lastTouch){plant.touchRadius=12;plant.tweens.add({targets:plant,touchRadius:6,duration:190,ease:'Cubic.easeOut'});}
 }
}
export async function mountScene(element,settings,onAction){
 host=element;current=settings;actionCallback=onAction;
 if(game){element.append(game.canvas);debugSnapshot='';observeLayout();game.scale.parent=element;game.scale.updateBounds();layout();return readyPromise;}
 if(!window.Phaser)throw new Error('phaser-not-loaded');
 const P=window.Phaser;
 readyPromise=new Promise((resolve,reject)=>{
 class Plant extends P.Scene{
  constructor(){super('Plant');}
  preload(){this.load.image('original','./assets/escenas/esc-01-base.webp');this.load.on('loaderror',()=>reject(Error('scene-image-unavailable')));}
  create(){
   plant=this;if(!this.textures.exists('original')){reject(Error('scene-image-unavailable'));return;}const source=this.textures.get('original').getSourceImage();if(source.width!==WORLD.width||source.height!==WORLD.height){reject(Error('scene-size-mismatch'));return;}
   const layers=splitArtwork(source);
   for(const {id,canvas,x,y} of layers){this.textures.addCanvas(id,canvas);const sprite=this.add.image(x,y,id).setOrigin(0);if(id==='operaria')this.operator=sprite;}
   this.textures.addCanvas('reverse-shot',decisionBackdrop(source));this.reverseShot=this.add.image(0,0,'reverse-shot').setOrigin(0).setVisible(false);
   this.mark=this.add.graphics();this.touchRadius=6;this.detailCamera=this.cameras.add(0,0,100,100);this.detailCamera.visible=false;
   this.input.on('pointerup',pointer=>{
    if(!['home','explore'].includes(current.mode))return;
    const d=this.detailCamera,inside=d.visible&&pointer.x>=d.x&&pointer.x<=d.x+d.width&&pointer.y>=d.y&&pointer.y<=d.y+d.height;
    const camera=inside?d:this.cameras.main;
    if(pointer.x<camera.x||pointer.y<camera.y||pointer.x>camera.x+camera.width||pointer.y>camera.y+camera.height)return;
    const p=camera.getWorldPoint(pointer.x,pointer.y);if(p.x<0||p.y<0||p.x>WORLD.width||p.y>WORLD.height)return;
    if(current.mode==='home'){actionCallback('welcome',{x:p.x,y:p.y});return;}
    // Keep c4aa98c's detector and tolerance; this correction changes guidance, not the answer map.
    const hit=Object.entries(targets).find(([,t])=>Math.abs(p.x-t.x)<=t.width/2+24&&Math.abs(p.y-t.y)<=t.height/2+24);
    actionCallback(hit?.[0]||null,{x:p.x,y:p.y});
   });
   this.events.on('postupdate',()=>this.drawMarks());
   this.sys.game.events.on('postrender',()=>{frameReady=true;updateDebug();});
   this.sys.game.events.once('postrender',resolve);
   ready=true;this.scene.launch('Foreground');layout();
  }
  drawMarks(){
   this.mark.clear();if(current.mode==='discover'&&plant.explainTarget){const t=plant.explainTarget;this.mark.lineStyle(6,0xffca30,.95);this.mark.strokeRoundedRect(t.x-t.width/2,t.y-t.height/2,t.width,t.height,10);return;}if(!['home','explore'].includes(current.mode))return;
   if(current.lastTouch){const p=current.lastTouch,size=this.touchRadius/this.cameras.main.zoom;this.mark.lineStyle(2/this.cameras.main.zoom,0xf2fff9,1);this.mark.strokeCircle(p.x,p.y,size);}
   if(current.mode==='explore'&&current.found&&current.focus==='zona-a'){const t=targets['zona-a'];this.mark.lineStyle(5,0xffca36,1);this.mark.strokeRoundedRect(t.x-t.width/2,t.y-t.height/2,t.width,t.height,8);}
  }
 }
 class Foreground extends P.Scene{
  constructor(){super('Foreground');}
  create(){foreground=this;this.edge=this.add.graphics();this.portrait=this.add.image(0,0,'operaria').setOrigin(0);this.layout(host.clientWidth,host.clientHeight,current.mode==='decide');}
  layout(w,h,decision){
   if(!this.portrait)return;
   const area=sceneBounds();
   this.cameras.main.setViewport(decision?area.x:0,decision?area.y:0,decision?area.width:w,decision?area.height:h).setScroll(decision?area.x:0,decision?area.y:0);
   const entering=decision&&!this.wasDecision;this.wasDecision=decision;
   if(instant()||!decision){this.tweens.killTweensOf([this.portrait,this.edge]);this.portrait.setAlpha(1);this.edge.setAlpha(1);}
   if(entering&&!instant()){this.portrait.setAlpha(0);this.edge.setAlpha(0);this.tweens.add({targets:[this.portrait,this.edge],alpha:1,duration:280,ease:'Cubic.easeOut'});}
   this.portrait.setVisible(decision);this.edge.clear();if(!decision){if(plant?.detailRect){const r=plant.detailRect;this.edge.lineStyle(7,0x062a36,1);this.edge.strokeRoundedRect(r.x-5,r.y-5,r.width+10,r.height+10,17);this.edge.lineStyle(4,0xffca30,1);this.edge.strokeRoundedRect(r.x-2,r.y-2,r.width+4,r.height+4,14);this.edge.lineStyle(3,0xf0fff8,1);const l=19;for(const [x,y,sx,sy] of [[r.x+12,r.y+12,1,1],[r.x+r.width-12,r.y+12,-1,1],[r.x+12,r.y+r.height-12,1,-1],[r.x+r.width-12,r.y+r.height-12,-1,-1]]){this.edge.beginPath();this.edge.moveTo(x,y+sy*l);this.edge.lineTo(x,y);this.edge.lineTo(x+sx*l,y);this.edge.strokePath();}}return;}
   // Comic foreground is a change of shot, not an action by the operator.
   const shot=portraitLayout(area.width,area.height,{compact:true});
   const centerOffset=area.width*.57*.44;
   shot.x+=area.x+centerOffset;shot.y+=area.y;shot.face.x+=area.x+centerOffset;shot.face.y+=area.y;
   const {scale,x:px,y:py}=shot;host.dataset.portrait=JSON.stringify(shot);
   this.edge.lineStyle(6,0x032431,1);this.edge.beginPath();
   LAYERS[3].polygon.forEach(([x,y],i)=>{const xx=px+(x-654)*scale,yy=py+(y-321)*scale;i?this.edge.lineTo(xx,yy):this.edge.moveTo(xx,yy);});this.edge.closePath();this.edge.strokePath();
   this.portrait.setScale(scale).setPosition(px,py);
   this.edge.lineStyle(4,0xd9fff7,.9);this.edge.beginPath();this.edge.moveTo(0,40);this.edge.lineTo(w*.13,72);this.edge.lineTo(w*.23,43);this.edge.strokePath();
  }
 }
 game=new P.Game({type:P.CANVAS,parent:element,backgroundColor:'#062c3a',width:element.clientWidth,height:element.clientHeight,antialias:true,audio:{noAudio:true},loader:{imageLoadType:'HTMLImageElement'},banner:false,scene:[Plant,Foreground],scale:{mode:P.Scale.NONE},fps:{target:30,forceSetTimeOut:true},render:{pixelArt:false}});
 game.events.once('destroy',()=>{ready=false;});
 });
 resizeObserver=new ResizeObserver(()=>layout());observeLayout();
 return readyPromise;
}
export function updateScene(settings,onAction){current=settings;actionCallback=onAction;layout();}
export function unmountScene(){resizeObserver?.disconnect();resizeObserver=null;if(game){game.destroy(true);game=null;}plant=foreground=host=null;ready=false;frameReady=false;readyPromise=null;cameraKey=cameraMode=feedbackKey=mainCameraKey='';}
export function pauseScene(){game?.loop.sleep();}
export function layerEvidence(){return {layers:LAYERS.map(l=>l.id),targets};}

export function projectTargets(){if(!plant||!ready)return {};const c=plant.cameras.main;return Object.fromEntries(Object.entries(targets).map(([id,t])=>[id,{x:(t.x-c.worldView.x)*c.zoom+c.x,y:(t.y-c.worldView.y)*c.zoom+c.y}]));}
export function resumeScene(){game?.loop.wake();}

export function projectScenePoint(x,y){if(!plant||!ready)return null;const c=plant.cameras.main;return {x:(x-c.worldView.x)*c.zoom+c.x,y:(y-c.worldView.y)*c.zoom+c.y};}
