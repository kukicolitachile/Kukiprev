import { KEY, fresh, shuffle, validState, evaluateAnswers } from './model.js';
import { sceneMarkup } from './scenes.js';

const app = document.querySelector('#app');
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
let content;
let state = fresh();
let observation = '';
let storageAvailable = true;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    storageAvailable = false;
  }
}

function navigate(view) {
  state.view = view;
  observation = '';
  save();
  render();
  app.focus();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function resumeView() {
  const result = evaluateAnswers(state.evaluation.answers, content.evaluacion);
  if (!state.practice.selected) return state.studyRead ? 'practice' : 'study';
  if (result.complete) return 'summary';
  if (state.practice.selected) return 'evaluation';
  return state.studyRead ? 'practice' : 'study';
}

function reviewBanner() {
  return `<aside class="draft-banner" aria-label="Estado del contenido">
    <span class="tag">Borrador revisable</span>
    <p>Caso hipotético. Contenido e ilustración pendientes de validación por prevención.
    No es un procedimiento de trabajo ni autoriza una intervención.</p>
    <button class="inline-link" data-go="review">Ver decisiones pendientes</button>
  </aside>`;
}

function topNavigation() {
  const completed = evaluateAnswers(state.evaluation.answers, content.evaluacion).complete;
  return `<div class="learning-top">
    <button class="back" data-go="home">← Inicio</button>
    <span>Correa transportadora · Misión 01</span>
    <button class="inline-link" data-go="review">Revisión técnica</button>
  </div>
  <nav class="flow-steps" aria-label="Secuencia del caso">
    ${[
      ['study', '1 · Estudiar', true],
      ['practice', '2 · Practicar', state.studyRead],
      ['evaluation', '3 · Evaluar', Boolean(state.practice.selected)],
      ['summary', 'Resultado', completed && Boolean(state.practice.selected)]
    ].map(([view, label, enabled]) => `<button data-go="${view}"
      ${enabled ? '' : 'disabled'} ${state.view === view ? 'aria-current="step"' : ''}
      class="${state.view === view ? 'active' : ''}">${label}</button>`).join('')}
  </nav>`;
}

function homeView() {
  const started = state.studyRead || state.practice.attempts > 0;
  return `${reviewBanner()}
  <section class="hero">
    <div>
      <p class="eyebrow">DecidoBien · Capacitación guiada</p>
      <h1>Manos que cuidan.<br><em>Mirar el trabajo real.</em></h1>
      <p class="lead">¿Qué debe estar resuelto en este proceso para que las manos estén protegidas?</p>
      <p>Reconoce cómo ocurre la exposición y qué información necesitas antes de continuar una tarea.</p>
      <div class="hero-actions">
        <button class="primary" id="begin">${started ? 'Continuar el caso' : 'Comenzar con la correa'} <span aria-hidden="true">↗</span></button>
      </div>
      <div class="module-meta"><span>Sesión guiada · alcance de 30 min</span><span>Objetivo: 6 misiones de atrapamiento</span></div>
      <p class="fine">Esta entrega prepara solo el primer caso para revisión. Los 30 minutos corresponden al módulo completo en diseño; no se registran como asistencia ni duración acreditada.</p>
    </div>
    <aside class="hero-art">
      <div class="orbit"></div>
      <img src="./assets/kuky.png" alt="Kuky, guía de DecidoBien con equipo de seguridad" width="512" height="512">
      <div class="guide-note">Miremos la tarea,<br>el acceso al peligro y los controles.</div>
    </aside>
  </section>
  <section class="intro" aria-label="Cómo aprender con el caso">
    <div><p class="eyebrow">Una secuencia, tres momentos</p><h2>Comprender antes de actuar.</h2></div>
    <article><b>01</b><h3>Estudia la situación</h3><p>Distingue lo que muestra el ejemplo de lo que falta conocer del proceso real.</p></article>
    <article><b>02</b><h3>Practica con explicación</h3><p>Reconoce la exposición y conversa sobre las condiciones que deben resolverse.</p></article>
    <article><b>03</b><h3>Revisa tu comprensión</h3><p>Responde sin pistas. El resultado de este borrador no acredita una aprobación.</p></article>
  </section>
  <section aria-labelledby="missions-title">
    <div class="section-heading"><p class="eyebrow">Ruta en preparación</p><h2 id="missions-title">Una ruta de seis misiones.</h2></div>
    <div class="mission-grid">
      <article class="mission-card available"><span class="tag">01 · Borrador disponible</span><h3>Correa transportadora</h3><p>Reconocimiento de una anomalía y límites para decidir.</p><button class="inline-link" data-start="study">Abrir caso →</button></article>
      <article class="mission-card pending"><span class="tag">02 · Pendiente</span><h3>Encartonadora</h3><p>Se conserva como material de trabajo. Falta contrastar equipo, tarea y protecciones.</p></article>
      <article class="mission-card pending"><span class="tag">03 · Pendiente</span><h3>Tableteadora</h3><p>La limpieza necesita revisión técnica antes de incorporarse a esta ruta.</p></article>
      ${[4, 5, 6].map(number => `<article class="mission-card pending"><span class="tag">0${number} · Por definir</span><h3>Una tarea real por conocer</h3><p>Se seleccionará con prevención. Todavía no existe un caso ni una evaluación.</p></article>`).join('')}
    </div>
    <p class="reserve-note">Autoclave, vidrio y químicos se conservan para otros módulos. No forman parte de esta ruta de atrapamiento.</p>
  </section>
  <p class="fine">No se solicitan datos de trabajadores en esta versión. El progreso del borrador se conserva solo en este dispositivo cuando el navegador lo permite.</p>`;
}

function roleCard() {
  return `<aside class="role-card"><h2>${escape(content.rol.titulo)}</h2><p>${escape(content.rol.descripcion)}</p>
    <ul>${content.rol.limites.map(item => `<li>${escape(item)}</li>`).join('')}</ul></aside>`;
}

function studyView() {
  return `${topNavigation()}${reviewBanner()}
    <section class="section-heading"><p class="eyebrow">Estudio · ejemplo hipotético</p><h1>${escape(content.titulo)}</h1>
    <p class="lead">${escape(content.contexto)}</p></section>
    ${roleCard()}
    <div class="lesson-grid">${content.estudio.map((lesson, index) => `<article class="lesson-card"><span class="tag">0${index + 1}</span><h2>${escape(lesson.titulo)}</h2><p>${escape(lesson.texto)}</p></article>`).join('')}</div>
    <section class="notice"><h2>Qué vamos a aprender</h2><ul>${content.objetivos.map(objective => `<li>${escape(objective)}</li>`).join('')}</ul></section>
    <div class="action-row"><button class="primary" id="study-next">Continuar a la práctica →</button><button class="back" data-go="review">Consultar pendientes técnicos</button></div>`;
}

function practiceChoices() {
  const selected = content.practica.alternativas.find(item => item.id === state.practice.selected);
  const order = state.practice.order.length ? state.practice.order : content.practica.alternativas.map(item => item.id);
  return `<section aria-labelledby="practice-question"><h2 id="practice-question">${escape(content.practica.pregunta)}</h2>
    <div class="choices">${order.map((id, index) => {
      const choice = content.practica.alternativas.find(item => item.id === id);
      return `<button class="choice ${selected && selected.id === id ? (selected.correcta ? 'correct' : 'incorrect') : ''}"
        data-practice="${escape(id)}" ${selected ? 'disabled' : ''}><b aria-hidden="true">${String.fromCharCode(65 + index)}</b><span>${escape(choice.texto)}</span></button>`;
    }).join('')}</div>
    ${selected ? `<section class="result ${selected.correcta ? 'success' : 'learn'}" tabindex="-1" id="practice-feedback">
      <h2>${selected.correcta ? 'Reconociste el límite de la información' : 'Revisemos qué permite la exposición'}</h2>
      <p>${escape(selected.feedback)}</p>
      ${!selected.correcta ? `<figure class="consequence-card">
        ${sceneMarkup(0, true, content.consecuencia.alt)}<figcaption><h3>Una consecuencia posible</h3><p>${escape(content.consecuencia.texto)}</p></figcaption>
      </figure>` : ''}
      <p class="fine">La respuesta de este ejercicio no confirma el estado del equipo real.</p>
    </section>
    <section class="reflection-list"><h2>Para conversar con el relator</h2><ul>${content.reflexiones.map(item => `<li>${escape(item)}</li>`).join('')}</ul><p class="fine">No necesitas manipular el equipo para responder. Si falta información, coméntalo con el relator.</p></section>
    <div class="action-row"><button class="primary" id="practice-next">Continuar a la evaluación →</button><button class="back" id="retry-practice">Volver a practicar</button></div>` : ''}
  </section>`;
}

function practiceView() {
  return `${topNavigation()}${reviewBanner()}
    <section class="section-heading"><p class="eyebrow">Práctica · sin puntaje ni límite de tiempo</p><h1>Reconoce la exposición.</h1>
      <p class="lead" id="scene-instruction">${escape(content.practica.instruccion)}</p>
      <p>Explora la ilustración o utiliza la lista de elementos. No se pide observar ni probar una máquina en funcionamiento.</p>
    </section>
    <div class="learning-layout">
      <div class="visual-col"><div class="scene-top"><span>Correa transportadora</span><span>Ejemplo</span></div>
        <div class="scene" role="group" aria-labelledby="scene-instruction">${sceneMarkup(0)}
          ${[...content.practica.zonas].sort((a, b) => a.rect[0] - b.rect[0]).map(zone => `<button class="zone ${state.practice.found && zone.correcta ? 'revealed' : ''}"
            data-zone="${escape(zone.id)}" aria-label="${escape(zone.descripcion)}"
            style="left:${zone.rect[0]}%;top:${zone.rect[1]}%;width:${zone.rect[2]}%;height:${zone.rect[3]}%"
            ${state.practice.found ? 'disabled' : ''}></button>`).join('')}
        </div><p class="illustration-note">Ilustración genérica. Geometría, acceso y movimiento pendientes de cotejo con el equipo real.</p>
      </div>
      <div class="decision">
        <h2>Elementos de la escena</h2>
        <div class="choices" aria-label="Alternativa textual de exploración">${content.practica.zonas.map(zone => `<button class="choice" data-zone="${escape(zone.id)}" ${state.practice.found ? 'disabled' : ''}>${escape(zone.descripcion)}</button>`).join('')}</div>
        <p class="notice" role="status" id="observation-status">${escape(observation || (state.practice.found ? content.practica.zonas.find(zone => zone.correcta).feedback : 'Busca dónde puede quedar expuesta una mano en este ejemplo. Si falta un dato del equipo real, no lo supongas.'))}</p>
        ${state.practice.found ? practiceChoices() : ''}
      </div>
    </div>`;
}

function evaluationView() {
  const index = state.evaluation.current;
  const question = content.evaluacion[index];
  const selected = state.evaluation.answers[question.id];
  const order = state.evaluation.orders[question.id] || question.alternativas.map(item => item.id);
  return `${topNavigation()}${reviewBanner()}
    <section class="evaluation-card"><p class="eyebrow">Evaluación de comprensión · borrador</p><h1>Decidir también es reconocer lo que falta.</h1>
      <p>Estas preguntas no muestran pistas ni corrección inmediata. Puedes consultar el estudio. Cada respuesta queda confirmada al seleccionarla; las explicaciones se muestran al finalizar.</p>
      <p class="question-counter">Pregunta ${index + 1} de ${content.evaluacion.length}</p>
      <div class="progress" role="progressbar" aria-label="Preguntas confirmadas" aria-valuemin="0" aria-valuemax="${content.evaluacion.length}" aria-valuenow="${Object.keys(state.evaluation.answers).length}"><i style="width:${Object.keys(state.evaluation.answers).length / content.evaluacion.length * 100}%"></i></div>
      <h2>${escape(question.pregunta)}</h2><div class="choices">${order.map((id, choiceIndex) => {
        const choice = question.alternativas.find(item => item.id === id);
        return `<button class="choice ${selected === id ? 'selected' : ''}" data-evaluation="${escape(id)}" ${selected ? 'disabled' : ''}
          aria-label="${escape(choice.texto)}"><b aria-hidden="true">${String.fromCharCode(65 + choiceIndex)}</b><span>${escape(choice.texto)}${selected === id ? ' · Respuesta confirmada' : ''}</span></button>`;
      }).join('')}</div>
      <p role="status">${selected ? 'Respuesta conservada en este dispositivo. Puedes continuar.' : 'Selecciona una alternativa para continuar.'}</p>
      <div class="action-row"><button class="primary" id="evaluation-next" ${selected ? '' : 'disabled'}>${index === content.evaluacion.length - 1 ? 'Ver resultado del borrador' : 'Siguiente pregunta'} →</button></div>
      <p class="fine">Sin criterio empresarial de aprobación: este resultado es una comprobación del borrador, no una constancia de capacitación.</p>
    </section>`;
}

function summaryView() {
  const result = evaluateAnswers(state.evaluation.answers, content.evaluacion);
  return `${topNavigation()}${reviewBanner()}
    <section class="finish"><p class="eyebrow">Primer caso · ejercicio completado en este dispositivo</p><div class="medal" aria-hidden="true">✳</div>
      <h1>Comprender el proceso.<br>Reconocer lo que falta.</h1>
      <p class="lead">${result.correct} de ${result.total} respuestas coinciden con el criterio de este borrador.</p>
      <p>Este resultado no acredita aprobación, asistencia ni autorización para intervenir. La ruta de seis misiones aún no está completa.</p>
      <div class="answer-summary">${content.evaluacion.map(question => {
        const chosen = question.alternativas.find(item => item.id === state.evaluation.answers[question.id]);
        const expected = question.alternativas.find(item => item.correcta);
        return `<details><summary>${chosen.correcta ? '✓' : '↻'} ${escape(question.pregunta)}</summary>
          <p><strong>Tu respuesta:</strong> ${escape(chosen.texto)}</p><p>${escape(chosen.feedback)}</p>
          ${!chosen.correcta ? `<p><strong>Para revisar:</strong> ${escape(expected.texto)}</p><p>${escape(expected.feedback)}</p>` : ''}</details>`;
      }).join('')}</div>
      <section class="notice"><h2>Una pregunta para llevar al trabajo</h2><p>¿Qué debe estar resuelto en este proceso para que las manos estén protegidas?</p>
        <p>Conversa sobre la tarea, el acceso y los controles con el relator y las personas responsables. No hace falta exponerse ni probar el equipo para completar este aprendizaje.</p>
      </section>
      <div class="action-row"><button class="primary" data-go="review">Revisar información pendiente</button><button class="back" id="retry-evaluation">Repetir evaluación del borrador</button><button class="back" data-go="home">Volver al inicio</button></div>
      <p class="fine">La repetición es práctica personal. No existe un historial empresarial de intentos ni se emiten constancias en esta versión.</p>
    </section>`;
}

function reviewView() {
  return `<div class="learning-top"><button class="back" data-go="home">← Inicio</button><span>Revisión del contenido · ${escape(content.version)}</span></div>
    <section class="review-panel"><p class="eyebrow">Pendiente de validación por prevención</p><h1>Lo que todavía necesitamos conocer.</h1>
      <p class="lead">Los datos siguientes no están confirmados para el equipo real. Esta pantalla no permite aprobar el caso ni liberar una tarea.</p>
      <ul class="validation-list">${content.validacion.map(item => `<li><span class="tag">Pendiente</span><h2>${escape(item.tema)}</h2><p>${escape(item.pendiente)}</p><p><strong>Quién debe aclararlo:</strong> ${escape(item.responsable)}</p></li>`).join('')}</ul>
      <section class="notice"><h2>Referencias y condición del material</h2><p>${escape(content.fuentes.nota)}</p><p>La ilustración es genérica y el relato es hipotético. No se presenta ninguna característica del equipo de la empresa como verificada.</p></section>
      <section class="notice"><h2>Funciones que siguen siendo propuestas</h2><p>Investigación de condiciones de trabajo y seguimiento de mejoras: no implementados. También están pendientes el registro empresarial, la validación del relator y las constancias verificables.</p></section>
      <div class="action-row"><button class="primary" data-start="study">Ver la secuencia de estudio →</button><button class="back" data-go="home">Volver al inicio</button></div>
    </section>`;
}

function prepareEvaluation() {
  for (const question of content.evaluacion) {
    if (!state.evaluation.orders[question.id]) {
      state.evaluation.orders[question.id] = shuffle(question.alternativas.map(item => item.id));
    }
  }
}

function bindEvents() {
  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.go === 'evaluation') prepareEvaluation();
      navigate(button.dataset.go);
    });
  });
  document.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => navigate('study')));
  document.querySelector('#begin')?.addEventListener('click', () => {
    prepareEvaluation();
    navigate(resumeView());
  });
  document.querySelector('#study-next')?.addEventListener('click', () => {
    state.studyRead = true;
    if (!state.practice.order.length) state.practice.order = shuffle(content.practica.alternativas.map(item => item.id));
    navigate('practice');
  });
  document.querySelectorAll('[data-zone]').forEach(button => button.addEventListener('click', () => {
    if (state.practice.found) return;
    const zone = content.practica.zonas.find(item => item.id === button.dataset.zone);
    state.practice.attempts += 1;
    state.practice.found = zone.correcta;
    observation = zone.feedback;
    save();
    if (zone.correcta) {
      render();
      document.querySelector('#practice-question')?.scrollIntoView({ block: 'center' });
      document.querySelector('[data-practice]')?.focus({ preventScroll: true });
    } else {
      document.querySelector('#observation-status').textContent = observation;
    }
  }));
  document.querySelector('.scene-art')?.addEventListener('click', () => {
    if (state.view === 'practice' && !state.practice.found) {
      document.querySelector('#observation-status').textContent = 'Recibimos tu toque. Explora uno de los elementos de la escena o utiliza la lista de elementos.';
    }
  });
  document.querySelectorAll('[data-practice]').forEach(button => button.addEventListener('click', () => {
    if (state.practice.selected) return;
    state.practice.selected = button.dataset.practice;
    save();
    render();
    document.querySelector('#practice-feedback').focus();
  }));
  document.querySelector('#retry-practice')?.addEventListener('click', () => {
    state.practice.selected = null;
    state.practice.order = shuffle(content.practica.alternativas.map(item => item.id));
    navigate('practice');
  });
  document.querySelector('#practice-next')?.addEventListener('click', () => {
    prepareEvaluation();
    navigate('evaluation');
  });
  document.querySelectorAll('[data-evaluation]').forEach(button => button.addEventListener('click', () => {
    const question = content.evaluacion[state.evaluation.current];
    if (state.evaluation.answers[question.id]) return;
    state.evaluation.answers[question.id] = button.dataset.evaluation;
    save();
    render();
    document.querySelector('#evaluation-next').focus();
  }));
  document.querySelector('#evaluation-next')?.addEventListener('click', () => {
    const question = content.evaluacion[state.evaluation.current];
    if (!state.evaluation.answers[question.id]) return;
    if (state.evaluation.current < content.evaluacion.length - 1) {
      state.evaluation.current += 1;
      navigate('evaluation');
    } else {
      navigate('summary');
    }
  });
  document.querySelector('#retry-evaluation')?.addEventListener('click', () => {
    state.evaluation = { answers: {}, orders: {}, current: 0 };
    prepareEvaluation();
    navigate('evaluation');
  });
}

function render() {
  const views = { home: homeView, study: studyView, practice: practiceView, evaluation: evaluationView, summary: summaryView, review: reviewView };
  app.innerHTML = `${!storageAvailable ? '<p class="notice" role="status">El navegador no permite guardar tu avance. Puedes continuar, pero se perderá al cerrar o recargar.</p>' : ''}${views[state.view]()}`;
  bindEvents();
}

function updateNetwork() {
  document.querySelector('#network').textContent = navigator.onLine ? 'Con conexión' : 'Modo sin conexión';
}

async function registerOffline() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data === 'OFFLINE_READY' && navigator.onLine) document.querySelector('#network').textContent = 'Lista sin conexión';
  });
  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('offline-timeout')), 15000))
    ]);
    (ready.active || registration.active || navigator.serviceWorker.controller)?.postMessage('CHECK_READY');
  } catch {
    document.querySelector('#network').textContent = 'Descarga offline pendiente';
  }
}

let installPrompt;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  document.querySelector('#install').hidden = false;
});
window.addEventListener('appinstalled', () => { document.querySelector('#install').hidden = true; });
document.querySelector('#install').addEventListener('click', async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  installPrompt = null;
  document.querySelector('#install').hidden = true;
});
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

try {
  const response = await fetch('./assets/correa-revision.json');
  if (!response.ok) throw new Error('content-unavailable');
  content = await response.json();
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (validState(stored, content)) state = stored;
  } catch {
    // Invalid or unavailable saved data must never prevent opening the case.
    try { localStorage.getItem(KEY); } catch { storageAvailable = false; }
  }
  render();
  registerOffline();
} catch {
  app.innerHTML = `<section class="finish"><h1>No pudimos abrir el caso.</h1><p>Si es tu primera visita, comprueba la conexión para descargar el contenido. También puedes reintentar la carga.</p><button class="primary" id="reload">Reintentar</button></section>`;
  document.querySelector('#reload').addEventListener('click', () => location.reload());
}
