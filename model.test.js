import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEY, fresh, validState, evaluateAnswers, shuffle } from './model.js';

const content = {
  practica: {
    alternativas: [
      { id: 'practice-limit', correcta: true },
      { id: 'practice-continue', correcta: false },
      { id: 'practice-assume', correcta: false }
    ]
  },
  evaluacion: [
    {
      id: 'role',
      alternativas: [
        { id: 'observe', correcta: true },
        { id: 'intervene', correcta: false }
      ]
    },
    {
      id: 'information',
      alternativas: [
        { id: 'assume', correcta: false },
        { id: 'clarify', correcta: true }
      ]
    },
    {
      id: 'communication',
      alternativas: [
        { id: 'sufficient', correcta: false },
        { id: 'not-sufficient', correcta: true }
      ]
    }
  ]
};

const completedAnswers = { role: 'observe', information: 'clarify', communication: 'not-sufficient' };

test('new progress is distinct from the earlier course and independently initialized', () => {
  assert.equal(KEY, 'decidobien-review-v1');
  const state = fresh();
  assert.equal(validState(state, content), true);
  state.evaluation.answers.role = 'observe';
  state.practice.order.push('practice-limit');
  assert.deepEqual(fresh().evaluation.answers, {});
  assert.deepEqual(fresh().practice.order, []);
});

test('a confirmed practice decision and complete evaluation survive serialization', () => {
  const state = fresh();
  state.view = 'summary';
  state.studyRead = true;
  state.practice = {
    found: true,
    attempts: 2,
    selected: 'practice-continue',
    order: ['practice-assume', 'practice-limit', 'practice-continue']
  };
  state.evaluation = {
    answers: { ...completedAnswers },
    orders: { role: ['intervene', 'observe'], information: ['clarify', 'assume'] },
    current: 2
  };
  state.reflection = ['Qué información falta sobre la tarea.'];
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(validState(restored, content), true);
  assert.equal(restored.practice.selected, 'practice-continue');
  assert.deepEqual(restored.evaluation.answers, completedAnswers);
  assert.deepEqual(evaluateAnswers(restored.evaluation.answers, content.evaluacion), {
    answered: 3, correct: 3, total: 3, complete: true
  });
});

test('summary requires all known questions answered, regardless of correctness', () => {
  const state = fresh();
  state.view = 'summary';
  state.studyRead = true;
  state.practice.found = true;
  state.practice.selected = 'practice-limit';
  assert.equal(validState(state, content), false);
  state.evaluation.answers = { role: 'intervene', information: 'assume' };
  assert.equal(validState(state, content), false);
  state.evaluation.answers.communication = 'sufficient';
  assert.equal(validState(state, content), true);
  assert.deepEqual(evaluateAnswers(state.evaluation.answers, content.evaluacion), {
    answered: 3, correct: 0, total: 3, complete: true
  });
});

test('evaluation tracks mixed and incomplete answers without an approval threshold', () => {
  assert.deepEqual(evaluateAnswers({ role: 'intervene', information: 'clarify' }, content.evaluacion), {
    answered: 2, correct: 1, total: 3, complete: false
  });
  assert.deepEqual(evaluateAnswers({ role: 'not-an-option' }, content.evaluacion), {
    answered: 0, correct: 0, total: 3, complete: false
  });
  assert.deepEqual(evaluateAnswers({}, []), {
    answered: 0, correct: 0, total: 0, complete: false
  });
});

test('invalid answer IDs, unknown questions and inconsistent practice are rejected', () => {
  const cases = [
    state => { state.practice.selected = 'unknown'; },
    state => { state.practice.selected = 'practice-limit'; },
    state => { state.evaluation.answers.unknown = 'observe'; },
    state => { state.evaluation.answers.role = 'not-an-option'; },
    state => { state.evaluation.orders.unknown = []; },
    state => { state.practice.attempts = -1; },
    state => { state.practice.found = 'true'; },
    state => { state.studyRead = 1; },
    state => { state.reflection = [false]; },
    state => { state.version = 0; },
    state => { state.view = 'done'; },
    state => { state.evaluation.current = -1; },
    state => { state.evaluation.current = 3; },
    state => { state.evaluation.current = 0.5; },
    state => { delete state.evaluation.current; },
    state => { state.evaluation.current = 1; },
    state => { state.evaluation.answers.information = 'clarify'; }
  ];
  for (const mutate of cases) {
    const state = fresh();
    mutate(state);
    assert.equal(validState(state, content), false);
  }
  for (const value of [null, [], 'saved data', {}]) assert.equal(validState(value, content), false);
});

test('choice orders cannot omit, repeat or invent choices', () => {
  for (const order of [
    ['practice-limit'],
    ['practice-limit', 'practice-limit', 'practice-assume'],
    ['practice-limit', 'practice-assume', 'unknown']
  ]) {
    const state = fresh();
    state.practice.order = order;
    assert.equal(validState(state, content), false);
  }
  const state = fresh();
  state.evaluation.orders.role = ['observe', 'observe'];
  assert.equal(validState(state, content), false);
  state.evaluation.orders.role = ['intervene', 'observe'];
  assert.equal(validState(state, content), true);
});

test('home and reviewer views retain valid unfinished work without manufacturing completion', () => {
  const state = fresh();
  state.evaluation.answers.role = 'observe';
  state.studyRead = true;
  state.practice.found = true;
  state.practice.selected = 'practice-limit';
  for (const view of ['home', 'study', 'practice', 'evaluation', 'review']) {
    state.view = view;
    assert.equal(validState(state, content), true);
    assert.equal(evaluateAnswers(state.evaluation.answers, content.evaluacion).complete, false);
  }
});

test('malformed course data does not make persisted progress appear valid', () => {
  for (const malformed of [null, {}, { practica: content.practica, evaluacion: [] }]) {
    assert.equal(validState(fresh(), malformed), false);
  }
  const duplicateQuestions = structuredClone(content);
  duplicateQuestions.evaluacion.push(duplicateQuestions.evaluacion[0]);
  assert.equal(validState(fresh(), duplicateQuestions), false);
});

test('shuffling preserves choice identity and does not mutate the source', () => {
  const original = ['a', 'b', 'c'];
  const output = shuffle(original);
  assert.notEqual(output, original);
  assert.deepEqual(original, ['a', 'b', 'c']);
  assert.deepEqual(output.toSorted(), original);
});

test('current evaluation question and confirmed answer restore without changing the attempt', () => {
  const state = fresh();
  state.view = 'evaluation';
  state.studyRead = true;
  state.practice.found = true;
  state.practice.selected = 'practice-limit';
  state.evaluation.current = 1;
  state.evaluation.answers = { role: 'intervene', information: 'clarify' };
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(validState(restored, content), true);
  assert.equal(restored.evaluation.current, 1);
  assert.equal(restored.evaluation.answers.role, 'intervene');
  assert.equal(restored.evaluation.answers.information, 'clarify');
});

test('practice is directly accessible while evaluation requires a confirmed practice decision', () => {
  const state = fresh();
  state.view = 'practice';
  assert.equal(validState(state, content), true);
  state.studyRead = true;
  assert.equal(validState(state, content), true);
  state.view = 'evaluation';
  assert.equal(validState(state, content), false);
  state.practice.found = true;
  assert.equal(validState(state, content), false);
  state.practice.selected = 'practice-limit';
  assert.equal(validState(state, content), true);
  for (const view of ['home', 'review', 'study']) {
    const unfinished = fresh();
    unfinished.view = view;
    assert.equal(validState(unfinished, content), true);
  }
});

test('visual stages and unconfirmed decisions restore without manufacturing a confirmed answer', () => {
  const course = {...content, interaccion: {aplica: {alternativas: [{id:'apply-limit'}]}}};
  const state = fresh();
  state.view = 'practice';
  state.journey = {stage:'decide',pending:'practice-limit',hint:false,focus:0,applied:null,appliedConfirmed:false,studyIndex:0};
  state.practice.found = true;
  assert.equal(validState(JSON.parse(JSON.stringify(state)), course), true);
  assert.equal(state.practice.selected, null);
  state.journey.stage = 'discover';
  assert.equal(validState(state, course), false);
  state.practice.selected = 'practice-limit';
  assert.equal(validState(state, course), true);
  state.journey.stage = 'apply';
  state.journey.appliedConfirmed = true;
  assert.equal(validState(state, course), false);
  state.journey.applied = 'apply-limit';
  assert.equal(validState(state, course), true);
});

// Previously saved draft progress remains readable; invalid detail ids are rejected.
test('scene discovery restores without accepting duplicate or unknown details', () => {
 const course = {...content, interaccion:{aplica:{alternativas:[{id:'apply-limit'}]}}};
 const state=fresh();state.practice.found=true;state.practice.selected='practice-limit';
 state.journey={stage:'discover',pending:'practice-limit',hint:false,focus:1,applied:null,appliedConfirmed:false,studyIndex:0,discovered:[0,1]};
 assert.equal(validState(JSON.parse(JSON.stringify(state)),course),true);
 state.journey.discovered=[0,0];assert.equal(validState(state,course),false);
 state.journey.discovered=[3];assert.equal(validState(state,course),false);
 delete state.journey.discovered;state.journey.compareOpen=true;state.journey.comparison='neither';
 assert.equal(validState(state,course),true);
});
