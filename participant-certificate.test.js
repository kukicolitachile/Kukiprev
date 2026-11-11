import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeParticipant,loadParticipant,saveParticipant,clearParticipant,PARTICIPANT_KEY} from './participant.js';
import {certificateStatus} from './certificate.js';
import {fresh,validState} from './model.js';
const content=JSON.parse(readFileSync(new URL('./assets/correa-revision.json',import.meta.url)));
test('identity accepts accents, bounded real names and rejects malformed persisted fields',()=>{
 assert.deepEqual(normalizeParticipant('  María   José ','Mun\u0303oz'),{firstName:'María José',lastName:'Muñoz'});
 for(const [a,b] of [['','Muñoz'],[' '.repeat(4),'Muñoz'],['a'.repeat(81),'Muñoz'],['A\u0000B','C'],[{},'Muñoz'],[null,'Muñoz']])assert.equal(normalizeParticipant(a,b),null);
 const entries=new Map();globalThis.sessionStorage={getItem:k=>entries.get(k),setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};
 const p=normalizeParticipant('María','Muñoz');assert.equal(saveParticipant(p),true);assert.deepEqual(loadParticipant(),p);
 entries.set(PARTICIPANT_KEY,'{invalid');assert.equal(loadParticipant(),null);
 entries.set(PARTICIPANT_KEY,'x'.repeat(1001));assert.equal(loadParticipant(),null);clearParticipant();assert.equal(entries.size,0);delete globalThis.sessionStorage;
});
test('certificate requires configured criterion, review, and real server validation; offline never fabricates issuance',()=>{
 const state=fresh(),person={firstName:'Persona',lastName:'Demostración'},policy={criterion:null,contentApproved:false};
 const check=(p=policy,online=true,identity=person)=>certificateStatus(state,content,identity,p,online).code;
 assert.equal(check(),'incomplete');
 for(const q of content.evaluacion)state.evaluation.answers[q.id]=q.alternativas.find(a=>a.correcta).id;
 assert.equal(check(policy,true,null),'identity');assert.equal(check(policy,false),'offline_preview');assert.equal(check(),'pending_policy');
 assert.equal(check({criterion:'minimum_score',minimumScore:null}),'pending_policy');
 assert.equal(check({criterion:'completion',contentApproved:false}),'pending_review');
 assert.equal(check({criterion:'completion',contentApproved:true,requireServer:false}),'pending_server');
 state.evaluation.answers[content.evaluacion[0].id]=content.evaluacion[0].alternativas.find(a=>!a.correcta).id;
 assert.equal(check({criterion:'minimum_score',minimumScore:100,contentApproved:true}),'not_eligible');
});
test('saved camera and identity routing metadata preserve legacy schema without storing names',()=>{
 const s=fresh();s.identityReturn='practice';s.view='identify';assert.ok(validState(s,content));
 s.identityReturn='untrusted';assert.equal(validState(s,content),false);
});
