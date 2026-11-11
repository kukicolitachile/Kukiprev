// Client progress is not trusted evidence. No local folio or enterprise receipt is fabricated.
import {evaluateAnswers} from './model.js';
export function certificateStatus(state,content,participant,policy,online){
 const result=evaluateAnswers(state.evaluation.answers,content.evaluacion);
 if(!result.complete)return {code:'incomplete',label:'Recorrido pendiente'};
 if(!participant)return {code:'identity',label:'Revisar nombre y apellido'};
 if(!online)return {code:'offline_preview',label:'Sin conexión. Esta demo no sincroniza registros ni emite certificados empresariales.'};
 if(!['completion','minimum_score'].includes(policy.criterion))return {code:'pending_policy',label:'Criterio de emisión pendiente de Julisa'};
 if(policy.criterion==='minimum_score'&&(!Number.isFinite(policy.minimumScore)||policy.minimumScore<0||policy.minimumScore>100))return {code:'pending_policy',label:'Puntaje mínimo pendiente de definir'};
 if(policy.criterion==='minimum_score'&&result.correct/result.total*100<policy.minimumScore)return {code:'not_eligible',label:'No alcanza el criterio configurado'};
 if(!policy.contentApproved)return {code:'pending_review',label:'Contenido pendiente de validación preventiva'};
 return {code:'pending_server',label:'Certificado pendiente de validación del servidor'};
}
export async function downloadPreview(participant,module,date=new Date()){
 if(!window.PDFLib)throw Error('pdf-unavailable');
 const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=990;const c=canvas.getContext('2d');
 c.fillStyle='#f8fbfa';c.fillRect(0,0,1400,990);c.strokeStyle='#079ba2';c.lineWidth=12;c.strokeRect(36,36,1328,918);
 c.fillStyle='#053144';c.textAlign='center';c.font='bold 54px sans-serif';c.fillText('DecidoBien — Manos que cuidan',700,155);
 c.font='34px sans-serif';c.fillText('Vista previa del certificado',700,235);c.font='bold 48px sans-serif';
 const full=participant.firstName+' '+participant.lastName;while(c.measureText(full).width>1180){const size=parseInt(c.font.match(/\d+/)[0]);c.font=`bold ${size-1}px sans-serif`;}
 c.fillText(full,700,410);c.font='32px sans-serif';c.fillText(module,700,505);c.fillText(date.toLocaleDateString('es-CL'),700,565);
 c.fillStyle='#8b6000';c.font='bold 31px sans-serif';c.fillText('BORRADOR · SIN EMISIÓN EMPRESARIAL',700,710);
 c.fillStyle='#364d56';c.font='24px sans-serif';c.fillText('Folio pendiente · Requiere validación de registro en servidor',700,780);c.fillText('Esta vista previa no acredita aprobación ni asistencia.',700,825);
 const doc=await window.PDFLib.PDFDocument.create();const image=await doc.embedPng(canvas.toDataURL('image/png'));const page=doc.addPage([842,595]);page.drawImage(image,{x:0,y:0,width:842,height:595});
 doc.setTitle('DecidoBien — Vista previa sin emisión empresarial');const bytes=await doc.save();const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
 const a=document.createElement('a');a.href=url;a.download='DecidoBien-vista-previa.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
