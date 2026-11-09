export const PARTICIPANT_KEY='decidobien-participant-v1';
export function normalizeParticipant(firstName,lastName){
 if(typeof firstName!=='string'||typeof lastName!=='string'||/[\u0000-\u001f\u007f]/.test(firstName+lastName))return null;
 const clean=s=>String(s??'').normalize('NFC').trim().replace(/\s+/g,' ');
 const result={firstName:clean(firstName),lastName:clean(lastName)};
 if(Object.values(result).some(v=>v.length<1||v.length>80||/[\u0000-\u001f\u007f]/.test(v)))return null;
 return result;
}
export function loadParticipant(){try{const raw=sessionStorage.getItem(PARTICIPANT_KEY);if(!raw||raw.length>1000)return null;const p=JSON.parse(raw);return normalizeParticipant(p.firstName,p.lastName);}catch{return null;}}
export function saveParticipant(p){try{sessionStorage.setItem(PARTICIPANT_KEY,JSON.stringify(p));return true;}catch{return false;}}
export function clearParticipant(){try{sessionStorage.removeItem(PARTICIPANT_KEY);}catch{}}
