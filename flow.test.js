import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh,hasMissionProgress,savedDestination,canAdvance,validState} from './model.js';
const content=JSON.parse(readFileSync(new URL('./assets/correa-revision.json',import.meta.url)));
const journey=()=>({stage:'observe',pending:null,hint:false,focus:0,applied:null,appliedConfirmed:false,studyIndex:0});

test('returning home before the first assessment answer resumes assessment, not Apply',()=>{
 const state=fresh();state.view='home';state.resumeView='evaluation';
 state.practice.found=true;state.practice.selected='alt-a';state.journey={...journey(),stage:'apply'};
 assert.equal(Object.keys(state.evaluation.answers).length,0);
 assert.equal(savedDestination(state,content),'evaluation');
 assert.equal(hasMissionProgress(state),true);
 assert.equal(validState(JSON.parse(JSON.stringify(state)),content),true);
});
test('a confirmed legacy answer and a complete result choose their actual destination',()=>{
 const state=fresh();state.view='home';state.practice.found=true;state.practice.selected='alt-b';
 state.evaluation.answers[content.evaluacion[0].id]=content.evaluacion[0].alternativas[0].id;
 assert.equal(savedDestination(state,content),'evaluation');
 for(const question of content.evaluacion)state.evaluation.answers[question.id]=question.alternativas[0].id;
 assert.equal(savedDestination(state,content),'summary');
 assert.equal(hasMissionProgress(state),true);
});
test('a fresh visit begins at the context and each transition requires the preceding activity',()=>{
 const state=fresh();state.journey=journey();assert.equal(hasMissionProgress(state),false);
 assert.equal(savedDestination(state,content),'practice');
 assert.equal(canAdvance(state,'decide'),false);assert.equal(canAdvance(state,'explore'),true);
 state.journey.stage='explore';assert.equal(canAdvance(state,'decide'),false);
 state.practice.found=true;assert.equal(canAdvance(state,'decide'),true);
 state.journey.stage='decide';assert.equal(canAdvance(state,'discover'),false);
 state.practice.selected='alt-a';assert.equal(canAdvance(state,'discover'),true);
 state.journey.stage='discover';state.journey.discovered=[0,1];assert.equal(canAdvance(state,'apply'),false);
 state.journey.discovered.push(2);assert.equal(canAdvance(state,'apply'),true);
 state.journey.stage='apply';state.journey.inquiries=['method'];assert.equal(canAdvance(state,'evaluation'),false);
 state.journey.appliedConfirmed=true;assert.equal(canAdvance(state,'evaluation'),true);
 assert.equal(canAdvance(state,'explore'),false);
});
test('unknown resume destinations cannot be persisted as trusted application state',()=>{
 const state=fresh();state.resumeView='skip-to-certificate';assert.equal(validState(state,content),false);
});
