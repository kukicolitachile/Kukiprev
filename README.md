# DecidoBien — Manos que cuidan

**2.7.0-review.1**, rama `implementation/correa-phaser-demo`. Entrega correctiva A1–A5 autorizada tras la auditoría de nueve especialidades, desde `0def89f`. Una misión de correa, identidad y Kuky originales, inspección/historieta, evaluación independiente y recorrido offline. **Borrador pendiente de validación preventiva y piloto humano; sin emisión empresarial.**

[Entrega, matriz de correcciones y evidencia](docs/ENTREGA_CORRECTIVA_2_7.md). Los documentos 2.6 y anteriores son historial de sus respectivas versiones.

## Abrir

```sh
npm start
```

Servidor de revisión en 4173. Requiere Python 3; npm permite usar el comando. Phaser 3.90.0 y pdf-lib 1.17.1 se distribuyen localmente con sus licencias. No hay CDN ni descargas npm necesarias para jugar. `npm ci` permite reconstruir/verificar dependencias de desarrollo.

La coordinación de pestañas requiere almacenamiento local y Web Locks en un contexto seguro (HTTPS o localhost). Si faltan, la app no permite guardar de forma insegura: muestra un estado de recuperación. No equivale a una prueba en Safari o dispositivos físicos.

## Recorrido

**Inicio → Nombre y apellido → Contexto/Observa → Explora → Decide → Descubre → Aplica → Evaluación → Resultado.**

Comenzar misión sigue siendo la acción principal. El progreso indica paso actual y siguiente. Retomar anuncia el destino; finalizar, repetir evaluación o empezar para otra persona son acciones distintas. No hay avance por tiempo ni animación. Los 30 minutos son el alcance de una sesión guiada, no una duración acreditada por terminar el juego.

Explora entra con la ilustración completa, sin candidatos marcados; pista textual a petición, visor después del hallazgo. Decide permite seleccionar Comunicar/Retirar/Ajustar y confirmar. Descubre mantiene la escena con focos tocables y explicación breve; «¿Por qué?» conserva devolución y detalle íntegros. Aplica prepara una consulta sin enviarla ni cambiar el equipo. Evaluación mantiene tres preguntas sin pistas o señales de acierto antes del cierre. Completar no significa aprobar.

La maquinaria sigue siendo conceptual, sin movimientos mecánicos inventados. Solo se animan encuadres y controles. El objetivo de seis misiones no se completa con situaciones ficticias adicionales.

## Guardado y tablets compartidas

`attempt-store.js` mantiene una autoridad versionada independiente del antiguo `decidobien-review-v1`. Migra el avance previo una sola vez, conserva la copia original hasta cierre explícito y no acepta posteriores escrituras de un bundle antiguo. Guardados, reclamación de edición, cierre y nuevo intento se serializan bajo Web Locks; comprueban generación, revisión y dueño.

Solo una pestaña puede editar un intento. La segunda debe elegir expresamente continuar aquí o empezar para otra persona; la anterior queda protegida. Un guardado obsoleto no puede degradar avance ni restaurar un intento cerrado. Las versiones antiguas abiertas no contienen este control: no podemos borrar su interfaz o su memoria, pero sus escrituras legacy no vuelven a ser autoridad. Deben actualizarse/cerrarse antes de entregar el dispositivo a otra persona.

Nombre/apellido y token de correlación se mantienen en `sessionStorage`; el nombre no se incorpora al estado de `localStorage`, URLs o solicitudes empresariales. El token no autentica identidad. El nombre en edición permanece en memoria al cambiar ajustes. En esta revisión se indican datos ficticios. El progreso local sigue siendo manipulable y no es evidencia empresarial confiable.

Cerrar deja una marca durable de intento cerrado e invalida otras copias de esta versión. Elimina identificación de la pestaña y copias legacy de ese ejercicio; conserva claves ajenas. No es un cierre empresarial ni borrado forense. **Los PDF descargados permanecen en Descargas.**

## Certificado y privacidad

`certificate-policy.json` conserva criterio pendiente de Julisa, `contentApproved:false` y `endpoint:null`. No existe registro, folio verificable, cola de sincronización ni autenticación empresarial. No se generan folios locales.

Hay una vista previa PDF con nombre, módulo, fecha y marca de borrador sin emisión empresarial. Offline, la app informa que no sincroniza registros ni emite certificados. El PDF actual es una imagen; el resultado HTML es su equivalente textual, sin declaración de PDF etiquetado accesible.

Antes de usar datos reales, la empresa debe definir finalidad, responsable/contacto, base aplicable, acceso, conservación y uso de resultados. No se añade consentimiento genérico, RUT ni otros identificadores. La revisión del marco chileno y la validación preventiva son pendientes separados de la corrección de software.

## Audio, accesibilidad y offline

Audio local apagado por defecto, activación explícita y silencio disponible. Movimiento reducido/pausa dejan estados estáticos. Alternativa por lista, estados equivalentes, descripción neutral, diálogos nombrados, error de identificación visible y foco contrastado. Las comprobaciones automatizadas no sustituyen un lector real.

Primera descarga con conexión: esperar «Lista sin conexión». Después se puede completar y recuperar el recorrido offline. Se distingue la red bloqueada de la señal `navigator.onLine`. No se promete sincronización futura de una operación que no existe.

## Actualizar Codespaces conservando cambios

El Codespace del usuario y este entorno son instancias distintas. Publicar la rama no actualiza automáticamente su instancia. En una terminal nueva del Codespace:

```sh
cd /workspaces/Kukiprev
git fetch origin refs/heads/implementation/correa-phaser-demo:refs/remotes/origin/implementation/correa-phaser-demo
git show origin/implementation/correa-phaser-demo:scripts/update-codespace.sh > /tmp/decidobien-update.sh
bash /tmp/decidobien-update.sh
```

El actualizador verifica candidato, requisitos, divergencias y colisiones antes de parar un servicio reconocido. Conserva commits locales de main, cambios registrados/sin seguimiento en stash sin reaplicarlo, archivos ignorados y procesos desconocidos. Si falla después de parar, intenta recuperar el HEAD y comando anterior e informa el estado real; las ediciones locales siguen en stash, no se afirma haber restaurado ese árbol modificado exacto.

Abrir la misma dirección reenviada/perfil con `/recovery.html` y pulsar «Actualizar recursos conservando el avance». No borrar datos del sitio. La migración con avance exige una elección explícita de reanudar, seguida de identificación cuando corresponda. Consultar Ajustes o Revisión técnica → Comprobar versión, servidor y caché: cliente/servidor se distinguen, release `2.7.0-review.1`, rama actual, commit y caché `decidobien-v17-corrective`. La huella allí leída es del servidor, no una medición del bundle cliente.

## Verificar

```sh
npm test
python3 tests/acceptance-corrections.py
python3 tests/flow-browser.py
python3 tests/browser-review.py
python3 tests/explore-browser.py
python3 tests/motion-browser.py
python3 tests/security-browser.py
python3 tests/server-security.py
python3 tests/update-codespace.py
```

Pruebas de navegador: Playwright y Chromium, servidor canónico activo. `tests/migration-proxy.py` y `tests/migration-browser.py` son fixtures históricos de prueba, nunca un servidor alternativo para usar la aplicación.

Pendientes de uso real: equipo/roles/mapa y contenido validados por prevención, guion y piloto de sesión guiada, dispositivos físicos y lector real, datos institucionales, Codespace concreto y futura infraestructura empresarial. La demo no declara acreditación ni cumplimiento normativo integral.
