import {WORLD,LAYERS,splitArtwork} from './scene-layers.js';
let game=null,plant=null,foreground=null,host=null,current=null,resizeObserver=null,ready=false,readyPromise=null;
let actionCallback=()=>{},debugSnapshot='';
const targets={
 'zona-a':{x:753,y:1178,width:301,height:251},
 'zona-b':{x:376,y:828,width:339,height:184},
 'zona-c':{x:117,y:635,width:235,height:167}
};
function instant(){return current?.reduced===true;}
function updateDebug(){
 if(!host||!plant)return;
 const c=plant.cameras.main;
 host.dataset.ready=String(ready);host.dataset.mode=current.mode;host.dataset.zoom=String(plant.detailCamera?.visible?plant.detailCamera.zoom:c.zoom);host.classList.toggle('detail-open',Boolean(plant.detailCamera?.visible));host.dataset.focus=current.focus||'general';host.dataset.layers='fondo,correa,cajas,operaria';
 const snapshot=[c.width,c.height,c.zoom,c.worldView.x,c.worldView.y,host.dataset.zoom,current.mode,current.focus].join(':');
 if(snapshot!==debugSnapshot){debugSnapshot=snapshot;host.dispatchEvent(new CustomEvent('scene:camera',{bubbles:true}));}
}
function viewFor(id){
 const c=plant.cameras.main,w=c.width,h=c.height;
 if(!id)return {x:470.5,y:840,zoom:Math.min(w/941,h/1120)};
 const t=targets[id];return {x:t.x,y:t.y,zoom:Math.min(w/(t.width*1.7),h/(t.height*2.1),1.8)};
}
function aim(id){
 if(!plant||!ready)return;
 const c=plant.cameras.main,view=viewFor(null);c.panEffect.reset();c.zoomEffect.reset();c.setZoom(view.zoom);c.centerOn(view.x,view.y);
 const detail=plant.detailCamera,show=current.mode==='explore'&&Boolean(id);
 detail.visible=show;
 if(show){
  const w=host.clientWidth,h=host.clientHeight,wide=w>h*1.3;
  const rect=wide?{x:w*.06,y:92,width:w*.43,height:h*.48}:{x:w*.18,y:132,width:w*.74,height:Math.min(h*.31,225)};
  detail.setViewport(rect.x,rect.y,rect.width,rect.height);const t=targets[id];
  const zoom=Math.min(rect.width/(t.width*1.3),rect.height/(t.height*1.5),2.2);
  detail.panEffect.reset();detail.zoomEffect.reset();
  if(instant()){detail.setZoom(zoom);detail.centerOn(t.x,t.y);}else{detail.setZoom(view.zoom);detail.centerOn(t.x,t.y);detail.zoomTo(zoom,360,'Sine.easeInOut');}
  plant.detailRect=rect;
 }else plant.detailRect=null;
 if(current.mode==='discover'&&id){const t=targets[id];c.setZoom(view.zoom);c.centerOn(view.x,view.y);plant.explainTarget=t;}else plant.explainTarget=null;
 foreground?.layout(host.clientWidth,host.clientHeight,current.mode==='decide');updateDebug();
}
function layout(){
 if(!game||!plant||!host)return;
 const {width,height}=host.getBoundingClientRect();game.scale.resize(Math.round(width),Math.round(height));
 const decision=current.mode==='decide';const landscape=width>height*1.3;
 plant.operator?.setVisible(!decision);
 const reserve=decision?(landscape?0:205):(landscape?70:130);
 plant.cameras.main.setViewport(0,0,width,Math.max(190,height-reserve));
 aim(current.focus);
 foreground?.layout(width,height,decision);
}
export async function mountScene(element,settings,onAction){
 host=element;current=settings;actionCallback=onAction;
 if(game){element.append(game.canvas);debugSnapshot='';resizeObserver?.disconnect();resizeObserver?.observe(element);game.scale.parent=element;game.scale.updateBounds();layout();return readyPromise;}
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
   this.mark=this.add.graphics();this.detailCamera=this.cameras.add(0,0,100,100);this.detailCamera.visible=false;
   this.input.on('pointerup',pointer=>{
    if(current.mode!=='explore')return;
    const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
    for(const [id,t] of Object.entries(targets))if(Math.abs(point.x-t.x)<=t.width/2+24&&Math.abs(point.y-t.y)<=t.height/2+24){actionCallback(id);break;}
   });
   this.events.on('postupdate',()=>{this.drawMarks();updateDebug();});
   ready=true;this.scene.launch('Foreground');layout();resolve();
  }
  drawMarks(){
   this.mark.clear();if(current.mode==='discover'&&plant.explainTarget){const t=plant.explainTarget;this.mark.lineStyle(6,0xffca30,.95);this.mark.strokeRoundedRect(t.x-t.width/2,t.y-t.height/2,t.width,t.height,10);return;}if(current.mode!=='explore')return;
   const ids=current.visited||[];
   for(const [id,t] of Object.entries(targets)){
    const selected=current.focus===id,visited=ids.includes(id);
    const color=selected?0xffca36:0xd7fff6;
    this.mark.lineStyle(selected?5:3,color,selected?1:.75);
    const size=selected?Math.min(t.width,t.height)*.55:44;
    this.mark.strokeRoundedRect(t.x-size/2,t.y-size/2,size,size,8);
    if(visited){this.mark.fillStyle(0x00b5b9,1);this.mark.fillCircle(t.x+size/2,t.y-size/2,12);}
   }
  }
 }
 class Foreground extends P.Scene{
  constructor(){super('Foreground');}
  create(){foreground=this;this.edge=this.add.graphics();this.portrait=this.add.image(0,0,'operaria').setOrigin(0);this.layout(host.clientWidth,host.clientHeight,current.mode==='decide');}
  layout(w,h,decision){
   if(!this.portrait)return;this.portrait.setVisible(decision);this.edge.clear();if(!decision){if(plant?.detailRect){const r=plant.detailRect;this.edge.lineStyle(7,0x062a36,1);this.edge.strokeRoundedRect(r.x-5,r.y-5,r.width+10,r.height+10,17);this.edge.lineStyle(4,0xffca30,1);this.edge.strokeRoundedRect(r.x-2,r.y-2,r.width+4,r.height+4,14);this.edge.lineStyle(3,0xf0fff8,1);const l=19;for(const [x,y,sx,sy] of [[r.x+12,r.y+12,1,1],[r.x+r.width-12,r.y+12,-1,1],[r.x+12,r.y+r.height-12,1,-1],[r.x+r.width-12,r.y+r.height-12,-1,-1]]){this.edge.beginPath();this.edge.moveTo(x,y+sy*l);this.edge.lineTo(x,y);this.edge.lineTo(x+sx*l,y);this.edge.strokePath();}}return;}
   // Comic foreground is a change of shot, not an action by the operator.
   const available=h-(w>h*1.3?100:205);
   const scale=Math.max(w*.96/243,available/450);
   const px=w*.57-243*scale/2,py=Math.max(6,available*.04);
   this.edge.lineStyle(6,0x032431,1);this.edge.beginPath();
   LAYERS[3].polygon.forEach(([x,y],i)=>{const xx=px+(x-654)*scale,yy=py+(y-321)*scale;i?this.edge.lineTo(xx,yy):this.edge.moveTo(xx,yy);});this.edge.closePath();this.edge.strokePath();
   this.portrait.setScale(scale).setPosition(px,py);
   this.edge.lineStyle(4,0xd9fff7,.9);this.edge.beginPath();this.edge.moveTo(0,40);this.edge.lineTo(w*.13,72);this.edge.lineTo(w*.23,43);this.edge.strokePath();
  }
 }
 game=new P.Game({type:P.CANVAS,parent:element,backgroundColor:'#062c3a',width:element.clientWidth,height:element.clientHeight,antialias:true,audio:{noAudio:true},loader:{imageLoadType:'HTMLImageElement'},banner:false,scene:[Plant,Foreground],scale:{mode:P.Scale.NONE},fps:{target:30,forceSetTimeOut:true},render:{pixelArt:false}});
 game.events.once('destroy',()=>{ready=false;});
 });
 resizeObserver=new ResizeObserver(()=>layout());resizeObserver.observe(element);
 return readyPromise;
}
export function updateScene(settings,onAction){current=settings;actionCallback=onAction;layout();}
export function unmountScene(){resizeObserver?.disconnect();resizeObserver=null;if(game){game.destroy(true);game=null;}plant=foreground=host=null;ready=false;readyPromise=null;}
export function pauseScene(){game?.loop.sleep();}
export function layerEvidence(){return {layers:LAYERS.map(l=>l.id),targets};}

export function projectTargets(){if(!plant||!ready)return {};const c=plant.cameras.main;return Object.fromEntries(Object.entries(targets).map(([id,t])=>[id,{x:(t.x-c.worldView.x)*c.zoom+c.x,y:(t.y-c.worldView.y)*c.zoom+c.y}]));}
export function resumeScene(){game?.loop.wake();}
