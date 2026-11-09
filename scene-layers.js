// Masks split the original artwork; no geometry or machine state is changed.
export const WORLD={width:941,height:1672};
export const LAYERS=[
 {id:'fondo',label:'Fondo de planta',polygon:null},
 {id:'correa',label:'Correa',polygon:[[0,508],[70,515],[73,554],[220,659],[656,924],[941,1070],[941,1620],[848,1605],[846,1533],[556,1533],[557,1550],[513,1574],[444,1549],[445,1517],[453,1510],[454,1341],[230,1216],[230,1266],[183,1280],[157,1259],[158,1171],[80,1124],[80,1040],[95,1041],[95,1034],[47,1018],[47,858],[0,806]]},
 {id:'cajas',label:'Estuches',polygon:[[0,559],[72,558],[110,574],[114,589],[157,598],[187,611],[190,647],[229,659],[228,699],[192,711],[151,710],[94,688],[80,690],[56,678],[53,659],[22,648],[0,637]]},
 {id:'operaria',label:'Operaria',polygon:[[690,359],[709,337],[741,323],[774,321],[814,330],[839,350],[856,379],[867,422],[858,462],[836,483],[858,510],[885,547],[897,601],[896,680],[891,746],[887,797],[889,837],[875,873],[853,881],[826,858],[820,837],[825,806],[815,811],[811,1010],[755,972],[697,938],[692,831],[675,858],[660,854],[654,830],[655,797],[668,737],[667,685],[670,618],[685,568],[701,531],[718,503],[719,481],[705,467],[698,447],[695,411],[695,390]]}
];
// Rendering preparation: disjoint pixel ownership makes the four layers lossless when composed.
export function splitArtwork(image){
 const source=document.createElement('canvas');source.width=WORLD.width;source.height=WORLD.height;
 const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,WORLD.width,WORLD.height);
 const bounds=LAYERS.map(l=>l.polygon?{
  x:Math.floor(Math.min(...l.polygon.map(p=>p[0]))),y:Math.floor(Math.min(...l.polygon.map(p=>p[1]))),
  right:Math.ceil(Math.max(...l.polygon.map(p=>p[0]))),bottom:Math.ceil(Math.max(...l.polygon.map(p=>p[1])))
 }:{x:0,y:0,right:WORLD.width,bottom:WORLD.height});
 const outputs=bounds.map(b=>new ImageData(b.right-b.x,b.bottom-b.y));
 const mask=document.createElement('canvas');mask.width=WORLD.width;mask.height=WORLD.height;const m=mask.getContext('2d',{willReadFrequently:true});
 m.fillStyle='black';m.fillRect(0,0,WORLD.width,WORLD.height);
 for(let n=1;n<LAYERS.length;n++){m.fillStyle=`rgb(${n*64},0,0)`;m.beginPath();LAYERS[n].polygon.forEach(([x,y],i)=>i?m.lineTo(x,y):m.moveTo(x,y));m.closePath();m.fill();}
 const owners=m.getImageData(0,0,WORLD.width,WORLD.height).data;
 for(let y=0;y<WORLD.height;y++)for(let x=0;x<WORLD.width;x++){
  let layer=Math.min(3,Math.round(owners[(y*WORLD.width+x)*4]/64));const limit=bounds[layer];if(x<limit.x||x>=limit.right||y<limit.y||y>=limit.bottom)layer=0;
  const i=(y*WORLD.width+x)*4,b=bounds[layer],destination=((y-b.y)*outputs[layer].width+x-b.x)*4;
  const d=outputs[layer].data;d[destination]=pixels.data[i];d[destination+1]=pixels.data[i+1];d[destination+2]=pixels.data[i+2];d[destination+3]=pixels.data[i+3];
 }
 return outputs.map((data,n)=>{const canvas=document.createElement('canvas');canvas.width=data.width;canvas.height=data.height;canvas.getContext('2d').putImageData(data,0,0);return {id:LAYERS[n].id,canvas,x:bounds[n].x,y:bounds[n].y};});
}

// Reverse shot only: continue the existing empty wall/window behind the enlarged portrait.
// These rectangles stay above the conveyor and outside all three interaction zones.
// Sampling the same rows preserves their colours; no equipment or controls are added.
export function decisionBackdrop(image){
 const canvas=document.createElement('canvas');canvas.width=WORLD.width;canvas.height=WORLD.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
 ctx.drawImage(image,640,318,8,370,648,318,254,370);
 ctx.drawImage(image,932,688,8,212,648,688,254,212);
 return canvas;
}
