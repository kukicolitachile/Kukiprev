export const KEY = 'decidobien-review-v1';

const VIEWS = new Set(['home', 'study', 'practice', 'evaluation', 'summary', 'review', 'join', 'identify']);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const has = (object, key) => Object.hasOwn(object, key);

export function fresh() {
  return {
    version: 1,
    view: 'home',
    practice: { found: false, attempts: 0, selected: null, order: [] },
    evaluation: { answers: {}, orders: {}, current: 0 },
    reflection: [],
    studyRead: false
  };
}

// A visit to Home must not erase where the participant left the mission.
export function savedDestination(state, content) {
  if (evaluateAnswers(state.evaluation.answers, content.evaluacion).complete) return 'summary';
  if (state.resumeView === 'evaluation' || state.view === 'evaluation' ||
      (state.view === 'identify' && state.identityReturn === 'evaluation') ||
      Object.keys(state.evaluation.answers).length > 0) return 'evaluation';
  return 'practice';
}

export function hasMissionProgress(state) {
  return Boolean(state.resumeView || state.practice.attempts || state.practice.found ||
    state.practice.selected || Object.keys(state.evaluation.answers).length ||
    (state.journey && state.journey.stage !== 'observe'));
}

export function canAdvance(state, next) {
  const j = state.journey;
  if (!j) return false;
  const successors = {observe:'explore', explore:'decide', decide:'discover', discover:'apply', apply:'evaluation'};
  if (successors[j.stage] !== next) return false;
  if (next === 'decide') return state.practice.found;
  if (next === 'discover') return Boolean(state.practice.found && state.practice.selected);
  if (next === 'apply') return j.discovered?.length === 3;
  if (next === 'evaluation') return Boolean(j.appliedConfirmed && j.inquiries?.length);
  return true;
}

export function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function choiceIds(choices) {
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const ids = choices.map(choice => choice?.id);
  if (ids.some(id => typeof id !== 'string' || id.length === 0)) return null;
  return new Set(ids).size === ids.length ? ids : null;
}

function validOrder(order, ids) {
  return Array.isArray(order) && (order.length === 0 || (
    order.length === ids.length &&
    new Set(order).size === ids.length &&
    order.every(id => ids.includes(id))
  ));
}

export function evaluateAnswers(answers, questions) {
  const items = Array.isArray(questions) ? questions : [];
  const responses = isRecord(answers) ? answers : {};
  let answered = 0;
  let correct = 0;

  for (const question of items) {
    if (!question || !Array.isArray(question.alternativas) || !has(responses, question.id)) continue;
    const selected = question.alternativas.find(choice => choice.id === responses[question.id]);
    if (!selected) continue;
    answered++;
    if (selected.correcta === true) correct++;
  }

  return {
    answered,
    correct,
    total: items.length,
    complete: items.length > 0 && answered === items.length
  };
}

export function validState(state, content) {
  if (!isRecord(state) || state.version !== 1 || !VIEWS.has(state.view)) return false;
  if (typeof state.studyRead !== 'boolean') return false;
  if (!Array.isArray(state.reflection) || state.reflection.length>20 || state.reflection.some(item => typeof item !== 'string'||item.length>500)) return false;

  const practiceIds = choiceIds(content?.practica?.alternativas);
  const questions = content?.evaluacion;
  if (!practiceIds || !Array.isArray(questions) || questions.length === 0) return false;
  const questionIds = choiceIds(questions);
  if (!questionIds) return false;
  const alternatives = new Map();
  for (const question of questions) {
    const ids = choiceIds(question.alternativas);
    if (!ids) return false;
    alternatives.set(question.id, ids);
  }

  const practice = state.practice;
  if (!isRecord(practice) || typeof practice.found !== 'boolean') return false;
  if (!Number.isSafeInteger(practice.attempts) || practice.attempts < 0) return false;
  if (!validOrder(practice.order, practiceIds)) return false;
  if (practice.selected !== null && !practiceIds.includes(practice.selected)) return false;
  if (practice.selected !== null && !practice.found) return false;

  const evaluation = state.evaluation;
  if (!isRecord(evaluation) || !isRecord(evaluation.answers) || !isRecord(evaluation.orders)) return false;
  if (!Number.isInteger(evaluation.current) || evaluation.current < 0 || evaluation.current >= questions.length) return false;
  for (const [questionId, answerId] of Object.entries(evaluation.answers)) {
    if (!alternatives.has(questionId) || !alternatives.get(questionId).includes(answerId)) return false;
  }
  for (const [questionId, order] of Object.entries(evaluation.orders)) {
    if (!alternatives.has(questionId) || !validOrder(order, alternatives.get(questionId))) return false;
  }

  const complete = evaluateAnswers(evaluation.answers, questions).complete;
  for (let index = 0; index < evaluation.current; index++) {
    if (!has(evaluation.answers, questions[index].id)) return false;
  }
  // An unfinished attempt may contain only a contiguous sequence of answers.
  let unansweredSeen = false;
  for (const question of questions) {
    if (!has(evaluation.answers, question.id)) unansweredSeen = true;
    else if (unansweredSeen) return false;
  }


  if (['evaluation', 'summary'].includes(state.view) && (!practice.found || practice.selected === null)) return false;
  if (state.view === 'summary' && !complete) return false;
  if (state.identityReturn!==undefined&&!['practice','summary','evaluation'].includes(state.identityReturn))return false;
  if (state.resumeView!==undefined&&!['practice','summary','evaluation'].includes(state.resumeView))return false;
  if (state.journey !== undefined) {
    const j = state.journey;
    if (!isRecord(j) || !['observe','explore','decide','discover','apply'].includes(j.stage)) return false;
    if (j.explored !== undefined && (!Array.isArray(j.explored) || new Set(j.explored).size!==j.explored.length || j.explored.some(id=>!content.practica.zonas.some(z=>z.id===id)))) return false;
    if(j.lastTouch!==undefined&&(!isRecord(j.lastTouch)||!Number.isFinite(j.lastTouch.x)||!Number.isFinite(j.lastTouch.y)||j.lastTouch.x<0||j.lastTouch.x>941||j.lastTouch.y<0||j.lastTouch.y>1672))return false;
    if(j.exploreEvent!==undefined&&!['point','hint'].includes(j.exploreEvent))return false;
    if (j.cameraFocus!==undefined&&j.cameraFocus!==null&&!['zona-a','zona-b','zona-c'].includes(j.cameraFocus))return false;
    if (j.inquiries !== undefined && (!Array.isArray(j.inquiries) || new Set(j.inquiries).size!==j.inquiries.length || j.inquiries.some(id=>!['method','condition','roles'].includes(id)))) return false;
    if (j.inquiryFocus !== undefined && !['method','condition','roles'].includes(j.inquiryFocus)) return false;
    if (j.discovered !== undefined && (!Array.isArray(j.discovered) || new Set(j.discovered).size !== j.discovered.length || j.discovered.some(id=>!Number.isInteger(id)||id<0||id>2))) return false;
    if (j.classified !== undefined && (!isRecord(j.classified) || Object.entries(j.classified).some(([k,v])=>!['accumulation','message','response'].includes(k)||!['observed','communicated','pending'].includes(v)))) return false;
    if (j.comparison !== undefined && !['a','b','neither'].includes(j.comparison)) return false;
    if (j.compareOpen !== undefined && typeof j.compareOpen !== 'boolean') return false;
    if (j.pending !== null && !practiceIds.includes(j.pending)) return false;
    if (typeof j.hint !== 'boolean' || !Number.isInteger(j.focus) || j.focus < 0 || j.focus > 2) return false;
    if (j.applied !== null && !content.interaccion?.aplica.alternativas.some(a => a.id === j.applied)) return false;
    if (typeof j.appliedConfirmed !== 'boolean' || (j.appliedConfirmed && !j.applied)) return false;
    if (['decide','discover','apply'].includes(j.stage) && !practice.found) return false;
    if (['discover','apply'].includes(j.stage) && !practice.selected) return false;
    if (!Number.isInteger(j.studyIndex) || j.studyIndex < 0 || j.studyIndex > 3) return false;
  }
  return true;
}
