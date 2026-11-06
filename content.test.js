import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { imagePath, zones } from './scenes.js';
const readJSON = file => JSON.parse(readFileSync(new URL(file, import.meta.url)));
const revision = readJSON('./assets/correa-revision.json');
const archive = readJSON('./assets/escenarios.json');

test('the review covers one hypothetical case, not six approved missions', () => {
  assert.equal(revision.estado, 'borrador_revisable');
  assert.equal(revision.duracion_modulo_minutos, 30);
  assert.deepEqual(archive.configuracion_global.casos_revisables, ['esc-01']);
  assert.equal(archive.configuracion_global.objetivo_misiones_atrapamiento, 6);
  assert.ok(archive.escenarios.every(scene => scene.aprobacion_tecnica === false));
  assert.deepEqual(archive.escenarios.slice(3).map(scene => scene.estado), Array(3).fill('reservado_otro_modulo'));
});

test('study, practice and assessment have complete content with unambiguous choices', () => {
  assert.ok(revision.rol.limites.length > 0);
  assert.ok(revision.estudio.length > 0);
  assert.ok(revision.validacion.length > 0);
  for (const item of revision.validacion) {
    assert.ok(item.tema && item.pendiente && item.responsable);
  }
  for (const activity of [revision.practica, ...revision.evaluacion]) {
    assert.equal(new Set(activity.alternativas.map(choice => choice.id)).size, activity.alternativas.length);
    assert.equal(activity.alternativas.filter(choice => choice.correcta).length, 1);
    assert.ok(activity.alternativas.every(choice => choice.texto && choice.feedback));
  }
  assert.ok(revision.practica.alternativas.find(choice => choice.correcta).texto.includes('Comunico'));
  assert.ok(revision.interaccion.aplica.alternativas.find(choice => choice.correcta).texto.startsWith('Falta información para decidir con seguridad'));
});

test('the practice targets match the retained, uncropped artwork coordinates', () => {
  assert.deepEqual(revision.practica.zonas.map(zone => zone.rect), zones[0]);
  assert.equal(revision.practica.zonas.filter(zone => zone.correcta).length, 1);
  for (const zone of revision.practica.zonas) {
    const [x, y, width, height] = zone.rect;
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= 100 && y + height <= 100);
  }
  for (let index = 0; index < 6; index++) {
    for (const consequence of [true, false]) {
      assert.ok(existsSync(new URL(`./${imagePath(index, consequence)}`, import.meta.url)));
    }
  }
});

test('unverified references are retained for review without appearing as approved support', () => {
  for (const scene of archive.escenarios) {
    assert.ok(scene.alternativas.every(choice => choice.norma === null));
    assert.ok(scene.referencias_pendientes.every(source => source.estado === 'no_verificada'));
  }
  assert.equal(revision.fuentes.estado, 'pendiente_validacion_tecnica_y_normativa');
});

test('brief practice offers a concrete action and reserves uncertainty for undefined work', () => {
  const activity = revision.interaccion;
  assert.ok(revision.practica.alternativas.find(a => a.correcta).texto.startsWith('Comunico'));
  assert.ok(activity.aplica.contexto.includes('no están definidos'));
  assert.equal(activity.aplica.alternativas.filter(a => a.correcta).length, 1);
  for (const step of ['explora','decide','descubre']) assert.ok(activity[step].split(/\s+/).length <= 15);
  for (const a of [...revision.practica.alternativas, ...activity.aplica.alternativas]) {
    assert.ok(a.texto.split(/\s+/).length <= 12);
    assert.ok(a.feedback.split(/\s+/).length <= 35);
  }
});

test('the four optional feedback sounds and existing Kuky expressions are available locally', () => {
  for (const sound of ['select','confirm','discover','complete']) {
    const wav = readFileSync(new URL(`./assets/audio/${sound}.wav`, import.meta.url));
    assert.equal(wav.toString('ascii',0,4),'RIFF');
    assert.equal(wav.toString('ascii',8,12),'WAVE');
    assert.ok(wav.length > 2000 && wav.length < 30000);
  }
  for (const mood of ['atento','motivador','feliz']) {
    assert.ok(existsSync(new URL(`./assets/kuky/${mood}.png`,import.meta.url)));
  }
});
