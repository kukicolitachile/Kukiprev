export const KEY='decidobien-progress-v1';
export function fresh(){return {index:0,answers:[],phase:'welcome',found:false,order:[],remaining:60};}
export function validState(s,scenes){return s&&Number.isInteger(s.index)&&s.index>=0&&s.index<=scenes.length&&Array.isArray(s.answers)&&s.answers.length===s.index&&s.answers.every((a,i)=>typeof a==='string'&&scenes[i].alternativas.some(x=>x.id===a))&&['welcome','search','decide','feedback','done'].includes(s.phase)&&typeof s.found==='boolean'&&Array.isArray(s.order)&&Number.isFinite(s.remaining)&&s.remaining>=0&&s.remaining<=60&&(s.index<scenes.length||s.phase==='done');}
export function shuffle(items){return items.map(x=>({x,n:Math.random()})).sort((a,b)=>a.n-b.n).map(o=>o.x);}
export function score(answers,scenes){return answers.reduce((sum,id,i)=>sum+(scenes[i].alternativas.find(a=>a.id===id)?.es_correcta?100:0),0);}
