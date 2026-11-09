import {test} from 'node:test';
import assert from 'node:assert/strict';
import {portraitLayout} from './phaser-scene.js';
test('wide screens never enlarge the operator beyond the height or source-resolution limit',()=>{
 for(const [w,h] of [[1900,918],[1920,1010],[1365,698],[768,954],[390,774],[360,579]]){
  const shot=portraitLayout(w,h,{captionBottom:144});assert.ok(shot.scale<=1.65);assert.ok(shot.face.y>=156);assert.ok(shot.face.x>=0&&shot.face.x+shot.face.width<w);assert.ok(shot.face.y+shot.face.height<h-150);
 }
 const compact=portraitLayout(844,334,{compact:true});assert.ok(compact.face.x+compact.face.width<844*.56);assert.ok(compact.face.y+compact.face.height<334);
});
