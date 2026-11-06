export const KEY = 'decidobien-review-v1';

const VIEWS = new Set(['home', 'study', 'practice', 'evaluation', 'summary', 'review']);
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
  if (!Array.isArray(state.reflection) || state.reflection.some(item => typeof item !== 'string')) return false;

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

  if (['practice', 'evaluation', 'summary'].includes(state.view) && !state.studyRead) return false;
  if (['evaluation', 'summary'].includes(state.view) && (!practice.found || practice.selected === null)) return false;
  if (state.view === 'summary' && !complete) return false;
  return true;
}
